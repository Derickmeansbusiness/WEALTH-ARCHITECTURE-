/**
 * Mirrored balance-sheet positions for a documented family loan.
 * The lender's note receivable always equals the borrower's note payable;
 * the lender's cumulative interest income equals the borrower's cumulative interest expense.
 */
import type { LoanSummary } from '@/lib/finance';

export interface MirrorSide {
  /** Outstanding principal */
  note: number;
  /** Cumulative principal that has moved back to the lender */
  principalRepaid: number;
  /** Cumulative interest (income for the lender, expense for the borrower) */
  interest: number;
}

export interface MirroredPosition {
  period: number;
  lender: MirrorSide;
  borrower: MirrorSide;
}

/** Position after `period` payments have been made (0 = immediately after disbursement). */
export function mirroredPosition(summary: LoanSummary, principal: number, period: number): MirroredPosition {
  const k = Math.max(0, Math.min(summary.schedule.length, Math.floor(period)));
  let interest = 0;
  let principalRepaid = 0;
  for (let i = 0; i < k; i++) {
    interest += summary.schedule[i].interest;
    principalRepaid += summary.schedule[i].principal;
  }
  const note = k === 0 ? principal : summary.schedule[k - 1].balance;
  const side: MirrorSide = { note: round2(note), principalRepaid: round2(principalRepaid), interest: round2(interest) };
  return { period: k, lender: { ...side }, borrower: { ...side } };
}

/**
 * Educational check for the below-market loan rules (IRC §7872).
 * Returns the annual "foregone interest" at the given AFR for the first year, or 0 if the stated rate is at or above the AFR.
 */
export function foregoneInterestYearOne(principal: number, statedRate: number, afr: number): number {
  if (statedRate >= afr) return 0;
  return round2(principal * (afr - statedRate));
}

const round2 = (n: number) => Math.round(n * 100) / 100;
