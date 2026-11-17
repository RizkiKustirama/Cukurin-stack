"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { rawPrisma } from "@/shared/db";
import { createSessionCookie } from "@/shared/auth";
import type { ActionResult } from "@/shared/types/action";

export const registerTenantSchema = z.object({
  // Step 1: Profil Toko & Owner
  brandName: z.string().min(3, "Nama barbershop minimal 3 karakter."),
  slug: z
    .string()
    .min(3, "Slug URL minimal 3 karakter.")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-)."),
  ownerName: z.string().min(2, "Nama lengkap pemilik minimal 2 karakter."),
  ownerPhone: z
    .string()
    .min(10, "Nomor WhatsApp minimal 10 digit.")
    .regex(/^08[0-9]{8,13}$/, "Format nomor WhatsApp tidak valid (contoh: 081234567890)."),
  ownerEmail: z
    .string()
    .email("Format email tidak valid.")
    .optional()
    .or(z.literal("")),
  ownerPassword: z.string().min(6, "Password minimal 6 karakter."),
  address: z.string().min(5, "Alamat cabang minimal 5 karakter."),

  // Step 2: Barber Pertama & Kursi
  barberName: z.string().min(2, "Nama barber minimal 2 karakter."),
  barberPhone: z
    .string()
    .min(10, "Nomor WhatsApp barber minimal 10 digit.")
    .regex(/^08[0-9]{8,13}$/, "Format nomor WhatsApp barber tidak valid (contoh: 081234567890)."),
  barberPassword: z.string().min(6, "Password akun barber minimal 6 karakter."),
  serviceCommissionPct: z.coerce
    .number()
    .min(0, "Komisi minimal 0%")
    .max(100, "Komisi maksimal 100%"),
  productCommissionFlat: z.coerce.number().min(0, "Bonus produk minimal Rp 0"),
  activeChairs: z.coerce
    .number()
    .int()
    .min(1, "Minimal 1 kursi")
    .max(20, "Maksimal 20 kursi")
    .default(3),

  // Step 3: Layanan Awal & Free Trial
  serviceName: z.string().min(2, "Nama layanan minimal 2 karakter."),
  servicePrice: z.coerce.number().min(5000, "Harga layanan minimal Rp 5.000"),
  durationMinutes: z.coerce
    .number()
    .min(10, "Durasi minimal 10 menit")
    .max(180, "Durasi maksimal 180 menit"),
  subscriptionPlan: z.enum(["REGULER", "PRO"]).default("REGULER"),
});

export type RegisterTenantInput = z.infer<typeof registerTenantSchema>;

export type RegisterTenantResult = ActionResult<{
  redirectUrl: string;
  storeSlug: string;
}>;

/**
 * Server Action to register a new Tenant, Store, Owner, Barber, and initial Service.
 * Executes an ACID transaction and automatically initializes an iron-session cookie for the Owner.
 */
