-- Real "Buyers" list for the seller dashboard.
-- Sellers can read their own order_items (seller_id = auth.uid()) but NOT the
-- buyers table (buyers is "read own" only). This SECURITY DEFINER function
-- aggregates the calling seller's real buyers (people who ordered their items)
-- and joins buyer profile fields, scoped strictly to auth.uid() so a seller
-- can only ever see their own buyers.

CREATE OR REPLACE FUNCTION public.get_seller_buyers()
RETURNS TABLE (
  buyer_id uuid,
  name text,
  business text,
  email text,
  phone text,
  gst_number text,
  city text,
  address text,
  orders bigint,
  spent numeric,
  last_order_at timestamptz,
  favorite_product text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH items AS (
    SELECT
      oi.buyed_id AS buyer_id,
      oi.order_id,
      oi.line_total,
      oi.quantity,
      coalesce(nullif(oi.product_snapshot->>'name', ''), oi.product_id) AS product_name,
      o.created_at,
      o.shipping_address
    FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE oi.seller_id = auth.uid()
  ),
  agg AS (
    SELECT
      buyer_id,
      count(DISTINCT order_id) AS orders,
      coalesce(sum(line_total), 0) AS spent,
      max(created_at) AS last_order_at
    FROM items
    GROUP BY buyer_id
  ),
  fav AS (
    SELECT DISTINCT ON (buyer_id) buyer_id, product_name
    FROM (
      SELECT buyer_id, product_name, sum(quantity) AS q
      FROM items
      GROUP BY buyer_id, product_name
    ) t
    ORDER BY buyer_id, q DESC NULLS LAST
  ),
  loc AS (
    SELECT DISTINCT ON (buyer_id)
      buyer_id,
      shipping_address->>'city' AS city,
      shipping_address->>'gst_number' AS ship_gst,
      shipping_address->>'contact_name' AS contact_name,
      shipping_address->>'phone' AS ship_phone,
      nullif(concat_ws(', ',
        nullif(shipping_address->>'line1', ''),
        nullif(shipping_address->>'city', ''),
        nullif(shipping_address->>'state', '')
      ), '') AS ship_address
    FROM items
    ORDER BY buyer_id, created_at DESC
  )
  SELECT
    a.buyer_id,
    coalesce(nullif(b.full_name, ''), loc.contact_name, 'Buyer') AS name,
    coalesce(nullif(b.business_name, ''), loc.contact_name, 'Buyer') AS business,
    b.email,
    coalesce(nullif(b.phone, ''), loc.ship_phone) AS phone,
    coalesce(loc.ship_gst, b.shipping_address->>'gst_number') AS gst_number,
    coalesce(loc.city, b.shipping_address->>'city') AS city,
    coalesce(loc.ship_address, nullif(b.address, '')) AS address,
    a.orders,
    a.spent,
    a.last_order_at,
    fav.product_name AS favorite_product
  FROM agg a
  LEFT JOIN public.buyers b ON b.id = a.buyer_id
  LEFT JOIN fav ON fav.buyer_id = a.buyer_id
  LEFT JOIN loc ON loc.buyer_id = a.buyer_id
  ORDER BY a.spent DESC NULLS LAST;
$$;

REVOKE ALL ON FUNCTION public.get_seller_buyers() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_seller_buyers() TO authenticated, service_role;
