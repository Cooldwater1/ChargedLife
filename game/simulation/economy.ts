import {
  BASE_WAIT_TIME_MINUTES,
  CUSTOMERS_PER_EMPLOYEE_PER_DAY,
} from '@/game/constants/balance';
import { FAST_FOOD_UPGRADES } from '@/game/constants/data';
import { clamp } from '@/lib/random';
import type { Business, BusinessLocation, Employee, MenuItem, UpgradeDefinition } from '@/game/types';

export interface DemandModifier {
  label: string;
  pct: number;
}

export interface UpgradeEffects {
  capacityPct: number;
  serviceSpeedPct: number;
  qualityPct: number;
  workloadPct: number;
  reputationFlat: number;
}

export interface DemandResult {
  expectedCustomers: number;
  actualCustomers: number;
  capacity: number;
  effectiveCapacity: number;
  modifiers: DemandModifier[];
  requiredStaff: number;
  servingStaff: number;
  staffRatio: number;
  waitTimeMinutes: number;
  serviceQuality: number;
}

export function getUpgradeEffects(upgradeIds: string[], catalog: UpgradeDefinition[] = FAST_FOOD_UPGRADES): UpgradeEffects {
  const result: UpgradeEffects = { capacityPct: 0, serviceSpeedPct: 0, qualityPct: 0, workloadPct: 0, reputationFlat: 0 };
  for (const id of upgradeIds) {
    const def = catalog.find((u) => u.id === id);
    if (!def) continue;
    result.capacityPct += def.effects.capacityPct ?? 0;
    result.serviceSpeedPct += def.effects.serviceSpeedPct ?? 0;
    result.qualityPct += def.effects.qualityPct ?? 0;
    result.workloadPct += def.effects.workloadPct ?? 0;
    result.reputationFlat += def.effects.reputationFlat ?? 0;
  }
  return result;
}

export function calculateAvgOrderValue(menu: MenuItem[]): number {
  const active = menu.filter((m) => m.active);
  if (active.length === 0) return 0;
  const totalPop = active.reduce((s, m) => s + m.popularity, 0) || 1;
  return active.reduce((s, m) => s + m.price * (m.popularity / totalPop), 0);
}

export function calculateAvgCost(menu: MenuItem[]): number {
  const active = menu.filter((m) => m.active);
  if (active.length === 0) return 0;
  const totalPop = active.reduce((s, m) => s + m.popularity, 0) || 1;
  return active.reduce((s, m) => s + m.cost * (m.popularity / totalPop), 0);
}

export function calculateAvgQuality(menu: MenuItem[]): number {
  const active = menu.filter((m) => m.active);
  if (active.length === 0) return 50;
  const totalPop = active.reduce((s, m) => s + m.popularity, 0) || 1;
  return active.reduce((s, m) => s + m.quality * (m.popularity / totalPop), 0);
}

const COMPETITION_MODIFIER: Record<BusinessLocation['competition'], number> = {
  low: 9,
  medium: 0,
  high: -13,
};

export function calculateCapacity(location: BusinessLocation, upgradeEffects: UpgradeEffects): number {
  return location.baseCapacity * (1 + upgradeEffects.capacityPct / 100);
}

/**
 * Core Fast Food demand simulation. Pure function: same inputs always produce
 * the same output (aside from the caller supplying pre-rolled variance).
 */
