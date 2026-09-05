import { generateId } from '@/lib/id';
import { pickOne } from '@/lib/random';
import type { BusinessEvent, BusinessLocation } from '@/game/types';

type EventTemplate = Omit<BusinessEvent, 'id' | 'businessId' | 'locationId' | 'triggeredAt' | 'resolved'>;

const EVENT_TEMPLATES: EventTemplate[] = [
  {
    title: 'Fryer Broken',
    description: 'The main fryer has stopped working during service. This is hurting your kitchen throughput.',
    choices: [
      { id: 'repair_full', label: 'Repair Immediately', cost: 18_000, description: 'Full professional repair. No lasting penalty.', effects: {} },
      { id: 'repair_temp', label: 'Temporary Repair', cost: 5_000, description: 'A quick patch job. 35% chance it breaks again soon.', effects: { capacityPctTemp: -5 } },
      { id: 'delay', label: 'Delay Repair', cost: 0, description: 'Keep running as-is.', effects: { capacityPctTemp: -25 } },
    ],
  },
  {
    title: 'Supplier Raised Prices',
    description: 'Your ingredient supplier has announced a price increase for the next shipment.',
    choices: [
      { id: 'accept', label: 'Accept New Prices', cost: 0, description: 'Pay the higher rate to keep quality consistent.', effects: {} },
      { id: 'switch_supplier', label: 'Switch to Cheaper Supplier', cost: 3_000, description: 'Save on costs, but ingredient quality drops slightly.', effects: { reputationFlat: -2 } },
      { id: 'negotiate', label: 'Negotiate a Deal', cost: 6_000, description: 'Spend on relationship-building to keep your current rate.', effects: {} },
    ],
  },
  {
    title: 'Health Inspection Scheduled',
    description: 'A routine health inspection is coming up this week.',
    choices: [
      { id: 'deep_clean', label: 'Deep Clean & Prepare', cost: 8_000, description: 'Guarantees a strong inspection result.', effects: { reputationFlat: 3 } },
      { id: 'standard_prep', label: 'Standard Preparation', cost: 2_000, description: 'Normal upkeep, average result expected.', effects: {} },
      { id: 'skip_prep', label: 'Skip Extra Prep', cost: 0, description: 'Risk a poor result if standards have slipped.', effects: { reputationFlat: -4 } },
    ],
  },
  {
    title: 'Viral Social Media Post',
    description: 'A customer post about your food is going viral online. Interest is spiking.',
    choices: [
      { id: 'capitalize', label: 'Capitalize With A Promo', cost: 4_000, description: 'Run a limited promo to convert attention into loyal customers.', effects: { reputationFlat: 3 } },
      { id: 'let_it_ride', label: 'Let It Ride Naturally', cost: 0, description: 'Take the free exposure without spending.', effects: { reputationFlat: 1 } },
    ],
  },
  {
    title: 'Employee Requesting A Raise',
    description: 'A staff member has asked for a salary increase, citing rising living costs.',
    choices: [
      { id: 'grant_raise', label: 'Grant The Raise', cost: 12_000, description: 'Improves morale and loyalty across the team.', effects: {} },
      { id: 'partial_raise', label: 'Offer A Partial Raise', cost: 5_000, description: 'A smaller compromise increase.', effects: {} },
      { id: 'deny', label: 'Deny The Request', cost: 0, description: 'Risk morale damage and possible resignation.', effects: { reputationFlat: 0 } },
    ],
  },
  {
    title: 'New Competitor Opening Nearby',
    description: 'A competing restaurant is opening a few blocks away, targeting the same customers.',
    choices: [
      { id: 'marketing_push', label: 'Launch A Defensive Campaign', cost: 15_000, description: 'Reinforce customer loyalty before they can switch.', effects: { reputationFlat: 1 } },
      { id: 'price_match', label: 'Adjust Pricing Strategy', cost: 0, description: 'Watch the situation and adapt pricing as needed.', effects: {} },
      { id: 'ignore', label: 'Ignore The Competition', cost: 0, description: 'Trust your existing customer base.', effects: {} },
    ],
  },
];

export function rollBusinessEvent(rng: () => number, businessId: string, location: BusinessLocation, triggeredAt: number): BusinessEvent {
  const template = pickOne(rng, EVENT_TEMPLATES);
  return {
    id: generateId('event'),
    businessId,
    locationId: location.id,
    triggeredAt,
    resolved: false,
    title: template.title,
    description: template.description,
    choices: template.choices.map((c) => ({ ...c, id: generateId('choice') })),
  };
}
