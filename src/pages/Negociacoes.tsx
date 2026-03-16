import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Plus, GripVertical } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usePlan } from '@/hooks/usePlan';

const stages = [
  'Contato Inicial', 'Interesse Confirmado', 'Proposta Enviada',
  'Sinal Pago', 'Documentação', 'Contrato', 'Entregue'
];

const stageColors: Record<string, string> = {
  'Contato Inicial': 'bg-muted text-muted-foreground',
  'Interesse Confirmado': 'bg-info/20 text-info',
  'Proposta Enviada': 'bg-warning/20 text-warning',
  'Sinal Pago': 'bg-success/20 text-success',
  'Documentação': 'bg-info/20 text-info',
  'Contrato': 'bg-primary/20 text-primary',
  'Entregue': 'bg-success/20 text-success',
};

export default function Negociacoes() {
  const { tenantId, user } = useAuth();
  const { limits } = usePlan();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [form, setForm] = useState({ client_name: '', vehicle_info: '', asking_price: '', stage: 'Contato Inicial' });

  const { data: deals = [] } = useQuery({
    queryKey: ['deals', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('deals')
        .select('*, clients(name), vehicles(brand, model, year, sale_price)')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients-select', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase.from('clients').select('id, name').eq('tenant_id', tenantId);
      return data || [];
    },
    enabled: !!tenantId,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles-select', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase.from('vehicles').select('id, brand, model, year').eq('tenant_id', tenantId);
      return data || [];
    },
    enabled: !!tenantId,
  });

  const [newDeal, setNewDeal] = useState({ client_id: '', vehicle_id: '', asking_price: '' });

  const createDeal = useMutation({
    mutationFn: async () => {
      if (!tenantId) throw new Error('No tenant');
      const { error } = await supabase.from('deals').insert({
        tenant_id: tenantId,
        client_id: newDeal.client_id || null,
        vehicle_id: newDeal.vehicle_id || null,
        asking_price: parseFloat(newDeal.asking_price) || null,
        stage: 'Contato Inicial',
        salesperson_id: user?.id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setDialogOpen(false);
      setNewDeal({ client_id: '', vehicle_id: '', asking_price: '' });
      toast.success('Negociação criada!');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateStage = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const { error } = await supabase.from('deals').update({ stage }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Etapa atualizada!');
    },
  });

  const daysSince = (date: string) => Math.floor((Date.now() - new Date(date).getTime()) / 86400000);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Negociações</h1>
          <p className="text-muted-foreground text-sm">{deals.length} negociações</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Nova Negociação</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">Nova Negociação</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createDeal.mutate(); }} className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select value={newDeal.client_id} onValueChange={v => setNewDeal(f => ({ ...f, client_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                  <SelectContent>
                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Veículo</Label>
                <Select value={newDeal.vehicle_id} onValueChange={v => setNewDeal(f => ({ ...f, vehicle_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione um veículo" /></SelectTrigger>
                  <SelectContent>
                    {vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.brand} {v.model} {v.year}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor pedido (R$)</Label>
                <Input type="number" step="0.01" value={newDeal.asking_price} onChange={e => setNewDeal(f => ({ ...f, asking_price: e.target.value }))} />
              </div>
              <Button type="submit" className="w-full" disabled={createDeal.isPending}>
                {createDeal.isPending ? 'Criando...' : 'Criar Negociação'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban Board or Simple List based on plan */}
      {limits.kanban ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage);
            return (
              <div key={stage} className="min-w-[260px] flex-shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={`text-xs ${stageColors[stage]}`}>{stage}</Badge>
                  <span className="text-xs text-muted-foreground">{stageDeals.length}</span>
                </div>
                <div className="space-y-2">
                  {stageDeals.map(deal => (
                    <Card
                      key={deal.id}
                      className="bg-card border-border hover:border-primary/30 cursor-pointer transition-all hover:-translate-y-0.5"
                      onClick={() => setSelectedDeal(deal)}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                            {deal.clients?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '??'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{deal.clients?.name || 'Sem cliente'}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {deal.vehicles ? `${deal.vehicles.brand} ${deal.vehicles.model}` : 'Sem veículo'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-heading font-semibold">
                            {deal.asking_price ? `R$ ${Number(deal.asking_price).toLocaleString('pt-BR')}` : '—'}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{daysSince(deal.created_at)}d</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Simple List for basic plan */
        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs text-muted-foreground p-3">Cliente</th>
                  <th className="text-left text-xs text-muted-foreground p-3">Veículo</th>
                  <th className="text-left text-xs text-muted-foreground p-3">Valor</th>
                  <th className="text-left text-xs text-muted-foreground p-3">Etapa</th>
                  <th className="text-left text-xs text-muted-foreground p-3">Dias</th>
                </tr>
              </thead>
              <tbody>
                {deals.map(deal => (
                  <tr key={deal.id} className="border-b border-border last:border-0 hover:bg-secondary/30 cursor-pointer" onClick={() => setSelectedDeal(deal)}>
                    <td className="p-3 text-sm">{deal.clients?.name || 'Sem cliente'}</td>
                    <td className="p-3 text-sm">{deal.vehicles ? `${deal.vehicles.brand} ${deal.vehicles.model}` : '—'}</td>
                    <td className="p-3 text-sm font-heading font-semibold">{deal.asking_price ? `R$ ${Number(deal.asking_price).toLocaleString('pt-BR')}` : '—'}</td>
                    <td className="p-3"><Badge className={`text-xs ${stageColors[deal.stage]}`}>{deal.stage}</Badge></td>
                    <td className="p-3 text-sm text-muted-foreground">{daysSince(deal.created_at)}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Deal Detail Sheet */}
      <Sheet open={!!selectedDeal} onOpenChange={() => setSelectedDeal(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-heading">Detalhes da Negociação</SheetTitle>
          </SheetHeader>
          {selectedDeal && (
            <div className="mt-6 space-y-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Cliente</p>
                <p className="font-medium">{selectedDeal.clients?.name || 'Sem cliente'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Veículo</p>
                <p className="font-medium">
                  {selectedDeal.vehicles ? `${selectedDeal.vehicles.brand} ${selectedDeal.vehicles.model} ${selectedDeal.vehicles.year}` : 'Sem veículo'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Valor Pedido</p>
                  <p className="font-heading font-semibold">{selectedDeal.asking_price ? `R$ ${Number(selectedDeal.asking_price).toLocaleString('pt-BR')}` : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Valor Aceito</p>
                  <p className="font-heading font-semibold text-success">{selectedDeal.accepted_price ? `R$ ${Number(selectedDeal.accepted_price).toLocaleString('pt-BR')}` : '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Mover para etapa</p>
                <div className="flex flex-wrap gap-2">
                  {stages.map(stage => (
                    <Button
                      key={stage}
                      size="sm"
                      variant={selectedDeal.stage === stage ? 'default' : 'secondary'}
                      onClick={() => {
                        updateStage.mutate({ id: selectedDeal.id, stage });
                        setSelectedDeal({ ...selectedDeal, stage });
                      }}
                      className="text-xs"
                    >
                      {stage}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
