import { CAMPAIGN_DEFAULTS, DAILY_EVENT_CHANCE, FINANCIAL_HISTORY_MAX_DAYS, MAX_REVIEWS_STORED, SUPPLIER_TIER_CONFIG } from '@/game/constants/balance';
import { SUPPLIER_DEFINITIONS, getIngredientName } from '@/game/constants/inventory';
import { calculateAvgCost, calculateAvgOrderValue, calculateDemand, calculateNextReputation, calculateSatisfaction } from '@/game/simulation/economy';
import { driftMorale, shouldResign } from '@/game/simulation/employees';
import { applyTrainingSkillGrowth, calculateBenefitsDailyCost, calculateBenefitsMoraleBonus, calculateBenefitsResignationMultiplier, calculateCompanyAssetMonthlyCost, getEffectiveManagerStats } from '@/game/simulation/benefits';
import {
  calculateBlendedRecipePerCustomer, calculateMaxServableFromStock, calculateTrendDemandMultiplier, calculateWeeklyWaste, consumeIngredientsForCustomers,
  expireOldEntries, getLocationStorageCapacity, getTotalStockUnits, processArrivedDeliveries, rollMarketTrendStart, rollRecurringOrders,
  rollSupplierEventStart, runInventoryManagerAutomation,
} from '@/game/simulation/inventory';
import { rollBusinessEvent } from '@/game/simulation/events';
import { generateReview } from '@/game/simulation/reviews';
import { runDelegatedManagement } from '@/game/simulation/delegation';
import { runHRAutomationDaily } from '@/game/simulation/management';
import { toCalendarDate } from '@/game/time/calendar';
import { clamp, randRange } from '@/lib/random';
import type {
  Business,
  BusinessLocation,
  DailyBusinessRecord,
  GameNotification,
  TransactionCategory,
} from '@/game/types';

export interface PendingTransaction {
  amount: number;
  category: TransactionCategory;
  description: string;
}

export type PendingNotification = Omit<GameNotification, 'id' | 'timestamp' | 'read'>;

export interface SettlementResult {
  business: Business;
  transactions: PendingTransaction[];
  notifications: PendingNotification[];
  customersServed: number;
  revenueGenerated: number;
  expensesIncurred: number;
}

const ROLE_MARKET_SALARY: Record<string, number> = {
  manager: 42_000,
  cook: 32_000,
  cashier: 28_000,
  cleaner: 26_000,
};

export function getMarketingBoostForLocation(business: Business, location: BusinessLocation): number {
  let boost = 0;
  for (const campaign of business.marketingCampaigns) {
    if (campaign.status !== 'active') continue;
    if (campaign.locationId !== 'all' && campaign.locationId !== location.id) continue;
    const def = CAMPAIGN_DEFAULTS[campaign.type];
    boost += def.reachMultiplier * 100 * campaign.effectivenessMultiplier;
  }
  return boost;
}

