import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/pricing.server";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false, error: "Code is required" }, { status: 400 });
    }

    const coupon = await validateCoupon(code);

    if (!coupon) {
      return NextResponse.json({ valid: false });
    }

    // Check expiry
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: "expired" });
    }

    // Check max uses
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ valid: false, error: "max_uses_reached" });
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        min_order: coupon.min_order,
      },
    });
  } catch {
    return NextResponse.json({ valid: false, error: "server_error" }, { status: 500 });
  }
}
