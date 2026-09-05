import { EMPLOYEE_TRAITS, FIRST_NAMES, LAST_NAMES } from '@/game/constants/data';
import { DAILY_RESIGNATION_BASE_CHANCE, EMPLOYEE_HIRING_COST_BASE, EMPLOYEE_HIRING_COST_PCT_OF_SALARY } from '@/game/constants/balance';
import { generateId } from '@/lib/id';
import { clamp, pickOne, randInt, randRange } from '@/lib/random';
import type { DemandResult } from '@/game/simulation/economy';
import { createDefaultBenefits, type BusinessLocation, type Employee, type EmployeeRole, type JobCandidate } from '@/game/types';

/** One-time recruitment/onboarding cost to hire this candidate — separate from their ongoing salary. */
export function calculateEmployeeHiringCost(candidate: Pick<JobCandidate, 'expectedSalary'>): number {
  return Math.round(candidate.expectedSalary * EMPLOYEE_HIRING_COST_PCT_OF_SALARY + EMPLOYEE_HIRING_COST_BASE);
}

const ROLE_BASE_SALARY: Record<EmployeeRole, number> = {
  manager: 42_000,
  cook: 32_000,
  cashier: 28_000,
  cleaner: 26_000,
};

export function generateCandidate(rng: () => number, role: EmployeeRole): JobCandidate {
  const skill = randInt(rng, 35, 92);
  const experienceYears = Number(randRange(rng, 0, 8).toFixed(1));
  const age = randInt(rng, 18, 58);
  const salaryVariance = randRange(rng, 0.85, 1.2);
  const expectedSalary = Math.round(
    (ROLE_BASE_SALARY[role] + experienceYears * 900 + (skill - 60) * 120) * salaryVariance / 500,
  ) * 500;

  return {
    id: generateId('candidate'),
    name: `${pickOne(rng, FIRST_NAMES)} ${pickOne(rng, LAST_NAMES)}`,
    age,
    role,
    skill,
    experienceYears,
    expectedSalary: Math.max(22_000, expectedSalary),
    trait: pickOne(rng, EMPLOYEE_TRAITS),
  };
}

export function generateCandidatePool(rng: () => number, role: EmployeeRole, count = 4): JobCandidate[] {
  return Array.from({ length: count }, () => generateCandidate(rng, role));
}

export function candidateToEmployee(candidate: JobCandidate, locationId: string, businessId: string, hiredAt: number): Employee {
  return {
    id: generateId('employee'),
    locationId,
    businessId,
    name: candidate.name,
    age: candidate.age,
    role: candidate.role,
    salary: candidate.expectedSalary,
    skill: candidate.skill,
    experienceYears: candidate.experienceYears,
    morale: 70,
    loyalty: 55,
    trait: candidate.trait,
    hiredAt,
    benefits: createDefaultBenefits(),
  };
}

const TRAIT_MORALE_BIAS: Record<Employee['trait'], number> = {
  hardworking: 1,
  friendly: 2,
  ambitious: -1,
  quick_learner: 1,
  leader: 1,
  reliable: 2,
  lazy: -2,
  difficult: -3,
};

/**
 * Drifts an employee's morale based on staffing pressure, pay fairness, and trait.
 * `staffRatio` < 1 means the location is understaffed for current demand.
 */
export function driftMorale(employee: Employee, staffRatio: number, marketSalary: number): number {
  const staffingPressure = staffRatio < 0.85 ? (0.85 - staffRatio) * -18 : staffRatio > 1.2 ? 1 : 0.4;
  const payFairness = marketSalary > 0 ? clamp((employee.salary - marketSalary) / marketSalary, -0.3, 0.3) * 10 : 0;
  const traitBias = TRAIT_MORALE_BIAS[employee.trait];
  const drift = staffingPressure + payFairness + traitBias * 0.3;
  return clamp(employee.morale + drift, 0, 100);
}

export function shouldResign(employee: Employee, rng: () => number, resignationMultiplier = 1): boolean {
  if (employee.morale > 25) return false;
  const traitFactor = employee.trait === 'difficult' ? 1.6 : employee.trait === 'reliable' ? 0.5 : 1;
  const chance = DAILY_RESIGNATION_BASE_CHANCE * ((30 - employee.morale) / 10) * traitFactor * resignationMultiplier;
  return rng() < chance;
}

export interface EmployeeRoleNeed {
  currentCount: number;
  neededCount: number;
  gap: number;
  note: string;
}

/**
 * A simple, honest read on whether this location has enough of a given role — reuses the same
 * requiredStaff/staffRatio numbers calculateDemand already produces rather than modeling a
 * separate per-role capacity curve, per the "don't create extreme micromanagement" directive.
 */
export function getEmployeeRoleNeed(role: EmployeeRole, location: BusinessLocation, locationEmployees: Employee[], demand: DemandResult): EmployeeRoleNeed {
  const currentCount = locationEmployees.filter((e) => e.role === role).length;

  if (role === 'manager') {
    const neededCount = 1;
    const gap = neededCount - currentCount;
    return { currentCount, neededCount, gap, note: gap > 0 ? `${location.name} has no manager on site.` : `${location.name} is staffed with a manager.` };
  }

  if (role === 'cleaner') {
    const neededCount = Math.max(1, Math.ceil(location.baseCapacity / 250));
    const gap = neededCount - currentCount;
    return { currentCount, neededCount, gap, note: gap > 0 ? `Needs ${neededCount} cleaner(s), has ${currentCount}.` : `Cleaning coverage is adequate.` };
  }

  // cook / cashier split the serving-staff requirement evenly
  const neededCount = Math.max(1, Math.ceil(demand.requiredStaff / 2));
  const gap = neededCount - currentCount;
  const speedLabel = role === 'cashier' ? 'checkout speed' : 'kitchen throughput';
  const speedImpactPct = demand.staffRatio < 1 ? -Math.round((1 - demand.staffRatio) * 20) : 0;
  const note = gap > 0
    ? `Needs ${neededCount} ${ROLE_LABEL_LOOKUP[role]}${neededCount === 1 ? '' : 's'}, has ${currentCount}${speedImpactPct !== 0 ? `, ${speedLabel} ${speedImpactPct}%` : ''}.`
    : `${ROLE_LABEL_LOOKUP[role]} staffing is sufficient for current demand.`;
  return { currentCount, neededCount, gap, note };
}

const ROLE_LABEL_LOOKUP: Record<EmployeeRole, string> = { manager: 'Manager', cook: 'Cook', cashier: 'Cashier', cleaner: 'Cleaner' };

export function calculateProductivity(employee: Employee): number {
  const skillFactor = employee.skill / 100;
  const moraleFactor = 0.5 + (employee.morale / 100) * 0.5;
  const experienceFactor = 0.85 + Math.min(employee.experienceYears, 10) * 0.015;
  return clamp(skillFactor * moraleFactor * experienceFactor * 100, 0, 130);
}
