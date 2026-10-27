import { describe, it, expect } from 'vitest';
import { projectWaterfall, normaliseAllocation, DEFAULT_WATERFALL, TIERS, atYear } from './waterfall';

describe('waterfall projection', () => {
  it('normalises allocations that do not sum to 100', () => {
    const a = normaliseAllocation({ business: 50, realEstate: 50, investments: 50, permanent: 50, liquidity: 0 });
    expect(a.business).toBeCloseTo(0.25);
    expect(a.liquidity).toBe(0);
    expect(TIERS.reduce((s, t) => s + a[t.id], 0)).toBeCloseTo(1);
  });

  it('with zero growth and zero recycling, pools equal cumulative allocated surplus', () => {
    const rows = projectWaterfall({
      ...DEFAULT_WATERFALL,
      growth: { business: 0, realEstate: 0, investments: 0, permanent: 0, liquidity: 0 },
      recycleRate: 0,
      surplusGrowth: 0,
      annualSurplus: 100_000,
      allocation: { business: 20, realEstate: 20, investments: 20, permanent: 20, liquidity: 20 },
      years: 10,
    });
    expect(rows).toHaveLength(10);
    expect(rows[9].total).toBeCloseTo(1_000_000);
    expect(rows[9].pools.business).toBeCloseTo(200_000);
  });

  it('recycling never creates or destroys capital in the year it happens', () => {
    const base = projectWaterfall({ ...DEFAULT_WATERFALL, recycleRate: 0, years: 15 });
    const rec = projectWaterfall({ ...DEFAULT_WATERFALL, recycleRate: 0.5, years: 15 });
    // In year 1 pools are empty, so growth is zero and totals match exactly.
    expect(rec[0].total).toBeCloseTo(base[0].total);
    // Recycling moves capital from where it was earned to the allocation mix; the year-1 total is conserved,
    // later years differ only through differential growth of the destination pools.
    expect(rec[1].total).toBeCloseTo(base[1].total, 0);
  });

  it('growth compounds and totals rise monotonically with positive inputs', () => {
    const rows = projectWaterfall(DEFAULT_WATERFALL);
    for (let i = 1; i < rows.length; i++) expect(rows[i].total).toBeGreaterThan(rows[i - 1].total);
    expect(atYear(rows, 10).year).toBe(10);
    expect(atYear(rows, 25).year).toBe(25);
    expect(atYear(rows, 99).year).toBe(25);
  });
});
