import { describe, it, expect } from 'vitest';
import { createFastFoodBusiness } from '@/game/business/fastfood';
import { runDailySettlement } from '@/game/simulation/business';
import { toCalendarDate } from '@/game/time/calendar';
import { createRng } from '@/lib/random';
import { createDefaultLocationInventory } from '@/game/constants/inventory';
import {
  calculateBlendedRecipePerCustomer, calculateMaxServableFromStock, calculateOrderCost, calculateTrendDemandMultiplier,
  calculateWeeklyWaste, consumeIngredientsForCustomers, createInstantDelivery, getTotalStockUnits, runInventoryManagerAutomation,
} from '@/game/simulation/inventory';
import type { Manager, MarketTrend } from '@/game/types';

function nextWeekday(fromDayIndex: number, weekday: number): number {
  let d = fromDayIndex;
  while (toCalendarDate(d).weekday !== weekday) d += 1;
  return d;
}

describe('blended recipe consumption', () => {
  it('depletes real per-ingredient stock proportional to the popularity-weighted recipe', () => {
    const business = createFastFoodBusiness({ name: 'Test Co', city: 'Austin', investment: 80_000, dayIndex: 0 });
    const inventory = business.locations[0].inventory;
    const blended = calculateBlendedRecipePerCustomer(business.menu);

    // Buns are only used by the burger items, so consumption should match their popularity-weighted share exactly.
    const before = inventory.stocks.bun;
    const updated = consumeIngredientsForCustomers(inventory, blended, 50);
    expect(updated.stocks.bun).toBeCloseTo(before - blended.bun * 50, 5);
    expect(updated.avgDailyUsage.bun).toBeGreaterThan(0);
  });

  it('caps servable customers to whichever ingredient runs out first', () => {
    const business = createFastFoodBusiness({ name: 'Test Co', city: 'Austin', investment: 80_000, dayIndex: 0 });
    const inventory = { ...business.locations[0].inventory, stocks: { ...business.locations[0].inventory.stocks, patty: 5 } };
    const blended = calculateBlendedRecipePerCustomer(business.menu);
    const { maxServable, limitingIngredientId } = calculateMaxServableFromStock(inventory, blended);
    expect(limitingIngredientId).toBe('patty');
    expect(maxServable).toBeLessThan(20);
  });
});

describe('weekly ordering cadence (Sunday order -> Monday delivery)', () => {
  it('places a recurring order on its weekday and delivers it the next day, charging exactly once', () => {
    let business = createFastFoodBusiness({ name: 'Order Co', city: 'Austin', investment: 80_000, dayIndex: 0 });
    business.cash = 50_000;
    const sunday = nextWeekday(10, 0);
    business.locations[0] = {
      ...business.locations[0],
      inventory: {
        ...business.locations[0].inventory,
        recurringOrders: [{ id: 'order-1', ingredientId: 'patty', quantity: 500, orderWeekday: 0, leadTimeDays: 1, supplierId: 'regional_wholesale', active: true, lastPlacedAt: null }],
      },
    };

    const rng = createRng(42);
    const sundayResult = runDailySettlement(business, sunday, rng);
    business = sundayResult.business;

    const orderTransactions = sundayResult.transactions.filter((t) => t.category === 'business_inventory');
    const orderCost = orderTransactions.reduce((s, t) => s + Math.abs(t.amount), 0);
    expect(orderTransactions).toHaveLength(1); // charged exactly once
    expect(orderCost).toBeCloseTo(500 * 1.35, 0); // 500 units at the base patty price, regional_wholesale has no markup and quantity is below its volume-discount threshold
    expect(business.locations[0].inventory.pendingDeliveries.some((d) => d.ingredientId === 'patty' && d.quantity === 500)).toBe(true);

    const stockBeforeDelivery = business.locations[0].inventory.stocks.patty;
    const mondayResult = runDailySettlement(business, sunday + 1, rng);
    business = mondayResult.business;

    // Delivery should have arrived and been consumed into stock (net of Monday's real sales).
    expect(business.locations[0].inventory.pendingDeliveries.some((d) => d.ingredientId === 'patty')).toBe(false);
    expect(business.locations[0].inventory.stocks.patty).toBeGreaterThan(stockBeforeDelivery);

    // The order was only charged once, on Sunday — Monday's delivery arrival must not re-charge it.
    const mondayInventoryCost = mondayResult.transactions.filter((t) => t.category === 'business_inventory' && t.description.includes('Recurring')).length;
    expect(mondayInventoryCost).toBe(0);
  });
});

describe('instant/emergency delivery', () => {
  it('costs more than a normal order and arrives immediately (no lead time)', () => {
    const normalCost = calculateOrderCost('patty', 300, 'regional_wholesale', [], false, 0);
    const delivery = createInstantDelivery('patty', 300, 'regional_wholesale', [], 40, 5);
    expect(delivery.cost).toBeGreaterThan(normalCost);
    expect(delivery.arrivesAtDayIndex).toBe(5);
    expect(delivery.isEmergency).toBe(true);
  });
});

