import type { Slide } from '@/types/present';
import { chapterById } from '@/content/chapters/manifest';
import { pct } from '@/lib/format';
import { EntityNode, FlowEdge, BarChart, Glass } from '../visuals';
import { sectionCard, conceptSlide, diagramSlide, numbersSlide, misconceptionSlide, takeawaySlide } from './factories';

const ch = chapterById('ch12')!;

/** A jurisdictional boundary: ownership moves across it, reporting and tax arrows come straight back. */
function Diagram({ step }: { step: number; active: boolean }) {
  const grantor = { x: 300, y: 380 }, irs = { x: 300, y: 120 }, fincen = { x: 300, y: 640 };
  const trust = { x: 1120, y: 380 }, trustee = { x: 1120, y: 120 }, llc = { x: 1480, y: 380 }, bank = { x: 1480, y: 640 };
  return (
    <svg className="present-svg" viewBox="0 0 1680 760" width={1680} height={760}>
      <line x1={760} y1={0} x2={760} y2={760} stroke="var(--blue)" strokeWidth={2} strokeDasharray="14 12" opacity={0.7} />
      <text x={740} y={40} textAnchor="end" style={{ fontSize: 16, fill: 'var(--blue)', letterSpacing: '0.24em' }}>HOME JURISDICTION (U.S. PERSON)</text>
      <text x={780} y={40} style={{ fontSize: 16, fill: 'var(--blue)', letterSpacing: '0.24em' }}>FOREIGN JURISDICTION (EXAMPLE, NOT A RECOMMENDATION)</text>
      <EntityNode x={grantor.x} y={grantor.y} label="U.S. grantor" sub="Resident · citizen · taxpayer" tone="gold" w={320} h={96} visible />
      <FlowEdge from={{ x: grantor.x + 160, y: grantor.y }} to={{ x: trust.x - 170, y: trust.y }} tone="gold" visible={step >= 1} label="settles · transfers assets (completed or incomplete gift)" />
      <EntityNode x={trust.x} y={trust.y} label="Foreign trust" sub="Spendthrift · discretionary · duress clause" tone="violet" w={340} h={96} visible={step >= 1} />
      <FlowEdge from={{ x: trustee.x, y: trustee.y + 48 }} to={{ x: trust.x, y: trust.y - 48 }} tone="blue" visible={step >= 1} label="licensed foreign trustee" />
      <EntityNode x={trustee.x} y={trustee.y} label="Foreign trustee" sub="Control sits abroad" tone="blue" w={320} h={96} visible={step >= 1} />
      <FlowEdge from={{ x: trust.x + 170, y: trust.y }} to={{ x: llc.x - 140, y: llc.y }} tone="gold" visible={step >= 2} label="owns" />
      <EntityNode x={llc.x} y={llc.y} label="Foreign LLC" sub="Holds the portfolio" tone="ivory" w={280} h={96} visible={step >= 2} />
      <FlowEdge from={{ x: llc.x, y: llc.y + 48 }} to={{ x: bank.x, y: bank.y - 48 }} tone="gold" visible={step >= 2} />
      <EntityNode x={bank.x} y={bank.y} label="Custodian bank" sub="KYC · beneficial-owner file" tone="ivory" w={280} h={96} visible={step >= 2} />
      {/* reporting arrows back */}
      <EntityNode x={irs.x} y={irs.y} label="IRS" sub="Forms 3520 · 3520-A · 8938" tone="blue" w={320} h={96} visible={step >= 3} />
      <EntityNode x={fincen.x} y={fincen.y} label="FinCEN" sub="FBAR (FinCEN 114)" tone="blue" w={320} h={96} visible={step >= 3} />
      <FlowEdge from={{ x: trust.x - 100, y: trust.y - 48 }} to={{ x: irs.x + 160, y: irs.y + 20 }} tone="blue" visible={step >= 3} curve={-120} flow label="annual trust reporting" />
      <FlowEdge from={{ x: bank.x - 140, y: bank.y + 10 }} to={{ x: fincen.x + 160, y: fincen.y }} tone="blue" visible={step >= 3} curve={120} flow label="foreign account reporting" />
      <FlowEdge from={{ x: trust.x - 120, y: trust.y + 48 }} to={{ x: grantor.x + 160, y: grantor.y + 40 }} tone="green" visible={step >= 4} curve={60} dashed label="income taxed to grantor · §679" />
      {/* contempt arrow */}
      <FlowEdge from={{ x: 80, y: 740 }} to={{ x: grantor.x - 100, y: grantor.y + 60 }} tone="red" visible={step >= 5} flow label="U.S. court: turnover order → contempt (Anderson)" />
      <g style={{ opacity: step >= 6 ? 1 : 0, transition: 'opacity 0.6s var(--ease)' }}>
        <foreignObject x={790} y={530} width={860} height={220}>
          <div><Glass tone="amber" style={{ padding: '20px 28px' }}>
            <div className="present-kicker" style={{ color: 'var(--amber)' }}>What crossing the line does, and does not do</div>
            <p style={{ fontSize: 20 }}>It changes the forum, the governing law and the creditor\'s burden. It does not change who the taxpayer is, what must be reported, or a U.S. court\'s power over a U.S. person standing in front of it. Lawful privacy and full disclosure to the authorities coexist by design.</p>
          </Glass></div>
        </foreignObject>
      </g>
    </svg>
  );
}

