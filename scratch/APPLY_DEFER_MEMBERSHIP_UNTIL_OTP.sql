-- Run in Supabase SQL Editor (or: node scripts/apply-defer-membership-otp.mjs)
-- Defer buyers/sellers until OTP verify; remove auto-confirm; promote admin

DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
DROP FUNCTION IF EXISTS public.auto_confirm_auth_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN NEW;
END;
$$;

INSERT INTO public.admins (id)
SELECT s.id
FROM public.sellers s
WHERE lower(s.email) = 'ugadiharshavardhan@gmail.com'
ON CONFLICT (id) DO NOTHING;
