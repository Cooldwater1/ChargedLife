import { ACTIONS_PER_YEAR, MAX_ENERGY, MIN_ACTION_ENERGY, jobs } from "./data";
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
  ProductProjectStatus,
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
    startCost: 2500,
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
    startCost: 3500,
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
    startCost: 7500,
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
    startCost: 10000,
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
    startCost: 6000,
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
    startCost: 5000,
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
    startCost: 15000,
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

function getEnergyCost(life: LifeStats, baseCost = 15) {
  const stressPenalty = (life.stress ?? 35) >= 85 ? 4 : (life.stress ?? 35) >= 70 ? 2 : 0;
  const difficultyMultiplier =
    life.difficulty === "Easy"
      ? 0.55
      : life.difficulty === "Normal"
        ? 0.7
        : life.difficulty === "Hard"
          ? 0.9
          : 1;

  return Math.max(MIN_ACTION_ENERGY, Math.ceil((baseCost + stressPenalty) * difficultyMultiplier));
}

function consumeAction(life: LifeStats, energyCost = 15): LifeStats {
  const cost = getEnergyCost(life, energyCost);

  return recalc({
    ...life,
    energy: clamp((life.energy ?? MAX_ENERGY) - cost, 0, MAX_ENERGY),
    actionsLeft: Math.max(0, life.actionsLeft - 1),
  });
}

function noActions(life: LifeStats, energyCost = MIN_ACTION_ENERGY): LifeStats | null {
  const cost = getEnergyCost(life, energyCost);

  if ((life.energy ?? MAX_ENERGY) >= cost) return null;

  const note = `Too low on energy. Recover in Life & Growth or age up when ready.`;

  return {
    ...life,
    popupMessage: `You are too low on energy. Recover energy in Life & Growth or age up when ready.`,
    yearNotes: (life.yearNotes || []).includes(note)
      ? life.yearNotes
      : addYearNote(life, note),
  };
}

export function getActionsUsed(life: LifeStats) {
  return Math.max(0, ACTIONS_PER_YEAR - life.actionsLeft);
}

