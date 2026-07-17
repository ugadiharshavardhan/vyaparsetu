-- Default seller provisioning:
-- When a new seller account is created, give them ownership of every product
-- in the default categories (flour-atta, cooking-oils, salt-sugar,
-- snacks-bakery) and mark the seller verified so those products go live in the
-- marketplace and buyer orders for them route to the seller's dashboard.
--
-- NOTE: products.seller_id / seller_products.product_id are single-owner
-- (UNIQUE product_id). Calling this reassigns those categories to the given
-- seller (moving them from any previous owner). This is intentional so the
-- most recently onboarded seller manages the default catalog.

CREATE OR REPLACE FUNCTION public.assign_default_seller_categories(_seller_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _business text;
  _slugs text[] := ARRAY['flour-atta', 'cooking-oils', 'salt-sugar', 'snacks-bakery'];
  _moved int := 0;
BEGIN
  SELECT coalesce(business_name, full_name, 'VyaparSetu Seller')
  INTO _business
  FROM public.sellers
  WHERE id = _seller_id;

  -- Seller row not present yet: nothing to assign.
  IF _business IS NULL THEN
    RETURN 0;
  END IF;

  -- 1) Reassign product ownership + supplier display JSON to this seller.
  UPDATE public.products p
  SET
    seller_id = _seller_id,
    supplier = jsonb_build_object(
      'id', _seller_id::text,
      'name', _business,
      'location', coalesce(nullif(p.supplier->>'location', ''), 'India'),
      'verified', true,
      'rating', coalesce((p.supplier->>'rating')::numeric, 4.5),
      'yearsActive', coalesce((p.supplier->>'yearsActive')::int, 1)
    ),
    updated_at = now()
  WHERE p.category_slug = ANY(_slugs);

  GET DIAGNOSTICS _moved = ROW_COUNT;

  -- 2) Keep the seller_products junction in sync (single owner per product).
  UPDATE public.seller_products sp
  SET seller_id = _seller_id,
      updated_at = now()
  WHERE sp.product_id IN (
    SELECT id FROM public.products WHERE category_slug = ANY(_slugs)
  );

  INSERT INTO public.seller_products (id, seller_id, product_id)
  SELECT gen_random_uuid()::text, _seller_id, p.id
  FROM public.products p
  WHERE p.category_slug = ANY(_slugs)
    AND NOT EXISTS (
      SELECT 1 FROM public.seller_products sp WHERE sp.product_id = p.id
    );

  -- 3) Verify the seller so their newly-owned products are live in the
  --    marketplace (products RLS gates buyer visibility on verified sellers).
  UPDATE public.sellers
  SET verification_status = 'verified'::public.verification_status,
      updated_at = now()
  WHERE id = _seller_id
    AND verification_status IS DISTINCT FROM 'verified'::public.verification_status;

  RETURN _moved;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_default_seller_categories(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_default_seller_categories(uuid) TO service_role;
