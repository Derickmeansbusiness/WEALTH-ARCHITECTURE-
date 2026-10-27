import type { Slide } from '@/types/present';
import { chapterById } from '@/content/chapters/manifest';
import { money } from '@/lib/format';
import { BarChart, Glass, TONE_COLOR } from '../visuals';
import { sectionCard, conceptSlide, diagramSlide, numbersSlide, misconceptionSlide, takeawaySlide } from './factories';

const ch = chapterById('ch10')!;
const M = (v: number) => money(v, { compact: true });

const RINGS: { label: string; sub: string; tone: 'red' | 'amber' | 'blue' | 'green' | 'violet' | 'gold' }[] = [
  { label: 'Property & casualty', sub: 'First line: the premises, the vehicles, the business', tone: 'red' },
  { label: 'Umbrella / excess liability', sub: 'Cheap capacity above the primary limits', tone: 'amber' },
  { label: 'Professional · D&O · E&O', sub: 'Decisions and advice, not accidents', tone: 'blue' },
  { label: 'Key-person & buy-sell funding', sub: 'Life insurance that keeps the business whole', tone: 'green' },
  { label: 'ILIT-owned life insurance', sub: 'Estate liquidity outside the estate (§2042)', tone: 'violet' },
  { label: 'Captive (specialised)', sub: 'Own the insurer; heavily scrutinised (§831(b))', tone: 'gold' },
];

