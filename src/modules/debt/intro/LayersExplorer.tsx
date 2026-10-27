import { useMemo, useState } from 'react';
import { buildLoan } from '@/lib/finance';
import { useMoney } from '@/components/ui';
import { pct } from '@/lib/format';

type Layer = 'ownership' | 'liabilities' | 'interest' | 'cashflow';
const LAYERS: { id: Layer; label: string; tone: 'gold' | 'amber' | 'green' | 'blue'; color: string; desc: string }[] = [
  { id: 'ownership', label: 'Ownership', tone: 'gold', color: 'var(--gold)', desc: 'Title to the building sits in the Property Co. The family owns the Property Co. The lender owns none of it.' },
  { id: 'liabilities', label: 'Liabilities', tone: 'amber', color: 'var(--amber)', desc: 'The mortgage is a liability of the Property Co and an asset of the lender, secured by a lien on the building.' },
  { id: 'interest', label: 'Interest obligations', tone: 'blue', color: 'var(--blue)', desc: 'Every month a fixed payment flows to the lender, split between interest (the price of the money) and principal (repaying the loan).' },
  { id: 'cashflow', label: 'Investment cash flow', tone: 'green', color: 'var(--green-2)', desc: 'Rent comes in; operating expenses and debt service go out; whatever remains flows to equity.' },
];

