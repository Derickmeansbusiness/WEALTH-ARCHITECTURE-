/**
 * Self-contained slide visuals for the Debt deck. Designed on a 1920×1080 canvas (PresentDeck's design space).
 * Each visual receives { step, active } and reveals progressively. No dependency on the shared present/visuals.
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { buildLoan, annualize, balanceAfter } from '@/lib/finance';
import { money, pct } from '@/lib/format';
import { equitySensitivity, expansionModel } from '@/content/debt/math';

const G = 'var(--gold)', G2 = 'var(--gold-2)', A = 'var(--amber)', GR = 'var(--green-2)', R = 'var(--red)', B = 'var(--blue)', V = 'var(--violet)', IV = 'var(--ivory)', IV2 = 'var(--ivory-2)', IV3 = 'var(--ivory-3)', LINE = 'rgba(243,236,220,0.14)', NODE = 'rgba(17,20,27,0.92)';
const $ = (v: number, compact = true) => money(v, { compact });
type VP = { step: number; active: boolean };

/* ── primitives ──────────────────────────────────────────────────── */
export function Stage({ children, label }: { children: ReactNode; label: string }) {
  return <div className="ds-slide"><svg viewBox="0 0 1920 1080" role="img" aria-label={label} preserveAspectRatio="xMidYMid meet">{children}</svg></div>;
}
/** show children when step >= at */
export function S({ at, step, children, dy = 14 }: { at: number; step: number; children: ReactNode; dy?: number }) {
  const on = step >= at;
  return <g className={`ds-step ${on ? 'on' : 'off'}`} style={{ transform: on ? 'none' : `translateY(${dy}px)` }}>{children}</g>;
}
export function Box({ x, y, w, h, title, sub, stroke = G, fill = NODE, children, titleSize = 34 }: { x: number; y: number; w: number; h: number; title: string; sub?: string; stroke?: string; fill?: string; children?: ReactNode; titleSize?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={22} fill={fill} stroke={stroke} strokeWidth={2.5} />
      <text x={x + w / 2} y={y + 52} textAnchor="middle" className="display" style={{ fontSize: titleSize, fill: IV }}>{title}</text>
      {sub && <text x={x + w / 2} y={y + 84} textAnchor="middle" style={{ fontSize: 22, fill: IV3 }}>{sub}</text>}
      {children}
    </g>
  );
}
export function Flow({ d, color = G, label, lx, ly, width = 4 }: { d: string; color?: string; label?: string; lx?: number; ly?: number; width?: number }) {
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={width} className="flow-line" style={{ strokeDasharray: '14 16' }} />
      {label && <text x={lx} y={ly} textAnchor="middle" className="mono" style={{ fontSize: 24, fill: color }}>{label}</text>}
    </g>
  );
}
export function Coin({ d, color = G, delay = 0, r = 12 }: { d: string; color?: string; delay?: number; r?: number }) {
  return <circle r={r} fill={color} style={{ offsetPath: `path('${d}')`, animation: `dsTravel 2.6s linear ${delay}s infinite` }} />;
}
export function Caption({ y = 1010, children, color = IV3, size = 26 }: { y?: number; children: ReactNode; color?: string; size?: number }) {
  return <text x={960} y={y} textAnchor="middle" style={{ fontSize: size, fill: color }}>{children}</text>;
}
export function Big({ x, y, children, color = IV, size = 120 }: { x: number; y: number; children: ReactNode; color?: string; size?: number }) {
  return <text x={x} y={y} textAnchor="middle" className="display" style={{ fontSize: size, fill: color }}>{children}</text>;
}
/** mini T-account */
export function Ledger({ x, y, w, title, left, right, stroke = IV3 }: { x: number; y: number; w: number; title: string; left: [string, string, string?][]; right: [string, string, string?][]; stroke?: string }) {
  const h = 90 + Math.max(left.length, right.length) * 40 + 20;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={18} fill={NODE} stroke={stroke} strokeWidth={2} />
      <text x={x + w / 2} y={y + 46} textAnchor="middle" className="display" style={{ fontSize: 32, fill: IV }}>{title}</text>
      <line x1={x + 20} x2={x + w - 20} y1={y + 66} y2={y + 66} stroke={LINE} />
      <line x1={x + w / 2} x2={x + w / 2} y1={y + 66} y2={y + h - 14} stroke={LINE} />
      <text x={x + 28} y={y + 94} style={{ fontSize: 18, fill: IV3, letterSpacing: '0.14em' }}>ASSETS</text>
      <text x={x + w / 2 + 28} y={y + 94} style={{ fontSize: 18, fill: IV3, letterSpacing: '0.14em' }}>LIABILITIES & EQUITY</text>
      {left.map(([l, v, c], i) => <g key={l}><text x={x + 28} y={y + 130 + i * 40} style={{ fontSize: 22, fill: c ?? IV2 }}>{l}</text><text x={x + w / 2 - 28} y={y + 130 + i * 40} textAnchor="end" className="mono" style={{ fontSize: 22, fill: c ?? IV2 }}>{v}</text></g>)}
      {right.map(([l, v, c], i) => <g key={l}><text x={x + w / 2 + 28} y={y + 130 + i * 40} style={{ fontSize: 22, fill: c ?? IV2 }}>{l}</text><text x={x + w - 28} y={y + 130 + i * 40} textAnchor="end" className="mono" style={{ fontSize: 22, fill: c ?? IV2 }}>{v}</text></g>)}
    </g>
  );
}
function Building({ x, y, s = 1, color = G }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-90} y={-160} width={180} height={160} rx={6} fill="rgba(201,169,97,0.08)" stroke={color} strokeWidth={2.5} />
      {[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={-74 + c * 42} y={-146 + r * 36} width={26} height={20} fill="rgba(243,236,220,0.14)" />))}
      <rect x={-18} y={-34} width={36} height={34} fill="rgba(201,169,97,0.3)" />
    </g>
  );
}
function BankIcon({ x, y, s = 1, color = IV2 }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <polygon points="-110,-120 0,-170 110,-120" fill="none" stroke={color} strokeWidth={3} />
      <rect x={-110} y={-120} width={220} height={16} fill={color} opacity={0.8} />
      {[-80, -40, 0, 40, 80].map((cx) => <rect key={cx} x={cx - 8} y={-104} width={16} height={90} fill="none" stroke={color} strokeWidth={2.5} />)}
      <rect x={-120} y={-14} width={240} height={14} fill={color} opacity={0.8} />
    </g>
  );
}
function useTick(active: boolean, ms = 60) {
  const [n, setN] = useState(0);
  useEffect(() => { if (!active) return; const id = setInterval(() => setN((x) => x + 1), ms); return () => clearInterval(id); }, [active, ms]);
  return n;
}

/* ── reference numbers ───────────────────────────────────────────── */
const PRICE = 1_000_000, LOAN = 700_000, EQ = 300_000, RATE = 0.065;
const REF = buildLoan({ principal: LOAN, annualRate: RATE, termMonths: 360, structure: 'amortizing' });
const REF_Y = annualize(REF.schedule, 12);

/* ── slide visuals ───────────────────────────────────────────────── */
export function TitleVisual({ step }: VP) {
  return (
    <Stage label="Title">
      <circle cx={960} cy={520} r={420} fill="rgba(201,169,97,0.07)" />
      <S at={0} step={step}>
        <text x={960} y={300} textAnchor="middle" style={{ fontSize: 28, fill: G, letterSpacing: '0.3em' }}>CHAPTER 04</text>
        <Big x={960} y={440} size={132}>Debt, Credit &amp;</Big>
        <Big x={960} y={580} size={132} color={G2}>Strategic Leverage</Big>
      </S>
      <S at={1} step={step}>
        <text x={960} y={700} textAnchor="middle" style={{ fontSize: 36, fill: IV2 }}>How borrowed capital is created, deployed, repaid — and how it multiplies both wealth and risk.</text>
        <g transform="translate(560 800)">
          <rect width={240} height={40} fill={G} rx={6} /><rect x={260} width={560} height={40} fill={A} rx={6} /><rect y={60} width={800} height={40} fill={IV2} rx={6} />
          <text x={120} y={28} textAnchor="middle" className="mono" style={{ fontSize: 22, fill: '#141108' }}>equity</text>
          <text x={540} y={28} textAnchor="middle" className="mono" style={{ fontSize: 22, fill: '#141108' }}>borrowed capital</text>
          <text x={400} y={88} textAnchor="middle" className="mono" style={{ fontSize: 22, fill: '#141108' }}>asset controlled</text>
        </g>
      </S>
    </Stage>
  );
}

