// Centralized game balance. Nothing gameplay-numeric should be hardcoded
// outside of this file (or the industry-specific config files it feeds).

export const SAVE_VERSION = 3;
export const GAME_VERSION = 'Pre-Alpha 0.5.0';

/** Game epoch: Monday 5 Jan 2026 (UTC midnight). Time now advances one whole day at a time. */
export const EPOCH_MS = Date.UTC(2026, 0, 5);
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const STARTING_CASH = 4_500;
export const STARTING_AGE = 18;

/** Food & everyday miscellaneous spending — phone/internet/streaming are itemized separately as subscriptions. */
export const DAILY_LIVING_EXPENSE_MIN = 15;
export const DAILY_LIVING_EXPENSE_MAX = 35;

// ---------- Career ----------

export const PROMOTION_EXPERIENCE_THRESHOLD = 100;
export const EXPERIENCE_PER_DAY_WORKED = 0.35; // promotionProgress gained per day employed
export const PERFORMANCE_DRIFT_PER_DAY = 0.4;
export const PROMOTION_REJECTION_BASE_CHANCE = 0.12;

// ---------- Business ----------

export const MIN_BUSINESS_STARTUP_COST = 45_000;
export const RECOMMENDED_BUSINESS_STARTUP_COST = 80_000;

export const BUSINESS_LEVEL_REQUIREMENTS: {
  minRevenue30d: number;
  minProfit30d: number;
  minReputation: number;
  minEmployees: number;
}[] = [
  { minRevenue30d: 0, minProfit30d: 0, minReputation: 0, minEmployees: 0 },
  { minRevenue30d: 150_000, minProfit30d: 25_000, minReputation: 55, minEmployees: 2 },
  { minRevenue30d: 400_000, minProfit30d: 70_000, minReputation: 62, minEmployees: 4 },
  { minRevenue30d: 900_000, minProfit30d: 150_000, minReputation: 68, minEmployees: 8 },
  { minRevenue30d: 2_200_000, minProfit30d: 350_000, minReputation: 74, minEmployees: 16 },
  { minRevenue30d: 5_000_000, minProfit30d: 800_000, minReputation: 80, minEmployees: 30 },
];

export const CUSTOMERS_PER_EMPLOYEE_PER_DAY = 38;
export const BASE_WAIT_TIME_MINUTES = 5.5;
export const FINANCIAL_HISTORY_MAX_DAYS = 120;
export const MAX_REVIEWS_STORED = 40;

export const INGREDIENT_TIER_MULTIPLIER: Record<'budget' | 'standard' | 'premium', { cost: number; quality: number }> = {
  budget: { cost: 0.72, quality: 55 },
  standard: { cost: 1.0, quality: 72 },
  premium: { cost: 1.45, quality: 90 },
};

// ---------- Inventory suppliers ----------
// Which supplier a location restocks from — separate from ingredient quality tier above.
// costMultiplier scales restocking price; consumptionMultiplier models real-world waste/yield
// (a cheap supplier's stock runs out faster for the same sales volume); satisfactionDelta is a
// small, direct reliability/quality signal that nudges customer satisfaction and reputation risk.
export const SUPPLIER_TIER_CONFIG: Record<'budget' | 'standard' | 'premium', { label: string; costMultiplier: number; consumptionMultiplier: number; satisfactionDelta: number }> = {
  budget: { label: 'Budget Supplier', costMultiplier: 0.7, consumptionMultiplier: 1.12, satisfactionDelta: -4 },
  standard: { label: 'Standard Supplier', costMultiplier: 1.0, consumptionMultiplier: 1.0, satisfactionDelta: 0 },
  premium: { label: 'Premium Supplier', costMultiplier: 1.4, consumptionMultiplier: 0.9, satisfactionDelta: 4 },
};

export const REPUTATION_SMOOTHING = 0.12;
export const DAILY_EVENT_CHANCE = 0.018;
export const DAILY_RESIGNATION_BASE_CHANCE = 0.004;

type CampaignTypeKey = 'social_media' | 'search_ads' | 'local_ads' | 'influencer';

export const CAMPAIGN_DEFAULTS: Record<
  CampaignTypeKey,
  { label: string; baseCost: number; durationDays: number; reachMultiplier: number; riskVariance: number }
