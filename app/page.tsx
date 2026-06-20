"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ACTIONS_PER_YEAR,
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
  launchProduct,
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
  dismissPopup,
  doLifeGrowth,
  enablePropertyManager,
  endYear,
  findTenant,
  formatEventEffect,
  getActionsUsed,
  getAdjustedRentIncome,
  getAssetUpkeep,
  getAssetValue,
  getCurrentJob,
  getCurrentJobExperience,
  getDebtInterest,
  getEconomyBreakdown,
  getHousingCost,
  getItemValue,
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
  getWorkPayPerClick,
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
  payDebt,
  proposeMarriage,
  renovateHome,
  rentHousing,
  rentOutHome,
  sellBusiness,
  sellCar,
  sellHome,
  sellItem,
  serviceCar,
  setHomeRentPriceLevel,
  stopRentingOutHome,
  takeLoan,
  takeRisk,
  work,
  workOnBusiness,
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

function normalizeLife(savedLife: LifeStats): LifeStats {
  return {
    ...savedLife,

    jobId: savedLife.jobId || "unemployed",
    job: savedLife.job || "Unemployed",
    jobTrack: savedLife.jobTrack || "none",
    salary: savedLife.salary || 0,
    careerLevel: savedLife.careerLevel || 0,
    careerXp: savedLife.careerXp || 0,
    jobExperience: savedLife.jobExperience || {},
    stress: savedLife.stress ?? 35,
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
      lastServicedAge: asset.lastServicedAge || savedLife.age,
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
      lastServicedAge: asset.lastServicedAge || savedLife.age,
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
      lastServicedAge: asset.lastServicedAge || savedLife.age,
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
    businessesStarted: savedLife.businessesStarted || 0,

    lifetimeMilestones: savedLife.lifetimeMilestones || [],

    actionsLeft:
      savedLife.actionsLeft === undefined
        ? ACTIONS_PER_YEAR
        : savedLife.actionsLeft,
    yearNotes: savedLife.yearNotes || [],
    lastYearRecap: savedLife.lastYearRecap || null,

    yearsWorked: savedLife.yearsWorked || 0,
    yearsStudied: savedLife.yearsStudied || 0,
    riskTaken: savedLife.riskTaken || 0,

    eventLog: savedLife.eventLog || [],
    isDead: savedLife.isDead || false,
    deathReason: savedLife.deathReason || "",
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

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(life));
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
    setLife(normalizeLife(nextLife));
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

  function handleEndYear() {
    if (!life) return;

    const updated = endYear(life);
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
        onEndYear={handleEndYear}
      />

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

      {life.lastYearRecap && !life.pendingLifeEvent && (
        <YearRecapCard life={life} />
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
          <TabCard title="School & Career">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MainStat label="Education" value={life.education} />
              <MainStat label="Active Degree" value={getDegreeName(life.activeDegreeId)} />
              <MainStat label="Degree Progress" value={`${getDegreeProgress(life, life.activeDegreeId)}/100`} />
              <MainStat label="Student Loan" value={life.studentLoanStatus.replace("_", " ")} />
              <MainStat label="Loan Used" value={`${formatMoney(life.studentLoanUsed)}/${formatMoney(life.studentLoanLimit)}`} />
              <MainStat label="Job" value={life.job} />
              <MainStat label="Career Path" value={currentJob?.careerPath || "None"} />
              <MainStat label="Job Experience" value={life.jobId === "unemployed" ? "None" : `${getCurrentJobExperience(life)}`} />
              <MainStat label="Next Promotion" value={currentJob?.nextJobId ? getJobName(currentJob.nextJobId) : life.jobId === "unemployed" ? "Get a job first" : "Top role"} />
              <MainStat label="Salary" value={formatMoney(life.salary)} />
              <MainStat label="Work Pay" value={`${formatMoney(getWorkPayPerClick(life))}/click`} />
            </div>

            <h3 className="mb-3 mt-6 text-lg font-black">Business</h3>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MainStat label="Business" value={life.business} />
              <MainStat label="Value" value={formatMoney(life.businessValue)} />
              <MainStat label="Stage" value={`${life.businessStage}`} />
              <MainStat label="Employees" value={`${life.businessEmployees}`} />
              <MainStat label="Revenue" value={formatMoney(life.businessRevenue)} />
              <MainStat label="Risk" value={`${life.businessRisk}/100`} />
            </div>
          </TabCard>
        )}

        {activeTab === "economy" && economy && <EconomyPage life={life} economy={economy} />}

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
      </div>
    </>
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white selection:bg-orange-500 selection:text-black">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,106,0,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,106,0,0.10),transparent_30%)]" />
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
    { id: "career", label: "Career", icon: "💼" },
    { id: "economy", label: "Money", icon: "💰" },
    { id: "actions", label: "Actions", icon: "⚡" },
    { id: "timeline", label: "Story", icon: "📖" },
  ];

  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[228px] shrink-0 flex-col border-r border-zinc-900/90 bg-black/35 px-3 py-4 backdrop-blur-xl lg:flex xl:w-[238px]">
      <button
        onClick={onLogoHome}
        className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition hover:bg-zinc-900/70 active:scale-[0.99]"
        title="Go to Life overview"
      >
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-orange-500/40 bg-orange-500/10 text-lg shadow-lg shadow-orange-500/10">
          ⚡
        </div>
        <p className="min-w-0 truncate text-base font-black uppercase tracking-[0.14em] text-white">
          Charged<span className="text-orange-500">Life</span>
        </p>
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
        {[
          ["🎯", "Goals"],
          ["📅", "Calendar"],
          ["🏆", "Achievements"],
          ["⚙️", "Settings"],
        ].map(([icon, label]) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-zinc-500"
          >
            <span>{icon}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto rounded-3xl border border-zinc-800/80 bg-zinc-950/70 p-4 shadow-xl shadow-black/30">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full border border-orange-500/45 bg-orange-500/10 text-xs font-black text-orange-400">
            CR
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">{life.name}</p>
            <p className="text-xs text-zinc-500">Age {life.age} • {life.job}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs font-bold text-zinc-500">
          <span>Level 1</span>
          <span>0 / 100 XP</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-900">
          <div className="h-full w-[8%] rounded-full bg-orange-500" />
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
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,106,0,0.20),transparent_42%)]" />
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
        <div className="h-5 w-5 rounded-md border border-zinc-700" />
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
  const actionsUsed = getActionsUsed(life);
  const actionsLeft = Math.max(0, ACTIONS_PER_YEAR - actionsUsed);
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
              title={hasJob ? "Work a Shift" : "Apply for Part-Time Job"}
              description={
                hasJob
                  ? "Use one action to earn income and build experience."
                  : "Build experience, earn consistent income, and take your first step forward."
              }
              reward={hasJob ? `Reward: ${formatMoney(getWorkPayPerClick(life))}` : "Reward: Steady Income"}
              buttonLabel={hasJob ? "Go Work" : "Take Action"}
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

        <BusinessInvestmentsPanel life={life} onOpenTab={onOpenTab} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <FinancialSnapshotPanel life={life} monthlyIncome={monthlyIncome} />
        <GoalsProgressPanel life={life} />
        <StorySoFarPanel life={life} />
        <FocusForYearPanel life={life} netWorthProgress={netWorthProgress} onOpenActions={onOpenActions} />
      </div>

      <MilestonesUnlocksPanel
        life={life}
        actionsUsed={actionsUsed}
        hasJob={hasJob}
        educationDone={educationDone}
        netWorthProgress={netWorthProgress}
        legacyScore={legacyScore}
      />
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
  onOpenTab,
}: {
  life: LifeStats;
  onOpenTab: (tab: ActiveTab) => void;
}) {
  const hasBusiness = life.business !== "None";

  return (
    <DashboardPanel title="Business & Investments" icon="2" action="Coming Soon" iconMode="number">
      <div className="rounded-[1.35rem] border border-zinc-800/70 bg-[radial-gradient(circle_at_right,rgba(249,115,22,0.12),transparent_38%),linear-gradient(135deg,rgba(39,39,42,0.34),rgba(0,0,0,0.20))] p-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_170px] lg:items-center">
          <div>
            <p className="text-lg font-black text-white">
              {hasBusiness ? life.business : "No business yet"}
            </p>
            <p className="mt-2 max-w-xl text-xs leading-5 text-zinc-400">
              {hasBusiness
                ? `Your company is worth ${formatMoney(life.businessValue)} with ${life.businessEmployees} employee(s). Keep building revenue and reduce risk over time.`
                : "Your empire starts with a single decision. Business gameplay will expand into startups, products, teams, investors, and exits."}
            </p>
          </div>
          <div className="hidden h-24 rounded-3xl border border-orange-500/20 bg-black/25 p-4 lg:block">
            <div className="flex h-full items-end gap-2">
              {[24, 42, 32, 58, 74].map((height, index) => (
                <div key={index} className="flex-1 rounded-t-lg bg-orange-500/70" style={{ height: `${height}%` }} />
              ))}
              <span className="ml-2 text-3xl">📈</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-[1.25rem] border border-zinc-800/70 bg-black/25 p-3.5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
            Potential Income Streams
          </p>
          <div className="mt-3 space-y-2.5">
            {[
              ["Online Business", 18],
              ["E-Commerce Store", 10],
              ["Content Creation", 15],
              ["Real Estate", 8],
              ["Investments", 22],
            ].map(([label, width]) => (
              <div key={label as string} className="grid grid-cols-[1fr_76px] items-center gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                  <span className="text-orange-400">●</span>
                  <span>{label}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-900">
                  <div className="h-full rounded-full bg-orange-500/70" style={{ width: `${width}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-zinc-800/70 bg-black/25 p-3.5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
            Startup Ideas
          </p>
          <div className="mt-3 space-y-2.5 text-sm font-bold text-zinc-300">
            <p>🟠 Eco-Friendly Product Brand</p>
            <p>🟠 AI Productivity Tool</p>
            <p>🟠 Digital Learning Platform</p>
          </div>
          <button
            onClick={() => onOpenTab("economy")}
            className="mt-4 w-full rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-xs font-black text-zinc-400 transition hover:border-orange-500/50 hover:text-orange-300"
          >
            Explore Business Hub 🔒
          </button>
        </div>
      </div>
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
  const expenses = Math.max(0, getHousingCost(life) + getAssetUpkeep(life));
  const savings = Math.max(0, monthlyIncome - Math.round(expenses / 12));
  const savingsRate = monthlyIncome > 0 ? Math.max(0, Math.min(100, Math.round((savings / monthlyIncome) * 100))) : 0;
  const chart = [20, 38, 45, 62, 70, 86];

  return (
    <DashboardPanel title="Financial Snapshot" icon="3" action="This Year⌄" iconMode="number">
      <div className="grid gap-4 lg:grid-cols-[150px_minmax(0,1fr)]">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <FinanceMini label="Income" value={formatMoney(monthlyIncome)} tone="green" />
          <FinanceMini label="Expenses" value={formatMoney(Math.round(expenses / 12))} tone="red" />
          <FinanceMini label="Savings" value={formatMoney(savings)} tone="blue" />
          <FinanceMini label="Debt" value={formatMoney(life.debt)} tone="purple" />
        </div>

        <div className="rounded-[1.25rem] border border-zinc-800/70 bg-black/25 p-3.5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Cash Flow</p>
            <p className="text-xs font-black text-green-400">Savings {savingsRate}%</p>
          </div>
          <div className="flex h-24 items-end gap-2 border-b border-l border-zinc-800/80 px-2 pb-2">
            {chart.map((height, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-lg bg-green-500/75" style={{ height: `${height}%` }} />
                <span className="text-[10px] text-zinc-600">{["Jan", "Feb", "Mar", "Apr", "May", "Jun"][index]}</span>
              </div>
            ))}
          </div>
          <button className="mt-4 text-xs font-black text-orange-400">View Detailed Finances →</button>
        </div>
      </div>
    </DashboardPanel>
  );
}

function FinanceMini({ label, value, tone }: { label: string; value: string; tone: "green" | "red" | "blue" | "purple" }) {
  const colors = {
    green: "text-green-400",
    red: "text-red-400",
    blue: "text-blue-400",
    purple: "text-purple-400",
  };

  return (
    <div className="rounded-2xl bg-black/25 p-2.5">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className={`mt-1 text-lg font-black ${colors[tone]}`}>{value}</p>
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
    <DashboardPanel title="Focus For This Year" icon="5" iconMode="number">
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
  actionsUsed,
  hasJob,
  educationDone,
  netWorthProgress,
  legacyScore,
}: {
  life: LifeStats;
  actionsUsed: number;
  hasJob: boolean;
  educationDone: boolean;
  netWorthProgress: number;
  legacyScore: number;
}) {
  const milestones = [
    ["🧭", "Getting Started", "Begin your journey", true],
    ["⚡", "First Steps", "Complete 10 actions", actionsUsed >= 10],
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
              <p className="text-xs text-zinc-500">Complete 10 actions</p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-900">
            <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min(100, actionsUsed * 10)}%` }} />
          </div>
          <div className="mt-3 flex justify-between text-xs font-bold text-zinc-500">
            <span>{actionsUsed} / 10</span>
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
}: {
  life: LifeStats;
  economy: EconomyBreakdown;
}) {
  const positivePassive = economy.netPassiveYear >= 0;
  const hasNoExpenses = economy.totalExpenses <= 0;

  return (
    <TabCard title="Economy">
      <div className="rounded-3xl border border-orange-500/30 bg-orange-500/10 p-5">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-400">
          Financial Status
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <MainStat label="Cash" value={formatMoney(life.cash)} />
          <MainStat label="Net Worth" value={formatMoney(life.netWorth)} />
          <MainStat label="Debt" value={formatMoney(life.debt)} />
          <MainStat label="Assets" value={formatMoney(economy.totalAssets)} />
        </div>
      </div>

      <div
        className={`mt-5 rounded-3xl border p-5 ${
          hasNoExpenses
            ? "border-zinc-700 bg-zinc-900"
            : positivePassive
              ? "border-green-500/30 bg-green-500/10"
              : "border-red-500/30 bg-red-500/10"
        }`}
      >
        <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
          Passive Year
        </p>

        <p
          className={`mt-2 text-3xl font-black ${
            hasNoExpenses
              ? "text-zinc-200"
              : positivePassive
                ? "text-green-400"
                : "text-red-400"
          }`}
        >
          {formatMoney(economy.netPassiveYear)}
        </p>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          {hasNoExpenses
            ? "You currently have no yearly expenses."
            : "Business income plus rental income minus housing, upkeep, debt interest, and property manager fees."}
        </p>
      </div>

      <h3 className="mb-3 mt-6 text-lg font-black">Income</h3>

      <div className="space-y-3">
        <SimpleMoneyRow
          label="Full-time work"
          value={`${formatMoney(economy.workPayPerClick)}/action`}
          description={
            life.jobId === "unemployed"
              ? "Odd jobs give quick cash, but they are not a stable yearly income."
              : "This is what you earn when you use a Work Full-Time action. Salary is handled yearly."
          }
          type="income"
        />

        <SimpleMoneyRow
          label="Part-time jobs"
          value={formatMoney(getPartTimeIncome(life))}
          description={
            (life.partTimeJobs || []).length === 0
              ? "You do not have any part-time jobs yet."
              : "This is the yearly income from your active part-time jobs."
          }
          type="income"
        />

        <SimpleMoneyRow
          label="Business income"
          value={formatMoney(economy.businessIncomeEstimate)}
          description={
            life.business === "None"
              ? "You do not own a business yet."
              : "Estimated passive yearly income from your business."
          }
          type="income"
        />

        <SimpleMoneyRow
          label="Rental income"
          value={formatMoney(economy.rentalIncomeEstimate)}
          description={`${economy.occupiedRentals} occupied rental(s), ${economy.vacantRentals} vacant rental(s).`}
          type="income"
        />
      </div>

      <h3 className="mb-3 mt-6 text-lg font-black">Expenses</h3>

      <div className="space-y-3">
        <SimpleMoneyRow
          label="Housing"
          value={formatMoney(economy.housingCost)}
          description={
            life.currentHousing.type === "none"
              ? "You have no selected housing, so yearly housing cost is $0."
              : `${life.currentHousing.name} yearly cost.`
          }
          type="expense"
        />

        <SimpleMoneyRow
          label="Asset upkeep"
          value={formatMoney(economy.assetUpkeep)}
          description="Cars and homes need upkeep. If you cannot pay, condition gets worse."
          type="expense"
        />

        <SimpleMoneyRow
          label="Debt interest"
          value={formatMoney(economy.debtInterest)}
          description={
            life.debt <= 0
              ? "You have no debt, so interest is $0."
              : "Debt grows every year from interest."
          }
          type="expense"
        />

        <SimpleMoneyRow
          label="Property manager fees"
          value={formatMoney(economy.propertyManagerFees)}
          description="Managers take a percentage of collected rent."
          type="expense"
        />
      </div>
    </TabCard>
  );
}

function SimpleMoneyRow({
  label,
  value,
  description,
  type,
}: {
  label: string;
  value: string;
  description: string;
  type: "income" | "expense";
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-white">{label}</p>
          <p className="mt-1 text-sm leading-5 text-zinc-400">{description}</p>
        </div>

        <p
          className={`shrink-0 text-sm font-black ${
            type === "income" ? "text-green-400" : "text-red-300"
          }`}
        >
          {value}
        </p>
      </div>
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

            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5">
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
                    : `Salary: ${formatMoney(life.salary)}/year • Work pay: ${formatMoney(getWorkPayPerClick(life))}/action.`}
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
            title="Work Full-Time"
            description={
              life.job === "Unemployed"
                ? "Do basic odd jobs for quick cash while unemployed."
                : `Work as ${life.job}. Builds XP, cash, and career progress.`
            }
            onClick={() => updateLife(work(life))}
          />
          <CareerActionCard
            icon="📈"
            title="Focus at Work"
            description="Push performance and build promotion progress. Adds some stress."
            onClick={() => updateLife(focusAtWork(life))}
          />
          <CareerActionCard
            icon="⭐"
            title="Ask for Promotion"
            description="Ask your boss for the next role in your career path."
            onClick={() => updateLife(chasePromotion(life))}
          />
          <CareerActionCard
            icon="🚪"
            title="Quit Full-Time Job"
            description="Leave your current job. Reduces stress, but removes salary."
            onClick={() => updateLife(quitFullTimeJob(life))}
          />
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

        <div className="mt-5 rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-400">
                Part-Time Jobs
              </p>
              <h3 className="mt-2 text-2xl font-black text-white">
                Small jobs before the big career
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                Hold up to 2 part-time jobs. Work them once per year for extra income while studying or building a full-time career.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-black/30 px-4 py-3 text-right">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-zinc-500">Active</p>
              <p className="mt-1 text-lg font-black text-white">{activePartTimeJobs.length}/2</p>
            </div>
          </div>

          {activePartTimeJobs.length > 0 && (
            <div className="mt-4 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-black text-orange-200">Active part-time jobs</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Estimated yearly income: {formatMoney(getPartTimeIncome(life))}
                  </p>
                </div>
                <button
                  onClick={() => updateLife(workPartTimeJobs(life))}
                  className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-black transition hover:bg-orange-400 active:scale-[0.98]"
                >
                  Work Part-Time Jobs
                </button>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {activePartTimeJobs.map((job) => (
                  <div key={job.id} className="rounded-2xl border border-zinc-800 bg-black/25 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-white">{job.name}</p>
                        <p className="mt-1 text-sm text-zinc-400">{formatMoney(job.pay)}/year</p>
                      </div>
                      <button
                        onClick={() => updateLife(quitPartTimeJob(life, job.id))}
                        className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-black text-red-300 transition hover:border-red-400"
                      >
                        Quit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {partTimeJobOptions.map((job) => {
              const active = (life.partTimeJobs || []).includes(job.id);
              return (
                <button
                  key={job.id}
                  onClick={() => updateLife(takePartTimeJob(life, job.id))}
                  className={`rounded-[1.4rem] border p-4 text-left transition active:scale-[0.99] ${
                    active
                      ? "border-green-500/40 bg-green-500/10"
                      : "border-zinc-800 bg-black/25 hover:border-orange-400/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-white">{job.name}</p>
                      <p className="mt-1 text-sm leading-5 text-zinc-400">{job.description}</p>
                    </div>
                    <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-black text-orange-300">
                      {formatMoney(job.pay)}
                    </span>
                  </div>
                  <p className="mt-3 text-xs font-bold text-zinc-500">
                    Stress +{job.stressGain} • Discipline +{job.disciplineGain}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </ActionSubPage>
    );
  }

  if (actionPage === "apply") {
    if (!selectedJobCategory) {
      return (
        <ActionSubPage title="Apply for Job" onBack={() => setActionPage("career")}>
          <div className="rounded-[2rem] border border-orange-500/20 bg-orange-500/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-400">
              Job Directory
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">Choose a career path</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Pick a category first, then apply for a specific full-time job.
            </p>
          </div>

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

    return (
      <ActionSubPage
        title="Business & Investing"
        onBack={() => setActionPage("main")}
      >
        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-orange-500/25 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.15),transparent_34%),linear-gradient(180deg,rgba(20,20,24,0.98),rgba(9,9,11,0.98))] p-5">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-400">
              Business Empire
            </p>
            <h3 className="mt-2 text-3xl font-black text-white">
              {hasBusiness ? life.business : "Start your first business"}
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              {hasBusiness
                ? `${businessType?.description || "Build revenue, value, employees, brand, and long-term wealth."}`
                : "Choose a business type and start building a scalable path to success."}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MainStat label="Cash" value={formatMoney(life.cash)} />
              <MainStat label="Business Value" value={formatMoney(life.businessValue)} />
              <MainStat label="Stage" value={businessStageName} />
              <MainStat label="Risk" value={`${riskLabel} (${life.businessRisk}/100)`} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-400">
              Money Tools
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">Personal finance</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Manage debt and take risky money plays outside your business.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ActionButton
                title="Pay Debt"
                description="Pays up to $10,000 toward debt."
                onClick={() => updateLife(payDebt(life))}
              />
              <ActionButton
                title="Take Loan"
                description="Borrow money now, but debt grows with yearly interest."
                onClick={() => updateLife(takeLoan(life))}
              />
              <ActionButton
                title="Invest"
                description="Use finance, intelligence, and luck to grow money."
                onClick={() => updateLife(invest(life))}
              />
              <ActionButton
                title="Take Risk"
                description="High risk, high reward."
                onClick={() => updateLife(takeRisk(life))}
              />
            </div>
          </div>
        </div>

        {!hasBusiness ? (
          <div className="mt-5 rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-400">
                  Choose Business Type
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">What do you want to build?</h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                  Each business has different start cost, risk, difficulty, and upside.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {businessTypes.map((type) => (
                <BusinessTypeCard
                  key={type.id}
                  type={type}
                  canAfford={life.cash >= type.startCost}
                  onClick={() => updateLife(startBusiness(life, type.id))}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-4 xl:grid-cols-3">
              <BusinessMetricCard label="Revenue" value={formatMoney(life.businessRevenue)} helper="Yearly revenue base" />
              <BusinessMetricCard label="Payroll" value={formatMoney(life.businessPayroll)} helper={`${life.businessEmployees} employee${life.businessEmployees === 1 ? "" : "s"}`} />
              <BusinessMetricCard label="Ownership" value={`${life.businessOwnership || 100}%`} helper="Investor dilution" />
              <BusinessMetricCard label="Product Quality" value={`${life.businessProductQuality || 0}/100`} helper="Better launches" />
              <BusinessMetricCard label="Brand Strength" value={`${life.businessBrand || 0}/100`} helper="Marketing power" />
              <BusinessMetricCard label="Management" value={`${life.businessManagement || 0}/100`} helper="Controls risk" />
            </div>

            <div className="mt-5 rounded-[2rem] border border-zinc-800 bg-zinc-950/80 p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-400">
                Business Actions
              </p>
              <h3 className="mt-2 text-2xl font-black text-white">Build, scale, or exit</h3>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <BusinessActionCard
                  icon="🛠️"
                  title="Work on Business"
                  description="Grow value, revenue, quality, and management."
                  onClick={() => updateLife(workOnBusiness(life))}
                />
                <BusinessActionCard
                  icon="✨"
                  title="Improve Product"
                  description="Increase quality, lower risk, and improve value."
                  onClick={() => updateLife(improveProduct(life))}
                />
                <BusinessActionCard
                  icon="📣"
                  title="Marketing Campaign"
                  description="Grow brand and revenue, but risk can rise."
                  onClick={() => updateLife(marketingCampaign(life))}
                />
                <BusinessActionCard
                  icon="🚀"
                  title="Launch Product"
                  description="High upside launch. Can also fail badly."
                  onClick={() => updateLife(launchProduct(life))}
                />
                <BusinessActionCard
                  icon="👥"
                  title="Hire Employee"
                  description="Scale faster, but payroll and risk increase."
                  onClick={() => updateLife(hireEmployee(life))}
                />
                <BusinessActionCard
                  icon="🎓"
                  title="Train Employees"
                  description="Improve management and reduce long-term risk."
                  onClick={() => updateLife(trainEmployees(life))}
                />
                <BusinessActionCard
                  icon="✂️"
                  title="Cut Costs"
                  description="Reduce risk and improve control."
                  onClick={() => updateLife(cutCosts(life))}
                />
                <BusinessActionCard
                  icon="💼"
                  title="Seek Investor"
                  description="Raise cash but sell ownership."
                  onClick={() => updateLife(seekInvestor(life))}
                />
              </div>

              <div className="mt-4">
                <ActionButton
                  title="Sell Business"
                  description="Take the exit and sell your current business for a market-based price."
                  onClick={() => updateLife(sellBusiness(life))}
                />
              </div>
            </div>
          </>
        )}
      </ActionSubPage>
    );
  }

  const actionsUsed = getActionsUsed(life);
  const actionsFull = actionsUsed >= ACTIONS_PER_YEAR;

  return (
    <>
      <div
        className={`mb-4 rounded-2xl border p-4 ${
          actionsFull
            ? "border-orange-400 bg-orange-500/15"
            : "border-orange-500/30 bg-orange-500/10"
        }`}
      >
        <p className="text-sm font-black text-orange-300">
          Actions used: {actionsUsed}/{ACTIONS_PER_YEAR}
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          {actionsFull
            ? "You have used all actions this year. Press End Year."
            : "Choose actions below. Press End Year when ready."}
        </p>
      </div>

      {life.yearNotes.length > 0 && (
        <div className="mb-4 rounded-2xl bg-zinc-900 p-4">
          <h3 className="mb-2 text-sm font-black text-zinc-300">This Year</h3>

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
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[38%] lg:block">
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
                ? "You are renting this place right now. It gives you a stable living setup and updates your yearly housing cost."
                : "You currently live in one of your owned properties. You can still renovate it or switch homes later."}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <CurrentHousingStat
              label="Housing Type"
              value={life.currentHousing.type === "none" ? "None" : currentIsOwned ? "Owned" : "Rent"}
            />
            <CurrentHousingStat
              label="Yearly Cost"
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
          <span className="font-black text-orange-300">ⓘ</span> Rent is paid yearly in advance. Utilities and extras may apply.
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
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-zinc-500">Yearly Cost</p>
          <p className="mt-1 text-2xl font-black text-white">{formatMoney(option.yearlyCost)}</p>
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
          Last service {serviceAge ?? "Unknown"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <InlineInfoCard label="Vehicle Value" value={formatMoney(car.value)} />
        <InlineInfoCard label="Yearly Upkeep" value={formatMoney(car.upkeep)} />
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
        <InlineInfoCard label="Yearly Upkeep" value={formatMoney(home.upkeep)} />
        <InlineInfoCard label="Condition" value={home.condition} tone={conditionTone(home.condition)} />
        <InlineInfoCard label="Rent Income" value={formatMoney(getAdjustedRentIncome(home))} tone={occupied ? "success" : "neutral"} />
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
        <InlineInfoCard label="Yearly Care" value={formatMoney(item.upkeep)} />
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
            A quick summary of what changed this year.
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
              No major goals completed this year. Keep building toward your next milestone.
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
  const netWorthProgress = Math.min(100, Math.floor((life.netWorth / 10000) * 100));
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
    <div className="mt-4 rounded-3xl border border-orange-400 bg-zinc-950 p-5 shadow-xl shadow-orange-950/30">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-400">
        Message
      </p>

      <p className="mt-2 text-sm leading-6 text-zinc-200">{message}</p>

      <button
        onClick={onClose}
        className="mt-4 w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-black transition hover:bg-orange-400 active:scale-[0.98]"
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
      className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-left transition hover:border-orange-400 hover:bg-zinc-800 active:scale-[0.99]"
    >
      <span className="block text-base font-black text-white">
        {action.name}
      </span>
      <span className="mt-1 block text-sm leading-5 text-zinc-400">
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

      <span className="mt-1 block text-sm leading-5 text-zinc-400">
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

      <span className="mt-1 block text-sm leading-5 text-zinc-400">
        {formatMoney(job.salary)}/year • Work pays{" "}
        {formatMoney(Math.floor(job.salary / ACTIONS_PER_YEAR))}/click
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
  onEndYear,
}: {
  life: LifeStats;
  onRestart: () => void;
  onEndYear: () => void;
}) {
  const actionsUsed = getActionsUsed(life);
  const actionsLeft = Math.max(0, ACTIONS_PER_YEAR - actionsUsed);
  const actionsFull = actionsUsed >= ACTIONS_PER_YEAR;
  const legacyScore = getLegacyScore(life);

  return (
    <div className="sticky top-0 z-20 -mx-4 border-b border-zinc-900/80 bg-[#050505]/92 px-4 pb-3 pt-2 backdrop-blur-xl lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0">
      <div className="overflow-hidden rounded-[1.45rem] border border-zinc-800/80 bg-gradient-to-br from-[#101217] via-[#090a0d] to-black p-3 shadow-2xl shadow-black/40">
        <div className="grid gap-3 lg:grid-cols-[82px_minmax(0,1fr)_170px] lg:items-start">
          <div className="hidden lg:block">
            <div className="grid h-16 w-16 place-items-center rounded-full border border-orange-500/50 bg-orange-500/10 text-2xl shadow-[0_0_35px_rgba(249,115,22,0.18)]">
              ⚡
            </div>
            <div className="ml-2 mt-[-8px] inline-flex rounded-xl border border-orange-500/25 bg-orange-500/20 px-2.5 py-0.5 text-[9px] font-black uppercase text-orange-100">
              Level 1
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-400 lg:text-[11px]">
                  Welcome Back
                </p>
                <h1 className="mt-1 truncate text-[1.55rem] font-black leading-none tracking-tight lg:text-2xl xl:text-[1.7rem]">
                  {life.name}
                </h1>
                <p className="mt-1 text-sm font-medium text-zinc-400">
                  Age {life.age} • {life.job}
                </p>
              </div>

              <button
                onClick={onRestart}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-xs font-black text-zinc-400 transition hover:border-red-400 hover:text-red-300 lg:hidden"
              >
                Reset
              </button>
            </div>

            <div className="mt-3 hidden items-center gap-3 lg:flex">
              <p className="whitespace-nowrap text-xs font-bold text-zinc-500">0 / 100 XP</p>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-900">
                <div className="h-full w-[8%] rounded-full bg-orange-500" />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 lg:grid-cols-5">
              <MiniStat icon="💵" label="Cash" value={formatMoney(life.cash)} helper="+$250 this month" />
              <MiniStat icon="📈" label="Net Worth" value={formatMoney(life.netWorth)} helper="$0 this month" />
              <MiniStat icon="⚡" label="Actions Left" value={`${actionsLeft}/${ACTIONS_PER_YEAR}`} helper="Resets yearly" />
              <MiniStat icon="⭐" label="Level" value="1" helper="0 / 100 XP" extraClass="hidden lg:block" />
              <MiniStat icon="👥" label="Reputation" value={`${life.reputation}`} helper="Rookie" extraClass="hidden lg:block" />
            </div>
          </div>

          <div className="hidden h-full flex-col justify-between gap-3 lg:flex">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                Legacy Score
              </p>
              <p className="mt-1 text-2xl font-black text-orange-400">
                {legacyScore.toLocaleString()}
              </p>
              <p className="text-xs font-bold text-zinc-500">⭐ Rising Star</p>
            </div>
            <button
              onClick={onEndYear}
              className={`rounded-2xl px-4 py-3 text-left text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 active:scale-[0.98] ${
                actionsFull
                  ? "bg-orange-500 hover:bg-orange-400"
                  : "bg-orange-600 hover:bg-orange-500"
              }`}
            >
              <span className="flex items-center justify-between gap-3 text-base font-black">
                <span>Next Year</span>
                <span className="text-lg">→</span>
              </span>
              <span className="mt-1 block text-[11px] font-bold leading-4 text-orange-100/90">
                {actionsFull
                  ? "Ready — all actions used"
                  : `${actionsLeft} action${actionsLeft === 1 ? "" : "s"} left this year`}
              </span>
            </button>
          </div>
        </div>

        <button
          onClick={onEndYear}
          className={`mt-3 flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-3 text-sm font-black text-black shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 active:scale-[0.98] lg:hidden ${
            actionsFull
              ? "bg-orange-400 hover:bg-orange-300"
              : "bg-orange-500 hover:bg-orange-400"
          }`}
        >
          <span>Next Year</span>
          <span className="text-xs font-bold opacity-80">
            {actionsFull ? "Ready" : `${actionsLeft} left`}
          </span>
        </button>
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
  const selectedBackground = findBackground(origin.background);
  const selectedTrait = findTrait(origin.trait);
  const selectedDifficulty = findDifficulty(origin.difficulty);

  const backgroundNames = familyBackgrounds.map((item) => item.name);
  const traitNames = childhoodTraits.map((item) => item.name);
  const difficultyNames = difficulties.map((item) => item.name);

  function randomize() {
    setOrigin(
      createRandomOrigin(countries, backgroundNames, traitNames, difficultyNames)
    );
  }

  return (
    <main className="min-h-screen bg-[#090909] px-5 py-8 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <div className="rounded-3xl border border-orange-500/30 bg-zinc-950 p-6 shadow-2xl shadow-orange-950/40">
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.35em] text-orange-400">
              Charged Studios
            </p>
            <h1 className="text-5xl font-black tracking-tight">
              Charged<span className="text-orange-400">Life</span>
            </h1>
            <p className="mt-4 text-lg font-medium text-zinc-300">
              Start broke. Die legendary.
            </p>
          </div>

          <SetupProgress step={setupStep} />

          {setupStep === "name" && (
            <>
              <h2 className="text-2xl font-black">What is your name?</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                This is your character name for this life.
              </p>

              <input
                value={nameInput}
                onChange={(event) => setNameInput(event.target.value)}
                placeholder="Enter your name"
                className="mt-5 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-white outline-none transition focus:border-orange-400"
              />

              <button
                onClick={() => setSetupStep("country")}
                className="mt-5 w-full rounded-2xl bg-orange-500 px-5 py-4 text-lg font-black text-black transition hover:bg-orange-400 active:scale-[0.98]"
              >
                Continue
              </button>
            </>
          )}

          {setupStep === "country" && (
            <SetupChoice
              title="Choose your country"
              description="For now, country is mainly flavor. Later it can affect wages, taxes, and opportunities."
              value={origin.country}
              options={countries}
              onChange={(value) => setOrigin({ ...origin, country: value })}
              onBack={() => setSetupStep("name")}
              onNext={() => setSetupStep("background")}
            />
          )}

          {setupStep === "background" && (
            <SetupChoice
              title="Choose your family background"
              description={selectedBackground.description}
              value={origin.background}
              options={backgroundNames}
              onChange={(value) => setOrigin({ ...origin, background: value })}
              onBack={() => setSetupStep("country")}
              onNext={() => setSetupStep("trait")}
            />
          )}

          {setupStep === "trait" && (
            <SetupChoice
              title="Choose your childhood trait"
              description={selectedTrait.description}
              value={origin.trait}
              options={traitNames}
              onChange={(value) => setOrigin({ ...origin, trait: value })}
              onBack={() => setSetupStep("background")}
              onNext={() => setSetupStep("difficulty")}
            />
          )}

          {setupStep === "difficulty" && (
            <>
              <SetupChoice
                title="Choose difficulty"
                description={selectedDifficulty.description}
                value={origin.difficulty}
                options={difficultyNames}
                onChange={(value) => setOrigin({ ...origin, difficulty: value })}
                onBack={() => setSetupStep("trait")}
                onNext={onStartLife}
                nextLabel="Start Life"
              />

              <button
                onClick={randomize}
                className="mt-3 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4 text-sm font-black text-white transition hover:border-orange-400 hover:bg-zinc-800 active:scale-[0.98]"
              >
                Randomize Origin
              </button>
            </>
          )}
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

function SetupChoice({
  title,
  description,
  value,
  options,
  onChange,
  onBack,
  onNext,
  nextLabel = "Continue",
}: {
  title: string;
  description: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
}) {
  return (
    <>
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>

      <div className="mt-5 grid grid-cols-1 gap-3">
        {options.map((option) => {
          const selected = value === option;

          return (
            <button
              key={option}
              onClick={() => onChange(option)}
              className={`rounded-2xl border p-4 text-left font-black transition active:scale-[0.98] ${
                selected
                  ? "border-orange-400 bg-orange-500 text-black"
                  : "border-zinc-800 bg-zinc-900 text-white hover:border-orange-400"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
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
    </>
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
  return (
    <main className="min-h-screen bg-[#090909] px-5 py-8 text-white">
      <section className="mx-auto w-full max-w-md">
        <div className="rounded-3xl border border-orange-500/30 bg-zinc-950 p-6 shadow-2xl shadow-orange-950/40">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.35em] text-orange-400">
            Life Complete
          </p>

          <h1 className="text-4xl font-black">
            {life.name} died at age {life.age}
          </h1>

          <p className="mt-4 leading-7 text-zinc-400">{life.deathReason}</p>

          <div className="mt-6 rounded-3xl bg-zinc-900 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">
              Legacy Score
            </p>
            <p className="mt-2 text-5xl font-black text-orange-400">
              {legacyScore.toLocaleString()}
            </p>
            <p className="mt-2 text-xl font-bold">{getLegacyRank(legacyScore)}</p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <MainStat label="Final Cash" value={formatMoney(life.cash)} />
            <MainStat label="Net Worth" value={formatMoney(life.netWorth)} />
            <MainStat label="Job" value={life.job} />
            <MainStat label="Business" value={life.business} />
          </div>

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
    { id: "career", label: "Career", icon: "💼" },
    { id: "economy", label: "Money", icon: "💰" },
    { id: "actions", label: "Actions", icon: "⚡" },
    { id: "timeline", label: "Story", icon: "📖" },
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
      className={`rounded-[1.6rem] border p-5 text-left transition active:scale-[0.99] ${
        canAfford
          ? "border-zinc-800 bg-zinc-950/80 hover:-translate-y-0.5 hover:border-orange-400/60"
          : "border-zinc-800 bg-zinc-950/40 opacity-70 hover:border-red-500/40"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-500/10 text-2xl">
          {businessTypeIcon(type.id)}
        </span>
        <span className="rounded-full bg-black/35 px-3 py-1 text-xs font-black text-orange-300">
          {formatMoney(type.startCost)}
        </span>
      </div>

      <h4 className="mt-4 text-xl font-black text-white">{type.name}</h4>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
        {type.category}
      </p>
      <p className="mt-3 min-h-[60px] text-sm leading-5 text-zinc-400">{type.description}</p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <MiniAssetStat label="Risk" value={`${type.risk}/100`} />
        <MiniAssetStat label="Difficulty" value={`${type.difficulty}/10`} />
        <MiniAssetStat label="Upside" value={`${Math.round(type.revenuePotential * 100)}%`} />
      </div>

      <span className={`mt-4 block rounded-2xl px-4 py-3 text-center text-sm font-black ${
        canAfford ? "bg-orange-500 text-black" : "border border-red-500/30 bg-red-500/10 text-red-300"
      }`}>
        {canAfford ? "Start Business" : "Need More Cash"}
      </span>
    </button>
  );
}

function BusinessMetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950/80 p-5">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm text-zinc-400">{helper}</p>
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
      className="group rounded-[1.5rem] border border-zinc-800 bg-black/25 p-4 text-left transition hover:-translate-y-0.5 hover:border-orange-400/60 hover:bg-zinc-900 active:scale-[0.99]"
    >
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-500/10 text-xl">{icon}</span>
      <p className="mt-4 font-black text-white">{title}</p>
      <p className="mt-1 text-sm leading-5 text-zinc-400">{description}</p>
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
          <span className="mt-1 block text-sm leading-5 text-zinc-400">{description}</span>
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
            <span className="mt-1 block text-sm leading-5 text-zinc-400">{description}</span>
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
      className="group flex w-full items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 text-left transition hover:-translate-y-0.5 hover:border-orange-400/70 hover:bg-zinc-900 hover:shadow-lg hover:shadow-orange-950/20 active:scale-[0.99]"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-orange-500/25 bg-orange-500/10 text-2xl shadow-lg shadow-black/20">
        {iconMap[title] || "⚡"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-3">
          <span className="block text-base font-black text-white lg:text-lg">{title}</span>
          <span className="text-zinc-500 transition group-hover:translate-x-1 group-hover:text-orange-400">›</span>
        </span>
        <span className="mt-1 block text-sm leading-5 text-zinc-400">
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
      className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-left transition hover:border-orange-400 hover:bg-zinc-800 active:scale-[0.99]"
    >
      <span className="block text-base font-black text-white">{title}</span>
      <span className="mt-1 block text-sm leading-5 text-zinc-400">
        {description}
      </span>
    </button>
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
  label,
  value,
  icon,
  helper,
  extraClass = "",
}: {
  label: string;
  value: string;
  icon?: string;
  helper?: string;
  extraClass?: string;
}) {
  return (
    <div className={`rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-2.5 shadow-lg shadow-black/10 ${extraClass}`}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-sm">{icon}</span>}
        <p className="truncate text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-500 lg:text-[10px]">
          {label}
        </p>
      </div>
      <p className="mt-1.5 truncate text-base font-black text-white lg:text-lg">{value}</p>
      {helper && <p className="mt-1 hidden truncate text-[11px] font-bold text-zinc-500 lg:block">{helper}</p>}
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