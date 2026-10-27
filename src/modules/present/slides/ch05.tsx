import type { Slide } from '@/types/present';
import { chapterById } from '@/content/chapters/manifest';
import { money } from '@/lib/format';
import { EntityNode, FlowEdge, Fence, BarChart, Glass } from '../visuals';
import { sectionCard, conceptSlide, diagramSlide, numbersSlide, misconceptionSlide, takeawaySlide } from './factories';

const ch = chapterById('ch05')!;
const M = (v: number) => money(v, { compact: true });

/** Entity tree with liability fences; a claim hits one fence, a personal guarantee bypasses them. */
function Diagram({ step }: { step: number; active: boolean }) {
  const trust = { x: 840, y: 70 }, hold = { x: 840, y: 250 };
  const kids = [
    { x: 300, y: 520, label: 'Operating Co.', sub: 'Risk · employees · customers' },
    { x: 660, y: 520, label: 'Property LLC I', sub: 'Building A' },
    { x: 1020, y: 520, label: 'Property LLC II', sub: 'Building B' },
    { x: 1380, y: 520, label: 'Management Co.', sub: 'Payroll · contracts' },
  ];
  const ind = { x: 1500, y: 160 };
  return (
    <svg className="present-svg" viewBox="0 0 1680 760" width={1680} height={760}>
      {kids.map((k, i) => <Fence key={i} x={k.x - 160} y={k.y - 90} w={320} h={200} label={`Fence ${i + 1}`} visible={step >= 2} broken={false} />)}
      <FlowEdge from={{ x: trust.x, y: trust.y + 42 }} to={{ x: hold.x, y: hold.y - 42 }} tone="gold" visible={step >= 1} label="owns 100%" />
      {kids.map((k, i) => <FlowEdge key={i} from={{ x: hold.x, y: hold.y + 42 }} to={{ x: k.x, y: k.y - 42 }} tone="gold" visible={step >= 1} />)}
      {kids.map((k, i) => <FlowEdge key={`m${i}`} from={{ x: k.x, y: k.y - 42 }} to={{ x: hold.x, y: hold.y + 42 }} tone="green" visible={step >= 3} flow curve={-30} />)}
      <EntityNode x={trust.x} y={trust.y} label="Family Trust" sub="Owner of the holding company" tone="violet" w={340} h={84} visible={step >= 1} />
      <EntityNode x={hold.x} y={hold.y} label="Holding Co." sub="Owns the operators · holds no risk" tone="gold" w={380} h={84} visible />
      {kids.map((k, i) => <EntityNode key={i} x={k.x} y={k.y} label={k.label} sub={k.sub} tone={i === 0 ? 'red' : 'ivory'} w={280} h={84} visible={step >= 0} />)}
      {/* Claim against Property LLC I */}
      <FlowEdge from={{ x: 660, y: 740 }} to={{ x: 660, y: 612 }} tone="red" visible={step >= 4} flow label="slip-and-fall judgment" />
      <g style={{ opacity: step >= 4 ? 1 : 0, transition: 'opacity 0.6s var(--ease)' }}>
        <circle cx={660} cy={612} r={26} fill="var(--red)" opacity={0.25} />
        <text x={700} y={640} style={{ fontSize: 17, fill: '#e7a398' }}>stops at Building A's equity</text>
      </g>
      {/* Personal guarantee bypass */}
      <FlowEdge from={{ x: 300, y: 740 }} to={{ x: ind.x - 120, y: ind.y + 10 }} tone="red" visible={step >= 5} curve={-420} dashed label="personal guarantee on the lease → bypasses every fence" />
      <EntityNode x={ind.x} y={ind.y} label="Founder" sub="Personally" tone="red" shape="circle" r={54} visible={step >= 5} />
      <g style={{ opacity: step >= 6 ? 1 : 0, transition: 'opacity 0.6s var(--ease)' }}>
        <foreignObject x={1180} y={240} width={480} height={240}>
          <div><Glass tone="amber" style={{ padding: '22px 26px' }}><div className="present-kicker" style={{ color: 'var(--amber)' }}>What keeps the fences standing</div><p style={{ fontSize: 20 }}>Separate bank accounts. Adequate capital. Signed leases between entities. Minutes and resolutions. No commingling. The fence is paperwork maintained for years, not a filing fee.</p></Glass></div>
        </foreignObject>
      </g>
    </svg>
  );
}

const ASSETS = [{ label: 'Operating Co.', value: 1_600_000 }, { label: 'Building A', value: 1_200_000 }, { label: 'Building B', value: 1_900_000 }, { label: 'Mgmt Co. + cash', value: 500_000 }];
const TOTAL = ASSETS.reduce((s, a) => s + a.value, 0);

