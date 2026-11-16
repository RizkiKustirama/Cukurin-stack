"use client";

import { useState } from "react";
import { Search, Building2, Calendar, ShieldCheck, CheckCircle2, Clock, AlertTriangle, KeyRound } from "lucide-react";
import type { TenantManagementItem } from "../types";
import { SubscriptionStatus, SubscriptionPlan } from "@prisma/client";
import { ExtendSubscriptionModal } from "./ExtendSubscriptionModal";

interface TenantManagementTableProps {
  tenants: TenantManagementItem[];
}

export function TenantManagementTable({ tenants }: TenantManagementTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedTenant, setSelectedTenant] = useState<TenantManagementItem | null>(null);

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.brandName && t.brandName.toLowerCase().includes(search.toLowerCase())) ||
      t.slug.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || t.subscriptionStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: SubscriptionStatus, daysRemaining: number) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active ({daysRemaining}h)
          </span>
        );
      case "TRIAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            Trial ({daysRemaining}h)
          </span>
        );
      case "EXPIRED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            Expired
          </span>
        );
      case "SUSPENDED":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-500/15 text-zinc-400 border border-zinc-500/30">
            Suspended
          </span>
        );
    }
  };

  const getPlanBadge = (plan: SubscriptionPlan | null) => {
    switch (plan) {
      case "ENTERPRISE":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            ENTERPRISE
          </span>
        );
      case "PRO":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            PRO
          </span>
        );
      case "REGULER":
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-zinc-700/50 text-zinc-300 border border-zinc-600/50">
            REGULER
          </span>
        );
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-md space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-400" />
            Daftar Tenant Barbershop & Masa Aktif
          </h3>
          <p className="text-xs text-[var(--foreground-muted)]">
            Total {tenants.length} barbershop terdaftar di platform
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--foreground-muted)] pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama atau slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--foreground)] focus:outline-none focus:border-purple-500 placeholder:text-[var(--foreground-muted)]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--foreground)] focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Active Saja</option>
            <option value="TRIAL">Trial Saja</option>
            <option value="EXPIRED">Expired Saja</option>
          </select>
        </div>
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--foreground-muted)] font-semibold">
              <th className="py-2.5 px-3">Barbershop / Brand</th>
              <th className="py-2.5 px-3">Paket</th>
              <th className="py-2.5 px-3">Status Langganan</th>
              <th className="py-2.5 px-3 text-center">Cabang / User</th>
              <th className="py-2.5 px-3">Tanggal Expired</th>
              <th className="py-2.5 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/60">
            {filteredTenants.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[var(--foreground-muted)]">
                  Tidak ada data tenant yang cocok dengan kriteria pencarian.
                </td>
              </tr>
            ) : (
              filteredTenants.map((t) => (
                <tr key={t.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-[var(--foreground)]">
                      {t.brandName || t.name}
                    </div>
                    <div className="text-[11px] text-purple-400 font-mono">/{t.slug}</div>
                  </td>
                  <td className="py-3 px-3">{getPlanBadge(t.subscriptionPlan)}</td>
                  <td className="py-3 px-3">
                    {getStatusBadge(t.subscriptionStatus, t.daysRemaining)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-mono text-[11px] text-[var(--foreground)]">
                      {t.storesCount} Cabang • {t.usersCount} User
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-[11px] font-mono text-[var(--foreground-muted)]">
                      {t.subscriptionStatus === "ACTIVE" && t.subscriptionEndsAt
                        ? new Date(t.subscriptionEndsAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : new Date(t.trialEndsAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedTenant(t)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-semibold text-[11px] transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Perpanjang</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View: Cards */}
      <div className="md:hidden space-y-3">
        {filteredTenants.length === 0 ? (
          <div className="p-6 text-center text-xs text-[var(--foreground-muted)] bg-[var(--background)] rounded-xl border border-[var(--border)]">
            Tidak ada data tenant yang cocok.
          </div>
        ) : (
          filteredTenants.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-sm text-[var(--foreground)]">
                    {t.brandName || t.name}
                  </div>
                  <div className="text-xs text-purple-400 font-mono">/{t.slug}</div>
                </div>
                <div>{getPlanBadge(t.subscriptionPlan)}</div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border)]/60">
                <div>{getStatusBadge(t.subscriptionStatus, t.daysRemaining)}</div>
                <div className="text-[11px] text-[var(--foreground-muted)] font-mono">
                  {t.storesCount} Cabang • {t.usersCount} User
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                <span className="text-[11px] text-[var(--foreground-muted)] font-mono">
                  Exp:{" "}
                  {t.subscriptionStatus === "ACTIVE" && t.subscriptionEndsAt
                    ? new Date(t.subscriptionEndsAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : new Date(t.trialEndsAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                </span>
                <button
                  onClick={() => setSelectedTenant(t)}
                  className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Perpanjang</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Perpanjangan */}
      <ExtendSubscriptionModal
        tenant={selectedTenant}
        onClose={() => setSelectedTenant(null)}
        onSuccess={() => {
          setSelectedTenant(null);
        }}
      />
    </div>
  );
}
