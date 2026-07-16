-- =============================================================================
-- REMOVE profiles TABLE — sellers/buyers only
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/juoufayfyzpmscxeiydd/sql/new
-- =============================================================================

-- Seller onboarding columns (if not already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'verification_status' AND e.enumlabel = 'under_review'
  ) THEN
    ALTER TYPE public.verification_status ADD VALUE 'under_review';
  END IF;
END $$;

ALTER TABLE public.sellers
  ADD COLUMN IF NOT EXISTS owner_name TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS business_email TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS business_type public.business_type,
  ADD COLUMN IF NOT EXISTS business_category TEXT,
  ADD COLUMN IF NOT EXISTS pan_number TEXT,
  ADD COLUMN IF NOT EXISTS years_in_business INTEGER,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS pincode TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS shop_image_url TEXT,
  ADD COLUMN IF NOT EXISTS gst_certificate_url TEXT,
  ADD COLUMN IF NOT EXISTS pan_document_url TEXT,
  ADD COLUMN IF NOT EXISTS alternate_phone TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS verification_status public.verification_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- Copy any legacy profile data into sellers/buyers before drop
UPDATE public.sellers s
SET
  owner_name = COALESCE(s.owner_name, p.owner_name),
  whatsapp = COALESCE(s.whatsapp, p.whatsapp),
  business_email = COALESCE(s.business_email, p.business_email),
  website = COALESCE(s.website, p.website),
  business_type = COALESCE(s.business_type, p.business_type),
  business_category = COALESCE(s.business_category, p.business_category),
  pan_number = COALESCE(s.pan_number, p.pan_number),
  years_in_business = COALESCE(s.years_in_business, p.years_in_business),
  city = COALESCE(s.city, p.city),
  state = COALESCE(s.state, p.state),
  country = COALESCE(s.country, p.country, 'India'),
  pincode = COALESCE(s.pincode, p.pincode),
  logo_url = COALESCE(s.logo_url, p.logo_url),
  shop_image_url = COALESCE(s.shop_image_url, p.shop_image_url),
  gst_certificate_url = COALESCE(s.gst_certificate_url, p.gst_certificate_url),
  pan_document_url = COALESCE(s.pan_document_url, p.pan_document_url),
  alternate_phone = COALESCE(s.alternate_phone, p.alternate_phone),
  avatar_url = COALESCE(s.avatar_url, p.avatar_url),
  verification_status = COALESCE(s.verification_status, p.verification_status, 'pending'::public.verification_status),
  onboarding_completed = COALESCE(s.onboarding_completed, p.onboarding_completed, false),
  full_name = COALESCE(s.full_name, p.full_name),
  business_name = COALESCE(s.business_name, p.business_name),
  phone = COALESCE(s.phone, p.phone),
  gst_number = COALESCE(s.gst_number, p.gst_number),
  address = COALESCE(s.address, p.address)
FROM public.profiles p
WHERE s.id = p.id;

UPDATE public.buyers b
SET
  full_name = COALESCE(b.full_name, p.full_name),
  business_name = COALESCE(b.business_name, p.business_name),
  phone = COALESCE(b.phone, p.phone),
  whatsapp = COALESCE(b.whatsapp, p.whatsapp),
  address = COALESCE(b.address, p.address)
FROM public.profiles p
WHERE b.id = p.id;

-- Signup trigger: buyers OR sellers ONLY (never profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _business_type public.business_type;
  _account_type TEXT;
  _full_name TEXT;
  _owner_name TEXT;
  _business_name TEXT;
  _phone TEXT;
  _whatsapp TEXT;
  _gst TEXT;
  _address TEXT;
BEGIN
  _account_type := lower(COALESCE(NEW.raw_user_meta_data->>'account_type', NEW.raw_user_meta_data->>'business_role', ''));

  BEGIN
    _business_type := COALESCE(
      (NEW.raw_user_meta_data->>'business_type')::public.business_type,
      CASE
        WHEN _account_type = 'seller' THEN 'manufacturer'::public.business_type
        ELSE 'retailer'::public.business_type
      END
    );
  EXCEPTION WHEN others THEN
    _business_type := CASE
      WHEN _account_type = 'seller' THEN 'manufacturer'::public.business_type
      ELSE 'retailer'::public.business_type
    END;
  END;

  IF _account_type NOT IN ('buyer', 'seller') THEN
    _account_type := CASE
      WHEN _business_type IN ('manufacturer', 'wholesaler', 'distributor') THEN 'seller'
      ELSE 'buyer'
    END;
  END IF;

  _full_name := NEW.raw_user_meta_data->>'full_name';
  _owner_name := COALESCE(NEW.raw_user_meta_data->>'owner_name', _full_name);
  _business_name := NEW.raw_user_meta_data->>'business_name';
  _phone := NULLIF(NEW.raw_user_meta_data->>'phone', '');
  _whatsapp := NULLIF(NEW.raw_user_meta_data->>'whatsapp', '');
  _gst := NULLIF(NEW.raw_user_meta_data->>'gst_number', '');
  _address := NULLIF(NEW.raw_user_meta_data->>'address', '');

  IF _account_type = 'seller' THEN
    INSERT INTO public.sellers (
      id, email, full_name, owner_name, business_name, phone, whatsapp,
      gst_number, address, business_type, onboarding_completed, verification_status
    )
    VALUES (
      NEW.id, NEW.email, _full_name, _owner_name, _business_name, _phone, _whatsapp,
      _gst, _address, _business_type, false, 'pending'::public.verification_status
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.sellers.full_name),
      owner_name = COALESCE(EXCLUDED.owner_name, public.sellers.owner_name),
      business_name = COALESCE(EXCLUDED.business_name, public.sellers.business_name),
      phone = COALESCE(EXCLUDED.phone, public.sellers.phone),
      whatsapp = COALESCE(EXCLUDED.whatsapp, public.sellers.whatsapp),
      gst_number = COALESCE(EXCLUDED.gst_number, public.sellers.gst_number),
      address = COALESCE(EXCLUDED.address, public.sellers.address),
      business_type = COALESCE(EXCLUDED.business_type, public.sellers.business_type);
  ELSE
    INSERT INTO public.buyers (id, email, full_name, business_name, phone, address, whatsapp)
    VALUES (NEW.id, NEW.email, _full_name, _business_name, _phone, _address, COALESCE(_whatsapp, _phone))
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      phone = COALESCE(EXCLUDED.phone, public.buyers.phone),
      address = COALESCE(EXCLUDED.address, public.buyers.address),
      whatsapp = COALESCE(EXCLUDED.whatsapp, public.buyers.whatsapp),
      full_name = COALESCE(EXCLUDED.full_name, public.buyers.full_name),
      business_name = COALESCE(EXCLUDED.business_name, public.buyers.business_name);
  END IF;

  RETURN NEW;
END;
$$;

-- Drop legacy profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Verify
SELECT 'profiles_removed' AS status,
  NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) AS profiles_gone;
