// Core domain types for ChargedLife.
// These types are the single source of truth for game state shape.
// Avoid `any` — every entity has a stable string `id` (never rely on array index).
//
// TIME UNIT: every `timestamp` / `*At` field in this file stores a whole-day index
// (days since the game epoch), not minutes or milliseconds. The game advances one
// day at a time via the "Next Day" action — there is no continuous clock.

export interface GameTime {
  /** Whole days elapsed since the game epoch (Monday 5 Jan 2026). */
  dayIndex: number;
}

export interface CalendarDate {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  weekday: number; // 0=Sunday..6=Saturday
  dayIndex: number;
}

// ---------- Transactions ----------

export type TransactionCategory =
  | 'salary'
  | 'living_expenses'
  | 'business_investment'
  | 'business_revenue'
  | 'business_payroll'
  | 'business_benefits'
  | 'business_rent'
  | 'business_marketing'
  | 'business_cogs'
  | 'business_inventory'
  | 'business_utilities'
  | 'business_training'
  | 'business_misc'
  | 'business_upgrade'
  | 'business_loan_payment'
  | 'business_owner_draw'
  | 'loan_disbursement'
  | 'loan_payment'
  | 'savings_interest'
  | 'savings_transfer'
  | 'property_purchase'
  | 'property_mortgage'
  | 'property_maintenance'
  | 'property_rent_income'
  | 'education_tuition'
  | 'family_expense'
  | 'family_gift'
  | 'wedding'
  | 'vehicle_purchase'
  | 'vehicle_expense'
  | 'vehicle_sale'
  | 'boat_purchase'
  | 'boat_expense'
  | 'boat_sale'
  | 'aircraft_purchase'
  | 'aircraft_expense'
  | 'aircraft_sale'
  | 'luxury_purchase'
  | 'luxury_sale'
  | 'investment_buy'
  | 'investment_sell'
  | 'achievement_reward'
  | 'relocation'
  | 'other';

export interface Transaction {
  id: string;
  timestamp: number; // dayIndex at time of transaction
  amount: number; // positive = income, negative = expense
  category: TransactionCategory;
  description: string;
  /** 'personal' or `business:<businessId>` */
  source: string;
}

// ---------- Education ----------

export type EducationLevel = 'none' | 'high_school' | 'certification' | 'associate' | 'bachelor' | 'master' | 'doctorate';

export const EDUCATION_LEVEL_RANK: Record<EducationLevel, number> = {
  none: 0,
  high_school: 1,
  certification: 1.5,
  associate: 2,
  bachelor: 3,
  master: 4,
  doctorate: 5,
};

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  none: 'No Education',
  high_school: 'High School Diploma',
  certification: 'Certification',
  associate: "Associate Degree",
  bachelor: "Bachelor's Degree",
  master: "Master's Degree",
  doctorate: 'Doctorate',
};

export type DegreeField =
  | 'business'
  | 'finance'
  | 'marketing'
  | 'computer_science'
  | 'engineering'
  | 'law'
  | 'medicine'
  | 'accounting'
  | 'economics'
  | 'real_estate'
  | 'hospitality'
  | 'design'
  | 'management';

export type InstitutionTier = 'community' | 'state' | 'elite';

export interface EducationProgramDefinition {
  id: string;
  level: EducationLevel;
  field: DegreeField | null;
  name: string;
  durationDays: number;
  baseTuition: number;
}

export interface CompletedDegree {
  level: EducationLevel;
  field: DegreeField | null;
  institutionTier: InstitutionTier;
  completedAt: number;
}

export interface EducationState {
  completedDegrees: CompletedDegree[];
  enrolledProgramId: string | null;
  institutionTier: InstitutionTier | null;
  progressDays: number;
  totalDaysRequired: number;
  studentLoanId: string | null;
}

// ---------- Career ----------

export type IndustryKey = 'retail' | 'marketing' | 'finance' | 'technology';

export interface JobRequirements {
  minEducationLevel: EducationLevel;
  acceptableFields?: DegreeField[];
  minExperienceYears: number;
  minIndustryExperienceYears?: number;
  /** If set, a candidate lacking the education requirement can still qualify with this much experience instead. */
  altMinExperienceYears?: number;
}

export interface JobDefinition {
  id: string;
  title: string;
  company: string;
  industry: IndustryKey;
  tier: number; // position within the industry ladder, 1 = entry
  annualSalary: number;
  requirements: JobRequirements;
  workloadHoursPerWeek: number;
  stress: number; // 0-100
  description: string;
}

export interface CareerState {
  jobId: string | null;
  hiredAt: number | null; // dayIndex
  experienceYears: number;
  industryExperience: Partial<Record<IndustryKey, number>>;
  promotionProgress: number; // 0-100
  performanceScore: number; // 0-100
  salaryOverride: number; // additive bonus on top of the job definition's base salary, from raises
  lastRaiseRequestAt: number | null; // dayIndex, for a cooldown
}

