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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-white text-[#1A1A1A] border border-[#E8E5DE] rounded-t-3xl sm:rounded-3xl shadow-xl p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between border-b border-[#E8E5DE] pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#F5F0FF] text-[#7C3AED] flex items-center justify-center font-bold">
              <Scissors className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A]">
                Pengeluaran Meja (Backbar)
              </h3>
              <p className="text-xs text-[#706E68]">
                Keluarkan stok gudang untuk perlengkapan meja kerja
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#706E68] hover:text-[#1A1A1A] text-sm font-semibold p-1"
          >
            ✕
          </button>
        </div>

        {availableProducts.length === 0 ? (
          <div className="py-8 text-center text-[#706E68] text-xs">
            Tidak ada produk dengan stok tersedia di gudang untuk dikeluarkan.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pilih Produk */}
            <div>
              <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">
                Pilih Barang dari Gudang:
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-[#F6F5F2] border border-[#E8E5DE] rounded-xl px-3 py-2.5 text-xs text-[#1A1A1A] font-semibold focus:outline-none focus:border-[#111111] transition"
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
              <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">
                Tujuan Meja / Posisi Kerja:
              </label>
              <select
                value={targetStation}
                onChange={(e) => {
                  setTargetStation(e.target.value);
                  setCustomStation("");
                }}
                className="w-full bg-[#F6F5F2] border border-[#E8E5DE] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] font-semibold focus:outline-none focus:border-[#111111] transition mb-1.5"
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
                className="w-full bg-[#F6F5F2] border border-[#E8E5DE] rounded-xl px-3 py-1.5 text-xs text-[#1A1A1A] placeholder:text-[#A8A59E] focus:outline-none focus:border-[#111111] transition"
              />
            </div>

            {/* Jumlah */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-[#1A1A1A]">
                  Jumlah Dikeluarkan (pcs):
                </label>
                {currentProduct && (
                  <span className="text-[11px] text-[#706E68]">
                    Maks: <strong className="text-[#D97706]">{currentProduct.stockQuantity}</strong>
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
                className="w-full bg-[#F6F5F2] border border-[#E8E5DE] rounded-xl px-3 py-2.5 text-base font-bold text-[#1A1A1A] focus:outline-none focus:border-[#111111] transition"
              />
            </div>

            {/* Preview Beban Modal Perlengkapan */}
            <div className="p-3 bg-[#F5F0FF] border border-[#DDD6FE]/60 rounded-xl flex items-center justify-between text-xs text-[#7C3AED]">
              <span className="font-medium">Beban Modal Perlengkapan (HPP):</span>
              <span className="font-bold text-sm text-[#7C3AED]">
                {formatRupiah(totalCostValue)}
              </span>
            </div>

            {/* Catatan / Keperluan */}
            <div>
              <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">
                Catatan Keperluan:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Tester pomade baru untuk meja Rian"
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
                disabled={isSubmitting || quantity <= 0}
                className="flex-1 py-2.5 rounded-full bg-[#111111] hover:bg-[#222222] disabled:bg-[#E8E5DE] disabled:text-[#A8A59E] text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
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
