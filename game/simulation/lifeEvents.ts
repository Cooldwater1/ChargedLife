import { generateId } from '@/lib/id';
import { pickOne } from '@/lib/random';
import type { LifeEvent, LifeEventCategory } from '@/game/types';

type LifeEventTemplate = Omit<LifeEvent, 'id' | 'triggeredAt' | 'resolved'>;

const FAMILY_TEMPLATES: LifeEventTemplate[] = [
  {
    category: 'family',
    title: 'Parent Asks For Help',
    description: 'A parent has reached out asking for a bit of financial help this month.',
    choices: [
      { id: 'help_generous', label: 'Send $2,000', description: 'A generous gift that means a lot to them.', cost: 2_000, effects: { relationshipFlat: 8 } },
      { id: 'help_modest', label: 'Send $400', description: 'A modest but appreciated gesture.', cost: 400, effects: { relationshipFlat: 4 } },
      { id: 'help_decline', label: 'Not Right Now', description: 'You are not in a position to help at the moment.', cost: 0, effects: { relationshipFlat: -5 } },
    ],
  },
  {
    category: 'family',
    title: 'Partner Wants A Vacation',
    description: 'Your partner has been hinting at wanting to get away together.',
    choices: [
      { id: 'vacation_luxury', label: 'Luxury Vacation', description: 'Spare no expense on a dream trip.', cost: 12_000, effects: { relationshipFlat: 12 } },
      { id: 'vacation_weekend', label: 'Weekend Trip', description: 'A relaxing weekend away without breaking the bank.', cost: 2_500, effects: { relationshipFlat: 6 } },
      { id: 'vacation_decline', label: 'Not Right Now', description: 'Now is not a good time to travel.', cost: 0, effects: { relationshipFlat: -5 } },
    ],
  },
];

const CAREER_TEMPLATES: LifeEventTemplate[] = [
  {
    category: 'career',
    title: 'Recruiter Reaches Out',
    description: 'A recruiter has contacted you about an opportunity elsewhere in your industry.',
    choices: [
      { id: 'recruiter_listen', label: 'Hear Them Out', description: 'No commitment — just information for later.', cost: 0, effects: {} },
      { id: 'recruiter_ignore', label: 'Not Interested', description: 'You are happy where you are.', cost: 0, effects: {} },
    ],
  },
];

const FINANCIAL_TEMPLATES: LifeEventTemplate[] = [
  {
    category: 'financial',
    title: 'Friend Offers An Investment Tip',
    description: 'A friend swears a particular stock is about to take off. It could be nothing.',
    choices: [
      { id: 'tip_ignore', label: 'Do Your Own Research', description: 'You will look into it yourself before acting.', cost: 0, effects: {} },
    ],
  },
];

const RANDOM_TEMPLATES: LifeEventTemplate[] = [
  {
    category: 'random',
    title: 'Car Needs Repair',
    description: 'Your vehicle needs an unexpected repair.',
    choices: [
      { id: 'repair_full', label: 'Full Repair', description: 'Get it done right the first time.', cost: 850, effects: {} },
      { id: 'repair_patch', label: 'Quick Patch', description: 'A cheaper temporary fix.', cost: 250, effects: {} },
    ],
  },
  {
    category: 'random',
    title: 'Small Inheritance',
    description: 'A distant relative has left you a small inheritance.',
    choices: [
      { id: 'inherit_accept', label: 'Accept', description: 'A pleasant surprise.', cost: -3_500, effects: {} },
    ],
  },
];

const TEMPLATES_BY_CATEGORY: Record<LifeEventCategory, LifeEventTemplate[]> = {
  family: FAMILY_TEMPLATES,
  career: CAREER_TEMPLATES,
  financial: FINANCIAL_TEMPLATES,
  random: RANDOM_TEMPLATES,
  business: [],
  life: [],
  education: [],
  investment: [],
};

export function rollLifeEvent(rng: () => number, category: LifeEventCategory, dayIndex: number): LifeEvent | null {
  const pool = TEMPLATES_BY_CATEGORY[category];
  if (pool.length === 0) return null;
  const template = pickOne(rng, pool);
  return finalizeTemplate(template, dayIndex);
}

function finalizeTemplate(template: LifeEventTemplate, dayIndex: number): LifeEvent {
  return {
    id: generateId('lifeevent'),
    triggeredAt: dayIndex,
    resolved: false,
    ...template,
    choices: template.choices.map((c) => ({ ...c, id: generateId('choice') })),
  };
}

const MARRIAGE_TROUBLE_TEMPLATE: LifeEventTemplate = {
  category: 'family',
  title: 'Trouble At Home',
  description: 'Things have felt distant with your partner lately. It might be worth addressing before it gets worse.',
  choices: [
    { id: 'work_on_it', label: 'Work On It Together', description: 'Make time to reconnect and address what has been going wrong.', cost: 1_500, effects: { relationshipFlat: 15 } },
    { id: 'counseling', label: 'Suggest Counseling', description: 'A more serious step, but it can help.', cost: 4_000, effects: { relationshipFlat: 22 } },
    { id: 'ignore_trouble', label: 'Let It Be', description: 'You hope things will sort themselves out.', cost: 0, effects: { relationshipFlat: -8 } },
  ],
};

export function rollMarriageTroubleEvent(dayIndex: number): LifeEvent {
  return finalizeTemplate(MARRIAGE_TROUBLE_TEMPLATE, dayIndex);
}

const PREGNANCY_TEMPLATES: LifeEventTemplate[] = [
  {
    category: 'family',
    title: 'Doctor Appointment',
    description: 'A routine prenatal checkup is coming up.',
    choices: [
      { id: 'attend', label: 'Attend Together', description: 'Go together and hear how things are progressing.', cost: 250, effects: { relationshipFlat: 5 } },
      { id: 'skip', label: 'Send Best Wishes', description: "You can't make it this time.", cost: 0, effects: { relationshipFlat: -2 } },
    ],
  },
  {
    category: 'family',
    title: 'Preparing The Nursery',
    description: "It's time to start getting the home ready for the baby.",
    choices: [
      { id: 'nursery_full', label: 'Full Nursery Setup', description: 'Furniture, decor, everything.', cost: 3_500, effects: { relationshipFlat: 8 } },
      { id: 'nursery_basic', label: 'Basics Only', description: 'The essentials for now.', cost: 800, effects: { relationshipFlat: 3 } },
    ],
  },
  {
    category: 'family',
    title: 'Choosing A Name',
    description: 'You and your partner are discussing names for the baby.',
    choices: [
      { id: 'name_agree', label: 'Agree On A Name Together', description: 'A meaningful conversation about your child\'s future.', cost: 0, effects: { relationshipFlat: 6 } },
    ],
  },
];

export function rollPregnancyEvent(rng: () => number, dayIndex: number): LifeEvent {
  return finalizeTemplate(pickOne(rng, PREGNANCY_TEMPLATES), dayIndex);
}
