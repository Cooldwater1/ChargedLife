import { HR_AUTO_FIRE_MIN_HISTORY, HR_AUTO_FIRE_PERFORMANCE_THRESHOLD, HR_TRAINING_SKILL_GAIN_PER_SESSION } from '@/game/constants/balance';
import { calculateDemand } from '@/game/simulation/economy';
import { getMarketingBoostForLocation } from '@/game/simulation/business';
import { generateCandidatePool } from '@/game/simulation/employees';
import { getEffectiveManagerStats } from '@/game/simulation/benefits';
import { generateId } from '@/lib/id';
import { clamp, randInt } from '@/lib/random';
import { createDefaultBenefits, type Business, type CEOStrategy, type Employee, type ManagementLogEntry } from '@/game/types';
import type { PendingNotification, PendingTransaction } from '@/game/simulation/business';

function pushLog(log: ManagementLogEntry[], dayIndex: number, role: ManagementLogEntry['role'], message: string): void {
  log.push({ id: generateId('mgmtlog'), timestamp: dayIndex, role, message });
}

/** HR manager's overall competence — used to scale hiring quality, training efficiency, and fire-decision accuracy. */
function hrCompetence(business: Business): number {
  const hr = business.managers.find((m) => m.role === 'hr_manager');
  if (!hr) return 50;
  const effective = getEffectiveManagerStats(hr, business.companyVehicles, business.companyPhones);
  return (effective.peopleSkill + effective.leadership) / 2;
}

/**
 * Daily HR automation: proactive hiring when understaffed, performance-based (never single-incident) firing,
 * and skill training funded from a real monthly budget. Only acts when an HR Manager is actually on staff —
 * hiring an HR Manager is what unlocks this, not just flipping a switch.
 */
export function runHRAutomationDaily(business: Business, rng: () => number, dayIndex: number): { business: Business; transactions: PendingTransaction[]; notifications: PendingNotification[] } {
  const hr = business.managers.find((m) => m.role === 'hr_manager');
  if (!hr) return { business, transactions: [], notifications: [] };

  const transactions: PendingTransaction[] = [];
  const notifications: PendingNotification[] = [];
  const log = [...business.managementLog];
  let employees = business.employees;
  const competence = hrCompetence(business);

  // ---------- Auto-hire ----------
  if (business.hrSettings.autoHire && business.delegation.hiring === 'manager') {
    for (const location of business.locations) {
      const boost = getMarketingBoostForLocation(business, location);
      const demand = calculateDemand(business, location, employees, boost);
      if (demand.staffRatio < 0.75 && business.cash > 4_000) {
        const role = demand.requiredStaff > demand.servingStaff ? 'cook' : 'cashier';
        const [candidate] = generateCandidatePool(rng, role, 1);
        const qualityFactor = 0.55 + (competence / 100) * 0.5; // a sharp HR manager finds meaningfully better candidates
        const skill = Math.round(clamp(candidate.skill * qualityFactor, 20, 98));
        const newEmployee: Employee = {
          id: generateId('employee'), locationId: location.id, businessId: business.id, name: candidate.name, age: candidate.age,
          role: candidate.role, salary: candidate.expectedSalary, skill, experienceYears: candidate.experienceYears,
          morale: 68, loyalty: 55, trait: candidate.trait, hiredAt: dayIndex, performanceHistory: [],
          benefits: createDefaultBenefits(),
        };
        employees = [...employees, newEmployee];
        pushLog(log, dayIndex, 'hr_manager', `HR Manager ${hr.name} hired ${candidate.name} as ${candidate.role} at ${location.name} for $${candidate.expectedSalary.toLocaleString('en-US')}/yr.`);
        notifications.push({
          title: 'HR Hired Staff', message: `${hr.name} hired ${candidate.name} at ${location.name} to cover a staffing shortage.`,
          severity: 'info', link: { page: 'businesses', businessId: business.id },
        });
        break; // at most one hire per day keeps this from ever feeling like a spam engine
      }
    }
  }

  // ---------- Auto-fire (performance history, never a single bad day) ----------
  if (business.hrSettings.autoFire) {
    const candidate = employees.find((e) => {
      const history = e.performanceHistory ?? [];
      if (history.length < HR_AUTO_FIRE_MIN_HISTORY) return false;
      const avg = history.reduce((s, v) => s + v, 0) / history.length;
      return avg < HR_AUTO_FIRE_PERFORMANCE_THRESHOLD;
    });
    if (candidate) {
      employees = employees.filter((e) => e.id !== candidate.id);
      pushLog(log, dayIndex, 'hr_manager', `HR Manager ${hr.name} let go of ${candidate.name} after a sustained performance decline.`);
      notifications.push({
        title: 'HR Performance Action', message: `${hr.name} let go of ${candidate.name} at after a sustained run of weak performance.`,
        severity: 'info', link: { page: 'businesses', businessId: business.id },
      });
    }
  }

  // ---------- Auto-train (real monthly budget, real skill gain) ----------
  if (business.hrSettings.autoTrain && business.hrSettings.trainingBudgetMonthly > 0 && dayIndex % 30 === 0) {
    const costPerSession = 450;
    const budget = business.hrSettings.trainingBudgetMonthly;
    const sessionsAffordable = Math.max(0, Math.floor(budget / costPerSession));
    const trainees = [...employees].sort((a, b) => a.skill - b.skill).slice(0, sessionsAffordable);
    if (trainees.length > 0) {
      const gainPerSession = Math.round(HR_TRAINING_SKILL_GAIN_PER_SESSION * (0.6 + (competence / 100) * 0.8));
      const traineeIds = new Set(trainees.map((t) => t.id));
      employees = employees.map((e) => (traineeIds.has(e.id) ? { ...e, skill: clamp(e.skill + gainPerSession, 0, 100) } : e));
      const totalSpend = trainees.length * costPerSession;
      transactions.push({ amount: -totalSpend, category: 'business_training', description: `Employee training (${trainees.length} employees)` });
      pushLog(log, dayIndex, 'hr_manager', `HR Manager ${hr.name} enrolled ${trainees.length} employee(s) in training for $${totalSpend.toLocaleString('en-US')}.`);
    }
  }

  return { business: { ...business, employees, managementLog: log.slice(-40) }, transactions, notifications };
}

