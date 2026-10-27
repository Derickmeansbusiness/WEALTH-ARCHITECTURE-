import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore, type JurisdictionMode } from '@/store/useAppStore';
import { Chip, Disclaimer, Panel, SectionHeader, useMoney, EmptyState } from '@/components/ui';
import { FX_NOTE } from '@/lib/format';
import { JURISDICTION_OVERVIEW, JURISDICTION_ROWS } from '@/content/debt/jurisdictions';
import { DEBT_LESSONS } from '@/content/debt/lessons';
import { FxCurrency, STUDIO_BASE } from '../shell/StudioShell';

const ORDER: JurisdictionMode[] = ['US', 'UAE', 'CEMAC', 'UK'];

export default function JurisdictionsPage() {
  const mode = useAppStore((s) => s.jurisdictionMode);
  const setMode = useAppStore((s) => s.setJurisdictionMode);
  const fmt = useMoney();
  const [view, setView] = useState<'all' | 'selected'>('all');
  const cols = view === 'all' ? ORDER : [mode];
  const unverified = JURISDICTION_ROWS.reduce((n, r) => n + cols.filter((j) => !r.cells[j].verified).length, 0);
  const lessonNotes = DEBT_LESSONS.map((l) => ({ l, note: l.jurisdictionNotes[mode] }));

  return (
    <div className="container ds-page">
      <SectionHeader eyebrow="Multi-jurisdictional education" title="The same loan, four legal systems" lede="Borrowing instruments, credit reporting, collateral registries, tax treatment of interest and insolvency regimes, compared without declaring a winner. Rows marked amber have not yet been verified by local counsel and are phrased generally on purpose.">
        <div className="row" style={{ gap: 12 }}>
          <FxCurrency />
          <span className="tiny muted" style={{ maxWidth: 520 }}>{FX_NOTE} Reference loan: {fmt(700_000, { compact: true })} on a {fmt(1_000_000, { compact: true })} asset.</span>
        </div>
      </SectionHeader>

      <div className="ds-juris-grid" style={{ marginBottom: 24 }}>
        {ORDER.map((j) => {
          const o = JURISDICTION_OVERVIEW[j];
          return (
            <button key={j} className={`ds-juris-card ${mode === j ? 'active' : ''}`} onClick={() => setMode(j)} style={{ textAlign: 'left', cursor: 'pointer' }} aria-pressed={mode === j}>
              <div className="row between" style={{ marginBottom: 6 }}>
                <span className="display" style={{ fontSize: '1.25rem', color: 'var(--ivory)' }}>{o.name}</span>
                <Chip tone={o.status === 'reviewed' ? 'green' : o.status === 'partial' ? 'amber' : undefined}>{o.status === 'reviewed' ? 'Reviewed' : o.status === 'partial' ? 'Partly verified' : 'Coming'}</Chip>
              </div>
              <div className="tiny muted mono" style={{ marginBottom: 8 }}>{o.currency}</div>
              <p className="small" style={{ margin: '0 0 10px' }}>{o.summary}</p>
              <div className="row" style={{ gap: 4 }}>{o.regulators.slice(0, 4).map((r) => <span key={r} className="chip" style={{ fontSize: '0.6rem' }}>{r}</span>)}</div>
            </button>
          );
        })}
      </div>

      <div className="row between" style={{ marginBottom: 12 }}>
        <div className="row" style={{ gap: 6 }}>
          <button className={`btn sm ${view === 'all' ? 'active' : 'ghost'}`} onClick={() => setView('all')}>Compare all four</button>
          <button className={`btn sm ${view === 'selected' ? 'active' : 'ghost'}`} onClick={() => setView('selected')}>Selected only · {JURISDICTION_OVERVIEW[mode].name}</button>
        </div>
        <Chip tone="amber">{unverified} cell{unverified === 1 ? '' : 's'} not yet jurisdictionally verified</Chip>
      </div>

      <div className="table-wrap" style={{ marginBottom: 32 }}>
        <table className="table ds-compare-table">
          <thead><tr><th>Topic</th>{cols.map((j) => <th key={j} style={{ color: j === mode ? 'var(--gold-2)' : undefined }}>{JURISDICTION_OVERVIEW[j].name}</th>)}</tr></thead>
          <tbody>
            {JURISDICTION_ROWS.map((r) => (
              <tr key={r.topic}>
                <td style={{ color: 'var(--ivory)', fontWeight: 500 }}>{r.topic}</td>
                {cols.map((j) => {
                  const c = r.cells[j];
                  return (
                    <td key={j} style={{ background: j === mode && view === 'all' ? 'rgba(201,169,97,0.04)' : undefined }}>
                      <div className="stack" style={{ gap: 6 }}>
                        <div className="row" style={{ gap: 6 }}>{c.verified ? <Chip tone="green">Reviewed</Chip> : <Chip tone="amber">Not yet jurisdictionally verified</Chip>}</div>
                        <span>{c.text}</span>
                        {c.cite && <span className="tiny muted mono">{c.cite}</span>}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionHeader eyebrow={`Lesson-by-lesson notes · ${JURISDICTION_OVERVIEW[mode].name}`} title="What each lesson says about this jurisdiction" />
      {lessonNotes.length === 0 ? <EmptyState title="No notes" /> : (
        <div className="grid grid-3">
          {lessonNotes.map(({ l, note }) => (
            <Panel key={l.id} tight tone={note.verified ? 'green' : 'warn'}>
              <div className="row between" style={{ marginBottom: 6 }}><Link to={`${STUDIO_BASE}/lessons/${l.number}`} className="ds-card-num">LESSON {String(l.number).padStart(2, '0')}</Link>{note.verified ? <Chip tone="green">Reviewed</Chip> : <Chip tone="amber">Unverified</Chip>}</div>
              <div className="display" style={{ fontSize: '1.15rem', marginBottom: 6 }}>{l.title}</div>
              <ul style={{ margin: 0, paddingLeft: 16 }}>{note.notes.map((n, i) => <li key={i} className="small" style={{ marginBottom: 4 }}>{n}</li>)}</ul>
            </Panel>
          ))}
        </div>
      )}

      <div style={{ marginTop: 28 }}>
        <Disclaimer>No jurisdiction is “best”. Suitability depends on residence, citizenship, where assets and income sit, business activity and objectives. Amber cells are deliberately general; confirm every statutory reference with licensed counsel in that jurisdiction before relying on it. See also the platform’s <Link to="/jurisdictions">Jurisdiction Engine</Link> and <Link to="/claims">Claim Checker</Link>.</Disclaimer>
      </div>
    </div>
  );
}
