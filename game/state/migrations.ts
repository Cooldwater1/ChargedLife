import { ACHIEVEMENT_DEFINITIONS } from '@/game/constants/achievements';
import { DEFAULT_CREDIT_SCORE, HOLDING_COMPANY_BASE_MONTHLY_OVERHEAD, SAVE_VERSION, SAVINGS_INTEREST_RATE_ANNUAL } from '@/game/constants/balance';
import { DEFAULT_SUBSCRIPTION_IDS, SUBSCRIPTION_CATALOG } from '@/game/constants/subscriptions';
import { DEFAULT_FAST_FOOD_MENU } from '@/game/constants/data';
import { createDefaultSchedule } from '@/game/business/schedule';
import { createDefaultLocationInventory } from '@/game/constants/inventory';
import { createInitialEconomy } from '@/game/simulation/economyState';
import { createInitialMarket } from '@/game/simulation/investments';
import { generateNpcBusinessPopulation } from '@/game/simulation/npcBusiness';
import { generateParents } from '@/game/simulation/family';
import { createRng } from '@/lib/random';
import { generateId } from '@/lib/id';
import { randInt } from '@/lib/random';
import { createDefaultBenefits, createDefaultBudgetLimits, DEFAULT_CEO_SETTINGS, DEFAULT_DELEGATION_SETTINGS, DEFAULT_HR_SETTINGS, DEFAULT_LIFESTYLE_STATE, DEFAULT_WELLBEING } from '@/game/types';
import type { GameState, Subscription } from '@/game/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = any;

/**
 * V1 saves used a continuous minutes-based clock, NOK-flavored balance numbers, and none
 * of the life-sim systems (education, family, vehicles, boats, aircraft, luxury, investments,
 * economy). This step preserves cash, career, bank, businesses, properties, and statistics,
 * and fills in every system that existed by the v2 update with sensible defaults. Its output
 * is an intermediate v2-shaped object — always pipe it through migrateV2ToV3 afterward.
 *
 * Achievement unlock timestamps are not preserved (the id set changed too much to map
 * reliably); already-earned achievements simply re-unlock the next time conditions are
 * checked, which happens every day.
 */
