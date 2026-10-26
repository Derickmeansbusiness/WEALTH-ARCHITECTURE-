/**
 * Financing Decision Simulator — the same investment under three financing structures, side by side.
 * Built on analyzeLeverage; the verdict is deliberately neutral (brief rule 7: never auto-recommend
 * the most leveraged scenario).
 */
import { type LoanStructure } from '@/lib/finance';
import { analyzeLeverageEx } from './leverage';

export interface DecisionInputs {
  price: number;
  income: number;
  expenses: number;
  appreciation: number;
  rate: number;
  termYears: number;
  structure: LoanStructure;
  holdYears: number;
  transactionCosts: number;
  borrowingCostPct: number;  // lender fees as % of loan
  inflation: number;
  ltvB: number;              // moderate
  ltvC: number;              // aggressive
  shockPct: number;          // value shock, e.g. 0.20
  stressIncomeDrop: number;  // e.g. 0.15
  stressBps: number;         // e.g. 200
}

export const DEFAULT_DECISION: DecisionInputs = {
  price: 1_000_000, income: 90_000, expenses: 30_000, appreciation: 0.03, rate: 0.065, termYears: 30, structure: 'amortizing', holdYears: 10,
  transactionCosts: 20_000, borrowingCostPct: 0.01, inflation: 0.02, ltvB: 0.55, ltvC: 0.80, shockPct: 0.20, stressIncomeDrop: 0.15, stressBps: 200,
};

export interface ScenarioMetrics {
  id: 'A' | 'B' | 'C';
  label: string;
  ltv: number;
  loan: number;
  equity: number;
  capitalRequired: number;      // equity + transaction + borrowing costs
  cashFlowY1: number;
  cashFlowTotal: number;
  totalInterest: number;        // over the hold
  irr: number;
  coc: number;
  equityAtExit: number;
  equityAfterShock: number;     // equity at exit if value is shockPct lower at exit
  lossFromShock: number;        // capitalRequired − equityAfterShock (positive = loss of capital)
  balanceAtExit: number;
  balloon: number;
  ltvAtExit: number;
  dscrY1: number;
  stressedDscr: number;         // −income drop and +bps on the whole loan
  reservesFor12moVacancy: number; // 12 months of (expenses + debt service)
  monthsOfCashFlowToRebuild: number; // reserves ÷ monthly cash flow (Infinity if ≤0)
  equityMultiple: number;
}

export function validateDecision(i: DecisionInputs): string[] {
  const e: string[] = [];
  if (!(i.price > 0)) e.push('Price must be greater than zero.');
  if (i.income < 0 || i.expenses < 0) e.push('Income and expenses cannot be negative.');
  if (i.rate < 0 || i.rate > 0.6) e.push('Rate must be between 0% and 60%.');
  if (!(i.termYears >= 1 && i.termYears <= 50)) e.push('Term must be 1–50 years.');
  if (!(i.holdYears >= 1 && i.holdYears <= 40)) e.push('Hold must be 1–40 years.');
  if (i.ltvB < 0 || i.ltvB >= 1 || i.ltvC < 0 || i.ltvC >= 1) e.push('LTVs must be between 0% and 99%.');
  if (i.ltvB > i.ltvC) e.push('Scenario C should be at least as leveraged as scenario B.');
  return e;
}

