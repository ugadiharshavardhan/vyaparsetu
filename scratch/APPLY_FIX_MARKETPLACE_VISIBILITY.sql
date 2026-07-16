-- Fix marketplace: anon/buyers were blocked because products RLS called is_admin()
-- without EXECUTE for anon, and sellers!inner joins fail under sellers RLS.

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_verified_seller(uuid) TO anon, authenticated, service_role;

-- Ensure primary seller is verified and owns every product
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
WHERE lower(s.email) = 'ugadiharshavardhan@gmail.com'
  AND (
    p.seller_id IS DISTINCT FROM s.id
    OR p.seller_id IS NULL
    OR coalesce(p.supplier->>'id', '') IS DISTINCT FROM s.id::text
  );

-- Keep seller_products ownership in sync for primary seller
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

-- Recreate products read policy (same logic, now callable by anon)
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
