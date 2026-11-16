"use client";

import React, { useState } from "react";
import { BarberWorkStatus } from "@prisma/client";
import {
  Scissors,
  Coffee,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Sparkles,
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
          label: "Siap",
          bg: "bg-[#E8F7EE] text-[#1E8E3E] border-[#1E8E3E]/20",
          dot: "bg-[#1E8E3E]",
          icon: CheckCircle2,
        };
      case BarberWorkStatus.BUSY:
        return {
          label: "Mencukur",
          bg: "bg-[#FDF0F2] text-[#D93025] border-[#D93025]/20",
          dot: "bg-[#D93025]",
          icon: Scissors,
        };
      case BarberWorkStatus.BREAK:
        return {
          label: "Istirahat",
          bg: "bg-[#FEF3EB] text-[#D97706] border-[#D97706]/20",
          dot: "bg-[#D97706]",
          icon: Coffee,
        };
      case BarberWorkStatus.OFFLINE:
      default:
        return {
          label: "Offline",
          bg: "bg-[#F6F5F2] text-[#706E68] border-[#E8E5DE]",
          dot: "bg-[#706E68]",
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
      setSelectedBarber(null);
    } catch (err) {
      console.error("Gagal update status barber:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const activeCount = barbers.filter(
    (b) => b.workStatus === BarberWorkStatus.READY || b.workStatus === BarberWorkStatus.BUSY
  ).length;

  return (
    <div className="space-y-2.5">
      {/* Title & Stats */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-[#1A1A1A] tracking-tight">
            Status Barber Bertugas
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-white text-[#706E68] font-semibold text-[11px] border border-[#E8E5DE]">
            {activeCount} Aktif
          </span>
        </div>
        <span className="text-[11px] text-[#A8A59E]">
          Ketuk kartu untuk ubah status
        </span>
      </div>

      {/* Swipeable Carousel Horizontal Bar */}
      <div className="relative">
        <div className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
          {barbers.length === 0 ? (
            <div className="w-full py-6 text-center text-xs text-[#706E68] bg-white border border-[#E8E5DE] rounded-2xl">
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
                  className={`flex-shrink-0 w-44 sm:w-52 p-3.5 rounded-2xl bg-white border transition-all duration-200 cursor-pointer select-none text-left relative overflow-hidden group hover:border-[#D5D1C8] active:scale-[0.98] shadow-sm ${
                    isBusy
                      ? "border-[#FDF0F2] ring-1 ring-[#D93025]/20"
                      : isReady
                      ? "border-[#E8F7EE] ring-1 ring-[#1E8E3E]/20"
                      : "border-[#E8E5DE]"
                  }`}
                >
                  {/* Top: Avatar & Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-9 h-9 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                        {barber.name
                          .split(" ")
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${statusInfo.dot} ring-2 ring-white`}
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#1A1A1A] truncate">
                          {barber.name}
                        </h4>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Middle: Work info or Customer In-chair */}
                  <div className="mt-2.5 pt-2 border-t border-[#E8E5DE] min-h-[38px] flex flex-col justify-center">
                    {isBusy && barber.currentTicket ? (
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-[#D93025] truncate">
                          <Scissors className="w-3 h-3 shrink-0" />
                          <span className="truncate">
                            {barber.currentTicket.customerName}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#706E68] truncate font-mono">
                          #{barber.currentTicket.ticketNumber} • {barber.currentTicket.serviceName || "Potong Rambut"}
                        </p>
                      </div>
                    ) : isReady ? (
                      <div className="flex items-center gap-1 text-[11px] text-[#1E8E3E] font-medium">
                        <Sparkles className="w-3 h-3 shrink-0" />
                        <span>Kursi Siap Digunakan</span>
                      </div>
                    ) : barber.workStatus === BarberWorkStatus.BREAK ? (
                      <div className="flex items-center gap-1 text-[11px] text-[#D97706] font-medium">
                        <Coffee className="w-3 h-3 shrink-0" />
                        <span>Rehat / Istirahat</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] text-[#706E68] font-medium">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>Tidak Sedang Bertugas</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom: Quick prompt tap indicator */}
                  <div className="mt-1 flex items-center justify-between text-[9px] text-[#A8A59E] pt-1 border-t border-[#E8E5DE]/60">
                    <span>Ubah status</span>
                    <ChevronRight className="w-3 h-3 text-[#A8A59E] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Dialog Ubah Status Kerja Barber */}
      {selectedBarber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white border border-[#E8E5DE] rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E5DE] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
                  {selectedBarber.name
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1A1A]">
                    {selectedBarber.name}
                  </h3>
                  <p className="text-[11px] text-[#706E68]">
                    Ubah Status Kerja Barber
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBarber(null)}
                className="p-1 rounded-full text-[#706E68] hover:text-[#1A1A1A] hover:bg-[#F6F5F2] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleSelectNewStatus(BarberWorkStatus.READY)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                  selectedBarber.workStatus === BarberWorkStatus.READY
                    ? "bg-[#E8F7EE] border-[#1E8E3E] text-[#1E8E3E] ring-2 ring-[#1E8E3E]/20"
                    : "bg-[#E8F7EE]/40 border-[#1E8E3E]/20 text-[#1E8E3E] hover:bg-[#E8F7EE]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#1E8E3E]" />
                  <div className="text-left">
                    <div>🟢 READY (Siap Melayani)</div>
                    <div className="text-[10px] text-[#1E8E3E]/80 font-normal">
                      Kursi aktif dan siap menerima antrean berikutnya
                    </div>
                  </div>
                </div>
                {selectedBarber.workStatus === BarberWorkStatus.READY && (
                  <CheckCircle2 className="w-4 h-4 text-[#1E8E3E]" />
                )}
              </button>

              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleSelectNewStatus(BarberWorkStatus.BREAK)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                  selectedBarber.workStatus === BarberWorkStatus.BREAK
                    ? "bg-[#FEF3EB] border-[#D97706] text-[#D97706] ring-2 ring-[#D97706]/20"
                    : "bg-[#FEF3EB]/40 border-[#D97706]/20 text-[#D97706] hover:bg-[#FEF3EB]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#D97706]" />
                  <div className="text-left">
                    <div>🟡 BREAK (Istirahat / Toilet)</div>
                    <div className="text-[10px] text-[#D97706]/80 font-normal">
                      Sementara tidak dialokasikan antrean baru
                    </div>
                  </div>
                </div>
                {selectedBarber.workStatus === BarberWorkStatus.BREAK && (
                  <CheckCircle2 className="w-4 h-4 text-[#D97706]" />
                )}
              </button>

              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleSelectNewStatus(BarberWorkStatus.OFFLINE)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                  selectedBarber.workStatus === BarberWorkStatus.OFFLINE
                    ? "bg-[#F6F5F2] border-[#706E68] text-[#1A1A1A] ring-2 ring-[#706E68]/20"
                    : "bg-[#F6F5F2]/60 border-[#E8E5DE] text-[#706E68] hover:bg-[#F6F5F2]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#706E68]" />
                  <div className="text-left">
                    <div>⚪ OFFLINE (Selesai Shift / Libur)</div>
                    <div className="text-[10px] text-[#706E68] font-normal">
                      Tidak bertugas di salon hari ini
                    </div>
                  </div>
                </div>
                {selectedBarber.workStatus === BarberWorkStatus.OFFLINE && (
                  <CheckCircle2 className="w-4 h-4 text-[#706E68]" />
                )}
              </button>
            </div>

            <p className="text-[11px] text-[#A8A59E] text-center pt-2">
              Status kerja mempengaruhi urutan alokasi otomatis pada mesin antrean cerdas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
