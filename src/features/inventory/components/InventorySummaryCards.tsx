"use client";

import React from "react";
import { formatRupiah } from "@/shared/lib/formatters";
import { InventorySummaryMetrics } from "../types";
import { Package, Boxes, DollarSign, AlertTriangle } from "lucide-react";

interface InventorySummaryCardsProps {
  metrics: InventorySummaryMetrics;
}

export const InventorySummaryCards: React.FC<InventorySummaryCardsProps> = ({
  metrics,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Total SKU */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Total Produk (SKU)
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-zinc-100">{metrics.totalSkus}</p>
        <p className="text-[11px] text-zinc-500 mt-0.5">Varian produk terdaftar</p>
      </div>

      {/* 2. Total Unit Stok */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Total Unit Stok
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Boxes className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-blue-400">
          {metrics.totalStockUnits.toLocaleString("id-ID")}{" "}
          <span className="text-xs font-semibold text-zinc-400">pcs</span>
        </p>
        <p className="text-[11px] text-zinc-500 mt-0.5">Fisik barang di gudang</p>
      </div>

      {/* 3. Valuasi Barang Dagangan (HPP) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Valuasi Aset Stok
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-emerald-400">
          {formatRupiah(metrics.totalInventoryValuation)}
        </p>
        <p className="text-[11px] text-zinc-500 mt-0.5">Berdasarkan harga modal beli</p>
      </div>

      {/* 4. Alert Stok Menipis */}
      <div
        className={`border rounded-2xl p-4 shadow-sm ${
          metrics.lowStockAlertCount > 0
            ? "bg-rose-950/20 border-rose-800/40"
            : "bg-zinc-900 border-zinc-800"
        }`}
      >
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Stok Menipis / Habis
          </span>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              metrics.lowStockAlertCount > 0
                ? "bg-rose-500/20 text-rose-400"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <p
          className={`text-2xl font-black ${
            metrics.lowStockAlertCount > 0 ? "text-rose-400" : "text-zinc-400"
          }`}
        >
          {metrics.lowStockAlertCount}{" "}
          <span className="text-xs font-semibold">SKU</span>
        </p>
        <p className="text-[11px] text-zinc-500 mt-0.5">
          {metrics.lowStockAlertCount > 0
            ? "Perlu segera restock ke supplier"
            : "Semua stok aman terkendali"}
        </p>
      </div>
    </div>
  );
};
