import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { usePlan } from '@/hooks/usePlan';

const categories = ['Venda de veículo', 'Compra de veículo', 'Serviço', 'Despesa operacional', 'Comissão', 'Outros'];

export default function Financeiro() {
  const { tenantId } = useAuth();
  const { limits } = usePlan();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [form, setForm] = useState({ description: '', category: 'Venda de veículo', type: 'entrada', value: '', date: '' });

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  const createTransaction = useMutation({
    mutationFn: async () => {
      if (!tenantId) throw new Error('No tenant');
      const { error } = await supabase.from('transactions').insert({
        tenant_id: tenantId,
        description: form.description,
        category: form.category,
        type: form.type,
        value: parseFloat(form.value),
        date: form.date || new Date().toISOString().split('T')[0],
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setDialogOpen(false);
      setForm({ description: '', category: 'Venda de veículo', type: 'entrada', value: '', date: '' });
      toast.success('Transação registrada!');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const totals = transactions.reduce((acc, t) => {
    const val = Number(t.value);
    if (t.type === 'entrada') acc.receita += val;
    else acc.despesa += val;
    return acc;
  }, { receita: 0, despesa: 0 });

  const filtered = transactions.filter(t => typeFilter === 'all' || t.type === typeFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Financeiro</h1>
          <p className="text-muted-foreground text-sm">{transactions.length} transações</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Nova Transação</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">Nova Transação</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createTransaction.mutate(); }} className="space-y-4">
              <div className="space-y-2">
                <Label>Descrição *</Label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="saida">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor (R$) *</Label>
                  <Input type="number" step="0.01" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createTransaction.isPending}>
                {createTransaction.isPending ? 'Salvando...' : 'Registrar'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Receita</p>
              <p className="text-lg font-heading font-bold text-success">R$ {totals.receita.toLocaleString('pt-BR')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-destructive/20 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Despesas</p>
              <p className="text-lg font-heading font-bold text-destructive">R$ {totals.despesa.toLocaleString('pt-BR')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-info/20 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lucro Líquido</p>
              <p className="text-lg font-heading font-bold">R$ {(totals.receita - totals.despesa).toLocaleString('pt-BR')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Select value={typeFilter} onValueChange={setTypeFilter}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Filtrar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="entrada">Entradas</SelectItem>
          <SelectItem value="saida">Saídas</SelectItem>
        </SelectContent>
      </Select>

      {/* Transactions Table */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : (
        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs text-muted-foreground p-3">Data</th>
                  <th className="text-left text-xs text-muted-foreground p-3">Descrição</th>
                  <th className="text-left text-xs text-muted-foreground p-3">Categoria</th>
                  <th className="text-left text-xs text-muted-foreground p-3">Tipo</th>
                  <th className="text-right text-xs text-muted-foreground p-3">Valor</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className="border-b border-border last:border-0">
                    <td className="p-3 text-sm">{new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td className="p-3 text-sm">{t.description}</td>
                    <td className="p-3 text-sm text-muted-foreground">{t.category}</td>
                    <td className="p-3">
                      <Badge className={`text-xs ${t.type === 'entrada' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                        {t.type === 'entrada' ? 'Entrada' : 'Saída'}
                      </Badge>
                    </td>
                    <td className={`p-3 text-sm text-right font-heading font-semibold ${t.type === 'entrada' ? 'text-success' : 'text-destructive'}`}>
                      {t.type === 'entrada' ? '+' : '-'} R$ {Number(t.value).toLocaleString('pt-BR')}
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
