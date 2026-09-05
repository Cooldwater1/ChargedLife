import { EDUCATION_PROGRAMS } from '@/game/constants/education';
import { INSTITUTION_TIER_MULTIPLIER, SCHOLARSHIP_CHANCE, SCHOLARSHIP_DISCOUNT_MAX, SCHOLARSHIP_DISCOUNT_MIN } from '@/game/constants/balance';
import { randRange } from '@/lib/random';
import { EDUCATION_LEVEL_RANK } from '@/game/types';
import type { CompletedDegree, EducationLevel, EducationProgramDefinition, EducationState, InstitutionTier } from '@/game/types';

export function getProgram(programId: string): EducationProgramDefinition | undefined {
  return EDUCATION_PROGRAMS.find((p) => p.id === programId);
}

export function calculateTuition(program: EducationProgramDefinition, tier: InstitutionTier): number {
  return Math.round(program.baseTuition * INSTITUTION_TIER_MULTIPLIER[tier].cost);
}

/** Rolls a one-time scholarship discount at enrollment. Returns 0 if none is awarded. */
export function rollScholarshipDiscount(rng: () => number): number {
  if (rng() >= SCHOLARSHIP_CHANCE) return 0;
  return randRange(rng, SCHOLARSHIP_DISCOUNT_MIN, SCHOLARSHIP_DISCOUNT_MAX);
}

export function getHighestCompletedRank(completedDegrees: CompletedDegree[]): number {
  return completedDegrees.reduce((max, d) => Math.max(max, EDUCATION_LEVEL_RANK[d.level]), 0);
}

export function getHighestCompletedLevel(completedDegrees: CompletedDegree[]): EducationLevel {
  let best: EducationLevel = 'none';
  let bestRank = 0;
  for (const d of completedDegrees) {
    if (EDUCATION_LEVEL_RANK[d.level] > bestRank) {
      bestRank = EDUCATION_LEVEL_RANK[d.level];
      best = d.level;
    }
  }
  return best;
}

/** Advances enrollment progress by one day. Returns the completed degree, if graduation happened today. */
export function advanceEducationDay(education: EducationState, dayIndex: number): { education: EducationState; completed: CompletedDegree | null } {
  if (!education.enrolledProgramId || !education.institutionTier) {
    return { education, completed: null };
  }

  const progressDays = education.progressDays + 1;
  if (progressDays < education.totalDaysRequired) {
    return { education: { ...education, progressDays }, completed: null };
  }

  const program = getProgram(education.enrolledProgramId);
  const completed: CompletedDegree = {
    level: program?.level ?? 'certification',
    field: program?.field ?? null,
    institutionTier: education.institutionTier,
    completedAt: dayIndex,
  };

  return {
    education: {
      completedDegrees: [...education.completedDegrees, completed],
      enrolledProgramId: null,
      institutionTier: null,
      progressDays: 0,
      totalDaysRequired: 0,
      studentLoanId: education.studentLoanId,
    },
    completed,
  };
}