export function scenarioAt(i: DecisionInputs, id: ScenarioMetrics['id'], label: string, ltv: number): ScenarioMetrics {
  const loan = Math.round(i.price * ltv);
  const equity = i.price - loan;
  const borrowingCosts = loan * i.borrowingCostPct;
  const base = analyzeLeverageEx({ price: i.price, equity, loan, annualRate: i.rate, termMonths: Math.round(i.termYears * 12), structure: i.structure, appreciation: i.appreciation, operatingIncome: i.income, operatingExpenses: i.expenses, inflation: i.inflation, transactionCosts: i.transactionCosts, borrowingCosts, holdYears: Math.round(i.holdYears) });
  const last = base.years[base.years.length - 1];
  const shocked = analyzeLeverageEx({ price: i.price, equity, loan, annualRate: i.rate, termMonths: Math.round(i.termYears * 12), structure: i.structure, appreciation: Math.pow((1 + i.appreciation) ** i.holdYears * (1 - i.shockPct), 1 / Math.max(1, i.holdYears)) - 1, operatingIncome: i.income, operatingExpenses: i.expenses, inflation: i.inflation, transactionCosts: i.transactionCosts, borrowingCosts, holdYears: Math.round(i.holdYears) });
  const stressed = analyzeLeverageEx({ price: i.price, equity, loan, annualRate: i.rate + i.stressBps / 10_000, termMonths: Math.round(i.termYears * 12), structure: i.structure, appreciation: i.appreciation, operatingIncome: i.income * (1 - i.stressIncomeDrop), operatingExpenses: i.expenses, inflation: i.inflation, transactionCosts: i.transactionCosts, borrowingCosts, holdYears: 1 });
  const y1 = base.years[0];
  const monthlyCarry = (i.expenses + (y1 ? y1.debtService : 0)) / 12;
  const totalInterest = base.years.reduce((s, y) => s + y.interest, 0);
  const equityAfterShock = shocked.equityAtExit;
  return {
    id, label, ltv, loan, equity,
    capitalRequired: base.totalEquityIn,
    cashFlowY1: y1 ? y1.cashFlow : 0,
    cashFlowTotal: base.totalCashFlow,
    totalInterest,
    irr: base.leveragedIrrApprox,
    coc: base.yearOneCashOnCash,
    equityAtExit: base.equityAtExit,
    equityAfterShock,
    lossFromShock: base.totalEquityIn - equityAfterShock,
    balanceAtExit: last ? last.loanBalance : loan,
    balloon: base.loan.balloonBalance,
    ltvAtExit: last ? last.ltv : ltv,
    dscrY1: base.yearOneDscr,
    stressedDscr: stressed.yearOneDscr,
    reservesFor12moVacancy: monthlyCarry * 12,
    monthsOfCashFlowToRebuild: y1 && y1.cashFlow > 0 ? (monthlyCarry * 12) / (y1.cashFlow / 12) : Infinity,
    equityMultiple: base.totalEquityIn > 0 ? (base.totalCashFlow + base.equityAtExit) / base.totalEquityIn : 0,
  };
}

export function compareScenarios(i: DecisionInputs): ScenarioMetrics[] {
  return [
    scenarioAt(i, 'A', 'A · All equity', 0),
    scenarioAt(i, 'B', 'B · Moderate leverage', i.ltvB),
    scenarioAt(i, 'C', 'C · Aggressive leverage', i.ltvC),
  ];
}

/** Normalised 0..1 radar dimensions (higher = better) for return and risk. */
export function radarDims(s: ScenarioMetrics[], i: DecisionInputs) {
  const safe = (v: number) => (Number.isFinite(v) ? v : 0);
  const maxIrr = Math.max(0.0001, ...s.map((x) => safe(x.irr)));
  const maxCoc = Math.max(0.0001, ...s.map((x) => Math.max(0, safe(x.coc))));
  const maxCap = Math.max(1, ...s.map((x) => x.capitalRequired));
  const maxLoss = Math.max(1, ...s.map((x) => Math.max(0, x.lossFromShock)));
  const maxReserve = Math.max(1, ...s.map((x) => x.reservesFor12moVacancy));
  return {
    axes: ['Projected IRR', 'Cash-on-cash', 'Capital efficiency', 'Downside protection', 'Stress coverage', 'Refi. independence', 'Vacancy resilience'],
    series: s.map((x) => ({
      label: x.label,
      values: [
        Math.max(0, safe(x.irr)) / maxIrr,
        Math.max(0, safe(x.coc)) / maxCoc,
        1 - x.capitalRequired / maxCap + (x.capitalRequired === Math.min(...s.map((y) => y.capitalRequired)) ? 0 : 0),
        1 - Math.max(0, x.lossFromShock) / maxLoss,
        Math.min(1, Number.isFinite(x.stressedDscr) ? x.stressedDscr / 2 : 1),
        x.loan === 0 ? 1 : 1 - Math.min(1, x.ltvAtExit),
        1 - x.reservesFor12moVacancy / maxReserve,
      ],
    })),
    shockPct: i.shockPct,
  };
}

