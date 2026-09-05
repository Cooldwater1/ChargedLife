import { cn } from '@/lib/cn';

type StatusTone = 'info' | 'success' | 'warning' | 'danger' | 'gold' | 'neutral';

interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
  className?: string;
}

const TONE_MAP: Record<StatusTone, string> = {
  info: 'bg-cl-accent/10 text-cl-accent border-cl-accent/25',
  success: 'bg-cl-positive/10 text-cl-positive border-cl-positive/25',
  warning: 'bg-cl-warning/10 text-cl-warning border-cl-warning/25',
  danger: 'bg-cl-negative/10 text-cl-negative border-cl-negative/25',
  gold: 'bg-cl-gold/10 text-cl-gold border-cl-gold/25',
  neutral: 'bg-white/[0.05] text-cl-text-secondary border-cl-border-strong',
};

export function StatusBadge({ label, tone = 'neutral', className }: StatusBadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', TONE_MAP[tone], className)}>
      {label}
    </span>
  );
}
