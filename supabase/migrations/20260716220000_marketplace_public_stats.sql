-- Public landing-page aggregates (SECURITY DEFINER — no row leakage).
CREATE OR REPLACE FUNCTION public.marketplace_public_stats()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'verified_sellers', (
      SELECT count(*)::int FROM public.sellers WHERE verification_status = 'verified'
    ),
    'buyers', (SELECT count(*)::int FROM public.buyers),
    'products', (SELECT count(*)::int FROM public.products),
    'brands', (
      SELECT count(DISTINCT brand)::int
      FROM public.products
      WHERE brand IS NOT NULL AND btrim(brand) <> ''
    ),
    'orders', (SELECT count(*)::int FROM public.orders)
  );
$$;

GRANT EXECUTE ON FUNCTION public.marketplace_public_stats() TO anon, authenticated;
