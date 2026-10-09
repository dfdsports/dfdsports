-- ==========================================================
-- DFD SPORTS (DESTINATION FOR DREAMS) - DATABASE SCHEMA
-- ==========================================================

-- Enable uuid generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPANY SETTINGS (Single-row central store)
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL DEFAULT 'DFD SPORTS',
  full_name TEXT NOT NULL DEFAULT 'Destination For Dreams',
  tagline TEXT DEFAULT 'Custom Teamwear & Premium Sports Equipment',
  short_description TEXT DEFAULT 'Leading sports equipment supplier and custom teamwear provider for schools, clubs, academies and tournaments.',
  about_description TEXT DEFAULT 'At DFD Sports (Destination For Dreams), we engineer high-performance teamwear, jerseys, and supply top-tier sports equipment pan-India. With unmatched sublimation craftsmanship and equipment sourcing, we empower teams to perform at their highest level.',
  logo_url TEXT,
  favicon_url TEXT,
  phone TEXT,
  whatsapp_number TEXT,
  email TEXT,
  address TEXT,
  google_maps_url TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  youtube_url TEXT,
  twitter_url TEXT,
  business_hours TEXT DEFAULT 'Mon - Sat: 9:00 AM - 8:00 PM',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. HERO SLIDES
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eyebrow TEXT DEFAULT 'DESTINATION FOR DREAMS',
  heading TEXT NOT NULL,
  highlight_text TEXT,
  description TEXT,
  primary_cta_text TEXT DEFAULT 'Explore Collections',
  primary_cta_link TEXT DEFAULT '/collections',
  secondary_cta_text TEXT DEFAULT 'Enquire on WhatsApp',
  secondary_cta_link TEXT DEFAULT '/contact',
  image_url TEXT,
  mobile_image_url TEXT,
  badge_text TEXT DEFAULT 'PLAY • EQUIP • PERFORM',
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CATEGORIES ("Shop the Game")
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  image_url TEXT,
  icon TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. BRANDS ("Brands We Supply")
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  short_description TEXT,
  long_description TEXT,
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  specifications JSONB DEFAULT '{}'::jsonb,
  sizes TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CUSTOM TEAMWEAR ("Made for Your Team")
CREATE TABLE IF NOT EXISTS public.teamwear (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  front_image_url TEXT,
  back_image_url TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
  fabric_options TEXT[] DEFAULT '{}',
  customization_options TEXT[] DEFAULT ARRAY['Team Logo', 'Player Name', 'Player Number', 'Sponsor Branding', 'Custom Sublimation', 'Multiple Colours'],
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. FABRIC COLLECTION
CREATE TABLE IF NOT EXISTS public.fabrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  image_url TEXT,
  specifications TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. WHY DFD SPORTS (Value Propositions)
CREATE TABLE IF NOT EXISTS public.why_choose_us (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. BUSINESS HIGHLIGHTS (Dynamic Stats)
CREATE TABLE IF NOT EXISTS public.highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  suffix TEXT,
  description TEXT,
  icon TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. ENQUIRIES (Customer conversion leads)
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_type TEXT NOT NULL DEFAULT 'general', -- 'product', 'custom_jersey', 'general'
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  product_name TEXT,
  product_id UUID,
  quantity TEXT,
  size_or_requirement TEXT,
  customization_details TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new', -- 'new', 'contacted', 'completed', 'archived'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- INDEXES
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_order ON public.categories(display_order);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);

CREATE INDEX IF NOT EXISTS idx_brands_slug ON public.brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_order ON public.brands(display_order);

CREATE INDEX IF NOT EXISTS idx_teamwear_slug ON public.teamwear(slug);
CREATE INDEX IF NOT EXISTS idx_teamwear_order ON public.teamwear(display_order);

CREATE INDEX IF NOT EXISTS idx_fabrics_order ON public.fabrics(display_order);
CREATE INDEX IF NOT EXISTS idx_hero_slides_order ON public.hero_slides(display_order);
CREATE INDEX IF NOT EXISTS idx_highlights_order ON public.highlights(display_order);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON public.enquiries(created_at DESC);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teamwear ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fabrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.why_choose_us ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- 1. PUBLIC READ POLICIES (Active items for storefront)
CREATE POLICY "Public read company settings" ON public.company_settings FOR SELECT USING (true);
CREATE POLICY "Public read active hero slides" ON public.hero_slides FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active brands" ON public.brands FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active teamwear" ON public.teamwear FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active fabrics" ON public.fabrics FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active why_choose_us" ON public.why_choose_us FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active highlights" ON public.highlights FOR SELECT USING (is_active = true);

-- 2. PUBLIC INSERT ENQUIRIES (Lead submission from storefront)
CREATE POLICY "Public insert enquiries" ON public.enquiries FOR INSERT WITH CHECK (true);

-- 3. ADMIN POLICIES (Authenticated users manage everything)
CREATE POLICY "Admin full access company settings" ON public.company_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access hero slides" ON public.hero_slides FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access categories" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access brands" ON public.brands FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access teamwear" ON public.teamwear FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access fabrics" ON public.fabrics FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access why_choose_us" ON public.why_choose_us FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access highlights" ON public.highlights FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access enquiries" ON public.enquiries FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================================
-- STORAGE BUCKET CONFIGURATION
-- ==========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('dfd-sports', 'dfd-sports', true)
ON CONFLICT (id) DO NOTHING;

-- Public can read storage objects in dfd-sports bucket
CREATE POLICY "Public read storage dfd-sports"
ON storage.objects FOR SELECT
USING (bucket_id = 'dfd-sports');

-- Authenticated users can upload/manage storage objects in dfd-sports bucket
CREATE POLICY "Admin manage storage dfd-sports"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'dfd-sports')
WITH CHECK (bucket_id = 'dfd-sports');
