"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  MAX_ENERGY,
  childhoodTraits,
  countries,
  defaultOrigin,
  degreePrograms,
  difficulties,
  familyBackgrounds,
  jobs,
  lifeGrowthActions,
  skills,
  STORAGE_KEY,
} from "@/lib/game/data";
import { createNewLife } from "@/lib/game/createLife";
import {
  acceptLifeEvent,
  applyForJob,
  applyStudentLoan,
  attendDegree,
  businessTypes,
  startBusiness,
  improveProduct,
  trainEmployees,
  cutCosts,
  seekInvestor,
  selectBusiness,
  launchProduct,
  getBusinessMilestoneProgress,
  getBusinessMilestones,
  getBusinessRiskLabel,
  getBusinessStageName,
  getBusinessTypeById,
  buyCar,
  buyHome,
  buyItem,
  canApplyForJob,
  carShop,
  chasePromotion,
  dateLife,
  declineLifeEvent,
  disablePropertyManager,
  doBusinessSpecificAction,
  getBusinessSpecificActions,
  getBusinessSpecialStats,
  getBusinessIncomeEstimate,
  dismissPopup,
  doProductLifecycleAction,
  getProductLifecycleActions,
  getProductProject,
  getProductProjectPhaseName,
  isProductBusinessType,
  doLifeGrowth,
  enablePropertyManager,
  endMonth,
  findTenant,
  formatEventEffect,
  getMonthName,
  getAdjustedRentIncome,
  getAssetUpkeep,
  getAssetValue,
  getCurrentJob,
  getCurrentJobExperience,
  getDebtInterest,
  getEconomyBreakdown,
  getEnergyStatus,
  getHousingCost,
  getItemValue,
  getLoanLimit,
  focusAtWork,
  workPartTimeJobs,
  takeVacation,
  takePartTimeJob,
  quitPartTimeJob,
  quitFullTimeJob,
  partTimeJobOptions,
  getPartTimeJobById,
  getPartTimeIncome,
  getJobName,
  getLegacyRank,
  getLegacyScore,
  getRentalIncomeEstimate,
  haveChild,
  hireEmployee,
  homeShop,
  itemShop,
  housingOptions,
  improveFamily,
  invest,
  liveInHome,
  maintainAssets,
  makeFriends,
  marketingCampaign,
  moveOut,
  networkAtWork,
  payDebt,
  proposeMarriage,
  renovateHome,
  rentHousing,
  realEstateAddFunds,
  realEstateFindDeal,
  realEstateBuyDeal,
  realEstateRenovate,
  realEstateRentProject,
  realEstateFlipProject,
  realEstateHireManager,
  rentOutHome,
  sellBusiness,
  sellCar,
  sellHome,
  sellItem,
  serviceCar,
  setHomeRentPriceLevel,
  stopRentingOutHome,
  takeLoan,
  work,
  workOnBusiness,
  hireBusinessManager,
  createHoldingCompany,
  upgradeHoldingCompany,
  automateBusinessPortfolio,
  careerMentorSession,
  buildProfessionalNetwork,
  realEstateMarketResearch,
  getBusinessPortfolioValue,
  getHoldingCompanyPower,
  betaAddCash,
  betaAddXP,
  betaAdjustStat,
  betaClearDebt,
  betaSetAge,
  normalizeGameSettings,
  updateGameSettings,
} from "@/lib/game/logic";
import { getJobMissingRequirements } from "@/lib/game/requirements";
import type {
  ActionPage,
  ActiveTab,
  AssetCondition,
  DegreeProgram,
  EconomyBreakdown,
  Job,
  JobCategory,
  HousingOption,
  LifeChoiceEvent,
  LifeGrowthAction,
  LifeGrowthActionCategory,
  LifeStats,
  OwnedAsset,
  OwnedBusiness,
  Origin,
  RentPriceLevel,
  SchoolCategory,
  SetupStep,
} from "@/lib/game/types";
import {
  createRandomOrigin,
  findBackground,
  findDifficulty,
  findTrait,
  formatMoney,
  getDegreeName,
  getDegreePaid,
  getDegreeProgress,
  getSkillName,
} from "@/lib/game/utils";

const MAX_SAVED_EVENTS = 40;
const MAX_SAVED_YEAR_NOTES = 6;
const MAX_SAVED_MILESTONES = 25;
const PRE_ALPHA_PASSWORD = "Kazeb";
const PRE_ALPHA_ACCESS_KEY = "chargedlife-pre-alpha-access";

const jobCategories: { id: JobCategory; label: string; description: string }[] =
  [
    {
      id: "starter",
      label: "Starter Jobs",
      description: "Entry-level jobs and early career paths.",
    },
    {
      id: "business",
      label: "Business Jobs",
      description: "Management, leadership, and executive jobs.",
    },
    {
      id: "marketing",
      label: "Marketing Jobs",
      description: "Sales, brand, and marketing careers.",
    },
    {
      id: "tech",
      label: "Tech Jobs",
      description: "Programming, IT, and software careers.",
    },
    {
      id: "finance",
      label: "Finance Jobs",
      description: "Banking, investing, and finance careers.",
    },
    {
      id: "medical",
      label: "Medical Jobs",
      description: "Healthcare, doctor, and surgeon careers.",
    },
    {
      id: "law",
      label: "Law Jobs",
      description: "Legal assistant, lawyer, and judge careers.",
    },
    {
      id: "realEstate",
      label: "Real Estate Jobs",
      description: "Property and real estate careers.",
    },
    {
      id: "creative",
      label: "Creative Jobs",
      description: "Content, media, and fame-based careers.",
    },
  ];

const schoolCategories: {
  id: SchoolCategory;
  label: string;
  description: string;
}[] = [
  {
    id: "business",
    label: "Business School",
    description: "Business, management, marketing, and entrepreneurship.",
  },
  {
    id: "tech",
    label: "Tech School",
    description: "Computer science, software engineering, and game development.",
  },
  {
    id: "finance",
    label: "Finance School",
    description: "Accounting, investing, and banking.",
  },
  {
    id: "medical",
    label: "Medical School",
    description: "Nursing, medicine, and surgery.",
  },
  {
    id: "law",
    label: "Law School",
    description: "Legal studies, law degree, and judge path.",
  },
  {
    id: "realEstate",
    label: "Real Estate School",
    description: "Property, license, and development.",
  },
  {
    id: "creative",
    label: "Creative School",
    description: "Media, content, and creative business.",
  },
  {
    id: "engineering",
    label: "Engineering School",
    description: "Engineering and technical careers.",
  },
];

const lifeGrowthCategories: {
  id: LifeGrowthActionCategory;
  label: string;
  description: string;
}[] = [
  {
    id: "health",
    label: "Health",
    description: "Rest, gym, and physical recovery.",
  },
  {
    id: "mental",
    label: "Mental Health",
    description: "Therapy, meditation, happiness, and pressure control.",
  },
  {
    id: "social",
    label: "Social Life",
    description: "Friends, family, charisma, and networking.",
  },
  {
    id: "growth",
    label: "Personal Growth",
    description: "Books, speaking, discipline, and confidence.",
  },
];

type AssetCategory = "overview" | "properties" | "vehicles" | "items";

const GAME_STAGE_LABEL = "Pre-Alpha";
const GAME_VERSION_LABEL = "v0.3.25";

function getPlayerLevelFromXp(totalXp: number) {
  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, totalXp) / 90)) + 1);
}

function getLevelStartXp(level: number) {
  return Math.max(0, Math.pow(Math.max(1, level - 1), 2) * 90);
}

function getLevelProgress(life: LifeStats) {
  const totalXp = life.lifetimeXp || life.playerXp || 0;
  const level = life.playerLevel || getPlayerLevelFromXp(totalXp);
  const start = getLevelStartXp(level);
  const next = getLevelStartXp(level + 1);
  const current = Math.max(0, totalXp - start);
  const needed = Math.max(1, next - start);

  return {
    level,
    current,
    needed,
    percent: Math.max(0, Math.min(100, Math.floor((current / needed) * 100))),
  };
}

function normalizeLife(savedLife: LifeStats): LifeStats {
  const normalizedJobId = savedLife.jobId || "unemployed";
  const savedJob = jobs.find((job) => job.id === normalizedJobId) || null;
  const normalizedSalary =
    normalizedJobId === "unemployed"
      ? 0
      : Math.max(0, savedLife.salary || savedJob?.salary || 0);

  return {
    ...savedLife,

    jobId: normalizedJobId,
    job: savedJob?.title || savedLife.job || "Unemployed",
    jobTrack: savedJob?.track || savedLife.jobTrack || "none",
    salary: normalizedSalary,
    careerLevel: savedLife.careerLevel || 0,
    careerXp: savedLife.careerXp || 0,
    jobExperience: savedLife.jobExperience || {},
    stress: savedLife.stress ?? 35,
    energy: savedLife.energy ?? MAX_ENERGY,
    hasAskedPromotionThisYear: savedLife.hasAskedPromotionThisYear || false,
    partTimeJobs: savedLife.partTimeJobs || [],
    partTimeWorkUsedThisYear: savedLife.partTimeWorkUsedThisYear || false,

    pendingLifeEvent: savedLife.pendingLifeEvent || null,
    popupMessage: savedLife.popupMessage || null,
    nextLifeEventAge: savedLife.nextLifeEventAge || savedLife.age + 2,
    lastLifeEventId: savedLife.lastLifeEventId || "",

    familyRelationship: savedLife.familyRelationship ?? 50,
    parentNames: savedLife.parentNames || {
      mother: "Maria",
      father: "Thomas",
    },
    friendships: savedLife.friendships ?? 25,
    socialCircle: savedLife.socialCircle ?? 0,
    relationshipStatus: savedLife.relationshipStatus || "Single",
    partnerName: savedLife.partnerName || "",
    relationshipQuality: savedLife.relationshipQuality ?? 0,
    children: savedLife.children ?? 0,
    childrenNames:
      savedLife.childrenNames ||
      Array.from({ length: savedLife.children ?? 0 }, (_, index) => `Child ${index + 1}`),

    currentHousing: savedLife.currentHousing || {
      type: "none",
      name: "No housing selected",
      yearlyCost: 0,
    },

    ownedCars: (savedLife.ownedCars || []).map((asset) => ({
      ...asset,
      condition: asset.condition || "Good",
      rentedOut: false,
      rentalStatus: "Vacant",
      rentPriceLevel: "Market",
      rentIncome: asset.rentIncome || 0,
      tenantName: "",
      tenantQuality: undefined,
      tenantYearsRemaining: 0,
      lastRentalEvent: "none",
      lastRentalEventMessage: "",
      propertyManager: {
        enabled: false,
        feePercent: 0,
      },
      lastServicedAge: asset.lastServicedAge || savedLife.monthsLived || 0,
    })),

    ownedHomes: (savedLife.ownedHomes || []).map((asset) => ({
      ...asset,
      type: "home",
      condition: asset.condition || "Good",
      rentedOut: asset.rentedOut || false,
      rentalStatus: asset.rentalStatus || "Vacant",
      rentPriceLevel: asset.rentPriceLevel || "Market",
      rentIncome: asset.rentIncome || 0,
      tenantName: asset.tenantName || "",
      tenantQuality: asset.tenantQuality,
      tenantYearsRemaining: asset.tenantYearsRemaining || 0,
      lastRentalEvent: asset.lastRentalEvent || "none",
      lastRentalEventMessage: asset.lastRentalEventMessage || "",
      propertyManager: asset.propertyManager || {
        enabled: false,
        feePercent: 0,
      },
      lastServicedAge: asset.lastServicedAge || savedLife.monthsLived || 0,
    })),

    ownedItems: (savedLife.ownedItems || []).map((asset) => ({
      ...asset,
      type: "item",
      condition: asset.condition || "Good",
      rentedOut: false,
      rentalStatus: "Vacant",
      rentPriceLevel: "Market",
      rentIncome: 0,
      tenantName: "",
      tenantQuality: undefined,
      tenantYearsRemaining: 0,
      lastRentalEvent: "none",
      lastRentalEventMessage: "",
      propertyManager: {
        enabled: false,
        feePercent: 0,
      },
      lastServicedAge: asset.lastServicedAge || savedLife.monthsLived || 0,
      itemCategory: asset.itemCategory || "luxury",
      rarity: asset.rarity || "Premium",
    })),

    studentLoanStatus: savedLife.studentLoanStatus || "not_applied",
    studentLoanLimit: savedLife.studentLoanLimit || 0,
    studentLoanUsed: savedLife.studentLoanUsed || 0,

    business: savedLife.business || "None",
    businessTypeId: savedLife.businessTypeId || (savedLife.business && savedLife.business !== "None" ? "online-store" : "none"),
    businessValue: savedLife.businessValue || 0,
    businessStage: savedLife.businessStage || 0,
    businessEmployees: savedLife.businessEmployees || 0,
    businessRevenue: savedLife.businessRevenue || 0,
    businessRisk: savedLife.businessRisk || 0,
    businessProductQuality: savedLife.businessProductQuality ?? (savedLife.business && savedLife.business !== "None" ? 25 : 0),
    businessBrand: savedLife.businessBrand ?? (savedLife.business && savedLife.business !== "None" ? 15 : 0),
    businessManagement: savedLife.businessManagement ?? (savedLife.business && savedLife.business !== "None" ? 10 : 0),
    businessPayroll: savedLife.businessPayroll || 0,
    businessOwnership: savedLife.businessOwnership || 100,
    businesses: savedLife.businesses || [],
    activeBusinessId: savedLife.activeBusinessId || "",
    businessesStarted: savedLife.businessesStarted || 0,
    holdingCompanyName: savedLife.holdingCompanyName || "",
    holdingCompanyLevel: savedLife.holdingCompanyLevel || 0,
    holdingCompanyManagers: savedLife.holdingCompanyManagers || 0,
    holdingCompanyAutomation: savedLife.holdingCompanyAutomation || 0,
    holdingCompanyMonthlyCost: savedLife.holdingCompanyMonthlyCost || 0,

    lifetimeMilestones: (savedLife.lifetimeMilestones || []).slice(0, MAX_SAVED_MILESTONES),
    playerLevel: savedLife.playerLevel || getPlayerLevelFromXp(savedLife.lifetimeXp || savedLife.playerXp || 0),
    playerXp: savedLife.playerXp || savedLife.lifetimeXp || 0,
    lifetimeXp: savedLife.lifetimeXp || savedLife.playerXp || 0,
    monthlyFeed: (savedLife.monthlyFeed || savedLife.eventLog || []).slice(0, 8),

    actionsLeft: 0,
    recoveryActionsUsed: savedLife.recoveryActionsUsed || {},
    yearNotes: (savedLife.yearNotes || []).slice(0, MAX_SAVED_YEAR_NOTES),
    lastYearRecap: savedLife.lastYearRecap || null,

    yearsWorked: savedLife.yearsWorked || 0,
    yearsStudied: savedLife.yearsStudied || 0,
    riskTaken: savedLife.riskTaken || 0,

    eventLog: (savedLife.eventLog || []).slice(0, MAX_SAVED_EVENTS),
    isDead: savedLife.isDead || false,
    deathReason: savedLife.deathReason || "",
  };
}

function buildActionResult(before: LifeStats, after: LifeStats) {
  const changes: string[] = [];

  const cashChange = after.cash - before.cash;
  if (cashChange !== 0) changes.push(`Cash ${cashChange > 0 ? "+" : ""}${formatMoney(cashChange)}`);

  const debtChange = after.debt - before.debt;
  if (debtChange !== 0) changes.push(`Debt ${debtChange > 0 ? "+" : ""}${formatMoney(debtChange)}`);

  const energyChange = (after.energy ?? MAX_ENERGY) - (before.energy ?? MAX_ENERGY);
  if (energyChange !== 0) changes.push(`Energy ${energyChange > 0 ? "+" : ""}${energyChange}`);

  const stressChange = (after.stress ?? 35) - (before.stress ?? 35);
  if (stressChange !== 0) changes.push(`Stress ${stressChange > 0 ? "+" : ""}${stressChange}`);

  const happinessChange = after.happiness - before.happiness;
  if (happinessChange !== 0) changes.push(`Happiness ${happinessChange > 0 ? "+" : ""}${happinessChange}`);

  const reputationChange = after.reputation - before.reputation;
  if (reputationChange !== 0) changes.push(`Reputation ${reputationChange > 0 ? "+" : ""}${reputationChange}`);

  const careerXpChange = after.careerXp - before.careerXp;
  if (careerXpChange !== 0) changes.push(`Career XP ${careerXpChange > 0 ? "+" : ""}${careerXpChange}`);

  const businessValueChange = after.businessValue - before.businessValue;
  if (businessValueChange !== 0) changes.push(`Business value ${businessValueChange > 0 ? "+" : ""}${formatMoney(businessValueChange)}`);

  return changes.slice(0, 5);
}

function prepareLifeForStorage(life: LifeStats): LifeStats {
  return {
    ...life,
    popupMessage: null,
    yearNotes: (life.yearNotes || []).slice(0, MAX_SAVED_YEAR_NOTES),
    eventLog: (life.eventLog || []).slice(0, MAX_SAVED_EVENTS),
    lifetimeMilestones: (life.lifetimeMilestones || []).slice(0, MAX_SAVED_MILESTONES),
    monthlyFeed: (life.monthlyFeed || []).slice(0, 8),
    playerLevel: life.playerLevel || getPlayerLevelFromXp(life.lifetimeXp || life.playerXp || 0),
    playerXp: life.playerXp || life.lifetimeXp || 0,
    lifetimeXp: life.lifetimeXp || life.playerXp || 0,
    lastYearRecap: life.lastYearRecap
      ? {
          ...life.lastYearRecap,
          events: (life.lastYearRecap.events || []).slice(0, 4),
          goalsCompleted: (life.lastYearRecap.goalsCompleted || []).slice(0, 4),
        }
      : null,
    ownedHomes: (life.ownedHomes || []).slice(0, 30),
    ownedCars: (life.ownedCars || []).slice(0, 30),
    ownedItems: (life.ownedItems || []).slice(0, 30),
    businesses: (life.businesses || []).slice(0, 12),
  };
}

export default function Home() {
  const [life, setLife] = useState<LifeStats | null>(null);
  const [origin, setOrigin] = useState<Origin>(defaultOrigin);
  const [nameInput, setNameInput] = useState("");
  const [setupStep, setSetupStep] = useState<SetupStep>("name");
  const [activeTab, setActiveTab] = useState<ActiveTab>("life");
  const [actionPage, setActionPage] = useState<ActionPage>("main");
  const [selectedJobCategory, setSelectedJobCategory] =
    useState<JobCategory | null>(null);
  const [selectedSchoolCategory, setSelectedSchoolCategory] =
    useState<SchoolCategory | null>(null);
  const [selectedAssetCategory, setSelectedAssetCategory] =
    useState<AssetCategory>("overview");
  const [hasPreAlphaAccess, setHasPreAlphaAccess] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");


  useEffect(() => {
    const savedAccess = window.localStorage.getItem(PRE_ALPHA_ACCESS_KEY);

    if (savedAccess === "true") {
      setHasPreAlphaAccess(true);
    }
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as LifeStats;
      setLife(normalizeLife(parsed));
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!life) return;

    const timeoutId = window.setTimeout(() => {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(prepareLifeForStorage(life))
      );
    }, 120);

    return () => window.clearTimeout(timeoutId);
  }, [life]);

  const legacyScore = useMemo(() => {
    if (!life) return 0;
    return getLegacyScore(life);
  }, [life]);

  const currentJob = useMemo(() => {
    if (!life) return null;
    return getCurrentJob(life);
  }, [life]);

  const economy = useMemo(() => {
    if (!life) return null;
    return getEconomyBreakdown(life);
  }, [life]);


  function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (passwordInput.trim() !== PRE_ALPHA_PASSWORD) {
      setPasswordError("Wrong password. This pre-alpha is currently private.");
      return;
    }

    window.localStorage.setItem(PRE_ALPHA_ACCESS_KEY, "true");
    setHasPreAlphaAccess(true);
    setPasswordError("");
    setPasswordInput("");
  }

  function handleTabChange(tab: ActiveTab) {
    if (tab === "actions") {
      setActionPage("main");
      setSelectedJobCategory(null);
      setSelectedSchoolCategory(null);
      setSelectedAssetCategory("overview");
    }

    if (tab === "career") {
      setSelectedJobCategory(null);
    }

    setActiveTab(tab);
  }

  function updateLife(nextLife: LifeStats) {
    const normalized = normalizeLife(prepareLifeForStorage(nextLife));

    if (life && (normalized.energy !== life.energy || normalized.cash !== life.cash || normalized.debt !== life.debt || normalized.popupMessage)) {
      const result = buildActionResult(life, normalized);
      const baseMessage = normalized.popupMessage || "Action complete.";

      setLife({
        ...normalized,
        popupMessage: result.length > 0 ? `${baseMessage} Changes: ${result.join(", ")}.` : baseMessage,
      });
      return;
    }

    setLife(normalized);
  }

  function startLife() {
    const newLife = createNewLife(nameInput.trim() || "Charged Rookie", origin);
    setLife(normalizeLife(newLife));
    setActiveTab("actions");
    setActionPage("main");
  }

  function restartLife() {
    window.localStorage.removeItem(STORAGE_KEY);
    setLife(null);
    setOrigin(defaultOrigin);
    setNameInput("");
    setSetupStep("name");
    setActiveTab("life");
    setActionPage("main");
    setSelectedJobCategory(null);
    setSelectedSchoolCategory(null);
    setSelectedAssetCategory("overview");
  }

  function handleEndMonth() {
    if (!life) return;

    if (life.pendingLifeEvent || life.popupMessage) {
      return;
    }

    const updated = endMonth(life);
    setLife(normalizeLife(updated));

    if (updated.isDead) {
      setActiveTab("life");
    }
  }

  function handleAcceptEvent() {
    if (!life) return;

    updateLife(acceptLifeEvent(life));
  }

  function handleDeclineEvent() {
    if (!life) return;

    updateLife(declineLifeEvent(life));
  }

  function handleDismissPopup() {
    if (!life) return;

    updateLife(dismissPopup(life));
  }


  if (!hasPreAlphaAccess) {
    return (
      <PreAlphaPasswordGate
        passwordInput={passwordInput}
        passwordError={passwordError}
        setPasswordInput={setPasswordInput}
        onSubmit={handlePasswordSubmit}
      />
    );
  }

  if (!life) {
    return (
      <NewLifeWizard
        nameInput={nameInput}
        setNameInput={setNameInput}
        origin={origin}
        setOrigin={setOrigin}
        setupStep={setupStep}
        setSetupStep={setSetupStep}
        onStartLife={startLife}
      />
    );
  }

  if (life.isDead) {
    return (
      <LifeCompleteScreen
        life={life}
        legacyScore={legacyScore}
        onRestart={restartLife}
      />
    );
  }

  const content = (
    <>
      <TopSummary
        life={life}
        onRestart={restartLife}
        onEndMonth={handleEndMonth}
      />

      {(life.popupMessage || life.pendingLifeEvent) && (
        <NextMonthLockNotice hasEvent={Boolean(life.pendingLifeEvent)} />
      )}

      {life.popupMessage && (
        <PopupCard message={life.popupMessage} onClose={handleDismissPopup} />
      )}

      {life.pendingLifeEvent && (
        <LifeEventCard
          event={life.pendingLifeEvent}
          onAccept={handleAcceptEvent}
          onDecline={handleDeclineEvent}
        />
      )}

      <div className="mt-5 lg:mt-6">
        {activeTab === "life" && (
          <LifeDashboard
            life={life}
            legacyScore={legacyScore}
            onOpenActions={(page) => {
              setActionPage(page);
              setActiveTab("actions");
            }}
            onOpenTab={setActiveTab}
          />
        )}

        {activeTab === "stats" && (
          <TabCard title="Stats & Skills">
            <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
              <StatBar label="Health" value={life.health} />
              <StatBar label="Happiness" value={life.happiness} />
              <StatBar label="Intelligence" value={life.intelligence} />
              <StatBar label="Charisma" value={life.charisma} />
              <StatBar label="Discipline" value={life.discipline} />
              <StatBar label="Luck" value={life.luck} />
              <StatBar label="Reputation" value={life.reputation} />
              <StatBar label="Family" value={life.familyRelationship} />
              <StatBar label="Friends" value={life.friendships} />
              <StatBar label="Relationship" value={life.relationshipQuality} />
            </div>

            <h3 className="mb-3 text-lg font-black">Skills</h3>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {skills.map((skill) => (
                <MainStat
                  key={skill.id}
                  label={skill.name}
                  value={`Level ${life.skills[skill.id]}`}
                />
              ))}
            </div>
          </TabCard>
        )}

        {activeTab === "career" && (
          <TabCard title="Career & Business">
            <div className="rounded-[2rem] border border-orange-500/25 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_35%),linear-gradient(180deg,rgba(20,20,24,0.98),rgba(9,9,11,0.98))] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-400">
                    Career Path
                  </p>
                  <h2 className="mt-2 text-3xl font-black text-white">
                    {life.jobId === "unemployed" ? "No full-time job yet" : life.job}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                    Career gives stable salary. Business gives upside and risk. Use the quick buttons below to jump into the right hub.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedJobCategory(null);
                      setActiveTab("actions");
                      setActionPage("apply");
                    }}
                    className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-black transition hover:bg-orange-400 active:scale-[0.98]"
                  >
                    Apply for Job →
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("actions");
                      setActionPage("money");
                    }}
                    className="rounded-2xl border border-orange-500/35 bg-orange-500/10 px-4 py-3 text-sm font-black text-orange-300 transition hover:border-orange-400"
                  >
                    Open Business Hub →
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MainStat label="Education" value={life.education} />
                <MainStat label="Job" value={life.job} />
                <MainStat label="Monthly Salary" value={formatMoney(Math.floor(life.salary / 12))} />
                <MainStat label="Job Experience" value={life.jobId === "unemployed" ? "None" : `${getCurrentJobExperience(life)}`} />
                <MainStat label="Career Path" value={currentJob?.careerPath || "None"} />
                <MainStat label="Next Promotion" value={currentJob?.nextJobId ? getJobName(currentJob.nextJobId) : life.jobId === "unemployed" ? "Get a job first" : "Top role"} />
                <MainStat label="Career XP" value={`${life.careerXp}`} />
                <MainStat label="Stress" value={`${life.stress}/100`} />
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <button
                onClick={() => updateLife(careerMentorSession(life))}
                className="rounded-[1.4rem] bg-gradient-to-br from-sky-500/12 to-zinc-950/70 p-4 text-left transition hover:from-sky-500/18 active:scale-[0.99]"
              >
                <p className="text-2xl">🧑‍🏫</p>
                <p className="mt-2 font-black text-white">Career Mentor</p>
                <p className="mt-1 text-sm leading-5 text-zinc-400">Pay for advice, gain Career XP, reputation, intelligence, and discipline.</p>
              </button>
              <button
                onClick={() => updateLife(buildProfessionalNetwork(life))}
                className="rounded-[1.4rem] bg-gradient-to-br from-purple-500/12 to-zinc-950/70 p-4 text-left transition hover:from-purple-500/18 active:scale-[0.99]"
              >
                <p className="text-2xl">🤝</p>
                <p className="mt-2 font-black text-white">Professional Network</p>
                <p className="mt-1 text-sm leading-5 text-zinc-400">Build contacts. Improves charisma, career XP, reputation, and future opportunities.</p>
              </button>
              <div className="rounded-[1.4rem] bg-gradient-to-br from-orange-500/12 to-zinc-950/70 p-4">
                <p className="text-2xl">🪜</p>
                <p className="mt-2 font-black text-white">Career Ladder V2</p>
                <p className="mt-1 text-sm leading-5 text-zinc-400">Jobs now feel more like paths: build XP, meet requirements, and climb toward the next role.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              <div className="rounded-[1.6rem] border border-zinc-800 bg-zinc-950/80 p-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-400">
                  School & Skills
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <MainStat label="Active Degree" value={getDegreeName(life.activeDegreeId)} />
                  <MainStat label="Degree Progress" value={`${getDegreeProgress(life, life.activeDegreeId)}/100`} />
                  <MainStat label="Student Loan" value={life.studentLoanStatus.replace("_", " ")} />
                  <MainStat label="Loan Used" value={`${formatMoney(life.studentLoanUsed)}/${formatMoney(life.studentLoanLimit)}`} />
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-orange-500/20 bg-orange-500/5 p-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-400">
                  Business Shortcut
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">
                  {life.business === "None" ? "No business yet" : life.business}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {life.business === "None"
                    ? "Open the Business Hub to start a company."
                    : `Value ${formatMoney(life.businessValue)} • Revenue ${formatMoney(life.businessRevenue)} • Risk ${life.businessRisk}/100`}
                </p>
                <button
                  onClick={() => {
                    setActiveTab("actions");
                    setActionPage("money");
                  }}
                  className="mt-4 w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-black transition hover:bg-orange-400 active:scale-[0.98]"
                >
                  Manage Business →
                </button>
              </div>
            </div>
          </TabCard>
        )}

        {activeTab === "economy" && economy && <EconomyPage life={life} economy={economy} updateLife={updateLife} />}

        {activeTab === "business" && (
          <TabCard title="Business Hub">
            <ActionsRouter
              life={life}
              actionPage="money"
              setActionPage={setActionPage}
              selectedJobCategory={selectedJobCategory}
              setSelectedJobCategory={setSelectedJobCategory}
              selectedSchoolCategory={selectedSchoolCategory}
              setSelectedSchoolCategory={setSelectedSchoolCategory}
              selectedAssetCategory={selectedAssetCategory}
              setSelectedAssetCategory={setSelectedAssetCategory}
              updateLife={updateLife}
            />
          </TabCard>
        )}

        {activeTab === "actions" && (
          <TabCard title="Actions">
            <ActionsRouter
              life={life}
              actionPage={actionPage}
              setActionPage={setActionPage}
              selectedJobCategory={selectedJobCategory}
              setSelectedJobCategory={setSelectedJobCategory}
              selectedSchoolCategory={selectedSchoolCategory}
              setSelectedSchoolCategory={setSelectedSchoolCategory}
              selectedAssetCategory={selectedAssetCategory}
              setSelectedAssetCategory={setSelectedAssetCategory}
              updateLife={updateLife}
            />
          </TabCard>
        )}

        {activeTab === "timeline" && (
          <TabCard title="Story Timeline">
            <StoryTimelinePanel life={life} />
          </TabCard>
        )}

        {activeTab === "settings" && (
          <SettingsPage
            life={life}
            updateLife={updateLife}
            onNewLife={restartLife}
          />
        )}
      </div>
    </>
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white selection:bg-orange-500 selection:text-black">
      <div className=" fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,106,0,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,106,0,0.10),transparent_30%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1860px] gap-3 px-3 pb-28 pt-3 lg:gap-4 lg:px-4 lg:pb-6">
        <DesktopSidebar
          life={life}
          activeTab={activeTab}
          onChange={handleTabChange}
          onLogoHome={() => {
            setActionPage("main");
            setActiveTab("life");
          }}
        />

        <section className="mx-auto w-full max-w-md lg:max-w-none lg:flex-1">
          {content}
        </section>

        <DesktopRightRail life={life} legacyScore={legacyScore} />
      </div>

      <BottomNavigation activeTab={activeTab} onChange={handleTabChange} />
    </main>
  );
}

