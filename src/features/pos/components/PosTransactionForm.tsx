"use client";

import React, { useState } from "react";
import {
  Receipt,
  Scissors,
  ShoppingBag,
  User,
  Phone,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  Banknote,
  QrCode,
  ArrowRightLeft,
  CreditCard,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { formatRupiah } from "@/shared/lib/formatters";
import type { MasterService, MasterProduct, MasterBarber, TicketFormSubmitData } from "../types";
import { createTicketAction } from "../actions/ticketActions";

export interface PosTransactionFormProps {
  storeId?: string;
  initialServices?: any[];
  initialProducts?: any[];
  initialBarbers?: any[];
  onSuccess?: () => void;
  onCancel?: () => void;
  services?: MasterService[];
  products?: MasterProduct[];
  barbers?: MasterBarber[];
  onSubmit?: (data: TicketFormSubmitData) => Promise<void> | void;
}

export function PosTransactionForm({
  storeId = "",
  initialServices,
  initialProducts,
  initialBarbers,
  onSuccess,
  onCancel,
  services: controlledServices,
  products: controlledProducts,
  barbers: controlledBarbers,
  onSubmit,
}: PosTransactionFormProps) {
  const [activeCatalogTab, setActiveCatalogTab] = useState<"SERVICES" | "PRODUCTS">("SERVICES");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedBarberId, setSelectedBarberId] = useState<string>("ANY");
  const [isPaidImmediately, setIsPaidImmediately] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "QRIS" | "TRANSFER" | "EDC">("CASH");
  const [receivedCash, setReceivedCash] = useState<number>(0);

  // Cart: Record<id, { itemType, name, price, quantity }>
  const [cart, setCart] = useState<
    Record<
      string,
      {
        itemType: "SERVICE" | "PRODUCT";
        id: string;
        name: string;
        price: number;
        quantity: number;
      }
    >
  >({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Harmonize services
  const availableServices: MasterService[] = (controlledServices || initialServices || []).map(
    (s: any) => ({
      id: s.id,
      name: s.name,
      price: Number(s.price || 0),
      durationMinutes: s.durationMinutes || 30,
    })
  );

  // Harmonize products
  const availableProducts: MasterProduct[] = (controlledProducts || initialProducts || []).map(
    (p: any) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price || p.sellingPrice || 0),
      stockQty: p.stockQty || p.stockQuantity || 0,
    })
  );

  // Harmonize barbers
  const availableBarbers: MasterBarber[] = (controlledBarbers || initialBarbers || []).map(
    (b: any) => ({
      id: b.id,
      name: b.name,
      workStatus: b.workStatus || "READY",
    })
  );

  const addItemToCart = (item: {
    id: string;
    itemType: "SERVICE" | "PRODUCT";
    name: string;
    price: number;
  }) => {
    setCart((prev) => {
      const existing = prev[item.id];
      if (existing) {
        return {
          ...prev,
          [item.id]: { ...existing, quantity: existing.quantity + 1 },
        };
      }
      return {
        ...prev,
        [item.id]: {
          id: item.id,
          itemType: item.itemType,
          name: item.name,
          price: item.price,
          quantity: 1,
        },
      };
    });
  };

  const removeItemFromCart = (id: string) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const decrementItemInCart = (id: string) => {
    setCart((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return {
        ...prev,
        [id]: { ...existing, quantity: existing.quantity - 1 },
      };
    });
  };

  const clearCart = () => {
    setCart({});
    setCustomerName("");
    setCustomerPhone("");
    setReceivedCash(0);
    setStatusMessage(null);
  };

  const cartItems = Object.values(cart);
  const totalAmount = cartItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const changeCash = Math.max(0, receivedCash - totalAmount);

  const handleSubmit = async (immediate: boolean) => {
    setStatusMessage(null);

    if (!customerName.trim()) {
      setStatusMessage({ type: "error", text: "Nama pelanggan wajib diisi." });
      return;
    }

    if (cartItems.length === 0) {
      setStatusMessage({ type: "error", text: "Keranjang kasir masih kosong." });
      return;
    }

    if (immediate && paymentMethod === "CASH" && receivedCash < totalAmount) {
      setStatusMessage({ type: "error", text: "Uang tunai diterima kurang dari total." });
      return;
    }

    try {
      setIsSubmitting(true);
      if (onSubmit) {
        await onSubmit({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim() || undefined,
          orderType: cartItems.some((it) => it.itemType === "SERVICE") ? "SERVICE" : "RETAIL_ONLY",
          requestedBarberId: selectedBarberId === "ANY" ? undefined : selectedBarberId,
          isPaidImmediately: immediate,
          paymentMethod: immediate ? paymentMethod : undefined,
          items: cartItems.map((it) => ({
            itemType: it.itemType,
            serviceId: it.itemType === "SERVICE" ? it.id : undefined,
            productId: it.itemType === "PRODUCT" ? it.id : undefined,
            name: it.name,
            price: it.price,
            quantity: it.quantity,
          })),
          totalAmount,
        });
      } else {
        const res = await createTicketAction({
          storeId,
          orderType: cartItems.some((it) => it.itemType === "SERVICE") ? "SERVICE" : "RETAIL_ONLY",
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim() || undefined,
          requestedBarberId: selectedBarberId === "ANY" ? null : selectedBarberId,
          isPaidImmediately: immediate,
          paymentMethod: immediate ? paymentMethod : undefined,
          amountPaid: immediate && paymentMethod === "CASH" ? receivedCash : undefined,
          items: cartItems.map((it) => ({
            id: it.id,
            itemType: it.itemType,
            serviceId: it.itemType === "SERVICE" ? it.id : undefined,
            productId: it.itemType === "PRODUCT" ? it.id : undefined,
            itemName: it.name,
            price: it.price,
            quantity: it.quantity,
          })),
        });
        if (!res.success) {
          setStatusMessage({ type: "error", text: res.error || "Gagal memproses transaksi." });
          return;
        }
      }

      setStatusMessage({ type: "success", text: "Transaksi berhasil diproses!" });
      if (onSuccess) onSuccess();
      clearCart();
    } catch (err: unknown) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memproses transaksi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl relative">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--foreground)] tracking-tight">
              Kasir POS Langsung
            </h2>
            <p className="text-xs text-[var(--foreground-muted)]">
              Input cepat tanpa pop-up modal
            </p>
          </div>
        </div>
        {cartItems.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-xs text-stone-500 hover:text-red-400 transition-colors cursor-pointer"
          >
            Bersihkan
          </button>
        )}
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            statusMessage.type === "success"
              ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
              : "bg-red-950/40 border-red-800 text-red-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Catalog Selector Tabs */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--background)] rounded-xl border border-[var(--border)]">
          <button
            type="button"
            onClick={() => setActiveCatalogTab("SERVICES")}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeCatalogTab === "SERVICES"
                ? "bg-[var(--primary)] text-white shadow"
                : "text-[var(--foreground-muted)] hover:text-white"
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Layanan Cukur ({availableServices.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCatalogTab("PRODUCTS")}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeCatalogTab === "PRODUCTS"
                ? "bg-[var(--primary)] text-white shadow"
                : "text-[var(--foreground-muted)] hover:text-white"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Produk Retail ({availableProducts.length})</span>
          </button>
        </div>

        {/* Quick Item Buttons Grid */}
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
          {activeCatalogTab === "SERVICES"
            ? availableServices.map((srv) => (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() =>
                    addItemToCart({
                      id: srv.id,
                      itemType: "SERVICE",
                      name: srv.name,
                      price: srv.price,
                    })
                  }
                  className="p-2.5 rounded-xl bg-[var(--background)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-left transition-all cursor-pointer group"
                >
                  <p className="text-xs font-bold text-[var(--foreground)] truncate group-hover:text-amber-400">
                    {srv.name}
                  </p>
                  <p className="text-[10px] text-amber-300 font-mono mt-0.5">
                    {formatRupiah(srv.price)}
                  </p>
                </button>
              ))
            : availableProducts.map((prd) => (
                <button
                  key={prd.id}
                  type="button"
                  onClick={() =>
                    addItemToCart({
                      id: prd.id,
                      itemType: "PRODUCT",
                      name: prd.name,
                      price: prd.price || 0,
                    })
                  }
                  className="p-2.5 rounded-xl bg-[var(--background)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-left transition-all cursor-pointer group"
                >
                  <p className="text-xs font-bold text-[var(--foreground)] truncate group-hover:text-amber-400">
                    {prd.name}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-mono mt-0.5">
                    {formatRupiah(prd.price || 0)} (Stok: {prd.stockQty})
                  </p>
                </button>
              ))}
        </div>
      </div>

      {/* Cart Summary List */}
      <div className="bg-[var(--background)]/80 rounded-2xl p-3.5 border border-[var(--border)] space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-[var(--foreground-muted)] border-b border-[var(--border)]/60 pb-1.5">
          <span>Keranjang Pesanan ({cartItems.length} Item)</span>
          <span className="font-mono text-amber-400">{formatRupiah(totalAmount)}</span>
        </div>

        {cartItems.length === 0 ? (
          <div className="py-4 text-center text-xs text-stone-500">
            Pilih layanan atau produk di atas untuk menambahkan ke transaksi.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-xs py-1 border-b border-[var(--border)]/30"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-[var(--foreground)] truncate">{item.name}</p>
                  <p className="text-[10px] text-[var(--foreground-muted)] font-mono">
                    {formatRupiah(item.price)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => decrementItemInCart(item.id)}
                    className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-white cursor-pointer"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <span className="w-5 text-center font-bold text-amber-400">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      addItemToCart({
                        id: item.id,
                        itemType: item.itemType,
                        name: item.name,
                        price: item.price,
                      })
                    }
                    className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-white cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItemFromCart(item.id)}
                    className="p-1 rounded text-stone-500 hover:text-red-400 cursor-pointer ml-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer & Barber Form */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Nama Pelanggan *"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
          />
          <input
            type="tel"
            placeholder="No WhatsApp"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Barber Preference */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[var(--foreground-muted)]">
            Tugaskan / Request Barber:
          </label>
          <select
            value={selectedBarberId}
            onChange={(e) => setSelectedBarberId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ANY">⚡ Siapa Saja (Otomatis Mesin Antrean)</option>
            {availableBarbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.workStatus})
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-1.5 pt-1 border-t border-[var(--border)]/50">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--foreground-muted)]">
            <span>Metode Bayar (Jika Langsung Lunas):</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {(["CASH", "QRIS", "TRANSFER", "EDC"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setPaymentMethod(m);
                  if (m === "CASH") setReceivedCash(totalAmount);
                }}
                className={`py-1.5 px-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer text-center ${
                  paymentMethod === m
                    ? "bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/30"
                    : "bg-[var(--background)] border-[var(--border)] text-[var(--foreground-muted)] hover:text-white"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {paymentMethod === "CASH" && (
            <div className="p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-[var(--foreground-muted)]">
                <span>Uang Diterima:</span>
                <span className="font-mono text-emerald-400">
                  {formatRupiah(receivedCash)}
                </span>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setReceivedCash(totalAmount)}
                  className="py-1 px-2 rounded-lg bg-stone-800 text-[10px] font-bold text-amber-400 border border-[var(--border)] cursor-pointer"
                >
                  Uang Pas
                </button>
                {[50000, 100000, 200000].map((amt) => {
                  if (amt < totalAmount) return null;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setReceivedCash(amt)}
                      className="py-1 px-2 rounded-lg bg-stone-800 text-[10px] font-bold text-white border border-[var(--border)] cursor-pointer"
                    >
                      {formatRupiah(amt)}
                    </button>
                  );
                })}
              </div>
              {receivedCash >= totalAmount && (
                <div className="flex justify-between text-[11px] font-bold text-emerald-400 pt-1 border-t border-[var(--border)]/40">
                  <span>Kembalian:</span>
                  <span className="font-mono">{formatRupiah(changeCash)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons: Pay now vs Pay later */}
      <div className="pt-2 border-t border-[var(--border)] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--foreground-muted)]">
            Total Tagihan:
          </span>
          <span className="text-2xl font-black font-mono text-amber-400">
            {formatRupiah(totalAmount)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isSubmitting || cartItems.length === 0}
            onClick={() => handleSubmit(false)}
            className="py-3 px-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 active:scale-95 text-amber-300 font-bold text-xs transition-all cursor-pointer"
          >
            + Antrean (Bayar Belakang)
          </button>

          <button
            type="button"
            disabled={
              isSubmitting ||
              cartItems.length === 0 ||
              (paymentMethod === "CASH" && receivedCash < totalAmount)
            }
            onClick={() => handleSubmit(true)}
            className="py-3 px-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 disabled:opacity-50 text-stone-950 font-black text-xs shadow-lg shadow-emerald-950/40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Bayar Langsung (Lunas)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
