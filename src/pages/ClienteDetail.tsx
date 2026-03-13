import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User } from 'lucide-react';

export default function ClienteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('clients').select('*').eq('id', id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['client-deals', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('deals')
        .select('*, vehicles(brand, model, year)')
        .eq('client_id', id!);
      return data || [];
    },
    enabled: !!id,
  });

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;
  if (!client) return <div className="text-center py-12 text-muted-foreground">Cliente não encontrado.</div>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/clientes')}>
        <ArrowLeft className="mr-2 h-4 w-4" />Voltar
      </Button>

      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-heading font-bold">{client.name}</h1>
          <p className="text-muted-foreground text-sm">{client.cpf || 'Sem CPF'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardContent className="p-5 space-y-3">
            <h2 className="font-heading font-semibold">Informações Pessoais</h2>
            <div className="space-y-2 text-sm">
              {[
                ['Telefone', client.phone],
                ['E-mail', client.email],
                ['Endereço', client.address],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span>{(value as string) || '—'}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5 space-y-3">
            <h2 className="font-heading font-semibold">Negociações ({deals.length})</h2>
            {deals.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma negociação.</p>
            ) : (
              <div className="space-y-2">
                {deals.map(deal => (
                  <div key={deal.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">
                        {deal.vehicles ? `${deal.vehicles.brand} ${deal.vehicles.model}` : 'Sem veículo'}
                      </p>
                      <Badge className="text-[10px] bg-info/20 text-info">{deal.stage}</Badge>
                    </div>
                    <span className="text-sm font-heading font-semibold">
                      {deal.asking_price ? `R$ ${Number(deal.asking_price).toLocaleString('pt-BR')}` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
