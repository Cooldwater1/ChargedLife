import { NPC_BUSINESS_NAME_PREFIXES, NPC_BUSINESS_NAME_SUFFIXES } from '@/game/constants/npcBusiness';
import { CITY_DEFINITIONS, EMPLOYEE_ROLES } from '@/game/constants/data';
import {
  ACQUISITION_ACCEPT_CHANCE_AT_ASKING, ACQUISITION_MIN_OFFER_PCT, BUSINESS_LEVEL_REQUIREMENTS,
  NPC_BUSINESS_POPULATION_PER_INDUSTRY, RECOMMENDED_BUSINESS_STARTUP_COST,
} from '@/game/constants/balance';
import { calculateBusinessValuation } from '@/game/simulation/economy';
import { createDefaultMenu, createFastFoodLocation } from '@/game/business/fastfood';
import { candidateToEmployee, generateCandidatePool } from '@/game/simulation/employees';
import { generateId } from '@/lib/id';
import { clamp, pickOne, randInt, randRange } from '@/lib/random';
import { createDefaultBudgetLimits, DEFAULT_CEO_SETTINGS, DEFAULT_DELEGATION_SETTINGS, DEFAULT_HR_SETTINGS } from '@/game/types';
import type { Business, DailyBusinessRecord, Employee, IncomingBusinessOffer, IncomingBuyerType, IndustryId, Loan, NPCBusiness } from '@/game/types';

const GROWTH_DRIFT: Record<NPCBusiness['growthStyle'], { revenueDrift: number; volatility: number }> = {
  aggressive: { revenueDrift: 0.03, volatility: 0.08 },
  steady: { revenueDrift: 0.008, volatility: 0.04 },
  declining: { revenueDrift: -0.015, volatility: 0.05 },
  struggling: { revenueDrift: -0.035, volatility: 0.07 },
};

function generateSingleNpcBusiness(rng: () => number, industry: IndustryId, city: string, dayIndex: number): NPCBusiness {
  const name = `${pickOne(rng, NPC_BUSINESS_NAME_PREFIXES)} ${pickOne(rng, NPC_BUSINESS_NAME_SUFFIXES)}`;
  const growthStyle = pickOne(rng, ['aggressive', 'steady', 'steady', 'declining'] as NPCBusiness['growthStyle'][]);
  const monthlyRevenue = randInt(rng, 25_000, 220_000);
  const marginPct = randRange(rng, 0.04, 0.22);
  const monthlyProfit = Math.round(monthlyRevenue * marginPct);
  const forSale = rng() < 0.35;

  return {
    id: generateId('npcbiz'),
    name,
    industry,
    city,
    monthlyRevenue,
    monthlyProfit,
    debt: Math.round(monthlyRevenue * randRange(rng, 0, 2.5)),
    employees: randInt(rng, 3, 40),
    locations: randInt(rng, 1, 3),
    reputation: randInt(rng, 35, 85),
    growthStyle,
    marketShare: 0, // computed on demand relative to the segment
    forSale,
    askingPrice: Math.round(monthlyProfit * 12 * randRange(rng, 2.5, 4.5) + monthlyRevenue * 0.5),
    valuation: 0,
    foundedAt: dayIndex - randInt(rng, 100, 2000),
    history: [{ dayIndex, revenue: monthlyRevenue, profit: monthlyProfit }],
    failed: false,
  };
}

export function generateNpcBusinessPopulation(rng: () => number, dayIndex: number): NPCBusiness[] {
  const industries: IndustryId[] = ['fast_food'];
  const cities = CITY_DEFINITIONS.map((c) => c.city);
  const businesses: NPCBusiness[] = [];

  for (const industry of industries) {
    for (let i = 0; i < NPC_BUSINESS_POPULATION_PER_INDUSTRY; i++) {
      const city = pickOne(rng, cities);
      businesses.push(generateSingleNpcBusiness(rng, industry, city, dayIndex));
    }
  }

  return businesses;
}

