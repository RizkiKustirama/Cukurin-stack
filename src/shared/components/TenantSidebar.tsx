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
  Store,
  Package,
  Wrench,
  ShieldCheck,
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

  const isOwner =
    user.role === "OWNER" ||
    user.role === "SUPERADMIN";

  return (
    <aside
      aria-label="Desktop Sidebar Navigation"
      className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-[#E8E5DE] p-4 shrink-0 justify-between select-none shadow-[0_1px_8px_rgba(0,0,0,0.03)]"
    >
      {/* Top Section */}
      <div className="space-y-5">
        {/* Brand & Store Header */}
        <div className="px-2 py-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#111111] flex items-center justify-center text-white font-black text-lg shadow-sm">
              <Scissors className="w-5 h-5 -rotate-45" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-[#1A1A1A] uppercase truncate">
                  {brandName || "Cukurin"}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#FEF3EB] text-[#D97706] border border-[#D97706]/20">
                  POS
                </span>
              </div>
              <p className="text-xs text-[#706E68] truncate flex items-center gap-1 mt-0.5">
                <Store className="w-3 h-3 text-[#706E68] shrink-0" />
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
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#111111] hover:bg-neutral-800 active:scale-[0.99] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Tiket Baru</span>
          </button>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1 text-xs font-medium">
          <div className="px-3 pb-1 pt-1 text-[11px] font-semibold text-[#A8A59E] uppercase tracking-wider">
            Kasir & Antrean
          </div>

          {/* Antrean */}
          <Link
            href={`/${storeSlug}/pos?tab=queue`}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full transition-all ${
              currentTab === "queue"
                ? "bg-[#FFF5EB] text-[#D97706] font-semibold"
                : "text-[#706E68] hover:bg-[#F6F5F2] hover:text-[#1A1A1A]"
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>Antrean Masuk</span>
          </Link>

          {/* Kasir POS */}
          <Link
            href={`/${storeSlug}/pos?tab=pos`}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full transition-all ${
              currentTab === "pos"
                ? "bg-[#FFF5EB] text-[#D97706] font-semibold"
                : "text-[#706E68] hover:bg-[#F6F5F2] hover:text-[#1A1A1A]"
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
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full transition-all text-left cursor-pointer ${
                currentTab === "cash"
                  ? "bg-[#FFF5EB] text-[#D97706] font-semibold"
                  : "text-[#706E68] hover:bg-[#F6F5F2] hover:text-[#1A1A1A]"
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Buku Kas & Laci</span>
            </button>
          ) : (
            <Link
              href={`/${storeSlug}/pos?tab=cash`}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full transition-all ${
                currentTab === "cash"
                  ? "bg-[#FFF5EB] text-[#D97706] font-semibold"
                  : "text-[#706E68] hover:bg-[#F6F5F2] hover:text-[#1A1A1A]"
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Buku Kas & Laci</span>
            </Link>
          )}

          {/* Inventori & Aset */}
          <div className="pt-3 px-3 pb-1 text-[11px] font-semibold text-[#A8A59E] uppercase tracking-wider">
            Inventori & Aset
          </div>

          <Link
            href={`/${storeSlug}/inventory`}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-full text-[#706E68] hover:bg-[#F6F5F2] hover:text-[#1A1A1A] transition-all"
          >
            <Package className="w-4 h-4 text-[#D97706]" />
            <span>Stok & Backbar</span>
          </Link>

          <Link
            href={`/${storeSlug}/assets`}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-full text-[#706E68] hover:bg-[#F6F5F2] hover:text-[#1A1A1A] transition-all"
          >
            <Wrench className="w-4 h-4 text-[#1A73E8]" />
            <span>Pelacak Aset Alat</span>
          </Link>

          <div className="pt-3 px-3 pb-1 text-[11px] font-semibold text-[#A8A59E] uppercase tracking-wider">
            Layar Publik & Staf
          </div>

          {/* Portal Barber */}
          <Link
            href={`/${storeSlug}/barber`}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-full text-[#706E68] hover:bg-[#F6F5F2] hover:text-[#1A1A1A] transition-all"
          >
            <UserCheck className="w-4 h-4 text-[#1E8E3E]" />
            <span>Portal Barber</span>
          </Link>

          {/* Layar Display TV */}
          <Link
            href={`/${storeSlug}/queue`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-full text-[#706E68] hover:bg-[#F6F5F2] hover:text-[#1A1A1A] transition-all group"
          >
            <div className="flex items-center gap-3">
              <Tv className="w-4 h-4 text-[#1A73E8] group-hover:scale-110 transition-transform" />
              <span>Layar Display TV</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF6FE] text-[#1A73E8]">
              Live
            </span>
          </Link>

          {/* Rekap Bisnis & Dashboard Khusus Owner */}
          {isOwner && (
            <Link
              href={`/${storeSlug}/dashboard`}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-full text-[#706E68] hover:bg-[#F6F5F2] hover:text-[#1A1A1A] transition-all"
            >
              <LayoutDashboard className="w-4 h-4 text-[#D97706]" />
              <span>Rekap Bisnis (Owner)</span>
            </Link>
          )}
        </nav>
      </div>

      {/* Bottom Section: Active User, Status & Logout */}
      <div className="pt-4 border-t border-[#E8E5DE] space-y-3">
        {/* Status POS Online */}
        <div className="bg-[#E8F7EE] rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1E8E3E]" />
            <span className="text-[11px] text-[#1E8E3E] font-semibold">POS Cloud Sync Aktif</span>
          </div>
          <span className="text-[10px] text-[#1E8E3E]/80 font-bold uppercase">Online</span>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F6F5F2] border border-[#E8E5DE]">
          <div className="relative w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#1A1A1A] truncate leading-tight">
              {user.name}
            </p>
            <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-white text-[#706E68] border border-[#E8E5DE] mt-0.5">
              {user.role}
            </span>
          </div>
        </div>

        {/* Logout Link */}
        <Link
          href="/logout"
          prefetch={false}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-full hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar Sesi</span>
        </Link>
      </div>
    </aside>
  );
}