// ---------- Employees ----------

export type EmployeeRole = 'manager' | 'cook' | 'cashier' | 'cleaner';

export type EmployeeTrait =
  | 'hardworking'
  | 'friendly'
  | 'ambitious'
  | 'quick_learner'
  | 'leader'
  | 'reliable'
  | 'lazy'
  | 'difficult';

export interface Employee {
  id: string;
  locationId: string;
  businessId: string;
  name: string;
  age: number;
  role: EmployeeRole;
  salary: number; // annual
  skill: number; // 0-100
  experienceYears: number;
  morale: number; // 0-100
  loyalty: number; // 0-100
  trait: EmployeeTrait;
  hiredAt: number; // dayIndex
  performanceHistory?: number[]; // recent weekly performance snapshots (0-100), most-recent last — used by HR auto-fire so a single bad week never costs someone their job
  benefits: EmployeeBenefits;
}

// ---------- Benefits / company assets ----------

/** Per-person benefits selection. Every flag has a real daily cost and a real mechanical effect — nothing here is cosmetic. */
export interface EmployeeBenefits {
  healthInsurance: boolean;
  mealAllowance: boolean;
  travelAllowance: boolean;
  bonusPlanPct: number; // 0 = no bonus plan, else % of salary paid out as periodic bonus
  trainingBudget: boolean;
  paidVacation: boolean;
  companyCarId: string | null;
  companyPhoneId: string | null;
}

export function createDefaultBenefits(): EmployeeBenefits {
  return {
    healthInsurance: false, mealAllowance: false, travelAllowance: false,
    bonusPlanPct: 0, trainingBudget: false, paidVacation: false,
    companyCarId: null, companyPhoneId: null,
  };
}

export type CompanyVehicleTier = 'economy' | 'standard' | 'executive';

export interface CompanyVehicle {
  id: string;
  businessId: string;
  tier: CompanyVehicleTier;
  name: string;
  purchasePrice: number;
  monthlyCost: number; // insurance + maintenance + fuel, all-in
  assignedToEmployeeId: string | null;
  assignedToManagerId: string | null;
  purchasedAt: number; // dayIndex
}

export type CompanyPhoneTier = 'basic' | 'standard' | 'premium';

export interface CompanyPhone {
  id: string;
  businessId: string;
  tier: CompanyPhoneTier;
  equipmentCost: number;
  monthlyCost: number;
  assignedToEmployeeId: string | null;
  assignedToManagerId: string | null;
  purchasedAt: number; // dayIndex
}

export interface JobCandidate {
  id: string;
  name: string;
  age: number;
  role: EmployeeRole;
  skill: number;
  experienceYears: number;
  expectedSalary: number;
  trait: EmployeeTrait;
}

// ---------- Menu / products ----------

export type IngredientTier = 'budget' | 'standard' | 'premium';

export interface MenuItem {
  id: string;
  name: string;
  baseCost: number;
  cost: number;
  price: number;
  quality: number; // 0-100
  ingredientTier: IngredientTier;
  popularity: number; // 0-100
  active: boolean;
  /** Real ingredients consumed per unit sold — this is what the inventory system actually depletes. */
  recipe: RecipeRequirement[];
}

// ---------- Inventory (named ingredients, suppliers, warehouses, market trends) ----------

export interface RecipeRequirement {
  ingredientId: string;
  quantity: number; // units of the ingredient consumed per item sold
}

export interface IngredientDefinition {
  id: string;
  name: string;
  unit: string;
  basePricePerUnit: number;
  shelfLifeDays: number;
}

export type SupplierId = string;

export interface SupplierDefinition {
  id: SupplierId;
  name: string;
  tier: SupplierTier;
  priceMultiplier: number;
  reliability: number; // 0-100 — chance a normal delivery arrives exactly on time
  volumeDiscountThreshold: number; // order quantity (units) at which a volume discount kicks in
  volumeDiscountPct: number;
}

export type InventoryAutomationLevel = 'manual' | 'assisted' | 'automatic';

export interface PendingDelivery {
  id: string;
  ingredientId: string;
  quantity: number;
  cost: number;
  arrivesAtDayIndex: number;
  isEmergency: boolean;
}

export interface RecurringOrder {
  id: string;
  ingredientId: string;
  quantity: number;
  orderWeekday: number; // 0 = Sunday ... 6 = Saturday, day the order is PLACED
  leadTimeDays: number; // days from order to delivery
  supplierId: SupplierId;
  active: boolean; // paused or running
  lastPlacedAt: number | null;
}

