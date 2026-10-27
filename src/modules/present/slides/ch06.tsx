import type { Slide } from '@/types/present';
import { chapterById } from '@/content/chapters/manifest';
import { money } from '@/lib/format';
import { EntityNode, FlowEdge, Fence, LineChart, Glass } from '../visuals';
import { sectionCard, conceptSlide, diagramSlide, numbersSlide, misconceptionSlide, takeawaySlide } from './factories';

const ch = chapterById('ch06')!;
const M = (v: number) => money(v, { compact: true });

/** Five-party trust diagram; later steps toggle revocable / grantor / discretionary and show what changes. */
function Diagram({ step }: { step: number; active: boolean }) {
  const res = { x: 760, y: 380 };
  const settlor = { x: 220, y: 380 };
  const trustee = { x: 760, y: 90 };
  const benef = { x: 1300, y: 380 };
  const protector = { x: 1300, y: 90 };
  const mode = step >= 7 ? 'discretionary' : step >= 6 ? 'grantor' : step >= 5 ? 'revocable' : 'base';
  return (
    <svg className="present-svg" viewBox="0 0 1680 760" width={1680} height={760}>
      <Fence x={560} y={270} w={400} h={220} label="Trust property" tone={mode === 'discretionary' ? 'green' : 'violet'} visible={step >= 7} />
      <EntityNode x={res.x} y={res.y} label="Trust property (res)" sub="Holding Co. units · securities · policy" tone="ivory" w={360} h={110} fontSize={28} visible />
      <FlowEdge from={{ x: settlor.x + 150, y: settlor.y }} to={{ x: res.x - 182, y: res.y }} tone="gold" visible={step >= 1} label="transfers title · completed gift?" />
      <EntityNode x={settlor.x} y={settlor.y} label="Settlor / Grantor" sub="Creates and funds" tone="gold" w={300} h={96} visible={step >= 1} />
      <FlowEdge from={{ x: trustee.x, y: trustee.y + 48 }} to={{ x: res.x, y: res.y - 56 }} tone="blue" visible={step >= 2} label="legal title · manages" />
      <EntityNode x={trustee.x} y={trustee.y} label="Trustee" sub="Fiduciary · legal owner" tone="violet" w={300} h={96} visible={step >= 2} />
      <FlowEdge from={{ x: res.x + 182, y: res.y }} to={{ x: benef.x - 150, y: benef.y }} tone="green" visible={step >= 3} flow dot label={mode === 'discretionary' ? 'distributions · trustee discretion' : 'distributions'} />
      <EntityNode x={benef.x} y={benef.y} label="Beneficiaries" sub="Equitable owners" tone="green" w={300} h={96} visible={step >= 3} />
      <FlowEdge from={{ x: protector.x - 150, y: protector.y }} to={{ x: trustee.x + 150, y: trustee.y }} tone="blue" visible={step >= 4} dashed label="may remove / replace trustee" />
      <EntityNode x={protector.x} y={protector.y} label="Protector" sub="Oversight, not ownership" tone="blue" w={300} h={96} visible={step >= 4} />
      {/* the instrument */}
      <g style={{ opacity: step >= 4 ? 1 : 0, transition: 'opacity 0.6s var(--ease)' }}>
        <rect x={580} y={560} width={360} height={60} rx={14} fill="rgba(13,16,22,0.9)" stroke="var(--line-strong)" />
        <text x={760} y={598} textAnchor="middle" style={{ fontSize: 20, fill: 'var(--ivory-2)' }}>The trust instrument connects all five</text>
      </g>
      {/* toggles */}
      <FlowEdge from={{ x: res.x - 182, y: res.y + 40 }} to={{ x: settlor.x + 150, y: settlor.y + 40 }} tone="red" visible={mode === 'revocable'} curve={60} label="power to revoke → §2038 inclusion" />
      <FlowEdge from={{ x: res.x - 150, y: res.y - 56 }} to={{ x: settlor.x + 100, y: settlor.y - 48 }} tone="green" visible={mode === 'grantor'} curve={-80} dashed label="income taxed to grantor · §§671–677" />
      <FlowEdge from={{ x: 1600, y: 700 }} to={{ x: 1460, y: 440 }} tone="red" visible={mode === 'discretionary'} flow label="beneficiary's creditor" />
      <g style={{ opacity: mode === 'discretionary' ? 1 : 0, transition: 'opacity 0.6s var(--ease)' }}>
        <circle cx={1460} cy={440} r={22} fill="var(--red)" opacity={0.3} />
        <text x={1420} y={490} textAnchor="middle" style={{ fontSize: 16, fill: '#e7a398' }}>no enforceable right to a distribution</text>
      </g>
      <g style={{ opacity: step >= 5 ? 1 : 0, transition: 'opacity 0.6s var(--ease)' }}>
        <foreignObject x={40} y={540} width={520} height={220}>
          <div><Glass tone={mode === 'revocable' ? 'red' : mode === 'grantor' ? 'green' : 'gold'} style={{ padding: '20px 26px' }}>
            <div className="present-kicker">Toggle · {mode === 'revocable' ? 'Revocable' : mode === 'grantor' ? 'Grantor trust' : 'Discretionary spendthrift'}</div>
            <p style={{ fontSize: 19 }}>
              {mode === 'revocable' && 'Settlor keeps the power to revoke. Flexible, private, avoids probate — and fully included in the estate (§2038) with no creditor protection for the settlor.'}
              {mode === 'grantor' && 'Irrevocable for property law, but the settlor remains the taxpayer on trust income (§§671–677). Often chosen deliberately; the tax paid is not an additional gift (Rev. Rul. 2004-64).'}
              {mode === 'discretionary' && 'Trustee discretion plus a spendthrift clause: a beneficiary\'s creditor cannot compel distributions. Strength varies by state statute and by exception creditors (child support, certain taxes).'}
            </p>
          </Glass></div>
        </foreignObject>
      </g>
    </svg>
  );
}

