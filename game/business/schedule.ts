import type { DaySchedule, WeeklySchedule } from '@/game/types';

export const WEEKDAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function createDefaultSchedule(openHour = 8, closeHour = 22): WeeklySchedule {
  return Array.from({ length: 7 }, () => ({ open: true, openHour, closeHour })) as WeeklySchedule;
}

export function formatScheduleHour(hour: number): string {
  const wholeHour = Math.floor(hour);
  const isHalf = hour % 1 !== 0;
  const period = wholeHour < 12 || wholeHour === 24 ? 'AM' : 'PM';
  const display = wholeHour % 12 === 0 ? 12 : wholeHour % 12;
  return `${display}${isHalf ? ':30' : ':00'} ${wholeHour === 24 ? 'Midnight' : period}`.replace('Midnight AM', 'Midnight');
}

export function validateDaySchedule(day: DaySchedule): DaySchedule {
  if (!day.open) return day;
  const openHour = Math.min(23.5, Math.max(0, day.openHour));
  const closeHour = Math.min(24, Math.max(openHour + 0.5, day.closeHour));
  return { ...day, openHour, closeHour };
}

export function applyWeekdayPreset(schedule: WeeklySchedule, openHour: number, closeHour: number): WeeklySchedule {
  return schedule.map((day, i) => (i >= 1 && i <= 5 ? { open: true, openHour, closeHour } : day)) as WeeklySchedule;
}

export function applyWeekendPreset(schedule: WeeklySchedule, openHour: number, closeHour: number): WeeklySchedule {
  return schedule.map((day, i) => (i === 0 || i === 6 ? { open: true, openHour, closeHour } : day)) as WeeklySchedule;
}

export function applyOpen24_7(): WeeklySchedule {
  return Array.from({ length: 7 }, () => ({ open: true, openHour: 0, closeHour: 24 })) as WeeklySchedule;
}

export function applyClosedSundays(schedule: WeeklySchedule): WeeklySchedule {
  return schedule.map((day, i) => (i === 0 ? { ...day, open: false } : day)) as WeeklySchedule;
}

export function copyDayToAllWeekdays(schedule: WeeklySchedule, sourceIndex: number): WeeklySchedule {
  const source = schedule[sourceIndex];
  return schedule.map((day, i) => (i >= 1 && i <= 5 ? { ...source } : day)) as WeeklySchedule;
}

export function copyDayToAllDays(schedule: WeeklySchedule, sourceIndex: number): WeeklySchedule {
  const source = schedule[sourceIndex];
  return schedule.map(() => ({ ...source })) as WeeklySchedule;
}

/** Estimated hours-open effect on demand, capacity utilization, and payroll — shown live in the UI before committing a change. */
export function estimateScheduleImpact(current: WeeklySchedule, proposed: WeeklySchedule): { currentWeeklyHours: number; proposedWeeklyHours: number; deltaPct: number } {
  const sum = (s: WeeklySchedule) => s.reduce((total, d) => total + (d.open ? Math.max(0, d.closeHour - d.openHour) : 0), 0);
  const currentWeeklyHours = sum(current);
  const proposedWeeklyHours = sum(proposed);
  const deltaPct = currentWeeklyHours > 0 ? Math.round(((proposedWeeklyHours - currentWeeklyHours) / currentWeeklyHours) * 100) : 0;
  return { currentWeeklyHours, proposedWeeklyHours, deltaPct };
}