function DesktopSidebar({
  life,
  activeTab,
  onChange,
  onLogoHome,
}: {
  life: LifeStats;
  activeTab: ActiveTab;
  onChange: (tab: ActiveTab) => void;
  onLogoHome: () => void;
}) {
  const tabs: { id: ActiveTab; label: string; icon: string }[] = [
    { id: "life", label: "Life", icon: "🏠" },
    { id: "stats", label: "Stats", icon: "📊" },
    { id: "career", label: "Career+", icon: "💼" },
    { id: "economy", label: "Money", icon: "💰" },
    { id: "business", label: "Business Hub", icon: "🏢" },
    { id: "actions", label: "Actions", icon: "⚡" },
    { id: "timeline", label: "Story", icon: "📖" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[258px] shrink-0 flex-col border-r border-zinc-900/90 bg-black/35 px-3 py-4 backdrop-blur-xl lg:flex xl:w-[270px]">
      <button
        onClick={onLogoHome}
        className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition hover:bg-zinc-900/70 active:scale-[0.99]"
        title="Go to Life overview"
      >
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-orange-500/40 bg-orange-500/10 text-lg shadow-lg shadow-orange-500/10">
          ⚡
        </div>
        <div>
          <p className="whitespace-nowrap text-base font-black uppercase tracking-[0.10em] text-white">
            Charged<span className="text-orange-500">Life</span>
          </p>
          <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-600">
            {GAME_STAGE_LABEL} • {GAME_VERSION_LABEL}
          </p>
        </div>
      </button>

      <nav className="mt-6 space-y-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black transition ${
                isActive
                  ? "border border-orange-500/45 bg-orange-500/18 text-white shadow-lg shadow-orange-950/25"
                  : "text-zinc-500 hover:bg-zinc-900/80 hover:text-zinc-100"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-6 border-t border-zinc-900 pt-4">
        <button
          onClick={() => onChange("settings")}
          className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
            activeTab === "settings"
              ? "border border-orange-500/45 bg-orange-500/18 text-white shadow-lg shadow-orange-950/25"
              : "text-zinc-500 hover:bg-zinc-900/80 hover:text-zinc-100"
          }`}
        >
          <span>⚙️</span>
          <span>Settings</span>
        </button>
      </div>

      <div className="mt-auto rounded-3xl border border-zinc-800/80 bg-zinc-950/70 p-4 shadow-xl shadow-black/30">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full border border-orange-500/45 bg-orange-500/10 text-xs font-black text-orange-400">
            CR
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">{life.name}</p>
            <p className="text-xs text-zinc-500">Age {life.age} • {getMonthName(life.month || 1)} {life.calendarYear || 2026} • {life.job}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs font-bold text-zinc-500">
          <span>Level {getLevelProgress(life).level}</span>
          <span>{getLevelProgress(life).current} / {getLevelProgress(life).needed} XP</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-900">
          <div className="h-full rounded-full bg-orange-500" style={{ width: `${getLevelProgress(life).percent}%` }} />
        </div>
        <p className="mt-3 text-xs text-zinc-500">Early Life</p>
      </div>
    </aside>
  );
}

function DesktopRightRail({
  life,
  legacyScore,
}: {
  life: LifeStats;
  legacyScore: number;
}) {
  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[286px] shrink-0 space-y-3 overflow-y-auto pr-1 xl:block 2xl:w-[310px]">
      <SidePanel icon="📊" title="Life at a Glance" action="View All Stats">
        <div className="space-y-4">
          <RailStat icon="💚" label="Health" value={life.health} color="bg-green-500" />
          <RailStat icon="🙂" label="Happiness" value={life.happiness} color="bg-yellow-400" />
          <RailStat icon="🔥" label="Stress" value={life.stress} color="bg-red-500" />
          <RailStat icon="👥" label="Social" value={life.friendships} color="bg-purple-500" />
        </div>
      </SidePanel>

      <SidePanel icon="🗂️" title="Recent Events" action="View All">
        <div className="space-y-3">
          {(life.yearNotes.length > 0
            ? life.yearNotes.slice(-3).reverse()
            : [
                "Started a new chapter in your life.",
                "New opportunities are available.",
                "You received your starting funds.",
              ]
          ).map((event, index) => (
            <div key={`${event}-${index}`} className="flex gap-3">
              <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-500/15 text-sm">
                {index === 0 ? "🌱" : index === 1 ? "⚡" : "💼"}
              </div>
              <div>
                <p className="text-sm font-black leading-5 text-zinc-200">{event}</p>
                <p className="text-xs text-zinc-500">Age {life.age}</p>
              </div>
            </div>
          ))}
        </div>
      </SidePanel>

      <SidePanel icon="🏅" title="Active Goals" action="View All">
        <div className="space-y-3">
          {getGoalRows(life).slice(0, 4).map((goal) => (
            <GoalRow
              key={goal.label}
              icon={goal.icon}
              label={goal.label}
              progress={goal.done ? "Done" : `${goal.progress}%`}
            />
          ))}
        </div>
      </SidePanel>

      <div className="relative overflow-hidden rounded-3xl border border-orange-500/30 bg-gradient-to-br from-orange-500/15 via-zinc-950 to-black p-5 shadow-xl shadow-orange-950/20">
        <div className=" absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,106,0,0.20),transparent_42%)]" />
        <div className="relative">
          <p className="text-3xl text-orange-400">“</p>
          <p className="mt-1 text-sm leading-6 text-zinc-300">
            The best time to plant a tree was 20 years ago. The second best time is now.
          </p>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
            Legacy Score
          </p>
          <div className="mt-1 flex items-end justify-between gap-4">
            <p className="text-3xl font-black text-orange-400">
              {legacyScore.toLocaleString()}
            </p>
            <div className="h-12 w-28 rounded-2xl bg-[linear-gradient(135deg,transparent,rgba(255,106,0,0.25))]" />
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidePanel({
  icon,
  title,
  action,
  children,
}: {
  icon?: string;
  title: string;
  action?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800/80 bg-zinc-950/80 p-5 shadow-xl shadow-black/30 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-base font-black text-white">
          {icon && <span className="text-sm">{icon}</span>}
          <span>{title}</span>
        </h3>
        {action && <p className="text-xs font-black text-orange-400">{action}</p>}
      </div>
      {children}
    </div>
  );
}

function RailStat({
  icon,
  label,
  value,
  color = "bg-orange-500",
}: {
  icon: string;
  label: string;
  value: number;
  color?: string;
}) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 font-black text-zinc-300">
          <span>{icon}</span>
          <span>{label}</span>
        </div>
        <span className="font-black text-zinc-200">{safeValue} / 100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

function GoalRow({
  icon,
  label,
  progress,
}: {
  icon: string;
  label: string;
  progress?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-black/30 p-3">
      <div className="flex items-center gap-3 text-sm font-bold text-zinc-300">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {progress && <span className="text-xs font-black text-zinc-500">{progress}</span>}
        <div className={`grid h-5 w-5 place-items-center rounded-md border ${
          progress === "Done"
            ? "border-green-500/40 bg-green-500/15 text-[10px] text-green-300"
            : "border-zinc-700"
        }`}>
          {progress === "Done" ? "✓" : ""}
        </div>
      </div>
    </div>
  );
}

function LifeDashboard({
  life,
  legacyScore,
  onOpenActions,
  onOpenTab,
}: {
  life: LifeStats;
  legacyScore: number;
  onOpenActions: (page: ActionPage) => void;
  onOpenTab: (tab: ActiveTab) => void;
}) {
  const monthsPlayed = Math.max(0, life.monthsLived || 0);
  const hasJob = life.jobId !== "unemployed";
  const hasBusiness = life.business !== "None";
  const netWorthProgress = Math.min(100, Math.round((life.netWorth / 10000) * 100));
  const educationDone = life.educationLevel > 0 || life.completedDegrees.length > 0;
  const monthlyIncome = hasJob ? Math.max(250, Math.round(life.salary / 12)) : 250;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 min-[1900px]:grid-cols-[minmax(0,1.05fr)_minmax(460px,0.95fr)]">
        <DashboardPanel
          title="Current Opportunities"
          icon="1"
          action="View all"
          iconMode="number"
        >
          <div className="grid gap-3 md:grid-cols-3">
            <OpportunityCard
              icon="💼"
              title={hasJob ? "Build Career Performance" : "Apply for Part-Time Job"}
              description={
                hasJob
                  ? "Salary pays monthly now. Use energy to build promotion progress."
                  : "Build experience, earn consistent income, and take your first step forward."
              }
              reward={hasJob ? "Reward: Career XP" : "Reward: Steady Income"}
              buttonLabel={hasJob ? "Improve" : "Take Action"}
              onClick={() => onOpenActions(hasJob ? "career" : "apply")}
            />
            <OpportunityCard
              icon="📖"
              title="Study for Better Future"
              description="Improve your skills and unlock better career opportunities."
              reward="Reward: + Skills, + Future"
              buttonLabel="Start Studying"
              onClick={() => onOpenActions("school")}
            />
            <OpportunityCard
              icon="🚀"
              title={hasBusiness ? "Grow Your Business" : "Start a Side Hustle"}
              description={
                hasBusiness
                  ? "Build revenue, hire help, and turn your idea into an empire."
                  : "Turn your ideas into income. Small steps today, bigger returns tomorrow."
              }
              reward={hasBusiness ? "Reward: Business Growth" : "Reward: Extra Income"}
              buttonLabel={hasBusiness ? "Work on Business" : "Explore Hustles"}
              onClick={() => onOpenActions("money")}
            />
          </div>
        </DashboardPanel>

        <BusinessInvestmentsPanel life={life} onOpenActions={onOpenActions} />
      </div>

      <GameFeelPanel life={life} />

      <div className="grid gap-4 xl:grid-cols-2">
        <FinancialSnapshotPanel life={life} monthlyIncome={monthlyIncome} />
        <GoalsProgressPanel life={life} />
        <StorySoFarPanel life={life} />
        <FocusForYearPanel life={life} netWorthProgress={netWorthProgress} onOpenActions={onOpenActions} />
      </div>

      <MilestonesUnlocksPanel
        life={life}
        monthsPlayed={monthsPlayed}
        hasJob={hasJob}
        educationDone={educationDone}
        netWorthProgress={netWorthProgress}
        legacyScore={legacyScore}
      />
    </div>
  );
}


function GameFeelPanel({ life }: { life: LifeStats }) {
  const levelProgress = getLevelProgress(life);
  const feed = (life.monthlyFeed && life.monthlyFeed.length > 0
    ? life.monthlyFeed
    : life.eventLog || []
  ).slice(0, 5);
  const achievements = (life.lifetimeMilestones || []).slice(0, 4);
  const goals = getGoalRows(life).slice(0, 4);
  const recap = life.lastYearRecap;

  return (
    <div className="grid gap-4 min-[1600px]:grid-cols-[1.15fr_0.85fr]">
      <DashboardPanel title="Month Recap" icon="📅" action="Game Feel V1">
        <div className="grid gap-3 md:grid-cols-3">
          <RecapMiniStat
            label="Cash"
            value={recap ? `${recap.cashChange >= 0 ? "+" : ""}${formatMoney(recap.cashChange)}` : formatMoney(life.cash)}
            tone={!recap || recap.cashChange >= 0 ? "good" : "bad"}
          />
          <RecapMiniStat
            label="Net Worth"
            value={recap ? `${recap.netWorthChange >= 0 ? "+" : ""}${formatMoney(recap.netWorthChange)}` : formatMoney(life.netWorth)}
            tone={!recap || recap.netWorthChange >= 0 ? "good" : "bad"}
          />
          <RecapMiniStat
            label="Level"
            value={`Level ${levelProgress.level}`}
            tone="good"
          />
        </div>

        <div className="mt-4 rounded-2xl bg-black/25 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-400">XP Progress</p>
            <p className="text-xs font-black text-zinc-500">{levelProgress.current} / {levelProgress.needed}</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
            <div className="h-full rounded-full bg-orange-500" style={{ width: `${levelProgress.percent}%` }} />
          </div>
        </div>
      </DashboardPanel>

      <DashboardPanel title="Life Feed" icon="📜" action="Latest">
        <div className="space-y-2">
          {feed.map((item, index) => (
            <div key={`${item}-${index}`} className="flex gap-3 rounded-2xl bg-zinc-950/70 p-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-500/10 text-sm">
                {index === 0 ? "📌" : index === 1 ? "💸" : index === 2 ? "⭐" : "📖"}
              </span>
              <p className="text-sm leading-5 text-zinc-300">{item}</p>
            </div>
          ))}
        </div>
      </DashboardPanel>

      <DashboardPanel title="Achievements" icon="🏆" action={`${achievements.length} unlocked`}>
        {achievements.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {achievements.map((achievement) => (
              <div key={achievement} className="rounded-2xl bg-amber-500/10 p-3">
                <p className="text-sm font-black text-amber-200">{achievement}</p>
                <p className="mt-1 text-xs text-zinc-500">Unlocked in your current life.</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl bg-zinc-950/70 p-4 text-sm leading-6 text-zinc-400">
            No achievements yet. Complete your first month, get a job, buy assets, or start a business.
          </p>
        )}
      </DashboardPanel>

      <DashboardPanel title="Active Missions" icon="🎯" action="Guided goals">
        <div className="space-y-3">
          {goals.map((goal) => (
            <div key={goal.label} className="rounded-2xl bg-zinc-950/70 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black text-white">{goal.icon} {goal.label}</p>
                <p className={goal.done ? "text-xs font-black text-green-300" : "text-xs font-black text-orange-300"}>
                  {goal.done ? "Done" : `${goal.progress}%`}
                </p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-900">
                <div
                  className={goal.done ? "h-full rounded-full bg-green-400" : "h-full rounded-full bg-orange-500"}
                  style={{ width: `${Math.max(6, goal.progress)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </DashboardPanel>
    </div>
  );
}

function RecapMiniStat({ label, value, tone }: { label: string; value: string; tone: "good" | "bad" }) {
  return (
    <div className={`rounded-2xl p-4 ${tone === "good" ? "bg-green-500/10" : "bg-red-500/10"}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className={`mt-2 text-xl font-black ${tone === "good" ? "text-green-300" : "text-red-300"}`}>{value}</p>
    </div>
  );
}

function NextMonthLockNotice({ hasEvent }: { hasEvent: boolean }) {
  return (
    <div className="mt-3 rounded-2xl border border-orange-500/25 bg-orange-500/10 px-4 py-3 text-sm leading-6 text-orange-100">
      <span className="font-black">Next Month is locked.</span>{" "}
      {hasEvent
        ? "Choose an option in the live event before time can move forward."
        : "Click Okay on the current message before time can move forward."}
    </div>
  );
}

function DashboardPanel({
  title,
  icon,
  action,
  iconMode = "emoji",
  children,
}: {
  title: string;
  icon?: string;
  action?: string;
  iconMode?: "emoji" | "number";
  children: ReactNode;
}) {
  return (
    <div className="rounded-[1.4rem] border border-zinc-800/80 bg-gradient-to-br from-zinc-950/90 via-[#090c10]/90 to-black/90 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-tight text-white lg:text-base">
          {icon && (
            <span
              className={
                iconMode === "number"
                  ? "grid h-6 w-6 place-items-center rounded-full border border-orange-500/60 bg-orange-500/10 text-xs font-black text-orange-300"
                  : "text-base"
              }
            >
              {icon}
            </span>
          )}
          <span>{title}</span>
        </h2>
        {action && <button className="text-xs font-black text-orange-400">{action}</button>}
      </div>
      {children}
    </div>
  );
}

function OpportunityCard({
  icon,
  title,
  description,
  reward,
  buttonLabel,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  reward: string;
  buttonLabel: string;
  onClick: () => void;
}) {
  return (
    <div className="flex min-h-[210px] flex-col rounded-[1.4rem] border border-zinc-800/80 bg-zinc-900/45 p-3.5 text-center shadow-lg shadow-black/20 xl:min-h-[220px]">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-orange-500/10 text-2xl shadow-inner shadow-orange-500/10">
        {icon}
      </div>
      <h3 className="mx-auto mt-3 max-w-[190px] text-base font-black leading-tight text-white">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-xs leading-5 text-zinc-400">{description}</p>
      <div className="mt-3 rounded-2xl bg-black/25 px-3 py-2 text-[11px] font-bold text-zinc-400">
        {reward}
      </div>
      <button
        onClick={onClick}
        className="mt-3 rounded-2xl bg-orange-600 px-3 py-2.5 text-xs font-black text-white shadow-lg shadow-orange-950/30 transition hover:bg-orange-500 active:scale-[0.98]"
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function BusinessInvestmentsPanel({
  life,
  onOpenActions,
}: {
  life: LifeStats;
  onOpenActions: (page: ActionPage) => void;
}) {
  const hasBusiness = life.business !== "None";
  const stageName = getBusinessStageName(life.businessStage);
  const riskLabel = getBusinessRiskLabel(life.businessRisk);
  const businessType = getBusinessTypeById(life.businessTypeId);

  return (
    <DashboardPanel title="Business & Investments" icon="2" action={hasBusiness ? stageName : "Start"} iconMode="number">
      <div className="rounded-[1.35rem] border border-zinc-800/70 bg-[radial-gradient(circle_at_right,rgba(249,115,22,0.12),transparent_38%),linear-gradient(135deg,rgba(39,39,42,0.34),rgba(0,0,0,0.20))] p-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_170px] lg:items-center">
          <div>
            <p className="text-lg font-black text-white">
              {hasBusiness ? life.business : "No business yet"}
            </p>
            <p className="mt-2 max-w-xl text-xs leading-5 text-zinc-400">
              {hasBusiness
                ? `${businessType?.category || "Business"} • ${stageName}. Value ${formatMoney(life.businessValue)}, revenue base ${formatMoney(life.businessRevenue)}, risk ${riskLabel}.`
                : "Choose a business type in the Money tab and start building a scalable company."}
            </p>
          </div>
          <div className="hidden h-24 rounded-3xl border border-orange-500/20 bg-black/25 p-4 lg:block">
            <div className="flex h-full items-end gap-2">
              {[
                hasBusiness ? Math.max(12, life.businessProductQuality || 0) : 12,
                hasBusiness ? Math.max(12, life.businessBrand || 0) : 24,
                hasBusiness ? Math.max(12, life.businessManagement || 0) : 18,
                hasBusiness ? Math.max(12, Math.min(100, life.businessEmployees * 12)) : 32,
                hasBusiness ? Math.max(12, 100 - life.businessRisk) : 44,
              ].map((height, index) => (
                <div key={index} className="flex-1 rounded-t-lg bg-orange-500/70" style={{ height: `${Math.min(100, height)}%` }} />
              ))}
              <span className="ml-2 text-3xl">{hasBusiness ? "🚀" : "📈"}</span>
            </div>
          </div>
        </div>
      </div>

      {hasBusiness ? (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-[1.25rem] border border-zinc-800/70 bg-black/25 p-3.5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
              Company Metrics
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <MiniAssetStat label="Quality" value={`${life.businessProductQuality || 0}/100`} />
              <MiniAssetStat label="Brand" value={`${life.businessBrand || 0}/100`} />
              <MiniAssetStat label="Manage" value={`${life.businessManagement || 0}/100`} />
              <MiniAssetStat label="Owner" value={`${life.businessOwnership || 100}%`} />
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-zinc-800/70 bg-black/25 p-3.5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
              Next Move
            </p>
            <div className="mt-3 space-y-2 text-sm leading-5 text-zinc-400">
              <p>Employees: <span className="font-black text-white">{life.businessEmployees}</span></p>
              <p>Monthly payroll: <span className="font-black text-white">{formatMoney(Math.floor(life.businessPayroll / 12))}</span></p>
              <p>Risk: <span className="font-black text-white">{riskLabel}</span></p>
            </div>
            <button
              onClick={() => onOpenActions("money")}
              className="mt-4 w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-black transition hover:bg-orange-400 active:scale-[0.98]"
            >
              Open Business Hub
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-[1.25rem] border border-zinc-800/70 bg-black/25 p-3.5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
              Available Business Types
            </p>
            <div className="mt-3 space-y-2.5">
              {businessTypes.slice(0, 5).map((type) => (
                <div key={type.id} className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-zinc-300">{type.name}</span>
                  <span className="text-xs font-black text-orange-300">{formatMoney(type.startCost)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-zinc-800/70 bg-black/25 p-3.5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
              Start Here
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Go to Money → Business & Investing to choose Online Store, Marketing Agency, Game Studio, Minecraft Server, Roblox Game, and more.
            </p>
            <button
              onClick={() => onOpenActions("money")}
              className="mt-4 w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-black transition hover:bg-orange-400 active:scale-[0.98]"
            >
              Open Money Actions
            </button>
          </div>
        </div>
      )}
    </DashboardPanel>
  );
}

function GoalsProgressPanel({ life }: { life: LifeStats }) {
  const goals = getGoalRows(life);

  return (
    <DashboardPanel title="Goals & Progress" icon="🏅" action="Smart goals">
      <div className="grid gap-3 sm:grid-cols-2">
        {goals.map((goal) => (
          <div
            key={goal.label}
            className={`rounded-2xl border p-4 ${
              goal.done
                ? "border-green-500/20 bg-green-500/10"
                : "border-zinc-800 bg-zinc-950/80"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500/10 text-lg">
                  {goal.icon}
                </span>
                <div>
                  <p className="font-black text-white">{goal.label}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {goal.done ? "Completed" : `${goal.progress}% complete`}
                  </p>
                </div>
              </div>
              {goal.done && <span className="text-green-300">✓</span>}
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-900">
              <div
                className={`h-full rounded-full ${goal.done ? "bg-green-400" : "bg-orange-500"}`}
                style={{ width: `${Math.min(100, Math.max(0, goal.progress))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </DashboardPanel>
  );
}

function FinancialSnapshotPanel({ life, monthlyIncome }: { life: LifeStats; monthlyIncome: number }) {
  const monthlySalary = life.jobId === "unemployed" ? 0 : Math.floor(life.salary / 12);
  const monthlyPassive =
    getRentalIncomeEstimate(life) +
    getPartTimeIncome(life) +
    (life.business !== "None" ? Math.floor(life.businessRevenue * 0.25 / 12) : 0);
  const monthlyExpenses =
    getHousingCost(life) +
    getAssetUpkeep(life) +
    getDebtInterest(life) +
    (life.business !== "None" ? Math.floor((life.businessPayroll || 0) / 12) : 0);
  const totalMonthlyIncome = monthlySalary + monthlyPassive;
  const monthlySavings = totalMonthlyIncome - monthlyExpenses;
  const monthlyNet = monthlySavings;
  const savingsRate =
    totalMonthlyIncome > 0 ? Math.max(0, Math.min(100, Math.round((monthlySavings / totalMonthlyIncome) * 100))) : 0;

  const cashFlowItems = [
    { label: "Income", value: totalMonthlyIncome, tone: "green" },
    { label: "Expenses", value: monthlyExpenses, tone: "red" },
    { label: "Net", value: monthlySavings, tone: monthlySavings >= 0 ? "green" : "red" },
    { label: "Debt", value: life.debt, tone: "purple" },
    { label: "Assets", value: Math.max(0, life.netWorth), tone: "blue" },
    { label: "Cash", value: life.cash, tone: "green" },
  ];

  const maxValue = Math.max(1, ...cashFlowItems.map((item) => Math.abs(item.value)));

  return (
    <DashboardPanel title="Financial Snapshot" icon="3" action="Live data" iconMode="number">
      <div className="grid gap-4 lg:grid-cols-[170px_minmax(0,1fr)]">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <FinanceMini label="Monthly Income" value={formatMoney(monthlyIncome)} tone="green" />
          <FinanceMini label="Monthly Expenses" value={formatMoney(monthlyExpenses)} tone="red" />
          <FinanceMini label="Monthly Net" value={formatMoney(monthlyNet)} tone="blue" />
          <FinanceMini label="Debt" value={formatMoney(life.debt)} tone="purple" />
        </div>

        <div className="rounded-[1.25rem] bg-black/25 p-3.5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Cash Flow</p>
            <p className={`text-xs font-black ${monthlySavings >= 0 ? "text-green-400" : "text-red-400"}`}>
              {monthlySavings >= 0 ? "Savings" : "Deficit"} {savingsRate}%
            </p>
          </div>

          <div className="space-y-2">
            {cashFlowItems.map((item) => {
              const width = Math.max(6, Math.round((Math.abs(item.value) / maxValue) * 100));

              return (
                <div key={item.label} className="grid grid-cols-[72px_minmax(0,1fr)_84px] items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-zinc-500">
                    {item.label}
                  </span>
                  <div className="h-2.5 overflow-hidden rounded-full bg-zinc-900">
                    <div
                      className={`h-full rounded-full ${
                        item.tone === "green"
                          ? "bg-green-500"
                          : item.tone === "red"
                            ? "bg-red-500"
                            : item.tone === "blue"
                              ? "bg-blue-500"
                              : "bg-purple-500"
                      }`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="truncate text-right text-[11px] font-black text-zinc-300">
                    {formatMoney(item.value)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-xl bg-green-500/10 px-3 py-2 text-green-300">
              <b>Income</b><br />{formatMoney(monthlyIncome)}
            </div>
            <div className="rounded-xl bg-red-500/10 px-3 py-2 text-red-300">
              <b>Expenses</b><br />{formatMoney(monthlyExpenses)}
            </div>
            <div className="rounded-xl bg-orange-500/10 px-3 py-2 text-orange-300">
              <b>Net</b><br />{formatMoney(monthlySavings)}
            </div>
          </div>

          <p className="mt-4 text-xs leading-5 text-zinc-400">
            Salary, business income, rent, expenses, and debt interest are calculated each month.
          </p>
        </div>
      </div>
    </DashboardPanel>
  );
}

function FinanceMini({ label, value, tone }: { label: string; value: string; tone: "green" | "red" | "blue" | "purple" }) {
  const color =
    tone === "green"
      ? "text-green-400"
      : tone === "red"
        ? "text-red-400"
        : tone === "blue"
          ? "text-blue-400"
          : "text-purple-400";

  return (
    <div className="rounded-2xl bg-black/30 p-3">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className={`mt-1 text-lg font-black ${color}`}>{value}</p>
    </div>
  );
}

function StorySoFarPanel({ life }: { life: LifeStats }) {
  const recent = life.yearNotes.slice(-2).reverse();

  return (
    <DashboardPanel title="Your Story So Far" icon="4" iconMode="number">
      <div className="space-y-3">
        <StoryChapter icon="✅" title="A New Beginning" text="Your journey starts here." meta={`Age ${life.age}`} done />
        <StoryChapter icon="✅" title="Received Starting Funds" text="You received $2,500 to begin your journey." meta={`Age ${life.age}`} done />
        <StoryChapter icon="🟠" title="First Decisions" text={recent[0] || "The choices you make now shape your future."} meta="Current" current />
        <StoryChapter icon="🔒" title="Building Momentum" text="Keep learning, working, and growing." meta="Locked" />
        <StoryChapter icon="🔒" title="Creating Legacy" text="Build wealth, impact, and a life you're proud of." meta="Locked" />
      </div>
      <button className="mt-4 w-full rounded-2xl border border-orange-500/25 bg-orange-500/10 px-4 py-3 text-xs font-black text-orange-400">
        View Full Story →
      </button>
    </DashboardPanel>
  );
}

function StoryChapter({
  icon,
  title,
  text,
  meta,
  done,
  current,
}: {
  icon: string;
  title: string;
  text: string;
  meta: string;
  done?: boolean;
  current?: boolean;
}) {
  return (
    <div className="grid grid-cols-[28px_1fr_auto] gap-3 text-sm">
      <div className={`grid h-7 w-7 place-items-center rounded-full ${done ? "bg-green-500/15 text-green-400" : current ? "bg-orange-500/15 text-orange-400" : "bg-zinc-800 text-zinc-500"}`}>
        {icon}
      </div>
      <div>
        <p className={`font-black ${current ? "text-orange-300" : "text-zinc-200"}`}>{title}</p>
        <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-zinc-500">{text}</p>
      </div>
      <p className="text-xs font-bold text-zinc-500">{meta}</p>
    </div>
  );
}

function FocusForYearPanel({
  life,
  netWorthProgress,
  onOpenActions,
}: {
  life: LifeStats;
  netWorthProgress: number;
  onOpenActions: (page: ActionPage) => void;
}) {
  const weakest = [
    ["Health", life.health, "🙂"],
    ["Happiness", life.happiness, "😊"],
    ["Social", life.friendships, "👥"],
  ].sort((a, b) => Number(a[1]) - Number(b[1]))[0];

  return (
    <DashboardPanel title="Focus For This Month" icon="5" iconMode="number">
      <p className="mb-4 text-sm leading-6 text-zinc-400">
        Follow this strategy to build a strong foundation for success.
      </p>
      <div className="space-y-3">
        <FocusAction icon="💼" title="Get a Stable Income" description="Secure a part-time job to build cash flow." impact="High Impact" onClick={() => onOpenActions("apply")} />
        <FocusAction icon={String(weakest[2])} title={`Improve ${weakest[0]}`} description="Small stat improvements make future choices safer." impact="Medium Impact" onClick={() => onOpenActions("lifeGrowth")} />
        <FocusAction icon="📈" title="Build Your Net Worth" description={`Current progress to $10k: ${netWorthProgress}%.`} impact="High Impact" onClick={() => onOpenActions("money")} />
      </div>
      <button className="mt-4 w-full rounded-2xl border border-orange-500/25 bg-orange-500/10 px-4 py-3 text-xs font-black text-orange-400">
        View Strategy Guide →
      </button>
    </DashboardPanel>
  );
}

function FocusAction({
  icon,
  title,
  description,
  impact,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  impact: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="grid w-full grid-cols-[38px_1fr] gap-3 rounded-2xl bg-black/25 p-3 text-left transition hover:bg-zinc-900/80 min-[1500px]:grid-cols-[38px_1fr_auto] min-[1500px]:items-center">
      <div className="grid h-9 w-9 place-items-center rounded-2xl bg-orange-500/10 text-lg">{icon}</div>
      <div>
        <p className="text-sm font-black text-zinc-100">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-zinc-500">{description}</p>
      </div>
      <span className="mt-2 w-fit rounded-full bg-green-500/10 px-2 py-1 text-[10px] font-black uppercase text-green-400 min-[1500px]:mt-0">
        {impact}
      </span>
    </button>
  );
}

function MilestonesUnlocksPanel({
  life,
  monthsPlayed,
  hasJob,
  educationDone,
  netWorthProgress,
  legacyScore,
}: {
  life: LifeStats;
  monthsPlayed: number;
  hasJob: boolean;
  educationDone: boolean;
  netWorthProgress: number;
  legacyScore: number;
}) {
  const milestones = [
    ["🧭", "Getting Started", "Begin your journey", true],
    ["⚡", "First Steps", "Survive 10 months", monthsPlayed >= 10],
    ["💼", "Hustler", "Get employed", hasJob],
    ["🎓", "Educated", "Complete school", educationDone],
    ["📈", "Investor", "Reach $10k net worth", netWorthProgress >= 100],
    ["👑", "Legend", "Reach legacy status", legacyScore >= 10000],
  ] as const;

  return (
    <DashboardPanel title="Milestones & Unlocks" icon="🏆">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {milestones.map(([icon, title, text, unlocked]) => (
            <div key={title} className="relative rounded-3xl border border-zinc-800/70 bg-black/25 p-3 text-center">
              <div className={`mx-auto grid h-12 w-12 place-items-center rounded-2xl border ${unlocked ? "border-orange-500/60 bg-orange-500/15 text-orange-300" : "border-zinc-700 bg-zinc-900 text-zinc-600"}`}>
                {unlocked ? icon : "🔒"}
              </div>
              <p className="mt-3 text-xs font-black text-zinc-200">{title}</p>
              <p className="mt-1 text-[11px] leading-4 text-zinc-500">{text}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Next Unlock</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-zinc-700 bg-black/25 text-2xl">🔒</div>
            <div>
              <p className="font-black text-white">First Steps</p>
              <p className="text-xs text-zinc-500">Survive 10 months</p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-900">
            <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min(100, monthsPlayed * 10)}%` }} />
          </div>
          <div className="mt-3 flex justify-between text-xs font-bold text-zinc-500">
            <span>{monthsPlayed} / 10</span>
            <span>Reward: 150 XP</span>
          </div>
        </div>
      </div>
    </DashboardPanel>
  );
}

function StoryTimelinePanel({ life }: { life: LifeStats }) {
  return (
    <div className="space-y-5">
      {life.lifetimeMilestones.length > 0 && (
        <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4">
          <h3 className="mb-2 text-sm font-black text-orange-300">
            Legacy Milestones
          </h3>
          <div className="space-y-1">
            {life.lifetimeMilestones.map((milestone) => (
              <p key={milestone} className="text-sm text-zinc-300">
                • {milestone}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-4">
        {[
          ["Year 1", "The Beginning", "Your journey starts here."],
          ["Year 5", "Looking Ahead", "Many paths unfold."],
          ["Year 10", "Life in Motion", "Big decisions shape your future."],
          ["Year 20", "Legacy", "The choices you made become your story."],
        ].map(([year, title, description], index) => (
          <div
            key={year}
            className={`rounded-2xl border p-4 ${
              index === 0
                ? "border-orange-500/40 bg-orange-500/10"
                : "border-zinc-800 bg-zinc-950"
            }`}
          >
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-400">
              {year}
            </p>
            <p className="mt-2 font-black text-white">{title}</p>
            <p className="mt-1 text-sm leading-5 text-zinc-400">{description}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {life.eventLog.map((event, index) => (
          <p
            key={`${event}-${index}`}
            className="rounded-2xl bg-zinc-900 p-3 text-sm leading-6 text-zinc-300"
          >
            {event}
          </p>
        ))}
      </div>
    </div>
  );
}


function EconomyPage({
  life,
  economy,
  updateLife,
}: {
  life: LifeStats;
  economy: EconomyBreakdown;
  updateLife: (life: LifeStats) => void;
}) {
  const monthlySalary = life.jobId === "unemployed" ? 0 : Math.floor(life.salary / 12);
  const partTimeIncome = getPartTimeIncome(life);
  const totalMonthlyIncome =
    monthlySalary +
    partTimeIncome +
    economy.businessIncomeEstimate +
    economy.rentalIncomeEstimate;
  const monthlyNet = totalMonthlyIncome - economy.totalExpenses;
  const debtRatio = economy.totalAssets > 0 ? Math.round((life.debt / Math.max(1, economy.totalAssets)) * 100) : life.debt > 0 ? 100 : 0;
  const safetyMonths = economy.totalExpenses > 0 ? Math.floor(life.cash / Math.max(1, economy.totalExpenses)) : 99;
  const monthlyPassive = economy.businessIncomeEstimate + economy.rentalIncomeEstimate - economy.assetUpkeep - economy.propertyManagerFees;
  const hasNoExpenses = economy.totalExpenses <= 0;
  const financeStatus =
    life.debt > economy.totalAssets && life.debt > 0
      ? "Debt pressure"
      : monthlyNet >= 5000
        ? "Growing fast"
        : monthlyNet >= 0
          ? "Healthy"
          : "Bleeding cash";
  const nextMoneyGoal =
    life.debt > 0
      ? "Pay down debt before interest eats your progress."
      : life.jobId === "unemployed" && life.business === "None"
        ? "Get a job or build a business so money starts coming in every month."
        : economy.totalExpenses <= 0
          ? "You have no monthly bills yet. This is a great time to save or invest."
          : monthlyNet >= 0
            ? "You are earning more than you spend. Build assets and protect your cash buffer."
            : "Expenses are higher than income. Cut costs or create a new income source.";

  const incomeLines = [
    {
      emoji: "💼",
      label: "Job salary",
      value: monthlySalary,
      description: life.jobId === "unemployed" ? "No full-time job yet." : "Paid automatically every month.",
    },
    {
      emoji: "🧰",
      label: "Part-time work",
      value: partTimeIncome,
      description: (life.partTimeJobs || []).length === 0 ? "No active side job." : "Extra monthly work income.",
    },
    {
      emoji: "🏢",
      label: "Business profit",
      value: economy.businessIncomeEstimate,
      description: life.business === "None" ? "No active business yet." : `Estimated monthly profit. Annual revenue base: ${formatMoney(life.businessRevenue)}.`,
    },
    {
      emoji: "🏠",
      label: "Rental income",
      value: economy.rentalIncomeEstimate,
      description: `${economy.occupiedRentals} occupied · ${economy.vacantRentals} vacant`,
    },
  ];

  const expenseLines = [
    {
      emoji: "🛏️",
      label: "Housing",
      value: economy.housingCost,
      description: life.currentHousing.type === "none" ? "No selected housing." : `${life.currentHousing.name} monthly cost.`,
    },
    {
      emoji: "🧽",
      label: "Asset upkeep",
      value: economy.assetUpkeep,
      description: "Cars and homes slowly cost money to maintain.",
    },
    {
      emoji: "💳",
      label: "Debt interest",
      value: economy.debtInterest,
      description: life.debt <= 0 ? "No debt right now." : "Monthly debt pressure.",
    },
    {
      emoji: "🧑‍💼",
      label: "Manager fees",
      value: economy.propertyManagerFees,
      description: "Property managers take a cut of rent.",
    },
  ];

  return (
    <TabCard title="Money">
      <div className="overflow-hidden rounded-[2rem] border border-orange-500/25 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_34%),linear-gradient(180deg,rgba(17,17,20,0.98),rgba(5,5,7,0.98))]">
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-400">💰 Money Map</p>
              <h2 className="mt-2 text-3xl font-black text-white">{financeStatus}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                Your monthly money loop: income lands, bills leave, debt adds pressure, and assets build freedom. The goal is simple: keep monthly net positive and turn cash into things that earn for you.
              </p>
            </div>

            <div className={`rounded-3xl px-5 py-4 text-right shadow-lg ${monthlyNet >= 0 ? "bg-green-500/15 shadow-green-950/20" : "bg-red-500/15 shadow-red-950/20"}`}>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Monthly net</p>
              <p className={`text-3xl font-black ${monthlyNet >= 0 ? "text-green-300" : "text-red-300"}`}>{formatMoney(monthlyNet)}</p>
              <p className="mt-1 text-xs font-bold text-zinc-500">after income and bills</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl bg-black/25 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">💵 Cash</p>
              <p className="mt-1 text-xl font-black text-white">{formatMoney(life.cash)}</p>
              <p className="mt-1 text-xs text-zinc-500">your safety buffer</p>
            </div>
            <div className="rounded-2xl bg-black/25 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">👑 Net worth</p>
              <p className="mt-1 text-xl font-black text-white">{formatMoney(life.netWorth)}</p>
              <p className="mt-1 text-xs text-zinc-500">cash + assets - debt</p>
            </div>
            <div className="rounded-2xl bg-black/25 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">🏦 Assets</p>
              <p className="mt-1 text-xl font-black text-white">{formatMoney(economy.totalAssets)}</p>
              <p className="mt-1 text-xs text-zinc-500">things you own</p>
            </div>
            <div className="rounded-2xl bg-black/25 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">💳 Debt</p>
              <p className={`mt-1 text-xl font-black ${life.debt > 0 ? "text-red-300" : "text-white"}`}>{formatMoney(life.debt)}</p>
              <p className="mt-1 text-xs text-zinc-500">future pressure</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-orange-500/20 bg-orange-500/10 p-4">
              <p className="text-sm font-black text-white">🎯 Money goal right now</p>
              <p className="mt-1 text-sm leading-6 text-zinc-300">{nextMoneyGoal}</p>
            </div>
            <div className="grid grid-cols-3 overflow-hidden rounded-3xl border border-zinc-800 bg-black/25">
              <div className="p-4">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-green-400">🟢 Income</p>
                <p className="mt-1 text-lg font-black text-white">{formatMoney(totalMonthlyIncome)}</p>
              </div>
              <div className="border-x border-zinc-800 p-4">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-red-300">🔴 Bills</p>
                <p className="mt-1 text-lg font-black text-white">{formatMoney(economy.totalExpenses)}</p>
              </div>
              <div className="p-4">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-orange-300">🧲 Passive</p>
                <p className="mt-1 text-lg font-black text-white">{formatMoney(monthlyPassive)}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-zinc-400">
            <span className="rounded-full bg-black/30 px-3 py-2">🛡️ Safety: {safetyMonths >= 99 ? "No monthly bills" : `${safetyMonths} month buffer`}</span>
            <span className="rounded-full bg-black/30 px-3 py-2">⚖️ Debt/assets: {debtRatio}%</span>
            <span className="rounded-full bg-black/30 px-3 py-2">🌱 Passive year: {formatMoney(economy.netPassiveYear)}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-400">⚡ Money moves</p>
            <h3 className="mt-1 text-2xl font-black text-white">Pick your next financial move</h3>
            <p className="mt-1 text-sm text-zinc-400">Loans give speed. Debt payments give freedom. Investing tries to grow spare cash.</p>
          </div>
          <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-black text-orange-300">Energy + money matter</span>
        </div>

        <div className="mt-5 grid gap-3 xl:grid-cols-3">
          <div className="rounded-[1.7rem] border border-orange-500/20 bg-[linear-gradient(135deg,rgba(249,115,22,0.16),rgba(0,0,0,0.2))] p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏦</span>
              <div>
                <p className="font-black text-white">Take Loan</p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">Get cash instantly, but future months become heavier. Limit: {formatMoney(getLoanLimit(life))}.</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[25, 50, 100, 200].map((percent) => (
                <button
                  key={percent}
                  onClick={() => updateLife(takeLoan(life, percent))}
                  className="rounded-2xl border border-orange-500/20 bg-black/35 px-2 py-3 text-xs font-black text-orange-100 transition hover:border-orange-400 hover:bg-orange-500 hover:text-black active:scale-[0.98]"
                >
                  {percent}%
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[1.7rem] border border-red-500/20 bg-[linear-gradient(135deg,rgba(239,68,68,0.15),rgba(0,0,0,0.22))] p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💳</span>
              <div>
                <p className="font-black text-white">Pay Debt</p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">Lower interest, reduce pressure, and make your monthly story cleaner. Debt: {formatMoney(life.debt)}.</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map((percent) => (
                <button
                  key={percent}
                  onClick={() => updateLife(payDebt(life, percent))}
                  className="rounded-2xl border border-red-500/20 bg-black/35 px-2 py-3 text-xs font-black text-red-100 transition hover:border-red-400 hover:bg-red-500 hover:text-white active:scale-[0.98]"
                >
                  {percent}%
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => updateLife(invest(life))}
            className="group rounded-[1.7rem] border border-green-500/20 bg-[linear-gradient(135deg,rgba(34,197,94,0.16),rgba(0,0,0,0.22))] p-4 text-left transition hover:border-green-400/50 hover:bg-green-500/15 active:scale-[0.99]"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">📈</span>
              <div>
                <p className="font-black text-white">Invest</p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">Try to turn spare cash into growth. Finance skill, intelligence, and luck decide how clean the play is.</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-green-500/15 px-4 py-3 text-sm font-black text-green-200 transition group-hover:bg-green-500 group-hover:text-black">
              Make investment →
            </div>
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-400">📒 Economy ledger</p>
            <h3 className="mt-1 text-2xl font-black text-white">Where the money comes from and goes</h3>
          </div>
          <p className={`text-2xl font-black ${monthlyNet >= 0 ? "text-green-400" : "text-red-300"}`}>{formatMoney(monthlyNet)}</p>
        </div>

        <div className="mt-5 grid gap-6 xl:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center justify-between text-sm font-black">
              <span className="text-green-300">🟢 Income streams</span>
              <span className="text-green-400">{formatMoney(totalMonthlyIncome)}</span>
            </div>
            <div className="space-y-2">
              {incomeLines.map((line) => (
                <div key={line.label} className="flex items-center justify-between gap-3 rounded-2xl bg-black/25 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-white">{line.emoji} {line.label}</p>
                    <p className="truncate text-xs text-zinc-500">{line.description}</p>
                  </div>
                  <p className="shrink-0 text-sm font-black text-green-400">{formatMoney(line.value)}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between text-sm font-black">
              <span className="text-red-300">🔴 Monthly bills</span>
              <span className="text-red-300">{formatMoney(economy.totalExpenses)}</span>
            </div>
            <div className="space-y-2">
              {expenseLines.map((line) => (
                <div key={line.label} className="flex items-center justify-between gap-3 rounded-2xl bg-black/25 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-white">{line.emoji} {line.label}</p>
                    <p className="truncate text-xs text-zinc-500">{line.description}</p>
                  </div>
                  <p className="shrink-0 text-sm font-black text-red-300">{formatMoney(line.value)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TabCard>
  );
}

function SettingsPage({
  life,
  updateLife,
  onNewLife,
}: {
  life: LifeStats;
  updateLife: (life: LifeStats) => void;
  onNewLife?: () => void;
}) {
  const settings = normalizeGameSettings(life);
  const [importText, setImportText] = useState("");
  const [showImportBox, setShowImportBox] = useState(false);

  const toggleSetting = (key: keyof NonNullable<LifeStats["settings"]>) => {
    updateLife(updateGameSettings(life, { [key]: !settings[key] } as Partial<NonNullable<LifeStats["settings"]>>));
  };

  const exportSave = () => {
    const data = JSON.stringify(life, null, 2);
    navigator.clipboard?.writeText(data);
    updateLife({
      ...life,
      popupMessage: "Save exported. It was copied to your clipboard.",
      yearNotes: [
        ...(life.yearNotes || []),
        "Save data exported from Settings.",
      ].slice(-8),
    });
  };

  const importSave = () => {
    try {
      const parsed = JSON.parse(importText) as LifeStats;
      if (!parsed || typeof parsed !== "object" || typeof parsed.name !== "string") {
        throw new Error("Invalid save");
      }
      updateLife({
        ...parsed,
        settings: {
          ...normalizeGameSettings(parsed),
          ...(parsed.settings || {}),
        },
        popupMessage: "Save imported successfully.",
      });
      setImportText("");
      setShowImportBox(false);
    } catch {
      updateLife({
        ...life,
        popupMessage: "Import failed. The save text was not valid.",
      });
    }
  };

  const resetCurrentLife = () => {
    const confirmed = window.confirm("Reset this life and start over? This cannot be undone.");
    if (confirmed && onNewLife) {
      onNewLife();
    }
  };

  return (
    <TabCard title="Settings">
      <div className="space-y-4">
        <section className="rounded-[2rem] bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.14),transparent_34%),linear-gradient(135deg,rgba(14,18,27,0.98),rgba(6,8,13,0.98))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.38)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">⚙️ Player control menu</p>
              <h2 className="mt-1 text-3xl font-black text-white">Settings</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                Control save data, gameplay feedback, display options, notifications, help, and beta testing tools.
              </p>
            </div>
            <div className="rounded-2xl bg-black/28 px-4 py-3">
              <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-zinc-500">Pre-Alpha version</p>
              <p className="mt-1 text-xl font-black text-orange-300">{GAME_VERSION_LABEL}</p>
            </div>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-2">
          <SettingsSection title="Save & Data" eyebrow="💾 Data control" description="Keep, move, or reset your local save. Export is useful while the game is still using browser storage.">
            <div className="grid gap-2 sm:grid-cols-2">
              <SettingsButton label="Manual Save" helper="Forces the current save to local storage." onClick={() => updateLife({ ...life, popupMessage: "Manual save complete." })} />
              <SettingsButton label="Export Save" helper="Copies your save as text." onClick={exportSave} />
              <SettingsButton label={showImportBox ? "Hide Import" : "Import Save"} helper="Paste exported save text." onClick={() => setShowImportBox(!showImportBox)} />
              <SettingsButton danger label="Start New Life" helper="Reset and create a new character." onClick={resetCurrentLife} />
            </div>
            {showImportBox ? (
              <div className="mt-4 rounded-2xl bg-black/24 p-3">
                <textarea
                  value={importText}
                  onChange={(event) => setImportText(event.target.value)}
                  placeholder="Paste exported save text here..."
                  className="min-h-32 w-full resize-y rounded-2xl bg-black/40 p-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
                />
                <button onClick={importSave} className="mt-3 rounded-2xl bg-green-500 px-4 py-2 text-sm font-black text-black transition hover:bg-green-400">
                  Import Save
                </button>
              </div>
            ) : null}
          </SettingsSection>

          <SettingsSection title="Difficulty" eyebrow="🎮 Game rules" description="Difficulty is chosen at character creation. This page explains what it means for your run.">
            <div className="rounded-2xl bg-black/24 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Current difficulty</p>
              <p className="mt-1 text-3xl font-black text-white">{life.difficulty}</p>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Easy is more forgiving, Normal is balanced, and Hard is stricter with money, stress, and chances.
              </p>
            </div>
          </SettingsSection>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <SettingsSection title="Gameplay" eyebrow="⚙️ Game feedback" description="Choose how much the game explains and confirms while you play.">
            <SettingsToggle label="Show monthly recap" helper="Shows the month summary after Next Month." checked={settings.showMonthlyRecap} onClick={() => toggleSetting("showMonthlyRecap")} />
            <SettingsToggle label="Show life feed" helper="Keeps the activity feed visible." checked={settings.showLifeFeed} onClick={() => toggleSetting("showLifeFeed")} />
            <SettingsToggle label="Confirm risky actions" helper="Useful later for high-risk choices." checked={settings.confirmRiskyActions} onClick={() => toggleSetting("confirmRiskyActions")} />
            <SettingsToggle label="Compact mode" helper="Makes some sections tighter on smaller screens." checked={settings.compactMode} onClick={() => toggleSetting("compactMode")} />
          </SettingsSection>

          <SettingsSection title="Display" eyebrow="🎨 UI options" description="Small visual options for readability and comfort.">
            <SettingsToggle label="Reduce animations" helper="Less motion and visual movement." checked={settings.reduceAnimations} onClick={() => toggleSetting("reduceAnimations")} />
            <SettingsToggle label="High contrast mode" helper="Makes important text stronger." checked={settings.highContrastMode} onClick={() => toggleSetting("highContrastMode")} />
            <SettingsToggle label="Large buttons" helper="Better for mobile and touch screens." checked={settings.largeButtons} onClick={() => toggleSetting("largeButtons")} />
            <SettingsToggle label="Simple text mode" helper="Shorter and simpler descriptions." checked={settings.simpleTextMode} onClick={() => toggleSetting("simpleTextMode")} />
            <div className="mt-3 rounded-2xl bg-black/24 p-3">
              <p className="text-sm font-black text-white">Currency format</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateLife(updateGameSettings(life, { currencyFormat: "compact" }))}
                  className={`rounded-xl px-3 py-2 text-xs font-black ${settings.currencyFormat === "compact" ? "bg-orange-500 text-black" : "bg-black/30 text-zinc-400"}`}
                >
                  $1.2M
                </button>
                <button
                  onClick={() => updateLife(updateGameSettings(life, { currencyFormat: "full" }))}
                  className={`rounded-xl px-3 py-2 text-xs font-black ${settings.currencyFormat === "full" ? "bg-orange-500 text-black" : "bg-black/30 text-zinc-400"}`}
                >
                  $1,200,000
                </button>
              </div>
            </div>
          </SettingsSection>
        </div>

        <SettingsSection title="Notifications" eyebrow="🔔 Alerts" description="Control what the game should notify you about. This helps prevent spam as the game grows.">
          <div className="grid gap-2 md:grid-cols-2">
            <SettingsToggle label="Achievement popups" helper="Show popup when achievements unlock." checked={settings.showAchievementPopups} onClick={() => toggleSetting("showAchievementPopups")} />
            <SettingsToggle label="Money warnings" helper="Warn when economy becomes risky." checked={settings.moneyWarnings} onClick={() => toggleSetting("moneyWarnings")} />
            <SettingsToggle label="Health warnings" helper="Warn when health becomes dangerous." checked={settings.healthWarnings} onClick={() => toggleSetting("healthWarnings")} />
            <SettingsToggle label="Business alerts" helper="Show business-related notices." checked={settings.businessAlerts} onClick={() => toggleSetting("businessAlerts")} />
            <SettingsToggle label="Relationship alerts" helper="Show family/friend/partner notices." checked={settings.relationshipAlerts} onClick={() => toggleSetting("relationshipAlerts")} />
          </div>
        </SettingsSection>

        <SettingsSection title="Beta Testing Tools" eyebrow="🧪 Tester menu" description="Use these tools to quickly test systems without grinding. These are for Pre-Alpha testing and balancing.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <BetaToolCard title="Cash" emoji="💵" description="Add or remove money to test shops, assets, debt, and businesses.">
              <div className="grid grid-cols-2 gap-2">
                <BetaButton label="+$10k" onClick={() => updateLife(betaAddCash(life, 10000))} />
                <BetaButton label="+$100k" onClick={() => updateLife(betaAddCash(life, 100000))} />
                <BetaButton label="+$1M" onClick={() => updateLife(betaAddCash(life, 1000000))} />
                <BetaButton label="-$10k" onClick={() => updateLife(betaAddCash(life, -10000))} />
              </div>
            </BetaToolCard>

            <BetaToolCard title="Age & XP" emoji="⭐" description="Jump through age/level progression for testing long games.">
              <div className="grid grid-cols-2 gap-2">
                <BetaButton label="+1 Age" onClick={() => updateLife(betaSetAge(life, life.age + 1))} />
                <BetaButton label="+10 Age" onClick={() => updateLife(betaSetAge(life, life.age + 10))} />
                <BetaButton label="Age 18" onClick={() => updateLife(betaSetAge(life, 18))} />
                <BetaButton label="+500 XP" onClick={() => updateLife(betaAddXP(life, 500))} />
              </div>
            </BetaToolCard>

            <BetaToolCard title="Stats" emoji="🧬" description="Adjust character stats to test gates and events.">
              <div className="grid grid-cols-2 gap-2">
                <BetaButton label="+Health" onClick={() => updateLife(betaAdjustStat(life, "health", 10))} />
                <BetaButton label="-Health" onClick={() => updateLife(betaAdjustStat(life, "health", -10))} />
                <BetaButton label="+Happy" onClick={() => updateLife(betaAdjustStat(life, "happiness", 10))} />
                <BetaButton label="-Stress" onClick={() => updateLife(betaAdjustStat(life, "stress", -10))} />
                <BetaButton label="+Smarts" onClick={() => updateLife(betaAdjustStat(life, "smarts", 10))} />
                <BetaButton label="+Energy" onClick={() => updateLife(betaAdjustStat(life, "energy", 25))} />
              </div>
            </BetaToolCard>

            <BetaToolCard title="Debt" emoji="💳" description="Test debt, loans, interest, and money warnings.">
              <div className="grid grid-cols-2 gap-2">
                <BetaButton label="Clear debt" onClick={() => updateLife(betaClearDebt(life))} />
                <BetaButton label="+$25k debt" onClick={() => updateLife({ ...life, debt: life.debt + 25000, netWorth: life.netWorth - 25000, popupMessage: "Beta tool: added $25,000 debt." })} />
                <BetaButton label="+$100k debt" onClick={() => updateLife({ ...life, debt: life.debt + 100000, netWorth: life.netWorth - 100000, popupMessage: "Beta tool: added $100,000 debt." })} />
                <BetaButton label="Kill cash" onClick={() => updateLife({ ...life, cash: 0, popupMessage: "Beta tool: cash set to $0." })} />
              </div>
            </BetaToolCard>
          </div>
          <p className="mt-4 rounded-2xl bg-orange-500/10 px-4 py-3 text-xs leading-5 text-orange-200">
            Beta tools are intentionally powerful. They should stay in Settings for testers and balancing, not in normal gameplay pages.
          </p>
        </SettingsSection>

        <SettingsSection title="How ChargedLife Works" eyebrow="📖 Help" description="Quick explanations for the main systems.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <HelpCard title="Months & aging" text="Each Next Month advances the calendar. Every 12 months, your age increases." />
            <HelpCard title="XP & levels" text="You gain XP from progress, achievements, jobs, education, money milestones, and systems." />
            <HelpCard title="Money & bills" text="Income comes in monthly. Housing, upkeep, debt, and managers can create expenses." />
            <HelpCard title="Businesses" text="Businesses can grow, generate income, use managers, and later become part of a holding company." />
            <HelpCard title="Real estate" text="Properties can be owned, rented, improved, managed, and affected by condition or tenants." />
            <HelpCard title="Holding companies" text="A late-game parent company that sits above multiple businesses for automation and bonuses." />
          </div>
        </SettingsSection>

        <SettingsSection title="Pre-Alpha Info" eyebrow="⚡ ChargedLife" description="Development information for testers.">
          <div className="grid gap-3 md:grid-cols-3">
            <InfoTile label="Version" value={GAME_VERSION_LABEL} />
            <InfoTile label="Stage" value="Pre-Alpha" />
            <InfoTile label="Creator" value="Cooldwater Studio" />
          </div>
          <p className="mt-4 text-sm leading-6 text-zinc-400">
            ChargedLife is still early. Saves may change, balancing will move around, and beta tools are included so systems can be tested faster.
          </p>
        </SettingsSection>
      </div>
    </TabCard>
  );
}

function SettingsSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.8rem] bg-[linear-gradient(135deg,rgba(17,24,39,0.88),rgba(6,8,13,0.98))] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.24)]">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">{eyebrow}</p>
      <h3 className="mt-1 text-2xl font-black text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SettingsButton({
  label,
  helper,
  onClick,
  danger = false,
}: {
  label: string;
  helper: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl p-4 text-left transition active:scale-[0.98] ${
        danger ? "bg-red-500/12 hover:bg-red-500/18" : "bg-black/24 hover:bg-white/[0.06]"
      }`}
    >
      <p className={`text-sm font-black ${danger ? "text-red-300" : "text-white"}`}>{label}</p>
      <p className="mt-1 text-xs leading-5 text-zinc-500">{helper}</p>
    </button>
  );
}

function SettingsToggle({
  label,
  helper,
  checked,
  onClick,
}: {
  label: string;
  helper: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="mb-2 flex w-full items-center justify-between gap-4 rounded-2xl bg-black/24 p-4 text-left transition hover:bg-white/[0.055] active:scale-[0.99]">
      <div>
        <p className="text-sm font-black text-white">{label}</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">{helper}</p>
      </div>
      <span className={`grid h-7 w-14 shrink-0 place-items-center rounded-full text-xs font-black ${checked ? "bg-green-500 text-black" : "bg-zinc-800 text-zinc-500"}`}>
        {checked ? "ON" : "OFF"}
      </span>
    </button>
  );
}

function BetaToolCard({
  title,
  emoji,
  description,
  children,
}: {
  title: string;
  emoji: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[1.5rem] bg-black/24 p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-orange-500/12 text-2xl">{emoji}</div>
        <div>
          <p className="font-black text-white">{title}</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function BetaButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="rounded-xl bg-white/[0.055] px-3 py-2 text-xs font-black text-zinc-200 transition hover:bg-orange-500 hover:text-black active:scale-[0.98]">
      {label}
    </button>
  );
}

function HelpCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-black/24 p-4">
      <p className="text-sm font-black text-white">{title}</p>
      <p className="mt-2 text-xs leading-5 text-zinc-500">{text}</p>
    </div>
  );
}

function InfoTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-black/24 p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function EconomyPill({
  emoji,
  label,
  value,
  danger = false,
}: {
  emoji: string;
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-black/25 px-4 py-3">
      <span className="text-xl">{emoji}</span>
      <div>
        <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-zinc-500">{label}</p>
        <p className={`text-sm font-black ${danger ? "text-red-300" : "text-white"}`}>{value}</p>
      </div>
    </div>
  );
}

function CashflowNumber({
  emoji,
  label,
  value,
  tone,
}: {
  emoji: string;
  label: string;
  value: string;
  tone: "green" | "red";
}) {
  return (
    <div className="rounded-2xl bg-black/25 p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{emoji} {label}</p>
      <p className={`mt-1 text-xl font-black ${tone === "green" ? "text-green-400" : "text-red-300"}`}>{value}</p>
    </div>
  );
}

function HealthLine({
  emoji,
  label,
  value,
}: {
  emoji: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-zinc-800/70 pb-3 last:border-b-0 last:pb-0">
      <p className="text-sm font-bold text-zinc-300">{emoji} {label}</p>
      <p className="text-sm font-black text-white">{value}</p>
    </div>
  );
}

function MoneyLedger({
  title,
  total,
  lines,
  type,
}: {
  title: string;
  total: string;
  lines: { emoji: string; label: string; value: number; description: string }[];
  type: "income" | "expense";
}) {
  return (
    <div className="rounded-[1.8rem] border border-zinc-800 bg-zinc-950/75 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-black text-white">{title}</h3>
        <span className={`text-sm font-black ${type === "income" ? "text-green-400" : "text-red-300"}`}>{total}</span>
      </div>

      <div className="mt-4 divide-y divide-zinc-800/70">
        {lines.map((line) => (
          <MoneyLine key={line.label} {...line} type={type} />
        ))}
      </div>
    </div>
  );
}

function MoneyLine({
  emoji,
  label,
  value,
  description,
  type,
}: {
  emoji: string;
  label: string;
  value: number;
  description: string;
  type: "income" | "expense";
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="flex gap-3">
        <span className="mt-0.5 text-lg">{emoji}</span>
        <div>
          <p className="text-sm font-black text-white">{label}</p>
          <p className="mt-0.5 text-xs leading-5 text-zinc-500">{description}</p>
        </div>
      </div>

      <p className={`shrink-0 text-sm font-black ${type === "income" ? "text-green-400" : "text-red-300"}`}>
        {formatMoney(value)}
      </p>
    </div>
  );
}

function ActionsRouter({
  life,
  actionPage,
  setActionPage,
  selectedJobCategory,
  setSelectedJobCategory,
  selectedSchoolCategory,
  setSelectedSchoolCategory,
  selectedAssetCategory,
  setSelectedAssetCategory,
  updateLife,
}: {
  life: LifeStats;
  actionPage: ActionPage;
  setActionPage: (page: ActionPage) => void;
  selectedJobCategory: JobCategory | null;
  setSelectedJobCategory: (category: JobCategory | null) => void;
  selectedSchoolCategory: SchoolCategory | null;
  setSelectedSchoolCategory: (category: SchoolCategory | null) => void;
  selectedAssetCategory: AssetCategory;
  setSelectedAssetCategory: (category: AssetCategory) => void;
  updateLife: (life: LifeStats) => void;
}) {
  const [financePanel, setFinancePanel] = useState<"none" | "payDebt" | "takeLoan">("none");

  if (actionPage === "lifeGrowth" || actionPage === "selfImprovement") {
    return (
      <ActionSubPage title="Life & Growth" onBack={() => setActionPage("main")}>
        <p className="mb-4 text-sm leading-6 text-zinc-400">
          Improve health, happiness, social life, and personal growth.
        </p>

        <div className="space-y-5">
          {lifeGrowthCategories.map((category) => {
            const actions = lifeGrowthActions.filter(
              (action) => action.category === category.id
            );

            return (
              <div key={category.id}>
                <h4 className="text-lg font-black">{category.label}</h4>
                <p className="mb-3 mt-1 text-sm text-zinc-500">
                  {category.description}
                </p>

                <div className="space-y-3">
                  {actions.map((action) => (
                    <LifeGrowthButton
                      key={action.id}
                      action={action}
                      onClick={() => updateLife(doLifeGrowth(life, action))}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ActionSubPage>
    );
  }

  if (actionPage === "relationships") {
    const partnerLabel =
      life.relationshipStatus === "Single"
        ? "No lover yet"
        : `${life.partnerName || "Partner"} • ${life.relationshipStatus}`;
    const childrenList = life.childrenNames || [];

    return (
      <ActionSubPage title="Relationships" onBack={() => setActionPage("main")}>
        <div className="rounded-[2rem] border border-orange-500/25 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.14),transparent_32%),linear-gradient(180deg,rgba(20,20,24,0.98),rgba(10,10,12,0.98))] p-5 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-400">
            Social Life
          </p>
          <h3 className="mt-2 text-3xl font-black text-white">Your people matter</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Family, friends, love, and children all shape your happiness, stress, and long-term legacy.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MainStat label="Family Bond" value={`${life.familyRelationship}/100`} />
            <MainStat label="Friendships" value={`${life.friendships}/100`} />
            <MainStat label="Love Life" value={life.relationshipStatus} />
            <MainStat label="Children" value={`${life.children}`} />
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          <RelationshipProfileCard
            icon="👨‍👩‍👧"
            title="Parents"
            subtitle="The family you came from"
            rows={[
              ["Mother", life.parentNames?.mother || "Maria"],
              ["Father", life.parentNames?.father || "Thomas"],
              ["Relationship", `${life.familyRelationship}/100`],
            ]}
          />

          <RelationshipProfileCard
            icon="💘"
            title="Lover"
            subtitle="Dating, marriage, and partnership"
            rows={[
              ["Status", life.relationshipStatus],
              ["Partner", partnerLabel],
              ["Quality", `${life.relationshipQuality}/100`],
            ]}
          />

          <RelationshipProfileCard
            icon="🧒"
            title="Children"
            subtitle="Your next generation"
            rows={
              childrenList.length > 0
                ? childrenList.map((name, index) => [`Child ${index + 1}`, name])
                : [["Children", "None yet"]]
            }
          />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[1.75rem] border border-zinc-800 bg-zinc-950/80 p-5">
            <h3 className="text-2xl font-black text-white">Relationship Actions</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              These actions are not only social. They also help manage stress and happiness.
            </p>

            <div className="mt-4 space-y-3">
              <ActionButton
                title="Spend Time With Family"
                description="Costs $250. Improves family relationship, happiness, and lowers stress."
                onClick={() => updateLife(improveFamily(life))}
              />

              <ActionButton
                title="Make Friends"
                description="Costs $350. Improves friendships, charisma, happiness, and lowers stress."
                onClick={() => updateLife(makeFriends(life))}
              />

              <ActionButton
                title={
                  life.relationshipStatus === "Single"
                    ? "Go Dating"
                    : "Spend Time With Partner"
                }
                description={
                  life.relationshipStatus === "Single"
                    ? "Chance to start a relationship."
                    : `Spend time with ${life.partnerName}.`
                }
                onClick={() => updateLife(dateLife(life))}
              />
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-zinc-800 bg-zinc-950/80 p-5">
            <h3 className="text-2xl font-black text-white">Life Milestones</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Bigger relationship choices can shape your story permanently.
            </p>

            <div className="mt-4 space-y-3">
              <ActionButton
                title="Propose Marriage"
                description="Only works if you are dating someone."
                onClick={() => updateLife(proposeMarriage(life))}
              />

              <ActionButton
                title="Have Child"
                description="Only works if married. Children now appear by name in your relationship page."
                onClick={() => updateLife(haveChild(life))}
              />
            </div>

            <div className="mt-4 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4 text-sm leading-6 text-orange-100">
              <span className="font-black text-orange-300">Tip:</span> Strong relationships can offset stress from work, school, and business.
            </div>
          </div>
        </div>
      </ActionSubPage>
    );
  }

  if (actionPage === "assets") {
    return (
      <ActionSubPage title="Assets & Housing" onBack={() => setActionPage("main")}>
        <AssetsHub
          life={life}
          updateLife={updateLife}
          selectedCategory={selectedAssetCategory}
          setSelectedCategory={setSelectedAssetCategory}
        />
      </ActionSubPage>
    );
  }

  if (actionPage === "school") {
    if (!selectedSchoolCategory) {
      const schoolIconMap: Record<string, string> = {
        business: "📊",
        medical: "🩺",
        law: "⚖️",
        tech: "💻",
        finance: "💰",
        realEstate: "🏘️",
        creative: "🎨",
        engineering: "⚙️",
      };

      return (
        <ActionSubPage title="School" onBack={() => setActionPage("main")}>
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <StudentLoanPanel life={life} updateLife={updateLife} />

            <div className="rounded-[2rem] bg-zinc-950/55 p-5">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-400">
                Education Plan
              </p>
              <h3 className="mt-2 text-2xl font-black text-white">Choose your school path</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                School can unlock better careers, but it costs money and adds stress. Student loans can help if you qualify.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <MainStat label="Education" value={life.education} />
                <MainStat label="Active Degree" value={getDegreeName(life.activeDegreeId)} />
                <MainStat label="Stress" value={`${life.stress}/100`} />
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {schoolCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedSchoolCategory(category.id)}
                className="group rounded-[1.5rem] border border-zinc-800 bg-zinc-950/80 p-4 text-left transition hover:-translate-y-0.5 hover:border-orange-400/60 hover:bg-zinc-900 active:scale-[0.99]"
              >
                <SchoolVisual icon={schoolIconMap[category.id] || "🎓"} />
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-black text-white">{category.label}</p>
                    <p className="mt-1 text-sm leading-5 text-zinc-400">{category.description}</p>
                  </div>
                  <span className="text-zinc-500 transition group-hover:translate-x-1 group-hover:text-orange-400">›</span>
                </div>
                <span className="mt-3 inline-flex rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-xs font-black text-orange-300">
                  {degreePrograms.filter((degree) => degree.schoolCategory === category.id).length} programs
                </span>
              </button>
            ))}
          </div>
        </ActionSubPage>
      );
    }

    const selectedSchool = schoolCategories.find(
      (category) => category.id === selectedSchoolCategory
    );

    const visibleDegrees = degreePrograms.filter(
      (degree) => degree.schoolCategory === selectedSchoolCategory
    );

    return (
      <ActionSubPage
        title={selectedSchool?.label || "School"}
        onBack={() => setSelectedSchoolCategory(null)}
      >
        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <StudentLoanPanel life={life} updateLife={updateLife} />
          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-400">
              Programs
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">{selectedSchool?.label || "School"}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Pick a program and study over time. Progress, cost, and requirements are shown on each card.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 xl:grid-cols-2">
          {visibleDegrees.map((degree) => (
            <DegreeButton
              key={degree.id}
              life={life}
              degree={degree}
              onClick={() => updateLife(attendDegree(life, degree))}
            />
          ))}
        </div>
      </ActionSubPage>
    );
  }

  if (actionPage === "oddJobs") {
    const oddJobs = [
      {
        icon: "📦",
        title: "Warehouse Shift",
        description: "A quick manual shift. Reliable cash, a little stress.",
        action: () => updateLife(work(life)),
      },
      {
        icon: "🚗",
        title: "Delivery Run",
        description: "Deliver orders for fast starter income.",
        action: () => updateLife(work(life)),
      },
      {
        icon: "🧹",
        title: "Cleaning Job",
        description: "Low skill work. Good if you need money right now.",
        action: () => updateLife(work(life)),
      },
      {
        icon: "🎪",
        title: "Event Helper",
        description: "One-day event work. Builds a little charisma and cash.",
        action: () => updateLife(work(life)),
      },
    ];

    return (
      <ActionSubPage title="Odd Jobs" onBack={() => setActionPage("career")}>
        <div className="rounded-[2rem] bg-zinc-950/55 p-5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-400">
            Quick Work
          </p>
          <h3 className="mt-2 text-2xl font-black text-white">Choose an odd job</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Odd jobs are short-term work for quick cash. They cost energy and are not a replacement for a full-time career.
          </p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {oddJobs.map((job) => (
            <CareerActionCard
              key={job.title}
              icon={job.icon}
              title={job.title}
              description={job.description}
              onClick={job.action}
            />
          ))}
        </div>
      </ActionSubPage>
    );
  }

  if (actionPage === "career") {
    const activePartTimeJobs = (life.partTimeJobs || [])
      .map((jobId) => getPartTimeJobById(jobId))
      .filter((job): job is NonNullable<ReturnType<typeof getPartTimeJobById>> => !!job);

    return (
      <ActionSubPage title="Career" onBack={() => setActionPage("main")}>
        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-orange-500/20 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_34%),linear-gradient(180deg,rgba(20,20,24,0.98),rgba(10,10,12,0.98))] p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-400">
              Career Hub
            </p>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-3xl font-black text-white">
                  {life.job === "Unemployed" ? "Build your first income" : life.job}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                  {life.job === "Unemployed"
                    ? "Start with part-time jobs, improve your skills, or apply for a full-time role."
                    : `Salary: ${formatMoney(Math.floor(life.salary / 12))}/month pays automatically when you advance to next month.`}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedJobCategory(null);
                  setActionPage("apply");
                }}
                className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-black transition hover:bg-orange-400 active:scale-[0.98]"
              >
                Apply for Job →
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <MainStat label="Current Job" value={life.job} />
              <MainStat label="Salary" value={formatMoney(life.salary)} />
              <MainStat label="Career XP" value={`${life.careerXp}`} />
              <MainStat label="Stress" value={`${life.stress}/100`} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-400">
              Balance
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">Stress & Recovery</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Work and school can raise stress. Vacations, relationships, and stable housing help bring it down.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <MainStat label="Current Stress" value={`${life.stress}/100`} />
              <ActionButton
                title="Take Vacation"
                description="Spend money to reduce stress, improve happiness, and protect your health."
                onClick={() => updateLife(takeVacation(life))}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          <CareerActionCard
            icon="💼"
            title={life.job === "Unemployed" ? "Do Odd Jobs" : "Improve Performance"}
            description={
              life.job === "Unemployed"
                ? "Open a list of odd jobs for quick cash while unemployed."
                : "Salary is automatic monthly. Use this to build promotion progress and career XP."
            }
            onClick={() => life.job === "Unemployed" ? setActionPage("oddJobs") : updateLife(focusAtWork(life))}
          />
          <CareerActionCard
            icon="🤝"
            title="Network at Work"
            description="Build charisma, reputation, and workplace relationships with low stress."
            onClick={() => updateLife(networkAtWork(life))}
          />
          <CareerActionCard
            icon="⭐"
            title="Ask for Promotion"
            description="Ask your boss for the next role in your career path."
            onClick={() => updateLife(chasePromotion(life))}
          />
          {life.jobId !== "unemployed" && (
            <CareerActionCard
              icon="🚪"
              title="Quit Full-Time Job"
              description="Leave your current job. Reduces stress, but removes salary."
              onClick={() => updateLife(quitFullTimeJob(life))}
            />
          )}
          <CareerActionCard
            icon="🧾"
            title="Apply for Job"
            description="Open job categories and apply for a full-time career."
            onClick={() => {
              setSelectedJobCategory(null);
              setActionPage("apply");
            }}
          />
          <CareerActionCard
            icon="🌴"
            title="Take Vacation"
            description="Recover from stress and protect your long-term health."
            onClick={() => updateLife(takeVacation(life))}
          />
        </div>

      </ActionSubPage>
    );
  }

  if (actionPage === "apply") {
    if (!selectedJobCategory) {
      return (
        <ActionSubPage title="Apply for Job" onBack={() => setActionPage("career")}>
          <div className="rounded-[2rem] bg-orange-500/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-400">
              Job Directory
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">Choose work type</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Apply for a full-time career or take part-time jobs for extra monthly income.
            </p>
          </div>

          <div className="mt-4 rounded-[2rem] bg-zinc-950/55 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-400">
                  Part-Time Jobs
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">
                  Small jobs before the big career
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                  Hold up to 2 part-time jobs. Work them once per month for extra income.
                </p>
              </div>
              <div className="rounded-2xl bg-black/30 px-4 py-3 text-right">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-zinc-500">Active</p>
                <p className="mt-1 text-lg font-black text-white">{(life.partTimeJobs || []).length}/2</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {partTimeJobOptions.map((job) => {
                const active = (life.partTimeJobs || []).includes(job.id);

                return (
                  <button
                    key={job.id}
                    onClick={() => updateLife(active ? quitPartTimeJob(life, job.id) : takePartTimeJob(life, job.id))}
                    className={`rounded-2xl p-4 text-left transition ${
                      active
                        ? "bg-green-500/10 hover:bg-green-500/15"
                        : "bg-black/25 hover:bg-zinc-900/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-black text-white">{job.name}</p>
                      <span className="rounded-full bg-orange-500/10 px-2 py-1 text-xs font-black text-orange-300">
                        {formatMoney(job.pay)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-5 text-zinc-400">{job.description}</p>
                    <p className="mt-3 text-xs text-zinc-500">
                      Stress +{job.stressGain} • Discipline +{job.disciplineGain}
                    </p>
                    <span className={`mt-3 block rounded-xl px-3 py-2 text-center text-xs font-black ${
                      active ? "bg-green-500 text-black" : "bg-orange-500 text-black"
                    }`}>
                      {active ? "Quit Part-Time" : "Take Job"}
                    </span>
                  </button>
                );
              })}
            </div>

            {(life.partTimeJobs || []).length > 0 && (
              <button
                onClick={() => updateLife(workPartTimeJobs(life))}
                className="mt-4 w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-black transition hover:bg-orange-400 active:scale-[0.98]"
              >
                Work Part-Time Jobs
              </button>
            )}
          </div>

          <h3 className="mb-3 mt-6 text-lg font-black">Full-time careers</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {jobCategories.map((category) => (
              <DirectoryCard
                key={category.id}
                icon="💼"
                title={category.label}
                description={category.description}
                detail={`${jobs.filter((job) => job.category === category.id).length} jobs`}
                onClick={() => setSelectedJobCategory(category.id)}
              />
            ))}
          </div>
        </ActionSubPage>
      );
    }

    const selectedCategory = jobCategories.find(
      (category) => category.id === selectedJobCategory
    );

    const visibleJobs = jobs.filter(
      (job) => job.category === selectedJobCategory
    );

    return (
      <ActionSubPage
        title={selectedCategory?.label || "Apply for Job"}
        onBack={() => setSelectedJobCategory(null)}
      >
        <div className="grid gap-3 xl:grid-cols-2">
          {visibleJobs.map((job) => (
            <JobApplyButton
              key={job.id}
              life={life}
              job={job}
              onClick={() => updateLife(applyForJob(life, job))}
            />
          ))}
        </div>
      </ActionSubPage>
    );
  }

  if (actionPage === "money") {
    const hasBusiness = life.business !== "None";
    const businessType = getBusinessTypeById(life.businessTypeId);
    const businessStageName = getBusinessStageName(life.businessStage);
    const riskLabel = getBusinessRiskLabel(life.businessRisk);
    const ownedBusinesses = life.businesses || [];

    return (
      <ActionSubPage
        title="Business Hub"
        onBack={() => setActionPage("main")}
      >
        {!hasBusiness ? (
          <div className="rounded-[1.6rem] border border-orange-500/25 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_34%),linear-gradient(180deg,rgba(20,20,24,0.98),rgba(9,9,11,0.98))] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-400">
                  Start a Business
                </p>
                <h3 className="mt-1 text-2xl font-black text-white">Choose your first company</h3>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-400">
                  Pick a business type. Product businesses like Game Studio, Minecraft Server, Mobile App, and Roblox Game use the new lifecycle system.
                </p>
              </div>
              <span className="rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-black text-orange-300">
                Pre-Alpha business
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {businessTypes.map((type) => (
                <BusinessTypeCard
                  key={type.id}
                  type={type}
                  canAfford={life.cash >= type.startCost}
                  onClick={() => updateLife(startBusiness(life, type.id))}
                />
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-zinc-800 bg-black/25 p-4">
              <p className="text-sm font-black text-zinc-100">Money actions moved out</p>
              <p className="mt-1 text-sm leading-6 text-zinc-400">
                Loans, debt payments, and investing live in the Economy overview. The Business Hub is now focused on building companies, launching products, hiring staff, and managing risk.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-[1.6rem] border border-orange-500/25 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_34%),linear-gradient(180deg,rgba(20,20,24,0.98),rgba(9,9,11,0.98))] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-400">
                    Active Business
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-white">{life.business}</h3>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-400">
                    {businessType?.category || "Business"} • {businessStageName} • {riskLabel} risk. You are the owner. Choose this month’s move, protect cashflow, and grow without letting risk destroy the company.
                  </p>
                </div>
                <span className="rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-black text-orange-300">
                  {ownedBusinesses.length} owned
                </span>
              </div>

              <BusinessHeroPanel life={life} />
            </div>

            <BusinessRecommendedNextMove life={life} />
            <BusinessPortfolioAutomationPanel life={life} updateLife={updateLife} />
            {isProductBusinessType(life.businessTypeId) && <BusinessLifecycleTimeline life={life} />}
            {life.businessTypeId === "real-estate-company" && (
              <RealEstateCompanyPanel life={life} updateLife={updateLife} />
            )}
            <BusinessActionCenter life={life} updateLife={updateLife} />

            <details className="rounded-[1.6rem] border border-zinc-800/80 bg-zinc-950/70 p-4">
              <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.18em] text-zinc-400">
                🧳 More business options
              </summary>
              <div className="mt-4 space-y-4">
                {ownedBusinesses.length > 1 && (
                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-orange-300">
                      🗂️ Your companies
                    </p>
                    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                      {ownedBusinesses.map((business) => (
                        <BusinessPortfolioCard
                          key={business.id}
                          business={business}
                          active={business.id === life.activeBusinessId}
                          onClick={() => updateLife(selectBusiness(life, business.id))}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <BusinessFinanceTools life={life} updateLife={updateLife} />
                <BusinessMarketPanel life={life} updateLife={updateLife} />

                <details className="rounded-[1.4rem] border border-zinc-800 bg-black/20 p-4">
                  <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.18em] text-zinc-400">
                    📊 Deep stats & milestones
                  </summary>
                  <div className="mt-4">
                    <BusinessSpecialStatsPanel life={life} />
                    {isProductBusinessType(life.businessTypeId) && (
                      <BusinessProductLifecyclePanel life={life} updateLife={updateLife} compact />
                    )}
                    <BusinessMilestonesPanel life={life} />
                  </div>
                </details>

                <div className="rounded-[1.4rem] bg-red-500/5 p-4 shadow-inner shadow-red-950/10">
                  <ActionButton
                    title="💰 Sell Active Business"
                    description="Sell only the company you are currently managing. Your other companies stay owned."
                    onClick={() => updateLife(sellBusiness(life))}
                  />
                </div>
              </div>
            </details>
          </div>
        )}
      </ActionSubPage>
    );
  }

  return (
    <>
      <div className="mb-4 rounded-2xl bg-zinc-950/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-white">Energy</p>
            <p className="mt-1 text-xs text-zinc-500">
              {life.energy ?? MAX_ENERGY}/100 • {getEnergyStatus(life)}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-black ${
            (life.energy ?? MAX_ENERGY) < 15
              ? "bg-red-500/15 text-red-300"
              : (life.energy ?? MAX_ENERGY) < 45
                ? "bg-yellow-500/15 text-yellow-300"
                : "bg-green-500/15 text-green-300"
          }`}>
            {getEnergyStatus(life)}
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-900">
          <div
            className={`h-full rounded-full ${
              (life.energy ?? MAX_ENERGY) < 15
                ? "bg-red-500"
                : (life.energy ?? MAX_ENERGY) < 45
                  ? "bg-yellow-400"
                  : "bg-green-400"
            }`}
            style={{ width: `${Math.max(0, Math.min(100, life.energy ?? MAX_ENERGY))}%` }}
          />
        </div>
      </div>

      {life.yearNotes.length > 0 && (
        <div className="mb-4 rounded-2xl bg-zinc-900 p-4">
          <h3 className="mb-2 text-sm font-black text-zinc-300">This Month</h3>

          <div className="space-y-2">
            {life.yearNotes.map((note, index) => (
              <p key={`${note}-${index}`} className="text-sm text-zinc-400">
                {note}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <ActionCategory
          title="Life & Growth"
          description="Health, happiness, social life, and personal growth."
          onClick={() => setActionPage("lifeGrowth")}
        />

        <ActionCategory
          title="Relationships"
          description="Family, friends, dating, marriage, and kids."
          onClick={() => setActionPage("relationships")}
        />

        <ActionCategory
          title="Assets & Housing"
          description="Rent, buy homes, buy cars, tenants, and property management."
          onClick={() => setActionPage("assets")}
        />

        <ActionCategory
          title="School"
          description="Student loans, degrees, and education paths."
          onClick={() => {
            setSelectedSchoolCategory(null);
            setActionPage("school");
          }}
        />

        <ActionCategory
          title="Career"
          description="Work, ask for promotion, or apply for jobs."
          onClick={() => setActionPage("career")}
        />

        <ActionCategory
          title="Business & Investing"
          description="Debt, loans, business, investing, and risk."
          onClick={() => setActionPage("money")}
        />
      </div>
    </>
  );
}


function AssetsHub({
  life,
  updateLife,
  selectedCategory,
  setSelectedCategory,
}: {
  life: LifeStats;
  updateLife: (life: LifeStats) => void;
  selectedCategory: AssetCategory;
  setSelectedCategory: (category: AssetCategory) => void;
}) {
  const propertyValue = (life.ownedHomes || []).reduce(
    (total, home) => total + Math.floor(home.value),
    0
  );
  const vehicleValue = (life.ownedCars || []).reduce(
    (total, car) => total + Math.floor(car.value),
    0
  );
  const itemValue = getItemValue(life);
  const rentalIncome = getRentalIncomeEstimate(life);
  const occupiedHomes = (life.ownedHomes || []).filter(
    (home) => home.rentedOut && home.rentalStatus === "Occupied"
  ).length;
  const vacantRentals = (life.ownedHomes || []).filter(
    (home) => home.rentedOut && home.rentalStatus !== "Occupied"
  ).length;

  const categories: {
    id: AssetCategory;
    icon: string;
    title: string;
    description: string;
    value: string;
  }[] = [
    {
      id: "overview",
      icon: "◫",
      title: "Overview",
      description: "Your full asset picture",
      value: formatMoney(getAssetValue(life)),
    },
    {
      id: "properties",
      icon: "⌂",
      title: "Properties",
      description: "Homes, rent, tenants & conditions",
      value: `${life.ownedHomes.length} owned`,
    },
    {
      id: "vehicles",
      icon: "⛟",
      title: "Vehicles",
      description: "Cars, mechanics & depreciation",
      value: `${life.ownedCars.length} owned`,
    },
    {
      id: "items",
      icon: "◇",
      title: "Items",
      description: "Jewelry, clothes, watches & collectibles",
      value: `${life.ownedItems?.length || 0} owned`,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-[2rem] border border-orange-500/25 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_35%),linear-gradient(135deg,rgba(23,23,27,0.98),rgba(9,9,11,0.98))] p-5 shadow-[0_0_40px_rgba(249,115,22,0.08)] sm:p-6">
        <div className=" absolute inset-y-0 right-0 hidden w-[38%] lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(249,115,22,0.16),transparent_35%),linear-gradient(180deg,transparent,rgba(249,115,22,0.06))]" />
          <div className="absolute bottom-0 right-10 h-28 w-48 rounded-t-[1.5rem] border border-orange-500/15 bg-orange-500/5" />
          <div className="absolute bottom-0 right-24 h-16 w-20 border border-orange-500/10 bg-black/20" />
          <div className="absolute bottom-0 right-48 h-20 w-24 border border-orange-500/10 bg-black/20" />
          <div className="absolute bottom-20 right-12 h-8 w-28 border border-orange-500/10 bg-black/10" />
        </div>

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-orange-500/40 bg-orange-500/10 text-3xl text-orange-400 shadow-[0_0_25px_rgba(249,115,22,0.16)]">
              ⌂
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-400">
                Assets & Housing
              </p>
              <h3 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                Assets & Housing
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                Manage your properties, vehicles, and items. Your assets grow your wealth and shape your lifestyle.
              </p>
            </div>
          </div>

          <button
            onClick={() => updateLife(maintainAssets(life))}
            className="relative z-10 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-black shadow-[0_0_30px_rgba(249,115,22,0.25)] transition hover:bg-orange-400 active:scale-[0.98]"
          >
            Manage All Assets
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`rounded-[1.6rem] border p-5 text-left transition active:scale-[0.99] ${
              selectedCategory === category.id
                ? "border-orange-400 bg-orange-500/12 shadow-[0_0_28px_rgba(249,115,22,0.12)]"
                : "border-zinc-800 bg-zinc-950 hover:border-orange-500/40 hover:bg-zinc-900"
            }`}
          >
            <div className="flex items-center gap-4">
              <span className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl ${selectedCategory === category.id ? "bg-orange-500/15 text-orange-300" : "bg-zinc-900 text-orange-400"}`}>
                {category.icon}
              </span>
              <div className="min-w-0">
                <p className="text-lg font-black text-white">{category.title}</p>
                <p className="mt-1 text-sm leading-5 text-zinc-400">{category.description}</p>
              </div>
            </div>
            <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-orange-400">{category.value}</p>
          </button>
        ))}
      </div>

      {selectedCategory === "overview" && (
        <div className="grid gap-4 xl:grid-cols-3">
          <OverviewAssetCard
            icon="🏘️"
            title="Property Portfolio"
            value={formatMoney(propertyValue)}
            description={`${life.ownedHomes.length} properties • ${occupiedHomes} occupied • ${vacantRentals} vacant`}
            action="Manage Properties"
            onClick={() => setSelectedCategory("properties")}
          />
          <OverviewAssetCard
            icon="🚗"
            title="Vehicle Garage"
            value={formatMoney(vehicleValue)}
            description="Vehicles lose value quickly. Service them before condition drops."
            action="Manage Vehicles"
            onClick={() => setSelectedCategory("vehicles")}
          />
          <OverviewAssetCard
            icon="💎"
            title="Luxury Items"
            value={formatMoney(itemValue)}
            description="Jewelry, clothing, watches, and collectibles can boost reputation."
            action="Manage Items"
            onClick={() => setSelectedCategory("items")}
          />
        </div>
      )}

      {selectedCategory === "properties" && (
        <div className="space-y-5">
          <HousingPanel life={life} updateLife={updateLife} />

          <SectionShell
            title="Your Properties"
            description="You do not own any properties yet. Buy a home from the market if you want to live in it or rent it out."
            icon="⌘"
            action={
              <button
                onClick={() => {
                  const el = document.getElementById("property-market");
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="rounded-full border border-orange-500/40 px-4 py-2 text-sm font-black text-orange-300 transition hover:bg-orange-500/10"
              >
                View Property Market
              </button>
            }
          >
            {life.ownedHomes.length === 0 ? (
              <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950/80 p-4 text-sm text-zinc-500">
                You do not own any properties yet. Buy your first home to start building real estate wealth.
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {life.ownedHomes.map((asset) => (
                  <OwnedHomeCard
                    key={asset.id}
                    home={asset}
                    isCurrentHome={life.currentHousing.homeAssetId === asset.id}
                    onLive={() => updateLife(liveInHome(life, asset.id))}
                    onRentOut={() => updateLife(rentOutHome(life, asset.id))}
                    onStopRenting={() => updateLife(stopRentingOutHome(life, asset.id))}
                    onFindTenant={() => updateLife(findTenant(life, asset.id))}
                    onRentLevel={(level) => updateLife(setHomeRentPriceLevel(life, asset.id, level))}
                    onEnableManager={() => updateLife(enablePropertyManager(life, asset.id))}
                    onDisableManager={() => updateLife(disablePropertyManager(life, asset.id))}
                    onRenovate={() => updateLife(renovateHome(life, asset.id))}
                    onSell={() => updateLife(sellHome(life, asset.id))}
                  />
                ))}
              </div>
            )}
          </SectionShell>

          <SectionShell
            title="Property Market"
            description="Browse and purchase properties. Keep up with maintenance to preserve value and unlock tenant income."
            icon="⌂"
            id="property-market"
          >
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
              {homeShop.map((asset) => (
                <PropertyMarketCard
                  key={asset.id}
                  asset={asset}
                  onClick={() => updateLife(buyHome(life, asset))}
                />
              ))}
            </div>
          </SectionShell>
        </div>
      )}

      {selectedCategory === "vehicles" && (
        <div className="space-y-5">
          <SectionShell
            title="Vehicles"
            description="Cars depreciate every year. If you ignore service for too long, condition drops and resale value falls faster."
            icon="⛟"
          >
            <AssetSection
              title="Your Vehicles"
              emptyText="You do not own any vehicles yet."
              assets={life.ownedCars}
              render={(asset) => (
                <OwnedCarCard
                  key={asset.id}
                  car={asset}
                  onService={() => updateLife(serviceCar(life, asset.id))}
                  onSell={() => updateLife(sellCar(life, asset.id))}
                />
              )}
            />

            <AssetSection
              title="Vehicle Market"
              emptyText="No vehicles available."
              assets={carShop}
              render={(asset) => (
                <MarketAssetCard
                  key={asset.id}
                  asset={asset}
                  actionLabel="Buy Vehicle"
                  onClick={() => updateLife(buyCar(life, asset))}
                />
              )}
            />
          </SectionShell>
        </div>
      )}

      {selectedCategory === "items" && (
        <div className="space-y-5">
          <SectionShell
            title="Items & Luxury Goods"
            description="Buy status items like jewelry, designer clothes, watches, and collectibles. Some hold value, while clothes usually decay faster."
            icon="◇"
          >
            <AssetSection
              title="Your Items"
              emptyText="You do not own any luxury items yet."
              assets={life.ownedItems || []}
              render={(asset) => (
                <OwnedItemCard
                  key={asset.id}
                  item={asset}
                  onSell={() => updateLife(sellItem(life, asset.id))}
                />
              )}
            />

            <AssetSection
              title="Item Market"
              emptyText="No items available."
              assets={itemShop}
              render={(asset) => (
                <MarketAssetCard
                  key={asset.id}
                  asset={asset}
                  actionLabel="Buy Item"
                  onClick={() => updateLife(buyItem(life, asset))}
                />
              )}
            />
          </SectionShell>
        </div>
      )}
    </div>
  );
}

function SectionShell({
  title,
  description,
  icon,
  action,
  children,
  id,
}: {
  title: string;
  description: string;
  icon: string;
  action?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <div id={id} className="rounded-[2rem] border border-zinc-800 bg-[linear-gradient(180deg,rgba(13,13,16,0.98),rgba(8,8,10,0.98))] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-orange-500/10 text-sm text-orange-400">{icon}</span>
            <h3 className="text-2xl font-black text-white">{title}</h3>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">{description}</p>
        </div>
        {action}
      </div>

      <div className="mt-5">{children}</div>
    </div>
  );
}

function OverviewAssetCard({
  icon,
  title,
  value,
  description,
  action,
  onClick,
}: {
  icon: string;
  title: string;
  value: string;
  description: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 text-left transition hover:border-orange-500/60 hover:bg-zinc-900 active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-500/10 text-2xl">
          {icon}
        </span>
        <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-black text-orange-300">
          {action}
        </span>
      </div>
      <p className="mt-4 text-sm font-black uppercase tracking-[0.18em] text-zinc-500">{title}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
    </button>
  );
}



function HousingPanel({
  life,
  updateLife,
}: {
  life: LifeStats;
  updateLife: (life: LifeStats) => void;
}) {
  const currentIsRent = life.currentHousing.type === "rent";
  const currentIsOwned = life.currentHousing.type === "own";
  const currentHome =
    life.currentHousing.homeAssetId
      ? life.ownedHomes.find((home) => home.id === life.currentHousing.homeAssetId)
      : undefined;

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <div className="rounded-[2rem] border border-zinc-800 bg-[linear-gradient(180deg,rgba(12,12,14,0.98),rgba(8,8,10,0.98))] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-orange-500/10 text-sm text-orange-400">⌂</span>
            <h3 className="text-2xl font-black text-white">Current Housing</h3>
          </div>
          <span className="rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400">
            {currentIsOwned ? "Owned Home" : currentIsRent ? "Rental Active" : "No Housing Selected"}
          </span>
        </div>

        <div className="mt-5 rounded-[1.6rem] border border-zinc-800 bg-zinc-950/80 p-5">
          <h4 className="text-3xl font-black text-white">
            {life.currentHousing.type === "none" ? "No housing selected" : life.currentHousing.name}
          </h4>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            {life.currentHousing.type === "none"
              ? "You are currently not living anywhere. Pick a rental below or move into a property you own."
              : currentIsRent
                ? "You are renting this place right now. It gives you a stable living setup and updates your monthly housing cost."
                : "You currently live in one of your owned properties. You can still renovate it or switch homes later."}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <CurrentHousingStat
              label="Housing Type"
              value={life.currentHousing.type === "none" ? "None" : currentIsOwned ? "Owned" : "Rent"}
            />
            <CurrentHousingStat
              label="Monthly Cost"
              value={formatMoney(getHousingCost(life))}
              tone={getHousingCost(life) > 0 ? "warning" : "success"}
            />
            <CurrentHousingStat
              label="Live Status"
              value={currentHome ? currentHome.condition : currentIsRent ? "Occupied" : "Open"}
              tone={currentHome || currentIsRent ? "success" : "neutral"}
            />
          </div>

          <div className="mt-5 rounded-2xl border border-zinc-800 bg-black/20 px-4 py-3 text-sm text-zinc-400">
            <span className="font-black text-orange-300">Tip:</span> Owning a home gives you stability and unlocks tenant income.
          </div>

          {life.currentHousing.type !== "none" && (
            <button
              onClick={() => updateLife(moveOut(life))}
              className="mt-4 rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-black text-zinc-200 transition hover:border-orange-400 hover:bg-zinc-800 active:scale-[0.98]"
            >
              Move Out / No Housing
            </button>
          )}
        </div>
      </div>

      <div className="rounded-[2rem] border border-zinc-800 bg-[linear-gradient(180deg,rgba(12,12,14,0.98),rgba(8,8,10,0.98))] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-orange-500/10 text-sm text-orange-400">⌂</span>
            <h3 className="text-2xl font-black text-white">Rent Housing</h3>
          </div>
          <span className="rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400">
            Choose a place to live
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {housingOptions.map((option, index) => {
            const selected = currentIsRent && life.currentHousing.name === option.name;
            return (
              <RentHousingOptionCard
                key={option.id}
                option={option}
                selected={selected}
                accent={index === 0 ? "city" : index === 1 ? "suburb" : "luxury"}
                onClick={() => updateLife(rentHousing(life, option))}
              />
            );
          })}
        </div>

        <p className="mt-4 text-xs leading-5 text-zinc-500">
          <span className="font-black text-orange-300">ⓘ</span> Rent is paid monthly in advance. Utilities and extras may apply.
        </p>
      </div>
    </div>
  );
}

function CurrentHousingStat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "success" | "warning";
}) {
  const toneClasses =
    tone === "success"
      ? "border-green-500/20 bg-green-500/10"
      : tone === "warning"
        ? "border-orange-500/20 bg-orange-500/10"
        : "border-zinc-800 bg-zinc-900";

  return (
    <div className={`rounded-2xl border p-4 ${toneClasses}`}>
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function RentHousingOptionCard({
  option,
  selected,
  accent,
  onClick,
}: {
  option: HousingOption;
  selected: boolean;
  accent: "city" | "suburb" | "luxury";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-[1.5rem] border p-3 text-left transition active:scale-[0.99] ${
        selected
          ? "border-green-500/50 bg-green-500/10 shadow-[0_0_24px_rgba(34,197,94,0.08)]"
          : "border-zinc-800 bg-zinc-950 hover:border-orange-400 hover:bg-zinc-900"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0">
          <AssetScene variant={accent} sceneName={option.name} compact />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-black text-white">{option.name}</p>
          <p className="mt-1 text-sm leading-5 text-zinc-400">{option.description}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-zinc-500">Monthly Cost</p>
          <p className="mt-1 text-2xl font-black text-white">{formatMoney(Math.floor(option.yearlyCost / 12))}</p>
        </div>
        <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm ${selected ? "border-green-500 bg-green-500 text-black" : "border-zinc-700 text-zinc-500"}`}>
          {selected ? "✓" : "○"}
        </div>
      </div>
    </button>
  );
}

function AssetOverview({ life }: { life: LifeStats }) {
  return (
    <div className="mt-5 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
        Asset Summary
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MainStat label="Asset Value" value={formatMoney(getAssetValue(life))} />
        <MainStat label="Upkeep" value={formatMoney(getAssetUpkeep(life))} />
        <MainStat label="Cars" value={`${life.ownedCars.length}`} />
        <MainStat label="Homes" value={`${life.ownedHomes.length}`} />
      </div>
    </div>
  );
}

function AssetSection({
  title,
  emptyText,
  assets,
  render,
}: {
  title: string;
  emptyText: string;
  assets: OwnedAsset[];
  render: (asset: OwnedAsset) => ReactNode;
}) {
  return (
    <div className="mt-5 rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
      <h3 className="text-lg font-black">{title}</h3>

      {assets.length === 0 ? (
        <p className="mt-3 rounded-2xl bg-zinc-900 p-4 text-sm text-zinc-500">
          {emptyText}
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
          {assets.map((asset) => render(asset))}
        </div>
      )}
    </div>
  );
}


function OwnedCarCard({
  car,
  onService,
  onSell,
}: {
  car: OwnedAsset;
  onService: () => void;
  onSell: () => void;
}) {
  const serviceAge = typeof car.lastServicedAge === "number" ? car.lastServicedAge : null;

  return (
    <div className="rounded-[1.75rem] border border-zinc-800 bg-[linear-gradient(180deg,rgba(26,26,30,1),rgba(16,16,20,1))] p-5 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
      <div className="mb-4">
        <AssetScene variant={previewVariant(car)} sceneName={car.name} />
      </div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <AssetHeader asset={car} />
        <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-black text-zinc-400">
          Service record {serviceAge ?? "Unknown"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <InlineInfoCard label="Vehicle Value" value={formatMoney(car.value)} />
        <InlineInfoCard label="Monthly Upkeep" value={formatMoney(Math.floor(car.upkeep / 12))} />
        <InlineInfoCard label="Condition" value={car.condition} tone={conditionTone(car.condition)} />
      </div>

      <p className="mt-4 rounded-2xl border border-zinc-800 bg-black/25 p-4 text-sm leading-6 text-zinc-400">
        Vehicles lose value faster than most other assets. Regular service helps slow depreciation and keeps resale value stronger.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          onClick={onService}
          className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-black transition hover:bg-orange-400 active:scale-[0.98]"
        >
          Send to Mechanic
        </button>

        <button
          onClick={onSell}
          className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-black text-red-300 transition hover:border-red-400 active:scale-[0.98]"
        >
          Sell Vehicle
        </button>
      </div>
    </div>
  );
}

function OwnedHomeCard({
  home,
  isCurrentHome,
  onLive,
  onRentOut,
  onStopRenting,
  onFindTenant,
  onRentLevel,
  onEnableManager,
  onDisableManager,
  onRenovate,
  onSell,
}: {
  home: OwnedAsset;
  isCurrentHome: boolean;
  onLive: () => void;
  onRentOut: () => void;
  onStopRenting: () => void;
  onFindTenant: () => void;
  onRentLevel: (level: RentPriceLevel) => void;
  onEnableManager: () => void;
  onDisableManager: () => void;
  onRenovate: () => void;
  onSell: () => void;
}) {
  const managerEnabled = !!home.propertyManager?.enabled;
  const listed = !!home.rentedOut;
  const occupied = home.rentalStatus === "Occupied";
  const rentLevel = home.rentPriceLevel || "Market";

  return (
    <div className="rounded-[1.75rem] border border-zinc-800 bg-[linear-gradient(180deg,rgba(26,26,30,1),rgba(16,16,20,1))] p-5 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <AssetHeader asset={home} />
        <div className="flex flex-wrap items-center gap-2">
          {isCurrentHome && (
            <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-black text-green-300">
              You live here
            </span>
          )}
          {listed && (
            <span className={`rounded-full px-3 py-1 text-xs font-black ${occupied ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
              {occupied ? "Tenant active" : "Listed for rent"}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InlineInfoCard label="Property Value" value={formatMoney(home.value)} />
        <InlineInfoCard label="Monthly Upkeep" value={formatMoney(Math.floor(home.upkeep / 12))} />
        <InlineInfoCard label="Condition" value={home.condition} tone={conditionTone(home.condition)} />
        <InlineInfoCard label="Rent Income" value={formatMoney(Math.floor(getAdjustedRentIncome(home) / 12))} tone={occupied ? "success" : "neutral"} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-zinc-800 bg-black/25 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-black text-white">Rental Overview</p>
            <span className="rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400">
              {home.rentalStatus || "Vacant"}
            </span>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <InlineInfoCard label="Rent Level" value={rentLevel} />
            <InlineInfoCard label="Tenant" value={home.tenantName || "No tenant"} tone={occupied ? "success" : "neutral"} />
            <InlineInfoCard label="Tenant Quality" value={home.tenantQuality || "None"} tone={home.tenantQuality === "Bad" || home.tenantQuality === "Risky" ? "warning" : "neutral"} />
            <InlineInfoCard label="Lease" value={`${home.tenantYearsRemaining || 0} year(s)`} />
            <InlineInfoCard label="Manager" value={managerEnabled ? `${home.propertyManager?.feePercent || 10}% fee` : "No manager"} tone={managerEnabled ? "success" : "neutral"} />
            <InlineInfoCard label="Listed" value={listed ? "Yes" : "No"} tone={listed ? "success" : "neutral"} />
          </div>

          {home.lastRentalEventMessage && (
            <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 text-sm leading-6 text-zinc-300">
              <span className="font-black text-orange-300">Latest update:</span> {home.lastRentalEventMessage}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-black/25 p-4">
          <p className="text-sm font-black text-white">Quick Actions</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <button
              onClick={onLive}
              className={`rounded-2xl px-4 py-3 text-sm font-black transition active:scale-[0.98] ${
                isCurrentHome
                  ? "border border-green-500/30 bg-green-500/10 text-green-300"
                  : "border border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-orange-400"
              }`}
            >
              {isCurrentHome ? "Currently Living Here" : "Live Here"}
            </button>

            <button
              onClick={listed ? onStopRenting : onRentOut}
              className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-black transition hover:bg-orange-400 active:scale-[0.98]"
            >
              {listed ? "Stop Renting Out" : "List for Rent"}
            </button>

            <button
              onClick={onFindTenant}
              className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-black text-zinc-200 transition hover:border-orange-400 active:scale-[0.98]"
            >
              Find Tenant
            </button>

            <button
              onClick={managerEnabled ? onDisableManager : onEnableManager}
              className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-black text-zinc-200 transition hover:border-orange-400 active:scale-[0.98]"
            >
              {managerEnabled ? "Remove Manager" : "Hire Manager"}
            </button>

            <button
              onClick={onRenovate}
              className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-black text-zinc-200 transition hover:border-orange-400 active:scale-[0.98]"
            >
              Renovate Property
            </button>

            <button
              onClick={onSell}
              className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-black text-red-300 transition hover:border-red-400 active:scale-[0.98]"
            >
              Sell Property
            </button>
          </div>

          <div className="mt-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Rent pricing</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["Low", "Market", "High"] as RentPriceLevel[]).map((level) => {
                const active = rentLevel === level;
                return (
                  <button
                    key={level}
                    onClick={() => onRentLevel(level)}
                    className={`rounded-xl px-2 py-2 text-xs font-black transition ${
                      active
                        ? level === "Low"
                          ? "bg-green-500/15 text-green-300"
                          : level === "Market"
                            ? "bg-orange-500/15 text-orange-300"
                            : "bg-red-500/15 text-red-300"
                        : "border border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-orange-400"
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OwnedItemCard({
  item,
  onSell,
}: {
  item: OwnedAsset;
  onSell: () => void;
}) {
  return (
    <div className="rounded-[1.75rem] border border-zinc-800 bg-[linear-gradient(180deg,rgba(26,26,30,1),rgba(16,16,20,1))] p-5 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
      <div className="mb-4">
        <AssetScene variant={previewVariant(item)} sceneName={item.name} />
      </div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <AssetHeader asset={item} />
        <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-black text-orange-300">
          {item.rarity || "Premium"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InlineInfoCard label="Item Value" value={formatMoney(item.value)} />
        <InlineInfoCard label="Monthly Care" value={formatMoney(Math.floor(item.upkeep / 12))} />
        <InlineInfoCard label="Condition" value={item.condition} tone={conditionTone(item.condition)} />
        <InlineInfoCard label="Category" value={readableItemCategory(item.itemCategory)} />
      </div>

      <p className="mt-4 rounded-2xl border border-zinc-800 bg-black/25 p-4 text-sm leading-6 text-zinc-400">
        {item.itemCategory === "clothing"
          ? "Clothing improves image and lifestyle, but trends change fast and value falls quicker than jewelry or collectibles."
          : item.itemCategory === "collectible"
            ? "Collectibles are prestige items. They can become signature parts of your lifestyle and may hold value better over time."
            : item.itemCategory === "jewelry"
              ? "Jewelry is a reliable status symbol. It can boost lifestyle and reputation while usually keeping decent long-term value."
              : "Luxury goods can help define your image and make your character feel more established."}
      </p>

      <button
        onClick={onSell}
        className="mt-4 w-full rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-black text-red-300 transition hover:border-red-400 active:scale-[0.98]"
      >
        Sell Item
      </button>
    </div>
  );
}


function PropertyMarketCard({
  asset,
  onClick,
}: {
  asset: OwnedAsset;
  onClick: () => void;
}) {
  const variant = asset.value >= 2000000 ? "luxury" : asset.value >= 700000 ? "suburb" : "city";

  return (
    <div className="overflow-hidden rounded-[1.65rem] border border-zinc-800 bg-[linear-gradient(180deg,rgba(24,24,28,1),rgba(10,10,12,1))] shadow-[0_0_20px_rgba(0,0,0,0.20)] transition hover:border-orange-400/70">
      <div className="p-3 pb-0">
        <AssetScene variant={variant} sceneName={asset.name} />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="mt-1 grid h-9 w-9 place-items-center rounded-full bg-orange-500/15 text-lg text-orange-300">
              ⌂
            </span>
            <div>
              <p className="text-base font-black text-white">{asset.name}</p>
              <p className="mt-0.5 text-sm text-zinc-400">Property</p>
            </div>
          </div>

          <span className="rounded-full bg-zinc-950 px-3 py-1.5 text-sm font-black text-white">
            {formatMoney(asset.value)}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <MiniAssetStat label="Upkeep" value={formatMoney(asset.upkeep)} />
          <MiniAssetStat label="Condition" value={asset.condition} accent={conditionTextColor(asset.condition)} />
          <MiniAssetStat label="Tier" value={marketTag(asset)} />
        </div>

        <button
          onClick={onClick}
          className="mt-4 w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-black transition hover:bg-orange-400 active:scale-[0.99]"
        >
          Buy Property
        </button>
      </div>
    </div>
  );
}

function MarketAssetCard({
  asset,
  actionLabel,
  onClick,
}: {
  asset: OwnedAsset;
  actionLabel: string;
  onClick: () => void;
}) {
  const description = getAssetMarketDescription(asset);

  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-zinc-800 bg-[linear-gradient(180deg,rgba(24,24,28,1),rgba(12,12,14,1))] shadow-[0_0_20px_rgba(0,0,0,0.18)] transition hover:border-orange-400/60">
      <div className="p-3 pb-0">
        <AssetScene variant={previewVariant(asset)} sceneName={asset.name} />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <AssetHeader asset={asset} />
          <span className="rounded-full bg-zinc-950 px-3 py-1 text-sm font-black text-white">
            {formatMoney(asset.value)}
          </span>
        </div>

        <p className="mt-4 min-h-[72px] text-sm leading-6 text-zinc-400">{description}</p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <MiniAssetStat label="Upkeep" value={formatMoney(asset.upkeep)} />
          <MiniAssetStat label="Condition" value={asset.condition} accent={conditionTextColor(asset.condition)} />
          <MiniAssetStat label={asset.type === "car" ? "Class" : asset.type === "item" ? "Category" : "Tier"} value={asset.type === "item" ? readableItemCategory(asset.itemCategory) : marketTag(asset)} />
        </div>

        <button
          onClick={onClick}
          className="mt-4 w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-black transition hover:bg-orange-400 active:scale-[0.99]"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

function MiniAssetStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className={`mt-2 text-base font-black ${accent || "text-white"}`}>{value}</p>
    </div>
  );
}

function AssetScene({
  variant,
  sceneName,
  compact = false,
}: {
  variant: "city" | "suburb" | "luxury";
  sceneName?: string;
  compact?: boolean;
}) {
  const key = (sceneName || "").toLowerCase();
  const scene =
    key.includes("city studio")
      ? "cityStudio"
      : key.includes("starter townhouse")
        ? "starterTownhouse"
        : key.includes("family villa")
          ? "familyVilla"
          : key.includes("luxury estate")
            ? "luxuryEstate"
            : key.includes("studio apartment")
              ? "studioApartment"
              : key.includes("small rental house")
                ? "smallRentalHouse"
                : key.includes("nice rental house")
                  ? "niceRentalHouse"
                  : key.includes("cheap used car")
                    ? "cheapUsedCar"
                    : key.includes("reliable car")
                      ? "reliableCar"
                      : key.includes("sports car")
                        ? "sportsCar"
                        : key.includes("luxury car")
                          ? "luxuryCar"
                          : key.includes("silver ring")
                            ? "silverRing"
                            : key.includes("gold chain")
                              ? "goldChain"
                              : key.includes("designer watch")
                                ? "designerWatch"
                                : key.includes("tailored suit")
                                  ? "tailoredSuit"
                                  : key.includes("luxury wardrobe")
                                    ? "luxuryWardrobe"
                                    : key.includes("rare art piece")
                                      ? "rareArtPiece"
                                      : variant === "luxury"
                                        ? "luxuryEstate"
                                        : variant === "suburb"
                                          ? "familyVilla"
                                          : "cityStudio";

  const titleMap: Record<string, string> = {
    cityStudio: "Apartment",
    studioApartment: "Apartment",
    starterTownhouse: "Townhouse",
    familyVilla: "Home",
    smallRentalHouse: "Home",
    niceRentalHouse: "Home",
    luxuryEstate: "Estate",
    cheapUsedCar: "Vehicle",
    reliableCar: "Vehicle",
    sportsCar: "Sports Car",
    luxuryCar: "Luxury Car",
    silverRing: "Jewelry",
    goldChain: "Jewelry",
    designerWatch: "Watch",
    tailoredSuit: "Clothing",
    luxuryWardrobe: "Fashion",
    rareArtPiece: "Collectible",
  };
  const title = titleMap[scene] || "Asset";

  const skyId = `sky-${scene}-${compact ? "compact" : "full"}`;
  const glowId = `glow-${scene}-${compact ? "compact" : "full"}`;
  const groundId = `ground-${scene}-${compact ? "compact" : "full"}`;

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-2xl border border-orange-500/30 bg-black ${
        compact ? "h-16 w-28" : "h-32 w-full"
      }`}
    >
      <svg viewBox="0 0 200 120" className="h-full w-full" preserveAspectRatio="none" role="img" aria-label={title}>
        <defs>
          <linearGradient id={skyId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2a150a" />
            <stop offset="50%" stopColor="#191d28" />
            <stop offset="100%" stopColor="#06070b" />
          </linearGradient>
          <radialGradient id={glowId} cx="78%" cy="22%" r="45%">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#fb923c" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={groundId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#08101f" />
            <stop offset="100%" stopColor="#04070d" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="200" height="120" fill={`url(#${skyId})`} />
        <rect x="0" y="0" width="200" height="120" fill={`url(#${glowId})`} />
        <circle cx="165" cy="26" r="17" fill="#fb923c" opacity="0.40" />
        <rect x="0" y="78" width="200" height="42" fill={`url(#${groundId})`} />

        {(scene === "cityStudio" || scene === "studioApartment") && (
          <>
            <rect x="18" y="50" width="24" height="44" rx="4" fill="#543625" stroke="#c56a2f" strokeOpacity="0.45" />
            <rect x="48" y="34" width="28" height="60" rx="4" fill="#6a4228" stroke="#c56a2f" strokeOpacity="0.45" />
            <rect x="82" y="58" width="24" height="36" rx="4" fill="#4b3122" stroke="#c56a2f" strokeOpacity="0.45" />
            <rect x="112" y="26" width="32" height="68" rx="4" fill="#73472a" stroke="#c56a2f" strokeOpacity="0.45" />
            <rect x="150" y="42" width="24" height="52" rx="4" fill="#5b3926" stroke="#c56a2f" strokeOpacity="0.45" />
            <g fill="#fed7aa" opacity="0.88">
              <rect x="23" y="58" width="5" height="6" rx="1" /><rect x="31" y="58" width="5" height="6" rx="1" />
              <rect x="23" y="69" width="5" height="6" rx="1" /><rect x="31" y="69" width="5" height="6" rx="1" />
              <rect x="54" y="43" width="5" height="6" rx="1" /><rect x="62" y="43" width="5" height="6" rx="1" />
              <rect x="54" y="55" width="5" height="6" rx="1" /><rect x="62" y="55" width="5" height="6" rx="1" />
              <rect x="54" y="67" width="5" height="6" rx="1" /><rect x="62" y="67" width="5" height="6" rx="1" />
              <rect x="87" y="65" width="5" height="6" rx="1" /><rect x="95" y="65" width="5" height="6" rx="1" />
              <rect x="118" y="36" width="5" height="6" rx="1" /><rect x="126" y="36" width="5" height="6" rx="1" />
              <rect x="118" y="48" width="5" height="6" rx="1" /><rect x="126" y="48" width="5" height="6" rx="1" />
              <rect x="118" y="60" width="5" height="6" rx="1" /><rect x="126" y="60" width="5" height="6" rx="1" />
              <rect x="155" y="51" width="5" height="6" rx="1" /><rect x="163" y="51" width="5" height="6" rx="1" />
              <rect x="155" y="63" width="5" height="6" rx="1" /><rect x="163" y="63" width="5" height="6" rx="1" />
            </g>
          </>
        )}

        {scene === "starterTownhouse" && (
          <>
            <polygon points="28,69 50,50 72,69" fill="#8b3b12" opacity="0.9" />
            <polygon points="64,69 92,44 120,69" fill="#9a4517" opacity="0.92" />
            <polygon points="110,69 138,48 166,69" fill="#7c3410" opacity="0.9" />
            <rect x="28" y="69" width="44" height="30" rx="4" fill="#704428" stroke="#cf7a36" strokeOpacity="0.35" />
            <rect x="64" y="69" width="56" height="32" rx="4" fill="#7a4b2c" stroke="#cf7a36" strokeOpacity="0.35" />
            <rect x="110" y="69" width="56" height="30" rx="4" fill="#674027" stroke="#cf7a36" strokeOpacity="0.35" />
            <rect x="44" y="78" width="10" height="21" rx="2" fill="#27160f" />
            <rect x="86" y="77" width="12" height="24" rx="2" fill="#27160f" />
            <rect x="132" y="78" width="10" height="21" rx="2" fill="#27160f" />
            <g fill="#fed7aa" opacity="0.88">
              <rect x="35" y="77" width="6" height="6" rx="1" /><rect x="58" y="77" width="6" height="6" rx="1" />
              <rect x="74" y="76" width="6" height="6" rx="1" /><rect x="104" y="76" width="6" height="6" rx="1" />
              <rect x="120" y="77" width="6" height="6" rx="1" /><rect x="150" y="77" width="6" height="6" rx="1" />
            </g>
          </>
        )}

        {(scene === "familyVilla" || scene === "smallRentalHouse" || scene === "niceRentalHouse") && (
          <>
            <polygon points="54,72 96,42 138,72" fill="#8a3d14" opacity="0.95" />
            <rect x="36" y="72" width="128" height="34" rx="5" fill="#71462a" stroke="#cf7a36" strokeOpacity="0.40" />
            <rect x="90" y="80" width="18" height="26" rx="2" fill="#27160f" />
            <rect x="52" y="80" width="10" height="10" rx="1" fill="#fed7aa" /><rect x="66" y="80" width="10" height="10" rx="1" fill="#fed7aa" />
            <rect x="124" y="80" width="10" height="10" rx="1" fill="#fed7aa" /><rect x="138" y="80" width="10" height="10" rx="1" fill="#fed7aa" />
            <rect x="20" y="84" width="22" height="22" rx="4" fill="#5c3825" stroke="#cf7a36" strokeOpacity="0.35" />
            <rect x="26" y="90" width="6" height="7" rx="1" fill="#fed7aa" />
            <circle cx="174" cy="84" r="11" fill="#1f5131" />
            <rect x="171" y="90" width="5" height="16" rx="2" fill="#4b2b17" />
          </>
        )}

        {scene === "luxuryEstate" && (
          <>
            <polygon points="46,66 100,34 154,66" fill="#7d3510" opacity="0.95" />
            <rect x="28" y="66" width="144" height="38" rx="6" fill="#6d4329" stroke="#cf7a36" strokeOpacity="0.40" />
            <rect x="92" y="76" width="16" height="28" rx="2" fill="#23130d" />
            <rect x="46" y="71" width="12" height="32" rx="2" fill="#7f5132" /><rect x="142" y="71" width="12" height="32" rx="2" fill="#7f5132" />
            <rect x="68" y="71" width="10" height="30" rx="2" fill="#7f5132" /><rect x="122" y="71" width="10" height="30" rx="2" fill="#7f5132" />
            <g fill="#fed7aa" opacity="0.9">
              <rect x="52" y="76" width="6" height="7" rx="1" /><rect x="52" y="88" width="6" height="7" rx="1" />
              <rect x="72" y="76" width="6" height="7" rx="1" /><rect x="72" y="88" width="6" height="7" rx="1" />
              <rect x="122" y="76" width="6" height="7" rx="1" /><rect x="122" y="88" width="6" height="7" rx="1" />
              <rect x="142" y="76" width="6" height="7" rx="1" /><rect x="142" y="88" width="6" height="7" rx="1" />
            </g>
            <rect x="138" y="90" width="42" height="10" rx="5" fill="#9a5a20" opacity="0.45" />
          </>
        )}

        {(scene === "cheapUsedCar" || scene === "reliableCar" || scene === "sportsCar" || scene === "luxuryCar") && (
          <>
            <rect x="16" y="84" width="168" height="5" rx="2.5" fill="#1f2937" />
            {scene === "cheapUsedCar" && (
              <g>
                <rect x="54" y="62" width="70" height="22" rx="8" fill="#6b7280" stroke="#d1d5db" strokeOpacity="0.25" />
                <polygon points="72,62 88,48 111,48 120,62" fill="#4b5563" />
              </g>
            )}
            {scene === "reliableCar" && (
              <g>
                <rect x="48" y="60" width="86" height="24" rx="10" fill="#2563eb" stroke="#93c5fd" strokeOpacity="0.25" />
                <polygon points="68,60 84,46 112,46 126,60" fill="#1d4ed8" />
              </g>
            )}
            {scene === "sportsCar" && (
              <g>
                <rect x="50" y="64" width="90" height="18" rx="9" fill="#dc2626" stroke="#fecaca" strokeOpacity="0.25" />
                <polygon points="70,64 94,50 122,50 134,64" fill="#b91c1c" />
                <rect x="130" y="66" width="10" height="4" rx="2" fill="#111827" />
              </g>
            )}
            {scene === "luxuryCar" && (
              <g>
                <rect x="44" y="60" width="96" height="24" rx="10" fill="#111827" stroke="#fde68a" strokeOpacity="0.35" />
                <polygon points="66,60 86,44 118,44 134,60" fill="#1f2937" />
                <rect x="132" y="64" width="18" height="8" rx="4" fill="#9ca3af" opacity="0.4" />
              </g>
            )}
            <circle cx="70" cy="86" r="9" fill="#0f172a" /><circle cx="70" cy="86" r="4" fill="#94a3b8" />
            <circle cx="126" cy="86" r="9" fill="#0f172a" /><circle cx="126" cy="86" r="4" fill="#94a3b8" />
          </>
        )}

        {scene === "silverRing" && (
          <>
            <circle cx="100" cy="70" r="26" fill="none" stroke="#d1d5db" strokeWidth="10" />
            <circle cx="100" cy="70" r="14" fill="#0b0f18" />
            <circle cx="122" cy="50" r="8" fill="#e5e7eb" opacity="0.9" />
          </>
        )}
        {scene === "goldChain" && (
          <>
            <path
              d="M48 58 C58 34 142 34 152 58"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="7"
              strokeLinecap="round"
              opacity="0.95"
            />
            <path
              d="M58 62 C70 90 130 90 142 62"
              fill="none"
              stroke="#d97706"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.9"
            />
            <g fill="none" stroke="#fde68a" strokeWidth="4" opacity="0.95">
              <ellipse cx="59" cy="58" rx="9" ry="6" transform="rotate(-25 59 58)" />
              <ellipse cx="76" cy="50" rx="9" ry="6" transform="rotate(-15 76 50)" />
              <ellipse cx="94" cy="47" rx="9" ry="6" />
              <ellipse cx="112" cy="48" rx="9" ry="6" transform="rotate(12 112 48)" />
              <ellipse cx="130" cy="53" rx="9" ry="6" transform="rotate(20 130 53)" />
              <ellipse cx="145" cy="63" rx="9" ry="6" transform="rotate(35 145 63)" />
            </g>
            <circle cx="100" cy="83" r="9" fill="#f59e0b" stroke="#fde68a" strokeWidth="3" />
            <circle cx="100" cy="83" r="3" fill="#7c2d12" opacity="0.7" />
          </>
        )}
        {scene === "designerWatch" && (
          <>
            <rect x="88" y="34" width="24" height="24" rx="6" fill="#d4af37" opacity="0.9" />
            <circle cx="100" cy="70" r="20" fill="#fbbf24" opacity="0.9" />
            <circle cx="100" cy="70" r="11" fill="#111827" />
            <rect x="92" y="14" width="16" height="22" rx="6" fill="#92400e" />
            <rect x="92" y="84" width="16" height="24" rx="6" fill="#92400e" />
          </>
        )}
        {scene === "tailoredSuit" && (
          <>
            <path d="M72 42 L88 34 L100 48 L112 34 L128 42 L120 58 L120 98 L80 98 L80 58 Z" fill="#334155" stroke="#94a3b8" strokeOpacity="0.25" />
            <path d="M92 48 L100 58 L108 48 L104 98 L96 98 Z" fill="#0f172a" />
            <rect x="98" y="56" width="4" height="34" rx="2" fill="#f97316" opacity="0.7" />
          </>
        )}
        {scene === "luxuryWardrobe" && (
          <>
            <rect x="44" y="38" width="112" height="58" rx="8" fill="#6b4a2b" stroke="#eab308" strokeOpacity="0.35" />
            <rect x="54" y="48" width="44" height="38" rx="4" fill="#8b5e34" />
            <rect x="102" y="48" width="44" height="38" rx="4" fill="#7c5530" />
            <rect x="96" y="48" width="4" height="38" rx="2" fill="#3f2b18" />
            <circle cx="92" cy="68" r="2" fill="#fcd34d" /><circle cx="108" cy="68" r="2" fill="#fcd34d" />
          </>
        )}
        {scene === "rareArtPiece" && (
          <>
            <rect x="52" y="28" width="96" height="72" rx="6" fill="#8b5e34" stroke="#fbbf24" strokeOpacity="0.4" />
            <rect x="62" y="38" width="76" height="52" rx="3" fill="#1e293b" />
            <circle cx="118" cy="50" r="10" fill="#fb923c" opacity="0.7" />
            <path d="M68 82 L88 62 L102 76 L118 56 L132 82 Z" fill="#14532d" />
          </>
        )}
      </svg>

      {!compact && (
        <div className="absolute left-4 top-4 rounded-full bg-black/35 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-orange-100">
          {title}
        </div>
      )}
    </div>
  );
}

function previewVariant(asset: OwnedAsset): "city" | "suburb" | "luxury" {
  if (asset.type === "car") return asset.value >= 150000 ? "luxury" : asset.value >= 25000 ? "suburb" : "city";
  if (asset.type === "item") return asset.value >= 30000 ? "luxury" : asset.value >= 7000 ? "suburb" : "city";
  return asset.value >= 2000000 ? "luxury" : asset.value >= 700000 ? "suburb" : "city";
}

function conditionTextColor(condition: AssetCondition) {
  if (condition === "Excellent") return "text-green-300";
  if (condition === "Good") return "text-lime-300";
  if (condition === "Fair") return "text-yellow-300";
  if (condition === "Poor") return "text-orange-300";
  return "text-red-300";
}

function AssetHeader({ asset }: { asset: OwnedAsset }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-zinc-950 text-xl">
        {assetIcon(asset)}
      </span>
      <div>
        <p className="font-black text-white">{asset.name}</p>
        <p className="mt-1 text-sm text-zinc-400">{assetSubtitle(asset)}</p>
      </div>
    </div>
  );
}

function InlineInfoCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "success" | "warning";
}) {
  const toneClasses =
    tone === "success"
      ? "border-green-500/20 bg-green-500/10"
      : tone === "warning"
        ? "border-orange-500/20 bg-orange-500/10"
        : "border-zinc-800 bg-zinc-950/80";

  return (
    <div className={`rounded-2xl border p-3 ${toneClasses}`}>
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-2 text-base font-black text-white">{value}</p>
    </div>
  );
}

function assetIcon(asset: OwnedAsset) {
  if (asset.type === "home") return "🏠";
  if (asset.type === "car") return "🚗";
  if (asset.itemCategory === "jewelry") return "💍";
  if (asset.itemCategory === "clothing") return "🧥";
  if (asset.itemCategory === "collectible") return "🖼️";
  return "💎";
}

function assetSubtitle(asset: OwnedAsset) {
  if (asset.type === "car") return "Vehicle";
  if (asset.type === "home") return "Property";
  return `${asset.rarity || "Premium"} ${readableItemCategory(asset.itemCategory)}`;
}

function readableItemCategory(category?: OwnedAsset["itemCategory"]) {
  if (category === "jewelry") return "Jewelry";
  if (category === "clothing") return "Clothing";
  if (category === "collectible") return "Collectible";
  if (category === "luxury") return "Luxury Good";
  return "Item";
}

function getAssetMarketDescription(asset: OwnedAsset) {
  if (asset.type === "home") {
    return `${asset.name} gives you a stronger housing base and long-term wealth potential. Keep up with maintenance so value and condition stay healthy.`;
  }

  if (asset.type === "car") {
    return `${asset.name} improves your lifestyle and image, but cars lose value over time. Regular service helps protect your resale price.`;
  }

  if (asset.itemCategory === "collectible") {
    return `${asset.name} is a prestige purchase that helps your character feel established. Collectibles can be great lifestyle flex assets.`;
  }

  if (asset.itemCategory === "clothing") {
    return `${asset.name} boosts style and image. Clothing is more about lifestyle and reputation than long-term value growth.`;
  }

  if (asset.itemCategory === "jewelry") {
    return `${asset.name} is a clean luxury pickup that adds status and can usually hold value better than fashion-heavy items.`;
  }

  return `${asset.name} is a premium lifestyle item that adds flavor, status, and a more complete sense of progression.`;
}

function marketTag(asset: OwnedAsset) {
  if (asset.type === "home") {
    if (asset.value >= 2000000) return "Luxury";
    if (asset.value >= 750000) return "Family";
    return "Starter";
  }

  if (asset.type === "car") {
    if (asset.value >= 120000) return "Premium";
    if (asset.value >= 45000) return "Daily";
    return "Starter";
  }

  return asset.rarity || "Premium";
}

function conditionTone(condition: AssetCondition): "neutral" | "success" | "warning" {
  if (condition === "Excellent" || condition === "Good") return "success";
  if (condition === "Bad" || condition === "Poor") return "warning";
  return "neutral";
}

function ConditionBadge({ condition }: { condition: AssetCondition }) {
  const className =
    condition === "Excellent"
      ? "bg-green-500/15 text-green-300"
      : condition === "Good"
        ? "bg-lime-500/15 text-lime-300"
        : condition === "Fair"
          ? "bg-yellow-500/15 text-yellow-300"
          : condition === "Poor"
            ? "bg-orange-500/15 text-orange-300"
            : "bg-red-500/15 text-red-300";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${className}`}>
      {condition}
    </span>
  );
}

function StudentLoanPanel({
  life,
  updateLife,
}: {
  life: LifeStats;
  updateLife: (life: LifeStats) => void;
}) {
  return (
    <div className="rounded-3xl border border-orange-500/30 bg-orange-500/10 p-5">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-400">
        Student Loan
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MainStat
          label="Status"
          value={life.studentLoanStatus.replace("_", " ")}
        />
        <MainStat label="Limit" value={formatMoney(life.studentLoanLimit)} />
        <MainStat label="Used" value={formatMoney(life.studentLoanUsed)} />
        <MainStat
          label="Remaining"
          value={formatMoney(
            Math.max(0, life.studentLoanLimit - life.studentLoanUsed)
          )}
        />
      </div>

      <button
        onClick={() => updateLife(applyStudentLoan(life))}
        className="mt-4 w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-black transition hover:bg-orange-400 active:scale-[0.98]"
      >
        Apply For Student Loan
      </button>
    </div>
  );
}

function YearRecapCard({ life }: { life: LifeStats }) {
  const recap = life.lastYearRecap;
  if (!recap) return null;

  const netWorthPositive = recap.netWorthChange >= 0;
  const cashPositive = recap.cashChange >= 0;
  const stressBetter = recap.stressChange <= 0;

  return (
    <div className="mt-5 rounded-[2rem] border border-orange-500/30 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.16),transparent_34%),linear-gradient(180deg,rgba(20,20,24,0.98),rgba(9,9,11,0.98))] p-5 shadow-[0_0_35px_rgba(249,115,22,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-400">
            Year Recap
          </p>
          <h3 className="mt-2 text-2xl font-black text-white">
            Age {recap.previousAge} → {recap.newAge}
          </h3>
          <p className="mt-1 text-sm leading-6 text-zinc-400">
            A quick summary of what changed this month.
          </p>
        </div>
        <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-orange-300">
          Next Chapter
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <RecapStat
          label="Cash Change"
          value={`${cashPositive ? "+" : ""}${formatMoney(recap.cashChange)}`}
          tone={cashPositive ? "good" : "bad"}
        />
        <RecapStat
          label="Net Worth"
          value={`${netWorthPositive ? "+" : ""}${formatMoney(recap.netWorthChange)}`}
          tone={netWorthPositive ? "good" : "bad"}
        />
        <RecapStat
          label="Stress"
          value={`${recap.stressChange > 0 ? "+" : ""}${recap.stressChange}`}
          tone={stressBetter ? "good" : "bad"}
        />
        <RecapStat
          label="Happiness"
          value={`${recap.happinessChange > 0 ? "+" : ""}${recap.happinessChange}`}
          tone={recap.happinessChange >= 0 ? "good" : "bad"}
        />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-zinc-800 bg-black/25 p-4">
          <p className="font-black text-white">What happened</p>
          <div className="mt-3 space-y-2">
            {recap.events.slice(0, 4).map((event, index) => (
              <div key={`${event}-${index}`} className="flex gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-500/10 text-sm">
                  {index === 0 ? "📌" : index === 1 ? "💸" : index === 2 ? "⚡" : "📖"}
                </span>
                <p className="text-sm leading-5 text-zinc-300">{event}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-black/25 p-4">
          <p className="font-black text-white">Goals completed</p>
          {recap.goalsCompleted.length > 0 ? (
            <div className="mt-3 space-y-2">
              {recap.goalsCompleted.map((goal) => (
                <div key={goal} className="flex items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 p-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-green-500/15 text-sm">✓</span>
                  <p className="text-sm font-black text-green-100">{goal}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3 text-sm leading-6 text-zinc-400">
              No major goals completed this month. Keep building toward your next milestone.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function RecapStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "bad";
}) {
  return (
    <div className={`rounded-2xl border p-4 ${tone === "good" ? "border-green-500/20 bg-green-500/10" : "border-red-500/20 bg-red-500/10"}`}>
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className={`mt-2 text-xl font-black ${tone === "good" ? "text-green-300" : "text-red-300"}`}>{value}</p>
    </div>
  );
}

function getGoalRows(life: LifeStats) {
  const netWorthProgress = Math.max(0, Math.min(100, Math.floor((life.netWorth / 10000) * 100)));
  const propertyProgress = life.ownedHomes.length > 0 ? 100 : 0;
  const jobProgress = life.jobId !== "unemployed" ? 100 : 0;
  const degreeProgress =
    life.completedDegrees.length > 0
      ? 100
      : life.activeDegreeId && life.activeDegreeId !== "None"
        ? getDegreeProgress(life, life.activeDegreeId)
        : 0;
  const stressProgress = Math.max(0, Math.min(100, 100 - (life.stress ?? 35)));

  return [
    {
      icon: "💼",
      label: "Get a Full-Time Job",
      progress: jobProgress,
      done: jobProgress >= 100,
    },
    {
      icon: "💵",
      label: "Reach $10,000 Net Worth",
      progress: netWorthProgress,
      done: life.netWorth >= 10000,
    },
    {
      icon: "🎓",
      label: "Complete First Degree",
      progress: degreeProgress,
      done: life.completedDegrees.length > 0,
    },
    {
      icon: "🏠",
      label: "Buy First Property",
      progress: propertyProgress,
      done: propertyProgress >= 100,
    },
    {
      icon: "🔥",
      label: "Keep Stress Under 50",
      progress: stressProgress,
      done: (life.stress ?? 35) < 50,
    },
  ];
}

function LifeEventCard({
  event,
  onAccept,
  onDecline,
}: {
  event: LifeChoiceEvent;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="mt-4 rounded-3xl border border-orange-400 bg-orange-500/10 p-5 shadow-xl shadow-orange-950/20">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-400">
        {event.type === "promotion" ? "Promotion Offer" : "Life Event"}
      </p>

      <h2 className="mt-2 text-2xl font-black text-white">{event.title}</h2>

      <p className="mt-2 text-sm leading-6 text-zinc-300">
        {event.description}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <div className="rounded-2xl bg-zinc-950 p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-green-400">
            If you choose: {event.acceptLabel}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {formatEventEffect(event.acceptEffect)}
          </p>
        </div>

        <div className="rounded-2xl bg-zinc-950 p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-400">
            If you choose: {event.declineLabel}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {formatEventEffect(event.declineEffect)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={onAccept}
          className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-black transition hover:bg-orange-400 active:scale-[0.98]"
        >
          {event.acceptLabel}
        </button>

        <button
          onClick={onDecline}
          className="rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-black text-zinc-300 transition hover:border-orange-400 active:scale-[0.98]"
        >
          {event.declineLabel}
        </button>
      </div>
    </div>
  );
}

function PopupCard({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="mt-3 flex items-center justify-between gap-4 rounded-2xl border border-orange-500/35 bg-orange-500/10 px-4 py-3 shadow-lg shadow-orange-950/20">
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-400">
          Action Result
        </p>
        <p className="mt-1 break-words text-sm leading-5 text-zinc-200">{message}</p>
      </div>

      <button
        onClick={onClose}
        className="shrink-0 rounded-xl bg-orange-500 px-4 py-2 text-xs font-black text-black transition hover:bg-orange-400 active:scale-[0.98]"
      >
        Okay
      </button>
    </div>
  );
}

function LifeGrowthButton({
  action,
  onClick,
}: {
  action: LifeGrowthAction;
  onClick: () => void;
}) {
  const changes = getLifeGrowthChangeList(action);

  return (
    <button
      onClick={onClick}
      className="w-full min-w-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-left transition hover:border-orange-400 hover:bg-zinc-800 active:scale-[0.99]"
    >
      <span className="block text-base font-black text-white">
        {action.name}
      </span>
      <span className="mt-1 block break-words text-sm leading-5 text-zinc-400">
        {action.description}
      </span>

      <div className="mt-3 flex flex-wrap gap-2">
        {changes.map((change) => (
          <span
            key={change}
            className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-black text-zinc-300"
          >
            {change}
          </span>
        ))}
      </div>
    </button>
  );
}

function getLifeGrowthChangeList(action: LifeGrowthAction) {
  const changes: string[] = [];

  if (action.healthGain !== 0) {
    changes.push(`Health ${formatSigned(action.healthGain)}`);
  }

  if (action.happinessGain !== 0) {
    changes.push(`Happiness ${formatSigned(action.happinessGain)}`);
  }

  if (action.intelligenceGain !== 0) {
    changes.push(`Intelligence ${formatSigned(action.intelligenceGain)}`);
  }

  if (action.charismaGain !== 0) {
    changes.push(`Charisma ${formatSigned(action.charismaGain)}`);
  }

  if (action.disciplineGain !== 0) {
    changes.push(`Discipline ${formatSigned(action.disciplineGain)}`);
  }

  if (action.reputationGain !== 0) {
    changes.push(`Reputation ${formatSigned(action.reputationGain)}`);
  }

  if (action.energyChange !== 0) {
    changes.push(`Energy ${formatSigned(action.energyChange)}`);
  }

  if (action.stressChange !== 0) {
    changes.push(`Stress ${formatSigned(action.stressChange)}`);
  }

  if (action.maxUsesPerYear !== undefined) {
    changes.push(`${action.maxUsesPerYear}/month`);
  }

  if (action.cashCost > 0) {
    changes.push(`Cash -${formatMoney(action.cashCost)}`);
  }

  return changes.length > 0 ? changes : ["No major stat changes"];
}

function formatSigned(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

function DegreeButton({
  life,
  degree,
  onClick,
}: {
  life: LifeStats;
  degree: DegreeProgram;
  onClick: () => void;
}) {
  const progress = getDegreeProgress(life, degree.id);
  const paid = getDegreePaid(life, degree.id);
  const completed = life.completedDegrees.includes(degree.id);
  const active = life.activeDegreeId === degree.id;
  const tooSad = life.happiness < 10;
  const tooUnhealthy = life.health < 10;
  const locked =
    !!degree.requiredDegree &&
    !life.completedDegrees.includes(degree.requiredDegree);

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left transition active:scale-[0.99] ${
        completed
          ? "border-green-500/40 bg-green-500/10"
          : locked
            ? "border-zinc-700 bg-zinc-900/60 opacity-70"
            : tooSad || tooUnhealthy
              ? "border-red-500/30 bg-red-500/10 hover:border-red-400"
              : active
                ? "border-orange-400 bg-orange-500/10 hover:border-orange-300"
                : "border-zinc-800 bg-zinc-900 hover:border-orange-400 hover:bg-zinc-800"
      }`}
    >
      <span className="block text-base font-black text-white">
        {degree.name}
      </span>

      <span className="mt-1 block break-words text-sm leading-5 text-zinc-400">
        {degree.description}
      </span>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <RequirementPill
          label="Total Cost"
          value={formatMoney(degree.totalCost)}
        />
        <RequirementPill
          label="Paid"
          value={`${formatMoney(paid)}/${formatMoney(degree.totalCost)}`}
        />
        <RequirementPill label="Progress" value={`${progress}/100`} />
        <RequirementPill label="Stress" value={`-${degree.happinessCost}`} />
        <RequirementPill label="Unlocks" value={degree.educationName} />
        <RequirementPill
          label="Skill"
          value={`${getSkillName(degree.skillReward)} ${
            degree.skillGainOnComplete
          }`}
        />
      </div>

      {degree.requiredDegree && (
        <p className="mt-3 text-xs font-black text-zinc-400">
          Requires: {getDegreeName(degree.requiredDegree)}
        </p>
      )}

      {locked && (
        <p className="mt-2 text-xs font-black text-red-400">
          Locked. Complete {getDegreeName(degree.requiredDegree || "None")} first.
        </p>
      )}

      {active && !completed && !locked && (
        <p className="mt-3 text-xs font-black text-orange-400">
          Active degree. Keep studying to finish it.
        </p>
      )}

      {completed && (
        <p className="mt-3 text-xs font-black text-green-400">
          Completed. This degree cannot be repeated.
        </p>
      )}

      {!completed && !locked && tooSad && (
        <p className="mt-3 text-xs font-black text-red-400">
          Blocked: Happiness is under 10.
        </p>
      )}

      {!completed && !locked && tooUnhealthy && (
        <p className="mt-3 text-xs font-black text-red-400">
          Blocked: Health is under 10.
        </p>
      )}
    </button>
  );
}

function JobApplyButton({
  life,
  job,
  onClick,
}: {
  life: LifeStats;
  job: Job;
  onClick: () => void;
}) {
  const eligible = canApplyForJob(life, job);
  const missingRequirements = getJobMissingRequirements(
    life,
    job,
    getDegreeName,
    getJobName
  );

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left transition active:scale-[0.99] ${
        eligible
          ? "border-green-500/40 bg-green-500/10 hover:border-green-400"
          : "border-zinc-800 bg-zinc-900 hover:border-orange-400 hover:bg-zinc-800"
      }`}
    >
      <span className="block text-base font-black text-white">{job.title}</span>

      <span className="mt-1 block break-words text-sm leading-5 text-zinc-400">
        {formatMoney(job.salary)}/year • {formatMoney(Math.floor(job.salary / 12))}/month
      </span>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <RequirementPill label="Path" value={job.careerPath} />
        <RequirementPill
          label="Skill"
          value={`${getSkillName(job.track)} ${job.requiredSkill}`}
        />
        <RequirementPill
          label="Education"
          value={`Level ${job.requiredEducationLevel}`}
        />
        <RequirementPill
          label="Intelligence"
          value={`${job.requiredIntelligence}`}
        />
        <RequirementPill label="Charisma" value={`${job.requiredCharisma}`} />
        <RequirementPill
          label="Discipline"
          value={`${job.requiredDiscipline}`}
        />
      </div>

      {job.requiredDegree && (
        <p className="mt-3 text-xs font-black text-zinc-400">
          Degree required: {getDegreeName(job.requiredDegree)}
        </p>
      )}

      {job.requiredJobId && (
        <p className="mt-2 text-xs font-black text-zinc-400">
          Experience required: {job.requiredJobExperience || 1} as{" "}
          {getJobName(job.requiredJobId)}
        </p>
      )}

      {!eligible && (
        <div className="mt-3 rounded-2xl bg-zinc-950 p-3">
          <p className="text-xs font-black text-red-400">Not ready yet:</p>
          <div className="mt-2 space-y-1">
            {missingRequirements.map((requirement) => (
              <p key={requirement} className="text-xs text-zinc-400">
                • {requirement}
              </p>
            ))}
          </div>
        </div>
      )}

      {eligible && (
        <p className="mt-3 text-xs font-black text-green-400">
          Eligible. Click to apply.
        </p>
      )}
    </button>
  );
}

function RequirementPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-950 p-2">
      <p className="font-bold uppercase tracking-[0.12em] text-zinc-600">
        {label}
      </p>
      <p className="mt-1 font-black text-zinc-300">{value}</p>
    </div>
  );
}

function TopSummary({
  life,
  onRestart,
  onEndMonth,
}: {
  life: LifeStats;
  onRestart: () => void;
  onEndMonth: () => void;
}) {
  const energyLow = (life.energy ?? MAX_ENERGY) < 15;
  const legacyScore = getLegacyScore(life);
  const levelProgress = getLevelProgress(life);
  const nextMonthBlocked = Boolean(life.pendingLifeEvent || life.popupMessage);

  return (
    <div className="sticky top-0 z-20 -mx-4 border-b border-zinc-900/80 bg-[#050505]/92 px-4 pb-2 pt-2 backdrop-blur-xl lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0">
      <div className="overflow-hidden rounded-[1.15rem] border border-zinc-800/80 bg-gradient-to-br from-[#101217] via-[#090a0d] to-black p-3 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-orange-500/50 bg-orange-500/10 text-lg shadow-[0_0_22px_rgba(249,115,22,0.14)]">
              ⚡
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-400">
                Welcome Back
              </p>
              <h1 className="truncate text-lg font-black leading-tight tracking-tight">
                {life.name}
              </h1>
              <p className="truncate text-xs font-medium text-zinc-400">
                Age {life.age} • {getMonthName(life.month || 1)} {life.calendarYear || 2026} • {life.job}
              </p>
            </div>
          </div>

          <button
            onClick={onEndMonth}
            disabled={nextMonthBlocked}
            title={nextMonthBlocked ? "Resolve the current popup or life event first." : "Advance to next month"}
            className={`shrink-0 rounded-2xl px-4 py-2.5 text-left text-white shadow-lg shadow-orange-500/20 transition active:scale-[0.98] ${
              nextMonthBlocked
                ? "cursor-not-allowed bg-zinc-800 text-zinc-500 shadow-none"
                : energyLow
                  ? "bg-orange-600 hover:-translate-y-0.5 hover:bg-orange-500"
                  : "bg-orange-500 hover:-translate-y-0.5 hover:bg-orange-400"
            }`}
          >
            <span className="flex items-center justify-between gap-3 text-sm font-black">
              <span>{nextMonthBlocked ? "Resolve Event" : "Next Month"}</span>
              <span>→</span>
            </span>
            <span className="mt-0.5 block text-[10px] font-bold leading-4 text-orange-100/90">
              {nextMonthBlocked ? "Click OK / choose event" : `${getMonthName(life.month || 1)} →`}
            </span>
          </button>
        </div>

        <div className="mt-3 hidden items-center gap-3 lg:flex">
          <p className="whitespace-nowrap text-[10px] font-bold text-zinc-500">Level {levelProgress.level} • {levelProgress.current} / {levelProgress.needed} XP</p>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-900">
            <div className="h-full rounded-full bg-orange-500" style={{ width: `${levelProgress.percent}%` }} />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <MiniStat icon="💵" label="Cash" value={formatMoney(life.cash)} helper={life.salary > 0 ? `${formatMoney(Math.floor(life.salary / 12))}/mo` : "No salary"} compact />
          <MiniStat icon="📈" label="Net Worth" value={formatMoney(life.netWorth)} helper="Total" compact />
          <MiniStat icon="🔋" label="Energy" value={`${life.energy ?? MAX_ENERGY}/100`} helper={getEnergyStatus(life)} compact />
        </div>

        <div className="mt-3 rounded-2xl border border-zinc-800 bg-black/25 p-2.5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
              Energy Bar
            </p>
            <p className={`text-xs font-black ${
              (life.energy ?? MAX_ENERGY) < 15 ? "text-red-300" : "text-orange-300"
            }`}>
              {life.energy ?? MAX_ENERGY}/100 • {getEnergyStatus(life)}
            </p>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-zinc-900">
            <div
              className={`h-full rounded-full ${
                (life.energy ?? MAX_ENERGY) < 15
                  ? "bg-red-500"
                  : (life.energy ?? MAX_ENERGY) < 45
                    ? "bg-yellow-400"
                    : "bg-green-400"
              }`}
              style={{ width: `${Math.max(0, Math.min(100, life.energy ?? MAX_ENERGY))}%` }}
            />
          </div>
        </div>

        <div className="mt-2 hidden items-center justify-end gap-2 lg:flex">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
            Legacy
          </p>
          <p className="text-sm font-black text-orange-400">
            {legacyScore.toLocaleString()}
          </p>
          <p className="text-[10px] font-bold text-zinc-500">⭐ Rising</p>
        </div>
      </div>
    </div>
  );
}

function NewLifeWizard({
  nameInput,
  setNameInput,
  origin,
  setOrigin,
  setupStep,
  setSetupStep,
  onStartLife,
}: {
  nameInput: string;
  setNameInput: (value: string) => void;
  origin: Origin;
  setOrigin: (origin: Origin) => void;
  setupStep: SetupStep;
  setSetupStep: (step: SetupStep) => void;
  onStartLife: () => void;
}) {
  const backgroundNames = familyBackgrounds.map((item) => item.name);
  const traitNames = childhoodTraits.map((item) => item.name);
  const difficultyNames = difficulties.map((item) => item.name);
  const selectedBackground = findBackground(origin.background);
  const selectedTrait = findTrait(origin.trait);
  const selectedDifficulty = findDifficulty(origin.difficulty);

  function randomize() {
    setOrigin(
      createRandomOrigin(countries, backgroundNames, traitNames, difficultyNames)
    );
  }

  return (
    <main className="min-h-screen bg-[#090909] px-5 py-8 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <div className="w-full rounded-[2rem] border border-orange-500/30 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.14),transparent_32%),linear-gradient(180deg,rgba(20,20,24,0.98),rgba(9,9,11,0.98))] p-6 shadow-2xl shadow-orange-950/40">
          <div className="mb-6 text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
              <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">
                {GAME_STAGE_LABEL}
              </span>
              <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                {GAME_VERSION_LABEL}
              </span>
            </div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.35em] text-orange-400">
              Charged Studios
            </p>
            <h1 className="text-5xl font-black tracking-tight">
              Charged<span className="text-orange-400">Life</span>
            </h1>
            <p className="mt-3 text-base font-medium text-zinc-300">
              Start broke. Die legendary.
            </p>
          </div>

          <SetupProgress step={setupStep} />

          <div className="flex min-h-[470px] flex-col">
            {setupStep === "name" && (
              <SetupStepShell
                title="Create your life"
                description="Choose your character name. Every choice after this changes your start."
                footer={
                  <button
                    onClick={() => setSetupStep("country")}
                    className="w-full rounded-2xl bg-orange-500 px-5 py-4 text-lg font-black text-black transition hover:bg-orange-400 active:scale-[0.98]"
                  >
                    Continue
                  </button>
                }
              >
                <input
                  value={nameInput}
                  onChange={(event) => setNameInput(event.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-white outline-none transition focus:border-orange-400"
                />

                <div className="mt-4 rounded-2xl bg-zinc-950/70 p-4">
                  <p className="text-sm font-black text-white">This life begins at age 18.</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-400">
                    You will choose region, family background, childhood trait, and difficulty before starting.
                  </p>
                </div>
              </SetupStepShell>
            )}

            {setupStep === "country" && (
              <SetupChoice
                title="Choose region"
                description="Regions are simple for now. Later they can affect wages, taxes, opportunities, and life events."
                value={origin.country}
                options={countries}
                onChange={(value) => setOrigin({ ...origin, country: value })}
                onBack={() => setSetupStep("name")}
                onNext={() => setSetupStep("background")}
              />
            )}

            {setupStep === "background" && (
              <SetupChoice
                title="Choose family background"
                description={`${selectedBackground.description} Starting cash: ${formatMoney(selectedBackground.startingCash)}. This affects stats, early stress, debt, skills, and your first years.`}
                value={origin.background}
                options={backgroundNames}
                onChange={(value) => setOrigin({ ...origin, background: value })}
                onBack={() => setSetupStep("country")}
                onNext={() => setSetupStep("trait")}
              />
            )}

            {setupStep === "trait" && (
              <SetupChoice
                title="Choose childhood trait"
                description={`${selectedTrait.description} Keep it simple: this mainly shapes your starting stats and playstyle.`}
                value={origin.trait}
                options={traitNames}
                onChange={(value) => setOrigin({ ...origin, trait: value })}
                onBack={() => setSetupStep("background")}
                onNext={() => setSetupStep("difficulty")}
              />
            )}

            {setupStep === "difficulty" && (
              <SetupChoice
                title="Choose difficulty"
                description={`${selectedDifficulty.description} Difficulty affects starting cash, stats, stress, energy, and death/event pressure.`}
                value={origin.difficulty}
                options={difficultyNames}
                onChange={(value) => setOrigin({ ...origin, difficulty: value })}
                onBack={() => setSetupStep("trait")}
                onNext={onStartLife}
                nextLabel="Start Life"
                extraFooter={
                  <button
                    onClick={randomize}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4 text-sm font-black text-white transition hover:border-orange-400 hover:bg-zinc-800 active:scale-[0.98]"
                  >
                    Randomize Origin
                  </button>
                }
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function SetupProgress({ step }: { step: SetupStep }) {
  const steps: SetupStep[] = [
    "name",
    "country",
    "background",
    "trait",
    "difficulty",
  ];
  const currentIndex = steps.indexOf(step);

  return (
    <div className="mb-6 grid grid-cols-5 gap-2">
      {steps.map((item, index) => (
        <div
          key={item}
          className={`h-2 rounded-full ${
            index <= currentIndex ? "bg-orange-400" : "bg-zinc-800"
          }`}
        />
      ))}
    </div>
  );
}

function SetupStepShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-[470px] flex-col">
      <div>
        <h2 className="text-2xl font-black">{title}</h2>
        <p className="mt-2 min-h-[48px] text-sm leading-6 text-zinc-400">{description}</p>
      </div>

      <div className="mt-5 flex-1">{children}</div>

      <div className="mt-5">{footer}</div>
    </div>
  );
}

function SetupChoice({
  title,
  description,
  value,
  options,
  onChange,
  onBack,
  onNext,
  nextLabel = "Continue",
  extraFooter,
}: {
  title: string;
  description: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  extraFooter?: ReactNode;
}) {
  return (
    <SetupStepShell
      title={title}
      description={description}
      footer={
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onBack}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4 text-sm font-black text-white transition hover:border-orange-400 hover:bg-zinc-800 active:scale-[0.98]"
            >
              Back
            </button>

            <button
              onClick={onNext}
              className="rounded-2xl bg-orange-500 px-5 py-4 text-sm font-black text-black transition hover:bg-orange-400 active:scale-[0.98]"
            >
              {nextLabel}
            </button>
          </div>

          {extraFooter}
        </div>
      }
    >
      <div className="grid gap-3">
        {options.map((option) => {
          const selected = value === option;

          return (
            <button
              key={option}
              onClick={() => onChange(option)}
              className={`rounded-2xl p-4 text-left transition active:scale-[0.98] ${
                selected
                  ? "bg-orange-500 text-black shadow-lg shadow-orange-500/20"
                  : "bg-zinc-900/80 text-white hover:bg-zinc-800"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-black">{option}</span>
                {selected && <span className="text-xs font-black">Selected</span>}
              </div>
            </button>
          );
        })}
      </div>
    </SetupStepShell>
  );
}

function LifeCompleteScreen({
  life,
  legacyScore,
  onRestart,
}: {
  life: LifeStats;
  legacyScore: number;
  onRestart: () => void;
}) {
  const yearsLived = Math.max(0, life.age - 18);
  const legacyRank = getLegacyRank(legacyScore);
  const assetsOwned = (life.ownedCars?.length || 0) + (life.ownedHomes?.length || 0) + (life.ownedItems?.length || 0);
  const businessesOwned = life.businesses?.length || (life.business !== "None" ? 1 : 0);
  const finalEvents = (life.eventLog || []).slice(0, 5);
  const lifeSummary =
    legacyScore >= 50000
      ? "A legendary life that changed the world around you."
      : legacyScore >= 20000
        ? "A powerful life with real achievements and a lasting legacy."
        : legacyScore >= 8000
          ? "A solid life with progress, lessons, and momentum."
          : "A humble life. The next one can be greater.";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.12),transparent_35%),#090909] px-5 py-8 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center">
        <div className="w-full rounded-[2rem] border border-orange-500/30 bg-[linear-gradient(180deg,rgba(20,20,24,0.98),rgba(9,9,11,0.98))] p-6 shadow-2xl shadow-orange-950/40">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <p className="text-sm font-black uppercase tracking-[0.35em] text-orange-400">
                  Life Complete
                </p>
                <span className="rounded-full bg-orange-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-orange-300">
                  {GAME_STAGE_LABEL} • {GAME_VERSION_LABEL}
                </span>
              </div>

              <h1 className="max-w-xl text-4xl font-black leading-tight md:text-5xl">
                {life.name} died at age {life.age}
              </h1>

              <p className="mt-4 max-w-2xl leading-7 text-zinc-400">{life.deathReason}</p>
            </div>

            <div className="rounded-3xl bg-orange-500/10 px-4 py-3 text-right">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Years lived</p>
              <p className="mt-1 text-3xl font-black text-white">{yearsLived}</p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_35%),rgba(24,24,27,0.96)] p-5">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-zinc-500">
              Legacy Score
            </p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-6xl font-black text-orange-400">
                  {legacyScore.toLocaleString()}
                </p>
                <p className="mt-1 text-2xl font-black">{legacyRank}</p>
              </div>
              <p className="max-w-xs text-sm leading-6 text-zinc-400">{lifeSummary}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <MainStat label="Final Cash" value={formatMoney(life.cash)} />
            <MainStat label="Net Worth" value={formatMoney(life.netWorth)} />
            <MainStat label="Assets Owned" value={`${assetsOwned}`} />
            <MainStat label="Businesses" value={`${businessesOwned}`} />
            <MainStat label="Final Job" value={life.job} />
            <MainStat label="Business" value={life.business} />
            <MainStat label="Family" value={`${life.children} children`} />
            <MainStat label="Difficulty" value={life.difficulty} />
          </div>

          {finalEvents.length > 0 && (
            <div className="mt-5 rounded-3xl bg-zinc-950/70 p-5">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-400">
                Final Life Highlights
              </p>
              <div className="mt-3 space-y-2">
                {finalEvents.map((event, index) => (
                  <div key={`${event}-${index}`} className="rounded-2xl bg-black/25 px-4 py-3 text-sm text-zinc-300">
                    {event}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onRestart}
            className="mt-6 w-full rounded-2xl bg-orange-500 px-5 py-4 text-lg font-black text-black transition hover:bg-orange-400 active:scale-[0.98]"
          >
            Start New Life
          </button>
        </div>
      </section>
    </main>
  );
}

function BottomNavigation({
  activeTab,
  onChange,
}: {
  activeTab: ActiveTab;
  onChange: (tab: ActiveTab) => void;
}) {
  const tabs: { id: ActiveTab; label: string; icon: string }[] = [
    { id: "life", label: "Life", icon: "🏠" },
    { id: "stats", label: "Stats", icon: "📊" },
    { id: "career", label: "Career+", icon: "💼" },
    { id: "economy", label: "Money", icon: "💰" },
    { id: "business", label: "Business Hub", icon: "🏢" },
    { id: "actions", label: "Actions", icon: "⚡" },
    { id: "timeline", label: "Story", icon: "📖" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-800/80 bg-zinc-950/95 px-2 pb-4 pt-3 backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-6 gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`rounded-2xl px-1 py-3 text-center text-[10px] font-black transition active:scale-[0.96] ${
                isActive
                  ? "bg-orange-500 text-black shadow-lg shadow-orange-500/25"
                  : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <span className="block text-base">{tab.icon}</span>
              <span className="mt-1 block">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function RealEstateCompanyPanel({
  life,
  updateLife,
}: {
  life: LifeStats;
  updateLife: (life: LifeStats) => void;
}) {
  const activeBusiness = (life.businesses || []).find((business) => business.id === life.activeBusinessId);
  const stats = activeBusiness?.specialStats || {};
  const companyCash = stats.companyCash || 0;
  const currentDeal = stats.currentDeal || 0;
  const ownedProject = stats.ownedProject || 0;
  const dealPrice = stats.dealPrice || 0;
  const dealValue = stats.dealValue || 0;
  const dealCondition = stats.dealCondition || 0;
  const dealRisk = stats.dealRisk || 0;
  const dealRent = stats.dealRent || 0;
  const renovationProgress = stats.renovationProgress || 0;
  const rentalUnits = stats.rentalUnits || 0;
  const managerQuality = stats.managerQuality || 0;
  const canBuyDeal = currentDeal > 0 && companyCash >= dealPrice;
  const dealUpside = currentDeal ? dealValue - dealPrice : 0;

  const currentStep = !companyCash
    ? 1
    : !currentDeal && !ownedProject
      ? 2
      : currentDeal && !ownedProject
        ? 3
        : 4;

  const nextMove =
    currentStep === 1
      ? "Add money into the Deal Fund. Real Estate actions use company cash, not your personal cash."
      : currentStep === 2
        ? "Find a property deal. The deal can be undervalued, overpriced, safe, or risky."
        : currentStep === 3
          ? canBuyDeal
            ? "Buy the deal or search again if it looks bad."
            : "Add more money to the Deal Fund before buying this deal."
          : "You own a project. Renovate it, rent it out for monthly income, or flip it for a risky one-time sale.";

  return (
    <div className="rounded-[1.6rem] border border-orange-500/25 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_34%),rgba(0,0,0,0.22)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">
            Real Estate Deal Room
          </p>
          <h4 className="mt-1 text-xl font-black text-white">
            Buy low, improve, then rent or flip
          </h4>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-400">
            Real Estate has its own loop. First fund the company, then find a deal, buy it, and choose whether to build rental cashflow or take a risky flip profit.
          </p>
        </div>

        <span className="rounded-full bg-orange-500/10 px-3 py-1.5 text-xs font-black text-orange-300">
          Step {currentStep}/4
        </span>
      </div>

      <div className="mt-4 rounded-2xl bg-orange-500/10 p-4">
        <p className="text-sm font-black text-orange-100">Recommended next move</p>
        <p className="mt-1 text-sm leading-6 text-zinc-300">{nextMove}</p>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-4">
        {[
          ["1", "Fund", "Move cash into the company deal fund."],
          ["2", "Find Deal", "Roll a property deal with price, value, condition, and risk."],
          ["3", "Buy", "Use the deal fund to buy the current deal."],
          ["4", "Rent or Flip", "Rent for passive income or flip for risky profit."],
        ].map(([number, title, text], index) => {
          const stepNumber = index + 1;
          const active = stepNumber === currentStep;
          const done = stepNumber < currentStep;

          return (
            <div
              key={title}
              className={`rounded-2xl p-3 ${
                active
                  ? "bg-orange-500/15"
                  : done
                    ? "bg-green-500/10"
                    : "bg-zinc-950/70"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-black ${
                  active
                    ? "bg-orange-500 text-black"
                    : done
                      ? "bg-green-500 text-black"
                      : "bg-zinc-800 text-zinc-400"
                }`}>
                  {number}
                </span>
                <p className="font-black text-white">{title}</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-zinc-500">{text}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <BusinessMetricCard label="Deal Fund" value={formatMoney(companyCash)} helper="Company cash" />
        <BusinessMetricCard
          label="Current Deal"
          value={currentDeal ? formatMoney(dealPrice) : "None"}
          helper={currentDeal ? `${dealUpside >= 0 ? "Upside" : "Overpay"} ${formatMoney(Math.abs(dealUpside))}` : "Find one"}
        />
        <BusinessMetricCard label="Est. Value" value={currentDeal || ownedProject ? formatMoney(dealValue) : "$0"} helper="Market estimate" />
        <BusinessMetricCard label="Condition" value={`${dealCondition}/100`} helper="Higher is better" />
        <BusinessMetricCard label="Risk" value={`${dealRisk}/100`} helper="Hidden problems" />
        <BusinessMetricCard label="Rent Potential" value={formatMoney(dealRent)} helper="Monthly estimate" />
        <BusinessMetricCard label="Renovation" value={`${renovationProgress}/100`} helper="Flip/rent boost" />
        <BusinessMetricCard label="Manager" value={`${managerQuality}/100`} helper="Risk control" />
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl bg-zinc-950/70 p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">
            Deal Fund
          </p>
          <p className="mt-1 text-sm leading-6 text-zinc-400">
            This is money inside the Real Estate company. Buying, renovating, and hiring managers use this fund.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
            {[5000, 10000, 25000, 50000].map((amount) => (
              <button
                key={amount}
                onClick={() => updateLife(realEstateAddFunds(life, amount))}
                className="rounded-xl bg-orange-500/10 px-2 py-2 text-xs font-black text-orange-200 transition hover:bg-orange-500 hover:text-black"
              >
                Add {formatMoney(amount)}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-zinc-950/70 p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">
            Strategy Explained
          </p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <div className="rounded-xl bg-black/25 p-3">
              <p className="font-black text-white">Rent it out</p>
              <p className="mt-1 text-xs leading-5 text-zinc-400">
                Slower, safer. Adds monthly business revenue if you find tenants.
              </p>
            </div>
            <div className="rounded-xl bg-black/25 p-3">
              <p className="font-black text-white">Fix & flip</p>
              <p className="mt-1 text-xs leading-5 text-zinc-400">
                Faster, riskier. One sale roll can make profit or cause a loss.
              </p>
            </div>
          </div>
        </div>
      </div>

      {currentDeal > 0 && !ownedProject && (
        <div className={`mt-4 rounded-2xl p-4 ${canBuyDeal ? "bg-green-500/10" : "bg-red-500/10"}`}>
          <p className="text-sm font-black text-white">Current Deal Summary</p>
          <p className="mt-1 text-sm leading-6 text-zinc-300">
            Price {formatMoney(dealPrice)} • Estimated value {formatMoney(dealValue)} • Condition {dealCondition}/100 • Risk {dealRisk}/100.
            {canBuyDeal
              ? " You have enough Deal Fund to buy it."
              : ` You need ${formatMoney(Math.max(0, dealPrice - companyCash))} more in the Deal Fund to buy it.`}
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        <BusinessActionCard
          icon="📊"
          title="Market Research"
          description="Study the housing market. Real Estate skill +1 and owned homes get a small value/rent boost."
          onClick={() => updateLife(realEstateMarketResearch(life))}
        />

        <BusinessActionCard
          icon="🔎"
          title="Find Property Deal"
          description="Costs $750 personal cash. Finds a deal with price, value, condition, rent potential, and risk."
          onClick={() => updateLife(realEstateFindDeal(life))}
        />

        <BusinessActionCard
          icon="🏚️"
          title="Buy Current Deal"
          description="Requires a found deal and enough Deal Fund. After buying, you can renovate, rent, or flip."
          onClick={() => updateLife(realEstateBuyDeal(life))}
        />

        <BusinessActionCard
          icon="🔨"
          title="Renovate Project"
          description="Costs Deal Fund. Improves value/condition, but hidden damage can cause losses."
          onClick={() => updateLife(realEstateRenovate(life))}
        />

        <BusinessActionCard
          icon="🏘️"
          title="Rent It Out"
          description="Attempts to find tenants. Success adds monthly business revenue."
          onClick={() => updateLife(realEstateRentProject(life))}
        />

        <BusinessActionCard
          icon="💸"
          title="Fix & Flip"
          description="Sells the project. High risk/high reward based on condition, renovation, luck, and deal risk."
          onClick={() => updateLife(realEstateFlipProject(life))}
        />

        <BusinessActionCard
          icon="🧑‍💼"
          title="Hire Manager"
          description="Costs $5k from Deal Fund. Improves manager quality, management, and lowers risk."
          onClick={() => updateLife(realEstateHireManager(life))}
        />
      </div>
    </div>
  );
}

function BusinessFinanceTools({
  life,
  updateLife,
}: {
  life: LifeStats;
  updateLife: (life: LifeStats) => void;
}) {
  return (
    <details className="rounded-[1.6rem] border border-zinc-800 bg-zinc-950/80 p-4">
      <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.18em] text-zinc-400">
        Finance tools: loans, debt, and investing
      </summary>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-3">
          <p className="text-sm font-black text-white">Take Loan</p>
          <p className="mt-1 text-xs leading-5 text-zinc-400">
            Borrow money based on your income profile. Limit: {formatMoney(getLoanLimit(life))}
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[25, 50, 100, 200].map((percent) => (
              <button
                key={percent}
                onClick={() => updateLife(takeLoan(life, percent))}
                className="rounded-xl bg-zinc-950 px-2 py-2 text-xs font-black text-zinc-100 transition hover:bg-orange-500 hover:text-black"
              >
                {percent}%
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3">
          <p className="text-sm font-black text-white">Pay Debt</p>
          <p className="mt-1 text-xs leading-5 text-zinc-400">
            Current debt: {formatMoney(life.debt)}. Paying debt reduces interest.
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[10, 25, 50, 100].map((percent) => (
              <button
                key={percent}
                onClick={() => updateLife(payDebt(life, percent))}
                className="rounded-xl bg-zinc-950 px-2 py-2 text-xs font-black text-zinc-100 transition hover:bg-orange-500 hover:text-black"
              >
                {percent}%
              </button>
            ))}
          </div>
        </div>

        <BusinessActionCard
          icon="📈"
          title="Invest"
          description="Uses finance, intelligence, and luck. Can grow cash, but is not guaranteed."
          onClick={() => updateLife(invest(life))}
        />
      </div>
    </details>
  );
}

function BusinessMarketPanel({
  life,
  updateLife,
}: {
  life: LifeStats;
  updateLife: (life: LifeStats) => void;
}) {
  return (
    <details className="rounded-[1.6rem] border border-zinc-800 bg-zinc-950/80 p-4">
      <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.18em] text-zinc-400">
        Business market: start another business
      </summary>

      <p className="mt-3 text-sm leading-6 text-zinc-400">
        Start a new company when you have enough cash. The new business becomes your active business.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {businessTypes.map((type) => (
          <BusinessTypeCard
            key={type.id}
            type={type}
            canAfford={life.cash >= type.startCost}
            onClick={() => updateLife(startBusiness(life, type.id))}
          />
        ))}
      </div>
    </details>
  );
}



function BusinessHeroPanel({ life }: { life: LifeStats }) {
  const profit = getBusinessIncomeEstimate(life);
  const monthlyPayroll = Math.floor((life.businessPayroll || 0) / 12);
  const risk = life.businessRisk || 0;
  const riskMood = risk >= 70 ? "🔥 High risk" : risk >= 40 ? "⚠️ Careful" : "🛡️ Safe";
  const businessType = getBusinessTypeById(life.businessTypeId);
  const businessStageName = getBusinessStageName(life.businessStage);
  const quality = life.businessProductQuality || 0;
  const brand = life.businessBrand || 0;
  const management = life.businessManagement || 0;
  const score = Math.round((quality + brand + management + Math.max(0, 100 - risk)) / 4);

  return (
    <div className="mt-4 rounded-[2rem] bg-black/20 p-3 shadow-inner shadow-black/20">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        <BusinessStoryPill emoji="💵" label="Profit" value={`${formatMoney(profit)}/mo`} helper="Owner take" />
        <BusinessStoryPill emoji="🏦" label="Value" value={formatMoney(life.businessValue)} helper="Company worth" />
        <BusinessStoryPill emoji="🔥" label="Risk" value={`${risk}/100`} helper={riskMood} />
        <BusinessStoryPill emoji="👑" label="Owner" value={`${life.businessOwnership || 100}%`} helper="Your cut" />
        <BusinessStoryPill emoji="⭐" label="Score" value={`${score}/100`} helper="Overall health" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-black text-zinc-300">
        <span className="rounded-full bg-zinc-950/70 px-3 py-1.5">🏷️ {businessType?.category || "Business"}</span>
        <span className="rounded-full bg-zinc-950/70 px-3 py-1.5">📈 {businessStageName}</span>
        <span className="rounded-full bg-zinc-950/70 px-3 py-1.5">👥 {life.businessEmployees} staff</span>
        <span className="rounded-full bg-zinc-950/70 px-3 py-1.5">💸 {formatMoney(monthlyPayroll)}/mo payroll</span>
        <span className="rounded-full bg-zinc-950/70 px-3 py-1.5">📣 Brand {brand}</span>
        <span className="rounded-full bg-zinc-950/70 px-3 py-1.5">🧠 Mgmt {management}</span>
      </div>

      <p className="mt-3 text-sm leading-6 text-zinc-400">
        {life.business} is your active company. Choose one strong move this month, protect energy, and avoid letting risk climb too high.
      </p>
    </div>
  );
}


function BusinessStoryPill({
  emoji,
  label,
  value,
  helper,
}: {
  emoji: string;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-full bg-zinc-950/80 px-3 py-2 shadow-inner shadow-black/20">
      <div className="flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        <span className="min-w-0">
          <span className="block truncate text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">{label}</span>
          <span className="block truncate text-base font-black leading-5 text-white">{value}</span>
          <span className="block truncate text-[11px] text-zinc-500">{helper}</span>
        </span>
      </div>
    </div>
  );
}

function BusinessProgressLine({
  emoji,
  label,
  value,
}: {
  emoji: string;
  label: string;
  value: number;
}) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-xs font-black">
        <span className="text-zinc-300">{emoji} {label}</span>
        <span className="text-white">{safeValue}/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
        <div className="h-full rounded-full bg-orange-400" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}


function BusinessRecommendedNextMove({ life }: { life: LifeStats }) {
  const project = getProductProject(life);
  const risk = life.businessRisk || 0;
  let emoji = "🎯";
  let title = "Recommended move";
  let message = "Improve the weakest part of the business before going to next month.";
  let tag = "Balanced";

  if (isProductBusinessType(life.businessTypeId) && project) {
    if (project.phase !== "released" && project.progress < 75) {
      emoji = "🛠️";
      title = "Build before release";
      message = "Your product is not ready yet. Build progress, add quality, and create hype before launching.";
      tag = "Build";
    } else if (project.phase !== "released" && project.bugs > 35) {
      emoji = "🐛";
      title = "Fix bugs first";
      message = "The product can launch soon, but bugs are risky. Polish it before you gamble with release.";
      tag = "Polish";
    } else if (project.phase !== "released" && project.hype < 25) {
      emoji = "📣";
      title = "Get people watching";
      message = "The product is close, but hype is low. Marketing can make the release feel bigger.";
      tag = "Hype";
    } else if (project.phase !== "released") {
      emoji = "🚀";
      title = "Launch window open";
      message = "You can release now. Quality, hype, bugs, risk, skill, and luck decide how big it lands.";
      tag = "Release";
    } else if (project.yearlyDecay >= 25 || (life.monthsLived || 0) - project.lastUpdatedAge >= 24) {
      emoji = "🔧";
      title = "Ship an update";
      message = "Your live product is getting stale. Updates help protect revenue, users, and hype.";
      tag = "Live Ops";
    } else {
      emoji = "🔥";
      title = "Keep momentum";
      message = "The product is alive. Maintain it with updates, bug fixes, and marketing when needed.";
      tag = "Maintain";
    }
  } else if (risk >= 70) {
    emoji = "🚨";
    title = "Risk is too high";
    message = "Focus on management, training, or cutting risk before aggressive growth.";
    tag = "Risk";
  } else if ((life.businessManagement || 0) < 35) {
    emoji = "🧠";
    title = "Improve management";
    message = "Low management makes payroll, scaling, and risk harder to control.";
    tag = "Control";
  } else if ((life.businessBrand || 0) < 35) {
    emoji = "📣";
    title = "Build brand";
    message = "Brand is low. Marketing and business-specific actions can unlock better growth.";
    tag = "Brand";
  }

  return (
    <div className="rounded-[2rem] border border-orange-500/25 bg-orange-500/10 p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-orange-500/20 text-2xl">{emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">Best move this month</p>
            <span className="rounded-full border border-orange-500/25 bg-black/25 px-3 py-1 text-xs font-black text-orange-300">{tag}</span>
          </div>
          <h4 className="mt-1 text-xl font-black text-white">{title}</h4>
          <p className="mt-1 text-sm leading-6 text-zinc-300">{message}</p>
        </div>
      </div>
    </div>
  );
}


function BusinessLifecycleTimeline({ life }: { life: LifeStats }) {
  const project = getProductProject(life);
  if (!project) return null;

  const phases = [
    { id: "concept", emoji: "💡", label: "Idea", description: "Find the hook, audience, and reason this should exist." },
    { id: "pre_production", emoji: "🧪", label: "Proto", description: "Test the first version before spending big money." },
    { id: "production", emoji: "🛠️", label: "Build", description: "Create the real product, content, systems, and features." },
    { id: "post_production", emoji: "🧼", label: "Polish", description: "Fix bugs, improve quality, and make launch safer." },
    { id: "released", emoji: "🚀", label: "Live", description: "Released to players/users. Now it needs updates." },
  ];

  const currentIndex = Math.max(0, phases.findIndex((phase) => phase.id === project.phase));
  const currentPhase = phases[currentIndex];
  const releaseReady = project.phase !== "released" && project.progress >= 75;
  const statusText = project.phase === "released" ? "Live product" : releaseReady ? "Ready soon" : "In development";
  const warning = project.phase === "released"
    ? project.yearlyDecay >= 25
      ? "Getting stale — update soon."
      : "Live and healthy."
    : project.progress < 75
      ? `${75 - project.progress}% more progress needed for release.`
      : project.bugs > 35
        ? "Launch is possible, but bugs are scary."
        : project.hype < 25
          ? "Launch is possible, but hype is low."
          : "Launch looks possible.";

  return (
    <section className="rounded-[2rem] border border-orange-500/20 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.14),transparent_30%),rgba(0,0,0,0.24)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">🎬 Product Journey</p>
          <h4 className="mt-1 text-xl font-black text-white">{currentPhase?.emoji} {getProductProjectPhaseName(project.phase)}</h4>
        </div>
        <span className="rounded-full bg-black/30 px-3 py-1.5 text-xs font-black text-orange-200">{statusText}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {phases.map((phase, index) => {
          const completed = index < currentIndex;
          const current = index === currentIndex;
          return (
            <span
              key={phase.id}
              className={`rounded-full px-3 py-2 text-xs font-black ${
                completed
                  ? "bg-green-500/15 text-green-200"
                  : current
                    ? "bg-orange-500/20 text-orange-100 ring-1 ring-orange-400/40"
                    : "bg-zinc-950/70 text-zinc-500"
              }`}
            >
              {completed ? "✅" : current ? phase.emoji : "🔒"} {phase.label}
            </span>
          );
        })}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <ProductStatPill emoji="📦" label="Progress" value={`${project.progress}`} helper={project.phase === "released" ? "Shipped" : "Need 75"} meter={project.progress} />
        <ProductStatPill emoji="⭐" label="Quality" value={`${project.quality}`} helper="Reviews" meter={project.quality} />
        <ProductStatPill emoji="🐛" label="Bugs" value={`${project.bugs}`} helper="Lower better" meter={100 - project.bugs} danger={project.bugs > 35} />
        <ProductStatPill emoji="📣" label="Hype" value={`${project.hype}`} helper="Attention" meter={project.hype} />
      </div>

      <p className="mt-3 text-sm leading-6 text-zinc-400">{currentPhase?.description} {warning}</p>
    </section>
  );
}


function ProductStatPill({
  emoji,
  label,
  value,
  helper,
  meter,
  danger = false,
}: {
  emoji: string;
  label: string;
  value: string;
  helper: string;
  meter: number;
  danger?: boolean;
}) {
  const safeMeter = Math.max(0, Math.min(100, meter));
  const tone = danger ? "bg-red-500/10 text-red-200" : safeMeter >= 75 ? "bg-green-500/10 text-green-200" : "bg-zinc-950/70 text-zinc-200";

  return (
    <div className={`rounded-full px-3 py-2 ${tone}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{emoji}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[10px] font-black uppercase tracking-[0.14em] opacity-70">{label}</span>
          <span className="block truncate text-sm font-black text-white">{value}/100</span>
        </span>
        <span className="hidden truncate text-[11px] text-zinc-500 sm:block">{helper}</span>
      </div>
    </div>
  );
}

function getProductActionHint(actionId: string, life: LifeStats) {
  const project = getProductProject(life);

  if (actionId === "project-plan") return "Cost ~$1k • Low energy • Improves planning, quality, and risk.";
  if (actionId === "project-build") return "Cost ~$2.5k • Medium energy • Adds progress/quality but can add bugs.";
  if (actionId === "project-polish") return "Cost ~$1.8k • Medium energy • Reduces bugs and improves launch safety.";
  if (actionId === "project-hype") return "Cost ~$2.2k • Low energy • Builds hype for the release roll.";
  if (actionId === "project-release") {
    if (!project) return "Release the product.";
    if (project.progress < 75) return `Locked • Need ${75 - project.progress}% more progress.`;
    return "Cost ~$6k • High energy • Rolls launch outcome using quality, hype, bugs, risk, skill, and luck.";
  }
  if (actionId === "project-update") return "Cost ~$3.5k • Medium energy • Restores users/hype and slows revenue decay.";
  return "";
}

function getBusinessActionHint(actionKey: string) {
  if (actionKey === "hire") return "Adds staff and payroll. Good for scaling, bad if cashflow is weak.";
  if (actionKey === "train") return "Improves management and risk control.";
  if (actionKey === "cut-costs") return "Reduces pressure, but too much cost cutting can limit growth.";
  if (actionKey === "investor") return "Raises cash, but gives away ownership.";
  return "";
}

function runBusinessFallbackAction(life: LifeStats, actionKey: string) {
  if ((life.energy ?? MAX_ENERGY) < 5) {
    return {
      ...life,
      popupMessage: "You are too low on energy. Recover energy or go to next month before doing more business work.",
    };
  }

  if (actionKey === "business-review") {
    return {
      ...life,
      energy: Math.max(0, (life.energy ?? MAX_ENERGY) - 6),
      businessRisk: Math.max(0, life.businessRisk - 1),
      businessManagement: Math.min(100, (life.businessManagement || 0) + 1),
      popupMessage: "You reviewed the company. Management +1, risk -1, energy -6.",
      yearNotes: [`Business review: management +1, risk -1.`, ...(life.yearNotes || [])].slice(0, 6),
    };
  }

  return {
    ...life,
    energy: Math.max(0, (life.energy ?? MAX_ENERGY) - 6),
    businessBrand: Math.min(100, (life.businessBrand || 0) + 1),
    popupMessage: "You made small business progress. Brand +1, energy -6.",
    yearNotes: [`Small business progress: brand +1.`, ...(life.yearNotes || [])].slice(0, 6),
  };
}


function BusinessPortfolioAutomationPanel({
  life,
  updateLife,
}: {
  life: LifeStats;
  updateLife: (life: LifeStats) => void;
}) {
  const holding = getHoldingCompanyPower(life);
  const portfolioValue = getBusinessPortfolioValue(life);
  const businessCount = (life.businesses || []).length || (life.business !== "None" ? 1 : 0);
  const activeBusiness = (life.businesses || []).find((business) => business.id === life.activeBusinessId);
  const managerLevel = Math.max(0, activeBusiness?.specialStats?.businessManagerLevel || 0);
  const holdingUnlockedByBusinesses = businessCount >= 3;
  const holdingUnlockedByNetWorth = life.netWorth >= 250000;
  const canCreateHolding = holdingUnlockedByBusinesses && holdingUnlockedByNetWorth && life.cash >= 50000;
  const holdingStatus = holding.active
    ? "Active portfolio layer"
    : holdingUnlockedByBusinesses && holdingUnlockedByNetWorth
      ? "Ready to create"
      : "Locked side option";

  return (
    <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
      <div className="rounded-[1.8rem] bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_34%),rgba(2,6,23,0.72)] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-300">🧑‍💼 Business management</p>
            <h4 className="mt-1 text-xl font-black text-white">Manage the active company</h4>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              This is for the business you are currently running. Hire or upgrade a manager to improve that company without making the whole portfolio confusing.
            </p>
          </div>
          <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-black text-sky-300">
            Manager level {managerLevel}/5
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <MainStat label="Portfolio Value" value={formatMoney(portfolioValue)} />
          <MainStat label="Companies" value={`${businessCount}`} />
        </div>

        <button
          onClick={() => updateLife(hireBusinessManager(life))}
          className="mt-4 w-full rounded-2xl bg-sky-500 px-4 py-3 text-sm font-black text-black transition hover:bg-sky-400 active:scale-[0.98]"
        >
          Hire / Upgrade Active Manager
        </button>

        <p className="mt-3 text-xs leading-5 text-zinc-500">
          Managers are simple: they help one business. Holding companies are different — they unlock later and manage the full group.
        </p>
      </div>

      <aside className="rounded-[1.8rem] bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.14),transparent_34%),rgba(12,10,8,0.82)] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">🏛️ Side option</p>
            <h4 className="mt-1 text-xl font-black text-white">
              {holding.active ? life.holdingCompanyName || "Holding Company" : "Holding Company"}
            </h4>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-black ${
            holding.active
              ? "bg-green-500/10 text-green-300"
              : canCreateHolding
                ? "bg-orange-500/15 text-orange-300"
                : "bg-zinc-900 text-zinc-500"
          }`}>
            {holdingStatus}
          </span>
        </div>

        <div className="mt-4 rounded-2xl bg-black/24 p-4">
          <p className="text-sm font-black text-white">What is this?</p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            A holding company is a parent company above your businesses. It is not a normal business. It is a late-game tool for automation, managers, and portfolio bonuses.
          </p>
        </div>

        {!holding.active ? (
          <div className="mt-4 space-y-2">
            <HoldingRequirement done={holdingUnlockedByBusinesses} text={`Own 3 businesses (${businessCount}/3)`} />
            <HoldingRequirement done={holdingUnlockedByNetWorth} text={`Reach ${formatMoney(250000)} net worth`} />
            <HoldingRequirement done={life.cash >= 50000} text={`Have ${formatMoney(50000)} cash to create it`} />
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <MainStat label="Level" value={`${holding.level}/5`} />
            <MainStat label="Managers" value={`${holding.managers}`} />
            <MainStat label="Automation" value={`${holding.automation}/100`} />
            <MainStat label="Efficiency" value={`${holding.efficiency}%`} />
          </div>
        )}

        <div className="mt-4 grid gap-2">
          {!holding.active ? (
            <button
              onClick={() => updateLife(createHoldingCompany(life))}
              className={`rounded-2xl px-4 py-3 text-xs font-black transition active:scale-[0.98] ${
                canCreateHolding
                  ? "bg-orange-500 text-black hover:bg-orange-400"
                  : "bg-zinc-900 text-zinc-500 hover:bg-zinc-800"
              }`}
            >
              {canCreateHolding ? "Create Holding Company" : "Locked: Build Portfolio First"}
            </button>
          ) : (
            <>
              <button
                onClick={() => updateLife(upgradeHoldingCompany(life))}
                className="rounded-2xl bg-orange-500/15 px-4 py-3 text-xs font-black text-orange-300 transition hover:bg-orange-500/25 active:scale-[0.98]"
              >
                Upgrade Parent Company
              </button>
              <button
                onClick={() => updateLife(automateBusinessPortfolio(life))}
                className="rounded-2xl bg-green-500/15 px-4 py-3 text-xs font-black text-green-300 transition hover:bg-green-500/25 active:scale-[0.98]"
              >
                Automate Full Portfolio
              </button>
            </>
          )}
        </div>

        <p className="mt-3 text-xs leading-5 text-zinc-500">
          Keep this as a side upgrade. Use normal managers for single businesses, and use the holding company only when you have several companies.
        </p>
      </aside>
    </div>
  );
}

function HoldingRequirement({
  done,
  text,
}: {
  done: boolean;
  text: string;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 ${done ? "bg-green-500/10 text-green-300" : "bg-black/24 text-zinc-500"}`}>
      <span className="text-sm font-bold">{text}</span>
      <span className="text-sm font-black">{done ? "Done" : "Locked"}</span>
    </div>
  );
}

function BusinessActionCenter({
  life,
  updateLife,
}: {
  life: LifeStats;
  updateLife: (life: LifeStats) => void;
}) {
  const productActions = isProductBusinessType(life.businessTypeId)
    ? getProductLifecycleActions(life).map((action) => ({
        key: action.id,
        icon: action.icon,
        title: action.title,
        description: `${action.description} ${getProductActionHint(action.id, life)}`,
        onClick: () => updateLife(doProductLifecycleAction(life, action.id)),
      }))
    : [];

  const specificActions = life.businessTypeId === "real-estate-company"
    ? []
    : getBusinessSpecificActions(life.businessTypeId).map((action) => ({
        key: action.id,
        icon: action.icon,
        title: action.title,
        description: action.description,
        onClick: () => updateLife(doBusinessSpecificAction(life, action.id)),
      }));

  const operationActions = [
    {
      key: "review",
      icon: "📋",
      title: "Review Company",
      description: "Always available. Management +1, risk -1.",
      onClick: () => updateLife(runBusinessFallbackAction(life, "business-review")),
    },
    {
      key: "hire",
      icon: "👥",
      title: "Hire Employee",
      description: `Scale faster, but payroll rises. ${getBusinessActionHint("hire")}`,
      onClick: () => updateLife(hireEmployee(life)),
    },
    {
      key: "train",
      icon: "🎓",
      title: "Train Employees",
      description: `Improve management and reduce long-term risk. ${getBusinessActionHint("train")}`,
      onClick: () => updateLife(trainEmployees(life)),
    },
    {
      key: "cut-costs",
      icon: "✂️",
      title: "Cut Costs",
      description: `Reduce risk and improve control. ${getBusinessActionHint("cut-costs")}`,
      onClick: () => updateLife(cutCosts(life)),
    },
    {
      key: "investor",
      icon: "💼",
      title: "Seek Investor",
      description: `Raise cash but sell ownership. ${getBusinessActionHint("investor")}`,
      onClick: () => updateLife(seekInvestor(life)),
    },
  ];

  const allActions = [...(productActions.length > 0 ? productActions : specificActions), ...operationActions];
  const mainActions = allActions.slice(0, 4);
  const moreActions = allActions.slice(4, 10);

  return (
    <div className="rounded-[2rem] border border-orange-500/25 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.10),transparent_34%),rgba(0,0,0,0.22)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">⚡ Choose your move</p>
          <h4 className="mt-1 text-xl font-black text-white">Best actions right now</h4>
        </div>
        <span className="rounded-full bg-zinc-950/70 px-3 py-1 text-xs font-black text-zinc-400">Energy based</span>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {mainActions.map((action) => (
          <BusinessActionCard
            key={action.key}
            icon={action.icon}
            title={action.title}
            description={action.description}
            onClick={action.onClick}
          />
        ))}
      </div>

      {moreActions.length > 0 && (
        <details className="mt-3 rounded-[1.4rem] bg-zinc-950/60 p-3">
          <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.18em] text-zinc-400">➕ More moves</summary>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {moreActions.map((action) => (
              <BusinessActionCard
                key={action.key}
                icon={action.icon}
                title={action.title}
                description={action.description}
                onClick={action.onClick}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function BusinessProductLifecyclePanel({
  life,
  updateLife,
  compact = false,
}: {
  life: LifeStats;
  updateLife: (life: LifeStats) => void;
  compact?: boolean;
}) {
  const project = getProductProject(life);
  const actions = getProductLifecycleActions(life);

  if (!project) return null;

  const releaseReady = project.phase !== "released" && project.progress >= 75;
  const phaseName = getProductProjectPhaseName(project.phase);
  const liveMood = project.phase === "released"
    ? project.yearlyDecay >= 25
      ? "⚠️ Needs update"
      : "🟢 Healthy live product"
    : releaseReady
      ? "🚀 Release possible"
      : "🛠️ In development";

  return (
    <section className="mt-4 overflow-hidden rounded-[2rem] border border-orange-500/20 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.16),transparent_34%),rgba(0,0,0,0.28)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">
            🎮 Product Studio
          </p>
          <h4 className="mt-1 text-2xl font-black text-white">
            {phaseName}
          </h4>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-300">
            This is where your business turns ideas into something people can actually buy, play, use, or subscribe to.
          </p>
        </div>

        <span className="rounded-full bg-black/30 px-4 py-2 text-sm font-black text-orange-200">
          {liveMood}
        </span>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
        <BusinessMetricCard emoji="📦" label="Progress" value={`${project.progress}/100`} helper={project.phase === "released" ? "Shipped" : "Build work"} />
        <BusinessMetricCard emoji="⭐" label="Quality" value={`${project.quality}/100`} helper="Reviews" />
        <BusinessMetricCard emoji="🐛" label="Bugs" value={`${project.bugs}/100`} helper="Lower is better" />
        <BusinessMetricCard emoji="📣" label="Hype" value={`${project.hype}/100`} helper="Attention" />
        <BusinessMetricCard emoji="👥" label="Users" value={`${project.activeUsers}/100`} helper="Traction" />
        <BusinessMetricCard emoji="🕰️" label="Decay" value={`${project.yearlyDecay}%`} helper="Staleness" />
      </div>

      {!compact && (
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-zinc-400">⚡ Studio actions</p>
            <p className="text-xs text-zinc-500">Spend energy to shape the launch.</p>
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {actions.map((action) => (
              <BusinessActionCard
                key={action.id}
                icon={action.icon}
                title={action.title}
                description={`${action.description} ${getProductActionHint(action.id, life)}`}
                onClick={() => updateLife(doProductLifecycleAction(life, action.id))}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function BusinessSpecialStatsPanel({ life }: { life: LifeStats }) {
  const activeBusiness = (life.businesses || []).find((business) => business.id === life.activeBusinessId);
  const stats = getBusinessSpecialStats(life.businessTypeId);
  const values = activeBusiness?.specialStats || {};

  if (stats.length === 0) return null;

  return (
    <section className="mt-4 rounded-[2rem] bg-black/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">
            🧬 Business DNA
          </p>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-400">
            Every business type has its own personality. These numbers show what this company is becoming known for.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const value = values[stat.key] ?? 0;
          return (
            <div key={stat.key} className="rounded-full bg-zinc-950/80 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-white">{businessStatEmoji(stat.key)} {stat.label}</p>
                  <p className="truncate text-xs text-zinc-500">{stat.description}</p>
                </div>
                <span className="shrink-0 rounded-full bg-orange-500/15 px-3 py-1 text-sm font-black text-orange-200">
                  {value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function businessStatEmoji(key: string) {
  if (key.includes("user") || key.includes("player") || key.includes("traffic")) return "👥";
  if (key.includes("product") || key.includes("quality")) return "⭐";
  if (key.includes("brand") || key.includes("hype") || key.includes("marketing")) return "📣";
  if (key.includes("server")) return "🖥️";
  if (key.includes("property") || key.includes("rent")) return "🏘️";
  if (key.includes("content") || key.includes("game")) return "🎮";
  return "✨";
}

function BusinessMilestonesPanel({ life }: { life: LifeStats }) {
  const activeBusiness = (life.businesses || []).find((business) => business.id === life.activeBusinessId);
  const milestones = activeBusiness
    ? getBusinessMilestoneProgress(activeBusiness)
    : getBusinessMilestones(life.businessTypeId).map((milestone) => ({
        ...milestone,
        value: 0,
        progress: 0,
        completed: false,
      }));

  return (
    <section className="mt-4 rounded-[2rem] bg-[linear-gradient(135deg,rgba(24,24,27,0.9),rgba(0,0,0,0.8))] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">
            🏆 Founder Goals
          </p>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-400">
            These are long-term wins. Complete them to make the company feel like it is really growing, not just printing numbers.
          </p>
        </div>
        <span className="rounded-full bg-black/25 px-3 py-1.5 text-xs font-black text-zinc-300">
          {milestones.filter((milestone) => milestone.completed).length}/{milestones.length} done
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {milestones.map((milestone) => {
          const progress = Math.max(0, Math.min(100, milestone.progress));
          return (
            <div
              key={milestone.id}
              className={`rounded-[1.5rem] px-4 py-3 ${
                milestone.completed
                  ? "bg-green-500/10"
                  : "bg-black/25"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-black text-white">
                    {milestone.completed ? "✅" : "🎯"} {milestone.label}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {milestone.value.toLocaleString()} / {milestone.target.toLocaleString()}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${
                  milestone.completed
                    ? "bg-green-500/15 text-green-300"
                    : "bg-orange-500/15 text-orange-300"
                }`}>
                  {milestone.completed ? "Claimed status" : `${progress}%`}
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-950">
                <div
                  className={`h-full rounded-full ${milestone.completed ? "bg-green-400" : "bg-orange-400"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function BusinessPortfolioCard({
  business,
  active,
  onClick,
}: {
  business: OwnedBusiness;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`min-w-0 overflow-hidden rounded-2xl border p-4 text-left transition hover:border-orange-400/60 ${
        active
          ? "border-orange-500/50 bg-orange-500/10"
          : "border-zinc-800 bg-black/25"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-lg font-black text-white">{business.name}</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            {getBusinessStageName(business.stage)} • Risk {business.risk}/100
          </p>
        </div>
        {active && (
          <span className="shrink-0 rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-black text-black">
            Active
          </span>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-black/25 px-3 py-2">
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">Value</span>
          <span className="truncate text-sm font-black text-white">{formatMoney(business.value)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-black/25 px-3 py-2">
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">Revenue</span>
          <span className="truncate text-sm font-black text-white">{formatMoney(business.revenue)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-black/25 px-3 py-2">
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">Staff</span>
          <span className="text-sm font-black text-white">{business.employees}</span>
        </div>
      </div>
    </button>
  );
}

function BusinessTypeCard({
  type,
  canAfford,
  onClick,
}: {
  type: ReturnType<typeof getBusinessTypeById> extends infer T ? NonNullable<T> : never;
  canAfford: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition active:scale-[0.99] ${
        canAfford
          ? "border-zinc-800 bg-black/25 hover:border-orange-400/60"
          : "border-zinc-800 bg-black/20 opacity-70 hover:border-red-500/40"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/10 text-xl">
          {businessTypeIcon(type.id)}
        </span>
        <span className="rounded-full bg-zinc-950 px-2.5 py-1 text-xs font-black text-orange-300">
          {formatMoney(type.startCost)}
        </span>
      </div>

      <h4 className="mt-3 text-lg font-black text-white">{type.name}</h4>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
        {type.category}
      </p>
      <p className="mt-2 min-h-[54px] text-sm leading-5 text-zinc-400">{type.description}</p>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between rounded-xl bg-zinc-950/70 px-3 py-2">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">Risk</span>
          <span className="text-sm font-black text-white">{type.risk}/100</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-zinc-950/70 px-3 py-2">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">Difficulty</span>
          <span className="text-sm font-black text-white">{type.difficulty}/10</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-zinc-950/70 px-3 py-2">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">Upside</span>
          <span className="text-sm font-black text-white">{Math.round(type.revenuePotential * 100)}%</span>
        </div>
      </div>

      <span className={`mt-3 block rounded-xl px-3 py-2 text-center text-xs font-black ${
        canAfford ? "bg-orange-500 text-black" : "border border-red-500/30 bg-red-500/10 text-red-300"
      }`}>
        {canAfford ? "Start" : "Need Cash"}
      </span>
    </button>
  );
}

function BusinessMetricCard({
  emoji = "📊",
  label,
  value,
  helper,
}: {
  emoji?: string;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[1.4rem] bg-black/25 p-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">{emoji}</span>
        <p className="truncate text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      </div>
      <p className="mt-1 break-words text-lg font-black leading-6 text-white">{value}</p>
      <p className="mt-1 break-words text-xs leading-4 text-zinc-500">{helper}</p>
    </div>
  );
}


function BusinessActionCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group min-w-0 rounded-full bg-black/25 px-3 py-3 text-left transition hover:-translate-y-0.5 hover:bg-orange-500/10 active:scale-[0.99]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-orange-500/15 text-xl transition group-hover:scale-110">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-black leading-5 text-white">{title}</span>
          <span className="block truncate text-xs leading-5 text-zinc-500">{description}</span>
        </span>
        <span className="shrink-0 rounded-full bg-zinc-950/80 px-2.5 py-1 text-[11px] font-black text-orange-300 transition group-hover:bg-orange-500 group-hover:text-black">
          Go →
        </span>
      </div>
    </button>
  );
}

function businessTypeIcon(typeId: string) {
  if (typeId.includes("store")) return "🛒";
  if (typeId.includes("agency")) return "📣";
  if (typeId.includes("app")) return "📱";
  if (typeId.includes("game-studio")) return "🎮";
  if (typeId.includes("minecraft")) return "⛏️";
  if (typeId.includes("roblox")) return "🧱";
  if (typeId.includes("real-estate")) return "🏘️";
  return "🚀";
}

function CareerActionCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group rounded-[1.5rem] border border-zinc-800 bg-zinc-950/80 p-5 text-left transition hover:-translate-y-0.5 hover:border-orange-400/60 hover:bg-zinc-900 active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-orange-500/10 text-xl">
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block text-lg font-black text-white">{title}</span>
          <span className="mt-1 block break-words text-sm leading-5 text-zinc-400">{description}</span>
        </span>
      </div>
    </button>
  );
}

function DirectoryCard({
  icon,
  title,
  description,
  detail,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  detail?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group rounded-[1.5rem] border border-zinc-800 bg-zinc-950/80 p-5 text-left transition hover:-translate-y-0.5 hover:border-orange-400/60 hover:bg-zinc-900 active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-orange-500/10 text-xl">
            {icon}
          </span>
          <span className="min-w-0">
            <span className="block text-lg font-black text-white">{title}</span>
            <span className="mt-1 block break-words text-sm leading-5 text-zinc-400">{description}</span>
            {detail && (
              <span className="mt-3 inline-flex rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-xs font-black text-orange-300">
                {detail}
              </span>
            )}
          </span>
        </div>
        <span className="text-zinc-500 transition group-hover:translate-x-1 group-hover:text-orange-400">›</span>
      </div>
    </button>
  );
}

function SchoolVisual({ icon }: { icon: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-[linear-gradient(135deg,rgba(249,115,22,0.18),rgba(24,24,27,0.96),rgba(0,0,0,1))] p-4">
      <div className="absolute right-3 top-3 h-12 w-12 rounded-full bg-orange-500/20 blur-xl" />
      <div className="relative flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-black/35 text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="h-2 w-2/3 rounded-full bg-orange-300/40" />
          <div className="mt-2 h-2 w-1/2 rounded-full bg-zinc-200/20" />
          <div className="mt-2 h-2 w-3/4 rounded-full bg-zinc-200/10" />
        </div>
      </div>
    </div>
  );
}

function RelationshipProfileCard({
  icon,
  title,
  subtitle,
  rows,
}: {
  icon: string;
  title: string;
  subtitle: string;
  rows: string[][];
}) {
  return (
    <div className="rounded-[1.75rem] border border-zinc-800 bg-zinc-950/80 p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-500/10 text-2xl">
          {icon}
        </span>
        <div>
          <h3 className="text-xl font-black text-white">{title}</h3>
          <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {rows.map(([label, value]) => (
          <div
            key={`${label}-${value}`}
            className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-black/25 px-4 py-3"
          >
            <span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
              {label}
            </span>
            <span className="text-right text-sm font-black text-white">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionSubPage({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <>
      <button
        onClick={onBack}
        className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-black text-zinc-300 transition hover:border-orange-400"
      >
        ← Back
      </button>

      <h3 className="mb-4 text-2xl font-black">{title}</h3>

      <div className="space-y-3">{children}</div>
    </>
  );
}

function ActionCategory({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  const iconMap: Record<string, string> = {
    "Life & Growth": "🌱",
    Relationships: "💗",
    "Assets & Housing": "🏠",
    School: "🎓",
    Career: "💼",
    "Business & Investing": "💰",
  };

  return (
    <button
      onClick={onClick}
      className="group flex w-full min-w-0 items-center gap-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 text-left transition hover:-translate-y-0.5 hover:border-orange-400/70 hover:bg-zinc-900 hover:shadow-lg hover:shadow-orange-950/20 active:scale-[0.99]"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-orange-500/25 bg-orange-500/10 text-2xl shadow-lg shadow-black/20">
        {iconMap[title] || "⚡"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-3">
          <span className="block break-words text-base font-black text-white lg:text-lg">{title}</span>
          <span className="text-zinc-500 transition group-hover:translate-x-1 group-hover:text-orange-400">›</span>
        </span>
        <span className="mt-1 block break-words text-sm leading-5 text-zinc-400">
          {description}
        </span>
        <span className="mt-2 inline-flex rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-center text-xs font-black text-orange-400">
          Explore →
        </span>
      </span>
    </button>
  );
}

function ActionButton({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full min-w-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-left transition hover:border-orange-400 hover:bg-zinc-800 active:scale-[0.99]"
    >
      <span className="block text-base font-black text-white">{title}</span>
      <span className="mt-1 block break-words text-sm leading-5 text-zinc-400">
        {description}
      </span>
    </button>
  );
}


function PreAlphaPasswordGate({
  passwordInput,
  passwordError,
  setPasswordInput,
  onSubmit,
}: {
  passwordInput: string;
  passwordError: string;
  setPasswordInput: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.22),transparent_34%),linear-gradient(180deg,#09090b,#18181b)] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center">
        <section className="w-full rounded-[2rem] border border-orange-500/25 bg-zinc-950/90 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-7">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-400/30 bg-orange-500/10 text-2xl">
              ⚡
            </div>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-orange-400">
              ChargedLife Pre-Alpha
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
              Private Access
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              The game is not public yet. Enter the access password to continue testing.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="pre-alpha-password"
                className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500"
              >
                Password
              </label>
              <input
                id="pre-alpha-password"
                type="password"
                value={passwordInput}
                onChange={(event) => setPasswordInput(event.target.value)}
                placeholder="Enter password"
                autoComplete="off"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-base font-bold text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              />
              {passwordError && (
                <p className="mt-2 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
                  {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-black transition hover:bg-orange-400 active:scale-[0.98]"
            >
              Enter Game
            </button>
          </form>

          <p className="mt-5 text-center text-xs font-bold leading-5 text-zinc-500">
            Access is saved on this device after the correct password is entered.
          </p>
        </section>
      </div>
    </main>
  );
}

function TabCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[1.75rem] border border-zinc-800/80 bg-zinc-950/80 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl lg:p-6">
      <h2 className="mb-5 text-2xl font-black tracking-tight">{title}</h2>
      {children}
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
  helper,
  extraClass = "",
  compact = false,
}: {
  icon: string;
  label: string;
  value: string;
  helper: string;
  extraClass?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900/70 ${
        compact ? "p-2.5" : "p-4"
      } ${extraClass}`}
    >
      <p className="flex min-w-0 items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500">
        <span className="shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
      </p>
      <p className={`${compact ? "mt-1 text-base" : "mt-2 text-xl"} truncate font-black text-white`}>
        {value}
      </p>
      <p className="mt-0.5 truncate text-[9px] font-bold text-zinc-500">{helper}</p>
    </div>
  );
}

function MainStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/80 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 break-words text-base font-black text-white">{value}</p>
    </div>
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-zinc-950 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-zinc-300">{label}</p>
        <p className="text-sm font-black text-orange-400">{value}</p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-orange-400"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}