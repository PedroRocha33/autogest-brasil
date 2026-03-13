import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function Clientes() {
  const navigate = useNavigate();
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', cpf: '', phone: '', email: '', address: '' });

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  const createClient = useMutation({
    mutationFn: async () => {
      if (!tenantId) throw new Error('No tenant');
      const { error } = await supabase.from('clients').insert({
        tenant_id: tenantId,
        name: form.name,
        cpf: form.cpf || null,
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setDialogOpen(false);
      setForm({ name: '', cpf: '', phone: '', email: '', address: '' });
      toast.success('Cliente cadastrado!');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = clients.filter(c =>
    `${c.name} ${c.cpf} ${c.email} ${c.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  // Simple CPF mask
  const handleCpfChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    let masked = digits;
    if (digits.length > 3) masked = digits.slice(0, 3) + '.' + digits.slice(3);
    if (digits.length > 6) masked = masked.slice(0, 7) + '.' + digits.slice(6);
    if (digits.length > 9) masked = masked.slice(0, 11) + '-' + digits.slice(9);
    setForm(f => ({ ...f, cpf: masked }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">CRM / Clientes</h1>
          <p className="text-muted-foreground text-sm">{clients.length} clientes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Novo Cliente</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">Novo Cliente</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createClient.mutate(); }} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input placeholder="000.000.000-00" value={form.cpf} onChange={e => handleCpfChange(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input placeholder="(11) 99999-9999" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <Button type="submit" className="w-full" disabled={createClient.isPending}>
                {createClient.isPending ? 'Salvando...' : 'Cadastrar Cliente'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar por nome, CPF, e-mail..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(client => (
            <Card
              key={client.id}
              className="bg-card border-border hover:border-primary/30 cursor-pointer transition-all hover:-translate-y-0.5"
              onClick={() => navigate(`/clientes/${client.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.cpf || client.phone || client.email || '—'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
