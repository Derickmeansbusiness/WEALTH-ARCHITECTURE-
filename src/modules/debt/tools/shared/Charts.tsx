/**
 * Hand-rolled SVG charts for the Debt Studio tools. Responsive via viewBox, animated draw-in via
 * requestAnimationFrame, tooltips on hover. Colors come from the design tokens only.
 */
import { useMemo, useState, type ReactNode } from 'react';
import { useDrawIn, useTween } from './hooks';

export type ChartColor = 'gold' | 'gold-2' | 'green' | 'amber' | 'red' | 'blue' | 'violet' | 'ivory' | 'muted';
export const C: Record<ChartColor, string> = {
  gold: 'var(--gold)', 'gold-2': 'var(--gold-2)', green: 'var(--green-2)', amber: 'var(--amber)', red: 'var(--red)',
  blue: 'var(--blue)', violet: 'var(--violet)', ivory: 'var(--ivory-2)', muted: 'var(--muted)',
};
const col = (c: ChartColor | string) => (c in C ? C[c as ChartColor] : c);

export interface Series { id: string; label: string; values: number[]; color: ChartColor; area?: boolean; dashed?: boolean }

const finite = (v: number) => (Number.isFinite(v) ? v : 0);
const fmtDefault = (v: number) => (Math.abs(v) >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : Math.abs(v) >= 1e3 ? `${(v / 1e3).toFixed(0)}K` : v.toFixed(Math.abs(v) < 10 ? 2 : 0));

/** Nice axis ticks covering [lo, hi] (always includes 0 when the data straddles it). */
export function niceTicks(lo: number, hi: number, count = 5): number[] {
  if (!isFinite(lo) || !isFinite(hi)) return [0];
  if (lo === hi) { lo = lo === 0 ? -1 : lo * 0.9; hi = hi === 0 ? 1 : hi * 1.1; }
  const span = hi - lo;
  const raw = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const start = Math.floor(lo / step) * step;
  const end = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let t = start; t <= end + step / 2; t += step) ticks.push(Math.round(t / step) * step);
  return ticks;
}

export function Legend({ items }: { items: { label: string; color: ChartColor | string }[] }) {
  return <div className="dt-legend">{items.map((i) => <span key={i.label} style={{ ['--c' as string]: col(i.color) }}>{i.label}</span>)}</div>;
}

function useSvgPointer(W: number) {
  const [x, setX] = useState<number | null>(null);
  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setX(((e.clientX - r.left) / r.width) * W);
  };
  return { x, onMove, onLeave: () => setX(null) };
}

function Tip({ x, y, lines, W }: { x: number; y: number; lines: string[]; W: number }) {
  const w = Math.max(...lines.map((l) => l.length)) * 6.4 + 16;
  const h = lines.length * 14 + 10;
  const tx = x + 12 + w > W ? x - 12 - w : x + 12;
  const ty = Math.max(4, Math.min(y - h / 2, 1e9));
  return (
    <g className="dt-tip" style={{ pointerEvents: 'none' }}>
      <rect x={tx} y={ty} width={w} height={h} rx={6} />
      {lines.map((l, i) => <text key={i} x={tx + 8} y={ty + 14 + i * 14}>{l}</text>)}
    </g>
  );
}

