"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TenantResponsiveShell } from "@/shared/components/TenantResponsiveShell";
import { StoreHeader } from "./StoreHeader";
import { BarberStatusCarousel, type BarberStatusItem } from "./BarberStatusCarousel";
import { QuickTicketSheet, type MasterService, type MasterProduct, type MasterBarber, type TicketFormSubmitData } from "./QuickTicketSheet";
import { PaymentModal, type TicketToPay } from "./PaymentModal";
import { PosTransactionForm } from "./PosTransactionForm";
import { ActiveChairsGrid, type ChairData } from "@/features/queue/components/ActiveChairsGrid";
import { QueueListView, type QueueItemData } from "@/features/queue/components/QueueListView";
import {
  createPosFastTicketAction,
  settleTicketPaymentAction,
  changeBarberStatusAction,
  completeHaircutAction,
  callNextToChairAction,
} from "../actions/posActions";
import { BarberWorkStatus } from "@prisma/client";
import { Wallet, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatRupiah } from "@/shared/lib/formatters";
import { CashRegisterView } from "@/features/cash-register/components/CashRegisterView";
import { BarberPayoutModal } from "@/features/payroll/components/BarberPayoutModal";
import type {
  DailyRegisterSummary,
  StoreVaultInfo,
  CashMovementItem,
} from "@/features/cash-register/types";
import type { StoreBarberPayoutCandidate } from "@/features/payroll/types";

export interface PosCashierViewProps {
  storeSlug: string;
  storeName: string;
  brandName?: string;
  user: {
    name: string;
    role: string;
    email?: string | null;
    phone?: string;
  };
  drawer: {
    status: "OPEN" | "CLOSED";
    cash: number;
    openedAt?: string;
  };
  barbers: BarberStatusItem[];
  chairs: ChairData[];
  queue: QueueItemData[];
  services: MasterService[];
  products: MasterProduct[];
  unpaidTickets: TicketToPay[];
  storeVault?: StoreVaultInfo;
  activeSummary?: DailyRegisterSummary | null;
  cashMovements?: CashMovementItem[];
  payoutCandidates?: StoreBarberPayoutCandidate[];
  cashierId?: string;
}

