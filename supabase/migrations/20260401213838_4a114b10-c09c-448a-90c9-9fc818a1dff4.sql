
-- Contracts table
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  deal_id UUID REFERENCES public.deals(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  client_id UUID REFERENCES public.clients(id),
  type TEXT NOT NULL DEFAULT 'venda',
  buyer_name TEXT,
  buyer_cpf TEXT,
  buyer_address TEXT,
  seller_name TEXT,
  seller_cpf TEXT,
  vehicle_description TEXT,
  value NUMERIC,
  payment_method TEXT,
  observations TEXT,
  status TEXT NOT NULL DEFAULT 'rascunho',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant contracts select" ON public.contracts FOR SELECT USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant contracts insert" ON public.contracts FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant contracts update" ON public.contracts FOR UPDATE USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant contracts delete" ON public.contracts FOR DELETE USING (tenant_id = get_user_tenant_id());

-- Refinanciamentos table
CREATE TABLE public.refinanciamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  client_id UUID REFERENCES public.clients(id),
  bank TEXT,
  total_value NUMERIC NOT NULL DEFAULT 0,
  down_payment NUMERIC DEFAULT 0,
  installments INTEGER NOT NULL DEFAULT 12,
  installment_value NUMERIC DEFAULT 0,
  interest_rate NUMERIC DEFAULT 0,
  first_due_date DATE,
  status TEXT NOT NULL DEFAULT 'em_analise',
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.refinanciamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant refinanciamentos select" ON public.refinanciamentos FOR SELECT USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant refinanciamentos insert" ON public.refinanciamentos FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant refinanciamentos update" ON public.refinanciamentos FOR UPDATE USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant refinanciamentos delete" ON public.refinanciamentos FOR DELETE USING (tenant_id = get_user_tenant_id());

-- Recibos / NF table (simplified receipts)
CREATE TABLE public.receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  deal_id UUID REFERENCES public.deals(id),
  client_name TEXT,
  client_cpf TEXT,
  description TEXT NOT NULL,
  value NUMERIC NOT NULL,
  receipt_number SERIAL,
  status TEXT NOT NULL DEFAULT 'emitido',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant receipts select" ON public.receipts FOR SELECT USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant receipts insert" ON public.receipts FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());
CREATE POLICY "Tenant receipts update" ON public.receipts FOR UPDATE USING (tenant_id = get_user_tenant_id());
