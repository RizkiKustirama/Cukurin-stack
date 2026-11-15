// Feature types for Platform SaaS Billing Module
import type { SubscriptionStatus, SubscriptionPlan, Tenant } from "@prisma/client";

export interface SubscriptionStatusInfo {
  status: SubscriptionStatus;
  plan?: SubscriptionPlan | null;
  trialEndsAt: Date;
  subscriptionEndsAt?: Date | null;
  isTrialActive: boolean;
  isExpired: boolean;
  daysRemaining: number;
}

export interface ManualExtensionDTO {
  tenantId: string;
  plan: SubscriptionPlan;
  extensionMonths: number;
}

export type { SubscriptionStatus, SubscriptionPlan, Tenant };
