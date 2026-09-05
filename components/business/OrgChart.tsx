'use client';

import { MANAGER_ROLE_LABELS } from '@/game/constants/data';
import { cn } from '@/lib/cn';
import type { Business, ManagerRole } from '@/game/types';

interface OrgNode {
  key: string;
  label: string;
  filledBy: string | null;
  statusLabel: string;
  statusTone: 'positive' | 'warning' | 'negative' | 'neutral';
}

function skillTone(avgSkill: number): { label: string; tone: OrgNode['statusTone'] } {
  if (avgSkill >= 75) return { label: `${Math.round(avgSkill)} skill`, tone: 'positive' };
  if (avgSkill >= 50) return { label: `${Math.round(avgSkill)} skill`, tone: 'warning' };
  return { label: `${Math.round(avgSkill)} skill`, tone: 'negative' };
}

function managerNode(business: Business, role: ManagerRole, locationId: string | null = null): OrgNode {
  const manager = business.managers.find((m) => m.role === role && m.locationId === locationId);
  if (!manager) return { key: `${role}-${locationId ?? 'company'}`, label: MANAGER_ROLE_LABELS[role], filledBy: null, statusLabel: 'Vacant', statusTone: 'neutral' };
  const avgSkill = (manager.leadership + manager.operations + manager.finance + manager.marketingSkill + manager.peopleSkill + manager.growth) / 6;
  const status = skillTone(avgSkill);
  return { key: manager.id, label: MANAGER_ROLE_LABELS[role], filledBy: manager.name, statusLabel: status.label, statusTone: status.tone };
}

function NodeBox({ node }: { node: OrgNode }) {
  return (
    <div className={cn('cl-panel px-3 py-2 text-center min-w-[130px]', node.filledBy ? 'border-cl-accent/25' : 'opacity-60 border-dashed')}>
      <p className="text-xs font-semibold text-cl-text-primary">{node.label}</p>
      <p className="text-[11px] text-cl-text-muted mb-1">{node.filledBy ?? 'Vacant'}</p>
      <span
        className={cn(
          'inline-block text-[10px] px-1.5 py-0.5 rounded-full',
          node.statusTone === 'positive' && 'bg-cl-positive/10 text-cl-positive',
          node.statusTone === 'warning' && 'bg-cl-warning/10 text-cl-warning',
          node.statusTone === 'negative' && 'bg-cl-negative/10 text-cl-negative',
          node.statusTone === 'neutral' && 'bg-white/[0.06] text-cl-text-muted',
        )}
      >
        {node.statusLabel}
      </span>
    </div>
  );
}

function Connector() {
  return <div className="w-px h-4 bg-cl-border-strong mx-auto" />;
}

export function OrgChart({ business }: { business: Business }) {
  const ceo = managerNode(business, 'ceo');
  const executives = (['coo', 'cfo', 'cmo', 'hr_manager'] as ManagerRole[]).map((role) => managerNode(business, role));
  const regional = managerNode(business, 'regional_manager');
  const support = (['inventory_manager', 'procurement_manager', 'warehouse_manager', 'operations_director'] as ManagerRole[]).map((role) => managerNode(business, role));

  const cooks = business.employees.filter((e) => e.role === 'cook');
  const cashiers = business.employees.filter((e) => e.role === 'cashier');
  const cleaners = business.employees.filter((e) => e.role === 'cleaner');
  const frontline: { label: string; count: number; avgSkill: number }[] = [
    { label: 'Cooks', count: cooks.length, avgSkill: cooks.length > 0 ? cooks.reduce((s, e) => s + e.skill, 0) / cooks.length : 0 },
    { label: 'Cashiers', count: cashiers.length, avgSkill: cashiers.length > 0 ? cashiers.reduce((s, e) => s + e.skill, 0) / cashiers.length : 0 },
    { label: 'Cleaners', count: cleaners.length, avgSkill: cleaners.length > 0 ? cleaners.reduce((s, e) => s + e.skill, 0) / cleaners.length : 0 },
  ];

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col items-center min-w-max py-2">
        <NodeBox node={ceo} />
        <Connector />
        <div className="flex gap-4">
          {executives.map((n) => <NodeBox key={n.key} node={n} />)}
        </div>
        <Connector />
        <NodeBox node={regional} />
        <Connector />
        <div className="flex gap-4 mb-1">
          {business.locations.map((location) => (
            <NodeBox key={location.id} node={managerNode(business, 'location_manager', location.id)} />
          ))}
        </div>
        <Connector />
        <div className="flex gap-4">
          {support.map((n) => <NodeBox key={n.key} node={n} />)}
        </div>
        <Connector />
        <div className="flex gap-4">
          {frontline.map((n) => (
            <div key={n.label} className="cl-panel px-3 py-2 text-center min-w-[110px]">
              <p className="text-xs font-semibold text-cl-text-primary">{n.label}</p>
              <p className="text-[11px] text-cl-text-muted mb-1">{n.count} on staff</p>
              {n.count > 0 && (
                <span className={cn('inline-block text-[10px] px-1.5 py-0.5 rounded-full', skillTone(n.avgSkill).tone === 'positive' ? 'bg-cl-positive/10 text-cl-positive' : skillTone(n.avgSkill).tone === 'warning' ? 'bg-cl-warning/10 text-cl-warning' : 'bg-cl-negative/10 text-cl-negative')}>
                  {skillTone(n.avgSkill).label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
