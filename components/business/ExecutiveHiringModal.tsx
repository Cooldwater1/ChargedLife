'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { CORPORATE_MANAGER_ROLES } from '@/game/types';
import { generateManagerCandidatePool, calculateManagerHiringCost, type ManagerCandidate } from '@/game/simulation/delegation';
import { createRng, nextSeed } from '@/lib/random';
import { useGameStore } from '@/game/state/store';
import { formatMoney } from '@/lib/format';
import { GameModal } from '@/components/ui/GameModal';
import { GameButton } from '@/components/ui/GameButton';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { cn } from '@/lib/cn';
import type { FundingSource, ManagerRole } from '@/game/types';

interface ExecutiveHiringModalProps {
  open: boolean;
  onClose: () => void;
  businessId: string;
  role: ManagerRole;
  locationId: string | null;
  roleLabel: string;
}

export function ExecutiveHiringModal({ open, onClose, businessId, role, locationId, roleLabel }: ExecutiveHiringModalProps) {
  const business = useGameStore((s) => s.game?.businesses.find((b) => b.id === businessId));
  const personalCash = useGameStore((s) => s.game?.player.cash ?? 0);
  const hireManager = useGameStore((s) => s.hireManager);

  const [pool, setPool] = useState<ManagerCandidate[]>(() => generateManagerCandidatePool(createRng(nextSeed()), role));
  const [fundingSource, setFundingSource] = useState<FundingSource>('business');
  const [hiredId, setHiredId] = useState<string | null>(null);

  // The role is a prop, not internal state, and can change while this modal instance stays
  // mounted (the parent just flips `open`) — regenerate the pool whenever it (re)opens for a
  // different role than the one already loaded, so it's never showing a stale role's candidates.
  const [syncedKey, setSyncedKey] = useState(`${role}:${open}`);
  const currentKey = `${role}:${open}`;
  if (open && currentKey !== syncedKey) {
    setSyncedKey(currentKey);
    setPool(generateManagerCandidatePool(createRng(nextSeed()), role));
    setHiredId(null);
  }

  if (!business) return null;

  const isCorporateRole = CORPORATE_MANAGER_ROLES.includes(role);
  const hq = business.headquarters;
  const corporateHeadcount = business.managers.filter((m) => CORPORATE_MANAGER_ROLES.includes(m.role)).length;
  const hqBlocksHire = isCorporateRole && (!hq || corporateHeadcount >= hq.capacity);

  const currentAnnualPayroll = business.employees.reduce((s, e) => s + e.salary, 0) + business.managers.reduce((s, m) => s + m.salary, 0);
  const recentMonthlyProfit = business.financialHistory.slice(-30).reduce((s, d) => s + d.profit, 0);

  const handleRefresh = () => {
    setPool(generateManagerCandidatePool(createRng(nextSeed()), role));
    setHiredId(null);
  };

  const handleHire = (candidate: ManagerCandidate) => {
    hireManager(businessId, locationId, candidate, fundingSource);
    setHiredId(candidate.candidateId);
  };

  return (
    <GameModal open={open} onClose={onClose} title={`Hire ${roleLabel}`} subtitle="Review candidates before committing — executive hires cost real money upfront" size="lg">
      {isCorporateRole && !hq && (
        <AlertBanner tone="warning" title="No Headquarters" message={`${roleLabel} needs a corporate office to work from. Rent or buy a Headquarters first (Headquarters tab).`} />
      )}
      {isCorporateRole && hq && corporateHeadcount >= hq.capacity && (
        <AlertBanner tone="warning" title="Headquarters Full" message={`Your ${hq.tier.replace('_', ' ')} is at capacity (${corporateHeadcount}/${hq.capacity} corporate roles). Upgrade your HQ to hire more.`} />
      )}

      <div className="flex items-center justify-between mb-5 cl-panel p-3 mt-4">
        <div>
          <p className="text-sm font-medium text-cl-text-primary">Pay hiring cost from</p>
          <p className="text-xs text-cl-text-muted">
            {fundingSource === 'business' ? `Business cash: ${formatMoney(business.cash)}` : `Your personal cash: ${formatMoney(personalCash)}`}
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-cl-border-strong bg-white/[0.03] p-0.5 shrink-0">
          {(['business', 'personal'] as const).map((source) => (
            <button
              key={source}
              onClick={() => setFundingSource(source)}
              className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-colors', fundingSource === source ? 'bg-cl-accent-strong text-white' : 'text-cl-text-secondary')}
            >
              {source === 'business' ? 'Business Account' : 'Personal Account'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end mb-3">
        <GameButton size="sm" variant="ghost" icon={<RefreshCw size={13} />} onClick={handleRefresh}>Refresh Candidates</GameButton>
      </div>

      <div className="space-y-3">
        {pool.map((candidate) => {
          const hiringCost = calculateManagerHiringCost(candidate.role, candidate.salary);
          const availableFunds = fundingSource === 'business' ? business.cash : personalCash;
          const canAfford = availableFunds >= hiringCost;
          const projectedMonthlyProfit = recentMonthlyProfit - candidate.salary / 12;
          const alreadyHired = hiredId === candidate.candidateId;
          const disabledReason = hqBlocksHire
            ? isCorporateRole && !hq ? 'No headquarters' : 'Headquarters at capacity'
            : alreadyHired ? 'Hired'
            : !canAfford ? `Insufficient funds (need ${formatMoney(hiringCost)})`
            : undefined;

          return (
            <div key={candidate.candidateId} className={cn('cl-panel p-4', alreadyHired && 'opacity-50')}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold text-cl-text-primary">{candidate.name}</p>
                  <p className="text-xs text-cl-text-muted">Age {candidate.age} · {candidate.experienceYears}y experience</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-cl-text-primary">{formatMoney(candidate.salary)}/yr</p>
                  <p className="text-xs text-cl-text-muted">Hiring cost {formatMoney(hiringCost)}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-x-3 gap-y-1 text-xs text-cl-text-secondary mb-3">
                <span>Leadership {candidate.leadership}</span>
                <span>Operations {candidate.operations}</span>
                <span>Finance {candidate.finance}</span>
                <span>Marketing {candidate.marketingSkill}</span>
                <span>People {candidate.peopleSkill}</span>
                <span>Growth {candidate.growth}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className={cn('text-xs', projectedMonthlyProfit < 0 ? 'text-cl-negative' : 'text-cl-text-muted')}>
                  Projected monthly profit after hire: <span className="font-medium">{formatMoney(projectedMonthlyProfit)}</span>
                  {projectedMonthlyProfit < 0 && ' — this may make the business unprofitable'}
                </p>
                <GameButton size="sm" disabledReason={disabledReason} onClick={() => handleHire(candidate)}>
                  {alreadyHired ? 'Hired' : 'Hire'}
                </GameButton>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-cl-text-muted mt-4">
        Current annual payroll: {formatMoney(currentAnnualPayroll)} ({formatMoney(currentAnnualPayroll / 12)}/mo)
      </p>
    </GameModal>
  );
}
