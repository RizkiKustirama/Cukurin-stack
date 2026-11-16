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
    <div className="bg-white border border-[#E8E5DE] rounded-[20px] p-5 sm:p-6 space-y-5 shadow-[0_1px_3px_rgba(28,25,23,0.02)] relative">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[#E8E5DE] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#FFF5EB] border border-[#FDE6D2] flex items-center justify-center text-[#D97706] font-bold">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1A1A1A] tracking-tight">
              Kasir POS Langsung
            </h2>
            <p className="text-xs text-[#706E68]">
              Input cepat tanpa pop-up modal
            </p>
          </div>
        </div>
        {cartItems.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-xs text-[#706E68] hover:text-[#D93025] transition-colors cursor-pointer"
          >
            Bersihkan
          </button>
        )}
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            statusMessage.type === "success"
              ? "bg-[#E8F7EE] border-[#CEEAD6] text-[#1E8E3E]"
              : "bg-[#FDF0F2] border-[#FCDAD7] text-[#D93025]"
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
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F6F5F2] rounded-full border border-[#E8E5DE]">
          <button
            type="button"
            onClick={() => setActiveCatalogTab("SERVICES")}
            className={`py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeCatalogTab === "SERVICES"
                ? "bg-[#111111] text-white shadow-xs"
                : "text-[#706E68] hover:text-[#1A1A1A]"
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Layanan Cukur ({availableServices.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCatalogTab("PRODUCTS")}
            className={`py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeCatalogTab === "PRODUCTS"
                ? "bg-[#111111] text-white shadow-xs"
                : "text-[#706E68] hover:text-[#1A1A1A]"
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
                  className="p-2.5 rounded-xl bg-white hover:bg-[#F6F5F2] border border-[#E8E5DE] text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <p className="text-xs font-bold text-[#1A1A1A] truncate group-hover:text-[#D97706]">
                    {srv.name}
                  </p>
                  <p className="text-[11px] text-[#D97706] font-mono mt-0.5 font-semibold">
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
                  className="p-2.5 rounded-xl bg-white hover:bg-[#F6F5F2] border border-[#E8E5DE] text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <p className="text-xs font-bold text-[#1A1A1A] truncate group-hover:text-[#1A73E8]">
                    {prd.name}
                  </p>
                  <p className="text-[11px] text-[#1A73E8] font-mono mt-0.5 font-semibold">
                    {formatRupiah(prd.price || 0)}{" "}
                    <span className="text-[#706E68] font-normal font-sans text-[10px]">
                      (Stok: {prd.stockQty})
                    </span>
                  </p>
                </button>
              ))}
        </div>
      </div>

      {/* Cart Summary List */}
      <div className="bg-[#F6F5F2] rounded-2xl p-3.5 border border-[#E8E5DE] space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-[#706E68] border-b border-[#E8E5DE] pb-1.5">
          <span>Keranjang Pesanan ({cartItems.length} Item)</span>
          <span className="font-mono font-bold text-[#1A1A1A]">{formatRupiah(totalAmount)}</span>
        </div>

        {cartItems.length === 0 ? (
          <div className="py-4 text-center text-xs text-[#706E68]">
            Pilih layanan atau produk di atas untuk menambahkan ke transaksi.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-xs py-1.5 border-b border-[#E8E5DE]/60 last:border-b-0"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-[#1A1A1A] truncate">{item.name}</p>
                  <p className="text-[10px] text-[#706E68] font-mono">
                    {formatRupiah(item.price)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => decrementItemInCart(item.id)}
                    className="p-1 rounded-full bg-white hover:bg-[#EFECE6] border border-[#E8E5DE] text-[#1A1A1A] cursor-pointer shadow-2xs"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <span className="w-5 text-center font-bold text-[#1A1A1A]">
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
                    className="p-1 rounded-full bg-white hover:bg-[#EFECE6] border border-[#E8E5DE] text-[#1A1A1A] cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItemFromCart(item.id)}
                    className="p-1 rounded-full text-[#706E68] hover:text-[#D93025] cursor-pointer ml-1"
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
            className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8E5DE] text-xs text-[#1A1A1A] placeholder-[#A8A59E] focus:outline-none focus:border-[#111111]"
          />
          <input
            type="tel"
            placeholder="No WhatsApp"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8E5DE] text-xs text-[#1A1A1A] placeholder-[#A8A59E] focus:outline-none focus:border-[#111111]"
          />
        </div>

        {/* Barber Preference */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[#706E68]">
            Tugaskan / Request Barber:
          </label>
          <select
            value={selectedBarberId}
            onChange={(e) => setSelectedBarberId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8E5DE] text-xs text-[#1A1A1A] focus:outline-none focus:border-[#111111] cursor-pointer"
          >
            <option value="ANY">Siapa Saja (Otomatis Mesin Antrean)</option>
            {availableBarbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.workStatus})
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-1.5 pt-1 border-t border-[#E8E5DE]">
          <div className="flex items-center justify-between text-xs font-semibold text-[#706E68]">
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
                className={`py-1.5 px-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer text-center ${
                  paymentMethod === m
                    ? "bg-[#FFF5EB] border-[#D97706] text-[#D97706] ring-1 ring-[#D97706]/30 shadow-2xs"
                    : "bg-white border-[#E8E5DE] text-[#706E68] hover:text-[#1A1A1A]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {paymentMethod === "CASH" && (
            <div className="p-2.5 rounded-xl bg-[#F6F5F2] border border-[#E8E5DE] space-y-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-[#706E68]">
                <span>Uang Diterima:</span>
                <span className="font-mono text-[#1E8E3E] font-bold">
                  {formatRupiah(receivedCash)}
                </span>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setReceivedCash(totalAmount)}
                  className="py-1 px-2.5 rounded-full bg-white text-[10px] font-bold text-[#D97706] border border-[#E8E5DE] cursor-pointer hover:bg-[#FFF5EB]"
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
                      className="py-1 px-2.5 rounded-full bg-white text-[10px] font-bold text-[#1A1A1A] border border-[#E8E5DE] cursor-pointer hover:bg-stone-50"
                    >
                      {formatRupiah(amt)}
                    </button>
                  );
                })}
              </div>
              {receivedCash >= totalAmount && (
                <div className="flex justify-between text-[11px] font-bold text-[#1E8E3E] pt-1 border-t border-[#E8E5DE]">
                  <span>Kembalian:</span>
                  <span className="font-mono">{formatRupiah(changeCash)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons: Pay now vs Pay later */}
      <div className="pt-2 border-t border-[#E8E5DE] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#706E68]">
            Total Tagihan:
          </span>
          <span className="text-2xl font-black font-mono text-[#1A1A1A]">
            {formatRupiah(totalAmount)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isSubmitting || cartItems.length === 0}
            onClick={() => handleSubmit(false)}
            className="py-3 px-3 rounded-full bg-[#FFF5EB] hover:bg-[#FDE6D2] border border-[#FDE6D2] text-[#D97706] font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
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
            className="py-3 px-3 rounded-full bg-[#111111] hover:bg-black active:scale-95 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Bayar Langsung (Lunas)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
