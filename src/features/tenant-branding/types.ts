// Feature types for Tenant Branding & Setup Wizard Module
import type { Tenant, Store } from "@prisma/client";
import { z } from "zod";

export interface TenantBrandingDTO {
  tenantId: string;
  brandName: string;
  logoUrl?: string;
  primaryColor: string;
}

export interface OnboardingWizardStep1DTO {
  tenantId: string;
  storeName: string;
  address?: string;
  phone?: string;
  brandName: string;
  logoUrl?: string;
  primaryColor: string;
}

export interface OnboardingWizardStep2DTO {
  storeId: string;
  barberName: string;
  barberPhone: string;
  barberPassword?: string;
  commissionPct: number;
  productCommissionFlat: number;
}

export interface OnboardingWizardStep3DTO {
  storeId: string;
  serviceName: string;
  price: number;
  durationMinutes: number;
  description?: string;
}

export const onboardingSchema = z.object({
  // Step 1: Store & Brand Profile
  brandName: z
    .string()
    .min(2, "Nama brand toko minimal 2 karakter")
    .max(100, "Nama brand toko maksimal 100 karakter"),
  phone: z
    .string()
    .min(8, "Nomor telepon / WhatsApp toko minimal 8 digit")
    .max(20, "Nomor telepon maksimal 20 digit"),
  address: z
    .string()
    .min(5, "Alamat fisik ruko minimal 5 karakter"),
  logoUrl: z
    .string()
    .url("Format URL logo tidak valid")
    .optional()
    .or(z.literal("")),
  primaryColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Format kode warna hex tidak valid (contoh: #d97706)"),

  // Step 2: First Barber
  barberName: z
    .string()
    .min(2, "Nama lengkap barber minimal 2 karakter")
    .max(100, "Nama barber maksimal 100 karakter"),
  barberPhone: z
    .string()
    .min(8, "Nomor WhatsApp / HP barber minimal 8 digit")
    .max(20, "Nomor WhatsApp maksimal 20 digit"),
  barberPassword: z
    .string()
    .min(6, "Password akun barber minimal 6 karakter"),
  serviceCommissionPct: z
    .number()
    .min(0, "Komisi jasa minimal 0%")
    .max(100, "Komisi jasa maksimal 100%"),
  productCommissionFlat: z
    .number()
    .min(0, "Insentif produk retail minimal Rp 0"),

  // Step 3: First Service
  serviceName: z
    .string()
    .min(2, "Nama paket layanan minimal 2 karakter")
    .max(100, "Nama paket layanan maksimal 100 karakter"),
  servicePrice: z
    .number()
    .min(0, "Harga jual minimal Rp 0"),
  durationMinutes: z
    .number()
    .int("Durasi harus berupa angka bulat")
    .min(5, "Estimasi durasi minimal 5 menit")
    .max(300, "Estimasi durasi maksimal 300 menit"),
  serviceDescription: z
    .string()
    .optional()
    .or(z.literal("")),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

export interface ColorPreset {
  name: string;
  hex: string;
}

export const BRAND_COLOR_PRESETS: ColorPreset[] = [
  { name: "Warm Amber", hex: "#d97706" },
  { name: "Classic Gold", hex: "#ca8a04" },
  { name: "Emerald Green", hex: "#059669" },
  { name: "Terracotta Rose", hex: "#dc2626" },
  { name: "Royal Slate", hex: "#475569" },
  { name: "Vintage Brown", hex: "#78350f" },
];

export type { Tenant, Store };
