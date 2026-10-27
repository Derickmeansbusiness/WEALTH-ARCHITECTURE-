import { useMemo, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import type { Confidence } from '@/types/content';
import type { Topic } from '@/types/knowledge';
import { TOPIC_LABELS } from '@/types/knowledge';
import { CLAIMS, CLAIMS_LAST_REVIEWED, TOPIC_CHAPTER, claimById, relatedClaims, countByConfidence } from '@/content/claims';
import { chapterById } from '@/content/chapters/manifest';
import { useAppStore } from '@/store/useAppStore';
import { uid } from '@/lib/format';
import { Chip, ConfidenceChip, Disclaimer, EmptyState, Eyebrow, Panel, Reveal, Rich, SectionHeader, SelectField, TextField, Callout } from '@/components/ui';
import { ClaimCard } from './ClaimCard';
import './claims.css';

export default function ClaimsModule() {
  return (
    <Routes>
      <Route index element={<ClaimsIndex />} />
      <Route path=":claimId" element={<ClaimDetail />} />
    </Routes>
  );
}

const CONF_META: Record<Confidence, { label: string; sub: string }> = {
  green: { label: 'Green', sub: 'Strongly supported' },
  amber: { label: 'Amber', sub: 'Fact / jurisdiction dependent' },
  red: { label: 'Red', sub: 'Misleading or incorrect' },
};

// ───────────────────────────────── Index ─────────────────────────────────
function ClaimsIndex() {
  const [q, setQ] = useState('');
  const [topic, setTopic] = useState<Topic | 'all'>('all');
  const [conf, setConf] = useState<Confidence | 'all'>('all');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return CLAIMS.filter((c) => {
      if (topic !== 'all' && c.topic !== topic) return false;
      if (conf !== 'all' && c.confidence !== conf) return false;
      if (!needle) return true;
      const hay = [c.claim, c.principle, c.verdict, c.legalMechanism, c.jurisdiction, ...c.sourceAuthority, TOPIC_LABELS[c.topic]].join(' ').toLowerCase();
      return hay.includes(needle);
    });
  }, [q, topic, conf]);

  const totals = countByConfidence(CLAIMS);
  const topicOptions = [{ value: 'all' as const, label: 'All topics' }, ...(Object.keys(TOPIC_LABELS) as Topic[]).map((t) => ({ value: t, label: TOPIC_LABELS[t] }))];
  const confOptions = [{ value: 'all' as const, label: 'All ratings' }, { value: 'green' as const, label: 'Green — strongly supported' }, { value: 'amber' as const, label: 'Amber — depends' }, { value: 'red' as const, label: 'Red — misleading' }];

  return (
    <div className="page container">
      <SectionHeader
        eyebrow={`Claim Verification Engine · ${CLAIMS.length} claims · reviewed ${CLAIMS_LAST_REVIEWED}`}
        title="Internet claims meet primary law."
        lede="Every popular statement about how wealthy families structure ownership, tax, protection and succession is taken apart into thirteen sections: what is claimed, the principle underneath it, how it actually works, when it works, when it does not, and who has to be in the room. Green, amber or red."
      />

      <div className="cl-lights fade-up" role="group" aria-label="Filter by confidence rating">
        {(['green', 'amber', 'red'] as Confidence[]).map((lvl) => (
          <button key={lvl} className={`cl-light ${lvl} ${conf === lvl ? 'active' : ''}`} onClick={() => setConf(conf === lvl ? 'all' : lvl)} aria-pressed={conf === lvl}>
            <span className="lamp" aria-hidden="true" />
            <span><span className="n">{totals[lvl]}</span><br /><span className="l">{CONF_META[lvl].label} · {CONF_META[lvl].sub}</span></span>
          </button>
        ))}
      </div>

      <div className="section" style={{ marginTop: 28 }}>
        <div className="cl-filters">
          <TextField label="Search claims, principles, authorities" value={q} onChange={setQ} placeholder='e.g. "charging order", "§7872", "Dubai", "step-up"' />
          <SelectField label="Topic" value={topic} onChange={setTopic} options={topicOptions} />
          <SelectField label="Confidence" value={conf} onChange={setConf} options={confOptions} />
        </div>
        <div className="row between" style={{ marginTop: 14 }}>
          <span className="small muted mono">{filtered.length} of {CLAIMS.length} claims</span>
          {(q || topic !== 'all' || conf !== 'all') && <button className="btn sm ghost" onClick={() => { setQ(''); setTopic('all'); setConf('all'); }}>Clear filters</button>}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No claim matches that search." body="Try a broader term, or submit the claim for review so it can be verified and added." action={<Link className="btn primary" to="/research">Submit a claim for review</Link>} />
      ) : (
        <div className="cl-grid">
          {filtered.map((c, i) => (
            <Reveal key={c.id} delay={Math.min(i, 8) * 0.04}><ClaimCard claim={c} /></Reveal>
          ))}
        </div>
      )}

      <div className="hairline" />
      <div className="grid grid-2">
        <Panel>
          <Eyebrow>How the rating works</Eyebrow>
          <ul className="small" style={{ margin: '12px 0 0', paddingLeft: 18, color: 'var(--ivory-2)' }}>
            <li><strong>Green</strong>: well established in primary law or authoritative guidance; the caveats are about execution, not validity.</li>
            <li><strong>Amber</strong>: true in some circumstances; depends on facts, jurisdiction, documentation and timing. Most real planning lives here.</li>
            <li><strong>Red</strong>: as commonly stated, wrong or dangerously incomplete; sometimes a legitimate kernel is explained in the principle section.</li>
          </ul>
        </Panel>
        <Panel tone="gold">
          <Eyebrow>Heard something not listed?</Eyebrow>
          <p className="small" style={{ marginTop: 10 }}>Submit it to the Research Workspace. It enters the queue as <strong>unverified</strong> and is only promoted to the Claim Checker after review against primary authority.</p>
          <Link className="btn" to="/research">Open Research Workspace →</Link>
        </Panel>
      </div>
      <div style={{ marginTop: 24 }}><Disclaimer /></div>
    </div>
  );
}