export function QuestionVisual({ step }: VP) {
  const lines = ['HOW CAN YOU CONTROL', 'A $1 MILLION ASSET', 'WITHOUT OWNING', '$1 MILLION IN CASH?'];
  return (
    <Stage label="The question">
      {lines.map((l, i) => <S key={l} at={Math.min(i, 1) === 0 ? 0 : 1} step={step}><Big x={960} y={330 + i * 150} size={124} color={i === 1 || i === 3 ? G2 : IV}>{l}</Big></S>)}
      <S at={2} step={step}><Caption y={980} color={G} size={30}>Answer: you borrow most of it, and a company you own holds the title. The next thirty minutes are about what that costs.</Caption></S>
    </Stage>
  );
}

export function DisclaimerVisual({ step }: VP) {
  return (
    <Stage label="Simplified animations versus actual cash flows">
      <S at={0} step={step}>
        <Box x={160} y={220} w={740} h={620} title="Simplified explanatory animations" sub="what you will see on these slides" stroke={B}>
          {['Coins moving between boxes', 'A bank “creating” a deposit when a loan is approved', 'One lender, one borrower, one building', 'Rounded numbers, no taxes, no fees unless stated'].map((t, i) => <text key={t} x={200} y={160 + 220 + i * 70} style={{ fontSize: 28, fill: IV2 }}>• {t}</text>)}
        </Box>
        <Box x={1020} y={220} w={740} h={620} title="Actual economic cash flows" sub="what happens in the real transaction" stroke={G}>
          {['Wire transfers between accounts at settlement', 'Bank credit creation is a balance-sheet entry governed by capital and liquidity rules', 'Several parties: title company, servicer, appraiser, insurer, tax authority', 'Fees, taxes, reserves and escrow change every number'].map((t, i) => <text key={t} x={1060} y={160 + 220 + i * 70} style={{ fontSize: 28, fill: IV2 }}>• {t}</text>)}
        </Box>
      </S>
      <Caption y={960} size={30}>Where an animation simplifies, the slide says so. The arithmetic is exact (shared finance library); the choreography is a teaching device.</Caption>
    </Stage>
  );
}

export function DepositVisual({ step, active }: VP) {
  const d = 'M 420 560 C 640 460, 900 460, 1120 560';
  return (
    <Stage label="Money enters a financial institution">
      <S at={0} step={step}>
        <Box x={160} y={430} w={400} h={260} title="Saver" sub="household · company · fund">
          <text x={360} y={640} textAnchor="middle" className="mono" style={{ fontSize: 40, fill: G2 }}>{$(100_000)}</text>
        </Box>
        <g transform="translate(1340 560)"><BankIcon x={0} y={60} s={1.2} /><text x={0} y={120} textAnchor="middle" className="display" style={{ fontSize: 36, fill: IV }}>Bank</text></g>
      </S>
      <S at={1} step={step}>
        <Flow d={d} color={GR} label="deposit" lx={770} ly={470} />
        {active && [0, 0.6, 1.2, 1.8].map((dl) => <Coin key={dl} d={d} color={GR} delay={dl} />)}
      </S>
      <S at={2} step={step}>
        <Ledger x={1180} y={720} w={620} title="Bank balance sheet" left={[['Reserves / cash', $(100_000), GR]]} right={[['Deposit owed to saver', $(100_000), A]]} />
        <Caption y={1000}>A deposit is money the bank owes back. On the bank’s balance sheet it is a liability; the cash it received is an asset.</Caption>
      </S>
    </Stage>
  );
}

export function BankSheetVisual({ step }: VP) {
  return (
    <Stage label="The bank's balance sheet">
      <S at={0} step={step}>
        <Ledger x={360} y={200} w={1200} title="Bank — simplified" left={[['Reserves at the central bank', $(12_000_000), GR], ['Loans to customers', $(80_000_000), G], ['Securities', $(18_000_000), IV2]]} right={[['Customer deposits', $(95_000_000), A], ['Wholesale funding', $(5_000_000), A], ['Shareholders’ equity', $(10_000_000), G2]]} />
      </S>
      <S at={1} step={step}>
        <Caption y={760} size={30} color={IV2}>Loans are the bank’s assets; deposits are its liabilities. Regulation limits how much it can lend against its equity (capital rules) and how much cash it must hold (liquidity rules).</Caption>
        <Caption y={810} size={26}>Simplified: real banks hold many more line items and are supervised on risk-weighted ratios.</Caption>
      </S>
    </Stage>
  );
}

export function LoanApprovalVisual({ step }: VP) {
  return (
    <Stage label="Loan approval from the borrower's perspective">
      <S at={0} step={step}>
        <Box x={160} y={160} w={560} h={300} title="Property Co" sub="applies for a mortgage">
          <text x={440} y={400} textAnchor="middle" style={{ fontSize: 26, fill: IV3 }}>appraisal · rent roll · financials · guarantee</text>
        </Box>
        <g><BankIcon x={1500} y={400} s={1.1} /><text x={1500} y={450} textAnchor="middle" className="display" style={{ fontSize: 34, fill: IV }}>Lender</text></g>
      </S>
      <S at={1} step={step}>
        <rect x={820} y={250} width={280} height={110} rx={16} fill="rgba(62,160,118,0.12)" stroke={GR} strokeWidth={2.5} />
        <text x={960} y={300} textAnchor="middle" className="display" style={{ fontSize: 36, fill: GR }}>APPROVED</text>
        <text x={960} y={338} textAnchor="middle" className="mono" style={{ fontSize: 22, fill: GR }}>{$(LOAN)} · 6.5% · 30 yrs</text>
      </S>
      <S at={2} step={step}>
        <Ledger x={120} y={560} w={820} title="Property Co — after approval" left={[['Cash (loan proceeds on deposit)', $(LOAN), GR], ['Equity contributed (cash)', $(EQ), G]]} right={[['Mortgage payable', $(LOAN), A], ['Owner’s equity', $(EQ), G2]]} />
        <Ledger x={980} y={560} w={820} title="Lender — same moment" left={[['Loan receivable (Property Co)', $(LOAN), G]]} right={[['Deposit owed to Property Co', $(LOAN), A]]} />
        <Caption y={1010}>Simplified explanatory animation: the loan appears as a deposit in the borrower’s account and a liability on its books at the same instant. Not a full monetary-system lecture.</Caption>
      </S>
    </Stage>
  );
}

export function DisbursementVisual({ step, active }: VP) {
  const d = 'M 560 560 C 800 420, 1120 420, 1360 560';
  return (
    <Stage label="Loan disbursement to the seller">
      <S at={0} step={step}>
        <Box x={160} y={430} w={420} h={260} title="Property Co" sub="buyer">
          <text x={370} y={640} textAnchor="middle" className="mono" style={{ fontSize: 32, fill: G2 }}>{$(EQ)} equity</text>
        </Box>
        <Box x={1340} y={430} w={420} h={260} title="Seller" sub="receives the price" stroke={IV3} />
        <g transform="translate(960 780)"><BankIcon x={0} y={0} s={0.8} /><text x={0} y={46} textAnchor="middle" style={{ fontSize: 24, fill: IV3 }}>lender funds at settlement</text></g>
      </S>
      <S at={1} step={step}>
        <Flow d={d} color={G} label={`${$(PRICE)} purchase price = ${$(EQ)} equity + ${$(LOAN)} loan`} lx={960} ly={400} />
        {active && [0, 0.5, 1, 1.5, 2].map((dl) => <Coin key={dl} d={d} color={dl % 1 === 0 ? G : A} delay={dl} />)}
        <Flow d="M 960 700 C 960 660, 960 640, 1100 560" color={A} width={3} />
        <Caption y={1000}>At closing the lender wires its {$(LOAN)} and the buyer its {$(EQ)}; the seller receives {$(PRICE)}. In practice a settlement agent handles the wires and records the deed and mortgage.</Caption>
      </S>
    </Stage>
  );
}

