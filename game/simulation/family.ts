import {
  DATING_OCCUPATIONS, GRANDPARENT_OCCUPATIONS, HOME_DESCRIPTIONS_COMFORTABLE, HOME_DESCRIPTIONS_MODEST, HOME_DESCRIPTIONS_UPSCALE,
  NPC_BEHAVIOR_TRAITS, PARENT_OCCUPATIONS, PERSONALITY_TRAITS, VEHICLE_DESCRIPTIONS_COMFORTABLE, VEHICLE_DESCRIPTIONS_MODEST, VEHICLE_DESCRIPTIONS_UPSCALE,
} from '@/game/constants/family';
import { FIRST_NAMES } from '@/game/constants/data';
import {
  CHILD_MONTHLY_COST_BASE, MORTALITY_BASE_ANNUAL_CHANCE_BY_AGE, NPC_RETIREMENT_NET_WORTH_MULTIPLE,
  NPC_WINDFALL_LIFESTYLE_UPGRADE_THRESHOLD, RELATIONSHIP_DECAY_PER_MONTH_IGNORED,
} from '@/game/constants/balance';
import { generateId } from '@/lib/id';
import { clamp, pickOne, randInt } from '@/lib/random';
import type { DatingCandidate, EducationLevel, FamilyMember, NPCMemoryEvent, PersonalityTrait } from '@/game/types';
import type { PendingTransaction } from '@/game/simulation/business';

