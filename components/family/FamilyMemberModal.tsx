'use client';

import { useState } from 'react';
import { CheckCircle2, Gift, Home, Landmark, User } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { getRelationshipLabel } from '@/game/simulation/family';
import { PERSONALITY_LABELS } from '@/game/constants/family';
import { formatDateLong } from '@/lib/format';
import { toCalendarDate } from '@/game/time/calendar';
import { formatMoney } from '@/lib/format';
import type { FamilyMember } from '@/game/types';
import { GameModal } from '@/components/ui/GameModal';
import { GameButton } from '@/components/ui/GameButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';

const ROLE_LABELS: Record<string, string> = {
  mother: 'Mother', father: 'Father', grandmother: 'Grandmother', grandfather: 'Grandfather', partner: 'Partner', child: 'Child',
};

export function FamilyMemberModal({ member, onClose, onOpenRelative }: { member: FamilyMember; onClose: () => void; onOpenRelative: (id: string) => void }) {
  const game = useGameStore((s) => s.game);
  const buyAssetForFamily = useGameStore((s) => s.buyAssetForFamily);
  const payOffFamilyDebt = useGameStore((s) => s.payOffFamilyDebt);
  const viewFamilyMemberProfile = useGameStore((s) => s.viewFamilyMemberProfile);
  const [amount, setAmount] = useState('50000');
  const [confirmingDebtPayoff, setConfirmingDebtPayoff] = useState(false);
  const [debtJustPaid, setDebtJustPaid] = useState(false);

  if (!game) return null;
  const netWorthEstimate = member.cash - member.debt; // lightweight NPC finances — no owned-asset ledger, so cash minus debt is the honest estimate
  const dailyExpensesEstimate = Math.round((member.annualIncome * 0.6) / 365);
  const parents = game.player.family.filter((f) => member.parentIds.includes(f.id));
  const canViewGrandparents = (member.role === 'mother' || member.role === 'father') && member.parentIds.length === 0;

  return (
    <GameModal open onClose={onClose} title={member.name} subtitle={ROLE_LABELS[member.role] ?? member.role} size="lg">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cl-accent/30 to-cl-gold/20 flex items-center justify-center shrink-0">
          <User size={28} className="text-cl-text-secondary" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap gap-2 mb-2">
            {member.traits.map((t) => <StatusBadge key={t} label={PERSONALITY_LABELS[t]} tone="neutral" />)}
            {member.deceased && <StatusBadge label="Deceased" tone="danger" />}
          </div>
          <ProgressBar value={member.relationship} tone="accent" label={getRelationshipLabel(member.relationship)} showValue />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5 text-sm">
        <div><p className="text-xs text-cl-text-muted mb-0.5">Age</p><p className="text-cl-text-primary font-medium">{member.age}</p></div>
        <div><p className="text-xs text-cl-text-muted mb-0.5">Occupation</p><p className="text-cl-text-primary font-medium">{member.retired ? 'Retired' : member.occupation}</p></div>
        <div><p className="text-xs text-cl-text-muted mb-0.5">City</p><p className="text-cl-text-primary font-medium">{member.city}</p></div>
        <div><p className="text-xs text-cl-text-muted mb-0.5">Annual Income</p><p className="text-cl-text-primary font-medium">{formatMoney(member.annualIncome)}</p></div>
        <div><p className="text-xs text-cl-text-muted mb-0.5">Cash</p><p className="text-cl-text-primary font-medium">{formatMoney(member.cash)}</p></div>
        <div><p className="text-xs text-cl-text-muted mb-0.5">Debt</p><p className={member.debt > 0 ? 'text-cl-negative font-medium' : 'text-cl-text-primary font-medium'}>{formatMoney(member.debt)}</p></div>
        <div><p className="text-xs text-cl-text-muted mb-0.5">Net Worth Est.</p><p className="text-cl-text-primary font-medium">{formatMoney(netWorthEstimate)}</p></div>
        <div><p className="text-xs text-cl-text-muted mb-0.5">Daily Expenses Est.</p><p className="text-cl-text-primary font-medium">{formatMoney(dailyExpensesEstimate)}/day</p></div>
        <div><p className="text-xs text-cl-text-muted mb-0.5">Home</p><p className="text-cl-text-primary font-medium">{member.homeDescription}</p></div>
        <div><p className="text-xs text-cl-text-muted mb-0.5">Vehicle</p><p className="text-cl-text-primary font-medium">{member.vehicleDescription}</p></div>
      </div>

      {parents.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Parents</p>
          <div className="flex gap-2">
            {parents.map((p) => (
              <button key={p.id} onClick={() => onOpenRelative(p.id)} className="px-3 py-1.5 rounded-lg cl-panel cl-panel-hover text-sm text-cl-text-primary">{p.name}</button>
            ))}
          </div>
        </div>
      )}

      {canViewGrandparents && (
        <GameButton size="sm" variant="secondary" fullWidth className="mb-5" onClick={() => viewFamilyMemberProfile(member.id)}>
          Meet {member.name}&apos;s Parents
        </GameButton>
      )}

      {!member.deceased && member.role !== 'child' && (
        <div className="mb-5">
          <p className="text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Help Them Out</p>
          <div className="flex items-center gap-2 mb-2">
            <input value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-md bg-white/[0.05] border border-cl-border-strong px-3 py-2 text-sm text-cl-text-primary" />
          </div>
          <div className="flex flex-wrap gap-2">
            <GameButton size="sm" variant="secondary" icon={<Home size={13} />} disabledReason={game.player.cash < Number(amount) ? 'Not enough cash' : undefined} onClick={() => buyAssetForFamily(member.id, 'house', Number(amount))}>Buy House</GameButton>
            <GameButton size="sm" variant="secondary" icon={<Gift size={13} />} disabledReason={game.player.cash < Number(amount) ? 'Not enough cash' : undefined} onClick={() => buyAssetForFamily(member.id, 'car', Number(amount))}>Buy Car</GameButton>
            {member.debt > 0 ? (
              <GameButton
                size="sm" variant="secondary" icon={<Landmark size={13} />}
                disabledReason={game.player.cash < member.debt ? 'Not enough cash' : undefined}
                onClick={() => setConfirmingDebtPayoff(true)}
              >
                Pay Off Debt
              </GameButton>
            ) : debtJustPaid ? (
              <GameButton size="sm" variant="ghost" icon={<CheckCircle2 size={13} />} disabled>DEBT PAID</GameButton>
            ) : null}
          </div>

          {confirmingDebtPayoff && member.debt > 0 && (
            <div className="mt-3 cl-panel p-4 border border-cl-border-strong">
              <p className="text-sm font-semibold text-cl-text-primary mb-3">Pay Off {member.name}&apos;s Debt?</p>
              <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                <div><p className="text-xs text-cl-text-muted mb-0.5">{ROLE_LABELS[member.role] ?? 'Their'} Debt</p><p className="text-cl-negative font-medium">{formatMoney(member.debt)}</p></div>
                <div><p className="text-xs text-cl-text-muted mb-0.5">Your Cash</p><p className="text-cl-text-primary font-medium">{formatMoney(game.player.cash)}</p></div>
                <div><p className="text-xs text-cl-text-muted mb-0.5">Pay Off Amount</p><p className="text-cl-text-primary font-medium">{formatMoney(member.debt)}</p></div>
              </div>
              <div className="flex gap-2">
                <GameButton
                  size="sm" fullWidth
                  disabledReason={game.player.cash < member.debt ? 'Not enough cash' : undefined}
                  onClick={() => {
                    payOffFamilyDebt(member.id);
                    setConfirmingDebtPayoff(false);
                    setDebtJustPaid(true);
                  }}
                >
                  Confirm
                </GameButton>
                <GameButton size="sm" variant="ghost" fullWidth onClick={() => setConfirmingDebtPayoff(false)}>Cancel</GameButton>
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Recent History</p>
        {member.memory.length === 0 ? (
          <p className="text-sm text-cl-text-muted">No notable history yet.</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto cl-scrollbar-thin">
            {member.memory.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <span className="text-cl-text-secondary">{m.description}</span>
                <span className="text-xs text-cl-text-muted">{formatDateLong(toCalendarDate(m.timestamp))}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </GameModal>
  );
}
