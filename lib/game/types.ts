export type SkillId =
  | "business"
  | "marketing"
  | "programming"
  | "finance"
  | "realEstate"
  | "content"
  | "medical"
  | "law"
  | "engineering";

export type JobCategory =
  | "starter"
  | "business"
  | "marketing"
  | "tech"
  | "finance"
  | "medical"
  | "law"
  | "realEstate"
  | "creative";

export type SchoolCategory =
  | "business"
  | "medical"
  | "law"
  | "tech"
  | "finance"
  | "realEstate"
  | "creative"
  | "engineering";

export type ActiveTab =
  | "life"
  | "stats"
  | "career"
  | "economy"
  | "actions"
  | "timeline";

export type ActionPage =
  | "main"
  | "lifeGrowth"
  | "selfImprovement"
  | "school"
  | "career"
  | "apply"
  | "life"
  | "money"
  | "relationships"
  | "assets";

export type SetupStep =
  | "name"
  | "country"
  | "background"
  | "trait"
  | "difficulty";

export type Origin = {
  country: string;
  background: string;
  trait: string;
  difficulty: string;
};

export type LifeEventType = "life" | "promotion";

export type LifeEventEffect = {
  healthGain?: number;
  happinessGain?: number;
  intelligenceGain?: number;
  charismaGain?: number;
  disciplineGain?: number;
  reputationGain?: number;
  luckGain?: number;
  cashGain?: number;
  debtGain?: number;
  careerXpGain?: number;
  businessValueGain?: number;
  businessName?: string;
  businessValueSet?: number;
  jobLoss?: boolean;
  familyRelationshipGain?: number;
  friendshipsGain?: number;
  relationshipQualityGain?: number;
  childrenGain?: number;
  breakup?: boolean;
};

export type LifeChoiceEvent = {
  id: string;
  type: LifeEventType;
  title: string;
  description: string;
  acceptLabel: string;
  declineLabel: string;
  acceptEffect: LifeEventEffect;
  declineEffect: LifeEventEffect;
  targetJobId?: string;
};

export type AssetCondition = "Excellent" | "Good" | "Fair" | "Poor" | "Bad";

export type RentPriceLevel = "Low" | "Market" | "High";

export type RentalStatus = "Vacant" | "Occupied";

export type TenantQuality = "Excellent" | "Good" | "Average" | "Risky" | "Bad";

export type RentalEventType =
  | "none"
  | "paid"
  | "missed_payment"
  | "damage"
  | "move_out"
  | "complaint"
  | "renewed"
  | "manager_saved_problem";

export type PropertyManagerStatus = {
  enabled: boolean;
  feePercent: number;
};

export type OwnedAsset = {
  id: string;
  name: string;
  type: "car" | "home";
  value: number;
  upkeep: number;
  happinessBonus: number;
  reputationBonus: number;
  condition: AssetCondition;

  rentedOut?: boolean;
  rentalStatus?: RentalStatus;
  rentPriceLevel?: RentPriceLevel;
  rentIncome?: number;

  tenantName?: string;
  tenantQuality?: TenantQuality;
  tenantYearsRemaining?: number;
  lastRentalEvent?: RentalEventType;
  lastRentalEventMessage?: string;

  propertyManager?: PropertyManagerStatus;

  lastServicedAge?: number;
};

export type HousingType = "none" | "rent" | "own";

export type HousingStatus = {
  type: HousingType;
  name: string;
  yearlyCost: number;
  homeAssetId?: string;
};

export type HousingOption = {
  id: string;
  name: string;
  yearlyCost: number;
  happinessBonus: number;
  reputationBonus: number;
  description: string;
};

export type StudentLoanStatus = "not_applied" | "approved" | "denied";

export type EconomyBreakdown = {
  workPayPerClick: number;
  possibleWorkIncomePerYear: number;

  businessIncomeEstimate: number;
  rentalIncomeEstimate: number;
  totalPassiveIncome: number;

  housingCost: number;
  assetUpkeep: number;
  debtInterest: number;
  propertyManagerFees: number;
  totalExpenses: number;

  totalAssets: number;
  totalCarValue: number;
  totalHomeValue: number;

  netPassiveYear: number;

  occupiedRentals: number;
  vacantRentals: number;
};

