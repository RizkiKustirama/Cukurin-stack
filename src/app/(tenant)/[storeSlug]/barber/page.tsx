import Link from "next/link";
import { requireAuth } from "@/shared/auth";
import { prisma } from "@/shared/db";
import { getBarberDailySummary } from "@/features/payroll/services/payrollService";
import { BarberPortalView } from "@/features/payroll/components/BarberPortalView";
import { Scissors, LogOut, LayoutDashboard, AlertCircle } from "lucide-react";

interface PageProps {
  params: Promise<{ storeSlug: string }>;
}

export default async function TenantBarberPage({ params }: PageProps) {
  const { storeSlug } = await params;
  const session = await requireAuth(["BARBER", "OWNER", "MANAGER", "CASHIER"]);

  // Cari barber profile berdasarkan userId
  let barberProfile = await prisma.barberProfile.findFirst({
    where: { userId: session.userId },
    include: { user: true },
  });

  // Jika owner/manager/kasir yang membuka, berikan profil barber pertama di cabang ini sebagai demo/preview
  if (!barberProfile) {
    const store = await prisma.store.findFirst({
      where: {
        tenant: { slug: storeSlug },
      },
    });

    if (store) {
      barberProfile = await prisma.barberProfile.findFirst({
        where: { storeId: store.id },
        include: { user: true },
      });
    }
  }

  if (!barberProfile) {
    return (
      <div className="min-h-screen bg-[#09090B] text-zinc-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold">Profil Barber Tidak Ditemukan</h2>
          <p className="text-xs text-zinc-400">
            Akun ini belum memiliki profil barber terdaftar di cabang /{storeSlug}.
          </p>
          <Link
            href={`/${storeSlug}/pos`}
            className="inline-block px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition"
          >
            Kembali ke POS
          </Link>
        </div>
      </div>
    );
  }

  const summary = await getBarberDailySummary(barberProfile.id);

  if (!summary) {
    return (
      <div className="min-h-screen bg-[#09090B] text-zinc-100 flex items-center justify-center p-4">
        <p className="text-xs text-zinc-400">Gagal memuat ringkasan komisi barber.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100">
      {/* Top Navbar */}
      <div className="border-b border-zinc-800/80 bg-zinc-950/80 sticky top-0 z-30 backdrop-blur-md px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center font-bold">
              <Scissors className="w-4 h-4 rotate-[-45deg]" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-zinc-200">Portal Barber</h1>
              <span className="text-[10px] text-zinc-500 font-mono">
                /{storeSlug}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(session.role === "OWNER" ||
              session.role === "MANAGER" ||
              session.role === "CASHIER") && (
              <Link
                href={`/${storeSlug}/pos`}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 font-medium transition"
              >
                POS Kasir
              </Link>
            )}
            <Link
              href="/logout"
              prefetch={false}
              className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 text-rose-300 transition"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-4">
        <BarberPortalView summary={summary} storeSlug={storeSlug} />
      </main>
    </div>
  );
}