export interface LocationInventory {
  stocks: Record<string, number>; // ingredientId -> quantity on hand
  avgDailyUsage: Record<string, number>; // ingredientId -> rolling average consumption
  pendingDeliveries: PendingDelivery[];
  recurringOrders: RecurringOrder[];
  primarySupplierId: SupplierId;
  automationLevel: InventoryAutomationLevel;
  weeklyPurchasingBudget: number; // used by assisted/automatic
  emergencyDeliveryAllowed: boolean; // used by assisted/automatic
  maxEmergencyPremiumPct: number; // used by assisted/automatic
  minStockTargetDays: number;
}

export type WarehouseTier = 'small' | 'regional' | 'distribution_center';

export interface Warehouse {
  id: string;
  businessId: string;
  tier: WarehouseTier;
  capacity: number; // extra storage units, on top of each location's base 5,000
  monthlyCost: number;
  purchasedAt: number;
}

export interface MarketTrend {
  id: string;
  name: string;
  description: string;
  affectedMenuItemNames: string[]; // matches MenuItem.name — which products see the demand shift
  demandMultiplier: number; // e.g. 1.32 = +32% demand
  startedAt: number;
  durationDays: number;
}

export interface SupplierMarketEvent {
  id: string;
  supplierId: SupplierId;
  name: string;
  description: string;
  priceMultiplierDelta: number; // added to the supplier's effective price multiplier while active
  startedAt: number;
  durationDays: number;
}

export interface WasteLogEntry {
  id: string;
  timestamp: number;
  amountWasted: number; // dollar value
  ingredientId: string;
  reason: string; // human-readable root cause
}

// ---------- Marketing ----------

export type CampaignType = 'social_media' | 'search_ads' | 'local_ads' | 'influencer';

export interface MarketingCampaign {
  id: string;
  businessId: string;
  locationId: string | 'all';
  type: CampaignType;
  cost: number;
  startedAt: number; // dayIndex
  durationDays: number;
  status: 'active' | 'completed';
  customersGained: number;
  revenueAttributed: number;
  effectivenessMultiplier: number;
}

// ---------- Upgrades ----------

export interface UpgradeDefinition {
  id: string;
  name: string;
  description: string;
  cost: number;
  /** Other upgrade ids (at this same location) that must already be owned — an infrastructure prerequisite, not a level gate. */
  requiresUpgradeIds: string[];
  effects: {
    capacityPct?: number;
    serviceSpeedPct?: number;
    qualityPct?: number;
    workloadPct?: number;
    reputationFlat?: number;
  };
}

// ---------- Business events ----------

export interface EventChoice {
  id: string;
  label: string;
  cost: number;
  description: string;
  effects: {
    reputationFlat?: number;
    capacityPctTemp?: number;
    cashFlat?: number;
  };
}

export interface BusinessEvent {
  id: string;
  businessId: string;
  locationId: string | null;
  title: string;
  description: string;
  triggeredAt: number;
  choices: EventChoice[];
  resolved: boolean;
}

// ---------- Reviews ----------

export interface Review {
  id: string;
  businessId: string;
  locationId: string;
  rating: number; // 1-5
  text: string;
  timestamp: number;
}

// ---------- Locations ----------

export interface DailyBusinessRecord {
  dayIndex: number;
  revenue: number;
  expenses: number;
  profit: number;
  customers: number;
  reputation: number;
}

export interface DaySchedule {
  open: boolean;
  openHour: number; // 0-23.5 in 30-minute increments
  closeHour: number; // 0.5-24 in 30-minute increments
}

/** Index 0=Sunday .. 6=Saturday, matching CalendarDate.weekday. */
export type WeeklySchedule = [DaySchedule, DaySchedule, DaySchedule, DaySchedule, DaySchedule, DaySchedule, DaySchedule];

export type SupplierTier = 'budget' | 'standard' | 'premium';

export interface BusinessLocation {
  id: string;
  businessId: string;
  name: string;
  city: string;
  rent: number; // monthly
  baseDemand: number;
  competition: 'low' | 'medium' | 'high';
  marketAvgPrice: number;
  baseCapacity: number;
  weeklySchedule: WeeklySchedule;
  /** Today's effective hours, recomputed from weeklySchedule every daily settlement — read by the demand simulation. */
  openingHour: number;
  closingHour: number;
  inventoryStock: number; // 0-100, derived health readout — driven by `inventory` below
  /** Derived and synced from `inventory.primarySupplierId` each day — not independently settable. */
  supplierTier: SupplierTier;
  inventory: LocationInventory;
  upgrades: string[];
  foundedAt: number;
  lastWaitTimeMinutes: number;
  lastServiceQuality: number;
  lastExpectedCustomers: number;
  lastActualCustomers: number;
}

// ---------- Loans ----------

export type LoanKind = 'personal' | 'auto' | 'mortgage' | 'business' | 'boat' | 'aircraft' | 'student';

export interface Loan {
  id: string;
  kind: LoanKind;
  owner: string; // 'personal' or `business:<id>`
  principal: number;
  remainingBalance: number;
  interestRateAnnual: number;
  monthlyPayment: number;
  termMonths: number;
  monthsRemaining: number;
  takenAt: number;
}