> = {
  social_media: { label: 'Social Media Campaign', baseCost: 8_000, durationDays: 7, reachMultiplier: 0.22, riskVariance: 0.35 },
  search_ads: { label: 'Search Advertising', baseCost: 14_000, durationDays: 14, reachMultiplier: 0.18, riskVariance: 0.25 },
  local_ads: { label: 'Local Advertising', baseCost: 6_000, durationDays: 10, reachMultiplier: 0.14, riskVariance: 0.2 },
  influencer: { label: 'Influencer Campaign', baseCost: 22_000, durationDays: 5, reachMultiplier: 0.32, riskVariance: 0.55 },
};

// ---------- Bank ----------

export const SAVINGS_INTEREST_RATE_ANNUAL = 0.032;
export const DEFAULT_CREDIT_SCORE = 640;
export const PERSONAL_LOAN_BASE_RATE = 0.115;
export const BUSINESS_LOAN_BASE_RATE = 0.09;
export const AUTO_LOAN_BASE_RATE = 0.07;
export const STUDENT_LOAN_BASE_RATE = 0.055;
export const MAX_LOAN_TERM_MONTHS = 60;
export const MORTGAGE_TERM_MONTHS = 240;

// ---------- Properties ----------

export const MORTGAGE_RATE_ANNUAL = 0.058;
export const MORTGAGE_DOWNPAYMENT_PCT = 0.15;
export const PROPERTY_MAINTENANCE_PCT_OF_VALUE_MONTHLY = 0.003;
export const RENTAL_VACANCY_CHANCE_MONTHLY = 0.08;
export const PROPERTY_APPRECIATION_ANNUAL: Record<'declining' | 'stable' | 'growing' | 'booming', number> = {
  declining: -0.02,
  stable: 0.02,
  growing: 0.045,
  booming: 0.08,
};

// ---------- Vehicles / Boats / Aircraft ----------

export const VEHICLE_DOWNPAYMENT_PCT = 0.2;
export const VEHICLE_LOAN_TERM_MONTHS = 60;
export const VEHICLE_DEPRECIATION_ANNUAL: Record<string, number> = {
  economy: -0.14,
  sedan: -0.13,
  suv: -0.12,
  sports: -0.11,
  super: -0.08,
  hyper: -0.05,
  classic: 0.04,
  luxury: -0.1,
  electric: -0.15,
};
export const MILEAGE_PER_DAY_AVG = 28;

export const BOAT_DEPRECIATION_ANNUAL = -0.08;
export const AIRCRAFT_DEPRECIATION_ANNUAL = -0.07;
export const CONDITION_DECAY_PER_MONTH = 1.2;

// ---------- Education ----------

export const INSTITUTION_TIER_MULTIPLIER: Record<'community' | 'state' | 'elite', { cost: number; prestige: number }> = {
  community: { cost: 0.4, prestige: 0.85 },
  state: { cost: 1.0, prestige: 1.0 },
  elite: { cost: 2.6, prestige: 1.25 },
};
export const SCHOLARSHIP_CHANCE = 0.15;
export const SCHOLARSHIP_DISCOUNT_MIN = 0.3;
export const SCHOLARSHIP_DISCOUNT_MAX = 0.6;

// ---------- Family / relationships ----------

export const DATING_POOL_SIZE = 5;
export const DATE_COST_MIN = 40;
export const DATE_COST_MAX = 220;
export const EXCLUSIVE_RELATIONSHIP_THRESHOLD = 40;
export const RELATIONSHIP_DECAY_PER_MONTH_IGNORED = 3;
export const PARENT_INTERACTION_COOLDOWN_DAYS = 3;
export const CHILD_MONTHLY_COST_BASE = 350;
export const CHILDBIRTH_COST = 8_000;

/** Relationship progression gates — this is what stops the "meet Monday, marry Tuesday" exploit. */
export const SERIOUS_RELATIONSHIP_MIN_DAYS = 30; // exclusive -> serious, automatic once relationship holds up
export const PROPOSAL_MIN_RELATIONSHIP = 75;
export const PROPOSAL_MIN_DAYS_TOGETHER = 90; // measured from exclusiveAt
export const ENGAGEMENT_MIN_DAYS_BEFORE_WEDDING = 14;
export const RING_COST = 12_000;

