// Feature types for Customer CRM Module
import type { Customer, Ticket } from "@prisma/client";

export interface CustomerSearchDTO {
  tenantId: string;
  query: string; // Phone or name
}

export interface CustomerWithHistory extends Customer {
  tickets?: Ticket[];
}

export interface UpsertCustomerDTO {
  tenantId: string;
  name: string;
  phone: string;
  haircutNotes?: string;
}

export type { Customer };
