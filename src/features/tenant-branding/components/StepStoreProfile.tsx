"use client";

import React, { useState } from "react";
import { Store, Phone, MapPin, Image as ImageIcon, Palette, Check } from "lucide-react";
import { BRAND_COLOR_PRESETS } from "../types";

interface StepStoreProfileProps {
  brandName: string;
  phone: string;
  address: string;
  logoUrl: string;
  primaryColor: string;
  onChange: (field: string, value: string) => void;
  errors?: Record<string, string>;
}

export const StepStoreProfile: React.FC<StepStoreProfileProps> = ({
  brandName,
  phone,
  address,
  logoUrl,
  primaryColor,
  onChange,
  errors = {},
}) => {
  const [imageError, setImageError] = useState(false);

  const handleLogoUrlChange = (val: string) => {
    setImageError(false);
    onChange("logoUrl", val);
  };

  const getInitials = (name: string) => {
    if (!name) return "CK";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="border-b border-[#38332c] pb-4">
        <h2 className="text-xl font-bold text-[#f5f4f0] flex items-center gap-2">
          <Store className="w-5 h-5 text-amber-500" />
          Profil & Brand Identitas Toko
        </h2>
        <p className="text-sm text-[#a39e93] mt-1">
          Atur informasi cabang ruko fisik dan tema visual identitas barbershop Anda.
        </p>
      </div>

      {/* Brand & Store Name */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-[#f5f4f0] flex items-center gap-1.5">
          Nama Toko / Brand Barbershop <span className="text-amber-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={brandName}
            onChange={(e) => onChange("brandName", e.target.value)}
            placeholder="Contoh: Barberking Premium Studio"
            className={`w-full bg-[#181614] border ${
              errors.brandName ? "border-rose-500" : "border-[#38332c]"
            } rounded-xl px-4 py-3 text-[#f5f4f0] placeholder:text-[#a39e93]/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm`}
          />
        </div>
        {errors.brandName && (
          <p className="text-xs text-rose-400 mt-1">{errors.brandName}</p>
        )}
      </div>

      {/* Phone / WhatsApp */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-[#f5f4f0] flex items-center gap-1.5">
          <Phone className="w-4 h-4 text-amber-500" />
          Nomor Telepon Ruko / WhatsApp Toko <span className="text-amber-500">*</span>
        </label>
        <div className="relative">
          <input
            type="tel"
            value={phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="Contoh: 081234567890"
            className={`w-full bg-[#181614] border ${
              errors.phone ? "border-rose-500" : "border-[#38332c]"
            } rounded-xl px-4 py-3 text-[#f5f4f0] placeholder:text-[#a39e93]/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm`}
          />
        </div>
        {errors.phone && (
          <p className="text-xs text-rose-400 mt-1">{errors.phone}</p>
        )}
      </div>

      {/* Physical Address */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-[#f5f4f0] flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-amber-500" />
          Alamat Fisik Ruko <span className="text-amber-500">*</span>
        </label>
        <textarea
          rows={3}
          value={address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="Contoh: Jl. Ahmad Yani No. 45, Ruko Sudirman Blok B2, Jakarta Selatan"
          className={`w-full bg-[#181614] border ${
            errors.address ? "border-rose-500" : "border-[#38332c]"
          } rounded-xl px-4 py-3 text-[#f5f4f0] placeholder:text-[#a39e93]/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm resize-none`}
        />
        {errors.address && (
          <p className="text-xs text-rose-400 mt-1">{errors.address}</p>
        )}
      </div>

      {/* Logo URL & Live Preview */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-[#f5f4f0] flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-amber-500" />
          Logo Brand URL <span className="text-xs text-[#a39e93] font-normal">(Opsional)</span>
        </label>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Live Preview Box */}
          <div className="shrink-0 flex items-center gap-3">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner border border-[#38332c] overflow-hidden"
              style={{
                backgroundColor: primaryColor || "#d97706",
                color: "#ffffff",
              }}
            >
              {logoUrl && !imageError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt="Logo Preview"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{getInitials(brandName)}</span>
              )}
            </div>
            <div className="text-xs text-[#a39e93]">
              <p className="font-medium text-[#f5f4f0]">Preview Logo</p>
              <p>{logoUrl && !imageError ? "Gambar URL termuat" : "Fallback Inisial Brand"}</p>
            </div>
          </div>

          <div className="flex-1 w-full">
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => handleLogoUrlChange(e.target.value)}
              placeholder="https://domain.com/logo-barber.png"
              className={`w-full bg-[#181614] border ${
                errors.logoUrl ? "border-rose-500" : "border-[#38332c]"
              } rounded-xl px-4 py-3 text-[#f5f4f0] placeholder:text-[#a39e93]/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm`}
            />
            {errors.logoUrl && (
              <p className="text-xs text-rose-400 mt-1">{errors.logoUrl}</p>
            )}
          </div>
        </div>
      </div>

      {/* Brand Color Picker */}
      <div className="space-y-3 pt-2 border-t border-[#38332c]/60">
        <label className="text-sm font-semibold text-[#f5f4f0] flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-amber-500" />
          Warna Utama Brand Barbershop
        </label>
        <p className="text-xs text-[#a39e93]">
          Pilih salah satu dari 6 tema palet vintage modern, atau masukkan kode HEX khusus barbershop Anda.
        </p>

        {/* 6 Preset Color Swatches */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {BRAND_COLOR_PRESETS.map((preset) => {
            const isSelected =
              primaryColor.toLowerCase() === preset.hex.toLowerCase();
            return (
              <button
                key={preset.hex}
                type="button"
                onClick={() => onChange("primaryColor", preset.hex)}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-left ${
                  isSelected
                    ? "border-amber-500 bg-[#2c2823] shadow-md ring-1 ring-amber-500"
                    : "border-[#38332c] bg-[#181614] hover:bg-[#2c2823]/60"
                }`}
              >
                <div
                  className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center shadow"
                  style={{ backgroundColor: preset.hex }}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-[#f5f4f0] truncate">
                    {preset.name}
                  </p>
                  <p className="text-[10px] text-[#a39e93] font-mono">{preset.hex}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Hex Input with Live Color Swatch */}
        <div className="flex items-center gap-3 pt-2">
          <div
            className="w-10 h-10 rounded-xl border border-[#38332c] shrink-0 shadow-inner"
            style={{ backgroundColor: primaryColor || "#d97706" }}
          />
          <div className="flex-1 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono text-[#a39e93]">
              HEX
            </span>
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => {
                let val = e.target.value;
                if (!val.startsWith("#") && val.length > 0) val = "#" + val;
                onChange("primaryColor", val);
              }}
              placeholder="#d97706"
              maxLength={7}
              className={`w-full bg-[#181614] border ${
                errors.primaryColor ? "border-rose-500" : "border-[#38332c]"
              } rounded-xl pl-12 pr-4 py-2.5 text-[#f5f4f0] font-mono text-sm placeholder:text-[#a39e93]/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50`}
            />
          </div>
        </div>
        {errors.primaryColor && (
          <p className="text-xs text-rose-400 mt-1">{errors.primaryColor}</p>
        )}
      </div>
    </div>
  );
};
