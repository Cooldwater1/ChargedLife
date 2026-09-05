'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Anchor, Ship } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { BOAT_CATEGORY_LABELS, BOAT_LISTINGS } from '@/game/constants/boats';
import { formatMoney } from '@/lib/format';
import { GameCard } from '@/components/ui/GameCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { GameButton } from '@/components/ui/GameButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PageHero } from '@/components/ui/PageHero';
import { PAGE_BACKGROUND } from '@/game/constants/assets';
import { GiftAssetModal } from '@/components/assets/GiftAssetModal';

export default function BoatsPage() {
  const game = useGameStore((s) => s.game);
  const buyBoat = useGameStore((s) => s.buyBoat);
  const sellBoat = useGameStore((s) => s.sellBoat);
  const takeBoatTrip = useGameStore((s) => s.takeBoatTrip);
  const [giftTarget, setGiftTarget] = useState<{ id: string; name: string; value: number } | null>(null);

  if (!game) return null;

  const totalValue = game.player.boats.reduce((s, b) => s + b.currentValue, 0);
  const totalMonthlyCost = game.player.boats.reduce((s, b) => s + b.maintenanceMonthly + b.marinaFeeMonthly + b.crewCostMonthly, 0);

  return (
    <div className="space-y-6 cl-animate-in">
      <PageHero image={PAGE_BACKGROUND.boats}>
        <h1 className="text-2xl font-bold text-cl-text-primary tracking-tight">Boats</h1>
        <p className="text-sm text-cl-text-secondary mt-1">From a weekend skiff to a superyacht with a full crew.</p>
      </PageHero>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard label="Boats Owned" value={game.player.boats.length} icon={<Ship size={16} />} />
        <MetricCard label="Fleet Value" value={formatMoney(totalValue, { abbreviate: true })} accent="gold" />
        <MetricCard label="Monthly Upkeep" value={formatMoney(totalMonthlyCost)} accent="negative" />
      </div>

      <GameCard title="My Fleet" padding="none">
        {game.player.boats.length === 0 ? (
          <EmptyState icon={<Anchor size={36} />} title="You don't own a boat yet" description="Life on the water starts with your first vessel." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
            {game.player.boats.map((b) => {
              const ownedImage = BOAT_LISTINGS.find((l) => l.id === b.listingId)?.image;
              return (
              <div key={b.id} className="cl-panel p-4">
                <div className="relative h-32 bg-gradient-to-br from-cl-accent/20 to-transparent rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                  {ownedImage ? (
                    <Image src={ownedImage} alt={b.name} fill sizes="320px" className="object-cover" />
                  ) : (
                    <Ship size={36} className="text-cl-text-muted/50" />
                  )}
                </div>
                <p className="font-semibold text-cl-text-primary">{b.name}</p>
                <p className="text-xs text-cl-text-muted mb-2">{BOAT_CATEGORY_LABELS[b.category]} · {b.lengthFt} ft</p>
                <ProgressBar value={b.condition} tone={b.condition > 60 ? 'positive' : 'warning'} label="Condition" showValue className="mb-3" />
                <p className="text-xs text-cl-text-muted mb-3">{formatMoney(b.currentValue)}</p>
                <GameButton
                  size="sm" fullWidth className="mb-2"
                  disabledReason={game.player.cash < Math.round(b.maintenanceMonthly * 0.15 + b.marinaFeeMonthly * 0.1 + b.crewCostMonthly * 0.1) + 200 ? 'Not enough cash' : undefined}
                  onClick={() => takeBoatTrip(b.id)}
                >
                  Take a Trip
                </GameButton>
                <div className="flex gap-2">
                  <GameButton size="sm" variant="secondary" fullWidth onClick={() => sellBoat(b.id)}>Sell</GameButton>
                  <GameButton size="sm" variant="ghost" fullWidth onClick={() => setGiftTarget({ id: b.id, name: b.name, value: b.currentValue })}>Gift</GameButton>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </GameCard>

      {giftTarget && (
        <GiftAssetModal
          open
          onClose={() => setGiftTarget(null)}
          assetType="boat"
          assetId={giftTarget.id}
          assetName={giftTarget.name}
          assetValue={giftTarget.value}
        />
      )}

      <GameCard title="Marina Listings">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {BOAT_LISTINGS.map((listing) => (
            <div key={listing.id} className="cl-panel p-4">
              <div className="relative h-32 bg-gradient-to-br from-cl-accent/20 to-transparent rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                {listing.image ? (
                  <Image src={listing.image} alt={listing.name} fill sizes="320px" className="object-cover" />
                ) : (
                  <Ship size={36} className="text-cl-text-muted/50" />
                )}
              </div>
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-cl-text-primary">{listing.name}</p>
                <StatusBadge label={BOAT_CATEGORY_LABELS[listing.category]} tone="neutral" />
              </div>
              <p className="text-xs text-cl-text-muted mb-2">{listing.lengthFt} ft · {listing.topSpeedKnots} kn{listing.crewRequired > 0 ? ` · ${listing.crewRequired} crew` : ''}</p>
              <p className="text-sm font-semibold text-cl-text-primary mb-1">{formatMoney(listing.price)}</p>
              <p className="text-xs text-cl-text-muted mb-3">
                {formatMoney(listing.maintenanceMonthly + listing.marinaFeeMonthly + listing.crewCostMonthly)}/mo upkeep
              </p>
              <GameButton size="sm" fullWidth disabledReason={game.player.cash < listing.price ? 'Not enough cash' : undefined} onClick={() => buyBoat(listing.id)}>
                Purchase
              </GameButton>
            </div>
          ))}
        </div>
      </GameCard>
    </div>
  );
}
