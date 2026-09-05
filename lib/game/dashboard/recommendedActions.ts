import type { FastFoodGame } from "@/lib/game/fastFood/types";
import { deriveOperationalStatus } from "@/lib/game/fastFood/openingRequirements";
import type { RecommendedAction } from "./dashboardTypes";

export function getRecommendedActions(game: FastFoodGame): RecommendedAction[] {
  if (!game.founded) {
    return [{
      id: "create-business",
      priority: 1,
      title: "Open your first business",
      description: "Create your first fast-food company and choose a restaurant concept, building and location.",
      buttonLabel: "Start your business",
      targetSection: "Businesses",
      severity: "critical",
    }];
  }

  const actions: RecommendedAction[] = [];
  const status = deriveOperationalStatus(game);
  const reports = Array.isArray(game.reports) ? game.reports : [];
  const latest = reports[0];
  const lowStock = game.inventory.filter((item) => item.stock <= item.reorder).length;
  const brokenEquipment = game.equipment.filter((item) => item.condition <= 30).length;
  const hasCashier = game.employees.some((employee) => employee.role === "Cashier");
  const hasKitchen = game.employees.some((employee) => employee.role === "Kitchen Crew" || employee.role === "Cook");

  if (!game.selectedSupplierId) actions.push({
    id: "choose-supplier", priority: 1, title: "Choose a supplier",
    description: "Compare price, quality and reliability before ordering ingredients.",
    buttonLabel: "Compare suppliers", targetSection: "Inventory", severity: "critical",
  });

  if (game.selectedSupplierId && game.inventory.every((item) => item.stock <= 0)) actions.push({
    id: "order-inventory", priority: 2, title: "Order starting inventory",
    description: "Stock the ingredients required by your active menu before opening.",
    buttonLabel: "Place first order", targetSection: "Inventory", severity: "critical",
  });

  if (!hasCashier || !hasKitchen) actions.push({
    id: "hire-required-staff", priority: 3, title: "Hire required employees",
    description: !hasCashier && !hasKitchen ? "Hire at least one cashier and one kitchen employee." : !hasCashier ? "Hire a cashier to handle customer orders." : "Hire a kitchen employee or cook.",
    buttonLabel: "Hire employees", targetSection: "Employees", severity: "important",
  });

  if (status === "ready") actions.push({
    id: "open-restaurant", priority: 4, title: "Open your first restaurant",
    description: "Your required setup is complete. Open the location and begin serving customers.",
    buttonLabel: "Open restaurant", targetSection: "Restaurant Overview", severity: "important",
  });

  if (status === "preparing" || status === "planning") actions.push({
    id: "complete-setup", priority: 5, title: "Complete opening setup",
    description: "Review the location checklist and finish the remaining opening requirements.",
    buttonLabel: "Continue setup", targetSection: "Restaurant Overview", severity: "recommended",
  });

  if (status === "open" && lowStock > 0) actions.push({
    id: "restock", priority: 1, title: "Restock low inventory",
    description: `${lowStock} item${lowStock === 1 ? " is" : "s are"} at or below the reorder level. Restock before sales are affected.`,
    buttonLabel: "Review inventory", targetSection: "Inventory", severity: lowStock >= 5 ? "critical" : "important",
  });

  if (status === "open" && game.employees.length < 3) actions.push({
    id: "improve-staffing", priority: 2, title: "Improve shift coverage",
    description: "Add staff to reduce wait times and protect customer satisfaction during busy periods.",
    buttonLabel: "Review employees", targetSection: "Employees", severity: "important",
  });

  if (brokenEquipment > 0) actions.push({
    id: "repair-equipment", priority: 2, title: "Repair equipment",
    description: `${brokenEquipment} equipment item${brokenEquipment === 1 ? " needs" : "s need"} maintenance before performance declines.`,
    buttonLabel: "Open equipment", targetSection: "Equipment", severity: "important",
  });

  if (latest && latest.profit < 0) actions.push({
    id: "review-loss", priority: 2, title: "Review negative profit",
    description: `The latest business day ended at ${latest.profit < 0 ? "a loss" : "break-even"}. Review costs, pricing and menu margins.`,
    buttonLabel: "Review finances", targetSection: "Finances", severity: "important",
  });

  if (status === "open" && game.marketingDays <= 0) actions.push({
    id: "start-marketing", priority: 5, title: "Start a marketing campaign",
    description: "Build awareness and attract more customers with a targeted promotion.",
    buttonLabel: "Review marketing", targetSection: "Marketing", severity: "recommended",
  });

  if (status === "open" && game.reputation < 4 && game.reviews > 0) actions.push({
    id: "raise-satisfaction", priority: 4, title: "Raise customer satisfaction",
    description: "Improve food availability, wait times and service quality to strengthen reviews.",
    buttonLabel: "Review customers", targetSection: "Customers", severity: "recommended",
  });

  if (status === "open" && latest?.profit && latest.profit > 0 && game.companyCash > 50000) actions.push({
    id: "prepare-expansion", priority: 6, title: "Prepare a second location",
    description: "Your business has positive cash flow. Review the requirements for expanding the brand.",
    buttonLabel: "Explore locations", targetSection: "Locations", severity: "optional",
  });

  actions.push({
    id: "review-finances", priority: 8, title: "Review your finances",
    description: "Check cash flow, operating costs and business value before advancing several days.",
    buttonLabel: "View finances", targetSection: "Finances", severity: "optional",
  });

  return actions
    .sort((a, b) => {
      const severityOrder = { critical: 0, important: 1, recommended: 2, optional: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity] || a.priority - b.priority;
    })
    .filter((action, index, all) => all.findIndex((item) => item.id === action.id) === index)
    .slice(0, 6)
    .map((action, index) => ({ ...action, priority: index + 1 }));
}
