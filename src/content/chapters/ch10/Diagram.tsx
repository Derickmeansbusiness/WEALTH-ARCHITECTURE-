import { useEffect, useState } from 'react';

/**
 * Insurance layers wrapping the family architecture. Outer ring: liability cover absorbing claims
 * before they reach any entity. Inner architecture: holding, operating, property, trust. At the
 * death event on the timeline, life insurance held in an ILIT injects liquidity into the estate.
 */
const CX = 330, CY = 240;
const NODES = [
  { id: 'trust', label: 'Trust', x: CX, y: CY - 95, tone: 'var(--violet)' },
  { id: 'hold', label: 'Holding Co.', x: CX, y: CY, tone: 'var(--gold)' },
  { id: 'op', label: 'Operating Co.', x: CX - 105, y: CY + 75, tone: 'var(--ivory-2)' },
  { id: 'prop', label: 'Property Co.', x: CX + 105, y: CY + 75, tone: 'var(--ivory-2)' },
];
const EDGES: [string, string][] = [['trust', 'hold'], ['hold', 'op'], ['hold', 'prop']];
const CLAIMS = [
  { label: 'auto / premises claim', from: { x: 40, y: 90 }, policy: 'Umbrella' },
  { label: 'customer injury · CGL', from: { x: 60, y: 420 }, policy: 'CGL' },
  { label: 'director decision · D&O', from: { x: 640, y: 70 }, policy: 'D&O' },
  { label: 'professional error · E&O', from: { x: 620, y: 430 }, policy: 'E&O' },
];
const R_OUTER = 190;

