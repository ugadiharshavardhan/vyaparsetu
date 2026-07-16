-- Defer buyers/sellers creation until email OTP is verified.
-- 1) Stop auto-confirming email on signup (OTP must confirm it)
-- 2) Stop handle_new_user from inserting membership rows on auth.users insert
-- 3) Promote primary seller to admin so /admin is reachable

DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
DROP FUNCTION IF EXISTS public.auto_confirm_auth_user();

-- Keep trigger for compatibility, but do not write buyers/sellers here.
-- Membership is created by /api/auth-otp verify after successful OTP.
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

-- Ensure admin access for the primary platform operator
INSERT INTO public.admins (id)
SELECT s.id
FROM public.sellers s
WHERE lower(s.email) = 'ugadiharshavardhan@gmail.com'
ON CONFLICT (id) DO NOTHING;
