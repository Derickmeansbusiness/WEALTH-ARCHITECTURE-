import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eyebrow, Stat, SliderField, Disclaimer, Callout, Chip, useMoney } from '@/components/ui';
import { buildTree, type TreeInput, type EntityKind } from './entityTree';

const TONE: Record<EntityKind, string> = { holdco: 'var(--gold)', opco: 'var(--gold-2)', propco: 'var(--green-2)', mgmtco: 'var(--blue)', investco: 'var(--violet)', personal: 'var(--ivory-3)' };
const CHIP: Record<EntityKind, 'gold' | 'green' | 'blue' | 'violet' | undefined> = { holdco: 'gold', opco: 'gold', propco: 'green', mgmtco: 'blue', investco: 'violet', personal: undefined };

function Toggle({ label, value, onChange, hint }: { label: string; value: boolean; onChange: (v: boolean) => void; hint: string }) {
  return (
    <button onClick={() => onChange(!value)} aria-pressed={value} className="panel tight" style={{ textAlign: 'left', cursor: 'pointer', borderColor: value ? 'rgba(201,169,97,0.45)' : undefined, display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', gap: 12, alignItems: 'center', color: 'inherit' }}>
      <span style={{ width: 36, height: 20, borderRadius: 999, background: value ? 'var(--gold)' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.25s' }}>
        <span style={{ position: 'absolute', top: 2, left: value ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: value ? '#1a1508' : 'var(--ivory-3)', transition: 'left 0.25s' }} />
      </span>
      <span><span style={{ color: 'var(--ivory)', fontSize: '0.9rem' }}>{label}</span><br /><span className="tiny muted">{hint}</span></span>
    </button>
  );
}

export default function Simulator() {
  const [input, setInput] = useState<TreeInput>({ operatingBusinesses: 2, properties: 2, holdingCompany: true, managementCompany: true, separatePropertyCompanies: true, investmentCompany: true });
  const r = useMemo(() => buildTree(input), [input]);
  const fmt = useMoney();
  const set = <K extends keyof TreeInput>(k: K, v: TreeInput[K]) => setInput((x) => ({ ...x, [k]: v }));
  const root = r.nodes[0];
  const children = r.nodes.slice(1);
  const W = Math.max(560, children.length * 130 + 40);

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="row between">
        <div><Eyebrow>Entity Tree Builder-lite</Eyebrow><h4 style={{ margin: '4px 0 0' }}>Choose what the family owns. See the fences and the bill.</h4></div>
        <Link to="/lab" className="btn sm">Full drag-and-drop designer: Structure Lab →</Link>
      </div>
      <div className="acad-sim">
        <div className="stack" style={{ gap: 12 }}>
          <SliderField label="Operating businesses" value={input.operatingBusinesses} min={0} max={6} step={1} onChange={(v) => set('operatingBusinesses', v)} />
          <SliderField label="Properties" value={input.properties} min={0} max={6} step={1} onChange={(v) => set('properties', v)} />
          <Toggle label="Holding company" value={input.holdingCompany} onChange={(v) => set('holdingCompany', v)} hint="One owner of all the boxes; charging-order layer for personal claims." />
          <Toggle label="Separate property companies" value={input.separatePropertyCompanies} onChange={(v) => set('separatePropertyCompanies', v)} hint="One LLC per property versus all properties in one." />
          <Toggle label="Management company" value={input.managementCompany} onChange={(v) => set('managementCompany', v)} hint="Employs shared staff; bills arm's-length fees." />
          <Toggle label="Investment company" value={input.investmentCompany} onChange={(v) => set('investmentCompany', v)} hint="Holds the liquid portfolio away from operations." />
        </div>

        <div className="stack" style={{ gap: 14 }}>
          <div className="acad-sim-stats">
            <Stat label="Entities" value={r.entityCount} sub={input.holdingCompany ? 'incl. holding company' : 'no holding company'} tone="gold" />
            <Stat label="Annual compliance (illustrative)" value={`${fmt(r.complianceLow, { compact: true })} – ${fmt(r.complianceHigh, { compact: true })}`} sub="state fees, agents, books, returns" />
            <Stat label="Liability sources" value={r.fences.length} sub="each row below" />
            <Stat label="Warnings" value={r.warnings.length} tone={r.warnings.length ? 'amber' : 'green'} />
          </div>

          {/* Generated tree */}
          <div className="acad-diagram-wrap">
            <svg className="diagram" viewBox={`0 0 ${W} 230`} style={{ minWidth: W }} role="img" aria-label="Generated entity tree">
              <rect x={W / 2 - 90} y="16" width="180" height="48" rx="10" className="node" stroke={TONE[root.kind]} strokeWidth="1.5" />
              <text x={W / 2} y="37" textAnchor="middle" style={{ fontSize: 11.5, fill: 'var(--ivory)' }}>{root.label}</text>
              <text x={W / 2} y="53" textAnchor="middle" className="label-mono" style={{ fontSize: 8.5, fill: TONE[root.kind] }}>{root.kind === 'holdco' ? 'owns 100% of each box' : 'owns each box directly'}</text>
              {children.map((n, i) => {
                const cx = 20 + i * 130 + 60;
                return (
                  <g key={n.id} className="acad-rise" style={{ animationDelay: `${i * 0.06}s` }}>
                    <path d={`M ${W / 2} 64 C ${W / 2} 100, ${cx} 100, ${cx} 130`} className="edge gold" strokeWidth="1" />
                    <rect x={cx - 64} y="124" width="128" height="88" rx="12" fill="none" stroke={TONE[n.kind]} className="acad-fence" />
                    <rect x={cx - 56} y="132" width="112" height="72" rx="8" className="node" stroke={TONE[n.kind]} />
                    <text x={cx} y="156" textAnchor="middle" style={{ fontSize: 10.5, fill: 'var(--ivory)' }}>{n.label}</text>
                    {n.holds.slice(0, 2).map((h, k) => <text key={h} x={cx} y={172 + k * 12} textAnchor="middle" className="label-mono" style={{ fontSize: 8, fill: 'var(--ivory-3)' }}>{h}</text>)}
                    {n.holds.length > 2 && <text x={cx} y="196" textAnchor="middle" className="label-mono" style={{ fontSize: 8, fill: 'var(--ivory-3)' }}>+{n.holds.length - 2} more</text>}
                  </g>
                );
              })}
              {children.length === 0 && <text x={W / 2} y="160" textAnchor="middle" style={{ fontSize: 11, fill: 'var(--ivory-3)' }}>Add a business or a property to generate boxes.</text>}
            </svg>
          </div>

          {/* Fences table */}
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Liability source</th><th>Can reach</th><th>Fenced from</th></tr></thead>
              <tbody>
                {r.fences.map((f) => (
                  <tr key={f.sourceId + f.source}>
                    <td style={{ color: 'var(--ivory)' }}>{f.source}</td>
                    <td><div className="row" style={{ gap: 4 }}>{f.reaches.map((a) => <Chip key={a} tone="red">{a}</Chip>)}</div></td>
                    <td><div className="row" style={{ gap: 4 }}>{f.fenced.length ? f.fenced.map((a) => <Chip key={a} tone="green">{a}</Chip>) : <span className="tiny muted">nothing</span>}</div></td>
                  </tr>
                ))}
                {r.fences.length === 0 && <tr><td colSpan={3} className="muted small">No liability sources yet.</td></tr>}
              </tbody>
            </table>
          </div>

          {r.warnings.map((w) => <Callout key={w} tone="amber"><p className="small" style={{ margin: 0 }}>{w}</p></Callout>)}

          <div className="row" style={{ gap: 6 }}>
            {(['holdco', 'opco', 'propco', 'mgmtco', 'investco'] as EntityKind[]).map((k) => <Chip key={k} tone={CHIP[k]}>{k}</Chip>)}
          </div>
          <div className="acad-formula">{`Entities = (holding ? 1 : 0) + operating + (separate ? properties : min(1, properties)) + (management ? 1 : 0) + (investment ? 1 : 0)
Compliance (illustrative) = entities × $1,500–2,600 + holding partnership return $1,200–2,500 + management payroll/agreements $2,500–6,000
Fence rule: a claim arising in a box reaches that box's assets; with a holding company, personal claims reach distributions only (charging order).`}</div>
          <Disclaimer>Compliance figures are illustrative US ranges and vary widely by state (California's minimum franchise tax alone changes them), by whether returns are consolidated, and by bookkeeping complexity. The fence table assumes every entity is properly capitalised, insured and run with separate accounts and documents; commingling, undercapitalization or ignored formalities can let a claim through any fence shown. Charging-order strength varies by state and is weaker for single-member entities.</Disclaimer>
        </div>
      </div>
    </div>
  );
}
