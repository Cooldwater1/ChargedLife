import { toCalendarDate } from '@/game/time/calendar';
import { checkAchievements } from '@/game/simulation/achievements';
import { runDailySettlement, runMonthlyBusinessSettlement, runWeeklyInventoryMaintenance, runWeeklyPayroll, type PendingNotification, type PendingTransaction } from '@/game/simulation/business';
import { calculateNetWorth } from '@/game/simulation/networth';
import { calculatePortfolioValue, driftMarketDaily } from '@/game/simulation/investments';
import { driftEconomyDaily } from '@/game/simulation/economyState';
import { driftAircraftDaily, driftBoatDaily, driftLuxuryDaily, driftVehicleDaily, runMonthlyAssetCosts } from '@/game/simulation/assets';
import { advanceEducationDay } from '@/game/simulation/education';
import { ageFamilyOneYear, decayIgnoredRelationships, rollFamilyInitiatedContact, runMonthlyFamilyExpenses } from '@/game/simulation/family';
import { rollLifeEvent, rollMarriageTroubleEvent, rollPregnancyEvent } from '@/game/simulation/lifeEvents';
import { isDueToday } from '@/game/simulation/pregnancy';
import { advanceRelationshipStage, rollDivorceRisk } from '@/game/simulation/relationshipProgress';
import { underwriteLoan, type LoanApplicantProfile } from '@/game/simulation/loans';
import { assessFinancialHealth, getFinancialHealthMessage } from '@/game/simulation/financialRuin';
import { createBusinessFromAcquiredNpc, driftNpcBusinessMonthly, evaluateAcquisitionOffer, rollIncomingOffer } from '@/game/simulation/npcBusiness';
import { calculateLoanMonthlyPayment } from '@/game/simulation/economy';
import { driftJobPerformance, runDailyLivingExpenses, runMonthlyPersonalLoans, runMonthlyProperties, runMonthlySavingsInterest, runWeeklySalary } from '@/game/simulation/player';
import { calculateLifestyleMonthlyCost, driftWellbeingDaily } from '@/game/simulation/lifestyle';
import { runCEOAutomationMonthly, snapshotEmployeePerformance } from '@/game/simulation/management';
import { JOB_DEFINITIONS } from '@/game/constants/data';
import { AUTO_LOAN_BASE_RATE, BUSINESS_LOAN_BASE_RATE, CHILDBIRTH_COST, PERSONAL_LOAN_BASE_RATE, STUDENT_LOAN_BASE_RATE } from '@/game/constants/balance';
import { generateId } from '@/lib/id';
import { createRng } from '@/lib/random';
import { formatDateLong } from '@/lib/format';
import { DEGREE_FIELD_LABELS } from '@/game/constants/education';
import { EDUCATION_LEVEL_LABELS } from '@/game/types';
import type { DaySummary, DaySummaryLine, GameNotification, GameState, NotificationSeverity, Transaction } from '@/game/types';

const MAX_TRANSACTIONS = 500;
const MAX_NOTIFICATIONS = 150;

function finalize(pending: PendingTransaction[], source: string, timestamp: number): Transaction[] {
  return pending.map((p) => ({ id: generateId('tx'), timestamp, source, ...p }));
}

function finalizeNotifications(pending: PendingNotification[], timestamp: number): GameNotification[] {
  return pending.map((p) => ({ id: generateId('notif'), timestamp, read: false, ...p }));
}

export interface AdvanceDayResult {
  state: GameState;
  summary: DaySummary;
}

interface DayProcessResult {
  state: GameState;
  income: number;
  expenses: number;
  businessLines: DaySummaryLine[];
  investmentChange: number;
  relationshipLines: DaySummaryLine[];
  eventLines: string[];
  hasImportant: boolean;
  blockingEvent: boolean;
}

