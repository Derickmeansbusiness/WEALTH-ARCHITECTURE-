import { useMoney } from '@/components/ui';
import { clamp01 } from '@/content/debt/lessons/visuals/animation';

/**
 * Pseudo-3D isometric building rising floor by floor. `t` 0..1 drives the build.
 * Gold edges, glass faces, a small plinth with the price label.
 */
export default function IsoBuilding({ t, floors = 8, price = 1_000_000, label = 'Property Co · 14 Harbour Street' }: { t: number; floors?: number; price?: number; label?: string }) {
  const fmt = useMoney();
  const W = 520, H = 460;
  const cx = 260, baseY = 360;
  const w = 150, d = 90, fh = 30;        // footprint half-width, depth half, floor height
  const built = t * floors;
  const floorsArr = Array.from({ length: floors }, (_, i) => i);
  // isometric helpers
  const P = (x: number, y: number, z: number) => [cx + (x - y) * Math.cos(Math.PI / 6), baseY - z + (x + y) * Math.sin(Math.PI / 6)] as const;
  const face = (pts: readonly (readonly [number, number])[]) => pts.map((p) => p.join(',')).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="diagram" style={{ maxHeight: 480 }} role="img" aria-label="A one-million-dollar building rising floor by floor">
      <defs>
        <linearGradient id="iso-glass-l" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgba(201,169,97,0.22)" /><stop offset="100%" stopColor="rgba(17,20,27,0.85)" /></linearGradient>
        <linearGradient id="iso-glass-r" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(243,236,220,0.16)" /><stop offset="100%" stopColor="rgba(11,13,18,0.9)" /></linearGradient>
        <linearGradient id="iso-roof" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgba(230,212,163,0.5)" /><stop offset="100%" stopColor="rgba(201,169,97,0.15)" /></linearGradient>
        <radialGradient id="iso-glow" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(201,169,97,0.25)" /><stop offset="100%" stopColor="rgba(201,169,97,0)" /></radialGradient>
      </defs>
      <ellipse cx={cx} cy={baseY + 40} rx={230} ry={60} fill="url(#iso-glow)" />
      {/* plinth */}
      <polygon points={face([P(-w - 20, -d - 20, 0), P(w + 20, -d - 20, 0), P(w + 20, d + 20, 0), P(-w - 20, d + 20, 0)])} fill="rgba(243,236,220,0.05)" stroke="rgba(201,169,97,0.4)" />
      {floorsArr.map((i) => {
        const p = clamp01(built - i);
        if (p <= 0) return null;
        const z0 = i * fh, z1 = z0 + fh * p;
        const left = [P(-w, d, z0), P(-w, -d, z0), P(-w, -d, z1), P(-w, d, z1)] as const;
        const right = [P(-w, d, z0), P(w, d, z0), P(w, d, z1), P(-w, d, z1)] as const;
        const top = [P(-w, -d, z1), P(w, -d, z1), P(w, d, z1), P(-w, d, z1)] as const;
        const isTop = i === floors - 1 || built < i + 1;
        return (
          <g key={i} opacity={0.4 + 0.6 * p}>
            <polygon points={face(left)} fill="url(#iso-glass-l)" stroke="var(--gold)" strokeWidth={1} />
            <polygon points={face(right)} fill="url(#iso-glass-r)" stroke="var(--gold)" strokeWidth={1} />
            {isTop && <polygon points={face(top)} fill="url(#iso-roof)" stroke="var(--gold-2)" strokeWidth={1.2} />}
            {/* window mullions */}
            {p > 0.6 && [0.25, 0.5, 0.75].map((f) => {
              const a = P(-w, d - 2 * d * f, z0 + 4), b = P(-w, d - 2 * d * f, z1 - 4);
              const c = P(-w + 2 * w * f, d, z0 + 4), e = P(-w + 2 * w * f, d, z1 - 4);
              return <g key={f} stroke="rgba(243,236,220,0.18)"><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} /><line x1={c[0]} y1={c[1]} x2={e[0]} y2={e[1]} /></g>;
            })}
          </g>
        );
      })}
      {t >= 1 && (
        <g className="fade-in">
          <line x1={P(w, d, floors * fh)[0]} y1={P(w, d, floors * fh)[1]} x2={P(w, d, floors * fh)[0] + 40} y2={P(w, d, floors * fh)[1] - 50} stroke="var(--gold)" strokeWidth={1} />
          <text x={P(w, d, floors * fh)[0] + 46} y={P(w, d, floors * fh)[1] - 56} className="label-mono" style={{ fontSize: 22, fill: 'var(--gold-2)' }}>{fmt(price, { compact: true })}</text>
          <text x={P(w, d, floors * fh)[0] + 46} y={P(w, d, floors * fh)[1] - 38} style={{ fontSize: 11, fill: 'var(--ivory-3)' }}>asset value</text>
        </g>
      )}
      <text x={cx} y={H - 16} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--ivory-3)', letterSpacing: '0.1em' }}>{label.toUpperCase()}</text>
    </svg>
  );
}
