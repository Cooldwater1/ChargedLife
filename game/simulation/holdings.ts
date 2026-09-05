import { calculateBusinessValuation } from '@/game/simulation/economy';
import type { Business, HoldingCompany } from '@/game/types';

export interface HoldingFinancials {
  portfolioValue: number;
  cash: number;
  monthlyRevenue: number;
  monthlyProfit: number;
}

export function calculateHoldingFinancials(holding: HoldingCompany, businesses: Business[]): HoldingFinancials {
  const subsidiaries = businesses.filter((b) => holding.subsidiaryBusinessIds.includes(b.id));

  const portfolioValue = subsidiaries.reduce((sum, b) => sum + calculateBusinessValuation(b) * (b.ownershipPct / 100), 0);

  const monthlyRevenue = subsidiaries.reduce((sum, b) => {
    const last30 = b.financialHistory.slice(-30);
    return sum + last30.reduce((s, d) => s + d.revenue, 0) * (b.ownershipPct / 100);
  }, 0);
  const monthlyProfit = subsidiaries.reduce((sum, b) => {
    const last30 = b.financialHistory.slice(-30);
    return sum + last30.reduce((s, d) => s + d.profit, 0) * (b.ownershipPct / 100);
  }, 0);

  return {
    portfolioValue: Math.round(portfolioValue),
    cash: holding.cash,
    monthlyRevenue: Math.round(monthlyRevenue),
    monthlyProfit: Math.round(monthlyProfit),
  };
}
