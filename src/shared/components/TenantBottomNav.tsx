"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Scissors, Receipt, Wallet, Plus } from "lucide-react";

export interface TenantBottomNavProps {
  storeSlug: string;
  activeTab?: "queue" | "pos" | "cash";
  onOpenTicket?: () => void;
  onOpenCashDrawer?: () => void;
}

export function TenantBottomNav({
  storeSlug,
  activeTab: controlledTab,
  onOpenTicket,
  onOpenCashDrawer,
}: TenantBottomNavProps) {
  const searchParams = useSearchParams();
  const currentTab = controlledTab || searchParams?.get("tab") || "pos";

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)] border-t border-[var(--border)] px-4 py-2 shadow-2xl backdrop-blur-lg pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-between max-w-lg mx-auto relative">
        {/* Tab 1: Antrean */}
        <Link
          href={`/${storeSlug}/pos?tab=queue`}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all duration-200 ${
            currentTab === "queue"
              ? "text-[var(--primary)] font-semibold scale-105"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <div className="relative">
            <Scissors
              className={`w-5 h-5 transition-transform ${
                currentTab === "queue" ? "-rotate-45" : ""
              }`}
            />
            {currentTab === "queue" && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight">Antrean</span>
        </Link>

        {/* Center Floating Action Button (FAB): + Tiket */}
        <div className="flex-1 flex justify-center -translate-y-5">
          <button
            type="button"
            onClick={onOpenTicket}
            aria-label="Buat Tiket Baru"
            className="group relative flex flex-col items-center justify-center w-14 h-14 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xl shadow-amber-950/60 ring-4 ring-[var(--surface)] active:scale-95 hover:brightness-110 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-amber-500"
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-[9px] font-bold tracking-tight uppercase leading-none mt-0.5">
              Tiket
            </span>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </button>
        </div>

        {/* Tab 2: Kasir POS */}
        <Link
          href={`/${storeSlug}/pos?tab=pos`}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all duration-200 ${
            currentTab === "pos"
              ? "text-[var(--primary)] font-semibold scale-105"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <div className="relative">
            <Receipt className="w-5 h-5" />
            {currentTab === "pos" && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight">Kasir POS</span>
        </Link>

        {/* Tab 3: Buku Kas */}
        {onOpenCashDrawer ? (
          <button
            type="button"
            onClick={onOpenCashDrawer}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all duration-200 cursor-pointer ${
              currentTab === "cash"
                ? "text-[var(--primary)] font-semibold scale-105"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[11px] mt-1 tracking-tight">Buku Kas</span>
          </button>
        ) : (
          <Link
            href={`/${storeSlug}/pos?tab=cash`}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all duration-200 ${
              currentTab === "cash"
                ? "text-[var(--primary)] font-semibold scale-105"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[11px] mt-1 tracking-tight">Buku Kas</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
