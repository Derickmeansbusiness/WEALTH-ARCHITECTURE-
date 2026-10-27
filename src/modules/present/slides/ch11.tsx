import type { Slide } from '@/types/present';
import { chapterById } from '@/content/chapters/manifest';
import { BarChart, Glass, TONE_COLOR } from '../visuals';
import { sectionCard, conceptSlide, diagramSlide, numbersSlide, misconceptionSlide, takeawaySlide } from './factories';

const ch = chapterById('ch11')!;

const FENCES = [
  { label: 'Insurance & umbrella', sub: 'Pays the claim · nothing else is touched', tone: 'red' as const },
  { label: 'Exempt assets', sub: 'Homestead · ERISA plans · 11 U.S.C. §522 · tenancy by the entirety (state law)', tone: 'amber' as const },
  { label: 'LLC charging order', sub: 'Outside creditor gets distributions, not the asset (statute-dependent)', tone: 'gold' as const },
  { label: 'Discretionary / spendthrift trust', sub: 'Third-party trusts strong; self-settled (DAPT) only in enacting states and only for residents on good facts', tone: 'violet' as const },
  { label: 'Timing', sub: 'Fraudulent-transfer law looks back: UVTA ~4 yrs · §548(e) 10 yrs for self-settled trusts', tone: 'blue' as const },
];

/** A creditor's path across five fences. The arrow advances one fence per step; the last step shows the timing fence failing a late transfer. */
function Diagram({ step }: { step: number; active: boolean }) {
  const x0 = 120, gap = 290;
  const reach = Math.min(step, 5);
  const late = step >= 6;
  return (
    <div style={{ display: 'grid', gridTemplateRows: '1fr auto', height: '100%', gap: 20 }}>
      <svg className="present-svg" viewBox="0 0 1680 500" width={1680} height={500}>
        <line x1={0} y1={250} x2={x0 + gap * reach + (late ? 200 : 0)} y2={250} stroke="var(--red)" strokeWidth={5} className="present-flow" style={{ transition: 'all 0.8s var(--ease)' }} />
        <g transform="translate(40 250)"><circle r={34} fill="rgba(13,16,22,0.95)" stroke="var(--red)" strokeWidth={2} /><text textAnchor="middle" y={-50} style={{ fontSize: 18, fill: '#e7a398', letterSpacing: '0.1em' }}>JUDGMENT CREDITOR</text><text textAnchor="middle" y={7} style={{ fontSize: 22, fill: '#e7a398' }}>$</text></g>
        {FENCES.map((f, i) => {
          const x = x0 + gap * (i + 1) - 60;
          const on = step >= i + 1;
          const hit = reach === i + 1 && !late;
          const broken = late && i === 4;
          return (
            <g key={f.label} style={{ opacity: on ? 1 : 0, transition: 'opacity 0.6s var(--ease)' }}>
              <rect x={x - 22} y={60} width={44} height={380} rx={14} fill={TONE_COLOR[f.tone]} opacity={0.08} />
              <line x1={x} y1={60} x2={x} y2={440} stroke={TONE_COLOR[f.tone]} strokeWidth={3} strokeDasharray={broken ? '6 14' : '18 10'} opacity={broken ? 0.4 : 1} />
              {hit && <circle cx={x} cy={250} r={28} fill="var(--red)" opacity={0.35} />}
              <text x={x} y={36} textAnchor="middle" style={{ fontSize: 20, fill: TONE_COLOR[f.tone], fontFamily: 'var(--font-display)' }}>Fence {i + 1} · {f.label}</text>
              <text x={x} y={478} textAnchor="middle" style={{ fontSize: 15, fill: 'var(--ivory-3)' }}>{f.sub}</text>
            </g>
          );
        })}
        {late && <text x={x0 + gap * 5 + 160} y={236} style={{ fontSize: 18, fill: '#e7a398' }}>transfer made after the claim → voided</text>}
      </svg>
      <Glass tone={late ? 'red' : 'gold'} on={step >= 1} style={{ padding: '20px 30px' }}>
        <p style={{ fontSize: 24 }}>
          {!late && reach <= 1 && 'First fence: insurance. A paid claim stops here and never meets the architecture. Most do.'}
          {!late && reach === 2 && 'Second fence: exemptions. Homestead and qualified retirement plans are protected by statute, in amounts and on terms that vary enormously by state.'}
          {!late && reach === 3 && 'Third fence: the charging order. In the right state, an outside creditor of a member gets a lien on distributions, not the LLC\'s assets. Olmstead shows the fence failing for a single-member Florida LLC.'}
          {!late && reach === 4 && 'Fourth fence: the trust. A discretionary spendthrift trust settled by someone else is strong nearly everywhere. A self-settled trust depends on the state, the settlor\'s residence and the facts: In re Huber disregarded an Alaska DAPT for a Washington settlor.'}
          {!late && reach >= 5 && 'Fifth fence: timing. Every fence assumes it was built before the claim. Fraudulent-transfer law exists to unwind fences built afterwards.'}
          {late && 'Built after the claim arose: the transfer is voidable under the Uniform Voidable Transactions Act, and in bankruptcy §548(e) reaches ten years back for self-settled trusts. The creditor walks through. Timing is the fence that makes the others real.'}
        </p>
      </Glass>
    </div>
  );
}

