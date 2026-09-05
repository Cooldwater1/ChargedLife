import { generateId } from '@/lib/id';
import { pickOne } from '@/lib/random';
import type { Review } from '@/game/types';

const FIVE_STAR = [
  'Great food and surprisingly quick service.',
  'This is our new go-to spot. Consistently excellent.',
  'Friendly staff and the food came out fast and fresh.',
  'Best value in town for what you get.',
];

const FOUR_STAR = [
  'Good value for the price. Would come back.',
  'Solid meal, nothing to complain about.',
  'Tasty food, service was a little slow but worth the wait.',
];

const THREE_STAR = [
  'It was fine. Nothing special but got the job done.',
  'Food was okay, but I expected a bit more for the price.',
  'Average experience overall.',
];

const TWO_STAR = [
  'Waited forever. They need more employees.',
  'Food was cold by the time I got it.',
  'Overpriced for what you actually get.',
];

const ONE_STAR = [
  'Terrible wait times and the staff seemed overwhelmed.',
  'Quality has really dropped recently.',
  'Would not recommend right now. Needs serious improvement.',
];

function ratingToPool(rating: number): string[] {
  if (rating >= 4.5) return FIVE_STAR;
  if (rating >= 3.5) return FOUR_STAR;
  if (rating >= 2.5) return THREE_STAR;
  if (rating >= 1.5) return TWO_STAR;
  return ONE_STAR;
}

/**
 * Generates a review whose star rating is derived from actual satisfaction,
 * with a small amount of random noise so reviews aren't perfectly uniform.
 */
export function generateReview(
  rng: () => number,
  businessId: string,
  locationId: string,
  satisfaction: number,
  timestamp: number,
): Review {
  const noise = (rng() - 0.5) * 20;
  const score = Math.min(100, Math.max(0, satisfaction + noise));
  const rating = Math.min(5, Math.max(1, Math.round((score / 100) * 4 + 1)));
  const pool = ratingToPool(rating);

  return {
    id: generateId('review'),
    businessId,
    locationId,
    rating,
    text: pickOne(rng, pool),
    timestamp,
  };
}