export function runDailySettlement(
  businessInput: Business,
  dayIndex: number,
  rng: () => number,
): SettlementResult {
  const delegationResult = runDelegatedManagement(businessInput, rng);
  const hrResult = runHRAutomationDaily(delegationResult.business, rng, dayIndex);
  const business = hrResult.business;

  const transactions: PendingTransaction[] = [...delegationResult.transactions, ...hrResult.transactions];
  const notifications: PendingNotification[] = [...delegationResult.notifications, ...hrResult.notifications];
  let reviews = [...business.reviews];
  let customersServedTotal = 0;
  let revenueTotal = 0;
  let expensesTotal = 0;
  let weightedSatisfaction = 0;
  let activeEvents = [...business.activeEvents];

  const weekday = toCalendarDate(dayIndex).weekday;
  const avgOrderValue = calculateAvgOrderValue(business.menu);
  const avgCost = calculateAvgCost(business.menu);

  // ---------- Market trends & supplier events (business-wide, roll/expire once per day) ----------
  let activeMarketTrends = expireOldEntries(business.activeMarketTrends, dayIndex);
  const newTrend = rollMarketTrendStart({ ...business, activeMarketTrends }, dayIndex, rng);
  if (newTrend) {
    activeMarketTrends = [...activeMarketTrends, newTrend];
    notifications.push({
      title: newTrend.name,
      message: `${newTrend.description} Demand for ${newTrend.affectedMenuItemNames.join(', ')} is up ${Math.round((newTrend.demandMultiplier - 1) * 100)}% for the next ~${newTrend.durationDays} days.`,
      severity: 'info',
      link: { page: 'businesses', businessId: business.id },
    });
  }
  let activeSupplierEvents = expireOldEntries(business.activeSupplierEvents, dayIndex);
  const newSupplierEvent = rollSupplierEventStart({ ...business, activeSupplierEvents }, dayIndex, rng);
  if (newSupplierEvent) {
    const supplierName = SUPPLIER_DEFINITIONS.find((s) => s.id === newSupplierEvent.supplierId)?.name ?? 'a supplier';
    activeSupplierEvents = [...activeSupplierEvents, newSupplierEvent];
    notifications.push({
      title: newSupplierEvent.name,
      message: `${newSupplierEvent.description} (${supplierName}, pricing ${newSupplierEvent.priceMultiplierDelta >= 0 ? '+' : ''}${Math.round(newSupplierEvent.priceMultiplierDelta * 100)}%)`,
      severity: newSupplierEvent.priceMultiplierDelta > 0 ? 'warning' : 'info',
      link: { page: 'businesses', businessId: business.id },
    });
  }
  const trendMultiplier = calculateTrendDemandMultiplier(business.menu, activeMarketTrends);
  const blendedRecipe = calculateBlendedRecipePerCustomer(business.menu);
  const storageCapacity = getLocationStorageCapacity(business);

  const updatedLocations: BusinessLocation[] = business.locations.map((location) => {
    const todaySchedule = location.weeklySchedule[weekday];

    if (!todaySchedule.open) {
      const utilities = location.baseCapacity * 0.08; // minimal fixed cost even while closed (security, base utilities)
      expensesTotal += utilities;
      if (utilities > 0) {
        transactions.push({ amount: -Math.round(utilities), category: 'business_utilities', description: `Utilities (closed) — ${location.name}` });
      }
      return {
        ...location,
        openingHour: todaySchedule.openHour,
        closingHour: todaySchedule.openHour,
        lastWaitTimeMinutes: 0,
        lastServiceQuality: location.lastServiceQuality,
        lastExpectedCustomers: 0,
        lastActualCustomers: 0,
      };
    }

    const effectiveLocation: BusinessLocation = { ...location, openingHour: todaySchedule.openHour, closingHour: todaySchedule.closeHour };
    const marketingBoost = getMarketingBoostForLocation(business, effectiveLocation);
    const variance = randRange(rng, 0.92, 1.08);
    const demand = calculateDemand(business, effectiveLocation, business.employees, marketingBoost, variance * trendMultiplier);

    // ---------- Inventory: deliveries in, recurring orders out, automation, then real consumption ----------
    let locationInventory = processArrivedDeliveries(location.inventory, dayIndex).inventory;
    const storageUsed = getTotalStockUnits(locationInventory);
    const storageRemaining = Math.max(0, storageCapacity - storageUsed);

    const recurringResult = rollRecurringOrders(locationInventory, weekday, dayIndex, storageRemaining, activeSupplierEvents);
    locationInventory = recurringResult.inventory;
    if (recurringResult.totalCost > 0) {
      expensesTotal += recurringResult.totalCost;
      transactions.push({ amount: -Math.round(recurringResult.totalCost), category: 'business_inventory', description: `Recurring inventory order — ${location.name}` });
    }
    for (const skip of recurringResult.skipped) {
      notifications.push({ title: 'Recurring Order Skipped', message: `${location.name}: ${skip.reason}.`, severity: 'warning', link: { page: 'businesses', businessId: business.id } });
    }

    const rawInventoryManager = business.managers.find((m) => m.role === 'inventory_manager' && (m.locationId === location.id || m.locationId === null));
    if (rawInventoryManager && locationInventory.automationLevel !== 'manual') {
      const effectiveManager = getEffectiveManagerStats(rawInventoryManager, business.companyVehicles, business.companyPhones);
      const competence = (effectiveManager.operations + effectiveManager.finance) / 2;
      const storageRemainingAfterRecurring = Math.max(0, storageCapacity - getTotalStockUnits(locationInventory));
      const automationResult = runInventoryManagerAutomation(
        locationInventory, locationInventory.automationLevel, competence, dayIndex, activeMarketTrends, storageRemainingAfterRecurring, activeSupplierEvents, rng,
      );
      locationInventory = automationResult.inventory;
      if (automationResult.totalCost > 0) {
        expensesTotal += automationResult.totalCost;
        transactions.push({ amount: -Math.round(automationResult.totalCost), category: 'business_inventory', description: `Inventory automation order — ${location.name}` });
      }
      for (const note of automationResult.notes) {
        notifications.push({ title: 'Inventory Automation', message: `${rawInventoryManager.name}: ${note}`, severity: 'info', link: { page: 'businesses', businessId: business.id } });
      }
    }

    const { maxServable, limitingIngredientId } = calculateMaxServableFromStock(locationInventory, blendedRecipe);
    const actualCustomers = Math.max(0, Math.min(demand.actualCustomers, Number.isFinite(maxServable) ? Math.floor(maxServable) : demand.actualCustomers));
    const lostToStockout = demand.actualCustomers - actualCustomers;
    if (lostToStockout > 0 && limitingIngredientId) {
      const lostRevenue = Math.round(lostToStockout * effectiveLocation.marketAvgPrice);
      notifications.push({
        title: 'Stockout Is Costing You Sales',
        message: `${location.name} turned away ~${Math.round(lostToStockout)} customer(s) — ${getIngredientName(limitingIngredientId)} ran out. Estimated lost revenue: $${lostRevenue.toLocaleString('en-US')}/day.`,
        severity: 'urgent',
        link: { page: 'businesses', businessId: business.id },
      });
    }

    locationInventory = consumeIngredientsForCustomers(locationInventory, blendedRecipe, actualCustomers);

    // Derived 0-100 health readout for display: how close the scarcest actively-used ingredient is to its target stock-days.
    const daysRemainingByIngredient = Object.entries(blendedRecipe)
      .filter(([, perCustomer]) => perCustomer > 0)
      .map(([ingredientId]) => {
        const usage = locationInventory.avgDailyUsage[ingredientId] ?? 0;
        return usage > 0 ? (locationInventory.stocks[ingredientId] ?? 0) / usage : locationInventory.minStockTargetDays;
      });
    const inventoryStock = daysRemainingByIngredient.length > 0
      ? clamp(Math.round((Math.min(...daysRemainingByIngredient) / locationInventory.minStockTargetDays) * 100), 0, 100)
      : 100;

    const revenue = actualCustomers * avgOrderValue;
    const cogs = actualCustomers * avgCost;
    const utilities = location.baseCapacity * 0.32;

    const primarySupplierTier = SUPPLIER_DEFINITIONS.find((s) => s.id === locationInventory.primarySupplierId)?.tier ?? location.supplierTier;
    const supplierConfig = SUPPLIER_TIER_CONFIG[primarySupplierTier];

    revenueTotal += revenue;
    expensesTotal += cogs + utilities;

    if (utilities > 0) {
      transactions.push({ amount: -Math.round(utilities), category: 'business_utilities', description: `Utilities — ${location.name}` });
    }
    if (revenue > 0) {
      transactions.push({ amount: Math.round(revenue), category: 'business_revenue', description: `Daily sales — ${location.name}` });
    }
    if (cogs > 0) {
      transactions.push({ amount: -Math.round(cogs), category: 'business_cogs', description: `Cost of goods sold — ${location.name}` });
    }

    customersServedTotal += actualCustomers;

    const satisfaction = clamp(calculateSatisfaction(business, demand) + supplierConfig.satisfactionDelta, 0, 100);
    weightedSatisfaction += satisfaction * Math.max(1, actualCustomers);

    if (actualCustomers > 0 && rng() < 0.32) {
      reviews = [generateReview(rng, business.id, location.id, satisfaction, dayIndex), ...reviews].slice(0, MAX_REVIEWS_STORED);
    }

    if (demand.staffRatio < 0.7 && business.employees.some((e) => e.locationId === location.id)) {
      notifications.push({
        title: 'Understaffed Location',
        message: `${location.name} needs ~${demand.requiredStaff} staff for current demand but only has ${demand.servingStaff}. Service is suffering.`,
        severity: 'warning',
        link: { page: 'businesses', businessId: business.id },
      });
    }

    if (demand.expectedCustomers > demand.capacity) {
      notifications.push({
        title: 'Kitchen Over Capacity',
        message: `${location.name} is operating above kitchen capacity. Wait times and satisfaction are suffering.`,
        severity: 'warning',
        link: { page: 'businesses', businessId: business.id },
      });
    }

    const hasUnresolvedEvent = activeEvents.some((e) => e.locationId === location.id && !e.resolved);
    if (!hasUnresolvedEvent && rng() < DAILY_EVENT_CHANCE) {
      const event = rollBusinessEvent(rng, business.id, location, dayIndex);
      activeEvents = [...activeEvents, event];
      notifications.push({
        title: event.title,
        message: event.description,
        severity: 'urgent',
        link: { page: 'businesses', businessId: business.id },
      });
    }

    return {
      ...location,
      openingHour: todaySchedule.openHour,
      closingHour: todaySchedule.closeHour,
      inventoryStock,
      supplierTier: primarySupplierTier,
      inventory: locationInventory,
      lastWaitTimeMinutes: demand.waitTimeMinutes,
      lastServiceQuality: demand.serviceQuality,
      lastExpectedCustomers: demand.expectedCustomers,
      lastActualCustomers: actualCustomers,
    };
  });

  // Marketing: charge daily portion of active campaigns, finalize completed ones.
  let marketingSpendToday = 0;
  const updatedCampaigns = business.marketingCampaigns.map((campaign) => {
    if (campaign.status !== 'active') return campaign;
    const elapsedDays = dayIndex - campaign.startedAt;
    const dailyCost = campaign.cost / campaign.durationDays;
    const dailyCustomerShare = customersServedTotal > 0 ? Math.min(customersServedTotal, dailyCost > 0 ? customersServedTotal * 0.15 : 0) : 0;

    marketingSpendToday += dailyCost;
    const customersGained = campaign.customersGained + dailyCustomerShare;
    const revenueAttributed = campaign.revenueAttributed + dailyCustomerShare * avgOrderValue;

    if (elapsedDays >= campaign.durationDays) {
      const roi = campaign.cost > 0 ? ((revenueAttributed - campaign.cost) / campaign.cost) * 100 : 0;
      notifications.push({
        title: 'Marketing Campaign Completed',
        message: `${CAMPAIGN_DEFAULTS[campaign.type].label} finished with ${Math.round(customersGained)} customers gained and ${roi >= 0 ? '+' : ''}${roi.toFixed(0)}% ROI.`,
        severity: roi >= 0 ? 'success' : 'info',
        link: { page: 'businesses', businessId: business.id },
      });
      return { ...campaign, status: 'completed' as const, customersGained, revenueAttributed };
    }

    return { ...campaign, customersGained, revenueAttributed };
  });

  if (marketingSpendToday > 0) {
    expensesTotal += marketingSpendToday;
    transactions.push({ amount: -Math.round(marketingSpendToday), category: 'business_marketing', description: `Marketing spend — ${business.name}` });
  }

  // Employee morale drift + resignation checks.
  let employees = [...business.employees];
  const resignedNames: string[] = [];
  employees = employees.flatMap((employee) => {
    const location = updatedLocations.find((l) => l.id === employee.locationId);
    const demandForLocation = location
      ? calculateDemand(business, location, business.employees, getMarketingBoostForLocation(business, location))
      : null;
    const staffRatio = demandForLocation?.staffRatio ?? 1;
    const benefitsMoraleBonus = calculateBenefitsMoraleBonus(employee.benefits) * 0.15;
    const nextMorale = clamp(driftMorale(employee, staffRatio, ROLE_MARKET_SALARY[employee.role] ?? 32_000) + benefitsMoraleBonus, 0, 100);
    const nextSkill = applyTrainingSkillGrowth(employee);
    const updated = { ...employee, morale: nextMorale, skill: nextSkill, experienceYears: employee.experienceYears + 1 / 365 };

    if (shouldResign(updated, rng, calculateBenefitsResignationMultiplier(updated.benefits))) {
      resignedNames.push(updated.name);
      return [];
    }
    return [updated];
  });

  // Benefits: a real daily cost line for every perk currently active, across employees and managers.
  const employeeBenefitsCost = business.employees.reduce((s, e) => s + calculateBenefitsDailyCost(e.benefits, e.salary), 0);
  const managerBenefitsCost = business.managers.reduce((s, m) => s + calculateBenefitsDailyCost(m.benefits, m.salary), 0);
  const benefitsCostToday = employeeBenefitsCost + managerBenefitsCost;
  if (benefitsCostToday > 0) {
    expensesTotal += benefitsCostToday;
    transactions.push({ amount: -Math.round(benefitsCostToday), category: 'business_benefits', description: `Employee & manager benefits — ${business.name}` });
  }

  for (const name of resignedNames) {
    notifications.push({
      title: 'Employee Resigned',
      message: `${name} has resigned from ${business.name} due to low morale.`,
      severity: 'warning',
      link: { page: 'businesses', businessId: business.id },
    });
  }

  const avgSatisfaction = customersServedTotal > 0 ? weightedSatisfaction / customersServedTotal : calculateSatisfaction(business, {
    expectedCustomers: 0, actualCustomers: 0, capacity: 0, effectiveCapacity: 0, modifiers: [], requiredStaff: 0, servingStaff: 0, staffRatio: 1, waitTimeMinutes: 6, serviceQuality: 75,
  });
  const noise = (rng() - 0.5) * 1.5;
  const nextReputation = calculateNextReputation(business.reputation, avgSatisfaction, 0.12, noise);

  const dailyRecord: DailyBusinessRecord = {
    dayIndex,
    revenue: Math.round(revenueTotal),
    expenses: Math.round(expensesTotal),
    profit: Math.round(revenueTotal - expensesTotal),
    customers: customersServedTotal,
    reputation: Math.round(nextReputation),
  };

  const financialHistory = [...business.financialHistory, dailyRecord].slice(-FINANCIAL_HISTORY_MAX_DAYS);

  const updatedBusiness: Business = {
    ...business,
    // Daily revenue and every daily expense line above (COGS, utilities, marketing, benefits, inventory
    // orders) must actually move cash — logging them as transactions without this was a real "money
    // vanishes" bug: business.cash previously only changed on the weekly/monthly cadence.
    cash: business.cash + revenueTotal - expensesTotal,
    locations: updatedLocations,
    marketingCampaigns: updatedCampaigns,
    employees,
    reviews,
    reputation: nextReputation,
    financialHistory,
    activeEvents,
    activeMarketTrends,
    activeSupplierEvents,
  };

  return {
    business: updatedBusiness,
    transactions,
    notifications,
    customersServed: customersServedTotal,
    revenueGenerated: revenueTotal,
    expensesIncurred: expensesTotal,
  };
}

