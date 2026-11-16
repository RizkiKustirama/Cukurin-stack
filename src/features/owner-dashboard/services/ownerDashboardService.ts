import { prisma } from "@/shared/db";
import { QueueStrategy, BarberWorkStatus } from "@prisma/client";
import type {
  DashboardPeriod,
  ExecutiveFinancialMetrics,
  BarberPerformanceSummary,
  OwnerDashboardData,
} from "../types";

/**
 * Menghitung Laba Bersih Toko berdasarkan formula:
 * Net Profit = Gross Revenue - Barber Commission - Petty Cash - Backbar Cost
 */
export function calculateNetProfit(
  grossRevenue: number,
  commissionExpense: number,
  pettyCashExpense: number,
  backbarCost: number
): number {
  return Number((grossRevenue - commissionExpense - pettyCashExpense - backbarCost).toFixed(2));
}

/**
 * Menghasilkan rentang tanggal (startDate, endDate) berdasarkan opsi periode filter.
 */
export function getDateRangeForPeriod(
  period: DashboardPeriod,
  referenceDate: Date = new Date()
): { startDate: Date; endDate: Date } {
  const endDate = new Date(referenceDate);
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(referenceDate);
  startDate.setHours(0, 0, 0, 0);

  if (period === "LAST_7_DAYS") {
    startDate.setDate(startDate.getDate() - 6);
  } else if (period === "LAST_30_DAYS") {
    startDate.setDate(startDate.getDate() - 29);
  }

  return { startDate, endDate };
}

/**
 * Mengambil ringkasan eksekutif keuangan dan operasional toko untuk Owner/Manager.
 */
