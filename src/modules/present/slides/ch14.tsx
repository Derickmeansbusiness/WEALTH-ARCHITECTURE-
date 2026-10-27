import type { Slide } from '@/types/present';
import { chapterById } from '@/content/chapters/manifest';
import { NetworkAssemble, BarChart, Glass, type NetNode, type NetEdge } from '../visuals';
import { sectionCard, conceptSlide, diagramSlide, numbersSlide, misconceptionSlide, takeawaySlide } from './factories';

const ch = chapterById('ch14')!;

const NODES: NetNode[] = [
  { id: 'assembly', x: 840, y: 90, label: 'Family Assembly', sub: 'All adult family members · once a year', tone: 'gold', shape: 'pill', w: 420, h: 84, appearAt: 0 },
  { id: 'council', x: 840, y: 300, label: 'Family Council', sub: 'Elected · 5–7 members · quarterly', tone: 'gold', w: 380, h: 96, appearAt: 1 },
  { id: 'board', x: 300, y: 560, label: 'Board of Holding Co.', sub: 'Directors incl. independents', tone: 'blue', w: 340, h: 96, appearAt: 2 },
  { id: 'trustees', x: 840, y: 560, label: 'Trustees & Protector', sub: 'Bound by the instruments, not the council', tone: 'violet', w: 380, h: 96, appearAt: 3 },
  { id: 'office', x: 1380, y: 560, label: 'Family Office', sub: 'Executes · reports · educates', tone: 'blue', w: 340, h: 96, appearAt: 4 },
  { id: 'constitution', x: 300, y: 300, label: 'Family Constitution', sub: 'Values · policies · amendment rules', tone: 'ivory', w: 340, h: 96, appearAt: 1 },
  { id: 'policies', x: 1380, y: 300, label: 'Policies', sub: 'Employment · distributions · conflicts · education', tone: 'ivory', w: 380, h: 96, appearAt: 1 },
];
const EDGES: NetEdge[] = [
  { from: 'assembly', to: 'council', tone: 'blue', appearAt: 1, label: 'elects · ratifies' },
  { from: 'assembly', to: 'constitution', tone: 'gold', appearAt: 1, curve: 60, label: 'adopts' },
  { from: 'council', to: 'policies', tone: 'blue', appearAt: 1, label: 'writes · maintains' },
  { from: 'council', to: 'board', tone: 'blue', appearAt: 2, label: 'appoints family directors · sets owner expectations' },
  { from: 'board', to: 'council', tone: 'green', appearAt: 2, curve: 80, label: 'dividend policy · reporting', dashed: true },
  { from: 'council', to: 'trustees', tone: 'blue', appearAt: 3, dashed: true, label: 'recommends · never directs' },
  { from: 'trustees', to: 'council', tone: 'green', appearAt: 3, curve: -70, label: 'distributions per the instrument' },
  { from: 'council', to: 'office', tone: 'blue', appearAt: 4, label: 'mandate · budget' },
  { from: 'office', to: 'council', tone: 'green', appearAt: 4, curve: 80, label: 'consolidated reporting', dashed: true },
];

function Diagram({ step }: { step: number; active: boolean }) {
  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <NetworkAssemble nodes={NODES} edges={EDGES} step={step} width={1680} height={680} />
      <div style={{ position: 'absolute', right: 0, bottom: 0, width: 640 }}>
        <Glass tone="amber" on={step >= 5} style={{ padding: '20px 28px' }}>
          <div className="present-kicker" style={{ color: 'var(--amber)' }}>Decision rights, written down</div>
          <p style={{ fontSize: 20 }}>Who decides, who must be consulted, who is informed: for capital allocation, distributions, employment of family members, sale of the business, and amendment of the constitution. The dashed arrow to the trustees matters: a council that directs a trustee has turned the trust into an alter ego.</p>
        </Glass>
      </div>
    </div>
  );
}

