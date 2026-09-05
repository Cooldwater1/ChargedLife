'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Car, Gauge, Zap } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { VEHICLE_CATEGORY_LABELS, VEHICLE_LISTINGS } from '@/game/constants/vehicles';
import { VEHICLE_DOWNPAYMENT_PCT } from '@/game/constants/balance';
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

export default function VehiclesPage() {
  const game = useGameStore((s) => s.game);
  const buyVehicle = useGameStore((s) => s.buyVehicle);
  const sellVehicle = useGameStore((s) => s.sellVehicle);
  const [financeMode, setFinanceMode] = useState<Record<string, boolean>>({});
  const [giftTarget, setGiftTarget] = useState<{ id: string; name: string; value: number } | null>(null);

  if (!game) return null;

  const totalValue = game.player.vehicles.reduce((s, v) => s + v.currentValue, 0);
  const totalMonthlyCost = game.player.vehicles.reduce((s, v) => s + v.insuranceMonthly + v.maintenanceMonthly, 0);

  return (
    <div className="space-y-6 cl-animate-in">
      <PageHero image={PAGE_BACKGROUND.vehicles}>
        <h1 className="text-2xl font-bold text-cl-text-primary tracking-tight">Vehicles</h1>
        <p className="text-sm text-cl-text-secondary mt-1">Build your dream garage — from economy runabouts to hypercars.</p>
      </PageHero>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard label="Vehicles Owned" value={game.player.vehicles.length} icon={<Car size={16} />} />
        <MetricCard label="Garage Value" value={formatMoney(totalValue, { abbreviate: true })} accent="gold" />
        <MetricCard label="Monthly Upkeep" value={formatMoney(totalMonthlyCost)} accent="negative" />
      </div>

      <GameCard title="My Garage" padding="none">
        {game.player.vehicles.length === 0 ? (
          <EmptyState icon={<Car size={36} />} title="You don't own a vehicle yet" description="Your dream garage starts somewhere — browse the dealership below." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
            {game.player.vehicles.map((v) => {
              const ownedImage = VEHICLE_LISTINGS.find((l) => l.id === v.listingId)?.image;
              return (
              <div key={v.id} className="cl-panel p-4">
                <div className="relative h-32 bg-gradient-to-br from-cl-accent/20 to-transparent rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                  {ownedImage ? (
                    <Image src={ownedImage} alt={`${v.brand} ${v.model}`} fill sizes="320px" className="object-cover" />
                  ) : (
                    <Car size={36} className="text-cl-text-muted/50" />
                  )}
                </div>
                <p className="font-semibold text-cl-text-primary">{v.brand} {v.model}</p>
                <p className="text-xs text-cl-text-muted mb-2">{v.year} · {VEHICLE_CATEGORY_LABELS[v.category]}</p>
                <ProgressBar value={v.condition} tone={v.condition > 60 ? 'positive' : 'warning'} label="Condition" showValue className="mb-2" />
                <div className="flex items-center justify-between text-xs text-cl-text-muted mb-3">
                  <span>{v.mileage.toLocaleString('en-US')} mi</span>
                  <span>{formatMoney(v.currentValue)}</span>
                </div>
                <div className="flex gap-2">
                  <GameButton size="sm" variant="secondary" fullWidth onClick={() => sellVehicle(v.id)}>Sell</GameButton>
                  <GameButton size="sm" variant="ghost" fullWidth onClick={() => setGiftTarget({ id: v.id, name: `${v.brand} ${v.model}`, value: v.currentValue })}>Gift</GameButton>
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
          assetType="vehicle"
          assetId={giftTarget.id}
          assetName={giftTarget.name}
          assetValue={giftTarget.value}
        />
      )}

      <GameCard title="Dealership" subtitle="Cash or financed with an auto loan (20% down)">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {VEHICLE_LISTINGS.map((listing) => {
            const financed = financeMode[listing.id] ?? false;
            const cost = financed ? Math.round(listing.price * VEHICLE_DOWNPAYMENT_PCT) : listing.price;
            return (
              <div key={listing.id} className="cl-panel p-4">
                <div className="relative h-32 bg-gradient-to-br from-cl-accent/20 to-transparent rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                  {listing.image ? (
                    <Image src={listing.image} alt={`${listing.brand} ${listing.model}`} fill sizes="320px" className="object-cover" />
                  ) : (
                    <Car size={36} className="text-cl-text-muted/50" />
                  )}
                </div>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-cl-text-primary">{listing.brand} {listing.model}</p>
                  <StatusBadge label={VEHICLE_CATEGORY_LABELS[listing.category]} tone="neutral" />
                </div>
                <div className="flex items-center gap-3 text-xs text-cl-text-muted mb-3">
                  <span className="flex items-center gap-1"><Gauge size={12} /> {listing.topSpeedMph} mph</span>
                  <span className="flex items-center gap-1"><Zap size={12} /> {listing.horsepower} hp</span>
                </div>
                <p className="text-sm font-semibold text-cl-text-primary mb-2">{formatMoney(listing.price)}</p>
                <label className="flex items-center gap-2 text-xs text-cl-text-secondary mb-3">
                  <input type="checkbox" checked={financed} onChange={(e) => setFinanceMode((prev) => ({ ...prev, [listing.id]: e.target.checked }))} className="accent-cl-accent" />
                  Finance with auto loan
                </label>
                <GameButton
                  size="sm"
                  fullWidth
                  disabledReason={game.player.cash < cost ? `Need ${formatMoney(cost)}` : undefined}
                  onClick={() => buyVehicle(listing.id, financed)}
                >
                  {financed ? `Finance — ${formatMoney(cost)} down` : `Buy — ${formatMoney(cost)}`}
                </GameButton>
              </div>
            );
          })}
        </div>
      </GameCard>
    </div>
  );
}
