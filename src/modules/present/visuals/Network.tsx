import type { ReactNode } from 'react';
import { TONE_COLOR, type Tone } from './Frame';

export interface Pt { x: number; y: number }

/**
 * SVG entity node (rounded rect, pill or circle) with label and optional sub-label.
 * Fades/scales in when `visible` is true; `dim` lowers opacity (use for de-emphasis).
 * Coordinates are the node center in the parent SVG's units.
 */
export function EntityNode({ x, y, label, sub, tone = 'ivory', shape = 'rect', w = 240, h = 84, r = 44, visible = true, dim, highlight, fontSize = 24, children }: {
  x: number; y: number; label: ReactNode; sub?: ReactNode; tone?: Tone; shape?: 'rect' | 'pill' | 'circle'; w?: number; h?: number; r?: number; visible?: boolean; dim?: boolean; highlight?: boolean; fontSize?: number; children?: ReactNode;
}) {
  const color = TONE_COLOR[tone];
  const op = visible ? (dim ? 0.3 : 1) : 0;
  return (
    <g className="present-node-g" style={{ opacity: op, transform: `translate(${x}px, ${y}px) scale(${visible ? 1 : 0.7})`, transformOrigin: '0 0' }}>
      {highlight && (shape === 'circle' ? <circle r={r + 14} fill={color} opacity={0.12} /> : <rect x={-w / 2 - 10} y={-h / 2 - 10} width={w + 20} height={h + 20} rx={shape === 'pill' ? (h + 20) / 2 : 22} fill={color} opacity={0.1} />)}
      {shape === 'circle'
        ? <circle r={r} fill="rgba(13,16,22,0.92)" stroke={color} strokeWidth={2} />
        : <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={shape === 'pill' ? h / 2 : 16} fill="rgba(13,16,22,0.92)" stroke={color} strokeWidth={2} />}
      <text textAnchor="middle" y={sub ? -4 : fontSize * 0.35} style={{ fontSize, fill: 'var(--ivory)', fontWeight: 400 }}>{label}</text>
      {sub && <text textAnchor="middle" y={fontSize * 0.95} style={{ fontSize: fontSize * 0.62, fill: color, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{sub}</text>}
      {children}
    </g>
  );
}

function pathFor(a: Pt, b: Pt, curve: number) {
  if (!curve) return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const dx = b.x - a.x, dy = b.y - a.y; const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  return `M ${a.x} ${a.y} Q ${mx + nx * curve} ${my + ny * curve} ${b.x} ${b.y}`;
}

/**
 * SVG edge between two points with the platform's arrow semantics (tone).
 * - `visible`: draws the line (animated stroke draw) when it becomes true
 * - `flow`: animated dashed stroke; `dot`: a moving dot travelling along the path
 * - `curve`: perpendicular bend in px (0 = straight); `arrow`: arrowhead at the end
 * - `label`: text at the midpoint
 */
export function FlowEdge({ from, to, tone = 'ivory', visible = true, flow, dot, curve = 0, arrow = true, label, width = 2.5, dim, dashed, dotDuration = 2.2 }: {
  from: Pt; to: Pt; tone?: Tone; visible?: boolean; flow?: boolean; dot?: boolean; curve?: number; arrow?: boolean; label?: ReactNode; width?: number; dim?: boolean; dashed?: boolean; dotDuration?: number;
}) {
  const color = TONE_COLOR[tone];
  const d = pathFor(from, to, curve);
  const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
  const dx = to.x - from.x, dy = to.y - from.y; const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const lx = mx + nx * (curve / 2 + 18), ly = my + ny * (curve / 2 + 18);
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <g className="present-edge-g" style={{ opacity: visible ? (dim ? 0.25 : 1) : 0 }}>
      <path d={d} stroke={color} strokeWidth={width} fill="none" opacity={0.35} />
      {visible && <path key={`draw-${visible}`} d={d} stroke={color} strokeWidth={width} fill="none" className={flow ? 'present-flow' : 'present-draw'} strokeDasharray={dashed && !flow ? '10 10' : undefined} />}
      {arrow && visible && (
        <g transform={`translate(${to.x} ${to.y}) rotate(${ang})`}>
          <path d="M -16 -8 L 0 0 L -16 8 Z" fill={color} />
        </g>
      )}
      {dot && visible && (
        <circle r={6} fill={color} style={{ filter: `drop-shadow(0 0 8px ${color})` }}>
          <animateMotion dur={`${dotDuration}s`} repeatCount="indefinite" path={d} />
        </circle>
      )}
      {label && visible && <text x={lx} y={ly} textAnchor="middle" style={{ fontSize: 17, fill: color, letterSpacing: '0.08em' }}>{label}</text>}
    </g>
  );
}

export interface NetNode { id: string; x: number; y: number; label: ReactNode; sub?: ReactNode; tone?: Tone; shape?: 'rect' | 'pill' | 'circle'; w?: number; h?: number; r?: number; /** step at which the node appears (default 0) */ appearAt?: number; /** step at which the node is de-emphasised */ dimAt?: number }
export interface NetEdge { from: string; to: string; tone?: Tone; appearAt?: number; flow?: boolean; dot?: boolean; curve?: number; label?: ReactNode; arrow?: boolean; dashed?: boolean; dimAt?: number }

/** Point on a node's boundary in the direction of another point, so edges stop at the border. */
export function anchor(n: NetNode, toward: Pt): Pt {
  const dx = toward.x - n.x, dy = toward.y - n.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  if ((n.shape ?? 'rect') === 'circle') { const r = n.r ?? 44; return { x: n.x + ux * r, y: n.y + uy * r }; }
  const w = (n.w ?? 240) / 2, h = (n.h ?? 84) / 2;
  const s = Math.min(w / Math.max(Math.abs(ux), 1e-6), h / Math.max(Math.abs(uy), 1e-6));
  return { x: n.x + ux * s, y: n.y + uy * s };
}

/**
 * Assembles a network of nodes and edges progressively. Each node/edge declares `appearAt`
 * (the step at which it appears, default 0). Renders its own <svg> sized by `width`/`height`.
 * @param step current slide step
 * @param showAll ignore appearAt and show everything (used by thumbnails)
 */
export function NetworkAssemble({ nodes, edges, step, width = 1680, height = 760, showAll, children, style }: {
  nodes: NetNode[]; edges: NetEdge[]; step: number; width?: number; height?: number; showAll?: boolean; children?: ReactNode; style?: React.CSSProperties;
}) {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const vis = (at?: number) => showAll || step >= (at ?? 0);
  const dim = (at?: number) => !showAll && at !== undefined && step >= at;
  return (
    <svg className="present-svg" viewBox={`0 0 ${width} ${height}`} width={width} height={height} style={style}>
      {edges.map((e, i) => {
        const a = byId[e.from], b = byId[e.to];
        if (!a || !b) return null;
        return <FlowEdge key={i} from={anchor(a, b)} to={anchor(b, a)} tone={e.tone} visible={vis(e.appearAt) && vis(a.appearAt) && vis(b.appearAt)} flow={e.flow} dot={e.dot} curve={e.curve} label={e.label} arrow={e.arrow} dashed={e.dashed} dim={dim(e.dimAt)} />;
      })}
      {nodes.map((n) => <EntityNode key={n.id} x={n.x} y={n.y} label={n.label} sub={n.sub} tone={n.tone} shape={n.shape} w={n.w} h={n.h} r={n.r} visible={vis(n.appearAt)} dim={dim(n.dimAt)} />)}
      {children}
    </svg>
  );
}

/** Dashed rounded "fence" rectangle for liability boundaries. */
export function Fence({ x, y, w, h, label, tone = 'red', visible = true, broken }: { x: number; y: number; w: number; h: number; label?: string; tone?: Tone; visible?: boolean; broken?: boolean }) {
  const color = TONE_COLOR[tone];
  return (
    <g className="present-edge-g" style={{ opacity: visible ? 1 : 0 }}>
      <rect x={x} y={y} width={w} height={h} rx={26} fill={color} opacity={0.04} />
      <rect x={x} y={y} width={w} height={h} rx={26} fill="none" stroke={color} strokeWidth={2} strokeDasharray={broken ? '4 14' : '14 10'} opacity={broken ? 0.4 : 0.8} />
      {label && <text x={x + 22} y={y + 32} style={{ fontSize: 16, fill: color, letterSpacing: '0.22em', textTransform: 'uppercase' }}>{label}</text>}
    </g>
  );
}
