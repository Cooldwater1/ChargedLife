import { INSTRUMENT_SEEDS } from '@/game/constants/investments';
import { MARKET_HISTORY_MAX_DAYS } from '@/game/constants/balance';
import { randRange } from '@/lib/random';
import type { EconomyState, Holding, InvestmentState, MarketInstrument } from '@/game/types';

export function createInitialMarket(): MarketInstrument[] {
  return INSTRUMENT_SEEDS.map((seed) => ({
    symbol: seed.symbol,
    name: seed.name,
    assetClass: seed.assetClass,
    sector: seed.sector,
    basePrice: seed.basePrice,
    price: seed.basePrice,
    previousClose: seed.basePrice,
    volatility: seed.volatility,
    driftAnnual: seed.driftAnnual,
    history: [{ dayIndex: 0, price: seed.basePrice }],
  }));
}

/** One trading day of geometric-Brownian-ish movement, nudged by the broader economic condition. */
export function driftMarketDaily(market: MarketInstrument[], economy: EconomyState, dayIndex: number, rng: () => number): MarketInstrument[] {
  const economyDrift = economy.condition === 'recession' ? -0.0006
    : economy.condition === 'slow_growth' ? -0.0001
    : economy.condition === 'strong_growth' ? 0.0003
    : economy.condition === 'boom' ? 0.0006
    : 0;

  return market.map((instrument) => {
    const dailyDrift = instrument.driftAnnual / 252 + economyDrift;
    const shock = randRange(rng, -1, 1) * instrument.volatility;
    const changePct = dailyDrift + shock;
    const nextPrice = Math.max(0.01, instrument.price * (1 + changePct));
    const history = [...instrument.history, { dayIndex, price: nextPrice }].slice(-MARKET_HISTORY_MAX_DAYS);

    return { ...instrument, previousClose: instrument.price, price: nextPrice, history };
  });
}

export function calculatePortfolioValue(investments: InvestmentState, market: MarketInstrument[]): number {
  return investments.holdings.reduce((sum, h) => {
    const instrument = market.find((m) => m.symbol === h.symbol);
    return sum + (instrument ? instrument.price * h.shares : 0);
  }, 0);
}

export function calculateHoldingGain(holding: Holding, market: MarketInstrument[]): { value: number; gain: number; gainPct: number } {
  const instrument = market.find((m) => m.symbol === holding.symbol);
  const price = instrument?.price ?? holding.avgCost;
  const value = price * holding.shares;
  const costBasis = holding.avgCost * holding.shares;
  const gain = value - costBasis;
  const gainPct = costBasis > 0 ? (gain / costBasis) * 100 : 0;
  return { value, gain, gainPct };
}

export function buyShares(holdings: Holding[], symbol: string, shares: number, price: number): Holding[] {
  const existing = holdings.find((h) => h.symbol === symbol);
  if (!existing) {
    return [...holdings, { symbol, shares, avgCost: price }];
  }
  const totalShares = existing.shares + shares;
  const totalCost = existing.avgCost * existing.shares + price * shares;
  return holdings.map((h) => (h.symbol === symbol ? { ...h, shares: totalShares, avgCost: totalCost / totalShares } : h));
}

export function sellShares(holdings: Holding[], symbol: string, shares: number): { holdings: Holding[]; soldShares: number } {
  const existing = holdings.find((h) => h.symbol === symbol);
  if (!existing) return { holdings, soldShares: 0 };
  const soldShares = Math.min(existing.shares, shares);
  const remaining = existing.shares - soldShares;
  const nextHoldings = remaining <= 0.0001
    ? holdings.filter((h) => h.symbol !== symbol)
    : holdings.map((h) => (h.symbol === symbol ? { ...h, shares: remaining } : h));
  return { holdings: nextHoldings, soldShares };
}
