-- Create security definer helper functions to bypass RLS and break infinite recursion loops
CREATE OR REPLACE FUNCTION public.buyer_owns_order(order_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = order_id AND orders.user_id = user_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.seller_owns_order_item(order_id UUID, seller_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.order_items
    WHERE order_items.order_id = seller_owns_order_item.order_id 
      AND order_items.seller_id = seller_owns_order_item.seller_id
  );
END;
$$;

-- Grant EXECUTE on functions to public/authenticated/anon
GRANT EXECUTE ON FUNCTION public.buyer_owns_order(UUID, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.seller_owns_order_item(UUID, UUID) TO authenticated, anon;

-- Recreate order_items RLS select policy
DROP POLICY IF EXISTS "order_items seller select" ON public.order_items;
CREATE POLICY "order_items seller select"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    seller_id = auth.uid()
    OR public.is_admin(auth.uid())
    OR public.buyer_owns_order(order_id, auth.uid())
  );

-- Recreate orders RLS select policy
DROP POLICY IF EXISTS "orders seller select via items" ON public.orders;
CREATE POLICY "orders seller select via items"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR user_id = auth.uid()
    OR public.seller_owns_order_item(id, auth.uid())
  );

-- Recreate orders RLS update policy
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

-- Recreate order_items own via order policy to resolve the circular dependency loop
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

-- Helper function to break recursion on seller_orders
CREATE OR REPLACE FUNCTION public.seller_owns_seller_order(order_id UUID, seller_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.seller_orders
    WHERE seller_orders.order_id = seller_owns_seller_order.order_id 
      AND seller_orders.seller_id = seller_owns_seller_order.seller_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.seller_owns_seller_order(UUID, UUID) TO authenticated, anon;

-- Recreate orders seller view policy
DROP POLICY IF EXISTS "orders seller view" ON public.orders;
CREATE POLICY "orders seller view"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    public.seller_owns_seller_order(id, auth.uid())
  );

-- Recreate seller_orders buyer select/insert policies
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

