import { requireAuth } from "@/shared/auth";
import { getSuperadminDashboardData } from "@/features/superadmin/services/superadminService";
import { SuperadminDashboardView } from "@/features/superadmin/components/SuperadminDashboardView";

export const dynamic = "force-dynamic";

export default async function AdminPlatformPage() {
  const session = await requireAuth(["SUPERADMIN", "PLATFORM_ADMIN"]);

  const dashboardData = await getSuperadminDashboardData();

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 sm:p-6 lg:p-8 antialiased selection:bg-purple-600 selection:text-white">
      <div className="max-w-7xl mx-auto">
        <SuperadminDashboardView
          initialData={dashboardData}
          userName={session.name}
          userRole={session.role}
        />
      </div>
    </div>
  );
}
