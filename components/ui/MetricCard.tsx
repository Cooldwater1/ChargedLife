import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { TrendBadge } from './TrendBadge';

interface MetricCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  trend?: number;
  trendInvert?: boolean;
  caption?: string;
  accent?: 'default' | 'positive' | 'negative' | 'gold';
  className?: string;
}

const ACCENT_MAP = {
  default: 'text-cl-text-primary',
  positive: 'text-cl-positive',
  negative: 'text-cl-negative',
  gold: 'text-cl-gold',
};

export function MetricCard({ label, value, icon, trend, trendInvert, caption, accent = 'default', className }: MetricCardProps) {
  return (
    <div className={cn('cl-panel cl-panel-hover p-4', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-cl-text-secondary uppercase tracking-wide">{label}</span>
        {icon && <span className="text-cl-text-muted">{icon}</span>}
      </div>
      <div className={cn('text-2xl font-semibold tabular-nums', ACCENT_MAP[accent])}>{value}</div>
      <div className="flex items-center gap-2 mt-1.5 min-h-[16px]">
        {trend !== undefined && <TrendBadge value={trend} invertColor={trendInvert} />}
        {caption && <span className="text-xs text-cl-text-muted truncate">{caption}</span>}
      </div>
    </div>
  );
}
