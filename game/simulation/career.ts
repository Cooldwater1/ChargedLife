import { getHighestCompletedRank } from '@/game/simulation/education';
import { EDUCATION_LEVEL_RANK } from '@/game/types';
import type { CareerState, EducationState, JobDefinition } from '@/game/types';

export interface RequirementCheck {
  label: string;
  met: boolean;
}

export interface JobEligibility {
  eligible: boolean;
  checks: RequirementCheck[];
}

/** Evaluates whether a player qualifies for a job, including the "experience in lieu of a degree" alt path. */
export function checkJobEligibility(job: JobDefinition, education: EducationState, career: CareerState): JobEligibility {
  const req = job.requirements;
  const checks: RequirementCheck[] = [];

  const requiredRank = EDUCATION_LEVEL_RANK[req.minEducationLevel];
  const playerRank = getHighestCompletedRank(education.completedDegrees);
  const rankMet = playerRank >= requiredRank;

  let fieldMet = true;
  if (req.acceptableFields && req.acceptableFields.length > 0) {
    fieldMet = education.completedDegrees.some(
      (d) => EDUCATION_LEVEL_RANK[d.level] >= requiredRank && d.field !== null && req.acceptableFields!.includes(d.field),
    );
  }
  const educationMet = rankMet && fieldMet;

  const altPathMet = req.altMinExperienceYears !== undefined && career.experienceYears >= req.altMinExperienceYears;

  if (req.minEducationLevel !== 'none') {
    checks.push({ label: `${req.acceptableFields ? 'Relevant degree' : 'Education requirement'} met`, met: educationMet || altPathMet });
  }

  const experienceMet = career.experienceYears >= req.minExperienceYears;
  if (req.minExperienceYears > 0) {
    checks.push({ label: `${req.minExperienceYears}+ years experience`, met: experienceMet || altPathMet });
  }

  let industryMet = true;
  if (req.minIndustryExperienceYears) {
    const industryYears = career.industryExperience[job.industry] ?? 0;
    industryMet = industryYears >= req.minIndustryExperienceYears;
    checks.push({ label: `${req.minIndustryExperienceYears}+ years in ${job.industry}`, met: industryMet });
  }

  const eligible = altPathMet || (educationMet && experienceMet && industryMet);

  return { eligible, checks };
}

export function getNextLadderJob(jobs: JobDefinition[], currentJob: JobDefinition): JobDefinition | null {
  return jobs.find((j) => j.industry === currentJob.industry && j.tier === currentJob.tier + 1) ?? null;
}
