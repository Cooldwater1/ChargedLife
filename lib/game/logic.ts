import { ACTIONS_PER_YEAR, jobs } from "./data";
import type {
  AssetCondition,
  BusinessType,
  DegreeProgram,
  EconomyBreakdown,
  HousingOption,
  Job,
  LifeChoiceEvent,
  LifeEventEffect,
  LifeGrowthAction,
  LifeStats,
  OwnedAsset,
  OwnedBusiness,
  PartTimeJob,
  RentPriceLevel,
  RentalEventType,
  SelfImprovementAction,
  TenantQuality,
} from "./types";
import {
  addLog,
  addYearNote,
  calculateNetWorth,
  clamp,
  formatMoney,
  getDegreeName,
  getDegreePaid,
  getDegreeProgress,
  randomBetween,
} from "./utils";
import { getJobMissingRequirements } from "./requirements";

export const housingOptions: HousingOption[] = [
  {
    id: "studio-apartment",
    name: "Studio Apartment",
    yearlyCost: 6000,
    happinessBonus: 3,
    reputationBonus: 0,
    description: "Cheap starter housing. Adds yearly rent.",
  },
  {
    id: "small-rental-house",
    name: "Small Rental House",
    yearlyCost: 16000,
    happinessBonus: 7,
    reputationBonus: 2,
    description: "More comfortable, but much more expensive.",
  },
  {
    id: "nice-rental-house",
    name: "Nice Rental House",
    yearlyCost: 32000,
    happinessBonus: 12,
    reputationBonus: 5,
    description: "A good lifestyle choice if you have stable income.",
  },
];

export const partTimeJobOptions: PartTimeJob[] = [
  {
    id: "food-delivery",
    name: "Food Delivery",
    pay: 4200,
    stressGain: 5,
    happinessCost: 2,
    disciplineGain: 2,
    description: "Flexible delivery work. Good starter cash while studying or job hunting.",
  },
  {
    id: "retail-assistant",
    name: "Retail Assistant",
    pay: 5200,
    stressGain: 6,
    happinessCost: 3,
    disciplineGain: 3,
    description: "A steady part-time job with basic customer experience.",
  },
  {
    id: "online-freelancing",
    name: "Online Freelancing",
    pay: 6800,
    stressGain: 8,
    happinessCost: 3,
    disciplineGain: 4,
    description: "Use your skills online. Higher upside, but more pressure.",
  },
  {
    id: "tutoring",
    name: "Tutoring",
    pay: 6000,
    stressGain: 5,
    happinessCost: 2,
    disciplineGain: 3,
    description: "Teach others and earn money while building discipline.",
  },
];

export const businessTypes: BusinessType[] = [
  {
    id: "online-store",
    name: "Online Store",
    category: "Commerce",
    startCost: 5000,
    difficulty: 2,
    risk: 24,
    revenuePotential: 1.05,
    skill: "marketing",
    description: "Sell products online. Cheap to start, good early income, medium risk.",
  },
  {
    id: "marketing-agency",
    name: "Marketing Agency",
    category: "Service",
    startCost: 7500,
    difficulty: 3,
    risk: 28,
    revenuePotential: 1.2,
    skill: "marketing",
    description: "Help other businesses grow. Scales with charisma, reputation, and marketing skill.",
  },
  {
    id: "mobile-app",
    name: "Mobile App",
    category: "Tech",
    startCost: 15000,
    difficulty: 5,
    risk: 42,
    revenuePotential: 1.7,
    skill: "programming",
    description: "Harder to build, but can scale into a very valuable company.",
  },
  {
    id: "game-studio",
    name: "Game Studio",
    category: "Games",
    startCost: 22000,
    difficulty: 6,
    risk: 48,
    revenuePotential: 2,
    skill: "programming",
    description: "Create games. High risk, high upside, and strong long-term value potential.",
  },
  {
    id: "minecraft-server",
    name: "Minecraft Server",
    category: "Gaming",
    startCost: 10000,
    difficulty: 4,
    risk: 40,
    revenuePotential: 1.55,
    skill: "content",
    description: "Build a community server. Marketing, community, and updates matter.",
  },
  {
    id: "roblox-game",
    name: "Roblox Game",
    category: "Gaming",
    startCost: 12000,
    difficulty: 5,
    risk: 45,
    revenuePotential: 1.85,
    skill: "programming",
    description: "A creator economy business with big upside if the game catches attention.",
  },
  {
    id: "real-estate-company",
    name: "Real Estate Company",
    category: "Property",
    startCost: 60000,
    difficulty: 5,
    risk: 30,
    revenuePotential: 1.35,
    skill: "realEstate",
    description: "Expensive to start, slower growth, but stable and powerful over time.",
  },
];

export const carShop: OwnedAsset[] = [
  createMarketAsset("cheap-used-car", "Cheap Used Car", "car", 8500, 900, 2, 0, "Good"),
  createMarketAsset("reliable-car", "Reliable Car", "car", 28000, 1800, 4, 1, "Good"),
  createMarketAsset("sports-car", "Sports Car", "car", 95000, 6500, 8, 6, "Excellent"),
  createMarketAsset("luxury-car", "Luxury Car", "car", 220000, 12000, 10, 10, "Excellent"),
];

export const homeShop: OwnedAsset[] = [
  createMarketAsset("city-studio", "City Studio", "home", 220000, 6000, 5, 1, "Good", 18000),
  createMarketAsset("starter-townhouse", "Starter Townhouse", "home", 485000, 12000, 8, 4, "Good", 38000),
  createMarketAsset("family-villa", "Family Villa", "home", 950000, 28000, 12, 8, "Excellent", 82000),
  createMarketAsset("luxury-estate", "Luxury Estate", "home", 2500000, 75000, 18, 18, "Excellent", 185000),
];

export const itemShop: OwnedAsset[] = [
  {
    ...createMarketAsset("silver-ring", "Silver Ring", "item", 1200, 20, 1, 0, "Excellent"),
    itemCategory: "jewelry",
    rarity: "Common",
  },
  {
    ...createMarketAsset("gold-chain", "Gold Chain", "item", 8500, 75, 2, 2, "Excellent"),
    itemCategory: "jewelry",
    rarity: "Premium",
  },
  {
    ...createMarketAsset("designer-watch", "Designer Watch", "item", 32000, 250, 3, 5, "Excellent"),
    itemCategory: "luxury",
    rarity: "Luxury",
  },
  {
    ...createMarketAsset("tailored-suit", "Tailored Suit", "item", 4500, 400, 2, 3, "Excellent"),
    itemCategory: "clothing",
    rarity: "Premium",
  },
  {
    ...createMarketAsset("luxury-wardrobe", "Luxury Wardrobe", "item", 18000, 1400, 5, 6, "Excellent"),
    itemCategory: "clothing",
    rarity: "Luxury",
  },
  {
    ...createMarketAsset("rare-art-piece", "Rare Art Piece", "item", 75000, 600, 4, 8, "Excellent"),
    itemCategory: "collectible",
    rarity: "Legendary",
  },
];

function createMarketAsset(
  id: string,
  name: string,
  type: "car" | "home" | "item",
  value: number,
  upkeep: number,
  happinessBonus: number,
  reputationBonus: number,
  condition: AssetCondition,
  rentIncome = 0
): OwnedAsset {
  return {
    id,
    name,
    type,
    value,
    upkeep,
    happinessBonus,
    reputationBonus,
    condition,
    rentedOut: false,
    rentalStatus: "Vacant",
    rentPriceLevel: "Market",
    rentIncome,
    tenantName: "",
    tenantQuality: undefined,
    tenantYearsRemaining: 0,
    lastRentalEvent: "none",
    lastRentalEventMessage: "",
    propertyManager: {
      enabled: false,
      feePercent: 0,
    },
    lastServicedAge: 18,
  };
}

function recalc(life: LifeStats): LifeStats {
  return {
    ...life,
    netWorth:
      life.cash + getAssetValue(life) + life.businessValue - Math.max(0, life.debt),
  };
}

function consumeAction(life: LifeStats): LifeStats {
  return recalc({
    ...life,
    actionsLeft: Math.max(0, life.actionsLeft - 1),
  });
}

function noActions(life: LifeStats): LifeStats | null {
  if (life.actionsLeft > 0) return null;

  return {
    ...life,
    popupMessage: `You have already used ${ACTIONS_PER_YEAR}/${ACTIONS_PER_YEAR} actions this year. End the year to continue.`,
    yearNotes: addYearNote(
      life,
      `You have already used ${ACTIONS_PER_YEAR}/${ACTIONS_PER_YEAR} actions this year. End the year to continue.`
    ),
  };
}

export function getActionsUsed(life: LifeStats) {
  return ACTIONS_PER_YEAR - life.actionsLeft;
}

export function getJobById(jobId: string) {
  return jobs.find((job) => job.id === jobId) || null;
}

export function getJobName(jobId: string) {
  if (jobId === "unemployed") return "Unemployed";
  return getJobById(jobId)?.title || jobId;
}

export function getPartTimeJobById(jobId: string) {
  return partTimeJobOptions.find((job) => job.id === jobId) || null;
}

export function getPartTimeIncome(life: LifeStats) {
  return (life.partTimeJobs || []).reduce((total, jobId) => {
    const job = getPartTimeJobById(jobId);
    return total + (job?.pay || 0);
  }, 0);
}

function changeStress(life: LifeStats, amount: number) {
  return clamp((life.stress ?? 35) + amount);
}

function getHousingStatBonus(life: LifeStats) {
  const type = life.currentHousing?.type || "none";
  const yearlyCost = life.currentHousing?.yearlyCost || 0;

  if (type === "own") return { happiness: 4, stress: -4, reputation: 2 };
  if (type === "rent" && yearlyCost >= 30000) return { happiness: 3, stress: -3, reputation: 1 };
  if (type === "rent" && yearlyCost >= 12000) return { happiness: 2, stress: -2, reputation: 0 };
  if (type === "rent") return { happiness: 1, stress: -1, reputation: 0 };

  return { happiness: -2, stress: 3, reputation: 0 };
}

export function getBusinessTypeById(typeId: string) {
  return businessTypes.find((type) => type.id === typeId) || null;
}

export function getBusinessStageName(stage: number) {
  if (stage >= 6) return "Empire";
  if (stage >= 5) return "Major Brand";
  if (stage >= 4) return "Established Company";
  if (stage >= 3) return "Growing Company";
  if (stage >= 2) return "Small Business";
  if (stage >= 1) return "Side Hustle";
  return "No Business";
}

export function getBusinessRiskLabel(risk: number) {
  if (risk >= 80) return "Critical";
  if (risk >= 60) return "High";
  if (risk >= 35) return "Medium";
  return "Low";
}

function getBusinessPayroll(life: LifeStats) {
  if (life.business === "None") return 0;
  return Math.floor((life.businessEmployees || 0) * (12000 + Math.max(1, life.businessStage) * 2500));
}

function businessFromLife(life: LifeStats): OwnedBusiness | null {
  if (life.business === "None" || !life.activeBusinessId) return null;

  return {
    id: life.activeBusinessId,
    typeId: life.businessTypeId || "online-store",
    name: life.business,
    value: life.businessValue,
    stage: life.businessStage,
    employees: life.businessEmployees,
    revenue: life.businessRevenue,
    risk: life.businessRisk,
    productQuality: life.businessProductQuality || 0,
    brand: life.businessBrand || 0,
    management: life.businessManagement || 0,
    payroll: life.businessPayroll || 0,
    ownership: life.businessOwnership || 100,
  };
}

function applyBusinessToLife(life: LifeStats, business: OwnedBusiness | null): LifeStats {
  if (!business) {
    return {
      ...life,
      business: "None",
      businessTypeId: "none",
      businessValue: 0,
      businessStage: 0,
      businessEmployees: 0,
      businessRevenue: 0,
      businessRisk: 0,
      businessProductQuality: 0,
      businessBrand: 0,
      businessManagement: 0,
      businessPayroll: 0,
      businessOwnership: 100,
      activeBusinessId: "",
    };
  }

  return {
    ...life,
    business: business.name,
    businessTypeId: business.typeId,
    businessValue: business.value,
    businessStage: business.stage,
    businessEmployees: business.employees,
    businessRevenue: business.revenue,
    businessRisk: business.risk,
    businessProductQuality: business.productQuality,
    businessBrand: business.brand,
    businessManagement: business.management,
    businessPayroll: business.payroll,
    businessOwnership: business.ownership,
    activeBusinessId: business.id,
  };
}

function upsertActiveBusiness(life: LifeStats): LifeStats {
  const active = businessFromLife(life);
  if (!active) return { ...life, businesses: life.businesses || [] };

  const businesses = life.businesses || [];
  const exists = businesses.some((business) => business.id === active.id);

  return {
    ...life,
    businesses: exists
      ? businesses.map((business) => (business.id === active.id ? active : business))
      : [...businesses, active],
  };
}

function getBusinessStageFromValue(value: number) {
  if (value >= 5000000) return 6;
  if (value >= 1800000) return 5;
  if (value >= 650000) return 4;
  if (value >= 180000) return 3;
  if (value >= 45000) return 2;
  if (value > 0) return 1;
  return 0;
}

function getBusinessStrength(life: LifeStats) {
  return (
    (life.businessProductQuality || 0) * 0.35 +
    (life.businessBrand || 0) * 0.3 +
    (life.businessManagement || 0) * 0.25 +
    Math.min(100, (life.businessEmployees || 0) * 8) * 0.1
  );
}

function normalizeBusiness(life: LifeStats): LifeStats {
  if (life.business === "None") {
    return {
      ...life,
      businessTypeId: "none",
      businessStage: 0,
      businessEmployees: 0,
      businessRevenue: 0,
      businessRisk: 0,
      businessProductQuality: 0,
      businessBrand: 0,
      businessManagement: 0,
      businessPayroll: 0,
      businessOwnership: 100,
      activeBusinessId: "",
      businesses: life.businesses || [],
    };
  }

  return upsertActiveBusiness({
    ...life,
    activeBusinessId: life.activeBusinessId || `business-${life.age}-${life.businessesStarted || 1}`,
    businessStage: getBusinessStageFromValue(life.businessValue),
    businessPayroll: getBusinessPayroll(life),
    businessOwnership: life.businessOwnership || 100,
    businesses: life.businesses || [],
  });
}

