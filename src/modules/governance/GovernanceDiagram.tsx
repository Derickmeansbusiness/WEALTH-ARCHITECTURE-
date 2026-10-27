import { useEffect, useState } from 'react';

type Flow = 'elects' | 'advises' | 'decides' | 'reports';
const FLOW_COLOR: Record<Flow, string> = { elects: 'var(--gold)', advises: 'var(--blue)', decides: 'var(--green-2)', reports: 'var(--violet)' };

const N = {
  assembly: { x: 480, y: 50, w: 220, label: 'Family Assembly', sub: 'all adult members' },
  council: { x: 480, y: 160, w: 200, label: 'Family Council', sub: 'elected · 5 members' },
  invest: { x: 180, y: 280, w: 180, label: 'Investment Committee', sub: 'IPS · managers' },
  educ: { x: 480, y: 280, w: 180, label: 'Education Committee', sub: 'curriculum · funding' },
  phil: { x: 780, y: 280, w: 180, label: 'Philanthropy Committee', sub: 'foundation grants' },
  office: { x: 180, y: 410, w: 180, label: 'Family Office', sub: 'reporting · execution' },
  trustees: { x: 480, y: 410, w: 180, label: 'Trustees', sub: 'hold title · discretion' },
  boards: { x: 780, y: 410, w: 180, label: 'Company Boards', sub: 'operating businesses' },
} as const;
type NodeId = keyof typeof N;

interface E { from: NodeId; to: NodeId; flow: Flow; label?: string; curve?: number }
const EDGES: E[] = [
  { from: 'assembly', to: 'council', flow: 'elects' },
  { from: 'council', to: 'invest', flow: 'elects', label: 'appoints' },
  { from: 'council', to: 'educ', flow: 'elects', label: 'appoints' },
  { from: 'council', to: 'phil', flow: 'elects', label: 'appoints' },
  { from: 'invest', to: 'office', flow: 'decides', label: 'mandates' },
  { from: 'educ', to: 'trustees', flow: 'advises' },
  { from: 'phil', to: 'boards', flow: 'advises', label: 'CSR input' },
  { from: 'council', to: 'trustees', flow: 'advises', label: 'beneficiary voice', curve: -1 },
  { from: 'council', to: 'boards', flow: 'elects', label: 'nominates family directors', curve: 1 },
  { from: 'trustees', to: 'council', flow: 'reports', curve: 1 },
  { from: 'office', to: 'council', flow: 'reports', label: 'consolidated reporting', curve: -1 },
  { from: 'boards', to: 'trustees', flow: 'reports', label: 'as shareholder' },
  { from: 'council', to: 'assembly', flow: 'reports', label: 'annual report', curve: 1 },
];

export default function GovernanceDiagram({ highlight, onPick }: { highlight: Flow | null; onPick: (f: Flow | null) => void }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now();
    const tick = (now: number) => { const p = Math.min(1, (now - start) / 3600); setT(p); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const path = (e: E) => {
    const a = N[e.from], b = N[e.to];
    const dy = b.y - a.y; const dirDown = dy > 0;
    const ay = a.y + (dirDown ? 22 : -22), by = b.y + (dirDown ? -22 : 22);
    const sideways = Math.abs(a.x - b.x) > 20;
    const ax = sideways ? a.x + Math.sign(b.x - a.x) * Math.min(a.w / 2 - 10, 60) * (e.curve ? 1 : 0.6) : a.x + (e.curve ?? 0) * 40;
    const bx = sideways ? b.x : b.x + (e.curve ?? 0) * 40;
    const cx = (ax + bx) / 2 + (e.curve ?? 0) * 60, cy = (ay + by) / 2;
    return { d: `M${ax},${ay} Q${cx},${cy} ${bx},${by}`, mx: (ax + 2 * cx + bx) / 4, my: (ay + 2 * cy + by) / 4 };
  };
  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="gov-flow-legend" role="group" aria-label="Decision-right flows">
        {(Object.keys(FLOW_COLOR) as Flow[]).map((f) => (
          <button key={f} type="button" className={`btn sm ${highlight === f ? 'active' : 'ghost'}`} onClick={() => onPick(highlight === f ? null : f)}><i style={{ background: FLOW_COLOR[f] }} />{f}</button>
        ))}
      </div>
      <div className="gov-diagram-wrap">
        <svg viewBox="0 0 960 470" className="diagram gov-diagram" aria-label="Governance architecture: bodies and decision-right flows">
          <defs>
            {(Object.keys(FLOW_COLOR) as Flow[]).map((f) => (
              <marker key={f} id={`gov-arrow-${f}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={FLOW_COLOR[f]} /></marker>
            ))}
          </defs>
          {EDGES.map((e, i) => {
            const appear = Math.max(0, Math.min(1, (t * 1.4 - i * 0.08) * 4));
            const dim = highlight && highlight !== e.flow;
            const { d, mx, my } = path(e);
            return (
              <g key={i} opacity={appear * (dim ? 0.15 : 1)} style={{ transition: 'opacity 0.4s' }}>
                <path d={d} fill="none" stroke={FLOW_COLOR[e.flow]} strokeWidth={highlight === e.flow ? 2.2 : 1.3} markerEnd={`url(#gov-arrow-${e.flow})`} className={appear >= 1 ? 'flow-line' : ''} />
                <text x={mx} y={my - 5} textAnchor="middle" className="gov-edge-label" style={{ fill: FLOW_COLOR[e.flow] }}>{e.label ?? e.flow}</text>
              </g>
            );
          })}
          {(Object.keys(N) as NodeId[]).map((id, i) => {
            const n = N[id]; const appear = Math.max(0, Math.min(1, (t * 1.4 - i * 0.07) * 4));
            return (
              <g key={id} className="gov-node" transform={`translate(${n.x} ${n.y}) scale(${0.7 + 0.3 * appear})`} opacity={appear}>
                <rect x={-n.w / 2} y={-22} width={n.w} height={44} rx={10} />
                <text y={-2} textAnchor="middle">{n.label}</text>
                <text y={13} textAnchor="middle" className="sub">{n.sub.toUpperCase()}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
export type { Flow };