// ───────────────────────────────── Detail ─────────────────────────────────
function Section({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`cl-section ${className}`}>
      <h4>{title}</h4>
      {children}
    </section>
  );
}
const List = ({ items }: { items: string[] }) => <ul>{items.map((s, i) => <Rich key={i} as="li" text={s} />)}</ul>;

function ClaimDetail() {
  const { claimId = '' } = useParams();
  const navigate = useNavigate();
  const claim = claimById(claimId);
  const addResearchClaims = useAppStore((s) => s.addResearchClaims);
  const addTranscript = useAppStore((s) => s.addTranscript);
  const transcripts = useAppStore((s) => s.transcripts);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [draft, setDraft] = useState('');

  if (!claim) {
    return (
      <div className="page container">
        <EmptyState title="That claim is not in the engine." body="It may have been renamed, or it has not been verified yet." action={<div className="row" style={{ justifyContent: 'center' }}><Link className="btn" to="/claims">All claims</Link><Link className="btn primary" to="/research">Submit it for review</Link></div>} />
      </div>
    );
  }

  const chapter = chapterById(TOPIC_CHAPTER[claim.topic]);
  const related = relatedClaims(claim);
  const meta = CONF_META[claim.confidence];

  const submit = () => {
    const text = draft.trim();
    if (text.length < 8) return;
    // Submissions from the Claim Checker share one synthetic "inbox" transcript so the queue has a parent.
    let inbox = transcripts.find((t) => t.id === 'claim-checker-inbox');
    if (!inbox) {
      inbox = { id: 'claim-checker-inbox', title: 'Claim Checker submissions', platform: 'other', author: 'Platform users', raw: 'Claims submitted from the Claim Checker detail pages.', createdAt: Date.now() };
      addTranscript(inbox);
    }
    addResearchClaims([{ id: uid(), transcriptId: inbox.id, text, topic: claim.topic, status: 'unverified', reviewerNote: `Submitted from /claims/${claim.id}` }]);
    setDraft('');
    setSubmitOpen(false);
    navigate('/research?tab=queue');
  };

  return (
    <div className="page container">
      <div className="row between" style={{ marginBottom: 18 }}>
        <Link to="/claims" className="btn sm ghost">← All claims</Link>
        <div className="row" style={{ gap: 8 }}>
          <Chip>{TOPIC_LABELS[claim.topic]}</Chip>
          {chapter && <Link to={`/academy/${chapter.slug}`} className="chip gold">Chapter {String(chapter.number).padStart(2, '0')} · {chapter.short}</Link>}
        </div>
      </div>

      <div className={`cl-banner ${claim.confidence} fade-up`} role="status">
        <span className="lamp" aria-hidden="true" />
        <div>
          <Eyebrow>Confidence rating · {meta.label}</Eyebrow>
          <div className="title">{meta.sub}</div>
          <p className="sub">{claim.verdict}</p>
        </div>
      </div>

      <div className="cl-layout" style={{ marginTop: 24 }}>
        <div className="cl-sections">
          <Section title="The claim" className="quote"><p>“{claim.claim}”</p></Section>
          <Section title="The principle"><Rich text={claim.principle} /></Section>
          <Section title="How it actually works"><List items={claim.howItWorks} /></Section>
          <div className="cl-two">
            <Section title="When it works" className="works"><List items={claim.whenItWorks} /></Section>
            <Section title="When it does not work" className="fails"><List items={claim.whenItDoesNot} /></Section>
          </div>
          <Section title="Jurisdiction"><Rich text={claim.jurisdiction} /></Section>
          <Section title="Legal mechanism"><Rich text={claim.legalMechanism} /></Section>
          <Section title="Tax consequence"><Rich text={claim.taxConsequence} /></Section>
          <Section title="Asset-protection consequence"><Rich text={claim.assetProtectionConsequence} /></Section>
          <Section title="Documentation required"><List items={claim.documentation} /></Section>
          <Section title="Professionals required"><List items={claim.professionals} /></Section>
          <Section title="Source authority" className="cl-authority"><List items={claim.sourceAuthority} /></Section>
          <Section title="Confidence rating">
            <div className="row" style={{ gap: 12 }}>
              <ConfidenceChip level={claim.confidence} />
              <span className="small muted">Reviewed {CLAIMS_LAST_REVIEWED}. Ratings describe the claim as commonly stated, not every possible variation.</span>
            </div>
          </Section>
          <Disclaimer>Legal and tax outcomes depend on jurisdiction, facts, documentation and timing. The professionals listed above are the ones who would ordinarily need to review a plan built on this claim before anyone acts.</Disclaimer>
        </div>

        <aside className="cl-sticky">
          <Panel tight>
            <Eyebrow>Related chapter</Eyebrow>
            {chapter ? (
              <Link to={`/academy/${chapter.slug}`} className="stack" style={{ gap: 4, marginTop: 10 }}>
                <span className="display" style={{ fontSize: '1.3rem', color: 'var(--ivory)' }}>{String(chapter.number).padStart(2, '0')} · {chapter.title}</span>
                <span className="tiny muted">{chapter.duration} · open in the Academy →</span>
              </Link>
            ) : <p className="small muted">No chapter mapped.</p>}
          </Panel>
          <Panel tight>
            <Eyebrow>Related claims</Eyebrow>
            <div className="stack" style={{ gap: 10, marginTop: 10 }}>
              {related.map((r) => <ClaimCard key={r.id} claim={r} compact />)}
            </div>
          </Panel>
          <Panel tight tone="gold">
            <Eyebrow>Heard a variation?</Eyebrow>
            <p className="small" style={{ margin: '8px 0 10px' }}>Submit it for review. It enters the Research queue as unverified.</p>
            {!submitOpen ? (
              <button className="btn primary sm" onClick={() => setSubmitOpen(true)}>Submit a claim for review</button>
            ) : (
              <div className="stack" style={{ gap: 8 }}>
                <TextField value={draft} onChange={setDraft} multiline rows={4} placeholder="Paste the claim exactly as you heard it…" />
                <div className="row" style={{ gap: 6 }}>
                  <button className="btn primary sm" disabled={draft.trim().length < 8} onClick={submit}>Add to queue →</button>
                  <button className="btn sm ghost" onClick={() => setSubmitOpen(false)}>Cancel</button>
                </div>
                <Callout tone="amber"><p className="tiny" style={{ margin: 0 }}>Unverified statements never enter the masterclass as established facts.</p></Callout>
              </div>
            )}
          </Panel>
        </aside>
      </div>
    </div>
  );
}
