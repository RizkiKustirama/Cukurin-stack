// Feature types for Payroll & Commission Module
import type {
  CommissionLedger,
  CommissionSource,
  PayoutVia,
  BarberProfile,
  User,
  Ticket,
} from "@prisma/client";

export interface CommissionItemDetail {
  id: string;
  sourceType: CommissionSource;
  amount: number;
  ticketNumber?: string;
  createdAt: Date;
  isPaidOut: boolean;
  paidVia?: PayoutVia | null;
  paidOutAt?: Date | null;
}

export interface BarberDailySummary {
  barberId: string;
  barberName: string;
  phone: string;
  workStatus: string;
  commissionRatePercent: number;
  totalServiceCommission: number;
  totalProductBonus: number;
  totalTip: number;
  totalUnpaidCommission: number;
  totalPaidCommissionToday: number;
  completedHeadCountToday: number;
  items: CommissionItemDetail[];
}

export interface StoreBarberPayoutCandidate {
  barberId: string;
  barberName: string;
  unpaidService: number;
  unpaidProduct: number;
  unpaidTip: number;
  totalUnpaid: number;
  completedHeadCountToday: number;
}

export interface PayoutRequest {
  storeId: string;
  barberId: string;
  amount: number;
  paidVia: PayoutVia; // 'CASH_DRAWER' | 'TRANSFER'
  dailyRegisterId?: string;
  notes?: string;
}

export type {
  CommissionLedger,
  CommissionSource,
  PayoutVia,
  BarberProfile,
  User,
  Ticket,
};
