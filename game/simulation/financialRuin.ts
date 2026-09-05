import { FINANCIAL_RUIN_CRITICAL_THRESHOLD, FINANCIAL_RUIN_THRESHOLD, FINANCIAL_RUIN_WARNING_THRESHOLD } from '@/game/constants/balance';

export type FinancialHealthSeverity = 'healthy' | 'warning' | 'critical' | 'ruin';

/**
 * Financial ruin is judged ONLY on personal unsecured cash (player.cash going deeply
 * negative from unpaid living expenses/overdraft) — never on secured debt like a
 * mortgage, auto loan, student loan, or business loan. A $900K mortgage on a healthy
 * income is not financial ruin; a -$15,000 personal overdraft is.
 */
export function assessFinancialHealth(cash: number): FinancialHealthSeverity {
  if (cash <= FINANCIAL_RUIN_THRESHOLD) return 'ruin';
  if (cash <= FINANCIAL_RUIN_CRITICAL_THRESHOLD) return 'critical';
  if (cash <= FINANCIAL_RUIN_WARNING_THRESHOLD) return 'warning';
  return 'healthy';
}

export function getFinancialHealthMessage(severity: FinancialHealthSeverity, cash: number): string | null {
  switch (severity) {
    case 'warning':
      return `Your personal cash balance is negative (${cash.toLocaleString('en-US')}). Bring in income soon.`;
    case 'critical':
      return `Your personal cash balance is critically negative (${cash.toLocaleString('en-US')}). You are at serious risk of financial ruin.`;
    case 'ruin':
      return 'You are unable to meet your personal financial obligations.';
    default:
      return null;
  }
}
