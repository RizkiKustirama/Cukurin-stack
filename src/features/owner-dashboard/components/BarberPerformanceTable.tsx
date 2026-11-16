"use client";

import { Users, Scissors, Award, Phone } from "lucide-react";
import type { BarberPerformanceSummary } from "../types";
import { BarberWorkStatus } from "@prisma/client";

interface BarberPerformanceTableProps {
  barbers: BarberPerformanceSummary[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusBadge(status: BarberWorkStatus) {
  switch (status) {
    case "READY":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E8F7EE] text-[#1E8E3E] border border-[#CEEAD6]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1E8E3E]" />
          Ready
        </span>
      );
    case "BUSY":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FDF0F2] text-[#D93025] border border-[#FCDAD7]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D93025]" />
          Sedang Cukur
        </span>
      );
    case "BREAK":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3EB] text-[#D97706] border border-[#FDE6D2]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
          Istirahat
        </span>
      );
    case "OFFLINE":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F6F5F2] text-[#706E68] border border-[#E8E5DE]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A8A59E]" />
          Offline
        </span>
      );
  }
}

export function BarberPerformanceTable({ barbers }: BarberPerformanceTableProps) {
  if (barbers.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-white border border-[#E8E5DE] text-center text-xs text-[#706E68] shadow-[0_1px_3px_rgba(28,25,23,0.02)]">
        Belum ada profil barber terdaftar di cabang toko ini.
      </div>
    );
  }

  const totalHeads = barbers.reduce((sum, b) => sum + b.completedHeadCount, 0);
  const totalBarberCommission = barbers.reduce((sum, b) => sum + b.totalCommissionEarned, 0);

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#E8E5DE] shadow-[0_1px_3px_rgba(28,25,23,0.02)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#D97706]" />
            Laporan Kinerja & Produktivitas Barber
          </h3>
          <p className="text-xs text-[#706E68]">
            Total {barbers.length} barber • {totalHeads} kepala selesai dipotong • Komisi:{" "}
            {formatCurrency(totalBarberCommission)}
          </p>
        </div>
      </div>

      {/* Tampilan Desktop: Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E8E5DE] text-[#706E68] font-semibold">
              <th className="py-2.5 px-3">Barber</th>
              <th className="py-2.5 px-3">Status Saat Ini</th>
              <th className="py-2.5 px-3 text-center">Kepala Cukur</th>
              <th className="py-2.5 px-3 text-right">Omzet Jasa</th>
              <th className="py-2.5 px-3 text-right">Omzet Produk</th>
              <th className="py-2.5 px-3 text-right">Komisi Dihasilkan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E5DE]">
            {barbers.map((b, idx) => (
              <tr key={b.barberId} className="hover:bg-[#F6F5F2] transition-colors">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#F6F5F2] border border-[#E8E5DE] flex items-center justify-center font-bold text-[#1A1A1A] text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-[#1A1A1A]">{b.name}</div>
                      <div className="text-[11px] text-[#706E68] flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {b.phone}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3">{getStatusBadge(b.workStatus)}</td>
                <td className="py-3 px-3 text-center">
                  <span className="font-bold text-[#1A1A1A] font-mono px-2.5 py-1 rounded-full bg-[#F6F5F2] border border-[#E8E5DE]">
                    {b.completedHeadCount}
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-medium text-[#1A1A1A] font-mono">
                  {formatCurrency(b.serviceRevenue)}
                </td>
                <td className="py-3 px-3 text-right font-medium text-[#1A1A1A] font-mono">
                  {formatCurrency(b.productRevenue)}
                </td>
                <td className="py-3 px-3 text-right">
                  <span className="font-bold text-[#1E8E3E] font-mono">
                    {formatCurrency(b.totalCommissionEarned)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tampilan Mobile: Card List */}
      <div className="md:hidden space-y-3">
        {barbers.map((b, idx) => (
          <div
            key={b.barberId}
            className="p-4 rounded-2xl bg-[#F6F5F2] border border-[#E8E5DE] space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-white border border-[#E8E5DE] text-[#1A1A1A] flex items-center justify-center font-bold text-xs">
                  {idx + 1}
                </span>
                <div>
                  <div className="font-bold text-sm text-[#1A1A1A]">{b.name}</div>
                  <div className="text-[11px] text-[#706E68]">{b.phone}</div>
                </div>
              </div>
              <div>{getStatusBadge(b.workStatus)}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#E8E5DE]">
              <div>
                <span className="text-[#706E68] block text-[11px]">Kepala Cukur:</span>
                <span className="font-bold text-[#1A1A1A] font-mono">{b.completedHeadCount} Layanan</span>
              </div>
              <div>
                <span className="text-[#706E68] block text-[11px]">Komisi Earned:</span>
                <span className="font-bold text-[#1E8E3E] font-mono">
                  {formatCurrency(b.totalCommissionEarned)}
                </span>
              </div>
              <div>
                <span className="text-[#706E68] block text-[11px]">Omzet Jasa:</span>
                <span className="font-medium text-[#1A1A1A] font-mono">{formatCurrency(b.serviceRevenue)}</span>
              </div>
              <div>
                <span className="text-[#706E68] block text-[11px]">Omzet Produk:</span>
                <span className="font-medium text-[#1A1A1A] font-mono">{formatCurrency(b.productRevenue)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
