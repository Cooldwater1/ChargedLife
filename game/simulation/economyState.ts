import { ECONOMY_MIN_DAYS_IN_CONDITION, ECONOMY_SHIFT_CHANCE_PER_DAY } from '@/game/constants/balance';
import { clamp, pickOne, randRange } from '@/lib/random';
import type { EconomicCondition, EconomyState } from '@/game/types';

const CONDITIONS: EconomicCondition[] = ['recession', 'slow_growth', 'normal', 'strong_growth', 'boom'];

export function createInitialEconomy(): EconomyState {
  return {
    condition: 'normal',
    interestRate: 0.052,
    unemploymentRate: 0.042,
    propertyMarketTrend: {},
    daysInCondition: 0,
  };
}

/** Economic conditions persist for a while, then occasionally drift to a neighboring state — no whiplash. */
export function driftEconomyDaily(economy: EconomyState, rng: () => number): EconomyState {
  const daysInCondition = economy.daysInCondition + 1;
  let condition = economy.condition;

  if (daysInCondition >= ECONOMY_MIN_DAYS_IN_CONDITION && rng() < ECONOMY_SHIFT_CHANCE_PER_DAY) {
    const currentIndex = CONDITIONS.indexOf(economy.condition);
    const step = rng() < 0.5 ? -1 : 1;
    const nextIndex = clamp(currentIndex + step, 0, CONDITIONS.length - 1);
    condition = CONDITIONS[nextIndex];
  }

  const conditionChanged = condition !== economy.condition;
  const targetRate = condition === 'recession' ? 0.03
    : condition === 'slow_growth' ? 0.045
    : condition === 'normal' ? 0.052
    : condition === 'strong_growth' ? 0.06
    : 0.07;
  const interestRate = clamp(economy.interestRate + (targetRate - economy.interestRate) * 0.05 + randRange(rng, -0.0008, 0.0008), 0.02, 0.09);

  const targetUnemployment = condition === 'recession' ? 0.075
    : condition === 'slow_growth' ? 0.055
    : condition === 'normal' ? 0.042
    : condition === 'strong_growth' ? 0.036
    : 0.03;
  const unemploymentRate = clamp(economy.unemploymentRate + (targetUnemployment - economy.unemploymentRate) * 0.05, 0.02, 0.12);

  return {
    condition,
    interestRate,
    unemploymentRate,
    propertyMarketTrend: economy.propertyMarketTrend,
    daysInCondition: conditionChanged ? 0 : daysInCondition,
  };
}

export function getPropertyMarketTrend(economy: EconomyState, city: string): 'declining' | 'stable' | 'growing' | 'booming' {
  const existing = economy.propertyMarketTrend[city];
  if (existing) return existing;
  return economy.condition === 'recession' ? 'declining'
    : economy.condition === 'boom' ? 'booming'
    : economy.condition === 'strong_growth' ? 'growing'
    : 'stable';
}

export const ECONOMY_CONDITION_LABELS: Record<EconomicCondition, string> = {
  recession: 'Recession',
  slow_growth: 'Slow Growth',
  normal: 'Normal',
  strong_growth: 'Strong Growth',
  boom: 'Boom',
};

// Re-exported for callers that only need to pick a random condition (dev tools).
export function pickRandomCondition(rng: () => number): EconomicCondition {
  return pickOne(rng, CONDITIONS);
}
