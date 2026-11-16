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
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama produk..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterStatus("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterStatus === "ALL"
                ? "bg-zinc-800 text-amber-400 border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Semua ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("LOW")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterStatus === "LOW"
                ? "bg-rose-950/80 text-rose-300 border border-rose-800"
                : "text-zinc-400 hover:text-rose-400"
            }`}
          >
            Menipis/Habis
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("SAFE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterStatus === "SAFE"
                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                : "text-zinc-400 hover:text-emerald-400"
            }`}
          >
            Aman
          </button>
        </div>
      </div>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-10 text-zinc-500 text-xs">
          Tidak ada produk yang sesuai dengan filter pencarian.
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/60">
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
                    <span className="font-bold text-sm text-zinc-100">{p.name}</span>
                    {isOutOfStock ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Stok Habis (0)
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Stok Menipis ({p.stockQuantity})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-[10px] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Stok Aman ({p.stockQuantity})
                      </span>
                    )}
                    {!p.isActive && (
                      <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px]">
                        Nonaktif
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-zinc-400 text-[11px] flex-wrap">
                    <span>
                      Harga Jual:{" "}
                      <strong className="text-zinc-200">
                        {formatRupiah(p.sellingPrice)}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Modal HPP:{" "}
                      <strong className="text-zinc-400">
                        {formatRupiah(p.costPrice)}
                      </strong>
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400 font-medium">
                      Margin: +{formatRupiah(margin)}
                    </span>
                    <span>•</span>
                    <span>
                      Terjual: <strong>{p.totalSold}</strong> | Meja:{" "}
                      <strong>{p.totalConsumed}</strong>
                    </span>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => onAdjustStock(p)}
                    className="py-1.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Boxes className="w-3.5 h-3.5 text-blue-400" />
                    <span>Sesuaikan Stok</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditProduct(p)}
                    className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-zinc-200 transition"
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
