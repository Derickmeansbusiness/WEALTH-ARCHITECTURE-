import { useEffect, useRef, useState } from 'react';
import { COMPONENT_META, RELATIONSHIP_META } from '@/types/structure';
import type { CaseNode, CaseEdge, CaseStage } from '@/content/cases/types';

const W = 800, H = 480;
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

interface Snapshot { nodes: CaseNode[]; edges: CaseEdge[] }

/** Self-contained SVG renderer that morphs between stage structures (nodes move/fade, edges fade). */
export default function StructureRenderer({ stage }: { stage: CaseStage }) {
  const prev = useRef<Snapshot>(stage.structure);
  const [from, setFrom] = useState<Snapshot>(stage.structure);
  const [t, setT] = useState(1);
  useEffect(() => {
    setFrom(prev.current);
    prev.current = stage.structure;
    const start = performance.now(); let raf = 0;
    const tick = (now: number) => { const p = Math.min(1, (now - start) / 950); setT(ease(p)); if (p < 1) raf = requestAnimationFrame(tick); };
    setT(0); raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stage]);

  const to = stage.structure;
  const fromMap = new Map(from.nodes.map((n) => [n.id, n]));
  const toMap = new Map(to.nodes.map((n) => [n.id, n]));
  const ids = Array.from(new Set([...from.nodes.map((n) => n.id), ...to.nodes.map((n) => n.id)]));
  const pos = new Map<string, { x: number; y: number; o: number; n: CaseNode }>();
  for (const id of ids) {
    const a = fromMap.get(id), b = toMap.get(id);
    if (a && b) pos.set(id, { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, o: 1, n: b });
    else if (b) pos.set(id, { x: b.x, y: b.y + (1 - t) * 14, o: t, n: b });
    else if (a) pos.set(id, { x: a.x, y: a.y - t * 14, o: 1 - t, n: a });
  }
  const edgeKey = (e: CaseEdge) => `${e.from}>${e.to}:${e.kind}`;
  const fromEdges = new Set(from.edges.map(edgeKey));
  const toEdges = new Set(to.edges.map(edgeKey));
  const allEdges = [...to.edges, ...from.edges.filter((e) => !toEdges.has(edgeKey(e)))];

  return (
    <div className="cases-svg-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="diagram cases-svg" aria-label={`Structure at ${stage.year}: ${stage.title}`}>
        <defs>
          <marker id="cs-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="rgba(243,236,220,0.45)" /></marker>
        </defs>
        {allEdges.map((e, i) => {
          const a = pos.get(e.from), b = pos.get(e.to); if (!a || !b) return null;
          const k = edgeKey(e); const o = toEdges.has(k) ? (fromEdges.has(k) ? 1 : t) : 1 - t;
          const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
          const ax = a.x + (dx / len) * 26, ay = a.y + (dy / len) * 16, bx = b.x - (dx / len) * 30, by = b.y - (dy / len) * 18;
          const mx = (ax + bx) / 2, my = (ay + by) / 2;
          const meta = RELATIONSHIP_META[e.kind];
          return (
            <g key={k + i} opacity={o * Math.min(a.o, b.o)}>
              <line x1={ax} y1={ay} x2={bx} y2={by} className="cs-edge" stroke={meta.color} markerEnd="url(#cs-arrow)" strokeDasharray={e.kind === 'lends-to' || e.kind === 'borrows-from' || e.kind === 'insures' || e.kind === 'guarantees' ? '4 4' : undefined} />
              <text x={mx} y={my - 4} textAnchor="middle" className="cs-edge-label">{e.label ? `${meta.label.toLowerCase()} · ${e.label}` : meta.label.toLowerCase()}</text>
            </g>
          );
        })}
        {ids.map((id) => {
          const p = pos.get(id)!; const meta = COMPONENT_META[p.n.kind];
          const w = Math.max(96, Math.min(190, p.n.label.length * 6.2 + 28)), h = 40;
          return (
            <g key={id} className={`cs-node ${meta.category}`} transform={`translate(${p.x} ${p.y})`} opacity={p.o}>
              <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={meta.category === 'person' ? 20 : 8} />
              <text y={-3} textAnchor="middle">{p.n.label}</text>
              <text y={11} textAnchor="middle" className="code">{meta.short}{p.n.jurisdiction ? ' · ' : ''}<tspan className="jur">{p.n.jurisdiction ?? ''}</tspan></text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
