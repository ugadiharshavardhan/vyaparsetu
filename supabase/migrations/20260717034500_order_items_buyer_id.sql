-- 1) Add column buyed_id to public.order_items referencing public.buyers(id)
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS buyed_id UUID REFERENCES public.buyers(id);

-- 2) Backfill buyed_id from public.orders (matching orders.buyer_id or orders.user_id)
UPDATE public.order_items oi
SET buyed_id = COALESCE(o.buyer_id, o.user_id)
FROM public.orders o
WHERE oi.order_id = o.id
  AND oi.buyed_id IS NULL;

-- 3) Alter column buyed_id to NOT NULL
ALTER TABLE public.order_items ALTER COLUMN buyed_id SET NOT NULL;

-- 4) Add index on buyed_id for performance
CREATE INDEX IF NOT EXISTS order_items_buyed_id_idx ON public.order_items (buyed_id);

-- 5) Drop old RLS policies on public.order_items
DROP POLICY IF EXISTS "order_items seller select" ON public.order_items;
DROP POLICY IF EXISTS "order_items own via order" ON public.order_items;
DROP POLICY IF EXISTS "order_items select" ON public.order_items;
DROP POLICY IF EXISTS "order_items insert" ON public.order_items;
DROP POLICY IF EXISTS "order_items update" ON public.order_items;
DROP POLICY IF EXISTS "order_items delete" ON public.order_items;

-- 6) Create new tightened RLS policies on public.order_items
-- SELECT policy allowing buyers, sellers, and admins
CREATE POLICY "order_items select"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    buyed_id = auth.uid()
    OR seller_id = auth.uid()
    OR public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.seller_orders so
      WHERE so.id = seller_order_id AND so.seller_id = auth.uid()
    )
  );

-- INSERT policy allowing only the buyer of the item
CREATE POLICY "order_items insert"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    buyed_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

-- UPDATE policy allowing the buyer or admin
CREATE POLICY "order_items update"
  ON public.order_items FOR UPDATE
  TO authenticated
  USING (
    buyed_id = auth.uid()
    OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    buyed_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

-- DELETE policy allowing the buyer or admin
CREATE POLICY "order_items delete"
  ON public.order_items FOR DELETE
  TO authenticated
  USING (
    buyed_id = auth.uid()
    OR public.is_admin(auth.uid())
  );

-- 7) Trigger to automatically set and validate buyed_id and buyer_id on insert/update from orders
CREATE OR REPLACE FUNCTION public.set_order_item_buyer_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_buyer_id UUID;
BEGIN
  -- Fetch buyer_id / user_id from parent order
  SELECT COALESCE(buyer_id, user_id) INTO v_buyer_id
  FROM public.orders
  WHERE id = NEW.order_id;

  -- Populate if null
  IF NEW.buyed_id IS NULL THEN
    NEW.buyed_id := v_buyer_id;
  END IF;

  IF NEW.buyer_id IS NULL THEN
    NEW.buyer_id := v_buyer_id;
  END IF;

  -- Validate
  IF NEW.buyed_id IS NULL OR NEW.buyed_id <> v_buyer_id THEN
    RAISE EXCEPTION 'buyed_id % must match order buyer_id %', NEW.buyed_id, v_buyer_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_items_set_buyer_id ON public.order_items;
CREATE TRIGGER trg_order_items_set_buyer_id
  BEFORE INSERT OR UPDATE ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_order_item_buyer_id();
