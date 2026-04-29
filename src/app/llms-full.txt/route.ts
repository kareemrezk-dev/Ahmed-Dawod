import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: products, error } = await supabase
    .from("products")
    .select("slug, model_number, name_ar, name_en, brand, category, top_category, price, sizes, specs")
    .eq("is_active", true)
    .order("top_category")
    .order("category")
    .order("brand");

  if (error || !products) {
    return new NextResponse("Error fetching products", { status: 500 });
  }

  // Group by top_category
  const grouped: Record<string, typeof products> = {};
  for (const p of products) {
    const cat = p.top_category || "misc";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  }

  const catLabels: Record<string, string> = {
    bearings: "Bearings (بلي)",
    linear: "Linear Motion (لينير)",
    "ball-screw": "Ball Screw (بول سكرو)",
    "hard-chrome": "Hard Chrome (هارد كروم)",
    "lead-screw": "Lead Screw (ليد سكرو)",
    fasteners: "Fasteners (تثبيتات)",
    housings: "Housings (كراسي)",
    pulleys: "Pulleys & Sleeves (جلب)",
    misc: "Miscellaneous (منتجات متنوعة)",
  };

  let output = `# Ahmed Dawod — Full Product Catalog\n`;
  output += `# أحمد داود — كتالوج المنتجات الكامل\n`;
  output += `# Total: ${products.length} products\n`;
  output += `# Generated: ${new Date().toISOString()}\n`;
  output += `# Website: https://ahmeddawod.com\n\n`;

  for (const [cat, items] of Object.entries(grouped)) {
    const label = catLabels[cat] || cat;
    output += `\n## ${label} (${items.length} products)\n\n`;

    for (const p of items) {
      const price = p.price ? `${p.price} EGP` : "Contact for price";
      const sizes = p.sizes?.length ? ` | Sizes: ${p.sizes.join(", ")}` : "";
      const specs = p.specs?.length
        ? ` | ${p.specs.map((s: { labelEn: string; value: string }) => `${s.labelEn}: ${s.value}`).join(", ")}`
        : "";
      
      output += `- **${p.model_number || p.slug}** — ${p.name_ar}`;
      if (p.name_en) output += ` / ${p.name_en}`;
      output += ` | Brand: ${p.brand} | Category: ${p.category} | Price: ${price}${sizes}${specs}`;
      output += ` | URL: https://ahmeddawod.com/ar/products/${p.slug}\n`;
    }
  }

  output += `\n---\n`;
  output += `# How to order: Visit product page → Click "Order via WhatsApp" → Fill details → Confirm\n`;
  output += `# Contact: WhatsApp +201000060164\n`;

  return new NextResponse(output, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
