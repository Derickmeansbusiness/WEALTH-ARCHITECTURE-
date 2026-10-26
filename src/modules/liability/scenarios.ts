import type { AssetId } from './structure';

/** Facts that undermine barriers. All default false (the "well-run" structure). */
export interface Facts {
  personalGuarantee: boolean;
  commingled: boolean;
  lateTransfer: boolean;
  undercapitalized: boolean;
  weakChargingOrder: boolean;
  insuranceLapsed: boolean;
  noOperatingAgreements: boolean;
}
export const DEFAULT_FACTS: Facts = {
  personalGuarantee: false, commingled: false, lateTransfer: false, undercapitalized: false, weakChargingOrder: false, insuranceLapsed: false, noOperatingAgreements: false,
};
export const FACT_META: { id: keyof Facts; label: string; hint: string }[] = [
  { id: 'personalGuarantee', label: 'Personal guarantee on the mortgage', hint: 'The founder signed a recourse guarantee for Property LLC #1\'s loan. The lender can now reach the founder personally if the LLC defaults.' },
  { id: 'commingled', label: 'Commingled accounts (Property LLC ↔ personal)', hint: 'Rent deposited into the personal account, personal bills paid from the LLC account. Classic alter-ego evidence.' },
  { id: 'lateTransfer', label: 'Transfer to irrevocable trust AFTER the claim arose', hint: 'Assets moved into the ILIT/irrevocable trust once the claim was foreseeable. Voidable transfer exposure (UVTA / 11 U.S.C. §548).' },
  { id: 'undercapitalized', label: 'Operating Co undercapitalized / no formalities', hint: 'Thin capital, no minutes, no separate books, insurance below industry norms. Veil-piercing factors.' },
  { id: 'weakChargingOrder', label: 'Single-member LLC in a weak charging-order state', hint: 'Some states let a creditor foreclose on or dissolve a single-member LLC (e.g. the reasoning in Olmstead v. FTC (Fla. 2010); In re Albright (Bankr. D. Colo. 2003)).' },
  { id: 'insuranceLapsed', label: 'Insurance lapsed', hint: 'Landlord liability, CGL and umbrella policies not renewed. Insurance is the first layer; without it, equity absorbs the claim.' },
  { id: 'noOperatingAgreements', label: 'No operating agreements', hint: 'Default state statute governs management, succession and transfer. Weakens formalities and incapacity/death continuity.' },
];

export type Outcome = 'exposed' | 'blocked' | 'absorbed' | 'weakened' | 'info';
export interface Step {
  id: string;
  from: string;
  to: string;
  title: string;
  barrier?: string;
  narrative: string;
  outcome: Outcome;
  cite?: string;
  exposes?: AssetId[];
  weakens?: AssetId[];
  /** true when a fact toggle changed this step from the baseline */
  breach?: boolean;
}

export type ScenarioId = 'tenant' | 'customer' | 'partner' | 'personal' | 'divorce' | 'death' | 'incapacity' | 'bankruptcy';
export interface Scenario {
  id: ScenarioId;
  label: string;
  origin: string;
  tokenLabel: string;
  summary: string;
  explainer: { title: string; body: string }[];
  build: (f: Facts) => Step[];
}

const INS = (f: Facts, from: string, who: string, policy: string): Step =>
  f.insuranceLapsed
    ? { id: 'ins', from, to: 'umbrella', title: 'Insurance would respond first — but it lapsed', barrier: 'Insurance (lapsed)', narrative: `${who} tenders the claim to the carrier. The ${policy} was not renewed. No defense counsel is paid for, no indemnity. The full judgment lands on equity. Insurance is the first wall in every liability map, and it is the wall most often lost to a missed premium.`, outcome: 'weakened', breach: true }
    : { id: 'ins', from, to: 'umbrella', title: 'Insurance responds first', barrier: 'Insurance pays first', narrative: `${who} tenders the claim. The ${policy} picks up defense costs and pays the judgment up to policy limits. Only the excess, if any, reaches the balance sheet. Most real claims end here, which is why practitioners size limits before they design entities.`, outcome: 'absorbed' };

