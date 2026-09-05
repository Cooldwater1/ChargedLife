import { CONCEPTION_CHANCE_PER_TRY, PREGNANCY_DURATION_MAX_DAYS, PREGNANCY_DURATION_MIN_DAYS } from '@/game/constants/balance';
import { generateChildName } from '@/game/simulation/family';
import { generateId } from '@/lib/id';
import { randInt } from '@/lib/random';
import type { Pregnancy } from '@/game/types';

export function rollConception(rng: () => number, dayIndex: number): Pregnancy | null {
  if (rng() >= CONCEPTION_CHANCE_PER_TRY) return null;
  const durationDays = randInt(rng, PREGNANCY_DURATION_MIN_DAYS, PREGNANCY_DURATION_MAX_DAYS);
  return {
    id: generateId('pregnancy'),
    startedAt: dayIndex,
    estimatedDueAt: dayIndex + durationDays,
    childName: generateChildName(rng),
  };
}

export type PregnancyStage = 'first_trimester' | 'second_trimester' | 'third_trimester' | 'due_soon';

export function getPregnancyProgress(pregnancy: Pregnancy, currentDay: number): { weeks: number; totalWeeks: number; stage: PregnancyStage; daysRemaining: number } {
  const totalDays = pregnancy.estimatedDueAt - pregnancy.startedAt;
  const elapsedDays = Math.max(0, currentDay - pregnancy.startedAt);
  const weeks = Math.floor(elapsedDays / 7);
  const totalWeeks = Math.round(totalDays / 7);
  const daysRemaining = Math.max(0, pregnancy.estimatedDueAt - currentDay);

  let stage: PregnancyStage = 'first_trimester';
  if (daysRemaining <= 14) stage = 'due_soon';
  else if (weeks >= 27) stage = 'third_trimester';
  else if (weeks >= 13) stage = 'second_trimester';

  return { weeks, totalWeeks, stage, daysRemaining };
}

export const PREGNANCY_STAGE_LABELS: Record<PregnancyStage, string> = {
  first_trimester: 'First Trimester',
  second_trimester: 'Second Trimester',
  third_trimester: 'Third Trimester',
  due_soon: 'Due Soon',
};

export function isDueToday(pregnancy: Pregnancy, currentDay: number): boolean {
  return currentDay >= pregnancy.estimatedDueAt;
}
