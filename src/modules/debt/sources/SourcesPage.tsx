import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { STUDIO_SOURCES } from '@/content/debt/sources';
import { DEBT_LESSONS } from '@/content/debt/lessons';
import type { Confidence } from '@/types/content';
import { Chip, ConfidenceChip, EmptyState, Panel, SectionHeader } from '@/components/ui';
import { STUDIO_BASE } from '../shell/StudioShell';

const JURIS = ['All', 'US', 'UAE', 'CEMAC', 'UK', 'Multi'] as const;

export default function SourcesPage() {
  const [juris, setJuris] = useState<(typeof JURIS)[number]>('All');
  const [lesson, setLesson] = useState<string>('all');
  const [conf, setConf] = useState<'all' | Confidence>('all');
  const list = useMemo(() => STUDIO_SOURCES.filter((s) => (juris === 'All' || s.jurisdiction === juris) && (lesson === 'all' || s.usedIn.includes(lesson)) && (conf === 'all' || s.confidence === conf)), [juris, lesson, conf]);
  const byAuthority = useMemo(() => {
    const m = new Map<string, typeof list>();
    for (const s of list) m.set(s.authority, [...(m.get(s.authority) ?? []), s]);
    return [...m.entries()];
  }, [list]);
  const counts = { green: STUDIO_SOURCES.filter((s) => s.confidence === 'green').length, amber: STUDIO_SOURCES.filter((s) => s.confidence === 'amber').length };

  return (
    <div className="container ds-page">
      <SectionHeader eyebrow="Studio bibliography · last reviewed 2026-10" title="The sources behind the nine lessons" lede="Primary law and regulator guidance first; agency publications and professional references second. Each entry says which lessons rely on it and how directly it supports what they say. Amber entries are accurate as far as we know but not yet verified by counsel in that jurisdiction.">
        <div className="row" style={{ gap: 8 }}>
          <Chip tone="green">{counts.green} strongly supported</Chip>
          <Chip tone="amber">{counts.amber} jurisdiction-dependent / unverified</Chip>
          <Link to="/sources" className="btn sm">Open the Source Vault →</Link>
          <Link to="/claims" className="btn sm ghost">Claim Checker →</Link>
        </div>
      </SectionHeader>

      <Panel tight style={{ marginBottom: 20 }}>
        <div className="row" style={{ gap: 18 }}>
          <div className="row" style={{ gap: 4 }}><span className="tiny muted" style={{ marginRight: 4 }}>Jurisdiction</span>{JURIS.map((j) => <button key={j} className={`btn sm ${juris === j ? 'active' : 'ghost'}`} onClick={() => setJuris(j)}>{j === 'CEMAC' ? 'Cameroon / CEMAC' : j}</button>)}</div>
          <label className="row" style={{ gap: 6 }}><span className="tiny muted">Lesson</span>
            <select className="ds-select" value={lesson} onChange={(e) => setLesson(e.target.value)}>
              <option value="all">All lessons</option>
              {DEBT_LESSONS.map((l) => <option key={l.id} value={l.id}>{String(l.number).padStart(2, '0')} · {l.title}</option>)}
            </select>
          </label>
          <div className="row" style={{ gap: 4 }}><span className="tiny muted" style={{ marginRight: 4 }}>Confidence</span>{(['all', 'green', 'amber', 'red'] as const).map((c) => <button key={c} className={`btn sm ${conf === c ? 'active' : 'ghost'}`} onClick={() => setConf(c)}>{c === 'all' ? 'Any' : c}</button>)}</div>
        </div>
      </Panel>

      {list.length === 0 ? <EmptyState title="No sources match these filters" body="Try widening the jurisdiction or lesson filter." action={<button className="btn sm" onClick={() => { setJuris('All'); setLesson('all'); setConf('all'); }}>Reset filters</button>} /> : (
        <div className="stack" style={{ gap: 18 }}>
          {byAuthority.map(([authority, items]) => (
            <div key={authority}>
              <div className="row between" style={{ marginBottom: 8 }}><h3 style={{ fontSize: '1.3rem' }}>{authority}</h3><span className="tiny muted">{items.length} source{items.length === 1 ? '' : 's'}</span></div>
              <div className="stack" style={{ gap: 8 }}>
                {items.map((s) => (
                  <div key={s.id} className="panel tight" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 12 }}>
                    <div className="stack" style={{ gap: 6 }}>
                      <div style={{ color: 'var(--ivory)' }}>{s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.title}</a> : s.title}</div>
                      <div className="row" style={{ gap: 6 }}>
                        <Chip>{s.type}</Chip>
                        <Chip tone={s.jurisdiction === 'US' ? 'blue' : s.jurisdiction === 'UAE' ? 'gold' : s.jurisdiction === 'CEMAC' ? 'green' : undefined}>{s.jurisdiction === 'CEMAC' ? 'Cameroon · CEMAC · OHADA' : s.jurisdiction}</Chip>
                        {s.citation && <span className="tiny muted mono">{s.citation}</span>}
                      </div>
                      {s.note && <div className="tiny" style={{ color: 'var(--amber)' }}>{s.note}</div>}
                      <div className="row" style={{ gap: 4 }}><span className="tiny muted">Used in</span>{s.usedIn.map((id) => { const l = DEBT_LESSONS.find((x) => x.id === id); return l ? <Link key={id} to={`${STUDIO_BASE}/lessons/${l.number}`} className="chip" style={{ fontSize: '0.6rem' }}>L{String(l.number).padStart(2, '0')}</Link> : null; })}</div>
                    </div>
                    <div className="stack" style={{ gap: 6, alignItems: 'flex-end' }}>
                      <ConfidenceChip level={s.confidence} />
                      <span className="tiny muted mono">reviewed {s.lastReviewed}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="tiny muted" style={{ marginTop: 28 }}>Add your own sources and link them to lessons in the <Link to="/sources">Source Vault</Link>; test internet claims about debt against primary law in the <Link to="/claims">Claim Checker</Link>.</p>
    </div>
  );
}
