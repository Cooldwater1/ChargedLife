'use client';

import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, Clock, CreditCard, Landmark, PiggyBank, Receipt, Wallet } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { calculateTotalDebt } from '@/game/simulation/networth';
import { calculateDailyCostBreakdown, calculateFinancialRunway } from '@/game/simulation/dailyCosts';
import { ECONOMY_CONDITION_LABELS } from '@/game/simulation/economyState';
import { SUBSCRIPTION_CATALOG } from '@/game/constants/subscriptions';
import { toCalendarDate, daysInMonth } from '@/game/time/calendar';
import type { LoanKind } from '@/game/types';
import { formatMoney, formatPercent } from '@/lib/format';
import { cn } from '@/lib/cn';
import { GameCard } from '@/components/ui/GameCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { GameButton } from '@/components/ui/GameButton';
import { TrendChart, formatMoneyShort } from '@/components/ui/TrendChart';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { TransactionLedger } from '@/components/bank/TransactionLedger';
import { HelpTip } from '@/components/ui/HelpTip';

const LOAN_KIND_LABELS: Record<LoanKind, string> = {
  personal: 'Personal Loan', auto: 'Auto Loan', mortgage: 'Mortgage', business: 'Business Loan',
  boat: 'Boat Loan', aircraft: 'Aircraft Financing', student: 'Student Loan',
};

const LOAN_KIND_OPTIONS: LoanKind[] = ['personal', 'auto'];

const TABS = ['Overview', 'Accounts', 'Transactions', 'Loans', 'Recurring Costs'] as const;
type Tab = (typeof TABS)[number];