/** Concentric insurance layers wrapping the architecture. */
function Diagram({ step }: { step: number; active: boolean }) {
  const cx = 560, cy = 390;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1120px 1fr', gap: 20, height: '100%' }}>
      <svg className="present-svg" viewBox="0 0 1120 760" width={1120} height={760}>
        {RINGS.map((r, i) => {
          const rad = 120 + (i + 1) * 42;
          const on = step >= i + 1;
          return (
            <g key={r.label} style={{ opacity: on ? 1 : 0, transition: 'opacity 0.7s var(--ease), transform 0.7s var(--ease)', transform: `scale(${on ? 1 : 0.9})`, transformOrigin: `${cx}px ${cy}px` }}>
              <circle cx={cx} cy={cy} r={rad} fill={TONE_COLOR[r.tone]} opacity={0.05} />
              <circle cx={cx} cy={cy} r={rad} fill="none" stroke={TONE_COLOR[r.tone]} strokeWidth={2} strokeDasharray={i === 5 ? '8 10' : undefined} opacity={0.9} />
              <text x={cx + rad * 0.72 + 10} y={cy - rad * 0.72 - 6} style={{ fontSize: 18, fill: TONE_COLOR[r.tone], letterSpacing: '0.06em' }}>{r.label}</text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={120} fill="rgba(13,16,22,0.95)" stroke="var(--gold)" strokeWidth={2} />
        <text x={cx} y={cy - 14} textAnchor="middle" style={{ fontSize: 26, fill: 'var(--ivory)', fontFamily: 'var(--font-display)' }}>The architecture</text>
        <text x={cx} y={cy + 18} textAnchor="middle" style={{ fontSize: 16, fill: 'var(--gold)', letterSpacing: '0.14em' }}>ENTITIES · TRUSTS · BANK</text>
        {/* a claim arriving from outside */}
        <g style={{ opacity: step >= 7 ? 1 : 0, transition: 'opacity 0.6s var(--ease)' }}>
          <line x1={60} y1={700} x2={cx - 300} y2={cy + 220} stroke="var(--red)" strokeWidth={3} className="present-flow" />
          <circle cx={cx - 300} cy={cy + 220} r={16} fill="var(--red)" opacity={0.4} />
          <text x={70} y={690} style={{ fontSize: 17, fill: '#e7a398' }}>$4M liability claim</text>
          <text x={cx - 290} y={cy + 262} style={{ fontSize: 16, fill: '#e7a398' }}>absorbed by primary + umbrella</text>
        </g>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
        {RINGS.map((r, i) => (
          <Glass key={r.label} on={step >= i + 1} tone={r.tone} style={{ padding: '14px 22px' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}><span className="mono" style={{ color: TONE_COLOR[r.tone], fontSize: 18 }}>0{i + 1}</span><span style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--ivory)' }}>{r.label}</span></div>
            <p style={{ fontSize: 17, color: 'var(--ivory-3)', marginTop: 4 }}>{r.sub}</p>
          </Glass>
        ))}
      </div>
    </div>
  );
}

const ESTATE = 30_000_000, EXEMPTION = 14_000_000, RATE = 0.4, LIQUID = 4_000_000, POLICY = 8_000_000;
const TAX = (ESTATE - EXEMPTION) * RATE;

export const ch10: Slide[] = [
  sectionCard(ch, 'Insurance is the layer that pays when every other layer is being argued about.', [
    'Practitioners put insurance first in the asset-protection stack and students put it last. Fix that order here.',
  ]),
  conceptSlide(ch, 'concept', 'Six kinds of insurance, six different jobs', [
    { title: 'Liability coverage is the first fence', body: 'Before any entity or trust: primary property and casualty, then an umbrella. A paid claim never reaches the architecture at all.' },
    { title: 'Life insurance is liquidity on a date nobody chooses', body: 'Estate tax is due nine months after death (§6075). Illiquid estates sell assets badly. Insurance is cash on that day.' },
    { title: 'Ownership decides inclusion', body: 'If the insured holds incidents of ownership, the death benefit is in the estate (§2042). An irrevocable life insurance trust owns the policy so it is not, subject to the three-year rule for transferred policies (§2035).' },
    { title: 'Buy-sell and key-person', body: 'Insurance that lets partners buy a deceased partner\'s interest at a set price, so the business and the family both survive the funeral.' },
    { title: 'Captives, carefully', body: 'A family can own its own insurer. Legitimate when it insures real risk at arm\'s-length premiums; §831(b) micro-captives are on the IRS\'s listed-transaction radar.' },
    { title: 'The tax questions', body: 'Income tax on the death benefit (§101), estate inclusion (§2042), transfer-for-value (§101(a)(2)), MEC status (§7702A). Every policy decision raises at least one of them.' },
  ], [
    'Six lines, all operational. The surprise for most students is §2042: a policy you own on your own life is in your estate. The ILIT exists to fix exactly that.',
    'Say "captive" with a straight face and a warning. They work for real risk; they are abused for everything else.',
    'Ninety seconds.',
  ], { cite: 'IRC §§101, 2035, 2042, 6075, 7702A, 831(b)' }),
  diagramSlide(ch, 'diagram', 'Insurance layers wrapping the architecture', Diagram, 8, [
    'Build the rings outward: primary casualty, umbrella, professional lines, key-person and buy-sell, the ILIT ring that sits outside the estate, and the dashed captive ring that only some families should have.',
    'Last step: a four-million-dollar claim arrives and is absorbed by the first two rings. The entities and trusts were never tested. That is the point.',
  ], { legend: [{ tone: 'red', label: 'Liability' }, { tone: 'green', label: 'Liquidity' }, { tone: 'violet', label: 'Outside the estate' }] }),
  numbersSlide(ch, 'numbers', 'The estate liquidity gap', [
    { value: TAX, label: 'Federal estate tax due in nine months', sub: `$30M estate · ~$14M exemption · 40% on the excess`, format: M, tone: 'red' },
    { value: LIQUID, label: 'Liquid assets in the estate', sub: 'The rest is the business and the buildings', format: M, tone: 'amber' },
    { value: POLICY, label: 'ILIT-owned death benefit', sub: 'Outside the estate; lends to or buys from the estate', format: M, tone: 'green' },
  ], ({ active }) => (
    <BarChart bars={[
      { label: 'Tax due', value: TAX, tone: 'red' }, { label: 'Liquid assets', value: LIQUID, tone: 'amber' }, { label: 'Shortfall', value: TAX - LIQUID, tone: 'red', sub: 'forced sale territory' }, { label: 'ILIT benefit', value: POLICY, tone: 'green' },
    ]} shown={active ? 4 : 0} format={M} width={1000} height={560} />
  ), [
    'A thirty-million estate, mostly illiquid. Tax of roughly six million is due in nine months and there is four million in cash. Without the policy, something gets sold at a discount to a buyer who knows the deadline.',
    'The ILIT does not reduce the tax. It funds it. Say that clearly; students conflate the two.',
  ], { assumptions: 'federal only; exemption shown as approximately $14M per person (2025, indexed; scheduled to change under current law); 40% marginal rate; no portability, deductions or state estate tax; §6166 deferral not elected.', cite: 'IRC §§2001, 2010, 2042, 6075, 6166' }),
  misconceptionSlide(ch, 'misconception', 'Life insurance is always tax-free.',
    'The death benefit is generally free of income tax under §101(a). It is not free of estate tax if the insured owned the policy (§2042), or transferred it within three years of death (§2035). Sell a policy and the transfer-for-value rule can make the benefit taxable. Overfund a policy and it becomes a modified endowment contract under §7702A with different rules for withdrawals. "Tax-free" is true of one tax, under conditions.',
    'amber', [
      'Amber because the claim is true for income tax and misleading for everything else. Students should hear the four code sections.',
    ], { cite: 'IRC §§101(a), 2035, 2042, 7702A' }),
  takeawaySlide(ch, [
    'Buy liability coverage before you build entities; the cheapest fence is a paid claim.',
    'Life insurance is liquidity on a date you do not choose. Own it outside the estate if that is the goal.',
    'Every policy raises a tax question. Ask it before signing, not after a death.',
  ], ['asset-protection', 'estate-planning', 'succession'], ['Then Chapter 11: what happens when a claim does get past the insurance.']),
];
