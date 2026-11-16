"use client";

import React, { useState } from "react";
import { formatRupiah } from "@/shared/lib/formatters";
import { BarberDailySummary } from "../types";
import { setBarberStatusAction } from "@/features/queue/actions/queueActions";
import { BarberWorkStatus } from "@prisma/client";
import {
  Scissors,
  CheckCircle2,
  Clock,
  Coffee,
  Sparkles,
  TrendingUp,
  Award,
  Wallet,
  ShoppingBag,
  HeartHandshake,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface BarberPortalViewProps {
  summary: BarberDailySummary;
  storeSlug: string;
}

export const BarberPortalView: React.FC<BarberPortalViewProps> = ({
  summary,
  storeSlug,
}) => {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState<string>(summary.workStatus);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleToggleStatus = async (newStatus: BarberWorkStatus) => {
    setIsUpdatingStatus(true);
    setFeedbackMsg(null);

    try {
      const res = await setBarberStatusAction(summary.barberId, newStatus);
      if (res.success) {
        setCurrentStatus(newStatus);
        setFeedbackMsg(`Status diubah menjadi: ${newStatus}`);
        router.refresh();
      } else {
        setFeedbackMsg(res.error || "Gagal mengubah status kerja.");
      }
    } catch (err: any) {
      setFeedbackMsg(err.message || "Gagal menghubungi server.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const isReady = currentStatus === "READY";
  const isBusy = currentStatus === "BUSY";
  const isBreak = currentStatus === "BREAK";

  return (
    <div className="space-y-4 max-w-xl mx-auto p-3 sm:p-5 pb-24">
      {/* 1. Header Profil & Status Switcher */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center font-bold text-lg">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">{summary.barberName}</h2>
              <p className="text-xs text-zinc-400">
                Bagi Hasil: <strong className="text-amber-400">{summary.commissionRatePercent}%</strong>
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              isReady
                ? "bg-emerald-950/80 text-emerald-400 border-emerald-800"
                : isBusy
                ? "bg-amber-950/80 text-amber-400 border-amber-800"
                : isBreak
                ? "bg-orange-950/80 text-orange-400 border-orange-800"
                : "bg-zinc-800 text-zinc-400 border-zinc-700"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {currentStatus}
          </div>
        </div>

        {/* Action Toggle Work Status */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isUpdatingStatus || isReady}
            onClick={() => handleToggleStatus("READY")}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              isReady
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950 cursor-default"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            {isReady ? "Sedang Siap (Ready)" : "Ubah ke Siap"}
          </button>

          <button
            type="button"
            disabled={isUpdatingStatus || isBreak}
            onClick={() => handleToggleStatus("BREAK")}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              isBreak
                ? "bg-orange-600 text-white shadow-md shadow-orange-950 cursor-default"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
            }`}
          >
            <Coffee className="w-4 h-4 text-orange-400" />
            {isBreak ? "Sedang Istirahat" : "Minta Istirahat"}
          </button>
        </div>

        {feedbackMsg && (
          <p className="text-[11px] text-zinc-400 text-center mt-2 font-medium">
            {feedbackMsg}
          </p>
        )}
      </div>

      {/* 2. Hero Saldo Komisi Belum Cair */}
      <div className="bg-gradient-to-br from-amber-950/40 via-zinc-900 to-zinc-950 border border-amber-800/50 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5 mb-1">
          <Wallet className="w-3.5 h-3.5" /> Saldo Komisi Siap Cair
        </span>
        <div className="flex items-baseline justify-between">
          <h1 className="text-3xl sm:text-4xl font-black text-amber-400">
            {formatRupiah(summary.totalUnpaidCommission)}
          </h1>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Dapat dicairkan tunai oleh kasir atau transfer bank toko kapan saja.
        </p>

        {/* Mini stats */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-zinc-800/80">
          <div className="bg-zinc-900/80 rounded-xl p-2.5 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase font-bold block">
              Kepala Cukur Hari Ini
            </span>
            <span className="text-base font-black text-zinc-100 flex items-center gap-1 mt-0.5">
              <Award className="w-4 h-4 text-amber-500" /> {summary.completedHeadCountToday} Pelanggan
            </span>
          </div>

          <div className="bg-zinc-900/80 rounded-xl p-2.5 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase font-bold block">
              Sudah Dicairkan Hari Ini
            </span>
            <span className="text-base font-black text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {formatRupiah(summary.totalPaidCommissionToday)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Rincian Sumber Komisi */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center mb-1.5">
            <Scissors className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Jasa Cukur</span>
          <span className="text-xs font-bold text-zinc-200 mt-0.5 block">
            {formatRupiah(summary.totalServiceCommission)}
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center mb-1.5">
            <ShoppingBag className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Bonus Produk</span>
          <span className="text-xs font-bold text-zinc-200 mt-0.5 block">
            {formatRupiah(summary.totalProductBonus)}
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center mb-1.5">
            <HeartHandshake className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Tip Tamu</span>
          <span className="text-xs font-bold text-zinc-200 mt-0.5 block">
            {formatRupiah(summary.totalTip)}
          </span>
        </div>
      </div>

      {/* 4. Riwayat Transaksi Komisi */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Riwayat Transaksi Komisi
          </h3>
          <span className="text-[11px] text-zinc-500">
            {summary.items.length} catatan
          </span>
        </div>

        {summary.items.length === 0 ? (
          <div className="py-6 text-center text-zinc-500 text-xs">
            Belum ada catatan komisi untuk akun Anda.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {summary.items.map((item) => {
              const isPaid = item.isPaidOut;
              const sourceLabel =
                item.sourceType === "SERVICE_FEE"
                  ? "Jasa Potong"
                  : item.sourceType === "PRODUCT_BONUS"
                  ? "Bonus Produk"
                  : "Tip Pelanggan";

              return (
                <div
                  key={item.id}
                  className="py-2.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-zinc-200 flex items-center gap-1.5">
                      <span>{sourceLabel}</span>
                      {item.ticketNumber && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                          #{item.ticketNumber}
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {isPaid ? (
                        <span className="text-emerald-400">
                          ✓ Telah dicairkan ({item.paidVia === "CASH_DRAWER" ? "Tunai Laci" : "Transfer"})
                        </span>
                      ) : (
                        <span className="text-amber-400">
                          ○ Belum dicairkan (Tersedia)
                        </span>
                      )}
                    </p>
                  </div>

                  <span
                    className={`font-bold ${
                      isPaid ? "text-zinc-400 line-through" : "text-amber-400"
                    }`}
                  >
                    +{formatRupiah(item.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
