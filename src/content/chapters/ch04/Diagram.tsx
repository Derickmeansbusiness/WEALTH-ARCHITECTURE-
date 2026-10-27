import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStages, lerp } from '@/modules/academy/anim';
import { Chip } from '@/components/ui';

/**
 * The $1,000,000 property split into $300,000 equity + $700,000 debt. Four layers animate separately:
 * ownership (who holds title), liability (who owes whom), interest (what the debt costs), cash flow (where the rent goes).
 */
const LAYERS = [
  { id: 'capital', label: 'Capital stack', caption: 'The $1,000,000 building is paid for with $300,000 of the family\'s equity and $700,000 of the bank\'s money. Two sources, one asset.' },
  { id: 'ownership', label: 'Ownership', caption: 'Title to the whole building sits with the Property LLC, which the family owns 100%. The bank owns nothing; it holds a lien (mortgage) over the building as security.' },
  { id: 'liability', label: 'Liability', caption: 'The LLC owes the bank $700,000. If the loan is personally guaranteed, the founder owes it too, and the lender can reach past the LLC. The guarantee is the dashed line.' },
  { id: 'cashflow', label: 'Interest & cash flow', caption: 'Rent of $96,000 enters the LLC; $31,000 leaves for operating costs; $58,000 of debt service goes to the bank (of which about $47,000 is interest in year one and $11,000 principal); roughly $7,000 is left for the owner. Debt service continues whether or not the rent does.' },
];