export default function Diagram() {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now();
    const tick = (now: number) => { setT(((now - start) / 1000) % 14); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // phases: 0–8s claims arrive one by one and are absorbed; 8–14s death event + liquidity injection
  const deathPhase = t >= 8;
  const pos = Object.fromEntries(NODES.map((n) => [n.id, n]));

  const claimDot = (c: typeof CLAIMS[number], i: number) => {
    const start = i * 2 + 0.3;
    const p = Math.max(0, Math.min(1, (t - start) / 1.3));
    if (p <= 0 || t > 8.5) return null;
    const dx = CX - c.from.x, dy = CY - c.from.y;
    const dist = Math.hypot(dx, dy);
    const stopAt = (dist - R_OUTER) / dist; // stop at the ring
    const q = Math.min(p, stopAt);
    const x = c.from.x + dx * q, y = c.from.y + dy * q;
    const hit = p >= stopAt;
    return (
      <g key={c.label}>
        <line x1={c.from.x} y1={c.from.y} x2={x} y2={y} stroke="var(--red)" strokeWidth={1.4} strokeDasharray="4 4" opacity={0.8} />
        <circle cx={x} cy={y} r={hit ? 9 : 5} fill="var(--red)" opacity={hit ? 0.35 : 0.9} />
        {hit && <circle cx={x} cy={y} r={16 + 10 * Math.min(1, (p - stopAt) * 6)} fill="none" stroke="var(--red)" opacity={Math.max(0, 0.6 - (p - stopAt) * 2)} />}
        <text x={c.from.x} y={c.from.y - 10} textAnchor={c.from.x < CX ? 'start' : 'end'} style={{ fontSize: 10, fill: '#e7a398' }}>{c.label}</text>
        {hit && <text x={x + (c.from.x < CX ? -14 : 14)} y={y + 4} textAnchor={c.from.x < CX ? 'end' : 'start'} style={{ fontSize: 9.5, fill: 'var(--ivory-2)' }}>absorbed · {c.policy}</text>}
      </g>
    );
  };

  const deathP = Math.max(0, Math.min(1, (t - 8.6) / 1.6));
  const injectP = Math.max(0, Math.min(1, (t - 10) / 1.4));
  const ilit = { x: 600, y: 300 };
  const injX = ilit.x + (CX + 40 - ilit.x) * injectP, injY = ilit.y + (CY - 70 - ilit.y) * injectP;

  return (
    <div>
      <div className="ch10-phase" aria-hidden>
        <span className={!deathPhase ? 'on' : ''}>1 · claims hit the liability shield</span>
        <span className={deathPhase ? 'on' : ''}>2 · death event: insurance liquidity enters</span>
      </div>
      <div className="ch10-diagram-wrap">
        <svg viewBox="0 0 720 500" className="diagram" aria-label="Insurance layers around a family structure: liability cover outside, life insurance injecting liquidity at death" style={{ maxHeight: 540 }}>
          <defs>
            <marker id="ch10-ar-g" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--green-2)" /></marker>
            <radialGradient id="ch10-glow"><stop offset="0%" stopColor="rgba(201,169,97,0.18)" /><stop offset="100%" stopColor="rgba(0,0,0,0)" /></radialGradient>
          </defs>
          <circle cx={CX} cy={CY} r={R_OUTER - 20} fill="url(#ch10-glow)" />

          {/* Liability ring */}
          <circle cx={CX} cy={CY} r={R_OUTER} fill="none" stroke="var(--red)" strokeWidth={2} strokeDasharray="10 6" className="ch10-ring" />
          <circle cx={CX} cy={CY} r={R_OUTER - 12} fill="none" stroke="var(--red)" strokeWidth={0.8} opacity={0.4} />
          <text x={CX} y={CY - R_OUTER - 12} textAnchor="middle" style={{ fontSize: 10.5, fill: '#e7a398', letterSpacing: '0.14em' }}>LIABILITY SHIELD · umbrella · CGL · D&O · E&O</text>
          <text x={CX} y={CY + R_OUTER + 22} textAnchor="middle" style={{ fontSize: 9.5, fill: 'var(--ivory-3)' }}>first line of defence · pays claims and defence costs before any entity or trust is tested</text>

          {/* Architecture */}
          {EDGES.map(([a, b]) => <line key={a + b} x1={pos[a].x} y1={pos[a].y} x2={pos[b].x} y2={pos[b].y} stroke="var(--gold)" strokeWidth={1.2} opacity={0.6} />)}
          {NODES.map((n) => (
            <g key={n.id} transform={`translate(${n.x} ${n.y})`}>
              <circle r={n.id === 'hold' ? 26 : 22} className="node" stroke={n.tone} strokeWidth={1.4} />
              <circle r={3} fill={n.tone} />
              <text y={n.id === 'hold' ? 40 : 36} textAnchor="middle" style={{ fontSize: 10.5, fill: 'var(--ivory-2)' }}>{n.label}</text>
            </g>
          ))}

          {/* Claims */}
          {CLAIMS.map(claimDot)}

          {/* Timeline + death event */}
          <line x1={40} y1={470} x2={680} y2={470} stroke="var(--line-strong)" />
          <text x={40} y={488} style={{ fontSize: 9.5, fill: 'var(--ivory-3)' }}>lifetime: premiums paid, claims absorbed</text>
          <g transform="translate(560 470)" opacity={deathPhase ? 1 : 0.3} style={{ transition: 'opacity 0.5s' }}>
            <circle r={deathPhase ? 6 + 3 * deathP : 4} fill="var(--gold)" />
            <text y={18} textAnchor="middle" style={{ fontSize: 9.5, fill: 'var(--gold-2)', letterSpacing: '0.1em' }}>DEATH EVENT</text>
          </g>

          {/* ILIT and liquidity injection */}
          <g transform={`translate(${ilit.x} ${ilit.y})`} opacity={deathPhase ? 1 : 0.55} style={{ transition: 'opacity 0.5s' }}>
            <rect x={-62} y={-28} width={124} height={56} rx={10} className="node" stroke="var(--green-2)" strokeWidth={1.4} />
            <text y={-6} textAnchor="middle" style={{ fontSize: 10.5, fill: 'var(--ivory)', fontWeight: 600, letterSpacing: '0.08em' }}>ILIT</text>
            <text y={8} textAnchor="middle" style={{ fontSize: 9.5, fill: 'var(--ivory-3)' }}>owns the life policy</text>
            <text y={20} textAnchor="middle" style={{ fontSize: 9.5, fill: 'var(--green-2)' }}>§2042 · outside the estate</text>
          </g>
          {deathPhase && (
            <g>
              <path d={`M ${ilit.x - 62} ${ilit.y} Q 470 ${ilit.y - 40} ${CX + 40} ${CY - 70}`} fill="none" stroke="var(--green-2)" strokeWidth={2} className="flow-line" opacity={deathP} markerEnd="url(#ch10-ar-g)" />
              <circle cx={injX} cy={injY} r={7} fill="var(--green-2)" opacity={injectP > 0 && injectP < 1 ? 0.95 : 0} />
              <text x={500} y={CY - 60} textAnchor="middle" style={{ fontSize: 10, fill: 'var(--green-2)' }} opacity={deathP}>death benefit · §101(a) income-tax free</text>
              <text x={500} y={CY - 47} textAnchor="middle" style={{ fontSize: 9.5, fill: 'var(--ivory-3)' }} opacity={deathP}>lends to or buys from the estate · pays tax, debts, equalisation</text>
              {injectP >= 1 && (
                <g className="fade-in">
                  <circle cx={CX} cy={CY - 95} r={34} fill="none" stroke="var(--green-2)" strokeWidth={1.2} opacity={0.7} />
                  <text x={CX} y={CY - 140} textAnchor="middle" style={{ fontSize: 9.5, fill: 'var(--green-2)' }}>nothing sold under duress</text>
                </g>
              )}
            </g>
          )}
        </svg>
      </div>
      <p className="ch10-caption">
        The red dashed ring is liability insurance, the first thing a claim meets: a premises injury, a product claim, a director's decision or a professional error is absorbed by the policy's limits and defence cover before any entity or trust is ever tested. The structures inside the ring are the second line, not the first. At the death event on the timeline, the green flow is life insurance owned by an irrevocable trust paying out income-tax free under §101(a) and outside the estate under §2042 — liquidity arriving exactly when the estate owes tax, debts and equalisation payments, so the business and the buildings are not sold to pay them.
      </p>
    </div>
  );
}
