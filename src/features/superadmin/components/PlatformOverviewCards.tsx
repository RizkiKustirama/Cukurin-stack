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
      <div className="p-4 rounded-2xl bg-white border border-[#E8E5DE] shadow-[0_1px_3px_rgba(28,25,23,0.02)] flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-[#706E68] mb-1.5 font-medium">
          <span>Total Barbershop</span>
          <div className="w-7 h-7 rounded-lg bg-[#F3E8FF] flex items-center justify-center text-[#9333EA]">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#1A1A1A]">
          {metrics.totalTenants}
        </div>
        <div className="text-[11px] text-[#706E68] mt-1">Tenant terdaftar</div>
      </div>

      {/* 2. Langganan Aktif */}
      <div className="p-4 rounded-2xl bg-white border border-[#CEEAD6] shadow-[0_1px_3px_rgba(28,25,23,0.02)] flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-[#1E8E3E] mb-1.5 font-medium">
          <span>Langganan Aktif</span>
          <div className="w-7 h-7 rounded-lg bg-[#E8F7EE] flex items-center justify-center text-[#1E8E3E]">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#1E8E3E]">
          {metrics.activeSubscriptions}
        </div>
        <div className="text-[11px] text-[#706E68] mt-1">Berbayar aktif</div>
      </div>

      {/* 3. Masa Percobaan (Trial) */}
      <div className="p-4 rounded-2xl bg-white border border-[#FDE6D2] shadow-[0_1px_3px_rgba(28,25,23,0.02)] flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-[#D97706] mb-1.5 font-medium">
          <span>Free Trial 14h</span>
          <div className="w-7 h-7 rounded-lg bg-[#FEF3EB] flex items-center justify-center text-[#D97706]">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#D97706]">
          {metrics.activeTrials}
        </div>
        <div className="text-[11px] text-[#706E68] mt-1">Masa percobaan</div>
      </div>

      {/* 4. Expired / Suspended */}
      <div className="p-4 rounded-2xl bg-white border border-[#FCDAD7] shadow-[0_1px_3px_rgba(28,25,23,0.02)] flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-[#D93025] mb-1.5 font-medium">
          <span>Expired / Habis</span>
          <div className="w-7 h-7 rounded-lg bg-[#FDF0F2] flex items-center justify-center text-[#D93025]">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#D93025]">
          {metrics.expiredSubscriptions + metrics.suspendedSubscriptions}
        </div>
        <div className="text-[11px] text-[#706E68] mt-1">Paywall terkunci</div>
      </div>

      {/* 5. Total Cabang Toko */}
      <div className="p-4 rounded-2xl bg-white border border-[#E8E5DE] shadow-[0_1px_3px_rgba(28,25,23,0.02)] flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-[#706E68] mb-1.5 font-medium">
          <span>Cabang Ruko</span>
          <div className="w-7 h-7 rounded-lg bg-[#EEF6FE] flex items-center justify-center text-[#1A73E8]">
            <Store className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#1A1A1A]">
          {metrics.totalStores}
        </div>
        <div className="text-[11px] text-[#706E68] mt-1">Seluruh cabang fisik</div>
      </div>

      {/* 6. Total Barber */}
      <div className="p-4 rounded-2xl bg-white border border-[#E8E5DE] shadow-[0_1px_3px_rgba(28,25,23,0.02)] flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-[#706E68] mb-1.5 font-medium">
          <span>Total Barber</span>
          <div className="w-7 h-7 rounded-lg bg-[#FFF5EB] flex items-center justify-center text-[#D97706]">
            <Scissors className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#1A1A1A]">
          {metrics.totalBarbers}
        </div>
        <div className="text-[11px] text-[#706E68] mt-1">Karier aktif platform</div>
      </div>
    </div>
  );
}
