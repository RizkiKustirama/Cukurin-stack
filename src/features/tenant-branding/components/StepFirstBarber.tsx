"use client";

import React, { useState } from "react";
import { UserCheck, Phone, Lock, Percent, Banknote, Eye, EyeOff, Info } from "lucide-react";
import { formatRupiah } from "@/shared/lib/formatters";

interface StepFirstBarberProps {
  barberName: string;
  barberPhone: string;
  barberPassword: string;
  serviceCommissionPct: number;
  productCommissionFlat: number;
  onChange: (field: string, value: string | number) => void;
  errors?: Record<string, string>;
}

export const StepFirstBarber: React.FC<StepFirstBarberProps> = ({
  barberName,
  barberPhone,
  barberPassword,
  serviceCommissionPct,
  productCommissionFlat,
  onChange,
  errors = {},
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="border-b border-[#38332c] pb-4">
        <h2 className="text-xl font-bold text-[#f5f4f0] flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-amber-500" />
          Pendaftaran Barber Pertama & Pengaturan Komisi
        </h2>
        <p className="text-sm text-[#a39e93] mt-1">
          Daftarkan akun kapster utama Anda untuk mulai menerima antrean potong dan atur skema bagi hasilnya.
        </p>
      </div>

      {/* Barber Full Name */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-[#f5f4f0] flex items-center gap-1.5">
          Nama Lengkap Barber <span className="text-amber-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={barberName}
            onChange={(e) => onChange("barberName", e.target.value)}
            placeholder="Contoh: Bambang Capster"
            className={`w-full bg-[#181614] border ${
              errors.barberName ? "border-rose-500" : "border-[#38332c]"
            } rounded-xl px-4 py-3 text-[#f5f4f0] placeholder:text-[#a39e93]/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm`}
          />
        </div>
        {errors.barberName && (
          <p className="text-xs text-rose-400 mt-1">{errors.barberName}</p>
        )}
      </div>

      {/* Barber WhatsApp / Phone */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-[#f5f4f0] flex items-center gap-1.5">
          <Phone className="w-4 h-4 text-amber-500" />
          Nomor WhatsApp / HP Barber <span className="text-amber-500">*</span>
        </label>
        <div className="relative">
          <input
            type="tel"
            value={barberPhone}
            onChange={(e) => onChange("barberPhone", e.target.value)}
            placeholder="Contoh: 081298765432"
            className={`w-full bg-[#181614] border ${
              errors.barberPhone ? "border-rose-500" : "border-[#38332c]"
            } rounded-xl px-4 py-3 text-[#f5f4f0] placeholder:text-[#a39e93]/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm`}
          />
        </div>
        <p className="text-[11px] text-[#a39e93]">
          Nomor ini akan digunakan barber untuk masuk ke Portal Barber Mandiri.
        </p>
        {errors.barberPhone && (
          <p className="text-xs text-rose-400 mt-1">{errors.barberPhone}</p>
        )}
      </div>

      {/* Barber Account Password */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-[#f5f4f0] flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-amber-500" />
          Password Akun Barber <span className="text-amber-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={barberPassword}
            onChange={(e) => onChange("barberPassword", e.target.value)}
            placeholder="Default: barber123"
            className={`w-full bg-[#181614] border ${
              errors.barberPassword ? "border-rose-500" : "border-[#38332c]"
            } rounded-xl pl-4 pr-11 py-3 text-[#f5f4f0] placeholder:text-[#a39e93]/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a39e93] hover:text-[#f5f4f0]"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[11px] text-[#a39e93]">
          Password awal dapat diganti langsung oleh kapster di perangkat mereka.
        </p>
        {errors.barberPassword && (
          <p className="text-xs text-rose-400 mt-1">{errors.barberPassword}</p>
        )}
      </div>

      {/* Commission Configuration Grid */}
      <div className="pt-2 border-t border-[#38332c]/60 space-y-4">
        <div className="flex items-center gap-2">
          <Banknote className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-[#f5f4f0]">
            Skema Kompensasi & Bagi Hasil Barber
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Service Commission % */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#f5f4f0] flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-amber-500" />
              Komisi Jasa Cukur (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={serviceCommissionPct}
                onChange={(e) =>
                  onChange("serviceCommissionPct", parseFloat(e.target.value) || 0)
                }
                className={`w-full bg-[#181614] border ${
                  errors.serviceCommissionPct ? "border-rose-500" : "border-[#38332c]"
                } rounded-xl px-4 py-2.5 text-[#f5f4f0] focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm font-semibold`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-amber-500">
                %
              </span>
            </div>
            <p className="text-[11px] text-[#a39e93]">
              Default: 50% untuk kapster, 50% untuk ruko.
            </p>
            {errors.serviceCommissionPct && (
              <p className="text-xs text-rose-400 mt-1">{errors.serviceCommissionPct}</p>
            )}
          </div>

          {/* Product Retail Incentive Flat */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#f5f4f0] flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5 text-amber-500" />
              Insentif Jual Produk Ritel
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                step={500}
                value={productCommissionFlat}
                onChange={(e) =>
                  onChange("productCommissionFlat", parseFloat(e.target.value) || 0)
                }
                className={`w-full bg-[#181614] border ${
                  errors.productCommissionFlat ? "border-rose-500" : "border-[#38332c]"
                } rounded-xl px-4 py-2.5 text-[#f5f4f0] focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm font-semibold`}
              />
            </div>
            <p className="text-[11px] text-[#a39e93]">
              Nilai: <span className="font-semibold text-amber-500">{formatRupiah(productCommissionFlat)}</span> per botol pomade/ritel terjual.
            </p>
            {errors.productCommissionFlat && (
              <p className="text-xs text-rose-400 mt-1">{errors.productCommissionFlat}</p>
            )}
          </div>
        </div>

        {/* Informational Callout */}
        <div className="bg-[#181614] border border-[#38332c] rounded-xl p-3 flex items-start gap-2.5 text-xs text-[#a39e93]">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p>
            Status awal barber ini akan otomatis diaktifkan menjadi{" "}
            <span className="text-emerald-400 font-semibold">[READY / SIAP]</span> di ruang antrean pangkas rambut. Anda dapat menambah barber lainnya kapan saja dari dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};
