-- Run: node scripts/apply-strict-verified-products.mjs
-- Strict: only verified sellers' products visible to buyers/anon

UPDATE public.products p
SET seller_id = s.id,
    updated_at = now()
FROM public.sellers s
WHERE p.seller_id IS NULL
  AND lower(coalesce(s.email, '')) = 'ugadiharshavardhan@gmail.com'
  AND s.verification_status = 'verified'::public.verification_status;

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
