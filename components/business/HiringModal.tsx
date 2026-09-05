'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { EMPLOYEE_ROLE_INFO, EMPLOYEE_ROLES, ROLE_LABELS, TRAIT_LABELS } from '@/game/constants/data';
import { calculateEmployeeHiringCost, generateCandidatePool, getEmployeeRoleNeed } from '@/game/simulation/employees';
import { calculateDemand } from '@/game/simulation/economy';
import { getMarketingBoostForLocation } from '@/game/simulation/business';
import { createRng, nextSeed } from '@/lib/random';
import { useGameStore } from '@/game/state/store';
import { formatMoney } from '@/lib/format';
import { GameModal } from '@/components/ui/GameModal';
import { GameButton } from '@/components/ui/GameButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';
import type { EmployeeRole, FundingSource, JobCandidate } from '@/game/types';

interface HiringModalProps {
  open: boolean;
  onClose: () => void;
  businessId: string;
  locationId: string;
}

function staffingStatus(ratio: number): { label: string; tone: 'danger' | 'warning' | 'success' } {
  if (ratio < 0.75) return { label: 'Understaffed', tone: 'danger' };
  if (ratio > 1.5) return { label: 'Overstaffed', tone: 'warning' };
  return { label: 'Well Staffed', tone: 'success' };
}