export const ch14: Slide[] = [
  sectionCard(ch, 'Capital is the easy part. The family is the architecture.', [
    'Practitioners say this with the weariness of experience. Students hear it as a platitude until the case studies. Say it anyway.',
  ]),
  conceptSlide(ch, 'concept', 'Bodies, documents and decision rights', [
    { title: 'The family assembly', body: 'Everyone with a stake, once a year. Information, education, belonging. It elects the council and adopts the constitution.' },
    { title: 'The family council', body: 'A small elected group that meets quarterly, writes policy and represents owners to the business and the office. The working heart of governance.' },
    { title: 'The constitution', body: 'Values, purpose, how bodies are formed, how decisions are made, how the document is amended. Not legally binding on trustees or directors; morally binding on the family.' },
    { title: 'Policies', body: 'Family employment, distributions, conflicts of interest, education funding, prenuptial expectations. Written before they are needed, when nobody is angry.' },
    { title: 'Decision rights', body: 'A matrix of who decides, who is consulted and who is informed, for each kind of decision. The single most useful page in the binder.' },
    { title: 'The boundary with fiduciaries', body: 'Councils recommend; trustees decide under the instrument; directors owe duties to the company. Governance that overrides those duties destroys the legal structures it was meant to protect.' },
  ], [
    'Six lines. The last is the one lawyers care about and families forget: a family council that instructs a trustee has converted a trust into an alter ego, with the estate and creditor consequences from Chapters 03 and 06.',
    'Ninety seconds.',
  ]),
  diagramSlide(ch, 'diagram', 'Governance bodies and the lines between them', Diagram, 6, [
    'Assembly at the top, council in the middle, three fiduciary or executive bodies below. Blue arrows are control; green are money and reporting back. The dashed arrow to the trustees is deliberate: recommend, never direct.',
    'Last step: the decision-rights panel. If a family writes nothing else, it writes this matrix.',
  ], { legend: [{ tone: 'blue', label: 'Control / mandate' }, { tone: 'green', label: 'Money / reporting' }, { tone: 'gold', label: 'Adoption' }, { tone: 'violet', label: 'Fiduciary' }] }),
  numbersSlide(ch, 'numbers', 'What a working governance system looks like in numbers', [
    { value: 1, label: 'Constitution', sub: 'Reviewed every five years', format: (v) => String(Math.round(v)), tone: 'gold' },
    { value: 4, label: 'Council meetings a year', sub: 'Plus one assembly', format: (v) => String(Math.round(v)), tone: 'blue' },
    { value: 6, label: 'Core written policies', sub: 'Employment · distributions · conflicts · education · prenuptial · communication', format: (v) => String(Math.round(v)), tone: 'ivory' },
    { value: 3, label: 'Generations at the table', sub: 'Governance starts when the second generation is adult', format: (v) => String(Math.round(v)), tone: 'green' },
  ], ({ active }) => (
    <BarChart bars={[
      { label: 'Assembly', value: 2, tone: 'gold', sub: 'decision types owned' }, { label: 'Council', value: 5, tone: 'blue', sub: 'decision types owned' }, { label: 'Board', value: 4, tone: 'blue', sub: 'decision types owned' }, { label: 'Trustees', value: 3, tone: 'violet', sub: 'decision types owned' }, { label: 'Office', value: 6, tone: 'ivory', sub: 'decision types owned' },
    ]} shown={active ? 5 : 0} format={(v) => String(v)} max={6} width={1000} height={560} baseline="Illustrative decision-rights matrix: who owns how many decision types" />
  ), [
    'These are cadences, not metrics. The point of the chart is that every decision type has exactly one owner; the number per body is less important than the absence of gaps and overlaps.',
    'If asked about the "seventy percent of families lose it by the third generation" statistic: it comes from a consulting survey and has been seriously questioned. Do not quote it as fact.',
  ], { assumptions: 'cadences and counts are illustrative of a functioning mid-sized family enterprise, not benchmarks.' }),
  misconceptionSlide(ch, 'misconception', 'Governance is for billionaires.',
    'Governance scales down further than most people think: a one-page constitution, an annual meeting and two policies is governance. What scales up with wealth is formality, not the need. Families with a single operating business and three adult children fail from the same causes as dynasties: unspoken expectations about employment, distributions and who is in charge. The cheapest moment to write the rules is before anyone needs them.',
    'amber', [
      'Amber: scale does change the apparatus, so the claim is not entirely wrong; it is wrong about the need.',
    ]),
  takeawaySlide(ch, [
    'Write the decision-rights matrix. One owner per decision; no gaps, no overlaps.',
    'Councils recommend. Trustees and directors decide under their own duties. Keep the boundary.',
    'Governance begins when the second generation becomes adult, not when the founder dies.',
  ], ['governance', 'succession'], ['Then the last chapter: the professional body that runs all of this day to day.']),
];
