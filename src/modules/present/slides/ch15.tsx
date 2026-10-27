import type { Slide } from '@/types/present';
import { chapterById } from '@/content/chapters/manifest';
import { money, pct } from '@/lib/format';
import { NetworkAssemble, BarChart, Glass, type NetNode, type NetEdge } from '../visuals';
import { sectionCard, conceptSlide, diagramSlide, numbersSlide, misconceptionSlide, takeawaySlide } from './factories';

const ch = chapterById('ch15')!;
const M = (v: number) => money(v, { compact: true });

const NODES: NetNode[] = [
  { id: 'fo', x: 840, y: 110, label: 'Family Office', sub: 'The control tower · reports to the council', tone: 'blue', w: 440, h: 100, appearAt: 0 },
  { id: 'hold', x: 240, y: 400, label: 'Holding Co.', sub: 'Consolidated accounts', tone: 'gold', w: 280, h: 90, appearAt: 1 },
  { id: 'trusts', x: 560, y: 400, label: 'Trusts', sub: 'Trustee liaison · distributions', tone: 'violet', w: 280, h: 90, appearAt: 2 },
  { id: 'bank', x: 880, y: 400, label: 'Family Bank', sub: 'Loan servicing · AFR compliance', tone: 'green', w: 280, h: 90, appearAt: 3 },
  { id: 'ins', x: 1200, y: 400, label: 'Insurance', sub: 'Policy register · premiums', tone: 'green', w: 280, h: 90, appearAt: 4 },
  { id: 're', x: 1500, y: 400, label: 'Asset entities', sub: 'Property · securities', tone: 'ivory', w: 260, h: 90, appearAt: 5 },
  { id: 'adv', x: 840, y: 660, label: 'External advisers', sub: 'Counsel · CPA · custodian · investment managers', tone: 'ivory', shape: 'pill', w: 560, h: 80, appearAt: 6 },
];
const EDGES: NetEdge[] = [
  { from: 'fo', to: 'hold', tone: 'blue', appearAt: 1, label: 'oversight' },
  { from: 'hold', to: 'fo', tone: 'green', appearAt: 1, curve: 50, dashed: true, label: 'reporting' },
  { from: 'fo', to: 'trusts', tone: 'blue', appearAt: 2, label: 'administration support' },
  { from: 'trusts', to: 'fo', tone: 'green', appearAt: 2, curve: 50, dashed: true },
  { from: 'fo', to: 'bank', tone: 'blue', appearAt: 3, label: 'servicing' },
  { from: 'bank', to: 'fo', tone: 'green', appearAt: 3, curve: 50, dashed: true },
  { from: 'fo', to: 'ins', tone: 'blue', appearAt: 4, label: 'risk register' },
  { from: 'fo', to: 're', tone: 'blue', appearAt: 5, label: 'asset management' },
  { from: 're', to: 'fo', tone: 'green', appearAt: 5, curve: 60, dashed: true },
  { from: 'adv', to: 'fo', tone: 'blue', appearAt: 6, label: 'coordinated by the office, engaged by the entities', dashed: true },
];

function Diagram({ step }: { step: number; active: boolean }) {
  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <NetworkAssemble nodes={NODES} edges={EDGES} step={step} width={1680} height={740} />
      <div style={{ position: 'absolute', left: 0, bottom: 0, width: 520 }}>
        <Glass tone="gold" on={step >= 7} style={{ padding: '18px 26px' }}>
          <div className="present-kicker">Functions</div>
          <p style={{ fontSize: 19 }}>Consolidated reporting · investment oversight · tax and legal coordination · trust administration support · risk and insurance · family bank servicing · education and next-generation development · philanthropy.</p>
        </Glass>
      </div>
    </div>
  );
}

const FIXED = 2_500_000;
const AUMS = [50e6, 100e6, 250e6, 500e6, 1000e6];

