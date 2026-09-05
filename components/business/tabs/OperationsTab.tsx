'use client';

import { useMemo } from 'react';
import { Package, Settings2 } from 'lucide-react';
import { FAST_FOOD_UPGRADES } from '@/game/constants/data';
import { calculateDemand } from '@/game/simulation/economy';
import { getMarketingBoostForLocation } from '@/game/simulation/business';
import { useGameStore } from '@/game/state/store';
import { formatMoney } from '@/lib/format';
import type { Business } from '@/game/types';
import { GameCard } from '@/components/ui/GameCard';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DemandBreakdown } from '@/components/business/DemandBreakdown';
import { UpgradeCard } from '@/components/business/UpgradeCard';
import { WeeklyScheduleEditor } from '@/components/business/WeeklyScheduleEditor';

export function OperationsTab({ business }: { business: Business }) {
  const purchaseUpgrade = useGameStore((s) => s.purchaseUpgrade);

  const locationDemand = useMemo(
    () => business.locations.map((location) => ({
      location,
      demand: calculateDemand(business, location, business.employees, getMarketingBoostForLocation(business, location)),
    })),
    [business],
  );

  return (
    <div className="space-y-6">
      {locationDemand.map(({ location, demand }) => {
        const overCapacity = demand.expectedCustomers > demand.effectiveCapacity;
        const understaffed = demand.staffRatio < 0.75;
        const lostToOtherCauses = Math.max(0, location.lastExpectedCustomers - location.lastActualCustomers - (overCapacity ? location.lastExpectedCustomers - demand.effectiveCapacity : 0));
        const stockoutLostRevenue = location.inventoryStock < 40 ? Math.round(lostToOtherCauses * location.marketAvgPrice) : 0;

        return (
          <GameCard key={location.id} title={`${location.name} Operations`} icon={<Settings2 size={16} />}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <DemandBreakdown expected={demand.expectedCustomers} modifiers={demand.modifiers} />

              <div>
                <p className="text-xs text-cl-text-muted mb-2">Kitchen Capacity</p>
                <p className="text-3xl font-bold text-cl-text-primary tabular-nums mb-3">{Math.round(demand.effectiveCapacity)}</p>
                <ProgressBar
                  value={(demand.expectedCustomers / Math.max(1, demand.effectiveCapacity)) * 100}
                  tone={overCapacity ? 'negative' : 'positive'}
                  label="Demand vs. capacity"
                  showValue
                />
                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                  <div>
                    <p className="text-cl-text-muted mb-0.5">Avg. Wait Time</p>
                    <p className="text-cl-text-primary font-medium">{demand.waitTimeMinutes.toFixed(1)} min</p>
                  </div>
                  <div>
                    <p className="text-cl-text-muted mb-0.5">Service Quality</p>
                    <p className="text-cl-text-primary font-medium">{Math.round(demand.serviceQuality)}%</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-cl-text-muted mb-2 flex items-center gap-1.5"><Package size={12} /> Inventory Health</p>
                <ProgressBar value={location.inventoryStock} tone={location.inventoryStock < 30 ? 'warning' : 'accent'} showValue className="mb-2" />
                <p className="text-xs text-cl-text-muted">See the Inventory tab to manage stock, suppliers, and orders.</p>
              </div>
            </div>

            {(overCapacity || understaffed || stockoutLostRevenue > 0) && (
              <div className="mb-6 space-y-2">
                {overCapacity && <AlertBanner tone="warning" title="Kitchen Over Capacity" message="Demand exceeds effective kitchen capacity. Wait times and satisfaction are suffering — consider hiring staff or upgrading equipment." />}
                {understaffed && <AlertBanner tone="warning" title="Understaffed" message={`This location needs ~${demand.requiredStaff} staff for current demand but only has ${demand.servingStaff}.`} />}
                {stockoutLostRevenue > 0 && (
                  <AlertBanner
                    tone="urgent"
                    title="Low Stock Is Costing You Sales"
                    message={`Estimated lost revenue: ${formatMoney(stockoutLostRevenue)}/day from turning away ~${Math.round(lostToOtherCauses)} customer(s) you don't have stock to serve. See the Inventory tab.`}
                  />
                )}
              </div>
            )}

            <p className="text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-3">Weekly Schedule</p>
            <WeeklyScheduleEditor businessId={business.id} locationId={location.id} schedule={location.weeklySchedule} />
          </GameCard>
        );
      })}

      <GameCard title="Upgrades" subtitle="Improve kitchen capacity, service speed, and product quality" icon={<Settings2 size={16} />}>
        {business.locations.map((location) => (
          <div key={location.id} className="mb-6 last:mb-0">
            <p className="text-sm font-medium text-cl-text-secondary mb-3">{location.name}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {FAST_FOOD_UPGRADES.map((upgrade) => {
                const missingPrerequisiteNames = upgrade.requiresUpgradeIds
                  .filter((id) => !location.upgrades.includes(id))
                  .map((id) => FAST_FOOD_UPGRADES.find((u) => u.id === id)?.name ?? id);
                return (
                  <UpgradeCard
                    key={upgrade.id}
                    upgrade={upgrade}
                    owned={location.upgrades.includes(upgrade.id)}
                    canAfford={business.cash >= upgrade.cost}
                    meetsPrerequisites={missingPrerequisiteNames.length === 0}
                    missingPrerequisiteNames={missingPrerequisiteNames}
                    businessCash={business.cash}
                    onPurchase={() => purchaseUpgrade(business.id, location.id, upgrade.id, upgrade.cost)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </GameCard>
    </div>
  );
}
