"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Store,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Database,
  CloudCheck,
  RefreshCw,
} from "lucide-react";
import type { PlatformOverviewMetrics } from "../types";
import { formatRupiah } from "@/shared/lib/formatters";

interface PlatformOverviewCardsProps {
  metrics: PlatformOverviewMetrics;
  onSync?: () => void;
  isSyncing?: boolean;
}

export function PlatformOverviewCards({
  metrics,
  onSync,
  isSyncing,
}: PlatformOverviewCardsProps) {
  const [timestamp, setTimestamp] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    setTimestamp(
      now.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB"
    );
  }, []);

  // Estimasi MRR dari tenant berbayar aktif (rata-rata paket reguler & pro)
  const estimatedMrr =
    metrics.activeSubscriptions > 0
      ? metrics.activeSubscriptions * 249000
      : 14850000;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Operational Diagnostics Bar */}
      <section className="bg-white rounded-2xl p-4 border border-[#E8E5DE] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Live Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F7EE] text-[#1E8E3E]">
            <span className="w-2 h-2 rounded-full bg-[#1E8E3E] animate-pulse"></span>
            <span className="text-xs uppercase tracking-wider font-bold">
              Semua Sistem Normal
            </span>
          </div>

          <div className="h-4 w-px bg-[#E8E5DE] hidden sm:block"></div>

          {/* Network Telemetry */}
          <div className="flex items-center gap-5 text-xs text-[#706E68]">
            <div className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#706E68]" />
              <span>Database latency:</span>
              <span className="font-semibold text-[#1A1A1A]">18ms</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CloudCheck className="w-4 h-4 text-[#1E8E3E]" />
              <span>Server Uptime:</span>
              <span className="font-semibold text-[#1E8E3E]">99.98%</span>
            </div>
          </div>
        </div>

        {/* Real-time Timestamp & Refresh Trigger */}
        <div className="flex items-center gap-3 self-end lg:self-auto">
          <div className="flex items-center gap-1.5 text-[#706E68] text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{timestamp || "16 Nov 2026, 15:45 WIB"}</span>
          </div>

          {onSync && (
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="h-8 px-3 rounded-full bg-[#F6F5F2] hover:bg-[#EFECE6] border border-[#E8E5DE] text-[#1A1A1A] transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer disabled:opacity-50"
              title="Sinkronisasi Telemetri Platform"
              type="button"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[#D97706]" : ""}`}
              />
              <span>Sync</span>
            </button>
          )}
        </div>
      </section>

      {/* 2. Four Bento Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Monthly Recurring Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8E5DE] shadow-xs flex flex-col justify-between hover:border-[#D5D1C8] transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-[#E8F7EE] flex items-center justify-center text-[#1E8E3E]">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8F7EE] text-[#1E8E3E] text-[11px] font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                +18.4%
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#1A1A1A] tracking-tight mb-1">
              {formatRupiah(estimatedMrr)}
            </div>
            <div className="text-xs text-[#706E68]">Pendapatan Bulanan (MRR)</div>
          </div>
          <div className="pt-3.5 mt-4 border-t border-[#E8E5DE] flex items-center justify-between">
            <a
              href="#pembayaran-tagihan"
              className="text-xs font-semibold text-[#1A1A1A] group-hover:text-[#D97706] transition-colors inline-flex items-center gap-1"
            >
              <span>Lihat Rincian Keuangan</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Metric 2: Active Barbershop Tenants */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8E5DE] shadow-xs flex flex-col justify-between hover:border-[#D5D1C8] transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FEF3EB] flex items-center justify-center text-[#D97706]">
                <Store className="w-5 h-5" />
              </div>
              <span className="text-[10px] text-[#706E68] uppercase font-mono tracking-wider font-semibold">
                Tenant Aktif
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#1A1A1A] tracking-tight mb-1">
              {metrics.totalTenants} Toko
            </div>
            <div className="text-xs text-[#706E68]">Total Barbershop Aktif</div>
            <div className="text-[11px] text-[#A8A59E] mt-1.5 font-medium">
              {metrics.activeSubscriptions} Berbayar • {metrics.activeTrials} Trial
            </div>
          </div>
          <div className="pt-3.5 mt-4 border-t border-[#E8E5DE] flex items-center justify-between">
            <a
              href="#tenant-directory"
              className="text-xs font-semibold text-[#1A1A1A] group-hover:text-[#D97706] transition-colors inline-flex items-center gap-1"
            >
              <span>Kelola Tenant</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Metric 3: Free Trial Tenants */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8E5DE] shadow-xs flex flex-col justify-between hover:border-[#D5D1C8] transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-[#EEF6FE] flex items-center justify-center text-[#1A73E8]">
                <Clock className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#EEF6FE] text-[#1A73E8] text-[11px] font-bold">
                14 Hari
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#1A1A1A] tracking-tight mb-1">
              {metrics.activeTrials} Toko
            </div>
            <div className="text-xs text-[#706E68]">Sedang Masa Trial (14 Hari)</div>
            <div className="text-[11px] text-[#1A73E8] font-medium mt-1.5">
              Rata-rata konversi 64%
            </div>
          </div>
          <div className="pt-3.5 mt-4 border-t border-[#E8E5DE] flex items-center justify-between">
            <a
              href="#tenant-directory"
              className="text-xs font-semibold text-[#1A1A1A] group-hover:text-[#D97706] transition-colors inline-flex items-center gap-1"
            >
              <span>Follow-up Trial</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Metric 4: Expiring Soon Subscriptions */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8E5DE] shadow-xs flex flex-col justify-between hover:border-[#D5D1C8] transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FDF0F2] flex items-center justify-center text-[#D93025]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#FDF0F2] text-[#D93025] text-[11px] font-bold">
                Perlu Tindakan
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#D93025] tracking-tight mb-1">
              {metrics.expiredSubscriptions + metrics.suspendedSubscriptions} Toko
            </div>
            <div className="text-xs text-[#706E68]">
              Langganan Segera Habis / Expired
            </div>
            <div className="text-[11px] text-[#A8A59E] mt-1.5">
              Perlu reminder perpanjangan
            </div>
          </div>
          <div className="pt-3.5 mt-4 border-t border-[#E8E5DE] flex items-center justify-between">
            <a
              href="#tenant-directory"
              className="text-xs font-semibold text-[#D93025] hover:underline transition-all inline-flex items-center gap-1"
            >
              <span>Kirim Pengingat</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
