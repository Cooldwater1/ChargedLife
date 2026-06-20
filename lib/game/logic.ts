import { ACTIONS_PER_YEAR, jobs } from "./data";
import type {
  AssetCondition,
  DegreeProgram,
  EconomyBreakdown,
  HousingOption,
  Job,
  LifeChoiceEvent,
  LifeEventEffect,
  LifeGrowthAction,
  LifeStats,
  OwnedAsset,
  RentPriceLevel,
  RentalEventType,
  SelfImprovementAction,
  TenantQuality,
} from "./types";
import {
  addLog,
  addYearNote,
  calculateNetWorth,
  clamp,
  formatMoney,
  getDegreeName,
  getDegreePaid,
  getDegreeProgress,
  randomBetween,
} from "./utils";
import { getJobMissingRequirements } from "./requirements";

export const housingOptions: HousingOption[] = [
  {
    id: "studio-apartment",
    name: "Studio Apartment",
    yearlyCost: 6000,
    happinessBonus: 3,
    reputationBonus: 0,
    description: "Cheap starter housing. Adds yearly rent.",
  },
  {
    id: "small-rental-house",
    name: "Small Rental House",
    yearlyCost: 16000,
    happinessBonus: 7,
    reputationBonus: 2,
    description: "More comfortable, but much more expensive.",
  },
  {
    id: "nice-rental-house",
    name: "Nice Rental House",
    yearlyCost: 32000,
    happinessBonus: 12,
    reputationBonus: 5,
    description: "A good lifestyle choice if you have stable income.",
  },
];

export const carShop: OwnedAsset[] = [
  createMarketAsset("cheap-used-car", "Cheap Used Car", "car", 3500, 400, 2, 0, "Good"),
  createMarketAsset("reliable-car", "Reliable Car", "car", 15000, 900, 4, 1, "Good"),
  createMarketAsset("sports-car", "Sports Car", "car", 65000, 3500, 8, 6, "Excellent"),
  createMarketAsset("luxury-car", "Luxury Car", "car", 140000, 7000, 10, 10, "Excellent"),
];

export const homeShop: OwnedAsset[] = [
  createMarketAsset("small-apartment", "Small Apartment", "home", 60000, 2500, 5, 1, "Good", 2400),
  createMarketAsset("starter-house", "Starter House", "home", 180000, 6500, 8, 4, "Good", 9000),
  createMarketAsset("family-house", "Family House", "home", 420000, 14000, 12, 8, "Excellent", 21000),
  createMarketAsset("luxury-mansion", "Luxury Mansion", "home", 1200000, 45000, 18, 18, "Excellent", 60000),
];

function createMarketAsset(
  id: string,
  name: string,
  type: "car" | "home",
  value: number,
  upkeep: number,
  happinessBonus: number,
  reputationBonus: number,
  condition: AssetCondition,
  rentIncome = 0
): OwnedAsset {
  return {
    id,
    name,
    type,
    value,
    upkeep,
    happinessBonus,
    reputationBonus,
    condition,
    rentedOut: false,
    rentalStatus: "Vacant",
    rentPriceLevel: "Market",
    rentIncome,
    tenantName: "",
    tenantQuality: undefined,
    tenantYearsRemaining: 0,
    lastRentalEvent: "none",
    lastRentalEventMessage: "",
    propertyManager: {
      enabled: false,
      feePercent: 0,
    },
    lastServicedAge: 18,
  };
}

function recalc(life: LifeStats): LifeStats {
  return {
    ...life,
    netWorth:
      life.cash + getAssetValue(life) + life.businessValue - Math.max(0, life.debt),
  };
}

function consumeAction(life: LifeStats): LifeStats {
  return recalc({
    ...life,
    actionsLeft: Math.max(0, life.actionsLeft - 1),
  });
}

function noActions(life: LifeStats): LifeStats | null {
  if (life.actionsLeft > 0) return null;

  return {
    ...life,
    popupMessage: `You have already used ${ACTIONS_PER_YEAR}/${ACTIONS_PER_YEAR} actions this year. End the year to continue.`,
    yearNotes: addYearNote(
      life,
      `You have already used ${ACTIONS_PER_YEAR}/${ACTIONS_PER_YEAR} actions this year. End the year to continue.`
    ),
  };
}

export function getActionsUsed(life: LifeStats) {
  return ACTIONS_PER_YEAR - life.actionsLeft;
}

export function getJobById(jobId: string) {
  return jobs.find((job) => job.id === jobId) || null;
}

export function getJobName(jobId: string) {
  if (jobId === "unemployed") return "Unemployed";
  return getJobById(jobId)?.title || jobId;
}

export function getCurrentJob(life: LifeStats) {
  return getJobById(life.jobId);
}

export function getCurrentJobExperience(life: LifeStats) {
  if (life.jobId === "unemployed") return 0;
  return life.jobExperience[life.jobId] || 0;
}

export function dismissPopup(life: LifeStats) {
  return {
    ...life,
    popupMessage: null,
  };
}

export function getConditionMultiplier(condition: AssetCondition) {
  if (condition === "Excellent") return 1;
  if (condition === "Good") return 0.9;
  if (condition === "Fair") return 0.75;
  if (condition === "Poor") return 0.55;
  return 0.35;
}

function degradeCondition(condition: AssetCondition): AssetCondition {
  if (condition === "Excellent") return "Good";
  if (condition === "Good") return "Fair";
  if (condition === "Fair") return "Poor";
  return "Bad";
}

function improveCondition(condition: AssetCondition): AssetCondition {
  if (condition === "Bad") return "Fair";
  if (condition === "Poor") return "Good";
  if (condition === "Fair") return "Excellent";
  if (condition === "Good") return "Excellent";
  return "Excellent";
}

function getRentMultiplier(level: RentPriceLevel) {
  if (level === "Low") return 0.8;
  if (level === "High") return 1.25;
  return 1;
}

export function getAdjustedRentIncome(home: OwnedAsset) {
  if (home.type !== "home") return 0;

  return Math.max(
    0,
    Math.floor(
      (home.rentIncome || 0) *
        getConditionMultiplier(home.condition || "Good") *
        getRentMultiplier(home.rentPriceLevel || "Market")
    )
  );
}

export function getCarValue(life: LifeStats) {
  return (life.ownedCars || []).reduce(
    (total, car) => total + Math.floor(car.value * getConditionMultiplier(car.condition)),
    0
  );
}

export function getHomeValue(life: LifeStats) {
  return (life.ownedHomes || []).reduce(
    (total, home) => total + Math.floor(home.value * getConditionMultiplier(home.condition)),
    0
  );
}

export function getAssetValue(life: LifeStats) {
  return getCarValue(life) + getHomeValue(life);
}

export function getAssetUpkeep(life: LifeStats) {
  return [...(life.ownedCars || []), ...(life.ownedHomes || [])].reduce(
    (total, asset) => total + asset.upkeep,
    0
  );
}

export function getHousingCost(life: LifeStats) {
  return life.currentHousing?.yearlyCost || 0;
}

export function getDebtInterest(life: LifeStats) {
  return life.debt > 0 ? Math.floor(life.debt * 0.06) : 0;
}

export function getWorkPayPerClick(life: LifeStats) {
  if (life.jobId !== "unemployed" && life.salary > 0) return life.salary;
  if (life.partTimeJobId && life.partTimeJobId !== "none" && life.partTimeSalary > 0) {
    return life.partTimeSalary;
  }
  return 2500;
}

function isStudying(life: LifeStats) {
  if (!life.activeDegreeId || life.activeDegreeId === "None") return false;
  if (life.completedDegrees.includes(life.activeDegreeId)) return false;
  return getDegreeProgress(life, life.activeDegreeId) < 100;
}

export function getBusinessIncomeEstimate(life: LifeStats) {
  return life.business === "None" ? 0 : Math.floor(life.businessRevenue * 0.22);
}

export function getPropertyManagerFees(life: LifeStats) {
  return (life.ownedHomes || []).reduce((total, home) => {
    if (!home.rentedOut || home.rentalStatus !== "Occupied") return total;
    if (!home.propertyManager?.enabled) return total;

    return total + Math.floor(getAdjustedRentIncome(home) * ((home.propertyManager.feePercent || 10) / 100));
  }, 0);
}

export function getRentalIncomeEstimate(life: LifeStats) {
  return (life.ownedHomes || []).reduce((total, home) => {
    if (!home.rentedOut || home.rentalStatus !== "Occupied") return total;

    const rent = getAdjustedRentIncome(home);
    const fee = home.propertyManager?.enabled
      ? Math.floor(rent * ((home.propertyManager.feePercent || 10) / 100))
      : 0;

    return total + Math.max(0, rent - fee);
  }, 0);
}

export function getEconomyBreakdown(life: LifeStats): EconomyBreakdown {
  const workPayPerClick = getWorkPayPerClick(life);
  const possibleWorkIncomePerYear = life.hasWorkedThisYear ? 0 : workPayPerClick;

  const businessIncomeEstimate = getBusinessIncomeEstimate(life);
  const rentalIncomeEstimate = getRentalIncomeEstimate(life);
  const totalPassiveIncome = businessIncomeEstimate + rentalIncomeEstimate;

  const housingCost = getHousingCost(life);
  const assetUpkeep = getAssetUpkeep(life);
  const debtInterest = getDebtInterest(life);
  const propertyManagerFees = getPropertyManagerFees(life);
  const totalExpenses = housingCost + assetUpkeep + debtInterest + propertyManagerFees;

  const totalCarValue = getCarValue(life);
  const totalHomeValue = getHomeValue(life);
  const totalAssets = totalCarValue + totalHomeValue + life.businessValue;

  const occupiedRentals = (life.ownedHomes || []).filter(
    (home) => home.rentedOut && home.rentalStatus === "Occupied"
  ).length;

  const vacantRentals = (life.ownedHomes || []).filter(
    (home) => home.rentedOut && home.rentalStatus !== "Occupied"
  ).length;

  return {
    workPayPerClick,
    possibleWorkIncomePerYear,
    businessIncomeEstimate,
    rentalIncomeEstimate,
    totalPassiveIncome,
    housingCost,
    assetUpkeep,
    debtInterest,
    propertyManagerFees,
    totalExpenses,
    totalAssets,
    totalCarValue,
    totalHomeValue,
    netPassiveYear: totalPassiveIncome - totalExpenses,
    occupiedRentals,
    vacantRentals,
  };
}

