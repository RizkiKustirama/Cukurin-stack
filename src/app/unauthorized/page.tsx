import Link from "next/link";
import { ShieldAlert, LogIn, Home, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[var(--background)]">
      <div className="w-full max-w-md mx-auto text-center">
        {/* Warning Icon Badge */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/30 text-red-400 mb-6 shadow-2xl shadow-red-950/40">
          <ShieldAlert className="w-10 h-10" />
        </div>

        {/* Text Details */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)] mb-2">
          Akses Tidak Diizinkan
        </h1>
        <p className="text-sm text-[var(--foreground-muted)] max-w-sm mx-auto mb-8 leading-relaxed">
          Akun Anda tidak memiliki izin untuk mengakses halaman ini. Pastikan Anda telah masuk dengan peran (*role*) yang sesuai.
        </p>

        {/* Action Buttons */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xl space-y-3">
          <Link
            href="/login"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 active:scale-[0.99] text-white font-medium text-sm rounded-xl shadow-lg shadow-amber-950/40 border border-amber-500/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Ganti Akun / Masuk Ulang</span>
          </Link>

          <Link
            href="/"
            className="w-full py-3.5 px-4 bg-[var(--background)] hover:bg-[var(--surface-hover)] text-[var(--foreground)] font-medium text-sm rounded-xl border border-[var(--border)] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4 text-[var(--foreground-muted)]" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Footer help */}
        <p className="text-xs text-[var(--foreground-muted)] mt-6">
          Butuh bantuan eskalasi hak akses? Hubungi Admin atau Owner Barbershop Anda.
        </p>
      </div>
    </div>
  );
}
