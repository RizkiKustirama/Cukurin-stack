"use client";

import React, { useState } from "react";
import { formatRupiah } from "@/shared/lib/formatters";
import { payoutBarberCommissionAction } from "../actions/payrollActions";
import { StoreBarberPayoutCandidate } from "../types";
import { PayoutVia } from "@prisma/client";
import {
  UserCheck,
  AlertCircle,
  Banknote,
  Building,
  CheckCircle2,
  DollarSign,
} from "lucide-react";

interface BarberPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: StoreBarberPayoutCandidate[];
  activeRegisterId?: string;
  expectedDrawerCash: number;
  onSuccess?: () => void;
}

export const BarberPayoutModal: React.FC<BarberPayoutModalProps> = ({
  isOpen,
  onClose,
  candidates,
  activeRegisterId,
  expectedDrawerCash,
  onSuccess,
}) => {
  const [selectedBarberId, setSelectedBarberId] = useState<string>(
    candidates[0]?.barberId || ""
  );
  const [payoutVia, setPayoutVia] = useState<PayoutVia>("CASH_DRAWER");
  const [amount, setAmount] = useState<number>(0);
  const [customInput, setCustomInput] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCandidate =
    candidates.find((c) => c.barberId === selectedBarberId) || candidates[0];

  const handleSelectBarber = (id: string) => {
    setSelectedBarberId(id);
    const cand = candidates.find((c) => c.barberId === id);
    if (cand) {
      setAmount(cand.totalUnpaid);
      setCustomInput(cand.totalUnpaid.toString());
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    const parsed = parseInt(rawVal, 10) || 0;
    setAmount(parsed);
    setCustomInput(rawVal);
    setErrorMessage(null);
  };

  const handleFullPayout = () => {
    if (currentCandidate) {
      setAmount(currentCandidate.totalUnpaid);
      setCustomInput(currentCandidate.totalUnpaid.toString());
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCandidate) {
      setErrorMessage("Pilih barber terlebih dahulu.");
      return;
    }

    if (amount <= 0) {
      setErrorMessage("Nominal pencairan harus lebih dari 0.");
      return;
    }

    if (amount > currentCandidate.totalUnpaid) {
      setErrorMessage(
        `Nominal melebihi saldo komisi barber (${formatRupiah(
          currentCandidate.totalUnpaid
        )}).`
      );
      return;
    }

    if (payoutVia === "CASH_DRAWER") {
      if (!activeRegisterId) {
        setErrorMessage("Tidak ada sesi kasir yang aktif untuk pencairan tunai.");
        return;
      }
      if (amount > expectedDrawerCash) {
        setErrorMessage(
          `Uang kas tunai di laci kasir tidak mencukupi (${formatRupiah(
            expectedDrawerCash
          )}).`
        );
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await payoutBarberCommissionAction({
        barberId: currentCandidate.barberId,
        amount,
        paidVia: payoutVia,
        dailyRegisterId: activeRegisterId,
        notes: notes.trim() || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memproses pencairan komisi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white text-[#1A1A1A] border border-[#E8E5DE] rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between border-b border-[#E8E5DE] pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFF5EB] text-[#D97706] border border-[#FDE6D2] flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A]">Cairkan Komisi Barber</h3>
              <p className="text-xs text-[#706E68]">Pencairan komisi tunai laci atau transfer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#706E68] hover:text-[#1A1A1A] text-sm font-semibold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {candidates.length === 0 ? (
          <div className="py-8 text-center text-[#706E68] text-xs">
            Tidak ada komisi barber yang belum dicairkan saat ini.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pilih Barber */}
            <div>
              <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">
                Pilih Barber:
              </label>
              <select
                value={selectedBarberId}
                onChange={(e) => handleSelectBarber(e.target.value)}
                className="w-full bg-white border border-[#E8E5DE] rounded-xl px-3 py-2.5 text-xs text-[#1A1A1A] font-semibold focus:outline-none focus:border-[#111111] cursor-pointer"
              >
                {candidates.map((cand) => (
                  <option key={cand.barberId} value={cand.barberId}>
                    {cand.barberName} — Saldo: {formatRupiah(cand.totalUnpaid)} ({cand.completedHeadCountToday} kepala)
                  </option>
                ))}
              </select>
            </div>

            {/* Breakdown Komisi Barber Terpilih */}
            {currentCandidate && (
              <div className="bg-[#F6F5F2] border border-[#E8E5DE] rounded-xl p-3 text-xs space-y-1.5">
                <div className="flex justify-between text-[#706E68]">
                  <span>Komisi Jasa Cukur:</span>
                  <span className="font-semibold font-mono text-[#1A1A1A]">
                    {formatRupiah(currentCandidate.unpaidService)}
                  </span>
                </div>
                <div className="flex justify-between text-[#706E68]">
                  <span>Bonus Produk/Retail:</span>
                  <span className="font-semibold font-mono text-[#1A1A1A]">
                    {formatRupiah(currentCandidate.unpaidProduct)}
                  </span>
                </div>
                <div className="flex justify-between text-[#706E68]">
                  <span>Tip Pelanggan:</span>
                  <span className="font-semibold font-mono text-[#1A1A1A]">
                    {formatRupiah(currentCandidate.unpaidTip)}
                  </span>
                </div>
                <div className="border-t border-[#E8E5DE] pt-1.5 flex justify-between font-bold text-[#D97706] font-mono">
                  <span>Total Saldo Komisi:</span>
                  <span>{formatRupiah(currentCandidate.totalUnpaid)}</span>
                </div>
              </div>
            )}

            {/* Metode Pencairan */}
            <div>
              <label className="text-xs font-semibold text-[#1A1A1A] block mb-1.5">
                Metode Pembayaran:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPayoutVia("CASH_DRAWER")}
                  className={`py-2 px-3 rounded-full border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    payoutVia === "CASH_DRAWER"
                      ? "bg-[#111111] text-white border-[#111111] shadow-2xs"
                      : "bg-white text-[#706E68] border-[#E8E5DE] hover:bg-[#F6F5F2]"
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" /> Tunai dari Laci
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutVia("TRANSFER")}
                  className={`py-2 px-3 rounded-full border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    payoutVia === "TRANSFER"
                      ? "bg-[#111111] text-white border-[#111111] shadow-2xs"
                      : "bg-white text-[#706E68] border-[#E8E5DE] hover:bg-[#F6F5F2]"
                  }`}
                >
                  <Building className="w-3.5 h-3.5" /> Transfer Bank Toko
                </button>
              </div>
              {payoutVia === "CASH_DRAWER" && (
                <p className="text-[11px] text-[#706E68] mt-1 font-mono">
                  Saldo kas laci saat ini:{" "}
                  <strong className="text-[#1A1A1A]">
                    {formatRupiah(expectedDrawerCash)}
                  </strong>
                </p>
              )}
            </div>

            {/* Nominal Pencairan */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-[#1A1A1A]">
                  Nominal Dicairkan (Rp):
                </label>
                <button
                  type="button"
                  onClick={handleFullPayout}
                  className="text-[11px] text-[#D97706] hover:underline font-semibold cursor-pointer"
                >
                  Cairkan Semua
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#706E68] font-semibold text-sm">
                  Rp
                </span>
                <input
                  type="text"
                  value={customInput ? Number(customInput).toLocaleString("id-ID") : ""}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="w-full bg-white border border-[#E8E5DE] rounded-xl pl-10 pr-3 py-2.5 text-base font-bold text-[#1A1A1A] focus:outline-none focus:border-[#111111] font-mono"
                />
              </div>
            </div>

            {/* Catatan */}
            <div>
              <label className="text-xs font-semibold text-[#1A1A1A] block mb-1">
                Catatan / Bukti Payout:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Pencairan komisi harian shift 1"
                className="w-full bg-white border border-[#E8E5DE] rounded-xl px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#111111] placeholder-[#A8A59E]"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-[#FDF0F2] border border-[#FCDAD7] text-[#D93025] text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-full border border-[#E8E5DE] bg-white hover:bg-[#F6F5F2] text-[#706E68] text-xs font-semibold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || amount <= 0}
                className="flex-1 py-2.5 rounded-full bg-[#111111] hover:bg-black disabled:opacity-50 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? "Memproses..." : "Cairkan Komisi"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