export function AcquisitionVisual({ step }: VP) {
  return (
    <Stage label="Asset acquisition: title and lien">
      <S at={0} step={step}>
        <Building x={960} y={620} s={1.6} />
        <text x={960} y={700} textAnchor="middle" className="mono" style={{ fontSize: 34, fill: G2 }}>{$(PRICE)}</text>
      </S>
      <S at={1} step={step}>
        <Box x={160} y={300} w={460} h={220} title="Property Co" sub="holds legal title">
          <text x={390} y={470} textAnchor="middle" style={{ fontSize: 24, fill: G2 }}>owns 100% of the building</text>
        </Box>
        <line x1={620} y1={410} x2={810} y2={500} stroke={G} strokeWidth={3} />
        <text x={700} y={440} textAnchor="middle" style={{ fontSize: 24, fill: G2 }}>title</text>
      </S>
      <S at={2} step={step}>
        <Box x={1300} y={300} w={460} h={220} title="Lender" sub="holds a first lien" stroke={A}>
          <text x={1530} y={470} textAnchor="middle" style={{ fontSize: 24, fill: A }}>recorded mortgage · {$(LOAN)}</text>
        </Box>
        <line x1={1300} y1={410} x2={1110} y2={500} stroke={A} strokeWidth={3} strokeDasharray="12 10" />
        <text x={1220} y={440} textAnchor="middle" style={{ fontSize: 24, fill: A }}>lien</text>
        <Caption y={960}>Ownership and security are different rights. The owner controls the asset; the lender can take it only on default, and only through a legal process.</Caption>
      </S>
    </Stage>
  );
}

export function SplitVisual({ step }: VP) {
  const bars = [['Equity capital', EQ, G], ['Borrowed capital', LOAN, A], ['Total asset value', PRICE, IV2]] as const;
  return (
    <Stage label="Financing split">
      {bars.map(([l, v, c], i) => (
        <S key={l} at={i} step={step}>
          <text x={240} y={300 + i * 200} style={{ fontSize: 28, fill: IV3, letterSpacing: '0.18em' }}>{l.toUpperCase()}</text>
          <rect x={240} y={320 + i * 200} width={1440 * (v / PRICE)} height={90} rx={14} fill={c} />
          <text x={260} y={380 + i * 200} className="mono" style={{ fontSize: 44, fill: '#141108', fontWeight: 600 }}>{$(v)}</text>
          <text x={1700} y={380 + i * 200} textAnchor="end" className="mono" style={{ fontSize: 34, fill: c }}>{pct(v / PRICE, 0)}</text>
        </S>
      ))}
      <S at={2} step={step}><Caption y={980} size={32} color={G2}>Asset = Loan + Equity · Leverage factor = {$(PRICE)} ÷ {$(EQ)} = 3.33×</Caption></S>
    </Stage>
  );
}

export function NoteVisual({ step }: VP) {
  const terms = [['Principal', $(LOAN)], ['Rate', '6.50% fixed'], ['Term / amortization', '360 months'], ['Monthly payment', money(REF.periodicPayment, {})], ['Total interest over life', $(REF.totalInterest)], ['Security', 'First lien · assignment of rents'], ['Recourse', 'Nonrecourse with carve-outs'], ['Covenants', 'DSCR ≥ 1.25× · reporting']];
  return (
    <Stage label="The repayment obligation">
      <S at={0} step={step}>
        <rect x={420} y={120} width={1080} height={840} rx={10} fill="rgba(243,236,220,0.04)" stroke={LINE} />
        <text x={960} y={200} textAnchor="middle" className="display" style={{ fontSize: 48, fill: IV }}>PROMISSORY NOTE</text>
        <text x={960} y={240} textAnchor="middle" style={{ fontSize: 22, fill: IV3, letterSpacing: '0.2em' }}>PROPERTY CO · LENDER · DATED AT CLOSING</text>
      </S>
      {terms.map(([k, v], i) => (
        <S key={k} at={i < 3 ? 1 : 2} step={step}>
          <text x={480} y={320 + i * 70} style={{ fontSize: 28, fill: IV3 }}>{k}</text>
          <text x={1440} y={320 + i * 70} textAnchor="end" className="mono" style={{ fontSize: 30, fill: i === 3 ? G2 : IV }}>{v}</text>
          <line x1={480} x2={1440} y1={336 + i * 70} y2={336 + i * 70} stroke={LINE} />
        </S>
      ))}
      <S at={2} step={step}><Caption y={1020} color={A}>Three promises: return the money, pay for the time, accept the consequences. Everything else on the page protects the lender’s expectation of the first two.</Caption></S>
    </Stage>
  );
}

export function FirstPaymentVisual({ step }: VP) {
  const m = REF.schedule[0];
  const wI = 1400 * (m.interest / m.payment), wP = 1400 - wI;
  return (
    <Stage label="The first payment">
      <S at={0} step={step}>
        <Big x={960} y={300} size={150} color={G2}>{money(m.payment, {})}</Big>
        <Caption y={360} size={30}>month 1 of 360</Caption>
      </S>
      <S at={1} step={step}>
        <rect x={260} y={520} width={wI} height={120} fill={A} rx={12} />
        <rect x={260 + wI} y={520} width={wP} height={120} fill={G} rx={12} />
        <text x={260 + wI / 2} y={592} textAnchor="middle" className="mono" style={{ fontSize: 40, fill: '#141108', fontWeight: 600 }}>interest {money(m.interest, {})}</text>
        <text x={260 + wI + wP / 2} y={592} textAnchor="middle" className="mono" style={{ fontSize: 28, fill: '#141108', fontWeight: 600 }}>principal</text>
        <text x={260 + wI + wP / 2} y={700} textAnchor="middle" className="mono" style={{ fontSize: 30, fill: G2 }}>{money(m.principal, {})}</text>
        <Caption y={840} size={30} color={IV2}>Interest = balance × 6.5% ÷ 12 = {$(LOAN)} × 0.5417% = {money(m.interest, {})}. The rest of the level payment repays principal.</Caption>
        <Caption y={900}>Balance after month 1: {money(m.balance, {})}. The lender has been paid for one month of {$(LOAN)}; the owner has bought {money(m.principal, {})} of the building back.</Caption>
      </S>
    </Stage>
  );
}

export function AmortizationVisual({ step, active }: VP) {
  const tick = useTick(active && step >= 1, 50);
  const shown = step >= 2 ? 30 : Math.min(30, Math.floor(tick / 2));
  const maxP = Math.max(...REF_Y.map((y) => y.payment));
  const bw = 1500 / 30;
  return (
    <Stage label="Amortization over thirty years">
      <S at={0} step={step}>
        <text x={210} y={160} style={{ fontSize: 28, fill: IV3, letterSpacing: '0.18em' }}>ANNUAL PAYMENTS · INTEREST (AMBER) VS PRINCIPAL (GOLD)</text>
      </S>
      {REF_Y.map((y, i) => {
        const on = i < shown;
        const hI = (y.interest / maxP) * 560, hP = (y.principal / maxP) * 560;
        return (
          <g key={y.year} opacity={on ? 1 : 0.08} style={{ transition: 'opacity 0.3s' }}>
            <rect x={210 + i * bw + 4} y={800 - hI} width={bw - 8} height={hI} fill={A} />
            <rect x={210 + i * bw + 4} y={800 - hI - hP} width={bw - 8} height={hP} fill={G} />
            {(i + 1) % 5 === 0 && <text x={210 + i * bw + bw / 2} y={840} textAnchor="middle" style={{ fontSize: 22, fill: IV3 }}>Y{i + 1}</text>}
          </g>
        );
      })}
      <S at={1} step={step}>
        <polyline fill="none" stroke={IV2} strokeWidth={3} strokeDasharray="6 8" points={REF_Y.slice(0, Math.max(1, shown)).map((y, i) => `${210 + i * bw + bw / 2},${240 + (1 - y.balance / LOAN) * 560}`).join(' ')} />
        <text x={1730} y={250} style={{ fontSize: 22, fill: IV2 }}>balance</text>
      </S>
      <S at={2} step={step}>
        <Caption y={940} size={30} color={IV2}>Total paid {$(REF.totalPaid)} = principal {$(LOAN)} + interest {$(REF.totalInterest)}. Principal first exceeds interest in year {REF_Y.findIndex((y) => y.principal > y.interest) + 1}.</Caption>
      </S>
    </Stage>
  );
}

