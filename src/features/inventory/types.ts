// Feature types for Inventory Module
import type { Product, StoreConsumption } from "@prisma/client";

export interface StockAdjustmentDTO {
  productId: string;
  quantityChange: number;
  reason: string;
}

export interface BackbarConsumptionDTO {
  storeId: string;
  productId: string;
  quantity: number;
  targetStation: string;
  notes?: string;
}

export type { Product, StoreConsumption };
