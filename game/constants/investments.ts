import type { MarketInstrument } from '@/game/types';

export interface InstrumentSeed {
  symbol: string;
  name: string;
  assetClass: MarketInstrument['assetClass'];
  sector: string;
  basePrice: number;
  volatility: number;
  driftAnnual: number;
}

export const INSTRUMENT_SEEDS: InstrumentSeed[] = [
  { symbol: 'NOVA', name: 'Nova Technologies', assetClass: 'stock', sector: 'Technology', basePrice: 142.82, volatility: 0.028, driftAnnual: 0.12 },
  { symbol: 'VRTX', name: 'Vertex Technologies', assetClass: 'stock', sector: 'Technology', basePrice: 88.40, volatility: 0.032, driftAnnual: 0.14 },
  { symbol: 'APEX', name: 'Apex Automotive', assetClass: 'stock', sector: 'Automotive', basePrice: 64.15, volatility: 0.026, driftAnnual: 0.08 },
  { symbol: 'OCST', name: 'Oceancrest Marine', assetClass: 'stock', sector: 'Marine & Leisure', basePrice: 41.90, volatility: 0.030, driftAnnual: 0.07 },
  { symbol: 'SKLX', name: 'SkyLux Aviation', assetClass: 'stock', sector: 'Aviation', basePrice: 205.60, volatility: 0.024, driftAnnual: 0.09 },
  { symbol: 'BWAV', name: 'BrightWave Media', assetClass: 'stock', sector: 'Media', basePrice: 33.20, volatility: 0.035, driftAnnual: 0.06 },
  { symbol: 'STRL', name: 'Sterling Retail Group', assetClass: 'stock', sector: 'Retail', basePrice: 27.55, volatility: 0.020, driftAnnual: 0.05 },
  { symbol: 'NVFN', name: 'Nova Financial', assetClass: 'stock', sector: 'Finance', basePrice: 96.30, volatility: 0.022, driftAnnual: 0.07 },
  { symbol: 'USMI', name: 'US Market Index Fund', assetClass: 'etf', sector: 'Broad Market', basePrice: 412.10, volatility: 0.012, driftAnnual: 0.09 },
  { symbol: 'GRWI', name: 'Growth Sector Index Fund', assetClass: 'etf', sector: 'Growth', basePrice: 188.75, volatility: 0.018, driftAnnual: 0.11 },
  { symbol: 'DIVI', name: 'Dividend Income Fund', assetClass: 'etf', sector: 'Dividend', basePrice: 76.40, volatility: 0.008, driftAnnual: 0.055 },
  { symbol: 'BCOIN', name: 'BitCore', assetClass: 'crypto', sector: 'Cryptocurrency', basePrice: 38_400, volatility: 0.065, driftAnnual: 0.15 },
  { symbol: 'ETHX', name: 'EtherX', assetClass: 'crypto', sector: 'Cryptocurrency', basePrice: 2_180, volatility: 0.07, driftAnnual: 0.13 },
];
