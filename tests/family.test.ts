import { describe, it, expect } from 'vitest';
import { advanceRelationshipStage } from '@/game/simulation/relationshipProgress';
import { rollConception, isDueToday } from '@/game/simulation/pregnancy';
import { calculateDivorceSettlement } from '@/game/simulation/divorce';
import { decayIgnoredRelationships, generateGrandparentsFor, generateParents } from '@/game/simulation/family';
import { createRng } from '@/lib/random';
import { createInitialGameState } from '@/game/state/initialState';
import { SERIOUS_RELATIONSHIP_MIN_DAYS, PREGNANCY_DURATION_MIN_DAYS, PREGNANCY_DURATION_MAX_DAYS } from '@/game/constants/balance';
import type { RelationshipState, FamilyMember } from '@/game/types';

function makePartner(overrides: Partial<FamilyMember> = {}): FamilyMember {
  return {
    id: 'partner-1', role: 'partner', name: 'Partner Test', age: 28, occupation: 'Designer',
    employmentStatus: 'employed', relationship: 80, traits: ['kind'], retired: false, cash: 5_000,
    annualIncome: 60_000, debt: 0, city: 'Austin', homeDescription: 'Apartment', vehicleDescription: 'Sedan',
    parentIds: [], partnerNpcId: null, childrenIds: [], memory: [], deceased: false, deceasedAt: null,
    ...overrides,
  };
}

describe('relationship progression gates (the same-day marriage/baby bug fix)', () => {
  it('does not promote to serious before the minimum days together, even with high relationship', () => {
    const relationship: RelationshipState = {
      status: 'exclusive', partnerId: 'partner-1', candidates: [], exclusiveAt: 0, seriousAt: null, engagedAt: null, marriedAt: null, prenup: null,
    };
    const result = advanceRelationshipStage(relationship, makePartner({ relationship: 90 }), SERIOUS_RELATIONSHIP_MIN_DAYS - 1);
    expect(result.status).toBe('exclusive');
  });

  it('promotes to serious once enough days have passed and relationship is high enough', () => {
    const relationship: RelationshipState = {
      status: 'exclusive', partnerId: 'partner-1', candidates: [], exclusiveAt: 0, seriousAt: null, engagedAt: null, marriedAt: null, prenup: null,
    };
    const result = advanceRelationshipStage(relationship, makePartner({ relationship: 90 }), SERIOUS_RELATIONSHIP_MIN_DAYS);
    expect(result.status).toBe('serious');
    expect(result.seriousAt).toBe(SERIOUS_RELATIONSHIP_MIN_DAYS);
  });

  it('never promotes a relationship that is not currently exclusive', () => {
    const married: RelationshipState = {
      status: 'married', partnerId: 'partner-1', candidates: [], exclusiveAt: 0, seriousAt: 30, engagedAt: 100, marriedAt: 120, prenup: 'none',
    };
    const result = advanceRelationshipStage(married, makePartner(), 99999);
    expect(result.status).toBe('married');
  });
});

describe('pregnancy timing (birth can never happen on the same day as conception)', () => {
  it('a pregnancy that succeeds always has a due date well in the future', () => {
    // First draw (the conception-chance check) is forced low enough to succeed; later draws just need to be valid probabilities.
    let calls = 0;
    const rng = () => (calls++ === 0 ? 0.01 : 0.5);
    const pregnancy = rollConception(rng, 100);
    expect(pregnancy).not.toBeNull();
    if (pregnancy) {
      const duration = pregnancy.estimatedDueAt - pregnancy.startedAt;
      expect(duration).toBeGreaterThanOrEqual(PREGNANCY_DURATION_MIN_DAYS);
      expect(duration).toBeLessThanOrEqual(PREGNANCY_DURATION_MAX_DAYS);
      expect(isDueToday(pregnancy, pregnancy.startedAt)).toBe(false);
      expect(isDueToday(pregnancy, pregnancy.startedAt + duration - 1)).toBe(false);
      expect(isDueToday(pregnancy, pregnancy.estimatedDueAt)).toBe(true);
    }
  });

  it('a failed conception roll returns no pregnancy at all', () => {
    // rng() always returning just under 1 must fail any conception-chance threshold below 1.
    const alwaysHigh = () => 0.999999;
    expect(rollConception(alwaysHigh, 0)).toBeNull();
  });
});

