import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Wrench } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usePlan } from '@/hooks/usePlan';
import UpgradeCard from '@/components/UpgradeCard';

const statusColors: Record<string, string> = {
  'Aberto': 'bg-warning/20 text-warning',
  'Em Andamento': 'bg-info/20 text-info',
  'Concluído': 'bg-success/20 text-success',
};

const serviceTypes = ['Funilaria', 'Pintura', 'Mecânica', 'Elétrica', 'Estética', 'Outros'];

export default function Servicos() {
  const { tenantId } = useAuth();
  const { limits } = usePlan();

  if (!limits.servicos) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Serviços</h1>
        <UpgradeCard
          title="Serviços bloqueados"
          description="Ordens de serviço com controle de mecânicos e custos estão disponíveis a partir do plano Profissional."
        />
      </div>
    );
  }

  const { tenantId } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    vehicle_id: '', type: 'Mecânica', description: '', mechanic: '',
    estimated_cost: '', actual_cost: '',
  });

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('services')
        .select('*, vehicles(brand, model, year)')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles-servicos', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase.from('vehicles').select('id, brand, model, year').eq('tenant_id', tenantId);
      return data || [];
    },
    enabled: !!tenantId,
  });

  const createService = useMutation({
    mutationFn: async () => {
      if (!tenantId) throw new Error('No tenant');
      const { error } = await supabase.from('services').insert({
        tenant_id: tenantId,
        vehicle_id: form.vehicle_id || null,
        type: form.type,
        description: form.description || null,
        mechanic: form.mechanic || null,
        estimated_cost: parseFloat(form.estimated_cost) || null,
        actual_cost: parseFloat(form.actual_cost) || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setDialogOpen(false);
      setForm({ vehicle_id: '', type: 'Mecânica', description: '', mechanic: '', estimated_cost: '', actual_cost: '' });
      toast.success('Serviço criado!');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('services').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Status atualizado!');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Serviços</h1>
          <p className="text-muted-foreground text-sm">{services.length} ordens de serviço</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Novo Serviço</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">Nova Ordem de Serviço</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createService.mutate(); }} className="space-y-4">
              <div className="space-y-2">
                <Label>Veículo</Label>
                <Select value={form.vehicle_id} onValueChange={v => setForm(f => ({ ...f, vehicle_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.brand} {v.model} {v.year}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Mecânico Responsável</Label>
                <Input value={form.mechanic} onChange={e => setForm(f => ({ ...f, mechanic: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Custo Estimado (R$)</Label>
                  <Input type="number" step="0.01" value={form.estimated_cost} onChange={e => setForm(f => ({ ...f, estimated_cost: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Custo Real (R$)</Label>
                  <Input type="number" step="0.01" value={form.actual_cost} onChange={e => setForm(f => ({ ...f, actual_cost: e.target.value }))} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createService.isPending}>
                {createService.isPending ? 'Salvando...' : 'Criar Serviço'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : services.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <Wrench className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum serviço cadastrado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {services.map(s => (
            <Card key={s.id} className="bg-card border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Wrench className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">
                      {s.type} — {s.vehicles ? `${s.vehicles.brand} ${s.vehicles.model}` : 'Sem veículo'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.mechanic || 'Sem mecânico'} • {s.estimated_cost ? `R$ ${Number(s.estimated_cost).toLocaleString('pt-BR')}` : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${statusColors[s.status]}`}>{s.status}</Badge>
                  {s.status !== 'Concluído' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateStatus.mutate({
                        id: s.id,
                        status: s.status === 'Aberto' ? 'Em Andamento' : 'Concluído',
                      })}
                    >
                      {s.status === 'Aberto' ? 'Iniciar' : 'Concluir'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
