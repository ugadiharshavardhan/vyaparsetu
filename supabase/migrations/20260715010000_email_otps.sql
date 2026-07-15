-- Backend-generated 6-digit email OTPs (signup + password reset).
-- Accessed only via Edge Functions with the service role (no client RLS access).

CREATE TABLE IF NOT EXISTS public.email_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('signup', 'reset')),
  code_hash text NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_otps_lookup_idx
  ON public.email_otps (email, purpose, created_at DESC);

ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;

-- Intentionally no policies for authenticated/anon — service role only.
REVOKE ALL ON public.email_otps FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.email_otps TO service_role;
