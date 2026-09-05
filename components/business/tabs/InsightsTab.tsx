'use client';

import { useMemo } from 'react';
import { Activity, Lightbulb, LineChart, TrendingDown, TrendingUp } from 'lucide-react';
import { calculateBreakEven, calculateBusinessInsights, getExecutiveCommentary, type InsightSeverity } from '@/game/simulation/businessInsights';
import { formatMoney } from '@/lib/format';
import { GameCard } from '@/components/ui/GameCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Business } from '@/game/types';

const SEVERITY_TONE: Record<InsightSeverity, 'warning' | 'success' | 'info' | 'danger'> = {
  critical: 'danger', warning: 'warning', opportunity: 'success', info: 'info',
};
const SEVERITY_LABEL: Record<InsightSeverity, string> = {
  critical: 'Critical', warning: 'Needs Attention', opportunity: 'Opportunity', info: 'For Your Information',
};

type HealthStatus = 'Good' | 'Watch' | 'Critical';
const HEALTH_TONE: Record<HealthStatus, 'success' | 'warning' | 'danger'> = { Good: 'success', Watch: 'warning', Critical: 'danger' };

export function InsightsTab({ business }: { business: Business }) {
  const insights = useMemo(() => calculateBusinessInsights(business), [business]);
  const breakEven = useMemo(() => calculateBreakEven(business), [business]);
  const executiveCommentary = useMemo(() => getExecutiveCommentary(business), [business]);
  const hasCmo = business.managers.some((m) => m.role === 'cmo');
  const hasCfo = business.managers.some((m) => m.role === 'cfo');
  const hasCoo = business.managers.some((m) => m.role === 'coo');

  const recent = business.financialHistory.slice(-14);
  const avgDailyProfit = recent.length > 0 ? recent.reduce((s, d) => s + d.profit, 0) / recent.length : 0;
  const runwayDays = avgDailyProfit < 0 && business.cash > 0 ? Math.round(business.cash / Math.abs(avgDailyProfit)) : null;

  const profitability: HealthStatus = avgDailyProfit > 0 ? 'Good' : recent.length < 7 ? 'Watch' : 'Critical';
  const staffing: HealthStatus = insights.some((i) => i.title === 'Understaffed') ? 'Watch' : 'Good';
  const capacity: HealthStatus = insights.some((i) => i.title === 'Long Wait Times') ? 'Watch' : 'Good';
  const cashHealth: HealthStatus = runwayDays === null ? 'Good' : runwayDays < 30 ? 'Critical' : runwayDays < 90 ? 'Watch' : 'Good';
  const reputationHealth: HealthStatus = business.reputation >= 55 ? 'Good' : business.reputation >= 40 ? 'Watch' : 'Critical';

  const dimensions: { label: string; status: HealthStatus }[] = [
    { label: 'Profitability', status: profitability },
    { label: 'Staffing', status: staffing },
    { label: 'Capacity', status: capacity },
    { label: 'Cash Runway', status: cashHealth },
    { label: 'Reputation', status: reputationHealth },
  ];

  return (
    <div className="space-y-6">
      <GameCard title="Business Health" icon={<Activity size={16} />}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {dimensions.map((d) => (
            <div key={d.label} className="cl-panel p-3 text-center">
              <p className="text-xs text-cl-text-muted mb-2">{d.label}</p>
              <StatusBadge label={d.status} tone={HEALTH_TONE[d.status]} />
            </div>
          ))}
        </div>
      </GameCard>

      <GameCard title="Break-Even Analysis" icon={breakEven.currentDailyRevenue >= breakEven.dailyBreakEvenRevenue ? <TrendingUp size={16} /> : <TrendingDown size={16} />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="cl-panel p-3 text-center">
            <p className="text-xs text-cl-text-muted mb-1">Daily Break-Even Revenue</p>
            <p className="text-sm font-semibold text-cl-text-primary">{formatMoney(breakEven.dailyBreakEvenRevenue)}</p>
          </div>
          <div className="cl-panel p-3 text-center">
            <p className="text-xs text-cl-text-muted mb-1">Current Daily Revenue</p>
            <p className="text-sm font-semibold text-cl-text-primary">{formatMoney(breakEven.currentDailyRevenue)}</p>
          </div>
          <div className="cl-panel p-3 text-center">
            <p className="text-xs text-cl-text-muted mb-1">Margin of Safety</p>
            <p className={`text-sm font-semibold ${breakEven.marginOfSafetyPct >= 0 ? 'text-cl-positive' : 'text-cl-negative'}`}>{breakEven.marginOfSafetyPct}%</p>
          </div>
        </div>
        <ProgressBar
          value={Math.max(0, Math.min(100, 50 + breakEven.marginOfSafetyPct))}
          tone={breakEven.marginOfSafetyPct >= 0 ? 'positive' : 'negative'}
          label={breakEven.marginOfSafetyPct >= 0 ? 'Operating above break-even' : 'Operating below break-even'}
        />
        {runwayDays !== null && (
          <p className="text-xs text-cl-negative mt-3">At the current loss rate, business cash runs out in about {runwayDays} days.</p>
        )}
      </GameCard>

      <GameCard title="Business Market Dashboard" icon={<LineChart size={16} />} subtitle="Industry trends and what your executives make of them">
        <div className="mb-4">
          <p className="text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Active Trends</p>
          {business.activeMarketTrends.length === 0 && business.activeSupplierEvents.length === 0 ? (
            <p className="text-sm text-cl-text-muted">No unusual market conditions right now.</p>
          ) : (
            <div className="space-y-2">
              {business.activeMarketTrends.map((t) => (
                <p key={t.id} className="text-sm text-cl-text-secondary">
                  <span className="text-cl-text-primary font-medium">{t.name}:</span> {t.affectedMenuItemNames.join(', ')} demand {t.demandMultiplier >= 1 ? 'up' : 'down'} {Math.abs(Math.round((t.demandMultiplier - 1) * 100))}%
                </p>
              ))}
              {business.activeSupplierEvents.map((e) => (
                <p key={e.id} className="text-sm text-cl-text-secondary">
                  <span className="text-cl-text-primary font-medium">{e.name}:</span> pricing {e.priceMultiplierDelta >= 0 ? '+' : ''}{Math.round(e.priceMultiplierDelta * 100)}%
                </p>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Executive Take</p>
        {executiveCommentary.length > 0 ? (
          <div className="space-y-2 mb-2">
            {executiveCommentary.map((c) => (
              <div key={c.role} className="cl-panel p-3">
                <p className="text-xs text-cl-text-muted mb-1">{c.name} — {c.role}</p>
                <p className="text-sm text-cl-text-secondary">&ldquo;{c.message}&rdquo;</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-cl-text-muted mb-2">Nothing notable to react to right now.</p>
        )}
        <div className="text-xs text-cl-text-muted space-y-1">
          {!hasCmo && <p>No CMO — hire one for campaign suggestions tied to live demand trends.</p>}
          {!hasCfo && <p>No CFO — hire one for a running margin/cost-control read on the business.</p>}
          {!hasCoo && <p>No COO — hire one for company-wide capacity/bottleneck calls.</p>}
        </div>
      </GameCard>

      <GameCard title="Insights & Recommendations" icon={<Lightbulb size={16} />}>
        {insights.length === 0 ? (
          <EmptyState icon={<Lightbulb size={28} />} title="Nothing needs your attention" description="Every location is running within healthy demand, staffing, and pricing ranges." />
        ) : (
          <div className="space-y-3">
            {insights.map((insight) => (
              <div key={insight.id} className="cl-panel p-4">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <p className="font-semibold text-cl-text-primary">{insight.title}</p>
                  <StatusBadge label={SEVERITY_LABEL[insight.severity]} tone={SEVERITY_TONE[insight.severity]} />
                </div>
                <p className="text-sm text-cl-text-secondary mb-3">{insight.description}</p>
                {insight.estimatedDailyImpact !== null && (
                  <p className={`text-xs font-medium mb-2 ${insight.estimatedDailyImpact >= 0 ? 'text-cl-positive' : 'text-cl-negative'}`}>
                    Estimated impact: {insight.estimatedDailyImpact >= 0 ? '+' : ''}{formatMoney(insight.estimatedDailyImpact)}/day
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {insight.solutions.map((s, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-white/[0.04] text-cl-text-secondary border border-cl-border-strong">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </GameCard>
    </div>
  );
}
