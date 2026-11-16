import { SubscriptionStatus, SubscriptionPlan } from "@prisma/client";

export interface PlatformOverviewMetrics {
  totalTenants: number;
  activeSubscriptions: number;
  activeTrials: number;
  expiredSubscriptions: number;
  suspendedSubscriptions: number;
  totalStores: number;
  totalBarbers: number;
}

export interface TenantManagementItem {
  id: string;
  name: string;
  brandName: string | null;
  slug: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: SubscriptionPlan | null;
  trialEndsAt: string;
  subscriptionEndsAt: string | null;
  daysRemaining: number;
  storesCount: number;
  usersCount: number;
  barbersCount?: number;
  maxBarbers?: number;
  maxStores?: number;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string | null;
  createdAt: string;
}

export interface ExtendSubscriptionInput {
  tenantId: string;
  plan: SubscriptionPlan;
  additionalDays: number;
  notes?: string;
}

export interface SuperadminDashboardData {
  overview: PlatformOverviewMetrics;
  tenants: TenantManagementItem[];
}
