import { Link } from 'react-router-dom';
import { CHAPTERS, chapterById } from '@/content/chapters/manifest';
import { useAppStore } from '@/store/useAppStore';
import { COMPONENT_META } from '@/types/structure';
import { Eyebrow, Panel, Chip, EmptyState, Reveal, TextField } from '@/components/ui';
import { pad2 } from '@/lib/format';

function PageHead({ eyebrow, title, lede }: { eyebrow: string; title: string; lede: string }) {
  return (
    <Reveal>
      <div className="stack" style={{ gap: 12, marginBottom: 28 }}>
        <Link to="/academy" className="tiny muted" style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>← Academy</Link>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 style={{ fontSize: 'clamp(2.2rem,4.5vw,3.8rem)' }}>{title}</h1>
        <p className="lede" style={{ maxWidth: 720 }}>{lede}</p>
      </div>
    </Reveal>
  );
}

export function BookmarksPage() {
  const bookmarks = useAppStore((s) => s.bookmarks);
  const toggle = useAppStore((s) => s.toggleBookmark);
  const progress = useAppStore((s) => s.progress);
  const chapters = CHAPTERS.filter((c) => bookmarks.includes(c.id));
  const other = bookmarks.filter((b) => !chapterById(b));
  return (
    <div className="page container">
      <PageHead eyebrow={`Bookmarks · ${bookmarks.length}`} title="Flagged to return to" lede="Chapters you marked while reading. Bookmarks live on this device only." />
      {bookmarks.length === 0 ? (
        <EmptyState title="No bookmarks yet" body="Open any chapter and press ☆ Bookmark in the header." action={<Link to="/academy" className="btn">Browse chapters</Link>} />
      ) : (
        <div className="stack" style={{ gap: 10 }}>
          {chapters.map((c, i) => {
            const p = progress[c.id];
            return (
              <Reveal key={c.id} delay={i * 0.04}>
                <Panel tight>
                  <div className="row between">
                    <Link to={`/academy/${c.slug}`} className="row" style={{ gap: 14, color: 'inherit' }}>
                      <span className="mono gold">{pad2(c.number)}</span>
                      <span className="display" style={{ fontSize: '1.3rem' }}>{c.title}</span>
                      {p?.completed ? <Chip tone="green">Complete</Chip> : p?.visited ? <Chip tone="gold">In progress</Chip> : <span className="tiny muted mono">{c.duration}</span>}
                    </Link>
                    <button className="btn sm ghost" onClick={() => toggle(c.id)}>Remove</button>
                  </div>
                </Panel>
              </Reveal>
            );
          })}
          {other.map((b) => (
            <Panel key={b} tight><div className="row between"><span className="mono small">{b}</span><button className="btn sm ghost" onClick={() => toggle(b)}>Remove</button></div></Panel>
          ))}
        </div>
      )}
    </div>
  );
}

export function NotesPage() {
  const notes = useAppStore((s) => s.notes);
  const setNote = useAppStore((s) => s.setNote);
  const entries = Object.entries(notes).filter(([, v]) => v && v.trim().length > 0);
  const chapterEntries = CHAPTERS.filter((c) => entries.some(([k]) => k === c.id));
  const otherEntries = entries.filter(([k]) => !chapterById(k));
  return (
    <div className="page container">
      <PageHead eyebrow={`Notes · ${entries.length}`} title="Your margin notes" lede="Everything you wrote in the notes drawer, editable here. Notes are stored on this device and never leave it." />
      {entries.length === 0 ? (
        <EmptyState title="No notes yet" body="Open a chapter and press ✎ Notes to start writing." action={<Link to="/academy" className="btn">Browse chapters</Link>} />
      ) : (
        <div className="stack" style={{ gap: 14 }}>
          {chapterEntries.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.04}>
              <Panel>
                <div className="row between" style={{ marginBottom: 12 }}>
                  <Link to={`/academy/${c.slug}`} className="row" style={{ gap: 12, color: 'inherit' }}>
                    <span className="mono gold">{pad2(c.number)}</span>
                    <span className="display" style={{ fontSize: '1.25rem' }}>{c.title}</span>
                  </Link>
                  <button className="btn sm ghost" onClick={() => setNote(c.id, '')}>Clear</button>
                </div>
                <TextField multiline rows={5} value={notes[c.id] ?? ''} onChange={(v) => setNote(c.id, v)} />
              </Panel>
            </Reveal>
          ))}
          {otherEntries.map(([k, v]) => (
            <Panel key={k}>
              <div className="row between" style={{ marginBottom: 12 }}><span className="mono small">{k}</span><button className="btn sm ghost" onClick={() => setNote(k, '')}>Clear</button></div>
              <TextField multiline rows={4} value={v} onChange={(t) => setNote(k, t)} />
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}

export function SavedPage() {
  const structures = useAppStore((s) => s.structures);
  const remove = useAppStore((s) => s.deleteStructure);
  const sorted = [...structures].sort((a, b) => b.updatedAt - a.updatedAt);
  return (
    <div className="page container">
      <PageHead eyebrow={`Saved structures · ${structures.length}`} title="Architectures you have built" lede="Structures saved from the Structure Lab. Reopen one to keep designing, or review how many entities, people and relationships it holds." />
      {sorted.length === 0 ? (
        <EmptyState title="Nothing saved yet" body="Build an ownership architecture in the Structure Lab and save it; it appears here." action={<Link to="/lab" className="btn primary">Open the Structure Lab</Link>} />
      ) : (
        <div className="grid grid-2">
          {sorted.map((st, i) => {
            const kinds = new Map<string, number>();
            for (const n of st.nodes) kinds.set(n.kind, (kinds.get(n.kind) ?? 0) + 1);
            const top = [...kinds.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
            return (
              <Reveal key={st.id} delay={(i % 2) * 0.05}>
                <Panel style={{ height: '100%' }}>
                  <div className="row between" style={{ alignItems: 'flex-start' }}>
                    <div className="stack" style={{ gap: 4 }}>
                      <div className="display" style={{ fontSize: '1.4rem' }}>{st.name || 'Untitled structure'}</div>
                      <span className="tiny muted mono">Updated {new Date(st.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <button className="btn sm ghost danger" onClick={() => { if (window.confirm(`Delete "${st.name}"?`)) remove(st.id); }}>Delete</button>
                  </div>
                  {st.description && <p className="small muted" style={{ margin: '10px 0 0' }}>{st.description}</p>}
                  <div className="row" style={{ gap: 14, marginTop: 14 }}>
                    <div className="stat" style={{ flex: 1 }}><span className="label">Nodes</span><span className="value">{st.nodes.length}</span></div>
                    <div className="stat" style={{ flex: 1 }}><span className="label">Relationships</span><span className="value">{st.edges.length}</span></div>
                  </div>
                  <div className="row" style={{ gap: 6, marginTop: 12 }}>
                    {top.map(([k, n]) => <Chip key={k}>{COMPONENT_META[k as keyof typeof COMPONENT_META]?.label ?? k} × {n}</Chip>)}
                  </div>
                  <div className="row" style={{ gap: 8, marginTop: 16 }}>
                    <Link to={`/lab?structure=${encodeURIComponent(st.id)}`} className="btn sm">Open in Structure Lab</Link>
                    <Link to={`/map?structure=${encodeURIComponent(st.id)}`} className="btn sm ghost">View on map</Link>
                  </div>
                </Panel>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
