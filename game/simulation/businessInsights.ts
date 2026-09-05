import { calculateAvgOrderValue, calculateDemand } from '@/game/simulation/economy';
import { getMarketingBoostForLocation } from '@/game/simulation/business';
import { calculateBlendedRecipePerCustomer, calculateDaysRemaining } from '@/game/simulation/inventory';
import { calculateCompensationBreakdown } from '@/game/simulation/benefits';
import { INGREDIENT_DEFINITIONS } from '@/game/constants/inventory';
import { MANAGER_ROLE_LABELS } from '@/game/constants/data';
import type { Business } from '@/game/types';

export type InsightSeverity = 'opportunity' | 'info' | 'warning' | 'critical';

export interface BusinessInsight {
  id: string;
  locationId: string | null;
  severity: InsightSeverity;
  title: string;
  description: string;
  estimatedDailyImpact: number | null; // positive = potential upside, negative = current cost
  solutions: string[];
}

/** Every insight here reads real simulation numbers — nothing is a generic canned tip. */
export function calculateBusinessInsights(business: Business): BusinessInsight[] {
  const insights: BusinessInsight[] = [];
  const avgOrderValue = calculateAvgOrderValue(business.menu);
  const activeMenu = business.menu.filter((m) => m.active);
  const totalPopularity = activeMenu.reduce((s, m) => s + m.popularity, 0) || 1;
  const blendedRecipe = calculateBlendedRecipePerCustomer(business.menu);

  for (const location of business.locations) {
    const boost = getMarketingBoostForLocation(business, location);
    const demand = calculateDemand(business, location, business.employees, boost);

    // ---------- Inventory: stockouts and running-low warnings, per ingredient ----------
    for (const ingredient of INGREDIENT_DEFINITIONS) {
      const perCustomer = blendedRecipe[ingredient.id];
      if (!perCustomer) continue;
      const stock = location.inventory.stocks[ingredient.id] ?? 0;
      const daysRemaining = calculateDaysRemaining(location.inventory, ingredient.id);
      const affectedItems = activeMenu.filter((m) => m.recipe.some((r) => r.ingredientId === ingredient.id));
      const menuAvailabilityPct = -Math.round((affectedItems.reduce((s, m) => s + m.popularity, 0) / totalPopularity) * 100);
      const incoming = location.inventory.pendingDeliveries.filter((d) => d.ingredientId === ingredient.id);
      const nextDeliveryDays = incoming.length > 0 ? Math.min(...incoming.map((d) => d.arrivesAtDayIndex)) : null;

      if (stock <= 0 && daysRemaining !== null) {
        insights.push({
          id: `${location.id}-${ingredient.id}-out`,
          locationId: location.id,
          severity: 'critical',
          title: `${ingredient.name} Out of Stock`,
          description: `CRITICAL — ${ingredient.name} are out of stock at ${location.name}. Menu availability: ${menuAvailabilityPct}%.`,
          estimatedDailyImpact: null,
          solutions: ['Place an Instant Order from the Inventory tab', 'Enable Assisted/Automatic ordering with an Inventory Manager'],
        });
      } else if (daysRemaining !== null && daysRemaining < 2) {
        insights.push({
          id: `${location.id}-${ingredient.id}-low`,
          locationId: location.id,
          severity: 'critical',
          title: `${ingredient.name} Running Out`,
          description: `${ingredient.name} will run out in approximately ${daysRemaining.toFixed(1)} days at ${location.name}.${nextDeliveryDays !== null ? ` Next delivery in ${nextDeliveryDays}.` : ' No delivery scheduled.'} Suggested: Instant Order.`,
          estimatedDailyImpact: null,
          solutions: ['Place an Instant Order now', 'Set up a recurring order for this ingredient'],
        });
      } else if (daysRemaining !== null && daysRemaining < location.inventory.minStockTargetDays) {
        insights.push({
          id: `${location.id}-${ingredient.id}-warning`,
          locationId: location.id,
          severity: 'warning',
          title: `${ingredient.name} Running Low`,
          description: `${ingredient.name} has about ${daysRemaining.toFixed(1)} days of stock left at ${location.name} — below your ${location.inventory.minStockTargetDays}-day target.`,
          estimatedDailyImpact: null,
          solutions: ['Place a manual order', 'Add a recurring order to cover this automatically'],
        });
      }
    }

    if (demand.expectedCustomers > demand.effectiveCapacity * 1.05) {
      const lostCustomers = demand.expectedCustomers - demand.actualCustomers;
      const lostRevenue = Math.round(lostCustomers * avgOrderValue);
      if (lostRevenue > 20) {
        insights.push({
          id: `${location.id}-capacity`,
          locationId: location.id,
          severity: 'warning',
          title: 'Long Wait Times',
          description: `${location.name} can serve about ${Math.round(demand.effectiveCapacity)} customers/day. Current demand is ${demand.expectedCustomers}. Estimated lost revenue: $${lostRevenue.toLocaleString('en-US')}/day.`,
          estimatedDailyImpact: -lostRevenue,
          solutions: ['Hire another cook or cashier', 'Upgrade kitchen equipment', 'Reduce peak-hour marketing spend'],
        });
      }
    }

    if (demand.staffRatio < 0.75) {
      insights.push({
        id: `${location.id}-understaffed`,
        locationId: location.id,
        severity: 'warning',
        title: 'Understaffed',
        description: `${location.name} needs roughly ${demand.requiredStaff} serving staff for current demand but has ${demand.servingStaff}. Service quality is suffering.`,
        estimatedDailyImpact: null,
        solutions: ['Hire additional staff', 'Reduce operating hours to match current staffing'],
      });
    } else if (demand.staffRatio > 1.5 && demand.servingStaff > 1) {
      const excessStaffCost = Math.round(((demand.staffRatio - 1.15) * demand.requiredStaff) * 90);
      if (excessStaffCost > 15) {
        insights.push({
          id: `${location.id}-overstaffed`,
          locationId: location.id,
          severity: 'info',
          title: 'Possibly Overstaffed',
          description: `${location.name} has more serving staff than current demand needs. Estimated excess payroll: ~$${excessStaffCost.toLocaleString('en-US')}/day.`,
          estimatedDailyImpact: excessStaffCost,
          solutions: ['Reduce staff at this location', 'Grow demand with marketing to make use of the extra capacity'],
        });
      }
    }

    const priceDiffPct = location.marketAvgPrice > 0 ? ((avgOrderValue - location.marketAvgPrice) / location.marketAvgPrice) * 100 : 0;
    if (priceDiffPct < -5) {
      const suggestedIncrease = Math.round(avgOrderValue * 0.05 * 100) / 100;
      const revenueGainEstimate = Math.round(demand.actualCustomers * suggestedIncrease * 0.9);
      insights.push({
        id: `${location.id}-underpriced`,
        locationId: location.id,
        severity: 'opportunity',
        title: 'Pricing Opportunity',
        description: `Average order value at ${location.name} is ${Math.abs(Math.round(priceDiffPct))}% below the local market average. A modest price increase could add revenue with limited demand impact.`,
        estimatedDailyImpact: revenueGainEstimate,
        solutions: [`Raise menu prices by roughly $${suggestedIncrease.toFixed(2)} on average`],
      });
    } else if (priceDiffPct > 15 && demand.actualCustomers < demand.effectiveCapacity * 0.7) {
      insights.push({
        id: `${location.id}-overpriced`,
        locationId: location.id,
        severity: 'warning',
        title: 'Prices May Be Too High',
        description: `Average order value at ${location.name} is ${Math.round(priceDiffPct)}% above the local market average, and the location is running well under capacity.`,
        estimatedDailyImpact: null,
        solutions: ['Lower menu prices to increase demand', 'Invest in reputation/marketing to justify the premium'],
      });
    }

    if (business.reputation < 45) {
      insights.push({
        id: `${location.id}-reputation`,
        locationId: location.id,
        severity: 'warning',
        title: 'Weak Reputation',
        description: `Reputation is dragging down demand at every location. Recent customer experience has been below average.`,
        estimatedDailyImpact: null,
        solutions: ['Improve product quality', 'Fix understaffing or long wait times', 'Run a marketing campaign to rebuild visibility'],
      });
    }
  }

  // ---------- Executive cost as a share of revenue ----------
  const recent7 = business.financialHistory.slice(-7);
  const avgDailyRevenue7 = recent7.length > 0 ? recent7.reduce((s, d) => s + d.revenue, 0) / recent7.length : 0;
  if (avgDailyRevenue7 > 10) {
    for (const manager of business.managers) {
      if (!['ceo', 'cfo', 'cmo', 'coo'].includes(manager.role)) continue;
      const dailyCost = calculateCompensationBreakdown(manager.benefits, manager.salary, business.companyVehicles, business.companyPhones).total;
      const pctOfRevenue = (dailyCost / avgDailyRevenue7) * 100;
      if (pctOfRevenue > 12) {
        insights.push({
          id: `${manager.id}-cost-share`,
          locationId: null,
          severity: pctOfRevenue > 25 ? 'critical' : 'warning',
          title: `${MANAGER_ROLE_LABELS[manager.role]} Cost Is High`,
          description: `${pctOfRevenue > 25 ? 'CRITICAL — ' : ''}Your ${MANAGER_ROLE_LABELS[manager.role]} currently costs ${pctOfRevenue.toFixed(0)}% of total business revenue.`,
          estimatedDailyImpact: -Math.round(dailyCost),
          solutions: ['Grow revenue to justify the executive cost', 'Reduce their benefits package', 'Reconsider whether this role is needed yet'],
        });
      }
    }
  }

  const recent = business.financialHistory.slice(-14);
  if (recent.length >= 7) {
    const avgDailyProfit = recent.reduce((s, d) => s + d.profit, 0) / recent.length;
    if (avgDailyProfit < 0 && business.cash > 0) {
      const runwayDays = Math.round(business.cash / Math.abs(avgDailyProfit));
      insights.push({
        id: 'cash-runway',
        locationId: null,
        severity: runwayDays < 10 ? 'critical' : runwayDays < 30 ? 'warning' : 'info',
        title: 'Business Losing Money',
        description: `Average daily loss over the last ${recent.length} days: $${Math.round(Math.abs(avgDailyProfit)).toLocaleString('en-US')}. At this rate, business cash runs out in about ${runwayDays} days.`,
        estimatedDailyImpact: Math.round(avgDailyProfit),
        solutions: ['Cut unprofitable marketing spend', 'Reduce staffing to match demand', 'Raise prices', 'Invest personal cash into the business'],
      });
    }
  }

  return insights.sort((a, b) => {
    const order: Record<InsightSeverity, number> = { critical: 0, warning: 1, opportunity: 2, info: 3 };
    return order[a.severity] - order[b.severity];
  });
}

