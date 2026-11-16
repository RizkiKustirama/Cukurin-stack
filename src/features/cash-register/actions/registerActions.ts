"use server";

import { prisma } from "@/shared/db";
import { revalidatePath } from "next/cache";
import { calculateRegisterSummary } from "../services/cashRegisterService";

export interface RegisterActionResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Server Action: Buka Kasir Pagi (Menarik Deposit Modal dari Saldo Brankas Toko)
 */
export async function openRegisterAction(formData: {
  storeId: string;
  cashierId: string;
  openingCash: number;
  notes?: string;
}): Promise<RegisterActionResult> {
  try {
    const { storeId, cashierId, openingCash, notes } = formData;

    if (!storeId || !cashierId) {
      return { success: false, message: "Parameter toko dan kasir wajib diisi." };
    }

    if (openingCash <= 0) {
      return { success: false, message: "Nominal modal kas pagi harus lebih dari 0." };
    }

    // 1. Cek apakah sudah ada kasir yang OPEN di toko ini
    const existingActive = await prisma.dailyRegister.findFirst({
      where: { storeId, status: "OPEN" },
    });

    if (existingActive) {
      return {
        success: false,
        message: "Masih ada sesi kasir yang aktif (OPEN). Selesaikan atau tutup kasir terlebih dahulu.",
      };
    }

    // 2. Cek Saldo Brankas Toko (Store Vault Balance)
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true, name: true, vaultBalance: true },
    });

    if (!store) {
      return { success: false, message: "Cabang toko tidak ditemukan." };
    }

    const currentVault = Number(store.vaultBalance);
    if (openingCash > currentVault) {
      return {
        success: false,
        message: `Saldo brankas toko tidak mencukupi (Tersedia: Rp ${currentVault.toLocaleString("id-ID")}, Diminta: Rp ${openingCash.toLocaleString("id-ID")}).`,
      };
    }

    // 3. Eksekusi ACID Transaction: Potong Saldo Brankas & Buka DailyRegister
    const result = await prisma.$transaction(async (tx) => {
      // Potong brankas toko
      const updatedStore = await tx.store.update({
        where: { id: storeId },
        data: {
          vaultBalance: {
            decrement: openingCash,
          },
        },
      });

      // Buka buku kas laci
      const newRegister = await tx.dailyRegister.create({
        data: {
          storeId,
          cashierId,
          openingCash,
          status: "OPEN",
          notes: notes || "Modal kas pagi ditarik dari brankas toko",
        },
      });

      return {
        registerId: newRegister.id,
        remainingVaultBalance: Number(updatedStore.vaultBalance),
      };
    });

    revalidatePath("/[storeSlug]/pos", "page");

    return {
      success: true,
      message: `Kasir berhasil dibuka dengan modal Rp ${openingCash.toLocaleString("id-ID")}. Sisa brankas toko: Rp ${result.remainingVaultBalance.toLocaleString("id-ID")}.`,
      data: result,
    };
  } catch (error: any) {
    console.error("Error in openRegisterAction:", error);
    return {
      success: false,
      message: error.message || "Gagal membuka sesi kasir.",
    };
  }
}

/**
 * Server Action: Catat Pengeluaran Kas Kecil (Petty Cash)
 */
export async function recordPettyCashAction(formData: {
  registerId: string;
  amount: number;
  category?: string;
  notes: string;
}): Promise<RegisterActionResult> {
  try {
    const { registerId, amount, category, notes } = formData;

    if (!registerId || amount <= 0 || !notes) {
      return {
        success: false,
        message: "Nominal pengeluaran dan keterangan wajib diisi.",
      };
    }

    const register = await prisma.dailyRegister.findUnique({
      where: { id: registerId },
    });

    if (!register || register.status !== "OPEN") {
      return {
        success: false,
        message: "Sesi kasir tidak valid atau sudah ditutup.",
      };
    }

    const pettyExpense = await prisma.pettyCashExpense.create({
      data: {
        dailyRegisterId: registerId,
        amount,
        category: category || "OPERASIONAL",
        notes,
      },
    });

    revalidatePath("/[storeSlug]/pos", "page");

    return {
      success: true,
      message: `Pengeluaran kas kecil sebesar Rp ${amount.toLocaleString("id-ID")} berhasil dicatat.`,
      data: pettyExpense,
    };
  } catch (error: any) {
    console.error("Error in recordPettyCashAction:", error);
    return {
      success: false,
      message: error.message || "Gagal mencatat pengeluaran kas kecil.",
    };
  }
}

