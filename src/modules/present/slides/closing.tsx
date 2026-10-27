import type { Slide } from '@/types/present';
import { OBJECTIVE_LABELS, type Objective } from '@/types/content';
import { SlideFrame, Glass, Reveal, SplitTitle, OBJECTIVE_TONE } from '../visuals';

const SECTION = 'Closing';

const NINE = [
  'Who legally owns each asset', 'Who controls each asset', 'Where liability sits', 'Where money flows', 'How succession works',
  'What documentation connects the entities', 'What tax questions arise', 'What jurisdiction governs each component', 'What professional advice is required',
];

const RECAP: { o: Objective; line: string }[] = [
  { o: 'asset-protection', line: 'Fences work before a claim exists, never after. Insurance first, entities second, trusts third.' },
  { o: 'tax-planning', line: 'Structures move who is taxed, on what and when. They do not make tax disappear.' },
  { o: 'estate-planning', line: 'Retained control is retained inclusion. §§2036 and 2038 decide what is in the estate.' },
  { o: 'privacy', line: 'Lawful confidentiality is a right. Beneficial ownership reporting, KYC and tax reporting are duties. Both are true.' },
  { o: 'succession', line: 'Ownership is divisible; control should be designed. Voting and non-voting interests, trustees and protectors do that work.' },
  { o: 'governance', line: 'A constitution, a council and a decision-rights matrix turn a rich family into a family enterprise.' },
];

const AUTHORITIES: { cite: string; what: string }[] = [
  { cite: 'IRC §§671–679', what: 'Grantor trust rules; §679 for foreign trusts with U.S. beneficiaries' },
  { cite: 'IRC §§2036 · 2038', what: 'Retained interests and powers pull transferred assets back into the gross estate' },
  { cite: 'IRC §2042', what: 'Life insurance proceeds included where the insured held incidents of ownership' },
  { cite: 'IRC §7872', what: 'Below-market loans; applicable federal rate as the floor for intra-family interest' },
  { cite: 'IRC §1014', what: 'Basis of property acquired from a decedent (the step-up)' },
  { cite: 'IRC §1031 · §469', what: 'Like-kind exchanges; passive activity loss limits and the real estate professional rules' },
  { cite: '11 U.S.C. §548(e)', what: 'Ten-year reach-back for transfers to self-settled trusts in bankruptcy' },
  { cite: 'State LLC & trust statutes', what: 'Charging-order exclusivity, series LLCs, spendthrift and DAPT provisions vary by state' },
  { cite: 'Olmstead v. FTC (Fla. 2010)', what: 'Charging order not the exclusive remedy against a single-member Florida LLC' },
  { cite: 'In re Albright (Bankr. D. Colo. 2003)', what: 'Trustee in bankruptcy took full control of a single-member LLC' },
  { cite: 'In re Huber (Bankr. W.D. Wash. 2013)', what: 'Alaska DAPT disregarded for a Washington settlor; transfers voided' },
  { cite: 'FTC v. Affordable Media (9th Cir. 1999) — Anderson', what: 'Offshore trust settlors held in contempt; impossibility defence rejected' },
  { cite: 'Lender Management, LLC v. Comm\'r (T.C. Memo 2017-246)', what: 'Family office found to be a trade or business under §162 on its particular facts' },
  { cite: 'Rev. Rul. 2004-64', what: 'Grantor\'s payment of income tax on grantor trust income is not an additional gift' },
];

