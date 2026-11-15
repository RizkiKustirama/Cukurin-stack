"use client";

import React, { useState } from "react";
import { CheckCircle2, Coffee, Sparkles, X, Loader2, User, Scissors } from "lucide-react";
import type { QueueItemTicket } from "../types";

export interface BarberCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: QueueItemTicket | null;
  barberName: string;
  barberId: string;
  onComplete: (ticketId: string, barberId: string, nextStatus: "READY" | "BREAK") => Promise<void> | void;
  isLoading?: boolean;
}

export function BarberCompletionModal({
  isOpen,
  onClose,
  ticket,
  barberName,
  barberId,
  onComplete,
  isLoading: externalLoading = false,
}: BarberCompletionModalProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<"READY" | "BREAK" | null>(null);

  if (!isOpen || !ticket) {
    return null;
  }

  const isLoading = externalLoading || internalLoading;

  const handleSelectStatus = async (status: "READY" | "BREAK") => {
    if (isLoading) return;
    try {
      setInternalLoading(true);
      setPendingStatus(status);
      await onComplete(ticket.id, barberId, status);
      onClose();
    } catch (err) {
      console.error("Gagal menyelesaikan servis:", err);
    } finally {
      setInternalLoading(false);
      setPendingStatus(null);
    }
  };

  const customerName = ticket.customer?.name || "Pelanggan Walk-in";
  const serviceName =
    ticket.items && ticket.items.length > 0
      ? ticket.items.map((i) => i.itemName).join(", ")
      : "Layanan Cukur";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg bg-[#221f1b] border-t sm:border border-[#38332c] rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 text-[#f5f4f0] shadow-2xl space-y-5 animate-in slide-in-from-bottom-5 duration-300"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-[#38332c] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Scissors className="w-5 h-5 rotate-[-45deg]" />
            </div>
            <div>
              <h3 id="modal-title" className="text-base font-bold text-[#f5f4f0]">
                Konfirmasi Selesai Cukur
              </h3>
              <p className="text-xs text-[#a39e93]">
                Pilih status kerja barber berikutnya
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#a39e93] hover:text-[#f5f4f0] hover:bg-[#2c2823] transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ringkasan Tiket yang Selesai */}
        <div className="bg-[#181614] border border-[#38332c] rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#a39e93]">
            <span>Nomor Tiket: <strong className="text-amber-400 font-mono">{ticket.ticketNumber}</strong></span>
            <span className="flex items-center gap-1 text-[#f5f4f0] font-medium">
              <User className="w-3.5 h-3.5 text-amber-400" />
              {barberName}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#f5f4f0] truncate">
                {customerName}
              </p>
              <p className="text-xs text-[#a39e93] truncate">
                {serviceName}
              </p>
            </div>
            <div className="px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shrink-0">
              Potong Selesai
            </div>
          </div>
        </div>

        {/* Petunjuk Kasir */}
        <p className="text-xs text-[#a39e93] text-center">
          Pilih status selanjutnya untuk <strong>{barberName}</strong>:
        </p>

        {/* 2 Tombol Besar Ergonomis Satu Jempol */}
        <div className="space-y-3 pt-1">
          {/* Tombol 1: READY (Hijau Emerald) */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleSelectStatus("READY")}
            className="w-full min-h-[64px] px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:scale-[0.98] text-white rounded-2xl border border-emerald-400/30 shadow-lg shadow-emerald-950/40 flex items-center justify-between gap-3 transition-all disabled:opacity-60 cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                {isLoading && pendingStatus === "READY" ? (
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <span className="block text-sm sm:text-base font-bold tracking-wide">
                  🟢 Ready (Siap Terima Berikutnya)
                </span>
                <span className="block text-xs text-emerald-100 font-normal">
                  Otomatis plot pelanggan dari antrean menunggu
                </span>
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-emerald-200 shrink-0 hidden sm:block" />
          </button>

          {/* Tombol 2: BREAK (Kuning Amber) */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleSelectStatus("BREAK")}
            className="w-full min-h-[64px] px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 active:scale-[0.98] text-white rounded-2xl border border-amber-400/30 shadow-lg shadow-amber-950/40 flex items-center justify-between gap-3 transition-all disabled:opacity-60 cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                {isLoading && pendingStatus === "BREAK" ? (
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                ) : (
                  <Coffee className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <span className="block text-sm sm:text-base font-bold tracking-wide">
                  🟡 Break (Istirahat / Sholat / Makan)
                </span>
                <span className="block text-xs text-amber-100 font-normal">
                  Kosongkan meja sementara, tidak auto-assign
                </span>
              </div>
            </div>
            <Coffee className="w-5 h-5 text-amber-200 shrink-0 hidden sm:block" />
          </button>
        </div>

        {/* Tombol Batal */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-2.5 text-xs text-[#a39e93] hover:text-[#f5f4f0] hover:bg-[#2c2823] rounded-xl transition-colors font-medium"
          >
            Batal / Kembali ke Layar Meja
          </button>
        </div>
      </div>
    </div>
  );
}

export default BarberCompletionModal;
