/**
 * Animated SVG visuals for the Debt Studio lessons. All math comes from @/lib/finance or ../math.
 */
import { useMemo, useState } from 'react';
import { buildLoan, annualize, simpleInterest, compoundInterest, balanceAfter } from '@/lib/finance';
import { useMoney, Chip, SliderField } from '@/components/ui';
import { pct, num } from '@/lib/format';
import { expansionModel } from '../../math';
import { useInViewProgress, easeOut, seg, clamp01 } from './animation';

const GOLD = 'var(--gold)', GOLD2 = 'var(--gold-2)', AMBER = 'var(--amber)', GREEN = 'var(--green-2)', RED = 'var(--red)', BLUE = 'var(--blue)', IVORY = 'var(--ivory-2)', MUTED = 'var(--ivory-3)', LINE = 'rgba(243,236,220,0.12)';

function Frame({ children, viewBox, label, maxH = 420 }: { children: React.ReactNode; viewBox: string; label: string; maxH?: number }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={viewBox} className="diagram" style={{ maxHeight: maxH, minWidth: 520 }} role="img" aria-label={label}>{children}</svg>
    </div>
  );
}

/* ── L01: simple vs compound interest ─────────────────────────────── */
export function InterestCurves() {
  const { ref, t } = useInViewProgress<HTMLDivElement>(3200);
  const fmt = useMoney();
  const P = 100_000, r = 0.06, Y = 30;
  const W = 720, H = 340, L = 70, R = 30, T = 24, B = 44;
  const maxV = P + compoundInterest(P, r, Y, 12);
  const x = (y: number) => L + (y / Y) * (W - L - R);
  const yv = (v: number) => T + (1 - v / maxV) * (H - T - B);
  const pts = (fn: (y: number) => number) => Array.from({ length: Y * 4 + 1 }, (_, i) => { const y = i / 4; return `${x(y)},${yv(fn(y))}`; }).join(' ');
  const simple = pts((y) => P + simpleInterest(P, r, y));
  const annual = pts((y) => P + compoundInterest(P, r, y, 1));
  const monthly = pts((y) => P + compoundInterest(P, r, y, 12));
  const prog = easeOut(t);
  const clipW = L + prog * (W - L - R);
  const yNow = prog * Y;
  return (
    <div ref={ref} className="stack" style={{ gap: 10 }}>
      <Frame viewBox={`0 0 ${W} ${H}`} label="Simple versus compound interest on $100,000 at 6% over 30 years">
        <defs><clipPath id="ic-clip"><rect x={0} y={0} width={clipW} height={H} /></clipPath></defs>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => <line key={f} x1={L} x2={W - R} y1={yv(f * maxV)} y2={yv(f * maxV)} stroke={LINE} />)}
        {[0, 10, 20, 30].map((y) => <text key={y} x={x(y)} y={H - 18} textAnchor="middle" style={{ fontSize: 11, fill: MUTED }}>Year {y}</text>)}
        {[0.25, 0.5, 0.75, 1].map((f) => <text key={f} x={L - 8} y={yv(f * maxV) + 4} textAnchor="end" className="label-mono" style={{ fontSize: 10, fill: MUTED }}>{fmt(f * maxV, { compact: true })}</text>)}
        <g clipPath="url(#ic-clip)">
          <polyline points={simple} fill="none" stroke={IVORY} strokeWidth={1.6} />
          <polyline points={annual} fill="none" stroke={AMBER} strokeWidth={1.8} />
          <polyline points={monthly} fill="none" stroke={GOLD} strokeWidth={2.2} />
        </g>
        <line x1={clipW} x2={clipW} y1={T} y2={H - B} stroke={GOLD} strokeOpacity={0.5} strokeDasharray="3 4" />
        {[
          { fn: (y: number) => P + simpleInterest(P, r, y), c: IVORY, label: 'Simple' },
          { fn: (y: number) => P + compoundInterest(P, r, y, 1), c: AMBER, label: 'Compound (annual)' },
          { fn: (y: number) => P + compoundInterest(P, r, y, 12), c: GOLD, label: 'Compound (monthly)' },
        ].map((s, i) => (
          <g key={i}>
            <circle cx={x(yNow)} cy={yv(s.fn(yNow))} r={4} fill={s.c} />
            <text x={Math.min(x(yNow) + 8, W - 140)} y={yv(s.fn(yNow)) - 6 + i * 0} className="label-mono" style={{ fontSize: 11, fill: s.c }}>{fmt(s.fn(yNow), { compact: true })}</text>
          </g>
        ))}
        <g transform={`translate(${L + 10} ${T + 6})`}>
          {[['Simple interest', IVORY], ['Compound, annual', AMBER], ['Compound, monthly', GOLD]].map(([l, c], i) => (
            <g key={l} transform={`translate(0 ${i * 16})`}><rect width={14} height={3} y={4} fill={c} /><text x={20} y={9} style={{ fontSize: 11 }}>{l}</text></g>
          ))}
        </g>
      </Frame>
      <div className="row between">
        <span className="ds-note">$100,000 · 6% nominal · 30 years. Simple: P·r·t. Compound: P·(1 + r/n)^(n·t) − P. Monthly compounding of 6% nominal is an effective 6.17% annual rate.</span>
        <span className="mono tiny gold">Year {num(yNow, 1)}</span>
      </div>
    </div>
  );
}