export function runWeeklyPayroll(business: Business): { business: Business; transactions: PendingTransaction[]; notifications: PendingNotification[] } {
  if (business.employees.length === 0 && business.managers.length === 0) {
    return { business, transactions: [], notifications: [] };
  }
  const employeePayroll = business.employees.reduce((sum, e) => sum + e.salary / 52, 0);
  const managerPayroll = business.managers.reduce((sum, m) => sum + m.salary / 52, 0);
  const totalWeeklyPayroll = employeePayroll + managerPayroll;
  const transactions: PendingTransaction[] = [
    { amount: -Math.round(totalWeeklyPayroll), category: 'business_payroll', description: `Weekly payroll — ${business.name}` },
  ];
  const notifications: PendingNotification[] = [];
  const newCash = business.cash - totalWeeklyPayroll;
  if (newCash < 0) {
    notifications.push({
      title: 'Business Cash Negative',
      message: `${business.name} went negative on cash after payroll. Consider raising prices, cutting staff, or investing personal cash.`,
      severity: 'urgent',
      link: { page: 'businesses', businessId: business.id },
    });
  }
  return { business: { ...business, cash: newCash }, transactions, notifications };
}

const WASTE_LOG_MAX_ENTRIES = 50;

/** Weekly spoilage summary across every location — a plain-English root cause, not a per-batch simulation. */
export function runWeeklyInventoryMaintenance(business: Business, dayIndex: number): { business: Business; notifications: PendingNotification[] } {
  const notifications: PendingNotification[] = [];
  let wasteLog = [...business.wasteLog];
  let totalWastedThisWeek = 0;

  for (const location of business.locations) {
    const { entries, totalWasted } = calculateWeeklyWaste(location.inventory, dayIndex);
    if (entries.length === 0) continue;
    totalWastedThisWeek += totalWasted;
    wasteLog = [...entries, ...wasteLog].slice(0, WASTE_LOG_MAX_ENTRIES);
  }

  if (totalWastedThisWeek > 50) {
    const worst = [...wasteLog].sort((a, b) => b.amountWasted - a.amountWasted)[0];
    notifications.push({
      title: 'Inventory Waste This Week',
      message: `$${Math.round(totalWastedThisWeek).toLocaleString('en-US')} in spoiled inventory across ${business.name}. Main reason: ${worst?.reason ?? 'over-ordering relative to usage.'}`,
      severity: 'warning',
      link: { page: 'businesses', businessId: business.id },
    });
  }

  return { business: { ...business, wasteLog }, notifications };
}

