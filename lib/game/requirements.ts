import type { Job, LifeStats } from "./types";

export function getJobMissingRequirements(
  life: LifeStats,
  job: Job,
  getDegreeName: (degreeId: string) => string,
  getJobName: (jobId: string) => string
) {
  const missing: string[] = [];

  if (job.requiredDegree && !life.completedDegrees.includes(job.requiredDegree)) {
    missing.push(`${getDegreeName(job.requiredDegree)} required`);
  }

  if (job.requiredJobId) {
    const requiredExperience = job.requiredJobExperience || 1;
    const currentExperience = life.jobExperience[job.requiredJobId] || 0;

    if (currentExperience < requiredExperience) {
      missing.push(
        `${requiredExperience} work experience as ${getJobName(
          job.requiredJobId
        )} required, you have ${currentExperience}`
      );
    }
  }

  if (life.skills[job.track] < job.requiredSkill) {
    missing.push(
      `${formatRequirementLabel(job.track)} skill ${job.requiredSkill} required, you have ${life.skills[job.track]}`
    );
  }

  if (life.educationLevel < job.requiredEducationLevel) {
    missing.push(
      `Education level ${job.requiredEducationLevel} required, you have ${life.educationLevel}`
    );
  }

  if (life.intelligence < job.requiredIntelligence) {
    missing.push(
      `Intelligence ${job.requiredIntelligence} required, you have ${life.intelligence}`
    );
  }

  if (life.charisma < job.requiredCharisma) {
    missing.push(
      `Charisma ${job.requiredCharisma} required, you have ${life.charisma}`
    );
  }

  if (life.discipline < job.requiredDiscipline) {
    missing.push(
      `Discipline ${job.requiredDiscipline} required, you have ${life.discipline}`
    );
  }

  if (life.reputation < job.requiredReputation) {
    missing.push(
      `Reputation ${job.requiredReputation} required, you have ${life.reputation}`
    );
  }

  return missing;
}

function formatRequirementLabel(value: string) {
  if (value === "realEstate") return "Real Estate";
  if (value === "content") return "Content Creation";

  return value.charAt(0).toUpperCase() + value.slice(1);
}