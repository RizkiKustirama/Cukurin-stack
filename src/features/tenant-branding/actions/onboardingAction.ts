"use server";

import bcrypt from "bcryptjs";
import { rawPrisma } from "@/shared/db";
import { requireAuth, createSessionCookie } from "@/shared/auth";
import type { ActionResult } from "@/shared/types/action";
import { onboardingSchema, type OnboardingFormData } from "../types";

export interface OnboardingSuccessData {
  redirectUrl: string;
}

/**
 * Server Action to complete the 3-Step Setup Wizard for Cukurin Barbershop SaaS.
 * Enforces OWNER authorization, validates input with Zod, and performs ACID transaction.
 */
export async function completeOnboardingAction(
  data: OnboardingFormData
): Promise<ActionResult<OnboardingSuccessData>> {
  try {
    // 1. Enforce OWNER authentication
    const session = await requireAuth(["OWNER"]);

    // 2. Validate input fields using Zod schema
    const validationResult = onboardingSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        error: "Data formulir setup wizard tidak valid. Mohon periksa isian Anda.",
        fieldErrors: validationResult.error.flatten().fieldErrors,
      };
    }

    const validData = validationResult.data;

    // 3. Find current user and associated tenant & primary store
    const user = await rawPrisma.user.findUnique({
      where: { id: session.userId },
      include: {
        tenant: {
          include: {
            stores: true,
          },
        },
      },
    });

    if (!user || !user.tenant) {
      return {
        success: false,
        error: "Data akun Owner atau profil bisnis barbershop tidak ditemukan.",
      };
    }

    const tenant = user.tenant;
    const store = tenant.stores[0];

    if (!store) {
      return {
        success: false,
        error: "Cabang ruko fisik utama tidak ditemukan untuk akun ini.",
      };
    }

    // 4. Execute ACID transaction for Onboarding setup
    await rawPrisma.$transaction(async (tx) => {
      // a. Update Tenant
      await tx.tenant.update({
        where: { id: tenant.id },
        data: {
          brandName: validData.brandName,
          logoUrl: validData.logoUrl && validData.logoUrl.trim() !== "" ? validData.logoUrl : null,
          primaryColor: validData.primaryColor,
          isOnboarded: true,
        },
      });

      // b. Update Store details
      await tx.store.update({
        where: { id: store.id },
        data: {
          name: validData.brandName,
          address: validData.address,
          phone: validData.phone,
        },
      });

      // c. Hash barber account password
      const barberPasswordHash = await bcrypt.hash(validData.barberPassword, 10);

      // d. Create or update first Barber user
      const existingBarber = await tx.user.findUnique({
        where: {
          tenantId_phone: {
            tenantId: tenant.id,
            phone: validData.barberPhone,
          },
        },
      });

      let barberUser;
      if (existingBarber) {
        barberUser = await tx.user.update({
          where: { id: existingBarber.id },
          data: {
            name: validData.barberName,
            passwordHash: barberPasswordHash,
            role: "BARBER",
            storeId: store.id,
            isActive: true,
          },
        });
      } else {
        barberUser = await tx.user.create({
          data: {
            tenantId: tenant.id,
            storeId: store.id,
            name: validData.barberName,
            phone: validData.barberPhone,
            passwordHash: barberPasswordHash,
            role: "BARBER",
            isActive: true,
          },
        });
      }

      // e. Create or update BarberProfile
      await tx.barberProfile.upsert({
        where: { userId: barberUser.id },
        update: {
          storeId: store.id,
          serviceCommissionPct: validData.serviceCommissionPct,
          productCommissionFlat: validData.productCommissionFlat,
          employmentType: "PERMANENT",
          workStatus: "READY",
        },
        create: {
          userId: barberUser.id,
          storeId: store.id,
          serviceCommissionPct: validData.serviceCommissionPct,
          productCommissionFlat: validData.productCommissionFlat,
          employmentType: "PERMANENT",
          workStatus: "READY",
        },
      });

      // f. Create first service package
      await tx.service.create({
        data: {
          storeId: store.id,
          name: validData.serviceName,
          price: validData.servicePrice,
          durationMinutes: validData.durationMinutes,
          description:
            validData.serviceDescription && validData.serviceDescription.trim() !== ""
              ? validData.serviceDescription
              : null,
          isActive: true,
        },
      });
    });

    // 5. Update session cookie for owner with isOnboarded = true
    await createSessionCookie({
      ...session,
      tenantId: tenant.id,
      storeId: store.id,
      storeSlug: tenant.slug,
      isOnboarded: true,
    });

    // 6. Return success result with redirect URL
    return {
      success: true,
      data: {
        redirectUrl: `/${tenant.slug}/dashboard`,
      },
    };
  } catch (err: unknown) {
    console.error("Error in completeOnboardingAction:", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan internal pada server saat menyimpan konfigurasi.",
    };
  }
}
