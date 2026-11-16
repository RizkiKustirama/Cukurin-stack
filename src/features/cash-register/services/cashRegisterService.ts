import { prisma } from "@/shared/db";
import {
  DailyRegisterSummary,
  StoreVaultInfo,
  CashMovementItem,
} from "../types";

/**
 * Mengambil informasi Saldo Brankas Toko (Store Vault Balance)
 */
export async function getStoreVaultInfo(storeId: string): Promise<StoreVaultInfo | null> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true, name: true, vaultBalance: true },
  });

  if (!store) return null;

  return {
    storeId: store.id,
    storeName: store.name,
    vaultBalance: Number(store.vaultBalance),
  };
}

/**
 * Mengambil buku kas harian yang sedang berstatus 'OPEN' untuk toko ini
 */
export async function getActiveDailyRegister(storeId: string) {
  return await prisma.dailyRegister.findFirst({
    where: {
      storeId,
      status: "OPEN",
    },
    include: {
      cashier: {
        select: { id: true, name: true },
      },
      payments: {
        include: {
          ticket: {
            select: { id: true, ticketNumber: true },
          },
        },
      },
      pettyCashExpenses: true,
      commissionLedgers: {
        include: {
          barber: {
            include: {
              user: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
    orderBy: { openedAt: "desc" },
  });
}

/**
 * Menghitung ringkasan buku kas harian (Summary & Formula Audit)
 * Formula Kas Laci Fisik yang Diharapkan:
 * ExpectedDrawer = OpeningCash + TotalCashSales - TotalPettyCash - TotalCashBarberPayout
 */
export function computeRegisterSummaryFromData(
  register: any,
  payments: Array<{ paymentMethod: string; amount: any }>,
  pettyExpenses: Array<{ amount: any }>,
  commissionPayouts: Array<{ amount: any; paidVia?: string | null; isPaidOut: boolean }>
): DailyRegisterSummary {
  const openingCash = Number(register.openingCash || 0);

  let totalCashSales = 0;
  let totalQrisSales = 0;
  let totalTransferSales = 0;
  let totalEdcSales = 0;

  for (const p of payments) {
    const amt = Number(p.amount);
    if (p.paymentMethod === "CASH") totalCashSales += amt;
    else if (p.paymentMethod === "QRIS") totalQrisSales += amt;
    else if (p.paymentMethod === "TRANSFER") totalTransferSales += amt;
    else if (p.paymentMethod === "EDC") totalEdcSales += amt;
  }

  let totalPettyExpenses = 0;
  for (const exp of pettyExpenses) {
    totalPettyExpenses += Number(exp.amount);
  }

  let totalCommissionPaidFromDrawer = 0;
  for (const com of commissionPayouts) {
    if (com.isPaidOut && com.paidVia === "CASH_DRAWER") {
      totalCommissionPaidFromDrawer += Number(com.amount);
    }
  }

  const expectedDrawerCash =
    openingCash + totalCashSales - totalPettyExpenses - totalCommissionPaidFromDrawer;

  const isClosed = register.status === "CLOSED";
  const actualCash = register.actualCash !== null && register.actualCash !== undefined
    ? Number(register.actualCash)
    : null;

  const discrepancyCash = actualCash !== null ? actualCash - expectedDrawerCash : null;

  return {
    register,
    openingCash,
    totalCashSales,
    totalQrisSales,
    totalTransferSales,
    totalEdcSales,
    totalPettyExpenses,
    totalCommissionPaidFromDrawer,
    expectedDrawerCash,
    isClosed,
    actualCash,
    discrepancyCash,
  };
}

/**
 * Menghitung ringkasan kas untuk register tertentu dari database
 */
export async function calculateRegisterSummary(
  registerId: string
): Promise<DailyRegisterSummary | null> {
  const register = await prisma.dailyRegister.findUnique({
    where: { id: registerId },
    include: {
      payments: true,
      pettyCashExpenses: true,
      commissionLedgers: true,
    },
  });

  if (!register) return null;

  return computeRegisterSummaryFromData(
    register,
    register.payments,
    register.pettyCashExpenses,
    register.commissionLedgers
  );
}

/**
 * Menghasilkan kronologi mutasi kas laci secara urut waktu
 */
export async function getCashMovements(registerId: string): Promise<CashMovementItem[]> {
  const register = await prisma.dailyRegister.findUnique({
    where: { id: registerId },
    include: {
      payments: {
        where: { paymentMethod: "CASH" },
        include: {
          ticket: { select: { ticketNumber: true } },
        },
      },
      pettyCashExpenses: true,
      commissionLedgers: {
        where: {
          isPaidOut: true,
          paidVia: "CASH_DRAWER",
        },
        include: {
          barber: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!register) return [];

  const rawMovements: Array<{
    id: string;
    timestamp: Date;
    type: CashMovementItem["type"];
    description: string;
    amount: number;
    direction: "IN" | "OUT";
    referenceId?: string;
  }> = [];

  // 1. Opening Cash
  rawMovements.push({
    id: `open-${register.id}`,
    timestamp: register.openedAt,
    type: "OPENING_DEPOSIT",
    description: "Deposit Modal Kas Pagi dari Brankas Toko",
    amount: Number(register.openingCash),
    direction: "IN",
  });

  // 2. Cash Sales
  for (const p of register.payments) {
    rawMovements.push({
      id: `sale-${p.id}`,
      timestamp: p.createdAt,
      type: "CASH_SALE",
      description: `Penjualan Tunai Tiket #${p.ticket?.ticketNumber || p.ticketId}`,
      amount: Number(p.amount),
      direction: "IN",
      referenceId: p.ticketId,
    });
  }

  // 3. Petty Cash Expenses
  for (const exp of register.pettyCashExpenses) {
    rawMovements.push({
      id: `petty-${exp.id}`,
      timestamp: exp.createdAt,
      type: "PETTY_EXPENSE",
      description: `Kas Kecil [${exp.category}]: ${exp.notes}`,
      amount: Number(exp.amount),
      direction: "OUT",
    });
  }

  // 4. Barber Commission Payouts
  for (const com of register.commissionLedgers) {
    rawMovements.push({
      id: `payout-${com.id}`,
      timestamp: com.paidOutAt || register.openedAt,
      type: "BARBER_PAYOUT",
      description: `Pencairan Komisi Barber (${com.barber?.user?.name || "Barber"}) - ${com.sourceType}`,
      amount: Number(com.amount),
      direction: "OUT",
    });
  }

  // 5. Closing Deposit (jika sudah CLOSED)
  if (register.status === "CLOSED" && register.closedAt && register.actualCash !== null) {
    rawMovements.push({
      id: `close-${register.id}`,
      timestamp: register.closedAt,
      type: "CLOSING_SETOR",
      description: `Setoran Uang Fisik Hasil Tutup Kas ke Brankas Toko`,
      amount: Number(register.actualCash),
      direction: "OUT",
    });
  }

  // Sort chronological
  rawMovements.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  let runningBalance = 0;
  return rawMovements.map((m) => {
    if (m.type === "CLOSING_SETOR") {
      runningBalance = 0;
    } else if (m.direction === "IN") {
      runningBalance += m.amount;
    } else {
      runningBalance -= m.amount;
    }

    return {
      ...m,
      runningBalance,
    };
  });
}
