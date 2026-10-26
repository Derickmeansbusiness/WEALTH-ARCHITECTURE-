import type { DebtLesson } from '../types';
import { InterestCurves, AmortizationBars } from './visuals/lesson-visuals';

const lesson: DebtLesson = {
  id: 'debt-01',
  number: 1,
  slug: 'understanding-debt',
  title: 'Understanding Debt',
  subtitle: 'Principal, interest, amortization, collateral and the words on the term sheet that actually decide what you owe.',
  hook: 'Every loan is three promises: give the money back, pay for the time you had it, and accept what happens if you don’t.',
  duration: '30 min',
  objectives: ['asset-protection', 'tax-planning', 'governance'],
  sections: [
    {
      id: 'anatomy',
      heading: 'The anatomy of a loan',
      body: [
        'Strip any credit agreement down and you find the same skeleton. **Principal** is the amount advanced. **Interest** is the price of using it, quoted as an annual rate and charged on the outstanding balance for each period. **Maturity** is the date the balance must be zero. Everything else on the term sheet — covenants, fees, collateral, guarantees, prepayment terms — exists to protect the lender’s expectation of being repaid in full and on time.',
        'The first thing an underwriter does with a request is translate it into a cash-flow question: from what source will this principal and interest be paid, and what is the second way out if the first fails? For a mortgage the first way out is the borrower’s income or the property’s rent; the second is the sale of the collateral. For an unsecured business loan the second way out is weak, which is why pricing is higher and the owner is usually asked to sign personally.',
        'Learn to read a loan as a schedule rather than a lump sum. A $700,000 mortgage at 6.5% over 30 years is not really “a $700,000 obligation”; it is a stream of 360 payments of about $4,424, of which roughly $893,000 in aggregate is interest. The lump-sum view hides the price; the schedule view reveals it.',
      ],
    },
    {
      id: 'apr',
      heading: 'Nominal rate, APR and the cost of fees',
      body: [
        'The **nominal rate** (the “note rate”) is the percentage applied to the balance. The **annual percentage rate (APR)** is a disclosure construct: under the US Truth in Lending Act and its implementing Regulation Z, administered by the CFPB, the APR expresses the total cost of credit — interest plus most finance charges such as origination fees and points — as a yearly rate. A loan with a 6.5% note rate and two points of fees might carry an APR near 6.7%; the gap is the fee load expressed as a rate.',
        'APR is useful for comparing offers with different fee structures over the full term, but it assumes you hold the loan to maturity. If you expect to refinance or sell in five years, points paid up front are amortized over a much shorter horizon and the effective cost rises sharply. Underwriters and sophisticated borrowers run the all-in cost over the *expected* holding period, not the contractual term.',
        'Outside the US the disclosure language changes — the UK and EU use APR or “APRC” for mortgages; UAE banks quote flat or reducing-balance rates and the Central Bank requires disclosure of the reducing-balance equivalent — but the discipline is the same: insist on a rate that includes the fees, computed on the declining balance you actually owe.',
      ],
      callouts: [{ tone: 'amber', title: 'Flat rate vs reducing balance', body: 'A “flat” rate charged on the original principal for the whole term is roughly double the equivalent reducing-balance rate on an amortizing loan, because you pay interest on money you have already returned. Always ask which convention a quote uses.' }],
    },
    {
      id: 'compounding',
      heading: 'Simple versus compound interest',
      body: [
        '**Simple interest** is computed only on principal: $100,000 at 6% earns or costs $6,000 every year, so after 30 years the total is $280,000. **Compound interest** adds accrued interest to the base, so interest is charged on interest. The same $100,000 at 6% compounded annually becomes about $574,000 in 30 years; compounded monthly, about $602,000. The curve is not steeper at first — it is almost indistinguishable for a decade — and then it leaves simple interest behind.',
        'Most consumer and commercial loans are **amortizing**, which means interest is charged each period on the current balance and paid in cash, so it never compounds as long as you pay on time. Compounding appears on the borrower’s side when interest is *not* paid — negative amortization, capitalized interest on construction loans, payment-in-kind (PIK) notes, deferred student loans, or a credit card balance you only partly pay. On the lender’s side, compounding is simply the return on reinvested interest.',
        'A nominal 6% compounded monthly is an **effective annual rate** of about 6.17%: (1 + 0.06/12)^12 − 1. The difference looks trivial until it is applied to large balances over long periods, which is exactly the situation of a family balance sheet.',
      ],
      Visual: InterestCurves,
    },
    {
      id: 'fixed-variable',
      heading: 'Fixed and variable rates: index, margin and caps',
      body: [
        'A **fixed rate** holds for the life of the loan or for an initial period. A **variable (floating) rate** is built from two pieces: an **index** that moves with the market — in the US today typically SOFR (which replaced LIBOR), the prime rate, or a Treasury yield; in the UAE EIBOR; in the CEMAC zone the BEAC policy rate (TIAO) is the usual reference — plus a fixed **margin** (spread) that reflects the lender’s view of your risk. The all-in rate is index + margin, reset on a schedule.',
        'Consumer adjustable-rate mortgages add **caps**: a limit on the first adjustment, a periodic cap on each later reset, and a lifetime cap. A “5/1 ARM with 2/2/5 caps” holds for five years, then adjusts annually, with no single move exceeding 2% and no more than 5% above the start rate over the life of the loan. Commercial floating-rate loans usually have no caps unless the borrower buys an interest-rate cap or swap separately — which lenders of larger loans frequently require.',
        'The underwriting question for any floating-rate exposure is not “what is the rate today” but “what does my debt service look like at the cap, or at 300 basis points higher, and does the asset still cover it?” That stress is the subject of Lesson 09 and the Stress Test tool.',
      ],
    },
    {
      id: 'amortization',
      heading: 'Amortization, interest-only and balloon structures',
      body: [
        'In a **fully amortizing** loan every payment is the same, but its composition shifts. The first payment on our $700,000 mortgage is about $3,792 interest and $633 principal; by year 20 the split has reversed. The crossover point where principal exceeds interest arrives surprisingly late — well past the midpoint for a 30-year loan at 6.5% — because interest is calculated on a balance that falls slowly at first.',
        '**Interest-only** periods leave the balance untouched: lower payments, zero equity build from amortization, and the entire principal still due. **Balloon** loans size the payment on a long amortization (say 25 years) but mature early (say 7 years), leaving a large balance — often 80% or more of the original principal — due at maturity. Commercial real estate lending is overwhelmingly built this way; the borrower is relying on a refinance or sale to retire the balloon.',
        'That reliance is a risk the term sheet does not price explicitly. If the property is worth less, rates are higher, or credit markets are closed when the balloon comes due, the borrower has what lenders call **maturity risk** or a “refinancing wall”. The Capital Stack tool lets you build the same loan three ways and compare total interest, equity build and the balloon.',
      ],
      Visual: AmortizationBars,
    },
    {
      id: 'collateral',
      heading: 'Collateral, security interests and priority',
      body: [
        '**Collateral** is an asset the borrower pledges so that, on default, the lender can take and sell it. The pledge is a **security interest**; making it effective against third parties is **perfection**. In the US, security interests in personal property (equipment, receivables, inventory, shares) are governed by **UCC Article 9**, perfected typically by filing a UCC-1 financing statement, with priority generally going to the first to file or perfect. Real estate is secured by a mortgage or deed of trust recorded in the county land records.',
        'A **secured** loan has a second way out; an **unsecured** loan relies on the borrower’s general credit and stands behind every secured creditor in a liquidation. This is why secured credit is cheaper and larger, and why a “blanket lien” on all business assets is standard for small-business term loans. In the UAE, security over movables is now registrable under the Movables Security Law in the Emirates Movable Collateral Registry; in the OHADA zone, the Uniform Act on Secured Transactions (2010 revision) governs pledges and the RCCM registry. Lesson 02 and the Jurisdictions page go deeper.',
        'Collateral has a hidden cost beyond the asset itself: **cross-collateralization** (one asset securing several loans) and **cross-default** clauses (default on one facility triggers default on all) knit a borrower’s obligations together. These clauses are how a problem at one company reaches an unrelated asset — the contagion mechanism of Lesson 09.',
      ],
    },
    {
      id: 'recourse',
      heading: 'Recourse, nonrecourse and the tax wrinkle',
      body: [
        'On a **recourse** loan the borrower is personally liable for any shortfall after the collateral is sold. On a **nonrecourse** loan the lender’s only remedy is the collateral; a deficiency cannot be pursued against the borrower’s other assets. Most US residential mortgages are recourse in form (state anti-deficiency statutes make some effectively nonrecourse); most institutional commercial mortgages are nonrecourse with **carve-out guarantees** that spring to full recourse on “bad acts” such as fraud, unauthorized transfers or voluntary bankruptcy — the so-called bad-boy guaranty.',
        'Nonrecourse debt is not a free option. The lender prices it, requires lower leverage, and the carve-outs are drafted broadly. A guarantor who assumes the structure protects them has often signed away that protection in the carve-out schedule.',
        'Then there is tax. When debt is forgiven or discharged for less than its face, the borrower generally has **cancellation-of-debt (COD) income** under IRC §61, subject to exclusions in §108 (bankruptcy, insolvency, qualified real property business indebtedness, among others). For **nonrecourse** debt the analysis differs: under Treasury Regulation §1.1001-2 and the Supreme Court’s decision in *Commissioner v. Tufts* (1983), the full nonrecourse balance is treated as amount realized on disposition of the collateral — so a foreclosure can produce a taxable gain even when the owner walked away with nothing. The structure that limits legal liability does not limit the tax question; a professional should run both before any workout.',
      ],
      callouts: [{ tone: 'danger', title: 'Documentation is the structure', body: 'A loan with no note, no stated interest, no maturity and no repayment history is not a loan in the eyes of a court, a tax authority or a bankruptcy trustee. It is whatever they decide it is — a gift, equity, a sham. Lesson 08 covers how families document properly.' }],
    },
  ],
  keyTerms: [
    { term: 'Principal', definition: 'The amount borrowed and still outstanding, on which interest is charged.' },
    { term: 'APR', definition: 'Annual percentage rate: the cost of credit including most finance charges, expressed as a yearly rate under TILA / Regulation Z.' },
    { term: 'Amortization', definition: 'The scheduled repayment of principal over the loan term, so that each level payment contains a changing mix of interest and principal.' },
    { term: 'Balloon payment', definition: 'A large principal balance due at maturity because the loan term is shorter than its amortization schedule.' },
    { term: 'Index + margin', definition: 'The two components of a floating rate: a market reference (SOFR, prime, EIBOR, TIAO) plus a fixed spread for the borrower’s risk.' },
    { term: 'Security interest', definition: 'A lender’s legal right in collateral, made enforceable against third parties by perfection (filing, registration or possession).' },
    { term: 'Recourse', definition: 'The lender’s right to pursue the borrower’s other assets for any shortfall after collateral is sold; nonrecourse limits the remedy to the collateral.' },
    { term: 'COD income', definition: 'Cancellation-of-debt income: forgiven debt is generally taxable to the borrower unless an exclusion applies (IRC §§61, 108).' },
  ],
  knowledgeCheck: [
    { id: 'd1q1', prompt: 'A lender quotes a 6.5% note rate with two points of origination fees. The APR disclosed will be:', options: ['Exactly 6.5%, because APR equals the note rate', 'Higher than 6.5%, because APR includes most finance charges', 'Lower than 6.5%, because fees are deducted from interest', 'Undefined until the loan is repaid'], answer: 1, explanation: 'Under Regulation Z the APR expresses interest plus most finance charges as a yearly rate, so fees push it above the note rate.' },
    { id: 'd1q2', prompt: 'On a 30-year fully amortizing loan at 6.5%, when does the principal portion of the payment first exceed the interest portion?', options: ['In the first year', 'Around year 5', 'Well past the midpoint of the term', 'Never; interest always exceeds principal'], answer: 2, explanation: 'Interest is charged on the outstanding balance, which declines slowly at first, so the crossover arrives late in the schedule.' },
    { id: 'd1q3', prompt: 'A “5/1 ARM with 2/2/5 caps” means:', options: ['Fixed for 5 years, then adjusts annually; max 2% first adjustment, 2% per later adjustment, 5% over life', 'Fixed for 1 year, then adjusts every 5 years', 'Five payments per year, one of which is interest-only', 'A balloon payment of 5% due in year 2'], answer: 0, explanation: 'The notation describes the fixed period, adjustment frequency and the initial, periodic and lifetime caps.' },
    { id: 'd1q4', prompt: 'A nonrecourse commercial mortgage with carve-out guarantees protects the guarantor from a deficiency:', options: ['In all circumstances', 'Unless a carve-out event (fraud, unauthorized transfer, voluntary bankruptcy) occurs', 'Only if the property is residential', 'Only if the loan is under $1 million'], answer: 1, explanation: 'Bad-boy carve-outs convert the loan to full recourse upon specified acts; the protection is conditional on the guarantor’s conduct.' },
    { id: 'd1q5', prompt: 'A borrower is foreclosed on a property secured by nonrecourse debt and receives nothing. For US federal tax purposes:', options: ['There is no tax consequence because no cash was received', 'The full nonrecourse balance is treated as amount realized and may produce taxable gain', 'The borrower may deduct the lost equity as a casualty loss', 'The lender pays the tax'], answer: 1, explanation: 'Under Treas. Reg. §1.1001-2 and Commissioner v. Tufts, the nonrecourse balance is included in amount realized on disposition, which can produce gain with no cash.' },
  ],
  misconception: {
    claim: '“Interest-only loans are cheaper because the payment is lower.”',
    reality: 'The payment is lower because no principal is being repaid; the full balance remains due and total interest over the life of the obligation is higher, not lower. Interest-only is a cash-flow timing choice that trades equity build for liquidity and adds maturity risk.',
    confidence: 'red',
  },
  references: [
    { title: 'Truth in Lending Act and Regulation Z — definition and disclosure of the annual percentage rate', citation: '15 U.S.C. § 1601 et seq.; 12 C.F.R. Part 1026', jurisdiction: 'US', type: 'statute', url: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/' },
    { title: 'CFPB — What is the difference between a mortgage interest rate and an APR?', jurisdiction: 'US', type: 'guidance', url: 'https://www.consumerfinance.gov/ask-cfpb/' },
    { title: 'Treasury Regulation §1.1001-2 — Discharge of liabilities in amount realized', citation: '26 C.F.R. § 1.1001-2', jurisdiction: 'US', type: 'regulation' },
    { title: 'Commissioner v. Tufts', citation: '461 U.S. 300 (1983)', jurisdiction: 'US', type: 'case', note: 'Nonrecourse debt included in amount realized on disposition of encumbered property.' },
    { title: 'IRC §61(a) and §108 — gross income includes discharge of indebtedness; exclusions', citation: '26 U.S.C. §§ 61, 108', jurisdiction: 'US', type: 'statute' },
    { title: 'Uniform Commercial Code Article 9 — Secured Transactions', jurisdiction: 'US', type: 'statute', note: 'Attachment, perfection and priority of security interests in personal property.' },
    { title: 'OCC Comptroller’s Handbook — Commercial Real Estate Lending', jurisdiction: 'US', type: 'guidance', url: 'https://www.occ.gov/publications-and-resources/publications/comptrollers-handbook/' },
    { title: 'Federal Reserve — Consumer Handbook on Adjustable-Rate Mortgages (CHARM booklet, now maintained by CFPB)', jurisdiction: 'US', type: 'publication' },
    { title: 'Central Bank of the UAE — Consumer Protection Regulation and Standards (interest disclosure on reducing-balance basis)', jurisdiction: 'UAE', type: 'regulation', note: 'Phrased generally; verify current circular references.' },
    { title: 'OHADA Uniform Act on the Organisation of Securities (Acte uniforme portant organisation des sûretés), revised 15 December 2010', jurisdiction: 'OHADA / CEMAC', type: 'statute' },
  ],
  jurisdictionNotes: {
    US: { verified: true, notes: ['APR disclosure under TILA / Regulation Z (12 C.F.R. 1026); ARM caps disclosed in the loan estimate and closing disclosure.', 'Security over personal property perfected under UCC Article 9; real estate liens recorded at county level.', 'Nonrecourse foreclosures can produce gain under Treas. Reg. §1.1001-2 / Tufts; COD income under §61 with §108 exclusions.'] },
    UAE: { verified: false, notes: ['Banks quote both flat and reducing-balance rates; the Central Bank consumer-protection framework requires disclosure of the reducing-balance equivalent.', 'Real estate mortgages registered with the relevant emirate land department (e.g. Dubai Land Department under Dubai Law No. 14 of 2008); movables under Federal Law No. 4 of 2020 and the Emirates Movable Collateral Registry.', 'Recourse is the norm; verify enforcement procedure and any deficiency rules with UAE counsel.'] },
    CEMAC: { verified: false, notes: ['Floating rates reference BEAC’s policy rate; COBAC regulates bank conduct and prudential limits.', 'Security interests governed by the OHADA Uniform Act on Secured Transactions (2010) and registered at the RCCM; mortgages (hypothèques) registered with the land registry (conservation foncière).', 'Tax treatment of debt discharge under the Cameroon General Tax Code should be verified with local advisers.'] },
    UK: { verified: false, notes: ['Consumer credit regulated by the FCA under the Consumer Credit Act 1974 and FCA Handbook (CONC); mortgages under MCOB.', 'Company charges registered at Companies House (Companies Act 2006, Part 25).', 'Content for this jurisdiction is in preparation.'] },
  },
};
export default lesson;
