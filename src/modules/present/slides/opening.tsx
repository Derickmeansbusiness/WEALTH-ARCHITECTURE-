import type { Slide } from '@/types/present';
import { OBJECTIVE_LABELS, type Objective } from '@/types/content';
import { SlideFrame, Glass, Reveal, SplitTitle, NetworkAssemble, ArrowLegend, OBJECTIVE_TONE, type NetNode, type NetEdge } from '../visuals';

const SECTION = 'Opening';

const OBJECTIVES: { o: Objective; desc: string; question: string }[] = [
  { o: 'asset-protection', desc: 'Where a claim can and cannot reach.', question: 'If a judgment lands, which boxes does it touch?' },
  { o: 'tax-planning', desc: 'How, when and by whom income and transfers are taxed.', question: 'Who is the taxpayer, on what, and in which year?' },
  { o: 'estate-planning', desc: 'What happens to assets at death or incapacity.', question: 'What is included in the estate, and what is not?' },
  { o: 'privacy', desc: 'Lawful confidentiality, distinct from concealment.', question: 'Who must know, under which regime, and who merely may not?' },
  { o: 'succession', desc: 'Who runs and owns things next.', question: 'Who holds the keys when the founder steps back?' },
  { o: 'governance', desc: 'How a family decides, together, over time.', question: 'Where are decisions made and recorded?' },
];

/** The twelve layers of the master architecture, from the individual outward. */
const LAYER_NODES: NetNode[] = [
  { id: 'ind', x: 840, y: 400, label: 'Individual', sub: 'Layer 01', tone: 'gold', shape: 'circle', r: 72, appearAt: 0 },
  { id: 'fam', x: 840, y: 150, label: 'Family', sub: 'Layer 02', tone: 'gold', shape: 'pill', w: 220, h: 76, appearAt: 1 },
  { id: 'op', x: 380, y: 640, label: 'Operating Co.', sub: 'Layer 03 · Engine', tone: 'ivory', appearAt: 2 },
  { id: 'hold', x: 840, y: 640, label: 'Holding Co.', sub: 'Layer 04', tone: 'gold', appearAt: 3 },
  { id: 'prop', x: 1300, y: 640, label: 'Asset companies', sub: 'Layer 05 · Property · Securities', tone: 'ivory', w: 300, appearAt: 4 },
  { id: 'trust', x: 420, y: 230, label: 'Trusts', sub: 'Layer 06 · Fiduciary', tone: 'violet', appearAt: 5 },
  { id: 'bank', x: 1280, y: 400, label: 'Family Bank', sub: 'Layer 07 · Intra-family credit', tone: 'green', w: 290, appearAt: 6 },
  { id: 'ins', x: 1280, y: 180, label: 'Insurance', sub: 'Layer 08 · Risk transfer', tone: 'green', appearAt: 7 },
  { id: 'dom', x: 390, y: 420, label: 'Domestic fences', sub: 'Layer 09 · Exemptions · Charging orders', tone: 'red', w: 320, appearAt: 8 },
  { id: 'intl', x: 160, y: 150, label: 'International', sub: 'Layer 10 · Reported, not hidden', tone: 'blue', w: 280, appearAt: 9 },
  { id: 'fo', x: 1560, y: 400, label: 'Family Office', sub: 'Layer 11 · Control tower', tone: 'blue', appearAt: 10 },
  { id: 'gen', x: 840, y: 20, label: 'Future generations', sub: 'Layer 12 · Governance · Transfer', tone: 'gold', shape: 'pill', w: 360, h: 70, appearAt: 11 },
];
const LAYER_EDGES: NetEdge[] = [
  { from: 'ind', to: 'fam', tone: 'gold', appearAt: 1 },
  { from: 'ind', to: 'op', tone: 'blue', appearAt: 2, label: 'manages' },
  { from: 'op', to: 'hold', tone: 'green', appearAt: 3, flow: true, dot: true, label: 'profit' },
  { from: 'hold', to: 'op', tone: 'gold', appearAt: 3, curve: 60, label: 'owns' },
  { from: 'hold', to: 'prop', tone: 'gold', appearAt: 4, label: 'owns' },
  { from: 'trust', to: 'hold', tone: 'gold', appearAt: 5, label: 'owns' },
  { from: 'ind', to: 'trust', tone: 'violet', appearAt: 5, label: 'settles' },
  { from: 'bank', to: 'prop', tone: 'green', appearAt: 6, flow: true, dot: true, label: 'lends' },
  { from: 'hold', to: 'bank', tone: 'green', appearAt: 6, flow: true, curve: -40 },
  { from: 'ins', to: 'trust', tone: 'green', appearAt: 7, curve: -120, label: 'liquidity' },
  { from: 'dom', to: 'op', tone: 'red', appearAt: 8, dashed: true, arrow: false },
  { from: 'intl', to: 'trust', tone: 'blue', appearAt: 9, label: 'reports' },
  { from: 'fo', to: 'bank', tone: 'blue', appearAt: 10 },
  { from: 'fo', to: 'hold', tone: 'blue', appearAt: 10, curve: 160, label: 'oversight' },
  { from: 'fam', to: 'gen', tone: 'gold', appearAt: 11 },
  { from: 'trust', to: 'gen', tone: 'violet', appearAt: 11, curve: -80 },
];

