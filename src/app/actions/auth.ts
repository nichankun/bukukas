// src/app/actions/auth.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT } from "jose";

const COOKIE_NAME = "bukukas_session";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET || "default_fallback_secret_key_32bytes";
  return new TextEncoder().encode(secret);
}

export interface LoginResult {
  success: boolean;
  error?: string;
}

export async function loginAction(formData: FormData): Promise<LoginResult> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const validUsername = process.env.ADMIN_USERNAME || "admin";
  const validPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (!username || !password) {
    return { success: false, error: "Username dan password wajib diisi!" };
  }

  if (username !== validUsername || password !== validPassword) {
    return { success: false, error: "Username atau password salah!" };
  }

  // Buat Token JWT yang di-sign secara kriptografis dengan AUTH_SECRET
  const token = await new SignJWT({ user: username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Token otomatis hangus setelah 7 hari
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });

  return { success: true };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/login");
}