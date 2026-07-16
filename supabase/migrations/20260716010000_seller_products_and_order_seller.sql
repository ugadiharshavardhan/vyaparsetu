-- Seller-owned catalog linkage + order line seller attribution
-- 1) seller_products: which products belong to which seller
-- 2) products.seller_id: denormalized owner for marketplace + RLS
-- 3) order_items.seller_id: so sellers only see buyer orders for their SKUs

-- ---------------------------------------------------------------------------
-- products.seller_id
-- ---------------------------------------------------------------------------
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS products_seller_id_idx ON public.products (seller_id);

-- ---------------------------------------------------------------------------
-- seller_products (separate ownership table keyed by seller)
-- ---------------------------------------------------------------------------
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
-- Sellers manage their own rows; admins full access; buyers don't need this table
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

-- ---------------------------------------------------------------------------
-- Tighten products RLS: sellers only mutate their own rows
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- order_items.seller_id
-- ---------------------------------------------------------------------------
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS order_items_seller_id_idx ON public.order_items (seller_id);

-- Sellers can read order lines for their products
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

-- Sellers can read parent orders that contain their lines
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

-- Sellers can update order status for orders that include their items
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

-- Backfill seller_id on order_items from products when possible
UPDATE public.order_items oi
SET seller_id = p.seller_id
FROM public.products p
WHERE oi.product_id = p.id
  AND oi.seller_id IS NULL
  AND p.seller_id IS NOT NULL;

-- Auto-stamp seller_id on new order lines from the product owner
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
