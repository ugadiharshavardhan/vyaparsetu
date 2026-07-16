-- Drop functions first to allow changing argument/parameter names (cascades and drops RLS policies that depend on them)
DROP FUNCTION IF EXISTS public.buyer_owns_order(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.seller_owns_order_item(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.seller_owns_seller_order(UUID, UUID) CASCADE;

-- Prefix argument names to avoid ambiguous column reference errors in PL/pgSQL
CREATE OR REPLACE FUNCTION public.buyer_owns_order(_order_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = _order_id AND user_id = _user_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.seller_owns_order_item(_order_id UUID, _seller_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.order_items
    WHERE order_id = _order_id 
      AND seller_id = _seller_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.seller_owns_seller_order(_order_id UUID, _seller_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.seller_orders
    WHERE order_id = _order_id 
      AND seller_id = _seller_id
  );
END;
$$;

-- Grant EXECUTE on functions to public/authenticated/anon
GRANT EXECUTE ON FUNCTION public.buyer_owns_order(UUID, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.seller_owns_order_item(UUID, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.seller_owns_seller_order(UUID, UUID) TO authenticated, anon;

-- ===========================================================================
-- RECREATE CASCADED RLS POLICIES
-- ===========================================================================

-- 1) order_items RLS Policies
DROP POLICY IF EXISTS "order_items seller select" ON public.order_items;
CREATE POLICY "order_items seller select"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    seller_id = auth.uid()
    OR public.is_admin(auth.uid())
    OR public.buyer_owns_order(order_id, auth.uid())
  );

DROP POLICY IF EXISTS "order_items own via order" ON public.order_items;
CREATE POLICY "order_items own via order"
  ON public.order_items FOR ALL
  TO authenticated
  USING (
    public.buyer_owns_order(order_id, auth.uid())
  )
  WITH CHECK (
    public.buyer_owns_order(order_id, auth.uid())
  );

-- 2) orders RLS Policies
DROP POLICY IF EXISTS "orders seller select via items" ON public.orders;
CREATE POLICY "orders seller select via items"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR user_id = auth.uid()
    OR public.seller_owns_order_item(id, auth.uid())
  );

DROP POLICY IF EXISTS "orders seller update via items" ON public.orders;
CREATE POLICY "orders seller update via items"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR public.seller_owns_order_item(id, auth.uid())
  )
  WITH CHECK (
    public.is_admin(auth.uid())
    OR public.seller_owns_order_item(id, auth.uid())
  );

DROP POLICY IF EXISTS "orders seller view" ON public.orders;
CREATE POLICY "orders seller view"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    public.seller_owns_seller_order(id, auth.uid())
  );

-- 3) seller_orders RLS Policies
DROP POLICY IF EXISTS "seller_orders buyer view" ON public.seller_orders;
CREATE POLICY "seller_orders buyer view"
  ON public.seller_orders FOR SELECT
  TO authenticated
  USING (
    public.buyer_owns_order(order_id, auth.uid())
  );

DROP POLICY IF EXISTS "seller_orders buyer insert" ON public.seller_orders;
CREATE POLICY "seller_orders buyer insert"
  ON public.seller_orders FOR INSERT
  TO authenticated
  WITH CHECK (
    public.buyer_owns_order(order_id, auth.uid())
  );