export function getEnergyStatus(life: LifeStats) {
  const energy = life.energy ?? MAX_ENERGY;
  if (energy >= 75) return "Fresh";
  if (energy >= 45) return "Okay";
  if (energy >= 20) return "Low";
  return "Exhausted";
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

type BusinessSpecialStatDefinition = {
  key: string;
  label: string;
  description: string;
};

type BusinessSpecificAction = {
  id: string;
  title: string;
  description: string;
  statKey: string;
  statGain: [number, number];
  valueGain: [number, number];
  revenueGain: [number, number];
  riskChange: [number, number];
  brandGain?: [number, number];
  qualityGain?: [number, number];
  managementGain?: [number, number];
  cashCost?: number;
  icon: string;
};

export function getBusinessSpecialStats(typeId: string): BusinessSpecialStatDefinition[] {
  if (typeId === "online-store") {
    return [
      { key: "products", label: "Products", description: "How many sellable product lines you have." },
      { key: "inventory", label: "Inventory", description: "Stock and fulfillment strength." },
      { key: "customerSatisfaction", label: "Customer Satisfaction", description: "Reviews, support, returns, and trust." },
      { key: "adPerformance", label: "Ad Performance", description: "How efficiently ads turn into sales." },
    ];
  }

  if (typeId === "marketing-agency") {
    return [
      { key: "clients", label: "Clients", description: "Active retainer/client base." },
      { key: "clientSatisfaction", label: "Client Satisfaction", description: "How happy clients are with results." },
      { key: "caseStudies", label: "Case Studies", description: "Proof that helps close better deals." },
      { key: "leadPipeline", label: "Lead Pipeline", description: "Future client opportunities." },
    ];
  }

  if (isProductBusinessType(typeId)) {
    return [];
  }

  if (typeId === "real-estate-company") {
    return [
      { key: "companyCash", label: "Deal Fund", description: "Cash inside the company for buying and renovating deals." },
      { key: "dealValue", label: "Deal Value", description: "Estimated market value of the current deal/project." },
      { key: "dealCondition", label: "Condition", description: "How strong the current property/project is." },
      { key: "managerQuality", label: "Manager Quality", description: "How well managers reduce vacancy and problems." },
    ];
  }

  return [
    { key: "traction", label: "Traction", description: "General business momentum." },
    { key: "customers", label: "Customers", description: "Customer base." },
    { key: "operations", label: "Operations", description: "How well the business runs." },
    { key: "marketFit", label: "Market Fit", description: "How strong the offer is." },
  ];
}

function getDefaultBusinessSpecialStats(typeId: string) {
  return getBusinessSpecialStats(typeId).reduce<Record<string, number>>((stats, stat, index) => {
    stats[stat.key] = typeId === "real-estate-company" && stat.key === "maintenanceBacklog" ? randomBetween(20, 45) : randomBetween(8 + index * 3, 24 + index * 6);
    return stats;
  }, {});
}

function getSpecialStatsFromLife(life: LifeStats) {
  const active = (life.businesses || []).find((business) => business.id === life.activeBusinessId);
  return active?.specialStats || getDefaultBusinessSpecialStats(life.businessTypeId || "online-store");
}

function updateSpecialStat(life: LifeStats, key: string, amount: number) {
  const current = getSpecialStatsFromLife(life);

  return {
    ...current,
    [key]: clamp((current[key] || 0) + amount),
  };
}

export function getBusinessSpecificActions(typeId: string): BusinessSpecificAction[] {
  if (typeId === "online-store") {
    return [
      { id: "add-product", title: "Add Product", description: "Launch another product line and increase catalog depth.", statKey: "products", statGain: [4, 10], valueGain: [9000, 28000], revenueGain: [5000, 18000], riskChange: [1, 5], qualityGain: [1, 3], icon: "📦", cashCost: 1500 },
      { id: "run-paid-ads", title: "Run Paid Ads", description: "Scale traffic through ads. Good ad performance matters.", statKey: "adPerformance", statGain: [5, 12], valueGain: [7000, 40000], revenueGain: [9000, 34000], riskChange: [2, 8], brandGain: [2, 6], icon: "📣", cashCost: 2500 },
      { id: "optimize-shipping", title: "Optimize Shipping", description: "Reduce delays, returns, and customer frustration.", statKey: "customerSatisfaction", statGain: [5, 12], valueGain: [6000, 22000], revenueGain: [2000, 10000], riskChange: [-8, -2], managementGain: [2, 5], icon: "🚚", cashCost: 2000 },
    ];
  }

  if (typeId === "marketing-agency") {
    return [
      { id: "find-client", title: "Find Client", description: "Prospect and close a new client contract.", statKey: "clients", statGain: [5, 12], valueGain: [8000, 35000], revenueGain: [9000, 30000], riskChange: [1, 5], brandGain: [1, 4], icon: "🤝" },
      { id: "create-case-study", title: "Create Case Study", description: "Turn results into proof that helps future sales.", statKey: "caseStudies", statGain: [6, 14], valueGain: [7000, 26000], revenueGain: [3000, 12000], riskChange: [-4, 1], brandGain: [4, 8], icon: "📊", cashCost: 1000 },
      { id: "improve-service", title: "Improve Service", description: "Increase client satisfaction and reduce churn.", statKey: "clientSatisfaction", statGain: [5, 13], valueGain: [6000, 24000], revenueGain: [3000, 15000], riskChange: [-7, -1], qualityGain: [2, 5], icon: "⭐" },
    ];
  }

  if (typeId === "mobile-app") {
    return [
      { id: "build-feature", title: "Build Feature", description: "Add a valuable feature to grow retention and users.", statKey: "users", statGain: [6, 16], valueGain: [15000, 65000], revenueGain: [5000, 26000], riskChange: [2, 8], qualityGain: [2, 6], icon: "🧩", cashCost: 3500 },
      { id: "fix-bugs", title: "Fix Bugs", description: "Improve app rating and reduce technical risk.", statKey: "appRating", statGain: [5, 12], valueGain: [8000, 28000], revenueGain: [2000, 12000], riskChange: [-10, -3], qualityGain: [2, 5], icon: "🐛", cashCost: 2500 },
      { id: "improve-monetization", title: "Improve Monetization", description: "Convert usage into revenue without killing trust.", statKey: "monetization", statGain: [5, 12], valueGain: [12000, 55000], revenueGain: [9000, 36000], riskChange: [1, 7], icon: "💳", cashCost: 2500 },
    ];
  }

  if (typeId === "game-studio") {
    return [
      { id: "develop-game", title: "Develop Game", description: "Build the game and improve its quality.", statKey: "gameQuality", statGain: [6, 15], valueGain: [14000, 60000], revenueGain: [2000, 16000], riskChange: [2, 8], qualityGain: [3, 8], icon: "🎮", cashCost: 3000 },
      { id: "release-demo", title: "Release Demo", description: "Get attention and build wishlists before launch.", statKey: "wishlist", statGain: [6, 18], valueGain: [10000, 50000], revenueGain: [3000, 18000], riskChange: [1, 7], brandGain: [3, 8], icon: "🎬", cashCost: 2500 },
      { id: "patch-game", title: "Patch Game", description: "Improve review score and bring players back.", statKey: "reviewScore", statGain: [5, 13], valueGain: [8000, 35000], revenueGain: [4000, 18000], riskChange: [-8, -2], qualityGain: [2, 6], icon: "🛠️", cashCost: 2000 },
    ];
  }

  if (typeId === "minecraft-server") {
    return [
      { id: "release-update", title: "Release Update", description: "Add content, improve player activity, and grow donations.", statKey: "players", statGain: [6, 16], valueGain: [12000, 55000], revenueGain: [6000, 26000], riskChange: [2, 8], qualityGain: [2, 5], icon: "🧱", cashCost: 2500 },
      { id: "host-event", title: "Host Event", description: "Bring players online and create community hype.", statKey: "communityTrust", statGain: [5, 14], valueGain: [9000, 40000], revenueGain: [4000, 22000], riskChange: [1, 6], brandGain: [2, 6], icon: "🏆", cashCost: 2000 },
      { id: "balance-economy", title: "Balance Economy", description: "Fix inflation, exploits, and unfair money loops.", statKey: "economyBalance", statGain: [6, 16], valueGain: [7000, 30000], revenueGain: [2000, 12000], riskChange: [-12, -4], managementGain: [2, 5], icon: "⚖️", cashCost: 1500 },
      { id: "improve-store", title: "Improve Store", description: "Improve monetization without making players angry.", statKey: "donations", statGain: [5, 13], valueGain: [10000, 45000], revenueGain: [8000, 32000], riskChange: [1, 7], icon: "🛒", cashCost: 1800 },
    ];
  }

  if (typeId === "roblox-game") {
    return [
      { id: "release-update", title: "Release Update", description: "Add content and increase visits/player retention.", statKey: "visits", statGain: [7, 18], valueGain: [14000, 70000], revenueGain: [5000, 28000], riskChange: [2, 8], qualityGain: [2, 6], icon: "🧱", cashCost: 2500 },
      { id: "improve-gamepass", title: "Improve Gamepass", description: "Increase Robux revenue with better premium offers.", statKey: "robuxRevenue", statGain: [5, 14], valueGain: [12000, 60000], revenueGain: [9000, 42000], riskChange: [1, 8], icon: "💎", cashCost: 2000 },
      { id: "improve-thumbnail", title: "Improve Thumbnail", description: "Better icon/thumbnail means better click-through.", statKey: "concurrentPlayers", statGain: [5, 13], valueGain: [9000, 38000], revenueGain: [4000, 20000], riskChange: [1, 5], brandGain: [3, 8], icon: "🖼️", cashCost: 1500 },
    ];
  }

  if (typeId === "real-estate-company") {
    return [
      { id: "find-property-deal", title: "Find Property Deal", description: "Source an undervalued deal or management contract.", statKey: "propertiesManaged", statGain: [4, 10], valueGain: [18000, 80000], revenueGain: [6000, 24000], riskChange: [2, 8], icon: "🏘️", cashCost: 4000 },
      { id: "manage-rentals", title: "Manage Rentals", description: "Improve contracts and cashflow stability.", statKey: "rentalContracts", statGain: [5, 12], valueGain: [12000, 55000], revenueGain: [6000, 26000], riskChange: [-6, 1], managementGain: [2, 6], icon: "📄", cashCost: 2500 },
      { id: "clear-maintenance", title: "Clear Maintenance", description: "Lower backlog and reduce long-term risk.", statKey: "maintenanceBacklog", statGain: [-12, -4], valueGain: [7000, 35000], revenueGain: [1000, 8000], riskChange: [-12, -4], managementGain: [2, 6], icon: "🔧", cashCost: 3000 },
      { id: "raise-capital", title: "Raise Capital", description: "Build investor trust and prepare bigger projects.", statKey: "investorTrust", statGain: [5, 14], valueGain: [15000, 70000], revenueGain: [2000, 12000], riskChange: [-6, 2], brandGain: [2, 6], icon: "🏦", cashCost: 1000 },
    ];
  }

  return [
    { id: "build-traction", title: "Build Traction", description: "Grow the business in a general way.", statKey: "traction", statGain: [5, 12], valueGain: [8000, 30000], revenueGain: [3000, 15000], riskChange: [0, 5], icon: "🚀" },
  ];
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
    specialStats: getSpecialStatsFromLife(life),
    project: getProjectFromLife(life),
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
    // Business-specific stats live inside the active business object.
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

export function getBusinessMilestones(typeId: string) {
  if (typeId === "online-store") {
    return [
      { id: "store-products-25", label: "Launch 25 products", statKey: "products", target: 25 },
      { id: "store-satisfaction-80", label: "Reach 80 customer satisfaction", statKey: "customerSatisfaction", target: 80 },
      { id: "store-revenue-100k", label: "Reach $100k revenue", statKey: "revenue", target: 100000 },
    ];
  }

  if (typeId === "marketing-agency") {
    return [
      { id: "agency-clients-10", label: "Sign 10 clients", statKey: "clients", target: 10 },
      { id: "agency-cases-25", label: "Build 25 case study power", statKey: "caseStudies", target: 25 },
      { id: "agency-satisfaction-85", label: "Reach 85 client satisfaction", statKey: "clientSatisfaction", target: 85 },
    ];
  }

  if (typeId === "mobile-app") {
    return [
      { id: "app-users-50", label: "Reach 50 user strength", statKey: "users", target: 50 },
      { id: "app-rating-80", label: "Reach 80 app rating", statKey: "appRating", target: 80 },
      { id: "app-monetization-60", label: "Reach 60 monetization", statKey: "monetization", target: 60 },
    ];
  }

  if (typeId === "game-studio") {
    return [
      { id: "studio-quality-80", label: "Reach 80 game quality", statKey: "gameQuality", target: 80 },
      { id: "studio-fanbase-60", label: "Reach 60 fanbase", statKey: "fanbase", target: 60 },
      { id: "studio-wishlist-70", label: "Reach 70 wishlist", statKey: "wishlist", target: 70 },
    ];
  }

  if (typeId === "minecraft-server") {
    return [
      { id: "mc-players-50", label: "Reach 50 player strength", statKey: "players", target: 50 },
      { id: "mc-trust-80", label: "Reach 80 community trust", statKey: "communityTrust", target: 80 },
      { id: "mc-donations-60", label: "Reach 60 donation strength", statKey: "donations", target: 60 },
      { id: "mc-economy-80", label: "Reach 80 economy balance", statKey: "economyBalance", target: 80 },
    ];
  }

  if (typeId === "roblox-game") {
    return [
      { id: "roblox-visits-70", label: "Reach 70 visit strength", statKey: "visits", target: 70 },
      { id: "roblox-ccu-50", label: "Reach 50 CCU strength", statKey: "concurrentPlayers", target: 50 },
      { id: "roblox-revenue-60", label: "Reach 60 Robux revenue", statKey: "robuxRevenue", target: 60 },
    ];
  }

  if (typeId === "real-estate-company") {
    return [
      { id: "realestate-properties-30", label: "Reach 30 managed property strength", statKey: "propertiesManaged", target: 30 },
      { id: "realestate-contracts-50", label: "Reach 50 rental contract strength", statKey: "rentalContracts", target: 50 },
      { id: "realestate-trust-70", label: "Reach 70 investor trust", statKey: "investorTrust", target: 70 },
    ];
  }

  return [
    { id: "business-value-100k", label: "Reach $100k business value", statKey: "value", target: 100000 },
  ];
}

export function getBusinessMilestoneProgress(business: OwnedBusiness) {
  return getBusinessMilestones(business.typeId).map((milestone) => {
    const value =
      milestone.statKey === "value"
        ? business.value
        : milestone.statKey === "revenue"
          ? business.revenue
          : business.specialStats?.[milestone.statKey] || 0;

    return {
      ...milestone,
      value,
      progress: Math.max(0, Math.min(100, Math.floor((value / milestone.target) * 100))),
      completed: value >= milestone.target,
    };
  });
}

function applySpecialStatToActiveBusiness(life: LifeStats, statKey: string, amount: number) {
  const specialStats = updateSpecialStat(life, statKey, amount);

  return {
    ...life,
    businesses: (life.businesses || []).map((business) =>
      business.id === life.activeBusinessId
        ? {
            ...business,
            specialStats,
          }
        : business
    ),
  };
}

function applyBusinessTypeYearlyEvent(life: LifeStats): LifeStats {
  if (life.business === "None" || randomBetween(1, 100) > 45) return life;

  const typeId = life.businessTypeId;
  const positive = randomBetween(1, 100) > life.businessRisk;
  let message = "";
  let statKey = "traction";
  let statChange = 0;
  let valueChange = 0;
  let revenueChange = 0;
  let riskChange = 0;
  let brandChange = 0;
  let qualityChange = 0;

  if (typeId === "minecraft-server") {
    statKey = positive ? "players" : "economyBalance";

    if (positive) {
      message = "A streamer joined your Minecraft server and brought new players.";
      statChange = randomBetween(6, 14);
      valueChange = randomBetween(12000, 60000);
      revenueChange = randomBetween(5000, 28000);
      brandChange = randomBetween(2, 6);
      riskChange = randomBetween(0, 5);
    } else {
      message = "A dupe exploit hurt your server economy and player trust.";
      statChange = -randomBetween(5, 14);
      valueChange = -randomBetween(8000, 35000);
      revenueChange = -randomBetween(2000, 14000);
      riskChange = randomBetween(5, 15);
    }
  } else if (typeId === "online-store") {
    statKey = positive ? "customerSatisfaction" : "inventory";

    if (positive) {
      message = "One of your products went viral and boosted store sales.";
      statChange = randomBetween(5, 12);
      valueChange = randomBetween(10000, 45000);
      revenueChange = randomBetween(8000, 36000);
      brandChange = randomBetween(2, 7);
    } else {
      message = "Supplier delays caused customer complaints and lost revenue.";
      statChange = -randomBetween(4, 12);
      valueChange = -randomBetween(6000, 26000);
      revenueChange = -randomBetween(4000, 18000);
      riskChange = randomBetween(4, 12);
    }
  } else if (typeId === "marketing-agency") {
    statKey = positive ? "clients" : "clientSatisfaction";

    if (positive) {
      message = "A referral brought in a valuable new client.";
      statChange = randomBetween(4, 10);
      valueChange = randomBetween(9000, 40000);
      revenueChange = randomBetween(8000, 30000);
      brandChange = randomBetween(2, 6);
    } else {
      message = "A client cancelled their retainer after weak campaign results.";
      statChange = -randomBetween(4, 12);
      valueChange = -randomBetween(7000, 30000);
      revenueChange = -randomBetween(6000, 22000);
      riskChange = randomBetween(4, 10);
    }
  } else if (typeId === "mobile-app") {
    statKey = positive ? "users" : "appRating";

    if (positive) {
      message = "An influencer recommended your app and user growth jumped.";
      statChange = randomBetween(6, 15);
      valueChange = randomBetween(15000, 70000);
      revenueChange = randomBetween(5000, 26000);
      brandChange = randomBetween(2, 7);
    } else {
      message = "A buggy update caused bad reviews and churn.";
      statChange = -randomBetween(5, 14);
      valueChange = -randomBetween(10000, 45000);
      revenueChange = -randomBetween(4000, 20000);
      riskChange = randomBetween(5, 13);
    }
  } else if (typeId === "game-studio") {
    statKey = positive ? "wishlist" : "reviewScore";

    if (positive) {
      message = "A demo clip gained attention and wishlists increased.";
      statChange = randomBetween(6, 16);
      valueChange = randomBetween(12000, 65000);
      revenueChange = randomBetween(3000, 20000);
      brandChange = randomBetween(3, 8);
    } else {
      message = "Early feedback criticized the game direction.";
      statChange = -randomBetween(4, 12);
      valueChange = -randomBetween(8000, 35000);
      revenueChange = -randomBetween(1000, 12000);
      riskChange = randomBetween(5, 12);
      qualityChange = -randomBetween(1, 5);
    }
  } else if (typeId === "roblox-game") {
    statKey = positive ? "visits" : "gameRating";

    if (positive) {
      message = "Your Roblox game gained traction from a popular video.";
      statChange = randomBetween(6, 16);
      valueChange = randomBetween(12000, 65000);
      revenueChange = randomBetween(6000, 30000);
      brandChange = randomBetween(2, 7);
    } else {
      message = "Players disliked the monetization and rating dropped.";
      statChange = -randomBetween(4, 12);
      valueChange = -randomBetween(8000, 35000);
      revenueChange = -randomBetween(3000, 18000);
      riskChange = randomBetween(5, 13);
    }
  } else if (typeId === "real-estate-company") {
    statKey = positive ? "investorTrust" : "maintenanceBacklog";

    if (positive) {
      message = "An investor offered better terms after seeing your property performance.";
      statChange = randomBetween(5, 13);
      valueChange = randomBetween(15000, 80000);
      revenueChange = randomBetween(4000, 24000);
      riskChange = -randomBetween(1, 6);
      brandChange = randomBetween(2, 6);
    } else {
      message = "Maintenance costs spiked and hurt cashflow.";
      statChange = randomBetween(5, 14);
      valueChange = -randomBetween(9000, 40000);
      revenueChange = -randomBetween(5000, 22000);
      riskChange = randomBetween(5, 13);
    }
  } else {
    message = positive ? "The business gained positive market attention." : "The business faced a market setback.";
    statChange = positive ? randomBetween(4, 10) : -randomBetween(4, 10);
    valueChange = positive ? randomBetween(8000, 35000) : -randomBetween(7000, 30000);
    revenueChange = positive ? randomBetween(3000, 18000) : -randomBetween(3000, 15000);
    riskChange = positive ? randomBetween(-3, 3) : randomBetween(4, 10);
  }

  const updated = applySpecialStatToActiveBusiness(
    {
      ...life,
      businessValue: Math.max(0, life.businessValue + valueChange),
      businessRevenue: Math.max(0, life.businessRevenue + revenueChange),
      businessRisk: clamp(life.businessRisk + riskChange),
      businessBrand: clamp((life.businessBrand || 0) + brandChange),
      businessProductQuality: clamp((life.businessProductQuality || 0) + qualityChange),
      eventLog: addLog(
        life,
        `Business Event: ${message} ${valueChange >= 0 ? "Value +" : "Value "}${formatMoney(valueChange)}.`
      ),
      yearNotes: addYearNote(life, `Business Event: ${message}`),
      popupMessage: message,
    },
    statKey,
    statChange
  );

  return normalizeBusiness(updated);
}

function addCompletedBusinessMilestones(life: LifeStats) {
  if (life.business === "None") return life;

  const activeBusiness = (life.businesses || []).find((business) => business.id === life.activeBusinessId);
  if (!activeBusiness) return life;

  const completed = getBusinessMilestoneProgress(activeBusiness).filter((milestone) => milestone.completed);
  let updated = life;

  completed.forEach((milestone) => {
    const milestoneText = `${life.business}: ${milestone.label}`;

    if (!updated.lifetimeMilestones.includes(milestoneText)) {
      updated = {
        ...updated,
        lifetimeMilestones: addMilestone(updated, milestoneText),
        reputation: clamp(updated.reputation + 2),
        eventLog: addLog(updated, `Business Milestone: ${milestoneText}. Reputation +2.`),
      };
    }
  });

  return updated;
}


export function isProductBusinessType(typeId: string) {
  return ["game-studio", "minecraft-server", "mobile-app", "roblox-game"].includes(typeId);
}

function getDefaultProductProject(typeId: string): ProductProjectStatus {
  return {
    phase: "concept",
    progress: 0,
    quality: 10,
    bugs: typeId === "minecraft-server" ? 35 : 28,
    hype: 0,
    updates: 0,
    releasedAge: 0,
    lastUpdatedAge: 0,
    launchScore: 0,
    activeUsers: 0,
    yearlyDecay: 0,
  };
}

function getProjectFromLife(life: LifeStats) {
  if (!isProductBusinessType(life.businessTypeId || "none")) return null;

  const active = (life.businesses || []).find((business) => business.id === life.activeBusinessId);
  return active?.project || getDefaultProductProject(life.businessTypeId || "game-studio");
}

function setActiveBusinessProject(life: LifeStats, project: ProductProjectStatus) {
  return {
    ...life,
    businesses: (life.businesses || []).map((business) =>
      business.id === life.activeBusinessId
        ? {
            ...business,
            project,
          }
        : business
    ),
  };
}

export function getProductProject(life: LifeStats) {
  return getProjectFromLife(life);
}

export function getProductProjectPhaseName(phase: ProductProjectStatus["phase"]) {
  if (phase === "concept") return "Concept";
  if (phase === "pre_production") return "Pre-Production";
  if (phase === "production") return "Production";
  if (phase === "post_production") return "Post-Production";
  return "Released / Live";
}

function getProductBusinessNoun(typeId: string) {
  if (typeId === "minecraft-server") return "server";
  if (typeId === "mobile-app") return "app";
  if (typeId === "roblox-game") return "Roblox game";
  if (typeId === "game-studio") return "game";
  return "project";
}

function getProductActionEnergy(actionId: string) {
  if (actionId === "project-plan") return 8;
  if (actionId === "project-build") return 14;
  if (actionId === "project-polish") return 12;
  if (actionId === "project-hype") return 10;
  if (actionId === "project-release") return 18;
  if (actionId === "project-update") return 14;
  return 12;
}

export function getProductLifecycleActions(life: LifeStats) {
  const project = getProjectFromLife(life);
  if (!project) return [];

  const noun = getProductBusinessNoun(life.businessTypeId);

  if (project.phase === "released") {
    return [
      {
        id: "project-update",
        icon: "🔄",
        title: `Release ${noun === "server" ? "Server Update" : "Update"}`,
        description: `Keep the ${noun} alive. Restores hype/users and slows revenue decay.`,
      },
      {
        id: "project-polish",
        icon: "🐛",
        title: "Fix Bugs",
        description: "Reduce bugs/exploit risk and protect reviews/trust.",
      },
      {
        id: "project-hype",
        icon: "📣",
        title: "Marketing Push",
        description: "Boost hype and bring attention back to the released product.",
      },
    ];
  }

  return [
    {
      id: "project-plan",
      icon: "🧠",
      title: project.phase === "concept" ? "Plan Concept" : "Improve Plan",
      description: "Improve market fit, direction, and lower future launch risk.",
    },
    {
      id: "project-build",
      icon: life.businessTypeId === "minecraft-server" ? "⛏️" : "🛠️",
      title:
        project.phase === "concept" || project.phase === "pre_production"
          ? "Start Production"
          : `Build ${noun}`,
      description: `Increase production progress and quality for the ${noun}.`,
    },
    {
      id: "project-polish",
      icon: "🐛",
      title: "Bug Fixing / Polish",
      description: "Reduce bugs and increase the chance of a good release.",
    },
    {
      id: "project-hype",
      icon: "📣",
      title: "Build Hype",
      description: "Market the project before release. Hype helps launch success.",
    },
    {
      id: "project-release",
      icon: "🚀",
      title: `Release ${noun}`,
      description: "Launch the project. Outcome depends on quality, hype, bugs, risk, luck, and skill.",
    },
  ];
}

export function doProductLifecycleAction(life: LifeStats, actionId: string) {
  const blocked = noActions(life, getProductActionEnergy(actionId));
  if (blocked) return blocked;

  if (life.business === "None" || !isProductBusinessType(life.businessTypeId)) {
    return {
      ...life,
      popupMessage: "This business does not use the product lifecycle system.",
      yearNotes: addYearNote(life, "This business does not use the product lifecycle system."),
    };
  }

  const project = getProjectFromLife(life) || getDefaultProductProject(life.businessTypeId);
  const cost =
    actionId === "project-release"
      ? 6000
      : actionId === "project-update"
        ? 3500
        : actionId === "project-build"
          ? 2500
          : actionId === "project-polish"
            ? 1800
            : actionId === "project-hype"
              ? 2200
              : 1000;

  if (life.cash < cost) {
    return consumeAction(
      normalizeBusiness({
        ...life,
        businessManagement: clamp((life.businessManagement || 0) + 1),
        businessRisk: clamp((life.businessRisk || 0) - 1),
        popupMessage: `You could not afford this lifecycle action (${formatMoney(cost)} needed), so you reviewed the project instead. Management +1, risk -1.`,
        yearNotes: addYearNote(life, `Lifecycle action was too expensive. You reviewed the project instead.`),
      }),
      6
    );
  }

  let nextProject: ProductProjectStatus = { ...project };
  let valueGain = 0;
  let revenueGain = 0;
  let riskChange = 0;
  let message = "";
  const noun = getProductBusinessNoun(life.businessTypeId);

  if (actionId === "project-plan") {
    nextProject = {
      ...nextProject,
      phase: nextProject.phase === "concept" ? "pre_production" : nextProject.phase,
      quality: clamp(nextProject.quality + randomBetween(2, 6)),
      progress: clamp(nextProject.progress + randomBetween(4, 10)),
      bugs: clamp(nextProject.bugs - randomBetween(1, 4)),
    };
    valueGain = randomBetween(1000, 8000);
    riskChange = -randomBetween(1, 4);
    message = `You improved planning for the ${noun}.`;
  } else if (actionId === "project-build") {
    const nextProgress = clamp(nextProject.progress + randomBetween(10, 22));
    nextProject = {
      ...nextProject,
      phase: nextProgress >= 75 ? "post_production" : "production",
      progress: nextProgress,
      quality: clamp(nextProject.quality + randomBetween(4, 10)),
      bugs: clamp(nextProject.bugs + randomBetween(0, 5)),
    };
    valueGain = randomBetween(6000, 28000);
    riskChange = randomBetween(0, 4);
    message = `You built major parts of the ${noun}.`;
  } else if (actionId === "project-polish") {
    nextProject = {
      ...nextProject,
      phase: nextProject.phase === "concept" ? "pre_production" : nextProject.phase,
      quality: clamp(nextProject.quality + randomBetween(2, 7)),
      bugs: clamp(nextProject.bugs - randomBetween(7, 16)),
      progress: clamp(nextProject.progress + randomBetween(2, 7)),
    };
    valueGain = randomBetween(3000, 18000);
    riskChange = -randomBetween(2, 7);
    message = `You fixed bugs and polished the ${noun}.`;
  } else if (actionId === "project-hype") {
    nextProject = {
      ...nextProject,
      hype: clamp(nextProject.hype + randomBetween(8, 18)),
    };
    valueGain = randomBetween(2000, 14000);
    riskChange = randomBetween(0, 3);
    message = `You built hype for the ${noun}.`;
  } else if (actionId === "project-update" && nextProject.phase === "released") {
    nextProject = {
      ...nextProject,
      updates: nextProject.updates + 1,
      lastUpdatedAge: life.age,
      hype: clamp(nextProject.hype + randomBetween(6, 16)),
      quality: clamp(nextProject.quality + randomBetween(2, 7)),
      bugs: clamp(nextProject.bugs + randomBetween(-8, 5)),
      yearlyDecay: Math.max(0, nextProject.yearlyDecay - randomBetween(8, 18)),
      activeUsers: clamp(nextProject.activeUsers + randomBetween(3, 12)),
    };
    valueGain = randomBetween(8000, 45000);
    revenueGain = randomBetween(3000, 26000);
    riskChange = randomBetween(-5, 4);
    message = `You released an update and kept the ${noun} alive.`;
  } else if (actionId === "project-release") {
    if (nextProject.phase === "released") {
      return {
        ...life,
        popupMessage: `The ${noun} is already released. Use updates to keep it alive.`,
        yearNotes: addYearNote(life, `The ${noun} is already released.`),
      };
    }

    if (nextProject.progress < 75) {
      return {
        ...life,
        popupMessage: `The ${noun} is not ready. Reach at least 75% progress before release.`,
        yearNotes: addYearNote(life, `The ${noun} is not ready for release.`),
      };
    }

    const skill = life.skills[getBusinessTypeById(life.businessTypeId)?.skill || "programming"] || 0;
    const launchScore =
      nextProject.quality +
      nextProject.hype * 0.7 +
      skill * 4 +
      life.luck * 0.45 -
      nextProject.bugs * 0.8 -
      life.businessRisk * 0.45 +
      randomBetween(-20, 30);

    const normalizedScore = Math.max(0, Math.floor(launchScore));
    const multiplier =
      normalizedScore >= 115
        ? 5.5
        : normalizedScore >= 90
          ? 3.2
          : normalizedScore >= 70
            ? 1.8
            : normalizedScore >= 50
              ? 0.9
              : 0.35;

    revenueGain = Math.floor(randomBetween(18000, 65000) * multiplier);
    valueGain = Math.floor(randomBetween(45000, 160000) * multiplier);
    riskChange = normalizedScore >= 70 ? -randomBetween(3, 10) : randomBetween(8, 20);

    nextProject = {
      ...nextProject,
      phase: "released",
      releasedAge: life.age,
      lastUpdatedAge: life.age,
      launchScore: normalizedScore,
      activeUsers: clamp(Math.floor(normalizedScore / 1.5)),
      yearlyDecay: normalizedScore >= 90 ? 6 : normalizedScore >= 70 ? 12 : 22,
      hype: clamp(nextProject.hype - randomBetween(5, 18)),
    };

    message =
      normalizedScore >= 115
        ? `Legendary launch! The ${noun} exploded in popularity.`
        : normalizedScore >= 90
          ? `Strong launch! The ${noun} found real traction.`
          : normalizedScore >= 70
            ? `Good launch. The ${noun} made money and gained users.`
            : normalizedScore >= 50
              ? `Weak launch. The ${noun} released, but reviews were mixed.`
              : `Bad launch. The ${noun} released too early and struggled.`;
  } else {
    return {
      ...life,
      popupMessage: "That lifecycle action is not available right now.",
      yearNotes: addYearNote(life, "That lifecycle action is not available right now."),
    };
  }

  return consumeAction(
    normalizeBusiness(
      setActiveBusinessProject(
        {
          ...life,
          cash: life.cash - cost,
          businessValue: Math.max(0, life.businessValue + valueGain),
          businessRevenue: Math.max(0, life.businessRevenue + revenueGain),
          businessRisk: clamp(life.businessRisk + riskChange),
          businessProductQuality: clamp((life.businessProductQuality || 0) + randomBetween(0, 3)),
          businessBrand: clamp((life.businessBrand || 0) + (actionId === "project-hype" ? randomBetween(2, 6) : randomBetween(0, 2))),
          stress: changeStress(life, randomBetween(3, 8)),
          popupMessage: `${message} ${valueGain > 0 ? `Value +${formatMoney(valueGain)}.` : ""}`,
          yearNotes: addYearNote(life, `${message} Cost ${formatMoney(cost)}.`),
        },
        nextProject
      )
    ),
    getProductActionEnergy(actionId)
  );
}

function applyProductLifecycleYearlyUpdate(life: LifeStats): LifeStats {
  if (life.business === "None" || !isProductBusinessType(life.businessTypeId)) return life;

  const project = getProjectFromLife(life);
  if (!project || project.phase !== "released") return life;

  const yearsSinceUpdate = project.lastUpdatedAge > 0 ? Math.max(0, life.age - project.lastUpdatedAge) : 0;
  const decay = Math.min(65, project.yearlyDecay + yearsSinceUpdate * 6);
  const retainedRevenue = Math.max(0.35, 1 - decay / 100);
  const revenueLoss = Math.floor(life.businessRevenue * (1 - retainedRevenue));
  const usersLoss = Math.floor(project.activeUsers * Math.min(0.4, decay / 180));
  const nextProject = {
    ...project,
    activeUsers: Math.max(0, project.activeUsers - usersLoss),
    hype: clamp(project.hype - randomBetween(3, 9)),
    yearlyDecay: Math.min(70, project.yearlyDecay + randomBetween(4, 10)),
  };

  return normalizeBusiness(
    setActiveBusinessProject(
      {
        ...life,
        businessRevenue: Math.max(0, life.businessRevenue - revenueLoss),
        businessRisk: clamp(life.businessRisk + (yearsSinceUpdate >= 2 ? randomBetween(3, 9) : randomBetween(0, 3))),
        eventLog: addLog(
          life,
          `${life.business}: released product needs updates. Revenue decay -${formatMoney(revenueLoss)}.`
        ),
      },
      nextProject
    )
  );
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
    popupMessage: `Student loan accepted. You were approved for ${formatMoney(limit)}. You can use this loan limit when paying for school.`,
    yearNotes: addYearNote(life, `Student loan accepted: approved for ${formatMoney(limit)}.`),
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
  const used = life.recoveryActionsUsed?.[action.id] || 0;

  if (action.isRecovery && action.maxUsesPerYear !== undefined && used >= action.maxUsesPerYear) {
    return {
      ...life,
      popupMessage: `${action.name} has already been used ${action.maxUsesPerYear} time(s) this year.`,
      yearNotes: addYearNote(life, `${action.name} is already used up this year.`),
    };
  }

  if (!action.isRecovery) {
    const blocked = noActions(life, Math.abs(action.energyChange || 12));
    if (blocked) return blocked;
  }

  const energyChange = action.energyChange || 0;
  const nextRecoveryUsed = action.isRecovery
    ? {
        ...(life.recoveryActionsUsed || {}),
        [action.id]: used + 1,
      }
    : life.recoveryActionsUsed || {};

  const updated = {
    ...life,
    cash: life.cash - action.cashCost,
    energy: clamp((life.energy ?? MAX_ENERGY) + energyChange, 0, MAX_ENERGY),
    recoveryActionsUsed: nextRecoveryUsed,
    health: clamp(life.health + action.healthGain),
    happiness: clamp(life.happiness + action.happinessGain),
    intelligence: clamp(life.intelligence + action.intelligenceGain),
    charisma: clamp(life.charisma + action.charismaGain),
    discipline: clamp(life.discipline + action.disciplineGain),
    reputation: clamp(life.reputation + action.reputationGain),
    stress: changeStress(life, action.stressChange || 0),
    yearNotes: addYearNote(
      life,
      `${action.name}: Energy ${energyChange >= 0 ? "+" : ""}${energyChange}, Stress ${(action.stressChange || 0) >= 0 ? "+" : ""}${action.stressChange || 0}.`
    ),
  };

  return action.isRecovery ? recalc(updated) : consumeAction(updated, Math.abs(action.energyChange || 12));
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
    specialStats: getDefaultBusinessSpecialStats(businessType.id),
    project: isProductBusinessType(businessType.id) ? getDefaultProductProject(businessType.id) : null,
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

export function getBusinessActionOutcome(life: LifeStats) {
  const skillId = getBusinessTypeById(life.businessTypeId)?.skill || "business";
  const skill = life.skills[skillId] || 0;
  const score =
    randomBetween(1, 100) +
    Math.floor(skill * 3.5) +
    Math.floor((life.businessManagement || 0) * 0.25) +
    Math.floor((life.businessProductQuality || 0) * 0.2) +
    Math.floor((life.businessBrand || 0) * 0.15) +
    Math.floor((life.luck || 0) * 0.25) -
    Math.floor((life.businessRisk || 0) * 0.55) -
    Math.floor((life.stress || 0) * 0.15);

  if (score >= 105) return { type: "great", label: "Great Success", multiplier: 1.65, riskExtra: -4 };
  if (score >= 78) return { type: "success", label: "Success", multiplier: 1, riskExtra: 0 };
  if (score >= 52) return { type: "mixed", label: "Mixed Result", multiplier: 0.45, riskExtra: 5 };
  if (score >= 28) return { type: "fail", label: "Failed", multiplier: -0.2, riskExtra: 10 };
  return { type: "critical", label: "Critical Failure", multiplier: -0.55, riskExtra: 18 };
}

function scaleBusinessRoll(base: number, multiplier: number) {
  return Math.floor(base * multiplier);
}

function formatMoneyChange(value: number) {
  return `${value >= 0 ? "+" : "-"}${formatMoney(Math.abs(value))}`;
}

export function doBusinessSpecificAction(life: LifeStats, actionId: string) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.business === "None") {
    return {
      ...life,
      popupMessage: "Start or select a business first.",
      yearNotes: addYearNote(life, "Start or select a business first."),
    };
  }

  const action = getBusinessSpecificActions(life.businessTypeId).find((item) => item.id === actionId);

  if (!action) {
    return {
      ...life,
      popupMessage: "That business action is not available for this business type.",
      yearNotes: addYearNote(life, "That business action is not available for this business type."),
    };
  }

  const cost = action.cashCost || 0;

  if (cost > 0 && life.cash < cost) {
    return consumeAction(
      normalizeBusiness({
        ...life,
        businessManagement: clamp((life.businessManagement || 0) + 1),
        businessRisk: clamp((life.businessRisk || 0) - 1),
        popupMessage: `You could not afford ${action.title} (${formatMoney(cost)} needed), so you reviewed the business instead. Management +1, risk -1.`,
        yearNotes: addYearNote(life, `${action.title} was too expensive. You reviewed the business instead.`),
      }),
      6
    );
  }

  const outcome = getBusinessActionOutcome(life);

  const rawStatGain = randomBetween(action.statGain[0], action.statGain[1]);
  const rawValueGain = randomBetween(action.valueGain[0], action.valueGain[1]);
  const rawRevenueGain = randomBetween(action.revenueGain[0], action.revenueGain[1]);
  const rawRiskChange = randomBetween(action.riskChange[0], action.riskChange[1]);

  const statGain = outcome.type === "critical" ? -Math.max(3, Math.floor(rawStatGain * 0.75)) : scaleBusinessRoll(rawStatGain, outcome.multiplier);
  const valueGain = scaleBusinessRoll(rawValueGain, outcome.multiplier);
  const revenueGain = scaleBusinessRoll(rawRevenueGain, outcome.multiplier);
  const riskChange = rawRiskChange + outcome.riskExtra;

  const qualityGain = action.qualityGain ? scaleBusinessRoll(randomBetween(action.qualityGain[0], action.qualityGain[1]), Math.max(0, outcome.multiplier)) : 0;
  const brandGain = action.brandGain ? scaleBusinessRoll(randomBetween(action.brandGain[0], action.brandGain[1]), Math.max(0, outcome.multiplier)) : 0;
  const managementGain = action.managementGain ? scaleBusinessRoll(randomBetween(action.managementGain[0], action.managementGain[1]), Math.max(0, outcome.multiplier)) : 0;

  const specialStats = updateSpecialStat(life, action.statKey, statGain);
  const outcomeMessage =
    outcome.type === "great"
      ? `${action.title}: Great success! The move worked better than expected.`
      : outcome.type === "success"
        ? `${action.title}: Success. The business improved.`
        : outcome.type === "mixed"
          ? `${action.title}: Mixed result. Some progress, but risk increased.`
          : outcome.type === "fail"
            ? `${action.title}: Failed. The action cost money and hurt momentum.`
            : `${action.title}: Critical failure. A serious mistake damaged the business.`;

  return consumeAction(
    normalizeBusiness({
      ...life,
      cash: life.cash - cost,
      businessValue: Math.max(0, life.businessValue + valueGain),
      businessRevenue: Math.max(0, life.businessRevenue + revenueGain),
      businessRisk: clamp(life.businessRisk + riskChange),
      businessProductQuality: clamp((life.businessProductQuality || 0) + qualityGain),
      businessBrand: clamp((life.businessBrand || 0) + brandGain),
      businessManagement: clamp((life.businessManagement || 0) + managementGain),
      stress: changeStress(life, randomBetween(2, 7)),
      reputation: clamp(life.reputation + (outcome.type === "great" ? 2 : outcome.type === "critical" ? -2 : 0)),
      businesses: (life.businesses || []).map((business) =>
        business.id === life.activeBusinessId
          ? {
              ...business,
              specialStats,
            }
          : business
      ),
      popupMessage: `${outcomeMessage} ${action.statKey} ${statGain >= 0 ? "+" : ""}${statGain}, value ${formatMoneyChange(valueGain)}, revenue ${formatMoneyChange(revenueGain)}, risk ${riskChange >= 0 ? "+" : ""}${riskChange}.`,
      yearNotes: addYearNote(life, `${life.business}: ${outcome.label}. Value ${formatMoneyChange(valueGain)}, revenue ${formatMoneyChange(revenueGain)}, risk ${riskChange >= 0 ? "+" : ""}${riskChange}.`),
    })
  );
}

function getRealEstateStats(life: LifeStats) {
  const stats = getSpecialStatsFromLife(life);

  return {
    companyCash: stats.companyCash || 0,
    currentDeal: stats.currentDeal || 0,
    dealPrice: stats.dealPrice || 0,
    dealValue: stats.dealValue || 0,
    dealCondition: stats.dealCondition || 0,
    dealRent: stats.dealRent || 0,
    dealRisk: stats.dealRisk || 0,
    ownedProject: stats.ownedProject || 0,
    renovationProgress: stats.renovationProgress || 0,
    rentalUnits: stats.rentalUnits || 0,
    rentedUnits: stats.rentedUnits || 0,
    managerQuality: stats.managerQuality || 0,
    flipProfit: stats.flipProfit || 0,
  };
}

function updateRealEstateStats(life: LifeStats, nextStats: Record<string, number>) {
  const current = getSpecialStatsFromLife(life);
  const specialStats = {
    ...current,
    ...nextStats,
  };

  return {
    ...life,
    businesses: (life.businesses || []).map((business) =>
      business.id === life.activeBusinessId
        ? {
            ...business,
            specialStats,
          }
        : business
    ),
  };
}

function requireRealEstateCompany(life: LifeStats) {
  if (life.business !== "None" && life.businessTypeId === "real-estate-company") return null;

  return {
    ...life,
    popupMessage: "You need to start or select a Real Estate Company first.",
    yearNotes: addYearNote(life, "You need a Real Estate Company for this action."),
  };
}

export function realEstateAddFunds(life: LifeStats, amount: number) {
  const blocked = requireRealEstateCompany(life);
  if (blocked) return blocked;

  if (life.cash < amount) {
    return {
      ...life,
      popupMessage: `You need ${formatMoney(amount)} cash to add that much to the deal fund.`,
      yearNotes: addYearNote(life, `Not enough cash to add ${formatMoney(amount)} to Real Estate fund.`),
    };
  }

  const stats = getRealEstateStats(life);

  return recalc(
    normalizeBusiness(
      updateRealEstateStats(
        {
          ...life,
          cash: life.cash - amount,
          businessValue: life.businessValue + Math.floor(amount * 0.8),
          popupMessage: `Added ${formatMoney(amount)} to your Real Estate Deal Fund. This money can now be used to buy, renovate, or manage property deals.`,
          yearNotes: addYearNote(life, `Real Estate fund +${formatMoney(amount)}.`),
        },
        {
          companyCash: stats.companyCash + amount,
        }
      )
    )
  );
}

export function realEstateFindDeal(life: LifeStats) {
  const blockedRealEstate = requireRealEstateCompany(life);
  if (blockedRealEstate) return blockedRealEstate;

  const blocked = noActions(life, 12);
  if (blocked) return blocked;

  const finderCost = 750;

  if (life.cash < finderCost) {
    return {
      ...life,
      popupMessage: `You need ${formatMoney(finderCost)} to search for property deals.`,
      yearNotes: addYearNote(life, "Not enough cash to search for real estate deals."),
    };
  }

  const price = randomBetween(45000, 180000);
  const undervalue = randomBetween(-35000, 65000);
  const value = Math.max(25000, price + undervalue);
  const condition = randomBetween(25, 78);
  const rent = Math.max(4500, Math.floor(value * randomBetween(5, 11) / 100));
  const risk = clamp(randomBetween(25, 85) + (condition < 40 ? 15 : 0));
  const stats = getRealEstateStats(life);
  const qualityText = value > price ? "undervalued" : "overpriced";

  return consumeAction(
    normalizeBusiness(
      updateRealEstateStats(
        {
          ...life,
          cash: life.cash - finderCost,
          businessRisk: clamp(life.businessRisk + randomBetween(0, 4)),
          popupMessage: `Found a ${qualityText} property deal. Price ${formatMoney(price)}, estimated value ${formatMoney(value)}, condition ${condition}/100, yearly rent potential ${formatMoney(rent)}, risk ${risk}/100. Decide if you want to buy it or search again.`,
          yearNotes: addYearNote(life, `Real Estate deal found: ${formatMoney(price)} price, ${formatMoney(value)} value.`),
        },
        {
          ...stats,
          currentDeal: 1,
          dealPrice: price,
          dealValue: value,
          dealCondition: condition,
          dealRent: rent,
          dealRisk: risk,
          renovationProgress: 0,
        }
      )
    ),
    12
  );
}

export function realEstateBuyDeal(life: LifeStats) {
  const blockedRealEstate = requireRealEstateCompany(life);
  if (blockedRealEstate) return blockedRealEstate;

  const blocked = noActions(life, 14);
  if (blocked) return blocked;

  const stats = getRealEstateStats(life);

  if (!stats.currentDeal) {
    return {
      ...life,
      popupMessage: "Find a property deal first.",
      yearNotes: addYearNote(life, "Find a property deal before buying."),
    };
  }

  if (stats.companyCash < stats.dealPrice) {
    return {
      ...life,
      popupMessage: `Your deal fund needs ${formatMoney(stats.dealPrice)} to buy this property. Add funds first.`,
      yearNotes: addYearNote(life, "Real Estate deal fund is too low to buy the deal."),
    };
  }

  return consumeAction(
    normalizeBusiness(
      updateRealEstateStats(
        {
          ...life,
          businessValue: Math.max(0, life.businessValue + stats.dealValue),
          businessRisk: clamp(life.businessRisk + Math.floor(stats.dealRisk / 8)),
          popupMessage: `Bought the property for ${formatMoney(stats.dealPrice)} using your Deal Fund. Next: renovate to improve value, rent it out for yearly revenue, or fix & flip for a risky one-time sale.`,
          yearNotes: addYearNote(life, `Bought Real Estate deal for ${formatMoney(stats.dealPrice)}.`),
        },
        {
          companyCash: stats.companyCash - stats.dealPrice,
          ownedProject: 1,
          currentDeal: 0,
          renovationProgress: 0,
          rentalUnits: 0,
          rentedUnits: 0,
        }
      )
    ),
    14
  );
}

export function realEstateRenovate(life: LifeStats) {
  const blockedRealEstate = requireRealEstateCompany(life);
  if (blockedRealEstate) return blockedRealEstate;

  const blocked = noActions(life, 16);
  if (blocked) return blocked;

  const stats = getRealEstateStats(life);

  if (!stats.ownedProject) {
    return {
      ...life,
      popupMessage: "Buy a property deal before renovating.",
      yearNotes: addYearNote(life, "No Real Estate project to renovate."),
    };
  }

  const cost = randomBetween(6000, 18000);

  if (stats.companyCash < cost) {
    return {
      ...life,
      popupMessage: `Your deal fund needs ${formatMoney(cost)} for this renovation.`,
      yearNotes: addYearNote(life, "Real Estate fund too low for renovation."),
    };
  }

  const progress = randomBetween(12, 28);
  const hiddenDamage = randomBetween(1, 100) <= stats.dealRisk - Math.floor(life.businessManagement / 4);
  const valueGain = hiddenDamage ? -randomBetween(2500, 12000) : randomBetween(12000, 42000);
  const conditionGain = hiddenDamage ? randomBetween(0, 4) : randomBetween(8, 18);

  return consumeAction(
    normalizeBusiness(
      updateRealEstateStats(
        {
          ...life,
          businessValue: Math.max(0, life.businessValue + valueGain),
          businessRisk: clamp(life.businessRisk + (hiddenDamage ? 10 : -4)),
          stress: changeStress(life, hiddenDamage ? 10 : 5),
          popupMessage: hiddenDamage
            ? `Renovation problem! Hidden damage was found. Fund -${formatMoney(cost)}, value ${formatMoneyChange(valueGain)}, risk +10.`
            : `Renovation improved the property. Deal Fund -${formatMoney(cost)}, estimated value +${formatMoney(valueGain)}. Better condition improves rent and flip odds.`,
          yearNotes: addYearNote(life, hiddenDamage ? "Real Estate renovation found hidden damage." : "Real Estate renovation improved the property."),
        },
        {
          companyCash: stats.companyCash - cost,
          renovationProgress: clamp(stats.renovationProgress + progress),
          dealCondition: clamp(stats.dealCondition + conditionGain),
        }
      )
    ),
    16
  );
}

export function realEstateRentProject(life: LifeStats) {
  const blockedRealEstate = requireRealEstateCompany(life);
  if (blockedRealEstate) return blockedRealEstate;

  const blocked = noActions(life, 12);
  if (blocked) return blocked;

  const stats = getRealEstateStats(life);

  if (!stats.ownedProject) {
    return {
      ...life,
      popupMessage: "Buy a property before renting it out.",
      yearNotes: addYearNote(life, "No Real Estate project to rent out."),
    };
  }

  const unitChance = stats.dealCondition + stats.renovationProgress + Math.floor(life.businessManagement / 2) + Math.floor(life.luck / 3) - stats.dealRisk;
  const success = randomBetween(1, 100) <= unitChance;
  const units = success ? randomBetween(1, 3) : 0;
  const revenueGain = success ? stats.dealRent * units : 0;

  return consumeAction(
    normalizeBusiness(
      updateRealEstateStats(
        {
          ...life,
          businessRevenue: Math.max(0, life.businessRevenue + revenueGain),
          businessRisk: clamp(life.businessRisk + (success ? -3 : 8)),
          popupMessage: success
            ? `Tenant search succeeded. You rented out ${units} unit(s). Yearly business revenue +${formatMoney(revenueGain)}.`
            : "Tenant search failed. The property stayed vacant this year, so it produced no rental income and risk increased.",
          yearNotes: addYearNote(life, success ? `Real Estate rented ${units} unit(s).` : "Real Estate tenant search failed."),
        },
        {
          rentalUnits: stats.rentalUnits + units,
          rentedUnits: stats.rentedUnits + units,
        }
      )
    ),
    12
  );
}

export function realEstateFlipProject(life: LifeStats) {
  const blockedRealEstate = requireRealEstateCompany(life);
  if (blockedRealEstate) return blockedRealEstate;

  const blocked = noActions(life, 18);
  if (blocked) return blocked;

  const stats = getRealEstateStats(life);

  if (!stats.ownedProject) {
    return {
      ...life,
      popupMessage: "Buy a property before trying to flip.",
      yearNotes: addYearNote(life, "No Real Estate project to flip."),
    };
  }

  const sellScore =
    stats.dealCondition +
    stats.renovationProgress +
    Math.floor((life.skills.realEstate || 0) * 5) +
    Math.floor(life.luck / 2) -
    stats.dealRisk +
    randomBetween(-25, 35);

  const saleMultiplier = sellScore >= 110 ? 1.35 : sellScore >= 85 ? 1.18 : sellScore >= 60 ? 1.03 : sellScore >= 35 ? 0.88 : 0.68;
  const salePrice = Math.floor(stats.dealValue * saleMultiplier);
  const profit = salePrice - stats.dealPrice;

  return consumeAction(
    normalizeBusiness(
      updateRealEstateStats(
        {
          ...life,
          cash: life.cash + salePrice,
          businessValue: Math.max(0, life.businessValue - stats.dealValue + Math.max(0, Math.floor(profit * 0.25))),
          businessRisk: clamp(life.businessRisk + (profit >= 0 ? -8 : 12)),
          reputation: clamp(life.reputation + (profit >= 50000 ? 3 : profit < 0 ? -2 : 1)),
          popupMessage: profit >= 0
            ? `Flip sold for ${formatMoney(salePrice)}. Profit around ${formatMoney(profit)}.`
            : `Bad flip. Sold for ${formatMoney(salePrice)}, losing around ${formatMoney(Math.abs(profit))}.`,
          yearNotes: addYearNote(life, profit >= 0 ? `Real Estate flip profit ${formatMoney(profit)}.` : `Real Estate flip loss ${formatMoney(Math.abs(profit))}.`),
        },
        {
          ownedProject: 0,
          dealPrice: 0,
          dealValue: 0,
          dealCondition: 0,
          dealRisk: 0,
          dealRent: 0,
          renovationProgress: 0,
          rentalUnits: stats.rentalUnits,
          rentedUnits: stats.rentedUnits,
          flipProfit: stats.flipProfit + profit,
        }
      )
    ),
    18
  );
}

export function realEstateHireManager(life: LifeStats) {
  const blockedRealEstate = requireRealEstateCompany(life);
  if (blockedRealEstate) return blockedRealEstate;

  const blocked = noActions(life, 10);
  if (blocked) return blocked;

  const stats = getRealEstateStats(life);
  const cost = 5000;

  if (stats.companyCash < cost) {
    return {
      ...life,
      popupMessage: `Your deal fund needs ${formatMoney(cost)} to hire a property manager.`,
      yearNotes: addYearNote(life, "Not enough Real Estate fund to hire manager."),
    };
  }

  return consumeAction(
    normalizeBusiness(
      updateRealEstateStats(
        {
          ...life,
          businessManagement: clamp(life.businessManagement + randomBetween(6, 14)),
          businessRisk: clamp(life.businessRisk - randomBetween(5, 12)),
          popupMessage: `Hired a property manager. Management improved and risk dropped.`,
          yearNotes: addYearNote(life, "Real Estate manager hired."),
        },
        {
          companyCash: stats.companyCash - cost,
          managerQuality: clamp(stats.managerQuality + randomBetween(12, 25)),
        }
      )
    ),
    10
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
  const rentalNotes: string[] = [];

  function addRentalNotice(message: string) {
    rentalNotes.push(message);
    eventLog = addLog({ ...life, eventLog }, `Rental Update: ${message}`);
  }

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
      updatedHome.lastRentalEventMessage = `${home.tenantName} paid rent for ${home.name}. You received ${formatMoney(received)}.`;
      addRentalNotice(updatedHome.lastRentalEventMessage || "Rental status changed.");
    } else if (managerEnabled && randomBetween(1, 100) <= 45) {
      const recovered = Math.floor(Math.max(0, rent - managerFee) * 0.75);
      cash += recovered;
      updatedHome.lastRentalEvent = "manager_saved_problem";
      updatedHome.lastRentalEventMessage = `Your property manager handled ${home.name}. You recovered ${formatMoney(recovered)}.`;
      addRentalNotice(updatedHome.lastRentalEventMessage || "Rental status changed.");
    } else {
      happiness = clamp(happiness - 2);
      reputation = clamp(reputation - 1);
      updatedHome.lastRentalEvent = "missed_payment";
      updatedHome.lastRentalEventMessage = `${home.tenantName} missed rent for ${home.name}.`;
      addRentalNotice(updatedHome.lastRentalEventMessage || "Rental status changed.");
    }

    if (randomBetween(1, 100) <= Math.max(1, damageChance - managerProtection)) {
      updatedHome.condition = degradeCondition(updatedHome.condition);
      happiness = clamp(happiness - 2);
      updatedHome.lastRentalEvent = "damage";
      updatedHome.lastRentalEventMessage = `${home.tenantName} damaged ${home.name}. Condition dropped to ${updatedHome.condition}.`;
      addRentalNotice(updatedHome.lastRentalEventMessage || "Rental status changed.");
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
        lastRentalEventMessage: `${home.tenantName} moved out of ${home.name}. The property is now vacant.`,
      };
      addRentalNotice(updatedHome.lastRentalEventMessage || "Rental status changed.");
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
    popupMessage:
      rentalNotes.length > 0 && rentalNotes.some((note) => note.toLowerCase().includes("moved out"))
        ? rentalNotes.find((note) => note.toLowerCase().includes("moved out")) || life.popupMessage
        : life.popupMessage,
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

  if (life.difficulty === "Easy") chance -= 2;
  if (life.difficulty === "Hard") chance += 2;
  if (life.difficulty === "Brutal") chance += 5;
  if (life.stress >= 85) chance += 3;
  if (life.happiness <= 15) chance += 2;

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
    energy: MAX_ENERGY,
    actionsLeft: ACTIONS_PER_YEAR,
    recoveryActionsUsed: {},
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
  const yearlyJobExperience =
    updated.jobId === "unemployed"
      ? updated.jobExperience
      : {
          ...updated.jobExperience,
          [updated.jobId]: (updated.jobExperience[updated.jobId] || 0) + 1,
        };
  const partTimeIncome = getPartTimeIncome(updated);
  const rentalIncomeBeforeCosts = getRentalIncomeEstimate(updated);

  updated = {
    ...updated,
    cash: updated.cash + yearlySalary + businessIncome + partTimeIncome,
    careerXp: updated.careerXp + (yearlySalary > 0 ? 18 : 0),
    jobExperience: yearlyJobExperience,
    yearsWorked: updated.yearsWorked + (yearlySalary > 0 ? 1 : 0),
    eventLog:
      yearlySalary > 0
        ? addLog(updated, `Salary paid: ${formatMoney(yearlySalary)} from ${updated.job}. Job experience +1.`)
        : updated.eventLog,
    businessPayroll,
    partTimeWorkUsedThisYear: false,
  };

  updated = processRentalEvents(updated);
  updated = payYearlyCosts(updated);
  updated = updateAssetValues(updated);

  const housingBonus = getHousingStatBonus(updated);
  const jobStress = updated.jobId === "unemployed" ? -2 : 4;
  const partTimeStress = (updated.partTimeJobs || []).length * 2;

  const difficultyStress =
    updated.difficulty === "Easy"
      ? -3
      : updated.difficulty === "Hard"
        ? 3
        : updated.difficulty === "Brutal"
          ? 6
          : 0;
  const backgroundSupport =
    updated.background === "Stable Family" || updated.background === "Rich Family"
      ? 2
      : updated.background === "Struggling"
        ? -2
        : 0;

  updated = {
    ...updated,
    happiness: clamp(updated.happiness + housingBonus.happiness + backgroundSupport),
    reputation: clamp(updated.reputation + housingBonus.reputation),
    stress: clamp((updated.stress ?? 35) - 7 + housingBonus.stress + jobStress + partTimeStress + difficultyStress),
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

    const passiveRevenueAdjustment = isProductBusinessType(updated.businessTypeId)
      ? Math.floor((strength - updated.businessRisk / 2) * 65) + randomBetween(-2500, 6000)
      : Math.floor((strength - updated.businessRisk / 2) * 160) + randomBetween(-5000, 12000);

    updated = normalizeBusiness({
      ...updated,
      businessValue: Math.max(0, updated.businessValue + yearlyValueChange),
      businessRevenue: Math.max(0, updated.businessRevenue + passiveRevenueAdjustment),
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

    updated = applyProductLifecycleYearlyUpdate(updated);

    updated = applyBusinessTypeYearlyEvent(updated);
    updated = addCompletedBusinessMilestones(updated);
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