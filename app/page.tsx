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
  buyCar,
  buyHome,
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
  getJobName,
  getLegacyRank,
  getLegacyScore,
  getRentalIncomeEstimate,
  getWorkPayPerClick,
  haveChild,
  hireEmployee,
  homeShop,
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
    hasAskedPromotionThisYear: savedLife.hasAskedPromotionThisYear || false,

    pendingLifeEvent: savedLife.pendingLifeEvent || null,
    popupMessage: savedLife.popupMessage || null,
    nextLifeEventAge: savedLife.nextLifeEventAge || savedLife.age + 2,
    lastLifeEventId: savedLife.lastLifeEventId || "",

    familyRelationship: savedLife.familyRelationship ?? 50,
    friendships: savedLife.friendships ?? 25,
    socialCircle: savedLife.socialCircle ?? 0,
    relationshipStatus: savedLife.relationshipStatus || "Single",
    partnerName: savedLife.partnerName || "",
    relationshipQuality: savedLife.relationshipQuality ?? 0,
    children: savedLife.children ?? 0,

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

    studentLoanStatus: savedLife.studentLoanStatus || "not_applied",
    studentLoanLimit: savedLife.studentLoanLimit || 0,
    studentLoanUsed: savedLife.studentLoanUsed || 0,

    business: savedLife.business || "None",
    businessValue: savedLife.businessValue || 0,
    businessStage: savedLife.businessStage || 0,
    businessEmployees: savedLife.businessEmployees || 0,
    businessRevenue: savedLife.businessRevenue || 0,
    businessRisk: savedLife.businessRisk || 0,
    businessesStarted: savedLife.businessesStarted || 0,

    lifetimeMilestones: savedLife.lifetimeMilestones || [],

    actionsLeft:
      savedLife.actionsLeft === undefined
        ? ACTIONS_PER_YEAR
        : savedLife.actionsLeft,
    yearNotes: savedLife.yearNotes || [],

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

      <div className="mt-5 lg:mt-6">
        {activeTab === "life" && (
          <TabCard title="Life Overview">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MainStat label="Age" value={`${life.age}`} />
              <MainStat label="Country" value={life.country} />
              <MainStat label="Background" value={life.background} />
              <MainStat label="Trait" value={life.trait} />
              <MainStat label="Difficulty" value={life.difficulty} />
              <MainStat label="Cash" value={formatMoney(life.cash)} />
              <MainStat label="Net Worth" value={formatMoney(life.netWorth)} />
              <MainStat label="Debt" value={formatMoney(life.debt)} />
              <MainStat label="Job" value={life.job} />
              <MainStat label="Housing" value={life.currentHousing.name} />
              <MainStat label="Business" value={life.business} />
              <MainStat label="Legacy" value={legacyScore.toLocaleString()} />
              <MainStat label="Cars" value={`${life.ownedCars.length}`} />
              <MainStat label="Homes" value={`${life.ownedHomes.length}`} />
            </div>

            <h3 className="mb-3 mt-6 text-lg font-black">Relationships</h3>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              <MainStat label="Family" value={`${life.familyRelationship}/100`} />
              <MainStat label="Friends" value={`${life.friendships}/100`} />
              <MainStat label="Social Circle" value={`${life.socialCircle}`} />
              <MainStat label="Status" value={life.relationshipStatus} />
              <MainStat label="Partner" value={life.partnerName || "None"} />
              <MainStat label="Children" value={`${life.children}`} />
            </div>
          </TabCard>
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
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1800px] gap-5 px-4 pb-28 pt-4 lg:px-6 lg:pb-8">
        <DesktopSidebar
          life={life}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <section className="mx-auto w-full max-w-md lg:max-w-none lg:flex-1">
          {content}
        </section>

        <DesktopRightRail life={life} legacyScore={legacyScore} />
      </div>

      <BottomNavigation activeTab={activeTab} onChange={setActiveTab} />
    </main>
  );
}

