"use server";

import { rawPrisma } from "@/shared/db";
import { requireAuth } from "@/shared/auth";
import type { ActionResult } from "@/shared/types/action";
import {
  type CreateTicketDTO,
  type PosCustomerSearchResult,
  type ActiveBarberOption,
  createTicketSchema,
  type TicketWithRelations,
} from "../types";
import { generateTicketNumber } from "../services/ticketNumberGenerator";
import { onBarberReady } from "@/features/queue";
import type { PaymentMethod, ServiceStatus, PaymentStatus } from "@prisma/client";

/**
 * Mencari data pelanggan berdasarkan nomor WhatsApp / HP.
 * Digunakan untuk autofill nama, catatan potong terakhir, dan badge kunjungan.
 */
export async function searchCustomerByPhoneAction(
  phone: string
): Promise<ActionResult<PosCustomerSearchResult | null>> {
  try {
    const session = await requireAuth(["CASHIER", "OWNER", "MANAGER", "BARBER"]);
    if (!session.tenantId) {
      return { success: false, error: "Tenant session tidak ditemukan" };
    }

    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 4) {
      return { success: true, data: null };
    }

    const customer = await rawPrisma.customer.findFirst({
      where: {
        tenantId: session.tenantId,
        phone: cleanPhone,
      },
    });

    if (!customer) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        haircutNotes: customer.haircutNotes,
        visitCount: customer.visitCount,
        lastVisitAt: customer.lastVisitAt,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mencari data pelanggan";
    return { success: false, error: message };
  }
}

/**
 * Mendapatkan daftar barber aktif di cabang toko beserta status kesiapannya.
 */
