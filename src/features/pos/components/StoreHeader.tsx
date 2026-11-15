"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Store,
  Clock,
  Wallet,
  Tv,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { formatRupiah } from "@/shared/lib/formatters";

export interface StoreHeaderProps {
  storeName: string;
  storeSlug: string;
  cashierName: string;
  cashierRole?: string;
  drawerStatus?: "OPEN" | "CLOSED";
  drawerCash?: number;
  onOpenCashDrawer?: () => void;
  onRefresh?: () => void;
}

export function StoreHeader({
  storeName,
  storeSlug,
  cashierName,
  cashierRole = "CASHIER",
  drawerStatus = "OPEN",
  drawerCash = 0,
  onOpenCashDrawer,
  onRefresh,
}: StoreHeaderProps) {
  const [wibTime, setWibTime] = useState<string>("");
  const [wibDate, setWibDate] = useState<string>("");
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeFormatter = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      const dateFormatter = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      setWibTime(`${timeFormatter.format(now)} WIB`);
      setWibDate(dateFormatter.format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefreshClick = () => {
    setIsRotating(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsRotating(false), 700);
  };

  const isDrawerOpen = drawerStatus === "OPEN";

  return (
    <header className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-[var(--primary)]/5 blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        {/* Left: Store identity & cashier */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[var(--primary)]/15 border border-[var(--primary)]/30 flex items-center justify-center text-[var(--primary)] shrink-0 shadow-inner">
            <Store className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-[var(--foreground)] tracking-tight truncate">
                {storeName}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-800 text-[var(--foreground-muted)] border border-[var(--border)] font-mono">
                /{storeSlug}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)] mt-0.5 flex-wrap">
              <span>Kasir: <strong className="text-[var(--foreground)] font-semibold">{cashierName}</strong></span>
              <span>•</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                {cashierRole}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Drawer Status, Realtime WIB Clock & TV Link */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-between sm:justify-end">
          {/* Cash Register Status Badge */}
          <button
            type="button"
            onClick={onOpenCashDrawer}
            title={isDrawerOpen ? "Laci Kasir Terbuka" : "Laci Kasir Ditutup"}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isDrawerOpen
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <div className="text-left">
              <div className="flex items-center gap-1 leading-none">
                {isDrawerOpen ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Laci Buka</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 text-rose-400" />
                    <span>Laci Tutup</span>
                  </>
                )}
              </div>
              {isDrawerOpen && drawerCash > 0 && (
                <div className="text-[10px] text-emerald-300 font-mono mt-0.5 leading-none">
                  {formatRupiah(drawerCash)}
                </div>
              )}
            </div>
          </button>

          {/* Realtime Date & WIB Clock */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--background)]/80 border border-[var(--border)] text-xs font-medium text-[var(--foreground)]">
            <Clock className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5 leading-tight text-right sm:text-left">
              <span className="text-[11px] text-[var(--foreground-muted)] hidden xs:inline">{wibDate || "Hari Ini"}</span>
              <span className="font-mono font-bold text-amber-300">{wibTime || "--:--:-- WIB"}</span>
            </div>
          </div>

          {/* Layar Display TV Button */}
          <Link
            href={`/${storeSlug}/queue`}
            target="_blank"
            rel="noopener noreferrer"
            title="Buka Layar Display TV Ruang Tunggu"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Layar TV</span>
          </Link>

          {/* Manual Refresh Button */}
          {onRefresh && (
            <button
              type="button"
              onClick={handleRefreshClick}
              title="Perbarui Data Kasir & Antrean"
              aria-label="Refresh"
              className="p-2 rounded-xl bg-[var(--background)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? "animate-spin text-[var(--primary)]" : ""}`} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
