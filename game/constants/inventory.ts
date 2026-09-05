import { generateId } from '@/lib/id';
import type { IngredientDefinition, LocationInventory, MarketTrend, SupplierDefinition, SupplierMarketEvent, WarehouseTier } from '@/game/types';

export const INGREDIENT_DEFINITIONS: IngredientDefinition[] = [
  { id: 'patty', name: 'Burger Patties', unit: 'unit', basePricePerUnit: 1.35, shelfLifeDays: 90 },
  { id: 'chicken', name: 'Chicken', unit: 'unit', basePricePerUnit: 1.55, shelfLifeDays: 60 },
  { id: 'bun', name: 'Buns', unit: 'unit', basePricePerUnit: 0.35, shelfLifeDays: 10 },
  { id: 'cheese', name: 'Cheese', unit: 'unit', basePricePerUnit: 0.25, shelfLifeDays: 30 },
  { id: 'fries_potato', name: 'Frozen Fries', unit: 'portion', basePricePerUnit: 0.55, shelfLifeDays: 180 },
  { id: 'cooking_oil', name: 'Cooking Oil', unit: 'liter', basePricePerUnit: 3.2, shelfLifeDays: 120 },
  { id: 'soda_syrup', name: 'Soft Drink Syrup', unit: 'liter', basePricePerUnit: 4.5, shelfLifeDays: 365 },
  { id: 'cups', name: 'Cups', unit: 'unit', basePricePerUnit: 0.08, shelfLifeDays: 3650 },
  { id: 'packaging', name: 'Packaging', unit: 'unit', basePricePerUnit: 0.12, shelfLifeDays: 3650 },
  { id: 'sauce', name: 'Sauces', unit: 'unit', basePricePerUnit: 0.15, shelfLifeDays: 45 },
  { id: 'vegetable', name: 'Vegetables', unit: 'unit', basePricePerUnit: 0.3, shelfLifeDays: 7 },
];

export function getIngredientName(id: string): string {
  return INGREDIENT_DEFINITIONS.find((i) => i.id === id)?.name ?? id;
}

export const SUPPLIER_DEFINITIONS: SupplierDefinition[] = [
  { id: 'budget_foods', name: 'Budget Foods', tier: 'budget', priceMultiplier: 0.82, reliability: 65, volumeDiscountThreshold: 2_000, volumeDiscountPct: 3 },
  { id: 'regional_wholesale', name: 'Regional Wholesale', tier: 'standard', priceMultiplier: 1, reliability: 82, volumeDiscountThreshold: 800, volumeDiscountPct: 8 },
  { id: 'premium_supply_co', name: 'Premium Supply Co.', tier: 'premium', priceMultiplier: 1.35, reliability: 97, volumeDiscountThreshold: 1_500, volumeDiscountPct: 5 },
];

export const WAREHOUSE_TIER_DEFS: { tier: WarehouseTier; label: string; price: number; capacity: number; monthlyCost: number }[] = [
  { tier: 'small', label: 'Small Warehouse', price: 30_000, capacity: 15_000, monthlyCost: 900 },
  { tier: 'regional', label: 'Regional Warehouse', price: 150_000, capacity: 75_000, monthlyCost: 3_800 },
  { tier: 'distribution_center', label: 'Distribution Center', price: 1_000_000, capacity: 500_000, monthlyCost: 18_000 },
];

export const BASE_LOCATION_STORAGE_CAPACITY = 5_000;
export const INSTANT_DELIVERY_MIN_PREMIUM_PCT = 25;
export const INSTANT_DELIVERY_MAX_PREMIUM_PCT = 50;
export const INSTANT_DELIVERY_LEAD_DAYS = 0; // arrives same day

export interface MarketTrendTemplate {
  name: string;
  description: string;
  affectedMenuItemNames: string[];
  demandMultiplierRange: [number, number];
  durationDaysRange: [number, number];
}

