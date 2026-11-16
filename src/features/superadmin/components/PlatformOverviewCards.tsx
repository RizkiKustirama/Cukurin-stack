"use client";

import { Building2, CheckCircle2, Clock, AlertTriangle, Store, Scissors } from "lucide-react";
import type { PlatformOverviewMetrics } from "../types";

interface PlatformOverviewCardsProps {
  metrics: PlatformOverviewMetrics;
}

export function PlatformOverviewCards({ metrics }: PlatformOverviewCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {/* 1. Total Tenants */}
      <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-[var(--foreground-muted)] mb-1.5">
          <span>Total Barbershop</span>
          <Building2 className="w-4 h-4 text-purple-400" />
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-[var(--foreground)]">
          {metrics.totalTenants}
        </div>
        <div className="text-[11px] text-[var(--foreground-muted)] mt-1">Tenant terdaftar</div>
      </div>

      {/* 2. Langganan Aktif */}
      <div className="p-4 rounded-xl bg-[var(--surface)] border border-emerald-500/30 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-emerald-400 mb-1.5">
          <span>Langganan Aktif</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-emerald-400">
          {metrics.activeSubscriptions}
        </div>
        <div className="text-[11px] text-[var(--foreground-muted)] mt-1">Berbayar aktif</div>
      </div>

      {/* 3. Masa Percobaan (Trial) */}
      <div className="p-4 rounded-xl bg-[var(--surface)] border border-amber-500/30 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-amber-400 mb-1.5">
          <span>Free Trial 14h</span>
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-amber-400">
          {metrics.activeTrials}
        </div>
        <div className="text-[11px] text-[var(--foreground-muted)] mt-1">Masa percobaan</div>
      </div>

      {/* 4. Expired / Suspended */}
      <div className="p-4 rounded-xl bg-[var(--surface)] border border-rose-500/30 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-rose-400 mb-1.5">
          <span>Expired / Habis</span>
          <AlertTriangle className="w-4 h-4 text-rose-400" />
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-rose-400">
          {metrics.expiredSubscriptions + metrics.suspendedSubscriptions}
        </div>
        <div className="text-[11px] text-[var(--foreground-muted)] mt-1">Paywall terkunci</div>
      </div>

      {/* 5. Total Cabang Toko */}
      <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-[var(--foreground-muted)] mb-1.5">
          <span>Cabang Ruko</span>
          <Store className="w-4 h-4 text-blue-400" />
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-blue-400">
          {metrics.totalStores}
        </div>
        <div className="text-[11px] text-[var(--foreground-muted)] mt-1">Seluruh cabang fisik</div>
      </div>

      {/* 6. Total Barber */}
      <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-[var(--foreground-muted)] mb-1.5">
          <span>Total Barber</span>
          <Scissors className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-amber-400">
          {metrics.totalBarbers}
        </div>
        <div className="text-[11px] text-[var(--foreground-muted)] mt-1">Karier aktif platform</div>
      </div>
    </div>
  );
}