export function CrossoverVisual({ step }: VP) {
  const pts = [1, 5, 10, 15, 20, 25, 30].map((y) => ({ y, b: balanceAfter(LOAN, RATE / 12, 360, y * 12) }));
  return (
    <Stage label="Principal reduction">
      <S at={0} step={step}>
        {pts.map((p, i) => (
          <g key={p.y}>
            <rect x={260 + i * 200} y={760 - (p.b / LOAN) * 500} width={120} height={(p.b / LOAN) * 500} fill={A} rx={8} />
            <rect x={260 + i * 200} y={260} width={120} height={500 - (p.b / LOAN) * 500} fill={G} rx={8} opacity={0.9} />
            <text x={320 + i * 200} y={810} textAnchor="middle" style={{ fontSize: 24, fill: IV3 }}>Year {p.y}</text>
            <text x={320 + i * 200} y={240} textAnchor="middle" className="mono" style={{ fontSize: 22, fill: G2 }}>{$(LOAN - p.b)}</text>
          </g>
        ))}
        <text x={200} y={520} textAnchor="end" style={{ fontSize: 24, fill: A }}>owed</text>
        <text x={200} y={300} textAnchor="end" style={{ fontSize: 24, fill: G2 }}>repaid</text>
        <Caption y={940} size={30}>After ten years, roughly {pct((LOAN - pts[2].b) / LOAN, 0)} of the principal has been repaid. Amortization is slow at first and accelerates — the shape every borrower should know before choosing a balloon.</Caption>
      </S>
    </Stage>
  );
}

export function EquityAccumulationVisual({ step }: VP) {
  const years = [0, 5, 10, 15, 20];
  const g = 0.03;
  return (
    <Stage label="Equity accumulation">
      {years.map((y, i) => {
        const value = PRICE * Math.pow(1 + g, y);
        const bal = y === 0 ? LOAN : balanceAfter(LOAN, RATE / 12, 360, y * 12);
        const eq = value - bal;
        const sc = 500 / (PRICE * Math.pow(1 + g, 20));
        return (
          <S key={y} at={Math.min(2, Math.floor(i / 2))} step={step}>
            <rect x={240 + i * 300} y={780 - bal * sc} width={200} height={bal * sc} fill={A} rx={8} />
            <rect x={240 + i * 300} y={780 - value * sc} width={200} height={eq * sc} fill={G} rx={8} />
            <text x={340 + i * 300} y={760 - value * sc} textAnchor="middle" className="mono" style={{ fontSize: 24, fill: G2 }}>equity {$(eq)}</text>
            <text x={340 + i * 300} y={830} textAnchor="middle" style={{ fontSize: 24, fill: IV3 }}>Year {y}</text>
          </S>
        );
      })}
      <S at={2} step={step}>
        <Caption y={940} size={30} color={IV2}>Two engines: the tenant repays principal (amber shrinks) and the asset appreciates at 3% (total grows). Equity rises from {$(EQ)} to about {$(PRICE * Math.pow(1.03, 20) - balanceAfter(LOAN, RATE / 12, 360, 240))} in twenty years.</Caption>
        <Caption y={990}>Appreciation is an assumption, not a promise. Amortization is contractual.</Caption>
      </S>
    </Stage>
  );
}

export function LeverageBothWaysVisual({ step }: VP) {
  const up = equitySensitivity(PRICE, LOAN, 0.1), down = equitySensitivity(PRICE, LOAN, -0.1);
  const sc = 0.0005;
  const col = (x: number, v: number, c: string, label: string, sub: string) => (
    <g>
      <rect x={x - 80} y={760 - v * sc} width={160} height={v * sc} fill={c} rx={8} />
      <text x={x} y={740 - v * sc} textAnchor="middle" className="mono" style={{ fontSize: 26, fill: c }}>{$(v)}</text>
      <text x={x} y={800} textAnchor="middle" style={{ fontSize: 22, fill: IV2 }}>{label}</text>
      <text x={x} y={830} textAnchor="middle" style={{ fontSize: 20, fill: IV3 }}>{sub}</text>
    </g>
  );
  return (
    <Stage label="Leverage multiplies both ways">
      <line x1={960} y1={160} x2={960} y2={860} stroke={LINE} strokeDasharray="8 8" />
      <S at={0} step={step}>
        <text x={520} y={180} textAnchor="middle" className="display" style={{ fontSize: 48, fill: GR }}>Value +10%</text>
        {col(300, PRICE, IV3, 'asset before', '')}{col(520, up.value1, IV2, 'asset after', '+10%')}{col(740, up.equity1, GR, 'equity after', `+${pct(up.equityChangePct, 0)}`)}
      </S>
      <S at={1} step={step}>
        <text x={1400} y={180} textAnchor="middle" className="display" style={{ fontSize: 48, fill: R }}>Value −10%</text>
        {col(1180, PRICE, IV3, 'asset before', '')}{col(1400, down.value1, IV2, 'asset after', '−10%')}{col(1620, down.equity1, R, 'equity after', `${pct(down.equityChangePct, 0)}`)}
        <line x1={120} y1={760 - LOAN * sc} x2={1800} y2={760 - LOAN * sc} stroke={A} strokeWidth={3} strokeDasharray="14 10" />
        <text x={1800} y={740 - LOAN * sc} textAnchor="end" className="mono" style={{ fontSize: 24, fill: A }}>loan {$(LOAN)} — unchanged</text>
        <Caption y={960} size={34} color={G2}>Equity return = asset return × (asset ÷ equity) = 10% × 3.33 = 33%, in either direction.</Caption>
      </S>
    </Stage>
  );
}

export function SpreadVisual({ step }: VP) {
  const yieldA = 0.054;
  const roe = (debt: number) => yieldA + (yieldA - debt) * (LOAN / EQ);
  return (
    <Stage label="Positive and negative leverage">
      <S at={0} step={step}>
        <text x={960} y={160} textAnchor="middle" className="display" style={{ fontSize: 44, fill: IV }}>Return on equity ≈ asset yield + (asset yield − cost of debt) × debt ÷ equity</text>
        <text x={960} y={210} textAnchor="middle" style={{ fontSize: 26, fill: IV3 }}>asset yield 5.4% (NOI ÷ price) · debt ÷ equity 2.33×</text>
      </S>
      {[[0.045, 'Debt at 4.5%', GR, 'positive leverage'], [0.054, 'Debt at 5.4%', IV3, 'neutral'], [0.065, 'Debt at 6.5%', R, 'negative leverage']].map(([d, l, c, tag], i) => (
        <S key={l as string} at={i === 0 ? 0 : 1} step={step}>
          <text x={240} y={360 + i * 180} style={{ fontSize: 30, fill: IV2 }}>{l as string}</text>
          <text x={240} y={395 + i * 180} style={{ fontSize: 22, fill: c as string }}>{tag as string}</text>
          <rect x={620} y={330 + i * 180} width={Math.max(10, roe(d as number) * 12000)} height={70} fill={c as string} rx={10} />
          <text x={640 + Math.max(10, roe(d as number) * 12000)} y={378 + i * 180} className="mono" style={{ fontSize: 34, fill: c as string }}>ROE from operations ≈ {pct(roe(d as number))}</text>
        </S>
      ))}
      <S at={1} step={step}><Caption y={960} size={30}>Below the asset yield, every borrowed dollar earns a spread for equity. Above it, equity subsidizes the lender and the deal depends on appreciation.</Caption></S>
    </Stage>
  );
}