export function canApplyForJob(life: LifeStats, job: Job) {
  const hasDegree = job.requiredDegree
    ? life.completedDegrees.includes(job.requiredDegree)
    : true;

  const hasJobExperience = job.requiredJobId
    ? (life.jobExperience[job.requiredJobId] || 0) >=
      (job.requiredJobExperience || 1)
    : true;

  return (
    hasDegree &&
    hasJobExperience &&
    life.skills[job.track] >= job.requiredSkill &&
    life.educationLevel >= job.requiredEducationLevel &&
    life.intelligence >= job.requiredIntelligence &&
    life.charisma >= job.requiredCharisma &&
    life.discipline >= job.requiredDiscipline &&
    life.reputation >= job.requiredReputation
  );
}

function addMilestone(life: LifeStats, milestone: string) {
  if ((life.lifetimeMilestones || []).includes(milestone)) {
    return life.lifetimeMilestones || [];
  }

  return [milestone, ...(life.lifetimeMilestones || [])].slice(0, 50);
}

function signed(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

export function formatEventEffect(effect: LifeEventEffect) {
  const changes: string[] = [];

  if (effect.healthGain) changes.push(`Health ${signed(effect.healthGain)}`);
  if (effect.happinessGain) changes.push(`Happiness ${signed(effect.happinessGain)}`);
  if (effect.intelligenceGain) changes.push(`Intelligence ${signed(effect.intelligenceGain)}`);
  if (effect.charismaGain) changes.push(`Charisma ${signed(effect.charismaGain)}`);
  if (effect.disciplineGain) changes.push(`Discipline ${signed(effect.disciplineGain)}`);
  if (effect.reputationGain) changes.push(`Reputation ${signed(effect.reputationGain)}`);
  if (effect.stressGain) changes.push(`Stress Control ${signed(effect.stressGain)}`);
  if (effect.luckGain) changes.push(`Luck ${signed(effect.luckGain)}`);
  if (effect.careerXpGain) changes.push(`Career XP ${signed(effect.careerXpGain)}`);
  if (effect.businessValueGain) changes.push(`Business Value ${signed(effect.businessValueGain)}`);
  if (effect.familyRelationshipGain) changes.push(`Family ${signed(effect.familyRelationshipGain)}`);
  if (effect.friendshipsGain) changes.push(`Friendships ${signed(effect.friendshipsGain)}`);
  if (effect.relationshipQualityGain) changes.push(`Relationship ${signed(effect.relationshipQualityGain)}`);
  if (effect.childrenGain) changes.push(`Children ${signed(effect.childrenGain)}`);

  if (effect.cashGain) {
    changes.push(
      effect.cashGain > 0
        ? `Cash +${formatMoney(effect.cashGain)}`
        : `Cash -${formatMoney(Math.abs(effect.cashGain))}`
    );
  }

  if (effect.debtGain) {
    changes.push(
      effect.debtGain > 0
        ? `Debt +${formatMoney(effect.debtGain)}`
        : `Debt -${formatMoney(Math.abs(effect.debtGain))}`
    );
  }

  if (effect.jobLoss) changes.push("Lose current job");
  if (effect.breakup) changes.push("Relationship ends");

  return changes.length > 0 ? changes.join(", ") : "No clear effect.";
}

function applyEventEffect(life: LifeStats, effect: LifeEventEffect): LifeStats {
  let updated: LifeStats = {
    ...life,
    health: clamp(life.health + (effect.healthGain || 0)),
    happiness: clamp(life.happiness + (effect.happinessGain || 0)),
    intelligence: clamp(life.intelligence + (effect.intelligenceGain || 0)),
    charisma: clamp(life.charisma + (effect.charismaGain || 0)),
    discipline: clamp(life.discipline + (effect.disciplineGain || 0)),
    reputation: clamp(life.reputation + (effect.reputationGain || 0)),
    stress: clamp((life.stress ?? 65) + (effect.stressGain || 0)),
    luck: clamp(life.luck + (effect.luckGain || 0)),
    familyRelationship: clamp(life.familyRelationship + (effect.familyRelationshipGain || 0)),
    friendships: clamp(life.friendships + (effect.friendshipsGain || 0)),
    relationshipQuality: clamp(life.relationshipQuality + (effect.relationshipQualityGain || 0)),
    children: Math.max(0, life.children + (effect.childrenGain || 0)),
    cash: life.cash + (effect.cashGain || 0),
    debt: Math.max(0, life.debt + (effect.debtGain || 0)),
    careerXp: Math.max(0, life.careerXp + (effect.careerXpGain || 0)),
    businessValue: Math.max(0, life.businessValue + (effect.businessValueGain || 0)),
  };

  if (effect.businessName) {
    updated = {
      ...updated,
      business: effect.businessName,
      businessStage: Math.max(1, updated.businessStage),
      businessesStarted:
        life.business === "None" ? life.businessesStarted + 1 : life.businessesStarted,
    };
  }

  if (effect.businessValueSet !== undefined) {
    updated = {
      ...updated,
      businessValue: Math.max(0, effect.businessValueSet),
    };
  }

  if (effect.jobLoss) {
    updated = {
      ...updated,
      jobId: "unemployed",
      job: "Unemployed",
      jobTrack: "none",
      salary: 0,
      careerXp: 0,
    };
  }

  if (effect.breakup) {
    updated = {
      ...updated,
      relationshipStatus: "Single",
      partnerName: "",
      relationshipQuality: 0,
      relationshipStartedAge: null,
    };
  }

  return recalc(updated);
}

export function acceptLifeEvent(life: LifeStats) {
  const event = life.pendingLifeEvent;
  if (!event) return life;

  if (event.type === "promotion") {
    return chasePromotion({
      ...life,
      pendingLifeEvent: null,
    });
  }

  const affected = applyEventEffect(life, event.acceptEffect);
  const message = `${event.title}: You chose "${event.acceptLabel}". ${formatEventEffect(event.acceptEffect)}.`;

  return recalc({
    ...affected,
    pendingLifeEvent: null,
    popupMessage: message,
    yearNotes: addYearNote(affected, message),
    eventLog: addLog(affected, `Choice Event: ${message}`),
  });
}

export function declineLifeEvent(life: LifeStats) {
  const event = life.pendingLifeEvent;
  if (!event) return life;

  const affected = applyEventEffect(life, event.declineEffect);
  const message = `${event.title}: You chose "${event.declineLabel}". ${formatEventEffect(event.declineEffect)}.`;

  return recalc({
    ...affected,
    pendingLifeEvent: null,
    popupMessage: message,
    yearNotes: addYearNote(affected, message),
    eventLog: addLog(affected, `Choice Event: ${message}`),
  });
}

export function applyStudentLoan(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.studentLoanStatus === "approved") {
    return {
      ...life,
      popupMessage: `You already have an approved student loan limit of ${formatMoney(life.studentLoanLimit)}.`,
      yearNotes: addYearNote(life, "You already have an approved student loan."),
    };
  }

  const approvalChance =
    60 +
    Math.floor(life.intelligence / 10) +
    Math.floor(life.reputation / 12) -
    Math.floor(life.debt / 50000);

  if (randomBetween(1, 100) > approvalChance) {
    return consumeAction({
      ...life,
      studentLoanStatus: "denied",
      popupMessage:
        "Your student loan application was denied. You must pay school costs with cash for now.",
      yearNotes: addYearNote(life, "Your student loan application was denied."),
    });
  }

  const limit =
    50000 +
    life.educationLevel * 25000 +
    Math.floor(life.intelligence * 600) +
    Math.floor(life.reputation * 400);

  return consumeAction({
    ...life,
    studentLoanStatus: "approved",
    studentLoanLimit: limit,
    popupMessage: `Student loan approved. Limit: ${formatMoney(limit)}.`,
    yearNotes: addYearNote(life, `Student loan approved. Limit: ${formatMoney(limit)}.`),
  });
}

function paySchoolCost(life: LifeStats, cost: number) {
  const cashPayment = Math.min(Math.max(0, life.cash), cost);
  const remaining = cost - cashPayment;

  if (remaining <= 0) {
    return {
      ok: true,
      cash: life.cash - cashPayment,
      debt: life.debt,
      studentLoanUsed: life.studentLoanUsed,
      cashPayment,
      loanUsed: 0,
      message: "",
    };
  }

  if (life.studentLoanStatus !== "approved") {
    return {
      ok: false,
      cash: life.cash,
      debt: life.debt,
      studentLoanUsed: life.studentLoanUsed,
      cashPayment: 0,
      loanUsed: 0,
      message:
        "You cannot afford school and do not have an approved student loan.",
    };
  }

  const remainingLoan = Math.max(0, life.studentLoanLimit - life.studentLoanUsed);

  if (remaining > remainingLoan) {
    return {
      ok: false,
      cash: life.cash,
      debt: life.debt,
      studentLoanUsed: life.studentLoanUsed,
      cashPayment: 0,
      loanUsed: 0,
      message:
        "Your approved student loan is not large enough to cover this school payment.",
    };
  }

  return {
    ok: true,
    cash: life.cash - cashPayment,
    debt: life.debt + remaining,
    studentLoanUsed: life.studentLoanUsed + remaining,
    cashPayment,
    loanUsed: remaining,
    message: "",
  };
}

