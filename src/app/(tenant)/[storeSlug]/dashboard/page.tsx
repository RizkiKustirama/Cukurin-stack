import Link from "next/link";
import { requireAuth } from "@/shared/auth";
import { Crown, LogOut, LayoutDashboard, Store, Scissors, Receipt } from "lucide-react";

interface PageProps {
  params: Promise<{ storeSlug: string }>;
}

export default async function TenantDashboardPage({ params }: PageProps) {
  const { storeSlug } = await params;
  const session = await requireAuth(["OWNER", "MANAGER"]);

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[var(--foreground)]">
                  {session.brandName || "Barbershop"} Dashboard
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {session.role}
                </span>
              </div>
              <p className="text-xs text-[var(--foreground-muted)]">
                Slug Toko: <span className="text-amber-400 font-mono">/{storeSlug}</span> • Pengguna: {session.name}
              </p>
            </div>
          </div>

          <Link
            href="/logout"
            prefetch={false}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-800/50 text-red-300 text-xs font-medium flex items-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar (Logout)</span>
          </Link>
        </header>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href={`/${storeSlug}/pos`}
            className="p-5 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Receipt className="w-5 h-5" />
              </div>
              <span className="text-xs text-emerald-400 font-medium group-hover:translate-x-1 transition-transform">
                Buka Kasir →
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[var(--foreground)]">Kasir POS</h3>
              <p className="text-xs text-[var(--foreground-muted)] mt-1">
                Input tiket cukur, beli pomade, dan checkout pembayaran.
              </p>
            </div>
          </Link>

          <Link
            href={`/${storeSlug}/barber`}
            className="p-5 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Scissors className="w-5 h-5" />
              </div>
              <span className="text-xs text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                Buka Portal →
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[var(--foreground)]">Portal Barber</h3>
              <p className="text-xs text-[var(--foreground-muted)] mt-1">
                Monitor status kerja barber dan komisi harian.
              </p>
            </div>
          </Link>

          <Link
            href={`/${storeSlug}/queue`}
            className="p-5 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Store className="w-5 h-5" />
              </div>
              <span className="text-xs text-purple-400 font-medium group-hover:translate-x-1 transition-transform">
                Layar Publik →
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[var(--foreground)]">Display Antrean</h3>
              <p className="text-xs text-[var(--foreground-muted)] mt-1">
                Tampilan layar TV antrean publik untuk ruang tunggu.
              </p>
            </div>
          </Link>
        </div>

        {/* Session details */}
        <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-amber-500" />
            <span>Detail Sesi Terproteksi RBAC</span>
          </h2>
          <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] font-mono text-xs text-[var(--foreground-muted)] space-y-1">
            <div><strong>User ID:</strong> {session.userId}</div>
            <div><strong>Role:</strong> {session.role}</div>
            <div><strong>Tenant ID:</strong> {session.tenantId}</div>
            <div><strong>Store Slug:</strong> {session.storeSlug}</div>
            <div><strong>Is Onboarded:</strong> {session.isOnboarded ? "Ya" : "Belum"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
