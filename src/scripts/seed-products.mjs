// Seed script: Upload products to Supabase
// Run: node src/scripts/seed-products.mjs

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = "https://nlewjhlvxupcavvsyyau.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZXdqaGx2eHVwY2F2dnN5eWF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg1NzAyNCwiZXhwIjoyMDkxNDMzMDI0fQ.UqueZn4_1TgPp0KCxN-v3DmejM_J3AKmHZA9D7OSoP8";

async function main() {
  console.log("📦 Loading products...");
  const raw = readFileSync(join(__dirname, "../lib/scraped-products.json"), "utf-8");
  const scraped = JSON.parse(raw);

  // Filter catalogs
  const products = scraped.filter(
    (p) => !p.nameAr.includes("كتالوج") && !p.nameEn.toLowerCase().includes("catalog")
  );
  console.log(`✅ ${products.length} products loaded`);

  // Transform to DB columns
  const rows = products.map((p) => ({
    slug: p.slug,
    model_number: p.modelNumber || "",
    top_category: p.topCategory || "bearings",
    category: p.category || "",
    brand: p.brand || "",
    name_ar: p.nameAr || "",
    name_en: p.nameEn || "",
    description_ar: p.descriptionAr || "",
    description_en: p.descriptionEn || "",
    specs: p.specs || [],
    tags: p.tags || [],
    sizes: p.sizes || [],
    featured: p.featured || false,
    image: p.image || null,
    images: p.images || [],
    price: p.price || null,
    is_active: true,
  }));

  // Insert in batches of 50
  const BATCH = 50;
  let ok = 0, fail = 0;

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(batch),
    });

    if (res.ok) {
      ok += batch.length;
      console.log(`  ✅ Batch ${Math.floor(i/BATCH)+1}/${Math.ceil(rows.length/BATCH)} — ${ok}/${rows.length}`);
    } else {
      const err = await res.text();
      console.error(`  ❌ Batch ${Math.floor(i/BATCH)+1} failed: ${err}`);
      fail += batch.length;
    }
  }

  console.log(`\n🎉 Done! ${ok} inserted, ${fail} failed.`);
}

main().catch(console.error);