// ── Line / area chart ──────────────────────────────────────────────────────
export function LineChart({ series, labels, height = 240, yFormat = fmtDefault, title, animKey, xTitle, note, zeroLine = true }: {
  series: Series[]; labels: string[]; height?: number; yFormat?: (v: number) => string; title?: string; animKey?: unknown; xTitle?: string; note?: ReactNode; zeroLine?: boolean;
}) {
  const W = 720, H = height, PL = 56, PR = 16, PT = 14, PB = 32;
  const p = useDrawIn(animKey ?? series.map((s) => s.values.join(',')).join('|'));
  const { x: px, onMove, onLeave } = useSvgPointer(W);
  const all = series.flatMap((s) => s.values.map(finite));
  const lo0 = Math.min(0, ...all), hi0 = Math.max(0, ...all);
  const ticks = useMemo(() => niceTicks(lo0, hi0), [lo0, hi0]);
  const lo = ticks[0], hi = ticks[ticks.length - 1];
  const n = Math.max(1, labels.length);
  const sx = (i: number) => PL + (n === 1 ? 0 : (i / (n - 1)) * (W - PL - PR));
  const sy = (v: number) => PT + (1 - (finite(v) - lo) / (hi - lo || 1)) * (H - PT - PB);
  const idx = px == null ? null : Math.max(0, Math.min(n - 1, Math.round(((px - PL) / (W - PL - PR)) * (n - 1))));
  const every = Math.ceil(n / 10);
  return (
    <div className="dt-chart-wrap">
      {title && <div className="dt-chart-title">{title}</div>}
      <svg viewBox={`0 0 ${W} ${H}`} className="dt-chart" onMouseMove={onMove} onMouseLeave={onLeave} role="img" aria-label={title ?? 'line chart'}>
        <defs><clipPath id="dt-clip-line"><rect x={0} y={0} width={PL + (W - PL - PR) * p + 2} height={H} /></clipPath></defs>
        {ticks.map((t) => <g key={t}><line className={t === 0 && zeroLine ? 'dt-axis' : 'dt-grid'} x1={PL} x2={W - PR} y1={sy(t)} y2={sy(t)} /><text x={PL - 8} y={sy(t) + 3} textAnchor="end">{yFormat(t)}</text></g>)}
        {labels.map((l, i) => (i % every === 0 || i === n - 1) && <text key={i} x={sx(i)} y={H - PB + 16} textAnchor="middle">{l}</text>)}
        {xTitle && <text x={W - PR} y={H - 4} textAnchor="end" className="dt-title" style={{ fontSize: 9 }}>{xTitle}</text>}
        <g clipPath="url(#dt-clip-line)">
          {series.map((s) => {
            const pts = s.values.map((v, i) => `${sx(i)},${sy(v)}`);
            if (pts.length === 0) return null;
            const d = `M${pts.join(' L')}`;
            return (
              <g key={s.id}>
                {s.area && <path d={`${d} L${sx(s.values.length - 1)},${sy(0)} L${sx(0)},${sy(0)} Z`} fill={col(s.color)} opacity={0.12} />}
                <path d={d} fill="none" stroke={col(s.color)} strokeWidth={1.8} strokeDasharray={s.dashed ? '5 5' : undefined} strokeLinejoin="round" />
              </g>
            );
          })}
        </g>
        {idx != null && (
          <g>
            <line x1={sx(idx)} x2={sx(idx)} y1={PT} y2={H - PB} stroke="var(--line-strong)" />
            {series.map((s) => s.values[idx] != null && <circle key={s.id} cx={sx(idx)} cy={sy(s.values[idx])} r={3.5} fill={col(s.color)} />)}
            <Tip x={sx(idx)} y={PT + 20} W={W} lines={[labels[idx] ?? '', ...series.map((s) => `${s.label}: ${yFormat(finite(s.values[idx]))}`)]} />
          </g>
        )}
      </svg>
      <Legend items={series.map((s) => ({ label: s.label, color: s.color }))} />
      {note && <div className="dt-chart-note">{note}</div>}
    </div>
  );
}

