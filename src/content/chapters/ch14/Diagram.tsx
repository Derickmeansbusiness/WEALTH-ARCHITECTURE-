import { useEffect, useState } from 'react';
import './styles.css';

/**
 * Governance architecture: bodies and decision-right flows.
 * gold = ownership / election, blue = decision rights & policy, violet = fiduciary (trustees),
 * green = information & reporting.
 */
interface Body { id: string; x: number; y: number; w: number; label: string; sub: string; tone: string }
const BODIES: Body[] = [
  { id: 'assembly', x: 450, y: 50, w: 260, label: 'Family Assembly', sub: 'all adult members · annual', tone: 'var(--gold)' },
  { id: 'council', x: 450, y: 150, w: 200, label: 'Family Council', sub: 'elected · charter · term limits', tone: 'var(--gold)' },
  { id: 'invest', x: 150, y: 260, w: 150, label: 'Investment Committee', sub: 'IPS · independent member', tone: 'var(--blue)' },
  { id: 'educ', x: 330, y: 260, w: 130, label: 'Education Committee', sub: 'curriculum by age', tone: 'var(--blue)' },
  { id: 'phil', x: 570, y: 260, w: 130, label: 'Philanthropy Committee', sub: 'DAF / foundation', tone: 'var(--blue)' },
  { id: 'board', x: 760, y: 260, w: 150, label: 'HoldCo Board', sub: 'independent directors', tone: 'var(--blue)' },
  { id: 'trustees', x: 150, y: 380, w: 170, label: 'Trustees · Protector', sub: 'letter of wishes · distributions', tone: 'var(--violet)' },
  { id: 'fo', x: 450, y: 380, w: 200, label: 'Family Office', sub: 'reporting · execution · coordination', tone: 'var(--green-2)' },
  { id: 'opco', x: 760, y: 380, w: 150, label: 'Operating & Holding Cos', sub: 'management', tone: 'var(--ivory-3)' },
];
interface Edge { from: string; to: string; tone: string; label?: string; dashed?: boolean; flow?: boolean }
const EDGES: Edge[] = [
  { from: 'assembly', to: 'council', tone: 'var(--gold)', label: 'elects' },
  { from: 'council', to: 'invest', tone: 'var(--blue)', label: 'policy' },
  { from: 'council', to: 'educ', tone: 'var(--blue)', label: 'policy' },
  { from: 'council', to: 'phil', tone: 'var(--blue)', label: 'policy' },
  { from: 'council', to: 'board', tone: 'var(--blue)', label: 'nominates' },
  { from: 'council', to: 'trustees', tone: 'var(--violet)', label: 'letter of wishes', dashed: true },
  { from: 'invest', to: 'fo', tone: 'var(--blue)', label: 'mandate' },
  { from: 'board', to: 'opco', tone: 'var(--blue)', label: 'directs' },
  { from: 'trustees', to: 'fo', tone: 'var(--violet)', label: 'instructs', dashed: true },
  { from: 'fo', to: 'council', tone: 'var(--green-2)', label: 'consolidated reporting', flow: true },
  { from: 'opco', to: 'fo', tone: 'var(--green-2)', label: 'management accounts', flow: true },
  { from: 'fo', to: 'trustees', tone: 'var(--green-2)', flow: true },
];
const ORDER = ['assembly', 'council', 'invest', 'educ', 'phil', 'board', 'trustees', 'fo', 'opco'];

export default function Diagram() {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now();
    const tick = (now: number) => { setT(Math.min(1, (now - start) / 4800)); if (now - start < 4800) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const pos = Object.fromEntries(BODIES.map((b) => [b.id, b]));
  const appear = (i: number, n: number) => Math.max(0, Math.min(1, (t * 1.6 - (i / n) * 0.9) * 4));

  return (
    <div>
      <div className="ch14-diagram-wrap">
        <svg viewBox="0 0 900 450" className="diagram" aria-label="Family governance architecture with assembly, council, committees, board, trustees and family office and the decision-right flows between them">
          {EDGES.map((e, i) => {
            const A = pos[e.from], B = pos[e.to];
            const a = appear(ORDER.indexOf(e.to) + 0.5, ORDER.length);
            // offset vertical endpoints to box edges
            const ay = A.y + (B.y > A.y ? 22 : -22), by = B.y + (B.y > A.y ? -22 : 22);
            const mx = (A.x + B.x) / 2, my = (ay + by) / 2;
            const isUp = B.y < A.y;
            return (
              <g key={i} opacity={a}>
                <line x1={A.x} y1={ay} x2={A.x + (B.x - A.x) * a} y2={ay + (by - ay) * a} stroke={e.tone} strokeWidth={e.flow ? 1.4 : 1.1} strokeDasharray={e.dashed ? '4 4' : undefined} className={e.flow && a >= 1 ? 'flow-line' : undefined} opacity={0.75} />
                {e.label && a >= 1 && <text x={mx + (isUp ? 56 : 0)} y={my - 4} textAnchor="middle" style={{ fontSize: 8.5, fill: e.tone, opacity: 0.95 }}>{e.label}</text>}
              </g>
            );
          })}
          {BODIES.map((b, i) => {
            const a = appear(ORDER.indexOf(b.id), ORDER.length);
            return (
              <g key={b.id} opacity={a} transform={`translate(${b.x} ${b.y + (1 - a) * 12})`}>
                <rect x={-b.w / 2} y={-22} width={b.w} height={44} rx={9} className="node" style={{ stroke: b.tone }} strokeWidth={1.3} />
                <text y={-3} textAnchor="middle" style={{ fontSize: 11.5, fill: 'var(--ivory)' }}>{b.label}</text>
                <text y={11} textAnchor="middle" style={{ fontSize: 8.5, fill: 'var(--ivory-3)' }}>{b.sub}</text>
              </g>
            );
          })}
          <text x={20} y={438} style={{ fontSize: 9.5, fill: 'var(--muted)' }}>Conflict ladder written into shareholder agreements and trust instruments: conversation → council facilitation → mediation → arbitration</text>
        </svg>
      </div>
      <div className="ch14-legend"><span className="own">Ownership · election</span><span className="ctrl">Decision rights · policy</span><span className="ben">Fiduciary guidance (non-binding to trustees)</span><span className="info">Information · reporting</span></div>
      <p className="ch14-caption">Governance is the set of bodies through which a family decides, and the written rules about which body decides what. The assembly elects the council; the council sets policy for committees and nominates directors, but it does not run the company, and it cannot instruct trustees, only guide them through a letter of wishes. The family office sits at the bottom of the decision flow and the top of the information flow: it executes mandates and sends consolidated reporting back up. Families get into trouble when one person sits in every box.</p>
    </div>
  );
}
