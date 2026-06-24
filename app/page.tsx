"use client";

import { useEffect, useMemo, useState } from "react";

const VERSION = "Pre-Alpha 0.5.7";
const SAVE_KEY = "chargedlife-save-v0506";
const OLD_SAVE_KEYS = ["chargedlife-save-v0505", "chargedlife-save-v0504", "chargedlife-save-v0503", "chargedlife-save-v0502", "chargedlife-save-v0501", "chargedlife-save-v0500", "chargedlife-save-v0409", "chargedlife-save-v0408", "chargedlife-save-v0407", "chargedlife-save-v0406", "chargedlife-save-v0405", "chargedlife-save-v0404", "chargedlife-save-v0403", "chargedlife-save-v0402", "chargedlife-save-v0401", "chargedlife-save-v040", "chargedlife-save-v14"];
const ACCESS_KEY = "chargedlife-access-v0401";
const ACCESS_PASSWORD = "Kazeb";
const UI_SCALE_KEY = "chargedlife-ui-scale-v0506";

type Section = "Dashboard" | "Empire" | "Invest" | "Career" | "Properties" | "Community" | "Shop" | "Settings";
type Difficulty = "Easy" | "Normal" | "Hard";
type Background = "Poor" | "Working Class" | "Middle Class" | "Wealthy";
type Trait = "Gamer" | "Hustler" | "Smart Kid" | "Popular" | "Creative";
type Risk = "Low" | "Medium" | "High" | "Very High";
type UIScale = "compact" | "normal" | "large";

type BusinessType = {
  id: string;
  name: string;
  icon: string;
  image: string;
  minCost: number;
  risk: Risk;
  baseDailyIncome: number;
  baseDailyExpenses: number;
  growthPotential: number;
  description: string;
};

type Business = {
  id: string;
  name: string;
  typeId: string;
  typeName: string;
  icon: string;
  image: string;
  level: number;
  value: number;
  dailyIncome: number;
  dailyExpenses: number;
  growth: number;
  reputation: number;
  operations: number;
  risk: Risk;
  employees: number;
  createdDay: number;
  businessCash: number;
  ownerPayout: number;
  businessHealth: number;
  minecraft?: MinecraftServerData;
  coffee?: CoffeeShopData;
};

type MinecraftServerData = {
  dailyPlayers: number;
  peakPlayers: number;
  retention: number;
  serverQuality: number;
  contentQuality: number;
  staffQuality: number;
  storeConversion: number;
  averagePurchase: number;
  hostingTier: string;
  contentTier: string;
  moderators: number;
  admins: number;
  developers: number;
  staffTraining: number;
  expansions: string[];
  lastTrend: number;
};


type CoffeeLocationId = "neighborhood" | "suburban" | "downtown" | "mall" | "business";
type Weekday = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
type CoffeeRole = "Barista" | "Shift Lead" | "Store Manager";
type MarketingCampaignId = "none" | "flyers" | "social" | "influencer" | "opening";
type CoffeeTab = "Overview" | "Staff" | "Schedule" | "Marketing" | "Upgrades" | "Reports";

type CoffeeEmployee = {
  id: string;
  name: string;
  role: CoffeeRole;
  skill: number;
  reliability: number;
  experience: number;
  hourlyWage: number;
  mood: number;
  avatar: string;
  note: string;
};

type CoffeeShiftBlock = {
  id: string;
  label: string;
  start: number;
  end: number;
  employeeIds: string[];
};

type CoffeeDailyReport = {
  day: number;
  weekday: Weekday;
  potentialCustomers: number;
  lostCompetition: number;
  lostLongWait: number;
  lostHighPrices: number;
  customers: number;
  actualCustomers: number;
  revenue: number;
  rent: number;
  wages: number;
  marketing: number;
  supplies: number;
  profit: number;
  staffPerformance: string;
  satisfaction: number;
  satisfactionChange: number;
  coverage: number;
  businessCashChange?: number;
  ownerPayout?: number;
  playerCashChange?: number;
};

type CoffeeShopData = {
  locationId: CoffeeLocationId;
  dailyCustomers: number;
  yesterdayCustomers: number;
  peakHours: string;
  satisfaction: number;
  reviewScore: number;
  locationQuality: number;
  competition: number;
  staffQuality: number;
  brandReputation: number;
  coffeePrice: number;
  averageSpend: number;
  baristas: number;
  shiftLeads: number;
  managers: number;
  staffTraining: number;
  marketingBoost: number;
  stage: "Coffee Cart" | "Coffee Shop" | "Large Café" | "Premium Café" | "Coffee Chain" | "Regional Chain" | "National Chain";
  openingHour: number;
  closingHour: number;
  employeesList: CoffeeEmployee[];
  shifts: CoffeeShiftBlock[];
  shiftsByDay?: Record<Weekday, CoffeeShiftBlock[]>;
  activeCampaign: MarketingCampaignId;
  campaignDaysLeft: number;
  staffCoverage: number;
  hourlyTraffic: number[];
  lastReport?: CoffeeDailyReport;
  lastTrend: number;
  profitHistory?: number[];
  revenueHistory?: number[];
  customerHistory?: number[];
  purchasedUpgrades?: string[];
  grandOpeningUsed?: boolean;
};

type PropertyType = {
  id: string;
  name: string;
  icon: string;
  price: number;
  rent: number;
  expenses: number;
  description: string;
};

type Property = {
  id: string;
  name: string;
  typeId: string;
  icon: string;
  value: number;
  dailyRent: number;
  dailyExpenses: number;
  condition: number;
  occupancy: number;
  purchasedDay: number;
};

type InvestmentTemplate = {
  id: string;
  name: string;
  icon: string;
  risk: Risk;
  expectedReturn: string;
  description: string;
};

type Investment = {
  id: string;
  name: string;
  icon: string;
  risk: Risk;
  value: number;
  dailyChange: number;
};

type Job = {
  title: string;
  dailyPay: number;
  level: number;
} | null;

type GameEvent = {
  id: string;
  icon: string;
  title: string;
  value?: string;
  good?: boolean;
  day: number;
};

type GameState = {
  name: string;
  city: string;
  background: Background;
  trait: Trait;
  difficulty: Difficulty;
  age: number;
  day: number;
  cash: number;
  gems: number;
  happiness: number;
  health: number;
  intelligence: number;
  reputation: number;
  personalDailyExpenses: number;
  job: Job;
  businesses: Business[];
  properties: Property[];
  investments: Investment[];
  events: GameEvent[];
  avatarPreset: AvatarPreset;
  avatarHairstyle: Hairstyle;
  avatarOutfit: OutfitStyle;
  netWorthHistory: number[];
  isGameOver?: boolean;
  highestNetWorth?: number;
  totalProfitGenerated?: number;
};

type AvatarPreset = "Young Founder" | "Gamer Founder" | "Business Founder" | "Creative Founder" | "Investor Founder";
type Hairstyle = "Short Hair" | "Medium Hair" | "Long Hair" | "Curly Hair" | "Buzz Cut";
type OutfitStyle = "Hoodie" | "Starter Jacket" | "Smart Casual" | "Suit" | "Luxury Outfit";
type Country = "Norway" | "Turkey" | "Netherlands" | "USA" | "UK" | "Germany" | "Sweden" | "Denmark" | "Spain" | "Canada";

type CreateForm = {
  name: string;
  city: Country;
  background: Background;
  trait: Trait;
  difficulty: Difficulty;
  avatarPreset: AvatarPreset;
  avatarHairstyle: Hairstyle;
  avatarOutfit: OutfitStyle;
};

type BusinessForm = {
  name: string;
  typeId: string;
  investment: string;
  coffeeLocationId: CoffeeLocationId;
};

const navItems: { icon: string; label: Section }[] = [
  { icon: "🏠", label: "Dashboard" },
  { icon: "🏢", label: "Empire" },
  { icon: "📈", label: "Invest" },
  { icon: "💼", label: "Career" },
  { icon: "🏡", label: "Properties" },
  { icon: "👥", label: "Community" },
  { icon: "🛒", label: "Shop" },
  { icon: "⚙️", label: "Settings" },
];

const businessTypes: BusinessType[] = [
  { id: "minecraft", name: "Minecraft Server", icon: "⛏️", image: "/art/minecraft.svg", minCost: 500, risk: "Medium", baseDailyIncome: 26, baseDailyExpenses: 12, growthPotential: 9, description: "A community server with ranks, crates, and player economy." },
  { id: "hosting", name: "Web Hosting Company", icon: "🖥️", image: "/art/hosting.svg", minCost: 2400, risk: "Medium", baseDailyIncome: 92, baseDailyExpenses: 46, growthPotential: 8, description: "Sell server hosting, domains, support, and web plans." },
  { id: "store", name: "Online Store", icon: "🛒", image: "/art/store.svg", minCost: 1100, risk: "Medium", baseDailyIncome: 48, baseDailyExpenses: 25, growthPotential: 7, description: "Source products, run ads, and build a brand." },
  { id: "gamestudio", name: "Game Studio", icon: "🎮", image: "/art/gamestudio.svg", minCost: 5500, risk: "High", baseDailyIncome: 110, baseDailyExpenses: 85, growthPotential: 12, description: "Create web, mobile, Roblox, and indie games." },
  { id: "mobileapp", name: "Mobile App", icon: "📱", image: "/art/gamestudio.svg", minCost: 3000, risk: "High", baseDailyIncome: 72, baseDailyExpenses: 48, growthPotential: 11, description: "Build a small app, gain users, and monetize with premium features." },
  { id: "bakery", name: "Bakery", icon: "🥐", image: "/art/store.svg", minCost: 1800, risk: "Low", baseDailyIncome: 54, baseDailyExpenses: 34, growthPotential: 5, description: "Sell bread, cakes, and local breakfast goods." },
  { id: "coffee", name: "Coffee Shop", icon: "☕", image: "/art/store.svg", minCost: 3200, risk: "Low", baseDailyIncome: 82, baseDailyExpenses: 54, growthPotential: 6, description: "A cozy local coffee shop with loyal customers." },
  { id: "restaurant", name: "Restaurant", icon: "🍽️", image: "/art/store.svg", minCost: 9000, risk: "High", baseDailyIncome: 210, baseDailyExpenses: 160, growthPotential: 8, description: "Higher revenue, higher pressure, and expensive operations." },
  { id: "clothing", name: "Clothing Brand", icon: "👕", image: "/art/store.svg", minCost: 2200, risk: "Medium", baseDailyIncome: 66, baseDailyExpenses: 39, growthPotential: 8, description: "Launch drops, build hype, and turn customers into fans." },
  { id: "carwash", name: "Car Wash", icon: "🚗", image: "/art/property.svg", minCost: 4200, risk: "Low", baseDailyIncome: 105, baseDailyExpenses: 63, growthPotential: 5, description: "Simple local service business with steady cash flow." },
  { id: "agency", name: "Marketing Agency", icon: "📣", image: "/art/job.svg", minCost: 1500, risk: "Medium", baseDailyIncome: 70, baseDailyExpenses: 28, growthPotential: 9, description: "Sell ads, design, content, and growth services." },
  { id: "realestateagency", name: "Real Estate Agency", icon: "🏘️", image: "/art/rental.svg", minCost: 6000, risk: "Medium", baseDailyIncome: 140, baseDailyExpenses: 70, growthPotential: 8, description: "Help people buy, sell, rent, and invest in properties." },
];

const minecraftHostingTiers = [
  { id: "budget", name: "Budget VPS", cost: 5, quality: 28, retention: -8, description: "Cheap but lag complaints are common." },
  { id: "shared", name: "Shared Game Host", cost: 15, quality: 50, retention: 0, description: "Balanced beginner hosting." },
  { id: "premium", name: "Premium Host", cost: 35, quality: 72, retention: 7, description: "Smoother performance for growing communities." },
  { id: "dedicated", name: "Dedicated Server", cost: 80, quality: 88, retention: 12, description: "Excellent performance with serious costs." },
  { id: "network", name: "Network Infrastructure", cost: 200, quality: 97, retention: 18, description: "Built for a real multi-server network." },
];

const minecraftContentTiers = [
  { id: "basic", name: "Basic Setup", cost: 4, quality: 32, growth: 0, description: "Default plugins and simple gameplay." },
  { id: "premium", name: "Premium Plugins", cost: 12, quality: 52, growth: 2, description: "Better menus, crates, economy and polish." },
  { id: "custom", name: "Custom Plugins", cost: 28, quality: 72, growth: 5, description: "Unique systems that players remember." },
  { id: "features", name: "Custom Server Features", cost: 55, quality: 86, growth: 8, description: "Deep progression and custom game loops." },
  { id: "core", name: "Full Custom Core", cost: 120, quality: 98, growth: 12, description: "A custom platform that feels like its own game." },
];

const minecraftExpansions = [
  { id: "hub", name: "Hub", cost: 1800, dailyCost: 20, growth: 8, requirement: 30 },
  { id: "skyblock", name: "Skyblock", cost: 2600, dailyCost: 32, growth: 13, requirement: 45 },
  { id: "smp", name: "SMP", cost: 1900, dailyCost: 24, growth: 10, requirement: 25 },
  { id: "factions", name: "Factions", cost: 3400, dailyCost: 44, growth: 15, requirement: 60 },
  { id: "prison", name: "Prison", cost: 4200, dailyCost: 52, growth: 18, requirement: 80 },
  { id: "lifesteal", name: "Lifesteal", cost: 2300, dailyCost: 28, growth: 12, requirement: 35 },
  { id: "minigames", name: "Minigames", cost: 5800, dailyCost: 75, growth: 24, requirement: 120 },
  { id: "creative", name: "Creative", cost: 1600, dailyCost: 18, growth: 7, requirement: 20 },
];

const coffeeLocations = [
  { id: "neighborhood" as CoffeeLocationId, name: "Small Neighborhood", icon: "🏘️", rent: 20, traffic: 28, competition: 18, quality: 34, description: "Low rent and low competition, but slower growth." },
  { id: "suburban" as CoffeeLocationId, name: "Suburban Shopping Area", icon: "🛍️", rent: 50, traffic: 48, competition: 38, quality: 52, description: "Balanced traffic, rent, and local competition." },
  { id: "downtown" as CoffeeLocationId, name: "Downtown Street", icon: "🌆", rent: 120, traffic: 76, competition: 66, quality: 76, description: "High traffic and strong upside, but rent is painful." },
  { id: "mall" as CoffeeLocationId, name: "Shopping Mall", icon: "🏬", rent: 180, traffic: 88, competition: 72, quality: 84, description: "Huge foot traffic, expensive lease, and lots of rivals." },
  { id: "business" as CoffeeLocationId, name: "Business District", icon: "🏙️", rent: 250, traffic: 96, competition: 82, quality: 92, description: "Excellent weekday rush, extremely high rent." },
];

