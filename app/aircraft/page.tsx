'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plane } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { AIRCRAFT_CATEGORY_LABELS, AIRCRAFT_LISTINGS } from '@/game/constants/aircraft';
import { formatMoney } from '@/lib/format';
import { GameCard } from '@/components/ui/GameCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { GameButton } from '@/components/ui/GameButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { GiftAssetModal } from '@/components/assets/GiftAssetModal';

export default function AircraftPage() {
  const game = useGameStore((s) => s.game);
  const buyAircraft = useGameStore((s) => s.buyAircraft);
  const sellAircraft = useGameStore((s) => s.sellAircraft);
  const flyAircraft = useGameStore((s) => s.flyAircraft);
  const [giftTarget, setGiftTarget] = useState<{ id: string; name: string; value: number } | null>(null);

  if (!game) return null;

  const totalValue = game.player.aircraft.reduce((s, a) => s + a.currentValue, 0);
  const totalMonthlyCost = game.player.aircraft.reduce((s, a) => s + a.operatingCostMonthly + a.crewCostMonthly + a.hangarCostMonthly, 0);

  return (
    <div className="space-y-6 cl-animate-in">
      <div className="cl-panel p-6 bg-gradient-to-br from-cl-accent/[0.08] via-transparent to-transparent">
        <h1 className="text-2xl font-bold text-cl-text-primary tracking-tight">Aircraft</h1>
        <p className="text-sm text-cl-text-secondary mt-1">Private aviation — the ultimate late-game luxury.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard label="Aircraft Owned" value={game.player.aircraft.length} icon={<Plane size={16} />} />
        <MetricCard label="Fleet Value" value={formatMoney(totalValue, { abbreviate: true })} accent="gold" />
        <MetricCard label="Monthly Upkeep" value={formatMoney(totalMonthlyCost)} accent="negative" />
      </div>

      <GameCard title="My Fleet" padding="none">
        {game.player.aircraft.length === 0 ? (
          <EmptyState icon={<Plane size={36} />} title="You don't own an aircraft yet" description="Private aviation awaits — browse hangar listings below." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
            {game.player.aircraft.map((a) => {
              const ownedImage = AIRCRAFT_LISTINGS.find((l) => l.id === a.listingId)?.image;
              return (
              <div key={a.id} className="cl-panel p-4">
                <div className="relative h-32 bg-gradient-to-br from-cl-accent/20 to-transparent rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                  {ownedImage ? (
                    <Image src={ownedImage} alt={a.name} fill sizes="320px" className="object-cover" />
                  ) : (
                    <Plane size={36} className="text-cl-text-muted/50" />
                  )}
                </div>
                <p className="font-semibold text-cl-text-primary">{a.name}</p>
                <p className="text-xs text-cl-text-muted mb-2">{AIRCRAFT_CATEGORY_LABELS[a.category]}</p>
                <ProgressBar value={a.condition} tone={a.condition > 60 ? 'positive' : 'warning'} label="Condition" showValue className="mb-3" />
                <p className="text-xs text-cl-text-muted mb-3">{formatMoney(a.currentValue)}</p>
                <GameButton
                  size="sm" fullWidth className="mb-2"
                  disabledReason={game.player.cash < Math.round(a.operatingCostMonthly * 0.2 + a.crewCostMonthly * 0.1) + 500 ? 'Not enough cash' : undefined}
                  onClick={() => flyAircraft(a.id)}
                >
                  Fly Somewhere
                </GameButton>
                <div className="flex gap-2">
                  <GameButton size="sm" variant="secondary" fullWidth onClick={() => sellAircraft(a.id)}>Sell</GameButton>
                  <GameButton size="sm" variant="ghost" fullWidth onClick={() => setGiftTarget({ id: a.id, name: a.name, value: a.currentValue })}>Gift</GameButton>
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
          assetType="aircraft"
          assetId={giftTarget.id}
          assetName={giftTarget.name}
          assetValue={giftTarget.value}
        />
      )}

      <GameCard title="Hangar Listings">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {AIRCRAFT_LISTINGS.map((listing) => (
            <div key={listing.id} className="cl-panel p-4">
              <div className="relative h-32 bg-gradient-to-br from-cl-accent/20 to-transparent rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                {listing.image ? (
                  <Image src={listing.image} alt={listing.name} fill sizes="320px" className="object-cover" />
                ) : (
                  <Plane size={36} className="text-cl-text-muted/50" />
                )}
              </div>
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-cl-text-primary">{listing.name}</p>
                <StatusBadge label={AIRCRAFT_CATEGORY_LABELS[listing.category]} tone="neutral" />
              </div>
              <p className="text-xs text-cl-text-muted mb-2">{listing.rangeMiles.toLocaleString('en-US')} mi range · {listing.passengers} pax</p>
              <p className="text-sm font-semibold text-cl-text-primary mb-1">{formatMoney(listing.price)}</p>
              <p className="text-xs text-cl-text-muted mb-3">
                {formatMoney(listing.operatingCostMonthly + listing.crewCostMonthly + listing.hangarCostMonthly)}/mo upkeep
              </p>
              <GameButton size="sm" fullWidth disabledReason={game.player.cash < listing.price ? 'Not enough cash' : undefined} onClick={() => buyAircraft(listing.id)}>
                Purchase
              </GameButton>
            </div>
          ))}
        </div>
      </GameCard>
    </div>
  );
}
