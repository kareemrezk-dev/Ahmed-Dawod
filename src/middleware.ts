import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  // Skip admin panel (has its own layout)
  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Always redirect to default locale (AR) — ignore browser language
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Matcher already excludes _next, api, favicon.ico, and files with dots
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)" ],
};
