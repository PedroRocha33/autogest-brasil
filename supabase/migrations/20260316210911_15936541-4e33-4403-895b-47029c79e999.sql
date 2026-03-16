-- Allow admins to insert profiles for their tenant (invite team members)
CREATE POLICY "Admin can insert team profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  tenant_id = get_user_tenant_id()
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gerente'))
);

-- Allow admins to update team profiles (commission_rate)
CREATE POLICY "Admin can update team profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gerente'))
);
