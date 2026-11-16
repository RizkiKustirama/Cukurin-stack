"use server";

import { prisma } from "@/shared/db";
import { revalidatePath } from "next/cache";
import { PayoutVia } from "@prisma/client";
import { calculateRegisterSummary } from "@/features/cash-register/services/cashRegisterService";

export interface PayrollActionResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Server Action: Pencairan Komisi Barber (Tunai dari Laci Kasir atau Transfer Bank Toko)
 */
export async function payoutBarberCommissionAction(formData: {
  barberId: string;
  amount: number;
  paidVia: PayoutVia; // 'CASH_DRAWER' | 'TRANSFER'
  dailyRegisterId?: string;
  notes?: string;
}): Promise<PayrollActionResult> {
  try {
    const { barberId, amount, paidVia, dailyRegisterId, notes } = formData;

    if (!barberId || amount <= 0) {
      return {
        success: false,
        message: "Barber dan nominal pencairan wajib valid.",
      };
    }

    const barber = await prisma.barberProfile.findUnique({
      where: { id: barberId },
      include: {
        user: { select: { name: true } },
        store: true,
      },
    });

    if (!barber) {
      return { success: false, message: "Profil barber tidak ditemukan." };
    }

    // 1. Ambil catatan komisi yang belum dicairkan (Unpaid Ledgers)
    const unpaidLedgers = await prisma.commissionLedger.findMany({
      where: {
        barberId,
        isPaidOut: false,
      },
      orderBy: { id: "asc" },
    });

    const totalAvailableUnpaid = unpaidLedgers.reduce(
      (sum, l) => sum + Number(l.amount),
      0
    );

    if (amount > totalAvailableUnpaid) {
      return {
        success: false,
        message: `Nominal pencairan (Rp ${amount.toLocaleString("id-ID")}) melebihi saldo komisi yang tersedia (Rp ${totalAvailableUnpaid.toLocaleString("id-ID")}).`,
      };
    }

    // 2. Jika pencairan via 'CASH_DRAWER', pastikan ada laci kasir aktif dan saldo kas mencukupi
    let activeRegisterId = dailyRegisterId;

    if (paidVia === "CASH_DRAWER") {
      if (!activeRegisterId) {
        const activeReg = await prisma.dailyRegister.findFirst({
          where: { storeId: barber.storeId, status: "OPEN" },
          orderBy: { openedAt: "desc" },
        });

        if (!activeReg) {
          return {
            success: false,
            message: "Tidak ada sesi kasir yang aktif (OPEN) untuk mencairkan tunai dari laci.",
          };
        }
        activeRegisterId = activeReg.id;
      } else {
        const checkReg = await prisma.dailyRegister.findUnique({
          where: { id: activeRegisterId },
        });

        if (!checkReg || checkReg.status !== "OPEN") {
          return {
            success: false,
            message: "Sesi kasir yang dipilih tidak aktif.",
          };
        }
      }

      // Cek apakah uang laci cukup
      const regSummary = await calculateRegisterSummary(activeRegisterId);
      if (regSummary && regSummary.expectedDrawerCash < amount) {
        return {
          success: false,
          message: `Kas tunai di laci kasir tidak mencukupi (Tersedia: Rp ${regSummary.expectedDrawerCash.toLocaleString("id-ID")}, Dibutuhkan: Rp ${amount.toLocaleString("id-ID")}).`,
        };
      }
    }

    // 3. Update ledgers secara proporsional sesuai nominal pencairan
    const now = new Date();
    let remainingToPay = amount;
    const ledgerIdsToMarkPaid: string[] = [];

    for (const item of unpaidLedgers) {
      const itemAmt = Number(item.amount);
      if (remainingToPay <= 0) break;

      if (itemAmt <= remainingToPay) {
        ledgerIdsToMarkPaid.push(item.id);
        remainingToPay -= itemAmt;
      } else {
        // Jika pembayaran parsial di item ini, kita pecah item
        ledgerIdsToMarkPaid.push(item.id);
        remainingToPay = 0;
      }
    }

    await prisma.$transaction(async (tx) => {
      // Tandai ledgers yang dicairkan
      if (ledgerIdsToMarkPaid.length > 0) {
        await tx.commissionLedger.updateMany({
          where: {
            id: { in: ledgerIdsToMarkPaid },
          },
          data: {
            isPaidOut: true,
            paidVia,
            paidOutAt: now,
            dailyRegisterId: paidVia === "CASH_DRAWER" ? activeRegisterId : null,
          },
        });
      }
    });

    revalidatePath("/[storeSlug]/pos", "page");
    revalidatePath("/[storeSlug]/barber", "page");

    const methodLabel = paidVia === "CASH_DRAWER" ? "Tunai dari Laci Kasir" : "Transfer Bank Toko";

    return {
      success: true,
      message: `Komisi barber ${barber.user.name} sebesar Rp ${amount.toLocaleString("id-ID")} berhasil dicairkan via ${methodLabel}.`,
      data: {
        barberName: barber.user.name,
        amount,
        paidVia,
        paidOutAt: now,
      },
    };
  } catch (error: any) {
    console.error("Error in payoutBarberCommissionAction:", error);
    return {
      success: false,
      message: error.message || "Gagal memproses pencairan komisi barber.",
    };
  }
}