export const ch11: Slide[] = [
  sectionCard(ch, 'Fences work before the claim exists. Never after.', [
    'The entire chapter is in the hook. Say it twice, slowly, and then prove it.',
  ]),
  conceptSlide(ch, 'concept', 'Five fences, in order', [
    { title: 'Insurance first', body: 'Primary and umbrella liability coverage. The fence that pays instead of fights.' },
    { title: 'Exemptions second', body: 'Homestead, qualified retirement plans (ERISA; 11 U.S.C. §522), life insurance and annuities in some states, tenancy by the entirety for married couples in others. Statutory, free, and wildly variable by state.' },
    { title: 'Entity separation third', body: 'Inside liability stays inside; outside creditors face charging-order statutes. Multi-member LLCs in states with exclusive-remedy language; single-member LLCs are weaker after Olmstead and Albright.' },
    { title: 'Trusts fourth', body: 'Third-party discretionary spendthrift trusts are the strongest common fence. Self-settled domestic asset protection trusts exist in roughly twenty states; In re Huber shows them failing for non-resident settlors on bad facts.' },
    { title: 'Timing underneath everything', body: 'The Uniform Voidable Transactions Act unwinds transfers made with intent to hinder creditors (typically a four-year reach-back); 11 U.S.C. §548(e) reaches ten years for self-settled trusts in bankruptcy. Solvency after the transfer is the practical test.' },
  ], [
    'Five fences in order of cost and reliability. Students want to start at fence four. Experienced planners start at fence one and often stop at three.',
    'On DAPTs: do not oversell or dismiss. They are state-law creatures that work best for residents of enacting states who were solvent and unsued when they funded them. Huber is the cautionary case.',
    'Ninety seconds.',
  ], { cite: '11 U.S.C. §§522, 548(e) · UVTA §4 · Olmstead (Fla. 2010) · In re Huber, 493 B.R. 798 (Bankr. W.D. Wash. 2013)' }),
  diagramSlide(ch, 'diagram', 'A creditor\'s path through the fences', Diagram, 7, [
    'The red line is a judgment creditor. Advance one fence per step and read the panel. Insurance absorbs most; exemptions are statutory; the charging order redirects; the trust confines; timing governs all of it.',
    'Last step: the same structure built after the claim. The timing fence dissolves and the creditor walks through. Ninety seconds.',
  ], { legend: [{ tone: 'red', label: 'Claim' }, { tone: 'gold', label: 'Entity fence' }, { tone: 'violet', label: 'Trust fence' }, { tone: 'blue', label: 'Timing' }], cite: 'UVTA · 11 U.S.C. §548(e)' }),
  numbersSlide(ch, 'numbers', 'How far back the law looks', [
    { value: 4, label: 'Years · UVTA / UFTA (typical)', sub: 'Actual-intent and constructive transfers; some states differ', format: (v) => `${Math.round(v)} yrs`, tone: 'amber' },
    { value: 2, label: 'Years · 11 U.S.C. §548(a)', sub: 'Bankruptcy trustee\'s general avoidance power', format: (v) => `${Math.round(v)} yrs`, tone: 'gold' },
    { value: 10, label: 'Years · 11 U.S.C. §548(e)', sub: 'Transfers to self-settled trusts with intent to hinder, delay or defraud', format: (v) => `${Math.round(v)} yrs`, tone: 'red' },
  ], ({ active }) => (
    <BarChart bars={[
      { label: 'UVTA (typical state)', value: 4, tone: 'amber' }, { label: '§548(a)', value: 2, tone: 'gold' }, { label: '§548(e) self-settled trust', value: 10, tone: 'red' },
    ]} shown={active ? 3 : 0} format={(v) => `${v} yrs`} max={10} width={1000} height={560} baseline="Reach-back periods" />
  ), [
    'Three numbers that decide whether a fence is real. The ten-year rule in §548(e) was written specifically for self-settled trusts; it is the reason planners talk about seasoning.',
    'State periods vary; some are longer, and discovery rules can extend them. Say "typical" and point them to the statute.',
  ], { assumptions: 'statutory periods as commonly enacted; discovery rules and state variations apply.', cite: '11 U.S.C. §548(a)(1), (e) · UVTA §9' }),
  misconceptionSlide(ch, 'misconception', 'You can protect assets after you\'ve been sued.',
    'Transfers made after a claim arises, or while insolvent, are voidable under fraudulent-transfer law regardless of how good the trust or LLC is. Courts have voided late transfers, held settlors in contempt and denied bankruptcy discharges. The structures in this chapter are built in calm weather by solvent people with no pending claims, and documented that way.',
    'red', [
      'Red, without qualification. Late planning is the fastest way to turn an asset-protection case into a fraud case.',
      'Mention that advisers who help with late transfers have their own exposure. The room should feel the gravity.',
    ], { cite: 'UVTA §4 · 11 U.S.C. §§548(e), 727(a)(2) · In re Huber (2013)' }),
  takeawaySlide(ch, [
    'Insurance, exemptions, entities, trusts, in that order, each one cheaper and more reliable than the next.',
    'Build fences while solvent and unsued, and keep the records that prove it.',
    'A domestic asset protection trust is a state-law creature: residence, solvency and facts decide whether it holds.',
  ], ['asset-protection', 'governance'], ['Then Chapter 12: moving the fence across a border, and everything that must be reported when you do.']),
];
