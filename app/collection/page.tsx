'use client';

import Image from 'next/image';
import { Car, Gem, Plane, Ship, Watch } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { LUXURY_CATEGORY_LABELS, LUXURY_LISTINGS } from '@/game/constants/luxury';
import { calculateCollectionValue } from '@/game/simulation/networth';
import { formatMoney, formatPercent } from '@/lib/format';
import { useState } from 'react';
import { GameCard } from '@/components/ui/GameCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { GameButton } from '@/components/ui/GameButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GiftAssetModal } from '@/components/assets/GiftAssetModal';

export default function CollectionPage() {
  const game = useGameStore((s) => s.game);
  const buyLuxuryItem = useGameStore((s) => s.buyLuxuryItem);
  const sellLuxuryItem = useGameStore((s) => s.sellLuxuryItem);
  const [giftTarget, setGiftTarget] = useState<{ id: string; name: string; value: number } | null>(null);

  if (!game) return null;

  const collectionValue = calculateCollectionValue(game);
  const totalItems = game.player.vehicles.length + game.player.boats.length + game.player.aircraft.length + game.player.luxuryItems.length;

  return (
    <div className="space-y-6 cl-animate-in">
      <div className="cl-panel p-6 bg-gradient-to-br from-cl-gold/[0.1] via-transparent to-transparent">
        <h1 className="text-2xl font-bold text-cl-text-primary tracking-tight">Collection</h1>
        <p className="text-sm text-cl-text-secondary mt-1">Everything you own that isn&apos;t a business or a home.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard label="Items Owned" value={totalItems} icon={<Gem size={16} />} />
        <MetricCard label="Total Collection Value" value={formatMoney(collectionValue, { abbreviate: true })} accent="gold" />
        <MetricCard label="Luxury Items" value={game.player.luxuryItems.length} icon={<Watch size={16} />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GameCard title="Vehicles" icon={<Car size={16} />} subtitle={`${game.player.vehicles.length} owned`}>
          {game.player.vehicles.length === 0 ? <p className="text-sm text-cl-text-muted">None yet.</p> : (
            <div className="space-y-2">{game.player.vehicles.map((v) => (
              <div key={v.id} className="flex items-center justify-between text-sm">
                <span className="text-cl-text-primary">{v.brand} {v.model}</span>
                <span className="text-cl-text-muted">{formatMoney(v.currentValue)}</span>
              </div>
            ))}</div>
          )}
        </GameCard>

        <GameCard title="Boats" icon={<Ship size={16} />} subtitle={`${game.player.boats.length} owned`}>
          {game.player.boats.length === 0 ? <p className="text-sm text-cl-text-muted">None yet.</p> : (
            <div className="space-y-2">{game.player.boats.map((b) => (
              <div key={b.id} className="flex items-center justify-between text-sm">
                <span className="text-cl-text-primary">{b.name}</span>
                <span className="text-cl-text-muted">{formatMoney(b.currentValue)}</span>
              </div>
            ))}</div>
          )}
        </GameCard>

        <GameCard title="Aircraft" icon={<Plane size={16} />} subtitle={`${game.player.aircraft.length} owned`}>
          {game.player.aircraft.length === 0 ? <p className="text-sm text-cl-text-muted">None yet.</p> : (
            <div className="space-y-2">{game.player.aircraft.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span className="text-cl-text-primary">{a.name}</span>
                <span className="text-cl-text-muted">{formatMoney(a.currentValue)}</span>
              </div>
            ))}</div>
          )}
        </GameCard>

        <GameCard title="Luxury Items" icon={<Watch size={16} />} subtitle={`${game.player.luxuryItems.length} owned`}>
          {game.player.luxuryItems.length === 0 ? <p className="text-sm text-cl-text-muted">None yet.</p> : (
            <div className="space-y-2">{game.player.luxuryItems.map((l) => (
              <div key={l.id} className="flex items-center justify-between text-sm">
                <span className="text-cl-text-primary">{l.name}</span>
                <span className="text-cl-text-muted">{formatMoney(l.currentValue)}</span>
              </div>
            ))}</div>
          )}
        </GameCard>
      </div>

      <GameCard title="My Luxury Items" padding="none">
        {game.player.luxuryItems.length === 0 ? (
          <EmptyState icon={<Gem size={32} />} title="No luxury items yet" description="Watches, jewelry, and rare collectibles appear here once purchased." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
            {game.player.luxuryItems.map((item) => {
              const ownedImage = LUXURY_LISTINGS.find((l) => l.id === item.listingId)?.image;
              return (
              <div key={item.id} className="cl-panel p-4">
                <div className="relative h-28 bg-gradient-to-br from-cl-gold/20 to-transparent rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                  {ownedImage ? (
                    <Image src={ownedImage} alt={item.name} fill sizes="320px" className="object-cover" />
                  ) : (
                    <Watch size={30} className="text-cl-text-muted/50" />
                  )}
                </div>
                <p className="font-semibold text-cl-text-primary">{item.name}</p>
                <p className="text-xs text-cl-text-muted mb-2">{item.brand} · {LUXURY_CATEGORY_LABELS[item.category]}</p>
                <p className="text-sm text-cl-gold font-medium mb-3">{formatMoney(item.currentValue)}</p>
                <div className="flex gap-2">
                  <GameButton size="sm" variant="secondary" fullWidth onClick={() => sellLuxuryItem(item.id)}>Sell</GameButton>
                  <GameButton size="sm" variant="ghost" fullWidth onClick={() => setGiftTarget({ id: item.id, name: item.name, value: item.currentValue })}>Gift</GameButton>
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
          assetType="luxury"
          assetId={giftTarget.id}
          assetName={giftTarget.name}
          assetValue={giftTarget.value}
        />
      )}

      <GameCard title="Boutique" subtitle="Watches, jewelry, and rare collectibles">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {LUXURY_LISTINGS.map((listing) => (
            <div key={listing.id} className="cl-panel p-4">
              <div className="relative h-28 bg-gradient-to-br from-cl-gold/20 to-transparent rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                {listing.image ? (
                  <Image src={listing.image} alt={listing.name} fill sizes="320px" className="object-cover" />
                ) : (
                  <Watch size={30} className="text-cl-text-muted/50" />
                )}
              </div>
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-cl-text-primary">{listing.name}</p>
                <StatusBadge label={LUXURY_CATEGORY_LABELS[listing.category]} tone="neutral" />
              </div>
              <p className="text-xs text-cl-text-muted mb-2">{listing.brand}</p>
              <p className="text-sm font-semibold text-cl-text-primary mb-1">{formatMoney(listing.price)}</p>
              <p className="text-xs text-cl-text-muted mb-3">
                {listing.appreciationAnnual > 0 ? `Tends to appreciate ~${formatPercent(listing.appreciationAnnual * 100, { decimals: 1 })}/yr` : 'Holds its value'}
              </p>
              <GameButton size="sm" fullWidth disabledReason={game.player.cash < listing.price ? 'Not enough cash' : undefined} onClick={() => buyLuxuryItem(listing.id)}>
                Purchase
              </GameButton>
            </div>
          ))}
        </div>
      </GameCard>
    </div>
  );
}
