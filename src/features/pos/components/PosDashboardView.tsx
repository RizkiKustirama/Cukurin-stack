"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Receipt,
  Plus,
  Scissors,
  ShoppingBag,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  LayoutDashboard,
  Users,
} from "lucide-react";
import Link from "next/link";
import { formatRupiah, formatWIB } from "@/shared/lib/formatters";
import type {
  ActiveBarberOption,
  TicketWithRelations,
  ServiceStatus,
  PaymentStatus,
} from "../types";
import { PosTransactionForm } from "./PosTransactionForm";
import { QuickTicketSheet } from "./QuickTicketSheet";
import { PaymentModal } from "./PaymentModal";
import { cancelTicketAction } from "../actions/ticketActions";

export interface PosDashboardViewProps {
  storeId: string;
  storeSlug: string;
  cashierName: string;
  cashierRole: string;
  initialServices: Array<{
    id: string;
    name: string;
    price: number;
    durationMinutes: number;
    description: string | null;
  }>;
  initialProducts: Array<{
    id: string;
    name: string;
    sellingPrice: number;
    stockQuantity: number;
  }>;
  initialBarbers: ActiveBarberOption[];
  initialTickets: TicketWithRelations[];
}

export const PosDashboardView: React.FC<PosDashboardViewProps> = ({
  storeId,
  storeSlug,
  cashierName,
  cashierRole,
  initialServices,
  initialProducts,
  initialBarbers,
  initialTickets,
}) => {
  const router = useRouter();

  // State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedTicketForPayment, setSelectedTicketForPayment] =
    useState<TicketWithRelations | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<"ALL" | "UNPAID" | "ACTIVE">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const handleRefresh = () => {
    router.refresh();
  };

  const handleOpenPayment = (ticket: TicketWithRelations) => {
    setSelectedTicketForPayment(ticket);
    setIsPaymentModalOpen(true);
  };

  const handleCancelTicket = async (ticketId: string) => {
    if (confirm("Apakah Anda yakin ingin membatalkan tiket antrean ini?")) {
      const res = await cancelTicketAction(ticketId, "Dibatalkan oleh kasir");
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error);
      }
    }
  };

  // Filtered tickets
  const filteredTickets = initialTickets.filter((t) => {
    // Tab filter
    if (filterTab === "UNPAID" && t.paymentStatus === "PAID") return false;
    if (filterTab === "ACTIVE" && (t.serviceStatus === "COMPLETED" || t.serviceStatus === "CANCELLED"))
      return false;

    // Search query filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchNum = t.ticketNumber.toLowerCase().includes(q);
      const matchCustomer = t.customer?.name.toLowerCase().includes(q);
      const matchPhone = t.customer?.phone.includes(q);
      return matchNum || matchCustomer || matchPhone;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#F6F5F2] pb-24 md:pb-12 text-[#1A1A1A] p-4 sm:p-6 lg:p-8">
      {/* 1. HEADER KASIR */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-[#E8E5DE] rounded-2xl shadow-[0_1px_3px_rgba(28,25,23,0.02)] mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#FFF5EB] border border-[#FDE6D2] flex items-center justify-center text-[#D97706]">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#1A1A1A]">
                POS & Kasir Barbershop
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF5EB] text-[#D97706] border border-[#FDE6D2]">
                {cashierRole}
              </span>
            </div>
            <p className="text-xs text-[#706E68]">
              Cabang: <span className="text-[#1A1A1A] font-mono font-semibold">/{storeSlug}</span> • Kasir: {cashierName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2.5 rounded-full bg-white hover:bg-[#F6F5F2] border border-[#E8E5DE] text-xs text-[#706E68] font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="Muat ulang data"
          >
            <RefreshCw className="w-4 h-4 text-[#706E68]" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {(cashierRole === "OWNER" || cashierRole === "MANAGER") && (
            <Link
              href={`/${storeSlug}/dashboard`}
              className="px-3.5 py-2 rounded-full bg-white hover:bg-[#F6F5F2] border border-[#E8E5DE] text-xs text-[#1A1A1A] font-medium flex items-center gap-1.5 transition"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Dashboard</span>
            </Link>
          )}

          <Link
            href={`/${storeSlug}/queue`}
            className="px-3.5 py-2 rounded-full bg-white hover:bg-[#F6F5F2] border border-[#E8E5DE] text-xs text-[#1A73E8] font-medium flex items-center gap-1.5 transition"
          >
            <Users className="w-3.5 h-3.5 text-[#1A73E8]" />
            <span>Display Antrean</span>
          </Link>

          <Link
            href="/logout"
            prefetch={false}
            className="px-3.5 py-2 rounded-full bg-[#FDF0F2] hover:bg-[#FCDAD7] border border-[#FCDAD7] text-[#D93025] text-xs font-medium flex items-center gap-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </Link>
        </div>
      </header>

      {/* 2. BAR STATUS BARBER HORIZONTAL (Swipeable Carousel) */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#706E68] flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Status Meja Barber Hari Ini ({initialBarbers.length})</span>
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {initialBarbers.map((b) => {
            const isReady = b.workStatus === "READY";
            const isBusy = b.workStatus === "BUSY";
            const isBreak = b.workStatus === "BREAK";

            let borderClass = "border-[#E8E5DE]";
            let badgeBg = "bg-[#F6F5F2] text-[#706E68] border-[#E8E5DE]";
            let statusText = "Libur";

            if (isReady) {
              borderClass = "border-[#CEEAD6] bg-[#E8F7EE]/30";
              badgeBg = "bg-[#E8F7EE] text-[#1E8E3E] border-[#CEEAD6]";
              statusText = "Siap Cukur";
            } else if (isBusy) {
              borderClass = "border-[#FCDAD7] bg-[#FDF0F2]/30";
              badgeBg = "bg-[#FDF0F2] text-[#D93025] border-[#FCDAD7]";
              statusText = "Sedang Potong";
            } else if (isBreak) {
              borderClass = "border-[#FDE6D2] bg-[#FEF3EB]/30";
              badgeBg = "bg-[#FEF3EB] text-[#D97706] border-[#FDE6D2]";
              statusText = "Istirahat";
            }

            return (
              <div
                key={b.id}
                className={`p-3 rounded-2xl border min-w-[155px] sm:min-w-[175px] bg-white flex flex-col justify-between shrink-0 shadow-[0_1px_3px_rgba(28,25,23,0.02)] ${borderClass}`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#F6F5F2] border border-[#E8E5DE] flex items-center justify-center font-bold text-xs text-[#1A1A1A]">
                      {b.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-sm text-[#1A1A1A] truncate">
                      {b.name}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeBg}`}
                  >
                    {statusText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. LAYOUT DUA KOLOM DI DESKTOP / SATU KOLOM DI MOBILE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* KOLOM KIRI: DAFTAR TIKET TRANSAKSI HARI INI */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filter & Search Bar */}
          <div className="p-4 bg-white border border-[#E8E5DE] rounded-2xl shadow-[0_1px_3px_rgba(28,25,23,0.02)] space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
              {/* Filter Tabs */}
              <div className="flex gap-1 p-1 bg-[#F6F5F2] rounded-full border border-[#E8E5DE]">
                <button
                  type="button"
                  onClick={() => setFilterTab("ALL")}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                    filterTab === "ALL"
                      ? "bg-[#111111] text-white shadow-2xs"
                      : "text-[#706E68] hover:text-[#1A1A1A]"
                  }`}
                >
                  Semua ({initialTickets.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("UNPAID")}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                    filterTab === "UNPAID"
                      ? "bg-[#111111] text-white shadow-2xs"
                      : "text-[#706E68] hover:text-[#1A1A1A]"
                  }`}
                >
                  Belum Lunas (
                  {initialTickets.filter((t) => t.paymentStatus !== "PAID").length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("ACTIVE")}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                    filterTab === "ACTIVE"
                      ? "bg-[#111111] text-white shadow-2xs"
                      : "text-[#706E68] hover:text-[#1A1A1A]"
                  }`}
                >
                  Sedang Antre (
                  {
                    initialTickets.filter(
                      (t) =>
                        t.serviceStatus === "WAITING" ||
                        t.serviceStatus === "IN_SERVICE"
                    ).length
                  }
                  )
                </button>
              </div>

              {/* Search Box */}
              <div className="relative flex-1 sm:max-w-xs">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari No. Tiket / Pelanggan..."
                  className="w-full px-3 py-1.5 pl-8 bg-[#F6F5F2] border border-[#E8E5DE] focus:border-[#111111] rounded-full text-xs text-[#1A1A1A] placeholder-[#A8A59E] focus:outline-none transition"
                />
                <Search className="w-3.5 h-3.5 text-[#706E68] absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* List Tiket */}
          <div className="space-y-3">
            {filteredTickets.length === 0 ? (
              <div className="p-10 bg-white border border-[#E8E5DE] rounded-2xl text-center space-y-2 text-[#706E68] shadow-[0_1px_3px_rgba(28,25,23,0.02)]">
                <Receipt className="w-8 h-8 mx-auto text-[#A8A59E]" />
                <p className="text-sm font-medium text-[#1A1A1A]">Belum ada transaksi tiket yang cocok.</p>
                <p className="text-xs text-[#706E68]">
                  Gunakan tombol &quot;Buat Tiket&quot; untuk memulai transaksi pelanggan baru.
                </p>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isPaid = ticket.paymentStatus === "PAID";
                const isWaiting = ticket.serviceStatus === "WAITING";
                const isInService = ticket.serviceStatus === "IN_SERVICE";
                const isCompleted = ticket.serviceStatus === "COMPLETED";
                const isCancelled = ticket.serviceStatus === "CANCELLED";

                return (
                  <div
                    key={ticket.id}
                    className="p-4 bg-white border border-[#E8E5DE] hover:border-[#D5D1C8] rounded-2xl shadow-[0_1px_3px_rgba(28,25,23,0.02)] transition space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#1A1A1A] text-sm">
                            {ticket.ticketNumber}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              isPaid
                                ? "bg-[#E8F7EE] text-[#1E8E3E] border-[#CEEAD6]"
                                : "bg-[#FEF3EB] text-[#D97706] border-[#FDE6D2]"
                            }`}
                          >
                            {isPaid ? "LUNAS" : "BELUM LUNAS"}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              isInService
                                ? "bg-[#FDF0F2] text-[#D93025] border-[#FCDAD7]"
                                : isWaiting
                                ? "bg-[#FEF3EB] text-[#D97706] border-[#FDE6D2]"
                                : isCompleted
                                ? "bg-[#E8F7EE] text-[#1E8E3E] border-[#CEEAD6]"
                                : "bg-[#F6F5F2] text-[#706E68] border-[#E8E5DE]"
                            }`}
                          >
                            {ticket.serviceStatus}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-xs text-[#1A1A1A]">
                          <User className="w-3.5 h-3.5 text-[#706E68]" />
                          <span className="font-semibold">
                            {ticket.customer?.name || "Pelanggan Guest"}
                          </span>
                          {ticket.customer?.phone && (
                            <span className="text-[#706E68]">
                              • {ticket.customer.phone}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-bold text-[#1A1A1A] font-mono block">
                          {formatRupiah(Number(ticket.totalAmount))}
                        </span>
                        <span className="text-[11px] text-[#706E68]">
                          {formatWIB(ticket.createdAt, { timeStyle: "short" })}
                        </span>
                      </div>
                    </div>

                    {/* Barber & Items Summary */}
                    <div className="p-2.5 bg-[#F6F5F2] border border-[#E8E5DE] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Scissors className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                        <span className="text-[#706E68]">Barber:</span>
                        <span className="font-medium text-[#1A1A1A]">
                          {ticket.assignedBarber?.user?.name ||
                            ticket.requestedBarber?.user?.name ||
                            "Siapa Saja (Antrean Bebas)"}
                        </span>
                      </div>

                      <div className="text-[#706E68] truncate max-w-xs">
                        {ticket.items.map((i) => i.itemName).join(", ")}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#E8E5DE]">
                      {!isPaid && !isCancelled && (
                        <button
                          type="button"
                          onClick={() => handleOpenPayment(ticket)}
                          className="px-3.5 py-1.5 rounded-full bg-[#111111] hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                        >
                          <Banknote className="w-3.5 h-3.5" />
                          <span>Pelunasan Kasir</span>
                        </button>
                      )}

                      {!isCompleted && !isCancelled && (
                        <button
                          type="button"
                          onClick={() => handleCancelTicket(ticket.id)}
                          className="px-2.5 py-1.5 rounded-full text-[#706E68] hover:text-[#D93025] hover:bg-[#FDF0F2] text-xs font-medium transition cursor-pointer"
                        >
                          Batalkan
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* KOLOM KANAN: FORM TRANSAKSI DESKTOP (EMBEDDED) */}
        <div className="hidden lg:block lg:col-span-5 sticky top-6">
          <div className="p-5 bg-white border border-[#E8E5DE] rounded-[24px] shadow-[0_1px_3px_rgba(28,25,23,0.02)] space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#E8E5DE]">
              <div className="w-8 h-8 rounded-xl bg-[#FFF5EB] border border-[#FDE6D2] flex items-center justify-center text-[#D97706]">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1A1A1A]">
                  Buat Tiket Baru
                </h3>
                <p className="text-[11px] text-[#706E68]">
                  Transaksi kasir cepat & pendaftaran antrean
                </p>
              </div>
            </div>

            <PosTransactionForm
              storeId={storeId}
              initialServices={initialServices}
              initialProducts={initialProducts}
              initialBarbers={initialBarbers}
              onSuccess={() => {
                router.refresh();
              }}
            />
          </div>
        </div>
      </div>

      {/* 4. FLOATING ACTION BUTTON (MOBILE ONLY) */}
      <div className="fixed bottom-6 right-6 md:hidden z-40">
        <button
          type="button"
          onClick={() => setIsSheetOpen(true)}
          className="h-14 px-6 rounded-full bg-[#111111] hover:bg-black text-white font-bold text-sm shadow-xl flex items-center gap-2 border border-black/10 transition transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>Buat Tiket / Beli Produk</span>
        </button>
      </div>

      {/* 5. QUICK TICKET BOTTOM SHEET (MOBILE) */}
      <QuickTicketSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        storeId={storeId}
        initialServices={initialServices}
        initialProducts={initialProducts}
        initialBarbers={initialBarbers}
        onSuccess={() => {
          router.refresh();
        }}
      />

      {/* 6. MODAL PELUNASAN KASIR */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedTicketForPayment(null);
        }}
        ticket={selectedTicketForPayment}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
};