export const SCENARIOS: Scenario[] = [
  {
    id: 'tenant', label: 'Tenant lawsuit', origin: 'rental1', tokenLabel: 'Tenant judgment',
    summary: 'A tenant is injured at Rental #1 and sues for $1.8M. This is an "inside" liability: it arises inside an entity and wants to travel upward and sideways.',
    explainer: [
      { title: 'Inside vs outside liability', body: 'An inside liability originates in an entity\'s own activity (the stairwell, the product, the employee). The entity is the defendant. A properly maintained LLC limits the claim to that entity\'s assets; the member is not liable for the LLC\'s debts merely by being a member (e.g. Del. Code tit. 6, §18-303; Wyo. Stat. §17-29-304 and their analogues).' },
      { title: 'Why sibling LLCs matter', body: 'Rental #2 and the brokerage account sit in separate LLCs. The claim against Property LLC #1 does not travel horizontally. If both rentals were in one LLC, the equity of both would be on the table.' },
    ],
    build: (f) => {
      const s: Step[] = [];
      s.push({ id: 'origin', from: 'rental1', to: 'prop1', title: 'Claim arises inside Property LLC #1', narrative: 'The tenant\'s negligence claim is against the owner of record: Property LLC #1. Its assets (the rental, its operating account, its rent roll) are the defendant\'s assets. Nothing shields them from this claim; that is what the entity is for.', outcome: 'exposed', exposes: ['rental1'] });
      s.push(INS(f, 'prop1', 'The LLC', 'landlord liability policy and umbrella'));
      s.push({ id: 'lender', from: 'prop1', to: 'lender', title: 'The mortgage lender is senior', narrative: 'If the judgment forces a sale of Rental #1, the recorded mortgage is paid before any unsecured judgment creditor. The tenant reaches equity, not gross value. Lenders position themselves ahead of tort creditors by design.', outcome: 'info' });
      if (f.commingled) {
        s.push({ id: 'pierce', from: 'prop1', to: 'hold', title: 'Veil piercing: commingled accounts', barrier: 'Entity separateness (undermined)', narrative: 'Discovery shows rent deposited into the founder\'s personal account and personal expenses paid from the LLC account. The tenant\'s counsel pleads alter ego: the LLC was a mere instrumentality with no separate economic existence. Courts weigh commingling, undercapitalization, lack of formalities and injustice. Here the member (Holding LLC) and, through it, the founder are pulled into the suit.', outcome: 'exposed', breach: true, cite: 'Alter-ego / veil-piercing doctrine; factors vary by state (compare Del. and Cal. standards).', exposes: [] });
        s.push({ id: 'pierce2', from: 'hold', to: 'ind', title: 'The pierce continues to the person who commingled', narrative: 'Because the founder personally mixed the funds, the alter-ego theory runs through Holding LLC to the founder. Personal bank account exposed. Sibling LLCs are now at risk too, because the creditor has a judgment against their parent.', outcome: 'exposed', breach: true, exposes: ['bank', 'rental2', 'brokerage', 'biz'] });
        s.push({ id: 'home', from: 'ind', to: 'home', title: 'Residence: homestead / tenancy by the entirety', barrier: 'Homestead · TBE', narrative: 'Only the founder is liable, not the spouse. In a tenancy-by-the-entirety state a creditor of one spouse generally cannot reach entireties property; elsewhere a homestead exemption protects some or all of the equity (unlimited in Florida and Texas, capped in most states). The residence holds, for now.', outcome: 'blocked' });
      } else {
        s.push({ id: 'up', from: 'prop1', to: 'hold', title: 'Claim tries to travel upward to the member', barrier: 'Inside liability contained in the LLC', narrative: `A judgment against Property LLC #1 is not a judgment against its member. The tenant can take the LLC's assets; it cannot take Holding LLC's other interests. ${f.noOperatingAgreements ? 'Caution: with no operating agreement and thin formalities, the alter-ego argument is weaker than it should be. On these facts the wall holds, but with less margin.' : 'Books were separate, formalities observed, the LLC was adequately insured. The wall holds.'}`, outcome: 'blocked', cite: 'LLC member non-liability statutes (e.g. 6 Del. C. §18-303).' });
      }
      if (f.personalGuarantee) {
        s.push({ id: 'pg', from: 'lender', to: 'ind', title: 'Deficiency on the guaranteed mortgage', barrier: 'Non-recourse (waived by guarantee)', narrative: 'The judgment drains the LLC\'s cash; it stops paying the mortgage. The lender forecloses and the sale leaves a shortfall. Because the founder signed a personal guarantee, the lender pursues the founder directly for the deficiency. The guarantee turned an inside liability into an outside one.', outcome: 'exposed', breach: true, exposes: ['bank'] });
      }
      s.push({ id: 'side', from: 'prop1', to: 'prop2', title: 'Horizontal travel to sibling LLCs', barrier: 'Separate legal persons', narrative: f.commingled ? 'Already reached through the parent. Separate entities only help when they are actually kept separate.' : 'Property LLC #2, Investment LLC and Operating Co are separate persons with separate owners of record. The tenant has no claim against them. Siloing each asset is the cheapest protection in the whole map.', outcome: f.commingled ? 'exposed' : 'blocked' });
      s.push({ id: 'ilit', from: 'ind', to: 'ilit', title: 'Irrevocable trust and life insurance', barrier: 'Irrevocable · spendthrift · third-party trust', narrative: 'The ILIT is not the founder\'s property. The founder retained no beneficial interest and the trust has a spendthrift clause. A tenant creditor of the LLC (or even of the founder) does not reach the policy.', outcome: 'blocked' });
      return s;
    },
  },
  {
    id: 'customer', label: 'Business customer claim', origin: 'biz', tokenLabel: 'Customer claim',
    summary: 'A customer alleges a defective installation caused $2.5M of damage. The claim is against Operating Co LLC.',
    explainer: [
      { title: 'Veil piercing is fact-driven', body: 'Courts rarely pierce a well-run LLC. They do pierce when the entity was a shell: no capital, no records, personal and business money mixed, insurance far below industry norms, and the creditor would otherwise be left with an unjust result. Formalities are not paperwork; they are the evidence that the entity was real.' },
    ],
    build: (f) => {
      const s: Step[] = [];
      s.push({ id: 'origin', from: 'biz', to: 'opco', title: 'Claim arises inside Operating Co', narrative: 'The customer sues the contracting party: Operating Co LLC. Its receivables, equipment and bank balance are exposed. The enterprise value of the business is on the table.', outcome: 'exposed', exposes: ['biz'] });
      s.push(INS(f, 'opco', 'Operating Co', 'commercial general liability policy'));
      if (f.undercapitalized) {
        s.push({ id: 'pierce', from: 'opco', to: 'hold', title: 'Veil piercing: undercapitalized, no formalities', barrier: 'Entity separateness (undermined)', narrative: 'Operating Co kept $5,000 in the bank against $4M of annual contracts, never held a members\' meeting, had no separate books and carried no insurance appropriate to its trade. The customer pleads alter ego and the court agrees. The member, Holding LLC, is now liable.', outcome: 'exposed', breach: true, cite: 'Veil-piercing factors: undercapitalization, failure to observe formalities, commingling, siphoning, injustice.', exposes: [] });
        if (f.commingled) {
          s.push({ id: 'pierce2', from: 'hold', to: 'ind', title: 'Second pierce to the founder', narrative: 'Holding LLC was itself run through the founder\'s personal account. The alter-ego chain continues to the individual. Every asset owned through the chain is now reachable.', outcome: 'exposed', breach: true, exposes: ['bank', 'rental1', 'rental2', 'brokerage'] });
        } else {
          s.push({ id: 'holdassets', from: 'hold', to: 'prop2', title: 'Holding LLC\'s assets become reachable', narrative: 'Holding LLC owns the membership interests in every subsidiary. A creditor of Holding LLC can obtain a charging order against those interests and, in many states, foreclose on them. The siloing below the parent is defeated from above.', outcome: 'exposed', breach: true, exposes: ['rental1', 'rental2', 'brokerage'] });
        }
      } else {
        s.push({ id: 'up', from: 'opco', to: 'hold', title: 'Claim tries to travel to the member', barrier: 'Inside liability contained in the LLC', narrative: `Operating Co was adequately capitalized, kept separate books and observed formalities. The judgment stays inside. ${f.noOperatingAgreements ? 'The missing operating agreement is a weakness the plaintiff will raise; alone it is rarely enough to pierce.' : ''}`, outcome: 'blocked' });
      }
      s.push({ id: 'side', from: 'opco', to: 'prop1', title: 'Horizontal travel to property and investment LLCs', barrier: 'Separate legal persons', narrative: f.undercapitalized ? 'Reached via the parent.' : 'The rentals and the brokerage account belong to different entities. The customer cannot touch them.', outcome: f.undercapitalized ? 'exposed' : 'blocked' });
      s.push({ id: 'personal', from: 'opco', to: 'ind', title: 'Does the founder owe anything personally?', barrier: 'Limited liability', narrative: 'Only if the founder personally committed the tort (an LLC never shields a person from their own negligence), signed a personal guarantee to this customer, or the veil is pierced. On these facts the founder\'s personal assets stay outside the case.', outcome: f.undercapitalized && f.commingled ? 'exposed' : 'blocked' });
      return s;
    },
  },
  {
    id: 'partner', label: 'Partner dispute', origin: 'opco', tokenLabel: 'Partner claim',
    summary: 'A minority co-owner of Operating Co alleges the founder, as manager, diverted opportunities and seeks damages and dissolution.',
    explainer: [
      { title: 'Why this one is different', body: 'A partner dispute attacks the founder personally (breach of fiduciary duty as manager) and attacks the entity\'s governance (deadlock, dissolution). LLC walls do nothing against a claim for the founder\'s own conduct. What matters is the operating agreement: buy-sell terms, valuation method, deadlock mechanism, and whether charging-order protection stands between a judgment and the family\'s holding structure.' },
    ],
    build: (f) => {
      const s: Step[] = [];
      s.push({ id: 'origin', from: 'opco', to: 'opco', title: 'Dispute among members of Operating Co', narrative: f.noOperatingAgreements ? 'There is no operating agreement. The default statute governs: no buy-sell price, no deadlock procedure, judicial dissolution available on "not reasonably practicable" grounds. The partner petitions to dissolve. The business itself is at risk of a forced sale.' : 'The operating agreement has a buy-sell at appraised value, a mediation-then-arbitration clause and a deadlock mechanism. The dispute is channelled into a priced exit rather than a dissolution fight. Enterprise value is preserved.', outcome: f.noOperatingAgreements ? 'exposed' : 'blocked', breach: f.noOperatingAgreements, exposes: f.noOperatingAgreements ? ['biz'] : [], barrier: 'Operating agreement' });
      s.push({ id: 'fid', from: 'opco', to: 'ind', title: 'Fiduciary claim against the founder personally', narrative: 'The partner alleges the founder, acting as manager, breached duties of loyalty. That is the founder\'s own conduct. No entity shields a person from their own breach. A judgment, if obtained, is against the founder personally. Management-liability (D&O) cover, if purchased, would respond; a personal umbrella typically excludes business pursuits.', outcome: 'exposed', exposes: ['bank'] });
      s.push({ id: 'rt', from: 'ind', to: 'rt', title: 'Revocable trust is transparent', barrier: 'None — revocable', narrative: 'The founder can revoke the trust at will, so its assets are treated as the founder\'s own for creditor purposes. The judgment creditor steps into the founder\'s shoes as settlor.', outcome: 'exposed', cite: 'Uniform Trust Code §505(a)(1).' });
      if (f.weakChargingOrder) {
        s.push({ id: 'co', from: 'rt', to: 'hold', title: 'Charging order on the Holding LLC interest — weak state', barrier: 'Charging order (weak)', narrative: 'Holding LLC is a single-member LLC. In this state the charging order is not the exclusive remedy for single-member LLCs: the court orders foreclosure of the membership interest, and the creditor becomes the owner of Holding LLC with every subsidiary under it.', outcome: 'exposed', breach: true, cite: 'Compare Olmstead v. FTC, 44 So.3d 76 (Fla. 2010) with Wyo. Stat. §17-29-503(g) (exclusive remedy incl. single-member).', exposes: ['rental1', 'rental2', 'brokerage', 'biz'] });
      } else {
        s.push({ id: 'co', from: 'rt', to: 'hold', title: 'Charging order on the Holding LLC interest', barrier: 'Charging order as exclusive remedy', narrative: 'The creditor obtains a charging order: a lien on distributions from Holding LLC. It cannot vote, manage, or seize entity assets. If the manager makes no distributions, the creditor waits (and may face phantom income on allocated profits). This is the leverage that produces a discounted settlement.', outcome: 'blocked', cite: 'E.g. Wyo. Stat. §17-29-503; Nev. Rev. Stat. §86.401.' });
      }
      s.push({ id: 'home', from: 'ind', to: 'home', title: 'Residence', barrier: 'Tenancy by the entirety · homestead', narrative: 'Jointly owned with a non-liable spouse. In TBE states the judgment creditor of one spouse cannot sever or sell. Elsewhere, homestead caps apply.', outcome: 'blocked' });
      s.push({ id: 'ilit', from: 'ind', to: 'ilit', title: 'Irrevocable trust', barrier: 'Spendthrift · third-party · irrevocable', narrative: f.lateTransfer ? 'The founder moved $600,000 into the trust the month after the partner\'s demand letter. A transfer made with actual intent to hinder a creditor, or for less than reasonably equivalent value while insolvent, is voidable. The creditor unwinds it.' : 'Funded years ago with annual gifts; the founder is not a beneficiary. Beyond reach.', outcome: f.lateTransfer ? 'exposed' : 'blocked', breach: f.lateTransfer, cite: f.lateTransfer ? 'Uniform Voidable Transactions Act §4(a)(1), §4(a)(2).' : undefined, exposes: f.lateTransfer ? ['life'] : [] });
      return s;
    },
  },
  {
    id: 'personal', label: 'Personal creditor', origin: 'ind', tokenLabel: 'Personal judgment',
    summary: 'The founder causes a serious car accident; the injured party obtains a $3M judgment against the founder personally. An "outside" liability attacking inward.',
    explainer: [
      { title: 'Outside liability', body: 'An outside liability is a claim against the owner personally. It does not start inside any entity. The question is what the creditor can take from the person: personal accounts, the residence, and the person\'s ownership interests in entities and trusts.' },
      { title: 'Retirement accounts (not drawn)', body: 'ERISA-governed plans (401(k), pension) carry an anti-alienation rule (29 U.S.C. §1056(d)) that stops most non-bankruptcy creditors cold. IRAs rely on state exemption statutes outside bankruptcy and on 11 U.S.C. §522(n) inside it. Inherited IRAs lost bankruptcy protection in Clark v. Rameker (2014).' },
    ],
    build: (f) => {
      const s: Step[] = [];
      s.push({ id: 'origin', from: 'ind', to: 'ind', title: 'Judgment against the founder personally', narrative: 'The founder, not any entity, is the defendant. Every asset the founder owns outright, and every interest the founder holds, is a candidate.', outcome: 'info' });
      s.push(INS(f, 'ind', 'The founder', 'auto policy and personal umbrella'));
      s.push({ id: 'bank', from: 'ind', to: 'bank', title: 'Personal bank account', narrative: 'Garnished. Cash in the founder\'s own name is the first thing taken. Wage garnishment limits and small exemptions aside, there is no barrier here.', outcome: 'exposed', exposes: ['bank'] });
      s.push({ id: 'home', from: 'ind', to: 'home', title: 'Personal residence', barrier: 'Tenancy by the entirety · homestead', narrative: 'The spouse is not a judgment debtor. In a TBE state the property is unreachable while both spouses live and the marriage lasts. In a homestead state, equity up to the cap is exempt. If neither applies, the creditor can force a sale and take the founder\'s half.', outcome: 'blocked', cite: 'State exemption statutes; e.g. Fla. Const. art. X §4; Tex. Prop. Code §41.001.' });
      s.push({ id: 'rt', from: 'ind', to: 'rt', title: 'Revocable trust', barrier: 'None — revocable', narrative: 'A revocable trust is an estate-planning tool, not an asset-protection tool. The settlor\'s creditors reach whatever the settlor could revoke.', outcome: 'exposed', cite: 'UTC §505(a)(1).' });
      if (f.weakChargingOrder) {
        s.push({ id: 'co', from: 'rt', to: 'hold', title: 'Charging order — single-member LLC, weak state', barrier: 'Charging order (not exclusive)', narrative: 'With only one member, there are no innocent co-members to protect, and this state lets the creditor foreclose or compel dissolution. The creditor takes Holding LLC and everything it owns.', outcome: 'exposed', breach: true, exposes: ['rental1', 'rental2', 'brokerage', 'biz'], cite: 'Olmstead v. FTC (Fla. 2010); In re Albright, 291 B.R. 538 (Bankr. D. Colo. 2003).' });
      } else if (f.commingled) {
        s.push({ id: 'rp', from: 'rt', to: 'prop1', title: 'Reverse veil piercing', barrier: 'Entity separateness (undermined)', narrative: 'The creditor argues that Property LLC #1 is the founder\'s alter ego, because the founder treated its account as a personal wallet. Reverse piercing lets a personal creditor reach entity assets. Several states recognize it; the commingling evidence makes it credible here.', outcome: 'exposed', breach: true, exposes: ['rental1'] });
        s.push({ id: 'co', from: 'rt', to: 'hold', title: 'Charging order on the remaining interests', barrier: 'Charging order', narrative: 'For the entities that were kept separate, the creditor is limited to a charging order on distributions.', outcome: 'blocked' });
      } else {
        s.push({ id: 'co', from: 'rt', to: 'hold', title: 'Charging order on the Holding LLC interest', barrier: 'Charging order as exclusive remedy', narrative: 'The creditor gets a lien on distributions, nothing more. No management rights, no foreclosure, no access to the rentals or the brokerage account. The structure converts a $3M judgment into a negotiation.', outcome: 'blocked', cite: 'Charging-order statutes, e.g. Wyo. Stat. §17-29-503; Del. Code tit. 6 §18-703.' });
      }
      s.push({ id: 'ilit', from: 'ind', to: 'ilit', title: 'Irrevocable trust and life insurance', barrier: 'Spendthrift · third-party trust', narrative: f.lateTransfer ? 'The policy and $400,000 of cash were moved into the trust after the accident. Transfers made to hinder, delay or defraud a creditor are voidable; the creditor unwinds them and reaches the policy\'s cash value.' : 'The ILIT was funded years before the accident and the founder has no beneficial interest. Many states also exempt life insurance cash values from creditors of the insured.', outcome: f.lateTransfer ? 'exposed' : 'blocked', breach: f.lateTransfer, exposes: f.lateTransfer ? ['life'] : [], cite: f.lateTransfer ? 'UVTA §4; state lookback typically 4 years.' : undefined });
      return s;
    },
  },
  {
    id: 'divorce', label: 'Divorce', origin: 'spouse', tokenLabel: 'Marital claim',
    summary: 'The spouse files for divorce. The "creditor" is a court characterizing property as marital or separate. Entity walls are not the question.',
    explainer: [
      { title: 'Marital vs separate property', body: 'Community-property states (e.g. California, Texas) treat property acquired during marriage as owned equally. Equitable-distribution states divide marital property "fairly", not necessarily equally. Separate property is generally what each spouse brought in, inherited, or received by gift, provided it was kept traceable.' },
      { title: 'Trusts and LLCs do not automatically shield from a spouse', body: 'An LLC interest acquired during marriage is marital property no matter how many entities sit above it; the court divides the interest or orders an equalizing payment and will value the business to do it. A revocable trust is transparent. A third-party irrevocable trust created by someone else for one spouse usually remains separate, but distributions received and commingled become marital, and courts routinely count trust interests when setting support. A self-settled transfer in contemplation of divorce is dissipation and will be unwound.' },
      { title: 'What actually works', body: 'A prenuptial or postnuptial agreement, meticulous tracing of separate property, entity documents that restrict transfers to a divorcing spouse (with a buyout at a defined price), and trusts settled by a parent or grandparent with an independent trustee and discretionary distributions.' },
    ],
    build: (f) => {
      const s: Step[] = [];
      s.push({ id: 'origin', from: 'spouse', to: 'ind', title: 'Petition filed; the court takes inventory', narrative: 'Both spouses must disclose every asset and every interest. Non-disclosure is sanctionable. The exercise is characterization, not seizure: which property is marital, which is separate, and what is it worth.', outcome: 'info' });
      s.push({ id: 'home', from: 'ind', to: 'home', title: 'Residence: marital', narrative: 'Jointly titled, acquired during marriage. Marital. Divided or offset.', outcome: 'exposed', exposes: ['home'] });
      s.push({ id: 'bank', from: 'ind', to: 'bank', title: 'Bank account: marital', narrative: 'Earnings during marriage are marital in nearly every state. Divided.', outcome: 'exposed', exposes: ['bank'] });
      s.push({ id: 'rt', from: 'ind', to: 'rt', title: 'Joint revocable trust: transparent', barrier: 'None', narrative: 'The trust is a will substitute. It owns the Holding LLC interest for the spouses. The court looks straight through it.', outcome: 'exposed' });
      s.push({ id: 'hold', from: 'rt', to: 'hold', title: 'Holding LLC and subsidiaries: marital interest', barrier: 'LLC walls (irrelevant here)', narrative: f.noOperatingAgreements ? 'The membership interest was acquired during marriage: marital. With no operating agreement there are no transfer restrictions and no agreed valuation method. The spouse can be awarded a direct interest in Holding LLC, and the business valuation becomes a years-long expert fight.' : 'The membership interest is marital. The operating agreement\'s transfer restrictions and valuation clause mean the founder keeps the interest and pays an equalizing amount at the formula price, over time. The entities survive the divorce intact; the value is still shared.', outcome: 'exposed', breach: f.noOperatingAgreements, exposes: ['biz', 'rental1', 'rental2', 'brokerage'] });
      if (f.commingled) {
        s.push({ id: 'trace', from: 'ind', to: 'prop1', title: 'Separate-property tracing destroyed', barrier: 'Tracing (lost)', narrative: 'The founder claims Property LLC #1 was bought with pre-marital funds. But rent, salary and personal money ran through one account for a decade. Tracing fails and the asset is transmuted into marital property.', outcome: 'exposed', breach: true, exposes: ['rental1'] });
      }
      s.push({ id: 'ilit', from: 'ind', to: 'ilit', title: 'Irrevocable trust', barrier: 'Third-party / irrevocable trust', narrative: f.lateTransfer ? 'Assets were moved into the irrevocable trust after the marriage broke down. That is dissipation of marital assets. The court adds the value back to the marital estate or orders the transfer unwound.' : 'If the trust was settled before marriage, or with separate property, and the spouse is not a beneficiary, the corpus is generally not divisible. The court may still consider the founder\'s expected benefits when setting support. If the spouse is a named beneficiary, their beneficial interest survives the divorce unless the trust says otherwise; many ILITs define "spouse" as the person married to the insured at the time.', outcome: f.lateTransfer ? 'exposed' : 'blocked', breach: f.lateTransfer, exposes: f.lateTransfer ? ['life'] : [] });
      return s;
    },
  },
  {
    id: 'death', label: 'Death of the founder', origin: 'ind', tokenLabel: 'Estate administration',
    summary: 'The founder dies. The token is the administration process: what passes through probate, what passes outside it, where estate liquidity comes from, and which transfer-tax questions arise.',
    explainer: [
      { title: 'Probate vs non-probate', body: 'Probate assets are those titled in the decedent\'s sole name with no beneficiary designation. Non-probate assets pass by contract or title: trust assets by the trust instrument, joint property by survivorship, insurance and retirement accounts by beneficiary designation. Probate is public, slower, and opens a creditor-claims window.' },
      { title: 'ILIT liquidity', body: 'The death benefit is paid to the ILIT, generally income-tax free (IRC §101(a)) and outside the taxable estate if the insured held no incidents of ownership and survived any transfer by three years (IRC §2042, §2035). The trustee can then lend to the estate or purchase illiquid assets from it, so the estate can pay tax and debts without a fire sale.' },
      { title: 'Transfer tax', body: 'The estate may owe federal estate tax above the applicable exclusion (indexed; check the current year) and state estate or inheritance tax in some states. The unlimited marital deduction and portability of the deceased spouse\'s unused exclusion defer, not eliminate, tax at the first death. Nothing here removes the tax question; the structure organizes how it is answered and paid.' },
    ],
    build: (f) => {
      const s: Step[] = [];
      s.push({ id: 'origin', from: 'ind', to: 'ind', title: 'Death. Two tracks open: probate and non-probate.', narrative: 'The executor files the will; the successor trustee of the revocable trust takes office; beneficiaries file claims with insurers. Creditors of the decedent get a statutory window to present claims.', outcome: 'info' });
      s.push({ id: 'bank', from: 'ind', to: 'bank', title: 'Personal bank account: probate', barrier: 'Probate', narrative: 'Titled solely to the founder with no payable-on-death designation. It goes through probate: inventory, creditor claims, court supervision, months of delay. A POD designation or titling in the revocable trust would have avoided this.', outcome: 'exposed', exposes: ['bank'] });
      s.push({ id: 'home', from: 'ind', to: 'home', title: 'Residence: survivorship', barrier: 'Non-probate by title', narrative: 'Joint title with right of survivorship (or tenancy by the entirety): the spouse owns it outright on death. No probate. The mortgage, if any, continues; Garn-St Germain protects transfers to a spouse from due-on-sale acceleration.', outcome: 'blocked' });
      s.push({ id: 'rt', from: 'ind', to: 'rt', title: 'Revocable trust becomes irrevocable', barrier: 'Non-probate by trust', narrative: 'The successor trustee steps in immediately under the trust terms. The Holding LLC interest never passes through probate. The spouse\'s and children\'s shares are set by the trust (often a marital trust and a bypass/credit-shelter trust).', outcome: 'blocked' });
      s.push({ id: 'hold', from: 'rt', to: 'hold', title: 'Continuity of the entities', barrier: 'Operating agreement succession', narrative: f.noOperatingAgreements ? 'No operating agreement names a successor manager. Under default rules some states treat the death of the sole member of a single-member LLC as a dissolution event unless the estate elects to continue within a deadline; banks freeze accounts while they work out who can sign. Payroll at Operating Co is late. The rentals still collect rent, but nobody can lawfully spend it.' : 'The operating agreements name the successor trustee as manager and provide that the membership interest passes to the trust without dissolution. Business continues on Monday morning.', outcome: f.noOperatingAgreements ? 'weakened' : 'blocked', breach: f.noOperatingAgreements, weakens: f.noOperatingAgreements ? ['biz', 'rental1', 'rental2'] : [] });
      s.push({ id: 'life', from: 'ilit', to: 'life', title: 'ILIT collects the death benefit', barrier: 'Outside the estate (§2042)', narrative: f.lateTransfer ? 'The policy was transferred to the ILIT 14 months before death. Under IRC §2035, a policy transferred within three years of death is pulled back into the gross estate. The liquidity still arrives, but the death benefit is now taxable in the estate.' : 'The trustee collects $2M, income-tax free. Because the founder held no incidents of ownership, it is outside the taxable estate.', outcome: f.lateTransfer ? 'weakened' : 'blocked', breach: f.lateTransfer, weakens: f.lateTransfer ? ['life'] : [] });
      s.push({ id: 'liq', from: 'life', to: 'rt', title: 'Liquidity flows to where the tax is due', narrative: 'The ILIT trustee lends cash to the estate at a documented rate, or buys the Investment LLC interest from the trust at appraised value. The estate pays estate tax and debts without selling the business or the rentals under pressure. This is the point of the ILIT.', outcome: 'absorbed' });
      s.push({ id: 'tax', from: 'rt', to: 'hold', title: 'Transfer-tax questions', narrative: 'Was the exclusion amount exceeded? Were lifetime gifts tracked on Form 709? Does the state impose its own estate or inheritance tax? Are the LLC interests valued with discounts, and will the IRS challenge them? Portability election on Form 706? These are the questions the structure organizes. It does not make them disappear.', outcome: 'info' });
      if (f.personalGuarantee) {
        s.push({ id: 'pg', from: 'lender', to: 'rt', title: 'Guarantee survives the guarantor', barrier: 'Guarantee', narrative: 'The founder\'s personal guarantee is a claim against the estate. The lender may require a replacement guarantor or accelerate under the loan documents. The estate must hold a reserve against the contingent liability.', outcome: 'weakened', breach: true, weakens: ['bank'] });
      }
      return s;
    },
  },
  {
    id: 'incapacity', label: 'Incapacity', origin: 'ind', tokenLabel: 'Incapacity',
    summary: 'The founder has a stroke and cannot sign. Nothing is being seized; the question is who can act, and what freezes if the documents do not exist.',
    explainer: [
      { title: 'Three documents, three domains', body: 'The revocable trust names a successor (or co-) trustee who acts over trust assets. A durable power of attorney names an agent for everything outside the trust. A health-care directive names a decision-maker for medical matters. Without them, the family petitions for guardianship or conservatorship: public, slow, and the court picks.' },
      { title: 'Entities need their own answer', body: 'A trustee controls the membership interest, not the company. The operating agreement must say who manages when the manager is incapacitated, and how incapacity is determined (two physicians\' letters is common). Banks will not act on a trustee\'s say-so without it.' },
    ],
    build: (f) => {
      const s: Step[] = [];
      s.push({ id: 'origin', from: 'ind', to: 'ind', title: 'Founder incapacitated', narrative: 'The founder is alive but cannot make or communicate decisions. Legal capacity is gone; ownership is unchanged. The question is authority.', outcome: 'info' });
      s.push({ id: 'rt', from: 'ind', to: 'rt', title: 'Successor trustee acts over trust assets', barrier: 'Trust succession clause', narrative: 'The trust defines incapacity and names the spouse as successor trustee. On two physicians\' letters the spouse takes over administration of the Holding LLC interest. No court involved.', outcome: 'blocked' });
      s.push({ id: 'bank', from: 'ind', to: 'bank', title: 'Personal bank account: durable POA', barrier: 'Durable power of attorney', narrative: 'Outside the trust. The agent under a durable POA can pay bills and move money. Many banks resist stale or non-standard POAs; a recent, statutory-form POA and a conversation with the bank in advance avoid the freeze.', outcome: 'blocked' });
      s.push({ id: 'home', from: 'ind', to: 'home', title: 'Residence', barrier: 'Joint title + POA', narrative: 'The spouse can keep living there and pay the mortgage. Selling or refinancing requires both signatures, so the agent under the POA signs for the founder.', outcome: 'blocked' });
      s.push({ id: 'opco', from: 'rt', to: 'opco', title: 'Who runs Operating Co?', barrier: 'LLC manager succession', narrative: f.noOperatingAgreements ? 'No operating agreement. The founder was the only manager and the only signatory. The bank freezes the operating account pending proof of authority. Payroll fails on Friday. Customers\' contracts have no one to sign change orders. The successor trustee controls the membership interest but, absent a written appointment process, must act as member to appoint a new manager, and the bank wants to see the document that lets her do that. Weeks are lost.' : 'The operating agreement names a successor manager and sets the incapacity test. A second signatory is already on the bank account. The business continues.', outcome: f.noOperatingAgreements ? 'weakened' : 'blocked', breach: f.noOperatingAgreements, weakens: f.noOperatingAgreements ? ['biz'] : [] });
      s.push({ id: 'props', from: 'hold', to: 'prop1', title: 'Property and investment LLCs', barrier: 'Manager succession', narrative: f.noOperatingAgreements ? 'Rent still comes in, but refinancing Rental #1 at maturity, evicting a non-paying tenant or rebalancing the brokerage account all require an authorized signer. Frozen until the paperwork is solved.' : 'Same succession clause. The successor manager signs leases, refinances and trades.', outcome: f.noOperatingAgreements ? 'weakened' : 'blocked', breach: f.noOperatingAgreements, weakens: f.noOperatingAgreements ? ['rental1', 'rental2', 'brokerage'] : [] });
      s.push({ id: 'ilit', from: 'ilit', to: 'life', title: 'ILIT keeps the policy alive', barrier: 'Independent trustee', narrative: 'The ILIT has its own trustee and is unaffected by the founder\'s incapacity. The risk is the premium: it was funded by the founder\'s annual gifts. The POA must authorize the agent to continue gifts, or the policy lapses when it is most valuable.', outcome: 'blocked' });
      if (f.personalGuarantee) {
        s.push({ id: 'pg', from: 'lender', to: 'ind', title: 'Guarantor incapacity clause', narrative: 'Some loan agreements treat the death or incapacity of a guarantor as a default unless a substitute is provided within a set period. The agent must engage the lender quickly.', outcome: 'weakened', breach: true, weakens: ['rental1'] });
      }
      return s;
    },
  },
  {
    id: 'bankruptcy', label: 'Business bankruptcy', origin: 'opco', tokenLabel: 'Bankruptcy trustee',
    summary: 'Operating Co fails and files Chapter 7. The trustee marshals its assets and then looks backward in time for transfers to unwind.',
    explainer: [
      { title: 'Lookbacks', body: 'Preferences: 11 U.S.C. §547 lets the trustee recover payments to creditors made within 90 days of filing (one year for insiders such as the founder, Holding LLC or a family lender). Fraudulent transfers: §548 reaches transfers within two years made with actual intent to hinder creditors or for less than reasonably equivalent value while insolvent. §544(b) imports state law (the UVTA, typically a four-year lookback). §548(e) reaches ten years back for transfers to a self-settled trust or similar device made with actual intent to defraud, which is aimed squarely at domestic asset protection trusts.' },
      { title: 'What is not touched', body: 'A properly separate parent and siblings. The bankruptcy estate is Operating Co\'s property, not the family\'s. The danger is the backward look at every dollar that left the company, and any guarantee the founder signed.' },
    ],
    build: (f) => {
      const s: Step[] = [];
      s.push({ id: 'origin', from: 'biz', to: 'opco', title: 'Chapter 7 filed; trustee takes the estate', narrative: 'Operating Co\'s receivables, equipment and cash become the bankruptcy estate. The business is liquidated. Its enterprise value is gone.', outcome: 'exposed', exposes: ['biz'] });
      s.push({ id: 'pref', from: 'opco', to: 'hold', title: 'Preference and fraudulent-transfer review', barrier: '§547 · §548 · state UVTA', narrative: 'Distributions to Holding LLC and repayments of a shareholder loan within the past year are insider preferences. Any asset moved to a sibling LLC for less than fair value within two years (four under state law) is a fraudulent transfer. The trustee sues to recover them. This is why intercompany transfers need contemporaneous documentation and fair value.', outcome: 'weakened', weakens: ['brokerage'], cite: '11 U.S.C. §547(b)(4)(B); §548(a)(1); §544(b).' });
      if (f.undercapitalized) {
        s.push({ id: 'pierce', from: 'opco', to: 'hold', title: 'Substantive consolidation / veil piercing', barrier: 'Entity separateness (undermined)', narrative: 'The trustee shows Operating Co was a shell: no capital, no books, funds swept to the parent. The court pierces to Holding LLC, or consolidates the estates. Everything under Holding LLC is reachable.', outcome: 'exposed', breach: true, exposes: ['rental1', 'rental2', 'brokerage'] });
      } else {
        s.push({ id: 'up', from: 'opco', to: 'hold', title: 'Parent and siblings stay out', barrier: 'Inside liability contained', narrative: 'Holding LLC\'s only loss is its investment in Operating Co. The rentals and brokerage account are not estate property.', outcome: 'blocked' });
      }
      if (f.personalGuarantee) {
        s.push({ id: 'pg', from: 'opco', to: 'ind', title: 'Personal guarantees called', barrier: 'Limited liability (waived)', narrative: 'The landlord, the equipment lessor and the bank all took the founder\'s personal guarantee. The LLC\'s discharge does not discharge the guarantor. They sue the founder; the personal account is garnished.', outcome: 'exposed', breach: true, exposes: ['bank'] });
        s.push({ id: 'co', from: 'rt', to: 'hold', title: 'Guarantee creditors reach the Holding LLC interest?', barrier: f.weakChargingOrder ? 'Charging order (weak)' : 'Charging order', narrative: f.weakChargingOrder ? 'Single-member LLC in a weak state: foreclosure on the membership interest is available. The guarantee creditors take Holding LLC.' : 'The guarantee creditors obtain a charging order on the Holding LLC interest and wait for distributions. The underlying rentals and brokerage are not seized.', outcome: f.weakChargingOrder ? 'exposed' : 'blocked', breach: f.weakChargingOrder, exposes: f.weakChargingOrder ? ['rental1', 'rental2', 'brokerage'] : [] });
      } else {
        s.push({ id: 'nopg', from: 'opco', to: 'ind', title: 'No guarantees: the founder is a bystander', barrier: 'Limited liability', narrative: 'Trade creditors and lenders dealt with the LLC alone. The founder\'s personal assets are outside the case. The cost of this was higher pricing and tighter credit terms years ago; it was worth it.', outcome: 'blocked' });
      }
      s.push({ id: 'ilit', from: 'ind', to: 'ilit', title: 'Irrevocable trust', barrier: 'Spendthrift · §548(e) lookback', narrative: f.lateTransfer ? 'The founder moved assets to a self-settled trust after the business began failing. §548(e) gives the trustee a ten-year lookback for transfers to self-settled trusts made with actual intent to hinder creditors. The transfer is avoided.' : 'Funded by annual gifts years ago, no retained interest, no insolvency at the time. Beyond the lookbacks.', outcome: f.lateTransfer ? 'exposed' : 'blocked', breach: f.lateTransfer, exposes: f.lateTransfer ? ['life'] : [], cite: '11 U.S.C. §548(e); In re Mortensen (Bankr. D. Alaska 2011).' });
      return s;
    },
  },
];

export const scenarioById = (id: ScenarioId) => SCENARIOS.find((s) => s.id === id)!;

export type AssetStatus = 'exposed' | 'weakened' | 'protected';
export function scorecard(steps: Step[]): Record<AssetId, AssetStatus> {
  const out: Record<AssetId, AssetStatus> = { home: 'protected', bank: 'protected', biz: 'protected', rental1: 'protected', rental2: 'protected', brokerage: 'protected', life: 'protected' };
  for (const s of steps) {
    for (const a of s.exposes ?? []) out[a] = 'exposed';
    for (const a of s.weakens ?? []) if (out[a] !== 'exposed') out[a] = 'weakened';
  }
  return out;
}
