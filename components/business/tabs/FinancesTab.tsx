'use client';

import { useMemo, useState } from 'react';
import { Landmark, Wallet } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import type { Business, Transaction, TransactionCategory } from '@/game/types';
import { formatMoney } from '@/lib/format';
import { GameCard } from '@/components/ui/GameCard';
import { GameButton } from '@/components/ui/GameButton';
import { TrendChart, formatMoneyShort } from '@/components/ui/TrendChart';
import { FinanceBreakdown } from '@/components/business/FinanceBreakdown';
import { BudgetOverview } from '@/components/business/BudgetOverview';
import { cn } from '@/lib/cn';

const PERIODS = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
];

const CATEGORY_LABELS: Partial<Record<TransactionCategory, string>> = {
  business_revenue: 'Revenue',
  business_cogs: 'Cost of Goods Sold',
  business_payroll: 'Payroll',
  business_benefits: 'Benefits',
  business_rent: 'Rent',
  business_marketing: 'Marketing',
  business_inventory: 'Inventory',
  business_utilities: 'Utilities',
  business_training: 'Training',
  business_misc: 'Misc',
  business_upgrade: 'Upgrades',
  business_loan_payment: 'Loan Payments',
  business_owner_draw: 'Owner Draws',
  business_investment: 'Owner Investment',
  loan_disbursement: 'Loan Disbursed',
};

export function FinancesTab({ business, transactions, personalCash }: { business: Business; transactions: Transaction[]; personalCash: number }) {
  const [periodDays, setPeriodDays] = useState(30);
  const investInBusiness = useGameStore((s) => s.investInBusiness);
  const ownerDraw = useGameStore((s) => s.ownerDraw);
  const takeBusinessLoan = useGameStore((s) => s.takeBusinessLoan);
  const [investAmount, setInvestAmount] = useState('10000');
  const [loanAmount, setLoanAmount] = useState('100000');

  const chartData = useMemo(() => {
    return business.financialHistory.slice(-periodDays).map((d) => ({
      day: `D${d.dayIndex}`,
      revenue: d.revenue,
      profit: d.profit,
    }));
  }, [business.financialHistory, periodDays]);

  const breakdown = useMemo(() => {
    const relevant = transactions.filter((t) => t.source === `business:${business.id}`);
    const recent = relevant.slice(-500);
    const sums = new Map<TransactionCategory, number>();
    for (const t of recent) {
      sums.set(t.category, (sums.get(t.category) ?? 0) + t.amount);
    }
    const rows = [...sums.entries()]
      .filter(([cat]) => CATEGORY_LABELS[cat])
      .map(([cat, amount]) => ({ label: CATEGORY_LABELS[cat]!, amount }));
    const netProfit = rows.reduce((s, r) => s + r.amount, 0);
    return { rows, netProfit };
  }, [transactions, business.id]);

  return (
    <div className="space-y-6">
      <BudgetOverview business={business} transactions={transactions} />

      <GameCard
        title="Revenue & Profit History"
        action={
          <div className="flex gap-1 rounded-lg border border-cl-border-strong bg-white/[0.03] p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p.days}
                onClick={() => setPeriodDays(p.days)}
                className={cn('px-2.5 py-1 rounded-md text-xs font-medium transition-colors', periodDays === p.days ? 'bg-cl-accent-strong text-white' : 'text-cl-text-secondary')}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      >
        <TrendChart
          data={chartData}
          xKey="day"
          valueFormatter={formatMoneyShort}
          series={[
            { key: 'revenue', label: 'Revenue', color: 'var(--cl-accent)' },
            { key: 'profit', label: 'Profit', color: 'var(--cl-positive)' },
          ]}
        />
      </GameCard>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GameCard title="Financial Statement" subtitle="All-time totals by category">
          <FinanceBreakdown rows={breakdown.rows} operatingProfit={breakdown.netProfit} />
        </GameCard>

        <div className="space-y-6">
          <GameCard title="Owner Transactions" icon={<Wallet size={16} />}>
            <p className="text-xs text-cl-text-secondary mb-3">Move money between your personal cash and this business.</p>
            <div className="flex items-center gap-2 mb-3">
              <input
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                className="w-full rounded-md bg-white/[0.05] border border-cl-border-strong px-3 py-1.5 text-sm text-cl-text-primary"
              />
              <GameButton
                size="sm"
                variant="secondary"
                disabledReason={personalCash < Number(investAmount) ? 'Not enough personal cash' : undefined}
                onClick={() => investInBusiness(business.id, Number(investAmount))}
              >
                Invest
              </GameButton>
              <GameButton
                size="sm"
                variant="secondary"
                disabledReason={business.cash < Number(investAmount) ? 'Not enough business cash' : undefined}
                onClick={() => ownerDraw(business.id, Number(investAmount))}
              >
                Draw
              </GameButton>
            </div>
            <p className="text-xs text-cl-text-muted">Personal cash: {formatMoney(personalCash)}</p>
          </GameCard>

          <GameCard title="Business Loans" icon={<Landmark size={16} />}>
            {business.loans.length > 0 && (
              <div className="space-y-2 mb-4">
                {business.loans.map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between text-sm">
                    <span className="text-cl-text-secondary">{formatMoney(loan.remainingBalance)} remaining</span>
                    <span className="text-cl-text-muted text-xs">{formatMoney(loan.monthlyPayment)}/mo · {loan.monthsRemaining} left</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full rounded-md bg-white/[0.05] border border-cl-border-strong px-3 py-1.5 text-sm text-cl-text-primary"
              />
              <GameButton size="sm" onClick={() => takeBusinessLoan(business.id, Number(loanAmount), 36)}>Take Loan</GameButton>
            </div>
            <p className="text-xs text-cl-text-muted mt-2">36-month term at 9% annual interest.</p>
          </GameCard>
        </div>
      </div>
    </div>
  );
}
