import { describe, it, expect } from 'vitest';
import { expansionModel, equitySensitivity, consolidate } from './math';
import { buildLoan } from '@/lib/finance';

describe('expansionModel', () => {
  const base = { cost: 240000, financedShare: 0.75, annualRate: 0.09, termMonths: 60, annualRevenue: 180000, annualOperatingCost: 95000, holdYears: 7 };

  it('splits cost into loan and equity', () => {
    const r = expansionModel(base);
    expect(r.loanAmount).toBe(180000);
    expect(r.equityIn).toBe(60000);
  });

  it('uses the shared loan engine for debt service', () => {
    const r = expansionModel(base);
    const loan = buildLoan({ principal: 180000, annualRate: 0.09, termMonths: 60, structure: 'amortizing' });
    expect(r.periodicPayment).toBeCloseTo(loan.periodicPayment, 2);
    expect(r.years[0].debtService).toBeCloseTo(loan.periodicPayment * 12, 0);
    // after the 5-year term there is no more debt service
    expect(r.years[5].debtService).toBe(0);
    expect(r.years[5].loanBalance).toBe(0);
    expect(r.years[4].loanBalance).toBe(0);
  });

  it('net cash flow = operating cash flow − debt service', () => {
    const r = expansionModel(base);
    for (const y of r.years) expect(y.netCashFlow).toBeCloseTo(y.operatingCashFlow - y.debtService, 6);
    expect(r.years[0].operatingCashFlow).toBe(85000);
  });

  it('accumulates cumulative cash flow starting from −equity and finds payback', () => {
    const r = expansionModel(base);
    expect(r.years[0].cumulativeNetCashFlow).toBeCloseTo(-60000 + r.years[0].netCashFlow, 6);
    expect(r.paybackYear).not.toBeNull();
    expect(r.paybackYear!).toBeGreaterThanOrEqual(1);
    const idx = r.paybackYear! - 1;
    expect(r.years[idx].cumulativeNetCashFlow).toBeGreaterThanOrEqual(0);
    if (idx > 0) expect(r.years[idx - 1].cumulativeNetCashFlow).toBeLessThan(0);
  });

  it('applies growth and ramp-up', () => {
    const grown = expansionModel({ ...base, growth: 0.1 });
    expect(grown.years[1].revenue).toBeCloseTo(180000 * 1.1, 6);
    const ramped = expansionModel({ ...base, rampMonths: 12 });
    // linear ramp over 12 months → average 50% of capacity in year one (midpoint rule gives exactly 0.5)
    expect(ramped.years[0].revenue).toBeCloseTo(90000, 0);
    expect(ramped.years[1].revenue).toBeCloseTo(180000, 0);
  });

  it('reports DSCR and tracks the minimum', () => {
    const r = expansionModel(base);
    expect(r.years[0].dscr).toBeCloseTo(85000 / r.years[0].debtService, 6);
    expect(r.minDscr).toBeLessThanOrEqual(r.years[0].dscr);
    const weak = expansionModel({ ...base, annualRevenue: 130000 });
    expect(weak.minDscr).toBeLessThan(1);
    expect(weak.years[0].netCashFlow).toBeLessThan(0);
  });

  it('handles an all-equity purchase', () => {
    const r = expansionModel({ ...base, financedShare: 0 });
    expect(r.loanAmount).toBe(0);
    expect(r.equityIn).toBe(240000);
    expect(r.years[0].debtService).toBe(0);
    expect(r.years[0].dscr).toBe(Infinity);
    expect(r.totalInterest).toBe(0);
  });

  it('depreciates straight-line over useful life', () => {
    const r = expansionModel({ ...base, usefulLifeYears: 8, holdYears: 10 });
    expect(r.years[0].depreciation).toBe(30000);
    expect(r.years[7].depreciation).toBe(30000);
    expect(r.years[8].depreciation).toBe(0);
  });
});

describe('equitySensitivity', () => {
  it('a 10% move on a 70% LTV asset moves equity by one third', () => {
    const up = equitySensitivity(1_000_000, 700_000, 0.1);
    expect(up.equity0).toBe(300_000);
    expect(up.equity1).toBe(400_000);
    expect(up.equityChangePct).toBeCloseTo(1 / 3, 6);
    expect(up.multiplier).toBeCloseTo(3.3333, 3);
    const down = equitySensitivity(1_000_000, 700_000, -0.1);
    expect(down.equity1).toBe(200_000);
    expect(down.equityChangePct).toBeCloseTo(-1 / 3, 6);
  });
  it('all-cash purchase has multiplier 1', () => {
    const r = equitySensitivity(1_000_000, 0, 0.1);
    expect(r.multiplier).toBe(1);
    expect(r.equityChangePct).toBeCloseTo(0.1, 6);
  });
  it('a 30% fall on 70% LTV wipes out equity', () => {
    const r = equitySensitivity(1_000_000, 700_000, -0.3);
    expect(r.equity1).toBeCloseTo(0, 6);
  });
});

describe('consolidate', () => {
  const entities = [
    { name: 'Holding', assets: [{ label: 'Cash', value: 100 }, { label: 'Loan to OpCo', value: 500, intercompany: true }], liabilities: [{ label: 'Bank term loan', value: 300 }] },
    { name: 'OpCo', assets: [{ label: 'Cash', value: 50 }, { label: 'Equipment', value: 700 }], liabilities: [{ label: 'Loan from Holding', value: 500, intercompany: true }, { label: 'Trade payables', value: 80 }] },
  ];
  it('eliminates intercompany lines from both sides', () => {
    const c = consolidate(entities);
    expect(c.eliminatedAssets).toBe(500);
    expect(c.eliminatedLiabilities).toBe(500);
    expect(c.balanced).toBe(true);
    expect(c.totalAssets).toBe(850);
    expect(c.totalLiabilities).toBe(380);
    expect(c.equity).toBe(470);
  });
  it('merges same-label lines', () => {
    const c = consolidate(entities);
    expect(c.assets.find((a) => a.label === 'Cash')?.value).toBe(150);
  });
  it('flags unbalanced intercompany positions', () => {
    const c = consolidate([{ name: 'A', assets: [{ label: 'Loan to B', value: 100, intercompany: true }], liabilities: [] }, { name: 'B', assets: [], liabilities: [{ label: 'Loan from A', value: 90, intercompany: true }] }]);
    expect(c.balanced).toBe(false);
  });
});
