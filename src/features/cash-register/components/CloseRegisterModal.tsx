"use client";

import React, { useState } from "react";
import { closeRegisterAction } from "../actions/registerActions";
import { formatRupiah } from "@/shared/lib/formatters";
import { DailyRegisterSummary } from "../types";
import {
  Lock,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Calculator,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface CloseRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: DailyRegisterSummary;
  onSuccess?: () => void;
}

const DENOMINATIONS = [
  { val: 100000, label: "Rp 100.000" },
  { val: 50000, label: "Rp 50.000" },
  { val: 20000, label: "Rp 20.000" },
  { val: 10000, label: "Rp 10.000" },
  { val: 5000, label: "Rp 5.000" },
  { val: 2000, label: "Rp 2.000" },
  { val: 1000, label: "Rp 1.000" },
];

export const CloseRegisterModal: React.FC<CloseRegisterModalProps> = ({
  isOpen,
  onClose,
  summary,
  onSuccess,
}) => {
  const [useBreakdown, setUseBreakdown] = useState<boolean>(false);
  const [counts, setCounts] = useState<Record<number, number>>({
    100000: 0,
    50000: 0,
    20000: 0,
    10000: 0,
    5000: 0,
    2000: 0,
    1000: 0,
  });
  const [coinAmount, setCoinAmount] = useState<number>(0);

  const [manualInput, setManualInput] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Total counted cash
  let totalCounted = 0;
  if (useBreakdown) {
    for (const d of DENOMINATIONS) {
      totalCounted += (counts[d.val] || 0) * d.val;
    }
    totalCounted += coinAmount;
  } else {
    totalCounted = parseInt(manualInput.replace(/\D/g, ""), 10) || 0;
  }

  const discrepancy = totalCounted - summary.expectedDrawerCash;

  const handleCountChange = (val: number, delta: number) => {
    setCounts((prev) => {
      const current = prev[val] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [val]: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalCounted < 0) {
      setErrorMessage("Hasil hitung fisik uang tidak boleh negatif.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await closeRegisterAction({
        registerId: summary.register.id,
        actualCash: totalCounted,
        notes: notes.trim() || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menutup sesi kasir.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#18181B] text-[#F4F4F5] border border-amber-900/40 rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Tutup Kasir Malam (Blind Count)</h3>
              <p className="text-xs text-zinc-400">
                Hitung uang fisik & setor kembali ke Brankas Toko
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 text-sm font-semibold p-1"
          >
            ✕
          </button>
        </div>

        {/* Ringkasan Laci Sistem */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">
              Modal Awal Pagi
            </span>
            <span className="text-sm font-bold text-zinc-200">
              {formatRupiah(summary.openingCash)}
            </span>
          </div>
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">
              Ekspektasi Uang Fisik Laci
            </span>
            <span className="text-sm font-bold text-amber-400">
              {formatRupiah(summary.expectedDrawerCash)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Switch Mode: Manual vs Denomination */}
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl p-1.5">
            <button
              type="button"
              onClick={() => setUseBreakdown(false)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                !useBreakdown
                  ? "bg-zinc-800 text-amber-400 shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Input Nominal Langsung
            </button>
            <button
              type="button"
              onClick={() => setUseBreakdown(true)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                useBreakdown
                  ? "bg-zinc-800 text-amber-400 shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Kalkulator Pecahan (Lembar)
            </button>
          </div>

          {useBreakdown ? (
            /* Denomination Breakdown */
            <div className="space-y-2 bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 max-h-56 overflow-y-auto">
              {DENOMINATIONS.map((d) => {
                const count = counts[d.val] || 0;
                const sub = count * d.val;
                return (
                  <div
                    key={d.val}
                    className="flex items-center justify-between text-xs py-1 border-b border-zinc-800/60 last:border-0"
                  >
                    <span className="font-medium text-zinc-300 w-24">{d.label}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCountChange(d.val, -1)}
                        className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold flex items-center justify-center"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={count}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                          setCounts((prev) => ({ ...prev, [d.val]: val }));
                        }}
                        className="w-12 text-center bg-zinc-950 border border-zinc-800 rounded-lg py-1 font-bold text-zinc-100"
                      />
                      <button
                        type="button"
                        onClick={() => handleCountChange(d.val, 1)}
                        className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                    <span className="w-24 text-right font-semibold text-zinc-300">
                      {formatRupiah(sub)}
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-medium text-zinc-400">Total Koin (Rp):</span>
                <input
                  type="number"
                  min="0"
                  value={coinAmount || ""}
                  onChange={(e) =>
                    setCoinAmount(Math.max(0, parseInt(e.target.value, 10) || 0))
                  }
                  placeholder="0"
                  className="w-28 text-right bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 font-bold text-zinc-100"
                />
              </div>
            </div>
          ) : (
            /* Direct Total Input */
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Total Uang Fisik Hasil Hitung (Rp):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-semibold text-sm">
                  Rp
                </span>
                <input
                  type="text"
                  value={manualInput ? Number(manualInput).toLocaleString("id-ID") : ""}
                  onChange={(e) => setManualInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="0"
                  className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-3 py-2.5 text-base font-bold text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Realtime Discrepancy & Return To Vault Info */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col gap-1.5 transition ${
              discrepancy === 0
                ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
                : discrepancy > 0
                ? "bg-blue-950/40 border-blue-800/60 text-blue-300"
                : "bg-rose-950/40 border-rose-800/60 text-rose-300"
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">Fisik Nyata Dihitung:</span>
              <span className="font-bold text-sm text-zinc-100">
                {formatRupiah(totalCounted)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">Selisih Audit (Discrepancy):</span>
              <span className="font-bold">
                {discrepancy === 0
                  ? "✓ Tepat (Rp 0)"
                  : discrepancy > 0
                  ? `+${formatRupiah(discrepancy)} (Lebih)`
                  : `-${formatRupiah(Math.abs(discrepancy))} (Tekor)`}
              </span>
            </div>
          </div>

          {/* Setor Balik ke Brankas Banner */}
          <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl flex items-center gap-2 text-xs text-amber-300">
            <ShieldCheck className="w-5 h-5 shrink-0 text-amber-400" />
            <span>
              Seluruh uang fisik nyata <strong>{formatRupiah(totalCounted)}</strong> akan disetorkan kembali ke <strong>Saldo Total Brankas Toko</strong> setelah kasir ditutup.
            </span>
          </div>

          {/* Catatan Penutupan */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Catatan / Alasan jika ada selisih:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Tip sukarela pelanggan tidak masuk nota, dsb"
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
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
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-950 transition flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? "Menutup & Menyetor..." : "Tutup Kasir & Setor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
