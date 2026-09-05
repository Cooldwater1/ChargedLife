'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Building2, Plus, Star, Users } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { GameCard } from '@/components/ui/GameCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { GameButton } from '@/components/ui/GameButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHero } from '@/components/ui/PageHero';
import { PAGE_BACKGROUND } from '@/game/constants/assets';
import { StartBusinessModal } from '@/components/business/StartBusinessModal';

export default function BusinessesPage() {
  const game = useGameStore((s) => s.game);
  const [modalOpen, setModalOpen] = useState(false);

  const summary = useMemo(() => {
    if (!game) return null;
    let totalRevenue = 0;
    let totalProfit = 0;
    let totalEmployees = 0;
    for (const b of game.businesses) {
      const last7 = b.financialHistory.slice(-7);
      totalRevenue += last7.reduce((s, d) => s + d.revenue, 0);
      totalProfit += last7.reduce((s, d) => s + d.profit, 0);
      totalEmployees += b.employees.length;
    }
    return { totalRevenue, totalProfit, totalEmployees, totalBusinesses: game.businesses.length };
  }, [game]);

  if (!game || !summary) return null;

  return (
    <div className="space-y-6 cl-animate-in">
      <PageHero image={PAGE_BACKGROUND.businesses}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-cl-text-primary tracking-tight">Businesses</h1>
            <p className="text-sm text-cl-text-secondary mt-1">Manage your companies and grow your empire.</p>
          </div>
          <GameButton icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Start Business</GameButton>
        </div>
      </PageHero>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Revenue (7d)" value={<MoneyDisplay amount={summary.totalRevenue} size="lg" />} />
        <MetricCard label="Total Profit (7d)" value={<MoneyDisplay amount={summary.totalProfit} size="lg" colorize />} />
        <MetricCard label="Total Employees" value={summary.totalEmployees} icon={<Users size={16} />} />
        <MetricCard label="Total Businesses" value={summary.totalBusinesses} icon={<Building2 size={16} />} />
      </div>

      <GameCard title="Your Businesses" padding="none">
        {game.businesses.length === 0 ? (
          <EmptyState
            icon={<Building2 size={36} />}
            title="You don't own a business yet"
            description="Start your first company and begin building your empire. Fast Food is a great place to start."
            action={<GameButton onClick={() => setModalOpen(true)} icon={<Plus size={16} />}>Start Your First Business</GameButton>}
          />
        ) : (
          <div className="divide-y divide-cl-border">
            {game.businesses.map((b) => {
              const last7 = b.financialHistory.slice(-7);
              const revenue7d = last7.reduce((s, d) => s + d.revenue, 0);
              const profit7d = last7.reduce((s, d) => s + d.profit, 0);
              return (
                <div key={b.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-cl-text-primary text-lg">{b.name}</p>
                    <p className="text-xs text-cl-text-muted mt-0.5">Fast Food Restaurant</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-cl-text-secondary">
                      <span>Revenue <MoneyDisplay amount={revenue7d} size="sm" /></span>
                      <span>Profit <MoneyDisplay amount={profit7d} size="sm" colorize /></span>
                      <span className="flex items-center gap-1"><Users size={12} /> {b.employees.length}</span>
                      <span>{b.locations.length} location{b.locations.length !== 1 ? 's' : ''}</span>
                      <span className="flex items-center gap-1"><Star size={12} className="text-cl-gold" fill="currentColor" /> {(b.reputation / 20).toFixed(1)}</span>
                    </div>
                  </div>
                  <Link href={`/businesses/${b.id}`}>
                    <GameButton variant="secondary">Manage</GameButton>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </GameCard>

      <StartBusinessModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
