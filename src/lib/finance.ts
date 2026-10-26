/**
 * Finance library — shared by Family Bank Simulator, Debt & Credit Studio, Leverage Calculator,
 * Stress-Test Engine and Structure Lab loan details. All rates are annual decimals (0.06 = 6%).
 * Every function is pure and unit-tested against known results (see finance.test.ts).
 */

export type PaymentFrequency = 'monthly' | 'quarterly' | 'annual';
export type LoanStructure = 'amortizing' | 'interest-only' | 'balloon';

export const PERIODS_PER_YEAR: Record<PaymentFrequency, number> = { monthly: 12, quarterly: 4, annual: 1 };

export interface LoanInput {
  principal: number;
  annualRate: number;
  termMonths: number;
  structure: LoanStructure;
  frequency?: PaymentFrequency;
  /** For 'balloon': amortization horizon in months used to size the payment (e.g. 360 for a 30-yr schedule). Defaults to termMonths*2. */
  amortizationMonths?: number;
}

export interface ScheduleRow {
  period: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

export interface LoanSummary {
  periodicPayment: number;
  periodsPerYear: number;
  totalPeriods: number;
  annualDebtService: number;
  totalInterest: number;
  totalPaid: number;
  balloonBalance: number;
  schedule: ScheduleRow[];
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Standard annuity payment. Handles zero rate. */
export function pmt(principal: number, periodicRate: number, periods: number): number {
  if (periods <= 0) return 0;
  if (periodicRate === 0) return principal / periods;
  const f = Math.pow(1 + periodicRate, periods);
  return (principal * periodicRate * f) / (f - 1);
}

/** Remaining balance after k payments on an amortizing loan. */
export function balanceAfter(principal: number, periodicRate: number, periods: number, k: number): number {
  if (k >= periods) return 0;
  if (periodicRate === 0) return principal * (1 - k / periods);
  const pay = pmt(principal, periodicRate, periods);
  const f = Math.pow(1 + periodicRate, k);
  return principal * f - pay * ((f - 1) / periodicRate);
}

export function buildLoan(input: LoanInput): LoanSummary {
  const frequency = input.frequency ?? 'monthly';
  const ppy = PERIODS_PER_YEAR[frequency];
  const r = input.annualRate / ppy;
  const totalPeriods = Math.max(1, Math.round((input.termMonths / 12) * ppy));
  const schedule: ScheduleRow[] = [];
  let balance = input.principal;
  let totalInterest = 0;
  let totalPaid = 0;
  let periodicPayment = 0;

  if (input.structure === 'amortizing') {
    periodicPayment = pmt(input.principal, r, totalPeriods);
    for (let p = 1; p <= totalPeriods; p++) {
      const interest = balance * r;
      let principalPaid = periodicPayment - interest;
      if (p === totalPeriods) principalPaid = balance; // absorb rounding
      balance = Math.max(0, balance - principalPaid);
      totalInterest += interest;
      totalPaid += interest + principalPaid;
      schedule.push({ period: p, payment: round2(interest + principalPaid), interest: round2(interest), principal: round2(principalPaid), balance: round2(balance) });
    }
  } else if (input.structure === 'interest-only') {
    periodicPayment = input.principal * r;
    for (let p = 1; p <= totalPeriods; p++) {
      const interest = balance * r;
      const principalPaid = p === totalPeriods ? balance : 0;
      balance -= principalPaid;
      totalInterest += interest;
      totalPaid += interest + principalPaid;
      schedule.push({ period: p, payment: round2(interest + principalPaid), interest: round2(interest), principal: round2(principalPaid), balance: round2(balance) });
    }
  } else {
    // balloon: payment sized on a longer amortization, balance due at maturity
    const amortMonths = input.amortizationMonths ?? input.termMonths * 2;
    const amortPeriods = Math.round((amortMonths / 12) * ppy);
    periodicPayment = pmt(input.principal, r, amortPeriods);
    for (let p = 1; p <= totalPeriods; p++) {
      const interest = balance * r;
      let principalPaid = periodicPayment - interest;
      if (p === totalPeriods) principalPaid = balance; // balloon
      balance = Math.max(0, balance - principalPaid);
      totalInterest += interest;
      totalPaid += interest + principalPaid;
      schedule.push({ period: p, payment: round2(interest + principalPaid), interest: round2(interest), principal: round2(principalPaid), balance: round2(balance) });
    }
  }

  const last = schedule[schedule.length - 1];
  const balloonBalance = input.structure === 'amortizing' ? 0 : round2(last.principal);
  return {
    periodicPayment: round2(periodicPayment),
    periodsPerYear: ppy,
    totalPeriods,
    annualDebtService: round2(periodicPayment * ppy),
    totalInterest: round2(totalInterest),
    totalPaid: round2(totalPaid),
    balloonBalance,
    schedule,
  };
}

/** Aggregate a periodic schedule into annual rows (interest, principal, ending balance). */
export function annualize(schedule: ScheduleRow[], ppy: number) {
  const years: { year: number; interest: number; principal: number; payment: number; balance: number }[] = [];
  for (let i = 0; i < schedule.length; i += ppy) {
    const slice = schedule.slice(i, i + ppy);
    years.push({
      year: years.length + 1,
      interest: round2(slice.reduce((s, r) => s + r.interest, 0)),
      principal: round2(slice.reduce((s, r) => s + r.principal, 0)),
      payment: round2(slice.reduce((s, r) => s + r.payment, 0)),
      balance: slice[slice.length - 1].balance,
    });
  }
  return years;
}

// ── Ratios ────────────────────────────────────────────────────────────────
export const ltv = (loan: number, value: number) => (value > 0 ? loan / value : 0);
export const dti = (monthlyDebt: number, monthlyGrossIncome: number) => (monthlyGrossIncome > 0 ? monthlyDebt / monthlyGrossIncome : 0);
export const dscr = (noi: number, annualDebtService: number) => (annualDebtService > 0 ? noi / annualDebtService : Infinity);
export const debtToEquity = (debt: number, equity: number) => (equity > 0 ? debt / equity : Infinity);
export const interestCoverage = (ebit: number, interestExpense: number) => (interestExpense > 0 ? ebit / interestExpense : Infinity);
export const noi = (grossIncome: number, operatingExpenses: number) => grossIncome - operatingExpenses;
export const cashOnCash = (annualPreTaxCashFlow: number, equityInvested: number) => (equityInvested > 0 ? annualPreTaxCashFlow / equityInvested : 0);
export const debtYield = (noiValue: number, loanAmount: number) => (loanAmount > 0 ? noiValue / loanAmount : 0);
export const capRate = (noiValue: number, price: number) => (price > 0 ? noiValue / price : 0);

/** Compound growth: value after n years at rate g. */
export const grow = (value: number, rate: number, years: number) => value * Math.pow(1 + rate, years);

/** Simple vs compound interest helpers for Lesson 01 */
export const simpleInterest = (principal: number, rate: number, years: number) => principal * rate * years;
export const compoundInterest = (principal: number, rate: number, years: number, periodsPerYear = 1) =>
  principal * Math.pow(1 + rate / periodsPerYear, periodsPerYear * years) - principal;

/** Effective annual rate from nominal with compounding */
export const effectiveAnnualRate = (nominal: number, periodsPerYear: number) => Math.pow(1 + nominal / periodsPerYear, periodsPerYear) - 1;

// ── Leverage analysis ─────────────────────────────────────────────────────
export interface LeverageInput {
  price: number;
  equity: number;
  loan: number;
  annualRate: number;
  termMonths: number;
  structure: LoanStructure;
  appreciation: number;      // annual decimal
  operatingIncome: number;   // annual gross
  operatingExpenses: number; // annual
  inflation: number;         // annual decimal applied to income & expenses
  transactionCosts: number;  // one-off, paid from equity
  borrowingCosts: number;    // one-off lender fees, paid from equity
  holdYears: number;
}

export interface LeverageYear {
  year: number;
  assetValue: number;
  income: number;
  expenses: number;
  noi: number;
  debtService: number;
  interest: number;
  principalPaid: number;
  cashFlow: number;
  loanBalance: number;
  equity: number;
  dscr: number;
  ltv: number;
}

export interface LeverageResult {
  loan: LoanSummary;
  years: LeverageYear[];
  totalEquityIn: number;
  yearOneCashOnCash: number;
  yearOneDscr: number;
  initialLtv: number;
  debtToEquity: number;
  /** Illustrative annualized return on equity incl. cash flow and equity growth, net of entry costs. */
  leveragedIrrApprox: number;
  unleveredIrrApprox: number;
  equityAtExit: number;
  totalCashFlow: number;
}

/** Simple IRR via bisection on cash flow series (t0 negative). */
export function irr(cashflows: number[], lo = -0.99, hi = 5, iter = 200): number {
  const npv = (r: number) => cashflows.reduce((s, cf, t) => s + cf / Math.pow(1 + r, t), 0);
  let a = lo, b = hi;
  let fa = npv(a);
  for (let i = 0; i < iter; i++) {
    const m = (a + b) / 2;
    const fm = npv(m);
    if (Math.abs(fm) < 1e-7) return m;
    if ((fa < 0) === (fm < 0)) { a = m; fa = fm; } else { b = m; }
  }
  return (a + b) / 2;
}

export function analyzeLeverage(input: LeverageInput): LeverageResult {
  const loanSummary = buildLoan({ principal: input.loan, annualRate: input.annualRate, termMonths: input.termMonths, structure: input.structure, frequency: 'monthly' });
  const annual = annualize(loanSummary.schedule, 12);
  const totalEquityIn = input.equity + input.transactionCosts + input.borrowingCosts;
  const years: LeverageYear[] = [];
  const flows: number[] = [-totalEquityIn];
  const unleveredFlows: number[] = [-(input.price + input.transactionCosts)];
  let value = input.price;
  let totalCashFlow = 0;
  for (let y = 1; y <= input.holdYears; y++) {
    value = input.price * Math.pow(1 + input.appreciation, y);
    const infl = Math.pow(1 + input.inflation, y - 1);
    const income = input.operatingIncome * infl;
    const expenses = input.operatingExpenses * infl;
    const n = income - expenses;
    const a = annual[y - 1];
    const debtService = a ? a.payment : 0;
    const interest = a ? a.interest : 0;
    const principalPaid = a ? a.principal : 0;
    const loanBalance = a ? a.balance : 0;
    const cashFlow = n - debtService;
    totalCashFlow += cashFlow;
    years.push({
      year: y, assetValue: value, income, expenses, noi: n, debtService, interest, principalPaid, cashFlow, loanBalance,
      equity: value - loanBalance, dscr: debtService > 0 ? n / debtService : Infinity, ltv: value > 0 ? loanBalance / value : 0,
    });
    flows.push(cashFlow);
    unleveredFlows.push(n);
  }
  const last = years[years.length - 1];
  const exitEquity = last ? last.assetValue - last.loanBalance : input.equity;
  flows[flows.length - 1] += exitEquity;
  unleveredFlows[unleveredFlows.length - 1] += last ? last.assetValue : input.price;
  const y1 = years[0];
  return {
    loan: loanSummary,
    years,
    totalEquityIn,
    yearOneCashOnCash: y1 ? y1.cashFlow / totalEquityIn : 0,
    yearOneDscr: y1 ? y1.dscr : Infinity,
    initialLtv: ltv(input.loan, input.price),
    debtToEquity: debtToEquity(input.loan, input.equity),
    leveragedIrrApprox: years.length ? irr(flows) : 0,
    unleveredIrrApprox: years.length ? irr(unleveredFlows) : 0,
    equityAtExit: exitEquity,
    totalCashFlow,
  };
}

/** Capital stack waterfall: distribute available cash by seniority. */
export interface Tranche { id: string; name: string; amount: number; rate: number; rank: number; kind: 'senior' | 'subordinated' | 'mezzanine' | 'preferred' | 'common' }
export function distributeWaterfall(tranches: Tranche[], available: number) {
  const sorted = [...tranches].sort((a, b) => a.rank - b.rank);
  let remaining = available;
  return sorted.map(t => {
    const owed = t.kind === 'common' ? Infinity : t.amount * (1 + t.rate);
    const paid = Math.max(0, Math.min(remaining, owed === Infinity ? remaining : owed));
    remaining -= paid;
    const target = owed === Infinity ? t.amount : owed;
    return { ...t, paid, shortfall: Math.max(0, target - paid), recovery: target > 0 ? paid / target : 0 };
  });
}
