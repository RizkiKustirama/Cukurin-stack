// Feature types for POS Kasir Mobile
import type {
  Ticket,
  TicketItem,
  TicketPayment,
  OrderType,
  PaymentMethod,
  ServiceStatus,
  PaymentStatus,
  Customer,
  Service,
  Product,
  BarberProfile,
} from "@prisma/client";
import { z } from "zod";

export interface MasterService {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description?: string | null;
}

export interface MasterProduct {
  id: string;
  name: string;
  price?: number;
  sellingPrice?: number;
  stockQty?: number;
  stockQuantity?: number;
}

export interface MasterBarber {
  id: string;
  name: string;
  workStatus: string;
}

export interface TicketFormSubmitData {
  customerName: string;
  customerPhone?: string;
  haircutNotes?: string;
  orderType: "SERVICE" | "RETAIL_ONLY";
  requestedBarberId?: string;
  isPaidImmediately: boolean;
  paymentMethod?: "CASH" | "QRIS" | "TRANSFER" | "EDC";
  items: {
    itemType: "SERVICE" | "PRODUCT";
    serviceId?: string;
    productId?: string;
    name: string;
    price: number;
    quantity: number;
    recommendedById?: string;
  }[];
  totalAmount: number;
}

export interface TicketToPay {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerPhone?: string;
  barberName?: string;
  subtotal: number;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

export interface CartItem {
  id: string;
  itemType: "SERVICE" | "PRODUCT";
  serviceId?: string;
  productId?: string;
  itemName: string;
  price: number;
  quantity: number;
  recommendedById?: string;
  commissionAmount?: number;
}

export interface CreateTicketDTO {
  storeId: string;
  cashierId?: string;
  orderType: OrderType;
  customerName?: string;
  customerPhone?: string;
  haircutNotes?: string;
  requestedBarberId?: string | null;
  items: CartItem[];
  tipAmount?: number;
  paymentMethod?: PaymentMethod;
  isPaidImmediately?: boolean;
  amountPaid?: number;
}

export const cartItemSchema = z.object({
  id: z.string(),
  itemType: z.enum(["SERVICE", "PRODUCT"]),
  serviceId: z.string().optional(),
  productId: z.string().optional(),
  itemName: z.string().min(1, "Nama item tidak boleh kosong"),
  price: z.number().min(0, "Harga tidak boleh negatif"),
  quantity: z.number().int().min(1, "Jumlah minimal 1"),
  recommendedById: z.string().optional().nullable(),
  commissionAmount: z.number().min(0).optional(),
});

export const createTicketSchema = z.object({
  storeId: z.string().uuid("Store ID tidak valid"),
  cashierId: z.string().uuid("Cashier ID tidak valid").optional(),
  orderType: z.enum(["SERVICE", "RETAIL_ONLY"]),
  customerName: z.string().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  haircutNotes: z.string().optional().nullable(),
  requestedBarberId: z.string().uuid("Barber ID tidak valid").optional().nullable(),
  items: z.array(cartItemSchema).min(1, "Minimal pilih 1 layanan atau produk"),
  tipAmount: z.number().min(0).optional().default(0),
  paymentMethod: z.enum(["CASH", "QRIS", "TRANSFER", "EDC"]).optional(),
  isPaidImmediately: z.boolean().optional().default(false),
  amountPaid: z.number().min(0).optional(),
});

export interface PosCustomerSearchResult {
  id: string;
  name: string;
  phone: string;
  haircutNotes: string | null;
  visitCount: number;
  lastVisitAt: Date;
}

export interface ActiveBarberOption {
  id: string; // barberProfileId
  userId: string;
  name: string;
  workStatus: "READY" | "BUSY" | "BREAK" | "OFFLINE";
  serviceCommissionPct: number;
  productCommissionFlat: number;
}

export interface TicketWithRelations extends Ticket {
  customer?: Customer | null;
  items: TicketItem[];
  payments: TicketPayment[];
  requestedBarber?: (BarberProfile & { user?: { name: string } | null }) | null;
  assignedBarber?: (BarberProfile & { user?: { name: string } | null }) | null;
}

export type {
  Ticket,
  TicketItem,
  TicketPayment,
  OrderType,
  PaymentMethod,
  ServiceStatus,
  PaymentStatus,
  Customer,
  Service,
  Product,
  BarberProfile,
};
