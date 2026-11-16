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
      <div className="bg-white border border-[#E8E5DE] rounded-2xl p-4 shadow-[0_1px_3px_rgba(28,25,23,0.02)]">
        <div className="flex items-center justify-between text-[#706E68] mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Total Produk (SKU)
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#FFF5EB] text-[#D97706] flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black font-mono text-[#1A1A1A]">{metrics.totalSkus}</p>
        <p className="text-[11px] text-[#706E68] mt-0.5">Varian produk terdaftar</p>
      </div>

      {/* 2. Total Unit Stok */}
      <div className="bg-white border border-[#E8E5DE] rounded-2xl p-4 shadow-[0_1px_3px_rgba(28,25,23,0.02)]">
        <div className="flex items-center justify-between text-[#706E68] mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Total Unit Stok
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#EEF6FE] text-[#1A73E8] flex items-center justify-center">
            <Boxes className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black font-mono text-[#1A73E8]">
          {metrics.totalStockUnits.toLocaleString("id-ID")}{" "}
          <span className="text-xs font-semibold text-[#706E68]">pcs</span>
        </p>
        <p className="text-[11px] text-[#706E68] mt-0.5">Fisik barang di gudang</p>
      </div>

      {/* 3. Valuasi Barang Dagangan (HPP) */}
      <div className="bg-white border border-[#E8E5DE] rounded-2xl p-4 shadow-[0_1px_3px_rgba(28,25,23,0.02)]">
        <div className="flex items-center justify-between text-[#706E68] mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Valuasi Aset Stok
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#E8F7EE] text-[#1E8E3E] flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black font-mono text-[#1E8E3E]">
          {formatRupiah(metrics.totalInventoryValuation)}
        </p>
        <p className="text-[11px] text-[#706E68] mt-0.5">Berdasarkan harga modal beli</p>
      </div>

      {/* 4. Alert Stok Menipis */}
      <div
        className={`rounded-2xl p-4 shadow-[0_1px_3px_rgba(28,25,23,0.02)] border ${
          metrics.lowStockAlertCount > 0
            ? "bg-[#FDF0F2]/40 border-[#FCDAD7]"
            : "bg-white border-[#E8E5DE]"
        }`}
      >
        <div className="flex items-center justify-between text-[#706E68] mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Stok Menipis / Habis
          </span>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              metrics.lowStockAlertCount > 0
                ? "bg-[#FDF0F2] text-[#D93025]"
                : "bg-[#F6F5F2] text-[#706E68]"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <p
          className={`text-2xl font-black font-mono ${
            metrics.lowStockAlertCount > 0 ? "text-[#D93025]" : "text-[#706E68]"
          }`}
        >
          {metrics.lowStockAlertCount}{" "}
          <span className="text-xs font-semibold">SKU</span>
        </p>
        <p className="text-[11px] text-[#706E68] mt-0.5">
          {metrics.lowStockAlertCount > 0
            ? "Perlu segera restock ke supplier"
            : "Semua stok aman terkendali"}
        </p>
      </div>
    </div>
  );
};
