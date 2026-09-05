const usdFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const usdDecimalFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

/** Formats a whole number of dollars, e.g. $1,250,000. Abbreviates large values on request: $1.25M / $4.8B */
export function formatMoney(amount: number, opts?: { abbreviate?: boolean; showSign?: boolean }): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : opts?.showSign ? '+' : '';

  if (opts?.abbreviate && abs >= 1_000_000_000) {
    const billions = abs / 1_000_000_000;
    return `${sign}$${billions.toFixed(billions >= 100 ? 0 : billions >= 10 ? 1 : 2)}B`;
  }
  if (opts?.abbreviate && abs >= 1_000_000) {
    const millions = abs / 1_000_000;
    return `${sign}$${millions.toFixed(millions >= 100 ? 0 : millions >= 10 ? 1 : 2)}M`;
  }
  if (opts?.abbreviate && abs >= 10_000) {
    const thousands = abs / 1_000;
    return `${sign}$${thousands.toFixed(thousands >= 100 ? 0 : 1)}K`;
  }

  return `${sign}$${usdFormatter.format(Math.round(abs))}`;
}

export function formatNumber(value: number): string {
  return usdFormatter.format(Math.round(value));
}

export function formatPercent(value: number, opts?: { showSign?: boolean; decimals?: number }): string {
  const decimals = opts?.decimals ?? 0;
  const sign = value > 0 && opts?.showSign ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatCompactPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatStockPrice(value: number): string {
  return `$${usdDecimalFormatter.format(value)}`;
}

/** Formats an hour-of-day (0-23) as a 12-hour clock label, e.g. 8 -> "8:00 AM". Used for business operating hours. */
export function formatHour(hour: number): string {
  const normalized = ((hour % 24) + 24) % 24;
  const period = normalized < 12 ? 'AM' : 'PM';
  const display = normalized % 12 === 0 ? 12 : normalized % 12;
  return `${display}:00 ${period}`;
}

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatWeekday(weekday: number): string {
  return WEEKDAY_NAMES[weekday] ?? '';
}

export function formatMonth(month: number): string {
  return MONTH_NAMES[(month - 1 + 12) % 12] ?? '';
}

export function formatDateLong(date: { weekday: number; day: number; month: number; year: number }): string {
  return `${formatWeekday(date.weekday)}, ${formatMonth(date.month)} ${date.day}, ${date.year}`;
}

export function formatDateShort(date: { day: number; month: number; year: number }): string {
  return `${formatMonth(date.month).slice(0, 3)} ${date.day}, ${date.year}`;
}
