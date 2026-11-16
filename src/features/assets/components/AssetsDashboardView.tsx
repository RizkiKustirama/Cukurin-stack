"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AssetWithHolder, AssetSummaryMetrics } from "../types";
import { AssetMetricsCards } from "./AssetMetricsCards";
import { AssetListGrid } from "./AssetListGrid";
import { AddAssetModal } from "./AddAssetModal";
import { AssignHolderModal } from "./AssignHolderModal";
import { UpdateConditionModal } from "./UpdateConditionModal";
import { Wrench, Plus } from "lucide-react";

interface AssetsDashboardViewProps {
  storeId: string;
  storeSlug: string;
  storeName: string;
  assets: AssetWithHolder[];
  metrics: AssetSummaryMetrics;
  barbers: Array<{ id: string; name: string }>;
}

export const AssetsDashboardView: React.FC<AssetsDashboardViewProps> = ({
  storeId,
  storeSlug,
  storeName,
  assets,
  metrics,
  barbers,
}) => {
  const router = useRouter();

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAssetForEdit, setSelectedAssetForEdit] =
    useState<AssetWithHolder | null>(null);
  const [selectedAssetForAssign, setSelectedAssetForAssign] =
    useState<AssetWithHolder | null>(null);
  const [selectedAssetForCondition, setSelectedAssetForCondition] =
    useState<AssetWithHolder | null>(null);

  const handleRefresh = () => {
    router.refresh();
  };

  const handleEdit = (asset: AssetWithHolder) => {
    setSelectedAssetForEdit(asset);
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setSelectedAssetForEdit(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 pb-24">
      {/* 1. Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#1A1A1A]">
              Pelacak Aset & Alat Kerja
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EEF6FE] text-[#1A73E8] border border-[#BAE6FD]/50">
              Inventaris Mesin
            </span>
          </div>
          <p className="text-xs text-[#706E68] mt-1">
            Pengawasan alat kerja berharga (Clipper, Gunting, Dryer), nomor seri, penanggung jawab meja, dan kondisi fisik.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedAssetForEdit(null);
            setShowAddModal(true);
          }}
          className="py-2.5 px-4 rounded-full bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Daftarkan Alat Baru</span>
        </button>
      </div>

      {/* 2. Metric Cards */}
      <AssetMetricsCards metrics={metrics} />

      {/* 3. Asset List Table/Grid */}
      <AssetListGrid
        assets={assets}
        barbers={barbers}
        onAssignHolder={(asset) => setSelectedAssetForAssign(asset)}
        onUpdateCondition={(asset) => setSelectedAssetForCondition(asset)}
        onEditAsset={handleEdit}
      />

      {/* Modals */}
      <AddAssetModal
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        storeId={storeId}
        barbers={barbers}
        editAsset={selectedAssetForEdit}
        onSuccess={handleRefresh}
      />

      <AssignHolderModal
        isOpen={!!selectedAssetForAssign}
        onClose={() => setSelectedAssetForAssign(null)}
        asset={selectedAssetForAssign}
        barbers={barbers}
        onSuccess={handleRefresh}
      />

      <UpdateConditionModal
        isOpen={!!selectedAssetForCondition}
        onClose={() => setSelectedAssetForCondition(null)}
        asset={selectedAssetForCondition}
        onSuccess={handleRefresh}
      />
    </div>
  );
};
