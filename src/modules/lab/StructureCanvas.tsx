/**
 * StructureCanvas — the reusable SVG engine behind the Structure Lab, the Master Map hand-off and the Debt Studio financing map.
 *
 *   <StructureCanvas structure={s} view="ownership" onChange={setS} selectedId={id} onSelect={setId} height={600} highlightEdgeIds={[...]} />
 *
 * Pan (drag the background, two-finger pan), zoom (wheel, pinch, buttons), drag nodes, drag from a node's port to connect,
 * click-to-place, HTML5 drop from a palette. The same graph is re-styled completely per MapView.
 * Stable public API: the props below. Extra optional props may be added but never removed.
 */
import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent, type ReactNode, type RefObject } from 'react';
import type { Structure, StructureNode, StructureEdge, MapView, ComponentKind, ComponentCategory, RelationshipKind } from '@/types/structure';
import { COMPONENT_META, RELATIONSHIP_META } from '@/types/structure';
import { money } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';
import { useViewport, pinchState, bboxOf } from './useViewport';
import { CATEGORY_COLOR } from './views';
import { creditorReach, liabilityFences, succession, defaultDeceased, defaultCreditorOrigin, isController, isPureOwner, loanSummary, loanParties, isLoanEdge, CONTROL_KINDS, categoryOf } from './analysis';
import './lab.css';

export interface StructureCanvasProps {
  structure: Structure;
  view: MapView;
  onChange?: (next: Structure) => void;
  readOnly?: boolean;
  /** Selected node or edge id. */
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  height?: number | string;
  /** Edges to emphasise (others are faded). */
  highlightEdgeIds?: string[];
  /** Click-to-place: the kind waiting to be dropped on the next background click/tap. */
  placeKind?: ComponentKind | null;
  onPlace?: (kind: ComponentKind, x: number, y: number) => void;
  /** Connect mode: tap node A then node B (touch-friendly alternative to port dragging). */
  connectMode?: boolean;
  onConnect?: (fromId: string, toId: string) => void;
  /** Succession view controls. */
  deathEvent?: boolean;
  deceasedId?: string;
  /** Liability view: where the claim arises. */
  creditorOriginId?: string;
  emptyState?: ReactNode;
  /** Overlays rendered inside the canvas frame (absolute positioned by the caller). */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Increment to re-fit the viewport to the structure. */
  fitSignal?: number;
  showControls?: boolean;
  /** Receives the <svg> element, e.g. for SVG export. */
  svgRef?: RefObject<SVGSVGElement | null>;
  /** Show a soft grid (default true). */
  grid?: boolean;
}

// ── Geometry ──────────────────────────────────────────────────────────────
const BASE: Record<ComponentCategory, { w: number; h: number }> = {
  person: { w: 72, h: 72 }, trust: { w: 164, h: 64 }, entity: { w: 164, h: 60 }, asset: { w: 158, h: 56 }, instrument: { w: 150, h: 46 }, institution: { w: 164, h: 60 },
};

export function nodeSize(node: StructureNode, scale = 1): { w: number; h: number } {
  const b = BASE[COMPONENT_META[node.kind].category];
  return { w: b.w * scale, h: b.h * scale };
}

function boundaryPoint(n: StructureNode, size: { w: number; h: number }, tx: number, ty: number) {
  const dx = tx - n.x, dy = ty - n.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const cat = categoryOf(n);
  if (cat === 'person') { const r = size.w / 2; return { x: n.x + ux * r, y: n.y + uy * r }; }
  const hw = size.w / 2, hh = size.h / 2;
  const s = Math.min(hw / (Math.abs(ux) || 1e-6), hh / (Math.abs(uy) || 1e-6));
  return { x: n.x + ux * s, y: n.y + uy * s };
}

interface EdgeGeom { d: string; dRev: string; mid: { x: number; y: number }; a: { x: number; y: number }; b: { x: number; y: number } }

function edgeGeometry(from: StructureNode, to: StructureNode, sf: { w: number; h: number }, st: { w: number; h: number }, bend: number): EdgeGeom {
  const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
  const dx = to.x - from.x, dy = to.y - from.y; const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const c = { x: mx + nx * bend, y: my + ny * bend };
  const a = boundaryPoint(from, sf, c.x, c.y);
  const b = boundaryPoint(to, st, c.x, c.y);
  const mid = { x: 0.25 * a.x + 0.5 * c.x + 0.25 * b.x, y: 0.25 * a.y + 0.5 * c.y + 0.25 * b.y };
  return { d: `M${a.x},${a.y} Q${c.x},${c.y} ${b.x},${b.y}`, dRev: `M${b.x},${b.y} Q${c.x},${c.y} ${a.x},${a.y}`, mid, a, b };
}

