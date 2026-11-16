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
    badgeClass: "text-emerald-400 border-emerald-800 bg-emerald-950/40",
  },
  {
    id: "MAINTENANCE",
    label: "Perlu Servis / Asah Pisau",
    desc: "Mata pisau tumpul, kabel kendor, perlu pelumasan atau servis",
    badgeClass: "text-amber-400 border-amber-800 bg-amber-950/40",
  },
  {
    id: "DAMAGED",
    label: "Rusak / Mati Total",
    desc: "Jatuh, dinamo mati, mata pisau patah, tidak dapat dipakai",
    badgeClass: "text-rose-400 border-rose-800 bg-rose-950/40",
  },
  {
    id: "LOST",
    label: "Hilang / Tidak Ditemukan",
    desc: "Alat tidak berada di meja barber maupun inventaris toko",
    badgeClass: "text-zinc-400 border-zinc-700 bg-zinc-800/60",
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#18181B] text-[#F4F4F5] border border-amber-900/40 rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                Lapor Perubahan Kondisi Alat
              </h3>
              <p className="text-xs text-zinc-400 truncate max-w-[240px]">
                {asset.name}
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

        {/* Info Pemegang */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 mb-4 flex items-center justify-between text-xs">
          <span className="text-zinc-400">Penanggung Jawab:</span>
          <span className="font-bold text-amber-400">
            {asset.holderName ? `Barber: ${asset.holderName}` : "Gudang Toko"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Opsi Kondisi */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 block">
              Pilih Status Kondisi:
            </label>
            {CONDITIONS.map((cond) => {
              const isSelected = selectedCondition === cond.id;
              return (
                <div
                  key={cond.id}
                  onClick={() => setSelectedCondition(cond.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? `${cond.badgeClass} ring-1 ring-current`
                      : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{cond.label}</span>
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => setSelectedCondition(cond.id)}
                      className="accent-amber-500"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{cond.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Kronologi / Insiden */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Catatan Insiden / Alasan Kerusakan:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Jatuh saat potong fade, mata pisau retak dan motor bergetar keras"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-rose-500 resize-none"
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
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950 transition flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? "Menyimpan..." : "Update Kondisi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
