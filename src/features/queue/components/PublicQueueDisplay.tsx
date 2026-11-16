"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Scissors,
  Users,
  Clock,
  Sparkles,
  Coffee,
  Maximize2,
  Minimize2,
  Tv,
  Store,
  ChevronRight,
  Flame,
} from "lucide-react";
import { formatRupiah } from "@/shared/lib/formatters";

export interface PublicStation {
  chairNumber: number;
  barberName: string;
  status: "READY" | "BUSY" | "BREAK" | "OFFLINE";
  ticketNumber?: string;
  customerName?: string;
  serviceName?: string;
  durationMinutes?: number;
}

export interface PublicQueueItem {
  ticketNumber: string;
  customerName: string;
  serviceName: string;
  requestedBarber?: string | null;
  waitingMinutes: number;
}

export interface PublicQueueDisplayProps {
  storeName: string;
  storeSlug: string;
  stations: PublicStation[];
  queue: PublicQueueItem[];
}

export function PublicQueueDisplay({
  storeName,
  storeSlug,
  stations,
  queue,
}: PublicQueueDisplayProps) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Digital Wall Clock (Realtime WIB)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeFmt = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      const dateFmt = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      setCurrentTime(timeFmt.format(now));
      setCurrentDate(dateFmt.format(now));
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Periodic Auto-refresh (Every 6 seconds) to keep queue live
  useEffect(() => {
    const refreshTimer = setInterval(() => {
      router.refresh();
    }, 6000);

    return () => clearInterval(refreshTimer);
  }, [router]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const nextInLine = queue[0];
  const upcomingQueue = queue.slice(1);

  return (
    <div className="min-h-screen bg-[#F6F5F2] text-[#1A1A1A] p-4 sm:p-6 md:p-8 flex flex-col justify-between selection:bg-[#111111] selection:text-white">
      {/* Top Header Bar for Smart TV */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-6 bg-white border border-[#E8E5DE] rounded-3xl shadow-[0_1px_3px_rgba(28,25,23,0.02)] relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FFF5EB] border border-[#FDE6D2] flex items-center justify-center text-[#D97706] shrink-0">
            <Scissors className="w-8 h-8 -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-[#1A1A1A] uppercase">
                {storeName}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEF3EB] text-[#D97706] border border-[#FDE6D2]">
                LIVE QUEUE
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#706E68] flex items-center gap-1.5 mt-1 font-medium">
              <Store className="w-4 h-4 text-[#D97706]" />
              <span>Display Antrean Ruang Tunggu Barbershop</span>
            </p>
          </div>
        </div>

        {/* Right: Big Clock & Fullscreen Toggle */}
        <div className="flex items-center gap-4 sm:gap-6 relative z-10 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-[#E8E5DE] pt-3 sm:pt-0">
          <div className="text-left sm:text-right">
            <p className="text-xs sm:text-sm text-[#706E68] font-medium tracking-wide">
              {currentDate || "Hari Ini"}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-4xl md:text-5xl font-mono font-black text-[#1A1A1A] tracking-wider">
                {currentTime || "00:00:00"}
              </span>
              <span className="text-xs font-bold text-[#706E68]">WIB</span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Toggle Fullscreen Smart TV"
            className="p-3 rounded-2xl bg-[#F6F5F2] hover:bg-[#EFECE6] border border-[#E8E5DE] text-[#1A1A1A] transition-all cursor-pointer shadow-xs"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Maximize2 className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
        </div>
      </header>

      {/* Main Dual-Column Content for TV / Wide Monitors */}
      <main className="my-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sisi Kiri: Meja Barber (5 atau 6 kolom pada lg) */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-[#1E8E3E] animate-pulse" />
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-[#1A1A1A]">
                Status Meja Barber
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-[#706E68] bg-white px-3 py-1 rounded-full border border-[#E8E5DE]">
              {stations.length} MEJA
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {stations.map((st) => {
              const isBusy = st.status === "BUSY";
              const isReady = st.status === "READY";
              const isBreak = st.status === "BREAK";

              return (
                <div
                  key={st.chairNumber}
                  className={`p-5 rounded-3xl border flex flex-col justify-between transition-all duration-300 relative overflow-hidden bg-white shadow-[0_1px_3px_rgba(28,25,23,0.02)] ${
                    isBusy
                      ? "border-[#FCDAD7] ring-1 ring-[#FCDAD7]"
                      : isReady
                      ? "border-[#CEEAD6] ring-1 ring-[#CEEAD6]"
                      : "border-[#E8E5DE] opacity-90"
                  }`}
                >
                  {/* Top: Chair number & Barber Name */}
                  <div>
                    <div className="flex items-center justify-between border-b border-[#E8E5DE] pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-xl bg-[#F6F5F2] border border-[#E8E5DE] flex items-center justify-center font-mono font-black text-sm text-[#1A1A1A]">
                          #{st.chairNumber}
                        </span>
                        <div>
                          <h3 className="text-base font-bold text-[#1A1A1A] truncate">
                            {st.barberName}
                          </h3>
                          <p className="text-xs text-[#706E68]">
                            Meja {st.chairNumber}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {isBusy ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#FDF0F2] text-[#D93025] border border-[#FCDAD7] uppercase tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-[#D93025] animate-ping" />
                          Mencukur
                        </span>
                      ) : isReady ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-[#E8F7EE] text-[#1E8E3E] border border-[#CEEAD6] uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5" />
                          Meja Siap
                        </span>
                      ) : isBreak ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-[#FEF3EB] text-[#D97706] border border-[#FDE6D2] uppercase tracking-wider">
                          <Coffee className="w-3.5 h-3.5" />
                          Istirahat
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-[#F6F5F2] text-[#706E68] border border-[#E8E5DE] uppercase tracking-wider">
                          Offline
                        </span>
                      )}
                    </div>

                    {/* Middle: Customer being served */}
                    <div className="py-4">
                      {isBusy && st.customerName ? (
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-bold text-[#D93025] uppercase tracking-wider">
                            Sedang Melayani:
                          </p>
                          <div className="flex items-center gap-2">
                            {st.ticketNumber && (
                              <span className="px-2 py-0.5 rounded-lg font-mono font-black text-sm bg-[#FDF0F2] text-[#D93025] border border-[#FCDAD7]">
                                #{st.ticketNumber}
                              </span>
                            )}
                            <h4 className="text-xl sm:text-2xl font-black text-[#1A1A1A] truncate">
                              {st.customerName}
                            </h4>
                          </div>
                          <p className="text-xs text-[#706E68] font-medium truncate mt-1">
                            {st.serviceName || "Paket Potong Rambut"}
                          </p>
                        </div>
                      ) : isReady ? (
                        <div className="py-2 space-y-1">
                          <p className="text-base font-bold text-[#1E8E3E]">
                            Kursi Kosong
                          </p>
                          <p className="text-xs text-[#706E68]">
                            Silakan masuk bagi nomor panggilan berikutnya.
                          </p>
                        </div>
                      ) : (
                        <div className="py-2 text-xs text-[#706E68]">
                          Meja sedang tidak beroperasi
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Progress info */}
                  <div className="pt-2 border-t border-[#E8E5DE] text-xs text-[#706E68] flex items-center justify-between">
                    <span>Estimasi Durasi</span>
                    <span className="font-mono font-bold text-[#1A1A1A]">~30 Menit</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sisi Kanan: Daftar Antrean Menunggu (Next in Line) */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-[#D97706]" />
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-[#1A1A1A]">
                Daftar Antrean (Next in Line)
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-[#D97706] bg-[#FEF3EB] px-3 py-1 rounded-full border border-[#FDE6D2]">
              {queue.length} MENUNGGU
            </span>
          </div>

          {/* Next Ticket Spotlight (Huge visibility from 3-5 meters) */}
          {nextInLine ? (
            <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-[#111111] shadow-xl relative overflow-hidden">
              <div className="absolute top-2 right-4 text-[10px] sm:text-xs font-black uppercase tracking-widest text-white bg-[#111111] px-3 py-1 rounded-full">
                PANGGILAN BERIKUTNYA • NEXT
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#111111] text-white flex flex-col items-center justify-center font-mono font-black shadow-md shrink-0">
                    <span className="text-[10px] font-sans font-bold tracking-wider uppercase text-stone-300">
                      NO TIKET
                    </span>
                    <span className="text-3xl sm:text-4xl font-black leading-none mt-1 text-white">
                      {nextInLine.ticketNumber}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider">
                      Siap-siap Dipanggil:
                    </span>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A1A1A] tracking-tight">
                      {nextInLine.customerName}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#706E68]">
                      {nextInLine.serviceName} •{" "}
                      <span className="text-[#1A73E8] font-semibold">
                        {nextInLine.requestedBarber
                          ? `Req: ${nextInLine.requestedBarber}`
                          : "Barber: Bebas"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0 bg-[#F6F5F2] p-3 sm:p-4 rounded-2xl border border-[#E8E5DE]">
                  <p className="text-[11px] text-[#706E68] font-medium uppercase">
                    Waktu Menunggu
                  </p>
                  <div className="text-xl sm:text-2xl font-mono font-black text-[#1A1A1A]">
                    ~{nextInLine.waitingMinutes} Mnt
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white border border-[#E8E5DE] text-center space-y-2 shadow-[0_1px_3px_rgba(28,25,23,0.02)]">
              <Users className="w-12 h-12 text-[#A8A59E] mx-auto opacity-40" />
              <h3 className="text-lg font-bold text-[#1A1A1A]">
                Tidak Ada Antrean Menunggu
              </h3>
              <p className="text-xs sm:text-sm text-[#706E68] max-w-sm mx-auto">
                Ruang tunggu sedang kosong. Silakan mendaftar di meja kasir untuk langsung potong rambut.
              </p>
            </div>
          )}

          {/* Upcoming Waiting List */}
          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[420px] pr-1">
            {upcomingQueue.map((item, idx) => (
              <div
                key={item.ticketNumber}
                className="p-4 rounded-2xl bg-white hover:bg-[#F6F5F2] border border-[#E8E5DE] flex items-center justify-between gap-4 transition-all shadow-[0_1px_3px_rgba(28,25,23,0.02)]"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[#F6F5F2] border border-[#E8E5DE] flex flex-col items-center justify-center font-mono font-black text-[#1A1A1A] shrink-0">
                    <span className="text-[9px] text-[#706E68] leading-none uppercase">
                      #{idx + 2}
                    </span>
                    <span className="text-base font-bold leading-none mt-1">
                      {item.ticketNumber}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-base sm:text-lg font-bold text-[#1A1A1A] truncate">
                      {item.customerName}
                    </h4>
                    <p className="text-xs text-[#706E68] truncate">
                      {item.serviceName} •{" "}
                      <span className="text-[#1A73E8]">
                        {item.requestedBarber
                          ? `Req: ${item.requestedBarber}`
                          : "Barber: Bebas"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-xs font-mono font-semibold text-[#706E68] bg-[#F6F5F2] px-2.5 py-1 rounded-full border border-[#E8E5DE]">
                    <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>~{item.waitingMinutes} mnt</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer Branding for TV Display */}
      <footer className="pt-4 border-t border-[#E8E5DE] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#706E68]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1E8E3E] animate-pulse" />
          <span>Sistem Sinkronisasi Antrean Otomatis Aktif (Auto-Refresh)</span>
        </div>
        <p className="font-semibold text-[#1A1A1A]">
          Powered by <strong className="text-[#D97706]">Cukurin.app</strong> — Smart Barbershop Engine
        </p>
      </footer>
    </div>
  );
}
