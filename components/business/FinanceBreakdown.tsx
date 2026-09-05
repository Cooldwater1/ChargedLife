import { formatMoney } from '@/lib/format';

interface FinanceBreakdownProps {
  rows: { label: string; amount: number }[];
  operatingProfit: number;
}

export function FinanceBreakdown({ rows, operatingProfit }: FinanceBreakdownProps) {
  return (
    <div className="space-y-1">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between py-2 border-b border-cl-border last:border-0">
          <span className="text-sm text-cl-text-secondary">{row.label}</span>
          <span className={row.amount >= 0 ? 'text-sm font-medium text-cl-positive' : 'text-sm font-medium text-cl-negative'}>
            {row.amount >= 0 ? '+' : ''}{formatMoney(row.amount)}
          </span>
        </div>
      ))}
      <div className="flex items-center justify-between pt-3 mt-2 border-t-2 border-cl-border-strong">
        <span className="text-sm font-semibold text-cl-text-primary">Net Profit</span>
        <span className={operatingProfit >= 0 ? 'text-base font-bold text-cl-positive' : 'text-base font-bold text-cl-negative'}>
          {formatMoney(operatingProfit, { showSign: true })}
        </span>
      </div>
    </div>
  );
}
