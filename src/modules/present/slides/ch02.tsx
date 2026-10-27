import type { Slide } from '@/types/present';
import { chapterById } from '@/content/chapters/manifest';
import { money, pct } from '@/lib/format';
import { NetworkAssemble, StackedArea, type NetNode, type NetEdge } from '../visuals';
import { sectionCard, conceptSlide, diagramSlide, numbersSlide, misconceptionSlide, takeawaySlide } from './factories';

const ch = chapterById('ch02')!;
const M = (v: number) => money(v, { compact: true });

const NODES: NetNode[] = [
  { id: 'cap', x: 840, y: 360, label: 'Family capital', sub: 'Holding company · reservoir', tone: 'gold', shape: 'circle', r: 110, appearAt: 0 },
  { id: 'op', x: 250, y: 120, label: 'Operating business', sub: 'Engine 01 · profit', tone: 'ivory', w: 300, appearAt: 1 },
  { id: 're', x: 250, y: 600, label: 'Real estate', sub: 'Engine 02 · rent + appreciation', tone: 'ivory', w: 300, appearAt: 2 },
  { id: 'fin', x: 1430, y: 120, label: 'Financial assets', sub: 'Engine 03 · yield + liquidity', tone: 'ivory', w: 300, appearAt: 3 },
  { id: 'ip', x: 1430, y: 600, label: 'Intellectual property', sub: 'Engine 04 · royalties', tone: 'ivory', w: 300, appearAt: 4 },
  { id: 'credit', x: 840, y: 690, label: 'Private credit', sub: 'Engine 05 · the family as lender', tone: 'green', w: 340, appearAt: 5 },
];
const EDGES: NetEdge[] = [
  { from: 'op', to: 'cap', tone: 'green', appearAt: 1, flow: true, dot: true, label: 'distributions' },
  { from: 're', to: 'cap', tone: 'green', appearAt: 2, flow: true, dot: true, label: 'net rent' },
  { from: 'fin', to: 'cap', tone: 'green', appearAt: 3, flow: true, dot: true, label: 'dividends · interest' },
  { from: 'ip', to: 'cap', tone: 'green', appearAt: 4, flow: true, dot: true, label: 'royalties' },
  { from: 'credit', to: 'cap', tone: 'green', appearAt: 5, flow: true, dot: true, label: 'interest' },
  { from: 'cap', to: 're', tone: 'gold', appearAt: 6, curve: 90, label: 'recycled equity' },
  { from: 'cap', to: 'credit', tone: 'gold', appearAt: 6, curve: -90, label: 'capital to lend' },
  { from: 'cap', to: 'fin', tone: 'gold', appearAt: 6, curve: 90, label: 'reserve' },
];

function Diagram({ step }: { step: number; active: boolean }) {
  return <NetworkAssemble nodes={NODES} edges={EDGES} step={step} width={1680} height={760} />;
}

const YEARS = [0, 5, 10, 15, 20];
const fv = (pmt: number, r: number, y: number) => (r === 0 ? pmt * y : pmt * ((Math.pow(1 + r, y) - 1) / r));
const SERIES = [
  { label: 'Business (50%)', values: YEARS.map((y) => fv(150_000, 0.07, y)), tone: 'gold' as const },
  { label: 'Real estate (30%)', values: YEARS.map((y) => fv(90_000, 0.07, y)), tone: 'ivory' as const },
  { label: 'Securities (20%)', values: YEARS.map((y) => fv(60_000, 0.07, y)), tone: 'green' as const },
];
const TOTAL20 = SERIES.reduce((s, x) => s + x.values[4], 0);

export const ch02: Slide[] = [
  sectionCard(ch, 'Nobody structures income they do not have.', [
    'The engine comes before the architecture. Say that plainly: trusts and holding companies are ways to hold something, and you need the something first.',
    'Thirty seconds.',
  ]),
  conceptSlide(ch, 'concept', 'Five engines', [
    { title: 'Operating business', body: 'Highest return, highest risk, most control. Almost every large family balance sheet began here.' },
    { title: 'Real estate', body: 'Financeable, depreciable, tangible. The asset class lenders understand best and the one that rewards patience.' },
    { title: 'Financial assets', body: 'Liquidity and diversification. The reserve that lets the other engines take risk.' },
    { title: 'Intellectual property and royalties', body: 'Income that outlives the labour that created it. Often overlooked because it is intangible.' },
    { title: 'Private credit: the family as lender', body: 'Once capital exists, the family can earn the spread that banks earn. Chapter 07 is built on this.' },
    { title: 'Sequence matters', body: 'Concentrate to build. Diversify to keep. Families that reverse the order rarely build anything worth keeping.' },
  ], [
    'Six lines. The sixth is the lesson: concentration builds, diversification preserves. Most founders know this instinctively and most advisers fight it.',
    'On private credit, tease Chapter 07. The family bank is where the engines and the architecture meet.',
    'Seventy-five seconds.',
  ]),
  diagramSlide(ch, 'diagram', 'Five engines feeding one reservoir', Diagram, 7, [
    'Build the engines one at a time; green arrows are money moving into the holding reservoir. On the last step the gold arrows appear: capital recycled back out as equity, reserve and lending capacity.',
    'This loop, money in and ownership capital back out, is the compounding mechanism of the whole architecture. Everything in Chapters 05 to 08 is about making this loop safe and tax-aware.',
  ], { legend: [{ tone: 'green', label: 'Money in' }, { tone: 'gold', label: 'Capital recycled' }] }),
  numbersSlide(ch, 'numbers', 'What $300,000 a year of reinvested profit becomes', [
    { value: 300_000, label: 'Reinvested each year', sub: 'Operating profit retained, not consumed', format: M },
    { value: TOTAL20, label: 'Family capital after 20 years', sub: 'At a blended 7% across three engines', format: M, tone: 'gold' },
    { value: 0.07, label: 'Blended return assumed', sub: 'Illustrative; actual returns vary and can be negative', format: (v) => pct(v, 0), tone: 'green' },
  ], ({ active }) => (
    <StackedArea series={SERIES} xLabels={YEARS.map((y) => `Yr ${y}`)} format={M} shownSeries={active ? 3 : 0} width={1000} height={560} />
  ), [
    'The counters run first, then the stacked area builds engine by engine. The split is arbitrary; the lesson is that retained profit, routed into engines, is what creates the reservoir.',
    'Say the uncomfortable part: this chart assumes the business survives twenty years. Chapter 05 is about what happens to the reservoir if it does not.',
  ], { assumptions: '$300k/yr split 50/30/20 across engines, 7% annual return each, no tax or fees, 20 years.' }),
  misconceptionSlide(ch, 'misconception', 'Diversify from day one.',
    'Concentration is how families build; diversification is how they keep. A founder spreading early capital across ten asset classes rarely gets any engine to scale. The genuine risk of concentration is not the lack of diversification; it is the lack of a fence around the concentrated asset, which is what entity architecture is for.',
    'amber', [
      'Amber because the claim is right for a retiree and wrong for a founder. Context decides.',
      'Connect to Chapter 05: the answer to concentration risk is usually a liability fence, not a smaller bet.',
    ], { why: 'Fact dependent: stage of life, income stability and existing reserves change the answer.' }),
  takeawaySlide(ch, [
    'Build at least one engine before you build any architecture.',
    'Route retained profit back into engines; the loop is the compounding.',
    'Concentrate to build, diversify to keep, and fence the concentrated asset.',
  ], ['governance', 'asset-protection'], ['Then into Chapter 03, the lens that makes every later diagram readable: ownership versus control.']),
];
