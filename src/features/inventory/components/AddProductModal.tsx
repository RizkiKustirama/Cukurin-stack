"use client";

import React, { useState } from "react";
import { formatRupiah } from "@/shared/lib/formatters";
import { createProductAction, updateProductAction } from "../actions/inventoryActions";
import { ProductWithStats } from "../types";
import { Package, AlertCircle } from "lucide-react";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  editProduct?: ProductWithStats | null;
  onSuccess?: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  storeId,
  editProduct,
  onSuccess,
}) => {
  const isEditing = !!editProduct;

  const [name, setName] = useState<string>(editProduct?.name || "");
  const [costPrice, setCostPrice] = useState<number>(editProduct?.costPrice || 0);
  const [costInput, setCostInput] = useState<string>(
    editProduct?.costPrice ? editProduct.costPrice.toString() : ""
  );
  const [sellingPrice, setSellingPrice] = useState<number>(
    editProduct?.sellingPrice || 0
  );
  const [sellingInput, setSellingInput] = useState<string>(
    editProduct?.sellingPrice ? editProduct.sellingPrice.toString() : ""
  );
  const [stockQuantity, setStockQuantity] = useState<number>(
    editProduct?.stockQuantity || 0
  );
  const [minStockAlert, setMinStockAlert] = useState<number>(
    editProduct?.minStockAlert ?? 3
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Nama produk wajib diisi.");
      return;
    }
    if (costPrice < 0 || sellingPrice < 0) {
      setErrorMessage("Harga modal dan jual tidak boleh negatif.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (isEditing && editProduct) {
        const res = await updateProductAction({
          productId: editProduct.id,
          name: name.trim(),
          costPrice,
          sellingPrice,
          minStockAlert,
        });

        if (!res.success) {
          setErrorMessage(res.message);
        } else {
          if (onSuccess) onSuccess();
          onClose();
        }
      } else {
        const res = await createProductAction({
          storeId,
          name: name.trim(),
          costPrice,
          sellingPrice,
          stockQuantity,
          minStockAlert,
        });

        if (!res.success) {
          setErrorMessage(res.message);
        } else {
          if (onSuccess) onSuccess();
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menyimpan produk.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-white text-[#1A1A1A] border border-[#E8E5DE] rounded-t-3xl sm:rounded-3xl shadow-xl p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between border-b border-[#E8E5DE] pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FEF3EB] text-[#D97706] flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A]">
                {isEditing ? "Edit Produk Retail" : "Tambah Produk Baru"}
              </h3>
              <p className="text-xs text-[#706E68]">
                {isEditing
                  ? "Ubah informasi harga dan batas alert"
                  : "Daftarkan produk retail ke katalog toko"}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Produk */}
          <div>
            <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">
              Nama Produk:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Suavecito Pomade Firme Hold"
              className="w-full bg-[#F6F5F2] border border-[#E8E5DE] rounded-xl px-3 py-2.5 text-xs text-[#1A1A1A] font-medium placeholder:text-[#A8A59E] focus:outline-none focus:border-[#111111] transition"
            />
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Harga Modal (Cost Price / HPP) */}
            <div>
              <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">
                Harga Modal (HPP):
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#706E68] text-xs font-semibold">
                  Rp
                </span>
                <input
                  type="text"
                  value={costInput ? Number(costInput).toLocaleString("id-ID") : ""}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setCostInput(raw);
                    setCostPrice(parseInt(raw, 10) || 0);
                  }}
                  placeholder="0"
                  className="w-full bg-[#F6F5F2] border border-[#E8E5DE] rounded-xl pl-8 pr-2.5 py-2 text-xs text-[#1A1A1A] font-bold focus:outline-none focus:border-[#111111] transition"
                />
              </div>
            </div>

            {/* Harga Jual (Selling Price) */}
            <div>
              <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">
                Harga Jual (Kasir):
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#706E68] text-xs font-semibold">
                  Rp
                </span>
                <input
                  type="text"
                  value={
                    sellingInput ? Number(sellingInput).toLocaleString("id-ID") : ""
                  }
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setSellingInput(raw);
                    setSellingPrice(parseInt(raw, 10) || 0);
                  }}
                  placeholder="0"
                  className="w-full bg-[#F6F5F2] border border-[#E8E5DE] rounded-xl pl-8 pr-2.5 py-2 text-xs text-[#1A1A1A] font-bold focus:outline-none focus:border-[#111111] transition"
                />
              </div>
            </div>
          </div>

          {/* Stock Quantities */}
          <div className="grid grid-cols-2 gap-3">
            {!isEditing && (
              <div>
                <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">
                  Stok Awal Gudang:
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockQuantity || ""}
                  onChange={(e) =>
                    setStockQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))
                  }
                  placeholder="0"
                  className="w-full bg-[#F6F5F2] border border-[#E8E5DE] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] font-bold focus:outline-none focus:border-[#111111] transition"
                />
              </div>
            )}

            <div className={isEditing ? "col-span-2" : ""}>
              <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">
                Batas Peringatan Stok Menipis:
              </label>
              <input
                type="number"
                min="0"
                value={minStockAlert || ""}
                onChange={(e) =>
                  setMinStockAlert(Math.max(0, parseInt(e.target.value, 10) || 0))
                }
                placeholder="3"
                className="w-full bg-[#F6F5F2] border border-[#E8E5DE] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] font-bold focus:outline-none focus:border-[#111111] transition"
              />
              <span className="text-[10px] text-[#706E68] mt-0.5 block">
                Notifikasi muncul saat stok sisa ≤ angka ini.
              </span>
            </div>
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
              disabled={isSubmitting || !name.trim()}
              className="flex-1 py-2.5 rounded-full bg-[#111111] hover:bg-[#222222] disabled:bg-[#E8E5DE] disabled:text-[#A8A59E] text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
            >
              {isSubmitting
                ? "Menyimpan..."
                : isEditing
                ? "Simpan Perubahan"
                : "Tambah Produk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
