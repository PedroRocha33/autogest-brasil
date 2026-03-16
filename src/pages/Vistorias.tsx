import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, ClipboardCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usePlan } from '@/hooks/usePlan';
import UpgradeCard from '@/components/UpgradeCard';

const statusColors: Record<string, string> = {
  'Agendada': 'bg-warning/20 text-warning',
  'Em Andamento': 'bg-info/20 text-info',
  'Concluída': 'bg-success/20 text-success',
};

const checklistSections = {
  lataria: {
    label: 'Lataria',
    items: ['Capô', 'Para-choque dianteiro', 'Para-lama LD', 'Para-lama LE', 'Porta dianteira LD', 'Porta dianteira LE', 'Porta traseira LD', 'Porta traseira LE', 'Para-choque traseiro', 'Tampa traseira', 'Teto'],
    options: ['Bom', 'Amassado', 'Riscado', 'Quebrado'],
  },
  vidros: {
    label: 'Vidros',
    items: ['Parabrisa', 'Vidro traseiro', 'Vidros laterais'],
    options: ['Bom', 'Trincado', 'Quebrado'],
  },
  interior: {
    label: 'Interior',
    items: ['Bancos', 'Painel', 'Carpete', 'Teto interno', 'Cintos'],
    options: ['Bom', 'Com defeito'],
  },
  mecanica: {
    label: 'Mecânica',
    items: ['Motor', 'Câmbio', 'Freios', 'Suspensão', 'Ar-condicionado'],
    options: ['Bom', 'Com defeito', 'Não verificado'],
  },
  pneus: {
    label: 'Pneus',
    items: ['Dianteiro esquerdo', 'Dianteiro direito', 'Traseiro esquerdo', 'Traseiro direito', 'Estepe'],
    options: ['Bom', 'Desgastado', 'Careca'],
  },
};

const itensList = ['Chave reserva', 'Manual', 'Triângulo', 'Macaco', 'Chave de roda'];