export interface Tradeoff { scenario: ScenarioMetrics['id']; text: string }

/** Neutral tradeoff statements derived from the numbers. Never recommends a scenario. */
export function tradeoffs(s: ScenarioMetrics[]): Tradeoff[] {
  const [a, b, c] = s;
  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
  const out: Tradeoff[] = [];
  out.push({ scenario: 'A', text: `All equity ties up the most capital (${Math.round(a.capitalRequired).toLocaleString('en-US')}) and projects the ${a.irr >= c.irr ? 'highest' : 'lowest'} return of the three (${pct(a.irr)}), but it has no debt service, no covenants and no maturity. A ${(s[0] && Math.round(((a.capitalRequired - a.equityAfterShock) / a.capitalRequired) * 100)) || 0}% value shock costs ${Math.round(a.lossFromShock).toLocaleString('en-US')} of capital — and nothing else.` });
  out.push({ scenario: 'B', text: `Moderate leverage at ${pct(b.ltv)} LTV frees ${Math.round(a.capitalRequired - b.capitalRequired).toLocaleString('en-US')} of capital for other uses, projects ${pct(b.irr)}, and keeps year-1 coverage at ${Number.isFinite(b.dscrY1) ? b.dscrY1.toFixed(2) : '∞'}× (${Number.isFinite(b.stressedDscr) ? b.stressedDscr.toFixed(2) : '∞'}× under stress). It is a middle position: ${b.irr > a.irr ? 'higher projected return than all-equity, lower resilience' : 'lower projected return than all-equity (negative leverage), and lower resilience'}.` });
  out.push({ scenario: 'C', text: `Aggressive leverage at ${pct(c.ltv)} LTV requires the least capital (${Math.round(c.capitalRequired).toLocaleString('en-US')}) and projects ${pct(c.irr)}. The same value shock turns into a ${c.equityAfterShock < 0 ? 'negative equity position' : `loss of ${Math.round(c.lossFromShock).toLocaleString('en-US')}`}, stressed coverage falls to ${Number.isFinite(c.stressedDscr) ? c.stressedDscr.toFixed(2) : '∞'}×, and ${Math.round(c.balanceAtExit).toLocaleString('en-US')} must be refinanced or repaid at exit. ${c.irr > b.irr ? 'Higher projected return, lower resilience.' : 'Lower projected return and lower resilience — leverage is working against the asset here.'}` });
  return out;
}

export const PROFESSIONAL_QUESTIONS = [
  'What is the source of the equity, and what does it earn elsewhere? Leverage only "frees" capital if there is a productive use for it.',
  'How was the income assumption built — signed leases or contracts, or a market estimate? What vacancy and capital expenditure is excluded from expenses?',
  'Is the rate fixed for the full term, or does it reset? Who bears the interest-rate risk and is it hedged?',
  'Is the loan recourse or non-recourse? Are personal or cross-entity guarantees required, and what do they expose?',
  'What covenants apply (minimum DSCR, maximum LTV, reporting) and what happens on breach?',
  'What is the exit plan if refinancing is unavailable at maturity — sale, equity injection, extension?',
  'How much liquidity is held outside the asset, and how many months of carry does it cover with zero income?',
  'Which entity borrows, which entity owns, and how do the tax consequences of interest, depreciation and gain fall across them? (Tax questions arise in every scenario; none eliminates them.)',
  'Is the lender a related party? If so, is the loan documented, priced and serviced as a real loan would be?',
];
