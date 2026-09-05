'use client';

import { Building2, MapPin, Users2 } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { HEADQUARTERS_TIERS } from '@/game/constants/balance';
import { MANAGER_ROLE_LABELS as ROLE_LABELS } from '@/game/constants/data';
import { CORPORATE_MANAGER_ROLES, type Business } from '@/game/types';
import { formatMoney } from '@/lib/format';
import { GameCard } from '@/components/ui/GameCard';
import { GameButton } from '@/components/ui/GameButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { HelpTip } from '@/components/ui/HelpTip';

export function HeadquartersTab({ business }: { business: Business }) {
  const rentHeadquarters = useGameStore((s) => s.rentHeadquarters);
  const buyHeadquarters = useGameStore((s) => s.buyHeadquarters);

  const corporateManagers = business.managers.filter((m) => CORPORATE_MANAGER_ROLES.includes(m.role));
  const hq = business.headquarters;

  return (
    <div className="space-y-6">
      <GameCard
        title="Headquarters"
        icon={<Building2 size={16} />}
        subtitle={hq ? `${hq.tier.replace('_', ' ')} — ${hq.ownership === 'owned' ? 'Owned' : 'Rented'}` : 'No corporate office'}
        action={<HelpTip text="Your CFO, CMO, COO, and CEO need a real office to work from — no headquarters, no C-suite, regardless of business level. Rent for a predictable monthly cost, or buy outright for a large one-time price plus lower ongoing upkeep." />}
      >
        {hq ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="cl-panel p-3 text-center">
              <p className="text-xs text-cl-text-muted mb-1">Capacity</p>
              <p className="text-sm font-semibold text-cl-text-primary">{corporateManagers.length} / {hq.capacity}</p>
            </div>
            <div className="cl-panel p-3 text-center">
              <p className="text-xs text-cl-text-muted mb-1">Monthly Cost</p>
              <p className="text-sm font-semibold text-cl-negative">{formatMoney(hq.monthlyCost)}</p>
            </div>
            <div className="cl-panel p-3 text-center">
              <p className="text-xs text-cl-text-muted mb-1">Ownership</p>
              <p className="text-sm font-semibold text-cl-text-primary">{hq.ownership === 'owned' ? 'Owned' : 'Rented'}</p>
            </div>
            <div className="cl-panel p-3 text-center">
              <p className="text-xs text-cl-text-muted mb-1">Acquired</p>
              <p className="text-sm font-semibold text-cl-text-primary">Day {hq.acquiredAt}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-cl-text-muted">This business has no headquarters yet. Rent or buy one below to unlock corporate executives (CFO, CMO, COO, CEO).</p>
        )}
      </GameCard>

      {corporateManagers.length > 0 && (
        <GameCard title="Corporate Employees" icon={<Users2 size={16} />} subtitle={`${corporateManagers.length} working out of this office`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {corporateManagers.map((m) => (
              <div key={m.id} className="cl-panel p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cl-text-primary">{m.name}</p>
                  <p className="text-xs text-cl-text-muted">{formatMoney(m.salary)}/yr</p>
                </div>
                <StatusBadge label={ROLE_LABELS[m.role]} tone="gold" />
              </div>
            ))}
          </div>
        </GameCard>
      )}

      <GameCard title="Available Offices" icon={<MapPin size={16} />} subtitle="Rent for ongoing flexibility, or buy outright for lower long-term cost">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HEADQUARTERS_TIERS.map((tierDef) => {
            const isCurrent = hq?.tier === tierDef.id;
            const tooSmall = corporateManagers.length > tierDef.capacity;
            return (
              <div key={tierDef.id} className="cl-panel p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-cl-text-primary">{tierDef.name}</p>
                  {isCurrent && <StatusBadge label="Current" tone="info" />}
                </div>
                <p className="text-xs text-cl-text-muted mb-3">Capacity: {tierDef.capacity} corporate roles</p>
                <div className="space-y-2 mb-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-cl-text-secondary">Rent</span>
                    <span className="text-cl-text-primary font-medium">{formatMoney(tierDef.monthlyRent)}/mo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cl-text-secondary">Buy</span>
                    <span className="text-cl-text-primary font-medium">{formatMoney(tierDef.purchasePrice)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cl-text-secondary">Owned upkeep</span>
                    <span className="text-cl-text-primary font-medium">{formatMoney(tierDef.monthlyCostWhenOwned)}/mo</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <GameButton
                    size="sm" variant="secondary" fullWidth
                    disabledReason={tooSmall ? `Only fits ${tierDef.capacity} — you have ${corporateManagers.length}` : isCurrent && hq?.ownership === 'rented' ? 'Already leased' : undefined}
                    onClick={() => rentHeadquarters(business.id, tierDef.id)}
                  >
                    Rent
                  </GameButton>
                  <GameButton
                    size="sm" fullWidth
                    disabledReason={tooSmall ? `Only fits ${tierDef.capacity} — you have ${corporateManagers.length}` : business.cash < tierDef.purchasePrice ? 'Not enough business cash' : isCurrent && hq?.ownership === 'owned' ? 'Already owned' : undefined}
                    onClick={() => buyHeadquarters(business.id, tierDef.id)}
                  >
                    Buy
                  </GameButton>
                </div>
              </div>
            );
          })}
        </div>
      </GameCard>
    </div>
  );
}
