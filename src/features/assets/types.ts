// Feature types for Store Assets Module
import type { StoreAsset, AssetCondition } from "@prisma/client";

export interface AssetWithHolder {
  id: string;
  storeId: string;
  name: string;
  serialNumber: string | null;
  currentHolderId: string | null;
  holderName: string | null;
  holderPhone: string | null;
  holderStatus: string | null;
  condition: AssetCondition;
  notes: string | null;
  createdAt: Date;
}

export interface AssetSummaryMetrics {
  totalAssets: number;
  goodCount: number;
  maintenanceCount: number;
  damagedCount: number;
  lostCount: number;
  assignedCount: number;
  unassignedCount: number;
}

export interface CreateAssetDTO {
  storeId: string;
  name: string;
  serialNumber?: string;
  currentHolderId?: string | null;
  condition?: AssetCondition;
  notes?: string;
}

export interface UpdateAssetDTO {
  assetId: string;
  name?: string;
  serialNumber?: string;
  notes?: string;
}

export interface AssignAssetDTO {
  assetId: string;
  holderId: string | null; // null jika dikembalikan ke gudang toko
  notes?: string;
}

export interface UpdateConditionDTO {
  assetId: string;
  condition: AssetCondition;
  notes?: string;
}

export type { StoreAsset, AssetCondition };