export function attendDegree(life: LifeStats, degree: DegreeProgram) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.jobId !== "unemployed") {
    return {
      ...life,
      popupMessage: "You cannot study while working a full-time job. Part-time jobs are allowed, but full-time work is too much.",
      yearNotes: addYearNote(life, "Full-time work blocked your study plans."),
    };
  }

  if (life.completedDegrees.includes(degree.id)) {
    return {
      ...life,
      popupMessage: `You already completed ${degree.name}.`,
      yearNotes: addYearNote(life, `You already completed ${degree.name}.`),
    };
  }

  if (degree.requiredDegree && !life.completedDegrees.includes(degree.requiredDegree)) {
    return {
      ...life,
      popupMessage: `${degree.name} is locked. Complete ${getDegreeName(degree.requiredDegree)} first.`,
      yearNotes: addYearNote(life, `${degree.name} is locked.`),
    };
  }

  if (life.happiness < 10 || life.health < 10) {
    return {
      ...life,
      popupMessage: "Your health or happiness is too low to study right now.",
      yearNotes: addYearNote(life, "Your health or happiness is too low to study right now."),
    };
  }

  const oldProgress = getDegreeProgress(life, degree.id);
  const oldPaid = getDegreePaid(life, degree.id);

  const newProgress = Math.min(100, oldProgress + degree.progressGain);
  const targetPaid = Math.floor((degree.totalCost * newProgress) / 100);
  const cost = Math.max(0, targetPaid - oldPaid);

  const payment = paySchoolCost(life, cost);

  if (!payment.ok) {
    return {
      ...life,
      popupMessage: payment.message,
      yearNotes: addYearNote(life, payment.message),
    };
  }

  const completedNow = newProgress >= 100;

  let updated: LifeStats = {
    ...life,
    cash: payment.cash,
    debt: payment.debt,
    studentLoanUsed: payment.studentLoanUsed,
    activeDegreeId: degree.id,
    degreeProgress: {
      ...life.degreeProgress,
      [degree.id]: newProgress,
    },
    degreePaid: {
      ...life.degreePaid,
      [degree.id]: targetPaid,
    },
    happiness: clamp(life.happiness - degree.happinessCost),
    stress: clamp((life.stress ?? 65) - randomBetween(4, 9)),
    intelligence: clamp(life.intelligence + degree.intelligenceGain),
    charisma: clamp(life.charisma + degree.charismaGain),
    discipline: clamp(life.discipline + degree.disciplineGain),
    reputation: clamp(life.reputation + degree.reputationGain),
    yearsStudied: life.yearsStudied + 1,
  };

  if (completedNow) {
    updated = {
      ...updated,
      education: degree.educationName,
      educationLevel: Math.max(updated.educationLevel, degree.educationLevelReward),
      completedDegrees: [...updated.completedDegrees, degree.id],
      skills: {
        ...updated.skills,
        [degree.skillReward]: Math.max(
          updated.skills[degree.skillReward],
          degree.skillGainOnComplete
        ),
      },
      lifetimeMilestones: addMilestone(updated, `Completed ${degree.name}`),
      popupMessage: `You completed ${degree.name}.`,
      yearNotes: addYearNote(updated, `You completed ${degree.name}.`),
    };
  } else {
    updated = {
      ...updated,
      yearNotes: addYearNote(
        updated,
        `You studied ${degree.name}. Progress: ${newProgress}/100.`
      ),
    };
  }

  return consumeAction(updated);
}

export function doLifeGrowth(life: LifeStats, action: LifeGrowthAction) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  return consumeAction({
    ...life,
    cash: life.cash - action.cashCost,
    health: clamp(life.health + action.healthGain),
    happiness: clamp(life.happiness + action.happinessGain),
    intelligence: clamp(life.intelligence + action.intelligenceGain),
    charisma: clamp(life.charisma + action.charismaGain),
    discipline: clamp(life.discipline + action.disciplineGain),
    reputation: clamp(life.reputation + action.reputationGain),
    stress: clamp((life.stress ?? 65) + (action.category === "mental" ? 12 : action.category === "health" ? 7 : action.category === "social" ? 4 : 3)),
    yearNotes: addYearNote(life, `${action.name}: ${action.description}`),
  });
}

export function doSelfImprovement(life: LifeStats, action: SelfImprovementAction) {
  return doLifeGrowth(life, action);
}

export function applyForJob(life: LifeStats, job: Job) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const employmentType = job.employmentType || "fullTime";

  if (employmentType === "fullTime" && isStudying(life)) {
    return {
      ...life,
      popupMessage: "You cannot take a full-time job while studying. Apply for a part-time job instead, or finish school first.",
      yearNotes: addYearNote(life, "Full-time job blocked because you are currently studying."),
    };
  }

  if (employmentType === "partTime" && life.jobId !== "unemployed") {
    return {
      ...life,
      popupMessage: "You already have a full-time job. Quit or avoid full-time work if you want a part-time job beside school.",
      yearNotes: addYearNote(life, "Part-time job blocked because you already have full-time work."),
    };
  }

  if (!canApplyForJob(life, job)) {
    const missing = getJobMissingRequirements(life, job, getDegreeName, getJobName);

    return consumeAction({
      ...life,
      happiness: clamp(life.happiness - randomBetween(1, 4)),
      popupMessage: `Application denied. Missing: ${missing[0] || "requirements"}.`,
      yearNotes: addYearNote(life, `Application denied for ${job.title}.`),
    });
  }

  if (employmentType === "partTime") {
    return consumeAction({
      ...life,
      partTimeJobId: job.id,
      partTimeJob: job.title,
      partTimeSalary: job.salary,
      happiness: clamp(life.happiness + randomBetween(1, 4)),
      reputation: clamp(life.reputation + randomBetween(1, 3)),
      stress: clamp((life.stress ?? 65) - randomBetween(1, 4)),
      lifetimeMilestones: addMilestone(life, `Hired part-time as ${job.title}`),
      popupMessage: `You got a part-time job as ${job.title}. Yearly pay: ${formatMoney(job.salary)}.`,
      yearNotes: addYearNote(life, `You got a part-time job as ${job.title}.`),
    });
  }

  return consumeAction({
    ...life,
    jobId: job.id,
    job: job.title,
    jobTrack: job.track,
    salary: job.salary,
    careerLevel: Math.max(life.careerLevel + 1, job.requiredSkill),
    careerXp: 0,
    partTimeJobId: "none",
    partTimeJob: "None",
    partTimeSalary: 0,
    happiness: clamp(life.happiness + randomBetween(2, 6)),
    reputation: clamp(life.reputation + randomBetween(2, 5)),
    stress: clamp((life.stress ?? 65) - randomBetween(3, 7)),
    lifetimeMilestones: addMilestone(life, `Hired as ${job.title}`),
    popupMessage: `You got hired as ${job.title}. Salary: ${formatMoney(job.salary)}/year.`,
    yearNotes: addYearNote(life, `You got hired as ${job.title}.`),
  });
}

export function work(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.hasWorkedThisYear) {
    return {
      ...life,
      popupMessage: "You already worked this year. Press End Year before working again.",
      yearNotes: addYearNote(life, "You already worked this year."),
    };
  }

  const income = getWorkPayPerClick(life);
  const hasFullTimeJob = life.jobId !== "unemployed";
  const hasPartTimeJob = !!life.partTimeJobId && life.partTimeJobId !== "none";
  const workLabel = hasFullTimeJob
    ? life.job
    : hasPartTimeJob
      ? life.partTimeJob
      : "odd jobs";

  const jobExperience =
    hasFullTimeJob
      ? {
          ...life.jobExperience,
          [life.jobId]: (life.jobExperience[life.jobId] || 0) + 1,
        }
      : hasPartTimeJob
        ? {
            ...life.jobExperience,
            [life.partTimeJobId]: (life.jobExperience[life.partTimeJobId] || 0) + 1,
          }
        : life.jobExperience;

  return consumeAction({
    ...life,
    cash: life.cash + income,
    hasWorkedThisYear: true,
    happiness: clamp(life.happiness - (hasFullTimeJob ? randomBetween(2, 5) : randomBetween(1, 3))),
    stress: clamp((life.stress ?? 65) - (hasFullTimeJob ? randomBetween(8, 14) : randomBetween(4, 8))),
    discipline: clamp(life.discipline + randomBetween(1, 3)),
    careerXp: life.careerXp + (hasFullTimeJob ? randomBetween(22, 35) : randomBetween(8, 16)),
    jobExperience,
    yearsWorked: life.yearsWorked + 1,
    yearNotes: addYearNote(life, `You worked ${workLabel} and earned ${formatMoney(income)}.`),
  });
}

export function quickRecoverStress(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const cost = Math.min(Math.max(0, life.cash), 300);

  return consumeAction({
    ...life,
    cash: life.cash - cost,
    stress: clamp((life.stress ?? 65) + randomBetween(18, 28)),
    happiness: clamp(life.happiness + randomBetween(2, 5)),
    health: clamp(life.health + randomBetween(1, 3)),
    popupMessage: `You took time to reset and recover. Stress control improved. Cost: ${formatMoney(cost)}.`,
    yearNotes: addYearNote(life, "You took time to reset and recover."),
  });
}

