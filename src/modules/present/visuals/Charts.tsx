import type { ReactNode } from 'react';
import { TONE_COLOR, type Tone } from './Frame';
import { useReducedMotion } from './motion';

export interface Bar { label: ReactNode; value: number; tone?: Tone; sub?: ReactNode }

const niceMax = (v: number) => { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))); const m = v / p; const n = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10; return n * p; };

/**
 * Animated vertical bar chart (SVG). Bars grow from the baseline when revealed.
 * @param shown number of bars revealed (default all). Use `step + 1` for progressive reveal.
 * @param format value label formatter
 * @param max fixed axis max (default: nice max of the data)
 */
export function BarChart({ bars, shown, width = 900, height = 520, format = (v) => v.toLocaleString('en-US'), max, gap = 0.38, valueSize = 24, labelSize = 18, baseline }: {
  bars: Bar[]; shown?: number; width?: number; height?: number; format?: (v: number) => string; max?: number; gap?: number; valueSize?: number; labelSize?: number; baseline?: ReactNode;
}) {
  const reduced = useReducedMotion();
  const padL = 20, padR = 20, padT = 50, padB = 70;
  const W = width - padL - padR, H = height - padT - padB;
  const mx = max ?? niceMax(Math.max(...bars.map((b) => Math.abs(b.value)), 1));
  const hasNeg = bars.some((b) => b.value < 0);
  const zeroY = hasNeg ? padT + H / 2 : padT + H;
  const scale = hasNeg ? (H / 2) / mx : H / mx;
  const slot = W / bars.length; const bw = slot * (1 - gap);
  const visible = shown ?? bars.length;
  return (
    <svg className="present-svg" viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      {[0.25, 0.5, 0.75, 1].map((f) => <line key={f} x1={padL} x2={width - padR} y1={zeroY - f * mx * scale} y2={zeroY - f * mx * scale} stroke="var(--line)" />)}
      <line x1={padL} x2={width - padR} y1={zeroY} y2={zeroY} stroke="var(--line-strong)" strokeWidth={1.5} />
      {bars.map((b, i) => {
        const on = i < visible;
        const h = Math.abs(b.value) * scale;
        const x = padL + slot * i + (slot - bw) / 2;
        const y = b.value >= 0 ? zeroY - h : zeroY;
        const color = TONE_COLOR[b.tone ?? 'gold'];
        const hh = on || reduced ? h : 0;
        const yy = on || reduced ? y : (b.value >= 0 ? zeroY : zeroY);
        return (
          <g key={i}>
            <rect className="present-bar" x={x} y={yy} width={bw} height={hh} rx={8} fill={color} opacity={on ? 0.85 : 0} />
            <rect className="present-bar" x={x} y={yy} width={bw} height={hh} rx={8} fill="url(#presentBarSheen)" opacity={on ? 1 : 0} />
            <text className="present-reveal present-svg-mono" x={x + bw / 2} y={(b.value >= 0 ? y : zeroY + h) + (b.value >= 0 ? -14 : 30)} textAnchor="middle" style={{ fontSize: valueSize, fill: 'var(--ivory)', opacity: on ? 1 : 0, transition: 'opacity 0.6s var(--ease) 0.5s' }}>{format(b.value)}</text>
            <text x={x + bw / 2} y={height - padB + 34} textAnchor="middle" style={{ fontSize: labelSize, fill: 'var(--ivory-2)' }}>{b.label}</text>
            {b.sub && <text x={x + bw / 2} y={height - padB + 58} textAnchor="middle" style={{ fontSize: labelSize * 0.8, fill: 'var(--muted)' }}>{b.sub}</text>}
          </g>
        );
      })}
      {baseline && <text x={padL} y={padT - 22} style={{ fontSize: 16, fill: 'var(--ivory-3)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>{baseline}</text>}
      <defs><linearGradient id="presentBarSheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(255,255,255,0.18)" /><stop offset="1" stopColor="rgba(255,255,255,0)" /></linearGradient></defs>
    </svg>
  );
}

export interface Series { label: string; values: number[]; tone?: Tone }

/**
 * Animated line chart. Lines draw in when `show` is true (default). Pass `shownSeries` to reveal
 * series progressively (series `i` visible when `i < shownSeries`).
 */
export function LineChart({ series, xLabels, width = 900, height = 520, format = (v) => v.toLocaleString('en-US'), shownSeries, max, yTicks = 4, area }: {
  series: Series[]; xLabels: (string | number)[]; width?: number; height?: number; format?: (v: number) => string; shownSeries?: number; max?: number; yTicks?: number; area?: boolean;
}) {
  const padL = 130, padR = 40, padT = 40, padB = 60;
  const W = width - padL - padR, H = height - padT - padB;
  const n = Math.max(...series.map((s) => s.values.length), 2);
  const mx = max ?? niceMax(Math.max(...series.flatMap((s) => s.values), 1));
  const X = (i: number) => padL + (W * i) / (n - 1);
  const Y = (v: number) => padT + H - (H * v) / mx;
  const visible = shownSeries ?? series.length;
  return (
    <svg className="present-svg" viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      {Array.from({ length: yTicks + 1 }).map((_, i) => {
        const v = (mx * i) / yTicks;
        return <g key={i}><line x1={padL} x2={width - padR} y1={Y(v)} y2={Y(v)} stroke="var(--line)" /><text x={padL - 16} y={Y(v) + 6} textAnchor="end" className="present-svg-mono" style={{ fontSize: 16, fill: 'var(--ivory-3)' }}>{format(v)}</text></g>;
      })}
      {xLabels.map((l, i) => <text key={i} x={X(i * ((n - 1) / Math.max(1, xLabels.length - 1)))} y={height - padB + 34} textAnchor="middle" style={{ fontSize: 16, fill: 'var(--ivory-3)' }}>{l}</text>)}
      {series.map((s, si) => {
        const on = si < visible;
        const color = TONE_COLOR[s.tone ?? 'gold'];
        const d = s.values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${X(i)} ${Y(v)}`).join(' ');
        const last = s.values[s.values.length - 1];
        return (
          <g key={si} className="present-edge-g" style={{ opacity: on ? 1 : 0 }}>
            {area && <path d={`${d} L ${X(s.values.length - 1)} ${Y(0)} L ${X(0)} ${Y(0)} Z`} fill={color} opacity={0.08} />}
            {on && <path key={`d${si}-${on}`} d={d} stroke={color} strokeWidth={3} fill="none" className="present-draw" style={{ animationDuration: '2s' }} />}
            {on && <circle cx={X(s.values.length - 1)} cy={Y(last)} r={7} fill={color} />}
            {on && <text x={X(s.values.length - 1) - 10} y={Y(last) - 16} textAnchor="end" style={{ fontSize: 18, fill: color }}>{s.label} · <tspan className="present-svg-mono">{format(last)}</tspan></text>}
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Stacked area chart. Series stack bottom-up; `shownSeries` reveals layers progressively.
 */
export function StackedArea({ series, xLabels, width = 900, height = 520, format = (v) => v.toLocaleString('en-US'), shownSeries, max }: {
  series: Series[]; xLabels: (string | number)[]; width?: number; height?: number; format?: (v: number) => string; shownSeries?: number; max?: number;
}) {
  const padL = 130, padR = 40, padT = 40, padB = 60;
  const W = width - padL - padR, H = height - padT - padB;
  const n = Math.max(...series.map((s) => s.values.length), 2);
  const visible = shownSeries ?? series.length;
  const totals = Array.from({ length: n }).map((_, i) => series.slice(0, visible).reduce((s, x) => s + (x.values[i] ?? 0), 0));
  const mx = max ?? niceMax(Math.max(...Array.from({ length: n }).map((_, i) => series.reduce((s, x) => s + (x.values[i] ?? 0), 0)), 1));
  const X = (i: number) => padL + (W * i) / (n - 1);
  const Y = (v: number) => padT + H - (H * v) / mx;
  let cumul = Array(n).fill(0) as number[];
  return (
    <svg className="present-svg" viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      {[0, 0.25, 0.5, 0.75, 1].map((f) => <g key={f}><line x1={padL} x2={width - padR} y1={Y(mx * f)} y2={Y(mx * f)} stroke="var(--line)" /><text x={padL - 16} y={Y(mx * f) + 6} textAnchor="end" className="present-svg-mono" style={{ fontSize: 16, fill: 'var(--ivory-3)' }}>{format(mx * f)}</text></g>)}
      {xLabels.map((l, i) => <text key={i} x={X(i * ((n - 1) / Math.max(1, xLabels.length - 1)))} y={height - padB + 34} textAnchor="middle" style={{ fontSize: 16, fill: 'var(--ivory-3)' }}>{l}</text>)}
      {series.map((s, si) => {
        const lower = cumul; const upper = lower.map((v, i) => v + (s.values[i] ?? 0)); cumul = upper;
        const on = si < visible;
        const color = TONE_COLOR[s.tone ?? 'gold'];
        const top = upper.map((v, i) => `${i === 0 ? 'M' : 'L'} ${X(i)} ${Y(v)}`).join(' ');
        const bottom = lower.map((v, i) => `L ${X(i)} ${Y(v)}`).reverse().join(' ');
        const d = `${top} ${bottom} Z`;
        return (
          <g key={si} className="present-edge-g" style={{ opacity: on ? 1 : 0 }}>
            <path d={d} fill={color} opacity={0.35} />
            <path d={top} stroke={color} strokeWidth={2.5} fill="none" />
            {on && <text x={X(n - 1) - 10} y={Y((upper[n - 1] + lower[n - 1]) / 2) + 6} textAnchor="end" style={{ fontSize: 17, fill: 'var(--ivory)' }}>{s.label}</text>}
          </g>
        );
      })}
      <text x={X(n - 1)} y={Y(totals[n - 1]) - 18} textAnchor="end" className="present-svg-mono" style={{ fontSize: 22, fill: 'var(--gold-2)' }}>{format(totals[n - 1])}</text>
    </svg>
  );
}

/**
 * Horizontal cascade/waterfall of amounts (e.g. revenue → expenses → tax → retained).
 * Each row reveals at `step >= i`. Negative amounts render red; positive green; `kind:'total'` gold.
 */
export function Waterfall({ rows, step, width = 1000, rowH = 64, format = (v) => v.toLocaleString('en-US') }: {
  rows: { label: ReactNode; value: number; kind?: 'start' | 'minus' | 'plus' | 'total' }[]; step?: number; width?: number; rowH?: number; format?: (v: number) => string;
}) {
  const padL = 420, padR = 160; const W = width - padL - padR;
  const start = rows[0]?.value ?? 1; const scale = W / Math.max(start, 1);
  let running = 0;
  const visible = step === undefined ? rows.length : step + 1;
  return (
    <svg className="present-svg" viewBox={`0 0 ${width} ${rows.length * rowH + 20}`} width={width} height={rows.length * rowH + 20}>
      {rows.map((r, i) => {
        const kind = r.kind ?? (i === 0 ? 'start' : r.value < 0 ? 'minus' : 'plus');
        const prev = running;
        if (kind === 'start') running = r.value; else if (kind === 'total') running = r.value; else running = prev + r.value;
        const x0 = kind === 'start' || kind === 'total' ? 0 : Math.min(prev, running);
        const w = kind === 'start' || kind === 'total' ? running : Math.abs(r.value);
        const color = kind === 'total' || kind === 'start' ? TONE_COLOR.gold : kind === 'minus' ? TONE_COLOR.red : TONE_COLOR.green;
        const on = i < visible;
        const y = 10 + i * rowH;
        return (
          <g key={i} className="present-edge-g" style={{ opacity: on ? 1 : 0 }}>
            <text x={padL - 24} y={y + rowH / 2 + 7} textAnchor="end" style={{ fontSize: 22, fill: kind === 'total' ? 'var(--ivory)' : 'var(--ivory-2)' }}>{r.label}</text>
            <rect x={padL + x0 * scale} y={y + 10} width={on ? Math.max(2, w * scale) : 0} height={rowH - 20} rx={6} fill={color} opacity={kind === 'minus' ? 0.6 : 0.85} className="present-grow-x" />
            <text x={padL + (x0 + w) * scale + 16} y={y + rowH / 2 + 7} className="present-svg-mono" style={{ fontSize: 22, fill: color }}>{kind === 'minus' ? '−' : ''}{format(Math.abs(r.value))}</text>
            {i > 0 && <line x1={padL} x2={padL + W} y1={y} y2={y} stroke="var(--line)" />}
          </g>
        );
      })}
    </svg>
  );
}
