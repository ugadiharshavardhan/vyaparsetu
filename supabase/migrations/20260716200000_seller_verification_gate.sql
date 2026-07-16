-- Seller verification gate:
-- 1) Buyers/anon only see products from verified sellers
-- 2) Sellers can always see their own products; admins see all
-- 3) Sellers cannot self-verify (only under_review from pending/rejected)
-- 4) Backfill: sellers who already own catalog products are verified

CREATE OR REPLACE FUNCTION public.is_verified_seller(_seller_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.sellers s
    WHERE s.id = _seller_id
      AND s.verification_status = 'verified'::public.verification_status
  );
$$;

REVOKE ALL ON FUNCTION public.is_verified_seller(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_verified_seller(uuid) TO anon, authenticated, service_role;

-- Protect verification_status from seller self-promotion
CREATE OR REPLACE FUNCTION public.sellers_protect_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.verification_status IS NOT DISTINCT FROM OLD.verification_status THEN
    RETURN NEW;
  END IF;

  -- service role / postgres (no JWT) and admins may change freely
  IF auth.uid() IS NULL OR public.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  -- Seller may submit for review only
  IF auth.uid() = NEW.id
     AND NEW.verification_status = 'under_review'::public.verification_status
     AND OLD.verification_status IN (
       'pending'::public.verification_status,
       'rejected'::public.verification_status
     ) THEN
    RETURN NEW;
  END IF;

  NEW.verification_status := OLD.verification_status;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sellers_protect_verification ON public.sellers;
CREATE TRIGGER trg_sellers_protect_verification
  BEFORE UPDATE ON public.sellers
  FOR EACH ROW
  EXECUTE FUNCTION public.sellers_protect_verification();

-- Gate marketplace product reads by seller verification
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
    -- Legacy catalog rows without an owning seller remain visible
    OR seller_id IS NULL
  );

-- Existing sellers who already list products stay visible to buyers
UPDATE public.sellers s
SET verification_status = 'verified'::public.verification_status,
    updated_at = now()
WHERE s.verification_status IS DISTINCT FROM 'verified'::public.verification_status
  AND (
    EXISTS (SELECT 1 FROM public.products p WHERE p.seller_id = s.id)
    OR lower(coalesce(s.email, '')) = 'ugadiharshavardhan@gmail.com'
  );
