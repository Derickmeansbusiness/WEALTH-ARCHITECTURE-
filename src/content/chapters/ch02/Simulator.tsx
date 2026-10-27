import { useMemo, useState } from 'react';
import { Eyebrow, Stat, SliderField, NumberField, Disclaimer, Callout, useMoney } from '@/components/ui';
import { pct } from '@/lib/format';
import { ENGINES, analyzeMix, type EngineId } from './engines';

const COLORS: Record<EngineId, string> = { labor: 'rgba(243,236,220,0.6)', business: 'var(--gold)', realestate: 'var(--green-2)', financial: 'var(--blue)', ip: 'var(--violet)' };

export default function Simulator() {
  const [capital, setCapital] = useState(2_000_000);
  const [shares, setShares] = useState<Record<EngineId, number>>({ labor: 10, business: 45, realestate: 25, financial: 15, ip: 5 });
  const fmt = useMoney();
  const r = useMemo(() => analyzeMix({ totalCapital: capital, shares }), [capital, shares]);
  const concTone = r.concentration === 'high' ? 'red' : r.concentration === 'moderate' ? 'amber' : 'green';
  const largest = ENGINES.find((e) => e.id === r.largestEngine);

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div><Eyebrow>Engine Mix</Eyebrow><h4 style={{ margin: '4px 0 0' }}>Allocate capital across the five engines and read the trade-offs.</h4></div>
      <div className="acad-sim">
        <div className="stack" style={{ gap: 12 }}>
          <NumberField label="Capital to deploy (USD)" value={capital} onChange={setCapital} step={100_000} min={0} />
          {ENGINES.map((e) => (
            <SliderField key={e.id} label={<span style={{ color: COLORS[e.id] }}>{e.label}</span>} value={shares[e.id]} min={0} max={100} step={5} onChange={(v) => setShares((s) => ({ ...s, [e.id]: v }))} format={() => `${pct(r.normalised[e.id], 0)} · ${fmt(r.allocated[e.id], { compact: true })}`} />
          ))}
          <p className="tiny muted" style={{ margin: 0 }}>Sliders are relative weights; they are normalised to 100%.</p>
        </div>
        <div className="stack" style={{ gap: 14 }}>
          {/* allocation bar */}
          <div style={{ display: 'flex', height: 18, borderRadius: 999, overflow: 'hidden', border: '1px solid var(--line-strong)' }}>
            {ENGINES.map((e) => <div key={e.id} title={e.label} style={{ width: `${r.normalised[e.id] * 100}%`, background: COLORS[e.id], transition: 'width 0.5s var(--ease)' }} />)}
          </div>
          <div className="acad-sim-stats">
            <Stat label="Projected annual cash flow" value={fmt(r.annualCashFlow, { compact: true })} tone="gold" sub={`${pct(r.blendedCashYield)} blended yield`} />
            <Stat label="Projected annual growth" value={fmt(r.annualGrowth, { compact: true })} sub={`${pct(r.blendedGrowth)} blended appreciation`} />
            <Stat label="Leverage capacity" value={fmt(r.leverageCapacity, { compact: true })} sub="at typical max LTVs; not a recommendation" />
            <Stat label="Effective engines" value={r.effectiveEngines.toFixed(1)} sub="1 ÷ Herfindahl index" tone={concTone} />
            <Stat label="Concentration" value={r.concentration.toUpperCase()} tone={concTone} sub={largest ? `${pct(r.largestShare, 0)} in ${largest.label}` : '—'} />
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Engine</th><th className="num">Cash yield</th><th className="num">Appreciation</th><th className="num">Max LTV</th><th>Control</th><th>Transfer</th><th>Liquidity</th></tr></thead>
              <tbody>
                {ENGINES.map((e) => (
                  <tr key={e.id} style={{ opacity: r.normalised[e.id] > 0 ? 1 : 0.45 }}>
                    <td style={{ color: COLORS[e.id] }}>{e.label}</td>
                    <td className="num">{e.id === 'labor' ? 'wages' : pct(e.cashYield, 0)}</td>
                    <td className="num">{pct(e.appreciation, 0)}</td>
                    <td className="num">{pct(e.maxLtv, 0)}</td>
                    <td><Dots n={e.control} /></td><td><Dots n={e.transferability} /></td><td><Dots n={e.liquidity} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {r.concentration === 'high' && largest && (
            <Callout tone="danger" title="Concentration flag">
              <p className="small" style={{ margin: 0 }}>{pct(r.largestShare, 0)} of capital sits in one engine ({largest.label}). {largest.note} A single interruption to this engine would remove most of the family's cash flow. This is a flag for discussion, not a verdict; some founders run concentrated by design and build other engines from the cash.</p>
            </Callout>
          )}
          {r.normalised.labor > 0.3 && (
            <Callout tone="amber" title="Labor is not an engine that compounds">
              <p className="small" style={{ margin: 0 }}>Capital allocated to labor (training, credentials) returns wages, which stop when the person stops. The simulator assigns it no yield or growth and no leverage capacity. Treat it as the seed for the other four.</p>
            </Callout>
          )}
          <div className="acad-formula">{`Annual cash flow = Σ allocation_i × cashYield_i
Annual growth    = Σ allocation_i × appreciation_i
Leverage capacity = Σ allocation_i × maxLTV_i   (what lenders might advance, not what you should borrow)
Herfindahl (HHI)  = Σ share_i²  ·  effective engines = 1 / HHI
Concentration: high ≥ 60% in one engine · moderate ≥ 40%

Assumed yields (illustrative, pre-tax, not forecasts): business 12% / 4%, real estate 5% / 3%, investments 2% / 5%, IP 9% / 0%, labor 0% / 0%`}</div>
          <Disclaimer>Yield and appreciation assumptions are round illustrative figures for comparing engine shapes. Real returns vary widely, can be negative, and are not promised. Leverage capacity shows what lenders might advance against each engine type; borrowing it is a separate decision covered in Chapter 04. Tax on each engine's cash flow differs and is not modelled here.</Disclaimer>
        </div>
      </div>
    </div>
  );
}

function Dots({ n }: { n: number }) {
  return <span className="row" style={{ gap: 3 }}>{[1, 2, 3, 4, 5].map((i) => <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: i <= n ? 'var(--gold)' : 'rgba(255,255,255,0.1)' }} />)}</span>;
}

