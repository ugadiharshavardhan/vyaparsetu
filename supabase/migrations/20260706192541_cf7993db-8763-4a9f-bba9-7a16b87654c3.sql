
CREATE POLICY "Users manage own business docs - select"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'business-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users manage own business docs - insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'business-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users manage own business docs - update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'business-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users manage own business docs - delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'business-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
