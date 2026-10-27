import type { ComponentKind, RelationshipKind } from '@/types/structure';
import type { Objective } from '@/types/content';

export type CaseLevel = 1 | 2 | 3 | 4 | 5;

export interface CaseNode { id: string; label: string; kind: ComponentKind; x: number; y: number; jurisdiction?: string }
export interface CaseEdge { from: string; to: string; kind: RelationshipKind; label?: string }
export interface CaseLine { label: string; value: number }
export interface CaseDecision { decision: string; why: string; tradeoff: string; professionalsInvolved: string }

export interface CaseStage {
  year: number;
  title: string;
  netWorthUSD: number;
  narrative: string[];
  balanceSheet: { assets: CaseLine[]; liabilities: CaseLine[] };
  structure: { nodes: CaseNode[]; edges: CaseEdge[] };
  objectivesServed: Objective[];
  decisions: CaseDecision[];
  mistakesAvoided: string[];
  taxQuestions: string[];
}

export interface CaseFamily {
  id: string;
  name: string;
  level: CaseLevel;
  levelLabel: string;
  tagline: string;
  overview: string;
  jurisdictions: string[];
  /** Academy chapter slugs */
  relatedChapters: string[];
  stages: CaseStage[];
}

/** Count of legal entities and trusts in a structure (persons and raw assets excluded). */
export const ENTITY_KINDS: ComponentKind[] = ['trust', 'revocable-trust', 'irrevocable-trust', 'offshore-trust', 'holding-company', 'operating-company', 'property-company', 'investment-company', 'management-company', 'foundation', 'family-office', 'foreign-llc'];
export const entityCount = (s: CaseStage) => s.structure.nodes.filter((n) => ENTITY_KINDS.includes(n.kind)).length;
