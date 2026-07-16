-- Manufacturers directory: one row per company logo sliced from a1/a2/a3 sheets.

CREATE TABLE IF NOT EXISTS public.manufacturers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo TEXT,                 -- public Storage URL of the cropped logo
  source_image TEXT,         -- which sheet it came from (a1, a2, a3)
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS manufacturers_slug_idx ON public.manufacturers (slug);
CREATE INDEX IF NOT EXISTS manufacturers_sort_idx ON public.manufacturers (sort_order);

-- Admin helper (uuid signature, matches other catalog policies)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins a WHERE a.id = _user_id);
$$;

GRANT SELECT ON public.manufacturers TO anon, authenticated;
GRANT ALL ON public.manufacturers TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.manufacturers TO authenticated;

ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "manufacturers public read" ON public.manufacturers;
CREATE POLICY "manufacturers public read"
  ON public.manufacturers FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "manufacturers admin write" ON public.manufacturers;
CREATE POLICY "manufacturers admin write"
  ON public.manufacturers FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP TRIGGER IF EXISTS manufacturers_updated ON public.manufacturers;
CREATE TRIGGER manufacturers_updated
  BEFORE UPDATE ON public.manufacturers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
