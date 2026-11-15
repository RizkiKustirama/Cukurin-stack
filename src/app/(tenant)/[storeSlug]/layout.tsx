import React from "react";
import { notFound } from "next/navigation";
import { rawPrisma } from "@/shared/db";
import {
  subscriptionService,
  TrialBanner,
  SubscriptionPaywallModal,
} from "@/features/platform-billing";

interface TenantLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    storeSlug: string;
  }>;
}

/**
 * Tenant Layout Server Component
 * Bertanggung jawab atas:
 * 1. Validasi keberadaan tenant via slug
 * 2. Menampilkan TrialBanner jika tenant dalam masa percobaan
 * 3. Menampilkan SubscriptionPaywallModal jika status EXPIRED / SUSPENDED
 * 4. Menyediakan kontainer mobile-first responsive untuk seluruh halaman toko
 */
export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps) {
  const { storeSlug } = await params;

  if (!storeSlug) {
    notFound();
  }

  const tenant = await rawPrisma.tenant.findUnique({
    where: {
      slug: storeSlug,
    },
  });

  if (!tenant) {
    notFound();
  }

  const access = subscriptionService.checkSubscriptionAccess(
    tenant.subscriptionStatus,
    tenant.trialEndsAt
  );

  return (
    <div
      className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary selection:text-stone-950"
      style={
        tenant.primaryColor
          ? ({ "--primary": tenant.primaryColor } as React.CSSProperties)
          : undefined
      }
    >
      {/* Trial Banner di bagian paling atas layar toko jika masa trial aktif */}
      {access.isTrial && !access.isExpired && (
        <TrialBanner
          status={tenant.subscriptionStatus}
          daysRemaining={access.daysRemaining}
          storeName={tenant.brandName || tenant.name}
        />
      )}

      {/* Wadah Layout Konten: Batas mobile-first di layar kecil, terpusat dan rapi di desktop */}
      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col">
        {children}
      </main>

      {/* Subscription Paywall Modal: Mengunci permanen bila masa trial habis atau suspended */}
      {!access.isAllowed && (
        <SubscriptionPaywallModal
          isOpen={true}
          status={tenant.subscriptionStatus}
          tenantName={tenant.brandName || tenant.name}
          tenantSlug={tenant.slug}
          reason={access.reason}
        />
      )}
    </div>
  );
}
