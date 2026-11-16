"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Scissors,
  LayoutDashboard,
  Store,
  Tag,
  Receipt,
  SlidersHorizontal,
  LogOut,
  RefreshCw,
  Plus,
  Search,
  Menu,
  X,
  CreditCard,
  Building2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { SuperadminDashboardData } from "../types";
import { PlatformOverviewCards } from "./PlatformOverviewCards";
import { TenantManagementTable } from "./TenantManagementTable";
import { CreateTenantModal } from "./CreateTenantModal";

interface SuperadminDashboardViewProps {
  initialData: SuperadminDashboardData;
  userName: string;
  userRole: string;
}

export function SuperadminDashboardView({
  initialData,
  userName,
  userRole,
}: SuperadminDashboardViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("overview");

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  // Nav items from Screen 8
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "tenants", label: "Semua Barbershop", icon: Store },
    { id: "plans", label: "Paket Langganan", icon: Tag },
    { id: "billing", label: "Pembayaran & Tagihan", icon: Receipt },
    { id: "audit", label: "Sistem & Audit Log", icon: SlidersHorizontal },
  ];

  return (
    <div className="min-h-screen bg-[#F6F5F2] text-[#1A1A1A] antialiased">
      {/* 1. Left Fixed Sidebar (Desktop) */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-[#E8E5DE] z-50 hidden lg:flex flex-col justify-between shadow-[0_1px_3px_0px_rgba(28,25,23,0.02)]">
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-[#E8E5DE]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] text-white flex items-center justify-center shrink-0">
                <Scissors className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-[#1A1A1A] tracking-tight">
                Cukurin
              </span>
            </div>
            <span className="bg-[#E8F7EE] text-[#1E8E3E] text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
              SUPERADMIN
            </span>
          </div>

          {/* Navigation List */}
          <div className="p-4">
            <div className="px-3 mb-2 text-[10px] font-bold text-[#A8A59E] uppercase tracking-wider">
              Platform Menu
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveNav(item.id);
                      if (item.id === "tenants") {
                        const el = document.getElementById("tenants-directory");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      } else if (item.id === "billing") {
                        const el = document.getElementById("billing-feed");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors text-left cursor-pointer ${
                      isActive
                        ? "bg-[#FFF5EB] text-[#D97706] font-semibold"
                        : "text-[#706E68] hover:text-[#1A1A1A] hover:bg-[#F6F5F2] font-medium"
                    }`}
                    type="button"
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#E8E5DE] space-y-3">
          <div className="bg-[#EFECE6] text-[#706E68] px-2.5 py-1 rounded-full font-mono text-[11px] font-medium text-center">
            Cukurin Core v1.0.0-prod
          </div>

          <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-[#F6F5F2] transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {userName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-[#1A1A1A] truncate">
                  {userName}
                </span>
                <span className="text-[10px] text-[#706E68] truncate">
                  {userRole}
                </span>
              </div>
            </div>

            <Link
              href="/logout"
              prefetch={false}
              title="Keluar dari Portal"
              className="text-[#706E68] hover:text-[#D93025] hover:bg-[#FDF0F2] p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-72 max-w-[80vw] h-full bg-white flex flex-col justify-between p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E8E5DE]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] text-white flex items-center justify-center">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-[#1A1A1A]">Cukurin</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-[#706E68] hover:bg-[#F6F5F2]"
                  type="button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4">
                <div className="text-[10px] font-bold text-[#A8A59E] uppercase tracking-wider mb-2">
                  Platform Menu
                </div>
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveNav(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                          activeNav === item.id
                            ? "bg-[#FFF5EB] text-[#D97706] font-semibold"
                            : "text-[#706E68]"
                        }`}
                        type="button"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E5DE] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#1A1A1A]">{userName}</p>
                  <p className="text-[10px] text-[#706E68]">{userRole}</p>
                </div>
                <Link
                  href="/logout"
                  prefetch={false}
                  className="p-2 text-[#D93025] hover:bg-[#FDF0F2] rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Fixed Top Header Bar */}
      <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-[#E8E5DE] z-40 px-4 sm:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg text-[#706E68] hover:bg-[#F6F5F2] hover:text-[#1A1A1A] cursor-pointer"
            type="button"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Bar */}
          <div className="relative w-48 sm:w-72 md:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#706E68] pointer-events-none" />
            <input
              type="text"
              placeholder="Cari barbershop, owner..."
              className="w-full pl-8 pr-3 py-1.5 rounded-full bg-[#F6F5F2] border border-[#E8E5DE] text-xs text-[#1A1A1A] focus:outline-none focus:border-[#111111] placeholder:text-[#A8A59E]"
            />
          </div>
        </div>

        {/* Right Action Group */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Platform Health Chip */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F7EE] border border-[#CEEAD6] text-[#1E8E3E] text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-[#1E8E3E] animate-pulse"></span>
            <span>Platform: Semua Sistem Normal</span>
          </div>

          {/* Refresh Action */}
          <button
            onClick={handleRefresh}
            disabled={isPending}
            title="Sinkronisasi Data"
            className="w-9 h-9 rounded-full bg-[#F6F5F2] hover:bg-[#EFECE6] border border-[#E8E5DE] text-[#706E68] hover:text-[#1A1A1A] flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
            type="button"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isPending ? "animate-spin text-[#D97706]" : ""}`}
            />
          </button>

          {/* Primary CTA: + Daftarkan Tenant Baru (Triggers Screen 10 Modal) */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="h-9 px-4 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            type="button"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Daftarkan Tenant Baru</span>
            <span className="xs:hidden">Daftar</span>
          </button>
        </div>
      </header>

      {/* 3. Main Content Container */}
      <main className="pl-0 lg:pl-64 pt-16 min-h-screen bg-[#F6F5F2] p-4 sm:p-6 space-y-6">
        {/* Section 1: Operational Diagnostics & 4 Bento Metrics Cards */}
        <PlatformOverviewCards
          metrics={initialData.overview}
          onSync={handleRefresh}
          isSyncing={isPending}
        />

        {/* Section 2: Central Tenant Directory Table */}
        <div id="tenants-directory">
          <TenantManagementTable tenants={initialData.tenants} />
        </div>

        {/* Section 3: Real-time Subscription Billing Feed (From Screen 8) */}
        <section
          id="billing-feed"
          className="bg-white rounded-2xl border border-[#E8E5DE] p-4 sm:p-6 shadow-[0_1px_3px_0px_rgba(28,25,23,0.02)] space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#D97706]" />
                <span>Feed Transaksi &amp; Pembayaran Langganan Terkini</span>
              </h3>
              <p className="text-xs text-[#706E68] mt-0.5">
                Riwayat pembayaran otomatis via QRIS &amp; Virtual Account
              </p>
            </div>

            <button
              onClick={() => {
                const el = document.getElementById("tenants-directory");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-xs font-semibold text-[#D97706] hover:text-[#B45309] flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              type="button"
            >
              <span>Lihat Semua Riwayat Tagihan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3 Transaction Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Transaction Card 1 */}
            <div className="bg-[#F6F5F2] rounded-xl p-4 border border-[#E8E5DE] hover:border-[#D5D1C8] transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-[#A8A59E] font-mono">
                    16 Nov 2026, 14:22
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#E8F7EE] text-[#1E8E3E] text-[10px] font-bold">
                    Lunas
                  </span>
                </div>
                <div className="text-sm font-bold text-[#1A1A1A]">
                  Vintage Barber Studio Bali
                </div>
                <div className="text-xs text-[#706E68] mt-0.5">
                  Aktivasi Paket Pro (12 Bulan)
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-[#E8E5DE] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#706E68] text-xs">
                  <CreditCard className="w-3.5 h-3.5 text-[#706E68]" />
                  <span>QRIS Dynamic</span>
                </div>
                <div className="text-sm font-bold text-[#1A1A1A]">
                  Rp 3.588.000
                </div>
              </div>
            </div>

            {/* Transaction Card 2 */}
            <div className="bg-[#F6F5F2] rounded-xl p-4 border border-[#E8E5DE] hover:border-[#D5D1C8] transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-[#A8A59E] font-mono">
                    16 Nov 2026, 11:05
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#E8F7EE] text-[#1E8E3E] text-[10px] font-bold">
                    Lunas
                  </span>
                </div>
                <div className="text-sm font-bold text-[#1A1A1A]">
                  Urban Fade Bekasi
                </div>
                <div className="text-xs text-[#706E68] mt-0.5">
                  Aktivasi Paket Reguler (1 Bulan)
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-[#E8E5DE] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#706E68] text-xs">
                  <Building2 className="w-3.5 h-3.5 text-[#706E68]" />
                  <span>Transfer Bank Manual</span>
                </div>
                <div className="text-sm font-bold text-[#1A1A1A]">
                  Rp 199.000
                </div>
              </div>
            </div>

            {/* Transaction Card 3 */}
            <div className="bg-[#F6F5F2] rounded-xl p-4 border border-[#E8E5DE] hover:border-[#D5D1C8] transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-[#A8A59E] font-mono">
                    16 Nov 2026, 09:41
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#E8F7EE] text-[#1E8E3E] text-[10px] font-bold">
                    Lunas
                  </span>
                </div>
                <div className="text-sm font-bold text-[#1A1A1A]">
                  Gentleman Cut Surabaya
                </div>
                <div className="text-xs text-[#706E68] mt-0.5">
                  Perpanjangan Paket Reguler (6 Bulan)
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-[#E8E5DE] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#706E68] text-xs">
                  <CreditCard className="w-3.5 h-3.5 text-[#706E68]" />
                  <span>VA Mandiri</span>
                </div>
                <div className="text-sm font-bold text-[#1A1A1A]">
                  Rp 1.074.000
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 4. Modal Screen 10: Daftarkan Tenant Baru */}
      <CreateTenantModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          handleRefresh();
        }}
      />
    </div>
  );
}
