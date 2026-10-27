import type { Slide } from '@/types/present';
import { chapterById } from '@/content/chapters/manifest';
import { pct } from '@/lib/format';
import { EntityNode, FlowEdge, BarChart, Glass } from '../visuals';
import { sectionCard, conceptSlide, diagramSlide, numbersSlide, misconceptionSlide, takeawaySlide } from './factories';

const ch = chapterById('ch03')!;

/** One asset, three lenses: who owns it, who controls it, who benefits. */
function Diagram({ step }: { step: number; active: boolean }) {
  const asset = { x: 840, y: 400 };
  const owner = { x: 300, y: 160 };
  const ctrl = { x: 1380, y: 160 };
  const benef = { x: 840, y: 680 };
  return (
    <svg className="present-svg" viewBox="0 0 1680 760" width={1680} height={760}>
      <EntityNode x={asset.x} y={asset.y} label="Apartment building" sub="One asset" tone="ivory" w={340} h={110} fontSize={30} visible highlight />
      {/* Ownership lens */}
      <FlowEdge from={{ x: owner.x + 140, y: owner.y + 30 }} to={{ x: asset.x - 150, y: asset.y - 40 }} tone="gold" visible={step >= 1} label="holds title" dim={step >= 2 && step < 4} />
      <EntityNode x={owner.x} y={owner.y} label="Property LLC" sub="Legal owner" tone="gold" w={300} h={96} visible={step >= 1} dim={step >= 2 && step < 4} />
      {/* Control lens */}
      <FlowEdge from={{ x: ctrl.x - 150, y: ctrl.y + 30 }} to={{ x: asset.x + 150, y: asset.y - 40 }} tone="blue" visible={step >= 2} label="manages · decides" dim={step === 3} />
      <FlowEdge from={{ x: ctrl.x, y: ctrl.y + 50 }} to={{ x: owner.x + 160, y: owner.y - 20 }} tone="blue" visible={step >= 2} curve={-120} label="LLC manager" dim={step === 3} arrow />
      <EntityNode x={ctrl.x} y={ctrl.y} label="Founder as Manager" sub="Control" tone="blue" w={320} h={96} visible={step >= 2} dim={step === 3} />
      {/* Benefit lens */}
      <FlowEdge from={{ x: asset.x, y: asset.y + 56 }} to={{ x: benef.x, y: benef.y - 50 }} tone="green" visible={step >= 3} flow dot label="net rent → distributions" />
      <FlowEdge from={{ x: benef.x - 100, y: benef.y - 30 }} to={{ x: owner.x + 60, y: owner.y + 50 }} tone="gold" visible={step >= 3} curve={120} label="trust owns 100% of LLC units" />
      <EntityNode x={benef.x} y={benef.y} label="Family Trust → children" sub="Benefit" tone="green" w={380} h={96} visible={step >= 3} />
      {/* Step 4: the reading; step 5: the warning */}
      <g style={{ opacity: step >= 4 ? 1 : 0, transition: 'opacity 0.6s var(--ease)' }}>
        <foreignObject x={1180} y={420} width={480} height={300}>
          <div>
            <Glass tone={step >= 5 ? 'red' : 'gold'} style={{ padding: '24px 28px' }}>
              {step < 5 ? (
                <>
                  <div className="present-kicker">Read it</div>
                  <p style={{ fontSize: 22 }}>The founder owns <b>nothing</b> on this page and controls <b>everything</b>. The children own nothing yet and receive <b>all</b> the economics.</p>
                </>
              ) : (
                <>
                  <div className="present-kicker" style={{ color: '#e7a398' }}>The price of control</div>
                  <p style={{ fontSize: 21 }}>If the founder also serves as trustee with unrestricted power over distributions, §§2036/2038 can pull the trust back into the estate, and a creditor will argue it is still really his. Control is a dial, not a free lunch.</p>
                </>
              )}
            </Glass>
          </div>
        </foreignObject>
      </g>
    </svg>
  );
}

