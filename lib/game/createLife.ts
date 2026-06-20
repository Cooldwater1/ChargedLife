import { ACTIONS_PER_YEAR, educationLevels } from "./data";
import type { LifeStats, Origin } from "./types";
import {
  clamp,
  createEmptySkills,
  findBackground,
  findDifficulty,
  findTrait,
  formatMoney,
  randomBetween,
} from "./utils";

export function createNewLife(name: string, origin: Origin): LifeStats {
  const background = findBackground(origin.background);
  const trait = findTrait(origin.trait);
  const difficulty = findDifficulty(origin.difficulty);

  const baseHealth = randomBetween(42, 72);
  const baseHappiness = randomBetween(42, 72);
  const baseIntelligence = randomBetween(35, 68);
  const baseCharisma = randomBetween(35, 68);
  const baseDiscipline = randomBetween(35, 68);
  const baseLuck = randomBetween(20, 85);
  const baseReputation = randomBetween(5, 22);

  const startingCash = Math.max(
    0,
    Math.floor(background.startingCash * difficulty.cashMultiplier)
  );

  return {
    name,
    age: 18,
    country: origin.country,
    background: origin.background,
    trait: origin.trait,
    difficulty: origin.difficulty,

    health: clamp(
      baseHealth +
        background.healthBonus +
        trait.healthBonus -
        difficulty.statPenalty
    ),
    happiness: clamp(
      baseHappiness +
        background.happinessBonus +
        trait.happinessBonus -
        difficulty.statPenalty
    ),
    intelligence: clamp(
      baseIntelligence +
        background.intelligenceBonus +
        trait.intelligenceBonus -
        difficulty.statPenalty
    ),
    charisma: clamp(
      baseCharisma +
        background.charismaBonus +
        trait.charismaBonus -
        difficulty.statPenalty
    ),
    discipline: clamp(
      baseDiscipline +
        background.disciplineBonus +
        trait.disciplineBonus -
        difficulty.statPenalty
    ),
    luck: clamp(
      baseLuck + background.luckBonus + trait.luckBonus - difficulty.statPenalty
    ),
    reputation: clamp(
      baseReputation +
        background.reputationBonus +
        trait.reputationBonus -
        difficulty.statPenalty
    ),
    stress: clamp(randomBetween(55, 78) + Math.floor(trait.disciplineBonus / 2)),

    cash: startingCash,
    netWorth: startingCash,
    debt: 0,

    education: educationLevels[0],
    educationLevel: 0,

    activeDegreeId: "None",
    degreeProgress: {},
    degreePaid: {},
    completedDegrees: [],

    studentLoanStatus: "not_applied",
    studentLoanLimit: 0,
    studentLoanUsed: 0,

    skills: createEmptySkills(),

    jobId: "unemployed",
    job: "Unemployed",
    jobTrack: "none",
    salary: 0,
    careerLevel: 0,
    careerXp: 0,
    jobExperience: {},
    hasAskedPromotionThisYear: false,
    hasWorkedThisYear: false,

    partTimeJobId: "none",
    partTimeJob: "None",
    partTimeSalary: 0,

    pendingLifeEvent: null,
    popupMessage: null,
    nextLifeEventAge: randomBetween(20, 23),
    lastLifeEventId: "",

    familyRelationship: randomBetween(35, 75),
    friendships: randomBetween(10, 45),
    socialCircle: randomBetween(0, 8),
    familyMembers: ["Mother", "Father"],
    friendsList: [],
    relationshipStatus: "Single",
    partnerName: "",
    relationshipQuality: 0,
    relationshipStartedAge: null,
    children: 0,
    childrenNames: [],

    currentHousing: {
      type: "none",
      name: "No housing selected",
      yearlyCost: 0,
    },
    ownedCars: [],
    ownedHomes: [],

    business: "None",
    businessValue: 0,
    businessStage: 0,
    businessEmployees: 0,
    businessRevenue: 0,
    businessRisk: 0,
    businessesStarted: 0,

    lifetimeMilestones: [],

    actionsLeft: ACTIONS_PER_YEAR,
    yearNotes: [],

    yearsWorked: 0,
    yearsStudied: 0,
    riskTaken: 0,

    eventLog: [
      `You started adult life at age 18 with ${formatMoney(startingCash)}.`,
      "You currently have no rent, no house, no car, no tenants, and no yearly expenses.",
      `You were born in ${origin.country} into a ${origin.background.toLowerCase()} family.`,
      `Your childhood trait is ${origin.trait}.`,
      `Difficulty selected: ${origin.difficulty}.`,
    ],
    isDead: false,
    deathReason: "",
  };
}