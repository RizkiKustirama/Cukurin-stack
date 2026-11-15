// Feature types for Tenant Branding & Setup Wizard Module
import type { Tenant, Store } from "@prisma/client";

export interface TenantBrandingDTO {
  tenantId: string;
  brandName: string;
  logoUrl?: string;
  primaryColor: string;
}

export interface OnboardingWizardStep1DTO {
  tenantId: string;
  storeName: string;
  address?: string;
  phone?: string;
  brandName: string;
  logoUrl?: string;
  primaryColor: string;
}

export interface OnboardingWizardStep2DTO {
  storeId: string;
  barberName: string;
  barberPhone: string;
  commissionPct: number;
}

export interface OnboardingWizardStep3DTO {
  storeId: string;
  serviceName: string;
  price: number;
  durationMinutes: number;
}

export type { Tenant, Store };