export default function Vistorias() {
  const { tenantId } = useAuth();
  const { limits } = usePlan();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [checklist, setChecklist] = useState<Record<string, Record<string, string>>>({});
  const [itens, setItens] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    vehicle_id: '', type: 'Entrada', inspector: '', odometer: '', fuel_level: '1/2', observations: '',
  });

  const [damagePoints, setDamagePoints] = useState<{ x: number; y: number }[]>([]);

  // Damage map state - clicked points on SVG

  const { data: vistorias = [], isLoading } = useQuery({
    queryKey: ['vistorias', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('vistorias')
        .select('*, vehicles(brand, model, year, plate)')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles-vistoria', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase.from('vehicles').select('id, brand, model, year, plate').eq('tenant_id', tenantId);
      return data || [];
    },
    enabled: !!tenantId,
  });

  const createVistoria = useMutation({
    mutationFn: async () => {
      if (!tenantId) throw new Error('No tenant');
      const { error } = await supabase.from('vistorias').insert({
        tenant_id: tenantId,
        vehicle_id: formData.vehicle_id || null,
        type: formData.type,
        inspector: formData.inspector || null,
        odometer: parseInt(formData.odometer) || null,
        fuel_level: formData.fuel_level,
        observations: formData.observations || null,
        checklist: checklist as any,
        damage_map: damagePoints as any,
        status: 'Agendada',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vistorias'] });
      setDialogOpen(false);
      setChecklist({});
      setItens([]);
      setDamagePoints([]);
      toast.success('Vistoria criada!');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const setChecklistValue = (section: string, item: string, value: string) => {
    setChecklist(prev => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [item]: value },
    }));
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Check if click is near existing point (remove it)
    const existingIdx = damagePoints.findIndex(p => Math.abs(p.x - x) < 4 && Math.abs(p.y - y) < 4);
    if (existingIdx >= 0) {
      setDamagePoints(prev => prev.filter((_, i) => i !== existingIdx));
    } else {
      setDamagePoints(prev => [...prev, { x, y }]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Vistorias</h1>
          <p className="text-muted-foreground text-sm">{vistorias.length} vistorias</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Nova Vistoria</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">Nova Vistoria</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createVistoria.mutate(); }} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Veículo</Label>
                  <Select value={formData.vehicle_id} onValueChange={v => setFormData(f => ({ ...f, vehicle_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {vehicles.map(v => (
                        <SelectItem key={v.id} value={v.id}>{v.brand} {v.model} {v.year} - {v.plate}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={formData.type} onValueChange={v => setFormData(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entrada">Entrada (compra)</SelectItem>
                      <SelectItem value="Saída">Saída (entrega)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Inspetor</Label>
                  <Input value={formData.inspector} onChange={e => setFormData(f => ({ ...f, inspector: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Odômetro (km)</Label>
                  <Input type="number" value={formData.odometer} onChange={e => setFormData(f => ({ ...f, odometer: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Nível de Combustível</Label>
                  <Select value={formData.fuel_level} onValueChange={v => setFormData(f => ({ ...f, fuel_level: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1/4">1/4</SelectItem>
                      <SelectItem value="1/2">1/2</SelectItem>
                      <SelectItem value="3/4">3/4</SelectItem>
                      <SelectItem value="Cheio">Cheio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Checklist Sections */}
              {Object.entries(checklistSections).map(([key, section]) => (
                <div key={key} className="space-y-3">
                  <h3 className="font-heading font-semibold text-sm">{section.label}</h3>
                  <div className="space-y-2">
                    {section.items.map(item => (
                      <div key={item} className="flex items-center justify-between py-1">
                        <span className="text-sm">{item}</span>
                        <RadioGroup
                          className="flex gap-3"
                          value={checklist[key]?.[item] || ''}
                          onValueChange={v => setChecklistValue(key, item, v)}
                        >
                          {section.options.map(opt => (
                            <div key={opt} className="flex items-center gap-1">
                              <RadioGroupItem value={opt} id={`${key}-${item}-${opt}`} />
                              <Label htmlFor={`${key}-${item}-${opt}`} className="text-xs cursor-pointer">{opt}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Items Present */}
              <div className="space-y-3">
                <h3 className="font-heading font-semibold text-sm">Itens Presentes</h3>
                <div className="flex flex-wrap gap-4">
                  {itensList.map(item => (
                    <label key={item} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={itens.includes(item)}
                        onCheckedChange={() => setItens(prev =>
                          prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
                        )}
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              {/* Damage Map SVG */}
              <div className="space-y-3">
                <h3 className="font-heading font-semibold text-sm">Mapa de Avarias (clique para marcar)</h3>
                <div className="bg-secondary rounded-lg p-4">
                  <svg
                    viewBox="0 0 200 400"
                    className="w-full max-w-[200px] mx-auto cursor-crosshair"
                    onClick={handleSvgClick}
                  >
                    {/* Simplified top-down car shape */}
                    <rect x="30" y="20" width="140" height="360" rx="40" fill="hsl(225 20% 20%)" stroke="hsl(225 20% 30%)" strokeWidth="2" />
                    <rect x="45" y="60" width="110" height="70" rx="8" fill="hsl(225 20% 25%)" stroke="hsl(225 20% 35%)" strokeWidth="1" />
                    <rect x="45" y="270" width="110" height="70" rx="8" fill="hsl(225 20% 25%)" stroke="hsl(225 20% 35%)" strokeWidth="1" />
                    {/* Wheels */}
                    <rect x="20" y="80" width="15" height="40" rx="5" fill="hsl(225 20% 15%)" />
                    <rect x="165" y="80" width="15" height="40" rx="5" fill="hsl(225 20% 15%)" />
                    <rect x="20" y="280" width="15" height="40" rx="5" fill="hsl(225 20% 15%)" />
                    <rect x="165" y="280" width="15" height="40" rx="5" fill="hsl(225 20% 15%)" />
                    {/* Damage points */}
                    {damagePoints.map((p, i) => (
                      <circle key={i} cx={p.x * 2} cy={p.y * 4} r="6" fill="hsl(0 72% 59%)" opacity="0.8" stroke="white" strokeWidth="1" />
                    ))}
                  </svg>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    {damagePoints.length} ponto(s) marcado(s)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea value={formData.observations} onChange={e => setFormData(f => ({ ...f, observations: e.target.value }))} />
              </div>

              <Button type="submit" className="w-full" disabled={createVistoria.isPending}>
                {createVistoria.isPending ? 'Salvando...' : 'Criar Vistoria'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : vistorias.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma vistoria cadastrada.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {vistorias.map(v => (
            <Card key={v.id} className="bg-card border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">
                      {v.vehicles ? `${v.vehicles.brand} ${v.vehicles.model} ${v.vehicles.year}` : 'Sem veículo'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {v.type} • {v.inspector || 'Sem inspetor'} • {new Date(v.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <Badge className={`text-xs ${statusColors[v.status]}`}>{v.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