/* ── L01: amortization bars ───────────────────────────────────────── */
export function AmortizationBars({ principal = 700_000, annualRate = 0.065, termMonths = 360 }: { principal?: number; annualRate?: number; termMonths?: number }) {
  const { ref, t } = useInViewProgress<HTMLDivElement>(4200);
  const fmt = useMoney();
  const loan = useMemo(() => buildLoan({ principal, annualRate, termMonths, structure: 'amortizing' }), [principal, annualRate, termMonths]);
  const years = useMemo(() => annualize(loan.schedule, 12), [loan]);
  const W = 760, H = 320, L = 60, R = 20, T = 20, B = 40;
  const maxPay = Math.max(...years.map((y) => y.payment));
  const bw = (W - L - R) / years.length;
  const yv = (v: number) => T + (1 - v / maxPay) * (H - T - B);
  const cross = years.findIndex((y) => y.principal > y.interest);
  const shown = Math.floor(easeOut(t) * years.length);
  return (
    <div ref={ref} className="stack" style={{ gap: 10 }}>
      <div className="row between">
        <div className="row" style={{ gap: 8 }}><Chip tone="gold">Payment {fmt(loan.periodicPayment)}/mo</Chip><Chip tone="amber">Total interest {fmt(loan.totalInterest, { compact: true })}</Chip><Chip>{years.length} years</Chip></div>
        <div className="ds-legend"><span style={{ ['--c' as string]: 'var(--amber)' }}>Interest</span><span style={{ ['--c' as string]: 'var(--gold)' }}>Principal</span><span style={{ ['--c' as string]: 'var(--ivory-3)' }}>Balance</span></div>
      </div>
      <Frame viewBox={`0 0 ${W} ${H}`} label="Annual split of mortgage payments between interest and principal">
        {years.map((y, i) => {
          const on = i < shown;
          const x0 = L + i * bw + 2;
          const w = Math.max(2, bw - 4);
          const hi = (y.interest / maxPay) * (H - T - B);
          const hp = (y.principal / maxPay) * (H - T - B);
          return (
            <g key={y.year} opacity={on ? 1 : 0.08} style={{ transition: 'opacity 0.3s' }}>
              <rect x={x0} y={yv(y.interest)} width={w} height={hi} fill={AMBER} opacity={0.85} />
              <rect x={x0} y={yv(y.interest) - hp} width={w} height={hp} fill={GOLD} />
            </g>
          );
        })}
        <polyline fill="none" stroke={MUTED} strokeWidth={1.4} strokeDasharray="3 3"
          points={years.slice(0, Math.max(1, shown)).map((y, i) => `${L + i * bw + bw / 2},${T + (1 - y.balance / principal) * (H - T - B)}`).join(' ')} />
        {cross >= 0 && shown > cross && (
          <g>
            <line x1={L + cross * bw + bw / 2} x2={L + cross * bw + bw / 2} y1={T} y2={H - B} stroke={GOLD2} strokeDasharray="2 4" />
            <text x={L + cross * bw + bw / 2 + 6} y={T + 12} style={{ fontSize: 11, fill: GOLD2 }}>Year {years[cross].year}: principal overtakes interest</text>
          </g>
        )}
        {[1, 5, 10, 15, 20, 25, 30].filter((y) => y <= years.length).map((y) => <text key={y} x={L + (y - 1) * bw + bw / 2} y={H - 18} textAnchor="middle" style={{ fontSize: 10, fill: MUTED }}>Y{y}</text>)}
        <text x={L - 6} y={T + 10} textAnchor="end" className="label-mono" style={{ fontSize: 10, fill: MUTED }}>{fmt(maxPay, { compact: true })}</text>
        <text x={L - 6} y={H - B} textAnchor="end" className="label-mono" style={{ fontSize: 10, fill: MUTED }}>0</text>
      </Frame>
      <span className="ds-note">{fmt(principal)} · {pct(annualRate)} fixed · {termMonths / 12}-year amortizing. Each bar is one year of payments; the dashed line is the remaining balance. Early years are mostly interest because interest is charged on the outstanding balance.</span>
    </div>
  );
}

