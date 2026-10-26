/**
 * Debt Stress-Test Engine — pure math. Applies value, income, rate, expense, default, refinancing and
 * acceleration shocks to a base case and returns the stressed ratios, liquidity runway and traffic lights.
 * Everything here is "mathematically calculated"; legal consequences live in the component, per jurisdiction.
 */
import { buildLoan, dscr as dscrFn, ltv as ltvFn, type LoanStructure } from '@/lib/finance';
import type { Warning } from './leverage';

export interface StressBase {
  value: number;
  principal: number;
  rate: number;
  termYears: number;
  structure: LoanStructure;
  amortYears: number;
  yearsElapsed: number;
  rentalIncome: number;
  businessIncome: number;
  expenses: number;
  reserves: number;
  otherLiquidity: number;
  floatingShare: number;   // 0..1
  minDscr: number;         // covenant, e.g. 1.20
  maxLtv: number;          // covenant, e.g. 0.75
}

export interface StressShocks {
  valueDrop: number;          // 0..1
  rentalDrop: number;         // 0..1
  revenueDrop: number;        // 0..1
  rateBps: number;            // 0, 100, 200, 300
  opexIncrease: number;       // 0..1
  tenantDefaultShare: number; // 0..1 share of income lost
  tenantDefaultMonths: number;// months of loss within the year
  refinanceRefused: boolean;
  acceleration: boolean;
}

export const DEFAULT_STRESS_BASE: StressBase = {
  value: 1_000_000, principal: 700_000, rate: 0.065, termYears: 7, structure: 'balloon', amortYears: 25, yearsElapsed: 2,
  rentalIncome: 90_000, businessIncome: 0, expenses: 30_000, reserves: 60_000, otherLiquidity: 40_000, floatingShare: 0.5, minDscr: 1.2, maxLtv: 0.75,
};

export const NO_SHOCKS: StressShocks = { valueDrop: 0, rentalDrop: 0, revenueDrop: 0, rateBps: 0, opexIncrease: 0, tenantDefaultShare: 0, tenantDefaultMonths: 0, refinanceRefused: false, acceleration: false };

export type Light = 'green' | 'amber' | 'red';

export interface StressResult {
  value: number;
  loanBalance: number;
  equity: number;
  ltv: number;
  baseRate: number;
  stressedRate: number;
  baseDebtService: number;
  annualDebtService: number;
  monthlyDebtService: number;
  rentalIncome: number;
  businessIncome: number;
  defaultLoss: number;
  income: number;
  expenses: number;
  noi: number;
  dscr: number;
  annualCashFlow: number;
  monthlyCashFlow: number;
  liquidity: number;
  runwayMonths: number;
  balloonDue: number;
  maturityYear: number;
  yearsToMaturity: number;
  maxRefiLoan: number;
  refiGap: number;
  refiFeasible: boolean;
  liquidityVsPayoff: number;   // liquidity ÷ balloon
  accelerationShortfall: number;
  lights: { coversPayments: Light; withinLtv: Light; withinDscr: Light; runway12: Light; refiFeasible: Light };
  warnings: Warning[];
  narrative: string;
}

export function validateStressBase(b: StressBase): string[] {
  const e: string[] = [];
  if (!(b.value > 0)) e.push('Value must be greater than zero.');
  if (!(b.principal >= 0)) e.push('Loan principal cannot be negative.');
  if (b.rate < 0 || b.rate > 0.6) e.push('Rate must be between 0% and 60%.');
  if (!(b.termYears >= 1 && b.termYears <= 50)) e.push('Term must be 1–50 years.');
  if (b.yearsElapsed < 0 || b.yearsElapsed >= b.termYears) e.push('Years elapsed must be less than the term.');
  if (b.structure === 'balloon' && b.amortYears < b.termYears) e.push('Amortization horizon must be at least the term.');
  if (b.minDscr < 0.5 || b.minDscr > 3) e.push('Minimum DSCR covenant must be 0.5–3.0.');
  if (b.maxLtv <= 0 || b.maxLtv > 1) e.push('Maximum LTV covenant must be between 0% and 100%.');
  return e;
}

/** Current outstanding balance using the library schedule. */
export function balanceNow(b: StressBase): number {
  if (b.principal <= 0) return 0;
  const months = Math.round(b.yearsElapsed * 12);
  if (months <= 0) return b.principal;
  const loan = buildLoan({ principal: b.principal, annualRate: b.rate, termMonths: Math.round(b.termYears * 12), structure: b.structure, amortizationMonths: b.structure === 'balloon' ? Math.round(b.amortYears * 12) : undefined });
  const row = loan.schedule[Math.min(months, loan.schedule.length) - 1];
  return row ? row.balance : 0;
}

