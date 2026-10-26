/**
 * Leverage Calculator math — thin layer over @/lib/finance. The library's analyzeLeverage sizes a
 * balloon payment on termMonths×2; this wrapper adds an explicit amortization horizon and derives the
 * secondary metrics (loan constant, negative leverage, average cash-on-cash, warnings).
 */
import { analyzeLeverage, annualize, buildLoan, capRate as capRateFn, debtToEquity, irr, ltv, type LeverageInput, type LeverageResult, type LoanStructure } from '@/lib/finance';
import type { LoanTerms } from '@/types/structure';

export interface LeverageInputs {
  price: number;
  equity: number;
  loan: number;
  rate: number;             // decimal
  termYears: number;
  structure: LoanStructure;
  amortYears: number;       // balloon only: amortization horizon used to size payment
  appreciation: number;     // decimal, may be negative
  income: number;           // annual gross operating income
  expenses: number;         // annual operating expenses
  inflation: number;        // decimal
  transactionCosts: number;
  borrowingCosts: number;
  holdYears: number;
}

export const DEFAULT_LEVERAGE: LeverageInputs = {
  price: 1_000_000, equity: 300_000, loan: 700_000, rate: 0.065, termYears: 30, structure: 'amortizing', amortYears: 30,
  appreciation: 0.03, income: 90_000, expenses: 30_000, inflation: 0.02, transactionCosts: 20_000, borrowingCosts: 7_000, holdYears: 10,
};

export function validateLeverage(i: LeverageInputs): string[] {
  const errs: string[] = [];
  if (!(i.price > 0)) errs.push('Purchase price must be greater than zero.');
  if (i.equity < 0) errs.push('Equity cannot be negative.');
  if (i.loan < 0) errs.push('Loan amount cannot be negative.');
  if (i.loan > i.price * 1.5) errs.push('Loan exceeds 150% of price — check inputs.');
  if (i.rate < 0 || i.rate > 0.6) errs.push('Interest rate must be between 0% and 60%.');
  if (!(i.termYears >= 1 && i.termYears <= 50)) errs.push('Loan tenure must be 1–50 years.');
  if (i.structure === 'balloon' && i.amortYears < i.termYears) errs.push('Amortization horizon must be at least the loan tenure for a balloon loan.');
  if (!(i.holdYears >= 1 && i.holdYears <= 40)) errs.push('Hold period must be 1–40 years.');
  if (i.income < 0 || i.expenses < 0) errs.push('Income and expenses cannot be negative.');
  return errs;
}

/** analyzeLeverage with an explicit balloon amortization horizon. Equals the library result when the horizon is the default. */
export function analyzeLeverageEx(input: LeverageInput & { amortizationMonths?: number }): LeverageResult {
  const useDefault = input.structure !== 'balloon' || !input.amortizationMonths || input.amortizationMonths === input.termMonths * 2;
  if (useDefault) return analyzeLeverage(input);
  const loanSummary = buildLoan({ principal: input.loan, annualRate: input.annualRate, termMonths: input.termMonths, structure: 'balloon', frequency: 'monthly', amortizationMonths: input.amortizationMonths });
  const annual = annualize(loanSummary.schedule, 12);
  const totalEquityIn = input.equity + input.transactionCosts + input.borrowingCosts;
  const years: LeverageResult['years'] = [];
  const flows: number[] = [-totalEquityIn];
  const unleveredFlows: number[] = [-(input.price + input.transactionCosts)];
  let totalCashFlow = 0;
  for (let y = 1; y <= input.holdYears; y++) {
    const value = input.price * Math.pow(1 + input.appreciation, y);
    const infl = Math.pow(1 + input.inflation, y - 1);
    const income = input.operatingIncome * infl;
    const expenses = input.operatingExpenses * infl;
    const n = income - expenses;
    const a = annual[y - 1];
    const debtService = a ? a.payment : 0;
    const cashFlow = n - debtService;
    totalCashFlow += cashFlow;
    years.push({ year: y, assetValue: value, income, expenses, noi: n, debtService, interest: a ? a.interest : 0, principalPaid: a ? a.principal : 0, cashFlow, loanBalance: a ? a.balance : 0, equity: value - (a ? a.balance : 0), dscr: debtService > 0 ? n / debtService : Infinity, ltv: value > 0 ? (a ? a.balance : 0) / value : 0 });
    flows.push(cashFlow);
    unleveredFlows.push(n);
  }
  const last = years[years.length - 1];
  const exitEquity = last ? last.assetValue - last.loanBalance : input.equity;
  flows[flows.length - 1] += exitEquity;
  unleveredFlows[unleveredFlows.length - 1] += last ? last.assetValue : input.price;
  const y1 = years[0];
  return {
    loan: loanSummary, years, totalEquityIn,
    yearOneCashOnCash: y1 ? y1.cashFlow / totalEquityIn : 0,
    yearOneDscr: y1 ? y1.dscr : Infinity,
    initialLtv: ltv(input.loan, input.price),
    debtToEquity: debtToEquity(input.loan, input.equity),
    leveragedIrrApprox: years.length ? irr(flows) : 0,
    unleveredIrrApprox: years.length ? irr(unleveredFlows) : 0,
    equityAtExit: exitEquity, totalCashFlow,
  };
}

