# 💈 Cukurin (cukurin.app)

> **Platform SaaS Manajemen Operasional & POS Barbershop Modern Berbasis Mobile-First.**  
> Dirancang khusus untuk barbershop kelas menengah di Indonesia: Tanpa biaya pengadaan hardware mahal, transparan dalam pembagian komisi barber, dan anti-bocor uang kasir.

---

## 🎯 Latar Belakang & Masalah Lapangan

Mayoritas barbershop kelas menengah di Indonesia menghadapi 4 kendala utama:
1. **Penghitungan Komisi Manual & Rawan Konflik:** Komisi potong rambut dan insentif penjualan pomade masih dicatat manual di buku tulis, memakan waktu 1–2 jam tiap malam saat tutup toko.
2. **Kecemburuan Antrean Barber:** Pelanggan yang request barber tertentu sering memicu perselisihan antrean di antara para barber jika tidak diatur secara transparan.
3. **Selisih Uang Kasir (Laci Kas Tekor):** Kasir sering mengeluarkan uang dadakan (beli galon, bayar sampah, atau bayar komisi harian barber tunai) tanpa pencatatan rapi, menyebabkan uang fisik di laci selalu minus saat tutup toko.
4. **Hambatan Biaya Hardware:** Kebanyakan software POS mewajibkan tablet iPad atau PC kasir seharga jutaan rupiah. **Cukurin** memecahkan masalah ini dengan desain **Mobile-First PWA** yang berjalan lancar 100% dari HP Android seharga 1 jutaan.

---

## 🚀 Fitur Unggulan Sistem

### 1. 📱 POS Kasir Mobile-First (Front Office)
* **One-Thumb Operation:** Didesain khusus untuk layar smartphone kasir (6 inci) dengan navigasi bawah dan tombol jempol yang besar.
* **Dua Tipe Transaksi:**
  * `SERVICE`: Siklus pengerjaan kursi potong rambut (antre ➡️ pengerjaan ➡️ selesai).
  * `RETAIL_ONLY`: Penjualan cepat produk pomade/tonic tanpa mengotori antrean potong rambut.
* **Fleksibilitas Pembayaran:** Mendukung alur *Bayar di Depan*, *Bayar di Akhir*, serta penambahan item (*Add-on*) di tengah pengerjaan.
* **Pemisahan Kas Tunai & QRIS:** Otomatis memisahkan uang fisik laci dan uang digital di rekening.

### 2. ✂️ Mesin Antrean Cerdas (Smart Queue Engine)
* **Jalur Antrean Ganda:** Mendukung pelanggan yang *Request Barber Tertentu* maupun *Bebas (Siapa Saja yang Kosong)*.
* **Penempatan Semi-Otomatis (Ready / Break):** Saat pengerjaan selesai, kasir memvalidasi status barber (`🟢 Ready` atau `🟡 Break`). Jika Ready, sistem otomatis mem-plot antrean teratas.
* **Sakelar Budaya Antrean (Queue Strategy Switch):**
  * `Mode Loyalitas (Default)`: Memprioritaskan pelanggan yang request barber saat barber pilihannya selesai.
  * `Mode Strict FIFO (Express)`: Siapa datang duluan selalu dilayani duluan (cocok untuk barbershop cepat di area kampus/stasiun).

### 3. 👥 Manajemen Komisi & Payroll Fleksibel
* **Aturan per Individu:** Pengaturan persentase bagi hasil jasa (misal: 50:50), insentif produk retail flat per pcs, dan gaji pokok (opsional).
* **Mendukung Barber Tetap & Freelance:** Fleksibel untuk karyawan tetap maupun barber pengganti yang hanya masuk 1–2 minggu.
* **Pencairan Fleksibel:** Komisi bisa dicairkan Harian (tunai via laci kasir), Mingguan, atau Bulanan.
* **Halaman HP Khusus Barber:** Barber bisa login dari smartphone pribadi untuk memantau rekap komisi pribadinya secara real-time.
* **Tip Kasir 100% Utuh:** Tip non-tunai (QRIS) dialokasikan 100% ke saldo barber yang melayani tanpa potongan toko.

### 4. 💵 Buku Kas Harian & Pengendalian Kas Kecil (Petty Cash)
* **Siklus Kasir Harian:** Buka kasir pagi (modal awal) dan tutup kasir malam.
* **Pencairan Komisi dari Laci Kasir:** Menghilangkan selisih kasir palsu saat kasir menyerahkan komisi harian tunai ke barber.
* **Petty Cash:** Catat pengeluaran dadakan toko dari laci (air galon, sapu, baterai, sampah).
* **Tutup Kasir Wajib Verifikasi Fisik (Blind Count):** Kasir wajib mengetik jumlah uang tunai di laci untuk mendeteksi selisih secara transparan.

### 5. 📦 Manajemen Inventori Ganda
* **Stok Retail (Dijual):** Otomatis berkurang saat transaksi POS kasir.
* **Stok Meja (Backbar / Store Use):** Pengeluaran produk dari gudang ke meja barber (tonic, powder, spray) dicatat sebagai beban operasional toko tanpa mengurangi kas.

### 6. 💈 CRM & Riwayat Pelanggan Ringan
* **Pencarian Cepat No. WhatsApp:** Cukup ketik beberapa digit nomor untuk memanggil data.
* **Loyalty Counter:** Pelacak otomatis frekuensi kunjungan potong rambut.
* **Haircut Notes (Opsional):** Catatan preferensi model rambut terakhir pelanggan.

