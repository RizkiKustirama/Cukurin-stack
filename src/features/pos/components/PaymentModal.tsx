"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  X,
  CreditCard,
  Banknote,
  QrCode,
  Send,
  Loader2,
  Check,
  AlertCircle,
  Receipt,
  User,
  Scissors,
} from "lucide-react";
import { formatRupiah } from "@/shared/lib/formatters";
import type { TicketWithRelations, TicketToPay } from "../types";
import { settleTicketAction, getTicketDetailsAction } from "../actions/ticketActions";
import type { PaymentMethod } from "@prisma/client";

export type { TicketToPay };

export interface PaymentModalProps {
  isOpen: boolean;
  ticket: TicketToPay | TicketWithRelations | any | null;
  ticketId?: string;
  onClose: () => void;
  onConfirmPayment?: (params: {
    ticketId: string;
    method: "CASH" | "QRIS" | "TRANSFER" | "EDC";
    receivedAmount: number;
    tipAmount: number;
  }) => Promise<void> | void;
  onSuccess?: () => void;
}

export function PaymentModal({
  isOpen,
  ticket: rawTicket,
  ticketId,
  onClose,
  onConfirmPayment,
  onSuccess,
}: PaymentModalProps) {
  const [isPending, startTransition] = useTransition();
  const [ticketDetails, setTicketDetails] = useState<TicketWithRelations | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Normalize rawTicket or fetch by ticketId
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setErrorMessage(null);
      setCashTendered(0);

      if (rawTicket) {
        setTipAmount(Number(rawTicket.tipAmount) || 0);
      } else if (ticketId) {
        setIsLoadingDetails(true);
        getTicketDetailsAction(ticketId)
          .then((res) => {
            if (res.success) {
              setTicketDetails(res.data);
              setTipAmount(Number(res.data?.tipAmount) || 0);
            } else if (!res.success) {
              setErrorMessage(res.error);
            }
          })
          .finally(() => {
            setIsLoadingDetails(false);
          });
      }
    }
  }, [isOpen, rawTicket, ticketId]);

  if (!isOpen) return null;

  // Resolved ticket object
  const activeTicket = rawTicket || ticketDetails;
  if (!activeTicket && !isLoadingDetails) return null;

  const ticketNumber = activeTicket?.ticketNumber || "";
  const customerName =
    activeTicket?.customer?.name ||
    activeTicket?.customerName ||
    "Pelanggan Guest";
  const customerPhone = activeTicket?.customer?.phone || activeTicket?.customerPhone;
  const barberName =
    activeTicket?.assignedBarber?.user?.name ||
    activeTicket?.requestedBarber?.user?.name ||
    activeTicket?.barberName ||
    "Siapa Saja";

  const subtotal = activeTicket ? Number(activeTicket.subtotal) : 0;
  const totalAmount = subtotal + tipAmount;
  const cashChange = cashTendered > 0 ? cashTendered - totalAmount : 0;

  const items: Array<{ name: string; quantity: number; price: number }> =
    activeTicket?.items?.map((it: any) => ({
      name: it.itemName || it.name,
      quantity: it.quantity,
      price: Number(it.price),
    })) || [];

  const handleSettle = () => {
    if (!activeTicket) return;
    setErrorMessage(null);

    if (paymentMethod === "CASH" && cashTendered > 0 && cashTendered < totalAmount) {
      setErrorMessage("Uang tunai yang diterima kurang dari total tagihan.");
      return;
    }

    startTransition(async () => {
      if (onConfirmPayment) {
        await onConfirmPayment({
          ticketId: activeTicket.id,
          method: paymentMethod as any,
          receivedAmount:
            paymentMethod === "CASH" && cashTendered > 0 ? cashTendered : totalAmount,
          tipAmount,
        });
        setIsSuccess(true);
        if (onSuccess) onSuccess();
      } else {
        const result = await settleTicketAction(
          activeTicket.id,
          paymentMethod,
          totalAmount,
          tipAmount
        );

        if (result.success) {
          setIsSuccess(true);
          if (onSuccess) onSuccess();
        } else {
          setErrorMessage(result.error);
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-white border border-[#E8E5DE] rounded-[24px] shadow-2xl flex flex-col z-10 overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E5DE] flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF5EB] border border-[#FDE6D2] flex items-center justify-center text-[#D97706]">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A] flex items-center gap-2">
                <span>Pelunasan Kasir</span>
                {ticketNumber && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#F6F5F2] border border-[#E8E5DE] text-[#1A1A1A]">
                    {ticketNumber}
                  </span>
                )}
              </h3>
              <p className="text-xs text-[#706E68]">
                Selesaikan pembayaran tiket dan cetak bukti transaksi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F6F5F2] hover:bg-[#EFECE6] text-[#706E68] hover:text-[#1A1A1A] flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {isLoadingDetails ? (
            <div className="py-16 flex flex-col items-center justify-center text-[#706E68] space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#D97706]" />
              <p className="text-sm">Memuat data tiket transaksi...</p>
            </div>
          ) : isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#E8F7EE] border border-[#CEEAD6] flex items-center justify-center text-[#1E8E3E] animate-in zoom-in-75">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-[#1A1A1A]">
                  Pembayaran Berhasil Dilunasi!
                </h4>
                <p className="text-xs text-[#706E68] max-w-xs mx-auto">
                  Tiket {ticketNumber} telah berstatus Lunas (PAID). Laci kasir telah
                  diperbarui.
                </p>
              </div>

              <div className="pt-4 flex gap-3 w-full">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-full bg-[#111111] hover:bg-black text-white font-bold text-sm transition shadow-sm cursor-pointer"
                >
                  Selesai & Tutup
                </button>
              </div>
            </div>
          ) : activeTicket ? (
            <>
              {errorMessage && (
                <div className="flex items-center gap-2.5 p-3 bg-[#FDF0F2] border border-[#FCDAD7] text-[#D93025] text-xs rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#D93025]" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Rincian Pelanggan & Barber */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#F6F5F2] border border-[#E8E5DE] rounded-2xl text-xs">
                <div>
                  <span className="text-[#706E68] block mb-0.5">Pelanggan:</span>
                  <div className="font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>{customerName}</span>
                  </div>
                  {customerPhone && (
                    <span className="text-[11px] text-[#706E68]">{customerPhone}</span>
                  )}
                </div>

                <div>
                  <span className="text-[#706E68] block mb-0.5">Barber:</span>
                  <div className="font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>{barberName}</span>
                  </div>
                </div>
              </div>

              {/* Daftar Item Tiket */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#706E68] uppercase tracking-wider block">
                  Rincian Pesanan
                </span>
                <div className="divide-y divide-[#E8E5DE] bg-white border border-[#E8E5DE] rounded-2xl px-3.5 py-1 shadow-2xs">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-2.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-[#1A1A1A]">
                          {item.name}
                        </span>
                        <span className="text-[#706E68] ml-1.5">
                          x{item.quantity}
                        </span>
                      </div>
                      <span className="font-bold text-[#1A1A1A] font-mono">
                        {formatRupiah(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}

                  <div className="py-2.5 flex items-center justify-between text-xs font-semibold text-[#1A1A1A]">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold">{formatRupiah(subtotal)}</span>
                  </div>
                </div>
              </div>

              {/* Input Tip Barber */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#706E68] uppercase tracking-wider block">
                  Tip Barber (100% Hak Barber)
                </span>
                <div className="flex items-center gap-2">
                  {[0, 5000, 10000, 20000, 50000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTipAmount(amt)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                        tipAmount === amt
                          ? "bg-[#111111] text-white border-[#111111] shadow-2xs"
                          : "bg-white border-[#E8E5DE] text-[#706E68] hover:text-[#1A1A1A] hover:bg-[#F6F5F2]"
                      }`}
                    >
                      {amt === 0 ? "Rp 0" : `+${amt / 1000}k`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pilihan Metode Pembayaran */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#706E68] uppercase tracking-wider block">
                  Pilih Metode Pembayaran
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "CASH", label: "Tunai", icon: Banknote },
                    { id: "QRIS", label: "QRIS", icon: QrCode },
                    { id: "TRANSFER", label: "Transfer", icon: Send },
                    { id: "EDC", label: "Kartu EDC", icon: CreditCard },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition cursor-pointer ${
                          isSelected
                            ? "bg-[#FFF5EB] border-[#D97706] text-[#D97706] font-bold ring-1 ring-[#D97706]/30 shadow-2xs"
                            : "bg-white border-[#E8E5DE] text-[#706E68] hover:border-[#D5D1C8] hover:text-[#1A1A1A]"
                        }`}
                      >
                        <Icon className="w-5 h-5 mb-1" />
                        <span className="text-xs">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Kalkulator Tunai */}
              {paymentMethod === "CASH" && (
                <div className="p-4 bg-[#F6F5F2] border border-[#E8E5DE] rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-xs text-[#706E68]">
                    <span>Uang Diterima dari Pelanggan:</span>
                    <button
                      type="button"
                      onClick={() => setCashTendered(totalAmount)}
                      className="text-[#D97706] hover:underline font-semibold cursor-pointer"
                    >
                      [ Uang Pas ]
                    </button>
                  </div>

                  <input
                    type="number"
                    value={cashTendered || ""}
                    onChange={(e) => setCashTendered(Number(e.target.value) || 0)}
                    placeholder={totalAmount.toString()}
                    className="w-full px-4 py-2.5 bg-white border border-[#E8E5DE] focus:border-[#111111] rounded-xl text-[#1A1A1A] text-base font-bold focus:outline-none"
                  />

                  <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                    {[50000, 100000, 150000, 200000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCashTendered(amt)}
                        className="px-2.5 py-1 rounded-full bg-white border border-[#E8E5DE] text-[#1A1A1A] text-xs hover:bg-stone-50 font-semibold transition cursor-pointer"
                      >
                        {formatRupiah(amt)}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-[#E8E5DE] text-sm">
                    <span className="text-[#706E68]">Kembalian:</span>
                    <span
                      className={`font-bold font-mono text-base ${
                        cashChange >= 0 ? "text-[#1E8E3E]" : "text-[#D93025]"
                      }`}
                    >
                      {cashChange >= 0
                        ? formatRupiah(cashChange)
                        : `Kurang ${formatRupiah(Math.abs(cashChange))}`}
                    </span>
                  </div>
                </div>
              )}

              {/* Total Card */}
              <div className="p-4 bg-[#FFF5EB] border border-[#FDE6D2] rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#D97706] font-semibold block">Total Tagihan</span>
                  <span className="text-xs text-[#706E68]">
                    Subtotal + Tip {tipAmount > 0 && `(${formatRupiah(tipAmount)})`}
                  </span>
                </div>
                <span className="text-2xl font-black font-mono text-[#1A1A1A]">
                  {formatRupiah(totalAmount)}
                </span>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        {!isSuccess && activeTicket && (
          <div className="px-6 py-4 border-t border-[#E8E5DE] bg-white flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 py-3 px-4 rounded-full border border-[#E8E5DE] hover:bg-[#F6F5F2] text-[#706E68] font-semibold text-sm transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSettle}
              disabled={isPending}
              className="flex-2 py-3 px-6 rounded-full bg-[#111111] hover:bg-black active:scale-95 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Konfirmasi Pembayaran ({formatRupiah(totalAmount)})</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
