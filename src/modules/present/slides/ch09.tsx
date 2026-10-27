import type { Slide } from '@/types/present';
import { chapterById } from '@/content/chapters/manifest';
import { money } from '@/lib/format';
import { Waterfall, BarChart, Reveal } from '../visuals';
import { sectionCard, conceptSlide, diagramSlide, numbersSlide, misconceptionSlide, takeawaySlide } from './factories';

const ch = chapterById('ch09')!;
const M = (v: number) => money(v, { compact: true });

const NOI = 120_000, INTEREST = 60_000, PRINCIPAL = 20_000, DEPREC = Math.round(1_500_000 / 27.5);
const CASH = [
  { label: 'Net operating income', value: NOI, kind: 'start' as const },
  { label: 'Interest paid', value: -INTEREST, kind: 'minus' as const },
  { label: 'Principal repaid', value: -PRINCIPAL, kind: 'minus' as const },
  { label: 'Cash flow to owner', value: NOI - INTEREST - PRINCIPAL, kind: 'total' as const },
];
const TAXABLE = [
  { label: 'Net operating income', value: NOI, kind: 'start' as const },
  { label: 'Interest deducted', value: -INTEREST, kind: 'minus' as const },
  { label: 'Depreciation (27.5-yr residential)', value: -DEPREC, kind: 'minus' as const },
  { label: 'Taxable income', value: NOI - INTEREST - DEPREC, kind: 'total' as const },
];

function Diagram({ step }: { step: number; active: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, height: '100%', alignItems: 'start', paddingTop: 10 }}>
      <div>
        <div className="present-eyebrow" style={{ marginBottom: 14, color: 'var(--green-2)' }}>Cash flow · what hits the bank account</div>
        <Waterfall rows={CASH} step={Math.min(step, 3)} width={800} rowH={80} format={M} />
      </div>
      <Reveal on={step >= 4}>
        <div className="present-eyebrow" style={{ marginBottom: 14 }}>Taxable income · what hits the return</div>
        <Waterfall rows={TAXABLE} step={Math.max(0, step - 4)} width={800} rowH={80} format={M} />
      </Reveal>
      <Reveal on={step >= 8} style={{ gridColumn: '1 / -1' }}>
        <div className="present-glass amber" style={{ padding: '22px 30px' }}>
          <p style={{ fontSize: 24 }}>{M(NOI - INTEREST - PRINCIPAL)} in cash, {M(NOI - INTEREST - DEPREC)} taxable. Principal is cash out but not deductible; depreciation is deductible but not cash out. The gap is deferral: depreciation reduces basis and is recaptured on sale (§1250, up to 25%) unless deferred again (§1031) or reset at death (§1014).</p>
        </div>
      </Reveal>
    </div>
  );
}

