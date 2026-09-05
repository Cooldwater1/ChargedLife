import { MapPin, Users } from 'lucide-react';
import type { BusinessLocation } from '@/game/types';
import { formatMoney } from '@/lib/format';
import { StatusBadge } from '@/components/ui/StatusBadge';

const COMPETITION_TONE = { low: 'success', medium: 'warning', high: 'danger' } as const;

export function LocationCard({ location, employeeCount }: { location: BusinessLocation; employeeCount: number }) {
  return (
    <div className="cl-panel p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold text-cl-text-primary flex items-center gap-1.5"><MapPin size={14} className="text-cl-text-muted" /> {location.name}</p>
        <StatusBadge label={location.competition} tone={COMPETITION_TONE[location.competition]} />
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs mt-3">
        <div>
          <p className="text-cl-text-muted mb-0.5">Monthly Rent</p>
          <p className="text-cl-text-primary font-medium">{formatMoney(location.rent)}</p>
        </div>
        <div>
          <p className="text-cl-text-muted mb-0.5">Employees</p>
          <p className="text-cl-text-primary font-medium flex items-center gap-1"><Users size={12} /> {employeeCount}</p>
        </div>
        <div>
          <p className="text-cl-text-muted mb-0.5">Last-Day Customers</p>
          <p className="text-cl-text-primary font-medium">{location.lastActualCustomers}</p>
        </div>
        <div>
          <p className="text-cl-text-muted mb-0.5">Avg. Wait Time</p>
          <p className="text-cl-text-primary font-medium">{location.lastWaitTimeMinutes.toFixed(1)} min</p>
        </div>
      </div>
    </div>
  );
}
