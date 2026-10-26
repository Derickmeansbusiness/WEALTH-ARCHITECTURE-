import { useEffect, useMemo, useRef, useState } from 'react';
import { buildLoan } from '@/lib/finance';
import { useMoney } from '@/components/ui';
import { mirroredPosition } from './mirror';

/**
 * Animated promissory-note cycle: disbursement, then periodic payments, with both balance
 * sheets updating in lock-step. Lender's receivable == borrower's payable at every moment.
 */
const PRINCIPAL = 500_000;
const RATE = 0.05;
const YEARS = 10;
const PERIOD_MS = 1500;

const BANK = { x: 130, y: 210 };
const BORR = { x: 630, y: 210 };

function qbez(p0: { x: number; y: number }, c: { x: number; y: number }, p1: { x: number; y: number }, t: number) {
  const u = 1 - t;
  return { x: u * u * p0.x + 2 * u * t * c.x + t * t * p1.x, y: u * u * p0.y + 2 * u * t * c.y + t * t * p1.y };
}

export default function Diagram() {
  const fmt = useMoney();
  const loan = useMemo(() => buildLoan({ principal: PRINCIPAL, annualRate: RATE, termMonths: YEARS * 12, structure: 'amortizing', frequency: 'annual' }), []);
  const N = loan.schedule.length;
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const base = useRef(0);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = (now: number) => {
      if (startedAt.current === null) startedAt.current = now;
      setElapsed(base.current + (now - startedAt.current));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (startedAt.current !== null) base.current += performance.now() - startedAt.current;
      startedAt.current = null;
    };
  }, [playing]);

  const cycleLen = (N + 2) * PERIOD_MS;
  const inCycle = elapsed % cycleLen;
  const step = Math.floor(inCycle / PERIOD_MS); // 0 = disbursement, 1..N payments, N+1 rest
  const frac = (inCycle % PERIOD_MS) / PERIOD_MS;
  const paidPeriods = step === 0 ? 0 : Math.min(N, step - (frac < 0.6 ? 1 : 0));
  const pos = mirroredPosition(loan, PRINCIPAL, step > N ? N : paidPeriods);
  const disbursed = step > 0 || frac > 0.6;

  // paths
  const topCtrl = { x: 380, y: 110 };
  const botCtrl = { x: 380, y: 320 };
  const topPath = `M ${BANK.x + 70} ${BANK.y - 30} Q ${topCtrl.x} ${topCtrl.y} ${BORR.x - 70} ${BORR.y - 30}`;
  const botPath = `M ${BORR.x - 70} ${BORR.y + 30} Q ${botCtrl.x} ${botCtrl.y} ${BANK.x + 70} ${BANK.y + 30}`;
  const dotT = Math.min(1, frac / 0.6);
  const dot = step === 0
    ? qbez({ x: BANK.x + 70, y: BANK.y - 30 }, topCtrl, { x: BORR.x - 70, y: BORR.y - 30 }, dotT)
    : step <= N ? qbez({ x: BORR.x - 70, y: BORR.y + 30 }, botCtrl, { x: BANK.x + 70, y: BANK.y + 30 }, dotT) : null;
  const row = step >= 1 && step <= N ? loan.schedule[step - 1] : null;

  const Sheet = ({ x, title, lines, tone }: { x: number; title: string; lines: { k: string; v: string; c?: string }[]; tone: string }) => (
    <g transform={`translate(${x} 300)`}>
      <rect x={-120} y={0} width={240} height={30 + lines.length * 20} rx={10} className="node" stroke={tone} strokeWidth={1.2} />
      <text x={-106} y={19} style={{ fontSize: 9.5, fill: 'var(--ivory-3)', letterSpacing: '0.14em' }}>{title}</text>
      {lines.map((l, i) => (
        <g key={l.k}>
          <text x={-106} y={40 + i * 20} style={{ fontSize: 10.5, fill: 'var(--ivory-2)' }}>{l.k}</text>
          <text x={106} y={40 + i * 20} textAnchor="end" className="label-mono" style={{ fontSize: 10.5, fill: l.c ?? 'var(--ivory)' }}>{l.v}</text>
        </g>
      ))}
    </g>
  );

  return (
    <div>
      <div className="ch07-controls">
        <button className="btn sm ghost" onClick={() => setPlaying((p) => !p)} aria-pressed={!playing}>{playing ? 'Pause' : 'Play'}</button>
        <span className="small muted mono">{step === 0 ? 'Disbursement' : step <= N ? `Payment ${step} of ${N}` : 'Note retired'}</span>
        <span className="small muted">· {fmt(PRINCIPAL)} · {(RATE * 100).toFixed(1)}% · {YEARS} annual payments · amortizing</span>
      </div>
      <div className="ch07-diagram-wrap">
        <svg viewBox="0 0 760 470" className="diagram" aria-label="Promissory note cycle between a family bank and a borrower with mirrored balance sheets" style={{ maxHeight: 520 }}>
          <defs>
            <marker id="ch07-ar-g" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--green-2)" /></marker>
            <marker id="ch07-ar-y" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--gold)" /></marker>
          </defs>

          {/* Disbursement path */}
          <path d={topPath} fill="none" stroke="var(--green-2)" strokeWidth={1.6} className={step === 0 ? 'flow-line' : undefined} opacity={step === 0 ? 1 : 0.35} markerEnd="url(#ch07-ar-g)" />
          <text x={380} y={118} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--green-2)' }}>disbursement of principal</text>
          <text x={380} y={132} textAnchor="middle" style={{ fontSize: 10, fill: 'var(--ivory-3)' }}>against a signed promissory note · not income to the borrower</text>

          {/* Payment path */}
          <path d={botPath} fill="none" stroke="var(--gold)" strokeWidth={1.6} className={step >= 1 && step <= N ? 'flow-line' : undefined} opacity={step >= 1 && step <= N ? 1 : 0.35} markerEnd="url(#ch07-ar-y)" />
          <text x={380} y={296} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--gold-2)' }}>periodic payment · interest + principal</text>
          {row && (
            <text x={380} y={282} textAnchor="middle" className="label-mono fade-in" key={step} style={{ fontSize: 10.5, fill: 'var(--ivory-2)' }}>
              {fmt(row.payment)} = {fmt(row.interest)} interest + {fmt(row.principal)} principal
            </text>
          )}

          {/* moving dot */}
          {dot && <circle cx={dot.x} cy={dot.y} r={6} fill={step === 0 ? 'var(--green-2)' : 'var(--gold)'} opacity={0.95} />}
          {dot && <circle cx={dot.x} cy={dot.y} r={12} fill={step === 0 ? 'var(--green-2)' : 'var(--gold)'} opacity={0.18} />}

          {/* Family bank node */}
          <g transform={`translate(${BANK.x} ${BANK.y})`}>
            <rect x={-70} y={-40} width={140} height={80} rx={14} className="node" stroke="var(--green-2)" strokeWidth={1.8} />
            <text y={-10} textAnchor="middle" style={{ fontSize: 12.5, fill: 'var(--ivory)', fontWeight: 600, letterSpacing: '0.06em' }}>FAMILY BANK</text>
            <text y={8} textAnchor="middle" style={{ fontSize: 10, fill: 'var(--ivory-3)' }}>LLC or trust · lender</text>
            <text y={24} textAnchor="middle" style={{ fontSize: 10, fill: 'var(--green-2)' }}>interest = income</text>
          </g>

          {/* Borrower node */}
          <g transform={`translate(${BORR.x} ${BORR.y})`}>
            <rect x={-70} y={-40} width={140} height={80} rx={14} className="node" stroke="var(--gold)" strokeWidth={1.8} />
            <text y={-10} textAnchor="middle" style={{ fontSize: 12.5, fill: 'var(--ivory)', fontWeight: 600, letterSpacing: '0.06em' }}>BORROWER</text>
            <text y={8} textAnchor="middle" style={{ fontSize: 10, fill: 'var(--ivory-3)' }}>family member or family company</text>
            <text y={24} textAnchor="middle" style={{ fontSize: 10, fill: '#e7a398' }}>interest = expense</text>
          </g>

          {/* Note in the middle */}
          <g transform="translate(380 210)">
            <rect x={-62} y={-36} width={124} height={72} rx={8} fill="rgba(201,169,97,0.06)" stroke="var(--gold)" strokeDasharray="3 4" strokeWidth={1} />
            <text y={-14} textAnchor="middle" style={{ fontSize: 10, fill: 'var(--gold-2)', letterSpacing: '0.12em' }}>PROMISSORY NOTE</text>
            <text y={2} textAnchor="middle" className="label-mono" style={{ fontSize: 10, fill: 'var(--ivory-2)' }}>{fmt(PRINCIPAL)} · {(RATE * 100).toFixed(1)}%</text>
            <text y={16} textAnchor="middle" style={{ fontSize: 9.5, fill: 'var(--ivory-3)' }}>fixed maturity · schedule</text>
            <text y={28} textAnchor="middle" style={{ fontSize: 9.5, fill: 'var(--ivory-3)' }}>{disbursed ? `balance ${fmt(pos.lender.note)}` : 'signed, not yet funded'}</text>
          </g>

          {/* Balance sheets */}
          <Sheet x={150} title="LENDER · BALANCE SHEET" tone="var(--green-2)" lines={[
            { k: 'Cash', v: fmt(disbursed ? pos.lender.principalRepaid + pos.lender.interest : PRINCIPAL) },
            { k: 'Note receivable', v: fmt(disbursed ? pos.lender.note : 0), c: 'var(--gold-2)' },
            { k: 'Interest income (cum.)', v: fmt(pos.lender.interest), c: 'var(--green-2)' },
            { k: 'Total assets', v: fmt(disbursed ? pos.lender.principalRepaid + pos.lender.interest + pos.lender.note : PRINCIPAL) },
          ]} />
          <Sheet x={610} title="BORROWER · BALANCE SHEET" tone="var(--gold)" lines={[
            { k: 'Asset acquired / cash', v: fmt(disbursed ? PRINCIPAL : 0) },
            { k: 'Note payable', v: fmt(disbursed ? pos.borrower.note : 0), c: '#e7a398' },
            { k: 'Interest expense (cum.)', v: fmt(pos.borrower.interest), c: '#e7a398' },
            { k: 'Equity built via principal', v: fmt(disbursed ? pos.borrower.principalRepaid : 0), c: 'var(--green-2)' },
          ]} />
          <text x={380} y={452} textAnchor="middle" style={{ fontSize: 10, fill: 'var(--ivory-3)' }}>note receivable and note payable are the same number, always — that symmetry is the test of a real loan</text>
        </svg>
      </div>
      <p className="ch07-caption">
        The green arrow is the one-time disbursement: cash leaves the family bank and a note receivable appears in its place, while the borrower books an asset and a matching note payable. The gold arrow repeats every period: each payment splits into interest, which is income to the lender and expense to the borrower, and principal, which shrinks both notes in lock-step. Nothing on this diagram eliminates tax — it moves interest from one family balance sheet to another, under a document that must be respected by both sides.
      </p>
    </div>
  );
}