export function chasePromotion(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const currentJob = getCurrentJob(life);

  if (!currentJob || life.jobId === "unemployed") {
    return {
      ...life,
      popupMessage: "You need a job before asking for a promotion.",
      yearNotes: addYearNote(life, "You need a job before asking for a promotion."),
    };
  }

  if (life.hasAskedPromotionThisYear) {
    return {
      ...life,
      popupMessage: "You already asked for a promotion this year.",
      yearNotes: addYearNote(life, "You already asked for a promotion this year."),
    };
  }

  if (!currentJob.nextJobId) {
    return consumeAction({
      ...life,
      hasAskedPromotionThisYear: true,
      popupMessage: "There is no higher role in this career path yet.",
      yearNotes: addYearNote(life, "There is no higher role in this career path yet."),
    });
  }

  const nextJob = getJobById(currentJob.nextJobId);

  if (!nextJob || !canApplyForJob(life, nextJob)) {
    return consumeAction({
      ...life,
      hasAskedPromotionThisYear: true,
      careerXp: life.careerXp + 10,
      happiness: clamp(life.happiness - 2),
      popupMessage: "Your boss denied the promotion. You are not ready yet.",
      yearNotes: addYearNote(life, "Your boss denied the promotion."),
    });
  }

  const chance =
    25 +
    Math.floor(life.discipline / 12) +
    Math.floor(life.reputation / 14) +
    Math.floor(life.careerXp / 14);

  if (randomBetween(1, 100) > chance) {
    return consumeAction({
      ...life,
      hasAskedPromotionThisYear: true,
      careerXp: life.careerXp + 15,
      happiness: clamp(life.happiness - 2),
      popupMessage: "Your boss denied the promotion this time.",
      yearNotes: addYearNote(life, "Your boss denied the promotion this time."),
    });
  }

  return consumeAction({
    ...life,
    hasAskedPromotionThisYear: true,
    jobId: nextJob.id,
    job: nextJob.title,
    jobTrack: nextJob.track,
    salary: nextJob.salary,
    careerLevel: Math.max(life.careerLevel + 1, nextJob.requiredSkill),
    careerXp: 0,
    reputation: clamp(life.reputation + 5),
    happiness: clamp(life.happiness + 4),
    lifetimeMilestones: addMilestone(life, `Promoted to ${nextJob.title}`),
    popupMessage: `Promotion success! You became ${nextJob.title}.`,
    yearNotes: addYearNote(life, `Promotion success! You became ${nextJob.title}.`),
  });
}

export function improveFamily(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  return consumeAction({
    ...life,
    familyRelationship: clamp(life.familyRelationship + randomBetween(6, 12)),
    stress: clamp((life.stress ?? 65) + randomBetween(3, 7)),
    happiness: clamp(life.happiness + randomBetween(3, 8)),
    cash: life.cash - 250,
    yearNotes: addYearNote(life, "You spent quality time with family."),
  });
}

export function makeFriends(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const friendNames = ["Alex", "Taylor", "Jordan", "Morgan", "Casey", "Robin", "Sam", "Jamie", "Avery", "Riley"];
  const friendsList = [...(life.friendsList || [])];
  if (friendsList.length < 12 && randomBetween(1, 100) <= 55) {
    const possible = friendNames.filter((name) => !friendsList.includes(name));
    if (possible.length > 0) friendsList.push(possible[randomBetween(0, possible.length - 1)]);
  }

  return consumeAction({
    ...life,
    friendships: clamp(life.friendships + randomBetween(5, 10)),
    socialCircle: Math.min(100, life.socialCircle + randomBetween(1, 3)),
    friendsList,
    charisma: clamp(life.charisma + randomBetween(1, 3)),
    happiness: clamp(life.happiness + randomBetween(2, 6)),
    stress: clamp((life.stress ?? 65) + randomBetween(2, 5)),
    cash: life.cash - 350,
    yearNotes: addYearNote(life, "You spent time making friends."),
  });
}

export function dateLife(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.relationshipStatus === "Single") {
    const chance = 25 + Math.floor(life.charisma / 4) + Math.floor(life.happiness / 8);

    if (randomBetween(1, 100) > chance) {
      return consumeAction({
        ...life,
        cash: life.cash - 400,
        charisma: clamp(life.charisma + 1),
        happiness: clamp(life.happiness - 2),
        popupMessage: "The date did not go anywhere.",
        yearNotes: addYearNote(life, "The date did not go anywhere."),
      });
    }

    const names = ["Alex", "Taylor", "Jordan", "Morgan", "Casey", "Robin", "Sam"];

    return consumeAction({
      ...life,
      cash: life.cash - 500,
      relationshipStatus: "Dating",
      partnerName: names[randomBetween(0, names.length - 1)],
      relationshipQuality: randomBetween(35, 65),
      relationshipStartedAge: life.age,
      happiness: clamp(life.happiness + 8),
      lifetimeMilestones: addMilestone(life, "Started dating someone"),
      popupMessage: "You started dating someone.",
      yearNotes: addYearNote(life, "You started dating someone."),
    });
  }

  return consumeAction({
    ...life,
    relationshipQuality: clamp(life.relationshipQuality + randomBetween(5, 12)),
    stress: clamp((life.stress ?? 65) + randomBetween(2, 5)),
    happiness: clamp(life.happiness + randomBetween(3, 8)),
    cash: life.cash - 700,
    yearNotes: addYearNote(life, `You spent time with ${life.partnerName}.`),
  });
}

export function proposeMarriage(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.relationshipStatus !== "Dating") {
    return {
      ...life,
      popupMessage: "You need to be dating someone before proposing.",
      yearNotes: addYearNote(life, "You need to be dating someone before proposing."),
    };
  }

  const chance = 25 + Math.floor(life.relationshipQuality / 2);

  if (randomBetween(1, 100) > chance) {
    return consumeAction({
      ...life,
      cash: life.cash - 2000,
      relationshipQuality: clamp(life.relationshipQuality - 10),
      happiness: clamp(life.happiness - 5),
      popupMessage: `${life.partnerName} said no.`,
      yearNotes: addYearNote(life, `${life.partnerName} said no.`),
    });
  }

  return consumeAction({
    ...life,
    cash: life.cash - 8000,
    relationshipStatus: "Married",
    relationshipStartedAge: life.relationshipStartedAge || life.age,
    relationshipQuality: clamp(life.relationshipQuality + 15),
    happiness: clamp(life.happiness + 10),
    reputation: clamp(life.reputation + 3),
    lifetimeMilestones: addMilestone(life, "Got married"),
    popupMessage: `You married ${life.partnerName}.`,
    yearNotes: addYearNote(life, `You married ${life.partnerName}.`),
  });
}

export function haveChild(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.relationshipStatus !== "Married") {
    return {
      ...life,
      popupMessage: "You need to be married before having kids.",
      yearNotes: addYearNote(life, "You need to be married before having kids."),
    };
  }

  const cost = 5000 + life.children * 3000;

  const childNames = ["Noah", "Emma", "Liam", "Olivia", "Leo", "Mia", "Lucas", "Sofia", "Elias", "Nora"];
  const childName = childNames[randomBetween(0, childNames.length - 1)];

  return consumeAction({
    ...life,
    cash: life.cash - cost,
    children: life.children + 1,
    childrenNames: [...(life.childrenNames || []), childName],
    happiness: clamp(life.happiness + 8),
    relationshipQuality: clamp(life.relationshipQuality + 5),
    lifetimeMilestones: addMilestone(life, `Had child #${life.children + 1}`),
    popupMessage: `You had a child named ${childName}.`,
    yearNotes: addYearNote(life, `You had a child named ${childName}. Cost: ${formatMoney(cost)}.`),
  });
}

export function rentHousing(life: LifeStats, option: HousingOption) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  return consumeAction({
    ...life,
    currentHousing: {
      type: "rent",
      name: option.name,
      yearlyCost: option.yearlyCost,
    },
    happiness: clamp(life.happiness + option.happinessBonus),
    reputation: clamp(life.reputation + option.reputationBonus),
    popupMessage: `You rented ${option.name}.`,
    yearNotes: addYearNote(life, `You rented ${option.name}.`),
  });
}

export function moveOut(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  return consumeAction({
    ...life,
    currentHousing: {
      type: "none",
      name: "No housing selected",
      yearlyCost: 0,
    },
    happiness: clamp(life.happiness - 2),
    popupMessage: "You moved out. Housing cost is now $0.",
    yearNotes: addYearNote(life, "You moved out. Housing cost is now $0."),
  });
}

export function buyCar(life: LifeStats, car: OwnedAsset) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.cash < car.value) {
    return {
      ...life,
      popupMessage: `You need ${formatMoney(car.value)} to buy ${car.name}.`,
      yearNotes: addYearNote(life, `You need ${formatMoney(car.value)} to buy ${car.name}.`),
    };
  }

  const boughtCar: OwnedAsset = {
    ...car,
    id: `${car.id}-${Date.now()}-${randomBetween(1000, 9999)}`,
    lastServicedAge: life.age,
  };

  return consumeAction({
    ...life,
    cash: life.cash - car.value,
    ownedCars: [boughtCar, ...(life.ownedCars || [])],
    happiness: clamp(life.happiness + car.happinessBonus),
    reputation: clamp(life.reputation + car.reputationBonus),
    lifetimeMilestones: addMilestone(life, `Bought ${car.name}`),
    popupMessage: `You bought ${car.name}.`,
    yearNotes: addYearNote(life, `You bought ${car.name}.`),
  });
}

export function buyHome(life: LifeStats, home: OwnedAsset) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.cash < home.value) {
    return {
      ...life,
      popupMessage: `You need ${formatMoney(home.value)} to buy ${home.name}.`,
      yearNotes: addYearNote(life, `You need ${formatMoney(home.value)} to buy ${home.name}.`),
    };
  }

  const boughtHome: OwnedAsset = {
    ...home,
    id: `${home.id}-${Date.now()}-${randomBetween(1000, 9999)}`,
    rentedOut: false,
    rentalStatus: "Vacant",
    rentPriceLevel: "Market",
    tenantName: "",
    tenantQuality: undefined,
    tenantYearsRemaining: 0,
    lastRentalEvent: "none",
    lastRentalEventMessage: "",
    propertyManager: {
      enabled: false,
      feePercent: 0,
    },
    lastServicedAge: life.age,
  };

  return consumeAction({
    ...life,
    cash: life.cash - home.value,
    ownedHomes: [boughtHome, ...(life.ownedHomes || [])],
    currentHousing:
      life.currentHousing.type === "none"
        ? {
            type: "own",
            name: boughtHome.name,
            yearlyCost: 0,
            homeAssetId: boughtHome.id,
          }
        : life.currentHousing,
    happiness: clamp(life.happiness + home.happinessBonus),
    reputation: clamp(life.reputation + home.reputationBonus),
    lifetimeMilestones: addMilestone(life, `Bought ${home.name}`),
    popupMessage: `You bought ${home.name}.`,
    yearNotes: addYearNote(life, `You bought ${home.name}.`),
  });
}

