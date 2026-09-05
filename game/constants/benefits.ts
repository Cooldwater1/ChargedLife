import type { CompanyPhoneTier, CompanyVehicleTier, ManagerRole } from '@/game/types';

// ---------- Recurring per-person benefit costs (all daily-equivalent, charged weekly alongside payroll) ----------

export const BENEFIT_DAILY_COSTS = {
  healthInsurance: 9,
  mealAllowance: 6,
  travelAllowance: 11,
  trainingBudget: 5,
  paidVacation: 4,
} as const;

// ---------- Company vehicles ----------

export interface CompanyVehicleTierDef {
  tier: CompanyVehicleTier;
  label: string;
  name: string;
  purchasePrice: number;
  monthlyCost: number; // insurance + maintenance + fuel, all-in
  performanceBonus: number; // flat points added to relevant manager stats when assigned
}

export const COMPANY_VEHICLE_TIERS: CompanyVehicleTierDef[] = [
  { tier: 'economy', label: 'Economy', name: 'Compact Sedan', purchasePrice: 22_000, monthlyCost: 380, performanceBonus: 2 },
  { tier: 'standard', label: 'Standard', name: 'Mid-Size SUV', purchasePrice: 42_000, monthlyCost: 620, performanceBonus: 4 },
  { tier: 'executive', label: 'Executive', name: 'Luxury Sedan', purchasePrice: 85_000, monthlyCost: 1_100, performanceBonus: 7 },
];

// ---------- Company phones ----------

export interface CompanyPhoneTierDef {
  tier: CompanyPhoneTier;
  label: string;
  equipmentCost: number;
  monthlyCost: number;
  performanceBonus: number;
}

export const COMPANY_PHONE_TIERS: CompanyPhoneTierDef[] = [
  { tier: 'basic', label: 'Basic', equipmentCost: 400, monthlyCost: 45, performanceBonus: 1 },
  { tier: 'standard', label: 'Standard', equipmentCost: 900, monthlyCost: 75, performanceBonus: 3 },
  { tier: 'premium', label: 'Premium', equipmentCost: 1_600, monthlyCost: 120, performanceBonus: 5 },
];

/** Corporate/regional roles lean on cars and phones far more than a single-site location manager. */
export const MANAGER_BENEFITS_ROLE_MULTIPLIER: Record<ManagerRole, number> = {
  location_manager: 1,
  operations_director: 1.1,
  hr_manager: 1.1,
  regional_manager: 1.4,
  coo: 1.6,
  cfo: 1.5,
  cmo: 1.5,
  ceo: 1.8,
  inventory_manager: 1.1,
  procurement_manager: 1.1,
  warehouse_manager: 1.1,
};