export interface ExecutiveCommentary {
  role: string;
  name: string;
  message: string;
}

/**
 * Role-specific executive reactions to real business conditions — a hired CMO/CFO/COO speaks up
 * about the exact thing their role would actually notice. When a role isn't hired, the caller
 * should show the same underlying numbers in a more basic, ungated form rather than hiding them.
 */
export function getExecutiveCommentary(business: Business): ExecutiveCommentary[] {
  const commentary: ExecutiveCommentary[] = [];

  const cmo = business.managers.find((m) => m.role === 'cmo');
  if (cmo && business.activeMarketTrends.length > 0) {
    const trend = business.activeMarketTrends[0];
    if (trend.demandMultiplier > 1) {
      commentary.push({
        role: 'CMO', name: cmo.name,
        message: `${trend.name.replace(/ Rising$| Boom$/, '')} is currently ${Math.round((trend.demandMultiplier - 1) * 100)}% above normal — worth a targeted campaign on ${trend.affectedMenuItemNames.join(', ')} while it lasts.`,
      });
    } else {
      commentary.push({
        role: 'CMO', name: cmo.name,
        message: `${trend.name} is pulling demand down ${Math.abs(Math.round((trend.demandMultiplier - 1) * 100))}% — I'd hold off on new campaigns until it passes.`,
      });
    }
  }

  const cfo = business.managers.find((m) => m.role === 'cfo');
  const recent14 = business.financialHistory.slice(-14);
  if (cfo && recent14.length >= 7) {
    const avgProfit = recent14.reduce((s, d) => s + d.profit, 0) / recent14.length;
    const avgRevenue = recent14.reduce((s, d) => s + d.revenue, 0) / recent14.length;
    const marginPct = avgRevenue > 0 ? (avgProfit / avgRevenue) * 100 : 0;
    if (marginPct < 5) {
      commentary.push({ role: 'CFO', name: cfo.name, message: `Margins are thin — averaging ${marginPct.toFixed(1)}% of revenue over the last two weeks. I'd hold off on new spending commitments.` });
    } else {
      commentary.push({ role: 'CFO', name: cfo.name, message: `Margins are healthy at ${marginPct.toFixed(1)}% of revenue over the last two weeks — there's room to reinvest.` });
    }
  }

  const coo = business.managers.find((m) => m.role === 'coo');
  if (coo) {
    const overCapacityLocations = business.locations.filter((l) => l.lastExpectedCustomers > 0 && l.lastActualCustomers < l.lastExpectedCustomers * 0.85);
    if (overCapacityLocations.length > 0) {
      commentary.push({ role: 'COO', name: coo.name, message: `${overCapacityLocations.map((l) => l.name).join(', ')} ${overCapacityLocations.length === 1 ? 'is' : 'are'} turning away demand — capacity or stock is the bottleneck, not lack of customers.` });
    }
  }

  return commentary;
}

