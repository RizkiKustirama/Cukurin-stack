"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Scissors,
  CalendarRange,
  CreditCard,
  ArrowRight,
  TrendingUp,
  Receipt,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState("10:45 AM");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };

    updateClock();
    const timer = setInterval(updateClock, 60000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#FF4500] selection:text-white relative overflow-x-hidden">
      {/* Font & Animation Injections */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap");

        .font-serif {
          font-family: "Playfair Display", Georgia, serif;
        }

        @keyframes float-hand-left {
          0%,
          100% {
            transform: translateY(0) rotate(0);
          }
          50% {
            transform: translateY(-20px) rotate(2deg);
          }
        }

        @keyframes float-hand-right {
          0%,
          100% {
            transform: translateY(0) rotate(0);
          }
          50% {
            transform: translateY(20px) rotate(-2deg);
          }
        }

        .animate-float-left {
          animation: float-hand-left 12s ease-in-out infinite;
        }

        .animate-float-right {
          animation: float-hand-right 14s ease-in-out infinite;
        }

        .noise-overlay {
          position: fixed;
          inset: 0;
          z-index: 40;
          pointer-events: none;
          opacity: 0.05;
          mix-blend-mode: overlay;
          background-image: url("https://grainy-gradients.vercel.app/noise.svg");
        }
      `}</style>

      {/* Grain Noise Overlay */}
      <div className="noise-overlay" />

      {/* ================= STICKY NAVBAR ================= */}
      <nav
        id="main-nav"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "py-4 bg-[#050505]/85 backdrop-blur-md border-b border-white/10 shadow-2xl"
            : "py-7 bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#FF4500] flex items-center justify-center text-black font-bold group-hover:scale-105 transition-transform">
              <Scissors className="w-4 h-4 text-black rotate-[-45deg]" />
            </div>
            <span className="text-2xl font-bold tracking-tighter font-serif text-white">
              Cukurin<span className="text-[#FF4500]">.</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#fitur"
              className="text-xs uppercase tracking-wider text-neutral-400 hover:text-white transition-colors duration-300"
            >
              Fitur Utama
            </a>
            <a
              href="#solusi"
              className="text-xs uppercase tracking-wider text-neutral-400 hover:text-white transition-colors duration-300"
            >
              Solusi Operasional
            </a>
            <a
              href="#harga"
              className="text-xs uppercase tracking-wider text-neutral-400 hover:text-white transition-colors duration-300"
            >
              Harga Paket
            </a>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-medium text-neutral-300 hover:text-white px-3.5 py-2 rounded-full border border-white/15 hover:border-white/40 transition-all"
            >
              Masuk ke Akun
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-5 py-2 rounded-full text-xs font-semibold bg-[#FF4500] hover:bg-[#e03d00] text-black hover:scale-105 transition-all duration-300 shadow-lg shadow-[#FF4500]/20"
            >
              Coba Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20 bg-[#050505]">
        {/* Atmosphere Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          <div className="absolute top-0 left-0 w-full h-full opacity-60 mix-blend-screen">
            <img
              src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=2000"
              alt="Atmosphere Barbershop"
              className="w-full h-full object-cover object-center opacity-30"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/70 to-[#050505] z-10" />
        </div>

        {/* Floating Precision Hand Left */}
        <div className="absolute -left-[5%] top-[10%] w-[40vw] max-w-[800px] z-10 pointer-events-none mix-blend-hard-light opacity-80 animate-float-left">
          <img
            src="https://framerusercontent.com/images/KNhiA5A2ykNYqNkj04Hk6BVg5A.png?width=1540&height=1320"
            alt="Precision Hand"
            className="w-full h-auto object-contain grayscale brightness-50"
          />
        </div>

        {/* Floating Service Hand Right */}
        <div className="absolute -right-[5%] bottom-[5%] w-[35vw] max-w-[700px] z-10 pointer-events-none mix-blend-hard-light opacity-80 animate-float-right">
          <img
            src="https://framerusercontent.com/images/X89VFCABCEjjZ4oLGa3PjbOmsA.png?width=1542&height=1002"
            alt="Service Hand"
            className="w-full h-auto object-contain grayscale brightness-50"
          />
        </div>

        {/* Hero Content Wrapper */}
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center h-full max-w-4xl">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300 font-mono mb-8 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#FF4500]" />
            <span>Sistem Operasi Barbershop Indonesia 2026</span>
          </div>

          {/* Hero Headline */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-medium leading-[1.08] tracking-tight mb-6 text-[#ffe0e0] font-serif"
            style={{ textShadow: "0 0 16px rgba(255,255,255,0.4)" }}
          >
            Cukurin. <br />
            <span className="italic font-light text-[#ffe0e0]">
              Kuasai seni operasional.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-base md:text-lg text-[#ffe0e0]/90 max-w-xl mx-auto mb-10 font-light tracking-wide leading-relaxed"
            style={{ textShadow: "0 0 12px rgba(255,255,255,0.3)" }}
          >
            Platform manajemen dan POS all-in-one untuk barbershop yang
            mengutamakan presisi, kepuasan kapster, dan pertumbuhan bisnis tanpa batas.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#FF4500] hover:bg-[#e03d00] text-black font-bold text-sm tracking-wide shadow-xl shadow-[#FF4500]/25 transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Mulai Coba Gratis 14 Hari</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              <span>Eksplorasi Demo</span>
            </Link>
          </div>

          {/* Location & Time Ticker */}
          <div className="flex items-center gap-4 text-[10px] md:text-xs text-white/40 uppercase tracking-widest mt-12 font-mono">
            <span>{currentTime}</span>
            <span className="w-px h-3 bg-white/20" />
            <span>Jakarta, IDN</span>
            <span className="w-px h-3 bg-white/20" />
            <span className="text-emerald-400">● Sistem Online</span>
          </div>
        </div>
      </section>

      {/* ================= FITUR SECTION ================= */}
      <section id="fitur" className="py-28 relative border-t border-white/5">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl leading-tight text-white/95 mb-6 font-serif">
              Kelola barbershop Anda dengan presisi mata pisau cukur.
            </h2>
            <p className="text-base sm:text-lg text-neutral-400 leading-relaxed font-light">
              Sederhanakan antrean, optimalkan komisi kapster, dan pantau arus kas
              serta inventori dalam satu sistem yang dirancang khusus untuk ritme ruko.
            </p>
          </div>

          {/* Partners / Modern Barbershop Roster */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center opacity-40 grayscale hover:grayscale-0 hover:opacity-80 transition-all duration-500">
            <div className="font-bold text-lg tracking-widest font-mono">BARBERS.CO</div>
            <div className="font-bold text-lg tracking-widest font-mono">GENTLEMAN</div>
            <div className="font-bold text-lg tracking-widest font-mono">CUT&amp;DRY</div>
            <div className="font-bold text-lg tracking-widest font-mono">CLASSIC CUTS</div>
          </div>
        </div>
      </section>

      {/* ================= SOLUSI OPERASIONAL ================= */}
      <section id="solusi" className="py-28 relative overflow-hidden bg-black/40">
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center mb-20">
            <span className="text-xs uppercase tracking-widest text-[#FF4500] font-mono mb-2 block">
              Dirancang untuk Operasional Nyata
            </span>
            <h2 className="text-4xl sm:text-6xl text-center font-serif text-white">
              Ubah cara Anda <br />
              <span className="italic font-light">melayani pelanggan</span>
            </h2>
          </div>

          {/* Grid Solution Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: Orange Highlight */}
            <div className="bg-[#FF4500] rounded-3xl p-8 sm:p-12 flex flex-col justify-between shadow-2xl hover:shadow-[0_20px_50px_rgba(255,69,0,0.3)] transition-all duration-500 group">
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center group-hover:rotate-45 transition-transform duration-500">
                  <CalendarRange className="w-6 h-6 text-black" />
                </div>
                <span className="text-black font-semibold text-xs border border-black/25 px-3 py-1 rounded-full font-mono">
                  01 • ANTREAN
                </span>
              </div>
              <div>
                <h3 className="text-3xl sm:text-4xl text-black mb-4 leading-tight font-serif font-bold">
                  Antrean Cerdas &amp; <br />
                  Loyalitas Kapster
                </h3>
                <p className="text-black/80 text-sm sm:text-base leading-relaxed">
                  Dukung mode Request Barber bagi pelanggan setia atau mode Strict FIFO
                  agar kursi kapster terisi adil dan waktu tunggu terpantau presisi di layar ruang tunggu.
                </p>
              </div>
              <div className="w-full h-px bg-black/15 mt-8" />
            </div>

            {/* Card 2: Dark Editorial */}
            <div className="bg-[#111111] border border-white/10 rounded-3xl p-8 sm:p-12 flex flex-col justify-between shadow-2xl hover:border-[#FF4500]/50 transition-all duration-500 group">
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <CreditCard className="w-6 h-6 text-[#FF4500]" />
                </div>
                <span className="text-white/50 font-medium text-xs border border-white/10 px-3 py-1 rounded-full font-mono">
                  02 • KASIR &amp; KOMISI
                </span>
              </div>
              <div>
                <h3 className="text-3xl sm:text-4xl text-white mb-4 leading-tight font-serif font-bold">
                  POS Kilat &amp; <br />
                  Bagi Hasil Otomatis
                </h3>
                <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
                  Ergonomi satu jempol untuk kasir sibuk. Multi-metode QRIS dan Tunai,
                  struk WhatsApp digital, serta perhitungan komisi jasa barber realtime tanpa rekap manual.
                </p>
              </div>
              <div className="w-full h-px bg-white/10 mt-8" />
            </div>

            {/* Card 3: Buku Kas & Petty Cash */}
            <div className="bg-[#111111] border border-white/10 rounded-3xl p-8 sm:p-12 flex flex-col justify-between shadow-2xl hover:border-[#FF4500]/50 transition-all duration-500 group">
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <Receipt className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-white/50 font-medium text-xs border border-white/10 px-3 py-1 rounded-full font-mono">
                  03 • ARUS KAS
                </span>
              </div>
              <div>
                <h3 className="text-3xl sm:text-4xl text-white mb-4 leading-tight font-serif font-bold">
                  Laci Kasir &amp; <br />
                  Pengeluaran Dadakan
                </h3>
                <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
                  Shift register tutup kasir anti-selisih, pencatatan kas kecil (petty cash)
                  untuk es batu &amp; galon, serta pengawasan stok perlengkapan meja (HPP backbar).
                </p>
              </div>
              <div className="w-full h-px bg-white/10 mt-8" />
            </div>

            {/* Card 4: Executive Dashboard */}
            <div className="bg-[#111111] border border-white/10 rounded-3xl p-8 sm:p-12 flex flex-col justify-between shadow-2xl hover:border-[#FF4500]/50 transition-all duration-500 group">
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <TrendingUp className="w-6 h-6 text-sky-400" />
                </div>
                <span className="text-white/50 font-medium text-xs border border-white/10 px-3 py-1 rounded-full font-mono">
                  04 • ANALITIK
                </span>
              </div>
              <div>
                <h3 className="text-3xl sm:text-4xl text-white mb-4 leading-tight font-serif font-bold">
                  Laba Bersih &amp; <br />
                  Performa Cabang
                </h3>
                <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
                  Laporan laba bersih otomatis setelah dipotong bagi hasil barber dan beban ruko.
                  Owner dapat memantau seluruh cabang langsung dari layar smartphone.
                </p>
              </div>
              <div className="w-full h-px bg-white/10 mt-8" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= PRICING SECTION ================= */}
      <section id="harga" className="py-28 relative border-t border-white/5">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-[#FF4500] font-mono mb-2 block">
              Investasi Terjangkau
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-medium text-white">
              Paket Langganan Transparan
            </h2>
            <p className="text-neutral-400 text-sm mt-3 max-w-md mx-auto font-light">
              Pilih paket yang sesuai dengan ukuran barbershop Anda. Mulai uji coba 14 hari gratis tanpa risiko.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Free Trial Card */}
            <div className="p-7 rounded-3xl bg-[#111111] border border-white/10 flex flex-col justify-between hover:border-white/30 transition-all">
              <div>
                <span className="text-xs uppercase font-mono tracking-wider text-neutral-400">
                  Trial 14 Hari
                </span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold font-serif text-white">Rp 0</span>
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                  Uji coba semua fitur POS &amp; antrean tanpa komitmen kartu kredit.
                </p>
                <div className="w-full h-px bg-white/10 my-6" />
                <ul className="space-y-3 text-xs text-neutral-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4500]" />
                    1 Cabang Barbershop
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4500]" />
                    Hingga 5 Akun Barber
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4500]" />
                    Smart Queue &amp; Kasir POS
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4500]" />
                    Kalkulasi Komisi Otomatis
                  </li>
                </ul>
              </div>
              <Link
                href="/register?plan=trial"
                className="mt-8 w-full py-3 rounded-full border border-white/20 text-center text-xs font-semibold hover:bg-white hover:text-black transition-all"
              >
                Coba Gratis Sekarang
              </Link>
            </div>

            {/* Reguler Card (Highlighted) */}
            <div className="p-7 rounded-3xl bg-gradient-to-b from-white/10 to-[#111111] border-2 border-[#FF4500] flex flex-col justify-between relative shadow-2xl shadow-[#FF4500]/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#FF4500] text-black text-[10px] font-bold uppercase tracking-wider">
                Paling Populer
              </div>
              <div>
                <span className="text-xs uppercase font-mono tracking-wider text-[#FF4500]">
                  Reguler Cabang
                </span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-serif text-white">Rp 199.000</span>
                  <span className="text-xs text-neutral-400">/ bulan</span>
                </div>
                <p className="text-xs text-neutral-300 mt-2">
                  Cocok untuk ruko barbershop 3-5 kursi yang aktif setiap hari.
                </p>
                <div className="w-full h-px bg-white/15 my-6" />
                <ul className="space-y-3 text-xs text-neutral-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4500]" />
                    Semua fitur Trial
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4500]" />
                    Transaksi Kasir Tanpa Batas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4500]" />
                    Buku Kas Kecil &amp; Blind Count
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4500]" />
                    Struk Digital WhatsApp Pelanggan
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4500]" />
                    Dukungan WhatsApp Prioritas
                  </li>
                </ul>
              </div>
              <Link
                href="/register?plan=reguler"
                className="mt-8 w-full py-3 rounded-full bg-[#FF4500] text-center text-xs font-bold text-black hover:bg-[#e03d00] transition-all shadow-lg shadow-[#FF4500]/25"
              >
                Pilih Paket Reguler
              </Link>
            </div>

            {/* Pro Card */}
            <div className="p-7 rounded-3xl bg-[#111111] border border-white/10 flex flex-col justify-between hover:border-white/30 transition-all">
              <div>
                <span className="text-xs uppercase font-mono tracking-wider text-neutral-400">
                  Pro Multi-Cabang
                </span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-serif text-white">Rp 299.000</span>
                  <span className="text-xs text-neutral-400">/ bulan</span>
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                  Untuk pemilik multi-outlet yang ingin kontrol terpusat.
                </p>
                <div className="w-full h-px bg-white/10 my-6" />
                <ul className="space-y-3 text-xs text-neutral-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4500]" />
                    Hingga 3 Cabang Barbershop
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4500]" />
                    Hingga 15 Akun Barber
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4500]" />
                    Inventori Gudang &amp; HPP Backbar
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4500]" />
                    Pelacak Aset Kursi &amp; Clipper
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4500]" />
                    Konsolidasi Laporan Eksekutif
                  </li>
                </ul>
              </div>
              <Link
                href="/register?plan=pro"
                className="mt-8 w-full py-3 rounded-full border border-white/20 text-center text-xs font-semibold hover:bg-white hover:text-black transition-all"
              >
                Pilih Paket Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA SECTION ================= */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#050505] to-[#111111] border-t border-white/5">
        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#FF4500] flex items-center justify-center text-black mx-auto mb-6 shadow-xl shadow-[#FF4500]/25">
            <Scissors className="w-7 h-7 text-black rotate-[-45deg]" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4">
            Bawa Barbershop Anda ke Level Selanjutnya
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 max-w-lg mx-auto mb-8 font-light">
            Tinggalkan pencatatan nota kertas dan sengketa komisi akhir bulan.
            Mulai nikmati sistem manajemen modern dalam 2 menit.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition-all shadow-xl"
            >
              Daftar Barbershop Saya (Gratis 14 Hari)
            </Link>
            <Link
              href="/login"
              className="px-6 py-3.5 rounded-full border border-white/20 text-neutral-300 text-sm hover:text-white hover:border-white/40 transition-colors"
            >
              Sudah Punya Akun? Masuk di Sini
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-20 border-t border-white/5 bg-[#050505] relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
            <div className="w-full md:w-auto">
              <h2 className="text-[12vw] md:text-[8vw] leading-[0.8] tracking-tighter text-white/10 font-bold select-none pointer-events-none uppercase font-serif">
                CUKURIN
              </h2>
            </div>
            <div className="flex flex-col gap-6 text-left md:text-right">
              <div className="flex flex-wrap gap-4 text-xs text-neutral-400">
                <Link href="/login" className="hover:text-white transition-colors">
                  Masuk Akun
                </Link>
                <span>•</span>
                <Link href="/register" className="hover:text-white transition-colors">
                  Daftar Baru
                </Link>
                <span>•</span>
                <a href="#fitur" className="hover:text-white transition-colors">
                  Fitur Antrean
                </a>
                <span>•</span>
                <a href="#solusi" className="hover:text-white transition-colors">
                  POS &amp; Komisi
                </a>
                <span>•</span>
                <a href="#harga" className="hover:text-white transition-colors">
                  Harga
                </a>
              </div>
              <p className="text-xs text-neutral-600">
                &copy; 2026 Cukurin.app — Elevating the art of the cut. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
