import Link from "next/link";
import { requireAuth } from "@/shared/auth";
import { Scissors, LogOut, LayoutDashboard, Wallet, UserCheck, Clock } from "lucide-react";

interface PageProps {
  params: Promise<{ storeSlug: string }>;
}

export default async function TenantBarberPage({ params }: PageProps) {
  const { storeSlug } = await params;
  const session = await requireAuth(["BARBER", "OWNER", "MANAGER"]);

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Scissors className="w-6 h-6 rotate-[-45deg]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[var(--foreground)]">
                  Portal Barber / Kapster
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  {session.role}
                </span>
              </div>
              <p className="text-xs text-[var(--foreground-muted)]">
                Barbershop: <span className="text-blue-400 font-mono">/{storeSlug}</span> • Barber: {session.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {(session.role === "OWNER" || session.role === "MANAGER") && (
              <Link
                href={`/${storeSlug}/dashboard`}
                className="px-3.5 py-2.5 rounded-xl bg-[var(--background)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs text-[var(--foreground)] font-medium flex items-center gap-1.5 transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-amber-500" />
                <span>Dashboard</span>
              </Link>
            )}
            <Link
              href="/logout"
              prefetch={false}
              className="px-4 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-800/50 text-red-300 text-xs font-medium flex items-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </Link>
          </div>
        </header>

        {/* Mobile Ergonomic Cards Preview according to DESIGN_SYSTEM.md */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
            <div className="flex items-center justify-between text-[var(--foreground-muted)] text-xs mb-2">
              <span>Estimasi Komisi Hari Ini</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">
              Rp 175.000
            </div>
            <p className="text-[11px] text-[var(--foreground-muted)] mt-1">
              Jasa: Rp 150rb • Produk: Rp 15rb • Tip: Rp 10rb
            </p>
          </div>

          <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
            <div className="flex items-center justify-between text-[var(--foreground-muted)] text-xs mb-2">
              <span>Pelanggan Hari Ini</span>
              <UserCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-[var(--foreground)]">
              7 Orang
            </div>
            <p className="text-[11px] text-[var(--foreground-muted)] mt-1">
              Rata-rata durasi potong: 28 menit
            </p>
          </div>

          <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
            <div className="flex items-center justify-between text-[var(--foreground-muted)] text-xs mb-2">
              <span>Status Kerja Meja</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-[var(--status-ready)] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[var(--status-ready)] animate-pulse" />
              <span>READY</span>
            </div>
            <p className="text-[11px] text-[var(--foreground-muted)] mt-1">
              Siap menerima giliran potong berikutnya
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
