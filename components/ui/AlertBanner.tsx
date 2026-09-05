import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

type AlertTone = 'info' | 'success' | 'warning' | 'urgent';

interface AlertBannerProps {
  tone: AlertTone;
  title: string;
  message?: string;
  action?: ReactNode;
  className?: string;
}

const TONE_CONFIG: Record<AlertTone, { icon: typeof Info; classes: string }> = {
  info: { icon: Info, classes: 'border-cl-accent/25 bg-cl-accent/[0.06] text-cl-accent' },
  success: { icon: CheckCircle2, classes: 'border-cl-positive/25 bg-cl-positive/[0.06] text-cl-positive' },
  warning: { icon: AlertTriangle, classes: 'border-cl-warning/25 bg-cl-warning/[0.06] text-cl-warning' },
  urgent: { icon: XCircle, classes: 'border-cl-negative/30 bg-cl-negative/[0.08] text-cl-negative' },
};

export function AlertBanner({ tone, title, message, action, className }: AlertBannerProps) {
  const { icon: Icon, classes } = TONE_CONFIG[tone];
  return (
    <div className={cn('flex items-start gap-3 rounded-xl border px-4 py-3', classes, className)}>
      <Icon size={18} className="shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-cl-text-primary">{title}</p>
        {message && <p className="text-xs text-cl-text-secondary mt-0.5">{message}</p>}
      </div>
      {action}
    </div>
  );
}
