// Migration script: Create products table and seed data from scraped-products.json
// Run with: npx tsx src/scripts/migrate-products.ts

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface ScrapedProduct {
  slug: string;
  modelNumber: string;
  topCategory: string;
  category: string;
  brand: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  specs: Array<{ labelAr: string; labelEn: string; value: string }>;
  tags: string[];
  sizes?: string[];
  featured?: boolean;
  image?: string;
  images?: string[];
  price?: number;
}

async function main() {
  console.log("📦 Loading scraped products...");
  const rawData = fs.readFileSync(
    path.join(__dirname, "../lib/scraped-products.json"),
    "utf-8"
  );
  const scraped: ScrapedProduct[] = JSON.parse(rawData);
  
  // Filter out catalogs
  const products = scraped.filter(
    (p) => !p.nameAr.includes("كتالوج") && !p.nameEn.toLowerCase().includes("catalog")
  );

  console.log(`✅ Loaded ${products.length} products (filtered from ${scraped.length})`);

  // Check if table exists and has data
  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  if (count && count > 0) {
    console.log(`⚠️  Table 'products' already has ${count} rows. Skipping seed.`);
    console.log("   To re-seed, delete all rows first.");
    return;
  }

  // Transform to DB format
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
  const BATCH_SIZE = 50;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("products").insert(batch);

    if (error) {
      console.error(`❌ Batch ${i / BATCH_SIZE + 1} failed:`, error.message);
      errors++;
    } else {
      inserted += batch.length;
      console.log(
        `  ✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(rows.length / BATCH_SIZE)} — ${inserted}/${rows.length} inserted`
      );
    }
  }

  console.log(`\n🎉 Migration complete! ${inserted} products inserted, ${errors} errors.`);
}

main().catch(console.error);
