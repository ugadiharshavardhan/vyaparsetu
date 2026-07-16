-- Assign entire catalog to primary seller account (ugadiharshavardhan@gmail.com)
-- Run AFTER 20260716010000_seller_products_and_order_seller.sql

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
    RAISE EXCEPTION 'Seller not found for ugadiharshavardhan@gmail.com — sign up as seller first';
  END IF;

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
    );

  INSERT INTO public.seller_products (id, seller_id, product_id, updated_at)
  SELECT p.id, v_seller_id, p.id, now()
  FROM public.products p
  ON CONFLICT (product_id) DO UPDATE
  SET seller_id = EXCLUDED.seller_id, updated_at = now();

  UPDATE public.order_items oi
  SET seller_id = v_seller_id
  FROM public.products p
  WHERE oi.product_id = p.id
    AND p.seller_id = v_seller_id
    AND (oi.seller_id IS NULL OR oi.seller_id <> v_seller_id);

  RAISE NOTICE 'Assigned % products to seller %', (SELECT count(*) FROM public.products WHERE seller_id = v_seller_id), v_seller_id;
END $$;
