import { cn } from '@/lib/cn';
import { clamp } from '@/lib/random';

interface ProgressBarProps {
  value: number; // 0-100
  tone?: 'accent' | 'positive' | 'warning' | 'negative' | 'gold';
  className?: string;
  label?: string;
  showValue?: boolean;
}

const TONE_MAP = {
  accent: 'bg-cl-accent',
  positive: 'bg-cl-positive',
  warning: 'bg-cl-warning',
  negative: 'bg-cl-negative',
  gold: 'bg-cl-gold',
};

export function ProgressBar({ value, tone = 'accent', className, label, showValue }: ProgressBarProps) {
  const pct = clamp(value, 0, 100);
  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs text-cl-text-secondary">{label}</span>}
          {showValue && <span className="text-xs font-medium text-cl-text-primary tabular-nums">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500 ease-out', TONE_MAP[tone])} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
