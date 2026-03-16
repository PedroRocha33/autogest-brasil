import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { usePlan } from '@/hooks/usePlan';
import UpgradeCard from '@/components/UpgradeCard';

export default function Comissoes() {
  const { tenantId } = useAuth();
  const { limits } = usePlan();

  const { data: commissions = [], isLoading } = useQuery({
    queryKey: ['commissions', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('commissions')
        .select('*, deals(vehicles(brand, model))')
        .eq('tenant_id', tenantId)
        .order('paid_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  if (!limits.comissoes) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Comissões</h1>
        <UpgradeCard
          title="Comissões bloqueadas"
          description="Controle de comissões por vendedor está disponível a partir do plano Profissional."
        />
      </div>
    );
  }
    queryKey: ['commissions', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('commissions')
        .select('*, deals(vehicles(brand, model))')
        .eq('tenant_id', tenantId)
        .order('paid_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Comissões</h1>
        <p className="text-muted-foreground text-sm">{commissions.length} registros</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : commissions.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Nenhuma comissão registrada.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs text-muted-foreground p-3">Veículo</th>
                  <th className="text-left text-xs text-muted-foreground p-3">Valor</th>
                  <th className="text-left text-xs text-muted-foreground p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map(c => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="p-3 text-sm">
                      {c.deals?.vehicles ? `${c.deals.vehicles.brand} ${c.deals.vehicles.model}` : '—'}
                    </td>
                    <td className="p-3 text-sm font-heading font-semibold text-success">
                      R$ {Number(c.value).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-3">
                      <Badge className={`text-xs ${c.paid ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                        {c.paid ? 'Pago' : 'Pendente'}
                      </Badge>
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