export function liveInHome(life: LifeStats, homeId: string) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const home = life.ownedHomes.find((asset) => asset.id === homeId);

  if (!home) {
    return {
      ...life,
      popupMessage: "That home could not be found.",
      yearNotes: addYearNote(life, "That home could not be found."),
    };
  }

  if (home.rentedOut && home.rentalStatus === "Occupied") {
    return {
      ...life,
      popupMessage: "You cannot live in a home with a tenant.",
      yearNotes: addYearNote(life, "You cannot live in a home with a tenant."),
    };
  }

  const ownedHomes = life.ownedHomes.map((asset) =>
    asset.id === homeId
      ? {
          ...asset,
          rentedOut: false,
          rentalStatus: "Vacant" as const,
          tenantName: "",
          tenantQuality: undefined,
          tenantYearsRemaining: 0,
        }
      : asset
  );

  return consumeAction({
    ...life,
    ownedHomes,
    currentHousing: {
      type: "own",
      name: home.name,
      yearlyCost: 0,
      homeAssetId: home.id,
    },
    popupMessage: `You moved into ${home.name}.`,
    yearNotes: addYearNote(life, `You moved into ${home.name}.`),
  });
}

export function rentOutHome(life: LifeStats, homeId: string) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const home = life.ownedHomes.find((asset) => asset.id === homeId);

  if (!home) {
    return {
      ...life,
      popupMessage: "That home could not be found.",
      yearNotes: addYearNote(life, "That home could not be found."),
    };
  }

  if (life.currentHousing.homeAssetId === home.id) {
    return {
      ...life,
      popupMessage: "You cannot rent out the home you are currently living in.",
      yearNotes: addYearNote(life, "You cannot rent out the home you are currently living in."),
    };
  }

  const ownedHomes = life.ownedHomes.map((asset) =>
    asset.id === homeId
      ? {
          ...asset,
          rentedOut: true,
          rentalStatus: asset.rentalStatus || ("Vacant" as const),
          rentPriceLevel: asset.rentPriceLevel || ("Market" as const),
          lastRentalEvent: "none" as const,
          lastRentalEventMessage:
            "Property listed for rent. Find a tenant to start earning rent.",
        }
      : asset
  );

  return consumeAction({
    ...life,
    ownedHomes,
    popupMessage: `${home.name} is now listed for rent.`,
    yearNotes: addYearNote(life, `${home.name} is now listed for rent.`),
  });
}

export function stopRentingOutHome(life: LifeStats, homeId: string) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const ownedHomes = life.ownedHomes.map((asset) =>
    asset.id === homeId
      ? {
          ...asset,
          rentedOut: false,
          rentalStatus: "Vacant" as const,
          tenantName: "",
          tenantQuality: undefined,
          tenantYearsRemaining: 0,
          lastRentalEvent: "none" as const,
          lastRentalEventMessage: "Property removed from the rental market.",
        }
      : asset
  );

  return consumeAction({
    ...life,
    ownedHomes,
    popupMessage: "Property removed from the rental market.",
    yearNotes: addYearNote(life, "Property removed from the rental market."),
  });
}

export function setHomeRentPriceLevel(
  life: LifeStats,
  homeId: string,
  rentPriceLevel: RentPriceLevel
) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const ownedHomes = life.ownedHomes.map((home) =>
    home.id === homeId
      ? {
          ...home,
          rentPriceLevel,
        }
      : home
  );

  return consumeAction({
    ...life,
    ownedHomes,
    popupMessage: `Rent price set to ${rentPriceLevel}.`,
    yearNotes: addYearNote(life, `Rent price set to ${rentPriceLevel}.`),
  });
}

export function findTenant(life: LifeStats, homeId: string) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const home = life.ownedHomes.find((asset) => asset.id === homeId);

  if (!home) {
    return {
      ...life,
      popupMessage: "That home could not be found.",
      yearNotes: addYearNote(life, "That home could not be found."),
    };
  }

  if (!home.rentedOut) {
    return {
      ...life,
      popupMessage: "List this home for rent first.",
      yearNotes: addYearNote(life, "List this home for rent first."),
    };
  }

  if (home.rentalStatus === "Occupied") {
    return {
      ...life,
      popupMessage: "This home already has a tenant.",
      yearNotes: addYearNote(life, "This home already has a tenant."),
    };
  }

  const conditionBonus =
    home.condition === "Excellent"
      ? 18
      : home.condition === "Good"
        ? 10
        : home.condition === "Fair"
          ? 0
          : home.condition === "Poor"
            ? -16
            : -30;

  const rentBonus =
    home.rentPriceLevel === "Low"
      ? 12
      : home.rentPriceLevel === "High"
        ? -14
        : 0;

  const chance =
    55 +
    conditionBonus +
    rentBonus +
    Math.floor(life.reputation / 8) +
    life.skills.realEstate * 6;

  if (randomBetween(1, 100) > chance) {
    const ownedHomes = life.ownedHomes.map((asset) =>
      asset.id === homeId
        ? {
            ...asset,
            rentalStatus: "Vacant" as const,
            tenantName: "",
            tenantQuality: undefined,
            tenantYearsRemaining: 0,
            lastRentalEvent: "none" as const,
            lastRentalEventMessage:
              "You searched for a tenant, but the property stayed vacant.",
          }
        : asset
    );

    return consumeAction({
      ...life,
      ownedHomes,
      happiness: clamp(life.happiness - 1),
      popupMessage: `You did not find a tenant for ${home.name}.`,
      yearNotes: addYearNote(life, `You did not find a tenant for ${home.name}.`),
    });
  }

  const tenantNames = ["Alex", "Taylor", "Jordan", "Morgan", "Casey", "Robin", "Sam", "Jamie"];
  const roll = randomBetween(1, 100) + conditionBonus + Math.floor(life.reputation / 10);

  const tenantQuality: TenantQuality =
    roll >= 92
      ? "Excellent"
      : roll >= 75
        ? "Good"
        : roll >= 45
          ? "Average"
          : roll >= 22
            ? "Risky"
            : "Bad";

  const tenantName = tenantNames[randomBetween(0, tenantNames.length - 1)];
  const leaseYears = randomBetween(1, 4);
  const rent = getAdjustedRentIncome(home);

  const ownedHomes = life.ownedHomes.map((asset) =>
    asset.id === homeId
      ? {
          ...asset,
          rentalStatus: "Occupied" as const,
          tenantName,
          tenantQuality,
          tenantYearsRemaining: leaseYears,
          lastRentalEvent: "none" as const,
          lastRentalEventMessage: `${tenantName} moved in as a ${tenantQuality.toLowerCase()} tenant.`,
        }
      : asset
  );

  return consumeAction({
    ...life,
    ownedHomes,
    reputation: clamp(life.reputation + 1),
    lifetimeMilestones: addMilestone(life, "Found first tenant"),
    popupMessage: `${tenantName} moved into ${home.name}. Tenant quality: ${tenantQuality}. Estimated rent: ${formatMoney(rent)}/year.`,
    yearNotes: addYearNote(
      life,
      `You found a ${tenantQuality.toLowerCase()} tenant for ${home.name}.`
    ),
  });
}

export function enablePropertyManager(life: LifeStats, homeId: string) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const ownedHomes = life.ownedHomes.map((home) =>
    home.id === homeId
      ? {
          ...home,
          propertyManager: {
            enabled: true,
            feePercent: 10,
          },
        }
      : home
  );

  return consumeAction({
    ...life,
    ownedHomes,
    popupMessage:
      "Property manager hired. They take 10% of rent but reduce rental problems.",
    yearNotes: addYearNote(life, "Property manager hired."),
  });
}

export function disablePropertyManager(life: LifeStats, homeId: string) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const ownedHomes = life.ownedHomes.map((home) =>
    home.id === homeId
      ? {
          ...home,
          propertyManager: {
            enabled: false,
            feePercent: 0,
          },
        }
      : home
  );

  return consumeAction({
    ...life,
    ownedHomes,
    popupMessage: "Property manager removed.",
    yearNotes: addYearNote(life, "Property manager removed."),
  });
}

export function renovateHome(life: LifeStats, homeId: string) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const home = life.ownedHomes.find((asset) => asset.id === homeId);

  if (!home) {
    return {
      ...life,
      popupMessage: "That home could not be found.",
      yearNotes: addYearNote(life, "That home could not be found."),
    };
  }

  const cost =
    home.condition === "Bad"
      ? Math.floor(home.value * 0.12)
      : home.condition === "Poor"
        ? Math.floor(home.value * 0.08)
        : home.condition === "Fair"
          ? Math.floor(home.value * 0.05)
          : Math.floor(home.value * 0.03);

  if (life.cash < cost) {
    return {
      ...life,
      popupMessage: `You need ${formatMoney(cost)} to renovate ${home.name}.`,
      yearNotes: addYearNote(life, `You need ${formatMoney(cost)} to renovate ${home.name}.`),
    };
  }

  const ownedHomes = life.ownedHomes.map((asset) =>
    asset.id === homeId
      ? {
          ...asset,
          condition: improveCondition(asset.condition),
          value: Math.floor(asset.value * 1.04),
        }
      : asset
  );

  return consumeAction({
    ...life,
    cash: life.cash - cost,
    ownedHomes,
    happiness: clamp(life.happiness + 3),
    reputation: clamp(life.reputation + 1),
    popupMessage: `You renovated ${home.name}.`,
    yearNotes: addYearNote(life, `You renovated ${home.name}.`),
  });
}

