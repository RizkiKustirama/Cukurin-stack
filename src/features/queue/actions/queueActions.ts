"use server";

import { revalidatePath } from "next/cache";
import { rawPrisma } from "@/shared/db";
import { requireAuth } from "@/shared/auth";
import type { ActionResult } from "@/shared/types/action";
import type { BarberWorkStatus, QueueItemTicket, ServiceCompletedResult } from "../types";
import { onBarberReady, onServiceCompleted } from "../services/queueEngine";

export interface SetBarberStatusResult {
  barberId: string;
  workStatus: BarberWorkStatus;
  assignedTicket?: QueueItemTicket | null;
}

export interface AssignTicketManualResult {
  ticket: QueueItemTicket;
  barberId: string;
}

/**
 * Server Action: Change barber work status manually (READY, BREAK, OFFLINE, BUSY).
 * When status is set to READY, it automatically invokes onBarberReady to plot the next customer.
 */
export async function setBarberStatusAction(
  barberId: string,
  status: BarberWorkStatus
): Promise<ActionResult<SetBarberStatusResult>> {
  try {
    const session = await requireAuth(["OWNER", "MANAGER", "CASHIER", "BARBER"]);

    // Find barber profile
    let barber = await rawPrisma.barberProfile.findUnique({
      where: { id: barberId },
      include: { user: true },
    });

    if (!barber) {
      barber = await rawPrisma.barberProfile.findFirst({
        where: { userId: barberId },
        include: { user: true },
      });
    }

    if (!barber) {
      return {
        success: false,
        error: `Barber dengan ID "${barberId}" tidak ditemukan.`,
      };
    }

    // Role check: Barber can only toggle their own status
    if (session.role === "BARBER" && barber.userId !== session.userId) {
      return {
        success: false,
        error: "Anda hanya memiliki akses untuk mengubah status kerja profil Anda sendiri.",
      };
    }

    let assignedTicket: QueueItemTicket | null = null;
    let finalStatus: BarberWorkStatus = status;

    if (status === "READY") {
      const readyResult = await onBarberReady(barber.storeId, barber.id, rawPrisma);
      assignedTicket = (readyResult.ticket as QueueItemTicket) ?? null;
      finalStatus = readyResult.assigned ? "BUSY" : "READY";
    } else {
      await rawPrisma.barberProfile.update({
        where: { id: barber.id },
        data: {
          workStatus: status,
        },
      });
      finalStatus = status;
    }

    if (session.storeSlug) {
      revalidatePath(`/${session.storeSlug}/queue`);
      revalidatePath(`/${session.storeSlug}/pos`);
      revalidatePath(`/${session.storeSlug}/barber`);
    }

    return {
      success: true,
      data: {
        barberId: barber.id,
        workStatus: finalStatus,
        assignedTicket,
      },
    };
  } catch (err: unknown) {
    console.error("Error in setBarberStatusAction:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memperbarui status barber.",
    };
  }
}

/**
 * Server Action: Complete haircut service on a ticket.
 * Triggered by cashier or barber upon finishing haircut.
 * Updates ticket to COMPLETED, records commission, and transitions barber to READY or BREAK.
 */
export async function completeServiceAction(
  ticketId: string,
  barberId: string,
  nextStatus: "READY" | "BREAK"
): Promise<ActionResult<ServiceCompletedResult>> {
  try {
    const session = await requireAuth(["OWNER", "MANAGER", "CASHIER", "BARBER"]);

    const ticket = await rawPrisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return {
        success: false,
        error: `Tiket dengan ID "${ticketId}" tidak ditemukan.`,
      };
    }

    const result = await onServiceCompleted(
      ticket.storeId,
      ticketId,
      barberId,
      nextStatus,
      rawPrisma
    );

    if (session.storeSlug) {
      revalidatePath(`/${session.storeSlug}/queue`);
      revalidatePath(`/${session.storeSlug}/pos`);
      revalidatePath(`/${session.storeSlug}/barber`);
    }

    return {
      success: true,
      data: result,
    };
  } catch (err: unknown) {
    console.error("Error in completeServiceAction:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menyelesaikan layanan cukur.",
    };
  }
}

/**
 * Server Action: Manual assignment of a waiting ticket to a specific barber.
 * Cashier overrides auto-queue by manually seating a customer to a chair.
 */
export async function assignTicketManualAction(
  ticketId: string,
  barberId: string
): Promise<ActionResult<AssignTicketManualResult>> {
  try {
    const session = await requireAuth(["OWNER", "MANAGER", "CASHIER"]);

    const ticket = await rawPrisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!ticket) {
      return {
        success: false,
        error: `Tiket dengan ID "${ticketId}" tidak ditemukan.`,
      };
    }

    if (ticket.serviceStatus !== "WAITING") {
      return {
        success: false,
        error: `Tiket "${ticket.ticketNumber}" tidak dalam status antre (WAITING).`,
      };
    }

    let barber = await rawPrisma.barberProfile.findUnique({
      where: { id: barberId },
    });

    if (!barber) {
      barber = await rawPrisma.barberProfile.findFirst({
        where: { userId: barberId, storeId: ticket.storeId },
      });
    }

    if (!barber) {
      return {
        success: false,
        error: `Barber dengan ID "${barberId}" tidak ditemukan.`,
      };
    }

    // Atomic update
    const [updatedTicket] = await rawPrisma.$transaction([
      rawPrisma.ticket.update({
        where: { id: ticketId },
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
      }),
      rawPrisma.barberProfile.update({
        where: { id: barber.id },
        data: {
          workStatus: "BUSY",
        },
      }),
    ]);

    if (session.storeSlug) {
      revalidatePath(`/${session.storeSlug}/queue`);
      revalidatePath(`/${session.storeSlug}/pos`);
      revalidatePath(`/${session.storeSlug}/barber`);
    }

    return {
      success: true,
      data: {
        ticket: updatedTicket as QueueItemTicket,
        barberId: barber.id,
      },
    };
  } catch (err: unknown) {
    console.error("Error in assignTicketManualAction:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menugaskan tiket ke barber.",
    };
  }
}