/** One abstracted month of NPC-business life — growth/shrink/list-for-sale/fail. Deliberately lighter than the player's daily simulation. */
export function driftNpcBusinessMonthly(npc: NPCBusiness, rng: () => number, dayIndex: number): NPCBusiness {
  if (npc.failed) return npc;

  const { revenueDrift, volatility } = GROWTH_DRIFT[npc.growthStyle];
  const shock = randRange(rng, -volatility, volatility);
  const nextRevenue = Math.max(0, Math.round(npc.monthlyRevenue * (1 + revenueDrift + shock)));
  const marginShift = randRange(rng, -0.02, 0.02);
  const impliedMargin = npc.monthlyRevenue > 0 ? clamp(npc.monthlyProfit / npc.monthlyRevenue + marginShift, -0.15, 0.28) : 0;
  const nextProfit = Math.round(nextRevenue * impliedMargin);

  const reputation = clamp(npc.reputation + randRange(rng, -3, 3), 5, 98);
  let employees = npc.employees;
  let locations = npc.locations;
  let debt = npc.debt;
  let forSale = npc.forSale;
  let failed = false;

  if (nextProfit < 0) {
    debt += Math.abs(nextProfit);
  } else {
    debt = Math.max(0, debt - Math.round(nextProfit * 0.3));
  }

  if (npc.growthStyle === 'aggressive' && rng() < 0.04 && nextRevenue > npc.monthlyRevenue * 1.1) {
    locations += 1;
    employees += randInt(rng, 4, 12);
  }
  if ((npc.growthStyle === 'declining' || npc.growthStyle === 'struggling') && rng() < 0.05 && locations > 1) {
    locations -= 1;
    employees = Math.max(1, employees - randInt(rng, 3, 8));
  }

  if (debt > nextRevenue * 6 && !forSale && rng() < 0.3) {
    forSale = true;
  } else if (!forSale && rng() < 0.02) {
    forSale = true; // owner occasionally lists a healthy business voluntarily (retirement, moving on)
  }
  if (debt > nextRevenue * 10 || (nextRevenue < 5_000 && locations <= 1 && rng() < 0.4)) {
    failed = true;
  }

  const history = [...npc.history, { dayIndex, revenue: nextRevenue, profit: nextProfit }].slice(-24);
  const valuation = Math.max(0, Math.round(nextProfit * 12 * 3 + nextRevenue * 0.4 - debt));
  const askingPrice = forSale ? Math.round(valuation * randRange(rng, 0.9, 1.15)) : npc.askingPrice;

  return {
    ...npc,
    monthlyRevenue: nextRevenue,
    monthlyProfit: nextProfit,
    reputation,
    employees,
    locations,
    debt,
    forSale,
    failed,
    valuation,
    askingPrice,
    history,
  };
}

export interface MarketShareEntry {
  name: string;
  sharePct: number;
  isPlayer: boolean;
}

export function calculateMarketShare(playerBusinesses: Business[], npcBusinesses: NPCBusiness[], city: string): MarketShareEntry[] {
  const playerRevenue = playerBusinesses
    .flatMap((b) => b.locations.filter((l) => l.city === city).map(() => b))
    .reduce((sum, b) => {
      const last30 = b.financialHistory.slice(-30);
      return sum + last30.reduce((s, d) => s + d.revenue, 0);
    }, 0);

  const npcInCity = npcBusinesses.filter((n) => n.city === city && !n.failed);
  const npcRevenue = npcInCity.reduce((sum, n) => sum + n.monthlyRevenue, 0);
  const totalRevenue = playerRevenue + npcRevenue;
  if (totalRevenue <= 0) return [];

  const entries: MarketShareEntry[] = [];
  if (playerRevenue > 0) entries.push({ name: 'You', sharePct: Math.round((playerRevenue / totalRevenue) * 1000) / 10, isPlayer: true });
  for (const npc of npcInCity) {
    entries.push({ name: npc.name, sharePct: Math.round((npc.monthlyRevenue / totalRevenue) * 1000) / 10, isPlayer: false });
  }

  return entries.sort((a, b) => b.sharePct - a.sharePct);
}

export function evaluateAcquisitionOffer(npc: NPCBusiness, offerAmount: number, rng: () => number): { accepted: boolean; counterAmount: number | null } {
  const offerPct = npc.askingPrice > 0 ? offerAmount / npc.askingPrice : 1;

  if (offerPct < ACQUISITION_MIN_OFFER_PCT) {
    return { accepted: false, counterAmount: null };
  }
  if (offerPct >= 1) {
    return { accepted: rng() < ACQUISITION_ACCEPT_CHANCE_AT_ASKING || offerPct >= 1.1, counterAmount: null };
  }

  const acceptChance = ACQUISITION_ACCEPT_CHANCE_AT_ASKING * ((offerPct - ACQUISITION_MIN_OFFER_PCT) / (1 - ACQUISITION_MIN_OFFER_PCT));
  if (rng() < acceptChance) {
    return { accepted: true, counterAmount: null };
  }
  const counterAmount = Math.round(npc.askingPrice * randRange(rng, 0.9, 0.98));
  return { accepted: false, counterAmount };
}

