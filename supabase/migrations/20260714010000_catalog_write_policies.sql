-- Allow authenticated admins to manage catalog; sellers to insert/update/delete products.

GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;

DROP POLICY IF EXISTS "categories admin write" ON public.categories;
CREATE POLICY "categories admin write"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "products admin write" ON public.products;
CREATE POLICY "products admin write"
  ON public.products FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "products seller insert" ON public.products;
CREATE POLICY "products seller insert"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = auth.uid()));

DROP POLICY IF EXISTS "products seller update" ON public.products;
CREATE POLICY "products seller update"
  ON public.products FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = auth.uid()));

DROP POLICY IF EXISTS "products seller delete" ON public.products;
CREATE POLICY "products seller delete"
  ON public.products FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.sellers s WHERE s.id = auth.uid()));
