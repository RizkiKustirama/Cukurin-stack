"use client";

import React, { useState } from "react";
import { openRegisterAction } from "../actions/registerActions";
import { formatRupiah } from "@/shared/lib/formatters";
import { Lock, AlertCircle, CheckCircle2, DollarSign, Wallet } from "lucide-react";

interface OpenRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  cashierId: string;
  vaultBalance: number;
  onSuccess?: () => void;
}

const QUICK_PRESETS = [100000, 200000, 350000, 500000];

export const OpenRegisterModal: React.FC<OpenRegisterModalProps> = ({
  isOpen,
  onClose,
  storeId,
  cashierId,
  vaultBalance,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<number>(350000);
  const [customInput, setCustomInput] = useState<string>("350000");
  const [notes, setNotes] = useState<string>("Modal kas pagi diambil dari brankas toko");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePresetSelect = (preset: number) => {
    setAmount(preset);
    setCustomInput(preset.toString());
    setErrorMessage(null);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    const parsed = parseInt(rawVal, 10) || 0;
    setAmount(parsed);
    setCustomInput(rawVal);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setErrorMessage("Nominal modal kas pagi harus lebih dari 0.");
      return;
    }

    if (amount > vaultBalance) {
      setErrorMessage(
        `Nominal melebihi saldo brankas toko (${formatRupiah(vaultBalance)}).`
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await openRegisterAction({
        storeId,
        cashierId,
        openingCash: amount,
        notes,
      });

      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan sistem saat membuka kasir.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isExceeded = amount > vaultBalance;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#18181B] text-[#F4F4F5] border border-amber-900/40 rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Buka Kasir Pagi</h3>
              <p className="text-xs text-zinc-400">Tarik deposit uang modal dari Brankas Toko</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 text-sm font-semibold p-1"
          >
            ✕
          </button>
        </div>

        {/* Info Saldo Brankas */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 mb-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 block font-semibold">
              Saldo Brankas Toko Saat Ini
            </span>
            <span className="text-base font-bold text-amber-400">
              {formatRupiah(vaultBalance)}
            </span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-medium">
            Tersedia
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Preset Buttons */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2">
              Pilihan Cepat Nominal Modal:
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {QUICK_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => handlePresetSelect(preset)}
                  className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all ${
                    amount === preset
                      ? "bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-900/40"
                      : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800"
                  }`}
                >
                  {formatRupiah(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Nominal Modal Ditarik (Rp):
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-semibold text-sm">
                Rp
              </span>
              <input
                type="text"
                value={customInput ? Number(customInput).toLocaleString("id-ID") : ""}
                onChange={handleCustomChange}
                placeholder="0"
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-3 py-2.5 text-base font-bold text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            {isExceeded && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> Nominal melebihi saldo brankas toko!
              </p>
            )}
          </div>

          {/* Sisa Brankas Preview */}
          <div className="text-xs text-zinc-400 flex justify-between px-1">
            <span>Estimasi sisa di brankas toko:</span>
            <span
              className={`font-semibold ${
                isExceeded ? "text-rose-400" : "text-zinc-200"
              }`}
            >
              {formatRupiah(Math.max(0, vaultBalance - amount))}
            </span>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Catatan / Memo:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Modal pagi pecahan kecil 5k, 10k, 20k"
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isExceeded || amount <= 0}
              className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-bold shadow-lg shadow-amber-950 transition flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? "Membuka Kasir..." : "Buka Kasir Sekarang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
