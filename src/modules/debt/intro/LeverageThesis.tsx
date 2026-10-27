import { useMoney } from '@/components/ui';
import { pct } from '@/lib/format';
import { equitySensitivity } from '@/content/debt/math';
import { easeOut } from '@/content/debt/lessons/visuals/animation';

/** Two-sided chart: +10% value → equity +33%; −10% → −33%. `t` 0..1 animates. */
export default function LeverageThesis({ t, price = 1_000_000, loan = 700_000, change = 0.1 }: { t: number; price?: number; loan?: number; change?: number }) {
  const fmt = useMoney();
  const up = equitySensitivity(price, loan, change), down = equitySensitivity(price, loan, -change);
  const p = easeOut(t);
  const W = 900, H = 360, mid = 450, baseY = 300, scale = 0.00022;
  const bar = (x: number, v: number, color: string, label: string, sub: string, grow: number) => {
    const h = v * scale * grow;
    return (
      <g>
        <rect x={x - 50} y={baseY - h} width={100} height={h} fill={color} opacity={0.9} rx={3} />
        <text x={x} y={baseY - h - 10} textAnchor="middle" className="label-mono" style={{ fontSize: 13, fill: color }}>{fmt(v * grow, { compact: true })}</text>
        <text x={x} y={baseY + 18} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--ivory-2)' }}>{label}</text>
        <text x={x} y={baseY + 32} textAnchor="middle" style={{ fontSize: 10, fill: 'var(--ivory-3)' }}>{sub}</text>
      </g>
    );
  };
  return (
    <div className="stack" style={{ gap: 12 }}>
      <div style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="diagram" style={{ maxHeight: 400, minWidth: 640 }} role="img" aria-label="Leverage multiplies gains and losses on equity">
          <line x1={mid} y1={20} x2={mid} y2={baseY + 40} stroke="var(--line-strong)" strokeDasharray="4 4" />
          <text x={mid - 230} y={28} textAnchor="middle" className="display" style={{ fontSize: 20, fill: 'var(--green-2)' }}>Value +{pct(change, 0)}</text>
          <text x={mid + 230} y={28} textAnchor="middle" className="display" style={{ fontSize: 20, fill: 'var(--red)' }}>Value −{pct(change, 0)}</text>
          {/* left: up */}
          {bar(mid - 330, price, 'var(--ivory-3)', 'Asset before', fmt(price, { compact: true }), 1)}
          {bar(mid - 210, up.value1, 'var(--ivory-2)', 'Asset after', `+${pct(change, 0)}`, p)}
          {bar(mid - 90, up.equity1, 'var(--green-2)', 'Equity after', `${fmt(up.equity0, { compact: true })} → +${pct(up.equityChangePct, 0)}`, p)}
          {/* right: down */}
          {bar(mid + 90, price, 'var(--ivory-3)', 'Asset before', fmt(price, { compact: true }), 1)}
          {bar(mid + 210, down.value1, 'var(--ivory-2)', 'Asset after', `−${pct(change, 0)}`, p)}
          {bar(mid + 330, down.equity1, 'var(--red)', 'Equity after', `${fmt(down.equity0, { compact: true })} → ${pct(down.equityChangePct, 0)}`, p)}
          {/* loan line */}
          <line x1={40} y1={baseY - loan * scale} x2={W - 40} y2={baseY - loan * scale} stroke="var(--amber)" strokeDasharray="6 4" />
          <text x={W - 44} y={baseY - loan * scale - 6} textAnchor="end" className="label-mono" style={{ fontSize: 11, fill: 'var(--amber)' }}>loan balance {fmt(loan, { compact: true })} — unchanged either way</text>
        </svg>
      </div>
      <div className="ds-two">
        <div className="panel tight">
          <div className="eyebrow" style={{ marginBottom: 8 }}>The formula</div>
          <div className="ds-formula">Equity return = Asset return × (Asset ÷ Equity)</div>
          <p className="small muted" style={{ margin: '10px 0 0' }}>{fmt(price, { compact: true })} ÷ {fmt(price - loan, { compact: true })} = <strong>{up.multiplier.toFixed(2)}×</strong>. A {pct(change, 0)} move in the asset is a {pct(Math.abs(up.equityChangePct), 0)} move in equity, in either direction, because the loan balance does not move.</p>
        </div>
        <div className="panel tight" style={{ borderColor: 'rgba(194,90,76,0.4)' }}>
          <div className="eyebrow red" style={{ marginBottom: 8 }}>The symmetry nobody advertises</div>
          <p className="small" style={{ margin: 0 }}>A {pct(1 / up.multiplier, 0)} decline wipes out the equity entirely. Leverage does not change the asset; it changes who absorbs the first dollar of movement. Everything in this studio follows from that one fact.</p>
        </div>
      </div>
    </div>
  );
}