const fit = (s: string, max: number) => (s.length > max ? s.slice(0, max - 1) + '…' : s);

/** Which direction cash physically moves along an edge in the cash-flow view, and its colour. */
function flowStyle(e: StructureEdge): { dir: 1 | -1; color: string; dur: number }[] {
  switch (e.kind) {
    case 'lends-to': return [{ dir: 1, color: 'var(--green-2)', dur: 3.2 }, { dir: -1, color: 'var(--amber)', dur: 1.8 }];
    case 'borrows-from': return [{ dir: -1, color: 'var(--green-2)', dur: 3.2 }, { dir: 1, color: 'var(--amber)', dur: 1.8 }];
    case 'manages': return [{ dir: -1, color: 'var(--ivory-3)', dur: 2.6 }];
    case 'insures': return [{ dir: -1, color: 'var(--green-2)', dur: 2.8 }];
    case 'employs': return [{ dir: 1, color: 'var(--ivory-3)', dur: 2.4 }];
    default: return [{ dir: 1, color: 'var(--green-2)', dur: 2.2 }];
  }
}

// ── Component ─────────────────────────────────────────────────────────────
export default function StructureCanvas(props: StructureCanvasProps) {
  const { structure, view, onChange, readOnly = false, selectedId = null, onSelect, height = '100%', highlightEdgeIds, placeKind = null, onPlace, connectMode = false, onConnect, deathEvent = false, emptyState, children, className = '', style, fitSignal = 0, showControls = true, grid = true } = props;
  const uid = useId().replace(/:/g, '');
  const innerRef = useRef<SVGSVGElement | null>(null);
  const svgRef = (props.svgRef as RefObject<SVGSVGElement | null> | undefined) ?? innerRef;
  const currency = useAppStore((s) => s.currency);
  const { vp, vpRef, setVp, toWorld, zoomAt, zoomBy, fitTo, rect } = useViewport(svgRef, { minK: 0.12, maxK: 3.5 });

  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);
  const [connecting, setConnecting] = useState<{ fromId: string; x: number; y: number } | null>(null);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const gesture = useRef<{ mode: 'pan' | 'node' | 'port' | 'edge' | 'none'; id?: string; sx: number; sy: number; vx: number; vy: number; nx: number; ny: number; moved: boolean; pointerId: number } | null>(null);
  const pinch = useRef(pinchState());

  useEffect(() => { if (!connectMode) setConnectFrom(null); }, [connectMode]);

  const nodes = useMemo(() => Object.fromEntries(structure.nodes.map((n) => [n.id, n])), [structure.nodes]);

  // ── Per-view derived data ──────────────────────────────────────────────
  const maxValue = useMemo(() => Math.max(1, ...structure.nodes.map((n) => n.value ?? 0)), [structure.nodes]);
  const sizeOf = useCallback((n: StructureNode) => {
    if (view !== 'ownership') return nodeSize(n);
    const v = n.value;
    const scale = v === undefined ? 0.9 : 0.78 + 0.72 * Math.sqrt(v / maxValue);
    return nodeSize(n, scale);
  }, [view, maxValue]);

  const visibleEdges = useMemo(() => structure.edges.filter((e) => RELATIONSHIP_META[e.kind].maps.includes(view) && nodes[e.from] && nodes[e.to]), [structure.edges, view, nodes]);

  const creditorOriginId = props.creditorOriginId ?? defaultCreditorOrigin(structure);
  const deceasedId = props.deceasedId ?? defaultDeceased(structure);
  const reach = useMemo(() => (view === 'liability' && creditorOriginId && nodes[creditorOriginId] ? creditorReach(structure, creditorOriginId) : null), [view, structure, creditorOriginId, nodes]);
  const fences = useMemo(() => (view === 'liability' ? liabilityFences(structure) : []), [view, structure]);
  const succ = useMemo(() => (view === 'succession' && deceasedId && nodes[deceasedId] ? succession(structure, deceasedId) : null), [view, structure, deceasedId, nodes]);

  const participating = useMemo(() => { const s = new Set<string>(); for (const e of visibleEdges) { s.add(e.from); s.add(e.to); } return s; }, [visibleEdges]);

  const viewNodeStyle = useCallback((n: StructureNode): { opacity: number; halo?: string; dashed?: boolean; badge?: string; badgeTone?: string } => {
    const sel = n.id === selectedId;
    const base = { opacity: 1 };
    switch (view) {
      case 'ownership': return { opacity: participating.has(n.id) || sel ? 1 : 0.45 };
      case 'control': {
        if (isController(structure, n.id)) return { opacity: 1, halo: 'blue' };
        if (isPureOwner(structure, n.id)) return { opacity: 0.35, badge: 'owns, decides nothing', badgeTone: 'var(--ivory-3)' };
        return { opacity: participating.has(n.id) ? 0.9 : 0.5 };
      }
      case 'cashflow': return { opacity: participating.has(n.id) || sel ? 1 : 0.38 };
      case 'liability': {
        if (!reach) return base;
        if (n.id === reach.originId) return { opacity: 1, halo: 'red', badge: 'claim arises here', badgeTone: 'var(--red)' };
        const step = reach.steps.find((s) => s.nodeId === n.id);
        if (step) return { opacity: 1, halo: 'red', badge: step.throughGuarantee ? 'reached via guarantee' : 'reachable', badgeTone: 'var(--red)' };
        return { opacity: 0.8 };
      }
      case 'succession': {
        if (!succ) return base;
        if (n.id === succ.deceasedId) return deathEvent ? { opacity: 0.55, dashed: true, badge: '† death event', badgeTone: 'var(--violet)' } : { opacity: 1, halo: 'gold' };
        const receives = succ.receivers.some((r) => r.nodeId === n.id) || succ.payouts.some((p) => p.toId === n.id);
        const trusteeOf = structure.edges.some((e) => e.kind === 'trustee' && e.from === n.id);
        const inEstate = succ.estate.find((x) => x.nodeId === n.id);
        const vacancy = succ.vacancies.find((v) => v.nodeId === n.id);
        if (!deathEvent) return { opacity: receives || trusteeOf ? 1 : participating.has(n.id) ? 0.9 : 0.5, halo: receives ? 'violet' : undefined };
        if (receives) return { opacity: 1, halo: 'violet', badge: 'receives', badgeTone: 'var(--violet)' };
        if (vacancy) return { opacity: 1, halo: 'red', badge: `${RELATIONSHIP_META[vacancy.role].label.toLowerCase()} role vacant`, badgeTone: 'var(--red)' };
        if (inEstate) return { opacity: 1, dashed: true, badge: inEstate.treatment === 'probate' ? '→ estate / probate' : inEstate.treatment === 'trust-terms' ? 'passes by trust terms' : inEstate.treatment === 'beneficiary-designation' ? 'by designation' : 'per operating / buy-sell agreement', badgeTone: 'var(--gold)' };
        if (trusteeOf) return { opacity: 1, halo: 'blue', badge: 'continues as trustee', badgeTone: 'var(--blue)' };
        if (categoryOf(n) === 'trust') return { opacity: 0.95 };
        return { opacity: 0.3 };
      }
    }
  }, [view, structure, participating, reach, succ, deathEvent, selectedId]);

  // ── Fit ────────────────────────────────────────────────────────────────
  const fitAll = useCallback((animate = true) => {
    if (!structure.nodes.length) { setVp({ x: 0, y: 0, k: 1 }); return; }
    fitTo(bboxOf(structure.nodes.map((n) => ({ x: n.x, y: n.y, w: nodeSize(n).w + 40, h: nodeSize(n).h + 60 }))), 48, animate, 1.25);
  }, [structure.nodes, fitTo, setVp]);
  const fittedFor = useRef<string>('');
  useEffect(() => {
    const key = `${structure.id}:${fitSignal}`;
    if (fittedFor.current === key) return;
    fittedFor.current = key;
    const t = setTimeout(() => fitAll(fittedFor.current !== `${structure.id}:0`), 20);
    return () => clearTimeout(t);
  }, [structure.id, fitSignal, fitAll]);

  // ── Pointer handling ───────────────────────────────────────────────────
  const hitNode = useCallback((wx: number, wy: number): StructureNode | undefined => {
    return [...structure.nodes].reverse().find((n) => { const s = sizeOf(n); return Math.abs(wx - n.x) <= s.w / 2 + 6 && Math.abs(wy - n.y) <= s.h / 2 + 6; });
  }, [structure.nodes, sizeOf]);

  const onPointerDown = (e: RPointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current; if (!svg) return;
    if (e.pointerType === 'touch') { pinch.current.down(e.pointerId, e.clientX, e.clientY); if (pinch.current.count === 2) { gesture.current = null; return; } }
    const target = (e.target as Element).closest('[data-port],[data-node],[data-edge]');
    const v = vpRef.current;
    const g = { sx: e.clientX, sy: e.clientY, vx: v.x, vy: v.y, nx: 0, ny: 0, moved: false, pointerId: e.pointerId };
    if (target?.hasAttribute('data-port') && !readOnly) {
      const id = target.getAttribute('data-port')!;
      const w = toWorld(e.clientX, e.clientY);
      setConnecting({ fromId: id, x: w.x, y: w.y });
      gesture.current = { ...g, mode: 'port', id };
    } else if (target?.hasAttribute('data-node')) {
      const id = target.getAttribute('data-node')!;
      const n = nodes[id];
      gesture.current = { ...g, mode: 'node', id, nx: n?.x ?? 0, ny: n?.y ?? 0 };
    } else if (target?.hasAttribute('data-edge')) {
      gesture.current = { ...g, mode: 'edge', id: target.getAttribute('data-edge')! };
    } else {
      gesture.current = { ...g, mode: 'pan' };
    }
    svg.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: RPointerEvent<SVGSVGElement>) => {
    if (e.pointerType === 'touch') {
      const p = pinch.current.move(e.pointerId, e.clientX, e.clientY);
      if (p) { const r = rect(); zoomAt(p.mx - r.left, p.my - r.top, p.factor); return; }
      if (pinch.current.count === 2) return;
    }
    const g = gesture.current; if (!g || g.pointerId !== e.pointerId) {
      // hover tracking for connect feedback
      if (connecting) { const w = toWorld(e.clientX, e.clientY); setConnecting({ ...connecting, x: w.x, y: w.y }); setHoverNode(hitNode(w.x, w.y)?.id ?? null); }
      return;
    }
    const dx = e.clientX - g.sx, dy = e.clientY - g.sy;
    if (!g.moved && Math.hypot(dx, dy) > 4) g.moved = true;
    if (g.mode === 'pan') { setVp((v) => ({ ...v, x: g.vx + dx, y: g.vy + dy })); }
    else if (g.mode === 'node' && g.moved && !readOnly && g.id) {
      const k = vpRef.current.k;
      const x = Math.round((g.nx + dx / k) / 8) * 8, y = Math.round((g.ny + dy / k) / 8) * 8;
      setDrag({ id: g.id, x, y });
    } else if (g.mode === 'port') {
      const w = toWorld(e.clientX, e.clientY);
      setConnecting((c) => (c ? { ...c, x: w.x, y: w.y } : c));
      setHoverNode(hitNode(w.x, w.y)?.id ?? null);
    }
  };

  const onPointerUp = (e: RPointerEvent<SVGSVGElement>) => {
    if (e.pointerType === 'touch') pinch.current.up(e.pointerId);
    const g = gesture.current; gesture.current = null;
    if (!g || g.pointerId !== e.pointerId) return;
    const w = toWorld(e.clientX, e.clientY);
    if (g.mode === 'pan') {
      if (!g.moved) {
        if (placeKind && onPlace) onPlace(placeKind, Math.round(w.x / 8) * 8, Math.round(w.y / 8) * 8);
        else { onSelect?.(null); setConnectFrom(null); }
      }
    } else if (g.mode === 'node' && g.id) {
      if (g.moved) {
        if (drag && onChange) onChange({ ...structure, nodes: structure.nodes.map((n) => (n.id === drag.id ? { ...n, x: drag.x, y: drag.y } : n)), updatedAt: Date.now() });
      } else if (connectMode && onConnect) {
        if (connectFrom && connectFrom !== g.id) { onConnect(connectFrom, g.id); setConnectFrom(null); }
        else { setConnectFrom(g.id); onSelect?.(g.id); }
      } else {
        onSelect?.(g.id);
      }
      setDrag(null);
    } else if (g.mode === 'port' && g.id) {
      const target = hitNode(w.x, w.y);
      if (target && target.id !== g.id && onConnect) onConnect(g.id, target.id);
      setConnecting(null); setHoverNode(null);
    } else if (g.mode === 'edge' && g.id && !g.moved) {
      onSelect?.(g.id);
    }
  };

  const onDrop = (e: React.DragEvent<SVGSVGElement>) => {
    e.preventDefault();
    const kind = e.dataTransfer.getData('application/x-component-kind') as ComponentKind;
    if (!kind || !COMPONENT_META[kind] || !onPlace) return;
    const w = toWorld(e.clientX, e.clientY);
    onPlace(kind, Math.round(w.x / 8) * 8, Math.round(w.y / 8) * 8);
  };

  // ── Edge bends for parallel edges ──────────────────────────────────────
  const bends = useMemo(() => {
    const groups = new Map<string, StructureEdge[]>();
    for (const e of visibleEdges) { const key = [e.from, e.to].sort().join('|'); groups.set(key, [...(groups.get(key) ?? []), e]); }
    const out: Record<string, number> = {};
    for (const [, list] of groups) {
      list.forEach((e, i) => {
        const n = list.length; const base = n === 1 ? 0.07 : 0;
        const offset = (i - (n - 1) / 2) * 34;
        const sign = e.from < e.to ? 1 : -1;
        const a = nodes[e.from], b = nodes[e.to];
        const dist = a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 200;
        out[e.id] = sign * (offset + base * dist);
      });
    }
    return out;
  }, [visibleEdges, nodes]);

  const posOf = (n: StructureNode): StructureNode => (drag && drag.id === n.id ? { ...n, x: drag.x, y: drag.y } : n);

  const highlightSet = useMemo(() => new Set(highlightEdgeIds ?? []), [highlightEdgeIds]);
  const reachEdgeSet = useMemo(() => new Set((reach?.steps ?? []).map((s) => s.viaEdgeId).filter(Boolean) as string[]), [reach]);
  const succEdgeSet = useMemo(() => new Set(succ ? [...succ.receivers.map((r) => r.edgeId), ...succ.payouts.map((p) => p.edgeId), ...succ.estate.map((x) => x.edgeId), ...succ.vacancies.map((v) => v.edgeId)] : []), [succ]);

  const gridStep = 24;
  const compact = (v: number) => money(v, { currency, compact: true, fromUSD: true });
  const isEmpty = structure.nodes.length === 0;
  const cursor = placeKind ? 'copy' : connectMode ? 'crosshair' : drag ? 'grabbing' : 'grab';

  return (
    <div className={`sc-frame ${className}`} style={{ height, ...style }}>
      <svg
        ref={svgRef}
        className={`sc-svg view-${view}`}
        style={{ cursor }}
        role="img"
        aria-label={`${structure.name} — ${view} view`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDragOver={(e) => { if (onPlace) e.preventDefault(); }}
        onDrop={onDrop}
        onDoubleClick={(e) => { const r = rect(); zoomAt(e.clientX - r.left, e.clientY - r.top, 1.5); }}
      >
        <defs>
          <pattern id={`${uid}-grid`} width={gridStep} height={gridStep} patternUnits="userSpaceOnUse" patternTransform={`translate(${vp.x} ${vp.y}) scale(${vp.k})`}>
            <path d={`M${gridStep},0 L0,0 L0,${gridStep}`} fill="none" stroke="var(--grid)" strokeWidth={1 / vp.k} />
          </pattern>
          <pattern id={`${uid}-grid-major`} width={gridStep * 5} height={gridStep * 5} patternUnits="userSpaceOnUse" patternTransform={`translate(${vp.x} ${vp.y}) scale(${vp.k})`}>
            <path d={`M${gridStep * 5},0 L0,0 L0,${gridStep * 5}`} fill="none" stroke="rgba(243,236,220,0.07)" strokeWidth={1 / vp.k} />
          </pattern>
          <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1b1f29" /><stop offset="100%" stopColor="#0f1218" /></linearGradient>
          {(['blue', 'red', 'violet', 'gold'] as const).map((c) => {
            const col = c === 'blue' ? '91,127,166' : c === 'red' ? '194,90,76' : c === 'violet' ? '124,108,168' : '201,169,97';
            return <radialGradient key={c} id={`${uid}-halo-${c}`}><stop offset="0%" stopColor={`rgba(${col},0.42)`} /><stop offset="60%" stopColor={`rgba(${col},0.14)`} /><stop offset="100%" stopColor={`rgba(${col},0)`} /></radialGradient>;
          })}
          <filter id={`${uid}-glow`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          {(Object.keys(RELATIONSHIP_META) as RelationshipKind[]).map((k) => (
            <marker key={k} id={`${uid}-arr-${k}`} markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M0,1 L9,5 L0,9 z" fill={RELATIONSHIP_META[k].color} />
            </marker>
          ))}
          <marker id={`${uid}-arr-sel`} markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,1 L9,5 L0,9 z" fill="var(--gold-2)" /></marker>
          <marker id={`${uid}-arr-red`} markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,1 L9,5 L0,9 z" fill="var(--red)" /></marker>
        </defs>

        {grid && <rect className="sc-grid" width="100%" height="100%" fill={`url(#${uid}-grid)`} />}
        {grid && <rect className="sc-grid" width="100%" height="100%" fill={`url(#${uid}-grid-major)`} />}

        <g transform={`translate(${vp.x} ${vp.y}) scale(${vp.k})`}>
          {/* Liability fences */}
          {view === 'liability' && fences.map((f) => {
            const members = f.memberIds.map((id) => nodes[id]).filter(Boolean).map(posOf);
            if (!members.length) return null;
            const bb = bboxOf(members.map((n) => ({ x: n.x, y: n.y, w: sizeOf(n).w + 36, h: sizeOf(n).h + 48 })));
            const breached = reach ? f.memberIds.some((id) => reach.reached.includes(id)) : false;
            const viaG = reach ? f.memberIds.some((id) => reach.guaranteeBreaches.includes(id)) : false;
            return (
              <g key={f.ownerId} className={`sc-fence ${breached ? 'breached' : ''}`}>
                <rect x={bb.minX} y={bb.minY} width={bb.maxX - bb.minX} height={bb.maxY - bb.minY} rx={18} />
                <text x={bb.minX + 10} y={bb.minY + 14}>{breached ? (viaG ? 'FENCE BRIDGED BY GUARANTEE' : 'INSIDE CREDITOR REACH') : 'LIABILITY FENCE'}</text>
              </g>
            );
          })}

          {/* Edges */}
          {visibleEdges.map((e) => {
            const a = posOf(nodes[e.from]), b = posOf(nodes[e.to]);
            const geom = edgeGeometry(a, b, sizeOf(a), sizeOf(b), bends[e.id] ?? 0);
            const meta = RELATIONSHIP_META[e.kind];
            const selected = e.id === selectedId;
            const hl = highlightSet.has(e.id);
            const inReach = view === 'liability' && reachEdgeSet.has(e.id);
            const inSucc = view === 'succession' && deathEvent && succEdgeSet.has(e.id);
            const faded = (highlightSet.size > 0 && !hl && !selected) || (view === 'succession' && deathEvent && !inSucc && !selected) || (view === 'liability' && reach && !inReach && !selected && e.kind !== 'guarantees');
            const color = inReach ? 'var(--red)' : meta.color;
            const width = selected ? 3 : hl || inReach || inSucc ? 2.6 : 1.6;
            const marker = selected ? `url(#${uid}-arr-sel)` : inReach ? `url(#${uid}-arr-red)` : `url(#${uid}-arr-${e.kind})`;
            let label = meta.label;
            if (e.kind === 'owns' && e.percent !== undefined) label += ` ${e.percent}%`;
            if (view === 'cashflow' && isLoanEdge(e) && e.loan) label = `DEBT SERVICE ${compact(loanSummary(e.loan).annualDebtService)}/yr`;
            else if (view === 'liability' && isLoanEdge(e) && e.loan) label = `${meta.label} ${compact(e.loan.principal)}`;
            else if (view !== 'ownership' && e.label) label += ` · ${fit(e.label, 18)}`;
            const flows = view === 'cashflow' ? flowStyle(e) : [];
            const lw = label.length * 6.1 + 14;
            return (
              <g key={e.id} className={`sc-edge ${selected ? 'selected' : ''}`} opacity={faded ? 0.3 : 1} data-edge={e.id}>
                <path d={geom.d} className="sc-edge-hit" />
                <path d={geom.d} className={`sc-edge-line ${view === 'cashflow' ? 'flow-line' : ''}`} stroke={color} strokeWidth={width} markerEnd={marker} filter={selected || hl ? `url(#${uid}-glow)` : undefined} />
                {flows.map((f, i) => (
                  <circle key={i} r={f.dir === 1 ? 3 : 2.4} fill={f.color} className="sc-dot">
                    <animateMotion dur={`${f.dur}s`} repeatCount="indefinite" path={f.dir === 1 ? geom.d : geom.dRev} begin={`${(i * 0.7) % 2}s`} />
                  </circle>
                ))}
                <g className="sc-edge-label" transform={`translate(${geom.mid.x} ${geom.mid.y})`}>
                  <rect x={-lw / 2} y={-9} width={lw} height={18} rx={9} />
                  <text textAnchor="middle" dominantBaseline="central" fill={color}>{label}</text>
                </g>
              </g>
            );
          })}

          {/* Connect preview */}
          {connecting && nodes[connecting.fromId] && (() => { const a = posOf(nodes[connecting.fromId]); return <path d={`M${a.x},${a.y} L${connecting.x},${connecting.y}`} className="sc-connect-preview" />; })()}

          {/* Nodes */}
          {structure.nodes.map((raw) => {
            const n = posOf(raw);
            const s = sizeOf(n);
            const cat = categoryOf(n);
            const meta = COMPONENT_META[n.kind];
            const color = CATEGORY_COLOR[cat];
            const st = viewNodeStyle(n);
            const selected = n.id === selectedId;
            const isConnectSource = connectFrom === n.id || connecting?.fromId === n.id;
            const isHover = hoverNode === n.id && (!!connecting);
            const haloR = Math.max(s.w, s.h) * 0.95;
            const showPercent = view === 'ownership';
            const ownedPct = showPercent ? structure.edges.filter((e) => e.kind === 'owns' && e.to === n.id && e.percent !== undefined).reduce((a, e) => a + (e.percent ?? 0), 0) : 0;
            return (
              <g key={n.id} className={`sc-node cat-${cat} ${selected ? 'selected' : ''} ${isConnectSource ? 'connect-source' : ''} ${isHover ? 'connect-target' : ''}`} transform={`translate(${n.x} ${n.y})`} opacity={st.opacity} data-node={n.id} style={{ color }}>
                {st.halo && <circle r={haloR} fill={`url(#${uid}-halo-${st.halo})`} className="sc-halo" />}
                {selected && <circle r={haloR * 0.8} fill={`url(#${uid}-halo-gold)`} className="sc-halo" />}
                <Shape cat={cat} w={s.w} h={s.h} fill={`url(#${uid}-glass)`} stroke={selected ? 'var(--gold-2)' : color} dashed={st.dashed} selected={selected} />
                {cat === 'person' ? (
                  <>
                    <text className="sc-short" textAnchor="middle" dominantBaseline="central" y={-4} fill={color}>{meta.short}</text>
                    <text className="sc-kind" textAnchor="middle" y={12} fill="var(--ivory-3)">{fit(meta.label, 12)}</text>
                    <text className="sc-label" textAnchor="middle" y={s.h / 2 + 16} fill="var(--ivory)">{fit(n.label, 26)}</text>
                    {(n.jurisdiction || n.value !== undefined) && <text className="sc-sub" textAnchor="middle" y={s.h / 2 + 30} fill="var(--ivory-3)">{[n.jurisdiction, n.value !== undefined ? compact(n.value) : null].filter(Boolean).join(' · ')}</text>}
                  </>
                ) : (
                  <>
                    <g transform={`translate(${-s.w / 2 + 8} ${-s.h / 2 + 7})`}>
                      <rect width={Math.max(26, meta.short.length * 6.4 + 8)} height={14} rx={4} fill={color} opacity={0.14} />
                      <text className="sc-short" x={Math.max(26, meta.short.length * 6.4 + 8) / 2} y={7.5} textAnchor="middle" dominantBaseline="central" fill={color}>{meta.short}</text>
                    </g>
                    <text className="sc-label" textAnchor="middle" y={cat === 'instrument' ? 5 : 4} fill="var(--ivory)">{fit(n.label, Math.floor(s.w / 7))}</text>
                    {cat !== 'instrument' && <text className="sc-kind" textAnchor="middle" y={s.h / 2 - 9} fill="var(--ivory-3)">{fit([meta.label, n.jurisdiction].filter(Boolean).join(' · '), Math.floor(s.w / 5.2))}</text>}
                    {n.value !== undefined && <text className="sc-value" textAnchor="end" x={s.w / 2 - 8} y={-s.h / 2 + 13} fill={cat === 'asset' ? 'var(--green-2)' : 'var(--gold-2)'}>{compact(n.value)}</text>}
                  </>
                )}
                {showPercent && ownedPct > 0 && <g transform={`translate(0 ${-s.h / 2 - 2})`}><rect x={-22} y={-9} width={44} height={16} rx={8} fill="var(--bg-1)" stroke="var(--gold)" strokeWidth={1} /><text className="sc-pct" textAnchor="middle" dominantBaseline="central" fill="var(--gold-2)">{Math.round(ownedPct * 10) / 10}%</text></g>}
                {st.badge && (
                  <g transform={`translate(0 ${s.h / 2 + (cat === 'person' ? 42 : 14)})`}>
                    <rect x={-(st.badge.length * 5.2 + 14) / 2} y={-8} width={st.badge.length * 5.2 + 14} height={16} rx={8} fill="var(--bg-1)" stroke={st.badgeTone} strokeWidth={1} />
                    <text className="sc-badge" textAnchor="middle" dominantBaseline="central" fill={st.badgeTone}>{st.badge}</text>
                  </g>
                )}
                {!readOnly && (
                  <circle className="sc-port" data-port={n.id} cx={cat === 'person' ? s.w / 2 : s.w / 2} cy={0} r={7} />
                )}
              </g>
            );
          })}
        </g>

        {!readOnly && placeKind && <text x={16} y={rect().height - 16} className="sc-hint">Tap or click the canvas to place: {COMPONENT_META[placeKind].label} · Esc to cancel</text>}
        {connectMode && <text x={16} y={rect().height - 16} className="sc-hint">{connectFrom ? `Now tap the node that ${nodes[connectFrom]?.label ?? 'it'} relates to` : 'Tap the first node, then the second'} · Esc to cancel</text>}
      </svg>

      {isEmpty && (
        <div className="sc-empty">{emptyState ?? <div className="empty" style={{ border: 0 }}><div className="display" style={{ fontSize: '1.4rem', color: 'var(--ivory)' }}>Nothing on the canvas yet</div><p className="small" style={{ marginTop: 8 }}>Drag a component from the palette, or load a template.</p></div>}</div>
      )}

      {showControls && (
        <div className="sc-controls" role="group" aria-label="Zoom controls">
          <button className="btn sm" onClick={() => zoomBy(1.3)} aria-label="Zoom in">+</button>
          <button className="btn sm" onClick={() => zoomBy(1 / 1.3)} aria-label="Zoom out">−</button>
          <button className="btn sm" onClick={() => fitAll(true)} aria-label="Fit to screen">Fit</button>
          <span className="tiny mono muted sc-zoom-readout">{Math.round(vp.k * 100)}%</span>
        </div>
      )}
      {children}
    </div>
  );
}

function Shape({ cat, w, h, fill, stroke, dashed, selected }: { cat: ComponentCategory; w: number; h: number; fill: string; stroke: string; dashed?: boolean; selected?: boolean }) {
  const common = { fill, stroke, strokeWidth: selected ? 2 : 1.3, strokeDasharray: dashed ? '5 4' : undefined, className: 'sc-shape' };
  if (cat === 'person') return <circle r={w / 2} {...common} />;
  if (cat === 'trust') {
    const c = h * 0.32;
    const pts = [[-w / 2 + c, -h / 2], [w / 2 - c, -h / 2], [w / 2, 0], [w / 2 - c, h / 2], [-w / 2 + c, h / 2], [-w / 2, 0]].map((p) => p.join(',')).join(' ');
    return <polygon points={pts} {...common} strokeLinejoin="round" />;
  }
  if (cat === 'instrument') return <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} {...common} />;
  if (cat === 'institution') return <g><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} {...common} /><rect x={-w / 2 + 4} y={-h / 2 + 4} width={w - 8} height={h - 8} rx={7} fill="none" stroke={stroke} strokeWidth={0.6} opacity={0.5} /></g>;
  if (cat === 'asset') return <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} {...common} strokeWidth={selected ? 2 : 1.6} />;
  return <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} {...common} />;
}

export { CONTROL_KINDS, loanParties };
