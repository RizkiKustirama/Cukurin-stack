"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TenantResponsiveShell } from "@/shared/components/TenantResponsiveShell";
import {
  Scissors,
  Users,
  Armchair,
  LayoutGrid,
  Plus,
  Minus,
  Trash2,
  LockOpen,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Clock,
  Sparkles,
  QrCode,
  Banknote,
  CreditCard,
  Printer,
  User,
  Phone,
  Search,
  Wallet,
  Play,
  Check,
  Coffee,
  AlertCircle,
  PlusCircle,
  MoreVertical,
} from "lucide-react";
import { formatRupiah } from "@/shared/lib/formatters";
import { BarberWorkStatus } from "@prisma/client";
import {
  createPosFastTicketAction,
  settleTicketPaymentAction,
  changeBarberStatusAction,
  completeHaircutAction,
  callNextToChairAction,
} from "../actions/posActions";
import { QuickTicketSheet, type MasterService, type MasterProduct, type MasterBarber, type TicketFormSubmitData } from "./QuickTicketSheet";
import { PaymentModal, type TicketToPay } from "./PaymentModal";
import { CashRegisterView } from "@/features/cash-register/components/CashRegisterView";
import { BarberPayoutModal } from "@/features/payroll/components/BarberPayoutModal";
import type { ChairData } from "@/features/queue/components/ActiveChairsGrid";
import type { QueueItemData } from "@/features/queue/components/QueueListView";
import type { BarberStatusItem } from "./BarberStatusCarousel";
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

interface CartItem {
  itemType: "SERVICE" | "PRODUCT";
  id: string;
  name: string;
  price: number;
  quantity: number;
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

  const [isPending, startTransition] = useTransition();

  // Modals & Sheets
  const [isTicketSheetOpen, setIsTicketSheetOpen] = useState(false);
  const [paymentTicket, setPaymentTicket] = useState<TicketToPay | null>(null);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Column 1 Tab State: "waiting" vs "in_service"
  const [queueTab, setQueueTab] = useState<"waiting" | "in_service">("waiting");

  // Column 2 Catalog Category Filter
  const [catalogCategory, setCatalogCategory] = useState<string>("ALL");
  const [catalogSearch, setCatalogSearch] = useState<string>("");

