import { describe, it, expect } from 'vitest';
import { afrBand, buildWarnings, exportSummary, LARGE_UNSECURED_THRESHOLD } from './rules';
import { buildLoan, annualize } from '@/lib/finance';

describe('afrBand', () => {
  it('maps term to IRS bands', () => {
    expect(afrBand(12)).toBe('short');
    expect(afrBand(36)).toBe('short');
    expect(afrBand(37)).toBe('mid');
    expect(afrBand(108)).toBe('mid');
    expect(afrBand(109)).toBe('long');
    expect(afrBand(360)).toBe('long');
  });
});

describe('buildWarnings', () => {
  const base = { principal: 50_000, rate: 0.05, afr: 0.045, structure: 'amortizing' as const, collateralType: 'real-estate' as const, termMonths: 60, lender: 'Family Trust', borrower: 'Child' };

  it('always includes the documentation warning', () => {
    const w = buildWarnings(base);
    expect(w.map((x) => x.id)).toEqual(['always']);
  });
  it('flags below-AFR rates as a §7872 issue', () => {
    const w = buildWarnings({ ...base, rate: 0.02 });
    expect(w[0].id).toBe('below-afr');
    expect(w[0].tone).toBe('danger');
    expect(w[0].body).toContain('7872');
  });
  it('does not flag a rate exactly at the AFR', () => {
    expect(buildWarnings({ ...base, rate: 0.045 }).some((x) => x.id === 'below-afr')).toBe(false);
  });
  it('flags large unsecured loans', () => {
    expect(buildWarnings({ ...base, collateralType: 'none', principal: LARGE_UNSECURED_THRESHOLD }).some((x) => x.id === 'unsecured')).toBe(true);
    expect(buildWarnings({ ...base, collateralType: 'none', principal: LARGE_UNSECURED_THRESHOLD - 1 }).some((x) => x.id === 'unsecured')).toBe(false);
  });
  it('flags interest-only and balloon structures', () => {
    expect(buildWarnings({ ...base, structure: 'interest-only' }).some((x) => x.id === 'balloon')).toBe(true);
    expect(buildWarnings({ ...base, structure: 'balloon' }).some((x) => x.id === 'balloon')).toBe(true);
  });
});

describe('exportSummary', () => {
  it('renders a markdown document with the watermark, terms and annual rows', () => {
    const summary = buildLoan({ principal: 120_000, annualRate: 0.05, termMonths: 24, structure: 'amortizing', frequency: 'monthly' });
    const annual = annualize(summary.schedule, 12);
    const md = exportSummary({ lender: 'Family Trust', borrower: 'Child', principal: 120_000, rate: 0.05, afr: 0.045, termMonths: 24, frequency: 'monthly', structure: 'amortizing', collateralType: 'none', collateral: '', purpose: 'education', summary, annual, warnings: buildWarnings({ principal: 120_000, rate: 0.05, afr: 0.045, structure: 'amortizing', collateralType: 'none', termMonths: 24, lender: 'Family Trust', borrower: 'Child' }) });
    expect(md).toContain('NOT A LEGAL INSTRUMENT');
    expect(md).toContain('Lender: Family Trust');
    expect(md.split('\n').filter((l) => /^\| \d+ \|/.test(l)).length).toBe(2);
    expect(md).toContain('Large unsecured related-party loan');
  });
});
