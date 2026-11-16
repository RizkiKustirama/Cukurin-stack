import { notFound } from "next/navigation";
import { requireAuth } from "@/shared/auth";
import { rawPrisma } from "@/shared/db";
import { getStoreAssets } from "@/features/assets/services/assetService";
import { AssetsDashboardView } from "@/features/assets/components/AssetsDashboardView";
import { TenantResponsiveShell } from "@/shared/components/TenantResponsiveShell";

interface PageProps {
  params: Promise<{ storeSlug: string }>;
}

export default async function TenantAssetsPage({ params }: PageProps) {
  const { storeSlug } = await params;
  const session = await requireAuth(["OWNER", "MANAGER", "CASHIER", "SUPERADMIN"]);

  const tenant = await rawPrisma.tenant.findUnique({
    where: { slug: storeSlug },
    include: {
      stores: {
        take: 1,
        include: {
          barberProfiles: {
            include: {
              user: { select: { name: true } },
            },
            orderBy: { user: { name: "asc" } },
          },
        },
      },
    },
  });

  if (!tenant || tenant.stores.length === 0) {
    notFound();
  }

  const store = tenant.stores[0];

  const { assets, metrics } = await getStoreAssets(store.id);

  const barbersList = store.barberProfiles.map((b) => ({
    id: b.id,
    name: b.user.name,
  }));

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
      <AssetsDashboardView
        storeId={store.id}
        storeSlug={storeSlug}
        storeName={store.name}
        assets={assets}
        metrics={metrics}
        barbers={barbersList}
      />
    </TenantResponsiveShell>
  );
}
