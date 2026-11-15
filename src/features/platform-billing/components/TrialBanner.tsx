import React from "react";
import { SubscriptionStatus } from "@prisma/client";
import { AlertTriangle, Clock, MessageSquareShare } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface TrialBannerProps {
  status: SubscriptionStatus;
  daysRemaining: number;
  storeName?: string;
  whatsappNumber?: string;
  className?: string;
}

export function TrialBanner({
  status,
  daysRemaining,
  storeName = "Barbershop",
  whatsappNumber = "6281234567890",
  className,
}: TrialBannerProps) {
  // Hanya tampil jika status TRIAL dan masih tersisa hari
  if (status !== SubscriptionStatus.TRIAL || daysRemaining <= 0) {
    return null;
  }

  const isUrgent = daysRemaining <= 3;
  const message = encodeURIComponent(
    `Halo Admin Cukurin, saya ingin upgrade langganan untuk barbershop "${storeName}". Sisa trial: ${daysRemaining} hari.`
  );
  const waUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <aside
      role="banner"
      aria-label="Pemberitahuan Masa Percobaan"
      className={cn(
        "w-full border-b px-4 py-2.5 transition-colors flex flex-wrap items-center justify-between gap-3 text-sm z-40",
        isUrgent
          ? "bg-amber-950/40 border-amber-500/50 text-amber-200"
          : "bg-surface border-border text-stone-300",
        className
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {isUrgent ? (
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 animate-pulse" />
        ) : (
          <Clock className="h-4 w-4 shrink-0 text-primary" />
        )}

        <div className="flex flex-wrap items-center gap-x-2 text-xs sm:text-sm">
          <span className="font-medium">
            Masa Percobaan Gratis: Sisa <strong className="font-bold text-primary-foreground underline decoration-primary">{daysRemaining} Hari</strong>.
          </span>
          {isUrgent && (
            <span className="font-semibold text-amber-400">
              Masa trial segera berakhir!
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto shrink-0">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary hover:bg-amber-500 text-stone-950 transition-all shadow-sm active:scale-95"
        >
          <MessageSquareShare className="h-3.5 w-3.5" />
          <span>Hubungi Admin / Upgrade</span>
        </a>
      </div>
    </aside>
  );
}

export default TrialBanner;
