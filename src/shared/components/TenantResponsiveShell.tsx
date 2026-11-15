"use client";

import React, { Suspense } from "react";
import { TenantBottomNav } from "./TenantBottomNav";
import { TenantSidebar } from "./TenantSidebar";

export interface TenantResponsiveShellProps {
  storeSlug: string;
  storeName?: string;
  brandName?: string;
  activeTab?: "queue" | "pos" | "cash";
  user?: {
    name: string;
    role: string;
    email?: string | null;
    phone?: string;
  };
  onOpenTicket?: () => void;
  onOpenCashDrawer?: () => void;
  children: React.ReactNode;
}

export function TenantResponsiveShell({
  storeSlug,
  storeName = "Cukurin Barbershop",
  brandName,
  activeTab,
  user,
  onOpenTicket,
  onOpenCashDrawer,
  children,
}: TenantResponsiveShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col md:flex-row antialiased selection:bg-[var(--primary)] selection:text-white">
      {/* Desktop Sidebar (Left Column on md+) */}
      <Suspense fallback={<aside className="hidden md:flex w-64 min-h-screen bg-[var(--surface)] border-r border-[var(--border)]" />}>
        <TenantSidebar
          storeSlug={storeSlug}
          storeName={storeName}
          brandName={brandName}
          activeTab={activeTab}
          user={user}
          onOpenTicket={onOpenTicket}
          onOpenCashDrawer={onOpenCashDrawer}
        />
      </Suspense>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col pb-24 md:pb-6 overflow-y-auto">
        {children}
      </main>

      {/* Mobile Bottom Navigation (Fixed at bottom on < md) */}
      <Suspense fallback={null}>
        <TenantBottomNav
          storeSlug={storeSlug}
          activeTab={activeTab}
          onOpenTicket={onOpenTicket}
          onOpenCashDrawer={onOpenCashDrawer}
        />
      </Suspense>
    </div>
  );
}
