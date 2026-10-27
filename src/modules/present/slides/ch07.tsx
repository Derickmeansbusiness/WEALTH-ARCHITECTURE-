import type { Slide } from '@/types/present';
import { chapterById } from '@/content/chapters/manifest';
import { money } from '@/lib/format';
import { buildLoan } from '@/lib/finance';
import { EntityNode, FlowEdge, BarChart, BalanceSheet, Reveal } from '../visuals';
import { sectionCard, conceptSlide, diagramSlide, numbersSlide, misconceptionSlide, takeawaySlide } from './factories';

const ch = chapterById('ch07')!;
const M = (v: number) => money(v, { compact: true });

/** The promissory note cycle, with both balance sheets assembling beside it. */
function Diagram({ step }: { step: number; active: boolean }) {
  const bank = { x: 300, y: 200 }, child = { x: 300, y: 560 }, asset = { x: 760, y: 560 }, note = { x: 760, y: 200 };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1000px 1fr', gap: 30, height: '100%' }}>
      <svg className="present-svg" viewBox="0 0 1000 760" width={1000} height={760}>
        <EntityNode x={bank.x} y={bank.y} label="Family Bank" sub="Parents' LLC or trust · lender" tone="green" w={340} h={96} visible />
        <FlowEdge from={{ x: bank.x, y: bank.y + 48 }} to={{ x: child.x, y: child.y - 48 }} tone="green" visible={step >= 1} flow dot label="loan proceeds" />
        <EntityNode x={child.x} y={child.y} label="Child's Property LLC" sub="Borrower" tone="ivory" w={340} h={96} visible={step >= 1} />
        <FlowEdge from={{ x: child.x + 170, y: child.y }} to={{ x: asset.x - 150, y: asset.y }} tone="gold" visible={step >= 2} label="buys" />
        <EntityNode x={asset.x} y={asset.y} label="Rental property" sub="Productive asset · collateral" tone="gold" w={300} h={96} visible={step >= 2} />
        <FlowEdge from={{ x: asset.x, y: asset.y - 48 }} to={{ x: child.x + 90, y: child.y - 60 }} tone="green" visible={step >= 3} flow curve={-60} label="net rent" />
        <FlowEdge from={{ x: child.x + 100, y: child.y - 48 }} to={{ x: bank.x + 100, y: bank.y + 48 }} tone="green" visible={step >= 3} flow dot curve={-110} label="interest + principal" />
        <FlowEdge from={{ x: asset.x, y: asset.y - 48 }} to={{ x: bank.x + 170, y: bank.y + 10 }} tone="red" visible={step >= 4} dashed curve={-200} label="recorded mortgage / security interest" />
        <g style={{ opacity: step >= 4 ? 1 : 0, transition: 'opacity 0.6s var(--ease)' }}>
          <rect x={note.x - 180} y={note.y - 80} width={360} height={170} rx={16} fill="rgba(13,16,22,0.92)" stroke="var(--gold)" strokeWidth={1.5} />
          <text x={note.x} y={note.y - 42} textAnchor="middle" style={{ fontSize: 22, fill: 'var(--gold-2)', fontFamily: 'var(--font-display)' }}>Promissory note</text>
          {['Written · signed · dated', 'Interest ≥ AFR (§7872)', 'Fixed schedule · maturity', 'Secured · actually repaid'].map((t, i) => <text key={t} x={note.x} y={note.y - 8 + i * 26} textAnchor="middle" style={{ fontSize: 17, fill: 'var(--ivory-2)' }}>{t}</text>)}
        </g>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, justifyContent: 'center' }}>
        <Reveal on={step >= 5}>
          <div className="present-eyebrow" style={{ marginBottom: 10 }}>Family Bank balance sheet</div>
          <BalanceSheet assets={[{ label: 'Note receivable', value: 1_000_000, sub: 'An asset, not a gift' }]} liabilities={[]} equityLabel="Equity" format={M} compact />
        </Reveal>
        <Reveal on={step >= 5}>
          <div className="present-eyebrow" style={{ marginBottom: 10 }}>Child's LLC balance sheet</div>
          <BalanceSheet assets={[{ label: 'Rental property', value: 1_250_000 }]} liabilities={[{ label: 'Note payable to Family Bank', value: 1_000_000 }]} equityLabel="Child's equity" format={M} compact />
        </Reveal>
      </div>
    </div>
  );
}

const FAMILY = buildLoan({ principal: 1_000_000, annualRate: 0.04, termMonths: 120, structure: 'amortizing' });
const BANK = buildLoan({ principal: 1_000_000, annualRate: 0.08, termMonths: 120, structure: 'amortizing' });

