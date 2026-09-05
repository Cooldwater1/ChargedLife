import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface GameButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  disabledReason?: string;
  fullWidth?: boolean;
}

const VARIANT_MAP = {
  primary: 'bg-cl-accent-strong text-white hover:bg-cl-accent shadow-[0_0_0_1px_rgba(56,189,248,0.3)] hover:shadow-[0_0_20px_-2px_var(--cl-accent-glow)]',
  secondary: 'bg-white/[0.06] text-cl-text-primary border border-cl-border-strong hover:bg-white/[0.1]',
  danger: 'bg-cl-negative-strong/90 text-white hover:bg-cl-negative-strong',
  ghost: 'bg-transparent text-cl-text-secondary hover:text-cl-text-primary hover:bg-white/[0.05]',
  gold: 'bg-cl-gold-strong text-black font-semibold hover:bg-cl-gold',
};

const SIZE_MAP = {
  sm: 'text-xs px-2.5 py-1.5 rounded-md gap-1.5',
  md: 'text-sm px-4 py-2 rounded-lg gap-2',
  lg: 'text-base px-5 py-2.5 rounded-lg gap-2',
};

export function GameButton({
  variant = 'primary',
  size = 'md',
  icon,
  disabledReason,
  fullWidth,
  disabled,
  className,
  children,
  title,
  ...props
}: GameButtonProps) {
  const isDisabled = disabled || !!disabledReason;
  return (
    <button
      disabled={isDisabled}
      title={isDisabled ? disabledReason ?? title : title}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98]',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:shadow-none',
        VARIANT_MAP[variant],
        SIZE_MAP[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
