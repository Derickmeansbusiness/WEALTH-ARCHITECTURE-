import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { ClaimRecord, ResearchClaim, ResearchStatus, Topic, Transcript } from '@/types/knowledge';
import { TOPIC_LABELS } from '@/types/knowledge';
import type { Confidence } from '@/types/content';
import { SEED_SOURCES } from '@/content/sources/seed';
import { useAppStore } from '@/store/useAppStore';
import { uid } from '@/lib/format';
import { Callout, Chip, ConfidenceChip, Disclaimer, EmptyState, Eyebrow, Modal, Panel, SectionHeader, SelectField, Stat, Tabs, TextField } from '@/components/ui';
import { segmentTranscript, type CandidateClaim } from './segment';
import './research.css';

type Tab = 'intake' | 'queue' | 'library';
const STATUSES: ResearchStatus[] = ['unverified', 'in-review', 'verified', 'rejected'];
const STATUS_LABEL: Record<ResearchStatus, string> = { unverified: 'Unverified', 'in-review': 'In review', verified: 'Verified', rejected: 'Rejected' };
const STATUS_TONE: Record<ResearchStatus, 'gold' | 'green' | 'amber' | 'red' | 'blue' | 'violet' | undefined> = { unverified: undefined, 'in-review': 'blue', verified: 'green', rejected: 'red' };
const PLATFORMS: Transcript['platform'][] = ['youtube', 'instagram', 'tiktok', 'podcast', 'book', 'other'];
const TOPICS = Object.keys(TOPIC_LABELS) as Topic[];

const RULE = 'Unverified statements never enter the masterclass as established facts. Only claims marked verified can be promoted to a Claim Checker draft, and a draft still has to be reviewed and added to the content set by hand.';

export default function ResearchWorkspace() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab) || 'intake';
  const setTab = (t: Tab) => setParams(t === 'intake' ? {} : { tab: t }, { replace: true });
  const transcripts = useAppStore((s) => s.transcripts);
  const claims = useAppStore((s) => s.researchClaims);

  return (
    <div className="page container">
      <SectionHeader
        eyebrow="Research Workspace · administrator"
        title="Paste a transcript. Split it into claims. Verify before teaching."
        lede="Everything that comes in from videos, podcasts, books and social clips lands here as unverified. It moves through review against primary authority before it can touch the masterclass."
      >
        <Tabs value={tab} onChange={setTab} tabs={[{ id: 'intake', label: 'Transcript intake' }, { id: 'queue', label: `Research queue (${claims.length})` }, { id: 'library', label: `Transcript library (${transcripts.length})` }]} />
      </SectionHeader>

      <div className="rw-rule" role="note" style={{ marginBottom: 24 }}>
        <span className="lamp" aria-hidden="true" />
        <p className="small" style={{ margin: 0 }}><strong>Rule.</strong> {RULE}</p>
      </div>

      <StatsHeader claims={claims} />

      <div style={{ marginTop: 24 }}>
        {tab === 'intake' && <Intake onSaved={() => setTab('queue')} />}
        {tab === 'queue' && <Queue />}
        {tab === 'library' && <Library />}
      </div>
      <div style={{ marginTop: 28 }}><Disclaimer tone="amber">The segmentation is a deterministic heuristic to speed up review. It does not judge truth. Confidence ratings are assigned by a reviewer against cited authority, never by the splitter.</Disclaimer></div>
    </div>
  );
}

