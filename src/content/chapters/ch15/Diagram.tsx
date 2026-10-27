import { useEffect, useState } from 'react';
import './styles.css';

/**
 * The family office as a control tower: information flows up from every part of the architecture
 * (green packets), decisions flow down (blue packets), and consolidated reporting goes to the
 * family council (violet). Ownership lines (gold) are static: the office controls nothing it does not
 * own; it coordinates.
 */
const CYCLE = 6000;
const FO = { x: 450, y: 90 };
const COUNCIL = { x: 130, y: 90 };
const ENTITIES = [
  { id: 'hold', x: 150, y: 300, label: 'Holding Co', sub: 'consolidates', tone: 'var(--gold)' },
  { id: 'op', x: 290, y: 300, label: 'Operating Co', sub: 'management accounts', tone: 'var(--ivory-3)' },
  { id: 'prop', x: 430, y: 300, label: 'Property Co', sub: 'rent roll · debt', tone: 'var(--ivory-3)' },
  { id: 'inv', x: 570, y: 300, label: 'Investment LLC', sub: 'custodian feeds', tone: 'var(--ivory-3)' },
  { id: 'trust', x: 710, y: 300, label: 'Trusts', sub: 'trustee statements', tone: 'var(--violet)' },
  { id: 'bank', x: 850, y: 300, label: 'Family Bank', sub: 'intercompany notes', tone: 'var(--green-2)' },
];
const SUBS = [
  { x: 290, y: 400, label: 'Payroll · vendors' },
  { x: 430, y: 400, label: 'Lenders · tenants' },
  { x: 570, y: 400, label: 'Managers · custodians' },
  { x: 710, y: 400, label: 'Beneficiaries' },
];

