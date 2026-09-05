'use client';

import { useState } from 'react';
import { UserPlus, Users } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import type { Business } from '@/game/types';
import { GameCard } from '@/components/ui/GameCard';
import { GameButton } from '@/components/ui/GameButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { EmployeeCard } from '@/components/business/EmployeeCard';
import { HiringModal } from '@/components/business/HiringModal';

export function EmployeesTab({ business }: { business: Business }) {
  const [hiringLocationId, setHiringLocationId] = useState<string | null>(null);
  const fireEmployee = useGameStore((s) => s.fireEmployee);
  const giveRaise = useGameStore((s) => s.giveRaise);
  const updateEmployeeBenefits = useGameStore((s) => s.updateEmployeeBenefits);

  return (
    <div className="space-y-6">
      {business.locations.map((location) => {
        const employees = business.employees.filter((e) => e.locationId === location.id);
        return (
          <GameCard
            key={location.id}
            title={`${location.name} Staff`}
            subtitle={`${employees.length} employee${employees.length !== 1 ? 's' : ''}`}
            icon={<Users size={16} />}
            action={<GameButton size="sm" icon={<UserPlus size={14} />} onClick={() => setHiringLocationId(location.id)}>Hire</GameButton>}
          >
            {employees.length === 0 ? (
              <EmptyState
                icon={<Users size={32} />}
                title="No employees yet"
                description={`${location.name} currently has no employees. Hire staff to increase capacity and service quality.`}
                action={<GameButton size="sm" icon={<UserPlus size={14} />} onClick={() => setHiringLocationId(location.id)}>Hire Employee</GameButton>}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {employees.map((employee) => (
                  <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    companyVehicles={business.companyVehicles}
                    companyPhones={business.companyPhones}
                    onFire={() => fireEmployee(business.id, employee.id)}
                    onRaise={(salary) => giveRaise(business.id, employee.id, salary)}
                    onBenefitsChange={(patch) => updateEmployeeBenefits(business.id, employee.id, patch)}
                  />
                ))}
              </div>
            )}
          </GameCard>
        );
      })}

      {hiringLocationId && (
        <HiringModal
          open
          onClose={() => setHiringLocationId(null)}
          businessId={business.id}
          locationId={hiringLocationId}
        />
      )}
    </div>
  );
}
