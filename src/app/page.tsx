import { Scissors, ShieldCheck, Smartphone, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[var(--primary)] text-white rounded-lg">
            <Scissors className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[var(--foreground)]">
            Cukurin<span className="text-[var(--primary)]">.app</span>
          </span>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--surface)] text-[var(--primary)] border border-[var(--border)] font-medium">
          Mobile-First POS & Queue SaaS
        </span>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 flex flex-col items-center text-center justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--foreground-muted)] mb-6">
          <Zap className="w-3.5 h-3.5 text-[var(--primary)]" />
          <span>Fase 1 Selesai: Fondasi, Multi-Tenant Database & Arsitektur</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-2xl leading-tight">
          Solusi Manajemen & POS Modern untuk{" "}
          <span className="text-[var(--primary)]">Barbershop Indonesia</span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-[var(--foreground-muted)] max-w-xl">
          Dirancang khusus untuk ritme kerja ruko yang sibuk. Ergonomi satu jempol untuk kasir,
          portal komisi transparan untuk barber, dan antrean pintar bebas antre panjang.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 w-full text-left">
          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors">
            <div className="p-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)] w-fit mb-3 text-[var(--primary)]">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-[var(--foreground)]">Mobile-First PWA</h3>
            <p className="text-xs text-[var(--foreground-muted)] mt-1.5 leading-relaxed">
              Didesain portrait 360px–430px dengan Bottom Navigation Bar dan One-Thumb Ergonomics.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors">
            <div className="p-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)] w-fit mb-3 text-[var(--status-ready)]">
              <Scissors className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-[var(--foreground)]">Mesin Antrean Pintar</h3>
            <p className="text-xs text-[var(--foreground-muted)] mt-1.5 leading-relaxed">
              Mendukung mode Loyalitas Pelanggan (Request Barber) dan mode Strict FIFO.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors">
            <div className="p-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)] w-fit mb-3 text-[var(--primary)]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-[var(--foreground)]">Multi-Tenant Row Level</h3>
            <p className="text-xs text-[var(--foreground-muted)] mt-1.5 leading-relaxed">
              Isolasi data ketat berbasis tenant_id dengan Prisma Client Extension di Neon.tech.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--foreground-muted)]">
        &copy; 2026 Cukurin — Warm Modern Barbershop SaaS. All rights reserved.
      </footer>
    </div>
  );
}
