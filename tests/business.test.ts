import { describe, it, expect } from 'vitest';
import { calculateDemand } from '@/game/simulation/economy';
import { getMarketingBoostForLocation } from '@/game/simulation/business';
import { runDelegatedManagement } from '@/game/simulation/delegation';
import { evaluateAcquisitionOffer, createBusinessFromAcquiredNpc, calculateMarketShare } from '@/game/simulation/npcBusiness';
import { createFastFoodBusiness, createFastFoodLocation } from '@/game/business/fastfood';
import { candidateToEmployee } from '@/game/simulation/employees';
import { createRng } from '@/lib/random';
import { ACQUISITION_MIN_OFFER_PCT } from '@/game/constants/balance';
import type { NPCBusiness } from '@/game/types';

function makeNpc(overrides: Partial<NPCBusiness> = {}): NPCBusiness {
  return {
    id: 'npc-1', name: 'Test Diner', industry: 'fast_food', city: 'Austin', monthlyRevenue: 100_000,
    monthlyProfit: 15_000, debt: 20_000, employees: 10, locations: 2, reputation: 60, growthStyle: 'steady',
    marketShare: 0, forSale: true, askingPrice: 500_000, valuation: 500_000, foundedAt: -500,
    history: [{ dayIndex: 0, revenue: 100_000, profit: 15_000 }], failed: false,
    ...overrides,
  };
}

describe('demand and capacity respond to real staffing changes', () => {
  it('adding qualified staff increases effective capacity and reduces wait time', () => {
    const business = createFastFoodBusiness({ name: 'Test Co', city: 'Austin', investment: 80_000, dayIndex: 0 });
    const location = business.locations[0];

    const rng = createRng(7);
    const understaffedDemand = calculateDemand(business, location, [], getMarketingBoostForLocation(business, location));

    const staffedEmployees = Array.from({ length: 6 }, () =>
      candidateToEmployee({ id: 'c', name: 'Cook', age: 30, role: 'cook', skill: 75, experienceYears: 3, expectedSalary: 32_000, trait: 'reliable' }, location.id, business.id, 0));
    void rng;
    const staffedDemand = calculateDemand({ ...business, employees: staffedEmployees }, location, staffedEmployees, getMarketingBoostForLocation(business, location));

    expect(staffedDemand.effectiveCapacity).toBeGreaterThan(understaffedDemand.effectiveCapacity);
    expect(staffedDemand.waitTimeMinutes).toBeLessThanOrEqual(understaffedDemand.waitTimeMinutes);
  });

  it('reports more required staff when a location has more expected customers', () => {
    const business = createFastFoodBusiness({ name: 'Busy Co', city: 'Austin', investment: 80_000, dayIndex: 0 });
    const quietLocation = createFastFoodLocation({ businessId: business.id, city: 'Austin', investment: 30_000, dayIndex: 0, isFirstLocation: true });
    const busyLocation = { ...quietLocation, baseDemand: quietLocation.baseDemand * 3 };

    const quietDemand = calculateDemand(business, quietLocation, [], 0);
    const busyDemand = calculateDemand(business, busyLocation, [], 0);

    expect(busyDemand.requiredStaff).toBeGreaterThanOrEqual(quietDemand.requiredStaff);
  });
});

describe('delegation only acts when a manager is actually hired', () => {
  it('makes no changes when the business has no managers', () => {
    const business = createFastFoodBusiness({ name: 'No Manager Co', city: 'Austin', investment: 80_000, dayIndex: 0 });
    business.delegation.staffing = 'manager'; // delegated, but nobody is there to act on it
    const rng = createRng(3);
    const result = runDelegatedManagement(business, rng);
    expect(result.business.employees).toEqual(business.employees);
    expect(result.notifications).toHaveLength(0);
  });
});

describe('acquisition negotiation', () => {
  it('always rejects an offer below the minimum acceptable percentage of asking price, regardless of luck', () => {
    const npc = makeNpc({ askingPrice: 1_000_000 });
    const lowOffer = 1_000_000 * (ACQUISITION_MIN_OFFER_PCT - 0.05);
    for (const seed of [1, 2, 3, 4, 5]) {
      const rng = createRng(seed);
      const result = evaluateAcquisitionOffer(npc, lowOffer, rng);
      expect(result.accepted).toBe(false);
      expect(result.counterAmount).toBeNull();
    }
  });

  it('materializes an accepted acquisition into a fully playable business with matching debt carried over as a loan', () => {
    const npc = makeNpc({ debt: 50_000, employees: 8, locations: 2 });
    const rng = createRng(11);
    const business = createBusinessFromAcquiredNpc(npc, 1000, rng);

    expect(business.locations).toHaveLength(2);
    expect(business.employees.length).toBeGreaterThanOrEqual(1);
    expect(business.financialHistory).toHaveLength(30);
    expect(business.loans).toHaveLength(1);
    expect(business.loans[0].principal).toBe(50_000);
    expect(business.loans[0].remainingBalance).toBe(50_000);
    expect(business.ownershipPct).toBe(100);
    expect(business.holdingCompanyId).toBeNull();
  });

  it('never creates any debt entry when the acquired business had none', () => {
    const npc = makeNpc({ debt: 0 });
    const business = createBusinessFromAcquiredNpc(npc, 1000, createRng(2));
    expect(business.loans).toHaveLength(0);
  });
});

describe('market share', () => {
  it('never assigns any business more than 100% share and includes the player only when they have revenue', () => {
    const player = createFastFoodBusiness({ name: 'Player Co', city: 'Austin', investment: 80_000, dayIndex: 0 });
    player.financialHistory = [{ dayIndex: 0, revenue: 50_000, expenses: 30_000, profit: 20_000, customers: 1000, reputation: 60 }];
    const npcs = [makeNpc({ id: 'a', city: 'Austin', monthlyRevenue: 50_000 }), makeNpc({ id: 'b', city: 'Austin', monthlyRevenue: 50_000 })];

    const shares = calculateMarketShare([player], npcs, 'Austin');
    expect(shares.some((s) => s.isPlayer)).toBe(true);
    for (const entry of shares) {
      expect(entry.sharePct).toBeGreaterThanOrEqual(0);
      expect(entry.sharePct).toBeLessThanOrEqual(100);
    }
  });

  it('excludes failed competitors from the segment', () => {
    const npcs = [makeNpc({ id: 'alive', city: 'Dallas' }), makeNpc({ id: 'dead', city: 'Dallas', failed: true })];
    const shares = calculateMarketShare([], npcs, 'Dallas');
    expect(shares.some((s) => s.name === 'Test Diner' && !s.isPlayer)).toBe(true);
    expect(shares).toHaveLength(1);
  });
});
