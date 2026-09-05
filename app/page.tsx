'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { AlertTriangle, Briefcase, Building2, CreditCard, GraduationCap, Heart, Home, MapPin, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { JOB_DEFINITIONS } from '@/game/constants/data';
import { EDUCATION_LEVEL_LABELS } from '@/game/types';
import { calculateNetWorth, calculateTotalDebt } from '@/game/simulation/networth';
import { getHighestCompletedLevel } from '@/game/simulation/education';
import { formatMoney } from '@/lib/format';
import { GameCard } from '@/components/ui/GameCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { GameButton } from '@/components/ui/GameButton';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PageHero } from '@/components/ui/PageHero';
import { TrendChart, formatMoneyShort } from '@/components/ui/TrendChart';
import { PAGE_BACKGROUND } from '@/game/constants/assets';

const NET_WORTH_MILESTONES = [100_000, 1_000_000, 10_000_000, 100_000_000, 1_000_000_000];

export default function OverviewPage() {
  const game = useGameStore((s) => s.game);

  const derived = useMemo(() => {
    if (!game) return null;

    const netWorth = calculateNetWorth(game);
    const totalDebt = calculateTotalDebt(game);
    const job = JOB_DEFINITIONS.find((j) => j.id === game.player.career.jobId);
    const partner = game.player.family.find((f) => f.id === game.player.relationship.partnerId);
    const children = game.player.family.filter((f) => f.role === 'child');
    const educationLevel = getHighestCompletedLevel(game.player.education.completedDegrees);

    const last7Days = game.transactions.filter((t) => game.time.dayIndex - t.timestamp <= 7);
    const weeklyIncome = last7Days.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const weeklyExpenses = Math.abs(last7Days.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0));
    const businessWeeklyProfit = game.businesses.reduce((sum, b) => sum + b.financialHistory.slice(-7).reduce((s, d) => s + d.profit, 0), 0);

    const dayBuckets = new Map<number, { income: number; expenses: number }>();
    for (const t of game.transactions) {
      const bucket = dayBuckets.get(t.timestamp) ?? { income: 0, expenses: 0 };
      if (t.amount > 0) bucket.income += t.amount;
      else bucket.expenses += Math.abs(t.amount);
      dayBuckets.set(t.timestamp, bucket);
    }
    const sortedDays = [...dayBuckets.entries()].sort((a, b) => a[0] - b[0]).slice(-21);
    const chartData = sortedDays.map(([dayIndex, bucket]) => ({ day: `D${dayIndex}`, income: Math.round(bucket.income), expenses: Math.round(bucket.expenses) }));

    const topBusinesses = [...game.businesses]
      .map((b) => {
        const last7 = b.financialHistory.slice(-7);
        return { business: b, revenue7d: last7.reduce((s, d) => s + d.revenue, 0), profit7d: last7.reduce((s, d) => s + d.profit, 0), customers7d: last7.reduce((s, d) => s + d.customers, 0) };
      })
      .sort((a, b) => b.profit7d - a.profit7d)
      .slice(0, 4);

    const alerts = [...game.notifications]
      .filter((n) => (n.severity === 'warning' || n.severity === 'urgent') && !n.read)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    const milestone = NET_WORTH_MILESTONES.find((m) => m > netWorth) ?? NET_WORTH_MILESTONES[NET_WORTH_MILESTONES.length - 1];

    return { netWorth, totalDebt, job, partner, children, educationLevel, weeklyIncome, weeklyExpenses, businessWeeklyProfit, chartData, topBusinesses, alerts, milestone };
  }, [game]);

  if (!game || !derived) return null;

  return (
    <div className="space-y-6 cl-animate-in">
      <PageHero image={PAGE_BACKGROUND.overview}>
        <div className="flex items-start justify-between flex-wrap gap-6">
          <div>
            <h1 className="text-2xl font-bold text-cl-text-primary tracking-tight">Welcome back, {game.player.name}</h1>
            <p className="text-sm text-cl-text-secondary mt-1 flex items-center gap-1.5"><MapPin size={13} /> Age {game.player.age} · {game.player.city}</p>
          </div>
          <div className="flex flex-wrap gap-8">
            <div>
              <p className="text-xs text-cl-text-muted mb-1">Net Worth</p>
              <span className="text-xl font-bold text-cl-gold font-mono tabular-nums">{formatMoney(derived.netWorth, { abbreviate: true })}</span>
            </div>
            <div>
              <p className="text-xs text-cl-text-muted mb-1 flex items-center gap-1"><Briefcase size={12} /> Career</p>
              <p className="text-sm font-semibold text-cl-text-primary">{derived.job ? derived.job.title : 'Unemployed'}</p>
            </div>
            <div>
              <p className="text-xs text-cl-text-muted mb-1 flex items-center gap-1"><Heart size={12} /> Relationship</p>
              <p className="text-sm font-semibold text-cl-text-primary">{derived.partner ? `${derived.partner.name}` : 'Single'}</p>
            </div>
            <div>
              <p className="text-xs text-cl-text-muted mb-1 flex items-center gap-1"><Building2 size={12} /> Businesses</p>
              <p className="text-sm font-semibold text-cl-text-primary">{game.businesses.length}</p>
            </div>
            <div>
              <p className="text-xs text-cl-text-muted mb-1 flex items-center gap-1"><Home size={12} /> Properties</p>
              <p className="text-sm font-semibold text-cl-text-primary">{game.player.properties.length}</p>
            </div>
          </div>
        </div>
      </PageHero>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard label="Cash" value={<MoneyDisplay amount={game.player.cash} size="lg" />} icon={<Wallet size={16} />} />
        <MetricCard label="Weekly Income" value={<MoneyDisplay amount={derived.weeklyIncome} size="lg" />} icon={<TrendingUp size={16} />} accent="positive" />
        <MetricCard label="Weekly Expenses" value={<MoneyDisplay amount={derived.weeklyExpenses} size="lg" />} icon={<TrendingDown size={16} />} accent="negative" />
        <MetricCard label="Business Profit (7d)" value={<MoneyDisplay amount={derived.businessWeeklyProfit} size="lg" colorize />} icon={<Building2 size={16} />} />
        <MetricCard label="Total Debt" value={<MoneyDisplay amount={derived.totalDebt} size="lg" />} icon={<CreditCard size={16} />} accent={derived.totalDebt > 0 ? 'negative' : 'default'} />
        <MetricCard label="Education" value={EDUCATION_LEVEL_LABELS[derived.educationLevel]} icon={<GraduationCap size={16} />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <GameCard title="Financial Trend" subtitle="Income vs. expenses, last 21 days" className="xl:col-span-2">
          <TrendChart
            data={derived.chartData}
            xKey="day"
            valueFormatter={formatMoneyShort}
            series={[{ key: 'income', label: 'Income', color: 'var(--cl-positive)' }, { key: 'expenses', label: 'Expenses', color: 'var(--cl-negative)' }]}
          />
        </GameCard>

        <GameCard title="Net Worth Milestone" icon={<TrendingUp size={16} />}>
          <div className="flex flex-col justify-center h-full">
            <p className="text-xs text-cl-text-muted mb-2">Progress to next milestone</p>
            <p className="text-lg font-semibold text-cl-gold mb-3">{formatMoney(derived.milestone)}</p>
            <ProgressBar value={(derived.netWorth / derived.milestone) * 100} tone="gold" showValue />
            <p className="text-xs text-cl-text-muted mt-3">Current: {formatMoney(derived.netWorth)}</p>
          </div>
        </GameCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <GameCard title="Business Performance" subtitle="Your best performing companies" className="xl:col-span-2" padding="none">
          {derived.topBusinesses.length === 0 ? (
            <EmptyState icon={<Building2 size={36} />} title="You don't own a business yet" description="Start your first company to begin building your empire." action={<Link href="/businesses"><GameButton>Start Your First Business</GameButton></Link>} />
          ) : (
            <div className="divide-y divide-cl-border">
              {derived.topBusinesses.map(({ business, revenue7d, profit7d, customers7d }) => (
                <div key={business.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-cl-text-primary truncate">{business.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-cl-text-muted">
                      <span>Revenue <MoneyDisplay amount={revenue7d} size="sm" /></span>
                      <span>Profit <MoneyDisplay amount={profit7d} size="sm" colorize /></span>
                      <span>{business.employees.length} employees</span>
                      <span>{customers7d} customers</span>
                    </div>
                  </div>
                  <Link href={`/businesses/${business.id}`}><GameButton size="sm" variant="secondary">Manage</GameButton></Link>
                </div>
              ))}
            </div>
          )}
        </GameCard>

        <GameCard title="Family" icon={<Heart size={16} />}>
          {derived.partner ? (
            <div className="space-y-1 mb-3">
              <p className="text-sm font-medium text-cl-text-primary">{derived.partner.name}</p>
              <p className="text-xs text-cl-text-muted">{derived.partner.occupation}</p>
            </div>
          ) : (
            <p className="text-sm text-cl-text-muted mb-3">You&apos;re currently single.</p>
          )}
          {derived.children.length > 0 && <p className="text-xs text-cl-text-secondary mb-3">{derived.children.length} {derived.children.length === 1 ? 'child' : 'children'}</p>}
          <Link href="/family"><GameButton size="sm" variant="secondary" fullWidth>View Family</GameButton></Link>
        </GameCard>
      </div>

      {derived.alerts.length > 0 && (
        <GameCard title="Alerts" icon={<AlertTriangle size={16} />}>
          <div className="space-y-2.5">
            {derived.alerts.map((a) => <AlertBanner key={a.id} tone={a.severity} title={a.title} message={a.message} />)}
          </div>
        </GameCard>
      )}

      {!derived.job && game.businesses.length === 0 && (
        <GameCard title="Getting Started" icon={<Briefcase size={16} />}>
          <p className="text-sm text-cl-text-secondary mb-4">You don&apos;t have a job yet. Find employment to start earning a steady income before launching your first business.</p>
          <Link href="/career"><GameButton>Browse Jobs</GameButton></Link>
        </GameCard>
      )}
    </div>
  );
}
