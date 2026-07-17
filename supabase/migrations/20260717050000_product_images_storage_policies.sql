-- Allow authenticated sellers to upload product images to the public
-- `product-images` bucket (mirrors the existing `business-documents` policies).
-- Root-cause fix: the seller ImageManager previously embedded base64 data URIs
-- directly into products.image/images, which bloated the table and timed out
-- the marketplace list query. Sellers now upload real files to Storage instead.

-- Ensure the bucket exists and is public (read via public URL, no RLS needed for anon read).
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "product-images authenticated read" ON storage.objects;
CREATE POLICY "product-images authenticated read"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product-images insert own" ON storage.objects;
CREATE POLICY "product-images insert own"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "product-images update own" ON storage.objects;
CREATE POLICY "product-images update own"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "product-images delete own" ON storage.objects;
CREATE POLICY "product-images delete own"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
