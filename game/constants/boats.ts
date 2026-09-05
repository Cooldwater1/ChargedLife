import type { BoatCategory, BoatListing } from '@/game/types';

export const BOAT_CATEGORY_LABELS: Record<BoatCategory, string> = {
  small_boat: 'Small Boat',
  rib: 'RIB',
  fishing: 'Fishing Boat',
  speedboat: 'Speedboat',
  cruiser: 'Cruiser',
  yacht: 'Luxury Yacht',
  superyacht: 'Superyacht',
};

export const BOAT_LISTINGS: BoatListing[] = [
  { id: 'harbor_skiff', category: 'small_boat', name: 'Harbor Skiff 18', lengthFt: 18, price: 24_000, topSpeedKnots: 32, crewRequired: 0, prestige: 8, maintenanceMonthly: 180, marinaFeeMonthly: 220, crewCostMonthly: 0, image: '/assets/boats/harbor-skiff-18.png' },
  { id: 'luxury_rib', category: 'rib', name: 'Sterling Luxury RIB', lengthFt: 24, price: 42_000, topSpeedKnots: 42, crewRequired: 0, prestige: 14, maintenanceMonthly: 280, marinaFeeMonthly: 300, crewCostMonthly: 0, image: '/assets/boats/luxury-rib.png' },
  { id: 'fishing_boat', category: 'fishing', name: 'Center Console Fisher', lengthFt: 26, price: 68_000, topSpeedKnots: 38, crewRequired: 0, prestige: 12, maintenanceMonthly: 320, marinaFeeMonthly: 260, crewCostMonthly: 0, image: '/assets/boats/center-console-fishing-boat.png' },
  { id: 'wave_runner_speed', category: 'speedboat', name: 'Wave Runner Sport', lengthFt: 28, price: 95_000, topSpeedKnots: 55, crewRequired: 0, prestige: 20, maintenanceMonthly: 650, marinaFeeMonthly: 480, crewCostMonthly: 0, image: '/assets/boats/sport-speedboat.png' },
  { id: 'oceancrest_cruiser', category: 'cruiser', name: 'Oceancrest 42 Flybridge Cruiser', lengthFt: 42, price: 480_000, topSpeedKnots: 32, crewRequired: 1, prestige: 38, maintenanceMonthly: 2_400, marinaFeeMonthly: 1_800, crewCostMonthly: 4_200, image: '/assets/boats/flybridge-yacht-golden-hour.png' },
  { id: 'oceancrest_yacht', category: 'yacht', name: 'Oceancrest 80 Yacht', lengthFt: 80, price: 4_200_000, topSpeedKnots: 26, crewRequired: 4, prestige: 68, maintenanceMonthly: 18_000, marinaFeeMonthly: 9_500, crewCostMonthly: 28_000, image: '/assets/boats/luxury-yacht-marina-new.png' },
  { id: 'oceancrest_flagship', category: 'yacht', name: 'Oceancrest 110 Explorer Flagship', lengthFt: 110, price: 12_500_000, topSpeedKnots: 24, crewRequired: 8, prestige: 80, maintenanceMonthly: 42_000, marinaFeeMonthly: 22_000, crewCostMonthly: 62_000, image: '/assets/boats/explorer-yacht.png' },
  { id: 'sunset_superyacht', category: 'superyacht', name: 'Meridian Sunset Superyacht', lengthFt: 140, price: 28_000_000, topSpeedKnots: 23, crewRequired: 12, prestige: 75, maintenanceMonthly: 95_000, marinaFeeMonthly: 38_000, crewCostMonthly: 120_000, image: '/assets/boats/superyacht-sunset-harbor.png' },
  { id: 'modern_superyacht', category: 'superyacht', name: 'Meridian Modern Superyacht', lengthFt: 165, price: 55_000_000, topSpeedKnots: 22, crewRequired: 15, prestige: 88, maintenanceMonthly: 140_000, marinaFeeMonthly: 52_000, crewCostMonthly: 180_000, image: '/assets/boats/modern-superyacht.png' },
  { id: 'oceancrest_superyacht', category: 'superyacht', name: 'Oceancrest 180 Superyacht', lengthFt: 180, price: 85_000_000, topSpeedKnots: 22, crewRequired: 18, prestige: 95, maintenanceMonthly: 180_000, marinaFeeMonthly: 65_000, crewCostMonthly: 240_000, image: '/assets/boats/grand-superyacht.png' },
];
