# AGY CLI Instructions & Workspace Context — Cukurin

Selamat datang di proyek **Cukurin (cukurin.app)**!

Repositori ini adalah platform SaaS Manajemen & POS Barbershop Modern berbasis **Mobile-First PWA** untuk barbershop kelas menengah di Indonesia.

---

## 📚 Dokumen Wajib Dibaca Sebelum Coding:

Sebelum membuat atau memodifikasi kode, kamu **WAJIB membaca dokumen acuan di folder `/docs/`**:
1. [`docs/PRD.md`](./docs/PRD.md): Spesifikasi kebutuhan produk lengkap dan user stories.
2. [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md): Arsitektur Feature-Based, pola multi-tenancy, dan alur antrean.
3. [`docs/SCHEMA.md`](./docs/SCHEMA.md): Kamus data lengkap 15 tabel PostgreSQL dan relasi foreign key.
4. [`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md): Standar visual (Warm Modern Barbershop), palet warna, dan ergonomi mobile satu jempol.
5. [`docs/TASKLIST.md`](./docs/TASKLIST.md): Panduan fase implementasi langkah-demi-langkah.
6. [`docs/CONVENTIONS.md`](./docs/CONVENTIONS.md): Standar penulisan kode, batas modul (`src/features/*`), dan format Server Actions.

---

## 🛠️ Tech Stack & Aturan Utama:
* **Runtime & PM:** `bun` (Gunakan `bun` untuk semua instalasi dan eksekusi skrip).
* **Framework:** Next.js (App Router) + TypeScript (Strict Mode).
* **Database:** PostgreSQL on Neon.tech via Prisma ORM.
* **Styling:** Tailwind CSS + Shadcn UI + Lucide Icons (Mengikuti `docs/DESIGN_SYSTEM.md`).
* **Gaya Arsitektur:** **Feature-Based Architecture** (Vertical Slices di `src/features/`). Dilarang mencampur logika fitur ke dalam `src/shared/`.

---

## 🚀 Tugas Awal untuk AGY CLI:
Buka file [`docs/TASKLIST.md`](./docs/TASKLIST.md) dan mulai eksekusi **Fase 1**:
1. Inisialisasi Next.js dengan App Router & TypeScript menggunakan `bun`.
2. Buat struktur folder sesuai [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) (`src/features/...` dan `src/shared/...`).
3. Tulis file `prisma/schema.prisma` berdasarkan definisi di [`docs/SCHEMA.md`](./docs/SCHEMA.md).
4. Update checkbox di [`docs/TASKLIST.md`](./docs/TASKLIST.md) seiring progres berjalan.
