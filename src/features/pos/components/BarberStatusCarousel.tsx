"use client";

import React, { useState } from "react";
import { BarberWorkStatus } from "@prisma/client";
import {
  Scissors,
  Coffee,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  ChevronRight,
  Sparkles,
  AlertCircle,
  X,
} from "lucide-react";

export interface BarberStatusItem {
  id: string; // barberProfile.id
  userId: string;
  name: string;
  workStatus: BarberWorkStatus;
  phone?: string;
  currentTicket?: {
    id: string;
    ticketNumber: string;
    customerName: string;
    serviceName?: string;
    startedAt?: Date | string;
  } | null;
  todayCustomersCount?: number;
}

export interface BarberStatusCarouselProps {
  barbers: BarberStatusItem[];
  onStatusChange?: (barberId: string, newStatus: BarberWorkStatus) => Promise<void> | void;
  isLoading?: boolean;
}

export function BarberStatusCarousel({
  barbers,
  onStatusChange,
  isLoading = false,
}: BarberStatusCarouselProps) {
  const [selectedBarber, setSelectedBarber] = useState<BarberStatusItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusBadge = (status: BarberWorkStatus) => {
    switch (status) {
      case BarberWorkStatus.READY:
        return {
          label: "READY",
          bg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
          dot: "bg-emerald-500",
          icon: CheckCircle2,
        };
      case BarberWorkStatus.BUSY:
        return {
          label: "BUSY",
          bg: "bg-rose-500/15 border-rose-500/30 text-rose-400",
          dot: "bg-rose-500",
          icon: Scissors,
        };
      case BarberWorkStatus.BREAK:
        return {
          label: "BREAK",
          bg: "bg-amber-500/15 border-amber-500/30 text-amber-400",
          dot: "bg-amber-500",
          icon: Coffee,
        };
      case BarberWorkStatus.OFFLINE:
      default:
        return {
          label: "OFFLINE",
          bg: "bg-zinc-500/15 border-zinc-500/30 text-zinc-400",
          dot: "bg-zinc-500",
          icon: XCircle,
        };
    }
  };

  const handleCardClick = (barber: BarberStatusItem) => {
    setSelectedBarber(barber);
  };

  const handleSelectNewStatus = async (newStatus: BarberWorkStatus) => {
    if (!selectedBarber || !onStatusChange) {
      setSelectedBarber(null);
      return;
    }
    try {
      setIsUpdating(true);
      await onStatusChange(selectedBarber.id, newStatus);
      setSelectedBarber((prev) => (prev ? { ...prev, workStatus: newStatus } : null));
    } finally {
      setIsUpdating(false);
      setSelectedBarber(null);
    }
  };

  const readyCount = barbers.filter((b) => b.workStatus === BarberWorkStatus.READY).length;
  const busyCount = barbers.filter((b) => b.workStatus === BarberWorkStatus.BUSY).length;
  const breakCount = barbers.filter((b) => b.workStatus === BarberWorkStatus.BREAK).length;

  return (
    <div className="space-y-2">
      {/* Mini Summary Bar */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-2 text-[var(--foreground-muted)] font-medium">
          <User className="w-3.5 h-3.5 text-[var(--primary)]" />
          <span>Status Barber Aktif</span>
          <span className="text-[11px] text-[var(--foreground-muted)]">
            ({barbers.length} Terdaftar)
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold">
          <span className="text-emerald-400">🟢 {readyCount} Siap</span>
          <span className="text-rose-400">🔴 {busyCount} Cukur</span>
          <span className="text-amber-400">🟡 {breakCount} Rehat</span>
        </div>
      </div>

      {/* Swipeable Carousel Horizontal Bar */}
      <div className="relative">
        <div className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
          {barbers.length === 0 ? (
            <div className="w-full py-6 text-center text-xs text-[var(--foreground-muted)] bg-[var(--surface)] border border-[var(--border)] rounded-xl">
              Belum ada data barber di cabang ini.
            </div>
          ) : (
            barbers.map((barber) => {
              const statusInfo = getStatusBadge(barber.workStatus);
              const isBusy = barber.workStatus === BarberWorkStatus.BUSY;
              const isReady = barber.workStatus === BarberWorkStatus.READY;

              return (
                <div
                  key={barber.id}
                  onClick={() => handleCardClick(barber)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleCardClick(barber);
                    }
                  }}
                  className={`flex-shrink-0 w-44 sm:w-52 p-3 rounded-2xl bg-[var(--surface)] border transition-all duration-200 cursor-pointer select-none text-left relative overflow-hidden group hover:bg-[var(--surface-hover)] active:scale-[0.98] ${
                    isBusy
                      ? "border-rose-500/30 shadow-md shadow-rose-950/20"
                      : isReady
                      ? "border-emerald-500/30 shadow-md shadow-emerald-950/20"
                      : "border-[var(--border)]"
                  }`}
                >
                  {/* Top: Avatar & Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 rounded-xl bg-stone-800 border border-[var(--border)] flex items-center justify-center font-bold text-xs text-white">
                        {barber.name
                          .split(" ")
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${statusInfo.dot} ring-2 ring-[var(--surface)]`}
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[var(--foreground)] truncate">
                          {barber.name}
                        </h4>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Middle: Work info or Customer In-chair */}
                  <div className="mt-2.5 pt-2 border-t border-[var(--border)]/60 min-h-[38px] flex flex-col justify-center">
                    {isBusy && barber.currentTicket ? (
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-300 truncate">
                          <Scissors className="w-3 h-3 shrink-0" />
                          <span className="truncate">
                            {barber.currentTicket.customerName}
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--foreground-muted)] truncate font-mono">
                          #{barber.currentTicket.ticketNumber} • {barber.currentTicket.serviceName || "Potong Rambut"}
                        </p>
                      </div>
                    ) : isReady ? (
                      <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <Sparkles className="w-3 h-3 shrink-0" />
                        <span>Kursi Siap Digunakan</span>
                      </div>
                    ) : barber.workStatus === BarberWorkStatus.BREAK ? (
                      <div className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                        <Coffee className="w-3 h-3 shrink-0" />
                        <span>Rehat / Istirahat</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>Tidak Sedang Bertugas</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom: Quick prompt tap indicator */}
                  <div className="mt-1 flex items-center justify-between text-[9px] text-[var(--foreground-muted)] pt-1 border-t border-[var(--border)]/30">
                    <span>Ubah status</span>
                    <ChevronRight className="w-3 h-3 text-[var(--foreground-muted)] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Status Modal Dialog */}
      {selectedBarber && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => !isUpdating && setSelectedBarber(null)}
        >
          <div
            className="w-full max-w-sm bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/15 border border-[var(--primary)]/30 flex items-center justify-center text-[var(--primary)] font-bold text-sm">
                  {selectedBarber.name
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)]">
                    {selectedBarber.name}
                  </h3>
                  <p className="text-[11px] text-[var(--foreground-muted)]">
                    Ubah Status Kerja Barber
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBarber(null)}
                className="p-1 rounded-lg text-[var(--foreground-muted)] hover:text-white hover:bg-stone-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleSelectNewStatus(BarberWorkStatus.READY)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  selectedBarber.workStatus === BarberWorkStatus.READY
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <div className="text-left">
                    <div>🟢 READY (Siap Melayani)</div>
                    <div className="text-[10px] text-emerald-400/80 font-normal">
                      Kursi aktif dan siap menerima antrean berikutnya
                    </div>
                  </div>
                </div>
                {selectedBarber.workStatus === BarberWorkStatus.READY && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </button>

              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleSelectNewStatus(BarberWorkStatus.BREAK)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  selectedBarber.workStatus === BarberWorkStatus.BREAK
                    ? "bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/30"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="text-left">
                    <div>🟡 BREAK (Istirahat / Toilet)</div>
                    <div className="text-[10px] text-amber-400/80 font-normal">
                      Sementara tidak dialokasikan antrean baru
                    </div>
                  </div>
                </div>
                {selectedBarber.workStatus === BarberWorkStatus.BREAK && (
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                )}
              </button>

              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleSelectNewStatus(BarberWorkStatus.OFFLINE)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  selectedBarber.workStatus === BarberWorkStatus.OFFLINE
                    ? "bg-zinc-500/20 border-zinc-500 text-zinc-300 ring-2 ring-zinc-500/30"
                    : "bg-zinc-500/10 border-zinc-500/30 text-zinc-400 hover:bg-zinc-500/20"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-zinc-500" />
                  <div className="text-left">
                    <div>⚪ OFFLINE (Selesai Shift / Libur)</div>
                    <div className="text-[10px] text-zinc-400/80 font-normal">
                      Tidak bertugas di salon hari ini
                    </div>
                  </div>
                </div>
                {selectedBarber.workStatus === BarberWorkStatus.OFFLINE && (
                  <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                )}
              </button>
            </div>

            <p className="text-[11px] text-[var(--foreground-muted)] text-center pt-2">
              Status kerja mempengaruhi urutan alokasi otomatis pada mesin antrean cerdas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
