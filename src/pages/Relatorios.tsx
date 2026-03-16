import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { usePlan } from '@/hooks/usePlan';
import UpgradeCard from '@/components/UpgradeCard';
import { BarChart3, DollarSign, TrendingUp, Trophy } from 'lucide-react';

const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export default function Relatorios() {
  const { tenantId, role } = useAuth();
  const { limits } = usePlan();
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth()));
  const [year, setYear] = useState(String(now.getFullYear()));

  if (!limits.reports) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Relatórios</h1>
        <UpgradeCard
          title="Relatórios por Vendedor"
          description="Disponível no plano Marketplace. Acompanhe o desempenho de cada vendedor com rankings, ticket médio e comissões detalhadas."
        />
      </div>
    );
  }

  if (role === 'vendedor') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Relatórios</h1>
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center text-muted-foreground">
            Apenas administradores e gerentes podem acessar relatórios.
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: deals = [] } = useQuery({
    queryKey: ['report-deals', tenantId, month, year],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase
        .from('deals')
        .select('*, clients(name), vehicles(brand, model, sale_price)')
        .eq('tenant_id', tenantId)
        .eq('stage', 'Entregue');
      return data || [];
    },
    enabled: !!tenantId,
  });

  const { data: commissions = [] } = useQuery({
    queryKey: ['report-commissions', tenantId, month, year],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase
        .from('commissions')
        .select('*')
        .eq('tenant_id', tenantId);
      return data || [];
    },
    enabled: !!tenantId,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['report-profiles', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase
        .from('profiles')
        .select('user_id, name')
        .eq('tenant_id', tenantId);
      return data || [];
    },
    enabled: !!tenantId,
  });

  const selectedMonth = parseInt(month);
  const selectedYear = parseInt(year);

  const filteredDeals = deals.filter(d => {
    const date = new Date(d.created_at);
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
  });

  const filteredCommissions = commissions.filter(c => {
    if (!c.paid_at) return false;
    const date = new Date(c.paid_at);
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
  });

  // Group by salesperson
  const salesBySalesperson = new Map<string, { deals: typeof filteredDeals; commissions: typeof filteredCommissions }>();
  filteredDeals.forEach(d => {
    const spId = d.salesperson_id || 'unassigned';
    if (!salesBySalesperson.has(spId)) salesBySalesperson.set(spId, { deals: [], commissions: [] });
    salesBySalesperson.get(spId)!.deals.push(d);
  });
  filteredCommissions.forEach(c => {
    const spId = (c as any).user_id || c.salesperson_id || 'unassigned';
    if (!salesBySalesperson.has(spId)) salesBySalesperson.set(spId, { deals: [], commissions: [] });
    salesBySalesperson.get(spId)!.commissions.push(c);
  });

  const getProfileName = (userId: string) => {
    if (userId === 'unassigned') return 'Sem vendedor';
    return profiles.find(p => p.user_id === userId)?.name || 'Vendedor';
  };

  const ranking = Array.from(salesBySalesperson.entries()).map(([spId, data]) => ({
    id: spId,
    name: getProfileName(spId),
    totalSales: data.deals.length,
    totalValue: data.deals.reduce((s, d) => s + Number(d.accepted_price || d.asking_price || 0), 0),
    totalCommissions: data.commissions.reduce((s, c) => s + Number(c.value), 0),
    avgTicket: data.deals.length > 0
      ? data.deals.reduce((s, d) => s + Number(d.accepted_price || d.asking_price || 0), 0) / data.deals.length
      : 0,
  })).sort((a, b) => b.totalSales - a.totalSales);

  const totalSales = ranking.reduce((s, r) => s + r.totalSales, 0);
  const totalValue = ranking.reduce((s, r) => s + r.totalValue, 0);
  const totalCommissions = ranking.reduce((s, r) => s + r.totalCommissions, 0);
  const formatCurrency = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Relatórios</h1>
          <p className="text-muted-foreground text-sm">Desempenho por vendedor</p>
        </div>
        <div className="flex gap-2">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {monthNames.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Vendas</p>
              <p className="text-lg font-heading font-bold">{totalSales}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Volume Total</p>
              <p className="text-lg font-heading font-bold">{formatCurrency(totalValue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Comissões Pagas</p>
              <p className="text-lg font-heading font-bold">{formatCurrency(totalCommissions)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ranking */}
      {ranking.length > 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-warning" />
              <h2 className="font-heading font-semibold">Ranking de Vendedores</h2>
            </div>
            <div className="space-y-3">
              {ranking.map((r, i) => (
                <div key={r.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {i + 1}º
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.totalSales} vendas • Ticket médio: {formatCurrency(r.avgTicket)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-heading font-semibold">{formatCurrency(r.totalValue)}</p>
                    <p className="text-xs text-muted-foreground">Comissão: {formatCurrency(r.totalCommissions)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Table */}
      <Card className="bg-card border-border overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border">
            <h2 className="font-heading font-semibold">Vendas Detalhadas</h2>
          </div>
          {filteredDeals.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Nenhuma venda neste período.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs text-muted-foreground p-3">Cliente</th>
                    <th className="text-left text-xs text-muted-foreground p-3">Veículo</th>
                    <th className="text-left text-xs text-muted-foreground p-3">Vendedor</th>
                    <th className="text-right text-xs text-muted-foreground p-3">Valor</th>
                    <th className="text-right text-xs text-muted-foreground p-3">Comissão</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeals.map(d => {
                    const comm = filteredCommissions.find(c => c.deal_id === d.id);
                    return (
                      <tr key={d.id} className="border-b border-border last:border-0">
                        <td className="p-3 text-sm">{d.clients?.name || '—'}</td>
                        <td className="p-3 text-sm">{d.vehicles ? `${d.vehicles.brand} ${d.vehicles.model}` : '—'}</td>
                        <td className="p-3 text-sm">{getProfileName(d.salesperson_id || 'unassigned')}</td>
                        <td className="p-3 text-sm text-right font-heading font-semibold">
                          {formatCurrency(Number(d.accepted_price || d.asking_price || 0))}
                        </td>
                        <td className="p-3 text-sm text-right text-success font-heading font-semibold">
                          {comm ? formatCurrency(Number(comm.value)) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
