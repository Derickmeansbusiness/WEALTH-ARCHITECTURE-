import type { Slide } from '@/types/present';
import { chapterById } from '@/content/chapters/manifest';
import { money, ratio, pct } from '@/lib/format';
import { buildLoan, dscr } from '@/lib/finance';
import { BarChart, Glass, Reveal } from '../visuals';
import { sectionCard, conceptSlide, diagramSlide, numbersSlide, misconceptionSlide, takeawaySlide } from './factories';

const ch = chapterById('ch04')!;
const M = (v: number) => money(v, { compact: true });

/** Leverage amplifier: equity return at three loan-to-value levels, in an up year and a down year. */
const PRICE = 1_000_000, NOI = 60_000, RATE = 0.06;
const scenario = (ltv: number, appreciation: number) => {
  const loan = PRICE * ltv, equity = PRICE - loan, interest = loan * RATE;
  return (NOI - interest + PRICE * appreciation) / equity;
};
const LTVS = [0, 0.5, 0.75];

function Diagram({ step }: { step: number; active: boolean }) {
  const up = LTVS.map((l) => ({ label: `${pct(l, 0)} LTV`, value: Math.round(scenario(l, 0.10) * 1000) / 10, tone: 'green' as const, sub: 'asset +10%' }));
  const down = LTVS.map((l) => ({ label: `${pct(l, 0)} LTV`, value: Math.round(scenario(l, -0.10) * 1000) / 10, tone: 'red' as const, sub: 'asset −10%' }));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 420px', gap: 40, height: '100%', alignItems: 'center' }}>
      <div>
        <div className="present-eyebrow" style={{ marginBottom: 10 }}>Return on equity · good year</div>
        <BarChart bars={up} shown={step >= 0 ? 3 : 0} format={(v) => `${v}%`} max={50} width={560} height={520} />
      </div>
      <Reveal on={step >= 1}>
        <div className="present-eyebrow" style={{ marginBottom: 10 }}>Return on equity · bad year</div>
        <BarChart bars={down} shown={step >= 1 ? 3 : 0} format={(v) => `${v}%`} max={50} width={560} height={520} />
      </Reveal>
      <Glass tone={step >= 2 ? 'amber' : 'gold'} on={step >= 2}>
        <div className="present-kicker" style={{ color: 'var(--amber)' }}>The amplifier works both ways</div>
        <p style={{ fontSize: 23 }}>At 75% LTV, interest alone is {M(PRICE * 0.75 * RATE)} against {M(NOI)} of NOI: a debt-service coverage of {ratio(dscr(NOI, PRICE * 0.75 * RATE), 2)}. One bad year and the equity is down a third. Leverage is a decision about how much of a bad year you can survive.</p>
      </Glass>
    </div>
  );
}

const LOAN = buildLoan({ principal: 1_000_000, annualRate: 0.06, termMonths: 300, structure: 'amortizing' });

/** Fallback Chapter 04 used only when the Debt & Credit Studio deck is empty at runtime. */
export const ch04Fallback: Slide[] = [
  sectionCard(ch, 'Debt is a financing instrument, not a strategy.', [
    'Set the tone immediately: this course neither celebrates nor fears debt. It treats borrowing as an instrument with a cost, a covenant and a maturity.',
  ]),
  conceptSlide(ch, 'concept', 'When borrowing builds and when it breaks', [
    { title: 'Three conditions, all required', body: 'A productive asset, sustainable cash flow to service the debt, and disciplined risk management. Remove any one and leverage becomes a countdown.' },
    { title: 'The ratios lenders live by', body: 'Loan-to-value, debt-service coverage, debt-to-income, interest coverage. They exist because lenders have seen what happens without them.' },
    { title: 'Structure shapes risk', body: 'Amortizing loans build equity; interest-only loans preserve cash flow; balloons move the risk to one date in the future.' },
    { title: 'Debt is not a tax-elimination method', body: 'Borrowed money is not income, but it is also not free: interest is a real cost, collateral can be called, and the loan is repaid or refinanced by someone.' },
    { title: 'Never auto-select the most leveraged scenario', body: 'The scenario with the highest projected return is the one with the least room for error. Model the bad year before you admire the good one.' },
  ], [
    'Five lines. The fourth is the educational principle applied to debt: borrowing defers and finances; it does not eliminate.',
    'The fifth is from hard experience. Every leverage calculator produces a seductive top-right corner. The job is to look at the bottom-left.',
  ]),
  diagramSlide(ch, 'diagram', 'The leverage amplifier', Diagram, 3, [
    'Same $1M building, same 6% cost of debt, three LTVs. In the good year leverage looks like genius. Reveal the bad year: at 75% LTV the equity return is deeply negative and the coverage ratio is thin.',
    'The amber panel says the quiet part: leverage is a decision about how much of a bad year you can survive.',
  ], { legend: [{ tone: 'green', label: 'Good year' }, { tone: 'red', label: 'Bad year' }], footnote: 'Assumptions: $1M asset, $60k NOI, 6% interest-only debt, ±10% price move in one year. ROE = (NOI − interest + Δvalue) / equity.' }),
  numbersSlide(ch, 'numbers', 'What a $1,000,000 mortgage really costs', [
    { value: LOAN.annualDebtService, label: 'Annual debt service', sub: '25-year amortizing at 6%', format: M, tone: 'red' },
    { value: LOAN.totalInterest, label: 'Total interest over the term', sub: 'Paid in addition to the principal', format: M, tone: 'amber' },
    { value: dscr(84_000, LOAN.annualDebtService), label: 'DSCR at $84k NOI', sub: 'Lenders typically want 1.20–1.25× or better', format: (v) => ratio(v, 2), tone: 'gold' },
  ], ({ active }) => (
    <BarChart bars={[
      { label: 'Principal', value: 1_000_000, tone: 'gold' },
      { label: 'Interest', value: LOAN.totalInterest, tone: 'red' },
      { label: 'Total paid', value: LOAN.totalPaid, tone: 'ivory' },
    ]} shown={active ? 3 : 0} format={M} width={1000} height={560} />
  ), [
    'Run the counters, then the bars. Most people have never seen total interest beside principal. It is not an argument against borrowing; it is the price tag.',
    'DSCR is the ratio that keeps you alive. Say what the lender will say: below about 1.2× the loan does not close.',
  ], { assumptions: 'buildLoan({principal: 1,000,000, annualRate: 0.06, termMonths: 300, structure: amortizing}); NOI $84,000 for DSCR.' }),
  misconceptionSlide(ch, 'misconception', 'Borrow against your assets and you never pay tax.',
    'Loan proceeds are not income, so borrowing is not a taxable event. That is where the truth ends. Interest is a real cost; collateral can be called; the loan is repaid, refinanced or settled by the estate. The basis step-up at death under §1014 is a feature of current law that is actively debated, and estate tax still applies above the exemption. This is deferral with risk, not elimination.',
    'red', [
      'This is the "buy, borrow, die" slogan. Treat it respectfully and dismantle it precisely: the first clause is true, the conclusion is not.',
      'Red because, as a sentence, it teaches exactly what this course refuses to teach.',
    ], { cite: 'IRC §1014 · IRC §163 (interest limits) · IRC §2001' }),
  takeawaySlide(ch, [
    'Borrow only against productive assets with cash flow that covers the debt in a bad year.',
    'Know your LTV, DSCR and maturity date before you know your projected return.',
    'Debt finances and defers. It never eliminates.',
  ], ['tax-planning', 'asset-protection', 'governance'], ['Hand back to the architecture: Chapter 05, the entities that hold what the debt financed.']),
];
