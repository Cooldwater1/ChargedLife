import { CITY_DEFINITIONS, DEFAULT_FAST_FOOD_MENU, type CityDefinition } from '@/game/constants/data';
import { INGREDIENT_TIER_MULTIPLIER, RECOMMENDED_BUSINESS_STARTUP_COST } from '@/game/constants/balance';
import { createDefaultSchedule } from '@/game/business/schedule';
import { createDefaultLocationInventory } from '@/game/constants/inventory';
import { generateId } from '@/lib/id';
import { clamp } from '@/lib/random';
import { createDefaultBudgetLimits, DEFAULT_CEO_SETTINGS, DEFAULT_DELEGATION_SETTINGS, DEFAULT_HR_SETTINGS, type Business, type BusinessLocation, type IngredientTier, type MenuItem } from '@/game/types';

export function getCityDefinition(city: string): CityDefinition {
  return CITY_DEFINITIONS.find((c) => c.city === city) ?? CITY_DEFINITIONS[0];
}

export function recalcMenuItemForTier(baseCost: number, tier: IngredientTier): { cost: number; quality: number } {
  const standard = INGREDIENT_TIER_MULTIPLIER.standard;
  const target = INGREDIENT_TIER_MULTIPLIER[tier];
  return {
    cost: Math.round(baseCost * (target.cost / standard.cost)),
    quality: target.quality,
  };
}

export function createDefaultMenu(): MenuItem[] {
  return DEFAULT_FAST_FOOD_MENU.map((item) => {
    const tier: IngredientTier = 'standard';
    const { cost, quality } = recalcMenuItemForTier(item.baseCost, tier);
    return {
      id: generateId('menu'),
      name: item.name,
      baseCost: item.baseCost,
      cost,
      price: item.basePrice,
      quality,
      ingredientTier: tier,
      popularity: item.popularity,
      active: true,
      recipe: item.recipe,
    };
  });
}

export function createFastFoodLocation(params: {
  businessId: string;
  city: string;
  investment: number;
  dayIndex: number;
  isFirstLocation: boolean;
}): BusinessLocation {
  const cityDef = getCityDefinition(params.city);
  const investmentRatio = clamp(params.investment / RECOMMENDED_BUSINESS_STARTUP_COST, 0.5, 3.5);

  return {
    id: generateId('location'),
    businessId: params.businessId,
    name: params.isFirstLocation ? params.city : `${params.city}`,
    city: params.city,
    rent: Math.round(cityDef.rentMultiplier * 4_500),
    baseDemand: Math.round(cityDef.demandMultiplier * 145),
    competition: cityDef.competition,
    marketAvgPrice: Math.round(cityDef.marketAvgPriceMultiplier * 6.5 * 100) / 100,
    baseCapacity: Math.round(clamp(90 * investmentRatio, 60, 320)),
    weeklySchedule: createDefaultSchedule(),
    openingHour: 8,
    closingHour: 22,
    inventoryStock: 100,
    supplierTier: 'standard',
    inventory: createDefaultLocationInventory(),
    upgrades: [],
    foundedAt: params.dayIndex,
    lastWaitTimeMinutes: 6,
    lastServiceQuality: 75,
    lastExpectedCustomers: 0,
    lastActualCustomers: 0,
  };
}

export function createFastFoodBusiness(params: {
  name: string;
  city: string;
  investment: number;
  dayIndex: number;
}): Business {
  const businessId = generateId('business');
  const location = createFastFoodLocation({
    businessId,
    city: params.city,
    investment: params.investment,
    dayIndex: params.dayIndex,
    isFirstLocation: true,
  });

  return {
    id: businessId,
    name: params.name,
    industry: 'fast_food',
    level: 1,
    foundedAt: params.dayIndex,
    reputation: 55,
    cash: Math.round(params.investment * 0.32),
    locations: [location],
    employees: [],
    menu: createDefaultMenu(),
    marketingCampaigns: [],
    financialHistory: [],
    reviews: [],
    activeEvents: [],
    loans: [],
    managers: [],
    delegation: { ...DEFAULT_DELEGATION_SETTINGS },
    ceoSettings: { ...DEFAULT_CEO_SETTINGS },
    hrSettings: { ...DEFAULT_HR_SETTINGS },
    managementLog: [],
    ownershipPct: 100,
    holdingCompanyId: null,
    dividendPolicyPct: 0,
    allocatedCapitalBudget: 0,
    headquarters: null,
    companyVehicles: [],
    companyPhones: [],
    budgetLimits: createDefaultBudgetLimits(),
    warehouses: [],
    activeMarketTrends: [],
    activeSupplierEvents: [],
    wasteLog: [],
  };
}
