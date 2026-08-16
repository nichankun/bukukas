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
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.user !== "string") return null;
    return { user: payload.user };
  } catch {
    return null;
  }
}