export function RatiosVisual({ step }: VP) {
  const noi = 84_000 - 30_000;
  const cards = [['LTV', `${$(LOAN)} ÷ ${$(PRICE)}`, pct(LOAN / PRICE, 0), 'lender’s cushion', G], ['DSCR', `${$(noi)} ÷ ${$(REF.annualDebtService)}`, `${(noi / REF.annualDebtService).toFixed(2)}×`, 'can the asset pay its own debt?', A], ['Debt yield', `${$(noi)} ÷ ${$(LOAN)}`, pct(noi / LOAN), 'lender’s return if it owned it', B], ['DTI (individual)', '$5,324 ÷ $14,000', '38%', 'share of income committed', V], ['Debt ÷ EBITDA', '$2.0M ÷ $420K', '4.8×', 'years of earnings to repay', GR], ['Interest coverage', '$180K ÷ $45K', '4.0×', 'earnings vs interest bill', IV2]];
  return (
    <Stage label="The ratios lenders compute">
      {cards.map(([n, f, v, m, c], i) => (
        <S key={n} at={Math.floor(i / 2)} step={step}>
          <g transform={`translate(${160 + (i % 3) * 560} ${180 + Math.floor(i / 3) * 400})`}>
            <rect width={480} height={330} rx={22} fill={NODE} stroke={c} strokeWidth={2.5} />
            <text x={240} y={60} textAnchor="middle" className="display" style={{ fontSize: 40, fill: IV }}>{n}</text>
            <text x={240} y={110} textAnchor="middle" className="mono" style={{ fontSize: 24, fill: IV3 }}>{f}</text>
            <text x={240} y={200} textAnchor="middle" className="mono" style={{ fontSize: 72, fill: c }}>{v}</text>
            <text x={240} y={270} textAnchor="middle" style={{ fontSize: 24, fill: IV2 }}>{m}</text>
          </g>
        </S>
      ))}
      <S at={2} step={step}><Caption y={1030} color={A}>Lenders commonly reference ranges (e.g. DSCR 1.20–1.35×), but policies vary by institution, asset class and market. A 1.02× DSCR means this loan is not bankable on cash flow alone.</Caption></S>
    </Stage>
  );
}

export function CreditFileVisual({ step }: VP) {
  const rows = [['Payment history', 35, G], ['Amounts owed / utilization', 30, G2], ['Length of history', 15, A], ['New credit', 10, B], ['Credit mix', 10, GR]] as const;
  return (
    <Stage label="What the lender reads first">
      <S at={0} step={step}>
        <rect x={160} y={160} width={760} height={760} rx={16} fill="rgba(243,236,220,0.04)" stroke={LINE} />
        <text x={200} y={230} className="display" style={{ fontSize: 40, fill: IV }}>Credit report</text>
        <text x={200} y={270} style={{ fontSize: 22, fill: IV3, letterSpacing: '0.16em' }}>TRADELINES · INQUIRIES · PUBLIC RECORDS</text>
        {[['Mortgage · 84 months · never late', GR], ['Auto loan · paid as agreed · closed', GR], ['Card A · limit $12,000 · balance $1,100 (9%)', GR], ['Card B · limit $6,000 · 30 days late ×1 (2022)', A], ['Student loan · $18,000 · current', GR], ['Hard inquiries · 2 in 12 months', IV3]].map(([t, c], i) => <text key={t} x={200} y={340 + i * 60} style={{ fontSize: 26, fill: c }}>• {t}</text>)}
      </S>
      <S at={1} step={step}>
        <text x={1040} y={230} className="display" style={{ fontSize: 40, fill: IV }}>Score factors (approximate, FICO-published)</text>
        {rows.map(([l, w, c], i) => (
          <g key={l} transform={`translate(1040 ${300 + i * 110})`}>
            <text y={0} style={{ fontSize: 26, fill: IV2 }}>{l}</text>
            <rect y={16} width={700 * (w / 35)} height={40} fill={c} rx={8} />
            <text x={720 * (w / 35) + 10} y={46} className="mono" style={{ fontSize: 28, fill: c }}>≈{w}%</text>
          </g>
        ))}
        <Caption y={960}>Educational shape of the model, not a bureau calculation. UAE: Al Etihad Credit Bureau. CEMAC: BEAC Centrale des Risques (bank exposures).</Caption>
      </S>
    </Stage>
  );
}

export function FiveCsVisual({ step }: VP) {
  const cs = [['Character', 'history of keeping promises', G], ['Capacity', 'cash flow to service the debt', GR], ['Capital', 'the borrower’s own money at risk', G2], ['Collateral', 'the second way out', A], ['Conditions', 'purpose, industry, economy, terms', B]];
  return (
    <Stage label="The five Cs of credit">
      {cs.map(([n, d, c], i) => {
        const ang = -Math.PI / 2 + (i / 5) * Math.PI * 2;
        const x = 960 + 380 * Math.cos(ang), y = 540 + 330 * Math.sin(ang);
        return (
          <S key={n} at={i} step={step}>
            <line x1={960} y1={540} x2={x} y2={y} stroke={LINE} />
            <circle cx={x} cy={y} r={120} fill={NODE} stroke={c} strokeWidth={3} />
            <text x={x} y={y - 6} textAnchor="middle" className="display" style={{ fontSize: 40, fill: IV }}>{n}</text>
            <text x={x} y={y + 30} textAnchor="middle" style={{ fontSize: 20, fill: IV3 }}>{d}</text>
          </S>
        );
      })}
      <circle cx={960} cy={540} r={90} fill="rgba(201,169,97,0.1)" stroke={G} strokeWidth={2} />
      <text x={960} y={532} textAnchor="middle" className="display" style={{ fontSize: 30, fill: G2 }}>Credit</text>
      <text x={960} y={566} textAnchor="middle" className="display" style={{ fontSize: 30, fill: G2 }}>decision</text>
    </Stage>
  );
}

export function MarketplaceVisual({ step }: VP) {
  const groups = [['Personal & property', ['Mortgages', 'DSCR investor loans', 'Revolving cards', 'Overdrafts'], G], ['Business operations', ['Term loans / SBA', 'Lines of credit', 'Trade credit', 'Overdrafts'], GR], ['Asset-backed', ['Equipment finance', 'Invoice finance & factoring', 'Trade finance / LCs', 'ABL · SBLOC · policy loans'], A], ['Growth & transactions', ['Private credit', 'Seller financing', 'Mezzanine', 'Acquisition finance'], B]] as const;
  return (
    <Stage label="The financing marketplace">
      {groups.map(([g, items, c], i) => (
        <S key={g} at={i} step={step}>
          <g transform={`translate(${140 + i * 420} 200)`}>
            <rect width={380} height={620} rx={22} fill={NODE} stroke={c} strokeWidth={2.5} />
            <text x={190} y={70} textAnchor="middle" className="display" style={{ fontSize: 34, fill: IV }}>{g}</text>
            {items.map((it, k) => <text key={it} x={40} y={160 + k * 90} style={{ fontSize: 28, fill: IV2 }}>• {it}</text>)}
          </g>
        </S>
      ))}
      <S at={3} step={step}><Caption y={940} size={30}>Fifteen instruments, one rule: match the term of the money to the life of the asset and the repayment source to the cash-flow shape.</Caption></S>
    </Stage>
  );
}

