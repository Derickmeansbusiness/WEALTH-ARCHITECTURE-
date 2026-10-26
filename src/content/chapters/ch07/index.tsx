import type { ChapterModule } from '@/types/content';
import { CHAPTERS } from '../manifest';
import Diagram from './Diagram';
import Simulator from './Simulator';
import './styles.css';

const meta = CHAPTERS.find((c) => c.id === 'ch07')!;

const mod: ChapterModule = {
  content: {
    id: meta.id,
    number: meta.number,
    slug: meta.slug,
    title: meta.title,
    subtitle: 'A family lending institution is a discipline before it is a structure: documented notes, market rates, and a lender willing to say no.',
    objectives: ['governance', 'succession', 'tax-planning', 'asset-protection'],
    duration: meta.duration,
    hook: 'The first family bank I ever saw was a shoebox of IOUs. The second was a Delaware LLC with a loan committee. Only one of them survived an audit — and a divorce.',
    concept: [
      'A **family bank** is not a bank. It is a pool of family capital — held in an LLC, a limited partnership or a trust — whose job is to **lend** to family members and family-owned companies against documented promissory notes, instead of giving the money away or leaving it in a brokerage account. The appeal is practical. Capital stays inside the family balance sheet and compounds there; a child buys a house or starts a business on terms a commercial lender would not offer; the interest that would have gone to a bank goes to the family pool instead; and the act of applying, documenting and repaying teaches a generation how credit works. The structure also keeps the senior generation\'s decision-making honest: a loan committee that has to approve a note is harder to pressure than a parent at a dinner table.',
      'Everything turns on whether the loan is **bona fide debt**. The Tax Court has been asked that question hundreds of times, usually when a family calls something a loan and the IRS calls it a gift (or, between companies, equity). The factors are consistent across cases: a **written note**; a **stated interest rate**; a **fixed maturity date**; **actual repayments** made on schedule; **security** or collateral where a commercial lender would require it; the **borrower\'s solvency** and realistic ability to repay at the time of the loan; **records** kept by both sides treating it as debt; and the parties\' **intent** evidenced by conduct, including whether the lender ever demanded payment when it was late. No single factor decides. In my experience the one that most often sinks a family loan is the third-to-last: repayments that simply never happened, with the note sitting in a drawer as a legal fiction. *Estate of Maxwell v. Commissioner* is the cautionary tale — an intra-family sale for a note where the "lender" forgave payments as they came due, and the court treated the whole arrangement as a transfer with a retained interest.',
      'The rate is where the Code intervenes directly. **IRC §7872** governs below-market loans: if a gift loan carries interest below the **applicable federal rate** (AFR), the lender is treated as having transferred the foregone interest to the borrower as a gift, and the borrower is treated as having paid it back as interest. The lender has imputed interest income it never received; the borrower has a deemed gift. The AFR is published monthly by the IRS in a revenue ruling, with short-term (up to 3 years), mid-term (over 3 to 9 years) and long-term (over 9 years) rates and different compounding conventions. A note at or above the AFR for its term is the simplest way to stay clear of §7872. There are exceptions — a $10,000 de minimis threshold for gift loans not used to buy income-producing assets, and a $100,000 ceiling below which imputed interest is limited to the borrower\'s net investment income — but relying on them is a choice to carry complexity for a small saving.',
      'A second set of rules, **§§483 and 1274**, catches deferred-payment sales that state too little interest: part of the purchase price is recharacterised as interest, converting capital gain into ordinary income for the seller and creating interest deductions for the buyer. This bites when a parent sells a business interest or property to a child for a note at a rate below the AFR. The fix is the same — use the AFR — but the mechanism is different: §7872 imputes a gift, §1274 reprices the sale. Practitioners sometimes forget that both can apply to the same intra-family note.',
      'The cleanest family bank product is the **intra-family mortgage**. Parents lend a child the purchase price of a home at the long-term AFR, take a recorded first lien, and amortise over 15 or 30 years. If the mortgage is properly secured and recorded, the child\'s interest is **qualified residence interest** under §163(h) and the related Treasury regulations, deductible within the acquisition-indebtedness limits. The parents report the interest as income. Compared with a commercial mortgage the child saves the bank\'s spread; compared with an outright gift the parents keep an asset, keep the child disciplined and use none of their lifetime exemption. Where it goes wrong: the note is never recorded (no deduction), payments slide (gift recharacterisation), or the parents "forgive" a year\'s payments at Christmas — which is a gift of that amount, reportable if above the annual exclusion, and which litigators will cite as evidence the loan was never real.',
      'Between **family companies**, the same discipline applies with different statutes. A loan from the holding company to the property company must have the features of debt, or **§385** and the case law (*Fin Hay Realty*, *Estate of Mixon*) will treat it as equity, deleting the interest deduction. Related-party timing rules in **§267(a)(2)** stop an accrual-basis borrower deducting interest before the cash-basis lender includes it. **§163(j)** can limit the borrower\'s interest deduction. And where companies sit in different tax jurisdictions, **§482** and its foreign equivalents require arm\'s-length pricing of the loan — the rate, the term, the guarantee fee — exactly as if the parties were strangers. The accounting test is simple and unforgiving: the lender\'s note receivable and the borrower\'s note payable are the same number, interest income on one side equals interest expense on the other, and both ledgers show the cash actually moving. **Balance-sheet symmetry** is how an auditor, a tax examiner or a bankruptcy trustee tells a loan from a bookkeeping entry.',
      'This is why "**loans between your companies mean no tax**" is misleading. Interest paid by one entity is income to the other; principal moving back and forth is never income and never deductible. Within one tax group the net effect is close to zero, and where it is not zero it is because the companies sit in different brackets, different jurisdictions or different years — which is precisely what §482, §267 and the anti-abuse rules exist to police. The genuine advantages of intercompany lending are not tax: they are liquidity management, keeping outside lenders off the operating company\'s balance sheet, clear priority if a subsidiary fails, and the option to subordinate family debt behind a bank when you need to. A family that understands that gets the benefits; a family that believes the slogan ends up explaining to an examiner why the "loan" was never repaid.',
      'The governance layer is what distinguishes a family bank from a parent with a chequebook. The best ones I have worked with have a **written lending policy** (who may borrow, for what purposes, maximum amounts, required collateral, rate = AFR plus a stated margin), a **loan committee** that includes at least one non-family member, **standard documents**, an annual **portfolio review**, and a stated **default procedure** — including the rule that a forgiven note is a gift, reported on Form 709, and a mark against the borrower\'s future access. The point is not severity. It is that lending to people you love is emotionally impossible to do well without a process that takes the emotion out of the room.',
    ],
    realWorldExample: {
      title: 'An intra-family mortgage versus a commercial loan versus a gift',
      body: [
        'A daughter is buying a $750,000 home. Her parents\' family bank LLC can lend $600,000. The long-term AFR for the month is 4.5% (illustrative — the actual figure comes from the IRS monthly revenue ruling). A commercial 30-year mortgage is available at 7.0%.',
        'At 7.0%, the monthly payment on $600,000 over 30 years is about **$3,992**. At 4.5% it is about **$3,040**. The daughter saves roughly **$952 a month, $11,400 a year**, and about $342,000 of interest over the full term. Because the parents record a first lien, her interest is qualified residence interest under §163(h) within the acquisition-debt limit; if she itemises, part of the saving is recovered by the Treasury through a smaller deduction, which is the honest way to describe it.',
        'The parents receive $27,000 of interest in year one, taxed as ordinary income. Had the $600,000 stayed in a bond portfolio yielding 4.5% they would have received the same income with no family relationship attached. Had they lent at 0%, §7872 would treat about $27,000 a year of foregone interest as a gift to the daughter — above the annual exclusion for a single donor, so reportable on Form 709 and eating into lifetime exemption — and as interest income to the parents that they never received.',
        'Had they simply given her the $600,000, it would have used $600,000 of lifetime exemption (less two annual exclusions if both parents gift), and the asset would be gone from their balance sheet. The loan keeps a $600,000 asset in the family bank, pays the parents a fair return, and costs the daughter less than the market. It only works if she actually pays — if she misses payments and the parents never pursue them, the examiner\'s view, and *Maxwell*\'s view, is that a gift happened in year one.',
      ],
    },
    misconception: {
      claim: '"If my companies lend to each other, the interest just cancels out and I pay no tax."',
      reality: 'Interest is income to the lender and expense to the borrower — symmetrical, not free. Within one tax group the net is approximately zero; any net saving comes from bracket, timing or jurisdiction differences, which §482 (arm\'s-length pricing), §267(a)(2) (matching related-party deductions and income), §163(j) (interest limitation) and §385 (debt versus equity) exist to police. Principal moving between companies is never income and never deductible. The real benefits of intercompany lending are liquidity control, creditor priority and keeping third-party debt off operating entities — not tax elimination.',
      confidence: 'red',
    },
    professionalExplanation: [
      'The adviser\'s first question is **what is this money, really**. If a parent "lends" to a child with no realistic expectation of repayment, the honest answer is a gift and the right paperwork is a Form 709, not a note. If the money is genuinely to be repaid, the note must be written at or above the AFR for its term, with a maturity, a payment schedule and a security interest where any commercial lender would take one. The AFR must be checked for the month the note is signed; the IRS publishes it monthly, and using last year\'s rate is a common and avoidable error. Where the note funds a residence, recording the lien is what makes the interest potentially deductible to the borrower; without recording there is no qualified residence interest.',
      'The **tax questions** that follow are concrete. The lender reports interest income annually, in the year received (cash basis) or accrued (accrual basis), and the family bank entity issues the relevant information returns when required. The borrower\'s deduction depends on use — residence (§163(h)), trade or business (§162, subject to §163(j)), investment (§163(d) limits), or personal (none). If the lender later **forgives** principal or interest, the forgiven amount is a gift (Form 709) in a family context; in a business context it may be cancellation-of-debt income to the borrower under §61(a)(11) unless an exception in §108 applies. On the lender\'s death, the note is an estate asset at its fair value, and a bequest of the note to the borrower is a bequest, not a gift — a planning point families often miss.',
      'For **intercompany loans**, the professional work is pricing and documentation. The rate should be defensible by reference to what the borrowing company could obtain from a third party, which may be well above the AFR for a thinly capitalised subsidiary. Debt-to-equity ratios, subordination to bank debt, and whether the lender would actually enforce are the §385 facts. Across borders, a transfer-pricing memorandum under §482 and the equivalent foreign rules (and withholding tax on interest leaving a jurisdiction) are not optional. Thin-capitalisation rules in the borrower\'s jurisdiction can deny the deduction regardless of documentation.',
      'When professionals are required: a tax adviser before any note above the §7872 de minimis thresholds is signed; a real estate attorney to draft and record an intra-family mortgage; a CPA to track imputed interest, prepare Forms 709 for forgiven amounts and manage the related-party matching rules; and, for a family bank entity with multiple borrowers, an operating agreement drafted by counsel that establishes the lending policy, the committee and the default procedure. If loans cross borders, add international tax counsel for §482 pricing and withholding. The cost of that advice is a fraction of the cost of a recharacterised note.',
    ],
    knowledgeCheck: [
      {
        id: 'ch07-q1',
        prompt: 'A mother lends her son $300,000 at 0% interest with a signed note and a 10-year maturity. The mid-term AFR is 4%. What is the most accurate description of the federal tax treatment?',
        options: [
          'No consequence; a signed note is enough to make it a loan.',
          'Under IRC §7872 the mother is treated as making an annual gift of the foregone interest (about $12,000 in year one) and as receiving that amount as interest income, even though no cash changed hands.',
          'The entire $300,000 is a gift in year one.',
          'The son has $12,000 of taxable income each year.',
        ],
        answer: 1,
        explanation: 'A below-market gift loan above the de minimis thresholds triggers deemed transfers: lender to borrower as a gift, borrower to lender as interest. The $100,000 limitation may reduce the imputed amount by reference to the borrower\'s net investment income, but the principle stands. Charging at least the AFR avoids the rule entirely.',
      },
      {
        id: 'ch07-q2',
        prompt: 'Which factor from the Tax Court\'s bona fide debt analysis is most often decisive in practice for intra-family loans?',
        options: [
          'Whether the note was notarised.',
          'Whether the interest rate exactly matched the AFR.',
          'Whether payments were actually made on schedule and the lender behaved like a creditor when they were not.',
          'Whether the loan exceeded $100,000.',
        ],
        answer: 2,
        explanation: 'Courts look at the whole pattern — note, rate, maturity, security, solvency, records, intent — but the conduct after signing is the strongest evidence. A note with no repayment history and a lender who never demanded payment is treated as a disguised gift (see Estate of Maxwell v. Commissioner).',
      },
      {
        id: 'ch07-q3',
        prompt: 'Parents lend their daughter the purchase price of a home at the long-term AFR but never record a lien on the property. What is the consequence for the daughter\'s interest deduction?',
        options: [
          'None; any loan from a parent produces deductible interest.',
          'The interest is not qualified residence interest under §163(h) because the debt is not secured by the residence, so it is generally not deductible.',
          'The interest is deductible at half the normal rate.',
          'The loan is automatically a gift.',
        ],
        answer: 1,
        explanation: 'Qualified residence interest requires debt secured by the residence, which in practice means a recorded mortgage or deed of trust. Unsecured family debt is personal interest and not deductible. The loan is still a loan for gift-tax purposes if it is otherwise bona fide.',
      },
      {
        id: 'ch07-q4',
        prompt: 'Holding Co. lends $2 million to its wholly owned Property Co. at 6%. Which statement about the tax effect is correct?',
        options: [
          'The interest disappears because both companies are owned by the same family.',
          'Holding Co. has $120,000 of interest income and Property Co. has a $120,000 interest expense, deductible subject to §163(j) and related-party rules; the net effect within one tax group is close to zero.',
          'Property Co. has $2 million of taxable income on receipt of the loan.',
          'The principal repayments are deductible to Property Co.',
        ],
        answer: 1,
        explanation: 'Intercompany interest is symmetrical. Principal is never income or deduction. Any net benefit comes from bracket or timing differences, which §267(a)(2), §163(j), §385 and §482 limit. The benefits of intercompany lending are liquidity and creditor-priority management, not tax elimination.',
      },
      {
        id: 'ch07-q5',
        prompt: 'A family bank LLC forgives the remaining $80,000 balance on a loan to a grandchild who lost his job. What is the most likely tax characterisation?',
        options: [
          'Nothing; forgiveness within a family has no tax effect.',
          'A gift of $80,000 from the lender (or its owners, looking through the LLC) to the grandchild, reportable on Form 709 to the extent it exceeds the annual exclusion.',
          'Deductible bad-debt expense for the LLC at ordinary rates.',
          'Taxable income to the grandchild as wages.',
        ],
        answer: 1,
        explanation: 'In a family context, forgiveness of a bona fide loan is a gift of the forgiven amount; the business bad-debt deduction is generally unavailable because the lender\'s motive is personal. Cancellation-of-debt income rules under §61(a)(11) and §108 are displaced by the gift exclusion in §102 for genuine donative forgiveness. The family bank\'s policy should say this in advance.',
      },
    ],
    caseStudy: {
      title: 'The Varga Family Bank, LLC',
      family: 'Second-generation owners of a Chicago-area commercial HVAC company sold in 2016 for about $28 million; two parents in their seventies, four children, nine grandchildren.',
      situation: 'After the sale the parents found themselves fielding requests: a down payment here, a restaurant there, a graduate degree, a divorce settlement. Each request was a negotiation; each "loan" was a handshake. Within three years two of the handshakes had become grievances between siblings about who had received what, and the parents\' CPA was asking uncomfortable questions about gift tax returns that had never been filed.',
      structure: 'The parents funded a Delaware LLC, Varga Family Bank, with $4 million, owned 98% by their existing dynasty trust and 2% by a management company they controlled. The operating agreement set a lending policy: purposes limited to primary residences, education, and business ventures with a written plan; maximum loan per borrower; interest at the applicable AFR for the term plus 0.5%; recorded security for any real estate loan; a three-member loan committee comprising one parent, one child elected annually by the siblings, and the family\'s outside CPA. Standard note and mortgage forms were drafted by counsel. The policy stated that any forgiven amount is a gift reported on Form 709 and reduces that borrower\'s future credit limit by the same amount.',
      outcome: 'In the first five years the Bank made eleven loans totalling $3.1 million, including three home mortgages and two business loans. One business loan defaulted after the grandson\'s coffee roastery closed; the committee restructured once, then forgave $62,000, filed a Form 709 and recorded the reduction in his limit. The siblings stopped arguing about fairness because the ledger was visible to all of them. The parents stopped being asked for money at dinner because the answer was "apply to the committee". The restaurant loan is current and the daughter who runs it pays interest income into the trust that will eventually be hers.',
      lesson: 'The Bank\'s value was not the AFR arbitrage, which is real but modest. It was converting an emotional, invisible, undocumented flow of family money into a visible, governed, documented one. The default proved the policy: a forgiveness handled by rule, reported correctly, and absorbed without resentment. The parents\' comment afterwards was that they wished they had built it before the sale, when the amounts were smaller and the habits easier to form.',
    },
    terminology: [
      { term: 'Family bank', definition: 'An entity or trust holding family capital whose purpose is to lend to family members and family companies on documented terms, governed by a written lending policy and (ideally) a committee.' },
      { term: 'Promissory note', definition: 'A written, unconditional promise to pay a stated sum at a stated maturity with stated interest. The foundational document of any loan the tax law will respect.' },
      { term: 'Bona fide debt', definition: 'A genuine debtor-creditor relationship with an unconditional obligation to repay, evidenced by the Tax Court factors: note, rate, maturity, payments, security, solvency, records, intent.' },
      { term: 'Applicable federal rate (AFR)', definition: 'Minimum interest rates published monthly by the IRS under IRC §1274(d) for short-, mid- and long-term loans, used as the benchmark for §7872 and §1274.' },
      { term: 'Below-market loan', definition: 'A loan at a rate below the AFR; under IRC §7872 the foregone interest is treated as transferred by the lender to the borrower (as a gift, compensation or dividend depending on context) and retransferred as interest.' },
      { term: 'Foregone interest', definition: 'The difference between interest at the AFR and the interest actually payable, computed on the outstanding balance over the year; the amount deemed transferred under §7872.' },
      { term: 'Imputed interest (§§483 / 1274)', definition: 'Interest the Code deems to exist in a deferred-payment sale that states inadequate interest, recharacterising part of the price as interest income to the seller.' },
      { term: 'Intra-family mortgage', definition: 'A loan from a family lender secured by a recorded lien on the borrower\'s residence, which can make the borrower\'s interest qualified residence interest under §163(h).' },
      { term: 'Qualified residence interest', definition: 'Interest on acquisition indebtedness secured by a principal or second residence, deductible within statutory limits under IRC §163(h)(3).' },
      { term: 'Recharacterisation', definition: 'The IRS or a court treating a purported loan as a gift (family context) or as equity (corporate context) based on substance over form.' },
      { term: 'Balance-sheet symmetry', definition: 'The lender\'s note receivable equals the borrower\'s note payable and interest income equals interest expense at every date — the accounting signature of a real loan.' },
      { term: 'Related-party matching (§267(a)(2))', definition: 'The rule that an accrual-basis payer may not deduct an amount owed to a related cash-basis payee until the payee includes it in income.' },
    ],
    references: [
      { title: 'Treatment of loans with below-market interest rates', citation: '26 U.S.C. § 7872', jurisdiction: 'United States (federal)', type: 'statute', note: 'Gift loans, compensation-related and corporation-shareholder loans; de minimis and $100,000 limitations.' },
      { title: 'Determination of issue price in the case of certain debt instruments issued for property; interest on certain deferred payments', citation: '26 U.S.C. §§ 1274, 483', jurisdiction: 'United States (federal)', type: 'statute', note: 'Imputed interest and AFR definition (§1274(d)).' },
      { title: 'Applicable Federal Rates', citation: 'IRS monthly revenue rulings (Rev. Rul. series) publishing AFRs under § 1274(d)', jurisdiction: 'United States (federal)', type: 'guidance', url: 'https://www.irs.gov/applicable-federal-rates', note: 'Short-, mid- and long-term rates by compounding period, published monthly.' },
      { title: 'Interest; qualified residence interest; limitation on business interest', citation: '26 U.S.C. § 163(h), § 163(j); Treas. Reg. § 1.163-10T', jurisdiction: 'United States (federal)', type: 'statute', note: 'Deductibility of interest by use; secured-debt requirement for residence interest.' },
      { title: 'Estate of Maxwell v. Commissioner', citation: '3 F.3d 591 (2d Cir. 1993)', jurisdiction: 'United States (2d Cir.)', type: 'case', note: 'Intra-family sale for a note with forgiven payments treated as transfer with retained life estate; the note was not bona fide debt.' },
      { title: 'Fin Hay Realty Co. v. United States; Estate of Mixon v. United States', citation: '398 F.2d 694 (3d Cir. 1968); 464 F.2d 394 (5th Cir. 1972)', jurisdiction: 'United States (federal courts)', type: 'case', note: 'Multi-factor tests for distinguishing debt from equity, applied to shareholder and intercompany advances.' },
      { title: 'Losses, expenses and interest with respect to transactions between related taxpayers', citation: '26 U.S.C. § 267(a)(2)', jurisdiction: 'United States (federal)', type: 'statute', note: 'Matching rule for related-party interest and other deductions.' },
      { title: 'Allocation of income and deductions among taxpayers', citation: '26 U.S.C. § 482; Treas. Reg. § 1.482-2(a) (loans or advances)', jurisdiction: 'United States (federal)', type: 'regulation', note: 'Arm\'s-length interest on intercompany loans, including cross-border.' },
    ],
    takeaways: [
      'A family bank is a governance structure first: written policy, standard documents, a committee, a ledger everyone can see, and a stated rule for defaults and forgiveness.',
      'A loan the tax law respects has a note, a rate at or above the AFR, a fixed maturity, security where a commercial lender would want it, and — above all — payments that actually happen and a lender who behaves like a creditor.',
      'IRC §7872 imputes gifts and interest on below-market gift loans; §§483/1274 reprice deferred-payment sales; charging the AFR for the correct term, checked for the month of signing, avoids both.',
      'An intra-family mortgage only produces deductible interest for the borrower if the lien is recorded; the lender reports the interest as income either way.',
      'Interest between family companies is symmetrical income and expense; principal is never income. Intercompany lending manages liquidity and creditor priority — it does not eliminate tax, and §§482, 267, 163(j) and 385 police anyone who pretends it does.',
    ],
  },
  Diagram,
  Simulator,
};

export default mod;