export function getCurrentJob(life: LifeStats) {
  return getJobById(life.jobId);
}

export function getCurrentJobExperience(life: LifeStats) {
  if (life.jobId === "unemployed") return 0;
  return life.jobExperience[life.jobId] || 0;
}

export function dismissPopup(life: LifeStats) {
  return {
    ...life,
    popupMessage: null,
  };
}

export function getConditionMultiplier(condition: AssetCondition) {
  if (condition === "Excellent") return 1;
  if (condition === "Good") return 0.9;
  if (condition === "Fair") return 0.75;
  if (condition === "Poor") return 0.55;
  return 0.35;
}

function degradeCondition(condition: AssetCondition): AssetCondition {
  if (condition === "Excellent") return "Good";
  if (condition === "Good") return "Fair";
  if (condition === "Fair") return "Poor";
  return "Bad";
}

function improveCondition(condition: AssetCondition): AssetCondition {
  if (condition === "Bad") return "Fair";
  if (condition === "Poor") return "Good";
  if (condition === "Fair") return "Excellent";
  if (condition === "Good") return "Excellent";
  return "Excellent";
}

function getRentMultiplier(level: RentPriceLevel) {
  if (level === "Low") return 0.8;
  if (level === "High") return 1.25;
  return 1;
}

export function getAdjustedRentIncome(home: OwnedAsset) {
  if (home.type !== "home") return 0;

  return Math.max(
    0,
    Math.floor(
      (home.rentIncome || 0) *
        getConditionMultiplier(home.condition || "Good") *
        getRentMultiplier(home.rentPriceLevel || "Market")
    )
  );
}

export function getCarValue(life: LifeStats) {
  return (life.ownedCars || []).reduce(
    (total, car) => total + Math.floor(car.value * getConditionMultiplier(car.condition)),
    0
  );
}

export function getHomeValue(life: LifeStats) {
  return (life.ownedHomes || []).reduce(
    (total, home) => total + Math.floor(home.value * getConditionMultiplier(home.condition)),
    0
  );
}

export function getItemValue(life: LifeStats) {
  return (life.ownedItems || []).reduce(
    (total, item) => total + Math.floor(item.value * getConditionMultiplier(item.condition)),
    0
  );
}

export function getAssetValue(life: LifeStats) {
  return getCarValue(life) + getHomeValue(life) + getItemValue(life);
}

export function getAssetUpkeep(life: LifeStats) {
  return [...(life.ownedCars || []), ...(life.ownedHomes || []), ...(life.ownedItems || [])].reduce(
    (total, asset) => total + asset.upkeep,
    0
  );
}

export function getHousingCost(life: LifeStats) {
  return life.currentHousing?.yearlyCost || 0;
}

export function getDebtInterest(life: LifeStats) {
  return life.debt > 0 ? Math.floor(life.debt * 0.06) : 0;
}

export function getWorkPayPerClick(life: LifeStats) {
  return life.salary > 0 ? Math.floor(life.salary / ACTIONS_PER_YEAR) : 2500;
}

export function getBusinessIncomeEstimate(life: LifeStats) {
  return life.business === "None" ? 0 : Math.floor(life.businessRevenue * 0.22);
}

export function getPropertyManagerFees(life: LifeStats) {
  return (life.ownedHomes || []).reduce((total, home) => {
    if (!home.rentedOut || home.rentalStatus !== "Occupied") return total;
    if (!home.propertyManager?.enabled) return total;

    return total + Math.floor(getAdjustedRentIncome(home) * ((home.propertyManager.feePercent || 10) / 100));
  }, 0);
}

export function getRentalIncomeEstimate(life: LifeStats) {
  return (life.ownedHomes || []).reduce((total, home) => {
    if (!home.rentedOut || home.rentalStatus !== "Occupied") return total;

    const rent = getAdjustedRentIncome(home);
    const fee = home.propertyManager?.enabled
      ? Math.floor(rent * ((home.propertyManager.feePercent || 10) / 100))
      : 0;

    return total + Math.max(0, rent - fee);
  }, 0);
}

export function getEconomyBreakdown(life: LifeStats): EconomyBreakdown {
  const workPayPerClick = getWorkPayPerClick(life);
  const possibleWorkIncomePerYear = workPayPerClick * ACTIONS_PER_YEAR;

  const businessIncomeEstimate = getBusinessIncomeEstimate(life);
  const rentalIncomeEstimate = getRentalIncomeEstimate(life);
  const totalPassiveIncome = businessIncomeEstimate + rentalIncomeEstimate;

  const housingCost = getHousingCost(life);
  const assetUpkeep = getAssetUpkeep(life);
  const debtInterest = getDebtInterest(life);
  const propertyManagerFees = getPropertyManagerFees(life);
  const totalExpenses = housingCost + assetUpkeep + debtInterest + propertyManagerFees;

  const totalCarValue = getCarValue(life);
  const totalHomeValue = getHomeValue(life);
  const totalAssets = totalCarValue + totalHomeValue + getItemValue(life) + life.businessValue;

  const occupiedRentals = (life.ownedHomes || []).filter(
    (home) => home.rentedOut && home.rentalStatus === "Occupied"
  ).length;

  const vacantRentals = (life.ownedHomes || []).filter(
    (home) => home.rentedOut && home.rentalStatus !== "Occupied"
  ).length;

  return {
    workPayPerClick,
    possibleWorkIncomePerYear,
    businessIncomeEstimate,
    rentalIncomeEstimate,
    totalPassiveIncome,
    housingCost,
    assetUpkeep,
    debtInterest,
    propertyManagerFees,
    totalExpenses,
    totalAssets,
    totalCarValue,
    totalHomeValue,
    netPassiveYear: totalPassiveIncome - totalExpenses,
    occupiedRentals,
    vacantRentals,
  };
}

export function canApplyForJob(life: LifeStats, job: Job) {
  const hasDegree = job.requiredDegree
    ? life.completedDegrees.includes(job.requiredDegree)
    : true;

  const hasJobExperience = job.requiredJobId
    ? (life.jobExperience[job.requiredJobId] || 0) >=
      (job.requiredJobExperience || 1)
    : true;

  return (
    hasDegree &&
    hasJobExperience &&
    life.skills[job.track] >= job.requiredSkill &&
    life.educationLevel >= job.requiredEducationLevel &&
    life.intelligence >= job.requiredIntelligence &&
    life.charisma >= job.requiredCharisma &&
    life.discipline >= job.requiredDiscipline &&
    life.reputation >= job.requiredReputation
  );
}

function addMilestone(life: LifeStats, milestone: string) {
  if ((life.lifetimeMilestones || []).includes(milestone)) {
    return life.lifetimeMilestones || [];
  }

  return [milestone, ...(life.lifetimeMilestones || [])].slice(0, 50);
}

function signed(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

export function formatEventEffect(effect: LifeEventEffect) {
  const changes: string[] = [];

  if (effect.healthGain) changes.push(`Health ${signed(effect.healthGain)}`);
  if (effect.happinessGain) changes.push(`Happiness ${signed(effect.happinessGain)}`);
  if (effect.intelligenceGain) changes.push(`Intelligence ${signed(effect.intelligenceGain)}`);
  if (effect.charismaGain) changes.push(`Charisma ${signed(effect.charismaGain)}`);
  if (effect.disciplineGain) changes.push(`Discipline ${signed(effect.disciplineGain)}`);
  if (effect.reputationGain) changes.push(`Reputation ${signed(effect.reputationGain)}`);
  if (effect.luckGain) changes.push(`Luck ${signed(effect.luckGain)}`);
  if (effect.careerXpGain) changes.push(`Career XP ${signed(effect.careerXpGain)}`);
  if (effect.businessValueGain) changes.push(`Business Value ${signed(effect.businessValueGain)}`);
  if (effect.familyRelationshipGain) changes.push(`Family ${signed(effect.familyRelationshipGain)}`);
  if (effect.friendshipsGain) changes.push(`Friendships ${signed(effect.friendshipsGain)}`);
  if (effect.relationshipQualityGain) changes.push(`Relationship ${signed(effect.relationshipQualityGain)}`);
  if (effect.childrenGain) changes.push(`Children ${signed(effect.childrenGain)}`);

  if (effect.cashGain) {
    changes.push(
      effect.cashGain > 0
        ? `Cash +${formatMoney(effect.cashGain)}`
        : `Cash -${formatMoney(Math.abs(effect.cashGain))}`
    );
  }

  if (effect.debtGain) {
    changes.push(
      effect.debtGain > 0
        ? `Debt +${formatMoney(effect.debtGain)}`
        : `Debt -${formatMoney(Math.abs(effect.debtGain))}`
    );
  }

  if (effect.jobLoss) changes.push("Lose current job");
  if (effect.breakup) changes.push("Relationship ends");

  return changes.length > 0 ? changes.join(", ") : "No clear effect.";
}

function applyEventEffect(life: LifeStats, effect: LifeEventEffect): LifeStats {
  let updated: LifeStats = {
    ...life,
    health: clamp(life.health + (effect.healthGain || 0)),
    happiness: clamp(life.happiness + (effect.happinessGain || 0)),
    intelligence: clamp(life.intelligence + (effect.intelligenceGain || 0)),
    charisma: clamp(life.charisma + (effect.charismaGain || 0)),
    discipline: clamp(life.discipline + (effect.disciplineGain || 0)),
    reputation: clamp(life.reputation + (effect.reputationGain || 0)),
    luck: clamp(life.luck + (effect.luckGain || 0)),
    stress: clamp((life.stress ?? 35) + (effect.stressGain || 0)),
    familyRelationship: clamp(life.familyRelationship + (effect.familyRelationshipGain || 0)),
    friendships: clamp(life.friendships + (effect.friendshipsGain || 0)),
    relationshipQuality: clamp(life.relationshipQuality + (effect.relationshipQualityGain || 0)),
    children: Math.max(0, life.children + (effect.childrenGain || 0)),
    cash: life.cash + (effect.cashGain || 0),
    debt: Math.max(0, life.debt + (effect.debtGain || 0)),
    careerXp: Math.max(0, life.careerXp + (effect.careerXpGain || 0)),
    businessValue: Math.max(0, life.businessValue + (effect.businessValueGain || 0)),
  };

  if (effect.businessName) {
    updated = {
      ...updated,
      business: effect.businessName,
      businessTypeId: updated.businessTypeId || "custom",
      businessStage: Math.max(1, updated.businessStage),
      businessProductQuality: Math.max(updated.businessProductQuality || 0, 20),
      businessBrand: Math.max(updated.businessBrand || 0, 15),
      businessManagement: Math.max(updated.businessManagement || 0, 10),
      businessOwnership: updated.businessOwnership || 100,
      businessPayroll: getBusinessPayroll(updated),
      businessesStarted:
        life.business === "None" ? life.businessesStarted + 1 : life.businessesStarted,
    };
  }

  if (effect.businessValueSet !== undefined) {
    updated = {
      ...updated,
      businessValue: Math.max(0, effect.businessValueSet),
    };
  }

  if (effect.jobLoss) {
    updated = {
      ...updated,
      jobId: "unemployed",
      job: "Unemployed",
      jobTrack: "none",
      salary: 0,
      careerXp: 0,
    };
  }

  if (effect.breakup) {
    updated = {
      ...updated,
      relationshipStatus: "Single",
      partnerName: "",
      relationshipQuality: 0,
    };
  }

  return recalc(updated);
}

export function acceptLifeEvent(life: LifeStats) {
  const event = life.pendingLifeEvent;
  if (!event) return life;

  if (event.type === "promotion") {
    return chasePromotion({
      ...life,
      pendingLifeEvent: null,
    });
  }

  const affected = applyEventEffect(life, event.acceptEffect);
  const message = `${event.title}: You chose "${event.acceptLabel}". ${formatEventEffect(event.acceptEffect)}.`;

  return recalc({
    ...affected,
    pendingLifeEvent: null,
    popupMessage: message,
    yearNotes: addYearNote(affected, message),
    eventLog: addLog(affected, `Choice Event: ${message}`),
  });
}

export function declineLifeEvent(life: LifeStats) {
  const event = life.pendingLifeEvent;
  if (!event) return life;

  const affected = applyEventEffect(life, event.declineEffect);
  const message = `${event.title}: You chose "${event.declineLabel}". ${formatEventEffect(event.declineEffect)}.`;

  return recalc({
    ...affected,
    pendingLifeEvent: null,
    popupMessage: message,
    yearNotes: addYearNote(affected, message),
    eventLog: addLog(affected, `Choice Event: ${message}`),
  });
}

export function applyStudentLoan(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.studentLoanStatus === "approved") {
    return {
      ...life,
      popupMessage: `You already have an approved student loan limit of ${formatMoney(life.studentLoanLimit)}.`,
      yearNotes: addYearNote(life, "You already have an approved student loan."),
    };
  }

  const approvalChance =
    60 +
    Math.floor(life.intelligence / 10) +
    Math.floor(life.reputation / 12) -
    Math.floor(life.debt / 50000);

  if (randomBetween(1, 100) > approvalChance) {
    const denialReasons: string[] = [];

    if (life.debt >= 50000) {
      denialReasons.push("your current debt is already high");
    }

    if (life.reputation < 25) {
      denialReasons.push("your reputation is still low");
    }

    if (life.intelligence < 35) {
      denialReasons.push("your academic profile is not strong enough yet");
    }

    if (denialReasons.length === 0) {
      denialReasons.push("the bank considered the application too risky this year");
    }

    const reasonText = denialReasons.join(", ");

    return consumeAction({
      ...life,
      studentLoanStatus: "denied",
      popupMessage: `Your student loan application was denied because ${reasonText}. Improve your profile or reduce debt before applying again.`,
      yearNotes: addYearNote(life, `Student loan denied: ${reasonText}.`),
    });
  }

  const limit =
    50000 +
    life.educationLevel * 25000 +
    Math.floor(life.intelligence * 600) +
    Math.floor(life.reputation * 400);

  return consumeAction({
    ...life,
    studentLoanStatus: "approved",
    studentLoanLimit: limit,
    popupMessage: `Student loan approved. Limit: ${formatMoney(limit)}.`,
    yearNotes: addYearNote(life, `Student loan approved. Limit: ${formatMoney(limit)}.`),
  });
}

