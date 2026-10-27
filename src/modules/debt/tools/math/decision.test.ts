import { describe, it, expect } from 'vitest';
import { compareScenarios, DEFAULT_DECISION, radarDims, tradeoffs, validateDecision } from './decision';

describe('compareScenarios', () => {
  const s = compareScenarios(DEFAULT_DECISION);
  const [a, b, c] = s;
  it('builds three scenarios with increasing leverage', () => {
    expect(a.ltv).toBe(0);
    expect(b.ltv).toBeCloseTo(0.55);
    expect(c.ltv).toBeCloseTo(0.8);
    expect(a.loan).toBe(0);
    expect(c.loan).toBe(800_000);
  });
  it('capital required falls and total interest rises with leverage', () => {
    expect(a.capitalRequired).toBeGreaterThan(b.capitalRequired);
    expect(b.capitalRequired).toBeGreaterThan(c.capitalRequired);
    expect(a.totalInterest).toBe(0);
    expect(c.totalInterest).toBeGreaterThan(b.totalInterest);
  });
  it('all-equity has infinite DSCR and no balance at exit', () => {
    expect(a.dscrY1).toBe(Infinity);
    expect(a.balanceAtExit).toBe(0);
    expect(a.ltvAtExit).toBe(0);
  });
  it('stress lowers DSCR for leveraged scenarios', () => {
    expect(b.stressedDscr).toBeLessThan(b.dscrY1);
    expect(c.stressedDscr).toBeLessThan(b.stressedDscr);
  });
  it('a value shock hurts the leveraged scenario proportionally more', () => {
    expect(c.shockHitPctOfCapital).toBeGreaterThan(a.shockHitPctOfCapital);
    expect(c.shockHit).toBeCloseTo(a.shockHit, -2); // same asset, same absolute hit…
    expect(a.equityAfterShock).toBeGreaterThan(0);  // …borne by less capital in C
  });
  it('shock equity equals unshocked exit equity less the shock on value', () => {
    // equity after shock = value×(1−shock) − balance ⇒ difference equals shock × exit value
    const exitValue = DEFAULT_DECISION.price * Math.pow(1 + DEFAULT_DECISION.appreciation, DEFAULT_DECISION.holdYears);
    expect(c.equityAtExit - c.equityAfterShock).toBeCloseTo(exitValue * DEFAULT_DECISION.shockPct, -2);
  });
  it('reserve requirement for a 12-month vacancy is 12 months of expenses + debt service', () => {
    expect(a.reservesFor12moVacancy).toBeCloseTo(DEFAULT_DECISION.expenses, 2);
    expect(c.reservesFor12moVacancy).toBeGreaterThan(a.reservesFor12moVacancy);
  });
});

describe('radar and tradeoffs', () => {
  const s = compareScenarios(DEFAULT_DECISION);
  it('radar values are within 0..1', () => {
    const r = radarDims(s, DEFAULT_DECISION);
    expect(r.axes.length).toBe(7);
    for (const ser of r.series) for (const v of ser.values) { expect(v).toBeGreaterThanOrEqual(-1e-9); expect(v).toBeLessThanOrEqual(1 + 1e-9); }
  });
  it('tradeoffs never recommend; one neutral statement per scenario', () => {
    const t = tradeoffs(s);
    expect(t.map((x) => x.scenario)).toEqual(['A', 'B', 'C']);
    for (const x of t) expect(x.text.toLowerCase()).not.toMatch(/\brecommend|\bbest\b|you should/);
  });
  it('validation', () => {
    expect(validateDecision(DEFAULT_DECISION)).toEqual([]);
    expect(validateDecision({ ...DEFAULT_DECISION, ltvB: 0.9, ltvC: 0.5 }).length).toBeGreaterThan(0);
  });
});
