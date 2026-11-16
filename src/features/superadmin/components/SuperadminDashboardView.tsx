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
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[var(--foreground)]">
                Portal Superadmin SaaS Cukurin
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                {userRole}
              </span>
            </div>
            <p className="text-xs text-[var(--foreground-muted)]">
              Manajemen Multi-Tenant & Verifikasi Pembayaran Langganan • Halo, {userName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={isPending}
            title="Refresh Data"
            className="p-2.5 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin text-purple-400" : ""}`} />
          </button>

          <Link
            href="/logout"
            prefetch={false}
            className="px-4 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-800/50 text-red-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
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
