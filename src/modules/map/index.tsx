/** Master visual — the Family Wealth Architecture Map at /map. Twelve layers animate outward from one individual. */
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { COMPONENT_META } from '@/types/structure';
import { useAppStore } from '@/store/useAppStore';
import { Chip, Disclaimer } from '@/components/ui';
import { money } from '@/lib/format';
import { useViewport, pinchState } from '@/modules/lab/useViewport';
import { LAYERS, MAP_EDGES, TONE_COLOR, TONE_LABEL, ringRadius, nodePosition, layerOfNode, type Layer, type EdgeTone } from './layers';
import { masterMapToStructure } from './toStructure';
import './map.css';

const STEP_MS = 1150;
const OUTER = ringRadius(LAYERS.length - 1) + 150;

interface Placed { id: string; x: number; y: number; w: number; h: number; layer: Layer; kind: string; label: string; jurisdiction?: string; value?: number; cat: string }

export default function MasterMap() {
  const navigate = useNavigate();
  const saveStructure = useAppStore((s) => s.saveStructure);
  const currency = useAppStore((s) => s.currency);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { vp, vpRef, setVp, zoomAt, zoomBy, fitTo, centerOn, rect } = useViewport(svgRef, { minK: 0.12, maxK: 3 });
  const [revealed, setRevealed] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [active, setActive] = useState<Layer | null>(null);
  const [lastEntered, setLastEntered] = useState(0);
  const gesture = useRef<{ sx: number; sy: number; vx: number; vy: number; moved: boolean; id: number } | null>(null);
  const pinch = useRef(pinchState());
  const userMoved = useRef(false);

  const placed = useMemo<Placed[]>(() => LAYERS.flatMap((layer) => layer.nodes.map((n) => {
    const p = nodePosition(n, layer); const cat = COMPONENT_META[n.kind].category;
    return { id: n.id, x: p.x, y: p.y, w: cat === 'person' ? 64 : 150, h: cat === 'person' ? 64 : 54, layer, kind: n.kind, label: n.label, jurisdiction: n.jurisdiction, value: n.value, cat };
  })), []);
  const byId = useMemo(() => Object.fromEntries(placed.map((p) => [p.id, p])), [placed]);

  // Fit to the currently revealed rings while playing; full fit on mount.
  const fitRings = useCallback((count: number, animate = true) => {
    const r = ringRadius(Math.max(0, count - 1)) + 170;
    fitTo({ minX: -r, minY: -r, maxX: r, maxY: r }, 24, animate, 1.6);
  }, [fitTo]);
  useEffect(() => { const t = setTimeout(() => fitRings(2, false), 30); return () => clearTimeout(t); }, [fitRings]);

  // Autoplay
  useEffect(() => {
    if (!playing) return;
    if (revealed >= LAYERS.length) { setPlaying(false); return; }
    const t = setTimeout(() => { setRevealed((r) => { const n = Math.min(LAYERS.length, r + 1); setLastEntered(n - 1); return n; }); }, STEP_MS);
    return () => clearTimeout(t);
  }, [playing, revealed]);
  useEffect(() => { if (playing && !userMoved.current && !active) fitRings(revealed + 1); }, [revealed, playing, active, fitRings]);

  const step = (d: number) => { setPlaying(false); setRevealed((r) => { const n = Math.max(1, Math.min(LAYERS.length, r + d)); setLastEntered(n - 1); return n; }); };
  const restart = () => { setActive(null); setRevealed(1); setLastEntered(0); userMoved.current = false; setPlaying(true); fitRings(2); };
  const overview = () => { setActive(null); userMoved.current = false; fitTo({ minX: -OUTER, minY: -OUTER, maxX: OUTER, maxY: OUTER }, 24, true, 1.6); };

  const openLayer = useCallback((layer: Layer) => {
    setPlaying(false);
    setRevealed((r) => Math.max(r, layer.index + 1));
    setActive(layer);
    const pts = layer.nodes.map((n) => nodePosition(n, layer));
    const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length, cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
    const spread = Math.max(1, ...pts.map((p) => Math.hypot(p.x - cx, p.y - cy)));
    const r = rect();
    const k = Math.min(1.8, Math.max(0.7, Math.min(r.width, r.height) / (spread * 2 + 520)));
    centerOn(cx, cy, k);
  }, [centerOn, rect]);

  const openInLab = () => {
    const s = masterMapToStructure();
    saveStructure(s);
    navigate(`/lab?load=${s.id}`);
  };

  // ── Pointer: pan / pinch / click ───────────────────────────────────────
  const onPointerDown = (e: RPointerEvent<SVGSVGElement>) => {
    if (e.pointerType === 'touch') { pinch.current.down(e.pointerId, e.clientX, e.clientY); if (pinch.current.count === 2) { gesture.current = null; return; } }
    const v = vpRef.current;
    gesture.current = { sx: e.clientX, sy: e.clientY, vx: v.x, vy: v.y, moved: false, id: e.pointerId };
    svgRef.current?.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: RPointerEvent<SVGSVGElement>) => {
    if (e.pointerType === 'touch') { const p = pinch.current.move(e.pointerId, e.clientX, e.clientY); if (p) { const r = rect(); zoomAt(p.mx - r.left, p.my - r.top, p.factor); userMoved.current = true; return; } if (pinch.current.count === 2) return; }
    const g = gesture.current; if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.sx, dy = e.clientY - g.sy;
    if (!g.moved && Math.hypot(dx, dy) > 4) { g.moved = true; userMoved.current = true; }
    if (g.moved) setVp((v) => ({ ...v, x: g.vx + dx, y: g.vy + dy }));
  };
  const onPointerUp = (e: RPointerEvent<SVGSVGElement>) => {
    if (e.pointerType === 'touch') pinch.current.up(e.pointerId);
    const g = gesture.current; gesture.current = null;
    if (!g || g.id !== e.pointerId || g.moved) return;
    const t = (e.target as Element).closest('[data-layer]');
    const id = t?.getAttribute('data-layer');
    const layer = id ? LAYERS.find((l) => l.id === id) : undefined;
    if (layer) openLayer(layer); else setActive(null);
  };

  const isRevealed = (l: Layer) => l.index < revealed;
  const neighbours = useMemo(() => {
    if (!active) return null;
    const ids = new Set(active.nodes.map((n) => n.id));
    for (const e of MAP_EDGES) { if (ids.has(e.from)) ids.add(e.to); if (ids.has(e.to)) ids.add(e.from); }
    return ids;
  }, [active]);

  const compact = (v: number) => money(v, { currency, compact: true, fromUSD: true });
  const activeIdx = active ? active.index : -1;

  return (
    <div className={`map-root ${active ? 'panel-open' : ''}`}>
      <div className="map-stage">
        <svg ref={svgRef} className="map-svg" role="img" aria-label="Family Wealth Architecture Map" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onDoubleClick={(e) => { const r = rect(); zoomAt(e.clientX - r.left, e.clientY - r.top, 1.5); }}>
          <defs>
            <radialGradient id="mm-center"><stop offset="0%" stopColor="rgba(201,169,97,0.35)" /><stop offset="100%" stopColor="rgba(201,169,97,0)" /></radialGradient>
            <linearGradient id="mm-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1b1f29" /><stop offset="100%" stopColor="#0f1218" /></linearGradient>
            {(Object.keys(TONE_COLOR) as EdgeTone[]).map((t) => (
              <marker key={t} id={`mm-arr-${t}`} markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,1 L8,4.5 L0,8 z" fill={TONE_COLOR[t]} /></marker>
            ))}
          </defs>
          <g transform={`translate(${vp.x} ${vp.y}) scale(${vp.k})`}>
            <circle r={ringRadius(Math.min(LAYERS.length - 1, revealed)) * 0.9} fill="url(#mm-center)" className="map-center-glow" opacity={0.6} />
            {/* Rings */}
            {LAYERS.slice(1).map((l) => (
              <g key={l.id} data-layer={l.id} style={{ cursor: 'pointer' }} opacity={isRevealed(l) ? 1 : 0}>
                <circle r={ringRadius(l.index)} className={`map-ring ${activeIdx === l.index ? 'active' : ''}`} />
                <circle r={ringRadius(l.index)} fill="none" stroke="transparent" strokeWidth={26} />
                <text className={`map-ring-label ${activeIdx === l.index ? 'active' : ''}`} x={-ringRadius(l.index) * 0.7071 + 10} y={-ringRadius(l.index) * 0.7071 - 6}>{String(l.index).padStart(2, '0')} · {l.title}</text>
              </g>
            ))}
            {/* Edges */}
            {MAP_EDGES.map((e, i) => {
              const a = byId[e.from], b = byId[e.to]; if (!a || !b) return null;
              const la = a.layer, lb = b.layer;
              if (!isRevealed(la) || !isRevealed(lb)) return null;
              const maxIdx = Math.max(la.index, lb.index);
              const entering = maxIdx === lastEntered && lastEntered > 0;
              const dim = neighbours ? !(neighbours.has(e.from) && neighbours.has(e.to)) || !(active!.nodes.some((n) => n.id === e.from || n.id === e.to)) : false;
              const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
              const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
              const bend = ((i % 3) - 1) * 0.08 * len + (e.from < e.to ? 14 : -14);
              const c = { x: mx + (-dy / len) * bend, y: my + (dx / len) * bend };
              const p0 = boundary(a, c), p1 = boundary(b, c);
              const d = `M${p0.x},${p0.y} Q${c.x},${c.y} ${p1.x},${p1.y}`;
              const mid = { x: 0.25 * p0.x + 0.5 * c.x + 0.25 * p1.x, y: 0.25 * p0.y + 0.5 * c.y + 0.25 * p1.y };
              const label = e.label ?? (e.percent !== undefined ? `${e.percent}%` : null);
              const color = TONE_COLOR[e.tone];
              return (
                <g key={i} className={dim ? 'dim' : ''} opacity={dim ? 0.15 : 1} style={{ transition: 'opacity 0.4s' }}>
                  <path d={d} className={`map-edge ${entering ? 'enter' : ''} ${e.tone === 'cash' && !entering ? 'flow' : ''}`} stroke={color} markerEnd={`url(#mm-arr-${e.tone})`} />
                  {e.tone === 'cash' && !entering && <circle r={2.6} fill={color} className="map-dot"><animateMotion dur={`${2.2 + (i % 3) * 0.5}s`} repeatCount="indefinite" path={d} /></circle>}
                  {label && (vp.k > 0.55 || active) && !dim && <g className="map-edge-label" transform={`translate(${mid.x} ${mid.y})`}><rect x={-(label.length * 5.4 + 12) / 2} y={-8} width={label.length * 5.4 + 12} height={16} rx={8} /><text textAnchor="middle" dominantBaseline="central" fill={color}>{label}</text></g>}
                </g>
              );
            })}
            {/* Nodes */}
            {placed.map((p) => {
              if (!isRevealed(p.layer)) return null;
              const entering = p.layer.index === lastEntered && lastEntered > 0;
              const isActive = active?.id === p.layer.id;
              const dim = neighbours ? !neighbours.has(p.id) : false;
              const meta = COMPONENT_META[p.kind as keyof typeof COMPONENT_META];
              return (
                <g key={p.id} className={`map-node ${entering ? 'enter' : ''} ${isActive ? 'active' : ''} ${dim ? 'dim' : ''}`} transform={`translate(${p.x} ${p.y})`} style={{ color: p.layer.color, transformOrigin: `${p.x}px ${p.y}px`, transition: 'opacity 0.4s' }} data-layer={p.layer.id}>
                  {isActive && <circle r={Math.max(p.w, p.h) * 0.9} fill="url(#mm-center)" />}
                  {p.cat === 'person' ? <circle r={p.w / 2} className="shape" stroke={p.layer.color} fill="url(#mm-glass)" />
                    : p.cat === 'trust' ? <polygon points={hex(p.w, p.h)} className="shape" stroke={p.layer.color} fill="url(#mm-glass)" strokeLinejoin="round" />
                    : <rect x={-p.w / 2} y={-p.h / 2} width={p.w} height={p.h} rx={p.cat === 'instrument' ? p.h / 2 : 10} className="shape" stroke={p.layer.color} fill="url(#mm-glass)" />}
                  {p.cat === 'person' ? (
                    <>
                      <text className="short" textAnchor="middle" dominantBaseline="central" y={-3} fill={p.layer.color}>{meta.short}</text>
                      <text className="label" textAnchor="middle" y={p.h / 2 + 16}>{p.label}</text>
                      {p.jurisdiction && <text className="sub" textAnchor="middle" y={p.h / 2 + 29}>{p.jurisdiction}</text>}
                    </>
                  ) : (
                    <>
                      <text className="short" x={-p.w / 2 + 10} y={-p.h / 2 + 14} fill={p.layer.color}>{meta.short}</text>
                      {p.value !== undefined && <text className="value" textAnchor="end" x={p.w / 2 - 10} y={-p.h / 2 + 14}>{compact(p.value)}</text>}
                      <text className="label" textAnchor="middle" y={5}>{p.label}</text>
                      <text className="sub" textAnchor="middle" y={p.h / 2 - 8}>{[meta.label, p.jurisdiction].filter(Boolean).join(' · ')}</text>
                    </>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* HUD */}
        <div className="map-hud">
          <div className="map-title">
            <div className="eyebrow">Master visual · {revealed}/{LAYERS.length} layers</div>
            <h2>Family Wealth Architecture Map</h2>
            <p className="small muted" style={{ margin: '6px 0 0' }}>One individual at the centre. Each ring is a layer of separation: people, trusts, companies, capital, institutions, generations. Click any layer to zoom in and read what it is for.</p>
          </div>
          <div className="map-transport" role="group" aria-label="Playback">
            <button className="btn sm ghost" onClick={restart} title="Restart">↺</button>
            <button className="btn sm ghost" onClick={() => step(-1)} disabled={revealed <= 1} title="Step back">‹</button>
            <button className="btn sm primary" onClick={() => { if (revealed >= LAYERS.length) restart(); else setPlaying((p) => !p); }} style={{ minWidth: 72, justifyContent: 'center' }}>{playing ? 'Pause' : revealed >= LAYERS.length ? 'Replay' : 'Play'}</button>
            <button className="btn sm ghost" onClick={() => step(1)} disabled={revealed >= LAYERS.length} title="Step forward">›</button>
            <button className="btn sm ghost" onClick={overview} title="Overview">Fit</button>
            <button className="btn sm" onClick={openInLab} title="Convert this map into an editable structure">Open in Structure Lab →</button>
          </div>
        </div>
        <div className="map-zoom"><button className="btn sm" onClick={() => zoomBy(1.3)} aria-label="Zoom in">+</button><button className="btn sm" onClick={() => zoomBy(1 / 1.3)} aria-label="Zoom out">−</button></div>
        <div className="map-legend" aria-label="Legend">
          <div className="eyebrow" style={{ fontSize: '0.6rem', marginBottom: 2 }}>Edges</div>
          {(Object.keys(TONE_COLOR) as EdgeTone[]).map((t) => <div key={t} className="it"><span className="sw" style={{ borderColor: TONE_COLOR[t] }} />{TONE_LABEL[t]}{t === 'cash' ? ' (animated)' : ''}</div>)}
          <div className="eyebrow" style={{ fontSize: '0.6rem', margin: '6px 0 2px' }}>Nodes</div>
          <div className="it"><span style={{ width: 10, height: 10, borderRadius: '50%', border: '1.4px solid var(--gold)' }} />People</div>
          <div className="it"><span style={{ width: 12, height: 10, background: 'var(--violet)', clipPath: 'polygon(22% 0,78% 0,100% 50%,78% 100%,22% 100%,0 50%)' }} />Trusts</div>
          <div className="it"><span style={{ width: 14, height: 9, borderRadius: 2, border: '1.4px solid var(--ivory-2)' }} />Companies</div>
          <div className="it"><span style={{ width: 14, height: 9, borderRadius: 2, border: '1.4px solid var(--green-2)' }} />Assets & capital</div>
        </div>
        <div className="map-layer-strip" role="tablist" aria-label="Layers">
          {LAYERS.map((l) => (
            <button key={l.id} role="tab" aria-selected={active?.id === l.id} className={`map-layer-chip ${isRevealed(l) ? 'revealed' : 'hidden-layer'} ${active?.id === l.id ? 'active' : ''}`} onClick={() => openLayer(l)}>
              <span className="n">{String(l.index).padStart(2, '0')}</span><span className="t">{l.title.replace('The ', '')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Side panel */}
      <aside className="map-panel" aria-live="polite">
        {active && (
          <div className="map-panel-inner fade-in" key={active.id}>
            <div className="row between">
              <div className="eyebrow" style={{ color: active.color }}>{active.eyebrow}</div>
              <button className="btn sm ghost" onClick={() => setActive(null)} aria-label="Close panel">✕</button>
            </div>
            <h3>{active.title}</h3>
            <p className="small" style={{ margin: 0 }}>{active.summary}</p>
            <div className="row" style={{ gap: 6 }}>{active.nodes.map((n) => <Chip key={n.id} tone={COMPONENT_META[n.kind].category === 'trust' ? 'violet' : COMPONENT_META[n.kind].category === 'asset' ? 'green' : 'gold'}>{n.label}</Chip>)}</div>
            {([
              ['What it is', active.detail.what], ['Who owns it', active.detail.owns], ['Who controls it', active.detail.controls], ['Where liability sits', active.detail.liability],
              ['Where money flows', active.detail.cash], ['What documentation connects it', active.detail.documents], ['What tax questions arise', active.detail.tax], ['What jurisdiction governs it', active.detail.jurisdiction], ['Which professionals are required', active.detail.professionals],
            ] as [string, string][]).map(([k, v]) => <div key={k} className="map-item"><div className="k">{k}</div><p className="v">{v}</p></div>)}
            <div className="row" style={{ gap: 8, marginTop: 4 }}>
              <Link to={`/academy/${active.chapterSlug}`} className="btn sm primary">Chapter: {active.chapterTitle} →</Link>
              <button className="btn sm ghost" onClick={openInLab}>Open in Structure Lab</button>
            </div>
            <div className="map-nav">
              <button className="btn sm ghost" disabled={active.index === 0} onClick={() => openLayer(LAYERS[active.index - 1])}>‹ {active.index > 0 ? LAYERS[active.index - 1].title.replace('The ', '') : ''}</button>
              <button className="btn sm ghost" disabled={active.index === LAYERS.length - 1} onClick={() => openLayer(LAYERS[active.index + 1])}>{active.index < LAYERS.length - 1 ? LAYERS[active.index + 1].title.replace('The ', '') : ''} ›</button>
            </div>
            <Disclaimer>Each layer is a set of questions, not a prescription. Whether a family needs it depends on residence, citizenship, assets, business activity and objectives — and every layer adds cost, reporting and governance work.</Disclaimer>
          </div>
        )}
      </aside>
    </div>
  );
}

function hex(w: number, h: number) {
  const c = h * 0.32;
  return [[-w / 2 + c, -h / 2], [w / 2 - c, -h / 2], [w / 2, 0], [w / 2 - c, h / 2], [-w / 2 + c, h / 2], [-w / 2, 0]].map((p) => p.join(',')).join(' ');
}
function boundary(p: Placed, toward: { x: number; y: number }) {
  const dx = toward.x - p.x, dy = toward.y - p.y, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
  if (p.cat === 'person') return { x: p.x + ux * (p.w / 2), y: p.y + uy * (p.w / 2) };
  const s = Math.min(p.w / 2 / (Math.abs(ux) || 1e-6), p.h / 2 / (Math.abs(uy) || 1e-6));
  return { x: p.x + ux * s, y: p.y + uy * s };
}
export { layerOfNode };
