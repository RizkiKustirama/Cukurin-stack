"use client";

import React, { useState } from "react";
import { AssetWithHolder, AssetCondition } from "../types";
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  UserCheck,
  Edit2,
  Search,
  User,
  History,
} from "lucide-react";

interface AssetListGridProps {
  assets: AssetWithHolder[];
  barbers: Array<{ id: string; name: string }>;
  onAssignHolder: (asset: AssetWithHolder) => void;
  onUpdateCondition: (asset: AssetWithHolder) => void;
  onEditAsset: (asset: AssetWithHolder) => void;
}

export const AssetListGrid: React.FC<AssetListGridProps> = ({
  assets,
  barbers,
  onAssignHolder,
  onUpdateCondition,
  onEditAsset,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCondition, setSelectedCondition] = useState<string>("ALL");
  const [selectedBarber, setSelectedBarber] = useState<string>("ALL");

  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.serialNumber &&
        a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.holderName &&
        a.holderName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedCondition !== "ALL" && a.condition !== selectedCondition) {
      return false;
    }

    if (selectedBarber !== "ALL") {
      if (selectedBarber === "UNASSIGNED") {
        if (a.currentHolderId !== null) return false;
      } else {
        if (a.currentHolderId !== selectedBarber) return false;
      }
    }

    return true;
  });

  const getConditionBadge = (cond: AssetCondition) => {
    switch (cond) {
      case "GOOD":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-[#E8F7EE] text-[#1E8E3E] border border-[#A7F3D0]/50 text-[10px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Prima (GOOD)
          </span>
        );
      case "MAINTENANCE":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3EB] text-[#D97706] border border-[#FCD34D]/50 text-[10px] font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Servis (MAINTENANCE)
          </span>
        );
      case "DAMAGED":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-[#FDF0F2] text-[#D93025] border border-[#FECDD3]/50 text-[10px] font-bold flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> Rusak (DAMAGED)
          </span>
        );
      case "LOST":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-[#F6F5F2] text-[#706E68] border border-[#E8E5DE] text-[10px] font-bold flex items-center gap-1">
            Hilang (LOST)
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-[#E8E5DE] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#706E68] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama alat / nomor seri / pemegang..."
            className="w-full bg-[#F6F5F2] border border-[#E8E5DE] rounded-full pl-9 pr-3 py-2 text-xs text-[#1A1A1A] placeholder:text-[#A8A59E] focus:outline-none focus:border-[#111111] transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter Kondisi */}
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="bg-[#F6F5F2] border border-[#E8E5DE] rounded-full px-3 py-1.5 text-xs text-[#1A1A1A] font-medium focus:outline-none focus:border-[#111111] transition"
          >
            <option value="ALL">Semua Kondisi</option>
            <option value="GOOD">Prima (GOOD)</option>
            <option value="MAINTENANCE">Servis (MAINTENANCE)</option>
            <option value="DAMAGED">Rusak (DAMAGED)</option>
            <option value="LOST">Hilang (LOST)</option>
          </select>

          {/* Filter Barber */}
          <select
            value={selectedBarber}
            onChange={(e) => setSelectedBarber(e.target.value)}
            className="bg-[#F6F5F2] border border-[#E8E5DE] rounded-full px-3 py-1.5 text-xs text-[#1A1A1A] font-medium focus:outline-none focus:border-[#111111] transition"
          >
            <option value="ALL">Semua Pemegang</option>
            <option value="UNASSIGNED">Di Gudang (Unassigned)</option>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Asset List */}
      {filteredAssets.length === 0 ? (
        <div className="text-center py-10 text-[#706E68] text-xs">
          Tidak ada aset alat yang sesuai dengan kriteria filter.
        </div>
      ) : (
        <div className="divide-y divide-[#E8E5DE]">
          {filteredAssets.map((a) => (
            <div
              key={a.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              {/* Asset Details */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-[#1A1A1A]">{a.name}</span>
                  {a.serialNumber && (
                    <span className="px-2 py-0.5 rounded-md bg-[#F6F5F2] border border-[#E8E5DE] font-mono text-[10px] text-[#706E68]">
                      SN: {a.serialNumber}
                    </span>
                  )}
                  {getConditionBadge(a.condition)}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#706E68] flex-wrap">
                  <span className="flex items-center gap-1 font-medium text-[#1A73E8]">
                    <User className="w-3.5 h-3.5" />
                    {a.holderName ? `Barber: ${a.holderName}` : "Gudang Toko (Tersedia)"}
                  </span>
                  {a.notes && (
                    <>
                      <span>•</span>
                      <span className="text-[#A8A59E] line-clamp-1 italic max-w-md">
                        {a.notes.split("\n").pop()}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => onAssignHolder(a)}
                  className="py-1.5 px-3 rounded-full bg-[#F6F5F2] hover:bg-[#EFECE6] border border-[#E8E5DE] text-[#1A1A1A] text-xs font-semibold transition flex items-center gap-1.5"
                  title="Ganti Pemegang / Serah Terima"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#1A73E8]" />
                  <span>Serah Terima</span>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateCondition(a)}
                  className="py-1.5 px-3 rounded-full bg-[#F6F5F2] hover:bg-[#EFECE6] border border-[#E8E5DE] text-[#1A1A1A] text-xs font-semibold transition flex items-center gap-1.5"
                  title="Lapor Perubahan Kondisi Fisik"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-[#D93025]" />
                  <span>Kondisi</span>
                </button>

                <button
                  type="button"
                  onClick={() => onEditAsset(a)}
                  className="p-1.5 rounded-full bg-[#F6F5F2] hover:bg-[#EFECE6] border border-[#E8E5DE] text-[#706E68] hover:text-[#1A1A1A] transition"
                  title="Edit Nama / Nomor Seri"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
