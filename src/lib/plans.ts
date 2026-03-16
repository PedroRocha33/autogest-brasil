export type PlanType = 'free' | 'basico' | 'profissional' | 'marketplace';

export interface PlanLimits {
  maxVehicles: number;
  maxPhotosPerVehicle: number;
  financialCharts: boolean;
  kanban: boolean;
  vistorias: boolean;
  comissoes: boolean;
  servicos: boolean;
  multipleUsers: boolean;
  marketplace: boolean;
  reports: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxVehicles: 5,
    maxPhotosPerVehicle: 3,
    financialCharts: false,
    kanban: false,
    vistorias: false,
    comissoes: false,
    servicos: false,
    multipleUsers: false,
    marketplace: false,
    reports: false,
  },
  basico: {
    maxVehicles: 5,
    maxPhotosPerVehicle: 3,
    financialCharts: false,
    kanban: false,
    vistorias: false,
    comissoes: false,
    servicos: false,
    multipleUsers: false,
    marketplace: false,
    reports: false,
  },
  profissional: {
    maxVehicles: Infinity,
    maxPhotosPerVehicle: 15,
    financialCharts: true,
    kanban: true,
    vistorias: true,
    comissoes: true,
    servicos: true,
    multipleUsers: false,
    marketplace: false,
    reports: false,
  },
  marketplace: {
    maxVehicles: Infinity,
    maxPhotosPerVehicle: 15,
    financialCharts: true,
    kanban: true,
    vistorias: true,
    comissoes: true,
    servicos: true,
    multipleUsers: true,
    marketplace: true,
    reports: true,
  },
};

export const PLAN_PRICES: Record<PlanType, number> = {
  free: 0,
  basico: 97,
  profissional: 197,
  marketplace: 397,
};

export const PLAN_NAMES: Record<PlanType, string> = {
  free: 'Gratuito',
  basico: 'Básico',
  profissional: 'Profissional',
  marketplace: 'Marketplace',
};

export function getPlanLimits(plan: string | null | undefined): PlanLimits {
  const p = (plan || 'free') as PlanType;
  return PLAN_LIMITS[p] || PLAN_LIMITS.free;
}

export function getPlanName(plan: string | null | undefined): string {
  const p = (plan || 'free') as PlanType;
  return PLAN_NAMES[p] || PLAN_NAMES.free;
}
