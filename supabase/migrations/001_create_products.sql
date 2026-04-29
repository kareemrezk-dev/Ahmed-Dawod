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
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access" ON products;
CREATE POLICY "Public read access" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access" ON products;
CREATE POLICY "Service role full access" ON products FOR ALL USING (auth.role() = 'service_role');