/**
 * Server Action: Tutup Kasir Malam (Blind Count, Discrepancy, & Setor Balik ke Brankas)
 */
export async function closeRegisterAction(formData: {
  registerId: string;
  actualCash: number;
  notes?: string;
}): Promise<RegisterActionResult> {
  try {
    const { registerId, actualCash, notes } = formData;

    if (!registerId || actualCash < 0) {
      return {
        success: false,
        message: "Perhitungan uang fisik nyata (actual cash) wajib diisi valid.",
      };
    }

    const register = await prisma.dailyRegister.findUnique({
      where: { id: registerId },
      include: {
        store: true,
      },
    });

    if (!register || register.status !== "OPEN") {
      return {
        success: false,
        message: "Sesi kasir tidak valid atau sudah berstatus tutup.",
      };
    }

    // 1. Hitung Ringkasan Kas yang Diharapkan (Expected Drawer Cash)
    const summary = await calculateRegisterSummary(registerId);
    if (!summary) {
      return { success: false, message: "Gagal menghitung ringkasan buku kas." };
    }

    const expectedCash = summary.expectedDrawerCash;
    const discrepancyCash = actualCash - expectedCash;

    // 2. Eksekusi ACID Transaction: Setor Balik Fisik ke Brankas & Tutup Register
    const closed = await prisma.$transaction(async (tx) => {
      // Setor fisik hasil tutup kasir kembali ke Saldo Total Brankas Toko
      const updatedStore = await tx.store.update({
        where: { id: register.storeId },
        data: {
          vaultBalance: {
            increment: actualCash,
          },
        },
      });

      // Update DailyRegister menjadi CLOSED
      const updatedRegister = await tx.dailyRegister.update({
        where: { id: registerId },
        data: {
          closedAt: new Date(),
          status: "CLOSED",
          expectedCash,
          actualCash,
          discrepancyCash,
          notes: notes
            ? `${notes} (Discrepancy: Rp ${discrepancyCash.toLocaleString("id-ID")})`
            : `Tutup kasir malam. Selisih fisik: Rp ${discrepancyCash.toLocaleString("id-ID")}`,
        },
      });

      return {
        register: updatedRegister,
        newVaultBalance: Number(updatedStore.vaultBalance),
      };
    });

    revalidatePath("/[storeSlug]/pos", "page");

    const selisihText =
      discrepancyCash === 0
        ? "Tepat (Balance)"
        : discrepancyCash > 0
        ? `Surplus/Lebih (+Rp ${discrepancyCash.toLocaleString("id-ID")})`
        : `Tekor/Minus (-Rp ${Math.abs(discrepancyCash).toLocaleString("id-ID")})`;

    return {
      success: true,
      message: `Tutup kasir berhasil! Kas fisik Rp ${actualCash.toLocaleString("id-ID")} disetor ke brankas toko (Status: ${selisihText}). Saldo brankas kini: Rp ${closed.newVaultBalance.toLocaleString("id-ID")}.`,
      data: {
        register: closed.register,
        summary,
        discrepancyCash,
        newVaultBalance: closed.newVaultBalance,
      },
    };
  } catch (error: any) {
    console.error("Error in closeRegisterAction:", error);
    return {
      success: false,
      message: error.message || "Gagal menutup sesi kasir.",
    };
  }
}
