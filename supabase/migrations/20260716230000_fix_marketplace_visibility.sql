-- Fix marketplace visibility for verified seller products
-- 1) Grant is_admin to anon (policy evaluation was failing)
-- 2) Assign ALL products to ugadiharshavardhan@gmail.com
-- 3) Keep verification gate via is_verified_seller

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_verified_seller(uuid) TO anon, authenticated, service_role;

UPDATE public.sellers
SET verification_status = 'verified'::public.verification_status,
    onboarding_completed = true,
    updated_at = now()
WHERE lower(email) = 'ugadiharshavardhan@gmail.com';

UPDATE public.products p
SET
  seller_id = s.id,
  supplier = jsonb_build_object(
    'id', s.id::text,
    'name', coalesce(s.business_name, 'ugadi'),
    'location', coalesce(nullif(trim(concat_ws(', ', s.city, s.state)), ''), 'India'),
    'verified', true,
    'rating', coalesce((p.supplier->>'rating')::numeric, 4.5),
    'yearsActive', coalesce((p.supplier->>'yearsActive')::int, 5)
  ),
  updated_at = now()
FROM public.sellers s
WHERE lower(s.email) = 'ugadiharshavardhan@gmail.com';

INSERT INTO public.seller_products (id, seller_id, product_id)
SELECT gen_random_uuid(), s.id, p.id
FROM public.products p
CROSS JOIN public.sellers s
WHERE lower(s.email) = 'ugadiharshavardhan@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.seller_products sp WHERE sp.product_id = p.id
  );

UPDATE public.seller_products sp
SET seller_id = s.id
FROM public.sellers s
WHERE lower(s.email) = 'ugadiharshavardhan@gmail.com'
  AND sp.seller_id IS DISTINCT FROM s.id;

DROP POLICY IF EXISTS "products public read" ON public.products;
CREATE POLICY "products public read"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (
    public.is_admin(auth.uid())
    OR seller_id = auth.uid()
    OR (
      seller_id IS NOT NULL
      AND public.is_verified_seller(seller_id)
    )
  );
