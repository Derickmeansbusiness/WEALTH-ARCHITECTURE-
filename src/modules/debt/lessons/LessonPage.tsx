import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DEBT_LESSONS, lessonByNumber } from '@/content/debt/lessons';
import { DEBT_JURISDICTION_LABELS } from '@/content/debt/types';
import { useAppStore } from '@/store/useAppStore';
import { Callout, Chip, ConfidenceChip, Disclaimer, EmptyState, ObjectiveTags, Panel, Rich, Reveal } from '@/components/ui';
import { KnowledgeCheck } from '@/components/ui/KnowledgeCheck';
import ErrorBoundary from '../shell/ErrorBoundary';
import { JurisdictionSelect, STUDIO_BASE } from '../shell/StudioShell';

export default function LessonPage() {
  const { n } = useParams();
  const num = Number(n);
  const lesson = lessonByNumber(num);
  const markVisited = useAppStore((s) => s.markVisited);
  const markCompleted = useAppStore((s) => s.markCompleted);
  const progress = useAppStore((s) => (lesson ? s.progress[lesson.id] : undefined));
  const mode = useAppStore((s) => s.jurisdictionMode);
  const [active, setActive] = useState<string>('');

  const anchors = useMemo(() => lesson ? [...lesson.sections.map((s) => ({ id: s.id, label: s.heading })), { id: 'terms', label: 'Key terms' }, { id: 'misconception', label: 'Misconception' }, { id: 'check', label: 'Knowledge check' }, { id: 'jurisdiction', label: 'Jurisdiction notes' }, { id: 'references', label: 'References' }] : [], [lesson]);

  useEffect(() => { if (lesson) markVisited(lesson.id); }, [lesson, markVisited]);
  useEffect(() => {
    if (!lesson) return;
    const els = anchors.map((a) => document.getElementById(`sec-${a.id}`)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis[0]) setActive(vis[0].target.id.replace('sec-', ''));
    }, { rootMargin: '-30% 0px -55% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [lesson, anchors]);

  if (!lesson) {
    return <div className="container ds-page"><EmptyState title={`There is no Lesson ${n}`} body="The curriculum has nine lessons." action={<Link className="btn" to={`${STUDIO_BASE}/lessons`}>All lessons</Link>} /></div>;
  }
  const prev = lessonByNumber(num - 1), next = lessonByNumber(num + 1);
  const jn = lesson.jurisdictionNotes[mode];

  return (
    <div className="container ds-page">
      <div className="ds-page-head stack fade-up" style={{ gap: 12 }}>
        <div className="row between">
          <Link to={`${STUDIO_BASE}/lessons`} className="tiny muted">← All lessons</Link>
          <div className="row" style={{ gap: 8 }}>
            <span className="tiny muted mono">{lesson.duration}</span>
            {progress?.completed && <Chip tone="green">Complete{progress.score !== undefined ? ` · ${Math.round(progress.score * 100)}%` : ''}</Chip>}
          </div>
        </div>
        <div className="eyebrow">Lesson {String(lesson.number).padStart(2, '0')} of {DEBT_LESSONS.length}</div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 4.6vw, 3.8rem)' }}>{lesson.title}</h1>
        <p className="lede" style={{ maxWidth: 820 }}>{lesson.subtitle}</p>
        <ObjectiveTags objectives={lesson.objectives} />
        <Panel tone="gold" tight style={{ maxWidth: 820 }}><p className="display" style={{ fontSize: '1.25rem', margin: 0, fontStyle: 'italic', color: 'var(--ivory)' }}>{lesson.hook}</p></Panel>
      </div>

      <div className="ds-lesson-layout">
        <aside className="ds-lesson-side" aria-label="Lesson contents">
          {anchors.map((a) => <a key={a.id} href={`#sec-${a.id}`} className={`ds-side-link ${active === a.id ? 'active' : ''}`}>{a.label}</a>)}
        </aside>

        <article>
          {lesson.sections.map((s, i) => (
            <section key={s.id} id={`sec-${s.id}`} className="ds-section">
              <div className="row" style={{ gap: 12, marginBottom: 6 }}><span className="mono gold small">{String(i + 1).padStart(2, '0')}</span><h3 style={{ margin: 0 }}>{s.heading}</h3></div>
              {s.body.map((p, j) => <Rich key={j} text={p} />)}
              {s.Visual && <Reveal><div className="ds-visual"><ErrorBoundary title="Visual failed to render"><s.Visual /></ErrorBoundary></div></Reveal>}
              {s.Interactive && <Reveal><div className="ds-visual"><ErrorBoundary title="Interactive failed to render"><s.Interactive /></ErrorBoundary></div></Reveal>}
              {s.callouts?.map((c, k) => <Callout key={k} tone={c.tone} title={c.title}><p style={{ margin: 0 }}>{c.body}</p></Callout>)}
            </section>
          ))}

          <section id="sec-terms" className="ds-section">
            <h3>Key terms</h3>
            <div className="ds-terms">{lesson.keyTerms.map((t) => <div key={t.term} className="ds-term"><div className="t">{t.term}</div><div className="d">{t.definition}</div></div>)}</div>
          </section>

          <section id="sec-misconception" className="ds-section">
            <h3>The misconception</h3>
            <Panel tone="danger">
              <div className="row between" style={{ marginBottom: 10 }}><span className="eyebrow red">Commonly claimed</span><ConfidenceChip level={lesson.misconception.confidence} /></div>
              <p className="display" style={{ fontSize: '1.3rem', color: 'var(--ivory)' }}>{lesson.misconception.claim}</p>
              <p style={{ margin: 0 }}><strong>Reality:</strong> {lesson.misconception.reality}</p>
            </Panel>
          </section>

          <section id="sec-check" className="ds-section">
            <div className="row between" style={{ marginBottom: 14 }}><h3 style={{ margin: 0 }}>Knowledge check</h3><span className="tiny muted">{lesson.knowledgeCheck.length} questions · completing records your score</span></div>
            <KnowledgeCheck questions={lesson.knowledgeCheck} onComplete={(score) => markCompleted(lesson.id, score)} />
          </section>

          <section id="sec-jurisdiction" className="ds-section">
            <div className="row between" style={{ marginBottom: 14 }}>
              <h3 style={{ margin: 0 }}>Jurisdiction notes</h3>
              <JurisdictionSelect />
            </div>
            <Panel tone={jn.verified ? 'green' : 'warn'}>
              <div className="row between" style={{ marginBottom: 10 }}>
                <span className="display" style={{ fontSize: '1.2rem' }}>{DEBT_JURISDICTION_LABELS[mode]}</span>
                {jn.verified ? <Chip tone="green">Reviewed</Chip> : <Chip tone="amber">Not yet jurisdictionally verified</Chip>}
              </div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>{jn.notes.map((t, i) => <li key={i} className="small" style={{ marginBottom: 6 }}>{t}</li>)}</ul>
              <p className="tiny muted" style={{ margin: '12px 0 0' }}>Compare all four jurisdictions on the <Link to={`${STUDIO_BASE}/jurisdictions`}>Jurisdictions page</Link>.</p>
            </Panel>
            <div style={{ marginTop: 12 }}><Disclaimer /></div>
          </section>

          <section id="sec-references" className="ds-section">
            <h3>References</h3>
            <div className="stack" style={{ gap: 8 }}>
              {lesson.references.map((r, i) => (
                <div key={i} className="row" style={{ gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                  <Chip>{r.type}</Chip>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ color: 'var(--ivory)' }}>{r.url ? <a href={r.url} target="_blank" rel="noreferrer">{r.title}</a> : r.title}</div>
                    <div className="tiny muted">{r.jurisdiction}{r.citation ? ` · ${r.citation}` : ''}{r.note ? ` · ${r.note}` : ''}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="tiny muted" style={{ marginTop: 12 }}>Full studio bibliography on the <Link to={`${STUDIO_BASE}/sources`}>Sources page</Link> · <Link to="/sources">Source Vault</Link> · <Link to="/claims">Claim Checker</Link></p>
          </section>

          <div className="row between" style={{ marginTop: 28 }}>
            {prev ? <Link to={`${STUDIO_BASE}/lessons/${prev.number}`} className="btn">← {String(prev.number).padStart(2, '0')} {prev.title}</Link> : <Link to={STUDIO_BASE} className="btn ghost">← Studio</Link>}
            {next ? <Link to={`${STUDIO_BASE}/lessons/${next.number}`} className="btn primary">{String(next.number).padStart(2, '0')} {next.title} →</Link> : <Link to={`${STUDIO_BASE}/cases`} className="btn primary">Continue to the cases →</Link>}
          </div>
        </article>
      </div>
    </div>
  );
}
