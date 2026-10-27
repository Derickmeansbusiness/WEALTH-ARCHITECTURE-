import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eyebrow, Stat, SliderField, NumberField, Disclaimer, Callout, useMoney, Chip } from '@/components/ui';
import { pct, ratio } from '@/lib/format';
import { analyzeLeverage, type LeverageInput } from '@/lib/finance';

export default function Simulator() {
  const [price, setPrice] = useState(1_000_000);
  const [noiPct, setNoiPct] = useState(6.5);
  const [ltv, setLtv] = useState(70);
  const [rate, setRate] = useState(6.75);
  const [appreciation, setAppreciation] = useState(3);
  const [hold, setHold] = useState(5);
  const fmt = useMoney();

  const { cash, lev, loan } = useMemo(() => {
    const operatingIncome = price * (noiPct / 100) + price * 0.031;
    const operatingExpenses = price * 0.031;
    const loanAmt = price * (ltv / 100);
    const base: Omit<LeverageInput, 'equity' | 'loan' | 'borrowingCosts'> = {
      price, annualRate: rate / 100, termMonths: 300, structure: 'amortizing', appreciation: appreciation / 100,
      operatingIncome, operatingExpenses, inflation: 0.02, transactionCosts: price * 0.025, holdYears: hold,
    };
    const cash = analyzeLeverage({ ...base, equity: price, loan: 0, borrowingCosts: 0 });
    const lev = analyzeLeverage({ ...base, equity: price - loanAmt, loan: loanAmt, borrowingCosts: loanAmt * 0.015 });
    return { cash, lev, loan: loanAmt };
  }, [price, noiPct, ltv, rate, appreciation, hold]);

  const levWins = lev.leveragedIrrApprox > cash.unleveredIrrApprox;
  const capRate = noiPct / 100;
  const debtConstant = loan > 0 ? lev.loan.annualDebtService / loan : 0;
  const positive = capRate > debtConstant;
  const lastLev = lev.years[lev.years.length - 1];
  const lastCash = cash.years[cash.years.length - 1];
  const eqChangeLev = lastLev ? (lastLev.equity - lev.totalEquityIn) / lev.totalEquityIn : 0;
  const eqChangeCash = lastCash ? (lastCash.assetValue - cash.totalEquityIn) / cash.totalEquityIn : 0;

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="row between">
        <div><Eyebrow>Leverage comparison</Eyebrow><h4 style={{ margin: '4px 0 0' }}>All cash versus {ltv}% LTV. Drag appreciation both ways.</h4></div>
        <Link to="/debt-credit-studio" className="btn sm">Full studio: stress tests, capital stacks, family lending →</Link>
      </div>
      <div className="acad-sim">
        <div className="stack" style={{ gap: 12 }}>
          <NumberField label="Purchase price (USD)" value={price} onChange={setPrice} step={50_000} min={100_000} />
          <SliderField label="Cap rate (NOI ÷ price)" value={noiPct} min={3} max={10} step={0.25} onChange={setNoiPct} format={(v) => `${v.toFixed(2)}%`} />
          <SliderField label="Loan-to-value" value={ltv} min={30} max={85} step={5} onChange={setLtv} format={(v) => `${v}%`} />
          <SliderField label="Interest rate (25-yr amortizing)" value={rate} min={3} max={11} step={0.25} onChange={setRate} format={(v) => `${v.toFixed(2)}%`} />
          <SliderField label="Annual appreciation" value={appreciation} min={-8} max={10} step={0.5} onChange={setAppreciation} format={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`} />
          <SliderField label="Hold period" value={hold} min={1} max={15} step={1} onChange={setHold} format={(v) => `${v} yrs`} />
          <div className={`acad-flag ${positive ? 'green' : 'red'}`}>
            <span className="dot" style={{ marginTop: 6, color: positive ? 'var(--green-2)' : 'var(--red)' }} />
            <div><strong>{positive ? 'Positive leverage' : 'Negative leverage'}</strong><div className="small muted">Cap rate {pct(capRate)} vs loan constant {pct(debtConstant)} (annual debt service ÷ loan). {positive ? 'The asset earns more than the debt costs before appreciation.' : 'Every borrowed dollar loses money before appreciation; the case rests entirely on price growth.'}</div></div>
          </div>
        </div>

        <div className="stack" style={{ gap: 14 }}>
          <div className="grid grid-2" style={{ gap: 12 }}>
            <div className="panel tight" style={{ borderColor: !levWins ? 'rgba(62,160,118,0.45)' : undefined }}>
              <div className="row between"><Eyebrow>All cash</Eyebrow>{!levWins && <Chip tone="green">higher return</Chip>}</div>
              <div className="stack" style={{ gap: 8, marginTop: 10 }}>
                <Stat label="Equity in" value={fmt(cash.totalEquityIn, { compact: true })} sub="price + 2.5% closing" />
                <Stat label="Year-1 cash flow" value={fmt(cash.years[0]?.cashFlow ?? 0, { compact: true })} sub={`${pct(cash.yearOneCashOnCash)} cash-on-cash`} />
                <Stat label={`Equity after ${hold} yrs`} value={fmt(lastCash?.assetValue ?? 0, { compact: true })} sub={`${eqChangeCash >= 0 ? '+' : ''}${pct(eqChangeCash, 0)} vs equity in`} tone={eqChangeCash >= 0 ? 'green' : 'red'} />
                <Stat label="Approx. IRR" value={pct(cash.unleveredIrrApprox)} tone="gold" sub="cash flow + exit value" />
                <Stat label="Forced-sale risk" value="None" tone="green" sub="no lender, no covenant" />
              </div>
            </div>
            <div className="panel tight" style={{ borderColor: levWins ? 'rgba(201,169,97,0.45)' : 'rgba(194,90,76,0.45)' }}>
              <div className="row between"><Eyebrow>{ltv}% LTV</Eyebrow>{levWins ? <Chip tone="gold">higher return</Chip> : <Chip tone="red">underperforms</Chip>}</div>
              <div className="stack" style={{ gap: 8, marginTop: 10 }}>
                <Stat label="Equity in" value={fmt(lev.totalEquityIn, { compact: true })} sub={`+ ${fmt(loan, { compact: true })} loan · 1.5% lender fees`} />
                <Stat label="Year-1 cash flow" value={fmt(lev.years[0]?.cashFlow ?? 0, { compact: true })} sub={`${pct(lev.yearOneCashOnCash)} cash-on-cash · DSCR ${ratio(lev.yearOneDscr)}`} tone={lev.yearOneDscr < 1 ? 'red' : lev.yearOneDscr < 1.2 ? 'amber' : undefined} />
                <Stat label={`Equity after ${hold} yrs`} value={fmt(lastLev?.equity ?? 0, { compact: true })} sub={`${eqChangeLev >= 0 ? '+' : ''}${pct(eqChangeLev, 0)} vs equity in · LTV ${pct(lastLev?.ltv ?? 0, 0)}`} tone={eqChangeLev >= 0 ? 'green' : 'red'} />
                <Stat label="Approx. IRR" value={pct(lev.leveragedIrrApprox)} tone={levWins ? 'gold' : 'red'} sub="cash flow + exit equity" />
                <Stat label="Forced-sale risk" value={lev.yearOneDscr < 1 ? 'High' : (lastLev?.ltv ?? 0) > 0.8 ? 'Elevated' : 'Covenant-dependent'} tone={lev.yearOneDscr < 1 ? 'red' : (lastLev?.ltv ?? 0) > 0.8 ? 'amber' : undefined} sub="debt service continues when rent does not" />
              </div>
            </div>
          </div>

          {/* year-by-year equity bars */}
          <div className="panel tight">
            <Eyebrow>Equity path, year by year</Eyebrow>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${hold}, 1fr)`, gap: 6, alignItems: 'end', height: 120, marginTop: 10 }}>
              {lev.years.map((y, i) => {
                const c = cash.years[i];
                const maxV = Math.max(...cash.years.map((x) => x.assetValue), 1);
                return (
                  <div key={y.year} style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: '100%' }} title={`Year ${y.year}: all-cash equity ${fmt(c.assetValue, { compact: true })}, levered equity ${fmt(y.equity, { compact: true })}`}>
                    <div style={{ flex: 1, height: `${(c.assetValue / maxV) * 100}%`, background: 'rgba(62,160,118,0.5)', borderRadius: 3, transition: 'height 0.4s' }} />
                    <div style={{ flex: 1, height: `${Math.max(0, y.equity) / maxV * 100}%`, background: y.equity < 0 ? 'var(--red)' : 'var(--gold)', borderRadius: 3, transition: 'height 0.4s' }} />
                  </div>
                );
              })}
            </div>
            <div className="row" style={{ gap: 14, marginTop: 8 }}>
              <span className="tiny muted"><span style={{ display: 'inline-block', width: 10, height: 10, background: 'rgba(62,160,118,0.5)', borderRadius: 2, marginRight: 6 }} />all-cash equity (= asset value)</span>
              <span className="tiny muted"><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--gold)', borderRadius: 2, marginRight: 6 }} />levered equity (value − loan balance)</span>
            </div>
          </div>

          {appreciation < 0 && (
            <Callout tone="danger" title="Leverage in reverse">
              <p className="small" style={{ margin: 0 }}>With values falling {Math.abs(appreciation).toFixed(1)}% a year, the all-cash buyer loses {pct(Math.abs(eqChangeCash), 0)} of equity over {hold} years and the levered buyer loses {pct(Math.abs(Math.min(0, eqChangeLev)), 0)}{(lastLev?.equity ?? 0) < 0 ? ', and now owes more than the building is worth' : ''}. The debt did not fall with the price.</p>
            </Callout>
          )}
          {levWins && lev.yearOneDscr < 1.2 && (
            <Callout tone="amber" title="Higher return, thinner margin">
              <p className="small" style={{ margin: 0 }}>The levered case shows a higher IRR, but a DSCR of {ratio(lev.yearOneDscr)} means a modest vacancy turns cash flow negative while debt service continues. This simulator does not recommend the levered case; it shows the price of its upside.</p>
            </Callout>
          )}

          <div className="acad-formula">{`Annual debt service = PMT(rate/12, 300, loan) × 12
DSCR = NOI ÷ annual debt service        LTV = loan ÷ value
Cash-on-cash = year-1 cash flow ÷ total equity in (incl. closing & lender fees)
Equity_t = value_t − loan balance_t      value_t = price × (1 + appreciation)^t
Loan constant = annual debt service ÷ loan  (leverage positive when cap rate > loan constant)
IRR solves: −equity in + Σ cash flow_t/(1+r)^t + exit equity/(1+r)^T = 0

Assumptions: NOI grows 2%/yr with expenses at 3.1% of price; 2.5% closing costs; 1.5% lender fees; 25-year amortizing loan; no tax, no capex reserve, no refinancing.`}</div>
          <Disclaimer>This comparison uses the shared finance library and round assumptions. It ignores income tax, depreciation, capital expenditure, refinancing, prepayment penalties and the lender's covenants, all of which matter. A higher projected IRR is not a recommendation to borrow; the right amount of leverage depends on reserves, other cash flow, guarantee terms and what happens in the bad year.</Disclaimer>
        </div>
      </div>
    </div>
  );
}
