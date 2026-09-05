import type { UpgradeDefinition } from '@/game/types';
import { formatMoney } from '@/lib/format';
import { GameButton } from '@/components/ui/GameButton';
import { cn } from '@/lib/cn';

interface UpgradeCardProps {
  upgrade: UpgradeDefinition;
  owned: boolean;
  canAfford: boolean;
  meetsPrerequisites: boolean;
  missingPrerequisiteNames: string[];
  businessCash: number;
  onPurchase: () => void;
}

function effectLabel(upgrade: UpgradeDefinition): string[] {
  const labels: string[] = [];
  const { effects } = upgrade;
  if (effects.capacityPct) labels.push(`+${effects.capacityPct}% Kitchen Capacity`);
  if (effects.serviceSpeedPct) labels.push(`+${effects.serviceSpeedPct}% Service Speed`);
  if (effects.qualityPct) labels.push(`+${effects.qualityPct}% Product Quality`);
  if (effects.workloadPct) labels.push(`${effects.workloadPct}% Employee Workload`);
  if (effects.reputationFlat) labels.push(`+${effects.reputationFlat} Reputation`);
  return labels;
}

export function UpgradeCard({ upgrade, owned, canAfford, meetsPrerequisites, missingPrerequisiteNames, businessCash, onPurchase }: UpgradeCardProps) {
  return (
    <div className={cn('cl-panel p-4', owned && '!border-cl-positive/25')}>
      <p className="font-semibold text-cl-text-primary mb-1">{upgrade.name}</p>
      <p className="text-xs text-cl-text-secondary mb-3">{upgrade.description}</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {effectLabel(upgrade).map((label) => (
          <span key={label} className="text-xs px-2 py-0.5 rounded-full bg-cl-positive/10 text-cl-positive border border-cl-positive/20">{label}</span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-cl-text-muted mb-3">
        <span>Cost</span><span className="text-right text-cl-text-primary font-medium">{formatMoney(upgrade.cost)}</span>
        {upgrade.requiresUpgradeIds.length > 0 && (
          <>
            <span>Required Infrastructure</span>
            <span className={cn('text-right font-medium', meetsPrerequisites ? 'text-cl-positive' : 'text-cl-negative')}>
              {meetsPrerequisites ? 'In place' : missingPrerequisiteNames.join(', ')}
            </span>
          </>
        )}
        <span>Available Business Cash</span><span className="text-right text-cl-text-primary font-medium">{formatMoney(businessCash)}</span>
      </div>
      <div className="flex items-center justify-end">
        <GameButton
          size="sm"
          variant="secondary"
          fullWidth
          disabled={owned}
          disabledReason={owned ? 'Already purchased' : !meetsPrerequisites ? `Requires: ${missingPrerequisiteNames.join(', ')}` : !canAfford ? 'Not enough business cash' : undefined}
          onClick={onPurchase}
        >
          {owned ? 'Purchased' : 'Buy'}
        </GameButton>
      </div>
    </div>
  );
}
