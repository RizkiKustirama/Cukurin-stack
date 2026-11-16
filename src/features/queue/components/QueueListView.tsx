"use client";

import React, { useState } from "react";
import {
  Clock,
  UserCheck,
  ChevronRight,
  Sparkles,
  Phone,
  Scissors,
  CheckCircle,
  Loader2,
  CreditCard,
} from "lucide-react";
import type { QueueItemTicket, BarberWithUser } from "../types";

export interface QueueItemData {
  id: string;
  ticketNumber: string;
  customerName: string;
  serviceNames: string[];
  waitingMinutes: number;
  totalAmount: number;
  requestedBarberName?: string | null;
  assignedBarberName?: string | null;
}

export interface QueueListViewProps {
  waitingTickets?: QueueItemTicket[];
  queueItems?: QueueItemData[];
  availableBarbers?: BarberWithUser[];
  onAssignBarber?: (ticketId: string) => void;
  onAssignManual?: (ticketId: string, barberId: string) => Promise<void> | void;
  onPayTicket?: (ticketId: string) => void;
  onCallCustomer?: (ticket: QueueItemTicket | QueueItemData) => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Calculate waiting time in minutes from a ticket's createdAt.
 */
function getWaitingMinutes(createdAt: Date | string): number {
  const createdMs = new Date(createdAt).getTime();
  if (isNaN(createdMs)) return 0;
  const diffMs = Date.now() - createdMs;
  return Math.max(0, Math.floor(diffMs / 60000));
}

interface NormalizedQueueItem {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerPhone?: string | null;
  serviceName: string;
  waitingMinutes: number;
  requestedBarberName?: string | null;
  rawTicket?: QueueItemTicket;
}

export function QueueListView({
  waitingTickets,
  queueItems,
  availableBarbers = [],
  onAssignBarber,
  onAssignManual,
  onPayTicket,
  onCallCustomer,
  isLoading = false,
  className = "",
}: QueueListViewProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  // Normalize input from either waitingTickets or queueItems
  const items: NormalizedQueueItem[] = React.useMemo(() => {
    if (waitingTickets && waitingTickets.length > 0) {
      return waitingTickets.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        customerName: t.customer?.name || "Pelanggan Walk-in",
        customerPhone: t.customer?.phone,
        serviceName:
          t.items && t.items.length > 0
            ? t.items.map((i) => i.itemName).join(", ")
            : "Potong Rambut Reguler",
        waitingMinutes: getWaitingMinutes(t.createdAt),
        requestedBarberName:
          t.requestedBarber?.user?.name || (t.requestedBarberId ? "Barber Khusus" : null),
        rawTicket: t,
      }));
    }

    if (queueItems && queueItems.length > 0) {
      return queueItems.map((q) => ({
        id: q.id,
        ticketNumber: q.ticketNumber,
        customerName: q.customerName,
        serviceName:
          q.serviceNames && q.serviceNames.length > 0
            ? q.serviceNames.join(", ")
            : "Layanan Cukur",
        waitingMinutes: q.waitingMinutes,
        requestedBarberName: q.requestedBarberName,
      }));
    }