/** Balance due at maturity (balloon) from the base schedule. */
export function balloonAtMaturity(b: StressBase): number {
  if (b.principal <= 0 || b.structure === 'amortizing') return 0;
  const loan = buildLoan({ principal: b.principal, annualRate: b.rate, termMonths: Math.round(b.termYears * 12), structure: b.structure, amortizationMonths: b.structure === 'balloon' ? Math.round(b.amortYears * 12) : undefined });
  return loan.balloonBalance;
}

/** Annual debt service on the current balance at a given rate (floating-rate reset approximation). */
export function debtServiceAt(b: StressBase, balance: number, rate: number): number {
  if (balance <= 0) return 0;
  const remainingMonths = Math.max(1, Math.round((b.termYears - b.yearsElapsed) * 12));
  if (b.structure === 'interest-only') return balance * rate;
  if (b.structure === 'balloon') {
    const remainingAmort = Math.max(remainingMonths, Math.round((b.amortYears - b.yearsElapsed) * 12));
    return buildLoan({ principal: balance, annualRate: rate, termMonths: remainingMonths, structure: 'balloon', amortizationMonths: remainingAmort }).annualDebtService;
  }
  return buildLoan({ principal: balance, annualRate: rate, termMonths: remainingMonths, structure: 'amortizing' }).annualDebtService;
}

const light3 = (ok: boolean, warn: boolean): Light => (ok ? 'green' : warn ? 'amber' : 'red');

