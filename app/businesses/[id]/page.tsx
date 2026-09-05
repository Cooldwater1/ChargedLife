'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronRight, Users2 } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { EmptyState } from '@/components/ui/EmptyState';
import { GameButton } from '@/components/ui/GameButton';
import { MetricCard } from '@/components/ui/MetricCard';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { BusinessHeader } from '@/components/business/BusinessHeader';
import { OverviewTab } from '@/components/business/tabs/OverviewTab';
import { InsightsTab } from '@/components/business/tabs/InsightsTab';
import { OperationsTab } from '@/components/business/tabs/OperationsTab';
import { EmployeesTab } from '@/components/business/tabs/EmployeesTab';
import { MenuTab } from '@/components/business/tabs/MenuTab';
import { MarketingTab } from '@/components/business/tabs/MarketingTab';
import { LocationsTab } from '@/components/business/tabs/LocationsTab';
import { FinancesTab } from '@/components/business/tabs/FinancesTab';
import { ManagementTab } from '@/components/business/tabs/ManagementTab';
import { HeadquartersTab } from '@/components/business/tabs/HeadquartersTab';
import { BenefitsTab } from '@/components/business/tabs/BenefitsTab';
import { InventoryTab } from '@/components/business/tabs/InventoryTab';
import { cn } from '@/lib/cn';

const TABS = ['Overview', 'Insights', 'Operations', 'Inventory', 'Employees', 'Benefits', 'Menu', 'Marketing', 'Locations', 'Management', 'Headquarters', 'Finances'] as const;
type Tab = (typeof TABS)[number];

export default function BusinessDetailPage() {
  const params = useParams<{ id: string }>();
  const businessId = params.id;
  const [tab, setTab] = useState<Tab>('Overview');

  const game = useGameStore((s) => s.game);
  const business = game?.businesses.find((b) => b.id === businessId);

  const kpis = useMemo(() => {
    if (!business) return null;
    const last7 = business.financialHistory.slice(-7);
    return {
      revenue: last7.reduce((s, d) => s + d.revenue, 0),
      expenses: last7.reduce((s, d) => s + d.expenses, 0),
      profit: last7.reduce((s, d) => s + d.profit, 0),
      customers: last7.reduce((s, d) => s + d.customers, 0),
    };
  }, [business]);

  if (!game) return null;

  if (!business) {
    return (
      <EmptyState
        title="Business not found"
        description="This business may have been closed or sold."
        action={<Link href="/businesses"><GameButton>Back to Businesses</GameButton></Link>}
      />
    );
  }

  const businessNotifications = game.notifications.filter((n) => n.link?.businessId === business.id);

  return (
    <div className="space-y-6 cl-animate-in">
      <div className="flex items-center gap-2 text-sm text-cl-text-muted">
        <Link href="/businesses" className="hover:text-cl-text-primary transition-colors">Businesses</Link>
        <ChevronRight size={14} />
        <span className="text-cl-text-primary font-medium">{business.name}</span>
      </div>

      <BusinessHeader business={business} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Revenue (7d)" value={<MoneyDisplay amount={kpis!.revenue} size="lg" />} />
        <MetricCard label="Expenses (7d)" value={<MoneyDisplay amount={kpis!.expenses} size="lg" />} accent="negative" />
        <MetricCard label="Profit (7d)" value={<MoneyDisplay amount={kpis!.profit} size="lg" colorize />} />
        <MetricCard label="Customers (7d)" value={kpis!.customers} icon={<Users2 size={16} />} />
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

      {tab === 'Overview' && <OverviewTab business={business} notifications={businessNotifications} />}
      {tab === 'Insights' && <InsightsTab business={business} />}
      {tab === 'Operations' && <OperationsTab business={business} />}
      {tab === 'Inventory' && <InventoryTab business={business} />}
      {tab === 'Employees' && <EmployeesTab business={business} />}
      {tab === 'Benefits' && <BenefitsTab business={business} />}
      {tab === 'Menu' && <MenuTab business={business} />}
      {tab === 'Marketing' && <MarketingTab business={business} dayIndex={game.time.dayIndex} />}
      {tab === 'Locations' && <LocationsTab business={business} />}
      {tab === 'Management' && <ManagementTab business={business} />}
      {tab === 'Headquarters' && <HeadquartersTab business={business} />}
      {tab === 'Finances' && <FinancesTab business={business} transactions={game.transactions} personalCash={game.player.cash} />}
    </div>
  );
}
