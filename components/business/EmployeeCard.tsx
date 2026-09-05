'use client';

import { useState } from 'react';
import { TrendingUp, UserMinus } from 'lucide-react';
import { EMPLOYEE_ROLE_INFO, ROLE_LABELS, TRAIT_LABELS } from '@/game/constants/data';
import type { CompanyPhone, CompanyVehicle, Employee, EmployeeBenefits } from '@/game/types';
import { formatMoney } from '@/lib/format';
import { GameButton } from '@/components/ui/GameButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BenefitsEditor } from '@/components/business/BenefitsEditor';

interface EmployeeCardProps {
  employee: Employee;
  companyVehicles: CompanyVehicle[];
  companyPhones: CompanyPhone[];
  onFire: () => void;
  onRaise: (newSalary: number) => void;
  onBenefitsChange: (patch: Partial<EmployeeBenefits>) => void;
}

export function EmployeeCard({ employee, companyVehicles, companyPhones, onFire, onRaise, onBenefitsChange }: EmployeeCardProps) {
  const [raiseOpen, setRaiseOpen] = useState(false);
  const [benefitsOpen, setBenefitsOpen] = useState(false);
  const moraleTone = employee.morale >= 60 ? 'positive' : employee.morale >= 35 ? 'warning' : 'negative';

  return (
    <div className="cl-panel p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold text-cl-text-primary">{employee.name}</p>
          <p className="text-xs text-cl-text-muted">{ROLE_LABELS[employee.role]} · {EMPLOYEE_ROLE_INFO[employee.role].department} · Age {employee.age}</p>
        </div>
        <StatusBadge label={TRAIT_LABELS[employee.trait]} tone="neutral" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
        <div>
          <p className="text-cl-text-muted mb-0.5">Daily Cost</p>
          <p className="text-cl-text-primary font-semibold">{formatMoney(employee.salary / 365)}/day</p>
        </div>
        <div>
          <p className="text-cl-text-muted mb-0.5">Skill</p>
          <p className="text-cl-text-primary font-medium">{employee.skill}/100</p>
        </div>
      </div>
      <p className="text-[11px] text-cl-text-muted mb-3">{formatMoney(employee.salary)}/yr salary</p>

      <ProgressBar value={employee.morale} tone={moraleTone} label="Morale" showValue className="mb-2" />
      <ProgressBar value={employee.loyalty} tone="accent" label="Loyalty" showValue className="mb-3" />

      <button onClick={() => setBenefitsOpen((v) => !v)} className="text-xs text-cl-accent font-medium mb-3">
        {benefitsOpen ? 'Hide Benefits' : 'Benefits & Compensation'}
      </button>
      {benefitsOpen && (
        <div className="cl-panel p-3 mb-3">
          <BenefitsEditor benefits={employee.benefits} annualSalary={employee.salary} companyVehicles={companyVehicles} companyPhones={companyPhones} onChange={onBenefitsChange} />
        </div>
      )}

      <div className="flex gap-2">
        {raiseOpen ? (
          <div className="flex-1 flex gap-2">
            <GameButton size="sm" variant="secondary" fullWidth onClick={() => { onRaise(Math.round(employee.salary * 1.1)); setRaiseOpen(false); }}>
              +10% (+{formatMoney(Math.round(employee.salary * 0.1))})
            </GameButton>
            <GameButton size="sm" variant="ghost" onClick={() => setRaiseOpen(false)}>Cancel</GameButton>
          </div>
        ) : (
          <>
            <GameButton size="sm" variant="secondary" icon={<TrendingUp size={13} />} fullWidth onClick={() => setRaiseOpen(true)}>
              Give Raise
            </GameButton>
            <GameButton size="sm" variant="danger" icon={<UserMinus size={13} />} onClick={onFire}>
              Fire
            </GameButton>
          </>
        )}
      </div>
    </div>
  );
}