export function serviceCar(life: LifeStats, carId: string) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const car = life.ownedCars.find((asset) => asset.id === carId);

  if (!car) {
    return {
      ...life,
      popupMessage: "That car could not be found.",
      yearNotes: addYearNote(life, "That car could not be found."),
    };
  }

  const cost =
    car.condition === "Bad"
      ? car.upkeep * 5
      : car.condition === "Poor"
        ? car.upkeep * 4
        : car.condition === "Fair"
          ? car.upkeep * 3
          : car.upkeep * 2;

  if (life.cash < cost) {
    return {
      ...life,
      popupMessage: `You need ${formatMoney(cost)} to service ${car.name}.`,
      yearNotes: addYearNote(life, `You need ${formatMoney(cost)} to service ${car.name}.`),
    };
  }

  const ownedCars = life.ownedCars.map((asset) =>
    asset.id === carId
      ? {
          ...asset,
          condition: improveCondition(asset.condition),
          lastServicedAge: life.age,
          value: Math.floor(asset.value * 1.02),
        }
      : asset
  );

  return consumeAction({
    ...life,
    cash: life.cash - cost,
    ownedCars,
    happiness: clamp(life.happiness + 2),
    popupMessage: `You serviced ${car.name}.`,
    yearNotes: addYearNote(life, `You serviced ${car.name}.`),
  });
}

export function sellCar(life: LifeStats, carId: string) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const car = life.ownedCars.find((asset) => asset.id === carId);

  if (!car) {
    return {
      ...life,
      popupMessage: "That car could not be found.",
      yearNotes: addYearNote(life, "That car could not be found."),
    };
  }

  const price = Math.floor(car.value * getConditionMultiplier(car.condition) * randomBetween(65, 95) * 0.01);

  return consumeAction({
    ...life,
    cash: life.cash + price,
    ownedCars: life.ownedCars.filter((asset) => asset.id !== carId),
    popupMessage: `You sold ${car.name} for ${formatMoney(price)}.`,
    yearNotes: addYearNote(life, `You sold ${car.name}.`),
  });
}

export function sellHome(life: LifeStats, homeId: string) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const home = life.ownedHomes.find((asset) => asset.id === homeId);

  if (!home) {
    return {
      ...life,
      popupMessage: "That home could not be found.",
      yearNotes: addYearNote(life, "That home could not be found."),
    };
  }

  const price = Math.floor(home.value * getConditionMultiplier(home.condition) * randomBetween(85, 120) * 0.01);

  return consumeAction({
    ...life,
    cash: life.cash + price,
    ownedHomes: life.ownedHomes.filter((asset) => asset.id !== homeId),
    currentHousing:
      life.currentHousing.homeAssetId === homeId
        ? {
            type: "none",
            name: "No housing selected",
            yearlyCost: 0,
          }
        : life.currentHousing,
    popupMessage: `You sold ${home.name} for ${formatMoney(price)}.`,
    yearNotes: addYearNote(life, `You sold ${home.name}.`),
  });
}

export function maintainAssets(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const upkeep = getAssetUpkeep(life);

  if (upkeep <= 0) {
    return {
      ...life,
      popupMessage: "You do not own any cars or homes yet.",
      yearNotes: addYearNote(life, "You do not own any cars or homes yet."),
    };
  }

  if (life.cash >= upkeep) {
    return consumeAction({
      ...life,
      cash: life.cash - upkeep,
      happiness: clamp(life.happiness + 3),
      reputation: clamp(life.reputation + 1),
      popupMessage: `You maintained your assets. Cost: ${formatMoney(upkeep)}.`,
      yearNotes: addYearNote(life, `You maintained your assets.`),
    });
  }

  return consumeAction({
    ...life,
    cash: 0,
    ownedCars: life.ownedCars.map((car) => ({
      ...car,
      condition: degradeCondition(car.condition),
    })),
    ownedHomes: life.ownedHomes.map((home) => ({
      ...home,
      condition: degradeCondition(home.condition),
    })),
    happiness: clamp(life.happiness - 5),
    reputation: clamp(life.reputation - 1),
    popupMessage:
      "You could not fully pay upkeep. Asset condition got worse.",
    yearNotes: addYearNote(life, "You could not fully pay upkeep. Asset condition got worse."),
  });
}

export function payDebt(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.debt <= 0) {
    return {
      ...life,
      popupMessage: "You do not have any debt to pay.",
      yearNotes: addYearNote(life, "You do not have any debt to pay."),
    };
  }

  if (life.cash <= 0) {
    return {
      ...life,
      popupMessage: "You need cash before you can pay debt.",
      yearNotes: addYearNote(life, "You need cash before you can pay debt."),
    };
  }

  const payment = Math.min(life.cash, life.debt, 10000);

  return consumeAction({
    ...life,
    cash: life.cash - payment,
    debt: life.debt - payment,
    popupMessage: `You paid ${formatMoney(payment)} toward your debt.`,
    yearNotes: addYearNote(life, `You paid ${formatMoney(payment)} toward your debt.`),
  });
}

export function takeLoan(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const amount = 10000 + life.educationLevel * 2500;
  const maxDebt = 250000 + life.reputation * 2500;

  if (life.debt >= maxDebt) {
    return {
      ...life,
      popupMessage: "The bank denied your loan. Your debt is too high.",
      yearNotes: addYearNote(life, "The bank denied your loan."),
    };
  }

  return consumeAction({
    ...life,
    cash: life.cash + amount,
    debt: life.debt + amount,
    popupMessage: `You took a loan for ${formatMoney(amount)}.`,
    yearNotes: addYearNote(life, `You took a loan for ${formatMoney(amount)}.`),
  });
}

export function workOnBusiness(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.business === "None") {
    if (life.cash < 5000) {
      return {
        ...life,
        popupMessage: "You need at least $5,000 to start a business.",
        yearNotes: addYearNote(life, "You need at least $5,000 to start a business."),
      };
    }

    const value = randomBetween(3000, 10000);

    return consumeAction({
      ...life,
      cash: life.cash - 5000,
      business: "Small Online Business",
      businessValue: value,
      businessStage: 1,
      businessEmployees: 0,
      businessRevenue: randomBetween(1000, 5000),
      businessRisk: randomBetween(15, 35),
      businessesStarted: life.businessesStarted + 1,
      lifetimeMilestones: addMilestone(life, "Started first business"),
      popupMessage: "You started a small online business.",
      yearNotes: addYearNote(life, "You started a small online business."),
    });
  }

  const growth =
    randomBetween(3000, 15000) +
    life.discipline * 80 +
    life.charisma * 60 +
    life.skills.business * 1500 +
    life.skills.marketing * 1100 +
    life.businessEmployees * 1500;

  const revenueGain = randomBetween(1000, 9000) + life.skills.business * 500;

  const newValue = life.businessValue + growth;

  return consumeAction({
    ...life,
    businessValue: newValue,
    businessRevenue: life.businessRevenue + revenueGain,
    businessStage:
      newValue >= 1500000
        ? 4
        : newValue >= 500000
          ? 3
          : newValue >= 100000
            ? 2
            : life.businessStage,
    businessRisk: Math.max(5, life.businessRisk - randomBetween(0, 3)),
    reputation: clamp(life.reputation + randomBetween(1, 4)),
    popupMessage: `Your business value grew by ${formatMoney(growth)}.`,
    yearNotes: addYearNote(life, `Your business value grew by ${formatMoney(growth)}.`),
  });
}

export function hireEmployee(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.business === "None") {
    return {
      ...life,
      popupMessage: "You need a business before hiring employees.",
      yearNotes: addYearNote(life, "You need a business before hiring employees."),
    };
  }

  const cost = 8000 + life.businessEmployees * 2500;

  if (life.cash < cost) {
    return {
      ...life,
      popupMessage: `You need ${formatMoney(cost)} to hire another employee.`,
      yearNotes: addYearNote(life, `You need ${formatMoney(cost)} to hire another employee.`),
    };
  }

  return consumeAction({
    ...life,
    cash: life.cash - cost,
    businessEmployees: life.businessEmployees + 1,
    businessRevenue: life.businessRevenue + randomBetween(4000, 12000),
    businessValue: life.businessValue + randomBetween(8000, 25000),
    businessRisk: Math.max(0, life.businessRisk - randomBetween(1, 5)),
    popupMessage: "You hired an employee.",
    yearNotes: addYearNote(life, "You hired an employee."),
  });
}

export function marketingCampaign(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.business === "None") {
    return {
      ...life,
      popupMessage: "You need a business before running marketing.",
      yearNotes: addYearNote(life, "You need a business before running marketing."),
    };
  }

  const cost = 6000 + life.businessStage * 2500;

  if (life.cash < cost) {
    return {
      ...life,
      popupMessage: `You need ${formatMoney(cost)} for a marketing campaign.`,
      yearNotes: addYearNote(life, `You need ${formatMoney(cost)} for a marketing campaign.`),
    };
  }

  const successChance =
    35 +
    Math.floor(life.charisma / 4) +
    life.skills.marketing * 6 +
    life.businessStage * 5;

  if (randomBetween(1, 100) > successChance) {
    return consumeAction({
      ...life,
      cash: life.cash - cost,
      businessRisk: Math.min(100, life.businessRisk + randomBetween(4, 12)),
      happiness: clamp(life.happiness - 2),
      popupMessage: "The marketing campaign failed.",
      yearNotes: addYearNote(life, "The marketing campaign failed."),
    });
  }

  return consumeAction({
    ...life,
    cash: life.cash - cost,
    businessValue: life.businessValue + randomBetween(15000, 60000),
    businessRevenue: life.businessRevenue + randomBetween(8000, 30000),
    businessRisk: Math.min(100, life.businessRisk + randomBetween(1, 5)),
    reputation: clamp(life.reputation + randomBetween(2, 6)),
    popupMessage: "The marketing campaign worked.",
    yearNotes: addYearNote(life, "The marketing campaign worked."),
  });
}