export const ch03: Slide[] = [
  sectionCard(ch, 'Who owns it, who runs it and who enjoys it are three different questions.', [
    'This chapter is the lens for every diagram that follows. If students learn one habit today, it is to ask three questions of every box instead of one.',
  ]),
  conceptSlide(ch, 'concept', 'Three rights, deliberately separated', [
    { title: 'Legal ownership', body: 'Whose name is on the title, the share register or the deed. The question most people think is the only question.' },
    { title: 'Control', body: 'Who decides: the LLC manager, the voting shareholder, the trustee, the protector, the general partner. Control can be held by someone who owns nothing.' },
    { title: 'Benefit', body: 'Who receives the economics: distributions, use, appreciation. Beneficiaries, non-voting members, limited partners.' },
    { title: 'Families separate the three on purpose', body: 'Transfer benefit and ownership to the next generation and a trust; retain control through offices and voting classes; document all of it.' },
    { title: 'The price of retained control', body: 'Hold too much and the law treats the asset as still yours: estate inclusion under IRC §§2036 and 2038, and creditor arguments of alter ego. Control is a dial you set, not a switch you flip.' },
  ], [
    'Five lines. Lines four and five are the chapter: separation is deliberate, and it has a price curve. Too little control and the founder is uncomfortable; too much and the structure collapses back into his estate.',
    'Mention that "retained control" is exactly what the IRS and creditors look for, each for their own reasons. Seventy-five seconds.',
  ], { cite: 'IRC §§2036, 2038' }),
  diagramSlide(ch, 'diagram', 'One asset, three lenses', Diagram, 6, [
    'One building. Step one: who owns it — an LLC. Step two: who controls it — the founder as manager, a blue arrow; he is not the owner. Step three: who benefits — a trust for the children owns the LLC and receives the rent.',
    'Step four reads the diagram aloud: founder owns nothing, controls everything; children own nothing yet, receive everything. Step five is the warning: push control too far and §§2036/2038 and alter-ego arguments undo the separation.',
    'Ninety seconds. This slide is worth lingering on.',
  ], { legend: true, cite: 'IRC §§2036, 2038 · state LLC acts (manager-managed LLCs)' }),
  numbersSlide(ch, 'numbers', 'The voting / non-voting recapitalization', [
    { value: 0.01, label: 'Voting units retained by founder', sub: 'Carries 100% of the governance rights', format: (v) => pct(v, 0), tone: 'blue' },
    { value: 0.99, label: 'Non-voting units moved to trust', sub: 'Carries 99% of the economics', format: (v) => pct(v, 0), tone: 'gold' },
    { value: 1, label: 'Control retained', sub: 'Through the office of manager and the voting class', format: (v) => pct(v, 0), tone: 'green' },
  ], ({ active }) => (
    <BarChart bars={[
      { label: 'Founder · voting 1%', value: 100, tone: 'blue', sub: 'share of control' },
      { label: 'Founder · voting 1%', value: 1, tone: 'gold', sub: 'share of economics' },
      { label: 'Trust · non-voting 99%', value: 0, tone: 'blue', sub: 'share of control' },
      { label: 'Trust · non-voting 99%', value: 99, tone: 'gold', sub: 'share of economics' },
    ]} shown={active ? 4 : 0} format={(v) => `${v}%`} max={100} width={1000} height={560} />
  ), [
    'The classic recapitalization: one class votes, one class does not. The founder keeps the one percent that votes and moves the ninety-nine percent that pays to a trust.',
    'Valuation of non-voting interests is a contested area; discounts are argued, and IRC §2704 and the appraisal rules apply. Do not quote a discount percentage from the stage; say that it is fact-specific and professionally appraised.',
  ], { assumptions: 'illustrative two-class LLC; percentages are of units, not value. Valuation discounts are fact-specific (IRC §2704; qualified appraisal).', cite: 'IRC §2704 · Treas. Reg. §25.2512-1' }),
  misconceptionSlide(ch, 'misconception', "If I don't own it, I can't control it.",
    'Control lives in offices and classes, not in title: the LLC manager, the voting class, the trustee, the protector, the general partner. A founder can own nothing and still decide everything. The honest caveat is the reverse risk: retain too much control over property you have given away and the law treats it as yours again, for estate tax under §§2036/2038 and for creditors under alter-ego and sham arguments.',
    'amber', [
      'Amber: the claim is wrong as a rule but points at a real tension. Students need both halves.',
      'The field is full of structures that were technically transferred and practically retained. Those are the ones that fail audits and lawsuits.',
    ], { cite: 'IRC §§2036, 2038 · Estate of Powell v. Comm\'r, 148 T.C. 392 (2017)' }),
  takeawaySlide(ch, [
    'Ask three questions of every box: who owns, who controls, who benefits.',
    'Separate the three deliberately and document the separation.',
    'Treat retained control as a dial with a known price: estate inclusion and creditor exposure.',
  ], ['succession', 'estate-planning', 'asset-protection'], ['Then Chapter 04: the financing layer, where money is borrowed against what the architecture owns.']),
];