function randomTraits(rng: () => number, count: number): PersonalityTrait[] {
  const pool = [...PERSONALITY_TRAITS];
  const picked: PersonalityTrait[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(rng() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

function homeForIncome(rng: () => number, annualIncome: number): string {
  if (annualIncome >= 140_000) return pickOne(rng, HOME_DESCRIPTIONS_UPSCALE);
  if (annualIncome >= 55_000) return pickOne(rng, HOME_DESCRIPTIONS_COMFORTABLE);
  return pickOne(rng, HOME_DESCRIPTIONS_MODEST);
}

function vehicleForIncome(rng: () => number, annualIncome: number): string {
  if (annualIncome >= 140_000) return pickOne(rng, VEHICLE_DESCRIPTIONS_UPSCALE);
  if (annualIncome >= 55_000) return pickOne(rng, VEHICLE_DESCRIPTIONS_COMFORTABLE);
  return pickOne(rng, VEHICLE_DESCRIPTIONS_MODEST);
}

function debtForIncome(rng: () => number, annualIncome: number): number {
  if (rng() >= 0.4) return 0;
  const ceiling = Math.max(3_000, Math.round(annualIncome * 0.35));
  return randInt(rng, 2_000, ceiling);
}

function baseFamilyMember(rng: () => number, overrides: Partial<FamilyMember> & Pick<FamilyMember, 'role' | 'name' | 'age' | 'occupation'>): FamilyMember {
  const annualIncome = overrides.annualIncome ?? randInt(rng, 32_000, 95_000);
  return {
    id: generateId('family'),
    relationship: randInt(rng, 60, 90),
    traits: randomTraits(rng, 2),
    employmentStatus: 'employed',
    retired: false,
    cash: randInt(rng, 5_000, 40_000),
    annualIncome,
    debt: debtForIncome(rng, annualIncome),
    city: 'Austin',
    homeDescription: homeForIncome(rng, annualIncome),
    vehicleDescription: vehicleForIncome(rng, annualIncome),
    parentIds: [],
    partnerNpcId: null,
    childrenIds: [],
    memory: [],
    deceased: false,
    deceasedAt: null,
    ...overrides,
  };
}

export function generateParents(rng: () => number, lastName: string, playerAge: number): FamilyMember[] {
  const fatherAge = clamp(playerAge + randInt(rng, 24, 32), 38, 90);
  const motherAge = clamp(playerAge + randInt(rng, 22, 30), 36, 88);

  const father = baseFamilyMember(rng, {
    role: 'father', name: `${pickOne(rng, FIRST_NAMES)} ${lastName}`, age: fatherAge, occupation: pickOne(rng, PARENT_OCCUPATIONS),
  });
  const mother = baseFamilyMember(rng, {
    role: 'mother', name: `${pickOne(rng, FIRST_NAMES)} ${lastName}`, age: motherAge, occupation: pickOne(rng, PARENT_OCCUPATIONS),
  });
  father.partnerNpcId = mother.id;
  mother.partnerNpcId = father.id;

  return [father, mother];
}

/** Generates a parent's own parents (the player's grandparents) the first time their profile is opened. */
export function generateGrandparentsFor(rng: () => number, parent: FamilyMember, lastName: string): FamilyMember[] {
  const grandfatherAge = clamp(parent.age + randInt(rng, 24, 32), 55, 99);
  const grandmotherAge = clamp(parent.age + randInt(rng, 22, 30), 53, 97);

  const grandfather = baseFamilyMember(rng, {
    role: 'grandfather', name: `${pickOne(rng, FIRST_NAMES)} ${lastName}`, age: grandfatherAge,
    occupation: pickOne(rng, GRANDPARENT_OCCUPATIONS), employmentStatus: 'retired', retired: true, annualIncome: randInt(rng, 18_000, 42_000),
  });
  const grandmother = baseFamilyMember(rng, {
    role: 'grandmother', name: `${pickOne(rng, FIRST_NAMES)} ${lastName}`, age: grandmotherAge,
    occupation: pickOne(rng, GRANDPARENT_OCCUPATIONS), employmentStatus: 'retired', retired: true, annualIncome: randInt(rng, 18_000, 42_000),
  });
  grandfather.partnerNpcId = grandmother.id;
  grandmother.partnerNpcId = grandfather.id;
  grandfather.childrenIds = [parent.id];
  grandmother.childrenIds = [parent.id];

  return [grandfather, grandmother];
}

const EDUCATION_LEVELS_FOR_DATING: EducationLevel[] = ['high_school', 'associate', 'bachelor', 'bachelor', 'master'];

export function generateDatingCandidate(rng: () => number, playerAge: number): DatingCandidate {
  const age = clamp(playerAge + randInt(rng, -4, 4), 18, 90);
  return {
    id: generateId('candidate'),
    name: `${pickOne(rng, FIRST_NAMES)}`,
    age,
    occupation: pickOne(rng, DATING_OCCUPATIONS),
    educationLevel: pickOne(rng, EDUCATION_LEVELS_FOR_DATING),
    personality: pickOne(rng, PERSONALITY_TRAITS.filter((t) => !NPC_BEHAVIOR_TRAITS.includes(t)) as PersonalityTrait[]) ?? 'kind',
    income: randInt(rng, 30, 140) * 1000,
    compatibility: randInt(rng, 35, 96),
    relationship: 0,
  };
}

export function generateDatingPool(rng: () => number, playerAge: number, count: number): DatingCandidate[] {
  return Array.from({ length: count }, () => generateDatingCandidate(rng, playerAge));
}

export function candidateToPartner(rng: () => number, candidate: DatingCandidate): FamilyMember {
  return baseFamilyMember(rng, {
    role: 'partner', name: candidate.name, age: candidate.age, occupation: candidate.occupation,
    relationship: candidate.relationship, traits: [candidate.personality, ...randomTraits(rng, 1)], annualIncome: candidate.income,
  });
}

export function generateChildName(rng: () => number): string {
  return pickOne(rng, FIRST_NAMES);
}

export function getChildStageLabel(age: number): string {
  if (age < 1) return 'Infant';
  if (age < 5) return 'Toddler';
  if (age < 13) return 'In School';
  if (age < 18) return 'High School';
  return 'Adult';
}

export function getRelationshipLabel(value: number): string {
  if (value >= 90) return 'Soulmate';
  if (value >= 70) return 'Very Close';
  if (value >= 50) return 'Close';
  if (value >= 30) return 'Normal';
  if (value >= 15) return 'Distant';
  return 'Strained';
}

export function addMemory(member: FamilyMember, event: Omit<NPCMemoryEvent, 'id'>): FamilyMember {
  const memory = [{ id: generateId('memory'), ...event }, ...member.memory].slice(0, 25);
  return { ...member, memory };
}

/**
 * Rolls whether a windfall (large gift, inheritance, asset gift) changes an NPC's life —
 * retirement, lifestyle upgrade, or "no visible change" if the amount isn't life-changing for them.
 * This is what stops "give Dad $100M, he keeps working his $82K job forever."
 */
export function rollWindfallReaction(member: FamilyMember, rng: () => number): { member: FamilyMember; note: string | null } {
  const isMaterialistic = member.traits.includes('materialistic');
  const isFrugal = member.traits.includes('frugal');
  const isCareerFocused = member.traits.includes('career_focused');
  const isCautious = member.traits.includes('cautious');

  let updated = member;
  let note: string | null = null;

  const canRetire = member.employmentStatus === 'employed' && !member.retired && member.age >= 45;
  const retirementCoverage = member.annualIncome > 0 ? member.cash / member.annualIncome : 999;

  if (canRetire && retirementCoverage >= NPC_RETIREMENT_NET_WORTH_MULTIPLE) {
    const retireChance = isCareerFocused ? 0.15 : isCautious ? 0.35 : 0.6;
    if (rng() < retireChance) {
      updated = { ...updated, employmentStatus: 'retired', retired: true };
      note = `${member.name} decided to retire after your gift secured their future.`;
    }
  }

  if (!note && member.cash >= NPC_WINDFALL_LIFESTYLE_UPGRADE_THRESHOLD && (isMaterialistic || rng() < 0.25) && !isFrugal) {
    updated = { ...updated, homeDescription: pickOne(rng, HOME_DESCRIPTIONS_UPSCALE), vehicleDescription: pickOne(rng, VEHICLE_DESCRIPTIONS_UPSCALE) };
    note = `${member.name} upgraded their home and car after receiving your gift.`;
  }

  if (!note && isFrugal && member.cash >= 50_000) {
    note = `${member.name} says they'll invest most of what you gave them rather than spend it.`;
  }

  return { member: updated, note };
}

/** Large gifts/purchases relative to their own income sometimes get refused outright — proud or career-focused people don't always want to be bailed out. */
export function rollGiftRefusal(member: FamilyMember, amount: number, rng: () => number): boolean {
  if (amount < member.annualIncome * 0.5) return false;
  const isIndependent = member.traits.includes('independent');
  const isCareerFocused = member.traits.includes('career_focused');
  const isFrugal = member.traits.includes('frugal');
  if (!isIndependent && !isCareerFocused) return false;
  const chance = (isIndependent ? 0.25 : 0) + (isCareerFocused ? 0.15 : 0) - (isFrugal ? 0.05 : 0);
  return rng() < Math.max(0, chance);
}

/** Personality-driven reaction to a phone call — lower-stakes than a visit, but still not uniform. */
export function callReactionModifier(member: FamilyMember): number {
  const base = 3;
  if (member.traits.includes('family_oriented')) return base + 2;
  if (member.traits.includes('reserved') || member.traits.includes('career_focused')) return Math.max(1, base - 1);
  return base;
}

/** Personality-driven reaction to a visit — not every relative is equally happy to be dropped in on. */
export function visitReactionModifier(member: FamilyMember): { relationshipDelta: number; note: string | null } {
  const base = 7;
  if (member.traits.includes('family_oriented')) return { relationshipDelta: base + 4, note: `${member.name} lit up when you visited — they love having you around.` };
  if (member.traits.includes('career_focused')) return { relationshipDelta: Math.max(2, base - 4), note: `${member.name} was glad to see you but clearly distracted by work.` };
  if (member.traits.includes('independent')) return { relationshipDelta: Math.max(3, base - 2), note: null };
  return { relationshipDelta: base, note: null };
}

/** Personality-driven reaction to being bought a house or car — the same gift lands very differently depending on who receives it. */
export function assetGiftReactionModifier(member: FamilyMember, kind: 'house' | 'car'): { relationshipDelta: number; note: string | null } {
  const base = 15;
  if (member.traits.includes('materialistic')) return { relationshipDelta: base + 8, note: `${member.name} is thrilled with the new ${kind} — exactly their kind of gift.` };
  if (member.traits.includes('frugal')) return { relationshipDelta: Math.max(4, base - 8), note: `${member.name} appreciates it but feels a little uneasy accepting something so expensive.` };
  if (member.traits.includes('independent')) return { relationshipDelta: Math.max(4, base - 6), note: `${member.name} is grateful, but says they could have managed on their own.` };
  return { relationshipDelta: base, note: null };
}

/** Yearly aging pass: everyone in the family gets a year older; parents/grandparents may retire or (Realistic mode only) pass away. */
export function ageFamilyOneYear(
  family: FamilyMember[],
  rng: () => number,
  mortalityEnabled: boolean,
): { family: FamilyMember[]; notifications: string[]; deceasedIds: string[] } {
  const notifications: string[] = [];
  const deceasedIds: string[] = [];

  const nextFamily = family.map((member) => {
    if (member.deceased) return member;
    const age = member.age + 1;
    const isElder = member.role === 'mother' || member.role === 'father' || member.role === 'grandmother' || member.role === 'grandfather';

    if (mortalityEnabled && isElder) {
      const bracket = [...MORTALITY_BASE_ANNUAL_CHANCE_BY_AGE].reverse().find((b) => age >= b.minAge);
      const chance = bracket?.annualChance ?? 0.0004;
      if (rng() < chance) {
        deceasedIds.push(member.id);
        notifications.push(`${member.name} has passed away peacefully at age ${age}. Our condolences.`);
        return { ...member, age, deceased: true, deceasedAt: null };
      }
    }

    if (isElder && !member.retired && age >= 62 && rng() < 0.18) {
      notifications.push(`${member.name} has retired after a long career as ${member.occupation.toLowerCase()}.`);
      return { ...member, age, retired: true, employmentStatus: 'retired' as const };
    }

    return { ...member, age };
  });

  return { family: nextFamily, notifications, deceasedIds };
}

/** Monthly cost of raising children still living at home. */
export function runMonthlyFamilyExpenses(family: FamilyMember[]): { transactions: PendingTransaction[] } {
  const children = family.filter((f) => f.role === 'child' && f.age < 18);
  if (children.length === 0) return { transactions: [] };
  const total = children.length * CHILD_MONTHLY_COST_BASE;
  return { transactions: [{ amount: -total, category: 'family_expense', description: `Childcare & family expenses (${children.length})` }] };
}

/** Monthly relationship decay for partner/parents who haven't been interacted with recently — gentle at first, more noticeable after years of silence. */
export function decayIgnoredRelationships(family: FamilyMember[], currentDay: number): FamilyMember[] {
  return family.map((member) => {
    if (member.role === 'child' || member.deceased) return member;
    const daysSinceInteraction = member.lastInteractionAt !== undefined ? currentDay - member.lastInteractionAt : 999;
    if (daysSinceInteraction < 30) return member;
    const yearsIgnored = daysSinceInteraction / 365;
    const decay = RELATIONSHIP_DECAY_PER_MONTH_IGNORED * (yearsIgnored > 1 ? 2 : 1);
    return { ...member, relationship: clamp(member.relationship - decay, 0, 100) };
  });
}

/** Small monthly chance a family member reaches out to the player themselves — the world doesn't just wait to be visited. */
export function rollFamilyInitiatedContact(family: FamilyMember[], currentDay: number, rng: () => number): { member: FamilyMember; message: string }[] {
  const results: { member: FamilyMember; message: string }[] = [];
  for (const member of family) {
    if (member.deceased || member.role === 'child') continue;
    const daysSinceInteraction = member.lastInteractionAt !== undefined ? currentDay - member.lastInteractionAt : 999;
    if (daysSinceInteraction < 45) continue;
    const chance = clamp(daysSinceInteraction / 3000, 0.01, 0.12);
    if (rng() < chance) {
      const templates = member.role === 'partner'
        ? [`${member.name} suggested doing something together this weekend.`, `${member.name} sent you a message just to check in.`]
        : [`${member.name} called to see how you're doing.`, `Haven't spoken in a while — ${member.name} reached out to catch up.`];
      results.push({ member, message: pickOne(rng, templates) });
    }
  }
  return results;
}