export function calculateDemand(
  business: Business,
  location: BusinessLocation,
  employees: Employee[],
  marketingBoostPct: number,
  varianceMultiplier = 1,
): DemandResult {
  const upgradeEffects = getUpgradeEffects(location.upgrades);
  const avgPrice = calculateAvgOrderValue(business.menu);
  const avgQuality = calculateAvgQuality(business.menu) * (1 + upgradeEffects.qualityPct / 100);

  const modifiers: DemandModifier[] = [];

  const reputationPct = clamp(((business.reputation - 50) / 50) * 30, -30, 30);
  modifiers.push({ label: reputationPct >= 0 ? 'Strong reputation' : 'Weak reputation', pct: reputationPct });

  if (marketingBoostPct > 0) {
    modifiers.push({ label: 'Active marketing campaign', pct: marketingBoostPct });
  }

  const priceDiffPct = location.marketAvgPrice > 0 ? (avgPrice - location.marketAvgPrice) / location.marketAvgPrice : 0;
  const pricingModifier = clamp(-priceDiffPct * 55, -40, 28);
  if (Math.abs(pricingModifier) >= 1) {
    modifiers.push({ label: pricingModifier >= 0 ? 'Prices below local average' : 'Prices above local average', pct: pricingModifier });
  }

  const qualityPct = clamp(((avgQuality - 70) / 70) * 14, -14, 18);
  if (Math.abs(qualityPct) >= 1) {
    modifiers.push({ label: qualityPct >= 0 ? 'Good product quality' : 'Below-average product quality', pct: qualityPct });
  }

  const hoursOpen = location.closingHour - location.openingHour;
  const hoursPct = clamp(((hoursOpen - 14) / 14) * 100, -35, 25);
  if (Math.abs(hoursPct) >= 1) {
    modifiers.push({ label: hoursPct >= 0 ? 'Extended opening hours' : 'Reduced opening hours', pct: hoursPct });
  }

  const competitionPct = COMPETITION_MODIFIER[location.competition];
  modifiers.push({ label: `${location.competition[0].toUpperCase()}${location.competition.slice(1)} local competition`, pct: competitionPct });

  if (location.lastWaitTimeMinutes > BASE_WAIT_TIME_MINUTES * 1.6) {
    const waitPenalty = clamp(-((location.lastWaitTimeMinutes - BASE_WAIT_TIME_MINUTES * 1.6) * 2.2), -30, 0);
    modifiers.push({ label: 'Long wait times', pct: waitPenalty });
  }

  const combinedMultiplier = modifiers.reduce((acc, m) => acc * (1 + m.pct / 100), 1);
  const expectedCustomers = Math.max(0, Math.round(location.baseDemand * combinedMultiplier * varianceMultiplier));

  const capacity = calculateCapacity(location, upgradeEffects);
  const servingStaff = employees.filter((e) => e.locationId === location.id && (e.role === 'cook' || e.role === 'cashier'));
  const manager = employees.find((e) => e.locationId === location.id && e.role === 'manager');
  const cleaner = employees.find((e) => e.locationId === location.id && e.role === 'cleaner');

  const avgSkill = servingStaff.length > 0 ? servingStaff.reduce((s, e) => s + e.skill, 0) / servingStaff.length : 0;
  const avgMorale = servingStaff.length > 0 ? servingStaff.reduce((s, e) => s + e.morale, 0) / servingStaff.length : 60;
  const skillFactor = 0.55 + clamp(avgSkill / 100, 0, 1) * 0.6;
  const moraleFactor = 0.7 + clamp(avgMorale / 100, 0, 1) * 0.4;
  const managerBonus = manager ? 1 + (manager.skill / 100) * 0.18 : 1;

  const effectiveStaffCount = servingStaff.length * skillFactor * moraleFactor * managerBonus;
  const requiredStaff = Math.max(1, Math.ceil(expectedCustomers / CUSTOMERS_PER_EMPLOYEE_PER_DAY));
  const staffRatio = requiredStaff > 0 ? effectiveStaffCount / requiredStaff : 1;

  const effectiveCapacityFactor = clamp(0.18 + staffRatio * 0.85, 0.18, 1.12);
  const effectiveCapacity = capacity * effectiveCapacityFactor;

  const actualCustomers = Math.max(0, Math.round(Math.min(expectedCustomers, effectiveCapacity)));

  const serviceSpeedMultiplier = 1 + upgradeEffects.serviceSpeedPct / 100;
  const loadRatio = effectiveCapacity > 0 ? expectedCustomers / effectiveCapacity : 1.5;
  const waitTimeMinutes = clamp(
    (BASE_WAIT_TIME_MINUTES * Math.max(1, loadRatio)) / serviceSpeedMultiplier / clamp(staffRatio, 0.35, 1.25) ** 0.5,
    2,
    45,
  );

  const cleanlinessBonus = cleaner ? 6 : 0;
  const serviceQuality = clamp(
    100 - (waitTimeMinutes - BASE_WAIT_TIME_MINUTES) * 3.4 + (staffRatio - 1) * 18 + cleanlinessBonus,
    0,
    100,
  );

  return {
    expectedCustomers,
    actualCustomers,
    capacity,
    effectiveCapacity,
    modifiers,
    requiredStaff,
    servingStaff: servingStaff.length,
    staffRatio,
    waitTimeMinutes,
    serviceQuality,
  };
}

