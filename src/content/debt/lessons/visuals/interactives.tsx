/**
 * Interactive components for Lessons 03, 04 and 05.
 */
import { useMemo, useState } from 'react';
import { analyzeLeverage, buildLoan, ltv, dti, dscr, debtToEquity, interestCoverage, noi, cashOnCash, debtYield, capRate } from '@/lib/finance';
import { useMoney, Chip, SliderField, Disclaimer } from '@/components/ui';
import { pct, ratio } from '@/lib/format';

/* ── L03: financing marketplace ──────────────────────────────────── */
type Cat = 'Personal & property' | 'Business operations' | 'Asset-backed' | 'Growth & transactions';
interface Instrument { name: string; cat: Cat; use: string; cost: string; collateral: string; repayment: string; risks: string; providers: string }
export const INSTRUMENTS: Instrument[] = [
  { name: 'Residential & investment mortgages', cat: 'Personal & property', use: 'Buying or refinancing a home or rental property; the cheapest long-dated credit most households will ever access.', cost: 'Illustrative: low-to-mid single digits over the sovereign curve; investor loans priced above owner-occupied.', collateral: 'First lien (mortgage or deed of trust) on the property; often a personal guarantee on investor loans held in an LLC.', repayment: 'Fully amortizing 15–30 years; some interest-only or adjustable periods; DSCR loans sized on rent rather than borrower income.', risks: 'Payment shock on rate resets, negative equity if values fall, foreclosure on default, due-on-sale clauses when transferring title to an entity.', providers: 'Banks, credit unions, mortgage companies, agency-backed programs (US), Islamic banks offering Murabaha/Ijara structures (UAE).' },
  { name: 'Business term loans', cat: 'Business operations', use: 'A lump sum for a defined purpose: expansion, equipment, a buy-out of a partner.', cost: 'Illustrative: mid-single to low-double digits depending on size, credit and whether government-guaranteed (e.g. SBA 7(a)).', collateral: 'Blanket lien on business assets (UCC-1 in the US); personal guarantee of owners above a threshold; sometimes real estate.', repayment: 'Amortizing 3–10 years; equipment and real estate terms can run longer.', risks: 'Financial covenants (leverage, coverage), fixed charges on a variable business, acceleration on default.', providers: 'Commercial banks, SBA-preferred lenders, community development lenders, online lenders.' },
  { name: 'Lines of credit', cat: 'Business operations', use: 'Smoothing timing gaps between paying suppliers and collecting from customers.', cost: 'Illustrative: variable, index + margin; unused fees are common.', collateral: 'Receivables and inventory (borrowing base), or unsecured for strong credits.', repayment: 'Revolving; interest monthly; annual clean-down or renewal.', risks: 'Renewal risk (the lender can decline to renew), borrowing-base shrinkage in a downturn, using short-term money for long-term assets.', providers: 'Banks, fintech lenders.' },
  { name: 'Revolving consumer credit (cards)', cat: 'Personal & property', use: 'Convenience, float and rewards; useful for building a credit history when paid in full.', cost: 'Illustrative: among the most expensive mainstream credit when balances revolve; near zero when paid monthly.', collateral: 'Unsecured (secured cards hold a deposit).', repayment: 'Minimum payment; interest compounds daily on unpaid balance.', risks: 'High utilization depresses scores; minimum payments stretch repayment over years; penalty rates.', providers: 'Banks, card issuers.' },
  { name: 'Overdrafts', cat: 'Business operations', use: 'Very short-term liquidity on a current account; common in the UK, UAE and CEMAC region for SMEs.', cost: 'Illustrative: high, with fees; often repayable on demand.', collateral: 'Frequently a personal guarantee, cash margin or assignment of receivables.', repayment: 'On demand; interest on daily balance.', risks: 'Bank can cancel at any time; easy to treat permanent working-capital needs as temporary.', providers: 'Banks.' },
  { name: 'Equipment financing & leasing', cat: 'Asset-backed', use: 'Vehicles, machinery, medical or IT equipment where the asset itself is the collateral.', cost: 'Illustrative: mid-to-high single digits; leases priced as implicit rates.', collateral: 'Purchase-money security interest in the equipment; vendor residual guarantees in leases.', repayment: 'Amortizing over useful life (3–7 years); leases with buyout options.', risks: 'Obsolescence before payoff, mismatch between asset life and term, balloon residuals.', providers: 'Captive finance arms of manufacturers, banks, independent lessors.' },
  { name: 'Invoice financing & factoring', cat: 'Asset-backed', use: 'Turning unpaid B2B invoices into cash today.', cost: 'Illustrative: expressed as a discount per 30 days; annualized cost can be high.', collateral: 'The receivables themselves (assignment or outright sale); recourse vs non-recourse factoring.', repayment: 'Self-liquidating when the customer pays.', risks: 'Customer concentration, disputes reducing collectability, recourse obligations if the debtor defaults.', providers: 'Factors, banks, fintech platforms.' },
  { name: 'Trade finance & letters of credit', cat: 'Asset-backed', use: 'Importing and exporting: an LC substitutes the bank’s credit for the buyer’s; documentary collections, supply-chain finance.', cost: 'Illustrative: issuance and confirmation fees plus discount on usance drafts.', collateral: 'Cash margin, the goods and documents of title, general facilities.', repayment: 'At sight or usance (30–180 days).', risks: 'Document discrepancies, FX, counterparty and country risk; critical in CEMAC import businesses.', providers: 'International and regional banks; development finance institutions.' },
  { name: 'Asset-based lending (ABL)', cat: 'Asset-backed', use: 'Larger revolvers sized to a borrowing base of receivables, inventory and equipment with field exams.', cost: 'Illustrative: index + margin, plus monitoring fees.', collateral: 'First lien on current assets; dominion of cash through a lockbox.', repayment: 'Revolving; availability recalculated weekly or monthly.', risks: 'Ineligible receivables and reserves shrink availability exactly when cash is tight.', providers: 'Bank ABL groups, specialty finance companies.' },
  { name: 'Securities-backed lines (SBLOC)', cat: 'Asset-backed', use: 'Borrowing against a brokerage portfolio without selling; liquidity for taxes, purchases or bridging.', cost: 'Illustrative: index + a small margin for diversified, liquid collateral.', collateral: 'Pledged securities with advance rates by asset class.', repayment: 'Interest-only, callable; no fixed maturity.', risks: 'Margin calls when markets fall; forced liquidation at the worst time; not a tax-elimination device — unrealized gains remain embedded.', providers: 'Broker-dealers, private banks.' },
  { name: 'Life insurance policy loans', cat: 'Asset-backed', use: 'Borrowing against cash value of a permanent policy, often within a family liquidity plan.', cost: 'Illustrative: fixed or variable policy loan rate; some contracts credit interest on loaned amounts.', collateral: 'The policy’s cash surrender value.', repayment: 'Flexible; unpaid interest capitalizes into the loan.', risks: 'Policy lapse with a large loan can trigger taxable income; reduces death benefit.', providers: 'The insurer.' },
  { name: 'Private credit / direct lending', cat: 'Growth & transactions', use: 'Larger or more complex borrowers that banks cannot serve quickly: growth, recapitalizations, special situations.', cost: 'Illustrative: materially above bank pricing; floating with floors, OID and fees.', collateral: 'First or second lien on all assets; unitranche structures.', repayment: 'Bullet or light amortization, 3–7 years; PIK toggles in some deals.', risks: 'Tight covenants or covenant-lite with aggressive EBITDA add-backs; lender control in distress.', providers: 'Private credit funds, BDCs, family offices.' },
  { name: 'Seller financing', cat: 'Growth & transactions', use: 'The seller of a business or property carries part of the price as a note.', cost: 'Negotiated; often below market, sometimes with earn-out features.', collateral: 'Subordinated lien on the asset or business; pledge of the acquired shares.', repayment: 'Amortizing or balloon, 3–10 years; may be subordinated to a senior bank.', risks: 'Seller–buyer disputes, subordination fights, set-off claims; for sellers, buyer default returns a damaged asset.', providers: 'The seller; common in SME transfers and in markets with thin bank credit.' },
  { name: 'Mezzanine financing', cat: 'Growth & transactions', use: 'Filling the gap between senior debt and equity in buy-outs and large developments.', cost: 'Illustrative: low-to-mid teens all-in, often cash + PIK + warrants.', collateral: 'Second lien or share pledge; intercreditor agreement with the senior lender.', repayment: 'Bullet at 5–8 years.', risks: 'Expensive if the plan slips; mezz lenders can take control through pledges.', providers: 'Mezzanine funds, insurance companies, family offices.' },
  { name: 'Acquisition finance', cat: 'Growth & transactions', use: 'Debt raised to buy a company or portfolio, repaid from the target’s cash flows.', cost: 'Illustrative: senior bank or term loan B pricing; higher for sponsor-less deals.', collateral: 'All assets and shares of the target; guarantees from acquiring entities.', repayment: 'Term loan A amortizing, term loan B bullet; cash sweeps.', risks: 'Leverage multiple set on peak earnings; integration failure; refinancing wall at maturity.', providers: 'Banks, institutional loan investors, private credit.' },
];
const CATS: Cat[] = ['Personal & property', 'Business operations', 'Asset-backed', 'Growth & transactions'];