// ───────────────────────────────── Stats ─────────────────────────────────
function StatsHeader({ claims }: { claims: ResearchClaim[] }) {
  const byStatus = STATUSES.map((s) => ({ s, n: claims.filter((c) => c.status === s).length }));
  const byTopic = TOPICS.map((t) => ({ t, n: claims.filter((c) => c.topic === t).length })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
  const max = Math.max(1, ...byTopic.map((x) => x.n));
  return (
    <div className="stack" style={{ gap: 12 }}>
      <div className="rw-stats">
        {byStatus.map(({ s, n }) => <Stat key={s} label={STATUS_LABEL[s]} value={n} tone={s === 'verified' ? 'green' : s === 'rejected' ? 'red' : s === 'in-review' ? 'gold' : undefined} sub={s === 'unverified' ? 'awaiting review' : s === 'in-review' ? 'being checked' : s === 'verified' ? 'eligible for promotion' : 'documented as wrong'} />)}
      </div>
      {byTopic.length > 0 && (
        <Panel tight>
          <Eyebrow>Claims per topic</Eyebrow>
          <div className="rw-topic-bars" style={{ marginTop: 10 }}>
            {byTopic.map(({ t, n }) => (
              <div key={t} className="b"><div className="row"><span>{TOPIC_LABELS[t]}</span><span className="mono muted">{n}</span></div><div className="bar"><i style={{ width: `${(n / max) * 100}%` }} /></div></div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

// ───────────────────────────────── Intake ─────────────────────────────────
interface Cand extends CandidateClaim { id: string; keep: boolean }

function Intake({ onSaved }: { onSaved: () => void }) {
  const addTranscript = useAppStore((s) => s.addTranscript);
  const addResearchClaims = useAppStore((s) => s.addResearchClaims);
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState<Transcript['platform']>('youtube');
  const [author, setAuthor] = useState('');
  const [url, setUrl] = useState('');
  const [raw, setRaw] = useState('');
  const [cands, setCands] = useState<Cand[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const split = () => {
    setError(null);
    if (raw.trim().length < 40) { setError('Paste at least a few sentences of transcript before splitting.'); return; }
    const out = segmentTranscript(raw).map((c) => ({ ...c, id: uid(), keep: true }));
    setCands(out);
    if (out.length === 0) setError('No claim-like sentences were detected. The text may be narrative, questions only, or too short.');
  };
  const update = (id: string, patch: Partial<Cand>) => setCands((cs) => cs?.map((c) => (c.id === id ? { ...c, ...patch } : c)) ?? null);
  const kept = cands?.filter((c) => c.keep && c.text.trim().length > 0) ?? [];

  const save = () => {
    if (!title.trim()) { setError('Give the transcript a title.'); return; }
    if (kept.length === 0) { setError('Keep at least one candidate claim, or add one manually.'); return; }
    const t: Transcript = { id: uid(), title: title.trim(), platform, author: author.trim(), url: url.trim() || undefined, raw, createdAt: Date.now() };
    addTranscript(t);
    addResearchClaims(kept.map((c) => ({ id: uid(), transcriptId: t.id, text: c.text.trim(), topic: c.topic, status: 'unverified' as const })));
    setTitle(''); setAuthor(''); setUrl(''); setRaw(''); setCands(null);
    onSaved();
  };

  return (
    <div className="rw-intake">
      <Panel>
        <Eyebrow>1 · Transcript</Eyebrow>
        <div className="stack" style={{ gap: 12, marginTop: 12 }}>
          <TextField label="Title *" value={title} onChange={setTitle} placeholder='e.g. "How the rich pay zero tax" — YouTube, 14 min' />
          <div className="rw-intake-meta">
            <SelectField label="Platform" value={platform} onChange={setPlatform} options={PLATFORMS.map((p) => ({ value: p, label: p === 'youtube' ? 'YouTube' : p === 'tiktok' ? 'TikTok' : p.charAt(0).toUpperCase() + p.slice(1) }))} />
            <TextField label="Author / channel" value={author} onChange={setAuthor} />
          </div>
          <TextField label="URL" value={url} onChange={setUrl} placeholder="https://…" />
          <TextField label="Raw transcript text" value={raw} onChange={setRaw} multiline rows={14} placeholder="Paste the transcript. Timestamps, speaker labels and [Music] markers are stripped automatically." />
          <div className="row between">
            <span className="tiny muted mono">{raw.trim() ? `${raw.trim().split(/\s+/).length} words` : 'empty'}</span>
            <button className="btn primary" onClick={split} disabled={raw.trim().length < 40}>Split into claims →</button>
          </div>
          {error && <Callout tone="danger"><p className="small" style={{ margin: 0 }}>{error}</p></Callout>}
        </div>
      </Panel>

      <Panel>
        <div className="row between">
          <Eyebrow>2 · Candidate claims {cands ? `· ${kept.length} of ${cands.length} kept` : ''}</Eyebrow>
          {cands && <button className="btn sm ghost" onClick={() => setCands((cs) => [...(cs ?? []), { id: uid(), text: '', topic: undefined, confidenceHint: 'unverified', score: 0, keep: true }])}>+ Add manually</button>}
        </div>
        {!cands ? (
          <div style={{ marginTop: 12 }}><EmptyState title="No transcript split yet." body="Paste text on the left and press “Split into claims”. Each candidate gets a suggested topic and arrives as unverified." /></div>
        ) : cands.length === 0 ? (
          <div style={{ marginTop: 12 }}><EmptyState title="Nothing claim-like found." body="Try a transcript with assertions rather than questions, or add a claim manually." action={<button className="btn sm" onClick={() => setCands([{ id: uid(), text: '', topic: undefined, confidenceHint: 'unverified', score: 0, keep: true }])}>Add manually</button>} /></div>
        ) : (
          <>
            <div className="rw-cands" style={{ marginTop: 12 }}>
              {cands.map((c) => (
                <div key={c.id} className={`rw-cand ${c.keep ? '' : 'off'}`}>
                  <input type="checkbox" checked={c.keep} onChange={(e) => update(c.id, { keep: e.target.checked })} aria-label="Keep this claim" />
                  <div>
                    <textarea className="input" rows={2} value={c.text} onChange={(e) => update(c.id, { text: e.target.value })} placeholder="Claim text…" />
                    <div className="foot">
                      <select className="input" value={c.topic ?? ''} onChange={(e) => update(c.id, { topic: (e.target.value || undefined) as Topic | undefined })} aria-label="Topic">
                        <option value="">No topic</option>
                        {TOPICS.map((t) => <option key={t} value={t}>{TOPIC_LABELS[t]}</option>)}
                      </select>
                      <Chip tone="red"><span className="dot" />Unverified</Chip>
                      {c.score > 0 && <span className="tiny muted mono" title="Claim-likeness score">score {c.score}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="row between" style={{ marginTop: 14 }}>
              <span className="tiny muted">Everything saved here is <strong>unverified</strong> until a reviewer moves it.</span>
              <button className="btn primary" onClick={save} disabled={kept.length === 0}>Save transcript & {kept.length} claim{kept.length === 1 ? '' : 's'} →</button>
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}

// ───────────────────────────────── Queue ─────────────────────────────────
function Queue() {
  const claims = useAppStore((s) => s.researchClaims);
  const transcripts = useAppStore((s) => s.transcripts);
  const userSources = useAppStore((s) => s.sources);
  const update = useAppStore((s) => s.updateResearchClaim);
  const remove = useAppStore((s) => s.deleteResearchClaim);
  const [promote, setPromote] = useState<ResearchClaim | null>(null);
  const [topicFilter, setTopicFilter] = useState<Topic | 'all'>('all');

  const allSources = useMemo(() => [...userSources, ...SEED_SOURCES], [userSources]);
  const tById = useMemo(() => new Map(transcripts.map((t) => [t.id, t])), [transcripts]);
  const visible = topicFilter === 'all' ? claims : claims.filter((c) => c.topic === topicFilter);

  if (claims.length === 0) {
    return <EmptyState title="The queue is empty." body="Split a transcript into claims, or submit one from a Claim Checker page, and it will appear here as unverified." action={<Link className="btn primary" to="/research">Go to transcript intake</Link>} />;
  }

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="row between">
        <div className="row" style={{ gap: 8 }}>
          <span className="small muted">Filter by topic</span>
          <select className="input" style={{ width: 'auto', padding: '6px 10px', fontSize: '0.82rem' }} value={topicFilter} onChange={(e) => setTopicFilter(e.target.value as Topic | 'all')}>
            <option value="all">All topics</option>
            {TOPICS.map((t) => <option key={t} value={t}>{TOPIC_LABELS[t]}</option>)}
          </select>
        </div>
        <span className="tiny muted">Move cards with the status buttons. Only <strong className="green">verified</strong> cards can be promoted.</span>
      </div>
      <div className="rw-board">
        {STATUSES.map((status) => {
          const col = visible.filter((c) => c.status === status);
          return (
            <div key={status} className={`rw-col ${status}`}>
              <div className="rw-col-head"><Chip tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Chip><span className="n">{col.length}</span></div>
              <div className="rw-col-body">
                {col.length === 0 ? <div className="rw-col-empty">No claims {STATUS_LABEL[status].toLowerCase()}.</div> : col.map((c) => (
                  <ClaimCardEditor key={c.id} claim={c} transcript={tById.get(c.transcriptId)} sources={allSources} onChange={update} onDelete={() => { if (window.confirm('Delete this research claim?')) remove(c.id); }} onPromote={() => setPromote(c)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <PromoteModal claim={promote} transcript={promote ? tById.get(promote.transcriptId) : undefined} sources={allSources} onClose={() => setPromote(null)} />
    </div>
  );
}

function ClaimCardEditor({ claim, transcript, sources, onChange, onDelete, onPromote }: { claim: ResearchClaim; transcript?: Transcript; sources: { id: string; title: string }[]; onChange: (c: ResearchClaim) => void; onDelete: () => void; onPromote: () => void }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(claim.text);
  const idx = STATUSES.indexOf(claim.status);
  const move = (dir: -1 | 1) => { const next = STATUSES[idx + dir]; if (next) onChange({ ...claim, status: next }); };
  const set = (patch: Partial<ResearchClaim>) => onChange({ ...claim, ...patch });
  return (
    <article className="rw-claim">
      {editing ? (
        <div className="stack" style={{ gap: 6 }}>
          <textarea className="input" rows={3} value={text} onChange={(e) => setText(e.target.value)} />
          <div className="row" style={{ gap: 6 }}>
            <button className="btn sm primary" onClick={() => { set({ text: text.trim() }); setEditing(false); }} disabled={text.trim().length < 3}>Save</button>
            <button className="btn sm ghost" onClick={() => { setText(claim.text); setEditing(false); }}>Cancel</button>
          </div>
        </div>
      ) : (
        <p className="text" onDoubleClick={() => setEditing(true)} title="Double-click to edit">“{claim.text}”</p>
      )}
      <div className="src">{transcript ? `${transcript.title} · ${transcript.platform}${transcript.author ? ` · ${transcript.author}` : ''}` : 'Transcript removed'}</div>
      <div className="ctl">
        <select className="input" value={claim.topic ?? ''} onChange={(e) => set({ topic: (e.target.value || undefined) as Topic | undefined })} aria-label="Topic">
          <option value="">No topic</option>
          {TOPICS.map((t) => <option key={t} value={t}>{TOPIC_LABELS[t]}</option>)}
        </select>
        <select className="input" value={claim.confidence ?? ''} onChange={(e) => set({ confidence: (e.target.value || undefined) as Confidence | undefined })} aria-label="Confidence">
          <option value="">No rating yet</option>
          <option value="green">Green — strongly supported</option>
          <option value="amber">Amber — depends</option>
          <option value="red">Red — misleading</option>
        </select>
        <select className="input full" value={claim.linkedSourceId ?? ''} onChange={(e) => set({ linkedSourceId: e.target.value || undefined })} aria-label="Linked source">
          <option value="">No linked source</option>
          {sources.map((s) => <option key={s.id} value={s.id}>{s.title.length > 70 ? `${s.title.slice(0, 70)}…` : s.title}</option>)}
        </select>
        <input className="input full" value={claim.reviewerNote ?? ''} onChange={(e) => set({ reviewerNote: e.target.value })} placeholder="Reviewer note (authority checked, caveats)…" aria-label="Reviewer note" />
      </div>
      <div className="row between" style={{ gap: 6 }}>
        <div className="row" style={{ gap: 6 }}>{claim.confidence && <ConfidenceChip level={claim.confidence} short />}{claim.linkedSourceId && <Chip tone="gold">Source linked</Chip>}</div>
      </div>
      <div className="actions">
        <button className="btn sm ghost" onClick={() => move(-1)} disabled={idx === 0} title={idx > 0 ? `Move to ${STATUS_LABEL[STATUSES[idx - 1]]}` : ''}>←</button>
        <button className="btn sm ghost" onClick={() => move(1)} disabled={idx === STATUSES.length - 1} title={idx < STATUSES.length - 1 ? `Move to ${STATUS_LABEL[STATUSES[idx + 1]]}` : ''}>→</button>
        <button className="btn sm ghost" onClick={() => setEditing(true)}>Edit</button>
        {claim.status === 'verified' ? <button className="btn sm primary" onClick={onPromote}>Promote to Claim Checker draft</button> : <button className="btn sm ghost" disabled title="Only verified claims can be promoted">Promote</button>}
        <button className="btn sm danger" onClick={onDelete}>Delete</button>
      </div>
    </article>
  );
}

// ───────────────────────────────── Promote ─────────────────────────────────
function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').split('-').slice(0, 7).join('-') || 'new-claim';
}

function buildDraft(claim: ResearchClaim, transcript: Transcript | undefined, source: { title: string; url?: string } | undefined): ClaimRecord {
  const origin = transcript ? `${transcript.title}${transcript.author ? ` (${transcript.author})` : ''}${transcript.url ? ` — ${transcript.url}` : ''}` : 'unknown transcript';
  return {
    id: slugify(claim.text),
    topic: claim.topic ?? 'tax',
    claim: claim.text,
    principle: 'TODO: state the legal/financial principle underneath the claim, including the kernel of truth if any.',
    howItWorks: ['TODO: step-by-step mechanics with the operative Code sections, statutes or cases.'],
    whenItWorks: ['TODO: fact patterns where the claim holds.'],
    whenItDoesNot: ['TODO: fact patterns where it fails, with the authority that defeats it.'],
    jurisdiction: 'TODO: which law governs and how it differs elsewhere (US federal, states, UAE, UK, OHADA).',
    legalMechanism: 'TODO: the documents and statutory mechanisms involved.',
    taxConsequence: 'TODO: income, gift, estate and state tax consequences; never imply automatic elimination.',
    assetProtectionConsequence: 'TODO: what a creditor can and cannot reach.',
    documentation: ['TODO: documents that must exist for the structure to be respected.'],
    professionals: ['TODO: which professionals would ordinarily need to review.'],
    sourceAuthority: [source ? `${source.title}${source.url ? ` — ${source.url}` : ''}` : 'TODO: primary authority (IRC §, Treas. Reg., statute, case, agency guidance).', `Origin of claim (not an authority): ${origin}`, ...(claim.reviewerNote ? [`Reviewer note: ${claim.reviewerNote}`] : [])],
    confidence: claim.confidence ?? 'amber',
    verdict: 'TODO: one-line verdict as commonly stated.',
  };
}

function PromoteModal({ claim, transcript, sources, onClose }: { claim: ResearchClaim | null; transcript?: Transcript; sources: { id: string; title: string; url: string }[]; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  if (!claim) return null;
  const source = claim.linkedSourceId ? sources.find((s) => s.id === claim.linkedSourceId) : undefined;
  const draft = buildDraft(claim, transcript, source);
  const json = JSON.stringify(draft, null, 2);
  const copy = async () => { try { await navigator.clipboard.writeText(json); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard unavailable */ } };
  const dl = () => { const blob = new Blob([json], { type: 'application/json' }); const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = `${draft.id}.claim.json`; a.click(); setTimeout(() => URL.revokeObjectURL(u), 1000); };
  return (
    <Modal open onClose={onClose} title="Claim Checker draft" wide>
      <Callout tone="amber" title="What this is">
        <p className="small" style={{ margin: 0 }}>A <code className="mono">ClaimRecord</code> skeleton generated from a verified research claim. Nothing is written to the content set at runtime: copy or download it, complete every <code className="mono">TODO</code> against primary authority, and add it to <code className="mono">src/content/claims</code> by hand. {!claim.confidence && 'No confidence rating was set; amber is the placeholder.'}</p>
      </Callout>
      <div className="row between" style={{ margin: '14px 0 10px' }}>
        <div className="row" style={{ gap: 8 }}><Chip tone="green">Verified</Chip>{claim.topic && <Chip>{TOPIC_LABELS[claim.topic]}</Chip>}{claim.confidence && <ConfidenceChip level={claim.confidence} short />}</div>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn sm" onClick={copy}>{copied ? 'Copied' : 'Copy JSON'}</button>
          <button className="btn sm primary" onClick={dl}>Download .json</button>
        </div>
      </div>
      <pre className="rw-code">{json}</pre>
    </Modal>
  );
}

// ───────────────────────────────── Library ─────────────────────────────────
function Library() {
  const transcripts = useAppStore((s) => s.transcripts);
  const claims = useAppStore((s) => s.researchClaims);
  const del = useAppStore((s) => s.deleteTranscript);
  const [open, setOpen] = useState<Transcript | null>(null);
  if (transcripts.length === 0) return <EmptyState title="No transcripts yet." body="Transcripts you paste in intake are stored here with their claims." action={<Link className="btn primary" to="/research">Go to transcript intake</Link>} />;
  return (
    <div className="rw-lib">
      {transcripts.map((t) => {
        const n = claims.filter((c) => c.transcriptId === t.id);
        const v = n.filter((c) => c.status === 'verified').length;
        return (
          <div key={t.id} className="rw-lib-row">
            <div className="stack" style={{ gap: 4 }}>
              <span className="t">{t.title}</span>
              <span className="m"><Chip>{t.platform}</Chip>{t.author && <span>{t.author}</span>}<span className="mono">{new Date(t.createdAt).toLocaleDateString()}</span><span>{n.length} claim{n.length === 1 ? '' : 's'} · {v} verified</span>{t.url && <a href={t.url} target="_blank" rel="noreferrer">source ↗</a>}</span>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <button className="btn sm ghost" onClick={() => setOpen(t)}>View text</button>
              <Link className="btn sm ghost" to="/research?tab=queue">Queue</Link>
              <button className="btn sm danger" onClick={() => { if (window.confirm(`Delete "${t.title}" and its ${n.length} claim${n.length === 1 ? '' : 's'}?`)) del(t.id); }}>Delete</button>
            </div>
          </div>
        );
      })}
      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.title} wide>
        <pre className="rw-code" style={{ whiteSpace: 'pre-wrap' }}>{open?.raw}</pre>
      </Modal>
    </div>
  );
}