/** Processes exactly one day. Used by both advanceDay() and the loop inside advanceWeek() — Next Week never skips a day's simulation. */
function processSingleDay(state: GameState): DayProcessResult {
  const newDayIndex = state.time.dayIndex + 1;
  const newDate = toCalendarDate(newDayIndex);
  const rng = createRng(newDayIndex * 7919 + 13);

  let player = state.player;
  let businesses = state.businesses;
  let npcBusinesses = state.npcBusinesses;
  let market = state.market;
  let economy = state.economy;
  const allTransactions: Transaction[] = [];
  const allNotifications: GameNotification[] = [];
  const businessLines: DaySummaryLine[] = [];
  const relationshipLines: DaySummaryLine[] = [];
  const eventLines: string[] = [];
  let hasImportant = false;
  let blockingEvent = false;

  const portfolioBefore = calculatePortfolioValue(player.investments, market);

  // ---------- Daily: living expenses + subscriptions accrual note (subscriptions charged monthly) ----------
  const livingResult = runDailyLivingExpenses(player, rng);
  player = livingResult.player;
  allTransactions.push(...finalize(livingResult.transactions, 'personal', newDayIndex));

  player = driftJobPerformance(player, rng);
  player = { ...player, wellbeing: driftWellbeingDaily(player.wellbeing, player.lifestyle) };

  // ---------- Daily: businesses ----------
  let customersServedToday = 0;
  let revenueToday = 0;
  let expensesToday = 0;
  businesses = businesses.map((business) => {
    const settlement = runDailySettlement(business, newDayIndex, rng);
    customersServedToday += settlement.customersServed;
    revenueToday += settlement.revenueGenerated;
    expensesToday += settlement.expensesIncurred;
    allTransactions.push(...finalize(settlement.transactions, `business:${business.id}`, newDayIndex));
    allNotifications.push(...finalizeNotifications(settlement.notifications, newDayIndex));

    if (Math.round(settlement.revenueGenerated - settlement.expensesIncurred) !== 0) {
      businessLines.push({ label: business.name, amount: Math.round(settlement.revenueGenerated - settlement.expensesIncurred), detail: 'profit today' });
    }

    return settlement.business;
  });

  player = {
    ...player,
    statistics: {
      ...player.statistics,
      daysPlayed: player.statistics.daysPlayed + 1,
      customersServed: player.statistics.customersServed + customersServedToday,
      totalMoneyEarned: player.statistics.totalMoneyEarned + revenueToday,
      totalMoneySpent: player.statistics.totalMoneySpent + expensesToday,
    },
  };

  // ---------- Daily: education ----------
  const educationResult = advanceEducationDay(player.education, newDayIndex);
  player = { ...player, education: educationResult.education };
  if (educationResult.completed) {
    const c = educationResult.completed;
    const label = c.field ? `${EDUCATION_LEVEL_LABELS[c.level]} in ${DEGREE_FIELD_LABELS[c.field]}` : EDUCATION_LEVEL_LABELS[c.level];
    player = { ...player, statistics: { ...player.statistics, degreesEarned: player.statistics.degreesEarned + 1 } };
    player = { ...player, timeline: [...player.timeline, { id: generateId('timeline'), age: player.age, timestamp: newDayIndex, title: 'Graduated', description: `Earned a ${label}.` }] };
    allNotifications.push(...finalizeNotifications([{ title: 'Graduation Day', message: `You earned a ${label}!`, severity: 'success', link: { page: 'education' } }], newDayIndex));
    eventLines.push(`Graduated: ${label}`);
    hasImportant = true;
  }

  // ---------- Daily: investments & economy ----------
  economy = driftEconomyDaily(economy, rng);
  market = driftMarketDaily(market, economy, newDayIndex, rng);
  const portfolioAfter = calculatePortfolioValue(player.investments, market);
  const investmentChange = portfolioAfter - portfolioBefore;

  // ---------- Daily: lifestyle asset value drift ----------
  player = {
    ...player,
    vehicles: player.vehicles.map(driftVehicleDaily),
    boats: player.boats.map(driftBoatDaily),
    aircraft: player.aircraft.map(driftAircraftDaily),
    luxuryItems: player.luxuryItems.map(driftLuxuryDaily),
  };

  // ---------- Daily: loan applications reaching a decision ----------
  const pendingApps = player.loanApplications.filter((a) => a.status === 'under_review' && a.decisionAt <= newDayIndex);
  if (pendingApps.length > 0) {
    const job = JOB_DEFINITIONS.find((j) => j.id === player.career.jobId);
    const annualIncome = job ? job.annualSalary + player.career.salaryOverride : 0;
    const existingMonthlyDebt = player.bank.loans.reduce((s, l) => s + l.monthlyPayment, 0)
      + player.properties.reduce((s, p) => s + p.monthlyMortgagePayment, 0);
    const netWorth = calculateNetWorth({ ...state, player, businesses, market, economy });

    const updatedApps = player.loanApplications.map((app) => {
      if (app.status !== 'under_review' || app.decisionAt > newDayIndex) return app;
      const businessId = app.owner.startsWith('business:') ? app.owner.slice('business:'.length) : null;
      const business = businessId ? businesses.find((b) => b.id === businessId) : undefined;
      const businessMonthlyProfit = business ? business.financialHistory.slice(-30).reduce((s, d) => s + d.profit, 0) : undefined;

      const profile: LoanApplicantProfile = {
        annualIncome, creditScore: player.bank.creditScore, cash: player.cash, netWorth,
        existingMonthlyDebtPayments: existingMonthlyDebt, employmentMonths: player.career.hiredAt !== null ? (newDayIndex - player.career.hiredAt) / 30 : 0,
        businessMonthlyProfit,
      };
      const baseRate = app.kind === 'business' ? BUSINESS_LOAN_BASE_RATE : app.kind === 'auto' ? AUTO_LOAN_BASE_RATE : app.kind === 'student' ? STUDENT_LOAN_BASE_RATE : PERSONAL_LOAN_BASE_RATE;
      const result = underwriteLoan(profile, app.kind, app.requestedAmount, app.requestedTermMonths, baseRate);

      if (result.status === 'approved' && result.approvedAmount !== null && result.approvedRateAnnual !== null) {
        const monthlyPayment = calculateLoanMonthlyPayment(result.approvedAmount, result.approvedRateAnnual, app.requestedTermMonths);
        const loan = {
          id: generateId('loan'), kind: app.kind, owner: app.owner, principal: result.approvedAmount, remainingBalance: result.approvedAmount,
          interestRateAnnual: result.approvedRateAnnual, monthlyPayment, termMonths: app.requestedTermMonths, monthsRemaining: app.requestedTermMonths, takenAt: newDayIndex,
        };
        if (business) {
          business.loans.push(loan);
          business.cash += result.approvedAmount;
        } else {
          player = { ...player, cash: player.cash + result.approvedAmount, bank: { ...player.bank, loans: [...player.bank.loans, loan] } };
        }
        player.statistics.loansTaken += 1;
        player.statistics.loansApproved += 1;
        allTransactions.push({ id: generateId('tx'), timestamp: newDayIndex, amount: result.approvedAmount, category: 'loan_disbursement', description: 'Loan approved and disbursed', source: app.owner });
        allNotifications.push({ id: generateId('notif'), timestamp: newDayIndex, read: false, title: 'Loan Approved', message: `Your ${app.kind} loan for $${result.approvedAmount.toLocaleString('en-US')} was approved at ${(result.approvedRateAnnual * 100).toFixed(1)}% APR.`, severity: 'success', link: { page: 'bank' } });
        hasImportant = true;
      } else if (result.status === 'denied') {
        player.statistics.loansDenied += 1;
        allNotifications.push({ id: generateId('notif'), timestamp: newDayIndex, read: false, title: 'Loan Denied', message: `Your ${app.kind} loan application was denied. ${result.denialReasons.join(' ')}`, severity: 'warning', link: { page: 'bank' } });
        hasImportant = true;
      } else if (result.status === 'counter_offer') {
        allNotifications.push({ id: generateId('notif'), timestamp: newDayIndex, read: false, title: 'Counter-Offer Received', message: `The bank countered your ${app.kind} loan request with $${result.approvedAmount?.toLocaleString('en-US')} at ${((result.approvedRateAnnual ?? 0) * 100).toFixed(1)}% APR.`, severity: 'info', link: { page: 'bank' } });
        hasImportant = true;
      }

      return { ...app, status: result.status, approvedAmount: result.approvedAmount, approvedRateAnnual: result.approvedRateAnnual, denialReasons: result.denialReasons };
    });
    player = { ...player, loanApplications: updatedApps };
  }

  // ---------- Daily: acquisition offers reaching a decision ----------
  const pendingAcqOffers = player.acquisitionOffers.filter((o) => o.status === 'pending' && o.decisionAt <= newDayIndex);
  if (pendingAcqOffers.length > 0) {
    const updatedOffers = player.acquisitionOffers.map((offer) => {
      if (offer.status !== 'pending' || offer.decisionAt > newDayIndex) return offer;
      const npc = npcBusinesses.find((n) => n.id === offer.npcBusinessId);

      if (!npc || npc.failed || !npc.forSale) {
        allNotifications.push({ id: generateId('notif'), timestamp: newDayIndex, read: false, title: 'Deal Fell Through', message: `${npc?.name ?? 'The business'} is no longer available to acquire.`, severity: 'info', link: { page: 'acquisitions' } });
        return { ...offer, status: 'rejected' as const };
      }

      const result = evaluateAcquisitionOffer(npc, offer.offerAmount, rng);
      if (result.accepted) {
        if (player.cash < offer.offerAmount) {
          allNotifications.push({ id: generateId('notif'), timestamp: newDayIndex, read: false, title: 'Acquisition Failed', message: `${npc.name} accepted your offer, but you no longer have the cash to complete it.`, severity: 'warning', link: { page: 'acquisitions' } });
          return { ...offer, status: 'rejected' as const };
        }
        const newBusiness = createBusinessFromAcquiredNpc(npc, newDayIndex, rng);
        businesses = [...businesses, newBusiness];
        npcBusinesses = npcBusinesses.filter((n) => n.id !== npc.id);
        player = { ...player, cash: player.cash - offer.offerAmount, statistics: { ...player.statistics, acquisitionsCompleted: player.statistics.acquisitionsCompleted + 1 },
          timeline: [...player.timeline, { id: generateId('timeline'), age: player.age, timestamp: newDayIndex, title: 'Business Acquired', description: `Acquired ${npc.name}.` }] };
        allTransactions.push({ id: generateId('tx'), timestamp: newDayIndex, amount: -offer.offerAmount, category: 'business_investment', description: `Acquired ${npc.name}`, source: 'personal' });
        allNotifications.push({ id: generateId('notif'), timestamp: newDayIndex, read: false, title: 'Acquisition Complete', message: `Your offer for ${npc.name} was accepted. It's now part of your empire.`, severity: 'success', link: { page: 'businesses', businessId: newBusiness.id } });
        hasImportant = true;
        return { ...offer, status: 'accepted' as const };
      }

      if (result.counterAmount !== null) {
        allNotifications.push({ id: generateId('notif'), timestamp: newDayIndex, read: false, title: 'Counter-Offer Received', message: `${npc.name}'s owner countered with $${result.counterAmount.toLocaleString('en-US')}.`, severity: 'info', link: { page: 'acquisitions' } });
        hasImportant = true;
        return { ...offer, status: 'countered' as const, counterAmount: result.counterAmount };
      }

      allNotifications.push({ id: generateId('notif'), timestamp: newDayIndex, read: false, title: 'Offer Rejected', message: `${npc.name}'s owner rejected your offer as too low.`, severity: 'info', link: { page: 'acquisitions' } });
      return { ...offer, status: 'rejected' as const };
    });
    player = { ...player, acquisitionOffers: updatedOffers };
  }

  // ---------- Daily: pregnancy ----------
  if (player.pregnancy) {
    if (isDueToday(player.pregnancy, newDayIndex)) {
      const childName = player.pregnancy.childName;
      player = {
        ...player,
        cash: player.cash - CHILDBIRTH_COST,
        pregnancy: null,
        lastChildBornAt: newDayIndex,
        family: [...player.family, {
          id: generateId('family'), role: 'child', name: childName, age: 0, occupation: 'Infant', employmentStatus: 'unemployed',
          relationship: 90, traits: ['kind'], bornAt: newDayIndex, retired: false, cash: 0, annualIncome: 0, debt: 0, city: player.city,
          homeDescription: 'Lives at home', vehicleDescription: 'N/A', parentIds: [], partnerNpcId: null, childrenIds: [], memory: [],
          deceased: false, deceasedAt: null,
        }],
        statistics: { ...player.statistics, childrenBorn: player.statistics.childrenBorn + 1 },
        timeline: [...player.timeline, { id: generateId('timeline'), age: player.age, timestamp: newDayIndex, title: 'New Baby', description: `Welcomed ${childName} into the family.` }],
      };
      allTransactions.push({ id: generateId('tx'), timestamp: newDayIndex, amount: -CHILDBIRTH_COST, category: 'family_expense', description: 'Childbirth expenses', source: 'personal' });
      allNotifications.push({ id: generateId('notif'), timestamp: newDayIndex, read: false, title: 'Baby Born!', message: `${childName} has been born. Congratulations!`, severity: 'success', link: { page: 'family' } });
      eventLines.push(`Welcomed ${childName} into the family`);
      hasImportant = true;
    } else if (!player.lifeEvents.some((e) => !e.resolved) && rng() < 0.02) {
      const event = rollPregnancyEvent(rng, newDayIndex);
      player = { ...player, lifeEvents: [...player.lifeEvents, event] };
      allNotifications.push({ id: generateId('notif'), timestamp: newDayIndex, read: false, title: event.title, message: event.description, severity: 'info', link: { page: 'family' } });
      blockingEvent = true;
      hasImportant = true;
    }
  }

  // ---------- Daily: relationship stage progression + divorce risk ----------
  const partner = player.family.find((f) => f.id === player.relationship.partnerId);
  player = { ...player, relationship: advanceRelationshipStage(player.relationship, partner, newDayIndex) };
  if (!player.lifeEvents.some((e) => !e.resolved) && rollDivorceRisk(player.relationship, partner, rng)) {
    const event = rollMarriageTroubleEvent(newDayIndex);
    player = { ...player, lifeEvents: [...player.lifeEvents, event] };
    allNotifications.push({ id: generateId('notif'), timestamp: newDayIndex, read: false, title: event.title, message: event.description, severity: 'warning', link: { page: 'family' } });
    blockingEvent = true;
    hasImportant = true;
  }
  if (partner) {
    relationshipLines.push({ label: partner.name, amount: partner.relationship });
  }

  // ---------- Daily: family reaching out ----------
  const contacts = rollFamilyInitiatedContact(player.family, newDayIndex, rng);
  if (contacts.length > 0) {
    player = {
      ...player,
      family: player.family.map((f) => {
        const contact = contacts.find((c) => c.member.id === f.id);
        return contact ? { ...f, relationship: Math.min(100, f.relationship + 2) } : f;
      }),
    };
    for (const contact of contacts) {
      allNotifications.push({ id: generateId('notif'), timestamp: newDayIndex, read: false, title: 'Family', message: contact.message, severity: 'info', link: { page: 'family' } });
    }
  }

  // ---------- Daily: random life events (only if none currently unresolved) ----------
  if (!player.lifeEvents.some((e) => !e.resolved) && rng() < 0.05) {
    const categories: Array<'family' | 'career' | 'financial' | 'random'> = [];
    if (player.relationship.status !== 'single' || player.family.some((f) => f.role === 'mother' || f.role === 'father')) categories.push('family');
    if (player.career.jobId) categories.push('career');
    categories.push('financial', 'random');
    const category = categories[Math.floor(rng() * categories.length)];
    const event = rollLifeEvent(rng, category, newDayIndex);
    if (event) {
      player = { ...player, lifeEvents: [...player.lifeEvents, event] };
      allNotifications.push(...finalizeNotifications([{ title: event.title, message: event.description, severity: 'info', link: { page: 'overview' } }], newDayIndex));
      eventLines.push(event.title);
      blockingEvent = true;
      hasImportant = true;
    }
  }

  // ---------- Weekly (Friday): salary + payroll ----------
  if (newDate.weekday === 5) {
    const salaryResult = runWeeklySalary(player);
    player = salaryResult.player;
    allTransactions.push(...finalize(salaryResult.transactions, 'personal', newDayIndex));
    allNotifications.push(...finalizeNotifications(salaryResult.notifications, newDayIndex));

    businesses = businesses.map((business) => {
      const payrollResult = runWeeklyPayroll(business);
      allTransactions.push(...finalize(payrollResult.transactions, `business:${business.id}`, newDayIndex));
      allNotifications.push(...finalizeNotifications(payrollResult.notifications, newDayIndex));
      const wasteResult = runWeeklyInventoryMaintenance(payrollResult.business, newDayIndex);
      allNotifications.push(...finalizeNotifications(wasteResult.notifications, newDayIndex));
      return snapshotEmployeePerformance(wasteResult.business, rng);
    });
  }

  // ---------- Monthly (1st): rent, loans, savings, properties, family, lifestyle assets, subscriptions, NPC businesses ----------
  if (newDate.day === 1) {
    const loanResult = runMonthlyPersonalLoans(player);
    player = loanResult.player;
    allTransactions.push(...finalize(loanResult.transactions, 'personal', newDayIndex));
    allNotifications.push(...finalizeNotifications(loanResult.notifications, newDayIndex));

    const interestResult = runMonthlySavingsInterest(player);
    player = interestResult.player;
    allTransactions.push(...finalize(interestResult.transactions, 'personal', newDayIndex));

    const propertyResult = runMonthlyProperties(player, rng);
    player = propertyResult.player;
    allTransactions.push(...finalize(propertyResult.transactions, 'personal', newDayIndex));

    const familyExpenseResult = runMonthlyFamilyExpenses(player.family);
    allTransactions.push(...finalize(familyExpenseResult.transactions, 'personal', newDayIndex));
    const familyExpenseTotal = familyExpenseResult.transactions.reduce((s, t) => s + t.amount, 0);
    player = { ...player, cash: player.cash + familyExpenseTotal };

    const assetCostResult = runMonthlyAssetCosts(player.vehicles, player.boats, player.aircraft);
    allTransactions.push(...finalize(assetCostResult.transactions, 'personal', newDayIndex));
    const assetCostTotal = assetCostResult.transactions.reduce((s, t) => s + t.amount, 0);
    player = { ...player, cash: player.cash + assetCostTotal };

    const activeSubscriptionCost = player.subscriptions.filter((s) => s.active).reduce((s, sub) => s + sub.monthlyCost, 0);
    if (activeSubscriptionCost > 0) {
      player = { ...player, cash: player.cash - activeSubscriptionCost };
      allTransactions.push({ id: generateId('tx'), timestamp: newDayIndex, amount: -activeSubscriptionCost, category: 'other', source: 'personal', description: 'Monthly subscriptions' });
    }

    const lifestyleCost = calculateLifestyleMonthlyCost(player.lifestyle);
    if (lifestyleCost > 0) {
      player = { ...player, cash: player.cash - lifestyleCost };
      allTransactions.push({ id: generateId('tx'), timestamp: newDayIndex, amount: -lifestyleCost, category: 'other', source: 'personal', description: 'Monthly lifestyle spending' });
    }

    if (player.currentRental) {
      const rent = player.currentRental.monthlyRent;
      player = { ...player, cash: player.cash - rent };
      allTransactions.push({ id: generateId('tx'), timestamp: newDayIndex, amount: -rent, category: 'property_purchase', source: 'personal', description: 'Monthly rent' });
    }

    player = { ...player, family: decayIgnoredRelationships(player.family, newDayIndex) };

    businesses = businesses.map((business) => {
      const monthlyResult = runMonthlyBusinessSettlement(business);
      allTransactions.push(...finalize(monthlyResult.transactions, `business:${business.id}`, newDayIndex));
      allNotifications.push(...finalizeNotifications(monthlyResult.notifications, newDayIndex));
      const ceoResult = runCEOAutomationMonthly(monthlyResult.business, newDayIndex);
      allNotifications.push(...finalizeNotifications(ceoResult.notifications, newDayIndex));
      return ceoResult.business;
    });

    // ---------- Monthly: holding company dividends + capital allocation + corporate overhead ----------
    if (player.holdingCompanies.length > 0) {
      let holdingCompanies = player.holdingCompanies;
      businesses = businesses.map((business) => {
        if (!business.holdingCompanyId || business.dividendPolicyPct <= 0) return business;
        const recentProfit = business.financialHistory.slice(-30).reduce((s, d) => s + d.profit, 0);
        const dividend = Math.round(Math.max(0, recentProfit) * (business.dividendPolicyPct / 100));
        if (dividend <= 0 || business.cash < dividend) return business;
        holdingCompanies = holdingCompanies.map((h) => (h.id === business.holdingCompanyId ? { ...h, cash: h.cash + dividend } : h));
        allTransactions.push({ id: generateId('tx'), timestamp: newDayIndex, amount: -dividend, category: 'business_owner_draw', description: 'Dividend paid to holding company', source: `business:${business.id}` });
        return { ...business, cash: business.cash - dividend };
      });

      // Capital the holding has committed to fund a subsidiary's growth — capped by what the holding actually has on hand, so it's a real transfer, not free money.
      businesses = businesses.map((business) => {
        if (!business.holdingCompanyId || business.allocatedCapitalBudget <= 0) return business;
        const holding = holdingCompanies.find((h) => h.id === business.holdingCompanyId);
        if (!holding) return business;
        const grant = Math.min(business.allocatedCapitalBudget, holding.cash);
        if (grant <= 0) return business;
        holdingCompanies = holdingCompanies.map((h) => (h.id === business.holdingCompanyId ? { ...h, cash: h.cash - grant } : h));
        allTransactions.push({ id: generateId('tx'), timestamp: newDayIndex, amount: -grant, category: 'business_investment', description: `Capital allocation from ${holding.name}`, source: `holding:${holding.id}` });
        allTransactions.push({ id: generateId('tx'), timestamp: newDayIndex, amount: grant, category: 'business_investment', description: `Capital allocation received from ${holding.name}`, source: `business:${business.id}` });
        return { ...business, cash: business.cash + grant };
      });

      holdingCompanies = holdingCompanies.map((h) => {
        const overhead = Math.min(h.cash, h.monthlyAdminOverhead);
        if (overhead <= 0) return h;
        allTransactions.push({ id: generateId('tx'), timestamp: newDayIndex, amount: -overhead, category: 'business_misc', description: `${h.name} corporate overhead`, source: `holding:${h.id}` });
        return { ...h, cash: h.cash - overhead };
      });

      player = { ...player, holdingCompanies };
    }

    npcBusinesses = npcBusinesses.map((npc) => driftNpcBusinessMonthly(npc, rng, newDayIndex));

    for (const business of businesses) {
      if (player.incomingBusinessOffers.some((o) => o.businessId === business.id && o.status === 'pending')) continue;
      const offer = rollIncomingOffer(business, rng, newDayIndex);
      if (offer) {
        player = { ...player, incomingBusinessOffers: [...player.incomingBusinessOffers, offer] };
        allNotifications.push({ id: generateId('notif'), timestamp: newDayIndex, read: false, title: 'Acquisition Offer Received', message: `${offer.buyerName} offered $${offer.offerAmount.toLocaleString('en-US')} for ${business.name}.`, severity: 'info', link: { page: 'businesses', businessId: business.id } });
        hasImportant = true;
      }
    }
  }

  // ---------- Yearly (Jan 1): age up, family ages, marriage years, mortality (Realistic mode only) ----------
  if (newDate.month === 1 && newDate.day === 1) {
    player = { ...player, age: player.age + 1 };
    const mortalityEnabled = player.settings.lifeEventsDifficulty === 'realistic';
    const agingResult = ageFamilyOneYear(player.family, rng, mortalityEnabled);
    player = { ...player, family: agingResult.family };
    for (const note of agingResult.notifications) {
      allNotifications.push(...finalizeNotifications([{ title: 'Family Update', message: note, severity: 'info', link: { page: 'family' } }], newDayIndex));
    }
    if (agingResult.deceasedIds.length > 0) {
      hasImportant = true;
      for (const id of agingResult.deceasedIds) {
        const deceased = player.family.find((f) => f.id === id);
        if (!deceased) continue;
        const inheritance = Math.round(deceased.cash);
        if (inheritance > 0) {
          player = {
            ...player, cash: player.cash + inheritance,
            statistics: { ...player.statistics, inheritanceReceived: player.statistics.inheritanceReceived + inheritance },
          };
          allTransactions.push({ id: generateId('tx'), timestamp: newDayIndex, amount: inheritance, category: 'other', description: `Inheritance from ${deceased.name}`, source: 'personal' });
          allNotifications.push({ id: generateId('notif'), timestamp: newDayIndex, read: false, title: 'Inheritance', message: `You received a $${inheritance.toLocaleString('en-US')} inheritance from ${deceased.name}.`, severity: 'info', link: { page: 'family' } });
        }
        player = { ...player, timeline: [...player.timeline, { id: generateId('timeline'), age: player.age, timestamp: newDayIndex, title: 'Family Loss', description: `${deceased.name} passed away.` }] };
      }
    }
    if (player.relationship.status === 'married' && player.relationship.marriedAt !== null) {
      const years = Math.floor((newDayIndex - player.relationship.marriedAt) / 365);
      player = { ...player, statistics: { ...player.statistics, yearsMarried: years } };
    }
    allNotifications.push(...finalizeNotifications(
      [{ title: 'Happy New Year', message: `You are now ${player.age} years old.`, severity: 'info' }],
      newDayIndex,
    ));
  }

  let nextState: GameState = {
    ...state,
    time: { dayIndex: newDayIndex },
    player,
    businesses,
    npcBusinesses,
    market,
    economy,
    transactions: [...state.transactions, ...allTransactions].slice(-MAX_TRANSACTIONS),
    notifications: [...state.notifications, ...allNotifications].slice(-MAX_NOTIFICATIONS),
  };

  const netWorth = calculateNetWorth(nextState);
  const achievementResult = checkAchievements(nextState);
  if (achievementResult.unlockedIds.length > 0) {
    const unlockedSet = new Set(achievementResult.unlockedIds);
    hasImportant = true;
    nextState = {
      ...nextState,
      player: {
        ...nextState.player,
        achievements: nextState.player.achievements.map((a) => (unlockedSet.has(a.id) ? { ...a, unlockedAt: newDayIndex } : a)),
      },
      notifications: [...nextState.notifications, ...finalizeNotifications(achievementResult.notifications, newDayIndex)].slice(-MAX_NOTIFICATIONS),
    };
  }

  nextState = {
    ...nextState,
    player: {
      ...nextState.player,
      statistics: { ...nextState.player.statistics, highestNetWorth: Math.max(nextState.player.statistics.highestNetWorth, netWorth) },
    },
  };

  // ---------- Financial ruin check (personal unsecured cash only — never secured debt) ----------
  const health = assessFinancialHealth(nextState.player.cash);
  const healthMessage = getFinancialHealthMessage(health, nextState.player.cash);
  if (healthMessage) {
    const severity: NotificationSeverity = health === 'warning' ? 'warning' : 'urgent';
    const healthNotification: GameNotification = {
      id: generateId('notif'), timestamp: newDayIndex, read: false,
      title: health === 'ruin' ? 'Financial Ruin' : 'Financial Warning', message: healthMessage, severity,
    };
    nextState = {
      ...nextState,
      notifications: [...nextState.notifications, healthNotification].slice(-MAX_NOTIFICATIONS),
    };
  }
  if (health === 'ruin' && !nextState.gameOver.isOver) {
    nextState = { ...nextState, gameOver: { isOver: true, reason: 'financial_ruin', triggeredAt: newDayIndex } };
    hasImportant = true;
  }

  const income = allTransactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = Math.abs(allTransactions.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0));

  return {
    state: nextState,
    income: Math.round(income),
    expenses: Math.round(expenses),
    businessLines,
    investmentChange: Math.round(investmentChange),
    relationshipLines,
    eventLines,
    hasImportant: hasImportant || nextState.player.lifeEvents.some((e) => !e.resolved),
    blockingEvent: blockingEvent || nextState.gameOver.isOver,
  };
}

