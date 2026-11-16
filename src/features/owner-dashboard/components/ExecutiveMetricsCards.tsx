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
        <div className="p-6 rounded-2xl bg-white border border-[#E8E5DE] shadow-[0_1px_3px_rgba(28,25,23,0.02)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold tracking-wide uppercase text-[#706E68] flex items-center gap-1.5">
              <TrendingUp className={`w-4 h-4 ${isProfitPositive ? "text-[#1E8E3E]" : "text-[#D93025]"}`} />
              Laba Bersih Toko (Net Profit)
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isProfitPositive
                  ? "bg-[#E8F7EE] text-[#1E8E3E] border-[#CEEAD6]"
                  : "bg-[#FDF0F2] text-[#D93025] border-[#FCDAD7]"
              }`}
            >
              Margin: {metrics.profitMarginPct}%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-mono ${
                isProfitPositive ? "text-[#1E8E3E]" : "text-[#D93025]"
              }`}
            >
              {formatCurrency(metrics.netProfit)}
            </div>
          </div>
          <p className="text-xs text-[#706E68] mt-2">
            Formula: Omzet Kotor ({formatCurrency(metrics.grossRevenue)}) dikurangi total beban (
            {formatCurrency(metrics.totalExpenses)})
          </p>
        </div>

        {/* Vault Balance Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8E5DE] shadow-[0_1px_3px_rgba(28,25,23,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold tracking-wide uppercase text-[#706E68] flex items-center gap-1.5">
              <Vault className="w-4 h-4 text-[#D97706]" />
              Saldo Brankas Toko (Vault)
            </span>
            <span className="text-[11px] font-semibold text-[#D97706] bg-[#FEF3EB] px-2.5 py-0.5 rounded-full border border-[#FDE6D2]">
              Kas Utama Toko
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] font-mono tracking-tight">
            {formatCurrency(metrics.vaultBalance)}
          </div>
          <p className="text-xs text-[#706E68] mt-2">
            Sumber modal laci buka kasir pagi & muara setoran tutup kasir malam.
          </p>
        </div>
      </div>

      {/* Grid 4 Cards: Omzet & 3 Pos Beban */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Omzet Kotor */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E5DE] shadow-[0_1px_3px_rgba(28,25,23,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#706E68] mb-1.5 font-medium">
              <span>Omzet Kotor</span>
              <div className="w-7 h-7 rounded-lg bg-[#EEF6FE] flex items-center justify-center text-[#1A73E8]">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-[#1A1A1A]">
              {formatCurrency(metrics.grossRevenue)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#E8E5DE] text-[11px] text-[#706E68] space-y-0.5">
            <div className="flex justify-between">
              <span>Jasa ({metrics.completedTicketsCount} tiket):</span>
              <span className="text-[#1A1A1A] font-semibold font-mono">
                {formatCurrency(metrics.serviceRevenue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Retail Pomade/Produk:</span>
              <span className="text-[#1A1A1A] font-semibold font-mono">
                {formatCurrency(metrics.productRevenue)}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Beban Komisi Barber */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E5DE] shadow-[0_1px_3px_rgba(28,25,23,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#706E68] mb-1.5 font-medium">
              <span>Beban Komisi Barber</span>
              <div className="w-7 h-7 rounded-lg bg-[#E8F7EE] flex items-center justify-center text-[#1E8E3E]">
                <Scissors className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-[#1A1A1A]">
              {formatCurrency(metrics.commissionExpense)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#E8E5DE] text-[11px] text-[#706E68]">
            <span>
              {metrics.grossRevenue > 0
                ? `${((metrics.commissionExpense / metrics.grossRevenue) * 100).toFixed(1)}% dari omzet`
                : "Beban jasa & bonus retail"}
            </span>
          </div>
        </div>

        {/* 3. Beban Kas Kecil (Petty Cash) */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E5DE] shadow-[0_1px_3px_rgba(28,25,23,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#706E68] mb-1.5 font-medium">
              <span>Beban Kas Kecil (Laci)</span>
              <div className="w-7 h-7 rounded-lg bg-[#FEF3EB] flex items-center justify-center text-[#D97706]">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-[#1A1A1A]">
              {formatCurrency(metrics.pettyCashExpense)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#E8E5DE] text-[11px] text-[#706E68]">
            <span>Operasional dadakan kasir</span>
          </div>
        </div>

        {/* 4. Beban Backbar Meja */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E5DE] shadow-[0_1px_3px_rgba(28,25,23,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#706E68] mb-1.5 font-medium">
              <span>Beban Meja (Backbar)</span>
              <div className="w-7 h-7 rounded-lg bg-[#FDF0F2] flex items-center justify-center text-[#D93025]">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-[#1A1A1A]">
              {formatCurrency(metrics.backbarCost)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#E8E5DE] text-[11px] text-[#706E68]">
            <span>Modal HPP barang meja cukur</span>
          </div>
        </div>
      </div>
    </div>
  );
}