function paySchoolCost(life: LifeStats, cost: number) {
  const cashPayment = Math.min(Math.max(0, life.cash), cost);
  const remaining = cost - cashPayment;

  if (remaining <= 0) {
    return {
      ok: true,
      cash: life.cash - cashPayment,
      debt: life.debt,
      studentLoanUsed: life.studentLoanUsed,
      cashPayment,
      loanUsed: 0,
      message: "",
    };
  }

  if (life.studentLoanStatus !== "approved") {
    return {
      ok: false,
      cash: life.cash,
      debt: life.debt,
      studentLoanUsed: life.studentLoanUsed,
      cashPayment: 0,
      loanUsed: 0,
      message:
        "You cannot afford school and do not have an approved student loan.",
    };
  }

  const remainingLoan = Math.max(0, life.studentLoanLimit - life.studentLoanUsed);

  if (remaining > remainingLoan) {
    return {
      ok: false,
      cash: life.cash,
      debt: life.debt,
      studentLoanUsed: life.studentLoanUsed,
      cashPayment: 0,
      loanUsed: 0,
      message:
        "Your approved student loan is not large enough to cover this school payment.",
    };
  }

  return {
    ok: true,
    cash: life.cash - cashPayment,
    debt: life.debt + remaining,
    studentLoanUsed: life.studentLoanUsed + remaining,
    cashPayment,
    loanUsed: remaining,
    message: "",
  };
}

export function attendDegree(life: LifeStats, degree: DegreeProgram) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.completedDegrees.includes(degree.id)) {
    return {
      ...life,
      popupMessage: `You already completed ${degree.name}.`,
      yearNotes: addYearNote(life, `You already completed ${degree.name}.`),
    };
  }

  if (degree.requiredDegree && !life.completedDegrees.includes(degree.requiredDegree)) {
    return {
      ...life,
      popupMessage: `${degree.name} is locked. Complete ${getDegreeName(degree.requiredDegree)} first.`,
      yearNotes: addYearNote(life, `${degree.name} is locked.`),
    };
  }

  if (life.happiness < 10 || life.health < 10) {
    return {
      ...life,
      popupMessage: "Your health or happiness is too low to study right now.",
      yearNotes: addYearNote(life, "Your health or happiness is too low to study right now."),
    };
  }

  const oldProgress = getDegreeProgress(life, degree.id);
  const oldPaid = getDegreePaid(life, degree.id);

  const newProgress = Math.min(100, oldProgress + degree.progressGain);
  const targetPaid = Math.floor((degree.totalCost * newProgress) / 100);
  const cost = Math.max(0, targetPaid - oldPaid);

  const payment = paySchoolCost(life, cost);

  if (!payment.ok) {
    return {
      ...life,
      popupMessage: payment.message,
      yearNotes: addYearNote(life, payment.message),
    };
  }

  const completedNow = newProgress >= 100;

  let updated: LifeStats = {
    ...life,
    cash: payment.cash,
    debt: payment.debt,
    studentLoanUsed: payment.studentLoanUsed,
    activeDegreeId: degree.id,
    degreeProgress: {
      ...life.degreeProgress,
      [degree.id]: newProgress,
    },
    degreePaid: {
      ...life.degreePaid,
      [degree.id]: targetPaid,
    },
    happiness: clamp(life.happiness - Math.max(1, degree.happinessCost - 1)),
    stress: changeStress(life, Math.max(2, Math.floor(degree.happinessCost / 2))),
    intelligence: clamp(life.intelligence + degree.intelligenceGain),
    charisma: clamp(life.charisma + degree.charismaGain),
    discipline: clamp(life.discipline + degree.disciplineGain),
    reputation: clamp(life.reputation + degree.reputationGain),
    yearsStudied: life.yearsStudied + 1,
  };

  if (completedNow) {
    updated = {
      ...updated,
      education: degree.educationName,
      educationLevel: Math.max(updated.educationLevel, degree.educationLevelReward),
      completedDegrees: [...updated.completedDegrees, degree.id],
      skills: {
        ...updated.skills,
        [degree.skillReward]: Math.max(
          updated.skills[degree.skillReward],
          degree.skillGainOnComplete
        ),
      },
      lifetimeMilestones: addMilestone(updated, `Completed ${degree.name}`),
      popupMessage: `You completed ${degree.name}.`,
      yearNotes: addYearNote(updated, `You completed ${degree.name}.`),
    };
  } else {
    updated = {
      ...updated,
      yearNotes: addYearNote(
        updated,
        `You studied ${degree.name}. Progress: ${newProgress}/100.`
      ),
    };
  }

  return consumeAction(updated);
}

export function doLifeGrowth(life: LifeStats, action: LifeGrowthAction) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  return consumeAction({
    ...life,
    cash: life.cash - action.cashCost,
    health: clamp(life.health + action.healthGain),
    happiness: clamp(life.happiness + action.happinessGain),
    intelligence: clamp(life.intelligence + action.intelligenceGain),
    charisma: clamp(life.charisma + action.charismaGain),
    discipline: clamp(life.discipline + action.disciplineGain),
    reputation: clamp(life.reputation + action.reputationGain),
    stress: changeStress(life, -Math.max(1, Math.floor((action.healthGain + action.happinessGain + action.disciplineGain) / 4))),
    yearNotes: addYearNote(life, `${action.name}: ${action.description}`),
  });
}

export function doSelfImprovement(life: LifeStats, action: SelfImprovementAction) {
  return doLifeGrowth(life, action);
}

export function applyForJob(life: LifeStats, job: Job) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (!canApplyForJob(life, job)) {
    const missing = getJobMissingRequirements(life, job, getDegreeName, getJobName);

    return consumeAction({
      ...life,
      happiness: clamp(life.happiness - randomBetween(1, 4)),
      popupMessage: `Application denied. Missing: ${missing[0] || "requirements"}.`,
      yearNotes: addYearNote(life, `Application denied for ${job.title}.`),
    });
  }

  return consumeAction({
    ...life,
    jobId: job.id,
    job: job.title,
    jobTrack: job.track,
    salary: job.salary,
    careerLevel: Math.max(life.careerLevel + 1, job.requiredSkill),
    careerXp: 0,
    happiness: clamp(life.happiness + randomBetween(2, 6)),
    reputation: clamp(life.reputation + randomBetween(2, 5)),
    lifetimeMilestones: addMilestone(life, `Hired as ${job.title}`),
    popupMessage: `You got hired as ${job.title}. Salary: ${formatMoney(job.salary)}/year.`,
    yearNotes: addYearNote(life, `You got hired as ${job.title}.`),
  });
}

export function work(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const income = getWorkPayPerClick(life);
  const jobExperience =
    life.jobId === "unemployed"
      ? life.jobExperience
      : {
          ...life.jobExperience,
          [life.jobId]: (life.jobExperience[life.jobId] || 0) + 1,
        };

  return consumeAction({
    ...life,
    cash: life.cash + income,
    happiness: clamp(life.happiness - (life.jobId === "unemployed" ? randomBetween(0, 2) : randomBetween(1, 3))),
    stress: changeStress(life, life.jobId === "unemployed" ? randomBetween(2, 4) : randomBetween(4, 7)),
    discipline: clamp(life.discipline + randomBetween(1, 3)),
    careerXp: life.careerXp + (life.jobId === "unemployed" ? 5 : randomBetween(18, 30)),
    jobExperience,
    yearsWorked: life.yearsWorked + 1,
    yearNotes: addYearNote(life, `You worked and earned ${formatMoney(income)}.`),
  });
}
export function takePartTimeJob(life: LifeStats, jobId: string) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const job = getPartTimeJobById(jobId);

  if (!job) {
    return {
      ...life,
      popupMessage: "That part-time job does not exist.",
      yearNotes: addYearNote(life, "That part-time job does not exist."),
    };
  }

  if ((life.partTimeJobs || []).includes(jobId)) {
    return {
      ...life,
      popupMessage: `You already have ${job.name}.`,
      yearNotes: addYearNote(life, `You already have ${job.name}.`),
    };
  }

  if ((life.partTimeJobs || []).length >= 2) {
    return {
      ...life,
      popupMessage: "You can only have 2 part-time jobs at the same time.",
      yearNotes: addYearNote(life, "You can only have 2 part-time jobs at the same time."),
    };
  }

  return consumeAction({
    ...life,
    partTimeJobs: [...(life.partTimeJobs || []), jobId],
    happiness: clamp(life.happiness - 1),
    discipline: clamp(life.discipline + 2),
    stress: changeStress(life, 3),
    popupMessage: `You started a part-time job: ${job.name}.`,
    yearNotes: addYearNote(life, `You started a part-time job: ${job.name}.`),
  });
}

export function workPartTimeJobs(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const activeJobs = (life.partTimeJobs || [])
    .map((jobId) => getPartTimeJobById(jobId))
    .filter((job): job is PartTimeJob => !!job);

  if (activeJobs.length === 0) {
    return {
      ...life,
      popupMessage: "You need a part-time job before working part-time.",
      yearNotes: addYearNote(life, "You need a part-time job before working part-time."),
    };
  }

  if (life.partTimeWorkUsedThisYear) {
    return {
      ...life,
      popupMessage: "You already worked your part-time job(s) this year.",
      yearNotes: addYearNote(life, "You already worked your part-time job(s) this year."),
    };
  }

  const income = activeJobs.reduce((total, job) => total + job.pay, 0);
  const stressGain = activeJobs.reduce((total, job) => total + job.stressGain, 0);
  const happinessCost = activeJobs.reduce((total, job) => total + job.happinessCost, 0);
  const disciplineGain = activeJobs.reduce((total, job) => total + job.disciplineGain, 0);

  return consumeAction({
    ...life,
    cash: life.cash + income,
    partTimeWorkUsedThisYear: true,
    yearsWorked: life.yearsWorked + 1,
    careerXp: life.careerXp + 8 * activeJobs.length,
    discipline: clamp(life.discipline + disciplineGain),
    happiness: clamp(life.happiness - happinessCost),
    stress: changeStress(life, stressGain),
    yearNotes: addYearNote(life, `You worked your part-time job(s) and earned ${formatMoney(income)}.`),
  });
}

export function quitPartTimeJob(life: LifeStats, jobId: string) {
  const job = getPartTimeJobById(jobId);

  if (!job || !(life.partTimeJobs || []).includes(jobId)) {
    return {
      ...life,
      popupMessage: "You do not have that part-time job.",
      yearNotes: addYearNote(life, "You do not have that part-time job."),
    };
  }

  return recalc({
    ...life,
    partTimeJobs: (life.partTimeJobs || []).filter((id) => id !== jobId),
    stress: changeStress(life, -3),
    happiness: clamp(life.happiness + 1),
    popupMessage: `You quit ${job.name}.`,
    yearNotes: addYearNote(life, `You quit ${job.name}.`),
  });
}

export function quitFullTimeJob(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.jobId === "unemployed") {
    return {
      ...life,
      popupMessage: "You are already unemployed.",
      yearNotes: addYearNote(life, "You are already unemployed."),
    };
  }

  const oldJob = life.job;

  return consumeAction({
    ...life,
    jobId: "unemployed",
    job: "Unemployed",
    jobTrack: "none",
    salary: 0,
    stress: changeStress(life, -8),
    happiness: clamp(life.happiness - 2),
    popupMessage: `You quit your job as ${oldJob}.`,
    yearNotes: addYearNote(life, `You quit your job as ${oldJob}.`),
  });
}

export function focusAtWork(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.jobId === "unemployed") {
    return {
      ...life,
      popupMessage: "You need a job before building workplace performance.",
      yearNotes: addYearNote(life, "You need a job before building workplace performance."),
    };
  }

  return consumeAction({
    ...life,
    careerXp: life.careerXp + randomBetween(30, 48),
    discipline: clamp(life.discipline + randomBetween(2, 5)),
    stress: changeStress(life, randomBetween(2, 5)),
    happiness: clamp(life.happiness - randomBetween(0, 2)),
    yearNotes: addYearNote(life, "You focused hard at work and improved your promotion chances."),
  });
}


export function networkAtWork(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.jobId === "unemployed") {
    return {
      ...life,
      popupMessage: "You need a job before networking at work.",
      yearNotes: addYearNote(life, "You need a job before networking at work."),
    };
  }

  return consumeAction({
    ...life,
    careerXp: life.careerXp + randomBetween(12, 24),
    charisma: clamp(life.charisma + randomBetween(2, 5)),
    reputation: clamp(life.reputation + randomBetween(1, 3)),
    stress: changeStress(life, randomBetween(0, 2)),
    happiness: clamp(life.happiness + randomBetween(0, 3)),
    yearNotes: addYearNote(life, "You networked at work and built stronger career relationships."),
  });
}

export function takeVacation(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const cost = Math.max(1000, Math.floor(Math.max(life.salary, 25000) * 0.04));

  if (life.cash < cost) {
    return {
      ...life,
      popupMessage: `You need ${formatMoney(cost)} for a proper vacation.`,
      yearNotes: addYearNote(life, `You need ${formatMoney(cost)} for a proper vacation.`),
    };
  }

  return consumeAction({
    ...life,
    cash: life.cash - cost,
    stress: changeStress(life, -18),
    happiness: clamp(life.happiness + randomBetween(8, 14)),
    health: clamp(life.health + randomBetween(2, 5)),
    yearNotes: addYearNote(life, `You took a vacation and reduced stress. Cost: ${formatMoney(cost)}.`),
  });
}