export function runMonthlyBusinessSettlement(business: Business): { business: Business; transactions: PendingTransaction[]; notifications: PendingNotification[] } {
  const transactions: PendingTransaction[] = [];
  const notifications: PendingNotification[] = [];
  let cash = business.cash;

  for (const location of business.locations) {
    cash -= location.rent;
    transactions.push({ amount: -location.rent, category: 'business_rent', description: `Monthly rent — ${location.name}` });
  }

  if (business.headquarters) {
    cash -= business.headquarters.monthlyCost;
    const label = business.headquarters.ownership === 'owned' ? 'HQ utilities & maintenance' : 'HQ rent';
    transactions.push({ amount: -business.headquarters.monthlyCost, category: 'business_rent', description: `${label} — ${business.headquarters.tier.replace('_', ' ')}` });
  }

  const companyAssetCost = calculateCompanyAssetMonthlyCost(business.companyVehicles, business.companyPhones);
  if (companyAssetCost > 0) {
    cash -= companyAssetCost;
    transactions.push({ amount: -Math.round(companyAssetCost), category: 'business_benefits', description: `Company vehicle & phone fleet — ${business.name}` });
  }

  const warehouseCost = business.warehouses.reduce((s, w) => s + w.monthlyCost, 0);
  if (warehouseCost > 0) {
    cash -= warehouseCost;
    transactions.push({ amount: -Math.round(warehouseCost), category: 'business_inventory', description: `Warehouse operating costs — ${business.name}` });
  }

  const updatedLoans = business.loans
    .map((loan) => {
      cash -= loan.monthlyPayment;
      transactions.push({ amount: -loan.monthlyPayment, category: 'business_loan_payment', description: `Business loan payment — ${business.name}` });
      const remainingBalance = Math.max(0, loan.remainingBalance - (loan.monthlyPayment - loan.remainingBalance * (loan.interestRateAnnual / 12)));
      const monthsRemaining = loan.monthsRemaining - 1;
      return { ...loan, remainingBalance, monthsRemaining };
    })
    .filter((loan) => loan.monthsRemaining > 0 && loan.remainingBalance > 0.01);

  if (cash < 0) {
    notifications.push({
      title: 'Business Behind On Bills',
      message: `${business.name} could not fully cover rent and loan payments this month.`,
      severity: 'urgent',
      link: { page: 'businesses', businessId: business.id },
    });
  }

  return { business: { ...business, cash, loans: updatedLoans }, transactions, notifications };
}
