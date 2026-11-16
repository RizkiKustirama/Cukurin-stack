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
        <div className="bg-white border border-[#E8E5DE] rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-[0_1px_3px_rgba(28,25,23,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#706E68] flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#D97706]" /> Saldo Brankas Toko
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FEF3EB] border border-[#FDE6D2] text-[#D97706] font-semibold">
              Kas Induk
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-[#1A1A1A]">
            {formatRupiah(storeVault.vaultBalance)}
          </p>
          <p className="text-xs text-[#706E68] mt-1">
            Sumber deposit modal kas pagi & penerima setoran tutup kasir.
          </p>
        </div>

        {/* Card Status Laci Kasir */}
        <div
          className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(28,25,23,0.02)] relative overflow-hidden ${
            isRegisterOpen ? "border-[#CEEAD6]" : "border-[#E8E5DE]"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#706E68] flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-[#1A73E8]" /> Status Sesi Laci Kasir
            </span>
            {isRegisterOpen ? (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#E8F7EE] text-[#1E8E3E] border border-[#CEEAD6] font-bold flex items-center gap-1">
                <Unlock className="w-2.5 h-2.5" /> BUKA (OPEN)
              </span>
            ) : (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#F6F5F2] text-[#706E68] border border-[#E8E5DE] font-bold flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> TUTUP (CLOSED)
              </span>
            )}
          </div>
          <p
            className={`text-2xl sm:text-3xl font-black font-mono ${
              isRegisterOpen ? "text-[#1E8E3E]" : "text-[#706E68]"
            }`}
          >
            {isRegisterOpen
              ? formatRupiah(activeSummary.expectedDrawerCash)
              : "Rp 0"}
          </p>
          <p className="text-xs text-[#706E68] mt-1">
            {isRegisterOpen
              ? `Modal Pagi: ${formatRupiah(activeSummary.openingCash)}`
              : "Kasir belum dibuka hari ini."}
          </p>
        </div>

        {/* Action Quick Launchers */}
        <div className="bg-white border border-[#E8E5DE] rounded-2xl p-4 flex flex-col justify-center gap-2 shadow-[0_1px_3px_rgba(28,25,23,0.02)]">
          {!isRegisterOpen ? (
            <button
              onClick={() => setShowOpenModal(true)}
              className="w-full py-3 px-4 rounded-full bg-[#111111] hover:bg-black text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" /> Buka Kasir Pagi (Deposit)
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowPettyModal(true)}
                  className="py-2.5 px-3 rounded-full bg-[#FFF5EB] hover:bg-[#FDE6D2] border border-[#FDE6D2] text-[#D97706] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5 text-[#D97706]" /> Kas Kecil
                </button>
                <button
                  onClick={() => {
                    if (onOpenPayoutModal) onOpenPayoutModal();
                  }}
                  className="py-2.5 px-3 rounded-full bg-[#EEF6FE] hover:bg-[#D3E3FD] border border-[#D3E3FD] text-[#1A73E8] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#1A73E8]" /> Tarik Komisi
                </button>
              </div>
              <button
                onClick={() => setShowCloseModal(true)}
                className="w-full py-2.5 px-4 rounded-full bg-[#111111] hover:bg-black text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
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
          <div className="bg-white border border-[#E8E5DE] rounded-2xl p-3.5 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#706E68] block mb-1">
              + Penjualan Tunai Laci
            </span>
            <span className="text-sm font-bold font-mono text-[#1E8E3E] flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" />{" "}
              {formatRupiah(activeSummary.totalCashSales)}
            </span>
          </div>

          <div className="bg-white border border-[#E8E5DE] rounded-2xl p-3.5 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#706E68] block mb-1">
              - Kas Kecil (Petty Cash)
            </span>
            <span className="text-sm font-bold font-mono text-[#D93025] flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />{" "}
              {formatRupiah(activeSummary.totalPettyExpenses)}
            </span>
          </div>

          <div className="bg-white border border-[#E8E5DE] rounded-2xl p-3.5 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#706E68] block mb-1">
              - Komisi Barber Tunai
            </span>
            <span className="text-sm font-bold font-mono text-[#D97706] flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />{" "}
              {formatRupiah(activeSummary.totalCommissionPaidFromDrawer)}
            </span>
          </div>

          <div className="bg-white border border-[#E8E5DE] rounded-2xl p-3.5 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#706E68] block mb-1">
              Kas Non-Tunai (QRIS/EDC)
            </span>
            <span className="text-sm font-bold font-mono text-[#1A73E8] flex items-center gap-1">
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
      <div className="bg-white border border-[#E8E5DE] rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(28,25,23,0.02)]">
        <div className="flex items-center justify-between mb-4 border-b border-[#E8E5DE] pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#D97706]" />
            <h4 className="text-sm font-bold text-[#1A1A1A]">
              Kronologi Mutasi Kas Laci
            </h4>
          </div>
          <span className="text-xs text-[#706E68]">
            {movements.length} transaksi tercatat
          </span>
        </div>

        {movements.length === 0 ? (
          <div className="text-center py-8 text-[#706E68] text-xs">
            Belum ada mutasi kas untuk sesi kasir ini.
          </div>
        ) : (
          <div className="divide-y divide-[#E8E5DE] overflow-x-auto">
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
                          ? "bg-[#E8F7EE] text-[#1E8E3E] border border-[#CEEAD6]"
                          : "bg-[#FDF0F2] text-[#D93025] border border-[#FCDAD7]"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-[#1A1A1A]">
                        {item.description}
                      </p>
                      <p className="text-[10px] text-[#706E68] flex items-center gap-1 mt-0.5">
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
                      className={`font-bold font-mono ${
                        isIncome ? "text-[#1E8E3E]" : "text-[#D93025]"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatRupiah(item.amount)}
                    </p>
                    <p className="text-[10px] text-[#706E68] font-mono">
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
