-- 1) Alter public.sellers to add rating statistics columns
ALTER TABLE public.sellers
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS review_count INTEGER NOT NULL DEFAULT 0;

-- 2) Create product_reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.buyers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_product_buyer_review UNIQUE (product_id, buyer_id)
);

-- 3) Create purchase verification helper
CREATE OR REPLACE FUNCTION public.has_purchased_product(_buyer_id UUID, _product_id TEXT)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.orders o
    JOIN public.order_items oi ON oi.order_id = o.id
    WHERE o.user_id = _buyer_id
      AND oi.product_id = _product_id
      AND o.status != 'cancelled'
  );
END;
$$ LANGUAGE plpgsql;

-- 4) Enable RLS and add policies
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_reviews_read" ON public.product_reviews;
CREATE POLICY "product_reviews_read"
  ON public.product_reviews FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "product_reviews_insert" ON public.product_reviews;
CREATE POLICY "product_reviews_insert"
  ON public.product_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = buyer_id
    AND public.has_purchased_product(auth.uid(), product_id)
  );

DROP POLICY IF EXISTS "product_reviews_update" ON public.product_reviews;
CREATE POLICY "product_reviews_update"
  ON public.product_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = buyer_id)
  WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "product_reviews_delete" ON public.product_reviews;
CREATE POLICY "product_reviews_delete"
  ON public.product_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = buyer_id);

-- 5) Trigger to recalculate product rating when reviews change
CREATE OR REPLACE FUNCTION public.update_ratings_after_review()
RETURNS TRIGGER AS $$
DECLARE
  v_seller_id UUID;
  v_prod_avg NUMERIC(3,2);
  v_prod_count INTEGER;
  v_product_id TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_product_id := OLD.product_id;
  ELSE
    v_product_id := NEW.product_id;
  END IF;

  -- Recalculate and update modified product's rating/count
  SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0.00), COUNT(*)
  INTO v_prod_avg, v_prod_count
  FROM public.product_reviews
  WHERE product_id = v_product_id;

  UPDATE public.products
  SET rating = v_prod_avg,
      review_count = v_prod_count,
      updated_at = now()
  WHERE id = v_product_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_ratings_after_review ON public.product_reviews;
CREATE TRIGGER trg_update_ratings_after_review
  AFTER INSERT OR UPDATE OR DELETE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_ratings_after_review();

-- 6) Trigger to recalculate seller rating when product ratings or delete occur
CREATE OR REPLACE FUNCTION public.update_seller_rating_after_product_change()
RETURNS TRIGGER AS $$
DECLARE
  v_seller_id UUID;
  v_seller_avg NUMERIC(3,2);
  v_seller_count INTEGER;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_seller_id := OLD.seller_id;
  ELSE
    v_seller_id := NEW.seller_id;
  END IF;

  IF v_seller_id IS NOT NULL THEN
    -- Total count of reviews and average rating of these reviews across all seller's products
    SELECT COALESCE(ROUND(AVG(pr.rating)::numeric, 2), 0.00), COUNT(pr.id)
    INTO v_seller_avg, v_seller_count
    FROM public.product_reviews pr
    JOIN public.products p ON p.id = pr.product_id
    WHERE p.seller_id = v_seller_id;

    UPDATE public.sellers
    SET rating = v_seller_avg,
        review_count = v_seller_count,
        updated_at = now()
    WHERE id = v_seller_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_seller_rating_after_product_change ON public.products;
CREATE TRIGGER trg_update_seller_rating_after_product_change
  AFTER UPDATE OF rating, review_count OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_seller_rating_after_product_change();

-- 7) Trigger on public.sellers to propagate verified/rating updates to products.supplier
CREATE OR REPLACE FUNCTION public.propagate_seller_changes_to_products()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products p
  SET supplier = jsonb_build_object(
        'id', NEW.id::text,
        'name', COALESCE(NEW.business_name, NEW.full_name, 'ugadi'),
        'location', COALESCE(NULLIF(TRIM(CONCAT_WS(', ', NEW.city, NEW.state)), ''), 'India'),
        'verified', (NEW.verification_status = 'verified'),
        'rating', COALESCE(NEW.rating, 0.00),
        'reviewCount', COALESCE(NEW.review_count, 0),
        'yearsActive', COALESCE(NEW.years_in_business, 5)
      ),
      updated_at = now()
  WHERE p.seller_id = NEW.id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_propagate_seller_changes_to_products ON public.sellers;
CREATE TRIGGER trg_propagate_seller_changes_to_products
  AFTER UPDATE OF business_name, full_name, city, state, verification_status, rating, review_count, years_in_business ON public.sellers
  FOR EACH ROW EXECUTE FUNCTION public.propagate_seller_changes_to_products();

-- 8) Create get_public_supplier RPC
CREATE OR REPLACE FUNCTION public.get_public_supplier(_identifier TEXT)
RETURNS JSONB SECURITY DEFINER AS $$
DECLARE
  v_seller RECORD;
  v_id UUID;
BEGIN
  BEGIN
    v_id := _identifier::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_id := NULL;
  END;

  IF v_id IS NOT NULL THEN
    SELECT * INTO v_seller FROM public.sellers WHERE id = v_id;
  ELSE
    SELECT * INTO v_seller 
    FROM public.sellers 
    WHERE lower(business_name) = lower(_identifier) 
       OR lower(replace(business_name, ' ', '-')) = lower(_identifier)
    LIMIT 1;
  END IF;

  IF v_seller.id IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'id', v_seller.id::text,
    'name', COALESCE(v_seller.business_name, v_seller.full_name, 'ugadi'),
    'location', COALESCE(NULLIF(TRIM(CONCAT_WS(', ', v_seller.city, v_seller.state)), ''), 'India'),
    'verified', (v_seller.verification_status = 'verified'),
    'rating', COALESCE(v_seller.rating, 0.00),
    'reviewCount', COALESCE(v_seller.review_count, 0),
    'yearsActive', COALESCE(v_seller.years_in_business, 5),
    'logo', v_seller.logo_url,
    'description', v_seller.description,
    'businessType', COALESCE(v_seller.business_type::text, 'Wholesale'),
    'gstVerified', (v_seller.verification_status = 'verified'),
    'established', EXTRACT(YEAR FROM v_seller.created_at)::int
  );
END;
$$ LANGUAGE plpgsql;

-- Grant EXECUTE on the public functions to everyone
GRANT EXECUTE ON FUNCTION public.has_purchased_product(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_supplier(TEXT) TO anon, authenticated;
