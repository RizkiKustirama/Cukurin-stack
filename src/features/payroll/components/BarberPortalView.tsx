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
      <div className="bg-white border border-[#E8E5DE] rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(28,25,23,0.02)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF5EB] text-[#D97706] border border-[#FDE6D2] flex items-center justify-center font-bold text-lg">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A1A1A]">{summary.barberName}</h2>
              <p className="text-xs text-[#706E68]">
                Bagi Hasil: <strong className="text-[#D97706]">{summary.commissionRatePercent}%</strong>
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              isReady
                ? "bg-[#E8F7EE] text-[#1E8E3E] border-[#CEEAD6]"
                : isBusy
                ? "bg-[#FDF0F2] text-[#D93025] border-[#FCDAD7]"
                : isBreak
                ? "bg-[#FEF3EB] text-[#D97706] border-[#FDE6D2]"
                : "bg-[#F6F5F2] text-[#706E68] border-[#E8E5DE]"
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
            className={`py-2.5 px-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              isReady
                ? "bg-[#111111] text-white shadow-sm cursor-default"
                : "bg-white hover:bg-[#F6F5F2] text-[#706E68] border border-[#E8E5DE]"
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#1E8E3E]" />
            {isReady ? "Sedang Siap (Ready)" : "Ubah ke Siap"}
          </button>

          <button
            type="button"
            disabled={isUpdatingStatus || isBreak}
            onClick={() => handleToggleStatus("BREAK")}
            className={`py-2.5 px-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              isBreak
                ? "bg-[#D97706] text-white shadow-sm cursor-default"
                : "bg-white hover:bg-[#F6F5F2] text-[#706E68] border border-[#E8E5DE]"
            }`}
          >
            <Coffee className="w-4 h-4 text-[#D97706]" />
            {isBreak ? "Sedang Istirahat" : "Minta Istirahat"}
          </button>
        </div>

        {feedbackMsg && (
          <p className="text-[11px] text-[#706E68] text-center mt-2 font-medium">
            {feedbackMsg}
          </p>
        )}
      </div>

      {/* 2. Hero Saldo Komisi Belum Cair */}
      <div className="bg-white border border-[#E8E5DE] rounded-2xl p-5 shadow-[0_1px_3px_rgba(28,25,23,0.02)] relative overflow-hidden">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#D97706] flex items-center gap-1.5 mb-1">
          <Wallet className="w-3.5 h-3.5" /> Saldo Komisi Siap Cair
        </span>
        <div className="flex items-baseline justify-between">
          <h1 className="text-3xl sm:text-4xl font-black font-mono text-[#1A1A1A]">
            {formatRupiah(summary.totalUnpaidCommission)}
          </h1>
        </div>
        <p className="text-xs text-[#706E68] mt-1">
          Dapat dicairkan tunai oleh kasir atau transfer bank toko kapan saja.
        </p>

        {/* Mini stats */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-[#E8E5DE]">
          <div className="bg-[#F6F5F2] rounded-2xl p-3 border border-[#E8E5DE]">
            <span className="text-[10px] text-[#706E68] uppercase font-bold block">
              Kepala Cukur Hari Ini
            </span>
            <span className="text-base font-black text-[#1A1A1A] flex items-center gap-1 mt-0.5">
              <Award className="w-4 h-4 text-[#D97706]" /> {summary.completedHeadCountToday} Pelanggan
            </span>
          </div>

          <div className="bg-[#F6F5F2] rounded-2xl p-3 border border-[#E8E5DE]">
            <span className="text-[10px] text-[#706E68] uppercase font-bold block">
              Sudah Dicairkan Hari Ini
            </span>
            <span className="text-base font-black text-[#1E8E3E] font-mono flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-[#1E8E3E]" /> {formatRupiah(summary.totalPaidCommissionToday)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Rincian Sumber Komisi */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white border border-[#E8E5DE] rounded-2xl p-3 text-center shadow-2xs">
          <div className="w-7 h-7 rounded-lg bg-[#FFF5EB] text-[#D97706] mx-auto flex items-center justify-center mb-1.5">
            <Scissors className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] uppercase font-bold text-[#706E68] block">Jasa Cukur</span>
          <span className="text-xs font-bold text-[#1A1A1A] font-mono mt-0.5 block">
            {formatRupiah(summary.totalServiceCommission)}
          </span>
        </div>

        <div className="bg-white border border-[#E8E5DE] rounded-2xl p-3 text-center shadow-2xs">
          <div className="w-7 h-7 rounded-lg bg-[#EEF6FE] text-[#1A73E8] mx-auto flex items-center justify-center mb-1.5">
            <ShoppingBag className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] uppercase font-bold text-[#706E68] block">Bonus Produk</span>
          <span className="text-xs font-bold text-[#1A1A1A] font-mono mt-0.5 block">
            {formatRupiah(summary.totalProductBonus)}
          </span>
        </div>

        <div className="bg-white border border-[#E8E5DE] rounded-2xl p-3 text-center shadow-2xs">
          <div className="w-7 h-7 rounded-lg bg-[#E8F7EE] text-[#1E8E3E] mx-auto flex items-center justify-center mb-1.5">
            <HeartHandshake className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] uppercase font-bold text-[#706E68] block">Tip Tamu</span>
          <span className="text-xs font-bold text-[#1A1A1A] font-mono mt-0.5 block">
            {formatRupiah(summary.totalTip)}
          </span>
        </div>
      </div>

      {/* 4. Riwayat Transaksi Komisi */}
      <div className="bg-white border border-[#E8E5DE] rounded-2xl p-4 shadow-[0_1px_3px_rgba(28,25,23,0.02)]">
        <div className="flex items-center justify-between mb-3 border-b border-[#E8E5DE] pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
            Riwayat Transaksi Komisi
          </h3>
          <span className="text-[11px] text-[#706E68]">
            {summary.items.length} catatan
          </span>
        </div>

        {summary.items.length === 0 ? (
          <div className="py-6 text-center text-[#706E68] text-xs">
            Belum ada catatan komisi untuk akun Anda.
          </div>
        ) : (
          <div className="divide-y divide-[#E8E5DE]">
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
                    <p className="font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                      <span>{sourceLabel}</span>
                      {item.ticketNumber && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#F6F5F2] border border-[#E8E5DE] text-[#706E68] font-mono">
                          #{item.ticketNumber}
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-[#706E68] mt-0.5">
                      {isPaid ? (
                        <span className="text-[#1E8E3E]">
                          ✓ Telah dicairkan ({item.paidVia === "CASH_DRAWER" ? "Tunai Laci" : "Transfer"})
                        </span>
                      ) : (
                        <span className="text-[#D97706]">
                          ○ Belum dicairkan (Tersedia)
                        </span>
                      )}
                    </p>
                  </div>

                  <span
                    className={`font-bold font-mono ${
                      isPaid ? "text-[#A8A59E] line-through" : "text-[#1A1A1A]"
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