// ---------- Loan applications (underwriting) ----------

export type LoanApplicationStatus = 'under_review' | 'approved' | 'denied' | 'counter_offer' | 'accepted' | 'declined_by_player';

export interface LoanApplication {
  id: string;
  kind: LoanKind;
  owner: string; // 'personal' or `business:<id>`
  requestedAmount: number;
  requestedTermMonths: number;
  submittedAt: number; // dayIndex
  decisionAt: number; // dayIndex the review completes
  status: LoanApplicationStatus;
  approvedAmount: number | null;
  approvedRateAnnual: number | null;
  denialReasons: string[];
  collateralNote: string | null;
}

// ---------- Businesses ----------

export type IndustryId = 'fast_food';

// ---------- Delegation / managers ----------

export type ManagerRole =
  | 'location_manager' | 'regional_manager' | 'operations_director' | 'hr_manager'
  | 'cfo' | 'cmo' | 'coo' | 'ceo'
  | 'inventory_manager' | 'procurement_manager' | 'warehouse_manager';

/** Corporate C-suite roles need a real office to work from — they can't run a company from a restaurant kitchen. */
export const CORPORATE_MANAGER_ROLES: ManagerRole[] = ['cfo', 'cmo', 'coo', 'ceo'];

export type FundingSource = 'business' | 'personal';

export interface Manager {
  id: string;
  businessId: string;
  locationId: string | null; // set for location_manager, null for company-wide roles
  role: ManagerRole;
  name: string;
  age: number;
  leadership: number; // 0-100
  operations: number;
  finance: number;
  marketingSkill: number;
  peopleSkill: number;
  growth: number;
  experienceYears: number;
  salary: number;
  hiredAt: number;
  benefits: EmployeeBenefits;
}

export type DelegationControl = 'player' | 'manager';

export interface DelegationSettings {
  pricing: DelegationControl;
  hiring: DelegationControl;
  staffing: DelegationControl;
  marketing: DelegationControl;
  inventory: DelegationControl;
  operations: DelegationControl;
}

export const DEFAULT_DELEGATION_SETTINGS: DelegationSettings = {
  pricing: 'player',
  hiring: 'player',
  staffing: 'player',
  marketing: 'player',
  inventory: 'player',
  operations: 'player',
};

// ---------- Management automation (CEO / HR real behavior) ----------

export type CEOStrategy = 'conservative' | 'balanced' | 'growth' | 'aggressive_growth' | 'profit_maximization';

export interface CEOAutomationSettings {
  strategy: CEOStrategy;
  budgetAllocation: DelegationControl; // does the CEO reallocate HR/marketing/ops budgets on their own?
  expansionAuthority: 'manual' | 'recommend' | 'automatic';
  maxDiscretionaryMonthlySpend: number; // hard cap the CEO can commit without a separate owner approval
  minCashReserve: number; // CEO will not recommend/spend below this business cash floor
}

export const DEFAULT_CEO_SETTINGS: CEOAutomationSettings = {
  strategy: 'balanced',
  budgetAllocation: 'player',
  expansionAuthority: 'recommend',
  maxDiscretionaryMonthlySpend: 5_000,
  minCashReserve: 10_000,
};

export interface HRAutomationSettings {
  autoHire: boolean;
  autoFire: boolean;
  autoTrain: boolean;
  recruitmentBudgetMonthly: number;
  trainingBudgetMonthly: number;
}

export const DEFAULT_HR_SETTINGS: HRAutomationSettings = {
  autoHire: false,
  autoFire: false,
  autoTrain: false,
  recruitmentBudgetMonthly: 3_000,
  trainingBudgetMonthly: 2_000,
};

export interface ManagementLogEntry {
  id: string;
  timestamp: number; // dayIndex
  role: ManagerRole;
  message: string;
}

