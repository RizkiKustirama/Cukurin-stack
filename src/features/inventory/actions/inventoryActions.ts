"use server";

import { prisma } from "@/shared/db";
import { revalidatePath } from "next/cache";
import {
  CreateProductDTO,
  UpdateProductDTO,
  StockAdjustmentDTO,
  BackbarConsumptionDTO,
} from "../types";

export interface InventoryActionResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Server Action: Tambah master produk retail baru ke toko
 */
export async function createProductAction(
  dto: CreateProductDTO
): Promise<InventoryActionResult> {
  try {
    const { storeId, name, costPrice, sellingPrice, stockQuantity, minStockAlert } =
      dto;

    if (!storeId || !name.trim()) {
      return { success: false, message: "Cabang toko dan nama produk wajib diisi." };
    }

    if (costPrice < 0 || sellingPrice < 0) {
      return { success: false, message: "Harga modal dan harga jual tidak boleh negatif." };
    }

    const product = await prisma.product.create({
      data: {
        storeId,
        name: name.trim(),
        costPrice,
        sellingPrice,
        stockQuantity: Math.max(0, stockQuantity || 0),
        minStockAlert: minStockAlert !== undefined ? Math.max(0, minStockAlert) : 3,
        isActive: true,
      },
    });

    revalidatePath("/[storeSlug]/inventory", "page");
    revalidatePath("/[storeSlug]/pos", "page");

    return {
      success: true,
      message: `Produk "${product.name}" berhasil ditambahkan ke inventori.`,
      data: product,
    };
  } catch (error: any) {
    console.error("Error in createProductAction:", error);
    return {
      success: false,
      message: error.message || "Gagal menambahkan produk baru.",
    };
  }
}

/**
 * Server Action: Perbarui master produk toko
 */
export async function updateProductAction(
  dto: UpdateProductDTO
): Promise<InventoryActionResult> {
  try {
    const { productId, name, costPrice, sellingPrice, minStockAlert, isActive } =
      dto;

    if (!productId) {
      return { success: false, message: "ID produk wajib disertakan." };
    }

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name.trim();
    if (costPrice !== undefined) dataToUpdate.costPrice = costPrice;
    if (sellingPrice !== undefined) dataToUpdate.sellingPrice = sellingPrice;
    if (minStockAlert !== undefined) dataToUpdate.minStockAlert = minStockAlert;
    if (isActive !== undefined) dataToUpdate.isActive = isActive;

    const updated = await prisma.product.update({
      where: { id: productId },
      data: dataToUpdate,
    });

    revalidatePath("/[storeSlug]/inventory", "page");
    revalidatePath("/[storeSlug]/pos", "page");

    return {
      success: true,
      message: `Data produk "${updated.name}" berhasil diperbarui.`,
      data: updated,
    };
  } catch (error: any) {
    console.error("Error in updateProductAction:", error);
    return {
      success: false,
      message: error.message || "Gagal memperbarui produk.",
    };
  }
}

/**
 * Server Action: Penyesuaian stok manual (Restock Supplier / Opname / Koreksi)
 */
export async function adjustStockAction(
  dto: StockAdjustmentDTO
): Promise<InventoryActionResult> {
  try {
    const { productId, quantityChange, reason, notes } = dto;

    if (!productId || quantityChange === 0) {
      return {
        success: false,
        message: "ID produk dan jumlah perubahan stok tidak boleh 0.",
      };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { success: false, message: "Produk tidak ditemukan." };
    }

    const newQuantity = product.stockQuantity + quantityChange;
    if (newQuantity < 0) {
      return {
        success: false,
        message: `Pengurangan stok (${Math.abs(
          quantityChange
        )}) melebihi sisa stok di gudang (${product.stockQuantity}).`,
      };
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        stockQuantity: newQuantity,
      },
    });

    revalidatePath("/[storeSlug]/inventory", "page");
    revalidatePath("/[storeSlug]/pos", "page");

    const directionText = quantityChange > 0 ? `+${quantityChange}` : `${quantityChange}`;
    return {
      success: true,
      message: `Stok produk "${updated.name}" berhasil disesuaikan (${directionText} unit). Sisa stok: ${updated.stockQuantity} unit.`,
      data: updated,
    };
  } catch (error: any) {
    console.error("Error in adjustStockAction:", error);
    return {
      success: false,
      message: error.message || "Gagal menyesuaikan stok produk.",
    };
  }
}

/**
 * Server Action: Catat pengeluaran barang gudang untuk meja barber (Backbar Consumption)
 */
export async function recordBackbarConsumptionAction(
  dto: BackbarConsumptionDTO
): Promise<InventoryActionResult> {
  try {
    const { storeId, productId, quantity, targetStation, notes } = dto;

    if (!storeId || !productId || quantity <= 0 || !targetStation.trim()) {
      return {
        success: false,
        message: "Produk, jumlah, dan meja tujuan wajib diisi lengkap.",
      };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { success: false, message: "Produk tidak ditemukan di database." };
    }

    if (product.stockQuantity < quantity) {
      return {
        success: false,
        message: `Stok gudang tidak mencukupi (Tersedia: ${product.stockQuantity} unit, Diminta: ${quantity} unit).`,
      };
    }

    const costValue = Number(product.costPrice) * quantity;

    // Transaksi ACID: potong stok produk dan simpan log pengeluaran meja
    const result = await prisma.$transaction(async (tx) => {
      // 1. Kurangi stok produk
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          stockQuantity: {
            decrement: quantity,
          },
        },
      });

      // 2. Buat record StoreConsumption
      const consumption = await tx.storeConsumption.create({
        data: {
          storeId,
          productId,
          quantity,
          costValue,
          targetStation: targetStation.trim(),
          notes: notes?.trim() || null,
        },
      });

      return {
        updatedProduct,
        consumption,
      };
    });

    revalidatePath("/[storeSlug]/inventory", "page");
    revalidatePath("/[storeSlug]/pos", "page");

    return {
      success: true,
      message: `Berhasil mengeluarkan ${quantity} unit "${product.name}" ke ${targetStation}. Sisa stok gudang: ${result.updatedProduct.stockQuantity} unit.`,
      data: result,
    };
  } catch (error: any) {
    console.error("Error in recordBackbarConsumptionAction:", error);
    return {
      success: false,
      message: error.message || "Gagal mencatat pengeluaran barang ke meja.",
    };
  }
}
