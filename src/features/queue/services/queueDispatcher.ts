import { rawPrisma } from "@/shared/db";
import type { QueueStrategy, Ticket } from "@prisma/client";

export interface QueueDispatchResult {
  assigned: boolean;
  ticket?: Ticket;
  barberId?: string;
}

/**
 * Logika Penempatan Antrean (Queue Dispatcher)
 * Sesuai docs/ARCHITECTURE.md Bagian 5:
 * IF store.queue_strategy == 'STRICT_FIFO':
 *     TargetTicket = Ambil tiket WAITING terlama berdasarkan created_at ASC
 * ELSE: // Mode Loyalitas / Prioritas Request (Default)
 *     TargetTicket = Ambil tiket WAITING yang me-REQUEST barberId terlama
 *     IF TargetTicket IS NULL:
 *         TargetTicket = Ambil tiket WAITING dengan requested_barber == NULL terlama
 */
export async function onBarberReady(
  storeId: string,
  specificBarberId?: string
): Promise<QueueDispatchResult | null> {
  const store = await rawPrisma.store.findUnique({
    where: { id: storeId },
    select: { queueStrategy: true },
  });

  const strategy: QueueStrategy = store?.queueStrategy ?? "LOYALTY_PRIORITY";

  // Jika spesifik barber tertentu
  if (specificBarberId) {
    const barber = await rawPrisma.barberProfile.findUnique({
      where: { id: specificBarberId },
    });

    if (!barber || barber.storeId !== storeId || barber.workStatus === "OFFLINE") {
      return null;
    }

    let targetTicket: Ticket | null = null;

    if (strategy === "STRICT_FIFO") {
      targetTicket = await rawPrisma.ticket.findFirst({
        where: {
          storeId,
          orderType: "SERVICE",
          serviceStatus: "WAITING",
        },
        orderBy: { createdAt: "asc" },
      });
    } else {
      // LOYALTY_PRIORITY
      // 1. Tiket yang secara eksplisit me-request barber ini
      targetTicket = await rawPrisma.ticket.findFirst({
        where: {
          storeId,
          orderType: "SERVICE",
          serviceStatus: "WAITING",
          requestedBarberId: specificBarberId,
        },
        orderBy: { createdAt: "asc" },
      });

      // 2. Jika tidak ada, ambil tiket antrean bebas (Siapa Saja)
      if (!targetTicket) {
        targetTicket = await rawPrisma.ticket.findFirst({
          where: {
            storeId,
            orderType: "SERVICE",
            serviceStatus: "WAITING",
            requestedBarberId: null,
          },
          orderBy: { createdAt: "asc" },
        });
      }
    }

    if (targetTicket) {
      const [updatedTicket] = await rawPrisma.$transaction([
        rawPrisma.ticket.update({
          where: { id: targetTicket.id },
          data: {
            assignedBarberId: specificBarberId,
            serviceStatus: "IN_SERVICE",
          },
        }),
        rawPrisma.barberProfile.update({
          where: { id: specificBarberId },
          data: {
            workStatus: "BUSY",
          },
        }),
      ]);

      return { assigned: true, ticket: updatedTicket, barberId: specificBarberId };
    } else {
      // Tidak ada tiket antrean yang cocok, pastikan status barber READY
      await rawPrisma.barberProfile.update({
        where: { id: specificBarberId },
        data: {
          workStatus: "READY",
          lastReadyAt: barber.lastReadyAt || new Date(),
        },
      });

      return { assigned: false, barberId: specificBarberId };
    }
  }

  // Jika dipanggil secara umum untuk toko (misal ada tiket baru WAITING masuk)
  const readyBarbers = await rawPrisma.barberProfile.findMany({
    where: {
      storeId,
      workStatus: "READY",
    },
    orderBy: { lastReadyAt: "asc" },
  });

  for (const barber of readyBarbers) {
    const result: QueueDispatchResult | null = await onBarberReady(storeId, barber.id);
    if (result?.assigned) {
      return result;
    }
  }

  return { assigned: false };
}
