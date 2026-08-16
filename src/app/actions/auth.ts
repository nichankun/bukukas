// src/app/actions/auth.ts
"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/session";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

export interface LoginResult {
  success: boolean;
  error?: string;
}

// Perbandingan string waktu-konstan sederhana untuk mengurangi risiko
// timing attack pada perbandingan username/password.
function timingSafeEqual(a: string, b: string): boolean {
  // Bandingkan terhadap panjang maksimum keduanya supaya waktu eksekusi
  // tidak membocorkan info panjang string yang benar lewat early return.
  const maxLength = Math.max(a.length, b.length);
  let mismatch = a.length === b.length ? 0 : 1;

  for (let i = 0; i < maxLength; i++) {
    const charA = i < a.length ? a.charCodeAt(i) : 0;
    const charB = i < b.length ? b.charCodeAt(i) : 0;
    mismatch |= charA ^ charB;
  }

  return mismatch === 0;
}

// Menentukan identifier untuk rate limiting.
//
// PENTING: header `x-forwarded-for` bisa dipalsukan bebas oleh client
// (mis. `fetch(url, { headers: { "x-forwarded-for": "1.2.3.4" } })`)
// kecuali aplikasi berjalan di belakang reverse proxy tepercaya yang
// men-strip/overwrite header ini sebelum request sampai ke Next.js
// (mis. Vercel, Nginx dengan konfigurasi yang benar, Cloudflare, dst).
//
// Kalau kita asal percaya header itu tanpa syarat, penyerang bisa
// mem-bypass rate limit cukup dengan mengganti-ganti nilai header di
// tiap request — rate limit jadi tidak berguna sama sekali.
//
// Solusi: hanya percaya `x-forwarded-for` kalau operator secara eksplisit
// menyatakan (lewat env var `TRUST_PROXY_HEADERS=true`) bahwa deployment
// ini memang di belakang proxy tepercaya. Kalau tidak di-set, fallback ke
// satu bucket global — ini tidak membeda-bedakan IP, tapi tidak bisa
// di-bypass, jadi tetap membatasi total percobaan brute force ke aplikasi.
function getRateLimitIdentifier(headerList: Headers): string {
  const trustProxyHeaders = process.env.TRUST_PROXY_HEADERS === "true";

  if (trustProxyHeaders) {
    const forwardedFor = headerList.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim();
    if (ip) return ip;
  }

  // Default aman: satu bucket global untuk semua percobaan login.
  return "global";
}

export async function loginAction(formData: FormData): Promise<LoginResult> {
  const headerList = await headers();
  const identifier = getRateLimitIdentifier(headerList);

  const rateLimit = checkRateLimit(identifier);
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `Terlalu banyak percobaan login. Coba lagi dalam ${rateLimit.retryAfterSeconds} detik.`,
    };
  }

  const username = formData.get("username");
  const password = formData.get("password");

  if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
    return { success: false, error: "Username dan password wajib diisi!" };
  }

  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validUsername || !validPassword) {
    // Kegagalan konfigurasi server tidak boleh membocorkan detail ke user.
    console.error("ADMIN_USERNAME / ADMIN_PASSWORD belum di-set di environment.");
    return { success: false, error: "Konfigurasi server belum lengkap. Hubungi admin." };
  }

  const usernameOk = timingSafeEqual(username, validUsername);
  const passwordOk = timingSafeEqual(password, validPassword);

  if (!usernameOk || !passwordOk) {
    return { success: false, error: "Username atau password salah!" };
  }

  resetRateLimit(identifier);

  const token = await createSessionToken({ user: username });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return { success: true };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}