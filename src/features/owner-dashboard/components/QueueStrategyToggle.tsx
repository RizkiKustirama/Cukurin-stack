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
    <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-md space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            Pengaturan Budaya & Mesin Antrean Toko
          </h3>
          <p className="text-xs text-[var(--foreground-muted)]">
            Tentukan bagaimana mesin POS otomatis memplot pelanggan dari antrean ke kursi barber saat barber ready.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
            message.type === "success"
              ? "bg-emerald-950/30 text-emerald-300 border-emerald-500/30"
              : "bg-rose-950/30 text-rose-300 border-rose-500/30"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* 2 Options Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Option 1: LOYALTY_PRIORITY */}
        <div
          onClick={() => handleSelectStrategy("LOYALTY_PRIORITY")}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
            strategy === "LOYALTY_PRIORITY"
              ? "bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-950/20"
              : "bg-[var(--background)] border-[var(--border)] hover:border-[var(--border-hover)]"
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4" />
                Mode Loyalitas Pelanggan (Rekomendasi)
              </span>
              {strategy === "LOYALTY_PRIORITY" && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Aktif
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
              Pelanggan yang me-request barber langganan tetap diutamakan kepada barber tersebut saat selesai layanan sebelumnya, menjaga kepuasan dan loyalitas pelanggan setia.
            </p>
          </div>
          <div className="mt-3 pt-2 text-[11px] text-[var(--foreground-muted)] border-t border-[var(--border)]/60">
            Sesuai untuk barbershop kelas menengah ke atas yang mengutamakan relasi barber & pelanggan.
          </div>
        </div>

        {/* Option 2: STRICT_FIFO */}
        <div
          onClick={() => handleSelectStrategy("STRICT_FIFO")}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
            strategy === "STRICT_FIFO"
              ? "bg-blue-500/10 border-blue-500/50 shadow-md shadow-blue-950/20"
              : "bg-[var(--background)] border-[var(--border)] hover:border-[var(--border-hover)]"
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <ListOrdered className="w-4 h-4" />
                Mode Antrean Murni (Strict FIFO)
              </span>
              {strategy === "STRICT_FIFO" && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  Aktif
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
              Siapapun barber yang pertama kali selesai/ready wajib memotong tiket antrean terlama (first-in first-out) tanpa memandang request barber khusus.
            </p>
          </div>
          <div className="mt-3 pt-2 text-[11px] text-[var(--foreground-muted)] border-t border-[var(--border)]/60">
            Sesuai untuk barbershop dengan antrean walk-in sangat ramai atau saat jam puncak padat.
          </div>
        </div>
      </div>
    </div>
  );
}
