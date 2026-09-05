import type { EmployeeRole, EmployeeTrait, JobDefinition, ManagerRole } from '@/game/types';

// ---------- Career ladders ----------
// Four industries, each a full ladder from entry-level to executive.
// Retail/Operations requires no formal education (a viable no-degree path).
// The other three gate their upper tiers behind education and/or experience,
// with technology also allowing a pure-experience alternative path.

export const JOB_DEFINITIONS: JobDefinition[] = [
  // ---------- Retail / Operations (no degree required) ----------
  {
    id: 'retail_associate',
    title: 'Retail Associate',
    company: 'Sterling Retail Group',
    industry: 'retail',
    tier: 1,
    annualSalary: 28_000,
    requirements: { minEducationLevel: 'none', minExperienceYears: 0 },
    workloadHoursPerWeek: 32,
    stress: 25,
    description: 'Stock shelves, help customers, and staff the register at a local store.',
  },
  {
    id: 'shift_supervisor',
    title: 'Shift Supervisor',
    company: 'Sterling Retail Group',
    industry: 'retail',
    tier: 2,
    annualSalary: 36_000,
    requirements: { minEducationLevel: 'none', minExperienceYears: 1, minIndustryExperienceYears: 1 },
    workloadHoursPerWeek: 36,
    stress: 35,
    description: 'Run a shift, manage a small team, and handle escalations.',
  },
  {
    id: 'store_manager',
    title: 'Store Manager',
    company: 'Sterling Retail Group',
    industry: 'retail',
    tier: 3,
    annualSalary: 52_000,
    requirements: { minEducationLevel: 'none', minExperienceYears: 3, minIndustryExperienceYears: 3 },
    workloadHoursPerWeek: 42,
    stress: 50,
    description: 'Own the full P&L for a store location, including staffing and inventory.',
  },
  {
    id: 'regional_manager',
    title: 'Regional Manager',
    company: 'Sterling Retail Group',
    industry: 'retail',
    tier: 4,
    annualSalary: 78_000,
    requirements: { minEducationLevel: 'none', minExperienceYears: 6, minIndustryExperienceYears: 6 },
    workloadHoursPerWeek: 45,
    stress: 60,
    description: 'Oversee a dozen store locations across a metro region.',
  },
  {
    id: 'operations_director',
    title: 'Operations Director',
    company: 'Sterling Retail Group',
    industry: 'retail',
    tier: 5,
    annualSalary: 115_000,
    requirements: { minEducationLevel: 'none', minExperienceYears: 10, minIndustryExperienceYears: 10 },
    workloadHoursPerWeek: 48,
    stress: 65,
    description: 'Set operational strategy for the entire retail chain.',
  },

  // ---------- Marketing ----------
  {
    id: 'marketing_assistant',
    title: 'Marketing Assistant',
    company: 'BrightWave Media',
    industry: 'marketing',
    tier: 1,
    annualSalary: 46_000,
    requirements: { minEducationLevel: 'high_school', minExperienceYears: 0 },
    workloadHoursPerWeek: 38,
    stress: 30,
    description: 'Support campaign execution, reporting, and content scheduling.',
  },
  {
    id: 'marketing_specialist',
    title: 'Marketing Specialist',
    company: 'BrightWave Media',
    industry: 'marketing',
    tier: 2,
    annualSalary: 58_000,
    requirements: { minEducationLevel: 'high_school', minExperienceYears: 1, minIndustryExperienceYears: 1 },
    workloadHoursPerWeek: 40,
    stress: 40,
    description: 'Own individual campaigns end-to-end across paid and organic channels.',
  },
  {
    id: 'senior_marketing_specialist',
    title: 'Senior Marketing Specialist',
    company: 'BrightWave Media',
    industry: 'marketing',
    tier: 3,
    annualSalary: 74_000,
    requirements: { minEducationLevel: 'bachelor', acceptableFields: ['marketing', 'business', 'design'], minExperienceYears: 3, minIndustryExperienceYears: 3 },
    workloadHoursPerWeek: 42,
    stress: 45,
    description: 'Lead multi-channel campaigns and mentor junior specialists.',
  },
  {
    id: 'marketing_manager',
    title: 'Marketing Manager',
    company: 'BrightWave Media',
    industry: 'marketing',
    tier: 4,
    annualSalary: 95_000,
    requirements: { minEducationLevel: 'bachelor', acceptableFields: ['marketing', 'business'], minExperienceYears: 5, minIndustryExperienceYears: 5 },
    workloadHoursPerWeek: 44,
    stress: 55,
    description: 'Manage a marketing team and own the department budget.',
  },
  {
    id: 'senior_marketing_manager',
    title: 'Senior Marketing Manager',
    company: 'BrightWave Media',
    industry: 'marketing',
    tier: 5,
    annualSalary: 118_000,
    requirements: { minEducationLevel: 'bachelor', acceptableFields: ['marketing', 'business'], minExperienceYears: 5, minIndustryExperienceYears: 5 },
    workloadHoursPerWeek: 45,
    stress: 60,
    description: 'Set strategy across all campaigns and lead a larger cross-functional team.',
  },
  {
    id: 'marketing_director',
    title: 'Marketing Director',
    company: 'BrightWave Media',
    industry: 'marketing',
    tier: 6,
    annualSalary: 145_000,
    requirements: { minEducationLevel: 'bachelor', acceptableFields: ['marketing', 'business'], minExperienceYears: 8, minIndustryExperienceYears: 8 },
    workloadHoursPerWeek: 46,
    stress: 65,
    description: 'Direct the marketing function across every product line.',
  },
  {
    id: 'vp_marketing',
    title: 'VP Marketing',
    company: 'BrightWave Media',
    industry: 'marketing',
    tier: 7,
    annualSalary: 190_000,
    requirements: { minEducationLevel: 'bachelor', acceptableFields: ['marketing', 'business'], minExperienceYears: 12, minIndustryExperienceYears: 12 },
    workloadHoursPerWeek: 48,
    stress: 70,
    description: 'Report to the C-suite and own the full marketing P&L.',
  },
  {
    id: 'cmo',
    title: 'Chief Marketing Officer',
    company: 'BrightWave Media',
    industry: 'marketing',
    tier: 8,
    annualSalary: 260_000,
    requirements: { minEducationLevel: 'bachelor', acceptableFields: ['marketing', 'business'], minExperienceYears: 15, minIndustryExperienceYears: 15 },
    workloadHoursPerWeek: 50,
    stress: 75,
    description: 'Sit on the executive team and set brand and growth strategy company-wide.',
  },

  // ---------- Finance ----------
  {
    id: 'bank_teller',
    title: 'Bank Teller',
    company: 'Nova Financial',
    industry: 'finance',
    tier: 1,
    annualSalary: 34_000,
    requirements: { minEducationLevel: 'high_school', minExperienceYears: 0 },
    workloadHoursPerWeek: 38,
    stress: 25,
    description: 'Handle customer transactions and account inquiries at a branch.',
  },
  {
    id: 'financial_analyst',
    title: 'Financial Analyst',
    company: 'Nova Financial',
    industry: 'finance',
    tier: 2,
    annualSalary: 60_000,
    requirements: { minEducationLevel: 'bachelor', acceptableFields: ['finance', 'accounting', 'economics'], minExperienceYears: 1 },
    workloadHoursPerWeek: 45,
    stress: 45,
    description: 'Build financial models and support investment decisions.',
  },
  {
    id: 'senior_financial_analyst',
    title: 'Senior Financial Analyst',
    company: 'Nova Financial',
    industry: 'finance',
    tier: 3,
    annualSalary: 82_000,
    requirements: { minEducationLevel: 'bachelor', acceptableFields: ['finance', 'accounting', 'economics'], minExperienceYears: 3, minIndustryExperienceYears: 3 },
    workloadHoursPerWeek: 48,
    stress: 55,
    description: 'Lead complex valuation and forecasting work for major accounts.',
  },
  {
    id: 'investment_banking_associate',
    title: 'Investment Banking Associate',
    company: 'Nova Financial',
    industry: 'finance',
    tier: 4,
    annualSalary: 125_000,
    requirements: { minEducationLevel: 'bachelor', acceptableFields: ['finance', 'economics'], minExperienceYears: 2, minIndustryExperienceYears: 2 },
    workloadHoursPerWeek: 60,
    stress: 80,
    description: 'Structure and execute high-stakes deals for institutional clients.',
  },
  {
    id: 'vp_finance',
    title: 'VP Finance',
    company: 'Nova Financial',
    industry: 'finance',
    tier: 5,
    annualSalary: 165_000,
    requirements: { minEducationLevel: 'bachelor', acceptableFields: ['finance', 'accounting', 'economics'], minExperienceYears: 8, minIndustryExperienceYears: 8 },
    workloadHoursPerWeek: 55,
    stress: 75,
    description: 'Oversee capital planning and financial strategy for a major division.',
  },
  {
    id: 'cfo',
    title: 'Chief Financial Officer',
    company: 'Nova Financial',
    industry: 'finance',
    tier: 6,
    annualSalary: 260_000,
    requirements: { minEducationLevel: 'bachelor', acceptableFields: ['finance', 'accounting', 'economics'], minExperienceYears: 12, minIndustryExperienceYears: 12 },
    workloadHoursPerWeek: 55,
    stress: 80,
    description: 'Own the entire financial function and report to the board.',
  },

  // ---------- Technology ----------
  {
    id: 'junior_developer',
    title: 'Junior Developer',
    company: 'Vertex Technologies',
    industry: 'technology',
    tier: 1,
    annualSalary: 65_000,
    requirements: { minEducationLevel: 'bachelor', acceptableFields: ['computer_science', 'engineering'], minExperienceYears: 0, altMinExperienceYears: 2 },
    workloadHoursPerWeek: 40,
    stress: 40,
    description: 'Ship small features under the guidance of senior engineers.',
  },
  {
    id: 'software_engineer',
    title: 'Software Engineer',
    company: 'Vertex Technologies',
    industry: 'technology',
    tier: 2,
    annualSalary: 95_000,
    requirements: { minEducationLevel: 'bachelor', acceptableFields: ['computer_science', 'engineering'], minExperienceYears: 1, altMinExperienceYears: 3 },
    workloadHoursPerWeek: 42,
    stress: 45,
    description: 'Own full features from design through production deployment.',
  },
  {
    id: 'senior_software_engineer',
    title: 'Senior Software Engineer',
    company: 'Vertex Technologies',
    industry: 'technology',
    tier: 3,
    annualSalary: 130_000,
    requirements: { minEducationLevel: 'bachelor', acceptableFields: ['computer_science', 'engineering'], minExperienceYears: 3, minIndustryExperienceYears: 3, altMinExperienceYears: 6 },
    workloadHoursPerWeek: 44,
    stress: 50,
    description: 'Lead architecture decisions and mentor the engineering team.',
  },
  {
    id: 'engineering_manager',
    title: 'Engineering Manager',
    company: 'Vertex Technologies',
    industry: 'technology',
    tier: 4,
    annualSalary: 165_000,
    requirements: { minEducationLevel: 'bachelor', acceptableFields: ['computer_science', 'engineering'], minExperienceYears: 5, minIndustryExperienceYears: 5 },
    workloadHoursPerWeek: 45,
    stress: 60,
    description: 'Manage a squad of engineers and own delivery roadmaps.',
  },
  {
    id: 'vp_engineering',
    title: 'VP Engineering',
    company: 'Vertex Technologies',
    industry: 'technology',
    tier: 5,
    annualSalary: 220_000,
    requirements: { minEducationLevel: 'bachelor', acceptableFields: ['computer_science', 'engineering'], minExperienceYears: 8, minIndustryExperienceYears: 8 },
    workloadHoursPerWeek: 48,
    stress: 65,
    description: 'Set technical strategy and scale the engineering organization.',
  },
  {
    id: 'cto',
    title: 'Chief Technology Officer',
    company: 'Vertex Technologies',
    industry: 'technology',
    tier: 6,
    annualSalary: 310_000,
    requirements: { minEducationLevel: 'bachelor', acceptableFields: ['computer_science', 'engineering'], minExperienceYears: 12, minIndustryExperienceYears: 12 },
    workloadHoursPerWeek: 50,
    stress: 70,
    description: 'Own the entire technology vision and infrastructure strategy.',
  },
];

