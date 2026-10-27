import { useStages } from '@/modules/academy/anim';
import { Chip } from '@/components/ui';

/**
 * An entity tree assembles outward from a holding company. Each operating/property box gets a dashed
 * "liability fence" once it lands; the final stage shows a claim bouncing off the fences.
 */
const STEPS = [
  'The family holding company is formed first: one place for ownership decisions.',
  'Operating companies land under it, each in its own box with its own fence.',
  'The property company owns the building and leases it to Operating Co 1 at arm\'s length.',
  'The management company employs shared staff and bills each box a documented fee; the investment company holds the portfolio away from operations.',
  'A $2.2m claim arises at Operating Co 2. It reaches that box and stops at its fence; the holding company\'s interest in Operating Co 2 is now worth little, and nothing else is touched.',
];

const BOXES = [
  { id: 'op1', label: 'Operating Co 1', sub: 'restaurant · 100%', x: 60, step: 1, tone: 'var(--gold)' },
  { id: 'op2', label: 'Operating Co 2', sub: 'second site · 100%', x: 200, step: 1, tone: 'var(--gold)' },
  { id: 'prop', label: 'Property LLC', sub: 'building · 100%', x: 340, step: 2, tone: 'var(--green-2)' },
  { id: 'mgmt', label: 'Management Co', sub: 'staff · fees · 100%', x: 480, step: 3, tone: 'var(--blue)' },
  { id: 'inv', label: 'Investment Co', sub: 'portfolio · 100%', x: 620, step: 3, tone: 'var(--violet)' },
];

