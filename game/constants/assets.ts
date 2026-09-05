// Central manifest for every photographic asset in the game. Never reference
// an /assets/... path directly from a component — import from here instead,
// so swapping or adding art is a one-file change.

export const GAME_ASSETS = {
  businesses: {
    fastFoodRestaurantSunset: '/assets/businesses/fast-food-restaurant-sunset.png',
    fastFoodRestaurantDusk: '/assets/businesses/fast-food-restaurant-dusk.png',
  },
  education: {
    stateUniversity: '/assets/education/state-university.png',
    eliteUniversity: '/assets/education/elite-university.png',
  },
  backgrounds: {
    abstractDarkBlue: '/assets/backgrounds/abstract-dark-blue.png',
    luxuryCityNight: '/assets/backgrounds/luxury-city-night.png',
    luxuryMarinaDusk: '/assets/backgrounds/luxury-marina-dusk.png',
    luxuryMansionPool: '/assets/backgrounds/luxury-mansion-pool.png',
    luxuryGarage: '/assets/backgrounds/luxury-garage.png',
    abstractGlassLuxury: '/assets/backgrounds/abstract-glass-luxury.png',
    futuristicTech: '/assets/backgrounds/futuristic-tech.png',
    cityBridgeSkyline: '/assets/backgrounds/city-bridge-skyline.png',
    cityWaterfrontDark: '/assets/backgrounds/city-waterfront-dark.png',
    coastalNight: '/assets/backgrounds/coastal-night.png',
  },
} as const;

// ---------- Listing → image assignment ----------
// Vehicles, boats, aircraft, properties, and luxury items each carry their own `image` field
// directly on the listing definition (game/constants/vehicles|boats|aircraft|properties|luxury.ts)
// — one dedicated image per listing, so nothing here maps them by category anymore (that
// indirection was the reason several unrelated cars/boats/jets/watches used to share one picture).

export const BUSINESS_INDUSTRY_IMAGE: Record<string, string> = {
  fast_food: GAME_ASSETS.businesses.fastFoodRestaurantSunset,
};

export const INSTITUTION_TIER_IMAGE: Record<string, string> = {
  state: GAME_ASSETS.education.stateUniversity,
  elite: GAME_ASSETS.education.eliteUniversity,
};

// Per-page hero/atmosphere backgrounds. Only pages with a genuinely matching image from the
// asset pack get one here — we don't force a mismatched photo onto a section just to fill the slot.
export const PAGE_BACKGROUND: Record<string, string> = {
  overview: GAME_ASSETS.backgrounds.luxuryCityNight,
  career: GAME_ASSETS.backgrounds.luxuryCityNight,
  boats: GAME_ASSETS.backgrounds.luxuryMarinaDusk,
  properties: GAME_ASSETS.backgrounds.luxuryMansionPool,
  vehicles: GAME_ASSETS.backgrounds.luxuryGarage,
  businesses: GAME_ASSETS.backgrounds.abstractGlassLuxury,
  education: GAME_ASSETS.backgrounds.futuristicTech,
  investments: GAME_ASSETS.backgrounds.cityBridgeSkyline,
  holdings: GAME_ASSETS.backgrounds.cityWaterfrontDark,
  acquisitions: GAME_ASSETS.backgrounds.coastalNight,
};
