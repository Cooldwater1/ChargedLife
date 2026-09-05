import { getLifestyleTier } from '@/game/constants/lifestyle';
import { clamp } from '@/lib/random';
import type { LifestyleState, Wellbeing } from '@/game/types';

function activeTierIds(lifestyle: LifestyleState): string[] {
  const singles = [lifestyle.fitness, lifestyle.phone, lifestyle.food].filter((id): id is string => id !== null);
  return [...singles, ...lifestyle.entertainment, ...lifestyle.services];
}

export function calculateLifestyleMonthlyCost(lifestyle: LifestyleState): number {
  return activeTierIds(lifestyle).reduce((sum, id) => sum + (getLifestyleTier(id)?.monthlyCost ?? 0), 0);
}

export interface LifestyleEffectTotals {
  health: number;
  happiness: number;
  status: number;
}

export function calculateLifestyleEffects(lifestyle: LifestyleState): LifestyleEffectTotals {
  return activeTierIds(lifestyle).reduce(
    (totals, id) => {
      const tier = getLifestyleTier(id);
      if (!tier) return totals;
      return { health: totals.health + tier.healthEffect, happiness: totals.happiness + tier.happinessEffect, status: totals.status + tier.statusEffect };
    },
    { health: 0, happiness: 0, status: 0 },
  );
}

const WELLBEING_BASELINE = 55;
const WELLBEING_DAILY_DRIFT = 0.6; // how fast health/happiness nudge toward their lifestyle-driven target each day

/** Health/happiness drift gradually toward a lifestyle-driven target rather than snapping instantly — quitting the gym doesn't erase your health overnight. */
export function driftWellbeingDaily(wellbeing: Wellbeing, lifestyle: LifestyleState): Wellbeing {
  const effects = calculateLifestyleEffects(lifestyle);
  const targetHealth = clamp(WELLBEING_BASELINE + effects.health, 0, 100);
  const targetHappiness = clamp(WELLBEING_BASELINE + effects.happiness, 0, 100);

  return {
    health: clamp(wellbeing.health + clamp(targetHealth - wellbeing.health, -WELLBEING_DAILY_DRIFT, WELLBEING_DAILY_DRIFT), 0, 100),
    happiness: clamp(wellbeing.happiness + clamp(targetHappiness - wellbeing.happiness, -WELLBEING_DAILY_DRIFT, WELLBEING_DAILY_DRIFT), 0, 100),
  };
}