export interface Business {
  id: string;
  name: string;
  industry: IndustryId;
  level: number; // 1-6
  foundedAt: number;
  reputation: number; // 0-100
  cash: number;
  locations: BusinessLocation[];
  employees: Employee[];
  menu: MenuItem[];
  marketingCampaigns: MarketingCampaign[];
  financialHistory: DailyBusinessRecord[];
  reviews: Review[];
  activeEvents: BusinessEvent[];
  loans: Loan[];
  managers: Manager[];
  delegation: DelegationSettings;
  ceoSettings: CEOAutomationSettings;
  hrSettings: HRAutomationSettings;
  managementLog: ManagementLogEntry[];
  /** % of this business's equity the player actually owns — supports partial acquisitions. Defaults to 100. */
  ownershipPct: number;
  /** If set, this business is a subsidiary of a HoldingCompany and its equity flows into the holding's books. */
  holdingCompanyId: string | null;
  /** % of monthly profit swept up to the parent holding company as a dividend (0 = retain all). Only meaningful when holdingCompanyId is set. */
  dividendPolicyPct: number;
  /** Extra monthly budget the holding parent has allocated toward this subsidiary's growth (spent on marketing/hiring/equipment via normal channels). */
  allocatedCapitalBudget: number;
  /** Corporate office the C-suite works out of. Null means no HQ — CFO/CMO/COO/CEO can't be hired until one exists. Not required for location/regional/HR/operations managers. */
  headquarters: Headquarters | null;
  companyVehicles: CompanyVehicle[];
  companyPhones: CompanyPhone[];
  /** Optional monthly spend ceilings management works within. null = no limit. Soft caps — they warn, they don't block. */
  budgetLimits: BusinessBudgetLimits;
  warehouses: Warehouse[];
  activeMarketTrends: MarketTrend[];
  activeSupplierEvents: SupplierMarketEvent[];
  wasteLog: WasteLogEntry[];
}

export interface BusinessBudgetLimits {
  marketing: number | null;
  inventory: number | null;
  training: number | null;
}

export function createDefaultBudgetLimits(): BusinessBudgetLimits {
  return { marketing: null, inventory: null, training: null };
}

// ---------- Headquarters ----------

export type HeadquartersTier = 'small_office' | 'regional_office' | 'corporate_hq';
export type HeadquartersOwnership = 'rented' | 'owned';

export interface Headquarters {
  tier: HeadquartersTier;
  ownership: HeadquartersOwnership;
  monthlyCost: number; // rent if rented; utilities/maintenance/insurance if owned outright
  purchasePrice?: number; // set only when owned outright
  capacity: number; // max corporate (C-suite) employees it can house
  acquiredAt: number; // dayIndex
}

// ---------- Holding companies ----------

export interface HoldingCompany {
  id: string;
  name: string;
  cash: number;
  foundedAt: number;
  subsidiaryBusinessIds: string[];
  /** Real corporate overhead (executive salaries, admin) charged from holding cash each month — prevents holdings from being a free multiplier. */
  monthlyAdminOverhead: number;
}

// ---------- NPC businesses / acquisitions / competition ----------

export interface NPCBusinessHistoryPoint {
  dayIndex: number;
  revenue: number;
  profit: number;
}

export interface NPCBusiness {
  id: string;
  name: string;
  industry: IndustryId;
  city: string;
  monthlyRevenue: number;
  monthlyProfit: number;
  debt: number;
  employees: number;
  locations: number;
  reputation: number; // 0-100
  growthStyle: 'aggressive' | 'steady' | 'declining' | 'struggling';
  marketShare: number; // 0-100 within its city+industry segment
  forSale: boolean;
  askingPrice: number;
  valuation: number;
  foundedAt: number;
  history: NPCBusinessHistoryPoint[];
  failed: boolean;
}

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'countered' | 'withdrawn';

export interface AcquisitionOffer {
  id: string;
  npcBusinessId: string;
  offerAmount: number;
  submittedAt: number;
  decisionAt: number;
  status: OfferStatus;
  counterAmount: number | null;
}

export type IncomingBuyerType = 'competitor' | 'private_equity' | 'entrepreneur' | 'holding_company';

export interface IncomingBusinessOffer {
  id: string;
  businessId: string;
  buyerName: string;
  buyerType: IncomingBuyerType;
  offerAmount: number;
  createdAt: number;
  expiresAt: number;
  status: OfferStatus;
}

// ---------- Properties ----------

export type PropertyType =
  | 'trailer'
  | 'studio'
  | 'apartment'
  | 'townhouse'
  | 'house'
  | 'luxury_house'
  | 'villa'
  | 'penthouse'
  | 'mansion'
  | 'estate'
  | 'beach_house'
  | 'mountain_home'
  | 'private_island';

export type PropertyUse = 'primary' | 'rental' | 'vacation';

export interface Property {
  id: string;
  listingId?: string; // links back to PROPERTY_LISTINGS for a stable, correct image — optional only for saves predating this field
  type: PropertyType;
  name: string;
  city: string;
  purchasePrice: number;
  currentValue: number;
  mortgageBalance: number;
  monthlyMortgagePayment: number;
  monthlyMaintenance: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  luxuryRating: number; // 1-5
  use: PropertyUse;
  monthlyRent: number;
  purchasedAt: number;
}

// ---------- Renting (tenancy — living somewhere without owning it) ----------

export interface RentalAgreement {
  id: string;
  listingId: string;
  monthlyRent: number;
  deposit: number;
  startedAt: number; // dayIndex
}

// ---------- Subscriptions ----------

export type SubscriptionCategory = 'phone' | 'internet' | 'streaming' | 'gym' | 'software' | 'other';

export interface Subscription {
  id: string;
  name: string;
  category: SubscriptionCategory;
  monthlyCost: number;
  active: boolean;
}