export interface LeverageMetrics {
  result: LeverageResult;
  monthlyPayment: number;
  annualDebtService: number;
  interestOverHold: number;
  interestFullTerm: number;
  balanceAtHold: number;
  balloon: number;             // outstanding principal due at maturity (0 for amortizing)
  balloonYear: number;
  initialLtv: number;
  exitLtv: number;
  debtToEquity: number;
  cocY1: number;
  cocAvg: number;
  dscrY1: number;
  dscrMin: number;
  loanConstant: number;        // annual debt service / loan
  capRate: number;             // year-1 NOI / price
  negativeLeverage: boolean;
  leveragedIrr: number;
  unleveredIrr: number;
  equityAtExit: number;
  totalCashFlow: number;
  equityMultiple: number;
}

export function toLeverageInput(i: LeverageInputs): LeverageInput & { amortizationMonths?: number } {
  return {
    price: i.price, equity: i.equity, loan: i.loan, annualRate: i.rate, termMonths: Math.round(i.termYears * 12), structure: i.structure,
    appreciation: i.appreciation, operatingIncome: i.income, operatingExpenses: i.expenses, inflation: i.inflation,
    transactionCosts: i.transactionCosts, borrowingCosts: i.borrowingCosts, holdYears: Math.round(i.holdYears),
    amortizationMonths: i.structure === 'balloon' ? Math.round(i.amortYears * 12) : undefined,
  };
}

export function computeLeverage(i: LeverageInputs): LeverageMetrics {
  const result = analyzeLeverageEx(toLeverageInput(i));
  const hold = result.years;
  const last = hold[hold.length - 1];
  const interestOverHold = hold.reduce((s, y) => s + y.interest, 0);
  const cocs = hold.map((y) => (result.totalEquityIn > 0 ? y.cashFlow / result.totalEquityIn : 0));
  const dscrs = hold.map((y) => y.dscr).filter((d) => Number.isFinite(d));
  const loanConstant = i.loan > 0 ? result.loan.annualDebtService / i.loan : 0;
  const cap = capRateFn(i.income - i.expenses, i.price);
  const totalDistributions = result.totalCashFlow + result.equityAtExit;
  return {
    result,
    monthlyPayment: result.loan.periodicPayment,
    annualDebtService: result.loan.annualDebtService,
    interestOverHold,
    interestFullTerm: result.loan.totalInterest,
    balanceAtHold: last ? last.loanBalance : i.loan,
    balloon: result.loan.balloonBalance,
    balloonYear: i.termYears,
    initialLtv: result.initialLtv,
    exitLtv: last ? last.ltv : result.initialLtv,
    debtToEquity: result.debtToEquity,
    cocY1: result.yearOneCashOnCash,
    cocAvg: cocs.length ? cocs.reduce((a, b) => a + b, 0) / cocs.length : 0,
    dscrY1: result.yearOneDscr,
    dscrMin: dscrs.length ? Math.min(...dscrs) : Infinity,
    loanConstant,
    capRate: cap,
    negativeLeverage: i.loan > 0 && cap < loanConstant,
    leveragedIrr: result.leveragedIrrApprox,
    unleveredIrr: result.unleveredIrrApprox,
    equityAtExit: result.equityAtExit,
    totalCashFlow: result.totalCashFlow,
    equityMultiple: result.totalEquityIn > 0 ? totalDistributions / result.totalEquityIn : 0,
  };
}

export interface Warning { level: 'red' | 'amber' | 'green'; title: string; body: string }