export interface BreakEvenAnalysis {
  dailyBreakEvenRevenue: number;
  currentDailyRevenue: number;
  marginOfSafetyPct: number;
}

export function calculateBreakEven(business: Business): BreakEvenAnalysis {
  const recent = business.financialHistory.slice(-14);
  if (recent.length === 0) return { dailyBreakEvenRevenue: 0, currentDailyRevenue: 0, marginOfSafetyPct: 0 };

  // `d.expenses` only carries the categories charged daily (COGS, utilities, inventory, marketing).
  // Rent and loan payments are charged once a month, so we amortize them here to get a true
  // fully-loaded daily break-even figure rather than one that spikes only on the 1st.
  const avgDailyVariableExpenses = recent.reduce((s, d) => s + d.expenses, 0) / recent.length;
  const avgDailyRevenue = recent.reduce((s, d) => s + d.revenue, 0) / recent.length;
  const monthlyFixedCosts = business.locations.reduce((s, l) => s + l.rent, 0) + business.loans.reduce((s, l) => s + l.monthlyPayment, 0);
  const dailyBreakEvenRevenue = Math.round(avgDailyVariableExpenses + monthlyFixedCosts / 30);
  const marginOfSafetyPct = dailyBreakEvenRevenue > 0 ? Math.round(((avgDailyRevenue - dailyBreakEvenRevenue) / dailyBreakEvenRevenue) * 100) : 0;

  return {
    dailyBreakEvenRevenue,
    currentDailyRevenue: Math.round(avgDailyRevenue),
    marginOfSafetyPct,
  };
}
