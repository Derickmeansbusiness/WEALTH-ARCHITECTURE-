import { describe, it, expect } from 'vitest';
import { simulatePath, compareAll, averageStake, DEFAULT_TRANSFER, type TransferInput } from './model';

describe('simulatePath — direct', () => {
  it('fragments ownership to heirs^3 and steps up basis', () => {
    const r = simulatePath('direct', DEFAULT_TRANSFER);
    expect(r.ownersAfter).toBe(27);
    expect(r.legalOwners).toBe(27);
    expect(r.embeddedGain).toBe(0);
    expect(r.steps.length).toBe(3);
    expect(r.steps[2].decedents).toBe(9);
  });
  it('charges no tax when value stays under the aggregate exemption', () => {
    const small: TransferInput = { ...DEFAULT_TRANSFER, estateValue: 1_000_000, growth: 0 };
    const r = simulatePath('direct', small);
    expect(r.totalTax).toBe(0);
    expect(r.totalAdmin).toBeCloseTo(1_000_000 * 0.03 + 970_000 * 0.03 + 940_900 * 0.03, 0);
  });
  it('taxes value above exemption at the flat rate in the first generation', () => {
    const inp: TransferInput = { ...DEFAULT_TRANSFER, estateValue: 25_000_000, growth: 0, exemption: 15_000_000, taxRate: 0.4, probateCost: 0 };
    const r = simulatePath('direct', inp);
    expect(r.steps[0].tax).toBeCloseTo(4_000_000, 0);
    // second generation: 3 decedents share 21M, exemptions 45M → no tax
    expect(r.steps[1].tax).toBe(0);
  });
});

describe('simulatePath — trust', () => {
  it('keeps one legal owner, taxes once at funding, carries over basis', () => {
    const r = simulatePath('trust', DEFAULT_TRANSFER);
    expect(r.legalOwners).toBe(1);
    expect(r.ownersAfter).toBe(27); // beneficiaries
    expect(r.steps[0].gen).toBe(0);
    expect(r.steps[0].tax).toBeCloseTo((20_000_000 - 15_000_000) * 0.4, 0);
    expect(r.steps.slice(1).every((s) => s.tax === 0)).toBe(true);
    expect(r.embeddedGain).toBeGreaterThan(0);
  });
  it('no funding tax when estate is within exemption', () => {
    const r = simulatePath('trust', { ...DEFAULT_TRANSFER, estateValue: 10_000_000 });
    expect(r.totalTax).toBe(0);
  });
});

describe('simulatePath — business succession', () => {
  it('consolidates to one owner and applies the valuation discount', () => {
    const inp: TransferInput = { ...DEFAULT_TRANSFER, growth: 0, estateValue: 40_000_000, discount: 0.25, probateCost: 0 };
    const r = simulatePath('business', inp);
    expect(r.legalOwners).toBe(1);
    expect(r.steps[0].taxable).toBeCloseTo(40_000_000 * 0.75 - 15_000_000, 0);
  });
});

describe('compareAll & helpers', () => {
  it('returns all three paths with a common gross value', () => {
    const all = compareAll(DEFAULT_TRANSFER);
    expect(all.direct.grossValue).toBeCloseTo(all.trust.grossValue, 6);
    expect(all.trust.grossValue).toBeCloseTo(all.business.grossValue, 6);
    expect(all.direct.grossValue).toBeGreaterThan(DEFAULT_TRANSFER.estateValue);
  });
  it('final value never exceeds gross value', () => {
    const all = compareAll(DEFAULT_TRANSFER);
    for (const p of Object.values(all)) expect(p.finalValue).toBeLessThanOrEqual(p.grossValue + 1e-6);
  });
  it('averageStake is 1/owners', () => {
    expect(averageStake(27)).toBeCloseTo(1 / 27, 10);
    expect(averageStake(0)).toBe(0);
  });
});
