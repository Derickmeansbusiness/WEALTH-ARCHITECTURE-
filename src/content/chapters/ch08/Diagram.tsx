import { useEffect, useState } from 'react';

/**
 * Animated cascade: labor at the top feeds a sequence of capital pools; each pool
 * overflows into the next; recycle arrows carry a share of lower-pool returns back up.
 */
interface Pool { id: string; label: string; sub: string; x: number; y: number; w: number; tone: string; fillTo: number }

const POOLS: Pool[] = [
  { id: 'labor', label: 'LABOR', sub: 'earned income · the only pool that starts full', x: 40, y: 30, w: 190, tone: 'var(--ivory-2)', fillTo: 1 },
  { id: 'business', label: 'BUSINESS', sub: 'retained earnings · new ventures', x: 150, y: 110, w: 190, tone: 'var(--gold)', fillTo: 0.85 },
  { id: 'realEstate', label: 'REAL ESTATE', sub: 'income property · amortising debt', x: 260, y: 190, w: 190, tone: 'var(--ivory-2)', fillTo: 0.7 },
  { id: 'investments', label: 'INVESTMENTS', sub: 'diversified · liquid', x: 370, y: 270, w: 190, tone: 'var(--blue)', fillTo: 0.6 },
  { id: 'permanent', label: 'PERMANENT CAPITAL', sub: 'long-term trusts · next generation', x: 480, y: 350, w: 200, tone: 'var(--violet)', fillTo: 0.5 },
  { id: 'liquidity', label: 'INSURANCE & LIQUIDITY', sub: 'reserves · death benefit', x: 590, y: 430, w: 210, tone: 'var(--green-2)', fillTo: 0.4 },
];
const H = 54;

export default function Diagram() {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const e = (now - start) / 1000;
      setT(e);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // each pool fills over 1.2s, staggered; after the cascade completes the levels hold and recycle arrows pulse.
  const level = (i: number, pool: Pool) => {
    const start = i * 1.1;
    const p = Math.max(0, Math.min(1, (t - start) / 1.4));
    const eased = 1 - Math.pow(1 - p, 3);
    return eased * pool.fillTo;
  };
  const cascadeDone = t > POOLS.length * 1.1 + 0.6;

  return (
    <div>
      <div className="ch08-diagram-wrap">
        <svg viewBox="0 0 840 520" className="diagram" aria-label="Cascade of family capital pools from labor to permanent capital with recycle arrows" style={{ maxHeight: 560 }}>
          <defs>
            <marker id="ch08-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--green-2)" /></marker>
            <marker id="ch08-ar-gold" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--gold)" /></marker>
            {POOLS.map((p) => (
              <clipPath key={p.id} id={`ch08-clip-${p.id}`}><rect x={p.x} y={p.y} width={p.w} height={H} rx={10} /></clipPath>
            ))}
          </defs>

          {/* Overflow spouts between pools */}
          {POOLS.slice(0, -1).map((p, i) => {
            const n = POOLS[i + 1];
            const active = level(i, p) > p.fillTo * 0.6;
            const x0 = p.x + p.w - 14, y0 = p.y + H;
            const x1 = n.x + 40, y1 = n.y;
            return (
              <g key={p.id} opacity={active ? 1 : 0.15} style={{ transition: 'opacity 0.5s' }}>
                <path d={`M ${x0} ${y0} C ${x0} ${y0 + 30}, ${x1} ${y1 - 30}, ${x1} ${y1 - 4}`} fill="none" stroke="var(--green-2)" strokeWidth={1.8} className={active ? 'flow-line' : undefined} markerEnd="url(#ch08-ar)" />
              </g>
            );
          })}

          {/* Recycle arrows: investments → business, permanent → real estate, liquidity → business (as collateral/liquidity) */}
          <g opacity={cascadeDone ? 0.9 : 0} style={{ transition: 'opacity 1s' }}>
            <path d="M 380 300 C 300 300, 240 170, 300 140" fill="none" stroke="var(--gold)" strokeWidth={1.3} strokeDasharray="4 6" className="flow-line" markerEnd="url(#ch08-ar-gold)" />
            <text x={262} y={222} style={{ fontSize: 9.5, fill: 'var(--gold-2)' }}>yield recycled</text>
            <text x={262} y={234} style={{ fontSize: 9.5, fill: 'var(--ivory-3)' }}>into new ventures</text>
            <path d="M 490 380 C 400 380, 330 270, 420 230" fill="none" stroke="var(--gold)" strokeWidth={1.3} strokeDasharray="4 6" className="flow-line" markerEnd="url(#ch08-ar-gold)" />
            <text x={366} y={340} style={{ fontSize: 9.5, fill: 'var(--gold-2)' }}>trust lends / co-invests</text>
            <text x={366} y={352} style={{ fontSize: 9.5, fill: 'var(--ivory-3)' }}>documented notes · ch. 7</text>
            <path d="M 600 460 C 560 500, 120 500, 80 92" fill="none" stroke="var(--green-2)" strokeWidth={1.1} strokeDasharray="2 7" className="flow-line" opacity={0.6} />
            <text x={150} y={498} style={{ fontSize: 9.5, fill: 'var(--green-2)' }}>liquidity at death replaces the labor pool · nothing is sold under duress</text>
          </g>

          {/* Pools */}
          {POOLS.map((p, i) => {
            const lv = level(i, p);
            return (
              <g key={p.id}>
                <rect x={p.x} y={p.y} width={p.w} height={H} rx={10} className="node" stroke={p.tone} strokeWidth={1.4} />
                <g clipPath={`url(#ch08-clip-${p.id})`}>
                  <rect x={p.x} y={p.y + H - H * lv} width={p.w} height={H * lv} fill={p.tone} opacity={0.18} />
                  <rect x={p.x} y={p.y + H - H * lv - 1} width={p.w} height={2} fill={p.tone} opacity={0.7} />
                </g>
                <text x={p.x + 12} y={p.y + 22} style={{ fontSize: 11, fill: 'var(--ivory)', fontWeight: 600, letterSpacing: '0.08em' }}>{p.label}</text>
                <text x={p.x + 12} y={p.y + 38} style={{ fontSize: 9.5, fill: 'var(--ivory-3)' }}>{p.sub}</text>
                <text x={p.x + p.w - 10} y={p.y + 22} textAnchor="end" className="label-mono" style={{ fontSize: 10, fill: p.tone }}>{Math.round(lv * 100)}%</text>
              </g>
            );
          })}

          {/* Family capital basin */}
          <g opacity={cascadeDone ? 1 : 0.35} style={{ transition: 'opacity 1s' }}>
            <rect x={40} y={450} width={520} height={40} rx={10} fill="rgba(201,169,97,0.05)" stroke="var(--gold)" strokeDasharray="3 4" strokeWidth={1} />
            <text x={300} y={468} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--gold-2)', letterSpacing: '0.12em' }}>FAMILY CAPITAL</text>
            <text x={300} y={482} textAnchor="middle" style={{ fontSize: 9.5, fill: 'var(--ivory-3)' }}>the sum of the pools, governed as one balance sheet across generations</text>
          </g>
        </svg>
      </div>
      <p className="ch08-caption">
        Labor is the only pool that fills itself; every pool below it fills from the overflow of the one above (green). Once the cascade is established, the gold dashed arrows show capital being recycled upward — investment yield funding a new venture, a trust lending to the real estate company on a documented note — and the thin green return shows insurance liquidity re-entering at the top when the labor pool stops. Percentages are illustrative fill levels, not a recommendation.
      </p>
    </div>
  );
}
