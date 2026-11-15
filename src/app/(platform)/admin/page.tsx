import Link from "next/link";
import { requireAuth } from "@/shared/auth";
import { ShieldCheck, LogOut, ArrowLeft, Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPlatformPage() {
  const session = await requireAuth(["SUPERADMIN", "PLATFORM_ADMIN"]);

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[var(--foreground)]">
                  Platform Admin Portal
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  {session.role}
                </span>
              </div>
              <p className="text-xs text-[var(--foreground-muted)]">
                Selamat datang, {session.name} ({session.email || session.phone})
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

        {/* Info Card */}
        <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
          <h2 className="text-base font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-500" />
            <span>Status Platform SaaS Cukurin</span>
          </h2>
          <p className="text-sm text-[var(--foreground-muted)] leading-relaxed mb-4">
            Anda berhasil masuk ke portal Superadmin / Platform Admin. Dari sini Anda dapat memonitor seluruh tenant, aktivasi langganan barbershop, dan audit keamanan.
          </p>
          <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] font-mono text-xs text-[var(--foreground-muted)] space-y-1">
            <div><strong>User ID:</strong> {session.userId}</div>
            <div><strong>Role:</strong> {session.role}</div>
            <div><strong>Session Status:</strong> Aktif & Terverifikasi (JWT)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
