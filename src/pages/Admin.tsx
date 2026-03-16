import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Building2, Users, DollarSign, Shield, Car, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PLAN_PRICES, PLAN_NAMES, type PlanType } from '@/lib/plans';

const planOptions: PlanType[] = ['free', 'basico', 'profissional', 'marketplace'];
const statusOptions = ['ativo', 'suspenso'];

export default function Admin() {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['admin-tenants'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*');
      return data || [];
    },
  });

  const { data: allRoles = [] } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: async () => {
      const { data } = await supabase.from('user_roles').select('*');
      return data || [];
    },
  });

  const updateTenant = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      const { error } = await supabase.from('tenants').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tenants'] });
      toast.success('Tenant atualizado!');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Stats
  const planCounts = planOptions.reduce((acc, p) => {
    acc[p] = tenants.filter(t => (t.plan || 'free') === p).length;
    return acc;
  }, {} as Record<string, number>);

  const monthlyRevenue = planOptions.reduce((total, p) => {
    return total + (planCounts[p] || 0) * (PLAN_PRICES[p] || 0);
  }, 0);

  const getTenantName = (tenantId: string | null) => {
    if (!tenantId) return '—';
    return tenants.find(t => t.id === tenantId)?.name || '—';
  };

  const getRole = (userId: string) => {
    return allRoles.find(r => r.user_id === userId)?.role || '—';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="h-12 flex items-center justify-between border-b border-border px-4 bg-card">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-heading font-bold">AutoGest — Painel Admin</span>
        </div>
        <Button variant="ghost" size="icon" onClick={signOut} title="Sair">
          <LogOut className="h-4 w-4" />
        </Button>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Tenants</p>
                  <p className="text-xl font-heading font-bold">{tenants.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Receita Mensal Estimada</p>
                  <p className="text-xl font-heading font-bold text-success">R$ {monthlyRevenue.toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-info/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Usuários</p>
                  <p className="text-xl font-heading font-bold">{allProfiles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Por Plano</p>
                {planOptions.map(p => (
                  <div key={p} className="flex items-center justify-between text-sm">
                    <span>{PLAN_NAMES[p]}</span>
                    <Badge variant="secondary" className="text-xs">{planCounts[p] || 0}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tenants Table */}
        <Card className="bg-card border-border overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 border-b border-border">
              <h2 className="font-heading font-semibold">Revendas Cadastradas</h2>
            </div>
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Carregando...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs text-muted-foreground p-3">Nome</th>
                      <th className="text-left text-xs text-muted-foreground p-3">CNPJ</th>
                      <th className="text-left text-xs text-muted-foreground p-3">Cadastro</th>
                      <th className="text-left text-xs text-muted-foreground p-3">Plano</th>
                      <th className="text-left text-xs text-muted-foreground p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map(t => (
                      <tr key={t.id} className="border-b border-border last:border-0">
                        <td className="p-3 text-sm font-medium">{t.name}</td>
                        <td className="p-3 text-sm text-muted-foreground">{t.cnpj || '—'}</td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {new Date(t.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-3">
                          <Select
                            value={t.plan || 'free'}
                            onValueChange={v => updateTenant.mutate({ id: t.id, updates: { plan: v } })}
                          >
                            <SelectTrigger className="w-[130px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {planOptions.map(p => (
                                <SelectItem key={p} value={p}>{PLAN_NAMES[p]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3">
                          <Select
                            value={(t as any).status || 'ativo'}
                            onValueChange={v => updateTenant.mutate({ id: t.id, updates: { status: v } })}
                          >
                            <SelectTrigger className="w-[110px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map(s => (
                                <SelectItem key={s} value={s}>{s === 'ativo' ? '✅ Ativo' : '⛔ Suspenso'}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-card border-border overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 border-b border-border">
              <h2 className="font-heading font-semibold">Usuários Cadastrados</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs text-muted-foreground p-3">Nome</th>
                    <th className="text-left text-xs text-muted-foreground p-3">E-mail</th>
                    <th className="text-left text-xs text-muted-foreground p-3">Revenda</th>
                    <th className="text-left text-xs text-muted-foreground p-3">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {allProfiles.map(p => (
                    <tr key={p.id} className="border-b border-border last:border-0">
                      <td className="p-3 text-sm font-medium">{p.name}</td>
                      <td className="p-3 text-sm text-muted-foreground">{p.email}</td>
                      <td className="p-3 text-sm text-muted-foreground">{getTenantName(p.tenant_id)}</td>
                      <td className="p-3">
                        <Badge variant="secondary" className="text-xs">{getRole(p.user_id)}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