/* ── L02: credit factor weights ───────────────────────────────────── */
const FACTORS = [
  { k: 'Payment history', w: 35, c: GOLD, d: 'Late payments, collections, public records. The single heaviest category in the published FICO model.' },
  { k: 'Amounts owed / utilization', w: 30, c: GOLD2, d: 'Revolving balances relative to limits; total debt. Utilization has no memory in most scoring models, so it can be repaired quickly.' },
  { k: 'Length of history', w: 15, c: AMBER, d: 'Age of oldest account, average age. Closing old accounts can shorten average age.' },
  { k: 'New credit', w: 10, c: BLUE, d: 'Recent hard inquiries and newly opened accounts.' },
  { k: 'Credit mix', w: 10, c: GREEN, d: 'Experience with both installment and revolving products.' },
];
export function CreditFactors() {
  const { ref, t } = useInViewProgress<HTMLDivElement>(2200);
  const [active, setActive] = useState(0);
  const p = easeOut(t);
  return (
    <div ref={ref} className="ds-two" style={{ alignItems: 'center' }}>
      <svg viewBox="0 0 320 320" className="diagram" style={{ maxHeight: 320 }} role="img" aria-label="Approximate FICO category weights">
        {(() => {
          let acc = 0;
          return FACTORS.map((f, i) => {
            const start = acc; acc += f.w;
            const a0 = (start / 100) * Math.PI * 2 - Math.PI / 2;
            const a1 = ((start + f.w * p) / 100) * Math.PI * 2 - Math.PI / 2;
            const r = active === i ? 118 : 110, ri = 70;
            const arc = (R: number, a: number) => [160 + R * Math.cos(a), 160 + R * Math.sin(a)];
            const [x0, y0] = arc(r, a0), [x1, y1] = arc(r, a1), [xi0, yi0] = arc(ri, a0), [xi1, yi1] = arc(ri, a1);
            const large = (a1 - a0) > Math.PI ? 1 : 0;
            return <path key={f.k} d={`M${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} L${xi1},${yi1} A${ri},${ri} 0 ${large} 0 ${xi0},${yi0} Z`} fill={f.c} opacity={active === i ? 1 : 0.7} onClick={() => setActive(i)} style={{ cursor: 'pointer', transition: 'opacity 0.3s' }} />;
          });
        })()}
        <text x={160} y={154} textAnchor="middle" className="display" style={{ fontSize: 30, fill: 'var(--ivory)' }}>{FACTORS[active].w}%</text>
        <text x={160} y={176} textAnchor="middle" style={{ fontSize: 11, fill: MUTED }}>{FACTORS[active].k}</text>
      </svg>
      <div className="stack" style={{ gap: 8 }}>
        {FACTORS.map((f, i) => (
          <button key={f.k} onClick={() => setActive(i)} className="ds-card" style={{ padding: '10px 14px', borderColor: active === i ? f.c : undefined }}>
            <div className="row between"><span style={{ color: 'var(--ivory)' }}>{f.k}</span><span className="mono small" style={{ color: f.c }}>≈{f.w}%</span></div>
            {active === i && <p className="small muted" style={{ margin: '6px 0 0' }}>{f.d}</p>}
          </button>
        ))}
        <span className="ds-note">Approximate category weights as published by FICO for its general-purpose scores. Educational only; this is not a bureau calculation, and lenders may use different models or custom scorecards.</span>
      </div>
    </div>
  );
}

