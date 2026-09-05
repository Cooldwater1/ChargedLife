import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { CITY_DEFINITIONS, FAST_FOOD_UPGRADES, JOB_DEFINITIONS, ROLE_LABELS } from '@/game/constants/data';
import { PROPERTY_LISTINGS } from '@/game/constants/properties';
import { RENTAL_LISTINGS } from '@/game/constants/rentals';
import { VEHICLE_LISTINGS } from '@/game/constants/vehicles';
import { BOAT_LISTINGS } from '@/game/constants/boats';
import { AIRCRAFT_LISTINGS } from '@/game/constants/aircraft';
import { LUXURY_LISTINGS } from '@/game/constants/luxury';
import { EDUCATION_PROGRAMS } from '@/game/constants/education';
import { SUBSCRIPTION_CATALOG } from '@/game/constants/subscriptions';
import { WEDDING_TIERS } from '@/game/constants/balance';
import { COMPANY_PHONE_TIERS, COMPANY_VEHICLE_TIERS } from '@/game/constants/benefits';
import { INSTANT_DELIVERY_MAX_PREMIUM_PCT, INSTANT_DELIVERY_MIN_PREMIUM_PCT, WAREHOUSE_TIER_DEFS, getIngredientName } from '@/game/constants/inventory';
import { calculateOrderCost, getLocationStorageCapacity, getTotalStockUnits } from '@/game/simulation/inventory';
import {
  AUTO_LOAN_BASE_RATE,
  BUSINESS_LOAN_BASE_RATE,
  CAMPAIGN_DEFAULTS,
  DATE_COST_MAX,
  DATING_POOL_SIZE,
  DIVORCE_LEGAL_FEE,
  ENGAGEMENT_MIN_DAYS_BEFORE_WEDDING,
  EXCLUSIVE_RELATIONSHIP_THRESHOLD,
  HEADQUARTERS_TIERS,
  HOLDING_COMPANY_BASE_MONTHLY_OVERHEAD,
  MAX_LOAN_TERM_MONTHS,
  MORTGAGE_DOWNPAYMENT_PCT,
  MORTGAGE_RATE_ANNUAL,
  MORTGAGE_TERM_MONTHS,
  POSTPARTUM_COOLDOWN_DAYS,
  PROMOTION_REJECTION_BASE_CHANCE,
  PROPERTY_MAINTENANCE_PCT_OF_VALUE_MONTHLY,
  PROPOSAL_MIN_DAYS_TOGETHER,
  PROPOSAL_MIN_RELATIONSHIP,
  RECOMMENDED_BUSINESS_STARTUP_COST,
  RING_COST,
  SAVE_VERSION,
  STUDENT_LOAN_BASE_RATE,
  VEHICLE_DOWNPAYMENT_PCT,
  VEHICLE_LOAN_TERM_MONTHS,
} from '@/game/constants/balance';
import { createFastFoodBusiness, createFastFoodLocation, recalcMenuItemForTier } from '@/game/business/fastfood';
import { applyClosedSundays, applyOpen24_7, applyWeekdayPreset, applyWeekendPreset, copyDayToAllDays, copyDayToAllWeekdays, validateDaySchedule } from '@/game/business/schedule';
import { calculateLoanMonthlyPayment } from '@/game/simulation/economy';
import { calculateEmployeeHiringCost, candidateToEmployee } from '@/game/simulation/employees';
import { checkJobEligibility, getNextLadderJob } from '@/game/simulation/career';
import { calculateTuition, getProgram, rollScholarshipDiscount } from '@/game/simulation/education';
import {
  addMemory, assetGiftReactionModifier, callReactionModifier, candidateToPartner, generateChildName, generateDatingPool,
  generateGrandparentsFor, rollGiftRefusal, rollWindfallReaction, visitReactionModifier,
} from '@/game/simulation/family';
import { buyShares, sellShares } from '@/game/simulation/investments';
import { buildLoanApplicantProfile, rollLoanReviewDays, underwriteLoan } from '@/game/simulation/loans';
import { calculateDivorceSettlement } from '@/game/simulation/divorce';
import { calculateManagerHiringCost, type ManagerCandidate } from '@/game/simulation/delegation';
import { createBusinessFromAcquiredNpc } from '@/game/simulation/npcBusiness';
import { createInitialGameState, type NewGameOptions } from '@/game/state/initialState';
import { ensureGameStateShape, migrateSave } from '@/game/state/migrations';
import { advanceDay } from '@/game/time/timeEngine';
import { rollLifeEvent } from '@/game/simulation/lifeEvents';
import { rollConception } from '@/game/simulation/pregnancy';
import { generateId } from '@/lib/id';
import { createRng, nextSeed } from '@/lib/random';
import { CORPORATE_MANAGER_ROLES, DEFAULT_DELEGATION_SETTINGS } from '@/game/types';
import type {
  BusinessBudgetLimits,
  CampaignType,
  CEOAutomationSettings,
  CompanyPhoneTier,
  CompanyVehicleTier,
  DaySummary,
  DelegationControl,
  EmployeeBenefits,
  EventChoice,
  FundingSource,
  GameState,
  HeadquartersTier,
  HRAutomationSettings,
  IngredientTier,
  InventoryAutomationLevel,
  LifestyleCategory,
  LocationInventory,
  InstitutionTier,
  JobCandidate,
  LifeEventChoice,
  GiftableAssetType,
  GiftRecipient,
  LoanKind,
  PropertyUse,
  RecurringOrder,
  WarehouseTier,
  WeeklySchedule,
} from '@/game/types';

interface GameStore {
  game: GameState | null;
  hasHydrated: boolean;
  lastDaySummary: DaySummary | null;
  setHasHydrated: (v: boolean) => void;
  normalizeLoadedGame: () => void;

  startNewGame: (name: string, options?: NewGameOptions) => void;
  advanceDay: () => void;
  dismissDaySummary: () => void;

  applyForJob: (jobId: string) => void;
  quitJob: () => void;
  requestPromotion: () => void;
  requestRaise: () => void;

  enrollInEducation: (programId: string, tier: InstitutionTier, payWithLoan: boolean) => void;
  dropOutOfEducation: () => void;

  startBusiness: (params: { name: string; city: string; investment: number }) => void;
  openNewLocation: (businessId: string, city: string, investment: number) => void;
  hireEmployee: (businessId: string, locationId: string, candidate: JobCandidate, fundingSource: FundingSource) => void;
  fireEmployee: (businessId: string, employeeId: string) => void;
  giveRaise: (businessId: string, employeeId: string, newSalary: number) => void;

  setMenuItemPrice: (businessId: string, itemId: string, price: number) => void;
  setMenuItemActive: (businessId: string, itemId: string, active: boolean) => void;
  setIngredientTier: (businessId: string, itemId: string, tier: IngredientTier) => void;

  launchMarketingCampaign: (businessId: string, locationId: string | 'all', type: CampaignType) => void;
  purchaseUpgrade: (businessId: string, locationId: string, upgradeId: string, cost: number) => void;
  setWeeklySchedule: (businessId: string, locationId: string, schedule: WeeklySchedule) => void;
  applySchedulePreset: (businessId: string, locationId: string, preset: 'weekday' | 'weekend' | '24-7' | 'closed-sundays' | 'copy-to-weekdays' | 'copy-to-all', sourceDayIndex?: number, openHour?: number, closeHour?: number) => void;
  resolveBusinessEvent: (businessId: string, eventId: string, choice: EventChoice) => void;

  investInBusiness: (businessId: string, amount: number) => void;
  ownerDraw: (businessId: string, amount: number) => void;
  takeBusinessLoan: (businessId: string, amount: number, termMonths: number) => void;

  submitLoanApplication: (kind: LoanKind, businessId: string | null, amount: number, termMonths: number) => void;
  acceptCounterOffer: (applicationId: string) => void;
  declineLoanApplication: (applicationId: string) => void;

  depositSavings: (amount: number) => void;
  withdrawSavings: (amount: number) => void;

  toggleSubscription: (subscriptionId: string) => void;
  setLifestyleChoice: (category: LifestyleCategory, tierId: string | null) => void;
  toggleLifestyleStackable: (category: LifestyleCategory, tierId: string) => void;
  addSubscription: (catalogId: string) => void;
  cancelSubscription: (subscriptionId: string) => void;

  buyPropertyWithCash: (listingId: string, use: PropertyUse) => void;
  applyForPropertyMortgage: (listingId: string, use: PropertyUse, downPaymentAmount: number) => void;
  rentProperty: (listingId: string) => void;
  terminateLease: () => void;
  sellProperty: (propertyId: string) => void;
  relocate: (city: string) => void;

  buyVehicle: (listingId: string, financeWithLoan: boolean) => void;
  sellVehicle: (vehicleId: string) => void;
  buyBoat: (listingId: string) => void;
  sellBoat: (boatId: string) => void;
  buyAircraft: (listingId: string) => void;
  sellAircraft: (aircraftId: string) => void;
  buyLuxuryItem: (listingId: string) => void;
  sellLuxuryItem: (itemId: string) => void;
  giftAsset: (assetType: GiftableAssetType, assetId: string, recipient: GiftRecipient) => void;
  takeBoatTrip: (boatId: string) => void;
  flyAircraft: (aircraftId: string) => void;
  hostPropertyParty: (propertyId: string) => void;

  buyStock: (symbol: string, shares: number) => void;
  sellStock: (symbol: string, shares: number) => void;

  refreshDatingPool: () => void;
  goOnDate: (candidateId: string) => void;
  sendMessage: (candidateId: string) => void;
  giveGiftToCandidate: (candidateId: string, amount: number) => void;
  becomeExclusive: (candidateId: string) => void;
  spendTimeWithPartner: () => void;
  proposeMarriage: () => void;
  planWedding: (tierId: string, prenup: 'none' | 'standard' | 'strong') => void;
  breakUp: () => void;
  divorce: () => void;
  tryForBaby: () => void;

  callParent: (memberId: string) => void;
  visitFamily: (memberId: string) => void;
  giveFamilyGift: (memberId: string, amount: number) => void;
  viewFamilyMemberProfile: (memberId: string) => void; // ensures grandparents are generated on first view
  buyAssetForFamily: (memberId: string, kind: 'house' | 'car', amount: number) => void;
  payOffFamilyDebt: (memberId: string) => void;

  resolveLifeEvent: (eventId: string, choice: LifeEventChoice) => void;

  hireManager: (businessId: string, locationId: string | null, candidate: ManagerCandidate, fundingSource: FundingSource) => void;
  fireManager: (businessId: string, managerId: string) => void;
  setDelegationControl: (businessId: string, area: keyof typeof DEFAULT_DELEGATION_SETTINGS, control: DelegationControl) => void;
  updateHRSettings: (businessId: string, patch: Partial<HRAutomationSettings>) => void;
  updateCEOSettings: (businessId: string, patch: Partial<CEOAutomationSettings>) => void;
  setDividendPolicy: (businessId: string, pct: number) => void;
  setSubsidiaryCapitalBudget: (businessId: string, monthlyAmount: number) => void;

  rentHeadquarters: (businessId: string, tier: HeadquartersTier) => void;
  buyHeadquarters: (businessId: string, tier: HeadquartersTier) => void;

  updateEmployeeBenefits: (businessId: string, employeeId: string, patch: Partial<EmployeeBenefits>) => void;
  updateManagerBenefits: (businessId: string, managerId: string, patch: Partial<EmployeeBenefits>) => void;
  purchaseCompanyVehicle: (businessId: string, tier: CompanyVehicleTier, fundingSource: FundingSource) => void;
  purchaseCompanyPhone: (businessId: string, tier: CompanyPhoneTier, fundingSource: FundingSource) => void;
  assignCompanyVehicle: (businessId: string, vehicleId: string, assignee: { kind: 'employee' | 'manager'; id: string } | null) => void;
  assignCompanyPhone: (businessId: string, phoneId: string, assignee: { kind: 'employee' | 'manager'; id: string } | null) => void;
  setBudgetLimit: (businessId: string, department: keyof BusinessBudgetLimits, amount: number | null) => void;

  placeManualInventoryOrder: (businessId: string, locationId: string, ingredientId: string, quantity: number) => void;
  placeInstantInventoryOrder: (businessId: string, locationId: string, ingredientId: string, quantity: number) => void;
  addRecurringInventoryOrder: (businessId: string, locationId: string, ingredientId: string, quantity: number, orderWeekday: number) => void;
  updateRecurringInventoryOrder: (businessId: string, locationId: string, orderId: string, patch: Partial<Pick<RecurringOrder, 'quantity' | 'orderWeekday' | 'leadTimeDays' | 'supplierId' | 'active'>>) => void;
  removeRecurringInventoryOrder: (businessId: string, locationId: string, orderId: string) => void;
  runRecurringInventoryOrderNow: (businessId: string, locationId: string, orderId: string) => void;
  setInventoryAutomationLevel: (businessId: string, locationId: string, level: InventoryAutomationLevel) => void;
  setInventorySettings: (businessId: string, locationId: string, patch: Partial<Pick<LocationInventory, 'weeklyPurchasingBudget' | 'emergencyDeliveryAllowed' | 'maxEmergencyPremiumPct' | 'minStockTargetDays' | 'primarySupplierId'>>) => void;
  purchaseWarehouse: (businessId: string, tier: WarehouseTier, fundingSource: FundingSource) => void;

