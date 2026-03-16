import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search, Filter, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usePlan } from '@/hooks/usePlan';
import UpgradeCard from '@/components/UpgradeCard';

const statusColors: Record<string, string> = {
  'Disponível': 'bg-success/20 text-success',
  'Negociando': 'bg-warning/20 text-warning',
  'Em Vistoria': 'bg-info/20 text-info',
  'Vendido': 'bg-muted text-muted-foreground',
};

const featuresList = [
  'Ar-condicionado', 'Direção elétrica', 'Vidro elétrico', 'Trava elétrica',
  'Airbag', 'ABS', 'Sensor de estacionamento', 'Câmera de ré',
  'Multimídia', 'Bancos de couro', 'Teto solar', 'Piloto automático',
];

const fuelTypes = ['Flex', 'Gasolina', 'Diesel', 'Elétrico', 'Híbrido'];
const transmissions = ['Manual', 'Automático', 'CVT'];

export default function Estoque() {
  const navigate = useNavigate();
  const { tenantId } = useAuth();
  const { limits } = usePlan();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    brand: '', model: '', version: '', year: '', color: '', fuel: 'Flex',
    transmission: 'Manual', km: '', plate: '', cost_price: '', sale_price: '',
    min_price: '', observations: '', features: [] as string[],
  });

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  const createVehicle = useMutation({
    mutationFn: async () => {
      if (!tenantId) throw new Error('No tenant');
      const { error } = await supabase.from('vehicles').insert({
        tenant_id: tenantId,
        brand: form.brand,
        model: form.model,
        version: form.version || null,
        year: parseInt(form.year),
        color: form.color || null,
        fuel: form.fuel,
        transmission: form.transmission,
        km: parseInt(form.km) || 0,
        plate: form.plate || null,
        cost_price: parseFloat(form.cost_price) || null,
        sale_price: parseFloat(form.sale_price) || null,
        min_price: parseFloat(form.min_price) || null,
        observations: form.observations || null,
        features: form.features,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setDialogOpen(false);
      setForm({
        brand: '', model: '', version: '', year: '', color: '', fuel: 'Flex',
        transmission: 'Manual', km: '', plate: '', cost_price: '', sale_price: '',
        min_price: '', observations: '', features: [],
      });
      toast.success('Veículo cadastrado com sucesso!');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = vehicles.filter((v) => {
    const matchSearch = `${v.brand} ${v.model} ${v.plate}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleFeature = (feature: string) => {
    setForm(f => ({
      ...f,
      features: f.features.includes(feature)
        ? f.features.filter(ft => ft !== feature)
        : [...f.features, feature],
    }));
  };

  const daysSince = (date: string) => Math.floor((Date.now() - new Date(date).getTime()) / 86400000);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Estoque</h1>
          <p className="text-muted-foreground text-sm">{vehicles.length} veículos cadastrados</p>
        </div>
        {vehicles.length >= limits.maxVehicles ? (
          <div />
        ) : (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Cadastrar Veículo</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-heading">Novo Veículo</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createVehicle.mutate(); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Marca *</Label>
                    <Input placeholder="Hyundai" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Modelo *</Label>
                    <Input placeholder="HB20" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Versão</Label>
                    <Input placeholder="1.0 Sense" value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Ano *</Label>
                    <Input type="number" placeholder="2024" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor</Label>
                    <Input placeholder="Branco" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>KM</Label>
                    <Input type="number" placeholder="35000" value={form.km} onChange={e => setForm(f => ({ ...f, km: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Combustível</Label>
                    <Select value={form.fuel} onValueChange={v => setForm(f => ({ ...f, fuel: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{fuelTypes.map(ft => <SelectItem key={ft} value={ft}>{ft}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Câmbio</Label>
                    <Select value={form.transmission} onValueChange={v => setForm(f => ({ ...f, transmission: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{transmissions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Placa</Label>
                    <Input placeholder="ABC-1D23" value={form.plate} onChange={e => setForm(f => ({ ...f, plate: e.target.value }))} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Preço de Custo</Label>
                    <Input type="number" step="0.01" placeholder="60000" value={form.cost_price} onChange={e => setForm(f => ({ ...f, cost_price: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Preço de Venda</Label>
                    <Input type="number" step="0.01" placeholder="72900" value={form.sale_price} onChange={e => setForm(f => ({ ...f, sale_price: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Preço Mínimo</Label>
                    <Input type="number" step="0.01" placeholder="68000" value={form.min_price} onChange={e => setForm(f => ({ ...f, min_price: e.target.value }))} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Opcionais</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {featuresList.map(feature => (
                      <label key={feature} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={form.features.includes(feature)}
                          onCheckedChange={() => toggleFeature(feature)}
                        />
                        {feature}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea placeholder="Observações sobre o veículo..." value={form.observations} onChange={e => setForm(f => ({ ...f, observations: e.target.value }))} />
                </div>

                <Button type="submit" className="w-full" disabled={createVehicle.isPending}>
                  {createVehicle.isPending ? 'Salvando...' : 'Cadastrar Veículo'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Vehicle limit upgrade card */}
      {vehicles.length >= limits.maxVehicles && (
        <UpgradeCard
          title="Limite de veículos atingido"
          description={`Você atingiu o limite de ${limits.maxVehicles} veículos do plano Básico. Faça upgrade para o Profissional e cadastre veículos ilimitados, adicione fotos ilimitadas e desbloqueie vistorias, comissões e muito mais.`}
        />
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar por modelo, marca ou placa..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Disponível">Disponível</SelectItem>
            <SelectItem value="Negociando">Negociando</SelectItem>
            <SelectItem value="Em Vistoria">Em Vistoria</SelectItem>
            <SelectItem value="Vendido">Vendido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vehicle Table */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Nenhum veículo encontrado.</p>
            <Button className="mt-4" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />Cadastrar primeiro veículo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs text-muted-foreground p-3 font-medium">Veículo</th>
                  <th className="text-left text-xs text-muted-foreground p-3 font-medium">Placa</th>
                  <th className="text-left text-xs text-muted-foreground p-3 font-medium">Ano</th>
                  <th className="text-left text-xs text-muted-foreground p-3 font-medium">KM</th>
                  <th className="text-left text-xs text-muted-foreground p-3 font-medium">Preço</th>
                  <th className="text-left text-xs text-muted-foreground p-3 font-medium">Status</th>
                  <th className="text-left text-xs text-muted-foreground p-3 font-medium">Dias</th>
                  <th className="text-right text-xs text-muted-foreground p-3 font-medium">Ação</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                         {(v.photos as string[] | null)?.[0] ? (
                          <img src={(v.photos as string[])[0]} alt={`${v.brand} ${v.model}`} className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-lg">🚗</div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{v.brand} {v.model}</p>
                          {v.version && <p className="text-xs text-muted-foreground">{v.version}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm font-mono">{v.plate || '—'}</td>
                    <td className="p-3 text-sm">{v.year}</td>
                    <td className="p-3 text-sm">{v.km?.toLocaleString('pt-BR')} km</td>
                    <td className="p-3 text-sm font-heading font-semibold">
                      {v.sale_price ? `R$ ${Number(v.sale_price).toLocaleString('pt-BR')}` : '—'}
                    </td>
                    <td className="p-3">
                      <Badge className={`text-[10px] ${statusColors[v.status] || 'bg-muted text-muted-foreground'}`}>
                        {v.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{daysSince(v.created_at)}d</td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/estoque/${v.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
