"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Crown,
  Receipt,
  Scissors,
  Store,
  Package,
  Wrench,
  RefreshCw,
} from "lucide-react";
import type { OwnerDashboardData, DashboardPeriod } from "../types";
import { ExecutiveMetricsCards } from "./ExecutiveMetricsCards";
import { ProfitBreakdownChart } from "./ProfitBreakdownChart";
import { BarberPerformanceTable } from "./BarberPerformanceTable";
import { QueueStrategyToggle } from "./QueueStrategyToggle";

interface OwnerDashboardViewProps {
  initialData: OwnerDashboardData;
  storeSlug: string;
  userName: string;
  userRole: string;
}

export function OwnerDashboardView({
  initialData,
  storeSlug,
  userName,
  userRole,
}: OwnerDashboardViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentPeriod = (searchParams.get("period") as DashboardPeriod) || initialData.period;

  const handlePeriodChange = (period: DashboardPeriod) => {
    if (period === currentPeriod || isPending) return;

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("period", period);
      router.push(`/${storeSlug}/dashboard?${params.toString()}`);
    });
  };

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Eksekutif */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E5DE] shadow-[0_1px_3px_rgba(28,25,23,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#FFF5EB] border border-[#FDE6D2] flex items-center justify-center text-[#D97706] shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">
                {initialData.queueConfig.storeName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF5EB] text-[#D97706] border border-[#FDE6D2]">
                {userRole}
              </span>
            </div>
            <p className="text-xs text-[#706E68] mt-0.5">
              Rekap Eksekutif Finansial & Laba Bersih Toko • Khusus Owner ({userName})
            </p>
          </div>
        </div>

        {/* Filter Periode & Refresh */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className="flex items-center p-1 rounded-full bg-[#F6F5F2] border border-[#E8E5DE]">
            <button
              onClick={() => handlePeriodChange("TODAY")}
              disabled={isPending}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                currentPeriod === "TODAY"
                  ? "bg-[#111111] text-white shadow-2xs"
                  : "text-[#706E68] hover:text-[#1A1A1A]"
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => handlePeriodChange("LAST_7_DAYS")}
              disabled={isPending}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                currentPeriod === "LAST_7_DAYS"
                  ? "bg-[#111111] text-white shadow-2xs"
                  : "text-[#706E68] hover:text-[#1A1A1A]"
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => handlePeriodChange("LAST_30_DAYS")}
              disabled={isPending}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                currentPeriod === "LAST_30_DAYS"
                  ? "bg-[#111111] text-white shadow-2xs"
                  : "text-[#706E68] hover:text-[#1A1A1A]"
              }`}
            >
              30 Hari
            </button>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isPending}
            title="Refresh Data"
            className="p-2.5 rounded-full bg-white hover:bg-[#F6F5F2] border border-[#E8E5DE] text-[#706E68] hover:text-[#1A1A1A] transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin text-[#D97706]" : ""}`} />
          </button>
        </div>
      </div>

      {/* 1. Metrik Finansial */}
      <ExecutiveMetricsCards metrics={initialData.metrics} />

      {/* 2. Komposisi Alokasi Omzet & Laba */}
      <ProfitBreakdownChart metrics={initialData.metrics} />

      {/* 3. Sakelar Budaya Antrean Toko */}
      <QueueStrategyToggle
        storeId={initialData.queueConfig.storeId}
        initialStrategy={initialData.queueConfig.queueStrategy}
      />

      {/* 4. Tabel Performa Kinerja Barber */}
      <BarberPerformanceTable barbers={initialData.barbers} />

      {/* Quick Navigasi Operasional */}
      <div className="pt-2">
        <h4 className="text-xs font-bold text-[#706E68] uppercase tracking-wider mb-3">
          Akses Cepat Modul Operasional Toko
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link
            href={`/${storeSlug}/pos`}
            className="p-3.5 rounded-2xl bg-white hover:bg-[#F6F5F2] border border-[#E8E5DE] transition-all group flex items-center gap-3 shadow-[0_1px_3px_rgba(28,25,23,0.02)]"
          >
            <div className="w-8 h-8 rounded-xl bg-[#E8F7EE] border border-[#CEEAD6] flex items-center justify-center text-[#1E8E3E] shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#1E8E3E] transition-colors truncate">
                Kasir POS
              </div>
              <div className="text-[10px] text-[#706E68]">Buka Transaksi</div>
            </div>
          </Link>

          <Link
            href={`/${storeSlug}/barber`}
            className="p-3.5 rounded-2xl bg-white hover:bg-[#F6F5F2] border border-[#E8E5DE] transition-all group flex items-center gap-3 shadow-[0_1px_3px_rgba(28,25,23,0.02)]"
          >
            <div className="w-8 h-8 rounded-xl bg-[#EEF6FE] border border-[#D3E3FD] flex items-center justify-center text-[#1A73E8] shrink-0">
              <Scissors className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#1A73E8] transition-colors truncate">
                Portal Barber
              </div>
              <div className="text-[10px] text-[#706E68]">Komisi & Status</div>
            </div>
          </Link>

          <Link
            href={`/${storeSlug}/queue`}
            className="p-3.5 rounded-2xl bg-white hover:bg-[#F6F5F2] border border-[#E8E5DE] transition-all group flex items-center gap-3 shadow-[0_1px_3px_rgba(28,25,23,0.02)]"
          >
            <div className="w-8 h-8 rounded-xl bg-[#F3E8FF] border border-[#E9D5FF] flex items-center justify-center text-[#9333EA] shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#9333EA] transition-colors truncate">
                Display Antrean
              </div>
              <div className="text-[10px] text-[#706E68]">Smart TV Publik</div>
            </div>
          </Link>

          <Link
            href={`/${storeSlug}/inventory`}
            className="p-3.5 rounded-2xl bg-white hover:bg-[#F6F5F2] border border-[#E8E5DE] transition-all group flex items-center gap-3 shadow-[0_1px_3px_rgba(28,25,23,0.02)]"
          >
            <div className="w-8 h-8 rounded-xl bg-[#FFF5EB] border border-[#FDE6D2] flex items-center justify-center text-[#D97706] shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#D97706] transition-colors truncate">
                Inventori Stok
              </div>
              <div className="text-[10px] text-[#706E68]">Retail & Backbar</div>
            </div>
          </Link>

          <Link
            href={`/${storeSlug}/assets`}
            className="p-3.5 rounded-2xl bg-white hover:bg-[#F6F5F2] border border-[#E8E5DE] transition-all group flex items-center gap-3 shadow-[0_1px_3px_rgba(28,25,23,0.02)]"
          >
            <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-[#4F46E5] shrink-0">
              <Wrench className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#4F46E5] transition-colors truncate">
                Aset Alat Kerja
              </div>
              <div className="text-[10px] text-[#706E68]">Kondisi & Holder</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