// ---------- Lifestyle ----------

export type LifestyleCategory = 'fitness' | 'entertainment' | 'phone' | 'food' | 'services';

export interface LifestyleTier {
  id: string;
  category: LifestyleCategory;
  name: string;
  monthlyCost: number;
  healthEffect: number; // small permanent-while-active pull on player.wellbeing.health
  happinessEffect: number;
  statusEffect: number; // prestige/status flavor — feeds achievements/reputation-adjacent flourishes, not a hard number elsewhere yet
  description: string;
  stackable: boolean; // entertainment/services allow multiple simultaneous picks; fitness/phone/food are single-choice
}

export interface LifestyleState {
  fitness: string | null;
  entertainment: string[];
  phone: string | null;
  food: string | null;
  services: string[];
}

export const DEFAULT_LIFESTYLE_STATE: LifestyleState = {
  fitness: null,
  entertainment: [],
  phone: null,
  food: null,
  services: [],
};

export interface Wellbeing {
  health: number; // 0-100
  happiness: number; // 0-100
}

export const DEFAULT_WELLBEING: Wellbeing = { health: 65, happiness: 60 };

// ---------- Bank ----------

export interface BankState {
  savingsBalance: number;
  savingsInterestRateAnnual: number;
  creditScore: number; // 300-850
  loans: Loan[]; // personal-side loans (personal, auto, mortgage, boat, aircraft, student)
}

// ---------- Vehicles ----------

export type VehicleCategory = 'economy' | 'sedan' | 'suv' | 'pickup' | 'sports' | 'super' | 'hyper' | 'classic' | 'luxury' | 'electric';

export interface VehicleListing {
  id: string;
  category: VehicleCategory;
  brand: string;
  model: string;
  year: number;
  price: number;
  topSpeedMph: number;
  horsepower: number;
  prestige: number; // 0-100
  insuranceMonthly: number;
  maintenanceMonthly: number;
  /** Path under /assets — every listing has its own dedicated image; falls back to an icon only when explicitly absent (e.g. no matching art exists yet). */
  image?: string;
}

export interface Vehicle {
  id: string;
  listingId: string;
  category: VehicleCategory;
  brand: string;
  model: string;
  year: number;
  purchasePrice: number;
  currentValue: number;
  mileage: number;
  condition: number; // 0-100
  insuranceMonthly: number;
  maintenanceMonthly: number;
  prestige: number;
  purchasedAt: number;
}

// ---------- Boats ----------

export type BoatCategory = 'small_boat' | 'rib' | 'fishing' | 'speedboat' | 'cruiser' | 'yacht' | 'superyacht';

export interface BoatListing {
  id: string;
  category: BoatCategory;
  name: string;
  lengthFt: number;
  price: number;
  topSpeedKnots: number;
  crewRequired: number;
  prestige: number;
  maintenanceMonthly: number;
  marinaFeeMonthly: number;
  crewCostMonthly: number;
  image?: string;
}

export interface Boat {
  id: string;
  listingId: string;
  category: BoatCategory;
  name: string;
  lengthFt: number;
  purchasePrice: number;
  currentValue: number;
  condition: number;
  prestige: number;
  maintenanceMonthly: number;
  marinaFeeMonthly: number;
  crewCostMonthly: number;
  purchasedAt: number;
}

// ---------- Aircraft ----------

export type AircraftCategory = 'bush_plane' | 'propeller' | 'turboprop' | 'seaplane' | 'light_jet' | 'private_jet' | 'long_range_jet' | 'luxury_jet' | 'helicopter';

export interface AircraftListing {
  id: string;
  category: AircraftCategory;
  name: string;
  price: number;
  rangeMiles: number;
  passengers: number;
  prestige: number;
  operatingCostMonthly: number;
  crewCostMonthly: number;
  hangarCostMonthly: number;
  image?: string;
}

export interface Aircraft {
  id: string;
  listingId: string;
  category: AircraftCategory;
  name: string;
  purchasePrice: number;
  currentValue: number;
  condition: number;
  prestige: number;
  operatingCostMonthly: number;
  crewCostMonthly: number;
  hangarCostMonthly: number;
  purchasedAt: number;
}

// ---------- Luxury goods ----------

export type LuxuryCategory = 'watch' | 'ring' | 'necklace' | 'bracelet' | 'earrings' | 'collectible';

export interface LuxuryListing {
  id: string;
  category: LuxuryCategory;
  name: string;
  brand: string;
  price: number;
  prestige: number;
  appreciationAnnual: number; // e.g. 0.02 = tends to gain 2%/yr, negative = depreciates
  image?: string;
}

export interface LuxuryItem {
  id: string;
  listingId: string;
  category: LuxuryCategory;
  name: string;
  brand: string;
  purchasePrice: number;
  currentValue: number;
  prestige: number;
  appreciationAnnual: number;
  purchasedAt: number;
}

