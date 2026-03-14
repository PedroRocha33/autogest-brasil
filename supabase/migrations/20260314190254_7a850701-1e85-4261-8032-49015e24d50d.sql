
-- Fix: Allow users to read their own profile even without a tenant (needed for onboarding)
DROP POLICY IF EXISTS "Users can view same-tenant profiles" ON public.profiles;
CREATE POLICY "Users can view own or same-tenant profiles"
  ON public.profiles FOR SELECT
  USING (user_id = auth.uid() OR tenant_id = get_user_tenant_id());

-- Fix: Allow public SELECT on tenants by slug for public storefront
CREATE POLICY "Public can view tenants by slug"
  ON public.tenants FOR SELECT
  TO anon
  USING (slug IS NOT NULL);

-- Fix: Allow public SELECT on vehicles for public storefront
CREATE POLICY "Public can view available vehicles"
  ON public.vehicles FOR SELECT
  TO anon
  USING (status = 'Disponível');
