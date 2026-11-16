"use client";

import React, { useState } from "react";
import { recordPettyCashAction } from "../actions/registerActions";
import { formatRupiah } from "@/shared/lib/formatters";
import { Receipt, AlertCircle, ShoppingCart } from "lucide-react";

interface PettyCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  registerId: string;
  expectedDrawerCash: number;
  onSuccess?: () => void;
}

const CATEGORIES = [
  { id: "OPERASIONAL", label: "Operasional" },
  { id: "MINUMAN", label: "Air Minum / Galon" },
  { id: "KEBERSIHAN", label: "Alat Kebersihan" },
  { id: "KONSUMSI", label: "Makan / Snack" },
  { id: "LAINNYA", label: "Lain-lain" },
];

export const PettyCashModal: React.FC<PettyCashModalProps> = ({
  isOpen,
  onClose,
  registerId,
  expectedDrawerCash,
  onSuccess,
}) => {
  const [category, setCategory] = useState<string>("OPERASIONAL");
  const [amount, setAmount] = useState<number>(0);
  const [customInput, setCustomInput] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    const parsed = parseInt(rawVal, 10) || 0;
    setAmount(parsed);
    setCustomInput(rawVal);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setErrorMessage("Nominal pengeluaran harus lebih dari 0.");
      return;
    }
    if (!notes.trim()) {
      setErrorMessage("Keterangan keperluan kas kecil wajib diisi.");
      return;
    }

    if (amount > expectedDrawerCash) {
      setErrorMessage(
        `Nominal melebihi saldo kas fisik yang tersedia di laci (${formatRupiah(
          expectedDrawerCash
        )}).`
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await recordPettyCashAction({
        registerId,
        amount,
        category,
        notes: notes.trim(),
      });

      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mencatat pengeluaran kas kecil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-white text-[#1A1A1A] border border-[#E8E5DE] rounded-t-3xl sm:rounded-3xl shadow-xl p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between border-b border-[#E8E5DE] pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FDF0F2] text-[#D93025] flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A]">Catat Kas Kecil (Petty Cash)</h3>
              <p className="text-xs text-[#706E68]">Pengeluaran mendesak dari laci kasir</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#706E68] hover:text-[#1A1A1A] text-sm font-semibold p-1"
          >
            ✕
          </button>
        </div>

        {/* Info Saldo Laci Saat Ini */}
        <div className="bg-[#F6F5F2] border border-[#E8E5DE] rounded-2xl p-3 mb-4 flex items-center justify-between">
          <span className="text-xs text-[#706E68]">Kas Laci Tersedia Saat Ini:</span>
          <span className="text-xs font-bold font-mono text-[#1A1A1A]">
            {formatRupiah(expectedDrawerCash)}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kategori */}
          <div>
            <label className="text-xs font-semibold text-[#1A1A1A] block mb-2">
              Kategori Pengeluaran:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`py-1.5 px-3 text-xs font-medium rounded-full border transition ${
                    category === cat.id
                      ? "bg-[#111111] text-white border-[#111111] font-semibold"
                      : "bg-[#F6F5F2] text-[#706E68] border-[#E8E5DE] hover:bg-[#EFECE6]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nominal */}
          <div>
            <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">
              Nominal Pengeluaran (Rp):
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#706E68] font-semibold text-sm">
                Rp
              </span>
              <input
                type="text"
                value={customInput ? Number(customInput).toLocaleString("id-ID") : ""}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full bg-[#F6F5F2] border border-[#E8E5DE] rounded-xl pl-10 pr-3 py-2.5 text-base font-bold font-mono text-[#1A1A1A] focus:outline-none focus:border-[#111111] transition"
              />
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">
              Keterangan Lengkap:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Beli 2 galon air mineral + es batu untuk tamu"
              className="w-full bg-[#F6F5F2] border border-[#E8E5DE] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] placeholder:text-[#A8A59E] focus:outline-none focus:border-[#111111] transition resize-none"
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
              disabled={isSubmitting || amount <= 0 || !notes.trim()}
              className="flex-1 py-2.5 rounded-full bg-[#111111] hover:bg-[#222222] disabled:bg-[#E8E5DE] disabled:text-[#A8A59E] text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Pengeluaran"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