export function migrateV1ToV2(old: Loose): Loose {
  const oldTotalMinutes: number = old?.time?.totalMinutes ?? 0;
  const dayIndex = Math.floor(oldTotalMinutes / 1440);
  const toDayIndex = (minutes: number | null | undefined) => (typeof minutes === 'number' ? Math.floor(minutes / 1440) : 0);

  const oldPlayer = old?.player ?? {};
  const rng = createRng(Math.floor(Math.random() * 1_000_000));
  const lastName = typeof oldPlayer.name === 'string' && oldPlayer.name.includes(' ')
    ? oldPlayer.name.trim().split(/\s+/).pop()
    : 'Anderson';

  const migratedProperties = Array.isArray(oldPlayer.properties)
    ? oldPlayer.properties.map((p: Record<string, unknown>) => ({
        id: p.id,
        type: p.type ?? 'house',
        name: p.name ?? 'Property',
        city: p.city ?? 'Austin',
        purchasePrice: p.purchasePrice ?? 0,
        currentValue: p.currentValue ?? p.purchasePrice ?? 0,
        mortgageBalance: p.mortgageBalance ?? 0,
        monthlyMortgagePayment: p.monthlyMortgagePayment ?? 0,
        monthlyMaintenance: p.monthlyMaintenance ?? 0,
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1_800,
        luxuryRating: 2,
        use: p.isRental ? 'rental' : 'primary',
        monthlyRent: p.monthlyRent ?? 0,
        purchasedAt: toDayIndex(p.purchasedAt as number),
      }))
    : [];

  const migratedPersonalLoans = Array.isArray(oldPlayer?.bank?.loans)
    ? oldPlayer.bank.loans.map((l: Record<string, unknown>) => ({ ...l, kind: l.kind ?? 'personal', takenAt: toDayIndex(l.takenAt as number) }))
    : [];

  const migratedBusinesses = Array.isArray(old?.businesses)
    ? old.businesses.map((b: Record<string, unknown>) => ({
        ...b,
        foundedAt: toDayIndex(b.foundedAt as number),
        locations: Array.isArray(b.locations)
          ? (b.locations as Record<string, unknown>[]).map((l) => ({ ...l, foundedAt: toDayIndex(l.foundedAt as number) }))
          : [],
        employees: Array.isArray(b.employees)
          ? (b.employees as Record<string, unknown>[]).map((e) => ({ ...e, hiredAt: toDayIndex(e.hiredAt as number) }))
          : [],
        marketingCampaigns: Array.isArray(b.marketingCampaigns)
          ? (b.marketingCampaigns as Record<string, unknown>[]).map((c) => ({ ...c, startedAt: toDayIndex(c.startedAt as number) }))
          : [],
        activeEvents: Array.isArray(b.activeEvents)
          ? (b.activeEvents as Record<string, unknown>[]).map((e) => ({ ...e, triggeredAt: toDayIndex(e.triggeredAt as number) }))
          : [],
        reviews: Array.isArray(b.reviews)
          ? (b.reviews as Record<string, unknown>[]).map((r) => ({ ...r, timestamp: toDayIndex(r.timestamp as number) }))
          : [],
        loans: Array.isArray(b.loans)
          ? (b.loans as Record<string, unknown>[]).map((l) => ({ ...l, kind: l.kind ?? 'business', takenAt: toDayIndex(l.takenAt as number) }))
          : [],
      }))
    : [];

  const migratedTransactions = Array.isArray(old?.transactions)
    ? old.transactions.map((t: Record<string, unknown>) => ({ ...t, timestamp: toDayIndex(t.timestamp as number) }))
    : [];

  const migratedNotifications = Array.isArray(old?.notifications)
    ? old.notifications.map((n: Record<string, unknown>) => ({ ...n, timestamp: toDayIndex(n.timestamp as number) }))
    : [];

  return {
    saveVersion: 2,
    time: { dayIndex },
    player: {
      id: oldPlayer.id ?? generateId('player'),
      name: oldPlayer.name ?? 'Player',
      age: oldPlayer.age ?? 22,
      city: 'Austin',
      createdAt: 0,
      cash: oldPlayer.cash ?? 0,
      career: {
        // v1 job ids don't exist in the new career-ladder taxonomy, so the player
        // returns to the job market rather than holding a dangling reference.
        jobId: null,
        hiredAt: null,
        experienceYears: oldPlayer.career?.experienceYears ?? 0,
        industryExperience: {},
        promotionProgress: oldPlayer.career?.promotionProgress ?? 0,
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
        savingsBalance: oldPlayer.bank?.savingsBalance ?? 0,
        savingsInterestRateAnnual: SAVINGS_INTEREST_RATE_ANNUAL,
        creditScore: oldPlayer.bank?.creditScore ?? DEFAULT_CREDIT_SCORE,
        loans: migratedPersonalLoans,
      },
      properties: migratedProperties,
      vehicles: [],
      boats: [],
      aircraft: [],
      luxuryItems: [],
      investments: { holdings: [], realizedGains: 0 },
      family: generateParents(rng, lastName || 'Anderson', oldPlayer.age ?? 22),
      relationship: { status: 'single', partnerId: null, candidates: [], marriedAt: null, engagedAt: null },
      statistics: {
        totalMoneyEarned: oldPlayer.statistics?.totalMoneyEarned ?? 0,
        totalMoneySpent: oldPlayer.statistics?.totalMoneySpent ?? 0,
        highestNetWorth: oldPlayer.statistics?.highestNetWorth ?? oldPlayer.cash ?? 0,
        businessesStarted: oldPlayer.statistics?.businessesStarted ?? 0,
        businessesSold: oldPlayer.statistics?.businessesSold ?? 0,
        employeesHired: oldPlayer.statistics?.employeesHired ?? 0,
        employeesFired: oldPlayer.statistics?.employeesFired ?? 0,
        customersServed: oldPlayer.statistics?.customersServed ?? 0,
        marketingSpend: oldPlayer.statistics?.marketingSpend ?? 0,
        loansTaken: oldPlayer.statistics?.loansTaken ?? 0,
        propertiesPurchased: oldPlayer.statistics?.propertiesPurchased ?? 0,
        daysPlayed: oldPlayer.statistics?.daysPlayed ?? 0,
        degreesEarned: 0,
        jobsHeld: oldPlayer.career?.jobId ? 1 : 0,
        promotions: 0,
        datesBeenOn: 0,
        yearsMarried: 0,
        vehiclesPurchased: 0,
        boatsPurchased: 0,
        aircraftPurchased: 0,
        luxuryPurchased: 0,
        investmentProfit: 0,
      },
      achievements: ACHIEVEMENT_DEFINITIONS.map((a) => ({ id: a.id, unlockedAt: null })),
      settings: {
        animationsEnabled: oldPlayer.settings?.animationsEnabled ?? true,
        numberFormat: oldPlayer.settings?.numberFormat ?? 'full',
        notificationsEnabled: oldPlayer.settings?.notificationsEnabled ?? true,
        daySummaryMode: 'important_only',
      },
      lifeEvents: [],
      timeline: [
        { id: generateId('timeline'), age: oldPlayer.age ?? 22, timestamp: dayIndex, title: 'A New Chapter', description: 'ChargedLife has evolved — your journey continues.' },
      ],
    },
    businesses: migratedBusinesses,
    transactions: migratedTransactions,
    notifications: [
      ...migratedNotifications,
      {
        id: generateId('notif'), timestamp: dayIndex, title: 'ChargedLife Has Been Upgraded',
        message: 'Your save was carried forward into the new life-simulation update. Explore Education, Family, Vehicles, and more from the sidebar.',
        severity: 'info', read: false,
      },
    ],
    market: createInitialMarket(),
    economy: createInitialEconomy(),
    lastSavedAt: Date.now(),
  };
}

