import type { AircraftCategory, AircraftListing } from '@/game/types';

export const AIRCRAFT_CATEGORY_LABELS: Record<AircraftCategory, string> = {
  bush_plane: 'Bush Plane',
  propeller: 'Propeller Aircraft',
  turboprop: 'Turboprop',
  seaplane: 'Seaplane',
  light_jet: 'Light Jet',
  private_jet: 'Private Jet',
  long_range_jet: 'Long-Range Jet',
  luxury_jet: 'Luxury Business Jet',
  helicopter: 'Helicopter',
};

export const AIRCRAFT_LISTINGS: AircraftListing[] = [
  { id: 'bush_plane', category: 'bush_plane', name: 'Ranger Bush Plane', price: 220_000, rangeMiles: 550, passengers: 4, prestige: 10, operatingCostMonthly: 1_800, crewCostMonthly: 0, hangarCostMonthly: 600, image: '/assets/aircraft/bush-plane-adventure.png' },
  { id: 'skylux_prop', category: 'propeller', name: 'SkyLux Voyager Prop', price: 380_000, rangeMiles: 900, passengers: 6, prestige: 25, operatingCostMonthly: 2_800, crewCostMonthly: 6_500, hangarCostMonthly: 1_200, image: '/assets/aircraft/skylux-voyager-prop.png' },
  { id: 'executive_turboprop', category: 'turboprop', name: 'Executive Turboprop', price: 1_100_000, rangeMiles: 1_500, passengers: 8, prestige: 32, operatingCostMonthly: 4_200, crewCostMonthly: 7_800, hangarCostMonthly: 1_600, image: '/assets/aircraft/executive-turboprop.png' },
  { id: 'skylux_heli', category: 'helicopter', name: 'SkyLux Aero Helicopter', price: 1_450_000, rangeMiles: 400, passengers: 5, prestige: 40, operatingCostMonthly: 6_500, crewCostMonthly: 9_500, hangarCostMonthly: 2_200, image: '/assets/aircraft/skylux-aero-helicopter.png' },
  { id: 'luxury_seaplane', category: 'seaplane', name: 'Luxury Seaplane', price: 2_600_000, rangeMiles: 1_100, passengers: 8, prestige: 45, operatingCostMonthly: 8_500, crewCostMonthly: 11_000, hangarCostMonthly: 2_800, image: '/assets/aircraft/luxury-seaplane.png' },
  { id: 'skylux_light_jet', category: 'light_jet', name: 'SkyLux Falcon Light Jet', price: 4_800_000, rangeMiles: 1_800, passengers: 8, prestige: 55, operatingCostMonthly: 12_000, crewCostMonthly: 16_000, hangarCostMonthly: 4_500, image: '/assets/aircraft/skylux-falcon-light-jet.png' },
  { id: 'skylux_private_jet', category: 'private_jet', name: 'SkyLux Meridian Private Jet', price: 15_000_000, rangeMiles: 3_200, passengers: 10, prestige: 70, operatingCostMonthly: 28_000, crewCostMonthly: 32_000, hangarCostMonthly: 9_000, image: '/assets/aircraft/skylux-meridian-private-jet.png' },
  { id: 'skylux_long_range', category: 'long_range_jet', name: 'SkyLux Horizon Long-Range', price: 38_000_000, rangeMiles: 6_500, passengers: 14, prestige: 85, operatingCostMonthly: 55_000, crewCostMonthly: 58_000, hangarCostMonthly: 16_000, image: '/assets/aircraft/skylux-horizon-long-range.png' },
  { id: 'skylux_luxury_jet', category: 'luxury_jet', name: 'SkyLux Sovereign Luxury Jet', price: 78_000_000, rangeMiles: 7_800, passengers: 18, prestige: 96, operatingCostMonthly: 95_000, crewCostMonthly: 88_000, hangarCostMonthly: 26_000, image: '/assets/aircraft/skylux-sovereign-luxury-jet.png' },
  { id: 'futuristic_jet', category: 'luxury_jet', name: 'Zenith Aurora Flagship Jet', price: 120_000_000, rangeMiles: 8_500, passengers: 20, prestige: 99, operatingCostMonthly: 110_000, crewCostMonthly: 95_000, hangarCostMonthly: 30_000, image: '/assets/aircraft/futuristic-private-jet.png' },
];