export function calculateSatisfaction(business: Business, demand: DemandResult): number {
  const avgQuality = calculateAvgQuality(business.menu);
  const avgPrice = calculateAvgOrderValue(business.menu);
  const avgCost = calculateAvgCost(business.menu);
  const marginRatio = avgPrice > 0 ? clamp((avgPrice - avgCost) / avgPrice, 0, 1) : 0.4;
  // Customers reward reasonable margins (perceived fairness), penalize extreme markups.
  const priceValueScore = clamp(100 - Math.max(0, marginRatio - 0.55) * 160, 20, 100);

  const satisfaction =
    avgQuality * 0.35 +
    priceValueScore * 0.2 +
    demand.serviceQuality * 0.3 +
    clamp(business.reputation, 0, 100) * 0.15;

  return clamp(satisfaction, 0, 100);
}

export function calculateReputationTarget(satisfaction: number): number {
  return satisfaction;
}

export function calculateNextReputation(current: number, target: number, smoothing: number, noise: number): number {
  return clamp(current + (target - current) * smoothing + noise, 0, 100);
}

/**
 * Rough business valuation used across the UI (business list, overview, sale flow later).
 * A young business has very few days of financial history, so its trailing average
 * profit is noisy — `confidence` damps how much we extrapolate that average into an
 * annualized earnings value, growing toward 1 only after ~2 months of track record.
 * Without this damping, a single good week could imply a multi-million-kroner valuation.
 */
export function calculateBusinessValuation(business: Business): number {
  const recent = business.financialHistory.slice(-30);
  const totalRevenue30d = recent.reduce((s, d) => s + d.revenue, 0);
  const totalProfit30d = recent.reduce((s, d) => s + d.profit, 0);
  const avgDailyProfit = recent.length > 0 ? totalProfit30d / recent.length : 0;
  const confidence = clamp(recent.length / 60, 0.1, 1);

  const debtTotal = business.loans.reduce((s, l) => s + l.remainingBalance, 0);
  const reputationMultiplier = 0.7 + (business.reputation / 100) * 0.6;
  const locationMultiplier = 1 + (business.locations.length - 1) * 0.35;

  const earningsValue = Math.max(0, avgDailyProfit) * 365 * 2.2 * confidence;
  const revenueFloor = totalRevenue30d * 1.1;
  const assetValue = business.cash + business.locations.length * 25_000;

  const rawValue = (Math.max(earningsValue, revenueFloor * 0.4) + assetValue) * reputationMultiplier * locationMultiplier;
  return Math.max(0, Math.round(rawValue - debtTotal));
}

export function calculateCreditScore(params: {
  netWorth: number;
  totalDebt: number;
  annualIncome: number;
  missedPayments: number;
}): number {
  let score = 620;
  score += clamp(params.netWorth / 50_000, 0, 100);
  score += clamp(params.annualIncome / 20_000, 0, 60);
  score -= clamp(params.totalDebt / 25_000, 0, 150);
  score -= params.missedPayments * 35;
  return Math.round(clamp(score, 300, 850));
}

export function calculateLoanMonthlyPayment(principal: number, annualRate: number, termMonths: number): number {
  const monthlyRate = annualRate / 12;
  if (monthlyRate === 0) return principal / termMonths;
  const payment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
  return Math.round(payment);
}
