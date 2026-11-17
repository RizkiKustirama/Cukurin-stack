import { describe, it, expect } from "bun:test";
import { registerTenantSchema } from "./actions";

describe("registerTenantSchema - Validation Tests", () => {
  const validData = {
    brandName: "Gentleman Barber & Shave",
    slug: "gentleman-barber",
    ownerName: "Bambang Soediro",
    ownerPhone: "081234567890",
    ownerEmail: "owner@gentleman.com",
    ownerPassword: "password123",
    address: "Jl. Senopati No. 45, Jakarta Selatan",
    barberName: "Ahmad Dani",
    barberPhone: "089876543210",
    barberPassword: "barber123",
    serviceCommissionPct: 40,
    productCommissionFlat: 5000,
    activeChairs: 3,
    serviceName: "Gentleman Haircut + Wash",
    servicePrice: 65000,
    durationMinutes: 45,
    subscriptionPlan: "REGULER" as const,
  };

  it("harus meloloskan data valid pendaftaran tenant baru", () => {
    const result = registerTenantSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe("gentleman-barber");
      expect(result.data.activeChairs).toBe(3);
    }
  });

  it("harus menolak nama barbershop yang kurang dari 3 karakter", () => {
    const invalid = { ...validData, brandName: "AB" };
    const result = registerTenantSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.brandName).toBeDefined();
    }
  });

  it("harus menolak format slug dengan huruf besar atau spasi", () => {
    const invalidWithSpace = { ...validData, slug: "gentleman barber" };
    const res1 = registerTenantSchema.safeParse(invalidWithSpace);
    expect(res1.success).toBe(false);

    const invalidWithUpper = { ...validData, slug: "Gentleman-Barber" };
    const res2 = registerTenantSchema.safeParse(invalidWithUpper);
    expect(res2.success).toBe(false);
  });

  it("harus menolak nomor WhatsApp yang bukan format Indonesia 08...", () => {
    const invalidPhone = { ...validData, ownerPhone: "123456789" };
    const result = registerTenantSchema.safeParse(invalidPhone);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.ownerPhone).toBeDefined();
    }
  });

  it("harus menolak password kurang dari 6 karakter", () => {
    const invalid = { ...validData, ownerPassword: "123" };
    const result = registerTenantSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.ownerPassword).toBeDefined();
    }
  });

  it("harus menolak komisi jasa di luar batas 0% - 100%", () => {
    const invalidOver = { ...validData, serviceCommissionPct: 105 };
    const res1 = registerTenantSchema.safeParse(invalidOver);
    expect(res1.success).toBe(false);

    const invalidUnder = { ...validData, serviceCommissionPct: -5 };
    const res2 = registerTenantSchema.safeParse(invalidUnder);
    expect(res2.success).toBe(false);
  });

  it("harus menolak harga layanan di bawah Rp 5.000", () => {
    const invalid = { ...validData, servicePrice: 1000 };
    const result = registerTenantSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.servicePrice).toBeDefined();
    }
  });

  it("harus menolak durasi layanan di luar batas 10 - 180 menit", () => {
    const invalidShort = { ...validData, durationMinutes: 5 };
    const res1 = registerTenantSchema.safeParse(invalidShort);
    expect(res1.success).toBe(false);

    const invalidLong = { ...validData, durationMinutes: 240 };
    const res2 = registerTenantSchema.safeParse(invalidLong);
    expect(res2.success).toBe(false);
  });
});
