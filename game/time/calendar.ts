import { EPOCH_MS, MS_PER_DAY } from '@/game/constants/balance';
import type { CalendarDate } from '@/game/types';

/**
 * Converts a whole-day index (since EPOCH_MS) into a real proleptic-Gregorian
 * calendar date using UTC math, so the calendar is always correct (leap years,
 * month lengths, weekdays) without any timezone/DST drift.
 */
export function toCalendarDate(dayIndex: number): CalendarDate {
  const ms = EPOCH_MS + dayIndex * MS_PER_DAY;
  const d = new Date(ms);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    weekday: d.getUTCDay(),
    dayIndex,
  };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}
