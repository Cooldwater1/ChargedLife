import type { NavSection } from "@/lib/game/fastFood/types";

export type DashboardTone = "positive" | "negative" | "blue" | "purple" | "gold" | "neutral";

export type DashboardMetric = {
  id: "revenue" | "expenses" | "profit" | "cash" | "businesses" | "employees" | "reputation";
  label: string;
  value: number | string;
  helper: string;
  comparison?: number;
  history: number[];
  tone: DashboardTone;
};

export type DashboardBusinessRow = {
  id: string;
  name: string;
  industry: string;
  locations: number;
  employees: number;
  revenue: number;
  profit: number;
  cash: number;
  reputation: number | null;
  status: "Operating" | "Preparing" | "Expanding" | "Paused" | "Closed" | "Struggling";
  targetSection: NavSection;
};

export type DashboardActivity = {
  id: string;
  tone: "positive" | "warning" | "negative" | "info";
  text: string;
  day: number;
  targetSection: NavSection;
};

export type DashboardEvent = {
  id: string;
  title: string;
  description: string;
  dueLabel: string;
  targetSection: NavSection;
};
