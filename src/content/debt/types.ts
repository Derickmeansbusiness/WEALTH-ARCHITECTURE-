/**
 * Content contracts for the Debt, Credit & Strategic Leverage Studio.
 * Lessons, cases, jurisdiction notes and the studio bibliography all conform to these shapes.
 */
import type { ComponentType } from 'react';
import type { Objective, Term, KnowledgeQuestion, Misconception, Reference, Confidence } from '@/types/content';
import type { JurisdictionMode } from '@/store/useAppStore';
import type { LoanStructure, LeverageInput } from '@/lib/finance';

export type DebtJurisdiction = JurisdictionMode;

export const DEBT_JURISDICTION_LABELS: Record<DebtJurisdiction, string> = {
  US: 'United States',
  UAE: 'United Arab Emirates',
  CEMAC: 'Cameroon · CEMAC · OHADA',
  UK: 'United Kingdom (coming)',
};

export interface DebtCallout {
  tone?: 'danger' | 'green' | 'amber';
  title: string;
  body: string;
}

export interface DebtSection {
  /** anchor id, unique within the lesson */
  id: string;
  heading: string;
  /** Paragraphs. Rich **bold** supported. */
  body: string[];
  Visual?: ComponentType;
  Interactive?: ComponentType;
  callouts?: DebtCallout[];
}

export interface JurisdictionNote {
  verified: boolean;
  notes: string[];
}

export interface DebtLesson {
  id: string;             // 'debt-01'..'debt-09'
  number: number;         // 1..9
  slug: string;
  title: string;
  subtitle: string;
  hook: string;
  duration: string;
  objectives: Objective[];
  sections: DebtSection[];
  keyTerms: Term[];
  knowledgeCheck: KnowledgeQuestion[];
  misconception: Misconception;
  references: Reference[];
  jurisdictionNotes: Record<DebtJurisdiction, JurisdictionNote>;
}

// ── Cases ──────────────────────────────────────────────────────────────────

export interface CaseLine { label: string; value: number; note?: string; intercompany?: boolean }

export interface CaseBalanceSheet {
  assets: CaseLine[];
  liabilities: CaseLine[];
}

export interface CaseEntitySheet extends CaseBalanceSheet {
  name: string;
  kind: 'individual' | 'operating' | 'property' | 'holding' | 'investment' | 'lender' | 'trust';
}

export interface CaseDebt {
  name: string;
  lender: string;
  principal: number;
  annualRate: number;
  termMonths: number;
  structure: LoanStructure;
  amortizationMonths?: number;
  collateral?: string;
  guarantee?: string;
  /** year (relative to stage, 0 = now) in which the facility matures */
  maturityYear?: number;
  note?: string;
}

export interface CaseDecision {
  question: string;
  options: { label: string; consequence: string; tone?: 'green' | 'amber' | 'red' }[];
}

export interface CaseStage {
  id: string;
  title: string;
  /** e.g. "Year 0", "Month 18" */
  timing: string;
  narrative: string[];
  balanceSheet: CaseBalanceSheet;
  /** Optional per-entity balance sheets (Case D); intercompany lines are eliminated in the consolidated view */
  entities?: CaseEntitySheet[];
  /** Annual cash flows; positive = inflow, negative = outflow */
  cashFlow: CaseLine[];
  debts: CaseDebt[];
  decision?: CaseDecision;
  tradeoffs: string[];
  warnings: string[];
  metrics?: { label: string; value: string; tone?: 'gold' | 'green' | 'red' | 'amber' }[];
}

export interface DebtCase {
  id: 'A' | 'B' | 'C' | 'D' | 'E';
  slug: string;
  title: string;
  persona: string;
  summary: string;
  objectives: Objective[];
  stages: CaseStage[];
  takeaways: string[];
  /** Case C: side-by-side scenarios run through analyzeLeverage */
  compare?: { label: string; input: LeverageInput }[];
  relatedLessons: number[];
  relatedTools: { to: string; label: string }[];
}

// ── Bibliography ───────────────────────────────────────────────────────────

export interface StudioSource {
  id: string;
  authority: string;
  title: string;
  jurisdiction: DebtJurisdiction | 'Multi';
  type: Reference['type'];
  citation?: string;
  url?: string;
  usedIn: string[];        // lesson ids
  lastReviewed: string;    // 'YYYY-MM'
  confidence: Confidence;
  note?: string;
}
