import type { DebtLesson } from '../types';
import { FinancingMarketplace } from './visuals/interactives';

const lesson: DebtLesson = {
  id: 'debt-03',
  number: 3,
  slug: 'financing-marketplace',
  title: 'The Financing Marketplace',
  subtitle: 'Fifteen ways to borrow, who sells each one, what it costs, what it takes as collateral and how it goes wrong.',
  hook: 'There is no such thing as “a loan”. There are instruments, each built for a cash-flow shape. Mismatching the instrument to the shape is the most common financing mistake we see.',
  duration: '35 min',
  objectives: ['asset-protection', 'governance', 'tax-planning'],
  sections: [
    {
      id: 'map',
      heading: 'Match the instrument to the cash-flow shape',
      body: [
        'Think of every financing need as a shape: how much, for how long, repaid from what. A machine that will produce revenue for seven years should be financed over something like seven years, not on a credit card and not on a 25-year mortgage. Receivables that turn every 45 days should be financed by a facility that turns with them. A building that will stand for fifty years can carry long-dated, amortizing debt. When the term of the money is shorter than the life of the asset you have refinancing risk; when it is longer, you are paying interest on something that no longer produces.',
        'The second axis is **repayment source**. Self-liquidating credit (invoice finance, trade finance, inventory lines) is repaid when the financed asset converts to cash. Cash-flow credit (term loans, mezzanine, acquisition finance) is repaid from the earnings of the whole business. Asset-based credit (mortgages, equipment finance, securities-backed lines) looks first to the pledged asset. Lenders price and structure differently along this axis, and a borrower who understands which bucket a request falls into negotiates from the lender’s own vocabulary.',
        'The card grid below is the marketplace. Filter by category, open a card, and read the five things an underwriter would tell you about that product in the first meeting: what it is for, roughly what it costs, what it takes as security, how it is repaid, and what kills borrowers who use it badly.',
      ],
      Interactive: FinancingMarketplace,
    },
    {
      id: 'property',
      heading: 'Personal and property credit',
      body: [
        '**Mortgages** are the anchor of household and family real-estate leverage because they are long, amortizing, and priced off a deep secondary market — in the US, the agency market (Fannie Mae, Freddie Mac, Ginnie Mae) makes 30-year fixed-rate loans available in a way few other countries replicate. Investor mortgages cost more and require more equity; **DSCR loans** underwrite the property’s rent rather than the borrower’s tax returns, which suits portfolio investors but prices accordingly. In the UAE, residential mortgages are subject to Central Bank LTV caps that differ for nationals and expatriates and for first and subsequent properties; Islamic banks offer Murabaha and Ijara structures with economically similar payment streams.',
        '**Revolving consumer credit** is the opposite shape: unsecured, callable, expensive when revolved, and nearly free when cleared monthly. Its proper use in a wealth plan is convenience and history-building, never funding. **Overdrafts** — repayable on demand — are widespread in the UK, UAE and CEMAC for small businesses, and dangerous for the same reason: a permanent working-capital need financed by money the bank can withdraw with a letter.',
      ],
    },
    {
      id: 'business',
      heading: 'Business operating credit',
      body: [
        '**Term loans** fund a defined purchase or project and amortize over three to ten years. In the US the SBA 7(a) and 504 programs guarantee part of the lender’s exposure, which widens access for firms that would otherwise be declined; in exchange, the owner guarantees personally and accepts program rules. **Lines of credit** fund the gap between paying suppliers and collecting from customers; they revolve, usually float, and are renewed annually at the lender’s discretion. **Trade credit** from suppliers (net 30, 2/10 net 30) is the largest source of short-term business credit in most economies and the cheapest if the discount is taken, the most expensive if it is not — forgoing 2% to pay 20 days later is an annualized cost above 35%.',
        'The underwriting for operating credit lives in the cash-conversion cycle: days of inventory plus days of receivables minus days of payables. A business that collects slowly, holds inventory long and pays suppliers fast needs a lot of working capital, and lenders will size a borrowing base against eligible receivables (often an advance rate around 70–85% of those under 90 days) and inventory (lower advance rates, more haircuts). Those are illustrative structures, not promises.',
      ],
    },
    {
      id: 'asset-backed',
      heading: 'Asset-backed instruments',
      body: [
        '**Equipment financing and leasing** tie the money to the machine. Lenders take a purchase-money security interest; lessors retain title. The term should match the asset’s productive life and the residual value assumption is where leases hide their cost. **Invoice financing and factoring** convert receivables to cash: in financing, you borrow against them; in factoring, you sell them, with or without recourse. Both are priced per 30 days and annualize to high rates, which is acceptable for short gaps and ruinous as a permanent structure.',
        '**Trade finance** — letters of credit, documentary collections, supply-chain finance — is the plumbing of import-export businesses and especially important in the CEMAC region, where a confirmed letter of credit from an international bank substitutes the bank’s credit for the importer’s. **Asset-based lending** scales the line-of-credit idea to larger firms with field exams, lockboxes and weekly borrowing-base certificates.',
        '**Securities-backed lines** and **life-insurance policy loans** are the family balance sheet’s liquidity tools. A securities-backed line lets a portfolio stay invested while the family borrows against it — useful for taxes, a purchase, or bridging a sale — but it is callable, carries margin-call risk, and is not a device for eliminating tax: the embedded gain remains in the portfolio and is realized when the securities are eventually sold or, in some cases, on death with basis adjustments that are jurisdiction-specific. Policy loans borrow against cash value; the risk is a lapse with a large outstanding loan, which can crystallize taxable income.',
      ],
      callouts: [{ tone: 'amber', title: 'The “buy, borrow, die” claim', body: 'Borrowing against appreciated assets defers tax; it does not eliminate it. Interest is a real cost, margin calls are a real risk, and the tax outcome at death depends on the jurisdiction’s basis rules and estate tax. Treat this as a liquidity tool with tax consequences, not a tax strategy — and see the Claim Checker for the full green/amber/red treatment.' }],
    },
    {
      id: 'growth',
      heading: 'Growth and transaction finance',
      body: [
        '**Private credit** has grown into a major source of mid-market lending as banks retreated from leveraged loans. It is faster and more flexible than a bank, and priced for it: floating rates with floors, upfront fees, sometimes PIK interest. Documentation ranges from tight covenants to “covenant-lite” with generous EBITDA add-backs — flexibility that borrowers like until the business underperforms and the lender’s remedies turn out to be severe.',
        '**Seller financing** appears whenever bank credit is thin: SME transfers, land sales in emerging markets, intra-family business succession. The seller carries a note, usually subordinated to a senior lender, often with a share pledge. It aligns incentives (the seller wants the business to survive) and creates disputes (set-off claims when the buyer discovers problems). **Mezzanine** fills the gap between senior debt and equity in buy-outs and developments with second liens, intercreditor agreements and warrants. **Acquisition finance** repays itself from the target’s cash flows and is sized as a multiple of EBITDA; the classic failure is setting that multiple on peak earnings.',
        'In the family-wealth context the point is not to use these instruments but to recognize them. When a family company is offered a unitranche from a credit fund, or a buyer proposes a seller note for the family business, the terms will be drafted by people who use these structures every day. Understanding the vocabulary — intercreditor, PIK, cash sweep, change-of-control, springing recourse — is the minimum equipment for the conversation.',
      ],
    },
    {
      id: 'choosing',
      heading: 'Choosing well: six questions before signing',
      body: [
        'First, does the term match the asset’s life? Second, what is the all-in cost including fees, computed over the period you actually expect to hold the debt? Third, what is the lender’s second way out — what collateral and guarantees have you given, and what cross-default or cross-collateral language links this facility to others? Fourth, what covenants will you have to report against, and would a 20% revenue decline breach them? Fifth, who is the lender, and what happens at renewal or maturity if they exit this market? Sixth, what tax questions does the interest raise — deductibility limits (Lesson 05 and the Jurisdictions page), withholding on cross-border interest, documentation requirements for related-party debt?',
        'None of these has a universal right answer, and the most leveraged option is never the default choice. The Decision Simulator in this studio runs these questions against a scenario; the Financing Map shows how the chosen instruments sit on the family’s structure.',
      ],
    },
  ],
  keyTerms: [
    { term: 'Self-liquidating credit', definition: 'Financing repaid when the financed asset (receivable, inventory, shipment) converts to cash.' },
    { term: 'Borrowing base', definition: 'The collateral value against which a revolving facility can be drawn, usually eligible receivables and inventory at stated advance rates.' },
    { term: 'DSCR loan', definition: 'An investor mortgage underwritten on the property’s rental coverage rather than the borrower’s personal income.' },
    { term: 'Letter of credit', definition: 'A bank’s undertaking to pay a seller on presentation of conforming documents, substituting the bank’s credit for the buyer’s.' },
    { term: 'Factoring', definition: 'Sale of receivables to a factor at a discount, with or without recourse for debtor non-payment.' },
    { term: 'Unitranche', definition: 'A single private-credit facility blending senior and subordinated pricing into one tranche.' },
    { term: 'Intercreditor agreement', definition: 'Contract among lenders of different ranks fixing payment priority, enforcement rights and standstills.' },
    { term: 'Cash-conversion cycle', definition: 'Days inventory + days receivable − days payable; the working-capital need an operating line must fund.' },
  ],
  knowledgeCheck: [
    { id: 'd3q1', prompt: 'A manufacturer wants to finance a machine with a seven-year productive life. The best-matched instrument is:', options: ['A credit card balance', 'A 25-year mortgage on the owner’s home', 'Equipment financing amortizing over roughly the machine’s life', 'A 90-day overdraft'], answer: 2, explanation: 'Matching the financing term to the asset’s life avoids both refinancing risk and paying for an asset after it stops producing.' },
    { id: 'd3q2', prompt: 'Forgoing a 2/10 net 30 supplier discount to pay on day 30 costs roughly, annualized:', options: ['2%', 'About 12%', 'Above 35%', 'Nothing; it is free credit'], answer: 2, explanation: '2% for 20 extra days ≈ 2/98 × 365/20 ≈ 37% per year — among the most expensive credit a business routinely uses.' },
    { id: 'd3q3', prompt: 'A securities-backed line of credit used instead of selling appreciated stock:', options: ['Eliminates the capital-gains tax permanently', 'Defers realization but leaves the gain embedded and adds margin-call and interest risk', 'Is non-callable by the lender', 'Requires no collateral'], answer: 1, explanation: 'The portfolio remains pledged and the gain unrealized; the line is callable and interest accrues. Tax at death depends on jurisdiction-specific basis rules.' },
    { id: 'd3q4', prompt: 'In an acquisition financing, the classic structural failure is:', options: ['Using too little debt', 'Sizing the leverage multiple on peak EBITDA', 'Amortizing too quickly', 'Having an intercreditor agreement'], answer: 1, explanation: 'Debt sized on peak earnings leaves no cushion when earnings normalize; covenants breach and refinancing fails.' },
    { id: 'd3q5', prompt: 'Which statement about factoring is correct?', options: ['Factoring is a loan secured by equipment', 'Recourse factoring leaves the seller liable if the customer does not pay', 'Factoring is typically the cheapest long-term capital', 'Factoring requires real estate collateral'], answer: 1, explanation: 'In recourse factoring, the seller must make the factor whole on uncollected invoices; non-recourse shifts that credit risk to the factor at a higher cost.' },
  ],
  misconception: {
    claim: '“A line of credit is cheaper than a term loan, so finance the expansion on the line.”',
    reality: 'A line prices lower because it is short-term, callable and floating. Funding a long-lived asset with it creates renewal and rate risk and often breaches the lender’s own usage expectations (annual clean-down). Match the instrument to the asset’s life.',
    confidence: 'amber',
  },
  references: [
    { title: 'SBA — 7(a) and 504 loan programs', jurisdiction: 'US', type: 'guidance', url: 'https://www.sba.gov/funding-programs/loans' },
    { title: 'OCC Comptroller’s Handbook — Asset-Based Lending; Accounts Receivable and Inventory Financing; Trade Finance and Services', jurisdiction: 'US', type: 'guidance', url: 'https://www.occ.gov/publications-and-resources/publications/comptrollers-handbook/' },
    { title: 'SEC / FINRA Investor Bulletin — Securities-Backed Lines of Credit', jurisdiction: 'US', type: 'guidance', url: 'https://www.sec.gov/oiea/investor-alerts-bulletins/' },
    { title: 'Federal Reserve — Senior Loan Officer Opinion Survey on Bank Lending Practices (credit standards and terms by loan type)', jurisdiction: 'US', type: 'research', url: 'https://www.federalreserve.gov/data/sloos.htm' },
    { title: 'CFPB — Ability-to-Repay and Qualified Mortgage rule (Regulation Z §1026.43)', citation: '12 C.F.R. § 1026.43', jurisdiction: 'US', type: 'regulation' },
    { title: 'Central Bank of the UAE — Regulations regarding mortgage loans (LTV limits by borrower category)', jurisdiction: 'UAE', type: 'regulation', note: 'Phrased generally; verify current circular and ratio values.' },
    { title: 'ICC Uniform Customs and Practice for Documentary Credits (UCP 600)', jurisdiction: 'International', type: 'publication' },
    { title: 'BEAC / COBAC — regulation of credit institutions and microfinance in the CEMAC zone', jurisdiction: 'CEMAC', type: 'regulation', note: 'Phrased generally.' },
  ],
  jurisdictionNotes: {
    US: { verified: true, notes: ['Deep agency mortgage market provides long fixed-rate residential credit; DSCR investor loans are non-agency.', 'SBA 7(a)/504 guarantee programs; UCC Article 9 governs liens on business assets and equipment.', 'Securities-backed lending regulated through broker-dealer margin rules (Regulation T / FINRA 4210) and private-bank credit policy.'] },
    UAE: { verified: false, notes: ['Central Bank sets maximum LTVs for residential mortgages differing by nationality and property sequence; Islamic finance structures (Murabaha, Ijara) widely available.', 'SME lending often secured by personal guarantees and assignment of receivables; trade finance is a core product given the import economy.', 'Verify current regulations before relying on any ratio.'] },
    CEMAC: { verified: false, notes: ['Bank credit is comparatively scarce and short-dated; overdrafts, trade finance (letters of credit) and supplier credit dominate SME financing.', 'Microfinance institutions (EMF) supervised by COBAC are a significant credit channel.', 'Equipment leasing (crédit-bail) is governed by OHADA/national law — verify locally.'] },
    UK: { verified: false, notes: ['Overdrafts and invoice finance are widespread SME products; the British Business Bank operates guarantee schemes analogous to SBA programs.', 'Content for this jurisdiction is in preparation.'] },
  },
};
export default lesson;
