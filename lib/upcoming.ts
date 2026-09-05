import type { CalendarDate } from '@/game/types';

export function daysUntilNextWeekday(date: CalendarDate, targetWeekday: number): number {
  const diff = (targetWeekday - date.weekday + 7) % 7;
  return diff === 0 ? 7 : diff;
}

export function daysUntilNextMonthStart(date: CalendarDate): number {
  const daysInThisMonth = new Date(Date.UTC(date.year, date.month, 0)).getUTCDate();
  return daysInThisMonth - date.day + 1;
}
