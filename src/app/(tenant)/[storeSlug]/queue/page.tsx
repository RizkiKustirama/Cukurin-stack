import Link from "next/link";
import { Scissors, ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ storeSlug: string }>;
}

export default async function TenantQueuePage({ params }: PageProps) {
  const { storeSlug } = await params;

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 sm:p-8 flex flex-col justify-between">
      <header className="flex items-center justify-between p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Scissors className="w-5 h-5 rotate-[-45deg]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[var(--foreground)]">
              Layar Antrean Publik ({storeSlug})
            </h1>
            <p className="text-xs text-[var(--foreground-muted)]">
              Display TV Ruang Tunggu Barbershop
            </p>
          </div>
        </div>
        <Link
          href={`/${storeSlug}/dashboard`}
          className="px-3.5 py-2 bg-[var(--background)] hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl text-xs text-[var(--foreground-muted)] flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali</span>
        </Link>
      </header>

      <div className="py-20 text-center space-y-3">
        <div className="inline-flex px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          ● Display Antrean Aktif
        </div>
        <h2 className="text-2xl font-bold text-[var(--foreground)]">
          Belum ada antrean berjalan saat ini
        </h2>
        <p className="text-xs text-[var(--foreground-muted)] max-w-sm mx-auto">
          Silakan lakukan check-in nomor antrean di kasir untuk mulai potong rambut.
        </p>
      </div>

      <footer className="text-center text-[11px] text-[var(--foreground-muted)] py-4">
        Powered by Cukurin.app — Smart Queue Engine
      </footer>
    </div>
  );
}
