import type { LifestyleTier } from '@/game/types';

export const LIFESTYLE_CATEGORY_LABELS: Record<LifestyleTier['category'], string> = {
  fitness: 'Fitness',
  entertainment: 'Entertainment',
  phone: 'Phone',
  food: 'Food & Diet',
  services: 'Personal Services',
};

export const LIFESTYLE_TIERS: LifestyleTier[] = [
  // ---------- Fitness (single-choice) ----------
  { id: 'fitness_none', category: 'fitness', name: 'No Gym', monthlyCost: 0, healthEffect: 0, happinessEffect: 0, statusEffect: 0, description: 'No regular exercise routine.', stackable: false },
  { id: 'fitness_budget', category: 'fitness', name: 'Budget Gym', monthlyCost: 30, healthEffect: 4, happinessEffect: 1, statusEffect: 0, description: 'A no-frills gym membership — the basics, cheap.', stackable: false },
  { id: 'fitness_premium', category: 'fitness', name: 'Premium Gym', monthlyCost: 90, healthEffect: 8, happinessEffect: 3, statusEffect: 1, description: 'A well-equipped gym with classes and amenities.', stackable: false },
  { id: 'fitness_luxury_club', category: 'fitness', name: 'Luxury Health Club', monthlyCost: 250, healthEffect: 10, happinessEffect: 6, statusEffect: 4, description: 'A members-only health club — pool, spa, the works.', stackable: false },
  { id: 'fitness_personal_trainer', category: 'fitness', name: 'Personal Trainer', monthlyCost: 600, healthEffect: 16, happinessEffect: 5, statusEffect: 6, description: 'One-on-one training tailored to your goals — real results, real cost.', stackable: false },

  // ---------- Entertainment (stackable) ----------
  { id: 'ent_streaming', category: 'entertainment', name: 'Streamly Video', monthlyCost: 16, healthEffect: 0, happinessEffect: 3, statusEffect: 0, description: 'A video streaming subscription.', stackable: true },
  { id: 'ent_music', category: 'entertainment', name: 'Soundwave Music', monthlyCost: 12, healthEffect: 0, happinessEffect: 2, statusEffect: 0, description: 'A music streaming subscription.', stackable: true },
  { id: 'ent_gaming', category: 'entertainment', name: 'PlayVerse Gaming', monthlyCost: 18, healthEffect: -1, happinessEffect: 4, statusEffect: 0, description: 'A gaming subscription service.', stackable: true },
  { id: 'ent_premium_bundle', category: 'entertainment', name: 'Premium Entertainment Bundle', monthlyCost: 65, healthEffect: -1, happinessEffect: 8, statusEffect: 2, description: 'Video, music, and gaming bundled with premium perks.', stackable: true },

  // ---------- Phone (single-choice) ----------
  { id: 'phone_prepaid', category: 'phone', name: 'Prepaid Plan', monthlyCost: 25, healthEffect: 0, happinessEffect: -1, statusEffect: -1, description: 'A basic prepaid phone plan.', stackable: false },
  { id: 'phone_normal', category: 'phone', name: 'Standard Plan', monthlyCost: 55, healthEffect: 0, happinessEffect: 0, statusEffect: 0, description: 'A standard unlimited phone plan.', stackable: false },
  { id: 'phone_premium', category: 'phone', name: 'Premium Unlimited', monthlyCost: 90, healthEffect: 0, happinessEffect: 1, statusEffect: 2, description: 'Premium unlimited data with priority network access.', stackable: false },
  { id: 'phone_flagship', category: 'phone', name: 'Flagship Upgrade Plan', monthlyCost: 160, healthEffect: 0, happinessEffect: 2, statusEffect: 5, description: 'The latest flagship phone on a rolling upgrade plan.', stackable: false },

  // ---------- Food & Diet (single-choice) ----------
  { id: 'food_extreme_cheap', category: 'food', name: 'Extremely Cheap Food', monthlyCost: 250, healthEffect: -8, happinessEffect: -3, statusEffect: -2, description: 'The cheapest possible groceries — filling, not nourishing.', stackable: false },
  { id: 'food_budget', category: 'food', name: 'Budget Groceries', monthlyCost: 400, healthEffect: -2, happinessEffect: 0, statusEffect: 0, description: 'Basic groceries on a tight budget.', stackable: false },
  { id: 'food_normal', category: 'food', name: 'Normal Groceries', monthlyCost: 550, healthEffect: 2, happinessEffect: 1, statusEffect: 0, description: 'A reasonably balanced grocery budget.', stackable: false },
  { id: 'food_premium', category: 'food', name: 'Healthy Premium Groceries', monthlyCost: 850, healthEffect: 8, happinessEffect: 3, statusEffect: 1, description: 'High-quality, health-focused groceries.', stackable: false },
  { id: 'food_meal_prep', category: 'food', name: 'Meal-Prep Service', monthlyCost: 1_200, healthEffect: 10, happinessEffect: 5, statusEffect: 2, description: 'Chef-prepared meals delivered — healthy and convenient.', stackable: false },
  { id: 'food_restaurants', category: 'food', name: 'Frequent Restaurants', monthlyCost: 1_600, healthEffect: -3, happinessEffect: 8, statusEffect: 4, description: 'Eating out often — fun, indulgent, and expensive.', stackable: false },
  { id: 'food_private_chef', category: 'food', name: 'Private Chef', monthlyCost: 8_500, healthEffect: 14, happinessEffect: 10, statusEffect: 10, description: 'A dedicated private chef preparing every meal.', stackable: false },

  // ---------- Personal Services (stackable) ----------
  { id: 'svc_cleaner', category: 'services', name: 'House Cleaner', monthlyCost: 320, healthEffect: 1, happinessEffect: 5, statusEffect: 1, description: 'Regular house cleaning — less chore time, less stress.', stackable: true },
  { id: 'svc_stylist', category: 'services', name: 'Personal Stylist', monthlyCost: 450, healthEffect: 0, happinessEffect: 4, statusEffect: 6, description: 'A stylist keeps your wardrobe and image sharp.', stackable: true },
  { id: 'svc_assistant', category: 'services', name: 'Personal Assistant', monthlyCost: 3_200, healthEffect: 0, happinessEffect: 6, statusEffect: 5, description: 'An assistant handles your errands and scheduling.', stackable: true },
  { id: 'svc_chauffeur', category: 'services', name: 'Chauffeur', monthlyCost: 5_500, healthEffect: 1, happinessEffect: 5, statusEffect: 9, description: 'A dedicated driver — arrive everywhere without the hassle.', stackable: true },
  { id: 'svc_security', category: 'services', name: 'Private Security', monthlyCost: 9_000, healthEffect: 0, happinessEffect: 3, statusEffect: 10, description: 'A private security detail — for a life that draws attention.', stackable: true },
];

export function getLifestyleTier(id: string | null | undefined): LifestyleTier | undefined {
  return id ? LIFESTYLE_TIERS.find((t) => t.id === id) : undefined;
}
