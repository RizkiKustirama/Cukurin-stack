import { rawPrisma } from "@/shared/db";
import type {
  BarberWorkStatus,
  QueueStrategy,
  BarberReadyResult,
  ServiceCompletedResult,
  ActiveQueueData,
  BarberStation,
  QueueItemTicket,
} from "../types";

/**
 * Pure matching algorithm for queue ticket selection.
 *
 * In LOYALTY_PRIORITY:
 * 1. Checks for waiting tickets explicitly requesting `barberId`, sorted by `createdAt ASC`.
 * 2. If none, checks for waiting tickets with no barber requested (`requestedBarberId == null`), sorted by `createdAt ASC`.
 * 3. Tickets requesting a different barber are bypassed to preserve customer loyalty.
 *
 * In STRICT_FIFO:
 * Always picks the earliest waiting ticket by `createdAt ASC`, regardless of requested barber.
 */
export function selectNextTicket<
  T extends {
    id: string;
    requestedBarberId?: string | null;
    createdAt: Date | string;
  }
>(
  waitingTickets: T[],
  barberId: string,
  strategy: QueueStrategy = "LOYALTY_PRIORITY"
): T | null {
  if (!waitingTickets || waitingTickets.length === 0) {
    return null;
  }

  // Ensure tickets are strictly sorted by createdAt ASC
  const sorted = [...waitingTickets].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  if (strategy === "STRICT_FIFO") {
    return sorted[0] ?? null;
  }

  // Mode: LOYALTY_PRIORITY
  // 1. Check for ticket explicitly requesting this barber
  const requestedTicket = sorted.find((t) => t.requestedBarberId === barberId);
  if (requestedTicket) {
    return requestedTicket;
  }

  // 2. Fallback: ticket with no barber preference (bebas)
  const freeTicket = sorted.find((t) => !t.requestedBarberId);
  if (freeTicket) {
    return freeTicket;
  }

  // If all remaining tickets requested other barbers, do not steal them
  return null;
}

/**
 * Pure function to calculate service commission for a barber.
 * Sums subtotal of items where itemType === 'SERVICE' multiplied by commissionPct.
 * Falls back to ticket subtotal if no specific items are present.
 */
export function calculateServiceCommission(
  items: Array<{ itemType: string; subtotal: unknown; price?: unknown; quantity?: number }>,
  commissionPct: unknown,
  fallbackSubtotal: unknown = 0
): number {
  const pct = Number(commissionPct) || 0;
  let serviceSubtotal = 0;

  const serviceItems = (items || []).filter((item) => item.itemType === "SERVICE");
  if (serviceItems.length > 0) {
    serviceSubtotal = serviceItems.reduce((acc, item) => {
      const sub = Number(item.subtotal);
      if (!isNaN(sub) && sub > 0) return acc + sub;
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      return acc + price * qty;
    }, 0);
  } else {
    serviceSubtotal = Number(fallbackSubtotal) || 0;
  }

  const commission = (serviceSubtotal * pct) / 100;
  return Math.round(commission * 100) / 100;
}

/**
 * Triggered when a barber becomes READY or finishes a service.
 * Determines the next customer according to store queue strategy and assigns them.
 * If barberId is omitted, auto-dispatches the earliest waiting ticket to any available READY barber in the store.
 */
