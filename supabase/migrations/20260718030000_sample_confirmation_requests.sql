-- Sample confirmation flow:
-- The sample ships 1-2 days before the final delivery. After the buyer has
-- received it, the seller sends a confirmation request for that order line.
-- The buyer sees it under "Requests" and approves (finalizes the order) or
-- declines. One request per order line.

CREATE TABLE IF NOT EXISTS public.sample_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id uuid NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL,
  buyer_id uuid NOT NULL,
  -- Denormalized display fields so the buyer page needs no cross-table joins
  order_number text NOT NULL DEFAULT '',
  product_name text NOT NULL DEFAULT '',
  seller_name text NOT NULL DEFAULT '',
  message text,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  UNIQUE (order_item_id)
);

CREATE INDEX IF NOT EXISTS idx_sample_requests_buyer ON public.sample_requests (buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sample_requests_seller ON public.sample_requests (seller_id, created_at DESC);

ALTER TABLE public.sample_requests ENABLE ROW LEVEL SECURITY;

-- Seller can create a request only for their own order line.
DROP POLICY IF EXISTS sample_requests_seller_insert ON public.sample_requests;
CREATE POLICY sample_requests_seller_insert ON public.sample_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    seller_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.order_items oi
      WHERE oi.id = order_item_id AND oi.seller_id = auth.uid()
    )
  );

-- Both parties can read their own requests.
DROP POLICY IF EXISTS sample_requests_select ON public.sample_requests;
CREATE POLICY sample_requests_select ON public.sample_requests
  FOR SELECT TO authenticated
  USING (seller_id = auth.uid() OR buyer_id = auth.uid());

-- Only the buyer responds (approve / reject).
DROP POLICY IF EXISTS sample_requests_buyer_update ON public.sample_requests;
CREATE POLICY sample_requests_buyer_update ON public.sample_requests
  FOR UPDATE TO authenticated
  USING (buyer_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid());