export const closingSlides: Slide[] = [
  {
    id: 'close-final', section: SECTION, title: 'The final experience: nine things you can now explain', steps: 9, minutes: 1.5,
    notes: [
      'This is the promise you made at the start, cashed. Reveal the nine questions one by one and ask the room to answer each for the master map they saw ninety minutes ago.',
      'Ask them to picture the most complicated structure chart they have ever been handed. They can now read it. That is the whole point of the course.',
      'Ninety seconds. Let the ninth item land: knowing when to call a professional is part of the skill, not an admission.',
    ],
    Visual: ({ step }) => (
      <SlideFrame eyebrow="The final experience" title={<>Look at any sophisticated diagram and <em>explain it</em></>} titleSize="md">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22, marginTop: 10 }}>
          {NINE.map((q, i) => (
            <Glass key={q} on={step >= i} style={{ padding: '28px 32px', minHeight: 150 }}>
              <div style={{ display: 'flex', gap: 18, alignItems: 'baseline' }}>
                <span className="mono" style={{ color: 'var(--gold)', fontSize: 24 }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 36, lineHeight: 1.15, color: 'var(--ivory)' }}>{q}</span>
              </div>
            </Glass>
          ))}
        </div>
      </SlideFrame>
    ),
  },
  {
    id: 'close-recap', section: SECTION, title: 'Six objectives recap', steps: 6, minutes: 1,
    notes: [
      'One sentence per objective, each one a rule they can repeat tomorrow. Keep the pace brisk; these are reminders, not new material.',
      'Point out again that a single box on a diagram can serve three objectives and damage a fourth. The discipline is naming which is which.',
    ],
    Visual: ({ step }) => (
      <SlideFrame eyebrow="Recap" title="Six objectives, six rules" titleSize="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {RECAP.map((r, i) => (
            <Reveal key={r.o} on={step >= i} style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 30, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
              <span className={`present-chip ${OBJECTIVE_TONE[r.o]}`} style={{ justifySelf: 'start' }}>{OBJECTIVE_LABELS[r.o]}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 34, lineHeight: 1.2, color: 'var(--ivory)' }}>{r.line}</span>
            </Reveal>
          ))}
        </div>
      </SlideFrame>
    ),
  },
  {
    id: 'close-authorities', section: SECTION, title: 'Authorities referenced', steps: 1, minutes: 0.5,
    notes: [
      'Leave this up while you take the first question. Every citation here appears in the Source Vault with notes. Encourage the room to read primary sources, not summaries of summaries.',
      'If a citation detail is challenged, the correct answer is "let us check the text", not a defence from memory.',
    ],
    Visual: () => (
      <SlideFrame eyebrow="Reference" title="Authorities referenced in this masterclass" titleSize="md" footnote="Statutes and cases cited for educational orientation. Verify current text and jurisdictional applicability before relying on any of them.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 50px', marginTop: -10 }}>
          {AUTHORITIES.map((a) => (
            <div key={a.cite} style={{ display: 'grid', gridTemplateColumns: '430px 1fr', gap: 20, padding: '10px 0', borderBottom: '1px solid var(--line)', alignItems: 'baseline' }}>
              <span className="mono" style={{ color: 'var(--gold-2)', fontSize: 19 }}>{a.cite}</span>
              <span style={{ fontSize: 19, color: 'var(--ivory-2)', lineHeight: 1.4 }}>{a.what}</span>
            </div>
          ))}
        </div>
      </SlideFrame>
    ),
  },
  {
    id: 'close-advice', section: SECTION, title: 'Professional advice required', steps: 4, minutes: 1,
    notes: [
      'Say this without apology. Every structure in this deck was implemented, in real life, by a team: an attorney who drafted, a CPA who modelled, a fiduciary who administered, often an insurance adviser and a banker. The diagrams are the easy part.',
      'Name the moments when the room should pick up the phone: before forming, before funding, before lending, before moving, before anyone dies.',
      'One minute.',
    ],
    Visual: ({ step }) => (
      <SlideFrame eyebrow="Before acting" title={<>Professional advice is <em>required</em>, not optional</>} titleSize="md">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, height: '100%' }}>
          <Glass tone="amber" on={step >= 0}>
            <div className="present-kicker" style={{ color: 'var(--amber)' }}>What this course is</div>
            <p style={{ fontSize: 28 }}>An education in how to read and reason about architecture. Every figure is illustrative; every simulation states its assumptions; nothing here is advice for your facts.</p>
          </Glass>
          <Glass tone="gold" on={step >= 1}>
            <div className="present-kicker">Who is normally in the room</div>
            <p style={{ fontSize: 28 }}>Estate and trust counsel · tax adviser (CPA / EA) · fiduciary or trust company · insurance adviser · lender or private banker · in cross-border cases, counsel in each jurisdiction.</p>
          </Glass>
          <Glass on={step >= 2} style={{ gridColumn: '1 / -1' }}>
            <div className="present-kicker">When to call them</div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {['Before forming an entity', 'Before funding a trust', 'Before an intra-family loan', 'Before a cross-border move', 'Before changing residence or citizenship', 'Before a liquidity event', 'Before anyone dies'].map((t, i) => (
                <Reveal key={t} on={step >= 3} as="span" style={{ transitionDelay: `${i * 0.08}s` }}><span className="present-chip gold" style={{ fontSize: 18 }}>{t}</span></Reveal>
              ))}
            </div>
          </Glass>
        </div>
      </SlideFrame>
    ),
  },
  {
    id: 'close-end', section: SECTION, title: 'End', steps: 6, minutes: 0.5,
    notes: ['Bring the five words back and stop talking. Thank the room. Point them to the platform for the laboratories: the Structure Lab, Money Flow and the Claim Checker are where the learning becomes muscle memory.'],
    Visual: ({ step }) => (
      <SlideFrame center>
        <div className="present-eyebrow" style={{ marginBottom: 34 }}>The 100-Year Family Wealth Architecture</div>
        <SplitTitle words={['Create.', 'Control.', 'Protect.', 'Compound.', 'Transfer.']} step={step} gold={[4]} size={96} />
        <Reveal on={step >= 5}><p className="present-sub" style={{ marginTop: 60, fontSize: 26, color: 'var(--ivory-3)' }}>Educational platform · Not legal, tax or investment advice · Continue in the Academy, the Structure Lab and the Claim Checker</p></Reveal>
      </SlideFrame>
    ),
  },
];
