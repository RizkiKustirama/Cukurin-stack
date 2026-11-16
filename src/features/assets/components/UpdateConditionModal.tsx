"use client";

import React, { useState } from "react";
import { updateAssetConditionAction } from "../actions/assetActions";
import { AssetWithHolder, AssetCondition } from "../types";
import { ShieldAlert, AlertCircle, CheckCircle2, Wrench, XCircle } from "lucide-react";

interface UpdateConditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetWithHolder | null;
  onSuccess?: () => void;
}

const CONDITIONS: Array<{
  id: AssetCondition;
  label: string;
  desc: string;
  badgeClass: string;
}> = [
  {
    id: "GOOD",
    label: "Kondisi Prima (Baik)",
    desc: "Alat bekerja normal dan siap digunakan memotong",
    badgeClass: "text-[#1E8E3E] border-[#A7F3D0]/80 bg-[#E8F7EE]",
  },
  {
    id: "MAINTENANCE",
    label: "Perlu Servis / Asah Pisau",
    desc: "Mata pisau tumpul, kabel kendor, perlu pelumasan atau servis",
    badgeClass: "text-[#D97706] border-[#FCD34D]/80 bg-[#FEF3EB]",
  },
  {
    id: "DAMAGED",
    label: "Rusak / Mati Total",
    desc: "Jatuh, dinamo mati, mata pisau patah, tidak dapat dipakai",
    badgeClass: "text-[#D93025] border-[#FECDD3]/80 bg-[#FDF0F2]",
  },
  {
    id: "LOST",
    label: "Hilang / Tidak Ditemukan",
    desc: "Alat tidak berada di meja barber maupun inventaris toko",
    badgeClass: "text-[#706E68] border-[#E8E5DE] bg-[#F6F5F2]",
  },
];

export const UpdateConditionModal: React.FC<UpdateConditionModalProps> = ({
  isOpen,
  onClose,
  asset,
  onSuccess,
}) => {
  const [selectedCondition, setSelectedCondition] = useState<AssetCondition>(
    asset?.condition || "GOOD"
  );
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await updateAssetConditionAction({
        assetId: asset.id,
        condition: selectedCondition,
        notes: notes.trim() || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memperbarui kondisi alat.");
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
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A]">
                Lapor Perubahan Kondisi Alat
              </h3>
              <p className="text-xs text-[#706E68] truncate max-w-[240px]">
                {asset.name}
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

        {/* Info Pemegang */}
        <div className="bg-[#F6F5F2] border border-[#E8E5DE] rounded-2xl p-3.5 mb-4 flex items-center justify-between text-xs">
          <span className="text-[#706E68]">Penanggung Jawab:</span>
          <span className="font-bold text-[#D97706]">
            {asset.holderName ? `Barber: ${asset.holderName}` : "Gudang Toko"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Opsi Kondisi */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#1A1A1A] block">
              Pilih Status Kondisi:
            </label>
            {CONDITIONS.map((cond) => {
              const isSelected = selectedCondition === cond.id;
              return (
                <div
                  key={cond.id}
                  onClick={() => setSelectedCondition(cond.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition ${
                    isSelected
                      ? `${cond.badgeClass} ring-2 ring-current`
                      : "bg-[#F6F5F2] border-[#E8E5DE] text-[#706E68] hover:bg-[#EFECE6]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{cond.label}</span>
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => setSelectedCondition(cond.id)}
                      className="accent-[#111111]"
                    />
                  </div>
                  <p className="text-[11px] text-[#706E68] mt-0.5">{cond.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Kronologi / Insiden */}
          <div>
            <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">
              Catatan Insiden / Alasan Kerusakan:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Jatuh saat potong fade, mata pisau retak dan motor bergetar keras"
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
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-full bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? "Menyimpan..." : "Update Kondisi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
