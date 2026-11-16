"use client";

import { useState, useTransition } from "react";
import { QueueStrategy } from "@prisma/client";
import { SlidersHorizontal, HeartHandshake, ListOrdered, CheckCircle2, AlertCircle } from "lucide-react";
import { updateQueueStrategyAction } from "../actions/updateQueueStrategyAction";

interface QueueStrategyToggleProps {
  storeId: string;
  initialStrategy: QueueStrategy;
}

export function QueueStrategyToggle({
  storeId,
  initialStrategy,
}: QueueStrategyToggleProps) {
  const [strategy, setStrategy] = useState<QueueStrategy>(initialStrategy);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSelectStrategy = (newStrategy: QueueStrategy) => {
    if (newStrategy === strategy || isPending) return;

    setMessage(null);
    startTransition(async () => {
      const res = await updateQueueStrategyAction({
        storeId,
        queueStrategy: newStrategy,
      });

      if (res.success && res.queueStrategy) {
        setStrategy(res.queueStrategy);
        setMessage({
          type: "success",
          text: `Strategi antrean berhasil diubah ke: ${
            res.queueStrategy === "LOYALTY_PRIORITY"
              ? "Mode Loyalitas Pelanggan"
              : "Mode Antrean Murni (Strict FIFO)"
          }`,
        });
      } else {
        setMessage({
          type: "error",
          text: res.error || "Gagal mengubah strategi antrean.",
        });
      }
    });
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#E8E5DE] shadow-[0_1px_3px_rgba(28,25,23,0.02)] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#D97706]" />
            Pengaturan Budaya & Mesin Antrean Toko
          </h3>
          <p className="text-xs text-[#706E68]">
            Tentukan bagaimana mesin POS otomatis memplot pelanggan dari antrean ke kursi barber saat barber ready.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
            message.type === "success"
              ? "bg-[#E8F7EE] text-[#1E8E3E] border-[#CEEAD6]"
              : "bg-[#FDF0F2] text-[#D93025] border-[#FCDAD7]"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#1E8E3E]" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-[#D93025]" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* 2 Options Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Option 1: LOYALTY_PRIORITY */}
        <div
          onClick={() => handleSelectStrategy("LOYALTY_PRIORITY")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
            strategy === "LOYALTY_PRIORITY"
              ? "bg-[#FFF5EB] border-[#D97706] shadow-xs ring-1 ring-[#D97706]/30"
              : "bg-[#F6F5F2] border-[#E8E5DE] hover:border-[#D5D1C8]"
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#D97706] flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4" />
                Mode Loyalitas Pelanggan (Rekomendasi)
              </span>
              {strategy === "LOYALTY_PRIORITY" && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#D97706] border border-[#FDE6D2]">
                  Aktif
                </span>
              )}
            </div>
            <p className="text-xs text-[#706E68] leading-relaxed">
              Pelanggan yang me-request barber langganan tetap diutamakan kepada barber tersebut saat selesai layanan sebelumnya, menjaga kepuasan dan loyalitas pelanggan setia.
            </p>
          </div>
          <div className="mt-3 pt-2 text-[11px] text-[#706E68] border-t border-[#E8E5DE]">
            Sesuai untuk barbershop kelas menengah ke atas yang mengutamakan relasi barber & pelanggan.
          </div>
        </div>

        {/* Option 2: STRICT_FIFO */}
        <div
          onClick={() => handleSelectStrategy("STRICT_FIFO")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
            strategy === "STRICT_FIFO"
              ? "bg-[#EEF6FE] border-[#1A73E8] shadow-xs ring-1 ring-[#1A73E8]/30"
              : "bg-[#F6F5F2] border-[#E8E5DE] hover:border-[#D5D1C8]"
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1A73E8] flex items-center gap-1.5">
                <ListOrdered className="w-4 h-4" />
                Mode Antrean Murni (Strict FIFO)
              </span>
              {strategy === "STRICT_FIFO" && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#1A73E8] border border-[#D3E3FD]">
                  Aktif
                </span>
              )}
            </div>
            <p className="text-xs text-[#706E68] leading-relaxed">
              Siapapun barber yang pertama kali selesai/ready wajib memotong tiket antrean terlama (first-in first-out) tanpa memandang request barber khusus.
            </p>
          </div>
          <div className="mt-3 pt-2 text-[11px] text-[#706E68] border-t border-[#E8E5DE]">
            Sesuai untuk barbershop dengan antrean walk-in sangat ramai atau saat jam puncak padat.
          </div>
        </div>
      </div>
    </div>
  );
}
