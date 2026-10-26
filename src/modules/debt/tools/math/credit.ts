/**
 * Credit Profile Simulator — an EDUCATIONAL creditworthiness indicator (0–100). It is not a FICO®,
 * VantageScore® or any bureau score and is not a guarantee of approval. Each factor is scored 0..1 and
 * weighted; weights are illustrative of what lenders say they look at, not a reverse-engineered model.
 */
import { buildLoan } from '@/lib/finance';

export type Band = 'Poor' | 'Fair' | 'Good' | 'Very good' | 'Exceptional';

export interface Factor { id: string; label: string; score: number; weight: number; why: string; detail: string }
export interface Indicator { score: number; band: Band; factors: Factor[] }

export interface PersonalInputs {
  onTimePct: number;        // 0..100
  recentLates: number;      // count in last 24 months
  utilizationPct: number;   // 0..100
  balances: number;         // outstanding revolving balances
  avgAgeYears: number;
  newApplications: number;  // last 12 months
  hasRevolving: boolean;
  hasInstallment: boolean;
  hasMortgage: boolean;
  delinquencies: number;    // 90+ day
  collections: number;
  bankruptcy: boolean;
}

export interface BusinessInputs {
  vendorOnTimePct: number;  // 0..100 (PAYDEX-style concept)
  daysBeyondTerms: number;  // average days paid beyond terms
  yearsInBusiness: number;
  revenue: number;
  dscr: number;
  existingDebt: number;
  personalGuarantee: boolean;
  entityAgeYears: number;
  publicRecords: number;    // liens / judgments
}

export const DEFAULT_PERSONAL: PersonalInputs = { onTimePct: 98, recentLates: 1, utilizationPct: 32, balances: 14_000, avgAgeYears: 6, newApplications: 2, hasRevolving: true, hasInstallment: true, hasMortgage: false, delinquencies: 0, collections: 0, bankruptcy: false };
export const DEFAULT_BUSINESS: BusinessInputs = { vendorOnTimePct: 92, daysBeyondTerms: 8, yearsInBusiness: 4, revenue: 1_800_000, dscr: 1.35, existingDebt: 450_000, personalGuarantee: true, entityAgeYears: 4, publicRecords: 0 };

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function bandFor(score: number): Band {
  if (score >= 85) return 'Exceptional';
  if (score >= 72) return 'Very good';
  if (score >= 58) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}

export const BAND_ORDER: Band[] = ['Poor', 'Fair', 'Good', 'Very good', 'Exceptional'];

/** Illustrative mapping of band → financing access. Spreads over a base rate are illustrative only. */
export const BAND_ACCESS: Record<Band, { spread: number; access: string; terms: string; tone: 'red' | 'amber' | 'gold' | 'green' }> = {
  Poor: { spread: 0.045, access: 'Mainstream lenders usually decline; access shifts to secured, guaranteed or specialist credit at high cost.', terms: 'Large deposits, co-signers or collateral; short tenures; fees and penalty pricing.', tone: 'red' },
  Fair: { spread: 0.022, access: 'Approval possible with conditions; smaller limits and manual underwriting.', terms: 'Higher rates, lower LTV, stricter covenants; often a path to re-pricing after 12–24 clean months.', tone: 'amber' },
  Good: { spread: 0.009, access: 'Broad access to standard products at near-standard pricing.', terms: 'Market rates with modest premium; standard LTV and documentation.', tone: 'gold' },
  'Very good': { spread: 0.003, access: 'Preferred pricing and larger limits; competing offers.', terms: 'Rate discounts, lower fees, relationship-based flexibility.', tone: 'green' },
  Exceptional: { spread: 0, access: 'Best-available pricing; lenders compete for the relationship.', terms: 'Lowest rates, highest LTVs the lender offers, covenant-light where the asset supports it.', tone: 'green' },
};

export function personalIndicator(i: PersonalInputs): Indicator {
  const payment = clamp01((i.onTimePct - 80) / 20) * clamp01(1 - i.recentLates * 0.18) * (i.delinquencies > 0 ? 0.55 : 1) * (i.collections > 0 ? 0.6 : 1) * (i.bankruptcy ? 0.3 : 1);
  const util = i.utilizationPct <= 9 ? 1 : i.utilizationPct <= 30 ? 0.85 : i.utilizationPct <= 50 ? 0.6 : i.utilizationPct <= 75 ? 0.35 : i.utilizationPct <= 100 ? 0.15 : 0.05;
  const balances = clamp01(1 - i.balances / 100_000);
  const age = clamp01(i.avgAgeYears / 9);
  const inquiries = clamp01(1 - i.newApplications * 0.15);
  const mixCount = [i.hasRevolving, i.hasInstallment, i.hasMortgage].filter(Boolean).length;
  const mix = mixCount === 0 ? 0.2 : mixCount === 1 ? 0.5 : mixCount === 2 ? 0.8 : 1;
  const derog = i.bankruptcy ? 0 : i.collections > 0 || i.delinquencies > 0 ? clamp01(0.5 - 0.15 * (i.collections + i.delinquencies - 1)) : 1;

  const factors: Factor[] = [
    { id: 'payment', label: 'Payment history', score: payment, weight: 0.33, why: 'The single strongest predictor of future repayment is past repayment. Lenders read a late payment as information about priorities under pressure.', detail: `${i.onTimePct}% on time · ${i.recentLates} recent late payment${i.recentLates === 1 ? '' : 's'}` },
    { id: 'util', label: 'Utilization', score: util, weight: 0.22, why: 'Balances near the limit suggest reliance on credit for liquidity. Below ~30% reads as controlled; under 10% as unconstrained.', detail: `${i.utilizationPct}% of available revolving credit in use` },
    { id: 'balances', label: 'Outstanding balances', score: balances, weight: 0.08, why: 'Absolute balances matter for capacity: a new loan has to fit next to what is already owed.', detail: `${Math.round(i.balances).toLocaleString('en-US')} outstanding` },
    { id: 'age', label: 'Account age', score: age, weight: 0.13, why: 'A long record is more data. Closing old accounts shortens the average and can lower an indicator even with no new borrowing.', detail: `${i.avgAgeYears} years average` },
    { id: 'inquiries', label: 'New applications', score: inquiries, weight: 0.08, why: 'Several applications in a short window look like a search for liquidity. Rate-shopping for one mortgage is usually treated more gently than many unrelated applications.', detail: `${i.newApplications} in the last 12 months` },
    { id: 'mix', label: 'Credit mix', score: mix, weight: 0.08, why: 'Managing revolving, installment and secured credit together demonstrates range. A thin file with one card is harder to underwrite.', detail: `${mixCount} of 3 product types` },
    { id: 'derog', label: 'Derogatory records', score: derog, weight: 0.08, why: 'Collections, charge-offs and bankruptcy stay on file for years in most systems and dominate the picture while they do.', detail: i.bankruptcy ? 'Bankruptcy on file' : `${i.delinquencies} delinquenc${i.delinquencies === 1 ? 'y' : 'ies'} · ${i.collections} collection${i.collections === 1 ? '' : 's'}` },
  ];
  const score = Math.round(factors.reduce((s, f) => s + f.score * f.weight, 0) * 100);
  return { score, band: bandFor(score), factors };
}

