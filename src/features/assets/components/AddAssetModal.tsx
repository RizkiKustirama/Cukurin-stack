"use client";

import React, { useState } from "react";
import { createAssetAction, updateAssetAction } from "../actions/assetActions";
import { AssetWithHolder, AssetCondition } from "../types";
import { Wrench, AlertCircle } from "lucide-react";

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  barbers: Array<{ id: string; name: string }>;
  editAsset?: AssetWithHolder | null;
  onSuccess?: () => void;
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  isOpen,
  onClose,
  storeId,
  barbers,
  editAsset,
  onSuccess,
}) => {
  const isEditing = !!editAsset;

  const [name, setName] = useState<string>(editAsset?.name || "");
  const [serialNumber, setSerialNumber] = useState<string>(
    editAsset?.serialNumber || ""
  );
  const [currentHolderId, setCurrentHolderId] = useState<string>(
    editAsset?.currentHolderId || ""
  );
  const [condition, setCondition] = useState<AssetCondition>(
    editAsset?.condition || "GOOD"
  );
  const [notes, setNotes] = useState<string>(editAsset?.notes || "");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Nama alat kerja wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (isEditing && editAsset) {
        const res = await updateAssetAction({
          assetId: editAsset.id,
          name: name.trim(),
          serialNumber: serialNumber.trim() || undefined,
          notes: notes.trim() || undefined,
        });

        if (!res.success) {
          setErrorMessage(res.message);
        } else {
          if (onSuccess) onSuccess();
          onClose();
        }
      } else {
        const res = await createAssetAction({
          storeId,
          name: name.trim(),
          serialNumber: serialNumber.trim() || undefined,
          currentHolderId: currentHolderId || null,
          condition,
          notes: notes.trim() || undefined,
        });

        if (!res.success) {
          setErrorMessage(res.message);
        } else {
          if (onSuccess) onSuccess();
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menyimpan aset alat kerja.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#18181B] text-[#F4F4F5] border border-amber-900/40 rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                {isEditing ? "Edit Aset Alat Kerja" : "Registrasi Alat Kerja Baru"}
              </h3>
              <p className="text-xs text-zinc-400">
                Inventaris mesin cukur, gunting, dan perlengkapan toko
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Alat */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Nama Alat Kerja:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Wahl Cordless Magic Clip Red"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-semibold focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Nomor Seri */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Nomor Seri / Kode Mesin (Opsional):
            </label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="Contoh: SN-WMC-2024-001"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          {!isEditing && (
            <>
              {/* Penanggung Jawab Awal */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Penanggung Jawab Pemegang Awal:
                </label>
                <select
                  value={currentHolderId}
                  onChange={(e) => setCurrentHolderId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-semibold focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Gudang Inventaris Toko (Belum Ditugaskan)</option>
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      Barber: {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kondisi Awal */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Kondisi Fisik Alat:
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as AssetCondition)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-semibold focus:outline-none focus:border-cyan-500"
                >
                  <option value="GOOD">Kondisi Baik / Prima (GOOD)</option>
                  <option value="MAINTENANCE">Perlu Servis / Asah (MAINTENANCE)</option>
                  <option value="DAMAGED">Rusak / Tidak Berfungsi (DAMAGED)</option>
                  <option value="LOST">Hilang (LOST)</option>
                </select>
              </div>
            </>
          )}

          {/* Catatan */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Catatan / Riwayat Pembelian:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Pembelian baru toko, garansi servis 1 tahun"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 resize-none"
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
              disabled={isSubmitting || !name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-bold shadow-lg shadow-cyan-950 transition flex items-center justify-center gap-1.5"
            >
              {isSubmitting
                ? "Menyimpan..."
                : isEditing
                ? "Simpan Perubahan"
                : "Daftarkan Alat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