// ---------- Cities ----------

export interface CityDefinition {
  city: string;
  competition: 'low' | 'medium' | 'high';
  rentMultiplier: number;
  demandMultiplier: number;
  marketAvgPriceMultiplier: number;
  costOfLivingMultiplier: number;
  salaryMultiplier: number;
  label: string;
}

export const CITY_DEFINITIONS: CityDefinition[] = [
  { city: 'Austin', competition: 'low', rentMultiplier: 0.75, demandMultiplier: 0.9, marketAvgPriceMultiplier: 0.92, costOfLivingMultiplier: 0.85, salaryMultiplier: 0.95, label: 'Fast-growing tech hub — moderate cost, low competition' },
  { city: 'Dallas', competition: 'low', rentMultiplier: 0.8, demandMultiplier: 1.0, marketAvgPriceMultiplier: 0.95, costOfLivingMultiplier: 0.9, salaryMultiplier: 0.98, label: 'Major metro — balanced cost and traffic' },
  { city: 'Chicago', competition: 'medium', rentMultiplier: 1.05, demandMultiplier: 1.2, marketAvgPriceMultiplier: 1.0, costOfLivingMultiplier: 1.05, salaryMultiplier: 1.05, label: 'Established metro — strong traffic, medium competition' },
  { city: 'Seattle', competition: 'medium', rentMultiplier: 1.3, demandMultiplier: 1.35, marketAvgPriceMultiplier: 1.08, costOfLivingMultiplier: 1.25, salaryMultiplier: 1.2, label: 'Tech-heavy market — high salaries, high cost' },
  { city: 'Miami', competition: 'high', rentMultiplier: 1.45, demandMultiplier: 1.55, marketAvgPriceMultiplier: 1.12, costOfLivingMultiplier: 1.3, salaryMultiplier: 1.05, label: 'Tourist-driven market — excellent traffic, high competition' },
  { city: 'Los Angeles', competition: 'high', rentMultiplier: 1.7, demandMultiplier: 1.75, marketAvgPriceMultiplier: 1.15, costOfLivingMultiplier: 1.5, salaryMultiplier: 1.15, label: 'Major coastal metro — excellent traffic, high cost' },
  { city: 'San Francisco', competition: 'high', rentMultiplier: 2.1, demandMultiplier: 1.9, marketAvgPriceMultiplier: 1.25, costOfLivingMultiplier: 1.85, salaryMultiplier: 1.4, label: 'Elite tech market — top salaries, very high cost' },
  { city: 'New York', competition: 'high', rentMultiplier: 2.3, demandMultiplier: 2.1, marketAvgPriceMultiplier: 1.3, costOfLivingMultiplier: 1.9, salaryMultiplier: 1.3, label: 'The biggest stage — excellent traffic, highest competition & rent' },
];

