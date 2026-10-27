import type { ClaimRecord, Topic } from '@/types/knowledge';
import type { Confidence } from '@/types/content';
import { CLAIMS_PART1 } from './part1';
import { CLAIMS_PART2 } from './part2';

/** Date the claim set was last reviewed against primary authority. */
export const CLAIMS_LAST_REVIEWED = '2026-10-26';

/** All Claim Verification Engine records, in topic order. */
export const CLAIMS: ClaimRecord[] = [...CLAIMS_PART1, ...CLAIMS_PART2];

export const claimById = (id: string): ClaimRecord | undefined => CLAIMS.find((c) => c.id === id);

/** Topic → chapter id, used for "Related chapter" links. */
export const TOPIC_CHAPTER: Record<Topic, string> = {
  'entity-structuring': 'ch05',
  trusts: 'ch06',
  tax: 'ch09',
  insurance: 'ch10',
  'real-estate': 'ch09',
  'family-banking': 'ch07',
  'asset-protection': 'ch11',
  offshore: 'ch12',
  succession: 'ch13',
  governance: 'ch14',
  'family-office': 'ch15',
  'debt-credit': 'ch04',
};

export const CONFIDENCE_ORDER: Confidence[] = ['green', 'amber', 'red'];

/** Claims sharing a topic, excluding the given one; falls back to same-confidence claims. */
export function relatedClaims(claim: ClaimRecord, limit = 4): ClaimRecord[] {
  const sameTopic = CLAIMS.filter((c) => c.id !== claim.id && c.topic === claim.topic);
  if (sameTopic.length >= limit) return sameTopic.slice(0, limit);
  const extra = CLAIMS.filter((c) => c.id !== claim.id && c.topic !== claim.topic && c.confidence === claim.confidence);
  return [...sameTopic, ...extra].slice(0, limit);
}

export function countByConfidence(claims: ClaimRecord[]): Record<Confidence, number> {
  return claims.reduce((acc, c) => { acc[c.confidence] += 1; return acc; }, { green: 0, amber: 0, red: 0 } as Record<Confidence, number>);
}