/* ── L06: the financed machine ────────────────────────────────────── */
export function MachineModel() {
  const fmt = useMoney();
  const [financed, setFinanced] = useState(0.75);
  const [revenue, setRevenue] = useState(180_000);
  const input = { cost: 240_000, financedShare: financed, annualRate: 0.09, termMonths: 60, annualRevenue: revenue, annualOperatingCost: 95_000, rampMonths: 6, growth: 0.03, holdYears: 8 };
  const r = useMemo(() => expansionModel(input), [financed, revenue]); // eslint-disable-line react-hooks/exhaustive-deps
  const { ref, t } = useInViewProgress<HTMLDivElement>(5000, { restartKey: `${financed}-${revenue}` });
  const W = 760, H = 340, L = 64, R = 20, T = 24, B = 40;
  const maxV = Math.max(...r.years.map((y) => y.revenue));
  const minC = Math.min(0, ...r.years.map((y) => y.cumulativeNetCashFlow));
  const maxC = Math.max(...r.years.map((y) => y.cumulativeNetCashFlow), 1);
  const bw = (W - L - R) / r.years.length;
  const yv = (v: number) => T + (1 - v / maxV) * (H - T - B);
  const yc = (v: number) => T + (1 - (v - minC) / (maxC - minC)) * (H - T - B);
  const shown = easeOut(t) * r.years.length;
  return (
    <div ref={ref} className="stack" style={{ gap: 12 }}>
      <div className="ds-two">
        <SliderField label="Share of machine financed" value={financed} onChange={setFinanced} min={0} max={1} step={0.05} format={(v) => pct(v, 0)} />
        <SliderField label="Incremental annual revenue (year 1, full capacity)" value={revenue} onChange={setRevenue} min={100_000} max={260_000} step={5_000} format={(v) => fmt(v, { compact: true })} />
      </div>
      <div className="ds-kpi-row">
        <div className="stat"><span className="label">Loan / equity</span><span className="value">{fmt(r.loanAmount, { compact: true })} / {fmt(r.equityIn, { compact: true })}</span><span className="sub">{fmt(240_000, { compact: true })} machine · 9% · 5-year amortizing</span></div>
        <div className="stat"><span className="label">Monthly debt service</span><span className="value">{fmt(r.periodicPayment)}</span><span className="sub">{fmt(r.periodicPayment * 12, { compact: true })} per year</span></div>
        <div className="stat"><span className="label">Minimum DSCR (operating CF ÷ debt service)</span><span className="value" style={{ color: r.minDscr < 1 ? RED : r.minDscr < 1.25 ? AMBER : GREEN }}>{isFinite(r.minDscr) ? `${r.minDscr.toFixed(2)}×` : 'n/a'}</span><span className="sub">{r.minDscr < 1 ? 'Machine does not cover its own debt in at least one year' : 'Covers debt service in every year'}</span></div>
        <div className="stat"><span className="label">Equity payback</span><span className="value">{r.paybackYear ? `Year ${r.paybackYear}` : 'Not within 8 years'}</span><span className="sub">Cumulative net cash flow turns positive</span></div>
      </div>
      <Frame viewBox={`0 0 ${W} ${H}`} label="Financed machine: revenue, operating cost, debt service and net cash flow by year">
        {r.years.map((y, i) => {
          const on = clamp01(shown - i);
          const x0 = L + i * bw + 6;
          const w = (bw - 12) / 3;
          const bar = (v: number, k: number, c: string) => <rect key={k} x={x0 + k * w} y={yv(Math.max(0, v) * on)} width={w - 1} height={(Math.max(0, v) * on / maxV) * (H - T - B)} fill={c} opacity={0.85} />;
          return (
            <g key={y.year}>
              {bar(y.revenue, 0, GREEN)}
              {bar(y.operatingCost, 1, MUTED)}
              {bar(y.debtService, 2, AMBER)}
              <text x={L + i * bw + bw / 2} y={H - 20} textAnchor="middle" style={{ fontSize: 10, fill: MUTED }}>Y{y.year}</text>
            </g>
          );
        })}
        <polyline fill="none" stroke={GOLD} strokeWidth={2} points={r.years.filter((_, i) => i < shown).map((y, i) => `${L + i * bw + bw / 2},${yc(y.cumulativeNetCashFlow)}`).join(' ')} />
        <line x1={L} x2={W - R} y1={yc(0)} y2={yc(0)} stroke={GOLD} strokeOpacity={0.4} strokeDasharray="4 4" />
        <text x={W - R} y={yc(0) - 4} textAnchor="end" style={{ fontSize: 10, fill: GOLD }}>cumulative net cash flow = 0 (equity recovered)</text>
        {/* machine icon */}
        <g transform={`translate(${L + 4} ${T})`} opacity={0.9}>
          <rect width={44} height={28} rx={4} fill="rgba(201,169,97,0.12)" stroke={GOLD} />
          <circle cx={14} cy={14} r={6} fill="none" stroke={GOLD} strokeDasharray="3 3" style={{ transformOrigin: '14px 14px', animation: 'spin 3s linear infinite' }} />
          <rect x={26} y={8} width={12} height={12} fill="none" stroke={GOLD} />
        </g>
      </Frame>
      <div className="row between">
        <div className="ds-legend"><span style={{ ['--c' as string]: GREEN }}>Revenue</span><span style={{ ['--c' as string]: MUTED }}>Operating cost</span><span style={{ ['--c' as string]: AMBER }}>Debt service</span><span style={{ ['--c' as string]: GOLD }}>Cumulative net cash flow (right scale)</span></div>
        <span className="ds-note">Operating cost {fmt(95_000, { compact: true })} in year 1 · 6-month ramp · 3% growth. Pure arithmetic; see math.ts and its tests.</span>
      </div>
    </div>
  );
}

