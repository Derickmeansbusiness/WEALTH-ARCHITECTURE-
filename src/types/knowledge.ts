import type { Confidence } from './content';

export type Topic =
  | 'entity-structuring' | 'trusts' | 'tax' | 'insurance' | 'real-estate' | 'family-banking'
  | 'asset-protection' | 'offshore' | 'succession' | 'governance' | 'family-office' | 'debt-credit';

export const TOPIC_LABELS: Record<Topic, string> = {
  'entity-structuring': 'Entity structuring',
  trusts: 'Trusts',
  tax: 'Tax',
  insurance: 'Insurance',
  'real-estate': 'Real estate',
  'family-banking': 'Family banking',
  'asset-protection': 'Asset protection',
  offshore: 'Offshore',
  succession: 'Succession',
  governance: 'Governance',
  'family-office': 'Family office',
  'debt-credit': 'Debt & credit',
};

/** Claim Verification Engine record */
export interface ClaimRecord {
  id: string;
  topic: Topic;
  claim: string;
  principle: string;
  howItWorks: string[];
  whenItWorks: string[];
  whenItDoesNot: string[];
  jurisdiction: string;
  legalMechanism: string;
  taxConsequence: string;
  assetProtectionConsequence: string;
  documentation: string[];
  professionals: string[];
  sourceAuthority: string[];
  confidence: Confidence;
  /** short verdict line */
  verdict: string;
}

export type SourceCategory =
  | 'primary-law' | 'tax-regulation' | 'government-guidance' | 'court-case' | 'professional-research'
  | 'book' | 'family-office-publication' | 'video' | 'interview' | 'social-clip';

export const SOURCE_CATEGORY_LABELS: Record<SourceCategory, string> = {
  'primary-law': 'Primary law',
  'tax-regulation': 'Tax regulation',
  'government-guidance': 'Government guidance',
  'court-case': 'Court case',
  'professional-research': 'Professional research',
  book: 'Book',
  'family-office-publication': 'Family-office publication',
  video: 'Video',
  interview: 'Interview',
  'social-clip': 'Social-media clip',
};

export type EvidenceLevel = 'primary' | 'authoritative' | 'professional' | 'anecdotal' | 'unverified';

export interface SourceRecord {
  id: string;
  title: string;
  author: string;
  date: string;          // ISO or year
  jurisdiction: string;
  topic: Topic;
  category: SourceCategory;
  claim: string;
  summary: string;
  evidenceLevel: EvidenceLevel;
  lessonId: string;      // chapter id or debt lesson id, e.g. "ch05", "debt-04"
  url: string;
  notes: string;
  lastReviewed?: string;
  createdAt: number;
}

export type ResearchStatus = 'unverified' | 'in-review' | 'verified' | 'rejected';

export interface ResearchClaim {
  id: string;
  transcriptId: string;
  text: string;
  topic?: Topic;
  status: ResearchStatus;
  confidence?: Confidence;
  reviewerNote?: string;
  linkedSourceId?: string;
}

export interface Transcript {
  id: string;
  title: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'podcast' | 'book' | 'other';
  author: string;
  url?: string;
  raw: string;
  createdAt: number;
}
