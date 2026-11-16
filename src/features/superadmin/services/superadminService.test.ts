import { describe, it, expect } from "bun:test";
import { calculateNewSubscriptionEndDate } from "./superadminService";

describe("superadminService - Unit Tests", () => {
  describe("calculateNewSubscriptionEndDate", () => {
    const referenceDate = new Date("2026-11-16T12:00:00.000Z");

    it("harus menambahkan hari dari referenceDate jika currentEndsAt bernilai null", () => {
      const additionalDays = 30;
      const newEndDate = calculateNewSubscriptionEndDate(null, additionalDays, referenceDate);

      const expectedDate = new Date(referenceDate);
      expectedDate.setDate(expectedDate.getDate() + 30);

      expect(newEndDate.toISOString()).toBe(expectedDate.toISOString());
    });

    it("harus menambahkan hari dari referenceDate jika langganan sudah expired di masa lalu", () => {
      const expiredDate = new Date("2026-10-01T12:00:00.000Z"); // expired 1.5 bulan lalu
      const additionalDays = 90; // beli paket 3 bulan

      const newEndDate = calculateNewSubscriptionEndDate(
        expiredDate,
        additionalDays,
        referenceDate
      );

      const expectedDate = new Date(referenceDate);
      expectedDate.setDate(expectedDate.getDate() + 90);

      expect(newEndDate.toISOString()).toBe(expectedDate.toISOString());
    });

    it("harus mengakumulasikan durasi dari currentEndsAt jika tenant masih aktif di masa depan", () => {
      const activeEndsAt = new Date("2026-12-01T12:00:00.000Z"); // masih sisa 15 hari
      const additionalDays = 30; // tambah 1 bulan lagi

      const newEndDate = calculateNewSubscriptionEndDate(
        activeEndsAt,
        additionalDays,
        referenceDate
      );

      const expectedDate = new Date(activeEndsAt);
      expectedDate.setDate(expectedDate.getDate() + 30);

      expect(newEndDate.toISOString()).toBe(expectedDate.toISOString());
    });

    it("harus menerima input string ISO untuk currentEndsAt", () => {
      const activeIso = "2026-12-16T12:00:00.000Z";
      const additionalDays = 365; // 1 tahun

      const newEndDate = calculateNewSubscriptionEndDate(
        activeIso,
        additionalDays,
        referenceDate
      );

      const expectedDate = new Date(activeIso);
      expectedDate.setDate(expectedDate.getDate() + 365);

      expect(newEndDate.toISOString()).toBe(expectedDate.toISOString());
    });
  });
});
