// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

export default async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");

  // Verifikasi keaslian tanda tangan token JWT.
  // Jika AUTH_SECRET tidak di-set, verifySessionToken akan throw —
  // proxy akan gagal loud (500) alih-alih diam-diam menganggap semua
  // orang belum login (atau lebih parah, menerima token palsu).
  let isAuthenticated = false;
  if (token) {
    const session = await verifySessionToken(token);
    isAuthenticated = session !== null;
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
