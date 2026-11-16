import { prisma } from "@/shared/db";
import {
  AssetWithHolder,
  AssetSummaryMetrics,
  AssetCondition,
} from "../types";

/**
 * Pure function: Menghitung metrik kondisi aset toko
 */
export function calculateAssetMetrics(
  assets: Array<{ condition: AssetCondition; currentHolderId: string | null }>
): AssetSummaryMetrics {
  let goodCount = 0;
  let maintenanceCount = 0;
  let damagedCount = 0;
  let lostCount = 0;
  let assignedCount = 0;
  let unassignedCount = 0;

  for (const a of assets) {
    if (a.condition === "GOOD") goodCount += 1;
    else if (a.condition === "MAINTENANCE") maintenanceCount += 1;
    else if (a.condition === "DAMAGED") damagedCount += 1;
    else if (a.condition === "LOST") lostCount += 1;

    if (a.currentHolderId) {
      assignedCount += 1;
    } else {
      unassignedCount += 1;
    }
  }

  return {
    totalAssets: assets.length,
    goodCount,
    maintenanceCount,
    damagedCount,
    lostCount,
    assignedCount,
    unassignedCount,
  };
}

/**
 * Mengambil daftar aset alat kerja toko beserta relasi profil penanggung jawab barber
 */
export async function getStoreAssets(
  storeId: string,
  filter?: {
    condition?: AssetCondition;
    barberId?: string;
  }
): Promise<{
  assets: AssetWithHolder[];
  metrics: AssetSummaryMetrics;
}> {
  const whereClause: any = { storeId };

  if (filter?.condition) {
    whereClause.condition = filter.condition;
  }
  if (filter?.barberId) {
    whereClause.currentHolderId = filter.barberId;
  }

  const rawAssets = await prisma.storeAsset.findMany({
    where: whereClause,
    include: {
      currentHolder: {
        include: {
          user: {
            select: { name: true, phone: true },
          },
        },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  });

  const assets: AssetWithHolder[] = rawAssets.map((a) => ({
    id: a.id,
    storeId: a.storeId,
    name: a.name,
    serialNumber: a.serialNumber,
    currentHolderId: a.currentHolderId,
    holderName: a.currentHolder?.user?.name || null,
    holderPhone: a.currentHolder?.user?.phone || null,
    holderStatus: a.currentHolder?.workStatus || null,
    condition: a.condition,
    notes: a.notes,
    createdAt: a.createdAt,
  }));

  // Hitung metrik seluruh aset toko (tanpa filter query untuk ringkasan hero)
  const allStoreAssets = await prisma.storeAsset.findMany({
    where: { storeId },
    select: { condition: true, currentHolderId: true },
  });

  const metrics = calculateAssetMetrics(allStoreAssets);

  return {
    assets,
    metrics,
  };
}

/**
 * Mengambil ringkasan metrik kondisi aset toko
 */
export async function getAssetSummaryMetrics(
  storeId: string
): Promise<AssetSummaryMetrics> {
  const assets = await prisma.storeAsset.findMany({
    where: { storeId },
    select: { condition: true, currentHolderId: true },
  });

  return calculateAssetMetrics(assets);
}
