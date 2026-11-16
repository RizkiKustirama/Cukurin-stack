"use client";

import React, { useState } from "react";
import { formatRupiah } from "@/shared/lib/formatters";
import { ProductWithStats } from "../types";
import {
  Package,
  AlertTriangle,
  Boxes,
  Edit2,
  TrendingUp,
  Scissors,
  CheckCircle2,
  Search,
} from "lucide-react";

interface ProductCatalogTableProps {
  products: ProductWithStats[];
  onEditProduct: (product: ProductWithStats) => void;
  onAdjustStock: (product: ProductWithStats) => void;
}

export const ProductCatalogTable: React.FC<ProductCatalogTableProps> = ({
  products,
  onEditProduct,
  onAdjustStock,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "LOW" | "SAFE">("ALL");

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterStatus === "LOW") {
      return p.stockStatus === "LOW" || p.stockStatus === "OUT_OF_STOCK";
    }
    if (filterStatus === "SAFE") {
      return p.stockStatus === "SAFE";
    }
    return true;
  });

  return (
    <div className="bg-white border border-[#E8E5DE] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#706E68] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama produk..."
            className="w-full bg-[#F6F5F2] border border-[#E8E5DE] rounded-full pl-9 pr-3 py-2 text-xs text-[#1A1A1A] placeholder:text-[#A8A59E] focus:outline-none focus:border-[#111111] transition"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterStatus("ALL")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              filterStatus === "ALL"
                ? "bg-[#111111] text-white"
                : "text-[#706E68] hover:text-[#1A1A1A]"
            }`}
          >
            Semua ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("LOW")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              filterStatus === "LOW"
                ? "bg-[#FDF0F2] text-[#D93025] border border-[#FECDD3]/40"
                : "text-[#706E68] hover:text-[#D93025]"
            }`}
          >
            Menipis/Habis
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("SAFE")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              filterStatus === "SAFE"
                ? "bg-[#E8F7EE] text-[#1E8E3E] border border-[#A7F3D0]/40"
                : "text-[#706E68] hover:text-[#1E8E3E]"
            }`}
          >
            Aman
          </button>
        </div>
      </div>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-10 text-[#706E68] text-xs">
          Tidak ada produk yang sesuai dengan filter pencarian.
        </div>
      ) : (
        <div className="divide-y divide-[#E8E5DE]">
          {filteredProducts.map((p) => {
            const isOutOfStock = p.stockStatus === "OUT_OF_STOCK";
            const isLowStock = p.stockStatus === "LOW";
            const margin = p.sellingPrice - p.costPrice;

            return (
              <div
                key={p.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                {/* Info Produk */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-[#1A1A1A]">{p.name}</span>
                    {isOutOfStock ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FDF0F2] text-[#D93025] border border-[#FECDD3]/50 text-[10px] font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Stok Habis (0)
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3EB] text-[#D97706] border border-[#FCD34D]/50 text-[10px] font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Stok Menipis ({p.stockQuantity})
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E8F7EE] text-[#1E8E3E] border border-[#A7F3D0]/50 text-[10px] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Stok Aman ({p.stockQuantity})
                      </span>
                    )}
                    {!p.isActive && (
                      <span className="px-2 py-0.5 rounded-full bg-[#F6F5F2] text-[#706E68] border border-[#E8E5DE] text-[10px]">
                        Nonaktif
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[#706E68] text-[11px] flex-wrap">
                    <span>
                      Harga Jual:{" "}
                      <strong className="text-[#1A1A1A]">
                        {formatRupiah(p.sellingPrice)}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Modal HPP:{" "}
                      <strong className="text-[#706E68]">
                        {formatRupiah(p.costPrice)}
                      </strong>
                    </span>
                    <span>•</span>
                    <span className="text-[#1E8E3E] font-medium">
                      Margin: +{formatRupiah(margin)}
                    </span>
                    <span>•</span>
                    <span>
                      Terjual: <strong className="text-[#1A1A1A]">{p.totalSold}</strong> | Meja:{" "}
                      <strong className="text-[#1A1A1A]">{p.totalConsumed}</strong>
                    </span>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => onAdjustStock(p)}
                    className="py-1.5 px-3 rounded-full bg-[#F6F5F2] hover:bg-[#EFECE6] border border-[#E8E5DE] text-[#1A1A1A] text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Boxes className="w-3.5 h-3.5 text-[#1A73E8]" />
                    <span>Sesuaikan Stok</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditProduct(p)}
                    className="p-1.5 rounded-full bg-[#F6F5F2] hover:bg-[#EFECE6] border border-[#E8E5DE] text-[#706E68] hover:text-[#1A1A1A] transition"
                    title="Edit Produk"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
