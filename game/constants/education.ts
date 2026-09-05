import type { DegreeField, EducationProgramDefinition, InstitutionTier } from '@/game/types';

export const DEGREE_FIELD_LABELS: Record<DegreeField, string> = {
  business: 'Business Administration',
  finance: 'Finance',
  marketing: 'Marketing',
  computer_science: 'Computer Science',
  engineering: 'Engineering',
  law: 'Law',
  medicine: 'Medicine',
  accounting: 'Accounting',
  economics: 'Economics',
  real_estate: 'Real Estate',
  hospitality: 'Hospitality',
  design: 'Design',
  management: 'Management',
};

export const INSTITUTION_TIER_LABELS: Record<InstitutionTier, string> = {
  community: 'Community College',
  state: 'State University',
  elite: 'Elite University',
};

export const DEGREE_FIELDS: DegreeField[] = [
  'business', 'finance', 'marketing', 'computer_science', 'engineering',
  'accounting', 'economics', 'real_estate', 'hospitality', 'design', 'management',
];

/** Base duration (in-game days) and base tuition before the institution-tier multiplier. */
export const EDUCATION_PROGRAMS: EducationProgramDefinition[] = [
  { id: 'cert_business', level: 'certification', field: 'business', name: 'Business Certificate', durationDays: 14, baseTuition: 2_000 },
  { id: 'cert_it', level: 'certification', field: 'computer_science', name: 'IT Certificate', durationDays: 14, baseTuition: 2_400 },
  { id: 'cert_design', level: 'certification', field: 'design', name: 'Design Certificate', durationDays: 14, baseTuition: 1_800 },
  { id: 'associate_business', level: 'associate', field: 'business', name: 'Associate in Business', durationDays: 60, baseTuition: 8_000 },
  { id: 'associate_cs', level: 'associate', field: 'computer_science', name: 'Associate in Computer Science', durationDays: 60, baseTuition: 8_500 },
  { id: 'bachelor_business', level: 'bachelor', field: 'business', name: "Bachelor's in Business Administration", durationDays: 120, baseTuition: 40_000 },
  { id: 'bachelor_finance', level: 'bachelor', field: 'finance', name: "Bachelor's in Finance", durationDays: 120, baseTuition: 42_000 },
  { id: 'bachelor_marketing', level: 'bachelor', field: 'marketing', name: "Bachelor's in Marketing", durationDays: 120, baseTuition: 38_000 },
  { id: 'bachelor_cs', level: 'bachelor', field: 'computer_science', name: "Bachelor's in Computer Science", durationDays: 120, baseTuition: 45_000 },
  { id: 'bachelor_engineering', level: 'bachelor', field: 'engineering', name: "Bachelor's in Engineering", durationDays: 120, baseTuition: 46_000 },
  { id: 'bachelor_accounting', level: 'bachelor', field: 'accounting', name: "Bachelor's in Accounting", durationDays: 120, baseTuition: 39_000 },
  { id: 'bachelor_economics', level: 'bachelor', field: 'economics', name: "Bachelor's in Economics", durationDays: 120, baseTuition: 40_000 },
  { id: 'master_business', level: 'master', field: 'business', name: 'MBA', durationDays: 90, baseTuition: 55_000 },
  { id: 'master_finance', level: 'master', field: 'finance', name: "Master's in Finance", durationDays: 90, baseTuition: 50_000 },
  { id: 'master_cs', level: 'master', field: 'computer_science', name: "Master's in Computer Science", durationDays: 90, baseTuition: 52_000 },
  { id: 'doctorate_business', level: 'doctorate', field: 'business', name: 'Doctorate in Business', durationDays: 150, baseTuition: 65_000 },
];
