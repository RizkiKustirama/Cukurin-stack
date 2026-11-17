"use client";

import React, { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Scissors,
  Lock,
  User,
  Eye,
  EyeOff,
  Crown,
  Briefcase,
  ShieldCheck,
  Loader2,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { loginAction } from "./actions";

interface DemoAccount {
  label: string;
  role: string;
  icon: React.ReactNode;
  identifier: string;
  pass: string;
  colorClass: string;
  badgeBg: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: "Owner",
    role: "Owner Toko",
    icon: <Crown className="w-3.5 h-3.5" />,
    identifier: "08111111111",
    pass: "password123",
    colorClass: "hover:border-[#FF4500]/60 hover:bg-[#FF4500]/10 text-[#FF4500] border-white/10",
    badgeBg: "bg-[#FF4500]/15 text-[#FF4500]",
  },
  {
    label: "Kasir",
    role: "Kasir Shift",
    icon: <Briefcase className="w-3.5 h-3.5" />,
    identifier: "08222222222",
    pass: "kasir123",
    colorClass: "hover:border-emerald-500/60 hover:bg-emerald-500/10 text-emerald-400 border-white/10",
    badgeBg: "bg-emerald-500/15 text-emerald-400",
  },
  {
    label: "Barber",
    role: "Barber / Kapster",
    icon: <Scissors className="w-3.5 h-3.5" />,
    identifier: "08333333301",
    pass: "barber123",
    colorClass: "hover:border-sky-500/60 hover:bg-sky-500/10 text-sky-400 border-white/10",
    badgeBg: "bg-sky-500/15 text-sky-400",
  },
  {
    label: "Superadmin",
    role: "Platform Admin",
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    identifier: "admin@cukurin.app",
    pass: "superadmin123",
    colorClass: "hover:border-purple-500/60 hover:bg-purple-500/10 text-purple-400 border-white/10",
    badgeBg: "bg-purple-500/15 text-purple-400",
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFillDemo = (demo: DemoAccount) => {
    setIdentifier(demo.identifier);
    setPassword(demo.pass);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const res = await loginAction(null, { identifier, password });

      if (res.success) {
        const target =
          callbackUrl && !callbackUrl.startsWith("/login")
            ? callbackUrl
            : res.data.redirectUrl;
        router.push(target);
        router.refresh();
      } else {
        setErrorMessage(res.error || "Gagal masuk. Periksa kembali data Anda.");
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-block group">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FF4500] shadow-lg shadow-[#FF4500]/20 mb-4 group-hover:scale-105 transition-transform">
            <Scissors className="w-7 h-7 text-black rotate-[-45deg]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
            Cukurin<span className="text-[#FF4500]">.</span>
          </h1>
        </Link>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 font-light">
          Sistem Operasi & POS Manajemen Barbershop Modern
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#FF4500]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#FF4500]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">
            Masuk ke Akun
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Gunakan No. WhatsApp atau Email terdaftar
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identifier Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="identifier"
              className="block text-xs font-medium text-neutral-300"
            >
              No. WhatsApp / Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <User className="w-4 h-4" />
              </div>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="0812xxxx atau nama@email.com"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-neutral-300"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-white transition-colors focus:outline-none cursor-pointer"
                tabIndex={-1}
                aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 py-3 px-4 bg-[#FF4500] hover:bg-[#e03d00] active:scale-[0.99] text-black font-bold text-sm rounded-full shadow-lg shadow-[#FF4500]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Quick-Fill Section */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF4500]" />
              Akun Demo Siap Pakai
            </span>
            <span className="text-[10px] text-[#FF4500] font-mono">
              1-Klik Autofill
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((demo) => {
              const isActive = identifier === demo.identifier;
              return (
                <button
                  key={demo.label}
                  type="button"
                  onClick={() => handleFillDemo(demo)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 text-xs font-medium cursor-pointer ${
                    isActive
                      ? "bg-[#FF4500]/20 border-[#FF4500] text-white ring-1 ring-[#FF4500]/50 shadow-sm"
                      : `bg-white/5 ${demo.colorClass}`
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${demo.badgeBg}`}>
                    {demo.icon}
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-xs leading-none text-white">
                      {demo.label}
                    </div>
                    <div className="text-[10px] text-neutral-400 truncate mt-1">
                      {demo.role}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Register Promotion Banner */}
      <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
        <p className="text-xs text-neutral-300">
          Belum punya akun Barbershop?{" "}
          <Link
            href="/register"
            className="text-[#FF4500] font-semibold hover:underline inline-flex items-center gap-1 ml-1"
          >
            <span>Daftar Barbershop Baru (Gratis 14 Hari)</span>
            <ArrowRight className="w-3.5 h-3.5 inline" />
          </Link>
        </p>
      </div>

      <div className="text-center mt-6">
        <Link href="/" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
          ← Kembali ke Halaman Utama
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#050505] selection:bg-[#FF4500] selection:text-white">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20 text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF4500] mr-2" />
            <span>Memuat halaman login...</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