export const ch07: Slide[] = [
  sectionCard(ch, 'Once the family has capital, it can earn the spread the bank used to earn.', [
    'The family bank is the engine from Chapter 02 meeting the architecture from Chapters 05 and 06. Say that, then show how it works.',
  ]),
  conceptSlide(ch, 'concept', 'Lending inside the family, properly', [
    { title: 'A real loan, or a gift with paperwork', body: 'The IRS and the courts ask the same question: was there a genuine expectation of repayment? Documentation, interest, schedule, security and actual payments answer it.' },
    { title: 'Interest at or above the AFR', body: 'IRC §7872 imputes interest on below-market loans; the applicable federal rate, published monthly, is the floor that keeps the loan a loan.' },
    { title: 'Both balance sheets move', body: 'The lender books a note receivable; the borrower books a note payable and an asset. Nothing is hidden; everything is recorded.' },
    { title: 'Capital stays in the family', body: 'Interest that would have gone to a commercial lender returns to the family reservoir, and the borrower often pays less than market.' },
    { title: 'What breaks it', body: 'No note, no interest, no payments, forgiveness every year without reporting, or lending to someone who could never repay. Then it was a gift all along, with gift-tax consequences.' },
  ], [
    'Five lines. The first and the last are the same point from two sides: substance decides. The Tax Court\'s bona fide debt factors, applied in cases like Miller v. Commissioner, are about behaviour over years, not the form of the note.',
    'Name the AFR and move on; students can look up the current rate. Ninety seconds.',
  ], { cite: 'IRC §7872 · Miller v. Comm\'r, T.C. Memo 1996-3, aff\'d 113 F.3d 1241 (9th Cir. 1997)' }),
  diagramSlide(ch, 'diagram', 'The promissory note cycle', Diagram, 6, [
    'Lender at the top, borrower below, asset to the right. Proceeds down, purchase across, rent back, debt service up. Then the two documents that make it real: a note with AFR interest and a schedule, and a recorded security interest.',
    'Last step: both balance sheets. The lender is richer by a receivable; the borrower owns a building and owes a note. This is how a family compounds without a gift.',
  ], { legend: true, cite: 'IRC §7872 · state recording statutes' }),
  numbersSlide(ch, 'numbers', 'A $1,000,000 ten-year loan: family bank versus commercial lender', [
    { value: FAMILY.annualDebtService, label: 'Annual payment at 4% (AFR-level)', sub: 'Amortizing, monthly', format: M, tone: 'green' },
    { value: BANK.annualDebtService, label: 'Annual payment at 8% (market)', sub: 'Same term and structure', format: M, tone: 'red' },
    { value: BANK.totalInterest - FAMILY.totalInterest, label: 'Interest kept in the family over ten years', sub: 'Plus the 4% interest the family bank earns', format: M, tone: 'gold' },
  ], ({ active }) => (
    <BarChart bars={[
      { label: 'Interest at 4%', value: FAMILY.totalInterest, tone: 'green', sub: 'paid to the family bank' },
      { label: 'Interest at 8%', value: BANK.totalInterest, tone: 'red', sub: 'paid to a commercial lender' },
    ]} shown={active ? 2 : 0} format={M} width={1000} height={560} />
  ), [
    'Same loan, two lenders. At the family rate the borrower pays less and the family keeps the interest. The counters are from the shared finance library, not round numbers.',
    'Say the caveat: the AFR changes monthly and the family bank must actually collect. A loan nobody services is a gift with extra steps.',
  ], { assumptions: 'buildLoan({principal: 1,000,000, termMonths: 120, structure: amortizing}) at 4% vs 8%. AFR illustrative; check the current month\'s rate.', cite: 'IRC §7872 · Rev. Rul. (monthly AFR)' }),
  misconceptionSlide(ch, 'misconception', 'Family loans don\'t need interest or paperwork.',
    'A loan without adequate interest triggers imputed interest under IRC §7872 and the foregone interest is treated as a gift. A loan without a note, a schedule and actual payments is, on the Tax Court\'s factors, not a loan at all; it is a gift that nobody reported. The paperwork is not a formality; it is the evidence that there was a loan.',
    'red', [
      'Red as stated. This is the single most common failure in family lending and the easiest to prevent.',
      'Mention annual forgiveness programs: possible, but reported, and the pattern itself is evidence against the loan.',
    ], { cite: 'IRC §7872 · IRC §2501 · Miller v. Comm\'r (1996)' }),
  takeawaySlide(ch, [
    'A family loan is a real loan: written, interest-bearing at or above the AFR, scheduled, secured, and actually repaid.',
    'Both balance sheets change. Keep both sets of books.',
    'The spread a bank would have earned now compounds inside the family.',
  ], ['tax-planning', 'succession', 'governance'], ['Then Chapter 08: the whole system in one cascade, from labour to family capital and back.']),
];
