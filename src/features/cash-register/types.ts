// Feature types for Cash Register Module
import type { DailyRegister, PettyCashExpense } from "@prisma/client";

export interface OpenRegisterDTO {
  storeId: string;
  cashierId: string;
  openingCash: number;
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

export type { DailyRegister, PettyCashExpense };
