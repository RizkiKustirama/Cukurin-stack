"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  UserCheck,
  Scissors,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Loader2,
  AlertCircle,
  MapPin,
  Phone,
  Banknote,
  Clock,
  Lock,
} from "lucide-react";
import { StepStoreProfile } from "./StepStoreProfile";
import { StepFirstBarber } from "./StepFirstBarber";
import { StepFirstService } from "./StepFirstService";
import { completeOnboardingAction } from "../actions/onboardingAction";
import type { OnboardingFormData } from "../types";
import { formatRupiah } from "@/shared/lib/formatters";

interface OnboardingWizardProps {
  initialData?: {
    brandName?: string;
    phone?: string;
    address?: string;
    logoUrl?: string;
    primaryColor?: string;
  };
  storeSlug: string;
}

const STEPS = [
  { id: 1, title: "Profil Toko", icon: Store },
  { id: 2, title: "Barber Pertama", icon: UserCheck },
  { id: 3, title: "Layanan Cukur", icon: Scissors },
  { id: 4, title: "Konfirmasi", icon: CheckCircle2 },
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  initialData,
  storeSlug,
}) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<OnboardingFormData>({
    brandName: initialData?.brandName || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    logoUrl: initialData?.logoUrl || "",
    primaryColor: initialData?.primaryColor || "#d97706",
    barberName: "",
    barberPhone: "",
    barberPassword: "barber123",
    serviceCommissionPct: 50,
    productCommissionFlat: 5000,
    serviceName: "Paket Potong Reguler",
    servicePrice: 40000,
    durationMinutes: 30,
    serviceDescription: "Cuci, potong rambut rapi, handuk hangat, dan styling",
  });

  const handleFieldChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.brandName || formData.brandName.trim().length < 2) {
        errors.brandName = "Nama toko / brand minimal 2 karakter.";
      }
      if (!formData.phone || formData.phone.trim().length < 8) {
        errors.phone = "Nomor WhatsApp / telepon ruko minimal 8 digit.";
      }
      if (!formData.address || formData.address.trim().length < 5) {
        errors.address = "Alamat fisik ruko minimal 5 karakter.";
      }
      if (
        formData.logoUrl &&
        formData.logoUrl.trim() !== "" &&
        !/^https?:\/\/.+/.test(formData.logoUrl.trim())
      ) {
        errors.logoUrl = "URL logo harus diawali http:// atau https://";
      }
      if (
        !formData.primaryColor ||
        !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(formData.primaryColor)
      ) {
        errors.primaryColor = "Format warna HEX tidak valid (misal: #d97706).";
      }
    } else if (step === 2) {
      if (!formData.barberName || formData.barberName.trim().length < 2) {
        errors.barberName = "Nama lengkap barber minimal 2 karakter.";
      }
      if (!formData.barberPhone || formData.barberPhone.trim().length < 8) {
        errors.barberPhone = "Nomor WhatsApp barber minimal 8 digit.";
      }
      if (!formData.barberPassword || formData.barberPassword.length < 6) {
        errors.barberPassword = "Password akun barber minimal 6 karakter.";
      }
      if (
        formData.serviceCommissionPct < 0 ||
        formData.serviceCommissionPct > 100
      ) {
        errors.serviceCommissionPct = "Komisi harus antara 0% hingga 100%.";
      }
      if (formData.productCommissionFlat < 0) {
        errors.productCommissionFlat = "Insentif retail tidak boleh negatif.";
      }
    } else if (step === 3) {
      if (!formData.serviceName || formData.serviceName.trim().length < 2) {
        errors.serviceName = "Nama paket layanan minimal 2 karakter.";
      }
      if (formData.servicePrice < 0) {
        errors.servicePrice = "Harga jual tidak boleh kurang dari Rp 0.";
      }
      if (formData.durationMinutes < 5) {
        errors.durationMinutes = "Estimasi durasi minimal 5 menit.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setSubmitError(null);
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    setSubmitError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinalSubmit = async () => {
    // Validate all steps before submitting
    const step1Valid = validateStep(1);
    const step2Valid = validateStep(2);
    const step3Valid = validateStep(3);

    if (!step1Valid || !step2Valid || !step3Valid) {
      setSubmitError("Mohon periksa kembali isian formulir yang belum lengkap.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await completeOnboardingAction(formData);

      if (!result.success) {
        setSubmitError(
          result.error || "Gagal menyelesaikan setup wizard. Silakan coba lagi."
        );
        if (result.fieldErrors) {
          const flatErrors: Record<string, string> = {};
          Object.entries(result.fieldErrors).forEach(([k, msgs]) => {
            if (msgs && msgs.length > 0) flatErrors[k] = msgs[0];
          });
          setFieldErrors(flatErrors);
        }
        setIsSubmitting(false);
        return;
      }

      // Hard redirect to ensure fresh cookies and cache reload
      const destination = result.data?.redirectUrl || `/${storeSlug}/dashboard`;
      window.location.href = destination;
    } catch (err: unknown) {
      console.error("Submission failed:", err);
      setSubmitError("Terjadi kendala jaringan saat menghubungi server.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 sm:py-10">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Setup Toko Baru Cukurin
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f5f4f0] tracking-tight">
          Selamat Datang di Cukurin
        </h1>
        <p className="text-sm text-[#a39e93] mt-2 max-w-md mx-auto">
          Lengkapi 3 langkah mudah ini untuk langsung mengaktifkan sistem kasir,
          meja antrean, dan portal pangkas rambut Anda.
        </p>
      </div>

      {/* Progress Step Bar Visual */}
      <div className="bg-[#221f1b] border border-[#38332c] rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between relative">
          {/* Connecting Track Line */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#38332c] -z-0" />
          <div
            className="absolute top-4 left-6 h-0.5 bg-amber-500 transition-all duration-300 -z-0"
            style={{
              width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
            }}
          />

          {STEPS.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const IconComponent = step.icon;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center relative z-10"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                    isCompleted
                      ? "bg-amber-600 text-white border border-amber-500"
                      : isCurrent
                      ? "bg-amber-500 text-white ring-4 ring-amber-500/20 border border-amber-400"
                      : "bg-[#181614] text-[#a39e93] border border-[#38332c]"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <IconComponent className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={`text-[11px] font-semibold mt-1.5 hidden sm:block ${
                    isCurrent
                      ? "text-amber-500"
                      : isCompleted
                      ? "text-[#f5f4f0]"
                      : "text-[#a39e93]"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Step Container Card */}
      <div className="bg-[#221f1b] border border-[#38332c] rounded-2xl p-5 sm:p-8 shadow-xl">
        {submitError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-200">Gagal Memproses Data</p>
              <p className="mt-0.5">{submitError}</p>
            </div>
          </div>
        )}

        {/* Step 1: Store & Brand Profile */}
        {currentStep === 1 && (
          <StepStoreProfile
            brandName={formData.brandName}
            phone={formData.phone}
            address={formData.address}
            logoUrl={formData.logoUrl || ""}
            primaryColor={formData.primaryColor}
            onChange={handleFieldChange}
            errors={fieldErrors}
          />
        )}

        {/* Step 2: First Barber Registration */}
        {currentStep === 2 && (
          <StepFirstBarber
            barberName={formData.barberName}
            barberPhone={formData.barberPhone}
            barberPassword={formData.barberPassword}
            serviceCommissionPct={formData.serviceCommissionPct}
            productCommissionFlat={formData.productCommissionFlat}
            onChange={handleFieldChange}
            errors={fieldErrors}
          />
        )}

        {/* Step 3: First Service Package */}
        {currentStep === 3 && (
          <StepFirstService
            serviceName={formData.serviceName}
            servicePrice={formData.servicePrice}
            durationMinutes={formData.durationMinutes}
            serviceDescription={formData.serviceDescription || ""}
            onChange={handleFieldChange}
            errors={fieldErrors}
          />
        )}

        {/* Step 4: Summary & Confirmation */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-[#38332c] pb-4">
              <h2 className="text-xl font-bold text-[#f5f4f0] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-500" />
                Ringkasan & Konfirmasi Setup
              </h2>
              <p className="text-sm text-[#a39e93] mt-1">
                Tinjau kembali rincian data sebelum menyimpan. Pengaturan ini dapat disesuaikan kembali nanti dari menu pengaturan.
              </p>
            </div>

            <div className="space-y-4">
              {/* Summary Card 1: Store Profile */}
              <div className="bg-[#181614] border border-[#38332c] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#38332c]/60 pb-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-[#f5f4f0]">
                    <Store className="w-4 h-4 text-amber-500" />
                    Profil Toko & Branding
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-amber-500 hover:underline font-medium"
                  >
                    Ubah
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-base shadow border border-[#38332c] overflow-hidden"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    {formData.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formData.logoUrl}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      formData.brandName.slice(0, 2).toUpperCase() || "CK"
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#f5f4f0] text-sm">
                      {formData.brandName}
                    </h4>
                    <p className="text-xs text-[#a39e93] flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3 h-3 text-amber-500" />
                      {formData.phone}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-[#a39e93] flex items-start gap-1.5 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="line-clamp-2">{formData.address}</p>
                </div>

                <div className="flex items-center gap-2 pt-1 text-xs text-[#a39e93]">
                  <span>Warna Tema:</span>
                  <div
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: formData.primaryColor }}
                  />
                  <span className="font-mono text-[11px] text-[#f5f4f0]">
                    {formData.primaryColor}
                  </span>
                </div>
              </div>

              {/* Summary Card 2: First Barber */}
              <div className="bg-[#181614] border border-[#38332c] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#38332c]/60 pb-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-[#f5f4f0]">
                    <UserCheck className="w-4 h-4 text-amber-500" />
                    Barber Pertama
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs text-amber-500 hover:underline font-medium"
                  >
                    Ubah
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#a39e93]">Nama Barber:</span>
                    <p className="font-bold text-[#f5f4f0] mt-0.5">
                      {formData.barberName}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#a39e93]">WhatsApp Login:</span>
                    <p className="font-bold text-[#f5f4f0] mt-0.5">
                      {formData.barberPhone}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#a39e93]">Komisi Jasa:</span>
                    <p className="font-bold text-emerald-400 mt-0.5">
                      {formData.serviceCommissionPct}%
                    </p>
                  </div>
                  <div>
                    <span className="text-[#a39e93]">Bonus Ritel:</span>
                    <p className="font-bold text-amber-500 mt-0.5">
                      {formatRupiah(formData.productCommissionFlat)} / item
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-[#a39e93] flex items-center gap-1.5 pt-1">
                  <Lock className="w-3 h-3 text-amber-500" />
                  <span>
                    Password Awal:{" "}
                    <code className="text-[#f5f4f0] font-mono">
                      {formData.barberPassword}
                    </code>
                  </span>
                </div>
              </div>

              {/* Summary Card 3: First Service */}
              <div className="bg-[#181614] border border-[#38332c] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#38332c]/60 pb-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-[#f5f4f0]">
                    <Scissors className="w-4 h-4 text-amber-500" />
                    Paket Layanan Pertama
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-xs text-amber-500 hover:underline font-medium"
                  >
                    Ubah
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#f5f4f0] text-sm">
                      {formData.serviceName}
                    </h4>
                    <p className="text-xs text-[#a39e93] flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-amber-500" />
                      Estimasi {formData.durationMinutes} Menit
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-amber-500">
                      {formatRupiah(formData.servicePrice)}
                    </span>
                  </div>
                </div>

                {formData.serviceDescription && (
                  <p className="text-xs text-[#a39e93] italic border-t border-[#38332c]/40 pt-2">
                    &ldquo;{formData.serviceDescription}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Wizard Navigation Action Bar */}
        <div className="mt-8 pt-5 border-t border-[#38332c] flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl border border-[#38332c] bg-[#181614] hover:bg-[#2c2823] text-sm font-medium text-[#f5f4f0] transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Kembali
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-md transition-all active:scale-[0.98]"
            >
              Lanjut ke Langkah Berikutnya
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyiapkan Barbershop Anda...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Selesaikan Setup & Masuk ke Dashboard
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
