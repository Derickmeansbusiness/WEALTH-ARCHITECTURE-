import { describe, it, expect } from 'vitest';
import { buildFlows, applyFlows, totalCash, DEFAULT_INPUTS, ENTITIES } from './engine';

describe('buildFlows — default scenario', () => {
  const flows = buildFlows(DEFAULT_INPUTS);
  const byId = Object.fromEntries(flows.map((f) => [f.id, f]));

  it('produces the full ordered cascade', () => {
    expect(flows.map((f) => f.id)).toEqual(['revenue', 'expenses', 'profit', 'tax', 'distribution', 'loan', 'investment', 'mortgage', 'acquisition', 'contribution', 'premium', 'family', 'interest']);
    flows.forEach((f, i) => expect(f.step).toBe(i + 1));
  });

  it('computes revenue, expenses, profit, tax and distribution', () => {
    expect(byId.revenue.amount).toBe(1_000_000);
    expect(byId.expenses.amount).toBe(650_000);
    expect(byId.profit.amount).toBe(350_000);
    expect(byId.tax.amount).toBeCloseTo(94_500, 2);
    // (350000 - 94500) * 0.8
    expect(byId.distribution.amount).toBeCloseTo(204_400, 2);
  });

  it('sizes the property to the equity PropCo actually received', () => {
    // loan 120k is the equity; 25% equity share → max price 480k < 500k requested
    expect(byId.loan.amount).toBe(120_000);
    expect(byId.acquisition.amount).toBeCloseTo(480_000, 2);
    expect(byId.mortgage.amount).toBeCloseTo(360_000, 2);
    expect(byId.mortgage.notes.length).toBe(1);
  });

  it('never shows a zero tax reserve', () => {
    const zero = buildFlows({ ...DEFAULT_INPUTS, taxReserveRate: 0 });
    const tax = zero.find((f) => f.id === 'tax')!;
    expect(tax.amount).toBeGreaterThan(0);
    expect(tax.notes.length).toBe(1);
  });

  it('every flow carries a complete explanation', () => {
    for (const f of flows) {
      expect(f.explain.economic.length).toBeGreaterThan(20);
      expect(f.explain.legal.length).toBeGreaterThan(20);
      expect(f.explain.documentation.length).toBeGreaterThan(0);
      expect(f.explain.taxQuestions.length).toBeGreaterThan(0);
      expect(f.explain.objectives.length).toBeGreaterThan(0);
    }
  });
});

describe('applyFlows — ledger integrity', () => {
  const flows = buildFlows(DEFAULT_INPUTS);

  it('conserves cash at every step (money moves, it is not created)', () => {
    for (let k = 0; k <= flows.length; k++) {
      expect(totalCash(applyFlows(flows, k))).toBeCloseTo(0, 2);
    }
  });

  it('builds mini balance sheets with assets − liabilities = equity', () => {
    const b = applyFlows(flows, flows.length);
    for (const e of ENTITIES) {
      const x = b[e.id];
      expect(x.equity).toBeCloseTo(x.totalAssets - x.totalLiabilities, 2);
    }
    expect(b.propco.assets['Real estate']).toBeCloseTo(480_000, 2);
    expect(b.propco.liabilities['Mortgage payable']).toBeCloseTo(360_000, 2);
    expect(b.propco.liabilities['Note payable (HoldCo)']).toBe(120_000);
    expect(b.holdco.assets['Note receivable (PropCo)']).toBe(120_000);
  });

  it('OpCo keeps the undistributed after-tax profit', () => {
    const b = applyFlows(flows, flows.length);
    // 350000 - 94500 - 204400 = 51100
    expect(b.opco.cash).toBeCloseTo(51_100, 2);
  });

  it('partial replay stops at the requested step', () => {
    const b = applyFlows(flows, 2); // revenue + expenses only
    expect(b.opco.cash).toBe(350_000);
    expect(b.holdco.cash).toBe(0);
  });
});

describe('buildFlows — clamps', () => {
  it('limits the loan, contribution and family distribution to available HoldCo cash', () => {
    const flows = buildFlows({ ...DEFAULT_INPUTS, loanAmount: 5_000_000, premium: 5_000_000, familyDistribution: 5_000_000 });
    const byId = Object.fromEntries(flows.map((f) => [f.id, f]));
    expect(byId.loan.amount).toBeCloseTo(204_400, 2);
    expect(byId.investment.amount).toBe(0);
    expect(byId.contribution.amount).toBe(0);
    expect(byId.family.amount).toBe(0);
    expect(byId.loan.notes.length).toBe(1);
  });

  it('accrues interest when PropCo has no cash left after closing', () => {
    const flows = buildFlows(DEFAULT_INPUTS);
    const interest = flows.find((f) => f.id === 'interest')!;
    expect(interest.amount).toBeCloseTo(7_200, 2);
    // PropCo cash after closing: 120000 + 360000 - 480000 = 0 → accrued
    expect(interest.postings.some((p) => p.account.startsWith('Interest payable'))).toBe(true);
  });

  it('pays interest in cash when PropCo retains cash', () => {
    const flows = buildFlows({ ...DEFAULT_INPUTS, propertyPrice: 100_000 });
    const interest = flows.find((f) => f.id === 'interest')!;
    expect(interest.postings.every((p) => p.account === 'Cash')).toBe(true);
    expect(totalCash(applyFlows(flows, flows.length))).toBeCloseTo(0, 2);
  });
});
