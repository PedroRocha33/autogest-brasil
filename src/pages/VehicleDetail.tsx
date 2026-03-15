import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Edit, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import PhotoUploader from '@/components/PhotoUploader';
import PhotoGallery from '@/components/PhotoGallery';

const statusOptions = ['Disponível', 'Negociando', 'Em Vistoria', 'Vendido'];
const statusColors: Record<string, string> = {
  'Disponível': 'bg-success/20 text-success',
  'Negociando': 'bg-warning/20 text-warning',
  'Em Vistoria': 'bg-info/20 text-info',
  'Vendido': 'bg-muted text-muted-foreground',
};

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tenantId } = useAuth();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('vehicles').select('*').eq('id', id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const updateVehicle = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      const { error } = await supabase.from('vehicles').update(updates).eq('id', id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', id] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Veículo atualizado!');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteVehicle = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('vehicles').delete().eq('id', id!);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Veículo excluído!');
      navigate('/estoque');
    },
  });

  const handlePhotosChange = (photos: string[]) => {
    updateVehicle.mutate({ photos });
  };

  const handleStatusChange = (status: string) => {
    updateVehicle.mutate({ status });
  };

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;
  if (!vehicle) return <div className="text-center py-12 text-muted-foreground">Veículo não encontrado.</div>;

  const features = (vehicle.features as string[]) || [];
  const photos = (vehicle.photos as string[]) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/estoque')}>
          <ArrowLeft className="mr-2 h-4 w-4" />Voltar
        </Button>
        <div className="flex gap-2">
          <Select value={vehicle.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => {
              if (confirm('Excluir este veículo?')) deleteVehicle.mutate();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">{vehicle.brand} {vehicle.model}</h1>
          <p className="text-muted-foreground">{vehicle.version} • {vehicle.year} • {vehicle.plate || 'Sem placa'}</p>
        </div>
        <Badge className={`ml-auto ${statusColors[vehicle.status] || 'bg-muted text-muted-foreground'}`}>
          {vehicle.status}
        </Badge>
      </div>

      {/* Photo Gallery */}
      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <PhotoGallery photos={photos} alt={`${vehicle.brand} ${vehicle.model}`} />
        </CardContent>
      </Card>

      {/* Photo Upload */}
      {tenantId && (
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <PhotoUploader
              vehicleId={vehicle.id}
              tenantId={tenantId}
              existingPhotos={photos}
              maxPhotos={15}
              onPhotosChange={handlePhotosChange}
            />
          </CardContent>
        </Card>
      )}

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
              {vehicle.cost_price && vehicle.sale_price && (
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-muted-foreground">Margem</span>
                  <span className="font-heading font-bold text-primary">
                    R$ {(Number(vehicle.sale_price) - Number(vehicle.cost_price)).toLocaleString('pt-BR')}
                  </span>
                </div>
              )}
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
