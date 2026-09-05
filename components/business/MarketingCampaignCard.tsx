import type { MarketingCampaign } from '@/game/types';
import { CAMPAIGN_DEFAULTS } from '@/game/constants/balance';
import { formatMoney, formatPercent } from '@/lib/format';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';

export function MarketingCampaignCard({ campaign, dayIndex }: { campaign: MarketingCampaign; dayIndex: number }) {
  const def = CAMPAIGN_DEFAULTS[campaign.type];
  const elapsedDays = Math.max(0, dayIndex - campaign.startedAt);
  const progress = Math.min(100, (elapsedDays / campaign.durationDays) * 100);
  const roi = campaign.cost > 0 ? ((campaign.revenueAttributed - campaign.cost) / campaign.cost) * 100 : 0;

  return (
    <div className="cl-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-cl-text-primary">{def.label}</p>
        <StatusBadge label={campaign.status === 'active' ? 'Active' : 'Completed'} tone={campaign.status === 'active' ? 'info' : 'neutral'} />
      </div>

      {campaign.status === 'active' && <ProgressBar value={progress} tone="accent" label={`Day ${elapsedDays} of ${campaign.durationDays}`} showValue className="mb-3" />}

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-cl-text-muted mb-0.5">Spend</p>
          <p className="text-cl-text-primary font-medium">{formatMoney(campaign.cost)}</p>
        </div>
        <div>
          <p className="text-cl-text-muted mb-0.5">Customers Gained</p>
          <p className="text-cl-text-primary font-medium">{Math.round(campaign.customersGained)}</p>
        </div>
        <div>
          <p className="text-cl-text-muted mb-0.5">Revenue Attributed</p>
          <p className="text-cl-text-primary font-medium">{formatMoney(Math.round(campaign.revenueAttributed))}</p>
        </div>
        <div>
          <p className="text-cl-text-muted mb-0.5">ROI</p>
          <p className={roi >= 0 ? 'text-cl-positive font-medium' : 'text-cl-negative font-medium'}>{formatPercent(roi, { showSign: true, decimals: 0 })}</p>
        </div>
      </div>
    </div>
  );
}