export function PosCashierView({
  storeSlug,
  storeName,
  brandName,
  user,
  drawer,
  barbers,
  chairs,
  queue,
  services,
  products,
  unpaidTickets,
  storeVault,
  activeSummary,
  cashMovements = [],
  payoutCandidates = [],
  cashierId = "",
}: PosCashierViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = (searchParams?.get("tab") as "queue" | "pos" | "cash") || "pos";

  // State
  const [isTicketSheetOpen, setIsTicketSheetOpen] = useState(false);
  const [paymentTicket, setPaymentTicket] = useState<TicketToPay | null>(null);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Convert barbers to MasterBarber for select list
  const masterBarbers: MasterBarber[] = barbers.map((b) => ({
    id: b.id,
    name: b.name,
    workStatus: b.workStatus,
  }));

  // Handlers
  const handleCreateTicket = async (data: TicketFormSubmitData) => {
    const res = await createPosFastTicketAction(storeSlug, data);
    showToast(`Tiket #${res.ticketNumber} berhasil dibuat!`);
    router.refresh();
  };

  const handleSettlePayment = async (params: {
    ticketId: string;
    method: "CASH" | "QRIS" | "TRANSFER" | "EDC";
    receivedAmount: number;
    tipAmount: number;
  }) => {
    await settleTicketPaymentAction(storeSlug, params);
    showToast("Pembayaran tiket berhasil dilunasi!");
    router.refresh();
  };

  const handleBarberStatusChange = async (barberId: string, newStatus: BarberWorkStatus) => {
    await changeBarberStatusAction(storeSlug, barberId, newStatus);
    showToast(`Status barber diperbarui ke ${newStatus}`);
    router.refresh();
  };

  const handleCompleteService = async (ticketId: string, barberId: string) => {
    await completeHaircutAction(storeSlug, ticketId, barberId);
    showToast("Layanan cukur selesai! Kursi barber kini kembali SIAP.");
    router.refresh();
  };

  const handleCallNext = async (barberId: string, ticketId?: string) => {
    try {
      await callNextToChairAction(storeSlug, barberId, ticketId);
      showToast("Pelanggan dipanggil ke kursi!");
      router.refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Tidak ada antrean.");
    }
  };

  const handleOpenPaymentForTicket = (ticketId: string) => {
    // Find ticket in unpaidTickets or queue or chairs
    const found = unpaidTickets.find((t) => t.id === ticketId);
    if (found) {
      setPaymentTicket(found);
      return;
    }

    // Check chair ticket
    const chair = chairs.find((c) => c.ticket?.id === ticketId);
    if (chair && chair.ticket) {
      setPaymentTicket({
        id: chair.ticket.id,
        ticketNumber: chair.ticket.ticketNumber,
        customerName: chair.ticket.customerName,
        barberName: chair.barberName,
        subtotal: Number(chair.ticket.subtotal) || 0,
        items: [
          {
            name: chair.ticket.serviceName,
            quantity: 1,
            price: Number(chair.ticket.subtotal) || 0,
          },
        ],
      });
      return;
    }

    // Check queue item
    const qItem = queue.find((q) => q.id === ticketId);
    if (qItem) {
      setPaymentTicket({
        id: qItem.id,
        ticketNumber: qItem.ticketNumber,
        customerName: qItem.customerName,
        subtotal: qItem.totalAmount,
        items: qItem.serviceNames.map((sn: string) => ({
          name: sn,
          quantity: 1,
          price: qItem.totalAmount / (qItem.serviceNames.length || 1),
        })),
      });
    }
  };

  return (
    <TenantResponsiveShell
      storeSlug={storeSlug}
      storeName={storeName}
      brandName={brandName}
      activeTab={currentTab}
      user={user}
      onOpenTicket={() => setIsTicketSheetOpen(true)}
      onOpenCashDrawer={() => router.push(`/${storeSlug}/pos?tab=cash`)}
    >
      <div className="p-3.5 sm:p-5 md:p-6 space-y-5 max-w-7xl mx-auto w-full">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-amber-500 text-stone-950 px-4 py-2.5 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4 duration-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. Header Toko & Status Kasir */}
        <StoreHeader
          storeName={storeName}
          storeSlug={storeSlug}
          cashierName={user.name}
          cashierRole={user.role}
          drawerStatus={drawer.status}
          drawerCash={drawer.cash}
          onOpenCashDrawer={() => router.push(`/${storeSlug}/pos?tab=cash`)}
          onRefresh={() => router.refresh()}
        />

        {/* 2. Barber Status Swipeable Carousel */}
        <BarberStatusCarousel
          barbers={barbers}
          onStatusChange={handleBarberStatusChange}
        />

        {/* 3. Responsive Layout (Mobile vs Desktop) */}
        {currentTab === "cash" ? (
          /* Tampilan Modul Buku Kas Harian & Brankas Toko (Fase 4) */
          <CashRegisterView
            storeVault={storeVault || { storeId: "", storeName, vaultBalance: 0 }}
            activeSummary={activeSummary || null}
            movements={cashMovements}
            cashierId={cashierId}
            onOpenPayoutModal={() => setIsPayoutModalOpen(true)}
          />
        ) : (
          <>
            {/* Tampilan Desktop (md+): 2 Kolom terbelah (Split View) */}
            <div className="hidden md:grid md:grid-cols-12 gap-6 items-start">
              {/* Kolom Kiri (58% / 7 cols): Meja Aktif & Antrean Menunggu */}
              <div className="md:col-span-7 space-y-6">
                <ActiveChairsGrid
                  chairs={chairs}
                  onCompleteService={handleCompleteService}
                  onCallNext={(barberId: string) => handleCallNext(barberId)}
                  onCheckoutTicket={handleOpenPaymentForTicket}
                />

                <QueueListView
                  queueItems={queue}
                  onAssignBarber={(ticketId: string) => {
                    // Find first ready barber
                    const ready = barbers.find((b) => b.workStatus === BarberWorkStatus.READY);
                    if (ready) {
                      handleCallNext(ready.id, ticketId);
                    } else {
                      showToast("Semua barber sedang sibuk/istirahat.");
                    }
                  }}
                  onPayTicket={handleOpenPaymentForTicket}
                />
              </div>

              {/* Kolom Kanan (42% / 5 cols): Panel PosTransactionForm Sticky */}
              <div className="md:col-span-5 sticky top-4">
                <PosTransactionForm
                  services={services}
                  products={products}
                  barbers={masterBarbers}
                  onSubmit={handleCreateTicket}
                />
              </div>
            </div>

            {/* Tampilan Mobile (< md): Tab-Aware / Mobile View */}
            <div className="md:hidden space-y-5">
              {currentTab === "pos" ? (
                /* Tab Kasir POS di Mobile */
                <div className="space-y-4">
                  <PosTransactionForm
                    services={services}
                    products={products}
                    barbers={masterBarbers}
                    onSubmit={handleCreateTicket}
                  />
                </div>
              ) : (
                /* Tab Antrean di Mobile (Default) */
                <div className="space-y-5">
                  <ActiveChairsGrid
                    chairs={chairs}
                    onCompleteService={handleCompleteService}
                    onCallNext={(barberId: string) => handleCallNext(barberId)}
                    onCheckoutTicket={handleOpenPaymentForTicket}
                  />

                  <QueueListView
                    queueItems={queue}
                    onAssignBarber={(ticketId: string) => {
                      const ready = barbers.find((b) => b.workStatus === BarberWorkStatus.READY);
                      if (ready) {
                        handleCallNext(ready.id, ticketId);
                      } else {
                        showToast("Semua barber sedang sibuk/istirahat.");
                      }
                    }}
                    onPayTicket={handleOpenPaymentForTicket}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Slide-over Form Pembuatan Tiket Mobile (FAB trigger) */}
      <QuickTicketSheet
        isOpen={isTicketSheetOpen}
        onClose={() => setIsTicketSheetOpen(false)}
        services={services}
        products={products}
        barbers={masterBarbers}
        onSubmit={handleCreateTicket}
      />

      {/* Modal Pelunasan Tiket Bayar Belakang */}
      <PaymentModal
        isOpen={!!paymentTicket}
        ticket={paymentTicket}
        onClose={() => setPaymentTicket(null)}
        onConfirmPayment={handleSettlePayment}
      />

      {/* Modal Pencairan Komisi Barber (Fase 4) */}
      {storeVault && (
        <BarberPayoutModal
          isOpen={isPayoutModalOpen}
          onClose={() => setIsPayoutModalOpen(false)}
          candidates={payoutCandidates}
          activeRegisterId={activeSummary?.register.id}
          expectedDrawerCash={activeSummary?.expectedDrawerCash || 0}
          onSuccess={() => {
            showToast("Komisi barber berhasil dicairkan!");
            router.refresh();
          }}
        />
      )}
    </TenantResponsiveShell>
  );
}