/**
 * V2 saves (Pre-Alpha 0.2.0) predate: pregnancy, loan underwriting, financial ruin, divorce,
 * business delegation/managers, holding companies, NPC businesses/acquisitions, the
 * generational family tree, NPC memory/finances, subscriptions, and the weekly business-hours
 * schedule. This step adds all of it with safe defaults — nothing from the v2 save is dropped.
 */
export function migrateV2ToV3(old: Loose): GameState {
  const dayIndex: number = old?.time?.dayIndex ?? 0;
  const oldPlayer = old?.player ?? {};
  const rng = createRng(Math.floor(Math.random() * 1_000_000));

  const migratedFamily = Array.isArray(oldPlayer.family)
    ? oldPlayer.family.map((f: Record<string, unknown>) => ({
        id: f.id ?? generateId('family'),
        role: f.role ?? 'partner',
        name: f.name ?? 'Family Member',
        age: f.age ?? 40,
        occupation: f.occupation ?? 'Professional',
        employmentStatus: f.retired ? 'retired' : 'employed',
        relationship: f.relationship ?? 60,
        traits: Array.isArray(f.traits) ? f.traits : f.personality ? [f.personality] : ['kind'],
        bornAt: f.bornAt,
        retired: f.retired ?? false,
        lastInteractionAt: f.lastInteractionAt,
        cash: 10_000,
        annualIncome: 50_000,
        city: oldPlayer.city ?? 'Austin',
        homeDescription: 'Comfortable home',
        vehicleDescription: 'Reliable vehicle',
        parentIds: [],
        partnerNpcId: null,
        childrenIds: [],
        memory: [],
        deceased: false,
        deceasedAt: null,
      }))
    : [];

  const oldRelationship = oldPlayer.relationship ?? { status: 'single', partnerId: null, candidates: [], marriedAt: null, engagedAt: null };
  const migratedRelationship = {
    status: oldRelationship.status ?? 'single',
    partnerId: oldRelationship.partnerId ?? null,
    candidates: oldRelationship.candidates ?? [],
    exclusiveAt: oldRelationship.status && oldRelationship.status !== 'single' ? (oldRelationship.engagedAt ?? dayIndex) : null,
    seriousAt: null,
    engagedAt: oldRelationship.engagedAt ?? null,
    marriedAt: oldRelationship.marriedAt ?? null,
    prenup: null,
  };

  const migratedBusinesses = Array.isArray(old?.businesses)
    ? old.businesses.map((b: Record<string, unknown>) => ({
        ...b,
        managers: [],
        delegation: { ...DEFAULT_DELEGATION_SETTINGS },
        ownershipPct: 100,
        holdingCompanyId: null,
        locations: Array.isArray(b.locations)
          ? (b.locations as Record<string, unknown>[]).map((l) => ({
              ...l,
              weeklySchedule: createDefaultSchedule((l.openingHour as number) ?? 8, (l.closingHour as number) ?? 22),
            }))
          : [],
      }))
    : [];

  const subscriptions: Subscription[] = SUBSCRIPTION_CATALOG.map((entry) => ({
    id: generateId('subscription'), name: entry.name, category: entry.category, monthlyCost: entry.monthlyCost,
    active: DEFAULT_SUBSCRIPTION_IDS.includes(entry.id),
  }));

  return {
    saveVersion: SAVE_VERSION,
    time: { dayIndex },
    player: {
      ...oldPlayer,
      family: migratedFamily,
      relationship: migratedRelationship,
      pregnancy: null,
      lastChildBornAt: null,
      loanApplications: [],
      subscriptions,
      holdingCompanies: [],
      acquisitionOffers: [],
      incomingBusinessOffers: [],
      statistics: {
        ...oldPlayer.statistics,
        childrenBorn: (oldPlayer.family ?? []).filter((f: Record<string, unknown>) => f.role === 'child').length,
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
      settings: {
        ...oldPlayer.settings,
        lifeEventsDifficulty: 'relaxed',
      },
    },
    businesses: migratedBusinesses,
    npcBusinesses: generateNpcBusinessPopulation(rng, dayIndex),
    transactions: old?.transactions ?? [],
    notifications: [
      ...(old?.notifications ?? []),
      {
        id: generateId('notif'), timestamp: dayIndex, title: 'ChargedLife Simulation Update',
        message: 'Family members are now persistent people with their own lives — visit Family to meet your grandparents. Loans now go through underwriting, and business hours use a full weekly schedule.',
        severity: 'info', read: false,
      },
    ],
    market: old?.market ?? createInitialMarket(),
    economy: old?.economy ?? createInitialEconomy(),
    gameOver: { isOver: false, reason: null, triggeredAt: null },
    lastSavedAt: Date.now(),
  };
}

/**
 * A save's `saveVersion` only bumps at big schema milestones, but individual fields have
 * sometimes been added to the "current" version's shape afterward without a version bump.
 * A save persisted just before such an addition would otherwise load with that field
 * `undefined` and crash the first time it's read (e.g. `game.gameOver.isOver`). This pass
 * runs on every load — including saves that already match SAVE_VERSION — and ONLY fills in
 * fields that are genuinely missing. It never touches a field that already has a value, so
 * real player progress (family cash, relationship stage, business state, etc.) is untouched.
 */
export function ensureGameStateShape(game: Loose): GameState {
  const dayIndex: number = game?.time?.dayIndex ?? 0;
  const rng = createRng(Math.floor(Math.random() * 1_000_000));

  const player = game.player ?? {};
  const relationship = player.relationship ?? { status: 'single', partnerId: null, candidates: [] };
  const family = Array.isArray(player.family)
    ? player.family.map((f: Loose) => {
        const member = {
          parentIds: [], partnerNpcId: null, childrenIds: [], memory: [], deceased: false, deceasedAt: null,
          cash: 10_000, annualIncome: 50_000, city: player.city ?? 'Austin',
          homeDescription: 'Comfortable home', vehicleDescription: 'Reliable vehicle',
          ...f,
        };
        if (typeof member.debt !== 'number') {
          // Old saves predate NPC debt — roll it once here so "Pay Off Debt" has real data to act on.
          member.debt = member.role === 'child' || rng() >= 0.4 ? 0 : randInt(rng, 2_000, Math.max(3_000, Math.round(member.annualIncome * 0.35)));
        }
        return member;
      })
    : [];

  return {
    ...game,
    gameOver: game.gameOver ?? { isOver: false, reason: null, triggeredAt: null },
    npcBusinesses: Array.isArray(game.npcBusinesses) ? game.npcBusinesses : generateNpcBusinessPopulation(rng, dayIndex),
    businesses: Array.isArray(game.businesses)
      ? game.businesses.map((b: Loose) => ({
          delegation: { ...DEFAULT_DELEGATION_SETTINGS },
          ownershipPct: 100, holdingCompanyId: null, dividendPolicyPct: 0, allocatedCapitalBudget: 0, headquarters: null,
          companyVehicles: [], companyPhones: [], budgetLimits: createDefaultBudgetLimits(),
          warehouses: [], activeMarketTrends: [], activeSupplierEvents: [], wasteLog: [],
          ...b,
          ceoSettings: { ...DEFAULT_CEO_SETTINGS, ...b.ceoSettings },
          hrSettings: { ...DEFAULT_HR_SETTINGS, ...b.hrSettings },
          managementLog: Array.isArray(b.managementLog) ? b.managementLog : [],
          employees: Array.isArray(b.employees) ? b.employees.map((e: Loose) => ({ benefits: createDefaultBenefits(), ...e })) : [],
          managers: Array.isArray(b.managers) ? b.managers.map((m: Loose) => ({ benefits: createDefaultBenefits(), ...m })) : [],
          menu: Array.isArray(b.menu)
            ? b.menu.map((item: Loose) => ({ recipe: DEFAULT_FAST_FOOD_MENU.find((d) => d.name === item.name)?.recipe ?? [], ...item }))
            : b.menu,
          locations: Array.isArray(b.locations)
            ? b.locations.map((l: Loose) => ({
                weeklySchedule: createDefaultSchedule(l.openingHour ?? 8, l.closingHour ?? 22),
                supplierTier: 'standard',
                inventory: createDefaultLocationInventory(),
                ...l,
              }))
            : [],
        }))
      : [],
    player: {
      ...player,
      loanApplications: player.loanApplications ?? [],
      subscriptions: Array.isArray(player.subscriptions) && player.subscriptions.length > 0
        ? player.subscriptions
        : SUBSCRIPTION_CATALOG.map((entry) => ({
            id: generateId('subscription'), name: entry.name, category: entry.category, monthlyCost: entry.monthlyCost,
            active: DEFAULT_SUBSCRIPTION_IDS.includes(entry.id),
          })),
      lifestyle: { ...DEFAULT_LIFESTYLE_STATE, ...player.lifestyle },
      wellbeing: { ...DEFAULT_WELLBEING, ...player.wellbeing },
      currentRental: player.currentRental ?? null,
      pregnancy: player.pregnancy ?? null,
      lastChildBornAt: player.lastChildBornAt ?? null,
      holdingCompanies: Array.isArray(player.holdingCompanies)
        ? player.holdingCompanies.map((h: Loose) => ({ monthlyAdminOverhead: HOLDING_COMPANY_BASE_MONTHLY_OVERHEAD, ...h }))
        : [],
      acquisitionOffers: player.acquisitionOffers ?? [],
      incomingBusinessOffers: player.incomingBusinessOffers ?? [],
      family,
      relationship: {
        status: 'single', partnerId: null, candidates: [], exclusiveAt: null, seriousAt: null, engagedAt: null, marriedAt: null, prenup: null,
        ...relationship,
      },
      settings: {
        animationsEnabled: true, numberFormat: 'full', notificationsEnabled: true, daySummaryMode: 'important_only', lifeEventsDifficulty: 'relaxed',
        ...player.settings,
      },
      statistics: {
        ...player.statistics,
        assetsGifted: player.statistics?.assetsGifted ?? 0,
        charityDonated: player.statistics?.charityDonated ?? 0,
      },
    },
  } as GameState;
}

export function migrateSave(persisted: Loose, fromVersion: number): GameState {
  let working = persisted;
  if (fromVersion <= 1) {
    working = migrateV1ToV2(working);
  }
  return ensureGameStateShape(migrateV2ToV3(working));
}
