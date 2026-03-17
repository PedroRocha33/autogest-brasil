import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Megaphone, Search, Phone, MessageCircle, UserPlus, ArrowRight,
  Clock, CheckCircle2, XCircle, TrendingUp, BarChart3, Users, Eye,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  Novo: { label: 'Novo', color: 'bg-info/20 text-info', icon: Clock },
  'Em contato': { label: 'Em contato', color: 'bg-warning/20 text-warning', icon: Phone },
  Convertido: { label: 'Convertido', color: 'bg-success/20 text-success', icon: CheckCircle2 },
  Descartado: { label: 'Descartado', color: 'bg-muted text-muted-foreground', icon: XCircle },
};

export default function Leads() {
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [convertingLead, setConvertingLead] = useState<any>(null);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase
        .from('leads')
        .select('*, vehicles(brand, model, year, sale_price)')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!tenantId,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('leads').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Status atualizado!');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const convertToClient = async (lead: any) => {
    if (!tenantId) return;
    setConvertingLead(lead);

    // Create client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        tenant_id: tenantId,
        name: lead.name,
        phone: lead.phone || null,
      })
      .select()
      .single();

    if (clientError) {
      toast.error('Erro ao criar cliente: ' + clientError.message);
      setConvertingLead(null);
      return;
    }

    // Create deal if vehicle is linked
    if (lead.vehicle_id) {
      const { error: dealError } = await supabase.from('deals').insert({
        tenant_id: tenantId,
        client_id: client.id,
        vehicle_id: lead.vehicle_id,
        stage: 'Contato Inicial',
        asking_price: lead.vehicles?.sale_price || null,
      });
      if (dealError) {
        toast.error('Cliente criado, mas erro ao criar negociação: ' + dealError.message);
      }
    }

    // Update lead status
    await supabase.from('leads').update({ status: 'Convertido' }).eq('id', lead.id);

    queryClient.invalidateQueries({ queryKey: ['leads'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    toast.success('Lead convertido em cliente + negociação!');
    setConvertingLead(null);
    setConvertDialogOpen(false);
    navigate('/clientes');
  };

  // Metrics
  const totalLeads = leads.length;
  const newLeads = leads.filter((l: any) => l.status === 'Novo').length;
  const contactingLeads = leads.filter((l: any) => l.status === 'Em contato').length;
  const convertedLeads = leads.filter((l: any) => l.status === 'Convertido').length;
  const discardedLeads = leads.filter((l: any) => l.status === 'Descartado').length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  // Today's leads
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayLeads = leads.filter((l: any) => new Date(l.created_at) >= today).length;

  // This week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekLeads = leads.filter((l: any) => new Date(l.created_at) >= weekAgo).length;

  const filtered = leads.filter((l: any) => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.phone && l.phone.includes(search)) ||
      (l.vehicles && `${l.vehicles.brand} ${l.vehicles.model}`.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}min atrás`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const metrics = [
    { label: 'Total de Leads', value: totalLeads, icon: Megaphone, color: 'text-primary' },
    { label: 'Novos (aguardando)', value: newLeads, icon: Clock, color: 'text-info' },
    { label: 'Em Contato', value: contactingLeads, icon: Phone, color: 'text-warning' },
    { label: 'Convertidos', value: convertedLeads, icon: CheckCircle2, color: 'text-success' },
    { label: 'Hoje', value: todayLeads, icon: TrendingUp, color: 'text-primary' },
    { label: 'Taxa de Conversão', value: `${conversionRate}%`, icon: BarChart3, color: 'text-success' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Leads</h1>
          <p className="text-muted-foreground text-sm">Interessados capturados pela loja pública</p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {weekLeads} esta semana
        </Badge>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m) => (
          <Card key={m.label} className="bg-card border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <m.icon className={`h-4 w-4 ${m.color}`} />
                <span className="text-[11px] text-muted-foreground">{m.label}</span>
              </div>
              <p className="text-xl font-heading font-bold">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nome, telefone ou veículo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Novo">Novo</SelectItem>
            <SelectItem value="Em contato">Em contato</SelectItem>
            <SelectItem value="Convertido">Convertido</SelectItem>
            <SelectItem value="Descartado">Descartado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leads List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <Megaphone className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum lead encontrado.</p>
            <p className="text-xs text-muted-foreground mt-1">Leads são capturados automaticamente pela sua loja pública.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead: any) => {
            const cfg = statusConfig[lead.status] || statusConfig.Novo;
            const StatusIcon = cfg.icon;
            return (
              <Card key={lead.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {lead.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-heading font-semibold text-sm">{lead.name}</p>
                        <Badge className={`text-[10px] ${cfg.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {cfg.label}
                        </Badge>
                      </div>

                      {lead.vehicles && (
                        <p className="text-xs text-muted-foreground mb-1">
                          🚗 {lead.vehicles.brand} {lead.vehicles.model} {lead.vehicles.year}
                          {lead.vehicles.sale_price && ` • R$ ${Number(lead.vehicles.sale_price).toLocaleString('pt-BR')}`}
                        </p>
                      )}

                      {lead.message && (
                        <p className="text-xs text-muted-foreground italic truncate">"{lead.message}"</p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {lead.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />{lead.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />{formatDate(lead.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {lead.phone && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a
                            href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${lead.name}! Vi seu interesse em nosso veículo. Podemos conversar?`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="h-4 w-4 text-success" />
                          </a>
                        </Button>
                      )}

                      {lead.status === 'Novo' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => updateStatus.mutate({ id: lead.id, status: 'Em contato' })}
                        >
                          Em contato
                        </Button>
                      )}

                      {(lead.status === 'Novo' || lead.status === 'Em contato') && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            className="text-xs"
                            onClick={() => { setConvertDialogOpen(true); setSelectedLead(lead); }}
                          >
                            <UserPlus className="mr-1 h-3 w-3" />Converter
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => updateStatus.mutate({ id: lead.id, status: 'Descartado' })}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Convert Dialog */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Converter Lead em Cliente</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">{selectedLead.name}</p>
                {selectedLead.phone && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />{selectedLead.phone}
                  </p>
                )}
                {selectedLead.vehicles && (
                  <p className="text-xs text-muted-foreground">
                    Interesse: {selectedLead.vehicles.brand} {selectedLead.vehicles.model} {selectedLead.vehicles.year}
                  </p>
                )}
                {selectedLead.message && (
                  <p className="text-xs text-muted-foreground italic">"{selectedLead.message}"</p>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <p className="font-medium">Ao converter:</p>
                <ul className="space-y-1 text-muted-foreground text-xs">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    Será criado um novo cliente no CRM
                  </li>
                  {selectedLead.vehicle_id && (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-success" />
                      Será criada uma negociação automaticamente
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    Status do lead será atualizado para "Convertido"
                  </li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => convertToClient(selectedLead)}
                  disabled={!!convertingLead}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {convertingLead ? 'Convertendo...' : 'Converter Lead'}
                </Button>
                <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
