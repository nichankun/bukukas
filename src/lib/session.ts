// src/lib/session.ts
import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE_NAME = "bukukas_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 hari

/**
 * Mengambil secret key untuk sign/verify JWT sesi.
 *
 * PENTING: tidak ada fallback ke nilai default. Jika AUTH_SECRET tidak
 * di-set, aplikasi harus gagal secara eksplisit — bukan diam-diam
 * menerima token yang ditandatangani dengan secret yang bisa ditebak.
 */
function getSecretKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.trim().length < 16) {
    throw new Error(
      "AUTH_SECRET belum di-set atau terlalu pendek (minimal 16 karakter). " +
        "Set environment variable AUTH_SECRET dengan nilai acak yang kuat, " +
        "misalnya hasil dari `openssl rand -base64 32`."
    );
  }

  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  user: string;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  // PENTING: getSecretKey() dipanggil DI LUAR try/catch di bawah.
  //
  // Kalau dipanggil di dalam try, error "AUTH_SECRET belum di-set" akan
  // ikut ke-catch bersama error verifikasi JWT biasa (token invalid/
  // kedaluwarsa/dipalsukan) dan sama-sama menghasilkan `return null` —
  // artinya kegagalan konfigurasi server malah diam-diam diperlakukan
  // sama seperti "user belum login", bertentangan dengan niat di
  // getSecretKey() yang seharusnya gagal *loud*, bukan silent.
  //
  // Dengan getSecretKey() di luar try, error konfigurasi akan langsung
  // throw ke pemanggil (proxy.ts / requireSession()), sesuai desain awal.
  const secretKey = getSecretKey();

  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (typeof payload.user !== "string") return null;
    return { user: payload.user };
  } catch {
    // Di titik ini, secretKey sudah pasti valid — jadi error di sini
    // murni soal token itu sendiri (invalid/kedaluwarsa/dipalsukan),
    // bukan soal konfigurasi server. Aman untuk diperlakukan sebagai
    // "belum login".
    return null;
  }
}