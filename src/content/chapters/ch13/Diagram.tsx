import { useEffect, useState } from 'react';
import './styles.css';

/**
 * Two inheritance paths over three generations.
 * Top: direct inheritance → probate at each death → ownership fragments 1 → 3 → 9 → 27.
 * Bottom: a single dynasty trust holds title throughout; beneficiaries multiply, ownership does not.
 */
const CYCLE = 11000;
const COLS = [90, 300, 520, 760];
const GEN_LABELS = ['Founder', 'Generation 2', 'Generation 3', 'Generation 4'];
const YEARS = ['Year 0', 'Year 30', 'Year 60', 'Year 90'];
const Y_TOP = 120, Y_BOT = 335;

const ease = (x: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);

function spread(n: number, half: number) {
  if (n === 1) return [0];
  return Array.from({ length: n }, (_, i) => -half + (2 * half * i) / (n - 1));
}

export default function Diagram() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now();
    const tick = (now: number) => { setP(((now - t0) % CYCLE) / CYCLE); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const stage = p * 4.4; // 0..4.4 ; generation k appears at stage k

  const gens = [1, 3, 9, 27];
  const halves = [0, 46, 70, 84];
  const radii = [12, 8, 5, 3];
  const topNodes = gens.map((n, k) => spread(n, halves[k]).map((dy) => ({ x: COLS[k], y: Y_TOP + dy, r: radii[k] })));

  return (
    <div>
      <div className="ch13-diagram-wrap">
        <svg viewBox="0 0 900 470" className="diagram" aria-label="Direct inheritance fragmenting ownership versus a dynasty trust keeping ownership consolidated over three generations">
          <defs>
            <radialGradient id="ch13-violet" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(124,108,168,0.35)" /><stop offset="100%" stopColor="rgba(124,108,168,0)" /></radialGradient>
          </defs>

          {/* timeline */}
          {COLS.map((x, k) => (
            <g key={k} opacity={ease(stage - k + 0.6)}>
              <line x1={x} y1={40} x2={x} y2={445} stroke="rgba(243,236,220,0.08)" strokeDasharray="3 5" />
              <text x={x} y={28} textAnchor="middle" style={{ fontSize: 10.5, fill: 'var(--ivory-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{GEN_LABELS[k]}</text>
              <text x={x} y={462} textAnchor="middle" className="label-mono" style={{ fontSize: 9.5, fill: 'var(--muted)' }}>{YEARS[k]}</text>
            </g>
          ))}

          {/* ── Direct path ── */}
          <text x={20} y={Y_TOP - 96} style={{ fontSize: 11, fill: '#e7a398', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Direct inheritance</text>
          {topNodes.map((col, k) => {
            if (k === 0) return null;
            const parents = topNodes[k - 1];
            const a = ease((stage - k) * 1.6);
            const probX = (COLS[k - 1] + COLS[k]) / 2;
            return (
              <g key={k} opacity={a}>
                {/* probate gate */}
                <rect x={probX - 26} y={Y_TOP - 13} width={52} height={26} rx={5} fill="rgba(194,90,76,0.12)" stroke="var(--red)" strokeWidth={1} />
                <text x={probX} y={Y_TOP + 4} textAnchor="middle" style={{ fontSize: 9, fill: '#e7a398' }}>probate</text>
                <text x={probX} y={Y_TOP + 26} textAnchor="middle" style={{ fontSize: 8.5, fill: 'var(--ivory-3)' }}>tax · fees · delay</text>
                {col.map((n, i) => {
                  const parent = parents[Math.floor(i / 3)] ?? parents[0];
                  const ex = parent.x + (n.x - parent.x) * a, ey = parent.y + (n.y - parent.y) * a;
                  return <line key={i} x1={parent.x} y1={parent.y} x2={ex} y2={ey} stroke="rgba(243,236,220,0.25)" strokeWidth={0.8} />;
                })}
                {col.map((n, i) => <circle key={`n${i}`} cx={n.x} cy={n.y} r={n.r * (0.4 + 0.6 * a)} className="node" strokeWidth={1} />)}
                <text x={COLS[k]} y={Y_TOP + halves[k] + 18} textAnchor="middle" className="label-mono" style={{ fontSize: 9.5, fill: 'var(--ivory-3)' }}>{gens[k]} owners · {(100 / gens[k]).toFixed(gens[k] > 9 ? 1 : 0)}% each</text>
              </g>
            );
          })}
          <circle cx={COLS[0]} cy={Y_TOP} r={12} className="node gold" strokeWidth={1.4} />
          <text x={COLS[0]} y={Y_TOP + 28} textAnchor="middle" style={{ fontSize: 9.5, fill: 'var(--ivory-3)' }}>1 owner · 100%</text>

          {/* ── Trust path ── */}
          <text x={20} y={Y_BOT - 92} style={{ fontSize: 11, fill: '#b7adda', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Trust inheritance</text>
          <circle cx={COLS[0]} cy={Y_BOT} r={12} className="node gold" strokeWidth={1.4} />
          <text x={COLS[0]} y={Y_BOT + 28} textAnchor="middle" style={{ fontSize: 9.5, fill: 'var(--ivory-3)' }}>settlor funds trust</text>
          {/* funding arrow */}
          <line x1={COLS[0] + 14} y1={Y_BOT} x2={COLS[0] + 14 + (COLS[1] - 60 - COLS[0] - 14) * ease(stage * 1.6)} y2={Y_BOT} stroke="var(--gold)" strokeWidth={1.2} />
          <text x={(COLS[0] + COLS[1]) / 2} y={Y_BOT - 10} textAnchor="middle" style={{ fontSize: 8.5, fill: 'var(--gold-2)' }} opacity={ease(stage * 1.6)}>gift · GST exemption allocated</text>
          {/* persistent trust band */}
          {(() => {
            const a = ease((stage - 0.6) * 1.4);
            const w = (COLS[3] + 40 - (COLS[1] - 60)) * ease((stage - 1) / 2.6);
            return (
              <g opacity={a}>
                <rect x={COLS[1] - 60} y={Y_BOT - 22} width={Math.max(120, w)} height={44} rx={10} fill="rgba(124,108,168,0.12)" stroke="var(--violet)" strokeWidth={1.3} />
                <text x={COLS[1]} y={Y_BOT - 4} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--ivory)' }}>Dynasty trust</text>
                <text x={COLS[1]} y={Y_BOT + 11} textAnchor="middle" style={{ fontSize: 8.5, fill: '#b7adda' }}>one title holder · trustee</text>
                {w > 200 && <text x={COLS[1] - 60 + w / 2 + 60} y={Y_BOT + 4} textAnchor="middle" className="label-mono" style={{ fontSize: 9.5, fill: '#b7adda' }}>1 legal owner throughout · no probate · no re-titling</text>}
                {/* governance ring */}
                <ellipse cx={COLS[1]} cy={Y_BOT} rx={88} ry={40} fill="none" stroke="var(--blue)" strokeWidth={1} strokeDasharray="4 5" opacity={0.7} />
                <text x={COLS[1]} y={Y_BOT - 50} textAnchor="middle" style={{ fontSize: 8.5, fill: '#9db7d6' }}>trustee · protector · distribution committee</text>
              </g>
            );
          })()}
          {/* beneficiaries accumulate below the band */}
          {[1, 2, 3].map((k) => {
            const a = ease((stage - k) * 1.6);
            const n = gens[k];
            const pts = spread(n, halves[k]);
            return (
              <g key={k} opacity={a}>
                {pts.map((dx, i) => (
                  <g key={i}>
                    <line x1={COLS[k] + dx * 0.3} y1={Y_BOT + 22} x2={COLS[k] + dx} y2={Y_BOT + 62} stroke="var(--green-2)" strokeWidth={0.7} opacity={0.45} className={i % 4 === 0 ? 'flow-line' : undefined} />
                    <circle cx={COLS[k] + dx} cy={Y_BOT + 66} r={radii[k] * 0.9} fill="rgba(124,108,168,0.35)" stroke="var(--violet)" strokeWidth={0.8} />
                  </g>
                ))}
                <text x={COLS[k]} y={Y_BOT + 90} textAnchor="middle" className="label-mono" style={{ fontSize: 9.5, fill: 'var(--ivory-3)' }}>{n} beneficiaries · 0 owners</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="ch13-legend"><span className="heir">Heirs / owners</span><span className="probate">Probate, transfer tax and re-titling at each death</span><span className="trust">Dynasty trust holding title</span><span className="gov">Governance layer (trustee, protector, committee)</span></div>
      <p className="ch13-caption">Direct inheritance works once and fragments forever: after three deaths the founder's single holding is twenty-seven stakes, each too small to govern and each passing through probate and the transfer-tax system again. A GST-exempt dynasty trust is funded once, pays whatever gift tax is due once, and then holds title through every generation while the beneficiaries change beneath it. The trust buys continuity and consolidation at the price of carryover basis and a governance structure the family has to actually run.</p>
    </div>
  );
}
