import Link from "next/link";
import { requireAuth } from "@/shared/auth";
import { Receipt, LogOut, LayoutDashboard, ShoppingCart, Scissors, Users } from "lucide-react";

interface PageProps {
  params: Promise<{ storeSlug: string }>;
}

export default async function TenantPOSPage({ params }: PageProps) {
  const { storeSlug } = await params;
  const session = await requireAuth(["OWNER", "MANAGER", "CASHIER"]);

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[var(--foreground)]">
                  POS & Kasir Barbershop
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {session.role}
                </span>
              </div>
              <p className="text-xs text-[var(--foreground-muted)]">
                Cabang: <span className="text-emerald-400 font-mono">/{storeSlug}</span> • Kasir: {session.name}
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

        {/* Placeholder Content */}
        <div className="p-8 bg-[var(--surface)] border border-[var(--border)] rounded-2xl text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Modul Kasir & POS Cukurin
          </h2>
          <p className="text-sm text-[var(--foreground-muted)] max-w-md mx-auto leading-relaxed">
            Halaman ini siap menerima modul transaksi cepat kasir, antrean tiket aktif, kalkulator bayar (Cash, QRIS, Transfer), dan pencatatan kas kecil harian.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <Link
              href={`/${storeSlug}/queue`}
              className="px-4 py-2.5 bg-[var(--background)] hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl text-xs font-medium text-[var(--foreground)] flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-purple-400" />
              <span>Lihat Antrean Publik</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
