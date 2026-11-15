"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { rawPrisma } from "@/shared/db";
import { createSessionCookie, type SessionUser } from "@/shared/auth";
import type { ActionResult } from "@/shared/types/action";

const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Nomor WhatsApp atau Email wajib diisi.")
    .transform((val) => val.trim()),
  password: z.string().min(1, "Password wajib diisi."),
});

export type LoginActionResult = ActionResult<{ redirectUrl: string }>;

/**
 * Server Action for User Login.
 * Supports both FormData and plain object inputs.
 */
export async function loginAction(
  _prevState: unknown,
  formData: FormData | Record<string, unknown>
): Promise<LoginActionResult> {
  try {
    let rawIdentifier = "";
    let rawPassword = "";

    if (formData instanceof FormData) {
      rawIdentifier = (formData.get("identifier") as string) || "";
      rawPassword = (formData.get("password") as string) || "";
    } else if (typeof formData === "object" && formData !== null) {
      rawIdentifier = String(formData.identifier || "");
      rawPassword = String(formData.password || "");
    }

    const validation = loginSchema.safeParse({
      identifier: rawIdentifier,
      password: rawPassword,
    });

    if (!validation.success) {
      const flattened = validation.error.flatten();
      const firstError =
        flattened.fieldErrors.identifier?.[0] ||
        flattened.fieldErrors.password?.[0] ||
        "Data yang dimasukkan tidak valid.";

      return {
        success: false,
        error: firstError,
        fieldErrors: flattened.fieldErrors,
      };
    }

    const { identifier, password } = validation.data;

    // Query user by phone or email (case-insensitive for email)
    const user = await rawPrisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: identifier, mode: "insensitive" } },
          { phone: identifier },
        ],
      },
      include: {
        tenant: {
          include: {
            stores: {
              take: 1,
              select: { id: true },
            },
          },
        },
        store: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "Nomor WhatsApp / Email atau password salah.",
      };
    }

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        success: false,
        error: "Nomor WhatsApp / Email atau password salah.",
      };
    }

    // Check if user is active
    if (!user.isActive) {
      return {
        success: false,
        error: "Akun Anda dinonaktifkan. Silakan hubungi admin.",
      };
    }

    const storeId = user.storeId || user.tenant?.stores?.[0]?.id || null;
    const storeSlug = user.tenant?.slug || null;

    // Create session cookie
    const sessionUser: SessionUser = {
      userId: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      storeId,
      storeSlug,
      brandName: user.tenant?.brandName || user.tenant?.name || null,
      isOnboarded: user.tenant?.isOnboarded ?? false,
    };

    await createSessionCookie(sessionUser);

    // Compute redirect URL according to RBAC matrix
    let redirectUrl = "/";
    const slug = storeSlug || "store";

    switch (user.role) {
      case "SUPERADMIN":
      case "PLATFORM_ADMIN":
        redirectUrl = "/admin";
        break;

      case "OWNER":
      case "MANAGER":
        if (!user.tenant?.isOnboarded) {
          redirectUrl = `/${slug}/onboarding`;
        } else {
          redirectUrl = `/${slug}/dashboard`;
        }
        break;

      case "CASHIER":
        redirectUrl = `/${slug}/pos`;
        break;

      case "BARBER":
        redirectUrl = `/${slug}/barber`;
        break;

      default:
        redirectUrl = `/${slug}/dashboard`;
        break;
    }

    return {
      success: true,
      data: { redirectUrl },
    };
  } catch (error) {
    console.error("Login action error:", error);
    return {
      success: false,
      error: "Terjadi kesalahan pada server saat mencoba login. Silakan coba lagi.",
    };
  }
}