export function MachineVisual({ step }: VP) {
  const r = useMemo(() => expansionModel({ cost: 240_000, financedShare: 0.75, annualRate: 0.09, termMonths: 60, annualRevenue: 180_000, annualOperatingCost: 95_000, rampMonths: 6, growth: 0.03, holdYears: 8 }), []);
  const weak = useMemo(() => expansionModel({ cost: 240_000, financedShare: 0.75, annualRate: 0.09, termMonths: 60, annualRevenue: 130_000, annualOperatingCost: 95_000, rampMonths: 6, growth: 0.03, holdYears: 8 }), []);
  const max = Math.max(...r.years.map((y) => y.revenue));
  const bw = 1500 / 8;
  return (
    <Stage label="A financed machine">
      <S at={0} step={step}>
        <text x={210} y={150} style={{ fontSize: 28, fill: IV3, letterSpacing: '0.18em' }}>$240,000 MACHINE · 75% FINANCED AT 9% OVER 5 YEARS · DEBT SERVICE {$(r.periodicPayment * 12)}/YR</text>
        {r.years.map((y, i) => (
          <g key={y.year} transform={`translate(${210 + i * bw} 0)`}>
            <rect x={10} y={760 - (y.revenue / max) * 500} width={50} height={(y.revenue / max) * 500} fill={GR} />
            <rect x={66} y={760 - (y.operatingCost / max) * 500} width={50} height={(y.operatingCost / max) * 500} fill={IV3} />
            <rect x={122} y={760 - (y.debtService / max) * 500} width={50} height={(y.debtService / max) * 500} fill={A} />
            <text x={bw / 2} y={800} textAnchor="middle" style={{ fontSize: 24, fill: IV3 }}>Y{y.year}</text>
          </g>
        ))}
        <g transform="translate(210 880)"><rect width={30} height={30} fill={GR} /><text x={40} y={24} style={{ fontSize: 24, fill: IV2 }}>revenue</text><rect x={200} width={30} height={30} fill={IV3} /><text x={240} y={24} style={{ fontSize: 24, fill: IV2 }}>operating cost</text><rect x={480} width={30} height={30} fill={A} /><text x={520} y={24} style={{ fontSize: 24, fill: IV2 }}>debt service</text></g>
      </S>
      <S at={1} step={step}>
        <polyline fill="none" stroke={G} strokeWidth={4} points={r.years.map((y, i) => `${210 + i * bw + bw / 2},${500 - y.cumulativeNetCashFlow / 1400}`).join(' ')} />
        <text x={1740} y={500 - r.years[7].cumulativeNetCashFlow / 1400} className="mono" style={{ fontSize: 24, fill: G }}>cumulative net</text>
        <text x={1200} y={200} className="mono" style={{ fontSize: 30, fill: GR }}>base case: min DSCR {r.minDscr.toFixed(2)}× · equity back in year {r.paybackYear}</text>
      </S>
      <S at={2} step={step}>
        <text x={1200} y={250} className="mono" style={{ fontSize: 30, fill: R }}>revenue −28%: min DSCR {weak.minDscr.toFixed(2)}× · the machine cannot pay its own loan</text>
        <Caption y={1000}>Pure arithmetic (tested expansionModel). Underwrite the incremental cash flow against the incremental debt service, then halve the revenue and ask again.</Caption>
      </S>
    </Stage>
  );
}

export function RELifecycleVisual({ step }: VP) {
  const phases = [['Construction loan', 'draws · interest reserve · completion guarantee', A], ['Bridge loan', 'lease-up or repositioning · 1–3 yrs · premium rate', V], ['Permanent loan', 'stabilized NOI · LTV · DSCR · debt yield', G], ['Refinance', 'rate & term · cash-out · maturity management', GR]] as const;
  return (
    <Stage label="Real estate debt lifecycle">
      <line x1={160} y1={540} x2={1760} y2={540} stroke={LINE} strokeWidth={3} />
      {phases.map(([n, d, c], i) => (
        <S key={n} at={i} step={step}>
          <circle cx={300 + i * 440} cy={540} r={28} fill={c} />
          <Building x={300 + i * 440} y={470} s={0.5 + i * 0.18} color={c} />
          <text x={300 + i * 440} y={640} textAnchor="middle" className="display" style={{ fontSize: 38, fill: IV }}>{n}</text>
          <text x={300 + i * 440} y={680} textAnchor="middle" style={{ fontSize: 22, fill: IV3 }}>{d}</text>
        </S>
      ))}
      <S at={3} step={step}><Caption y={900} size={30}>Each stage has its own lender and its own risk. The construction loan matures when the building is finished — whether or not the take-out loan exists.</Caption></S>
    </Stage>
  );
}

export function RefinanceVisual({ step }: VP) {
  const value5 = PRICE * Math.pow(1.045, 5), bal5 = balanceAfter(LOAN, RATE / 12, 360, 60), newLoan = value5 * 0.7, costs = newLoan * 0.02, proceeds = newLoan - bal5 - costs;
  const pay1 = buildLoan({ principal: newLoan, annualRate: 0.07, termMonths: 360, structure: 'amortizing' }).periodicPayment;
  const sc = 480 / value5;
  const col = (x: number, items: [number, string, string][], label: string) => { let y = 780; return <g>{items.map(([v, c, l]) => { const h = v * sc; y -= h; return <g key={l}><rect x={x} y={y} width={260} height={h} fill={c} rx={6} /><text x={x + 130} y={y + h / 2 + 10} textAnchor="middle" className="mono" style={{ fontSize: 26, fill: '#141108' }}>{l} {$(v)}</text></g>; })}<text x={x + 130} y={830} textAnchor="middle" style={{ fontSize: 24, fill: IV3 }}>{label}</text></g>; };
  return (
    <Stage label="Cash-out refinance">
      <S at={0} step={step}>{col(200, [[LOAN, A, 'loan'], [EQ, G, 'equity']], 'Year 0')}</S>
      <S at={1} step={step}>{col(640, [[bal5, A, 'balance'], [value5 - bal5, G, 'equity']], 'Year 5 · value +4.5%/yr')}</S>
      <S at={2} step={step}>
        {col(1080, [[newLoan, A, 'new loan'], [value5 - newLoan, G, 'equity left']], 'Year 5 · refinanced at 70% LTV')}
        <rect x={1520} y={780 - proceeds * sc} width={200} height={proceeds * sc} fill={GR} rx={6} />
        <text x={1620} y={760 - proceeds * sc} textAnchor="middle" className="mono" style={{ fontSize: 30, fill: GR }}>{$(proceeds)}</text>
        <text x={1620} y={830} textAnchor="middle" style={{ fontSize: 24, fill: IV3 }}>cash released</text>
        <Caption y={960} size={30} color={IV2}>Payment {money(REF.periodicPayment, {})} → {money(pay1, {})}/month for another thirty years. The cash is a loan.</Caption>
      </S>
    </Stage>
  );
}

export function ProceedsVisual({ step }: VP) {
  return (
    <Stage label="Proceeds are debt, not income">
      <S at={0} step={step}>
        <Big x={960} y={420} size={110} color={G2}>Refinance proceeds</Big>
        <Big x={960} y={560} size={110}>are a repayment obligation.</Big>
        <Caption y={700} size={34} color={IV2}>Not profit. Not income. Not a return of capital.</Caption>
        <Caption y={800} size={28}>In the US, borrowing is not a realization event — so no tax is due on receipt. The gain stays in the property and is realized on sale, when the loan is repaid from proceeds. Deferral is not elimination.</Caption>
        <Caption y={860} size={28} color={A}>Interest on the new, larger loan is a real annual cost whose deductibility follows how the proceeds are used.</Caption>
      </S>
    </Stage>
  );
}

export function RecyclingVisual({ step, active }: VP) {
  const nodes = [['Property A', 960, 240, G], ['Refinance', 1460, 540, A], ['Property B', 960, 840, G], ['Rent + amortization', 460, 540, GR]] as const;
  const paths = ['M 960 320 C 1300 320, 1460 380, 1460 460', 'M 1460 620 C 1460 760, 1300 760, 1060 790', 'M 860 790 C 600 760, 460 740, 460 620', 'M 460 460 C 460 320, 640 300, 860 280'];
  return (
    <Stage label="Capital recycling">
      {nodes.map(([n, x, y, c], i) => (
        <S key={n} at={i} step={step}>
          <circle cx={x} cy={y} r={100} fill={NODE} stroke={c} strokeWidth={3} />
          <text x={x} y={y + 10} textAnchor="middle" className="display" style={{ fontSize: 32, fill: IV }}>{n}</text>
        </S>
      ))}
      {paths.map((d, i) => <S key={d} at={i} step={step}><Flow d={d} color={[A, GR, G, G2][i]} />{active && step >= i && <Coin d={d} color={[A, GR, G, G2][i]} delay={i * 0.4} />}</S>)}
      <S at={3} step={step}><Caption y={1010}>Equity released from A funds B; B’s rent and amortization build equity that can be recycled again. Every turn adds debt service that the properties must cover — the loop is only as strong as its weakest DSCR.</Caption></S>
    </Stage>
  );
}

