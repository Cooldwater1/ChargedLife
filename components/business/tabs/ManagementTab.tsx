'use client';

import { useState } from 'react';
import { Activity, Briefcase, Building2, UserCog, Users } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { MANAGER_HIRING_COST_PCT, MANAGER_ROLE_BASE_SALARY } from '@/game/constants/balance';
import { MANAGER_ROLE_DESCRIPTIONS as ROLE_DESCRIPTIONS, MANAGER_ROLE_LABELS as ROLE_LABELS } from '@/game/constants/data';
import { formatDateLong, formatMoney } from '@/lib/format';
import { toCalendarDate } from '@/game/time/calendar';
import { GameCard } from '@/components/ui/GameCard';
import { GameButton } from '@/components/ui/GameButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { HelpTip } from '@/components/ui/HelpTip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { ExecutiveHiringModal } from '@/components/business/ExecutiveHiringModal';
import { BenefitsEditor } from '@/components/business/BenefitsEditor';
import { OrgChart } from '@/components/business/OrgChart';
import { CORPORATE_MANAGER_ROLES, type Business, type CEOStrategy, type DelegationSettings, type ManagerRole } from '@/game/types';

const MANAGER_ROLES: ManagerRole[] = [
  'location_manager', 'regional_manager', 'hr_manager', 'operations_director',
  'inventory_manager', 'procurement_manager', 'warehouse_manager',
  'cfo', 'cmo', 'coo', 'ceo',
];
const DELEGATION_AREAS: { key: keyof DelegationSettings; label: string; description: string }[] = [
  { key: 'pricing', label: 'Pricing', description: 'Menu price adjustments to stay competitive' },
  { key: 'hiring', label: 'Hiring', description: 'Recruiting new employees when needed — needs an HR Manager and Auto-Hire on to actually act' },
  { key: 'staffing', label: 'Staffing', description: 'Hiring and cutting staff based on demand' },
  { key: 'marketing', label: 'Marketing', description: 'Running and tuning ad campaigns' },
  { key: 'inventory', label: 'Inventory', description: 'Keeping stock levels healthy' },
  { key: 'operations', label: 'Operations', description: 'Day-to-day operating decisions' },
];
const CEO_STRATEGIES: CEOStrategy[] = ['conservative', 'balanced', 'growth', 'aggressive_growth', 'profit_maximization'];
const CEO_STRATEGY_LABELS: Record<CEOStrategy, string> = {
  conservative: 'Conservative', balanced: 'Balanced', growth: 'Growth', aggressive_growth: 'Aggressive Growth', profit_maximization: 'Profit Maximization',
};

function performanceTier(avgSkill: number): { label: string; tone: 'danger' | 'warning' | 'info' | 'success' } {
  if (avgSkill >= 78) return { label: 'Excellent', tone: 'success' };
  if (avgSkill >= 62) return { label: 'Good', tone: 'info' };
  if (avgSkill >= 45) return { label: 'Average', tone: 'warning' };
  return { label: 'Poor', tone: 'danger' };
}

