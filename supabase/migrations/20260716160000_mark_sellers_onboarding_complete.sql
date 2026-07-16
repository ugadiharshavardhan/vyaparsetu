-- Existing sellers already operating the portal should not be trapped on onboarding.
UPDATE public.sellers
SET onboarding_completed = true,
    updated_at = now()
WHERE onboarding_completed = false
  AND (
    NULLIF(trim(COALESCE(business_name, '')), '') IS NOT NULL
    OR NULLIF(trim(COALESCE(gst_number, '')), '') IS NOT NULL
    OR EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.seller_id = sellers.id
    )
  );
