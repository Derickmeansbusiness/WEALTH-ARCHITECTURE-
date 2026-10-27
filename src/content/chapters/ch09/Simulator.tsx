import { useMemo, useState } from 'react';
import { capRate, cashOnCash, dscr } from '@/lib/finance';
import { pct, ratio } from '@/lib/format';
import { Panel, NumberField, SliderField, SelectField, Stat, Disclaimer, Callout, Chip, useMoney } from '@/components/ui';
import { analyzeRental, DEFAULT_RENTAL, RECOVERY_YEARS, type PropertyClass, type RentalInput } from './rentalTax';

/** Rental property tax architecture calculator: cash flow vs taxable income, and the recapture it builds. */
export default function Simulator() {
  const fmt = useMoney();
  const [input, setInput] = useState<RentalInput>(DEFAULT_RENTAL);
  const set = (patch: Partial<RentalInput>) => setInput((p) => ({ ...p, ...patch }));
  const [viewYear, setViewYear] = useState(1);

  const r = useMemo(() => analyzeRental(input), [input]);
  const yr = Math.min(Math.max(1, viewYear), r.years.length);
  const y = r.years[yr - 1];
  const y1 = r.years[0];
  const equity = Math.max(0, input.purchasePrice - input.loanAmount);
  const last = r.years[r.years.length - 1];
  const suspended = r.years.reduce((s, yy) => s + Math.min(0, yy.taxableIncome), 0);

  return (
    <div className="stack" style={{ gap: 18 }}>
      <Panel>
        <div className="row between" style={{ marginBottom: 12 }}>
          <div>
            <div className="eyebrow">Rental property tax architecture</div>
            <h3 style={{ margin: '4px 0 0' }}>Cash flow is not taxable income, and the difference is a liability</h3>
          </div>
          <Chip tone="amber">Not yet jurisdictionally verified</Chip>
        </div>
        <div className="grid grid-3" style={{ gap: 14 }}>
          <NumberField label="Purchase price" value={input.purchasePrice} onChange={(v) => set({ purchasePrice: v })} min={0} step={10000} prefix="$" />
          <SliderField label="Land share (not depreciable)" value={Math.round(input.landShare * 100)} onChange={(v) => set({ landShare: v / 100 })} min={0} max={80} step={1} format={(v) => `${v}%`} />
          <SelectField<PropertyClass> label="Property class" value={input.propertyClass} onChange={(v) => set({ propertyClass: v })} options={[{ value: 'residential', label: 'Residential rental · 27.5 years' }, { value: 'nonresidential', label: 'Nonresidential · 39 years' }]} />
          <NumberField label="Gross annual rent" value={input.annualRent} onChange={(v) => set({ annualRent: v })} min={0} step={1000} prefix="$" />
          <SliderField label="Vacancy & credit loss" value={Math.round(input.vacancyRate * 100)} onChange={(v) => set({ vacancyRate: v / 100 })} min={0} max={30} step={1} format={(v) => `${v}%`} />
          <NumberField label="Operating expenses (excl. debt)" value={input.annualExpenses} onChange={(v) => set({ annualExpenses: v })} min={0} step={1000} prefix="$" hint="Taxes, insurance, management, repairs, reserves." />
          <NumberField label="Loan amount" value={input.loanAmount} onChange={(v) => set({ loanAmount: Math.min(v, input.purchasePrice) })} min={0} step={10000} prefix="$" hint={`LTV ${pct(input.purchasePrice > 0 ? input.loanAmount / input.purchasePrice : 0, 0)}`} />
          <NumberField label="Interest rate" value={Math.round(input.annualRate * 1000) / 10} onChange={(v) => set({ annualRate: v / 100 })} min={0} max={20} step={0.125} suffix="%" />
          <NumberField label="Amortisation" value={input.termYears} onChange={(v) => set({ termYears: Math.max(1, Math.round(v)) })} min={1} max={40} step={1} suffix="years" />
          <NumberField label="Rent growth" value={Math.round(input.rentGrowth * 1000) / 10} onChange={(v) => set({ rentGrowth: v / 100 })} min={-10} max={15} step={0.5} suffix="%/yr" />
          <NumberField label="Expense growth" value={Math.round(input.expenseGrowth * 1000) / 10} onChange={(v) => set({ expenseGrowth: v / 100 })} min={-10} max={15} step={0.5} suffix="%/yr" />
          <NumberField label="Hold period" value={input.holdYears} onChange={(v) => set({ holdYears: Math.max(1, Math.min(40, Math.round(v))) })} min={1} max={40} step={1} suffix="years" />
        </div>
        <div className="hairline" style={{ margin: '18px 0' }} />
        <div className="eyebrow" style={{ marginBottom: 8 }}>Cost segregation & bonus (optional)</div>
        <div className="grid grid-3" style={{ gap: 14 }}>
          <SliderField label="Building basis reclassified to short-lived property" value={Math.round(input.costSegShare * 100)} onChange={(v) => set({ costSegShare: v / 100 })} min={0} max={40} step={1} format={(v) => `${v}%`} />
          <SelectField label="Recovery period of reclassified property" value={String(input.costSegYears)} onChange={(v) => set({ costSegYears: Number(v) })} options={[{ value: '5', label: '5-year (§1245 personal property)' }, { value: '7', label: '7-year' }, { value: '15', label: '15-year (land improvements)' }]} />
          <SliderField label="Bonus depreciation on reclassified property, year 1" value={Math.round(input.bonusRate * 100)} onChange={(v) => set({ bonusRate: v / 100 })} min={0} max={100} step={10} format={(v) => `${v}%`} />
          <NumberField label="Illustrative marginal ordinary rate" value={Math.round(input.ordinaryRate * 1000) / 10} onChange={(v) => set({ ordinaryRate: v / 100 })} min={0} max={60} step={0.5} suffix="%" hint="Used only to illustrate tax on positive taxable income." />
        </div>
        <p className="tiny muted" style={{ marginTop: 8, marginBottom: 0 }}>The bonus percentage under IRC §168(k) has changed several times since 2017 and depends on the acquisition date. Enter the figure that applies to your facts; a cost segregation study by a qualified engineer is the basis for any reclassification.</p>
      </Panel>

      <div className="grid grid-4" style={{ gap: 12 }}>
        <Stat label="NOI · year 1" value={fmt(y1.noi)} sub={`cap rate ${pct(capRate(y1.noi, input.purchasePrice), 2)}`} />
        <Stat label="Cash flow after debt · year 1" value={fmt(y1.cashFlow)} tone={y1.cashFlow >= 0 ? 'green' : 'red'} sub={`cash-on-cash ${pct(cashOnCash(y1.cashFlow, equity), 1)} · DSCR ${ratio(dscr(y1.noi, y1.debtService))}`} />
        <Stat label="Depreciation · year 1" value={fmt(y1.depreciation)} tone="gold" sub={`${fmt(r.structuralBasis, { compact: true })} ÷ ${RECOVERY_YEARS[input.propertyClass]} yrs${r.segregatedBasis > 0 ? ' + segregated' : ''}`} />
        <Stat label="Taxable income · year 1" value={fmt(y1.taxableIncome)} tone={y1.taxableIncome < 0 ? 'amber' : undefined} sub={y1.taxableIncome < 0 ? 'passive loss · likely suspended under §469' : `illustrative tax ${fmt(y1.illustrativeTax)}`} />
      </div>

      <Panel>
        <SliderField label="Show year" value={yr} onChange={setViewYear} min={1} max={r.years.length} step={1} format={(v) => `Year ${v}`} />
        <div className="ch09-twocol" style={{ marginTop: 8 }}>
          <div className="ch09-col">
            <h4>Cash flow · year {yr}</h4>
            <div className="line green"><span>Effective rent (after vacancy)</span><span className="v">{fmt(y.effectiveRent)}</span></div>
            <div className="line red"><span>Operating expenses</span><span className="v">−{fmt(y.expenses)}</span></div>
            <div className="line"><span>Net operating income</span><span className="v">{fmt(y.noi)}</span></div>
            <div className="line red"><span>Interest paid</span><span className="v">−{fmt(y.interest)}</span></div>
            <div className="line red"><span>Principal paid (cash, not deductible)</span><span className="v">−{fmt(y.principal)}</span></div>
            <div className="line total green"><span>Cash flow before tax</span><span className="v">{fmt(y.cashFlow)}</span></div>
          </div>
          <div className="ch09-col">
            <h4>Taxable income · year {yr}</h4>
            <div className="line green"><span>Effective rent</span><span className="v">{fmt(y.effectiveRent)}</span></div>
            <div className="line red"><span>Operating expenses</span><span className="v">−{fmt(y.expenses)}</span></div>
            <div className="line"><span>Net operating income</span><span className="v">{fmt(y.noi)}</span></div>
            <div className="line red"><span>Interest deduction</span><span className="v">−{fmt(y.interest)}</span></div>
            <div className="line violet"><span>Depreciation (deduction, no cash)</span><span className="v">−{fmt(y.depreciation)}</span></div>
            <div className={`line total ${y.taxableIncome < 0 ? 'violet' : 'gold'}`}><span>Taxable income (loss)</span><span className="v">{fmt(y.taxableIncome)}</span></div>
          </div>
        </div>
        <div className="grid grid-3" style={{ gap: 12, marginTop: 14 }}>
          <Stat label="Gap: cash flow − taxable income" value={fmt(y.cashFlow - y.taxableIncome)} tone="gold" sub="= depreciation − principal" />
          <Stat label={`Accumulated depreciation · end of year ${yr}`} value={fmt(y.accumulatedDepreciation)} tone="amber" sub={r.segregatedBasis > 0 ? `§1250: ${fmt(y.accumulated1250, { compact: true })} · §1245: ${fmt(y.accumulated1245, { compact: true })}` : 'unrecaptured §1250 gain on sale, taxed up to 25%'} />
          <Stat label={`Adjusted basis · end of year ${yr}`} value={fmt(input.purchasePrice - y.accumulatedDepreciation)} sub="price − accumulated depreciation (ignores improvements and costs)" />
        </div>
      </Panel>

      <Panel>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Year by year</div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Yr</th><th className="num">NOI</th><th className="num">Debt service</th><th className="num">Cash flow</th><th className="num">Depreciation</th><th className="num">Taxable</th><th className="num">Illustr. tax</th><th className="num">Recapture exposure</th><th className="num">Loan balance</th></tr></thead>
            <tbody>
              {r.years.map((yy) => (
                <tr key={yy.year}>
                  <td className="mono">{yy.year}</td>
                  <td className="num">{fmt(yy.noi, { compact: true })}</td>
                  <td className="num">{fmt(yy.debtService, { compact: true })}</td>
                  <td className="num" style={{ color: yy.cashFlow >= 0 ? 'var(--green-2)' : '#e7a398' }}>{fmt(yy.cashFlow, { compact: true })}</td>
                  <td className="num" style={{ color: '#b7adda' }}>{fmt(yy.depreciation, { compact: true })}</td>
                  <td className="num" style={{ color: yy.taxableIncome < 0 ? 'var(--amber)' : undefined }}>{fmt(yy.taxableIncome, { compact: true })}</td>
                  <td className="num">{fmt(yy.illustrativeTax, { compact: true })}</td>
                  <td className="num" style={{ color: 'var(--amber)' }}>{fmt(yy.accumulatedDepreciation, { compact: true })}</td>
                  <td className="num">{fmt(yy.loanBalance, { compact: true })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid grid-3" style={{ gap: 12, marginTop: 14 }}>
          <Stat label={`Total cash flow · ${r.years.length} yrs`} value={fmt(r.totalCashFlow, { compact: true })} tone="green" />
          <Stat label="Total taxable income (loss)" value={fmt(r.totalTaxableIncome, { compact: true })} sub={suspended < 0 ? `${fmt(-suspended, { compact: true })} of losses would be passive and suspended unless §469 exceptions apply` : 'positive in every year'} />
          <Stat label="Recapture exposure at exit" value={fmt(last.accumulatedDepreciation, { compact: true })} tone="amber" sub="deferred by §1031 · erased only by §1014 step-up" />
        </div>
      </Panel>

      <Callout tone="amber" title="What this calculator does not claim">
        <p className="small" style={{ margin: 0 }}>
          It does not show tax being eliminated. It shows tax being <strong>timed</strong>: depreciation moves taxable income out of the holding years and into the year of sale as recapture, and the passive activity rules may suspend losses until there is passive income or a disposition. Whether any of this helps depends on your other income, your participation hours, your exit plan and your state.
        </p>
      </Callout>

      <Panel tight>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Assumptions & formulas</div>
        <ul className="small muted" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
          <li>Effective rent = gross rent × (1 − vacancy). NOI = effective rent − operating expenses. Cash flow = NOI − debt service. Taxable income = NOI − interest − depreciation.</li>
          <li>Depreciation is straight-line over 27.5 years (residential rental) or 39 years (nonresidential) on the building basis (price × (1 − land share)), full years with the fractional half-year at the end. The real rules use a mid-month convention in the first and last year (IRC §168(b)(3), (c), (d)(2)); closing costs and later capital improvements are excluded.</li>
          <li>Optional cost segregation reclassifies a share of building basis to 5-, 7- or 15-year property with user-set bonus depreciation in year one and straight-line thereafter; real MACRS uses declining-balance methods and a half-year or mid-quarter convention for that property.</li>
          <li>Loan is fully amortising, monthly, via <code className="mono">buildLoan</code>; annual interest and principal from <code className="mono">annualize</code>.</li>
          <li>Illustrative tax = max(0, taxable income) × marginal rate. Losses are not refunded: they are shown as the amount that would be passive and suspended under §469 absent the $25,000 active-participation allowance, real estate professional status or passive income from other activities.</li>
          <li>Recapture exposure = accumulated depreciation. On sale, the §1250 portion is taxed at up to 25% as unrecaptured §1250 gain and the §1245 portion at ordinary rates; the 3.8% net investment income tax, state tax and appreciation above original cost (long-term capital gain) are not modelled.</li>
          <li>No appreciation, sale costs, refinancing, QBI deduction, state or local tax, or transfer taxes.</li>
        </ul>
      </Panel>
      <Disclaimer>
        Depreciation schedules, cost segregation, passive-loss treatment, §1031 deadlines and recapture rates each turn on facts and on current law, which has changed repeatedly for bonus depreciation. Property-level tax planning needs a CPA familiar with real estate, and a qualified intermediary and counsel for any exchange.
      </Disclaimer>
    </div>
  );
}
