"use client";

import React from "react";
import { Scissors, Clock, FileText, Banknote, Sparkles } from "lucide-react";
import { formatRupiah } from "@/shared/lib/formatters";

interface StepFirstServiceProps {
  serviceName: string;
  servicePrice: number;
  durationMinutes: number;
  serviceDescription: string;
  onChange: (field: string, value: string | number) => void;
  errors?: Record<string, string>;
}

export const StepFirstService: React.FC<StepFirstServiceProps> = ({
  serviceName,
  servicePrice,
  durationMinutes,
  serviceDescription,
  onChange,
  errors = {},
}) => {
  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="border-b border-[#38332c] pb-4">
        <h2 className="text-xl font-bold text-[#f5f4f0] flex items-center gap-2">
          <Scissors className="w-5 h-5 text-amber-500" />
          Input Paket Layanan Potong Pertama
        </h2>
        <p className="text-sm text-[#a39e93] mt-1">
          Daftarkan menu cukur utama Anda yang akan langsung muncul di katalog kasir POS dan antrean ruko.
        </p>
      </div>

      {/* Service Name */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-[#f5f4f0] flex items-center gap-1.5">
          Nama Paket Layanan <span className="text-amber-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={serviceName}
            onChange={(e) => onChange("serviceName", e.target.value)}
            placeholder="Contoh: Paket Potong Reguler"
            className={`w-full bg-[#181614] border ${
              errors.serviceName ? "border-rose-500" : "border-[#38332c]"
            } rounded-xl px-4 py-3 text-[#f5f4f0] placeholder:text-[#a39e93]/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm`}
          />
        </div>
        {errors.serviceName && (
          <p className="text-xs text-rose-400 mt-1">{errors.serviceName}</p>
        )}
      </div>

      {/* Price & Duration Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Service Price */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#f5f4f0] flex items-center gap-1.5">
            <Banknote className="w-4 h-4 text-amber-500" />
            Harga Jual ke Pelanggan <span className="text-amber-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-500">
              Rp
            </span>
            <input
              type="number"
              min={0}
              step={5000}
              value={servicePrice}
              onChange={(e) =>
                onChange("servicePrice", parseFloat(e.target.value) || 0)
              }
              placeholder="40000"
              className={`w-full bg-[#181614] border ${
                errors.servicePrice ? "border-rose-500" : "border-[#38332c]"
              } rounded-xl pl-11 pr-4 py-3 text-[#f5f4f0] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50`}
            />
          </div>
          <p className="text-[11px] text-[#a39e93]">
            Tampilan di kasir: <span className="font-bold text-amber-500">{formatRupiah(servicePrice)}</span>
          </p>
          {errors.servicePrice && (
            <p className="text-xs text-rose-400 mt-1">{errors.servicePrice}</p>
          )}
        </div>

        {/* Estimated Duration */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#f5f4f0] flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            Estimasi Durasi Pengerjaan <span className="text-amber-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min={5}
              max={180}
              step={5}
              value={durationMinutes}
              onChange={(e) =>
                onChange("durationMinutes", parseInt(e.target.value, 10) || 0)
              }
              placeholder="30"
              className={`w-full bg-[#181614] border ${
                errors.durationMinutes ? "border-rose-500" : "border-[#38332c]"
              } rounded-xl px-4 py-3 text-[#f5f4f0] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50`}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#a39e93] font-medium">
              Menit
            </span>
          </div>
          <p className="text-[11px] text-[#a39e93]">
            Digunakan untuk kalkulasi otomatis waktu tunggu antrean.
          </p>
          {errors.durationMinutes && (
            <p className="text-xs text-rose-400 mt-1">{errors.durationMinutes}</p>
          )}
        </div>
      </div>

      {/* Service Description */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-[#f5f4f0] flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-amber-500" />
          Deskripsi & Rincian Perlakuan
        </label>
        <textarea
          rows={3}
          value={serviceDescription}
          onChange={(e) => onChange("serviceDescription", e.target.value)}
          placeholder="Cuci, potong rambut rapi, handuk hangat, dan styling pomade"
          className={`w-full bg-[#181614] border ${
            errors.serviceDescription ? "border-rose-500" : "border-[#38332c]"
          } rounded-xl px-4 py-3 text-[#f5f4f0] placeholder:text-[#a39e93]/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm resize-none`}
        />
        {errors.serviceDescription && (
          <p className="text-xs text-rose-400 mt-1">{errors.serviceDescription}</p>
        )}
      </div>

      {/* Highlight Box */}
      <div className="bg-[#181614] border border-[#38332c] rounded-xl p-3 flex items-start gap-2.5 text-xs text-[#a39e93]">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p>
          Setelah menyelesaikan onboarding, Anda dapat menambahkan paket lain seperti Cuci Rambut, Pewarnaan, Shaving Kumis, maupun produk pomade retail di modul pengaturan.
        </p>
      </div>
    </div>
  );
};
