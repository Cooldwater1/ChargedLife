import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface GameCardProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** 'warm' swaps the panel for an amber/gold-toned variant — used on Family for a lived-in feel. */
  tone?: 'default' | 'warm';
}

// Padding applied to the whole panel when there is no title/action row.
const PADDING_MAP = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

// The title row must always keep its own inset — even when padding="none" — so text
// never touches the panel's rounded corners. The body below it then only needs the
// remaining sides (no top, since the header already separates it with pb-*).
const HEADER_PADDING_MAP = {
  none: 'px-5 pt-5 pb-4',
  sm: 'px-4 pt-4 pb-3',
  md: 'px-5 pt-5 pb-4',
  lg: 'px-6 pt-6 pb-5',
};

const BODY_WITH_HEADER_PADDING_MAP = {
  none: '',
  sm: 'px-4 pb-4',
  md: 'px-5 pb-5',
  lg: 'px-6 pb-6',
};

export function GameCard({ title, subtitle, icon, action, children, className, hoverable, padding = 'md', tone = 'default' }: GameCardProps) {
  const hasHeader = Boolean(title || action);
  return (
    <div className={cn(tone === 'warm' ? 'cl-panel-warm' : 'cl-panel', hoverable && 'cl-panel-hover', !hasHeader && PADDING_MAP[padding], className)}>
      {hasHeader && (
        <div className={cn('flex items-start justify-between gap-3', HEADER_PADDING_MAP[padding])}>
          <div className="flex items-center gap-2.5">
            {icon && <span className="text-cl-text-secondary">{icon}</span>}
            <div>
              {title && <h3 className="text-sm font-semibold text-cl-text-primary tracking-wide">{title}</h3>}
              {subtitle && <p className="text-xs text-cl-text-muted mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
      )}
      {hasHeader ? <div className={BODY_WITH_HEADER_PADDING_MAP[padding]}>{children}</div> : children}
    </div>
  );
}
