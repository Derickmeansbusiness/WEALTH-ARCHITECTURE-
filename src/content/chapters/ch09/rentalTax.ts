/**
 * Rental property tax architecture — pure educational math.
 * Cash flow and taxable income are computed side by side so the gap (depreciation) and the
 * liability it builds (unrecaptured §1250 gain exposure) are both visible.
 */
import { buildLoan, annualize, type LoanSummary } from '@/lib/finance';

export type PropertyClass = 'residential' | 'nonresidential';

/** Recovery periods under MACRS for real property (IRC §168(c)). */
export const RECOVERY_YEARS: Record<PropertyClass, number> = { residential: 27.5, nonresidential: 39 };

export interface RentalInput {
  purchasePrice: number;
  /** Share of price attributable to land (not depreciable), 0–1 */
  landShare: number;
  /** Share of the building basis reclassified to short-lived property by a cost segregation study, 0–1 */
  costSegShare: number;
  /** Recovery period for the segregated component (5, 7 or 15 years typical) */
  costSegYears: number;
  /** Bonus depreciation percentage applied to the segregated component in year one, 0–1 */
  bonusRate: number;
  propertyClass: PropertyClass;
  annualRent: number;
  vacancyRate: number;
  /** Operating expenses excluding debt service and depreciation */
  annualExpenses: number;
  loanAmount: number;
  annualRate: number;
  termYears: number;
  rentGrowth: number;
  expenseGrowth: number;
  holdYears: number;
  /** Marginal ordinary rate used to illustrate tax on positive taxable income */
  ordinaryRate: number;
}

export interface RentalYear {
  year: number;
  grossRent: number;
  effectiveRent: number;
  expenses: number;
  noi: number;
  debtService: number;
  interest: number;
  principal: number;
  cashFlow: number;
  depreciation: number;
  taxableIncome: number;
  /** Illustrative tax on positive taxable income (losses are shown as suspended, not refunded) */
  illustrativeTax: number;
  /** Running total of depreciation claimed = unrecaptured §1250 exposure (before any cost-seg §1245 split) */
  accumulatedDepreciation: number;
  accumulated1245: number;
  accumulated1250: number;
  loanBalance: number;
}

export interface RentalResult {
  loan: LoanSummary;
  buildingBasis: number;
  landBasis: number;
  segregatedBasis: number;
  structuralBasis: number;
  annualStructuralDepreciation: number;
  years: RentalYear[];
  totalCashFlow: number;
  totalTaxableIncome: number;
  totalDepreciation: number;
}

export const DEFAULT_RENTAL: RentalInput = {
  purchasePrice: 1_200_000,
  landShare: 0.2,
  costSegShare: 0,
  costSegYears: 5,
  bonusRate: 0,
  propertyClass: 'residential',
  annualRent: 120_000,
  vacancyRate: 0.05,
  annualExpenses: 38_000,
  loanAmount: 840_000,
  annualRate: 0.065,
  termYears: 30,
  rentGrowth: 0.03,
  expenseGrowth: 0.03,
  holdYears: 10,
  ordinaryRate: 0.35,
};

/** Straight-line depreciation for a given year, mid-month convention ignored for teaching clarity (full years). */
export function structuralDepreciation(basis: number, recoveryYears: number, year: number): number {
  if (basis <= 0 || year < 1) return 0;
  const annual = basis / recoveryYears;
  const fullYears = Math.floor(recoveryYears);
  if (year <= fullYears) return annual;
  if (year === fullYears + 1) return basis - annual * fullYears; // the partial final year (e.g. 0.5 of 27.5)
  return 0;
}

/** Simplified depreciation of segregated short-lived property: bonus in year one, straight-line remainder. */
export function segregatedDepreciation(basis: number, recoveryYears: number, bonusRate: number, year: number): number {
  if (basis <= 0 || year < 1) return 0;
  const bonus = basis * Math.max(0, Math.min(1, bonusRate));
  const remainder = basis - bonus;
  const sl = recoveryYears > 0 ? remainder / recoveryYears : remainder;
  if (year === 1) return bonus + (recoveryYears > 0 ? sl : remainder);
  if (year <= recoveryYears) return sl;
  return 0;
}

export function analyzeRental(input: RentalInput): RentalResult {
  const landBasis = input.purchasePrice * Math.max(0, Math.min(1, input.landShare));
  const buildingBasis = input.purchasePrice - landBasis;
  const segregatedBasis = buildingBasis * Math.max(0, Math.min(1, input.costSegShare));
  const structuralBasis = buildingBasis - segregatedBasis;
  const recovery = RECOVERY_YEARS[input.propertyClass];
  const loan = buildLoan({ principal: input.loanAmount, annualRate: input.annualRate, termMonths: Math.max(1, input.termYears) * 12, structure: 'amortizing', frequency: 'monthly' });
  const annual = annualize(loan.schedule, 12);
  const years: RentalYear[] = [];
  let acc = 0, acc1245 = 0, acc1250 = 0, totalCashFlow = 0, totalTaxable = 0;
  for (let y = 1; y <= Math.max(1, Math.floor(input.holdYears)); y++) {
    const infl = Math.pow(1 + input.rentGrowth, y - 1);
    const einfl = Math.pow(1 + input.expenseGrowth, y - 1);
    const grossRent = input.annualRent * infl;
    const effectiveRent = grossRent * (1 - Math.max(0, Math.min(1, input.vacancyRate)));
    const expenses = input.annualExpenses * einfl;
    const noi = effectiveRent - expenses;
    const a = annual[y - 1];
    const debtService = a ? a.payment : 0;
    const interest = a ? a.interest : 0;
    const principal = a ? a.principal : 0;
    const loanBalance = a ? a.balance : 0;
    const cashFlow = noi - debtService;
    const d1250 = structuralDepreciation(structuralBasis, recovery, y);
    const d1245 = segregatedDepreciation(segregatedBasis, input.costSegYears, input.bonusRate, y);
    const depreciation = d1250 + d1245;
    const taxableIncome = noi - interest - depreciation;
    const illustrativeTax = Math.max(0, taxableIncome) * input.ordinaryRate;
    acc += depreciation; acc1245 += d1245; acc1250 += d1250;
    totalCashFlow += cashFlow; totalTaxable += taxableIncome;
    years.push({ year: y, grossRent, effectiveRent, expenses, noi, debtService, interest, principal, cashFlow, depreciation, taxableIncome, illustrativeTax, accumulatedDepreciation: acc, accumulated1245: acc1245, accumulated1250: acc1250, loanBalance });
  }
  return { loan, buildingBasis, landBasis, segregatedBasis, structuralBasis, annualStructuralDepreciation: structuralBasis / recovery, years, totalCashFlow, totalTaxableIncome: totalTaxable, totalDepreciation: acc };
}
