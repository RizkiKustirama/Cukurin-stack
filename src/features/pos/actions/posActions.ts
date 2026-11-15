"use server";

import { revalidatePath } from "next/cache";
import { rawPrisma } from "@/shared/db";
import { getSession } from "@/shared/auth";
import {
  ServiceStatus,
  PaymentStatus,
  BarberWorkStatus,
  OrderType,
  PaymentMethod,
} from "@prisma/client";
import type { TicketFormSubmitData } from "../types";

/**
 * Server Action: Create new Ticket (Cashier transaction or queue entry)
 */
export async function createPosFastTicketAction(
  storeSlug: string,
  data: TicketFormSubmitData
) {
  const session = await getSession();
  const store = await rawPrisma.store.findFirst({
    where: {
      tenant: { slug: storeSlug },
    },
    include: {
      tenant: true,
      dailyRegisters: {
        where: { status: "OPEN" },
        orderBy: { openedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!store) {
    throw new Error("Toko cabang tidak ditemukan.");
  }

  // 1. Customer resolution (Find or create)
  let customerId: string | undefined = undefined;
  if (data.customerName) {
    const existingCustomer = data.customerPhone
      ? await rawPrisma.customer.findFirst({
          where: {
            tenantId: store.tenantId,
            phone: data.customerPhone,
          },
        })
      : null;

    if (existingCustomer) {
      customerId = existingCustomer.id;
      await rawPrisma.customer.update({
        where: { id: existingCustomer.id },
        data: {
          visitCount: { increment: 1 },
          lastVisitAt: new Date(),
        },
      });
    } else {
      const newCustomer = await rawPrisma.customer.create({
        data: {
          tenantId: store.tenantId,
          name: data.customerName,
          phone: data.customerPhone || "00000000000",
          visitCount: 1,
          lastVisitAt: new Date(),
        },
      });
      customerId = newCustomer.id;
    }
  }

  // 2. Ticket Number generator for the day
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const countToday = await rawPrisma.ticket.count({
    where: {
      storeId: store.id,
      createdAt: { gte: todayStart },
    },
  });
  const prefix = data.orderType === "SERVICE" ? "A" : "R";
  const ticketNumber = `${prefix}-${String(countToday + 1).padStart(2, "0")}`;

  // 3. Barber assignment logic
  let assignedBarberId: string | null = null;
  let serviceStatus: ServiceStatus = ServiceStatus.WAITING;

  if (data.orderType === "SERVICE") {
    if (data.requestedBarberId) {
      // Check if requested barber is READY
      const requested = await rawPrisma.barberProfile.findUnique({
        where: { id: data.requestedBarberId },
      });
      if (requested && requested.workStatus === BarberWorkStatus.READY) {
        assignedBarberId = requested.id;
        serviceStatus = ServiceStatus.IN_SERVICE;
      }
    } else {
      // Find any ready barber
      const readyBarber = await rawPrisma.barberProfile.findFirst({
        where: {
          storeId: store.id,
          workStatus: BarberWorkStatus.READY,
        },
        orderBy: { lastReadyAt: "asc" },
      });
      if (readyBarber) {
        assignedBarberId = readyBarber.id;
        serviceStatus = ServiceStatus.IN_SERVICE;
      }
    }
  } else {
    // Retail only order is immediately completed
    serviceStatus = ServiceStatus.COMPLETED;
  }

  // 4. Fallback cashier ID
  let cashierId = session?.userId;
  if (!cashierId) {
    const firstUser = await rawPrisma.user.findFirst({
      where: { storeId: store.id },
    });
    cashierId = firstUser?.id || store.tenantId;
  }

  // 5. Create Ticket & Ticket Items transaction
  const ticket = await rawPrisma.ticket.create({
    data: {
      ticketNumber,
      storeId: store.id,
      customerId,
      orderType: data.orderType === "SERVICE" ? OrderType.SERVICE : OrderType.RETAIL_ONLY,
      requestedBarberId: data.requestedBarberId || null,
      assignedBarberId,
      serviceStatus,
      paymentStatus: data.isPaidImmediately ? PaymentStatus.PAID : PaymentStatus.UNPAID,
      subtotal: data.totalAmount,
      totalAmount: data.totalAmount,
      cashierId,
      items: {
        create: data.items.map((it: any) => ({
          itemType: it.itemType,
          serviceId: it.serviceId || null,
          productId: it.productId || null,
          itemName: it.name,
          price: it.price,
          quantity: it.quantity,
          subtotal: it.price * it.quantity,
        })),
      },
    },
  });

  // 6. If paid immediately, create TicketPayment
  if (data.isPaidImmediately && data.paymentMethod) {
    let register = store.dailyRegisters[0];
    if (!register) {
      // Auto-open daily register if not already open
      register = await rawPrisma.dailyRegister.create({
        data: {
          storeId: store.id,
          cashierId,
          openingCash: 0,
          status: "OPEN",
        },
      });
    }

    await rawPrisma.ticketPayment.create({
      data: {
        ticketId: ticket.id,
        dailyRegisterId: register.id,
        paymentMethod: data.paymentMethod as PaymentMethod,
        amount: data.totalAmount,
      },
    });
  }

  // 7. Update assigned barber to BUSY
  if (assignedBarberId) {
    await rawPrisma.barberProfile.update({
      where: { id: assignedBarberId },
      data: { workStatus: BarberWorkStatus.BUSY },
    });
  }

  revalidatePath(`/${storeSlug}/pos`);
  revalidatePath(`/${storeSlug}/queue`);

  return { success: true, ticketNumber: ticket.ticketNumber, ticketId: ticket.id };
}

/**
 * Server Action: Settle Payment for an UNPAID ticket
 */
export async function settleTicketPaymentAction(
  storeSlug: string,
  params: {
    ticketId: string;
    method: "CASH" | "QRIS" | "TRANSFER" | "EDC";
    receivedAmount: number;
    tipAmount: number;
  }
) {
  const session = await getSession();
  const ticket = await rawPrisma.ticket.findUnique({
    where: { id: params.ticketId },
    include: {
      store: {
        include: {
          dailyRegisters: {
            where: { status: "OPEN" },
            orderBy: { openedAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!ticket) {
    throw new Error("Tiket tidak ditemukan.");
  }

  let register = ticket.store.dailyRegisters[0];
  if (!register) {
    let cashierId = session?.userId || ticket.cashierId;
    register = await rawPrisma.dailyRegister.create({
      data: {
        storeId: ticket.storeId,
        cashierId,
        openingCash: 0,
        status: "OPEN",
      },
    });
  }

  const finalTotal = Number(ticket.subtotal) + params.tipAmount;

  await rawPrisma.$transaction([
    rawPrisma.ticket.update({
      where: { id: ticket.id },
      data: {
        paymentStatus: PaymentStatus.PAID,
        tipAmount: params.tipAmount,
        totalAmount: finalTotal,
      },
    }),
    rawPrisma.ticketPayment.create({
      data: {
        ticketId: ticket.id,
        dailyRegisterId: register.id,
        paymentMethod: params.method as PaymentMethod,
        amount: finalTotal,
      },
    }),
  ]);

  revalidatePath(`/${storeSlug}/pos`);
  revalidatePath(`/${storeSlug}/queue`);

  return { success: true };
}

/**
 * Server Action: Change Barber Work Status (READY, BREAK, OFFLINE)
 */
export async function changeBarberStatusAction(
  storeSlug: string,
  barberProfileId: string,
  newStatus: BarberWorkStatus
) {
  await rawPrisma.barberProfile.update({
    where: { id: barberProfileId },
    data: {
      workStatus: newStatus,
      lastReadyAt: newStatus === BarberWorkStatus.READY ? new Date() : undefined,
    },
  });

  revalidatePath(`/${storeSlug}/pos`);
  revalidatePath(`/${storeSlug}/queue`);

  return { success: true };
}

/**
 * Server Action: Complete haircut in progress
 */
export async function completeHaircutAction(
  storeSlug: string,
  ticketId: string,
  barberProfileId: string
) {
  await rawPrisma.$transaction([
    rawPrisma.ticket.update({
      where: { id: ticketId },
      data: {
        serviceStatus: ServiceStatus.COMPLETED,
        closedAt: new Date(),
      },
    }),
    rawPrisma.barberProfile.update({
      where: { id: barberProfileId },
      data: {
        workStatus: BarberWorkStatus.READY,
        lastReadyAt: new Date(),
      },
    }),
  ]);

  revalidatePath(`/${storeSlug}/pos`);
  revalidatePath(`/${storeSlug}/queue`);

  return { success: true };
}

/**
 * Server Action: Call waiting customer to available barber chair
 */
export async function callNextToChairAction(
  storeSlug: string,
  barberProfileId: string,
  ticketId?: string
) {
  const store = await rawPrisma.store.findFirst({
    where: { tenant: { slug: storeSlug } },
  });

  if (!store) throw new Error("Toko tidak ditemukan.");

  let targetTicketId = ticketId;

  if (!targetTicketId) {
    // Find next ticket in waiting queue
    const nextTicket = await rawPrisma.ticket.findFirst({
      where: {
        storeId: store.id,
        serviceStatus: ServiceStatus.WAITING,
      },
      orderBy: { createdAt: "asc" },
    });

    if (!nextTicket) {
      throw new Error("Tidak ada antrean yang sedang menunggu.");
    }
    targetTicketId = nextTicket.id;
  }

  await rawPrisma.$transaction([
    rawPrisma.ticket.update({
      where: { id: targetTicketId },
      data: {
        assignedBarberId: barberProfileId,
        serviceStatus: ServiceStatus.IN_SERVICE,
      },
    }),
    rawPrisma.barberProfile.update({
      where: { id: barberProfileId },
      data: {
        workStatus: BarberWorkStatus.BUSY,
      },
    }),
  ]);

  revalidatePath(`/${storeSlug}/pos`);
  revalidatePath(`/${storeSlug}/queue`);

  return { success: true };
}
