'use client';

import Link from 'next/link';
import { Anchor, Car, Dumbbell, Gem, Heart, Home, Plane, Receipt, Smile, Sparkles, Utensils } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { LIFESTYLE_CATEGORY_LABELS, LIFESTYLE_TIERS } from '@/game/constants/lifestyle';
import { calculateLifestyleMonthlyCost } from '@/game/simulation/lifestyle';
import { calculateDailyCostBreakdown } from '@/game/simulation/dailyCosts';
import { calculateNetWorth } from '@/game/simulation/networth';
import { formatMoney } from '@/lib/format';
import { GameCard } from '@/components/ui/GameCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { HelpTip } from '@/components/ui/HelpTip';
import type { GameState, LifestyleCategory, LifestyleTier } from '@/game/types';
import { cn } from '@/lib/cn';

const CATEGORY_ORDER: LifestyleCategory[] = ['fitness', 'food', 'phone', 'entertainment', 'services'];
const CATEGORY_ICONS: Record<LifestyleCategory, React.ReactNode> = {
  fitness: <Dumbbell size={16} />, entertainment: <Sparkles size={16} />, phone: <Smile size={16} />, food: <Utensils size={16} />, services: <Heart size={16} />,
};

function lifestyleTierLabel(netWorth: number): string {
  if (netWorth >= 10_000_000) return 'Elite';
  if (netWorth >= 1_000_000) return 'Wealthy';
  if (netWorth >= 250_000) return 'Affluent';
  if (netWorth >= 50_000) return 'Comfortable';
  return 'Getting By';
}

function AssetSummaryCard({
  icon, title, count, totalValue, primaryLabel, monthlyCost, href, emptyLabel,
}: {
  icon: React.ReactNode; title: string; count: number; totalValue: number; primaryLabel: string | null; monthlyCost: number; href: string; emptyLabel: string;
}) {
  return (
    <Link href={href} className="cl-panel p-4 block hover:bg-white/[0.03] transition-colors">
      <div className="flex items-center gap-2 mb-2 text-cl-text-secondary">{icon}<p className="text-xs font-medium uppercase tracking-wide">{title}</p></div>
      {count === 0 ? (
        <p className="text-sm text-cl-text-muted">{emptyLabel}</p>
      ) : (
        <>
          <p className="text-sm font-semibold text-cl-text-primary truncate">{primaryLabel}</p>
          <p className="text-xs text-cl-text-muted mt-0.5">{count > 1 ? `${count} owned · ` : ''}{formatMoney(totalValue, { abbreviate: true })} value{monthlyCost > 0 ? ` · ${formatMoney(monthlyCost)}/mo` : ''}</p>
        </>
      )}
    </Link>
  );
}

