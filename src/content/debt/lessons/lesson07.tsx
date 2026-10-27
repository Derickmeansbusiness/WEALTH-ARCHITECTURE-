import type { DebtLesson } from '../types';
import { RefinanceTimeline } from './visuals/lesson-visuals';

const lesson: DebtLesson = {
  id: 'debt-07',
  number: 7,
  slug: 'real-estate-debt-and-refinancing',
  title: 'Real Estate Debt & Refinancing',
  subtitle: 'Acquisition, construction, bridge and permanent loans; equity release; and why cash-out proceeds are a repayment obligation, not income.',
  hook: 'Real estate is the asset class where debt is most available, most long-dated and most misunderstood. The refinance that “pays you back your down payment” has simply lent you money against a building you already owned.',
  duration: '35 min',
  objectives: ['tax-planning', 'asset-protection', 'estate-planning'],
  sections: [
    {
      id: 'lifecycle',
      heading: 'The debt lifecycle of a property',
      body: [
        'A building passes through financing stages the way a company passes through funding rounds. **Land and construction loans** fund the build: they are short, floating, drawn in tranches against certified progress, and usually carry an **interest reserve** so that interest accrues into the loan rather than being paid from the sponsor’s pocket. **Bridge loans** carry a property through a transition — lease-up, renovation, a repositioning — for one to three years at a premium rate. **Permanent (acquisition or “take-out”) loans** are the long-dated, lower-rate debt on a stabilized, income-producing asset, sized on its NOI. **Refinancing** replaces one permanent loan with another, often to change the rate, extend the maturity or extract equity.',
        'Each stage has its own lender and its own risk. Construction lenders worry about completion and cost overruns; bridge lenders about whether the business plan executes; permanent lenders about the durability of the cash flow. A developer who treats the construction loan as permanent financing has misread the instrument: it matures when the building is done, and if the take-out loan is not available on that date, the project is in default with a finished building and no debt to carry it.',
        'For investors buying stabilized property the entry point is the permanent loan — a bank or agency mortgage sized by the minimum of LTV, DSCR and debt-yield tests (Lesson 05). For individual investors holding in LLCs, **DSCR loans** from non-bank lenders underwrite rent rather than personal income, typically at higher rates with prepayment penalties and personal guarantees.',
      ],
    },
    {
      id: 'construction',
      heading: 'Construction finance: draws, reserves and completion risk',
      body: [
        'A construction loan is a commitment, not a disbursement. The lender agrees to advance up to a maximum as work is completed; each **draw** is requested against invoices and an inspector’s certification of percentage complete, with a **retainage** (often 5–10%) held back until final completion and lien releases. The sponsor funds its equity **first** — lenders require the equity to go in before any loan proceeds — and the budget includes a **contingency** (5–10% of hard costs) and an **interest reserve** sized on the expected draw schedule and rate.',
        'The risks concentrate at the end. If costs overrun the contingency, the lender will not fund beyond the commitment; the sponsor must inject equity or the project stalls. If the interest reserve runs out because the build took longer or rates rose, interest becomes a cash call. If the take-out lender’s terms have moved — because rates rose or because leasing is slower than the pro forma — the permanent loan comes in smaller than the construction balance, and the gap is, again, equity. Construction lenders require **completion guarantees** from the sponsor for exactly these reasons, and those guarantees are full recourse.',
      ],
    },
    {
      id: 'refinancing',
      heading: 'Refinancing: rate, term and cash-out',
      body: [
        'A **rate-and-term refinance** replaces the existing loan with a new one of similar size at a better rate or longer maturity; the economic question is whether the savings in interest exceed the closing costs over the period you expect to hold the loan. A **cash-out refinance** takes a *larger* loan than the existing balance and pays the difference to the owner. The property has appreciated, or the balance has amortized, or both; the owner borrows against the equity that growth created.',
        'Here is the point this lesson exists to make: **cash-out proceeds are debt**. The $200,000 that arrives in the owner’s account is not profit, not income and not a return of capital; it is a new loan balance that must be serviced from the property’s rent and repaid at maturity. The owner has converted illiquid equity into liquid cash *and* a larger obligation. The visual below shows both sides: the cash released, and the new, larger loan with a higher monthly payment for another thirty years.',
        'Because the proceeds are a loan, they are generally not taxable income when received in the US — a borrower does not realize income by borrowing. That is correct and it is also the source of a persistent misunderstanding: that refinancing is a way to “take gains tax-free”. The gain has not been taxed because it has not been realized; it remains embedded in the property and is realized on sale (and the loan must be repaid from the sale proceeds), while the interest on the new loan is a real annual cost whose deductibility depends on how the proceeds are used (the **interest tracing rules** of Treas. Reg. §1.163-8T). Deferral is not elimination.',
      ],
      Visual: RefinanceTimeline,
      callouts: [{ tone: 'danger', title: 'Proceeds are a repayment obligation', body: 'A cash-out refinance that funds consumption leaves the property carrying debt that produced no asset. A cash-out that funds another income-producing asset is capital recycling (Lesson 04); the new debt still has to be covered by the original property’s rent. Underwrite the property after the refinance, not before.' }],
    },
    {
      id: 'costs',
      heading: 'What refinancing costs',
      body: [
        'Closing costs on a refinance commonly run 1–3% of the loan: origination fees and points, appraisal, title insurance (a new lender’s policy each time), recording fees, legal, and in some jurisdictions mortgage or documentary taxes that can dwarf the rest — some US states and the UAE land departments charge registration fees as a percentage of the mortgage amount. Add any **prepayment penalty** on the existing loan: yield maintenance or defeasance on CMBS and life-company loans can cost years of interest savings; step-down penalties (5-4-3-2-1) on DSCR loans are common.',
        'The honest comparison is the **break-even horizon**: closing costs plus penalties divided by the monthly savings tells you how many months you must hold the new loan to come out ahead. If you expect to sell or refinance again before then, do not refinance for rate. For cash-out, the comparison is the all-in cost of the new money — including the higher rate now applied to the *entire* balance, not just the cash extracted — against the return on whatever the cash will fund.',
      ],
    },
    {
      id: 'rates-maturity',
      heading: 'Rate changes and maturity risk',
      body: [
        'Real estate debt is where **maturity risk** does the most damage, because loan terms are shorter than asset lives. A 7-year balloon on a 25-year amortization leaves roughly 85% of the principal due at maturity. If, in year seven, rates are 300 basis points higher and values 15% lower, the property that supported a 70% LTV loan at 1.30× DSCR may support only a 55% LTV loan at the new rate — and the difference must come from the owner’s pocket as a **cash-in refinance**, or the property is sold into a weak market, or the lender extends on its own terms.',
        'This is not a theoretical pattern. It is what happened to office and some multifamily owners from 2022 onward, when floating-rate bridge debt reset upward and permanent lenders tightened. Owners with fixed-rate, long-dated debt and modest leverage waited it out; owners with short, floating, high-LTV debt handed back keys. The difference was capital structure, chosen years earlier.',
        'Mitigation is unglamorous: borrow fixed when you can afford to, buy an interest-rate cap when you cannot, keep LTV below what the lender allows, ladder maturities across a portfolio so no single year carries a wall, and begin refinancing conversations 12–18 months before maturity. Case E in this studio shows a maturity ladder for an institutional family; the Stress Test tool shocks rates and values on any loan you build.',
      ],
    },
    {
      id: 'equity-release',
      heading: 'Equity release in a family plan',
      body: [
        'Families release equity from real estate for legitimate reasons: to diversify a concentrated position without selling (and without the tax event a sale would trigger), to fund another investment, to provide liquidity for estate planning, or to equalize among heirs. Each is a borrowing decision and should be underwritten as one: what will the property’s DSCR be after the new loan under stressed rents, how will the proceeds be invested, what does the interest cost, and how is the loan isolated from the rest of the structure.',
        'Three structural details matter. First, the **borrowing entity**: a property held in an LLC that refinances keeps the loan at the entity level, but the lender will usually want a guarantee from the members. Second, **due-on-sale clauses**: transferring a mortgaged property into a trust or entity after closing can technically trigger acceleration; in the US the Garn-St Germain Act protects certain transfers of residential property into a revocable trust, but investment property and entity transfers require lender consent. Third, **tax basis and estate planning**: borrowing does not change the asset’s basis, and debt on a property at death affects the estate’s net value and the heirs’ liquidity — a professional should coordinate the refinance with the estate plan.',
      ],
    },
  ],
  keyTerms: [
    { term: 'Interest reserve', definition: 'A portion of a construction loan set aside to pay interest during the build, so interest capitalizes into the loan.' },
    { term: 'Draw', definition: 'A disbursement under a construction loan against certified completed work.' },
    { term: 'Take-out loan', definition: 'The permanent loan that repays a construction or bridge loan once the property is stabilized.' },
    { term: 'Cash-out refinance', definition: 'A new loan larger than the existing balance; the difference is paid to the owner and is new debt.' },
    { term: 'Interest tracing', definition: 'US rule allocating interest deductibility by how loan proceeds are used (Treas. Reg. §1.163-8T).' },
    { term: 'Yield maintenance', definition: 'A prepayment penalty compensating the lender for lost interest to maturity.' },
    { term: 'Maturity risk', definition: 'The risk that a loan cannot be refinanced or repaid at maturity on acceptable terms.' },
    { term: 'Due-on-sale clause', definition: 'Mortgage provision allowing the lender to accelerate on transfer of the property, subject to statutory exceptions.' },
  ],
  knowledgeCheck: [
    { id: 'd7q1', prompt: 'Proceeds from a cash-out refinance are best described as:', options: ['Realized profit on the property', 'A tax-free return on investment', 'A new loan balance that must be serviced and repaid', 'Rental income received in advance'], answer: 2, explanation: 'Cash-out proceeds are borrowed money; the owner has a larger obligation and the gain remains embedded in the property.' },
    { id: 'd7q2', prompt: 'Why are refinancing proceeds generally not taxable income in the US?', options: ['Because real estate gains are never taxed', 'Because borrowing is not a realization event; the gain remains unrealized until sale', 'Because the IRS exempts mortgages', 'Because interest offsets the gain'], answer: 1, explanation: 'A borrower does not realize income by borrowing. The gain is deferred, not eliminated, and the loan must be repaid from eventual sale proceeds.' },
    { id: 'd7q3', prompt: 'A construction loan’s interest reserve runs out because the build took 8 months longer than planned. The most likely consequence:', options: ['The lender forgives the interest', 'Interest becomes a cash call on the sponsor or a default', 'The loan converts automatically to permanent', 'Nothing; interest stops accruing'], answer: 1, explanation: 'Once the reserve is exhausted, interest must be paid from the sponsor’s funds; failure to pay is a default.' },
    { id: 'd7q4', prompt: 'A 7-year balloon loan on a 25-year amortization leaves approximately what share of principal due at maturity?', options: ['About 15%', 'About 50%', 'About 85%', '0%'], answer: 2, explanation: 'Early amortization is slow; after 7 of 25 years roughly 85% of the original balance remains.' },
    { id: 'd7q5', prompt: 'The break-even horizon for a rate-and-term refinance is:', options: ['The loan term', 'Closing costs plus penalties ÷ monthly savings', 'The appraisal date', 'Always 5 years'], answer: 1, explanation: 'You must hold the new loan long enough for monthly savings to recover the upfront cost; sell sooner and the refinance lost money.' },
  ],
  misconception: {
    claim: '“Refinance to pull out your equity tax-free and you have made your money back.”',
    reality: 'You have borrowed against the equity. The cash is a loan with a repayment schedule; the property now carries more debt and a higher payment; the gain remains unrealized and will be taxed on sale (with the loan repaid from proceeds). Deferral is real; “tax-free profit” is not.',
    confidence: 'red',
  },
  references: [
    { title: 'OCC Comptroller’s Handbook — Commercial Real Estate Lending (construction lending, interest reserves, take-out)', jurisdiction: 'US', type: 'guidance', url: 'https://www.occ.gov/publications-and-resources/publications/comptrollers-handbook/' },
    { title: 'Treasury Regulation §1.163-8T — Allocation of interest expense among expenditures (interest tracing rules)', citation: '26 C.F.R. § 1.163-8T', jurisdiction: 'US', type: 'regulation' },
    { title: 'IRC §163(h) — qualified residence interest; acquisition indebtedness limits; home-equity interest treatment', citation: '26 U.S.C. § 163(h)', jurisdiction: 'US', type: 'statute' },
    { title: 'IRS Publication 936 — Home Mortgage Interest Deduction', jurisdiction: 'US', type: 'publication', url: 'https://www.irs.gov/publications/p936' },
    { title: 'Garn-St Germain Depository Institutions Act — due-on-sale clause exceptions', citation: '12 U.S.C. § 1701j-3', jurisdiction: 'US', type: 'statute' },
    { title: 'Federal Reserve — Financial Stability Report (commercial real estate maturities and refinancing risk)', jurisdiction: 'US', type: 'research', url: 'https://www.federalreserve.gov/publications/financial-stability-report.htm' },
    { title: 'CFPB — Loan Estimate and Closing Disclosure (TRID) for refinance closing costs', jurisdiction: 'US', type: 'guidance' },
    { title: 'Dubai Law No. 14 of 2008 concerning Mortgages in the Emirate of Dubai; Dubai Land Department mortgage registration fees', jurisdiction: 'UAE', type: 'statute', note: 'Phrased generally; verify fee schedule.' },
    { title: 'OHADA Uniform Act on Secured Transactions — hypothèques (mortgages) and registration', jurisdiction: 'OHADA / CEMAC', type: 'statute' },
  ],
  jurisdictionNotes: {
    US: { verified: true, notes: ['Refinance proceeds are not income; interest deductibility follows tracing rules and, for residences, §163(h) limits.', 'Due-on-sale clauses enforceable with Garn-St Germain exceptions for certain residential transfers.', 'Mortgage recording taxes in some states (e.g. New York, Florida) materially increase refinance costs.'] },
    UAE: { verified: false, notes: ['Mortgages registered with the emirate land department with a registration fee on the mortgage amount; Central Bank caps LTV and limits certain equity-release lending.', 'Early settlement fees on mortgages are capped by Central Bank regulation — verify current cap.', 'No personal income tax; Corporate Tax may apply to property held in a taxable entity.'] },
    CEMAC: { verified: false, notes: ['Mortgage registration (hypothèque conventionnelle) at the conservation foncière with notarial formalities and registration duties; enforcement procedures under OHADA.', 'Long-dated residential mortgage markets are thin; refinancing as a product is uncommon.'] },
    UK: { verified: false, notes: ['Remortgaging is a mature market; stamp duty is not charged on refinance but early-repayment charges are common.', 'Content for this jurisdiction is in preparation.'] },
  },
};
export default lesson;
