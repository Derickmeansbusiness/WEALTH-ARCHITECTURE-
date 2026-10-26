import { describe, it, expect } from 'vitest';
import { ownership, descendants, transitionsBy, generationAt, simulate, transitionTax, DEFAULT_ASSUMPTIONS, stopIndex, type Assumptions } from './math';

describe('fragmentation math', () => {
  it('counts transitions at years 30/60/90', () => {
    expect(transitionsBy(0)).toBe(0); expect(transitionsBy(29)).toBe(0); expect(transitionsBy(30)).toBe(1);
    expect(transitionsBy(60)).toBe(2); expect(transitionsBy(100)).toBe(3);
    expect(generationAt(0)).toBe(1); expect(generationAt(95)).toBe(4);
  });
  it('direct inheritance fragments 1 → 3 → 9 → 27 with three children per generation', () => {
    expect(ownership('direct', 0, 3).legalOwners).toBe(1);
    expect(ownership('direct', 30, 3).legalOwners).toBe(3);
    expect(ownership('direct', 60, 3).legalOwners).toBe(9);
    expect(ownership('direct', 90, 3).legalOwners).toBe(27);
    expect(ownership('direct', 90, 3).fraction).toBeCloseTo(1 / 27, 10);
  });
  it('a dynasty trust keeps one legal owner while stakeholders grow', () => {
    const o = ownership('trust', 90, 3);
    expect(o.legalOwners).toBe(1); expect(o.stakeholders).toBe(27); expect(o.fraction).toBe(1);
  });
  it('business succession concentrates business ownership among active heirs', () => {
    expect(ownership('succession', 60, 3, 1).businessOwners).toBe(1);
    expect(ownership('succession', 60, 3, 2).businessOwners).toBe(2);
    expect(ownership('succession', 60, 3).legalOwners).toBe(9);
  });
  it('descendants handles k=1 and k=4', () => {
    expect(descendants(100, 1)).toBe(1); expect(descendants(100, 4)).toBe(64);
  });
});

describe('transfer-tax at transitions', () => {
  const a: Assumptions = { ...DEFAULT_ASSUMPTIONS, taxRate: 0.4, exemption: 10 };
  it('applies the exemption per estate', () => {
    // 100 of wealth, 1 decedent, exemption 10 → taxable 90 → tax 36
    expect(transitionTax('direct', 100, 1, a, 1).tax).toBeCloseTo(36);
    // 3 decedents: each estate 33.33, taxable 23.33 → 9.33 each → 28
    expect(transitionTax('direct', 100, 3, a, 1).tax).toBeCloseTo(28);
  });
  it('trust: taxes the non-exempt remainder once and tracks the non-exempt share', () => {
    const r = transitionTax('trust', 100, 1, a, 1);
    expect(r.tax).toBeCloseTo(36);
    // after tax wealth 64; non-exempt remainder 90-36 = 54 → share 54/64
    expect(r.nonExemptShare).toBeCloseTo(54 / 64);
    const r2 = transitionTax('trust', 64, 1, a, r.nonExemptShare);
    expect(r2.tax).toBeCloseTo(54 * 0.4);
  });
  it('trust never shows zero tax when wealth exceeds the exemption (no model eliminates tax)', () => {
    const sim = simulate('trust', DEFAULT_ASSUMPTIONS);
    expect(sim.totalTax).toBeGreaterThan(0);
  });
});

describe('simulate', () => {
  const flat: Assumptions = { ...DEFAULT_ASSUMPTIONS, growth: 0, spending: 0, taxRate: 0, exemption: 0, leakage: { direct: 0, trust: 0, succession: 0, office: 0 } };
  it('conserves wealth with no growth, spending, tax or leakage', () => {
    const s = simulate('direct', flat);
    expect(s.finalWealth).toBeCloseTo(flat.startWealth);
    expect(s.events.length).toBe(3);
    expect(s.path.length).toBe(101);
  });
  it('records three transition events at 30/60/90 with growing decedent counts', () => {
    const s = simulate('direct', DEFAULT_ASSUMPTIONS);
    expect(s.events.map((e) => e.year)).toEqual([30, 60, 90]);
    expect(s.events.map((e) => e.decedents)).toEqual([1, 3, 9]);
  });
  it('leakage reduces wealth at transitions', () => {
    const noLeak = simulate('direct', { ...flat });
    const leak = simulate('direct', { ...flat, leakage: { ...flat.leakage, direct: 0.1 } });
    expect(leak.finalWealth).toBeCloseTo(flat.startWealth * Math.pow(0.9, 3));
    expect(leak.finalWealth).toBeLessThan(noLeak.finalWealth);
  });
  it('maps years to the nearest stop', () => {
    expect(stopIndex(0)).toBe(0); expect(stopIndex(37)).toBe(1); expect(stopIndex(62)).toBe(2); expect(stopIndex(63)).toBe(3); expect(stopIndex(100)).toBe(4);
  });
});