export default function BankPage() {
  const game = useGameStore((s) => s.game);
  const depositSavings = useGameStore((s) => s.depositSavings);
  const withdrawSavings = useGameStore((s) => s.withdrawSavings);
  const submitLoanApplication = useGameStore((s) => s.submitLoanApplication);
  const acceptCounterOffer = useGameStore((s) => s.acceptCounterOffer);
  const declineLoanApplication = useGameStore((s) => s.declineLoanApplication);
  const toggleSubscription = useGameStore((s) => s.toggleSubscription);
  const addSubscription = useGameStore((s) => s.addSubscription);
  const cancelSubscription = useGameStore((s) => s.cancelSubscription);

  const [tab, setTab] = useState<Tab>('Overview');
  const [transferAmount, setTransferAmount] = useState('5000');
  const [loanAmount, setLoanAmount] = useState('50000');
  const [loanKind, setLoanKind] = useState<LoanKind>('personal');

  const derived = useMemo(() => {
    if (!game) return null;
    const totalDebt = calculateTotalDebt(game);
    const personalTx = game.transactions.filter((t) => t.source === 'personal');
    const dayBuckets = new Map<number, number>();
    for (const t of personalTx) {
      dayBuckets.set(t.timestamp, (dayBuckets.get(t.timestamp) ?? 0) + t.amount);
    }
    let running = 0;
    const sortedDays = [...dayBuckets.entries()].sort((a, b) => a[0] - b[0]);
    const balanceHistory = sortedDays.slice(-30).map(([dayIndex, delta]) => {
      running += delta;
      return { day: `D${dayIndex}`, balance: running };
    });
    const costBreakdown = calculateDailyCostBreakdown(game);
    const runway = calculateFinancialRunway(game);
    return { totalDebt, balanceHistory, costBreakdown, runway };
  }, [game]);

  if (!game || !derived) return null;

  const netCashFlow = game.transactions.filter((t) => game.time.dayIndex - t.timestamp <= 7).reduce((s, t) => s + t.amount, 0);
  const creditTone = game.player.bank.creditScore >= 720 ? 'positive' : game.player.bank.creditScore >= 600 ? 'gold' : 'negative';
  const pendingApps = game.player.loanApplications.filter((a) => a.status === 'under_review');
  const decidedApps = [...game.player.loanApplications.filter((a) => a.status !== 'under_review')].sort((a, b) => b.submittedAt - a.submittedAt).slice(0, 6);
  const activeSubscriptionIds = new Set(game.player.subscriptions.map((s) => s.name));
  const availableToAdd = SUBSCRIPTION_CATALOG.filter((c) => !activeSubscriptionIds.has(c.name));
  const activeSubscriptions = game.player.subscriptions.filter((s) => s.active);

  const today = toCalendarDate(game.time.dayIndex);
  const daysUntilNextMonth = daysInMonth(today.year, today.month) - today.day + 1;
  const recentTransactions = [...game.transactions].filter((t) => t.source === 'personal').sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);
  const upcomingPayments = [
    ...game.player.bank.loans.map((l) => ({ label: `${LOAN_KIND_LABELS[l.kind]} payment`, amount: l.monthlyPayment, daysUntil: daysUntilNextMonth })),
    ...(activeSubscriptions.length > 0 ? [{ label: `${activeSubscriptions.length} subscription${activeSubscriptions.length === 1 ? '' : 's'}`, amount: activeSubscriptions.reduce((s, sub) => s + sub.monthlyCost, 0), daysUntil: daysUntilNextMonth }] : []),
  ].sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <div className="space-y-6 cl-animate-in">
      <div>
        <h1 className="text-2xl font-bold text-cl-text-primary tracking-tight">Bank</h1>
        <p className="text-sm text-cl-text-secondary mt-1">Manage your cash, savings, loans, and everyday costs.</p>
      </div>

      <div className="flex gap-1 border-b border-cl-border overflow-x-auto overflow-y-hidden cl-scrollbar-thin">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
              tab === t ? 'border-cl-accent text-cl-accent' : 'border-transparent text-cl-text-secondary hover:text-cl-text-primary',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Available Cash" value={<MoneyDisplay amount={game.player.cash} size="lg" />} icon={<Wallet size={16} />} />
            <MetricCard label="Savings" value={<MoneyDisplay amount={game.player.bank.savingsBalance} size="lg" />} icon={<PiggyBank size={16} />} />
            <MetricCard label="Total Debt" value={<MoneyDisplay amount={derived.totalDebt} size="lg" />} icon={<CreditCard size={16} />} accent={derived.totalDebt > 0 ? 'negative' : 'default'} />
            <MetricCard label="Net Cash Flow (7d)" value={<MoneyDisplay amount={netCashFlow} size="lg" colorize />} icon={<Landmark size={16} />} />
          </div>

          <GameCard title="Balance History">
            <TrendChart
              data={derived.balanceHistory}
              xKey="day"
              valueFormatter={formatMoneyShort}
              series={[{ key: 'balance', label: 'Cash Balance', color: 'var(--cl-accent)' }]}
            />
          </GameCard>

          {derived.runway.runwayMonths < 3 && (
            <AlertBanner tone="urgent" title="Low Financial Runway" message={`At current spending, your cash covers about ${derived.runway.runwayMonths.toFixed(1)} months of expenses.`} />
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <GameCard title="Upcoming Payments" icon={<Clock size={16} />}>
              {upcomingPayments.length === 0 ? (
                <p className="text-sm text-cl-text-muted">No recurring payments due.</p>
              ) : (
                <div className="space-y-2.5">
                  {upcomingPayments.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-cl-text-secondary">{p.label}</span>
                      <span className="text-cl-text-primary font-medium">{formatMoney(p.amount)} in {p.daysUntil}d</span>
                    </div>
                  ))}
                </div>
              )}
            </GameCard>

            <GameCard title="Recent Transactions" icon={<Receipt size={16} />}>
              {recentTransactions.length === 0 ? (
                <p className="text-sm text-cl-text-muted">No personal transactions yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentTransactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-sm">
                      <span className="text-cl-text-secondary truncate mr-3">{t.description}</span>
                      <span className={cn('font-medium shrink-0', t.amount >= 0 ? 'text-cl-positive' : 'text-cl-negative')}>{formatMoney(t.amount, { showSign: true })}</span>
                    </div>
                  ))}
                </div>
              )}
            </GameCard>
          </div>
        </div>
      )}

      {tab === 'Accounts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <GameCard title="Credit Score">
              <div className="flex flex-col items-center justify-center py-4">
                <p className={`text-4xl font-bold ${creditTone === 'positive' ? 'text-cl-positive' : creditTone === 'gold' ? 'text-cl-gold' : 'text-cl-negative'}`}>
                  {game.player.bank.creditScore}
                </p>
                <p className="text-xs text-cl-text-muted mt-1">300 - 850</p>
                <ProgressBar value={((game.player.bank.creditScore - 300) / 550) * 100} tone={creditTone === 'positive' ? 'positive' : creditTone === 'gold' ? 'gold' : 'negative'} className="w-full mt-4" />
              </div>
            </GameCard>

            <GameCard title="Savings Account" subtitle={`Earning ${formatPercent(game.player.bank.savingsInterestRateAnnual * 100, { decimals: 1 })} annual interest`} icon={<PiggyBank size={16} />}>
              <div className="flex items-center gap-2">
                <input value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} className="w-full rounded-md bg-white/[0.05] border border-cl-border-strong px-3 py-2 text-sm text-cl-text-primary" />
                <GameButton size="sm" variant="secondary" disabledReason={game.player.cash < Number(transferAmount) ? 'Not enough cash' : undefined} onClick={() => depositSavings(Number(transferAmount))}>Deposit</GameButton>
                <GameButton size="sm" variant="secondary" disabledReason={game.player.bank.savingsBalance < Number(transferAmount) ? 'Not enough savings' : undefined} onClick={() => withdrawSavings(Number(transferAmount))}>Withdraw</GameButton>
              </div>
            </GameCard>
          </div>

          <GameCard title="Economic Conditions" icon={<Activity size={16} />}>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-cl-text-muted mb-1">Economy</p>
                <StatusBadge label={ECONOMY_CONDITION_LABELS[game.economy.condition]} tone={game.economy.condition === 'recession' ? 'danger' : game.economy.condition === 'boom' ? 'gold' : 'info'} />
              </div>
              <div>
                <p className="text-xs text-cl-text-muted mb-1">Interest Rates</p>
                <p className="text-sm font-semibold text-cl-text-primary">{formatPercent(game.economy.interestRate * 100, { decimals: 2 })}</p>
              </div>
              <div>
                <p className="text-xs text-cl-text-muted mb-1">Unemployment</p>
                <p className="text-sm font-semibold text-cl-text-primary">{formatPercent(game.economy.unemploymentRate * 100, { decimals: 1 })}</p>
              </div>
            </div>
          </GameCard>
        </div>
      )}

      {tab === 'Transactions' && (
        <TransactionLedger transactions={game.transactions} businesses={game.businesses} holdingCompanies={game.player.holdingCompanies} dayIndex={game.time.dayIndex} />
      )}

      {tab === 'Loans' && (
        <div className="space-y-6">
          <GameCard
            title="Apply for a Loan"
            icon={<Landmark size={16} />}
            action={<HelpTip text="Loans aren't instant. Your application goes to underwriting based on credit score, income, employment history, and debt-to-income ratio, with a decision arriving in a few days — approved, denied with reasons, or a smaller counter-offer." />}
          >
            <div className="flex gap-2 mb-3">
              {LOAN_KIND_OPTIONS.map((k) => (
                <button key={k} onClick={() => setLoanKind(k)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${loanKind === k ? 'border-cl-accent bg-cl-accent/10 text-cl-accent' : 'border-cl-border-strong text-cl-text-secondary'}`}>
                  {LOAN_KIND_LABELS[k]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <input value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} className="w-full rounded-md bg-white/[0.05] border border-cl-border-strong px-3 py-2 text-sm text-cl-text-primary" />
              <GameButton size="sm" onClick={() => submitLoanApplication(loanKind, null, Number(loanAmount), 36)}>Apply</GameButton>
            </div>
            <p className="text-xs text-cl-text-muted">Applications go through underwriting — expect a decision within a few days.</p>
          </GameCard>

          {(pendingApps.length > 0 || decidedApps.length > 0) && (
            <GameCard title="Loan Applications" icon={<Clock size={16} />} padding="none">
              <div className="divide-y divide-cl-border">
                {pendingApps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <div className="flex items-center gap-2"><p className="font-medium text-cl-text-primary">{formatMoney(app.requestedAmount)}</p><StatusBadge label={LOAN_KIND_LABELS[app.kind]} tone="neutral" /></div>
                      <p className="text-xs text-cl-text-muted">Decision expected day {app.decisionAt}</p>
                    </div>
                    <StatusBadge label="Under Review" tone="info" />
                  </div>
                ))}
                {decidedApps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-cl-text-primary">{formatMoney(app.requestedAmount)} requested</p>
                        <StatusBadge label={LOAN_KIND_LABELS[app.kind]} tone="neutral" />
                      </div>
                      {app.status === 'denied' && <p className="text-xs text-cl-negative mt-1">{app.denialReasons.join(' ')}</p>}
                      {app.status === 'counter_offer' && <p className="text-xs text-cl-text-muted mt-1">Counter: {formatMoney(app.approvedAmount ?? 0)} at {((app.approvedRateAnnual ?? 0) * 100).toFixed(1)}%</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {app.status === 'counter_offer' ? (
                        <>
                          <GameButton size="sm" onClick={() => acceptCounterOffer(app.id)}>Accept</GameButton>
                          <GameButton size="sm" variant="ghost" onClick={() => declineLoanApplication(app.id)}>Decline</GameButton>
                        </>
                      ) : (
                        <StatusBadge label={app.status === 'approved' || app.status === 'accepted' ? 'Approved' : app.status === 'denied' ? 'Denied' : 'Declined'} tone={app.status === 'approved' || app.status === 'accepted' ? 'success' : 'danger'} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </GameCard>
          )}

          <GameCard title="Active Loans" icon={<CreditCard size={16} />} padding="none">
            {game.player.bank.loans.length === 0 ? (
              <EmptyState icon={<CreditCard size={32} />} title="You currently have no active loans" description="Loans you take out will appear here with their remaining balance and payment schedule." />
            ) : (
              <div className="divide-y divide-cl-border">
                {game.player.bank.loans.map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-cl-text-primary">{formatMoney(loan.remainingBalance)} remaining</p>
                        <StatusBadge label={LOAN_KIND_LABELS[loan.kind]} tone="neutral" />
                      </div>
                      <p className="text-xs text-cl-text-muted">Original: {formatMoney(loan.principal)} at {formatPercent(loan.interestRateAnnual * 100, { decimals: 1 })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-cl-text-primary">{formatMoney(loan.monthlyPayment)}/mo</p>
                      <p className="text-xs text-cl-text-muted">{loan.monthsRemaining} months left</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GameCard>
        </div>
      )}

      {tab === 'Recurring Costs' && (
        <div className="space-y-6">
          <GameCard title="What My Life Costs" subtitle="Derived from everything you actually own" icon={<Receipt size={16} />}>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-cl-border">
              <span className="text-sm font-semibold text-cl-text-primary flex items-center gap-1.5"><AlertTriangle size={14} className="text-cl-warning" /> Your Life Costs</span>
              <span className="text-xl font-bold text-cl-negative">{formatMoney(derived.costBreakdown.totalDaily)}/day</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {[derived.costBreakdown.housing, derived.costBreakdown.transport, derived.costBreakdown.food, derived.costBreakdown.family, derived.costBreakdown.loans, derived.costBreakdown.subscriptions, derived.costBreakdown.personalLifestyle, derived.costBreakdown.lifestyleAssets].map((item) => (
                <div key={item.label} className="cl-panel p-3">
                  <p className="text-xs text-cl-text-muted mb-1">{item.label}</p>
                  <p className="text-sm font-semibold text-cl-text-primary">{formatMoney(item.dailyAmount)}/day</p>
                  <p className="text-xs text-cl-text-muted mt-0.5">{item.detail}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-cl-border">
              <span className="text-sm font-semibold text-cl-text-primary">Total Monthly Cost</span>
              <span className="text-lg font-bold text-cl-negative">{formatMoney(derived.costBreakdown.totalMonthly)}/mo</span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-cl-text-secondary flex items-center gap-1.5"><Clock size={13} /> Emergency Runway</span>
              <span className={`text-sm font-semibold ${derived.runway.runwayMonths < 2 ? 'text-cl-negative' : derived.runway.runwayMonths < 6 ? 'text-cl-warning' : 'text-cl-positive'}`}>
                {derived.runway.runwayMonths >= 99 ? 'No ongoing costs' : `${derived.runway.runwayMonths.toFixed(1)} months`}
              </span>
            </div>
          </GameCard>

          <GameCard title="Subscriptions" subtitle="Recurring monthly charges" padding="none">
            <div className="divide-y divide-cl-border">
              {game.player.subscriptions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="font-medium text-cl-text-primary">{sub.name}</p>
                    <p className="text-xs text-cl-text-muted">{formatMoney(sub.monthlyCost)}/mo</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <GameButton size="sm" variant="secondary" onClick={() => toggleSubscription(sub.id)}>{sub.active ? 'Pause' : 'Resume'}</GameButton>
                    <GameButton size="sm" variant="danger" onClick={() => cancelSubscription(sub.id)}>Cancel</GameButton>
                  </div>
                </div>
              ))}
            </div>
            {availableToAdd.length > 0 && (
              <div className="px-5 py-4 flex flex-wrap gap-2 border-t border-cl-border">
                {availableToAdd.map((c) => (
                  <GameButton key={c.id} size="sm" variant="secondary" onClick={() => addSubscription(c.id)}>+ {c.name} (${c.monthlyCost}/mo)</GameButton>
                ))}
              </div>
            )}
          </GameCard>
        </div>
      )}
    </div>
  );
}
