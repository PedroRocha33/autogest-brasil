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
import { toast } from 'sonner';
import { Plus, Receipt, Download, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function NotaFiscal() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    client_name: '',
    client_cpf: '',
    description: '',
    value: '',
  });

  const { data: receipts = [], isLoading } = useQuery({
    queryKey: ['receipts', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  const { data: tenant } = useQuery({
    queryKey: ['tenant-nf', tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      const { data } = await supabase.from('tenants').select('name, cnpj, address, phone').eq('id', tenantId).single();
      return data;
    },
    enabled: !!tenantId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('receipts').insert({
        tenant_id: tenantId!,
        client_name: form.client_name,
        client_cpf: form.client_cpf,
        description: form.description,
        value: parseFloat(form.value) || 0,
        status: 'emitido',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      setOpen(false);
      setForm({ client_name: '', client_cpf: '', description: '', value: '' });
      toast.success('Recibo emitido com sucesso!');
    },
    onError: () => toast.error('Erro ao emitir recibo'),
  });

  const generateReceipt = (receipt: any) => {
    const content = `
═══════════════════════════════════════════
                 RECIBO Nº ${receipt.receipt_number}
═══════════════════════════════════════════

EMITENTE:
${tenant?.name || 'Empresa'}
CNPJ: ${tenant?.cnpj || 'N/A'}
Endereço: ${tenant?.address || 'N/A'}

DESTINATÁRIO:
Nome: ${receipt.client_name || 'N/A'}
CPF: ${receipt.client_cpf || 'N/A'}

───────────────────────────────────────────
DESCRIÇÃO:
${receipt.description}

VALOR: R$ ${Number(receipt.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
───────────────────────────────────────────

Data de emissão: ${format(new Date(receipt.created_at), 'dd/MM/yyyy HH:mm')}

═══════════════════════════════════════════
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recibo-${receipt.receipt_number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Recibo baixado!');
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Nota Fiscal / Recibos</h1>
          <p className="text-muted-foreground text-sm">Emita recibos para suas operações</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Emitir Recibo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Emitir Recibo</DialogTitle></DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Cliente</Label>
                  <Input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} />
                </div>
                <div>
                  <Label>CPF do Cliente</Label>
                  <Input value={form.client_cpf} onChange={e => setForm(f => ({ ...f, client_cpf: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Ex: Venda de veículo Toyota Corolla 2020..." />
              </div>
              <div>
                <Label>Valor (R$)</Label>
                <Input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} />
              </div>
              <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.description || !form.value}>
                {createMutation.isPending ? 'Emitindo...' : 'Emitir Recibo'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Este módulo emite <strong>recibos simplificados</strong>. Para emissão de NF-e oficial, será necessário integração com um serviço homologado (Nuvem Fiscal, Focus NFe, etc).
        </AlertDescription>
      </Alert>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : receipts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum recibo emitido</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {receipts.map((receipt: any) => (
            <Card key={receipt.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Recibo #{receipt.receipt_number}
                    <Badge variant="secondary">{receipt.status}</Badge>
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">{format(new Date(receipt.created_at), 'dd/MM/yyyy')}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm mb-3">
                  <div><span className="text-muted-foreground">Cliente:</span> {receipt.client_name || '—'}</div>
                  <div><span className="text-muted-foreground">Descrição:</span> {receipt.description}</div>
                  <div><span className="text-muted-foreground">Valor:</span> R$ {Number(receipt.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => generateReceipt(receipt)}>
                  <Download className="h-3 w-3 mr-1" /> Baixar Recibo
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
