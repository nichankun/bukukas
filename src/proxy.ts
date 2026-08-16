// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "bukukas_session";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET || "default_fallback_secret_key_32bytes";
  return new TextEncoder().encode(secret);
}

export default async function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");

  let isAuthenticated = false;

  // Verifikasi keaslian tanda tangan token JWT
  if (token) {
    try {
      await jwtVerify(token, getSecretKey());
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // Jika belum login & mencoba buka dashboard -> redirect ke /login
  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Jika sudah login & membuka halaman /login -> redirect ke dashboard /
  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};