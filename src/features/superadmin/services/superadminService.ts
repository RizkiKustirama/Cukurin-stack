import { prisma } from "@/shared/db";
import { SubscriptionStatus, SubscriptionPlan } from "@prisma/client";
import type {
  PlatformOverviewMetrics,
  TenantManagementItem,
  ExtendSubscriptionInput,
  SuperadminDashboardData,
} from "../types";

/**
 * Menghitung tanggal berakhir langganan baru:
 * - Jika langganan sebelumnya masih aktif (endsAt > now), tambah hari dari endsAt tersebut (akumulatif).
 * - Jika langganan sebelumnya sudah expired atau null, hitung maju dari sekarang (referenceDate).
 */
export function calculateNewSubscriptionEndDate(
  currentEndsAt: Date | string | null,
  additionalDays: number,
  referenceDate: Date = new Date()
): Date {
  const baseDate = currentEndsAt ? new Date(currentEndsAt) : null;
  const isCurrentlyActive = baseDate && !isNaN(baseDate.getTime()) && baseDate > referenceDate;

  const startFrom = isCurrentlyActive ? baseDate : new Date(referenceDate);
  const newEndDate = new Date(startFrom);
  newEndDate.setDate(newEndDate.getDate() + additionalDays);

  return newEndDate;
}

/**
 * Mengambil ringkasan statistik platform SaaS Cukurin untuk Superadmin.
 */
export async function getPlatformOverviewMetrics(): Promise<PlatformOverviewMetrics> {
  const [
    totalTenants,
    activeSubscriptions,
    activeTrials,
    expiredSubscriptions,
    suspendedSubscriptions,
    totalStores,
    totalBarbers,
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { subscriptionStatus: SubscriptionStatus.ACTIVE } }),
    prisma.tenant.count({ where: { subscriptionStatus: SubscriptionStatus.TRIAL } }),
    prisma.tenant.count({ where: { subscriptionStatus: SubscriptionStatus.EXPIRED } }),
    prisma.tenant.count({ where: { subscriptionStatus: SubscriptionStatus.SUSPENDED } }),
    prisma.store.count(),
    prisma.barberProfile.count(),
  ]);

  return {
    totalTenants,
    activeSubscriptions,
    activeTrials,
    expiredSubscriptions,
    suspendedSubscriptions,
    totalStores,
    totalBarbers,
  };
}

/**
 * Mengambil seluruh daftar tenant barbershop terdaftar beserta detail langganannya.
 */
export async function getAllTenantsList(
  referenceDate: Date = new Date()
): Promise<TenantManagementItem[]> {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          stores: true,
          users: true,
        },
      },
    },
  });

  return tenants.map((t) => {
    let daysRemaining = 0;
    const now = referenceDate.getTime();

    if (t.subscriptionStatus === SubscriptionStatus.ACTIVE && t.subscriptionEndsAt) {
      const endsTime = new Date(t.subscriptionEndsAt).getTime();
      const diffMs = endsTime - now;
      daysRemaining = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;
    } else if (t.subscriptionStatus === SubscriptionStatus.TRIAL) {
      const trialTime = new Date(t.trialEndsAt).getTime();
      const diffMs = trialTime - now;
      daysRemaining = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;
    }

    return {
      id: t.id,
      name: t.name,
      brandName: t.brandName,
      slug: t.slug,
      subscriptionStatus: t.subscriptionStatus,
      subscriptionPlan: t.subscriptionPlan,
      trialEndsAt: t.trialEndsAt.toISOString(),
      subscriptionEndsAt: t.subscriptionEndsAt ? t.subscriptionEndsAt.toISOString() : null,
      daysRemaining,
      storesCount: t._count.stores,
      usersCount: t._count.users,
      createdAt: t.createdAt.toISOString(),
    };
  });
}

/**
 * Mengambil data agregat lengkap untuk dashboard Superadmin platform.
 */
export async function getSuperadminDashboardData(): Promise<SuperadminDashboardData> {
  const [overview, tenants] = await Promise.all([
    getPlatformOverviewMetrics(),
    getAllTenantsList(),
  ]);

  return {
    overview,
    tenants,
  };
}

/**
 * Memperpanjang masa langganan tenant secara manual (misal: setelah bukti transfer bank diverifikasi).
 */
export async function extendTenantSubscription(input: ExtendSubscriptionInput) {
  const { tenantId, plan, additionalDays } = input;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      subscriptionStatus: true,
      subscriptionEndsAt: true,
      name: true,
      brandName: true,
    },
  });

  if (!tenant) {
    throw new Error(`Tenant dengan ID ${tenantId} tidak ditemukan.`);
  }

  const newEndDate = calculateNewSubscriptionEndDate(
    tenant.subscriptionEndsAt,
    additionalDays
  );

  const updatedTenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      subscriptionPlan: plan,
      subscriptionEndsAt: newEndDate,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      subscriptionStatus: true,
      subscriptionPlan: true,
      subscriptionEndsAt: true,
    },
  });

  return {
    success: true,
    tenant: updatedTenant,
  };
}
