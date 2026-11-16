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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-white text-[#1A1A1A] border border-[#E8E5DE] rounded-t-3xl sm:rounded-3xl shadow-xl p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between border-b border-[#E8E5DE] pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FEF3EB] text-[#D97706] flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A]">Buka Kasir Pagi</h3>
              <p className="text-xs text-[#706E68]">Tarik deposit uang modal dari Brankas Toko</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#706E68] hover:text-[#1A1A1A] text-sm font-semibold p-1"
          >
            ✕
          </button>
        </div>

        {/* Info Saldo Brankas */}
        <div className="bg-[#F6F5F2] border border-[#E8E5DE] rounded-2xl p-3.5 mb-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#706E68] block font-semibold">
              Saldo Brankas Toko Saat Ini
            </span>
            <span className="text-base font-bold font-mono text-[#1A1A1A]">
              {formatRupiah(vaultBalance)}
            </span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#E8F7EE] text-[#1E8E3E] border border-[#A7F3D0]/60 font-semibold">
            Tersedia
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Preset Buttons */}
          <div>
            <label className="text-xs font-semibold text-[#1A1A1A] block mb-2">
              Pilihan Cepat Nominal Modal:
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {QUICK_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => handlePresetSelect(preset)}
                  className={`py-2 px-2 text-xs font-bold rounded-full border transition-all ${
                    amount === preset
                      ? "bg-[#111111] text-white border-[#111111] shadow-xs"
                      : "bg-[#F6F5F2] text-[#706E68] border-[#E8E5DE] hover:bg-[#EFECE6]"
                  }`}
                >
                  {formatRupiah(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input */}
          <div>
            <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">
              Nominal Modal Ditarik (Rp):
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#706E68] font-semibold text-sm">
                Rp
              </span>
              <input
                type="text"
                value={customInput ? Number(customInput).toLocaleString("id-ID") : ""}
                onChange={handleCustomChange}
                placeholder="0"
                className="w-full bg-[#F6F5F2] border border-[#E8E5DE] rounded-xl pl-10 pr-3 py-2.5 text-base font-bold font-mono text-[#1A1A1A] focus:outline-none focus:border-[#111111] transition"
              />
            </div>
            {isExceeded && (
              <p className="text-xs text-[#D93025] mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> Nominal melebihi saldo brankas toko!
              </p>
            )}
          </div>

          {/* Sisa Brankas Preview */}
          <div className="text-xs text-[#706E68] flex justify-between px-1">
            <span>Estimasi sisa di brankas toko:</span>
            <span
              className={`font-semibold font-mono ${
                isExceeded ? "text-[#D93025]" : "text-[#1A1A1A]"
              }`}
            >
              {formatRupiah(Math.max(0, vaultBalance - amount))}
            </span>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">
              Catatan / Memo:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Modal pagi pecahan kecil 5k, 10k, 20k"
              className="w-full bg-[#F6F5F2] border border-[#E8E5DE] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] placeholder:text-[#A8A59E] focus:outline-none focus:border-[#111111] transition"
            />
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-[#FDF0F2] border border-[#FECDD3] text-[#D93025] text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-full border border-[#E8E5DE] bg-white hover:bg-[#F6F5F2] text-[#706E68] text-xs font-semibold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isExceeded || amount <= 0}
              className="flex-1 py-2.5 rounded-full bg-[#111111] hover:bg-[#222222] disabled:bg-[#E8E5DE] disabled:text-[#A8A59E] text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? "Membuka Kasir..." : "Buka Kasir Sekarang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