// ---------- Fast Food menu defaults ----------

export const DEFAULT_FAST_FOOD_MENU: { name: string; baseCost: number; basePrice: number; popularity: number; recipe: { ingredientId: string; quantity: number }[] }[] = [
  { name: 'Classic Burger', baseCost: 2.8, basePrice: 6.99, popularity: 82, recipe: [{ ingredientId: 'patty', quantity: 1 }, { ingredientId: 'bun', quantity: 1 }, { ingredientId: 'sauce', quantity: 1 }, { ingredientId: 'vegetable', quantity: 1 }] },
  { name: 'Cheeseburger', baseCost: 3.2, basePrice: 7.99, popularity: 90, recipe: [{ ingredientId: 'patty', quantity: 1 }, { ingredientId: 'bun', quantity: 1 }, { ingredientId: 'sauce', quantity: 1 }, { ingredientId: 'vegetable', quantity: 1 }, { ingredientId: 'cheese', quantity: 1 }] },
  { name: 'Chicken Burger', baseCost: 3.6, basePrice: 8.99, popularity: 68, recipe: [{ ingredientId: 'chicken', quantity: 1 }, { ingredientId: 'bun', quantity: 1 }, { ingredientId: 'sauce', quantity: 1 }, { ingredientId: 'vegetable', quantity: 1 }] },
  { name: 'Fries', baseCost: 1.2, basePrice: 3.99, popularity: 95, recipe: [{ ingredientId: 'fries_potato', quantity: 1 }, { ingredientId: 'cooking_oil', quantity: 0.02 }, { ingredientId: 'packaging', quantity: 1 }] },
  { name: 'Soft Drink', baseCost: 0.6, basePrice: 2.99, popularity: 88, recipe: [{ ingredientId: 'soda_syrup', quantity: 0.1 }, { ingredientId: 'cups', quantity: 1 }] },
];

