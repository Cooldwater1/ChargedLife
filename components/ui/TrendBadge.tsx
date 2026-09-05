import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { cn } from '@/lib/cn';

interface TrendBadgeProps {
  value: number; // percentage change, e.g. 4.2 or -3.1
  suffix?: string;
  invertColor?: boolean; // for metrics where "up" is bad (e.g. wait times)
  className?: string;
}

export function TrendBadge({ value, suffix = '%', invertColor = false, className }: TrendBadgeProps) {
  const isFlat = Math.abs(value) < 0.05;
  const isPositive = value > 0;
  const goodDirection = invertColor ? !isPositive : isPositive;

  const colorClass = isFlat ? 'text-cl-text-muted' : goodDirection ? 'text-cl-positive' : 'text-cl-negative';
  const Icon = isFlat ? Minus : isPositive ? ArrowUp : ArrowDown;

  return (
    <span className={cn('inline-flex items-center gap-0.5 text-xs font-medium', colorClass, className)}>
      <Icon size={12} strokeWidth={2.5} />
      {Math.abs(value).toFixed(1)}
      {suffix}
    </span>
  );
}
