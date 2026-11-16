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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-white text-[#1A1A1A] border border-[#E8E5DE] rounded-t-3xl sm:rounded-3xl shadow-xl p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between border-b border-[#E8E5DE] pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#EEF6FE] text-[#1A73E8] flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A]">
                {isEditing ? "Edit Aset Alat Kerja" : "Registrasi Alat Kerja Baru"}
              </h3>
              <p className="text-xs text-[#706E68]">
                Inventaris mesin cukur, gunting, dan perlengkapan toko
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
          {/* Nama Alat */}
          <div>
            <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">
              Nama Alat Kerja:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Wahl Cordless Magic Clip Red"
              className="w-full bg-[#F6F5F2] border border-[#E8E5DE] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] font-semibold placeholder:text-[#A8A59E] focus:outline-none focus:border-[#111111] transition"
            />
          </div>

          {/* Nomor Seri */}
          <div>
            <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">
              Nomor Seri / Kode Mesin (Opsional):
            </label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="Contoh: SN-WMC-2024-001"
              className="w-full bg-[#F6F5F2] border border-[#E8E5DE] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] font-mono placeholder:text-[#A8A59E] focus:outline-none focus:border-[#111111] transition"
            />
          </div>

          {!isEditing && (
            <>
              {/* Penanggung Jawab Awal */}
              <div>
                <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">
                  Penanggung Jawab Pemegang Awal:
                </label>
                <select
                  value={currentHolderId}
                  onChange={(e) => setCurrentHolderId(e.target.value)}
                  className="w-full bg-[#F6F5F2] border border-[#E8E5DE] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] font-semibold focus:outline-none focus:border-[#111111] transition"
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
                <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">
                  Kondisi Fisik Alat:
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as AssetCondition)}
                  className="w-full bg-[#F6F5F2] border border-[#E8E5DE] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] font-semibold focus:outline-none focus:border-[#111111] transition"
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
            <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">
              Catatan / Riwayat Pembelian:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Pembelian baru toko, garansi servis 1 tahun"
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
              disabled={isSubmitting || !name.trim()}
              className="flex-1 py-2.5 rounded-full bg-[#111111] hover:bg-[#222222] disabled:bg-[#E8E5DE] disabled:text-[#A8A59E] text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
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
