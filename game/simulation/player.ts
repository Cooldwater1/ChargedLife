import { JOB_DEFINITIONS } from '@/game/constants/data';
import { DAILY_LIVING_EXPENSE_MAX, DAILY_LIVING_EXPENSE_MIN, MORTGAGE_RATE_ANNUAL, PERFORMANCE_DRIFT_PER_DAY, PROPERTY_MAINTENANCE_PCT_OF_VALUE_MONTHLY, RENTAL_VACANCY_CHANCE_MONTHLY } from '@/game/constants/balance';
import { formatMoney } from '@/lib/format';
import { clamp, randRange } from '@/lib/random';
import type { PendingNotification, PendingTransaction } from '@/game/simulation/business';
import type { Player } from '@/game/types';

export function runDailyLivingExpenses(player: Player, rng: () => number): { player: Player; transactions: PendingTransaction[] } {
  const expense = Math.round(randRange(rng, DAILY_LIVING_EXPENSE_MIN, DAILY_LIVING_EXPENSE_MAX));
  return {
    player: { ...player, cash: player.cash - expense },
    transactions: [{ amount: -expense, category: 'living_expenses', description: 'Daily living expenses' }],
  };
}

/** Small daily performance drift toward a target driven by workload vs. rested state — kept intentionally light-touch. */
export function driftJobPerformance(player: Player, rng: () => number): Player {
  if (!player.career.jobId) return player;
  const noise = (rng() - 0.45) * PERFORMANCE_DRIFT_PER_DAY * 2;
  const performanceScore = clamp(player.career.performanceScore + noise, 0, 100);
  return { ...player, career: { ...player.career, performanceScore } };
}

export function runWeeklySalary(player: Player): { player: Player; transactions: PendingTransaction[]; notifications: PendingNotification[] } {
  if (!player.career.jobId) {
    return { player, transactions: [], notifications: [] };
  }
  const job = JOB_DEFINITIONS.find((j) => j.id === player.career.jobId);
  if (!job) return { player, transactions: [], notifications: [] };

  const weeklySalary = Math.round(job.annualSalary / 52);
  const newProgress = Math.min(100, player.career.promotionProgress + 2.5);
  const industryExperience = { ...player.career.industryExperience };
  industryExperience[job.industry] = (industryExperience[job.industry] ?? 0) + 1 / 52;

  return {
    player: {
      ...player,
      cash: player.cash + weeklySalary,
      career: {
        ...player.career,
        promotionProgress: newProgress,
        experienceYears: player.career.experienceYears + 1 / 52,
        industryExperience,
      },
    },
    transactions: [{ amount: weeklySalary, category: 'salary', description: `Weekly salary — ${job.title}` }],
    notifications: [
      { title: 'Salary Received', message: `You received ${formatMoney(weeklySalary)} from ${job.company}.`, severity: 'success', link: { page: 'career' } },
    ],
  };
}

export function runMonthlyPersonalLoans(player: Player): { player: Player; transactions: PendingTransaction[]; notifications: PendingNotification[] } {
  const transactions: PendingTransaction[] = [];
  const notifications: PendingNotification[] = [];
  let cash = player.cash;

  const updatedLoans = player.bank.loans
    .map((loan) => {
      cash -= loan.monthlyPayment;
      transactions.push({ amount: -loan.monthlyPayment, category: 'loan_payment', description: `${loan.kind === 'student' ? 'Student' : loan.kind === 'auto' ? 'Auto' : 'Personal'} loan payment` });
      const interestPortion = loan.remainingBalance * (loan.interestRateAnnual / 12);
      const remainingBalance = Math.max(0, loan.remainingBalance - (loan.monthlyPayment - interestPortion));
      const monthsRemaining = loan.monthsRemaining - 1;
      if (monthsRemaining <= 0 || remainingBalance <= 0.01) {
        notifications.push({ title: 'Loan Paid Off', message: 'You have fully repaid a personal loan.', severity: 'success', link: { page: 'bank' } });
      }
      return { ...loan, remainingBalance, monthsRemaining };
    })
    .filter((loan) => loan.monthsRemaining > 0 && loan.remainingBalance > 0.01);

  return { player: { ...player, cash, bank: { ...player.bank, loans: updatedLoans } }, transactions, notifications };
}

export function runMonthlySavingsInterest(player: Player): { player: Player; transactions: PendingTransaction[] } {
  if (player.bank.savingsBalance <= 0) return { player, transactions: [] };
  const interest = Math.round(player.bank.savingsBalance * (player.bank.savingsInterestRateAnnual / 12));
  if (interest <= 0) return { player, transactions: [] };
  return {
    player: { ...player, bank: { ...player.bank, savingsBalance: player.bank.savingsBalance + interest } },
    transactions: [{ amount: interest, category: 'savings_interest', description: 'Savings account interest' }],
  };
}

export function runMonthlyProperties(player: Player, rng: () => number): { player: Player; transactions: PendingTransaction[] } {
  const transactions: PendingTransaction[] = [];
  let cash = player.cash;

  const updatedProperties = player.properties.map((property) => {
    cash -= property.mortgageBalance > 0 ? property.monthlyMortgagePayment : 0;
    if (property.monthlyMortgagePayment > 0 && property.mortgageBalance > 0) {
      transactions.push({ amount: -property.monthlyMortgagePayment, category: 'property_mortgage', description: `Mortgage — ${property.name}` });
    }

    const maintenance = Math.round(property.currentValue * PROPERTY_MAINTENANCE_PCT_OF_VALUE_MONTHLY);
    cash -= maintenance;
    transactions.push({ amount: -maintenance, category: 'property_maintenance', description: `Maintenance — ${property.name}` });

    let mortgageBalance = property.mortgageBalance;
    if (mortgageBalance > 0) {
      const interestPortion = (mortgageBalance * MORTGAGE_RATE_ANNUAL) / 12;
      mortgageBalance = Math.max(0, mortgageBalance - (property.monthlyMortgagePayment - interestPortion));
    }

    if (property.use === 'rental') {
      const vacant = rng() < RENTAL_VACANCY_CHANCE_MONTHLY;
      if (!vacant) {
        cash += property.monthlyRent;
        transactions.push({ amount: property.monthlyRent, category: 'property_rent_income', description: `Rental income — ${property.name}` });
      }
    }

    return { ...property, mortgageBalance };
  });

  return { player: { ...player, cash, properties: updatedProperties }, transactions };
}
