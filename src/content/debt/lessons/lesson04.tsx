import type { DebtLesson } from '../types';
import { LeverageCompare } from './visuals/interactives';

const lesson: DebtLesson = {
  id: 'debt-04',
  number: 4,
  slug: 'strategic-leverage',
  title: 'Strategic Financial Leverage',
  subtitle: 'How borrowed capital multiplies the return on equity — in both directions — and the one spread that decides which way.',
  hook: 'Leverage does not create return. It concentrates whatever return the asset produces onto a smaller slice of equity, and it does the same to losses.',
  duration: '35 min',
  objectives: ['asset-protection', 'tax-planning', 'governance'],
  sections: [
    {
      id: 'identity',
      heading: 'Assets, debt, equity and return: the accounting identity',
      body: [
        'Assets equal liabilities plus equity. For a single investment that reads: asset value = loan balance + equity. The identity is static; the interesting part is what happens when the asset moves. If a $1,000,000 property is financed with $700,000 of debt and $300,000 of equity and its value rises 10% to $1,100,000, the loan balance has not changed, so equity has risen from $300,000 to $400,000 — a 33% gain on a 10% move. If the value falls 10%, equity falls to $200,000: a 33% loss. The multiplier is price ÷ equity, here 3.33×.',
        'That multiplier is the whole of leverage in one number. It is why a 70% LTV investor can earn equity returns in the high teens from an asset appreciating at mid-single digits, and why a 30% decline in value wipes that investor out entirely while a cash buyer has lost 30%. Nothing about the asset changed; the capital structure changed who absorbs the first dollar of movement.',
        'The *return on assets* is the property’s own performance: net operating income plus appreciation, divided by price. The *return on equity* is what the owner experiences after paying the lender. The relationship between them runs through one spread.',
      ],
    },
    {
      id: 'spread',
      heading: 'Positive and negative leverage: the spread that decides',
      body: [
        'Leverage is **positive** when the asset’s unlevered yield exceeds the cost of debt, and **negative** when it does not. If a property yields 5.4% on price (NOI ÷ price) and the loan costs 6.5%, every borrowed dollar costs more than it earns from operations; the owner is subsidizing the lender out of their own equity and betting on appreciation to make up the gap. If the loan costs 4.5%, each borrowed dollar earns 90 basis points of spread that accrues entirely to equity.',
        'Formally: return on equity ≈ asset yield + (asset yield − cost of debt) × (debt ÷ equity). With a 5.4% asset yield, 4.5% debt and 2.33× debt-to-equity, equity earns roughly 5.4% + 0.9% × 2.33 ≈ 7.5% from operations alone, before appreciation. Swap the debt cost to 6.5% and the same formula gives 5.4% − 1.1% × 2.33 ≈ 2.8%. Appreciation is then layered on top, also multiplied.',
        'The 2010s trained a generation of investors to treat negative leverage on current yield as acceptable because appreciation was reliable and refinancing was cheap. When rates rose faster than rents, the arithmetic reversed: DSCRs fell below 1.0×, cash-out refinances turned into cash-in refinances, and the multiplier worked in the other direction. The interactive below lets you move appreciation and the cost of debt and watch the leveraged case cross from outperformance to underperformance.',
      ],
      Interactive: LeverageCompare,
    },
    {
      id: 'ratios',
      heading: 'Leverage ratios and what each one measures',
      body: [
        'Three ratios express the same capital structure from three angles. **Loan-to-value** (debt ÷ asset value) is the lender’s view of its cushion. **Debt-to-equity** (debt ÷ equity) is the owner’s view of how many dollars of other people’s money sit on each dollar of their own; it is also the multiplier in the formula above. **Equity multiple** or **leverage factor** (asset ÷ equity) is the direct amplification of asset returns into equity returns. 70% LTV, 2.33× D/E and 3.33× leverage factor describe the same deal.',
        'Businesses use debt-to-EBITDA (how many years of earnings to repay debt) and debt-to-capital; property lenders add debt yield (NOI ÷ loan). Lesson 05 covers the full set. What matters here is that the ratios move as values move: a 70% LTV loan becomes 78% LTV after a 10% price decline without the borrower doing anything, and covenant tests based on LTV can breach in a market downturn with every payment made on time.',
      ],
    },
    {
      id: 'components',
      heading: 'Three sources of equity return: income, amortization, appreciation',
      body: [
        'Equity in a leveraged asset grows three ways. **Cash yield** is what is left after operating expenses and debt service, measured as cash-on-cash. **Amortization** is the principal portion of each payment — the tenant, in effect, buying the building for the owner one month at a time; in year one of a 30-year 6.5% loan it is about 1.1% of the original principal, rising every year. **Appreciation** is the change in asset value, the most volatile component and the one most people mean when they say “leverage works”.',
        'Separating them changes how you underwrite. A deal that only works if appreciation materializes is a speculation financed with debt. A deal whose cash yield and amortization alone justify the equity, with appreciation as upside, is an investment. Both can be legitimate; only one survives a flat decade. Lenders know this distinction well, which is why DSCR — a measure of operating cash flow alone — is their primary covenant.',
      ],
    },
    {
      id: 'strategic',
      heading: 'Strategic leverage versus speculative leverage',
      body: [
        'Strategic leverage has four properties. It is **secured by a productive asset** whose cash flows exist independently of market prices. It is **sized so that operating cash flow covers debt service with a cushion** across plausible downside scenarios, not just the base case. Its **term and rate structure match the asset’s life and the owner’s plan**, with fixed rates or hedges where a rate shock would break coverage. And it sits inside a **structure where failure is contained** — the loan can go wrong without pulling down unrelated family assets through guarantees and cross-collateral (Lesson 09).',
        'Speculative leverage violates at least one of these: it depends on price appreciation, has thin or negative coverage, finances a long-lived asset with short money, or is guaranteed by everything the family owns. Many famous fortunes were built with speculative leverage; so were most famous bankruptcies. The difference between the two lists is survivorship, not skill.',
        'The platform’s rule is explicit: this studio never auto-recommends the most leveraged scenario. Every tool here shows the all-cash alternative and the downside case next to the leveraged one, because the question is never “how much can I borrow” but “how much can I carry when the plan is wrong”.',
      ],
      callouts: [{ tone: 'danger', title: 'Leverage is not a tax strategy', body: 'Interest may be deductible against the income the asset produces, subject to limits that vary by jurisdiction and taxpayer (Lesson 05, Jurisdictions). That reduces the after-tax cost of debt; it does not make borrowing free, and it does not eliminate tax on the asset’s income or gain. Never size debt for the deduction.' }],
    },
    {
      id: 'practice',
      heading: 'How practitioners size leverage',
      body: [
        'Start from coverage, not from the maximum the lender will advance. Decide the minimum DSCR you are willing to live with under a stressed case — rents down 10–15%, vacancy up, rate at the cap or 300 basis points higher — and back into the loan amount that preserves it. Then check LTV: if the stressed-coverage loan is well below what the lender offers, you have found your cushion; if it is above, the lender is more conservative than you and the deal may not be a leverage candidate at all.',
        'Second, decide what you will do at maturity. A balloon in seven years assumes a refinancing market exists then; a plan to sell assumes a buyer. Write down the assumption and the fallback. Third, decide how the loan will be isolated: which entity borrows, who guarantees, what collateral is pledged, and what is explicitly excluded. Fourth, record the whole analysis — assumptions, formulas, downside — so that the next generation can see why the decision was made. The Leverage Calculator and Stress Test tools are built to produce that record.',
      ],
    },
  ],
  keyTerms: [
    { term: 'Leverage factor', definition: 'Asset value ÷ equity; the multiplier that converts asset returns into equity returns.' },
    { term: 'Positive leverage', definition: 'Borrowing at a cost below the asset’s unlevered yield, so the spread accrues to equity.' },
    { term: 'Negative leverage', definition: 'Borrowing at a cost above the asset’s yield; equity subsidizes the lender and depends on appreciation.' },
    { term: 'Return on equity (levered)', definition: 'Asset yield + (asset yield − cost of debt) × debt/equity, before appreciation.' },
    { term: 'Cash-on-cash', definition: 'Annual pre-tax cash flow after debt service ÷ equity invested.' },
    { term: 'Amortization (as return)', definition: 'Principal repaid from operating cash flow, which increases owner equity without a change in value.' },
    { term: 'Unlevered yield', definition: 'NOI ÷ purchase price (cap rate): the asset’s return independent of financing.' },
  ],
  knowledgeCheck: [
    { id: 'd4q1', prompt: 'A $1,000,000 asset financed 70% with debt falls 10% in value. The owner’s equity:', options: ['Falls 10%', 'Falls about 33%', 'Falls 70%', 'Is unchanged because the loan balance is unchanged'], answer: 1, explanation: 'Equity goes from $300,000 to $200,000 — a one-third loss — because the fixed loan balance absorbs none of the decline.' },
    { id: 'd4q2', prompt: 'Leverage is “negative” when:', options: ['The property is losing money', 'The cost of debt exceeds the asset’s unlevered yield', 'LTV exceeds 50%', 'The loan is interest-only'], answer: 1, explanation: 'Negative leverage means each borrowed dollar costs more than it earns from operations; equity returns from operations fall below the unlevered yield.' },
    { id: 'd4q3', prompt: 'With a 6% asset yield, 4% debt cost and debt/equity of 2.0×, the approximate operating return on equity is:', options: ['6%', '8%', '10%', '4%'], answer: 2, explanation: '6% + (6% − 4%) × 2.0 = 10%, before appreciation.' },
    { id: 'd4q4', prompt: 'Which source of equity return is the most reliable in a flat market?', options: ['Appreciation', 'Amortization from operating cash flow', 'Refinancing proceeds', 'Rate cuts'], answer: 1, explanation: 'Principal repaid from NOI builds equity regardless of price movement; appreciation and refinancing depend on markets.' },
    { id: 'd4q5', prompt: 'A practitioner sizing a loan “from coverage” means:', options: ['Borrowing the maximum the lender offers', 'Backing into the loan amount that keeps DSCR acceptable under a stressed case', 'Choosing the longest amortization available', 'Borrowing only what interest is deductible'], answer: 1, explanation: 'Coverage-first sizing starts from the stressed debt-service capacity and derives the loan, rather than starting from the maximum advance.' },
  ],
  misconception: {
    claim: '“Always use maximum leverage; the bank’s money is cheaper than yours.”',
    reality: 'Cheaper only when the asset yield exceeds the debt cost and only while coverage holds. Maximum leverage maximizes the multiplier on losses, the probability of covenant breach and the refinancing risk at maturity. This platform never recommends the most leveraged scenario by default.',
    confidence: 'red',
  },
  references: [
    { title: 'OCC Comptroller’s Handbook — Commercial Real Estate Lending (underwriting: LTV, DSCR, debt yield, stress testing)', jurisdiction: 'US', type: 'guidance', url: 'https://www.occ.gov/publications-and-resources/publications/comptrollers-handbook/' },
    { title: 'Interagency Guidance on Concentrations in Commercial Real Estate Lending, Sound Risk Management Practices (2006) and Interagency Statement on Prudent Risk Management for CRE Lending (2015)', jurisdiction: 'US', type: 'guidance' },
    { title: 'Federal Reserve — Financial Stability Report (commercial real estate and leverage sections)', jurisdiction: 'US', type: 'research', url: 'https://www.federalreserve.gov/publications/financial-stability-report.htm' },
    { title: 'IRC §163 — deductibility of interest; §163(d) investment interest; §163(j) business interest limitation', citation: '26 U.S.C. § 163', jurisdiction: 'US', type: 'statute' },
    { title: 'Central Bank of the UAE — mortgage LTV regulations; Financial Stability Report (real estate exposure)', jurisdiction: 'UAE', type: 'regulation', note: 'Phrased generally.' },
    { title: 'COBAC — prudential norms on risk division and large exposures', jurisdiction: 'CEMAC', type: 'regulation', note: 'Phrased generally.' },
  ],
  jurisdictionNotes: {
    US: { verified: true, notes: ['Interest on investment property debt is generally deductible against rental income; §163(j) limits apply to larger businesses with an electing real property trade or business exception.', 'Supervisory guidance expects lenders to stress-test CRE loans for rate and value shocks; borrowers should do the same.'] },
    UAE: { verified: false, notes: ['Mortgage LTV caps by borrower category; no personal income tax, but Corporate Tax (from 2023) applies interest deduction limits to taxable persons — see Jurisdictions.', 'Rental yields and financing costs in AED track USD rates given the peg.'] },
    CEMAC: { verified: false, notes: ['Bank financing of real estate is short-dated and expensive relative to yields, making positive leverage harder to achieve; many purchases are equity-funded.', 'Interest deductibility for companies subject to Cameroon General Tax Code limits on shareholder loans — verify.'] },
    UK: { verified: false, notes: ['Mortgage interest relief for individual landlords restricted to a basic-rate tax credit; corporate landlords deduct interest subject to the corporate interest restriction.', 'Content for this jurisdiction is in preparation.'] },
  },
};
export default lesson;
