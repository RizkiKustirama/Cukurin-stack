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
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-zinc-100">
            Riwayat Pengeluaran Meja (Backbar)
          </h3>
        </div>
        <span className="text-xs text-zinc-400">
          {consumptions.length} pengeluaran tercatat
        </span>
      </div>

      {consumptions.length === 0 ? (
        <div className="text-center py-8 text-zinc-500 text-xs">
          Belum ada barang gudang yang dikeluarkan untuk meja barber.
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/60">
          {consumptions.map((item) => (
            <div
              key={item.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-zinc-200 text-sm">
                    {item.productName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-950/70 text-purple-300 border border-purple-800/40 text-[10px] font-semibold">
                    {item.quantity} pcs
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded-lg border border-zinc-700/40">
                    <MapPin className="w-3 h-3 text-amber-500" />
                    {item.targetStation}
                  </span>
                </div>
                {item.notes && (
                  <p className="text-[11px] text-zinc-400 italic">
                    &ldquo;{item.notes}&rdquo;
                  </p>
                )}
                <p className="text-[10px] text-zinc-500 flex items-center gap-1">
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
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                  Nilai Modal Perlengkapan
                </span>
                <span className="font-mono font-bold text-purple-300 text-sm">
                  {formatRupiah(item.totalCostValue)}
                </span>
                <span className="text-[10px] text-zinc-500 block">
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
