import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, DollarSign, Handshake, Wrench, ClipboardCheck, Search, FileText, Plus, Eye, TrendingUp, TrendingDown, Users, Clock, ArrowUpRight, ArrowDownRight, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const statusColors: Record<string, string> = {
  'Disponível': 'bg-success/20 text-success',
  'Negociando': 'bg-warning/20 text-warning',
  'Em Vistoria': 'bg-info/20 text-info',
  'Vendido': 'bg-muted text-muted-foreground',
  'Contato Inicial': 'bg-muted text-muted-foreground',
  'Proposta Enviada': 'bg-info/20 text-info',
  'Sinal Pago': 'bg-success/20 text-success',
  'Interesse Confirmado': 'bg-warning/20 text-warning',
};

const quickActions = [
  { label: 'Cadastrar Veículo', icon: Plus, path: '/estoque' },
  { label: 'Buscar por Placa', icon: Search, path: '/estoque' },
  { label: 'Novo Negócio', icon: Plus, path: '/negociacoes' },
  { label: 'Nova Vistoria', icon: ClipboardCheck, path: '/vistorias' },
  { label: 'Novo Cliente', icon: Users, path: '/clientes' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { tenantId } = useAuth();

  // Fetch vehicles
  const { data: vehicles = [] } = useQuery({
    queryKey: ['dashboard-vehicles', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase.from('vehicles').select('*').eq('tenant_id', tenantId);
      return data || [];
    },
    enabled: !!tenantId,
  });

  // Fetch deals
  const { data: deals = [] } = useQuery({
    queryKey: ['dashboard-deals', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase.from('deals').select('*, clients(name), vehicles(brand, model)').eq('tenant_id', tenantId);
      return data || [];
    },
    enabled: !!tenantId,
  });

  // Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ['dashboard-clients', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase.from('clients').select('*').eq('tenant_id', tenantId);
      return data || [];
    },
    enabled: !!tenantId,
  });

  // Fetch transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ['dashboard-transactions', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase.from('transactions').select('*').eq('tenant_id', tenantId);
      return data || [];
    },
    enabled: !!tenantId,
  });

  // Fetch services
  const { data: services = [] } = useQuery({
    queryKey: ['dashboard-services', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase.from('services').select('*').eq('tenant_id', tenantId);
      return data || [];
    },
    enabled: !!tenantId,
  });

  // Fetch commissions
  const { data: commissions = [] } = useQuery({
    queryKey: ['dashboard-commissions', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase.from('commissions').select('*').eq('tenant_id', tenantId);
      return data || [];
    },
    enabled: !!tenantId,
  });

  // Fetch leads
  const { data: leads = [] } = useQuery({
    queryKey: ['dashboard-leads', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase.from('leads').select('*').eq('tenant_id', tenantId);
      return data || [];
    },
    enabled: !!tenantId,
  });

  // Computed KPIs
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const vehiclesAvailable = vehicles.filter(v => v.status === 'Disponível').length;
  const vehiclesNegociando = vehicles.filter(v => v.status === 'Negociando').length;
  const vehiclesSold = vehicles.filter(v => v.status === 'Vendido').length;
  const totalVehicles = vehicles.length;

  const activeDeals = deals.filter(d => !['Entregue', 'Cancelado'].includes(d.stage));
  const completedDeals = deals.filter(d => d.stage === 'Entregue');

  const monthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const monthRevenue = monthTransactions.filter(t => t.type === 'receita').reduce((s, t) => s + Number(t.value), 0);
  const monthExpenses = monthTransactions.filter(t => t.type === 'despesa').reduce((s, t) => s + Number(t.value), 0);
  const monthProfit = monthRevenue - monthExpenses;

  const activeServices = services.filter(s => s.status !== 'Concluído').length;

  // Pipeline value
  const pipelineValue = activeDeals.reduce((s, d) => s + Number(d.asking_price || d.offered_price || 0), 0);

  // Avg days in stock
  const availableVehicles = vehicles.filter(v => v.status === 'Disponível');
  const avgDaysInStock = availableVehicles.length > 0
    ? Math.round(availableVehicles.reduce((s, v) => s + Math.floor((Date.now() - new Date(v.created_at).getTime()) / 86400000), 0) / availableVehicles.length)
    : 0;

  // Vehicle status distribution for pie chart
  const statusCounts = [
    { name: 'Disponível', value: vehiclesAvailable, color: 'hsl(142 71% 45%)' },
    { name: 'Negociando', value: vehiclesNegociando, color: 'hsl(38 92% 50%)' },
    { name: 'Em Vistoria', value: vehicles.filter(v => v.status === 'Em Vistoria').length, color: 'hsl(217 91% 60%)' },
    { name: 'Vendido', value: vehiclesSold, color: 'hsl(220 15% 55%)' },
  ].filter(s => s.value > 0);

  // Monthly sales data (last 6 months)
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const salesData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(currentYear, currentMonth - 5 + i, 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const monthDeals = completedDeals.filter(deal => {
      const dd = new Date(deal.created_at);
      return dd.getMonth() === m && dd.getFullYear() === y;
    });
    const monthTx = transactions.filter(t => {
      const td = new Date(t.date);
      return td.getMonth() === m && td.getFullYear() === y && t.type === 'receita';
    });
    return {
      month: monthNames[m],
      vendas: monthDeals.length,
      receita: monthTx.reduce((s, t) => s + Number(t.value), 0),
    };
  });

  // Deal stages for pipeline
  const stageOrder = ['Contato Inicial', 'Interesse Confirmado', 'Proposta Enviada', 'Sinal Pago', 'Documentação', 'Contrato'];
  const pipelineData = stageOrder.map(stage => ({
    stage: stage.split(' ')[0],
    count: activeDeals.filter(d => d.stage === stage).length,
  }));

  // Recent vehicles
  const recentVehicles = vehicles.slice(0, 5);

  // Recent deals
  const recentDeals = deals
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const newLeads = leads.filter((l: any) => l.status === 'Novo').length;
  const totalLeads = leads.length;

  const formatCurrency = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;

  const kpis = [
    { label: 'Veículos em Estoque', value: vehiclesAvailable.toString(), subtext: `${totalVehicles} total`, icon: Car, color: 'text-info', trend: null },
    { label: 'Receita do Mês', value: formatCurrency(monthRevenue), subtext: monthProfit >= 0 ? `Lucro: ${formatCurrency(monthProfit)}` : `Prejuízo: ${formatCurrency(monthProfit)}`, icon: DollarSign, color: 'text-success', trend: monthProfit >= 0 ? 'up' : 'down' },
    { label: 'Leads Novos', value: newLeads.toString(), subtext: `${totalLeads} total`, icon: Megaphone, color: 'text-primary', trend: newLeads > 0 ? 'up' : null },
    { label: 'Negociações Ativas', value: activeDeals.length.toString(), subtext: `Pipeline: ${formatCurrency(pipelineValue)}`, icon: Handshake, color: 'text-warning', trend: null },
    { label: 'Clientes Cadastrados', value: clients.length.toString(), subtext: `${completedDeals.length} vendas realizadas`, icon: Users, color: 'text-primary', trend: null },
    { label: 'Serviços em Andamento', value: activeServices.toString(), subtext: `${services.length} total`, icon: Wrench, color: 'text-info', trend: null },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Visão geral da sua revenda</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="bg-card border-border hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`h-9 w-9 rounded-lg bg-secondary flex items-center justify-center ${kpi.color}`}>
                  <kpi.icon className="h-4 w-4" />
                </div>
                {kpi.trend === 'up' && <ArrowUpRight className="h-4 w-4 text-success" />}
                {kpi.trend === 'down' && <ArrowDownRight className="h-4 w-4 text-destructive" />}
              </div>
              <p className="text-xl font-heading font-bold">{kpi.value}</p>
              <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
              {kpi.subtext && <p className="text-[10px] text-muted-foreground mt-1">{kpi.subtext}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <Button key={action.label} variant="secondary" size="sm" onClick={() => navigate(action.path)}>
            <action.icon className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <h2 className="font-heading font-semibold mb-3">Vendas — Últimos 6 Meses</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 20% 16%)" />
                <XAxis dataKey="month" stroke="hsl(220 15% 55%)" fontSize={12} />
                <YAxis stroke="hsl(220 15% 55%)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: 'hsl(225 22% 7%)', border: '1px solid hsl(225 20% 16%)', borderRadius: '8px', color: 'hsl(210 40% 93%)' }}
                  labelStyle={{ color: 'hsl(210 40% 93%)' }}
                />
                <Bar dataKey="vendas" fill="hsl(0 72% 59%)" radius={[4, 4, 0, 0]} name="Vendas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vehicle Status Pie */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <h2 className="font-heading font-semibold mb-3">Distribuição do Estoque</h2>
            {statusCounts.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={statusCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                      {statusCounts.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'hsl(225 22% 7%)', border: '1px solid hsl(225 20% 16%)', borderRadius: '8px', color: 'hsl(210 40% 93%)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {statusCounts.map(s => (
                    <div key={s.name} className="flex items-center gap-2 text-sm">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-muted-foreground">{s.name}</span>
                      <span className="font-heading font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm py-8 text-center">Nenhum veículo cadastrado.</p>
            )}
          </CardContent>
        </Card>

        {/* Pipeline Funnel */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <h2 className="font-heading font-semibold mb-3">Funil de Negociações</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={pipelineData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 20% 16%)" />
                <XAxis type="number" stroke="hsl(220 15% 55%)" fontSize={12} />
                <YAxis dataKey="stage" type="category" stroke="hsl(220 15% 55%)" fontSize={11} width={80} />
                <Tooltip contentStyle={{ background: 'hsl(225 22% 7%)', border: '1px solid hsl(225 20% 16%)', borderRadius: '8px', color: 'hsl(210 40% 93%)' }} />
                <Bar dataKey="count" fill="hsl(38 92% 50%)" radius={[0, 4, 4, 0]} name="Negociações" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Deals */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <h2 className="font-heading font-semibold mb-3">Negociações Recentes</h2>
            {recentDeals.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">Nenhuma negociação registrada.</p>
            ) : (
              <div className="space-y-3">
                {recentDeals.map((d: any) => (
                  <div key={d.id} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {d.clients?.name?.substring(0, 2).toUpperCase() || '??'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{d.clients?.name || 'Cliente'}</p>
                      <p className="text-xs text-muted-foreground">{d.vehicles?.brand} {d.vehicles?.model}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-heading font-semibold">
                        {d.asking_price ? formatCurrency(Number(d.asking_price)) : '—'}
                      </p>
                      <Badge className={`text-[10px] ${statusColors[d.stage] || 'bg-muted text-muted-foreground'}`}>{d.stage}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Stock */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-semibold">Estoque Recente</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/estoque')}>Ver todos</Button>
            </div>
            {recentVehicles.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">Nenhum veículo cadastrado.</p>
            ) : (
              <div className="space-y-2">
                {recentVehicles.map((v) => (
                  <div key={v.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 cursor-pointer hover:bg-secondary/20 rounded px-1 transition-colors"
                    onClick={() => navigate(`/estoque/${v.id}`)}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🚗</span>
                      <div>
                        <p className="text-sm font-medium">{v.brand} {v.model}</p>
                        <p className="text-xs text-muted-foreground">{v.plate || '—'} • {v.year}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="text-sm font-heading font-semibold">
                        {v.sale_price ? formatCurrency(Number(v.sale_price)) : '—'}
                      </span>
                      <Badge className={`text-[10px] ${statusColors[v.status] || 'bg-muted text-muted-foreground'}`}>{v.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <h2 className="font-heading font-semibold mb-3">Resumo Financeiro do Mês</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-sm">Receitas</span>
                </div>
                <span className="font-heading font-semibold text-success">{formatCurrency(monthRevenue)}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <span className="text-sm">Despesas</span>
                </div>
                <span className="font-heading font-semibold text-destructive">{formatCurrency(monthExpenses)}</span>
              </div>
              <div className="border-t border-border pt-2 flex items-center justify-between">
                <span className="text-sm font-medium">Lucro Líquido</span>
                <span className={`font-heading font-bold text-lg ${monthProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(monthProfit)}
                </span>
              </div>
              <div className="border-t border-border pt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Comissões pendentes</span>
                <span className="font-heading font-semibold text-warning">
                  {formatCurrency(commissions.filter(c => !c.paid).reduce((s, c) => s + Number(c.value), 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