// ---------- Upgrades ----------

import type { UpgradeDefinition } from '@/game/types';

export const FAST_FOOD_UPGRADES: UpgradeDefinition[] = [
  { id: 'pos_system', name: 'Modern POS System', description: 'Faster order-taking and fewer mistakes at the register.', cost: 22_000, requiresUpgradeIds: [], effects: { serviceSpeedPct: 8, workloadPct: -5 } },
  { id: 'kitchen_equipment', name: 'Professional Kitchen Equipment', description: 'Commercial-grade fryers and grills increase throughput and consistency.', cost: 75_000, requiresUpgradeIds: [], effects: { capacityPct: 15, serviceSpeedPct: 8, qualityPct: 4 } },
  { id: 'interior_renovation', name: 'Interior Renovation', description: 'A refreshed dining area improves the customer experience and reputation.', cost: 55_000, requiresUpgradeIds: [], effects: { reputationFlat: 4, qualityPct: 2 } },
  { id: 'training_program', name: 'Employee Training Program', description: 'Structured onboarding and ongoing training improve staff productivity.', cost: 40_000, requiresUpgradeIds: [], effects: { serviceSpeedPct: 6, workloadPct: -8 } },
  { id: 'drive_through', name: 'Drive-Through Lane', description: 'Serve customers without them ever leaving their car — a major capacity boost. Needs a commercial kitchen able to keep pace with the added volume.', cost: 140_000, requiresUpgradeIds: ['kitchen_equipment'], effects: { capacityPct: 25, reputationFlat: 2 } },
  { id: 'automation_line', name: 'Kitchen Automation Line', description: 'Automated fry stations and order routing reduce labor strain at high volume. Requires an established high-throughput kitchen and drive-through already in place.', cost: 260_000, requiresUpgradeIds: ['kitchen_equipment', 'drive_through'], effects: { capacityPct: 20, serviceSpeedPct: 12, workloadPct: -15 } },
];

