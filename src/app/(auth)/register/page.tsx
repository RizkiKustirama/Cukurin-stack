"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Scissors,
  User,
  Phone,
  Lock,
  Building2,
  MapPin,
  Percent,
  Coins,
  Armchair,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
} from "lucide-react";
import { registerTenantAction, type RegisterTenantInput } from "./actions";

export default function RegisterWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [showOwnerPassword, setShowOwnerPassword] = useState(false);
  const [showBarberPassword, setShowBarberPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState<RegisterTenantInput>({
    brandName: "",
    slug: "",
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
    ownerPassword: "",
    address: "",
    barberName: "",
    barberPhone: "",
    barberPassword: "",
    serviceCommissionPct: 40,
    productCommissionFlat: 5000,
    activeChairs: 3,
    serviceName: "Gentleman Haircut + Wash",
    servicePrice: 50000,
    durationMinutes: 45,
    subscriptionPlan: "REGULER",
  });

  // Slug auto-generation flag
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const handleBrandNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => {
      const updated = { ...prev, brandName: val };
      if (!isSlugManuallyEdited) {
        updated.slug = val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
      return updated;
    });
    clearError("brandName");
    clearError("slug");
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    const val = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "");
    setFormData((prev) => ({ ...prev, slug: val }));
    clearError("slug");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let parsedValue: unknown = value;
    if (type === "number") {
      parsedValue = value === "" ? 0 : Number(value);
    }
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    clearError(name);
  };

  const clearError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const errors: Record<string, string[]> = {};
    if (!formData.brandName || formData.brandName.trim().length < 3) {
      errors.brandName = ["Nama barbershop minimal 3 karakter."];
    }
    if (!formData.slug || formData.slug.trim().length < 3) {
      errors.slug = ["Slug URL minimal 3 karakter."];
    }
    if (!formData.ownerName || formData.ownerName.trim().length < 2) {
      errors.ownerName = ["Nama lengkap pemilik wajib diisi."];
    }
    if (!formData.ownerPhone || !/^08[0-9]{8,13}$/.test(formData.ownerPhone)) {
      errors.ownerPhone = ["Format WhatsApp tidak valid (contoh: 081234567890)."];
    }
    if (!formData.ownerPassword || formData.ownerPassword.length < 6) {
      errors.ownerPassword = ["Password minimal 6 karakter."];
    }
    if (!formData.address || formData.address.trim().length < 5) {
      errors.address = ["Alamat cabang utama minimal 5 karakter."];
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    const errors: Record<string, string[]> = {};
    if (!formData.barberName || formData.barberName.trim().length < 2) {
      errors.barberName = ["Nama barber minimal 2 karakter."];
    }
    if (!formData.barberPhone || !/^08[0-9]{8,13}$/.test(formData.barberPhone)) {
      errors.barberPhone = ["Format WhatsApp barber tidak valid (contoh: 081234567890)."];
    }
    if (formData.barberPhone === formData.ownerPhone) {
      errors.barberPhone = ["Nomor WhatsApp barber tidak boleh sama dengan nomor pemilik."];
    }
    if (!formData.barberPassword || formData.barberPassword.length < 6) {
      errors.barberPassword = ["Password minimal 6 karakter."];
    }
    if (formData.serviceCommissionPct < 0 || formData.serviceCommissionPct > 100) {
      errors.serviceCommissionPct = ["Komisi jasa harus antara 0% dan 100%."];
    }
    if (formData.activeChairs < 1 || formData.activeChairs > 20) {
      errors.activeChairs = ["Jumlah kursi antara 1 dan 20 kursi."];
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 3 Validation
  const validateStep3 = (): boolean => {
    const errors: Record<string, string[]> = {};
    if (!formData.serviceName || formData.serviceName.trim().length < 2) {
      errors.serviceName = ["Nama layanan awal wajib diisi."];
    }
    if (!formData.servicePrice || formData.servicePrice < 5000) {
      errors.servicePrice = ["Tarif layanan minimal Rp 5.000."];
    }
    if (!formData.durationMinutes || formData.durationMinutes < 10) {
      errors.durationMinutes = ["Durasi minimal 10 menit."];
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    setErrorMessage(null);
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    }
  };

  const handlePrev = () => {
    setErrorMessage(null);
    if (currentStep === 3) setCurrentStep(2);
    else if (currentStep === 2) setCurrentStep(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setErrorMessage(null);
    startTransition(async () => {
      const res = await registerTenantAction(null, formData);
      if (res.success) {
        router.push(res.data.redirectUrl);
        router.refresh();
      } else {
        setErrorMessage(res.error || "Gagal mendaftarkan barbershop. Silakan cek data Anda.");
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors as Record<string, string[]>);
          // Auto jump to step with error
          if (
            res.fieldErrors.brandName ||
            res.fieldErrors.slug ||
            res.fieldErrors.ownerName ||
            res.fieldErrors.ownerPhone ||
            res.fieldErrors.ownerPassword ||
            res.fieldErrors.address
          ) {
            setCurrentStep(1);
          } else if (
            res.fieldErrors.barberName ||
            res.fieldErrors.barberPhone ||
            res.fieldErrors.barberPassword ||
            res.fieldErrors.serviceCommissionPct ||
            res.fieldErrors.activeChairs
          ) {
            setCurrentStep(2);
          }
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between selection:bg-[#FF4500] selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-[#FF4500] flex items-center justify-center text-black font-bold">
            <Scissors className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold font-serif tracking-tight text-white">
            Cukurin<span className="text-[#FF4500]">.</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400 hidden sm:inline">Sudah punya akun?</span>
          <Link
            href="/login"
            className="text-xs px-3.5 py-1.5 rounded-full border border-white/20 hover:border-white/40 text-neutral-200 transition-colors"
          >
            Masuk ke Akun
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-xl w-full mx-auto px-4 py-8 sm:py-12 flex-1">
        {/* Wizard Stepper Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300 font-mono mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#FF4500]" />
            <span>Setup Onboarding Baru • Stitch Screen 11</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium text-white tracking-tight">
            Daftarkan Barbershop Anda
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1.5">
            Coba gratis 14 hari tanpa kartu kredit. Selesai dalam 2 menit.
          </p>

          {/* Stepper Progress Bar */}
          <div className="mt-6 flex items-center justify-center gap-2 max-w-sm mx-auto">
            {[
              { num: 1, label: "Toko & Owner" },
              { num: 2, label: "Barber & Kursi" },
              { num: 3, label: "Layanan & Trial" },
            ].map((step, idx) => {
              const isCurrent = currentStep === step.num;
              const isDone = currentStep > step.num;
              return (
                <React.Fragment key={step.num}>
                  {idx > 0 && (
                    <div
                      className={`h-0.5 flex-1 transition-colors duration-300 ${
                        isDone ? "bg-[#FF4500]" : "bg-white/10"
                      }`}
                    />
                  )}
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                        isDone
                          ? "bg-[#FF4500] text-black"
                          : isCurrent
                          ? "bg-white text-black ring-4 ring-[#FF4500]/20"
                          : "bg-white/5 text-neutral-400 border border-white/10"
                      }`}
                    >
                      {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : step.num}
                    </div>
                    <span
                      className={`text-[10px] whitespace-nowrap transition-colors ${
                        isCurrent ? "text-white font-medium" : "text-neutral-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Wizard Card */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ================= STEP 1 ================= */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="border-b border-white/10 pb-3 mb-4">
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#FF4500]" />
                    Profil Bisnis & Akun Pemilik
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Data ini digunakan untuk URL toko dan kredensial login Owner.
                  </p>
                </div>

                {/* Nama Barbershop */}
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Nama Barbershop <span className="text-[#FF4500]">*</span>
                  </label>
                  <input
                    type="text"
                    name="brandName"
                    required
                    value={formData.brandName}
                    onChange={handleBrandNameChange}
                    placeholder="Contoh: Gentlemen Cut & Shave"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors"
                  />
                  {fieldErrors.brandName && (
                    <p className="text-xs text-red-400 mt-1">{fieldErrors.brandName[0]}</p>
                  )}
                </div>

                {/* Slug Toko */}
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    URL Domain Toko <span className="text-[#FF4500]">*</span>
                  </label>
                  <div className="flex rounded-xl bg-white/5 border border-white/10 overflow-hidden focus-within:border-[#FF4500] focus-within:ring-1 focus-within:ring-[#FF4500] transition-colors">
                    <span className="px-3 py-2.5 bg-white/5 text-neutral-400 text-xs flex items-center border-r border-white/10 select-none">
                      cukurin.app/
                    </span>
                    <input
                      type="text"
                      name="slug"
                      required
                      value={formData.slug}
                      onChange={handleSlugChange}
                      placeholder="gentlemen-cut"
                      className="flex-1 px-3 py-2.5 bg-transparent text-white text-sm placeholder:text-neutral-500 focus:outline-none"
                    />
                  </div>
                  {fieldErrors.slug && (
                    <p className="text-xs text-red-400 mt-1">{fieldErrors.slug[0]}</p>
                  )}
                </div>

                {/* Nama Owner */}
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Nama Lengkap Pemilik (Owner) <span className="text-[#FF4500]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      name="ownerName"
                      required
                      value={formData.ownerName}
                      onChange={handleChange}
                      placeholder="Nama lengkap Anda"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors"
                    />
                  </div>
                  {fieldErrors.ownerName && (
                    <p className="text-xs text-red-400 mt-1">{fieldErrors.ownerName[0]}</p>
                  )}
                </div>

                {/* WhatsApp & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      No. WhatsApp Pemilik <span className="text-[#FF4500]">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        name="ownerPhone"
                        required
                        value={formData.ownerPhone}
                        onChange={handleChange}
                        placeholder="081234567890"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors"
                      />
                    </div>
                    {fieldErrors.ownerPhone && (
                      <p className="text-xs text-red-400 mt-1">{fieldErrors.ownerPhone[0]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Email Pemilik <span className="text-neutral-500 text-[10px]">(Opsional)</span>
                    </label>
                    <input
                      type="email"
                      name="ownerEmail"
                      value={formData.ownerEmail || ""}
                      onChange={handleChange}
                      placeholder="owner@email.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors"
                    />
                    {fieldErrors.ownerEmail && (
                      <p className="text-xs text-red-400 mt-1">{fieldErrors.ownerEmail[0]}</p>
                    )}
                  </div>
                </div>

                {/* Password Owner */}
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Password Akun Owner <span className="text-[#FF4500]">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                    <input
                      type={showOwnerPassword ? "text" : "password"}
                      name="ownerPassword"
                      required
                      value={formData.ownerPassword}
                      onChange={handleChange}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                      className="absolute right-3 top-3 text-neutral-400 hover:text-white"
                    >
                      {showOwnerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.ownerPassword && (
                    <p className="text-xs text-red-400 mt-1">{fieldErrors.ownerPassword[0]}</p>
                  )}
                </div>

                {/* Alamat Cabang */}
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Alamat Cabang Utama & Kota <span className="text-[#FF4500]">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Contoh: Ruko Senopati Blok B-12, Jakarta Selatan"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors"
                    />
                  </div>
                  {fieldErrors.address && (
                    <p className="text-xs text-red-400 mt-1">{fieldErrors.address[0]}</p>
                  )}
                </div>

                {/* Next Step 1 Button */}
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full mt-4 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Lanjut: Data Barber & Kursi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ================= STEP 2 ================= */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="border-b border-white/10 pb-3 mb-4">
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-[#FF4500]" />
                    Pendaftaran Barber Awal & Kursi
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Kapster pertama Anda untuk login ke portal antrean dan pencatatan komisi.
                  </p>
                </div>

                {/* Nama Barber */}
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Nama Barber / Kapster Pertama <span className="text-[#FF4500]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      name="barberName"
                      required
                      value={formData.barberName}
                      onChange={handleChange}
                      placeholder="Contoh: Ahmad Fadli"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors"
                    />
                  </div>
                  {fieldErrors.barberName && (
                    <p className="text-xs text-red-400 mt-1">{fieldErrors.barberName[0]}</p>
                  )}
                </div>

                {/* WhatsApp Barber */}
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    No. WhatsApp Barber (Login Portal) <span className="text-[#FF4500]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      name="barberPhone"
                      required
                      value={formData.barberPhone}
                      onChange={handleChange}
                      placeholder="08xxxxxxxxxx (beda dengan Owner)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors"
                    />
                  </div>
                  {fieldErrors.barberPhone && (
                    <p className="text-xs text-red-400 mt-1">{fieldErrors.barberPhone[0]}</p>
                  )}
                </div>

                {/* Password Barber */}
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Password Akun Barber <span className="text-[#FF4500]">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                    <input
                      type={showBarberPassword ? "text" : "password"}
                      name="barberPassword"
                      required
                      value={formData.barberPassword}
                      onChange={handleChange}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowBarberPassword(!showBarberPassword)}
                      className="absolute right-3 top-3 text-neutral-400 hover:text-white"
                    >
                      {showBarberPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.barberPassword && (
                    <p className="text-xs text-red-400 mt-1">{fieldErrors.barberPassword[0]}</p>
                  )}
                </div>

                {/* Skema Komisi & Kursi */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Komisi Jasa (%)
                    </label>
                    <div className="relative">
                      <Percent className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                      <input
                        type="number"
                        name="serviceCommissionPct"
                        min="0"
                        max="100"
                        value={formData.serviceCommissionPct}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF4500]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Bonus Produk (Rp)
                    </label>
                    <div className="relative">
                      <Coins className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                      <input
                        type="number"
                        name="productCommissionFlat"
                        min="0"
                        step="1000"
                        value={formData.productCommissionFlat}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF4500]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Kursi Cukur
                    </label>
                    <div className="relative">
                      <Armchair className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                      <input
                        type="number"
                        name="activeChairs"
                        min="1"
                        max="20"
                        value={formData.activeChairs}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF4500]"
                      />
                    </div>
                  </div>
                </div>

                {/* Prev & Next Buttons */}
                <div className="flex items-center gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="px-5 py-3 rounded-full border border-white/20 text-neutral-300 font-medium text-sm hover:border-white/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Lanjut: Menu & Layanan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 3 ================= */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="border-b border-white/10 pb-3 mb-4">
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF4500]" />
                    Layanan Utama & Konfirmasi Trial
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Satu layanan awal siap pakai di POS kasir dan aktivasi free trial 14 hari.
                  </p>
                </div>

                {/* Nama Layanan */}
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Nama Layanan Populer <span className="text-[#FF4500]">*</span>
                  </label>
                  <input
                    type="text"
                    name="serviceName"
                    required
                    value={formData.serviceName}
                    onChange={handleChange}
                    placeholder="Contoh: Gentleman Haircut + Wash"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors"
                  />
                  {fieldErrors.serviceName && (
                    <p className="text-xs text-red-400 mt-1">{fieldErrors.serviceName[0]}</p>
                  )}
                </div>

                {/* Harga & Durasi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Tarif / Harga Layanan (Rp) <span className="text-[#FF4500]">*</span>
                    </label>
                    <input
                      type="number"
                      name="servicePrice"
                      required
                      min="5000"
                      step="5000"
                      value={formData.servicePrice}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors"
                    />
                    {fieldErrors.servicePrice && (
                      <p className="text-xs text-red-400 mt-1">{fieldErrors.servicePrice[0]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Estimasi Durasi (Menit) <span className="text-[#FF4500]">*</span>
                    </label>
                    <select
                      name="durationMinutes"
                      value={formData.durationMinutes}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF4500]"
                    >
                      <option value="30">30 Menit (Express)</option>
                      <option value="45">45 Menit (Standar)</option>
                      <option value="60">60 Menit (Lengkap)</option>
                      <option value="90">90 Menit (Treatment)</option>
                    </select>
                  </div>
                </div>

                {/* Free Trial Banner */}
                <div className="mt-4 p-4 rounded-xl bg-[#FF4500]/10 border border-[#FF4500]/30 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FF4500] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Free Trial 14 Hari Siap Aktif
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FF4500] text-black">
                      Rp 0
                    </span>
                  </div>
                  <ul className="text-xs text-neutral-300 space-y-1.5">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4500]" />
                      Akses penuh ke POS Kasir, Smart Queue Grid, dan Cetak Struk
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4500]" />
                      Bagi hasil & komisi barber tercatat transparan realtime
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4500]" />
                      Tanpa komitmen kartu kredit & dapat dihentikan kapan saja
                    </li>
                  </ul>
                </div>

                {/* Prev & Final Submit Button */}
                <div className="flex items-center gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={isPending}
                    className="px-5 py-3.5 rounded-full border border-white/20 text-neutral-300 font-medium text-sm hover:border-white/40 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 py-3.5 rounded-full bg-[#FF4500] hover:bg-[#e03d00] text-black font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#FF4500]/20 cursor-pointer disabled:opacity-50"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Mendaftarkan Barbershop...</span>
                      </>
                    ) : (
                      <>
                        <span>Selesaikan & Buka Barbershop Saya</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-neutral-500">
        &copy; 2026 Cukurin.app — Elevating the art of barbershop operations.
      </footer>
    </div>
  );
}
