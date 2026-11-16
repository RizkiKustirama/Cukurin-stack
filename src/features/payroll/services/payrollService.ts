import { prisma } from "@/shared/db";
import {
  BarberDailySummary,
  StoreBarberPayoutCandidate,
  CommissionItemDetail,
} from "../types";

/**
 * Mengambil ringkasan performa dan komisi barber hari ini
 */
export async function getBarberDailySummary(
  barberId: string,
  targetDate: Date = new Date()
): Promise<BarberDailySummary | null> {
  const barber = await prisma.barberProfile.findUnique({
    where: { id: barberId },
    include: {
      user: {
        select: { id: true, name: true, phone: true },
      },
    },
  });

  if (!barber) return null;

  // Rentang awal & akhir hari ini (WIB/Lokal)
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Ambil tiket yang diselesaikan barber ini hari ini
  const completedTickets = await prisma.ticket.findMany({
    where: {
      assignedBarberId: barberId,
      serviceStatus: "COMPLETED",
      createdAt: { gte: startOfDay, lte: endOfDay },
    },
    select: { id: true },
  });

  const completedHeadCountToday = completedTickets.length;

  // Ambil seluruh catatan komisi barber
  const ledgers = await prisma.commissionLedger.findMany({
    where: {
      barberId,
    },
    include: {
      ticket: {
        select: { ticketNumber: true },
      },
    },
    orderBy: { id: "desc" },
  });

  let totalServiceCommission = 0;
  let totalProductBonus = 0;
  let totalTip = 0;
  let totalUnpaidCommission = 0;
  let totalPaidCommissionToday = 0;

  const items: CommissionItemDetail[] = ledgers.map((l) => {
    const amt = Number(l.amount);

    if (l.sourceType === "SERVICE_FEE") totalServiceCommission += amt;
    else if (l.sourceType === "PRODUCT_BONUS") totalProductBonus += amt;
    else if (l.sourceType === "TIP") totalTip += amt;

    if (!l.isPaidOut) {
      totalUnpaidCommission += amt;
    } else if (
      l.paidOutAt &&
      l.paidOutAt >= startOfDay &&
      l.paidOutAt <= endOfDay
    ) {
      totalPaidCommissionToday += amt;
    }

    return {
      id: l.id,
      sourceType: l.sourceType,
      amount: amt,
      ticketNumber: l.ticket?.ticketNumber,
      createdAt: new Date(), // fallback
      isPaidOut: l.isPaidOut,
      paidVia: l.paidVia,
      paidOutAt: l.paidOutAt,
    };
  });

  return {
    barberId: barber.id,
    barberName: barber.user.name,
    phone: barber.user.phone,
    workStatus: barber.workStatus,
    commissionRatePercent: Number(barber.serviceCommissionPct),
    totalServiceCommission,
    totalProductBonus,
    totalTip,
    totalUnpaidCommission,
    totalPaidCommissionToday,
    completedHeadCountToday,
    items,
  };
}

/**
 * Mengambil daftar seluruh barber di toko yang memiliki komisi belum dicairkan (Unpaid)
 */
export async function getStoreBarberPayoutCandidates(
  storeId: string
): Promise<StoreBarberPayoutCandidate[]> {
  const barbers = await prisma.barberProfile.findMany({
    where: { storeId },
    include: {
      user: {
        select: { name: true },
      },
      commissionLedgers: {
        where: { isPaidOut: false },
      },
      assignedTickets: {
        where: {
          serviceStatus: "COMPLETED",
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
        select: { id: true },
      },
    },
  });

  return barbers.map((b) => {
    let unpaidService = 0;
    let unpaidProduct = 0;
    let unpaidTip = 0;

    for (const led of b.commissionLedgers) {
      const amt = Number(led.amount);
      if (led.sourceType === "SERVICE_FEE") unpaidService += amt;
      else if (led.sourceType === "PRODUCT_BONUS") unpaidProduct += amt;
      else if (led.sourceType === "TIP") unpaidTip += amt;
    }

    const totalUnpaid = unpaidService + unpaidProduct + unpaidTip;

    return {
      barberId: b.id,
      barberName: b.user.name,
      unpaidService,
      unpaidProduct,
      unpaidTip,
      totalUnpaid,
      completedHeadCountToday: b.assignedTickets.length,
    };
  });
}
