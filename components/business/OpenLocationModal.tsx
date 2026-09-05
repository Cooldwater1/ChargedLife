'use client';

import { useState } from 'react';
import { CITY_DEFINITIONS } from '@/game/constants/data';
import { RECOMMENDED_BUSINESS_STARTUP_COST } from '@/game/constants/balance';
import { useGameStore } from '@/game/state/store';
import type { Business } from '@/game/types';
import { formatMoney } from '@/lib/format';
import { GameModal } from '@/components/ui/GameModal';
import { GameButton } from '@/components/ui/GameButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';

const COMPETITION_TONE = { low: 'success', medium: 'warning', high: 'danger' } as const;

export function OpenLocationModal({ open, onClose, business }: { open: boolean; onClose: () => void; business: Business }) {
  const [city, setCity] = useState(CITY_DEFINITIONS.find((c) => !business.locations.some((l) => l.city === c.city))?.city ?? CITY_DEFINITIONS[0].city);
  const [investment, setInvestment] = useState(RECOMMENDED_BUSINESS_STARTUP_COST);
  const openNewLocation = useGameStore((s) => s.openNewLocation);

  const handleConfirm = () => {
    openNewLocation(business.id, city, investment);
    onClose();
  };

  return (
    <GameModal
      open={open}
      onClose={onClose}
      title="Open New Location"
      subtitle={`Expand ${business.name} into a new city`}
      size="lg"
      footer={<GameButton onClick={handleConfirm} disabledReason={business.cash < investment ? 'Not enough business cash' : undefined}>Open Location</GameButton>}
    >
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">City</label>
          <div className="grid grid-cols-2 gap-2">
            {CITY_DEFINITIONS.map((c) => (
              <button
                key={c.city}
                onClick={() => setCity(c.city)}
                className={cn(
                  'text-left rounded-lg border px-3 py-2.5 transition-colors',
                  city === c.city ? 'border-cl-accent bg-cl-accent/10' : 'border-cl-border-strong bg-white/[0.03] hover:bg-white/[0.06]',
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-cl-text-primary">{c.city}</p>
                  <StatusBadge label={c.competition} tone={COMPETITION_TONE[c.competition]} />
                </div>
                <p className="text-xs text-cl-text-muted mt-1">{c.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-cl-text-secondary uppercase tracking-wide">Investment (from business cash)</label>
            <span className="text-sm font-semibold text-cl-text-primary">{formatMoney(investment)}</span>
          </div>
          <input
            type="range"
            min={30_000}
            max={Math.max(business.cash, RECOMMENDED_BUSINESS_STARTUP_COST * 2)}
            step={1000}
            value={investment}
            onChange={(e) => setInvestment(Number(e.target.value))}
            className="w-full accent-cl-accent"
          />
          <p className="text-xs text-cl-text-muted mt-2">Available business cash: {formatMoney(business.cash)}</p>
        </div>
      </div>
    </GameModal>
  );
}
