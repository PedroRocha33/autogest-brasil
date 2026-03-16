import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { getPlanLimits, type PlanLimits } from '@/lib/plans';

export function usePlan() {
  const { tenantId } = useAuth();

  const { data: tenant } = useQuery({
    queryKey: ['tenant-plan', tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      const { data } = await supabase.from('tenants').select('plan').eq('id', tenantId).single();
      return data;
    },
    enabled: !!tenantId,
  });

  const plan = (tenant?.plan || 'free') as string;
  const limits = getPlanLimits(plan);

  return { plan, limits, tenantId };
}