export default function Diagram() {
  const { stage, t, setStage, playing, toggle } = useStages(STEPS.length, 3600);
  const vis = (step: number) => (stage > step ? 1 : stage === step ? t : 0);
  const boxY = 230;

  return (
    <div>
      <div className="acad-diagram-controls">
        {STEPS.map((_, i) => <button key={i} className={`btn sm ${stage === i ? 'active' : 'ghost'}`} onClick={() => setStage(i)}>{i + 1}</button>)}
        <button className="btn sm ghost" onClick={toggle}>{playing ? '❚❚' : '▶'}</button>
        <span style={{ flex: 1 }} />
        <Chip tone="gold">{1 + BOXES.filter((b) => vis(b.step) > 0).length} entities</Chip>
      </div>
      <div className="acad-diagram-wrap">
        <svg className="diagram" viewBox="0 0 760 400" role="img" aria-label="Entity tree assembling from a holding company with liability fences">
          <defs>
            <marker id="ch05-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--red)" /></marker>
          </defs>

          {/* Family */}
          <g opacity={vis(0)}>
            <rect x="300" y="14" width="160" height="34" rx="17" className="node" />
            <text x="380" y="36" textAnchor="middle" style={{ fontSize: 11, fill: 'var(--ivory)' }}>Family · members</text>
            <line x1="380" y1="48" x2="380" y2="74" className="edge" />
          </g>

          {/* Holdco */}
          <g opacity={vis(0)} transform={`translate(0 ${(1 - vis(0)) * -16})`}>
            <rect x="280" y="74" width="200" height="56" rx="10" className="node gold" strokeWidth="1.5" />
            <text x="380" y="98" textAnchor="middle" style={{ fontSize: 12.5, fill: 'var(--ivory)' }}>Family Holding LLC</text>
            <text x="380" y="115" textAnchor="middle" className="label-mono" style={{ fontSize: 9, fill: 'var(--gold)' }}>multi-member · partnership for tax</text>
          </g>

          {/* Boxes */}
          {BOXES.map((b) => {
            const v = vis(b.step);
            const cx = b.x + 60;
            const y = boxY + (1 - v) * 40;
            const hit = stage === 4 && b.id === 'op2';
            return (
              <g key={b.id} opacity={v}>
                <path d={`M 380 130 C 380 170, ${cx} 170, ${cx} ${y}`} className="edge gold" strokeWidth="1.2" />
                <text x={(380 + cx) / 2} y={176 + (cx - 380) * 0.03} textAnchor="middle" className="label-mono" style={{ fontSize: 8.5, fill: 'var(--gold-2)' }}>100%</text>
                {/* fence */}
                <rect x={b.x - 8} y={y - 8} width="136" height="86" rx="12" fill="none" stroke={hit ? 'var(--red)' : b.tone} strokeWidth={hit ? 2 : 1.2} className="acad-fence" opacity={Math.max(0, (v - 0.5) * 2)} />
                <rect x={b.x} y={y} width="120" height="70" rx="8" className="node" stroke={b.tone} />
                <text x={cx} y={y + 28} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--ivory)' }}>{b.label}</text>
                <text x={cx} y={y + 44} textAnchor="middle" className="label-mono" style={{ fontSize: 8.5, fill: 'var(--ivory-3)' }}>{b.sub}</text>
                <text x={cx} y={y + 95} textAnchor="middle" style={{ fontSize: 8.5, fill: b.tone }} opacity={Math.max(0, (v - 0.5) * 2)}>liability fence</text>
              </g>
            );
          })}

          {/* Lease + fee lines (stage >= 2 / 3) */}
          <g opacity={vis(2)}>
            <path d={`M 400 ${boxY + 35} H 320`} className="edge green flow-line" strokeWidth="1.4" />
            <text x="360" y={boxY + 28} textAnchor="middle" style={{ fontSize: 8.5, fill: 'var(--green-2)' }}>lease → rent</text>
          </g>
          <g opacity={vis(3)}>
            <path d={`M 540 ${boxY + 80} C 540 ${boxY + 110}, 120 ${boxY + 110}, 120 ${boxY + 80}`} className="edge blue flow-line" strokeWidth="1" />
            <path d={`M 540 ${boxY + 80} C 540 ${boxY + 104}, 260 ${boxY + 104}, 260 ${boxY + 80}`} className="edge blue flow-line" strokeWidth="1" />
            <text x="330" y={boxY + 122} textAnchor="middle" style={{ fontSize: 8.5, fill: '#9db7d6' }}>services → arm's-length management fees</text>
          </g>

          {/* Claim */}
          {stage === 4 && (
            <g opacity={t}>
              <circle cx={260 - 140 * (1 - t)} cy={360 - 60 * t} r="14" fill="rgba(194,90,76,0.85)" />
              <text x={260 - 140 * (1 - t)} y={364 - 60 * t} textAnchor="middle" style={{ fontSize: 8, fill: 'var(--ivory)', fontWeight: 600 }}>$2.2m</text>
              <path d={`M ${274 - 140 * (1 - t)} ${356 - 60 * t} L 260 ${boxY + 78}`} stroke="var(--red)" strokeWidth="1.5" markerEnd="url(#ch05-arrow)" opacity={t > 0.6 ? 1 : 0} />
              <text x="380" y="385" textAnchor="middle" style={{ fontSize: 11, fill: 'var(--ivory-2)' }} opacity={Math.max(0, (t - 0.6) / 0.4)}>Claim stops at Operating Co 2's fence. Building, other site, staff, portfolio: untouched, <tspan style={{ fill: 'var(--amber)' }}>if the fences were maintained</tspan>.</text>
            </g>
          )}
          {stage < 4 && <text x="380" y="385" textAnchor="middle" style={{ fontSize: 11, fill: 'var(--ivory-3)' }}>{STEPS[stage]}</text>}
        </svg>
      </div>
      <p className="acad-diagram-caption"><strong>What moves:</strong> the tree assembles outward from the holding company; each box gets a pulsing dashed fence once it lands, and the lease and management-fee flows appear as the property and management companies arrive. In the last step a claim arising in one operating company travels to that box and stops at its fence. The amber caveat is the whole chapter: the fences only hold if each box has its own account, books, insurance and documents.</p>
    </div>
  );
}