function DesktopSidebar({
  life,
  activeTab,
  onChange,
}: {
  life: LifeStats;
  activeTab: ActiveTab;
  onChange: (tab: ActiveTab) => void;
}) {
  const tabs: { id: ActiveTab; label: string; icon: string }[] = [
    { id: "life", label: "Life", icon: "🏠" },
    { id: "stats", label: "Stats", icon: "📊" },
    { id: "career", label: "Career", icon: "💼" },
    { id: "economy", label: "Money", icon: "💰" },
    { id: "actions", label: "Actions", icon: "⚡" },
    { id: "timeline", label: "Story", icon: "📜" },
  ];

  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 flex-col rounded-[1.75rem] border border-zinc-800/80 bg-zinc-950/80 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl lg:flex">
      <div className="px-2 py-3">
        <p className="text-xl font-black uppercase tracking-[0.22em] text-orange-400">
          ChargedLife
        </p>
      </div>

      <nav className="mt-4 space-y-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black transition ${
                isActive
                  ? "border border-orange-500/40 bg-orange-500/15 text-orange-300 shadow-lg shadow-orange-950/20"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-6 border-t border-zinc-800 pt-4">
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

      <div className="mt-auto rounded-3xl border border-zinc-800 bg-black/40 p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full border border-orange-500/40 bg-orange-500/10 text-sm font-black text-orange-400">
            CR
          </div>
          <div>
            <p className="text-sm font-black text-white">{life.name}</p>
            <p className="text-xs text-zinc-500">Age {life.age} • {life.job}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs font-bold text-zinc-500">
          <span>Level 1</span>
          <span>0 / 100 XP</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-900">
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
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[360px] shrink-0 space-y-4 overflow-y-auto pr-1 xl:block">
      <SidePanel title="Life at a Glance" action="View all stats">
        <div className="space-y-4">
          <RailStat icon="💚" label="Health" value={life.health} />
          <RailStat icon="🙂" label="Happiness" value={life.happiness} />
          <RailStat icon="⚡" label="Energy" value={Math.max(0, Math.min(100, life.discipline))} />
          <RailStat icon="👥" label="Social" value={life.friendships} />
        </div>
      </SidePanel>

      <SidePanel title="Recent Events" action="View all">
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
                <p className="text-sm font-bold leading-5 text-zinc-200">{event}</p>
                <p className="text-xs text-zinc-500">Age {life.age}</p>
              </div>
            </div>
          ))}
        </div>
      </SidePanel>

      <SidePanel title="Goals" action="View all">
        <div className="space-y-3">
          <GoalRow icon="🎓" label="Complete High School" />
          <GoalRow icon="💼" label="Get a Full-Time Job" />
          <GoalRow icon="💵" label="Reach $10,000 Net Worth" />
        </div>
      </SidePanel>

      <div className="rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/15 via-zinc-950 to-black p-5 shadow-xl shadow-orange-950/20">
        <p className="text-3xl text-orange-400">“</p>
        <p className="mt-1 text-sm leading-6 text-zinc-300">
          The best time to plant a tree was 20 years ago. The second best time is now.
        </p>
        <p className="mt-3 text-xs text-zinc-500">Legacy score: {legacyScore.toLocaleString()}</p>
      </div>
    </aside>
  );
}

function SidePanel({
  title,
  action,
  children,
}: {
  title: string;
  action?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800/80 bg-zinc-950/80 p-5 shadow-xl shadow-black/30 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-black text-white">{title}</h3>
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
}: {
  icon: string;
  label: string;
  value: number;
}) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 font-bold text-zinc-300">
          <span>{icon}</span>
          <span>{label}</span>
        </div>
        <span className="font-black text-zinc-200">{safeValue} / 100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
        <div
          className="h-full rounded-full bg-orange-500"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