// ---------- Name pools for procedural candidates/employees/family ----------

export const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Sam', 'Jamie', 'Cameron', 'Drew',
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'Lucas',
  'Mia', 'Henry', 'Charlotte', 'Sebastian', 'Amelia', 'Daniel', 'Hannah', 'Kevin', 'Grace', 'Marcus',
];

export const LAST_NAMES = [
  'Anderson', 'Johnson', 'Williams', 'Brown', 'Miller', 'Davis', 'Garcia', 'Wilson',
  'Martinez', 'Taylor', 'Moore', 'Jackson', 'Thompson', 'White', 'Harris', 'Clark', 'Lewis', 'Walker',
];

export const EMPLOYEE_TRAITS: EmployeeTrait[] = [
  'hardworking', 'friendly', 'ambitious', 'quick_learner', 'leader', 'reliable', 'lazy', 'difficult',
];

export const EMPLOYEE_ROLES: EmployeeRole[] = ['manager', 'cook', 'cashier', 'cleaner'];

export const TRAIT_LABELS: Record<EmployeeTrait, string> = {
  hardworking: 'Hardworking',
  friendly: 'Friendly',
  ambitious: 'Ambitious',
  quick_learner: 'Quick Learner',
  leader: 'Leader',
  reliable: 'Reliable',
  lazy: 'Lazy',
  difficult: 'Difficult',
};

