"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ProductWithStats,
  InventorySummaryMetrics,
  ConsumptionHistoryItem,
} from "../types";
import { InventorySummaryCards } from "./InventorySummaryCards";
import { ProductCatalogTable } from "./ProductCatalogTable";
import { AddProductModal } from "./AddProductModal";
import { StockAdjustmentModal } from "./StockAdjustmentModal";
import { BackbarConsumptionModal } from "./BackbarConsumptionModal";
import { ConsumptionHistoryTable } from "./ConsumptionHistoryTable";
import { Package, Plus, Scissors, ArrowUpRight, Boxes } from "lucide-react";

interface InventoryDashboardViewProps {
  storeId: string;
  storeSlug: string;
  storeName: string;
  products: ProductWithStats[];
  metrics: InventorySummaryMetrics;
  consumptions: ConsumptionHistoryItem[];
}

export const InventoryDashboardView: React.FC<InventoryDashboardViewProps> = ({
  storeId,
  storeSlug,
  storeName,
  products,
  metrics,
  consumptions,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"RETAIL" | "BACKBAR">("RETAIL");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] =
    useState<ProductWithStats | null>(null);
  const [selectedProductForAdjust, setSelectedProductForAdjust] =
    useState<ProductWithStats | null>(null);
  const [showConsumptionModal, setShowConsumptionModal] = useState(false);

  const handleRefresh = () => {
    router.refresh();
  };

  const handleEdit = (prod: ProductWithStats) => {
    setSelectedProductForEdit(prod);
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setSelectedProductForEdit(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 pb-24">
      {/* 1. Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#1A1A1A]">
              Inventori & Stok Barang
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF3EB] text-[#D97706] border border-[#FCD34D]/50">
              Gudang Toko
            </span>
          </div>
          <p className="text-xs text-[#706E68] mt-1">
            Manajemen stok produk retail & pengeluaran perlengkapan meja kerja barber.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowConsumptionModal(true)}
            className="py-2.5 px-4 rounded-full bg-[#F6F5F2] hover:bg-[#EFECE6] border border-[#E8E5DE] text-[#1A1A1A] text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <Scissors className="w-3.5 h-3.5 -rotate-45 text-[#7C3AED]" />
            <span>Keluarkan ke Meja (Backbar)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedProductForEdit(null);
              setShowAddModal(true);
            }}
            className="py-2.5 px-4 rounded-full bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* 2. Metric Cards */}
      <InventorySummaryCards metrics={metrics} />

      {/* 3. Tab Switcher (Retail vs Backbar) */}
      <div className="flex border-b border-[#E8E5DE]">
        <button
          type="button"
          onClick={() => setActiveTab("RETAIL")}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "RETAIL"
              ? "border-[#111111] text-[#111111]"
              : "border-transparent text-[#706E68] hover:text-[#1A1A1A]"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Stok & Katalog Retail ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("BACKBAR")}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "BACKBAR"
              ? "border-[#111111] text-[#111111]"
              : "border-transparent text-[#706E68] hover:text-[#1A1A1A]"
          }`}
        >
          <Scissors className="w-4 h-4 -rotate-45" />
          <span>Pengeluaran Meja / Backbar ({consumptions.length})</span>
        </button>
      </div>

      {/* 4. Tab Content */}
      {activeTab === "RETAIL" ? (
        <ProductCatalogTable
          products={products}
          onEditProduct={handleEdit}
          onAdjustStock={(prod) => setSelectedProductForAdjust(prod)}
        />
      ) : (
        <ConsumptionHistoryTable consumptions={consumptions} />
      )}

      {/* Modals */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        storeId={storeId}
        editProduct={selectedProductForEdit}
        onSuccess={handleRefresh}
      />

      <StockAdjustmentModal
        isOpen={!!selectedProductForAdjust}
        onClose={() => setSelectedProductForAdjust(null)}
        product={selectedProductForAdjust}
        onSuccess={handleRefresh}
      />

      <BackbarConsumptionModal
        isOpen={showConsumptionModal}
        onClose={() => setShowConsumptionModal(false)}
        storeId={storeId}
        products={products}
        onSuccess={handleRefresh}
      />
    </div>
  );
};