export async function registerTenantAction(
  _prevState: unknown,
  formData: FormData | Record<string, unknown>
): Promise<RegisterTenantResult> {
  try {
    let rawData: Record<string, unknown> = {};

    if (formData instanceof FormData) {
      rawData = Object.fromEntries(formData.entries());
    } else if (typeof formData === "object" && formData !== null) {
      rawData = formData;
    }

    const validation = registerTenantSchema.safeParse(rawData);

    if (!validation.success) {
      const flattened = validation.error.flatten();
      const firstError =
        flattened.fieldErrors.brandName?.[0] ||
        flattened.fieldErrors.slug?.[0] ||
        flattened.fieldErrors.ownerName?.[0] ||
        flattened.fieldErrors.ownerPhone?.[0] ||
        flattened.fieldErrors.ownerPassword?.[0] ||
        flattened.fieldErrors.address?.[0] ||
        flattened.fieldErrors.barberName?.[0] ||
        flattened.fieldErrors.barberPhone?.[0] ||
        flattened.fieldErrors.barberPassword?.[0] ||
        flattened.fieldErrors.serviceName?.[0] ||
        flattened.fieldErrors.servicePrice?.[0] ||
        "Data pendaftaran tidak valid. Silakan periksa kembali formulir Anda.";

      return {
        success: false,
        error: firstError,
        fieldErrors: flattened.fieldErrors,
      };
    }

    const data = validation.data;
    const cleanSlug = data.slug.toLowerCase().trim();

    if (data.ownerPhone === data.barberPhone) {
      return {
        success: false,
        error: "Nomor WhatsApp barber tidak boleh sama dengan nomor WhatsApp pemilik.",
        fieldErrors: {
          barberPhone: ["Nomor WhatsApp barber tidak boleh sama dengan nomor pemilik."],
        },
      };
    }

    // 1. Check slug uniqueness
    const existingSlug = await rawPrisma.tenant.findUnique({
      where: { slug: cleanSlug },
      select: { id: true },
    });

    if (existingSlug) {
      return {
        success: false,
        error: `Slug URL "${cleanSlug}" sudah digunakan. Silakan gunakan nama atau slug lain.`,
        fieldErrors: {
          slug: ["Slug sudah digunakan oleh barbershop lain."],
        },
      };
    }

    // 2. Check owner phone uniqueness
    const existingOwnerPhone = await rawPrisma.user.findFirst({
      where: { phone: data.ownerPhone },
      select: { id: true },
    });

    if (existingOwnerPhone) {
      return {
        success: false,
        error: `Nomor WhatsApp ${data.ownerPhone} sudah terdaftar. Silakan login ke akun Anda.`,
        fieldErrors: {
          ownerPhone: ["Nomor WhatsApp sudah terdaftar."],
        },
      };
    }

    // 3. Password hashing
    const ownerHash = await bcrypt.hash(data.ownerPassword, 10);
    const barberHash = await bcrypt.hash(data.barberPassword, 10);

    // 14 days trial date
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    // 4. ACID Transaction
    const result = await rawPrisma.$transaction(async (tx) => {
      // Create Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: data.brandName.trim(),
          brandName: data.brandName.trim(),
          slug: cleanSlug,
          subscriptionStatus: "TRIAL",
          subscriptionPlan: data.subscriptionPlan,
          trialEndsAt,
          isOnboarded: true,
          maxStores: data.subscriptionPlan === "PRO" ? 3 : 1,
          maxBarbers: data.subscriptionPlan === "PRO" ? 10 : 5,
        },
      });

      // Create primary Store
      const store = await tx.store.create({
        data: {
          tenantId: tenant.id,
          name: `${data.brandName.trim()} - Cabang Utama`,
          address: data.address.trim(),
          phone: data.ownerPhone,
          vaultBalance: 1000000.0,
          queueStrategy: "LOYALTY_PRIORITY",
        },
      });

      // Create Owner User
      const ownerUser = await tx.user.create({
        data: {
          tenantId: tenant.id,
          storeId: store.id,
          name: data.ownerName.trim(),
          phone: data.ownerPhone,
          email:
            data.ownerEmail && data.ownerEmail.trim() !== ""
              ? data.ownerEmail.toLowerCase().trim()
              : null,
          passwordHash: ownerHash,
          role: "OWNER",
          isActive: true,
        },
      });

      // Create Barber User
      const barberUser = await tx.user.create({
        data: {
          tenantId: tenant.id,
          storeId: store.id,
          name: data.barberName.trim(),
          phone: data.barberPhone,
          passwordHash: barberHash,
          role: "BARBER",
          isActive: true,
        },
      });

      // Create Barber Profile
      await tx.barberProfile.create({
        data: {
          userId: barberUser.id,
          storeId: store.id,
          serviceCommissionPct: data.serviceCommissionPct,
          productCommissionFlat: data.productCommissionFlat,
          employmentType: "PERMANENT",
          workStatus: "READY",
        },
      });

      // Create initial Service
      await tx.service.create({
        data: {
          storeId: store.id,
          name: data.serviceName.trim(),
          price: data.servicePrice,
          durationMinutes: data.durationMinutes,
          description: "Layanan utama barbershop",
          isActive: true,
        },
      });

      return {
        tenant,
        store,
        ownerUser,
      };
    });

    // 5. Create Iron-Session Cookie for the new Owner
    await createSessionCookie({
      userId: result.ownerUser.id,
      name: result.ownerUser.name,
      phone: result.ownerUser.phone,
      email: result.ownerUser.email,
      role: "OWNER",
      tenantId: result.tenant.id,
      storeId: result.store.id,
      storeSlug: result.tenant.slug,
      brandName: result.tenant.brandName || result.tenant.name,
      isOnboarded: true,
    });

    return {
      success: true,
      data: {
        storeSlug: result.tenant.slug,
        redirectUrl: `/${result.tenant.slug}/dashboard`,
      },
    };
  } catch (error) {
    console.error("Register tenant action error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan pada server saat mendaftarkan barbershop Anda.",
    };
  }
}