/** Materializes an acquired NPCBusiness into a fully playable Business — locations, staff, financial history, and any assumed debt. */
export function createBusinessFromAcquiredNpc(npc: NPCBusiness, dayIndex: number, rng: () => number): Business {
  const businessId = generateId('business');
  const investmentPerLocation = clamp(RECOMMENDED_BUSINESS_STARTUP_COST * (npc.monthlyRevenue / 90_000), RECOMMENDED_BUSINESS_STARTUP_COST * 0.4, RECOMMENDED_BUSINESS_STARTUP_COST * 3);

  const locations = Array.from({ length: Math.max(1, npc.locations) }, (_, i) =>
    createFastFoodLocation({ businessId, city: npc.city, investment: investmentPerLocation, dayIndex, isFirstLocation: i === 0 }));

  const employees: Employee[] = [];
  const staffCount = Math.max(1, npc.employees);
  for (let i = 0; i < staffCount; i++) {
    const location = locations[i % locations.length];
    const role = i < locations.length ? 'manager' : pickOne(rng, EMPLOYEE_ROLES.filter((r) => r !== 'manager'));
    const [candidate] = generateCandidatePool(rng, role, 1);
    employees.push(candidateToEmployee(candidate, location.id, businessId, dayIndex - randInt(rng, 30, 800)));
  }

  const dailyRevenue = npc.monthlyRevenue / 30;
  const dailyProfit = npc.monthlyProfit / 30;
  const financialHistory: DailyBusinessRecord[] = Array.from({ length: 30 }, (_, i) => {
    const noise = randRange(rng, 0.9, 1.1);
    const revenue = Math.round(dailyRevenue * noise);
    const profit = Math.round(dailyProfit * noise);
    return {
      dayIndex: dayIndex - (29 - i), revenue, expenses: revenue - profit, profit,
      customers: Math.round(revenue / 9), reputation: npc.reputation,
    };
  });

  let level = 1;
  for (let l = 2; l <= BUSINESS_LEVEL_REQUIREMENTS.length; l++) {
    const req = BUSINESS_LEVEL_REQUIREMENTS[l - 1];
    if (npc.monthlyRevenue >= req.minRevenue30d && npc.monthlyProfit >= req.minProfit30d && npc.reputation >= req.minReputation && staffCount >= req.minEmployees) {
      level = l;
    } else break;
  }

  const loans: Loan[] = [];
  if (npc.debt > 0) {
    const rate = 0.09;
    const termMonths = 60;
    loans.push({
      id: generateId('loan'), kind: 'business', owner: `business:${businessId}`, principal: npc.debt, remainingBalance: npc.debt,
      interestRateAnnual: rate, monthlyPayment: Math.round((npc.debt * (rate / 12)) / (1 - Math.pow(1 + rate / 12, -termMonths))),
      termMonths, monthsRemaining: termMonths, takenAt: dayIndex,
    });
  }

  return {
    id: businessId,
    name: npc.name,
    industry: npc.industry,
    level,
    foundedAt: npc.foundedAt,
    reputation: npc.reputation,
    cash: Math.round(npc.monthlyRevenue * 0.3),
    locations,
    employees,
    menu: createDefaultMenu(),
    marketingCampaigns: [],
    financialHistory,
    reviews: [],
    activeEvents: [],
    loans,
    managers: [],
    delegation: { ...DEFAULT_DELEGATION_SETTINGS },
    ceoSettings: { ...DEFAULT_CEO_SETTINGS },
    hrSettings: { ...DEFAULT_HR_SETTINGS },
    managementLog: [],
    ownershipPct: 100,
    holdingCompanyId: null,
    dividendPolicyPct: 0,
    allocatedCapitalBudget: 0,
    companyVehicles: [],
    companyPhones: [],
    headquarters: null,
    budgetLimits: createDefaultBudgetLimits(),
    warehouses: [],
    activeMarketTrends: [],
    activeSupplierEvents: [],
    wasteLog: [],
  };
}

const BUYER_TYPES: IncomingBuyerType[] = ['competitor', 'private_equity', 'entrepreneur', 'holding_company'];
const BUYER_NAMES: Record<IncomingBuyerType, string[]> = {
  competitor: ['Golden Grill Group', 'Metro Eatery Co.'],
  private_equity: ['Cornerstone Capital Partners', 'Ridgeway Equity'],
  entrepreneur: ['a local entrepreneur', 'an independent investor'],
  holding_company: ['Union Holdings', 'Frontier Group'],
};

/** Rolls whether an outside buyer makes an unsolicited offer on a qualifying, profitable player business. */
export function rollIncomingOffer(business: Business, rng: () => number, dayIndex: number): IncomingBusinessOffer | null {
  const recent = business.financialHistory.slice(-30);
  if (recent.length < 30) return null;
  const avgDailyProfit = recent.reduce((s, d) => s + d.profit, 0) / recent.length;
  if (avgDailyProfit <= 0) return null;

  const valuation = calculateBusinessValuation(business);
  const buyerType = pickOne(rng, BUYER_TYPES);
  const offerAmount = Math.round(valuation * randRange(rng, 0.75, 1.05));

  return {
    id: generateId('offer'),
    businessId: business.id,
    buyerName: pickOne(rng, BUYER_NAMES[buyerType]),
    buyerType,
    offerAmount,
    createdAt: dayIndex,
    expiresAt: dayIndex + 14,
    status: 'pending',
  };
}
