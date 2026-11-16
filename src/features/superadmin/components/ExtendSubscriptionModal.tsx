"use client";

import { useState, useTransition } from "react";
import { SubscriptionPlan } from "@prisma/client";
import { X, Calendar, CreditCard, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import type { TenantManagementItem } from "../types";
import { extendSubscriptionAction } from "../actions/extendSubscriptionAction";

interface ExtendSubscriptionModalProps {
  tenant: TenantManagementItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ExtendSubscriptionModal({
  tenant,
  onClose,
  onSuccess,
}: ExtendSubscriptionModalProps) {
  const [plan, setPlan] = useState<SubscriptionPlan>(
    tenant?.subscriptionPlan || SubscriptionPlan.REGULER
  );
  const [additionalDays, setAdditionalDays] = useState<number>(30);
  const [notes, setNotes] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!tenant) return null;

  // Hitung simulasi tanggal berakhir baru
  const baseTime =
    tenant.subscriptionStatus === "ACTIVE" && tenant.subscriptionEndsAt
      ? new Date(tenant.subscriptionEndsAt).getTime()
      : Date.now();

  const previewEndDate = new Date(Math.max(Date.now(), baseTime) + additionalDays * 24 * 60 * 60 * 1000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await extendSubscriptionAction({
        tenantId: tenant.id,
        plan,
        additionalDays,
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || "Gagal memperpanjang langganan.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white border border-[#E8E5DE] rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-5 border-b border-[#E8E5DE] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] border border-[#E9D5FF] flex items-center justify-center text-[#9333EA]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1A1A1A]">
                Perpanjang Langganan Manual
              </h3>
              <p className="text-xs text-[#706E68]">
                {tenant.brandName || tenant.name} (/{tenant.slug})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#F6F5F2] text-[#706E68] hover:text-[#1A1A1A] hover:bg-[#EFECE6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-[#FDF0F2] border border-[#FCDAD7] text-[#D93025] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#D93025]" />
              <span>{error}</span>
            </div>
          )}

          {/* Status Sekarang */}
          <div className="p-3.5 rounded-xl bg-[#F6F5F2] border border-[#E8E5DE] text-xs flex items-center justify-between">
            <span className="text-[#706E68]">Status Saat Ini:</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#1A1A1A]">{tenant.subscriptionStatus}</span>
              <span className="text-[11px] text-[#706E68]">
                ({tenant.daysRemaining} hari sisa)
              </span>
            </div>
          </div>

          {/* Pilihan Paket */}
          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-2">
              Pilih Paket Langganan
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["REGULER", "PRO", "ENTERPRISE"] as SubscriptionPlan[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPlan(p)}
                  className={`py-2 px-3 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                    plan === p
                      ? "bg-[#111111] text-white border-[#111111] shadow-2xs"
                      : "bg-white text-[#706E68] border-[#E8E5DE] hover:border-[#D5D1C8]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Pilihan Durasi Tambahan */}
          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-2">
              Durasi Perpanjangan Hari
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[30, 90, 180, 365].map((days) => (
                <button
                  type="button"
                  key={days}
                  onClick={() => setAdditionalDays(days)}
                  className={`py-2 px-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                    additionalDays === days
                      ? "bg-[#111111] text-white border-[#111111] shadow-2xs"
                      : "bg-white text-[#1A1A1A] border-[#E8E5DE] hover:border-[#D5D1C8]"
                  }`}
                >
                  +{days} Hari
                </button>
              ))}
            </div>

            <div className="relative mt-2">
              <input
                type="number"
                min="1"
                max="3650"
                value={additionalDays}
                onChange={(e) => setAdditionalDays(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8E5DE] text-xs text-[#1A1A1A] focus:outline-none focus:border-[#111111] font-mono"
                placeholder="Atau ketik jumlah hari kustom"
              />
              <span className="absolute right-3 top-2.5 text-xs text-[#706E68] pointer-events-none">
                hari
              </span>
            </div>
          </div>

          {/* Simulasi Tanggal Berakhir Baru */}
          <div className="p-3.5 rounded-xl bg-[#F3E8FF]/30 border border-[#E9D5FF] text-xs space-y-1">
            <div className="text-[#9333EA] font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Simulasi Masa Aktif Baru:
            </div>
            <div className="text-[#1A1A1A] font-mono text-[11px]">
              Aktif hingga:{" "}
              <strong>
                {previewEndDate.toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </strong>
            </div>
          </div>

          {/* Catatan Pembayaran / Transfer */}
          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
              Catatan Referensi Transfer / Pembayaran
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Transfer Mandiri An. Budi Santoso #TRX-9981 senilai Rp 150.000"
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8E5DE] text-xs text-[#1A1A1A] focus:outline-none focus:border-[#111111] placeholder:text-[#A8A59E] resize-none"
            />
          </div>

          {/* Tombol Aksi */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#E8E5DE]">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-full border border-[#E8E5DE] text-xs font-semibold text-[#706E68] hover:text-[#1A1A1A] hover:bg-[#F6F5F2] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-full bg-[#111111] hover:bg-black text-xs font-bold text-white transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aktifkan Langganan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
