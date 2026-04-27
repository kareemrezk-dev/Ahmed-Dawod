import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const ADMIN_HASH = process.env.ADMIN_HASH;
  if (!ADMIN_HASH) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const cookie = request.cookies.get("admin_session")?.value;
  if (!cookie || !cookie.includes(".")) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

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
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(token));

    if (valid) {
      return NextResponse.json({ authenticated: true });
    }
  } catch { /* invalid */ }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