export async function getActiveBarbersAction(
  storeId: string
): Promise<ActionResult<ActiveBarberOption[]>> {
  try {
    await requireAuth(["CASHIER", "OWNER", "MANAGER", "BARBER"]);

    const barbers = await rawPrisma.barberProfile.findMany({
      where: {
        storeId,
        user: { isActive: true },
      },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { user: { name: "asc" } },
    });

    const result: ActiveBarberOption[] = barbers.map((b) => ({
      id: b.id,
      userId: b.userId,
      name: b.user.name,
      workStatus: b.workStatus,
      serviceCommissionPct: Number(b.serviceCommissionPct),
      productCommissionFlat: Number(b.productCommissionFlat),
    }));

    return { success: true, data: result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memuat daftar barber";
    return { success: false, error: message };
  }
}

/**
 * Mendapatkan katalog paket layanan dan produk retail aktif untuk POS Kasir.
 */
export async function getStoreCatalogAction(storeId: string): Promise<
  ActionResult<{
    services: Array<{
      id: string;
      name: string;
      price: number;
      durationMinutes: number;
      description: string | null;
    }>;
    products: Array<{
      id: string;
      name: string;
      sellingPrice: number;
      stockQuantity: number;
    }>;
  }>
> {
  try {
    await requireAuth(["CASHIER", "OWNER", "MANAGER", "BARBER"]);

    const [services, products] = await Promise.all([
      rawPrisma.service.findMany({
        where: { storeId, isActive: true },
        orderBy: { name: "asc" },
      }),
      rawPrisma.product.findMany({
        where: { storeId, isActive: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return {
      success: true,
      data: {
        services: services.map((s) => ({
          id: s.id,
          name: s.name,
          price: Number(s.price),
          durationMinutes: s.durationMinutes,
          description: s.description,
        })),
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          sellingPrice: Number(p.sellingPrice),
          stockQuantity: p.stockQuantity,
        })),
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memuat katalog toko";
    return { success: false, error: message };
  }
}

/**
 * Membuat Tiket Transaksi Baru di POS Kasir
 */
export async function createTicketAction(
  dto: CreateTicketDTO
): Promise<
  ActionResult<{
    ticketId: string;
    ticketNumber: string;
    serviceStatus: ServiceStatus;
    paymentStatus: PaymentStatus;
  }>
> {
  try {
    const session = await requireAuth(["CASHIER", "OWNER", "MANAGER"]);
    const tenantId = session.tenantId;

    if (!tenantId) {
      return { success: false, error: "Tenant context tidak ditemukan" };
    }

    // 1. Validasi DTO dengan Zod
    const validation = createTicketSchema.safeParse(dto);
    if (!validation.success) {
      const fieldErrors: Record<string, string[]> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        fieldErrors[path] = fieldErrors[path] || [];
        fieldErrors[path].push(issue.message);
      });
      return { success: false, error: "Validasi form gagal", fieldErrors };
    }

    const validData = validation.data;
    const storeId = validData.storeId;
    const cashierId = session.userId;

    // 2. Generate Nomor Tiket Unik Hari Ini: TKT-YYYYMMDD-XXX
    const ticketNumber = await generateTicketNumber(storeId);

    // 3. Upsert Pelanggan (CRM) jika nomor HP disediakan
    let customerId: string | null = null;
    if (validData.customerPhone && validData.customerPhone.trim() !== "") {
      const cleanPhone = validData.customerPhone.trim();
      const existingCustomer = await rawPrisma.customer.findFirst({
        where: {
          tenantId,
          phone: cleanPhone,
        },
      });

      if (existingCustomer) {
        const updatedCustomer = await rawPrisma.customer.update({
          where: { id: existingCustomer.id },
          data: {
            visitCount: { increment: 1 },
            lastVisitAt: new Date(),
            name: validData.customerName?.trim() || existingCustomer.name,
            haircutNotes:
              validData.haircutNotes !== undefined && validData.haircutNotes !== null
                ? validData.haircutNotes
                : existingCustomer.haircutNotes,
          },
        });
        customerId = updatedCustomer.id;
      } else {
        const newCustomer = await rawPrisma.customer.create({
          data: {
            tenantId,
            name: validData.customerName?.trim() || "Pelanggan",
            phone: cleanPhone,
            haircutNotes: validData.haircutNotes || null,
            visitCount: 1,
            lastVisitAt: new Date(),
          },
        });
        customerId = newCustomer.id;
      }
    }

    // 4. Hitung Nilai Subtotal & Total
    const subtotal = validData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tipAmount = validData.tipAmount || 0;
    const totalAmount = subtotal + tipAmount;

    // 5. Tentukan Status Pengerjaan (serviceStatus) & Barber Assignment
    let serviceStatus: ServiceStatus = "WAITING";
    let assignedBarberId: string | null = null;
    let shouldUpdateBarberToBusy = false;

    if (validData.orderType === "RETAIL_ONLY") {
      serviceStatus = "COMPLETED";
      assignedBarberId = null;
    } else {
      // Mode SERVICE
      if (validData.requestedBarberId) {
        // Cek apakah barber yang di-request saat ini berstatus READY
        const requestedBarber = await rawPrisma.barberProfile.findUnique({
          where: { id: validData.requestedBarberId },
        });

        if (requestedBarber && requestedBarber.workStatus === "READY") {
          assignedBarberId = validData.requestedBarberId;
          serviceStatus = "IN_SERVICE";
          shouldUpdateBarberToBusy = true;
        } else {
          // Barber tidak ready, tiket masuk antrean WAITING dengan requestedBarberId tercatat
          assignedBarberId = null;
          serviceStatus = "WAITING";
        }
      } else {
        // Siapa Saja (FIFO / Bebas)
        // Cari barber yang sedang READY dengan waktu antre tunggu terlama (lastReadyAt ASC)
        const readyBarber = await rawPrisma.barberProfile.findFirst({
          where: {
            storeId,
            workStatus: "READY",
          },
          orderBy: { lastReadyAt: "asc" },
        });

        if (readyBarber) {
          assignedBarberId = readyBarber.id;
          serviceStatus = "IN_SERVICE";
          shouldUpdateBarberToBusy = true;
        } else {
          assignedBarberId = null;
          serviceStatus = "WAITING";
        }
      }
    }

    // 6. Tentukan Status Pembayaran & Persiapan DailyRegister
    const isPaidImmediately = Boolean(validData.isPaidImmediately);
    const paymentStatus: PaymentStatus = isPaidImmediately ? "PAID" : "UNPAID";

    let openDailyRegisterId: string | null = null;
    if (isPaidImmediately) {
      // Ambil register kasir yang berstatus OPEN di toko ini
      let openRegister = await rawPrisma.dailyRegister.findFirst({
        where: {
          storeId,
          status: "OPEN",
        },
        orderBy: { openedAt: "desc" },
      });

      // Fallback: Jika kasir belum manual buka buku kas, buatkan register otomatis
      if (!openRegister) {
        openRegister = await rawPrisma.dailyRegister.create({
          data: {
            storeId,
            cashierId,
            openingCash: 0,
            status: "OPEN",
            notes: "Buku kas dibuka otomatis oleh sistem transaksi POS",
          },
        });
      }
      openDailyRegisterId = openRegister.id;
    }

    // 7. Simpan Tiket, TicketItem, Pemotongan Stok Produk, dan Pembayaran dalam Transaction
    const newTicket = await rawPrisma.$transaction(async (tx) => {
      // Buat Tiket
      const ticket = await tx.ticket.create({
        data: {
          ticketNumber,
          storeId,
          customerId,
          orderType: validData.orderType,
          requestedBarberId: validData.requestedBarberId || null,
          assignedBarberId,
          serviceStatus,
          paymentStatus,
          subtotal,
          tipAmount,
          totalAmount,
          cashierId,
          closedAt:
            serviceStatus === "COMPLETED" && paymentStatus === "PAID"
              ? new Date()
              : null,
        },
      });

      // Buat TicketItems
      for (const item of validData.items) {
        await tx.ticketItem.create({
          data: {
            ticketId: ticket.id,
            itemType: item.itemType,
            serviceId: item.itemType === "SERVICE" ? item.serviceId || null : null,
            productId: item.itemType === "PRODUCT" ? item.productId || null : null,
            itemName: item.itemName,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
            recommendedById: item.recommendedById || null,
            commissionAmount: item.commissionAmount || 0,
          },
        });

        // Potong stok produk retail langsung di database
        if (item.itemType === "PRODUCT" && item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      // Catat TicketPayment jika bayar di depan
      if (isPaidImmediately && openDailyRegisterId) {
        await tx.ticketPayment.create({
          data: {
            ticketId: ticket.id,
            dailyRegisterId: openDailyRegisterId,
            paymentMethod: validData.paymentMethod || "CASH",
            amount: totalAmount,
          },
        });
      }

      // Update status barber menjadi BUSY jika auto-assigned
      if (shouldUpdateBarberToBusy && assignedBarberId) {
        await tx.barberProfile.update({
          where: { id: assignedBarberId },
          data: {
            workStatus: "BUSY",
          },
        });
      }

      return ticket;
    });

    // 8. Panggil onBarberReady jika tiket WAITING agar langsung di-assign jika ada barber READY
    if (serviceStatus === "WAITING") {
      try {
        await onBarberReady(storeId);
      } catch (err) {
        console.error("Queue auto-dispatch warning:", err);
      }
    }

    return {
      success: true,
      data: {
        ticketId: newTicket.id,
        ticketNumber: newTicket.ticketNumber,
        serviceStatus: newTicket.serviceStatus,
        paymentStatus: newTicket.paymentStatus,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal membuat tiket transaksi";
    return { success: false, error: message };
  }
}

/**
 * Pelunasan Tiket Transaksi (Bayar di Belakang)
 */
export async function settleTicketAction(
  ticketId: string,
  paymentMethod: PaymentMethod,
  amount: number,
  tipAmount?: number
): Promise<ActionResult<{ success: true }>> {
  try {
    const session = await requireAuth(["CASHIER", "OWNER", "MANAGER"]);

    const ticket = await rawPrisma.ticket.findUnique({
      where: { id: ticketId },
      include: { payments: true },
    });

    if (!ticket) {
      return { success: false, error: "Tiket tidak ditemukan" };
    }

    if (ticket.paymentStatus === "PAID") {
      return { success: false, error: "Tiket ini sudah lunas sebelumnya" };
    }

    // Ambil atau buat register kasir yang OPEN
    let openRegister = await rawPrisma.dailyRegister.findFirst({
      where: {
        storeId: ticket.storeId,
        status: "OPEN",
      },
      orderBy: { openedAt: "desc" },
    });

    if (!openRegister) {
      openRegister = await rawPrisma.dailyRegister.create({
        data: {
          storeId: ticket.storeId,
          cashierId: session.userId,
          openingCash: 0,
          status: "OPEN",
          notes: "Buku kas dibuka otomatis saat pelunasan tiket",
        },
      });
    }

    const appliedTip = tipAmount !== undefined ? tipAmount : Number(ticket.tipAmount);
    const updatedTotal = Number(ticket.subtotal) + appliedTip;

    await rawPrisma.$transaction(async (tx) => {
      // 1. Buat pembayaran
      await tx.ticketPayment.create({
        data: {
          ticketId: ticket.id,
          dailyRegisterId: openRegister.id,
          paymentMethod,
          amount,
        },
      });

      // 2. Update status tiket menjadi PAID
      await tx.ticket.update({
        where: { id: ticket.id },
        data: {
          paymentStatus: "PAID",
          tipAmount: appliedTip,
          totalAmount: updatedTotal,
          closedAt: ticket.serviceStatus === "COMPLETED" ? new Date() : null,
        },
      });
    });

    return { success: true, data: { success: true } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal melakukan pelunasan tiket";
    return { success: false, error: message };
  }
}

/**
 * Membatalkan Tiket Transaksi
 */
export async function cancelTicketAction(
  ticketId: string,
  reason?: string
): Promise<ActionResult<{ success: true }>> {
  try {
    await requireAuth(["CASHIER", "OWNER", "MANAGER"]);

    const ticket = await rawPrisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return { success: false, error: "Tiket tidak ditemukan" };
    }

    if (ticket.serviceStatus === "COMPLETED") {
      return { success: false, error: "Tiket yang sudah selesai tidak dapat dibatalkan" };
    }

    const wasInService = ticket.serviceStatus === "IN_SERVICE";
    const assignedBarberId = ticket.assignedBarberId;

    await rawPrisma.$transaction(async (tx) => {
      await tx.ticket.update({
        where: { id: ticketId },
        data: {
          serviceStatus: "CANCELLED",
        },
      });

      // Jika tiket sedang dikerjakan barber, bebaskan barber menjadi READY kembali
      if (wasInService && assignedBarberId) {
        await tx.barberProfile.update({
          where: { id: assignedBarberId },
          data: {
            workStatus: "READY",
            lastReadyAt: new Date(),
          },
        });
      }
    });

    // Jalankan antrean untuk barber yang baru dibebaskan
    if (wasInService && assignedBarberId) {
      try {
        await onBarberReady(ticket.storeId, assignedBarberId);
      } catch (err) {
        console.error("Queue dispatch error on cancel:", err);
      }
    }

    return { success: true, data: { success: true } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal membatalkan tiket";
    return { success: false, error: message };
  }
}

/**
 * Mendapatkan detail tiket untuk modal pelunasan atau cetak
 */
export async function getTicketDetailsAction(
  ticketId: string
): Promise<ActionResult<TicketWithRelations | null>> {
  try {
    await requireAuth(["CASHIER", "OWNER", "MANAGER", "BARBER"]);

    const ticket = await rawPrisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        customer: true,
        items: true,
        payments: true,
        requestedBarber: {
          include: {
            user: { select: { name: true } },
          },
        },
        assignedBarber: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!ticket) {
      return { success: false, error: "Tiket tidak ditemukan" };
    }

    return { success: true, data: ticket as TicketWithRelations };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memuat detail tiket";
    return { success: false, error: message };
  }
}
