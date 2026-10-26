import { describe, it, expect } from 'vitest';
import { analyzeLeverage, buildLoan } from '@/lib/finance';
import { analyzeLeverageEx, computeLeverage, DEFAULT_LEVERAGE, leverageWarnings, readLoanTerms, toLeverageInput, toLoanTerms, validateLeverage } from './leverage';

describe('analyzeLeverageEx', () => {
  it('equals the library result for amortizing loans', () => {
    const input = toLeverageInput(DEFAULT_LEVERAGE);
    const a = analyzeLeverage(input);
    const b = analyzeLeverageEx(input);
    expect(b.leveragedIrrApprox).toBeCloseTo(a.leveragedIrrApprox, 8);
    expect(b.years[4].loanBalance).toBeCloseTo(a.years[4].loanBalance, 2);
  });
  it('equals the library result when the balloon horizon is the default (term × 2)', () => {
    const input = { ...toLeverageInput({ ...DEFAULT_LEVERAGE, structure: 'balloon', termYears: 7, amortYears: 14 }) };
    const a = analyzeLeverage(input);
    const b = analyzeLeverageEx(input);
    expect(b.loan.periodicPayment).toBeCloseTo(a.loan.periodicPayment, 2);
    expect(b.leveragedIrrApprox).toBeCloseTo(a.leveragedIrrApprox, 8);
  });
  it('uses the explicit amortization horizon for balloon loans', () => {
    const input = toLeverageInput({ ...DEFAULT_LEVERAGE, structure: 'balloon', termYears: 7, amortYears: 25 });
    const r = analyzeLeverageEx(input);
    const loan = buildLoan({ principal: 700000, annualRate: 0.065, termMonths: 84, structure: 'balloon', amortizationMonths: 300 });
    expect(r.loan.periodicPayment).toBeCloseTo(loan.periodicPayment, 2);
    expect(r.loan.balloonBalance).toBeGreaterThan(600000);
    expect(r.years[6].debtService).toBeGreaterThan(600000); // balloon paid in year 7
  });
});

describe('computeLeverage', () => {
  const m = computeLeverage(DEFAULT_LEVERAGE);
  it('derives payment, ltv, dscr and loan constant', () => {
    expect(m.monthlyPayment).toBeCloseTo(4424.48, 0);
    expect(m.initialLtv).toBeCloseTo(0.7);
    expect(m.dscrY1).toBeCloseTo(1.13, 2);
    expect(m.loanConstant).toBeCloseTo(53093.71 / 700000, 4);
    expect(m.capRate).toBeCloseTo(0.06);
    expect(m.negativeLeverage).toBe(true); // 6.0% cap vs 7.58% loan constant
  });
  it('interest over hold is less than full-term interest', () => {
    expect(m.interestOverHold).toBeLessThan(m.interestFullTerm);
    expect(m.interestOverHold).toBeGreaterThan(0);
  });
  it('exit LTV falls with amortization and appreciation', () => {
    expect(m.exitLtv).toBeLessThan(m.initialLtv);
  });
  it('all-equity has no debt metrics', () => {
    const e = computeLeverage({ ...DEFAULT_LEVERAGE, equity: 1_000_000, loan: 0 });
    expect(e.monthlyPayment).toBe(0);
    expect(e.dscrY1).toBe(Infinity);
    expect(e.negativeLeverage).toBe(false);
  });
});

describe('warnings', () => {
  it('flags DSCR < 1 and LTV > 80%', () => {
    const i = { ...DEFAULT_LEVERAGE, equity: 100_000, loan: 900_000, income: 70_000 };
    const w = leverageWarnings(i, computeLeverage(i));
    expect(w.some((x) => x.title.includes('does not cover'))).toBe(true);
    expect(w.some((x) => x.title.includes('exceeds 80%'))).toBe(true);
  });
  it('flags a balloon without refinancing when maturity is inside the hold', () => {
    const i = { ...DEFAULT_LEVERAGE, structure: 'interest-only' as const, termYears: 5, holdYears: 5 };
    const w = leverageWarnings(i, computeLeverage(i));
    const b = w.find((x) => x.title.startsWith('Balloon'));
    expect(b?.level).toBe('red');
  });
  it('gives a green note when nothing is flagged', () => {
    const i = { ...DEFAULT_LEVERAGE, income: 130_000, equity: 400_000, loan: 600_000 };
    const w = leverageWarnings(i, computeLeverage(i));
    expect(w[0].level).toBe('green');
  });
});

describe('validation and LoanTerms round-trip', () => {
  it('validates inputs', () => {
    expect(validateLeverage(DEFAULT_LEVERAGE)).toEqual([]);
    expect(validateLeverage({ ...DEFAULT_LEVERAGE, price: 0 }).length).toBeGreaterThan(0);
    expect(validateLeverage({ ...DEFAULT_LEVERAGE, structure: 'balloon', amortYears: 5, termYears: 7 }).length).toBeGreaterThan(0);
  });
  it('toLoanTerms produces a Structure Lab compatible shape and readLoanTerms reads it back', () => {
    const t = toLoanTerms(DEFAULT_LEVERAGE);
    expect(t.principal).toBe(700000);
    expect(t.termMonths).toBe(360);
    expect(t.paymentFrequency).toBe('monthly');
    expect(readLoanTerms({ loanTerms: t })?.principal).toBe(700000);
    expect(readLoanTerms({ loan: { principal: 50000, rate: 0.04, termYears: 5 } })?.termMonths).toBe(60);
    expect(readLoanTerms({ foo: 1 })).toBeNull();
    expect(readLoanTerms(null)).toBeNull();
  });
});