### 7. 🎨 Personalisasi Merek (Light White-Labeling)
* **Custom Logo & Warna Toko:** Setiap barbershop bisa memasang logo dan warna aksen brand mereka sendiri di aplikasi kasir.
* **Setup Wizard Cepat:** Panduan onboarding 3 langkah (Identitas Toko ➡️ Input Barber ➡️ Input Layanan) dalam waktu 2 menit.
* **Powered by Cukurin:** Branding platform elegan di footer sistem.

---

## 📦 Paket Langganan SaaS (Pricing Tiers)

| Fitur | Paket REGULER (Starter) | Paket PRO (Growth) | Paket ENTERPRISE |
| :--- | :---: | :---: | :---: |
| **Target** | Barbershop 1 Cabang (1–5 Kursi) | Barbershop Ramai & Multi-Cabang | Jaringan Franchise / 4+ Cabang |
| **Batas Cabang** | 1 Cabang | Hingga 3 Cabang | Unlimited Cabang |
| **Batas Barber** | Hingga 5 Barber | Unlimited Barber | Unlimited Barber |
| **POS Mobile & Antrean** | ✅ Lengkap | ✅ Lengkap | ✅ Lengkap |
| **Komisi & Buku Kas** | ✅ Lengkap | ✅ Lengkap | ✅ Lengkap |
| **Cetak Struk Bluetooth**| ❌ (Paperless / WA) | ✅ Thermal 58mm/80mm | ✅ Thermal 58mm/80mm |
| **Sakelar Strategi Antrean** | ❌ (Terkunci Mode Default) | ✅ Bebas Pilih Mode | ✅ Bebas Pilih Mode |
| **Ekspor Laporan Excel** | ❌ | ✅ Excel / CSV | ✅ Excel / CSV |
| **Struk Otomatis via WA** | ❌ | ❌ | ✅ WhatsApp Gateway Resmi |

---

## 🛠️ Tech Stack & Arsitektur

* **Framework:** [Next.js](https://nextjs.org/) (App Router, Fullstack TypeScript)
* **Runtime & Package Manager:** [Bun](https://bun.sh/)
* **Database:** [PostgreSQL](https://www.postgresql.org/) hosted on [Neon.tech](https://neon.tech/) (Serverless with Connection Pooling)
* **ORM:** [Prisma ORM](https://www.prisma.io/)
* **Styling & UI:** [Tailwind CSS v4](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/) + [Lucide Icons](https://lucide.dev/)
* **State Management:** [Zustand](https://github.com/pmndrs/zustand)
* **Auth & Security:** NextAuth.js / Auth.js (Role-based: Superadmin, Owner, Manager, Cashier, Barber)

---

## 🗄️ Ringkasan Struktur Database (14 Tabel Inti)

1. `tenants`: Akun langganan barbershop (Status Trial 14 hari, Paket, Expiry, Logo & Warna Brand).
2. `stores`: Cabang toko fisik (Alamat, Pengaturan Sakelar Antrean).
3. `users`: Autentikasi pengguna & role (Superadmin, Owner, Manager, Cashier, Barber).
4. `barber_profiles`: Detail kompensasi barber (Gaji pokok, % komisi jasa, flat insentif produk, status Ready/Break/Busy).
5. `services`: Master paket & layanan pengerjaan potong rambut.
6. `products`: Master produk retail jualan toko.
7. `store_consumptions`: Pencatatan stok gudang yang dipakai di meja barber (Backbar).
8. `customers`: Database pelanggan tingkat tenant (No. HP WhatsApp, Haircut notes, Visit counter).
9. `tickets`: Tiket antrean & order kasir (Order type: SERVICE / RETAIL_ONLY, Status Pengerjaan & Pembayaran).
10. `ticket_items`: Detail paket potong, produk tambahan (add-on), dan alokasi komisi barber.
11. `ticket_payments`: Rincian pembayaran transaksi (Cash, QRIS, Transfer).
12. `daily_registers`: Buku kas harian (Buka pagi isi modal, tutup malam hitung fisik, selisih kas).
13. `petty_cash_expenses`: Pengeluaran dadakan laci kasir (galon, baterai, kebersihan).
14. `commission_ledgers`: Buku saldo komisi & tip barber (Pencairan tunai laci vs transfer).

---

## 🚀 Memulai Pengembangan Lokal (Local Development)

### 1. Prasyarat
* Bun installed (`bun --version` >= 1.2)
* Akun PostgreSQL di [Neon.tech](https://neon.tech/)

### 2. Instalasi Dependensi
```bash
bun install
```

### 3. Konfigurasi Environment Variable
Salin file `.env.example` menjadi `.env` dan lengkapi koneksi Neon:
```env
DATABASE_URL="postgresql://user:password@ep-xyz-pooler.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require"
AUTH_SECRET="your-super-secret-key"
```

### 4. Setup Database
```bash
bun prisma db push
bun prisma db seed
```

### 5. Jalankan Server Dev
```bash
bun dev
```
Buka browser di `http://localhost:3000`.

---

## 📄 Lisensi
Proprietary — Dikembangkan oleh Tim **Cukurin**. Seluruh hak cipta dilindungi undang-undang.
