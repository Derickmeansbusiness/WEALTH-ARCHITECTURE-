import type { DebtLesson } from '../types';
import { RatioCards } from './visuals/interactives';

const lesson: DebtLesson = {
  id: 'debt-05',
  number: 5,
  slug: 'ratios-and-bankability',
  title: 'Financial Ratios & Bankability',
  subtitle: 'LTV, DTI, DSCR, debt yield and the rest: the ten numbers a credit committee computes before it reads a word of your memo.',
  hook: 'A credit committee does not ask whether the deal is good. It asks whether the numbers clear policy, and then whether the story explains the numbers.',
  duration: '35 min',
  objectives: ['governance', 'asset-protection'],
  sections: [
    {
      id: 'why',
      heading: 'Why lenders think in ratios',
      body: [
        'A bank lending at 6.5% cannot afford to be wrong often. If one loan in fifty defaults with a 40% loss, that single loss consumes the year’s margin on the other forty-nine. So lenders standardize: every request is converted into a handful of ratios that can be compared across borrowers, tracked over time and written into policy. The ratios are not the decision; they are the filter. A request that fails policy ratios rarely reaches the committee; one that passes is then argued on its merits.',
        'For the borrower, this has a practical implication. Bankability is not charisma or a good story. It is the state of having ratios that clear the lender’s filter *with documentation that proves them*. Tax returns that show the income, financial statements that tie to the bank account, rent rolls that match leases, appraisals that support the value. The story only matters once the numbers have let it in the door.',
        'Three underwriting worlds use overlapping but distinct sets. **Individuals** are judged mainly on DTI and credit history. **Businesses** are judged on leverage (debt-to-EBITDA, debt-to-equity), interest and fixed-charge coverage, and free cash flow. **Properties** are judged on LTV, DSCR and debt yield. A family office that borrows in all three worlds should be able to speak all three dialects.',
      ],
    },
    {
      id: 'cards',
      heading: 'The ten ratios, with formulas and worked examples',
      body: [
        'Each card below defines a ratio, shows its formula and computes a worked example on the studio’s reference property — $1,000,000 price, $700,000 loan at 6.5% over 30 years, $84,000 gross rent, $30,000 expenses — using the same finance library the calculators use. Filter by who uses it. Read the caution on each card: thresholds are quoted as ranges lenders *commonly reference*, because actual policy varies by institution, asset class, market and cycle, and no number here should be treated as a universal rule.',
      ],
      Interactive: RatioCards,
    },
    {
      id: 'individual',
      heading: 'Individual underwriting: DTI and the ability to repay',
      body: [
        'For consumer credit the central ratio is **debt-to-income**: total monthly debt payments (including the proposed loan) divided by gross monthly income. US mortgage lenders distinguish a “front-end” ratio (housing payment alone) from a “back-end” ratio (all debts). Under the CFPB’s Ability-to-Repay rule the lender must make a reasonable, good-faith determination that the borrower can repay, considering income, assets, debts and DTI among other factors; the specific DTI cap that once defined a “qualified mortgage” has been replaced by a price-based test, so quoted thresholds like 43% are history rather than law.',
        'What underwriters actually scrutinize is **income documentation**: W-2s, pay stubs, two years of tax returns for the self-employed, with add-backs for depreciation and one-time items and deductions for declining trends. For investors, net rental income from Schedule E is counted with vacancy haircuts; proposed rent on a new purchase is typically counted at a discount. Case A in this studio follows a salaried professional whose DTI, not their down payment, is the binding constraint on the first investment property.',
        'In the UAE, the Central Bank historically set a maximum debt-burden ratio for consumer lending (the share of income going to all instalments) and limits on loan multiples of salary; in Cameroon, banks apply internal salary-assignment limits (quotité cessible) rooted in labor law protections. These are flagged as unverified pending review.',
      ],
    },
    {
      id: 'business',
      heading: 'Business underwriting: leverage, coverage and cash flow',
      body: [
        'For an operating company the primary leverage measure is **total debt ÷ EBITDA** — how many years of earnings it would take to repay all debt — alongside **debt-to-equity** from the balance sheet. Coverage is measured as **interest coverage** (EBIT ÷ interest) and, more strictly, **fixed-charge coverage** (EBITDA − capex − taxes − distributions, divided by principal + interest + leases). Lenders write these into covenants with step-downs over time, tested quarterly against reviewed or audited financials.',
        '**Free cash flow** — operating cash flow less capital expenditures — is the honest number. EBITDA can be adjusted; cash cannot. A lender who sees EBITDA of $500,000 and free cash flow of $120,000 will underwrite the $120,000. Seasonal businesses are underwritten on trailing-twelve-month figures with a peak-borrowing analysis; growing businesses get credit for growth only when it has shown up in two or three years of statements.',
        'The practical lesson for a family operating company: keep the financial statements clean enough to survive a field exam, reinvest enough to show retained equity, avoid running personal expenses through the business (every add-back the lender has to make is a credibility cost), and maintain covenant headroom of at least 20–25% so that one bad quarter does not trigger a default. Those are observations from practice, not rules of law.',
      ],
    },
    {
      id: 'property',
      heading: 'Property underwriting: LTV, DSCR and debt yield together',
      body: [
        'Commercial real estate lenders size loans as the **minimum** of three tests. The LTV test caps the loan at a percentage of appraised value. The DSCR test caps it at the amount whose debt service the property’s NOI can cover with a cushion. The **debt-yield** test — NOI ÷ loan — caps it at the amount on which the lender would earn an acceptable return if it owned the asset tomorrow. In a low-rate environment the DSCR test is loose (cheap debt is easy to cover) and the debt-yield test becomes the binding constraint, which is exactly why lenders adopted it after 2008.',
        'On the reference property: NOI $54,000. At 70% LTV the loan is $700,000 and debt service about $53,100, so DSCR is roughly 1.02× — far below the 1.20–1.35× range lenders commonly reference — and debt yield is 7.7%. This property, at this price and rate, is not bankable at 70% LTV on its own cash flow. The loan that clears a 1.25× DSCR is roughly $570,000 (57% LTV). The gap between what the borrower wants and what the cash flow supports is the whole conversation, and it is a conversation most first-time investors have never had before the term sheet arrives.',
        'Lenders also underwrite their own NOI: they insert a vacancy allowance, a management fee and replacement reserves even when the owner self-manages and pays none, and they mark rent to market when a lease is above it. Expect the lender’s NOI to be 5–15% below yours.',
      ],
      callouts: [{ tone: 'amber', title: 'Never imply universal thresholds', body: 'Everything above describes ranges lenders commonly reference. Policies vary by institution, asset class, market, cycle and regulatory posture; agency, bank, debt-fund and insurance lenders can disagree by ten points of LTV on the same asset in the same month.' }],
    },
    {
      id: 'becoming-bankable',
      heading: 'Becoming bankable: a checklist from the other side of the desk',
      body: [
        'Keep **two to three years of clean financials** for every entity, prepared consistently, with a reconciliation to tax returns; discrepancies are the first thing a credit analyst finds. Keep a **current personal financial statement** with documented asset values and a schedule of contingent liabilities (every guarantee you have signed). Maintain **liquidity after closing** — most lenders want to see post-closing reserves of several months of debt service. Document **collateral title and value**: deeds, appraisals, insurance, leases, rent rolls, environmental reports where relevant.',
        'Then present the request in the lender’s language: purpose, amount, term, source of repayment, secondary source, collateral, guarantees, and the ratios — computed by you, before they compute them. Nothing says “bankable” like a borrower who arrives with a DSCR analysis that matches the bank’s own. The Credit Profile tool in this studio builds exactly that presentation.',
      ],
    },
  ],
  keyTerms: [
    { term: 'DTI', definition: 'Debt-to-income: monthly debt payments ÷ gross monthly income; the primary consumer capacity ratio.' },
    { term: 'DSCR', definition: 'Debt service coverage ratio: NOI ÷ annual principal and interest.' },
    { term: 'Debt yield', definition: 'NOI ÷ loan amount; a lender’s return if it owned the collateral, independent of rates.' },
    { term: 'Debt ÷ EBITDA', definition: 'Years of earnings needed to repay all debt; the standard corporate leverage covenant.' },
    { term: 'Fixed-charge coverage', definition: 'Cash available after capex, taxes and distributions ÷ all fixed obligations (P&I, leases).' },
    { term: 'Free cash flow', definition: 'Operating cash flow − capital expenditures.' },
    { term: 'Lender NOI', definition: 'The lender’s underwritten NOI after inserting vacancy, management and reserves; usually below the owner’s.' },
    { term: 'Covenant headroom', definition: 'The margin between actual ratios and covenant thresholds; the buffer before a technical default.' },
  ],
  knowledgeCheck: [
    { id: 'd5q1', prompt: 'DSCR is defined as:', options: ['Loan ÷ value', 'NOI ÷ annual debt service', 'Debt service ÷ NOI', 'EBIT ÷ interest'], answer: 1, explanation: 'DSCR measures how many times operating income covers principal and interest for the year.' },
    { id: 'd5q2', prompt: 'A property with NOI of $54,000 and a $700,000 loan has a debt yield of approximately:', options: ['5.4%', '7.7%', '12.9%', '70%'], answer: 1, explanation: '$54,000 ÷ $700,000 ≈ 7.7%.' },
    { id: 'd5q3', prompt: 'Why did lenders adopt debt yield as a sizing test after 2008?', options: ['Because it rises when rates fall', 'Because DSCR becomes a loose constraint when debt is cheap, inflating loan sizes', 'Because appraisals became unavailable', 'Because regulators banned LTV'], answer: 1, explanation: 'Debt yield ignores the interest rate and amortization, so it caps leverage even when cheap debt makes coverage look comfortable.' },
    { id: 'd5q4', prompt: 'Which statement about underwriting thresholds is correct?', options: ['All lenders require DSCR ≥ 1.25×', 'A 43% DTI is a legal maximum for all US mortgages', 'Lenders commonly reference ranges, but policies vary by institution, asset class and market', 'LTV above 80% is illegal'], answer: 2, explanation: 'Thresholds are policy, not law, and vary widely; the platform never implies universal rules.' },
    { id: 'd5q5', prompt: 'A business reports EBITDA of $500,000 and free cash flow of $120,000. A prudent lender will size debt service capacity primarily on:', options: ['EBITDA', 'Free cash flow', 'Gross revenue', 'Owner’s salary'], answer: 1, explanation: 'Free cash flow reflects what is actually available after reinvestment; EBITDA ignores capex and is subject to adjustment.' },
  ],
  misconception: {
    claim: '“If the bank approves the loan, the deal is safe — they did the underwriting.”',
    reality: 'The bank underwrote its own risk, which is senior and collateralized. Your equity sits beneath the loan and absorbs the first loss. A loan that clears the lender’s LTV can still leave you with a 1.0× DSCR and no margin for a vacancy; underwrite your equity yourself.',
    confidence: 'red',
  },
  references: [
    { title: 'CFPB — Ability-to-Repay / Qualified Mortgage rule, Regulation Z §1026.43', citation: '12 C.F.R. § 1026.43', jurisdiction: 'US', type: 'regulation', url: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/43/' },
    { title: 'OCC Comptroller’s Handbook — Commercial Real Estate Lending; Commercial Loans; Rating Credit Risk', jurisdiction: 'US', type: 'guidance', url: 'https://www.occ.gov/publications-and-resources/publications/comptrollers-handbook/' },
    { title: 'Interagency Guidelines for Real Estate Lending Policies (supervisory LTV limits by property type)', citation: '12 C.F.R. Part 34, Subpart D, Appendix A (OCC); parallel FDIC/Fed rules', jurisdiction: 'US', type: 'regulation' },
    { title: 'Federal Reserve — Commercial Bank Examination Manual (credit analysis sections)', jurisdiction: 'US', type: 'guidance' },
    { title: 'SBA — 7(a) lender underwriting requirements (cash-flow coverage, equity injection) in SOP 50 10', jurisdiction: 'US', type: 'guidance', note: 'Phrased generally.' },
    { title: 'Central Bank of the UAE — consumer lending regulation (debt-burden ratio) and mortgage regulations', jurisdiction: 'UAE', type: 'regulation', note: 'Phrased generally; verify current limits.' },
    { title: 'COBAC — prudential regulations on credit classification, provisioning and risk division', jurisdiction: 'CEMAC', type: 'regulation', note: 'Phrased generally.' },
  ],
  jurisdictionNotes: {
    US: { verified: true, notes: ['Supervisory LTV limits for real estate lending exist as guidelines with exceptions tracked by banks; DSCR and debt-yield policies are institutional.', 'ATR/QM rule replaced the fixed 43% DTI QM test with a price-based definition (2021).', 'Fannie Mae/Freddie Mac automated underwriting apply their own DTI and reserve requirements for conforming loans.'] },
    UAE: { verified: false, notes: ['Central Bank consumer-lending rules historically cap the debt-burden ratio for individuals; verify the current percentage.', 'Commercial real estate underwriting by UAE banks uses DSCR and LTV conventions similar to international practice.'] },
    CEMAC: { verified: false, notes: ['Salary-assignment limits restrict how much of an employee’s wages can be committed to loan repayment (quotité cessible) — verify under Cameroon labor law.', 'COBAC norms limit single-borrower and related-party exposures as a share of bank capital.'] },
    UK: { verified: false, notes: ['FCA MCOB affordability rules and the PRA’s loan-to-income flow limit shape residential underwriting.', 'Content for this jurisdiction is in preparation.'] },
  },
};
export default lesson;
