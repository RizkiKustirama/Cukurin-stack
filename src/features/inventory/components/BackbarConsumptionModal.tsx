"use client";

import React, { useState } from "react";
import { formatRupiah } from "@/shared/lib/formatters";
import { recordBackbarConsumptionAction } from "../actions/inventoryActions";
import { ProductWithStats } from "../types";
import { Scissors, AlertCircle, ShoppingBag } from "lucide-react";

interface BackbarConsumptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  products: ProductWithStats[];
  onSuccess?: () => void;
}

const COMMON_STATIONS = [
  "Meja Barber 1",
  "Meja Barber 2",
  "Meja Barber 3",
  "Meja Barber 4",
  "Meja Barber 5",
  "Area Keramas / Backwash",
  "Meja Kasir / Frontdesk",
];

export const BackbarConsumptionModal: React.FC<BackbarConsumptionModalProps> = ({
  isOpen,
  onClose,
  storeId,
  products,
  onSuccess,
}) => {
  const availableProducts = products.filter((p) => p.stockQuantity > 0 && p.isActive);

  const [selectedProductId, setSelectedProductId] = useState<string>(
    availableProducts[0]?.id || ""
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [targetStation, setTargetStation] = useState<string>(COMMON_STATIONS[0]);
  const [customStation, setCustomStation] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentProduct =
    availableProducts.find((p) => p.id === selectedProductId) ||
    availableProducts[0];

  const effectiveStation = customStation.trim() || targetStation;
  const totalCostValue = currentProduct ? currentProduct.costPrice * quantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) {
      setErrorMessage("Pilih produk yang akan dikeluarkan terlebih dahulu.");
      return;
    }

    if (quantity <= 0) {
      setErrorMessage("Jumlah barang harus lebih dari 0.");
      return;
    }

    if (quantity > currentProduct.stockQuantity) {
      setErrorMessage(
        `Jumlah pengeluaran (${quantity}) melebihi sisa stok di gudang (${currentProduct.stockQuantity}).`
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await recordBackbarConsumptionAction({
        storeId,
        productId: currentProduct.id,
        quantity,
        targetStation: effectiveStation,
        notes: notes.trim() || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mencatat pengeluaran barang ke meja.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#18181B] text-[#F4F4F5] border border-amber-900/40 rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Scissors className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                Pengeluaran Meja (Backbar)
              </h3>
              <p className="text-xs text-zinc-400">
                Keluarkan stok gudang untuk perlengkapan meja kerja
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

        {availableProducts.length === 0 ? (
          <div className="py-8 text-center text-zinc-400 text-xs">
            Tidak ada produk dengan stok tersedia di gudang untuk dikeluarkan.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pilih Produk */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Pilih Barang dari Gudang:
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-100 font-semibold focus:outline-none focus:border-amber-500"
              >
                {availableProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stok: {p.stockQuantity} pcs — HPP: {formatRupiah(p.costPrice)})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Meja / Station */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Tujuan Meja / Posisi Kerja:
              </label>
              <select
                value={targetStation}
                onChange={(e) => {
                  setTargetStation(e.target.value);
                  setCustomStation("");
                }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-semibold focus:outline-none focus:border-amber-500 mb-1.5"
              >
                {COMMON_STATIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={customStation}
                onChange={(e) => setCustomStation(e.target.value)}
                placeholder="Atau ketik nama stasiun khusus..."
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Jumlah */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-zinc-300">
                  Jumlah Dikeluarkan (pcs):
                </label>
                {currentProduct && (
                  <span className="text-[11px] text-zinc-400">
                    Maks: <strong className="text-amber-400">{currentProduct.stockQuantity}</strong>
                  </span>
                )}
              </div>
              <input
                type="number"
                min="1"
                max={currentProduct?.stockQuantity || 1}
                value={quantity || ""}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value, 10) || 0))
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-base font-bold text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Preview Beban Modal Perlengkapan */}
            <div className="p-3 bg-purple-950/20 border border-purple-800/40 rounded-xl flex items-center justify-between text-xs text-purple-300">
              <span>Beban Modal Perlengkapan (HPP):</span>
              <span className="font-bold text-sm text-purple-200">
                {formatRupiah(totalCostValue)}
              </span>
            </div>

            {/* Catatan / Keperluan */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Catatan Keperluan:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Tester pomade baru untuk meja Rian"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
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
                disabled={isSubmitting || quantity <= 0}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-bold shadow-lg shadow-purple-950 transition flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? "Mengeluarkan..." : "Keluarkan ke Meja"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