  // Column 3 Checkout Cart State
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [selectedBarberId, setSelectedBarberId] = useState<string>("ANY");
  const [paymentMethod, setPaymentMethod] = useState<"QRIS" | "CASH" | "EDC">("QRIS");
  const [receivedCash, setReceivedCash] = useState<number>(0);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Keyboard Shortcuts (F1: New Ticket, F12: Drawer)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F1") {
        e.preventDefault();
        setIsTicketSheetOpen(true);
      } else if (e.key === "F12") {
        e.preventDefault();
        router.push(`/${storeSlug}/pos?tab=cash`);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, storeSlug]);

  // Master Barbers for selection
  const masterBarbers: MasterBarber[] = useMemo(
    () =>
      barbers.map((b) => ({
        id: b.id,
        name: b.name,
        workStatus: b.workStatus,
      })),
    [barbers]
  );

  // Active chairs with in-service tickets
  const inServiceChairs = useMemo(
    () => chairs.filter((c) => c.ticket !== null),
    [chairs]
  );

  // Station counts
  const stationStats = useMemo(() => {
    const active = chairs.filter((c) => c.workStatus === "BUSY").length;
    const ready = chairs.filter((c) => c.workStatus === "READY").length;
    const idle = chairs.filter((c) => c.workStatus === "BREAK" || c.workStatus === "OFF_DUTY").length;
    return { active, ready, idle, total: chairs.length };
  }, [chairs]);

  // Cart operations
  const addToCart = (item: { id: string; name: string; price: number; itemType: "SERVICE" | "PRODUCT" }) => {
    setCart((prev) => {
      const existing = prev[item.id];
      if (existing) {
        return {
          ...prev,
          [item.id]: {
            ...existing,
            quantity: existing.quantity + 1,
          },
        };
      }
      return {
        ...prev,
        [item.id]: {
          id: item.id,
          name: item.name,
          price: item.price,
          itemType: item.itemType,
          quantity: 1,
        },
      };
    });
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return {
        ...prev,
        [id]: {
          ...existing,
          quantity: newQty,
        },
      };
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const clearCart = () => {
    setCart({});
    setCustomerName("");
    setCustomerPhone("");
    setSelectedBarberId("ANY");
    setReceivedCash(0);
  };

  // Cart calculations
  const cartItemsList = useMemo(() => Object.values(cart), [cart]);
  const subtotalAmount = useMemo(
    () => cartItemsList.reduce((acc, it) => acc + it.price * it.quantity, 0),
    [cartItemsList]
  );
  const totalAmount = subtotalAmount; // Optional discount logic can be deducted here
  const kembalian = Math.max(0, receivedCash - totalAmount);

  // Filter Catalog Items
  const filteredCatalogItems = useMemo(() => {
    const sItems = services.map((s) => ({
      id: s.id,
      name: s.name,
      price: s.price ?? 0,
      itemType: "SERVICE" as const,
      category: s.name.toLowerCase().includes("paket") || s.name.toLowerCase().includes("signature")
        ? "SIGNATURE"
        : s.name.toLowerCase().includes("trim") || s.name.toLowerCase().includes("shave") || s.name.toLowerCase().includes("color")
        ? "GROOMING"
        : "CUKUR",
      desc: `${s.durationMinutes} menit • Treatment profesional`,
      badge: s.name.toLowerCase().includes("paket") ? "Terlaris" : undefined,
    }));

    const pItems = products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price ?? p.sellingPrice ?? 0,
      itemType: "PRODUCT" as const,
      category: "RETAIL",
      desc: `Stok: ${p.stockQty ?? p.stockQuantity ?? 0} unit`,
      badge: "Retail",
    }));

    const all = [...sItems, ...pItems];

    return all.filter((item) => {
      const matchesCategory =
        catalogCategory === "ALL" ||
        (catalogCategory === "SIGNATURE" && item.category === "SIGNATURE") ||
        (catalogCategory === "CUKUR" && item.category === "CUKUR") ||
        (catalogCategory === "GROOMING" && item.category === "GROOMING") ||
        (catalogCategory === "RETAIL" && item.category === "RETAIL");

      const q = catalogSearch.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(q) ||
        (item.desc && item.desc.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [services, products, catalogCategory, catalogSearch]);

  // Handle Checkout Submit
  const handleCheckoutSubmit = async () => {
    if (cartItemsList.length === 0) {
      showToast("Pilih minimal 1 layanan atau produk terlebih dahulu.");
      return;
    }

    if (paymentMethod === "CASH" && receivedCash < totalAmount && receivedCash > 0) {
      showToast("Jumlah uang tunai kurang dari total tagihan.");
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const hasService = cartItemsList.some((it) => it.itemType === "SERVICE");
      const orderType = hasService ? "SERVICE" : "RETAIL_ONLY";

      const submitData: TicketFormSubmitData = {
        orderType,
        customerName: customerName.trim() || "Walk-in Guest",
        customerPhone: customerPhone.trim() || undefined,
        requestedBarberId: selectedBarberId === "ANY" ? undefined : selectedBarberId,
        isPaidImmediately: true,
        paymentMethod,
        totalAmount,
        items: cartItemsList.map((it) => ({
          itemType: it.itemType,
          serviceId: it.itemType === "SERVICE" ? it.id : undefined,
          productId: it.itemType === "PRODUCT" ? it.id : undefined,
          name: it.name,
          quantity: it.quantity,
          price: it.price,
        })),
      };

      const res = await createPosFastTicketAction(storeSlug, submitData);
      showToast(`Transaksi Tiket #${res.ticketNumber} Berhasil Diselesaikan!`);
      clearCart();
      router.refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Gagal memproses pembayaran kasir.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Actions
  const handleBarberStatusChange = async (barberId: string, newStatus: BarberWorkStatus) => {
    await changeBarberStatusAction(storeSlug, barberId, newStatus);
    showToast(`Status barber diperbarui ke ${newStatus}`);
    router.refresh();
  };

  const handleCompleteService = async (ticketId: string, barberId: string) => {
    await completeHaircutAction(storeSlug, ticketId, barberId);
    showToast("Layanan cukur selesai! Meja stasiun kembali SIAP.");
    router.refresh();
  };

  const handleCallNext = async (barberId: string, ticketId?: string) => {
    try {
      await callNextToChairAction(storeSlug, barberId, ticketId);
      showToast("Pelanggan dipanggil ke kursi cukur!");
      router.refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Tidak ada antrean menunggu.");
    }
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

  const handleOpenPaymentForTicket = (ticketId: string) => {
    const found = unpaidTickets.find((t) => t.id === ticketId);
    if (found) {
      setPaymentTicket(found);
      return;
    }

    const chair = chairs.find((c) => c.ticket?.id === ticketId);
    if (chair && chair.ticket) {
      setPaymentTicket({
        id: chair.ticket.id,
        ticketNumber: chair.ticket.ticketNumber,
        customerName: chair.ticket.customerName,
        barberName: chair.barberName,
        subtotal: Number(chair.ticket.subtotal) || 50000,
        items: [
          {
            name: chair.ticket.serviceName,
            quantity: 1,
            price: Number(chair.ticket.subtotal) || 50000,
          },
        ],
      });
      return;
    }

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
      <div className="p-3.5 sm:p-5 md:p-6 space-y-5 max-w-[1600px] mx-auto w-full">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-[#111111] text-white px-4 py-2.5 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4 duration-200 border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-[#1E8E3E]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. Operational Sub-Header (Screen 2 Desktop Style) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E8E5DE]/80">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] tracking-tight">
                Kasir &amp; Antrean Operasional
              </h1>
              <p className="text-xs text-[#706E68] mt-0.5">
                Cabang {storeName} • Terhubung ke Cloud Sync
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFECE6] text-[#706E68] text-xs">
              <span className="w-2 h-2 rounded-full bg-[#1E8E3E] animate-pulse"></span>
              <span>
                Shift Aktif • Kasir:{" "}
                <strong className="text-[#1A1A1A] font-semibold">{user.name}</strong>
              </span>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => router.push(`/${storeSlug}/pos?tab=cash`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#1A1A1A] border border-[#E8E5DE] shadow-xs hover:bg-[#F6F5F2] transition-all text-xs font-semibold cursor-pointer"
              type="button"
              title="Shortcut: F12"
            >
              <LockOpen className="w-3.5 h-3.5 text-[#706E68]" />
              <span>Buka Laci / Drawer (F12)</span>
            </button>

            <button
              onClick={() => setIsTicketSheetOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#111111] hover:bg-black text-white shadow-xs transition-all text-xs font-semibold cursor-pointer"
              type="button"
              title="Shortcut: F1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Buat Tiket Baru (F1)</span>
            </button>
          </div>
        </div>

        {/* 2. Main Viewport Content */}
        {currentTab === "cash" ? (
          /* Tampilan Buku Kas & Brankas Toko */
          <CashRegisterView
            storeVault={storeVault || { storeId: "", storeName, vaultBalance: 0 }}
            activeSummary={activeSummary || null}
            movements={cashMovements}
            cashierId={cashierId}
            onOpenPayoutModal={() => setIsPayoutModalOpen(true)}
          />
        ) : (
          /* Screen 2: 3-Column Split View Architecture (Desktop) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* ========================================================================= */}
            {/* COLUMN 1: Smart Queue & Antrean Live (Left, col-span-3)                    */}
            {/* ========================================================================= */}
            <section className="lg:col-span-3 flex flex-col gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E8E5DE] flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-[#FEF3EB] text-[#D97706]">
                      <Users className="w-4 h-4" />
                    </span>
                    <h2 className="text-sm font-bold text-[#1A1A1A]">Antrean Live</h2>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#EFECE6] text-[#706E68] text-[11px] font-semibold">
                    {queue.length} Menunggu
                  </span>
                </div>

                {/* Segmented Tab Switcher */}
                <div className="flex p-1 bg-[#EFECE6] rounded-full w-full">
                  <button
                    onClick={() => setQueueTab("waiting")}
                    className={`flex-1 py-1 rounded-full text-xs font-semibold text-center transition-all cursor-pointer ${
                      queueTab === "waiting"
                        ? "bg-[#111111] text-white shadow-xs"
                        : "text-[#706E68] hover:text-[#1A1A1A]"
                    }`}
                    type="button"
                  >
                    Menunggu ({queue.length})
                  </button>
                  <button
                    onClick={() => setQueueTab("in_service")}
                    className={`flex-1 py-1 rounded-full text-xs font-semibold text-center transition-all cursor-pointer ${
                      queueTab === "in_service"
                        ? "bg-[#111111] text-white shadow-xs"
                        : "text-[#706E68] hover:text-[#1A1A1A]"
                    }`}
                    type="button"
                  >
                    Diproses ({inServiceChairs.length})
                  </button>
                </div>

                {/* Queue Cards List */}
                <div className="flex flex-col gap-2.5 max-h-[640px] overflow-y-auto pr-0.5 scrollbar-none">
                  {queueTab === "waiting" ? (
                    queue.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#706E68] bg-[#F6F5F2] rounded-xl border border-dashed border-[#E8E5DE]">
                        Tidak ada antrean menunggu saat ini.
                      </div>
                    ) : (
                      queue.map((q, idx) => (
                        <article
                          key={q.id}
                          className="p-3.5 rounded-xl bg-white border border-[#E8E5DE] hover:border-[#111111]/40 shadow-2xs hover:shadow-xs transition-all flex flex-col gap-2 relative overflow-hidden group"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1E8E3E]"></div>
                          <div className="flex items-start justify-between gap-2 pl-1.5">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-[#111111] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                              <span className="font-bold text-xs text-[#1A1A1A] truncate max-w-[130px]">
                                {q.customerName}
                              </span>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                q.paymentStatus === "PAID"
                                  ? "bg-[#E8F7EE] text-[#1E8E3E]"
                                  : "bg-[#FEF3EB] text-[#D97706]"
                              }`}
                            >
                              {q.paymentStatus === "PAID" ? "Lunas" : "Bayar Nanti"}
                            </span>
                          </div>

                          <p className="text-xs text-[#706E68] pl-7 truncate">
                            {q.serviceNames.join(", ") || "Potong Reguler"}
                          </p>

                          <div className="flex items-center justify-between pt-1 border-t border-[#E8E5DE]/60 pl-7 text-[11px]">
                            <span className="text-[#D97706] font-medium truncate max-w-[120px]">
                              {q.requestedBarberName
                                ? `Req: ${q.requestedBarberName}`
                                : "Bebas (Siapa Saja)"}
                            </span>

                            <div className="flex items-center gap-1.5">
                              {q.paymentStatus === "UNPAID" && (
                                <button
                                  onClick={() => handleOpenPaymentForTicket(q.id)}
                                  className="px-2 py-0.5 rounded-full bg-[#EFECE6] hover:bg-[#E2DDD3] text-[#1A1A1A] text-[10px] font-semibold cursor-pointer"
                                  type="button"
                                >
                                  Bayar
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  const ready = barbers.find(
                                    (b) => b.workStatus === BarberWorkStatus.READY
                                  );
                                  if (ready) {
                                    handleCallNext(ready.id, q.id);
                                  } else {
                                    showToast("Semua barber sedang sibuk/istirahat.");
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#111111] hover:bg-black text-white text-[10px] font-semibold transition-all cursor-pointer"
                                type="button"
                              >
                                <span>Panggil</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </article>
                      ))
                    )
                  ) : inServiceChairs.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#706E68] bg-[#F6F5F2] rounded-xl border border-dashed border-[#E8E5DE]">
                      Belum ada kursi yang sedang memproses cukur.
                    </div>
                  ) : (
                    inServiceChairs.map((chair) => (
                      <article
                        key={chair.chairNumber}
                        className="p-3.5 rounded-xl bg-white border border-[#E8E5DE] shadow-2xs flex flex-col gap-2 relative overflow-hidden"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D93025]"></div>
                        <div className="flex items-start justify-between gap-2 pl-1.5">
                          <div>
                            <span className="text-[10px] font-bold text-[#A8A59E] uppercase">
                              Meja 0{chair.chairNumber} • {chair.barberName}
                            </span>
                            <h4 className="font-bold text-xs text-[#1A1A1A]">
                              {chair.ticket?.customerName}
                            </h4>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-[#FDF0F2] text-[#D93025] text-[10px] font-bold">
                            Cukur
                          </span>
                        </div>

                        <p className="text-xs text-[#706E68] pl-1.5">
                          {chair.ticket?.serviceName}
                        </p>

                        <div className="flex items-center justify-between pt-1 border-t border-[#E8E5DE]/60 pl-1.5">
                          <span className="text-[11px] text-[#706E68] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Sedang Berjalan</span>
                          </span>

                          <button
                            onClick={() => {
                              if (chair.ticket) {
                                handleCompleteService(chair.ticket.id, chair.barberId);
                              }
                            }}
                            className="px-2.5 py-1 rounded-full bg-[#1E8E3E] hover:bg-[#167030] text-white text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1"
                            type="button"
                          >
                            <Check className="w-3 h-3" />
                            <span>Selesai Cukur</span>
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* COLUMN 2: Station Monitoring & Quick Catalog (Center, col-span-5)        */}
            {/* ========================================================================= */}
            <section className="lg:col-span-5 flex flex-col gap-4">
              {/* Top: Monitoring Stasiun Meja Barber */}
              <div className="bg-white rounded-2xl p-4 border border-[#E8E5DE] shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-[#EFECE6] text-[#706E68]">
                      <Armchair className="w-4 h-4" />
                    </span>
                    <h2 className="text-sm font-bold text-[#1A1A1A]">
                      Status {chairs.length} Stasiun Meja Barber
                    </h2>
                  </div>
                  <span className="text-[11px] font-semibold text-[#1E8E3E]">
                    {stationStats.active} Aktif • {stationStats.ready} Siap • {stationStats.idle} Idle
                  </span>
                </div>

                {/* Stasiun Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-1">
                  {chairs.map((c) => {
                    const isBusy = c.workStatus === "BUSY";
                    const isReady = c.workStatus === "READY";

                    return (
                      <div
                        key={c.chairNumber}
                        className={`p-2 rounded-xl border flex flex-col items-center text-center gap-1 transition-all ${
                          isBusy
                            ? "bg-[#FDF0F2]/40 border-[#FCDAD7]"
                            : isReady
                            ? "bg-[#E8F7EE]/40 border-[#CEEAD6]"
                            : "bg-[#F6F5F2] border-[#E8E5DE]"
                        }`}
                      >
                        <span className="text-[10px] text-[#706E68] font-bold">
                          M-0{c.chairNumber}
                        </span>
                        <span className="text-xs font-bold text-[#1A1A1A] truncate w-full">
                          {c.barberName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isBusy
                              ? "bg-[#FDF0F2] text-[#D93025]"
                              : isReady
                              ? "bg-[#E8F7EE] text-[#1E8E3E]"
                              : "bg-[#FEF3EB] text-[#D97706]"
                          }`}
                        >
                          {isBusy ? "Cukur" : isReady ? "Siap" : "Break"}
                        </span>
                        <span className="text-[10px] text-[#706E68] truncate w-full mt-0.5">
                          {c.ticket ? c.ticket.customerName : isReady ? "Standby" : "Istirahat"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom: Quick Catalog Jasa & Produk */}
              <div className="bg-white rounded-2xl p-4 border border-[#E8E5DE] shadow-xs flex flex-col gap-3.5">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-[#EFECE6] text-[#706E68]">
                        <LayoutGrid className="w-4 h-4" />
                      </span>
                      <h2 className="text-sm font-bold text-[#1A1A1A]">
                        Katalog Cepat Jasa &amp; Produk
                      </h2>
                    </div>
                    <span className="text-[11px] text-[#A8A59E]">
                      Tekan item untuk tambah ke kasir
                    </span>
                  </div>

                  {/* Category Filter Pills & Search */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                      {[
                        { id: "ALL", label: "Semua" },
                        { id: "SIGNATURE", label: "Paket Signature" },
                        { id: "CUKUR", label: "Cukur & Cuci" },
                        { id: "GROOMING", label: "Grooming" },
                        { id: "RETAIL", label: "Retail" },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setCatalogCategory(cat.id)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                            catalogCategory === cat.id
                              ? "bg-[#111111] text-white shadow-2xs"
                              : "bg-[#EFECE6] text-[#706E68] hover:text-[#1A1A1A]"
                          }`}
                          type="button"
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative min-w-[140px] max-w-[200px]">
                      <Search className="w-3 h-3 absolute left-2.5 top-2 text-[#706E68]" />
                      <input
                        type="text"
                        placeholder="Cari..."
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        className="w-full pl-7 pr-2.5 py-1 rounded-full bg-[#F6F5F2] border border-[#E8E5DE] text-[11px] focus:outline-none focus:border-[#111111]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2-Column Responsive Service/Product Grid */}
                <div className="grid grid-cols-2 gap-2.5 max-h-[500px] overflow-y-auto pr-0.5 scrollbar-none">
                  {filteredCatalogItems.length === 0 ? (
                    <div className="col-span-2 p-8 text-center text-xs text-[#706E68] bg-[#F6F5F2] rounded-xl border border-dashed border-[#E8E5DE]">
                      Tidak ada menu atau produk yang cocok dengan pencarian.
                    </div>
                  ) : (
                    filteredCatalogItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() =>
                          addToCart({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            itemType: item.itemType,
                          })
                        }
                        className="p-3.5 rounded-xl bg-white border border-[#E8E5DE] hover:border-[#111111] transition-all flex flex-col justify-between gap-2 cursor-pointer group hover:shadow-2xs select-none"
                      >
                        <div className="flex justify-between items-start gap-1">
                          {item.badge ? (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.itemType === "PRODUCT"
                                  ? "bg-[#EEF6FE] text-[#1A73E8]"
                                  : "bg-[#FEF3EB] text-[#D97706]"
                              }`}
                            >
                              {item.badge}
                            </span>
                          ) : (
                            <div />
                          )}
                          <PlusCircle className="w-4 h-4 text-[#A8A59E] group-hover:text-[#111111] transition-colors" />
                        </div>

                        <div>
                          <h3 className="text-xs font-bold text-[#1A1A1A] leading-tight">
                            {item.name}
                          </h3>
                          <p className="text-[10px] text-[#706E68] mt-0.5 line-clamp-1">
                            {item.desc}
                          </p>
                        </div>

                        <span className="text-xs font-extrabold text-[#1A1A1A] font-mono">
                          {formatRupiah(item.price)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* COLUMN 3: Active Transaction Summary & POS Checkout (Right, col-span-4)  */}
            {/* ========================================================================= */}
            <section className="lg:col-span-4 flex flex-col">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E5DE] shadow-xs flex flex-col gap-3.5 h-full">
                {/* Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-[#E8E5DE]">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#1A1A1A]">
                      Ringkasan Transaksi Kasir
                    </span>
                    <span className="text-[10px] text-[#706E68] uppercase font-bold tracking-wider">
                      {cartItemsList.length > 0
                        ? `TIKET BARU (${cartItemsList.length} ITEM)`
                        : "SIAP MENERIMA TRANSAKSI"}
                    </span>
                  </div>

                  {cartItemsList.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-[11px] text-[#D93025] hover:underline font-semibold cursor-pointer"
                      type="button"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Customer & Barber Strip */}
                <div className="p-3 bg-[#F6F5F2] rounded-xl flex flex-col gap-2 border border-[#E8E5DE]/80">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {customerName ? customerName.slice(0, 2).toUpperCase() : "WK"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        placeholder="Nama Pelanggan (Walk-in)"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-transparent text-xs font-semibold text-[#1A1A1A] placeholder:text-[#A8A59E] focus:outline-none"
                      />
                      <input
                        type="tel"
                        placeholder="Nomor WA (Opsional)"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-transparent text-[11px] text-[#706E68] placeholder:text-[#A8A59E] focus:outline-none mt-0.5"
                      />
                    </div>
                  </div>

                  {/* Barber Picker */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#E8E5DE] text-xs">
                    <span className="text-[11px] text-[#706E68]">Pilih Barber:</span>
                    <select
                      value={selectedBarberId}
                      onChange={(e) => setSelectedBarberId(e.target.value)}
                      className="bg-white border border-[#E8E5DE] rounded-lg px-2 py-1 text-xs text-[#1A1A1A] focus:outline-none cursor-pointer"
                    >
                      <option value="ANY">Bebas (Siapa Saja)</option>
                      {masterBarbers.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.workStatus === "READY" ? "Siap" : "Sibuk"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Itemized Order Table */}
                <div className="flex flex-col gap-2 flex-1 min-h-[140px]">
                  <div className="flex items-center justify-between text-[#A8A59E] text-[10px] uppercase font-bold tracking-wider pb-1 border-b border-[#E8E5DE]">
                    <span>Item / Jasa</span>
                    <span>Subtotal</span>
                  </div>

                  {cartItemsList.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#706E68] flex flex-col items-center justify-center gap-1.5">
                      <Scissors className="w-5 h-5 text-[#A8A59E]" />
                      <p>Belum ada item dipilih.</p>
                      <p className="text-[11px] text-[#A8A59E]">
                        Klik kartu layanan atau produk di katalog tengah.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto pr-0.5 scrollbar-none">
                      {cartItemsList.map((item) => (
                        <div
                          key={item.id}
                          className="p-1.5 rounded-lg hover:bg-[#F6F5F2] transition-colors flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-semibold text-[#1A1A1A] truncate">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-[#706E68] font-mono">
                              {formatRupiah(item.price)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1 bg-[#EFECE6] rounded-full p-0.5">
                              <button
                                onClick={() => updateCartQty(item.id, -1)}
                                className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#1A1A1A] hover:bg-[#E2DDD3] text-xs cursor-pointer"
                                type="button"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold px-1.5">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQty(item.id, 1)}
                                className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#1A1A1A] hover:bg-[#E2DDD3] text-xs cursor-pointer"
                                type="button"
                              >
                                +
                              </button>
                            </div>

                            <span className="font-bold text-xs text-[#1A1A1A] font-mono min-w-[70px] text-right">
                              {formatRupiah(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Total Calculation Breakdown */}
                  <div className="pt-2 border-t border-[#E8E5DE] flex flex-col gap-1 mt-auto">
                    <div className="flex justify-between text-xs text-[#706E68]">
                      <span>Subtotal Item</span>
                      <span className="font-mono">{formatRupiah(subtotalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#1E8E3E]">
                      <span>Diskon Loyalitas Member</span>
                      <span className="font-mono">-Rp 0</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-1.5 border-t border-[#E8E5DE] mt-1">
                      <span className="text-xs font-bold text-[#1A1A1A]">Total Tagihan</span>
                      <span className="text-lg font-black text-[#1A1A1A] font-mono">
                        {formatRupiah(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="text-[10px] text-[#706E68] uppercase font-bold tracking-wider">
                    Metode Pembayaran
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setPaymentMethod("QRIS")}
                      className={`py-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        paymentMethod === "QRIS"
                          ? "bg-[#111111] text-white shadow-xs"
                          : "bg-[#EFECE6] text-[#706E68] hover:text-[#1A1A1A]"
                      }`}
                      type="button"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>QRIS</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("CASH")}
                      className={`py-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        paymentMethod === "CASH"
                          ? "bg-[#111111] text-white shadow-xs"
                          : "bg-[#EFECE6] text-[#706E68] hover:text-[#1A1A1A]"
                      }`}
                      type="button"
                    >
                      <Banknote className="w-4 h-4" />
                      <span>Tunai</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("EDC")}
                      className={`py-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        paymentMethod === "EDC"
                          ? "bg-[#111111] text-white shadow-xs"
                          : "bg-[#EFECE6] text-[#706E68] hover:text-[#1A1A1A]"
                      }`}
                      type="button"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Debit/EDC</span>
                    </button>
                  </div>
                </div>

                {/* Payment Details Container */}
                {paymentMethod === "QRIS" ? (
                  <div className="p-2.5 rounded-xl bg-[#F6F5F2] border border-[#E8E5DE] flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-lg border border-[#E8E5DE] flex items-center justify-center p-1 shrink-0">
                      <QrCode className="w-8 h-8 text-[#1A1A1A]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#1A1A1A]">
                        Scan QRIS Dinamis
                      </span>
                      <span className="text-[10px] text-[#706E68] mt-0.5">
                        BCA, GoPay, OVO, ShopeePay, Dana terverifikasi otomatis.
                      </span>
                    </div>
                  </div>
                ) : paymentMethod === "CASH" ? (
                  <div className="p-2.5 rounded-xl bg-[#F6F5F2] border border-[#E8E5DE] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#706E68]">Uang Diterima:</span>
                      <input
                        type="number"
                        value={receivedCash || ""}
                        onChange={(e) => setReceivedCash(Number(e.target.value) || 0)}
                        placeholder={String(totalAmount)}
                        className="w-28 px-2 py-1 bg-white border border-[#E8E5DE] rounded-lg text-right font-mono font-bold text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setReceivedCash(totalAmount)}
                        className="px-2 py-0.5 rounded-full bg-white border border-[#E8E5DE] text-[10px] font-semibold"
                        type="button"
                      >
                        Pas
                      </button>
                      <button
                        onClick={() => setReceivedCash(50000)}
                        className="px-2 py-0.5 rounded-full bg-white border border-[#E8E5DE] text-[10px] font-semibold font-mono"
                        type="button"
                      >
                        50k
                      </button>
                      <button
                        onClick={() => setReceivedCash(100000)}
                        className="px-2 py-0.5 rounded-full bg-white border border-[#E8E5DE] text-[10px] font-semibold font-mono"
                        type="button"
                      >
                        100k
                      </button>
                    </div>
                    {receivedCash >= totalAmount && (
                      <div className="flex justify-between items-center pt-1 border-t border-[#E8E5DE] text-xs">
                        <span className="text-[#706E68]">Kembalian:</span>
                        <span className="font-bold text-[#1E8E3E] font-mono">
                          {formatRupiah(kembalian)}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-[#F6F5F2] border border-[#E8E5DE] flex items-center gap-2 text-xs text-[#706E68]">
                    <CreditCard className="w-4 h-4 text-[#1A1A1A]" />
                    <span>Gesek kartu pelanggan pada mesin EDC kasir</span>
                  </div>
                )}

                {/* Action Button: Konfirmasi & Cetak Struk */}
                <button
                  onClick={handleCheckoutSubmit}
                  disabled={isSubmittingOrder || cartItemsList.length === 0}
                  className="w-full py-3.5 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-1"
                  type="button"
                >
                  <Printer className="w-4 h-4" />
                  <span>
                    {isSubmittingOrder
                      ? "Memproses Transaksi..."
                      : "Konfirmasi & Cetak Struk (Enter)"}
                  </span>
                </button>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Slide-over Form Pembuatan Tiket Mobile (FAB trigger / F1) */}
      <QuickTicketSheet
        isOpen={isTicketSheetOpen}
        onClose={() => setIsTicketSheetOpen(false)}
        services={services}
        products={products}
        barbers={masterBarbers}
        onSubmit={async (data) => {
          const res = await createPosFastTicketAction(storeSlug, data);
          showToast(`Tiket #${res.ticketNumber} berhasil dibuat!`);
          router.refresh();
        }}
      />

      {/* Modal Pelunasan Tiket */}
      <PaymentModal
        isOpen={!!paymentTicket}
        ticket={paymentTicket}
        onClose={() => setPaymentTicket(null)}
        onConfirmPayment={handleSettlePayment}
      />

      {/* Modal Pencairan Komisi Barber */}
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
