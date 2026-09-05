import { BENEFIT_DAILY_COSTS, COMPANY_PHONE_TIERS, COMPANY_VEHICLE_TIERS, MANAGER_BENEFITS_ROLE_MULTIPLIER } from '@/game/constants/benefits';
import { clamp } from '@/lib/random';
import type { CompanyPhone, CompanyVehicle, Employee, EmployeeBenefits, Manager } from '@/game/types';

function findVehicle(id: string | null, vehicles: CompanyVehicle[]): CompanyVehicle | null {
  return id ? vehicles.find((v) => v.id === id) ?? null : null;
}

function findPhone(id: string | null, phones: CompanyPhone[]): CompanyPhone | null {
  return id ? phones.find((p) => p.id === id) ?? null : null;
}

/** Daily-equivalent cost of everything in this person's benefits package, excluding base salary. */
export function calculateBenefitsDailyCost(benefits: EmployeeBenefits, annualSalary: number): number {
  let cost = 0;
  if (benefits.healthInsurance) cost += BENEFIT_DAILY_COSTS.healthInsurance;
  if (benefits.mealAllowance) cost += BENEFIT_DAILY_COSTS.mealAllowance;
  if (benefits.travelAllowance) cost += BENEFIT_DAILY_COSTS.travelAllowance;
  if (benefits.trainingBudget) cost += BENEFIT_DAILY_COSTS.trainingBudget;
  if (benefits.paidVacation) cost += BENEFIT_DAILY_COSTS.paidVacation;
  if (benefits.bonusPlanPct > 0) cost += (annualSalary * benefits.bonusPlanPct) / 100 / 365;
  return cost;
}

/** Vehicle + phone monthly operating cost — charged whether or not they're currently assigned (the business still owns and insures them). */
export function calculateCompanyAssetMonthlyCost(vehicles: CompanyVehicle[], phones: CompanyPhone[]): number {
  return vehicles.reduce((s, v) => s + v.monthlyCost, 0) + phones.reduce((s, p) => s + p.monthlyCost, 0);
}

/** Steady-state morale contribution from a benefits package — fed into driftMorale alongside staffing/pay-fairness/trait. */
export function calculateBenefitsMoraleBonus(benefits: EmployeeBenefits): number {
  let bonus = 0;
  if (benefits.healthInsurance) bonus += 3;
  if (benefits.mealAllowance) bonus += 2;
  if (benefits.travelAllowance) bonus += 1;
  if (benefits.paidVacation) bonus += 2;
  if (benefits.bonusPlanPct > 0) bonus += Math.min(4, benefits.bonusPlanPct * 0.4);
  if (benefits.companyCarId) bonus += 2;
  if (benefits.companyPhoneId) bonus += 1;
  return bonus;
}

/** Multiplies the base resignation chance — good benefits measurably reduce turnover. */
export function calculateBenefitsResignationMultiplier(benefits: EmployeeBenefits): number {
  let multiplier = 1;
  if (benefits.healthInsurance) multiplier *= 0.75;
  if (benefits.paidVacation) multiplier *= 0.85;
  if (benefits.bonusPlanPct > 0) multiplier *= 0.9;
  return multiplier;
}

/** Slow, capped skill growth for employees enrolled in a training budget. */
export function applyTrainingSkillGrowth(employee: Employee): number {
  if (!employee.benefits.trainingBudget) return employee.skill;
  return clamp(employee.skill + 0.05, 0, 100);
}

/**
 * A manager's assigned company car/phone raises their effective stats for whatever simulation
 * reads them (delegation quality, HR automation, etc.) — bigger for corporate/regional roles who
 * actually depend on mobility and coordination, smaller for a single-site location manager.
 * Returns a shallow clone; the manager's stored base stats are never mutated.
 */
export function getEffectiveManagerStats(manager: Manager, companyVehicles: CompanyVehicle[], companyPhones: CompanyPhone[]): Manager {
  const car = findVehicle(manager.benefits.companyCarId, companyVehicles);
  const phone = findPhone(manager.benefits.companyPhoneId, companyPhones);
  if (!car && !phone) return manager;

  const roleMultiplier = MANAGER_BENEFITS_ROLE_MULTIPLIER[manager.role];
  const carDef = car ? COMPANY_VEHICLE_TIERS.find((t) => t.tier === car.tier) : null;
  const phoneDef = phone ? COMPANY_PHONE_TIERS.find((t) => t.tier === phone.tier) : null;
  const carBonus = (carDef?.performanceBonus ?? 0) * roleMultiplier;
  const phoneBonus = (phoneDef?.performanceBonus ?? 0) * roleMultiplier;

  return {
    ...manager,
    leadership: clamp(manager.leadership + carBonus, 0, 100),
    operations: clamp(manager.operations + carBonus, 0, 100),
    peopleSkill: clamp(manager.peopleSkill + phoneBonus, 0, 100),
    marketingSkill: clamp(manager.marketingSkill + phoneBonus, 0, 100),
  };
}

export interface EmployeeCompensationBreakdown {
  basePay: number; // daily
  bonus: number; // daily
  car: number; // daily
  phone: number; // daily
  insurance: number; // daily
  training: number; // daily
  other: number; // daily (meal + travel + vacation)
  total: number; // daily
}

export function calculateCompensationBreakdown(
  benefits: EmployeeBenefits,
  annualSalary: number,
  companyVehicles: CompanyVehicle[],
  companyPhones: CompanyPhone[],
): EmployeeCompensationBreakdown {
  const car = findVehicle(benefits.companyCarId, companyVehicles);
  const phone = findPhone(benefits.companyPhoneId, companyPhones);
  const basePay = annualSalary / 365;
  const bonus = benefits.bonusPlanPct > 0 ? (annualSalary * benefits.bonusPlanPct) / 100 / 365 : 0;
  const carCost = car ? car.monthlyCost / 30 : 0;
  const phoneCost = phone ? phone.monthlyCost / 30 : 0;
  const insurance = benefits.healthInsurance ? BENEFIT_DAILY_COSTS.healthInsurance : 0;
  const training = benefits.trainingBudget ? BENEFIT_DAILY_COSTS.trainingBudget : 0;
  const other = (benefits.mealAllowance ? BENEFIT_DAILY_COSTS.mealAllowance : 0)
    + (benefits.travelAllowance ? BENEFIT_DAILY_COSTS.travelAllowance : 0)
    + (benefits.paidVacation ? BENEFIT_DAILY_COSTS.paidVacation : 0);
  return {
    basePay, bonus, car: carCost, phone: phoneCost, insurance, training, other,
    total: basePay + bonus + carCost + phoneCost + insurance + training + other,
  };
}