export function chasePromotion(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const currentJob = getCurrentJob(life);

  if (!currentJob || life.jobId === "unemployed") {
    return {
      ...life,
      popupMessage: "You need a job before asking for a promotion.",
      yearNotes: addYearNote(life, "You need a job before asking for a promotion."),
    };
  }

  if (life.hasAskedPromotionThisYear) {
    return {
      ...life,
      popupMessage: "You already asked for a promotion this year.",
      yearNotes: addYearNote(life, "You already asked for a promotion this year."),
    };
  }

  if (!currentJob.nextJobId) {
    return consumeAction({
      ...life,
      hasAskedPromotionThisYear: true,
      popupMessage: "There is no higher role in this career path yet.",
      yearNotes: addYearNote(life, "There is no higher role in this career path yet."),
    });
  }

  const nextJob = getJobById(currentJob.nextJobId);

  if (!nextJob || !canApplyForJob(life, nextJob)) {
    return consumeAction({
      ...life,
      hasAskedPromotionThisYear: true,
      careerXp: life.careerXp + 10,
      happiness: clamp(life.happiness - 2),
      popupMessage: "Your boss denied the promotion. You are not ready yet.",
      yearNotes: addYearNote(life, "Your boss denied the promotion."),
    });
  }

  const chance =
    25 +
    Math.floor(life.discipline / 12) +
    Math.floor(life.reputation / 14) +
    Math.floor(life.careerXp / 14);

  if (randomBetween(1, 100) > chance) {
    return consumeAction({
      ...life,
      hasAskedPromotionThisYear: true,
      careerXp: life.careerXp + 15,
      happiness: clamp(life.happiness - 2),
      popupMessage: "Your boss denied the promotion this time.",
      yearNotes: addYearNote(life, "Your boss denied the promotion this time."),
    });
  }

  return consumeAction({
    ...life,
    hasAskedPromotionThisYear: true,
    jobId: nextJob.id,
    job: nextJob.title,
    jobTrack: nextJob.track,
    salary: nextJob.salary,
    careerLevel: Math.max(life.careerLevel + 1, nextJob.requiredSkill),
    careerXp: 0,
    reputation: clamp(life.reputation + 5),
    happiness: clamp(life.happiness + 4),
    lifetimeMilestones: addMilestone(life, `Promoted to ${nextJob.title}`),
    popupMessage: `Promotion success! You became ${nextJob.title}.`,
    yearNotes: addYearNote(life, `Promotion success! You became ${nextJob.title}.`),
  });
}

export function improveFamily(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  return consumeAction({
    ...life,
    familyRelationship: clamp(life.familyRelationship + randomBetween(6, 12)),
    happiness: clamp(life.happiness + randomBetween(3, 8)),
    stress: changeStress(life, -randomBetween(3, 7)),
    cash: life.cash - 250,
    yearNotes: addYearNote(life, "You spent quality time with family."),
  });
}

export function makeFriends(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  return consumeAction({
    ...life,
    friendships: clamp(life.friendships + randomBetween(5, 10)),
    socialCircle: Math.min(100, life.socialCircle + randomBetween(1, 3)),
    charisma: clamp(life.charisma + randomBetween(1, 3)),
    happiness: clamp(life.happiness + randomBetween(2, 6)),
    stress: changeStress(life, -randomBetween(2, 5)),
    cash: life.cash - 350,
    yearNotes: addYearNote(life, "You spent time making friends."),
  });
}

export function dateLife(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.relationshipStatus === "Single") {
    const chance = 25 + Math.floor(life.charisma / 4) + Math.floor(life.happiness / 8);

    if (randomBetween(1, 100) > chance) {
      return consumeAction({
        ...life,
        cash: life.cash - 400,
        charisma: clamp(life.charisma + 1),
        happiness: clamp(life.happiness - 2),
        stress: changeStress(life, 2),
        popupMessage: "The date did not go anywhere.",
        yearNotes: addYearNote(life, "The date did not go anywhere."),
      });
    }

    const names = ["Alex", "Taylor", "Jordan", "Morgan", "Casey", "Robin", "Sam"];

    return consumeAction({
      ...life,
      cash: life.cash - 500,
      relationshipStatus: "Dating",
      partnerName: names[randomBetween(0, names.length - 1)],
      relationshipQuality: randomBetween(35, 65),
      happiness: clamp(life.happiness + 8),
      stress: changeStress(life, -4),
      lifetimeMilestones: addMilestone(life, "Started dating someone"),
      popupMessage: "You started dating someone.",
      yearNotes: addYearNote(life, "You started dating someone."),
    });
  }

  return consumeAction({
    ...life,
    relationshipQuality: clamp(life.relationshipQuality + randomBetween(5, 12)),
    happiness: clamp(life.happiness + randomBetween(3, 8)),
    cash: life.cash - 700,
    yearNotes: addYearNote(life, `You spent time with ${life.partnerName}.`),
  });
}

export function proposeMarriage(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.relationshipStatus !== "Dating") {
    return {
      ...life,
      popupMessage: "You need to be dating someone before proposing.",
      yearNotes: addYearNote(life, "You need to be dating someone before proposing."),
    };
  }

  const chance = 25 + Math.floor(life.relationshipQuality / 2);

  if (randomBetween(1, 100) > chance) {
    return consumeAction({
      ...life,
      cash: life.cash - 2000,
      relationshipQuality: clamp(life.relationshipQuality - 10),
      happiness: clamp(life.happiness - 5),
      popupMessage: `${life.partnerName} said no.`,
      yearNotes: addYearNote(life, `${life.partnerName} said no.`),
    });
  }

  return consumeAction({
    ...life,
    cash: life.cash - 8000,
    relationshipStatus: "Married",
    relationshipQuality: clamp(life.relationshipQuality + 15),
    happiness: clamp(life.happiness + 10),
    reputation: clamp(life.reputation + 3),
    lifetimeMilestones: addMilestone(life, "Got married"),
    popupMessage: `You married ${life.partnerName}.`,
    yearNotes: addYearNote(life, `You married ${life.partnerName}.`),
  });
}

export function haveChild(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.relationshipStatus !== "Married") {
    return {
      ...life,
      popupMessage: "You need to be married before having kids.",
      yearNotes: addYearNote(life, "You need to be married before having kids."),
    };
  }

  const cost = 5000 + life.children * 3000;
  const childNames = ["Noah", "Emma", "Oliver", "Ella", "Lucas", "Mia", "Leo", "Sofia", "Aksel", "Nora"];
  const childName = childNames[(life.children + randomBetween(0, childNames.length - 1)) % childNames.length];

  return consumeAction({
    ...life,
    cash: life.cash - cost,
    children: life.children + 1,
    childrenNames: [...(life.childrenNames || []), childName],
    happiness: clamp(life.happiness + 8),
    stress: changeStress(life, 4),
    relationshipQuality: clamp(life.relationshipQuality + 5),
    lifetimeMilestones: addMilestone(life, `Had child #${life.children + 1}`),
    popupMessage: `You had a child named ${childName}.`,
    yearNotes: addYearNote(life, `You had a child named ${childName}. Cost: ${formatMoney(cost)}.`),
  });
}

export function rentHousing(life: LifeStats, option: HousingOption) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  return consumeAction({
    ...life,
    currentHousing: {
      type: "rent",
      name: option.name,
      yearlyCost: option.yearlyCost,
    },
    happiness: clamp(life.happiness + option.happinessBonus),
    reputation: clamp(life.reputation + option.reputationBonus),
    stress: changeStress(life, -Math.max(1, Math.floor(option.happinessBonus / 3))),
    popupMessage: `You rented ${option.name}.`,
    yearNotes: addYearNote(life, `You rented ${option.name}.`),
  });
}

export function moveOut(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  return consumeAction({
    ...life,
    currentHousing: {
      type: "none",
      name: "No housing selected",
      yearlyCost: 0,
    },
    happiness: clamp(life.happiness - 2),
    stress: changeStress(life, 2),
    popupMessage: "You moved out. Housing cost is now $0.",
    yearNotes: addYearNote(life, "You moved out. Housing cost is now $0."),
  });
}

export function buyCar(life: LifeStats, car: OwnedAsset) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.cash < car.value) {
    return {
      ...life,
      popupMessage: `You need ${formatMoney(car.value)} to buy ${car.name}.`,
      yearNotes: addYearNote(life, `You need ${formatMoney(car.value)} to buy ${car.name}.`),
    };
  }

  const boughtCar: OwnedAsset = {
    ...car,
    id: `${car.id}-${Date.now()}-${randomBetween(1000, 9999)}`,
    lastServicedAge: life.age,
  };

  return consumeAction({
    ...life,
    cash: life.cash - car.value,
    ownedCars: [boughtCar, ...(life.ownedCars || [])],
    happiness: clamp(life.happiness + car.happinessBonus),
    reputation: clamp(life.reputation + car.reputationBonus),
    lifetimeMilestones: addMilestone(life, `Bought ${car.name}`),
    popupMessage: `You bought ${car.name}.`,
    yearNotes: addYearNote(life, `You bought ${car.name}.`),
  });
}

export function buyItem(life: LifeStats, item: OwnedAsset) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.cash < item.value) {
    return {
      ...life,
      popupMessage: `You need ${formatMoney(item.value)} to buy ${item.name}.`,
      yearNotes: addYearNote(life, `You need ${formatMoney(item.value)} to buy ${item.name}.`),
    };
  }

  const boughtItem: OwnedAsset = {
    ...item,
    id: `${item.id}-${Date.now()}-${randomBetween(1000, 9999)}`,
    rentedOut: false,
    rentalStatus: "Vacant",
    rentPriceLevel: "Market",
    tenantName: "",
    tenantQuality: undefined,
    tenantYearsRemaining: 0,
    lastRentalEvent: "none",
    lastRentalEventMessage: "",
    propertyManager: {
      enabled: false,
      feePercent: 0,
    },
    lastServicedAge: life.age,
  };

  return consumeAction({
    ...life,
    cash: life.cash - item.value,
    ownedItems: [boughtItem, ...(life.ownedItems || [])],
    happiness: clamp(life.happiness + item.happinessBonus),
    reputation: clamp(life.reputation + item.reputationBonus),
    lifetimeMilestones: addMilestone(life, `Bought ${item.name}`),
    popupMessage: `You bought ${item.name}.`,
    yearNotes: addYearNote(life, `You bought ${item.name}.`),
  });
}

export function buyHome(life: LifeStats, home: OwnedAsset) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.cash < home.value) {
    return {
      ...life,
      popupMessage: `You need ${formatMoney(home.value)} to buy ${home.name}.`,
      yearNotes: addYearNote(life, `You need ${formatMoney(home.value)} to buy ${home.name}.`),
    };
  }

  const boughtHome: OwnedAsset = {
    ...home,
    id: `${home.id}-${Date.now()}-${randomBetween(1000, 9999)}`,
    rentedOut: false,
    rentalStatus: "Vacant",
    rentPriceLevel: "Market",
    tenantName: "",
    tenantQuality: undefined,
    tenantYearsRemaining: 0,
    lastRentalEvent: "none",
    lastRentalEventMessage: "",
    propertyManager: {
      enabled: false,
      feePercent: 0,
    },
    lastServicedAge: life.age,
  };

  return consumeAction({
    ...life,
    cash: life.cash - home.value,
    ownedHomes: [boughtHome, ...(life.ownedHomes || [])],
    currentHousing:
      life.currentHousing.type === "none"
        ? {
            type: "own",
            name: boughtHome.name,
            yearlyCost: 0,
            homeAssetId: boughtHome.id,
          }
        : life.currentHousing,
    happiness: clamp(life.happiness + home.happinessBonus),
    reputation: clamp(life.reputation + home.reputationBonus),
    lifetimeMilestones: addMilestone(life, `Bought ${home.name}`),
    popupMessage: `You bought ${home.name}.`,
    yearNotes: addYearNote(life, `You bought ${home.name}.`),
  });
}

export function liveInHome(life: LifeStats, homeId: string) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const home = life.ownedHomes.find((asset) => asset.id === homeId);

  if (!home) {
    return {
      ...life,
      popupMessage: "That home could not be found.",
      yearNotes: addYearNote(life, "That home could not be found."),
    };
  }

  if (home.rentedOut && home.rentalStatus === "Occupied") {
    return {
      ...life,
      popupMessage: "You cannot live in a home with a tenant.",
      yearNotes: addYearNote(life, "You cannot live in a home with a tenant."),
    };
  }

  const ownedHomes = life.ownedHomes.map((asset) =>
    asset.id === homeId
      ? {
          ...asset,
          rentedOut: false,
          rentalStatus: "Vacant" as const,
          tenantName: "",
          tenantQuality: undefined,
          tenantYearsRemaining: 0,
        }
      : asset
  );

  return consumeAction({
    ...life,
    ownedHomes,
    currentHousing: {
      type: "own",
      name: home.name,
      yearlyCost: 0,
      homeAssetId: home.id,
    },
    popupMessage: `You moved into ${home.name}.`,
    yearNotes: addYearNote(life, `You moved into ${home.name}.`),
  });
}

export function rentOutHome(life: LifeStats, homeId: string) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const home = life.ownedHomes.find((asset) => asset.id === homeId);

  if (!home) {
    return {
      ...life,
      popupMessage: "That home could not be found.",
      yearNotes: addYearNote(life, "That home could not be found."),
    };
  }

  if (life.currentHousing.homeAssetId === home.id) {
    return {
      ...life,
      popupMessage: "You cannot rent out the home you are currently living in.",
      yearNotes: addYearNote(life, "You cannot rent out the home you are currently living in."),
    };
  }

  const ownedHomes = life.ownedHomes.map((asset) =>
    asset.id === homeId
      ? {
          ...asset,
          rentedOut: true,
          rentalStatus: asset.rentalStatus || ("Vacant" as const),
          rentPriceLevel: asset.rentPriceLevel || ("Market" as const),
          lastRentalEvent: "none" as const,
          lastRentalEventMessage:
            "Property listed for rent. Find a tenant to start earning rent.",
        }
      : asset
  );

  return consumeAction({
    ...life,
    ownedHomes,
    popupMessage: `${home.name} is now listed for rent.`,
    yearNotes: addYearNote(life, `${home.name} is now listed for rent.`),
  });
}

export function stopRentingOutHome(life: LifeStats, homeId: string) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const ownedHomes = life.ownedHomes.map((asset) =>
    asset.id === homeId
      ? {
          ...asset,
          rentedOut: false,
          rentalStatus: "Vacant" as const,
          tenantName: "",
          tenantQuality: undefined,
          tenantYearsRemaining: 0,
          lastRentalEvent: "none" as const,
          lastRentalEventMessage: "Property removed from the rental market.",
        }
      : asset
  );

  return consumeAction({
    ...life,
    ownedHomes,
    popupMessage: "Property removed from the rental market.",
    yearNotes: addYearNote(life, "Property removed from the rental market."),
  });
}

