import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/cn';

interface MoneyDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  colorize?: boolean;
  showSign?: boolean;
  abbreviate?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-2xl font-semibold',
  xl: 'text-4xl font-bold tracking-tight',
};

export function MoneyDisplay({ amount, size = 'md', colorize = false, showSign = false, abbreviate = false, className }: MoneyDisplayProps) {
  const colorClass = colorize ? (amount > 0 ? 'text-cl-positive' : amount < 0 ? 'text-cl-negative' : 'text-cl-text-primary') : '';
  return (
    <span className={cn(SIZE_MAP[size], colorClass, 'font-mono tabular-nums', className)}>
      {formatMoney(amount, { showSign, abbreviate })}
    </span>
  );
}
