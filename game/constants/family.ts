import type { PersonalityTrait } from '@/game/types';

export const PERSONALITY_TRAITS: PersonalityTrait[] = [
  'kind', 'ambitious', 'funny', 'adventurous', 'intellectual', 'reserved', 'romantic', 'independent',
  'frugal', 'materialistic', 'generous', 'cautious', 'family_oriented', 'career_focused',
];

/** The subset of traits meaningful for NPC financial/life-decision behavior (windfalls, retirement, gifting reactions). */
export const NPC_BEHAVIOR_TRAITS: PersonalityTrait[] = [
  'frugal', 'materialistic', 'generous', 'cautious', 'family_oriented', 'career_focused', 'ambitious', 'independent',
];

export const PERSONALITY_LABELS: Record<PersonalityTrait, string> = {
  kind: 'Kind',
  ambitious: 'Ambitious',
  funny: 'Funny',
  adventurous: 'Adventurous',
  intellectual: 'Intellectual',
  reserved: 'Reserved',
  romantic: 'Romantic',
  independent: 'Independent',
  frugal: 'Frugal',
  materialistic: 'Materialistic',
  generous: 'Generous',
  cautious: 'Cautious',
  family_oriented: 'Family-Oriented',
  career_focused: 'Career-Focused',
};

export const PARENT_OCCUPATIONS = [
  'Engineer', 'Teacher', 'Nurse', 'Accountant', 'Contractor', 'Chef',
  'Police Officer', 'Small Business Owner', 'Electrician', 'Sales Manager', 'Architect', 'Pharmacist',
];

export const GRANDPARENT_OCCUPATIONS = [
  'Retired Teacher', 'Retired Engineer', 'Retired Postal Worker', 'Retired Nurse',
  'Former Shop Owner', 'Retired Machinist', 'Retired Farmer', 'Retired Bookkeeper',
];

export const DATING_OCCUPATIONS = [
  'Graphic Designer', 'Nurse', 'Software Developer', 'Photographer', 'Teacher', 'Chef',
  'Marketing Coordinator', 'Physical Therapist', 'Architect', 'Musician', 'Accountant', 'Personal Trainer',
];

export const HOME_DESCRIPTIONS_MODEST = [
  'Modest apartment', 'Small rented house', 'Cozy two-bedroom condo', 'Mobile home',
];
export const HOME_DESCRIPTIONS_COMFORTABLE = [
  'Paid-off suburban house', 'Comfortable townhouse', 'Nice condo downtown', 'Family house with a yard',
];
export const HOME_DESCRIPTIONS_UPSCALE = [
  'Upscale home in a gated community', 'Renovated luxury condo', 'Large house with a pool', 'Waterfront property',
];

export const VEHICLE_DESCRIPTIONS_MODEST = ['Older sedan', 'Used hatchback', 'High-mileage pickup truck'];
export const VEHICLE_DESCRIPTIONS_COMFORTABLE = ['Reliable SUV', 'Newer sedan', 'Family minivan'];
export const VEHICLE_DESCRIPTIONS_UPSCALE = ['Luxury sedan', 'New SUV', 'Sports car'];
