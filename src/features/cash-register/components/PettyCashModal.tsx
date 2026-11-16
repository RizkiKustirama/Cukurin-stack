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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#18181B] text-[#F4F4F5] border border-amber-900/40 rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Catat Kas Kecil (Petty Cash)</h3>
              <p className="text-xs text-zinc-400">Pengeluaran mendesak dari laci kasir</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 text-sm font-semibold p-1"
          >
            ✕
          </button>
        </div>

        {/* Info Saldo Laci Saat Ini */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 mb-4 flex items-center justify-between">
          <span className="text-xs text-zinc-400">Kas Laci Tersedia Saat Ini:</span>
          <span className="text-xs font-bold text-amber-400">
            {formatRupiah(expectedDrawerCash)}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kategori */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2">
              Kategori Pengeluaran:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`py-1.5 px-2.5 text-xs font-medium rounded-lg border transition ${
                    category === cat.id
                      ? "bg-amber-600 text-white border-amber-500 font-semibold"
                      : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nominal */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Nominal Pengeluaran (Rp):
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-semibold text-sm">
                Rp
              </span>
              <input
                type="text"
                value={customInput ? Number(customInput).toLocaleString("id-ID") : ""}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-3 py-2.5 text-base font-bold text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Keterangan Lengkap:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Beli 2 galon air mineral + es batu untuk tamu"
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 resize-none"
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
              disabled={isSubmitting || amount <= 0 || !notes.trim()}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-bold shadow-lg shadow-rose-950 transition flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Pengeluaran"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
