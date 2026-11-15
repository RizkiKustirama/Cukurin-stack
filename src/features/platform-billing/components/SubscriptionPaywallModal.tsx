import React from "react";
import { SubscriptionStatus } from "@prisma/client";
import { Lock, Check, Sparkles, MessageCircle, AlertOctagon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface SubscriptionPaywallModalProps {
  isOpen: boolean;
  status?: SubscriptionStatus;
  tenantName?: string;
  tenantSlug?: string;
  reason?: string;
  whatsappNumber?: string;
}

export function SubscriptionPaywallModal({
  isOpen,
  status = SubscriptionStatus.EXPIRED,
  tenantName = "Barbershop",
  tenantSlug = "",
  reason,
  whatsappNumber = "6281234567890",
}: SubscriptionPaywallModalProps) {
  if (!isOpen) return null;

  const isSuspended = status === SubscriptionStatus.SUSPENDED;

  const getWaLinkForPlan = (planName: string) => {
    const text = encodeURIComponent(
      `Halo Admin Cukurin, saya pemilik barbershop "${tenantName}" (Slug: ${tenantSlug || "-"}). Saya ingin mengaktifkan/berlangganan ${planName}. Mohon panduan pembayarannya.`
    );
    return `https://wa.me/${whatsappNumber}?text=${text}`;
  };

  const mainWaLink = encodeURIComponent(
    `Halo Admin Cukurin, saya ingin mengaktifkan langganan Cukurin untuk "${tenantName}" (Slug: ${tenantSlug || "-"}).`
  );

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 backdrop-blur-md p-4 sm:p-6"
    >
      <div className="relative w-full max-w-4xl bg-surface border border-border rounded-2xl shadow-2xl p-6 sm:p-8 my-auto text-foreground flex flex-col items-center">
        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center max-w-xl">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-primary">
            {isSuspended ? (
              <AlertOctagon className="h-7 w-7 text-rose-500" />
            ) : (
              <Lock className="h-7 w-7 text-primary" />
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {isSuspended ? "Akses Toko Ditangguhkan" : "Masa Langganan Berakhir"}
          </h2>

          <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
            {reason ||
              "Masa aktif atau percobaan gratis akun Anda telah selesai. Untuk terus menggunakan fitur kasir POS, antrean berjalan, dan buku kas, pilih paket di bawah ini."}
          </p>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full mt-8">
          {/* 1. Paket Reguler */}
          <div className="flex flex-col justify-between p-5 rounded-xl bg-background border border-border hover:border-amber-500/40 transition-all">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Pemula & Ruko Tunggal
              </span>
              <h3 className="text-lg font-bold text-foreground mt-1">Paket Reguler</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-black text-foreground">Rp 99.000</span>
                <span className="text-xs text-foreground-muted">/ bulan</span>
              </div>
              <p className="text-xs text-foreground-muted mt-2">
                Cocok untuk barbershop independen dengan 1 cabang.
              </p>

              <div className="mt-5 space-y-2.5 text-xs text-stone-300">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>1 Cabang Ruko</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Maksimal 5 Akun Barber</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Kasir POS & Tiket Digital</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Antrean FIFO Standar</span>
                </div>
              </div>
            </div>

            <a
              href={getWaLinkForPlan("Paket Reguler (Rp 99.000/bln)")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full text-center py-2.5 px-4 rounded-lg bg-surface border border-border hover:bg-surface-hover hover:border-amber-500/50 text-xs font-semibold text-foreground transition-colors"
            >
              Pilih Reguler
            </a>
          </div>

          {/* 2. Paket Pro (Paling Populer) */}
          <div className="relative flex flex-col justify-between p-5 rounded-xl bg-surface border-2 border-primary shadow-xl shadow-amber-500/10 scale-102">
            {/* Badge Paling Populer */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-stone-950 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow">
              <Sparkles className="h-3 w-3 fill-stone-950" />
              Paling Populer
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Bisnis Berkembang
              </span>
              <h3 className="text-lg font-bold text-foreground mt-1">Paket Pro</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-black text-primary">Rp 199.000</span>
                <span className="text-xs text-foreground-muted">/ bulan</span>
              </div>
              <p className="text-xs text-foreground-muted mt-2">
                Pilihan utama barbershop modern dengan pengelolaan lengkap.
              </p>

              <div className="mt-5 space-y-2.5 text-xs text-stone-200">
                <div className="flex items-center gap-2 font-medium">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>2 Cabang Ruko Aktif</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Maksimal 10 Akun Barber</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Smart Queue (Prioritas CRM)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Laporan Keuangan & Buku Kas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Kalkulasi Komisi & Gaji Barber</span>
                </div>
              </div>
            </div>

            <a
              href={getWaLinkForPlan("Paket Pro (Rp 199.000/bln)")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full text-center py-2.5 px-4 rounded-lg bg-primary hover:bg-amber-500 text-xs font-bold text-stone-950 transition-colors shadow-md"
            >
              Pilih Paket Pro
            </a>
          </div>

          {/* 3. Paket Enterprise */}
          <div className="flex flex-col justify-between p-5 rounded-xl bg-background border border-border hover:border-amber-500/40 transition-all">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Jaringan Cabang (Chain)
              </span>
              <h3 className="text-lg font-bold text-foreground mt-1">Paket Enterprise</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-black text-foreground">Hubungi Kami</span>
              </div>
              <p className="text-xs text-foreground-muted mt-2">
                Solusi kustom untuk barbershop multi-cabang & franchise.
              </p>

              <div className="mt-5 space-y-2.5 text-xs text-stone-300">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Multi-cabang Ruko Unlimited</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Jumlah Barber Tanpa Batas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Custom Domain & Brand Whitelabel</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Prioritas CS WhatsApp Dedicated</span>
                </div>
              </div>
            </div>

            <a
              href={getWaLinkForPlan("Paket Enterprise (Custom Hubungi Kami)")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full text-center py-2.5 px-4 rounded-lg bg-surface border border-border hover:bg-surface-hover hover:border-amber-500/50 text-xs font-semibold text-foreground transition-colors"
            >
              Konsultasi Enterprise
            </a>
          </div>
        </div>

        {/* Primary Global Action Button */}
        <div className="mt-8 w-full max-w-md flex flex-col items-center">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${mainWaLink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-6 rounded-xl bg-primary hover:bg-amber-500 text-stone-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
          >
            <MessageCircle className="h-5 w-5 fill-stone-950" />
            <span>Aktifkan Langganan Sekarang</span>
          </a>

          <p className="mt-2.5 text-center text-xs text-foreground-muted">
            Aktivasi langsung diproses oleh tim Cukurin via WhatsApp resmi dalam hitungan menit.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionPaywallModal;
