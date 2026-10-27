import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Panel, Chip, Stat, Disclaimer, Eyebrow, NumberField, SliderField, useMoney } from '@/components/ui';
import { pct } from '@/lib/format';
import { compareAll, averageStake, DEFAULT_TRANSFER, type TransferInput, type Path } from './model';
import './styles.css';

const PATH_META: Record<Path, { title: string; blurb: string }> = {
  direct: { title: 'Direct inheritance', blurb: 'Outright bequests through a will; each generation divides equally; probate at each death.' },
  trust: { title: 'Dynasty trust', blurb: 'Lifetime gift to a GST-exempt irrevocable trust; trustee holds title; beneficiaries change, ownership does not.' },
  business: { title: 'Business succession', blurb: 'One operating successor per generation; siblings bought out under a buy-sell; non-controlling interests transferred at a discount.' },
};

export default function Simulator() {
  const [inp, setInp] = useState<TransferInput>(DEFAULT_TRANSFER);
  const [sel, setSel] = useState<Path>('trust');
  const money = useMoney();
  const all = useMemo(() => compareAll(inp), [inp]);
  const set = <K extends keyof TransferInput>(k: K, v: TransferInput[K]) => setInp((x) => ({ ...x, [k]: v }));
  const cur = all[sel];

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="grid grid-2" style={{ gap: 20, alignItems: 'start' }}>
        <Panel>
          <Eyebrow>Estate & horizon</Eyebrow>
          <div className="stack" style={{ gap: 14, marginTop: 8 }}>
            <NumberField label="Estate value today" value={inp.estateValue} onChange={(v) => set('estateValue', v)} min={0} step={500000} prefix="USD" />
            <SliderField label="Heirs per decedent" value={inp.heirs} onChange={(v) => set('heirs', v)} min={1} max={6} />
            <SliderField label="Annual growth" value={inp.growth} onChange={(v) => set('growth', v)} min={0} max={0.1} step={0.005} format={(v) => pct(v)} />
            <SliderField label="Horizon (three generational transfers)" value={inp.years} onChange={(v) => set('years', v)} min={45} max={120} step={5} format={(v) => `${v} yrs · ${Math.round(v / 3)} per generation`} />
          </div>
          <div className="hairline" style={{ margin: '18px 0' }} />
          <Eyebrow>Transfer-tax assumptions <Chip tone="amber">you set these</Chip></Eyebrow>
          <p className="tiny muted" style={{ marginTop: 6 }}>Exemption amounts are indexed and have been changed by legislation repeatedly; the rate shown is a flat illustrative rate above the exemption. Enter what you want to test, not what you assume will persist.</p>
          <div className="grid grid-2" style={{ gap: 12 }}>
            <NumberField label="Exemption per decedent" value={inp.exemption} onChange={(v) => set('exemption', v)} min={0} step={500000} prefix="USD" />
            <SliderField label="Flat rate above exemption" value={inp.taxRate} onChange={(v) => set('taxRate', v)} min={0} max={0.6} step={0.01} format={(v) => pct(v, 0)} />
            <SliderField label="Valuation discount (business path)" value={inp.discount} onChange={(v) => set('discount', v)} min={0} max={0.45} step={0.01} format={(v) => pct(v, 0)} />
            <SliderField label="Basis today as % of value" value={inp.basisFraction} onChange={(v) => set('basisFraction', v)} min={0} max={1} step={0.05} format={(v) => pct(v, 0)} />
            <SliderField label="Probate / admin cost (direct)" value={inp.probateCost} onChange={(v) => set('probateCost', v)} min={0} max={0.08} step={0.005} format={(v) => pct(v)} />
            <SliderField label="Trust admin cost per transfer point" value={inp.trustAdminCost} onChange={(v) => set('trustAdminCost', v)} min={0} max={0.03} step={0.0025} format={(v) => pct(v, 2)} />
          </div>
        </Panel>

        <div className="stack" style={{ gap: 14 }}>
          <div className="grid grid-2" style={{ gap: 12 }}>
            <Stat label="Gross value with no tax or cost" value={money(all.direct.grossValue, { compact: true })} sub={`${inp.years} years at ${pct(inp.growth)}`} />
            <Stat label={`Selected: ${PATH_META[sel].title}`} value={money(cur.finalValue, { compact: true })} tone="gold" sub={`${pct(cur.finalValue / cur.grossValue, 0)} of gross retained`} />
          </div>
          <div className="ch13-paths">
            {(['direct', 'trust', 'business'] as Path[]).map((p) => {
              const r = all[p];
              return (
                <div key={p} className={`ch13-path ${sel === p ? 'sel' : ''}`} onClick={() => setSel(p)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSel(p); }} aria-pressed={sel === p}>
                  <h5>{PATH_META[p].title}</h5>
                  <div className="k">Legal owners after 3 generations</div>
                  <div className="big">{r.legalOwners}</div>
                  <div className="ch13-frag" aria-hidden>
                    {p === 'direct' ? Array.from({ length: Math.min(r.legalOwners, 216) }).map((_, i) => <i key={i} />) : <i className={p === 'trust' ? 'one' : 'biz'} />}
                  </div>
                  <div className="ch13-kv">
                    <span className="k">Avg stake</span><span className="v">{pct(averageStake(r.legalOwners), r.legalOwners > 20 ? 1 : 0)}</span>
                    <span className="k">Economic beneficiaries</span><span className="v">{r.ownersAfter}</span>
                    <span className="k">Transfer tax paid</span><span className="v">{money(r.totalTax, { compact: true })}</span>
                    <span className="k">Admin / probate</span><span className="v">{money(r.totalAdmin, { compact: true })}</span>
                    <span className="k">Value at end</span><span className="v">{money(r.finalValue, { compact: true })}</span>
                  </div>
                  <div className="ch13-basis"><strong>Basis:</strong> {r.basisFlag}{r.embeddedGain > 0 && <> · embedded gain {money(r.embeddedGain, { compact: true })}</>}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Panel>
        <div className="row between" style={{ marginBottom: 10 }}>
          <div>
            <Eyebrow>{PATH_META[sel].title} — generation by generation</Eyebrow>
            <p className="small muted" style={{ margin: '4px 0 0' }}>{PATH_META[sel].blurb}</p>
          </div>
          <Link to="/timeline" className="btn sm ghost">Open the 100-Year Timeline →</Link>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Transfer</th><th>Year</th><th className="num">Value before</th><th className="num">Decedents</th><th className="num">Taxable</th><th className="num">Tax</th><th className="num">Admin</th><th className="num">Value after</th><th className="num">Legal owners</th></tr></thead>
            <tbody>
              {cur.steps.map((s) => (
                <tr key={s.gen}>
                  <td>{s.gen === 0 ? 'Funding gift' : `Generation ${s.gen} → ${s.gen + 1}`}</td>
                  <td className="num">{s.year}</td>
                  <td className="num">{money(s.valueBefore, { compact: true })}</td>
                  <td className="num">{s.decedents}</td>
                  <td className="num">{money(s.taxable, { compact: true })}</td>
                  <td className="num" style={{ color: s.tax > 0 ? '#e7a398' : undefined }}>{money(s.tax, { compact: true })}</td>
                  <td className="num">{money(s.adminCost, { compact: true })}</td>
                  <td className="num">{money(s.valueAfter, { compact: true })}</td>
                  <td className="num">{s.owners}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="callout amber small" style={{ marginTop: 14 }}>
          <p style={{ margin: 0 }}><strong>Basis consequence.</strong> {cur.basisDetail}</p>
        </div>
      </Panel>

      <Panel tight>
        <Eyebrow>Assumptions & formulas</Eyebrow>
        <ul className="small muted" style={{ margin: '8px 0 0', paddingLeft: 18, lineHeight: 1.6 }}>
          <li>Three generational transfers at equal intervals of horizon ÷ 3; value grows at the stated rate between transfers: V<sub>before</sub> = V<sub>after,prev</sub> × (1 + g)<sup>years/3</sup>.</li>
          <li><strong>Direct:</strong> at each transfer, decedents = current owners; taxable = max(0, V − exemption × decedents); tax = taxable × rate; admin = V × probate cost; owners multiply by heirs. Basis steps up to V<sub>after</sub> (§1014), so embedded gain is zero.</li>
          <li><strong>Trust:</strong> funding gift at year 0: taxable = max(0, estate − exemption), taxed once; GST exemption assumed fully allocated so later transfers are untaxed (§2631). Admin cost deducted at each transfer point. Basis carries over (§1015); embedded gain = final value − carried basis. In reality gift tax is paid from assets outside the trust; it is shown as a reduction for comparability.</li>
          <li><strong>Business succession:</strong> one successor per generation; taxable = max(0, V × (1 − discount) − exemption); admin = probate cost ÷ 3; basis assumed half carryover (lifetime gifts) and half stepped-up. Buyouts of siblings are assumed funded from the business and are not modelled as leakage.</li>
          <li>Portability of a deceased spouse's unused exemption, state estate taxes, income tax on trust earnings, the 10% remainder tests of charitable vehicles, and §2704 / §2036 inclusion risks are not modelled.</li>
          <li>Exemption and rate are user inputs because the basic exclusion amount is indexed annually and has been reset by legislation (2001, 2010, 2012, 2017, 2025); check current figures before relying on any number.</li>
        </ul>
      </Panel>
      <Disclaimer>Transfer-tax outcomes depend on current law, valuation, the character of each asset, state taxes and the drafting of every instrument. GRATs, installment sales to grantor trusts, SLATs and charitable trusts each add rules this comparator does not model. An estate planning attorney and a tax adviser are required before any of these paths is implemented.</Disclaimer>
    </div>
  );
}