export async function getStoreExecutiveDashboardData(
  storeId: string,
  period: DashboardPeriod = "TODAY",
  referenceDate: Date = new Date()
): Promise<OwnerDashboardData> {
  const { startDate, endDate } = getDateRangeForPeriod(period, referenceDate);

  // 1. Ambil data store untuk brankas & strategi antrean
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: {
      id: true,
      name: true,
      vaultBalance: true,
      queueStrategy: true,
    },
  });

  if (!store) {
    throw new Error(`Store dengan ID ${storeId} tidak ditemukan.`);
  }

  // 2. Ambil seluruh tiket selesai & lunas pada rentang tanggal
  const completedTickets = await prisma.ticket.findMany({
    where: {
      storeId,
      serviceStatus: "COMPLETED",
      paymentStatus: "PAID",
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      items: true,
      assignedBarber: {
        include: {
          user: {
            select: { name: true, phone: true },
          },
        },
      },
    },
  });

  // Agregasi Omzet & Komisi dari Tiket
  let grossRevenue = 0;
  let serviceRevenue = 0;
  let productRevenue = 0;
  let commissionExpense = 0;

  for (const ticket of completedTickets) {
    grossRevenue += Number(ticket.totalAmount);

    for (const item of ticket.items) {
      const itemSubtotal = Number(item.subtotal);
      const itemCommission = Number(item.commissionAmount);

      if (item.itemType === "SERVICE") {
        serviceRevenue += itemSubtotal;
      } else {
        productRevenue += itemSubtotal;
      }

      commissionExpense += itemCommission;
    }
  }

  // 3. Ambil pengeluaran petty cash pada rentang tanggal
  const pettyCashRecords = await prisma.pettyCashExpense.findMany({
    where: {
      dailyRegister: {
        storeId,
      },
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      amount: true,
    },
  });

  const pettyCashExpense = pettyCashRecords.reduce(
    (sum, record) => sum + Number(record.amount),
    0
  );

  // 4. Ambil pengeluaran meja / backbar toko pada rentang tanggal
  const backbarRecords = await prisma.storeConsumption.findMany({
    where: {
      storeId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      costValue: true,
    },
  });

  const backbarCost = backbarRecords.reduce(
    (sum, record) => sum + Number(record.costValue),
    0
  );

  // 5. Hitung Laba Bersih & Margin
  const totalExpenses = Number((commissionExpense + pettyCashExpense + backbarCost).toFixed(2));
  const netProfit = calculateNetProfit(
    grossRevenue,
    commissionExpense,
    pettyCashExpense,
    backbarCost
  );
  const profitMarginPct =
    grossRevenue > 0 ? Number(((netProfit / grossRevenue) * 100).toFixed(1)) : 0;

  const metrics: ExecutiveFinancialMetrics = {
    grossRevenue: Number(grossRevenue.toFixed(2)),
    serviceRevenue: Number(serviceRevenue.toFixed(2)),
    productRevenue: Number(productRevenue.toFixed(2)),
    completedTicketsCount: completedTickets.length,
    commissionExpense: Number(commissionExpense.toFixed(2)),
    pettyCashExpense: Number(pettyCashExpense.toFixed(2)),
    backbarCost: Number(backbarCost.toFixed(2)),
    totalExpenses,
    netProfit,
    profitMarginPct,
    vaultBalance: Number(store.vaultBalance),
  };

  // 6. Ambil seluruh barber toko untuk agregasi kinerja individu
  const storeBarbers = await prisma.barberProfile.findMany({
    where: { storeId },
    include: {
      user: {
        select: { name: true, phone: true },
      },
    },
    orderBy: {
      user: { name: "asc" },
    },
  });

  // Map kinerja per barber
  const barberMap = new Map<string, BarberPerformanceSummary>();

  for (const b of storeBarbers) {
    barberMap.set(b.id, {
      barberId: b.id,
      name: b.user.name,
      phone: b.user.phone,
      employmentType: b.employmentType,
      workStatus: b.workStatus,
      completedHeadCount: 0,
      serviceRevenue: 0,
      productRevenue: 0,
      totalCommissionEarned: 0,
    });
  }

  // Agregasi dari tiket yang sudah diambil
  for (const ticket of completedTickets) {
    const assignedId = ticket.assignedBarberId;
    if (assignedId && barberMap.has(assignedId)) {
      const bData = barberMap.get(assignedId)!;
      bData.completedHeadCount += 1;
    }

    for (const item of ticket.items) {
      // Jika service: assignedBarber dapat serviceRevenue & komisi
      if (item.itemType === "SERVICE" && assignedId && barberMap.has(assignedId)) {
        const bData = barberMap.get(assignedId)!;
        bData.serviceRevenue += Number(item.subtotal);
        bData.totalCommissionEarned += Number(item.commissionAmount);
      }

      // Jika retail product: jika ada recommendedById
      if (item.itemType === "PRODUCT" && item.recommendedById && barberMap.has(item.recommendedById)) {
        const bData = barberMap.get(item.recommendedById)!;
        bData.productRevenue += Number(item.subtotal);
        bData.totalCommissionEarned += Number(item.commissionAmount);
      }
    }
  }

  const barbers = Array.from(barberMap.values()).map((b) => ({
    ...b,
    serviceRevenue: Number(b.serviceRevenue.toFixed(2)),
    productRevenue: Number(b.productRevenue.toFixed(2)),
    totalCommissionEarned: Number(b.totalCommissionEarned.toFixed(2)),
  }));

  // Urutkan barber berdasarkan total kepala terbanyak
  barbers.sort((a, b) => b.completedHeadCount - a.completedHeadCount);

  return {
    period,
    metrics,
    barbers,
    queueConfig: {
      storeId: store.id,
      storeName: store.name,
      queueStrategy: store.queueStrategy,
    },
  };
}

/**
 * Memperbarui konfigurasi strategi antrean toko (LOYALTY_PRIORITY vs STRICT_FIFO).
 */
export async function updateStoreQueueStrategy(
  storeId: string,
  queueStrategy: QueueStrategy
): Promise<{ success: boolean; queueStrategy: QueueStrategy }> {
  const updated = await prisma.store.update({
    where: { id: storeId },
    data: { queueStrategy },
    select: { queueStrategy: true },
  });

  return {
    success: true,
    queueStrategy: updated.queueStrategy,
  };
}
