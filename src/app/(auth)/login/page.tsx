"use client";

import React, { useState, useTransition, Suspense } from "react";
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
} from "lucide-react";
import { loginAction } from "./actions";

interface DemoAccount {
  label: string;
  role: string;
  icon: React.ReactNode;
  identifier: string;
  pass: string;
  colorClass: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: "Owner",
    role: "👑 Owner Toko",
    icon: <Crown className="w-3.5 h-3.5" />,
    identifier: "08111111111",
    pass: "password123",
    colorClass: "hover:border-amber-500/60 hover:bg-amber-500/10 text-amber-400 border-amber-600/30",
  },
  {
    label: "Kasir",
    role: "💼 Kasir Shift",
    icon: <Briefcase className="w-3.5 h-3.5" />,
    identifier: "08222222222",
    pass: "kasir123",
    colorClass: "hover:border-emerald-500/60 hover:bg-emerald-500/10 text-emerald-400 border-emerald-600/30",
  },
  {
    label: "Barber",
    role: "✂️ Barber / Kapster",
    icon: <Scissors className="w-3.5 h-3.5" />,
    identifier: "08333333301",
    pass: "barber123",
    colorClass: "hover:border-blue-500/60 hover:bg-blue-500/10 text-blue-400 border-blue-600/30",
  },
  {
    label: "Superadmin",
    role: "🛡️ Superadmin",
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    identifier: "admin@cukurin.app",
    pass: "superadmin123",
    colorClass: "hover:border-purple-500/60 hover:bg-purple-500/10 text-purple-400 border-purple-600/30",
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
        // If there's a valid callbackUrl, redirect to it; otherwise use the calculated role redirect
        const target = callbackUrl && !callbackUrl.startsWith("/login")
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
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-900/40 border border-amber-400/30 mb-4">
          <Scissors className="w-7 h-7 text-white rotate-[-45deg]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
          Cukurin<span className="text-amber-500">.</span>
        </h1>
        <p className="text-sm text-[var(--foreground-muted)] mt-1.5">
          Sistem POS & Manajemen Antrean Barbershop Modern
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Masuk ke Akun
          </h2>
          <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
            Gunakan No. WhatsApp atau Email terdaftar
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identifier Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="identifier"
              className="block text-xs font-medium text-[var(--foreground-muted)]"
            >
              No. WhatsApp / Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--foreground-muted)]">
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
                className="w-full pl-10 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]/50 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-[var(--foreground-muted)]"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--foreground-muted)]">
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
                className="w-full pl-10 pr-11 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]/50 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors focus:outline-none"
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
            className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 active:scale-[0.99] text-white font-medium text-sm rounded-xl shadow-lg shadow-amber-950/40 border border-amber-500/40 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
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
        <div className="mt-8 pt-6 border-t border-[var(--border)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
              ⚡ Akun Demo Siap Pakai
            </span>
            <span className="text-[10px] text-amber-500/80 font-mono">
              Klik untuk autofill
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
                      ? "bg-amber-500/15 border-amber-500 text-amber-300 ring-1 ring-amber-500/50 shadow-sm"
                      : `bg-[var(--background)]/80 ${demo.colorClass}`
                  }`}
                >
                  <span className="shrink-0">{demo.icon}</span>
                  <div className="truncate">
                    <div className="font-semibold text-xs leading-none">
                      {demo.label}
                    </div>
                    <div className="text-[10px] text-[var(--foreground-muted)] truncate mt-1">
                      {demo.identifier}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center mt-6 text-xs text-[var(--foreground-muted)]">
        Belum punya akun Barbershop?{" "}
        <span className="text-amber-500 font-medium hover:underline cursor-pointer">
          Hubungi Tim Cukurin
        </span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[var(--background)]">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20 text-[var(--foreground-muted)]">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500 mr-2" />
            <span>Memuat halaman login...</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