export async function onBarberReady(
  storeId: string,
  barberId?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prismaClient: any = rawPrisma
): Promise<BarberReadyResult> {
  // If no specific barberId provided, find the available READY barbers in the store
  if (!barberId) {
    const readyBarbers = await prismaClient.barberProfile.findMany({
      where: { storeId, workStatus: "READY" },
      orderBy: { lastReadyAt: "asc" },
    });
    for (const barber of readyBarbers) {
      const res = await onBarberReady(storeId, barber.id, prismaClient);
      if (res.assigned) {
        return res;
      }
    }
    return { assigned: false, ticket: null };
  }

  // 1. Get store queue strategy
  const store = await prismaClient.store.findUnique({
    where: { id: storeId },
    select: { queueStrategy: true },
  });
  const strategy: QueueStrategy = store?.queueStrategy ?? "LOYALTY_PRIORITY";

  // Find barber profile (support query by profile id or user id)
  let barber = await prismaClient.barberProfile.findUnique({
    where: { id: barberId },
  });
  if (!barber) {
    barber = await prismaClient.barberProfile.findFirst({
      where: { userId: barberId, storeId },
    });
  }

  if (!barber) {
    throw new Error(`Barber dengan ID "${barberId}" tidak ditemukan.`);
  }

  // 2 & 3. Query candidate ticket based on strategy
  let targetTicket: QueueItemTicket | null = null;

  if (strategy === "STRICT_FIFO") {
    targetTicket = await prismaClient.ticket.findFirst({
      where: {
        storeId,
        serviceStatus: "WAITING",
      },
      orderBy: { createdAt: "asc" },
      include: {
        customer: true,
        items: true,
        requestedBarber: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
        },
      },
    });
  } else {
    // LOYALTY_PRIORITY:
    // a. Check if any waiting ticket requested this specific barber
    targetTicket = await prismaClient.ticket.findFirst({
      where: {
        storeId,
        serviceStatus: "WAITING",
        requestedBarberId: barber.id,
      },
      orderBy: { createdAt: "asc" },
      include: {
        customer: true,
        items: true,
        requestedBarber: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
        },
      },
    });

    // b. Fallback to free customer (requestedBarberId === null)
    if (!targetTicket) {
      targetTicket = await prismaClient.ticket.findFirst({
        where: {
          storeId,
          serviceStatus: "WAITING",
          requestedBarberId: null,
        },
        orderBy: { createdAt: "asc" },
        include: {
          customer: true,
          items: true,
          requestedBarber: {
            include: {
              user: { select: { id: true, name: true, phone: true } },
            },
          },
        },
      });
    }
  }

  // 4. If target ticket found -> Assign & set Barber BUSY
  if (targetTicket) {
    const updatedTicket = await prismaClient.ticket.update({
      where: { id: targetTicket.id },
      data: {
        assignedBarberId: barber.id,
        serviceStatus: "IN_SERVICE",
      },
      include: {
        customer: true,
        items: true,
        assignedBarber: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
        },
        requestedBarber: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
        },
      },
    });

    await prismaClient.barberProfile.update({
      where: { id: barber.id },
      data: {
        workStatus: "BUSY",
      },
    });

    return {
      assigned: true,
      ticket: updatedTicket,
    };
  }

  // 5. If no waiting ticket -> Set Barber READY
  await prismaClient.barberProfile.update({
    where: { id: barber.id },
    data: {
      workStatus: "READY",
      lastReadyAt: new Date(),
    },
  });

  return {
    assigned: false,
    ticket: null,
  };
}

/**
 * Triggered when a haircut service is finished.
 * Updates ticket status, records commission in the ledger, and transitions barber work status.
 */
