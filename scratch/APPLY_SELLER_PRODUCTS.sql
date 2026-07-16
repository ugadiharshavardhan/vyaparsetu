-- =============================================================================
-- RUN THIS ENTIRE FILE IN SUPABASE SQL EDITOR (Lovable / Supabase Dashboard)
-- Project: juoufayfyzpmscxeiydd
-- URL: https://supabase.com/dashboard/project/juoufayfyzpmscxeiydd/sql/new
-- =============================================================================
-- Creates: seller_products table, products.seller_id, order_items.seller_id
-- Then assigns all 65 catalog products to ugadiharshavardhan@gmail.com
-- =============================================================================

-- ---------------------------------------------------------------------------
-- STEP 1: Schema (seller_products + seller_id columns + RLS)
-- ---------------------------------------------------------------------------
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS products_seller_id_idx ON public.products (seller_id);

CREATE TABLE IF NOT EXISTS public.seller_products (
  id TEXT PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT seller_products_product_unique UNIQUE (product_id)
);

CREATE INDEX IF NOT EXISTS seller_products_seller_id_idx
  ON public.seller_products (seller_id);

CREATE INDEX IF NOT EXISTS seller_products_seller_product_idx
  ON public.seller_products (seller_id, product_id);

ALTER TABLE public.seller_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "seller_products public read via products" ON public.seller_products;
DROP POLICY IF EXISTS "seller_products seller select" ON public.seller_products;
CREATE POLICY "seller_products seller select"
  ON public.seller_products FOR SELECT
  TO authenticated
  USING (
    seller_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "seller_products seller insert" ON public.seller_products;
CREATE POLICY "seller_products seller insert"
  ON public.seller_products FOR INSERT
  TO authenticated
  WITH CHECK (
    seller_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = auth.uid())
  );

DROP POLICY IF EXISTS "seller_products seller update" ON public.seller_products;
CREATE POLICY "seller_products seller update"
  ON public.seller_products FOR UPDATE
  TO authenticated
  USING (seller_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (seller_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "seller_products seller delete" ON public.seller_products;
CREATE POLICY "seller_products seller delete"
  ON public.seller_products FOR DELETE
  TO authenticated
  USING (seller_id = auth.uid() OR public.is_admin(auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.seller_products TO authenticated;

DROP POLICY IF EXISTS "products seller insert" ON public.products;
CREATE POLICY "products seller insert"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = auth.uid())
    AND (seller_id IS NULL OR seller_id = auth.uid())
  );

DROP POLICY IF EXISTS "products seller update" ON public.products;
CREATE POLICY "products seller update"
  ON public.products FOR UPDATE
  TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR (seller_id = auth.uid() AND EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = auth.uid()))
  )
  WITH CHECK (
    public.is_admin(auth.uid())
    OR (seller_id = auth.uid() AND EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = auth.uid()))
  );

DROP POLICY IF EXISTS "products seller delete" ON public.products;
CREATE POLICY "products seller delete"
  ON public.products FOR DELETE
  TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR (seller_id = auth.uid() AND EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = auth.uid()))
  );

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS order_items_seller_id_idx ON public.order_items (seller_id);

DROP POLICY IF EXISTS "order_items seller select" ON public.order_items;
CREATE POLICY "order_items seller select"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    seller_id = auth.uid()
    OR public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "orders seller select via items" ON public.orders;
CREATE POLICY "orders seller select via items"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.order_items oi
      WHERE oi.order_id = orders.id AND oi.seller_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "orders seller update via items" ON public.orders;
CREATE POLICY "orders seller update via items"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.order_items oi
      WHERE oi.order_id = orders.id AND oi.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.order_items oi
      WHERE oi.order_id = orders.id AND oi.seller_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.set_order_item_seller_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.seller_id IS NULL AND NEW.product_id IS NOT NULL THEN
    SELECT COALESCE(
      p.seller_id,
      NULLIF(p.supplier->>'id', '')::uuid
    ) INTO NEW.seller_id
    FROM public.products p
    WHERE p.id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_items_set_seller_id ON public.order_items;
CREATE TRIGGER trg_order_items_set_seller_id
  BEFORE INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_order_item_seller_id();

-- ---------------------------------------------------------------------------
-- STEP 2: Backfill ownership for ugadiharshavardhan@gmail.com
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_seller_id uuid;
  v_business text;
BEGIN
  SELECT s.id, COALESCE(s.business_name, s.full_name, 'Seller')
  INTO v_seller_id, v_business
  FROM public.sellers s
  WHERE lower(trim(s.email)) = lower('ugadiharshavardhan@gmail.com')
  LIMIT 1;

  IF v_seller_id IS NULL THEN
    SELECT u.id, COALESCE(u.raw_user_meta_data->>'business_name', u.raw_user_meta_data->>'full_name', 'Seller')
    INTO v_seller_id, v_business
    FROM auth.users u
    WHERE lower(trim(u.email)) = lower('ugadiharshavardhan@gmail.com')
    LIMIT 1;

    IF v_seller_id IS NOT NULL THEN
      INSERT INTO public.sellers (id, email, full_name, business_name)
      SELECT u.id, u.email,
        COALESCE(u.raw_user_meta_data->>'full_name', 'Seller'),
        COALESCE(u.raw_user_meta_data->>'business_name', 'Business')
      FROM auth.users u
      WHERE u.id = v_seller_id
      ON CONFLICT (id) DO NOTHING;
    END IF;
  END IF;

  IF v_seller_id IS NULL THEN
    RAISE EXCEPTION 'Seller not found for ugadiharshavardhan@gmail.com';
  END IF;

  -- Use existing supplier.id on products when seller_id is still null
  UPDATE public.products
  SET seller_id = NULLIF(supplier->>'id', '')::uuid
  WHERE seller_id IS NULL
    AND supplier->>'id' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

  UPDATE public.products
  SET
    seller_id = v_seller_id,
    supplier = jsonb_build_object(
      'id', v_seller_id::text,
      'name', v_business,
      'location', '',
      'verified', true,
      'rating', 4.5,
      'yearsActive', 1
    )
  WHERE seller_id IS NULL OR seller_id = v_seller_id;

  INSERT INTO public.seller_products (id, seller_id, product_id, updated_at)
  SELECT p.id, v_seller_id, p.id, now()
  FROM public.products p
  WHERE p.seller_id = v_seller_id
  ON CONFLICT (product_id) DO UPDATE
  SET seller_id = EXCLUDED.seller_id, updated_at = now();

  UPDATE public.order_items oi
  SET seller_id = p.seller_id
  FROM public.products p
  WHERE oi.product_id = p.id
    AND p.seller_id IS NOT NULL
    AND (oi.seller_id IS NULL OR oi.seller_id <> p.seller_id);

  RAISE NOTICE 'seller_products rows: %', (SELECT count(*) FROM public.seller_products WHERE seller_id = v_seller_id);
END $$;

-- Verify (should return seller_products table + row count)
SELECT 'seller_products' AS table_name, count(*)::int AS rows FROM public.seller_products;
