import { SubscriptionStatus } from "@prisma/client";
import type { SubscriptionAccessResult } from "../types";

/**
 * Menghitung sisa hari masa percobaan gratis (maksimal 14 hari, minimal 0 hari).
 * @param trialEndsAt Tanggal akhir trial (Date atau ISO string)
 * @returns Sisa hari integer (0 - 14)
 */
export function getTrialDaysRemaining(trialEndsAt: Date | string): number {
  const endDate = typeof trialEndsAt === "string" ? new Date(trialEndsAt) : trialEndsAt;
  const now = new Date();

  if (isNaN(endDate.getTime())) {
    return 0;
  }

  const diffMs = endDate.getTime() - now.getTime();
  if (diffMs <= 0) {
    return 0;
  }

  // Hitung selisih hari dibulatkan ke atas agar sisa beberapa jam tetap dihitung 1 hari
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.min(14, Math.max(0, days));
}

/**
 * Memeriksa akses operasional tenant berdasarkan status langganan dan sisa masa percobaan.
 * - Akses diperbolehkan jika status === 'ACTIVE'
 * - Akses diperbolehkan jika status === 'TRIAL' dan trialEndsAt > now
 * - Akses ditolak jika status === 'EXPIRED', 'SUSPENDED', atau masa trial telah lewat
 *
 * @param status SubscriptionStatus tenant
 * @param trialEndsAt Tanggal berakhir masa trial
 */
export function checkSubscriptionAccess(
  status: SubscriptionStatus,
  trialEndsAt: Date | string
): SubscriptionAccessResult {
  const endDate = typeof trialEndsAt === "string" ? new Date(trialEndsAt) : trialEndsAt;
  const now = new Date();

  if (status === SubscriptionStatus.ACTIVE) {
    return {
      isAllowed: true,
      isTrial: false,
      isExpired: false,
      daysRemaining: 0,
    };
  }

  if (status === SubscriptionStatus.TRIAL) {
    const isPast = isNaN(endDate.getTime()) || endDate.getTime() <= now.getTime();
    const daysRemaining = isPast ? 0 : getTrialDaysRemaining(endDate);

    if (!isPast && daysRemaining > 0) {
      return {
        isAllowed: true,
        isTrial: true,
        isExpired: false,
        daysRemaining,
      };
    }

    return {
      isAllowed: false,
      isTrial: true,
      isExpired: true,
      daysRemaining: 0,
      reason: "Masa percobaan gratis (14 hari) Anda telah berakhir.",
    };
  }

  if (status === SubscriptionStatus.EXPIRED) {
    return {
      isAllowed: false,
      isTrial: false,
      isExpired: true,
      daysRemaining: 0,
      reason: "Masa langganan Cukurin Anda telah kedaluwarsa.",
    };
  }

  if (status === SubscriptionStatus.SUSPENDED) {
    return {
      isAllowed: false,
      isTrial: false,
      isExpired: false,
      daysRemaining: 0,
      reason: "Akun barbershop Anda ditangguhkan (SUSPENDED). Hubungi Admin Cukurin.",
    };
  }

  return {
    isAllowed: false,
    isTrial: false,
    isExpired: true,
    daysRemaining: 0,
    reason: "Status langganan tidak valid.",
  };
}

export const subscriptionService = {
  getTrialDaysRemaining,
  checkSubscriptionAccess,
};
