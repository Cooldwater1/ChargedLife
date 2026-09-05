'use client';

import { AlertTriangle } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { calculateDivorceSettlement } from '@/game/simulation/divorce';
import { formatMoney } from '@/lib/format';
import { GameModal } from '@/components/ui/GameModal';
import { GameButton } from '@/components/ui/GameButton';
import { DIVORCE_LEGAL_FEE } from '@/game/constants/balance';

export function DivorceConfirmModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const game = useGameStore((s) => s.game);
  if (!game) return null;

  const settlement = calculateDivorceSettlement(game);
  const partner = game.player.family.find((f) => f.id === game.player.relationship.partnerId);
  const totalCost = DIVORCE_LEGAL_FEE + settlement.estimatedAssetTransfer;

  return (
    <GameModal
      open
      onClose={onClose}
      title="Confirm Divorce"
      subtitle={partner ? `Ending your marriage to ${partner.name}` : undefined}
      footer={
        <>
          <GameButton variant="secondary" onClick={onClose}>Cancel</GameButton>
          <GameButton variant="danger" onClick={onConfirm}>Confirm Divorce</GameButton>
        </>
      }
    >
      <div className="flex items-start gap-3 mb-5 cl-panel p-3 border-cl-negative/30">
        <AlertTriangle size={18} className="text-cl-negative shrink-0 mt-0.5" />
        <p className="text-sm text-cl-text-secondary">This cannot be undone. Review the estimated settlement below before confirming.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
        <div><p className="text-xs text-cl-text-muted mb-0.5">Marriage Length</p><p className="text-cl-text-primary font-medium">{Math.round(settlement.marriageLengthDays / 365 * 10) / 10} years</p></div>
        <div><p className="text-xs text-cl-text-muted mb-0.5">Prenup on File</p><p className="text-cl-text-primary font-medium capitalize">{game.player.relationship.prenup ?? 'None'}</p></div>
        <div><p className="text-xs text-cl-text-muted mb-0.5">Shared Property Value</p><p className="text-cl-text-primary font-medium">{formatMoney(settlement.sharedPropertyValue)}</p></div>
        <div><p className="text-xs text-cl-text-muted mb-0.5">Shared Investment Value</p><p className="text-cl-text-primary font-medium">{formatMoney(settlement.sharedInvestmentValue)}</p></div>
        <div><p className="text-xs text-cl-text-muted mb-0.5">Primary Home</p><p className="text-cl-text-primary font-medium">{settlement.primaryHomeToPartner ? 'Stays with your ex-spouse' : 'Stays with you'}</p></div>
        <div><p className="text-xs text-cl-text-muted mb-0.5">Monthly Child Support</p><p className="text-cl-text-primary font-medium">{settlement.monthlyChildSupport > 0 ? `${formatMoney(settlement.monthlyChildSupport)}/mo` : 'N/A'}</p></div>
      </div>

      <div className="cl-panel p-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-cl-text-secondary">Legal Fees</span>
          <span className="text-cl-negative font-medium">-{formatMoney(DIVORCE_LEGAL_FEE)}</span>
        </div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-cl-text-secondary">Estimated Asset Transfer</span>
          <span className="text-cl-negative font-medium">-{formatMoney(settlement.estimatedAssetTransfer)}</span>
        </div>
        <div className="flex items-center justify-between text-sm pt-2 border-t border-cl-border">
          <span className="text-cl-text-primary font-medium">Total Cost Today</span>
          <span className="text-cl-negative font-semibold">-{formatMoney(totalCost)}</span>
        </div>
      </div>
    </GameModal>
  );
}