/* ── L07: refinance timeline ──────────────────────────────────────── */
export function RefinanceTimeline() {
  const fmt = useMoney();
  const { ref, t } = useInViewProgress<HTMLDivElement>(5200);
  const price = 1_000_000, loan0 = 700_000, rate0 = 0.065, growth = 0.045, refiYear = 5, refiLtv = 0.7, refiRate = 0.07, costs = 0.02;
  const value5 = price * Math.pow(1 + growth, refiYear);
  const bal5 = balanceAfter(loan0, rate0 / 12, 360, refiYear * 12);
  const newLoan = value5 * refiLtv;
  const closing = newLoan * costs;
  const proceeds = newLoan - bal5 - closing;
  const pay0 = buildLoan({ principal: loan0, annualRate: rate0, termMonths: 360, structure: 'amortizing' }).periodicPayment;
  const pay1 = buildLoan({ principal: newLoan, annualRate: refiRate, termMonths: 360, structure: 'amortizing' }).periodicPayment;
  const W = 760, H = 360;
  const s1 = seg(t, 0, 0.3), s2 = seg(t, 0.3, 0.6), s3 = seg(t, 0.6, 1);
  const col = (x: number, label: string, items: { v: number; c: string; l: string }[], p: number) => {
    const total = Math.max(price, value5);
    const scale = 220 / total;
    let y = 290;
    return (
      <g opacity={p > 0 ? 1 : 0.15}>
        <text x={x + 60} y={318} textAnchor="middle" style={{ fontSize: 11, fill: MUTED }}>{label}</text>
        {items.map((it, i) => { const h = it.v * scale * p; y -= h; return <g key={i}><rect x={x} y={y} width={120} height={h} fill={it.c} opacity={0.85} stroke="rgba(0,0,0,0.3)" /><text x={x + 60} y={y + h / 2 + 4} textAnchor="middle" className="label-mono" style={{ fontSize: 10, fill: '#120f08' }}>{h > 14 ? `${it.l} ${fmt(it.v, { compact: true })}` : ''}</text></g>; })}
      </g>
    );
  };
  return (
    <div ref={ref} className="stack" style={{ gap: 10 }}>
      <Frame viewBox={`0 0 ${W} ${H}`} label="Cash-out refinance: value growth, equity released and the new larger obligation">
        {col(50, 'Year 0 · purchase', [{ v: loan0, c: AMBER, l: 'Loan' }, { v: price - loan0, c: GOLD, l: 'Equity' }], s1)}
        {col(260, `Year ${refiYear} · before refinance`, [{ v: bal5, c: AMBER, l: 'Balance' }, { v: value5 - bal5, c: GOLD, l: 'Equity' }], s2)}
        {col(470, `Year ${refiYear} · after refinance`, [{ v: newLoan, c: AMBER, l: 'New loan' }, { v: value5 - newLoan, c: GOLD, l: 'Equity left' }], s3)}
        {s3 > 0 && (
          <g className="fade-in">
            <rect x={620} y={290 - proceeds * (220 / value5)} width={110} height={proceeds * (220 / value5) * s3} fill={GREEN} opacity={0.9} />
            <text x={675} y={318} textAnchor="middle" style={{ fontSize: 11, fill: MUTED }}>Cash released</text>
            <text x={675} y={290 - proceeds * (220 / value5) - 8} textAnchor="middle" className="label-mono" style={{ fontSize: 12, fill: GREEN }}>{fmt(proceeds, { compact: true })}</text>
            <path d={`M590 ${290 - newLoan * (220 / value5) + 20} C 610 ${290 - newLoan * (220 / value5) + 20}, 600 220, 620 220`} fill="none" stroke={GREEN} className="flow-line" />
          </g>
        )}
        <text x={W / 2} y={22} textAnchor="middle" className="display" style={{ fontSize: 18, fill: 'var(--ivory)' }}>Equity released is new debt, not income</text>
        <text x={W / 2} y={40} textAnchor="middle" style={{ fontSize: 11, fill: MUTED }}>Value {fmt(price, { compact: true })} → {fmt(value5, { compact: true })} at {pct(growth)}/yr · {pct(refiLtv, 0)} LTV refinance at {pct(refiRate)} · {pct(costs, 0)} closing costs</text>
      </Frame>
      <div className="ds-kpi-row">
        <div className="stat"><span className="label">Balance before refinance</span><span className="value">{fmt(bal5, { compact: true })}</span><span className="sub">after {refiYear} years of amortization</span></div>
        <div className="stat"><span className="label">New loan</span><span className="value">{fmt(newLoan, { compact: true })}</span><span className="sub">{pct(refiLtv, 0)} of {fmt(value5, { compact: true })}</span></div>
        <div className="stat"><span className="label">Net proceeds</span><span className="value" style={{ color: GREEN }}>{fmt(proceeds, { compact: true })}</span><span className="sub">new loan − payoff − {fmt(closing, { compact: true })} costs</span></div>
        <div className="stat"><span className="label">Monthly payment</span><span className="value">{fmt(pay0)} → <span style={{ color: AMBER }}>{fmt(pay1)}</span></span><span className="sub">a larger obligation for another 30 years</span></div>
      </div>
    </div>
  );
}