export const ch09: Slide[] = [
  sectionCard(ch, 'Cash flow and taxable income are two different numbers. Real estate is where they diverge most.', [
    'Students who have owned a rental know this in their gut. This chapter puts numbers and code sections to the feeling.',
  ]),
  conceptSlide(ch, 'concept', 'Why the two numbers diverge', [
    { title: 'Depreciation is a non-cash deduction', body: 'Residential buildings over 27.5 years, commercial over 39 (IRC §168). Cost segregation can accelerate part of it. The building does not actually lose that value each year; the deduction is a timing rule.' },
    { title: 'Principal is cash, not a deduction', body: 'Debt service has two halves. Interest is deductible (subject to §163 limits); principal is equity you are building with after-tax cash.' },
    { title: 'Passive activity rules', body: 'IRC §469 generally confines rental losses to passive income, with the $25,000 active-participation allowance and the real estate professional exception. The deduction exists; who can use it this year is the question.' },
    { title: 'Deferral tools, not elimination tools', body: 'A §1031 exchange defers gain into the replacement property. Depreciation is recaptured at sale (§1250, up to 25%). Basis steps up at death (§1014) under current law, which is why the topic is politically alive.' },
    { title: 'The tax questions that arise', body: 'Recapture, passive limits, state conformity, entity choice, and whether an exchange is available. Every one of them has a professional on the other end.' },
  ], [
    'Five lines. Say "deferral, not elimination" at least twice. Students will have heard the opposite online.',
    'On §469, resist the temptation to explain the real estate professional test in full; it is a seven-hundred-fifty-hour rule with case law behind it. Say it exists and that it is audited.',
    'Ninety seconds.',
  ], { cite: 'IRC §§167, 168, 469, 1031, 1250, 1014' }),
  diagramSlide(ch, 'diagram', 'Cash flow versus taxable income', Diagram, 9, [
    `Left cascade first: NOI, interest, principal, cash. Then the right: NOI, interest, depreciation, taxable. Same building, same year, ${M(NOI - INTEREST - PRINCIPAL)} in the bank and ${M(NOI - INTEREST - DEPREC)} on the return.`,
    'The amber panel is the discipline: this is deferral. Depreciation lowers basis; the sale recaptures it unless the owner exchanges or dies. Say both halves.',
  ], { legend: [{ tone: 'gold', label: 'Running total' }, { tone: 'red', label: 'Deduction / outflow' }], footnote: 'Assumptions: $1.5M depreciable basis, 27.5-year straight line; $60k interest and $20k principal in the year; no cost segregation, no §469 limitation applied.' }),
  numbersSlide(ch, 'numbers', 'One building, one year, two numbers', [
    { value: NOI - INTEREST - PRINCIPAL, label: 'Cash flow to the owner', sub: 'After debt service', format: M, tone: 'green' },
    { value: NOI - INTEREST - DEPREC, label: 'Taxable income', sub: 'After interest and depreciation', format: M, tone: 'gold' },
    { value: DEPREC, label: 'Depreciation deduction', sub: 'Basis falls by the same amount; recaptured on sale', format: M, tone: 'amber' },
  ], ({ active }) => (
    <BarChart bars={[
      { label: 'Cash received', value: NOI - INTEREST - PRINCIPAL, tone: 'green' },
      { label: 'Taxable now', value: NOI - INTEREST - DEPREC, tone: 'gold' },
      { label: 'Deferred (recapture later)', value: DEPREC, tone: 'amber' },
    ]} shown={active ? 3 : 0} format={M} width={1000} height={560} />
  ), [
    'Counters, then bars. The third bar is the honest one: the deferred amount is a liability waiting for a sale. Families manage it with exchanges and holding periods; they do not make it disappear.',
  ], { assumptions: 'same figures as the diagram; recapture of straight-line depreciation on real property is taxed at up to 25% under §1(h)(1)(E) / §1250.', cite: 'IRC §1250 · §1031 · §1014' }),
  misconceptionSlide(ch, 'misconception', 'Depreciation makes real estate income tax-free forever.',
    'Depreciation defers tax; it does not remove it. Each deduction lowers basis, and the accumulated amount is recaptured at sale at up to 25%. Losses are limited by the passive activity rules of §469 unless the owner qualifies as a real estate professional. A §1031 exchange defers further; a step-up at death under §1014 resets basis under current law. "Forever" depends on dying while still holding the property, under a statute Congress can change.',
    'amber', [
      'Amber because the sentence describes a real sequence (depreciate, exchange, die) and misdescribes it as elimination. Teach the sequence and its contingencies honestly.',
    ], { cite: 'IRC §§469, 1031, 1250, 1014' }),
  takeawaySlide(ch, [
    'Track cash flow and taxable income as two numbers, every year.',
    'Depreciation and exchanges defer. Recapture, passive limits and policy risk are the other side of the ledger.',
    'Real estate tax architecture is a professional discipline: entity choice, §469 status and exchange timing are decisions, not defaults.',
  ], ['tax-planning', 'estate-planning'], ['Then Chapter 10: the layer that pays when everything else fails.']),
];