describe('market trends affect real demand', () => {
  it('boosts the blended demand multiplier only for the trending products', () => {
    const business = createFastFoodBusiness({ name: 'Trend Co', city: 'Austin', investment: 80_000, dayIndex: 0 });
    const trend: MarketTrend = {
      id: 't1', name: 'Burger Demand Rising', description: 'test', affectedMenuItemNames: ['Classic Burger', 'Cheeseburger'],
      demandMultiplier: 1.5, startedAt: 0, durationDays: 5,
    };
    const withTrend = calculateTrendDemandMultiplier(business.menu, [trend]);
    const withoutTrend = calculateTrendDemandMultiplier(business.menu, []);
    expect(withoutTrend).toBe(1);
    expect(withTrend).toBeGreaterThan(1);
  });
});

describe('inventory manager automation is skill-dependent, not a deterministic bonus', () => {
  function makeManager(competence: number): Manager {
    return {
      id: 'm1', businessId: 'b1', locationId: null, role: 'inventory_manager', name: 'Test Manager', age: 40,
      leadership: 50, operations: competence, finance: competence, marketingSkill: 50, peopleSkill: 50, growth: 50,
      experienceYears: 5, salary: 70_000, hiredAt: 0, benefits: { healthInsurance: false, mealAllowance: false, travelAllowance: false, bonusPlanPct: 0, trainingBudget: false, paidVacation: false, companyCarId: null, companyPhoneId: null },
    };
  }

  it('a skilled manager orders consistently close to the trend-adjusted target; a weak manager is erratic', () => {
    const trend: MarketTrend = { id: 't1', name: 'Burger Demand Rising', description: 'test', affectedMenuItemNames: ['Classic Burger'], demandMultiplier: 1.6, startedAt: 0, durationDays: 8 };
    const baseInventory = { ...createDefaultLocationInventory(), automationLevel: 'automatic' as const, weeklyPurchasingBudget: 1_000_000, minStockTargetDays: 5 };
    baseInventory.stocks.patty = 0;
    baseInventory.avgDailyUsage.patty = 10;

    const skilled = makeManager(95);
    const weak = makeManager(15);

    const skilledQuantities: number[] = [];
    const weakQuantities: number[] = [];
    for (let seed = 1; seed <= 60; seed++) {
      const rngSkilled = createRng(seed * 7);
      const skilledResult = runInventoryManagerAutomation(baseInventory, 'automatic', (skilled.operations + skilled.finance) / 2, 10, [trend], 1_000_000, [], rngSkilled);
      const skilledOrder = skilledResult.deliveries.find((d) => d.ingredientId === 'patty');
      skilledQuantities.push(skilledOrder?.quantity ?? 0);

      const rngWeak = createRng(seed * 7);
      const weakResult = runInventoryManagerAutomation(baseInventory, 'automatic', (weak.operations + weak.finance) / 2, 10, [trend], 1_000_000, [], rngWeak);
      const weakOrder = weakResult.deliveries.find((d) => d.ingredientId === 'patty');
      weakQuantities.push(weakOrder?.quantity ?? 0);
    }

    const mean = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length;
    const stdDev = (arr: number[]) => { const m = mean(arr); return Math.sqrt(mean(arr.map((v) => (v - m) ** 2))); };

    // Both managers should be ordering roughly around the same ballpark, but the weak manager's
    // decisions should scatter far more widely — skill changes the distribution, not a flat bonus.
    expect(stdDev(weakQuantities)).toBeGreaterThan(stdDev(skilledQuantities) * 1.5);
  });
});

describe('weekly waste tracking', () => {
  it('flags spoilage with a plain-English root cause when stock far exceeds what shelf life can support', () => {
    const inventory = createDefaultLocationInventory();
    inventory.stocks.vegetable = 5_000; // vegetables have a 7-day shelf life — this is wildly over-ordered
    inventory.avgDailyUsage.vegetable = 2;
    const { entries, totalWasted } = calculateWeeklyWaste(inventory, 30);
    expect(totalWasted).toBeGreaterThan(0);
    expect(entries.some((e) => e.ingredientId === 'vegetable' && e.reason.includes('vegetables'))).toBe(true);
  });

  it('does not flag waste for healthy, well-matched stock levels', () => {
    const inventory = createDefaultLocationInventory();
    inventory.stocks.patty = 50;
    inventory.avgDailyUsage.patty = 10; // 5 days of stock against a 90-day shelf life — nowhere near excess
    const { totalWasted } = calculateWeeklyWaste(inventory, 30);
    expect(totalWasted).toBe(0);
  });
});

describe('storage capacity', () => {
  it('counts both on-hand stock and pending deliveries toward capacity used', () => {
    const inventory = createDefaultLocationInventory();
    const before = getTotalStockUnits(inventory);
    inventory.pendingDeliveries.push({ id: 'd1', ingredientId: 'patty', quantity: 400, cost: 500, arrivesAtDayIndex: 5, isEmergency: false });
    expect(getTotalStockUnits(inventory)).toBe(before + 400);
  });
});
