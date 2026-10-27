import { useStages } from '@/modules/academy/anim';
import { Chip } from '@/components/ui';

/** The same asset under three lenses: who owns (legal title), who controls, who benefits. Highlight switches between lenses. */
const LENSES = [
  { id: 'owns', label: 'Who owns', color: 'var(--blue)', eyebrow: 'LEGAL TITLE', focus: ['trustee', 'llc'], caption: 'Legal title to the building sits with the LLC; legal title to 99% of the LLC sits with the trustee. The founder\'s name appears nowhere on the deed.' },
  { id: 'controls', label: 'Who controls', color: 'var(--gold)', eyebrow: 'CONTROL', focus: ['founder', 'protector', 'trustee'], caption: 'The founder manages the building as LLC manager under a written agreement; the trustee decides distributions; the protector can remove either. Control is split by role.' },
  { id: 'benefits', label: 'Who benefits', color: 'var(--green-2)', eyebrow: 'BENEFICIAL OWNERSHIP', focus: ['children'], caption: 'The children hold the equitable interest in 99% of the LLC through the trust. The founder keeps 1% and a market-rate manager fee. That is all that remains in the founder\'s estate.' },
];

const NODES = {
  founder: { x: 110, y: 90, label: 'Founder', sub: '1% member · manager', shape: 'person' },
  protector: { x: 110, y: 290, label: 'Protector', sub: 'can remove trustee / manager', shape: 'person' },
  trustee: { x: 380, y: 70, label: 'Independent Trustee', sub: 'holds 99% of LLC', shape: 'box' },
  children: { x: 650, y: 90, label: 'Children', sub: 'beneficiaries', shape: 'person' },
  llc: { x: 380, y: 210, label: 'Property LLC', sub: 'legal title to building', shape: 'box' },
  building: { x: 380, y: 340, label: 'Commercial building', sub: '$4.0m · NOI $280k', shape: 'asset' },
} as const;
type NodeId = keyof typeof NODES;

const EDGES: { from: NodeId; to: NodeId; label: string; lens: string[]; tone: string; dash?: boolean }[] = [
  { from: 'trustee', to: 'llc', label: 'owns 99%', lens: ['owns'], tone: 'var(--blue)' },
  { from: 'founder', to: 'llc', label: 'owns 1%', lens: ['owns'], tone: 'var(--blue)' },
  { from: 'llc', to: 'building', label: 'holds title', lens: ['owns'], tone: 'var(--blue)' },
  { from: 'founder', to: 'llc', label: 'manages (operating agreement)', lens: ['controls'], tone: 'var(--gold)' },
  { from: 'trustee', to: 'children', label: 'distribution discretion', lens: ['controls'], tone: 'var(--gold)' },
  { from: 'protector', to: 'trustee', label: 'remove / replace', lens: ['controls'], tone: 'var(--gold)', dash: true },
  { from: 'protector', to: 'founder', label: 'remove as manager', lens: ['controls'], tone: 'var(--gold)', dash: true },
  { from: 'building', to: 'llc', label: 'rent → NOI', lens: ['benefits'], tone: 'var(--green-2)' },
  { from: 'llc', to: 'trustee', label: '99% of distributions', lens: ['benefits'], tone: 'var(--green-2)' },
  { from: 'trustee', to: 'children', label: 'for the children', lens: ['benefits'], tone: 'var(--green-2)' },
  { from: 'llc', to: 'founder', label: '1% + manager fee', lens: ['benefits'], tone: 'var(--green-2)' },
];

