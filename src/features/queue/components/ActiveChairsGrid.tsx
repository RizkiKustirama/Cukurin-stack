"use client";

import React, { useState, useEffect } from "react";
import {
  Scissors,
  Clock,
  User,
  Coffee,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  CreditCard,
} from "lucide-react";
import type { BarberStation, QueueItemTicket, BarberWorkStatus } from "../types";
import { BarberCompletionModal } from "./BarberCompletionModal";

export interface ChairData {
  chairNumber: number;
  barberId: string;
  barberName: string;
  avatarUrl?: string | null;
  status?: BarberWorkStatus | string;
  workStatus?: BarberWorkStatus | string;
  startedAt?: string | Date | null;
  ticket?: {
    id: string;
    ticketNumber: string;
    customerName: string;
    serviceName: string;
    subtotal: number;
    paymentStatus?: string;
    startedAt?: string | Date | null;
  } | null;
}

export interface ActiveChairsGridProps {
  stations?: BarberStation[];
  chairs?: ChairData[];
  onCompleteService?: (
    ticketId: string,
    barberId: string,
    nextStatus?: "READY" | "BREAK"
  ) => Promise<void> | void;
  onCallNext?: (barberId: string) => Promise<void> | void;
  onCheckoutTicket?: (ticketId: string) => void;
  onToggleBarberStatus?: (
    barberId: string,
    status: BarberWorkStatus
  ) => Promise<void> | void;
  className?: string;
}

/**
 * Hook to compute elapsed time in MM:SS format from a start date.
 */