export function FamilyBankVisual({ step }: VP) {
  const loan = buildLoan({ principal: 400_000, annualRate: 0.052, termMonths: 120, structure: 'amortizing' });
  const y1 = annualize(loan.schedule, 12)[0];
  return (
    <Stage label="Related-party lending">
      <S at={0} step={step}>
        <Ledger x={100} y={200} w={780} title="Family Holding Co (lender)" stroke={G} left={[['Cash', step >= 1 ? $(250_000) : $(650_000)], ['Note receivable — Property Co', step >= 1 ? $(400_000) : '—', B], ['Investments', $(1_200_000)]]} right={[['Equity', $(1_850_000), G2]]} />
        <Ledger x={1040} y={200} w={780} title="Property Co (borrower)" stroke={IV2} left={[['Cash', step >= 1 ? $(460_000) : $(60_000)], ['Building', $(1_000_000)]]} right={[['Bank mortgage (1st lien)', $(620_000), A], ['Note payable — Holding Co', step >= 1 ? $(400_000) : '—', B], ['Equity', $(440_000), G2]]} />
      </S>
      <S at={1} step={step}>
        <Flow d="M 880 460 C 940 420, 980 420, 1040 460" color={B} label={`${$(400_000)} · promissory note · 5.2% ≥ AFR · 10 yrs · security agreement`} lx={960} ly={400} />
      </S>
      <S at={2} step={step}>
        <Flow d="M 1040 560 C 980 600, 940 600, 880 560" color={GR} label={`year 1: ${$(y1.payment)} paid — interest ${$(y1.interest)} + principal ${$(y1.principal)}`} lx={960} ly={650} />
        <Caption y={760} size={28} color={IV2}>Lender: Dr Note receivable / Cr Cash. Borrower: Dr Cash / Cr Note payable. Interest accrues and is actually paid; both ledgers record it.</Caption>
        <Caption y={810} size={28}>Consolidated family reporting eliminates the note; legally, each entity is separately liable and separately protected. No note, no interest, no payments — no loan.</Caption>
      </S>
    </Stage>
  );
}

export function BelowMarketVisual({ step }: VP) {
  return (
    <Stage label="Below-market loan rules">
      <S at={0} step={step}>
        <text x={960} y={200} textAnchor="middle" className="display" style={{ fontSize: 56, fill: IV }}>IRC §7872 — the loan the tax law assumes you made</text>
        <g transform="translate(260 300)">
          <rect width={1400} height={120} rx={16} fill={NODE} stroke={A} strokeWidth={2} />
          <text x={40} y={52} style={{ fontSize: 28, fill: IV2 }}>Parent lends child $250,000 at 0%</text>
          <text x={40} y={92} style={{ fontSize: 24, fill: IV3 }}>no interest charged</text>
          <text x={1360} y={72} textAnchor="end" className="mono" style={{ fontSize: 30, fill: A }}>below-market gift loan</text>
        </g>
      </S>
      <S at={1} step={step}>
        <g transform="translate(260 460)">
          <rect width={1400} height={320} rx={16} fill={NODE} stroke={G} strokeWidth={2} />
          <text x={40} y={60} style={{ fontSize: 28, fill: IV2 }}>Tax law imputes interest at the Applicable Federal Rate (published monthly by the IRS)</text>
          <text x={40} y={120} style={{ fontSize: 26, fill: IV3 }}>→ forgone interest treated as a gift from parent to child (gift-tax rules)</text>
          <text x={40} y={165} style={{ fontSize: 26, fill: IV3 }}>→ and as interest income received by the parent</text>
          <text x={40} y={230} style={{ fontSize: 26, fill: G2 }}>Thresholds (generally): $10,000 de minimis · $100,000 net-investment-income limitation for gift loans</text>
          <text x={40} y={280} style={{ fontSize: 26, fill: G2 }}>Cure: charge at least the AFR for the term, fixed at inception — often far below bank rates.</text>
        </g>
        <Caption y={900} color={A}>US-specific. UAE: no gift tax, but Corporate Tax applies arm’s-length pricing to related-party interest. Cameroon: tax code limits deductible shareholder-loan interest. Not yet jurisdictionally verified.</Caption>
      </S>
    </Stage>
  );
}

export function RateShockVisual({ step }: VP) {
  const noi = 54_000;
  const rates = [0.045, 0.065, 0.085, 0.095];
  return (
    <Stage label="Rate shock on coverage">
      <S at={0} step={step}>
        <text x={960} y={160} textAnchor="middle" className="display" style={{ fontSize: 48, fill: IV }}>Same building, same rent, different rate</text>
        <text x={960} y={205} textAnchor="middle" style={{ fontSize: 26, fill: IV3 }}>NOI {$(noi)} · loan {$(LOAN)} · 30-year amortization</text>
      </S>
      {rates.map((r, i) => {
        const ds = buildLoan({ principal: LOAN, annualRate: r, termMonths: 360, structure: 'amortizing' }).annualDebtService;
        const dscr = noi / ds;
        const c = dscr >= 1.2 ? GR : dscr >= 1 ? A : R;
        return (
          <S key={r} at={i < 2 ? 0 : 1} step={step}>
            <g transform={`translate(${200 + i * 400} 300)`}>
              <rect width={320} height={440} rx={22} fill={NODE} stroke={c} strokeWidth={3} />
              <text x={160} y={70} textAnchor="middle" className="display" style={{ fontSize: 44, fill: IV }}>{pct(r)}</text>
              <text x={160} y={150} textAnchor="middle" className="mono" style={{ fontSize: 26, fill: IV3 }}>debt service</text>
              <text x={160} y={195} textAnchor="middle" className="mono" style={{ fontSize: 34, fill: IV2 }}>{$(ds)}</text>
              <text x={160} y={280} textAnchor="middle" className="mono" style={{ fontSize: 26, fill: IV3 }}>DSCR</text>
              <text x={160} y={350} textAnchor="middle" className="mono" style={{ fontSize: 64, fill: c }}>{dscr.toFixed(2)}×</text>
              <text x={160} y={405} textAnchor="middle" style={{ fontSize: 22, fill: c }}>{dscr >= 1.2 ? 'covers with cushion' : dscr >= 1 ? 'barely covers' : 'cannot pay its debt'}</text>
            </g>
          </S>
        );
      })}
      <S at={1} step={step}><Caption y={880} size={30}>Floating-rate debt moves coverage immediately; fixed-rate debt moves it at maturity, when the loan must be refinanced at the new rate.</Caption></S>
    </Stage>
  );
}

export function ContagionVisual({ step }: VP) {
  const nodes = { hold: [960, 220], op: [460, 560], prop: [960, 620], inv: [1460, 560], fam: [960, 900] } as Record<string, [number, number]>;
  const infected = ['op', 'hold', 'prop', 'inv', 'fam'].slice(0, step + 1);
  const links: [string, string, string][] = [['hold', 'op', 'parent guarantee'], ['op', 'prop', 'cross-collateral'], ['hold', 'inv', 'cross-default'], ['fam', 'op', 'personal guarantees'], ['hold', 'prop', 'ownership']];
  const labels: Record<string, string> = { hold: 'Family Holding', op: 'Operating Co', prop: 'Property Co', inv: 'Investment Co', fam: 'Family members' };
  return (
    <Stage label="Contagion through a family structure">
      {links.map(([a, b, l]) => { const hot = infected.includes(a) && infected.includes(b); const [ax, ay] = nodes[a], [bx, by] = nodes[b]; return <g key={a + b}><line x1={ax} y1={ay} x2={bx} y2={by} stroke={hot ? R : A} strokeWidth={hot ? 5 : 2.5} className={hot ? 'flow-line' : undefined} /><text x={(ax + bx) / 2} y={(ay + by) / 2 - 14} textAnchor="middle" style={{ fontSize: 22, fill: hot ? '#e7a398' : A }}>{l}</text></g>; })}
      {Object.entries(nodes).map(([id, [x, y]]) => { const hot = infected.includes(id); return <g key={id}>{hot && <circle cx={x} cy={y} r={110} fill={R} opacity={0.15} className="ds-pulse" />}<circle cx={x} cy={y} r={78} fill={NODE} stroke={hot ? R : G} strokeWidth={3} /><text x={x} y={y - 4} textAnchor="middle" className="display" style={{ fontSize: 28, fill: IV }}>{labels[id]}</text><text x={x} y={y + 30} textAnchor="middle" className="mono" style={{ fontSize: 22, fill: hot ? '#e7a398' : GR }}>{hot ? 'DEFAULT' : 'OK'}</text></g>; })}
      <Caption y={1040} color={step >= 4 ? R : IV3}>{['Operating Co misses a covenant.', 'Lender calls the parent guarantee.', 'Cross-collateral reaches Property Co’s building.', 'Cross-default accelerates Investment Co’s line.', 'Personal guarantees reach the family. Separation existed on paper only.'][Math.min(step, 4)]}</Caption>
    </Stage>
  );
}

