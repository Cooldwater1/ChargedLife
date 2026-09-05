import type { FastFoodGame, NavSection } from "./fastFood/types";
import { deriveOperationalStatus, getOpeningRequirements } from "./fastFood/openingRequirements";

export type BusinessWarning = {
  id: string;
  severity: "critical" | "warning" | "info" | "success";
  label: string;
  description: string;
  targetSection: NavSection;
};

export type OpeningProgress = {
  completed: number;
  total: number;
  percentage: number;
  missing: string[];
};

export function getOpeningProgress(game: FastFoodGame): OpeningProgress {
  const requirements = getOpeningRequirements(game);
  const completed = requirements.filter((requirement) => requirement.complete).length;
  const missing = requirements.filter((requirement) => !requirement.complete).map((requirement) => requirement.label);
  return {
    completed,
    total: requirements.length,
    percentage: requirements.length ? Math.round((completed / requirements.length) * 100) : 100,
    missing,
  };
}

export function getBusinessWarnings(game: FastFoodGame): BusinessWarning[] {
  const status = deriveOperationalStatus(game);
  const preparing = status === "planning" || status === "preparing" || status === "ready";
  const lowStock = game.inventory.filter((item) => item.stock <= item.reorder).length;
  const hasCashier = game.employees.some((employee) => employee.role === "Cashier");
  const hasKitchen = game.employees.some((employee) => employee.role === "Kitchen Crew" || employee.role === "Cook");
  const brokenEquipment = game.equipment.filter((item) => item.condition <= 20).length;
  const warnings: BusinessWarning[] = [];

  if (!game.selectedSupplierId) {
    warnings.push({
      id: "supplier",
      severity: preparing ? "warning" : "critical",
      label: "Supplier not selected",
      description: preparing ? "Choose a supplier before ordering opening inventory." : "Operations are at risk without an active supplier.",
      targetSection: "Inventory",
    });
  }

  if (preparing && game.inventory.every((item) => item.stock <= 0)) {
    warnings.push({
      id: "opening-inventory",
      severity: "warning",
      label: "Opening inventory not ordered",
      description: "Place the first stock order before opening the restaurant.",
      targetSection: "Inventory",
    });
  } else if (!preparing && lowStock > 0) {
    warnings.push({
      id: "low-stock",
      severity: lowStock >= 5 ? "critical" : "warning",
      label: `${lowStock} low-stock item${lowStock === 1 ? "" : "s"}`,
      description: "Restock ingredients before shortages reduce sales.",
      targetSection: "Inventory",
    });
  }

  if (!hasCashier || !hasKitchen) {
    warnings.push({
      id: "staffing",
      severity: preparing ? "warning" : "critical",
      label: preparing ? "Opening staffing incomplete" : "Staff shortage",
      description: !hasCashier && !hasKitchen ? "Hire a cashier and kitchen employee." : !hasCashier ? "Hire a cashier." : "Hire a kitchen employee or cook.",
      targetSection: "Employees",
    });
  }

  if (brokenEquipment > 0) {
    warnings.push({
      id: "equipment",
      severity: "critical",
      label: `${brokenEquipment} equipment issue${brokenEquipment === 1 ? "" : "s"}`,
      description: "Repair critical equipment before the next operating day.",
      targetSection: "Equipment",
    });
  }

  if (warnings.length === 0) {
    warnings.push({
      id: "stable",
      severity: "success",
      label: "Operations stable",
      description: "No urgent business issues require attention.",
      targetSection: "Business Center",
    });
  }

  return warnings;
}