export const MARKET_TREND_TEMPLATES: MarketTrendTemplate[] = [
  { name: 'Burger Demand Rising', description: 'Burgers are trending — demand is up across the board.', affectedMenuItemNames: ['Classic Burger', 'Cheeseburger'], demandMultiplierRange: [1.2, 1.45], durationDaysRange: [4, 8] },
  { name: 'Chicken Craving', description: 'A local food trend has consumers craving chicken.', affectedMenuItemNames: ['Chicken Burger'], demandMultiplierRange: [1.25, 1.5], durationDaysRange: [4, 7] },
  { name: 'Consumer Spending Falling', description: 'A soft local economy is pulling overall demand down.', affectedMenuItemNames: ['Classic Burger', 'Cheeseburger', 'Chicken Burger', 'Fries', 'Soft Drink'], demandMultiplierRange: [0.8, 0.92], durationDaysRange: [7, 14] },
  { name: 'Tourism Boom', description: 'A surge of visitors is boosting foot traffic citywide.', affectedMenuItemNames: ['Classic Burger', 'Cheeseburger', 'Chicken Burger', 'Fries', 'Soft Drink'], demandMultiplierRange: [1.15, 1.3], durationDaysRange: [5, 10] },
];

export interface SupplierEventTemplate {
  name: string;
  description: string;
  priceMultiplierDeltaRange: [number, number];
  durationDaysRange: [number, number];
}

export const SUPPLIER_EVENT_TEMPLATES: SupplierEventTemplate[] = [
  { name: 'Beef Price Increase', description: 'Beef costs are up industry-wide.', priceMultiplierDeltaRange: [0.08, 0.2], durationDaysRange: [10, 20] },
  { name: 'Potato Shortage', description: 'A regional potato shortage is driving up fry costs.', priceMultiplierDeltaRange: [0.1, 0.25], durationDaysRange: [7, 15] },
  { name: 'Supplier Strike', description: 'Labor action at this supplier is disrupting normal pricing.', priceMultiplierDeltaRange: [0.15, 0.3], durationDaysRange: [5, 12] },
  { name: 'Temporary Discount', description: 'This supplier is running a promotional discount.', priceMultiplierDeltaRange: [-0.2, -0.08], durationDaysRange: [5, 10] },
  { name: 'Fuel Cost Increase', description: 'Rising fuel costs are pushing up delivery surcharges.', priceMultiplierDeltaRange: [0.05, 0.12], durationDaysRange: [14, 30] },
  { name: 'Local Harvest Boom', description: 'A strong local harvest has pushed produce costs down.', priceMultiplierDeltaRange: [-0.15, -0.05], durationDaysRange: [7, 14] },
];

export function createDefaultLocationInventory(startingStockMultiplier = 1): LocationInventory {
  const stocks: Record<string, number> = {};
  const avgDailyUsage: Record<string, number> = {};
  for (const ing of INGREDIENT_DEFINITIONS) {
    stocks[ing.id] = Math.round(300 * startingStockMultiplier);
    avgDailyUsage[ing.id] = 0;
  }
  return {
    stocks,
    avgDailyUsage,
    pendingDeliveries: [],
    recurringOrders: [],
    primarySupplierId: 'regional_wholesale',
    automationLevel: 'manual',
    weeklyPurchasingBudget: 2_000,
    emergencyDeliveryAllowed: true,
    maxEmergencyPremiumPct: INSTANT_DELIVERY_MAX_PREMIUM_PCT,
    minStockTargetDays: 5,
  };
}

export function instantiateMarketTrend(template: MarketTrendTemplate, dayIndex: number, rng: () => number): MarketTrend {
  const [minMult, maxMult] = template.demandMultiplierRange;
  const [minDur, maxDur] = template.durationDaysRange;
  return {
    id: generateId('trend'),
    name: template.name,
    description: template.description,
    affectedMenuItemNames: template.affectedMenuItemNames,
    demandMultiplier: minMult + rng() * (maxMult - minMult),
    startedAt: dayIndex,
    durationDays: Math.round(minDur + rng() * (maxDur - minDur)),
  };
}

export function instantiateSupplierEvent(template: SupplierEventTemplate, supplierId: string, dayIndex: number, rng: () => number): SupplierMarketEvent {
  const [minDelta, maxDelta] = template.priceMultiplierDeltaRange;
  const [minDur, maxDur] = template.durationDaysRange;
  return {
    id: generateId('supplier-event'),
    supplierId,
    name: template.name,
    description: template.description,
    priceMultiplierDelta: minDelta + rng() * (maxDelta - minDelta),
    startedAt: dayIndex,
    durationDays: Math.round(minDur + rng() * (maxDur - minDur)),
  };
}
