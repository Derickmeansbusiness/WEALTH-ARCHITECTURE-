import { describe, it, expect } from 'vitest';
import { pmt, buildLoan, balanceAfter, annualize, ltv, dscr, cashOnCash, compoundInterest, simpleInterest, effectiveAnnualRate, analyzeLeverage, irr, distributeWaterfall } from './finance';

describe('pmt', () => {
  it('matches the textbook 30-year mortgage payment', () => {
    // $200,000 at 6% for 360 months → $1,199.10
    expect(pmt(200000, 0.06 / 12, 360)).toBeCloseTo(1199.10, 1);
  });
  it('handles zero rate', () => {
    expect(pmt(12000, 0, 12)).toBe(1000);
  });
  it('matches a 5-year auto-loan style payment', () => {
    // $25,000 at 7.5% for 60 months → $500.95
    expect(pmt(25000, 0.075 / 12, 60)).toBeCloseTo(500.95, 1);
  });
});

describe('buildLoan amortizing', () => {
  const loan = buildLoan({ principal: 700000, annualRate: 0.065, termMonths: 360, structure: 'amortizing' });
  it('computes the payment', () => {
    expect(loan.periodicPayment).toBeCloseTo(4424.48, 0);
  });
  it('amortizes to zero', () => {
    expect(loan.schedule[loan.schedule.length - 1].balance).toBe(0);
    expect(loan.schedule.length).toBe(360);
  });
  it('total interest is consistent', () => {
    expect(loan.totalPaid).toBeCloseTo(700000 + loan.totalInterest, 0);
    expect(loan.totalInterest).toBeGreaterThan(890000);
    expect(loan.totalInterest).toBeLessThan(895000);
  });
  it('balanceAfter agrees with schedule', () => {
    const k = 120;
    expect(balanceAfter(700000, 0.065 / 12, 360, k)).toBeCloseTo(loan.schedule[k - 1].balance, 0);
  });
});

describe('buildLoan interest-only', () => {
  const loan = buildLoan({ principal: 1000000, annualRate: 0.08, termMonths: 60, structure: 'interest-only' });
  it('pays only interest until maturity', () => {
    expect(loan.periodicPayment).toBeCloseTo(6666.67, 1);
    expect(loan.schedule[0].principal).toBe(0);
    expect(loan.schedule[58].balance).toBe(1000000);
  });
  it('returns the full principal at maturity as balloon', () => {
    expect(loan.balloonBalance).toBe(1000000);
    expect(loan.totalInterest).toBeCloseTo(400000, 0);
  });
});

describe('buildLoan balloon', () => {
  const loan = buildLoan({ principal: 500000, annualRate: 0.07, termMonths: 84, structure: 'balloon', amortizationMonths: 300 });
  it('sizes payment on 25-year amortization', () => {
    expect(loan.periodicPayment).toBeCloseTo(pmt(500000, 0.07 / 12, 300), 1);
  });
  it('shows outstanding principal due at maturity', () => {
    expect(loan.balloonBalance).toBeCloseTo(balanceAfter(500000, 0.07 / 12, 300, 83) , -1);
    expect(loan.balloonBalance).toBeGreaterThan(400000);
    expect(loan.schedule[loan.schedule.length - 1].balance).toBe(0);
  });
});

describe('quarterly and annual frequencies', () => {
  it('quarterly periods', () => {
    const q = buildLoan({ principal: 100000, annualRate: 0.08, termMonths: 120, structure: 'amortizing', frequency: 'quarterly' });
    expect(q.totalPeriods).toBe(40);
    expect(q.periodicPayment).toBeCloseTo(pmt(100000, 0.02, 40), 1);
  });
  it('annual periods', () => {
    const a = buildLoan({ principal: 100000, annualRate: 0.05, termMonths: 60, structure: 'amortizing', frequency: 'annual' });
    expect(a.totalPeriods).toBe(5);
    expect(a.periodicPayment).toBeCloseTo(23097.48, 0);
  });
});

describe('annualize', () => {
  it('sums 12 months into a year', () => {
    const loan = buildLoan({ principal: 120000, annualRate: 0.06, termMonths: 24, structure: 'amortizing' });
    const years = annualize(loan.schedule, 12);
    expect(years.length).toBe(2);
    expect(years[0].payment).toBeCloseTo(loan.periodicPayment * 12, 0);
    expect(years[1].balance).toBe(0);
  });
});

describe('ratios', () => {
  it('ltv', () => expect(ltv(700000, 1000000)).toBeCloseTo(0.7));
  it('dscr', () => expect(dscr(125000, 100000)).toBeCloseTo(1.25));
  it('cash on cash', () => expect(cashOnCash(24000, 300000)).toBeCloseTo(0.08));
});

describe('interest basics', () => {
  it('simple vs compound', () => {
    expect(simpleInterest(10000, 0.05, 10)).toBe(5000);
    expect(compoundInterest(10000, 0.05, 10)).toBeCloseTo(6288.95, 1);
  });
  it('effective annual rate of 12% nominal monthly', () => {
    expect(effectiveAnnualRate(0.12, 12)).toBeCloseTo(0.126825, 5);
  });
});

describe('irr', () => {
  it('recovers a known rate', () => {
    // invest 100, receive 110 in one year → 10%
    expect(irr([-100, 110])).toBeCloseTo(0.1, 4);
  });
});

describe('analyzeLeverage', () => {
  const base = { price: 1000000, equity: 300000, loan: 700000, annualRate: 0.065, termMonths: 360, structure: 'amortizing' as const, appreciation: 0.03, operatingIncome: 90000, operatingExpenses: 30000, inflation: 0.02, transactionCosts: 20000, borrowingCosts: 7000, holdYears: 10 };
  const r = analyzeLeverage(base);
  it('initial ratios', () => {
    expect(r.initialLtv).toBeCloseTo(0.7);
    expect(r.debtToEquity).toBeCloseTo(7 / 3);
    expect(r.totalEquityIn).toBe(327000);
  });
  it('year one DSCR and cash flow', () => {
    expect(r.years[0].noi).toBe(60000);
    expect(r.years[0].debtService).toBeCloseTo(53093.71, 0);
    expect(r.yearOneDscr).toBeCloseTo(1.13, 2);
  });
  it('leverage amplifies return when appreciation exceeds cost of debt', () => {
    expect(r.leveragedIrrApprox).toBeGreaterThan(r.unleveredIrrApprox);
  });
  it('leverage amplifies losses when values fall', () => {
    const down = analyzeLeverage({ ...base, appreciation: -0.04 });
    expect(down.leveragedIrrApprox).toBeLessThan(down.unleveredIrrApprox);
  });
});

describe('distributeWaterfall', () => {
  const stack = [
    { id: 's', name: 'Senior', amount: 3000000, rate: 0.06, rank: 1, kind: 'senior' as const },
    { id: 'm', name: 'Mezz', amount: 1000000, rate: 0.12, rank: 2, kind: 'mezzanine' as const },
    { id: 'c', name: 'Common', amount: 1000000, rate: 0, rank: 3, kind: 'common' as const },
  ];
  it('pays seniors first and wipes equity in a shortfall', () => {
    const out = distributeWaterfall(stack, 3500000);
    expect(out[0].paid).toBeCloseTo(3180000);
    expect(out[1].paid).toBeCloseTo(320000);
    expect(out[2].paid).toBe(0);
    expect(out[2].shortfall).toBe(1000000);
  });
  it('gives residual to common when fully covered', () => {
    const out = distributeWaterfall(stack, 6000000);
    expect(out[2].paid).toBeCloseTo(6000000 - 3180000 - 1120000);
  });
});
