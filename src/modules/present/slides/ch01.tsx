import type { Slide } from '@/types/present';
import { chapterById } from '@/content/chapters/manifest';
import { money, ratio } from '@/lib/format';
import { BalanceSheet, LineChart } from '../visuals';
import { sectionCard, conceptSlide, diagramSlide, numbersSlide, misconceptionSlide, takeawaySlide } from './factories';

const ch = chapterById('ch01')!;
const M = (v: number) => money(v, { compact: true });

/** Future value of level annual contributions. */
const fvAnnuity = (pmt: number, r: number, years: number) => pmt * ((Math.pow(1 + r, years) - 1) / r);
const YEARS = [0, 5, 10, 15, 20, 25];
const pathA = YEARS.map((y) => fvAnnuity(40_000, 0.06, y));
const pathB = YEARS.map((y) => fvAnnuity(8_000, 0.06, y));

function Diagram({ step }: { step: number; active: boolean }) {
  return (
    <div style={{ height: '100%', paddingTop: 10 }}>
      <BalanceSheet
        title="Assets (what pays you)"
        assets={[
          { label: 'Operating business', value: 2_400_000, sub: 'Equity value · the engine' },
          { label: 'Investment property', value: 1_800_000, sub: 'Rent-producing' },
          { label: 'Securities portfolio', value: 900_000, sub: 'Liquid · diversified' },
          { label: 'Cash reserve', value: 300_000, sub: '12 months of fixed costs' },
        ]}
        liabilities={[
          { label: 'Property mortgage', value: 1_100_000, sub: 'Secured · amortizing' },
          { label: 'Business credit line', value: 250_000, sub: 'Working capital' },
        ]}
        step={step}
        format={M}
      />
    </div>
  );
}

export const ch01: Slide[] = [
  sectionCard(ch, 'Wealth is a balance sheet, not a salary.', [
    'Open with the hook and pause. Most people in the room measure themselves by income. The whole course asks them to measure by the balance sheet instead.',
    'Thirty seconds, then move. The concept slide does the work.',
  ]),
  conceptSlide(ch, 'concept', 'Stock, not flow', [
    { title: 'Income is a flow. Wealth is a stock.', body: 'Income stops when work stops. Assets keep paying whether you show up or not.' },
    { title: 'Net worth = assets − liabilities', body: 'One honest line. Everything else in this course is a way of growing, protecting and moving that line.' },
    { title: 'Productive versus consumptive assets', body: 'A rental building pays you. A primary residence costs you, even if it appreciates. The architecture is built from the first kind.' },
    { title: 'Cash flow is the oxygen', body: 'Structures fail from illiquidity long before they fail from tax. Reserve first, then reach.' },
    { title: 'Time is the quiet partner', body: 'The founder who starts converting income to assets at thirty has a different family at eighty than the one who starts at fifty.' },
  ], [
    'Walk the five lines slowly; this is the vocabulary for everything that follows. Stress "productive versus consumptive" because it is the distinction students most often get wrong about their own house.',
    'On cash flow: tell them the honest truth from practice. Most structures I have seen unwind did so because a payment was missed, not because an adviser was wrong about a code section.',
    'Seventy-five seconds.',
  ]),
  diagramSlide(ch, 'diagram', 'The first honest balance sheet', Diagram, 7, [
    'Assemble the balance sheet one row at a time. Assets first, liabilities second, equity last. Ask the room what each asset does: does it pay you or cost you?',
    'The mortgage is not a villain. It is a financing instrument against a productive asset. Hold that thought for Chapter 04.',
    'Equity is the only number that matters at the end. Everything else is detail about how it is held.',
  ], { legend: [{ tone: 'gold', label: 'Assets' }, { tone: 'red', label: 'Liabilities' }, { tone: 'green', label: 'Equity' }] }),
  numbersSlide(ch, 'numbers', 'Same income, two balance sheets', [
    { value: pathA[5], label: 'Household A after 25 years', sub: '$40,000 a year into productive assets at 6%', format: M, tone: 'green' },
    { value: pathB[5], label: 'Household B after 25 years', sub: '$8,000 a year; the rest consumed', format: M, tone: 'red' },
    { value: pathA[5] / pathB[5], label: 'The gap', sub: 'Same salary. Different stock.', format: (v) => ratio(v, 1), tone: 'gold' },
  ], ({ active }) => (
    <LineChart series={[{ label: 'Household A', values: pathA, tone: 'green' }, { label: 'Household B', values: pathB, tone: 'red' }]} xLabels={YEARS.map((y) => `Yr ${y}`)} format={M} shownSeries={active ? 2 : 0} width={1000} height={560} area />
  ), [
    'Two households, identical $400,000 income. The only difference is what fraction becomes productive assets. Run the counters, then reveal the chart.',
    'Be clear this is a flat 6% illustration with no taxes, fees or volatility; the point is the ratio, not the dollar figure. Students will ask about returns. Say: the behaviour matters more than the rate.',
    'One minute.',
  ], { assumptions: 'level annual contributions, 6% compounded annually, no tax or fees, 25 years. FV = P × ((1+r)^n − 1) / r' }),
  misconceptionSlide(ch, 'misconception', 'A high income makes you wealthy.',
    'Income is a flow that ends when the work ends. Wealth is the stock of productive assets that keeps paying. Plenty of high earners carry a negative net worth after the house, the cars and the lifestyle credit. The architecture begins the day income is converted into assets held in deliberate structures.',
    'red', [
      'Students laugh at this one and then recognise themselves in it. Be kind but direct.',
      'Red banner because, as commonly stated, the claim confuses the two concepts the whole course depends on.',
    ], { why: 'Why it matters: every later chapter assumes you have something on the asset side worth structuring.' }),
  takeawaySlide(ch, [
    'Measure yourself by the balance sheet, not the pay cheque.',
    'Convert income into productive assets before you convert it into anything else.',
    'Keep a reserve. Illiquidity breaks more structures than tax ever does.',
  ], ['governance', 'tax-planning'], [
    'Three lines, three breaths. Then into Chapter 02: where the assets come from in the first place.',
  ]),
];
