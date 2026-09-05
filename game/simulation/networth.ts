import { calculateBusinessValuation } from '@/game/simulation/economy';
import { calculatePortfolioValue } from '@/game/simulation/investments';
import type { GameState } from '@/game/types';

/** Player equity in each business, respecting partial ownership from acquisitions. Holding-company cash is
 * added once as its own pool (a subsidiary's own cash is already inside its own valuation, so this never
 * double-counts — the holding's treasury is separate money from what its subsidiaries hold operationally). */
export function calculateNetWorth(state: GameState): number {
  const businessValue = state.businesses.reduce((sum, b) => sum + calculateBusinessValuation(b) * (b.ownershipPct / 100), 0);
  const holdingCash = state.player.holdingCompanies.reduce((sum, h) => sum + h.cash, 0);
  const propertyEquity = state.player.properties.reduce((sum, p) => sum + (p.currentValue - p.mortgageBalance), 0);
  const vehicleValue = state.player.vehicles.reduce((sum, v) => sum + v.currentValue, 0);
  const boatValue = state.player.boats.reduce((sum, b) => sum + b.currentValue, 0);
  const aircraftValue = state.player.aircraft.reduce((sum, a) => sum + a.currentValue, 0);
  const luxuryValue = state.player.luxuryItems.reduce((sum, l) => sum + l.currentValue, 0);
  const portfolioValue = calculatePortfolioValue(state.player.investments, state.market);
  const personalDebt = state.player.bank.loans.reduce((sum, l) => sum + l.remainingBalance, 0);

  return Math.round(
    state.player.cash +
      state.player.bank.savingsBalance +
      businessValue +
      holdingCash +
      propertyEquity +
      vehicleValue +
      boatValue +
      aircraftValue +
      luxuryValue +
      portfolioValue -
      personalDebt,
  );
}

export function calculateTotalDebt(state: GameState): number {
  const personalDebt = state.player.bank.loans.reduce((sum, l) => sum + l.remainingBalance, 0);
  const businessDebt = state.businesses.reduce((sum, b) => sum + b.loans.reduce((s, l) => s + l.remainingBalance, 0), 0);
  const mortgageDebt = state.player.properties.reduce((sum, p) => sum + p.mortgageBalance, 0);
  return Math.round(personalDebt + businessDebt + mortgageDebt);
}

export function calculateBusinessWeeklyProfit(state: GameState): number {
  return state.businesses.reduce((sum, b) => {
    const recent = b.financialHistory.slice(-7);
    return sum + recent.reduce((s, d) => s + d.profit, 0);
  }, 0);
}

export function calculateCollectionValue(state: GameState): number {
  const vehicleValue = state.player.vehicles.reduce((sum, v) => sum + v.currentValue, 0);
  const boatValue = state.player.boats.reduce((sum, b) => sum + b.currentValue, 0);
  const aircraftValue = state.player.aircraft.reduce((sum, a) => sum + a.currentValue, 0);
  const luxuryValue = state.player.luxuryItems.reduce((sum, l) => sum + l.currentValue, 0);
  return Math.round(vehicleValue + boatValue + aircraftValue + luxuryValue);
}
