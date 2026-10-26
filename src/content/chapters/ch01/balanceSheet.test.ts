import { describe, it, expect } from 'vitest';
import { summarize, regroup, sumEquity, type AssetLine, type LiabilityLine } from './balanceSheet';

const assets: AssetLine[] = [
  { id: 'a1', label: 'Home', kind: 'residence', value: 2_000_000 },
  { id: 'a2', label: 'Cash', kind: 'cash', value: 100_000 },
  { id: 'a3', label: 'Brokerage', kind: 'securities', value: 400_000 },
  { id: 'a4', label: 'Duplex', kind: 'rental', value: 600_000 },
  { id: 'a5', label: 'Company', kind: 'business', value: 1_500_000 },
];
const liabilities: LiabilityLine[] = [
  { id: 'l1', label: 'Mortgage', kind: 'mortgage', value: 1_500_000, annualService: 120_000 },
  { id: 'l2', label: 'Cars', kind: 'consumer', value: 50_000, annualService: 18_000 },
  { id: 'l3', label: 'Duplex loan', kind: 'rental-debt', value: 420_000, annualService: 33_000 },
];

describe('summarize', () => {
  const s = summarize(assets, liabilities, 150_000);
  it('computes the accounting identity', () => {
    expect(s.totalAssets).toBe(4_600_000);
    expect(s.totalLiabilities).toBe(1_970_000);
    expect(s.netWorth).toBe(2_630_000);
  });
  it('classifies liquid and working assets', () => {
    expect(s.liquidAssets).toBe(500_000); // cash + securities
    expect(s.workingAssets).toBe(2_500_000); // securities + rental + business
    expect(s.consumptionAssets).toBe(2_100_000);
    expect(s.liquidShare).toBeCloseTo(500_000 / 4_600_000, 6);
  });
  it('computes liquidity runway as liquid / (living + debt service)', () => {
    // obligations = 150k + 120k + 18k + 33k = 321k
    expect(s.liquidityRatio).toBeCloseTo(500_000 / 321_000, 6);
  });
  it('handles an empty sheet without NaN', () => {
    const e = summarize([], [], 0);
    expect(e.netWorth).toBe(0);
    expect(e.liquidShare).toBe(0);
    expect(e.liquidityRatio).toBe(Infinity);
  });
  it('ignores negative inputs', () => {
    const n = summarize([{ id: 'x', label: 'x', kind: 'cash', value: -5 }], [], 10);
    expect(n.totalAssets).toBe(0);
  });
});

describe('regroup', () => {
  const groups = regroup(assets, liabilities);
  it('preserves total equity when re-grouping (value does not change, only ownership)', () => {
    expect(sumEquity(groups)).toBe(summarize(assets, liabilities, 0).netWorth);
  });
  it('creates one LLC per rental and a holding company for business interests', () => {
    expect(groups.filter((g) => g.kind === 'llc')).toHaveLength(1);
    expect(groups.some((g) => g.kind === 'holdco')).toBe(true);
  });
  it('keeps the residence and its mortgage personal', () => {
    const personal = groups.find((g) => g.id === 'personal')!;
    expect(personal.assets.some((a) => a.kind === 'residence')).toBe(true);
    expect(personal.liabilities.some((l) => l.kind === 'mortgage')).toBe(true);
  });
  it('omits empty groups', () => {
    const g = regroup([{ id: 'a', label: 'Cash', kind: 'cash', value: 1000 }], []);
    expect(g.map((x) => x.id)).toEqual(['personal']);
  });
});
