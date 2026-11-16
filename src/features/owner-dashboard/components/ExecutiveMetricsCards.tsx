"use client";

import { DollarSign, Scissors, Receipt, Package, TrendingUp, Vault } from "lucide-react";
import type { ExecutiveFinancialMetrics } from "../types";

interface ExecutiveMetricsCardsProps {
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

export function ExecutiveMetricsCards({ metrics }: ExecutiveMetricsCardsProps) {
  const isProfitPositive = metrics.netProfit >= 0;

  return (
    <div className="space-y-4">
      {/* Top Highlight: Laba Bersih & Brankas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Net Profit Card */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isProfitPositive
              ? "bg-gradient-to-br from-emerald-950/40 via-[var(--surface)] to-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-950/20"
              : "bg-gradient-to-br from-rose-950/40 via-[var(--surface)] to-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/20"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold tracking-wide uppercase text-[var(--foreground-muted)] flex items-center gap-1.5">
              <TrendingUp className={`w-4 h-4 ${isProfitPositive ? "text-emerald-400" : "text-rose-400"}`} />
              Laba Bersih Toko (Net Profit)
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isProfitPositive
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-300 border-rose-500/30"
              }`}
            >
              Margin: {metrics.profitMarginPct}%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                isProfitPositive ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {formatCurrency(metrics.netProfit)}
            </div>
          </div>
          <p className="text-xs text-[var(--foreground-muted)] mt-2">
            Formula: Omzet Kotor ({formatCurrency(metrics.grossRevenue)}) dikurangi total beban (
            {formatCurrency(metrics.totalExpenses)})
          </p>
        </div>

        {/* Vault Balance Card */}
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold tracking-wide uppercase text-[var(--foreground-muted)] flex items-center gap-1.5">
              <Vault className="w-4 h-4 text-amber-400" />
              Saldo Brankas Toko (Vault)
            </span>
            <span className="text-[11px] font-medium text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Kas Utama Toko
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">
            {formatCurrency(metrics.vaultBalance)}
          </div>
          <p className="text-xs text-[var(--foreground-muted)] mt-2">
            Sumber modal laci buka kasir pagi & muara setoran tutup kasir malam.
          </p>
        </div>
      </div>

      {/* Grid 4 Cards: Omzet & 3 Pos Beban */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Omzet Kotor */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[var(--foreground-muted)] mb-1.5">
              <span>Omzet Kotor</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-[var(--foreground)]">
              {formatCurrency(metrics.grossRevenue)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[var(--border)]/60 text-[11px] text-[var(--foreground-muted)] space-y-0.5">
            <div className="flex justify-between">
              <span>Jasa ({metrics.completedTicketsCount} tiket):</span>
              <span className="text-[var(--foreground)] font-medium">
                {formatCurrency(metrics.serviceRevenue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Retail Pomade/Produk:</span>
              <span className="text-[var(--foreground)] font-medium">
                {formatCurrency(metrics.productRevenue)}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Beban Komisi Barber */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[var(--foreground-muted)] mb-1.5">
              <span>Beban Komisi Barber</span>
              <Scissors className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-blue-400">
              {formatCurrency(metrics.commissionExpense)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[var(--border)]/60 text-[11px] text-[var(--foreground-muted)]">
            <span>
              {metrics.grossRevenue > 0
                ? `${((metrics.commissionExpense / metrics.grossRevenue) * 100).toFixed(1)}% dari omzet`
                : "Beban jasa & bonus retail"}
            </span>
          </div>
        </div>

        {/* 3. Beban Kas Kecil (Petty Cash) */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[var(--foreground-muted)] mb-1.5">
              <span>Beban Kas Kecil (Laci)</span>
              <Receipt className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-amber-400">
              {formatCurrency(metrics.pettyCashExpense)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[var(--border)]/60 text-[11px] text-[var(--foreground-muted)]">
            <span>Operasional dadakan kasir</span>
          </div>
        </div>

        {/* 4. Beban Backbar Meja */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[var(--foreground-muted)] mb-1.5">
              <span>Beban Meja (Backbar)</span>
              <Package className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-purple-400">
              {formatCurrency(metrics.backbarCost)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[var(--border)]/60 text-[11px] text-[var(--foreground-muted)]">
            <span>Modal HPP barang meja cukur</span>
          </div>
        </div>
      </div>
    </div>
  );
}