export default function Diagram() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now();
    const tick = (now: number) => { setP(((now - t0) % CYCLE) / CYCLE); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  return (
    <div>
      <div className="ch15-diagram-wrap">
        <svg viewBox="0 0 960 440" className="diagram" aria-label="Family office control tower above the architecture, information flowing in and decisions flowing out">
          <defs>
            <radialGradient id="ch15-glow" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(91,127,166,0.35)" /><stop offset="100%" stopColor="rgba(91,127,166,0)" /></radialGradient>
          </defs>
          <circle cx={FO.x} cy={FO.y} r={110} fill="url(#ch15-glow)" />

          {/* ownership spine (static gold) */}
          <line x1={150} y1={278} x2={150} y2={240} className="edge gold" strokeWidth={1} opacity={0.7} />
          <line x1={150} y1={240} x2={710} y2={240} className="edge gold" strokeWidth={1} opacity={0.7} />
          {[290, 430, 570].map((x) => <line key={x} x1={x} y1={240} x2={x} y2={278} className="edge gold" strokeWidth={1} opacity={0.7} />)}
          <text x={430} y={232} textAnchor="middle" style={{ fontSize: 8.5, fill: 'var(--gold-2)' }}>ownership (the office owns none of this)</text>
          <line x1={710} y1={278} x2={710} y2={240} className="edge violet" strokeWidth={1} strokeDasharray="3 4" opacity={0.8} />
          <line x1={850} y1={278} x2={850} y2={330} className="edge green" strokeWidth={0} />

          {/* entity nodes */}
          {ENTITIES.map((e) => (
            <g key={e.id} transform={`translate(${e.x} ${e.y})`}>
              <rect x={-58} y={-22} width={116} height={44} rx={8} className="node" style={{ stroke: e.tone }} strokeWidth={1.2} />
              <text y={-3} textAnchor="middle" style={{ fontSize: 10.5, fill: 'var(--ivory)' }}>{e.label}</text>
              <text y={11} textAnchor="middle" style={{ fontSize: 8.5, fill: 'var(--ivory-3)' }}>{e.sub}</text>
            </g>
          ))}
          {SUBS.map((s) => (
            <g key={s.label}>
              <line x1={s.x} y1={322} x2={s.x} y2={385} stroke="rgba(243,236,220,0.15)" strokeWidth={0.8} />
              <text x={s.x} y={s.y + 12} textAnchor="middle" style={{ fontSize: 8.5, fill: 'var(--muted)' }}>{s.label}</text>
            </g>
          ))}
          {/* intercompany note bank → property (green dashed, reminder to eliminate on consolidation) */}
          <path d="M 792 300 Q 640 360 488 300" fill="none" stroke="var(--green-2)" strokeWidth={1} strokeDasharray="3 4" opacity={0.6} />
          <text x={640} y={352} textAnchor="middle" style={{ fontSize: 8.5, fill: 'var(--green-2)' }}>intercompany loan — eliminated on consolidation</text>

          {/* information up & decisions down */}
          {ENTITIES.map((e, i) => {
            const tUp = (p + i * 0.17) % 1;
            const tDown = (p + 0.5 + i * 0.17) % 1;
            const ux = lerp(e.x, FO.x, tUp), uy = lerp(e.y - 22, FO.y + 28, tUp);
            const dx = lerp(FO.x, e.x, tDown), dy = lerp(FO.y + 28, e.y - 22, tDown);
            return (
              <g key={e.id}>
                <line x1={e.x} y1={e.y - 22} x2={FO.x} y2={FO.y + 28} stroke="rgba(243,236,220,0.1)" strokeWidth={1} />
                <circle cx={ux} cy={uy} r={3.5} fill="var(--green-2)" opacity={tUp < 0.05 || tUp > 0.95 ? 0 : 0.95} />
                <circle cx={dx} cy={dy} r={3} fill="var(--blue)" opacity={tDown < 0.05 || tDown > 0.95 ? 0 : 0.95} />
              </g>
            );
          })}

          {/* family office tower */}
          <g transform={`translate(${FO.x} ${FO.y})`}>
            <rect x={-110} y={-30} width={220} height={58} rx={12} className="node" style={{ stroke: 'var(--blue)' }} strokeWidth={1.6} />
            <text y={-8} textAnchor="middle" style={{ fontSize: 13, fill: 'var(--ivory)' }}>Family Office</text>
            <text y={8} textAnchor="middle" style={{ fontSize: 8.8, fill: '#9db7d6' }}>consolidated ledger · tax calendar · investment execution</text>
            <text y={20} textAnchor="middle" style={{ fontSize: 8.8, fill: '#9db7d6' }}>entity compliance · governance support</text>
          </g>

          {/* council reporting */}
          <g transform={`translate(${COUNCIL.x} ${COUNCIL.y})`}>
            <rect x={-80} y={-24} width={160} height={48} rx={10} className="node gold" strokeWidth={1.3} />
            <text y={-4} textAnchor="middle" style={{ fontSize: 11.5, fill: 'var(--ivory)' }}>Family Council</text>
            <text y={11} textAnchor="middle" style={{ fontSize: 8.5, fill: 'var(--ivory-3)' }}>sets policy · receives reporting</text>
          </g>
          <line x1={FO.x - 110} y1={FO.y - 8} x2={COUNCIL.x + 80} y2={COUNCIL.y - 8} stroke="var(--violet)" strokeWidth={1.3} className="flow-line" opacity={0.8} />
          <text x={(FO.x - 110 + COUNCIL.x + 80) / 2} y={FO.y - 16} textAnchor="middle" style={{ fontSize: 8.5, fill: '#b7adda' }}>one balance sheet · quarterly</text>
          <line x1={COUNCIL.x + 80} y1={COUNCIL.y + 10} x2={FO.x - 110} y2={FO.y + 10} stroke="var(--blue)" strokeWidth={1.1} opacity={0.8} />
          <text x={(FO.x - 110 + COUNCIL.x + 80) / 2} y={FO.y + 24} textAnchor="middle" style={{ fontSize: 8.5, fill: '#9db7d6' }}>mandates · policy · budget</text>

          {/* outside advisers */}
          <g transform="translate(790 90)">
            <rect x={-90} y={-24} width={180} height={48} rx={10} className="node" strokeWidth={1} />
            <text y={-4} textAnchor="middle" style={{ fontSize: 10.5, fill: 'var(--ivory-2)' }}>Outside counsel · CPA · auditors</text>
            <text y={11} textAnchor="middle" style={{ fontSize: 8.5, fill: 'var(--ivory-3)' }}>coordinated, not replaced</text>
          </g>
          <line x1={FO.x + 110} y1={FO.y} x2={700} y2={90} stroke="rgba(243,236,220,0.25)" strokeWidth={1} strokeDasharray="3 4" />
        </svg>
      </div>
      <div className="ch15-legend"><span className="info">Information flowing in (statements, accounts, feeds)</span><span className="dec">Decisions flowing out (mandates, approvals, payments)</span><span className="own">Ownership (static; held by the family's entities and trusts)</span><span className="rep">Reporting to the family council</span></div>
      <p className="ch15-caption">A family office owns nothing and controls everything that matters: the information. Statements, management accounts, trustee reports and custodian feeds flow in; approvals, payments, rebalancing orders and compliance filings flow out; and a single consolidated balance sheet, with intercompany loans eliminated so the family bank's note to the property company is not counted as both an asset and a liability, goes up to the council on a fixed calendar. Whether that function sits in a dedicated office, a multi-family firm or a coordinated set of outside advisers is the question Chapter 15's selector helps you frame.</p>
    </div>
  );
}
