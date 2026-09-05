import type { PropertyType } from '@/game/types';

export interface PropertyListing {
  id: string;
  type: PropertyType;
  name: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  luxuryRating: number; // 1-5
  isRentalFriendly: boolean;
  monthlyRent: number;
  description: string;
  image?: string;
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  trailer: 'Mobile Home',
  studio: 'Studio Apartment',
  apartment: 'Apartment',
  townhouse: 'Townhouse',
  house: 'House',
  luxury_house: 'Luxury House',
  villa: 'Villa',
  penthouse: 'Penthouse',
  mansion: 'Mansion',
  estate: 'Estate',
  beach_house: 'Beach House',
  mountain_home: 'Mountain Home',
  private_island: 'Private Island Estate',
};

export const PROPERTY_LISTINGS: PropertyListing[] = [
  { id: 'rural_mobile_home', type: 'trailer', name: 'Rural Mobile Home', city: 'Austin', price: 38_000, bedrooms: 2, bathrooms: 1, sqft: 720, luxuryRating: 1, isRentalFriendly: false, monthlyRent: 0, description: 'A modest mobile home on a quiet rural lot — the cheapest way onto the property ladder.', image: '/assets/properties/humble-rural-trailer-home.png' },
  { id: 'suburban_starter_house', type: 'house', name: 'Suburban Starter House', city: 'Austin', price: 245_000, bedrooms: 3, bathrooms: 2, sqft: 1_600, luxuryRating: 2, isRentalFriendly: true, monthlyRent: 1_900, description: 'A tidy single-story starter home with a small yard in a quiet suburb.', image: '/assets/properties/cozy-suburban-family-house.png' },
  { id: 'craftsman_family_home', type: 'house', name: 'Craftsman Family Home', city: 'Dallas', price: 495_000, bedrooms: 4, bathrooms: 3, sqft: 2_800, luxuryRating: 2, isRentalFriendly: true, monthlyRent: 3_100, description: 'A two-story craftsman-style family home with a two-car garage and mature landscaping.', image: '/assets/properties/modern-dream-home.png' },
  { id: 'brownstone_townhouse', type: 'townhouse', name: 'Historic Brownstone Townhouse', city: 'Chicago', price: 780_000, bedrooms: 3, bathrooms: 3, sqft: 2_200, luxuryRating: 3, isRentalFriendly: true, monthlyRent: 4_600, description: 'A classic brick brownstone on a tree-lined city street, steps from everything.', image: '/assets/properties/classic-brick-townhouse.png' },
  { id: 'modern_luxury_home', type: 'luxury_house', name: 'Modern Luxury Home', city: 'Seattle', price: 2_100_000, bedrooms: 5, bathrooms: 5, sqft: 4_400, luxuryRating: 4, isRentalFriendly: true, monthlyRent: 9_800, description: 'A sprawling modern estate home with a three-car garage and designer landscaping.', image: '/assets/properties/upscale-modern-suburban-home.png' },
  { id: 'hillside_waterfront_villa', type: 'villa', name: 'Hillside Waterfront Villa', city: 'San Francisco', price: 6_800_000, bedrooms: 5, bathrooms: 6, sqft: 6_200, luxuryRating: 5, isRentalFriendly: true, monthlyRent: 28_000, description: 'A glass-walled hillside villa with an infinity pool overlooking the bay.', image: '/assets/properties/luxury-waterfront-villa-new.png' },
  { id: 'tropical_waterfront_mansion', type: 'mansion', name: 'Tropical Waterfront Mansion', city: 'Miami', price: 12_500_000, bedrooms: 6, bathrooms: 8, sqft: 7_800, luxuryRating: 5, isRentalFriendly: false, monthlyRent: 0, description: 'A palm-fringed waterfront mansion with private dock access and yacht moorings nearby.', image: '/assets/properties/modern-tropical-waterfront-mansion.png' },
  { id: 'grand_estate', type: 'estate', name: 'Grand Estate', city: 'Los Angeles', price: 26_000_000, bedrooms: 8, bathrooms: 10, sqft: 11_500, luxuryRating: 5, isRentalFriendly: false, monthlyRent: 0, description: 'A grand estate with a circular motor court, fountain, and sweeping valley views.', image: '/assets/properties/grand-estate-mansion.png' },
  { id: 'riviera_hillside_compound', type: 'estate', name: 'Riviera Hillside Compound', city: 'San Diego', price: 52_000_000, bedrooms: 9, bathrooms: 12, sqft: 15_000, luxuryRating: 5, isRentalFriendly: false, monthlyRent: 0, description: 'An ultra-exclusive hillside compound with a private harbor view — the pinnacle of real estate.', image: '/assets/properties/hillside-luxury-mansion.png' },
];