// ---------- Investments ----------

export type AssetClass = 'stock' | 'etf' | 'crypto';

export interface MarketInstrument {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  sector: string;
  basePrice: number;
  price: number;
  previousClose: number;
  volatility: number; // daily stddev-ish, e.g. 0.01-0.08
  driftAnnual: number; // long-run expected annual return, e.g. 0.08
  history: { dayIndex: number; price: number }[];
}

export interface Holding {
  symbol: string;
  shares: number;
  avgCost: number;
}

export interface InvestmentState {
  holdings: Holding[];
  realizedGains: number;
}

// ---------- Family & relationships ----------

export type FamilyRole = 'mother' | 'father' | 'partner' | 'child' | 'grandmother' | 'grandfather';
/** Dropped a separate pre-exclusive "dating" stage: the candidate pool already models casually
 * dating several people at once, which is more realistic than pointing status at one person early. */
export type RelationshipStatus = 'single' | 'exclusive' | 'serious' | 'engaged' | 'married';
export type PersonalityTrait = 'kind' | 'ambitious' | 'funny' | 'adventurous' | 'intellectual' | 'reserved' | 'romantic' | 'independent' | 'frugal' | 'materialistic' | 'generous' | 'cautious' | 'family_oriented' | 'career_focused';
export type PrenupType = 'none' | 'standard' | 'strong';
export type EmploymentStatus = 'employed' | 'unemployed' | 'retired';

/** A single remembered thing the player did that affects how an NPC feels/behaves — not full AI, just structured memory. */
export interface NPCMemoryEvent {
  id: string;
  type: 'gift' | 'visit' | 'call' | 'asset_gift' | 'ignored_milestone' | 'debt_payoff' | 'other';
  timestamp: number; // dayIndex
  amount?: number;
  description: string;
}

export interface FamilyMember {
  id: string;
  role: FamilyRole;
  name: string;
  age: number;
  occupation: string;
  employmentStatus: EmploymentStatus;
  relationship: number; // 0-100
  traits: PersonalityTrait[];
  bornAt?: number; // dayIndex, for children
  retired?: boolean;
  lastInteractionAt?: number; // dayIndex of last Call/Visit/Gift
  /** Lightweight NPC finances — summarized, not a full simulation. */
  cash: number;
  annualIncome: number;
  debt: number;
  city: string;
  homeDescription: string; // flavor: "Modest apartment", "Paid-off suburban house", ...
  vehicleDescription: string;
  /** Links into the generational family tree. Undefined/empty means "not generated yet" (e.g. grandparents). */
  parentIds: string[];
  partnerNpcId: string | null; // this NPC's own partner, if generated (e.g. grandmother is father's partner)
  childrenIds: string[];
  memory: NPCMemoryEvent[];
  deceased: boolean;
  deceasedAt: number | null;
}

export interface DatingCandidate {
  id: string;
  name: string;
  age: number;
  occupation: string;
  educationLevel: EducationLevel;
  personality: PersonalityTrait;
  income: number;
  compatibility: number; // 0-100, fixed at generation
  relationship: number; // 0-100, grows with interaction
}

export interface RelationshipState {
  status: RelationshipStatus;
  partnerId: string | null; // FamilyMember id once exclusive+
  candidates: DatingCandidate[];
  exclusiveAt: number | null;
  seriousAt: number | null;
  engagedAt: number | null;
  marriedAt: number | null;
  prenup: PrenupType | null;
}

// ---------- Pregnancy ----------

export interface Pregnancy {
  id: string;
  startedAt: number; // dayIndex of conception
  estimatedDueAt: number; // dayIndex
  childName: string; // chosen at conception so events can reference it
}

// ---------- Divorce ----------

export interface DivorceSettlement {
  marriageLengthDays: number;
  sharedPropertyValue: number;
  sharedInvestmentValue: number;
  estimatedAssetTransfer: number;
  monthlyChildSupport: number;
  primaryHomeToPartner: boolean;
}

// ---------- Life events ----------

export type LifeEventCategory = 'career' | 'business' | 'family' | 'financial' | 'random' | 'life' | 'education' | 'investment';

export interface LifeEventChoice {
  id: string;
  label: string;
  description: string;
  cost: number;
  effects: {
    cashFlat?: number;
    relationshipFlat?: number;
    happinessFlat?: number;
  };
}

export interface LifeEvent {
  id: string;
  category: LifeEventCategory;
  title: string;
  description: string;
  triggeredAt: number;
  choices: LifeEventChoice[];
  resolved: boolean;
}

// ---------- Timeline ----------

export interface TimelineEntry {
  id: string;
  age: number;
  timestamp: number;
  title: string;
  description: string;
}

// ---------- Economy ----------

export type EconomicCondition = 'recession' | 'slow_growth' | 'normal' | 'strong_growth' | 'boom';