export type LifeStats = {
  name: string;
  age: number;
  country: string;
  background: string;
  trait: string;
  difficulty: string;

  health: number;
  happiness: number;
  intelligence: number;
  charisma: number;
  discipline: number;
  luck: number;
  reputation: number;

  cash: number;
  netWorth: number;
  debt: number;

  education: string;
  educationLevel: number;

  activeDegreeId: string;
  degreeProgress: Record<string, number>;
  degreePaid: Record<string, number>;
  completedDegrees: string[];

  studentLoanStatus: StudentLoanStatus;
  studentLoanLimit: number;
  studentLoanUsed: number;

  skills: Record<SkillId, number>;

  jobId: string;
  job: string;
  jobTrack: SkillId | "none";
  salary: number;
  careerLevel: number;
  careerXp: number;
  jobExperience: Record<string, number>;
  hasAskedPromotionThisYear: boolean;

  pendingLifeEvent: LifeChoiceEvent | null;
  popupMessage: string | null;
  nextLifeEventAge: number;
  lastLifeEventId: string;

  familyRelationship: number;
  friendships: number;
  socialCircle: number;
  relationshipStatus: string;
  partnerName: string;
  relationshipQuality: number;
  children: number;

  currentHousing: HousingStatus;
  ownedCars: OwnedAsset[];
  ownedHomes: OwnedAsset[];

  business: string;
  businessValue: number;
  businessStage: number;
  businessEmployees: number;
  businessRevenue: number;
  businessRisk: number;
  businessesStarted: number;

  lifetimeMilestones: string[];

  actionsLeft: number;
  yearNotes: string[];

  yearsWorked: number;
  yearsStudied: number;
  riskTaken: number;

  eventLog: string[];
  isDead: boolean;
  deathReason: string;
};

export type FamilyBackground = {
  name: string;
  startingCash: number;
  healthBonus: number;
  happinessBonus: number;
  intelligenceBonus: number;
  charismaBonus: number;
  disciplineBonus: number;
  luckBonus: number;
  reputationBonus: number;
  description: string;
};

export type ChildhoodTrait = {
  name: string;
  healthBonus: number;
  happinessBonus: number;
  intelligenceBonus: number;
  charismaBonus: number;
  disciplineBonus: number;
  luckBonus: number;
  reputationBonus: number;
  description: string;
};

export type Difficulty = {
  name: string;
  cashMultiplier: number;
  statPenalty: number;
  description: string;
};

export type SkillDefinition = {
  id: SkillId;
  name: string;
  description: string;
  primaryStat: "intelligence" | "charisma" | "discipline" | "health";
  secondaryStat:
    | "intelligence"
    | "charisma"
    | "discipline"
    | "reputation"
    | "happiness"
    | "health";
};

export type LifeGrowthActionCategory =
  | "health"
  | "mental"
  | "social"
  | "growth";

export type LifeGrowthAction = {
  id: string;
  category: LifeGrowthActionCategory;
  name: string;
  description: string;
  healthGain: number;
  happinessGain: number;
  intelligenceGain: number;
  charismaGain: number;
  disciplineGain: number;
  reputationGain: number;
  cashCost: number;
};

export type SelfImprovementAction = LifeGrowthAction;

export type DegreeProgram = {
  id: string;
  schoolCategory: SchoolCategory;
  schoolName: string;
  name: string;
  description: string;
  totalCost: number;
  happinessCost: number;
  progressGain: number;
  educationLevelReward: number;
  educationName: string;
  skillReward: SkillId;
  skillGainOnComplete: number;
  intelligenceGain: number;
  charismaGain: number;
  disciplineGain: number;
  reputationGain: number;
  requiredDegree?: string;
};

export type Job = {
  id: string;
  title: string;
  category: JobCategory;
  careerPath: string;
  nextJobId?: string;
  track: SkillId;
  salary: number;
  requiredSkill: number;
  requiredEducationLevel: number;
  requiredDegree?: string;
  requiredJobId?: string;
  requiredJobExperience?: number;
  requiredIntelligence: number;
  requiredCharisma: number;
  requiredDiscipline: number;
  requiredReputation: number;
};