/* ── L08: related-party loan between family companies ─────────────── */
export function FamilyLoanFlow() {
  const fmt = useMoney();
  const [step, setStep] = useState(0);
  const amount = 400_000, rate = 0.052;
  const loan = buildLoan({ principal: amount, annualRate: rate, termMonths: 120, structure: 'amortizing' });
  const yr = annualize(loan.schedule, 12)[0];
  const STEPS = [
    { title: 'Before the loan', body: 'Family Holding Co holds cash. Property Co owns a building with a mortgage and needs capital for a renovation. They are separate legal persons with separate balance sheets.' },
    { title: 'Documented loan is advanced', body: `A promissory note for ${fmt(amount)} at ${pct(rate)} (at or above the published applicable federal rate in the US), 10-year amortization, security agreement over the renovation contract and a second lien. Lender: Note receivable Dr / Cash Cr. Borrower: Cash Dr / Note payable Cr.` },
    { title: 'Year one: interest and principal are actually paid', body: `Property Co pays ${fmt(yr.payment)} in year one: ${fmt(yr.interest)} of interest (income to Holding, expense to Property Co, subject to deductibility rules) and ${fmt(yr.principal)} of principal. Both ledgers record it. Nothing is netted informally.` },
    { title: 'Both balance sheets stay distinct', body: 'The receivable on one side mirrors the payable on the other. In consolidated family reporting they eliminate; legally, each entity remains separately liable and separately protected. Skipping payments, no note or an unrealistic rate is what collapses the distinction.' },
  ];
  const hCash = step === 0 ? 650 : step === 1 ? 250 : 250 + yr.payment / 1000;
  const hNote = step === 0 ? 0 : step === 1 ? 400 : 400 - yr.principal / 1000;
  const pCash = step === 0 ? 60 : step === 1 ? 460 : 460 - yr.payment / 1000 + 120;
  const pNote = step === 0 ? 0 : step === 1 ? 400 : 400 - yr.principal / 1000;
  const W = 760, H = 340;
  const Sheet = ({ x, name, lines, tone }: { x: number; name: string; lines: [string, number, string?][]; tone: string }) => (
    <g transform={`translate(${x} 60)`}>
      <rect width={250} height={220} rx={12} fill="rgba(17,20,27,0.9)" stroke={tone} />
      <text x={125} y={26} textAnchor="middle" className="display" style={{ fontSize: 17, fill: 'var(--ivory)' }}>{name}</text>
      <line x1={14} x2={236} y1={38} y2={38} stroke={LINE} />
      {lines.map(([l, v, c], i) => (
        <g key={l} transform={`translate(0 ${58 + i * 26})`} opacity={v === 0 ? 0.35 : 1} style={{ transition: 'opacity 0.5s' }}>
          <text x={16} y={0} style={{ fontSize: 11, fill: c ?? IVORY }}>{l}</text>
          <text x={234} y={0} textAnchor="end" className="label-mono" style={{ fontSize: 11, fill: c ?? IVORY }}>{fmt(v * 1000, { compact: true })}</text>
        </g>
      ))}
    </g>
  );
  return (
    <div className="stack" style={{ gap: 12 }}>
      <Frame viewBox={`0 0 ${W} ${H}`} label="Related-party loan between a family holding company and a property company" maxH={360}>
        <Sheet x={30} name="Family Holding Co" tone={GOLD} lines={[['Cash', hCash], ['Note receivable — Property Co', hNote, BLUE], ['Investments', 1_200], ['Equity (no external debt)', hCash + hNote + 1_200, GOLD2]]} />
        <Sheet x={480} name="Property Co" tone={IVORY} lines={[['Cash', pCash], ['Building', 1_000], ['Bank mortgage (1st lien)', 620, AMBER], ['Note payable — Holding Co', pNote, BLUE], ['Equity', pCash + 1_000 - 620 - pNote, GOLD2]]} />
        {step === 1 && (
          <g>
            <path id="fl-path" d="M280 150 C 360 110, 420 110, 480 150" fill="none" stroke={BLUE} strokeWidth={1.6} className="flow-line" />
            <text x={380} y={112} textAnchor="middle" className="label-mono" style={{ fontSize: 11, fill: '#9db7d6' }}>{fmt(amount, { compact: true })} loan principal →</text>
            <text x={380} y={300} textAnchor="middle" style={{ fontSize: 11, fill: MUTED }}>Promissory note · security agreement · repayment schedule · board minutes</text>
          </g>
        )}
        {step === 2 && (
          <g>
            <path d="M480 200 C 420 240, 360 240, 280 200" fill="none" stroke={GREEN} strokeWidth={1.6} className="flow-line" />
            <text x={380} y={252} textAnchor="middle" className="label-mono" style={{ fontSize: 11, fill: GREEN }}>← {fmt(yr.payment, { compact: true })}/yr: interest {fmt(yr.interest, { compact: true })} + principal {fmt(yr.principal, { compact: true })}</text>
          </g>
        )}
        {step === 3 && (
          <g>
            <rect x={300} y={130} width={160} height={60} rx={10} fill="rgba(91,127,166,0.1)" stroke={BLUE} strokeDasharray="4 3" />
            <text x={380} y={154} textAnchor="middle" style={{ fontSize: 11, fill: '#9db7d6' }}>Consolidated view:</text>
            <text x={380} y={172} textAnchor="middle" style={{ fontSize: 11, fill: '#9db7d6' }}>receivable and payable eliminate</text>
          </g>
        )}
      </Frame>
      <div className="row" style={{ gap: 6 }}>{STEPS.map((s, i) => <button key={s.title} className={`btn sm ${step === i ? 'active' : 'ghost'}`} onClick={() => setStep(i)}>{i + 1}. {s.title}</button>)}</div>
      <p className="small" style={{ margin: 0 }}>{STEPS[step].body}</p>
    </div>
  );
}