export async function onServiceCompleted(
  storeId: string,
  ticketId: string,
  barberId: string,
  nextStatus: BarberWorkStatus,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prismaClient: any = rawPrisma
): Promise<ServiceCompletedResult> {
  // 1. Fetch ticket and barber
  const ticket = await prismaClient.ticket.findUnique({
    where: { id: ticketId },
    include: {
      items: true,
      commissionLedgers: true,
      customer: true,
    },
  });

  if (!ticket) {
    throw new Error(`Tiket dengan ID "${ticketId}" tidak ditemukan.`);
  }

  let barber = await prismaClient.barberProfile.findUnique({
    where: { id: barberId },
  });
  if (!barber) {
    barber = await prismaClient.barberProfile.findFirst({
      where: { userId: barberId, storeId },
    });
  }

  if (!barber) {
    throw new Error(`Barber dengan ID "${barberId}" tidak ditemukan.`);
  }

  // 2. Update Ticket to COMPLETED. If already PAID, set closedAt.
  const isPaid = ticket.paymentStatus === "PAID";
  const updatedTicket = await prismaClient.ticket.update({
    where: { id: ticketId },
    data: {
      serviceStatus: "COMPLETED",
      ...(isPaid ? { closedAt: new Date() } : {}),
    },
    include: {
      customer: true,
      items: true,
      assignedBarber: {
        include: {
          user: { select: { id: true, name: true, phone: true } },
        },
      },
    },
  });

  // 3. Calculate service commission and record into CommissionLedger
  const commissionAmount = calculateServiceCommission(
    ticket.items || [],
    barber.serviceCommissionPct,
    ticket.subtotal
  );

  let commissionRecorded = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingLedger = ticket.commissionLedgers?.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (l: any) => l.barberId === barber.id && l.sourceType === "SERVICE_FEE"
  );

  if (!existingLedger && commissionAmount > 0) {
    const openRegister = await prismaClient.dailyRegister?.findFirst?.({
      where: { storeId, status: "OPEN" },
      orderBy: { openedAt: "desc" },
    });

    await prismaClient.commissionLedger.create({
      data: {
        barberId: barber.id,
        ticketId: ticket.id,
        dailyRegisterId: openRegister?.id ?? null,
        sourceType: "SERVICE_FEE",
        amount: commissionAmount,
        isPaidOut: false,
      },
    });
    commissionRecorded = true;
  }

  // 4. Transition barber status
  if (nextStatus === "READY") {
    // Auto-assign next customer if one is waiting
    await onBarberReady(storeId, barber.id, prismaClient);
  } else if (nextStatus === "BREAK") {
    await prismaClient.barberProfile.update({
      where: { id: barber.id },
      data: { workStatus: "BREAK" },
    });
  } else if (nextStatus === "OFFLINE") {
    await prismaClient.barberProfile.update({
      where: { id: barber.id },
      data: { workStatus: "OFFLINE" },
    });
  }

  return {
    success: true,
    ticket: updatedTicket,
    nextStatus,
    commissionRecorded,
  };
}

/**
 * Fetch the active queue overview for a store:
 * - inServiceTickets: currently in haircut chairs
 * - waitingTickets: sorted WAITING tickets
 * - readyBarbers: currently available barbers
 * - stations: mapped chairs/stations for each barber in store
 */
export async function getActiveQueue(
  storeId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prismaClient: any = rawPrisma
): Promise<ActiveQueueData> {
  const [inServiceTickets, waitingTickets, allBarbers] = await Promise.all([
    prismaClient.ticket.findMany({
      where: {
        storeId,
        serviceStatus: "IN_SERVICE",
      },
      orderBy: { createdAt: "asc" },
      include: {
        customer: true,
        items: true,
        assignedBarber: {
          include: {
            user: { select: { id: true, name: true, phone: true, role: true, isActive: true } },
          },
        },
        requestedBarber: {
          include: {
            user: { select: { id: true, name: true, phone: true, role: true, isActive: true } },
          },
        },
      },
    }),
    prismaClient.ticket.findMany({
      where: {
        storeId,
        serviceStatus: "WAITING",
      },
      orderBy: { createdAt: "asc" },
      include: {
        customer: true,
        items: true,
        requestedBarber: {
          include: {
            user: { select: { id: true, name: true, phone: true, role: true, isActive: true } },
          },
        },
        assignedBarber: {
          include: {
            user: { select: { id: true, name: true, phone: true, role: true, isActive: true } },
          },
        },
      },
    }),
    prismaClient.barberProfile.findMany({
      where: { storeId },
      include: {
        user: { select: { id: true, name: true, phone: true, role: true, isActive: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const readyBarbers = allBarbers.filter((b: any) => b.workStatus === "READY");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stations: BarberStation[] = allBarbers.map((barber: any, index: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeTicket = inServiceTickets.find((t: any) => t.assignedBarberId === barber.id);
    return {
      barber: {
        ...barber,
        name: barber.user?.name ?? `Barber ${index + 1}`,
        phone: barber.user?.phone,
      },
      chairNumber: index + 1,
      workStatus: barber.workStatus,
      currentTicket: activeTicket ?? null,
      startedAt: activeTicket?.createdAt ?? null,
    };
  });

  return {
    inServiceTickets,
    waitingTickets,
    readyBarbers,
    stations,
  };
}

export const queueEngine = {
  selectNextTicket,
  calculateServiceCommission,
  onBarberReady,
  onServiceCompleted,
  getActiveQueue,
};