/** Advances the game by exactly one whole day. */
export function advanceDay(state: GameState): AdvanceDayResult {
  const result = processSingleDay(state);
  const finalDate = toCalendarDate(result.state.time.dayIndex);

  const summary: DaySummary = {
    dateLabel: formatDateLong(finalDate),
    daysSimulated: 1,
    income: result.income,
    expenses: result.expenses,
    netChange: result.income - result.expenses,
    businessLines: result.businessLines.slice(0, 5),
    investmentChange: result.investmentChange,
    relationshipLines: result.relationshipLines,
    eventLines: result.eventLines,
    importantEventIds: result.state.player.lifeEvents.filter((e) => !e.resolved).map((e) => e.id),
    importantEventCount: result.state.player.lifeEvents.filter((e) => !e.resolved).length,
    hasImportant: result.hasImportant,
    stoppedEarly: false,
  };

  return { state: result.state, summary };
}

/**
 * Advances up to 7 full days, running the complete daily simulation for each one
 * (never a shortcut that skips financial/event processing). Stops early — before
 * using all 7 days — the moment a blocking event needs the player's attention
 * (a new life event, a loan decision, game over), so nothing important is missed.
 */
export function advanceWeek(state: GameState): AdvanceDayResult {
  let current = state;
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalInvestmentChange = 0;
  const businessTotals = new Map<string, number>();
  const relationshipLatest = new Map<string, number>();
  const eventLines: string[] = [];
  let daysSimulated = 0;
  let stoppedEarly = false;
  let hasImportant = false;

  for (let i = 0; i < 7; i++) {
    if (current.gameOver.isOver) { stoppedEarly = true; break; }

    const result = processSingleDay(current);
    current = result.state;
    daysSimulated += 1;
    totalIncome += result.income;
    totalExpenses += result.expenses;
    totalInvestmentChange += result.investmentChange;
    for (const line of result.businessLines) businessTotals.set(line.label, (businessTotals.get(line.label) ?? 0) + (line.amount ?? 0));
    for (const line of result.relationshipLines) relationshipLatest.set(line.label, line.amount ?? 0);
    eventLines.push(...result.eventLines);
    if (result.hasImportant) hasImportant = true;

    if (result.blockingEvent) {
      stoppedEarly = i < 6;
      break;
    }
  }

  const finalDate = toCalendarDate(current.time.dayIndex);
  const summary: DaySummary = {
    dateLabel: formatDateLong(finalDate),
    daysSimulated,
    income: Math.round(totalIncome),
    expenses: Math.round(totalExpenses),
    netChange: Math.round(totalIncome - totalExpenses),
    businessLines: [...businessTotals.entries()].map(([label, amount]) => ({ label, amount: Math.round(amount), detail: `profit over ${daysSimulated} day(s)` })).slice(0, 5),
    investmentChange: Math.round(totalInvestmentChange),
    relationshipLines: [...relationshipLatest.entries()].map(([label, amount]) => ({ label, amount })),
    eventLines,
    importantEventIds: current.player.lifeEvents.filter((e) => !e.resolved).map((e) => e.id),
    importantEventCount: current.player.lifeEvents.filter((e) => !e.resolved).length,
    hasImportant: hasImportant || current.player.lifeEvents.some((e) => !e.resolved),
    stoppedEarly,
  };

  return { state: current, summary };
}
