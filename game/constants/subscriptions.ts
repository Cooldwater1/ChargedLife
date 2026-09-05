import type { SubscriptionCategory } from '@/game/types';

export interface SubscriptionCatalogEntry {
  id: string;
  name: string;
  category: SubscriptionCategory;
  monthlyCost: number;
}

export const SUBSCRIPTION_CATALOG: SubscriptionCatalogEntry[] = [
  { id: 'phone_plan', name: 'Phone Plan', category: 'phone', monthlyCost: 45 },
  { id: 'internet', name: 'Home Internet', category: 'internet', monthlyCost: 55 },
  { id: 'streaming', name: 'Streaming Bundle', category: 'streaming', monthlyCost: 18 },
  { id: 'gym', name: 'Gym Membership', category: 'gym', monthlyCost: 40 },
  { id: 'software', name: 'Productivity Software', category: 'software', monthlyCost: 20 },
];

export const DEFAULT_SUBSCRIPTION_IDS = ['phone_plan', 'internet'];
