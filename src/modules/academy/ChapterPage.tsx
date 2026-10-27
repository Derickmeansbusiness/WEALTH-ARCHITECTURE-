import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CHAPTERS, chapterBySlug } from '@/content/chapters/manifest';
import { useAppStore } from '@/store/useAppStore';
import type { ChapterModule, Reference } from '@/types/content';
import { Panel, Eyebrow, Chip, ConfidenceChip, ObjectiveTags, Reveal, Rich, LoadingState, ErrorState, EmptyState, ProgressBar, Disclaimer, TextField } from '@/components/ui';
import { KnowledgeCheck } from '@/components/ui/KnowledgeCheck';
import { pad2 } from '@/lib/format';
import { useChapterModule } from './useChapterModule';

const SECTIONS = [
  { id: 'concept', label: 'Concept' },
  { id: 'diagram', label: 'Animated Diagram' },
  { id: 'example', label: 'Real-World Example' },
  { id: 'simulator', label: 'Interactive Simulator' },
  { id: 'misconception', label: 'Common Misconception' },
  { id: 'professional', label: 'Professional Explanation' },
  { id: 'check', label: 'Knowledge Check' },
  { id: 'case', label: 'Case Study' },
  { id: 'terms', label: 'Key Terminology' },
  { id: 'references', label: 'Legal & Tax References' },
  { id: 'takeaways', label: 'Key Takeaways' },
] as const;
type SectionId = (typeof SECTIONS)[number]['id'];

const REF_TONE: Record<Reference['type'], 'gold' | 'green' | 'amber' | 'red' | 'blue' | 'violet' | undefined> = {
  statute: 'gold', regulation: 'gold', guidance: 'green', case: 'violet', research: 'blue', book: 'blue', publication: 'blue', video: undefined, interview: undefined, social: 'amber',
};

export default function ChapterPage() {
  const { slug } = useParams();
  const meta = slug ? chapterBySlug(slug) : undefined;
  const { state, retry } = useChapterModule(meta?.id);

  if (!meta) {
    return (
      <div className="page container">
        <ErrorState title="Chapter not found" body={<>No chapter has the address <code className="mono">/academy/{slug}</code>.</>} />
        <div style={{ marginTop: 16 }}><Link to="/academy" className="btn">Back to the Academy</Link></div>
      </div>
    );
  }

  if (state.status === 'loading') {
    return (
      <div className="page container">
        <Eyebrow>Chapter {pad2(meta.number)}</Eyebrow>
        <h1 style={{ fontSize: 'clamp(2rem,4vw,3.4rem)', margin: '8px 0 24px' }}>{meta.title}</h1>
        <LoadingState lines={6} />
      </div>
    );
  }
  if (state.status === 'error') {
    return (
      <div className="page container">
        <ErrorState title={`Chapter ${pad2(meta.number)} failed to load`} body={state.error} retry={retry} />
      </div>
    );
  }
  return <ChapterView key={meta.id} mod={state.data} />;
}

