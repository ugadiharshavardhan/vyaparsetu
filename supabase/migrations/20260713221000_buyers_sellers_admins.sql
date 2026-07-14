-- Separate account tables for buyers, sellers, and admins.
-- Removes user_roles; account type is determined by membership in these tables.

CREATE TABLE IF NOT EXISTS public.buyers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  business_name TEXT,
  phone TEXT,
  gst_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sellers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  business_name TEXT,
  phone TEXT,
  gst_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.buyers TO authenticated;
GRANT ALL ON public.buyers TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.sellers TO authenticated;
GRANT ALL ON public.sellers TO service_role;
GRANT SELECT ON public.admins TO authenticated;
GRANT ALL ON public.admins TO service_role;

ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "buyers read own"
  ON public.buyers FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "buyers insert own"
  ON public.buyers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "buyers update own"
  ON public.buyers FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "sellers read own"
  ON public.sellers FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "sellers insert own"
  ON public.sellers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "sellers update own"
  ON public.sellers FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "admins read own"
  ON public.admins FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE TRIGGER buyers_updated
  BEFORE UPDATE ON public.buyers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER sellers_updated
  BEFORE UPDATE ON public.sellers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER admins_updated
  BEFORE UPDATE ON public.admins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing user_roles into the new tables (if any)
INSERT INTO public.buyers (id, email, full_name, business_name, phone, gst_number)
SELECT p.id, p.email, p.full_name, p.business_name, p.phone, p.gst_number
FROM public.profiles p
JOIN public.user_roles ur ON ur.user_id = p.id
WHERE ur.role = 'retailer'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.sellers (id, email, full_name, business_name, phone, gst_number)
SELECT p.id, p.email, p.full_name, p.business_name, p.phone, p.gst_number
FROM public.profiles p
JOIN public.user_roles ur ON ur.user_id = p.id
WHERE ur.role IN ('manufacturer', 'wholesaler', 'distributor')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.admins (id, email, full_name)
SELECT p.id, p.email, p.full_name
FROM public.profiles p
JOIN public.user_roles ur ON ur.user_id = p.id
WHERE ur.role = 'admin'
ON CONFLICT (id) DO NOTHING;

-- Also migrate by profiles.business_type when no matching user_roles row type
INSERT INTO public.buyers (id, email, full_name, business_name, phone, gst_number)
SELECT p.id, p.email, p.full_name, p.business_name, p.phone, p.gst_number
FROM public.profiles p
WHERE p.business_type = 'retailer'
  AND NOT EXISTS (SELECT 1 FROM public.buyers b WHERE b.id = p.id)
  AND NOT EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = p.id)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.sellers (id, email, full_name, business_name, phone, gst_number)
SELECT p.id, p.email, p.full_name, p.business_name, p.phone, p.gst_number
FROM public.profiles p
WHERE p.business_type IN ('manufacturer', 'wholesaler', 'distributor')
  AND NOT EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = p.id)
ON CONFLICT (id) DO NOTHING;

-- Account-type helpers
CREATE OR REPLACE FUNCTION public.is_buyer(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.buyers WHERE id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.is_seller(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.sellers WHERE id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE id = _user_id);
$$;

REVOKE ALL ON FUNCTION public.is_buyer(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_seller(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_buyer(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_seller(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- Rewrite has_role to use the new tables (keeps existing RLS policies working)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN _role = 'admin'::public.app_role THEN public.is_admin(_user_id)
    WHEN _role IN (
      'manufacturer'::public.app_role,
      'wholesaler'::public.app_role,
      'distributor'::public.app_role
    ) THEN public.is_seller(_user_id)
    WHEN _role = 'retailer'::public.app_role THEN public.is_buyer(_user_id)
    ELSE false
  END;
$$;

-- Signup trigger: create profile + buyer or seller row (never user_roles)
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
  _business_name TEXT;
  _phone TEXT;
  _gst TEXT;
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
  _business_name := NEW.raw_user_meta_data->>'business_name';
  _phone := NEW.raw_user_meta_data->>'phone';
  _gst := NULLIF(NEW.raw_user_meta_data->>'gst_number', '');

  INSERT INTO public.profiles (id, email, full_name, business_name, phone, business_type, gst_number)
  VALUES (
    NEW.id,
    NEW.email,
    _full_name,
    _business_name,
    _phone,
    _business_type,
    _gst
  )
  ON CONFLICT (id) DO NOTHING;

  IF _account_type = 'seller' THEN
    INSERT INTO public.sellers (id, email, full_name, business_name, phone, gst_number)
    VALUES (NEW.id, NEW.email, _full_name, _business_name, _phone, _gst)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    INSERT INTO public.buyers (id, email, full_name, business_name, phone, gst_number)
    VALUES (NEW.id, NEW.email, _full_name, _business_name, _phone, _gst)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop user_roles (policies cascade with table)
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Admin policies on buyers/sellers/admins for admin dashboard
CREATE POLICY "admins read all if admin"
  ON public.admins FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "admins read all buyers"
  ON public.buyers FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "admins read all sellers"
  ON public.sellers FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "admins manage buyers"
  ON public.buyers FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admins manage sellers"
  ON public.sellers FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