export function setHomeRentPriceLevel(
  life: LifeStats,
  homeId: string,
  rentPriceLevel: RentPriceLevel
) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const ownedHomes = life.ownedHomes.map((home) =>
    home.id === homeId
      ? {
          ...home,
          rentPriceLevel,
        }
      : home
  );

  return consumeAction({
    ...life,
    ownedHomes,
    popupMessage: `Rent price set to ${rentPriceLevel}.`,
    yearNotes: addYearNote(life, `Rent price set to ${rentPriceLevel}.`),
  });
}

export function findTenant(life: LifeStats, homeId: string) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const home = life.ownedHomes.find((asset) => asset.id === homeId);

  if (!home) {
    return {
      ...life,
      popupMessage: "That home could not be found.",
      yearNotes: addYearNote(life, "That home could not be found."),
    };
  }

  if (!home.rentedOut) {
    return {
      ...life,
      popupMessage: "List this home for rent first.",
      yearNotes: addYearNote(life, "List this home for rent first."),
    };
  }

  if (home.rentalStatus === "Occupied") {
    return {
      ...life,
      popupMessage: "This home already has a tenant.",
      yearNotes: addYearNote(life, "This home already has a tenant."),
    };
  }

  const conditionBonus =
    home.condition === "Excellent"
      ? 18
      : home.condition === "Good"
        ? 10
        : home.condition === "Fair"
          ? 0
          : home.condition === "Poor"
            ? -16
            : -30;

  const rentBonus =
    home.rentPriceLevel === "Low"
      ? 12
      : home.rentPriceLevel === "High"
        ? -14
        : 0;

  const chance =
    55 +
    conditionBonus +
    rentBonus +
    Math.floor(life.reputation / 8) +
    life.skills.realEstate * 6;

  if (randomBetween(1, 100) > chance) {
    const ownedHomes = life.ownedHomes.map((asset) =>
      asset.id === homeId
        ? {
            ...asset,
            rentalStatus: "Vacant" as const,
            tenantName: "",
            tenantQuality: undefined,
            tenantYearsRemaining: 0,
            lastRentalEvent: "none" as const,
            lastRentalEventMessage:
              "You searched for a tenant, but the property stayed vacant.",
          }
        : asset
    );

    return consumeAction({
      ...life,
      ownedHomes,
      happiness: clamp(life.happiness - 1),
      popupMessage: `You did not find a tenant for ${home.name}.`,
      yearNotes: addYearNote(life, `You did not find a tenant for ${home.name}.`),
    });
  }

  const tenantNames = ["Alex", "Taylor", "Jordan", "Morgan", "Casey", "Robin", "Sam", "Jamie"];
  const roll = randomBetween(1, 100) + conditionBonus + Math.floor(life.reputation / 10);

  const tenantQuality: TenantQuality =
    roll >= 92
      ? "Excellent"
      : roll >= 75
        ? "Good"
        : roll >= 45
          ? "Average"
          : roll >= 22
            ? "Risky"
            : "Bad";

  const tenantName = tenantNames[randomBetween(0, tenantNames.length - 1)];
  const leaseYears = randomBetween(1, 4);
  const rent = getAdjustedRentIncome(home);

  const ownedHomes = life.ownedHomes.map((asset) =>
    asset.id === homeId
      ? {
          ...asset,
          rentalStatus: "Occupied" as const,
          tenantName,
          tenantQuality,
          tenantYearsRemaining: leaseYears,
          lastRentalEvent: "none" as const,
          lastRentalEventMessage: `${tenantName} moved in as a ${tenantQuality.toLowerCase()} tenant.`,
        }
      : asset
  );

  return consumeAction({
    ...life,
    ownedHomes,
    reputation: clamp(life.reputation + 1),
    lifetimeMilestones: addMilestone(life, "Found first tenant"),
    popupMessage: `${tenantName} moved into ${home.name}. Tenant quality: ${tenantQuality}. Estimated rent: ${formatMoney(rent)}/year.`,
    yearNotes: addYearNote(
      life,
      `You found a ${tenantQuality.toLowerCase()} tenant for ${home.name}.`
    ),
  });
}

export function enablePropertyManager(life: LifeStats, homeId: string) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const ownedHomes = life.ownedHomes.map((home) =>
    home.id === homeId
      ? {
          ...home,
          propertyManager: {
            enabled: true,
            feePercent: 10,
          },
        }
      : home
  );

  return consumeAction({
    ...life,
    ownedHomes,
    popupMessage:
      "Property manager hired. They take 10% of rent but reduce rental problems.",
    yearNotes: addYearNote(life, "Property manager hired."),
  });
}

export function disablePropertyManager(life: LifeStats, homeId: string) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const ownedHomes = life.ownedHomes.map((home) =>
    home.id === homeId
      ? {
          ...home,
          propertyManager: {
            enabled: false,
            feePercent: 0,
          },
        }
      : home
  );

  return consumeAction({
    ...life,
    ownedHomes,
    popupMessage: "Property manager removed.",
    yearNotes: addYearNote(life, "Property manager removed."),
  });
}

export function renovateHome(life: LifeStats, homeId: string) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const home = life.ownedHomes.find((asset) => asset.id === homeId);

  if (!home) {
    return {
      ...life,
      popupMessage: "That home could not be found.",
      yearNotes: addYearNote(life, "That home could not be found."),
    };
  }

  const cost =
    home.condition === "Bad"
      ? Math.floor(home.value * 0.12)
      : home.condition === "Poor"
        ? Math.floor(home.value * 0.08)
        : home.condition === "Fair"
          ? Math.floor(home.value * 0.05)
          : Math.floor(home.value * 0.03);

  if (life.cash < cost) {
    return {
      ...life,
      popupMessage: `You need ${formatMoney(cost)} to renovate ${home.name}.`,
      yearNotes: addYearNote(life, `You need ${formatMoney(cost)} to renovate ${home.name}.`),
    };
  }

  const ownedHomes = life.ownedHomes.map((asset) =>
    asset.id === homeId
      ? {
          ...asset,
          condition: improveCondition(asset.condition),
          lastServicedAge: life.age,
          value: Math.floor(asset.value * 1.04),
        }
      : asset
  );

  return consumeAction({
    ...life,
    cash: life.cash - cost,
    ownedHomes,
    happiness: clamp(life.happiness + 3),
    reputation: clamp(life.reputation + 1),
    popupMessage: `You renovated ${home.name}.`,
    yearNotes: addYearNote(life, `You renovated ${home.name}.`),
  });
}

export function serviceCar(life: LifeStats, carId: string) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const car = life.ownedCars.find((asset) => asset.id === carId);

  if (!car) {
    return {
      ...life,
      popupMessage: "That car could not be found.",
      yearNotes: addYearNote(life, "That car could not be found."),
    };
  }

  const cost =
    car.condition === "Bad"
      ? car.upkeep * 5
      : car.condition === "Poor"
        ? car.upkeep * 4
        : car.condition === "Fair"
          ? car.upkeep * 3
          : car.upkeep * 2;

  if (life.cash < cost) {
    return {
      ...life,
      popupMessage: `You need ${formatMoney(cost)} to service ${car.name}.`,
      yearNotes: addYearNote(life, `You need ${formatMoney(cost)} to service ${car.name}.`),
    };
  }

  const ownedCars = life.ownedCars.map((asset) =>
    asset.id === carId
      ? {
          ...asset,
          condition: improveCondition(asset.condition),
          lastServicedAge: life.age,
          value: Math.floor(asset.value * 1.02),
        }
      : asset
  );

  return consumeAction({
    ...life,
    cash: life.cash - cost,
    ownedCars,
    happiness: clamp(life.happiness + 2),
    popupMessage: `You serviced ${car.name}.`,
    yearNotes: addYearNote(life, `You serviced ${car.name}.`),
  });
}

export function sellCar(life: LifeStats, carId: string) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const car = life.ownedCars.find((asset) => asset.id === carId);

  if (!car) {
    return {
      ...life,
      popupMessage: "That car could not be found.",
      yearNotes: addYearNote(life, "That car could not be found."),
    };
  }

  const price = Math.floor(car.value * getConditionMultiplier(car.condition) * randomBetween(65, 95) * 0.01);

  return consumeAction({
    ...life,
    cash: life.cash + price,
    ownedCars: life.ownedCars.filter((asset) => asset.id !== carId),
    popupMessage: `You sold ${car.name} for ${formatMoney(price)}.`,
    yearNotes: addYearNote(life, `You sold ${car.name}.`),
  });
}

export function sellItem(life: LifeStats, itemId: string) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const item = (life.ownedItems || []).find((asset) => asset.id === itemId);

  if (!item) {
    return {
      ...life,
      popupMessage: "That item could not be found.",
      yearNotes: addYearNote(life, "That item could not be found."),
    };
  }

  const price = Math.floor(item.value * getConditionMultiplier(item.condition) * randomBetween(70, 105) * 0.01);

  return consumeAction({
    ...life,
    cash: life.cash + price,
    ownedItems: (life.ownedItems || []).filter((asset) => asset.id !== itemId),
    popupMessage: `You sold ${item.name} for ${formatMoney(price)}.`,
    yearNotes: addYearNote(life, `You sold ${item.name}.`),
  });
}

export function sellHome(life: LifeStats, homeId: string) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const home = life.ownedHomes.find((asset) => asset.id === homeId);

  if (!home) {
    return {
      ...life,
      popupMessage: "That home could not be found.",
      yearNotes: addYearNote(life, "That home could not be found."),
    };
  }

  const price = Math.floor(home.value * getConditionMultiplier(home.condition) * randomBetween(85, 120) * 0.01);

  return consumeAction({
    ...life,
    cash: life.cash + price,
    ownedHomes: life.ownedHomes.filter((asset) => asset.id !== homeId),
    currentHousing:
      life.currentHousing.homeAssetId === homeId
        ? {
            type: "none",
            name: "No housing selected",
            yearlyCost: 0,
          }
        : life.currentHousing,
    popupMessage: `You sold ${home.name} for ${formatMoney(price)}.`,
    yearNotes: addYearNote(life, `You sold ${home.name}.`),
  });
}

export function maintainAssets(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const upkeep = getAssetUpkeep(life);

  if (upkeep <= 0) {
    return {
      ...life,
      popupMessage: "You do not own any cars or homes yet.",
      yearNotes: addYearNote(life, "You do not own any cars or homes yet."),
    };
  }

  if (life.cash >= upkeep) {
    return consumeAction({
      ...life,
      cash: life.cash - upkeep,
      happiness: clamp(life.happiness + 3),
      reputation: clamp(life.reputation + 1),
      popupMessage: `You maintained your assets. Cost: ${formatMoney(upkeep)}.`,
      yearNotes: addYearNote(life, `You maintained your assets.`),
    });
  }

  return consumeAction({
    ...life,
    cash: 0,
    ownedCars: life.ownedCars.map((car) => ({
      ...car,
      condition: degradeCondition(car.condition),
    })),
    ownedHomes: life.ownedHomes.map((home) => ({
      ...home,
      condition: degradeCondition(home.condition),
    })),
    ownedItems: (life.ownedItems || []).map((item) => ({
      ...item,
      condition: item.itemCategory === "jewelry" || item.itemCategory === "collectible" ? item.condition : degradeCondition(item.condition),
    })),
    happiness: clamp(life.happiness - 5),
    reputation: clamp(life.reputation - 1),
    popupMessage:
      "You could not fully pay upkeep. Asset condition got worse.",
    yearNotes: addYearNote(life, "You could not fully pay upkeep. Asset condition got worse."),
  });
}

export function payDebt(life: LifeStats, percent = 25) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.debt <= 0) {
    return {
      ...life,
      popupMessage: "You do not have any debt to pay.",
      yearNotes: addYearNote(life, "You do not have any debt to pay."),
    };
  }

  if (life.cash <= 0) {
    return {
      ...life,
      popupMessage: "You need cash before you can pay debt.",
      yearNotes: addYearNote(life, "You need cash before you can pay debt."),
    };
  }

  const safePercent = Math.max(5, Math.min(100, percent));
  const targetPayment = Math.ceil(life.debt * (safePercent / 100));
  const payment = Math.min(life.cash, life.debt, targetPayment);

  return consumeAction({
    ...life,
    cash: life.cash - payment,
    debt: life.debt - payment,
    stress: changeStress(life, -Math.max(1, Math.floor(safePercent / 20))),
    popupMessage: `You paid ${formatMoney(payment)} toward your debt (${safePercent}%).`,
    yearNotes: addYearNote(life, `You paid ${formatMoney(payment)} toward your debt (${safePercent}%).`),
  });
}

export function getLoanLimit(life: LifeStats) {
  const salaryBase = Math.max(life.salary || 0, life.jobId === "unemployed" ? 12000 : 25000);
  const reputationBonus = life.reputation * 350;
  const educationBonus = life.educationLevel * 5000;
  return Math.max(5000, Math.floor(salaryBase * 2 + reputationBonus + educationBonus));
}

export function takeLoan(life: LifeStats, percent = 25) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const maxDebt = getLoanLimit(life);
  const remainingRoom = Math.max(0, maxDebt - life.debt);

  if (remainingRoom <= 0) {
    return {
      ...life,
      popupMessage: "The bank denied your loan. Your current debt is already too high compared to your income.",
      yearNotes: addYearNote(life, "The bank denied your loan because your debt is too high compared to income."),
    };
  }

  const safePercent = Math.max(10, Math.min(200, percent));
  const salaryBase = Math.max(life.salary || 0, life.jobId === "unemployed" ? 12000 : 25000);
  const requested = Math.floor(salaryBase * (safePercent / 100));
  const amount = Math.min(remainingRoom, Math.max(1000, requested));

  return consumeAction({
    ...life,
    cash: life.cash + amount,
    debt: life.debt + amount,
    stress: changeStress(life, Math.max(1, Math.floor(safePercent / 50))),
    popupMessage: `You took a loan for ${formatMoney(amount)} (${safePercent}% of yearly income base).`,
    yearNotes: addYearNote(life, `You took a loan for ${formatMoney(amount)} (${safePercent}% income base).`),
  });
}

