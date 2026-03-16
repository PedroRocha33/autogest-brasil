
-- Add city and status columns to tenants
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ativo';

-- Add commission_rate to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,2) DEFAULT 5.00;

-- Add user_id to commissions
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- RLS policy for superadmin to see all tenants
CREATE POLICY "Superadmin can view all tenants" ON public.tenants
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmin can update all tenants" ON public.tenants
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmin can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmin can view all user_roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmin can update all user_roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Superadmin can insert user_roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Anon can view marketplace tenants" ON public.tenants
  FOR SELECT TO anon
  USING (plan = 'marketplace' AND status = 'ativo');