export const ch15: Slide[] = [
  sectionCard(ch, 'Every architecture needs someone whose job is to see all of it.', [
    'The last chapter. The family office is where every earlier chapter is administered, every year, by professionals. Say that and the course closes on itself.',
  ]),
  conceptSlide(ch, 'concept', 'Three models and one job', [
    { title: 'Single-family office', body: 'Dedicated staff serving one family. Full control, full cost: a competent SFO rarely runs for less than a few million dollars a year.' },
    { title: 'Multi-family office', body: 'Shared staff across families, fees typically as a percentage of assets. Less control, far lower fixed cost, and conflicts to manage.' },
    { title: 'Virtual family office', body: 'A coordinator plus outsourced specialists. The right answer for most families below the SFO threshold.' },
    { title: 'The job is integration', body: 'Every entity, trust and policy in this course generates reports, deadlines and decisions. The office is the one body that sees all of them at once.' },
    { title: 'The tax question', body: 'Are the office\'s costs a deductible trade or business (§162) or investment expenses (§212, currently suspended for individuals under §67(g))? Lender Management (2017) found a trade or business on its facts; the structure and the facts decide.' },
  ], [
    'Five lines. Lender Management is the case students will have heard of; teach it as fact-specific. The office there managed investments for multiple family members, charged profits interests and operated like a business. Copying the structure without the substance does not get the result.',
    'Ninety seconds.',
  ], { cite: 'IRC §§162, 212, 67(g) · Lender Management, LLC v. Comm\'r, T.C. Memo 2017-246' }),
  diagramSlide(ch, 'diagram', 'The control tower', Diagram, 8, [
    'The office at the top; every entity from the course beneath it. Blue arrows down are oversight and administration; green dashed arrows up are reporting. External advisers at the bottom, coordinated by the office and engaged by the entities that need them.',
    'The office does not own anything. It is the clearest example in the course of control without ownership. Last step: the functions list.',
  ], { legend: [{ tone: 'blue', label: 'Control / oversight' }, { tone: 'green', label: 'Reporting' }] }),
  numbersSlide(ch, 'numbers', 'When does a single-family office make sense?', [
    { value: FIXED, label: 'Illustrative SFO annual cost', sub: 'CIO, controller, administrator, systems, premises', format: M, tone: 'red' },
    { value: FIXED / 0.01, label: 'Assets at which that cost equals 1%', sub: 'The level at which a multi-family office fee is comparable', format: M, tone: 'gold' },
    { value: 0.0075, label: 'Typical MFO fee range midpoint', sub: 'Illustrative; fee schedules vary widely', format: (v) => pct(v, 2), tone: 'green' },
  ], ({ active }) => (
    <BarChart bars={AUMS.map((a) => ({ label: M(a), value: Math.round((FIXED / a) * 10000) / 100, tone: FIXED / a > 0.01 ? ('red' as const) : ('green' as const), sub: 'SFO cost as % of assets' }))} shown={active ? 5 : 0} format={(v) => `${v}%`} max={5} width={1000} height={560} baseline={`Fixed cost ${M(FIXED)} spread over family assets`} />
  ), [
    'The arithmetic that decides the model. A fixed cost divided by assets: at fifty million it is five percent a year, which no portfolio survives; at five hundred million it is half a percent.',
    'These are illustrative. Real offices range widely in cost and scope. The lesson is that the model follows the arithmetic, not the prestige.',
  ], { assumptions: `fixed annual cost ${M(FIXED)}; percentages are cost ÷ assets; MFO fees illustrative.` }),
  misconceptionSlide(ch, 'misconception', 'A family office is just a wealthy person\'s accountant.',
    'Accounting is one of eight functions. A working office coordinates counsel and tax advisers, supports trustees, services the family bank, maintains the insurance and risk register, oversees investment managers, educates the next generation and reports all of it to the family council on one page. The accountant is in the room; the office is the room.',
    'amber', [
      'Amber: offices that are only accountants exist, and they are the ones that fail to notice a trust was never funded or a note was never serviced.',
    ]),
  takeawaySlide(ch, [
    'Someone must see the whole architecture, every year. Decide who, and pay for it.',
    'Choose the office model by arithmetic: fixed cost over assets.',
    'The office controls and coordinates without owning. That is the lesson of the whole course in one body.',
  ], ['governance', 'succession', 'tax-planning'], ['Then the closing sequence: what the room can now do that it could not do ninety minutes ago.']),
];
