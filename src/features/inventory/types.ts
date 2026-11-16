// Feature types for Inventory Module (Retail & Backbar Consumption)
import type { Product, StoreConsumption } from "@prisma/client";

export type StockStatus = "SAFE" | "LOW" | "OUT_OF_STOCK";

export interface ProductWithStats {
  id: string;
  storeId: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockAlert: number;
  isActive: boolean;
  stockStatus: StockStatus;
  totalSold: number;
  totalConsumed: number;
}

export interface InventorySummaryMetrics {
  totalSkus: number;
  totalStockUnits: number;
  totalInventoryValuation: number; // Sum(stockQuantity * costPrice)
  lowStockAlertCount: number;
}

export interface CreateProductDTO {
  storeId: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockAlert?: number;
}

export interface UpdateProductDTO {
  productId: string;
  name?: string;
  costPrice?: number;
  sellingPrice?: number;
  minStockAlert?: number;
  isActive?: boolean;
}

export type AdjustmentReason =
  | "RESTOCK"
  | "OPNAME_CORRECTION"
  | "DAMAGED"
  | "EXPIRED"
  | "OTHER";

export interface StockAdjustmentDTO {
  productId: string;
  quantityChange: number; // Positif (tambah) atau Negatif (kurang)
  reason: AdjustmentReason;
  notes?: string;
}

export interface BackbarConsumptionDTO {
  storeId: string;
  productId: string;
  quantity: number;
  targetStation: string; // misal: "Meja Barber 1 - Rian"
  notes?: string;
}

export interface ConsumptionHistoryItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCostPrice: number;
  totalCostValue: number;
  targetStation: string;
  notes: string | null;
  createdAt: Date;
}

export type { Product, StoreConsumption };
