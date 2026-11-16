import { QueueStrategy, BarberWorkStatus } from "@prisma/client";

export type DashboardPeriod = "TODAY" | "LAST_7_DAYS" | "LAST_30_DAYS";

export interface ExecutiveFinancialMetrics {
  grossRevenue: number;
  serviceRevenue: number;
  productRevenue: number;
  completedTicketsCount: number;
  commissionExpense: number;
  pettyCashExpense: number;
  backbarCost: number;
  totalExpenses: number;
  netProfit: number;
  profitMarginPct: number;
  vaultBalance: number;
}

export interface BarberPerformanceSummary {
  barberId: string;
  name: string;
  phone: string;
  employmentType: string;
  workStatus: BarberWorkStatus;
  completedHeadCount: number;
  serviceRevenue: number;
  productRevenue: number;
  totalCommissionEarned: number;
}

export interface StoreQueueConfig {
  storeId: string;
  storeName: string;
  queueStrategy: QueueStrategy;
}

export interface OwnerDashboardData {
  period: DashboardPeriod;
  metrics: ExecutiveFinancialMetrics;
  barbers: BarberPerformanceSummary[];
  queueConfig: StoreQueueConfig;
}
