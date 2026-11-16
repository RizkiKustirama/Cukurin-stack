"use client";

import React from "react";
import { AssetSummaryMetrics } from "../types";
import { Wrench, CheckCircle2, AlertTriangle, XCircle, ShieldAlert } from "lucide-react";

interface AssetMetricsCardsProps {
  metrics: AssetSummaryMetrics;
}

export const AssetMetricsCards: React.FC<AssetMetricsCardsProps> = ({
  metrics,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Total Unit Alat */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Total Unit Alat
          </span>
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Wrench className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-zinc-100">{metrics.totalAssets}</p>
        <p className="text-[11px] text-zinc-500 mt-0.5">
          {metrics.assignedCount} terpakai • {metrics.unassignedCount} di gudang
        </p>
      </div>

      {/* 2. Kondisi Baik (GOOD) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Kondisi Prima
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-emerald-400">{metrics.goodCount}</p>
        <p className="text-[11px] text-zinc-500 mt-0.5">Siap digunakan memotong</p>
      </div>

      {/* 3. Dalam Perawatan / Servis (MAINTENANCE) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Servis / Asah Pisau
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-amber-400">
          {metrics.maintenanceCount}
        </p>
        <p className="text-[11px] text-zinc-500 mt-0.5">Perlu perbaikan atau asah</p>
      </div>

      {/* 4. Rusak / Hilang (DAMAGED / LOST) */}
      <div
        className={`border rounded-2xl p-4 shadow-sm ${
          metrics.damagedCount + metrics.lostCount > 0
            ? "bg-rose-950/20 border-rose-800/40"
            : "bg-zinc-900 border-zinc-800"
        }`}
      >
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Rusak / Hilang
          </span>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              metrics.damagedCount + metrics.lostCount > 0
                ? "bg-rose-500/20 text-rose-400"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <p
          className={`text-2xl font-black ${
            metrics.damagedCount + metrics.lostCount > 0
              ? "text-rose-400"
              : "text-zinc-400"
          }`}
        >
          {metrics.damagedCount + metrics.lostCount}
        </p>
        <p className="text-[11px] text-zinc-500 mt-0.5">
          {metrics.damagedCount} rusak • {metrics.lostCount} hilang
        </p>
      </div>
    </div>
  );
};
