-- Persist buyer phone / address / whatsapp from signup metadata into profiles + buyers.

ALTER TABLE public.buyers
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT;

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

  INSERT INTO public.profiles (
    id, email, full_name, owner_name, business_name, phone, whatsapp,
    business_type, gst_number, address, onboarding_completed
  )
  VALUES (
    NEW.id,
    NEW.email,
    _full_name,
    _owner_name,
    _business_name,
    _phone,
    _whatsapp,
    _business_type,
    CASE WHEN _account_type = 'seller' THEN _gst ELSE NULL END,
    _address,
    CASE WHEN _account_type = 'buyer' THEN true ELSE false END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    owner_name = COALESCE(EXCLUDED.owner_name, public.profiles.owner_name),
    business_name = COALESCE(EXCLUDED.business_name, public.profiles.business_name),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    whatsapp = COALESCE(EXCLUDED.whatsapp, public.profiles.whatsapp),
    address = COALESCE(EXCLUDED.address, public.profiles.address);

  IF _account_type = 'seller' THEN
    INSERT INTO public.sellers (id, email, full_name, business_name, phone, gst_number, address)
    VALUES (NEW.id, NEW.email, _full_name, _business_name, _phone, _gst, _address)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    INSERT INTO public.buyers (id, email, full_name, business_name, phone, address, whatsapp)
    VALUES (NEW.id, NEW.email, _full_name, _business_name, _phone, _address, _whatsapp)
    ON CONFLICT (id) DO UPDATE SET
      phone = COALESCE(EXCLUDED.phone, public.buyers.phone),
      address = COALESCE(EXCLUDED.address, public.buyers.address),
      whatsapp = COALESCE(EXCLUDED.whatsapp, public.buyers.whatsapp),
      full_name = COALESCE(EXCLUDED.full_name, public.buyers.full_name),
      business_name = COALESCE(EXCLUDED.business_name, public.buyers.business_name);
  END IF;

  RETURN NEW;
END;
$$;
