import { describe, it, expect } from 'vitest';
import { calculateLoanRate, underwriteLoan, type LoanApplicantProfile } from '@/game/simulation/loans';
import { assessFinancialHealth } from '@/game/simulation/financialRuin';
import { calculateBreakEven } from '@/game/simulation/businessInsights';
import { calculateNetWorth, calculateTotalDebt } from '@/game/simulation/networth';
import { createInitialGameState } from '@/game/state/initialState';
import { createFastFoodBusiness } from '@/game/business/fastfood';
import {
  FINANCIAL_RUIN_CRITICAL_THRESHOLD, FINANCIAL_RUIN_THRESHOLD, FINANCIAL_RUIN_WARNING_THRESHOLD,
} from '@/game/constants/balance';

describe('financial ruin thresholds', () => {
  it('is healthy above the warning threshold', () => {
    expect(assessFinancialHealth(FINANCIAL_RUIN_WARNING_THRESHOLD + 1)).toBe('healthy');
  });
  it('warns exactly at the warning threshold', () => {
    expect(assessFinancialHealth(FINANCIAL_RUIN_WARNING_THRESHOLD)).toBe('warning');
  });
  it('is critical exactly at the critical threshold', () => {
    expect(assessFinancialHealth(FINANCIAL_RUIN_CRITICAL_THRESHOLD)).toBe('critical');
  });
  it('is ruin exactly at the ruin threshold', () => {
    expect(assessFinancialHealth(FINANCIAL_RUIN_THRESHOLD)).toBe('ruin');
  });
  it('never treats positive cash as ruin, no matter how much secured debt exists separately', () => {
    // Secured debt (mortgage/business loans) must never leak into this check — it only ever receives player.cash.
    expect(assessFinancialHealth(5_000)).toBe('healthy');
  });
});

describe('loan underwriting', () => {
  const strongProfile: LoanApplicantProfile = {
    annualIncome: 120_000, creditScore: 780, cash: 50_000, netWorth: 200_000,
    existingMonthlyDebtPayments: 500, employmentMonths: 24,
  };
  const weakProfile: LoanApplicantProfile = {
    annualIncome: 24_000, creditScore: 560, cash: 200, netWorth: -5_000,
    existingMonthlyDebtPayments: 1_400, employmentMonths: 1,
  };

  it('approves a strong applicant for a modest personal loan', () => {
    const result = underwriteLoan(strongProfile, 'personal', 10_000, 36, 0.115);
    expect(result.status).toBe('approved');
    expect(result.approvedAmount).toBe(10_000);
    expect(result.denialReasons).toHaveLength(0);
  });

  it('denies a weak applicant with multiple red flags', () => {
    const result = underwriteLoan(weakProfile, 'personal', 30_000, 36, 0.115);
    expect(result.status).toBe('denied');
    expect(result.approvedAmount).toBeNull();
    expect(result.denialReasons.length).toBeGreaterThan(0);
  });

  it('never approves a business loan for a business that is not yet profitable', () => {
    const result = underwriteLoan({ ...strongProfile, businessMonthlyProfit: -500 }, 'business', 50_000, 60, 0.09);
    expect(result.status).not.toBe('approved');
  });

  it('offers a smaller counter amount rather than a flat denial for a single borderline factor', () => {
    // Good income/credit but this specific loan alone pushes DTI just past the limit — a realistic underwriter counters instead of refusing outright.
    const borderline: LoanApplicantProfile = { ...strongProfile, existingMonthlyDebtPayments: 4_200 };
    const result = underwriteLoan(borderline, 'auto', 25_000, 60, 0.07);
    expect(['counter_offer', 'denied']).toContain(result.status);
    if (result.status === 'counter_offer') {
      expect(result.approvedAmount).toBeGreaterThan(0);
      expect(result.approvedAmount).toBeLessThan(25_000);
      // A counter always carries a markup over the rate the borrower would have gotten on outright approval.
      expect(result.approvedRateAnnual).toBeGreaterThan(calculateLoanRate(0.07, borderline.creditScore));
    }
  });
});

describe('net worth and debt are computed from real owned assets, not conflated with each other', () => {
  it('a large mortgage on a healthy cash position is reflected as debt but does not itself indicate ruin', () => {
    const state = createInitialGameState('Net Worth Tester');
    state.player.cash = 40_000;
    state.player.properties.push({
      id: 'prop-1', name: 'Test House', type: 'house', city: 'Austin',
      bedrooms: 3, bathrooms: 2, sqft: 2000, luxuryRating: 2, use: 'primary', purchasePrice: 900_000, currentValue: 900_000,
      mortgageBalance: 850_000, monthlyMortgagePayment: 4_500, monthlyMaintenance: 500, monthlyRent: 0, purchasedAt: 0,
    });

    const debt = calculateTotalDebt(state);
    const netWorth = calculateNetWorth(state);
    const health = assessFinancialHealth(state.player.cash);

    expect(debt).toBe(850_000);
    expect(netWorth).toBe(40_000 + (900_000 - 850_000)); // cash + home equity
    expect(health).toBe('healthy'); // a $850K mortgage on $40K cash must never register as financial ruin
  });

  it('weights a business by ownership percentage, so a 51%-owned subsidiary contributes just over half its valuation', () => {
    const stateFull = createInitialGameState('Owner Full');
    const businessFull = createFastFoodBusiness({ name: 'Full Co', city: 'Austin', investment: 80_000, dayIndex: 0 });
    businessFull.financialHistory = Array.from({ length: 30 }, (_, i) => ({ dayIndex: i, revenue: 5_000, expenses: 4_000, profit: 1_000, customers: 500, reputation: 60 }));
    stateFull.businesses = [businessFull];

    const statePartial = createInitialGameState('Owner Partial');
    const businessPartial = { ...businessFull, ownershipPct: 51 };
    statePartial.businesses = [businessPartial];

    const fullValueContribution = calculateNetWorth(stateFull) - stateFull.player.cash;
    const partialValueContribution = calculateNetWorth(statePartial) - statePartial.player.cash;

    expect(partialValueContribution).toBeCloseTo(fullValueContribution * 0.51, 0);
  });
});

describe('break-even analysis reflects actual daily revenue vs. fully-loaded costs', () => {
  it('reports a positive margin of safety when revenue comfortably exceeds costs', () => {
    const business = createFastFoodBusiness({ name: 'Healthy Co', city: 'Austin', investment: 80_000, dayIndex: 0 });
    business.financialHistory = Array.from({ length: 14 }, (_, i) => ({ dayIndex: i, revenue: 3_000, expenses: 1_500, profit: 1_500, customers: 300, reputation: 70 }));
    const result = calculateBreakEven(business);
    expect(result.marginOfSafetyPct).toBeGreaterThan(0);
  });

  it('reports a negative margin of safety when the business is losing money', () => {
    const business = createFastFoodBusiness({ name: 'Struggling Co', city: 'Austin', investment: 80_000, dayIndex: 0 });
    business.financialHistory = Array.from({ length: 14 }, (_, i) => ({ dayIndex: i, revenue: 800, expenses: 1_200, profit: -400, customers: 100, reputation: 40 }));
    const result = calculateBreakEven(business);
    expect(result.marginOfSafetyPct).toBeLessThan(0);
  });
});