export default function LifestylePage() {
  const game = useGameStore((s) => s.game);
  const setLifestyleChoice = useGameStore((s) => s.setLifestyleChoice);
  const toggleLifestyleStackable = useGameStore((s) => s.toggleLifestyleStackable);

  if (!game) return null;

  const { lifestyle, wellbeing } = game.player;
  const habitsMonthlyCost = calculateLifestyleMonthlyCost(lifestyle);
  const costBreakdown = calculateDailyCostBreakdown(game as GameState);
  const dailyLifestyleCost = costBreakdown.housing.dailyAmount + costBreakdown.transport.dailyAmount + costBreakdown.lifestyleAssets.dailyAmount + costBreakdown.personalLifestyle.dailyAmount + costBreakdown.subscriptions.dailyAmount;
  const netWorth = calculateNetWorth(game as GameState);
  const tierLabel = lifestyleTierLabel(netWorth);

  const primaryHome = game.player.properties.find((p) => p.use === 'primary') ?? [...game.player.properties].sort((a, b) => b.currentValue - a.currentValue)[0] ?? null;
  const topVehicle = [...game.player.vehicles].sort((a, b) => b.currentValue - a.currentValue)[0] ?? null;
  const topBoat = [...game.player.boats].sort((a, b) => b.currentValue - a.currentValue)[0] ?? null;
  const topAircraft = [...game.player.aircraft].sort((a, b) => b.currentValue - a.currentValue)[0] ?? null;
  const activeSubscriptions = game.player.subscriptions.filter((s) => s.active);

  return (
    <div className="space-y-6 cl-animate-in">
      <div className="cl-panel p-6 bg-gradient-to-br from-cl-accent/[0.08] via-transparent to-transparent">
        <h1 className="text-2xl font-bold text-cl-text-primary tracking-tight">Lifestyle</h1>
        <p className="text-sm text-cl-text-secondary mt-1">Everything you own and everything you do with your money, in one place.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          <div>
            <p className="text-xs text-cl-text-muted mb-1">Current Lifestyle</p>
            <p className="text-xl font-bold text-cl-gold">{tierLabel}</p>
          </div>
          <div>
            <p className="text-xs text-cl-text-muted mb-1">Daily Lifestyle Cost</p>
            <p className="text-xl font-bold text-cl-text-primary">{formatMoney(dailyLifestyleCost)}</p>
          </div>
          <div>
            <p className="text-xs text-cl-text-muted mb-1">Primary Home</p>
            <p className="text-sm font-semibold text-cl-text-primary truncate">{primaryHome?.name ?? 'None yet'}</p>
          </div>
          <div>
            <p className="text-xs text-cl-text-muted mb-1">Primary Vehicle</p>
            <p className="text-sm font-semibold text-cl-text-primary truncate">{topVehicle ? `${topVehicle.year} ${topVehicle.brand} ${topVehicle.model}` : 'None yet'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard label="Monthly Habits Cost" value={formatMoney(habitsMonthlyCost)} accent="negative" />
        <div className="cl-panel p-4">
          <p className="text-xs text-cl-text-muted mb-2 flex items-center gap-1.5"><Heart size={13} /> Health</p>
          <ProgressBar value={wellbeing.health} tone={wellbeing.health >= 60 ? 'positive' : wellbeing.health >= 35 ? 'warning' : 'negative'} showValue />
        </div>
        <div className="cl-panel p-4">
          <p className="text-xs text-cl-text-muted mb-2 flex items-center gap-1.5"><Smile size={13} /> Happiness</p>
          <ProgressBar value={wellbeing.happiness} tone={wellbeing.happiness >= 60 ? 'positive' : wellbeing.happiness >= 35 ? 'warning' : 'negative'} showValue />
        </div>
      </div>

      <GameCard title="What You Own" subtitle="A quick look across every asset category">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <AssetSummaryCard
            icon={<Home size={14} />} title="Home" href="/properties" emptyLabel="No property yet"
            count={game.player.properties.length} totalValue={game.player.properties.reduce((s, p) => s + p.currentValue, 0)}
            primaryLabel={primaryHome?.name ?? null} monthlyCost={game.player.properties.reduce((s, p) => s + p.monthlyMortgagePayment + p.monthlyMaintenance, 0)}
          />
          <AssetSummaryCard
            icon={<Car size={14} />} title="Vehicles" href="/vehicles" emptyLabel="No vehicles yet"
            count={game.player.vehicles.length} totalValue={game.player.vehicles.reduce((s, v) => s + v.currentValue, 0)}
            primaryLabel={topVehicle ? `${topVehicle.year} ${topVehicle.brand} ${topVehicle.model}` : null} monthlyCost={0}
          />
          <AssetSummaryCard
            icon={<Anchor size={14} />} title="Boats" href="/boats" emptyLabel="No boats yet"
            count={game.player.boats.length} totalValue={game.player.boats.reduce((s, b) => s + b.currentValue, 0)}
            primaryLabel={topBoat?.name ?? null} monthlyCost={0}
          />
          <AssetSummaryCard
            icon={<Plane size={14} />} title="Aircraft" href="/aircraft" emptyLabel="No aircraft yet"
            count={game.player.aircraft.length} totalValue={game.player.aircraft.reduce((s, a) => s + a.currentValue, 0)}
            primaryLabel={topAircraft?.name ?? null} monthlyCost={0}
          />
          <AssetSummaryCard
            icon={<Gem size={14} />} title="Luxury Collection" href="/collection" emptyLabel="No luxury items yet"
            count={game.player.luxuryItems.length} totalValue={game.player.luxuryItems.reduce((s, l) => s + l.currentValue, 0)}
            primaryLabel={game.player.luxuryItems.length > 0 ? `${game.player.luxuryItems.length} item${game.player.luxuryItems.length === 1 ? '' : 's'}` : null} monthlyCost={0}
          />
          <AssetSummaryCard
            icon={<Receipt size={14} />} title="Subscriptions" href="/bank" emptyLabel="No active subscriptions"
            count={activeSubscriptions.length} totalValue={0} monthlyCost={activeSubscriptions.reduce((s, sub) => s + sub.monthlyCost, 0)}
            primaryLabel={activeSubscriptions.length > 0 ? `${activeSubscriptions.length} active` : null}
          />
        </div>
      </GameCard>

      <GameCard title="Lifestyle Activities" subtitle="Fitness, food, phone, entertainment, and personal services — real tradeoffs between money, health, and happiness.">
        <div className="space-y-6">
          {CATEGORY_ORDER.map((category) => {
            const tiers = LIFESTYLE_TIERS.filter((t) => t.category === category);
            const stackable = tiers[0]?.stackable ?? false;
            const selectedSingle = category === 'fitness' ? lifestyle.fitness : category === 'phone' ? lifestyle.phone : category === 'food' ? lifestyle.food : null;
            const selectedMulti = category === 'entertainment' ? lifestyle.entertainment : category === 'services' ? lifestyle.services : [];

            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-cl-text-secondary">{CATEGORY_ICONS[category]}</span>
                  <p className="text-sm font-semibold text-cl-text-primary">{LIFESTYLE_CATEGORY_LABELS[category]}</p>
                  {stackable && <HelpTip text="You can pick multiple here at once — each adds its own cost and effects." />}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {tiers.map((tier) => {
                    const isSelected = stackable ? selectedMulti.includes(tier.id) : selectedSingle === tier.id;
                    return (
                      <TierCard
                        key={tier.id}
                        tier={tier}
                        selected={isSelected}
                        onClick={() => (stackable ? toggleLifestyleStackable(category, tier.id) : setLifestyleChoice(category, isSelected ? null : tier.id))}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </GameCard>
    </div>
  );
}

function TierCard({ tier, selected, onClick }: { tier: LifestyleTier; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'text-left rounded-lg border p-3.5 transition-colors',
        selected ? 'border-cl-accent bg-cl-accent/10' : 'border-cl-border-strong bg-white/[0.03] hover:bg-white/[0.06]',
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium text-cl-text-primary">{tier.name}</p>
        {tier.monthlyCost > 0 && <span className="text-xs font-semibold text-cl-text-primary">{formatMoney(tier.monthlyCost)}/mo</span>}
      </div>
      <p className="text-xs text-cl-text-muted mb-2 leading-relaxed">{tier.description}</p>
      <div className="flex flex-wrap gap-2 text-[11px]">
        {tier.healthEffect !== 0 && <span className={tier.healthEffect > 0 ? 'text-cl-positive' : 'text-cl-negative'}>Health {tier.healthEffect > 0 ? '+' : ''}{tier.healthEffect}</span>}
        {tier.happinessEffect !== 0 && <span className={tier.happinessEffect > 0 ? 'text-cl-positive' : 'text-cl-negative'}>Happiness {tier.happinessEffect > 0 ? '+' : ''}{tier.happinessEffect}</span>}
        {tier.statusEffect !== 0 && <span className={tier.statusEffect > 0 ? 'text-cl-gold' : 'text-cl-negative'}>Status {tier.statusEffect > 0 ? '+' : ''}{tier.statusEffect}</span>}
      </div>
    </button>
  );
}
