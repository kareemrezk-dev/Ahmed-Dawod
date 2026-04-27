import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    const ADMIN_HASH = process.env.ADMIN_HASH;
    if (!ADMIN_HASH) {
      return NextResponse.json({ error: "Auth not configured" }, { status: 503 });
    }

    // Hash the password server-side
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    if (hashHex !== ADMIN_HASH) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Generate a session token (random hex)
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const sessionToken = Array.from(tokenBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Create HMAC of the token using ADMIN_HASH as key for verification
    const keyData = encoder.encode(ADMIN_HASH);
    const key = await crypto.subtle.importKey(
      "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(sessionToken));
    const sigHex = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Cookie value = token.signature
    const cookieValue = `${sessionToken}.${sigHex}`;

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_session", cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
