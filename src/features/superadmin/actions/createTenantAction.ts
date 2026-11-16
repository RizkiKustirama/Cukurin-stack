"use server";

import bcrypt from "bcryptjs";
import { rawPrisma } from "@/shared/db";
import { requireAuth } from "@/shared/auth";
import { SubscriptionPlan, SubscriptionStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface CreateTenantInput {
  name: string;
  slug: string;
  brandName?: string;
  address?: string;
  city?: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  password?: string;
  plan: SubscriptionPlan | "TRIAL";
  initialChairs?: number;
}

export async function createTenantAction(input: CreateTenantInput) {
  try {
    await requireAuth(["SUPERADMIN", "PLATFORM_ADMIN"]);

    if (!input.name.trim() || !input.slug.trim()) {
      return { success: false, error: "Nama barbershop dan domain slug wajib diisi." };
    }

    if (!input.ownerName.trim() || !input.ownerPhone.trim()) {
      return { success: false, error: "Nama dan nomor WhatsApp owner wajib diisi." };
    }

    const cleanSlug = input.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");

    // Check if slug already exists
    const existingTenant = await rawPrisma.tenant.findUnique({
      where: { slug: cleanSlug },
    });

    if (existingTenant) {
      return { success: false, error: `Domain slug '${cleanSlug}' sudah digunakan. Silakan pilih yang lain.` };
    }

    const isTrial = input.plan === "TRIAL";
    const subscriptionPlan: SubscriptionPlan = input.plan === "TRIAL" ? SubscriptionPlan.REGULER : input.plan;
    const subscriptionStatus: SubscriptionStatus = isTrial ? SubscriptionStatus.TRIAL : SubscriptionStatus.ACTIVE;

    const now = new Date();
    const trialEndsAt = new Date(now);
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const subscriptionEndsAt = isTrial
      ? null
      : new Date(new Date().setDate(now.getDate() + 30));

    const defaultPassword = input.password || "Cukurin#2026";
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const maxBarbers = input.plan === "PRO" ? 15 : input.plan === "ENTERPRISE" ? 50 : 5;

    // Create Tenant, Store, and Owner User inside transaction
    const newTenant = await rawPrisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: input.name.trim(),
          brandName: input.brandName?.trim() || input.name.trim(),
          slug: cleanSlug,
          subscriptionPlan,
          subscriptionStatus,
          trialEndsAt,
          subscriptionEndsAt,
          maxStores: input.plan === "PRO" ? 3 : 1,
          maxBarbers,
          isOnboarded: false,
        },
      });

      const store = await tx.store.create({
        data: {
          tenantId: tenant.id,
          name: `Cabang Utama ${input.name.trim()}`,
          address: input.address?.trim() || (input.city ? `${input.city}` : undefined),
          phone: input.ownerPhone.trim(),
          vaultBalance: 1000000.0,
        },
      });

      await tx.user.create({
        data: {
          tenantId: tenant.id,
          storeId: store.id,
          name: input.ownerName.trim(),
          phone: input.ownerPhone.trim(),
          email: input.ownerEmail?.trim() || null,
          passwordHash,
          role: UserRole.OWNER,
          isActive: true,
        },
      });

      return tenant;
    });

    revalidatePath("/admin");

    return {
      success: true,
      tenant: {
        id: newTenant.id,
        name: newTenant.name,
        slug: newTenant.slug,
      },
    };
  } catch (error: any) {
    console.error("Gagal mendaftarkan tenant baru:", error);
    return {
      success: false,
      error: error.message || "Terjadi kesalahan saat mendaftarkan tenant baru.",
    };
  }
}
