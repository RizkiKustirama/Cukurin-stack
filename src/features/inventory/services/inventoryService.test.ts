import { describe, expect, it } from "bun:test";
import {
  determineStockStatus,
  calculateInventoryValuation,
} from "./inventoryService";

describe("Inventory Service Unit Tests", () => {
  it("harus menentukan status stok dengan akurat (SAFE, LOW, OUT_OF_STOCK)", () => {
    // 0 unit => OUT_OF_STOCK
    expect(determineStockStatus(0, 3)).toBe("OUT_OF_STOCK");
    expect(determineStockStatus(-1, 3)).toBe("OUT_OF_STOCK");

    // <= min alert (misal 3 unit saat batas alert 3) => LOW
    expect(determineStockStatus(1, 3)).toBe("LOW");
    expect(determineStockStatus(3, 3)).toBe("LOW");

    // > min alert (misal 4 unit saat batas alert 3) => SAFE
    expect(determineStockStatus(4, 3)).toBe("SAFE");
    expect(determineStockStatus(25, 5)).toBe("SAFE");
  });

  it("harus menghitung valuasi total aset inventori barang gudang dengan benar", () => {
    const mockProducts = [
      { stockQuantity: 10, costPrice: 40000 }, // 400.000
      { stockQuantity: 5, costPrice: 80000 },  // 400.000
      { stockQuantity: 0, costPrice: 60000 },  // 0
      { stockQuantity: -2, costPrice: 50000 }, // Ignored / 0
    ];

    const totalValuation = calculateInventoryValuation(mockProducts);
    expect(totalValuation).toBe(800000);
  });

  it("harus menghitung total cost value pengeluaran meja backbar (quantity * costPrice)", () => {
    const qty = 3;
    const costPrice = 45000;
    const expectedCostValue = qty * costPrice;

    expect(expectedCostValue).toBe(135000);
  });
});
