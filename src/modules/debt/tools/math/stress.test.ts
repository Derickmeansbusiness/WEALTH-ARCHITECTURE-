import { describe, it, expect } from 'vitest';
import { balanceAfter, buildLoan } from '@/lib/finance';
import { balanceNow, balloonAtMaturity, DEFAULT_STRESS_BASE, debtServiceAt, NO_SHOCKS, runStress, validateStressBase } from './stress';

describe('balanceNow / balloon', () => {
  it('matches the library schedule after 2 years of a balloon loan', () => {
    const b = balanceNow(DEFAULT_STRESS_BASE);
    expect(b).toBeCloseTo(balanceAfter(700000, 0.065 / 12, 300, 24), -1);
  });
  it('interest-only balance stays at principal', () => {
    expect(balanceNow({ ...DEFAULT_STRESS_BASE, structure: 'interest-only' })).toBe(700000);
  });
  it('amortizing loans have no balloon', () => {
    expect(balloonAtMaturity({ ...DEFAULT_STRESS_BASE, structure: 'amortizing' })).toBe(0);
    expect(balloonAtMaturity(DEFAULT_STRESS_BASE)).toBeGreaterThan(550000);
  });
  it('debt service at the base rate equals the original payment for interest-only', () => {
    const b = { ...DEFAULT_STRESS_BASE, structure: 'interest-only' as const };
    expect(debtServiceAt(b, 700000, 0.065)).toBeCloseTo(700000 * 0.065, 2);
    expect(debtServiceAt(b, 700000, 0.085)).toBeGreaterThan(debtServiceAt(b, 700000, 0.065));
  });
});

describe('runStress', () => {
  const base = runStress(DEFAULT_STRESS_BASE, NO_SHOCKS);
  it('base case is unstressed', () => {
    expect(base.value).toBe(1_000_000);
    expect(base.stressedRate).toBeCloseTo(0.065);
    expect(base.income).toBe(90_000);
    expect(base.noi).toBe(60_000);
    expect(base.annualDebtService).toBeCloseTo(base.baseDebtService, 2);
    expect(base.runwayMonths).toBe(Infinity);
  });
  it('a 30% value drop pushes LTV past covenant and reduces equity', () => {
    const r = runStress(DEFAULT_STRESS_BASE, { ...NO_SHOCKS, valueDrop: 0.3 });
    expect(r.value).toBe(700_000);
    expect(r.ltv).toBeGreaterThan(0.75);
    expect(r.equity).toBeLessThan(base.equity);
    expect(r.lights.withinLtv).not.toBe('green');
  });
  it('rate shock applies only to the floating share', () => {
    const r = runStress(DEFAULT_STRESS_BASE, { ...NO_SHOCKS, rateBps: 200 });
    expect(r.stressedRate).toBeCloseTo(0.065 + 0.02 * 0.5);
    expect(r.annualDebtService).toBeGreaterThan(base.annualDebtService);
    const fixed = runStress({ ...DEFAULT_STRESS_BASE, floatingShare: 0 }, { ...NO_SHOCKS, rateBps: 300 });
    expect(fixed.annualDebtService).toBeCloseTo(base.annualDebtService, 2);
  });
  it('income drop plus tenant default creates a shortfall and finite runway', () => {
    const r = runStress(DEFAULT_STRESS_BASE, { ...NO_SHOCKS, rentalDrop: 0.3, tenantDefaultShare: 0.5, tenantDefaultMonths: 6 });
    expect(r.income).toBeCloseTo(90000 * 0.7 * (1 - 0.25), 2);
    expect(r.noi).toBeLessThan(r.annualDebtService);
    expect(Number.isFinite(r.runwayMonths)).toBe(true);
    expect(r.runwayMonths).toBeCloseTo(r.liquidity / -r.monthlyCashFlow, 6);
    expect(r.lights.coversPayments).toBe('red');
  });
  it('opex increase lowers NOI and DSCR', () => {
    const r = runStress(DEFAULT_STRESS_BASE, { ...NO_SHOCKS, opexIncrease: 0.25 });
    expect(r.expenses).toBeCloseTo(37500);
    expect(r.dscr).toBeLessThan(base.dscr);
  });
  it('refinancing refused shows liquidity vs payoff', () => {
    const r = runStress(DEFAULT_STRESS_BASE, { ...NO_SHOCKS, refinanceRefused: true });
    expect(r.liquidityVsPayoff).toBeCloseTo(100000 / r.balloonDue, 6);
    expect(r.warnings.some((w) => w.title.startsWith('Maturity wall'))).toBe(true);
  });
  it('refinancing feasibility depends on stressed value × max LTV', () => {
    const ok = runStress(DEFAULT_STRESS_BASE, NO_SHOCKS);
    expect(ok.refiFeasible).toBe(true);
    const bad = runStress(DEFAULT_STRESS_BASE, { ...NO_SHOCKS, valueDrop: 0.3 });
    expect(bad.maxRefiLoan).toBeCloseTo(700000 * 0.75);
    expect(bad.refiFeasible).toBe(false);
    expect(bad.refiGap).toBeCloseTo(bad.balloonDue - bad.maxRefiLoan, 2);
  });
  it('acceleration shortfall is balance minus liquidity', () => {
    const r = runStress(DEFAULT_STRESS_BASE, { ...NO_SHOCKS, acceleration: true });
    expect(r.accelerationShortfall).toBeCloseTo(r.loanBalance - 100000, 2);
    expect(r.warnings.some((w) => w.title.startsWith('Acceleration'))).toBe(true);
  });
  it('no debt → all lights green and a no-debt narrative', () => {
    const r = runStress({ ...DEFAULT_STRESS_BASE, principal: 0 }, { ...NO_SHOCKS, valueDrop: 0.3, rateBps: 300 });
    expect(Object.values(r.lights).every((l) => l === 'green')).toBe(true);
    expect(r.narrative).toMatch(/no debt/i);
  });
  it('stacking shocks never improves DSCR', () => {
    const one = runStress(DEFAULT_STRESS_BASE, { ...NO_SHOCKS, rentalDrop: 0.2 });
    const two = runStress(DEFAULT_STRESS_BASE, { ...NO_SHOCKS, rentalDrop: 0.2, rateBps: 300, opexIncrease: 0.1 });
    expect(two.dscr).toBeLessThanOrEqual(one.dscr);
  });
});

describe('validateStressBase', () => {
  it('accepts defaults and rejects impossible inputs', () => {
    expect(validateStressBase(DEFAULT_STRESS_BASE)).toEqual([]);
    expect(validateStressBase({ ...DEFAULT_STRESS_BASE, yearsElapsed: 9 }).length).toBeGreaterThan(0);
    expect(validateStressBase({ ...DEFAULT_STRESS_BASE, maxLtv: 1.2 }).length).toBeGreaterThan(0);
  });
  it('balloon loan schedule sanity', () => {
    const loan = buildLoan({ principal: 700000, annualRate: 0.065, termMonths: 84, structure: 'balloon', amortizationMonths: 300 });
    expect(loan.balloonBalance).toBeCloseTo(balloonAtMaturity(DEFAULT_STRESS_BASE), 2);
  });
});
