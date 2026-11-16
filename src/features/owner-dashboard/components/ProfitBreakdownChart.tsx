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
    <div className="p-6 rounded-2xl bg-white border border-[#E8E5DE] shadow-[0_1px_3px_rgba(28,25,23,0.02)] space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
          <PieChart className="w-4 h-4 text-[#1E8E3E]" />
          Komposisi Alokasi Omzet Toko
        </h3>
        <span className="text-xs text-[#706E68]">
          Total Omzet: <strong className="text-[#1A1A1A] font-mono">{formatCurrency(grossRevenue)}</strong>
        </span>
      </div>

      {/* Segmented Progress Bar */}
      {grossRevenue > 0 ? (
        <div className="space-y-3">
          <div className="h-4 w-full bg-[#F6F5F2] border border-[#E8E5DE] rounded-full overflow-hidden flex shadow-inner">
            {/* Laba Bersih (Green) */}
            {profitPct > 0 && (
              <div
                style={{ width: `${profitPct}%` }}
                className="bg-[#1E8E3E] hover:opacity-90 transition-all cursor-pointer"
                title={`Laba Bersih: ${profitPct.toFixed(1)}% (${formatCurrency(netProfit)})`}
              />
            )}
            {/* Komisi Barber (Blue) */}
            {commissionPct > 0 && (
              <div
                style={{ width: `${commissionPct}%` }}
                className="bg-[#1A73E8] hover:opacity-90 transition-all cursor-pointer"
                title={`Komisi Barber: ${commissionPct.toFixed(1)}% (${formatCurrency(commissionExpense)})`}
              />
            )}
            {/* Kas Kecil (Amber) */}
            {pettyCashPct > 0 && (
              <div
                style={{ width: `${pettyCashPct}%` }}
                className="bg-[#D97706] hover:opacity-90 transition-all cursor-pointer"
                title={`Kas Kecil: ${pettyCashPct.toFixed(1)}% (${formatCurrency(pettyCashExpense)})`}
              />
            )}
            {/* Backbar Cost (Purple) */}
            {backbarPct > 0 && (
              <div
                style={{ width: `${backbarPct}%` }}
                className="bg-[#9333EA] hover:opacity-90 transition-all cursor-pointer"
                title={`Beban Meja Backbar: ${backbarPct.toFixed(1)}% (${formatCurrency(backbarCost)})`}
              />
            )}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#F6F5F2] border border-[#E8E5DE]">
              <span className="w-3 h-3 rounded-full bg-[#1E8E3E] shrink-0" />
              <div className="min-w-0">
                <div className="text-[#706E68] text-[11px]">Laba Bersih</div>
                <div className="font-bold text-[#1E8E3E] font-mono truncate">{profitPct.toFixed(1)}%</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#F6F5F2] border border-[#E8E5DE]">
              <span className="w-3 h-3 rounded-full bg-[#1A73E8] shrink-0" />
              <div className="min-w-0">
                <div className="text-[#706E68] text-[11px]">Komisi Barber</div>
                <div className="font-bold text-[#1A73E8] font-mono truncate">{commissionPct.toFixed(1)}%</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#F6F5F2] border border-[#E8E5DE]">
              <span className="w-3 h-3 rounded-full bg-[#D97706] shrink-0" />
              <div className="min-w-0">
                <div className="text-[#706E68] text-[11px]">Kas Kecil (Laci)</div>
                <div className="font-bold text-[#D97706] font-mono truncate">{pettyCashPct.toFixed(1)}%</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#F6F5F2] border border-[#E8E5DE]">
              <span className="w-3 h-3 rounded-full bg-[#9333EA] shrink-0" />
              <div className="min-w-0">
                <div className="text-[#706E68] text-[11px]">Beban Meja</div>
                <div className="font-bold text-[#9333EA] font-mono truncate">{backbarPct.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-[#F6F5F2] border border-[#E8E5DE] text-center text-xs text-[#706E68] flex items-center justify-center gap-2">
          <Info className="w-4 h-4 text-[#D97706]" />
          <span>Belum ada transaksi tiket lunas pada periode ini.</span>
        </div>
      )}
    </div>
  );
}
