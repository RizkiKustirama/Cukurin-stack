"use client";

import React, { useState } from "react";
import { adjustStockAction } from "../actions/inventoryActions";
import { ProductWithStats, AdjustmentReason } from "../types";
import { Boxes, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductWithStats | null;
  onSuccess?: () => void;
}

const REASONS: Array<{ id: AdjustmentReason; label: string; defaultDir: "IN" | "OUT" }> = [
  { id: "RESTOCK", label: "Restock Barang dari Supplier (+)", defaultDir: "IN" },
  { id: "OPNAME_CORRECTION", label: "Koreksi Selisih Stok Opname", defaultDir: "IN" },
  { id: "DAMAGED", label: "Barang Rusak / Bocor (-)", defaultDir: "OUT" },
  { id: "EXPIRED", label: "Barang Kadaluwarsa (-)", defaultDir: "OUT" },
  { id: "OTHER", label: "Alasan Lainnya", defaultDir: "IN" },
];

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess,
}) => {
  const [direction, setDirection] = useState<"IN" | "OUT">("IN");
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<AdjustmentReason>("RESTOCK");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleReasonChange = (newReason: AdjustmentReason) => {
    setReason(newReason);
    const found = REASONS.find((r) => r.id === newReason);
    if (found) {
      setDirection(found.defaultDir);
    }
  };

  const calculatedChange = direction === "IN" ? quantity : -quantity;
  const projectedStock = product.stockQuantity + calculatedChange;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setErrorMessage("Jumlah penyesuaian harus lebih dari 0.");
      return;
    }

    if (projectedStock < 0) {
      setErrorMessage(
        `Pengurangan (${quantity} unit) melebihi stok yang tersedia (${product.stockQuantity} unit).`
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await adjustStockAction({
        productId: product.id,
        quantityChange: calculatedChange,
        reason,
        notes: notes.trim() || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menyesuaikan stok.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-white text-[#1A1A1A] border border-[#E8E5DE] rounded-t-3xl sm:rounded-3xl shadow-xl p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between border-b border-[#E8E5DE] pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#EEF6FE] text-[#1A73E8] flex items-center justify-center font-bold">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A]">Penyesuaian Stok Gudang</h3>
              <p className="text-xs text-[#706E68] truncate max-w-[240px]">
                {product.name}
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

        {/* Current Stock Banner */}
        <div className="bg-[#F6F5F2] border border-[#E8E5DE] rounded-2xl p-3 mb-4 flex items-center justify-between">
          <span className="text-xs text-[#706E68]">Sisa Stok Fisik Saat Ini:</span>
          <span className="text-sm font-black text-[#1A1A1A]">
            {product.stockQuantity} pcs
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Arah Penyesuaian (Masuk vs Keluar) */}
          <div>
            <label className="text-xs font-semibold text-[#1A1A1A] block mb-1.5">
              Tipe Penyesuaian:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDirection("IN")}
                className={`py-2 px-3 rounded-full border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  direction === "IN"
                    ? "bg-[#111111] text-white border-[#111111] shadow-xs"
                    : "bg-[#F6F5F2] text-[#706E68] border-[#E8E5DE] hover:bg-[#EFECE6]"
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-[#1E8E3E]" /> Barang Masuk (+)
              </button>
              <button
                type="button"
                onClick={() => setDirection("OUT")}
                className={`py-2 px-3 rounded-full border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  direction === "OUT"
                    ? "bg-[#D93025] text-white border-[#D93025] shadow-xs"
                    : "bg-[#F6F5F2] text-[#706E68] border-[#E8E5DE] hover:bg-[#EFECE6]"
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-white" /> Barang Keluar (-)
              </button>
            </div>
          </div>

          {/* Alasan */}
          <div>
            <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">
              Alasan Penyesuaian:
            </label>
            <select
              value={reason}
              onChange={(e) => handleReasonChange(e.target.value as AdjustmentReason)}
              className="w-full bg-[#F6F5F2] border border-[#E8E5DE] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] font-semibold focus:outline-none focus:border-[#111111] transition"
            >
              {REASONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Jumlah */}
          <div>
            <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">
              Jumlah Unit (pcs):
            </label>
            <input
              type="number"
              min="1"
              value={quantity || ""}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value, 10) || 0))
              }
              className="w-full bg-[#F6F5F2] border border-[#E8E5DE] rounded-xl px-3 py-2.5 text-base font-bold text-[#1A1A1A] focus:outline-none focus:border-[#111111] transition"
            />
          </div>

          {/* Projected Stock Preview */}
          <div className="p-3 bg-[#F6F5F2] border border-[#E8E5DE] rounded-xl flex items-center justify-between text-xs">
            <span className="text-[#706E68]">Estimasi Sisa Stok Akhir:</span>
            <span
              className={`font-black ${
                projectedStock < 0 ? "text-[#D93025]" : "text-[#1E8E3E]"
              }`}
            >
              {projectedStock} pcs
            </span>
          </div>

          {/* Catatan / No Surat Jalan */}
          <div>
            <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">
              Catatan / No. Surat Jalan / Faktur:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Restock Faktur #INV-9921 dari PT Distributor"
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
              disabled={isSubmitting || quantity <= 0 || projectedStock < 0}
              className="flex-1 py-2.5 rounded-full bg-[#111111] hover:bg-[#222222] disabled:bg-[#E8E5DE] disabled:text-[#A8A59E] text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? "Menyimpan..." : "Sesuaikan Stok"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
