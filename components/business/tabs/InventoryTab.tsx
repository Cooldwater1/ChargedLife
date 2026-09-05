'use client';

import { useState } from 'react';
import { AlertTriangle, Package, Truck, Warehouse as WarehouseIcon } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import {
  INGREDIENT_DEFINITIONS, SUPPLIER_DEFINITIONS, WAREHOUSE_TIER_DEFS, getIngredientName,
  INSTANT_DELIVERY_MIN_PREMIUM_PCT, INSTANT_DELIVERY_MAX_PREMIUM_PCT,
} from '@/game/constants/inventory';
import { calculateDaysRemaining, calculateOrderCost, getEffectiveSupplierPriceMultiplier, getExtraWarehouseCapacity, getLocationStorageCapacity, getTotalStockUnits } from '@/game/simulation/inventory';
import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/cn';
import { GameCard } from '@/components/ui/GameCard';
import { GameButton } from '@/components/ui/GameButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { HelpTip } from '@/components/ui/HelpTip';
import { Select } from '@/components/ui/Select';
import type { Business, FundingSource, InventoryAutomationLevel, WarehouseTier } from '@/game/types';

const WEEKDAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const AUTOMATION_LEVELS: InventoryAutomationLevel[] = ['manual', 'assisted', 'automatic'];

function stockStatus(daysRemaining: number | null, targetDays: number): { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' } {
  if (daysRemaining === null) return { label: 'No usage yet', tone: 'neutral' };
  if (daysRemaining <= 0) return { label: 'OUT OF STOCK', tone: 'danger' };
  if (daysRemaining < 1) return { label: 'Critical', tone: 'danger' };
  if (daysRemaining < targetDays * 0.6) return { label: 'Low', tone: 'warning' };
  return { label: 'Good', tone: 'success' };
}