// ---------- Pregnancy ----------

export const PREGNANCY_DURATION_MIN_DAYS = 256;
export const PREGNANCY_DURATION_MAX_DAYS = 284;
export const CONCEPTION_CHANCE_PER_TRY = 0.35;
export const POSTPARTUM_COOLDOWN_DAYS = 180;

// ---------- Divorce / prenup ----------

export const DIVORCE_LEGAL_FEE = 8_000;
export const DIVORCE_CHILD_SUPPORT_PCT_OF_INCOME = 0.17; // per child, of the higher earner's estimated annual income / 12
export const PRENUP_ASSET_PROTECTION_PCT: Record<'none' | 'standard' | 'strong', number> = {
  none: 0, // 100% of shared growth is split
  standard: 0.5, // half of shared growth protected
  strong: 0.9, // only pre-marriage assets ever at risk
};
/** Small daily chance a struggling marriage (low relationship, long neglect) drifts toward requesting divorce — surfaced as a life event, never silent. */
export const DIVORCE_RISK_DAILY_CHANCE = 0.004;
export const DIVORCE_RISK_RELATIONSHIP_THRESHOLD = 20;

export const WEDDING_TIERS: { id: string; name: string; cost: number; relationshipBonus: number }[] = [
  { id: 'simple', name: 'Simple Wedding', cost: 5_000, relationshipBonus: 6 },
  { id: 'traditional', name: 'Traditional Wedding', cost: 25_000, relationshipBonus: 12 },
  { id: 'luxury', name: 'Luxury Wedding', cost: 100_000, relationshipBonus: 20 },
];

// ---------- Loan underwriting ----------

export const LOAN_REVIEW_DAYS: Record<'personal' | 'auto' | 'mortgage' | 'business' | 'boat' | 'aircraft' | 'student', [number, number]> = {
  personal: [1, 2],
  auto: [1, 2],
  student: [1, 2],
  mortgage: [2, 5],
  business: [2, 5],
  boat: [2, 4],
  aircraft: [2, 5],
};
export const LOAN_APPLICATION_COOLDOWN_DAYS = 3; // per loan kind, prevents spamming applications
export const MAX_DEBT_TO_INCOME_RATIO = 0.43; // above this, denial becomes far more likely
export const MIN_CREDIT_SCORE_PREFERRED = 640;

// ---------- Financial ruin ----------

export const FINANCIAL_RUIN_WARNING_THRESHOLD = -5_000;
export const FINANCIAL_RUIN_CRITICAL_THRESHOLD = -10_000;
export const FINANCIAL_RUIN_THRESHOLD = -15_000;

// ---------- Family mortality (Realistic life-events setting only) ----------

export const MORTALITY_BASE_ANNUAL_CHANCE_BY_AGE: { minAge: number; annualChance: number }[] = [
  { minAge: 0, annualChance: 0.0004 },
  { minAge: 50, annualChance: 0.0012 },
  { minAge: 65, annualChance: 0.006 },
  { minAge: 75, annualChance: 0.018 },
  { minAge: 85, annualChance: 0.05 },
  { minAge: 95, annualChance: 0.14 },
];

// ---------- NPC family finances / gifting ----------

export const NPC_RETIREMENT_NET_WORTH_MULTIPLE = 25; // if new cash covers ~25x annual expenses, retirement becomes likely
export const NPC_WINDFALL_LIFESTYLE_UPGRADE_THRESHOLD = 250_000;

// ---------- Business delegation ----------

export const MANAGER_ROLE_BASE_SALARY: Record<string, number> = {
  location_manager: 48_000,
  regional_manager: 85_000,
  operations_director: 130_000,
  hr_manager: 95_000,
  inventory_manager: 72_000,
  procurement_manager: 78_000,
  warehouse_manager: 68_000,
  cfo: 165_000,
  cmo: 155_000,
  coo: 175_000,
  ceo: 240_000,
};