export function FinancingMarketplace() {
  const [cat, setCat] = useState<Cat | 'All'>('All');
  const [open, setOpen] = useState<string | null>(null);
  const list = INSTRUMENTS.filter((i) => cat === 'All' || i.cat === cat);
  return (
    <div className="stack" style={{ gap: 12 }}>
      <div className="ds-filter">
        {(['All', ...CATS] as const).map((c) => <button key={c} className={`btn sm ${cat === c ? 'active' : 'ghost'}`} onClick={() => { setCat(c); setOpen(null); }}>{c}</button>)}
        <span className="ds-note" style={{ alignSelf: 'center', marginLeft: 'auto' }}>{list.length} instruments · click a card</span>
      </div>
      <div className="ds-cards">
        {list.map((i) => {
          const isOpen = open === i.name;
          return (
            <button key={i.name} className={`ds-card ${isOpen ? 'open' : ''}`} onClick={() => setOpen(isOpen ? null : i.name)} aria-expanded={isOpen}>
              <div className="row between" style={{ alignItems: 'flex-start' }}>
                <span className="ds-card-title">{i.name}</span>
                <Chip>{i.cat}</Chip>
              </div>
              {!isOpen && <p className="small muted" style={{ margin: '8px 0 0' }}>{i.use}</p>}
              {isOpen && (
                <div className="ds-kv">
                  <span className="k">Use cases</span><span>{i.use}</span>
                  <span className="k">Typical cost</span><span>{i.cost}</span>
                  <span className="k">Collateral</span><span>{i.collateral}</span>
                  <span className="k">Repayment</span><span>{i.repayment}</span>
                  <span className="k">Major risks</span><span style={{ color: '#e7a398' }}>{i.risks}</span>
                  <span className="k">Who provides it</span><span>{i.providers}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      <span className="ds-note">Cost ranges are illustrative descriptions of relative pricing, not quotes. Actual pricing depends on the borrower, collateral, tenor, market conditions and jurisdiction.</span>
    </div>
  );
}

/* ── L04: all-cash vs 70% LTV ────────────────────────────────────── */
export function LeverageCompare() {
  const fmt = useMoney();
  const [appr, setAppr] = useState(0.03);
  const [rate, setRate] = useState(0.065);
  const price = 1_000_000, income = 84_000, expenses = 30_000, hold = 10;
  const common = { price, annualRate: rate, termMonths: 360, structure: 'amortizing' as const, appreciation: appr, operatingIncome: income, operatingExpenses: expenses, inflation: 0.02, transactionCosts: 20_000, borrowingCosts: 0, holdYears: hold };
  const cash = useMemo(() => analyzeLeverage({ ...common, equity: price, loan: 0 }), [appr, rate]); // eslint-disable-line react-hooks/exhaustive-deps
  const lev = useMemo(() => analyzeLeverage({ ...common, equity: 300_000, loan: 700_000, borrowingCosts: 7_000 }), [appr, rate]); // eslint-disable-line react-hooks/exhaustive-deps
  const assetYield = (income - expenses) / price;
  const positive = assetYield > rate;
  const out = lev.leveragedIrrApprox > cash.unleveredIrrApprox;
  const row = (label: string, a: string, b: string, hi?: 'a' | 'b') => (
    <tr><td>{label}</td><td className="num" style={{ color: hi === 'a' ? 'var(--gold-2)' : undefined }}>{a}</td><td className="num" style={{ color: hi === 'b' ? 'var(--gold-2)' : undefined }}>{b}</td></tr>
  );
  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="ds-two">
        <SliderField label="Annual appreciation" value={appr} onChange={setAppr} min={-0.05} max={0.08} step={0.005} format={(v) => pct(v)} />
        <SliderField label="Cost of debt (fixed rate)" value={rate} onChange={setRate} min={0.03} max={0.11} step={0.0025} format={(v) => pct(v, 2)} />
      </div>
      <div className="row" style={{ gap: 8 }}>
        <Chip tone={positive ? 'green' : 'red'}>{positive ? 'Positive leverage' : 'Negative leverage'}: asset yield {pct(assetYield, 2)} vs debt {pct(rate, 2)}</Chip>
        <Chip tone={out ? 'gold' : 'amber'}>{out ? 'Leveraged equity outperforms over 10 years' : 'Leveraged equity underperforms over 10 years'}</Chip>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>{fmt(price, { compact: true })} property · 10-year hold</th><th className="num">All cash</th><th className="num">70% LTV</th></tr></thead>
          <tbody>
            {row('Equity invested (incl. costs)', fmt(cash.totalEquityIn, { compact: true }), fmt(lev.totalEquityIn, { compact: true }))}
            {row('Year-1 NOI', fmt(cash.years[0].noi, { compact: true }), fmt(lev.years[0].noi, { compact: true }))}
            {row('Year-1 debt service', '—', fmt(lev.years[0].debtService, { compact: true }))}
            {row('Year-1 cash flow to equity', fmt(cash.years[0].cashFlow, { compact: true }), fmt(lev.years[0].cashFlow, { compact: true }))}
            {row('Year-1 cash-on-cash', pct(cash.yearOneCashOnCash), pct(lev.yearOneCashOnCash), lev.yearOneCashOnCash > cash.yearOneCashOnCash ? 'b' : 'a')}
            {row('Year-1 DSCR', '—', ratio(lev.yearOneDscr), lev.yearOneDscr < 1.2 ? undefined : 'b')}
            {row('Equity at exit (year 10)', fmt(cash.equityAtExit, { compact: true }), fmt(lev.equityAtExit, { compact: true }))}
            {row('Approx. IRR on equity', pct(cash.unleveredIrrApprox), pct(lev.leveragedIrrApprox), out ? 'b' : 'a')}
          </tbody>
        </table>
      </div>
      <Disclaimer>Gross rent {fmt(income, { compact: true })}, expenses {fmt(expenses, { compact: true })}, 2% inflation on both, 2% transaction costs, 1% lender fees on the loan, no taxes, no vacancy shock, sale at model value with no selling costs. IRR is a bisection on annual flows (`analyzeLeverage` in @/lib/finance). The leveraged case is not recommended by default; move appreciation below the cost of debt and watch what happens to equity.</Disclaimer>
    </div>
  );
}

/* ── L05: ratio cards ────────────────────────────────────────────── */
interface RatioCard { id: string; name: string; who: 'Individual' | 'Business' | 'Property'; formula: string; example: string; result: string; meaning: string; caution: string }
export function RatioCards() {
  const fmt = useMoney();
  const [open, setOpen] = useState<string | null>('ltv');
  const loan = buildLoan({ principal: 700_000, annualRate: 0.065, termMonths: 360, structure: 'amortizing' });
  const n = noi(84_000, 30_000);
  const cards: RatioCard[] = [
    { id: 'ltv', name: 'Loan-to-Value (LTV)', who: 'Property', formula: 'LTV = Loan ÷ Appraised value', example: `${fmt(700_000, { compact: true })} ÷ ${fmt(1_000_000, { compact: true })}`, result: pct(ltv(700_000, 1_000_000), 0), meaning: 'How much of the asset the lender is financing; the inverse of the borrower’s equity cushion.', caution: 'Lenders commonly reference ranges such as 60–80% for stabilized income property, but policies vary with asset type, market and borrower.' },
    { id: 'dti', name: 'Debt-to-Income (DTI)', who: 'Individual', formula: 'DTI = Monthly debt payments ÷ Gross monthly income', example: `${fmt(4_424)} + ${fmt(900)} ÷ ${fmt(14_000)}`, result: pct(dti(4_424 + 900, 14_000), 0), meaning: 'Consumer mortgage underwriting looks at the share of income already committed to debt.', caution: 'US consumer rules (ATR/QM) treat DTI as one factor among several; thresholds differ by program and change over time.' },
    { id: 'dscr', name: 'Debt Service Coverage (DSCR)', who: 'Property', formula: 'DSCR = NOI ÷ Annual debt service', example: `${fmt(n, { compact: true })} ÷ ${fmt(loan.annualDebtService, { compact: true })}`, result: ratio(dscr(n, loan.annualDebtService)), meaning: 'How many times operating income covers principal and interest. Below 1.0× the asset cannot pay its own debt.', caution: 'Lenders commonly reference ranges such as 1.20–1.35× for commercial real estate, but DSCR definitions (what counts as debt service) vary by lender.' },
    { id: 'de', name: 'Debt-to-Equity', who: 'Business', formula: 'D/E = Total liabilities ÷ Shareholders’ equity', example: `${fmt(700_000, { compact: true })} ÷ ${fmt(300_000, { compact: true })}`, result: ratio(debtToEquity(700_000, 300_000)), meaning: 'Capital-structure leverage: how many dollars of creditors’ money sit on top of each dollar of owners’ money.', caution: 'Capital-intensive industries carry structurally higher D/E; compare within an industry, not across.' },
    { id: 'ic', name: 'Interest Coverage', who: 'Business', formula: 'Interest coverage = EBIT ÷ Interest expense', example: `${fmt(180_000, { compact: true })} ÷ ${fmt(45_000, { compact: true })}`, result: ratio(interestCoverage(180_000, 45_000)), meaning: 'Earnings protection against the interest bill alone, before principal. Widely used in corporate covenants.', caution: 'Says nothing about principal maturities; a business can have strong coverage and still face a refinancing wall.' },
    { id: 'noi', name: 'Net Operating Income (NOI)', who: 'Property', formula: 'NOI = Effective gross income − Operating expenses (before debt service and tax)', example: `${fmt(84_000, { compact: true })} − ${fmt(30_000, { compact: true })}`, result: fmt(n, { compact: true }), meaning: 'The property’s income independent of how it is financed. Both DSCR and value (via cap rate) are built on it.', caution: 'Lenders underwrite their own NOI: vacancy allowances, management fees and replacement reserves are often inserted even if the owner pays none.' },
    { id: 'fcf', name: 'Free Cash Flow', who: 'Business', formula: 'FCF = Operating cash flow − Capital expenditures', example: `${fmt(260_000, { compact: true })} − ${fmt(90_000, { compact: true })}`, result: fmt(170_000, { compact: true }), meaning: 'Cash genuinely available to service debt or return to owners after keeping the business running.', caution: 'Growth businesses may show negative FCF while profitable; lenders then look at EBITDA less maintenance capex.' },
    { id: 'amort', name: 'Loan Amortization', who: 'Property', formula: 'Payment = P · r(1+r)ⁿ ÷ ((1+r)ⁿ − 1)', example: `${fmt(700_000, { compact: true })} · 6.5% ÷ 12 · 360 periods`, result: `${fmt(loan.periodicPayment)}/mo`, meaning: 'The schedule by which principal is repaid; longer amortization lowers payments and raises total interest.', caution: 'A 30-year amortization on a 7-year term means a balloon; always ask what balance is due at maturity.' },
    { id: 'coc', name: 'Cash-on-Cash Return', who: 'Property', formula: 'CoC = Annual pre-tax cash flow ÷ Equity invested', example: `(${fmt(n, { compact: true })} − ${fmt(loan.annualDebtService, { compact: true })}) ÷ ${fmt(300_000, { compact: true })}`, result: pct(cashOnCash(n - loan.annualDebtService, 300_000)), meaning: 'The equity investor’s yield from operations alone, ignoring appreciation and amortization.', caution: 'Can be negative on highly leveraged deals even while total return is positive; it is a liquidity measure, not a profitability verdict.' },
    { id: 'dy', name: 'Debt Yield', who: 'Property', formula: 'Debt yield = NOI ÷ Loan amount', example: `${fmt(n, { compact: true })} ÷ ${fmt(700_000, { compact: true })}`, result: pct(debtYield(n, 700_000)), meaning: 'The lender’s return if it owned the asset tomorrow; independent of interest rates and amortization, so it resists cheap-money inflation of loan sizes.', caution: 'Lenders commonly reference ranges such as 8–10% minimums for CMBS-style lending, but policies vary. Compare with cap rate: ' + pct(capRate(n, 1_000_000)) + ' here.' },
  ];
  const [who, setWho] = useState<'All' | RatioCard['who']>('All');
  const list = cards.filter((c) => who === 'All' || c.who === who);
  return (
    <div className="stack" style={{ gap: 12 }}>
      <div className="ds-filter">{(['All', 'Individual', 'Business', 'Property'] as const).map((w) => <button key={w} className={`btn sm ${who === w ? 'active' : 'ghost'}`} onClick={() => setWho(w)}>{w}</button>)}</div>
      <div className="ds-cards">
        {list.map((c) => {
          const isOpen = open === c.id;
          return (
            <button key={c.id} className={`ds-card ${isOpen ? 'open' : ''}`} onClick={() => setOpen(isOpen ? null : c.id)} aria-expanded={isOpen}>
              <div className="row between" style={{ alignItems: 'flex-start' }}><span className="ds-card-title">{c.name}</span><Chip tone={c.who === 'Individual' ? 'blue' : c.who === 'Business' ? 'green' : 'gold'}>{c.who}</Chip></div>
              <div style={{ marginTop: 8 }}><span className="ds-formula">{c.formula}</span></div>
              {isOpen && (
                <div className="ds-kv">
                  <span className="k">Worked example</span><span className="mono small">{c.example} = <strong style={{ color: 'var(--gold-2)' }}>{c.result}</strong></span>
                  <span className="k">What it tells you</span><span>{c.meaning}</span>
                  <span className="k">Caution</span><span style={{ color: 'var(--amber)' }}>{c.caution}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      <span className="ds-note">Worked examples use the studio’s reference property: {fmt(1_000_000, { compact: true })} price, {fmt(700_000, { compact: true })} loan at 6.5% over 30 years, gross rent {fmt(84_000, { compact: true })}, expenses {fmt(30_000, { compact: true })}. All figures computed with @/lib/finance.</span>
    </div>
  );
}
