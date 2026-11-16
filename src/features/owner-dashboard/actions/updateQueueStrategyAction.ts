"use server";

import { requireAuth } from "@/shared/auth";
import { updateStoreQueueStrategy } from "../services/ownerDashboardService";
import { QueueStrategy } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface UpdateQueueStrategyInput {
  storeId: string;
  queueStrategy: QueueStrategy;
}

export async function updateQueueStrategyAction(input: UpdateQueueStrategyInput) {
  try {
    const session = await requireAuth(["OWNER", "MANAGER"]);

    // Validasi strategi yang valid
    if (
      input.queueStrategy !== QueueStrategy.LOYALTY_PRIORITY &&
      input.queueStrategy !== QueueStrategy.STRICT_FIFO
    ) {
      return { success: false, error: "Strategi antrean tidak valid." };
    }

    if (!input.storeId) {
      return { success: false, error: "Store ID wajib disertakan." };
    }

    const result = await updateStoreQueueStrategy(input.storeId, input.queueStrategy);

    if (session.storeSlug) {
      revalidatePath(`/${session.storeSlug}/dashboard`);
      revalidatePath(`/${session.storeSlug}/pos`);
      revalidatePath(`/${session.storeSlug}/queue`);
    }

    return {
      success: true,
      queueStrategy: result.queueStrategy,
    };
  } catch (error: any) {
    console.error("Gagal mengubah strategi antrean toko:", error);
    return {
      success: false,
      error: error.message || "Terjadi kesalahan saat memperbarui strategi antrean.",
    };
  }
}
