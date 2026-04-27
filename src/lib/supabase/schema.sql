-- جدول الأسعار
CREATE TABLE IF NOT EXISTS public.product_pricing (
  product_slug text PRIMARY KEY,
  price numeric NOT NULL,
  discount_price numeric,
  stock_quantity integer DEFAULT 100,
  is_available boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- جدول الكوبونات
CREATE TABLE IF NOT EXISTS public.coupons (
  code text PRIMARY KEY,
  discount_percentage numeric NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- سياسات الأمان (Row Level Security)
ALTER TABLE public.product_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بقراءة الأسعار والكوبونات
CREATE POLICY "Allow public read access for pricing" ON public.product_pricing FOR SELECT USING (true);
CREATE POLICY "Allow public read access for coupons" ON public.coupons FOR SELECT USING (true);

-- ملاحظة: للتعديل على الأسعار أو الكوبونات، استخدم لوحة تحكم Supabase مباشرة 
-- أو يمكنك تفعيل سياسات الإضافة/التعديل للمديرين فقط لاحقاً.