export function businessIndicator(i: BusinessInputs): Indicator {
  const vendor = clamp01((i.vendorOnTimePct - 60) / 40) * clamp01(1 - i.daysBeyondTerms / 60);
  const tenure = clamp01(i.yearsInBusiness / 8);
  const scale = clamp01(Math.log10(Math.max(1, i.revenue)) / 7); // ~$10M → 1
  const coverage = clamp01((i.dscr - 0.8) / 1.0); // 1.8× → 1
  const leverage = i.revenue > 0 ? clamp01(1 - i.existingDebt / i.revenue / 1.5) : 0.2; // debt ≤ 1.5× revenue scale
  const entity = clamp01(i.entityAgeYears / 6);
  const records = i.publicRecords === 0 ? 1 : clamp01(0.5 - 0.2 * (i.publicRecords - 1));
  const guarantee = i.personalGuarantee ? 0.75 : 1; // a required PG signals the entity does not yet stand alone

  const factors: Factor[] = [
    { id: 'vendor', label: 'Payment history to vendors', score: vendor, weight: 0.25, why: 'Trade-credit behaviour (the PAYDEX-style concept) is the business equivalent of payment history: do you pay suppliers within terms?', detail: `${i.vendorOnTimePct}% within terms · ${i.daysBeyondTerms} days beyond terms on average` },
    { id: 'tenure', label: 'Years in business', score: tenure, weight: 0.15, why: 'Most business failures happen early. Survival is itself evidence.', detail: `${i.yearsInBusiness} years operating` },
    { id: 'scale', label: 'Revenue scale', score: scale, weight: 0.1, why: 'Larger, diversified revenue absorbs shocks. Lenders size facilities to it.', detail: `${Math.round(i.revenue).toLocaleString('en-US')} annual revenue` },
    { id: 'coverage', label: 'Debt service coverage', score: coverage, weight: 0.2, why: 'DSCR is the lender\'s core question: does operating cash flow cover contractual payments with margin? Many underwrite to ≥1.20–1.25×.', detail: `${i.dscr.toFixed(2)}× DSCR` },
    { id: 'leverage', label: 'Existing debt', score: leverage, weight: 0.1, why: 'Debt already on the balance sheet competes with any new facility for the same cash flow and collateral.', detail: `${Math.round(i.existingDebt).toLocaleString('en-US')} outstanding` },
    { id: 'entity', label: 'Entity age', score: entity, weight: 0.08, why: 'A new entity has no track record even if the owners do; lenders look through to the principals.', detail: `${i.entityAgeYears} years since formation` },
    { id: 'guarantee', label: 'Personal guarantee', score: guarantee, weight: 0.05, why: 'When lenders require a personal guarantee the entity is not yet creditworthy on its own — and the owner\'s personal balance sheet is exposed.', detail: i.personalGuarantee ? 'Required by lenders' : 'Not required' },
    { id: 'records', label: 'Liens & judgments', score: records, weight: 0.07, why: 'Public records signal disputes or unpaid obligations that could rank ahead of a new lender.', detail: `${i.publicRecords} on file` },
  ];
  const score = Math.round(factors.reduce((s, f) => s + f.score * f.weight, 0) * 100);
  return { score, band: bandFor(score), factors };
}

/** Same loan at two rates: total interest difference over the term (uses buildLoan). */
export function financingCostGap(principal: number, baseRate: number, bandA: Band, bandB: Band, termMonths = 360) {
  const a = buildLoan({ principal, annualRate: baseRate + BAND_ACCESS[bandA].spread, termMonths, structure: 'amortizing' });
  const b = buildLoan({ principal, annualRate: baseRate + BAND_ACCESS[bandB].spread, termMonths, structure: 'amortizing' });
  return { a, b, rateA: baseRate + BAND_ACCESS[bandA].spread, rateB: baseRate + BAND_ACCESS[bandB].spread, monthlyGap: b.periodicPayment - a.periodicPayment, interestGap: b.totalInterest - a.totalInterest };
}
