"use client";

import Link from "next/link";
import { ShieldCheck, LogOut, RefreshCw, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { SuperadminDashboardData } from "../types";
import { PlatformOverviewCards } from "./PlatformOverviewCards";
import { TenantManagementTable } from "./TenantManagementTable";

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

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Superadmin */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-[#E8E5DE] rounded-2xl shadow-[0_1px_3px_rgba(28,25,23,0.02)]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] border border-[#E9D5FF] flex items-center justify-center text-[#9333EA] shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#1A1A1A]">
                Portal Superadmin SaaS Cukurin
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F3E8FF] text-[#9333EA] border border-[#E9D5FF]">
                {userRole}
              </span>
            </div>
            <p className="text-xs text-[#706E68]">
              Manajemen Multi-Tenant & Verifikasi Pembayaran Langganan • Halo, {userName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={isPending}
            title="Refresh Data"
            className="p-2.5 rounded-full bg-white hover:bg-[#F6F5F2] border border-[#E8E5DE] text-[#706E68] hover:text-[#1A1A1A] transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin text-[#9333EA]" : ""}`} />
          </button>

          <Link
            href="/logout"
            prefetch={false}
            className="px-4 py-2.5 rounded-full bg-[#FDF0F2] hover:bg-[#FCDAD7] border border-[#FCDAD7] text-[#D93025] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </Link>
        </div>
      </header>

      {/* 1. Ringkasan Metrik Platform */}
      <PlatformOverviewCards metrics={initialData.overview} />

      {/* 2. Tabel Manajemen Tenant & Perpanjangan Langganan */}
      <TenantManagementTable tenants={initialData.tenants} />
    </div>
  );
}
