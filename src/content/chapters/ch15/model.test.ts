import { describe, it, expect } from 'vitest';
import { estimateOffice, complexityScore, DEFAULT_OFFICE, SERVICES, type OfficeInput } from './model';

describe('complexityScore', () => {
  it('is zero for the simplest family and bounded', () => {
    expect(complexityScore({ investableAssets: 1e7, households: 1, entities: 0, countries: 1, operatingBusinesses: 0 })).toBe(0);
    expect(complexityScore({ investableAssets: 1e9, households: 20, entities: 200, countries: 10, operatingBusinesses: 10 })).toBeLessThanOrEqual(10);
  });
  it('increases with entities and countries', () => {
    const base = complexityScore(DEFAULT_OFFICE);
    expect(complexityScore({ ...DEFAULT_OFFICE, entities: 30 })).toBeGreaterThan(base);
    expect(complexityScore({ ...DEFAULT_OFFICE, countries: 3 })).toBeGreaterThan(base);
  });
});

describe('estimateOffice', () => {
  it('SFO cost is dominated by fixed staff; bps fall as assets rise', () => {
    const small = estimateOffice({ ...DEFAULT_OFFICE, investableAssets: 50_000_000 });
    const large = estimateOffice({ ...DEFAULT_OFFICE, investableAssets: 500_000_000 });
    expect(small.estimates.sfo.costBps).toBeGreaterThan(large.estimates.sfo.costBps);
    expect(large.estimates.sfo.annualCost).toBeGreaterThan(1_500_000);
  });
  it('MFO fee respects the minimum and tiers', () => {
    const tiny = estimateOffice({ ...DEFAULT_OFFICE, investableAssets: 5_000_000, entities: 2, households: 1, operatingBusinesses: 0 });
    expect(tiny.estimates.mfo.breakdown[0].amount).toBe(200_000);
    const mid = estimateOffice({ ...DEFAULT_OFFICE, investableAssets: 100_000_000 });
    // 25M @95bps + 75M @60bps = 237,500 + 450,000
    expect(mid.estimates.mfo.breakdown[0].amount).toBeCloseTo(687_500, 0);
  });
  it('fit labels follow scale: small → VFO typical, SFO rare; very large → SFO typical', () => {
    const small = estimateOffice({ ...DEFAULT_OFFICE, investableAssets: 15_000_000, entities: 3, households: 1, operatingBusinesses: 0 });
    expect(small.estimates.vfo.fit).toBe('typically');
    expect(small.estimates.sfo.fit).toBe('rarely');
    const huge = estimateOffice({ ...DEFAULT_OFFICE, investableAssets: 600_000_000 });
    expect(huge.estimates.sfo.fit).toBe('typically');
    expect(huge.estimates.vfo.fit).toBe('rarely');
  });
  it('breakdowns sum to the annual cost', () => {
    const r = estimateOffice(DEFAULT_OFFICE);
    for (const e of Object.values(r.estimates)) {
      const sum = e.breakdown.reduce((s, b) => s + b.amount, 0);
      expect(sum).toBeCloseTo(e.annualCost, 6);
    }
  });
  it('handles zero assets without NaN costs', () => {
    const r = estimateOffice({ ...DEFAULT_OFFICE, investableAssets: 0 });
    expect(Number.isFinite(r.estimates.sfo.annualCost)).toBe(true);
    expect(r.estimates.sfo.costBps).toBe(Infinity);
  });
  it('adds the Lender Management note at scale and the operating-business note when relevant', () => {
    const r = estimateOffice(DEFAULT_OFFICE);
    expect(r.notes.some((n) => /Lender Management/.test(n))).toBe(true);
    expect(r.notes.some((n) => /Operating businesses/.test(n))).toBe(true);
    const i: OfficeInput = { investableAssets: 30_000_000, households: 1, entities: 3, countries: 1, operatingBusinesses: 0 };
    expect(estimateOffice(i).notes.length).toBe(0);
  });
  it('service matrix covers all three models for every row', () => {
    for (const s of SERVICES) { expect(s.sfo).toBeTruthy(); expect(s.mfo).toBeTruthy(); expect(s.vfo).toBeTruthy(); }
  });
});
