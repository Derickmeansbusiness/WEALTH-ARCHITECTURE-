import { describe, it, expect } from 'vitest';
import { simulateWaterfall, cumulativeLabor, DEFAULT_WATERFALL, type WaterfallInputs } from './engine';

const flat: WaterfallInputs = {
  ...DEFAULT_WATERFALL,
  laborGrowth: 0,
  growth: { business: 0, realEstate: 0, investments: 0, permanent: 0, insurance: 0, family: 0 },
  yieldDown: { business: 0, realEstate: 0, investments: 0, permanent: 0, insurance: 0 },
  recycleRate: 0,
};

describe('simulateWaterfall — conservation', () => {
  it('with no growth, yield or recycling, total capital equals cumulative labor surplus', () => {
    const rows = simulateWaterfall(flat);
    expect(rows.length).toBe(31);
    for (const r of rows) {
      expect(r.total).toBeCloseTo(cumulativeLabor(rows, r.year), 1);
    }
    expect(rows[30].total).toBeCloseTo(120_000 * 30, 1);
  });

  it('allocations in year one follow the cascade shares', () => {
    const r = simulateWaterfall(flat)[1];
    // 120k → business keeps 35% = 42k; 78k → RE keeps 30% = 23.4k; 54.6k → inv 35% = 19.11k; 35.49k → perm 20% = 7.098k; 28.392k → ins 15% = 4.2588k; family 24.1332k
    expect(r.balances.business).toBeCloseTo(42_000, 1);
    expect(r.balances.realEstate).toBeCloseTo(23_400, 1);
    expect(r.balances.investments).toBeCloseTo(19_110, 1);
    expect(r.balances.permanent).toBeCloseTo(7_098, 1);
    expect(r.balances.insurance).toBeCloseTo(4_258.8, 1);
    expect(r.balances.family).toBeCloseTo(24_133.2, 1);
    expect(r.cascade.business).toBe(120_000);
    expect(r.cascade.family).toBeCloseTo(24_133.2, 1);
  });

  it('recycling moves capital upward out of family capital without creating any', () => {
    const noRec = simulateWaterfall(flat)[5];
    const rec = simulateWaterfall({ ...flat, recycleRate: 0.5 })[5];
    expect(rec.total).toBeCloseTo(noRec.total, 1);
    expect(rec.balances.family).toBeLessThan(noRec.balances.family);
    expect(rec.balances.business).toBeGreaterThan(noRec.balances.business);
    expect(rec.recycle.total).toBeGreaterThan(0);
    expect(rec.recycle.business + rec.recycle.realEstate + rec.recycle.investments).toBeCloseTo(rec.recycle.total, 1);
  });
});

describe('simulateWaterfall — growth and yields', () => {
  it('growth compounds a tier balance', () => {
    const rows = simulateWaterfall({ ...flat, growth: { ...flat.growth, business: 0.1 } });
    // year 2 business = 42000*1.1 + 42000 = 88200
    expect(rows[2].balances.business).toBeCloseTo(88_200, 1);
  });

  it('cash yield is paid down the cascade rather than kept', () => {
    const rows = simulateWaterfall({ ...flat, yieldDown: { ...flat.yieldDown, business: 0.1 } });
    // year 2: business opening 42000, yield 4200 paid down; business then retains 35% of 120k again → 37800 + 42000 = 79800
    expect(rows[2].balances.business).toBeCloseTo(79_800, 1);
    // real estate receives 78000 + 4200 = 82200 in year 2
    expect(rows[2].cascade.realEstate).toBeCloseTo(82_200, 1);
  });

  it('default scenario is conservative and monotonic in total', () => {
    const rows = simulateWaterfall(DEFAULT_WATERFALL);
    for (let i = 1; i < rows.length; i++) expect(rows[i].total).toBeGreaterThan(rows[i - 1].total);
    expect(rows[30].total).toBeGreaterThan(cumulativeLabor(rows, 30));
    expect(rows[30].total).toBeLessThan(cumulativeLabor(rows, 30) * 3);
  });

  it('clamps horizon to 1..100 years', () => {
    expect(simulateWaterfall({ ...flat, years: 0 }).length).toBe(2);
    expect(simulateWaterfall({ ...flat, years: 500 }).length).toBe(101);
  });
});
