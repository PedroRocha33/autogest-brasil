import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Building2, Save } from 'lucide-react';
import { usePlan } from '@/hooks/usePlan';
import TeamManagement from '@/components/TeamManagement';

export default function Configuracoes() {
  const { tenantId, role } = useAuth();
  const { plan } = usePlan();
  const queryClient = useQueryClient();

  const { data: tenant } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      const { data, error } = await supabase.from('tenants').select('*').eq('id', tenantId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  const [form, setForm] = useState({
    name: '',
    cnpj: '',
    phone: '',
    address: '',
    city: '',
    slug: '',
  });

  // Sync form with tenant data
  useState(() => {
    if (tenant) {
      setForm({
        name: tenant.name || '',
        cnpj: tenant.cnpj || '',
        phone: tenant.phone || '',
        address: tenant.address || '',
        city: tenant.city || '',
        slug: tenant.slug || '',
      });
    }
  });

  const updateTenant = useMutation({
    mutationFn: async () => {
      if (!tenantId) throw new Error('No tenant');
      const { error } = await supabase.from('tenants').update({
        name: form.name,
        cnpj: form.cnpj || null,
        phone: form.phone || null,
        address: form.address || null,
        city: form.city || null,
        slug: form.slug || null,
      }).eq('id', tenantId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
      toast.success('Configurações salvas!');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Update form when tenant loads
  if (tenant && !form.name && tenant.name) {
    setForm({
      name: tenant.name,
      cnpj: tenant.cnpj || '',
      phone: tenant.phone || '',
      address: tenant.address || '',
      slug: tenant.slug || '',
    });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-heading font-bold">Configurações</h1>
        <p className="text-muted-foreground text-sm">Dados da sua revenda</p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-heading font-semibold">{tenant?.name || 'Carregando...'}</p>
              <p className="text-xs text-muted-foreground">Plano: {tenant?.plan || 'free'}</p>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); updateTenant.mutate(); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Revenda</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input value={form.cnpj} onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL pública)</Label>
              <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="minha-revenda" />
              <p className="text-xs text-muted-foreground">Para a loja pública: /loja/{form.slug || 'slug'}</p>
            </div>
            <Button type="submit" disabled={updateTenant.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {updateTenant.isPending ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Team Management - only for marketplace admins */}
      {plan === 'marketplace' && (role === 'admin' || role === 'gerente') && (
        <TeamManagement />
      )}
    </div>
  );
}
