
-- Storage: upload policy already created, select already exists, add delete
DROP POLICY IF EXISTS "Authenticated users can delete own files" ON storage.objects;
CREATE POLICY "Authenticated users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'autogest');

-- Allow anon to insert leads (for public store contact form)
DROP POLICY IF EXISTS "Tenant leads insert" ON public.leads;
DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;
CREATE POLICY "Anyone can create leads"
ON public.leads FOR INSERT
TO anon, authenticated
WITH CHECK (tenant_id IS NOT NULL);
