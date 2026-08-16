// src/lib/require-session.ts
import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

/**
 * Pastikan Server Action hanya bisa dieksekusi oleh user yang sudah
 * login. proxy.ts sudah memblokir akses ke halaman, tapi Server
 * Actions bisa dipanggil langsung (mis. lewat devtools/fetch manual)
 * sehingga perlu diverifikasi ulang di sini — jangan bergantung
 * hanya pada satu lapisan proteksi.
 */
export async function requireSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    throw new Error("Unauthorized: sesi tidak valid atau sudah kedaluwarsa.");
  }

  return session;
}
