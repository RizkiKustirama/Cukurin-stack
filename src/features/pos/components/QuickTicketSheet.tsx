"use client";

import React, { useEffect } from "react";
import { X, Scissors } from "lucide-react";
import { PosTransactionForm } from "./PosTransactionForm";
import type {
  MasterService,
  MasterProduct,
  MasterBarber,
  TicketFormSubmitData,
} from "../types";

export type { MasterService, MasterProduct, MasterBarber, TicketFormSubmitData };

export interface QuickTicketSheetProps {
  isOpen: boolean;
  onClose: () => void;
  storeId?: string;
  services?: MasterService[];
  products?: MasterProduct[];
  barbers?: MasterBarber[] | any[];
  initialServices?: MasterService[];
  initialProducts?: MasterProduct[];
  initialBarbers?: any[];
  onSubmit?: (data: TicketFormSubmitData) => Promise<void> | void;
  onSuccess?: (result?: any) => void;
}

export function QuickTicketSheet({
  isOpen,
  onClose,
  storeId,
  services,
  products,
  barbers,
  initialServices,
  initialProducts,
  initialBarbers,
  onSubmit,
  onSuccess,
}: QuickTicketSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-full max-h-[92vh] bg-[#181614] border-t border-[#38332c] rounded-t-3xl shadow-2xl flex flex-col z-10">
        <div className="pt-3 pb-1 cursor-grab" onClick={onClose}>
          <div className="w-12 h-1.5 bg-stone-600/70 hover:bg-stone-500 rounded-full mx-auto" />
        </div>

        <div className="px-5 py-3 border-b border-[#2c2823] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100">
                Tiket Transaksi Baru
              </h3>
              <p className="text-[11px] text-stone-400">
                Pilih paket cukur atau beli produk retail
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#221f1b] hover:bg-stone-800 text-stone-400 hover:text-stone-100 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto max-h-[calc(92vh-75px)] pb-10">
          <PosTransactionForm
            storeId={storeId}
            services={services}
            products={products}
            barbers={barbers}
            initialServices={initialServices}
            initialProducts={initialProducts}
            initialBarbers={initialBarbers}
            onSubmit={async (data) => {
              if (onSubmit) await onSubmit(data);
              onClose();
            }}
            onSuccess={() => {
              if (onSuccess) onSuccess();
              onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
