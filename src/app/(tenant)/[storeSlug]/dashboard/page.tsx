import { notFound } from "next/navigation";
import { requireAuth } from "@/shared/auth";
import { rawPrisma } from "@/shared/db";
import { getStoreExecutiveDashboardData } from "@/features/owner-dashboard/services/ownerDashboardService";
import { OwnerDashboardView } from "@/features/owner-dashboard/components/OwnerDashboardView";
import { TenantResponsiveShell } from "@/shared/components/TenantResponsiveShell";
import type { DashboardPeriod } from "@/features/owner-dashboard/types";

interface PageProps {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ period?: string }>;
}

export default async function TenantDashboardPage({
  params,
  searchParams,
}: PageProps) {
  const { storeSlug } = await params;
  const { period: periodParam } = await searchParams;

  // Dashboard rekap bisnis hanya diperuntukkan untuk OWNER (dan SUPERADMIN)
  const session = await requireAuth(["OWNER", "SUPERADMIN"]);

  const tenant = await rawPrisma.tenant.findUnique({
    where: { slug: storeSlug },
    include: {
      stores: {
        take: 1,
      },
    },
  });

  if (!tenant || tenant.stores.length === 0) {
    notFound();
  }

  const store = tenant.stores[0];

  const validPeriods: DashboardPeriod[] = ["TODAY", "LAST_7_DAYS", "LAST_30_DAYS"];
  const period: DashboardPeriod = validPeriods.includes(periodParam as DashboardPeriod)
    ? (periodParam as DashboardPeriod)
    : "TODAY";

  const dashboardData = await getStoreExecutiveDashboardData(store.id, period);

  return (
    <TenantResponsiveShell
      storeSlug={storeSlug}
      storeName={store.name}
      brandName={tenant.brandName || tenant.name}
      user={{
        name: session.name,
        role: session.role,
        email: session.email,
        phone: session.phone,
      }}
    >
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <OwnerDashboardView
          initialData={dashboardData}
          storeSlug={storeSlug}
          userName={session.name}
          userRole={session.role}
        />
      </div>
    </TenantResponsiveShell>
  );
}
