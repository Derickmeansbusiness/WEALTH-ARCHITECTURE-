/**
 * Family Bank rules — pure helpers for the Family Bank Simulator: AFR term bands,
 * compliance warnings and the export summary. Loan math lives in @/lib/finance.
 */
import type { LoanStructure, PaymentFrequency, LoanSummary } from '@/lib/finance';

export type AfrBand = 'short' | 'mid' | 'long';

/** IRS AFR bands by term: short ≤ 3 years, mid > 3 and ≤ 9 years, long > 9 years. */
export function afrBand(termMonths: number): AfrBand {
  if (termMonths <= 36) return 'short';
  if (termMonths <= 108) return 'mid';
  return 'long';
}
export const AFR_BAND_LABEL: Record<AfrBand, string> = { short: 'Short-term AFR (≤ 3 years)', mid: 'Mid-term AFR (3–9 years)', long: 'Long-term AFR (> 9 years)' };

export type CollateralType = 'none' | 'real-estate' | 'equipment' | 'securities' | 'business-interest' | 'personal-guarantee';

export interface WarningInput {
  principal: number;
  rate: number;          // annual decimal
  afr: number;           // annual decimal, user-entered
  structure: LoanStructure;
  collateralType: CollateralType;
  termMonths: number;
  lender: string;
  borrower: string;
}

export interface Warning { id: string; tone: 'amber' | 'danger'; title: string; body: string }

/** Large unsecured related-party loans draw scrutiny; the threshold is a teaching heuristic, not a rule of law. */
export const LARGE_UNSECURED_THRESHOLD = 100_000;

export function buildWarnings(w: WarningInput): Warning[] {
  const out: Warning[] = [];
  if (w.rate < w.afr - 1e-9) {
    out.push({
      id: 'below-afr', tone: 'danger', title: 'Below-market loan',
      body: `The stated rate (${(w.rate * 100).toFixed(2)}%) is below the entered AFR (${(w.afr * 100).toFixed(2)}%). IRC §7872 may impute interest at the AFR and treat the forgone interest as a gift (family lender), compensation (employer–employee) or dividend (corporation–shareholder) depending on the relationship between ${w.lender} and ${w.borrower}. De minimis exceptions exist for small loans but are fact-specific.`,
    });
  }
  if (w.collateralType === 'none' && w.principal >= LARGE_UNSECURED_THRESHOLD) {
    out.push({
      id: 'unsecured', tone: 'amber', title: 'Large unsecured related-party loan',
      body: 'Unsecured related-party loans are scrutinised: a court or the IRS asks whether an unrelated lender would have advanced this amount without security. Document the borrower\'s capacity to repay (income, assets, a budget) and consider a security interest or guarantee.',
    });
  }
  if (w.structure === 'interest-only' || w.structure === 'balloon') {
    out.push({
      id: 'balloon', tone: 'amber', title: 'Balloon at maturity',
      body: `A ${w.structure === 'interest-only' ? 'full principal' : 'residual'} balance falls due at month ${w.termMonths}. Refinancing or repayment capacity must be shown now, not assumed later; a balloon that is quietly rolled or forgiven looks like a gift from the start.`,
    });
  }
  out.push({
    id: 'always', tone: 'amber', title: 'Formal documentation and professional review',
    body: 'A signed promissory note, a security agreement (recorded where applicable), a board or trustee resolution authorising the loan, actual payments made on schedule and enforcement of defaults would ordinarily be required, together with professional tax and legal review. Courts and the IRS weigh bona fide debt factors: written instrument, fixed maturity, reasonable interest, security, repayment history, the borrower\'s ability to repay, whether an outside lender would have lent, and how the parties treated the advance in their own records.',
  });
  return out;
}

export interface ExportInput {
  lender: string; borrower: string; principal: number; rate: number; afr: number; termMonths: number; frequency: PaymentFrequency; structure: LoanStructure; amortizationMonths?: number;
  collateralType: CollateralType; collateral: string; purpose: string; summary: LoanSummary; annual: { year: number; interest: number; principal: number; payment: number; balance: number }[]; warnings: Warning[];
}

/** Markdown summary of the terms and the annualised schedule. */
export function exportSummary(e: ExportInput): string {
  const pctS = (v: number) => `${(v * 100).toFixed(2)}%`;
  const money = (v: number) => `$${v.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
  const lines: string[] = [];
  lines.push('# Family Bank loan summary — EDUCATIONAL ILLUSTRATION, NOT A LEGAL INSTRUMENT', '');
  lines.push(`- Lender: ${e.lender}`, `- Borrower: ${e.borrower}`, `- Principal: ${money(e.principal)}`, `- Interest rate: ${pctS(e.rate)} (entered AFR for comparison: ${pctS(e.afr)}, ${AFR_BAND_LABEL[afrBand(e.termMonths)]})`);
  lines.push(`- Term: ${e.termMonths} months · ${e.frequency} payments · ${e.structure}${e.structure === 'balloon' && e.amortizationMonths ? ` (payment sized on ${e.amortizationMonths}-month amortisation)` : ''}`);
  lines.push(`- Collateral: ${e.collateralType}${e.collateral ? ` — ${e.collateral}` : ''}`, `- Purpose: ${e.purpose}`, '');
  lines.push('## Key figures', '', `- Periodic payment: ${money(e.summary.periodicPayment)}`, `- Annual debt service: ${money(e.summary.annualDebtService)}`, `- Total interest: ${money(e.summary.totalInterest)}`, `- Total paid: ${money(e.summary.totalPaid)}`, `- Balloon at maturity: ${money(e.summary.balloonBalance)}`, '');
  lines.push('## Annual schedule', '', '| Year | Payments | Interest | Principal | Ending balance |', '|---|---|---|---|---|');
  for (const y of e.annual) lines.push(`| ${y.year} | ${money(y.payment)} | ${money(y.interest)} | ${money(y.principal)} | ${money(y.balance)} |`);
  lines.push('', '## Warnings', '');
  for (const w of e.warnings) lines.push(`- **${w.title}** — ${w.body}`);
  lines.push('', '_Generated by the Family Bank Simulator. Illustrative only; legal and tax outcomes depend on jurisdiction, facts, documentation and timing._');
  return lines.join('\n');
}