function ChapterView({ mod }: { mod: ChapterModule }) {
  const { content, Diagram, Simulator } = mod;
  const id = content.id;
  const markVisited = useAppStore((s) => s.markVisited);
  const markCompleted = useAppStore((s) => s.markCompleted);
  const progress = useAppStore((s) => s.progress[id]);
  const bookmarked = useAppStore((s) => s.bookmarks.includes(id));
  const toggleBookmark = useAppStore((s) => s.toggleBookmark);
  const note = useAppStore((s) => s.notes[id] ?? '');
  const setNote = useAppStore((s) => s.setNote);
  const [notesOpen, setNotesOpen] = useState(false);
  const [active, setActive] = useState<SectionId>('concept');

  useEffect(() => { markVisited(id); }, [id, markVisited]);

  // Track which section is in view for the rail.
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(`sec-${s.id}`)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id.replace('sec-', '') as SectionId);
    }, { rootMargin: '-25% 0px -60% 0px', threshold: 0 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [id]);

  const idx = CHAPTERS.findIndex((c) => c.id === id);
  const prev = idx > 0 ? CHAPTERS[idx - 1] : undefined;
  const next = idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1] : undefined;
  const isStub = content.concept.length === 0;
  const activeIndex = SECTIONS.findIndex((s) => s.id === active);

  return (
    <div className="page container">
      {/* HEADER */}
      <header className="acad-head fade-up" style={{ marginBottom: 40 }}>
        <div className="acad-num">{pad2(content.number)}</div>
        <div className="stack" style={{ gap: 14 }}>
          <div className="row between" style={{ alignItems: 'flex-start' }}>
            <div className="row" style={{ gap: 10 }}>
              <Link to="/academy" className="tiny muted" style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>← Academy</Link>
              <span className="tiny muted mono">{content.duration}</span>
              {progress?.completed && <Chip tone="green">Complete{typeof progress.score === 'number' ? ` · ${Math.round(progress.score * 100)}%` : ''}</Chip>}
            </div>
            <div className="row" style={{ gap: 6 }}>
              <button className={`btn sm ${bookmarked ? 'active' : 'ghost'}`} onClick={() => toggleBookmark(id)} aria-pressed={bookmarked} title="Bookmark this chapter">{bookmarked ? '★ Bookmarked' : '☆ Bookmark'}</button>
              <button className={`btn sm ${note.trim() ? 'active' : 'ghost'}`} onClick={() => setNotesOpen(true)} title="Open your notes for this chapter">✎ Notes{note.trim() ? ' ·' : ''}</button>
            </div>
          </div>
          <h1 style={{ fontSize: 'clamp(2.1rem, 4.4vw, 3.8rem)' }}>{content.title}</h1>
          {content.subtitle && <p className="lede" style={{ margin: 0, maxWidth: 760 }}>{content.subtitle}</p>}
          {content.hook && <p className="acad-hook" style={{ margin: '6px 0 0' }}>“{content.hook}”</p>}
          <ObjectiveTags objectives={content.objectives} />
        </div>
      </header>

      {isStub && (
        <Panel tone="warn" style={{ marginBottom: 28 }}>
          <Eyebrow>Content in production</Eyebrow>
          <p style={{ margin: '6px 0 0' }}>This chapter's material is still being written. The page structure below is final; the sections fill in as the chapter lands.</p>
        </Panel>
      )}

      <div className="acad-chapter">
        {/* RAIL */}
        <nav className="acad-rail" aria-label="Chapter sections">
          {SECTIONS.map((s, i) => (
            <a key={s.id} href={`#sec-${s.id}`} className={active === s.id ? 'active' : ''} onClick={(e) => { e.preventDefault(); document.getElementById(`sec-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
              <span className="idx">{pad2(i + 1)}</span>{s.label}
            </a>
          ))}
          <div className="acad-rail-progress stack" style={{ gap: 8 }}>
            <span className="tiny muted" style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>Reading position</span>
            <ProgressBar value={(activeIndex + 1) / SECTIONS.length} height={3} />
            {!progress?.completed && <button className="btn sm ghost" onClick={() => markCompleted(id)} style={{ marginTop: 6 }}>Mark chapter complete</button>}
          </div>
        </nav>

        {/* BODY */}
        <div className="acad-body">
          <Section id="concept" n={1} label="Concept" title="What this chapter is really about">
            {content.concept.length ? (
              <div className="acad-prose">{content.concept.map((p, i) => <Reveal key={i} delay={Math.min(i * 0.04, 0.2)}><Rich text={p} /></Reveal>)}</div>
            ) : <EmptyState title="Concept in production" />}
          </Section>

          <Section id="diagram" n={2} label="Animated Diagram" title="See the mechanism move">
            <Panel>
              <Suspense fallback={<LoadingState />}><Diagram /></Suspense>
            </Panel>
          </Section>

          <Section id="example" n={3} label="Real-World Example" title={content.realWorldExample.title || 'A worked scenario'}>
            {content.realWorldExample.body.length ? (
              <Panel className="acad-prose">{content.realWorldExample.body.map((p, i) => <Rich key={i} text={p} />)}</Panel>
            ) : <EmptyState title="Example in production" />}
          </Section>

          <Section id="simulator" n={4} label="Interactive Simulator" title="Change the inputs, watch the structure respond">
            <Panel tone="gold">
              <Suspense fallback={<LoadingState />}><Simulator /></Suspense>
            </Panel>
          </Section>

          <Section id="misconception" n={5} label="Common Misconception" title="What people get wrong">
            {content.misconception.claim ? (
              <div className="acad-misc">
                <Panel tone="danger">
                  <div className="row between" style={{ marginBottom: 10 }}><Eyebrow className="red">The claim</Eyebrow><ConfidenceChip level={content.misconception.confidence} /></div>
                  <p className="display" style={{ fontSize: '1.3rem', fontStyle: 'italic', color: 'var(--ivory)', margin: 0, lineHeight: 1.4 }}>“{content.misconception.claim}”</p>
                </Panel>
                <Panel tone="green">
                  <Eyebrow className="green">The reality</Eyebrow>
                  <div style={{ marginTop: 10 }}><Rich text={content.misconception.reality} /></div>
                </Panel>
              </div>
            ) : <EmptyState title="Misconception in production" />}
          </Section>

          <Section id="professional" n={6} label="Professional Explanation" title="How an adviser would frame it">
            {content.professionalExplanation.length ? (
              <Panel className="acad-prose" style={{ borderLeft: '2px solid var(--gold)' }}>
                {content.professionalExplanation.map((p, i) => <Rich key={i} text={p} />)}
              </Panel>
            ) : <EmptyState title="Professional explanation in production" />}
          </Section>

          <Section id="check" n={7} label="Knowledge Check" title="Prove it to yourself">
            {content.knowledgeCheck.length ? (
              <KnowledgeCheck questions={content.knowledgeCheck} onComplete={(score) => markCompleted(id, score)} />
            ) : <EmptyState title="Knowledge check in production" />}
          </Section>

          <Section id="case" n={8} label="Case Study" title={content.caseStudy.title || 'A family, start to finish'}>
            {content.caseStudy.situation ? (
              <Panel>
                <div className="row" style={{ gap: 8, marginBottom: 14 }}><Chip tone="gold">Fictional family</Chip><span className="display" style={{ fontSize: '1.2rem' }}>{content.caseStudy.family}</span></div>
                <div className="grid grid-2" style={{ gap: 18 }}>
                  <CaseBlock label="Situation" text={content.caseStudy.situation} />
                  <CaseBlock label="Structure" text={content.caseStudy.structure} />
                  <CaseBlock label="Outcome" text={content.caseStudy.outcome} />
                  <CaseBlock label="Lesson" text={content.caseStudy.lesson} gold />
                </div>
              </Panel>
            ) : <EmptyState title="Case study in production" />}
          </Section>

          <Section id="terms" n={9} label="Key Terminology" title="Words that must mean one thing">
            {content.terminology.length ? (
              <dl className="acad-dl">
                {content.terminology.map((t) => (
                  <div key={t.term}><dt>{t.term}</dt><dd>{t.definition}</dd></div>
                ))}
              </dl>
            ) : <EmptyState title="Terminology in production" />}
          </Section>

          <Section id="references" n={10} label="Legal & Tax References" title="Where this comes from">
            {content.references.length ? (
              <div className="acad-refs">
                {content.references.map((r, i) => (
                  <div key={i} className="acad-ref">
                    <Chip tone={REF_TONE[r.type]}>{r.type}</Chip>
                    <div className="stack" style={{ gap: 2 }}>
                      <div style={{ color: 'var(--ivory)' }}>{r.url ? <a href={r.url} target="_blank" rel="noreferrer">{r.title} ↗</a> : r.title}</div>
                      <div className="row" style={{ gap: 10 }}>
                        {r.citation && <span className="mono small gold">{r.citation}</span>}
                        <span className="tiny muted" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>{r.jurisdiction}</span>
                      </div>
                      {r.note && <p className="small muted" style={{ margin: '4px 0 0' }}>{r.note}</p>}
                    </div>
                  </div>
                ))}
                <Disclaimer>References are cited for study. Numbering, thresholds and interpretations change; verify the current text before relying on any of them.</Disclaimer>
              </div>
            ) : <EmptyState title="References in production" />}
          </Section>

          <Section id="takeaways" n={11} label="Key Takeaways" title="Carry these forward">
            {content.takeaways.length ? (
              <ol className="acad-takeaways">{content.takeaways.map((t, i) => <Rich key={i} as="li" text={t} />)}</ol>
            ) : <EmptyState title="Takeaways in production" />}
            <div className="row between" style={{ marginTop: 24 }}>
              <span className="small muted">{progress?.completed ? 'Chapter marked complete.' : 'Finish the knowledge check, or mark this chapter complete manually.'}</span>
              {!progress?.completed && <button className="btn" onClick={() => markCompleted(id)}>Mark complete</button>}
            </div>
          </Section>

          {/* FOOTER NAV */}
          <div className="acad-footnav">
            {prev ? (
              <Link to={`/academy/${prev.slug}`} className="panel tight">
                <span className="tiny muted" style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>← Previous · Chapter {pad2(prev.number)}</span>
                <div className="display" style={{ fontSize: '1.3rem', marginTop: 6 }}>{prev.title}</div>
              </Link>
            ) : <Link to="/academy" className="panel tight"><span className="tiny muted" style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>← Academy</span><div className="display" style={{ fontSize: '1.3rem', marginTop: 6 }}>Chapter list</div></Link>}
            {next ? (
              <Link to={`/academy/${next.slug}`} className="panel tight acad-next">
                <span className="tiny muted" style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>Next · Chapter {pad2(next.number)} →</span>
                <div className="display" style={{ fontSize: '1.3rem', marginTop: 6 }}>{next.title}</div>
              </Link>
            ) : <Link to="/cases" className="panel tight acad-next"><span className="tiny muted" style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>Continue →</span><div className="display" style={{ fontSize: '1.3rem', marginTop: 6 }}>Case Studies</div></Link>}
          </div>
        </div>
      </div>

      {/* NOTES DRAWER */}
      {notesOpen && (
        <>
          <div onClick={() => setNotesOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 89, background: 'rgba(0,0,0,0.45)' }} />
          <aside className="acad-drawer" role="dialog" aria-label="Chapter notes">
            <div className="row between">
              <div><Eyebrow>Notes · Chapter {pad2(content.number)}</Eyebrow><div className="display" style={{ fontSize: '1.2rem' }}>{content.title}</div></div>
              <button className="btn sm ghost" onClick={() => setNotesOpen(false)} aria-label="Close notes">✕</button>
            </div>
            <TextField multiline rows={14} value={note} onChange={(v) => setNote(id, v)} placeholder="What surprised you, what you disagree with, what you would ask an adviser. Notes are stored on this device." />
            <div className="row between">
              <span className="tiny muted mono">{note.length} chars · saved automatically</span>
              <Link to="/academy/notes" className="btn sm ghost">All notes →</Link>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

function Section({ id, n, label, title, children }: { id: SectionId; n: number; label: string; title: ReactNode; children: ReactNode }) {
  return (
    <section id={`sec-${id}`} className="acad-section">
      <Reveal>
        <div className="acad-section-head">
          <span className="acad-sec-idx">{pad2(n)}</span>
          <div className="stack" style={{ gap: 4 }}>
            <Eyebrow>{label}</Eyebrow>
            <h3>{title}</h3>
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.05}>{children}</Reveal>
    </section>
  );
}

function CaseBlock({ label, text, gold }: { label: string; text: string; gold?: boolean }) {
  return (
    <div className="stack" style={{ gap: 6 }}>
      <Eyebrow className={gold ? '' : 'muted'}>{label}</Eyebrow>
      <Rich text={text} className={gold ? '' : 'small'} />
    </div>
  );
}
