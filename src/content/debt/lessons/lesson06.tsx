import type { DebtLesson } from '../types';
import { MachineModel } from './visuals/lesson-visuals';

const lesson: DebtLesson = {
  id: 'debt-06',
  number: 6,
  slug: 'financing-business-expansion',
  title: 'Financing Business Expansion',
  subtitle: 'Working capital, inventory, machinery, acquisitions and trade credit: when debt makes a business bigger and when it makes it fragile.',
  hook: 'A machine bought with borrowed money has to pay three people: the operator, the supplier of inputs, and the bank. Only if there is something left for the owner was it an expansion.',
  duration: '30 min',
  objectives: ['governance', 'asset-protection', 'succession'],
  sections: [
    {
      id: 'kinds',
      heading: 'Four kinds of expansion need, four shapes of money',
      body: [
        'Businesses borrow for four reasons, and each has a natural instrument. **Working capital** — the cash tied up between paying suppliers and collecting from customers — is a revolving need and wants a revolving facility sized to receivables and inventory. **Inventory** build for a season or a contract is a short-term need that liquidates when the stock sells. **Machinery and equipment** are multi-year productive assets and want multi-year amortizing debt or leases matched to their life. **Acquisitions** — buying a competitor, a supplier or a book of customers — are repaid from the acquired cash flows and want term debt sized on those flows with a cushion.',
        'The common failure is to finance a long need with short money or vice versa. A bakery that buys a second oven on its overdraft has turned a seven-year asset into a facility the bank can cancel next month. A distributor that funds seasonal inventory with a five-year term loan is paying interest for four years on stock that sold in the first. Lenders will often say yes to the mismatched structure because it is what the borrower asked for; the cost shows up later.',
        'Trade credit — buying on terms from suppliers — is the fifth source and the largest in most economies. It is interest-free when the discount is taken and extremely expensive when it is not. A business with a strong supplier relationship, consistent payment history and a growing order book can often negotiate longer terms, which is a form of expansion finance that never appears on a loan statement.',
      ],
    },
    {
      id: 'machine',
      heading: 'The financed machine: does it pay for itself?',
      body: [
        'Here is the whole analysis in a single picture. A $240,000 machine, 75% financed at 9% over five years, costs about $3,737 a month in debt service — roughly $44,800 a year. It is expected to add $180,000 of revenue at full capacity, with $95,000 of incremental operating cost (operator, materials, power, maintenance), for $85,000 of operating cash flow. After debt service that leaves about $40,000 a year for the owner, a DSCR around 1.9×, and the $60,000 of equity is recovered in the second year. In year six the loan is gone and the full $85,000 (grown a little) falls to the owner.',
        'Now move the sliders. If revenue comes in at $130,000 instead of $180,000, operating cash flow is $35,000 and does not cover the $44,800 of debt service: the machine is a liability every month until it is paid off. If the business finances 100% of the cost, the equity recovered is zero but debt service rises and coverage thins. The model is simple arithmetic — revenue less operating cost less debt service, with a ramp-up period and growth — and every figure is computed by the tested `expansionModel` function in this studio.',
        'The real-world underwriting adds three things the picture leaves out: the **ramp-up** is usually longer than planned, **maintenance and downtime** are usually higher, and the incremental revenue often **cannibalizes** existing sales rather than adding to them. Build the base case, then halve the revenue and double the ramp and ask whether you can still make the payments. If the answer is no, the question is not whether to borrow but whether to buy.',
      ],
      Visual: MachineModel,
    },
    {
      id: 'working-capital',
      heading: 'Working capital and the cash-conversion cycle',
      body: [
        'Growth consumes cash before it produces it. A business whose sales double must typically carry twice the receivables and twice the inventory, and must pay suppliers and staff before customers pay. The amount of cash this absorbs is the **cash-conversion cycle** — days of inventory plus days of receivables minus days payable — multiplied by daily cost of sales. A distributor with 60 days of inventory, 45 days of receivables and 30 days of payables has a 75-day cycle; at $20,000 a day of cost of sales, that is $1.5 million of working capital, and every 10% of growth needs another $150,000.',
        'Lenders fund this with **revolving lines** against a borrowing base: typically an advance of 70–85% on eligible receivables (under 90 days, not from affiliates or disputed) and a lower advance on inventory with haircuts for obsolescence. The line grows with the business and shrinks when collections slow — which is both its virtue and its danger: in a downturn the borrowing base contracts exactly when cash is tightest, and ineligible receivables (old invoices from struggling customers) fall out of availability. **Invoice financing** and **factoring** do the same job without a bank relationship, at a higher price.',
        'The expansion mistake here is to treat the permanent growth in working capital as temporary. If sales have doubled and stay doubled, the extra $1.5 million is a permanent asset of the business and should eventually be funded with permanent capital — retained earnings or term debt — not a line meant to clean down annually.',
      ],
    },
    {
      id: 'acquisitions',
      heading: 'Acquisition loans and corporate financing',
      body: [
        'Buying a business with borrowed money is the most powerful and most dangerous form of expansion finance. The debt is sized as a multiple of the target’s EBITDA — in the SME world often two to three times, in sponsored deals more — and repaid from the target’s own cash flows. The buyer’s equity cheque is the difference between price and debt. If the acquired business performs, the owner has bought earnings with the bank’s money; if it underperforms by 20%, a 3× leverage multiple becomes 3.75× and the covenants trip.',
        'Structures layer: a **senior term loan** from a bank (amortizing, secured on everything), often an **SBA 7(a)** component for small US deals, a **seller note** (subordinated, standing behind the bank, sometimes with an earn-out), and the buyer’s equity. Each layer has its own documents and the **intercreditor** or **subordination agreement** decides who gets paid when there is not enough. Lenders will require a quality-of-earnings review, a collateral audit and personal guarantees from the acquirer for closely held deals.',
        'For family businesses the acquisition question often arrives from the other side — a buyer financed with debt proposing to acquire the family company, offering a seller note as part of the price. The family is then the lender: it should underwrite the buyer, demand security and covenants, and understand that a seller note subordinated to a bank is equity-like risk at debt-like returns.',
      ],
      callouts: [{ tone: 'amber', title: 'EBITDA add-backs', body: 'Acquisition debt is sized on “adjusted EBITDA”. Each adjustment — owner salary normalization, one-time costs, synergies — is a claim the lender must believe. A deal that needs many add-backs to show coverage is a deal whose coverage is in doubt.' }],
    },
    {
      id: 'covenants',
      heading: 'Covenants, reporting and the lender relationship',
      body: [
        'Expansion debt arrives with covenants: a maximum debt-to-EBITDA, a minimum fixed-charge coverage, limits on distributions to owners, limits on further debt and liens, and reporting requirements (monthly or quarterly financials, annual reviewed or audited statements, a compliance certificate). Breaching a covenant is a default even when every payment has been made; the lender can accelerate, charge default interest, or — more commonly — waive for a fee and tighten terms.',
        'Treat covenants as management information rather than paperwork. The ratios in the loan agreement are the lender’s view of what a healthy version of your business looks like; tracking them monthly tells you earlier than your own instincts when something is slipping. Build headroom into every forecast, call the lender before a breach rather than after, and never let a reporting deadline pass unexplained. Lenders forgive numbers more readily than they forgive surprises.',
        'Distribution limits deserve particular attention in family companies: a covenant restricting dividends to a percentage of net income may conflict with the family’s expectations for income from the business. Negotiate it before signing, with the family governance plan in the room.',
      ],
    },
    {
      id: 'when-not',
      heading: 'When not to borrow for expansion',
      body: [
        'Do not borrow to fund operating losses dressed as growth. Do not borrow for an expansion whose base-case coverage is below roughly 1.25× before stress, or whose stressed case cannot make the payment. Do not borrow short for long assets. Do not borrow against the family home or with blanket personal guarantees to fund an experiment. Do not borrow when the lender’s covenants would force decisions — layoffs, asset sales, no dividends — that the family would not otherwise make.',
        'The alternative to debt is not always equity dilution. It is slower growth funded from retained earnings, supplier terms, customer deposits, leasing instead of buying, or simply waiting a year to build the evidence that makes the loan cheap and the covenants loose. The Decision Simulator in this studio models “borrow now” against “grow slower” on the same assumptions, and often the slower path has the higher expected equity value because it survives the bad scenario.',
      ],
    },
  ],
  keyTerms: [
    { term: 'Cash-conversion cycle', definition: 'Days inventory + days receivable − days payable; the working-capital requirement generated by sales.' },
    { term: 'Borrowing base', definition: 'Eligible collateral (receivables, inventory) × advance rates; the maximum available on an asset-based line.' },
    { term: 'Advance rate', definition: 'The percentage of eligible collateral value a lender will lend against.' },
    { term: 'Fixed-charge coverage', definition: 'Cash flow after capex, taxes and distributions ÷ principal, interest and lease payments.' },
    { term: 'Seller note', definition: 'Deferred purchase price owed to the seller, usually subordinated to senior bank debt.' },
    { term: 'Subordination agreement', definition: 'Contract fixing that one creditor is paid only after another; governs seller notes behind banks.' },
    { term: 'Compliance certificate', definition: 'Periodic borrower statement that covenants are met, with supporting calculations.' },
    { term: 'Ramp-up', definition: 'The period during which a new asset or business produces below its full planned output.' },
  ],
  knowledgeCheck: [
    { id: 'd6q1', prompt: 'A seven-year production machine is best financed with:', options: ['An overdraft', 'A revolving line of credit', 'Amortizing equipment debt or a lease matched to its life', 'A 30-year mortgage'], answer: 2, explanation: 'Matching term to asset life avoids refinancing risk and avoids paying for an asset after it stops producing.' },
    { id: 'd6q2', prompt: 'In the financed-machine model, if incremental revenue falls to $130,000 with $95,000 operating cost and $44,800 debt service, the machine:', options: ['Still covers debt service comfortably', 'Produces $35,000 of operating cash flow, which does not cover debt service', 'Has a DSCR of 2.0×', 'Pays back equity in year one'], answer: 1, explanation: '$130,000 − $95,000 = $35,000 operating cash flow against $44,800 of debt service: DSCR below 1.0×, negative net cash flow.' },
    { id: 'd6q3', prompt: 'A distributor’s cash-conversion cycle is 75 days at $20,000/day cost of sales. A 10% permanent increase in sales requires roughly how much more working capital?', options: ['$15,000', '$150,000', '$1.5 million', 'None'], answer: 1, explanation: '75 × $20,000 = $1.5M of working capital; 10% growth needs about $150,000 more, permanently.' },
    { id: 'd6q4', prompt: 'A seller note subordinated to a senior bank loan is best described as:', options: ['Senior secured debt', 'Equity-like risk at debt-like returns', 'Risk-free deferred payment', 'A bank guarantee'], answer: 1, explanation: 'The seller is paid only after the bank; if the buyer underperforms, the note absorbs losses like equity while earning a fixed coupon.' },
    { id: 'd6q5', prompt: 'A covenant breach with all payments made on time:', options: ['Has no consequence', 'Is still an event of default that may allow acceleration or require a waiver', 'Automatically cancels the loan', 'Is only possible on consumer loans'], answer: 1, explanation: 'Financial covenants are independent obligations; breaching one is a default regardless of payment history.' },
  ],
  misconception: {
    claim: '“Borrowing to expand is always worth it if the business is profitable.”',
    reality: 'Profit before the expansion says nothing about whether the incremental asset covers its own debt service. The test is incremental operating cash flow against incremental debt service under a stressed case, and whether the covenants and guarantees expose the rest of the family balance sheet.',
    confidence: 'amber',
  },
  references: [
    { title: 'SBA — 7(a) loan program: uses of proceeds (working capital, equipment, business acquisition) and 504 program for fixed assets', jurisdiction: 'US', type: 'guidance', url: 'https://www.sba.gov/funding-programs/loans' },
    { title: 'OCC Comptroller’s Handbook — Commercial Loans; Asset-Based Lending; Leveraged Lending', jurisdiction: 'US', type: 'guidance', url: 'https://www.occ.gov/publications-and-resources/publications/comptrollers-handbook/' },
    { title: 'Interagency Guidance on Leveraged Lending (2013)', jurisdiction: 'US', type: 'guidance' },
    { title: 'Federal Reserve — Small Business Credit Survey (Federal Reserve Banks)', jurisdiction: 'US', type: 'research', url: 'https://www.fedsmallbusiness.org/' },
    { title: 'IRC §163(j) — limitation on business interest expense (30% of adjusted taxable income; small-business exemption; electing real property trade or business)', citation: '26 U.S.C. § 163(j)', jurisdiction: 'US', type: 'statute' },
    { title: 'IRC §179 and §168(k) — expensing and bonus depreciation of qualifying equipment', citation: '26 U.S.C. §§ 168(k), 179', jurisdiction: 'US', type: 'statute', note: 'Tax treatment of financed equipment; limits and phase-outs change — verify current year.' },
    { title: 'UAE Federal Decree-Law No. 47 of 2022 on Taxation of Corporations and Businesses — general interest deduction limitation', jurisdiction: 'UAE', type: 'statute', note: 'Phrased generally.' },
    { title: 'OHADA Uniform Act on Commercial Companies and Economic Interest Groups (revised 2014) — corporate authority to borrow and grant security', jurisdiction: 'OHADA / CEMAC', type: 'statute' },
  ],
  jurisdictionNotes: {
    US: { verified: true, notes: ['SBA 7(a) and 504 programs are the main guaranteed channels for SME expansion finance; personal guarantees required from 20%+ owners.', 'Business interest deductible subject to §163(j) for larger taxpayers; equipment may qualify for §179 / bonus depreciation.', 'Liens on equipment and receivables perfected under UCC Article 9.'] },
    UAE: { verified: false, notes: ['SME expansion finance commonly structured with Islamic instruments (Murabaha for equipment, Ijara leases); Emirates Development Bank offers SME programs.', 'Corporate Tax (9% above the threshold) allows interest deduction subject to the general 30% EBITDA limitation and a de minimis threshold — verify figures.'] },
    CEMAC: { verified: false, notes: ['Bank term finance for equipment is short (often 3–5 years) and secured by pledges registered at the RCCM under the OHADA Uniform Act; leasing (crédit-bail) is developing.', 'Company borrowing authority governed by the OHADA companies act and the articles of association.', 'Interest deductibility under the Cameroon General Tax Code subject to limits — verify.'] },
    UK: { verified: false, notes: ['British Business Bank guarantee schemes; asset finance and invoice finance are mature markets.', 'Content for this jurisdiction is in preparation.'] },
  },
};
export default lesson;
