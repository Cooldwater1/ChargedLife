import {
  BASE_LOCATION_STORAGE_CAPACITY, INGREDIENT_DEFINITIONS, MARKET_TREND_TEMPLATES, SUPPLIER_DEFINITIONS, SUPPLIER_EVENT_TEMPLATES,
  instantiateMarketTrend, instantiateSupplierEvent,
} from '@/game/constants/inventory';
import { generateId } from '@/lib/id';
import { pickOne } from '@/lib/random';
import type {
  Business, InventoryAutomationLevel, LocationInventory, MarketTrend, MenuItem, PendingDelivery, SupplierMarketEvent, WasteLogEntry,
} from '@/game/types';

export function getExtraWarehouseCapacity(business: Business): number {
  return business.warehouses.reduce((s, w) => s + w.capacity, 0);
}

export function getLocationStorageCapacity(business: Business): number {
  return BASE_LOCATION_STORAGE_CAPACITY + getExtraWarehouseCapacity(business);
}

export function getTotalStockUnits(inventory: LocationInventory): number {
  return Object.values(inventory.stocks).reduce((s, q) => s + q, 0) + inventory.pendingDeliveries.reduce((s, d) => s + d.quantity, 0);
}

export function getEffectiveSupplierPriceMultiplier(supplierId: string, activeSupplierEvents: SupplierMarketEvent[]): number {
  const supplier = SUPPLIER_DEFINITIONS.find((s) => s.id === supplierId);
  const base = supplier?.priceMultiplier ?? 1;
  const eventDelta = activeSupplierEvents.filter((e) => e.supplierId === supplierId).reduce((s, e) => s + e.priceMultiplierDelta, 0);
  return Math.max(0.3, base + eventDelta);
}

export function calculateOrderCost(
  ingredientId: string, quantity: number, supplierId: string, activeSupplierEvents: SupplierMarketEvent[],
  isEmergency: boolean, emergencyPremiumPct: number,
): number {
  const ingredient = INGREDIENT_DEFINITIONS.find((i) => i.id === ingredientId);
  if (!ingredient || quantity <= 0) return 0;
  const supplier = SUPPLIER_DEFINITIONS.find((s) => s.id === supplierId);
  let unitPrice = ingredient.basePricePerUnit * getEffectiveSupplierPriceMultiplier(supplierId, activeSupplierEvents);
  if (supplier && quantity >= supplier.volumeDiscountThreshold) unitPrice *= 1 - supplier.volumeDiscountPct / 100;
  if (isEmergency) unitPrice *= 1 + emergencyPremiumPct / 100;
  return Math.round(unitPrice * quantity * 100) / 100;
}

/** Weights each active menu item's recipe by its popularity share to get a single "per customer" ingredient consumption profile. */
export function calculateBlendedRecipePerCustomer(menu: MenuItem[]): Record<string, number> {
  const activeItems = menu.filter((m) => m.active && m.recipe.length > 0);
  const totalPopularity = activeItems.reduce((s, m) => s + m.popularity, 0) || 1;
  const blended: Record<string, number> = {};
  for (const item of activeItems) {
    const share = item.popularity / totalPopularity;
    for (const req of item.recipe) {
      blended[req.ingredientId] = (blended[req.ingredientId] ?? 0) + req.quantity * share;
    }
  }
  return blended;
}

/** How many customers current stock can actually serve today. Infinity when nothing meaningfully constrains it. */
export function calculateMaxServableFromStock(inventory: LocationInventory, blendedRecipe: Record<string, number>): { maxServable: number; limitingIngredientId: string | null } {
  let maxServable = Infinity;
  let limitingIngredientId: string | null = null;
  for (const [ingredientId, perCustomer] of Object.entries(blendedRecipe)) {
    if (perCustomer <= 0) continue;
    const servable = (inventory.stocks[ingredientId] ?? 0) / perCustomer;
    if (servable < maxServable) {
      maxServable = servable;
      limitingIngredientId = ingredientId;
    }
  }
  return { maxServable, limitingIngredientId };
}

/** Depletes real stock for the customers actually served today, and updates the rolling daily-usage average used for forecasting. */
export function consumeIngredientsForCustomers(inventory: LocationInventory, blendedRecipe: Record<string, number>, customersServed: number): LocationInventory {
  const stocks = { ...inventory.stocks };
  const avgDailyUsage = { ...inventory.avgDailyUsage };
  for (const [ingredientId, perCustomer] of Object.entries(blendedRecipe)) {
    const used = perCustomer * customersServed;
    stocks[ingredientId] = Math.max(0, (stocks[ingredientId] ?? 0) - used);
    avgDailyUsage[ingredientId] = (avgDailyUsage[ingredientId] ?? 0) * 0.9 + used * 0.1;
  }
  return { ...inventory, stocks, avgDailyUsage };
}

