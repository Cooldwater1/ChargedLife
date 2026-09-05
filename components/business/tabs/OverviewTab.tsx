'use client';

import { useMemo } from 'react';
import { Activity, AlertTriangle, MessageSquare, Star, TrendingUp, Users } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { calculateMarketShare } from '@/game/simulation/npcBusiness';
import type { Business, GameNotification } from '@/game/types';
import { formatMoney } from '@/lib/format';
import { GameCard } from '@/components/ui/GameCard';
import { GameButton } from '@/components/ui/GameButton';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MetricCard } from '@/components/ui/MetricCard';

export function OverviewTab({ business, notifications }: { business: Business; notifications: GameNotification[] }) {
  const resolveBusinessEvent = useGameStore((s) => s.resolveBusinessEvent);
  const allBusinesses = useGameStore((s) => s.game?.businesses ?? []);
  const npcBusinesses = useGameStore((s) => s.game?.npcBusinesses ?? []);

  const marketShareByCity = useMemo(() => {
    const cities = [...new Set(business.locations.map((l) => l.city))];
    return cities.map((city) => ({ city, entries: calculateMarketShare(allBusinesses, npcBusinesses, city) }));
  }, [business.locations, allBusinesses, npcBusinesses]);

  const businessAlerts = notifications
    .filter((n) => (n.severity === 'warning' || n.severity === 'urgent') && n.title !== business.activeEvents[0]?.title)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  const latestDay = business.financialHistory[business.financialHistory.length - 1];
  const avgInventory = business.locations.length > 0
    ? Math.round(business.locations.reduce((s, l) => s + l.inventoryStock, 0) / business.locations.length)
    : 100;
  const staffCount = business.employees.length + business.managers.length;

  return (
    <div className="space-y-6">
      <GameCard title="Business Health" subtitle="Cash, performance, and staffing at a glance" icon={<Activity size={16} />}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <MetricCard label="Business Cash" value={formatMoney(business.cash, { abbreviate: true })} accent="gold" />
          <MetricCard label="Daily Revenue" value={formatMoney(latestDay?.revenue ?? 0)} />
          <MetricCard label="Daily Profit" value={formatMoney(latestDay?.profit ?? 0)} accent={(latestDay?.profit ?? 0) >= 0 ? 'positive' : 'negative'} />
          <MetricCard label="Staff" value={staffCount} icon={<Users size={16} />} />
          <MetricCard label="Inventory Health" value={`${avgInventory}%`} accent={avgInventory < 30 ? 'negative' : 'positive'} />
          <MetricCard label="Reputation" value={`${Math.round(business.reputation)} / 100`} />
        </div>
      </GameCard>

      {business.activeEvents.length > 0 && (
        <div className="space-y-4">
          {business.activeEvents.map((event) => (
            <GameCard key={event.id} title={event.title} icon={<AlertTriangle size={16} className="text-cl-warning" />} className="!border-cl-warning/30">
              <p className="text-sm text-cl-text-secondary mb-4">{event.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {event.choices.map((choice) => (
                  <div key={choice.id} className="cl-panel p-3">
                    <p className="text-sm font-medium text-cl-text-primary mb-1">{choice.label}</p>
                    <p className="text-xs text-cl-text-secondary mb-3">{choice.description}</p>
                    <GameButton size="sm" variant="secondary" fullWidth onClick={() => resolveBusinessEvent(business.id, event.id, choice)}>
                      {choice.cost > 0 ? `Pay ${formatMoney(choice.cost)}` : 'Choose'}
                    </GameButton>
                  </div>
                ))}
              </div>
            </GameCard>
          ))}
        </div>
      )}

      {marketShareByCity.some(({ entries }) => entries.length > 1) && (
        <GameCard title="Market Position" subtitle="Your combined revenue share vs. known competitors, by city" icon={<TrendingUp size={16} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {marketShareByCity.filter(({ entries }) => entries.length > 1).map(({ city, entries }) => (
              <div key={city}>
                <p className="text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-3">{city}</p>
                <div className="space-y-2.5">
                  {entries.slice(0, 5).map((entry) => (
                    <div key={entry.name}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={entry.isPlayer ? 'text-cl-accent font-semibold' : 'text-cl-text-secondary'}>{entry.isPlayer ? 'You' : entry.name}</span>
                        <span className="text-cl-text-muted">{entry.sharePct}%</span>
                      </div>
                      <ProgressBar value={entry.sharePct} tone={entry.isPlayer ? 'gold' : 'accent'} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GameCard>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GameCard title="Alerts" icon={<AlertTriangle size={16} />}>
          {businessAlerts.length === 0 ? (
            <p className="text-sm text-cl-text-muted">No active alerts. Things are running smoothly.</p>
          ) : (
            <div className="space-y-2.5">
              {businessAlerts.map((a) => <AlertBanner key={a.id} tone={a.severity} title={a.title} message={a.message} />)}
            </div>
          )}
        </GameCard>

        <GameCard title="Recent Reviews" icon={<MessageSquare size={16} />}>
          {business.reviews.length === 0 ? (
            <EmptyState icon={<MessageSquare size={28} />} title="No reviews yet" description="Reviews will appear here as customers start visiting your business." />
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto cl-scrollbar-thin">
              {business.reviews.slice(0, 8).map((review) => (
                <div key={review.id} className="pb-3 border-b border-cl-border last:border-0">
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={13} className={i < review.rating ? 'text-cl-gold' : 'text-cl-text-muted'} fill={i < review.rating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  <p className="text-sm text-cl-text-secondary">&ldquo;{review.text}&rdquo;</p>
                </div>
              ))}
            </div>
          )}
        </GameCard>
      </div>
    </div>
  );
}
