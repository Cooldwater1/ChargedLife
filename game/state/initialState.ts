import { ACHIEVEMENT_DEFINITIONS } from '@/game/constants/achievements';
import { DEFAULT_CREDIT_SCORE, SAVE_VERSION, SAVINGS_INTEREST_RATE_ANNUAL, STARTING_AGE, STARTING_CASH } from '@/game/constants/balance';
import { DEFAULT_SUBSCRIPTION_IDS, SUBSCRIPTION_CATALOG } from '@/game/constants/subscriptions';
import { createInitialMarket } from '@/game/simulation/investments';
import { createInitialEconomy } from '@/game/simulation/economyState';
import { generateNpcBusinessPopulation } from '@/game/simulation/npcBusiness';
import { generateParents } from '@/game/simulation/family';
import { createRng } from '@/lib/random';
import { generateId } from '@/lib/id';
import { DEFAULT_LIFESTYLE_STATE, DEFAULT_WELLBEING } from '@/game/types';
import type { GameState, LifeEventsDifficulty, Player, Subscription } from '@/game/types';

export interface NewGameOptions {
  city?: string;
  lifeEventsDifficulty?: LifeEventsDifficulty;
}

function createDefaultSubscriptions(): Subscription[] {
  return SUBSCRIPTION_CATALOG.map((entry) => ({
    id: generateId('subscription'),
    name: entry.name,
    category: entry.category,
    monthlyCost: entry.monthlyCost,
    active: DEFAULT_SUBSCRIPTION_IDS.includes(entry.id),
  }));
}

export function createInitialPlayer(name: string, options: NewGameOptions = {}): Player {
  const rng = createRng(Math.floor(Math.random() * 1_000_000));
  const nameParts = name.trim().split(/\s+/);
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'Anderson';
  const city = options.city ?? 'Austin';

  return {
    id: generateId('player'),
    name,
    age: STARTING_AGE,
    city,
    createdAt: 0,
    cash: STARTING_CASH,
    career: {
      jobId: null,
      hiredAt: null,
      experienceYears: 0,
      industryExperience: {},
      promotionProgress: 0,
      performanceScore: 65,
      salaryOverride: 0,
      lastRaiseRequestAt: null,
    },
    education: {
      completedDegrees: [{ level: 'high_school', field: null, institutionTier: 'state', completedAt: 0 }],
      enrolledProgramId: null,
      institutionTier: null,
      progressDays: 0,
      totalDaysRequired: 0,
      studentLoanId: null,
    },
    bank: {
      savingsBalance: 0,
      savingsInterestRateAnnual: SAVINGS_INTEREST_RATE_ANNUAL,
      creditScore: DEFAULT_CREDIT_SCORE,
      loans: [],
    },
    loanApplications: [],
    subscriptions: createDefaultSubscriptions(),
    lifestyle: { ...DEFAULT_LIFESTYLE_STATE },
    wellbeing: { ...DEFAULT_WELLBEING },
    properties: [],
    currentRental: null,
    vehicles: [],
    boats: [],
    aircraft: [],
    luxuryItems: [],
    investments: { holdings: [], realizedGains: 0 },
    family: generateParents(rng, lastName, STARTING_AGE),
    relationship: { status: 'single', partnerId: null, candidates: [], exclusiveAt: null, seriousAt: null, engagedAt: null, marriedAt: null, prenup: null },
    pregnancy: null,
    lastChildBornAt: null,
    holdingCompanies: [],
    acquisitionOffers: [],
    incomingBusinessOffers: [],
    statistics: {
      totalMoneyEarned: 0,
      totalMoneySpent: 0,
      highestNetWorth: STARTING_CASH,
      businessesStarted: 0,
      businessesSold: 0,
      employeesHired: 0,
      employeesFired: 0,
      customersServed: 0,
      marketingSpend: 0,
      loansTaken: 0,
      propertiesPurchased: 0,
      daysPlayed: 0,
      degreesEarned: 0,
      jobsHeld: 0,
      promotions: 0,
      datesBeenOn: 0,
      yearsMarried: 0,
      vehiclesPurchased: 0,
      boatsPurchased: 0,
      aircraftPurchased: 0,
      luxuryPurchased: 0,
      investmentProfit: 0,
      childrenBorn: 0,
      divorces: 0,
      inheritanceReceived: 0,
      loanApplicationsSubmitted: 0,
      loansApproved: 0,
      loansDenied: 0,
      acquisitionsCompleted: 0,
      npcGiftsGiven: 0,
      assetsGifted: 0,
      charityDonated: 0,
    },
    achievements: ACHIEVEMENT_DEFINITIONS.map((a) => ({ id: a.id, unlockedAt: null })),
    settings: {
      animationsEnabled: true,
      numberFormat: 'full',
      notificationsEnabled: true,
      daySummaryMode: 'important_only',
      lifeEventsDifficulty: options.lifeEventsDifficulty ?? 'relaxed',
    },
    lifeEvents: [],
    timeline: [
      { id: generateId('timeline'), age: STARTING_AGE, timestamp: 0, title: 'A New Beginning', description: `${name} sets out to build a life in ${city}.` },
    ],
  };
}

export function createInitialGameState(name: string, options: NewGameOptions = {}): GameState {
  const rng = createRng(Math.floor(Math.random() * 1_000_000));

  return {
    saveVersion: SAVE_VERSION,
    time: { dayIndex: 0 },
    player: createInitialPlayer(name, options),
    businesses: [],
    npcBusinesses: generateNpcBusinessPopulation(rng, 0),
    transactions: [],
    notifications: [
      {
        id: generateId('notif'),
        timestamp: 0,
        title: `Welcome to ChargedLife, ${name}`,
        message: 'Find a job to start earning, save up, and build the life you want — one day at a time.',
        severity: 'info',
        read: false,
      },
    ],
    market: createInitialMarket(),
    economy: createInitialEconomy(),
    gameOver: { isOver: false, reason: null, triggeredAt: null },
    lastSavedAt: Date.now(),
  };
}
