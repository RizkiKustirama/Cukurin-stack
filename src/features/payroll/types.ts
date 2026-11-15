// Feature types for Payroll & Commission Module
import type { CommissionLedger, CommissionSource, PayoutVia } from "@prisma/client";

export interface CommissionSummary {
  barberId: string;
  barberName: string;
  totalServiceCommission: number;
  totalProductBonus: number;
  totalTip: number;
  totalUnpaid: number;
  completedHeadCountToday: number;
}

export interface PayoutRequest {
  barberId: string;
  dailyRegisterId?: string;
  amount: number;
  paidVia: PayoutVia;
}

export type { CommissionLedger, CommissionSource, PayoutVia };