export function sellBusiness(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  if (life.business === "None" || life.businessValue <= 0) {
    return {
      ...life,
      popupMessage: "You do not own a business to sell.",
      yearNotes: addYearNote(life, "You do not own a business to sell."),
    };
  }

  const price = Math.floor(life.businessValue * randomBetween(75, 115) * 0.01);

  return consumeAction({
    ...life,
    cash: life.cash + price,
    business: "None",
    businessValue: 0,
    businessStage: 0,
    businessEmployees: 0,
    businessRevenue: 0,
    businessRisk: 0,
    lifetimeMilestones: addMilestone(life, `Sold a business for ${formatMoney(price)}`),
    popupMessage: `You sold your business for ${formatMoney(price)}.`,
    yearNotes: addYearNote(life, `You sold your business for ${formatMoney(price)}.`),
  });
}

export function invest(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const amount = Math.min(Math.max(0, life.cash), randomBetween(1000, 15000));

  if (amount <= 0) {
    return {
      ...life,
      popupMessage: "You had no money to invest.",
      yearNotes: addYearNote(life, "You had no money to invest."),
    };
  }

  const chance =
    30 +
    Math.floor(life.intelligence / 5) +
    Math.floor(life.luck / 6) +
    life.skills.finance * 4;

  if (randomBetween(1, 100) <= chance) {
    const profit = Math.floor(amount * randomBetween(15, 80) * 0.01);

    return consumeAction({
      ...life,
      cash: life.cash + profit,
      popupMessage: `Investment success. You made ${formatMoney(profit)}.`,
      yearNotes: addYearNote(life, `Investment success. You made ${formatMoney(profit)}.`),
    });
  }

  const loss = Math.floor(amount * randomBetween(20, 70) * 0.01);

  return consumeAction({
    ...life,
    cash: life.cash - loss,
    happiness: clamp(life.happiness - randomBetween(2, 6)),
    popupMessage: `Investment failed. You lost ${formatMoney(loss)}.`,
    yearNotes: addYearNote(life, `Investment failed. You lost ${formatMoney(loss)}.`),
  });
}

export function takeRisk(life: LifeStats) {
  const blocked = noActions(life);
  if (blocked) return blocked;

  const chance = 22 + Math.floor(life.luck / 4) + Math.floor(life.charisma / 8);

  if (randomBetween(1, 100) <= chance) {
    const reward = randomBetween(10000, 150000);

    return consumeAction({
      ...life,
      cash: life.cash + reward,
      riskTaken: life.riskTaken + 1,
      reputation: clamp(life.reputation + randomBetween(3, 10)),
      popupMessage: `Risk paid off. You gained ${formatMoney(reward)}.`,
      yearNotes: addYearNote(life, `Risk paid off. You gained ${formatMoney(reward)}.`),
    });
  }

  const loss = randomBetween(3000, 50000);

  return consumeAction({
    ...life,
    cash: life.cash - loss,
    riskTaken: life.riskTaken + 1,
    reputation: clamp(life.reputation - randomBetween(4, 15)),
    happiness: clamp(life.happiness - randomBetween(4, 12)),
    health: clamp(life.health - randomBetween(0, 7)),
    popupMessage: `Risk failed. You lost ${formatMoney(loss)}.`,
    yearNotes: addYearNote(life, `Risk failed. You lost ${formatMoney(loss)}.`),
  });
}

function processRentalEvents(life: LifeStats): LifeStats {
  let cash = life.cash;
  let happiness = life.happiness;
  let reputation = life.reputation;
  let eventLog = life.eventLog;

  const ownedHomes = life.ownedHomes.map((home) => {
    if (!home.rentedOut) return home;

    if (home.rentalStatus !== "Occupied" || !home.tenantName || !home.tenantQuality) {
      return {
        ...home,
        rentalStatus: "Vacant" as const,
        lastRentalEvent: "none" as RentalEventType,
        lastRentalEventMessage: `${home.name} is vacant and earned no rent this year.`,
      };
    }

    const rent = getAdjustedRentIncome(home);
    const managerEnabled = !!home.propertyManager?.enabled;
    const managerFee = managerEnabled
      ? Math.floor(rent * ((home.propertyManager?.feePercent || 10) / 100))
      : 0;

    const paymentChance =
      home.tenantQuality === "Excellent"
        ? 98
        : home.tenantQuality === "Good"
          ? 92
          : home.tenantQuality === "Average"
            ? 82
            : home.tenantQuality === "Risky"
              ? 64
              : 45;

    const damageChance =
      home.tenantQuality === "Excellent"
        ? 2
        : home.tenantQuality === "Good"
          ? 5
          : home.tenantQuality === "Average"
            ? 10
            : home.tenantQuality === "Risky"
              ? 22
              : 35;

    const moveOutChance =
      home.tenantQuality === "Excellent"
        ? 4
        : home.tenantQuality === "Good"
          ? 7
          : home.tenantQuality === "Average"
            ? 12
            : home.tenantQuality === "Risky"
              ? 20
              : 28;

    const managerProtection = managerEnabled ? 12 : 0;

    let updatedHome = { ...home };
    const paid = randomBetween(1, 100) <= Math.min(99, paymentChance + managerProtection);

    if (paid) {
      const received = Math.max(0, rent - managerFee);
      cash += received;
      updatedHome.lastRentalEvent = "paid";
      updatedHome.lastRentalEventMessage = `${home.tenantName} paid rent. You received ${formatMoney(received)}.`;
      eventLog = addLog(life, `Rental Event: ${updatedHome.lastRentalEventMessage}`);
    } else if (managerEnabled && randomBetween(1, 100) <= 45) {
      const recovered = Math.floor(Math.max(0, rent - managerFee) * 0.75);
      cash += recovered;
      updatedHome.lastRentalEvent = "manager_saved_problem";
      updatedHome.lastRentalEventMessage = `Your property manager handled a missed rent problem. You recovered ${formatMoney(recovered)}.`;
      eventLog = addLog(life, `Rental Event: ${updatedHome.lastRentalEventMessage}`);
    } else {
      happiness = clamp(happiness - 2);
      reputation = clamp(reputation - 1);
      updatedHome.lastRentalEvent = "missed_payment";
      updatedHome.lastRentalEventMessage = `${home.tenantName} missed rent.`;
      eventLog = addLog(life, `Rental Event: ${updatedHome.lastRentalEventMessage}`);
    }

    if (randomBetween(1, 100) <= Math.max(1, damageChance - managerProtection)) {
      updatedHome.condition = degradeCondition(updatedHome.condition);
      happiness = clamp(happiness - 2);
      updatedHome.lastRentalEvent = "damage";
      updatedHome.lastRentalEventMessage = `${home.tenantName} damaged the property. Condition dropped to ${updatedHome.condition}.`;
      eventLog = addLog(life, `Rental Event: ${updatedHome.lastRentalEventMessage}`);
    }

    const yearsLeft = Math.max(0, (updatedHome.tenantYearsRemaining || 1) - 1);
    const movedOut = yearsLeft <= 0 || randomBetween(1, 100) <= Math.max(2, moveOutChance - managerProtection);

    if (movedOut) {
      updatedHome = {
        ...updatedHome,
        rentalStatus: "Vacant",
        tenantName: "",
        tenantQuality: undefined,
        tenantYearsRemaining: 0,
        lastRentalEvent: "move_out",
        lastRentalEventMessage: `${home.tenantName} moved out. The property is now vacant.`,
      };
      eventLog = addLog(life, `Rental Event: ${updatedHome.lastRentalEventMessage}`);
    } else {
      updatedHome.tenantYearsRemaining = yearsLeft;
    }

    return updatedHome;
  });

  return {
    ...life,
    cash,
    happiness,
    reputation,
    ownedHomes,
    eventLog,
  };
}

function updateAssetValues(life: LifeStats): LifeStats {
  return {
    ...life,
    ownedCars: life.ownedCars.map((car) => ({
      ...car,
      value: Math.max(500, Math.floor(car.value * randomBetween(84, 97) * 0.01)),
    })),
    ownedHomes: life.ownedHomes.map((home) => ({
      ...home,
      value: Math.max(1000, Math.floor(home.value * randomBetween(95, 111) * 0.01)),
    })),
  };
}

function payYearlyCosts(life: LifeStats): LifeStats {
  const debtInterest = getDebtInterest(life);
  let updated = {
    ...life,
    debt: life.debt + debtInterest,
  };

  const housingCost = getHousingCost(updated);

  if (housingCost > 0) {
    if (updated.cash >= housingCost) {
      updated = {
        ...updated,
        cash: updated.cash - housingCost,
      };
    } else {
      updated = {
        ...updated,
        cash: 0,
        happiness: clamp(updated.happiness - 5),
        health: clamp(updated.health - 2),
        reputation: clamp(updated.reputation - 1),
        eventLog: addLog(updated, "Unpaid Housing: You could not pay your yearly housing cost."),
      };
    }
  }

  const upkeep = getAssetUpkeep(updated);

  if (upkeep > 0) {
    if (updated.cash >= upkeep) {
      updated = {
        ...updated,
        cash: updated.cash - upkeep,
      };
    } else {
      updated = {
        ...updated,
        cash: 0,
        ownedCars: updated.ownedCars.map((car) => ({
          ...car,
          condition: degradeCondition(car.condition),
        })),
        ownedHomes: updated.ownedHomes.map((home) => ({
          ...home,
          condition: degradeCondition(home.condition),
        })),
        happiness: clamp(updated.happiness - 5),
        reputation: clamp(updated.reputation - 1),
        eventLog: addLog(updated, "Asset Upkeep Missed: You could not pay upkeep. Asset condition got worse."),
      };
    }
  }

  return updated;
}

