import { describe, it, expect } from 'vitest';
import { balanceAfter } from '@/lib/finance';
import { annualDebtService, balanceAtMaturity, collateralTable, consolidate, loanBalance, maturityDate, mergeScenarioLoans, monthsBetween, scenarioLoans } from './dashboard';
import { DEMO_FAMILY } from './demoFamily';

const AS_OF = new Date('2026-10-26T00:00:00Z');

describe('balances', () => {
  it('monthsBetween counts whole months', () => {
    expect(monthsBetween('2022-03-01', AS_OF)).toBe(55);
    expect(monthsBetween('2030-01-01', AS_OF)).toBe(0);
  });
  it('balloon loan balance follows balanceAfter on the amortization horizon', () => {
    const L1 = DEMO_FAMILY.loans.find((l) => l.id === 'L1')!;
    expect(loanBalance(L1, AS_OF)).toBeCloseTo(balanceAfter(2_600_000, 0.062 / 12, 300, 55), 2);
    expect(balanceAtMaturity(L1)).toBeCloseTo(balanceAfter(2_600_000, 0.062 / 12, 300, 84), 2);
  });
  it('interest-only keeps principal; amortizing declines; matured loans are zero', () => {
    const L4 = DEMO_FAMILY.loans.find((l) => l.id === 'L4')!;
    expect(loanBalance(L4, AS_OF)).toBe(1_200_000);
    const L2 = DEMO_FAMILY.loans.find((l) => l.id === 'L2')!;
    expect(loanBalance(L2, AS_OF)).toBeLessThan(1_500_000);
    expect(loanBalance(L4, new Date('2030-01-01'))).toBe(0);
  });
  it('maturity date and debt service', () => {
    const L5 = DEMO_FAMILY.loans.find((l) => l.id === 'L5')!;
    expect(maturityDate(L5).getFullYear()).toBe(2027);
    expect(annualDebtService(L5)).toBeCloseTo(800_000 * 0.095, 0);
    expect(annualDebtService(L5, 0.115)).toBeGreaterThan(annualDebtService(L5));
  });
});

describe('consolidate', () => {
  const c = consolidate(DEMO_FAMILY, AS_OF);
  it('eliminates intercompany debt from external liabilities', () => {
    const externalIds = ['L1', 'L2', 'L3', 'L4', 'L5'];
    const relatedIds = ['L6', 'L7', 'L8'];
    expect(c.externalLiabilities).toBeCloseTo(externalIds.reduce((s, id) => s + c.balances[id], 0), 2);
    expect(c.eliminated).toBeCloseTo(relatedIds.reduce((s, id) => s + c.balances[id], 0), 2);
    expect(c.eliminated).toBeGreaterThan(0);
    expect(c.netEquity).toBeCloseTo(c.totalAssets - c.externalLiabilities, 2);
    // the sum of entity-level equities double counts nothing once related loans net out:
    const sumEntityEquity = c.byEntity.reduce((s, e) => s + e.equity, 0);
    expect(sumEntityEquity + c.eliminated).toBeCloseTo(c.netEquity, 2);
  });
  it('total assets include cash', () => {
    expect(c.totalCash).toBe(650_000 + 420_000 + 380_000 + 140_000 + 95_000 + 210_000);
    expect(c.totalAssets).toBe(18_200_000 + c.totalCash);
    expect(c.liquidity).toBe(c.totalCash);
  });
  it('detects cross-collateralised assets', () => {
    const ids = c.crossCollateral.map((x) => x.assetId).sort();
    expect(ids).toEqual(['a-office', 'a-resi']);
    const office = c.crossCollateral.find((x) => x.assetId === 'a-office')!;
    expect(office.loanIds.sort()).toEqual(['L1', 'L8']);
    const table = collateralTable(DEMO_FAMILY, c.balances);
    expect(table.find((t) => t.asset.id === 'a-warehouse')!.cross).toBe(false);
    expect(table.find((t) => t.asset.id === 'a-resi')!.cross).toBe(true);
  });
  it('aggregates personal guarantees per person', () => {
    const founder = c.guarantees.find((g) => g.personId === 'p-founder')!;
    expect(founder.loanIds.sort()).toEqual(['L1', 'L2', 'L3', 'L4']);
    expect(founder.exposure).toBeCloseTo(['L1', 'L2', 'L3', 'L4'].reduce((s, id) => s + c.balances[id], 0), 2);
    expect(c.guarantees[0].personId).toBe('p-founder');
  });
  it('flags loans maturing within 24 months', () => {
    const ids = c.upcoming.map((u) => u.loan.id);
    expect(ids).toContain('L4');
    expect(ids).toContain('L5');
    expect(ids).not.toContain('L2');
    expect(c.upcoming[0].monthsToMaturity).toBeLessThanOrEqual(c.upcoming[c.upcoming.length - 1].monthsToMaturity);
  });
  it('floating exposure and +200bps sensitivity', () => {
    expect(c.floatingBalance).toBeCloseTo(c.balances.L2 + c.balances.L3 + c.balances.L4, 2);
    expect(c.floatingShare).toBeGreaterThan(0);
    expect(c.floatingShare).toBeLessThan(1);
    expect(c.sensitivity200).toBeGreaterThan(0);
    expect(c.sensitivity200).toBeCloseTo(annualDebtService(DEMO_FAMILY.loans[3], 0.10) - annualDebtService(DEMO_FAMILY.loans[3]) + (annualDebtService(DEMO_FAMILY.loans[1], 0.091) - annualDebtService(DEMO_FAMILY.loans[1])) + (annualDebtService(DEMO_FAMILY.loans[2], 0.094) - annualDebtService(DEMO_FAMILY.loans[2])), 2);
  });
  it('maturity calendar separates external from related', () => {
    const y2027 = c.maturities.find((m) => m.year === 2027)!;
    expect(y2027.loanIds.sort()).toEqual(['L4', 'L5']);
    expect(y2027.external).toBeCloseTo(1_200_000 + 800_000, 2);
    expect(y2027.related).toBe(0);
  });
});

describe('scenario merge', () => {
  it('maps saved leverage / family-bank scenarios into loans and merges them', () => {
    const loans = scenarioLoans([
      { id: 's1', kind: 'leverage', name: 'My leverage', createdAt: Date.UTC(2026, 0, 1), data: { loanTerms: { principal: 500_000, rate: 0.06, termMonths: 240, structure: 'amortizing', paymentFrequency: 'monthly', relatedParty: false } } },
      { id: 's2', kind: 'family-bank', name: 'Family loan', createdAt: Date.UTC(2026, 0, 1), data: { loan: { principal: 200_000, rate: 0.04, termMonths: 120, structure: 'interest-only' } } },
      { id: 's3', kind: 'stress', name: 'ignored', createdAt: 0, data: {} },
      { id: 's4', kind: 'leverage', name: 'bad data', createdAt: 0, data: { nope: true } },
    ]);
    expect(loans.length).toBe(2);
    expect(loans[0].relatedParty).toBe(false);
    expect(loans[1].relatedParty).toBe(true);
    const merged = mergeScenarioLoans(DEMO_FAMILY, loans);
    expect(merged.loans.length).toBe(DEMO_FAMILY.loans.length + 2);
    expect(merged.entities.some((e) => e.id === 'scn')).toBe(true);
    const c = consolidate(merged, AS_OF);
    expect(c.externalLiabilities).toBeGreaterThan(consolidate(DEMO_FAMILY, AS_OF).externalLiabilities);
    expect(mergeScenarioLoans(DEMO_FAMILY, [])).toBe(DEMO_FAMILY);
  });
});