// ── Grouped bar chart ──────────────────────────────────────────────────────
export function BarChart({ groups, series, height = 240, yFormat = fmtDefault, title, animKey, note }: {
  groups: string[]; series: { label: string; color: ChartColor; values: number[] }[]; height?: number; yFormat?: (v: number) => string; title?: string; animKey?: unknown; note?: ReactNode;
}) {
  const W = 720, H = height, PL = 56, PR = 12, PT = 14, PB = 32;
  const p = useDrawIn(animKey ?? series.map((s) => s.values.join(',')).join('|'));
  const [hover, setHover] = useState<{ g: number; s: number } | null>(null);
  const all = series.flatMap((s) => s.values.map(finite));
  const ticks = useMemo(() => niceTicks(Math.min(0, ...all), Math.max(0, ...all)), [all.join(',')]);
  const lo = ticks[0], hi = ticks[ticks.length - 1];
  const sy = (v: number) => PT + (1 - (finite(v) - lo) / (hi - lo || 1)) * (H - PT - PB);
  const gw = (W - PL - PR) / Math.max(1, groups.length);
  const bw = Math.min(42, (gw * 0.72) / Math.max(1, series.length));
  return (
    <div className="dt-chart-wrap">
      {title && <div className="dt-chart-title">{title}</div>}
      <svg viewBox={`0 0 ${W} ${H}`} className="dt-chart" role="img" aria-label={title ?? 'bar chart'} onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => <g key={t}><line className={t === 0 ? 'dt-axis' : 'dt-grid'} x1={PL} x2={W - PR} y1={sy(t)} y2={sy(t)} /><text x={PL - 8} y={sy(t) + 3} textAnchor="end">{yFormat(t)}</text></g>)}
        {groups.map((g, gi) => {
          const cx = PL + gw * gi + gw / 2;
          const start = cx - (bw * series.length) / 2;
          return (
            <g key={g}>
              <text x={cx} y={H - PB + 16} textAnchor="middle">{g}</text>
              {series.map((s, si) => {
                const v = finite(s.values[gi]) * p;
                const y0 = sy(0), y1 = sy(v);
                return <rect key={s.label} x={start + si * bw + 2} y={Math.min(y0, y1)} width={bw - 4} height={Math.abs(y1 - y0)} fill={col(s.color)} opacity={hover && (hover.g !== gi || hover.s !== si) ? 0.45 : 0.9} rx={2} onMouseEnter={() => setHover({ g: gi, s: si })} />;
              })}
            </g>
          );
        })}
        {hover && <Tip W={W} x={PL + gw * hover.g + gw / 2} y={sy(finite(series[hover.s].values[hover.g])) - 10} lines={[groups[hover.g], `${series[hover.s].label}: ${yFormat(finite(series[hover.s].values[hover.g]))}`]} />}
      </svg>
      <Legend items={series.map((s) => ({ label: s.label, color: s.color }))} />
      {note && <div className="dt-chart-note">{note}</div>}
    </div>
  );
}

// ── Stacked bar chart ──────────────────────────────────────────────────────
export function StackedBarChart({ categories, series, height = 240, yFormat = fmtDefault, title, animKey, note, highlight }: {
  categories: string[]; series: { label: string; color: ChartColor; values: number[] }[]; height?: number; yFormat?: (v: number) => string; title?: string; animKey?: unknown; note?: ReactNode; highlight?: (i: number) => boolean;
}) {
  const W = 720, H = height, PL = 56, PR = 12, PT = 14, PB = 32;
  const p = useDrawIn(animKey ?? series.map((s) => s.values.join(',')).join('|'));
  const [hover, setHover] = useState<number | null>(null);
  const totals = categories.map((_, i) => series.reduce((s, x) => s + Math.max(0, finite(x.values[i])), 0));
  const ticks = useMemo(() => niceTicks(0, Math.max(0, ...totals)), [totals.join(',')]);
  const hi = ticks[ticks.length - 1] || 1;
  const sy = (v: number) => PT + (1 - v / hi) * (H - PT - PB);
  const gw = (W - PL - PR) / Math.max(1, categories.length);
  const bw = Math.min(46, gw * 0.7);
  const every = Math.ceil(categories.length / 12);
  return (
    <div className="dt-chart-wrap">
      {title && <div className="dt-chart-title">{title}</div>}
      <svg viewBox={`0 0 ${W} ${H}`} className="dt-chart" role="img" aria-label={title ?? 'stacked bar chart'} onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => <g key={t}><line className={t === 0 ? 'dt-axis' : 'dt-grid'} x1={PL} x2={W - PR} y1={sy(t)} y2={sy(t)} /><text x={PL - 8} y={sy(t) + 3} textAnchor="end">{yFormat(t)}</text></g>)}
        {categories.map((c, i) => {
          const cx = PL + gw * i + gw / 2;
          let acc = 0;
          const hl = highlight?.(i);
          return (
            <g key={c} onMouseEnter={() => setHover(i)}>
              {hl && <rect x={cx - gw / 2} y={PT} width={gw} height={H - PT - PB} fill="var(--amber)" opacity={0.07} />}
              {(i % every === 0 || i === categories.length - 1) && <text x={cx} y={H - PB + 16} textAnchor="middle">{c}</text>}
              {series.map((s) => {
                const v = Math.max(0, finite(s.values[i])) * p;
                const y1 = sy(acc + v), y0 = sy(acc);
                acc += v;
                return <rect key={s.label} x={cx - bw / 2} y={y1} width={bw} height={Math.max(0, y0 - y1)} fill={col(s.color)} opacity={hover != null && hover !== i ? 0.5 : 0.9} />;
              })}
            </g>
          );
        })}
        {hover != null && <Tip W={W} x={PL + gw * hover + gw / 2} y={sy(totals[hover]) - 10} lines={[categories[hover], ...series.map((s) => `${s.label}: ${yFormat(finite(s.values[hover]))}`), `Total: ${yFormat(totals[hover])}`]} />}
      </svg>
      <Legend items={series.map((s) => ({ label: s.label, color: s.color }))} />
      {note && <div className="dt-chart-note">{note}</div>}
    </div>
  );
}

