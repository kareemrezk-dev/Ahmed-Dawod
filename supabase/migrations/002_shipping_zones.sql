-- Shipping zones for Egypt governorates
CREATE TABLE IF NOT EXISTS shipping_zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  governorate_ar TEXT NOT NULL,
  governorate_en TEXT NOT NULL,
  zone TEXT NOT NULL DEFAULT 'standard',  -- 'local', 'nearby', 'standard', 'remote'
  shipping_cost NUMERIC NOT NULL DEFAULT 0,
  estimated_days_min INT NOT NULL DEFAULT 1,
  estimated_days_max INT NOT NULL DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed all 27 Egyptian governorates
INSERT INTO shipping_zones (governorate_ar, governorate_en, zone, shipping_cost, estimated_days_min, estimated_days_max) VALUES
  -- Local (same governorate = free/cheapest)
  ('الشرقية', 'Sharqia', 'local', 0, 0, 1),
  
  -- Nearby (Delta & Greater Cairo area)
  ('القاهرة', 'Cairo', 'nearby', 50, 1, 2),
  ('الجيزة', 'Giza', 'nearby', 50, 1, 2),
  ('القليوبية', 'Qalyubia', 'nearby', 50, 1, 2),
  ('الدقهلية', 'Dakahlia', 'nearby', 40, 1, 2),
  ('الغربية', 'Gharbia', 'nearby', 50, 1, 2),
  ('المنوفية', 'Menoufia', 'nearby', 50, 1, 2),
  ('كفر الشيخ', 'Kafr El Sheikh', 'nearby', 60, 1, 2),
  ('البحيرة', 'Beheira', 'nearby', 60, 1, 2),
  ('الإسماعيلية', 'Ismailia', 'nearby', 40, 1, 2),
  ('بورسعيد', 'Port Said', 'nearby', 50, 1, 2),
  ('السويس', 'Suez', 'nearby', 50, 1, 2),
  ('دمياط', 'Damietta', 'nearby', 50, 1, 2),
  
  -- Standard (Upper Egypt & Western)
  ('الإسكندرية', 'Alexandria', 'standard', 70, 2, 3),
  ('الفيوم', 'Fayoum', 'standard', 70, 2, 3),
  ('بني سويف', 'Beni Suef', 'standard', 70, 2, 3),
  ('المنيا', 'Minya', 'standard', 80, 2, 3),
  ('أسيوط', 'Asyut', 'standard', 80, 2, 3),
  ('سوهاج', 'Sohag', 'standard', 90, 2, 4),
  ('قنا', 'Qena', 'standard', 90, 2, 4),
  ('الأقصر', 'Luxor', 'standard', 100, 2, 4),
  ('أسوان', 'Aswan', 'standard', 100, 3, 5),
  
  -- Remote (Sinai, Red Sea, Borders)
  ('شمال سيناء', 'North Sinai', 'remote', 100, 3, 5),
  ('جنوب سيناء', 'South Sinai', 'remote', 120, 3, 5),
  ('البحر الأحمر', 'Red Sea', 'remote', 120, 3, 5),
  ('الوادي الجديد', 'New Valley', 'remote', 120, 4, 7),
  ('مطروح', 'Matrouh', 'remote', 120, 3, 5)
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read shipping_zones" ON shipping_zones;
CREATE POLICY "Public read shipping_zones" ON shipping_zones FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role shipping_zones" ON shipping_zones;
CREATE POLICY "Service role shipping_zones" ON shipping_zones FOR ALL USING (auth.role() = 'service_role');
