import { Link } from 'react-router-dom';
import type { ClaimRecord } from '@/types/knowledge';
import { TOPIC_LABELS } from '@/types/knowledge';
import { Chip, ConfidenceChip } from '@/components/ui';
import './claims.css';

/** Wrap a claim in curly quotes unless it already opens with a quotation mark. */
export const quoteClaim = (s: string) => (/^["“]/.test(s) ? s : `“${s}”`);

/**
 * Reusable claim card. Other modules may import this to surface a Claim Checker entry
 * (e.g., a chapter's misconception block linking to the full verification).
 */
export function ClaimCard({ claim, compact = false }: { claim: ClaimRecord; compact?: boolean }) {
  return (
    <Link to={`/claims/${claim.id}`} className={`cl-card cl-${claim.confidence} ${compact ? 'compact' : ''}`} aria-label={`Open claim: ${claim.claim}`}>
      <div className="cl-card-bar" aria-hidden="true" />
      <div className="cl-card-body">
        <div className="row between" style={{ gap: 8, alignItems: 'flex-start' }}>
          <Chip>{TOPIC_LABELS[claim.topic]}</Chip>
          <ConfidenceChip level={claim.confidence} short={compact} />
        </div>
        <p className="cl-card-claim">{quoteClaim(claim.claim)}</p>
        {!compact && <p className="cl-card-verdict small muted">{claim.verdict}</p>}
        <span className="cl-card-cta tiny">Open verification →</span>
      </div>
    </Link>
  );
}

export default ClaimCard;
