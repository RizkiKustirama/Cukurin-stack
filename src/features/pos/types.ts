// Feature types for POS Kasir Mobile
import type { Ticket, TicketItem, TicketPayment, OrderType, PaymentMethod } from "@prisma/client";

export interface CartItem {
  id: string;
  itemType: "SERVICE" | "PRODUCT";
  serviceId?: string;
  productId?: string;
  itemName: string;
  price: number;
  quantity: number;
  recommendedById?: string;
}

export interface CreateTicketDTO {
  storeId: string;
  cashierId: string;
  orderType: OrderType;
  customerName?: string;
  customerPhone?: string;
  haircutNotes?: string;
  requestedBarberId?: string;
  items: CartItem[];
  tipAmount?: number;
  paymentMethod?: PaymentMethod;
  isPaidImmediately?: boolean;
}

export type { Ticket, TicketItem, TicketPayment };
