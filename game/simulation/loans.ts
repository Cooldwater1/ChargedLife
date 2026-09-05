import { LOAN_REVIEW_DAYS, MAX_DEBT_TO_INCOME_RATIO, MIN_CREDIT_SCORE_PREFERRED } from '@/game/constants/balance';
import { calculateLoanMonthlyPayment } from '@/game/simulation/economy';
import { calculateNetWorth } from '@/game/simulation/networth';
import { JOB_DEFINITIONS } from '@/game/constants/data';
import { clamp, randInt } from '@/lib/random';
import type { GameState, LoanApplicationStatus, LoanKind } from '@/game/types';

export interface LoanApplicantProfile {
  annualIncome: number;
  creditScore: number;
  cash: number;
  netWorth: number;
  existingMonthlyDebtPayments: number;
  employmentMonths: number;
  businessMonthlyProfit?: number;
}

export interface UnderwritingResult {
  status: Extract<LoanApplicationStatus, 'approved' | 'denied' | 'counter_offer'>;
  approvedAmount: number | null;
  approvedRateAnnual: number | null;
  denialReasons: string[];
}

/** Builds the exact same underwriting profile the daily loan-application pipeline uses, so a live UI preview (e.g. mortgage approval) and the eventual decision are computed identically. */
export function buildLoanApplicantProfile(game: GameState, extraMonthlyDebt = 0, businessId: string | null = null): LoanApplicantProfile {
  const { player, businesses } = game;
  const job = JOB_DEFINITIONS.find((j) => j.id === player.career.jobId);
  const annualIncome = job ? job.annualSalary + player.career.salaryOverride : 0;
  const existingMonthlyDebt = player.bank.loans.reduce((s, l) => s + l.monthlyPayment, 0)
    + player.properties.reduce((s, p) => s + p.monthlyMortgagePayment, 0)
    + (player.currentRental?.monthlyRent ?? 0)
    + extraMonthlyDebt;
  const netWorth = calculateNetWorth(game);
  const business = businessId ? businesses.find((b) => b.id === businessId) : undefined;
  const businessMonthlyProfit = business ? business.financialHistory.slice(-30).reduce((s, d) => s + d.profit, 0) : undefined;

  return {
    annualIncome, creditScore: player.bank.creditScore, cash: player.cash, netWorth,
    existingMonthlyDebtPayments: existingMonthlyDebt,
    employmentMonths: player.career.hiredAt !== null ? (game.time.dayIndex - player.career.hiredAt) / 30 : 0,
    businessMonthlyProfit,
  };
}

export function calculateLoanRate(baseRate: number, creditScore: number): number {
  const adjustment = creditScore >= 780 ? -0.025 : creditScore >= 720 ? -0.015 : creditScore >= 660 ? 0 : creditScore >= 600 ? 0.02 : 0.05;
  return Math.max(0.02, baseRate + adjustment);
}

export function rollLoanReviewDays(rng: () => number, kind: LoanKind): number {
  const [min, max] = LOAN_REVIEW_DAYS[kind] ?? [1, 3];
  return randInt(rng, min, max);
}

export function underwriteLoan(
  profile: LoanApplicantProfile,
  kind: LoanKind,
  requestedAmount: number,
  requestedTermMonths: number,
  baseRate: number,
): UnderwritingResult {
  const monthlyIncome = profile.annualIncome / 12 + (profile.businessMonthlyProfit ?? 0);
  const rate = calculateLoanRate(baseRate, profile.creditScore);
  const newPayment = calculateLoanMonthlyPayment(requestedAmount, rate, requestedTermMonths);
  const dti = monthlyIncome > 0 ? (profile.existingMonthlyDebtPayments + newPayment) / monthlyIncome : Infinity;

  const reasons: string[] = [];

  const strongCashCushion = profile.cash >= requestedAmount * 1.5;
  if (kind !== 'business' && profile.employmentMonths < 3 && !strongCashCushion) {
    reasons.push('Limited employment history.');
  }
  if (profile.creditScore < MIN_CREDIT_SCORE_PREFERRED) {
    reasons.push('Credit score below preferred threshold.');
  }
  if (dti > MAX_DEBT_TO_INCOME_RATIO) {
    reasons.push('Debt-to-income ratio too high.');
  }
  if (kind === 'business' && profile.businessMonthlyProfit !== undefined && profile.businessMonthlyProfit <= 0) {
    reasons.push('Business is not yet profitable.');
  }
  if (profile.netWorth < 0) {
    reasons.push('Negative net worth.');
  }

  if (reasons.length === 0) {
    return { status: 'approved', approvedAmount: requestedAmount, approvedRateAnnual: rate, denialReasons: [] };
  }

  if (reasons.length === 1 && dti <= MAX_DEBT_TO_INCOME_RATIO * 1.4) {
    // Borderline case: offer a smaller amount instead of an outright denial.
    const maxAffordablePayment = Math.max(0, monthlyIncome * MAX_DEBT_TO_INCOME_RATIO - profile.existingMonthlyDebtPayments);
    const scaleFactor = newPayment > 0 ? clamp(maxAffordablePayment / newPayment, 0.35, 0.85) : 0.6;
    const counterAmount = Math.round(requestedAmount * scaleFactor);
    const counterRate = rate + 0.015;
    return { status: 'counter_offer', approvedAmount: counterAmount, approvedRateAnnual: counterRate, denialReasons: reasons };
  }

  return { status: 'denied', approvedAmount: null, approvedRateAnnual: null, denialReasons: reasons };
}
