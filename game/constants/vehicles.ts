import type { VehicleCategory, VehicleListing } from '@/game/types';

export const VEHICLE_CATEGORY_LABELS: Record<VehicleCategory, string> = {
  economy: 'Economy',
  sedan: 'Sedan',
  suv: 'SUV',
  pickup: 'Pickup Truck',
  sports: 'Sports Car',
  super: 'Supercar',
  hyper: 'Hypercar',
  classic: 'Classic Car',
  luxury: 'Luxury Car',
  electric: 'Electric',
};

export const VEHICLE_LISTINGS: VehicleListing[] = [
  { id: 'vega_hatch', category: 'economy', brand: 'Vega', model: 'Hatch', year: 2025, price: 18_500, topSpeedMph: 112, horsepower: 120, prestige: 8, insuranceMonthly: 85, maintenanceMonthly: 45, image: '/assets/vehicles/vega-hatch.png' },
  { id: 'volt_streak', category: 'electric', brand: 'Volt', model: 'Streak', year: 2025, price: 26_000, topSpeedMph: 118, horsepower: 180, prestige: 12, insuranceMonthly: 85, maintenanceMonthly: 30, image: '/assets/vehicles/electric-hatchback-white.png' },
  { id: 'vega_commuter', category: 'economy', brand: 'Vega', model: 'Commuter', year: 2025, price: 22_900, topSpeedMph: 118, horsepower: 135, prestige: 10, insuranceMonthly: 90, maintenanceMonthly: 50, image: '/assets/vehicles/vega-commuter.png' },
  { id: 'atlas_sedan', category: 'sedan', brand: 'Atlas', model: 'Sedan LX', year: 2025, price: 32_000, topSpeedMph: 128, horsepower: 180, prestige: 18, insuranceMonthly: 110, maintenanceMonthly: 60, image: '/assets/vehicles/atlas-sedan-lx.png' },
  { id: 'atlas_sedan_sport', category: 'sedan', brand: 'Atlas', model: 'Sedan Sport', year: 2025, price: 41_500, topSpeedMph: 140, horsepower: 240, prestige: 24, insuranceMonthly: 130, maintenanceMonthly: 70, image: '/assets/vehicles/atlas-sedan-sport.png' },
  { id: 'offroad_pickup', category: 'pickup', brand: 'Ridgeline', model: 'Trailhand Pickup', year: 2025, price: 44_000, topSpeedMph: 105, horsepower: 310, prestige: 20, insuranceMonthly: 135, maintenanceMonthly: 95, image: '/assets/vehicles/offroad-pickup-blue.png' },
  { id: 'ridgeline_suv', category: 'suv', brand: 'Ridgeline', model: 'Explorer SUV', year: 2025, price: 46_000, topSpeedMph: 122, horsepower: 260, prestige: 26, insuranceMonthly: 145, maintenanceMonthly: 80, image: '/assets/vehicles/ridgeline-explorer-suv.png' },
  { id: 'offroad_adventure_suv', category: 'suv', brand: 'Ridgeline', model: 'Trailblazer SUV', year: 2025, price: 58_000, topSpeedMph: 112, horsepower: 290, prestige: 28, insuranceMonthly: 165, maintenanceMonthly: 110, image: '/assets/vehicles/offroad-adventure-suv-beige.png' },
  { id: 'volt_horizon', category: 'electric', brand: 'Volt', model: 'Horizon', year: 2025, price: 62_000, topSpeedMph: 155, horsepower: 480, prestige: 38, insuranceMonthly: 150, maintenanceMonthly: 45, image: '/assets/vehicles/luxury-ev-sedan-blue.png' },
  { id: 'ridgeline_suv_premium', category: 'suv', brand: 'Ridgeline', model: 'Summit SUV', year: 2025, price: 68_000, topSpeedMph: 130, horsepower: 320, prestige: 34, insuranceMonthly: 175, maintenanceMonthly: 95, image: '/assets/vehicles/ridgeline-summit-suv.png' },
  { id: 'velar_gt', category: 'sports', brand: 'Velar', model: 'GT Coupe', year: 2025, price: 85_000, topSpeedMph: 170, horsepower: 420, prestige: 48, insuranceMonthly: 240, maintenanceMonthly: 140, image: '/assets/vehicles/velar-gt-coupe.png' },
  { id: 'aristo_grande', category: 'luxury', brand: 'Aristo', model: 'Grande Estate', year: 2025, price: 95_000, topSpeedMph: 148, horsepower: 360, prestige: 44, insuranceMonthly: 220, maintenanceMonthly: 130, image: '/assets/vehicles/premium-estate-champagne.png' },
  { id: 'fullsize_luxury_suv', category: 'suv', brand: 'Aristo', model: 'Sovereign SUV', year: 2025, price: 98_000, topSpeedMph: 125, horsepower: 400, prestige: 42, insuranceMonthly: 220, maintenanceMonthly: 130, image: '/assets/vehicles/fullsize-luxury-suv-burgundy.png' },
  { id: 'velar_gts', category: 'sports', brand: 'Velar', model: 'GTS', year: 2025, price: 118_000, topSpeedMph: 182, horsepower: 480, prestige: 55, insuranceMonthly: 290, maintenanceMonthly: 165, image: '/assets/vehicles/velar-gts.png' },
  { id: 'stallion_classic', category: 'classic', brand: 'Stallion', model: '67 Coupe', year: 1967, price: 165_000, topSpeedMph: 140, horsepower: 320, prestige: 60, insuranceMonthly: 220, maintenanceMonthly: 260 },
  { id: 'zenith_infinite', category: 'sports', brand: 'Zenith', model: 'Infinite Roadster', year: 2025, price: 185_000, topSpeedMph: 195, horsepower: 620, prestige: 62, insuranceMonthly: 380, maintenanceMonthly: 230, image: '/assets/vehicles/roadster-silver-blue.png' },
  { id: 'zenith_hyper', category: 'luxury', brand: 'Zenith', model: 'Grand Tourer', year: 2025, price: 210_000, topSpeedMph: 190, horsepower: 590, prestige: 64, insuranceMonthly: 400, maintenanceMonthly: 220, image: '/assets/vehicles/grand-tourer-green.png' },
  { id: 'apex_gt', category: 'super', brand: 'Apex', model: 'GT Ultra', year: 2025, price: 285_000, topSpeedMph: 205, horsepower: 640, prestige: 72, insuranceMonthly: 520, maintenanceMonthly: 320, image: '/assets/vehicles/apex-gt-ultra.png' },
  { id: 'apex_venom', category: 'sports', brand: 'Apex', model: 'Venom Coupe', year: 2025, price: 155_000, topSpeedMph: 188, horsepower: 560, prestige: 58, insuranceMonthly: 340, maintenanceMonthly: 210, image: '/assets/vehicles/sport-coupe-gold.png' },
  { id: 'aristo_regent', category: 'luxury', brand: 'Aristo', model: 'Regent Limousine', year: 2025, price: 310_000, topSpeedMph: 155, horsepower: 420, prestige: 80, insuranceMonthly: 420, maintenanceMonthly: 260, image: '/assets/vehicles/black-luxury-limousine.png' },
];
