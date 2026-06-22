import {
  childhoodTraits,
  degreePrograms,
  difficulties,
  familyBackgrounds,
  skills,
} from "./data";
import type { LifeStats, Origin, SkillId } from "./types";

export function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomItem<T>(items: T[]) {
  return items[randomBetween(0, items.length - 1)];
}

export function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function formatMoney(value: number) {
  const sign = value < 0 ? "-" : "";
  const absolute = Math.abs(Math.floor(value));

  return `${sign}$${absolute.toLocaleString("en-US")}`;
}

export function findBackground(name: string) {
  return (
    familyBackgrounds.find((background) => background.name === name) ||
    familyBackgrounds[0]
  );
}

export function findTrait(name: string) {
  return childhoodTraits.find((trait) => trait.name === name) || childhoodTraits[0];
}

export function findDifficulty(name: string) {
  return (
    difficulties.find((difficulty) => difficulty.name === name) ||
    difficulties[1]
  );
}

export function createEmptySkills(): Record<SkillId, number> {
  return {
    business: 0,
    marketing: 0,
    programming: 0,
    finance: 0,
    realEstate: 0,
    content: 0,
    medical: 0,
    law: 0,
    engineering: 0,
  };
}

export function calculateNetWorth(life: LifeStats) {
  const carValue = (life.ownedCars || []).reduce(
    (total, asset) => total + asset.value,
    0
  );

  const homeValue = (life.ownedHomes || []).reduce(
    (total, asset) => total + asset.value,
    0
  );

  return Math.floor(
    life.cash +
      carValue +
      homeValue +
      life.businessValue -
      Math.max(0, life.debt)
  );
}

export function addLog(life: LifeStats, message: string) {
  return [message, ...(life.eventLog || [])].slice(0, 40);
}

export function addYearNote(life: LifeStats, message: string) {
  return [message, ...(life.yearNotes || [])].slice(0, 6);
}

export function getSkillName(skillId: SkillId | "none") {
  if (skillId === "none") return "None";

  return skills.find((skill) => skill.id === skillId)?.name || skillId;
}

export function getDegreeName(degreeId: string) {
  if (!degreeId || degreeId === "None") return "None";

  return (
    degreePrograms.find((degree) => degree.id === degreeId)?.name || degreeId
  );
}

export function getDegreeProgress(life: LifeStats, degreeId: string) {
  if (!degreeId || degreeId === "None") return 0;

  return life.degreeProgress[degreeId] || 0;
}

export function getDegreePaid(life: LifeStats, degreeId: string) {
  if (!degreeId || degreeId === "None") return 0;

  return life.degreePaid[degreeId] || 0;
}

export function createRandomOrigin(
  countries?: string[],
  backgrounds?: string[],
  traits?: string[],
  difficultyNames?: string[]
): Origin {
  return {
    country: randomItem(countries || ["Norway"]),
    background: randomItem(backgrounds || familyBackgrounds.map((item) => item.name)),
    trait: randomItem(traits || childhoodTraits.map((item) => item.name)),
    difficulty: randomItem(
      difficultyNames || difficulties.map((item) => item.name)
    ),
  };
}