export const ch12: Slide[] = [
  sectionCard(ch, 'Moving the fence abroad changes the forum. It changes nothing about the taxpayer.', [
    'The field\'s most mythologised chapter. Deflate the myth in the first sentence and then teach what offshore structures actually do.',
  ]),
  conceptSlide(ch, 'concept', 'What an offshore structure actually changes', [
    { title: 'Forum and governing law', body: 'A creditor must sue where the trust sits, under that jurisdiction\'s rules: shorter limitation periods, higher burdens of proof, no enforcement of foreign judgments. That is the real product.' },
    { title: 'Not the taxpayer', body: 'A foreign trust with U.S. beneficiaries is generally a grantor trust under IRC §679. The U.S. grantor pays tax on worldwide income exactly as before.' },
    { title: 'Not the reporting', body: 'Forms 3520 and 3520-A for the trust, FBAR (FinCEN 114) and Form 8938 for the accounts, beneficial-ownership files at every bank. Offshore is the most reported structure a family can own.' },
    { title: 'Not the court\'s power over you', body: 'In FTC v. Affordable Media (the Anderson case), settlors who claimed they could not repatriate trust assets were jailed for contempt. Duress clauses protect the trustee, not the settlor.' },
    { title: 'No jurisdiction is "best"', body: 'Cook Islands, Nevis, Belize, the Channel Islands, Liechtenstein: each suits different residences, asset types and objectives. Suitability is a professional judgment about the family, not a ranking of islands.' },
  ], [
    'Five lines. The first is the honest sales pitch for offshore trusts; the next three are the honest disclaimers; the fifth is the course\'s principle. Give equal weight.',
    'Say Anderson\'s facts plainly: the settlors were held in contempt for six months. That is the risk a duress clause does not remove.',
    'Ninety seconds.',
  ], { cite: 'IRC §§679, 6048 · 31 U.S.C. §5314 (FBAR) · FTC v. Affordable Media, LLC, 179 F.3d 1228 (9th Cir. 1999)' }),
  diagramSlide(ch, 'diagram', 'The boundary, the ownership and the arrows that come straight back', Diagram, 7, [
    'Draw the line. Move ownership across it: grantor settles a foreign trust, a foreign trustee controls it, a foreign LLC and custodian hold the assets. Then the blue arrows return: trust reporting to the IRS, account reporting to FinCEN. Then the green §679 tax arrow back to the grantor.',
    'Step five is the red arrow: a U.S. court orders turnover and the grantor cannot hide behind the trustee. Last step, the amber panel: what crossing the line does and does not do. Two minutes.',
  ], { legend: [{ tone: 'gold', label: 'Ownership' }, { tone: 'blue', label: 'Control / reporting' }, { tone: 'green', label: 'Tax' }, { tone: 'red', label: 'Court power' }], cite: 'IRC §679 · Forms 3520, 3520-A, 8938 · FinCEN 114' }),
  numbersSlide(ch, 'numbers', 'The cost of not reporting', [
    { value: 0.35, label: 'Form 3520 · transfers to a foreign trust', sub: 'Greater of $10,000 or 35% of the gross value transferred or distributed', format: (v) => pct(v, 0), tone: 'red' },
    { value: 0.05, label: 'Form 3520-A · annual trust return', sub: '5% of the gross value of trust assets treated as owned by the U.S. person', format: (v) => pct(v, 0), tone: 'amber' },
    { value: 0.5, label: 'FBAR · wilful failure', sub: 'Up to 50% of the account balance per violation; criminal exposure possible', format: (v) => pct(v, 0), tone: 'red' },
  ], ({ active }) => (
    <BarChart bars={[
      { label: 'Form 3520', value: 35, tone: 'red', sub: 'of amount transferred' }, { label: 'Form 3520-A', value: 5, tone: 'amber', sub: 'of trust assets' }, { label: 'FBAR (wilful)', value: 50, tone: 'red', sub: 'of account balance' }, { label: 'Tax eliminated', value: 0, tone: 'green', sub: 'by going offshore' },
    ]} shown={active ? 4 : 0} format={(v) => `${v}%`} max={50} width={1000} height={560} baseline="Civil penalty exposure (illustrative of statutory maxima)" />
  ), [
    'The penalties are the point. Nobody who understands these numbers thinks of offshore as hiding. The last bar is the course\'s principle drawn as a chart: tax eliminated, zero.',
    'Penalty regimes change and are litigated (the Bittner decision on non-wilful FBAR penalties, for example). Say "statutory maxima; check current guidance".',
  ], { assumptions: 'statutory penalty rates under IRC §6677 and 31 U.S.C. §5321 as commonly stated; reasonable-cause relief and current guidance apply.', cite: 'IRC §6677 · 31 U.S.C. §5321 · Bittner v. United States, 598 U.S. 85 (2023)' }),
  misconceptionSlide(ch, 'misconception', 'Offshore means hidden and untaxed.',
    'A U.S. person\'s foreign trust is reported annually to the IRS, its accounts to FinCEN, and its beneficial owner to every bank that touches it. Under §679 its income is taxed to the grantor. What an offshore trust changes is the forum a creditor must fight in and the law that applies there. Lawful privacy from the public and complete disclosure to the authorities are both true at the same time, and the structure only works if they are.',
    'red', [
      'Red as stated. This is the sentence that gets people indicted. Say that.',
      'Distinguish lawful privacy (no public register in many jurisdictions) from concealment (lying to a bank or a tax authority). The platform treats the first as a right and the second as a crime.',
    ], { cite: 'IRC §679 · §6048 · 31 U.S.C. §5314 · FTC v. Affordable Media (1999)' }),
  takeawaySlide(ch, [
    'Offshore changes the forum and the burden. It does not change the taxpayer, the reporting or the court\'s power over you.',
    'Lawful privacy and full disclosure to authorities are the same structure seen from two sides.',
    'No jurisdiction is best. Suitability is a judgment about the family, made by professionals in both countries.',
  ], ['asset-protection', 'privacy', 'tax-planning'], ['Then Chapter 13: moving everything we have built to the next generation, and the one after that.']),
];
