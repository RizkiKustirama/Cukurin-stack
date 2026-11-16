"use client";

import React from "react";
import { formatRupiah } from "@/shared/lib/formatters";
import { ConsumptionHistoryItem } from "../types";
import { History, Clock, MapPin, Tag } from "lucide-react";

interface ConsumptionHistoryTableProps {
  consumptions: ConsumptionHistoryItem[];
}

export const ConsumptionHistoryTable: React.FC<ConsumptionHistoryTableProps> = ({
  consumptions,
}) => {
  return (
    <div className="bg-white border border-[#E8E5DE] rounded-2xl p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4 border-b border-[#E8E5DE] pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#7C3AED]" />
          <h3 className="text-sm font-bold text-[#1A1A1A]">
            Riwayat Pengeluaran Meja (Backbar)
          </h3>
        </div>
        <span className="text-xs text-[#706E68]">
          {consumptions.length} pengeluaran tercatat
        </span>
      </div>

      {consumptions.length === 0 ? (
        <div className="text-center py-8 text-[#706E68] text-xs">
          Belum ada barang gudang yang dikeluarkan untuk meja barber.
        </div>
      ) : (
        <div className="divide-y divide-[#E8E5DE]">
          {consumptions.map((item) => (
            <div
              key={item.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[#1A1A1A] text-sm">
                    {item.productName}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F5F0FF] text-[#7C3AED] border border-[#DDD6FE]/50 text-[10px] font-semibold">
                    {item.quantity} pcs
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-[#706E68] bg-[#F6F5F2] px-2.5 py-0.5 rounded-full border border-[#E8E5DE]">
                    <MapPin className="w-3 h-3 text-[#D97706]" />
                    {item.targetStation}
                  </span>
                </div>
                {item.notes && (
                  <p className="text-[11px] text-[#706E68] italic">
                    &ldquo;{item.notes}&rdquo;
                  </p>
                )}
                <p className="text-[10px] text-[#A8A59E] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(item.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div className="text-right sm:self-center shrink-0">
                <span className="text-[10px] uppercase font-bold text-[#706E68] block">
                  Nilai Modal Perlengkapan
                </span>
                <span className="font-mono font-bold text-[#7C3AED] text-sm">
                  {formatRupiah(item.totalCostValue)}
                </span>
                <span className="text-[10px] text-[#706E68] block">
                  @{formatRupiah(item.unitCostPrice)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
