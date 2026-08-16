# Buku Kas
Aplikasi pembukuan kas sederhana berbasis Next.js — mencatat transaksi debet/kredit per periode bulan, dengan saldo berjalan otomatis dan ekspor ke Excel.
## Stack
- Next.js 16 (App Router, Server Actions, `proxy.ts`)
- Drizzle ORM (PostgreSQL)
- shadcn/ui (Tailwind CSS v4, Radix UI, Lucide icons)
- TanStack Table v9
## Menjalankan secara lokal
1. Salin `.env.example` menjadi `.env` dan isi semua variabel (lihat komentar di masing-masing baris).
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Terapkan skema ke database:
   ```bash
   pnpm drizzle-kit push
   ```
   atau, jika sudah pakai migration files di `./drizzle`:
   ```bash
   pnpm drizzle-kit migrate
   ```
4. Jalankan development server:
   ```bash
   pnpm dev
   ```
5. Buka [http://localhost:3000](http://localhost:3000) — Anda akan diarahkan ke `/login`.
## Catatan keamanan
- Aplikasi ini hanya punya satu akun admin (dari `ADMIN_USERNAME`/`ADMIN_PASSWORD` di env). Cocok untuk pemakaian personal/internal skala kecil, bukan multi-user.
- `AUTH_SECRET` wajib diisi nilai acak yang kuat — aplikasi akan gagal start/menolak login kalau nilainya kosong atau terlalu pendek.