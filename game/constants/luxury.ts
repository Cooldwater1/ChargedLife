import type { LuxuryCategory, LuxuryListing } from '@/game/types';

export const LUXURY_CATEGORY_LABELS: Record<LuxuryCategory, string> = {
  watch: 'Luxury Watch',
  ring: 'Ring',
  necklace: 'Necklace',
  bracelet: 'Bracelet',
  earrings: 'Earrings',
  collectible: 'Rare Collectible',
};

export const LUXURY_LISTINGS: LuxuryListing[] = [
  { id: 'chronos_steel', category: 'watch', name: 'Steel Chronograph', brand: 'Chronos', price: 8_500, prestige: 20, appreciationAnnual: 0.01, image: '/assets/luxury/watch-steel-chronograph.png' },
  { id: 'chronos_gold', category: 'watch', name: 'Gold Perpetual', brand: 'Chronos', price: 42_000, prestige: 45, appreciationAnnual: 0.03, image: '/assets/luxury/watch-gold-perpetual.png' },
  { id: 'chronos_limited', category: 'watch', name: 'Limited Tourbillon', brand: 'Chronos', price: 185_000, prestige: 75, appreciationAnnual: 0.05, image: '/assets/luxury/watch-limited-tourbillon.png' },
  { id: 'lumiere_solitaire', category: 'ring', name: 'Solitaire Diamond Ring', brand: 'Lumiere', price: 12_000, prestige: 30, appreciationAnnual: 0.0, image: '/assets/luxury/ring-solitaire-diamond.png' },
  { id: 'lumiere_heirloom', category: 'ring', name: 'Heirloom Diamond Ring', brand: 'Lumiere', price: 65_000, prestige: 55, appreciationAnnual: 0.01, image: '/assets/luxury/ring-heirloom-diamond.png' },
  { id: 'lumiere_necklace', category: 'necklace', name: 'Diamond Tennis Necklace', brand: 'Lumiere', price: 38_000, prestige: 48, appreciationAnnual: 0.0, image: '/assets/luxury/necklace-diamond-tennis.png' },
  { id: 'lumiere_bracelet', category: 'bracelet', name: 'Sapphire Bracelet', brand: 'Lumiere', price: 22_000, prestige: 38, appreciationAnnual: 0.0, image: '/assets/luxury/bracelet-sapphire.png' },
  { id: 'lumiere_earrings', category: 'earrings', name: 'Emerald Drop Earrings', brand: 'Lumiere', price: 29_000, prestige: 42, appreciationAnnual: 0.0, image: '/assets/luxury/earrings-emerald-drop.png' },
  { id: 'lumiere_pearl', category: 'necklace', name: 'Pearl Necklace', brand: 'Lumiere', price: 15_000, prestige: 32, appreciationAnnual: 0.0, image: '/assets/luxury/necklace-pearl.png' },
  { id: 'lumiere_ruby', category: 'necklace', name: 'Ruby Pendant', brand: 'Lumiere', price: 26_000, prestige: 40, appreciationAnnual: 0.0, image: '/assets/luxury/pendant-ruby.png' },
  { id: 'atelier_painting', category: 'collectible', name: 'Modernist Original Painting', brand: 'Atelier House', price: 95_000, prestige: 60, appreciationAnnual: 0.04 },
  { id: 'atelier_sculpture', category: 'collectible', name: 'Bronze Sculpture', brand: 'Atelier House', price: 220_000, prestige: 70, appreciationAnnual: 0.035 },
];
