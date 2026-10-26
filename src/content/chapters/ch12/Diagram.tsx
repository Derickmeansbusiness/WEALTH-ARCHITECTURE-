import { useEffect, useState } from 'react';
import './styles.css';

/**
 * A U.S. judgment creditor (red) travels toward an offshore trust and meets the recognition
 * barriers of the foreign legal system at the jurisdictional boundary. Meanwhile the trust's
 * information (blue) flows back across the same boundary to the home tax authority: the
 * barriers face creditors, not the IRS.
 */
const CYCLE = 9000;
const BOUNDARY = 470;
const BARRIERS = [
  { y: 118, label: 'Judgment not recognized', sub: 're-litigate locally' },
  { y: 168, label: 'Limitation period', sub: 'often 1–2 years from transfer' },
  { y: 218, label: 'Beyond reasonable doubt', sub: 'intent to defraud this creditor' },
  { y: 268, label: 'Bond / no contingency fees', sub: 'cost falls on the creditor' },
];
const REPORTS = ['Form 3520', 'Form 3520-A', 'FBAR (FinCEN 114)', 'Form 8938', 'Form 5471 / 8858'];

export default function Diagram() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now();
    const tick = (now: number) => { setP(((now - t0) % CYCLE) / CYCLE); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Creditor: 0..0.35 travels from court to boundary; 0.35..0.8 tries each barrier (bounces); 0.8..1 retreats a little.
  const START_X = 110, Y0 = 190;
  let cx = START_X, cy = Y0, tryingIdx = -1;
  if (p < 0.35) { cx = START_X + (BOUNDARY - 24 - START_X) * (p / 0.35); }
  else if (p < 0.8) {
    const q = (p - 0.35) / 0.45; tryingIdx = Math.min(3, Math.floor(q * 4));
    const local = (q * 4) % 1; // 0..1 within attempt
    const bump = Math.sin(local * Math.PI) * 14;
    cx = BOUNDARY - 24 + bump; cy = Y0 + (BARRIERS[tryingIdx].y - Y0) * Math.min(1, local * 3);
  } else { cx = BOUNDARY - 24 - (p - 0.8) / 0.2 * 60; cy = BARRIERS[3].y + (Y0 - BARRIERS[3].y) * ((p - 0.8) / 0.2); }
  const blockedFlash = tryingIdx >= 0 ? 0.5 + 0.5 * Math.abs(Math.sin(p * Math.PI * 24)) : 0;

  // Reporting packets travel from trust (right) back to IRS/FinCEN (bottom-left) along a curve, staggered.
  const packets = REPORTS.map((_, i) => ((p * 1.3 + i * 0.2) % 1));
  const curve = (t: number) => {
    // quadratic bezier from (720, 300) via (470, 400) to (150, 345)
    const x0 = 720, y0 = 300, x1 = 470, y1 = 420, x2 = 150, y2 = 345;
    const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * x1 + t * t * x2;
    const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2;
    return { x, y };
  };

  return (
    <div>
      <div className="ch12-diagram-wrap">
        <svg viewBox="0 0 900 440" className="diagram" aria-label="Judgment creditor crossing a jurisdictional boundary toward an offshore trust while reporting flows back to the home tax authority">
          <defs>
            <radialGradient id="ch12-red" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(194,90,76,0.5)" /><stop offset="100%" stopColor="rgba(194,90,76,0)" /></radialGradient>
            <radialGradient id="ch12-violet" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(124,108,168,0.35)" /><stop offset="100%" stopColor="rgba(124,108,168,0)" /></radialGradient>
          </defs>

          {/* Regions */}
          <text x={40} y={48} style={{ fontSize: 11, fill: 'var(--ivory-3)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Home jurisdiction (U.S.)</text>
          <text x={BOUNDARY + 30} y={48} style={{ fontSize: 11, fill: 'var(--ivory-3)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Trust jurisdiction (e.g. Cook Islands · Nevis)</text>
          <line x1={BOUNDARY} y1={60} x2={BOUNDARY} y2={420} stroke="var(--gold)" strokeWidth={1.2} strokeDasharray="6 6" opacity={0.7} />
          <text x={BOUNDARY} y={436} textAnchor="middle" style={{ fontSize: 9.5, fill: 'var(--gold-2)', letterSpacing: '0.12em' }}>JURISDICTIONAL BOUNDARY</text>

          {/* U.S. court */}
          <g transform={`translate(${START_X} ${Y0})`}>
            <rect x={-52} y={-26} width={104} height={52} rx={8} className="node" style={{ stroke: 'var(--red)' }} />
            <text y={-4} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--ivory)' }}>U.S. judgment</text>
            <text y={12} textAnchor="middle" style={{ fontSize: 9.5, fill: 'var(--ivory-3)' }}>creditor · $ award</text>
          </g>
          <line x1={START_X + 52} y1={Y0} x2={BOUNDARY - 40} y2={Y0} stroke="var(--red)" strokeWidth={1} opacity={0.25} />

          {/* Barriers at the boundary */}
          {BARRIERS.map((b, i) => (
            <g key={i} transform={`translate(${BOUNDARY} ${b.y})`}>
              <rect x={-6} y={-18} width={12} height={36} rx={3} fill="var(--gold)" opacity={tryingIdx === i ? 0.95 : 0.6} />
              <text x={16} y={-3} style={{ fontSize: 10.5, fill: tryingIdx === i ? 'var(--gold-2)' : 'var(--ivory-2)' }}>{b.label}</text>
              <text x={16} y={11} style={{ fontSize: 9, fill: 'var(--ivory-3)' }}>{b.sub}</text>
            </g>
          ))}

          {/* Creditor dot */}
          <g transform={`translate(${cx} ${cy})`}>
            <circle r={22} fill="url(#ch12-red)" opacity={0.8 + blockedFlash * 0.2} />
            <circle r={10} fill="var(--red)" />
            {tryingIdx >= 0 && <text x={-16} y={-16} textAnchor="end" style={{ fontSize: 9.5, fill: '#e7a398' }}>blocked</text>}
            {p >= 0.8 && <text x={-16} y={-16} textAnchor="end" style={{ fontSize: 9.5, fill: '#e7a398' }}>settles or gives up</text>}
          </g>

          {/* Offshore trust & holdings */}
          <circle cx={720} cy={190} r={120} fill="url(#ch12-violet)" />
          <g transform="translate(720 150)">
            <rect x={-70} y={-26} width={140} height={52} rx={10} className="node" style={{ stroke: 'var(--violet)' }} />
            <text y={-4} textAnchor="middle" style={{ fontSize: 11.5, fill: 'var(--ivory)' }}>Offshore trust</text>
            <text y={12} textAnchor="middle" style={{ fontSize: 9.5, fill: 'var(--ivory-3)' }}>foreign trustee · protector</text>
          </g>
          <line x1={720} y1={176} x2={660} y2={234} className="edge violet" strokeWidth={1.2} />
          <line x1={720} y1={176} x2={790} y2={234} className="edge violet" strokeWidth={1.2} />
          <g transform="translate(650 255)">
            <rect x={-55} y={-20} width={110} height={40} rx={8} className="node" />
            <text y={-2} textAnchor="middle" style={{ fontSize: 10.5, fill: 'var(--ivory)' }}>Nevis LLC</text>
            <text y={11} textAnchor="middle" style={{ fontSize: 9, fill: 'var(--ivory-3)' }}>settlor as manager</text>
          </g>
          <g transform="translate(800 255)">
            <rect x={-50} y={-20} width={100} height={40} rx={8} className="node" style={{ stroke: 'var(--green-2)' }} />
            <text y={-2} textAnchor="middle" style={{ fontSize: 10.5, fill: 'var(--ivory)' }}>Foreign account</text>
            <text y={11} textAnchor="middle" style={{ fontSize: 9, fill: 'var(--ivory-3)' }}>Swiss / Singapore bank</text>
          </g>

          {/* Reporting flow back home */}
          <path d="M 720 300 Q 470 420 150 345" fill="none" stroke="var(--blue)" strokeWidth={1.4} className="flow-line" opacity={0.6} />
          {packets.map((t, i) => {
            const { x, y } = curve(t);
            return (
              <g key={i} transform={`translate(${x} ${y})`} opacity={t < 0.05 || t > 0.95 ? 0 : 1}>
                <circle r={4} fill="var(--blue)" />
                <text y={-8} textAnchor="middle" style={{ fontSize: 8.5, fill: '#9db7d6' }}>{REPORTS[i]}</text>
              </g>
            );
          })}
          <g transform="translate(150 345)">
            <rect x={-60} y={-24} width={120} height={48} rx={8} className="node" style={{ stroke: 'var(--blue)' }} />
            <text y={-4} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--ivory)' }}>IRS · FinCEN</text>
            <text y={11} textAnchor="middle" style={{ fontSize: 9, fill: 'var(--ivory-3)' }}>reporting crosses freely</text>
          </g>
          <text x={470} y={395} textAnchor="middle" style={{ fontSize: 9.5, fill: '#9db7d6' }}>§679 grantor trust: income taxed to the U.S. settlor every year</text>
        </svg>
      </div>
      <div className="ch12-legend"><span className="cred">Judgment creditor</span><span className="barrier">Recognition barriers of the trust jurisdiction</span><span className="trust">Foreign trust and its holdings</span><span className="report">Reporting obligations flowing home</span></div>
      <p className="ch12-caption">The boundary is asymmetric. A U.S. judgment does not travel: the creditor must start again in the trust jurisdiction, within a short limitation period, to a criminal standard of proof, often after posting a bond. Information travels the other way without friction: a U.S. settlor files Forms 3520 and 3520-A, FBARs and Form 8938 every year, the trustee reports under FATCA, and all trust income is taxed to the settlor under §679. Offshore is about jurisdictional barriers to collection, not tax.</p>
    </div>
  );
}
