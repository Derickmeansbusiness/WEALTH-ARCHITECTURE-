import { Link } from 'react-router-dom';
import { Panel, SectionHeader, Chip, Eyebrow, useMoney, Disclaimer } from '@/components/ui';
import { FAMILIES, entityCount } from '@/content/cases';

const COLORS = ['var(--ivory-3)', 'var(--green-2)', 'var(--gold)', 'var(--violet)', 'var(--blue)'];

export default function CompareView() {
  const fmt = useMoney();
  const maxStages = Math.max(...FAMILIES.map((f) => f.stages.length));
  return (
    <div className="page container">
      <div className="row" style={{ gap: 8, marginBottom: 14 }}><Link to="/cases" className="btn sm ghost">‹ All families</Link></div>
      <SectionHeader eyebrow="Case studies · Compare" title="Five families, side by side" lede="Net worth and entity count by stage. The x-axis is the stage number, not the calendar year, because each family's story runs on its own clock. Net worth is on a log scale: the Starter family's $185,000 and the Multigenerational family's $141M would not otherwise share a chart." />
      <div className="cases-legend" style={{ marginBottom: 14 }}>{FAMILIES.map((f, i) => <span key={f.id}><i style={{ background: COLORS[i] }} />L{f.level} · {f.name}</span>)}</div>
      <div className="grid grid-2">
        <Panel tight>
          <Eyebrow>Net worth by stage (log scale)</Eyebrow>
          <Chart maxStages={maxStages} value={(s) => Math.log10(s.netWorthUSD)} ticks={[5, 6, 7, 8, 9]} tickLabel={(v) => fmt(Math.pow(10, v), { compact: true })} />
        </Panel>
        <Panel tight>
          <Eyebrow>Entities and trusts by stage</Eyebrow>
          <Chart maxStages={maxStages} value={(s) => entityCount(s)} ticks={[0, 3, 6, 9, 12]} tickLabel={(v) => String(v)} />
        </Panel>
      </div>
      <Panel tight style={{ marginTop: 16 }}>
        <Eyebrow>Progression table</Eyebrow>
        <div className="table-wrap" style={{ marginTop: 10 }}>
          <table className="table">
            <thead><tr><th>Family</th><th>Level</th>{Array.from({ length: maxStages }, (_, i) => <th key={i} className="num">Stage {i + 1}</th>)}</tr></thead>
            <tbody>
              {FAMILIES.map((f, fi) => (
                <tr key={f.id}>
                  <td><Link to={`/cases/${f.id}`} style={{ color: COLORS[fi] }}>{f.name}</Link></td>
                  <td><Chip tone="gold">L{f.level}</Chip></td>
                  {Array.from({ length: maxStages }, (_, i) => {
                    const s = f.stages[i];
                    return <td key={i} className="num">{s ? <><span>{fmt(s.netWorthUSD, { compact: true })}</span><br /><span className="tiny muted">{s.year} · {entityCount(s)} ent.</span></> : <span className="muted">—</span>}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="tiny muted" style={{ marginTop: 8 }}>Entity count includes companies, trusts and family-office vehicles; it excludes people, raw assets and loans. More entities is not better; the right number is the smallest one that separates the risks you actually have.</p>
      </Panel>
      <div className="section"><Disclaimer>Fictional composites for teaching. Net worth figures are illustrative and not comparable to any real family.</Disclaimer></div>
    </div>
  );
}

function Chart({ maxStages, value, ticks, tickLabel }: { maxStages: number; value: (s: (typeof FAMILIES)[number]['stages'][number]) => number; ticks: number[]; tickLabel: (v: number) => string }) {
  const W = 480, H = 240, L = 52, R = 14, T = 14, B = 28;
  const lo = ticks[0], hi = ticks[ticks.length - 1];
  const X = (i: number) => L + ((W - L - R) * i) / Math.max(1, maxStages - 1);
  const Y = (v: number) => T + (H - T - B) * (1 - (v - lo) / (hi - lo));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="cases-chart" aria-label="Comparison chart">
      {ticks.map((tk) => <g key={tk}><line x1={L} y1={Y(tk)} x2={W - R} y2={Y(tk)} className="grid" /><text x={L - 6} y={Y(tk) + 3} textAnchor="end">{tickLabel(tk)}</text></g>)}
      {Array.from({ length: maxStages }, (_, i) => <text key={i} x={X(i)} y={H - 8} textAnchor="middle">Stage {i + 1}</text>)}
      {FAMILIES.map((f, fi) => (
        <g key={f.id}>
          <path d={f.stages.map((s, i) => `${i === 0 ? 'M' : 'L'}${X(i)},${Y(value(s))}`).join(' ')} className="ln draw-line" stroke={COLORS[fi]} />
          {f.stages.map((s, i) => <circle key={i} cx={X(i)} cy={Y(value(s))} r={3.5} fill={COLORS[fi]} />)}
        </g>
      ))}
    </svg>
  );
}