export function ManagementTab({ business }: { business: Business }) {
  const fireManager = useGameStore((s) => s.fireManager);
  const setDelegationControl = useGameStore((s) => s.setDelegationControl);
  const updateHRSettings = useGameStore((s) => s.updateHRSettings);
  const updateCEOSettings = useGameStore((s) => s.updateCEOSettings);
  const updateManagerBenefits = useGameStore((s) => s.updateManagerBenefits);

  const [hireRole, setHireRole] = useState<ManagerRole>('location_manager');
  const [hireLocationId, setHireLocationId] = useState(business.locations[0]?.id ?? '');
  const [hiringModalOpen, setHiringModalOpen] = useState(false);
  const [benefitsOpenId, setBenefitsOpenId] = useState<string | null>(null);

  const isLocationRole = hireRole === 'location_manager';
  const isCorporateRole = CORPORATE_MANAGER_ROLES.includes(hireRole);
  const corporateHeadcount = business.managers.filter((m) => CORPORATE_MANAGER_ROLES.includes(m.role)).length;
  const hqBlocksHire = isCorporateRole && (!business.headquarters || corporateHeadcount >= business.headquarters.capacity);
  const alreadyHasCompanyWideRole = !isLocationRole && business.managers.some((m) => m.role === hireRole);
  const alreadyHasLocationManager = isLocationRole && business.managers.some((m) => m.locationId === hireLocationId && m.role === 'location_manager');
  const estimatedSalary = MANAGER_ROLE_BASE_SALARY[hireRole] ?? 60_000;
  const estimatedHiringCost = Math.round(estimatedSalary * (MANAGER_HIRING_COST_PCT[hireRole] ?? 0.1));

  const disabledReason = hqBlocksHire
    ? !business.headquarters ? 'Requires a headquarters' : 'Headquarters at capacity'
    : alreadyHasCompanyWideRole
    ? `You already have a ${ROLE_LABELS[hireRole]}`
    : alreadyHasLocationManager
    ? 'This location already has a manager'
    : undefined;

  const hrManager = business.managers.find((m) => m.role === 'hr_manager');
  const ceo = business.managers.find((m) => m.role === 'ceo');

  return (
    <div className="space-y-6">
      <GameCard title="Organization Chart" icon={<UserCog size={16} />} subtitle="Reporting lines and who's actually filling each seat">
        <OrgChart business={business} />
      </GameCard>

      <GameCard
        title="Headquarters"
        icon={<Building2 size={16} />}
        subtitle={business.headquarters ? `${corporateHeadcount}/${business.headquarters.capacity} corporate seats used` : 'No corporate office yet'}
        action={<HelpTip text="CFO, CMO, COO, and CEO need a real office to work from. Rent or buy one from the Headquarters tab — no business-level requirement, just money and space." />}
      >
        {business.headquarters ? (
          <p className="text-sm text-cl-text-secondary">
            {business.headquarters.tier.replace('_', ' ')} · {business.headquarters.ownership === 'owned' ? 'Owned' : 'Rented'} · {formatMoney(business.headquarters.monthlyCost)}/mo
          </p>
        ) : (
          <p className="text-sm text-cl-text-muted">Hiring a CFO, CMO, COO, or CEO requires an office — visit the Headquarters tab to rent or buy one.</p>
        )}
      </GameCard>

      <GameCard title="Management Hierarchy" subtitle="Hire managers to delegate day-to-day decisions" icon={<UserCog size={16} />}>
        {business.managers.length === 0 ? (
          <p className="text-sm text-cl-text-muted mb-5">No managers hired yet. Every decision is still yours to make.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {business.managers.map((m) => {
              const avgSkill = (m.leadership + m.operations + m.finance + m.marketingSkill + m.peopleSkill + m.growth) / 6;
              const perf = performanceTier(avgSkill);
              return (
              <div key={m.id} className="cl-panel p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-cl-text-primary">{m.name}</p>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge label={perf.label} tone={perf.tone} />
                    <StatusBadge label={ROLE_LABELS[m.role]} tone="gold" />
                  </div>
                </div>
                <p className="text-xs text-cl-text-muted mb-1">
                  {m.locationId ? business.locations.find((l) => l.id === m.locationId)?.name ?? 'Unknown location' : 'Company-wide'} · {formatMoney(m.salary)}/yr
                </p>
                <p className="text-xs text-cl-text-secondary mb-2">{ROLE_DESCRIPTIONS[m.role]}</p>
                <div className="grid grid-cols-3 gap-x-3 gap-y-1 text-xs text-cl-text-secondary mb-3">
                  <span>Leadership {m.leadership}</span>
                  <span>Operations {m.operations}</span>
                  <span>Finance {m.finance}</span>
                  <span>Marketing {m.marketingSkill}</span>
                  <span>People {m.peopleSkill}</span>
                  <span>Growth {m.growth}</span>
                </div>
                <button onClick={() => setBenefitsOpenId(benefitsOpenId === m.id ? null : m.id)} className="text-xs text-cl-accent font-medium mb-2 block">
                  {benefitsOpenId === m.id ? 'Hide Benefits' : 'Benefits & Compensation'}
                </button>
                {benefitsOpenId === m.id && (
                  <div className="cl-panel p-3 mb-3">
                    <BenefitsEditor
                      benefits={m.benefits} annualSalary={m.salary}
                      companyVehicles={business.companyVehicles} companyPhones={business.companyPhones}
                      onChange={(patch) => updateManagerBenefits(business.id, m.id, patch)}
                    />
                  </div>
                )}
                <GameButton size="sm" variant="danger" onClick={() => fireManager(business.id, m.id)}>Let Go</GameButton>
              </div>
              );
            })}
          </div>
        )}

        <p className="text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-3">Hire a Manager</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {MANAGER_ROLES.map((role) => (
            <button
              key={role}
              onClick={() => setHireRole(role)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${hireRole === role ? 'border-cl-accent bg-cl-accent/10 text-cl-accent' : 'border-cl-border-strong text-cl-text-secondary hover:text-cl-text-primary'}`}
            >
              {ROLE_LABELS[role]}
              {CORPORATE_MANAGER_ROLES.includes(role) && <span className="ml-1.5 text-cl-text-muted">HQ req.</span>}
            </button>
          ))}
        </div>
        <p className="text-xs text-cl-text-secondary mb-3">{ROLE_DESCRIPTIONS[hireRole]}</p>
        {isLocationRole && business.locations.length > 1 && (
          <Select
            className="w-full md:w-64 mb-3"
            value={hireLocationId}
            onChange={setHireLocationId}
            options={business.locations.map((l) => ({ value: l.id, label: l.name }))}
          />
        )}
        <div className="flex items-center gap-3">
          <p className="text-xs text-cl-text-muted">
            Est. salary {formatMoney(estimatedSalary)}/yr · hiring cost ~{formatMoney(estimatedHiringCost)}
          </p>
          <GameButton size="sm" disabledReason={disabledReason} onClick={() => setHiringModalOpen(true)}>
            Hire {ROLE_LABELS[hireRole]}
          </GameButton>
        </div>
      </GameCard>

      <ExecutiveHiringModal
        open={hiringModalOpen}
        onClose={() => setHiringModalOpen(false)}
        businessId={business.id}
        role={hireRole}
        locationId={isLocationRole ? hireLocationId : null}
        roleLabel={ROLE_LABELS[hireRole]}
      />

      <GameCard title="Delegation" subtitle="Choose whether you or your management team handle each area" icon={<Users size={16} />}>
        <div className="space-y-3">
          {DELEGATION_AREAS.map((area) => (
            <div key={area.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-cl-text-primary">{area.label}</p>
                <p className="text-xs text-cl-text-muted">{area.description}</p>
              </div>
              <div className="flex gap-1 rounded-lg border border-cl-border-strong bg-white/[0.03] p-0.5 shrink-0">
                {(['player', 'manager'] as const).map((control) => (
                  <button
                    key={control}
                    onClick={() => setDelegationControl(business.id, area.key, control)}
                    disabled={control === 'manager' && business.managers.length === 0}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${business.delegation[area.key] === control ? 'bg-cl-accent-strong text-white' : 'text-cl-text-secondary'}`}
                  >
                    {control === 'player' ? 'You' : 'Manager'}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {business.managers.length === 0 && (
          <p className="text-xs text-cl-text-muted mt-3">Hire at least one manager to delegate any area to them.</p>
        )}
      </GameCard>

      {hrManager && (
        <GameCard
          title="HR Automation"
          subtitle={`${hrManager.name} — People ${hrManager.peopleSkill} · Leadership ${hrManager.leadership}`}
          icon={<Briefcase size={16} />}
          action={<HelpTip text="A better HR Manager (People + Leadership skill) finds higher-quality hires, trains more efficiently, and won't misjudge who to let go." />}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {(['autoHire', 'autoFire', 'autoTrain'] as const).map((key) => (
              <div key={key} className="cl-panel p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cl-text-primary">{key === 'autoHire' ? 'Auto-Hire' : key === 'autoFire' ? 'Auto-Fire' : 'Auto-Train'}</p>
                  <p className="text-xs text-cl-text-muted">
                    {key === 'autoHire' ? 'Hires when understaffed' : key === 'autoFire' ? 'Removes sustained low performers' : 'Trains your weakest staff'}
                  </p>
                </div>
                <button
                  onClick={() => updateHRSettings(business.id, { [key]: !business.hrSettings[key] })}
                  className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${business.hrSettings[key] ? 'bg-cl-accent-strong' : 'bg-white/[0.1]'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${business.hrSettings[key] ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
          {business.hrSettings.autoHire && business.delegation.hiring !== 'manager' && (
            <p className="text-xs text-cl-warning mb-4">Auto-Hire is on, but Hiring is still delegated to You above — switch it to Manager for HR to act.</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Training Budget (monthly)</label>
              <input
                type="number" value={business.hrSettings.trainingBudgetMonthly}
                onChange={(e) => updateHRSettings(business.id, { trainingBudgetMonthly: Math.max(0, Number(e.target.value)) })}
                className="w-full rounded-md bg-white/[0.05] border border-cl-border-strong px-3 py-1.5 text-sm text-cl-text-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Recruitment Budget (monthly)</label>
              <input
                type="number" value={business.hrSettings.recruitmentBudgetMonthly}
                onChange={(e) => updateHRSettings(business.id, { recruitmentBudgetMonthly: Math.max(0, Number(e.target.value)) })}
                className="w-full rounded-md bg-white/[0.05] border border-cl-border-strong px-3 py-1.5 text-sm text-cl-text-primary"
              />
            </div>
          </div>
        </GameCard>
      )}

      {ceo && (
        <GameCard
          title="CEO Strategy"
          subtitle={`${ceo.name} — Leadership ${ceo.leadership} · Finance ${ceo.finance}`}
          icon={<UserCog size={16} />}
          action={<HelpTip text="Budget Allocation set to Manager lets the CEO reallocate HR budgets automatically each month based on strategy and recent profit — always within your spend cap and cash reserve floor." />}
        >
          <div className="flex flex-wrap gap-2 mb-5">
            {CEO_STRATEGIES.map((s) => (
              <button
                key={s}
                onClick={() => updateCEOSettings(business.id, { strategy: s })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${business.ceoSettings.strategy === s ? 'border-cl-accent bg-cl-accent/10 text-cl-accent' : 'border-cl-border-strong text-cl-text-secondary'}`}
              >
                {CEO_STRATEGY_LABELS[s]}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between py-2 mb-3">
            <div>
              <p className="text-sm font-medium text-cl-text-primary">Budget Allocation</p>
              <p className="text-xs text-cl-text-muted">Who sets HR recruitment/training budgets month to month</p>
            </div>
            <div className="flex gap-1 rounded-lg border border-cl-border-strong bg-white/[0.03] p-0.5 shrink-0">
              {(['player', 'manager'] as const).map((control) => (
                <button
                  key={control}
                  onClick={() => updateCEOSettings(business.id, { budgetAllocation: control })}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${business.ceoSettings.budgetAllocation === control ? 'bg-cl-accent-strong text-white' : 'text-cl-text-secondary'}`}
                >
                  {control === 'player' ? 'You' : 'CEO'}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Max Discretionary Spend (monthly)</label>
              <input
                type="number" value={business.ceoSettings.maxDiscretionaryMonthlySpend}
                onChange={(e) => updateCEOSettings(business.id, { maxDiscretionaryMonthlySpend: Math.max(0, Number(e.target.value)) })}
                className="w-full rounded-md bg-white/[0.05] border border-cl-border-strong px-3 py-1.5 text-sm text-cl-text-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Minimum Cash Reserve</label>
              <input
                type="number" value={business.ceoSettings.minCashReserve}
                onChange={(e) => updateCEOSettings(business.id, { minCashReserve: Math.max(0, Number(e.target.value)) })}
                className="w-full rounded-md bg-white/[0.05] border border-cl-border-strong px-3 py-1.5 text-sm text-cl-text-primary"
              />
            </div>
          </div>
        </GameCard>
      )}

      <GameCard title="Management Activity" subtitle="What your managers have actually done" icon={<Activity size={16} />}>
        {business.managementLog.length === 0 ? (
          <EmptyState icon={<Activity size={28} />} title="No management activity yet" description="Once you hire managers and turn on automation, their decisions will show up here." />
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto cl-scrollbar-thin">
            {[...business.managementLog].reverse().map((entry) => (
              <div key={entry.id} className="flex items-start justify-between gap-3 text-sm pb-2.5 border-b border-cl-border last:border-0 last:pb-0">
                <div className="flex items-start gap-2">
                  <StatusBadge label={ROLE_LABELS[entry.role]} tone="neutral" />
                  <span className="text-cl-text-secondary">{entry.message}</span>
                </div>
                <span className="text-xs text-cl-text-muted shrink-0">{formatDateLong(toCalendarDate(entry.timestamp))}</span>
              </div>
            ))}
          </div>
        )}
      </GameCard>
    </div>
  );
}
