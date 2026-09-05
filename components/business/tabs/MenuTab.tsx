'use client';

import { UtensilsCrossed } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import type { Business } from '@/game/types';
import { GameCard } from '@/components/ui/GameCard';
import { ProductRow } from '@/components/business/ProductRow';

export function MenuTab({ business }: { business: Business }) {
  const setMenuItemPrice = useGameStore((s) => s.setMenuItemPrice);
  const setMenuItemActive = useGameStore((s) => s.setMenuItemActive);
  const setIngredientTier = useGameStore((s) => s.setIngredientTier);

  const marketAvgPrice = business.locations.length > 0
    ? business.locations.reduce((s, l) => s + l.marketAvgPrice, 0) / business.locations.length
    : 0;

  return (
    <GameCard title="Menu" subtitle="Adjust pricing and ingredient quality for each item" icon={<UtensilsCrossed size={16} />}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {business.menu.map((item) => (
          <ProductRow
            key={item.id}
            item={item}
            marketAvgPrice={marketAvgPrice}
            onPriceChange={(price) => setMenuItemPrice(business.id, item.id, price)}
            onTierChange={(tier) => setIngredientTier(business.id, item.id, tier)}
            onToggleActive={() => setMenuItemActive(business.id, item.id, !item.active)}
          />
        ))}
      </div>
    </GameCard>
  );
}
