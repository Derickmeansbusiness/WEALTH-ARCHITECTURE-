import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { pct } from '@/lib/format';
import { Panel, NumberField, SliderField, Stat, Disclaimer, Callout, Chip, useMoney } from '@/components/ui';
import { DEFAULT_WATERFALL, TIERS, atYear, normaliseAllocation, projectWaterfall, type TierId, type WaterfallInput } from './waterfall';

/** Capital allocation waterfall: set surplus and tier percentages, see 10- and 25-year pool sizes. */
export default function Simulator() {
  const fmt = useMoney();
  const [input, setInput] = useState<WaterfallInput>(DEFAULT_WATERFALL);
  const set = (patch: Partial<WaterfallInput>) => setInput((p) => ({ ...p, ...patch }));
  const setAlloc = (id: TierId, v: number) => setInput((p) => ({ ...p, allocation: { ...p.allocation, [id]: v } }));
  const setGrowth = (id: TierId, v: number) => setInput((p) => ({ ...p, growth: { ...p.growth, [id]: v / 100 } }));

  const rows = useMemo(() => projectWaterfall({ ...input, years: 25 }), [input]);
  const y10 = atYear(rows, 10);
  const y25 = atYear(rows, 25);
  const allocSum = TIERS.reduce((s, t) => s + input.allocation[t.id], 0);
  const norm = normaliseAllocation(input.allocation);
  const contributed25 = rows.reduce((s, r) => s + r.surplus, 0);
  const maxPool = Math.max(1, ...TIERS.map((t) => y25.pools[t.id]));

  return (
    <div className="stack" style={{ gap: 18 }}>
      <Panel>
        <div className="row between" style={{ marginBottom: 12 }}>
          <div>
            <div className="eyebrow">Capital allocation waterfall</div>
            <h3 style={{ margin: '4px 0 0' }}>Where does this year's surplus go?</h3>
          </div>
          <Chip tone="amber">Illustrative growth assumptions</Chip>
        </div>
        <div className="grid grid-3" style={{ gap: 14 }}>
          <NumberField label="Annual surplus after living costs & tax" value={input.annualSurplus} onChange={(v) => set({ annualSurplus: v })} min={0} step={5000} prefix="$" />
          <NumberField label="Surplus growth per year" value={Math.round(input.surplusGrowth * 1000) / 10} onChange={(v) => set({ surplusGrowth: v / 100 })} min={-10} max={20} step={0.5} suffix="%" hint="Raises, business income growth." />
          <NumberField label="Share of pool growth recycled" value={Math.round(input.recycleRate * 100)} onChange={(v) => set({ recycleRate: Math.max(0, Math.min(100, v)) / 100 })} min={0} max={100} step={5} suffix="%" hint="Portion of each year's returns pulled out and redeployed through the allocation below." />
        </div>
      </Panel>

      <Panel>
        <div className="row between" style={{ marginBottom: 8 }}>
          <div className="eyebrow">Allocation of each year's inflow</div>
          <span className={`ch08-alloc-sum ${Math.abs(allocSum - 100) > 0.5 ? 'bad' : ''}`}>{allocSum.toFixed(0)}% {Math.abs(allocSum - 100) > 0.5 ? '· normalised to 100%' : ''}</span>
        </div>
        <div className="grid grid-2" style={{ gap: 14 }}>
          {TIERS.map((t) => (
            <div key={t.id} className="stack" style={{ gap: 6, padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 12, borderLeft: `2px solid ${t.tone}` }}>
              <SliderField label={t.label} value={input.allocation[t.id]} onChange={(v) => setAlloc(t.id, v)} min={0} max={100} step={1} format={(v) => `${v}% → ${pct(norm[t.id], 0)}`} />
              <SliderField label={<span className="muted">assumed growth</span>} value={Math.round(input.growth[t.id] * 1000) / 10} onChange={(v) => setGrowth(t.id, v)} min={-5} max={20} step={0.5} format={(v) => `${v.toFixed(1)}% / yr`} />
              <span className="tiny muted">{t.note}</span>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid grid-4" style={{ gap: 12 }}>
        <Stat label="Family capital · year 10" value={fmt(y10.total, { compact: true })} tone="gold" />
        <Stat label="Family capital · year 25" value={fmt(y25.total, { compact: true })} tone="gold" />
        <Stat label="Total surplus contributed (25 yrs)" value={fmt(contributed25, { compact: true })} sub="labor's share of the result" />
        <Stat label="Growth & recycling (25 yrs)" value={fmt(Math.max(0, y25.total - contributed25), { compact: true })} tone="green" sub={`${pct(y25.total > 0 ? (y25.total - contributed25) / y25.total : 0, 0)} of year-25 capital`} />
      </div>

      <Panel>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Pool sizes</div>
        <div className="ch08-bars">
          {TIERS.map((t) => (
            <div key={t.id} className="ch08-bar">
              <span className="k">{t.short}</span>
              <div className="track"><div className="fill" style={{ width: `${(y25.pools[t.id] / maxPool) * 100}%`, background: t.tone }} /></div>
              <span className="v">{fmt(y25.pools[t.id], { compact: true })}</span>
            </div>
          ))}
        </div>
        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table className="table">
            <thead><tr><th>Year</th>{TIERS.map((t) => <th key={t.id} className="num">{t.short}</th>)}<th className="num">Recycled</th><th className="num">Total</th></tr></thead>
            <tbody>
              {[1, 5, 10, 15, 20, 25].map((y) => { const r = atYear(rows, y); return (
                <tr key={y}><td className="mono">{r.year}</td>{TIERS.map((t) => <td key={t.id} className="num">{fmt(r.pools[t.id], { compact: true })}</td>)}<td className="num">{fmt(r.recycled, { compact: true })}</td><td className="num gold">{fmt(r.total, { compact: true })}</td></tr>
              ); })}
            </tbody>
          </table>
        </div>
        <p className="small muted" style={{ marginTop: 10, marginBottom: 0 }}>
          Notice what the liquidity pool costs: at 2% it is the slowest-growing line in the table, every year. It is also the pool that lets the other four avoid a forced sale. That trade is the whole chapter.
        </p>
      </Panel>

      <Callout title="Go deeper">
        <p className="small" style={{ margin: 0 }}>
          The full <Link to="/waterfall">Capital Waterfall</Link> module adds tax drag per pool, debt on the real estate tier, a liquidity event at a chosen year and the transfer of pools into trusts over time.
        </p>
      </Callout>

      <Panel tight>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Assumptions & formulas</div>
        <ul className="small muted" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
          <li>Each year, in order: (1) every pool grows by its assumed rate, pool × g; (2) the chosen share of that year's total growth is withdrawn pro rata from the pools where it was earned; (3) the year's surplus plus the recycled amount is allocated across the pools by the normalised percentages.</li>
          <li>Surplus grows at the stated rate each year. Allocation percentages are normalised to sum to 100% if they do not.</li>
          <li>Growth rates are nominal, pre-tax, constant and user-set. Real returns are volatile, taxed differently per pool (ordinary income, capital gains, tax-deferred inside certain trusts and insurance), and depend on leverage that is not modelled here.</li>
          <li>No fees, no transaction costs, no gift or estate tax on moving capital into the permanent pool, no insurance cost drag on the liquidity pool. Each of those reduces the result.</li>
          <li>The output is a sensitivity tool for allocation decisions, not a forecast.</li>
        </ul>
      </Panel>
      <Disclaimer>
        Allocation across pools is an investment and estate-planning decision with tax consequences at every boundary — funding a trust is a gift, selling a business to buy property is a taxable event, premiums paid are not investable. Work the actual numbers with an investment adviser, a CPA and estate counsel before moving capital between pools.
      </Disclaimer>
    </div>
  );
}
