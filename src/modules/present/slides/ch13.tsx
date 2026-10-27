import type { Slide } from '@/types/present';
import { chapterById } from '@/content/chapters/manifest';
import { money } from '@/lib/format';
import { EntityNode, FlowEdge, BarChart, Glass } from '../visuals';
import { sectionCard, conceptSlide, diagramSlide, numbersSlide, misconceptionSlide, takeawaySlide } from './factories';

const ch = chapterById('ch13')!;
const M = (v: number) => money(v, { compact: true });

/** 100-year model: $10M, three children per generation, 25 years per generation, 5% net growth, 40% estate tax above a flat $14M exemption per decedent. */
const START = 10_000_000, GROWTH = Math.pow(1.05, 25), EXEMPT = 14_000_000, RATE = 0.4, KIDS = 3;
function direct() {
  let perHead = START, heads = 1; const totals = [START];
  for (let g = 0; g < 3; g++) {
    const atDeath = perHead * GROWTH;
    const tax = Math.max(0, atDeath - EXEMPT) * RATE;
    perHead = (atDeath - tax) / KIDS; heads *= KIDS;
    totals.push(perHead * heads);
  }
  return { perHead, heads, totals };
}
const DIRECT = direct();
const TRUST_TOTALS = [0, 1, 2, 3].map((g) => START * Math.pow(GROWTH, g));

function Diagram({ step }: { step: number; active: boolean }) {
  const gens = [1, 3, 9, 27];
  const ys = [80, 260, 440, 620];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 520px', gap: 30, height: '100%' }}>
      <svg className="present-svg" viewBox="0 0 1120 720" width={1120} height={720}>
        {/* direct inheritance tree */}
        {gens.map((n, g) => {
          const on = step >= g;
          const w = g === 0 ? 220 : g === 1 ? 180 : g === 2 ? 100 : 34;
          return Array.from({ length: n }).map((_, i) => {
            const x = 60 + ((720 - 120) * (i + 0.5)) / n;
            const parentX = g === 0 ? x : 60 + ((720 - 120) * (Math.floor(i / KIDS) + 0.5)) / gens[g - 1];
            return (
              <g key={`${g}-${i}`}>
                {g > 0 && <FlowEdge from={{ x: parentX, y: ys[g - 1] + 28 }} to={{ x, y: ys[g] - 28 }} tone="gold" visible={on} arrow={false} width={1.2} />}
                {g < 3 ? (
                  <EntityNode x={x} y={ys[g]} label={g === 0 ? `Gen 1 · ${M(START)}` : g === 1 ? `${M(DIRECT.totals[1] / 3)}` : `${M(DIRECT.totals[2] / 9)}`} tone={g === 0 ? 'gold' : 'ivory'} w={w} h={54} fontSize={g === 0 ? 20 : 16} visible={on} />
                ) : (
                  <EntityNode x={x} y={ys[g]} label="" tone="ivory" shape="circle" r={14} visible={on} />
                )}
              </g>
            );
          });
        })}
        {[1, 2, 3].map((g) => (
          <g key={g} style={{ opacity: step >= g ? 1 : 0, transition: 'opacity 0.6s var(--ease)' }}>
            <text x={700} y={ys[g] - 60} textAnchor="end" style={{ fontSize: 15, fill: '#e7a398', letterSpacing: '0.08em' }}>estate tax · 40% above exemption · ÷ {KIDS}</text>
          </g>
        ))}
        <text x={360} y={700} textAnchor="middle" style={{ fontSize: 17, fill: 'var(--ivory-3)', letterSpacing: '0.14em' }}>DIRECT INHERITANCE · 27 HEIRS · {M(DIRECT.perHead)} EACH</text>
        {/* dynasty trust column */}
        <g style={{ opacity: step >= 4 ? 1 : 0, transition: 'opacity 0.7s var(--ease)' }}>
          <rect x={800} y={40} width={280} height={620} rx={28} fill="var(--violet)" opacity={0.06} stroke="var(--violet)" strokeWidth={2} strokeDasharray="14 10" />
          <text x={940} y={80} textAnchor="middle" style={{ fontSize: 17, fill: 'var(--violet)', letterSpacing: '0.16em' }}>DYNASTY TRUST</text>
          {TRUST_TOTALS.map((v, g) => (
            <g key={g}>
              {g > 0 && <line x1={940} y1={ys[g - 1] + 30} x2={940} y2={ys[g] - 30} stroke="var(--violet)" strokeWidth={2} />}
              <rect x={840} y={ys[g] - 30} width={200} height={60} rx={14} fill="rgba(13,16,22,0.95)" stroke="var(--violet)" strokeWidth={1.5} />
              <text x={940} y={ys[g] + 7} textAnchor="middle" className="present-svg-mono" style={{ fontSize: 20, fill: 'var(--ivory)' }}>{M(v)}</text>
            </g>
          ))}
          <text x={940} y={700} textAnchor="middle" style={{ fontSize: 15, fill: 'var(--ivory-3)', letterSpacing: '0.1em' }}>one pool · 27 beneficiaries · one trustee</text>
        </g>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center' }}>
        <Glass on={step >= 1} tone="red" style={{ padding: '18px 24px' }}><div className="present-kicker" style={{ color: '#e7a398' }}>What fragments it</div><p style={{ fontSize: 20 }}>Division by heirs, transfer tax at each death, and twenty-seven separate owners with twenty-seven sets of spouses, creditors and plans.</p></Glass>
        <Glass on={step >= 4} tone="violet" style={{ padding: '18px 24px' }}><div className="present-kicker" style={{ color: '#b7adda' }}>What holds it together</div><p style={{ fontSize: 20 }}>A GST-exempt dynasty trust: one pool, no transfer tax at each generation on the exempt share, distributions by standard rather than by inheritance. Income tax is still paid every year.</p></Glass>
        <Glass on={step >= 5} tone="amber" style={{ padding: '18px 24px' }}><p style={{ fontSize: 19, color: 'var(--ivory-2)' }}>The trust column assumes the GST exemption covers the funding and the state allows perpetual or long trusts. Beneficiaries still consume; trustees still cost. The model isolates two forces: division and transfer tax.</p></Glass>
      </div>
    </div>
  );
}