export default function Diagram() {
  const { stage, t, setStage, playing, toggle } = useStages(LENSES.length, 3800);
  const lens = LENSES[stage];
  const isFocus = (id: NodeId) => (lens.focus as readonly string[]).includes(id);

  return (
    <div>
      <div className="acad-diagram-controls">
        {LENSES.map((l, i) => <button key={l.id} className={`btn sm ${stage === i ? 'active' : 'ghost'}`} onClick={() => setStage(i)} style={stage === i ? { borderColor: l.color, color: l.color } : undefined}>{l.label}</button>)}
        <button className="btn sm ghost" onClick={toggle}>{playing ? '❚❚' : '▶'}</button>
        <span style={{ flex: 1 }} />
        <Chip tone={stage === 0 ? 'blue' : stage === 1 ? 'gold' : 'green'}>{lens.eyebrow}</Chip>
      </div>
      <div className="acad-diagram-wrap">
        <svg className="diagram" viewBox="0 0 760 400" role="img" aria-label="One asset under three lenses: ownership, control, benefit">
          <defs>
            <marker id="ch03-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill={lens.color} /></marker>
          </defs>
          <text x="20" y="28" className="label-mono" style={{ fontSize: 11, letterSpacing: 2, fill: lens.color }} opacity={t}>{lens.eyebrow}</text>

          {/* edges */}
          {EDGES.map((e, i) => {
            const on = e.lens.includes(lens.id);
            const a = NODES[e.from], b = NODES[e.to];
            const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
            return (
              <g key={i} opacity={on ? 0.25 + 0.75 * t : 0.06} style={{ transition: 'opacity 0.4s' }}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={on ? e.tone : 'var(--line-strong)'} strokeWidth={on ? 1.6 : 1} strokeDasharray={e.dash ? '4 5' : undefined} className={on && !e.dash ? 'flow-line' : undefined} markerEnd={on ? 'url(#ch03-arrow)' : undefined} />
                {on && (
                  <g>
                    <rect x={mx - e.label.length * 2.9 - 6} y={my - 9} width={e.label.length * 5.8 + 12} height="16" rx="8" fill="var(--bg-1)" stroke={e.tone} strokeOpacity="0.5" />
                    <text x={mx} y={my + 3} textAnchor="middle" style={{ fontSize: 9, fill: e.tone }}>{e.label}</text>
                  </g>
                )}
              </g>
            );
          })}

          {/* nodes */}
          {(Object.keys(NODES) as NodeId[]).map((id) => {
            const n = NODES[id];
            const f = isFocus(id);
            const stroke = f ? lens.color : 'var(--line-strong)';
            return (
              <g key={id} opacity={f ? 1 : 0.55} style={{ transition: 'opacity 0.4s' }}>
                {f && <circle cx={n.x} cy={n.y} r={n.shape === 'person' ? 34 : 60} fill={lens.color} opacity={0.08 + 0.08 * Math.sin(t * Math.PI)} />}
                {n.shape === 'person' ? (
                  <g>
                    <circle cx={n.x} cy={n.y - 6} r="22" className="node" stroke={stroke} strokeWidth={f ? 2 : 1} />
                    <circle cx={n.x} cy={n.y - 12} r="6" fill={stroke} opacity="0.8" />
                    <path d={`M ${n.x - 11} ${n.y + 6} Q ${n.x} ${n.y - 6} ${n.x + 11} ${n.y + 6}`} fill={stroke} opacity="0.8" />
                  </g>
                ) : n.shape === 'box' ? (
                  <rect x={n.x - 80} y={n.y - 24} width="160" height="48" rx="8" className="node" stroke={stroke} strokeWidth={f ? 2 : 1} />
                ) : (
                  <path d={`M ${n.x - 80} ${n.y + 20} V ${n.y - 12} L ${n.x - 40} ${n.y - 26} V ${n.y - 12} L ${n.x} ${n.y - 26} V ${n.y - 12} L ${n.x + 40} ${n.y - 26} V ${n.y - 12} L ${n.x + 80} ${n.y - 26} V ${n.y + 20} Z`} className="node" stroke={stroke} strokeWidth={f ? 2 : 1} />
                )}
                <text x={n.x} y={n.shape === 'person' ? n.y + 32 : n.y + (n.shape === 'asset' ? 2 : -2)} textAnchor="middle" style={{ fontSize: 11.5, fill: 'var(--ivory)' }}>{n.label}</text>
                <text x={n.x} y={n.shape === 'person' ? n.y + 45 : n.y + 12} textAnchor="middle" className="label-mono" style={{ fontSize: 8.5, fill: f ? lens.color : 'var(--ivory-3)' }}>{n.sub}</text>
              </g>
            );
          })}
          <text x="380" y="392" textAnchor="middle" style={{ fontSize: 11, fill: 'var(--ivory-3)' }}>Same building. Three questions. Three different answers.</text>
        </svg>
      </div>
      <p className="acad-diagram-caption"><strong>What moves:</strong> the highlight switches between the three lenses. {lens.caption} Notice that the founder is prominent only under "who controls", and only through a defined, removable role. That is the design; a founder who was prominent under all three lenses would have separated nothing.</p>
    </div>
  );
}
