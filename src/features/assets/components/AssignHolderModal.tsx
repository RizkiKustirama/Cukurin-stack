"use client";

import React, { useState } from "react";
import { assignAssetHolderAction } from "../actions/assetActions";
import { AssetWithHolder } from "../types";
import { UserCheck, AlertCircle } from "lucide-react";

interface AssignHolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetWithHolder | null;
  barbers: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

export const AssignHolderModal: React.FC<AssignHolderModalProps> = ({
  isOpen,
  onClose,
  asset,
  barbers,
  onSuccess,
}) => {
  const [holderId, setHolderId] = useState<string>(asset?.currentHolderId || "");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await assignAssetHolderAction({
        assetId: asset.id,
        holderId: holderId ? holderId : null,
        notes: notes.trim() || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengubah penanggung jawab alat.");
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
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A]">
                Serah Terima Penanggung Jawab
              </h3>
              <p className="text-xs text-[#706E68] truncate max-w-[240px]">
                {asset.name} {asset.serialNumber ? `(#${asset.serialNumber})` : ""}
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

        {/* Current Holder Status */}
        <div className="bg-[#F6F5F2] border border-[#E8E5DE] rounded-2xl p-3.5 mb-4 flex items-center justify-between text-xs">
          <span className="text-[#706E68]">Pemegang Saat Ini:</span>
          <span className="font-bold text-[#1A73E8]">
            {asset.holderName ? `Barber: ${asset.holderName}` : "Gudang Toko"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pilih Pemegang Baru */}
          <div>
            <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">
              Serahkan Tanggung Jawab Ke:
            </label>
            <select
              value={holderId}
              onChange={(e) => setHolderId(e.target.value)}
              className="w-full bg-[#F6F5F2] border border-[#E8E5DE] rounded-xl px-3 py-2.5 text-xs text-[#1A1A1A] font-semibold focus:outline-none focus:border-[#111111] transition"
            >
              <option value="">Gudang Inventaris Toko (Tarik ke Gudang)</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  Barber: {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Catatan Serah Terima */}
          <div>
            <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">
              Catatan / Berita Acara:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Pergantian shift siang ke barber Fajar"
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
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-full bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? "Memproses..." : "Simpan Serah Terima"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
