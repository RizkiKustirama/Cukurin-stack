import React from "react";
import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/shared/auth";
import { rawPrisma } from "@/shared/db";
import { OnboardingWizard } from "@/features/tenant-branding";

interface OnboardingPageProps {
  params: Promise<{
    storeSlug: string;
  }>;
}

export const dynamic = "force-dynamic";


/**
 * Server Component for Tenant Onboarding Wizard.
 * Authenticates OWNER role, loads current store/tenant defaults, and mounts the wizard.
 */
export default async function OnboardingPage({ params }: OnboardingPageProps) {
  // 1. Guard route: Only authenticated OWNER can access onboarding
  await requireAuth(["OWNER"]);

  // 2. Resolve asynchronous dynamic route parameters (Next.js 15+)
  const { storeSlug } = await params;

  // 3. Query tenant and initial store profile from database
  const tenant = await rawPrisma.tenant.findUnique({
    where: { slug: storeSlug },
    include: {
      stores: true,
    },
  });

  if (!tenant) {
    notFound();
  }

  // 4. If already onboarded, bypass wizard and redirect directly to dashboard
  if (tenant.isOnboarded) {
    redirect(`/${storeSlug}/dashboard`);
  }

  const primaryStore = tenant.stores[0];

  const initialData = {
    brandName: tenant.brandName || primaryStore?.name || tenant.name,
    phone: primaryStore?.phone || "",
    address: primaryStore?.address || "",
    logoUrl: tenant.logoUrl || "",
    primaryColor: tenant.primaryColor || "#d97706",
  };

  return (
    <main className="min-h-screen bg-[#181614] text-[#f5f4f0] flex flex-col justify-center py-6 sm:py-12">
      <OnboardingWizard initialData={initialData} storeSlug={storeSlug} />
    </main>
  );
}
