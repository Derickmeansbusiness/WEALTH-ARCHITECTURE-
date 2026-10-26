import { Link } from 'react-router-dom';
import { CHAPTERS } from '@/content/chapters/manifest';
import { useAppStore } from '@/store/useAppStore';
import { Eyebrow, Panel, ProgressBar, Chip, Reveal, SectionHeader, ObjectiveLegend } from '@/components/ui';
import { pad2 } from '@/lib/format';

const PHASES: { from: number; to: number; label: string }[] = [
  { from: 1, to: 2, label: 'Foundations' },
  { from: 3, to: 5, label: 'Control & Structure' },
  { from: 6, to: 8, label: 'Capital Systems' },
  { from: 9, to: 12, label: 'Tax & Protection' },
  { from: 13, to: 15, label: 'Generations' },
];

export default function AcademyIndex() {
  const progress = useAppStore((s) => s.progress);
  const bookmarks = useAppStore((s) => s.bookmarks);
  const notes = useAppStore((s) => s.notes);
  const structures = useAppStore((s) => s.structures);

  const completed = CHAPTERS.filter((c) => progress[c.id]?.completed).length;
  const visited = CHAPTERS.filter((c) => progress[c.id]?.visited && !progress[c.id]?.completed).length;
  const next = CHAPTERS.find((c) => !progress[c.id]?.completed) ?? CHAPTERS[0];
  const totalMinutes = CHAPTERS.reduce((s, c) => s + (parseInt(c.duration, 10) || 0), 0);
  const scores = CHAPTERS.map((c) => progress[c.id]?.score).filter((s): s is number => typeof s === 'number');
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  const noteCount = Object.values(notes).filter((n) => n && n.trim().length > 0).length;

  const quick = [
    { to: '/academy/glossary', title: 'Glossary', body: 'Every defined term across all chapters.', count: null as number | null },
    { to: '/academy/bookmarks', title: 'Bookmarks', body: 'Chapters you flagged to return to.', count: bookmarks.length },
    { to: '/academy/notes', title: 'Notes', body: 'Your own margin notes per chapter.', count: noteCount },
    { to: '/academy/saved', title: 'Saved Structures', body: 'Architectures built in the Structure Lab.', count: structures.length },
    { to: '/cases', title: 'Case Studies', body: 'Five fictional families, start to finish.', count: null },
  ];

  return (
    <div className="page container">
      <Reveal>
        <section className="acad-hero">
          <div className="acad-hero-grid">
            <div className="stack" style={{ gap: 18 }}>
              <Eyebrow>Learning Mode · 15 chapters · {Math.round(totalMinutes / 60 * 10) / 10} hours</Eyebrow>
              <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4.2rem)' }}>The Academy</h1>
              <p className="lede" style={{ maxWidth: 640 }}>
                One architecture, built in sequence. Each chapter adds a layer: first the balance sheet, then the engines that feed it, then the ownership, financing, entity, trust and governance layers that let a family hold it for a century. Work through them in order; later chapters assume the earlier vocabulary.
              </p>
              <div className="row" style={{ gap: 10 }}>
                <Link to={`/academy/${next.slug}`} className="btn primary">
                  {completed === 0 ? 'Begin Chapter 01' : completed === CHAPTERS.length ? 'Review from Chapter 01' : `Resume · Chapter ${pad2(next.number)}`}
                </Link>
                <Link to="/academy/glossary" className="btn ghost">Glossary</Link>
                <Link to="/map" className="btn ghost">Architecture Map →</Link>
              </div>
            </div>
            <div className="stack" style={{ gap: 14 }}>
              <div className="row between">
                <span className="eyebrow">Overall progress</span>
                <span className="mono small gold">{Math.round((completed / CHAPTERS.length) * 100)}%</span>
              </div>
              <ProgressBar value={completed / CHAPTERS.length} height={8} />
              <div className="grid grid-3" style={{ gap: 10 }}>
                <div className="stat"><span className="label">Complete</span><span className="value">{completed}<span className="muted" style={{ fontSize: '0.8rem' }}>/{CHAPTERS.length}</span></span></div>
                <div className="stat"><span className="label">In progress</span><span className="value">{visited}</span></div>
                <div className="stat"><span className="label">Avg score</span><span className="value">{avgScore === null ? '—' : `${Math.round(avgScore * 100)}%`}</span></div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <section className="section">
        <Reveal>
          <SectionHeader eyebrow="Quick access" title="Your working materials" />
        </Reveal>
        <div className="acad-quick">
          {quick.map((q, i) => (
            <Reveal key={q.to} delay={i * 0.05}>
              <Link to={q.to} className="panel tight">
                <div className="row between">
                  <span className="eyebrow">{q.title}</span>
                  {q.count !== null && <span className="mono small gold">{q.count}</span>}
                </div>
                <p className="small muted" style={{ margin: '8px 0 0' }}>{q.body}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section">
        <Reveal>
          <SectionHeader
            eyebrow="The sequence"
            title="Fifteen chapters, one architecture"
            lede="Read top to bottom. The connector line is the order the system is actually built in: you cannot sensibly discuss trusts before ownership, or offshore protection before entities."
          />
        </Reveal>
        <div className="acad-timeline">
          {CHAPTERS.map((c, i) => {
            const p = progress[c.id];
            const done = !!p?.completed;
            const isNext = c.id === next.id && !done;
            const phase = PHASES.find((ph) => ph.from === c.number);
            return (
              <div key={c.id}>
                {phase && (
                  <Reveal>
                    <div className="row" style={{ gap: 12, padding: '18px 0 6px' }}>
                      <span className="eyebrow" style={{ color: 'var(--ivory-3)' }}>Phase · {phase.label}</span>
                      <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
                    </div>
                  </Reveal>
                )}
                <Reveal delay={Math.min(i * 0.03, 0.3)}>
                  <div className="acad-timeline-item">
                    <div className="acad-timeline-rail">
                      <div className={`acad-node ${done ? 'done' : isNext ? 'next' : p?.visited ? 'visited' : ''}`} aria-label={done ? 'Complete' : isNext ? 'Up next' : p?.visited ? 'In progress' : 'Not started'}>
                        {done ? '✓' : pad2(c.number)}
                      </div>
                      <div className={`acad-conn ${done ? 'done' : ''}`} />
                    </div>
                    <Link to={`/academy/${c.slug}`} className={`acad-timeline-card ${isNext ? 'next' : ''}`}>
                      <div className="stack" style={{ gap: 4 }}>
                        <div className="row" style={{ gap: 10 }}>
                          <span className="mono tiny gold">Chapter {pad2(c.number)}</span>
                          <span className="tiny muted mono">{c.duration}</span>
                        </div>
                        <div className="display" style={{ fontSize: '1.45rem', lineHeight: 1.15 }}>{c.title}</div>
                      </div>
                      <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
                        {done ? (
                          <Chip tone="green">Complete{typeof p?.score === 'number' ? ` · ${Math.round(p.score * 100)}%` : ''}</Chip>
                        ) : p?.visited ? (
                          <Chip tone="gold">In progress</Chip>
                        ) : isNext ? (
                          <Chip tone="gold">Up next</Chip>
                        ) : (
                          <Chip>Not started</Chip>
                        )}
                        {bookmarks.includes(c.id) && <Chip tone="blue" title="Bookmarked">★</Chip>}
                      </div>
                    </Link>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section">
        <Reveal>
          <Panel tone="gold">
            <div className="stack" style={{ gap: 14 }}>
              <Eyebrow>Keep these six apart</Eyebrow>
              <p className="lede" style={{ margin: 0 }}>Every chapter tags which of the six objectives it serves. They overlap in practice and are never the same thing: a move that helps asset protection can hurt estate planning, and a move that helps privacy can be irrelevant to tax.</p>
              <ObjectiveLegend />
            </div>
          </Panel>
        </Reveal>
      </section>
    </div>
  );
}
