import { useMoney } from '@/components/ui';
import { pct } from '@/lib/format';

/** Three animated bars: equity (gold), borrowed (amber), total asset (ivory). `t` 0..1. */
export default function FinancingSplit({ t, price = 1_000_000, equity = 300_000 }: { t: number; price?: number; equity?: number }) {
  const fmt = useMoney();
  const loan = price - equity;
  const rows: { label: string; value: number; tone: 'gold' | 'amber' | 'ivory'; sub: string; delay: number }[] = [
    { label: 'Equity capital', value: equity, tone: 'gold', sub: `${pct(equity / price, 0)} of price · the owner’s money, first loss`, delay: 0 },
    { label: 'Borrowed capital', value: loan, tone: 'amber', sub: `${pct(loan / price, 0)} LTV · the lender’s money, repaid with interest`, delay: 0.25 },
    { label: 'Total asset value', value: price, tone: 'ivory', sub: 'what the Property Co controls', delay: 0.5 },
  ];
  return (
    <div className="stack" style={{ gap: 14 }}>
      {rows.map((r) => {
        const p = Math.max(0, Math.min(1, (t - r.delay) / 0.5));
        return (
          <div key={r.label} className="stack" style={{ gap: 6 }}>
            <div className="row between"><span className="eyebrow">{r.label}</span><span className="tiny muted">{r.sub}</span></div>
            <div className="ds-bar-track">
              <div className={`ds-bar-fill ${r.tone}`} style={{ width: `${(r.value / price) * 100 * p}%` }}>{p > 0.3 ? fmt(r.value * p, { compact: true }) : ''}</div>
            </div>
          </div>
        );
      })}
      <p className="small muted" style={{ margin: 0 }}>Asset = Loan + Equity. The lender finances {pct(loan / price, 0)} of the purchase; the owner controls 100% of the asset and absorbs the first {fmt(equity, { compact: true })} of any loss.</p>
    </div>
  );
}