export function InventoryTab({ business }: { business: Business }) {
  const personalCash = useGameStore((s) => s.game?.player.cash ?? 0);
  const dayIndex = useGameStore((s) => s.game?.time.dayIndex ?? 0);
  const placeManualInventoryOrder = useGameStore((s) => s.placeManualInventoryOrder);
  const placeInstantInventoryOrder = useGameStore((s) => s.placeInstantInventoryOrder);
  const addRecurringInventoryOrder = useGameStore((s) => s.addRecurringInventoryOrder);
  const updateRecurringInventoryOrder = useGameStore((s) => s.updateRecurringInventoryOrder);
  const removeRecurringInventoryOrder = useGameStore((s) => s.removeRecurringInventoryOrder);
  const runRecurringInventoryOrderNow = useGameStore((s) => s.runRecurringInventoryOrderNow);
  const setInventoryAutomationLevel = useGameStore((s) => s.setInventoryAutomationLevel);
  const setInventorySettings = useGameStore((s) => s.setInventorySettings);
  const purchaseWarehouse = useGameStore((s) => s.purchaseWarehouse);

  const [selectedLocationId, setSelectedLocationId] = useState(business.locations[0]?.id ?? '');
  const [orderQuantities, setOrderQuantities] = useState<Record<string, string>>({});
  const [newOrderIngredient, setNewOrderIngredient] = useState(INGREDIENT_DEFINITIONS[0].id);
  const [newOrderQuantity, setNewOrderQuantity] = useState('300');
  const [newOrderWeekday, setNewOrderWeekday] = useState('0');
  const [warehouseFunding, setWarehouseFunding] = useState<FundingSource>('business');

  const location = business.locations.find((l) => l.id === selectedLocationId) ?? business.locations[0];
  if (!location) return <p className="text-sm text-cl-text-muted">This business has no locations yet.</p>;

  const inventory = location.inventory;
  const storageCapacity = getLocationStorageCapacity(business);
  const storageUsed = getTotalStockUnits(inventory);
  const inventoryManager = business.managers.find((m) => m.role === 'inventory_manager' && (m.locationId === location.id || m.locationId === null));

  return (
    <div className="space-y-6">
      {business.activeMarketTrends.length > 0 && (
        <div className="space-y-2">
          {business.activeMarketTrends.map((trend) => {
            const daysLeft = Math.max(0, trend.startedAt + trend.durationDays - dayIndex);
            return (
              <AlertBanner
                key={trend.id} tone="info" title={trend.name}
                message={`${trend.description} Demand for ${trend.affectedMenuItemNames.join(', ')} is ${trend.demandMultiplier >= 1 ? 'up' : 'down'} ${Math.abs(Math.round((trend.demandMultiplier - 1) * 100))}% — ~${daysLeft} day(s) remaining.`}
              />
            );
          })}
        </div>
      )}
      {business.activeSupplierEvents.map((event) => {
        const supplier = SUPPLIER_DEFINITIONS.find((s) => s.id === event.supplierId);
        return (
          <AlertBanner
            key={event.id} tone={event.priceMultiplierDelta > 0 ? 'warning' : 'info'} title={`${event.name} — ${supplier?.name ?? 'Supplier'}`}
            message={`${event.description} Pricing ${event.priceMultiplierDelta >= 0 ? '+' : ''}${Math.round(event.priceMultiplierDelta * 100)}%.`}
          />
        );
      })}

      {business.locations.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {business.locations.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelectedLocationId(l.id)}
              className={cn('px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors', location.id === l.id ? 'border-cl-accent bg-cl-accent/10 text-cl-accent' : 'border-cl-border-strong text-cl-text-secondary')}
            >
              {l.name}
            </button>
          ))}
        </div>
      )}

      <GameCard title="Storage" icon={<WarehouseIcon size={16} />} subtitle={`${storageUsed.toLocaleString('en-US')} / ${storageCapacity.toLocaleString('en-US')} units used across this location`}>
        <div className="mb-4 h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <div className={cn('h-full', storageUsed / storageCapacity > 0.9 ? 'bg-cl-negative' : 'bg-cl-accent')} style={{ width: `${Math.min(100, (storageUsed / storageCapacity) * 100)}%` }} />
        </div>
        <p className="text-xs text-cl-text-muted mb-3">Base capacity 5,000 + {getExtraWarehouseCapacity(business).toLocaleString('en-US')} from owned warehouses.</p>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-cl-text-secondary uppercase tracking-wide">Buy Warehouse Capacity</p>
          <div className="flex gap-1 rounded-lg border border-cl-border-strong bg-white/[0.03] p-0.5">
            {(['business', 'personal'] as const).map((source) => (
              <button key={source} onClick={() => setWarehouseFunding(source)} className={cn('px-2.5 py-1 rounded-md text-xs font-medium', warehouseFunding === source ? 'bg-cl-accent-strong text-white' : 'text-cl-text-secondary')}>
                {source === 'business' ? 'Business' : 'Personal'}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {WAREHOUSE_TIER_DEFS.map((tier) => {
            const available = warehouseFunding === 'business' ? business.cash : personalCash;
            return (
              <div key={tier.tier} className="cl-panel p-3">
                <p className="text-sm font-semibold text-cl-text-primary mb-0.5">{tier.label}</p>
                <p className="text-xs text-cl-text-secondary mb-1">+{tier.capacity.toLocaleString('en-US')} capacity</p>
                <p className="text-xs text-cl-text-muted mb-3">{formatMoney(tier.price)} · {formatMoney(tier.monthlyCost)}/mo</p>
                <GameButton size="sm" fullWidth disabledReason={available < tier.price ? 'Not enough funds' : undefined} onClick={() => purchaseWarehouse(business.id, tier.tier as WarehouseTier, warehouseFunding)}>
                  Purchase
                </GameButton>
              </div>
            );
          })}
        </div>
        {business.warehouses.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {business.warehouses.map((w) => (
              <p key={w.id} className="text-xs text-cl-text-muted">{WAREHOUSE_TIER_DEFS.find((t) => t.tier === w.tier)?.label} — +{w.capacity.toLocaleString('en-US')} capacity, {formatMoney(w.monthlyCost)}/mo</p>
            ))}
          </div>
        )}
      </GameCard>

      <GameCard title="Ingredients" subtitle={`${location.name} — stock, usage, and ordering`} icon={<Package size={16} />}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-cl-text-muted text-left border-b border-cl-border">
                <th className="py-2 pr-3">Ingredient</th>
                <th className="py-2 pr-3 text-right">Stock</th>
                <th className="py-2 pr-3 text-right">Avg Daily Use</th>
                <th className="py-2 pr-3 text-right">Days Left</th>
                <th className="py-2 pr-3 text-right">Price/Unit</th>
                <th className="py-2 pr-3">Incoming</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Order</th>
              </tr>
            </thead>
            <tbody>
              {INGREDIENT_DEFINITIONS.map((ing) => {
                const stock = inventory.stocks[ing.id] ?? 0;
                const usage = inventory.avgDailyUsage[ing.id] ?? 0;
                const daysRemaining = calculateDaysRemaining(inventory, ing.id);
                const status = stockStatus(daysRemaining, inventory.minStockTargetDays);
                const incoming = inventory.pendingDeliveries.filter((d) => d.ingredientId === ing.id);
                const incomingQty = incoming.reduce((s, d) => s + d.quantity, 0);
                const price = ing.basePricePerUnit * getEffectiveSupplierPriceMultiplier(inventory.primarySupplierId, business.activeSupplierEvents);
                const qtyDraft = orderQuantities[ing.id] ?? '';
                const qty = Number(qtyDraft) || 0;
                const orderCost = calculateOrderCost(ing.id, qty, inventory.primarySupplierId, business.activeSupplierEvents, false, 0);
                const instantPremium = INSTANT_DELIVERY_MIN_PREMIUM_PCT + (INSTANT_DELIVERY_MAX_PREMIUM_PCT - INSTANT_DELIVERY_MIN_PREMIUM_PCT) * Math.min(1, qty / 500);
                const instantCost = calculateOrderCost(ing.id, qty, inventory.primarySupplierId, business.activeSupplierEvents, true, instantPremium);
                return (
                  <tr key={ing.id} className="border-b border-cl-border last:border-0">
                    <td className="py-2 pr-3 text-cl-text-primary font-medium">{ing.name}</td>
                    <td className="py-2 pr-3 text-right text-cl-text-secondary tabular-nums">{Math.round(stock).toLocaleString('en-US')}</td>
                    <td className="py-2 pr-3 text-right text-cl-text-secondary tabular-nums">{usage.toFixed(1)}</td>
                    <td className="py-2 pr-3 text-right text-cl-text-secondary tabular-nums">{daysRemaining === null ? '—' : daysRemaining.toFixed(1)}</td>
                    <td className="py-2 pr-3 text-right text-cl-text-secondary tabular-nums">{formatMoney(price)}</td>
                    <td className="py-2 pr-3 text-cl-text-muted">{incomingQty > 0 ? `${incomingQty.toLocaleString('en-US')} incoming` : '—'}</td>
                    <td className="py-2 pr-3"><StatusBadge label={status.label} tone={status.tone} /></td>
                    <td className="py-2">
                      <div className="flex items-center gap-1.5">
                        <input
                          value={qtyDraft} placeholder="qty"
                          onChange={(e) => setOrderQuantities((prev) => ({ ...prev, [ing.id]: e.target.value }))}
                          className="w-16 rounded-md bg-white/[0.05] border border-cl-border-strong px-2 py-1 text-xs text-cl-text-primary"
                        />
                        <GameButton size="sm" variant="secondary" disabledReason={qty <= 0 ? 'Enter a quantity' : business.cash < orderCost ? 'Not enough business cash' : undefined} onClick={() => placeManualInventoryOrder(business.id, location.id, ing.id, qty)}>
                          Order {qty > 0 ? formatMoney(orderCost) : ''}
                        </GameButton>
                        <GameButton size="sm" variant="ghost" icon={<Truck size={12} />} disabledReason={qty <= 0 ? 'Enter a quantity' : business.cash < instantCost ? 'Not enough business cash' : undefined} onClick={() => placeInstantInventoryOrder(business.id, location.id, ing.id, qty)}>
                          Instant {qty > 0 ? formatMoney(instantCost) : ''}
                        </GameButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GameCard>

      <GameCard
        title="Recurring Orders"
        subtitle="Placed automatically every week on the chosen day"
        icon={<Truck size={16} />}
      >
        {inventory.recurringOrders.length === 0 ? (
          <p className="text-sm text-cl-text-muted mb-4">No recurring orders set up yet.</p>
        ) : (
          <div className="space-y-2 mb-5">
            {inventory.recurringOrders.map((order) => (
              <div key={order.id} className="cl-panel p-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-cl-text-primary">
                    {order.quantity.toLocaleString('en-US')} {getIngredientName(order.ingredientId)} every {WEEKDAY_LABELS[order.orderWeekday]}
                  </p>
                  <p className="text-xs text-cl-text-muted">
                    Delivers {order.leadTimeDays} day{order.leadTimeDays === 1 ? '' : 's'} later · {order.active ? 'Active' : 'Paused'}
                    {order.lastPlacedAt !== null ? ` · last placed day ${order.lastPlacedAt}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <GameButton
                    size="sm" variant="ghost"
                    disabledReason={business.cash < calculateOrderCost(order.ingredientId, order.quantity, order.supplierId, business.activeSupplierEvents, false, 0) ? 'Not enough business cash' : undefined}
                    onClick={() => runRecurringInventoryOrderNow(business.id, location.id, order.id)}
                  >
                    Run Now
                  </GameButton>
                  <GameButton size="sm" variant="secondary" onClick={() => updateRecurringInventoryOrder(business.id, location.id, order.id, { active: !order.active })}>
                    {order.active ? 'Pause' : 'Resume'}
                  </GameButton>
                  <GameButton size="sm" variant="danger" onClick={() => removeRecurringInventoryOrder(business.id, location.id, order.id)}>Cancel</GameButton>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Add Recurring Order</p>
        <div className="flex flex-wrap items-center gap-2">
          <Select className="w-48" value={newOrderIngredient} onChange={setNewOrderIngredient} options={INGREDIENT_DEFINITIONS.map((i) => ({ value: i.id, label: i.name }))} />
          <input value={newOrderQuantity} onChange={(e) => setNewOrderQuantity(e.target.value)} className="w-24 rounded-md bg-white/[0.05] border border-cl-border-strong px-2 py-1.5 text-sm text-cl-text-primary" />
          <Select className="w-40" value={newOrderWeekday} onChange={setNewOrderWeekday} options={WEEKDAY_LABELS.map((label, i) => ({ value: String(i), label: `Order ${label}` }))} />
          <GameButton
            size="sm"
            disabledReason={Number(newOrderQuantity) <= 0 ? 'Enter a quantity' : undefined}
            onClick={() => addRecurringInventoryOrder(business.id, location.id, newOrderIngredient, Number(newOrderQuantity), Number(newOrderWeekday))}
          >
            Add
          </GameButton>
        </div>
      </GameCard>

      <GameCard
        title="Automation & Supplier"
        icon={<AlertTriangle size={16} />}
        action={<HelpTip text="Assisted and Automatic require a hired Inventory Manager — their Operations + Finance skill determines how well they forecast ahead of demand trends. A weak manager reacts mostly at random; a strong one pre-orders before a trend causes a stockout." />}
      >
        {!inventoryManager && (
          <AlertBanner tone="info" title="No Inventory Manager Hired" message="Automation levels beyond Manual require an Inventory Manager on staff — hire one from the Management tab." />
        )}
        <div className="flex flex-wrap gap-2 mb-4">
          {AUTOMATION_LEVELS.map((level) => (
            <button
              key={level}
              disabled={level !== 'manual' && !inventoryManager}
              onClick={() => setInventoryAutomationLevel(business.id, location.id, level)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize disabled:opacity-40 disabled:cursor-not-allowed',
                inventory.automationLevel === level ? 'border-cl-accent bg-cl-accent/10 text-cl-accent' : 'border-cl-border-strong text-cl-text-secondary',
              )}
            >
              {level}
            </button>
          ))}
        </div>

        <p className="text-xs text-cl-text-muted mb-2">Primary Supplier</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          {SUPPLIER_DEFINITIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setInventorySettings(business.id, location.id, { primarySupplierId: s.id })}
              className={cn('text-left rounded-lg border p-3 transition-colors', inventory.primarySupplierId === s.id ? 'border-cl-accent bg-cl-accent/10' : 'border-cl-border-strong hover:bg-white/[0.03]')}
            >
              <p className="text-xs font-medium text-cl-text-primary mb-1">{s.name}</p>
              <p className="text-[11px] text-cl-text-muted">×{s.priceMultiplier.toFixed(2)} price · {s.reliability}% reliable · {s.volumeDiscountPct}% off above {s.volumeDiscountThreshold.toLocaleString('en-US')}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Weekly Purchasing Budget</label>
            <input
              type="number" value={inventory.weeklyPurchasingBudget}
              onChange={(e) => setInventorySettings(business.id, location.id, { weeklyPurchasingBudget: Math.max(0, Number(e.target.value)) })}
              className="w-full rounded-md bg-white/[0.05] border border-cl-border-strong px-3 py-1.5 text-sm text-cl-text-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Minimum Stock Target (days)</label>
            <input
              type="number" value={inventory.minStockTargetDays}
              onChange={(e) => setInventorySettings(business.id, location.id, { minStockTargetDays: Math.max(1, Number(e.target.value)) })}
              className="w-full rounded-md bg-white/[0.05] border border-cl-border-strong px-3 py-1.5 text-sm text-cl-text-primary"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setInventorySettings(business.id, location.id, { emergencyDeliveryAllowed: !inventory.emergencyDeliveryAllowed })}
              className={cn('w-full px-3 py-2 rounded-lg text-xs font-medium border transition-colors', inventory.emergencyDeliveryAllowed ? 'border-cl-positive/30 bg-cl-positive/10 text-cl-positive' : 'border-cl-border-strong text-cl-text-secondary')}
            >
              Emergency Delivery: {inventory.emergencyDeliveryAllowed ? 'Allowed' : 'Not Allowed'} (Automatic mode)
            </button>
          </div>
        </div>
      </GameCard>

      {business.wasteLog.length > 0 && (
        <GameCard title="Waste Tracking" subtitle="Recent spoilage and its root cause" icon={<AlertTriangle size={16} />}>
          <div className="space-y-2 max-h-56 overflow-y-auto cl-scrollbar-thin">
            {business.wasteLog.slice(0, 15).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between text-sm">
                <span className="text-cl-text-secondary">{entry.reason}</span>
                <span className="text-cl-negative font-medium shrink-0 ml-3">{formatMoney(entry.amountWasted)}</span>
              </div>
            ))}
          </div>
        </GameCard>
      )}
    </div>
  );
}
