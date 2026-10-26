import { useEffect, useState } from 'react';
import './styles.css';

/**
 * Creditor path: a judgment creditor (red) advances through a family's domestic structure.
 * Lane 1 — disciplined: insurance absorbs most of the claim, the charging order stops the rest.
 * Lane 2 — compromised: a personal guarantee bridges the entity wall and commingled accounts
 * open a gap in the trust fence, so the creditor reaches personal assets.
 */
const STATIONS = [
  { x: 190, label: 'Insurance', sub: 'pays first' },
  { x: 400, label: 'LLC interest', sub: 'charging order' },
  { x: 610, label: 'Trust', sub: 'spendthrift / DAPT' },
  { x: 820, label: 'Personal assets', sub: 'home · brokerage' },
];
const START = 60;
const CYCLE = 8000;

export default function Diagram() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now();
    const tick = (now: number) => { setP(((now - t0) % CYCLE) / CYCLE); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Lane 1: travels to insurance (0..0.3), shrinks, continues to the LLC fence (0.3..0.6), then holds and pulses.
  const top = (() => {
    if (p < 0.3) return { x: START + (STATIONS[0].x - 30 - START) * (p / 0.3), r: 11, blocked: false, absorbed: false };
    if (p < 0.6) return { x: STATIONS[0].x - 30 + (STATIONS[1].x - 16 - (STATIONS[0].x - 30)) * ((p - 0.3) / 0.3), r: 6, blocked: false, absorbed: true };
    return { x: STATIONS[1].x - 16, r: 6, blocked: true, absorbed: true };
  })();
  // Lane 2: travels straight through, arcing over the LLC fence via the guarantee bridge.
  const bx = START + (STATIONS[3].x - START) * Math.min(1, p / 0.85);
  const overBridge = bx > STATIONS[1].x - 70 && bx < STATIONS[1].x + 70;
  const arc = overBridge ? -40 * Math.sin(((bx - (STATIONS[1].x - 70)) / 140) * Math.PI) : 0;
  const reached = p >= 0.85;
  const pulse = 0.6 + 0.4 * Math.sin(p * Math.PI * 16);

  const Lane = ({ y, title, tone }: { y: number; title: string; tone: string }) => (
    <g>
      <text x={START - 10} y={y - 58} style={{ fontSize: 11, fill: tone, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{title}</text>
      <line x1={START} y1={y} x2={STATIONS[3].x + 40} y2={y} stroke="rgba(243,236,220,0.12)" strokeWidth={1} />
      {STATIONS.map((s, i) => (
        <g key={i}>
          <text x={s.x} y={y + 46} textAnchor="middle" style={{ fontSize: 11.5, fill: 'var(--ivory-2)' }}>{s.label}</text>
          <text x={s.x} y={y + 61} textAnchor="middle" style={{ fontSize: 9.5, fill: 'var(--ivory-3)' }}>{s.sub}</text>
        </g>
      ))}
    </g>
  );

  const Fence = ({ x, y, broken, tone = 'var(--gold)' }: { x: number; y: number; broken?: boolean; tone?: string }) => (
    <g>
      {broken ? (
        <>
          <line x1={x} y1={y - 34} x2={x} y2={y - 10} stroke={tone} strokeWidth={3} strokeLinecap="round" opacity={0.9} />
          <line x1={x} y1={y + 10} x2={x} y2={y + 34} stroke={tone} strokeWidth={3} strokeLinecap="round" opacity={0.9} />
          <line x1={x - 6} y1={y - 8} x2={x + 6} y2={y + 8} stroke="var(--amber)" strokeWidth={1.2} strokeDasharray="2 3" />
        </>
      ) : (
        <line x1={x} y1={y - 34} x2={x} y2={y + 34} stroke={tone} strokeWidth={3} strokeLinecap="round" opacity={0.9} />
      )}
    </g>
  );

  const Y1 = 120, Y2 = 300;
  return (
    <div>
      <div className="ch11-diagram-wrap">
        <svg viewBox="0 0 900 400" className="diagram" aria-label="Animated creditor path through a domestic asset protection structure">
          <defs>
            <radialGradient id="ch11-red" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(194,90,76,0.5)" /><stop offset="100%" stopColor="rgba(194,90,76,0)" /></radialGradient>
          </defs>

          {/* Lane 1 — disciplined */}
          <Lane y={Y1} title="Disciplined structure" tone="var(--green-2)" />
          <rect x={STATIONS[0].x - 26} y={Y1 - 26} width={52} height={52} rx={8} fill="rgba(62,160,118,0.1)" stroke="var(--green-2)" strokeWidth={1.2} />
          <text x={STATIONS[0].x} y={Y1 + 4} textAnchor="middle" style={{ fontSize: 10, fill: 'var(--green-2)' }}>$</text>
          <Fence x={STATIONS[1].x} y={Y1} />
          <Fence x={STATIONS[2].x} y={Y1} tone="var(--violet)" />
          <rect x={STATIONS[3].x - 30} y={Y1 - 22} width={60} height={44} rx={6} className="node" />
          <text x={STATIONS[3].x} y={Y1 + 4} textAnchor="middle" style={{ fontSize: 10, fill: 'var(--ivory-2)' }}>safe</text>
          {/* creditor dot */}
          <g transform={`translate(${top.x} ${Y1})`}>
            <circle r={top.r + 10} fill="url(#ch11-red)" opacity={top.blocked ? pulse : 0.8} />
            <circle r={top.r} fill="var(--red)" />
            {top.absorbed && <text x={0} y={-18} textAnchor="middle" style={{ fontSize: 9.5, fill: 'var(--green-2)' }}>claim mostly paid</text>}
            {top.blocked && <text x={0} y={30} textAnchor="middle" style={{ fontSize: 9.5, fill: '#e7a398' }}>lien on distributions only</text>}
          </g>
          {top.blocked && <line x1={STATIONS[1].x + 10} y1={Y1} x2={STATIONS[3].x - 32} y2={Y1} stroke="var(--green-2)" strokeWidth={1.2} className="flow-line" opacity={0.5} />}

          {/* Lane 2 — compromised */}
          <Lane y={Y2} title="Compromised structure" tone="#e7a398" />
          <rect x={STATIONS[0].x - 26} y={Y2 - 26} width={52} height={52} rx={8} fill="rgba(62,160,118,0.04)" stroke="var(--green-2)" strokeWidth={1.2} strokeDasharray="3 4" opacity={0.6} />
          <text x={STATIONS[0].x} y={Y2 + 4} textAnchor="middle" style={{ fontSize: 9, fill: 'var(--ivory-3)' }}>thin</text>
          <Fence x={STATIONS[1].x} y={Y2} />
          {/* guarantee bridge */}
          <path d={`M ${STATIONS[1].x - 70} ${Y2} Q ${STATIONS[1].x} ${Y2 - 80} ${STATIONS[1].x + 70} ${Y2}`} fill="none" stroke="var(--amber)" strokeWidth={1.4} strokeDasharray="4 4" />
          <text x={STATIONS[1].x} y={Y2 - 50} textAnchor="middle" style={{ fontSize: 9.5, fill: 'var(--amber)' }}>personal guarantee</text>
          <Fence x={STATIONS[2].x} y={Y2} broken tone="var(--violet)" />
          <text x={STATIONS[2].x} y={Y2 - 42} textAnchor="middle" style={{ fontSize: 9.5, fill: 'var(--amber)' }}>commingled · late transfer</text>
          <rect x={STATIONS[3].x - 30} y={Y2 - 22} width={60} height={44} rx={6} className="node" stroke={reached ? 'var(--red)' : undefined} style={reached ? { stroke: 'var(--red)' } : undefined} />
          <text x={STATIONS[3].x} y={Y2 + 4} textAnchor="middle" style={{ fontSize: 10, fill: reached ? '#e7a398' : 'var(--ivory-2)' }}>{reached ? 'levied' : 'exposed'}</text>
          <g transform={`translate(${bx} ${Y2 + arc})`}>
            <circle r={21} fill="url(#ch11-red)" opacity={reached ? pulse : 0.8} />
            <circle r={11} fill="var(--red)" />
          </g>
          {/* trail */}
          <line x1={START} y1={Y2} x2={Math.min(bx, STATIONS[1].x - 70)} y2={Y2} stroke="var(--red)" strokeWidth={1.4} opacity={0.35} />
          {bx > STATIONS[1].x + 70 && <line x1={STATIONS[1].x + 70} y1={Y2} x2={bx} y2={Y2} stroke="var(--red)" strokeWidth={1.4} opacity={0.35} />}
        </svg>
      </div>
      <div className="ch11-legend"><span className="cred">Judgment creditor</span><span className="fence">Legal fence (charging order, spendthrift clause)</span><span className="gap">Self-inflicted gap (guarantee, commingling, timing)</span><span className="asset">Assets</span></div>
      <p className="ch11-caption">Same creditor, same family, two outcomes. In the disciplined lane insurance pays most of the claim first and the charging order limits the creditor to a lien on distributions the family controls. In the compromised lane a personal guarantee carries the creditor over the entity wall and commingled accounts plus a transfer made after the claim arose break the trust fence, so the creditor levies personal assets.</p>
    </div>
  );
}
