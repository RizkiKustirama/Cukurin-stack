import type { UserRole } from "@prisma/client";

export { UserRole };

export interface SessionUser {
  userId: string;
  name: string;
  phone: string;
  email: string | null;
  role: UserRole;
  tenantId: string | null;
  storeId: string | null;
  storeSlug?: string | null;
  brandName?: string | null;
  isOnboarded?: boolean;
}

export interface SessionPayload extends SessionUser {
  iat?: number;
  exp?: number;
}
