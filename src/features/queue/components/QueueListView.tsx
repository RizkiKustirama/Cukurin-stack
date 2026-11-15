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
      <div className={`bg-[#221f1b] border border-[#38332c] rounded-2xl p-8 text-center space-y-3 ${className}`}>
        <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-[#f5f4f0]">
          Ruang Tunggu Santai (Antrean Kosong)
        </h4>
        <p className="text-xs text-[#a39e93] max-w-sm mx-auto">
          Semua pelanggan telah terlayani di meja potong atau belum ada tiket menunggu yang dibuat kasir.
        </p>
      </div>
    );
  }

  const readyBarbers = availableBarbers.filter((b) => b.workStatus === "READY");

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs text-[#a39e93] px-1">
        <span>
          Menunggu: <strong className="text-amber-400 font-semibold">{items.length} Orang</strong>
        </span>
        {availableBarbers.length > 0 && (
          <span>
            Barber Siap: <strong className="text-emerald-400 font-semibold">{readyBarbers.length} Kursi</strong>
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
              className={`bg-[#221f1b] border rounded-2xl p-3.5 sm:p-4 transition-all shadow-sm ${
                isAssignedSelected
                  ? "border-amber-500/60 ring-1 ring-amber-500/30"
                  : "border-[#38332c] hover:border-stone-600/60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Info Utama Antrean */}
                <div className="flex items-start gap-3 min-w-0">
                  {/* Badge Urutan */}
                  <div className="w-10 h-10 rounded-xl bg-[#181614] border border-[#38332c] flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] text-[#a39e93] leading-none">Antre</span>
                    <span className="text-xs font-bold text-amber-400">#{index + 1}</span>
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {item.ticketNumber}
                      </span>

                      {/* Request Badge */}
                      {item.requestedBarberName ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          Request: {item.requestedBarberName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-500/15 border border-stone-500/30 text-stone-300">
                          🎲 Bebas (Siapa Saja)
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-[#f5f4f0] truncate">
                      {item.customerName}
                    </h4>

                    <p className="text-xs text-[#a39e93] truncate">
                      {item.serviceName}
                    </p>

                    {item.customerPhone && (
                      <p className="text-[11px] text-[#a39e93] flex items-center gap-1">
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span>{item.customerPhone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Tunggu & Tombol Aksi */}
                <div className="text-right flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-1 text-xs font-mono text-stone-300 bg-[#181614] px-2 py-1 rounded-lg border border-[#38332c]">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{item.waitingMinutes} mnt</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {/* Tombol Panggil Antrean ke Barber (Callback onAssignBarber) */}
                    {onAssignBarber && (
                      <button
                        type="button"
                        onClick={() => onAssignBarber(item.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors cursor-pointer"
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
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#181614] hover:bg-[#2c2823] border border-[#38332c] text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50 cursor-pointer"
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
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-[#181614] hover:bg-[#2c2823] border border-[#38332c] text-[#f5f4f0] transition-colors cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                        <span>Bayar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Sub-menu Pilihan Meja / Barber untuk Assign Manual */}
              {isAssignedSelected && onAssignManual && (
                <div className="mt-3.5 pt-3.5 border-t border-[#38332c] space-y-2 animate-in fade-in duration-200">
                  <p className="text-xs font-semibold text-[#f5f4f0]">
                    Pilih Meja/Barber untuk Pelanggan Ini:
                  </p>

                  {availableBarbers.length === 0 ? (
                    <p className="text-xs text-[#a39e93] italic">
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
                                ? "bg-emerald-950/30 border-emerald-500/40 hover:bg-emerald-900/40 text-emerald-200"
                                : "bg-[#181614] border-[#38332c] hover:bg-[#2c2823] text-[#a39e93]"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <UserCheck
                                className={`w-4 h-4 shrink-0 ${
                                  isReady ? "text-emerald-400" : "text-stone-500"
                                }`}
                              />
                              <span className="font-semibold truncate">
                                {barber.user.name}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 font-medium ${
                                isReady
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : "bg-stone-800 text-stone-400"
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
                    <div className="flex items-center justify-center gap-2 text-xs text-amber-400 pt-1">
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
