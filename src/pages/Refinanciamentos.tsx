import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Landmark, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function Refinanciamentos() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    bank: '',
    total_value: '',
    down_payment: '',
    installments: '12',
    interest_rate: '',
    first_due_date: '',
    observations: '',
    client_id: '',
    vehicle_id: '',
  });

  const { data: refinanciamentos = [], isLoading } = useQuery({
    queryKey: ['refinanciamentos', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('refinanciamentos')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients-ref', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase.from('clients').select('id, name').eq('tenant_id', tenantId);
      return data || [];
    },
    enabled: !!tenantId,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles-ref', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase.from('vehicles').select('id, brand, model, year').eq('tenant_id', tenantId);
      return data || [];
    },
    enabled: !!tenantId,
  });

  const totalValue = parseFloat(form.total_value) || 0;
  const downPayment = parseFloat(form.down_payment) || 0;
  const numInstallments = parseInt(form.installments) || 1;
  const financed = totalValue - downPayment;
  const installmentValue = financed > 0 ? financed / numInstallments : 0;

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('refinanciamentos').insert({
        tenant_id: tenantId!,
        bank: form.bank,
        total_value: totalValue,
        down_payment: downPayment,
        installments: numInstallments,
        installment_value: installmentValue,
        interest_rate: parseFloat(form.interest_rate) || 0,
        first_due_date: form.first_due_date || null,
        observations: form.observations,
        client_id: form.client_id || null,
        vehicle_id: form.vehicle_id || null,
        status: 'em_analise',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refinanciamentos'] });
      setOpen(false);
      setForm({ bank: '', total_value: '', down_payment: '', installments: '12', interest_rate: '', first_due_date: '', observations: '', client_id: '', vehicle_id: '' });
      toast.success('Refinanciamento cadastrado!');
    },
    onError: () => toast.error('Erro ao criar refinanciamento'),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('refinanciamentos').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refinanciamentos'] });
      toast.success('Status atualizado!');
    },
  });

  const statusColors: Record<string, string> = {
    em_analise: 'bg-yellow-100 text-yellow-800',
    aprovado: 'bg-green-100 text-green-800',
    reprovado: 'bg-destructive/10 text-destructive',
    pago: 'bg-primary/10 text-primary',
    cancelado: 'bg-muted text-muted-foreground',
  };

  const statusLabels: Record<string, string> = {
    em_analise: 'Em análise',
    aprovado: 'Aprovado',
    reprovado: 'Reprovado',
    pago: 'Pago',
    cancelado: 'Cancelado',
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Refinanciamentos</h1>
          <p className="text-muted-foreground text-sm">Controle de operações de refinanciamento</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Novo Refinanciamento</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Novo Refinanciamento</DialogTitle></DialogHeader>
            <div className="grid gap-4">
              {clients.length > 0 && (
                <div>
                  <Label>Cliente</Label>
                  <Select value={form.client_id} onValueChange={v => setForm(f => ({ ...f, client_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                    <SelectContent>
                      {clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {vehicles.length > 0 && (
                <div>
                  <Label>Veículo</Label>
                  <Select value={form.vehicle_id} onValueChange={v => setForm(f => ({ ...f, vehicle_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                    <SelectContent>
                      {vehicles.map((v: any) => <SelectItem key={v.id} value={v.id}>{v.brand} {v.model} {v.year}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label>Banco / Financeira</Label>
                <Input value={form.bank} onChange={e => setForm(f => ({ ...f, bank: e.target.value }))} placeholder="Ex: Itaú, Santander..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Valor Total (R$)</Label>
                  <Input type="number" value={form.total_value} onChange={e => setForm(f => ({ ...f, total_value: e.target.value }))} />
                </div>
                <div>
                  <Label>Entrada (R$)</Label>
                  <Input type="number" value={form.down_payment} onChange={e => setForm(f => ({ ...f, down_payment: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Parcelas</Label>
                  <Input type="number" value={form.installments} onChange={e => setForm(f => ({ ...f, installments: e.target.value }))} />
                </div>
                <div>
                  <Label>Taxa de Juros (%)</Label>
                  <Input type="number" step="0.01" value={form.interest_rate} onChange={e => setForm(f => ({ ...f, interest_rate: e.target.value }))} />
                </div>
              </div>

              {financed > 0 && (
                <Card className="bg-muted/50">
                  <CardContent className="p-3 text-sm">
                    <div className="flex justify-between"><span>Valor financiado:</span> <strong>R$ {financed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></div>
                    <div className="flex justify-between"><span>Parcela estimada:</span> <strong>R$ {installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></div>
                  </CardContent>
                </Card>
              )}

              <div>
                <Label>1º Vencimento</Label>
                <Input type="date" value={form.first_due_date} onChange={e => setForm(f => ({ ...f, first_due_date: e.target.value }))} />
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea value={form.observations} onChange={e => setForm(f => ({ ...f, observations: e.target.value }))} />
              </div>
              <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Salvando...' : 'Cadastrar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : refinanciamentos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Landmark className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum refinanciamento cadastrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {refinanciamentos.map((ref: any) => (
            <Card key={ref.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {ref.bank || 'Financeira não informada'}
                    <Badge className={statusColors[ref.status] || ''}>{statusLabels[ref.status] || ref.status}</Badge>
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">{format(new Date(ref.created_at), 'dd/MM/yyyy')}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                  <div><span className="text-muted-foreground">Valor:</span> R$ {Number(ref.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  <div><span className="text-muted-foreground">Entrada:</span> R$ {Number(ref.down_payment || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  <div><span className="text-muted-foreground">Parcelas:</span> {ref.installments}x R$ {Number(ref.installment_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  <div><span className="text-muted-foreground">Juros:</span> {ref.interest_rate || 0}%</div>
                </div>
                <div className="flex gap-2">
                  {ref.status === 'em_analise' && (
                    <>
                      <Button size="sm" onClick={() => updateStatus.mutate({ id: ref.id, status: 'aprovado' })}>Aprovar</Button>
                      <Button size="sm" variant="destructive" onClick={() => updateStatus.mutate({ id: ref.id, status: 'reprovado' })}>Reprovar</Button>
                    </>
                  )}
                  {ref.status === 'aprovado' && (
                    <Button size="sm" variant="secondary" onClick={() => updateStatus.mutate({ id: ref.id, status: 'pago' })}>Marcar como Pago</Button>
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
