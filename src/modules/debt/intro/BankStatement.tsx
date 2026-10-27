import { useMemo } from 'react';
import { buildLoan } from '@/lib/finance';
import { useMoney } from '@/components/ui';
import { pct } from '@/lib/format';
import { useInViewProgress } from '@/content/debt/lessons/visuals/animation';

/** A stylized loan statement that fills month by month from the amortization schedule. */
export default function BankStatement({ principal = 700_000, rate = 0.065, months = 12 }: { principal?: number; rate?: number; months?: number }) {
  const fmt = useMoney();
  const loan = useMemo(() => buildLoan({ principal, annualRate: rate, termMonths: 360, structure: 'amortizing' }), [principal, rate]);
  const { ref, t } = useInViewProgress<HTMLDivElement>(6000, { loop: true });
  const shown = Math.max(1, Math.min(months, Math.floor(t * (months + 2))));
  const rows = loan.schedule.slice(0, shown);
  const cur = rows[rows.length - 1];
  const paidInterest = rows.reduce((s, r) => s + r.interest, 0);
  const paidPrincipal = rows.reduce((s, r) => s + r.principal, 0);
  return (
    <div ref={ref} className="ds-statement" aria-label="Animated loan statement">
      <div className="ds-statement-head">
        <div className="stack" style={{ gap: 0 }}><span className="eyebrow">Loan statement · Property Co</span><span className="tiny muted">Facility 0071-MTG · {fmt(principal, { compact: true })} · {pct(rate)} fixed · 360 months</span></div>
        <div className="stack" style={{ gap: 0, textAlign: 'right' }}><span className="tiny muted">Current balance</span><span className="mono" style={{ fontSize: '1.1rem', color: 'var(--gold-2)' }}>{fmt(cur.balance)}</span></div>
      </div>
      <div className="ds-statement-row head"><span>Period</span><span className="r">Payment</span><span className="r hide-sm">Interest</span><span className="r">Principal</span></div>
      {rows.map((r) => (
        <div key={r.period} className={`ds-statement-row ${r.period === shown ? 'current' : ''}`}>
          <span>Month {String(r.period).padStart(2, '0')}</span>
          <span className="r">{fmt(r.payment)}</span>
          <span className="r hide-sm" style={{ color: 'var(--amber)' }}>{fmt(r.interest)}</span>
          <span className="r" style={{ color: 'var(--gold-2)' }}>{fmt(r.principal)}</span>
        </div>
      ))}
      <div className="ds-statement-row" style={{ color: 'var(--ivory-3)' }}>
        <span>Year-to-date</span><span className="r">{fmt(paidInterest + paidPrincipal)}</span><span className="r hide-sm" style={{ color: 'var(--amber)' }}>{fmt(paidInterest)}</span><span className="r" style={{ color: 'var(--gold-2)' }}>{fmt(paidPrincipal)}</span>
      </div>
      <div style={{ padding: '10px 16px', fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--muted)' }}>Interest is charged on the outstanding balance; each level payment contains a little more principal than the last. Illustrative statement — amounts from buildLoan.</div>
    </div>
  );
}
