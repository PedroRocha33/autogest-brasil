import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('vehicles').select('*').eq('id', id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;
  if (!vehicle) return <div className="text-center py-12 text-muted-foreground">Veículo não encontrado.</div>;

  const features = (vehicle.features as string[]) || [];

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/estoque')}>
        <ArrowLeft className="mr-2 h-4 w-4" />Voltar ao Estoque
      </Button>

      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-xl bg-secondary flex items-center justify-center text-3xl">🚗</div>
        <div>
          <h1 className="text-2xl font-heading font-bold">{vehicle.brand} {vehicle.model}</h1>
          <p className="text-muted-foreground">{vehicle.version} • {vehicle.year} • {vehicle.plate || 'Sem placa'}</p>
        </div>
        <Badge className="ml-auto bg-success/20 text-success">{vehicle.status}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardContent className="p-5 space-y-4">
            <h2 className="font-heading font-semibold">Especificações</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Marca', vehicle.brand],
                ['Modelo', vehicle.model],
                ['Versão', vehicle.version],
                ['Ano', vehicle.year],
                ['Cor', vehicle.color],
                ['Combustível', vehicle.fuel],
                ['Câmbio', vehicle.transmission],
                ['KM', vehicle.km?.toLocaleString('pt-BR')],
                ['Placa', vehicle.plate],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <p className="text-muted-foreground text-xs">{label}</p>
                  <p className="font-medium">{value || '—'}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5 space-y-4">
            <h2 className="font-heading font-semibold">Preços</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Custo</span>
                <span className="font-heading font-semibold">
                  {vehicle.cost_price ? `R$ ${Number(vehicle.cost_price).toLocaleString('pt-BR')}` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Venda</span>
                <span className="font-heading font-bold text-lg text-success">
                  {vehicle.sale_price ? `R$ ${Number(vehicle.sale_price).toLocaleString('pt-BR')}` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mínimo</span>
                <span className="font-heading font-semibold">
                  {vehicle.min_price ? `R$ ${Number(vehicle.min_price).toLocaleString('pt-BR')}` : '—'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {features.length > 0 && (
          <Card className="bg-card border-border md:col-span-2">
            <CardContent className="p-5 space-y-3">
              <h2 className="font-heading font-semibold">Opcionais</h2>
              <div className="flex flex-wrap gap-2">
                {features.map((f) => (
                  <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {vehicle.observations && (
          <Card className="bg-card border-border md:col-span-2">
            <CardContent className="p-5 space-y-3">
              <h2 className="font-heading font-semibold">Observações</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{vehicle.observations}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