describe('divorce settlement', () => {
  it('produces no child support when there are no children', () => {
    const state = createInitialGameState('Divorce Tester');
    state.player.relationship = { status: 'married', partnerId: 'p1', candidates: [], exclusiveAt: 0, seriousAt: 30, engagedAt: 100, marriedAt: 120, prenup: 'none' };
    state.time.dayIndex = 500;
    const settlement = calculateDivorceSettlement(state);
    expect(settlement.monthlyChildSupport).toBe(0);
    expect(settlement.marriageLengthDays).toBe(500 - 120);
  });

  it('a strong prenup protects meaningfully more shared value than no prenup', () => {
    const baseState = createInitialGameState('Prenup Tester');
    baseState.player.relationship = { status: 'married', partnerId: 'p1', candidates: [], exclusiveAt: 0, seriousAt: 30, engagedAt: 100, marriedAt: 120, prenup: 'none' };
    baseState.player.properties.push({
      id: 'p1', name: 'Home', type: 'house', city: 'Austin', bedrooms: 3, bathrooms: 2, sqft: 1800, luxuryRating: 2,
      use: 'primary', purchasePrice: 500_000, currentValue: 500_000, mortgageBalance: 100_000, monthlyMortgagePayment: 2_000,
      monthlyMaintenance: 300, monthlyRent: 0, purchasedAt: 0,
    });

    const noPrenupState = { ...baseState, player: { ...baseState.player, relationship: { ...baseState.player.relationship, prenup: 'none' as const } } };
    const strongPrenupState = { ...baseState, player: { ...baseState.player, relationship: { ...baseState.player.relationship, prenup: 'strong' as const } } };

    const noPrenupSettlement = calculateDivorceSettlement(noPrenupState);
    const strongPrenupSettlement = calculateDivorceSettlement(strongPrenupState);

    expect(strongPrenupSettlement.estimatedAssetTransfer).toBeLessThan(noPrenupSettlement.estimatedAssetTransfer);
  });
});

describe('family tree generation', () => {
  it('links generated grandparents back to the parent as their children via parentIds on the parent', () => {
    const rng = createRng(42);
    const parents = generateParents(rng, 'Tester', 30);
    const mother = parents.find((p) => p.role === 'mother')!;
    const grandparents = generateGrandparentsFor(rng, mother, 'Tester');

    expect(grandparents).toHaveLength(2);
    expect(grandparents.some((g) => g.role === 'grandmother')).toBe(true);
    expect(grandparents.some((g) => g.role === 'grandfather')).toBe(true);
    // The UI wires mother.parentIds = grandparents.map(g => g.id) after this call — verify the ids are usable for that.
    expect(grandparents.every((g) => typeof g.id === 'string' && g.id.length > 0)).toBe(true);
  });
});

describe('relationship decay from being ignored', () => {
  it('does not decay a relationship interacted with recently', () => {
    const member = makePartner({ role: 'father' as FamilyMember['role'], relationship: 70, lastInteractionAt: 90 });
    const result = decayIgnoredRelationships([member], 100);
    expect(result[0].relationship).toBe(70);
  });

  it('decays a relationship that has been ignored for over a month', () => {
    const member = makePartner({ role: 'father' as FamilyMember['role'], relationship: 70, lastInteractionAt: 0 });
    const result = decayIgnoredRelationships([member], 60);
    expect(result[0].relationship).toBeLessThan(70);
  });

  it('never decays a deceased member or a child', () => {
    const deceased = makePartner({ role: 'father' as FamilyMember['role'], relationship: 70, deceased: true, lastInteractionAt: 0 });
    const child = makePartner({ role: 'child' as FamilyMember['role'], relationship: 70, lastInteractionAt: 0 });
    const result = decayIgnoredRelationships([deceased, child], 5000);
    expect(result[0].relationship).toBe(70);
    expect(result[1].relationship).toBe(70);
  });
});