export const ROLE_LABELS: Record<EmployeeRole, string> = {
  manager: 'Manager',
  cook: 'Cook',
  cashier: 'Cashier',
  cleaner: 'Cleaner',
};

export const MANAGER_ROLE_LABELS: Record<ManagerRole, string> = {
  location_manager: 'Location Manager',
  regional_manager: 'Regional Manager',
  hr_manager: 'HR Manager',
  operations_director: 'Operations Director',
  cfo: 'CFO',
  cmo: 'CMO',
  coo: 'COO',
  ceo: 'CEO',
  inventory_manager: 'Inventory Manager',
  procurement_manager: 'Procurement Manager',
  warehouse_manager: 'Warehouse Manager',
};

export const MANAGER_ROLE_DESCRIPTIONS: Record<ManagerRole, string> = {
  location_manager: 'Runs day-to-day decisions at one location so you don’t have to.',
  regional_manager: 'Oversees several locations at once — mainly useful once you have more than one.',
  hr_manager: 'Improves hiring quality, morale, and turnover; required for HR automation.',
  operations_director: 'Improves efficiency, waste, and capacity utilization across locations.',
  cfo: 'Improves cost control, cash management, and financial forecasting. Requires a headquarters.',
  cmo: 'Improves marketing effectiveness and customer acquisition cost. Requires a headquarters.',
  coo: 'Oversees operations and managers company-wide. Requires a headquarters.',
  ceo: 'Sets company strategy and coordinates the executive team. Requires a headquarters.',
  inventory_manager: 'Runs weekly ordering and stock automation — skill determines forecasting quality (pre-ordering ahead of trends vs. over/under-ordering).',
  procurement_manager: 'Negotiates better supplier pricing and reduces ordering overhead across locations.',
  warehouse_manager: 'Reduces spoilage/waste and keeps warehouse operating costs under control.',
};

export interface EmployeeRoleInfo {
  department: string;
  responsibilities: string[];
  expectedEffects: string;
  withoutThem: string;
}

export const EMPLOYEE_ROLE_INFO: Record<EmployeeRole, EmployeeRoleInfo> = {
  manager: {
    department: 'Location Management',
    responsibilities: ['Oversees day-to-day shift operations', 'Boosts effective capacity of the serving staff', 'Improves customer service quality'],
    expectedEffects: 'Raises effective staff output at this location and improves service quality.',
    withoutThem: 'No on-site oversight — the location runs at reduced effective capacity and service quality suffers.',
  },
  cook: {
    department: 'Kitchen',
    responsibilities: ['Prepares food orders', 'Drives kitchen throughput and order speed', 'Consumes ingredient stock per order prepared'],
    expectedEffects: 'Increases how many customers the kitchen can serve per day.',
    withoutThem: 'Kitchen throughput drops, orders back up, and wait times rise.',
  },
  cashier: {
    department: 'Front of House',
    responsibilities: ['Takes and processes customer orders', 'Drives checkout speed and throughput', 'First point of contact for customer experience'],
    expectedEffects: 'Increases how many customers can be checked out per day and shortens wait times.',
    withoutThem: 'Checkout queues grow, wait times rise, and customers are turned away during busy periods.',
  },
  cleaner: {
    department: 'Facilities',
    responsibilities: ['Maintains cleanliness of dining and kitchen areas', 'Supports reputation and health-inspection standing'],
    expectedEffects: 'Small, steady boost to service quality and reputation.',
    withoutThem: 'Cleanliness declines over time, quietly dragging down reputation.',
  },
};

export const INDUSTRY_LABELS: Record<string, string> = {
  retail: 'Retail & Operations',
  marketing: 'Marketing',
  finance: 'Finance',
  technology: 'Technology',
};
