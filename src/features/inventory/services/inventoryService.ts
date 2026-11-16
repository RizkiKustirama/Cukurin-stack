import { prisma } from "@/shared/db";
import {
  ProductWithStats,
  InventorySummaryMetrics,
  StockStatus,
  ConsumptionHistoryItem,
} from "../types";

/**
 * Pure function: Menentukan status stok (OUT_OF_STOCK, LOW, atau SAFE)
 */
export function determineStockStatus(
  qty: number,
  minAlert: number = 3
): StockStatus {
  if (qty <= 0) return "OUT_OF_STOCK";
  if (qty <= minAlert) return "LOW";
  return "SAFE";
}

/**
 * Pure function: Menghitung total valuasi aset barang dagangan
 */
export function calculateInventoryValuation(
  products: Array<{ stockQuantity: number; costPrice: any }>
): number {
  return products.reduce(
    (sum, p) => sum + Math.max(0, p.stockQuantity) * Number(p.costPrice),
    0
  );
}

/**
 * Mengambil katalog produk toko lengkap dengan metrik stok, penjualan, dan valuasi
 */
export async function getStoreInventory(storeId: string): Promise<{
  products: ProductWithStats[];
  metrics: InventorySummaryMetrics;
}> {
  const rawProducts = await prisma.product.findMany({
    where: { storeId },
    include: {
      ticketItems: {
        select: { quantity: true },
      },
      consumptions: {
        select: { quantity: true },
      },
    },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  let totalStockUnits = 0;
  let totalInventoryValuation = 0;
  let lowStockAlertCount = 0;

  const products: ProductWithStats[] = rawProducts.map((p) => {
    const costPriceNum = Number(p.costPrice);
    const sellingPriceNum = Number(p.sellingPrice);
    const stockQty = p.stockQuantity;
    const minAlert = p.minStockAlert;

    const stockStatus = determineStockStatus(stockQty, minAlert);

    if (stockStatus === "LOW" || stockStatus === "OUT_OF_STOCK") {
      lowStockAlertCount += 1;
    }

    if (stockQty > 0) {
      totalStockUnits += stockQty;
      totalInventoryValuation += stockQty * costPriceNum;
    }

    const totalSold = p.ticketItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalConsumed = p.consumptions.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    return {
      id: p.id,
      storeId: p.storeId,
      name: p.name,
      costPrice: costPriceNum,
      sellingPrice: sellingPriceNum,
      stockQuantity: stockQty,
      minStockAlert: minAlert,
      isActive: p.isActive,
      stockStatus,
      totalSold,
      totalConsumed,
    };
  });

  const metrics: InventorySummaryMetrics = {
    totalSkus: products.length,
    totalStockUnits,
    totalInventoryValuation,
    lowStockAlertCount,
  };

  return {
    products,
    metrics,
  };
}

/**
 * Mengambil riwayat pengeluaran barang gudang ke meja barber (Backbar Consumptions)
 */
export async function getBackbarConsumptions(
  storeId: string,
  limit: number = 50
): Promise<ConsumptionHistoryItem[]> {
  const records = await prisma.storeConsumption.findMany({
    where: { storeId },
    include: {
      product: {
        select: {
          name: true,
          costPrice: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return records.map((r) => ({
    id: r.id,
    productId: r.productId,
    productName: r.product?.name || "Produk",
    quantity: r.quantity,
    unitCostPrice: Number(r.product?.costPrice || 0),
    totalCostValue: Number(r.costValue),
    targetStation: r.targetStation,
    notes: r.notes,
    createdAt: r.createdAt,
  }));
}