export function selectBusiness(life: LifeStats, businessId: string) {
  const business = (life.businesses || []).find((item) => item.id === businessId);

  if (!business) {
    return {
      ...life,
      popupMessage: "That business could not be found.",
      yearNotes: addYearNote(life, "That business could not be found."),
    };
  }

  return recalc({
    ...applyBusinessToLife(life, business),
    popupMessage: `Now managing ${business.name}.`,
  });
}

export function startBusiness(life: LifeStats, typeId: string) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const businessType = getBusinessTypeById(typeId);

  if (!businessType) {
    return {
      ...life,
      popupMessage: "That business type does not exist.",
      yearNotes: addYearNote(life, "That business type does not exist."),
    };
  }

  if (life.cash < businessType.startCost) {
    return {
      ...life,
      popupMessage: `You need ${formatMoney(businessType.startCost)} to start ${businessType.name}.`,
      yearNotes: addYearNote(life, `You need ${formatMoney(businessType.startCost)} to start ${businessType.name}.`),
    };
  }

  const skillLevel = life.skills[businessType.skill] || 0;
  const startingValue = Math.floor(
    businessType.startCost * randomBetween(55, 115) * 0.01 +
      skillLevel * 2500 +
      life.reputation * 90
  );

  const businessId = `business-${life.age}-${life.businessesStarted + 1}-${randomBetween(1000, 9999)}`;

  const newBusiness: OwnedBusiness = {
    id: businessId,
    typeId: businessType.id,
    name: businessType.name,
    value: Math.max(1000, startingValue),
    stage: 1,
    employees: 0,
    revenue: Math.floor(randomBetween(2000, 7000) * businessType.revenuePotential),
    risk: clamp(businessType.risk + randomBetween(-6, 8)),
    productQuality: clamp(18 + skillLevel * 7 + randomBetween(0, 12)),
    brand: clamp(12 + Math.floor(life.reputation / 4) + randomBetween(0, 8)),
    management: clamp(10 + life.skills.business * 7 + randomBetween(0, 8)),
    payroll: 0,
    ownership: 100,
  };

  return consumeAction(
    recalc({
      ...applyBusinessToLife({
        ...upsertActiveBusiness(life),
        cash: life.cash - businessType.startCost,
        businesses: [...(upsertActiveBusiness(life).businesses || []), newBusiness],
        businessesStarted: life.businessesStarted + 1,
        stress: changeStress(life, 5),
        lifetimeMilestones: addMilestone(life, `Started ${businessType.name}`),
        popupMessage: `You started ${businessType.name}.`,
        yearNotes: addYearNote(life, `You started ${businessType.name}.`),
      }, newBusiness),
    })
  );
}

export function workOnBusiness(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.business === "None") {
    return {
      ...life,
      popupMessage: "Choose a business type before you start building.",
      yearNotes: addYearNote(life, "Choose a business type before you start building."),
    };
  }

  const businessType = getBusinessTypeById(life.businessTypeId) || businessTypes[0];
  const strength = getBusinessStrength(life);
  const skillLevel = life.skills[businessType.skill] || 0;

  const growth = Math.floor(
    (randomBetween(4000, 16000) +
      life.discipline * 70 +
      life.charisma * 45 +
      skillLevel * 1800 +
      life.businessEmployees * 2200 +
      strength * 120) *
      businessType.revenuePotential
  );

  const revenueGain = Math.floor((randomBetween(2500, 12000) + skillLevel * 800 + strength * 120) * businessType.revenuePotential);
  const newValue = life.businessValue + growth;

  return consumeAction(
    normalizeBusiness({
      ...life,
      businessValue: newValue,
      businessRevenue: life.businessRevenue + revenueGain,
      businessProductQuality: clamp((life.businessProductQuality || 0) + randomBetween(1, 4)),
      businessManagement: clamp((life.businessManagement || 0) + randomBetween(0, 3)),
      businessRisk: clamp(life.businessRisk + randomBetween(-3, 4)),
      reputation: clamp(life.reputation + randomBetween(1, 3)),
      stress: changeStress(life, randomBetween(3, 6)),
      popupMessage: `You worked on ${life.business}. Value grew by ${formatMoney(growth)}.`,
      yearNotes: addYearNote(life, `${life.business} grew by ${formatMoney(growth)}.`),
    })
  );
}

export function hireEmployee(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.business === "None") {
    return {
      ...life,
      popupMessage: "You need a business before hiring employees.",
      yearNotes: addYearNote(life, "You need a business before hiring employees."),
    };
  }

  const cost = 8000 + life.businessEmployees * 3500;

  if (life.cash < cost) {
    return {
      ...life,
      popupMessage: `You need ${formatMoney(cost)} to hire another employee.`,
      yearNotes: addYearNote(life, `You need ${formatMoney(cost)} to hire another employee.`),
    };
  }

  return consumeAction(
    normalizeBusiness({
      ...life,
      cash: life.cash - cost,
      businessEmployees: life.businessEmployees + 1,
      businessRevenue: life.businessRevenue + randomBetween(6000, 18000),
      businessValue: life.businessValue + randomBetween(12000, 35000),
      businessManagement: clamp((life.businessManagement || 0) + randomBetween(1, 4)),
      businessRisk: clamp(life.businessRisk + randomBetween(1, 6)),
      stress: changeStress(life, randomBetween(2, 5)),
      popupMessage: "You hired an employee. Payroll increased, but the business can scale faster.",
      yearNotes: addYearNote(life, "You hired an employee. Payroll increased."),
    })
  );
}

export function marketingCampaign(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.business === "None") {
    return {
      ...life,
      popupMessage: "You need a business before running marketing.",
      yearNotes: addYearNote(life, "You need a business before running marketing."),
    };
  }

  const cost = 5000 + life.businessStage * 3500 + Math.floor((life.businessBrand || 0) * 60);

  if (life.cash < cost) {
    return {
      ...life,
      popupMessage: `You need ${formatMoney(cost)} for a marketing campaign.`,
      yearNotes: addYearNote(life, `You need ${formatMoney(cost)} for a marketing campaign.`),
    };
  }

  const businessType = getBusinessTypeById(life.businessTypeId) || businessTypes[0];
  const successChance =
    38 +
    Math.floor(life.charisma / 4) +
    life.skills.marketing * 7 +
    life.businessStage * 5 +
    Math.floor((life.businessBrand || 0) / 6) -
    businessType.difficulty * 2;

  if (randomBetween(1, 100) > successChance) {
    return consumeAction(
      normalizeBusiness({
        ...life,
        cash: life.cash - cost,
        businessRisk: clamp(life.businessRisk + randomBetween(4, 12)),
        happiness: clamp(life.happiness - 2),
        stress: changeStress(life, randomBetween(2, 5)),
        popupMessage: "The marketing campaign failed and raised business risk.",
        yearNotes: addYearNote(life, "The marketing campaign failed."),
      })
    );
  }

  const valueGain = Math.floor(randomBetween(18000, 70000) * businessType.revenuePotential);
  const revenueGain = Math.floor(randomBetween(9000, 36000) * businessType.revenuePotential);

  return consumeAction(
    normalizeBusiness({
      ...life,
      cash: life.cash - cost,
      businessValue: life.businessValue + valueGain,
      businessRevenue: life.businessRevenue + revenueGain,
      businessBrand: clamp((life.businessBrand || 0) + randomBetween(5, 12)),
      businessRisk: clamp(life.businessRisk + randomBetween(1, 6)),
      reputation: clamp(life.reputation + randomBetween(2, 6)),
      stress: changeStress(life, randomBetween(2, 5)),
      popupMessage: `The campaign worked. Business value increased by ${formatMoney(valueGain)}.`,
      yearNotes: addYearNote(life, `Marketing campaign worked. Value +${formatMoney(valueGain)}.`),
    })
  );
}

export function improveProduct(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.business === "None") {
    return {
      ...life,
      popupMessage: "You need a business before improving the product.",
      yearNotes: addYearNote(life, "You need a business before improving the product."),
    };
  }

  const cost = 3500 + life.businessStage * 2500;

  if (life.cash < cost) {
    return {
      ...life,
      popupMessage: `You need ${formatMoney(cost)} to improve the product.`,
      yearNotes: addYearNote(life, `You need ${formatMoney(cost)} to improve the product.`),
    };
  }

  const qualityGain = randomBetween(5, 12);
  const valueGain = randomBetween(10000, 45000) + qualityGain * 1200;

  return consumeAction(
    normalizeBusiness({
      ...life,
      cash: life.cash - cost,
      businessProductQuality: clamp((life.businessProductQuality || 0) + qualityGain),
      businessValue: life.businessValue + valueGain,
      businessRevenue: life.businessRevenue + randomBetween(3000, 12000),
      businessRisk: clamp(life.businessRisk - randomBetween(1, 5)),
      stress: changeStress(life, randomBetween(2, 5)),
      yearNotes: addYearNote(life, `Improved product quality by ${qualityGain}.`),
      popupMessage: `Product improved. Quality +${qualityGain}.`,
    })
  );
}

export function trainEmployees(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.business === "None" || life.businessEmployees <= 0) {
    return {
      ...life,
      popupMessage: "You need employees before training the team.",
      yearNotes: addYearNote(life, "You need employees before training the team."),
    };
  }

  const cost = life.businessEmployees * 2500;

  if (life.cash < cost) {
    return {
      ...life,
      popupMessage: `You need ${formatMoney(cost)} to train the team.`,
      yearNotes: addYearNote(life, `You need ${formatMoney(cost)} to train the team.`),
    };
  }

  return consumeAction(
    normalizeBusiness({
      ...life,
      cash: life.cash - cost,
      businessManagement: clamp((life.businessManagement || 0) + randomBetween(6, 14)),
      businessRevenue: life.businessRevenue + randomBetween(5000, 18000),
      businessRisk: clamp(life.businessRisk - randomBetween(2, 7)),
      stress: changeStress(life, randomBetween(1, 4)),
      popupMessage: "Your team became more productive and easier to manage.",
      yearNotes: addYearNote(life, "You trained your employees."),
    })
  );
}

export function cutCosts(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.business === "None") {
    return {
      ...life,
      popupMessage: "You need a business before cutting costs.",
      yearNotes: addYearNote(life, "You need a business before cutting costs."),
    };
  }

  return consumeAction(
    normalizeBusiness({
      ...life,
      businessRevenue: Math.max(0, life.businessRevenue - randomBetween(0, 4000)),
      businessRisk: clamp(life.businessRisk - randomBetween(4, 10)),
      businessManagement: clamp((life.businessManagement || 0) + randomBetween(2, 6)),
      happiness: clamp(life.happiness - randomBetween(0, 2)),
      stress: changeStress(life, randomBetween(1, 4)),
      popupMessage: "You cleaned up costs and reduced business risk.",
      yearNotes: addYearNote(life, "You cut costs and reduced business risk."),
    })
  );
}

export function launchProduct(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.business === "None") {
    return {
      ...life,
      popupMessage: "You need a business before launching a product.",
      yearNotes: addYearNote(life, "You need a business before launching a product."),
    };
  }

  const businessType = getBusinessTypeById(life.businessTypeId) || businessTypes[0];
  const launchChance =
    25 +
    Math.floor((life.businessProductQuality || 0) / 3) +
    Math.floor((life.businessBrand || 0) / 4) +
    (life.skills[businessType.skill] || 0) * 5 -
    businessType.difficulty * 3;

  if (randomBetween(1, 100) <= launchChance) {
    const gain = Math.floor(randomBetween(30000, 130000) * businessType.revenuePotential);

    return consumeAction(
      normalizeBusiness({
        ...life,
        businessValue: life.businessValue + gain,
        businessRevenue: life.businessRevenue + Math.floor(gain * randomBetween(12, 32) * 0.01),
        businessBrand: clamp((life.businessBrand || 0) + randomBetween(4, 10)),
        businessRisk: clamp(life.businessRisk + randomBetween(4, 10)),
        stress: changeStress(life, randomBetween(5, 9)),
        popupMessage: `Product launch succeeded. Business value +${formatMoney(gain)}.`,
        yearNotes: addYearNote(life, `Product launch succeeded. Value +${formatMoney(gain)}.`),
      })
    );
  }

  const loss = randomBetween(8000, 30000);

  return consumeAction(
    normalizeBusiness({
      ...life,
      cash: life.cash - Math.min(life.cash, loss),
      businessRisk: clamp(life.businessRisk + randomBetween(8, 18)),
      businessBrand: clamp((life.businessBrand || 0) - randomBetween(2, 8)),
      stress: changeStress(life, randomBetween(6, 10)),
      popupMessage: `Product launch failed. You lost ${formatMoney(Math.min(life.cash, loss))}.`,
      yearNotes: addYearNote(life, "Product launch failed."),
    })
  );
}

export function seekInvestor(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.business === "None") {
    return {
      ...life,
      popupMessage: "You need a business before seeking investors.",
      yearNotes: addYearNote(life, "You need a business before seeking investors."),
    };
  }

  if ((life.businessOwnership || 100) <= 55) {
    return {
      ...life,
      popupMessage: "You have already sold too much ownership.",
      yearNotes: addYearNote(life, "You have already sold too much ownership."),
    };
  }

  const offer = Math.max(10000, Math.floor(life.businessValue * randomBetween(8, 18) * 0.01));
  const ownershipSold = randomBetween(8, 16);

  return consumeAction(
    normalizeBusiness({
      ...life,
      cash: life.cash + offer,
      businessOwnership: Math.max(40, (life.businessOwnership || 100) - ownershipSold),
      businessValue: life.businessValue + Math.floor(offer * 0.75),
      businessRisk: clamp(life.businessRisk - randomBetween(4, 10)),
      reputation: clamp(life.reputation + randomBetween(1, 4)),
      popupMessage: `Investor offer accepted: ${formatMoney(offer)} for ${ownershipSold}% ownership.`,
      yearNotes: addYearNote(life, `Investor invested ${formatMoney(offer)} for ${ownershipSold}% ownership.`),
    })
  );
}

