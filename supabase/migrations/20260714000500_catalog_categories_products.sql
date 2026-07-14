-- Catalog tables for marketplace categories & products (NOT cart_items).
-- cart_items stays for per-user cart lines with product_snapshot JSON.

CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  icon TEXT,
  image TEXT,
  product_count INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  sub_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category_slug TEXT NOT NULL REFERENCES public.categories(slug) ON DELETE RESTRICT,
  sub_category TEXT,
  sku TEXT,
  image TEXT NOT NULL,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  wholesale_price NUMERIC(12,2) NOT NULL,
  mrp NUMERIC(12,2) NOT NULL,
  moq INTEGER NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'unit',
  gst_included BOOLEAN NOT NULL DEFAULT true,
  gst_rate NUMERIC(5,2) NOT NULL DEFAULT 18,
  supplier JSONB NOT NULL DEFAULT '{}'::jsonb,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  stock_count INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
  highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  packaging_details TEXT,
  delivery_days INTEGER,
  delivery_estimate TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_category_slug_idx ON public.products (category_slug);
CREATE INDEX IF NOT EXISTS products_sub_category_idx ON public.products (sub_category);
CREATE INDEX IF NOT EXISTS products_featured_idx ON public.products (featured) WHERE featured = true;

GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories public read" ON public.categories;
CREATE POLICY "categories public read"
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "products public read" ON public.products;
CREATE POLICY "products public read"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TRIGGER categories_updated
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER products_updated
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
