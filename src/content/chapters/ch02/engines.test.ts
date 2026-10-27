import { describe, it, expect } from 'vitest';
import { analyzeMix, normaliseShares, ENGINES } from './engines';

const zero = { labor: 0, business: 0, realestate: 0, financial: 0, ip: 0 };

describe('normaliseShares', () => {
  it('normalises arbitrary weights to sum 1', () => {
    const n = normaliseShares({ ...zero, business: 2, realestate: 2 });
    expect(n.business).toBeCloseTo(0.5);
    expect(n.realestate).toBeCloseTo(0.5);
    expect(Object.values(n).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
  });
  it('returns zeros when all weights are zero', () => {
    expect(Object.values(normaliseShares(zero)).every((v) => v === 0)).toBe(true);
  });
  it('clamps negative weights to zero', () => {
    const n = normaliseShares({ ...zero, business: -5, financial: 1 });
    expect(n.business).toBe(0); expect(n.financial).toBe(1);
  });
});

describe('analyzeMix', () => {
  it('computes cash flow, growth and leverage from engine profiles', () => {
    const re = ENGINES.find((e) => e.id === 'realestate')!;
    const r = analyzeMix({ totalCapital: 1_000_000, shares: { ...zero, realestate: 1 } });
    expect(r.annualCashFlow).toBeCloseTo(1_000_000 * re.cashYield);
    expect(r.annualGrowth).toBeCloseTo(1_000_000 * re.appreciation);
    expect(r.leverageCapacity).toBeCloseTo(1_000_000 * re.maxLtv);
  });
  it('flags a single-engine mix as highly concentrated', () => {
    const r = analyzeMix({ totalCapital: 100, shares: { ...zero, business: 1 } });
    expect(r.herfindahl).toBeCloseTo(1);
    expect(r.effectiveEngines).toBeCloseTo(1);
    expect(r.concentration).toBe('high');
    expect(r.largestEngine).toBe('business');
  });
  it('flags an even four-engine mix as low concentration', () => {
    const r = analyzeMix({ totalCapital: 100, shares: { ...zero, business: 1, realestate: 1, financial: 1, ip: 1 } });
    expect(r.effectiveEngines).toBeCloseTo(4);
    expect(r.concentration).toBe('low');
  });
  it('handles zero capital without NaN', () => {
    const r = analyzeMix({ totalCapital: 0, shares: { ...zero, business: 1 } });
    expect(r.blendedCashYield).toBe(0);
    expect(r.annualCashFlow).toBe(0);
  });
});
