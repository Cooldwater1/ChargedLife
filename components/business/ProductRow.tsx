'use client';

import { useState } from 'react';
import type { IngredientTier, MenuItem } from '@/game/types';
import { formatMoney, formatPercent } from '@/lib/format';
import { cn } from '@/lib/cn';

interface ProductRowProps {
  item: MenuItem;
  marketAvgPrice: number;
  onPriceChange: (price: number) => void;
  onTierChange: (tier: IngredientTier) => void;
  onToggleActive: () => void;
}

const TIERS: IngredientTier[] = ['budget', 'standard', 'premium'];
const TIER_LABELS: Record<IngredientTier, string> = { budget: 'Budget', standard: 'Standard', premium: 'Premium' };

export function ProductRow({ item, marketAvgPrice, onPriceChange, onTierChange, onToggleActive }: ProductRowProps) {
  const [draftPrice, setDraftPrice] = useState(item.price.toString());
  const margin = item.price > 0 ? ((item.price - item.cost) / item.price) * 100 : 0;
  const vsMarket = marketAvgPrice > 0 ? ((item.price - marketAvgPrice) / marketAvgPrice) * 100 : 0;

  const commitPrice = () => {
    const parsed = Number(draftPrice);
    if (!Number.isNaN(parsed) && parsed > 0) onPriceChange(parsed);
    else setDraftPrice(item.price.toString());
  };

  return (
    <div className={cn('cl-panel p-4', !item.active && 'opacity-50')}>
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-cl-text-primary">{item.name}</p>
        <button
          onClick={onToggleActive}
          className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', item.active ? 'border-cl-positive/25 bg-cl-positive/10 text-cl-positive' : 'border-cl-border-strong text-cl-text-muted')}
        >
          {item.active ? 'On Menu' : 'Removed'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-3">
        <div>
          <p className="text-cl-text-muted">Production Cost</p>
          <p className="text-cl-text-primary font-medium">{formatMoney(item.cost)}</p>
        </div>
        <div>
          <p className="text-cl-text-muted">Profit / Unit</p>
          <p className="text-cl-positive font-medium">{formatMoney(item.price - item.cost)}</p>
        </div>
        <div>
          <p className="text-cl-text-muted">Margin</p>
          <p className="text-cl-text-primary font-medium">{formatPercent(margin, { decimals: 1 })}</p>
        </div>
        <div>
          <p className="text-cl-text-muted">vs. Market Avg</p>
          <p className={vsMarket > 0 ? 'text-cl-warning font-medium' : 'text-cl-positive font-medium'}>{formatPercent(vsMarket, { showSign: true, decimals: 0 })}</p>
        </div>
      </div>

      <label className="block text-xs text-cl-text-muted mb-1">Selling Price</label>
      <div className="flex gap-2 mb-3">
        <input
          value={draftPrice}
          onChange={(e) => setDraftPrice(e.target.value)}
          onBlur={commitPrice}
          onKeyDown={(e) => e.key === 'Enter' && commitPrice()}
          className="w-full rounded-md bg-white/[0.05] border border-cl-border-strong px-2.5 py-1.5 text-sm text-cl-text-primary focus:outline-none focus:border-cl-accent"
        />
      </div>

      <label className="block text-xs text-cl-text-muted mb-1">Ingredient Quality</label>
      <div className="flex gap-1.5">
        {TIERS.map((tier) => (
          <button
            key={tier}
            onClick={() => onTierChange(tier)}
            className={cn(
              'flex-1 text-xs px-2 py-1.5 rounded-md border font-medium transition-colors',
              item.ingredientTier === tier ? 'border-cl-accent bg-cl-accent/10 text-cl-accent' : 'border-cl-border-strong text-cl-text-secondary hover:text-cl-text-primary',
            )}
          >
            {TIER_LABELS[tier]}
          </button>
        ))}
      </div>
    </div>
  );
}
