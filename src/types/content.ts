/** Shared content contracts used by Academy chapters, Debt Studio lessons and Presentation Mode. */

export type Confidence = 'green' | 'amber' | 'red';

export type Objective =
  | 'asset-protection'
  | 'tax-planning'
  | 'estate-planning'
  | 'privacy'
  | 'succession'
  | 'governance';

export const OBJECTIVE_LABELS: Record<Objective, string> = {
  'asset-protection': 'Asset Protection',
  'tax-planning': 'Tax Planning',
  'estate-planning': 'Estate Planning',
  privacy: 'Privacy',
  succession: 'Succession',
  governance: 'Governance',
};

export interface Reference {
  title: string;
  /** e.g. "26 U.S.C. § 7872", "Wyo. Stat. § 17-29-503", "IRS Publication 559" */
  citation?: string;
  jurisdiction: string;
  type: 'statute' | 'regulation' | 'guidance' | 'case' | 'research' | 'book' | 'publication' | 'video' | 'interview' | 'social';
  url?: string;
  note?: string;
}

export interface Term {
  term: string;
  definition: string;
}

export interface KnowledgeQuestion {
  id: string;
  prompt: string;
  options: string[];
  /** index into options */
  answer: number;
  explanation: string;
}

export interface CaseStudy {
  title: string;
  family: string;
  situation: string;
  structure: string;
  outcome: string;
  lesson: string;
}

export interface Misconception {
  claim: string;
  reality: string;
  confidence: Confidence;
}

export interface ChapterContent {
  id: string;          // e.g. "ch01"
  number: number;      // 1..15
  slug: string;        // e.g. "wealth-foundations"
  title: string;
  subtitle: string;
  objectives: Objective[];
  duration: string;    // e.g. "25 min"
  /** Short cinematic opening line */
  hook: string;
  /** Concept explanation paragraphs (markdown-light: **bold** supported) */
  concept: string[];
  realWorldExample: { title: string; body: string[] };
  misconception: Misconception;
  professionalExplanation: string[];
  knowledgeCheck: KnowledgeQuestion[];
  caseStudy: CaseStudy;
  terminology: Term[];
  references: Reference[];
  /** Key takeaways shown at chapter end */
  takeaways: string[];
}

/** A chapter module bundles content with its animated diagram and interactive simulator. */
export interface ChapterModule {
  content: ChapterContent;
  Diagram: React.ComponentType;
  Simulator: React.ComponentType;
}