export default function LayersExplorer({ price = 1_000_000, loanAmount = 700_000, rate = 0.065, rent = 84_000, expenses = 30_000 }: { price?: number; loanAmount?: number; rate?: number; rent?: number; expenses?: number }) {
  const fmt = useMoney();
  const [on, setOn] = useState<Record<Layer, boolean>>({ ownership: true, liabilities: false, interest: false, cashflow: false });
  const loan = useMemo(() => buildLoan({ principal: loanAmount, annualRate: rate, termMonths: 360, structure: 'amortizing' }), [loanAmount, rate]);
  const m1 = loan.schedule[0];
  const noi = rent - expenses;
  const net = noi - loan.annualDebtService;
  const toggle = (id: Layer) => setOn((s) => ({ ...s, [id]: !s[id] }));
  const W = 900, H = 440;
  // positions
  const fam = { x: 450, y: 50 }, prop = { x: 450, y: 200 }, lender = { x: 760, y: 200 }, tenants = { x: 140, y: 200 }, bld = { x: 450, y: 370 };
  const box = (c: { x: number; y: number }, w: number, h: number, label: string, sub: string, stroke: string, dim?: boolean) => (
    <g opacity={dim ? 0.25 : 1} style={{ transition: 'opacity 0.5s' }}>
      <rect x={c.x - w / 2} y={c.y - h / 2} width={w} height={h} rx={12} fill="rgba(17,20,27,0.92)" stroke={stroke} strokeWidth={1.4} />
      <text x={c.x} y={c.y - 4} textAnchor="middle" className="display" style={{ fontSize: 18, fill: 'var(--ivory)' }}>{label}</text>
      <text x={c.x} y={c.y + 14} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--ivory-3)' }}>{sub}</text>
    </g>
  );
  const flow = (a: { x: number; y: number }, b: { x: number; y: number }, color: string, label: string, bend = 0, labelDy = -8) => {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 + bend;
    return (
      <g className="fade-in">
        <path d={`M${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`} fill="none" stroke={color} strokeWidth={1.8} className="flow-line" />
        <text x={mx} y={my + labelDy} textAnchor="middle" className="label-mono" style={{ fontSize: 11, fill: color }}>{label}</text>
      </g>
    );
  };
  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="ds-layer-toggle">
        {LAYERS.map((l) => (
          <button key={l.id} className={`ds-layer-btn ${l.tone} ${on[l.id] ? 'on' : ''}`} onClick={() => toggle(l.id)} aria-pressed={on[l.id]}>
            <span className="ds-swatch" style={{ background: l.color }} />{l.label}
          </button>
        ))}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="diagram" style={{ maxHeight: 480, minWidth: 640 }} role="img" aria-label="Ownership, liabilities, interest and cash-flow layers of a financed property">
          {box(fam, 200, 56, 'Family', 'owns 100% of Property Co', 'var(--gold)', !on.ownership)}
          {box(prop, 220, 60, 'Property Co', 'holds title · owes the mortgage', 'var(--gold)')}
          {box(lender, 200, 60, 'Lender', `mortgage asset ${fmt(loanAmount, { compact: true })}`, 'var(--amber)', !on.liabilities && !on.interest)}
          {box(tenants, 180, 60, 'Tenants', `rent ${fmt(rent, { compact: true })}/yr`, 'var(--green-2)', !on.cashflow)}
          {/* building */}
          <g opacity={on.ownership ? 1 : 0.35} style={{ transition: 'opacity 0.5s' }}>
            <rect x={bld.x - 70} y={bld.y - 40} width={140} height={80} rx={6} fill="rgba(201,169,97,0.08)" stroke="var(--gold)" />
            {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={bld.x - 58 + c * 32} y={bld.y - 30 + r * 22} width={20} height={14} fill="rgba(243,236,220,0.12)" />))}
            <text x={bld.x} y={bld.y + 58} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--ivory-3)' }}>Building · {fmt(price, { compact: true })}</text>
          </g>
          {on.ownership && (
            <g className="fade-in">
              <line x1={fam.x} y1={fam.y + 28} x2={prop.x} y2={prop.y - 30} stroke="var(--gold)" strokeWidth={1.6} />
              <text x={fam.x + 10} y={(fam.y + prop.y) / 2 + 4} style={{ fontSize: 11, fill: 'var(--gold-2)' }}>100% equity</text>
              <line x1={prop.x} y1={prop.y + 30} x2={bld.x} y2={bld.y - 40} stroke="var(--gold)" strokeWidth={1.6} />
              <text x={prop.x + 10} y={(prop.y + bld.y) / 2 - 4} style={{ fontSize: 11, fill: 'var(--gold-2)' }}>legal title</text>
            </g>
          )}
          {on.liabilities && (
            <g className="fade-in">
              <line x1={prop.x + 110} y1={prop.y} x2={lender.x - 100} y2={lender.y} stroke="var(--amber)" strokeWidth={1.6} strokeDasharray="6 4" />
              <text x={(prop.x + lender.x) / 2} y={prop.y - 10} textAnchor="middle" className="label-mono" style={{ fontSize: 11, fill: 'var(--amber)' }}>Note payable {fmt(loanAmount, { compact: true })}</text>
              <path d={`M${lender.x - 60} ${lender.y + 30} C ${lender.x - 60} ${bld.y}, ${bld.x + 120} ${bld.y}, ${bld.x + 72} ${bld.y}`} fill="none" stroke="var(--amber)" strokeWidth={1.2} strokeDasharray="3 3" />
              <text x={bld.x + 150} y={bld.y - 14} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--amber)' }}>first lien</text>
            </g>
          )}
          {on.interest && (
            <g>
              {flow({ x: prop.x + 110, y: prop.y + 18 }, { x: lender.x - 100, y: lender.y + 18 }, 'var(--blue)', `${fmt(loan.periodicPayment)}/mo`, 60, 26)}
              <g transform={`translate(${(prop.x + lender.x) / 2 - 90} ${prop.y + 86})`} className="fade-in">
                <rect width={180 * (m1.interest / m1.payment)} height={10} fill="var(--blue)" opacity={0.9} />
                <rect x={180 * (m1.interest / m1.payment)} width={180 * (m1.principal / m1.payment)} height={10} fill="var(--gold)" />
                <text x={0} y={26} style={{ fontSize: 10, fill: '#9db7d6' }}>interest {fmt(m1.interest)}</text>
                <text x={180} y={26} textAnchor="end" style={{ fontSize: 10, fill: 'var(--gold-2)' }}>principal {fmt(m1.principal)}</text>
              </g>
            </g>
          )}
          {on.cashflow && (
            <g>
              {flow({ x: tenants.x + 90, y: tenants.y - 10 }, { x: prop.x - 110, y: prop.y - 10 }, 'var(--green-2)', `rent ${fmt(rent / 12, { compact: true })}/mo`, -40, -8)}
              {flow({ x: prop.x - 60, y: prop.y + 30 }, { x: tenants.x + 40, y: bld.y + 20 }, 'var(--ivory-3)', `expenses ${fmt(expenses / 12, { compact: true })}/mo`, 40, 16)}
              <g className="fade-in" transform={`translate(${prop.x + 130} ${fam.y - 20})`}>
                <rect width={180} height={56} rx={8} fill="rgba(62,160,118,0.08)" stroke="var(--green-2)" />
                <text x={90} y={20} textAnchor="middle" style={{ fontSize: 10, fill: 'var(--ivory-3)', letterSpacing: '0.1em' }}>NET CASH FLOW TO EQUITY</text>
                <text x={90} y={42} textAnchor="middle" className="label-mono" style={{ fontSize: 15, fill: net >= 0 ? 'var(--green-2)' : 'var(--red)' }}>{fmt(net, { compact: true })}/yr · {pct(net / (price - loanAmount))} cash-on-cash</text>
              </g>
            </g>
          )}
        </svg>
      </div>
      <div className="grid grid-2" style={{ gap: 10 }}>
        {LAYERS.filter((l) => on[l.id]).map((l) => <div key={l.id} className="panel tight" style={{ borderColor: l.color }}><div className="row" style={{ gap: 8, marginBottom: 4 }}><span className="ds-swatch" style={{ width: 10, height: 10, borderRadius: 5, background: l.color }} /><strong>{l.label}</strong></div><p className="small muted" style={{ margin: 0 }}>{l.desc}</p></div>)}
      </div>
      <p className="ds-note" style={{ margin: 0 }}>Loan {fmt(loanAmount, { compact: true })} at {pct(rate)} over 30 years → {fmt(loan.periodicPayment)}/month, {fmt(loan.annualDebtService, { compact: true })}/year. NOI {fmt(noi, { compact: true })} → DSCR {(noi / loan.annualDebtService).toFixed(2)}×. Computed with buildLoan.</p>
    </div>
  );
}
