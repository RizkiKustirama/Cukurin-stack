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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-[#E8E5DE] px-4 py-2 shadow-[0_-2px_12px_rgba(0,0,0,0.03)] backdrop-blur-xl pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-between max-w-lg mx-auto relative h-14">
        {/* Tab 1: Antrean */}
        <Link
          href={`/${storeSlug}/pos?tab=queue`}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all text-xs ${
            currentTab === "queue"
              ? "bg-[#111111] text-white font-semibold shadow-sm"
              : "text-[#706E68] hover:text-[#1A1A1A] font-medium"
          }`}
        >
          <Scissors className="w-4 h-4 -rotate-45" />
          <span>Antrean</span>
        </Link>

        {/* Center Floating Action Button (FAB): + Tiket */}
        {onOpenTicket && (
          <div className="flex justify-center -translate-y-4">
            <button
              type="button"
              onClick={onOpenTicket}
              aria-label="Buat Tiket Baru"
              className="group relative flex flex-col items-center justify-center w-12 h-12 rounded-full bg-[#111111] text-white shadow-lg ring-4 ring-white active:scale-95 hover:bg-neutral-800 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        )}

        {/* Tab 2: Kasir POS */}
        <Link
          href={`/${storeSlug}/pos?tab=pos`}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all text-xs ${
            currentTab === "pos"
              ? "bg-[#111111] text-white font-semibold shadow-sm"
              : "text-[#706E68] hover:text-[#1A1A1A] font-medium"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Kasir POS</span>
        </Link>

        {/* Tab 3: Buku Kas */}
        {onOpenCashDrawer ? (
          <button
            type="button"
            onClick={onOpenCashDrawer}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-all text-xs cursor-pointer ${
              currentTab === "cash"
                ? "bg-[#111111] text-white font-semibold shadow-sm"
                : "text-[#706E68] hover:text-[#1A1A1A] font-medium"
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Kasir Kas</span>
          </button>
        ) : (
          <Link
            href={`/${storeSlug}/pos?tab=cash`}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-all text-xs ${
              currentTab === "cash"
                ? "bg-[#111111] text-white font-semibold shadow-sm"
                : "text-[#706E68] hover:text-[#1A1A1A] font-medium"
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Kasir Kas</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
