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
      <div className="bg-white border border-[#E8E5DE] rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-[#706E68] mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Total Unit Alat
          </span>
          <div className="w-8 h-8 rounded-full bg-[#EEF6FE] text-[#1A73E8] flex items-center justify-center">
            <Wrench className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-[#1A1A1A] font-mono">{metrics.totalAssets}</p>
        <p className="text-[11px] text-[#706E68] mt-0.5">
          {metrics.assignedCount} terpakai • {metrics.unassignedCount} di gudang
        </p>
      </div>

      {/* 2. Kondisi Baik (GOOD) */}
      <div className="bg-white border border-[#E8E5DE] rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-[#706E68] mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Kondisi Prima
          </span>
          <div className="w-8 h-8 rounded-full bg-[#E8F7EE] text-[#1E8E3E] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-[#1E8E3E] font-mono">{metrics.goodCount}</p>
        <p className="text-[11px] text-[#706E68] mt-0.5">Siap digunakan memotong</p>
      </div>

      {/* 3. Dalam Perawatan / Servis (MAINTENANCE) */}
      <div className="bg-white border border-[#E8E5DE] rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-[#706E68] mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Servis / Asah Pisau
          </span>
          <div className="w-8 h-8 rounded-full bg-[#FEF3EB] text-[#D97706] flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-[#D97706] font-mono">
          {metrics.maintenanceCount}
        </p>
        <p className="text-[11px] text-[#706E68] mt-0.5">Perlu perbaikan atau asah</p>
      </div>

      {/* 4. Rusak / Hilang (DAMAGED / LOST) */}
      <div
        className={`border rounded-2xl p-4 shadow-xs ${
          metrics.damagedCount + metrics.lostCount > 0
            ? "bg-white border-[#FECDD3]"
            : "bg-white border-[#E8E5DE]"
        }`}
      >
        <div className="flex items-center justify-between text-[#706E68] mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Rusak / Hilang
          </span>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              metrics.damagedCount + metrics.lostCount > 0
                ? "bg-[#FDF0F2] text-[#D93025]"
                : "bg-[#F6F5F2] text-[#706E68]"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <p
          className={`text-2xl font-black font-mono ${
            metrics.damagedCount + metrics.lostCount > 0
              ? "text-[#D93025]"
              : "text-[#1A1A1A]"
          }`}
        >
          {metrics.damagedCount + metrics.lostCount}
        </p>
        <p className="text-[11px] text-[#706E68] mt-0.5">
          {metrics.damagedCount} rusak • {metrics.lostCount} hilang
        </p>
      </div>
    </div>
  );
};