// Hiring an executive is not just a salary commitment — recruitment, signing, and onboarding
// cost real money upfront. No level gate: if you can afford it (and, for the C-suite, you have
// an HQ with room), you can hire it on day one. The cost scales with seniority, as a % of the
// candidate's actual (randomized) annual salary.
export const MANAGER_HIRING_COST_PCT: Record<string, number> = {
  location_manager: 0.08,
  regional_manager: 0.12,
  hr_manager: 0.12,
  operations_director: 0.15,
  inventory_manager: 0.1,
  procurement_manager: 0.1,
  warehouse_manager: 0.1,
  cfo: 0.18,
  cmo: 0.18,
  coo: 0.18,
  ceo: 0.2,
};

// One-time hiring cost for a rank-and-file employee — small on purpose (recruitment/onboarding
// admin), but enough that hiring dozens of staff instantly with zero cash isn't free.
export const EMPLOYEE_HIRING_COST_BASE = 40;
export const EMPLOYEE_HIRING_COST_PCT_OF_SALARY = 0.004;

// ---------- Management automation ----------

/** Weekly performance-history samples an employee needs before HR will consider auto-firing them — protects against a single bad week costing a job. */
export const HR_AUTO_FIRE_MIN_HISTORY = 4;
export const HR_AUTO_FIRE_PERFORMANCE_THRESHOLD = 35; // average performance below this, sustained, is a firing candidate
export const HR_TRAINING_SKILL_GAIN_PER_SESSION = 3;

// ---------- Headquarters ----------
// No business-level requirement — headquarters are gated by money and space, nothing else.
// The C-suite (CFO/CMO/COO/CEO) can only be hired once one of these exists and has room.

export interface HeadquartersTierDef {
  id: 'small_office' | 'regional_office' | 'corporate_hq';
  name: string;
  capacity: number;
  monthlyRent: number;
  purchasePrice: number;
  monthlyCostWhenOwned: number; // utilities/maintenance/insurance once bought outright
}

export const HEADQUARTERS_TIERS: HeadquartersTierDef[] = [
  { id: 'small_office', name: 'Small Office', capacity: 10, monthlyRent: 3_500, purchasePrice: 650_000, monthlyCostWhenOwned: 900 },
  { id: 'regional_office', name: 'Regional Headquarters', capacity: 40, monthlyRent: 12_000, purchasePrice: 2_200_000, monthlyCostWhenOwned: 3_200 },
  { id: 'corporate_hq', name: 'Corporate Headquarters', capacity: 200, monthlyRent: 32_000, purchasePrice: 4_000_000, monthlyCostWhenOwned: 9_500 },
];

// ---------- Holding companies / acquisitions ----------

/** Real corporate overhead a holding company incurs every month regardless of performance — the cost of having one at all. */
export const HOLDING_COMPANY_BASE_MONTHLY_OVERHEAD = 1_500;
/** Additional overhead per subsidiary beyond the first — coordinating more businesses costs more. */
export const HOLDING_COMPANY_PER_SUBSIDIARY_OVERHEAD = 600;
export const NPC_BUSINESS_POPULATION_PER_INDUSTRY = 4;
export const ACQUISITION_REVIEW_DAYS = 3;
export const ACQUISITION_ACCEPT_CHANCE_AT_ASKING = 0.85;
export const ACQUISITION_MIN_OFFER_PCT = 0.7; // offers below this % of asking are auto-rejected, not countered
export const INCOMING_OFFER_CHANCE_PER_MONTH = 0.05; // per qualifying player business

// ---------- Investments ----------

export const INVESTMENT_STARTING_CASH_NOTE_PCT = 0; // holdings funded from player.cash directly
export const MARKET_HISTORY_MAX_DAYS = 90;

// ---------- Economy ----------

export const ECONOMY_CONDITION_BASE_DRIFT: Record<string, number> = {
  recession: -0.06,
  slow_growth: 0.01,
  normal: 0.04,
  strong_growth: 0.07,
  boom: 0.11,
};
export const ECONOMY_SHIFT_CHANCE_PER_DAY = 0.01;
export const ECONOMY_MIN_DAYS_IN_CONDITION = 45;

// ---------- Currency ----------

export const CURRENCY_SYMBOL = '$';
