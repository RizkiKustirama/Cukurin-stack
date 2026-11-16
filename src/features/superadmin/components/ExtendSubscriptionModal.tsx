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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--foreground)]">
                Perpanjang Langganan Manual
              </h3>
              <p className="text-xs text-[var(--foreground-muted)]">
                {tenant.brandName || tenant.name} (/{tenant.slug})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Status Sekarang */}
          <div className="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs flex items-center justify-between">
            <span className="text-[var(--foreground-muted)]">Status Saat Ini:</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--foreground)]">{tenant.subscriptionStatus}</span>
              <span className="text-[11px] text-[var(--foreground-muted)]">
                ({tenant.daysRemaining} hari sisa)
              </span>
            </div>
          </div>

          {/* Pilihan Paket */}
          <div>
            <label className="block text-xs font-semibold text-[var(--foreground)] mb-2">
              Pilih Paket Langganan
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["REGULER", "PRO", "ENTERPRISE"] as SubscriptionPlan[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPlan(p)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    plan === p
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm"
                      : "bg-[var(--background)] text-[var(--foreground-muted)] border-[var(--border)] hover:border-[var(--border-hover)]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Pilihan Durasi Tambahan */}
          <div>
            <label className="block text-xs font-semibold text-[var(--foreground)] mb-2">
              Durasi Perpanjangan Hari
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[30, 90, 180, 365].map((days) => (
                <button
                  type="button"
                  key={days}
                  onClick={() => setAdditionalDays(days)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    additionalDays === days
                      ? "bg-amber-500 text-black border-amber-500 shadow-sm"
                      : "bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:border-[var(--border-hover)]"
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
                className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--foreground)] focus:outline-none focus:border-amber-500 font-mono"
                placeholder="Atau ketik jumlah hari kustom"
              />
              <span className="absolute right-3 top-2.5 text-xs text-[var(--foreground-muted)] pointer-events-none">
                hari
              </span>
            </div>
          </div>

          {/* Simulasi Tanggal Berakhir Baru */}
          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs space-y-1">
            <div className="text-purple-300 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Simulasi Masa Aktif Baru:
            </div>
            <div className="text-[var(--foreground)] font-mono text-[11px]">
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
            <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
              Catatan Referensi Transfer / Pembayaran
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Transfer Mandiri An. Budi Santoso #TRX-9981 senilai Rp 150.000"
              className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--foreground)] focus:outline-none focus:border-amber-500 placeholder:text-[var(--foreground-muted)] resize-none"
            />
          </div>

          {/* Tombol Aksi */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-xl bg-[var(--surface-hover)] text-xs font-semibold text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-all shadow-md shadow-purple-950/50 cursor-pointer disabled:opacity-50 flex items-center gap-2"
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