export function sellBusiness(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.business === "None" || life.businessValue <= 0) {
    return {
      ...life,
      popupMessage: "You do not own a business to sell.",
      yearNotes: addYearNote(life, "You do not own a business to sell."),
    };
  }

  const price = Math.floor(life.businessValue * randomBetween(75, 115) * 0.01);
  const remainingBusinesses = (life.businesses || []).filter(
    (business) => business.id !== life.activeBusinessId
  );
  const nextBusiness = remainingBusinesses[0] || null;

  return consumeAction(
    recalc({
      ...applyBusinessToLife(
        {
          ...life,
          cash: life.cash + price,
          businesses: remainingBusinesses,
          lifetimeMilestones: addMilestone(life, `Sold a business for ${formatMoney(price)}`),
          popupMessage: `You sold ${life.business} for ${formatMoney(price)}.`,
          yearNotes: addYearNote(life, `You sold ${life.business} for ${formatMoney(price)}.`),
        },
        nextBusiness
      ),
    })
  );
}

export function invest(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const amount = Math.min(Math.max(0, life.cash), randomBetween(1000, 15000));

  if (amount <= 0) {
    return {
      ...life,
      popupMessage: "You had no money to invest.",
      yearNotes: addYearNote(life, "You had no money to invest."),
    };
  }

  const chance =
    30 +
    Math.floor(life.intelligence / 5) +
    Math.floor(life.luck / 6) +
    life.skills.finance * 4;

  if (randomBetween(1, 100) <= chance) {
    const profit = Math.floor(amount * randomBetween(15, 80) * 0.01);

    return consumeAction({
      ...life,
      cash: life.cash + profit,
      popupMessage: `Investment success. You made ${formatMoney(profit)}.`,
      yearNotes: addYearNote(life, `Investment success. You made ${formatMoney(profit)}.`),
    });
  }

  const loss = Math.floor(amount * randomBetween(20, 70) * 0.01);

  return consumeAction({
    ...life,
    cash: life.cash - loss,
    happiness: clamp(life.happiness - randomBetween(2, 6)),
    popupMessage: `Investment failed. You lost ${formatMoney(loss)}.`,
    yearNotes: addYearNote(life, `Investment failed. You lost ${formatMoney(loss)}.`),
  });
}

export function takeRisk(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const chance = 22 + Math.floor(life.luck / 4) + Math.floor(life.charisma / 8);

  if (randomBetween(1, 100) <= chance) {
    const reward = randomBetween(10000, 150000);

    return consumeAction({
      ...life,
      cash: life.cash + reward,
      riskTaken: life.riskTaken + 1,
      reputation: clamp(life.reputation + randomBetween(3, 10)),
      popupMessage: `Risk paid off. You gained ${formatMoney(reward)}.`,
      yearNotes: addYearNote(life, `Risk paid off. You gained ${formatMoney(reward)}.`),
    });
  }

  const loss = randomBetween(3000, 50000);

  return consumeAction({
    ...life,
    cash: life.cash - loss,
    riskTaken: life.riskTaken + 1,
    reputation: clamp(life.reputation - randomBetween(4, 15)),
    happiness: clamp(life.happiness - randomBetween(4, 12)),
    health: clamp(life.health - randomBetween(0, 7)),
    popupMessage: `Risk failed. You lost ${formatMoney(loss)}.`,
    yearNotes: addYearNote(life, `Risk failed. You lost ${formatMoney(loss)}.`),
  });
}

function processRentalEvents(life: LifeStats): LifeStats {
  let cash = life.cash;
  let happiness = life.happiness;
  let reputation = life.reputation;
  let eventLog = life.eventLog;

  const ownedHomes = life.ownedHomes.map((home) => {
    if (!home.rentedOut) return home;

    if (home.rentalStatus !== "Occupied" || !home.tenantName || !home.tenantQuality) {
      return {
        ...home,
        rentalStatus: "Vacant" as const,
        lastRentalEvent: "none" as RentalEventType,
        lastRentalEventMessage: `${home.name} is vacant and earned no rent this year.`,
      };
    }

    const rent = getAdjustedRentIncome(home);
    const managerEnabled = !!home.propertyManager?.enabled;
    const managerFee = managerEnabled
      ? Math.floor(rent * ((home.propertyManager?.feePercent || 10) / 100))
      : 0;

    const paymentChance =
      home.tenantQuality === "Excellent"
        ? 98
        : home.tenantQuality === "Good"
          ? 92
          : home.tenantQuality === "Average"
            ? 82
            : home.tenantQuality === "Risky"
              ? 64
              : 45;

    const damageChance =
      home.tenantQuality === "Excellent"
        ? 2
        : home.tenantQuality === "Good"
          ? 5
          : home.tenantQuality === "Average"
            ? 10
            : home.tenantQuality === "Risky"
              ? 22
              : 35;

    const moveOutChance =
      home.tenantQuality === "Excellent"
        ? 4
        : home.tenantQuality === "Good"
          ? 7
          : home.tenantQuality === "Average"
            ? 12
            : home.tenantQuality === "Risky"
              ? 20
              : 28;

    const managerProtection = managerEnabled ? 12 : 0;

    let updatedHome = { ...home };
    const paid = randomBetween(1, 100) <= Math.min(99, paymentChance + managerProtection);

    if (paid) {
      const received = Math.max(0, rent - managerFee);
      cash += received;
      updatedHome.lastRentalEvent = "paid";
      updatedHome.lastRentalEventMessage = `${home.tenantName} paid rent. You received ${formatMoney(received)}.`;
      eventLog = addLog(life, `Rental Event: ${updatedHome.lastRentalEventMessage}`);
    } else if (managerEnabled && randomBetween(1, 100) <= 45) {
      const recovered = Math.floor(Math.max(0, rent - managerFee) * 0.75);
      cash += recovered;
      updatedHome.lastRentalEvent = "manager_saved_problem";
      updatedHome.lastRentalEventMessage = `Your property manager handled a missed rent problem. You recovered ${formatMoney(recovered)}.`;
      eventLog = addLog(life, `Rental Event: ${updatedHome.lastRentalEventMessage}`);
    } else {
      happiness = clamp(happiness - 2);
      reputation = clamp(reputation - 1);
      updatedHome.lastRentalEvent = "missed_payment";
      updatedHome.lastRentalEventMessage = `${home.tenantName} missed rent.`;
      eventLog = addLog(life, `Rental Event: ${updatedHome.lastRentalEventMessage}`);
    }

    if (randomBetween(1, 100) <= Math.max(1, damageChance - managerProtection)) {
      updatedHome.condition = degradeCondition(updatedHome.condition);
      happiness = clamp(happiness - 2);
      updatedHome.lastRentalEvent = "damage";
      updatedHome.lastRentalEventMessage = `${home.tenantName} damaged the property. Condition dropped to ${updatedHome.condition}.`;
      eventLog = addLog(life, `Rental Event: ${updatedHome.lastRentalEventMessage}`);
    }

    const yearsLeft = Math.max(0, (updatedHome.tenantYearsRemaining || 1) - 1);
    const movedOut = yearsLeft <= 0 || randomBetween(1, 100) <= Math.max(2, moveOutChance - managerProtection);

    if (movedOut) {
      updatedHome = {
        ...updatedHome,
        rentalStatus: "Vacant",
        tenantName: "",
        tenantQuality: undefined,
        tenantYearsRemaining: 0,
        lastRentalEvent: "move_out",
        lastRentalEventMessage: `${home.tenantName} moved out. The property is now vacant.`,
      };
      eventLog = addLog(life, `Rental Event: ${updatedHome.lastRentalEventMessage}`);
    } else {
      updatedHome.tenantYearsRemaining = yearsLeft;
    }

    return updatedHome;
  });

  return {
    ...life,
    cash,
    happiness,
    reputation,
    ownedHomes,
    eventLog,
  };
}

function updateAssetValues(life: LifeStats): LifeStats {
  return {
    ...life,
    ownedCars: life.ownedCars.map((car) => {
      const yearsSinceService = life.age - (car.lastServicedAge || life.age);
      const condition = yearsSinceService >= 3 || randomBetween(1, 100) <= 18
        ? degradeCondition(car.condition)
        : car.condition;

      return {
        ...car,
        condition,
        value: Math.max(800, Math.floor(car.value * randomBetween(82, 94) * 0.01)),
      };
    }),
    ownedHomes: life.ownedHomes.map((home) => {
      const yearsSinceRenovation = life.age - (home.lastServicedAge || life.age);
      const condition = yearsSinceRenovation >= 4 || randomBetween(1, 100) <= 14
        ? degradeCondition(home.condition)
        : home.condition;

      return {
        ...home,
        condition,
        value: Math.max(25000, Math.floor(home.value * randomBetween(94, 99) * 0.01)),
      };
    }),
    ownedItems: (life.ownedItems || []).map((item) => {
      const category = item.itemCategory || "luxury";
      const valueMultiplier =
        category === "collectible"
          ? randomBetween(96, 112)
          : category === "jewelry"
            ? randomBetween(97, 106)
            : category === "clothing"
              ? randomBetween(78, 93)
              : randomBetween(88, 101);

      const condition = category === "clothing" && randomBetween(1, 100) <= 35
        ? degradeCondition(item.condition)
        : item.condition;

      return {
        ...item,
        condition,
        value: Math.max(100, Math.floor(item.value * valueMultiplier * 0.01)),
      };
    }),
  };
}

function payYearlyCosts(life: LifeStats): LifeStats {
  const debtInterest = getDebtInterest(life);
  let updated = {
    ...life,
    debt: life.debt + debtInterest,
  };

  const housingCost = getHousingCost(updated);

  if (housingCost > 0) {
    if (updated.cash >= housingCost) {
      updated = {
        ...updated,
        cash: updated.cash - housingCost,
      };
    } else {
      updated = {
        ...updated,
        cash: 0,
        happiness: clamp(updated.happiness - 5),
        health: clamp(updated.health - 2),
        reputation: clamp(updated.reputation - 1),
        eventLog: addLog(updated, "Unpaid Housing: You could not pay your yearly housing cost."),
      };
    }
  }

  const upkeep = getAssetUpkeep(updated);

  if (upkeep > 0) {
    if (updated.cash >= upkeep) {
      updated = {
        ...updated,
        cash: updated.cash - upkeep,
      };
    } else {
      updated = {
        ...updated,
        cash: 0,
        ownedCars: updated.ownedCars.map((car) => ({
          ...car,
          condition: degradeCondition(car.condition),
        })),
        ownedHomes: updated.ownedHomes.map((home) => ({
          ...home,
          condition: degradeCondition(home.condition),
        })),
        ownedItems: (updated.ownedItems || []).map((item) => ({
          ...item,
          condition: item.itemCategory === "jewelry" || item.itemCategory === "collectible" ? item.condition : degradeCondition(item.condition),
        })),
        happiness: clamp(updated.happiness - 5),
        reputation: clamp(updated.reputation - 1),
        eventLog: addLog(updated, "Asset Upkeep Missed: You could not pay upkeep. Asset condition got worse."),
      };
    }
  }

  return updated;
}

function crossed(before: number, after: number, target: number) {
  return before < target && after >= target;
}

function getYearGoalCompletions(before: LifeStats, after: LifeStats) {
  const goals: string[] = [];

  if (before.jobId === "unemployed" && after.jobId !== "unemployed") {
    goals.push("Get a full-time job");
  }

  if (crossed(before.netWorth, after.netWorth, 10000)) {
    goals.push("Reach $10,000 net worth");
  }

  if (crossed(before.netWorth, after.netWorth, 100000)) {
    goals.push("Reach $100,000 net worth");
  }

  if (crossed(before.netWorth, after.netWorth, 1000000)) {
    goals.push("Reach $1,000,000 net worth");
  }

  if ((before.ownedHomes || []).length === 0 && (after.ownedHomes || []).length > 0) {
    goals.push("Buy your first property");
  }

  if ((before.ownedCars || []).length === 0 && (after.ownedCars || []).length > 0) {
    goals.push("Buy your first vehicle");
  }

  if (before.business === "None" && after.business !== "None") {
    goals.push("Start your first business");
  }

  if ((before.completedDegrees || []).length === 0 && (after.completedDegrees || []).length > 0) {
    goals.push("Complete your first degree");
  }

  if (before.relationshipStatus !== "Married" && after.relationshipStatus === "Married") {
    goals.push("Get married");
  }

  if ((before.children || 0) === 0 && (after.children || 0) > 0) {
    goals.push("Have your first child");
  }

  if ((before.stress ?? 35) > 60 && (after.stress ?? 35) <= 40) {
    goals.push("Get stress under control");
  }

  return goals;
}

