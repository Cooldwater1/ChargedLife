export interface RentalListing {
  id: string;
  name: string;
  city: string;
  monthlyRent: number;
  deposit: number;
  moveInCost: number; // deposit + first month, shown upfront
  utilitiesEstimateMonthly: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  qualityRating: number; // 1-5
  requiredMonthlyIncome: number; // a soft affordability guideline shown to the player
  description: string;
  image: string;
}

export const RENTAL_LISTINGS: RentalListing[] = [
  {
    id: 'rundown_studio', name: 'Rundown Studio Unit', city: 'Austin', monthlyRent: 650, deposit: 650, moveInCost: 1_300,
    utilitiesEstimateMonthly: 90, bedrooms: 0, bathrooms: 1, sqft: 380, qualityRating: 1, requiredMonthlyIncome: 1_950,
    description: 'A worn studio unit in an aging building — cheap, and it comes with the noise to match.',
    image: '/assets/rentals/rundown-urban-apartment-building.png',
  },
  {
    id: 'budget_one_bedroom', name: 'Budget 1-Bedroom Apartment', city: 'Dallas', monthlyRent: 1_050, deposit: 1_050, moveInCost: 2_100,
    utilitiesEstimateMonthly: 120, bedrooms: 1, bathrooms: 1, sqft: 620, qualityRating: 2, requiredMonthlyIncome: 3_150,
    description: 'A basic one-bedroom in a large complex — nothing fancy, but functional and affordable.',
    image: '/assets/rentals/rundown-apartment-complex.png',
  },
  {
    id: 'luxury_highrise_apartment', name: 'Luxury High-Rise Apartment', city: 'Chicago', monthlyRent: 3_200, deposit: 4_800, moveInCost: 8_000,
    utilitiesEstimateMonthly: 220, bedrooms: 2, bathrooms: 2, sqft: 1_400, qualityRating: 4, requiredMonthlyIncome: 9_600,
    description: 'A polished high-rise unit with skyline views and a doorman — renting done in style.',
    image: '/assets/properties/penthouse-city-view.png',
  },
  {
    id: 'executive_penthouse_suite', name: 'Executive Penthouse Suite', city: 'New York', monthlyRent: 8_500, deposit: 17_000, moveInCost: 25_500,
    utilitiesEstimateMonthly: 380, bedrooms: 3, bathrooms: 3, sqft: 2_600, qualityRating: 5, requiredMonthlyIncome: 25_500,
    description: 'A top-floor penthouse suite for tenants who want the address without the mortgage.',
    image: '/assets/properties/penthouse-sunset.png',
  },
];
