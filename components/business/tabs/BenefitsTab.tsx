'use client';

import { useState } from 'react';
import { Car, DollarSign, Smartphone } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { COMPANY_PHONE_TIERS, COMPANY_VEHICLE_TIERS } from '@/game/constants/benefits';
import { MANAGER_ROLE_LABELS, ROLE_LABELS as EMPLOYEE_ROLE_LABELS } from '@/game/constants/data';
import { calculateCompensationBreakdown } from '@/game/simulation/benefits';
import { formatMoney } from '@/lib/format';
import { GameCard } from '@/components/ui/GameCard';
import { GameButton } from '@/components/ui/GameButton';
import { Select } from '@/components/ui/Select';
import type { Business, CompanyPhoneTier, CompanyVehicleTier, FundingSource } from '@/game/types';

export function BenefitsTab({ business }: { business: Business }) {
  const personalCash = useGameStore((s) => s.game?.player.cash ?? 0);
  const purchaseCompanyVehicle = useGameStore((s) => s.purchaseCompanyVehicle);
  const purchaseCompanyPhone = useGameStore((s) => s.purchaseCompanyPhone);
  const assignCompanyVehicle = useGameStore((s) => s.assignCompanyVehicle);
  const assignCompanyPhone = useGameStore((s) => s.assignCompanyPhone);
  const [fundingSource, setFundingSource] = useState<FundingSource>('business');

  const allStaff = [
    ...business.employees.map((e) => ({ id: e.id, kind: 'employee' as const, name: e.name, role: EMPLOYEE_ROLE_LABELS[e.role], salary: e.salary, benefits: e.benefits })),
    ...business.managers.map((m) => ({ id: m.id, kind: 'manager' as const, name: m.name, role: MANAGER_ROLE_LABELS[m.role], salary: m.salary, benefits: m.benefits })),
  ];

  const totalDailyCost = allStaff.reduce((s, p) => s + calculateCompensationBreakdown(p.benefits, p.salary, business.companyVehicles, business.companyPhones).total, 0);

  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...allStaff.map((p) => ({ value: `${p.kind}:${p.id}`, label: `${p.name} (${p.role})` })),
  ];

  const handleAssignVehicle = (vehicleId: string, value: string) => {
    if (!value) return assignCompanyVehicle(business.id, vehicleId, null);
    const [kind, id] = value.split(':');
    assignCompanyVehicle(business.id, vehicleId, { kind: kind as 'employee' | 'manager', id });
  };
  const handleAssignPhone = (phoneId: string, value: string) => {
    if (!value) return assignCompanyPhone(business.id, phoneId, null);
    const [kind, id] = value.split(':');
    assignCompanyPhone(business.id, phoneId, { kind: kind as 'employee' | 'manager', id });
  };

  return (
    <div className="space-y-6">
      <GameCard title="Compensation Overview" subtitle="Base pay + every active benefit, per person, per day" icon={<DollarSign size={16} />}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-cl-text-secondary">Total daily compensation cost</p>
          <p className="text-lg font-bold text-cl-text-primary">{formatMoney(totalDailyCost)}/day</p>
        </div>
        {allStaff.length === 0 ? (
          <p className="text-sm text-cl-text-muted">No employees or managers yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-cl-text-muted text-left border-b border-cl-border">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2 pr-3 text-right">Base</th>
                  <th className="py-2 pr-3 text-right">Bonus</th>
                  <th className="py-2 pr-3 text-right">Car</th>
                  <th className="py-2 pr-3 text-right">Phone</th>
                  <th className="py-2 pr-3 text-right">Insurance</th>
                  <th className="py-2 pr-3 text-right">Training</th>
                  <th className="py-2 pr-3 text-right">Other</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {allStaff.map((p) => {
                  const b = calculateCompensationBreakdown(p.benefits, p.salary, business.companyVehicles, business.companyPhones);
                  return (
                    <tr key={p.id} className="border-b border-cl-border last:border-0">
                      <td className="py-2 pr-3 text-cl-text-primary font-medium">{p.name}</td>
                      <td className="py-2 pr-3 text-cl-text-secondary">{p.role}</td>
                      <td className="py-2 pr-3 text-right text-cl-text-secondary">{formatMoney(b.basePay)}</td>
                      <td className="py-2 pr-3 text-right text-cl-text-secondary">{formatMoney(b.bonus)}</td>
                      <td className="py-2 pr-3 text-right text-cl-text-secondary">{formatMoney(b.car)}</td>
                      <td className="py-2 pr-3 text-right text-cl-text-secondary">{formatMoney(b.phone)}</td>
                      <td className="py-2 pr-3 text-right text-cl-text-secondary">{formatMoney(b.insurance)}</td>
                      <td className="py-2 pr-3 text-right text-cl-text-secondary">{formatMoney(b.training)}</td>
                      <td className="py-2 pr-3 text-right text-cl-text-secondary">{formatMoney(b.other)}</td>
                      <td className="py-2 text-right text-cl-text-primary font-semibold">{formatMoney(b.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GameCard>

      <div className="flex items-center justify-between cl-panel p-3">
        <div>
          <p className="text-sm font-medium text-cl-text-primary">Pay new purchases from</p>
          <p className="text-xs text-cl-text-muted">
            {fundingSource === 'business' ? `Business cash: ${formatMoney(business.cash)}` : `Your personal cash: ${formatMoney(personalCash)}`}
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-cl-border-strong bg-white/[0.03] p-0.5 shrink-0">
          {(['business', 'personal'] as const).map((source) => (
            <button
              key={source}
              onClick={() => setFundingSource(source)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${fundingSource === source ? 'bg-cl-accent-strong text-white' : 'text-cl-text-secondary'}`}
            >
              {source === 'business' ? 'Business Account' : 'Personal Account'}
            </button>
          ))}
        </div>
      </div>

      <GameCard title="Company Vehicle Fleet" subtitle="Business-owned cars, assignable to any employee or manager" icon={<Car size={16} />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          {COMPANY_VEHICLE_TIERS.map((tier) => {
            const available = fundingSource === 'business' ? business.cash : personalCash;
            return (
              <div key={tier.tier} className="cl-panel p-3">
                <p className="text-sm font-semibold text-cl-text-primary mb-0.5">{tier.name}</p>
                <p className="text-xs text-cl-text-muted mb-2">{tier.label}</p>
                <p className="text-xs text-cl-text-secondary mb-1">Purchase {formatMoney(tier.purchasePrice)}</p>
                <p className="text-xs text-cl-text-secondary mb-3">{formatMoney(tier.monthlyCost)}/mo operating</p>
                <GameButton
                  size="sm" fullWidth
                  disabledReason={available < tier.purchasePrice ? 'Not enough funds' : undefined}
                  onClick={() => purchaseCompanyVehicle(business.id, tier.tier as CompanyVehicleTier, fundingSource)}
                >
                  Purchase
                </GameButton>
              </div>
            );
          })}
        </div>
        {business.companyVehicles.length === 0 ? (
          <p className="text-sm text-cl-text-muted">No company vehicles owned yet.</p>
        ) : (
          <div className="space-y-2">
            {business.companyVehicles.map((v) => (
              <div key={v.id} className="cl-panel p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-cl-text-primary">{v.name}</p>
                  <p className="text-xs text-cl-text-muted">{formatMoney(v.monthlyCost)}/mo</p>
                </div>
                <Select
                  className="w-56"
                  value={v.assignedToEmployeeId ? `employee:${v.assignedToEmployeeId}` : v.assignedToManagerId ? `manager:${v.assignedToManagerId}` : ''}
                  onChange={(value) => handleAssignVehicle(v.id, value)}
                  options={assigneeOptions}
                />
              </div>
            ))}
          </div>
        )}
      </GameCard>

      <GameCard title="Company Phone Fleet" subtitle="Business-owned phones, assignable to any employee or manager" icon={<Smartphone size={16} />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          {COMPANY_PHONE_TIERS.map((tier) => {
            const available = fundingSource === 'business' ? business.cash : personalCash;
            return (
              <div key={tier.tier} className="cl-panel p-3">
                <p className="text-sm font-semibold text-cl-text-primary mb-0.5">{tier.label}</p>
                <p className="text-xs text-cl-text-secondary mb-1">Equipment {formatMoney(tier.equipmentCost)}</p>
                <p className="text-xs text-cl-text-secondary mb-3">{formatMoney(tier.monthlyCost)}/mo service</p>
                <GameButton
                  size="sm" fullWidth
                  disabledReason={available < tier.equipmentCost ? 'Not enough funds' : undefined}
                  onClick={() => purchaseCompanyPhone(business.id, tier.tier as CompanyPhoneTier, fundingSource)}
                >
                  Purchase
                </GameButton>
              </div>
            );
          })}
        </div>
        {business.companyPhones.length === 0 ? (
          <p className="text-sm text-cl-text-muted">No company phones owned yet.</p>
        ) : (
          <div className="space-y-2">
            {business.companyPhones.map((p) => (
              <div key={p.id} className="cl-panel p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-cl-text-primary capitalize">{p.tier} Phone</p>
                  <p className="text-xs text-cl-text-muted">{formatMoney(p.monthlyCost)}/mo</p>
                </div>
                <Select
                  className="w-56"
                  value={p.assignedToEmployeeId ? `employee:${p.assignedToEmployeeId}` : p.assignedToManagerId ? `manager:${p.assignedToManagerId}` : ''}
                  onChange={(value) => handleAssignPhone(p.id, value)}
                  options={assigneeOptions}
                />
              </div>
            ))}
          </div>
        )}
      </GameCard>
    </div>
  );
}
