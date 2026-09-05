'use client';

import { useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import type { Business } from '@/game/types';
import { GameCard } from '@/components/ui/GameCard';
import { GameButton } from '@/components/ui/GameButton';
import { LocationCard } from '@/components/business/LocationCard';
import { OpenLocationModal } from '@/components/business/OpenLocationModal';

export function LocationsTab({ business }: { business: Business }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <GameCard
      title="Locations"
      icon={<MapPin size={16} />}
      action={<GameButton size="sm" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>Open New Location</GameButton>}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {business.locations.map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            employeeCount={business.employees.filter((e) => e.locationId === location.id).length}
          />
        ))}
      </div>
      <OpenLocationModal open={modalOpen} onClose={() => setModalOpen(false)} business={business} />
    </GameCard>
  );
}
