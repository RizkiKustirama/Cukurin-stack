"use client";

import React, { useState } from "react";
import { Store, X, Check, ShieldCheck, Info, MessageSquare } from "lucide-react";
import { createTenantAction } from "../actions/createTenantAction";
import { SubscriptionPlan } from "@prisma/client";

interface CreateTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateTenantModal({ isOpen, onClose, onSuccess }: CreateTenantModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Jakarta Selatan");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [password, setPassword] = useState("Cukurin#2026");
  const [plan, setPlan] = useState<SubscriptionPlan | "TRIAL">("REGULER");
  const [chairEstimate, setChairEstimate] = useState<string>("3 Meja");
  const [sendWhatsApp, setSendWhatsApp] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]/g, "")) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .trim()
        .replace(/\s+/g, "");
      setSlug(autoSlug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setErrorMessage("Nama Barbershop dan domain slug wajib diisi.");
      return;
    }
    if (!ownerName.trim() || !ownerPhone.trim()) {
      setErrorMessage("Nama dan nomor WhatsApp owner wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await createTenantAction({
        name: name.trim(),
        slug: slug.trim(),
        brandName: name.trim(),
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        ownerName: ownerName.trim(),
        ownerPhone: ownerPhone.trim(),
        ownerEmail: ownerEmail.trim() || undefined,
        password: password.trim() || "Cukurin#2026",
        plan,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal mendaftarkan tenant.");
      } else {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan sistem saat membuat tenant.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[700px] max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-[#E8E5DE] overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#E8E5DE] relative bg-white shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E8F7EE] text-[#1E8E3E] flex items-center justify-center shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-[#1A1A1A] tracking-tight">
                    Daftarkan Tenant Barbershop Baru
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF6FE] text-[#1A73E8] uppercase tracking-wider">
                    Superadmin
                  </span>
                </div>
                <p className="text-xs text-[#706E68] leading-relaxed max-w-[500px]">
                  Tambahkan data barbershop baru ke platform Cukurin. Akun owner dan database tenant akan dibuat secara otomatis.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Tutup Modal"
              className="w-8 h-8 rounded-full bg-[#F6F5F2] hover:bg-[#EFECE6] flex items-center justify-center text-[#706E68] hover:text-[#1A1A1A] transition-colors shrink-0 cursor-pointer"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section Indicator Tabs */}
          <div className="flex items-center gap-6 mt-4 pt-3 border-t border-[#E8E5DE] text-xs font-semibold text-[#706E68]">
            <span className="flex items-center gap-1.5 text-[#1A1A1A] pb-1 border-b-2 border-[#1A1A1A]">
              <span className="w-4 h-4 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-[10px]">
                1
              </span>
              Identitas Barbershop
            </span>
            <span className="flex items-center gap-1.5 text-[#706E68] pb-1">
              <span className="w-4 h-4 rounded-full bg-[#F6F5F2] text-[#706E68] flex items-center justify-center text-[10px]">
                2
              </span>
              Data Owner
            </span>
            <span className="flex items-center gap-1.5 text-[#706E68] pb-1">
              <span className="w-4 h-4 rounded-full bg-[#F6F5F2] text-[#706E68] flex items-center justify-center text-[10px]">
                3
              </span>
              Paket & Lisensi
            </span>
          </div>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Section A: Identitas Barbershop */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#706E68] uppercase tracking-wider">
                A. Identitas Barbershop
              </span>
              {slug && (
                <span className="text-[11px] font-mono font-bold text-[#1E8E3E] bg-[#E8F7EE] px-2.5 py-0.5 rounded-full">
                  ID: /{slug}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                Nama Barbershop / Brand <span className="text-[#D93025]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="contoh: Barber Brothers Kemang"
                className="w-full px-3.5 py-2.5 bg-[#F6F5F2] rounded-xl border border-[#E8E5DE] focus:border-[#111111] focus:outline-none text-xs text-[#1A1A1A] placeholder:text-[#A8A59E] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                Domain Akses Web & PWA Register <span className="text-[#D93025]">*</span>
              </label>
              <div className="flex items-center rounded-xl border border-[#E8E5DE] bg-white focus-within:border-[#111111] overflow-hidden transition-all text-xs">
                <span className="px-3 py-2 bg-[#F6F5F2] text-[#706E68] select-none border-r border-[#E8E5DE]">
                  https://
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) =>
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                  }
                  placeholder="barberbrothers"
                  className="flex-1 px-3 py-2 bg-transparent focus:outline-none text-[#1A1A1A] font-mono placeholder:text-[#A8A59E]"
                />
                <span className="px-3 py-2 bg-[#F6F5F2] text-[#706E68] select-none border-l border-[#E8E5DE]">
                  .cukurin.app
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                  Alamat Lengkap Operasional
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="contoh: Jl. Bangka Raya No. 12"
                  className="w-full px-3.5 py-2 bg-[#F6F5F2] rounded-xl border border-[#E8E5DE] focus:border-[#111111] focus:outline-none text-xs text-[#1A1A1A] placeholder:text-[#A8A59E]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                  Kota / Wilayah Operasional
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="contoh: Jakarta Selatan"
                  className="w-full px-3.5 py-2 bg-[#F6F5F2] rounded-xl border border-[#E8E5DE] focus:border-[#111111] focus:outline-none text-xs text-[#1A1A1A] placeholder:text-[#A8A59E]"
                />
              </div>
            </div>
          </div>

          {/* Section B: Data Pemilik Toko */}
          <div className="space-y-3.5 pt-3 border-t border-[#E8E5DE]">
            <span className="block text-xs font-bold text-[#706E68] uppercase tracking-wider">
              B. Akun Utama Pemilik (Owner Info & Login)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                  Nama Lengkap Owner <span className="text-[#D93025]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="contoh: Hendra Setiawan"
                  className="w-full px-3.5 py-2 bg-[#F6F5F2] rounded-xl border border-[#E8E5DE] focus:border-[#111111] focus:outline-none text-xs text-[#1A1A1A] placeholder:text-[#A8A59E]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                  Nomor WhatsApp Aktif <span className="text-[#D93025]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  placeholder="0812-9876-xxxx"
                  className="w-full px-3.5 py-2 bg-[#F6F5F2] rounded-xl border border-[#E8E5DE] focus:border-[#111111] focus:outline-none text-xs text-[#1A1A1A] placeholder:text-[#A8A59E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                  Email Login Akun (Opsional)
                </label>
                <input
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="owner@barbershop.id"
                  className="w-full px-3.5 py-2 bg-[#F6F5F2] rounded-xl border border-[#E8E5DE] focus:border-[#111111] focus:outline-none text-xs text-[#1A1A1A] placeholder:text-[#A8A59E]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                  Password Akses Awal
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#F6F5F2] rounded-xl border border-[#E8E5DE] focus:border-[#111111] focus:outline-none text-xs text-[#1A1A1A] font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section C: Pemilihan Lisensi SaaS & Setup */}
          <div className="space-y-3.5 pt-3 border-t border-[#E8E5DE]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#706E68] uppercase tracking-wider">
                C. Paket Lisensi SaaS & Durasi
              </span>
              <span className="text-[11px] text-[#706E68]">Billing Bulanan</span>
            </div>

            {/* 3-Tier Radio Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Trial */}
              <label
                onClick={() => setPlan("TRIAL")}
                className={`cursor-pointer border rounded-2xl p-3.5 transition-all flex flex-col justify-between ${
                  plan === "TRIAL"
                    ? "border-[#111111] bg-[#F6F5F2] shadow-xs ring-1 ring-[#111111]"
                    : "border-[#E8E5DE] bg-white hover:bg-[#F6F5F2]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <input
                      type="radio"
                      name="plan"
                      checked={plan === "TRIAL"}
                      onChange={() => setPlan("TRIAL")}
                      className="accent-[#111111]"
                    />
                    <span className="text-[10px] font-semibold bg-[#EFECE6] px-2 py-0.5 rounded-full text-[#706E68]">
                      Evaluasi
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#1A1A1A]">Free Trial</h4>
                  <p className="text-[11px] text-[#706E68] mt-0.5">Durasi 14 Hari</p>
                  <div className="mt-2 text-[11px] text-[#706E68] space-y-0.5">
                    <div>• Maks 2 Barber</div>
                    <div>• 1 Register POS</div>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-[#E8E5DE] text-sm font-bold font-mono text-[#1A1A1A]">
                  Rp 0
                </div>
              </label>

              {/* Reguler */}
              <label
                onClick={() => setPlan("REGULER")}
                className={`cursor-pointer border rounded-2xl p-3.5 transition-all flex flex-col justify-between relative ${
                  plan === "REGULER"
                    ? "border-[#111111] bg-[#F6F5F2] shadow-xs ring-1 ring-[#111111]"
                    : "border-[#E8E5DE] bg-white hover:bg-[#F6F5F2]"
                }`}
              >
                <span className="absolute -top-2.5 right-3 bg-[#111111] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Disarankan
                </span>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <input
                      type="radio"
                      name="plan"
                      checked={plan === "REGULER"}
                      onChange={() => setPlan("REGULER")}
                      className="accent-[#111111]"
                    />
                    <span className="text-[10px] font-bold bg-[#FEF3EB] text-[#D97706] px-2 py-0.5 rounded-full">
                      Populer
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#1A1A1A]">Paket Reguler</h4>
                  <p className="text-[11px] text-[#706E68] mt-0.5">Langganan 1 Bulan</p>
                  <div className="mt-2 text-[11px] text-[#706E68] space-y-0.5">
                    <div>• 1 Cabang Outlet</div>
                    <div>• Maks 5 Barber Aktif</div>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-[#E8E5DE] text-sm font-bold font-mono text-[#1A1A1A]">
                  Rp 199.000<span className="text-[10px] font-normal text-[#706E68]">/bln</span>
                </div>
              </label>

              {/* Pro */}
              <label
                onClick={() => setPlan("PRO")}
                className={`cursor-pointer border rounded-2xl p-3.5 transition-all flex flex-col justify-between ${
                  plan === "PRO"
                    ? "border-[#111111] bg-[#F6F5F2] shadow-xs ring-1 ring-[#111111]"
                    : "border-[#E8E5DE] bg-white hover:bg-[#F6F5F2]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <input
                      type="radio"
                      name="plan"
                      checked={plan === "PRO"}
                      onChange={() => setPlan("PRO")}
                      className="accent-[#111111]"
                    />
                    <span className="text-[10px] font-bold bg-[#E8F7EE] text-[#1E8E3E] px-2 py-0.5 rounded-full">
                      Multi-outlet
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#1A1A1A]">Paket Pro</h4>
                  <p className="text-[11px] text-[#706E68] mt-0.5">Langganan 1 Bulan</p>
                  <div className="mt-2 text-[11px] text-[#706E68] space-y-0.5">
                    <div>• Hingga 3 Cabang</div>
                    <div>• Unlimited Barber</div>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-[#E8E5DE] text-sm font-bold font-mono text-[#1A1A1A]">
                  Rp 299.000<span className="text-[10px] font-normal text-[#706E68]">/bln</span>
                </div>
              </label>
            </div>

            {/* Quick Selector: Estimasi Kursi */}
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                Estimasi Kursi / Meja Barber Awal
              </label>
              <div className="flex flex-wrap gap-2">
                {["2 Meja", "3 Meja", "4 Meja", "5+ Meja"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setChairEstimate(m)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                      chairEstimate === m
                        ? "bg-[#111111] text-white font-semibold shadow-xs"
                        : "bg-[#F6F5F2] text-[#706E68] hover:bg-[#EFECE6]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkbox WhatsApp */}
            <div className="p-3 bg-[#F6F5F2] rounded-xl flex items-start gap-2.5 cursor-pointer">
              <input
                id="send-wa"
                type="checkbox"
                checked={sendWhatsApp}
                onChange={(e) => setSendWhatsApp(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-[#111111] cursor-pointer"
              />
              <label htmlFor="send-wa" className="text-xs text-[#1A1A1A] cursor-pointer select-none">
                <span className="font-semibold text-[#1A1A1A]">
                  Kirim kredensial login & panduan aktivasi instan
                </span>
                <p className="text-[11px] text-[#706E68] mt-0.5">
                  Sistem otomatis menyiapkan nomor WhatsApp Owner untuk tutorial onboarding mandiri.
                </p>
              </label>
            </div>

            {/* Info Box */}
            <div className="p-3 bg-[#EEF6FE] rounded-xl border border-[#BAE6FD]/60 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#1A73E8] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#706E68] leading-relaxed">
                <strong className="text-[#1A1A1A]">Alur Setup Otomatis:</strong> Tenant diarahkan langsung ke wizard onboarding 3 langkah (Profil Toko → Tambah Kursi/Barber → Daftar Layanan) pada saat login pertama kali.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-[#FDF0F2] border border-[#FECDD3] text-[#D93025] text-xs">
              {errorMessage}
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#E8E5DE]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-full bg-white border border-[#E8E5DE] text-xs font-semibold text-[#706E68] hover:text-[#1A1A1A] hover:bg-[#F6F5F2] transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !ownerName.trim() || !ownerPhone.trim()}
              className="px-6 py-2.5 rounded-full bg-[#111111] hover:bg-neutral-800 disabled:bg-[#E8E5DE] disabled:text-[#A8A59E] text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan & Daftarkan Tenant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
