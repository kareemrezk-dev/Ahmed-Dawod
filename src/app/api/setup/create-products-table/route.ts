import { NextResponse } from "next/server";

// TEMPORARY: One-time setup endpoint to create the products table
// DELETE THIS FILE AFTER RUNNING SUCCESSFULLY

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  const sql = `
    CREATE TABLE IF NOT EXISTS products (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      model_number TEXT NOT NULL DEFAULT '',
      top_category TEXT NOT NULL DEFAULT 'bearings',
      category TEXT NOT NULL DEFAULT '',
      brand TEXT NOT NULL DEFAULT '',
      name_ar TEXT NOT NULL DEFAULT '',
      name_en TEXT NOT NULL DEFAULT '',
      description_ar TEXT DEFAULT '',
      description_en TEXT DEFAULT '',
      specs JSONB DEFAULT '[]'::jsonb,
      tags TEXT[] DEFAULT '{}',
      sizes TEXT[] DEFAULT '{}',
      featured BOOLEAN DEFAULT false,
      image TEXT,
      images TEXT[] DEFAULT '{}',
      price NUMERIC,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_top_category ON products(top_category);
    CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Public read access') THEN
        CREATE POLICY "Public read access" ON products FOR SELECT USING (true);
      END IF;
    END $$;
  `;

  try {
    // Use Supabase SQL API (available via pg-meta)
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!res.ok) {
      // Fallback: try creating via individual table check
      return NextResponse.json({ 
        status: "manual_required",
        message: "Please paste the SQL in Supabase Dashboard > SQL Editor",
        sql 
      });
    }

    return NextResponse.json({ status: "success" });
  } catch {
    return NextResponse.json({ 
      status: "manual_required",
      message: "Please paste the SQL in Supabase Dashboard > SQL Editor",
      sql 
    });
  }
}
