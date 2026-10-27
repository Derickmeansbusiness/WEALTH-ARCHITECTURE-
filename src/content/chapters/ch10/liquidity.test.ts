import { describe, it, expect } from 'vitest';
import { liquidityGap, comparePremiums, DEFAULT_LIQUIDITY } from './liquidity';

describe('liquidityGap', () => {
  it('computes the default scenario', () => {
    const r = liquidityGap(DEFAULT_LIQUIDITY);
    expect(r.liquidAssets).toBeCloseTo(6_000_000);
    expect(r.illiquidAssets).toBeCloseTo(34_000_000);
    expect(r.taxableBase).toBeCloseTo(25_000_000);
    expect(r.transferTax).toBeCloseTo(10_000_000);
    expect(r.settlementCosts).toBeCloseTo(800_000);
    expect(r.totalCashNeed).toBeCloseTo(12_300_000);
    expect(r.gap).toBeCloseTo(6_300_000);
    expect(r.forcedSaleShare).toBeCloseTo(6_300_000 / 34_000_000);
  });
  it('existing death benefit reduces the gap and never goes negative', () => {
    const r = liquidityGap({ ...DEFAULT_LIQUIDITY, existingDeathBenefit: 20_000_000 });
    expect(r.gap).toBe(0);
    expect(r.forcedSaleShare).toBe(0);
  });
  it('exemption above the estate yields no transfer tax', () => {
    const r = liquidityGap({ ...DEFAULT_LIQUIDITY, estateValue: 10_000_000, exemptionApplied: 15_000_000 });
    expect(r.taxableBase).toBe(0);
    expect(r.transferTax).toBe(0);
  });
});

describe('comparePremiums', () => {
  it('term covers only its own years and permanent covers the horizon', () => {
    const c = comparePremiums(10_000, 20, 60_000, 30, 0);
    expect(c.termCoverageYears).toBe(20);
    expect(c.termTotal).toBe(200_000);
    expect(c.permanentTotal).toBe(1_800_000);
    expect(c.extraPremiumGrownElsewhere).toBeCloseTo(50_000 * 20 + 60_000 * 10);
  });
  it('grows the premium difference at the alternative return', () => {
    const c = comparePremiums(0, 0, 10_000, 2, 0.1);
    expect(c.extraPremiumGrownElsewhere).toBeCloseTo(10_000 * 1.1 + 10_000);
  });
});
