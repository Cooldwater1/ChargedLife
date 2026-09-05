import { CHILD_MONTHLY_COST_BASE, DAILY_LIVING_EXPENSE_MAX, DAILY_LIVING_EXPENSE_MIN } from '@/game/constants/balance';
import { getLifestyleTier } from '@/game/constants/lifestyle';
import { calculateLifestyleMonthlyCost } from '@/game/simulation/lifestyle';
import type { GameState } from '@/game/types';

export interface CostBreakdownItem {
  label: string;
  monthlyAmount: number;
  dailyAmount: number;
  detail: string;
}

export interface DailyCostBreakdown {
  housing: CostBreakdownItem;
  transport: CostBreakdownItem;
  food: CostBreakdownItem;
  family: CostBreakdownItem;
  loans: CostBreakdownItem;
  subscriptions: CostBreakdownItem;
  personalLifestyle: CostBreakdownItem;
  lifestyleAssets: CostBreakdownItem;
  totalDaily: number;
  totalMonthly: number;
}

function item(label: string, monthlyAmount: number, detail: string): CostBreakdownItem {
  return { label, monthlyAmount: Math.round(monthlyAmount), dailyAmount: Math.round((monthlyAmount / 30) * 100) / 100, detail };
}

/** Every figure here is derived from real owned assets/loans/family — nothing is hardcoded. */
export function calculateDailyCostBreakdown(state: GameState): DailyCostBreakdown {
  const { player } = state;

  const ownedNonRentalCount = player.properties.filter((p) => p.use !== 'rental').length;
  const ownedHousingMonthly = player.properties
    .filter((p) => p.use !== 'rental')
    .reduce((s, p) => s + p.monthlyMortgagePayment + p.monthlyMaintenance, 0);
  const rentMonthly = player.currentRental?.monthlyRent ?? 0;
  const housingDetailParts: string[] = [];
  if (player.currentRental) housingDetailParts.push(`Renting — ${formatMoneyPlain(rentMonthly)}/mo`);
  if (ownedNonRentalCount > 0) housingDetailParts.push(`${ownedNonRentalCount} owned home(s), mortgage + maintenance`);
  const housingDetail = housingDetailParts.length > 0 ? housingDetailParts.join(' + ') : 'No housing costs';
  const housing = item('Housing', ownedHousingMonthly + rentMonthly, housingDetail);

  const autoLoanMonthly = player.bank.loans.filter((l) => l.kind === 'auto').reduce((s, l) => s + l.monthlyPayment, 0);
  const vehicleUpkeepMonthly = player.vehicles.reduce((s, v) => s + v.insuranceMonthly + v.maintenanceMonthly, 0);
  const transport = item('Transport', autoLoanMonthly + vehicleUpkeepMonthly, `${player.vehicles.length} vehicle(s), insurance + maintenance + auto loans`);

  const chosenFoodTier = getLifestyleTier(player.lifestyle.food);
  const avgDailyFood = (DAILY_LIVING_EXPENSE_MIN + DAILY_LIVING_EXPENSE_MAX) / 2;
  const food = chosenFoodTier
    ? item('Food & Diet', chosenFoodTier.monthlyCost, chosenFoodTier.name)
    : item('Food & Everyday', avgDailyFood * 30, 'Average daily groceries and incidentals (choose a diet tier in Lifestyle)');

  const childrenAtHome = player.family.filter((f) => f.role === 'child' && f.age < 18 && !f.deceased).length;
  const family = item('Children', childrenAtHome * CHILD_MONTHLY_COST_BASE, `${childrenAtHome} child(ren) at home`);

  const loanMonthly = player.bank.loans.filter((l) => l.kind === 'personal' || l.kind === 'student').reduce((s, l) => s + l.monthlyPayment, 0);
  const loans = item('Loans', loanMonthly, 'Personal & student loan payments');

  const subscriptionMonthly = player.subscriptions.filter((s) => s.active).reduce((s, sub) => s + sub.monthlyCost, 0);
  const subscriptions = item('Subscriptions', subscriptionMonthly, `${player.subscriptions.filter((s) => s.active).length} active subscription(s)`);

  const lifestyleMonthlyTotal = calculateLifestyleMonthlyCost(player.lifestyle);
  const personalLifestyleMonthly = lifestyleMonthlyTotal - (chosenFoodTier?.monthlyCost ?? 0);
  const personalLifestyle = item('Fitness, Phone & Services', personalLifestyleMonthly, 'Fitness, entertainment, phone, and personal services from Lifestyle');

  const boatMonthly = player.boats.reduce((s, b) => s + b.maintenanceMonthly + b.marinaFeeMonthly + b.crewCostMonthly, 0);
  const aircraftMonthly = player.aircraft.reduce((s, a) => s + a.operatingCostMonthly + a.crewCostMonthly + a.hangarCostMonthly, 0);
  const rentalPropertyMaintenance = player.properties.filter((p) => p.use === 'rental').reduce((s, p) => s + p.monthlyMaintenance, 0);
  const lifestyleAssets = item('Lifestyle Assets', boatMonthly + aircraftMonthly + rentalPropertyMaintenance, 'Boats, aircraft, and rental property upkeep');

  const totalMonthly = housing.monthlyAmount + transport.monthlyAmount + food.monthlyAmount + family.monthlyAmount
    + loans.monthlyAmount + subscriptions.monthlyAmount + personalLifestyle.monthlyAmount + lifestyleAssets.monthlyAmount;

  return {
    housing, transport, food, family, loans, subscriptions, personalLifestyle, lifestyleAssets,
    totalMonthly: Math.round(totalMonthly),
    totalDaily: Math.round((totalMonthly / 30) * 100) / 100,
  };
}

function formatMoneyPlain(amount: number): string {
  return `$${Math.round(amount).toLocaleString('en-US')}`;
}

export interface FinancialRunway {
  cash: number;
  averageMonthlyExpenses: number;
  runwayMonths: number;
}

export function calculateFinancialRunway(state: GameState): FinancialRunway {
  const breakdown = calculateDailyCostBreakdown(state);
  const runwayMonths = breakdown.totalMonthly > 0 ? state.player.cash / breakdown.totalMonthly : 99;
  return {
    cash: state.player.cash,
    averageMonthlyExpenses: breakdown.totalMonthly,
    runwayMonths: Math.round(runwayMonths * 10) / 10,
  };
}