function GoalRow({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-black/30 p-3">
      <div className="flex items-center gap-3 text-sm font-bold text-zinc-300">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="h-5 w-5 rounded-md border border-zinc-700" />
    </div>
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
          label="Work income"
          value={`${formatMoney(economy.workPayPerClick)}/click`}
          description={`If you work ${ACTIONS_PER_YEAR} times, you can earn ${formatMoney(
            economy.possibleWorkIncomePerYear
          )}.`}
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
  updateLife,
}: {
  life: LifeStats;
  actionPage: ActionPage;
  setActionPage: (page: ActionPage) => void;
  selectedJobCategory: JobCategory | null;
  setSelectedJobCategory: (category: JobCategory | null) => void;
  selectedSchoolCategory: SchoolCategory | null;
  setSelectedSchoolCategory: (category: SchoolCategory | null) => void;
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
    return (
      <ActionSubPage title="Relationships" onBack={() => setActionPage("main")}>
        <div className="grid grid-cols-2 gap-3">
          <MainStat label="Family" value={`${life.familyRelationship}/100`} />
          <MainStat label="Friends" value={`${life.friendships}/100`} />
          <MainStat label="Status" value={life.relationshipStatus} />
          <MainStat label="Partner" value={life.partnerName || "None"} />
          <MainStat label="Children" value={`${life.children}`} />
          <MainStat label="Quality" value={`${life.relationshipQuality}/100`} />
        </div>

        <ActionButton
          title="Spend Time With Family"
          description="Costs $250. Improves family relationship and happiness."
          onClick={() => updateLife(improveFamily(life))}
        />

        <ActionButton
          title="Make Friends"
          description="Costs $350. Improves friendships, charisma, and happiness."
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

        <ActionButton
          title="Propose Marriage"
          description="Only works if you are dating someone."
          onClick={() => updateLife(proposeMarriage(life))}
        />

        <ActionButton
          title="Have Child"
          description="Only works if married."
          onClick={() => updateLife(haveChild(life))}
        />
      </ActionSubPage>
    );
  }

  if (actionPage === "assets") {
    return (
      <ActionSubPage title="Assets & Housing" onBack={() => setActionPage("main")}>
        <HousingPanel life={life} updateLife={updateLife} />

        <AssetOverview life={life} />

        <ActionButton
          title="Maintain All Assets"
          description="Pay upkeep now. If you cannot pay, asset condition gets worse."
          onClick={() => updateLife(maintainAssets(life))}
        />

        <AssetSection
          title="Your Cars"
          emptyText="You do not own any cars yet."
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
          title="Your Homes"
          emptyText="You do not own any homes yet."
          assets={life.ownedHomes}
          render={(asset) => (
            <OwnedHomeCard
              key={asset.id}
              home={asset}
              isCurrentHome={life.currentHousing.homeAssetId === asset.id}
              onLive={() => updateLife(liveInHome(life, asset.id))}
              onRentOut={() => updateLife(rentOutHome(life, asset.id))}
              onStopRenting={() => updateLife(stopRentingOutHome(life, asset.id))}
              onFindTenant={() => updateLife(findTenant(life, asset.id))}
              onRentLevel={(level) =>
                updateLife(setHomeRentPriceLevel(life, asset.id, level))
              }
              onEnableManager={() =>
                updateLife(enablePropertyManager(life, asset.id))
              }
              onDisableManager={() =>
                updateLife(disablePropertyManager(life, asset.id))
              }
              onRenovate={() => updateLife(renovateHome(life, asset.id))}
              onSell={() => updateLife(sellHome(life, asset.id))}
            />
          )}
        />

        <AssetSection
          title="Car Market"
          emptyText="No cars available."
          assets={carShop}
          render={(asset) => (
            <MarketAssetCard
              key={asset.id}
              asset={asset}
              actionLabel="Buy Car"
              onClick={() => updateLife(buyCar(life, asset))}
            />
          )}
        />

        <AssetSection
          title="Home Market"
          emptyText="No homes available."
          assets={homeShop}
          render={(asset) => (
            <MarketAssetCard
              key={asset.id}
              asset={asset}
              actionLabel="Buy Home"
              onClick={() => updateLife(buyHome(life, asset))}
            />
          )}
        />
      </ActionSubPage>
    );
  }

  if (actionPage === "school") {
    if (!selectedSchoolCategory) {
      return (
        <ActionSubPage title="School" onBack={() => setActionPage("main")}>
          <StudentLoanPanel life={life} updateLife={updateLife} />

          <p className="mb-4 mt-5 text-sm leading-6 text-zinc-400">
            Choose a school. If you cannot pay with cash, you need an approved
            student loan.
          </p>

          <div className="grid grid-cols-1 gap-3">
            {schoolCategories.map((category) => (
              <ActionCategory
                key={category.id}
                title={category.label}
                description={category.description}
                onClick={() => setSelectedSchoolCategory(category.id)}
              />
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
        <StudentLoanPanel life={life} updateLife={updateLife} />

        <div className="mt-5 space-y-3">
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
    return (
      <ActionSubPage title="Career" onBack={() => setActionPage("main")}>
        <ActionButton
          title="Work"
          description={
            life.job === "Unemployed"
              ? "Do small jobs for quick cash. Pays $2,500 per click."
              : `Work as ${life.job}. Pays ${formatMoney(
                  getWorkPayPerClick(life)
                )}/click.`
          }
          onClick={() => updateLife(work(life))}
        />

        <ActionButton
          title="Ask for Promotion"
          description="Ask your boss for the next role in your career path."
          onClick={() => updateLife(chasePromotion(life))}
        />

        <ActionButton
          title="Apply for Job"
          description="Choose a job category, then apply for a specific job."
          onClick={() => {
            setSelectedJobCategory(null);
            setActionPage("apply");
          }}
        />
      </ActionSubPage>
    );
  }

  if (actionPage === "apply") {
    if (!selectedJobCategory) {
      return (
        <ActionSubPage title="Apply for Job" onBack={() => setActionPage("career")}>
          <div className="grid grid-cols-1 gap-3">
            {jobCategories.map((category) => (
              <ActionCategory
                key={category.id}
                title={category.label}
                description={category.description}
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
        <div className="space-y-3">
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
    return (
      <ActionSubPage
        title="Business & Investing"
        onBack={() => setActionPage("main")}
      >
        <div className="grid grid-cols-2 gap-3">
          <MainStat label="Cash" value={formatMoney(life.cash)} />
          <MainStat label="Debt" value={formatMoney(life.debt)} />
          <MainStat label="Business" value={life.business} />
          <MainStat label="Value" value={formatMoney(life.businessValue)} />
          <MainStat label="Employees" value={`${life.businessEmployees}`} />
          <MainStat label="Risk" value={`${life.businessRisk}/100`} />
          <MainStat
            label="Rental Income"
            value={formatMoney(getRentalIncomeEstimate(life))}
          />
          <MainStat
            label="Debt Interest"
            value={formatMoney(getDebtInterest(life))}
          />
        </div>

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
          title={life.business === "None" ? "Start Business" : "Grow Business"}
          description={
            life.business === "None"
              ? "Costs $5,000. Starts a small online business."
              : "Grow business value, revenue, and business stage."
          }
          onClick={() => updateLife(workOnBusiness(life))}
        />

        <ActionButton
          title="Hire Employee"
          description="Costs money, increases revenue and business value."
          onClick={() => updateLife(hireEmployee(life))}
        />

        <ActionButton
          title="Marketing Campaign"
          description="Can increase business value and revenue, but may raise risk."
          onClick={() => updateLife(marketingCampaign(life))}
        />

        <ActionButton
          title="Sell Business"
          description="Sell your current business for a market-based price."
          onClick={() => updateLife(sellBusiness(life))}
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

function HousingPanel({
  life,
  updateLife,
}: {
  life: LifeStats;
  updateLife: (life: LifeStats) => void;
}) {
  return (
    <div className="rounded-3xl border border-orange-500/30 bg-orange-500/10 p-5">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-400">
        Current Housing
      </p>

      <h3 className="mt-2 text-2xl font-black">{life.currentHousing.name}</h3>

      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Yearly housing cost:{" "}
        <span className="font-black text-white">
          {formatMoney(getHousingCost(life))}
        </span>
      </p>

      <button
        onClick={() => updateLife(moveOut(life))}
        className="mt-4 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-black text-zinc-300 transition hover:border-orange-400"
      >
        Move Out / No Housing
      </button>

      <h4 className="mb-3 mt-5 text-lg font-black">Rent Housing</h4>

      <div className="space-y-3">
        {housingOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => updateLife(rentHousing(life, option))}
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-left transition hover:border-orange-400 hover:bg-zinc-800 active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-white">{option.name}</p>
                <p className="mt-1 text-sm leading-5 text-zinc-400">
                  {option.description}
                </p>
              </div>

              <p className="shrink-0 text-sm font-black text-red-300">
                {formatMoney(option.yearlyCost)}/yr
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
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
        <div className="mt-3 space-y-3">
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
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <AssetHeader asset={car} />

      <div className="mt-3 grid grid-cols-3 gap-2">
        <RequirementPill label="Value" value={formatMoney(car.value)} />
        <RequirementPill label="Upkeep" value={formatMoney(car.upkeep)} />
        <RequirementPill label="Condition" value={car.condition} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={onService}
          className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-black transition hover:bg-orange-400 active:scale-[0.98]"
        >
          Service
        </button>

        <button
          onClick={onSell}
          className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-black text-red-300 transition hover:border-red-400 active:scale-[0.98]"
        >
          Sell
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

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <AssetHeader asset={home} />

      <div className="mt-3 grid grid-cols-3 gap-2">
        <RequirementPill label="Value" value={formatMoney(home.value)} />
        <RequirementPill label="Upkeep" value={formatMoney(home.upkeep)} />
        <RequirementPill label="Condition" value={home.condition} />
      </div>

      <div className="mt-3 rounded-2xl bg-zinc-950 p-3">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-400">
          Rental System
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <RequirementPill label="Listed" value={listed ? "Yes" : "No"} />
          <RequirementPill
            label="Status"
            value={home.rentalStatus || "Vacant"}
          />
          <RequirementPill
            label="Rent Level"
            value={home.rentPriceLevel || "Market"}
          />
          <RequirementPill
            label="Rent"
            value={formatMoney(getAdjustedRentIncome(home))}
          />
          <RequirementPill label="Tenant" value={home.tenantName || "None"} />
          <RequirementPill
            label="Quality"
            value={home.tenantQuality || "None"}
          />
          <RequirementPill
            label="Lease"
            value={`${home.tenantYearsRemaining || 0} year(s)`}
          />
          <RequirementPill
            label="Manager"
            value={
              managerEnabled ? `${home.propertyManager?.feePercent || 10}%` : "No"
            }
          />
        </div>

        {home.lastRentalEventMessage && (
          <p className="mt-3 rounded-xl bg-zinc-900 p-3 text-xs leading-5 text-zinc-400">
            {home.lastRentalEventMessage}
          </p>
        )}
      </div>

      {isCurrentHome && (
        <p className="mt-3 rounded-xl bg-orange-500/10 p-3 text-xs font-black text-orange-300">
          You currently live here.
        </p>
      )}

      {occupied && (
        <p className="mt-3 rounded-xl bg-green-500/10 p-3 text-xs font-black text-green-300">
          This property has a tenant.
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={onLive}
          className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-black text-zinc-200 transition hover:border-orange-400 active:scale-[0.98]"
        >
          Live Here
        </button>

        <button
          onClick={listed ? onStopRenting : onRentOut}
          className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-black transition hover:bg-orange-400 active:scale-[0.98]"
        >
          {listed ? "Stop Rent" : "Rent Out"}
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
          Renovate
        </button>

        <button
          onClick={onSell}
          className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-black text-red-300 transition hover:border-red-400 active:scale-[0.98]"
        >
          Sell
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          onClick={() => onRentLevel("Low")}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-2 py-2 text-xs font-black text-zinc-300 transition hover:border-green-400"
        >
          Low Rent
        </button>

        <button
          onClick={() => onRentLevel("Market")}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-2 py-2 text-xs font-black text-zinc-300 transition hover:border-orange-400"
        >
          Market
        </button>

        <button
          onClick={() => onRentLevel("High")}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-2 py-2 text-xs font-black text-zinc-300 transition hover:border-red-400"
        >
          High Rent
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
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-left transition hover:border-orange-400 hover:bg-zinc-800 active:scale-[0.99]"
    >
      <AssetHeader asset={asset} />

      <div className="mt-3 grid grid-cols-3 gap-2">
        <RequirementPill label="Price" value={formatMoney(asset.value)} />
        <RequirementPill label="Upkeep" value={formatMoney(asset.upkeep)} />
        <RequirementPill label="Condition" value={asset.condition} />
      </div>

      <p className="mt-3 rounded-full bg-orange-500 px-3 py-2 text-center text-xs font-black text-black">
        {actionLabel}
      </p>
    </button>
  );
}

function AssetHeader({ asset }: { asset: OwnedAsset }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-black text-white">{asset.name}</p>
        <p className="mt-1 text-sm text-zinc-400">
          {asset.type === "car" ? "Car" : "Home"}
        </p>
      </div>

      <ConditionBadge condition={asset.condition} />
    </div>
  );
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
  const actionsFull = actionsUsed >= ACTIONS_PER_YEAR;

  return (
    <div className="sticky top-0 z-20 -mx-4 border-b border-zinc-900/80 bg-[#050505]/90 px-4 pb-4 pt-2 backdrop-blur-xl lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0">
      <div className="overflow-hidden rounded-[2rem] border border-orange-500/25 bg-gradient-to-br from-zinc-950 via-[#0d0d10] to-black p-5 shadow-2xl shadow-orange-950/25 lg:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="hidden h-16 w-16 shrink-0 place-items-center rounded-full border border-orange-400/40 bg-orange-500/10 shadow-lg shadow-orange-500/20 lg:grid">
              <span className="text-3xl">⚡</span>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-orange-400">
                ChargedLife
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight lg:text-4xl">
                {life.name}
              </h1>
              <p className="mt-1 text-base font-medium text-zinc-400">
                Age {life.age} • {life.job}
              </p>
            </div>
          </div>

          <button
            onClick={onRestart}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-xs font-black text-zinc-400 transition hover:border-red-400 hover:text-red-300"
          >
            Reset
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 lg:max-w-3xl">
          <MiniStat icon="💵" label="Cash" value={formatMoney(life.cash)} />
          <MiniStat icon="📈" label="Net Worth" value={formatMoney(life.netWorth)} />
          <MiniStat
            icon="🎯"
            label="Actions"
            value={`${actionsUsed}/${ACTIONS_PER_YEAR}`}
          />
        </div>

        <button
          onClick={onEndYear}
          className={`mt-5 w-full rounded-2xl px-5 py-5 text-lg font-black text-black shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 active:scale-[0.98] lg:max-w-3xl ${
            actionsFull
              ? "bg-orange-400 hover:bg-orange-300"
              : "bg-orange-500 hover:bg-orange-400"
          }`}
        >
          {actionsFull ? "End Year — Ready" : "End Year"}
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
      className="group flex w-full items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 text-left transition hover:-translate-y-0.5 hover:border-orange-400/70 hover:bg-zinc-900 hover:shadow-lg hover:shadow-orange-950/20 active:scale-[0.99] lg:min-h-[140px] lg:flex-col lg:items-start"
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
        <span className="mt-4 hidden rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-center text-xs font-black text-orange-400 lg:block">
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
}: {
  label: string;
  value: string;
  icon?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/80 p-3 shadow-lg shadow-black/10 lg:p-4">
      <div className="flex items-center gap-2">
        {icon && <span className="text-base">{icon}</span>}
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
          {label}
        </p>
      </div>
      <p className="mt-2 truncate text-base font-black text-white lg:text-xl">{value}</p>
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