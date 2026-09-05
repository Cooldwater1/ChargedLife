'use client';

import { calculateCompensationBreakdown } from '@/game/simulation/benefits';
import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { CompanyPhone, CompanyVehicle, EmployeeBenefits } from '@/game/types';

interface BenefitsEditorProps {
  benefits: EmployeeBenefits;
  annualSalary: number;
  companyVehicles: CompanyVehicle[];
  companyPhones: CompanyPhone[];
  onChange: (patch: Partial<EmployeeBenefits>) => void;
}

const TOGGLES: { key: 'healthInsurance' | 'mealAllowance' | 'travelAllowance' | 'trainingBudget' | 'paidVacation'; label: string }[] = [
  { key: 'healthInsurance', label: 'Health Insurance' },
  { key: 'mealAllowance', label: 'Meal Allowance' },
  { key: 'travelAllowance', label: 'Travel Allowance' },
  { key: 'trainingBudget', label: 'Training Budget' },
  { key: 'paidVacation', label: 'Paid Vacation' },
];

export function BenefitsEditor({ benefits, annualSalary, companyVehicles, companyPhones, onChange }: BenefitsEditorProps) {
  const breakdown = calculateCompensationBreakdown(benefits, annualSalary, companyVehicles, companyPhones);
  const car = companyVehicles.find((v) => v.id === benefits.companyCarId);
  const phone = companyPhones.find((p) => p.id === benefits.companyPhoneId);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {TOGGLES.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange({ [t.key]: !benefits[t.key] })}
            className={cn(
              'px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors',
              benefits[t.key] ? 'border-cl-positive/40 bg-cl-positive/10 text-cl-positive' : 'border-cl-border-strong text-cl-text-muted',
            )}
          >
            {t.label}
          </button>
        ))}
        <button
          onClick={() => onChange({ bonusPlanPct: benefits.bonusPlanPct > 0 ? 0 : 10 })}
          className={cn(
            'px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors',
            benefits.bonusPlanPct > 0 ? 'border-cl-positive/40 bg-cl-positive/10 text-cl-positive' : 'border-cl-border-strong text-cl-text-muted',
          )}
        >
          Bonus Plan {benefits.bonusPlanPct > 0 ? `(${benefits.bonusPlanPct}%)` : ''}
        </button>
      </div>
      <p className="text-[11px] text-cl-text-muted mb-1">
        Car: {car ? car.name : 'None'} {phone ? `· Phone: ${phone.tier}` : '· Phone: None'} — assign from the Benefits tab
      </p>
      <p className="text-xs text-cl-text-secondary">
        Total daily cost <span className="font-semibold text-cl-text-primary">{formatMoney(breakdown.total)}</span>
        <span className="text-cl-text-muted"> (base {formatMoney(breakdown.basePay)} + benefits {formatMoney(breakdown.total - breakdown.basePay)})</span>
      </p>
    </div>
  );
}
