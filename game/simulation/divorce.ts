import { DIVORCE_CHILD_SUPPORT_PCT_OF_INCOME, PRENUP_ASSET_PROTECTION_PCT } from '@/game/constants/balance';
import { calculatePortfolioValue } from '@/game/simulation/investments';
import { JOB_DEFINITIONS } from '@/game/constants/data';
import type { DivorceSettlement, GameState } from '@/game/types';

export function calculateDivorceSettlement(state: GameState): DivorceSettlement {
  const { player } = state;
  const marriageLengthDays = player.relationship.marriedAt !== null ? state.time.dayIndex - player.relationship.marriedAt : 0;

  const propertyEquity = player.properties.reduce((s, p) => s + (p.currentValue - p.mortgageBalance), 0);
  const portfolioValue = calculatePortfolioValue(player.investments, state.market);

  const prenup = player.relationship.prenup ?? 'none';
  const protectedPct = PRENUP_ASSET_PROTECTION_PCT[prenup];

  const sharedPropertyValue = Math.round(propertyEquity * (1 - protectedPct));
  const sharedInvestmentValue = Math.round(portfolioValue * (1 - protectedPct));
  const estimatedAssetTransfer = Math.round((sharedPropertyValue + sharedInvestmentValue) * 0.5);

  const job = JOB_DEFINITIONS.find((j) => j.id === player.career.jobId);
  const annualIncome = job ? job.annualSalary + player.career.salaryOverride : 0;
  const childrenCount = player.family.filter((f) => f.role === 'child' && !f.deceased).length;
  const monthlyChildSupport = childrenCount > 0 ? Math.round((annualIncome / 12) * DIVORCE_CHILD_SUPPORT_PCT_OF_INCOME * childrenCount) : 0;

  const primaryHomeToPartner = player.properties.some((p) => p.use === 'primary');

  return {
    marriageLengthDays,
    sharedPropertyValue,
    sharedInvestmentValue,
    estimatedAssetTransfer,
    monthlyChildSupport,
    primaryHomeToPartner,
  };
}