export function runStress(b: StressBase, s: StressShocks): StressResult {
  const value = b.value * (1 - s.valueDrop);
  const loanBalance = balanceNow(b);
  const equity = value - loanBalance;
  const ltv = ltvFn(loanBalance, value);
  const stressedRate = b.rate + (s.rateBps / 10_000) * b.floatingShare;
  const baseDebtService = debtServiceAt(b, loanBalance, b.rate);
  const annualDebtService = debtServiceAt(b, loanBalance, stressedRate);

  const rentalIncome = b.rentalIncome * (1 - s.rentalDrop);
  const businessIncome = b.businessIncome * (1 - s.revenueDrop);
  const gross = rentalIncome + businessIncome;
  const defaultLoss = gross * s.tenantDefaultShare * Math.min(12, Math.max(0, s.tenantDefaultMonths)) / 12;
  const income = gross - defaultLoss;
  const expenses = b.expenses * (1 + s.opexIncrease);
  const noi = income - expenses;
  const d = dscrFn(noi, annualDebtService);
  const annualCashFlow = noi - annualDebtService;
  const monthlyCashFlow = annualCashFlow / 12;
  const liquidity = b.reserves + b.otherLiquidity;
  const runwayMonths = monthlyCashFlow >= 0 ? Infinity : liquidity / -monthlyCashFlow;

  const balloonDue = balloonAtMaturity(b);
  const yearsToMaturity = b.termYears - b.yearsElapsed;
  const maxRefiLoan = value * b.maxLtv;
  const refiGap = Math.max(0, balloonDue - maxRefiLoan);
  const refiFeasible = balloonDue === 0 || balloonDue <= maxRefiLoan;
  const liquidityVsPayoff = balloonDue > 0 ? liquidity / balloonDue : Infinity;
  const accelerationShortfall = Math.max(0, loanBalance - liquidity);

  const lights = {
    coversPayments: light3(noi >= annualDebtService, noi >= annualDebtService * 0.9),
    withinLtv: light3(ltv <= b.maxLtv, ltv <= b.maxLtv + 0.05),
    withinDscr: light3(d >= b.minDscr, d >= 1),
    runway12: light3(runwayMonths >= 12, runwayMonths >= 6),
    refiFeasible: balloonDue === 0 ? 'green' as Light : light3(refiFeasible, balloonDue <= maxRefiLoan * 1.1),
  };

  const w: Warning[] = [];
  const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
  if (loanBalance > 0 && noi < annualDebtService) w.push({ level: 'red', title: `Operating shortfall of ${fmt(annualDebtService - noi)} per year`, body: `Stressed NOI ${fmt(noi)} does not cover stressed debt service ${fmt(annualDebtService)}. The gap of ${fmt(-monthlyCashFlow)} a month is funded from liquidity of ${fmt(liquidity)} — ${Number.isFinite(runwayMonths) ? `about ${runwayMonths.toFixed(1)} months of runway` : 'no runway issue'}.` });
  if (loanBalance > 0 && d < b.minDscr) w.push({ level: d < 1 ? 'red' : 'amber', title: `DSCR ${Number.isFinite(d) ? d.toFixed(2) : '∞'}× below covenant ${b.minDscr.toFixed(2)}×`, body: 'A DSCR covenant breach is usually an event of default even when every payment has been made on time. What follows is a legal question (see the jurisdiction panel), but the arithmetic is unambiguous.' });
  if (loanBalance > 0 && ltv > b.maxLtv) w.push({ level: ltv > 1 ? 'red' : 'amber', title: `LTV ${(ltv * 100).toFixed(0)}% above covenant ${(b.maxLtv * 100).toFixed(0)}%`, body: ltv > 1 ? 'Negative equity: the loan exceeds the stressed value. A forced sale would not repay the lender in full; any recourse or guarantee becomes live.' : `A value-based covenant breach. Lenders commonly request a cash paydown of ${fmt(loanBalance - maxRefiLoan)} to cure, or additional collateral.` });
  if (s.rateBps > 0 && b.floatingShare > 0) w.push({ level: annualDebtService - baseDebtService > noi * 0.1 ? 'amber' : 'green', title: `+${s.rateBps} bps on the floating ${(b.floatingShare * 100).toFixed(0)}% adds ${fmt(annualDebtService - baseDebtService)} a year`, body: `Effective rate moves from ${(b.rate * 100).toFixed(2)}% to ${(stressedRate * 100).toFixed(2)}%. Fixed-rate debt, caps or swaps are the usual tools to bound this; each has a cost.` });
  if (balloonDue > 0) {
    if (s.refinanceRefused) w.push({ level: liquidityVsPayoff >= 1 ? 'amber' : 'red', title: `Maturity wall: ${fmt(balloonDue)} due in ${yearsToMaturity.toFixed(1)} years with no refinancing`, body: `Liquidity of ${fmt(liquidity)} covers ${(Math.min(liquidityVsPayoff, 9.99) * 100).toFixed(0)}% of the payoff. Without a new lender the options are a sale (at the stressed value), an equity injection, or a negotiated extension.` });
    else if (!refiFeasible) w.push({ level: 'amber', title: `Refinancing gap of ${fmt(refiGap)} at ${(b.maxLtv * 100).toFixed(0)}% LTV on the stressed value`, body: `A new lender lending ${(b.maxLtv * 100).toFixed(0)}% of ${fmt(value)} would advance ${fmt(maxRefiLoan)} against a balloon of ${fmt(balloonDue)}. The difference has to come from equity.` });
  }
  if (s.acceleration && loanBalance > 0) w.push({ level: accelerationShortfall > 0 ? 'red' : 'amber', title: `Acceleration: ${fmt(loanBalance)} becomes immediately due`, body: accelerationShortfall > 0 ? `Liquidity covers ${fmt(liquidity)}; the shortfall of ${fmt(accelerationShortfall)} can only be met by selling the asset, refinancing under duress, or calling on guarantors.` : 'Liquidity would cover the full balance, at the cost of all reserves.' });
  if (w.length === 0) w.push({ level: 'green', title: 'Base and stressed cases hold', body: 'Coverage, covenants and liquidity survive the selected shocks. Try stacking shocks — real downturns rarely arrive one variable at a time.' });

  const reds = Object.values(lights).filter((l) => l === 'red').length;
  const ambers = Object.values(lights).filter((l) => l === 'amber').length;
  const narrative = loanBalance === 0
    ? 'With no debt outstanding there is no debt service to cover, no covenant to breach and no maturity to refinance. The only exposures left are the asset value and operating cash flow.'
    : reds === 0 && ambers === 0
      ? `Under these shocks the position holds: stressed DSCR ${d.toFixed(2)}×, LTV ${(ltv * 100).toFixed(0)}%, ${Number.isFinite(runwayMonths) ? `${runwayMonths.toFixed(0)} months` : 'unlimited'} of runway. The structure has margin, which is the whole point of underwriting conservatively.`
      : reds === 0
        ? `The position bends but does not break: ${ambers} indicator${ambers > 1 ? 's' : ''} in the amber zone. This is where lenders start asking questions and where reserves earn their keep.`
        : `${reds} indicator${reds > 1 ? 's' : ''} in the red. The numbers say the structure cannot carry these shocks without outside capital: ${monthlyCashFlow < 0 ? `cash burn of ${fmt(-monthlyCashFlow)} a month, ` : ''}${d < 1 ? `coverage of ${d.toFixed(2)}×, ` : ''}${ltv > b.maxLtv ? `LTV of ${(ltv * 100).toFixed(0)}%` : ''}. Whether the lender acts on this depends on the loan documents and the jurisdiction — see the legal panel.`;

  return {
    value, loanBalance, equity, ltv, baseRate: b.rate, stressedRate, baseDebtService, annualDebtService, monthlyDebtService: annualDebtService / 12,
    rentalIncome, businessIncome, defaultLoss, income, expenses, noi, dscr: d, annualCashFlow, monthlyCashFlow, liquidity, runwayMonths,
    balloonDue, maturityYear: b.termYears, yearsToMaturity, maxRefiLoan, refiGap, refiFeasible, liquidityVsPayoff, accelerationShortfall, lights, warnings: w, narrative,
  };
}
