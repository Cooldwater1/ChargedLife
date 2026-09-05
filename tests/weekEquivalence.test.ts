import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createInitialGameState } from '@/game/state/initialState';
import type { GameState } from '@/game/types';

/**
 * Next Week must simulate 7 individual days through the exact same per-day pipeline as
 * Next Day — never a shortcut that skips processing. We verify this by resetting the
 * seeded-RNG module between two runs (7x advanceDay vs 1x advanceWeek) starting from an
 * identical cloned state, so both runs draw the identical sequence of random numbers.
 * If Next Week ever diverges from 7 individual days, this test will catch it.
 */
describe('Next Week produces the same result as 7x Next Day', () => {
  let baseState: GameState;

  beforeEach(() => {
    baseState = createInitialGameState('Equivalence Tester');
    baseState.player.cash = 15_000;
    baseState.player.career.jobId = 'retail_associate'; // gives the day loop a real weekly-salary path to exercise
    baseState.player.career.hiredAt = 0;
  });

  it('reaches the same day, cash, and transaction count whether advanced one day at a time or as a single week', async () => {
    const stateForDaily = structuredClone(baseState);
    const stateForWeekly = structuredClone(baseState);

    vi.resetModules();
    const dailyEngine = await import('@/game/time/timeEngine');
    let dailyState = stateForDaily;
    let dailyIncome = 0;
    let dailyExpenses = 0;
    for (let i = 0; i < 7; i++) {
      const result = dailyEngine.advanceDay(dailyState);
      dailyState = result.state;
      dailyIncome += result.summary.income;
      dailyExpenses += result.summary.expenses;
    }

    vi.resetModules();
    const weeklyEngine = await import('@/game/time/timeEngine');
    const weeklyResult = weeklyEngine.advanceWeek(stateForWeekly);

    expect(weeklyResult.summary.daysSimulated).toBe(7);
    expect(weeklyResult.summary.stoppedEarly).toBe(false);
    expect(weeklyResult.state.time.dayIndex).toBe(dailyState.time.dayIndex);
    expect(weeklyResult.state.player.statistics.daysPlayed).toBe(dailyState.player.statistics.daysPlayed);
    expect(weeklyResult.state.transactions.length).toBe(dailyState.transactions.length);
    expect(weeklyResult.state.player.cash).toBeCloseTo(dailyState.player.cash, 6);
    expect(weeklyResult.summary.income).toBeCloseTo(dailyIncome, 6);
    expect(weeklyResult.summary.expenses).toBeCloseTo(dailyExpenses, 6);
  });

  it('advances the day index by exactly 7 with no day silently skipped', async () => {
    vi.resetModules();
    const { advanceWeek } = await import('@/game/time/timeEngine');
    const startDay = baseState.time.dayIndex;
    const result = advanceWeek(structuredClone(baseState));
    expect(result.state.time.dayIndex - startDay).toBe(7);
    expect(result.state.player.statistics.daysPlayed).toBe(7);
  });
});