function getRandomChoiceEvent(life: LifeStats): LifeChoiceEvent | null {
  const events: LifeChoiceEvent[] = [
    {
      id: "family-request",
      type: "life",
      title: "Family Request",
      description: "A family member asks for financial help.",
      acceptLabel: "Help family",
      declineLabel: "Say no",
      acceptEffect: {
        cashGain: -1000,
        happinessGain: 6,
        familyRelationshipGain: 8,
      },
      declineEffect: {
        happinessGain: -2,
        familyRelationshipGain: -5,
      },
    },
    {
      id: "social-invite",
      type: "life",
      title: "Social Invite",
      description: "Friends invite you out.",
      acceptLabel: "Go out",
      declineLabel: "Stay home",
      acceptEffect: {
        cashGain: -400,
        happinessGain: 5,
        charismaGain: 2,
        friendshipsGain: 5,
      },
      declineEffect: {
        disciplineGain: 2,
        happinessGain: -1,
      },
    },
  ];

  if (life.business !== "None") {
    events.push({
      id: "business-crisis",
      type: "life",
      title: "Business Crisis",
      description: "Your business faces a serious problem.",
      acceptLabel: "Stabilize",
      declineLabel: "Risk it",
      acceptEffect: {
        cashGain: -5000,
        businessValueGain: 8000,
      },
      declineEffect: {
        businessValueGain: -randomBetween(5000, 25000),
        happinessGain: -3,
      },
    });
  }

  if (life.relationshipStatus !== "Single" && life.relationshipQuality < 15) {
    events.push({
      id: "breakup-risk",
      type: "life",
      title: "Breakup Risk",
      description: "Your relationship is falling apart.",
      acceptLabel: "Try to fix it",
      declineLabel: "Let it end",
      acceptEffect: {
        cashGain: -1200,
        relationshipQualityGain: 15,
      },
      declineEffect: {
        breakup: true,
        happinessGain: -8,
      },
    });
  }

  const filtered = events.filter((event) => event.id !== life.lastLifeEventId);
  return filtered[randomBetween(0, filtered.length - 1)] || null;
}

function getLowStatWarning(life: LifeStats) {
  if (life.health < 5) {
    return "Critical warning: Your health is below 5%. Use Life & Growth actions immediately or you may die soon.";
  }

  if (life.happiness < 5) {
    return "Critical warning: Your happiness is below 5%. Use Life & Growth or relationship actions immediately.";
  }

  if ((life.stress ?? 65) < 10) {
    return "Critical warning: Your stress control is dangerously low. Use Reset & Recover before your life starts falling apart.";
  }

  return null;
}

function checkDeath(life: LifeStats) {
  let chance = 0;

  if (life.health <= 5) chance += 30;
  if (life.health <= 15) chance += 15;
  if (life.age >= 65) chance += 4;
  if (life.age >= 75) chance += 10;
  if (life.age >= 85) chance += 22;
  if (life.age >= 95) chance += 40;

  if (life.difficulty === "Hard") chance += 1;
  if (life.difficulty === "Brutal") chance += 3;

  if (randomBetween(1, 100) <= chance) {
    return {
      isDead: true,
      deathReason:
        life.health <= 15
          ? "Your health became too weak, and your life came to an end."
          : "You passed away after a long life.",
    };
  }

  return {
    isDead: false,
    deathReason: "",
  };
}

export function endYear(life: LifeStats) {
  let updated: LifeStats = {
    ...life,
    age: life.age + 1,
    hasAskedPromotionThisYear: false,
    hasWorkedThisYear: false,
    popupMessage: null,
  };

  const businessIncome =
    updated.business !== "None"
      ? Math.floor(updated.businessRevenue * randomBetween(10, 35) * 0.01)
      : 0;

  updated = {
    ...updated,
    cash: updated.cash + businessIncome,
  };

  updated = processRentalEvents(updated);
  updated = payYearlyCosts(updated);
  updated = updateAssetValues(updated);

  if (updated.business !== "None" && updated.businessRisk >= 75) {
    const failChance = updated.businessRisk - 55;

    if (randomBetween(1, 100) <= failChance) {
      updated = {
        ...updated,
        business: "None",
        businessValue: 0,
        businessStage: 0,
        businessEmployees: 0,
        businessRevenue: 0,
        businessRisk: 0,
        happiness: clamp(updated.happiness - 12),
        reputation: clamp(updated.reputation - 8),
        popupMessage: "Your business collapsed because the risk became too high.",
        eventLog: addLog(updated, "Business Failure: Your business collapsed because the risk became too high."),
      };
    }
  }

  if (updated.jobId === "unemployed" && (!updated.partTimeJobId || updated.partTimeJobId === "none")) {
    updated = {
      ...updated,
      happiness: clamp(updated.happiness - randomBetween(1, 3)),
    };
  }

  const yearlyStressDrain =
    (updated.jobId !== "unemployed" ? randomBetween(4, 8) : 0) +
    (updated.partTimeJobId && updated.partTimeJobId !== "none" ? randomBetween(2, 5) : 0) +
    (isStudying(updated) ? randomBetween(3, 7) : 0);

  updated = {
    ...updated,
    stress: clamp((updated.stress ?? 65) - yearlyStressDrain),
  };

  if ((updated.stress ?? 65) < 25) {
    updated = {
      ...updated,
      health: clamp(updated.health - randomBetween(3, 7)),
      happiness: clamp(updated.happiness - randomBetween(4, 9)),
      discipline: clamp(updated.discipline - randomBetween(2, 5)),
      eventLog: addLog(updated, "Stress Warning: Low stress control hurt your health, happiness, and discipline."),
    };
  }

  if (randomBetween(1, 100) <= 25 && !updated.pendingLifeEvent) {
    const event = getRandomChoiceEvent(updated);

    if (event) {
      updated = {
        ...updated,
        pendingLifeEvent: event,
        lastLifeEventId: event.id,
        eventLog: addLog(updated, `Choice Event: ${event.title}. ${event.description}`),
      };
    }
  }

  if (!updated.pendingLifeEvent) {
    const warning = getLowStatWarning(updated);

    if (warning) {
      updated = {
        ...updated,
        popupMessage: warning,
        eventLog: addLog(updated, warning),
      };
    }
  }

  const death = checkDeath(updated);

  updated = {
    ...updated,
    isDead: death.isDead,
    deathReason: death.deathReason,
  };

  if (updated.isDead) {
    updated = {
      ...updated,
      eventLog: addLog(updated, `Your life ended at age ${updated.age}. ${updated.deathReason}`),
    };
  }

  updated = {
    ...updated,
    eventLog: addLog(
      updated,
      `Age ${updated.age}: Business income ${formatMoney(businessIncome)}. Rental income estimate ${formatMoney(getRentalIncomeEstimate(updated))}.`
    ),
    actionsLeft: ACTIONS_PER_YEAR,
    yearNotes: [],
  };

  if (updated.netWorth >= 1000000) {
    updated = {
      ...updated,
      lifetimeMilestones: addMilestone(updated, "Reached $1,000,000 net worth"),
    };
  }

  return recalc(updated);
}

export function getLegacyScore(life: LifeStats) {
  const ageScore = life.age * 15;
  const wealthScore = Math.floor(life.netWorth / 1000);
  const reputationScore = life.reputation * 40;
  const educationScore = life.educationLevel * 850;
  const degreeScore = life.completedDegrees.length * 900;
  const experienceScore =
    Object.values(life.jobExperience).reduce((total, value) => total + value, 0) * 120;
  const skillScore =
    Object.values(life.skills).reduce((total, value) => total + value, 0) * 300;
  const businessScore =
    life.businessesStarted * 250 +
    life.businessStage * 1200 +
    life.businessEmployees * 150;
  const jobScore = life.salary / 250 + life.careerLevel * 350;
  const relationshipScore =
    life.familyRelationship * 10 +
    life.friendships * 10 +
    life.relationshipQuality * 12 +
    life.children * 500;
  const assetScore = Math.floor(getAssetValue(life) / 2000);
  const rentalScore =
    life.ownedHomes.filter(
      (home) => home.rentedOut && home.rentalStatus === "Occupied"
    ).length * 900;
  const milestoneScore = life.lifetimeMilestones.length * 650;
  const riskScore = life.riskTaken * 45;
  const statScore =
    life.health +
    life.happiness +
    life.intelligence +
    life.charisma +
    life.discipline;

  const difficultyBonus =
    life.difficulty === "Brutal"
      ? 1.35
      : life.difficulty === "Hard"
        ? 1.2
        : life.difficulty === "Easy"
          ? 0.9
          : 1;

  return Math.max(
    0,
    Math.floor(
      (ageScore +
        wealthScore +
        reputationScore +
        educationScore +
        degreeScore +
        experienceScore +
        skillScore +
        businessScore +
        jobScore +
        relationshipScore +
        assetScore +
        rentalScore +
        milestoneScore +
        riskScore +
        statScore) *
        difficultyBonus
    )
  );
}

export function getLegacyRank(score: number) {
  if (score >= 50000) return "World-Class Legend";
  if (score >= 30000) return "Legendary Founder";
  if (score >= 18000) return "Empire Builder";
  if (score >= 10000) return "Self-Made Millionaire";
  if (score >= 6000) return "Successful Citizen";
  if (score >= 3000) return "Respectable Life";
  return "Forgotten Dreamer";
}