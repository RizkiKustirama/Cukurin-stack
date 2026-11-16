import { describe, expect, it } from "bun:test";
import { calculateAssetMetrics } from "./assetService";
import { AssetCondition } from "../types";

describe("Asset Service Unit Tests", () => {
  it("harus menghitung metrik agregasi kondisi aset dan penugasan pemegang dengan benar", () => {
    const mockAssets: Array<{
      condition: AssetCondition;
      currentHolderId: string | null;
    }> = [
      { condition: "GOOD", currentHolderId: "barber-1" },
      { condition: "GOOD", currentHolderId: "barber-2" },
      { condition: "GOOD", currentHolderId: null }, // Unassigned
      { condition: "MAINTENANCE", currentHolderId: "barber-3" },
      { condition: "DAMAGED", currentHolderId: null },
      { condition: "LOST", currentHolderId: "barber-1" },
    ];

    const metrics = calculateAssetMetrics(mockAssets);

    expect(metrics.totalAssets).toBe(6);
    expect(metrics.goodCount).toBe(3);
    expect(metrics.maintenanceCount).toBe(1);
    expect(metrics.damagedCount).toBe(1);
    expect(metrics.lostCount).toBe(1);
    expect(metrics.assignedCount).toBe(4);
    expect(metrics.unassignedCount).toBe(2);
  });

  it("harus menangani kasus ketika toko belum memiliki aset terdaftar", () => {
    const metrics = calculateAssetMetrics([]);

    expect(metrics.totalAssets).toBe(0);
    expect(metrics.goodCount).toBe(0);
    expect(metrics.maintenanceCount).toBe(0);
    expect(metrics.damagedCount).toBe(0);
    expect(metrics.lostCount).toBe(0);
    expect(metrics.assignedCount).toBe(0);
    expect(metrics.unassignedCount).toBe(0);
  });
});
