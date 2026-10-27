import type { Structure, StructureEdge } from '@/types/structure';
import { Chip, SliderField, useMoney } from '@/components/ui';
import { pct } from '@/lib/format';
import { loanParties, loanPosition, loanAnnual, labelOf, affiliated } from '@/modules/lab/analysis';

export default function LoanDetail({ structure, edge, elapsedMonths, onElapsed, currentYear }: { structure: Structure; edge: StructureEdge; elapsedMonths: number; onElapsed: (m: number) => void; currentYear: number }) {
  const fmt = useMoney();
  const loan = edge.loan!;
  const { lenderId, borrowerId } = loanParties(edge);
  const pos = loanPosition(loan, elapsedMonths);
  const annual = loanAnnual(loan);
  const maturityYear = (loan.originatedYear ?? currentYear) + Math.ceil((loan.structure === 'balloon' && loan.balloonMonths ? loan.balloonMonths : loan.termMonths) / 12);
  const docs = loan.securityDocs ?? [];
  const aff = affiliated(structure, lenderId, borrowerId);
  const first12 = pos.summary.schedule.slice(0, 12);
  const ppy = pos.summary.periodsPerYear;
  const maxMonths = Math.round((pos.summary.totalPeriods / ppy) * 12);

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="row between" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="eyebrow">Loan detail</div>
          <h4 style={{ margin: '4px 0 2px' }}>{edge.label ?? `${labelOf(structure, lenderId)} → ${labelOf(structure, borrowerId)}`}</h4>
          <div className="row" style={{ gap: 6 }}>
            <Chip tone={loan.relatedParty ? 'amber' : 'blue'}>{loan.relatedParty ? 'Related party' : 'Third party'}</Chip>
            {aff && !loan.relatedParty && <Chip tone="red">Affiliated but not flagged</Chip>}
            {docs.length === 0 ? <Chip tone="red">Undocumented</Chip> : <Chip tone="green">{docs.length} security docs</Chip>}
            {pos.matured && <Chip>Matured</Chip>}
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: 8 }}>
        <KV k="Lender" v={labelOf(structure, lenderId)} />
        <KV k="Borrower" v={labelOf(structure, borrowerId)} />
        <KV k="Principal" v={fmt(loan.principal)} mono />
        <KV k="Interest" v={`${pct(loan.rate, 2)} · ${loan.structure}${loan.structure === 'balloon' && loan.balloonMonths ? ` (due month ${loan.balloonMonths})` : ''}`} mono />
        <KV k="Outstanding balance" v={fmt(pos.balance)} mono accent />
        <KV k="Paid so far" v={`${fmt(pos.principalPaid)} principal · ${fmt(pos.interestPaid)} interest`} mono />
        <KV k="Collateral" v={loan.collateral ?? '— none recorded'} />
        <KV k="Maturity" v={`${maturityYear} · ${loan.termMonths} months from ${loan.originatedYear ?? currentYear}`} mono />
        <KV k="Guarantor" v={loan.guarantorId ? labelOf(structure, loan.guarantorId) : structure.edges.find((e) => e.kind === 'guarantees' && e.to === borrowerId) ? labelOf(structure, structure.edges.find((e) => e.kind === 'guarantees' && e.to === borrowerId)!.from) : '— none'} />
        <KV k="Governing law" v={loan.jurisdiction ?? '— not set'} />
        <KV k="Purpose" v={loan.purpose ?? '— not recorded'} />
        <KV k="Payment" v={`${fmt(pos.summary.periodicPayment)} ${loan.paymentFrequency} · ${fmt(pos.summary.annualDebtService)}/yr`} mono />
      </div>

      <div>
        <div className="eyebrow" style={{ marginBottom: 4 }}>Security documentation</div>
        <div className="row" style={{ gap: 6 }}>
          {['Promissory note', 'Security agreement', 'UCC-1 filing', 'Mortgage / deed of trust', 'Guaranty', 'Board resolution'].map((d) => <Chip key={d} tone={docs.includes(d) ? 'green' : undefined} className={docs.includes(d) ? '' : 'muted'}>{docs.includes(d) ? '✓ ' : '○ '}{d}</Chip>)}
        </div>
        {docs.length === 0 && <p className="tiny red" style={{ margin: '6px 0 0' }}>Without a note and a security filing, this transfer has no legal shape. A court or tax authority can treat it as a gift or a capital contribution — and the "lender" has nothing to enforce.</p>}
      </div>

      <SliderField label="Schedule position (months since origination)" value={Math.min(elapsedMonths, maxMonths)} min={0} max={maxMonths} step={1} onChange={onElapsed} format={(v) => `${v} mo · ${fmt(loanPosition(loan, v).balance, { compact: true })} outstanding`} />

      <div className="grid grid-2 fm-tables" style={{ gap: 12 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>First 12 periods</div>
          <div className="table-wrap" style={{ maxHeight: 300 }}>
            <table className="table">
              <thead><tr><th>#</th><th className="num">Payment</th><th className="num">Interest</th><th className="num">Principal</th><th className="num">Balance</th></tr></thead>
              <tbody>{first12.map((r) => <tr key={r.period} className={r.period <= pos.periodsElapsed ? 'fm-paid' : ''}><td className="mono">{r.period}</td><td className="num">{fmt(r.payment)}</td><td className="num">{fmt(r.interest)}</td><td className="num">{fmt(r.principal)}</td><td className="num">{fmt(r.balance)}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Annual summary</div>
          <div className="table-wrap" style={{ maxHeight: 300 }}>
            <table className="table">
              <thead><tr><th>Year</th><th className="num">Paid</th><th className="num">Interest</th><th className="num">Principal</th><th className="num">Balance</th></tr></thead>
              <tbody>{annual.map((y) => <tr key={y.year} className={y.year * 12 <= elapsedMonths ? 'fm-paid' : ''}><td className="mono">{(loan.originatedYear ?? currentYear) + y.year - 1}</td><td className="num">{fmt(y.payment)}</td><td className="num">{fmt(y.interest)}</td><td className="num">{fmt(y.principal)}</td><td className="num">{fmt(y.balance)}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </div>
      <p className="tiny muted" style={{ margin: 0 }}>Schedule from <code className="mono">buildLoan</code> in the shared finance library: payment = P·r·(1+r)ⁿ / ((1+r)ⁿ − 1); interest-only pays P·r per period with principal at maturity; balloon sizes payments over the full term and calls the balance at the balloon date. Totals: {fmt(pos.summary.totalInterest)} interest over the life, {fmt(pos.summary.totalPaid)} paid in all{pos.summary.balloonBalance > 0 ? `, ${fmt(pos.summary.balloonBalance)} due at the balloon` : ''}.</p>
    </div>
  );
}

function KV({ k, v, mono, accent }: { k: string; v: string; mono?: boolean; accent?: boolean }) {
  return <div className="fm-kv"><div className="k">{k}</div><div className={`v ${mono ? 'mono' : ''}`} style={{ color: accent ? 'var(--gold-2)' : undefined }}>{v}</div></div>;
}