  createHoldingCompany: (name: string) => void;
  moveBusinessToHolding: (businessId: string, holdingId: string) => void;
  removeBusinessFromHolding: (businessId: string) => void;
  transferHoldingCapital: (holdingId: string, amount: number, direction: 'deposit' | 'withdraw') => void;

  submitAcquisitionOffer: (npcBusinessId: string, offerAmount: number) => void;
  acceptAcquisitionCounter: (offerId: string) => void;
  withdrawAcquisitionOffer: (offerId: string) => void;
  respondToIncomingOffer: (offerId: string, response: 'accept' | 'reject') => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  updateSettings: (patch: Partial<GameState['player']['settings']>) => void;

  // Beta / developer tools
  devAddCash: (amount: number) => void;
  devSetAge: (age: number) => void;
  devAdvanceDays: (days: number) => void;
  devAddBusinessCash: (businessId: string, amount: number) => void;
  devSetReputation: (businessId: string, reputation: number) => void;
  devUnlockAchievement: (achievementId: string) => void;
  devResetBusiness: (businessId: string) => void;
  devAddExperience: (years: number) => void;
  devCompleteDegree: () => void;
  devAddPartner: () => void;
  devAddChild: () => void;
  devTriggerEvent: () => void;
  devMoveMarket: (pct: number) => void;
  devSetRelationshipDays: (days: number) => void;
  devTriggerPregnancy: () => void;
  devAdvancePregnancyToDueDate: () => void;
  devGiveNpcMoney: (memberId: string, amount: number) => void;
  devSetFamilyRelationship: (memberId: string, value: number) => void;
  devSetNegativeCash: (amount: number) => void;
  resetSave: () => void;
}

/** Moving into an owned primary residence ends any active lease — you can't be renting and living in your own new home at once. Refunds the deposit like a normal move-out. */
function endCurrentLeaseOnMoveIn(game: GameState): void {
  if (!game.player.currentRental) return;
  const activeRental = game.player.currentRental;
  const listing = RENTAL_LISTINGS.find((r) => r.id === activeRental.listingId);
  game.player.cash += activeRental.deposit;
  game.transactions.push({
    id: generateId('tx'), timestamp: game.time.dayIndex, amount: activeRental.deposit,
    category: 'property_purchase', description: `Deposit returned from ${listing?.name ?? 'rental'} after moving into your new home`, source: 'personal',
  });
  game.player.currentRental = null;
}

