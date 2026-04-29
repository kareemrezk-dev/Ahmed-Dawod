import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    schema_version: "v1",
    name_for_human: "Ahmed Dawod — Industrial Bearings",
    name_for_model: "ahmed_dawod_bearings",
    description_for_human: "أحمد داود لتجارة رولمان البلي — متخصصون في استيراد وتوريد جميع أنواع ومقاسات الرولمان البلي الأصلي",
    description_for_model: "Ahmed Dawod is Egypt's leading industrial bearings supplier with 589+ products across 9 categories (bearings, linear motion, ball screws, hard chrome, lead screws, fasteners, housings, pulleys, misc). Brands include SKF, FAG, NSK, NTN, KOYO, NACHI, INA, IKO, THK, TIMKEN and more. Ordering is done via WhatsApp. Payment methods: Cash on Delivery (الدفع عند الاستلام), Vodafone Cash (فودافون كاش), InstaPay (إنستا باي). Full product catalog available at /llms-full.txt.",
    auth: { type: "none" },
    api: {
      type: "openapi",
      url: "https://ahmeddawod.com/llms.txt",
    },
    logo_url: "https://ahmeddawod.com/icon-512.png",
    contact_email: "info@ahmeddawod.com",
    legal_info_url: "https://ahmeddawod.com/ar",
  });
}
