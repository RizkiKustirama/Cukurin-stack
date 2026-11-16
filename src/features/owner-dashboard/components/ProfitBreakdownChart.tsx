"use client";

import { PieChart, Info } from "lucide-react";
import type { ExecutiveFinancialMetrics } from "../types";

interface ProfitBreakdownChartProps {
  metrics: ExecutiveFinancialMetrics;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProfitBreakdownChart({ metrics }: ProfitBreakdownChartProps) {
  const { grossRevenue, commissionExpense, pettyCashExpense, backbarCost, netProfit } = metrics;

  // Persentase terhadap Omzet Kotor (jika omzet > 0)
  const safeGross = grossRevenue > 0 ? grossRevenue : 1;
  const commissionPct = Math.max(0, Math.min(100, (commissionExpense / safeGross) * 100));
  const pettyCashPct = Math.max(0, Math.min(100, (pettyCashExpense / safeGross) * 100));
  const backbarPct = Math.max(0, Math.min(100, (backbarCost / safeGross) * 100));
  const profitPct = Math.max(0, Math.min(100, (netProfit / safeGross) * 100));

  return (
    <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-md space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
          <PieChart className="w-4 h-4 text-emerald-400" />
          Komposisi Alokasi Omzet Toko
        </h3>
        <span className="text-xs text-[var(--foreground-muted)]">
          Total Omzet: <strong className="text-[var(--foreground)]">{formatCurrency(grossRevenue)}</strong>
        </span>
      </div>

      {/* Segmented Progress Bar */}
      {grossRevenue > 0 ? (
        <div className="space-y-3">
          <div className="h-4 w-full bg-zinc-800 rounded-full overflow-hidden flex shadow-inner">
            {/* Laba Bersih (Green) */}
            {profitPct > 0 && (
              <div
                style={{ width: `${profitPct}%` }}
                className="bg-emerald-500 hover:bg-emerald-400 transition-all cursor-pointer"
                title={`Laba Bersih: ${profitPct.toFixed(1)}% (${formatCurrency(netProfit)})`}
              />
            )}
            {/* Komisi Barber (Blue) */}
            {commissionPct > 0 && (
              <div
                style={{ width: `${commissionPct}%` }}
                className="bg-blue-500 hover:bg-blue-400 transition-all cursor-pointer"
                title={`Komisi Barber: ${commissionPct.toFixed(1)}% (${formatCurrency(commissionExpense)})`}
              />
            )}
            {/* Kas Kecil (Amber) */}
            {pettyCashPct > 0 && (
              <div
                style={{ width: `${pettyCashPct}%` }}
                className="bg-amber-500 hover:bg-amber-400 transition-all cursor-pointer"
                title={`Kas Kecil: ${pettyCashPct.toFixed(1)}% (${formatCurrency(pettyCashExpense)})`}
              />
            )}
            {/* Backbar Cost (Purple) */}
            {backbarPct > 0 && (
              <div
                style={{ width: `${backbarPct}%` }}
                className="bg-purple-500 hover:bg-purple-400 transition-all cursor-pointer"
                title={`Beban Meja Backbar: ${backbarPct.toFixed(1)}% (${formatCurrency(backbarCost)})`}
              />
            )}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-[var(--foreground-muted)] text-[11px]">Laba Bersih</div>
                <div className="font-semibold text-emerald-400 truncate">{profitPct.toFixed(1)}%</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <span className="w-3 h-3 rounded-sm bg-blue-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-[var(--foreground-muted)] text-[11px]">Komisi Barber</div>
                <div className="font-semibold text-blue-400 truncate">{commissionPct.toFixed(1)}%</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <span className="w-3 h-3 rounded-sm bg-amber-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-[var(--foreground-muted)] text-[11px]">Kas Kecil (Laci)</div>
                <div className="font-semibold text-amber-400 truncate">{pettyCashPct.toFixed(1)}%</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <span className="w-3 h-3 rounded-sm bg-purple-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-[var(--foreground-muted)] text-[11px]">Beban Meja</div>
                <div className="font-semibold text-purple-400 truncate">{backbarPct.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-[var(--background)] border border-[var(--border)] text-center text-xs text-[var(--foreground-muted)] flex items-center justify-center gap-2">
          <Info className="w-4 h-4 text-amber-400" />
          <span>Belum ada transaksi tiket lunas pada periode ini.</span>
        </div>
      )}
    </div>
  );
}
