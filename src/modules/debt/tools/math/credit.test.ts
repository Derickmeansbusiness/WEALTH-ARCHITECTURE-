import { describe, it, expect } from 'vitest';
import { bandFor, BAND_ORDER, businessIndicator, DEFAULT_BUSINESS, DEFAULT_PERSONAL, financingCostGap, personalIndicator } from './credit';

describe('personalIndicator', () => {
  it('is bounded 0..100 and weights sum to 1', () => {
    const r = personalIndicator(DEFAULT_PERSONAL);
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
    expect(r.factors.reduce((s, f) => s + f.weight, 0)).toBeCloseTo(1, 6);
  });
  it('monotonic: better payment history → higher indicator', () => {
    const worse = personalIndicator({ ...DEFAULT_PERSONAL, onTimePct: 85, recentLates: 4 });
    const better = personalIndicator({ ...DEFAULT_PERSONAL, onTimePct: 100, recentLates: 0 });
    expect(better.score).toBeGreaterThan(worse.score);
  });
  it('monotonic: lower utilization → higher indicator', () => {
    const steps = [95, 70, 45, 25, 5].map((u) => personalIndicator({ ...DEFAULT_PERSONAL, utilizationPct: u }).score);
    for (let i = 1; i < steps.length; i++) expect(steps[i]).toBeGreaterThanOrEqual(steps[i - 1]);
  });
  it('monotonic: older accounts, fewer applications, richer mix → higher', () => {
    expect(personalIndicator({ ...DEFAULT_PERSONAL, avgAgeYears: 12 }).score).toBeGreaterThan(personalIndicator({ ...DEFAULT_PERSONAL, avgAgeYears: 1 }).score);
    expect(personalIndicator({ ...DEFAULT_PERSONAL, newApplications: 0 }).score).toBeGreaterThan(personalIndicator({ ...DEFAULT_PERSONAL, newApplications: 6 }).score);
    expect(personalIndicator({ ...DEFAULT_PERSONAL, hasMortgage: true }).score).toBeGreaterThan(personalIndicator({ ...DEFAULT_PERSONAL, hasMortgage: false, hasInstallment: false }).score);
  });
  it('derogatory flags pull the indicator down hard', () => {
    const clean = personalIndicator({ ...DEFAULT_PERSONAL, recentLates: 0, onTimePct: 100 });
    const bk = personalIndicator({ ...DEFAULT_PERSONAL, recentLates: 0, onTimePct: 100, bankruptcy: true });
    expect(bk.score).toBeLessThan(clean.score - 20);
    expect(BAND_ORDER.indexOf(bk.band)).toBeLessThan(BAND_ORDER.indexOf(clean.band));
  });
  it('best inputs reach Exceptional, worst reach Poor', () => {
    expect(personalIndicator({ onTimePct: 100, recentLates: 0, utilizationPct: 4, balances: 2000, avgAgeYears: 15, newApplications: 0, hasRevolving: true, hasInstallment: true, hasMortgage: true, delinquencies: 0, collections: 0, bankruptcy: false }).band).toBe('Exceptional');
    expect(personalIndicator({ onTimePct: 70, recentLates: 6, utilizationPct: 98, balances: 90000, avgAgeYears: 1, newApplications: 8, hasRevolving: true, hasInstallment: false, hasMortgage: false, delinquencies: 2, collections: 2, bankruptcy: true }).band).toBe('Poor');
  });
});

describe('businessIndicator', () => {
  it('weights sum to 1 and defaults land in a sensible band', () => {
    const r = businessIndicator(DEFAULT_BUSINESS);
    expect(r.factors.reduce((s, f) => s + f.weight, 0)).toBeCloseTo(1, 6);
    expect(['Fair', 'Good', 'Very good']).toContain(r.band);
  });
  it('monotonic in vendor payment, DSCR, tenure and leverage', () => {
    expect(businessIndicator({ ...DEFAULT_BUSINESS, vendorOnTimePct: 100, daysBeyondTerms: 0 }).score).toBeGreaterThan(businessIndicator({ ...DEFAULT_BUSINESS, vendorOnTimePct: 70, daysBeyondTerms: 40 }).score);
    expect(businessIndicator({ ...DEFAULT_BUSINESS, dscr: 2 }).score).toBeGreaterThan(businessIndicator({ ...DEFAULT_BUSINESS, dscr: 0.9 }).score);
    expect(businessIndicator({ ...DEFAULT_BUSINESS, yearsInBusiness: 12, entityAgeYears: 12 }).score).toBeGreaterThan(businessIndicator({ ...DEFAULT_BUSINESS, yearsInBusiness: 1, entityAgeYears: 1 }).score);
    expect(businessIndicator({ ...DEFAULT_BUSINESS, existingDebt: 100000 }).score).toBeGreaterThan(businessIndicator({ ...DEFAULT_BUSINESS, existingDebt: 2500000 }).score);
    expect(businessIndicator({ ...DEFAULT_BUSINESS, personalGuarantee: false }).score).toBeGreaterThan(businessIndicator({ ...DEFAULT_BUSINESS, personalGuarantee: true }).score);
  });
});

describe('bands and financing cost', () => {
  it('bandFor thresholds', () => {
    expect(bandFor(90)).toBe('Exceptional');
    expect(bandFor(75)).toBe('Very good');
    expect(bandFor(60)).toBe('Good');
    expect(bandFor(45)).toBe('Fair');
    expect(bandFor(20)).toBe('Poor');
  });
  it('a worse band pays more interest on the same mortgage', () => {
    const g = financingCostGap(300_000, 0.06, 'Exceptional', 'Fair');
    expect(g.interestGap).toBeGreaterThan(100_000);
    expect(g.monthlyGap).toBeGreaterThan(300);
    const same = financingCostGap(300_000, 0.06, 'Good', 'Good');
    expect(same.interestGap).toBe(0);
  });
});
