import { describe, it, expect } from "bun:test";
import {
  calculateNetProfit,
  getDateRangeForPeriod,
} from "./ownerDashboardService";

describe("ownerDashboardService - Unit Tests", () => {
  describe("calculateNetProfit", () => {
    it("harus menghitung laba bersih toko dengan benar (Omzet - Komisi - Petty Cash - Backbar)", () => {
      const grossRevenue = 1500000;
      const commissionExpense = 600000;
      const pettyCashExpense = 75000;
      const backbarCost = 50000;

      // 1,500,000 - 600,000 - 75,000 - 50,000 = 775,000
      const netProfit = calculateNetProfit(
        grossRevenue,
        commissionExpense,
        pettyCashExpense,
        backbarCost
      );

      expect(netProfit).toBe(775000);
    });

    it("harus menangani kondisi rugi (beban melebihi omzet) dengan hasil negatif", () => {
      const grossRevenue = 100000;
      const commissionExpense = 50000;
      const pettyCashExpense = 80000;
      const backbarCost = 40000;

      // 100,000 - 50,000 - 80,000 - 40,000 = -70,000
      const netProfit = calculateNetProfit(
        grossRevenue,
        commissionExpense,
        pettyCashExpense,
        backbarCost
      );

      expect(netProfit).toBe(-70000);
    });

    it("harus menjaga presisi dua desimal", () => {
      const grossRevenue = 123456.78;
      const commissionExpense = 54321.11;
      const pettyCashExpense = 1234.56;
      const backbarCost = 5678.9;

      const netProfit = calculateNetProfit(
        grossRevenue,
        commissionExpense,
        pettyCashExpense,
        backbarCost
      );

      expect(netProfit).toBe(62222.21);
    });
  });

  describe("getDateRangeForPeriod", () => {
    const fixedNow = new Date("2026-11-16T15:30:00.000Z");

    it("harus menghasilkan rentang hari ini (00:00:00 hingga 23:59:59.999) untuk 'TODAY'", () => {
      const { startDate, endDate } = getDateRangeForPeriod("TODAY", fixedNow);

      expect(startDate.getHours()).toBe(0);
      expect(startDate.getMinutes()).toBe(0);
      expect(startDate.getSeconds()).toBe(0);

      expect(endDate.getHours()).toBe(23);
      expect(endDate.getMinutes()).toBe(59);
      expect(endDate.getSeconds()).toBe(59);

      expect(startDate.getDate()).toBe(fixedNow.getDate());
      expect(endDate.getDate()).toBe(fixedNow.getDate());
    });

    it("harus mundur 6 hari untuk 'LAST_7_DAYS'", () => {
      const { startDate, endDate } = getDateRangeForPeriod("LAST_7_DAYS", fixedNow);

      const diffDays = Math.round(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Rentang 7 hari (contoh: 10 Nov - 16 Nov = 7 hari kalender)
      expect(diffDays).toBe(7);
      expect(endDate.getDate()).toBe(fixedNow.getDate());
    });

    it("harus mundur 29 hari untuk 'LAST_30_DAYS'", () => {
      const { startDate, endDate } = getDateRangeForPeriod("LAST_30_DAYS", fixedNow);

      const diffDays = Math.round(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Rentang 30 hari
      expect(diffDays).toBe(30);
    });
  });
});