export const openingSlides: Slide[] = [
  {
    id: 'open-title', section: SECTION, title: 'The 100-Year Family Wealth Architecture', steps: 6, minutes: 1,
    notes: [
      'Let the title sit for a beat before you speak. Then bring in the five words one at a time, saying each one as it lands: Create. Control. Protect. Compound. Transfer.',
      'Frame the next ninety minutes: this is not a tax seminar and it is not a sales pitch. It is a way of reading diagrams that most people have only ever seen as a tangle of boxes.',
      'Timing: one minute. Do not explain the words yet; the chapters do that.',
    ],
    Visual: ({ step }) => (
      <SlideFrame center>
        <div className="present-eyebrow" style={{ marginBottom: 36 }}>A masterclass in ownership, financing, risk, taxation, succession and governance</div>
        <h1 className="present-title xl" style={{ fontSize: 118, lineHeight: 0.98, maxWidth: 1500 }}>The 100-Year<br />Family Wealth <em>Architecture</em></h1>
        <div style={{ marginTop: 70 }}>
          <SplitTitle words={['Create.', 'Control.', 'Protect.', 'Compound.', 'Transfer.']} step={step} startAt={1} gold={[4]} size={64} />
        </div>
      </SlideFrame>
    ),
  },
  {
    id: 'open-principle', section: SECTION, title: 'We never teach that wealthy people don\'t pay tax', steps: 7, minutes: 1.5,
    notes: [
      'This is the most important slide in the deck and it has to be said plainly. Wealthy families pay tax. What they do differently is structure, and they structure six things deliberately.',
      'Reveal the six nouns one at a time. Each is a decision someone made on purpose, usually with advisers in the room, usually years before it mattered.',
      'If anyone came for a trick, this is where you lose them or earn them. Ninety seconds.',
    ],
    Visual: ({ step }) => (
      <SlideFrame eyebrow="The educational principle">
        <h2 className="present-title lg" style={{ maxWidth: 1500 }}>We never teach that wealthy people <em>don't pay tax.</em></h2>
        <Reveal on={step >= 1}><p className="present-sub" style={{ fontSize: 36, marginTop: 40 }}>We teach that wealthy families <strong style={{ color: 'var(--ivory)' }}>deliberately structure</strong></p></Reveal>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 36, maxWidth: 1600 }}>
          {['ownership', 'financing', 'risk', 'taxation', 'succession', 'governance'].map((w, i) => (
            <Reveal key={w} on={step >= i + 1} as="span">
              <span style={{ display: 'inline-block', fontFamily: 'var(--font-display)', fontSize: 60, padding: '14px 34px', border: '1px solid rgba(201,169,97,0.35)', borderRadius: 999, color: i === 5 ? 'var(--gold)' : 'var(--ivory)' }}>{w}{i < 5 ? ',' : '.'}</span>
            </Reveal>
          ))}
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, display: 'flex', gap: 14 }}>
          {['No sham transactions', 'No false debt', 'No "hiding" ownership', 'Lawful privacy ≠ concealment'].map((t, i) => (
            <Reveal key={t} on={step >= 6} as="span" style={{ transitionDelay: `${i * 0.1}s` }}><span className={`present-chip ${i === 3 ? 'green' : 'red'}`}>{t}</span></Reveal>
          ))}
        </div>
      </SlideFrame>
    ),
  },
  {
    id: 'open-objectives', section: SECTION, title: 'Six objectives, never the same thing', steps: 6, minutes: 1.5,
    notes: [
      'Every diagram in this course is doing up to six jobs at once, and the single most common error in the field is to blur them. A structure that is excellent for asset protection can be neutral or negative for tax. A trust that is perfect for succession can be invisible for privacy.',
      'Walk the six cards and read the question under each. Those six questions are what you will ask of every diagram for the rest of the session.',
      'Ninety seconds. Resist the temptation to give examples here; they come in the chapters.',
    ],
    Visual: ({ step }) => (
      <SlideFrame eyebrow="The six objectives" title="Six objectives. Never the same thing." titleSize="md">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 26, height: '100%' }}>
          {OBJECTIVES.map((x, i) => (
            <Glass key={x.o} on={step >= i} tone={OBJECTIVE_TONE[x.o]} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className={`present-chip ${OBJECTIVE_TONE[x.o]}`} style={{ alignSelf: 'flex-start' }}>{OBJECTIVE_LABELS[x.o]}</span>
              <h4 style={{ fontSize: 36, marginTop: 10 }}>{x.desc}</h4>
              <p style={{ fontSize: 22, color: 'var(--ivory-3)', marginTop: 'auto', fontStyle: 'italic' }}>{x.question}</p>
            </Glass>
          ))}
        </div>
      </SlideFrame>
    ),
  },
  {
    id: 'open-map', section: SECTION, title: 'The master architecture, assembled layer by layer', steps: 12, minutes: 2.5,
    notes: [
      'Build the map outward from the individual. Twelve layers, one per step, and name each one as it appears. Operating company first because the engine comes before everything else; nobody structures income they do not have.',
      'Point out arrow colors as they appear: green is money, gold is ownership, blue is control, red is liability, violet is fiduciary relationship. Students will see these colors for the next ninety minutes.',
      'End on future generations and say: everything we build today is for the people at the top of this map, most of whom are not born yet. Two and a half minutes.',
    ],
    Visual: ({ step }) => (
      <SlideFrame eyebrow="The master map" title={<>One architecture, <em>twelve layers</em></>} titleSize="md">
        <div style={{ position: 'absolute', right: 0, top: -70 }}><ArrowLegend items={[{ tone: 'green', label: 'Money' }, { tone: 'gold', label: 'Ownership' }, { tone: 'blue', label: 'Control' }, { tone: 'red', label: 'Liability' }, { tone: 'violet', label: 'Fiduciary' }]} /></div>
        <div style={{ position: 'absolute', inset: '10px 0 0 0' }}>
          <NetworkAssemble nodes={LAYER_NODES} edges={LAYER_EDGES} step={step} width={1680} height={720} />
        </div>
        <div style={{ position: 'absolute', left: 0, bottom: -10, fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--gold)', letterSpacing: '0.1em' }}>
          Layer {String(Math.min(step + 1, 12)).padStart(2, '0')} / 12 · {LAYER_NODES[Math.min(step, 11)].label}
        </div>
      </SlideFrame>
    ),
  },
];
