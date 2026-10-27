import { describe, it, expect } from 'vitest';
import { analyzeRental, structuralDepreciation, segregatedDepreciation, DEFAULT_RENTAL, RECOVERY_YEARS } from './rentalTax';

describe('structuralDepreciation', () => {
  it('spreads basis over 27.5 years with a half-year tail', () => {
    const basis = 275_000;
    expect(structuralDepreciation(basis, 27.5, 1)).toBeCloseTo(10_000);
    expect(structuralDepreciation(basis, 27.5, 27)).toBeCloseTo(10_000);
    expect(structuralDepreciation(basis, 27.5, 28)).toBeCloseTo(5_000);
    expect(structuralDepreciation(basis, 27.5, 29)).toBe(0);
    let total = 0;
    for (let y = 1; y <= 30; y++) total += structuralDepreciation(basis, 27.5, y);
    expect(total).toBeCloseTo(basis);
  });
  it('uses 39 years for nonresidential', () => {
    expect(RECOVERY_YEARS.nonresidential).toBe(39);
    expect(structuralDepreciation(390_000, 39, 5)).toBeCloseTo(10_000);
  });
});

describe('segregatedDepreciation', () => {
  it('applies bonus in year one and straight-line thereafter', () => {
    expect(segregatedDepreciation(100_000, 5, 0.6, 1)).toBeCloseTo(60_000 + 8_000);
    expect(segregatedDepreciation(100_000, 5, 0.6, 3)).toBeCloseTo(8_000);
    expect(segregatedDepreciation(100_000, 5, 0.6, 6)).toBe(0);
    let total = 0;
    for (let y = 1; y <= 6; y++) total += segregatedDepreciation(100_000, 5, 0.6, y);
    expect(total).toBeCloseTo(100_000);
  });
});

describe('analyzeRental', () => {
  it('separates land from building and computes year one correctly', () => {
    const r = analyzeRental(DEFAULT_RENTAL);
    expect(r.landBasis).toBeCloseTo(240_000);
    expect(r.buildingBasis).toBeCloseTo(960_000);
    expect(r.annualStructuralDepreciation).toBeCloseTo(960_000 / 27.5);
    const y1 = r.years[0];
    expect(y1.noi).toBeCloseTo(120_000 * 0.95 - 38_000);
    expect(y1.cashFlow).toBeCloseTo(y1.noi - y1.debtService);
    expect(y1.taxableIncome).toBeCloseTo(y1.noi - y1.interest - y1.depreciation);
    expect(y1.taxableIncome).toBeLessThan(y1.cashFlow + y1.principal); // depreciation shelters more than principal
  });
  it('accumulated depreciation equals the sum of annual depreciation (recapture exposure)', () => {
    const r = analyzeRental({ ...DEFAULT_RENTAL, costSegShare: 0.2, bonusRate: 0.6, holdYears: 7 });
    const sum = r.years.reduce((s, y) => s + y.depreciation, 0);
    expect(r.years[6].accumulatedDepreciation).toBeCloseTo(sum);
    expect(r.years[6].accumulated1245 + r.years[6].accumulated1250).toBeCloseTo(sum);
    expect(r.totalDepreciation).toBeCloseTo(sum);
  });
  it('never reports a negative illustrative tax', () => {
    const r = analyzeRental({ ...DEFAULT_RENTAL, annualRent: 60_000 });
    for (const y of r.years) expect(y.illustrativeTax).toBeGreaterThanOrEqual(0);
  });
});
