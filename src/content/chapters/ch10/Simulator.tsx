import { useMemo, useState } from 'react';
import { pct } from '@/lib/format';
import { Panel, NumberField, SliderField, Stat, Disclaimer, Callout, Chip, useMoney } from '@/components/ui';
import { DEFAULT_LIQUIDITY, comparePremiums, liquidityGap, type LiquidityInput } from './liquidity';

/** Liquidity at Death: how much cash the estate will owe, how much it will have, and what a death benefit would cover. */
export default function Simulator() {
  const fmt = useMoney();
  const [i, setI] = useState<LiquidityInput>(DEFAULT_LIQUIDITY);
  const set = (patch: Partial<LiquidityInput>) => setI((p) => ({ ...p, ...patch }));
  const [termAnnual, setTermAnnual] = useState(18_000);
  const [termYears, setTermYears] = useState(20);
  const [permAnnual, setPermAnnual] = useState(140_000);
  const [horizon, setHorizon] = useState(30);
  const [altReturn, setAltReturn] = useState(5);
  const [benefit, setBenefit] = useState(0);

  const r = useMemo(() => liquidityGap(i), [i]);
  const db = benefit > 0 ? benefit : r.gap;
  const coverage = r.gap > 0 ? Math.min(1, db / r.gap) : 1;
  const cmp = useMemo(() => comparePremiums(termAnnual, termYears, permAnnual, horizon, altReturn / 100), [termAnnual, termYears, permAnnual, horizon, altReturn]);
  const needW = r.totalCashNeed > 0 ? 100 : 0;
  const liqW = r.totalCashNeed > 0 ? Math.min(100, (r.availableLiquidity / r.totalCashNeed) * 100) : 100;
  const dbW = r.totalCashNeed > 0 ? Math.min(100 - liqW, (db / r.totalCashNeed) * 100) : 0;

  return (
    <div className="stack" style={{ gap: 18 }}>
      <Panel>
        <div className="row between" style={{ marginBottom: 12 }}>
          <div>
            <div className="eyebrow">Liquidity at death</div>
            <h3 style={{ margin: '4px 0 0' }}>What the estate owes in cash, and what it has</h3>
          </div>
          <Chip tone="amber">Exemptions and rates change · user-entered</Chip>
        </div>
        <div className="grid grid-3" style={{ gap: 14 }}>
          <NumberField label="Gross estate value" value={i.estateValue} onChange={(v) => set({ estateValue: v })} min={0} step={500000} prefix="$" />
          <SliderField label="Illiquid share (business, real estate, private funds)" value={Math.round(i.illiquidShare * 100)} onChange={(v) => set({ illiquidShare: v / 100 })} min={0} max={100} step={1} format={(v) => `${v}%`} />
          <NumberField label="Exemption & deductions you expect to apply" value={i.exemptionApplied} onChange={(v) => set({ exemptionApplied: v })} min={0} step={500000} prefix="$" hint="Federal and state exemptions are indexed and legislated; marital and charitable deductions depend on the plan. Enter your advisers' estimate." />
          <SliderField label="Effective transfer tax rate on the taxable base" value={Math.round(i.transferTaxRate * 100)} onChange={(v) => set({ transferTaxRate: v / 100 })} min={0} max={60} step={1} format={(v) => `${v}%`} />
          <SliderField label="Settlement costs (legal, appraisal, administration)" value={Math.round(i.settlementCostRate * 1000) / 10} onChange={(v) => set({ settlementCostRate: v / 100 })} min={0} max={8} step={0.5} format={(v) => `${v.toFixed(1)}%`} />
          <NumberField label="Cash obligations at death" value={i.cashObligations} onChange={(v) => set({ cashObligations: v })} min={0} step={100000} prefix="$" hint="Debts called, buy-sell purchase price, equalisation bequests to heirs who do not receive the business." />
          <NumberField label="Existing death benefit outside the estate" value={i.existingDeathBenefit} onChange={(v) => set({ existingDeathBenefit: v })} min={0} step={100000} prefix="$" hint="Policies already held by an ILIT or other owner." />
        </div>
      </Panel>

      <div className="grid grid-4" style={{ gap: 12 }}>
        <Stat label="Total cash need at death" value={fmt(r.totalCashNeed, { compact: true })} tone="red" sub={`tax ${fmt(r.transferTax, { compact: true })} · costs ${fmt(r.settlementCosts, { compact: true })} · obligations ${fmt(i.cashObligations, { compact: true })}`} />
        <Stat label="Liquidity available" value={fmt(r.availableLiquidity, { compact: true })} tone="green" sub={`liquid assets ${fmt(r.liquidAssets, { compact: true })} + existing cover`} />
        <Stat label="Liquidity gap" value={fmt(r.gap, { compact: true })} tone={r.gap > 0 ? 'amber' : 'green'} sub={r.gap > 0 ? `${pct(r.forcedSaleShare, 0)} of illiquid assets would have to be sold` : 'no forced sale on these assumptions'} />
        <Stat label="Death benefit to close the gap" value={fmt(r.gap, { compact: true })} tone="gold" sub="before policy costs and any growth in the estate" />
      </div>

      <Panel>
        <div className="row between" style={{ marginBottom: 8 }}>
          <div className="eyebrow">Coverage picture</div>
          <NumberField label="Death benefit to test (0 = size to gap)" value={benefit} onChange={setBenefit} min={0} step={250000} prefix="$" />
        </div>
        <div className="ch10-gapbar" role="img" aria-label="Cash need covered by liquidity, death benefit and remaining gap">
          <div style={{ width: `${liqW}%`, background: 'var(--green-2)' }} />
          <div style={{ width: `${dbW}%`, background: 'var(--gold)' }} />
          <div style={{ width: `${Math.max(0, needW - liqW - dbW)}%`, background: 'var(--red)', opacity: 0.7 }} />
        </div>
        <div className="ch10-gaplegend">
          <span style={{ ['--c' as string]: 'var(--green-2)' }}>existing liquidity {fmt(r.availableLiquidity, { compact: true })}</span>
          <span style={{ ['--c' as string]: 'var(--gold)' }}>death benefit {fmt(db, { compact: true })} ({pct(coverage, 0)} of gap)</span>
          <span style={{ ['--c' as string]: 'var(--red)' }}>uncovered {fmt(Math.max(0, r.gap - db), { compact: true })}</span>
        </div>
        <p className="small muted" style={{ marginTop: 10, marginBottom: 0 }}>
          For the benefit to arrive outside the estate the policy must be owned by someone other than the insured — typically an irrevocable life insurance trust — with no incidents of ownership retained (§2042) and, for a transferred policy, three years elapsed (§2035). The trust then lends to or buys assets from the estate; it does not simply hand cash to the executor.
        </p>
      </Panel>

      <Panel>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Term vs permanent · premium illustration (your quotes, not ours)</div>
        <div className="grid grid-3" style={{ gap: 14 }}>
          <NumberField label="Term annual premium" value={termAnnual} onChange={setTermAnnual} min={0} step={500} prefix="$" />
          <NumberField label="Term length" value={termYears} onChange={(v) => setTermYears(Math.max(0, Math.round(v)))} min={0} max={40} step={1} suffix="years" />
          <NumberField label="Permanent annual premium" value={permAnnual} onChange={setPermAnnual} min={0} step={1000} prefix="$" />
          <NumberField label="Planning horizon (years to expected death)" value={horizon} onChange={(v) => setHorizon(Math.max(1, Math.round(v)))} min={1} max={60} step={1} suffix="years" />
          <NumberField label="Alternative return on the premium difference" value={altReturn} onChange={setAltReturn} min={0} max={15} step={0.5} suffix="%" />
        </div>
        <div className="grid grid-3" style={{ gap: 12, marginTop: 14 }}>
          <Stat label={`Term premiums · ${cmp.termCoverageYears} yrs covered`} value={fmt(cmp.termTotal, { compact: true })} sub={cmp.termCoverageYears < horizon ? `no coverage in years ${cmp.termCoverageYears + 1}–${horizon} unless renewed or converted` : 'covers the full horizon'} tone={cmp.termCoverageYears < horizon ? 'amber' : 'green'} />
          <Stat label={`Permanent premiums · ${horizon} yrs`} value={fmt(cmp.permanentTotal, { compact: true })} sub="coverage for the whole horizon; cash value builds inside" />
          <Stat label="Premium difference invested elsewhere" value={fmt(cmp.extraPremiumGrownElsewhere, { compact: true })} tone="gold" sub="the opportunity cost a permanent policy must justify through guaranteed coverage and tax treatment" />
        </div>
        <p className="small muted" style={{ marginTop: 10, marginBottom: 0 }}>
          The honest comparison is not premium against premium. Term is cheap because it usually expires before death; permanent is expensive because it usually does not. If the liquidity need is certain to exist at death (estate tax on an illiquid business that will not be sold), the question is whether the permanent policy's internal return to the expected date of death beats the alternative, after its costs. If the need is temporary (a mortgage, young children, a buy-sell during a transition), term usually wins. Neither answer comes from this panel; it comes from illustrations stress-tested by a fee-only adviser.
        </p>
      </Panel>

      <Callout tone="amber" title="What this does not do">
        <p className="small" style={{ margin: 0 }}>
          It does not recommend a product, estimate your exemption, or model the growth of the estate between now and death (which usually widens the gap). It does not treat policy loans as income or cash value as a free asset: a loan against cash value is debt that accrues interest and reduces the death benefit.
        </p>
      </Callout>

      <Panel tight>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Assumptions & formulas</div>
        <ul className="small muted" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
          <li>Liquid assets = estate × (1 − illiquid share). Taxable base = max(0, estate − exemption & deductions entered). Transfer tax = taxable base × rate entered (a single effective rate; the real computation is graduated, includes state estate or inheritance tax where applicable, and depends on prior taxable gifts and portability).</li>
          <li>Settlement costs = estate × cost rate. Total cash need = tax + settlement costs + cash obligations. Available liquidity = liquid assets + existing death benefit outside the estate. Gap = max(0, need − available). Forced-sale share = gap ÷ illiquid assets.</li>
          <li>Death benefit to close the gap is set equal to the gap; a real policy is sized above it for estate growth, premium financing and the trust's own costs.</li>
          <li>Premium comparison: term total = annual premium × min(term, horizon); permanent total = annual premium × horizon; the difference each year is compounded at the alternative return. No cash value, dividends, lapse, conversion or underwriting change is modelled; premiums are whatever you enter.</li>
          <li>Federal estate tax deferral under §6166 for closely held businesses, Graegin-style loans to the estate, and redemption under §303 are alternatives to insurance not modelled here.</li>
        </ul>
      </Panel>
      <Disclaimer>
        Insurance sizing depends on current exemption amounts, state law, the estate plan's marital and charitable provisions, the insured's health and the policy's actual guarantees. Decisions about coverage, ownership (ILIT), funding (Crummey gifts, premium financing) and buy-sell design require estate counsel, a CPA and an insurance adviser whose compensation you understand.
      </Disclaimer>
    </div>
  );
}
