"use server";

import { prisma } from "@/shared/db";
import { revalidatePath } from "next/cache";
import {
  CreateAssetDTO,
  UpdateAssetDTO,
  AssignAssetDTO,
  UpdateConditionDTO,
} from "../types";

export interface AssetActionResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Server Action: Daftarkan aset alat kerja baru ke toko
 */
export async function createAssetAction(
  dto: CreateAssetDTO
): Promise<AssetActionResult> {
  try {
    const { storeId, name, serialNumber, currentHolderId, condition, notes } =
      dto;

    if (!storeId || !name.trim()) {
      return { success: false, message: "Cabang toko dan nama alat wajib diisi." };
    }

    const asset = await prisma.storeAsset.create({
      data: {
        storeId,
        name: name.trim(),
        serialNumber: serialNumber?.trim() || null,
        currentHolderId: currentHolderId || null,
        condition: condition || "GOOD",
        notes: notes?.trim() || null,
      },
    });

    revalidatePath("/[storeSlug]/assets", "page");

    return {
      success: true,
      message: `Alat "${asset.name}" berhasil didaftarkan ke inventaris toko.`,
      data: asset,
    };
  } catch (error: any) {
    console.error("Error in createAssetAction:", error);
    return {
      success: false,
      message: error.message || "Gagal mendaftarkan aset alat kerja.",
    };
  }
}

/**
 * Server Action: Perbarui detail aset alat kerja
 */
export async function updateAssetAction(
  dto: UpdateAssetDTO
): Promise<AssetActionResult> {
  try {
    const { assetId, name, serialNumber, notes } = dto;

    if (!assetId) {
      return { success: false, message: "ID aset alat wajib disertakan." };
    }

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name.trim();
    if (serialNumber !== undefined)
      dataToUpdate.serialNumber = serialNumber?.trim() || null;
    if (notes !== undefined) dataToUpdate.notes = notes?.trim() || null;

    const updated = await prisma.storeAsset.update({
      where: { id: assetId },
      data: dataToUpdate,
    });

    revalidatePath("/[storeSlug]/assets", "page");

    return {
      success: true,
      message: `Data alat "${updated.name}" berhasil diperbarui.`,
      data: updated,
    };
  } catch (error: any) {
    console.error("Error in updateAssetAction:", error);
    return {
      success: false,
      message: error.message || "Gagal memperbarui aset.",
    };
  }
}

/**
 * Server Action: Serah-terima penanggung jawab alat ke barber (atau kembalikan ke gudang)
 */
export async function assignAssetHolderAction(
  dto: AssignAssetDTO
): Promise<AssetActionResult> {
  try {
    const { assetId, holderId, notes } = dto;

    if (!assetId) {
      return { success: false, message: "ID aset alat wajib disertakan." };
    }

    let holderName = "Gudang Inventaris Toko";

    if (holderId) {
      const barber = await prisma.barberProfile.findUnique({
        where: { id: holderId },
        include: { user: { select: { name: true } } },
      });

      if (!barber) {
        return { success: false, message: "Barber tidak ditemukan." };
      }
      holderName = barber.user.name;
    }

    const existing = await prisma.storeAsset.findUnique({
      where: { id: assetId },
    });

    if (!existing) {
      return { success: false, message: "Aset alat tidak ditemukan." };
    }

    const logEntry = `[${new Date().toLocaleDateString("id-ID")}] Serah terima ke: ${holderName}${
      notes ? ` (${notes})` : ""
    }`;

    const updatedNotes = existing.notes
      ? `${existing.notes}\n${logEntry}`
      : logEntry;

    const updated = await prisma.storeAsset.update({
      where: { id: assetId },
      data: {
        currentHolderId: holderId || null,
        notes: updatedNotes,
      },
    });

    revalidatePath("/[storeSlug]/assets", "page");

    return {
      success: true,
      message: `Alat "${updated.name}" kini ditugaskan ke: ${holderName}.`,
      data: updated,
    };
  } catch (error: any) {
    console.error("Error in assignAssetHolderAction:", error);
    return {
      success: false,
      message: error.message || "Gagal mengubah penanggung jawab alat.",
    };
  }
}

/**
 * Server Action: Lapor perubahan kondisi fisik alat kerja (GOOD, MAINTENANCE, DAMAGED, LOST)
 */
export async function updateAssetConditionAction(
  dto: UpdateConditionDTO
): Promise<AssetActionResult> {
  try {
    const { assetId, condition, notes } = dto;

    if (!assetId || !condition) {
      return { success: false, message: "ID aset dan status kondisi wajib diisi." };
    }

    const existing = await prisma.storeAsset.findUnique({
      where: { id: assetId },
      include: {
        currentHolder: {
          include: { user: { select: { name: true } } },
        },
      },
    });

    if (!existing) {
      return { success: false, message: "Aset alat tidak ditemukan." };
    }

    const holderText = existing.currentHolder?.user?.name
      ? `Pemegang saat ini: ${existing.currentHolder.user.name}`
      : "Di gudang toko";

    const logEntry = `[${new Date().toLocaleDateString(
      "id-ID"
    )}] Status diubah ke ${condition} (${holderText})${
      notes ? `: ${notes}` : ""
    }`;

    const updatedNotes = existing.notes
      ? `${existing.notes}\n${logEntry}`
      : logEntry;

    const updated = await prisma.storeAsset.update({
      where: { id: assetId },
      data: {
        condition,
        notes: updatedNotes,
      },
    });

    revalidatePath("/[storeSlug]/assets", "page");

    return {
      success: true,
      message: `Status kondisi alat "${updated.name}" berhasil diubah menjadi ${condition}.`,
      data: updated,
    };
  } catch (error: any) {
    console.error("Error in updateAssetConditionAction:", error);
    return {
      success: false,
      message: error.message || "Gagal memperbarui status kondisi alat.",
    };
  }
}
