"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Scissors,
  Eye,
  Send,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import type { TenantManagementItem } from "../types";
import { SubscriptionStatus, SubscriptionPlan } from "@prisma/client";
import { ExtendSubscriptionModal } from "./ExtendSubscriptionModal";

interface TenantManagementTableProps {
  tenants: TenantManagementItem[];
}

type FilterCategory = "all" | "reguler" | "pro" | "trial" | "expired";

const ITEMS_PER_PAGE = 8;

export function TenantManagementTable({ tenants }: TenantManagementTableProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTenant, setSelectedTenant] = useState<TenantManagementItem | null>(null);

  // Hitung jumlah untuk pill filter
  const counts = useMemo(() => {
    let reguler = 0;
    let pro = 0;
    let trial = 0;
    let expired = 0;

    tenants.forEach((t) => {
      if (t.subscriptionStatus === "EXPIRED") {
        expired++;
      } else if (t.subscriptionStatus === "TRIAL") {
        trial++;
      } else if (t.subscriptionPlan === "PRO" || t.subscriptionPlan === "ENTERPRISE") {
        pro++;
      } else if (t.subscriptionPlan === "REGULER") {
        reguler++;
      }
    });

    return {
      all: tenants.length,
      reguler,
      pro,
      trial,
      expired,
    };
  }, [tenants]);

  // Filter tenants
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      // 1. Filter by category
      let matchesCategory = true;
      if (activeFilter === "reguler") {
        matchesCategory =
          t.subscriptionStatus !== "EXPIRED" &&
          t.subscriptionStatus !== "TRIAL" &&
          t.subscriptionPlan === "REGULER";
      } else if (activeFilter === "pro") {
        matchesCategory =
          t.subscriptionStatus !== "EXPIRED" &&
          t.subscriptionStatus !== "TRIAL" &&
          (t.subscriptionPlan === "PRO" || t.subscriptionPlan === "ENTERPRISE");
      } else if (activeFilter === "trial") {
        matchesCategory = t.subscriptionStatus === "TRIAL";
      } else if (activeFilter === "expired") {
        matchesCategory = t.subscriptionStatus === "EXPIRED" || t.daysRemaining <= 0;
      }

      // 2. Search query
      const q = search.toLowerCase();
      const matchesSearch =
        t.name.toLowerCase().includes(q) ||
        (t.brandName && t.brandName.toLowerCase().includes(q)) ||
        t.slug.toLowerCase().includes(q) ||
        (t.ownerName && t.ownerName.toLowerCase().includes(q)) ||
        (t.ownerPhone && t.ownerPhone.includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [tenants, activeFilter, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTenants.length / ITEMS_PER_PAGE));
  const paginatedTenants = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTenants.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTenants, currentPage]);

  const handleFilterChange = (filter: FilterCategory) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const getPlanBadge = (plan: SubscriptionPlan | null, status: SubscriptionStatus) => {
    if (status === "TRIAL") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#EEF6FE] text-[#1A73E8] text-[11px] font-semibold whitespace-nowrap">
          Trial 14 Hari
        </span>
      );
    }

    switch (plan) {
      case "ENTERPRISE":
      case "PRO":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#FEF3EB] text-[#D97706] text-[11px] font-semibold whitespace-nowrap">
            Paket Pro
          </span>
        );
      case "REGULER":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#EFECE6] text-[#706E68] text-[11px] font-semibold whitespace-nowrap">
            Paket Reguler
          </span>
        );
    }
  };

  const getStatusBadge = (status: SubscriptionStatus, daysRemaining: number) => {
    if (status === "EXPIRED" || daysRemaining <= 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#FDF0F2] text-[#D93025] text-[11px] font-semibold whitespace-nowrap">
          Kedaluwarsa
        </span>
      );
    }

    if (daysRemaining <= 3) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#FDF0F2] text-[#D93025] text-[11px] font-semibold whitespace-nowrap">
          Segera Habis
        </span>
      );
    }

    if (status === "TRIAL") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#EEF6FE] text-[#1A73E8] text-[11px] font-semibold whitespace-nowrap">
          Masa Trial
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#E8F7EE] text-[#1E8E3E] text-[11px] font-semibold whitespace-nowrap">
        Aktif
      </span>
    );
  };

  const formatExpiryDate = (t: TenantManagementItem) => {
    const rawDate =
      t.subscriptionStatus === "ACTIVE" && t.subscriptionEndsAt
        ? t.subscriptionEndsAt
        : t.trialEndsAt;

    const dateStr = new Date(rawDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    let countdownColor = "text-[#1E8E3E]";
    let countdownLabel = `${t.daysRemaining} Hari lagi`;

    if (t.subscriptionStatus === "EXPIRED" || t.daysRemaining <= 0) {
      countdownColor = "text-[#D93025] font-bold";
      countdownLabel = "Kedaluwarsa";
    } else if (t.daysRemaining === 1) {
      countdownColor = "text-[#D93025] font-bold";
      countdownLabel = "Besok Habis";
    } else if (t.daysRemaining <= 3) {
      countdownColor = "text-[#D93025] font-semibold";
      countdownLabel = `${t.daysRemaining} Hari lagi`;
    } else if (t.daysRemaining <= 7) {
      countdownColor = "text-[#D97706] font-medium";
      countdownLabel = `${t.daysRemaining} Hari lagi`;
    }

    return {
      dateStr,
      countdownLabel,
      countdownColor,
    };
  };

  const getWhatsAppReminderUrl = (t: TenantManagementItem) => {
    if (!t.ownerPhone) return "#";
    let phone = t.ownerPhone.replace(/\D/g, "");
    if (phone.startsWith("0")) {
      phone = "62" + phone.slice(1);
    } else if (!phone.startsWith("62")) {
      phone = "62" + phone;
    }

    const brand = t.brandName || t.name;
    const expiry = formatExpiryDate(t);
    const message = encodeURIComponent(
      `Halo Kak ${t.ownerName || ""}, perkenalkan kami dari Tim Tim Cukurin SaaS. Kami menginformasikan bahwa masa aktif akun barbershop "${brand}" akan berakhir pada ${expiry.dateStr} (${expiry.countdownLabel}). Mohon segera perpanjang langganan agar operasional antrean kasir tidak terputus. Terima kasih! 🙏`
    );

    return `https://wa.me/${phone}?text=${message}`;
  };

  return (
    <section className="bg-white rounded-2xl border border-[#E8E5DE] p-4 sm:p-6 shadow-[0_1px_3px_0px_rgba(28,25,23,0.02)] space-y-4">
      {/* Table Header & Category Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#1A1A1A]">
            Direktori Barbershop Terdaftar
          </h2>
          <p className="text-xs text-[#706E68] mt-0.5">
            Monitoring real-time kuota kursi, lisensi aktif, dan kontak langsung owner barbershop
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Pill Category Filter Switcher */}
          <div className="inline-flex bg-[#EFECE6] p-1 rounded-full gap-1 overflow-x-auto max-w-full scrollbar-none">
            <button
              onClick={() => handleFilterChange("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                activeFilter === "all"
                  ? "bg-[#1A1A1A] text-white font-semibold shadow-xs"
                  : "text-[#706E68] hover:text-[#1A1A1A] font-medium"
              }`}
              type="button"
            >
              Semua Toko ({counts.all})
            </button>
            <button
              onClick={() => handleFilterChange("reguler")}
              className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                activeFilter === "reguler"
                  ? "bg-[#1A1A1A] text-white font-semibold shadow-xs"
                  : "text-[#706E68] hover:text-[#1A1A1A] font-medium"
              }`}
              type="button"
            >
              Paket Reguler ({counts.reguler})
            </button>
            <button
              onClick={() => handleFilterChange("pro")}
              className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                activeFilter === "pro"
                  ? "bg-[#1A1A1A] text-white font-semibold shadow-xs"
                  : "text-[#706E68] hover:text-[#1A1A1A] font-medium"
              }`}
              type="button"
            >
              Paket Pro ({counts.pro})
            </button>
            <button
              onClick={() => handleFilterChange("trial")}
              className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                activeFilter === "trial"
                  ? "bg-[#1A1A1A] text-white font-semibold shadow-xs"
                  : "text-[#706E68] hover:text-[#1A1A1A] font-medium"
              }`}
              type="button"
            >
              Masa Trial ({counts.trial})
            </button>
            <button
              onClick={() => handleFilterChange("expired")}
              className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                activeFilter === "expired"
                  ? "bg-[#1A1A1A] text-white font-semibold shadow-xs"
                  : "text-[#706E68] hover:text-[#1A1A1A] font-medium"
              }`}
              type="button"
            >
              Kedaluwarsa ({counts.expired})
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#706E68] pointer-events-none" />
            <input
              type="text"
              placeholder="Cari barbershop, owner, slug..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 rounded-full bg-[#F6F5F2] border border-[#E8E5DE] text-xs text-[#1A1A1A] focus:outline-none focus:border-[#111111] placeholder:text-[#A8A59E]"
            />
          </div>
        </div>
      </div>

      {/* Desktop View Table */}
      <div className="hidden lg:block overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
        <table className="w-full text-left min-w-[960px] border-collapse">
          <thead>
            <tr className="bg-[#EFECE6]/70 text-[#706E68] text-[11px] uppercase tracking-wider font-semibold border-b border-[#E8E5DE]">
              <th className="py-3 px-4 rounded-l-xl">Nama Barbershop</th>
              <th className="py-3 px-4">Owner &amp; Kontak</th>
              <th className="py-3 px-4">Paket SaaS</th>
              <th className="py-3 px-4">Jumlah Barber</th>
              <th className="py-3 px-4">Masa Aktif / Jatuh Tempo</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 rounded-r-xl text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E5DE]/80 text-xs">
            {paginatedTenants.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#706E68]">
                  Tidak ada barbershop yang cocok dengan filter atau kriteria pencarian.
                </td>
              </tr>
            ) : (
              paginatedTenants.map((t) => {
                const expiry = formatExpiryDate(t);
                const isExpiringSoon = t.daysRemaining <= 3 || t.subscriptionStatus === "EXPIRED";

                return (
                  <tr
                    key={t.id}
                    className="group hover:bg-[#F6F5F2]/80 transition-colors"
                  >
                    {/* 1. Barbershop / Brand */}
                    <td className="py-4 px-4 font-semibold text-[#1A1A1A]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#EFECE6] flex items-center justify-center shrink-0 border border-[#E8E5DE]">
                          <Scissors className="w-4 h-4 text-[#1A1A1A]" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="truncate font-semibold text-[#1A1A1A]">
                            {t.brandName || t.name}
                          </span>
                          <span className="text-[11px] text-[#A8A59E] uppercase font-mono mt-0.5">
                            ID: {t.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Owner & Kontak */}
                    <td className="py-4 px-4">
                      <div className="text-[#1A1A1A] font-medium">
                        {t.ownerName || "Owner Barbershop"}
                      </div>
                      <div className="text-[#706E68] text-[11px] mt-0.5 font-mono">
                        {t.ownerPhone || "-"}
                      </div>
                    </td>

                    {/* 3. Paket SaaS */}
                    <td className="py-4 px-4">
                      {getPlanBadge(t.subscriptionPlan, t.subscriptionStatus)}
                    </td>

                    {/* 4. Kuota Barber */}
                    <td className="py-4 px-4 text-[#1A1A1A]">
                      <span className="font-medium">
                        {t.barbersCount !== undefined ? t.barbersCount : t.usersCount} Barber
                      </span>
                      <span className="text-[#A8A59E] text-[11px] block mt-0.5">
                        Maks. {t.maxBarbers || 5} slot
                      </span>
                    </td>

                    {/* 5. Masa Aktif */}
                    <td className="py-4 px-4">
                      <div className="text-[#1A1A1A] font-medium">
                        {expiry.dateStr}
                      </div>
                      <div className={`${expiry.countdownColor} text-[11px] mt-0.5`}>
                        {expiry.countdownLabel}
                      </div>
                    </td>

                    {/* 6. Status */}
                    <td className="py-4 px-4">
                      {getStatusBadge(t.subscriptionStatus, t.daysRemaining)}
                    </td>

                    {/* 7. Aksi */}
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        {/* Reminder WA button (if expiring soon or expired) */}
                        {isExpiringSoon && t.ownerPhone && t.ownerPhone !== "-" && (
                          <a
                            href={getWhatsAppReminderUrl(t)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Kirim Reminder WhatsApp ke Owner"
                            className="h-8 px-3 rounded-full bg-[#FEF3EB] hover:bg-[#FDE6D2] text-[#D97706] text-xs font-semibold transition-colors flex items-center gap-1 border border-[#FDE6D2]"
                          >
                            <Send className="w-3 h-3" />
                            <span>Reminder WA</span>
                          </a>
                        )}

                        {/* Perpanjang Manual Button */}
                        <button
                          onClick={() => setSelectedTenant(t)}
                          className="h-8 px-3.5 rounded-full bg-[#EFECE6] hover:bg-[#E2DDD3] text-xs font-semibold text-[#1A1A1A] transition-colors border border-[#E8E5DE] cursor-pointer flex items-center gap-1"
                          type="button"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#1A1A1A]" />
                          <span>Perpanjang</span>
                        </button>

                        {/* View Outlets / Open Link */}
                        <a
                          href={`/${t.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-[#EFECE6] text-[#706E68] hover:text-[#1A1A1A] hover:bg-[#E2DDD3] flex items-center justify-center transition-colors border border-[#E8E5DE]"
                          title="Buka Halaman Outlet"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile / Tablet Card View */}
      <div className="lg:hidden space-y-3 pt-2">
        {paginatedTenants.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#706E68] bg-[#F6F5F2] rounded-2xl border border-[#E8E5DE]">
            Tidak ada barbershop yang cocok dengan filter atau kriteria pencarian.
          </div>
        ) : (
          paginatedTenants.map((t) => {
            const expiry = formatExpiryDate(t);
            const isExpiringSoon = t.daysRemaining <= 3 || t.subscriptionStatus === "EXPIRED";

            return (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-[#F6F5F2] border border-[#E8E5DE] space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EFECE6] flex items-center justify-center shrink-0 border border-[#E8E5DE]">
                      <Scissors className="w-4 h-4 text-[#1A1A1A]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1A1A1A]">
                        {t.brandName || t.name}
                      </h4>
                      <p className="text-[11px] text-[#706E68] font-mono">/{t.slug}</p>
                    </div>
                  </div>
                  <div>{getPlanBadge(t.subscriptionPlan, t.subscriptionStatus)}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 py-2 border-y border-[#E8E5DE] text-xs">
                  <div>
                    <span className="text-[#A8A59E] block text-[10px] uppercase font-semibold">
                      Owner
                    </span>
                    <span className="font-medium text-[#1A1A1A]">
                      {t.ownerName || "Owner Barbershop"}
                    </span>
                    <span className="text-[#706E68] font-mono block text-[11px]">
                      {t.ownerPhone || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#A8A59E] block text-[10px] uppercase font-semibold">
                      Kapasitas
                    </span>
                    <span className="font-medium text-[#1A1A1A]">
                      {t.barbersCount !== undefined ? t.barbersCount : t.usersCount} Barber
                    </span>
                    <span className="text-[#706E68] block text-[11px]">
                      Maks. {t.maxBarbers || 5} slot
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="text-[#706E68] text-[11px] block">Jatuh Tempo:</span>
                    <span className="font-medium text-[#1A1A1A]">{expiry.dateStr}</span>
                    <span className={`block text-[11px] ${expiry.countdownColor}`}>
                      {expiry.countdownLabel}
                    </span>
                  </div>
                  <div>{getStatusBadge(t.subscriptionStatus, t.daysRemaining)}</div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E8E5DE]">
                  {isExpiringSoon && t.ownerPhone && t.ownerPhone !== "-" && (
                    <a
                      href={getWhatsAppReminderUrl(t)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 px-3 rounded-full bg-[#FEF3EB] hover:bg-[#FDE6D2] text-[#D97706] text-xs font-semibold transition-colors flex items-center gap-1 border border-[#FDE6D2]"
                    >
                      <Send className="w-3 h-3" />
                      <span>Reminder WA</span>
                    </a>
                  )}

                  <button
                    onClick={() => setSelectedTenant(t)}
                    className="h-8 px-3.5 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    type="button"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Perpanjang</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#E8E5DE] text-xs text-[#706E68]">
        <div>
          Menampilkan{" "}
          <span className="font-semibold text-[#1A1A1A]">
            {filteredTenants.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredTenants.length)}
          </span>{" "}
          dari <span className="font-semibold text-[#1A1A1A]">{filteredTenants.length}</span>{" "}
          barbershop terdaftar
        </div>

        <div className="flex items-center gap-1.5 self-center sm:self-auto">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-8 px-3 rounded-full bg-[#EFECE6] hover:bg-[#E2DDD3] text-[#1A1A1A] font-medium text-xs transition-colors border border-[#E8E5DE] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            type="button"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Sebelumnya</span>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`h-8 w-8 rounded-full font-semibold text-xs flex items-center justify-center transition-colors cursor-pointer ${
                currentPage === pageNum
                  ? "bg-[#1A1A1A] text-white shadow-2xs"
                  : "bg-[#EFECE6] hover:bg-[#E2DDD3] text-[#1A1A1A] border border-[#E8E5DE]"
              }`}
              type="button"
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="h-8 px-3 rounded-full bg-[#EFECE6] hover:bg-[#E2DDD3] text-[#1A1A1A] font-medium text-xs transition-colors border border-[#E8E5DE] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            type="button"
          >
            <span>Berikutnya</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Modal Perpanjangan Manual */}
      <ExtendSubscriptionModal
        tenant={selectedTenant}
        onClose={() => setSelectedTenant(null)}
        onSuccess={() => {
          setSelectedTenant(null);
        }}
      />
    </section>
  );
}
