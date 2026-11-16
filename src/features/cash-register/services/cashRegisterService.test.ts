import { describe, expect, it } from "bun:test";
import { computeRegisterSummaryFromData } from "./cashRegisterService";

describe("Cash Register Service Logic & Calculations", () => {
  it("harus menghitung Expected Drawer Cash dengan tepat (Deposit + Tunai - Petty - Payout)", () => {
    const mockRegister = {
      id: "reg-1",
      openingCash: 350000,
      status: "OPEN",
      actualCash: null,
    };

    const mockPayments = [
      { paymentMethod: "CASH", amount: 60000 },
      { paymentMethod: "CASH", amount: 90000 },
      { paymentMethod: "QRIS", amount: 150000 }, // Non-cash, tidak menambah laci fisik
      { paymentMethod: "TRANSFER", amount: 200000 }, // Non-cash
    ];

    const mockPettyExpenses = [
      { amount: 25000, category: "MINUMAN", notes: "Air Mineral Galon" },
      { amount: 15000, category: "KEBERSIHAN", notes: "Sapu & Pengki" },
    ];

    const mockCommissionPayouts = [
      {
        amount: 50000,
        paidVia: "CASH_DRAWER",
        isPaidOut: true,
      },
      {
        amount: 80000,
        paidVia: "TRANSFER", // Transfer bank toko, tidak kurangi laci fisik
        isPaidOut: true,
      },
      {
        amount: 40000,
        paidVia: "CASH_DRAWER",
        isPaidOut: false, // Belum dicairkan
      },
    ];

    const summary = computeRegisterSummaryFromData(
      mockRegister,
      mockPayments,
      mockPettyExpenses,
      mockCommissionPayouts
    );

    // Kas Awal: 350.000
    // Total Tunai: 60.000 + 90.000 = 150.000
    // Total Kas Kecil: 25.000 + 15.000 = 40.000
    // Total Komisi Laci: 50.000
    // Expected: 350.000 + 150.000 - 40.000 - 50.000 = 410.000
    expect(summary.openingCash).toBe(350000);
    expect(summary.totalCashSales).toBe(150000);
    expect(summary.totalQrisSales).toBe(150000);
    expect(summary.totalTransferSales).toBe(200000);
    expect(summary.totalPettyExpenses).toBe(40000);
    expect(summary.totalCommissionPaidFromDrawer).toBe(50000);
    expect(summary.expectedDrawerCash).toBe(410000);
    expect(summary.isClosed).toBe(false);
    expect(summary.actualCash).toBeNull();
    expect(summary.discrepancyCash).toBeNull();
  });

  it("harus menghitung discrepancy selisih kas fisik (Pass/Balance)", () => {
    const mockRegister = {
      id: "reg-2",
      openingCash: 300000,
      status: "CLOSED",
      actualCash: 450000,
    };

    const mockPayments = [{ paymentMethod: "CASH", amount: 150000 }];
    const mockPetty: Array<{ amount: number }> = [];
    const mockPayout: Array<{ amount: number; paidVia?: string | null; isPaidOut: boolean }> = [];

    const summary = computeRegisterSummaryFromData(
      mockRegister,
      mockPayments,
      mockPetty,
      mockPayout
    );

    expect(summary.expectedDrawerCash).toBe(450000);
    expect(summary.actualCash).toBe(450000);
    expect(summary.discrepancyCash).toBe(0);
    expect(summary.isClosed).toBe(true);
  });

  it("harus mendeteksi tekor/minus jika fisik kurang dari expected", () => {
    const mockRegister = {
      id: "reg-3",
      openingCash: 200000,
      status: "CLOSED",
      actualCash: 280000, // Uang fisik dihitung cuma 280.000 padahal harusnya 300.000
    };

    const mockPayments = [{ paymentMethod: "CASH", amount: 100000 }];
    const summary = computeRegisterSummaryFromData(mockRegister, mockPayments, [], []);

    expect(summary.expectedDrawerCash).toBe(300000);
    expect(summary.actualCash).toBe(280000);
    expect(summary.discrepancyCash).toBe(-20000); // Tekor 20.000
  });

  it("harus mendeteksi lebih/surplus jika fisik lebih banyak dari expected", () => {
    const mockRegister = {
      id: "reg-4",
      openingCash: 200000,
      status: "CLOSED",
      actualCash: 315000,
    };

    const mockPayments = [{ paymentMethod: "CASH", amount: 100000 }];
    const summary = computeRegisterSummaryFromData(mockRegister, mockPayments, [], []);

    expect(summary.expectedDrawerCash).toBe(300000);
    expect(summary.actualCash).toBe(315000);
    expect(summary.discrepancyCash).toBe(15000); // Lebih 15.000
  });
});
