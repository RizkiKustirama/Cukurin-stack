// Feature types for Cash Register Module (Buku Kas & Brankas Toko)
import type { DailyRegister, PettyCashExpense, TicketPayment } from "@prisma/client";

export interface StoreVaultInfo {
  storeId: string;
  storeName: string;
  vaultBalance: number;
}

export interface DailyRegisterSummary {
  register: DailyRegister;
  openingCash: number;
  totalCashSales: number;
  totalQrisSales: number;
  totalTransferSales: number;
  totalEdcSales: number;
  totalPettyExpenses: number;
  totalCommissionPaidFromDrawer: number;
  expectedDrawerCash: number;
  isClosed: boolean;
  actualCash: number | null;
  discrepancyCash: number | null;
}

export type CashMovementType =
  | "OPENING_DEPOSIT"
  | "CASH_SALE"
  | "PETTY_EXPENSE"
  | "BARBER_PAYOUT"
  | "CLOSING_SETOR";

export interface CashMovementItem {
  id: string;
  timestamp: Date;
  type: CashMovementType;
  description: string;
  amount: number;
  direction: "IN" | "OUT";
  runningBalance: number;
  referenceId?: string;
}

export interface OpenRegisterDTO {
  storeId: string;
  cashierId: string;
  openingCash: number;
  notes?: string;
}

export interface CloseRegisterDTO {
  registerId: string;
  actualCash: number;
  notes?: string;
}

export interface PettyExpenseDTO {
  registerId: string;
  amount: number;
  category: string;
  notes: string;
}

export type { DailyRegister, PettyCashExpense, TicketPayment };