export function leverageWarnings(i: LeverageInputs, m: LeverageMetrics): Warning[] {
  const w: Warning[] = [];
  if (i.loan > 0 && m.dscrY1 < 1) w.push({ level: 'red', title: `Year-1 DSCR ${m.dscrY1.toFixed(2)}× — cash flow does not cover debt service`, body: 'Net operating income is lower than the contractual payments. The shortfall has to come from reserves or other income every month. Most lenders underwrite to a minimum of roughly 1.20–1.25×; below 1.0× the loan is funded by the owner, not the asset.' });
  else if (i.loan > 0 && m.dscrMin < 1) w.push({ level: 'amber', title: `DSCR drops below 1.0× in year ${m.result.years.findIndex((y) => y.dscr < 1) + 1}`, body: 'Debt service stays fixed while net operating income moves. Check which year turns negative and what reserves would be required.' });
  else if (i.loan > 0 && m.dscrY1 < 1.2) w.push({ level: 'amber', title: `Year-1 DSCR ${m.dscrY1.toFixed(2)}× — thin coverage`, body: 'Coverage exists but there is little margin for vacancy, repairs or rate changes. A modest income decline would push the asset into negative cash flow.' });
  if (m.initialLtv > 0.8) w.push({ level: 'red', title: `LTV ${(m.initialLtv * 100).toFixed(0)}% exceeds 80%`, body: 'High loan-to-value leaves a thin equity cushion: a value decline of ' + ((1 - m.initialLtv) * 100).toFixed(0) + '% would wipe out the equity entirely. Lenders typically price this with higher rates, mortgage insurance, recourse or additional collateral.' });
  else if (m.initialLtv > 0.75) w.push({ level: 'amber', title: `LTV ${(m.initialLtv * 100).toFixed(0)}% — near common covenant ceilings`, body: 'Many commercial facilities cap LTV at 70–75%. A small value decline could breach a covenant even if payments are current.' });
  if (m.negativeLeverage) w.push({ level: 'amber', title: `Negative leverage: cap rate ${(m.capRate * 100).toFixed(2)}% < loan constant ${(m.loanConstant * 100).toFixed(2)}%`, body: 'The asset yields less (NOI ÷ price) than the debt costs per dollar borrowed (annual debt service ÷ loan). Each borrowed dollar reduces current cash yield on equity; the leveraged return then depends entirely on appreciation. That is a speculation on price, not a financing of cash flow.' });
  if (i.structure !== 'amortizing' && m.balloon > 0) w.push({ level: i.holdYears >= i.termYears ? 'red' : 'amber', title: `Balloon of ${Math.round(m.balloon).toLocaleString('en-US')} due in year ${m.balloonYear}`, body: i.holdYears >= i.termYears ? 'The maturity falls inside your hold period. Without a refinancing plan — or a sale — the full outstanding principal must be paid from liquidity. Refinancing depends on the lender\'s appetite, the asset\'s value and your credit profile at that future date, none of which you control today.' : 'Maturity falls after your planned exit, but a delayed sale would run straight into the balloon. Model the refinancing: what LTV and DSCR would a lender require at that point?' });
  if (i.appreciation < 0) w.push({ level: 'amber', title: 'Negative appreciation assumed', body: 'Leverage magnifies losses symmetrically. With falling values the leveraged return falls below the unlevered return and the exit LTV rises.' });
  if (w.length === 0) w.push({ level: 'green', title: 'No red flags in the base case', body: 'Coverage, LTV and leverage direction are within ranges most lenders would consider financeable. Stress-test it before relying on it — the Stress-Test Engine applies value, income and rate shocks to this scenario.' });
  return w;
}

/** LoanTerms-shaped object so saved scenarios can render on the Financing Map / Structure Lab edges. */
export function toLoanTerms(i: LeverageInputs, opts: { relatedParty?: boolean; collateral?: string; purpose?: string } = {}): LoanTerms {
  return {
    principal: i.loan,
    rate: i.rate,
    termMonths: Math.round(i.termYears * 12),
    structure: i.structure,
    balloonMonths: i.structure === 'amortizing' ? undefined : Math.round(i.termYears * 12),
    paymentFrequency: 'monthly',
    collateral: opts.collateral ?? 'Financed asset (first-ranking security)',
    purpose: opts.purpose ?? 'Acquisition financing',
    relatedParty: opts.relatedParty ?? false,
    originatedYear: new Date().getFullYear(),
  };
}

/** Read LoanTerms-like data defensively from any saved scenario payload. */
export function readLoanTerms(data: unknown): LoanTerms | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  const cand = (d.loanTerms ?? d.loan ?? d.terms ?? d) as Record<string, unknown>;
  if (!cand || typeof cand !== 'object') return null;
  const principal = Number(cand.principal);
  const rate = Number(cand.rate ?? cand.annualRate);
  const termMonths = Number(cand.termMonths ?? (cand.termYears ? Number(cand.termYears) * 12 : NaN));
  if (!(principal > 0) || !Number.isFinite(rate) || !(termMonths > 0)) return null;
  const structure = (['amortizing', 'interest-only', 'balloon'] as const).find((s) => s === cand.structure) ?? 'amortizing';
  return {
    principal, rate, termMonths, structure,
    balloonMonths: typeof cand.balloonMonths === 'number' ? cand.balloonMonths : undefined,
    paymentFrequency: (['monthly', 'quarterly', 'annual'] as const).find((f) => f === cand.paymentFrequency) ?? 'monthly',
    collateral: typeof cand.collateral === 'string' ? cand.collateral : undefined,
    purpose: typeof cand.purpose === 'string' ? cand.purpose : undefined,
    guarantorId: typeof cand.guarantorId === 'string' ? cand.guarantorId : undefined,
    relatedParty: Boolean(cand.relatedParty),
    originatedYear: typeof cand.originatedYear === 'number' ? cand.originatedYear : undefined,
    jurisdiction: typeof cand.jurisdiction === 'string' ? cand.jurisdiction : undefined,
  };
}
