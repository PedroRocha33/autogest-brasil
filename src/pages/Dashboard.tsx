import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, DollarSign, Handshake, Wrench, ClipboardCheck, Search, FileText, Plus, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const kpis = [
  { label: 'Veículos em Estoque', value: '24', icon: Car, color: 'text-info' },
  { label: 'Vendas do Mês', value: 'R$ 387.500', icon: DollarSign, color: 'text-success' },
  { label: 'Negociações Ativas', value: '12', icon: Handshake, color: 'text-warning' },
  { label: 'Serviços em Andamento', value: '5', icon: Wrench, color: 'text-primary' },
];

const quickActions = [
  { label: 'Avaliar Veículo', icon: Eye, path: '/estoque' },
  { label: 'Buscar por Placa', icon: Search, path: '/estoque' },
  { label: 'Novo Negócio', icon: Plus, path: '/negociacoes' },
  { label: 'Nova Vistoria', icon: ClipboardCheck, path: '/vistorias' },
  { label: 'Gerar Contrato', icon: FileText, path: '#' },
];

const recentVehicles = [
  { emoji: '🚗', model: 'HB20 1.0 Sense', plate: 'ABC-1234', year: 2023, price: 'R$ 72.900', status: 'Disponível' },
  { emoji: '🚙', model: 'Onix 1.0 LT', plate: 'DEF-5678', year: 2022, price: 'R$ 68.500', status: 'Negociando' },
  { emoji: '🏎️', model: 'Corolla XEi 2.0', plate: 'GHI-9012', year: 2024, price: 'R$ 145.000', status: 'Em Vistoria' },
  { emoji: '🚐', model: 'Compass Limited', plate: 'JKL-3456', year: 2023, price: 'R$ 189.900', status: 'Disponível' },
  { emoji: '🚗', model: 'Gol 1.0 MPI', plate: 'MNO-7890', year: 2021, price: 'R$ 52.000', status: 'Disponível' },
];

const salesData = [
  { month: 'Out', vendas: 8, receita: 520000 },
  { month: 'Nov', vendas: 12, receita: 780000 },
  { month: 'Dez', vendas: 15, receita: 950000 },
  { month: 'Jan', vendas: 10, receita: 620000 },
  { month: 'Fev', vendas: 9, receita: 580000 },
  { month: 'Mar', vendas: 6, receita: 387500 },
];

const pipeline = [
  { initials: 'RS', name: 'Roberto Santos', car: 'HB20 1.0', stage: 'Proposta Enviada', value: 'R$ 72.900' },
  { initials: 'MC', name: 'Maria Costa', car: 'Compass Limited', stage: 'Sinal Pago', value: 'R$ 189.900' },
  { initials: 'JP', name: 'João Pereira', car: 'Corolla XEi', stage: 'Contato Inicial', value: 'R$ 145.000' },
];

const commissions = [
  { name: 'Carlos Silva', sales: 5, amount: 'R$ 12.500' },
  { name: 'Ana Rodrigues', sales: 4, amount: 'R$ 9.800' },
  { name: 'Pedro Souza', sales: 3, amount: 'R$ 7.200' },
];

const statusColors: Record<string, string> = {
  'Disponível': 'bg-success/20 text-success',
  'Negociando': 'bg-warning/20 text-warning',
  'Em Vistoria': 'bg-info/20 text-info',
  'Contato Inicial': 'bg-muted text-muted-foreground',
  'Proposta Enviada': 'bg-info/20 text-info',
  'Sinal Pago': 'bg-success/20 text-success',
};

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Visão geral da sua revenda</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="bg-card border-border hover:border-primary/30 transition-colors">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`h-10 w-10 rounded-lg bg-secondary flex items-center justify-center ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="text-xl font-heading font-bold">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="secondary"
            size="sm"
            onClick={() => action.path !== '#' && navigate(action.path)}
            disabled={action.path === '#'}
          >
            <action.icon className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Stock */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <h2 className="font-heading font-semibold mb-3">Estoque Recente</h2>
            <div className="space-y-2">
              {recentVehicles.map((v) => (
                <div key={v.plate} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{v.emoji}</span>
                    <div>
                      <p className="text-sm font-medium">{v.model}</p>
                      <p className="text-xs text-muted-foreground">{v.plate} • {v.year}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="text-sm font-heading font-semibold">{v.price}</span>
                    <Badge className={`text-[10px] ${statusColors[v.status]}`}>{v.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                  contentStyle={{ background: 'hsl(225 22% 7%)', border: '1px solid hsl(225 20% 16%)', borderRadius: '8px' }}
                  labelStyle={{ color: 'hsl(210 40% 93%)' }}
                />
                <Bar dataKey="vendas" fill="hsl(0 72% 59%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pipeline */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <h2 className="font-heading font-semibold mb-3">Negociações Ativas</h2>
            <div className="space-y-3">
              {pipeline.map((p) => (
                <div key={p.name} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {p.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.car}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-heading font-semibold">{p.value}</p>
                    <Badge className={`text-[10px] ${statusColors[p.stage]}`}>{p.stage}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Commissions Ranking */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <h2 className="font-heading font-semibold mb-3">Ranking de Comissões</h2>
            <div className="space-y-3">
              {commissions.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="text-lg font-heading font-bold text-muted-foreground w-6">{i + 1}°</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.sales} vendas</p>
                  </div>
                  <span className="text-sm font-heading font-semibold text-success">{c.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
