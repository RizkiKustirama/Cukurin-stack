"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Scissors,
  Receipt,
  Wallet,
  Tv,
  UserCheck,
  LayoutDashboard,
  LogOut,
  Plus,
  Sparkles,
  Store,
} from "lucide-react";

export interface TenantSidebarProps {
  storeSlug: string;
  storeName?: string;
  brandName?: string;
  activeTab?: "queue" | "pos" | "cash";
  user?: {
    name: string;
    role: string;
    email?: string | null;
    phone?: string;
  };
  onOpenTicket?: () => void;
  onOpenCashDrawer?: () => void;
}

export function TenantSidebar({
  storeSlug,
  storeName = "Cukurin Barbershop",
  brandName,
  activeTab: controlledTab,
  user = { name: "Kasir Bertugas", role: "CASHIER" },
  onOpenTicket,
  onOpenCashDrawer,
}: TenantSidebarProps) {
  const searchParams = useSearchParams();
  const currentTab = controlledTab || searchParams?.get("tab") || "pos";

  const isOwnerOrManager =
    user.role === "OWNER" ||
    user.role === "MANAGER" ||
    user.role === "SUPERADMIN";

  return (
    <aside
      aria-label="Desktop Sidebar Navigation"
      className="hidden md:flex flex-col w-64 min-h-screen bg-[var(--surface)] border-r border-[var(--border)] p-4 shrink-0 justify-between select-none"
    >
      {/* Top Section */}
      <div className="space-y-6">
        {/* Brand & Store Header */}
        <div className="p-2 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/15 border border-[var(--primary)]/30 flex items-center justify-center text-[var(--primary)] font-black text-lg shadow-inner">
              <Scissors className="w-5 h-5 -rotate-45" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-[var(--foreground)] uppercase truncate">
                  {brandName || "Cukurin"}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  POS
                </span>
              </div>
              <p className="text-xs text-[var(--foreground-muted)] truncate flex items-center gap-1 mt-0.5">
                <Store className="w-3 h-3 text-[var(--foreground-muted)] shrink-0" />
                <span className="truncate">{storeName}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Button: Buat Tiket */}
        {onOpenTicket && (
          <button
            type="button"
            onClick={onOpenTicket}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--primary)] hover:brightness-110 active:scale-[0.99] text-[var(--primary-foreground)] text-sm font-bold shadow-lg shadow-amber-950/40 transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Tiket Baru</span>
          </button>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1.5 text-sm font-medium">
          <div className="px-3 pb-1 text-[11px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
            Kasir & Operasional
          </div>

          {/* Antrean */}
          <Link
            href={`/${storeSlug}/pos?tab=queue`}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              currentTab === "queue"
                ? "bg-[var(--primary)]/15 text-[var(--primary)] font-semibold border border-[var(--primary)]/30 shadow-sm"
                : "text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>Antrean Masuk</span>
          </Link>

          {/* Kasir POS */}
          <Link
            href={`/${storeSlug}/pos?tab=pos`}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              currentTab === "pos"
                ? "bg-[var(--primary)]/15 text-[var(--primary)] font-semibold border border-[var(--primary)]/30 shadow-sm"
                : "text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Kasir POS (Checkout)</span>
          </Link>

          {/* Buku Kas */}
          {onOpenCashDrawer ? (
            <button
              type="button"
              onClick={onOpenCashDrawer}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
                currentTab === "cash"
                  ? "bg-[var(--primary)]/15 text-[var(--primary)] font-semibold border border-[var(--primary)]/30 shadow-sm"
                  : "text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Buku Kas & Laci</span>
            </button>
          ) : (
            <Link
              href={`/${storeSlug}/pos?tab=cash`}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                currentTab === "cash"
                  ? "bg-[var(--primary)]/15 text-[var(--primary)] font-semibold border border-[var(--primary)]/30 shadow-sm"
                  : "text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Buku Kas & Laci</span>
            </Link>
          )}

          <div className="pt-4 px-3 pb-1 text-[11px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
            Layar Publik & Staf
          </div>

          {/* Portal Barber */}
          <Link
            href={`/${storeSlug}/barber`}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] transition-all"
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Portal Barber</span>
          </Link>

          {/* Layar Display TV */}
          <Link
            href={`/${storeSlug}/queue`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] transition-all group"
          >
            <div className="flex items-center gap-3">
              <Tv className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span>Layar Display TV</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Live
            </span>
          </Link>

          {/* Dashboard Owner/Manager */}
          {isOwnerOrManager && (
            <Link
              href={`/${storeSlug}/dashboard`}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] transition-all"
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>Dashboard Toko</span>
            </Link>
          )}
        </nav>
      </div>

      {/* Bottom Section: Active User & Logout */}
      <div className="pt-4 border-t border-[var(--border)] space-y-3">
        {/* User Card */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--background)]/60 border border-[var(--border)]/70">
          <div className="relative w-9 h-9 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center font-bold text-xs text-[var(--foreground)] shrink-0">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--surface)]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-[var(--foreground)] truncate">
                {user.name}
              </p>
            </div>
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {user.role}
            </span>
          </div>
        </div>

        {/* Logout Link */}
        <Link
          href="/logout"
          prefetch={false}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-red-950/20 hover:bg-red-950/50 border border-red-900/40 text-red-300 text-xs font-medium transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar Sesi</span>
        </Link>
      </div>
    </aside>
  );
}