export interface EconomyState {
  condition: EconomicCondition;
  interestRate: number; // annual, e.g. 0.055
  unemploymentRate: number; // e.g. 0.042
  propertyMarketTrend: Record<string, 'declining' | 'stable' | 'growing' | 'booming'>;
  daysInCondition: number;
}

// ---------- Achievements ----------

export type AchievementCategory = 'wealth' | 'business' | 'career' | 'property' | 'progression' | 'education' | 'family' | 'luxury' | 'life';

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
}

export interface AchievementState {
  id: string;
  unlockedAt: number | null;
}

// ---------- Notifications ----------

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'urgent';

export interface GameNotification {
  id: string;
  timestamp: number;
  title: string;
  message: string;
  severity: NotificationSeverity;
  read: boolean;
  link?: { page: string; businessId?: string };
}

// ---------- Statistics ----------

export interface Statistics {
  totalMoneyEarned: number;
  totalMoneySpent: number;
  highestNetWorth: number;
  businessesStarted: number;
  businessesSold: number;
  employeesHired: number;
  employeesFired: number;
  customersServed: number;
  marketingSpend: number;
  loansTaken: number;
  propertiesPurchased: number;
  daysPlayed: number;
  degreesEarned: number;
  jobsHeld: number;
  promotions: number;
  datesBeenOn: number;
  yearsMarried: number;
  vehiclesPurchased: number;
  boatsPurchased: number;
  aircraftPurchased: number;
  luxuryPurchased: number;
  investmentProfit: number;
  childrenBorn: number;
  divorces: number;
  inheritanceReceived: number;
  loanApplicationsSubmitted: number;
  loansApproved: number;
  loansDenied: number;
  acquisitionsCompleted: number;
  npcGiftsGiven: number;
  assetsGifted: number;
  charityDonated: number;
}

// ---------- Gifting ----------

export type GiftableAssetType = 'vehicle' | 'boat' | 'aircraft' | 'luxury' | 'property';
export type GiftRecipient = { kind: 'family'; memberId: string } | { kind: 'charity' } | { kind: 'stranger' };

// ---------- Settings ----------

export type LifeEventsDifficulty = 'relaxed' | 'realistic';

export interface GameSettings {
  animationsEnabled: boolean;
  numberFormat: 'full' | 'abbreviated';
  notificationsEnabled: boolean;
  daySummaryMode: 'always' | 'important_only' | 'never';
  lifeEventsDifficulty: LifeEventsDifficulty;
}

// ---------- Player ----------

export interface Player {
  id: string;
  name: string;
  age: number;
  city: string;
  createdAt: number;
  cash: number;
  career: CareerState;
  education: EducationState;
  bank: BankState;
  loanApplications: LoanApplication[];
  subscriptions: Subscription[];
  lifestyle: LifestyleState;
  wellbeing: Wellbeing;
  properties: Property[];
  currentRental: RentalAgreement | null;
  vehicles: Vehicle[];
  boats: Boat[];
  aircraft: Aircraft[];
  luxuryItems: LuxuryItem[];
  investments: InvestmentState;
  family: FamilyMember[];
  relationship: RelationshipState;
  pregnancy: Pregnancy | null;
  lastChildBornAt: number | null; // dayIndex, for postpartum cooldown
  holdingCompanies: HoldingCompany[];
  acquisitionOffers: AcquisitionOffer[];
  incomingBusinessOffers: IncomingBusinessOffer[];
  statistics: Statistics;
  achievements: AchievementState[];
  settings: GameSettings;
  lifeEvents: LifeEvent[];
  timeline: TimelineEntry[];
}

// ---------- Game over ----------

export interface GameOverState {
  isOver: boolean;
  reason: 'financial_ruin' | null;
  triggeredAt: number | null;
}

// ---------- Root game state ----------

export interface GameState {
  saveVersion: number;
  time: GameTime;
  player: Player;
  businesses: Business[];
  npcBusinesses: NPCBusiness[];
  transactions: Transaction[];
  notifications: GameNotification[];
  market: MarketInstrument[];
  economy: EconomyState;
  gameOver: GameOverState;
  lastSavedAt: number; // real epoch ms
}

// ---------- Day summary (Next Day result) ----------

export interface DaySummaryLine {
  label: string;
  amount?: number;
  detail?: string;
}

export interface DaySummary {
  dateLabel: string;
  daysSimulated: number; // 1 for Next Day, 7 for Next Week
  income: number;
  expenses: number;
  netChange: number;
  businessLines: DaySummaryLine[];
  investmentChange: number;
  relationshipLines: DaySummaryLine[];
  eventLines: string[];
  importantEventIds: string[];
  importantEventCount: number;
  hasImportant: boolean;
  stoppedEarly: boolean; // true if a Next Week run halted before 7 days because of a blocking event
}
