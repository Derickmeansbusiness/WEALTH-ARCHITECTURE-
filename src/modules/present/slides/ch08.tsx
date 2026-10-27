import type { Slide } from '@/types/present';
import { chapterById } from '@/content/chapters/manifest';
import { money, pct } from '@/lib/format';
import { Waterfall, BarChart, Glass } from '../visuals';
import { sectionCard, conceptSlide, diagramSlide, numbersSlide, misconceptionSlide, takeawaySlide } from './factories';

const ch = chapterById('ch08')!;
const M = (v: number) => money(v, { compact: true });

const ROWS = [
  { label: 'Revenue (labour → business)', value: 1_000_000, kind: 'start' as const },
  { label: 'Operating expenses', value: -650_000, kind: 'minus' as const },
  { label: 'Operating profit', value: 350_000, kind: 'total' as const },
  { label: 'Income tax (entity or owner level)', value: -105_000, kind: 'minus' as const },
  { label: 'After-tax profit', value: 245_000, kind: 'total' as const },
  { label: 'Reserve retained in Operating Co.', value: -60_000, kind: 'minus' as const },
  { label: 'Distribution to Holding Co.', value: 185_000, kind: 'total' as const },
  { label: 'Reinvested in asset entities', value: -110_000, kind: 'minus' as const },
  { label: 'Lent through the Family Bank', value: -45_000, kind: 'minus' as const },
  { label: 'Distributed to trust beneficiaries', value: 30_000, kind: 'total' as const },
];

function Diagram({ step }: { step: number; active: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1100px 1fr', gap: 40, height: '100%', alignItems: 'center' }}>
      <Waterfall rows={ROWS} step={step} width={1100} rowH={66} format={M} />
      <Glass tone="gold" on={step >= ROWS.length}>
        <div className="present-kicker">The recycle</div>
        <p style={{ fontSize: 24 }}>{M(155_000)} of the {M(185_000)} that reached the holding company went back out as equity and loans into new engines. Next year those engines add to the top line. That loop, run for thirty years, is what a family balance sheet looks like.</p>
        <p style={{ fontSize: 20, color: 'var(--ivory-3)', marginTop: 16 }}>Tax was paid at step four. The structure decided where and when; it did not decide whether.</p>
      </Glass>
    </div>
  );
}

export const ch08: Slide[] = [
  sectionCard(ch, 'Follow one dollar from labour to the next generation, and back.', [
    'This chapter is the system view. Chapters 05 to 07 were parts; this is the machine running.',
  ]),
  conceptSlide(ch, 'concept', 'The cascade and the loop', [
    { title: 'Labour becomes business revenue', body: 'The founder\'s hours become a company\'s top line. This is the only step that cannot be structured; it has to be earned.' },
    { title: 'Revenue becomes profit, and profit is taxed', body: 'At the entity level for a C corporation, at the owner level for a pass-through. The architecture decides where and when, never whether.' },
    { title: 'After-tax profit splits: reserve, distribute', body: 'Some stays in the operator as working capital; the rest moves up to the holding company as a distribution.' },
    { title: 'The holding company allocates', body: 'Into new asset entities as equity, into the family bank as lending capital, and a measured amount to the trust for the family\'s needs.' },
    { title: 'The loop closes', body: 'Reinvested capital creates new income, which flows down the same cascade next year. Compounding is this loop, not a rate of return.' },
  ], [
    'Five lines. The second is the principle again, deliberately: taxed where and when, not whether. Students should hear it in every chapter.',
    'Seventy-five seconds.',
  ]),
  diagramSlide(ch, 'diagram', 'The family capital waterfall', Diagram, ROWS.length + 1, [
    'One million of revenue, one row per step. Gold bars are running totals, red are outflows. Tax leaves at step four and does not come back. Watch the room when the trust receives thirty thousand of the original million: that is what disciplined families actually distribute.',
    'Last step: the recycle. Most of what reached the holding company went back into engines. Ninety seconds.',
  ], { legend: [{ tone: 'gold', label: 'Running total' }, { tone: 'red', label: 'Outflow' }, { tone: 'green', label: 'Inflow' }], footnote: 'Illustrative blended 30% tax on operating profit; actual entity and owner taxation depends on entity type, jurisdiction and facts.' }),
  numbersSlide(ch, 'numbers', 'Where each dollar of revenue went', [
    { value: 0.105, label: 'Paid in tax', sub: 'Illustrative blended rate on profit', format: (v) => pct(v, 1), tone: 'red' },
    { value: 0.155, label: 'Recycled into new engines', sub: 'Equity into asset entities plus family-bank lending', format: (v) => pct(v, 1), tone: 'gold' },
    { value: 0.03, label: 'Consumed by the family', sub: 'Through trust distributions', format: (v) => pct(v, 1), tone: 'green' },
  ], ({ active }) => (
    <BarChart bars={[
      { label: 'Expenses', value: 650_000, tone: 'ivory' }, { label: 'Tax', value: 105_000, tone: 'red' }, { label: 'Reserve', value: 60_000, tone: 'blue' },
      { label: 'Reinvested', value: 110_000, tone: 'gold' }, { label: 'Lent', value: 45_000, tone: 'green' }, { label: 'Family', value: 30_000, tone: 'violet' },
    ]} shown={active ? 6 : 0} format={M} width={1000} height={560} baseline="Per $1,000,000 of revenue" />
  ), [
    'The same million, sorted by destination. The honest observation from practice: wealthy families consume a surprisingly small share of what their engines produce. Three percent here. That ratio, not any entity, is the secret.',
  ], { assumptions: 'same illustrative cascade as the previous slide.' }),
  misconceptionSlide(ch, 'misconception', 'Money that flows through a holding company isn\'t taxed.',
    'It is taxed somewhere, every year. A pass-through holding company allocates income to its owners, who pay tax whether or not cash is distributed. A corporate holding company pays entity-level tax, with a dividends-received deduction under §243 for dividends from subsidiaries so the same profit is not taxed twice at the corporate level. What the holding company changes is which taxpayer, at which rate and in which year, and it adds administrative cost for the privilege.',
    'red', [
      'Red as stated. Students should be able to say "taxed where and when, not whether" in their sleep by now.',
      'If asked about deferral inside a C corporation: yes, retained earnings are not taxed to shareholders until distributed, but the entity paid tax, and accumulated earnings tax (§531) exists for a reason.',
    ], { cite: 'IRC §§701–704 (partnerships) · §243 · §531' }),
  takeawaySlide(ch, [
    'The cascade decides where and when profit is taxed. It never decides whether.',
    'Reserve in the operator, allocate at the holding company, distribute little, recycle most.',
    'Compounding is a loop you run every year, not a number on a projection.',
  ], ['tax-planning', 'governance', 'succession'], ['Then Chapter 09: the asset class where cash flow and taxable income diverge the most.']),
];
