import type { DailyReport, FastFoodGame } from "@/lib/game/fastFood/types";
import { deriveOperationalStatus } from "@/lib/game/fastFood/openingRequirements";
import type { DashboardActivity, DashboardBusinessRow, DashboardEvent, DashboardMetric } from "./dashboardTypes";
import { getBusinessDisplayName } from "@/lib/game/empireSummary";

const safeReports = (game: FastFoodGame) => Array.isArray(game.reports) ? game.reports : [];
const history = (game: FastFoodGame, key: keyof Pick<DailyReport, "revenue" | "expenses" | "profit" | "customersServed">) =>
  safeReports(game).slice(0, 7).reverse().map((report) => Number(report[key]) || 0);

const comparison = (current: number, previous?: number) => previous && previous !== 0
  ? ((current - previous) / Math.abs(previous)) * 100
  : undefined;

export function getDashboardSummary(game: FastFoodGame): DashboardMetric[] {
  const reports = safeReports(game);
  const current = reports[0];
  const previous = reports[1];
  const reputation = game.reviews > 0 ? game.reputation : 0;
  return [
    { id: "revenue", label: "Total Revenue", value: current?.revenue ?? 0, helper: previous ? "vs previous day" : "Complete another day to unlock comparison", comparison: comparison(current?.revenue ?? 0, previous?.revenue), history: history(game, "revenue"), tone: "positive" },
    { id: "expenses", label: "Total Expenses", value: current?.expenses ?? 0, helper: previous ? "vs previous day" : "Complete another day to unlock comparison", comparison: comparison(current?.expenses ?? 0, previous?.expenses), history: history(game, "expenses"), tone: "negative" },
    { id: "profit", label: "Total Profit", value: current?.profit ?? 0, helper: previous ? "vs previous day" : "Complete another day to unlock comparison", comparison: comparison(current?.profit ?? 0, previous?.profit), history: history(game, "profit"), tone: (current?.profit ?? 0) < 0 ? "negative" : "positive" },
    { id: "cash", label: "Company Cash", value: game.companyCash, helper: "Available operating cash", history: [], tone: "purple" },
    { id: "businesses", label: "Active Businesses", value: game.founded ? 1 : 0, helper: game.additionalTestLocations > 0 ? `${game.additionalTestLocations} test expansion${game.additionalTestLocations === 1 ? "" : "s"}` : "Current portfolio", history: [], tone: "blue" },
    { id: "employees", label: "Total Employees", value: game.employees.length, helper: game.founded ? "Across all businesses" : "No active business", history: [], tone: "blue" },
    { id: "reputation", label: "Overall Reputation", value: game.reviews > 0 ? `${reputation.toFixed(1)} / 5` : "No reviews yet", helper: `${game.reviews} total review${game.reviews === 1 ? "" : "s"}`, history: [], tone: "gold" },
  ];
}

export function getOwnedBusinesses(game: FastFoodGame): DashboardBusinessRow[] {
  if (!game.founded) return [];
  const reports = safeReports(game);
  const latest = reports[0];
  const status = deriveOperationalStatus(game);
  const businessStatus: DashboardBusinessRow["status"] =
    status === "open" ? ((latest?.profit ?? 0) < 0 ? "Struggling" : "Operating") :
    status === "renovating" ? "Paused" :
    status === "closed" ? "Closed" : "Preparing";
  return [{
    id: game.businessId,
    name: getBusinessDisplayName(game),
    industry: "Fast Food",
    locations: 1 + (game.additionalTestLocations || 0),
    employees: game.employees.length,
    revenue: latest?.revenue ?? 0,
    profit: latest?.profit ?? 0,
    cash: game.companyCash,
    reputation: game.reviews > 0 ? game.reputation : null,
    status: businessStatus,
    targetSection: "Business Center",
  }];
}

export function getTopEarningBusinesses(game: FastFoodGame) {
  return getOwnedBusinesses(game).sort((a, b) => b.revenue - a.revenue || b.profit - a.profit);
}

export function getPerformanceSnapshot(game: FastFoodGame) {
  const reports = safeReports(game);
  const latest = reports[0];
  const previous = reports[1];
  const revenue = latest?.revenue ?? 0;
  const profit = latest?.profit ?? 0;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const cashFlow = latest ? latest.revenue - latest.expenses : 0;
  return {
    revenue: { value: revenue, comparison: comparison(revenue, previous?.revenue), history: history(game, "revenue") },
    margin: { value: margin, comparison: previous?.revenue ? margin - (((previous.profit ?? 0) / previous.revenue) * 100) : undefined, history: safeReports(game).slice(0, 7).reverse().map((report) => report.revenue > 0 ? (report.profit / report.revenue) * 100 : 0) },
    profit: { value: profit, comparison: comparison(profit, previous?.profit), history: history(game, "profit") },
    cashFlow: { value: cashFlow, comparison: previous ? comparison(cashFlow, previous.revenue - previous.expenses) : undefined, history: safeReports(game).slice(0, 7).reverse().map((report) => report.revenue - report.expenses) },
  };
}

export function getRecentBusinessActivity(game: FastFoodGame): DashboardActivity[] {
  const activities: DashboardActivity[] = [];
  safeReports(game).slice(0, 3).forEach((report) => activities.push({
    id: `report-${report.day}`,
    tone: report.profit >= 0 ? "positive" : "negative",
    text: `${getBusinessDisplayName(game)} completed daily operations: ${report.headline}.`,
    day: report.day,
    targetSection: "Reports",
  }));
  (Array.isArray(game.notifications) ? game.notifications : []).slice(0, 4).forEach((notification) => activities.push({
    id: notification.id,
    tone: notification.severity === "success" ? "positive" : notification.severity === "warning" ? "warning" : "info",
    text: notification.text,
    day: game.day,
    targetSection: notification.section,
  }));
  if (game.founded && activities.length === 0) activities.push({ id: "business-created", tone: "info", text: `${getBusinessDisplayName(game)} was created.`, day: game.day, targetSection: "Businesses" });
  return activities.filter((activity, index, all) => all.findIndex((item) => item.text === activity.text) === index).slice(0, 5);
}

export function getUpcomingBusinessEvents(game: FastFoodGame): DashboardEvent[] {
  const events: DashboardEvent[] = [
    { id: "payday", title: "Employee Payday", description: `Pay ${game.employees.length} employee${game.employees.length === 1 ? "" : "s"}`, dueLabel: "Day 7", targetSection: "Employees" },
    { id: "monthly-report", title: "Monthly Report", description: "Review monthly performance", dueLabel: "Day 30", targetSection: "Reports" },
  ];
  const pendingDeliveries = Array.isArray(game.pendingDeliveries) ? game.pendingDeliveries : [];
  if (pendingDeliveries.length > 0) {
    const next = [...pendingDeliveries].sort((a, b) => a.expectedDay - b.expectedDay)[0];
    events.push({ id: `delivery-${next.id}`, title: "Supplier Delivery", description: "Incoming inventory order", dueLabel: `Day ${next.expectedDay}`, targetSection: "Inventory" });
  } else if (!game.selectedSupplierId && game.founded) {
    events.push({ id: "supplier", title: "Choose Supplier", description: "Required before inventory orders", dueLabel: "Needed", targetSection: "Inventory" });
  }
  if (game.marketingDays > 0) events.push({ id: "marketing", title: "Marketing Campaign Ends", description: "Review campaign performance", dueLabel: `${game.marketingDays} day${game.marketingDays === 1 ? "" : "s"}`, targetSection: "Marketing" });
  return events.slice(0, 4);
}
