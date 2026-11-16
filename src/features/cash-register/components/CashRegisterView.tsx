"use client";

import React, { useState } from "react";
import { formatRupiah } from "@/shared/lib/formatters";
import {
  DailyRegisterSummary,
  StoreVaultInfo,
  CashMovementItem,
} from "../types";
import { OpenRegisterModal } from "./OpenRegisterModal";
import { PettyCashModal } from "./PettyCashModal";
import { CloseRegisterModal } from "./CloseRegisterModal";
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Receipt,
  UserCheck,
  Lock,
  Unlock,
  AlertCircle,
  Clock,
  History,
  QrCode,
  CreditCard,
  Building,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface CashRegisterViewProps {
  storeVault: StoreVaultInfo;
  activeSummary: DailyRegisterSummary | null;
  movements: CashMovementItem[];
  cashierId: string;
  onOpenPayoutModal?: () => void;
}

export const CashRegisterView: React.FC<CashRegisterViewProps> = ({
  storeVault,
  activeSummary,
  movements,
  cashierId,
  onOpenPayoutModal,
}) => {
  const router = useRouter();
  const [showOpenModal, setShowOpenModal] = useState<boolean>(false);
  const [showPettyModal, setShowPettyModal] = useState<boolean>(false);
  const [showCloseModal, setShowCloseModal] = useState<boolean>(false);

  const handleRefresh = () => {
    router.refresh();
  };

  const isRegisterOpen = activeSummary && !activeSummary.isClosed;

  return (
    <div className="space-y-5 p-3 sm:p-6 max-w-5xl mx-auto">
      {/* 1. Header & Saldo Brankas Toko */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card Saldo Brankas Toko (Deposit Source) */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-amber-900/50 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500/80 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" /> Saldo Brankas Toko
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-800/40 text-amber-300 font-semibold">
              Kas Induk
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400">
            {formatRupiah(storeVault.vaultBalance)}
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            Sumber deposit modal kas pagi & penerima setoran tutup kasir.
          </p>
        </div>

        {/* Card Status Laci Kasir */}
        <div
          className={`border rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden ${
            isRegisterOpen
              ? "bg-gradient-to-br from-zinc-900 to-zinc-950 border-emerald-800/40"
              : "bg-zinc-900/60 border-zinc-800"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5" /> Status Sesi Laci Kasir
            </span>
            {isRegisterOpen ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold flex items-center gap-1">
                <Unlock className="w-2.5 h-2.5" /> BUKA (OPEN)
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 font-bold flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> TUTUP (CLOSED)
              </span>
            )}
          </div>
          <p
            className={`text-2xl sm:text-3xl font-black ${
              isRegisterOpen ? "text-emerald-400" : "text-zinc-500"
            }`}
          >
            {isRegisterOpen
              ? formatRupiah(activeSummary.expectedDrawerCash)
              : "Rp 0"}
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            {isRegisterOpen
              ? `Modal Pagi: ${formatRupiah(activeSummary.openingCash)}`
              : "Kasir belum dibuka hari ini."}
          </p>
        </div>

        {/* Action Quick Launchers */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-center gap-2">
          {!isRegisterOpen ? (
            <button
              onClick={() => setShowOpenModal(true)}
              className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-950 transition flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" /> Buka Kasir Pagi (Deposit)
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowPettyModal(true)}
                  className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Receipt className="w-3.5 h-3.5 text-rose-400" /> Kas Kecil
                </button>
                <button
                  onClick={() => {
                    if (onOpenPayoutModal) onOpenPayoutModal();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" /> Tarik Komisi
                </button>
              </div>
              <button
                onClick={() => setShowCloseModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950 transition flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" /> Tutup Kasir Malam (Blind Count)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Breakdown Metrik Kas Hari Ini */}
      {isRegisterOpen && activeSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              + Penjualan Tunai Laci
            </span>
            <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" />{" "}
              {formatRupiah(activeSummary.totalCashSales)}
            </span>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              - Kas Kecil (Petty Cash)
            </span>
            <span className="text-sm font-bold text-rose-400 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />{" "}
              {formatRupiah(activeSummary.totalPettyExpenses)}
            </span>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              - Komisi Barber Tunai
            </span>
            <span className="text-sm font-bold text-amber-400 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />{" "}
              {formatRupiah(activeSummary.totalCommissionPaidFromDrawer)}
            </span>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Kas Non-Tunai (QRIS/EDC)
            </span>
            <span className="text-sm font-bold text-indigo-400 flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5" />{" "}
              {formatRupiah(
                activeSummary.totalQrisSales +
                  activeSummary.totalTransferSales +
                  activeSummary.totalEdcSales
              )}
            </span>
          </div>
        </div>
      )}

      {/* 3. Kronologi Mutasi Kas Laci (Audit Trail) */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-bold text-zinc-100">
              Kronologi Mutasi Kas Laci
            </h4>
          </div>
          <span className="text-xs text-zinc-400">
            {movements.length} transaksi tercatat
          </span>
        </div>

        {movements.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs">
            Belum ada mutasi kas untuk sesi kasir ini.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60 overflow-x-auto">
            {movements.map((item) => {
              const isIncome = item.direction === "IN";
              return (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isIncome
                          ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/40"
                          : "bg-rose-950/80 text-rose-400 border border-rose-800/40"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-200">
                        {item.description}
                      </p>
                      <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(item.timestamp).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`font-bold ${
                        isIncome ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatRupiah(item.amount)}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      Saldo: {formatRupiah(item.runningBalance)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <OpenRegisterModal
        isOpen={showOpenModal}
        onClose={() => setShowOpenModal(false)}
        storeId={storeVault.storeId}
        cashierId={cashierId}
        vaultBalance={storeVault.vaultBalance}
        onSuccess={handleRefresh}
      />

      {isRegisterOpen && activeSummary && (
        <>
          <PettyCashModal
            isOpen={showPettyModal}
            onClose={() => setShowPettyModal(false)}
            registerId={activeSummary.register.id}
            expectedDrawerCash={activeSummary.expectedDrawerCash}
            onSuccess={handleRefresh}
          />

          <CloseRegisterModal
            isOpen={showCloseModal}
            onClose={() => setShowCloseModal(false)}
            summary={activeSummary}
            onSuccess={handleRefresh}
          />
        </>
      )}
    </div>
  );
};
