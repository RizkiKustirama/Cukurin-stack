import { requireAuth } from "@/shared/auth";
import { getSuperadminDashboardData } from "@/features/superadmin/services/superadminService";
import { SuperadminDashboardView } from "@/features/superadmin/components/SuperadminDashboardView";

export const dynamic = "force-dynamic";

export default async function AdminPlatformPage() {
  const session = await requireAuth(["SUPERADMIN", "PLATFORM_ADMIN"]);

  const dashboardData = await getSuperadminDashboardData();

  return (
    <SuperadminDashboardView
      initialData={dashboardData}
      userName={session.name}
      userRole={session.role}
    />
  );
}