export function calculateDaysRemaining(inventory: LocationInventory, ingredientId: string): number | null {
  const usage = inventory.avgDailyUsage[ingredientId] ?? 0;
  if (usage <= 0) return null;
  return (inventory.stocks[ingredientId] ?? 0) / usage;
}

/** Moves any delivery whose arrival day has passed into on-hand stock. */
export function processArrivedDeliveries(inventory: LocationInventory, dayIndex: number): { inventory: LocationInventory; arrived: PendingDelivery[] } {
  const arrived = inventory.pendingDeliveries.filter((d) => d.arrivesAtDayIndex <= dayIndex);
  if (arrived.length === 0) return { inventory, arrived: [] };
  const stocks = { ...inventory.stocks };
  for (const d of arrived) stocks[d.ingredientId] = (stocks[d.ingredientId] ?? 0) + d.quantity;
  const pendingDeliveries = inventory.pendingDeliveries.filter((d) => d.arrivesAtDayIndex > dayIndex);
  return { inventory: { ...inventory, stocks, pendingDeliveries }, arrived };
}

/** Places any recurring order whose weekday has arrived, honoring available storage capacity. */
export function rollRecurringOrders(
  inventory: LocationInventory, weekday: number, dayIndex: number, storageCapacityRemaining: number, activeSupplierEvents: SupplierMarketEvent[],
): { inventory: LocationInventory; deliveries: PendingDelivery[]; totalCost: number; skipped: { orderId: string; reason: string }[] } {
  let remaining = storageCapacityRemaining;
  const deliveries: PendingDelivery[] = [];
  const skipped: { orderId: string; reason: string }[] = [];
  let totalCost = 0;
  const recurringOrders = inventory.recurringOrders.map((order) => {
    if (!order.active || order.orderWeekday !== weekday) return order;
    if (order.quantity > remaining) {
      skipped.push({ orderId: order.id, reason: 'Not enough storage capacity' });
      return order;
    }
    const cost = calculateOrderCost(order.ingredientId, order.quantity, order.supplierId, activeSupplierEvents, false, 0);
    totalCost += cost;
    remaining -= order.quantity;
    deliveries.push({ id: generateId('delivery'), ingredientId: order.ingredientId, quantity: order.quantity, cost, arrivesAtDayIndex: dayIndex + order.leadTimeDays, isEmergency: false });
    return { ...order, lastPlacedAt: dayIndex };
  });
  const pendingDeliveries = [...inventory.pendingDeliveries, ...deliveries];
  return { inventory: { ...inventory, recurringOrders, pendingDeliveries }, deliveries, totalCost, skipped };
}

export function createInstantDelivery(
  ingredientId: string, quantity: number, supplierId: string, activeSupplierEvents: SupplierMarketEvent[], premiumPct: number, dayIndex: number,
): PendingDelivery {
  const cost = calculateOrderCost(ingredientId, quantity, supplierId, activeSupplierEvents, true, premiumPct);
  return { id: generateId('delivery'), ingredientId, quantity, cost, arrivesAtDayIndex: dayIndex, isEmergency: true };
}

/**
 * Assisted/Automatic inventory management. A skilled manager (managerCompetence near 100)
 * scales its restocking target up ahead of an active demand trend; a weak manager applies mostly
 * noise instead of real foresight — this is what makes "hire a good Inventory Manager" a real
 * decision rather than a guaranteed bonus. Manual mode does nothing (the player orders by hand).
 */