export const useGameStore = create<GameStore>()(
  persist(
    immer((set, get) => ({
      game: null,
      hasHydrated: false,
      lastDaySummary: null,
      setHasHydrated: (v) => set((state) => { state.hasHydrated = v; }),
      // Zustand's persist `migrate` is only invoked when the stored version differs from the
      // current one — a save whose version already matches skips it entirely, even if fields
      // were added to that version's shape after the save was written. Running this
      // non-destructive backfill on every hydration (regardless of version) closes that gap.
      normalizeLoadedGame: () => set((state) => { if (state.game) state.game = ensureGameStateShape(state.game); }),

      startNewGame: (name, options) => set((state) => { state.game = createInitialGameState(name, options); }),

      advanceDay: () => {
        const { game } = get();
        if (!game || game.gameOver.isOver) return;
        const result = advanceDay(game);
        set((state) => { state.game = result.state; state.lastDaySummary = result.summary; });
      },

      dismissDaySummary: () => set((state) => { state.lastDaySummary = null; }),

      applyForJob: (jobId) => set((state) => {
        if (!state.game) return;
        const job = JOB_DEFINITIONS.find((j) => j.id === jobId);
        if (!job) return;
        const eligibility = checkJobEligibility(job, state.game.player.education, state.game.player.career);
        if (!eligibility.eligible) return;

        state.game.player.career.jobId = jobId;
        state.game.player.career.hiredAt = state.game.time.dayIndex;
        state.game.player.career.promotionProgress = 0;
        state.game.player.career.salaryOverride = 0;
        state.game.player.statistics.jobsHeld += 1;
        state.game.notifications.push({
          id: generateId('notif'), timestamp: state.game.time.dayIndex, title: 'New Job',
          message: `You started as ${job.title} at ${job.company}.`, severity: 'success', read: false,
        });
        state.game.player.timeline.push({
          id: generateId('timeline'), age: state.game.player.age, timestamp: state.game.time.dayIndex,
          title: 'Started a New Job', description: `Joined ${job.company} as ${job.title}.`,
        });
      }),

      quitJob: () => set((state) => {
        if (!state.game) return;
        state.game.player.career.jobId = null;
        state.game.player.career.hiredAt = null;
        state.game.player.career.promotionProgress = 0;
        state.game.player.career.salaryOverride = 0;
      }),

      requestPromotion: () => set((state) => {
        if (!state.game) return;
        const currentJob = JOB_DEFINITIONS.find((j) => j.id === state.game!.player.career.jobId);
        if (!currentJob || state.game.player.career.promotionProgress < 100) return;
        const nextJob = getNextLadderJob(JOB_DEFINITIONS, currentJob);
        if (!nextJob) return;
        const eligibility = checkJobEligibility(nextJob, state.game.player.education, state.game.player.career);
        if (!eligibility.eligible) return;

        const rejectionChance = PROMOTION_REJECTION_BASE_CHANCE * (1 - state.game.player.career.performanceScore / 130);
        const rng = createRng(nextSeed());
        if (rng() < rejectionChance) {
          state.game.player.career.promotionProgress = 60;
          state.game.notifications.push({
            id: generateId('notif'), timestamp: state.game.time.dayIndex, title: 'Promotion Denied',
            message: `You were not selected for ${nextJob.title} this time. Keep building your track record.`, severity: 'warning', read: false,
          });
          return;
        }

        state.game.player.career.jobId = nextJob.id;
        state.game.player.career.promotionProgress = 0;
        state.game.player.career.salaryOverride = 0;
        state.game.player.statistics.promotions += 1;
        state.game.notifications.push({
          id: generateId('notif'), timestamp: state.game.time.dayIndex, title: 'Promoted!',
          message: `Congratulations — you are now ${nextJob.title} at ${nextJob.company}.`, severity: 'success', read: false,
        });
        state.game.player.timeline.push({
          id: generateId('timeline'), age: state.game.player.age, timestamp: state.game.time.dayIndex,
          title: 'Promoted', description: `Promoted to ${nextJob.title}.`,
        });
      }),

      requestRaise: () => set((state) => {
        if (!state.game) return;
        const job = JOB_DEFINITIONS.find((j) => j.id === state.game!.player.career.jobId);
        if (!job) return;
        const lastRequest = state.game.player.career.lastRaiseRequestAt;
        if (lastRequest !== null && state.game.time.dayIndex - lastRequest < 90) return;

        const rng = createRng(nextSeed());
        const successChance = 0.3 + state.game.player.career.performanceScore / 200;
        state.game.player.career.lastRaiseRequestAt = state.game.time.dayIndex;

        if (rng() < successChance) {
          const raisePct = 0.05 + rng() * 0.07;
          const raiseAmount = Math.round(job.annualSalary * raisePct);
          state.game.player.career.salaryOverride += raiseAmount;
          state.game.notifications.push({
            id: generateId('notif'), timestamp: state.game.time.dayIndex, title: 'Raise Approved',
            message: `Your salary increased by $${raiseAmount.toLocaleString('en-US')}/year.`, severity: 'success', read: false,
          });
        } else {
          state.game.notifications.push({
            id: generateId('notif'), timestamp: state.game.time.dayIndex, title: 'Raise Denied',
            message: 'Your request for a raise was not approved this time.', severity: 'warning', read: false,
          });
        }
      }),

      enrollInEducation: (programId, tier, payWithLoan) => set((state) => {
        if (!state.game) return;
        const program = getProgram(programId);
        if (!program || state.game.player.education.enrolledProgramId) return;

        const rng = createRng(nextSeed());
        const scholarshipDiscount = rollScholarshipDiscount(rng);
        const tuition = Math.round(calculateTuition(program, tier) * (1 - scholarshipDiscount));

        if (payWithLoan) {
          const monthlyPayment = calculateLoanMonthlyPayment(tuition, STUDENT_LOAN_BASE_RATE, MAX_LOAN_TERM_MONTHS);
          const loanId = generateId('loan');
          state.game.player.bank.loans.push({
            id: loanId, kind: 'student', owner: 'personal', principal: tuition, remainingBalance: tuition,
            interestRateAnnual: STUDENT_LOAN_BASE_RATE, monthlyPayment, termMonths: MAX_LOAN_TERM_MONTHS,
            monthsRemaining: MAX_LOAN_TERM_MONTHS, takenAt: state.game.time.dayIndex,
          });
          state.game.player.education.studentLoanId = loanId;
          state.game.player.statistics.loansTaken += 1;
        } else {
          if (state.game.player.cash < tuition) return;
          state.game.player.cash -= tuition;
          state.game.transactions.push({
            id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -tuition,
            category: 'education_tuition', description: `Tuition — ${program.name}`, source: 'personal',
          });
        }

        state.game.player.education.enrolledProgramId = programId;
        state.game.player.education.institutionTier = tier;
        state.game.player.education.progressDays = 0;
        state.game.player.education.totalDaysRequired = program.durationDays;

        if (scholarshipDiscount > 0) {
          state.game.notifications.push({
            id: generateId('notif'), timestamp: state.game.time.dayIndex, title: 'Scholarship Awarded',
            message: `You received a ${Math.round(scholarshipDiscount * 100)}% scholarship on tuition.`, severity: 'success', read: false,
          });
        }
      }),

      dropOutOfEducation: () => set((state) => {
        if (!state.game) return;
        state.game.player.education.enrolledProgramId = null;
        state.game.player.education.institutionTier = null;
        state.game.player.education.progressDays = 0;
        state.game.player.education.totalDaysRequired = 0;
      }),

      startBusiness: ({ name, city, investment }) => set((state) => {
        if (!state.game || state.game.player.cash < investment) return;
        const business = createFastFoodBusiness({ name, city, investment, dayIndex: state.game.time.dayIndex });
        state.game.player.cash -= investment;
        state.game.player.statistics.businessesStarted += 1;
        state.game.businesses.push(business);
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -investment,
          category: 'business_investment', description: `Startup investment — ${name}`, source: 'personal',
        });
        state.game.player.timeline.push({
          id: generateId('timeline'), age: state.game.player.age, timestamp: state.game.time.dayIndex,
          title: 'Started a Business', description: `Founded ${name}.`,
        });
      }),

      openNewLocation: (businessId, city, investment) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        if (!state.game || !business || business.cash < investment) return;
        const location = createFastFoodLocation({ businessId, city, investment, dayIndex: state.game.time.dayIndex, isFirstLocation: false });
        business.cash -= investment;
        business.locations.push(location);
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -investment,
          category: 'business_investment', description: `Opened new location — ${location.name}`, source: `business:${businessId}`,
        });
      }),

      hireEmployee: (businessId, locationId, candidate, fundingSource) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        if (!state.game || !business) return;
        const hiringCost = calculateEmployeeHiringCost(candidate);
        const timestamp = state.game.time.dayIndex;
        if (fundingSource === 'personal') {
          if (state.game.player.cash < hiringCost) return;
          state.game.player.cash -= hiringCost;
          business.cash += hiringCost;
          state.game.transactions.push(
            { id: generateId('tx'), timestamp, amount: -hiringCost, category: 'business_investment', description: `Funded hiring cost for ${business.name}`, source: 'personal' },
            { id: generateId('tx'), timestamp, amount: hiringCost, category: 'business_investment', description: 'Owner investment', source: `business:${businessId}` },
          );
        } else if (business.cash < hiringCost) {
          return;
        }
        business.cash -= hiringCost;
        const employee = candidateToEmployee(candidate, locationId, businessId, timestamp);
        business.employees.push(employee);
        state.game.player.statistics.employeesHired += 1;
        state.game.transactions.push({
          id: generateId('tx'), timestamp, amount: -hiringCost, category: 'business_misc',
          description: `Hiring cost — ${employee.name} (${ROLE_LABELS[employee.role]})`, source: `business:${businessId}`,
        });
        state.game.notifications.push({
          id: generateId('notif'), timestamp, title: 'New Hire',
          message: `${employee.name} joined ${business.name} as ${ROLE_LABELS[employee.role]}.`, severity: 'success', read: false,
        });
      }),

      fireEmployee: (businessId, employeeId) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        if (!state.game || !business) return;
        business.employees = business.employees.filter((e) => e.id !== employeeId);
        state.game.player.statistics.employeesFired += 1;
      }),

      giveRaise: (businessId, employeeId, newSalary) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        const employee = business?.employees.find((e) => e.id === employeeId);
        if (!employee) return;
        employee.salary = newSalary;
        employee.morale = Math.min(100, employee.morale + 12);
        employee.loyalty = Math.min(100, employee.loyalty + 8);
      }),

      setMenuItemPrice: (businessId, itemId, price) => set((state) => {
        const item = state.game?.businesses.find((b) => b.id === businessId)?.menu.find((m) => m.id === itemId);
        if (!item) return;
        item.price = Math.max(0.5, Math.round(price * 100) / 100);
      }),

      setMenuItemActive: (businessId, itemId, active) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        const item = business?.menu.find((m) => m.id === itemId);
        if (!business || !item) return;
        const activeCount = business.menu.filter((m) => m.active).length;
        if (!active && activeCount <= 1) return;
        item.active = active;
      }),

      setIngredientTier: (businessId, itemId, tier) => set((state) => {
        const item = state.game?.businesses.find((b) => b.id === businessId)?.menu.find((m) => m.id === itemId);
        if (!item) return;
        const { cost, quality } = recalcMenuItemForTier(item.baseCost, tier);
        item.cost = cost;
        item.quality = quality;
        item.ingredientTier = tier;
      }),

      launchMarketingCampaign: (businessId, locationId, type) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        if (!state.game || !business) return;
        const def = CAMPAIGN_DEFAULTS[type];
        if (business.cash < def.baseCost) return;
        business.cash -= def.baseCost;
        const rng = createRng(nextSeed());
        const effectiveness = 1 + (rng() * 2 - 1) * def.riskVariance;
        business.marketingCampaigns.push({
          id: generateId('campaign'), businessId, locationId, type, cost: def.baseCost,
          startedAt: state.game.time.dayIndex, durationDays: def.durationDays, status: 'active',
          customersGained: 0, revenueAttributed: 0, effectivenessMultiplier: Math.max(0.2, effectiveness),
        });
        state.game.player.statistics.marketingSpend += def.baseCost;
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -def.baseCost,
          category: 'business_marketing', description: `${def.label} launched`, source: `business:${businessId}`,
        });
      }),

      purchaseUpgrade: (businessId, locationId, upgradeId, cost) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        const location = business?.locations.find((l) => l.id === locationId);
        const upgrade = FAST_FOOD_UPGRADES.find((u) => u.id === upgradeId);
        if (!state.game || !business || !location || !upgrade || business.cash < cost || location.upgrades.includes(upgradeId)) return;
        if (!upgrade.requiresUpgradeIds.every((id) => location.upgrades.includes(id))) return;
        business.cash -= cost;
        location.upgrades.push(upgradeId);
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -cost,
          category: 'business_upgrade', description: `Upgrade purchased — ${location.name}`, source: `business:${businessId}`,
        });
      }),

      setWeeklySchedule: (businessId, locationId, schedule) => set((state) => {
        const location = state.game?.businesses.find((b) => b.id === businessId)?.locations.find((l) => l.id === locationId);
        if (!location) return;
        location.weeklySchedule = schedule.map(validateDaySchedule) as WeeklySchedule;
      }),

      applySchedulePreset: (businessId, locationId, preset, sourceDayIndex, openHour, closeHour) => set((state) => {
        const location = state.game?.businesses.find((b) => b.id === businessId)?.locations.find((l) => l.id === locationId);
        if (!location) return;
        const current = location.weeklySchedule;
        if (preset === 'weekday') location.weeklySchedule = applyWeekdayPreset(current, openHour ?? 8, closeHour ?? 22);
        else if (preset === 'weekend') location.weeklySchedule = applyWeekendPreset(current, openHour ?? 10, closeHour ?? 20);
        else if (preset === '24-7') location.weeklySchedule = applyOpen24_7();
        else if (preset === 'closed-sundays') location.weeklySchedule = applyClosedSundays(current);
        else if (preset === 'copy-to-weekdays') location.weeklySchedule = copyDayToAllWeekdays(current, sourceDayIndex ?? 1);
        else if (preset === 'copy-to-all') location.weeklySchedule = copyDayToAllDays(current, sourceDayIndex ?? 1);
      }),

      resolveBusinessEvent: (businessId, eventId, choice) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        if (!state.game || !business) return;
        const event = business.activeEvents.find((e) => e.id === eventId);
        if (!event) return;
        event.resolved = true;
        business.activeEvents = business.activeEvents.filter((e) => e.id !== eventId);

        if (choice.cost > 0) business.cash -= choice.cost;
        if (choice.effects.reputationFlat) business.reputation = Math.min(100, Math.max(0, business.reputation + choice.effects.reputationFlat));
        if (choice.effects.capacityPctTemp && event.locationId) {
          const location = business.locations.find((l) => l.id === event.locationId);
          if (location) location.baseCapacity = Math.max(20, Math.round(location.baseCapacity * (1 + choice.effects.capacityPctTemp / 100)));
        }
        if (choice.effects.cashFlat) business.cash += choice.effects.cashFlat;

        if (choice.cost > 0) {
          state.game.transactions.push({
            id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -choice.cost,
            category: 'business_misc', description: `${event.title} — ${choice.label}`, source: `business:${businessId}`,
          });
        }
      }),

      investInBusiness: (businessId, amount) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        if (!state.game || !business || state.game.player.cash < amount || amount <= 0) return;
        state.game.player.cash -= amount;
        business.cash += amount;
        const timestamp = state.game.time.dayIndex;
        state.game.transactions.push(
          { id: generateId('tx'), timestamp, amount: -amount, category: 'business_investment', description: `Invested in ${business.name}`, source: 'personal' },
          { id: generateId('tx'), timestamp, amount, category: 'business_investment', description: 'Owner investment', source: `business:${businessId}` },
        );
      }),

      ownerDraw: (businessId, amount) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        if (!state.game || !business || business.cash < amount || amount <= 0) return;
        business.cash -= amount;
        state.game.player.cash += amount;
        const timestamp = state.game.time.dayIndex;
        state.game.transactions.push(
          { id: generateId('tx'), timestamp, amount: -amount, category: 'business_owner_draw', description: 'Owner draw', source: `business:${businessId}` },
          { id: generateId('tx'), timestamp, amount, category: 'business_owner_draw', description: `Draw from ${business.name}`, source: 'personal' },
        );
      }),

      takeBusinessLoan: (businessId, amount, termMonths) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        if (!state.game || !business || amount <= 0) return;
        const term = Math.min(MAX_LOAN_TERM_MONTHS, Math.max(6, termMonths));
        const monthlyPayment = calculateLoanMonthlyPayment(amount, BUSINESS_LOAN_BASE_RATE, term);
        business.loans.push({
          id: generateId('loan'), kind: 'business', owner: `business:${businessId}`, principal: amount, remainingBalance: amount,
          interestRateAnnual: BUSINESS_LOAN_BASE_RATE, monthlyPayment, termMonths: term, monthsRemaining: term, takenAt: state.game.time.dayIndex,
        });
        business.cash += amount;
        state.game.player.statistics.loansTaken += 1;
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount,
          category: 'loan_disbursement', description: `Business loan — ${business.name}`, source: `business:${businessId}`,
        });
      }),

      submitLoanApplication: (kind, businessId, amount, termMonths) => set((state) => {
        if (!state.game || amount <= 0) return;
        const owner = businessId ? `business:${businessId}` : 'personal';
        const recentSameKind = state.game.player.loanApplications.find((a) => a.kind === kind && a.owner === owner && state.game!.time.dayIndex - a.submittedAt < 3);
        if (recentSameKind) return;

        const rng = createRng(nextSeed());
        const reviewDays = rollLoanReviewDays(rng, kind);
        state.game.player.loanApplications.push({
          id: generateId('loanapp'), kind, owner, requestedAmount: amount, requestedTermMonths: Math.min(MAX_LOAN_TERM_MONTHS, Math.max(6, termMonths)),
          submittedAt: state.game.time.dayIndex, decisionAt: state.game.time.dayIndex + reviewDays, status: 'under_review',
          approvedAmount: null, approvedRateAnnual: null, denialReasons: [], collateralNote: null,
        });
        state.game.player.statistics.loanApplicationsSubmitted += 1;
        state.game.notifications.push({
          id: generateId('notif'), timestamp: state.game.time.dayIndex, title: 'Loan Application Submitted',
          message: `Your ${kind} loan application for $${amount.toLocaleString('en-US')} is under review. Expect a decision in ${reviewDays} day(s).`,
          severity: 'info', read: false, link: { page: 'bank' },
        });
      }),

      acceptCounterOffer: (applicationId) => set((state) => {
        if (!state.game) return;
        const app = state.game.player.loanApplications.find((a) => a.id === applicationId);
        if (!app || app.status !== 'counter_offer' || app.approvedAmount === null || app.approvedRateAnnual === null) return;

        const monthlyPayment = calculateLoanMonthlyPayment(app.approvedAmount, app.approvedRateAnnual, app.requestedTermMonths);
        const businessId = app.owner.startsWith('business:') ? app.owner.slice('business:'.length) : null;
        const loan = {
          id: generateId('loan'), kind: app.kind, owner: app.owner, principal: app.approvedAmount, remainingBalance: app.approvedAmount,
          interestRateAnnual: app.approvedRateAnnual, monthlyPayment, termMonths: app.requestedTermMonths, monthsRemaining: app.requestedTermMonths,
          takenAt: state.game.time.dayIndex,
        };

        if (businessId) {
          const business = state.game.businesses.find((b) => b.id === businessId);
          if (!business) return;
          business.loans.push(loan);
          business.cash += app.approvedAmount;
        } else {
          state.game.player.bank.loans.push(loan);
          state.game.player.cash += app.approvedAmount;
        }
        state.game.player.statistics.loansTaken += 1;
        app.status = 'accepted';
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: app.approvedAmount,
          category: 'loan_disbursement', description: `Loan disbursed (counter-offer accepted)`, source: app.owner,
        });
      }),

      declineLoanApplication: (applicationId) => set((state) => {
        const app = state.game?.player.loanApplications.find((a) => a.id === applicationId);
        if (!app) return;
        app.status = 'declined_by_player';
      }),

      depositSavings: (amount) => set((state) => {
        if (!state.game || amount <= 0 || state.game.player.cash < amount) return;
        state.game.player.cash -= amount;
        state.game.player.bank.savingsBalance += amount;
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -amount,
          category: 'savings_transfer', description: 'Transfer to savings', source: 'personal',
        });
      }),

      withdrawSavings: (amount) => set((state) => {
        if (!state.game || amount <= 0 || state.game.player.bank.savingsBalance < amount) return;
        state.game.player.bank.savingsBalance -= amount;
        state.game.player.cash += amount;
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount,
          category: 'savings_transfer', description: 'Withdrawal from savings', source: 'personal',
        });
      }),

      toggleSubscription: (subscriptionId) => set((state) => {
        const sub = state.game?.player.subscriptions.find((s) => s.id === subscriptionId);
        if (sub) sub.active = !sub.active;
      }),

      setLifestyleChoice: (category, tierId) => set((state) => {
        if (!state.game) return;
        if (category === 'entertainment' || category === 'services') return; // stackable categories use toggleLifestyleStackable
        state.game.player.lifestyle[category] = tierId;
      }),

      toggleLifestyleStackable: (category, tierId) => set((state) => {
        if (!state.game) return;
        if (category !== 'entertainment' && category !== 'services') return;
        const current = state.game.player.lifestyle[category];
        state.game.player.lifestyle[category] = current.includes(tierId) ? current.filter((id) => id !== tierId) : [...current, tierId];
      }),

      addSubscription: (catalogId) => set((state) => {
        if (!state.game) return;
        const entry = SUBSCRIPTION_CATALOG.find((s) => s.id === catalogId);
        if (!entry || state.game.player.subscriptions.some((s) => s.name === entry.name)) return;
        state.game.player.subscriptions.push({ id: generateId('subscription'), name: entry.name, category: entry.category, monthlyCost: entry.monthlyCost, active: true });
      }),

      cancelSubscription: (subscriptionId) => set((state) => {
        if (!state.game) return;
        state.game.player.subscriptions = state.game.player.subscriptions.filter((s) => s.id !== subscriptionId);
      }),

      buyPropertyWithCash: (listingId, use) => set((state) => {
        if (!state.game) return;
        const listing = PROPERTY_LISTINGS.find((p) => p.id === listingId);
        if (!listing || state.game.player.cash < listing.price) return;

        state.game.player.cash -= listing.price;
        state.game.player.properties.push({
          id: generateId('property'), listingId: listing.id, type: listing.type, name: listing.name, city: listing.city,
          purchasePrice: listing.price, currentValue: listing.price, mortgageBalance: 0, monthlyMortgagePayment: 0,
          monthlyMaintenance: Math.round(listing.price * PROPERTY_MAINTENANCE_PCT_OF_VALUE_MONTHLY),
          bedrooms: listing.bedrooms, bathrooms: listing.bathrooms, sqft: listing.sqft, luxuryRating: listing.luxuryRating,
          use, monthlyRent: use === 'rental' ? listing.monthlyRent : 0, purchasedAt: state.game.time.dayIndex,
        });
        state.game.player.statistics.propertiesPurchased += 1;
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -listing.price,
          category: 'property_purchase', description: `Purchased ${listing.name} with cash`, source: 'personal',
        });
        state.game.player.timeline.push({
          id: generateId('timeline'), age: state.game.player.age, timestamp: state.game.time.dayIndex,
          title: 'New Property', description: `Purchased ${listing.name} in ${listing.city} with cash.`,
        });
        if (use === 'primary') endCurrentLeaseOnMoveIn(state.game);
      }),

      applyForPropertyMortgage: (listingId, use, downPaymentAmount) => set((state) => {
        if (!state.game) return;
        const listing = PROPERTY_LISTINGS.find((p) => p.id === listingId);
        if (!listing) return;
        const minDownPayment = Math.round(listing.price * MORTGAGE_DOWNPAYMENT_PCT);
        const downPayment = Math.max(downPaymentAmount, minDownPayment);
        const loanAmount = listing.price - downPayment;
        if (loanAmount <= 0 || state.game.player.cash < downPayment) return;

        const profile = buildLoanApplicantProfile(state.game);
        const result = underwriteLoan(profile, 'mortgage', loanAmount, MORTGAGE_TERM_MONTHS, MORTGAGE_RATE_ANNUAL);

        if (result.status === 'denied' || result.approvedAmount === null || result.approvedRateAnnual === null) {
          state.game.notifications.push({
            id: generateId('notif'), timestamp: state.game.time.dayIndex, title: 'Mortgage Denied',
            message: `Your mortgage application for ${listing.name} was denied. ${result.denialReasons.join(' ')}`,
            severity: 'warning', read: false, link: { page: 'properties' },
          });
          return;
        }

        const finalAmount = result.approvedAmount;
        const finalRate = result.approvedRateAnnual;
        const shortfall = Math.max(0, loanAmount - finalAmount);
        const totalCashNeeded = downPayment + shortfall;
        if (state.game.player.cash < totalCashNeeded) {
          state.game.notifications.push({
            id: generateId('notif'), timestamp: state.game.time.dayIndex, title: 'Mortgage Countered — Not Enough Cash',
            message: `The bank would only approve $${finalAmount.toLocaleString('en-US')} for ${listing.name}. You'd need an extra $${shortfall.toLocaleString('en-US')} in cash to cover the gap.`,
            severity: 'warning', read: false, link: { page: 'properties' },
          });
          return;
        }

        const monthlyMortgagePayment = calculateLoanMonthlyPayment(finalAmount, finalRate, MORTGAGE_TERM_MONTHS);
        state.game.player.cash -= totalCashNeeded;
        state.game.player.properties.push({
          id: generateId('property'), listingId: listing.id, type: listing.type, name: listing.name, city: listing.city,
          purchasePrice: listing.price, currentValue: listing.price, mortgageBalance: finalAmount, monthlyMortgagePayment,
          monthlyMaintenance: Math.round(listing.price * PROPERTY_MAINTENANCE_PCT_OF_VALUE_MONTHLY),
          bedrooms: listing.bedrooms, bathrooms: listing.bathrooms, sqft: listing.sqft, luxuryRating: listing.luxuryRating,
          use, monthlyRent: use === 'rental' ? listing.monthlyRent : 0, purchasedAt: state.game.time.dayIndex,
        });
        state.game.player.bank.loans.push({
          id: generateId('loan'), kind: 'mortgage', owner: 'personal', principal: finalAmount, remainingBalance: finalAmount,
          interestRateAnnual: finalRate, monthlyPayment: monthlyMortgagePayment, termMonths: MORTGAGE_TERM_MONTHS,
          monthsRemaining: MORTGAGE_TERM_MONTHS, takenAt: state.game.time.dayIndex,
        });
        state.game.player.statistics.propertiesPurchased += 1;
        state.game.player.statistics.loansTaken += 1;
        state.game.transactions.push(
          { id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -totalCashNeeded, category: 'property_purchase', description: `Down payment for ${listing.name}`, source: 'personal' },
          { id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: finalAmount, category: 'property_mortgage', description: `Mortgage disbursed for ${listing.name}`, source: 'personal' },
          { id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -finalAmount, category: 'property_purchase', description: `Purchased ${listing.name}`, source: 'personal' },
        );
        state.game.player.timeline.push({
          id: generateId('timeline'), age: state.game.player.age, timestamp: state.game.time.dayIndex,
          title: 'New Property', description: `Purchased ${listing.name} in ${listing.city} with a mortgage.`,
        });
        state.game.notifications.push({
          id: generateId('notif'), timestamp: state.game.time.dayIndex,
          title: result.status === 'counter_offer' ? 'Mortgage Approved (Adjusted Terms)' : 'Mortgage Approved',
          message: `Your mortgage for ${listing.name} was approved at ${(finalRate * 100).toFixed(2)}% APR.`,
          severity: 'success', read: false, link: { page: 'properties' },
        });
        if (use === 'primary') endCurrentLeaseOnMoveIn(state.game);
      }),

      rentProperty: (listingId) => set((state) => {
        if (!state.game) return;
        const listing = RENTAL_LISTINGS.find((r) => r.id === listingId);
        if (!listing || state.game.player.cash < listing.moveInCost) return;
        state.game.player.cash -= listing.moveInCost;
        state.game.player.currentRental = {
          id: generateId('rental'), listingId: listing.id, monthlyRent: listing.monthlyRent,
          deposit: listing.deposit, startedAt: state.game.time.dayIndex,
        };
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -listing.moveInCost,
          category: 'property_purchase', description: `Moved into ${listing.name} (deposit + first month)`, source: 'personal',
        });
        state.game.player.timeline.push({
          id: generateId('timeline'), age: state.game.player.age, timestamp: state.game.time.dayIndex,
          title: 'New Rental', description: `Moved into ${listing.name} in ${listing.city}.`,
        });
      }),

      terminateLease: () => set((state) => {
        if (!state.game || !state.game.player.currentRental) return;
        const rental = state.game.player.currentRental;
        const listing = RENTAL_LISTINGS.find((r) => r.id === rental.listingId);
        state.game.player.cash += rental.deposit;
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: rental.deposit,
          category: 'property_purchase', description: `Deposit returned from ${listing?.name ?? 'rental'}`, source: 'personal',
        });
        state.game.player.timeline.push({
          id: generateId('timeline'), age: state.game.player.age, timestamp: state.game.time.dayIndex,
          title: 'Lease Ended', description: `Ended the lease at ${listing?.name ?? 'your rental'}.`,
        });
        state.game.player.currentRental = null;
      }),

      sellProperty: (propertyId) => set((state) => {
        if (!state.game) return;
        const property = state.game.player.properties.find((p) => p.id === propertyId);
        if (!property) return;
        const proceeds = property.currentValue - property.mortgageBalance;
        state.game.player.cash += proceeds;
        state.game.player.properties = state.game.player.properties.filter((p) => p.id !== propertyId);
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: proceeds,
          category: 'property_purchase', description: `Sold ${property.name}`, source: 'personal',
        });
      }),

      relocate: (city) => set((state) => {
        if (!state.game || city === state.game.player.city) return;
        const cityDef = CITY_DEFINITIONS.find((c) => c.city === city);
        if (!cityDef) return;
        const movingCost = Math.round(3_000 * cityDef.costOfLivingMultiplier);
        if (state.game.player.cash < movingCost) return;
        state.game.player.cash -= movingCost;
        state.game.player.city = city;
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -movingCost,
          category: 'relocation', description: `Relocated to ${city}`, source: 'personal',
        });
      }),

      buyVehicle: (listingId, financeWithLoan) => set((state) => {
        if (!state.game) return;
        const listing = VEHICLE_LISTINGS.find((v) => v.id === listingId);
        if (!listing) return;

        if (financeWithLoan) {
          const downpayment = Math.round(listing.price * VEHICLE_DOWNPAYMENT_PCT);
          if (state.game.player.cash < downpayment) return;
          const principal = listing.price - downpayment;
          const monthlyPayment = calculateLoanMonthlyPayment(principal, AUTO_LOAN_BASE_RATE, VEHICLE_LOAN_TERM_MONTHS);
          state.game.player.cash -= downpayment;
          state.game.player.bank.loans.push({
            id: generateId('loan'), kind: 'auto', owner: 'personal', principal, remainingBalance: principal,
            interestRateAnnual: AUTO_LOAN_BASE_RATE, monthlyPayment, termMonths: VEHICLE_LOAN_TERM_MONTHS,
            monthsRemaining: VEHICLE_LOAN_TERM_MONTHS, takenAt: state.game.time.dayIndex,
          });
          state.game.player.statistics.loansTaken += 1;
        } else {
          if (state.game.player.cash < listing.price) return;
          state.game.player.cash -= listing.price;
        }

        state.game.player.vehicles.push({
          id: generateId('vehicle'), listingId: listing.id, category: listing.category, brand: listing.brand, model: listing.model,
          year: listing.year, purchasePrice: listing.price, currentValue: listing.price, mileage: 0, condition: 100,
          insuranceMonthly: listing.insuranceMonthly, maintenanceMonthly: listing.maintenanceMonthly, prestige: listing.prestige,
          purchasedAt: state.game.time.dayIndex,
        });
        state.game.player.statistics.vehiclesPurchased += 1;
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -(financeWithLoan ? Math.round(listing.price * VEHICLE_DOWNPAYMENT_PCT) : listing.price),
          category: 'vehicle_purchase', description: `Purchased ${listing.brand} ${listing.model}`, source: 'personal',
        });
      }),

      sellVehicle: (vehicleId) => set((state) => {
        if (!state.game) return;
        const vehicle = state.game.player.vehicles.find((v) => v.id === vehicleId);
        if (!vehicle) return;
        state.game.player.cash += vehicle.currentValue;
        state.game.player.vehicles = state.game.player.vehicles.filter((v) => v.id !== vehicleId);
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: vehicle.currentValue,
          category: 'vehicle_sale', description: `Sold ${vehicle.brand} ${vehicle.model}`, source: 'personal',
        });
      }),

      buyBoat: (listingId) => set((state) => {
        if (!state.game) return;
        const listing = BOAT_LISTINGS.find((b) => b.id === listingId);
        if (!listing || state.game.player.cash < listing.price) return;
        state.game.player.cash -= listing.price;
        state.game.player.boats.push({
          id: generateId('boat'), listingId: listing.id, category: listing.category, name: listing.name, lengthFt: listing.lengthFt,
          purchasePrice: listing.price, currentValue: listing.price, condition: 100, prestige: listing.prestige,
          maintenanceMonthly: listing.maintenanceMonthly, marinaFeeMonthly: listing.marinaFeeMonthly, crewCostMonthly: listing.crewCostMonthly,
          purchasedAt: state.game.time.dayIndex,
        });
        state.game.player.statistics.boatsPurchased += 1;
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -listing.price,
          category: 'boat_purchase', description: `Purchased ${listing.name}`, source: 'personal',
        });
      }),

      sellBoat: (boatId) => set((state) => {
        if (!state.game) return;
        const boat = state.game.player.boats.find((b) => b.id === boatId);
        if (!boat) return;
        state.game.player.cash += boat.currentValue;
        state.game.player.boats = state.game.player.boats.filter((b) => b.id !== boatId);
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: boat.currentValue,
          category: 'boat_sale', description: `Sold ${boat.name}`, source: 'personal',
        });
      }),

      buyAircraft: (listingId) => set((state) => {
        if (!state.game) return;
        const listing = AIRCRAFT_LISTINGS.find((a) => a.id === listingId);
        if (!listing || state.game.player.cash < listing.price) return;
        state.game.player.cash -= listing.price;
        state.game.player.aircraft.push({
          id: generateId('aircraft'), listingId: listing.id, category: listing.category, name: listing.name,
          purchasePrice: listing.price, currentValue: listing.price, condition: 100, prestige: listing.prestige,
          operatingCostMonthly: listing.operatingCostMonthly, crewCostMonthly: listing.crewCostMonthly, hangarCostMonthly: listing.hangarCostMonthly,
          purchasedAt: state.game.time.dayIndex,
        });
        state.game.player.statistics.aircraftPurchased += 1;
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -listing.price,
          category: 'aircraft_purchase', description: `Purchased ${listing.name}`, source: 'personal',
        });
      }),

      sellAircraft: (aircraftId) => set((state) => {
        if (!state.game) return;
        const aircraft = state.game.player.aircraft.find((a) => a.id === aircraftId);
        if (!aircraft) return;
        state.game.player.cash += aircraft.currentValue;
        state.game.player.aircraft = state.game.player.aircraft.filter((a) => a.id !== aircraftId);
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: aircraft.currentValue,
          category: 'aircraft_sale', description: `Sold ${aircraft.name}`, source: 'personal',
        });
      }),

      buyLuxuryItem: (listingId) => set((state) => {
        if (!state.game) return;
        const listing = LUXURY_LISTINGS.find((l) => l.id === listingId);
        if (!listing || state.game.player.cash < listing.price) return;
        state.game.player.cash -= listing.price;
        state.game.player.luxuryItems.push({
          id: generateId('luxury'), listingId: listing.id, category: listing.category, name: listing.name, brand: listing.brand,
          purchasePrice: listing.price, currentValue: listing.price, prestige: listing.prestige, appreciationAnnual: listing.appreciationAnnual,
          purchasedAt: state.game.time.dayIndex,
        });
        state.game.player.statistics.luxuryPurchased += 1;
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -listing.price,
          category: 'luxury_purchase', description: `Purchased ${listing.name}`, source: 'personal',
        });
      }),

      sellLuxuryItem: (itemId) => set((state) => {
        if (!state.game) return;
        const item = state.game.player.luxuryItems.find((l) => l.id === itemId);
        if (!item) return;
        state.game.player.cash += item.currentValue;
        state.game.player.luxuryItems = state.game.player.luxuryItems.filter((l) => l.id !== itemId);
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: item.currentValue,
          category: 'luxury_sale', description: `Sold ${item.name}`, source: 'personal',
        });
      }),

      giftAsset: (assetType, assetId, recipient) => set((state) => {
        if (!state.game) return;
        const player = state.game.player;

        // Validate the recipient exists BEFORE touching the asset — an invalid recipient must never destroy the asset.
        const familyMember = recipient.kind === 'family' ? player.family.find((f) => f.id === recipient.memberId) : null;
        if (recipient.kind === 'family' && !familyMember) return;

        let assetName: string | null = null;
        let assetValue = 0;
        if (assetType === 'vehicle') {
          const v = player.vehicles.find((x) => x.id === assetId);
          if (!v) return;
          assetName = `${v.brand} ${v.model}`;
          assetValue = v.currentValue;
          player.vehicles = player.vehicles.filter((x) => x.id !== assetId);
        } else if (assetType === 'boat') {
          const b = player.boats.find((x) => x.id === assetId);
          if (!b) return;
          assetName = b.name;
          assetValue = b.currentValue;
          player.boats = player.boats.filter((x) => x.id !== assetId);
        } else if (assetType === 'aircraft') {
          const a = player.aircraft.find((x) => x.id === assetId);
          if (!a) return;
          assetName = a.name;
          assetValue = a.currentValue;
          player.aircraft = player.aircraft.filter((x) => x.id !== assetId);
        } else if (assetType === 'luxury') {
          const l = player.luxuryItems.find((x) => x.id === assetId);
          if (!l) return;
          assetName = l.name;
          assetValue = l.currentValue;
          player.luxuryItems = player.luxuryItems.filter((x) => x.id !== assetId);
        } else {
          const p = player.properties.find((x) => x.id === assetId);
          if (!p || p.mortgageBalance > 0) return; // must be owned outright — gifting can't discharge a mortgage
          assetName = p.name;
          assetValue = p.currentValue;
          player.properties = player.properties.filter((x) => x.id !== assetId);
        }

        const timestamp = state.game.time.dayIndex;
        player.statistics.assetsGifted += 1;

        if (recipient.kind === 'family' && familyMember) {
          // Family members are lightweight NPCs (cash + flavor text, not full asset inventories) — the
          // gift's value becomes their abstracted wealth, same as a cash gift, and their flavor description
          // updates to reflect what they were actually given.
          familyMember.cash += assetValue;
          familyMember.relationship = Math.min(100, familyMember.relationship + Math.min(40, Math.round(assetValue / 10_000)));
          familyMember.lastInteractionAt = timestamp;
          if (assetType === 'vehicle') familyMember.vehicleDescription = assetName;
          if (assetType === 'property') familyMember.homeDescription = assetName;
          if (assetType === 'boat' || assetType === 'aircraft') familyMember.homeDescription = `${familyMember.homeDescription} · owns a ${assetName}`;
          Object.assign(familyMember, addMemory(familyMember, { type: 'gift', timestamp, amount: assetValue, description: `Received ${assetName} as a gift.` }));

          const rng = createRng(nextSeed());
          const { member: reactedMember } = rollWindfallReaction(familyMember, rng);
          Object.assign(familyMember, reactedMember);

          state.game.notifications.push({
            id: generateId('notif'), timestamp, title: 'Gift Given', severity: 'success', read: false,
            message: `You gave ${assetName} to ${familyMember.name}.`, link: { page: 'family' },
          });
          state.game.player.timeline.push({
            id: generateId('timeline'), age: player.age, timestamp,
            title: 'Gave a Gift', description: `Gave ${assetName} to ${familyMember.name}.`,
          });
        } else if (recipient.kind === 'charity') {
          player.statistics.charityDonated += assetValue;
          state.game.notifications.push({
            id: generateId('notif'), timestamp, title: 'Donated to Charity', severity: 'success', read: false,
            message: `You donated ${assetName} to charity.`,
          });
          state.game.player.timeline.push({
            id: generateId('timeline'), age: player.age, timestamp,
            title: 'Donated to Charity', description: `Donated ${assetName} to charity.`,
          });
        } else {
          state.game.notifications.push({
            id: generateId('notif'), timestamp, title: 'A Generous Impulse', severity: 'info', read: false,
            message: `You gave ${assetName} to a stranger. They won't forget it.`,
          });
          state.game.player.timeline.push({
            id: generateId('timeline'), age: player.age, timestamp,
            title: 'Gave It Away', description: `Gave ${assetName} to a complete stranger.`,
          });
        }
      }),

      takeBoatTrip: (boatId) => set((state) => {
        if (!state.game) return;
        const boat = state.game.player.boats.find((b) => b.id === boatId);
        if (!boat) return;
        const cost = Math.round(boat.maintenanceMonthly * 0.15 + boat.marinaFeeMonthly * 0.1 + boat.crewCostMonthly * 0.1) + 200;
        if (state.game.player.cash < cost) return;
        const timestamp = state.game.time.dayIndex;
        const player = state.game.player;
        player.cash -= cost;
        boat.condition = Math.max(0, boat.condition - 2);
        player.wellbeing.happiness = Math.min(100, player.wellbeing.happiness + 8);
        const partner = player.family.find((f) => f.id === player.relationship.partnerId);
        if (partner) partner.relationship = Math.min(100, partner.relationship + 6);
        state.game.transactions.push({
          id: generateId('tx'), timestamp, amount: -cost, category: 'boat_expense', description: `Boat trip aboard ${boat.name}`, source: 'personal',
        });
        state.game.player.timeline.push({
          id: generateId('timeline'), age: player.age, timestamp, title: 'Boat Trip', description: `Took ${boat.name} out for a trip.`,
        });
      }),

      flyAircraft: (aircraftId) => set((state) => {
        if (!state.game) return;
        const aircraft = state.game.player.aircraft.find((a) => a.id === aircraftId);
        if (!aircraft) return;
        const cost = Math.round(aircraft.operatingCostMonthly * 0.2 + aircraft.crewCostMonthly * 0.1) + 500;
        if (state.game.player.cash < cost) return;
        const timestamp = state.game.time.dayIndex;
        const player = state.game.player;
        player.cash -= cost;
        aircraft.condition = Math.max(0, aircraft.condition - 2);
        player.wellbeing.happiness = Math.min(100, player.wellbeing.happiness + 12);
        const partner = player.family.find((f) => f.id === player.relationship.partnerId);
        if (partner) partner.relationship = Math.min(100, partner.relationship + 10);
        state.game.transactions.push({
          id: generateId('tx'), timestamp, amount: -cost, category: 'aircraft_expense', description: `Private flight aboard ${aircraft.name}`, source: 'personal',
        });
        state.game.player.timeline.push({
          id: generateId('timeline'), age: player.age, timestamp, title: 'Private Flight', description: `Flew aboard ${aircraft.name}.`,
        });
      }),

      hostPropertyParty: (propertyId) => set((state) => {
        if (!state.game) return;
        const property = state.game.player.properties.find((p) => p.id === propertyId);
        if (!property) return;
        const cost = Math.round(property.monthlyMaintenance * 0.3 + property.currentValue * 0.0008) + 300;
        if (state.game.player.cash < cost) return;
        const timestamp = state.game.time.dayIndex;
        const player = state.game.player;
        player.cash -= cost;
        player.wellbeing.happiness = Math.min(100, player.wellbeing.happiness + 10);
        for (const member of player.family) {
          if (!member.deceased) member.relationship = Math.min(100, member.relationship + 3);
        }
        state.game.transactions.push({
          id: generateId('tx'), timestamp, amount: -cost, category: 'property_maintenance', description: `Hosted a party at ${property.name}`, source: 'personal',
        });
        state.game.player.timeline.push({
          id: generateId('timeline'), age: player.age, timestamp, title: 'Hosted a Party', description: `Hosted a house party at ${property.name}.`,
        });
      }),

      buyStock: (symbol, shares) => set((state) => {
        if (!state.game || shares <= 0) return;
        const instrument = state.game.market.find((m) => m.symbol === symbol);
        if (!instrument) return;
        const cost = instrument.price * shares;
        if (state.game.player.cash < cost) return;
        state.game.player.cash -= cost;
        state.game.player.investments.holdings = buyShares(state.game.player.investments.holdings, symbol, shares, instrument.price);
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -Math.round(cost),
          category: 'investment_buy', description: `Bought ${shares} ${symbol}`, source: 'personal',
        });
      }),

      sellStock: (symbol, shares) => set((state) => {
        if (!state.game || shares <= 0) return;
        const instrument = state.game.market.find((m) => m.symbol === symbol);
        const holding = state.game.player.investments.holdings.find((h) => h.symbol === symbol);
        if (!instrument || !holding) return;
        const result = sellShares(state.game.player.investments.holdings, symbol, shares);
        const proceeds = instrument.price * result.soldShares;
        const gain = (instrument.price - holding.avgCost) * result.soldShares;
        state.game.player.investments.holdings = result.holdings;
        state.game.player.investments.realizedGains += gain;
        state.game.player.statistics.investmentProfit += gain;
        state.game.player.cash += proceeds;
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: Math.round(proceeds),
          category: 'investment_sell', description: `Sold ${result.soldShares} ${symbol}`, source: 'personal',
        });
      }),

      refreshDatingPool: () => set((state) => {
        if (!state.game || state.game.player.relationship.status !== 'single') return;
        const rng = createRng(nextSeed());
        state.game.player.relationship.candidates = generateDatingPool(rng, state.game.player.age, DATING_POOL_SIZE);
      }),

      goOnDate: (candidateId) => set((state) => {
        if (!state.game) return;
        const candidate = state.game.player.relationship.candidates.find((c) => c.id === candidateId);
        if (!candidate) return;
        const rng = createRng(nextSeed());
        const cost = Math.round(40 + rng() * (DATE_COST_MAX - 40));
        if (state.game.player.cash < cost) return;
        const gain = Math.round((candidate.compatibility / 100) * 12 + rng() * 6);
        candidate.relationship = Math.min(100, candidate.relationship + gain);
        state.game.player.cash -= cost;
        state.game.player.statistics.datesBeenOn += 1;
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -cost,
          category: 'family_gift', description: `Date with ${candidate.name}`, source: 'personal',
        });
      }),

      sendMessage: (candidateId) => set((state) => {
        const candidate = state.game?.player.relationship.candidates.find((c) => c.id === candidateId);
        if (!candidate) return;
        candidate.relationship = Math.min(100, candidate.relationship + 3);
      }),

      giveGiftToCandidate: (candidateId, amount) => set((state) => {
        if (!state.game || state.game.player.cash < amount) return;
        const candidate = state.game.player.relationship.candidates.find((c) => c.id === candidateId);
        if (!candidate) return;
        state.game.player.cash -= amount;
        candidate.relationship = Math.min(100, candidate.relationship + Math.round(amount / 20));
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -amount,
          category: 'family_gift', description: `Gift for ${candidate.name}`, source: 'personal',
        });
      }),

      becomeExclusive: (candidateId) => set((state) => {
        if (!state.game) return;
        const candidate = state.game.player.relationship.candidates.find((c) => c.id === candidateId);
        if (!candidate || candidate.relationship < EXCLUSIVE_RELATIONSHIP_THRESHOLD) return;
        const rng = createRng(nextSeed());
        const partner = candidateToPartner(rng, candidate);
        state.game.player.family.push(partner);
        state.game.player.relationship = {
          status: 'exclusive', partnerId: partner.id, candidates: [],
          exclusiveAt: state.game.time.dayIndex, seriousAt: null, engagedAt: null, marriedAt: null, prenup: null,
        };
        state.game.player.timeline.push({
          id: generateId('timeline'), age: state.game.player.age, timestamp: state.game.time.dayIndex,
          title: 'New Relationship', description: `Became exclusive with ${partner.name}.`,
        });
      }),

      spendTimeWithPartner: () => set((state) => {
        if (!state.game || !state.game.player.relationship.partnerId) return;
        const partner = state.game.player.family.find((f) => f.id === state.game!.player.relationship.partnerId);
        if (!partner) return;
        const rng = createRng(nextSeed());
        const cost = Math.round(40 + rng() * (DATE_COST_MAX - 40));
        if (state.game.player.cash < cost) return;
        const gain = 8 + Math.round(rng() * 6);
        state.game.player.cash -= cost;
        partner.relationship = Math.min(100, partner.relationship + gain);
        partner.lastInteractionAt = state.game.time.dayIndex;
        Object.assign(partner, addMemory(partner, { type: 'visit', timestamp: state.game.time.dayIndex, description: 'You spent quality time together.' }));
        state.game.player.statistics.datesBeenOn += 1;
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -cost,
          category: 'family_gift', description: `Time with ${partner.name}`, source: 'personal',
        });
      }),

      proposeMarriage: () => set((state) => {
        if (!state.game || state.game.player.relationship.status !== 'serious' || state.game.player.relationship.exclusiveAt === null) return;
        const daysTogether = state.game.time.dayIndex - state.game.player.relationship.exclusiveAt;
        if (daysTogether < PROPOSAL_MIN_DAYS_TOGETHER) return;
        const partner = state.game.player.family.find((f) => f.id === state.game!.player.relationship.partnerId);
        if (!partner || partner.relationship < PROPOSAL_MIN_RELATIONSHIP) return;
        if (state.game.player.cash < RING_COST) return;

        state.game.player.cash -= RING_COST;
        state.game.player.relationship.status = 'engaged';
        state.game.player.relationship.engagedAt = state.game.time.dayIndex;
        partner.relationship = Math.min(100, partner.relationship + 10);
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -RING_COST,
          category: 'wedding', description: 'Engagement ring', source: 'personal',
        });
        state.game.player.timeline.push({
          id: generateId('timeline'), age: state.game.player.age, timestamp: state.game.time.dayIndex,
          title: 'Engaged', description: `Proposed to ${partner.name}.`,
        });
      }),

      planWedding: (tierId, prenup) => set((state) => {
        if (!state.game || state.game.player.relationship.status !== 'engaged' || state.game.player.relationship.engagedAt === null) return;
        const daysSinceEngaged = state.game.time.dayIndex - state.game.player.relationship.engagedAt;
        if (daysSinceEngaged < ENGAGEMENT_MIN_DAYS_BEFORE_WEDDING) return;
        const tier = WEDDING_TIERS.find((t) => t.id === tierId);
        const partner = state.game.player.family.find((f) => f.id === state.game!.player.relationship.partnerId);
        if (!tier || !partner || state.game.player.cash < tier.cost) return;

        state.game.player.cash -= tier.cost;
        state.game.player.relationship.status = 'married';
        state.game.player.relationship.marriedAt = state.game.time.dayIndex;
        state.game.player.relationship.prenup = prenup;
        partner.relationship = Math.min(100, partner.relationship + tier.relationshipBonus);
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -tier.cost,
          category: 'wedding', description: tier.name, source: 'personal',
        });
        state.game.player.timeline.push({
          id: generateId('timeline'), age: state.game.player.age, timestamp: state.game.time.dayIndex,
          title: 'Got Married', description: `Married ${partner.name} in a ${tier.name.toLowerCase()}.`,
        });
      }),

      breakUp: () => set((state) => {
        if (!state.game) return;
        const status = state.game.player.relationship.status;
        if (status === 'single' || status === 'married') return;
        state.game.player.family = state.game.player.family.filter((f) => f.id !== state.game!.player.relationship.partnerId);
        state.game.player.relationship = { status: 'single', partnerId: null, candidates: [], exclusiveAt: null, seriousAt: null, engagedAt: null, marriedAt: null, prenup: null };
      }),

      divorce: () => set((state) => {
        if (!state.game || state.game.player.relationship.status !== 'married') return;
        const settlement = calculateDivorceSettlement(state.game);
        const partnerName = state.game.player.family.find((f) => f.id === state.game!.player.relationship.partnerId)?.name ?? 'your ex-spouse';

        state.game.player.cash -= DIVORCE_LEGAL_FEE + settlement.estimatedAssetTransfer;
        state.game.player.family = state.game.player.family.filter((f) => f.id !== state.game!.player.relationship.partnerId);
        state.game.player.relationship = { status: 'single', partnerId: null, candidates: [], exclusiveAt: null, seriousAt: null, engagedAt: null, marriedAt: null, prenup: null };
        state.game.player.statistics.divorces += 1;

        if (settlement.monthlyChildSupport > 0) {
          state.game.player.subscriptions.push({
            id: generateId('subscription'), name: 'Child Support (Court-Ordered)', category: 'other',
            monthlyCost: settlement.monthlyChildSupport, active: true,
          });
        }

        state.game.transactions.push(
          { id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -DIVORCE_LEGAL_FEE, category: 'family_expense', description: 'Divorce legal fees', source: 'personal' },
          { id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -settlement.estimatedAssetTransfer, category: 'family_expense', description: `Divorce settlement to ${partnerName}`, source: 'personal' },
        );
        state.game.player.timeline.push({
          id: generateId('timeline'), age: state.game.player.age, timestamp: state.game.time.dayIndex,
          title: 'Divorced', description: `Divorced ${partnerName} after ${Math.round(settlement.marriageLengthDays / 365)} year(s) of marriage.`,
        });
      }),

      tryForBaby: () => set((state) => {
        if (!state.game || state.game.player.relationship.status !== 'married' || state.game.player.pregnancy !== null) return;
        if (state.game.player.lastChildBornAt !== null && state.game.time.dayIndex - state.game.player.lastChildBornAt < POSTPARTUM_COOLDOWN_DAYS) return;

        const rng = createRng(nextSeed());
        const pregnancy = rollConception(rng, state.game.time.dayIndex);
        if (pregnancy) {
          state.game.player.pregnancy = pregnancy;
          state.game.notifications.push({
            id: generateId('notif'), timestamp: state.game.time.dayIndex, title: "You're Expecting!",
            message: `Congratulations — a new addition to the family is on the way.`, severity: 'success', read: false, link: { page: 'family' },
          });
          state.game.player.timeline.push({
            id: generateId('timeline'), age: state.game.player.age, timestamp: state.game.time.dayIndex,
            title: 'Expecting', description: 'Found out a baby is on the way.',
          });
        } else {
          state.game.notifications.push({
            id: generateId('notif'), timestamp: state.game.time.dayIndex, title: 'Not This Time',
            message: 'No luck this time — feel free to try again.', severity: 'info', read: false,
          });
        }
      }),

      callParent: (memberId) => set((state) => {
        if (!state.game) return;
        const member = state.game.player.family.find((f) => f.id === memberId);
        if (!member) return;
        member.relationship = Math.min(100, member.relationship + callReactionModifier(member));
        member.lastInteractionAt = state.game.time.dayIndex;
        Object.assign(member, addMemory(member, { type: 'call', timestamp: state.game.time.dayIndex, description: 'You called to check in.' }));
      }),

      visitFamily: (memberId) => set((state) => {
        if (!state.game) return;
        const member = state.game.player.family.find((f) => f.id === memberId);
        if (!member) return;
        const { relationshipDelta, note } = visitReactionModifier(member);
        member.relationship = Math.min(100, member.relationship + relationshipDelta);
        member.lastInteractionAt = state.game.time.dayIndex;
        Object.assign(member, addMemory(member, { type: 'visit', timestamp: state.game.time.dayIndex, description: 'You visited in person.' }));
        if (note) {
          state.game.notifications.push({ id: generateId('notif'), timestamp: state.game.time.dayIndex, title: 'Family Update', message: note, severity: 'info', read: false, link: { page: 'family' } });
        }
      }),

      giveFamilyGift: (memberId, amount) => set((state) => {
        if (!state.game || state.game.player.cash < amount) return;
        const member = state.game.player.family.find((f) => f.id === memberId);
        if (!member) return;
        const refusalRng = createRng(nextSeed());
        if (rollGiftRefusal(member, amount, refusalRng)) {
          member.lastInteractionAt = state.game.time.dayIndex;
          Object.assign(member, addMemory(member, { type: 'other', timestamp: state.game.time.dayIndex, description: `${member.name} politely declined your $${amount.toLocaleString('en-US')} gift — they wanted to handle it themselves.` }));
          state.game.notifications.push({
            id: generateId('notif'), timestamp: state.game.time.dayIndex, title: 'Gift Declined',
            message: `${member.name} appreciated the offer but declined the gift.`, severity: 'info', read: false, link: { page: 'family' },
          });
          return;
        }
        state.game.player.cash -= amount;
        member.relationship = Math.min(100, member.relationship + Math.round(amount / 25));
        member.lastInteractionAt = state.game.time.dayIndex;
        member.cash += amount;
        Object.assign(member, addMemory(member, { type: 'gift', timestamp: state.game.time.dayIndex, amount, description: `Received a $${amount.toLocaleString('en-US')} gift.` }));
        state.game.player.statistics.npcGiftsGiven += 1;

        const rng = createRng(nextSeed());
        const { member: reactedMember, note } = rollWindfallReaction(member, rng);
        Object.assign(member, reactedMember);
        if (note) {
          state.game.notifications.push({ id: generateId('notif'), timestamp: state.game.time.dayIndex, title: 'Family Update', message: note, severity: 'info', read: false, link: { page: 'family' } });
        }

        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -amount,
          category: 'family_gift', description: `Gift for ${member.name}`, source: 'personal',
        });
      }),

      viewFamilyMemberProfile: (memberId) => set((state) => {
        if (!state.game) return;
        const member = state.game.player.family.find((f) => f.id === memberId);
        if (!member || member.parentIds.length > 0) return;
        if (member.role !== 'mother' && member.role !== 'father') return;
        const rng = createRng(nextSeed());
        const lastName = member.name.split(' ').slice(1).join(' ') || 'Anderson';
        const grandparents = generateGrandparentsFor(rng, member, lastName);
        member.parentIds = grandparents.map((g) => g.id);
        state.game.player.family.push(...grandparents);
      }),

      buyAssetForFamily: (memberId, kind, amount) => set((state) => {
        if (!state.game || state.game.player.cash < amount) return;
        const member = state.game.player.family.find((f) => f.id === memberId);
        if (!member) return;
        const refusalRng = createRng(nextSeed());
        if (rollGiftRefusal(member, amount, refusalRng)) {
          member.lastInteractionAt = state.game.time.dayIndex;
          Object.assign(member, addMemory(member, { type: 'other', timestamp: state.game.time.dayIndex, description: `${member.name} declined the ${kind} you offered to buy them — they'd rather earn it themselves.` }));
          state.game.notifications.push({
            id: generateId('notif'), timestamp: state.game.time.dayIndex, title: `${kind === 'house' ? 'House' : 'Car'} Offer Declined`,
            message: `${member.name} appreciated the offer but declined the ${kind}.`, severity: 'info', read: false, link: { page: 'family' },
          });
          return;
        }
        state.game.player.cash -= amount;
        member.cash += amount;
        if (kind === 'house') member.homeDescription = 'A home you purchased for them';
        else member.vehicleDescription = 'A vehicle you purchased for them';
        const { relationshipDelta, note } = assetGiftReactionModifier(member, kind);
        member.relationship = Math.min(100, member.relationship + relationshipDelta);
        member.lastInteractionAt = state.game.time.dayIndex;
        Object.assign(member, addMemory(member, { type: 'asset_gift', timestamp: state.game.time.dayIndex, amount, description: `You bought them a ${kind}.` }));
        if (note) {
          state.game.notifications.push({ id: generateId('notif'), timestamp: state.game.time.dayIndex, title: 'Family Update', message: note, severity: 'info', read: false, link: { page: 'family' } });
        }
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -amount,
          category: 'family_gift', description: `Bought a ${kind} for ${member.name}`, source: 'personal',
        });
      }),

      payOffFamilyDebt: (memberId) => set((state) => {
        if (!state.game) return;
        const member = state.game.player.family.find((f) => f.id === memberId);
        if (!member || member.debt <= 0 || state.game.player.cash < member.debt) return;
        const amount = member.debt;
        state.game.player.cash -= amount;
        member.debt = 0;
        member.relationship = Math.min(100, member.relationship + 10);
        member.lastInteractionAt = state.game.time.dayIndex;
        Object.assign(member, addMemory(member, {
          type: 'debt_payoff', timestamp: state.game.time.dayIndex, amount,
          description: `You paid off ${member.name}'s remaining $${amount.toLocaleString('en-US')} debt. Relationship +10.`,
        }));
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -amount,
          category: 'family_gift', description: `Paid off debt for ${member.name}`, source: 'personal',
        });
      }),

      resolveLifeEvent: (eventId, choice) => set((state) => {
        if (!state.game) return;
        const event = state.game.player.lifeEvents.find((e) => e.id === eventId);
        if (!event) return;
        event.resolved = true;
        if (choice.cost !== 0) {
          state.game.player.cash -= choice.cost;
          state.game.transactions.push({
            id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -choice.cost,
            category: 'other', description: `${event.title} — ${choice.label}`, source: 'personal',
          });
        }
        if (choice.effects.relationshipFlat && state.game.player.relationship.partnerId) {
          const partner = state.game.player.family.find((f) => f.id === state.game!.player.relationship.partnerId);
          if (partner) partner.relationship = Math.min(100, Math.max(0, partner.relationship + choice.effects.relationshipFlat));
        }
        state.game.player.lifeEvents = state.game.player.lifeEvents.filter((e) => e.id !== eventId);
      }),

      hireManager: (businessId, locationId, candidate, fundingSource) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        if (!state.game || !business) return;
        if (CORPORATE_MANAGER_ROLES.includes(candidate.role)) {
          if (!business.headquarters) return; // C-suite needs an office to work from
          const corporateHeadcount = business.managers.filter((m) => CORPORATE_MANAGER_ROLES.includes(m.role)).length;
          if (corporateHeadcount >= business.headquarters.capacity) return; // HQ is full
        }
        const hiringCost = calculateManagerHiringCost(candidate.role, candidate.salary);
        const timestamp = state.game.time.dayIndex;
        if (fundingSource === 'personal') {
          if (state.game.player.cash < hiringCost) return;
          state.game.player.cash -= hiringCost;
          business.cash += hiringCost;
          state.game.transactions.push(
            { id: generateId('tx'), timestamp, amount: -hiringCost, category: 'business_investment', description: `Funded executive hiring cost for ${business.name}`, source: 'personal' },
            { id: generateId('tx'), timestamp, amount: hiringCost, category: 'business_investment', description: 'Owner investment', source: `business:${businessId}` },
          );
        } else if (business.cash < hiringCost) {
          return;
        }
        business.cash -= hiringCost;
        const { candidateId, ...managerFields } = candidate;
        void candidateId;
        business.managers.push({ id: generateId('manager'), businessId, locationId, hiredAt: timestamp, ...managerFields });
        state.game.transactions.push({
          id: generateId('tx'), timestamp, amount: -hiringCost, category: 'business_misc',
          description: `Executive hiring cost — ${candidate.name} (${candidate.role.replace('_', ' ')})`, source: `business:${businessId}`,
        });
        state.game.notifications.push({
          id: generateId('notif'), timestamp, title: 'Manager Hired',
          message: `${candidate.name} joined ${business.name} as ${candidate.role.replace('_', ' ')}.`, severity: 'success', read: false,
        });
      }),

      fireManager: (businessId, managerId) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        if (!business) return;
        business.managers = business.managers.filter((m) => m.id !== managerId);
      }),

      setDelegationControl: (businessId, area, control) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        if (!business) return;
        business.delegation[area] = control;
      }),

      updateHRSettings: (businessId, patch) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        if (!business) return;
        business.hrSettings = { ...business.hrSettings, ...patch };
      }),

      updateCEOSettings: (businessId, patch) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        if (!business) return;
        business.ceoSettings = { ...business.ceoSettings, ...patch };
      }),

      setDividendPolicy: (businessId, pct) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        if (!business) return;
        business.dividendPolicyPct = Math.max(0, Math.min(100, pct));
      }),

      setSubsidiaryCapitalBudget: (businessId, monthlyAmount) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        if (!business) return;
        business.allocatedCapitalBudget = Math.max(0, Math.round(monthlyAmount));
      }),

      rentHeadquarters: (businessId, tier) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        if (!state.game || !business) return;
        const tierDef = HEADQUARTERS_TIERS.find((t) => t.id === tier);
        if (!tierDef) return;
        const corporateHeadcount = business.managers.filter((m) => CORPORATE_MANAGER_ROLES.includes(m.role)).length;
        if (corporateHeadcount > tierDef.capacity) return; // existing C-suite wouldn't fit
        business.headquarters = { tier, ownership: 'rented', monthlyCost: tierDef.monthlyRent, capacity: tierDef.capacity, acquiredAt: state.game.time.dayIndex };
        state.game.notifications.push({
          id: generateId('notif'), timestamp: state.game.time.dayIndex, title: 'Headquarters Leased',
          message: `${business.name} leased a ${tierDef.name} as its headquarters.`, severity: 'info', read: false,
        });
      }),

      buyHeadquarters: (businessId, tier) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        if (!state.game || !business) return;
        const tierDef = HEADQUARTERS_TIERS.find((t) => t.id === tier);
        if (!tierDef || business.cash < tierDef.purchasePrice) return;
        const corporateHeadcount = business.managers.filter((m) => CORPORATE_MANAGER_ROLES.includes(m.role)).length;
        if (corporateHeadcount > tierDef.capacity) return;
        business.cash -= tierDef.purchasePrice;
        business.headquarters = { tier, ownership: 'owned', monthlyCost: tierDef.monthlyCostWhenOwned, purchasePrice: tierDef.purchasePrice, capacity: tierDef.capacity, acquiredAt: state.game.time.dayIndex };
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -tierDef.purchasePrice, category: 'business_upgrade',
          description: `Purchased ${tierDef.name} as headquarters`, source: `business:${businessId}`,
        });
        state.game.notifications.push({
          id: generateId('notif'), timestamp: state.game.time.dayIndex, title: 'Headquarters Purchased',
          message: `${business.name} purchased a ${tierDef.name} as its headquarters.`, severity: 'success', read: false,
        });
      }),

      updateEmployeeBenefits: (businessId, employeeId, patch) => set((state) => {
        const employee = state.game?.businesses.find((b) => b.id === businessId)?.employees.find((e) => e.id === employeeId);
        if (!employee) return;
        Object.assign(employee.benefits, patch);
      }),

      updateManagerBenefits: (businessId, managerId, patch) => set((state) => {
        const manager = state.game?.businesses.find((b) => b.id === businessId)?.managers.find((m) => m.id === managerId);
        if (!manager) return;
        Object.assign(manager.benefits, patch);
      }),

      purchaseCompanyVehicle: (businessId, tier, fundingSource) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        if (!state.game || !business) return;
        const tierDef = COMPANY_VEHICLE_TIERS.find((t) => t.tier === tier);
        if (!tierDef) return;
        const timestamp = state.game.time.dayIndex;
        if (fundingSource === 'personal') {
          if (state.game.player.cash < tierDef.purchasePrice) return;
          state.game.player.cash -= tierDef.purchasePrice;
          business.cash += tierDef.purchasePrice;
          state.game.transactions.push(
            { id: generateId('tx'), timestamp, amount: -tierDef.purchasePrice, category: 'business_investment', description: `Funded company vehicle for ${business.name}`, source: 'personal' },
            { id: generateId('tx'), timestamp, amount: tierDef.purchasePrice, category: 'business_investment', description: 'Owner investment', source: `business:${businessId}` },
          );
        } else if (business.cash < tierDef.purchasePrice) {
          return;
        }
        business.cash -= tierDef.purchasePrice;
        business.companyVehicles.push({
          id: generateId('company-vehicle'), businessId, tier, name: tierDef.name, purchasePrice: tierDef.purchasePrice,
          monthlyCost: tierDef.monthlyCost, assignedToEmployeeId: null, assignedToManagerId: null, purchasedAt: timestamp,
        });
        state.game.transactions.push({
          id: generateId('tx'), timestamp, amount: -tierDef.purchasePrice, category: 'business_investment',
          description: `Purchased company vehicle — ${tierDef.name}`, source: `business:${businessId}`,
        });
      }),

      purchaseCompanyPhone: (businessId, tier, fundingSource) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        if (!state.game || !business) return;
        const tierDef = COMPANY_PHONE_TIERS.find((t) => t.tier === tier);
        if (!tierDef) return;
        const timestamp = state.game.time.dayIndex;
        if (fundingSource === 'personal') {
          if (state.game.player.cash < tierDef.equipmentCost) return;
          state.game.player.cash -= tierDef.equipmentCost;
          business.cash += tierDef.equipmentCost;
          state.game.transactions.push(
            { id: generateId('tx'), timestamp, amount: -tierDef.equipmentCost, category: 'business_investment', description: `Funded company phone for ${business.name}`, source: 'personal' },
            { id: generateId('tx'), timestamp, amount: tierDef.equipmentCost, category: 'business_investment', description: 'Owner investment', source: `business:${businessId}` },
          );
        } else if (business.cash < tierDef.equipmentCost) {
          return;
        }
        business.cash -= tierDef.equipmentCost;
        business.companyPhones.push({
          id: generateId('company-phone'), businessId, tier, equipmentCost: tierDef.equipmentCost,
          monthlyCost: tierDef.monthlyCost, assignedToEmployeeId: null, assignedToManagerId: null, purchasedAt: timestamp,
        });
        state.game.transactions.push({
          id: generateId('tx'), timestamp, amount: -tierDef.equipmentCost, category: 'business_investment',
          description: `Purchased company phone — ${tierDef.label}`, source: `business:${businessId}`,
        });
      }),

      assignCompanyVehicle: (businessId, vehicleId, assignee) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        const vehicle = business?.companyVehicles.find((v) => v.id === vehicleId);
        if (!business || !vehicle) return;
        if (vehicle.assignedToEmployeeId) {
          const prev = business.employees.find((e) => e.id === vehicle.assignedToEmployeeId);
          if (prev && prev.benefits.companyCarId === vehicleId) prev.benefits.companyCarId = null;
        }
        if (vehicle.assignedToManagerId) {
          const prev = business.managers.find((m) => m.id === vehicle.assignedToManagerId);
          if (prev && prev.benefits.companyCarId === vehicleId) prev.benefits.companyCarId = null;
        }
        vehicle.assignedToEmployeeId = null;
        vehicle.assignedToManagerId = null;
        if (assignee?.kind === 'employee') {
          const employee = business.employees.find((e) => e.id === assignee.id);
          if (!employee) return;
          vehicle.assignedToEmployeeId = employee.id;
          employee.benefits.companyCarId = vehicle.id;
        } else if (assignee?.kind === 'manager') {
          const manager = business.managers.find((m) => m.id === assignee.id);
          if (!manager) return;
          vehicle.assignedToManagerId = manager.id;
          manager.benefits.companyCarId = vehicle.id;
        }
      }),

      assignCompanyPhone: (businessId, phoneId, assignee) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        const phone = business?.companyPhones.find((p) => p.id === phoneId);
        if (!business || !phone) return;
        if (phone.assignedToEmployeeId) {
          const prev = business.employees.find((e) => e.id === phone.assignedToEmployeeId);
          if (prev && prev.benefits.companyPhoneId === phoneId) prev.benefits.companyPhoneId = null;
        }
        if (phone.assignedToManagerId) {
          const prev = business.managers.find((m) => m.id === phone.assignedToManagerId);
          if (prev && prev.benefits.companyPhoneId === phoneId) prev.benefits.companyPhoneId = null;
        }
        phone.assignedToEmployeeId = null;
        phone.assignedToManagerId = null;
        if (assignee?.kind === 'employee') {
          const employee = business.employees.find((e) => e.id === assignee.id);
          if (!employee) return;
          phone.assignedToEmployeeId = employee.id;
          employee.benefits.companyPhoneId = phone.id;
        } else if (assignee?.kind === 'manager') {
          const manager = business.managers.find((m) => m.id === assignee.id);
          if (!manager) return;
          phone.assignedToManagerId = manager.id;
          manager.benefits.companyPhoneId = phone.id;
        }
      }),

      setBudgetLimit: (businessId, department, amount) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        if (!business) return;
        business.budgetLimits[department] = amount;
      }),

      placeManualInventoryOrder: (businessId, locationId, ingredientId, quantity) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        const location = business?.locations.find((l) => l.id === locationId);
        if (!state.game || !business || !location || quantity <= 0) return;
        const storageRemaining = getLocationStorageCapacity(business) - getTotalStockUnits(location.inventory);
        if (quantity > storageRemaining) return;
        const cost = calculateOrderCost(ingredientId, quantity, location.inventory.primarySupplierId, business.activeSupplierEvents, false, 0);
        if (business.cash < cost) return;
        const timestamp = state.game.time.dayIndex;
        business.cash -= cost;
        location.inventory.pendingDeliveries.push({ id: generateId('delivery'), ingredientId, quantity, cost, arrivesAtDayIndex: timestamp + 1, isEmergency: false });
        state.game.transactions.push({
          id: generateId('tx'), timestamp, amount: -cost, category: 'business_inventory',
          description: `Inventory order — ${getIngredientName(ingredientId)} (${location.name})`, source: `business:${businessId}`,
        });
      }),

      placeInstantInventoryOrder: (businessId, locationId, ingredientId, quantity) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        const location = business?.locations.find((l) => l.id === locationId);
        if (!state.game || !business || !location || quantity <= 0) return;
        const storageRemaining = getLocationStorageCapacity(business) - getTotalStockUnits(location.inventory);
        if (quantity > storageRemaining) return;
        const premiumPct = INSTANT_DELIVERY_MIN_PREMIUM_PCT + (INSTANT_DELIVERY_MAX_PREMIUM_PCT - INSTANT_DELIVERY_MIN_PREMIUM_PCT) * Math.min(1, quantity / 500);
        const cost = calculateOrderCost(ingredientId, quantity, location.inventory.primarySupplierId, business.activeSupplierEvents, true, premiumPct);
        if (business.cash < cost) return;
        const timestamp = state.game.time.dayIndex;
        business.cash -= cost;
        location.inventory.stocks[ingredientId] = (location.inventory.stocks[ingredientId] ?? 0) + quantity;
        state.game.transactions.push({
          id: generateId('tx'), timestamp, amount: -cost, category: 'business_inventory',
          description: `Instant delivery — ${getIngredientName(ingredientId)} (${location.name}, +${Math.round(premiumPct)}% premium)`, source: `business:${businessId}`,
        });
      }),

      addRecurringInventoryOrder: (businessId, locationId, ingredientId, quantity, orderWeekday) => set((state) => {
        const location = state.game?.businesses.find((b) => b.id === businessId)?.locations.find((l) => l.id === locationId);
        if (!location || quantity <= 0) return;
        location.inventory.recurringOrders.push({
          id: generateId('recurring-order'), ingredientId, quantity, orderWeekday, leadTimeDays: 1,
          supplierId: location.inventory.primarySupplierId, active: true, lastPlacedAt: null,
        });
      }),

      updateRecurringInventoryOrder: (businessId, locationId, orderId, patch) => set((state) => {
        const order = state.game?.businesses.find((b) => b.id === businessId)?.locations.find((l) => l.id === locationId)?.inventory.recurringOrders.find((o) => o.id === orderId);
        if (!order) return;
        Object.assign(order, patch);
      }),

      removeRecurringInventoryOrder: (businessId, locationId, orderId) => set((state) => {
        const location = state.game?.businesses.find((b) => b.id === businessId)?.locations.find((l) => l.id === locationId);
        if (!location) return;
        location.inventory.recurringOrders = location.inventory.recurringOrders.filter((o) => o.id !== orderId);
      }),

      runRecurringInventoryOrderNow: (businessId, locationId, orderId) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        const location = business?.locations.find((l) => l.id === locationId);
        const order = location?.inventory.recurringOrders.find((o) => o.id === orderId);
        if (!state.game || !business || !location || !order) return;
        const storageRemaining = getLocationStorageCapacity(business) - getTotalStockUnits(location.inventory);
        if (order.quantity > storageRemaining) return;
        const cost = calculateOrderCost(order.ingredientId, order.quantity, order.supplierId, business.activeSupplierEvents, false, 0);
        if (business.cash < cost) return;
        const timestamp = state.game.time.dayIndex;
        business.cash -= cost;
        location.inventory.pendingDeliveries.push({ id: generateId('delivery'), ingredientId: order.ingredientId, quantity: order.quantity, cost, arrivesAtDayIndex: timestamp + order.leadTimeDays, isEmergency: false });
        order.lastPlacedAt = timestamp;
        state.game.transactions.push({
          id: generateId('tx'), timestamp, amount: -cost, category: 'business_inventory',
          description: `Recurring order (run now) — ${getIngredientName(order.ingredientId)} (${location.name})`, source: `business:${businessId}`,
        });
      }),

      setInventoryAutomationLevel: (businessId, locationId, level) => set((state) => {
        const location = state.game?.businesses.find((b) => b.id === businessId)?.locations.find((l) => l.id === locationId);
        if (!location) return;
        location.inventory.automationLevel = level;
      }),

      setInventorySettings: (businessId, locationId, patch) => set((state) => {
        const location = state.game?.businesses.find((b) => b.id === businessId)?.locations.find((l) => l.id === locationId);
        if (!location) return;
        Object.assign(location.inventory, patch);
      }),

      purchaseWarehouse: (businessId, tier, fundingSource) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        if (!state.game || !business) return;
        const tierDef = WAREHOUSE_TIER_DEFS.find((t) => t.tier === tier);
        if (!tierDef) return;
        const timestamp = state.game.time.dayIndex;
        if (fundingSource === 'personal') {
          if (state.game.player.cash < tierDef.price) return;
          state.game.player.cash -= tierDef.price;
          business.cash += tierDef.price;
          state.game.transactions.push(
            { id: generateId('tx'), timestamp, amount: -tierDef.price, category: 'business_investment', description: `Funded warehouse for ${business.name}`, source: 'personal' },
            { id: generateId('tx'), timestamp, amount: tierDef.price, category: 'business_investment', description: 'Owner investment', source: `business:${businessId}` },
          );
        } else if (business.cash < tierDef.price) {
          return;
        }
        business.cash -= tierDef.price;
        business.warehouses.push({ id: generateId('warehouse'), businessId, tier, capacity: tierDef.capacity, monthlyCost: tierDef.monthlyCost, purchasedAt: timestamp });
        state.game.transactions.push({
          id: generateId('tx'), timestamp, amount: -tierDef.price, category: 'business_investment',
          description: `Purchased ${tierDef.label}`, source: `business:${businessId}`,
        });
      }),

      createHoldingCompany: (name) => set((state) => {
        if (!state.game) return;
        state.game.player.holdingCompanies.push({ id: generateId('holding'), name, cash: 0, foundedAt: state.game.time.dayIndex, subsidiaryBusinessIds: [], monthlyAdminOverhead: HOLDING_COMPANY_BASE_MONTHLY_OVERHEAD });
      }),

      moveBusinessToHolding: (businessId, holdingId) => set((state) => {
        if (!state.game) return;
        const business = state.game.businesses.find((b) => b.id === businessId);
        const holding = state.game.player.holdingCompanies.find((h) => h.id === holdingId);
        if (!business || !holding || business.holdingCompanyId) return;
        business.holdingCompanyId = holdingId;
        holding.subsidiaryBusinessIds.push(businessId);
      }),

      removeBusinessFromHolding: (businessId) => set((state) => {
        if (!state.game) return;
        const business = state.game.businesses.find((b) => b.id === businessId);
        if (!business || !business.holdingCompanyId) return;
        const holding = state.game.player.holdingCompanies.find((h) => h.id === business.holdingCompanyId);
        if (holding) holding.subsidiaryBusinessIds = holding.subsidiaryBusinessIds.filter((id) => id !== businessId);
        business.holdingCompanyId = null;
      }),

      transferHoldingCapital: (holdingId, amount, direction) => set((state) => {
        if (!state.game || amount <= 0) return;
        const holding = state.game.player.holdingCompanies.find((h) => h.id === holdingId);
        if (!holding) return;
        if (direction === 'deposit') {
          if (state.game.player.cash < amount) return;
          state.game.player.cash -= amount;
          holding.cash += amount;
        } else {
          if (holding.cash < amount) return;
          holding.cash -= amount;
          state.game.player.cash += amount;
        }
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: direction === 'deposit' ? -amount : amount,
          category: 'business_investment', description: `${direction === 'deposit' ? 'Capital contribution to' : 'Withdrawal from'} ${holding.name}`, source: 'personal',
        });
      }),

      submitAcquisitionOffer: (npcBusinessId, offerAmount) => set((state) => {
        if (!state.game || offerAmount <= 0) return;
        const npc = state.game.npcBusinesses.find((n) => n.id === npcBusinessId);
        if (!npc || !npc.forSale || npc.failed) return;
        state.game.player.acquisitionOffers.push({
          id: generateId('acqoffer'), npcBusinessId, offerAmount, submittedAt: state.game.time.dayIndex,
          decisionAt: state.game.time.dayIndex + 3, status: 'pending', counterAmount: null,
        });
      }),

      acceptAcquisitionCounter: (offerId) => set((state) => {
        if (!state.game) return;
        const offer = state.game.player.acquisitionOffers.find((o) => o.id === offerId);
        if (!offer || offer.status !== 'countered' || offer.counterAmount === null) return;
        const npc = state.game.npcBusinesses.find((n) => n.id === offer.npcBusinessId);
        if (!npc || state.game.player.cash < offer.counterAmount) return;

        const rng = createRng(nextSeed());
        const newBusiness = createBusinessFromAcquiredNpc(npc, state.game.time.dayIndex, rng);

        state.game.player.cash -= offer.counterAmount;
        state.game.businesses.push(newBusiness);
        state.game.npcBusinesses = state.game.npcBusinesses.filter((n) => n.id !== npc.id);
        offer.status = 'accepted';
        state.game.player.statistics.acquisitionsCompleted += 1;
        state.game.transactions.push({
          id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: -offer.counterAmount,
          category: 'business_investment', description: `Acquired ${npc.name}`, source: 'personal',
        });
        state.game.player.timeline.push({
          id: generateId('timeline'), age: state.game.player.age, timestamp: state.game.time.dayIndex,
          title: 'Business Acquired', description: `Acquired ${npc.name}.`,
        });
        state.game.notifications.push({
          id: generateId('notif'), timestamp: state.game.time.dayIndex, title: 'Acquisition Complete',
          message: `${npc.name} is now part of your empire.`, severity: 'success', read: false, link: { page: 'businesses', businessId: newBusiness.id },
        });
      }),

      withdrawAcquisitionOffer: (offerId) => set((state) => {
        const offer = state.game?.player.acquisitionOffers.find((o) => o.id === offerId);
        if (offer && offer.status === 'pending') offer.status = 'withdrawn';
      }),

      respondToIncomingOffer: (offerId, response) => set((state) => {
        if (!state.game) return;
        const offer = state.game.player.incomingBusinessOffers.find((o) => o.id === offerId);
        const business = offer ? state.game.businesses.find((b) => b.id === offer.businessId) : undefined;
        if (!offer || !business) return;

        if (response === 'accept') {
          state.game.player.cash += offer.offerAmount;
          state.game.businesses = state.game.businesses.filter((b) => b.id !== business.id);
          state.game.player.statistics.businessesSold += 1;
          offer.status = 'accepted';
          state.game.transactions.push({
            id: generateId('tx'), timestamp: state.game.time.dayIndex, amount: offer.offerAmount,
            category: 'business_investment', description: `Sold ${business.name} to ${offer.buyerName}`, source: 'personal',
          });
          state.game.player.timeline.push({
            id: generateId('timeline'), age: state.game.player.age, timestamp: state.game.time.dayIndex,
            title: 'Sold a Business', description: `Sold ${business.name} to ${offer.buyerName}.`,
          });
        } else {
          offer.status = 'rejected';
        }
      }),

      markNotificationRead: (id) => set((state) => {
        const notif = state.game?.notifications.find((n) => n.id === id);
        if (notif) notif.read = true;
      }),

      markAllNotificationsRead: () => set((state) => {
        state.game?.notifications.forEach((n) => { n.read = true; });
      }),

      updateSettings: (patch) => set((state) => {
        if (!state.game) return;
        state.game.player.settings = { ...state.game.player.settings, ...patch };
      }),

      devAddCash: (amount) => set((state) => { if (state.game) state.game.player.cash += amount; }),
      devSetAge: (age) => set((state) => { if (state.game) state.game.player.age = age; }),
      devAdvanceDays: (days) => {
        for (let i = 0; i < days; i++) {
          const { game } = get();
          if (!game) return;
          const result = advanceDay(game);
          set((state) => { state.game = result.state; state.lastDaySummary = result.summary; });
        }
      },
      devAddBusinessCash: (businessId, amount) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        if (business) business.cash += amount;
      }),
      devSetReputation: (businessId, reputation) => set((state) => {
        const business = state.game?.businesses.find((b) => b.id === businessId);
        if (business) business.reputation = Math.min(100, Math.max(0, reputation));
      }),
      devUnlockAchievement: (achievementId) => set((state) => {
        const achievement = state.game?.player.achievements.find((a) => a.id === achievementId);
        if (achievement && state.game) achievement.unlockedAt = state.game.time.dayIndex;
      }),
      devResetBusiness: (businessId) => set((state) => {
        if (!state.game) return;
        state.game.businesses = state.game.businesses.filter((b) => b.id !== businessId);
      }),
      devAddExperience: (years) => set((state) => {
        if (!state.game) return;
        state.game.player.career.experienceYears += years;
        const job = JOB_DEFINITIONS.find((j) => j.id === state.game!.player.career.jobId);
        if (job) {
          state.game.player.career.industryExperience[job.industry] = (state.game.player.career.industryExperience[job.industry] ?? 0) + years;
        }
      }),
      devCompleteDegree: () => set((state) => {
        if (!state.game || !state.game.player.education.enrolledProgramId) return;
        state.game.player.education.progressDays = state.game.player.education.totalDaysRequired;
      }),
      devAddPartner: () => set((state) => {
        if (!state.game || state.game.player.relationship.status !== 'single') return;
        const rng = createRng(nextSeed());
        const pool = generateDatingPool(rng, state.game.player.age, 1);
        const candidate = pool[0];
        candidate.relationship = 100;
        const partner = candidateToPartner(rng, candidate);
        state.game.player.family.push(partner);
        state.game.player.relationship = {
          status: 'exclusive', partnerId: partner.id, candidates: [],
          exclusiveAt: state.game.time.dayIndex, seriousAt: null, engagedAt: null, marriedAt: null, prenup: null,
        };
      }),
      devAddChild: () => set((state) => {
        if (!state.game) return;
        const rng = createRng(nextSeed());
        state.game.player.family.push({
          id: generateId('family'), role: 'child', name: generateChildName(rng), age: 0, occupation: 'Infant',
          employmentStatus: 'unemployed', relationship: 90, traits: ['kind'], bornAt: state.game.time.dayIndex, retired: false,
          cash: 0, annualIncome: 0, debt: 0, city: state.game.player.city, homeDescription: 'Lives at home', vehicleDescription: 'N/A',
          parentIds: [], partnerNpcId: null, childrenIds: [], memory: [], deceased: false, deceasedAt: null,
        });
      }),
      devTriggerEvent: () => set((state) => {
        if (!state.game) return;
        const rng = createRng(nextSeed());
        const event = rollLifeEvent(rng, 'random', state.game.time.dayIndex);
        if (event) state.game.player.lifeEvents.push(event);
      }),
      devMoveMarket: (pct) => set((state) => {
        if (!state.game) return;
        state.game.market = state.game.market.map((m) => ({ ...m, previousClose: m.price, price: Math.max(0.01, m.price * (1 + pct / 100)) }));
      }),
      devSetRelationshipDays: (days) => set((state) => {
        if (!state.game || state.game.player.relationship.exclusiveAt === null) return;
        state.game.player.relationship.exclusiveAt = state.game.time.dayIndex - days;
      }),
      devTriggerPregnancy: () => set((state) => {
        if (!state.game || state.game.player.pregnancy !== null) return;
        const rng = createRng(nextSeed());
        state.game.player.pregnancy = { id: generateId('pregnancy'), startedAt: state.game.time.dayIndex, estimatedDueAt: state.game.time.dayIndex + 270, childName: generateChildName(rng) };
      }),
      devAdvancePregnancyToDueDate: () => set((state) => {
        if (!state.game || !state.game.player.pregnancy) return;
        state.game.player.pregnancy.estimatedDueAt = state.game.time.dayIndex + 1;
      }),
      devGiveNpcMoney: (memberId, amount) => set((state) => {
        const member = state.game?.player.family.find((f) => f.id === memberId);
        if (member) member.cash += amount;
      }),
      devSetFamilyRelationship: (memberId, value) => set((state) => {
        const member = state.game?.player.family.find((f) => f.id === memberId);
        if (member) member.relationship = Math.min(100, Math.max(0, value));
      }),
      devSetNegativeCash: (amount) => set((state) => { if (state.game) state.game.player.cash = -Math.abs(amount); }),
      resetSave: () => set((state) => { state.game = null; state.lastDaySummary = null; }),
    })),
    {
      name: 'chargedlife-save',
      version: SAVE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ game: state.game }),
      migrate: (persistedState, version) => {
        const typed = persistedState as { game: unknown } | undefined;
        if (!typed?.game) return typed as { game: GameState | null };
        // Even when the declared version already matches, individual fields can have been added to
        // the current shape after this particular save was written — ensureGameStateShape backfills
        // those non-destructively so an older "current version" save never crashes on a missing field.
        if (version === SAVE_VERSION) return { game: ensureGameStateShape(typed.game) };
        return { game: migrateSave(typed.game, version) };
      },
      onRehydrateStorage: () => (state) => {
        state?.normalizeLoadedGame();
        state?.setHasHydrated(true);
      },
    },
  ),
);

export const RECOMMENDED_STARTUP_COST = RECOMMENDED_BUSINESS_STARTUP_COST;
export const EDUCATION_PROGRAM_LIST = EDUCATION_PROGRAMS;
