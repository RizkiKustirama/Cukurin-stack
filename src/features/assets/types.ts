// Feature types for Store Assets Module
import type { StoreAsset, AssetCondition } from "@prisma/client";

export interface CreateAssetDTO {
  storeId: string;
  name: string;
  serialNumber?: string;
  currentHolderId?: string;
  condition?: AssetCondition;
  notes?: string;
}

export interface AssignAssetDTO {
  assetId: string;
  holderId: string | null;
}

export interface UpdateConditionDTO {
  assetId: string;
  condition: AssetCondition;
  notes?: string;
}

export type { StoreAsset, AssetCondition };