export function runInventoryManagerAutomation(
  inventory: LocationInventory,
  automationLevel: InventoryAutomationLevel,
  managerCompetence: number,
  dayIndex: number,
  activeTrends: MarketTrend[],
  storageCapacityRemaining: number,
  activeSupplierEvents: SupplierMarketEvent[],
  rng: () => number,
): { inventory: LocationInventory; deliveries: PendingDelivery[]; totalCost: number; notes: string[] } {
  if (automationLevel === 'manual') return { inventory, deliveries: [], totalCost: 0, notes: [] };

  const deliveries: PendingDelivery[] = [];
  const notes: string[] = [];
  let totalCost = 0;
  let budgetRemaining = inventory.weeklyPurchasingBudget;
  let capacityRemaining = storageCapacityRemaining;

  const trendBoost = activeTrends.length > 0 ? Math.max(...activeTrends.map((t) => t.demandMultiplier)) : 1;
  const skillFactor = Math.max(0, Math.min(1, managerCompetence / 100));
  const forecastNoise = (rng() - 0.5) * (1 - skillFactor) * 1.2; // a weak manager reacts mostly at random, +/- up to 60%
  const effectiveTrendAdjustment = Math.max(0.5, 1 + (trendBoost - 1) * skillFactor + forecastNoise);

  for (const ingredient of INGREDIENT_DEFINITIONS) {
    const usage = inventory.avgDailyUsage[ingredient.id] ?? 0;
    if (usage <= 0) continue;
    const currentStock = inventory.stocks[ingredient.id] ?? 0;
    const daysRemaining = currentStock / usage;
    const targetDays = inventory.minStockTargetDays * effectiveTrendAdjustment;
    if (daysRemaining >= targetDays) continue;

    const targetQuantity = Math.max(0, Math.round(usage * targetDays - currentStock));
    if (targetQuantity <= 0) continue;

    const isCritical = daysRemaining < 1 && automationLevel === 'automatic' && inventory.emergencyDeliveryAllowed;
    const cost = calculateOrderCost(ingredient.id, targetQuantity, inventory.primarySupplierId, activeSupplierEvents, isCritical, 35);
    if (cost > budgetRemaining) { notes.push(`Skipped restocking ${ingredient.name} — over weekly budget.`); continue; }
    if (targetQuantity > capacityRemaining) { notes.push(`Skipped restocking ${ingredient.name} — not enough storage.`); continue; }

    budgetRemaining -= cost;
    capacityRemaining -= targetQuantity;
    totalCost += cost;
    deliveries.push({
      id: generateId('delivery'), ingredientId: ingredient.id, quantity: targetQuantity, cost,
      arrivesAtDayIndex: dayIndex + (isCritical ? 0 : 1), isEmergency: isCritical,
    });
    if (isCritical) notes.push(`${ingredient.name} was critically low — automation placed an emergency order.`);
  }

  const pendingDeliveries = [...inventory.pendingDeliveries, ...deliveries];
  return { inventory: { ...inventory, pendingDeliveries }, deliveries, totalCost, notes };
}

export function rollMarketTrendStart(business: Business, dayIndex: number, rng: () => number): MarketTrend | null {
  if (business.activeMarketTrends.length > 0) return null;
  if (rng() > 0.03) return null;
  return instantiateMarketTrend(pickOne(rng, MARKET_TREND_TEMPLATES), dayIndex, rng);
}

export function rollSupplierEventStart(business: Business, dayIndex: number, rng: () => number): SupplierMarketEvent | null {
  if (rng() > 0.02) return null;
  const supplier = pickOne(rng, SUPPLIER_DEFINITIONS);
  if (business.activeSupplierEvents.some((e) => e.supplierId === supplier.id)) return null;
  return instantiateSupplierEvent(pickOne(rng, SUPPLIER_EVENT_TEMPLATES), supplier.id, dayIndex, rng);
}

export function expireOldEntries<T extends { startedAt: number; durationDays: number }>(entries: T[], dayIndex: number): T[] {
  return entries.filter((e) => dayIndex - e.startedAt < e.durationDays);
}

/** Aggregate demand multiplier for a location from all active market trends, weighted by each affected item's popularity share. */
export function calculateTrendDemandMultiplier(menu: MenuItem[], activeTrends: MarketTrend[]): number {
  if (activeTrends.length === 0) return 1;
  const activeItems = menu.filter((m) => m.active);
  const totalPopularity = activeItems.reduce((s, m) => s + m.popularity, 0) || 1;
  let weighted = 0;
  for (const item of activeItems) {
    const trend = activeTrends.find((t) => t.affectedMenuItemNames.includes(item.name));
    weighted += (trend ? trend.demandMultiplier : 1) * (item.popularity / totalPopularity);
  }
  return weighted;
}

/**
 * Weekly waste summary — deliberately not a per-batch spoilage simulation. Any ingredient stocked
 * well beyond what its shelf life can support before it's used loses a slice to spoilage, with a
 * plain-English root cause the player can act on.
 */
export function calculateWeeklyWaste(inventory: LocationInventory, dayIndex: number): { entries: WasteLogEntry[]; totalWasted: number } {
  const entries: WasteLogEntry[] = [];
  let totalWasted = 0;
  for (const ingredient of INGREDIENT_DEFINITIONS) {
    const usage = inventory.avgDailyUsage[ingredient.id] ?? 0;
    const stock = inventory.stocks[ingredient.id] ?? 0;
    if (usage <= 0 || stock <= 0) continue;
    const maxHealthyStock = usage * ingredient.shelfLifeDays;
    if (stock <= maxHealthyStock * 1.2) continue;
    const excessUnits = stock - maxHealthyStock;
    const wastedUnits = excessUnits * 0.05;
    const wastedValue = Math.round(wastedUnits * ingredient.basePricePerUnit * 100) / 100;
    if (wastedValue < 1) continue;
    totalWasted += wastedValue;
    entries.push({
      id: generateId('waste'), timestamp: dayIndex, amountWasted: wastedValue, ingredientId: ingredient.id,
      reason: `Over-ordering ${ingredient.name.toLowerCase()} relative to how fast it's used and its shelf life.`,
    });
  }
  return { entries, totalWasted };
}
