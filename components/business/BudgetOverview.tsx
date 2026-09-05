'use client';

import { useMemo, useState } from 'react';
import { PieChart } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { toCalendarDate } from '@/game/time/calendar';
import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/cn';
import { GameCard } from '@/components/ui/GameCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { Business, BusinessBudgetLimits, Transaction, TransactionCategory } from '@/game/types';

const EXPENSE_BUCKETS: { label: string; categories: TransactionCategory[] }[] = [
  { label: 'Payroll', categories: ['business_payroll'] },
  { label: 'Benefits', categories: ['business_benefits'] },
  { label: 'Inventory', categories: ['business_inventory'] },
  { label: 'Cost of Goods Sold', categories: ['business_cogs'] },
  { label: 'Marketing', categories: ['business_marketing'] },
  { label: 'Rent & HQ', categories: ['business_rent'] },
  { label: 'Utilities', categories: ['business_utilities'] },
  { label: 'Training', categories: ['business_training'] },
  { label: 'Loan Payments', categories: ['business_loan_payment'] },
  { label: 'Upgrades & Capital', categories: ['business_upgrade'] },
  { label: 'Owner Draws', categories: ['business_owner_draw'] },
  { label: 'Other', categories: ['business_misc'] },
];

const DEPARTMENTS: { key: keyof BusinessBudgetLimits; label: string; categories: TransactionCategory[] }[] = [
  { key: 'marketing', label: 'Marketing', categories: ['business_marketing'] },
  { key: 'inventory', label: 'Inventory', categories: ['business_inventory'] },
  { key: 'training', label: 'Training', categories: ['business_training'] },
];

export function BudgetOverview({ business, transactions }: { business: Business; transactions: Transaction[] }) {
  const setBudgetLimit = useGameStore((s) => s.setBudgetLimit);
  const dayIndex = useGameStore((s) => s.game?.time.dayIndex ?? 0);
  const [limitDrafts, setLimitDrafts] = useState<Record<string, string>>({});

  const businessTransactions = useMemo(
    () => transactions.filter((t) => t.source === `business:${business.id}`),
    [transactions, business.id],
  );

  const today = toCalendarDate(dayIndex);
  const monthToDateTransactions = useMemo(
    () => businessTransactions.filter((t) => {
      const d = toCalendarDate(t.timestamp);
      return d.year === today.year && d.month === today.month;
    }),
    [businessTransactions, today.year, today.month],
  );

  const latestDay = business.financialHistory[business.financialHistory.length - 1];
  const last7 = business.financialHistory.slice(-7);
  const avgDailyRevenue = last7.length > 0 ? last7.reduce((s, d) => s + d.revenue, 0) / last7.length : 0;
  const avgDailyExpenses = last7.length > 0 ? last7.reduce((s, d) => s + d.expenses, 0) / last7.length : 0;

  const recent30 = businessTransactions.filter((t) => t.timestamp > dayIndex - 30 && t.amount < 0);
  const totalExpenses30d = recent30.reduce((s, t) => s + Math.abs(t.amount), 0);
  const bucketRows = EXPENSE_BUCKETS
    .map((bucket) => {
      const amount = recent30.filter((t) => bucket.categories.includes(t.category)).reduce((s, t) => s + Math.abs(t.amount), 0);
      return { label: bucket.label, amount, pct: totalExpenses30d > 0 ? (amount / totalExpenses30d) * 100 : 0 };
    })
    .filter((r) => r.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <GameCard title="Budget" subtitle="Cash flow, expense breakdown, and department spend limits" icon={<PieChart size={16} />}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <MetricCard label="Business Cash" value={formatMoney(business.cash, { abbreviate: true })} accent="gold" />
        <MetricCard label="Daily Revenue" value={formatMoney(latestDay?.revenue ?? 0)} />
        <MetricCard label="Daily Expenses" value={formatMoney(latestDay?.expenses ?? 0)} accent="negative" />
        <MetricCard label="Daily Profit" value={formatMoney(latestDay?.profit ?? 0)} accent={(latestDay?.profit ?? 0) >= 0 ? 'positive' : 'negative'} />
      </div>

      <p className="text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Monthly Forecast (based on last 7 days)</p>
      <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
        <div><p className="text-xs text-cl-text-muted mb-0.5">Revenue</p><p className="text-cl-text-primary font-semibold">{formatMoney(avgDailyRevenue * 30)}</p></div>
        <div><p className="text-xs text-cl-text-muted mb-0.5">Expenses</p><p className="text-cl-text-primary font-semibold">{formatMoney(avgDailyExpenses * 30)}</p></div>
        <div>
          <p className="text-xs text-cl-text-muted mb-0.5">Profit</p>
          <p className={cn('font-semibold', avgDailyRevenue - avgDailyExpenses >= 0 ? 'text-cl-positive' : 'text-cl-negative')}>
            {formatMoney((avgDailyRevenue - avgDailyExpenses) * 30)}
          </p>
        </div>
      </div>

      <p className="text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Expense Breakdown (last 30 days)</p>
      {bucketRows.length === 0 ? (
        <p className="text-sm text-cl-text-muted mb-6">No expenses recorded yet.</p>
      ) : (
        <div className="space-y-2 mb-6">
          {bucketRows.map((row) => (
            <div key={row.label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-cl-text-secondary">{row.label}</span>
                <span className="text-cl-text-muted">{formatMoney(row.amount)} · {row.pct.toFixed(1)}%</span>
              </div>
              <ProgressBar value={row.pct} tone="accent" />
            </div>
          ))}
        </div>
      )}

      <p className="text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Department Budget Limits</p>
      <p className="text-xs text-cl-text-muted mb-3">Optional monthly ceilings — these warn, they never block a purchase.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {DEPARTMENTS.map((dept) => {
          const limit = business.budgetLimits[dept.key];
          const spent = monthToDateTransactions.filter((t) => dept.categories.includes(t.category) && t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
          const pct = limit && limit > 0 ? (spent / limit) * 100 : 0;
          const draftKey = dept.key;
          const draftValue = limitDrafts[draftKey] ?? (limit ?? '');
          return (
            <div key={dept.key} className="cl-panel p-3">
              <p className="text-sm font-medium text-cl-text-primary mb-1">{dept.label}</p>
              <p className="text-xs text-cl-text-muted mb-2">Spent this month: {formatMoney(spent)}{limit ? ` / ${formatMoney(limit)}` : ' (no limit set)'}</p>
              {limit != null && <ProgressBar value={Math.min(100, pct)} tone={pct >= 100 ? 'negative' : pct >= 90 ? 'warning' : 'positive'} className="mb-2" />}
              {limit != null && pct >= 100 && <p className="text-[11px] text-cl-negative mb-2">Over budget this month.</p>}
              <div className="flex items-center gap-2">
                <input
                  value={draftValue}
                  onChange={(e) => setLimitDrafts((prev) => ({ ...prev, [draftKey]: e.target.value }))}
                  placeholder="No limit"
                  className="w-full rounded-md bg-white/[0.05] border border-cl-border-strong px-2 py-1 text-xs text-cl-text-primary"
                />
                <button
                  onClick={() => {
                    const raw = limitDrafts[draftKey];
                    const parsed = raw === undefined || raw === '' ? null : Math.max(0, Number(raw));
                    setBudgetLimit(business.id, dept.key, parsed);
                  }}
                  className="text-xs text-cl-accent font-medium shrink-0"
                >
                  Set
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </GameCard>
  );
}