export function HiringModal({ open, onClose, businessId, locationId }: HiringModalProps) {
  const business = useGameStore((s) => s.game?.businesses.find((b) => b.id === businessId));
  const personalCash = useGameStore((s) => s.game?.player.cash ?? 0);
  const hireEmployee = useGameStore((s) => s.hireEmployee);

  const [selectedLocationId, setSelectedLocationId] = useState(locationId);
  const [role, setRole] = useState<EmployeeRole>('cook');
  const [pool, setPool] = useState<JobCandidate[]>(() => generateCandidatePool(createRng(nextSeed()), 'cook'));
  const [hiredIds, setHiredIds] = useState<Set<string>>(new Set());
  const [lastHire, setLastHire] = useState<{ name: string; role: EmployeeRole } | null>(null);
  const [fundingSource, setFundingSource] = useState<FundingSource>('business');

  if (!business) return null;
  const location = business.locations.find((l) => l.id === selectedLocationId) ?? business.locations[0];

  const locationEmployees = business.employees.filter((e) => e.locationId === location.id);
  const weeklyPayroll = locationEmployees.reduce((s, e) => s + e.salary / 52, 0);
  const demand = calculateDemand(business, location, business.employees, getMarketingBoostForLocation(business, location));
  const staffing = staffingStatus(demand.staffRatio);
  const roleInfo = EMPLOYEE_ROLE_INFO[role];
  const roleNeed = getEmployeeRoleNeed(role, location, locationEmployees, demand);

  const handleRoleChange = (newRole: EmployeeRole) => {
    setRole(newRole);
    setPool(generateCandidatePool(createRng(nextSeed()), newRole));
    setLastHire(null);
  };

  const handleLocationChange = (id: string) => {
    setSelectedLocationId(id);
    setLastHire(null);
  };

  const handleRefreshPool = () => {
    setPool(generateCandidatePool(createRng(nextSeed()), role));
    setHiredIds(new Set());
    setLastHire(null);
  };

  const handleHire = (candidate: JobCandidate) => {
    hireEmployee(businessId, location.id, candidate, fundingSource);
    setHiredIds((prev) => new Set(prev).add(candidate.id));
    setLastHire({ name: candidate.name, role: candidate.role });
  };

  return (
    <GameModal open={open} onClose={onClose} title="Hire Employee" subtitle="Review candidates and choose who to hire — stays open so you can hire across locations" size="lg">
      {business.locations.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {business.locations.map((l) => (
            <button
              key={l.id}
              onClick={() => handleLocationChange(l.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                location.id === l.id ? 'border-cl-gold bg-cl-gold/10 text-cl-gold' : 'border-cl-border-strong text-cl-text-secondary hover:text-cl-text-primary',
              )}
            >
              {l.name}
            </button>
          ))}
        </div>
      )}

      <div className="cl-panel p-4 mb-5 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-cl-text-muted mb-1">Employees at {location.name}</p>
          <p className="text-lg font-semibold text-cl-text-primary tabular-nums">
            {lastHire ? `${locationEmployees.length - 1} → ${locationEmployees.length}` : locationEmployees.length}
          </p>
        </div>
        <div>
          <p className="text-xs text-cl-text-muted mb-1">Weekly Payroll</p>
          <p className="text-lg font-semibold text-cl-text-primary tabular-nums">{formatMoney(weeklyPayroll)}</p>
        </div>
        <div>
          <p className="text-xs text-cl-text-muted mb-1">Staffing Status</p>
          <StatusBadge label={staffing.label} tone={staffing.tone} />
        </div>
      </div>

      <div className="flex items-center justify-between mb-5 cl-panel p-3">
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

      {lastHire && (
        <div className="cl-panel p-3 mb-4 !border-cl-positive/30 bg-cl-positive/5">
          <p className="text-sm text-cl-positive font-medium">Hired {lastHire.name} as {ROLE_LABELS[lastHire.role]} at {location.name}.</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2 flex-wrap">
          {EMPLOYEE_ROLES.map((r) => (
            <button
              key={r}
              onClick={() => handleRoleChange(r)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                role === r ? 'border-cl-accent bg-cl-accent/10 text-cl-accent' : 'border-cl-border-strong text-cl-text-secondary hover:text-cl-text-primary',
              )}
            >
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
        <GameButton size="sm" variant="ghost" icon={<RefreshCw size={13} />} onClick={handleRefreshPool}>Refresh Candidates</GameButton>
      </div>

      <div className="cl-panel p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-cl-text-primary">{ROLE_LABELS[role]} — {roleInfo.department}</p>
          <StatusBadge label={roleNeed.gap > 0 ? 'Needed' : 'Sufficient'} tone={roleNeed.gap > 0 ? 'warning' : 'success'} />
        </div>
        <p className="text-xs text-cl-text-secondary mb-2">{roleNeed.note}</p>
        <ul className="text-xs text-cl-text-muted list-disc list-inside mb-2 space-y-0.5">
          {roleInfo.responsibilities.map((r) => <li key={r}>{r}</li>)}
        </ul>
        <p className="text-xs text-cl-positive">Expected effect: {roleInfo.expectedEffects}</p>
        <p className="text-xs text-cl-negative mt-0.5">Without one: {roleInfo.withoutThem}</p>
      </div>

      <div className="space-y-3">
        {pool.map((candidate) => {
          const alreadyHired = hiredIds.has(candidate.id);
          const hiringCost = calculateEmployeeHiringCost(candidate);
          const dailyCost = candidate.expectedSalary / 365;
          const availableFunds = fundingSource === 'business' ? business.cash : personalCash;
          const canAfford = availableFunds >= hiringCost;
          const disabledReason = alreadyHired ? 'Already hired' : !canAfford ? `Insufficient funds (need ${formatMoney(hiringCost)})` : undefined;
          return (
            <div key={candidate.id} className={cn('cl-panel p-4 flex items-center justify-between gap-4', alreadyHired && 'opacity-50')}>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-cl-text-primary">{candidate.name}</p>
                  <StatusBadge label={TRAIT_LABELS[candidate.trait]} tone="neutral" />
                </div>
                <p className="text-xs text-cl-text-muted mt-0.5">
                  Age {candidate.age} · {candidate.experienceYears}y experience · Skill {candidate.skill}/100
                </p>
                <p className="text-xs text-cl-text-muted mt-1">
                  One-time hiring cost <span className="text-cl-text-secondary font-medium">{formatMoney(hiringCost)}</span>
                  <span className="mx-1">·</span>
                  {formatMoney(candidate.expectedSalary)}/yr
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-cl-text-primary tabular-nums">{formatMoney(dailyCost)}<span className="text-xs font-normal text-cl-text-muted">/day</span></p>
                <div className="mt-1.5">
                  <GameButton size="sm" disabledReason={disabledReason} onClick={() => handleHire(candidate)}>
                    {alreadyHired ? 'Hired' : 'Hire'}
                  </GameButton>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GameModal>
  );
}