    return [];
  }, [waitingTickets, queueItems]);

  const handleManualAssign = async (ticketId: string, barberId: string) => {
    if (!onAssignManual) return;
    try {
      setAssigningId(ticketId);
      await onAssignManual(ticketId, barberId);
      setSelectedTicketId(null);
    } catch (err) {
      console.error("Gagal menugaskan tiket:", err);
    } finally {
      setAssigningId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className={`bg-white border border-[#E8E5DE] rounded-2xl p-8 text-center space-y-3 shadow-[0_1px_3px_rgba(28,25,23,0.02)] ${className}`}>
        <div className="w-12 h-12 rounded-full bg-[#E8F7EE] border border-[#CEEAD6] flex items-center justify-center text-[#1E8E3E] mx-auto">
          <CheckCircle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-[#1A1A1A]">
          Ruang Tunggu Santai (Antrean Kosong)
        </h4>
        <p className="text-xs text-[#706E68] max-w-sm mx-auto">
          Semua pelanggan telah terlayani di meja potong atau belum ada tiket menunggu yang dibuat kasir.
        </p>
      </div>
    );
  }

  const readyBarbers = availableBarbers.filter((b) => b.workStatus === "READY");

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs text-[#706E68] px-1">
        <span>
          Menunggu: <strong className="text-[#1A1A1A] font-semibold">{items.length} Orang</strong>
        </span>
        {availableBarbers.length > 0 && (
          <span>
            Barber Siap: <strong className="text-[#1E8E3E] font-semibold">{readyBarbers.length} Kursi</strong>
          </span>
        )}
      </div>

      {/* List Tiket Menunggu */}
      <div className="space-y-2.5">
        {items.map((item, index) => {
          const isAssignedSelected = selectedTicketId === item.id;
          const isBusyAssigning = assigningId === item.id;

          return (
            <div
              key={item.id}
              className={`bg-white border rounded-2xl p-3.5 sm:p-4 transition-all shadow-[0_1px_3px_rgba(28,25,23,0.02)] ${
                isAssignedSelected
                  ? "border-[#D97706] ring-1 ring-[#D97706]/30"
                  : "border-[#E8E5DE] hover:border-[#D5D1C8]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Info Utama Antrean */}
                <div className="flex items-start gap-3 min-w-0">
                  {/* Badge Urutan */}
                  <div className="w-10 h-10 rounded-xl bg-[#F6F5F2] border border-[#E8E5DE] flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] text-[#706E68] leading-none">Antre</span>
                    <span className="text-xs font-bold text-[#1A1A1A]">#{index + 1}</span>
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#1A1A1A] bg-[#F6F5F2] px-2 py-0.5 rounded-md border border-[#E8E5DE]">
                        {item.ticketNumber}
                      </span>

                      {/* Request Badge */}
                      {item.requestedBarberName ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3EB] border border-[#FDE6D2] text-[#D97706]">
                          <Sparkles className="w-3 h-3 text-[#D97706]" />
                          Request: {item.requestedBarberName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EEF6FE] border border-[#D3E3FD] text-[#1A73E8]">
                          Bebas (Siapa Saja)
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-[#1A1A1A] truncate">
                      {item.customerName}
                    </h4>

                    <p className="text-xs text-[#706E68] truncate">
                      {item.serviceName}
                    </p>

                    {item.customerPhone && (
                      <p className="text-[11px] text-[#706E68] flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#706E68]" />
                        <span>{item.customerPhone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Tunggu & Tombol Aksi */}
                <div className="text-right flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-1 text-xs font-mono text-[#706E68] bg-[#F6F5F2] px-2.5 py-1 rounded-full border border-[#E8E5DE]">
                    <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>{item.waitingMinutes} mnt</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {/* Tombol Panggil Antrean ke Barber (Callback onAssignBarber) */}
                    {onAssignBarber && (
                      <button
                        type="button"
                        onClick={() => onAssignBarber(item.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#111111] hover:bg-black text-white shadow-sm transition-all cursor-pointer"
                      >
                        <Scissors className="w-3.5 h-3.5" />
                        <span>Panggil</span>
                      </button>
                    )}

                    {/* Tombol Assign Manual Dropdown */}
                    {onAssignManual && (
                      <button
                        type="button"
                        disabled={isLoading || isBusyAssigning}
                        onClick={() =>
                          setSelectedTicketId(isAssignedSelected ? null : item.id)
                        }
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-[#F6F5F2] border border-[#E8E5DE] text-[#1A1A1A] transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Scissors className="w-3.5 h-3.5" />
                        <span>Pilih Meja</span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-transform ${
                            isAssignedSelected ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                    )}

                    {/* Tombol Bayar Duluan / Kasir */}
                    {onPayTicket && (
                      <button
                        type="button"
                        onClick={() => onPayTicket(item.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-[#FEF3EB] hover:bg-[#FDE6D2] border border-[#FDE6D2] text-[#D97706] transition-colors cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-[#D97706]" />
                        <span>Bayar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Sub-menu Pilihan Meja / Barber untuk Assign Manual */}
              {isAssignedSelected && onAssignManual && (
                <div className="mt-3.5 pt-3.5 border-t border-[#E8E5DE] space-y-2 animate-in fade-in duration-200">
                  <p className="text-xs font-semibold text-[#1A1A1A]">
                    Pilih Meja/Barber untuk Pelanggan Ini:
                  </p>

                  {availableBarbers.length === 0 ? (
                    <p className="text-xs text-[#706E68] italic">
                      Tidak ada data barber siap untuk penugasan langsung.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {availableBarbers.map((barber) => {
                        const isReady = barber.workStatus === "READY";
                        return (
                          <button
                            key={barber.id}
                            type="button"
                            disabled={isBusyAssigning}
                            onClick={() => handleManualAssign(item.id, barber.id)}
                            className={`p-2.5 rounded-xl border text-left text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                              isReady
                                ? "bg-[#E8F7EE] border-[#CEEAD6] hover:bg-[#CEEAD6]/50 text-[#1E8E3E]"
                                : "bg-[#F6F5F2] border-[#E8E5DE] hover:bg-[#EFECE6] text-[#706E68]"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <UserCheck
                                className={`w-4 h-4 shrink-0 ${
                                  isReady ? "text-[#1E8E3E]" : "text-[#706E68]"
                                }`}
                              />
                              <span className="font-semibold truncate text-[#1A1A1A]">
                                {barber.user.name}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 font-medium ${
                                isReady
                                  ? "bg-white text-[#1E8E3E] border border-[#CEEAD6]"
                                  : "bg-white text-[#706E68] border border-[#E8E5DE]"
                              }`}
                            >
                              {isReady ? "Siap" : barber.workStatus}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {isBusyAssigning && (
                    <div className="flex items-center justify-center gap-2 text-xs text-[#D97706] pt-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menempatkan pelanggan ke meja...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default QueueListView;
