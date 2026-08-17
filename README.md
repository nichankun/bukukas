# Buku Kas
Aplikasi pembukuan kas sederhana berbasis Next.js — mencatat transaksi debet/kredit per periode bulan, dengan saldo berjalan otomatis dan ekspor ke Excel.
## Stack
- Next.js 16 (App Router, Server Actions, `proxy.ts`)
- Drizzle ORM (PostgreSQL)
- shadcn/ui (Tailwind CSS v4, Radix UI, Lucide icons)
- TanStack Table v9
## Menjalankan secara lokal
1. Buat file `.env` di root project, isi variabel berikut:
   ```bash
   DATABASE_URL=postgres://user:password@host:5432/nama_db
   AUTH_SECRET=isi_dengan_nilai_acak_kuat   # contoh: openssl rand -base64 32
   ADMIN_USERNAME=username_admin
   ADMIN_PASSWORD=password_admin
   # Opsional — set "true" HANYA kalau app ini di belakang reverse proxy
   # tepercaya (Vercel/Nginx/Cloudflare) yang men-strip header client:
   # TRUST_PROXY_HEADERS=true
   ```
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