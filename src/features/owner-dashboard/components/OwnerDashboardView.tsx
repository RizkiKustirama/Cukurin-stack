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
      <div className="p-5 sm:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-extrabold text-[var(--foreground)] tracking-tight">
                {initialData.queueConfig.storeName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {userRole}
              </span>
            </div>
            <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
              Dashboard Eksekutif Finansial & Operasional • Halo, {userName}
            </p>
          </div>
        </div>

        {/* Filter Periode & Refresh */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className="flex items-center p-1 rounded-xl bg-[var(--background)] border border-[var(--border)]">
            <button
              onClick={() => handlePeriodChange("TODAY")}
              disabled={isPending}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentPeriod === "TODAY"
                  ? "bg-amber-500 text-black shadow-sm"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => handlePeriodChange("LAST_7_DAYS")}
              disabled={isPending}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentPeriod === "LAST_7_DAYS"
                  ? "bg-amber-500 text-black shadow-sm"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => handlePeriodChange("LAST_30_DAYS")}
              disabled={isPending}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentPeriod === "LAST_30_DAYS"
                  ? "bg-amber-500 text-black shadow-sm"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              30 Hari
            </button>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isPending}
            title="Refresh Data"
            className="p-2 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin text-amber-400" : ""}`} />
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
        <h4 className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-3">
          Akses Cepat Modul Operasional Toko
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link
            href={`/${storeSlug}/pos`}
            className="p-3.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-all group flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[var(--foreground)] group-hover:text-emerald-400 transition-colors truncate">
                Kasir POS
              </div>
              <div className="text-[10px] text-[var(--foreground-muted)]">Buka Transaksi</div>
            </div>
          </Link>

          <Link
            href={`/${storeSlug}/barber`}
            className="p-3.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-all group flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Scissors className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[var(--foreground)] group-hover:text-blue-400 transition-colors truncate">
                Portal Barber
              </div>
              <div className="text-[10px] text-[var(--foreground-muted)]">Komisi & Status</div>
            </div>
          </Link>

          <Link
            href={`/${storeSlug}/queue`}
            className="p-3.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-all group flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[var(--foreground)] group-hover:text-purple-400 transition-colors truncate">
                Display Antrean
              </div>
              <div className="text-[10px] text-[var(--foreground-muted)]">Smart TV Publik</div>
            </div>
          </Link>

          <Link
            href={`/${storeSlug}/inventory`}
            className="p-3.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-all group flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[var(--foreground)] group-hover:text-amber-400 transition-colors truncate">
                Inventori Stok
              </div>
              <div className="text-[10px] text-[var(--foreground-muted)]">Retail & Backbar</div>
            </div>
          </Link>

          <Link
            href={`/${storeSlug}/assets`}
            className="p-3.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-all group flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Wrench className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[var(--foreground)] group-hover:text-indigo-400 transition-colors truncate">
                Aset Alat Kerja
              </div>
              <div className="text-[10px] text-[var(--foreground-muted)]">Kondisi & Holder</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