function getRandomChoiceEvent(life: LifeStats): LifeChoiceEvent | null {
  const events: LifeChoiceEvent[] = [
    {
      id: "family-request",
      type: "life",
      title: "Family Request",
      description: "A family member asks for financial help.",
      acceptLabel: "Help family",
      declineLabel: "Say no",
      acceptEffect: {
        cashGain: -1000,
        happinessGain: 6,
        familyRelationshipGain: 8,
      },
      declineEffect: {
        happinessGain: -2,
        familyRelationshipGain: -5,
      },
    },
    {
      id: "social-invite",
      type: "life",
      title: "Social Invite",
      description: "Friends invite you out.",
      acceptLabel: "Go out",
      declineLabel: "Stay home",
      acceptEffect: {
        cashGain: -400,
        happinessGain: 5,
        charismaGain: 2,
        friendshipsGain: 5,
        stressGain: -3,
      },
      declineEffect: {
        disciplineGain: 2,
        happinessGain: -1,
      },
    },
    {
      id: "unexpected-bill",
      type: "life",
      title: "Unexpected Bill",
      description: "A boring but expensive life bill shows up.",
      acceptLabel: "Pay it now",
      declineLabel: "Put it on debt",
      acceptEffect: {
        cashGain: -1200,
        disciplineGain: 1,
        stressGain: 2,
      },
      declineEffect: {
        debtGain: 1400,
        stressGain: 5,
        happinessGain: -2,
      },
    },
    {
      id: "lucky-side-cash",
      type: "life",
      title: "Lucky Opportunity",
      description: "A small opportunity appears through your network.",
      acceptLabel: "Take it",
      declineLabel: "Ignore it",
      acceptEffect: {
        cashGain: 1800,
        reputationGain: 1,
        stressGain: 2,
      },
      declineEffect: {
        disciplineGain: 1,
      },
    },
    {
      id: "health-check",
      type: "life",
      title: "Health Check",
      description: "You feel like your body needs some attention.",
      acceptLabel: "Take care of it",
      declineLabel: "Ignore it",
      acceptEffect: {
        cashGain: -600,
        healthGain: 6,
        stressGain: -2,
      },
      declineEffect: {
        healthGain: -5,
        stressGain: 4,
      },
    },
  ];

  if (life.business !== "None") {
    events.push({
      id: "business-crisis",
      type: "life",
      title: "Business Crisis",
      description: "Your business faces a serious problem.",
      acceptLabel: "Stabilize",
      declineLabel: "Risk it",
      acceptEffect: {
        cashGain: -5000,
        businessValueGain: 8000,
      },
      declineEffect: {
        businessValueGain: -randomBetween(5000, 25000),
        happinessGain: -3,
      },
    });
  }

  if (life.relationshipStatus !== "Single" && life.relationshipQuality < 15) {
    events.push({
      id: "breakup-risk",
      type: "life",
      title: "Breakup Risk",
      description: "Your relationship is falling apart.",
      acceptLabel: "Try to fix it",
      declineLabel: "Let it end",
      acceptEffect: {
        cashGain: -1200,
        relationshipQualityGain: 15,
        stressGain: -4,
      },
      declineEffect: {
        breakup: true,
        happinessGain: -8,
        stressGain: 8,
      },
    });
  }

  if (life.jobId !== "unemployed") {
    events.push({
      id: "overtime-offer",
      type: "life",
      title: "Overtime Offer",
      description: "Your boss offers extra overtime this year.",
      acceptLabel: "Work overtime",
      declineLabel: "Protect balance",
      acceptEffect: {
        cashGain: Math.max(1500, Math.floor(life.salary * 0.08)),
        careerXpGain: 25,
        stressGain: 8,
        happinessGain: -2,
      },
      declineEffect: {
        stressGain: -3,
        happinessGain: 2,
      },
    });
  }

  if ((life.ownedCars || []).length > 0) {
    events.push({
      id: "vehicle-repair",
      type: "life",
      title: "Vehicle Repair",
      description: "Your car needs unexpected maintenance.",
      acceptLabel: "Repair it",
      declineLabel: "Delay repair",
      acceptEffect: {
        cashGain: -1800,
        stressGain: -1,
      },
      declineEffect: {
        cashGain: -300,
        stressGain: 6,
        happinessGain: -2,
      },
    });
  }

  if ((life.ownedHomes || []).some((home) => home.rentedOut)) {
    events.push({
      id: "tenant-request",
      type: "life",
      title: "Tenant Request",
      description: "A tenant asks for a small repair and better follow-up.",
      acceptLabel: "Handle it well",
      declineLabel: "Ignore it",
      acceptEffect: {
        cashGain: -1500,
        reputationGain: 2,
        stressGain: -1,
      },
      declineEffect: {
        reputationGain: -2,
        stressGain: 5,
      },
    });
  }

  const filtered = events.filter((event) => event.id !== life.lastLifeEventId);
  return filtered[randomBetween(0, filtered.length - 1)] || null;
}

function getLowStatWarning(life: LifeStats) {
  if (life.health < 5) {
    return "Critical warning: Your health is below 5%. Use Life & Growth actions immediately or you may die soon.";
  }

  if (life.happiness < 5) {
    return "Critical warning: Your happiness is below 5%. Use Life & Growth or relationship actions immediately.";
  }

  return null;
}

function checkDeath(life: LifeStats) {
  let chance = 0;

  if (life.health <= 5) chance += 30;
  if (life.health <= 15) chance += 15;
  if (life.age >= 65) chance += 4;
  if (life.age >= 75) chance += 10;
  if (life.age >= 85) chance += 22;
  if (life.age >= 95) chance += 40;

  if (life.difficulty === "Hard") chance += 1;
  if (life.difficulty === "Brutal") chance += 3;

  if (randomBetween(1, 100) <= chance) {
    return {
      isDead: true,
      deathReason:
        life.health <= 15
          ? "Your health became too weak, and your life came to an end."
          : "You passed away after a long life.",
    };
  }

  return {
    isDead: false,
    deathReason: "",
  };
}

export function endYear(life: LifeStats) {
  const before = recalc(life);
  const previousLogLength = before.eventLog.length;

  let updated: LifeStats = {
    ...before,
    age: before.age + 1,
    hasAskedPromotionThisYear: false,
    popupMessage: null,
  };

  const grossBusinessIncome =
    updated.business !== "None"
      ? Math.floor(updated.businessRevenue * randomBetween(12, 38) * 0.01)
      : 0;
  const businessPayroll = getBusinessPayroll(updated);
  const businessIncome = Math.floor((grossBusinessIncome - businessPayroll) * ((updated.businessOwnership || 100) / 100));

  const yearlySalary = updated.jobId === "unemployed" ? 0 : Math.max(0, updated.salary || 0);
  const partTimeIncome = getPartTimeIncome(updated);
  const rentalIncomeBeforeCosts = getRentalIncomeEstimate(updated);

  updated = {
    ...updated,
    cash: updated.cash + yearlySalary + businessIncome + partTimeIncome,
    careerXp: updated.careerXp + (yearlySalary > 0 ? 12 : 0),
    businessPayroll,
    partTimeWorkUsedThisYear: false,
  };

  updated = processRentalEvents(updated);
  updated = payYearlyCosts(updated);
  updated = updateAssetValues(updated);

  const housingBonus = getHousingStatBonus(updated);
  const jobStress = updated.jobId === "unemployed" ? -2 : 4;
  const partTimeStress = (updated.partTimeJobs || []).length * 2;

  updated = {
    ...updated,
    happiness: clamp(updated.happiness + housingBonus.happiness),
    reputation: clamp(updated.reputation + housingBonus.reputation),
    stress: clamp((updated.stress ?? 35) - 7 + housingBonus.stress + jobStress + partTimeStress),
  };

  if (updated.business !== "None") {
    const businessType = getBusinessTypeById(updated.businessTypeId) || businessTypes[0];
    const strength = getBusinessStrength(updated);
    const yearlyValueChange = Math.floor(
      (updated.businessRevenue * randomBetween(4, 16) * 0.01 +
        strength * 150 +
        updated.businessEmployees * 1500 -
        updated.businessRisk * 120) *
        businessType.revenuePotential
    );

    updated = normalizeBusiness({
      ...updated,
      businessValue: Math.max(0, updated.businessValue + yearlyValueChange),
      businessRevenue: Math.max(
        0,
        updated.businessRevenue +
          Math.floor((strength - updated.businessRisk / 2) * 160) +
          randomBetween(-5000, 12000)
      ),
      businessRisk: clamp(
        updated.businessRisk +
          randomBetween(-4, 7) +
          (updated.businessEmployees > updated.businessManagement / 12 ? 2 : 0)
      ),
      eventLog: addLog(
        updated,
        `${updated.business}: yearly profit ${formatMoney(businessIncome)} after payroll ${formatMoney(businessPayroll)}.`
      ),
    });

    if (randomBetween(1, 100) <= 28) {
      const positive = randomBetween(1, 100) > updated.businessRisk;

      if (positive) {
        const boost = randomBetween(8000, 45000) + Math.floor(strength * 350);
        updated = normalizeBusiness({
          ...updated,
          businessValue: updated.businessValue + boost,
          businessBrand: clamp((updated.businessBrand || 0) + randomBetween(2, 7)),
          eventLog: addLog(updated, `Business Event: ${updated.business} got positive market attention. Value +${formatMoney(boost)}.`),
        });
      } else {
        const hit = randomBetween(5000, 35000);
        updated = normalizeBusiness({
          ...updated,
          businessValue: Math.max(0, updated.businessValue - hit),
          businessRisk: clamp(updated.businessRisk + randomBetween(4, 12)),
          eventLog: addLog(updated, `Business Event: ${updated.business} faced a setback. Value -${formatMoney(hit)}.`),
        });
      }
    }
  }

  if (updated.business !== "None" && updated.businessRisk >= 75) {
    const failChance = updated.businessRisk - 55;

    if (randomBetween(1, 100) <= failChance) {
      updated = {
        ...updated,
        businessValue: Math.max(1000, Math.floor(updated.businessValue * 0.55)),
        businessRevenue: Math.max(0, Math.floor(updated.businessRevenue * 0.7)),
        businessRisk: clamp(updated.businessRisk - randomBetween(15, 30)),
        businessBrand: clamp((updated.businessBrand || 0) - randomBetween(5, 12)),
        happiness: clamp(updated.happiness - 8),
        reputation: clamp(updated.reputation - 5),
        popupMessage: `${updated.business} survived a serious crisis, but lost value and revenue.`,
        eventLog: addLog(updated, `Business Crisis: ${updated.business} survived a serious crisis but lost value and revenue.`),
      };
    }
  }

  if (updated.jobId === "unemployed") {
    updated = {
      ...updated,
      happiness: clamp(updated.happiness - randomBetween(1, 3)),
    };
  }

  if (randomBetween(1, 100) <= 35 && !updated.pendingLifeEvent) {
    const event = getRandomChoiceEvent(updated);

    if (event) {
      updated = {
        ...updated,
        pendingLifeEvent: event,
        lastLifeEventId: event.id,
        eventLog: addLog(updated, `Choice Event: ${event.title}. ${event.description}`),
      };
    }
  }

  if (!updated.pendingLifeEvent) {
    const warning = getLowStatWarning(updated);

    if (warning) {
      updated = {
        ...updated,
        popupMessage: warning,
        eventLog: addLog(updated, warning),
      };
    }
  }

  const death = checkDeath(updated);

  updated = {
    ...updated,
    isDead: death.isDead,
    deathReason: death.deathReason,
  };

  if (updated.isDead) {
    updated = {
      ...updated,
      eventLog: addLog(updated, `Your life ended at age ${updated.age}. ${updated.deathReason}`),
    };
  }

  updated = {
    ...updated,
    eventLog: addLog(
      updated,
      `Age ${updated.age}: Salary ${formatMoney(yearlySalary)}. Business income ${formatMoney(businessIncome)}. Part-time income ${formatMoney(partTimeIncome)}. Rental income estimate ${formatMoney(rentalIncomeBeforeCosts)}.`
    ),
    actionsLeft: ACTIONS_PER_YEAR,
    yearNotes: [],
  };

  if (updated.netWorth >= 1000000) {
    updated = {
      ...updated,
      lifetimeMilestones: addMilestone(updated, "Reached $1,000,000 net worth"),
    };
  }

  const finalLife = recalc(updated);
  const goalsCompleted = getYearGoalCompletions(before, finalLife);
  const newEvents = finalLife.eventLog.slice(previousLogLength).slice(0, 8);
  const income = Math.max(0, yearlySalary + businessIncome + partTimeIncome + rentalIncomeBeforeCosts);
  const cashChange = finalLife.cash - before.cash;
  const estimatedExpenses = Math.max(0, income - cashChange);

  return {
    ...finalLife,
    lastYearRecap: {
      previousAge: before.age,
      newAge: finalLife.age,
      cashBefore: before.cash,
      cashAfter: finalLife.cash,
      cashChange,
      netWorthBefore: before.netWorth,
      netWorthAfter: finalLife.netWorth,
      netWorthChange: finalLife.netWorth - before.netWorth,
      stressBefore: before.stress ?? 35,
      stressAfter: finalLife.stress ?? 35,
      stressChange: (finalLife.stress ?? 35) - (before.stress ?? 35),
      happinessBefore: before.happiness,
      happinessAfter: finalLife.happiness,
      happinessChange: finalLife.happiness - before.happiness,
      income,
      expenses: estimatedExpenses,
      events: newEvents.length > 0 ? newEvents : [`You advanced from age ${before.age} to ${finalLife.age}.`],
      goalsCompleted,
    },
  };
}

export function getLegacyScore(life: LifeStats) {
  const ageScore = life.age * 15;
  const wealthScore = Math.floor(life.netWorth / 1000);
  const reputationScore = life.reputation * 40;
  const educationScore = life.educationLevel * 850;
  const degreeScore = life.completedDegrees.length * 900;
  const experienceScore =
    Object.values(life.jobExperience).reduce((total, value) => total + value, 0) * 120;
  const skillScore =
    Object.values(life.skills).reduce((total, value) => total + value, 0) * 300;
  const businessScore =
    life.businessesStarted * 250 +
    life.businessStage * 1200 +
    life.businessEmployees * 150;
  const jobScore = life.salary / 250 + life.careerLevel * 350;
  const relationshipScore =
    life.familyRelationship * 10 +
    life.friendships * 10 +
    life.relationshipQuality * 12 +
    life.children * 500;
  const assetScore = Math.floor(getAssetValue(life) / 2000);
  const rentalScore =
    life.ownedHomes.filter(
      (home) => home.rentedOut && home.rentalStatus === "Occupied"
    ).length * 900;
  const milestoneScore = life.lifetimeMilestones.length * 650;
  const riskScore = life.riskTaken * 45;
  const statScore =
    life.health +
    life.happiness +
    life.intelligence +
    life.charisma +
    life.discipline;

  const difficultyBonus =
    life.difficulty === "Brutal"
      ? 1.35
      : life.difficulty === "Hard"
        ? 1.2
        : life.difficulty === "Easy"
          ? 0.9
          : 1;

  return Math.max(
    0,
    Math.floor(
      (ageScore +
        wealthScore +
        reputationScore +
        educationScore +
        degreeScore +
        experienceScore +
        skillScore +
        businessScore +
        jobScore +
        relationshipScore +
        assetScore +
        rentalScore +
        milestoneScore +
        riskScore +
        statScore) *
        difficultyBonus
    )
  );
}

export function getLegacyRank(score: number) {
  if (score >= 50000) return "World-Class Legend";
  if (score >= 30000) return "Legendary Founder";
  if (score >= 18000) return "Empire Builder";
  if (score >= 10000) return "Self-Made Millionaire";
  if (score >= 6000) return "Successful Citizen";
  if (score >= 3000) return "Respectable Life";
  return "Forgotten Dreamer";
}