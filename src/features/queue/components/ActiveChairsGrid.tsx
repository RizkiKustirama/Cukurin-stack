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
  status: "READY" | "BUSY" | "BREAK" | "OFFLINE";
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

  // Normalize data from either chairs (custom format) or stations (domain model)
  const normalizedChairs: NormalizedChair[] = React.useMemo(() => {
    if (chairs && chairs.length > 0) {
      return chairs.map((c) => ({
        chairNumber: c.chairNumber,
        barberId: c.barberId,
        barberName: c.barberName,
        avatarUrl: c.avatarUrl,
        status: (c.workStatus || c.status || "READY") as NormalizedChair["status"],
        startedAt: c.startedAt || c.ticket?.startedAt,
        ticket: c.ticket,
      }));
    }

    if (stations && stations.length > 0) {
      return stations.map((s, idx) => ({
        chairNumber: s.chairNumber || idx + 1,
        barberId: s.barber?.id || (s as any).barberId,
        barberName: s.barber?.name || (s as any).barberName || `Barber #${idx + 1}`,
        avatarUrl: s.barber?.avatarUrl || (s as any).avatarUrl || null,
        status: s.workStatus as NormalizedChair["status"],
        startedAt: s.startedAt || s.currentTicket?.createdAt,
        ticket: s.currentTicket
          ? {
              id: s.currentTicket.id,
              ticketNumber: s.currentTicket.ticketNumber,
              customerName:
                s.currentTicket.customer?.name || "Pelanggan Walk-in",
              serviceName:
                s.currentTicket.items && s.currentTicket.items.length > 0
                  ? s.currentTicket.items.map((i) => i.itemName).join(", ")
                  : "Potong Rambut",
              subtotal: Number(s.currentTicket.subtotal) || 0,
              paymentStatus: s.currentTicket.paymentStatus,
              startedAt: s.currentTicket.createdAt,
            }
          : null,
      }));
    }

    return [];
  }, [chairs, stations]);

  const handleOpenCompletion = (chair: NormalizedChair) => {
    if (!chair.ticket) return;

    const rawTicket: QueueItemTicket = {
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
      <div className="bg-white border border-[#E8E5DE] rounded-2xl p-8 text-center space-y-2 shadow-sm">
        <Scissors className="w-8 h-8 text-[#D97706] mx-auto opacity-70" />
        <h4 className="text-sm font-bold text-[#1A1A1A]">
          Belum Ada Meja / Barber Terdaftar
        </h4>
        <p className="text-xs text-[#706E68]">
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
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs px-1">
        <div className="flex items-center gap-3">
          <span className="text-[#706E68]">
            Total Meja: <strong className="text-[#1A1A1A]">{normalizedChairs.length}</strong>
          </span>
          <span className="text-[#D93025]">
            Terisi: <strong>{busyChairsCount}</strong>
          </span>
          <span className="text-[#1E8E3E]">
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
      className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col justify-between shadow-sm bg-white ${
        isBusy
          ? "border-[#FDF0F2] ring-1 ring-[#D93025]/20"
          : isReady
          ? "border-[#E8E5DE] hover:border-[#D5D1C8]"
          : "border-[#E8E5DE] opacity-90"
      }`}
    >
      <div>
        {/* Header Meja & Status */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E8E5DE]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              #{chairNumber}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-[#1A1A1A] truncate">
                {barberName}
              </h4>
              <span className="text-[10px] text-[#706E68]">Meja #{chairNumber}</span>
            </div>
          </div>

          <div>
            {isBusy ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FDF0F2] text-[#D93025] border border-[#D93025]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D93025] animate-pulse" />
                Mencukur
              </span>
            ) : isReady ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F7EE] text-[#1E8E3E] border border-[#1E8E3E]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E8E3E]" />
                Siap
              </span>
            ) : isBreak ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF3EB] text-[#D97706] border border-[#D97706]/20">
                <Coffee className="w-3 h-3" />
                Istirahat
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F6F5F2] text-[#706E68] border border-[#E8E5DE]">
                Offline
              </span>
            )}
          </div>
        </div>

        {/* Content Tengah: Info Pelanggan di Kursi atau Status Siap */}
        <div className="py-3">
          {isBusy && ticket ? (
            <div className="p-3 rounded-xl bg-[#F6F5F2] border border-[#E8E5DE] space-y-1.5">
              <div className="flex items-center justify-between gap-1 text-[11px]">
                <span className="font-mono text-[#D97706] font-bold">
                  {ticket.ticketNumber}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-[#D93025] font-mono font-bold text-[10px] border border-[#E8E5DE]">
                  <Clock className="w-2.5 h-2.5" />
                  {timer}
                </span>
              </div>
              <div className="text-sm font-bold text-[#1A1A1A] truncate">
                {ticket.customerName}
              </div>
              <div className="text-xs text-[#706E68] truncate">
                {ticket.serviceName}
              </div>
            </div>
          ) : isReady ? (
            <div className="py-4 text-center space-y-1">
              <div className="w-8 h-8 rounded-full bg-[#E8F7EE] text-[#1E8E3E] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-[#1E8E3E]">
                Kursi Siap Dipakai
              </p>
              <p className="text-[11px] text-[#706E68]">
                Menunggu panggilan antrean pelanggan
              </p>
            </div>
          ) : isBreak ? (
            <div className="py-4 text-center space-y-1">
              <div className="w-8 h-8 rounded-full bg-[#FEF3EB] text-[#D97706] flex items-center justify-center mx-auto">
                <Coffee className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-[#D97706]">
                Barber Sedang Rehat
              </p>
              <p className="text-[11px] text-[#706E68]">
                Tidak menerima antrean baru
              </p>
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-[#A8A59E]">
              Kursi tidak aktif hari ini
            </div>
          )}
        </div>
      </div>

      {/* Footer Aksi */}
      <div className="pt-2 border-t border-[#E8E5DE] flex items-center justify-between gap-2">
        {isBusy && ticket ? (
          <div className="w-full flex items-center gap-2">
            {ticket.paymentStatus !== "PAID" && onCheckoutTicket && (
              <button
                type="button"
                onClick={() => onCheckoutTicket(ticket.id)}
                className="flex-1 py-2 px-3 rounded-full bg-[#FEF3EB] hover:bg-[#FEF3EB]/80 text-[#D97706] font-bold text-xs border border-[#D97706]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Bayar</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenCompletion}
              className="flex-1 py-2.5 px-4 rounded-full bg-[#111111] hover:bg-neutral-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Selesai Cukur</span>
            </button>
          </div>
        ) : isReady ? (
          <button
            type="button"
            onClick={onCallNext}
            className="w-full py-2.5 px-4 rounded-full bg-[#111111] hover:bg-neutral-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Panggil Antrean</span>
          </button>
        ) : (
          <div className="w-full text-center py-1 text-[11px] text-[#A8A59E]">
            Status: {status}
          </div>
        )}
      </div>
    </div>
  );
}
