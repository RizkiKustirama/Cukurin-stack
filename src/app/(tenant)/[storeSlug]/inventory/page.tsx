import { notFound } from "next/navigation";
import { requireAuth } from "@/shared/auth";
import { rawPrisma } from "@/shared/db";
import {
  getStoreInventory,
  getBackbarConsumptions,
} from "@/features/inventory/services/inventoryService";
import { InventoryDashboardView } from "@/features/inventory/components/InventoryDashboardView";
import { TenantResponsiveShell } from "@/shared/components/TenantResponsiveShell";

interface PageProps {
  params: Promise<{ storeSlug: string }>;
}

export default async function TenantInventoryPage({ params }: PageProps) {
  const { storeSlug } = await params;
  const session = await requireAuth(["OWNER", "MANAGER", "CASHIER", "SUPERADMIN"]);

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

  const [{ products, metrics }, consumptions] = await Promise.all([
    getStoreInventory(store.id),
    getBackbarConsumptions(store.id, 50),
  ]);

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
      <InventoryDashboardView
        storeId={store.id}
        storeSlug={storeSlug}
        storeName={store.name}
        products={products}
        metrics={metrics}
        consumptions={consumptions}
      />
    </TenantResponsiveShell>
  );
}