/* ── L09: contagion across a family structure ─────────────────────── */
export function ContagionMap() {
  const [separated, setSeparated] = useState(false);
  const { ref, t } = useInViewProgress<HTMLDivElement>(4800, { loop: true, restartKey: separated });
  const nodes = [
    { id: 'hold', x: 380, y: 60, label: 'Family Holding Co' },
    { id: 'op', x: 160, y: 200, label: 'Operating Co (aggressive debt)' },
    { id: 'prop', x: 380, y: 220, label: 'Property Co' },
    { id: 'inv', x: 600, y: 200, label: 'Investment Co' },
    { id: 'fam', x: 380, y: 330, label: 'Family members' },
  ];
  const pos = Object.fromEntries(nodes.map((n) => [n.id, n]));
  // infection timing (fraction of loop) when not separated
  const infect: Record<string, number> = separated ? { op: 0.2 } : { op: 0.2, hold: 0.45, prop: 0.65, inv: 0.8, fam: 0.9 };
  const links: { a: string; b: string; label: string; weak: boolean }[] = [
    { a: 'hold', b: 'op', label: separated ? 'equity only · no guarantee' : 'parent guarantee', weak: !separated },
    { a: 'op', b: 'prop', label: separated ? 'arm’s-length lease' : 'cross-collateralized', weak: !separated },
    { a: 'hold', b: 'inv', label: separated ? 'separate lender, no cross-default' : 'cross-default clause', weak: !separated },
    { a: 'hold', b: 'prop', label: 'ownership', weak: false },
    { a: 'fam', b: 'op', label: separated ? 'no personal guarantee' : 'personal guarantees', weak: !separated },
  ];
  const state = (id: string) => (infect[id] !== undefined && t > infect[id] ? 1 : 0);
  return (
    <div ref={ref} className="stack" style={{ gap: 10 }}>
      <div className="row between">
        <div className="row" style={{ gap: 6 }}>
          <button className={`btn sm ${!separated ? 'active' : 'ghost'}`} onClick={() => setSeparated(false)}>Poor separation</button>
          <button className={`btn sm ${separated ? 'active' : 'ghost'}`} onClick={() => setSeparated(true)}>Disciplined separation</button>
        </div>
        <Chip tone={separated ? 'green' : 'red'}>{separated ? 'Default contained in Operating Co' : 'Default spreads through guarantees and cross-collateral'}</Chip>
      </div>
      <Frame viewBox="0 0 760 380" label="How an aggressive loan at one company reaches the rest of a family structure" maxH={400}>
        {links.map((l) => {
          const A = pos[l.a], B = pos[l.b];
          const hot = !separated && state(l.a) && state(l.b);
          return (
            <g key={l.a + l.b}>
              <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={hot ? RED : l.weak ? AMBER : 'rgba(243,236,220,0.3)'} strokeWidth={hot ? 2.2 : 1.2} className={hot ? 'flow-line' : undefined} />
              <text x={(A.x + B.x) / 2} y={(A.y + B.y) / 2 - 6} textAnchor="middle" style={{ fontSize: 10, fill: hot ? '#e7a398' : l.weak ? AMBER : MUTED }}>{l.label}</text>
            </g>
          );
        })}
        {nodes.map((n) => {
          const s = state(n.id);
          return (
            <g key={n.id} transform={`translate(${n.x} ${n.y})`}>
              {s === 1 && <circle r={34} fill={RED} opacity={0.18} className="ds-pulse" />}
              <circle r={24} fill="rgba(17,20,27,0.95)" stroke={s ? RED : n.id === 'op' ? AMBER : GOLD} strokeWidth={1.6} style={{ transition: 'stroke 0.4s' }} />
              <text y={4} textAnchor="middle" className="label-mono" style={{ fontSize: 10, fill: s ? '#e7a398' : IVORY }}>{s ? 'DEFAULT' : 'OK'}</text>
              <text y={42} textAnchor="middle" style={{ fontSize: 11 }}>{n.label}</text>
            </g>
          );
        })}
        <text x={380} y={370} textAnchor="middle" style={{ fontSize: 11, fill: MUTED }}>{separated ? 'Lenders to Operating Co can reach only Operating Co’s assets. Equity value is lost; the rest of the structure is intact.' : 'Operating Co misses a covenant → lender calls the parent guarantee → cross-default accelerates Investment Co’s facility → Property Co collateral is seized → personal guarantees reach the family.'}</text>
      </Frame>
    </div>
  );
}