const weekDays: Weekday[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const coffeeMarketingCampaigns = [
  { id: "none" as MarketingCampaignId, name: "No Campaign", costPerDay: 0, boost: 0, duration: 0, description: "No active marketing. Safest for saving cash." },
  { id: "flyers" as MarketingCampaignId, name: "Local Flyers", costPerDay: 25, boost: 14, duration: 9999, description: "Cheap local awareness and a steady neighborhood traffic boost." },
  { id: "social" as MarketingCampaignId, name: "Social Media Ads", costPerDay: 75, boost: 34, duration: 9999, description: "Persistent online reach. Strong for growing cafés." },
  { id: "influencer" as MarketingCampaignId, name: "Influencer Promotion", costPerDay: 200, boost: 62, duration: 9999, description: "Expensive but powerful. Results can vary day to day." },
  { id: "opening" as MarketingCampaignId, name: "Grand Opening Event", costPerDay: 0, boost: 120, duration: 3, description: "One-time launch burst. Locks after use." },
];

const coffeeEmployeeNames = [
  "Emma Berg", "Jonas Meyer", "Sofia Kaya", "Mia Larsen", "Noah Hansen", "Ava Jensen", "Oliver Holm", "Nora Dahl",
  "Leo Karlsen", "Sara Yilmaz", "Liam Walker", "Ella Smith", "Oscar Brown", "Amir Demir", "Ingrid Nilsen", "Lucas Adams",
  "Freya Wilson", "Maja Lund", "Theo Clark", "Selma Aas", "Elias Khan", "Hanna Olsen", "Mark Jensen", "Sofie Bakker"
];
const coffeeEmployeeAvatars = ["👩‍🍳", "👨‍🍳", "🧑‍💼", "👩‍💼", "👨‍💼", "🧑‍🎓", "👩‍🎓", "🧑‍🍳", "👨‍🎤", "👩‍🎨"];
const coffeeEmployeeNotes = [
  "Friendly and fast learner.", "Reliable but slower service.", "Experienced barista with high standards.", "Great with customers during rush hours.",
  "Calm under pressure.", "Needs training but has strong potential.", "Excellent attendance record.", "Creative and good at upselling."
];

const coffeeUpgrades = [
  { id: "espresso", name: "Better Espresso Machine", icon: "☕", cost: 1200, description: "Improves drink quality and satisfaction." },
  { id: "pos", name: "Faster POS System", icon: "💳", cost: 1800, description: "Reduces wait times and lost customers." },
  { id: "seating", name: "More Seating", icon: "🪑", cost: 2600, description: "Increases capacity for busy periods." },
  { id: "outdoor", name: "Outdoor Seating", icon: "🌤️", cost: 4200, description: "Boosts weekend and sunny-day traffic." },
  { id: "driveThru", name: "Drive-Thru Window", icon: "🚗", cost: 9500, description: "Boosts morning and after-work traffic." },
  { id: "beans", name: "Premium Beans Supplier", icon: "🫘", cost: 3200, description: "Higher supply cost, better reviews and spend." },
  { id: "loyalty", name: "Loyalty Program", icon: "🎟️", cost: 2500, description: "Improves repeat customers and retention." },
  { id: "delivery", name: "Delivery Partnership", icon: "🛵", cost: 5200, description: "Adds extra orders but increases workload." },
  { id: "register", name: "Second Register", icon: "🧾", cost: 3000, description: "Reduces queues during rush hours." },
  { id: "kitchen", name: "Kitchen Upgrade", icon: "🥐", cost: 8200, description: "Unlocks pastries and increases average spend." },
];

const coffeeExpansionStages = [
  { name: "Coffee Cart" as const, cost: 0, capacity: 45, staffNeed: 1, quality: 30 },
  { name: "Coffee Shop" as const, cost: 2600, capacity: 90, staffNeed: 2, quality: 45 },
  { name: "Large Café" as const, cost: 9000, capacity: 160, staffNeed: 5, quality: 62 },
  { name: "Premium Café" as const, cost: 26000, capacity: 260, staffNeed: 8, quality: 78 },
  { name: "Coffee Chain" as const, cost: 85000, capacity: 520, staffNeed: 16, quality: 88 },
  { name: "Regional Chain" as const, cost: 260000, capacity: 1200, staffNeed: 35, quality: 95 },
  { name: "National Chain" as const, cost: 1200000, capacity: 3500, staffNeed: 90, quality: 100 },
];

const propertyTypes: PropertyType[] = [
  { id: "apartment", name: "Small Apartment", icon: "🏢", price: 18000, rent: 32, expenses: 14, description: "Cheap first rental with simple cash flow." },
  { id: "house", name: "Rental House", icon: "🏠", price: 62000, rent: 92, expenses: 38, description: "A solid family rental with better income." },
  { id: "duplex", name: "Duplex", icon: "🏘️", price: 110000, rent: 165, expenses: 68, description: "Two units, stronger cash flow, more upkeep." },
  { id: "office", name: "Small Office", icon: "🏬", price: 145000, rent: 210, expenses: 96, description: "Business tenants and higher risk." },
  { id: "shopunit", name: "Shop Unit", icon: "🏪", price: 195000, rent: 285, expenses: 125, description: "Commercial unit with solid upside." },
  { id: "building", name: "Apartment Building", icon: "🌆", price: 650000, rent: 980, expenses: 410, description: "A major property milestone." },
];

const investmentTemplates: InvestmentTemplate[] = [
  { id: "index", name: "Index Fund", icon: "📊", risk: "Low", expectedReturn: "Slow and steady", description: "Lower volatility and long-term compounding." },
  { id: "tech", name: "Tech Stocks", icon: "💻", risk: "Medium", expectedReturn: "Higher growth", description: "Bigger daily swings, stronger upside." },
  { id: "crypto", name: "Crypto", icon: "🪙", risk: "Very High", expectedReturn: "Wild swings", description: "Can pump hard or crash fast." },
  { id: "reit", name: "Real Estate Fund", icon: "🏙️", risk: "Medium", expectedReturn: "Income + value", description: "Property exposure without buying buildings." },
  { id: "angel", name: "Startup Angel Investment", icon: "🚀", risk: "High", expectedReturn: "Big potential", description: "Back early startups and hope one explodes." },
];

const starterJobs = [
  { title: "Retail Assistant", dailyPay: 74, level: 1 },
  { title: "Support Agent", dailyPay: 88, level: 1 },
  { title: "Junior Sales Rep", dailyPay: 105, level: 1 },
  { title: "Apprentice Marketer", dailyPay: 118, level: 1 },
];

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function money(value: number) {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(Math.round(value)).toLocaleString("en-US")}`;
}

function eventId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function addEvent(state: GameState, event: Omit<GameEvent, "id" | "day">): GameState {
  return {
    ...state,
    events: [{ id: eventId(), day: state.day, ...event }, ...(state.events ?? [])].slice(0, 14),
  };
}

function createInitialGame(form: CreateForm): GameState {
  const backgroundCash: Record<Background, number> = {
    Poor: 450,
    "Working Class": 1800,
    "Middle Class": 6200,
    Wealthy: 24000,
  };
  const backgroundExpenses: Record<Background, number> = {
    Poor: 18,
    "Working Class": 28,
    "Middle Class": 45,
    Wealthy: 95,
  };
  const difficultyModifier: Record<Difficulty, number> = { Easy: 1.35, Normal: 1, Hard: 0.72 };
  const base: GameState = {
    name: form.name.trim() || "Founder",
    city: form.city,
    background: form.background,
    trait: form.trait,
    difficulty: form.difficulty,
    age: 18,
    day: 1,
    cash: Math.round(backgroundCash[form.background] * difficultyModifier[form.difficulty]),
    gems: form.difficulty === "Easy" ? 300 : 250,
    happiness: 70,
    health: 78,
    intelligence: 55,
    reputation: 25,
    personalDailyExpenses: Math.round(backgroundExpenses[form.background] / difficultyModifier[form.difficulty]),
    job: null,
    businesses: [],
    properties: [],
    investments: [],
    events: [],
    avatarPreset: form.avatarPreset,
    avatarHairstyle: form.avatarHairstyle,
    avatarOutfit: form.avatarOutfit,
    netWorthHistory: [],
    isGameOver: false,
    highestNetWorth: 0,
    totalProfitGenerated: 0,
  };
  const traitBonus: Record<Trait, Partial<GameState>> = {
    Gamer: { intelligence: 63, happiness: 74 },
    Hustler: { reputation: 37, happiness: 72 },
    "Smart Kid": { intelligence: 78 },
    Popular: { happiness: 82, reputation: 45 },
    Creative: { intelligence: 67, happiness: 78 },
  };
  const withTrait = { ...base, ...traitBonus[form.trait] };
  const withHistory = { ...withTrait, netWorthHistory: [calculateNetWorth(withTrait)] };
  return addEvent(withHistory, { icon: "⚡", title: `${withHistory.name} started a new business tycoon life in ${withHistory.city}.`, good: true });
}

function createMinecraftData(investment: number): MinecraftServerData {
  const startupBoost = Math.min(18, Math.floor(investment / 180));
  const hostingTier = investment >= 3500 ? "premium" : investment >= 1200 ? "shared" : "budget";
  const contentTier = investment >= 5000 ? "custom" : investment >= 2000 ? "premium" : "basic";
  const hosting = minecraftHostingTiers.find((tier) => tier.id === hostingTier) ?? minecraftHostingTiers[0];
  const content = minecraftContentTiers.find((tier) => tier.id === contentTier) ?? minecraftContentTiers[0];
  return {
    dailyPlayers: Math.max(3, Math.round(6 + startupBoost + Math.random() * 8)),
    peakPlayers: Math.max(2, Math.round(3 + startupBoost / 2 + Math.random() * 4)),
    retention: clamp(48 + hosting.retention + Math.round(content.quality / 10), 25, 95),
    serverQuality: hosting.quality,
    contentQuality: content.quality,
    staffQuality: 35,
    storeConversion: 1.1,
    averagePurchase: 7,
    hostingTier,
    contentTier,
    moderators: 0,
    admins: 0,
    developers: 0,
    staffTraining: 25,
    expansions: ["Survival"],
    lastTrend: 0,
  };
}

function minecraftCosts(mc?: MinecraftServerData) {
  if (!mc) return { hostingCost: 0, pluginCost: 0, staffCost: 0, expansionCost: 0, total: 0 };
  const hosting = minecraftHostingTiers.find((tier) => tier.id === mc.hostingTier) ?? minecraftHostingTiers[0];
  const content = minecraftContentTiers.find((tier) => tier.id === mc.contentTier) ?? minecraftContentTiers[0];
  const expansionCost = mc.expansions.reduce((sum, name) => {
    const expansion = minecraftExpansions.find((item) => item.name === name);
    return sum + (expansion?.dailyCost ?? (name === "Survival" ? 8 : 0));
  }, 0);
  const staffCost = mc.moderators * 9 + mc.admins * 18 + mc.developers * 45;
  const hostingCost = hosting.cost;
  const pluginCost = content.cost;
  return { hostingCost, pluginCost, staffCost, expansionCost, total: hostingCost + pluginCost + staffCost + expansionCost };
}

function minecraftRevenue(mc?: MinecraftServerData) {
  if (!mc) return 0;
  return Math.max(0, Math.round(mc.dailyPlayers * (mc.storeConversion / 100) * mc.averagePurchase));
}


function getWeekday(day: number): Weekday {
  return weekDays[(Math.max(1, day) - 1) % weekDays.length];
}

function defaultCoffeeShifts(openingHour = 7, closingHour = 19): CoffeeShiftBlock[] {
  const mid = Math.round((openingHour + closingHour) / 2);
  return [
    { id: "morning", label: "Morning Rush", start: openingHour, end: Math.min(mid, closingHour), employeeIds: [] },
    { id: "midday", label: "Lunch / Midday", start: Math.min(mid, closingHour), end: Math.min(mid + 4, closingHour), employeeIds: [] },
    { id: "evening", label: "After Work", start: Math.min(mid + 4, closingHour), end: closingHour, employeeIds: [] },
  ].filter((shift) => shift.end > shift.start);
}

function defaultCoffeeWeeklyShifts(openingHour = 7, closingHour = 19): Record<Weekday, CoffeeShiftBlock[]> {
  return weekDays.reduce((all, weekday) => {
    all[weekday] = defaultCoffeeShifts(openingHour, closingHour).map((shift) => ({ ...shift, id: `${weekday}-${shift.id}`, employeeIds: [] }));
    return all;
  }, {} as Record<Weekday, CoffeeShiftBlock[]>);
}

function activeCoffeeShifts(coffee: CoffeeShopData, dayOrWeekday: number | Weekday) {
  const weekday = typeof dayOrWeekday === "number" ? getWeekday(dayOrWeekday) : dayOrWeekday;
  const fallback = coffee.shifts?.length ? coffee.shifts : defaultCoffeeShifts(coffee.openingHour, coffee.closingHour);
  return coffee.shiftsByDay?.[weekday]?.length ? coffee.shiftsByDay[weekday] : fallback;
}

function employeeHoursForShifts(shifts: CoffeeShiftBlock[], employeeId: string) {
  return shifts.reduce((sum, shift) => sum + (shift.employeeIds.includes(employeeId) ? Math.max(0, shift.end - shift.start) : 0), 0);
}

function weeklyEmployeeHours(coffee: CoffeeShopData, employeeId: string) {
  const shiftsByDay = coffee.shiftsByDay ?? defaultCoffeeWeeklyShifts(coffee.openingHour, coffee.closingHour);
  return weekDays.reduce((sum, day) => sum + employeeHoursForShifts(shiftsByDay[day] ?? [], employeeId), 0);
}

function makeCoffeeEmployee(role: CoffeeRole, skill?: number, reliability?: number, wage?: number, takenNames: string[] = []): CoffeeEmployee {
  const baseSkill = skill ?? Math.round(32 + Math.random() * 48);
  const baseReliability = reliability ?? Math.round(40 + Math.random() * 50);
  const rolePremium = role === "Store Manager" ? 15 : role === "Shift Lead" ? 7 : 0;
  const hourlyWage = wage ?? Math.max(10, Math.round(8 + rolePremium + baseSkill * 0.14 + baseReliability * 0.055));
  const availableNames = coffeeEmployeeNames.filter((name) => !takenNames.includes(name));
  const name = (availableNames.length ? availableNames : coffeeEmployeeNames)[Math.floor(Math.random() * (availableNames.length || coffeeEmployeeNames.length))];
  return {
    id: eventId(),
    name,
    role,
    skill: baseSkill,
    reliability: baseReliability,
    experience: Math.round(Math.random() * 20),
    hourlyWage,
    mood: Math.round(60 + Math.random() * 30),
    avatar: coffeeEmployeeAvatars[Math.floor(Math.random() * coffeeEmployeeAvatars.length)],
    note: coffeeEmployeeNotes[Math.floor(Math.random() * coffeeEmployeeNotes.length)],
  };
}

function generateCoffeeCandidates(existingNames: string[] = []): CoffeeEmployee[] {
  const first = makeCoffeeEmployee("Barista", Math.round(35 + Math.random() * 28), Math.round(45 + Math.random() * 35), undefined, existingNames);
  const second = makeCoffeeEmployee(Math.random() > 0.55 ? "Shift Lead" : "Barista", Math.round(55 + Math.random() * 25), Math.round(55 + Math.random() * 35), undefined, [...existingNames, first.name]);
  const third = makeCoffeeEmployee(Math.random() > 0.5 ? "Store Manager" : "Shift Lead", Math.round(72 + Math.random() * 20), Math.round(70 + Math.random() * 25), undefined, [...existingNames, first.name, second.name]);
  return [first, second, third];
}

function getCoffeeCampaign(id: MarketingCampaignId) {
  return coffeeMarketingCampaigns.find((campaign) => campaign.id === id) ?? coffeeMarketingCampaigns[0];
}

function coffeeHourlyTraffic(coffee: CoffeeShopData, day: number) {
  const location = coffeeLocations.find((item) => item.id === coffee.locationId) ?? coffeeLocations[1];
  const weekday = getWeekday(day);
  const weekend = weekday === "Saturday" || weekday === "Sunday";
  const campaign = getCoffeeCampaign(coffee.activeCampaign);
  return Array.from({ length: 24 }, (_, hour) => {
    let rush = 0;
    if (hour >= 7 && hour < 10) rush += weekend ? 8 : 34;
    if (hour >= 11 && hour < 14) rush += 26;
    if (hour >= 16 && hour < 19) rush += weekend ? 22 : 30;
    if (weekend && hour >= 10 && hour < 16) rush += 30;
    if (hour < coffee.openingHour || hour >= coffee.closingHour) return 0;
    const base = location.traffic * 0.45 + rush + coffee.brandReputation * 0.12 + campaign.boost * 0.35 - location.competition * 0.12;
    return Math.max(0, Math.round(base));
  });
}

function coffeeEmployees(coffee: CoffeeShopData) {
  return coffee.employeesList?.length ? coffee.employeesList : [
    ...Array.from({ length: coffee.baristas }, () => makeCoffeeEmployee("Barista", 42, 68, 12)),
    ...Array.from({ length: coffee.shiftLeads }, () => makeCoffeeEmployee("Shift Lead", 58, 72, 18)),
    ...Array.from({ length: coffee.managers }, () => makeCoffeeEmployee("Store Manager", 70, 78, 28)),
  ];
}

function coffeeShiftHours(coffee: CoffeeShopData, dayOrWeekday: number | Weekday = 1) {
  return activeCoffeeShifts(coffee, dayOrWeekday).reduce((sum, shift) => sum + Math.max(0, shift.end - shift.start) * shift.employeeIds.length, 0);
}

function coffeePayroll(coffee: CoffeeShopData, dayOrWeekday: number | Weekday = 1) {
  const employees = coffeeEmployees(coffee);
  const shifts = activeCoffeeShifts(coffee, dayOrWeekday);
  return shifts.reduce((sum, shift) => {
    const hours = Math.max(0, shift.end - shift.start);
    return sum + shift.employeeIds.reduce((inner, id) => inner + (employees.find((employee) => employee.id === id)?.hourlyWage ?? 0) * hours, 0);
  }, 0);
}

function coffeeCoverage(coffee: CoffeeShopData, day: number) {
  const traffic = coffeeHourlyTraffic(coffee, day);
  const shifts = activeCoffeeShifts(coffee, day);
  let checked = 0;
  let score = 0;
  for (let hour = coffee.openingHour; hour < coffee.closingHour; hour++) {
    const trafficNeed = Math.max(1, Math.ceil((traffic[hour] ?? 0) / 30));
    const assigned = shifts.filter((shift) => hour >= shift.start && hour < shift.end).reduce((sum, shift) => sum + shift.employeeIds.length, 0);
    score += Math.min(1.22, assigned / trafficNeed);
    checked++;
  }
  return checked ? Math.round((score / checked) * 100) : 0;
}

function coffeeUpgradeBonus(coffee: CoffeeShopData) {
  const upgrades = new Set(coffee.purchasedUpgrades ?? []);
  return {
    quality: (upgrades.has("espresso") ? 7 : 0) + (upgrades.has("beans") ? 6 : 0),
    speed: (upgrades.has("pos") ? 10 : 0) + (upgrades.has("register") ? 12 : 0),
    capacity: (upgrades.has("seating") ? 18 : 0) + (upgrades.has("outdoor") ? 20 : 0) + (upgrades.has("driveThru") ? 35 : 0) + (upgrades.has("delivery") ? 25 : 0),
    traffic: (upgrades.has("outdoor") ? 8 : 0) + (upgrades.has("driveThru") ? 18 : 0) + (upgrades.has("loyalty") ? 10 : 0) + (upgrades.has("delivery") ? 10 : 0),
    spend: (upgrades.has("kitchen") ? 1.25 : 0) + (upgrades.has("beans") ? 0.45 : 0),
    supplyExtra: upgrades.has("beans") ? 0.22 : 0,
  };
}

function coffeeCustomerFlow(coffee: CoffeeShopData, day: number) {
  const clean = migrateCoffeeData(coffee);
  const location = coffeeLocations.find((item) => item.id === clean.locationId) ?? coffeeLocations[1];
  const stage = coffeeExpansionStages.find((item) => item.name === clean.stage) ?? coffeeExpansionStages[0];
  const hourlyTraffic = coffeeHourlyTraffic(clean, day);
  const rawDemand = hourlyTraffic.slice(clean.openingHour, clean.closingHour).reduce((sum, value) => sum + value, 0);
  const upgrades = coffeeUpgradeBonus(clean);
  const campaign = getCoffeeCampaign(clean.activeCampaign);
  const campaignBurst = clean.activeCampaign === "opening" && clean.campaignDaysLeft > 0 ? 70 : 0;
  const demandBase = rawDemand * (0.092 + clean.brandReputation / 7200 + clean.satisfaction / 9300) + upgrades.traffic + campaignBurst;
  const potentialCustomers = Math.max(0, Math.round(demandBase));
  const competitionPressure = Math.max(0, location.competition - clean.brandReputation * 0.45 - (clean.reviewScore - 3) * 8);
  const lostCompetition = Math.max(0, Math.round(potentialCustomers * (competitionPressure / 520)));
  const coverage = coffeeCoverage(clean, day);
  const speedHelp = upgrades.speed;
  const lostLongWait = coverage < 100 ? Math.round(potentialCustomers * Math.min(0.35, (100 - coverage) / (220 + speedHelp * 4))) : 0;
  const pricePressure = Math.max(0, clean.coffeePrice - 4);
  const lostHighPrices = Math.round(potentialCustomers * Math.min(0.28, pricePressure * 0.055));
  const capacity = stage.capacity + upgrades.capacity;
  const actualCustomers = Math.max(0, Math.min(capacity, potentialCustomers - lostCompetition - lostLongWait - lostHighPrices));
  return { potentialCustomers, lostCompetition, lostLongWait, lostHighPrices, actualCustomers, hourlyTraffic, coverage };
}

function trafficLabelFromValue(value: number) {
  if (value >= 105) return "Very High";
  if (value >= 78) return "High";
  if (value >= 48) return "Medium";
  if (value > 0) return "Low";
  return "Closed";
}

function coffeeShiftDemand(coffee: CoffeeShopData, shift: CoffeeShiftBlock, day: number) {
  const traffic = coffeeHourlyTraffic(coffee, day);
  const hours = Math.max(1, shift.end - shift.start);
  const trafficTotal = traffic.slice(shift.start, shift.end).reduce((sum, value) => sum + value, 0);
  const avgTraffic = trafficTotal / hours;
  const required = Math.max(1, Math.ceil(avgTraffic / 36));
  const assigned = shift.employeeIds.length;
  const status = assigned < required ? "Understaffed" : assigned > required + 1 ? "Overstaffed" : "Good";
  return { trafficTotal, avgTraffic, required, assigned, status };
}

function migrateCoffeeData(input: CoffeeShopData | undefined, investment = 3200, locationId: CoffeeLocationId = "suburban"): CoffeeShopData {
  const base = input ?? createCoffeeData(investment, locationId);
  const employeesList = (base.employeesList?.length ? base.employeesList : coffeeEmployees(base).slice(0, Math.max(0, base.baristas + base.shiftLeads + base.managers))).map((employee, index) => ({
    ...employee,
    avatar: employee.avatar ?? coffeeEmployeeAvatars[index % coffeeEmployeeAvatars.length],
    note: employee.note ?? coffeeEmployeeNotes[index % coffeeEmployeeNotes.length],
  }));
  const openingHour = base.openingHour ?? 7;
  const closingHour = base.closingHour ?? 19;
  return {
    ...base,
    openingHour,
    closingHour,
    employeesList,
    shifts: base.shifts?.length ? base.shifts : defaultCoffeeShifts(openingHour, closingHour),
    shiftsByDay: base.shiftsByDay ?? defaultCoffeeWeeklyShifts(openingHour, closingHour),
    activeCampaign: base.activeCampaign ?? "none",
    campaignDaysLeft: base.campaignDaysLeft ?? 0,
    staffCoverage: base.staffCoverage ?? 0,
    hourlyTraffic: base.hourlyTraffic?.length ? base.hourlyTraffic : coffeeHourlyTraffic({ ...base, openingHour, closingHour, employeesList, shifts: defaultCoffeeShifts(openingHour, closingHour), activeCampaign: "none", campaignDaysLeft: 0, staffCoverage: 0, hourlyTraffic: [] }, 1),
    lastReport: base.lastReport,
    profitHistory: base.profitHistory ?? [],
    revenueHistory: base.revenueHistory ?? [],
    customerHistory: base.customerHistory ?? [],
    purchasedUpgrades: base.purchasedUpgrades ?? [],
    grandOpeningUsed: base.grandOpeningUsed ?? false,
  };
}

function createCoffeeData(investment: number, locationId: CoffeeLocationId = "suburban"): CoffeeShopData {
  const location = coffeeLocations.find((item) => item.id === locationId) ?? coffeeLocations[1];
  const initialEmployees = investment >= 5200 ? [makeCoffeeEmployee("Barista", 48, 72, 13), makeCoffeeEmployee("Barista", 40, 66, 12)] : [makeCoffeeEmployee("Barista", 42, 70, 12)];
  const openingHour = 7;
  const closingHour = 19;
  const shifts = defaultCoffeeShifts(openingHour, closingHour);
  const firstShiftIds = initialEmployees.map((employee) => employee.id);
  return {
    locationId,
    dailyCustomers: Math.max(10, Math.round(location.traffic * 0.42)),
    yesterdayCustomers: 0,
    peakHours: "08:00-10:00 / 12:00-14:00 / 17:00-19:00",
    satisfaction: 68,
    reviewScore: 3.6,
    locationQuality: location.quality,
    competition: location.competition,
    staffQuality: 48,
    brandReputation: 34,
    coffeePrice: 4,
    averageSpend: 6.25,
    baristas: initialEmployees.filter((employee) => employee.role === "Barista").length,
    shiftLeads: 0,
    managers: 0,
    staffTraining: 28,
    marketingBoost: 0,
    stage: investment >= 9000 ? "Coffee Shop" : "Coffee Cart",
    openingHour,
    closingHour,
    employeesList: initialEmployees,
    shifts: shifts.map((shift) => ({ ...shift, employeeIds: shift.id === "morning" ? firstShiftIds : initialEmployees.slice(0, 1).map((employee) => employee.id) })),
    shiftsByDay: weekDays.reduce((all, weekday) => { all[weekday] = defaultCoffeeShifts(openingHour, closingHour).map((shift) => ({ ...shift, id: `${weekday}-${shift.id}`, employeeIds: shift.id === "morning" || weekday === "Saturday" ? firstShiftIds : initialEmployees.slice(0, 1).map((employee) => employee.id) })); return all; }, {} as Record<Weekday, CoffeeShiftBlock[]>),
    activeCampaign: "none",
    campaignDaysLeft: 0,
    staffCoverage: 82,
    hourlyTraffic: [],
    lastReport: undefined,
    lastTrend: 0,
    profitHistory: [],
    revenueHistory: [],
    customerHistory: [],
    purchasedUpgrades: [],
    grandOpeningUsed: false,
  };
}
function coffeeCosts(coffee?: CoffeeShopData, dayOrWeekday: number | Weekday = 1) {
  if (!coffee) return { rent: 0, wages: 0, supplies: 0, marketing: 0, total: 0 };
  const clean = migrateCoffeeData(coffee);
  const location = coffeeLocations.find((item) => item.id === clean.locationId) ?? coffeeLocations[1];
  const wages = Math.round(coffeePayroll(clean, dayOrWeekday));
  const upgrades = coffeeUpgradeBonus(clean);
  const supplies = Math.max(6, Math.round(clean.dailyCustomers * Math.max(0.86, clean.coffeePrice * (0.18 + upgrades.supplyExtra))));
  const campaign = getCoffeeCampaign(clean.activeCampaign);
  const marketing = clean.activeCampaign !== "none" && (clean.campaignDaysLeft > 0 || campaign.duration >= 9999) ? campaign.costPerDay : 0;
  const rent = location.rent;
  return { rent, wages, supplies, marketing, total: rent + wages + supplies + marketing };
}

function coffeeRevenue(coffee?: CoffeeShopData) {
  if (!coffee) return 0;
  return Math.max(0, Math.round(coffee.dailyCustomers * coffee.averageSpend));
}

function coffeeReviewStars(score: number) {
  const rounded = Math.max(1, Math.min(5, Math.round(score)));
  return "⭐".repeat(rounded) + "☆".repeat(5 - rounded);
}

function simulateCoffeeBusiness(business: Business, day = 1): { business: Business; event?: Omit<GameEvent, "id" | "day"> } {
  if (business.typeId !== "coffee" || !business.coffee) return { business };
  const coffee = migrateCoffeeData(business.coffee, Math.max(3200, business.value), business.coffee.locationId);
  const location = coffeeLocations.find((item) => item.id === coffee.locationId) ?? coffeeLocations[1];
  const employees = coffeeEmployees(coffee);
  const flow = coffeeCustomerFlow(coffee, day);
  const staffCoverage = flow.coverage;
  const avgEmployeeSkill = employees.length ? employees.reduce((sum, employee) => sum + employee.skill * 0.55 + employee.reliability * 0.3 + employee.mood * 0.15, 0) / employees.length : 20;
  const todayShifts = activeCoffeeShifts(coffee, day);
  const fatiguePenalty = employees.reduce((sum, employee) => sum + (employeeHoursForShifts(todayShifts, employee.id) > 8 ? 5 : 0) + (weeklyEmployeeHours(coffee, employee.id) > 40 ? 8 : 0), 0);
  const upgrades = coffeeUpgradeBonus(coffee);
  const staffScore = clamp(avgEmployeeSkill * 0.72 + coffee.staffTraining * 0.22 + upgrades.speed * 0.18 - fatiguePenalty);
  const yesterdayCustomers = coffee.dailyCustomers;
  let nextCustomers = flow.actualCustomers;
  const oldSatisfaction = coffee.satisfaction;
  const pricePressure = Math.max(0, coffee.coffeePrice - 4) * 5;
  let nextSatisfaction = clamp(coffee.satisfaction + (staffScore - 55) / 18 + (staffCoverage - 92) / 26 - pricePressure / 8 + upgrades.quality / 10 + (Math.random() * 3 - 1.5));
  let reviewScore = Math.max(1, Math.min(5, Number((coffee.reviewScore + (nextSatisfaction - 70) / 300 + upgrades.quality / 900 + (Math.random() * 0.08 - 0.04)).toFixed(1))));
  let brandReputation = clamp(coffee.brandReputation + Math.round((reviewScore - 3.3) * 1.3 + (nextCustomers - yesterdayCustomers) / 55));
  let employeesList = employees.map((employee) => {
    const todayHours = employeeHoursForShifts(todayShifts, employee.id);
    const weeklyHours = weeklyEmployeeHours(coffee, employee.id);
    const fatigue = todayHours > 8 || weeklyHours > 40;
    return { ...employee, experience: employee.experience + 1, mood: clamp(employee.mood + (fatigue ? -7 : staffCoverage > 125 ? -3 : staffCoverage < 65 ? -2 : 1), 10, 100) };
  });
  let event: Omit<GameEvent, "id" | "day"> | undefined;

  if (coffee.activeCampaign === "opening" && coffee.campaignDaysLeft === getCoffeeCampaign("opening").duration) {
    event = { icon: "🎉", title: `${business.name}: grand opening created a big rush of curious customers.`, value: "+traffic", good: true };
  } else if (Math.random() < 0.14) {
    const roll = Math.random();
    if (roll < 0.22) {
      nextCustomers = Math.round(nextCustomers * 1.22 + 8);
      brandReputation = clamp(brandReputation + 6);
      event = { icon: "☕", title: `${business.name}: coffee trend went viral locally.`, value: "+customers", good: true };
    } else if (roll < 0.42) {
      brandReputation = clamp(brandReputation + 8);
      nextSatisfaction = clamp(nextSatisfaction + 4);
      reviewScore = Math.min(5, Number((reviewScore + 0.2).toFixed(1)));
      event = { icon: "⭐", title: `${business.name}: a local influencer posted a great review.`, value: "+reviews", good: true };
    } else if (roll < 0.62 && employeesList.length) {
      const leaving = employeesList[Math.floor(Math.random() * employeesList.length)];
      employeesList = employeesList.filter((employee) => employee.id !== leaving.id);
      nextSatisfaction = clamp(nextSatisfaction - 5);
      event = { icon: "⚠️", title: `${business.name}: ${leaving.name} quit unexpectedly.`, value: "-staff", good: false };
    } else if (roll < 0.82) {
      nextCustomers = Math.max(0, Math.round(nextCustomers * 0.88));
      brandReputation = clamp(brandReputation - 3);
      event = { icon: "🔥", title: `${business.name}: a competitor opened nearby.`, value: "-traffic", good: false };
    } else {
      nextCustomers = Math.round(nextCustomers * 1.38 + 14);
      event = { icon: "🎪", title: `${business.name}: a nearby event boosted foot traffic.`, value: "+sales", good: true };
    }
  }

  const campaign = getCoffeeCampaign(coffee.activeCampaign);
  const nextCampaignDays = coffee.activeCampaign === "none" ? 0 : campaign.duration >= 9999 ? 9999 : Math.max(0, coffee.campaignDaysLeft - 1);
  const nextCampaign = coffee.activeCampaign === "opening" && nextCampaignDays <= 0 ? "none" : coffee.activeCampaign;
  const averageSpend = Math.max(3.25, Number((coffee.coffeePrice + 2.35 + Math.max(0, nextSatisfaction - 55) / 58 + upgrades.spend).toFixed(2)));
  const nextCoffeeDraft: CoffeeShopData = {
    ...coffee,
    dailyCustomers: nextCustomers,
    yesterdayCustomers,
    satisfaction: nextSatisfaction,
    reviewScore,
    brandReputation,
    averageSpend,
    staffQuality: staffScore,
    baristas: employeesList.filter((employee) => employee.role === "Barista").length,
    shiftLeads: employeesList.filter((employee) => employee.role === "Shift Lead").length,
    managers: employeesList.filter((employee) => employee.role === "Store Manager").length,
    employeesList,
    staffCoverage,
    hourlyTraffic: flow.hourlyTraffic,
    campaignDaysLeft: nextCampaignDays,
    activeCampaign: nextCampaign,
    lastTrend: nextCustomers - yesterdayCustomers,
    grandOpeningUsed: coffee.grandOpeningUsed || coffee.activeCampaign === "opening",
  };
  const revenue = coffeeRevenue(nextCoffeeDraft);
  const costs = coffeeCosts(nextCoffeeDraft, day);
  const profit = revenue - costs.total;
  const report: CoffeeDailyReport = {
    day,
    weekday: getWeekday(day),
    potentialCustomers: flow.potentialCustomers,
    lostCompetition: flow.lostCompetition,
    lostLongWait: flow.lostLongWait,
    lostHighPrices: flow.lostHighPrices,
    customers: nextCustomers,
    actualCustomers: nextCustomers,
    revenue,
    rent: costs.rent,
    wages: costs.wages,
    marketing: costs.marketing,
    supplies: costs.supplies,
    profit,
    staffPerformance: staffCoverage < 78 ? "Understaffed" : staffCoverage > 125 ? "Overstaffed" : "Good",
    satisfaction: Math.round(nextSatisfaction),
    satisfactionChange: Math.round(nextSatisfaction - oldSatisfaction),
    coverage: staffCoverage,
    businessCashChange: profit > 0 ? Math.round(profit * (1 - ((business.ownerPayout ?? 30) / 100))) : profit,
    ownerPayout: profit > 0 ? Math.round(profit * ((business.ownerPayout ?? 30) / 100)) : 0,
    playerCashChange: profit > 0 ? Math.round(profit * ((business.ownerPayout ?? 30) / 100)) : 0,
  };
  const finalCoffee = {
    ...nextCoffeeDraft,
    lastReport: report,
    profitHistory: [...(coffee.profitHistory ?? []), profit].slice(-7),
    revenueHistory: [...(coffee.revenueHistory ?? []), revenue].slice(-7),
    customerHistory: [...(coffee.customerHistory ?? []), nextCustomers].slice(-7),
  };
  return {
    business: {
      ...business,
      coffee: finalCoffee,
      dailyIncome: revenue,
      dailyExpenses: costs.total,
      employees: employeesList.length,
      reputation: brandReputation,
      operations: clamp((finalCoffee.satisfaction + finalCoffee.staffQuality + finalCoffee.staffCoverage) / 3),
      growth: clamp(brandReputation / 2 + nextCustomers / 10 + upgrades.quality / 3),
      value: Math.max(0, Math.round(business.value + profit * 4 + nextCustomers * 4 + brandReputation * 2 + (finalCoffee.purchasedUpgrades?.length ?? 0) * 120)),
    },
    event,
  };
}

function simulateMinecraftBusiness(business: Business): { business: Business; event?: Omit<GameEvent, "id" | "day"> } {
  if (business.typeId !== "minecraft" || !business.minecraft) return { business };
  const mc = business.minecraft;
  const hosting = minecraftHostingTiers.find((tier) => tier.id === mc.hostingTier) ?? minecraftHostingTiers[0];
  const content = minecraftContentTiers.find((tier) => tier.id === mc.contentTier) ?? minecraftContentTiers[0];
  const expansionGrowth = mc.expansions.reduce((sum, name) => sum + (minecraftExpansions.find((item) => item.name === name)?.growth ?? 2), 0);
  const qualityScore = mc.serverQuality * 0.24 + mc.contentQuality * 0.28 + mc.staffQuality * 0.18 + business.reputation * 0.22 + mc.retention * 0.08;
  const competition = 8 + Math.random() * 18;
  const buzz = Math.round((qualityScore - 50) / 7 + expansionGrowth / 5 - competition / 9 + (Math.random() * 10 - 5));
  const dailyPlayers = Math.max(0, Math.round(mc.dailyPlayers + buzz));
  const peakPlayers = Math.max(0, Math.round(dailyPlayers * (0.24 + Math.random() * 0.18)));
  const retention = clamp(mc.retention + Math.round((qualityScore - 55) / 25 + (Math.random() * 4 - 2)), 10, 98);
  const staffQuality = clamp(mc.staffQuality + Math.round((mc.staffTraining - 45) / 60) - (mc.moderators + mc.admins === 0 && dailyPlayers > 35 ? 1 : 0), 5, 100);
  let reputation = clamp(business.reputation + Math.round((retention - 55) / 28 + (Math.random() * 4 - 2)), 0, 100);
  let event: Omit<GameEvent, "id" | "day"> | undefined;
  if (Math.random() < 0.13) {
    const roll = Math.random();
    if (roll < 0.2) {
      reputation = clamp(reputation + 10);
      event = { icon: "🔥", title: `${business.name}: a YouTuber played the server.`, value: "+players", good: true };
    } else if (roll < 0.4) {
      reputation = clamp(reputation - 9);
      event = { icon: "⚠️", title: `${business.name}: lag complaints hurt retention.`, value: "-reputation", good: false };
    } else if (roll < 0.6) {
      reputation = clamp(reputation + 6);
      event = { icon: "🎉", title: `${business.name}: seasonal update landed well.`, value: "+retention", good: true };
    } else if (roll < 0.8) {
      reputation = clamp(reputation - 12);
      event = { icon: "💥", title: `${business.name}: staff drama made players leave.`, value: "-players", good: false };
    } else {
      reputation = clamp(reputation + 16);
      event = { icon: "🚀", title: `${business.name}: viral TikTok clip brought new players.`, value: "+growth", good: true };
    }
  }
  const nextMc = { ...mc, dailyPlayers, peakPlayers, retention, staffQuality, serverQuality: hosting.quality, contentQuality: content.quality, lastTrend: dailyPlayers - mc.dailyPlayers };
  const dailyIncome = minecraftRevenue(nextMc);
  const dailyExpenses = minecraftCosts(nextMc).total;
  const profit = dailyIncome - dailyExpenses;
  return {
    business: {
      ...business,
      minecraft: nextMc,
      dailyIncome,
      dailyExpenses,
      reputation,
      operations: clamp(Math.round((hosting.quality + content.quality + staffQuality) / 3), 0, 100),
      growth: clamp(Math.round(expansionGrowth + dailyPlayers / 8 + reputation / 10), 0, 100),
      value: Math.max(0, Math.round(business.value + profit * 8 + dailyPlayers * 4 + (reputation - 50) * 3)),
      employees: nextMc.moderators + nextMc.admins + nextMc.developers,
    },
    event,
  };
}

function createBusinessFromForm(type: BusinessType, name: string, investment: number, createdDay: number, coffeeLocationId: CoffeeLocationId = "suburban"): Business {
  const multiplier = Math.max(1, investment / type.minCost);
  const efficiency = 0.72 + Math.min(0.8, Math.log2(multiplier + 1) / 5);
  let dailyIncome = Math.round(type.baseDailyIncome * multiplier * efficiency);
  let dailyExpenses = Math.round(type.baseDailyExpenses * multiplier * (0.95 + Math.random() * 0.12));
  const minecraft = type.id === "minecraft" ? createMinecraftData(investment) : undefined;
  const coffee = type.id === "coffee" ? createCoffeeData(investment, coffeeLocationId) : undefined;
  if (minecraft) {
    dailyIncome = minecraftRevenue(minecraft);
    dailyExpenses = minecraftCosts(minecraft).total;
  }
  if (coffee) {
    dailyIncome = coffeeRevenue(coffee);
    dailyExpenses = coffeeCosts(coffee).total;
  }
  return {
    id: eventId(),
    name: name.trim() || type.name,
    typeId: type.id,
    typeName: type.name,
    icon: type.icon,
    image: type.image,
    level: 1,
    value: Math.round(investment * (0.82 + type.growthPotential / 20)),
    dailyIncome,
    dailyExpenses,
    growth: minecraft ? 8 : coffee ? 6 : type.growthPotential,
    reputation: minecraft ? 38 : coffee ? coffee.brandReputation : 24 + Math.round(type.growthPotential * 2),
    operations: minecraft ? Math.round((minecraft.serverQuality + minecraft.contentQuality + minecraft.staffQuality) / 3) : coffee ? Math.round((coffee.satisfaction + coffee.staffQuality + coffee.locationQuality) / 3) : 65,
    risk: type.risk,
    employees: minecraft ? minecraft.moderators + minecraft.admins + minecraft.developers : coffee ? coffee.baristas + coffee.shiftLeads + coffee.managers : 0,
    createdDay,
    businessCash: investment,
    ownerPayout: 30,
    businessHealth: 72,
    minecraft,
    coffee,
  };
}

function calculateDailyIncome(state: GameState) {
  const jobIncome = state.job?.dailyPay ?? 0;
  const ownerPayouts = (state.businesses ?? []).reduce((sum, b) => sum + businessOwnerPayoutEstimate(b), 0);
  const propertyIncome = (state.properties ?? []).reduce((sum, p) => sum + Math.round(p.dailyRent * (p.occupancy / 100)), 0);
  return jobIncome + ownerPayouts + propertyIncome;
}

function calculateDailyExpenses(state: GameState) {
  const propertyExpenses = (state.properties ?? []).reduce((sum, p) => sum + p.dailyExpenses, 0);
  return state.personalDailyExpenses + propertyExpenses;
}
function businessProfit(business: Business) {
  return (business.dailyIncome ?? 0) - (business.dailyExpenses ?? 0);
}

function businessOwnerPayoutEstimate(business: Business) {
  const profit = businessProfit(business);
  return profit > 0 ? Math.round(profit * ((business.ownerPayout ?? 30) / 100)) : 0;
}

function calculateBusinessHealth(business: Business) {
  const profit = businessProfit(business);
  const reserveDays = business.dailyExpenses > 0 ? (business.businessCash ?? 0) / business.dailyExpenses : 10;
  const financeScore = clamp(reserveDays * 18, 0, 100);
  return clamp(financeScore * 0.34 + business.operations * 0.24 + business.reputation * 0.22 + (profit >= 0 ? 75 : 35) * 0.2);
}

function chargeBusinessAccount(state: GameState, businessId: string, amount: number) {
  let personalUsed = 0;
  const businesses = state.businesses.map((business) => {
    if (business.id !== businessId) return business;
    const balance = business.businessCash ?? 0;
    const fromBusiness = Math.min(balance, amount);
    personalUsed = Math.max(0, amount - fromBusiness);
    const updated = { ...business, businessCash: Math.max(0, balance - fromBusiness) };
    return { ...updated, businessHealth: calculateBusinessHealth(updated) };
  });
  return { state: { ...state, cash: state.cash - personalUsed, businesses }, personalUsed };
}


function calculatePortfolioValue(state: GameState) {
  return (state.investments ?? []).reduce((sum, i) => sum + i.value, 0);
}

function calculateNetWorth(state: GameState) {
  const businessValue = (state.businesses ?? []).reduce((sum, b) => sum + b.value + (b.businessCash ?? 0), 0);
  const propertyValue = (state.properties ?? []).reduce((sum, p) => sum + p.value, 0);
  return state.cash + businessValue + propertyValue + calculatePortfolioValue(state);
}

function titleForNetWorth(netWorth: number) {
  if (netWorth >= 10000000) return "Tycoon Legend";
  if (netWorth >= 1000000) return "Millionaire";
  if (netWorth >= 100000) return "Entrepreneur";
  if (netWorth >= 25000) return "Hustler";
  return "Broke Founder";
}

function nextMilestone(netWorth: number) {
  if (netWorth < 10000) return 10000;
  if (netWorth < 50000) return 50000;
  if (netWorth < 100000) return 100000;
  if (netWorth < 1000000) return 1000000;
  if (netWorth < 10000000) return 10000000;
  return 100000000;
}

function avatarDefaults(preset: AvatarPreset): { hairstyle: Hairstyle; outfit: OutfitStyle } {
  const defaults: Record<AvatarPreset, { hairstyle: Hairstyle; outfit: OutfitStyle }> = {
    "Young Founder": { hairstyle: "Short Hair", outfit: "Hoodie" },
    "Gamer Founder": { hairstyle: "Medium Hair", outfit: "Hoodie" },
    "Business Founder": { hairstyle: "Short Hair", outfit: "Suit" },
    "Creative Founder": { hairstyle: "Curly Hair", outfit: "Smart Casual" },
    "Investor Founder": { hairstyle: "Buzz Cut", outfit: "Luxury Outfit" },
  };
  return defaults[preset];
}

function avatarVisual(preset: AvatarPreset = "Young Founder", hairstyle: Hairstyle = "Short Hair", outfit: OutfitStyle = "Starter Jacket") {
  const presetMap: Record<AvatarPreset, { skin: string; blush: string; expression: string; bg: string; presetClass: string; hairBase: string }> = {
    "Young Founder": { skin: "#f6bd86", blush: "#ff9f87", expression: "friendly", bg: "linear-gradient(135deg,#1299ff,#092a65)", presetClass: "youngFounder", hairBase: "#5b2a12" },
    "Gamer Founder": { skin: "#f0b983", blush: "#ff8b83", expression: "cool", bg: "linear-gradient(135deg,#7c3aed,#0ea5e9)", presetClass: "gamerFounder", hairBase: "#332018" },
    "Business Founder": { skin: "#d99a64", blush: "#e97872", expression: "focused", bg: "linear-gradient(135deg,#0ea5e9,#0f172a)", presetClass: "businessFounder", hairBase: "#25160e" },
    "Creative Founder": { skin: "#f2a777", blush: "#ff7bac", expression: "bright", bg: "linear-gradient(135deg,#ec4899,#7c3aed)", presetClass: "creativeFounder", hairBase: "#7c2d12" },
    "Investor Founder": { skin: "#c98555", blush: "#db6d67", expression: "confident", bg: "linear-gradient(135deg,#16a34a,#0369a1)", presetClass: "investorFounder", hairBase: "#111827" },
  };
  const hairMap: Record<Hairstyle, string> = {
    "Short Hair": presetMap[preset].hairBase,
    "Medium Hair": preset === "Creative Founder" ? "#9f1239" : "#2f1d14",
    "Long Hair": preset === "Creative Founder" ? "#b45309" : "#3a2418",
    "Curly Hair": preset === "Creative Founder" ? "#7e22ce" : "#1f2937",
    "Buzz Cut": "#111827",
  };
  const outfitMap: Record<OutfitStyle, string> = {
    Hoodie: "#2563eb",
    "Starter Jacket": "#0f766e",
    "Smart Casual": "#7c3aed",
    Suit: "#111827",
    "Luxury Outfit": "#b7791f",
  };
  const shirtMap: Record<OutfitStyle, string> = {
    Hoodie: "#60a5fa",
    "Starter Jacket": "#2dd4bf",
    "Smart Casual": "#f9a8d4",
    Suit: "#f8fafc",
    "Luxury Outfit": "#fde68a",
  };
  const data = presetMap[preset];
  return { ...data, hairColor: hairMap[hairstyle], hairstyle, outfit, outfitClass: outfit.replaceAll(" ", "").toLowerCase(), outfitColor: outfitMap[outfit], shirtColor: shirtMap[outfit] };
}

function NetWorthChart({ history, current }: { history?: number[]; current: number }) {
  const values = (history && history.length >= 2 ? history : [Math.max(0, current * 0.86), Math.max(0, current * 0.92), current]).slice(-30);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const points = values.map((value, index) => {
    const x = values.length === 1 ? 170 : (index / (values.length - 1)) * 340;
    const y = 112 - ((value - min) / range) * 92;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const path = `M ${points.join(" L ")}`;
  const fillPath = `${path} L 340 130 L 0 130 Z`;
  return <svg viewBox="0 0 340 130" preserveAspectRatio="none"><path d={fillPath} fill="#22c55e" opacity=".18"/><path d={path} fill="none" stroke="#62f53f" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function AvatarPortrait({ preset, hairstyle = "Short Hair", outfit, large = false }: { preset: AvatarPreset; hairstyle?: Hairstyle; outfit: OutfitStyle; large?: boolean }) {
  const avatar = avatarVisual(preset, hairstyle, outfit);
  return (
    <div className={`${large ? "avatarPortrait large" : "avatarPortrait"} ${avatar.presetClass} ${avatar.outfitClass} ${avatar.hairstyle.replaceAll(" ", "").toLowerCase()}`} style={{ background: avatar.bg }} aria-label={`${preset} avatar`}>
      <div className="avatarSceneGlow" />
      <div className="avatarShoulderGlow" />
      <div className="avatarNeck" style={{ background: avatar.skin }} />
      <div className="avatarBodyPremium" style={{ background: avatar.outfitColor }}>
        <span style={{ background: avatar.shirtColor }} />
        <i />
      </div>
      <div className="avatarHead" style={{ background: `linear-gradient(180deg, ${avatar.skin}, #d98759)` }}>
        <div className="avatarEar left" style={{ background: avatar.skin }} />
        <div className="avatarEar right" style={{ background: avatar.skin }} />
        <div className="avatarHairPremium" style={{ background: avatar.hairColor }} />
        <div className="avatarHairSide left" style={{ background: avatar.hairColor }} />
        <div className="avatarHairSide right" style={{ background: avatar.hairColor }} />
        <div className="avatarBrows"><span /><span /></div>
        <div className={`avatarEyes ${avatar.expression}`}><span /><span /></div>
        <div className="avatarNose" />
        <div className="avatarSmile" />
        <div className="avatarBlush left" style={{ background: avatar.blush }} />
        <div className="avatarBlush right" style={{ background: avatar.blush }} />
      </div>
      <div className="avatarHeadset" />
      <div className="avatarGlasses"><span /><span /></div>
      <div className="avatarWatch" />
      <div className="avatarShine" />
    </div>
  );
}