function useElapsedTime(startTime: Date | string | null | undefined): string {
  const [elapsed, setElapsed] = useState("00:00");

  useEffect(() => {
    if (!startTime) {
      setElapsed("00:00");
      return;
    }

    const startMs = new Date(startTime).getTime();
    if (isNaN(startMs)) {
      setElapsed("00:00");
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - startMs) / 1000));
      const minutes = Math.floor(diffSec / 60);
      const seconds = diffSec % 60;
      setElapsed(
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return elapsed;
}

interface NormalizedChair {
  chairNumber: number;
  barberId: string;
  barberName: string;
  avatarUrl?: string | null;
  status: BarberWorkStatus | string;
  startedAt?: Date | string | null;
  ticket?: {
    id: string;
    ticketNumber: string;
    customerName: string;
    serviceName: string;
    subtotal?: number;
    paymentStatus?: string;
    isRequested?: boolean;
    rawTicket?: QueueItemTicket;
  } | null;
}

export function ActiveChairsGrid({
  stations,
  chairs,
  onCompleteService,
  onCallNext,
  onCheckoutTicket,
  onToggleBarberStatus,
  className = "",
}: ActiveChairsGridProps) {
  const [selectedTicket, setSelectedTicket] = useState<{
    ticket: QueueItemTicket;
    barberName: string;
    barberId: string;
  } | null>(null);

  // Normalize input from either stations or chairs props
  const normalizedChairs: NormalizedChair[] = React.useMemo(() => {
    if (stations && stations.length > 0) {
      return stations.map((s) => ({
        chairNumber: s.chairNumber,
        barberId: s.barber.id,
        barberName: s.barber.name,
        avatarUrl: s.barber.avatarUrl,
        status: s.workStatus,
        startedAt: s.startedAt,
        ticket: s.currentTicket
          ? {
              id: s.currentTicket.id,
              ticketNumber: s.currentTicket.ticketNumber,
              customerName: s.currentTicket.customer?.name || "Pelanggan Walk-in",
              serviceName:
                s.currentTicket.items && s.currentTicket.items.length > 0
                  ? s.currentTicket.items.map((i) => i.itemName).join(", ")
                  : "Potong Rambut Reguler",
              subtotal: Number(s.currentTicket.subtotal || 0),
              paymentStatus: s.currentTicket.paymentStatus,
              isRequested: s.currentTicket.requestedBarberId === s.barber.id,
              rawTicket: s.currentTicket,
            }
          : null,
      }));
    }

    if (chairs && chairs.length > 0) {
      return chairs.map((c) => ({
        chairNumber: c.chairNumber,
        barberId: c.barberId,
        barberName: c.barberName,
        avatarUrl: c.avatarUrl,
        status: String(c.status || c.workStatus || "READY"),
        startedAt: c.startedAt || c.ticket?.startedAt,
        ticket: c.ticket
          ? {
              id: c.ticket.id,
              ticketNumber: c.ticket.ticketNumber,
              customerName: c.ticket.customerName,
              serviceName: c.ticket.serviceName,
              subtotal: c.ticket.subtotal,
              paymentStatus: c.ticket.paymentStatus,
              rawTicket: {
                id: c.ticket.id,
                ticketNumber: c.ticket.ticketNumber,
                subtotal: c.ticket.subtotal || 0,
                paymentStatus: c.ticket.paymentStatus || "UNPAID",
                serviceStatus: "IN_SERVICE",
                customer: { name: c.ticket.customerName },
                items: [{ itemName: c.ticket.serviceName }],
              } as unknown as QueueItemTicket,
            }
          : null,
      }));
    }

    return [];
  }, [stations, chairs]);

  const handleOpenCompletion = (chair: NormalizedChair) => {
    if (!chair.ticket) return;

    const rawTicket: QueueItemTicket = chair.ticket.rawTicket || {
      id: chair.ticket.id,
      ticketNumber: chair.ticket.ticketNumber,
      serviceStatus: "IN_SERVICE",
      paymentStatus: (chair.ticket.paymentStatus as any) || "UNPAID",
      subtotal: chair.ticket.subtotal || 0,
      customer: { name: chair.ticket.customerName },
      items: [{ itemName: chair.ticket.serviceName }],
    } as unknown as QueueItemTicket;

    setSelectedTicket({
      ticket: rawTicket,
      barberName: chair.barberName,
      barberId: chair.barberId,
    });
  };

  const handleCloseCompletion = () => {
    setSelectedTicket(null);
  };

  const handleConfirmCompletion = async (
    ticketId: string,
    barberId: string,
    nextStatus: "READY" | "BREAK"
  ) => {
    if (onCompleteService) {
      await onCompleteService(ticketId, barberId, nextStatus);
    }
  };

  if (normalizedChairs.length === 0) {
    return (
      <div className="bg-[#221f1b] border border-[#38332c] rounded-2xl p-8 text-center space-y-2">
        <Scissors className="w-8 h-8 text-amber-500 mx-auto opacity-70" />
        <h4 className="text-sm font-semibold text-[#f5f4f0]">
          Belum Ada Meja / Barber Terdaftar
        </h4>
        <p className="text-xs text-[#a39e93]">
          Tambahkan staf barber pada menu pengaturan untuk mengaktifkan meja cukur.
        </p>
      </div>
    );
  }

  const busyChairsCount = normalizedChairs.filter((s) => s.status === "BUSY").length;
  const readyChairsCount = normalizedChairs.filter((s) => s.status === "READY").length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Ringkasan Status Meja */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-[#a39e93]">
            Total Meja: <strong>{normalizedChairs.length}</strong>
          </span>
          <span className="text-rose-400">
            Terisi: <strong>{busyChairsCount}</strong>
          </span>
          <span className="text-emerald-400">
            Tersedia: <strong>{readyChairsCount}</strong>
          </span>
        </div>
      </div>

      {/* Grid Meja Kursi Barber */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {normalizedChairs.map((chair) => (
          <ChairCardItem
            key={chair.barberId || `chair-${chair.chairNumber}`}
            chair={chair}
            onOpenCompletion={() => handleOpenCompletion(chair)}
            onCallNext={onCallNext ? () => onCallNext(chair.barberId) : undefined}
            onCheckoutTicket={onCheckoutTicket}
            onToggleStatus={onToggleBarberStatus}
          />
        ))}
      </div>

      {/* Modal Selesai Cukur */}
      {selectedTicket && (
        <BarberCompletionModal
          isOpen={!!selectedTicket}
          onClose={handleCloseCompletion}
          ticket={selectedTicket.ticket}
          barberName={selectedTicket.barberName}
          barberId={selectedTicket.barberId}
          onComplete={handleConfirmCompletion}
        />
      )}
    </div>
  );
}

function ChairCardItem({
  chair,
  onOpenCompletion,
  onCallNext,
  onCheckoutTicket,
  onToggleStatus,
}: {
  chair: NormalizedChair;
  onOpenCompletion: () => void;
  onCallNext?: () => void;
  onCheckoutTicket?: (ticketId: string) => void;
  onToggleStatus?: (barberId: string, status: BarberWorkStatus) => void;
}) {
  const { chairNumber, barberId, barberName, status, startedAt, ticket } = chair;
  const timer = useElapsedTime(startedAt);

  const isBusy = status === "BUSY";
  const isReady = status === "READY";
  const isBreak = status === "BREAK";

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col justify-between shadow-md ${
        isBusy
          ? "bg-[#221f1b] border-amber-500/40 ring-1 ring-amber-500/20"
          : isReady
          ? "bg-[#221f1b] border-emerald-500/30"
          : "bg-[#1d1b18] border-[#38332c] opacity-90"
      }`}
    >
      <div>
        {/* Header Meja & Status */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#38332c]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
              #{chairNumber}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-[#f5f4f0] truncate">
                Meja {chairNumber}
              </h4>
              <p className="text-xs text-[#a39e93] truncate flex items-center gap-1">
                <User className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{barberName}</span>
              </p>
            </div>
          </div>
          <div>
            {isBusy ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                Sedang Cukur
              </span>
            ) : isReady ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Ready (Siap)
              </span>
            ) : isBreak ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Coffee className="w-3.5 h-3.5" />
                Break
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-500/15 border border-stone-500/30 text-stone-400">
                Offline
              </span>
            )}
          </div>
        </div>

        {/* Konten Meja */}
        <div className="py-3.5 space-y-3">
          {isBusy && ticket ? (
            <div className="space-y-2.5 bg-[#181614] rounded-xl p-3 border border-[#38332c]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-amber-400">
                  {ticket.ticketNumber}
                </span>
                <span className="flex items-center gap-1 font-mono text-emerald-400 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  {timer}
                </span>
              </div>

              <div>
                <p className="text-sm font-bold text-[#f5f4f0] truncate">
                  {ticket.customerName}
                </p>
                <p className="text-xs text-[#a39e93] truncate">
                  {ticket.serviceName}
                </p>
              </div>

              {ticket.isRequested && (
                <div className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  ★ Pelanggan Request {barberName}
                </div>
              )}
            </div>
          ) : isReady ? (
            <div className="py-4 text-center space-y-1 bg-[#181614]/60 rounded-xl border border-dashed border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
              <p className="text-xs font-semibold text-emerald-300">
                Kursi Siap Digunakan
              </p>
              <p className="text-[11px] text-[#a39e93]">
                Menunggu antrean otomatis atau panggil manual
              </p>
            </div>
          ) : isBreak ? (
            <div className="py-4 text-center space-y-1 bg-[#181614]/60 rounded-xl border border-dashed border-amber-500/20">
              <Coffee className="w-6 h-6 text-amber-400 mx-auto" />
              <p className="text-xs font-semibold text-amber-300">
                Sedang Istirahat / Break
              </p>
              <p className="text-[11px] text-[#a39e93]">
                Kursi tidak menerima plotting otomatis
              </p>
            </div>
          ) : (
            <div className="py-4 text-center space-y-1 bg-[#181614]/60 rounded-xl border border-dashed border-stone-600/30">
              <AlertCircle className="w-6 h-6 text-stone-500 mx-auto" />
              <p className="text-xs font-semibold text-stone-400">
                Barber Sedang Offline
              </p>
              <p className="text-[11px] text-[#a39e93]">
                Tidak bertugas saat ini
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tombol Aksi Bawah */}
      <div className="pt-2 space-y-2">
        {isBusy && ticket ? (
          <>
            <button
              type="button"
              onClick={onOpenCompletion}
              className="w-full min-h-[48px] px-3.5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-stone-950 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Scissors className="w-4 h-4 rotate-[-45deg]" />
              <span>Selesai Cukur</span>
            </button>

            {onCheckoutTicket && (
              <button
                type="button"
                onClick={() => onCheckoutTicket(ticket.id)}
                className="w-full py-2 px-3 bg-[#181614] hover:bg-[#2c2823] border border-[#38332c] text-[#f5f4f0] rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <span>Bayar Sekarang (POS)</span>
              </button>
            )}
          </>
        ) : isReady ? (
          <div className="flex items-center gap-2">
            {onCallNext && (
              <button
                type="button"
                onClick={onCallNext}
                className="flex-1 min-h-[44px] px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Panggil Antrean</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onToggleStatus?.(barberId, "BREAK")}
              className="min-h-[44px] px-3 py-2 bg-[#181614] hover:bg-[#2c2823] border border-[#38332c] text-amber-400 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Break</span>
            </button>
          </div>
        ) : isBreak ? (
          <button
            type="button"
            onClick={() => onToggleStatus?.(barberId, "READY")}
            className="w-full min-h-[44px] px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Kembali Ready (Aktifkan Meja)</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onToggleStatus?.(barberId, "READY")}
            className="w-full min-h-[44px] px-3 py-2 bg-[#181614] hover:bg-[#2c2823] border border-[#38332c] text-[#f5f4f0] rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Aktifkan Barber</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default ActiveChairsGrid;