// ── Horizontal segment bar (sources & uses, equity vs debt) ────────────────
export function SegmentBar({ segments, total, tall, format = fmtDefault, showLegend = true }: { segments: { label: string; value: number; color: ChartColor | string }[]; total?: number; tall?: boolean; format?: (v: number) => string; showLegend?: boolean }) {
  const sum = total ?? segments.reduce((s, x) => s + Math.max(0, finite(x.value)), 0);
  return (
    <div>
      <div className={`dt-segbar ${tall ? 'tall' : ''}`}>
        {segments.map((s) => {
          const w = sum > 0 ? (Math.max(0, finite(s.value)) / sum) * 100 : 0;
          return <div key={s.label} style={{ width: `${w}%`, background: col(s.color) }} title={`${s.label}: ${format(s.value)}`}>{w > 12 ? `${w.toFixed(0)}%` : ''}</div>;
        })}
      </div>
      {showLegend && <div className="dt-segbar-legend">{segments.map((s) => <span key={s.label}><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: col(s.color), marginRight: 6, verticalAlign: -1 }} />{s.label} <b>{format(s.value)}</b></span>)}</div>}
    </div>
  );
}

// ── Gauge ──────────────────────────────────────────────────────────────────
export function Gauge({ value, min = 0, max = 3, bands, label, format = (v: number) => v.toFixed(2), size = 220, marker }: {
  value: number; min?: number; max?: number; bands: { to: number; color: ChartColor }[]; label: string; format?: (v: number) => string; size?: number; marker?: { value: number; label: string };
}) {
  const v = useTween(Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : max);
  const W = 240, H = 150, cx = 120, cy = 128, R = 100, r = 74;
  const ang = (x: number) => Math.PI - ((x - min) / (max - min || 1)) * Math.PI;
  const pt = (rad: number, a: number) => [cx + rad * Math.cos(a), cy - rad * Math.sin(a)];
  const arc = (from: number, to: number) => {
    const [x0, y0] = pt(R, ang(from)), [x1, y1] = pt(R, ang(to)), [x2, y2] = pt(r, ang(to)), [x3, y3] = pt(r, ang(from));
    return `M${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1} L${x2},${y2} A${r},${r} 0 0 0 ${x3},${y3} Z`;
  };
  let start = min;
  const a = ang(v);
  const [nx, ny] = pt(R - 6, a);
  const current = bands.find((b) => v <= b.to) ?? bands[bands.length - 1];
  return (
    <div style={{ width: '100%', maxWidth: size, margin: '0 auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="dt-chart" role="img" aria-label={`${label} ${format(value)}`}>
        {bands.map((b, i) => { const from = start; start = Math.min(max, b.to); return <path key={i} d={arc(from, Math.min(max, b.to))} fill={col(b.color)} opacity={0.32} />; })}
        {marker && Number.isFinite(marker.value) && marker.value >= min && marker.value <= max && (() => { const [mx, my] = pt(R + 2, ang(marker.value)); const [mx2, my2] = pt(r - 2, ang(marker.value)); return <g><line x1={mx} y1={my} x2={mx2} y2={my2} stroke="var(--ivory)" strokeWidth={1.5} strokeDasharray="3 3" /><text x={mx} y={my - 6} textAnchor="middle" style={{ fontSize: 8 }}>{marker.label}</text></g>; })()}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="var(--ivory)" strokeWidth={2.2} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={5} fill="var(--ivory)" />
        <text x={cx} y={cy - 26} textAnchor="middle" style={{ fontSize: 22, fill: col(current.color), fontWeight: 500 }}>{format(Number.isFinite(value) ? value : Infinity)}</text>
        <text x={cx} y={cy + 18} textAnchor="middle" className="dt-title">{label}</text>
        <text x={cx - R} y={cy + 14} textAnchor="middle">{format(min)}</text>
        <text x={cx + R} y={cy + 14} textAnchor="middle">{format(max)}+</text>
      </svg>
    </div>
  );
}

// ── Radar chart ────────────────────────────────────────────────────────────
export function RadarChart({ axes, series, size = 320, format = (v: number) => `${Math.round(v * 100)}` }: { axes: string[]; series: { label: string; color: ChartColor; values: number[] }[]; size?: number; format?: (v: number) => string }) {
  const W = 360, cx = 180, cy = 180, R = 120;
  const p = useDrawIn(series.map((s) => s.values.join(',')).join('|'));
  const [hover, setHover] = useState<number | null>(null);
  const n = Math.max(3, axes.length);
  const ang = (i: number) => -Math.PI / 2 + (i / n) * Math.PI * 2;
  const pt = (i: number, v: number) => [cx + R * v * Math.cos(ang(i)), cy + R * v * Math.sin(ang(i))];
  return (
    <div style={{ width: '100%', maxWidth: size, margin: '0 auto' }}>
      <svg viewBox={`0 0 ${W} ${W}`} className="dt-chart" role="img" aria-label="radar chart" onMouseLeave={() => setHover(null)}>
        {[0.25, 0.5, 0.75, 1].map((k) => <polygon key={k} points={axes.map((_, i) => pt(i, k).join(',')).join(' ')} fill="none" className="dt-grid" />)}
        {axes.map((a, i) => { const [x, y] = pt(i, 1); const [lx, ly] = pt(i, 1.18); return <g key={a} onMouseEnter={() => setHover(i)}><line x1={cx} y1={cy} x2={x} y2={y} className="dt-axis" /><text x={lx} y={ly + 3} textAnchor="middle" style={{ fontFamily: 'var(--font-body)', fill: hover === i ? 'var(--gold-2)' : undefined }}>{a}</text></g>; })}
        {series.map((s) => (
          <g key={s.label}>
            <polygon points={axes.map((_, i) => pt(i, Math.max(0, Math.min(1, finite(s.values[i]))) * p).join(',')).join(' ')} fill={col(s.color)} opacity={0.16} stroke={col(s.color)} strokeWidth={1.8} />
            {axes.map((_, i) => { const [x, y] = pt(i, Math.max(0, Math.min(1, finite(s.values[i]))) * p); return <circle key={i} cx={x} cy={y} r={3} fill={col(s.color)} />; })}
          </g>
        ))}
        {hover != null && <Tip W={W} x={pt(hover, 1)[0]} y={pt(hover, 1)[1]} lines={[axes[hover], ...series.map((s) => `${s.label}: ${format(finite(s.values[hover]))}`)]} />}
      </svg>
      <Legend items={series.map((s) => ({ label: s.label, color: s.color }))} />
    </div>
  );
}

// ── Waterfall (cash flow bridge) ───────────────────────────────────────────
export function WaterfallChart({ steps, height = 240, yFormat = fmtDefault, title, note }: { steps: { label: string; value: number; kind: 'start' | 'delta' | 'total' }[]; height?: number; yFormat?: (v: number) => string; title?: string; note?: ReactNode }) {
  const W = 720, H = height, PL = 56, PR = 12, PT = 14, PB = 40;
  const p = useDrawIn(steps.map((s) => s.value).join(','));
  const [hover, setHover] = useState<number | null>(null);
  // compute running levels
  let run = 0;
  const bars = steps.map((s) => {
    if (s.kind === 'start') { run = finite(s.value); return { ...s, y0: 0, y1: run }; }
    if (s.kind === 'total') { return { ...s, y0: 0, y1: finite(s.value) }; }
    const y0 = run; run += finite(s.value); return { ...s, y0, y1: run };
  });
  const all = bars.flatMap((b) => [b.y0, b.y1]);
  const ticks = useMemo(() => niceTicks(Math.min(0, ...all), Math.max(0, ...all)), [all.join(',')]);
  const lo = ticks[0], hi = ticks[ticks.length - 1];
  const sy = (v: number) => PT + (1 - (v - lo) / (hi - lo || 1)) * (H - PT - PB);
  const gw = (W - PL - PR) / Math.max(1, bars.length);
  const bw = Math.min(64, gw * 0.62);
  return (
    <div className="dt-chart-wrap">
      {title && <div className="dt-chart-title">{title}</div>}
      <svg viewBox={`0 0 ${W} ${H}`} className="dt-chart" role="img" aria-label={title ?? 'waterfall chart'} onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => <g key={t}><line className={t === 0 ? 'dt-axis' : 'dt-grid'} x1={PL} x2={W - PR} y1={sy(t)} y2={sy(t)} /><text x={PL - 8} y={sy(t) + 3} textAnchor="end">{yFormat(t)}</text></g>)}
        {bars.map((b, i) => {
          const cx = PL + gw * i + gw / 2;
          const color = b.kind === 'start' ? C.ivory : b.kind === 'total' ? (b.y1 >= 0 ? C.gold : C.red) : b.value >= 0 ? C.green : C.red;
          const top = sy(Math.max(b.y0, b.y1)), bot = sy(Math.min(b.y0, b.y1));
          const h = (bot - top) * p;
          const yy = b.kind === 'delta' && b.value >= 0 ? bot - h : b.kind === 'delta' ? top : b.y1 >= 0 ? bot - h : top;
          const nextX = PL + gw * (i + 1) + gw / 2 - bw / 2;
          return (
            <g key={i} onMouseEnter={() => setHover(i)}>
              <rect x={cx - bw / 2} y={yy} width={bw} height={Math.max(0, h)} fill={color} opacity={hover != null && hover !== i ? 0.5 : 0.9} rx={2} />
              {i < bars.length - 1 && <line x1={cx + bw / 2} x2={nextX} y1={sy(b.y1)} y2={sy(b.y1)} stroke="var(--line-strong)" strokeDasharray="3 3" />}
              <text x={cx} y={H - PB + 16} textAnchor="middle">{b.label}</text>
              <text x={cx} y={yy - 5} textAnchor="middle" style={{ fill: 'var(--ivory-2)' }}>{yFormat(b.kind === 'delta' ? b.value : b.y1)}</text>
            </g>
          );
        })}
        {hover != null && <Tip W={W} x={PL + gw * hover + gw / 2} y={sy(bars[hover].y1) - 20} lines={[bars[hover].label, yFormat(bars[hover].kind === 'delta' ? bars[hover].value : bars[hover].y1)]} />}
      </svg>
      {note && <div className="dt-chart-note">{note}</div>}
    </div>
  );
}
