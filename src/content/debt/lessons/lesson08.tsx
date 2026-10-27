import type { DebtLesson } from '../types';
import { FamilyLoanFlow } from './visuals/lesson-visuals';

const lesson: DebtLesson = {
  id: 'debt-08',
  number: 8,
  slug: 'family-banking-and-related-party-loans',
  title: 'Family Banking & Related-Party Loans',
  subtitle: 'How families lend to themselves — between members and between their companies — so that the loan is real to a court, a tax authority and a creditor.',
  hook: 'The family bank is not a building. It is a discipline: money moves inside the family on terms an outsider would recognize as a loan, and every obligation is enforceable.',
  duration: '35 min',
  objectives: ['tax-planning', 'estate-planning', 'asset-protection', 'governance', 'succession'],
  sections: [
    {
      id: 'why',
      heading: 'Why families lend to themselves',
      body: [
        'A family with capital in one place and a need in another has three choices: give, invest or lend. Lending has distinctive properties. The capital comes back, with interest, so the family’s pool is preserved and compounds. The borrower — a child buying a home, an operating company needing equipment, a property company funding a renovation — gets terms that a bank might not offer a thin credit file, without a personal guarantee to an outsider. And the lender keeps a claim that ranks ahead of the borrower’s equity holders, which matters if things go wrong.',
        'The intra-family loan also teaches. A child who signs a note, makes payments and sees a balance fall learns what a bank customer learns, with a lender who is willing to restructure rather than foreclose. Intercompany lending lets a family group move liquidity to where it earns most while keeping each company’s balance sheet intact.',
        'All of that depends on one condition: the loan must be **bona fide**. If it is not — if there is no note, no interest, no schedule, no payments and no intention to repay — then it is a gift (with gift-tax consequences), or a capital contribution (equity), or a sham (with every consequence a court can impose). The whole of this lesson is about making the loan real.',
      ],
    },
    {
      id: 'documents',
      heading: 'The documents that make a loan a loan',
      body: [
        'Start with a **promissory note**: the borrower’s unconditional written promise to pay a stated principal, at a stated interest rate, on a stated schedule, with a maturity date, default provisions and governing law. Add a **security agreement** or **mortgage** if the loan is secured — and perfect it (UCC-1 filing, deed recording, RCCM registration, Emirates Movable Collateral Registry) exactly as a bank would. For loans between companies, add **board resolutions or member consents** authorizing the loan on both sides, and for larger facilities a **loan agreement** with covenants and reporting.',
        'Then behave like a lender. Set up a **repayment schedule** and actually collect — by bank transfer, on the dates in the note, recorded in both sets of books. Charge **interest** at or above the rate the tax law requires (next section) and record it as income to the lender and expense to the borrower. If payments are missed, document the forbearance or the restructuring in writing, as a bank would. US courts asked to decide whether an intra-family transfer was a loan or a gift look at exactly these facts: a note, interest, security, a fixed maturity, a demand for repayment, actual repayments, the borrower’s ability to repay, and records treating the transfer as a loan.',
        'The visual below shows a documented loan from a family holding company to a property company, with both balance sheets updating as the loan is advanced and repaid. Notice that nothing is netted informally and both entities remain distinct legal persons.',
      ],
      Visual: FamilyLoanFlow,
    },
    {
      id: 'below-market',
      heading: 'Below-market loan rules: IRC §7872, AFRs and imputed interest',
      body: [
        'US tax law does not let a family lend at zero interest and call it a loan. **IRC §7872** treats a below-market loan as if the lender had charged the **applicable federal rate (AFR)** — published monthly by the IRS in a revenue ruling, with short-term (≤3 years), mid-term (3–9 years) and long-term (>9 years) rates — and then transferred the forgone interest back to the borrower. For a **gift loan** between family members that transfer is a gift (potentially consuming annual exclusion or lifetime exemption) and the lender is treated as receiving interest income. For a **compensation-related** or **corporation-shareholder** loan, the forgone interest is recharacterized as wages or a dividend.',
        'Two thresholds soften the rule for gift loans, stated here generally: a **$10,000 de minimis** exception where the loan is not used to buy income-producing assets, and a **$100,000** rule under which imputed interest income to the lender is limited to the borrower’s net investment income (and is zero if that income is $1,000 or less). Above $100,000 the full imputation applies. Charging at least the AFR for the loan’s term, fixed at inception, avoids §7872 entirely — and the AFR is often far below bank rates, which is the legitimate advantage of a family loan.',
        'Related provisions reach related-party debt from other angles: **§483** imputes interest on deferred payments in certain sales where no adequate interest is stated; **§1274** applies original-issue-discount rules to debt instruments issued for property. Intercompany loans between related companies raise **transfer pricing** questions — the interest rate should be one unrelated parties would agree to (arm’s length), documented contemporaneously — and, for cross-border loans, withholding tax and thin-capitalization rules in the borrower’s jurisdiction.',
      ],
      callouts: [{ tone: 'amber', title: 'Jurisdiction check', body: 'The AFR mechanism is US-specific. The UAE has no personal income or gift tax but its Corporate Tax law applies arm’s-length transfer pricing to related-party transactions, including intercompany interest; Cameroon’s General Tax Code limits deductibility of interest paid to shareholders. See the Jurisdictions page; these notes are not yet jurisdictionally verified.' }],
    },
    {
      id: 'accounting',
      heading: 'Accounting entries and the two balance sheets',
      body: [
        'A family loan creates mirror-image entries. When the loan is advanced, the lender records **Debit Note receivable / Credit Cash**; the borrower records **Debit Cash / Credit Note payable**. As interest accrues each period the lender records **Debit Interest receivable / Credit Interest income** and the borrower **Debit Interest expense / Credit Interest payable**; when the payment is made, cash moves and the receivable/payable clears, with the principal portion reducing the note on both sides.',
        'Keeping these entries in two separate ledgers — one per legal entity, each with its own bank account — is what preserves the entities’ separateness. If the family treats the group as one pocket (pays the property company’s bills from the holding company’s account, lets the note sit unpaid for years, books “adjustments” at year-end), the accounting collapses and with it the legal argument that these are different persons with different creditors. **Consolidated** family reporting, where the receivable and payable eliminate against each other, is useful for the family council; it is not a substitute for the separate books, and it must never be presented to a lender or a court as if it were the legal position.',
        'Under US GAAP, **ASC 850** requires disclosure of related-party transactions — their nature, amounts and terms — in financial statements. On tax returns, related-party loans appear on the balance-sheet schedules of corporate and partnership returns (Forms 1120 and 1065) and interest is reported as income and expense in the respective returns; where a foreign related party is involved, additional information reporting applies. Phrased generally: expect to disclose, and keep the file that supports the disclosure.',
      ],
    },
    {
      id: 'security',
      heading: 'Collateral, priority and what happens on default',
      body: [
        'A secured family loan is a stronger loan. If the borrowing company fails, a properly perfected security interest ranks the family lender ahead of unsecured creditors on the pledged collateral — the same position a bank would hold. This is lawful and ordinary. What is not ordinary, and what courts and trustees scrutinize, is a security interest granted *after* the borrower was already in trouble, or on terms no third party would accept, or in exchange for an antecedent debt: these can be set aside as **preferences** or **fraudulent transfers** under bankruptcy law and state or OHADA equivalents.',
        'The practical rule: grant and perfect security at the time of the loan, for new money, at a value that is documented. Keep the loan-to-value sensible. Be prepared to enforce — a family lender that would never actually foreclose has, in a creditor’s eyes, made a disguised equity contribution. And **subordination**: a bank lending to the operating company will usually require the family lender’s note to be subordinated to the bank; sign that knowing the family note now ranks behind.',
        'Guarantees inside the family deserve the same scrutiny as guarantees to banks (Lesson 02). A family member guaranteeing a sibling’s company has connected two balance sheets; a holding company guaranteeing every subsidiary’s debts has defeated the purpose of having subsidiaries.',
      ],
    },
    {
      id: 'intercompany',
      heading: 'Intercompany lending inside a family group',
      body: [
        'In a holding structure the “family bank” is often a company — a holding or investment company that receives dividends from operating subsidiaries and lends them where they are needed. The operating company borrows for equipment, the property company for a renovation, a new venture for start-up capital; each loan is documented, priced at an arm’s-length or AFR-compliant rate, secured where sensible and repaid on schedule. Interest flows back up as income. The group’s cost of capital falls because the lender knows the borrower intimately; its risk is contained because each loan is a separate obligation of a separate entity.',
        'Three failure modes recur. **Circular funding**, where the borrower repays the lender with money the lender just lent it, which produces payments without substance. **Undocumented sweeps**, where cash moves daily between company accounts with no notes — courts call this commingling. And **debt that is really equity**: a subsidiary with no reasonable prospect of repaying has not borrowed from its parent; it has been capitalized, and tax authorities (through debt-equity recharacterization) and creditors (through equitable subordination) will treat it accordingly.',
        'The Family Bank Simulator on this platform builds a compliant intra-family loan with both balance sheets, and the Financing Map in this studio shows how related-party loans sit alongside bank debt on a family structure. Case D follows a holding company coordinating financing across its entities.',
      ],
    },
    {
      id: 'governance',
      heading: 'Governance: who decides, and how the next generation learns',
      body: [
        'A family bank needs a credit policy as much as a commercial bank does: who may borrow, for what purposes, at what rates, with what security and what reporting; how defaults are handled; how the lending decision is separated from the family relationship. Families that write this down — often as a schedule to the family constitution — avoid the two classic quarrels: the sibling who was lent to on softer terms, and the parent who cannot say no.',
        'Done well, the family bank is a succession instrument. It gives the next generation experience with debt under supervision, creates a record of their stewardship, recycles capital inside the family instead of leaking it to outside lenders, and leaves a documented history of enforceable obligations that a successor trustee or executor can administer. Done badly, it is a pile of undocumented transfers that an estate must untangle and a tax authority can reclassify.',
      ],
    },
  ],
  keyTerms: [
    { term: 'Bona fide loan', definition: 'A transfer with a genuine, enforceable obligation to repay, evidenced by documentation, interest, schedule and conduct.' },
    { term: 'Promissory note', definition: 'A written unconditional promise to pay a stated sum, with interest, on stated terms.' },
    { term: 'AFR', definition: 'Applicable federal rate: minimum interest rates published monthly by the IRS for short-, mid- and long-term loans.' },
    { term: 'IRC §7872', definition: 'US rule imputing interest on below-market loans; forgone interest treated as a gift, compensation or dividend.' },
    { term: 'Imputed interest', definition: 'Interest the tax law deems to have been paid even though it was not.' },
    { term: 'ASC 850', definition: 'US GAAP standard requiring disclosure of related-party transactions.' },
    { term: 'Arm’s length', definition: 'Terms unrelated parties would agree to; the transfer-pricing standard for intercompany interest.' },
    { term: 'Equitable subordination / recharacterization', definition: 'Court or tax-authority treatment of a purported loan as equity because of its substance and the parties’ conduct.' },
  ],
  knowledgeCheck: [
    { id: 'd8q1', prompt: 'Which set of facts most strongly supports that an intra-family transfer is a loan rather than a gift?', options: ['A verbal agreement and a round number', 'A signed note with interest at or above the AFR, a schedule, security and actual payments recorded by both parties', 'The borrower’s intention to repay someday', 'A single transfer with no documentation'], answer: 1, explanation: 'Courts look at documentation, interest, security, maturity, actual repayment and consistent records; intention alone is not enough.' },
    { id: 'd8q2', prompt: 'A parent lends a child $250,000 at 0% interest for 5 years. Under IRC §7872 the likely result is:', options: ['No consequence because it is within the family', 'Imputed interest at the mid-term AFR treated as a gift from parent to child and interest income to the parent', 'The loan is void', 'The child must pay tax on the principal'], answer: 1, explanation: 'Above the $100,000 threshold, forgone interest at the AFR is deemed transferred as a gift and received by the lender as income.' },
    { id: 'd8q3', prompt: 'On the lender’s books, advancing a family loan is recorded as:', options: ['Dr Cash / Cr Loan income', 'Dr Note receivable / Cr Cash', 'Dr Expense / Cr Cash', 'Dr Cash / Cr Note payable'], answer: 1, explanation: 'The lender exchanges cash for a receivable; the borrower records the mirror entry Dr Cash / Cr Note payable.' },
    { id: 'd8q4', prompt: 'A security interest granted by a struggling family company to its owner for an old, previously unsecured loan is at risk of being:', options: ['Automatically senior to the bank', 'Set aside as a preference or fraudulent transfer', 'Treated as a gift to the company', 'Tax-deductible'], answer: 1, explanation: 'Security for antecedent debt granted while insolvent is a classic avoidable preference; perfect security at the time of the loan for new money.' },
    { id: 'd8q5', prompt: 'Consolidated family financial statements that eliminate intercompany loans:', options: ['Replace the separate entity books for legal purposes', 'Are useful for the family council but do not change each entity’s separate legal obligations', 'Prove the entities are one person', 'Are prohibited'], answer: 1, explanation: 'Consolidation is a reporting view; legally each entity remains separately liable and separately protected, which the separate books preserve.' },
  ],
  misconception: {
    claim: '“Family loans don’t need paperwork or interest — it’s all the same money.”',
    reality: 'Without a note, interest, schedule and payments the transfer is a gift (with gift-tax exposure), a capital contribution, or a sham. US rules impute interest at the AFR on below-market loans; creditors and courts disregard undocumented intra-family debt. “The same money” is precisely the argument that collapses the structure.',
    confidence: 'red',
  },
  references: [
    { title: 'IRC §7872 — Treatment of loans with below-market interest rates', citation: '26 U.S.C. § 7872', jurisdiction: 'US', type: 'statute', url: 'https://www.law.cornell.edu/uscode/text/26/7872' },
    { title: 'IRS — Applicable Federal Rates (published monthly by revenue ruling)', jurisdiction: 'US', type: 'guidance', url: 'https://www.irs.gov/applicable-federal-rates' },
    { title: 'IRC §483 — Interest on certain deferred payments; §1274 — OID on debt instruments issued for property', citation: '26 U.S.C. §§ 483, 1274', jurisdiction: 'US', type: 'statute' },
    { title: 'Treasury Regulation §1.7872-5T — exempted loans; Proposed Reg. §1.7872 series', citation: '26 C.F.R. § 1.7872-5T', jurisdiction: 'US', type: 'regulation', note: 'Phrased generally.' },
    { title: 'IRC §385 and case law on debt vs. equity characterization of related-party instruments', citation: '26 U.S.C. § 385', jurisdiction: 'US', type: 'statute', note: 'Factors applied by courts (e.g., Estate of Mixon; Fin Hay Realty) — phrased generally.' },
    { title: 'FASB ASC 850 — Related Party Disclosures', jurisdiction: 'US', type: 'regulation' },
    { title: 'IRS Form 1120 / Form 1065 instructions — balance sheet schedules and related-party information', jurisdiction: 'US', type: 'guidance', note: 'Phrased generally.' },
    { title: '11 U.S.C. §§ 547, 548 — Preferences and fraudulent transfers; §510(c) equitable subordination', jurisdiction: 'US', type: 'statute' },
    { title: 'UAE Federal Decree-Law No. 47 of 2022 — arm’s-length principle and transfer pricing for related parties and connected persons', jurisdiction: 'UAE', type: 'statute', note: 'Phrased generally.' },
    { title: 'Cameroon General Tax Code — deductibility limits on interest paid to shareholders/associates', jurisdiction: 'CEMAC', type: 'statute', note: 'Phrased generally; verify current article and limits.' },
    { title: 'OHADA Uniform Act on Collective Proceedings (revised 2015) — avoidance of transactions during the suspect period', jurisdiction: 'OHADA / CEMAC', type: 'statute' },
  ],
  jurisdictionNotes: {
    US: { verified: true, notes: ['§7872 imputes interest at the AFR on below-market loans; $10,000 and $100,000 gift-loan thresholds apply generally.', 'Related-party disclosure under ASC 850; debt-equity characterization under §385 and case law.', 'Preference and fraudulent-transfer avoidance under the Bankruptcy Code and state UVTA/UFTA.'] },
    UAE: { verified: false, notes: ['No personal income or gift tax; Corporate Tax applies arm’s-length pricing to related-party interest and limits deductions for interest paid to related parties where the main purpose is a tax advantage.', 'Security over movables between related companies registrable under Federal Law No. 4 of 2020.'] },
    CEMAC: { verified: false, notes: ['Cameroon General Tax Code caps deductible interest on shareholder loans by rate and by reference to share capital (thin capitalization) — verify.', 'Related-party security must be registered at the RCCM; suspect-period avoidance under the OHADA collective proceedings act.'] },
    UK: { verified: false, notes: ['Loans to participators by close companies trigger a tax charge (CTA 2010 s.455); transfer pricing applies to intercompany interest for larger groups.', 'Content for this jurisdiction is in preparation.'] },
  },
};
export default lesson;
