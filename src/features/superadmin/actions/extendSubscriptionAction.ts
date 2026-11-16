"use server";

import { requireAuth } from "@/shared/auth";
import { extendTenantSubscription } from "../services/superadminService";
import { SubscriptionPlan } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface ExtendSubscriptionActionInput {
  tenantId: string;
  plan: SubscriptionPlan;
  additionalDays: number;
  notes?: string;
}

export async function extendSubscriptionAction(input: ExtendSubscriptionActionInput) {
  try {
    await requireAuth(["SUPERADMIN", "PLATFORM_ADMIN"]);

    if (!input.tenantId) {
      return { success: false, error: "Tenant ID wajib disertakan." };
    }

    if (!input.additionalDays || input.additionalDays <= 0) {
      return { success: false, error: "Jumlah hari perpanjangan harus lebih dari 0." };
    }

    if (!Object.values(SubscriptionPlan).includes(input.plan)) {
      return { success: false, error: "Paket langganan tidak valid." };
    }

    const result = await extendTenantSubscription({
      tenantId: input.tenantId,
      plan: input.plan,
      additionalDays: input.additionalDays,
      notes: input.notes,
    });

    revalidatePath("/admin");

    return {
      success: true,
      tenant: result.tenant,
    };
  } catch (error: any) {
    console.error("Gagal memperpanjang langganan tenant:", error);
    return {
      success: false,
      error: error.message || "Terjadi kesalahan saat memperpanjang langganan.",
    };
  }
}