function marketNewsForDay(day: number) {
  const news = [
    { icon: "🔥", title: "Minecraft is trending", text: "Gaming communities are spending more on servers and ranks.", tag: "Gaming demand up" },
    { icon: "☕", title: "Coffee demand rising", text: "Local cafés are seeing stronger morning traffic this week.", tag: "Food & drink boost" },
    { icon: "🏠", title: "Housing prices climbing", text: "Rental demand is increasing in smaller cities.", tag: "Property market" },
    { icon: "📉", title: "Crypto market falling", text: "High-risk assets are volatile. Strong cash flow matters.", tag: "Risk warning" },
    { icon: "🚀", title: "Tech stocks booming", text: "Software, hosting, apps, and game studios are attracting attention.", tag: "Tech momentum" },
    { icon: "💰", title: "Small business grants available", text: "New founders can benefit from smart reinvestment.", tag: "Founder opportunity" },
  ];
  return news[day % news.length];
}

function riskMultiplier(risk: Risk) {
  if (risk === "Low") return 0.012;
  if (risk === "Medium") return 0.028;
  if (risk === "High") return 0.055;
  return 0.095;
}

function ProgressBar({ value, tone = "green" }: { value: number; tone?: "green" | "gold" | "blue" | "red" }) {
  return <div className="progressTrack"><div className={`progressFill ${tone}`} style={{ width: `${clamp(value)}%` }} /></div>;
}

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [game, setGame] = useState<GameState | null>(null);
  const [section, setSection] = useState<Section>("Dashboard");
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [businessForm, setBusinessForm] = useState<BusinessForm>({ name: "", typeId: "minecraft", investment: "500", coffeeLocationId: "suburban" });
  const [createForm, setCreateForm] = useState<CreateForm>({ name: "", city: "Norway", background: "Working Class", trait: "Hustler", difficulty: "Normal", avatarPreset: "Young Founder", avatarHairstyle: "Short Hair", avatarOutfit: "Hoodie" });
  const [founderStep, setFounderStep] = useState(1);
  const [uiScale, setUiScale] = useState<UIScale>("compact");
  const [coffeeHiringBusinessId, setCoffeeHiringBusinessId] = useState<string>("");
  const [coffeeCandidates, setCoffeeCandidates] = useState<CoffeeEmployee[]>([]);
  const [coffeeScheduleDay, setCoffeeScheduleDay] = useState<Weekday>("Monday");
  const [coffeeTab, setCoffeeTab] = useState<CoffeeTab>("Overview");

  useEffect(() => {
    setHasMounted(true);
    setHasAccess(localStorage.getItem(ACCESS_KEY) === "true");
    const savedScale = localStorage.getItem(UI_SCALE_KEY) as UIScale | null;
    if (savedScale === "compact" || savedScale === "normal" || savedScale === "large") setUiScale(savedScale);
    const saved = localStorage.getItem(SAVE_KEY) ?? OLD_SAVE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Partial<GameState>;
      if (!parsed || typeof parsed !== "object" || typeof parsed.cash !== "number") return;
      const fallback = createInitialGame({
        name: parsed.name || "Player",
        city: (parsed.city as Country) || "Norway",
        background: parsed.background || "Working Class",
        trait: parsed.trait || "Hustler",
        difficulty: parsed.difficulty || "Normal",
        avatarPreset: (parsed.avatarPreset as AvatarPreset) || "Young Founder",
        avatarHairstyle: (parsed.avatarHairstyle as Hairstyle) || "Short Hair",
        avatarOutfit: (parsed.avatarOutfit as OutfitStyle) || "Starter Jacket",
      });
      const migrated: GameState = {
        ...fallback,
        ...parsed,
        day: parsed.day || 1,
        businesses: (parsed.businesses ?? []).map((b: any) => {
          const typeId = b.typeId || b.id || "minecraft";
          const minecraft = typeId === "minecraft" ? (b.minecraft ?? createMinecraftData(Math.max(500, Number(b.value) || 500))) : undefined;
          const coffee = typeId === "coffee" ? migrateCoffeeData(b.coffee, Math.max(3200, Number(b.value) || 3200), "suburban") : undefined;
          return {
            id: b.id || eventId(),
            name: b.name || b.typeName || "Business",
            typeId,
            typeName: b.typeName || (typeId === "minecraft" ? "Minecraft Server" : b.name || "Business"),
            icon: b.icon || (typeId === "minecraft" ? "⛏️" : "🏢"),
            image: b.image || (typeId === "minecraft" ? "/art/minecraft.svg" : "/art/rocket.svg"),
            level: b.level || 1,
            value: b.value || 0,
            dailyIncome: minecraft ? minecraftRevenue(minecraft) : coffee ? coffeeRevenue(coffee) : (b.dailyIncome ?? Math.max(0, (b.dailyProfit ?? 0) + 10)),
            dailyExpenses: minecraft ? minecraftCosts(minecraft).total : coffee ? coffeeCosts(coffee).total : (b.dailyExpenses ?? 10),
            growth: b.growth || 5,
            reputation: b.reputation || 30,
            operations: b.operations || 65,
            risk: b.risk || "Medium",
            employees: minecraft ? minecraft.moderators + minecraft.admins + minecraft.developers : coffee ? coffee.baristas + coffee.shiftLeads + coffee.managers : (b.employees || 0),
            createdDay: b.createdDay || parsed.day || 1,
            businessCash: typeof b.businessCash === "number" ? b.businessCash : 0,
            ownerPayout: typeof b.ownerPayout === "number" ? b.ownerPayout : 30,
            businessHealth: typeof b.businessHealth === "number" ? b.businessHealth : calculateBusinessHealth({ ...(b as Business), dailyIncome: minecraft ? minecraftRevenue(minecraft) : coffee ? coffeeRevenue(coffee) : (b.dailyIncome ?? 0), dailyExpenses: minecraft ? minecraftCosts(minecraft).total : coffee ? coffeeCosts(coffee).total : (b.dailyExpenses ?? 0), businessCash: typeof b.businessCash === "number" ? b.businessCash : 0, ownerPayout: typeof b.ownerPayout === "number" ? b.ownerPayout : 30, operations: b.operations || 65, reputation: b.reputation || 30 }),
            minecraft,
            coffee,
          };
        }),
        properties: parsed.properties ?? [],
        investments: parsed.investments ?? [],
        events: parsed.events ?? [],
        personalDailyExpenses: parsed.personalDailyExpenses ?? Math.round((parsed as any).monthlyExpenses ? (parsed as any).monthlyExpenses / 30 : 28),
        gems: parsed.gems ?? 250,
        reputation: parsed.reputation ?? 25,
        happiness: parsed.happiness ?? 70,
        health: parsed.health ?? 78,
        intelligence: parsed.intelligence ?? 55,
        avatarPreset: (parsed.avatarPreset as AvatarPreset) || "Young Founder",
        avatarHairstyle: (parsed.avatarHairstyle as Hairstyle) || "Short Hair",
        avatarOutfit: (parsed.avatarOutfit as OutfitStyle) || "Starter Jacket",
        netWorthHistory: Array.isArray(parsed.netWorthHistory) && parsed.netWorthHistory.length ? parsed.netWorthHistory.slice(-60) : [calculateNetWorth(fallback)],
        isGameOver: parsed.isGameOver ?? false,
        highestNetWorth: parsed.highestNetWorth ?? calculateNetWorth(fallback),
        totalProfitGenerated: parsed.totalProfitGenerated ?? 0,
      };
      setGame(migrated);
      localStorage.setItem(SAVE_KEY, JSON.stringify(migrated));
    } catch {
      setGame(null);
    }
  }, []);

  useEffect(() => {
    if (hasMounted && game) localStorage.setItem(SAVE_KEY, JSON.stringify(game));
  }, [game, hasMounted]);

  useEffect(() => {
    if (hasMounted) localStorage.setItem(UI_SCALE_KEY, uiScale);
  }, [uiScale, hasMounted]);

  const dailyIncome = useMemo(() => game ? calculateDailyIncome(game) : 0, [game]);
  const dailyExpenses = useMemo(() => game ? calculateDailyExpenses(game) : 0, [game]);
  const dailyProfit = dailyIncome - dailyExpenses;
  const netWorth = useMemo(() => game ? calculateNetWorth(game) : 0, [game]);
  const portfolioValue = useMemo(() => game ? calculatePortfolioValue(game) : 0, [game]);
  const selectedBusiness = game?.businesses.find((b) => b.id === selectedBusinessId) ?? game?.businesses[0];
  const selectedProperty = game?.properties.find((p) => p.id === selectedPropertyId) ?? game?.properties[0];
  const millionaireProgress = netWorth > 0 ? (netWorth / 1000000) * 100 : 0;

  function updateGame(updater: (state: GameState) => GameState) {
    setGame((current) => current ? updater(current) : current);
  }

  function unlock() {
    if (password.trim() !== ACCESS_PASSWORD) {
      setPasswordError("Invalid tester key. Check your password and try again.");
      return;
    }
    localStorage.setItem(ACCESS_KEY, "true");
    setHasAccess(true);
    setPasswordError("");
  }

  function startGame() {
    if (!createForm.name.trim()) {
      setFounderStep(1);
      return;
    }
    const created = createInitialGame(createForm);
    setGame(created);
    localStorage.setItem(SAVE_KEY, JSON.stringify(created));
  }

  function nextDay() {
    updateGame((state) => {
      const oldPortfolio = calculatePortfolioValue(state);
      const investments = state.investments.map((inv) => {
        const volatility = riskMultiplier(inv.risk);
        const drift = inv.risk === "Low" ? 0.0007 : inv.risk === "Medium" ? 0.0013 : inv.risk === "High" ? 0.002 : 0.003;
        const change = (Math.random() * volatility * 2 - volatility + drift) * inv.value;
        return { ...inv, value: Math.max(0, Math.round(inv.value + change)), dailyChange: Math.round(change) };
      });
      const minecraftEvents: Omit<GameEvent, "id" | "day">[] = [];
      const businesses = state.businesses.map((b) => {
        if (b.typeId === "minecraft") {
          const simulated = simulateMinecraftBusiness(b);
          if (simulated.event) minecraftEvents.push(simulated.event);
          return simulated.business;
        }
        if (b.typeId === "coffee") {
          const simulated = simulateCoffeeBusiness(b, state.day + 1);
          if (simulated.event) minecraftEvents.push(simulated.event);
          return simulated.business;
        }
        const random = Math.random();
        const opsBoost = (b.operations - 50) / 400;
        const growthBoost = b.growth / 36500;
        const value = Math.max(0, Math.round(b.value * (1 + growthBoost + opsBoost)));
        const wobble = random < 0.08 ? Math.round((Math.random() - 0.45) * 8) : 0;
        return { ...b, value, dailyIncome: Math.max(0, b.dailyIncome + wobble), operations: clamp(b.operations - (b.risk === "High" ? 1 : 0), 5, 100) };
      });
      const properties = state.properties.map((p) => {
        const conditionLoss = Math.random() < 0.08 ? 1 : 0;
        const value = Math.max(0, Math.round(p.value * (1 + (p.condition - 50) / 25000)));
        return { ...p, value, condition: clamp(p.condition - conditionLoss, 1, 100) };
      });
      const day = state.day + 1;
      let playerCashDelta = 0;
      let businessPayoutTotal = 0;
      let businessShortfallTotal = 0;
      const financedBusinesses = businesses.map((business) => {
        const profit = businessProfit(business);
        let businessCash = business.businessCash ?? 0;
        let payout = 0;
        if (profit >= 0) {
          payout = Math.round(profit * ((business.ownerPayout ?? 30) / 100));
          businessCash += profit - payout;
          businessPayoutTotal += payout;
          playerCashDelta += payout;
        } else {
          businessCash += profit;
          if (businessCash < 0) {
            const shortfall = Math.abs(businessCash);
            businessShortfallTotal += shortfall;
            playerCashDelta -= shortfall;
            businessCash = 0;
          }
        }
        const updated = { ...business, businessCash: Math.round(businessCash) };
        return { ...updated, businessHealth: calculateBusinessHealth(updated) };
      });
      const interim = { ...state, businesses: financedBusinesses, properties, investments };
      const personalIncome = (state.job?.dailyPay ?? 0) + properties.reduce((sum, p) => sum + Math.round(p.dailyRent * (p.occupancy / 100)), 0);
      const personalExpenses = state.personalDailyExpenses + properties.reduce((sum, p) => sum + p.dailyExpenses, 0);
      playerCashDelta += personalIncome - personalExpenses;
      const profit = Math.round(playerCashDelta);
      const agedUp = day > 1 && (day - 1) % 60 === 0;
      const cashAfterDay = Math.round(state.cash + profit);
      const nextBase: GameState = {
        ...interim,
        day,
        age: agedUp ? state.age + 1 : state.age,
        cash: cashAfterDay,
        happiness: clamp(state.happiness + (profit >= 0 ? 0.25 : -0.45)),
        health: clamp(state.health - (cashAfterDay < 0 ? 1 : 0)),
        totalProfitGenerated: (state.totalProfitGenerated ?? 0) + Math.max(0, businessPayoutTotal),
      };
      const nextWorth = calculateNetWorth(nextBase);
      let next: GameState = {
        ...nextBase,
        highestNetWorth: Math.max(state.highestNetWorth ?? nextWorth, nextWorth),
        netWorthHistory: [...(state.netWorthHistory ?? []), nextWorth].slice(-60),
        isGameOver: cashAfterDay <= -10000,
      };
      next = addEvent(next, { icon: next.isGameOver ? "💀" : "📅", title: next.isGameOver ? "Bankruptcy reached. Your personal debt passed $10,000." : agedUp ? `New year! You are now ${next.age}.` : `${getWeekday(day)} completed.`, value: `${profit >= 0 ? "+" : ""}${money(profit)}`, good: profit >= 0 && !next.isGameOver });
      if (businessPayoutTotal > 0) next = addEvent(next, { icon: "🏦", title: "Owner payouts were transferred to your personal account.", value: `+${money(businessPayoutTotal)}`, good: true });
      if (businessShortfallTotal > 0) next = addEvent(next, { icon: "⚠️", title: "One or more business accounts were depleted. Personal funds covered the shortfall.", value: `-${money(businessShortfallTotal)}`, good: false });
      minecraftEvents.forEach((event) => {
        next = addEvent(next, event);
      });
      const portfolioMove = calculatePortfolioValue(next) - oldPortfolio;
      if (state.investments.length && portfolioMove !== 0) next = addEvent(next, { icon: "📈", title: "Your investments moved today.", value: `${portfolioMove >= 0 ? "+" : ""}${money(portfolioMove)}`, good: portfolioMove >= 0 });
      if (Math.random() < 0.12 && next.businesses.length) {
        const target = next.businesses[Math.floor(Math.random() * next.businesses.length)];
        const good = Math.random() > 0.42;
        next = addEvent(next, { icon: good ? "🔥" : "⚠️", title: good ? `${target.name} got a small customer boost.` : `${target.name} had an operations issue.`, value: good ? "+growth" : "-ops", good });
        next = { ...next, businesses: next.businesses.map((b) => b.id === target.id ? { ...b, growth: clamp(b.growth + (good ? 1 : 0), 0, 100), operations: clamp(b.operations + (good ? 2 : -5), 0, 100) } : b) };
      }
      return next;
    });
  }

  function openCreateBusiness() {
    const type = businessTypes.find((b) => b.id === businessForm.typeId) ?? businessTypes[0];
    setBusinessForm((current) => ({ ...current, investment: current.investment || String(type.minCost) }));
    setShowBusinessModal(true);
  }

  function createBusiness() {
    updateGame((state) => {
      const type = businessTypes.find((b) => b.id === businessForm.typeId) ?? businessTypes[0];
      const investment = Math.round(Number(businessForm.investment));
      if (!Number.isFinite(investment) || investment < type.minCost) return addEvent(state, { icon: "💸", title: `Minimum startup investment for ${type.name} is ${money(type.minCost)}.`, good: false });
      if (state.cash < investment) return addEvent(state, { icon: "💸", title: `You need ${money(investment)} cash to create that business.`, good: false });
      const business = createBusinessFromForm(type, businessForm.name, investment, state.day, businessForm.coffeeLocationId);
      setSelectedBusinessId(business.id);
      setShowBusinessModal(false);
      setBusinessForm({ name: "", typeId: type.id, investment: String(type.minCost), coffeeLocationId: businessForm.coffeeLocationId });
      return addEvent({ ...state, cash: state.cash - investment, businesses: [...state.businesses, business] }, { icon: type.icon, title: `You created ${business.name}, a ${type.name}.`, value: `-${money(investment)}`, good: true });
    });
  }

  function manageBusiness(id: string, action: "upgrade" | "market" | "ops" | "hire" | "cut" | "sell") {
    updateGame((state) => {
      const business = state.businesses.find((b) => b.id === id);
      if (!business) return addEvent(state, { icon: "🏢", title: "Business not found.", good: false });
      if (action === "sell") {
        const sellValue = Math.round(business.value * 0.92);
        return addEvent({ ...state, cash: state.cash + sellValue, businesses: state.businesses.filter((b) => b.id !== id) }, { icon: "💰", title: `You sold ${business.name}.`, value: `+${money(sellValue)}`, good: true });
      }
      const cost = action === "upgrade" ? Math.round(420 * business.level + business.value * 0.08) : action === "market" ? 300 + business.level * 110 : action === "ops" ? 220 + business.level * 70 : action === "hire" ? 850 + business.employees * 500 : 0;
      if (state.cash < cost) return addEvent(state, { icon: "💸", title: `You need ${money(cost)} for this action.`, good: false });
      const businesses = state.businesses.map((b) => {
        if (b.id !== id) return b;
        if (action === "upgrade") return { ...b, level: b.level + 1, value: Math.round(b.value * 1.22 + cost * 0.7), dailyIncome: b.dailyIncome + Math.round(18 + b.level * 7), dailyExpenses: b.dailyExpenses + Math.round(7 + b.level * 3), growth: clamp(b.growth + 2), operations: clamp(b.operations + 2) };
        if (action === "market") return { ...b, reputation: clamp(b.reputation + 9), growth: clamp(b.growth + 5), dailyIncome: b.dailyIncome + Math.round(8 + b.reputation / 8), value: b.value + Math.round(cost * 0.45) };
        if (action === "ops") return { ...b, operations: clamp(b.operations + 13), dailyExpenses: Math.max(1, b.dailyExpenses - Math.round(2 + b.level)), value: b.value + Math.round(cost * 0.35) };
        if (action === "hire") return { ...b, employees: b.employees + 1, operations: clamp(b.operations + 8), growth: clamp(b.growth + 3), dailyIncome: b.dailyIncome + Math.round(15 + b.level * 4), dailyExpenses: b.dailyExpenses + Math.round(22 + b.employees * 6), value: b.value + Math.round(cost * 0.8) };
        return { ...b, dailyExpenses: Math.max(1, Math.round(b.dailyExpenses * 0.88)), reputation: clamp(b.reputation - 4), operations: clamp(b.operations - 6) };
      });
      const labels = { upgrade: "upgraded", market: "ran marketing for", ops: "improved operations for", hire: "hired staff for", cut: "cut expenses at", sell: "sold" };
      return addEvent({ ...state, cash: state.cash - cost, businesses }, { icon: business.icon, title: `You ${labels[action]} ${business.name}.`, value: cost > 0 ? `-${money(cost)}` : "expenses cut", good: action !== "cut" });
    });
  }

  function upgradeMinecraftHosting(id: string, tierId: string) {
    updateGame((state) => {
      const business = state.businesses.find((b) => b.id === id && b.minecraft);
      const tier = minecraftHostingTiers.find((item) => item.id === tierId);
      if (!business || !business.minecraft || !tier) return state;
      const current = minecraftHostingTiers.find((item) => item.id === business.minecraft?.hostingTier) ?? minecraftHostingTiers[0];
      const cost = Math.max(0, Math.round((tier.cost - current.cost) * 35 + tier.quality * 8));
      if (tier.id === current.id) return addEvent(state, { icon: "🖥️", title: `${business.name} already uses ${tier.name}.`, good: false });
      if (state.cash < cost) return addEvent(state, { icon: "💸", title: `You need ${money(cost)} to switch to ${tier.name}.`, good: false });
      const businesses = state.businesses.map((b) => b.id === id && b.minecraft ? {
        ...b,
        minecraft: { ...b.minecraft, hostingTier: tier.id, serverQuality: tier.quality, retention: clamp(b.minecraft.retention + tier.retention / 2) },
        operations: clamp(Math.round((tier.quality + b.minecraft.contentQuality + b.minecraft.staffQuality) / 3)),
        value: b.value + Math.round(cost * 0.45),
      } : b);
      return addEvent({ ...state, cash: state.cash - cost, businesses }, { icon: "🖥️", title: `${business.name} upgraded hosting to ${tier.name}.`, value: `-${money(cost)}`, good: true });
    });
  }

  function upgradeMinecraftContent(id: string, tierId: string) {
    updateGame((state) => {
      const business = state.businesses.find((b) => b.id === id && b.minecraft);
      const tier = minecraftContentTiers.find((item) => item.id === tierId);
      if (!business || !business.minecraft || !tier) return state;
      const current = minecraftContentTiers.find((item) => item.id === business.minecraft?.contentTier) ?? minecraftContentTiers[0];
      const cost = Math.max(0, Math.round((tier.cost - current.cost) * 45 + tier.quality * 10));
      if (tier.id === current.id) return addEvent(state, { icon: "🔌", title: `${business.name} already uses ${tier.name}.`, good: false });
      if (state.cash < cost) return addEvent(state, { icon: "💸", title: `You need ${money(cost)} to upgrade to ${tier.name}.`, good: false });
      const businesses = state.businesses.map((b) => b.id === id && b.minecraft ? {
        ...b,
        minecraft: { ...b.minecraft, contentTier: tier.id, contentQuality: tier.quality, retention: clamp(b.minecraft.retention + tier.growth) },
        growth: clamp(b.growth + tier.growth),
        value: b.value + Math.round(cost * 0.5),
      } : b);
      return addEvent({ ...state, cash: state.cash - cost, businesses }, { icon: "🔌", title: `${business.name} upgraded content to ${tier.name}.`, value: `-${money(cost)}`, good: true });
    });
  }

  function minecraftStaffAction(id: string, action: "train" | "mod" | "admin" | "dev" | "guidelines") {
    updateGame((state) => {
      const business = state.businesses.find((b) => b.id === id && b.minecraft);
      if (!business || !business.minecraft) return state;
      const cost = action === "train" ? 350 + business.minecraft.moderators * 80 : action === "mod" ? 650 : action === "admin" ? 1400 : action === "dev" ? 3200 : 500;
      if (state.cash < cost) return addEvent(state, { icon: "💸", title: `You need ${money(cost)} for that staff action.`, good: false });
      const businesses = state.businesses.map((b) => {
        if (b.id !== id || !b.minecraft) return b;
        const mc = { ...b.minecraft };
        if (action === "train") mc.staffTraining = clamp(mc.staffTraining + 18);
        if (action === "mod") mc.moderators += 1;
        if (action === "admin") mc.admins += 1;
        if (action === "dev") { mc.developers += 1; mc.contentQuality = clamp(mc.contentQuality + 6); }
        if (action === "guidelines") { mc.staffTraining = clamp(mc.staffTraining + 10); mc.staffQuality = clamp(mc.staffQuality + 8); }
        mc.staffQuality = clamp(Math.round(25 + mc.staffTraining * 0.45 + mc.moderators * 4 + mc.admins * 7 + mc.developers * 5));
        return { ...b, minecraft: mc, employees: mc.moderators + mc.admins + mc.developers, reputation: clamp(b.reputation + (action === "guidelines" ? 5 : 2)), operations: clamp(Math.round((mc.serverQuality + mc.contentQuality + mc.staffQuality) / 3)), value: b.value + Math.round(cost * 0.35) };
      });
      const label = action === "train" ? "trained staff" : action === "mod" ? "hired a moderator" : action === "admin" ? "hired an admin" : action === "dev" ? "hired a developer" : "created staff guidelines";
      return addEvent({ ...state, cash: state.cash - cost, businesses }, { icon: "👥", title: `${business.name} ${label}.`, value: `-${money(cost)}`, good: true });
    });
  }

  function expandMinecraftServer(id: string, expansionName: string) {
    updateGame((state) => {
      const business = state.businesses.find((b) => b.id === id && b.minecraft);
      const expansion = minecraftExpansions.find((item) => item.name === expansionName);
      if (!business || !business.minecraft || !expansion) return state;
      if (business.minecraft.expansions.includes(expansion.name)) return addEvent(state, { icon: "🧭", title: `${business.name} already has ${expansion.name}.`, good: false });
      if (state.cash < expansion.cost) return addEvent(state, { icon: "💸", title: `You need ${money(expansion.cost)} to launch ${expansion.name}.`, good: false });
      const tooEarly = business.minecraft.dailyPlayers < expansion.requirement;
      const businesses = state.businesses.map((b) => b.id === id && b.minecraft ? {
        ...b,
        minecraft: { ...b.minecraft, expansions: [...b.minecraft.expansions, expansion.name], contentQuality: clamp(b.minecraft.contentQuality + expansion.growth / 3), retention: clamp(b.minecraft.retention + (tooEarly ? -4 : 3)) },
        growth: clamp(b.growth + expansion.growth),
        reputation: clamp(b.reputation + (tooEarly ? -3 : 5)),
        value: b.value + Math.round(expansion.cost * 0.55),
      } : b);
      return addEvent({ ...state, cash: state.cash - expansion.cost, businesses }, { icon: tooEarly ? "⚠️" : "🧭", title: tooEarly ? `You launched ${expansion.name} early. Costs rose before demand caught up.` : `${business.name} expanded with ${expansion.name}.`, value: `-${money(expansion.cost)}`, good: !tooEarly });
    });
  }



  function moveCoffeeLocation(id: string, locationId: CoffeeLocationId) {
    updateGame((state) => {
      const business = state.businesses.find((b) => b.id === id && b.coffee);
      const location = coffeeLocations.find((item) => item.id === locationId);
      if (!business || !business.coffee || !location) return state;
      const cost = Math.round(location.rent * 18 + location.quality * 22);
      const charged = chargeBusinessAccount(state, id, cost);
      const businesses = charged.state.businesses.map((b) => b.id === id && b.coffee ? {
        ...b,
        coffee: { ...b.coffee, locationId, locationQuality: location.quality, competition: location.competition, dailyCustomers: Math.max(1, Math.round(b.coffee.dailyCustomers * (0.85 + location.traffic / 100))), lastTrend: 0 },
        value: b.value + Math.round(cost * 0.45),
        reputation: clamp(b.reputation + (location.quality > b.coffee.locationQuality ? 3 : -1)),
      } : b);
      return addEvent({ ...charged.state, businesses }, { icon: location.icon, title: `${business.name} moved to ${location.name}.`, value: `-${money(cost)}${charged.personalUsed ? " • personal funds used" : ""}`, good: true });
    });
  }

  function setCoffeePrice(id: string, price: number) {
    updateGame((state) => {
      const business = state.businesses.find((b) => b.id === id && b.coffee);
      if (!business || !business.coffee) return state;
      const businesses = state.businesses.map((b) => b.id === id && b.coffee ? { ...b, coffee: { ...b.coffee, coffeePrice: price, satisfaction: clamp(b.coffee.satisfaction + (price <= 4 ? 2 : price >= 6 ? -4 : 0)) } } : b);
      return addEvent({ ...state, businesses }, { icon: "💵", title: `${business.name} changed coffee price to ${money(price)}.`, good: price <= 5 });
    });
  }

  function openCoffeeHiring(id: string) {
    const business = game?.businesses.find((item) => item.id === id && item.coffee);
    const names = business?.coffee?.employeesList?.map((employee) => employee.name) ?? [];
    setCoffeeHiringBusinessId(id);
    setCoffeeCandidates(generateCoffeeCandidates(names));
  }

  function hireCoffeeCandidate(id: string, candidate: CoffeeEmployee) {
    updateGame((state) => {
      const business = state.businesses.find((b) => b.id === id && b.coffee);
      if (!business || !business.coffee) return state;
      const signingCost = Math.round(candidate.hourlyWage * 18);
      const charged = chargeBusinessAccount(state, id, signingCost);
      const businesses = charged.state.businesses.map((b) => {
        if (b.id !== id || !b.coffee) return b;
        const coffee = migrateCoffeeData(b.coffee);
        const employeesList = [...coffee.employeesList, candidate];
        const nextCoffee = {
          ...coffee,
          employeesList,
          baristas: employeesList.filter((employee) => employee.role === "Barista").length,
          shiftLeads: employeesList.filter((employee) => employee.role === "Shift Lead").length,
          managers: employeesList.filter((employee) => employee.role === "Store Manager").length,
          staffQuality: clamp(employeesList.reduce((sum, employee) => sum + employee.skill + employee.reliability, 0) / Math.max(1, employeesList.length * 2)),
          satisfaction: clamp(coffee.satisfaction + 2),
        };
        return { ...b, coffee: nextCoffee, employees: employeesList.length, operations: clamp((nextCoffee.satisfaction + nextCoffee.staffQuality + nextCoffee.staffCoverage) / 3), value: b.value + Math.round(signingCost * 0.35) };
      });
      setCoffeeHiringBusinessId("");
      setCoffeeCandidates([]);
      return addEvent({ ...charged.state, businesses }, { icon: "👥", title: `${business.name} hired ${candidate.name} as ${candidate.role}.`, value: `-${money(signingCost)}${charged.personalUsed ? " • personal funds used" : ""}`, good: true });
    });
  }

  function trainCoffeeTeam(id: string, program: "basic" | "service" | "coffee" | "leadership") {
    updateGame((state) => {
      const business = state.businesses.find((b) => b.id === id && b.coffee);
      if (!business || !business.coffee) return state;
      const data = { basic: { cost: 220, gain: 4, label: "basic training" }, service: { cost: 480, gain: 7, label: "customer service training" }, coffee: { cost: 820, gain: 10, label: "advanced coffee training" }, leadership: { cost: 1300, gain: 12, label: "leadership training" } }[program];
      const charged = chargeBusinessAccount(state, id, data.cost);
      const businesses = charged.state.businesses.map((b) => {
        if (b.id !== id || !b.coffee) return b;
        const coffee = migrateCoffeeData(b.coffee);
        const employeesList = coffee.employeesList.map((employee) => ({ ...employee, skill: clamp(employee.skill + data.gain), mood: clamp(employee.mood + 3), experience: employee.experience + 2 }));
        const nextCoffee = { ...coffee, employeesList, staffTraining: clamp(coffee.staffTraining + data.gain), staffQuality: clamp(coffee.staffQuality + data.gain), satisfaction: clamp(coffee.satisfaction + 3) };
        return { ...b, coffee: nextCoffee, operations: clamp((nextCoffee.satisfaction + nextCoffee.staffQuality + nextCoffee.staffCoverage) / 3), value: b.value + Math.round(data.cost * 0.35) };
      });
      return addEvent({ ...charged.state, businesses }, { icon: "📚", title: `${business.name} completed ${data.label}.`, value: `-${money(data.cost)}${charged.personalUsed ? " • personal funds used" : ""}`, good: true });
    });
  }

  function setCoffeeHours(id: string, openingHour: number, closingHour: number) {
    updateGame((state) => {
      const business = state.businesses.find((b) => b.id === id && b.coffee);
      if (!business || !business.coffee) return state;
      const businesses = state.businesses.map((b) => {
        if (b.id !== id || !b.coffee) return b;
        const coffee = migrateCoffeeData(b.coffee);
        const shiftsByDay = defaultCoffeeWeeklyShifts(openingHour, closingHour);
        const shifts = shiftsByDay[getWeekday(state.day)];
        return { ...b, coffee: { ...coffee, openingHour, closingHour, shifts, shiftsByDay, staffCoverage: coffeeCoverage({ ...coffee, openingHour, closingHour, shifts, shiftsByDay }, state.day) } };
      });
      return addEvent({ ...state, businesses }, { icon: "🕒", title: `${business.name} changed opening hours to ${String(openingHour).padStart(2, "0")}:00-${String(closingHour).padStart(2, "0")}:00.`, good: true });
    });
  }

  function autoPlanCoffeeShifts(id: string, style: "lean" | "balanced" | "rush") {
    updateGame((state) => {
      const business = state.businesses.find((b) => b.id === id && b.coffee);
      if (!business || !business.coffee) return state;
      const businesses = state.businesses.map((b) => {
        if (b.id !== id || !b.coffee) return b;
        const coffee = migrateCoffeeData(b.coffee);
        const employees = coffee.employeesList;
        const sorted = [...employees].sort((a, z) => (z.skill + z.reliability) - (a.skill + a.reliability));
        const maxPerShift = style === "lean" ? 1 : style === "balanced" ? 2 : 3;
        const shiftsByDay = { ...(coffee.shiftsByDay ?? defaultCoffeeWeeklyShifts(coffee.openingHour, coffee.closingHour)) };
        const shifts = (shiftsByDay[coffeeScheduleDay] ?? defaultCoffeeShifts(coffee.openingHour, coffee.closingHour)).map((shift, index) => ({ ...shift, employeeIds: sorted.slice(0, Math.min(sorted.length, maxPerShift + (style === "rush" && index !== 1 ? 1 : 0))).map((employee) => employee.id) }));
        shiftsByDay[coffeeScheduleDay] = shifts;
        const currentShifts = shiftsByDay[getWeekday(state.day)] ?? shifts;
        const nextCoffee = { ...coffee, shifts: currentShifts, shiftsByDay, staffCoverage: coffeeCoverage({ ...coffee, shifts: currentShifts, shiftsByDay }, state.day) };
        return { ...b, coffee: nextCoffee };
      });
      const label = style === "lean" ? "lean payroll" : style === "balanced" ? "balanced coverage" : "rush-hour coverage";
      return addEvent({ ...state, businesses }, { icon: "📋", title: `${business.name} updated ${coffeeScheduleDay} work planner for ${label}.`, good: true });
    });
  }

  function toggleCoffeeShiftEmployee(id: string, shiftId: string, employeeId: string, weekday: Weekday = coffeeScheduleDay) {
    updateGame((state) => {
      const businesses = state.businesses.map((b) => {
        if (b.id !== id || !b.coffee) return b;
        const coffee = migrateCoffeeData(b.coffee);
        const shiftsByDay = { ...(coffee.shiftsByDay ?? defaultCoffeeWeeklyShifts(coffee.openingHour, coffee.closingHour)) };
        const dayShifts = shiftsByDay[weekday] ?? defaultCoffeeShifts(coffee.openingHour, coffee.closingHour);
        const shifts = dayShifts.map((shift) => shift.id !== shiftId ? shift : { ...shift, employeeIds: shift.employeeIds.includes(employeeId) ? shift.employeeIds.filter((id) => id !== employeeId) : [...shift.employeeIds, employeeId] });
        shiftsByDay[weekday] = shifts;
        const currentShifts = shiftsByDay[getWeekday(state.day)] ?? shifts;
        return { ...b, coffee: { ...coffee, shifts: currentShifts, shiftsByDay, staffCoverage: coffeeCoverage({ ...coffee, shifts: currentShifts, shiftsByDay }, state.day) } };
      });
      return { ...state, businesses };
    });
  }

  function fireCoffeeEmployee(id: string, employeeId: string) {
    updateGame((state) => {
      const business = state.businesses.find((b) => b.id === id && b.coffee);
      if (!business || !business.coffee) return state;
      const employee = business.coffee.employeesList.find((e) => e.id === employeeId);
      const businesses = state.businesses.map((b) => {
        if (b.id !== id || !b.coffee) return b;
        const coffee = migrateCoffeeData(b.coffee);
        const employeesList = coffee.employeesList.filter((e) => e.id !== employeeId);
        const shiftsByDay = Object.fromEntries(weekDays.map((day) => [day, (coffee.shiftsByDay?.[day] ?? defaultCoffeeShifts(coffee.openingHour, coffee.closingHour)).map((shift) => ({ ...shift, employeeIds: shift.employeeIds.filter((assigned) => assigned !== employeeId) }))])) as Record<Weekday, CoffeeShiftBlock[]>;
        const currentShifts = shiftsByDay[getWeekday(state.day)];
        const nextCoffee = { ...coffee, employeesList, shifts: currentShifts, shiftsByDay, baristas: employeesList.filter((e) => e.role === "Barista").length, shiftLeads: employeesList.filter((e) => e.role === "Shift Lead").length, managers: employeesList.filter((e) => e.role === "Store Manager").length, staffQuality: clamp(employeesList.reduce((sum, e) => sum + e.skill + e.reliability, 0) / Math.max(1, employeesList.length * 2)), satisfaction: clamp(coffee.satisfaction - 2), brandReputation: clamp(coffee.brandReputation - 1) };
        return { ...b, coffee: nextCoffee, employees: employeesList.length, operations: clamp((nextCoffee.satisfaction + nextCoffee.staffQuality + nextCoffee.staffCoverage) / 3) };
      });
      return addEvent({ ...state, businesses }, { icon: "👋", title: `${employee?.name ?? "An employee"} was fired from ${business.name}.`, value: "Payroll reduced", good: false });
    });
  }

  function setBusinessOwnerPayout(id: string, payout: number) {
    updateGame((state) => {
      const business = state.businesses.find((b) => b.id === id);
      const businesses = state.businesses.map((b) => b.id === id ? { ...b, ownerPayout: payout } : b);
      return addEvent({ ...state, businesses }, { icon: "🏦", title: `${business?.name ?? "Business"} owner payout set to ${payout}%.`, good: true });
    });
  }

  function coffeeMarketingAction(id: string, action: MarketingCampaignId) {
    updateGame((state) => {
      const business = state.businesses.find((b) => b.id === id && b.coffee);
      if (!business || !business.coffee) return state;
      const coffee = migrateCoffeeData(business.coffee);
      if (action === "opening" && coffee.grandOpeningUsed) {
        return addEvent(state, { icon: "🎉", title: `${business.name} already used its Grand Opening Event.`, good: false });
      }
      const campaign = getCoffeeCampaign(action);
      const upfrontCost = action === "opening" ? 650 : 0;
      const charged = upfrontCost > 0 ? chargeBusinessAccount(state, id, upfrontCost) : { state, personalUsed: 0 };
      const businesses = charged.state.businesses.map((b) => b.id === id && b.coffee ? {
        ...b,
        coffee: {
          ...migrateCoffeeData(b.coffee),
          activeCampaign: action,
          campaignDaysLeft: campaign.duration,
          grandOpeningUsed: action === "opening" ? true : migrateCoffeeData(b.coffee).grandOpeningUsed,
          brandReputation: clamp(b.coffee.brandReputation + Math.round(campaign.boost / 12)),
        },
        reputation: clamp(b.reputation + Math.round(campaign.boost / 16)),
        growth: clamp(b.growth + Math.round(campaign.boost / 20)),
      } : b);
      return addEvent({ ...charged.state, businesses }, { icon: action === "opening" ? "🎉" : "📣", title: action === "none" ? `${business.name} stopped paid marketing.` : `${business.name} selected ${campaign.name}.`, value: campaign.costPerDay ? `${money(campaign.costPerDay)}/day` : (upfrontCost ? `-${money(upfrontCost)}${charged.personalUsed ? " • personal funds used" : ""}` : "No cost"), good: true });
    });
  }

  function buyCoffeeUpgrade(id: string, upgradeId: string) {
    updateGame((state) => {
      const business = state.businesses.find((b) => b.id === id && b.coffee);
      if (!business || !business.coffee) return state;
      const coffee = migrateCoffeeData(business.coffee);
      if (coffee.purchasedUpgrades?.includes(upgradeId)) return addEvent(state, { icon: "☕", title: `${business.name} already owns that upgrade.`, good: false });
      const upgrade = coffeeUpgrades.find((item) => item.id === upgradeId);
      if (!upgrade) return state;
      const charged = chargeBusinessAccount(state, id, upgrade.cost);
      const businesses = charged.state.businesses.map((b) => {
        if (b.id !== id || !b.coffee) return b;
        const nextCoffee = migrateCoffeeData(b.coffee);
        const purchasedUpgrades = [...(nextCoffee.purchasedUpgrades ?? []), upgrade.id];
        const upgradedCoffee = { ...nextCoffee, purchasedUpgrades, satisfaction: clamp(nextCoffee.satisfaction + 3), brandReputation: clamp(nextCoffee.brandReputation + 2) };
        return { ...b, coffee: upgradedCoffee, value: b.value + Math.round(upgrade.cost * 0.7), operations: clamp(b.operations + 3), growth: clamp(b.growth + 2) };
      });
      return addEvent({ ...charged.state, businesses }, { icon: upgrade.icon, title: `${business.name} bought ${upgrade.name}.`, value: `-${money(upgrade.cost)}${charged.personalUsed ? " • personal funds used" : ""}`, good: true });
    });
  }

  function expandCoffeeShop(id: string) {
    updateGame((state) => {
      const business = state.businesses.find((b) => b.id === id && b.coffee);
      if (!business || !business.coffee) return state;
      const currentIndex = coffeeExpansionStages.findIndex((item) => item.name === business.coffee?.stage);
      const nextStage = coffeeExpansionStages[currentIndex + 1];
      if (!nextStage) return addEvent(state, { icon: "🏪", title: `${business.name} is already at max coffee expansion.`, good: false });
      const charged = chargeBusinessAccount(state, id, nextStage.cost);
      const businesses = charged.state.businesses.map((b) => b.id === id && b.coffee ? { ...b, coffee: { ...b.coffee, stage: nextStage.name, satisfaction: clamp(b.coffee.satisfaction + 3), brandReputation: clamp(b.coffee.brandReputation + 8) }, level: b.level + 1, value: b.value + Math.round(nextStage.cost * 0.65), growth: clamp(b.growth + 8) } : b);
      return addEvent({ ...charged.state, businesses }, { icon: "🏪", title: `${business.name} expanded to ${nextStage.name}.`, value: `-${money(nextStage.cost)}${charged.personalUsed ? " • personal funds used" : ""}`, good: true });
    });
  }

  function buyProperty(type: PropertyType) {
    updateGame((state) => {
      if (state.cash < type.price) return addEvent(state, { icon: "🏡", title: `You need ${money(type.price)} to buy ${type.name}.`, good: false });
      const property: Property = { id: eventId(), name: type.name, typeId: type.id, icon: type.icon, value: type.price, dailyRent: type.rent, dailyExpenses: type.expenses, condition: 72, occupancy: 0, purchasedDay: state.day };
      setSelectedPropertyId(property.id);
      setShowPropertyModal(false);
      return addEvent({ ...state, cash: state.cash - type.price, properties: [...state.properties, property] }, { icon: type.icon, title: `You bought ${type.name}. Find a tenant to earn rent.`, value: `-${money(type.price)}`, good: true });
    });
  }

  function manageProperty(id: string, action: "renovate" | "tenant" | "raise" | "lower" | "sell") {
    updateGame((state) => {
      const property = state.properties.find((p) => p.id === id);
      if (!property) return addEvent(state, { icon: "🏡", title: "Property not found.", good: false });
      if (action === "sell") {
        const sellValue = Math.round(property.value * 0.96);
        return addEvent({ ...state, cash: state.cash + sellValue, properties: state.properties.filter((p) => p.id !== id) }, { icon: "💰", title: `You sold ${property.name}.`, value: `+${money(sellValue)}`, good: true });
      }
      const cost = action === "renovate" ? Math.round(property.value * 0.035) : action === "tenant" ? 250 : 0;
      if (state.cash < cost) return addEvent(state, { icon: "💸", title: `You need ${money(cost)} for that property action.`, good: false });
      const properties = state.properties.map((p) => {
        if (p.id !== id) return p;
        if (action === "renovate") return { ...p, condition: clamp(p.condition + 18), value: Math.round(p.value * 1.045), dailyExpenses: Math.max(1, p.dailyExpenses - 2) };
        if (action === "tenant") return { ...p, occupancy: Math.min(100, Math.max(p.occupancy, 80 + Math.round(Math.random() * 20))) };
        if (action === "raise") return { ...p, dailyRent: Math.round(p.dailyRent * 1.08), occupancy: clamp(p.occupancy - 7) };
        return { ...p, dailyRent: Math.round(p.dailyRent * 0.94), occupancy: clamp(p.occupancy + 10) };
      });
      const labels = { renovate: "renovated", tenant: "found a tenant for", raise: "raised rent at", lower: "lowered rent at", sell: "sold" };
      return addEvent({ ...state, cash: state.cash - cost, properties }, { icon: property.icon, title: `You ${labels[action]} ${property.name}.`, value: cost ? `-${money(cost)}` : undefined, good: true });
    });
  }

  function invest(id: string, amount: number) {
    updateGame((state) => {
      if (state.cash < amount) return addEvent(state, { icon: "💸", title: `You need ${money(amount)} to invest that much.`, good: false });
      const template = investmentTemplates.find((i) => i.id === id)!;
      const current = state.investments.find((i) => i.id === id);
      const investments = current ? state.investments.map((i) => i.id === id ? { ...i, value: i.value + amount } : i) : [...state.investments, { id, name: template.name, risk: template.risk, value: amount, dailyChange: 0, icon: template.icon }];
      return addEvent({ ...state, cash: state.cash - amount, investments }, { icon: template.icon, title: `You invested ${money(amount)} in ${template.name}.`, value: `-${money(amount)}`, good: true });
    });
  }

  function sellInvestment(id: string, amount?: number) {
    updateGame((state) => {
      const investment = state.investments.find((i) => i.id === id);
      if (!investment) return addEvent(state, { icon: "📈", title: "You do not own that investment yet.", good: false });
      const sellAmount = Math.min(investment.value, amount ?? investment.value);
      const investments = investment.value <= sellAmount ? state.investments.filter((i) => i.id !== id) : state.investments.map((i) => i.id === id ? { ...i, value: i.value - sellAmount } : i);
      return addEvent({ ...state, cash: state.cash + sellAmount, investments }, { icon: investment.icon, title: `You sold ${money(sellAmount)} of ${investment.name}.`, value: `+${money(sellAmount)}`, good: true });
    });
  }

  function applyJob(job: (typeof starterJobs)[number]) {
    updateGame((state) => {
      const chance = state.difficulty === "Easy" ? 0.88 : state.difficulty === "Hard" ? 0.58 : 0.72;
      if (Math.random() > chance + state.reputation / 500) return addEvent(state, { icon: "💼", title: `${job.title} rejected your application. Try improving skills or reputation.`, good: false });
      return addEvent({ ...state, job }, { icon: "💼", title: `You got hired as ${job.title}.`, value: `+${money(job.dailyPay)}/day`, good: true });
    });
  }

  function promote() {
    updateGame((state) => {
      if (!state.job) return addEvent(state, { icon: "💼", title: "You need a job before asking for promotion.", good: false });
      const success = Math.random() < 0.28 + state.intelligence / 260 + state.reputation / 380;
      if (!success) return addEvent(state, { icon: "📉", title: "Promotion denied. Your boss wants stronger results first.", good: false });
      const job = { ...state.job, level: state.job.level + 1, dailyPay: Math.round(state.job.dailyPay * 1.16) };
      return addEvent({ ...state, job, reputation: clamp(state.reputation + 4) }, { icon: "📈", title: "Promotion accepted! Your daily pay increased.", value: `+${money(job.dailyPay)}/day`, good: true });
    });
  }

  function improveSkills() {
    updateGame((state) => {
      const cost = 220;
      if (state.cash < cost) return addEvent(state, { icon: "🎓", title: `You need ${money(cost)} for a skill course.`, good: false });
      return addEvent({ ...state, cash: state.cash - cost, intelligence: clamp(state.intelligence + 7), reputation: clamp(state.reputation + 2) }, { icon: "🧠", title: "You completed a business skill course.", value: `-${money(cost)}`, good: true });
    });
  }

  function communityAction(label: string, cost: number, happiness: number, reputation: number, intelligence = 0) {
    updateGame((state) => {
      if (state.cash < cost) return addEvent(state, { icon: "💸", title: `You need ${money(cost)} for ${label}.`, good: false });
      return addEvent({ ...state, cash: state.cash - cost, happiness: clamp(state.happiness + happiness), reputation: clamp(state.reputation + reputation), intelligence: clamp(state.intelligence + intelligence) }, { icon: "👥", title: `You chose: ${label}.`, value: cost > 0 ? `-${money(cost)}` : undefined, good: true });
    });
  }

  function buyShopItem(item: "course" | "boost" | "outfit" | "cashflow") {
    updateGame((state) => {
      if (item === "course") {
        if (state.cash < 350) return addEvent(state, { icon: "💸", title: "You need $350 for the premium course.", good: false });
        return addEvent({ ...state, cash: state.cash - 350, intelligence: clamp(state.intelligence + 12) }, { icon: "🎓", title: "Premium business course completed.", value: "-$350", good: true });
      }
      if (item === "boost") {
        if (state.gems < 50) return addEvent(state, { icon: "💎", title: "You need 50 gems for a business boost.", good: false });
        return addEvent({ ...state, gems: state.gems - 50, businesses: state.businesses.map((b) => ({ ...b, dailyIncome: b.dailyIncome + 8, growth: clamp(b.growth + 2) })) }, { icon: "🚀", title: "All businesses received a boost.", value: "-50 gems", good: true });
      }
      if (item === "cashflow") {
        if (state.cash < 500) return addEvent(state, { icon: "💸", title: "You need $500 for expense audit.", good: false });
        return addEvent({ ...state, cash: state.cash - 500, personalDailyExpenses: Math.max(5, state.personalDailyExpenses - 5) }, { icon: "📉", title: "Expense audit lowered your daily living cost.", value: "-$500", good: true });
      }
      if (state.gems < 120) return addEvent(state, { icon: "💎", title: "You need 120 gems for the premium outfit.", good: false });
      return addEvent({ ...state, gems: state.gems - 120, avatarOutfit: "Luxury Outfit", reputation: clamp(state.reputation + 8) }, { icon: "🧥", title: "Luxury outfit equipped.", value: "-120 gems", good: true });
    });
  }

  function resetSave() {
    localStorage.removeItem(SAVE_KEY);
    setGame(null);
    setSection("Dashboard");
  }

  function resetAccess() {
    localStorage.removeItem(ACCESS_KEY);
    setHasAccess(false);
    setPassword("");
  }

  const shellClass = `gameShell uiScale-${uiScale}`;

  if (!hasMounted) return <main className="gameShell uiScale-compact" />;

  if (!hasAccess) return AccessGate();
  if (!game) return CreateCharacter();
  const activeGame: GameState = game;


  function GameOverScreen() {
    const businessesOwned = activeGame.businesses.length;
    const propertiesOwned = activeGame.properties.length;
    const finalWorth = calculateNetWorth(activeGame);
    const coffeeBusinesses = activeGame.businesses.filter((business) => business.typeId === "coffee" && business.coffee);
    const totalCustomersServed = coffeeBusinesses.reduce((sum, business) => sum + (business.coffee?.customerHistory ?? []).reduce((inner, value) => inner + value, 0), 0);
    const bestBusiness = [...activeGame.businesses].sort((a, b) => b.value - a.value)[0];
    const collapseReason = activeGame.cash <= -10000 ? "Personal debt passed $10,000." : "Cash flow collapsed.";
    return <main className={`${shellClass} gateShell`}><div className="bgGlow" /><section className="glass gameOverCard premiumGameOver"><div className="gameOverHero"><div><div className="brand gateBrand"><span className="bolt">⚡</span><span>ChargedLife</span></div><span className="versionBadge">{VERSION}</span></div><div className="bankruptSeal">BANKRUPTCY</div></div><h1>Your empire collapsed.</h1><p className="gameOverQuote">“Every empire teaches a lesson. Start again. Build smarter.”</p><div className="collapseReason"><b>Collapse reason</b><span>{collapseReason}</span></div><div className="detailGrid gameOverStats"><Detail label="Age" value={String(activeGame.age)} /><Detail label="Days Survived" value={String(activeGame.day)} /><Detail label="Net Worth" value={money(finalWorth)} bad={finalWorth < 0} good={finalWorth >= 0} /><Detail label="Businesses Owned" value={String(businessesOwned)} /><Detail label="Properties Owned" value={String(propertiesOwned)} /><Detail label="Highest Net Worth" value={money(activeGame.highestNetWorth ?? finalWorth)} /><Detail label="Total Owner Payouts" value={money(activeGame.totalProfitGenerated ?? 0)} good /><Detail label="Best Business" value={bestBusiness?.name ?? "None"} /><Detail label="Coffee Customers Served" value={String(totalCustomersServed)} /></div><button className="nextButton wideButton restartEmpireButton" onClick={() => { localStorage.removeItem(SAVE_KEY); setGame(null); setFounderStep(1); }}>🚀 Start New Life →</button></section></main>;
  }

  if (activeGame.isGameOver) return GameOverScreen();

  return (
    <main className={shellClass}>
      <div className="bgGlow" />
      <header className="topNav">
        <button className="brand brandButton" onClick={() => setSection("Dashboard")}><span className="bolt">⚡</span><span>ChargedLife</span></button>
        <nav className="navLinks">
          {navItems.map((item) => <button key={item.label} onClick={() => setSection(item.label)} className={section === item.label ? "navPill active" : "navPill"}><span>{item.icon}</span>{item.label}</button>)}
        </nav>
        <div className="wallets"><div className="wallet gem">💎 {activeGame.gems}</div><div className="wallet cash">💵 {money(activeGame.cash)}</div><button onClick={() => setSection("Settings")} className="settings">⚙️</button></div>
      </header>

      <section className="tycoonStats">
        <StatTile icon="💵" label="Cash" value={money(activeGame.cash)} tone="green" />
        <StatTile icon="🏆" label="Net Worth" value={money(netWorth)} tone="gold" />
        <StatTile icon="📥" label="Daily Income" value={`+${money(dailyIncome)}`} tone="green" />
        <StatTile icon="📤" label="Daily Expenses" value={`-${money(dailyExpenses)}`} tone="red" />
        <StatTile icon="📊" label="Daily Profit" value={`${dailyProfit >= 0 ? "+" : ""}${money(dailyProfit)}`} tone={dailyProfit >= 0 ? "green" : "red"} />
        <StatTile icon="🎂" label="Age / Day" value={`${activeGame.age} / ${getWeekday(activeGame.day)} ${activeGame.day}`} tone="blue" />
      </section>

      <section className="dashboardGrid">
        <aside className="leftRail">
          <div className="glass playerCard">
            <AvatarPortrait preset={activeGame.avatarPreset} hairstyle={activeGame.avatarHairstyle} outfit={activeGame.avatarOutfit} />
            <div><h2>{activeGame.name}</h2><p>Age {activeGame.age} • Day {activeGame.day}</p><strong>⭐ {titleForNetWorth(netWorth)}</strong><p>📍 {activeGame.city}</p><p>🧥 {activeGame.avatarOutfit}</p></div>
          </div>
          <div className="glass statsCard compactFounderStats">
            <h3>Founder Power</h3>
            <FounderStat icon="💼" label="Business Skill" value={activeGame.intelligence} tone="blue" />
            <FounderStat icon="🌟" label="Reputation" value={activeGame.reputation} tone="gold" />
            <FounderStat icon="🧠" label="Knowledge" value={Math.round((activeGame.intelligence + activeGame.reputation) / 2)} tone="green" />
          </div>
          <div className="glass cashCard"><span className="cardIcon">💼</span><h3>Cash Flow</h3><p><span>Income/day</span><b className="good">+{money(dailyIncome)}</b></p><p><span>Expenses/day</span><b className="bad">-{money(dailyExpenses)}</b></p><p><span>Profit/day</span><b className={dailyProfit >= 0 ? "good" : "bad"}>{dailyProfit >= 0 ? "+" : ""}{money(dailyProfit)}</b></p><p><span>Living cost/day</span><b>{money(activeGame.personalDailyExpenses)}</b></p></div>
        </aside>

        <section className="centerStage">{renderSection()}</section>

        <aside className="rightRail">
          <div className="glass netWorth netWorthHero"><div className="sectionHeader"><h3>Net Worth</h3><small>{(activeGame.netWorthHistory?.length ?? 0)} day history</small></div><div className="bigMoney">{money(netWorth)}</div><div className="chart"><NetWorthChart history={activeGame.netWorthHistory} current={netWorth} /></div><div className="nextMilestoneMini"><span>Next milestone</span><b>{money(nextMilestone(netWorth))}</b><ProgressBar value={(netWorth / nextMilestone(netWorth)) * 100} /></div></div>
          <MarketNewsPanel />
          <div className="glass goals"><div className="sectionHeader"><h3>Tycoon Goals</h3></div>{goalList().map((goal) => <div className={`goal ${goal.done ? "done" : ""}`} key={goal.title}><div><span>{goal.done ? "✅" : "⬜"} {goal.title}</span><b>{goal.progress}</b></div><ProgressBar value={goal.width} tone={goal.done ? "gold" : "green"} /></div>)}</div>
          <div className="glass recent"><div className="sectionHeader"><h3>Recent Events</h3></div>{activeGame.events.length ? activeGame.events.map((e) => <div className="event" key={e.id}><span>{e.icon}</span><div><b>{e.title}</b><small>Day {e.day}</small></div>{e.value && <strong className={e.good ? "good" : "bad"}>{e.value}</strong>}</div>) : <p className="muted">No events yet.</p>}</div>
        </aside>
      </section>

      <footer className="bottomDock glass slimDock"><div className="dockMeta"><b>Age {activeGame.age}</b><span>{getWeekday(activeGame.day)} • Day {activeGame.day}</span></div><div className="milestone"><b>Next:</b> {money(nextMilestone(netWorth))} net worth<ProgressBar value={(netWorth / nextMilestone(netWorth)) * 100} /></div><div className="dockProfit"><span className={dailyProfit >= 0 ? "good" : "bad"}>{dailyProfit >= 0 ? "+" : ""}{money(dailyProfit)}/day</span></div><button className="nextButton" onClick={nextDay}>Next Day →</button></footer>

      {showBusinessModal && CreateBusinessModal()}
      {showPropertyModal && BuyPropertyModal()}
      {coffeeHiringBusinessId && CoffeeHiringModal()}
    </main>
  );

  function AccessGate() {
    const teaserCards = [
      { icon: "🏢", title: "Build Businesses", text: "Create companies, manage operations, hire staff, and grow from nothing." },
      { icon: "👥", title: "Manage People", text: "Balance wages, plan schedules, and build a team that actually performs." },
      { icon: "📈", title: "Grow Net Worth", text: "Invest, expand, buy properties, and chase millionaire milestones." },
      { icon: "⚠️", title: "Survive Failure", text: "Bad choices can drain your cash, collapse your business, and end your run." },
    ];

    return (
      <main className={`${shellClass} gateShell teaserGate`}>
        <div className="bgGlow" />
        <section className="glass gateCard teaserCard">
          <div className="gateTopline">
            <div className="brand gateBrand"><span className="bolt">⚡</span><span>ChargedLife</span></div>
            <span className="versionBadge compactVersion">{VERSION}</span>
          </div>
          <p className="tagline teaserTagline">Start broke. Die legendary.</p>
          <div className="testerBadge">🔒 Private Tester Access</div>
          <h1>Build your empire from nothing.</h1>
          <p className="heroSubtext">Create companies, hire employees, manage cash flow, invest wisely, buy properties, and survive the consequences of bad decisions.</p>

          <div className="teaserGrid">
            {teaserCards.map((card) => (
              <div className="teaserFeature" key={card.title}>
                <span>{card.icon}</span>
                <div>
                  <b>{card.title}</b>
                  <p>{card.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="accessSplit">
            <div className="accessInfo">
              <span className="previewLabel">Exclusive pre-alpha</span>
              <h3>Invited testers only</h3>
              <p className="muted">This build is locked while ChargedLife is being shaped with early feedback.</p>
            </div>
            <div className="accessBox">
              <span className="previewLabel">Already have access?</span>
              <input className="textInput" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && unlock()} placeholder="Enter tester key" />
              {passwordError && <p className="formError">{passwordError}</p>}
              <button className="nextButton wideButton" onClick={unlock}>Unlock ChargedLife →</button>
            </div>
          </div>

          <div className="wantAccess">
            <div>
              <b>Want access?</b>
              <p>Join the tester list or ask for a pre-alpha key.</p>
            </div>
            <button type="button" disabled>Request Tester Access · Coming Soon</button>
          </div>
        </section>
      </main>
    );
  }

  function CreateCharacter() {
    const backgroundOptions: { key: Background; icon: string; label: string; cash: number; expenses: number; note: string }[] = [
      { key: "Poor", icon: "🟥", label: "Poor", cash: 500, expenses: 18, note: "Hard Start" },
      { key: "Working Class", icon: "🟨", label: "Working Class", cash: 2000, expenses: 28, note: "Balanced" },
      { key: "Middle Class", icon: "🟩", label: "Middle Class", cash: 5000, expenses: 45, note: "Comfortable Start" },
      { key: "Wealthy", icon: "🟦", label: "Wealthy", cash: 20000, expenses: 95, note: "Strong Start" },
    ];
    const traitOptions: { key: Trait; icon: string; label: string; note: string; business: number; reputation: number; knowledge: number; growth: number }[] = [
      { key: "Gamer", icon: "🎮", label: "Gamer", note: "Better tech businesses", business: 6, reputation: 0, knowledge: 8, growth: 4 },
      { key: "Hustler", icon: "💰", label: "Hustler", note: "Higher business skill", business: 12, reputation: 5, knowledge: 0, growth: 3 },
      { key: "Smart Kid", icon: "🧠", label: "Smart Kid", note: "Higher knowledge", business: 4, reputation: 0, knowledge: 18, growth: 2 },
      { key: "Creative", icon: "🎨", label: "Creative", note: "Better growth", business: 8, reputation: 3, knowledge: 7, growth: 8 },
      { key: "Popular", icon: "⭐", label: "Popular", note: "Higher reputation", business: 2, reputation: 18, knowledge: 0, growth: 3 },
    ];
    const difficultyOptions: { key: Difficulty; icon: string; label: string; note: string; cashMod: number; expenseMod: number; growth: string }[] = [
      { key: "Easy", icon: "🟢", label: "Easy", note: "More starting cash, lower expenses", cashMod: 1.35, expenseMod: 0.75, growth: "Fast" },
      { key: "Normal", icon: "🟡", label: "Normal", note: "Balanced tycoon experience", cashMod: 1, expenseMod: 1, growth: "Balanced" },
      { key: "Hard", icon: "🔴", label: "Hard", note: "Less cash, higher expenses", cashMod: 0.72, expenseMod: 1.3, growth: "Slower" },
    ];
    const countryOptions: Country[] = ["Norway", "Turkey", "Netherlands", "USA", "UK", "Germany", "Sweden", "Denmark", "Spain", "Canada"];
    const avatarOptions: AvatarPreset[] = ["Young Founder", "Gamer Founder", "Business Founder", "Creative Founder", "Investor Founder"];
    const outfitOptions: OutfitStyle[] = ["Hoodie", "Starter Jacket", "Smart Casual", "Suit", "Luxury Outfit"];
    const hairstyleOptions: Hairstyle[] = ["Short Hair", "Medium Hair", "Long Hair", "Curly Hair", "Buzz Cut"];
    const selectedBackground = backgroundOptions.find((item) => item.key === createForm.background) ?? backgroundOptions[1];
    const selectedTrait = traitOptions.find((item) => item.key === createForm.trait) ?? traitOptions[1];
    const selectedDifficulty = difficultyOptions.find((item) => item.key === createForm.difficulty) ?? difficultyOptions[1];
    const previewCash = Math.round(selectedBackground.cash * selectedDifficulty.cashMod);
    const previewExpenses = Math.round(selectedBackground.expenses * selectedDifficulty.expenseMod);
    const previewName = createForm.name.trim() || "Your Founder";
    const canContinue = founderStep !== 1 || createForm.name.trim().length >= 2;
    const steps = [
      { id: 1, label: "Identity" },
      { id: 2, label: "Founder" },
      { id: 3, label: "Appearance" },
      { id: 4, label: "Story" },
    ];
    const nextFounderStep = () => canContinue && setFounderStep(Math.min(4, founderStep + 1));
    const backFounderStep = () => setFounderStep(Math.max(1, founderStep - 1));

    return (
      <main className={`${shellClass} gateShell founderGate founderWizardShell`}>
        <div className="bgGlow" />
        <section className="glass createCard founderCreateCard founderWizardCard">
          <div className="founderTop wizardTop">
            <div className="brand gateBrand founderBrand"><span className="bolt">⚡</span><span>ChargedLife</span><span className="versionBadge inlineVersion">{VERSION}</span></div>
            <p className="tagline founderTagline">Start broke. Die legendary.</p>
          </div>

          <div className="wizardProgress" aria-label="Founder creation progress">
            {steps.map((step) => (
              <button
                type="button"
                key={step.id}
                className={`${founderStep === step.id ? "active" : ""} ${founderStep > step.id ? "complete" : ""}`}
                onClick={() => setFounderStep(step.id)}
              >
                <span>{founderStep > step.id ? "✓" : step.id}</span>
                <b>{step.label}</b>
              </button>
            ))}
          </div>

          <div className="founderWizardLayout">
            <div className="glass wizardMainPanel">
              {founderStep === 1 && (
                <div className="wizardStepPanel">
                  <div className="stepEyebrow">Step 1 of 4</div>
                  <h1>Create Your Founder</h1>
                  <p className="muted introCopy">Every empire starts with a dream. Choose who you are and where your journey begins.</p>
                  <div className="formGrid compactFormGrid oneInput wizardNameInput">
                    <label>Founder Name<input className="textInput" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="Enter your founder name..." autoFocus /></label>
                  </div>
                  <div className="choiceBlock">
                    <h3>Choose Country</h3>
                    <div className="countryGrid wizardCountryGrid">
                      {countryOptions.map((country) => <button type="button" key={country} className={createForm.city === country ? "countryChip selected" : "countryChip"} onClick={() => setCreateForm({ ...createForm, city: country })}>{country}</button>)}
                    </div>
                  </div>
                </div>
              )}

              {founderStep === 2 && (
                <div className="wizardStepPanel">
                  <div className="stepEyebrow">Step 2 of 4</div>
                  <h1>Choose Your Founder</h1>
                  <p className="muted introCopy">Pick the founder identity that matches the empire you want to build.</p>
                  <div className="wizardHeroAvatar"><AvatarPortrait preset={createForm.avatarPreset} hairstyle={createForm.avatarHairstyle} outfit={createForm.avatarOutfit} large /></div>
                  <div className="choiceGrid fiveChoices avatarChoiceGrid wizardAvatarGrid">
                    {avatarOptions.map((preset) => {
                      const defaults = avatarDefaults(preset);
                      return <button type="button" key={preset} className={createForm.avatarPreset === preset ? "choiceCard selected" : "choiceCard"} onClick={() => setCreateForm({ ...createForm, avatarPreset: preset, avatarHairstyle: defaults.hairstyle, avatarOutfit: defaults.outfit })}><AvatarPortrait preset={preset} hairstyle={defaults.hairstyle} outfit={defaults.outfit} /><b>{preset}</b></button>;
                    })}
                  </div>
                </div>
              )}

              {founderStep === 3 && (
                <div className="wizardStepPanel">
                  <div className="stepEyebrow">Step 3 of 4</div>
                  <h1>Customize Your Appearance</h1>
                  <p className="muted introCopy">Make your founder feel like yours. Your preview updates instantly.</p>
                  <div className="wizardHeroAvatar"><AvatarPortrait preset={createForm.avatarPreset} hairstyle={createForm.avatarHairstyle} outfit={createForm.avatarOutfit} large /></div>
                  <div className="choiceBlock">
                    <h3>Hairstyle</h3>
                    <div className="countryGrid">
                      {hairstyleOptions.map((hairstyle) => <button type="button" key={hairstyle} className={createForm.avatarHairstyle === hairstyle ? "countryChip selected" : "countryChip"} onClick={() => setCreateForm({ ...createForm, avatarHairstyle: hairstyle })}>💇 {hairstyle}</button>)}
                    </div>
                  </div>
                  <div className="choiceBlock">
                    <h3>Outfit Style</h3>
                    <div className="countryGrid">
                      {outfitOptions.map((outfit) => <button type="button" key={outfit} className={createForm.avatarOutfit === outfit ? "countryChip selected" : "countryChip"} onClick={() => setCreateForm({ ...createForm, avatarOutfit: outfit })}>🧥 {outfit}</button>)}
                    </div>
                  </div>
                </div>
              )}

              {founderStep === 4 && (
                <div className="wizardStepPanel">
                  <div className="stepEyebrow">Step 4 of 4</div>
                  <h1>Choose Your Starting Story</h1>
                  <p className="muted introCopy">Your background, trait, and difficulty shape your starting cash flow and early momentum.</p>
                  <div className="choiceBlock">
                    <h3>Family Background</h3>
                    <div className="choiceGrid fourChoices">
                      {backgroundOptions.map((option) => <button type="button" key={option.key} className={createForm.background === option.key ? "choiceCard selected" : "choiceCard"} onClick={() => setCreateForm({ ...createForm, background: option.key })}><span>{option.icon}</span><b>{option.label}</b><small>Start Cash: {money(option.cash)}</small><em>{option.note}</em></button>)}
                    </div>
                  </div>
                  <div className="choiceBlock">
                    <h3>Childhood Trait</h3>
                    <div className="choiceGrid fiveChoices">
                      {traitOptions.map((option) => <button type="button" key={option.key} className={createForm.trait === option.key ? "choiceCard selected" : "choiceCard"} onClick={() => setCreateForm({ ...createForm, trait: option.key })}><span>{option.icon}</span><b>{option.label}</b><small>{option.note}</small></button>)}
                    </div>
                  </div>
                  <div className="choiceBlock">
                    <h3>Difficulty</h3>
                    <div className="choiceGrid threeChoices">
                      {difficultyOptions.map((option) => <button type="button" key={option.key} className={createForm.difficulty === option.key ? "choiceCard selected" : "choiceCard"} onClick={() => setCreateForm({ ...createForm, difficulty: option.key })}><span>{option.icon}</span><b>{option.label}</b><small>{option.note}</small><em>Growth: {option.growth}</em></button>)}
                    </div>
                  </div>
                </div>
              )}

              <div className="wizardNav">
                <button type="button" className="secondaryButton" onClick={backFounderStep} disabled={founderStep === 1}>← Back</button>
                {founderStep < 4 ? (
                  <button type="button" className="nextButton" onClick={nextFounderStep} disabled={!canContinue}>Continue →</button>
                ) : (
                  <button type="button" className="nextButton launchButton" onClick={startGame} disabled={!createForm.name.trim()}>🚀 Launch Your Empire</button>
                )}
              </div>
            </div>

            <aside className="glass founderPreview wizardPreviewPanel">
              <div className="previewAvatarWrap"><AvatarPortrait preset={createForm.avatarPreset} hairstyle={createForm.avatarHairstyle} outfit={createForm.avatarOutfit} large /></div>
              <span className="previewLabel">Founder Preview</span>
              <h2>{previewName}</h2>
              <p className="goldText">Future Entrepreneur</p>
              <div className="selectedSummary">
                <span>{createForm.city}</span>
                <span>{createForm.avatarPreset}</span>
                <span>{createForm.avatarHairstyle}</span>
                <span>{createForm.avatarOutfit}</span>
                <span>{createForm.background}</span>
                <span>{createForm.trait}</span>
              </div>
              <div className="previewStats">
                <p><span>Starting Cash</span><b className="good">{money(previewCash)}</b></p>
                <p><span>Daily Expenses</span><b className="bad">-{money(previewExpenses)}</b></p>
                <p><span>Business Skill</span><b>+{selectedTrait.business}%</b></p>
                <p><span>Reputation</span><b>+{selectedTrait.reputation}%</b></p>
                <p><span>Knowledge</span><b>+{selectedTrait.knowledge}%</b></p>
                <p><span>Growth Bonus</span><b>+{selectedTrait.growth}%</b></p>
                <p><span>Difficulty</span><b>{createForm.difficulty}</b></p>
              </div>
              <div className="firstMissionCard">
                <span>🎯</span>
                <div><b>First Mission</b><p>Create your first business</p><small>Reward: 25 Gems. Begin your journey toward becoming a millionaire entrepreneur.</small></div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    );
  }

  function renderSection() {
    if (section === "Dashboard") return DashboardSection();
    if (section === "Empire") return EmpireSection();
    if (section === "Invest") return InvestSection();
    if (section === "Career") return CareerSection();
    if (section === "Properties") return PropertiesSection();
    if (section === "Community") return CommunitySection();
    if (section === "Shop") return ShopSection();
    return SettingsSection();
  }

  function DashboardSection() {
    const actions = [
      { title: "Create Business", text: "Open your first company and start producing cash flow.", button: "Create", image: "/art/rocket.svg", click: openCreateBusiness },
      { title: "Manage Empire", text: "Upgrade, market, hire, and improve your businesses.", button: "Manage", image: "/art/hosting.svg", click: () => setSection("Empire") },
      { title: "Invest Money", text: "Put spare cash into funds, stocks, crypto, and startups.", button: "Invest", image: "/art/invest.svg", click: () => setSection("Invest") },
      { title: "Buy Property", text: "Buy rentals, find tenants, and build passive income.", button: "Properties", image: "/art/property.svg", click: () => setSection("Properties") },
      { title: "Improve Skills", text: "Increase business skill and unlock stronger results.", button: "Learn", image: "/art/skills.svg", click: improveSkills },
      { title: "Next Day", text: "Collect profit, pay expenses, and advance the simulation.", button: "Next Day", image: "/art/social.svg", click: nextDay },
    ];
    return <><div className="glass heroPanel"><div className="heroHeader"><div><h1>What will you build today?</h1><p>Start with zero empire. Create businesses, buy properties, invest, and grow net worth.</p></div><button className="softButton" onClick={openCreateBusiness}>＋ Create Business</button></div><div className="actionGrid">{actions.map((a) => <article className="actionCard" key={a.title}><img src={a.image} alt="" /><h3>{a.title}</h3><p>{a.text}</p><button onClick={a.click}>{a.button}</button></article>)}</div></div>{Challenge()}{EmpirePreview()}</>;
  }

  function Challenge() {
    return <div className="glass challenge"><div className="trophy">🏆</div><div><h3>Challenge: <span>From Broke to Millionaire</span></h3><p>Reach $1,000,000 net worth through business, property, and investing.</p></div><ProgressBar value={millionaireProgress} /><b>{clamp(millionaireProgress)}%</b><div className="reward">Reward: 💎 500</div></div>;
  }

  function EmpirePreview() {
    return <div className="glass empirePanel"><div className="sectionHeader"><h2>Your Empire</h2><button onClick={() => setSection("Empire")}>View All</button></div>{activeGame.businesses.length === 0 ? <div className="emptyHero"><h3>You have no businesses yet.</h3><p>Create your first company and begin your journey from startup founder to billionaire.</p><button className="nextButton" onClick={openCreateBusiness}>＋ Create Business</button></div> : <div className="empireGrid">{activeGame.businesses.slice(0, 5).map((business) => <BusinessCard key={business.id} business={business} onClick={() => { setSelectedBusinessId(business.id); setSection("Empire"); }} />)}<button className="addCard" onClick={openCreateBusiness}><span>＋</span>Add Business</button></div>}</div>;
  }



  function MarketNewsPanel() {
    const news = marketNewsForDay(activeGame.day);
    return <div className="glass marketNews"><div className="sectionHeader"><h3>Market News</h3><small>Day {activeGame.day}</small></div><div className="marketBody"><span>{news.icon}</span><div><b>{news.title}</b><p>{news.text}</p><em>{news.tag}</em></div></div></div>;
  }

  function MinecraftServerPanel({ business }: { business: Business }) {
    const mc = business.minecraft;
    if (!mc) return null;
    const costs = minecraftCosts(mc);
    const revenue = minecraftRevenue(mc);
    const profit = revenue - costs.total;
    const hosting = minecraftHostingTiers.find((tier) => tier.id === mc.hostingTier) ?? minecraftHostingTiers[0];
    const content = minecraftContentTiers.find((tier) => tier.id === mc.contentTier) ?? minecraftContentTiers[0];
    return <div className="glass managePanel minecraftPanel">
      <div className="sectionHeader bigHeader">
        <div>
          <span className="previewLabel">Minecraft Server V2</span>
          <h2>⛏️ {business.name}</h2>
          <p>{mc.expansions.join(" • ")} • {hosting.name} • {content.name}</p>
        </div>
        <button className="sellButton" onClick={() => manageBusiness(business.id, "sell")}>Sell for {money(business.value * 0.92)}</button>
      </div>

      <div className="minecraftHeroGrid">
        <div className="mcMetric highlight"><span>Daily Players</span><b>{mc.dailyPlayers}</b><em className={mc.lastTrend >= 0 ? "good" : "bad"}>{mc.lastTrend >= 0 ? "+" : ""}{mc.lastTrend} today</em></div>
        <div className="mcMetric"><span>Peak Players</span><b>{mc.peakPlayers}</b><em>online peak</em></div>
        <div className="mcMetric"><span>Retention</span><b>{mc.retention}%</b><ProgressBar value={mc.retention} tone="blue" /></div>
        <div className="mcMetric"><span>Store Conversion</span><b>{mc.storeConversion.toFixed(1)}%</b><em>{money(mc.averagePurchase)} avg purchase</em></div>
      </div>

      <div className="detailGrid mcDetailGrid">
        <Detail label="Store Revenue" value={`+${money(revenue)}/day`} good />
        <Detail label="Hosting Cost" value={`-${money(costs.hostingCost)}/day`} bad />
        <Detail label="Plugin Cost" value={`-${money(costs.pluginCost)}/day`} bad />
        <Detail label="Staff Cost" value={`-${money(costs.staffCost)}/day`} bad />
        <Detail label="Network Cost" value={`-${money(costs.expansionCost)}/day`} bad />
        <Detail label="Daily Profit" value={`${profit >= 0 ? "+" : ""}${money(profit)}/day`} good={profit >= 0} bad={profit < 0} />
        <Detail label="Reputation" value={`${business.reputation}%`} />
        <Detail label="Server Quality" value={`${mc.serverQuality}%`} />
        <Detail label="Content Quality" value={`${mc.contentQuality}%`} />
        <Detail label="Staff Quality" value={`${mc.staffQuality}%`} />
      </div>

      <div className="mcManagementGrid">
        <section className="mcManageCard">
          <h3>🖥️ Hosting Provider</h3>
          <p>Better hosting costs more but improves quality, retention, and reputation.</p>
          <div className="mcChoiceList">{minecraftHostingTiers.map((tier) => <button key={tier.id} className={mc.hostingTier === tier.id ? "mcChoice selected" : "mcChoice"} onClick={() => upgradeMinecraftHosting(business.id, tier.id)}>
            <b>{tier.name}</b><span>{money(tier.cost)}/day • Quality {tier.quality}%</span><small>{tier.description}</small>
          </button>)}</div>
        </section>

        <section className="mcManageCard">
          <h3>🔌 Plugins & Content</h3>
          <p>Content keeps players around. Custom systems cost more but improve growth.</p>
          <div className="mcChoiceList">{minecraftContentTiers.map((tier) => <button key={tier.id} className={mc.contentTier === tier.id ? "mcChoice selected" : "mcChoice"} onClick={() => upgradeMinecraftContent(business.id, tier.id)}>
            <b>{tier.name}</b><span>{money(tier.cost)}/day • Quality {tier.quality}%</span><small>{tier.description}</small>
          </button>)}</div>
        </section>

        <section className="mcManageCard">
          <h3>👥 Staff Team</h3>
          <p>Bad staff lose players. Trained staff improves safety, retention, and reputation.</p>
          <div className="staffCounts"><span>Mods <b>{mc.moderators}</b></span><span>Admins <b>{mc.admins}</b></span><span>Devs <b>{mc.developers}</b></span></div>
          <div className="manageActions compactActions"><button onClick={() => minecraftStaffAction(business.id, "train")}>Train Staff</button><button onClick={() => minecraftStaffAction(business.id, "mod")}>Hire Moderator</button><button onClick={() => minecraftStaffAction(business.id, "admin")}>Hire Admin</button><button onClick={() => minecraftStaffAction(business.id, "dev")}>Hire Developer</button><button onClick={() => minecraftStaffAction(business.id, "guidelines")}>Staff Guidelines</button></div>
        </section>

        <section className="mcManageCard">
          <h3>🧭 Network Expansions</h3>
          <p>Expansions increase potential, but launching too early can destroy profit.</p>
          <div className="expansionGrid">{minecraftExpansions.map((expansion) => {
            const owned = mc.expansions.includes(expansion.name);
            return <button key={expansion.id} className={owned ? "expansionCard owned" : "expansionCard"} onClick={() => expandMinecraftServer(business.id, expansion.name)} disabled={owned}>
              <b>{owned ? "✓ " : "＋"}{expansion.name}</b><span>{money(expansion.cost)} setup</span><small>{money(expansion.dailyCost)}/day • Wants {expansion.requirement}+ players</small>
            </button>;
          })}</div>
        </section>
      </div>
    </div>;
  }


  function CoffeeShopPanel({ business }: { business: Business }) {
    const coffeeData = business.coffee ? migrateCoffeeData(business.coffee, Math.max(3200, business.value), business.coffee.locationId) : undefined;
    if (!coffeeData) return null;
    const cleanCoffee: CoffeeShopData = coffeeData;
    const location = coffeeLocations.find((item) => item.id === cleanCoffee.locationId) ?? coffeeLocations[1];
    const costs = coffeeCosts(cleanCoffee, activeGame.day);
    const revenue = coffeeRevenue(cleanCoffee);
    const profit = revenue - costs.total;
    const stage = coffeeExpansionStages.find((item) => item.name === cleanCoffee.stage) ?? coffeeExpansionStages[0];
    const nextStage = coffeeExpansionStages[coffeeExpansionStages.findIndex((item) => item.name === cleanCoffee.stage) + 1];
    const campaign = getCoffeeCampaign(cleanCoffee.activeCampaign);
    const employees = coffeeEmployees(cleanCoffee);
    const traffic = cleanCoffee.hourlyTraffic?.length ? cleanCoffee.hourlyTraffic : coffeeHourlyTraffic(cleanCoffee, activeGame.day);
    const weekday = getWeekday(activeGame.day);
    const plannerShifts = activeCoffeeShifts(cleanCoffee, coffeeScheduleDay);
    const plannerPayroll = coffeePayroll(cleanCoffee, coffeeScheduleDay);
    const report = cleanCoffee.lastReport;
    const liveFlow = coffeeCustomerFlow(cleanCoffee, activeGame.day);
    const flow = report ?? liveFlow;
    const coverageTone = cleanCoffee.staffCoverage < 78 ? "bad" : cleanCoffee.staffCoverage > 125 ? "warn" : "good";
    const maxProfit = Math.max(1, ...(cleanCoffee.profitHistory ?? [profit]).map((value) => Math.abs(value)));
    const maxRevenue = Math.max(1, ...(cleanCoffee.revenueHistory ?? [revenue]));
    const maxCustomers = Math.max(1, ...(cleanCoffee.customerHistory ?? [cleanCoffee.dailyCustomers]));
    const coffeeTabs: CoffeeTab[] = ["Overview", "Staff", "Schedule", "Marketing", "Upgrades", "Reports"];
    const activeShiftsForToday = activeCoffeeShifts(cleanCoffee, activeGame.day);
    const todayTrafficLabel = trafficLabelFromValue(Math.max(...traffic));
    const trendBarHeight = (value: number, max: number) => `${Math.max(8, Math.min(100, (Math.abs(value) / Math.max(1, max)) * 100))}%`;

    function CoffeeTopStats() {
      return <div className="coffeeCommandGrid coffeeCommandGridCompact">
        <div className={`commandStat ${profit >= 0 ? "positive" : "negative"}`}><span>📊 Daily Profit</span><b>{profit >= 0 ? "+" : ""}{money(profit)}</b><em>Revenue {money(revenue)} • Costs {money(costs.total)}</em></div>
        <div className="commandStat"><span>🏦 Business Cash</span><b>{money(business.businessCash ?? 0)}</b><em>Owner payout {business.ownerPayout ?? 30}%</em></div>
        <div className="commandStat"><span>👥 Customers</span><b>{cleanCoffee.dailyCustomers}</b><em className={cleanCoffee.lastTrend >= 0 ? "good" : "bad"}>{cleanCoffee.lastTrend >= 0 ? "+" : ""}{cleanCoffee.lastTrend} vs yesterday</em></div>
        <div className="commandStat"><span>⭐ Reviews</span><b>{cleanCoffee.reviewScore.toFixed(1)}</b><em>{coffeeReviewStars(cleanCoffee.reviewScore)}</em></div>
        <div className={`commandStat ${coverageTone}`}><span>📋 Staff Coverage</span><b>{cleanCoffee.staffCoverage}%</b><em>{cleanCoffee.staffCoverage < 78 ? "Understaffed" : cleanCoffee.staffCoverage > 125 ? "Overstaffed" : "Good coverage"}</em></div>
        <div className="commandStat"><span>❤️ Business Health</span><b>{business.businessHealth ?? calculateBusinessHealth(business)}%</b><em>{business.businessHealth && business.businessHealth < 45 ? "Needs attention" : "Stable"}</em></div>
      </div>;
    }

    function CustomerFlowCard() {
      return <section className="glass insightPanel compactInsightPanel">
        <div className="sectionHeader"><h3>🧭 Customer Flow</h3><small>See exactly why customers came or left.</small></div>
        <div className="flowGrid">
          <Detail label="Potential Customers" value={String(flow.potentialCustomers)} />
          <Detail label="Lost to Competition" value={`-${flow.lostCompetition}`} bad />
          <Detail label="Lost to Long Wait" value={`-${flow.lostLongWait}`} bad />
          <Detail label="Lost to High Prices" value={`-${flow.lostHighPrices}`} bad />
          <Detail label="Actual Customers" value={String(flow.actualCustomers)} good />
        </div>
      </section>;
    }

    function TrendCard() {
      return <section className="glass insightPanel compactInsightPanel trendPanelSafe">
        <div className="sectionHeader"><h3>📈 7-Day Trend</h3><small>Customers • Revenue • Profit</small></div>
        <div className="trendRows">
          <div><b>Customers</b><div className="trendBars">{(cleanCoffee.customerHistory?.length ? cleanCoffee.customerHistory.slice(-7) : [cleanCoffee.dailyCustomers]).map((value, index) => <i key={index} style={{ height: trendBarHeight(value, maxCustomers) }} />)}</div></div>
          <div><b>Revenue</b><div className="trendBars greenBars">{(cleanCoffee.revenueHistory?.length ? cleanCoffee.revenueHistory.slice(-7) : [revenue]).map((value, index) => <i key={index} style={{ height: trendBarHeight(value, maxRevenue) }} />)}</div></div>
          <div><b>Profit</b><div className="trendBars profitBars">{(cleanCoffee.profitHistory?.length ? cleanCoffee.profitHistory.slice(-7) : [profit]).map((value, index) => <i key={index} className={value >= 0 ? "positiveBar" : "negativeBar"} style={{ height: trendBarHeight(value, maxProfit) }} />)}</div></div>
        </div>
      </section>;
    }

    function FinanceCard() {
      return <section className="glass insightPanel compactInsightPanel">
        <div className="sectionHeader"><h3>🏦 Business Finances</h3><small>Profit enters the business first, then owner payout is transferred.</small></div>
        <div className="staffStats"><Detail label="Business Cash" value={money(business.businessCash ?? 0)} /><Detail label="Owner Payout" value={`${business.ownerPayout ?? 30}%`} /><Detail label="Business Health" value={`${business.businessHealth ?? calculateBusinessHealth(business)}%`} /><Detail label="Estimated Owner Income" value={`+${money(businessOwnerPayoutEstimate(business))}/day`} good /></div>
        <div className="miniButtons payoutButtons">{[0, 10, 20, 30, 40, 50, 75, 100].map((payout) => <button key={payout} className={(business.ownerPayout ?? 30) === payout ? "activeMini" : ""} onClick={() => setBusinessOwnerPayout(business.id, payout)}>{payout}%</button>)}</div>
      </section>;
    }

    function OverviewTab() {
      return <div className="coffeeTabPane">
        <CoffeeTopStats />
        <div className="detailGrid mcDetailGrid compactCoffeeDetails">
          <Detail label="Revenue" value={`+${money(revenue)}/day`} good />
          <Detail label="Rent" value={`-${money(costs.rent)}/day`} bad />
          <Detail label="Payroll" value={`-${money(costs.wages)}/day`} bad />
          <Detail label="Supplies" value={`-${money(costs.supplies)}/day`} bad />
          <Detail label="Marketing" value={`-${money(costs.marketing)}/day`} bad />
          <Detail label="Coffee Price" value={`${money(cleanCoffee.coffeePrice)} / cup`} />
          <Detail label="Satisfaction" value={`${Math.round(cleanCoffee.satisfaction)}%`} />
          <Detail label="Brand Reputation" value={`${cleanCoffee.brandReputation}%`} />
        </div>
        <div className="coffeeTwoColumn">
          <CustomerFlowCard />
          <TrendCard />
        </div>
        <FinanceCard />
        <section className="glass insightPanel compactInsightPanel"><div className="sectionHeader"><h3>📰 Recent Coffee Events</h3><small>{weekday} • Day {activeGame.day}</small></div>{activeGame.events.filter((event) => event.title.includes(business.name)).slice(0, 4).map((event) => <div className="event" key={event.id}><span>{event.icon}</span><div><b>{event.title}</b><small>Day {event.day}</small></div>{event.value && <strong className={event.good ? "good" : "bad"}>{event.value}</strong>}</div>)}{!activeGame.events.some((event) => event.title.includes(business.name)) && <p className="muted">No coffee shop events yet. Run a few days to build a story.</p>}</section>
      </div>;
    }

    function StaffTab() {
      return <div className="coffeeTabPane">
        <div className="sectionHeader bigHeader"><div><h2>👥 Staff</h2><p>Employees affect speed, service, satisfaction, and payroll.</p></div><button className="softButton alwaysVisible" onClick={() => openCoffeeHiring(business.id)}>Open Hiring</button></div>
        <div className="employeeRoster employeeRosterV3">{employees.length ? employees.map((employee) => {
          const todayHours = employeeHoursForShifts(activeShiftsForToday, employee.id);
          const weekHours = weeklyEmployeeHours(cleanCoffee, employee.id);
          const overworked = todayHours > 8 || weekHours > 40;
          return <article className={`employeeCard employeeCardV3 ${overworked ? "overworked" : ""}`} key={employee.id}>
            <div className="employeeAvatar bigEmployeeAvatar">{employee.avatar}</div>
            <div className="employeeMain"><h3>{employee.name}</h3><p>{employee.role} • {employee.note}</p><div className="employeeBars"><span>Skill <b>{employee.skill}</b></span><ProgressBar value={employee.skill} tone="blue" /><span>Reliability <b>{employee.reliability}</b></span><ProgressBar value={employee.reliability} tone="green" /><span>Mood <b>{employee.mood}</b></span><ProgressBar value={employee.mood} tone={employee.mood < 45 ? "red" : "gold"} /></div></div>
            <div className="employeeNumbers"><Detail label="Wage" value={`${money(employee.hourlyWage)}/hr`} /><Detail label="Today" value={`${todayHours}h / 8h`} bad={todayHours > 8} good={todayHours <= 8} /><Detail label="Week" value={`${weekHours}h / 40h`} bad={weekHours > 40} good={weekHours <= 40} /></div>
            <div className="employeeActions"><button onClick={() => trainCoffeeTeam(business.id, employee.role === "Store Manager" ? "leadership" : employee.role === "Shift Lead" ? "service" : "coffee")}>Train</button><button className="sellButton" onClick={() => { if (confirm(`Fire ${employee.name}? This removes them from every schedule.`)) fireCoffeeEmployee(business.id, employee.id); }}>Fire</button></div>
            {overworked && <div className="employeeWarning">⚠ Overworked: performance and mood may drop.</div>}
          </article>;
        }) : <div className="emptyHero"><h3>No employees yet</h3><p>Hire staff to serve customers and avoid long wait times.</p><button className="nextButton" onClick={() => openCoffeeHiring(business.id)}>Open Hiring</button></div>}</div>
        <div className="miniButtons trainingButtons"><button onClick={() => trainCoffeeTeam(business.id, "basic")}>Basic Training</button><button onClick={() => trainCoffeeTeam(business.id, "service")}>Service Training</button><button onClick={() => trainCoffeeTeam(business.id, "coffee")}>Coffee Training</button><button onClick={() => trainCoffeeTeam(business.id, "leadership")}>Leadership</button></div>
      </div>;
    }

    function ScheduleTab() {
      const selectedTraffic = coffeeHourlyTraffic(cleanCoffee, weekDays.indexOf(coffeeScheduleDay) + 1);
      const peak = selectedTraffic.map((value, hour) => ({ value, hour })).sort((a, b) => b.value - a.value).slice(0, 2).map((item) => `${String(item.hour).padStart(2, "0")}:00`).join(", ");
      return <div className="coffeeTabPane">
        <div className="sectionHeader bigHeader"><div><h2>📋 Schedule</h2><p>Plan each weekday around traffic. Understaff rush hours lose customers; overstaff quiet hours kills profit.</p></div></div>
        <div className="miniButtons weekdayButtons coffeeWeekTabs">{weekDays.map((day) => <button key={day} className={coffeeScheduleDay === day ? "activeMini" : ""} onClick={() => setCoffeeScheduleDay(day)}>{day.slice(0, 3)}</button>)}</div>
        <div className="plannerSummary plannerSummaryV3"><Detail label="Planning Day" value={coffeeScheduleDay} /><Detail label="Opening Hours" value={`${String(cleanCoffee.openingHour).padStart(2, "0")}:00-${String(cleanCoffee.closingHour).padStart(2, "0")}:00`} /><Detail label="Today's Traffic" value={todayTrafficLabel} /><Detail label="Peak Hours" value={peak || "Closed"} /><Detail label="Estimated Customers" value={String(liveFlow.actualCustomers)} /><Detail label="Scheduled Payroll" value={`-${money(plannerPayroll)}`} bad /><Detail label="Coverage" value={`${coffeeCoverage({ ...cleanCoffee, shifts: plannerShifts }, activeGame.day)}%`} /><Detail label="Max Hours" value="8h/day • 40h/week" /></div>
        <div className="hoursButtons compactHoursButtons">{[[6, 18], [7, 19], [8, 22], [6, 22]].map(([open, close]) => <button key={`${open}-${close}`} className={cleanCoffee.openingHour === open && cleanCoffee.closingHour === close ? "tierCard active" : "tierCard"} onClick={() => setCoffeeHours(business.id, open, close)}><b>{String(open).padStart(2, "0")}:00-{String(close).padStart(2, "0")}:00</b><small>{close - open} open hours</small></button>)}</div>
        <section className="glass insightPanel compactInsightPanel"><div className="sectionHeader"><h3>🕒 Hourly Traffic</h3><small>Use this to schedule workers around demand.</small></div><div className="trafficHeatmap compactHeatmap">{Array.from({ length: 17 }, (_, i) => i + 6).map((hour) => { const value = selectedTraffic[hour] ?? 0; return <div key={hour} className="heatmapRow"><span>{String(hour).padStart(2, "0")}:00</span><div><i style={{ width: `${Math.min(100, value)}%` }} /></div><b>{trafficLabelFromValue(value)}</b></div>; })}</div></section>
        <div className="plannerShiftGrid plannerShiftGridV3">{plannerShifts.map((shift) => {
          const demand = coffeeShiftDemand(cleanCoffee, shift, activeGame.day);
          const statusClass = demand.status.toLowerCase();
          const assignedNames = shift.employeeIds.map((id) => employees.find((employee) => employee.id === id)).filter(Boolean) as CoffeeEmployee[];
          return <article key={shift.id} className={`plannerShiftCard ${statusClass}`}>
            <div className="plannerShiftHead"><div><b>{shift.label}</b><span>{String(shift.start).padStart(2, "0")}:00-{String(shift.end).padStart(2, "0")}:00</span></div><strong>{demand.status}</strong></div>
            <div className="shiftDemandGrid"><Detail label="Traffic" value={trafficLabelFromValue(demand.avgTraffic)} /><Detail label="Required" value={String(demand.required)} /><Detail label="Assigned" value={String(demand.assigned)} /></div>
            <div className="assignedList"><b>Assigned</b>{assignedNames.length ? assignedNames.map((employee) => { const todayHours = employeeHoursForShifts(plannerShifts, employee.id); const weekHours = weeklyEmployeeHours(cleanCoffee, employee.id); return <button type="button" key={employee.id} className="employeePill selected" onClick={() => toggleCoffeeShiftEmployee(business.id, shift.id, employee.id, coffeeScheduleDay)}><span>{employee.avatar} {employee.name}</span><small>{employee.role}</small>{(todayHours > 8 || weekHours > 40) && <em>⚠ Overworked</em>}</button>; }) : <p className="muted">No employees assigned.</p>}</div>
            <div className="assignPool"><b>Add / Remove</b>{employees.map((employee) => <button type="button" key={employee.id} className={shift.employeeIds.includes(employee.id) ? "employeePill selected" : "employeePill"} onClick={() => toggleCoffeeShiftEmployee(business.id, shift.id, employee.id, coffeeScheduleDay)}><span>{employee.avatar} {employee.name}</span><small>{money(employee.hourlyWage)}/hr</small></button>)}</div>
          </article>;
        })}</div>
        <div className="miniButtons"><button onClick={() => autoPlanCoffeeShifts(business.id, "lean")}>Lean Payroll</button><button onClick={() => autoPlanCoffeeShifts(business.id, "balanced")}>Balanced Coverage</button><button onClick={() => autoPlanCoffeeShifts(business.id, "rush")}>Rush Coverage</button></div>
      </div>;
    }

    function MarketingTab() {
      return <div className="coffeeTabPane marketingUpgradeSplit">
        <section className="mcManageCard marketingCardFull"><h3>📣 Marketing Campaign</h3><p>Only one persistent campaign can be active. Grand Opening is one-time and locks after use.</p><div className="mcChoiceList">{coffeeMarketingCampaigns.filter((item) => item.id !== "opening" || !cleanCoffee.grandOpeningUsed).map((item) => <button key={item.id} className={cleanCoffee.activeCampaign === item.id ? "mcChoice selected" : "mcChoice"} onClick={() => coffeeMarketingAction(business.id, item.id)}><b>{item.name}</b><span>{item.costPerDay ? `${money(item.costPerDay)}/day` : item.id === "opening" ? "$650 once" : "No cost"}</span><small>{item.description}</small></button>)}</div>{cleanCoffee.grandOpeningUsed && <p className="muted">✓ Grand Opening Event completed.</p>}<div className="activeCampaignBox"><span>Current Campaign</span><b>{campaign.name}</b><p>{cleanCoffee.campaignDaysLeft > 0 && campaign.duration < 9999 ? `${cleanCoffee.campaignDaysLeft} days left` : cleanCoffee.activeCampaign !== "none" ? "Active until changed" : "No paid marketing running"}</p></div></section>
        <section className="mcManageCard"><h3>☕ Price Strategy</h3><p>Low prices bring more customers. Higher prices raise spend but can damage satisfaction.</p><div className="priceGrid">{[3, 4, 5, 6, 7].map((price) => <button key={price} className={cleanCoffee.coffeePrice === price ? "tierCard active" : "tierCard"} onClick={() => setCoffeePrice(business.id, price)}><b>{money(price)} Coffee</b><small>{price <= 4 ? "More customers" : price >= 6 ? "Higher margin, lower satisfaction" : "Balanced"}</small></button>)}</div></section>
        <section className="mcManageCard"><h3>📍 Location</h3><p>Higher traffic can bring more customers, but rent and competition can destroy profit.</p><div className="hostingGrid">{coffeeLocations.map((item) => <button key={item.id} className={cleanCoffee.locationId === item.id ? "locationChoice selected" : "locationChoice"} onClick={() => moveCoffeeLocation(business.id, item.id)} disabled={cleanCoffee.locationId === item.id}><b>{item.icon} {item.name}</b><span>{money(item.rent)}/day rent</span><small>Traffic {item.traffic}% • Competition {item.competition}%</small><em>{cleanCoffee.locationId === item.id ? "Current lease" : `${money(Math.round(item.rent * 18 + item.quality * 22))} move cost`}</em></button>)}</div></section>
      </div>;
    }

    function UpgradesTab() {
      return <div className="coffeeTabPane"><section className="mcManageCard wideManageCard"><h3>🏪 Expansions & Upgrades</h3><p>Upgrade real systems: speed, wait times, capacity, average spend, repeat customers, and weekend traffic.</p>{nextStage ? <button className="tierCard stageUpgradeCard" onClick={() => expandCoffeeShop(business.id)}><b>Upgrade to {nextStage.name}</b><span>{money(nextStage.cost)} setup</span><small>Capacity {nextStage.capacity} • Staff need {nextStage.staffNeed}</small></button> : <div className="emptyHero"><h3>National Chain reached</h3><p>Your coffee brand is already at the largest planned stage.</p></div>}<div className="upgradeGrid upgradeGridV3">{coffeeUpgrades.map((upgrade) => { const owned = cleanCoffee.purchasedUpgrades?.includes(upgrade.id); return <button key={upgrade.id} className={owned ? "upgradeCard owned" : "upgradeCard"} onClick={() => buyCoffeeUpgrade(business.id, upgrade.id)} disabled={owned}><b>{owned ? "✓" : upgrade.icon} {upgrade.name}</b><span>{money(upgrade.cost)}</span><small>{upgrade.description}</small><em>{owned ? "Owned" : "Uses business cash first"}</em></button>; })}</div></section></div>;
    }

    function ReportsTab() {
      return <div className="coffeeTabPane"><CustomerFlowCard /><TrendCard />{report ? <section className="glass dailyReportCard premiumReportCard"><div className="sectionHeader"><h3>📊 Last Daily Report</h3><small>{report.weekday} • Day {report.day}</small></div><div className="reportGrid"><Detail label="Potential" value={String(report.potentialCustomers)} /><Detail label="Actual Customers" value={String(report.customers)} good /><Detail label="Revenue" value={`+${money(report.revenue)}`} good /><Detail label="Rent" value={`-${money(report.rent)}`} bad /><Detail label="Payroll" value={`-${money(report.wages)}`} bad /><Detail label="Supplies" value={`-${money(report.supplies)}`} bad /><Detail label="Marketing" value={`-${money(report.marketing)}`} bad /><Detail label="Profit" value={`${report.profit >= 0 ? "+" : ""}${money(report.profit)}`} good={report.profit >= 0} bad={report.profit < 0} /><Detail label="Owner Payout" value={`+${money(report.ownerPayout ?? 0)}`} good /><Detail label="Business Cash" value={`${(report.businessCashChange ?? 0) >= 0 ? "+" : ""}${money(report.businessCashChange ?? 0)}`} good={(report.businessCashChange ?? 0) >= 0} bad={(report.businessCashChange ?? 0) < 0} /><Detail label="Player Cash" value={`${(report.playerCashChange ?? 0) >= 0 ? "+" : ""}${money(report.playerCashChange ?? 0)}`} good={(report.playerCashChange ?? 0) >= 0} bad={(report.playerCashChange ?? 0) < 0} /><Detail label="Lost to Competition" value={`-${report.lostCompetition}`} bad /><Detail label="Lost to Long Wait" value={`-${report.lostLongWait}`} bad /><Detail label="Lost to High Prices" value={`-${report.lostHighPrices}`} bad /><Detail label="Staff Result" value={report.staffPerformance} /><Detail label="Satisfaction" value={`${report.satisfaction}% (${report.satisfactionChange >= 0 ? "+" : ""}${report.satisfactionChange})`} good={report.satisfactionChange >= 0} bad={report.satisfactionChange < 0} /></div></section> : <div className="emptyHero"><h3>No report yet</h3><p>Click Next Day to generate a detailed coffee shop report.</p></div>}</div>;
    }

    return <div className="glass managePanel coffeePanel coffeeTabbedPanel">
      <div className="sectionHeader bigHeader coffeeHeaderCompact">
        <div>
          <span className="previewLabel">Coffee Shop V2 • Operations</span>
          <h2>☕ {business.name}</h2>
          <p>{stage.name} • {location.icon} {location.name} • {weekday} • Open {String(cleanCoffee.openingHour).padStart(2, "0")}:00-{String(cleanCoffee.closingHour).padStart(2, "0")}:00</p>
        </div>
        <button className="sellButton" onClick={() => manageBusiness(business.id, "sell")}>Sell for {money(business.value * 0.92)}</button>
      </div>
      <div className="coffeeTabNav">{coffeeTabs.map((tab) => <button key={tab} className={coffeeTab === tab ? "active" : ""} onClick={() => setCoffeeTab(tab)}>{tab}</button>)}</div>
      {coffeeTab === "Overview" && <OverviewTab />}
      {coffeeTab === "Staff" && <StaffTab />}
      {coffeeTab === "Schedule" && <ScheduleTab />}
      {coffeeTab === "Marketing" && <MarketingTab />}
      {coffeeTab === "Upgrades" && <UpgradesTab />}
      {coffeeTab === "Reports" && <ReportsTab />}
    </div>;
  }

  function EmpireSection() {
    return <>
      <div className="glass heroPanel">
        <div className="sectionHeader bigHeader">
          <div><h1>Empire</h1><p>Your businesses start at zero. Create, manage, upgrade, hire, and sell companies.</p></div>
          <button className="softButton alwaysVisible" onClick={openCreateBusiness}>＋ Create Business</button>
        </div>
        {activeGame.businesses.length === 0 ? <div className="emptyHero large"><h3>You have no businesses yet.</h3><p>Create your first company and begin your journey from startup founder to billionaire.</p><button className="nextButton" onClick={openCreateBusiness}>Create your first business →</button></div> : <div className="empireGrid fullEmpire">{activeGame.businesses.map((business) => <BusinessCard key={business.id} business={business} onClick={() => setSelectedBusinessId(business.id)} active={selectedBusiness?.id === business.id} />)}</div>}
      </div>
      {selectedBusiness && selectedBusiness.typeId === "minecraft" && selectedBusiness.minecraft ? <MinecraftServerPanel business={selectedBusiness} /> : selectedBusiness && selectedBusiness.typeId === "coffee" && selectedBusiness.coffee ? <CoffeeShopPanel business={selectedBusiness} /> : selectedBusiness && <div className="glass managePanel"><div className="sectionHeader bigHeader"><div><h2>{selectedBusiness.icon} {selectedBusiness.name}</h2><p>{selectedBusiness.typeName} • Level {selectedBusiness.level} • Created day {selectedBusiness.createdDay}</p></div><button className="sellButton" onClick={() => manageBusiness(selectedBusiness.id, "sell")}>Sell for {money(selectedBusiness.value * 0.92)}</button></div><div className="detailGrid"><Detail label="Value" value={money(selectedBusiness.value)} /><Detail label="Daily Income" value={`+${money(selectedBusiness.dailyIncome)}`} good /><Detail label="Daily Expenses" value={`-${money(selectedBusiness.dailyExpenses)}`} bad /><Detail label="Daily Profit" value={`${selectedBusiness.dailyIncome - selectedBusiness.dailyExpenses >= 0 ? "+" : ""}${money(selectedBusiness.dailyIncome - selectedBusiness.dailyExpenses)}`} good={selectedBusiness.dailyIncome >= selectedBusiness.dailyExpenses} bad={selectedBusiness.dailyIncome < selectedBusiness.dailyExpenses} /><Detail label="Growth" value={`${selectedBusiness.growth}%`} /><Detail label="Reputation" value={`${selectedBusiness.reputation}%`} /><Detail label="Operations" value={`${selectedBusiness.operations}%`} /><Detail label="Employees" value={String(selectedBusiness.employees)} /></div><div className="manageActions"><button onClick={() => manageBusiness(selectedBusiness.id, "upgrade")}>⬆️ Upgrade</button><button onClick={() => manageBusiness(selectedBusiness.id, "market")}>📣 Marketing</button><button onClick={() => manageBusiness(selectedBusiness.id, "ops")}>🛠️ Improve Operations</button><button onClick={() => manageBusiness(selectedBusiness.id, "hire")}>👔 Hire Employee/Manager</button><button onClick={() => manageBusiness(selectedBusiness.id, "cut")}>📉 Cut Expenses</button></div></div>}
    </>;
  }

  function PropertiesSection() {
    return <><div className="glass heroPanel"><div className="sectionHeader bigHeader"><div><h1>Properties</h1><p>Buy real estate, find tenants, renovate, and collect rent.</p></div><button className="softButton alwaysVisible" onClick={() => setShowPropertyModal(true)}>＋ Buy Property</button></div>{activeGame.properties.length === 0 ? <div className="emptyHero large"><h3>You own no properties.</h3><p>Buy your first rental when you have enough cash. Properties increase net worth and daily cash flow.</p><button className="nextButton" onClick={() => setShowPropertyModal(true)}>Browse Properties →</button></div> : <div className="propertyGrid">{activeGame.properties.map((property) => <article key={property.id} onClick={() => setSelectedPropertyId(property.id)} className={`propertyCard ${selectedProperty?.id === property.id ? "selected" : ""}`}><span>{property.icon}</span><h3>{property.name}</h3><p>Value <b>{money(property.value)}</b></p><p>Rent <b className="good">+{money(Math.round(property.dailyRent * property.occupancy / 100))}/day</b></p><p>Expenses <b className="bad">-{money(property.dailyExpenses)}/day</b></p><p>Condition <b>{property.condition}%</b></p><p>Occupancy <b>{property.occupancy}%</b></p></article>)}</div>}</div>{selectedProperty && <div className="glass managePanel"><h2>{selectedProperty.icon} Manage {selectedProperty.name}</h2><p className="muted">Purchased day {selectedProperty.purchasedDay}. Better condition and occupancy improves cash flow and value.</p><div className="manageActions"><button onClick={() => manageProperty(selectedProperty.id, "renovate")}>🛠️ Renovate</button><button onClick={() => manageProperty(selectedProperty.id, "tenant")}>🔎 Find Tenant</button><button onClick={() => manageProperty(selectedProperty.id, "raise")}>⬆️ Raise Rent</button><button onClick={() => manageProperty(selectedProperty.id, "lower")}>⬇️ Lower Rent</button><button className="sellButton" onClick={() => manageProperty(selectedProperty.id, "sell")}>💰 Sell Property</button></div></div>}</>;
  }

  function InvestSection() {
    return <div className="glass heroPanel"><div className="sectionHeader bigHeader"><div><h1>Invest</h1><p>Portfolio value: <b className="good">{money(portfolioValue)}</b>. Investments fluctuate every day.</p></div></div><div className="shopGrid">{investmentTemplates.map((item) => { const owned = activeGame.investments.find((i) => i.id === item.id); return <article className="shopCard" key={item.id}><span>{item.icon}</span><h3>{item.name}</h3><p>{item.description}</p><p>Risk: <b>{item.risk}</b></p><p>Expected return: <b>{item.expectedReturn}</b></p><p>Owned: <b className="good">{money(owned?.value ?? 0)}</b></p>{owned?.dailyChange ? <p>Last move: <b className={owned.dailyChange >= 0 ? "good" : "bad"}>{owned.dailyChange >= 0 ? "+" : ""}{money(owned.dailyChange)}</b></p> : null}<div className="miniButtons"><button onClick={() => invest(item.id, 100)}>+$100</button><button onClick={() => invest(item.id, 1000)}>+$1,000</button><button onClick={() => sellInvestment(item.id)}>Sell</button></div></article>; })}</div></div>;
  }

  function CareerSection() {
    return <div className="glass heroPanel"><div className="sectionHeader bigHeader"><div><h1>Career</h1><p>{activeGame.job ? `Current job: ${activeGame.job.title} • ${money(activeGame.job.dailyPay)}/day` : "No job yet. A job is stable early cash, but the main game is your empire."}</p></div>{activeGame.job && <button className="softButton alwaysVisible" onClick={() => updateGame((state) => addEvent({ ...state, job: null }, { icon: "💼", title: "You quit your job.", good: false }))}>Quit Job</button>}</div><div className="shopGrid">{starterJobs.map((job) => <article className="shopCard" key={job.title}><span>💼</span><h3>{job.title}</h3><p>Stable early income.</p><p>Daily pay: <b className="good">{money(job.dailyPay)}</b></p><button onClick={() => applyJob(job)}>Apply</button></article>)}</div><div className="manageActions"><button onClick={promote}>📈 Ask for promotion</button><button onClick={improveSkills}>🧠 Improve business skills</button></div></div>;
  }

  function CommunitySection() {
    return <div className="glass heroPanel"><div className="sectionHeader bigHeader"><div><h1>Community</h1><p>Build reputation, happiness, and opportunities.</p></div></div><div className="shopGrid"><ActionMini icon="🎮" title="Hang out" text="Boost happiness" onClick={() => communityAction("Hang out", 30, 8, 1)} /><ActionMini icon="🤝" title="Network" text="Boost reputation" onClick={() => communityAction("Network", 80, 2, 8)} /><ActionMini icon="🏠" title="Help family" text="Reputation and happiness" onClick={() => communityAction("Help family", 40, 5, 4)} /><ActionMini icon="🎤" title="Attend event" text="Reputation and skill" onClick={() => communityAction("Attend event", 120, 4, 6, 4)} /></div></div>;
  }

  function ShopSection() {
    return <div className="glass heroPanel"><div className="sectionHeader bigHeader"><div><h1>Shop</h1><p>Useful boosts for testing and early progression.</p></div></div><div className="shopGrid"><ShopCard icon="🎓" title="Skill Course" text="Boosts business skill" price="$350" onClick={() => buyShopItem("course")} /><ShopCard icon="🚀" title="Business Boost" text="Boosts all businesses" price="50 gems" onClick={() => buyShopItem("boost")} /><ShopCard icon="📉" title="Expense Audit" text="Lowers daily living cost" price="$500" onClick={() => buyShopItem("cashflow")} /><ShopCard icon="🧥" title="Premium Avatar Outfit" text="Boosts reputation" price="120 gems" onClick={() => buyShopItem("outfit")} /></div></div>;
  }

  function SettingsSection() {
    const scaleOptions: { key: UIScale; label: string; text: string }[] = [
      { key: "compact", label: "Compact (85%)", text: "Fits more empire data on screen." },
      { key: "normal", label: "Normal (100%)", text: "Balanced default website size." },
      { key: "large", label: "Large (115%)", text: "Bigger cards and easier reading." },
    ];
    return <div className="glass heroPanel"><div className="sectionHeader bigHeader"><div><h1>Settings</h1><p>{VERSION}</p></div></div><div className="appearancePanel"><span className="previewLabel">Appearance</span><h2>UI Scale</h2><p className="muted">Choose how large the ChargedLife interface should feel. Compact is the default for a tycoon-style management view.</p><div className="scaleGrid">{scaleOptions.map((option) => <button key={option.key} type="button" onClick={() => setUiScale(option.key)} className={uiScale === option.key ? "scaleCard selected" : "scaleCard"}><b>{option.label}</b><small>{option.text}</small></button>)}</div></div><div className="settingsGrid"><Detail label="Current UI Scale" value={scaleOptions.find((option) => option.key === uiScale)?.label ?? "Compact (85%)"} /><Detail label="Difficulty" value={activeGame.difficulty} /><Detail label="Save key" value={SAVE_KEY} /><Detail label="Day / Age" value={`Day ${activeGame.day} / Age ${activeGame.age}`} /><Detail label="Net Worth" value={money(netWorth)} /><Detail label="Businesses" value={String(activeGame.businesses.length)} /><Detail label="Properties" value={String(activeGame.properties.length)} /></div><div className="manageActions dangerActions"><button onClick={resetSave}>Reset Save</button><button onClick={resetAccess}>Reset Password Access</button></div></div>;
  }

  function CreateBusinessModal() {
    const selectedType = businessTypes.find((b) => b.id === businessForm.typeId) ?? businessTypes[0];
    const investment = Number(businessForm.investment) || 0;
    const recommended = Math.round(selectedType.minCost * 1.6);
    const projected = createBusinessFromForm(selectedType, businessForm.name || selectedType.name, Math.max(investment, selectedType.minCost), activeGame.day, businessForm.coffeeLocationId);
    return <div className="modalBackdrop" onClick={() => setShowBusinessModal(false)}><section className="glass modalCard createBusinessModal improvedBusinessModal" onClick={(e) => e.stopPropagation()}><div className="sectionHeader bigHeader businessModalHeader"><div><span className="previewLabel">Company Builder</span><h2>🚀 Create your company</h2><p>Pick a market, name your brand, and choose how much capital to risk.</p></div><button className="closeButton" onClick={() => setShowBusinessModal(false)}>✕</button></div>
      <div className="businessCreateLayout">
        <div className="businessCreateMain">
          <div className="createStep"><span>1</span><div><h3>Business Name</h3><input className="textInput" value={businessForm.name} onChange={(e) => setBusinessForm((current) => ({ ...current, name: e.target.value }))} placeholder="Example: Charged Coffee" /></div></div>
          <div className="createStep"><span>2</span><div><h3>Choose Business Type</h3><div className="businessTypeGrid">{businessTypes.map((type) => <button type="button" key={type.id} className={businessForm.typeId === type.id ? "businessTypeCard selected" : "businessTypeCard"} onClick={() => setBusinessForm((current) => ({ ...current, typeId: type.id, investment: String(Math.max(Number(current.investment) || 0, type.minCost)) }))}><img src={type.image} alt="" /><div><b>{type.icon} {type.name}</b><small>{type.description}</small><em>Startup {money(type.minCost)} • Risk {type.risk} • Growth {type.growthPotential}%</em></div></button>)}</div></div></div>
          {selectedType.id === "coffee" && <div className="createStep"><span>3</span><div><h3>Choose Location</h3><p className="muted">Traffic brings customers, but rent and competition can eat the profit.</p><div className="coffeeLocationGrid">{coffeeLocations.map((location) => <button type="button" key={location.id} className={businessForm.coffeeLocationId === location.id ? "locationChoice selected" : "locationChoice"} onClick={() => setBusinessForm((current) => ({ ...current, coffeeLocationId: location.id }))}><b>{location.icon} {location.name}</b><small>{location.description}</small><em>{money(location.rent)}/day rent • Traffic {location.traffic}% • Competition {location.competition}%</em></button>)}</div></div></div>}
          <div className="createStep"><span>{selectedType.id === "coffee" ? "4" : "3"}</span><div><h3>Investment Amount</h3><input className="textInput" type="number" min={selectedType.minCost} value={businessForm.investment} onChange={(e) => setBusinessForm((current) => ({ ...current, investment: e.target.value }))} /><div className="investmentHints"><span>Minimum: <b>{money(selectedType.minCost)}</b></span><span>Recommended: <b>{money(recommended)}</b></span><span>Your Cash: <b className="good">{money(activeGame.cash)}</b></span></div></div></div>
        </div>
        <aside className="glass businessReview"><span className="previewLabel">Step 4 • Review & Create</span><img src={selectedType.image} alt="" /><h3>{selectedType.icon} {businessForm.name.trim() || selectedType.name}</h3><p>{selectedType.name}</p><div className="previewStats"><p><span>Investment</span><b>{money(investment)}</b></p><p><span>Startup Minimum</span><b>{money(selectedType.minCost)}</b></p><p><span>Projected Income</span><b className="good">+{money(projected.dailyIncome)}/day</b></p><p><span>Projected Expenses</span><b className="bad">-{money(projected.dailyExpenses)}/day</b></p><p><span>Projected Profit</span><b className={projected.dailyIncome - projected.dailyExpenses >= 0 ? "good" : "bad"}>{projected.dailyIncome - projected.dailyExpenses >= 0 ? "+" : ""}{money(projected.dailyIncome - projected.dailyExpenses)}/day</b></p><p><span>Risk</span><b>{selectedType.risk}</b></p>{selectedType.id === "coffee" && <p><span>Location</span><b>{coffeeLocations.find((l) => l.id === businessForm.coffeeLocationId)?.name}</b></p>}</div><button className="nextButton wideButton launchButton" onClick={createBusiness}>Create Business →</button></aside>
      </div>
    </section></div>;
  }

  function CoffeeHiringModal() {
    const business = activeGame.businesses.find((item) => item.id === coffeeHiringBusinessId && item.coffee);
    if (!business) return null;
    return <div className="modalBackdrop" onClick={() => setCoffeeHiringBusinessId("")}><section className="glass modalCard hiringModal" onClick={(e) => e.stopPropagation()}><div className="sectionHeader bigHeader"><div><span className="previewLabel">Hiring Desk</span><h2>👥 Choose who to hire</h2><p>Skilled and reliable workers cost more, but they improve speed, service, and customer satisfaction.</p></div><button className="closeButton" onClick={() => setCoffeeHiringBusinessId("")}>✕</button></div><div className="candidateGrid candidateGridV2">{coffeeCandidates.map((candidate) => <article className="candidateCard candidateCardV2" key={candidate.id}><div className="candidateTop"><div className="employeeAvatar bigEmployeeAvatar">{candidate.avatar}</div><div><h3>{candidate.name}</h3><p>{candidate.role}</p><small>{candidate.note}</small></div></div><div className="detailGrid"><Detail label="Skill" value={`${candidate.skill}`} /><Detail label="Reliability" value={`${candidate.reliability}`} /><Detail label="Mood" value={`${candidate.mood}`} /><Detail label="Wage" value={`${money(candidate.hourlyWage)}/hr`} /></div><button className="nextButton wideButton" onClick={() => hireCoffeeCandidate(business.id, candidate)}>Hire for {money(candidate.hourlyWage * 18)}</button></article>)}</div><button className="softButton" onClick={() => setCoffeeCandidates(generateCoffeeCandidates(business.coffee?.employeesList?.map((employee) => employee.name) ?? []))}>Refresh Candidates</button></section></div>;
  }

  function BuyPropertyModal() {
    return <div className="modalBackdrop" onClick={() => setShowPropertyModal(false)}><section className="glass modalCard" onClick={(e) => e.stopPropagation()}><div className="sectionHeader bigHeader"><div><h2>🏡 Buy Property</h2><p>Start with one rental and build a real estate portfolio.</p></div><button className="closeButton" onClick={() => setShowPropertyModal(false)}>✕</button></div><div className="propertyGrid">{propertyTypes.map((type) => <article className="propertyCard" key={type.id}><span>{type.icon}</span><h3>{type.name}</h3><p>{type.description}</p><p>Price <b>{money(type.price)}</b></p><p>Rent <b className="good">+{money(type.rent)}/day</b></p><p>Expenses <b className="bad">-{money(type.expenses)}/day</b></p><button onClick={() => buyProperty(type)}>Buy</button></article>)}</div></section></div>;
  }

  function goalList() {
    const hasCoffeeShop = activeGame.businesses.some((business) => business.typeId === "coffee");
    const hasGameStudio = activeGame.businesses.some((business) => business.typeId === "gamestudio");
    const goals = [
      { title: hasCoffeeShop ? "☕ Coffee Shop opened" : "☕ Open your first Coffee Shop", done: hasCoffeeShop, progress: hasCoffeeShop ? "1 / 1" : "0 / 1", width: hasCoffeeShop ? 100 : 0 },
      { title: "🏠 Buy your first Rental Property", done: activeGame.properties.length >= 1, progress: `${Math.min(activeGame.properties.length, 1)} / 1`, width: activeGame.properties.length ? 100 : 0 },
      { title: hasGameStudio ? "🎮 Game Studio launched" : "🎮 Launch your first Game Studio", done: hasGameStudio, progress: hasGameStudio ? "1 / 1" : "0 / 1", width: hasGameStudio ? 100 : 0 },
      { title: "💰 Reach $100,000 Net Worth", done: netWorth >= 100000, progress: `${money(netWorth)} / $100,000`, width: (netWorth / 100000) * 100 },
      { title: "💎 Reach $1,000,000 Net Worth", done: netWorth >= 1000000, progress: `${money(netWorth)} / $1,000,000`, width: millionaireProgress },
      { title: "👑 Become a Multi-Millionaire", done: netWorth >= 10000000, progress: `${money(netWorth)} / $10,000,000`, width: (netWorth / 10000000) * 100 },
      { title: "🏙 Build a business empire", done: activeGame.businesses.length >= 5, progress: `${activeGame.businesses.length} / 5 businesses`, width: (activeGame.businesses.length / 5) * 100 },
    ];
    return goals;
  }
}

function StatTile({ icon, label, value, tone }: { icon: string; label: string; value: string; tone: string }) {
  return <div className={`glass statTile ${tone}`}><span>{icon}</span><div><small>{label}</small><b>{value}</b></div></div>;
}

function FounderStat({ icon, label, value, tone }: { icon: string; label: string; value: number; tone: "green" | "gold" | "blue" | "red" }) {
  return <div className="statRow"><span className="statIcon">{icon}</span><div className="statMain"><div><span>{label}</span><b>{value}%</b></div><ProgressBar value={value} tone={tone} /></div></div>;
}

function Detail({ label, value, good, bad }: { label: string; value: string; good?: boolean; bad?: boolean }) {
  return <div className="debugBox"><b>{label}</b><span className={good ? "good" : bad ? "bad" : ""}>{value}</span></div>;
}

function BusinessCard({ business, onClick, active }: { business: Business; onClick?: () => void; active?: boolean }) {
  const profit = business.dailyIncome - business.dailyExpenses;
  const mc = business.minecraft;
  const coffee = business.coffee;
  return <article onClick={onClick} className={`empireCard ${active ? "selected" : ""} ${mc ? "minecraftBusinessCard" : ""}`}><img src={business.image} alt="" /><div><h3>{business.icon} {business.name}</h3><small>{business.typeName} • Lvl {business.level}</small></div>{mc ? <><p>Players <b>{mc.dailyPlayers}</b></p><p>Retention <b>{mc.retention}%</b></p><p>Store Sales <b className="good">+{money(business.dailyIncome)}</b></p></> : coffee ? <><p>Customers <b>{coffee.dailyCustomers}</b></p><p>Reviews <b>{coffee.reviewScore.toFixed(1)}⭐</b></p><p>Revenue <b className="good">+{money(business.dailyIncome)}</b></p></> : <><p>Income <b className="good">+{money(business.dailyIncome)}</b></p><p>Expenses <b className="bad">-{money(business.dailyExpenses)}</b></p></>}<p>Profit <b className={profit >= 0 ? "good" : "bad"}>{profit >= 0 ? "+" : ""}{money(profit)}</b></p><p>Value <b>{money(business.value)}</b></p></article>;
}

function ActionMini({ icon, title, text, onClick }: { icon: string; title: string; text: string; onClick: () => void }) {
  return <article className="shopCard"><span>{icon}</span><h3>{title}</h3><p>{text}</p><button onClick={onClick}>Do it</button></article>;
}

function ShopCard({ icon, title, text, price, onClick }: { icon: string; title: string; text: string; price: string; onClick: () => void }) {
  return <article className="shopCard"><span>{icon}</span><h3>{title}</h3><p>{text}</p><b>{price}</b><button onClick={onClick}>Buy</button></article>;
}
