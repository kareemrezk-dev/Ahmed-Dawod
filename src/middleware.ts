import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n";

async function verifyAdminSession(request: NextRequest): Promise<boolean> {
  const ADMIN_HASH = process.env.ADMIN_HASH;
  if (!ADMIN_HASH) return false;

  const cookie = request.cookies.get("admin_session")?.value;
  if (!cookie || !cookie.includes(".")) return false;

  const [token, sig] = cookie.split(".");

  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(ADMIN_HASH);
    const key = await crypto.subtle.importKey(
      "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
    );
    const sigBytes = new Uint8Array(
      (sig.match(/.{2}/g) || []).map((h) => parseInt(h, 16))
    );
    return await crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(token));
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin protection ──────────────────────────────────────────────────────
  // Allow the login API to pass through
  if (pathname.startsWith("/api/admin/login")) {
    return NextResponse.next();
  }

  // Protect the admin page — require valid session cookie
  if (pathname.startsWith("/admin")) {
    const isAuthed = await verifyAdminSession(request);
    if (!isAuthed) {
      // Return the admin page anyway — the client-side will show login screen
      // But we add a header to tell the client they're not authenticated
      const response = NextResponse.next();
      response.headers.set("x-admin-auth", "false");
      return response;
    }
    const response = NextResponse.next();
    response.headers.set("x-admin-auth", "true");
    return response;
  }

  // ── Locale routing ────────────────────────────────────────────────────────
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    return response;
  }

  // Always redirect to default locale (AR) — ignore browser language
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api/admin/login|favicon.ico|.*\\..*).*)", "/api/admin/:path*"],
};