export function MaturityWallVisual({ step }: VP) {
  const before = [72.5, 23, 11, 0, 0, 0, 0, 6.5], after = [4, 7.5, 0, 0, 24, 13.2, 0, 17.8 + 19 + 5.9];
  const max = 75;
  return (
    <Stage label="Maturity wall">
      <S at={0} step={step}>
        <text x={520} y={160} textAnchor="middle" className="display" style={{ fontSize: 44, fill: R }}>Before: $72.5M of $113M due within 2 years</text>
        {before.map((v, i) => <g key={i}><rect x={160 + i * 90} y={740 - (v / max) * 500} width={70} height={(v / max) * 500} fill={i < 2 ? R : A} rx={6} /><text x={195 + i * 90} y={780} textAnchor="middle" style={{ fontSize: 22, fill: IV3 }}>Y{i}</text>{v > 0 && <text x={195 + i * 90} y={720 - (v / max) * 500} textAnchor="middle" className="mono" style={{ fontSize: 22, fill: IV2 }}>{v}M</text>}</g>)}
      </S>
      <S at={1} step={step}>
        <text x={1400} y={160} textAnchor="middle" className="display" style={{ fontSize: 44, fill: GR }}>After: no more than $24M in any year</text>
        {after.map((v, i) => <g key={i}><rect x={1040 + i * 90} y={740 - (v / max) * 500} width={70} height={(v / max) * 500} fill={GR} rx={6} /><text x={1075 + i * 90} y={780} textAnchor="middle" style={{ fontSize: 22, fill: IV3 }}>Y{i}{i === 7 ? '+' : ''}</text>{v > 0 && <text x={1075 + i * 90} y={720 - (v / max) * 500} textAnchor="middle" className="mono" style={{ fontSize: 22, fill: IV2 }}>{v.toFixed(1)}M</text>}</g>)}
        <Caption y={920} size={30}>Weighted-average term 3.1 → 7.6 years; cost of debt 6.4% → 6.6%. Resilience was purchased for about 20 basis points.</Caption>
      </S>
    </Stage>
  );
}

export function StressVisual({ step }: VP) {
  const rows = [['Rates +200bp', 'floating facilities reset; fixed ones at maturity', A], ['Values −15%', 'LTV covenants breach without a missed payment', R], ['NOI −10%', 'DSCR falls; cash sweeps and waivers follow', A]];
  return (
    <Stage label="Stress-test discipline">
      {rows.map(([t, d, c], i) => (
        <S key={t} at={i} step={step}>
          <g transform={`translate(260 ${220 + i * 200})`}>
            <rect width={1400} height={150} rx={18} fill={NODE} stroke={c} strokeWidth={2.5} />
            <text x={40} y={66} className="display" style={{ fontSize: 44, fill: IV }}>{t}</text>
            <text x={40} y={112} style={{ fontSize: 26, fill: IV3 }}>{d}</text>
          </g>
        </S>
      ))}
      <S at={2} step={step}>
        <Caption y={880} size={34} color={G2}>Identify what fails first. Cut the connections. Hold a reserve of 12–24 months of debt service. Then refinance the balances.</Caption>
        <Caption y={940}>A stress test is not a forecast; it is a map of which facility breaks under which shock, and what cures it.</Caption>
      </S>
    </Stage>
  );
}

export function JurisdictionsVisual({ step }: VP) {
  const cols = [['United States', ['UCC Article 9 · county land records', 'FCRA bureaus · FICO', 'IRC §163(j) · §7872', 'Bankruptcy Code Ch. 7/11/13'], true], ['United Arab Emirates', ['Movables Security Law (4/2020) · EMCR', 'Al Etihad Credit Bureau', 'Corporate Tax 30% EBITDA interest cap', 'Bankruptcy Law (51/2023)'], false], ['Cameroon · CEMAC · OHADA', ['OHADA AUS (2010) · RCCM', 'BEAC Centrale des Risques', 'CGI shareholder-loan limits', 'OHADA AUPC (2015)'], false], ['United Kingdom', ['Companies House charges', 'CRAs · CCA 1974', 'Corporate Interest Restriction', 'Insolvency Act 1986'], false]] as const;
  return (
    <Stage label="Four jurisdictions">
      {cols.map(([n, items, ok], i) => (
        <S key={n} at={i} step={step}>
          <g transform={`translate(${120 + i * 430} 180)`}>
            <rect width={400} height={640} rx={22} fill={NODE} stroke={ok ? GR : A} strokeWidth={2.5} />
            <text x={200} y={64} textAnchor="middle" className="display" style={{ fontSize: 32, fill: IV }}>{n}</text>
            <rect x={90} y={90} width={220} height={36} rx={18} fill={ok ? 'rgba(62,160,118,0.15)' : 'rgba(209,154,58,0.15)'} stroke={ok ? GR : A} />
            <text x={200} y={115} textAnchor="middle" style={{ fontSize: 18, fill: ok ? GR : A, letterSpacing: '0.1em' }}>{ok ? 'REVIEWED' : i === 3 ? 'COMING' : 'NOT YET VERIFIED'}</text>
            {['Collateral', 'Credit reporting', 'Interest tax', 'Insolvency'].map((h, k) => <g key={h}><text x={30} y={190 + k * 110} style={{ fontSize: 18, fill: IV3, letterSpacing: '0.14em' }}>{h.toUpperCase()}</text><text x={30} y={224 + k * 110} style={{ fontSize: 22, fill: IV2 }}>{items[k]}</text></g>)}
          </g>
        </S>
      ))}
      <S at={3} step={step}><Caption y={920} size={28}>No jurisdiction is “best”. Suitability depends on residence, citizenship, assets, income, activity and objectives. Amber means phrased generally, pending local counsel.</Caption></S>
    </Stage>
  );
}

export function ObjectivesVisual({ step }: VP) {
  const objs = [['Asset protection', 'where a lender’s claim can and cannot reach', R], ['Tax planning', 'what interest is deductible, what is imputed', GR], ['Estate planning', 'debt at death, liquidity for heirs', V], ['Privacy', 'lawful confidentiality vs disclosure to lenders', B], ['Succession', 'who inherits the obligations and the method', G], ['Governance', 'a written debt policy, a quarterly report', A]];
  return (
    <Stage label="Debt and the six objectives">
      <S at={0} step={step}>
        {objs.map(([n, d, c], i) => (
          <g key={n} transform={`translate(${160 + (i % 3) * 560} ${220 + Math.floor(i / 3) * 320})`}>
            <rect width={480} height={260} rx={22} fill={NODE} stroke={c} strokeWidth={2.5} />
            <text x={240} y={90} textAnchor="middle" className="display" style={{ fontSize: 40, fill: IV }}>{n}</text>
            <text x={240} y={160} textAnchor="middle" style={{ fontSize: 24, fill: IV2 }}>{d}</text>
          </g>
        ))}
        <Caption y={960} size={30}>Every financing decision touches all six. They are never the same thing.</Caption>
      </S>
    </Stage>
  );
}

export function ClosingVisual({ step }: VP) {
  return (
    <Stage label="Closing">
      <circle cx={960} cy={500} r={400} fill="rgba(201,169,97,0.06)" />
      <S at={0} step={step}>
        <Big x={960} y={380} size={96}>Debt is a financing instrument.</Big>
        <Caption y={480} size={38} color={IV2}>It accelerates capital formation when supported by</Caption>
        <text x={960} y={580} textAnchor="middle" className="display" style={{ fontSize: 60, fill: G2 }}>productive assets · sustainable cash flow · disciplined risk management</text>
        <Caption y={700} size={34} color={IV2}>It is never inherently beneficial, never a tax-elimination method, and the most leveraged scenario is never the default.</Caption>
        <Caption y={860} size={28}>Continue in the studio: Lessons 01–09 · Leverage Calculator · Stress Test · Cases A–E · /debt-credit-studio</Caption>
      </S>
    </Stage>
  );
}
