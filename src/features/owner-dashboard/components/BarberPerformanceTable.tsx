"use client";

import { Users, Scissors, Award, Phone } from "lucide-react";
import type { BarberPerformanceSummary } from "../types";
import { BarberWorkStatus } from "@prisma/client";

interface BarberPerformanceTableProps {
  barbers: BarberPerformanceSummary[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusBadge(status: BarberWorkStatus) {
  switch (status) {
    case "READY":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Ready
        </span>
      );
    case "BUSY":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/15 text-orange-300 border border-orange-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
          Sedang Cukur
        </span>
      );
    case "BREAK":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Istirahat
        </span>
      );
    case "OFFLINE":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-500/15 text-zinc-400 border border-zinc-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
          Offline
        </span>
      );
  }
}

export function BarberPerformanceTable({ barbers }: BarberPerformanceTableProps) {
  if (barbers.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-center text-xs text-[var(--foreground-muted)]">
        Belum ada profil barber terdaftar di cabang toko ini.
      </div>
    );
  }

  const totalHeads = barbers.reduce((sum, b) => sum + b.completedHeadCount, 0);
  const totalBarberCommission = barbers.reduce((sum, b) => sum + b.totalCommissionEarned, 0);

  return (
    <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            Laporan Kinerja & Produktivitas Barber
          </h3>
          <p className="text-xs text-[var(--foreground-muted)]">
            Total {barbers.length} barber • {totalHeads} kepala selesai dipotong • Komisi:{" "}
            {formatCurrency(totalBarberCommission)}
          </p>
        </div>
      </div>

      {/* Tampilan Desktop: Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--foreground-muted)] font-semibold">
              <th className="py-2.5 px-3">Barber</th>
              <th className="py-2.5 px-3">Status Saat Ini</th>
              <th className="py-2.5 px-3 text-center">Kepala Cukur</th>
              <th className="py-2.5 px-3 text-right">Omzet Jasa</th>
              <th className="py-2.5 px-3 text-right">Omzet Produk</th>
              <th className="py-2.5 px-3 text-right">Komisi Dihasilkan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/60">
            {barbers.map((b, idx) => (
              <tr key={b.barberId} className="hover:bg-[var(--surface-hover)] transition-colors">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--foreground)]">{b.name}</div>
                      <div className="text-[11px] text-[var(--foreground-muted)] flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {b.phone}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3">{getStatusBadge(b.workStatus)}</td>
                <td className="py-3 px-3 text-center">
                  <span className="font-bold text-[var(--foreground)] px-2.5 py-1 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                    {b.completedHeadCount}
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-medium text-[var(--foreground)]">
                  {formatCurrency(b.serviceRevenue)}
                </td>
                <td className="py-3 px-3 text-right font-medium text-[var(--foreground)]">
                  {formatCurrency(b.productRevenue)}
                </td>
                <td className="py-3 px-3 text-right">
                  <span className="font-bold text-blue-400">
                    {formatCurrency(b.totalCommissionEarned)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tampilan Mobile: Card List */}
      <div className="md:hidden space-y-3">
        {barbers.map((b, idx) => (
          <div
            key={b.barberId}
            className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold text-xs">
                  {idx + 1}
                </span>
                <div>
                  <div className="font-bold text-sm text-[var(--foreground)]">{b.name}</div>
                  <div className="text-[11px] text-[var(--foreground-muted)]">{b.phone}</div>
                </div>
              </div>
              <div>{getStatusBadge(b.workStatus)}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[var(--border)]/60">
              <div>
                <span className="text-[var(--foreground-muted)] block text-[11px]">Kepala Cukur:</span>
                <span className="font-bold text-[var(--foreground)]">{b.completedHeadCount} Layanan</span>
              </div>
              <div>
                <span className="text-[var(--foreground-muted)] block text-[11px]">Komisi Earned:</span>
                <span className="font-bold text-blue-400">
                  {formatCurrency(b.totalCommissionEarned)}
                </span>
              </div>
              <div>
                <span className="text-[var(--foreground-muted)] block text-[11px]">Omzet Jasa:</span>
                <span className="font-medium text-[var(--foreground)]">{formatCurrency(b.serviceRevenue)}</span>
              </div>
              <div>
                <span className="text-[var(--foreground-muted)] block text-[11px]">Omzet Produk:</span>
                <span className="font-medium text-[var(--foreground)]">{formatCurrency(b.productRevenue)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
