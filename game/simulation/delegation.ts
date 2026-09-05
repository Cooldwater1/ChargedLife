import { MANAGER_HIRING_COST_PCT, MANAGER_ROLE_BASE_SALARY } from '@/game/constants/balance';
import { FIRST_NAMES, LAST_NAMES } from '@/game/constants/data';
import { generateId } from '@/lib/id';
import { pickOne, randInt, randRange } from '@/lib/random';
import { calculateAvgOrderValue, calculateDemand } from '@/game/simulation/economy';
import { generateCandidatePool } from '@/game/simulation/employees';
import { getEffectiveManagerStats } from '@/game/simulation/benefits';
import { getMarketingBoostForLocation } from '@/game/simulation/business';
import { createDefaultBenefits, type Business, type Manager, type ManagerRole } from '@/game/types';
import type { PendingNotification, PendingTransaction } from '@/game/simulation/business';

export type ManagerCandidate = Omit<Manager, 'id' | 'businessId' | 'locationId' | 'hiredAt'> & { candidateId: string };

export function generateManagerCandidate(rng: () => number, role: ManagerRole): Omit<Manager, 'id' | 'businessId' | 'locationId' | 'hiredAt'> {
  const baseSalary = MANAGER_ROLE_BASE_SALARY[role] ?? 60_000;
  return {
    role,
    name: `${pickOne(rng, FIRST_NAMES)} ${pickOne(rng, LAST_NAMES)}`,
    age: randInt(rng, 28, 58),
    leadership: randInt(rng, 40, 90),
    operations: randInt(rng, 40, 90),
    finance: randInt(rng, 40, 90),
    marketingSkill: randInt(rng, 40, 90),
    peopleSkill: randInt(rng, 40, 90),
    growth: randInt(rng, 40, 90),
    experienceYears: randInt(rng, 2, 15),
    salary: Math.round(baseSalary * randRange(rng, 0.9, 1.25)),
    benefits: createDefaultBenefits(),
  };
}

/** A browsable slate of candidates for an executive role — mirrors the employee hiring pool so executives feel like a real hiring decision, not a random roll. */
export function generateManagerCandidatePool(rng: () => number, role: ManagerRole, count = 3): ManagerCandidate[] {
  return Array.from({ length: count }, () => ({ ...generateManagerCandidate(rng, role), candidateId: generateId('mgr-candidate') }));
}

/** One-time recruitment/signing/onboarding cost to hire this candidate — scales with seniority and their actual negotiated salary, not the role's base rate. */
export function calculateManagerHiringCost(role: ManagerRole, salary: number): number {
  const pct = MANAGER_HIRING_COST_PCT[role] ?? 0.1;
  return Math.round(salary * pct);
}

/**
 * Applies one day of delegated management. A manager's skill determines how well —
 * not whether — they act, so a weak manager is a real (if survivable) tradeoff
 * against not needing player attention, rather than "automation with no downside."
 */
export function runDelegatedManagement(business: Business, rng: () => number): { business: Business; transactions: PendingTransaction[]; notifications: PendingNotification[] } {
  if (business.managers.length === 0) {
    return { business, transactions: [], notifications: [] };
  }

  const transactions: PendingTransaction[] = [];
  const notifications: PendingNotification[] = [];
  let menu = business.menu;
  let employees = business.employees;

  const findManagerFor = (locationId: string, roleFallback: ManagerRole[]) =>
    business.managers.find((m) => m.locationId === locationId) ?? business.managers.find((m) => m.locationId === null && roleFallback.includes(m.role));

  for (const location of business.locations) {
    if (business.delegation.staffing === 'manager') {
      const rawManager = findManagerFor(location.id, ['regional_manager', 'operations_director', 'coo']);
      const manager = rawManager ? getEffectiveManagerStats(rawManager, business.companyVehicles, business.companyPhones) : null;
      if (manager) {
        const boost = getMarketingBoostForLocation(business, location);
        const demand = calculateDemand({ ...business, employees }, location, employees, boost);
        const sensitivity = 0.6 + (manager.operations / 100) * 0.3; // weak manager reacts later / less precisely

        if (demand.staffRatio < 0.85 * sensitivity && business.cash > 5_000) {
          const candidatePool = generateCandidatePool(rng, demand.requiredStaff > demand.servingStaff ? 'cook' : 'cashier', 1);
          const candidate = candidatePool[0];
          const qualityFactor = 0.6 + (manager.peopleSkill / 100) * 0.4;
          candidate.skill = Math.round(candidate.skill * qualityFactor);
          employees = [...employees, {
            id: generateId('employee'), locationId: location.id, businessId: business.id, name: candidate.name, age: candidate.age,
            role: candidate.role, salary: candidate.expectedSalary, skill: candidate.skill, experienceYears: candidate.experienceYears,
            morale: 65, loyalty: 55, trait: candidate.trait, hiredAt: 0, benefits: createDefaultBenefits(),
          }];
          notifications.push({
            title: 'Manager Hired Staff', message: `${manager.name} hired ${candidate.name} at ${location.name} to address understaffing.`,
            severity: 'info', link: { page: 'businesses', businessId: business.id },
          });
        } else if (demand.staffRatio > 1.6 / sensitivity && demand.servingStaff > 1) {
          const staffAtLocation = employees.filter((e) => e.locationId === location.id && (e.role === 'cook' || e.role === 'cashier'));
          const weakest = [...staffAtLocation].sort((a, b) => a.skill - b.skill)[0];
          if (weakest) {
            employees = employees.filter((e) => e.id !== weakest.id);
            notifications.push({
              title: 'Manager Cut Staff', message: `${manager.name} let go of an underperforming employee at ${location.name} to control payroll.`,
              severity: 'info', link: { page: 'businesses', businessId: business.id },
            });
          }
        }
      }
    }
  }

  if (business.delegation.pricing === 'manager') {
    const rawManager = business.managers.find((m) => m.locationId === null && (m.role === 'cfo' || m.role === 'operations_director' || m.role === 'ceo'));
    const manager = rawManager ? getEffectiveManagerStats(rawManager, business.companyVehicles, business.companyPhones) : null;
    if (manager && business.locations.length > 0) {
      const avgMarket = business.locations.reduce((s, l) => s + l.marketAvgPrice, 0) / business.locations.length;
      const currentAvg = calculateAvgOrderValue(menu);
      const noise = (rng() - 0.5) * (1 - manager.finance / 100) * 0.06;
      const driftFactor = 0.02 * (manager.finance / 100) + noise;
      menu = menu.map((item) => {
        if (!item.active) return item;
        const target = avgMarket > 0 ? (avgMarket / Math.max(1, currentAvg)) * item.price : item.price;
        const nextPrice = item.price + (target - item.price) * driftFactor;
        return { ...item, price: Math.max(0.5, Math.round(nextPrice * 100) / 100) };
      });
    }
  }

  return { business: { ...business, menu, employees }, transactions, notifications };
}
