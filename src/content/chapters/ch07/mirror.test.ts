import { describe, it, expect } from 'vitest';
import { buildLoan } from '@/lib/finance';
import { mirroredPosition, foregoneInterestYearOne } from './mirror';

describe('mirroredPosition', () => {
  const principal = 500_000;
  const loan = buildLoan({ principal, annualRate: 0.05, termMonths: 120, structure: 'amortizing', frequency: 'annual' });

  it('lender and borrower sides are symmetric at every period', () => {
    for (let k = 0; k <= loan.schedule.length; k++) {
      const m = mirroredPosition(loan, principal, k);
      expect(m.lender.note).toBe(m.borrower.note);
      expect(m.lender.interest).toBe(m.borrower.interest);
      expect(m.lender.principalRepaid).toBe(m.borrower.principalRepaid);
    }
  });

  it('starts at full principal and ends at zero with total interest', () => {
    const start = mirroredPosition(loan, principal, 0);
    expect(start.lender.note).toBe(principal);
    expect(start.lender.interest).toBe(0);
    const end = mirroredPosition(loan, principal, loan.schedule.length);
    expect(end.borrower.note).toBe(0);
    expect(Math.abs(end.lender.interest - loan.totalInterest)).toBeLessThan(1);
    expect(Math.abs(end.lender.principalRepaid - principal)).toBeLessThan(1);
  });

  it('clamps the period into range', () => {
    expect(mirroredPosition(loan, principal, 999).period).toBe(loan.schedule.length);
    expect(mirroredPosition(loan, principal, -3).period).toBe(0);
  });
});

describe('foregoneInterestYearOne', () => {
  it('is zero when the stated rate meets the AFR', () => {
    expect(foregoneInterestYearOne(100_000, 0.045, 0.045)).toBe(0);
    expect(foregoneInterestYearOne(100_000, 0.06, 0.045)).toBe(0);
  });
  it('equals principal times the shortfall when below the AFR', () => {
    expect(foregoneInterestYearOne(100_000, 0.01, 0.045)).toBe(3500);
  });
});