const YEARS = [0, 5, 10, 15, 20];
const START = 5_000_000, RET = 0.06, TAX = 0.37;
const grantorPath = YEARS.map((y) => START * Math.pow(1 + RET, y));
const nonGrantorPath = YEARS.map((y) => START * Math.pow(1 + RET * (1 - TAX), y));

export const ch06: Slide[] = [
  sectionCard(ch, 'A trust is a relationship, not a box.', [
    'Students arrive thinking a trust is a container. Correct that in the first sentence: it is a set of obligations among five parties, written down. Everything else follows.',
  ]),
  conceptSlide(ch, 'concept', 'Five parties and four dials', [
    { title: 'Settlor, trustee, beneficiaries, protector, property', body: 'And the instrument that binds them. Remove the trustee\'s duties or the beneficiaries\' rights and you no longer have a trust; you have a label.' },
    { title: 'Revocable or irrevocable', body: 'Revocable: flexible, probate-avoiding, fully in the estate (§2038), no creditor protection for the settlor. Irrevocable: the opposite trade on every count.' },
    { title: 'Grantor or non-grantor for income tax', body: 'IRC §§671–679 decide who pays tax on trust income. A grantor trust taxes the settlor; a non-grantor trust is its own taxpayer at compressed brackets.' },
    { title: 'Domestic or foreign', body: 'A foreign trust with U.S. beneficiaries is generally a grantor trust under §679 and carries heavy reporting (Forms 3520 / 3520-A). Chapter 12 returns to this.' },
    { title: 'Fixed or discretionary', body: 'A fixed interest is reachable by a beneficiary\'s creditor; a purely discretionary interest with a spendthrift clause usually is not. Statutes and exception creditors vary.' },
  ], [
    'Five lines, four dials. The point: "trust" tells you nothing until you know how each dial is set. Experienced readers ask about the dials before they ask about the name.',
    'Grantor trust status is the one that surprises people: an irrevocable trust can still tax the settlor, often on purpose. Ninety seconds.',
  ], { cite: 'IRC §§671–679 · §2038 · Treas. Reg. §1.671-2' }),
  diagramSlide(ch, 'diagram', 'The five-party trust, dial by dial', Diagram, 8, [
    'Assemble: property, settlor (gold title transfer), trustee (violet legal ownership, blue management), beneficiaries (green distributions), protector (blue oversight, dashed). Then the instrument that connects them.',
    'Steps six to eight flip dials. Revocable: a red arrow of retained power and §2038 inclusion. Grantor: a green dashed tax arrow back to the settlor. Discretionary spendthrift: a creditor arrow that stops at the fence.',
    'Two minutes if the room is engaged; it usually is.',
  ], { legend: [{ tone: 'gold', label: 'Ownership' }, { tone: 'blue', label: 'Control' }, { tone: 'green', label: 'Money' }, { tone: 'red', label: 'Liability / inclusion' }, { tone: 'violet', label: 'Fiduciary' }], cite: 'IRC §§671–677, 2036, 2038 · Rev. Rul. 2004-64 · Uniform Trust Code §§502–504' }),
  numbersSlide(ch, 'numbers', 'The grantor trust "tax burn"', [
    { value: START * RET * TAX, label: 'Income tax paid by the settlor, year one', sub: '$5M trust · 6% return · 37% rate', format: M, tone: 'green' },
    { value: grantorPath[4] - nonGrantorPath[4], label: 'Additional value inside the trust after 20 years', sub: 'Versus the trust paying its own tax', format: M, tone: 'gold' },
    { value: 0, label: 'Additional taxable gift', sub: 'Rev. Rul. 2004-64: the settlor paying the trust\'s income tax is not a gift', format: () => '$0', tone: 'blue' },
  ], ({ active }) => (
    <LineChart series={[{ label: 'Grantor trust (settlor pays tax)', values: grantorPath, tone: 'gold' }, { label: 'Non-grantor trust (trust pays tax)', values: nonGrantorPath, tone: 'ivory' }]} xLabels={YEARS.map((y) => `Yr ${y}`)} format={M} shownSeries={active ? 2 : 0} width={1000} height={560} area />
  ), [
    'This is the most elegant mechanism in the chapter and the easiest to oversell. The settlor pays tax on income he does not receive; the trust compounds gross. The ruling says that payment is not a further gift.',
    'Be scrupulous: the settlor still pays the tax. Nothing here eliminates tax; it changes who pays it and lets the transferred assets grow undiminished. Say that sentence exactly.',
  ], { assumptions: '$5M, 6% annual return, 37% effective rate on all trust income, 20 years; the non-grantor line compounds at 6% × (1 − 37%). Trust tax brackets compress quickly; actual rates differ.', cite: 'IRC §§671–677 · Rev. Rul. 2004-64' }),
  misconceptionSlide(ch, 'misconception', 'Putting assets in a trust removes them from your estate.',
    'Only some trusts do that. A revocable trust is fully included (§2038). An irrevocable trust is excluded only if the gift is complete and the settlor retains no prohibited interest or power (§§2036, 2038). Serving as your own trustee with discretion over distributions to yourself, or keeping the right to income, pulls the assets back in. Estate exclusion is a consequence of what you gave up, not of the word "trust".',
    'amber', [
      'Amber because the claim is true for some trusts and false for most of the ones people actually have.',
      'Point back to Chapter 03: retained control is retained inclusion.',
    ], { cite: 'IRC §§2036, 2038 · Estate of Powell (2017)' }),
  takeawaySlide(ch, [
    'Read the dials before the name: revocable or not, grantor or not, domestic or not, discretionary or not.',
    'What you give up is what keeps the trust out of your estate and away from your creditors.',
    'A trust is administered, not filed. Trustee discipline is the structure.',
  ], ['estate-planning', 'asset-protection', 'tax-planning', 'succession'], ['Then Chapter 07: the trust and the holding company start lending, and the family becomes its own bank.']),
];