export default function Diagram() {
  const { stage, t, setStage, playing, toggle } = useStages(LAYERS.length, 4200);
  const [guarantee, setGuarantee] = useState(true);
  const layer = LAYERS[stage];
  const show = (i: number) => stage >= i;
  const p = (i: number) => (stage === i ? t : stage > i ? 1 : 0);

  const eqH = 66, debtH = 154; // 220 total = 1.0m
  const stackX = 80, stackY = 110;

  return (
    <div>
      <div className="acad-diagram-controls">
        {LAYERS.map((l, i) => <button key={l.id} className={`btn sm ${stage === i ? 'active' : 'ghost'}`} onClick={() => setStage(i)}>{i + 1}. {l.label}</button>)}
        <button className="btn sm ghost" onClick={toggle}>{playing ? '❚❚' : '▶'}</button>
        <span style={{ flex: 1 }} />
        <button className={`btn sm ${guarantee ? 'active' : 'ghost'}`} onClick={() => setGuarantee((g) => !g)}>Personal guarantee: {guarantee ? 'on' : 'off'}</button>
      </div>
      <div className="acad-diagram-wrap">
        <svg className="diagram" viewBox="0 0 760 400" role="img" aria-label="A $1,000,000 property financed with $300,000 equity and $700,000 debt, shown in layers">
          <defs>
            <marker id="ch04-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--gold-2)" /></marker>
            <marker id="ch04-arrow-red" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--red)" /></marker>
          </defs>

          {/* Capital stack */}
          <text x={stackX + 60} y="92" textAnchor="middle" className="label-mono" style={{ fontSize: 10, letterSpacing: 2, fill: 'var(--ivory-3)' }}>$1,000,000</text>
          <rect x={stackX} y={stackY} width="120" height={debtH * p(0)} rx="4" fill="rgba(194,90,76,0.55)" stroke="var(--red)" />
          <rect x={stackX} y={stackY + debtH * p(0)} width="120" height={eqH * p(0)} rx="4" fill="rgba(201,169,97,0.7)" stroke="var(--gold)" />
          <g opacity={p(0)}>
            <text x={stackX + 60} y={stackY + debtH / 2 - 2} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--ivory)' }}>Debt</text>
            <text x={stackX + 60} y={stackY + debtH / 2 + 12} textAnchor="middle" className="label-mono" style={{ fontSize: 10.5, fill: 'var(--ivory)' }}>$700,000 · 70% LTV</text>
            <text x={stackX + 60} y={stackY + debtH + eqH / 2 - 1} textAnchor="middle" style={{ fontSize: 11, fill: '#1a1508', fontWeight: 500 }}>Equity</text>
            <text x={stackX + 60} y={stackY + debtH + eqH / 2 + 12} textAnchor="middle" className="label-mono" style={{ fontSize: 10.5, fill: '#1a1508' }}>$300,000</text>
          </g>

          {/* Building */}
          <g transform="translate(380 230)">
            <path d="M -70 60 V -30 L -35 -50 V -30 L 0 -50 V -30 L 35 -50 V -30 L 70 -50 V 60 Z" className="node gold" />
            <text x="0" y="8" textAnchor="middle" style={{ fontSize: 11.5, fill: 'var(--ivory)' }}>Retail building</text>
            <text x="0" y="24" textAnchor="middle" className="label-mono" style={{ fontSize: 9.5, fill: 'var(--gold-2)' }}>NOI $65,000 · 6.5% cap</text>
          </g>

          {/* Ownership layer */}
          <g opacity={p(1)}>
            <rect x="300" y="60" width="160" height="46" rx="8" className="node" stroke="var(--blue)" />
            <text x="380" y="80" textAnchor="middle" style={{ fontSize: 11.5, fill: 'var(--ivory)' }}>Property LLC</text>
            <text x="380" y="95" textAnchor="middle" className="label-mono" style={{ fontSize: 9, fill: 'var(--blue)' }}>holds legal title</text>
            <line x1="380" y1="106" x2="380" y2={lerp(106, 180, p(1))} className="edge blue" strokeWidth="1.5" />
            <text x="392" y="150" style={{ fontSize: 9, fill: 'var(--blue)' }}>title</text>
            <rect x="300" y="8" width="160" height="34" rx="17" className="node" stroke="var(--line-strong)" />
            <text x="380" y="30" textAnchor="middle" style={{ fontSize: 11, fill: 'var(--ivory)' }}>Family · 100% member</text>
            <line x1="380" y1="42" x2="380" y2="60" className="edge" />
          </g>

          {/* Bank */}
          <g opacity={Math.max(p(0) * 0.5, p(2))}>
            <rect x="580" y="130" width="150" height="56" rx="8" className="node" stroke="var(--red)" />
            <text x="655" y="152" textAnchor="middle" style={{ fontSize: 11.5, fill: 'var(--ivory)' }}>Bank</text>
            <text x="655" y="168" textAnchor="middle" className="label-mono" style={{ fontSize: 9, fill: '#e7a398' }}>lender · lien on building</text>
          </g>

          {/* Liability layer */}
          <g opacity={p(2)}>
            <path d={`M 460 83 C 540 83, 560 140, 580 150`} fill="none" stroke="var(--red)" strokeWidth="1.6" markerEnd="url(#ch04-arrow-red)" />
            <text x="520" y="100" textAnchor="middle" style={{ fontSize: 9.5, fill: '#e7a398' }}>LLC owes $700,000</text>
            <path d={`M 580 180 C 540 230, 500 240, 452 250`} fill="none" stroke="var(--red)" strokeWidth="1.2" strokeDasharray="3 4" />
            <text x="540" y="238" textAnchor="middle" style={{ fontSize: 9, fill: '#e7a398' }}>mortgage lien</text>
            {guarantee && (
              <g>
                <path d={`M 460 25 C 600 25, 655 60, 655 130`} fill="none" stroke="var(--red)" strokeWidth="1.4" strokeDasharray="5 5" markerEnd="url(#ch04-arrow-red)" />
                <text x="590" y="48" textAnchor="middle" style={{ fontSize: 9.5, fill: '#e7a398', fontStyle: 'italic' }}>personal guarantee → founder's whole balance sheet</text>
              </g>
            )}
            {!guarantee && <text x="590" y="48" textAnchor="middle" style={{ fontSize: 9.5, fill: 'var(--green-2)', fontStyle: 'italic' }}>non-recourse: lender limited to the building</text>}
          </g>

          {/* Cash flow layer */}
          <g opacity={p(3)}>
            <path d="M 240 300 H 310" className="edge green flow-line" strokeWidth="2" markerEnd="url(#ch04-arrow)" />
            <text x="275" y="292" textAnchor="middle" style={{ fontSize: 9.5, fill: 'var(--green-2)' }}>rent $96k</text>
            <path d="M 380 290 V 340 H 300" className="edge flow-line" strokeWidth="1.4" markerEnd="url(#ch04-arrow)" />
            <text x="330" y="356" textAnchor="middle" style={{ fontSize: 9.5, fill: 'var(--ivory-3)' }}>opex $31k</text>
            <path d="M 450 290 C 520 290, 560 200, 600 186" className="edge red flow-line" strokeWidth="2" markerEnd="url(#ch04-arrow-red)" />
            <text x="560" y="262" textAnchor="middle" style={{ fontSize: 9.5, fill: '#e7a398' }}>debt service $58k</text>
            <text x="560" y="275" textAnchor="middle" className="label-mono" style={{ fontSize: 8.5, fill: '#e7a398' }}>≈ $47k interest + $11k principal (yr 1)</text>
            <path d="M 380 180 V 106" className="edge gold flow-line" strokeWidth="1.4" markerEnd="url(#ch04-arrow)" opacity="0.9" />
            <text x="440" y="130" textAnchor="middle" style={{ fontSize: 9.5, fill: 'var(--gold-2)' }}>to owner ≈ $7k</text>
            <text x="380" y="388" textAnchor="middle" style={{ fontSize: 11, fill: 'var(--ivory-3)' }}>DSCR 1.12× · cash-on-cash ≈ 2.1% · the bank is paid before the owner, every year</text>
          </g>
        </svg>
      </div>
      <p className="acad-diagram-caption"><strong>What moves:</strong> {layer.caption}</p>
      <div className="row between" style={{ marginTop: 10 }}>
        <Chip tone="gold">Layer {stage + 1} of 4 · {layer.label}</Chip>
        <Link to="/debt-credit-studio" className="btn sm primary">Open the full Debt & Credit Studio →</Link>
      </div>
    </div>
  );
}