export const ch13: Slide[] = [
  sectionCard(ch, 'Four generations, three children each: the arithmetic of forgetting.', [
    'This is the chapter the course is named for. One hundred years is three or four deaths, and each one is a design event or an accident.',
  ]),
  conceptSlide(ch, 'concept', 'The transfer system in five parts', [
    { title: 'Estate, gift and generation-skipping taxes', body: 'One unified exemption for lifetime gifts and the estate (§2010, roughly $14M per person in 2025 and indexed), a 40% rate above it, and a separate GST exemption (§2631) for transfers that skip a generation.' },
    { title: 'Annual exclusion gifts', body: '§2503(b): a per-donee amount each year, outside the exemption. Small individually, enormous over thirty years and many grandchildren.' },
    { title: 'Basis: the step-up at death', body: '§1014 resets basis to fair market value at death; gifts during life carry the donor\'s basis (§1015). The choice between gifting and holding is a tax choice about two different taxes.' },
    { title: 'Direct inheritance fragments', body: 'Each death divides ownership and triggers tax above the exemption. By the fourth generation, one estate has become twenty-seven unrelated balance sheets.' },
    { title: 'Trust-based transfer pools', body: 'A GST-exempt dynasty trust holds one pool across generations, distributes by standard, and avoids transfer tax at each death on the exempt share. State perpetuities law decides how long it can run.' },
  ], [
    'Five lines. The step-up versus carryover basis trade (line three) is where students realise estate planning is not one tax but two in tension.',
    'On the exemption amount: say "approximately" and "indexed"; the figure changes annually and legislation changes it structurally. Ninety seconds.',
  ], { cite: 'IRC §§2001, 2010, 2503(b), 2601, 2631, 1014, 1015' }),
  diagramSlide(ch, 'diagram', 'One hundred years, two ways', Diagram, 6, [
    'Build the direct tree: one estate, three heirs, nine, twenty-seven. At each level the estate tax takes its share above the exemption and the remainder is divided. Then the dynasty column appears: one pool, compounding, one trustee.',
    'Say the model\'s limits out loud (the amber panel). It isolates division and transfer tax; it ignores consumption, income tax on the trust and trustee costs. The shape is the lesson, not the figures.',
  ], { legend: [{ tone: 'gold', label: 'Inheritance' }, { tone: 'violet', label: 'Trust' }, { tone: 'red', label: 'Transfer tax' }], footnote: 'Model: $10M, 5% net growth, 25 years per generation, 3 children per decedent, 40% estate tax above a flat $14M exemption; GST exemption fully allocated to the trust.' }),
  numbersSlide(ch, 'numbers', 'The arithmetic after three deaths', [
    { value: DIRECT.heads, label: 'Heirs at generation four', sub: 'Three children per decedent', format: (v) => String(Math.round(v)), tone: 'ivory' },
    { value: DIRECT.totals[3], label: 'Total family capital, direct path', sub: `${M(DIRECT.perHead)} each, in 27 unrelated hands`, format: M, tone: 'red' },
    { value: TRUST_TOTALS[3], label: 'Pool in the dynasty trust', sub: 'Same growth; no transfer tax on the exempt share', format: M, tone: 'violet' },
  ], ({ active }) => (
    <BarChart bars={[
      { label: 'Gen 2', value: DIRECT.totals[1], tone: 'gold', sub: 'direct' }, { label: 'Gen 2', value: TRUST_TOTALS[1], tone: 'violet', sub: 'trust' },
      { label: 'Gen 3', value: DIRECT.totals[2], tone: 'gold', sub: 'direct' }, { label: 'Gen 3', value: TRUST_TOTALS[2], tone: 'violet', sub: 'trust' },
      { label: 'Gen 4', value: DIRECT.totals[3], tone: 'gold', sub: 'direct' }, { label: 'Gen 4', value: TRUST_TOTALS[3], tone: 'violet', sub: 'trust' },
    ]} shown={active ? 6 : 0} format={M} width={1000} height={560} baseline="Family capital after each generation" />
  ), [
    'The bars pair direct and trust at each generation. The gap is transfer tax compounding across three deaths. Division does the rest: the same dollars in twenty-seven hands do not behave like one pool.',
    'Repeat the caveats. This is the cleanest illustration in the deck and therefore the most dangerous if quoted without them.',
  ], { assumptions: 'see model; all figures illustrative; income tax, consumption, trustee fees, state estate tax and portability ignored.', cite: 'IRC §§2010, 2631, 2641' }),
  misconceptionSlide(ch, 'misconception', 'Estate tax takes most of what you leave.',
    'Under current federal law the exemption shelters roughly $14 million per person (2025, indexed; scheduled to change), with portability between spouses. The 40% rate applies only above that, and most estates owe nothing. A dozen or so states levy their own estate or inheritance taxes at lower thresholds. The force that actually dissipates family wealth over a century is division, consumption and the absence of governance, with transfer tax as an accelerant for the largest estates.',
    'amber', [
      'Amber: wrong for most families, meaningfully true for the largest, and incomplete about state taxes in every case.',
      'Point back to the diagram: even with zero tax, twenty-seven heirs is twenty-seven plans.',
    ], { cite: 'IRC §§2001, 2010(c) · state estate tax statutes (e.g. N.Y. Tax Law §952; Mass. Gen. Laws ch. 65C)' }),
  takeawaySlide(ch, [
    'Transfer planning is two taxes in tension: estate tax and capital gains basis. Decide which you are optimising.',
    'Direct inheritance fragments; trust-based transfer pools. Choose the shape before the first death.',
    'The exemption and the rules change. Plans are reviewed, not filed.',
  ], ['estate-planning', 'succession', 'tax-planning'], ['Then Chapter 14: the human machinery that decides who gets what, and how.']),
];
