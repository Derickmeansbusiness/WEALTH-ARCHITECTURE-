/**
 * Debt Studio — small pure models that are not in @/lib/finance.
 *  - expansionModel: a financed machine generating revenue, costs, debt service and cash flow over time (Lesson 06)
 *  - equitySensitivity: how a change in asset value moves equity when the loan balance is fixed (intro + Lesson 04)
 *  - consolidate: combine entity balance sheets, eliminating intercompany receivables/payables (Case D)
 * All functions are pure and unit-tested in math.test.ts.
 */
import { buildLoan, annualize, type LoanStructure } from '@/lib/finance';

export interface ExpansionInput {
  /** purchase price of the machine / expansion asset */
  cost: number;
  /** share of cost financed, 0..1 */
  financedShare: number;
  annualRate: number;
  termMonths: number;
  structure?: LoanStructure;
  /** incremental revenue in year 1 */
  annualRevenue: number;
  /** incremental operating cost in year 1 (labour, materials, power, maintenance) */
  annualOperatingCost: number;
  /** annual growth of revenue (and operating cost) */
  growth?: number;
  /** months of ramp-up during which revenue is scaled linearly from 0 → 100% */
  rampMonths?: number;
  /** straight-line useful life in years for depreciation (informational) */
  usefulLifeYears?: number;
  holdYears: number;
}

export interface ExpansionYear {
  year: number;
  revenue: number;
  operatingCost: number;
  /** revenue − operating cost (before debt service) */
  operatingCashFlow: number;
  interest: number;
  principal: number;
  debtService: number;
  /** operating cash flow − debt service */
  netCashFlow: number;
  cumulativeNetCashFlow: number;
  loanBalance: number;
  depreciation: number;
  /** operating cash flow ÷ debt service (∞ when no debt service) */
  dscr: number;
}

export interface ExpansionResult {
  loanAmount: number;
  equityIn: number;
  periodicPayment: number;
  years: ExpansionYear[];
  /** first year in which cumulative net cash flow + equity recovered ≥ 0 (i.e. equity paid back), or null */
  paybackYear: number | null;
  totalNetCashFlow: number;
  totalInterest: number;
  minDscr: number;
}

export function expansionModel(input: ExpansionInput): ExpansionResult {
  const financedShare = Math.min(1, Math.max(0, input.financedShare));
  const loanAmount = input.cost * financedShare;
  const equityIn = input.cost - loanAmount;
  const growth = input.growth ?? 0;
  const ramp = Math.max(0, input.rampMonths ?? 0);
  const life = input.usefulLifeYears ?? Math.max(1, Math.round(input.termMonths / 12));
  const depreciation = input.cost / life;

  const loan = loanAmount > 0
    ? buildLoan({ principal: loanAmount, annualRate: input.annualRate, termMonths: input.termMonths, structure: input.structure ?? 'amortizing', frequency: 'monthly' })
    : null;
  const annual = loan ? annualize(loan.schedule, 12) : [];

  const years: ExpansionYear[] = [];
  let cumulative = -equityIn;
  let paybackYear: number | null = null;
  let totalInterest = 0;
  let minDscr = Infinity;
  for (let y = 1; y <= input.holdYears; y++) {
    const g = Math.pow(1 + growth, y - 1);
    // ramp factor: fraction of the year at full capacity (linear ramp over `ramp` months)
    const monthsStart = (y - 1) * 12;
    let rampFactor = 1;
    if (ramp > 0) {
      let sum = 0;
      for (let m = 0; m < 12; m++) {
        const mm = monthsStart + m + 0.5;
        sum += Math.min(1, mm / ramp);
      }
      rampFactor = sum / 12;
    }
    const revenue = input.annualRevenue * g * rampFactor;
    const operatingCost = input.annualOperatingCost * g * rampFactor;
    const ocf = revenue - operatingCost;
    const a = annual[y - 1];
    const interest = a ? a.interest : 0;
    const principal = a ? a.principal : 0;
    const debtService = a ? a.payment : 0;
    const net = ocf - debtService;
    cumulative += net;
    if (paybackYear === null && cumulative >= 0) paybackYear = y;
    totalInterest += interest;
    const d = debtService > 0 ? ocf / debtService : Infinity;
    if (d < minDscr) minDscr = d;
    years.push({
      year: y, revenue, operatingCost, operatingCashFlow: ocf, interest, principal, debtService, netCashFlow: net,
      cumulativeNetCashFlow: cumulative, loanBalance: a ? a.balance : 0, depreciation: y <= life ? depreciation : 0, dscr: d,
    });
  }
  return {
    loanAmount, equityIn, periodicPayment: loan ? loan.periodicPayment : 0, years, paybackYear,
    totalNetCashFlow: years.reduce((s, r) => s + r.netCashFlow, 0), totalInterest, minDscr,
  };
}

/** Equity after an asset value change, with the loan balance unchanged. Returns absolute and relative moves. */
export function equitySensitivity(price: number, loan: number, change: number) {
  const equity0 = price - loan;
  const value1 = price * (1 + change);
  const equity1 = value1 - loan;
  return {
    value1,
    equity0,
    equity1,
    equityChange: equity1 - equity0,
    equityChangePct: equity0 !== 0 ? (equity1 - equity0) / equity0 : 0,
    /** multiplier of asset return into equity return = price / equity */
    multiplier: equity0 !== 0 ? price / equity0 : Infinity,
  };
}

export interface SheetLine { label: string; value: number; intercompany?: boolean }
export interface EntitySheet { name: string; assets: SheetLine[]; liabilities: SheetLine[] }

/** Sum entity balance sheets; lines flagged intercompany are eliminated from both sides. */
export function consolidate(entities: EntitySheet[]) {
  const assets = new Map<string, number>();
  const liabilities = new Map<string, number>();
  let eliminatedAssets = 0;
  let eliminatedLiabilities = 0;
  for (const e of entities) {
    for (const a of e.assets) {
      if (a.intercompany) { eliminatedAssets += a.value; continue; }
      assets.set(a.label, (assets.get(a.label) ?? 0) + a.value);
    }
    for (const l of e.liabilities) {
      if (l.intercompany) { eliminatedLiabilities += l.value; continue; }
      liabilities.set(l.label, (liabilities.get(l.label) ?? 0) + l.value);
    }
  }
  const totalAssets = [...assets.values()].reduce((s, v) => s + v, 0);
  const totalLiabilities = [...liabilities.values()].reduce((s, v) => s + v, 0);
  return {
    assets: [...assets.entries()].map(([label, value]) => ({ label, value })),
    liabilities: [...liabilities.entries()].map(([label, value]) => ({ label, value })),
    totalAssets,
    totalLiabilities,
    equity: totalAssets - totalLiabilities,
    eliminatedAssets,
    eliminatedLiabilities,
    /** true when intercompany receivables and payables offset exactly */
    balanced: Math.abs(eliminatedAssets - eliminatedLiabilities) < 0.005,
  };
}

export const sheetTotals = (lines: SheetLine[]) => lines.reduce((s, l) => s + l.value, 0);
