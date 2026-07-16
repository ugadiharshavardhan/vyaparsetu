-- Assign salt-sugar, snacks-bakery, spices, tea-coffee products
-- to pending seller madhusethusagar576@gmail.com (hidden from buyers until verified).

DO $$
DECLARE
  _seller_id uuid;
  _business text;
  _moved int;
BEGIN
  SELECT id, coalesce(business_name, 'madhu')
  INTO _seller_id, _business
  FROM public.sellers
  WHERE lower(email) = 'madhusethusagar576@gmail.com';

  IF _seller_id IS NULL THEN
    RAISE EXCEPTION 'Seller madhusethusagar576@gmail.com not found';
  END IF;

  -- Keep pending so marketplace RLS hides these products from buyers
  UPDATE public.sellers
  SET verification_status = 'pending'::public.verification_status,
      updated_at = now()
  WHERE id = _seller_id
    AND verification_status IS DISTINCT FROM 'pending'::public.verification_status;

  UPDATE public.products p
  SET
    seller_id = _seller_id,
    supplier = jsonb_build_object(
      'id', _seller_id::text,
      'name', _business,
      'location', 'India',
      'verified', false,
      'rating', coalesce((p.supplier->>'rating')::numeric, 4.5),
      'yearsActive', coalesce((p.supplier->>'yearsActive')::int, 3)
    ),
    updated_at = now()
  WHERE p.category_slug IN ('salt-sugar', 'snacks-bakery', 'spices', 'tea-coffee');

  GET DIAGNOSTICS _moved = ROW_COUNT;

  -- Sync ownership table
  UPDATE public.seller_products sp
  SET seller_id = _seller_id
  WHERE sp.product_id IN (
    SELECT id FROM public.products
    WHERE category_slug IN ('salt-sugar', 'snacks-bakery', 'spices', 'tea-coffee')
  );

  INSERT INTO public.seller_products (id, seller_id, product_id)
  SELECT gen_random_uuid(), _seller_id, p.id
  FROM public.products p
  WHERE p.category_slug IN ('salt-sugar', 'snacks-bakery', 'spices', 'tea-coffee')
    AND NOT EXISTS (
      SELECT 1 FROM public.seller_products sp WHERE sp.product_id = p.id
    );

  RAISE NOTICE 'Moved % products to pending seller %', _moved, _seller_id;
END $$;
