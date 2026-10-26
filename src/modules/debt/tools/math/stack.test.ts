import { describe, it, expect } from 'vitest';
import { blendedCost, defaultStack, liquidationWaterfall, moveTranche, normalizeRanks, paymentWaterfall, stackGap, stackTotal, TARGET_TOTAL } from './stack';

const stack = defaultStack('acquisition');

describe('stack totals', () => {
  it('default stacks sum to the $5M target', () => {
    expect(stackTotal(defaultStack('acquisition'))).toBe(TARGET_TOTAL);
    expect(stackTotal(defaultStack('development'))).toBe(TARGET_TOTAL);
    expect(stackGap(stack)).toBe(0);
  });
  it('gap reflects under/over-funding', () => {
    expect(stackGap(stack.map((t) => (t.id === 'common' ? { ...t, amount: 800_000 } : t)))).toBe(200_000);
    expect(stackGap(stack.map((t) => (t.id === 'common' ? { ...t, amount: 1_200_000 } : t)))).toBe(-200_000);
  });
});

describe('paymentWaterfall', () => {
  it('pays everyone and gives the residual to common when cash is ample', () => {
    const w = paymentWaterfall(stack, 600_000);
    expect(w.totalPaid).toBeCloseTo(w.totalDue, 6);
    expect(w.residualToCommon).toBeCloseTo(600_000 - w.totalDue, 6);
    const sum = w.rows.reduce((s, r) => s + r.paid, 0);
    expect(sum).toBeCloseTo(600_000, 6);
  });
  it('shorts the junior tranches first when cash is tight', () => {
    const due = 2_500_000 * 0.07 + 750_000 * 0.08; // senior + sub interest
    const w = paymentWaterfall(stack, due + 10_000);
    const senior = w.rows.find((r) => r.id === 'senior')!;
    const sub = w.rows.find((r) => r.id === 'sub')!;
    const mezz = w.rows.find((r) => r.id === 'mezz')!;
    const pref = w.rows.find((r) => r.id === 'pref')!;
    const common = w.rows.find((r) => r.id === 'common')!;
    expect(senior.shortfall).toBe(0);
    expect(sub.shortfall).toBe(0);
    expect(mezz.paid).toBeCloseTo(10_000, 6);
    expect(mezz.shortfall).toBeCloseTo(500_000 * 0.13 - 10_000, 6);
    expect(pref.paid).toBe(0);
    expect(common.paid).toBe(0);
    expect(w.rows.reduce((s, r) => s + r.paid, 0)).toBeCloseTo(due + 10_000, 6);
  });
  it('zero cash pays nothing', () => {
    const w = paymentWaterfall(stack, 0);
    expect(w.rows.every((r) => r.paid === 0)).toBe(true);
  });
});

describe('liquidationWaterfall', () => {
  it('full value repays all principal and hands surplus to common', () => {
    const l = liquidationWaterfall(stack, 6_000_000);
    expect(l.totalLoss).toBe(0);
    expect(l.surplusToCommon).toBeCloseTo(1_000_000, 6);
    expect(l.rows.find((r) => r.id === 'common')!.recovered).toBeCloseTo(2_000_000, 6);
  });
  it('losses are allocated bottom-up: common wiped first, then preferred, then mezz', () => {
    const l = liquidationWaterfall(stack, 3_600_000); // senior 2.5M + sub 0.75M + 0.35M of mezz
    const r = Object.fromEntries(l.rows.map((x) => [x.id, x]));
    expect(r.senior.recoveryPct).toBeCloseTo(1);
    expect(r.sub.recoveryPct).toBeCloseTo(1);
    expect(r.mezz.recovered).toBeCloseTo(350_000, 6);
    expect(r.mezz.recoveryPct).toBeCloseTo(0.7);
    expect(r.pref.recovered).toBe(0);
    expect(r.common.recovered).toBe(0);
    expect(r.common.loss).toBe(1_000_000);
    expect(l.totalLoss).toBeCloseTo(5_000_000 - 3_600_000, 6);
  });
  it('senior takes a loss only when value falls below senior principal', () => {
    const l = liquidationWaterfall(stack, 2_000_000);
    const senior = l.rows.find((r) => r.id === 'senior')!;
    expect(senior.recoveryPct).toBeCloseTo(0.8);
    expect(l.rows.filter((r) => r.id !== 'senior').every((r) => r.recovered === 0)).toBe(true);
  });
});

describe('ranks and blended cost', () => {
  it('normalizeRanks keeps common last and numbers 1..n', () => {
    const shuffled = stack.map((t) => ({ ...t, rank: t.id === 'common' ? 1 : t.rank + 1 }));
    const n = normalizeRanks(shuffled);
    expect(n.map((t) => t.rank)).toEqual([1, 2, 3, 4, 5]);
    expect(n[n.length - 1].kind).toBe('common');
  });
  it('moveTranche swaps neighbours but never past common', () => {
    const moved = moveTranche(stack, 'mezz', -1);
    expect(moved.find((t) => t.id === 'mezz')!.rank).toBe(2);
    expect(moved.find((t) => t.id === 'sub')!.rank).toBe(3);
    const blocked = moveTranche(stack, 'pref', 1);
    expect(blocked.find((t) => t.id === 'pref')!.rank).toBe(4);
  });
  it('blended cost is the amount-weighted average of tranche rates', () => {
    const b = blendedCost(stack);
    const expected = (2_500_000 * 0.07 + 750_000 * 0.08 + 500_000 * 0.13 + 250_000 * 0.12 + 1_000_000 * 0.22) / 5_000_000;
    expect(b.blended).toBeCloseTo(expected, 8);
    expect(b.debtShare).toBeCloseTo(0.75);
    expect(b.equityShare).toBeCloseTo(0.25);
  });
});