const STRATEGY_BUDGET_FACTOR: Record<CEOStrategy, number> = {
  conservative: 0.5,
  balanced: 0.85,
  growth: 1.2,
  aggressive_growth: 1.6,
  profit_maximization: 0.35,
};

/**
 * Monthly CEO automation: reallocates the HR recruitment/training budgets (and, within limits, marketing)
 * based on recent profit trend and the owner-selected strategy — a real decision the player can see and cap,
 * not a black box.
 */
export function runCEOAutomationMonthly(business: Business, dayIndex: number): { business: Business; notifications: PendingNotification[] } {
  const ceo = business.managers.find((m) => m.role === 'ceo');
  if (!ceo || business.ceoSettings.budgetAllocation !== 'manager') return { business, notifications: [] };

  const notifications: PendingNotification[] = [];
  const log = [...business.managementLog];
  const recent = business.financialHistory.slice(-30);
  const avgDailyProfit = recent.length > 0 ? recent.reduce((s, d) => s + d.profit, 0) / recent.length : 0;
  const monthlyProfit = avgDailyProfit * 30;

  if (business.cash < business.ceoSettings.minCashReserve) {
    // Below the owner's reserve floor — CEO pulls back regardless of strategy.
    const cutHr = { ...business.hrSettings, recruitmentBudgetMonthly: Math.round(business.hrSettings.recruitmentBudgetMonthly * 0.5), trainingBudgetMonthly: Math.round(business.hrSettings.trainingBudgetMonthly * 0.5) };
    if (cutHr.recruitmentBudgetMonthly !== business.hrSettings.recruitmentBudgetMonthly) {
      pushLog(log, dayIndex, 'ceo', `${ceo.name} cut discretionary budgets after cash fell below the $${business.ceoSettings.minCashReserve.toLocaleString('en-US')} reserve floor.`);
      notifications.push({ title: 'CEO Cut Spending', message: `${ceo.name} reduced HR budgets to protect cash reserves.`, severity: 'warning', link: { page: 'businesses', businessId: business.id } });
    }
    return { business: { ...business, hrSettings: cutHr, managementLog: log.slice(-40) }, notifications };
  }

  const factor = STRATEGY_BUDGET_FACTOR[business.ceoSettings.strategy];
  const targetTotal = Math.max(1_000, Math.round(Math.max(monthlyProfit, 0) * 0.08 * factor));
  const cappedTotal = Math.min(targetTotal, business.ceoSettings.maxDiscretionaryMonthlySpend);
  const newRecruitment = Math.round(cappedTotal * 0.5);
  const newTraining = cappedTotal - newRecruitment;

  const changed = newRecruitment !== business.hrSettings.recruitmentBudgetMonthly || newTraining !== business.hrSettings.trainingBudgetMonthly;
  if (changed) {
    pushLog(log, dayIndex, 'ceo', `${ceo.name} set HR budget to $${newRecruitment.toLocaleString('en-US')} recruitment / $${newTraining.toLocaleString('en-US')} training under a ${business.ceoSettings.strategy.replace('_', ' ')} strategy.`);
    notifications.push({
      title: 'CEO Budget Update', message: `${ceo.name} adjusted HR budgets based on recent performance (${business.ceoSettings.strategy.replace('_', ' ')} strategy).`,
      severity: 'info', link: { page: 'businesses', businessId: business.id },
    });
  }

  return {
    business: {
      ...business,
      hrSettings: { ...business.hrSettings, recruitmentBudgetMonthly: newRecruitment, trainingBudgetMonthly: newTraining },
      managementLog: log.slice(-40),
    },
    notifications,
  };
}

/** Weekly performance snapshot every employee accrues — the raw material auto-fire judges against, so a single bad day can never be the whole story. */
export function snapshotEmployeePerformance(business: Business, rng: () => number): Business {
  const employees = business.employees.map((e) => {
    const noise = randInt(rng, -6, 6);
    const performance = clamp(Math.round(e.skill * 0.5 + e.morale * 0.35 + e.loyalty * 0.15 + noise), 0, 100);
    const history = [...(e.performanceHistory ?? []), performance].slice(-8);
    return { ...e, performanceHistory: history };
  });
  return { ...business, employees };
}