export const ch05: Slide[] = [
  sectionCard(ch, 'Separate what can be sued from what can be lost.', [
    'The one-sentence version of entity architecture. Everything in this chapter is a way of deciding, in advance, which box a bad day happens in.',
  ]),
  conceptSlide(ch, 'concept', 'Boxes, fences and what they are for', [
    { title: 'Operating entities carry the risk', body: 'Employees, customers, contracts, vehicles. The business that makes the money is the business most likely to be sued.' },
    { title: 'The holding company owns, and does nothing else', body: 'No employees, no customers, no trucks. It holds interests in the operators and receives distributions.' },
    { title: 'One asset, one LLC', body: 'Each building in its own entity so a claim against one does not reach the others. Series LLCs offer a variant in some states; treatment across state lines is unsettled.' },
    { title: 'Inside versus outside liability', body: 'Inside: a claim arising in the entity is confined to the entity. Outside: a personal creditor of the owner is generally limited to a charging order against distributions.' },
    { title: 'Single-member weakness', body: 'Olmstead (Fla. 2010) and Albright (Bankr. D. Colo. 2003) show courts reaching through single-member LLCs. Multiple members and the right statute matter.' },
    { title: 'Separateness is a discipline, not a filing', body: 'Capitalization, separate accounts, intercompany agreements, minutes. Veil piercing is what happens when the paperwork stops.' },
  ], [
    'Six lines. Spend the most time on inside versus outside liability; it is the distinction that explains why a holding company exists at all.',
    'Name the two cases without dramatizing them: Olmstead held the charging order was not the exclusive remedy against a single-member Florida LLC; Albright let a bankruptcy trustee step into the sole member\'s shoes. Both are about single members.',
    'Ninety seconds.',
  ], { cite: 'Olmstead v. FTC, 44 So. 3d 76 (Fla. 2010) · In re Albright, 291 B.R. 538 (Bankr. D. Colo. 2003)' }),
  diagramSlide(ch, 'diagram', 'Entity tree with liability fences', Diagram, 7, [
    'Start with the holding company and the four operators. Add the trust on top; add the fences; add the green distributions upward. Then a claim: a slip-and-fall judgment against Building A hits fence two and stops at Building A\'s equity.',
    'Step five is the lesson students remember: the founder signed a personal guarantee on the operating lease. The red dashed arrow bypasses every fence and arrives at him personally. No entity fixes a signature.',
    'Last step: what keeps fences standing. Ninety seconds.',
  ], { legend: true, cite: 'State LLC acts (charging orders, e.g. Del. Code tit. 6 §18-703; Wyo. Stat. §17-29-503)' }),
  numbersSlide(ch, 'numbers', 'Exposure with and without separation', [
    { value: TOTAL, label: 'Exposed if everything sits in one entity', sub: 'A $3M judgment against the building reaches the business too', format: M, tone: 'red' },
    { value: 1_200_000, label: 'Exposed with one asset per LLC', sub: 'The judgment is confined to Building A\'s equity', format: M, tone: 'green' },
    { value: TOTAL - 1_200_000, label: 'Kept behind the fences', sub: 'Assuming separateness is maintained and no guarantees', format: M, tone: 'gold' },
  ], ({ active }) => (
    <BarChart bars={ASSETS.map((a, i) => ({ label: a.label, value: a.value, tone: i === 1 ? ('red' as const) : ('green' as const), sub: i === 1 ? 'reached' : 'fenced' }))} shown={active ? 4 : 0} format={M} width={1000} height={560} baseline="Claim against Building A · $3,000,000 judgment" />
  ), [
    'A simple exposure count. In one entity the whole balance sheet is on the table; separated, the claim reaches one building. The bars show what is reached versus fenced.',
    'Say the caveats out loud: this assumes no personal guarantee, no commingling, adequate insurance and a jurisdiction whose statute honours the fence.',
  ], { assumptions: 'illustrative values; a $3M judgment arising inside Building A; no personal guarantees; entity formalities maintained.' }),
  misconceptionSlide(ch, 'misconception', 'An LLC protects everything I own.',
    'An LLC confines liability that arises inside it, and limits an outside creditor to a charging order in states whose statutes say so. It does nothing about a personal guarantee, a tort you commit yourself, commingled accounts or a single-member LLC in a jurisdiction that reaches through it. Protection is the product of the statute, the number of members, insurance and years of clean paperwork.',
    'red', [
      'Red as stated. The LLC is the most oversold product in the field; the fence is real but narrow.',
      'Return to the personal guarantee: it is the single most common hole in a family architecture, and it is self-inflicted.',
    ], { cite: 'Olmstead v. FTC (Fla. 2010) · In re Albright (Bankr. D. Colo. 2003) · veil-piercing doctrine (state law)' }),
  takeawaySlide(ch, [
    'Put risk in entities that own little, and assets in entities that do nothing risky.',
    'One asset, one entity, one set of books, maintained for years.',
    'Watch for guarantees and commingling: the holes are usually self-made.',
  ], ['asset-protection', 'governance'], ['Then Chapter 06: the trust, which sits above the holding company and changes who owns the whole tree.']),
];
