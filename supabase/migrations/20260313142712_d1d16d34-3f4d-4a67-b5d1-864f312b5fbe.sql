
-- =============================================
-- AutoGest Multi-Tenant SaaS Database Schema
-- =============================================

-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'vendedor', 'gerente');

-- 2. Create tenants table
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cnpj TEXT,
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  slug TEXT UNIQUE,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 3. Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create user_roles table (separate from profiles per security guidelines)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. Create vehicles table
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  version TEXT,
  year INTEGER NOT NULL,
  color TEXT,
  fuel TEXT,
  transmission TEXT,
  km INTEGER DEFAULT 0,
  plate TEXT,
  cost_price NUMERIC(12,2),
  sale_price NUMERIC(12,2),
  min_price NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'Disponível',
  photos JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- 6. Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cpf TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 7. Create deals table
CREATE TABLE public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id),
  client_id UUID REFERENCES public.clients(id),
  salesperson_id UUID REFERENCES auth.users(id),
  stage TEXT NOT NULL DEFAULT 'Contato Inicial',
  asking_price NUMERIC(12,2),
  offered_price NUMERIC(12,2),
  accepted_price NUMERIC(12,2),
  signal_amount NUMERIC(12,2),
  signal_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- 8. Create vistorias table
CREATE TABLE public.vistorias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id),
  type TEXT NOT NULL,
  inspector TEXT,
  checklist JSONB DEFAULT '{}'::jsonb,
  damage_map JSONB DEFAULT '[]'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  odometer INTEGER,
  fuel_level TEXT,
  observations TEXT,
  client_signature TEXT,
  status TEXT NOT NULL DEFAULT 'Agendada',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.vistorias ENABLE ROW LEVEL SECURITY;

-- 9. Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id),
  type TEXT NOT NULL,
  description TEXT,
  mechanic TEXT,
  estimated_cost NUMERIC(12,2),
  actual_cost NUMERIC(12,2),
  parts JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'Aberto',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- 10. Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category TEXT,
  type TEXT NOT NULL,
  value NUMERIC(12,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 11. Create commissions table
CREATE TABLE public.commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id),
  salesperson_id UUID REFERENCES auth.users(id),
  value NUMERIC(12,2) NOT NULL,
  paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- 12. Create leads table (for future storefront)
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id),
  name TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'Novo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Security Definer Functions
-- =============================================

-- Function to get current user's tenant_id
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()
$$;

-- Function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- =============================================
-- RLS Policies
-- =============================================

-- Tenants: users can see their own tenant
CREATE POLICY "Users can view own tenant" ON public.tenants
  FOR SELECT USING (id = public.get_user_tenant_id());
CREATE POLICY "Users can update own tenant" ON public.tenants
  FOR UPDATE USING (id = public.get_user_tenant_id());
CREATE POLICY "Authenticated users can create tenants" ON public.tenants
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Profiles: users can manage their own, view same-tenant profiles
CREATE POLICY "Users can view same-tenant profiles" ON public.profiles
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

-- User roles: users can view own roles, admins manage roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own roles" ON public.user_roles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Tenant-scoped tables: all use get_user_tenant_id()
-- Vehicles
CREATE POLICY "Tenant vehicles select" ON public.vehicles
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant vehicles insert" ON public.vehicles
  FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant vehicles update" ON public.vehicles
  FOR UPDATE USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant vehicles delete" ON public.vehicles
  FOR DELETE USING (tenant_id = public.get_user_tenant_id());

-- Clients
CREATE POLICY "Tenant clients select" ON public.clients
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant clients insert" ON public.clients
  FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant clients update" ON public.clients
  FOR UPDATE USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant clients delete" ON public.clients
  FOR DELETE USING (tenant_id = public.get_user_tenant_id());

-- Deals
CREATE POLICY "Tenant deals select" ON public.deals
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant deals insert" ON public.deals
  FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant deals update" ON public.deals
  FOR UPDATE USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant deals delete" ON public.deals
  FOR DELETE USING (tenant_id = public.get_user_tenant_id());

-- Vistorias
CREATE POLICY "Tenant vistorias select" ON public.vistorias
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant vistorias insert" ON public.vistorias
  FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant vistorias update" ON public.vistorias
  FOR UPDATE USING (tenant_id = public.get_user_tenant_id());

-- Services
CREATE POLICY "Tenant services select" ON public.services
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant services insert" ON public.services
  FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant services update" ON public.services
  FOR UPDATE USING (tenant_id = public.get_user_tenant_id());

-- Transactions
CREATE POLICY "Tenant transactions select" ON public.transactions
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant transactions insert" ON public.transactions
  FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant transactions update" ON public.transactions
  FOR UPDATE USING (tenant_id = public.get_user_tenant_id());

-- Commissions
CREATE POLICY "Tenant commissions select" ON public.commissions
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant commissions insert" ON public.commissions
  FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant commissions update" ON public.commissions
  FOR UPDATE USING (tenant_id = public.get_user_tenant_id());

-- Leads
CREATE POLICY "Tenant leads select" ON public.leads
  FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant leads insert" ON public.leads
  FOR INSERT WITH CHECK (tenant_id IS NOT NULL);
CREATE POLICY "Tenant leads update" ON public.leads
  FOR UPDATE USING (tenant_id = public.get_user_tenant_id());

-- =============================================
-- Trigger: auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Indexes for performance
-- =============================================
CREATE INDEX idx_profiles_tenant ON public.profiles(tenant_id);
CREATE INDEX idx_profiles_user ON public.profiles(user_id);
CREATE INDEX idx_vehicles_tenant ON public.vehicles(tenant_id);
CREATE INDEX idx_vehicles_status ON public.vehicles(status);
CREATE INDEX idx_clients_tenant ON public.clients(tenant_id);
CREATE INDEX idx_deals_tenant ON public.deals(tenant_id);
CREATE INDEX idx_deals_stage ON public.deals(stage);
CREATE INDEX idx_vistorias_tenant ON public.vistorias(tenant_id);
CREATE INDEX idx_services_tenant ON public.services(tenant_id);
CREATE INDEX idx_transactions_tenant ON public.transactions(tenant_id);
CREATE INDEX idx_commissions_tenant ON public.commissions(tenant_id);
CREATE INDEX idx_leads_tenant ON public.leads(tenant_id);

-- Storage bucket for vehicle photos and documents
INSERT INTO storage.buckets (id, name, public) VALUES ('autogest', 'autogest', true);

CREATE POLICY "Anyone can view autogest files" ON storage.objects
  FOR SELECT USING (bucket_id = 'autogest');
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'autogest' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update own uploads" ON storage.objects
  FOR UPDATE USING (bucket_id = 'autogest' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete own uploads" ON storage.objects
  FOR DELETE USING (bucket_id = 'autogest' AND auth.uid() IS NOT NULL);
