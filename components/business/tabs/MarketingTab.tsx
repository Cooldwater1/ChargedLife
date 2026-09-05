'use client';

import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { CAMPAIGN_DEFAULTS } from '@/game/constants/balance';
import type { Business, CampaignType } from '@/game/types';
import { formatMoney } from '@/lib/format';
import { GameCard } from '@/components/ui/GameCard';
import { GameButton } from '@/components/ui/GameButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { MarketingCampaignCard } from '@/components/business/MarketingCampaignCard';

const CAMPAIGN_TYPES: CampaignType[] = ['social_media', 'search_ads', 'local_ads', 'influencer'];

export function MarketingTab({ business, dayIndex }: { business: Business; dayIndex: number }) {
  const launchCampaign = useGameStore((s) => s.launchMarketingCampaign);
  const [targetLocation, setTargetLocation] = useState<string | 'all'>('all');

  const activeCampaigns = business.marketingCampaigns.filter((c) => c.status === 'active');
  const completedCampaigns = [...business.marketingCampaigns.filter((c) => c.status === 'completed')].sort((a, b) => b.startedAt - a.startedAt);

  return (
    <div className="space-y-6">
      <GameCard title="Active Campaigns" icon={<Megaphone size={16} />}>
        {activeCampaigns.length === 0 ? (
          <EmptyState icon={<Megaphone size={32} />} title="No campaigns are currently active" description="Marketing can increase customer demand. Launch a campaign below." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeCampaigns.map((c) => <MarketingCampaignCard key={c.id} campaign={c} dayIndex={dayIndex} />)}
          </div>
        )}
      </GameCard>

      <GameCard title="Launch a Campaign" subtitle="Choose a campaign type and target location">
        {business.locations.length > 1 && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Target Location</label>
            <Select
              className="w-56"
              value={targetLocation}
              onChange={setTargetLocation}
              options={[
                { value: 'all', label: 'All Locations' },
                ...business.locations.map((l) => ({ value: l.id, label: l.name })),
              ]}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {CAMPAIGN_TYPES.map((type) => {
            const def = CAMPAIGN_DEFAULTS[type];
            return (
              <div key={type} className="cl-panel p-4 flex flex-col">
                <p className="font-semibold text-cl-text-primary mb-1">{def.label}</p>
                <p className="text-xs text-cl-text-secondary mb-3 flex-1">
                  Estimated reach boost of ~{Math.round(def.reachMultiplier * 100)}% for {def.durationDays} days. Results vary ±{Math.round(def.riskVariance * 100)}%.
                </p>
                <p className="text-sm font-semibold text-cl-text-primary mb-3">{formatMoney(def.baseCost)}</p>
                <GameButton
                  size="sm"
                  fullWidth
                  disabledReason={business.cash < def.baseCost ? 'Not enough business cash' : undefined}
                  onClick={() => launchCampaign(business.id, targetLocation, type)}
                >
                  Launch
                </GameButton>
              </div>
            );
          })}
        </div>
      </GameCard>

      {completedCampaigns.length > 0 && (
        <GameCard title="Campaign History">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {completedCampaigns.slice(0, 6).map((c) => <MarketingCampaignCard key={c.id} campaign={c} dayIndex={dayIndex} />)}
          </div>
        </GameCard>
      )}
    </div>
  );
}
