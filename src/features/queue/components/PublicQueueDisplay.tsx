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
    <div className="min-h-screen bg-[#141210] text-[#f5f4f0] p-4 sm:p-6 md:p-8 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      {/* Top Header Bar for Smart TV */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-6 bg-[#1f1c18] border border-[#38332c] rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <Scissors className="w-8 h-8 -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white uppercase">
                {storeName}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                LIVE QUEUE
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#a39e93] flex items-center gap-1.5 mt-1 font-medium">
              <Store className="w-4 h-4 text-amber-500" />
              <span>Display Antrean Ruang Tunggu Barbershop</span>
            </p>
          </div>
        </div>

        {/* Right: Big Clock & Fullscreen Toggle */}
        <div className="flex items-center gap-4 sm:gap-6 relative z-10 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-[#38332c] pt-3 sm:pt-0">
          <div className="text-left sm:text-right">
            <p className="text-xs sm:text-sm text-[#a39e93] font-medium tracking-wide">
              {currentDate || "Hari Ini"}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-4xl md:text-5xl font-mono font-black text-amber-400 tracking-wider">
                {currentTime || "00:00:00"}
              </span>
              <span className="text-xs font-bold text-amber-400/80">WIB</span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Toggle Fullscreen Smart TV"
            className="p-3 rounded-2xl bg-[#292520] hover:bg-[#38332c] border border-[#443e35] text-[#a39e93] hover:text-white transition-all cursor-pointer shadow-lg"
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
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                Status Meja Barber
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-[#a39e93] bg-[#1f1c18] px-3 py-1 rounded-full border border-[#38332c]">
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
                  className={`p-5 rounded-3xl border flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                    isBusy
                      ? "bg-gradient-to-br from-[#241c1b] to-[#1f1c18] border-rose-500/50 shadow-xl shadow-rose-950/30"
                      : isReady
                      ? "bg-gradient-to-br from-[#1a231f] to-[#1f1c18] border-emerald-500/40 shadow-xl shadow-emerald-950/20"
                      : "bg-[#1f1c18] border-[#38332c] opacity-80"
                  }`}
                >
                  {/* Top: Chair number & Barber Name */}
                  <div>
                    <div className="flex items-center justify-between border-b border-[#38332c]/70 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-xl bg-[#141210] border border-[#38332c] flex items-center justify-center font-mono font-black text-sm text-amber-400">
                          #{st.chairNumber}
                        </span>
                        <div>
                          <h3 className="text-base font-bold text-white truncate">
                            {st.barberName}
                          </h3>
                          <p className="text-xs text-[#a39e93]">
                            Meja {st.chairNumber}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {isBusy ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                          Mencukur
                        </span>
                      ) : isReady ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5" />
                          Meja Siap
                        </span>
                      ) : isBreak ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                          <Coffee className="w-3.5 h-3.5" />
                          Istirahat
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-zinc-500/20 text-zinc-300 border border-zinc-500/40 uppercase tracking-wider">
                          Offline
                        </span>
                      )}
                    </div>

                    {/* Middle: Customer being served */}
                    <div className="py-4">
                      {isBusy && st.customerName ? (
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">
                            Sedang Melayani:
                          </p>
                          <div className="flex items-center gap-2">
                            {st.ticketNumber && (
                              <span className="px-2 py-0.5 rounded-lg font-mono font-black text-sm bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                #{st.ticketNumber}
                              </span>
                            )}
                            <h4 className="text-xl sm:text-2xl font-black text-white truncate">
                              {st.customerName}
                            </h4>
                          </div>
                          <p className="text-xs text-[#a39e93] font-medium truncate mt-1">
                            {st.serviceName || "Paket Potong Rambut"}
                          </p>
                        </div>
                      ) : isReady ? (
                        <div className="py-2 space-y-1">
                          <p className="text-base font-bold text-emerald-400">
                            Kursi Kosong
                          </p>
                          <p className="text-xs text-[#a39e93]">
                            Silakan masuk bagi nomor panggilan berikutnya.
                          </p>
                        </div>
                      ) : (
                        <div className="py-2 text-xs text-[#a39e93]">
                          Meja sedang tidak beroperasi
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Progress info */}
                  <div className="pt-2 border-t border-[#38332c]/50 text-xs text-[#a39e93] flex items-center justify-between">
                    <span>Estimasi Durasi</span>
                    <span className="font-mono font-bold text-white">~30 Menit</span>
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
              <Users className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                Daftar Antrean (Next in Line)
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30">
              {queue.length} MENUNGGU
            </span>
          </div>

          {/* Next Ticket Spotlight (Huge visibility from 3-5 meters) */}
          {nextInLine ? (
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-amber-600/25 via-[#292218] to-[#1f1c18] border-2 border-amber-500 shadow-2xl shadow-amber-950/40 relative overflow-hidden">
              <div className="absolute top-2 right-4 text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
                PANGGILAN BERIKUTNYA • NEXT
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-amber-500 text-stone-950 flex flex-col items-center justify-center font-mono font-black shadow-xl shadow-amber-500/40 shrink-0">
                    <span className="text-[10px] font-sans font-bold tracking-wider uppercase">
                      NO TIKET
                    </span>
                    <span className="text-3xl sm:text-4xl font-black leading-none mt-1">
                      {nextInLine.ticketNumber}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Siap-siap Dipanggil:
                    </span>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                      {nextInLine.customerName}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#a39e93]">
                      {nextInLine.serviceName} •{" "}
                      <span className="text-purple-300 font-medium">
                        {nextInLine.requestedBarber
                          ? `Req: ${nextInLine.requestedBarber}`
                          : "Barber: Bebas"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0 bg-[#141210]/60 p-3 sm:p-4 rounded-2xl border border-[#38332c]">
                  <p className="text-[11px] text-[#a39e93] font-medium uppercase">
                    Waktu Menunggu
                  </p>
                  <div className="text-xl sm:text-2xl font-mono font-black text-amber-400">
                    ~{nextInLine.waitingMinutes} Mnt
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-[#1f1c18] border border-[#38332c] text-center space-y-2">
              <Users className="w-12 h-12 text-[#a39e93] mx-auto opacity-40" />
              <h3 className="text-lg font-bold text-white">
                Tidak Ada Antrean Menunggu
              </h3>
              <p className="text-xs sm:text-sm text-[#a39e93] max-w-sm mx-auto">
                Ruang tunggu sedang kosong. Silakan mendaftar di meja kasir untuk langsung potong rambut.
              </p>
            </div>
          )}

          {/* Upcoming Waiting List */}
          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[420px] pr-1">
            {upcomingQueue.map((item, idx) => (
              <div
                key={item.ticketNumber}
                className="p-4 rounded-2xl bg-[#1f1c18] hover:bg-[#28241f] border border-[#38332c] flex items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[#2b2620] border border-[#443e35] flex flex-col items-center justify-center font-mono font-black text-amber-300 shrink-0">
                    <span className="text-[9px] text-[#a39e93] leading-none uppercase">
                      #{idx + 2}
                    </span>
                    <span className="text-base font-bold leading-none mt-1">
                      {item.ticketNumber}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-base sm:text-lg font-bold text-white truncate">
                      {item.customerName}
                    </h4>
                    <p className="text-xs text-[#a39e93] truncate">
                      {item.serviceName} •{" "}
                      <span className="text-purple-300">
                        {item.requestedBarber
                          ? `Req: ${item.requestedBarber}`
                          : "Barber: Bebas"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-xs font-mono font-semibold text-[#a39e93]">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>~{item.waitingMinutes} mnt</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer Branding for TV Display */}
      <footer className="pt-4 border-t border-[#38332c] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#a39e93]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sistem Sinkronisasi Antrean Otomatis Aktif (Auto-Refresh)</span>
        </div>
        <p className="font-semibold text-white/80">
          Powered by <strong className="text-amber-400">Cukurin.app</strong> — Smart Barbershop Engine
        </p>
      </footer>
    </div>
  );
}
