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
import { Plus, FileText, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';

export default function Contratos() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [viewContract, setViewContract] = useState<any>(null);

  const [form, setForm] = useState({
    type: 'venda',
    buyer_name: '',
    buyer_cpf: '',
    buyer_address: '',
    seller_name: '',
    seller_cpf: '',
    vehicle_description: '',
    value: '',
    payment_method: 'a_vista',
    observations: '',
  });

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['contracts', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients-list', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase.from('clients').select('id, name, cpf, address').eq('tenant_id', tenantId);
      return data || [];
    },
    enabled: !!tenantId,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles-list', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase.from('vehicles').select('id, brand, model, year, plate, sale_price').eq('tenant_id', tenantId);
      return data || [];
    },
    enabled: !!tenantId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('contracts').insert({
        tenant_id: tenantId!,
        type: form.type,
        buyer_name: form.buyer_name,
        buyer_cpf: form.buyer_cpf,
        buyer_address: form.buyer_address,
        seller_name: form.seller_name,
        seller_cpf: form.seller_cpf,
        vehicle_description: form.vehicle_description,
        value: form.value ? parseFloat(form.value) : null,
        payment_method: form.payment_method,
        observations: form.observations,
        status: 'rascunho',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setOpen(false);
      setForm({ type: 'venda', buyer_name: '', buyer_cpf: '', buyer_address: '', seller_name: '', seller_cpf: '', vehicle_description: '', value: '', payment_method: 'a_vista', observations: '' });
      toast.success('Contrato criado com sucesso!');
    },
    onError: () => toast.error('Erro ao criar contrato'),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('contracts').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success('Status atualizado!');
    },
  });

  const generatePDF = (contract: any) => {
    const content = `
CONTRATO DE ${contract.type === 'compra' ? 'COMPRA' : 'VENDA'} DE VEÍCULO

Data: ${format(new Date(contract.created_at), 'dd/MM/yyyy')}

VENDEDOR:
Nome: ${contract.seller_name || '_______________'}
CPF: ${contract.seller_cpf || '_______________'}

COMPRADOR:
Nome: ${contract.buyer_name || '_______________'}
CPF: ${contract.buyer_cpf || '_______________'}
Endereço: ${contract.buyer_address || '_______________'}

VEÍCULO:
${contract.vehicle_description || '_______________'}

VALOR: R$ ${contract.value ? Number(contract.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '_______________'}

FORMA DE PAGAMENTO: ${contract.payment_method === 'a_vista' ? 'À vista' : contract.payment_method === 'financiamento' ? 'Financiamento' : contract.payment_method}

OBSERVAÇÕES:
${contract.observations || 'Nenhuma'}

____________________________          ____________________________
Vendedor                               Comprador
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contrato-${contract.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Contrato baixado!');
  };

  const statusColors: Record<string, string> = {
    rascunho: 'bg-muted text-muted-foreground',
    ativo: 'bg-primary/10 text-primary',
    finalizado: 'bg-green-100 text-green-800',
    cancelado: 'bg-destructive/10 text-destructive',
  };

  const fillFromClient = (clientId: string) => {
    const c = clients.find((cl: any) => cl.id === clientId);
    if (c) setForm(f => ({ ...f, buyer_name: c.name, buyer_cpf: c.cpf || '', buyer_address: c.address || '' }));
  };

  const fillFromVehicle = (vehicleId: string) => {
    const v = vehicles.find((ve: any) => ve.id === vehicleId);
    if (v) setForm(f => ({
      ...f,
      vehicle_description: `${v.brand} ${v.model} ${v.year} - Placa ${v.plate || 'N/A'}`,
      value: v.sale_price?.toString() || f.value,
    }));
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contratos</h1>
          <p className="text-muted-foreground text-sm">Gerencie contratos de compra e venda de veículos</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Novo Contrato</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Contrato</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="venda">Venda</SelectItem>
                      <SelectItem value="compra">Compra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Forma de Pagamento</Label>
                  <Select value={form.payment_method} onValueChange={v => setForm(f => ({ ...f, payment_method: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a_vista">À Vista</SelectItem>
                      <SelectItem value="financiamento">Financiamento</SelectItem>
                      <SelectItem value="parcelado">Parcelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {clients.length > 0 && (
                <div>
                  <Label>Preencher do Cliente</Label>
                  <Select onValueChange={fillFromClient}>
                    <SelectTrigger><SelectValue placeholder="Selecionar cliente..." /></SelectTrigger>
                    <SelectContent>
                      {clients.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Comprador</Label>
                  <Input value={form.buyer_name} onChange={e => setForm(f => ({ ...f, buyer_name: e.target.value }))} />
                </div>
                <div>
                  <Label>CPF do Comprador</Label>
                  <Input value={form.buyer_cpf} onChange={e => setForm(f => ({ ...f, buyer_cpf: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Endereço do Comprador</Label>
                <Input value={form.buyer_address} onChange={e => setForm(f => ({ ...f, buyer_address: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Vendedor</Label>
                  <Input value={form.seller_name} onChange={e => setForm(f => ({ ...f, seller_name: e.target.value }))} />
                </div>
                <div>
                  <Label>CPF do Vendedor</Label>
                  <Input value={form.seller_cpf} onChange={e => setForm(f => ({ ...f, seller_cpf: e.target.value }))} />
                </div>
              </div>

              {vehicles.length > 0 && (
                <div>
                  <Label>Preencher do Veículo</Label>
                  <Select onValueChange={fillFromVehicle}>
                    <SelectTrigger><SelectValue placeholder="Selecionar veículo..." /></SelectTrigger>
                    <SelectContent>
                      {vehicles.map((v: any) => (
                        <SelectItem key={v.id} value={v.id}>{v.brand} {v.model} {v.year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Descrição do Veículo</Label>
                <Input value={form.vehicle_description} onChange={e => setForm(f => ({ ...f, vehicle_description: e.target.value }))} />
              </div>
              <div>
                <Label>Valor (R$)</Label>
                <Input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} />
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea value={form.observations} onChange={e => setForm(f => ({ ...f, observations: e.target.value }))} />
              </div>
              <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Salvando...' : 'Criar Contrato'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : contracts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum contrato cadastrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contracts.map((contract: any) => (
            <Card key={contract.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Contrato de {contract.type === 'compra' ? 'Compra' : 'Venda'}
                    <Badge className={statusColors[contract.status] || ''}>{contract.status}</Badge>
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">{format(new Date(contract.created_at), 'dd/MM/yyyy')}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                  <div><span className="text-muted-foreground">Comprador:</span> {contract.buyer_name || '—'}</div>
                  <div><span className="text-muted-foreground">Vendedor:</span> {contract.seller_name || '—'}</div>
                  <div><span className="text-muted-foreground">Veículo:</span> {contract.vehicle_description || '—'}</div>
                  <div><span className="text-muted-foreground">Valor:</span> {contract.value ? `R$ ${Number(contract.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => generatePDF(contract)}>
                    <Download className="h-3 w-3 mr-1" /> Baixar
                  </Button>
                  {contract.status === 'rascunho' && (
                    <Button size="sm" onClick={() => updateStatus.mutate({ id: contract.id, status: 'ativo' })}>
                      Ativar
                    </Button>
                  )}
                  {contract.status === 'ativo' && (
                    <Button size="sm" variant="secondary" onClick={() => updateStatus.mutate({ id: contract.id, status: 'finalizado' })}>
                      Finalizar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Contract Dialog */}
      <Dialog open={!!viewContract} onOpenChange={() => setViewContract(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalhes do Contrato</DialogTitle></DialogHeader>
          {viewContract && (
            <pre className="text-xs whitespace-pre-wrap bg-muted p-4 rounded-lg">{JSON.stringify(viewContract, null, 2)}</pre>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
