import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CHAPTERS, chapterById } from '@/content/chapters/manifest';
import { Eyebrow, LoadingState, EmptyState, Reveal, TextField, Chip } from '@/components/ui';
import { pad2 } from '@/lib/format';
import { useAllChapterModules } from './useChapterModule';

interface GlossRow { term: string; definition: string; chapterId: string }

export default function GlossaryPage() {
  const { modules, loading } = useAllChapterModules();
  const [q, setQ] = useState('');
  const [chapter, setChapter] = useState<string>('all');

  const rows = useMemo<GlossRow[]>(() => {
    const out: GlossRow[] = [];
    for (const c of CHAPTERS) {
      const m = modules[c.id];
      if (!m) continue;
      for (const t of m.content.terminology ?? []) if (t.term) out.push({ term: t.term, definition: t.definition, chapterId: c.id });
    }
    return out.sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }));
  }, [modules]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => (chapter === 'all' || r.chapterId === chapter) && (!needle || r.term.toLowerCase().includes(needle) || r.definition.toLowerCase().includes(needle)));
  }, [rows, q, chapter]);

  const groups = useMemo(() => {
    const map = new Map<string, GlossRow[]>();
    for (const r of filtered) {
      const letter = /^[a-z]/i.test(r.term) ? r.term[0].toUpperCase() : '#';
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(r);
    }
    return [...map.entries()];
  }, [filtered]);

  const chaptersWithTerms = CHAPTERS.filter((c) => (modules[c.id]?.content.terminology.length ?? 0) > 0);

  return (
    <div className="page container">
      <Reveal>
        <div className="stack" style={{ gap: 12, marginBottom: 28 }}>
          <Link to="/academy" className="tiny muted" style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>← Academy</Link>
          <Eyebrow>Glossary · {rows.length} terms across {chaptersWithTerms.length} chapters</Eyebrow>
          <h1 style={{ fontSize: 'clamp(2.2rem,4.5vw,3.8rem)' }}>Words that must mean one thing</h1>
          <p className="lede" style={{ maxWidth: 720 }}>Every defined term from every chapter, in one place. Precision here is the whole game: "owner", "control", "beneficiary" and "debt" each carry a legal meaning that is narrower than the everyday one.</p>
        </div>
      </Reveal>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1fr) auto', gap: 12, alignItems: 'end', marginBottom: 28 }}>
        <TextField label="Search" value={q} onChange={setQ} placeholder="Search a term or its definition…" />
        <div className="field">
          <label>Chapter</label>
          <select className="input" value={chapter} onChange={(e) => setChapter(e.target.value)}>
            <option value="all">All chapters</option>
            {chaptersWithTerms.map((c) => <option key={c.id} value={c.id}>{pad2(c.number)} · {c.title}</option>)}
          </select>
        </div>
      </div>

      {loading && rows.length === 0 ? (
        <LoadingState lines={6} />
      ) : filtered.length === 0 ? (
        <EmptyState title={rows.length === 0 ? 'No terms yet' : 'No matching terms'} body={rows.length === 0 ? 'Chapters publish their terminology as they are written.' : 'Try a shorter search, or clear the chapter filter.'} action={q || chapter !== 'all' ? <button className="btn sm" onClick={() => { setQ(''); setChapter('all'); }}>Clear filters</button> : undefined} />
      ) : (
        <div className="stack" style={{ gap: 28 }}>
          {groups.map(([letter, items]) => (
            <div key={letter} className="acad-gloss-grid">
              <div className="acad-gloss-letter">{letter}</div>
              <dl className="acad-dl">
                {items.map((r, i) => {
                  const c = chapterById(r.chapterId);
                  return (
                    <div key={`${r.chapterId}-${r.term}-${i}`}>
                      <div className="row between" style={{ alignItems: 'flex-start' }}>
                        <dt style={{ marginBottom: 6 }}>{r.term}</dt>
                        {c && <Link to={`/academy/${c.slug}#sec-terms`} title={c.title}><Chip tone="gold">Ch {pad2(c.number)}</Chip></Link>}
                      </div>
                      <dd>{r.definition}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
