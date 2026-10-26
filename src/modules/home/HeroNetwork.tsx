import { useEffect, useState } from 'react';

/** Cinematic hero: an ownership network assembling outward from the individual. */
const NODES = [
  { id: 'ind', x: 400, y: 240, label: 'Individual', tone: 'gold', r: 20 },
  { id: 'fam', x: 400, y: 120, label: 'Family', tone: 'gold', r: 14 },
  { id: 'trust', x: 230, y: 160, label: 'Trust', tone: 'violet', r: 16 },
  { id: 'hold', x: 400, y: 380, label: 'Holding Co.', tone: 'ivory', r: 18 },
  { id: 'op', x: 250, y: 470, label: 'Operating Co.', tone: 'ivory', r: 13 },
  { id: 'prop', x: 400, y: 500, label: 'Property Co.', tone: 'ivory', r: 13 },
  { id: 'inv', x: 550, y: 470, label: 'Investment Co.', tone: 'ivory', r: 13 },
  { id: 'ins', x: 590, y: 160, label: 'Insurance', tone: 'green', r: 13 },
  { id: 'bank', x: 620, y: 300, label: 'Family Bank', tone: 'green', r: 13 },
  { id: 'intl', x: 160, y: 320, label: 'International', tone: 'blue', r: 13 },
  { id: 'fo', x: 700, y: 400, label: 'Family Office', tone: 'gold', r: 13 },
  { id: 'gen', x: 400, y: 30, label: 'Future Generations', tone: 'gold', r: 10 },
];
const EDGES: [string, string, string][] = [
  ['ind', 'fam', 'gold'], ['ind', 'trust', 'violet'], ['trust', 'hold', 'gold'], ['hold', 'op', 'gold'], ['hold', 'prop', 'gold'], ['hold', 'inv', 'gold'],
  ['trust', 'ins', 'green'], ['inv', 'bank', 'green'], ['bank', 'prop', 'green'], ['trust', 'intl', 'blue'], ['fo', 'hold', 'blue'], ['fo', 'trust', 'blue'], ['fam', 'gen', 'gold'], ['trust', 'gen', 'violet'],
];
const COLOR: Record<string, string> = { gold: 'var(--gold)', ivory: 'var(--ivory-2)', green: 'var(--green-2)', violet: 'var(--violet)', blue: 'var(--blue)' };

export default function HeroNetwork() {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now();
    const tick = (now: number) => { setT(Math.min(1, (now - start) / 4200)); if (now - start < 4200) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const pos = Object.fromEntries(NODES.map((n) => [n.id, n]));
  return (
    <svg viewBox="0 0 800 540" className="diagram" style={{ maxHeight: 560 }} aria-label="Family wealth architecture network assembling">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(201,169,97,0.35)" /><stop offset="100%" stopColor="rgba(201,169,97,0)" /></radialGradient>
        <filter id="blur"><feGaussianBlur stdDeviation="8" /></filter>
      </defs>
      <circle cx={400} cy={240} r={220} fill="url(#glow)" opacity={0.7} />
      {EDGES.map(([a, b, c], i) => {
        const appear = Math.max(0, Math.min(1, (t * 1.3 - i * 0.07) * 3));
        const A = pos[a], B = pos[b];
        return (
          <g key={i} opacity={appear}>
            <line x1={A.x} y1={A.y} x2={A.x + (B.x - A.x) * appear} y2={A.y + (B.y - A.y) * appear} stroke={COLOR[c]} strokeWidth={1.2} opacity={0.55} />
            {appear >= 1 && <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={COLOR[c]} strokeWidth={1.6} className="flow-line" opacity={0.6} />}
          </g>
        );
      })}
      {NODES.map((n, i) => {
        const appear = Math.max(0, Math.min(1, (t * 1.3 - i * 0.08) * 3));
        return (
          <g key={n.id} opacity={appear} transform={`translate(${n.x} ${n.y}) scale(${0.6 + 0.4 * appear})`}>
            <circle r={n.r + 10} fill={COLOR[n.tone]} opacity={0.08} />
            <circle r={n.r} className="node" stroke={COLOR[n.tone]} strokeWidth={1.4} />
            <circle r={3} fill={COLOR[n.tone]} />
            <text y={n.r + 16} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--ivory-2)', letterSpacing: '0.04em' }}>{n.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
