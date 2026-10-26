/**
 * Money Flow engine — pure, deterministic ledger for the Money Flow Simulator.
 * Given scenario inputs it produces an ordered list of flows (each a movement of
 * capital between two entities with its postings) and can replay them into
 * per-entity mini balance sheets. Tested in engine.test.ts.
 */
import type { Objective } from '@/types/content';

export type EntityId =
  | 'customers' | 'opco' | 'vendors' | 'tax' | 'holdco' | 'propco' | 'invco'
  | 'trust' | 'insurance' | 'family' | 'lenders' | 'seller';

export interface EntityMeta { id: EntityId; label: string; sub: string; tone: 'gold' | 'ivory' | 'green' | 'violet' | 'blue' | 'red' | 'amber'; external?: boolean; x: number; y: number }

export const ENTITIES: EntityMeta[] = [
  { id: 'customers', label: 'Customers', sub: 'market', tone: 'ivory', external: true, x: 110, y: 80 },
  { id: 'opco', label: 'Operating Co', sub: 'LLC / S-corp / C-corp', tone: 'gold', x: 360, y: 80 },
  { id: 'vendors', label: 'Vendors & Payroll', sub: 'external', tone: 'ivory', external: true, x: 610, y: 80 },
  { id: 'tax', label: 'Tax Authority', sub: 'federal · state', tone: 'red', external: true, x: 870, y: 80 },
  { id: 'lenders', label: 'Lenders', sub: 'bank · mortgage', tone: 'blue', external: true, x: 110, y: 270 },
  { id: 'holdco', label: 'Holding Co', sub: 'owns the operating entities', tone: 'gold', x: 360, y: 270 },
  { id: 'family', label: 'Family / Household', sub: 'owners', tone: 'gold', x: 610, y: 270 },
  { id: 'propco', label: 'Property Co', sub: 'real estate SPV', tone: 'ivory', x: 110, y: 460 },
  { id: 'invco', label: 'Investment Co', sub: 'securities · funds', tone: 'ivory', x: 360, y: 460 },
  { id: 'trust', label: 'Family Bank / Trust', sub: 'irrevocable · lends to family', tone: 'violet', x: 610, y: 460 },
  { id: 'insurance', label: 'Insurance', sub: 'carrier', tone: 'green', x: 870, y: 460 },
  { id: 'seller', label: 'Property Seller', sub: 'external', tone: 'ivory', external: true, x: 110, y: 640 },
];

export const ENTITY_BY_ID: Record<EntityId, EntityMeta> = Object.fromEntries(ENTITIES.map((e) => [e.id, e])) as Record<EntityId, EntityMeta>;

export interface FlowInputs {
  revenue: number;
  expenseRatio: number;        // 0..1
  taxReserveRate: number;      // 0..1 — illustrative blended rate
  distributionPct: number;     // 0..1 of after-tax profit distributed to HoldCo
  loanAmount: number;          // HoldCo → PropCo note
  loanRate: number;            // annual decimal
  investmentPct: number;       // 0..1 of HoldCo cash after the loan
  propertyPrice: number;
  ltv: number;                 // 0..1
  premium: number;             // annual insurance premium funded via trust
  familyDistribution: number;  // cash to household
}

export const DEFAULT_INPUTS: FlowInputs = {
  revenue: 1_000_000,
  expenseRatio: 0.65,
  taxReserveRate: 0.27,
  distributionPct: 0.8,
  loanAmount: 120_000,
  loanRate: 0.06,
  investmentPct: 0.4,
  propertyPrice: 500_000,
  ltv: 0.75,
  premium: 18_000,
  familyDistribution: 30_000,
};

export type AccountSide = 'asset' | 'liability';
export interface Posting { entity: EntityId; account: string; side: AccountSide; delta: number }

export interface Flow {
  id: string;
  step: number;
  from: EntityId;
  to: EntityId;
  amount: number;
  title: string;
  /** short ledger description */
  ledger: string;
  kind: 'revenue' | 'expense' | 'tax' | 'distribution' | 'loan' | 'investment' | 'acquisition' | 'premium' | 'contribution' | 'interest' | 'recognition';
  postings: Posting[];
  explain: {
    economic: string;
    legal: string;
    documentation: string[];
    taxQuestions: string[];
    approvals: string;
    objectives: Objective[];
  };
  /** Warnings specific to this run (e.g. clamps applied). */
  notes: string[];
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const r2 = (n: number) => Math.round(n * 100) / 100;

/** Build the ordered list of flows for the scenario. Every amount is clamped to what the paying entity can fund. */
export function buildFlows(raw: FlowInputs): Flow[] {
  const inp: FlowInputs = {
    ...raw,
    revenue: Math.max(0, raw.revenue),
    expenseRatio: clamp(raw.expenseRatio, 0, 0.99),
    // The tax reserve is never zero: a profitable business always raises a tax question somewhere.
    taxReserveRate: clamp(raw.taxReserveRate, 0.01, 0.6),
    distributionPct: clamp(raw.distributionPct, 0, 1),
    investmentPct: clamp(raw.investmentPct, 0, 1),
    ltv: clamp(raw.ltv, 0, 0.95),
  };
  const flows: Flow[] = [];
  let step = 0;
  const push = (f: Omit<Flow, 'step'>) => { step += 1; flows.push({ ...f, step }); };

  // 1 — Revenue
  const revenue = r2(inp.revenue);
  push({
    id: 'revenue', from: 'customers', to: 'opco', amount: revenue, kind: 'revenue',
    title: 'Revenue earned by the Operating Company',
    ledger: 'Customers pay OpCo for goods/services',
    postings: [{ entity: 'opco', account: 'Cash', side: 'asset', delta: revenue }, { entity: 'customers', account: 'Cash', side: 'asset', delta: -revenue }],
    explain: {
      economic: 'The engine of the whole architecture. Everything downstream is funded by the operating business selling something people pay for. No structure creates this; structures only decide where it is held, how it is protected and how it is taxed.',
      legal: 'Ordinary commercial contracts between OpCo and its customers. Revenue is earned by the entity whose name is on the contract and the invoice.',
      documentation: ['Customer contracts / invoices', 'Bank statements in OpCo\'s name', 'Books kept at the entity level (not commingled with owners)'],
      taxQuestions: ['Income is recognised by OpCo; how it is then taxed depends on its classification (disregarded, partnership, S or C corporation).', 'State nexus and sales/VAT questions follow where customers and operations sit.'],
      approvals: 'Management in the ordinary course of business.',
      objectives: ['governance'],
    },
    notes: [],
  });

  // 2 — Expenses
  const expenses = r2(revenue * inp.expenseRatio);
  push({
    id: 'expenses', from: 'opco', to: 'vendors', amount: expenses, kind: 'expense',
    title: 'Operating expenses paid to vendors and payroll',
    ledger: `OpCo pays ${Math.round(inp.expenseRatio * 100)}% of revenue as expenses`,
    postings: [{ entity: 'opco', account: 'Cash', side: 'asset', delta: -expenses }, { entity: 'vendors', account: 'Cash', side: 'asset', delta: expenses }],
    explain: {
      economic: 'Wages, rent, suppliers, software, insurance for the business itself. The gap between revenue and this line is the only capital the family ever has to allocate.',
      legal: 'Employment contracts, supplier agreements, leases. Owners\' salaries are compensation (W-2 / payroll) and must be reasonable; they are not distributions.',
      documentation: ['Payroll records', 'Vendor invoices and payment records', 'A lease or management agreement if an affiliate provides services (arm\'s-length pricing)'],
      taxQuestions: ['Ordinary and necessary expenses are generally deductible to the business; personal expenses routed through the company are not.', 'Payments to related entities (management fees, rent to PropCo) must be at arm\'s length and documented or they are recharacterised.'],
      approvals: 'Management; large or related-party contracts typically require manager/board approval under the operating agreement.',
      objectives: ['governance', 'tax-planning'],
    },
    notes: [],
  });

  // 3 — Operating profit recognised (no cash movement)
  const profit = r2(revenue - expenses);
  push({
    id: 'profit', from: 'opco', to: 'opco', amount: profit, kind: 'recognition',
    title: 'Operating profit determined',
    ledger: 'Revenue − expenses = operating profit (no cash moves)',
    postings: [],
    explain: {
      economic: 'Profit is a book figure, not a cash movement. It sets the ceiling for every allocation that follows: tax reserve, reinvestment, distribution.',
      legal: 'Determined under the company\'s accounting method; distributions are generally measured against this and against solvency tests in the governing statute.',
      documentation: ['Management accounts / P&L', 'Year-end financial statements (reviewed or audited where lenders require)'],
      taxQuestions: ['Book profit and taxable income differ (depreciation, timing, non-deductible items). Which figure drives the reserve?'],
      approvals: 'Finance function; board reviews.',
      objectives: ['governance'],
    },
    notes: [],
  });

  // 4 — Tax reserve
  const taxReserve = r2(Math.max(0, profit) * inp.taxReserveRate);
  push({
    id: 'tax', from: 'opco', to: 'tax', amount: taxReserve, kind: 'tax',
    title: 'Reserve for tax on operating profit',
    ledger: `Illustrative blended rate ${Math.round(inp.taxReserveRate * 100)}% × profit, reserved / remitted`,
    postings: [{ entity: 'opco', account: 'Cash', side: 'asset', delta: -taxReserve }, { entity: 'tax', account: 'Cash', side: 'asset', delta: taxReserve }],
    explain: {
      economic: 'Someone pays tax on this profit. The structure decides who (the entity or its owners) and when, not whether. Families that skip this reserve are the ones that end up borrowing to pay a tax bill.',
      legal: 'For a C corporation the entity pays; for a pass-through (partnership, S corporation, disregarded LLC) the owners pay on their share whether or not cash is distributed, and the company typically distributes enough to cover it ("tax distributions" under the operating agreement).',
      documentation: ['Estimated tax payments (entity or owner level)', 'K-1s for pass-through owners', 'Tax-distribution clause in the operating agreement'],
      taxQuestions: ['Entity classification drives everything: C-corp rate plus dividend tax on distribution, vs. one layer at owner rates for pass-throughs.', 'State and local taxes, self-employment tax and the qualified business income deduction all change the blended rate.', 'Moving profit to HoldCo does not remove this line.'],
      approvals: 'Tax adviser and finance; owners for pass-through estimates.',
      objectives: ['tax-planning', 'governance'],
    },
    notes: inp.taxReserveRate !== raw.taxReserveRate ? ['Tax reserve rate clamped to a 1%–60% range: a reserve of zero is never shown because profit always raises a tax question somewhere.'] : [],
  });

  // 5 — Distribution to HoldCo
  const afterTax = r2(Math.max(0, profit - taxReserve));
  const distribution = r2(afterTax * inp.distributionPct);
  push({
    id: 'distribution', from: 'opco', to: 'holdco', amount: distribution, kind: 'distribution',
    title: 'Distribution of after-tax profit to the Holding Company',
    ledger: `${Math.round(inp.distributionPct * 100)}% of after-tax profit distributed to owner (HoldCo)`,
    postings: [{ entity: 'opco', account: 'Cash', side: 'asset', delta: -distribution }, { entity: 'holdco', account: 'Cash', side: 'asset', delta: distribution }],
    explain: {
      economic: 'Cash that stays in OpCo is exposed to OpCo\'s creditors and lawsuits. Moving retained profit up to a holding company that does nothing operational separates the capital from the risk that produced it.',
      legal: 'A distribution to a member/shareholder under the LLC operating agreement or corporate bylaws, subject to the statutory solvency test. HoldCo receives it because HoldCo owns the OpCo interests.',
      documentation: ['Manager / board resolution authorising the distribution', 'Operating agreement distribution provisions', 'Capital account or share-register entries'],
      taxQuestions: ['Pass-through: generally not a second taxable event (tax already attaches to the owner\'s share). C-corp: a dividend, taxable to HoldCo subject to any dividends-received deduction or consolidated-return rules.', 'A distribution that leaves OpCo insolvent can be clawed back as a fraudulent transfer, which also undermines the asset-protection purpose.'],
      approvals: 'OpCo manager/board, per the operating agreement; HoldCo accepts.',
      objectives: ['asset-protection', 'governance', 'tax-planning'],
    },
    notes: [],
  });

  // 6 — Loan HoldCo → PropCo
  let holdcoCash = distribution;
  const loan = r2(clamp(raw.loanAmount, 0, holdcoCash));
  holdcoCash = r2(holdcoCash - loan);
  push({
    id: 'loan', from: 'holdco', to: 'propco', amount: loan, kind: 'loan',
    title: 'Documented intercompany loan to the Property Company',
    ledger: `HoldCo lends ${Math.round(inp.loanRate * 1000) / 10}% note to PropCo (equity for the acquisition)`,
    postings: [
      { entity: 'holdco', account: 'Cash', side: 'asset', delta: -loan },
      { entity: 'holdco', account: 'Note receivable (PropCo)', side: 'asset', delta: loan },
      { entity: 'propco', account: 'Cash', side: 'asset', delta: loan },
      { entity: 'propco', account: 'Note payable (HoldCo)', side: 'liability', delta: loan },
    ],
    explain: {
      economic: 'HoldCo chooses to lend rather than contribute equity. A lender ranks ahead of PropCo\'s equity if PropCo fails, and the loan can be repaid without a distribution. The cost is that a loan has to behave like one: interest, a schedule, enforcement.',
      legal: 'A promissory note between two related entities. To be respected as debt the IRS and courts look at bona fide debt factors: a written note, a fixed maturity, a market-reasonable interest rate, actual payments, the borrower\'s capacity to repay and whether an outside lender would have made the loan.',
      documentation: ['Signed promissory note', 'Security agreement / recorded deed of trust if secured', 'Resolutions of both HoldCo and PropCo', 'A repayment schedule and evidence of payments actually made'],
      taxQuestions: ['Interest is income to HoldCo and (generally) an expense to PropCo; a rate below the applicable federal rate raises imputed-interest questions under IRC §7872.', 'A loan that is never serviced may be recharacterised as equity or a distribution, with different consequences.'],
      approvals: 'Managers of both entities; lenders to PropCo may require subordination of the HoldCo note.',
      objectives: ['asset-protection', 'tax-planning', 'governance'],
    },
    notes: loan < raw.loanAmount ? [`Loan reduced from ${raw.loanAmount.toLocaleString()} to the cash HoldCo actually holds after the distribution.`] : [],
  });

  // 7 — Investment into InvCo
  const investment = r2(holdcoCash * inp.investmentPct);
  holdcoCash = r2(holdcoCash - investment);
  push({
    id: 'investment', from: 'holdco', to: 'invco', amount: investment, kind: 'investment',
    title: 'Capital contribution to the Investment Company',
    ledger: `${Math.round(inp.investmentPct * 100)}% of remaining HoldCo cash contributed as equity`,
    postings: [
      { entity: 'holdco', account: 'Cash', side: 'asset', delta: -investment },
      { entity: 'holdco', account: 'Equity in InvCo', side: 'asset', delta: investment },
      { entity: 'invco', account: 'Cash', side: 'asset', delta: investment },
    ],
    explain: {
      economic: 'Liquid, diversified capital held in a separate box from both the operating business and the real estate. It is the family\'s shock absorber and the source of its future "family bank" lending capacity.',
      legal: 'Capital contribution recorded in the InvCo operating agreement and capital accounts (equity, not a loan). InvCo then holds brokerage accounts in its own name.',
      documentation: ['Capital contribution resolution', 'Updated capital accounts / membership ledger', 'Brokerage account opened in InvCo\'s name with KYC on beneficial owners'],
      taxQuestions: ['Investment income (interest, dividends, gains) is taxed to InvCo or flows through to its owners depending on classification.', 'Holding passive investments in a C corporation can trigger accumulated-earnings or personal-holding-company questions.'],
      approvals: 'HoldCo manager; InvCo investment policy statement governs what it buys.',
      objectives: ['asset-protection', 'governance'],
    },
    notes: [],
  });

  // 8 — Property acquisition with lender debt
  const requestedPrice = Math.max(0, raw.propertyPrice);
  const equityShare = 1 - inp.ltv;
  const maxPriceFromEquity = equityShare > 0 ? loan / equityShare : requestedPrice;
  const price = r2(Math.min(requestedPrice, maxPriceFromEquity));
  const mortgage = r2(price * inp.ltv);
  const equityUsed = r2(price - mortgage);
  push({
    id: 'mortgage', from: 'lenders', to: 'propco', amount: mortgage, kind: 'loan',
    title: 'Acquisition financing from an outside lender',
    ledger: `Lender advances ${Math.round(inp.ltv * 100)}% LTV mortgage to PropCo`,
    postings: [
      { entity: 'lenders', account: 'Cash', side: 'asset', delta: -mortgage },
      { entity: 'lenders', account: 'Mortgage receivable', side: 'asset', delta: mortgage },
      { entity: 'propco', account: 'Cash', side: 'asset', delta: mortgage },
      { entity: 'propco', account: 'Mortgage payable', side: 'liability', delta: mortgage },
    ],
    explain: {
      economic: 'Debt lets PropCo buy a larger asset than the family\'s equity alone would allow. It also means the property must produce enough rent to cover debt service; leverage magnifies both outcomes.',
      legal: 'Loan agreement, promissory note and mortgage/deed of trust recorded against the property. Lenders often require a personal or HoldCo guarantee, which re-connects the liability to the family.',
      documentation: ['Loan agreement and note', 'Recorded mortgage / deed of trust', 'Guarantees (if any)', 'Appraisal and lender underwriting file'],
      taxQuestions: ['Mortgage interest is generally deductible against rental income; interest-limitation rules may apply above certain thresholds.', 'Debt does not reduce tax on its own; it changes the timing and amount of cash available.'],
      approvals: 'PropCo manager; HoldCo if it guarantees; the lender\'s credit committee.',
      objectives: ['asset-protection'],
    },
    notes: price < requestedPrice ? [`Purchase price scaled from ${requestedPrice.toLocaleString()} to ${price.toLocaleString()} so that the equity portion (${Math.round(equityShare * 100)}%) equals the cash PropCo received from HoldCo.`] : [],
  });
  push({
    id: 'acquisition', from: 'propco', to: 'seller', amount: price, kind: 'acquisition',
    title: 'Property acquired by the Property Company',
    ledger: `PropCo pays seller: ${Math.round(inp.ltv * 100)}% debt + ${Math.round(equityShare * 100)}% equity`,
    postings: [
      { entity: 'propco', account: 'Cash', side: 'asset', delta: -price },
      { entity: 'propco', account: 'Real estate', side: 'asset', delta: price },
      { entity: 'seller', account: 'Cash', side: 'asset', delta: price },
    ],
    explain: {
      economic: 'The asset sits in its own entity so that a claim arising from the property (a tenant injury, an environmental issue) is contained there, and a claim against OpCo cannot reach the building.',
      legal: 'Purchase and sale agreement; deed recorded in PropCo\'s name; title insurance. Any lease back to OpCo must be a written, arm\'s-length lease.',
      documentation: ['Purchase agreement and closing statement', 'Recorded deed in PropCo\'s name', 'Lease to OpCo (if OpCo occupies)', 'Property insurance naming lender'],
      taxQuestions: ['Depreciation is taken by PropCo (or flows through); rental income is taxed to PropCo\'s owners under its classification.', 'Transfer taxes and property-tax reassessment on acquisition vary by state.'],
      approvals: 'PropCo manager; lender consent on the closing.',
      objectives: ['asset-protection', 'estate-planning'],
    },
    notes: [],
  });

  // 9 — Fund the trust (gift / contribution sized to premium)
  const contribution = r2(clamp(raw.premium, 0, holdcoCash));
  holdcoCash = r2(holdcoCash - contribution);
  push({
    id: 'contribution', from: 'holdco', to: 'trust', amount: contribution, kind: 'contribution',
    title: 'Funding the Family Bank / Trust',
    ledger: 'HoldCo distributes to owners who gift to the trust (shown as one movement)',
    postings: [
      { entity: 'holdco', account: 'Cash', side: 'asset', delta: -contribution },
      { entity: 'trust', account: 'Cash', side: 'asset', delta: contribution },
    ],
    explain: {
      economic: 'Capital moved to the trust is meant to leave the founder\'s balance sheet for good: it funds insurance, later lends to family members, and is the seed of the permanent "family bank".',
      legal: 'In practice two steps: a distribution from HoldCo to its owners, then a gift from the owners to an irrevocable trust (with Crummey withdrawal notices to beneficiaries if annual-exclusion treatment is intended). The trust\'s ownership of HoldCo interests would change this; the diagram collapses the steps.',
      documentation: ['Distribution resolution', 'Gift letter and gift-tax return (Form 709) where required', 'Trust agreement; Crummey notices', 'Trust bank account in the trustee\'s name'],
      taxQuestions: ['A completed gift uses annual exclusion or lifetime exemption; the amount above exclusions is reportable.', 'Grantor vs non-grantor status decides who pays tax on trust income.', 'Incomplete gifts (retained powers) bring the assets back into the estate under IRC §§2036–2038.'],
      approvals: 'Settlor (donor), trustee accepts; trust counsel drafts.',
      objectives: ['estate-planning', 'asset-protection', 'succession'],
    },
    notes: contribution < raw.premium ? ['Contribution limited to remaining HoldCo cash.'] : [],
  });

  // 10 — Premium
  const premium = contribution;
  push({
    id: 'premium', from: 'trust', to: 'insurance', amount: premium, kind: 'premium',
    title: 'Insurance premium paid by the trust',
    ledger: 'Trustee pays annual premium on a policy the trust owns',
    postings: [
      { entity: 'trust', account: 'Cash', side: 'asset', delta: -premium },
      { entity: 'trust', account: 'Policy cash value (illustrative)', side: 'asset', delta: r2(premium * 0.55) },
      { entity: 'insurance', account: 'Cash', side: 'asset', delta: premium },
    ],
    explain: {
      economic: 'Insurance converts a stream of premiums into liquidity at exactly the moment the family balance sheet is most strained: a death, when estate tax or buy-outs come due. Early-year cash value is well below premiums paid; the illustration shows 55% in year one.',
      legal: 'Insurance contract between the carrier and the trust as owner and beneficiary. An irrevocable life insurance trust (ILIT) keeps the death benefit outside the insured\'s estate if the insured holds no incidents of ownership.',
      documentation: ['Policy contract with trust as owner/beneficiary', 'Trustee resolution to purchase and pay', 'Carrier illustration (guaranteed vs non-guaranteed columns)'],
      taxQuestions: ['Death benefit is generally income-tax free; estate inclusion depends on who owns the policy and the three-year rule for transferred policies (IRC §2035).', '"Tax-free banking" claims overstate it: policy loans reduce death benefit, carry interest and can lapse the policy; MEC rules limit over-funding.'],
      approvals: 'Trustee; insurance adviser; carrier underwriting.',
      objectives: ['estate-planning', 'succession'],
    },
    notes: [],
  });

  // 11 — Family distribution
  const famDist = r2(clamp(raw.familyDistribution, 0, holdcoCash));
  holdcoCash = r2(holdcoCash - famDist);
  push({
    id: 'family', from: 'holdco', to: 'family', amount: famDist, kind: 'distribution',
    title: 'Distribution to the family household',
    ledger: 'HoldCo distributes living-cost capital to owners',
    postings: [
      { entity: 'holdco', account: 'Cash', side: 'asset', delta: -famDist },
      { entity: 'family', account: 'Cash', side: 'asset', delta: famDist },
    ],
    explain: {
      economic: 'Owners live on something. What matters is that it is a deliberate, budgeted distribution, not the household treating the company account as its own, which is the fastest way to lose the liability shield.',
      legal: 'Distribution under HoldCo\'s operating agreement, pro rata to owners (or as the agreement allows).',
      documentation: ['Distribution resolution', 'Transfer from HoldCo account to personal account (never the reverse without a documented contribution)'],
      taxQuestions: ['Pass-through: already taxed at the owner level. C-corp: a dividend.', 'Reasonable compensation vs distribution matters for S-corps (payroll tax).'],
      approvals: 'HoldCo manager; family council budget if one exists.',
      objectives: ['governance'],
    },
    notes: famDist < raw.familyDistribution ? ['Family distribution limited to remaining HoldCo cash.'] : [],
  });

  // 12 — Interest on the intercompany note (year 1)
  const interest = r2(loan * inp.loanRate);
  const propcoCashAfter = r2(loan + mortgage - price);
  const interestPaidInCash = propcoCashAfter >= interest;
  push({
    id: 'interest', from: 'propco', to: 'holdco', amount: interest, kind: 'interest',
    title: 'Year-one interest on the intercompany note',
    ledger: interestPaidInCash ? 'PropCo pays interest to HoldCo in cash' : 'PropCo accrues interest payable to HoldCo (cash to come from rent)',
    postings: interestPaidInCash
      ? [
        { entity: 'propco', account: 'Cash', side: 'asset', delta: -interest },
        { entity: 'holdco', account: 'Cash', side: 'asset', delta: interest },
      ]
      : [
        { entity: 'propco', account: 'Interest payable (HoldCo)', side: 'liability', delta: interest },
        { entity: 'holdco', account: 'Interest receivable (PropCo)', side: 'asset', delta: interest },
      ],
    explain: {
      economic: 'A loan that never charges or collects interest is not a loan. Interest is what makes the HoldCo note real to a court or an auditor, and it moves cash back up to the entity best placed to redeploy it.',
      legal: 'Payment under the promissory note\'s terms. Missed payments should be documented as defaults and cured, not ignored.',
      documentation: ['Interest invoice or schedule', 'Bank transfer record', 'Year-end intercompany reconciliation'],
      taxQuestions: ['Interest income to HoldCo; interest expense to PropCo subject to limitation rules.', 'If the rate is below the applicable federal rate, IRC §7872 can impute interest.'],
      approvals: 'Automatic under the note; finance confirms.',
      objectives: ['tax-planning', 'governance', 'asset-protection'],
    },
    notes: interestPaidInCash ? [] : ['PropCo did not hold enough cash after closing; interest is accrued and must be serviced from rental income (not modelled here).'],
  });

  return flows;
}

export interface EntityBalance { cash: number; assets: Record<string, number>; liabilities: Record<string, number>; totalAssets: number; totalLiabilities: number; equity: number }
export type Balances = Record<EntityId, EntityBalance>;

export function emptyBalances(): Balances {
  const out = {} as Balances;
  for (const e of ENTITIES) out[e.id] = { cash: 0, assets: {}, liabilities: {}, totalAssets: 0, totalLiabilities: 0, equity: 0 };
  return out;
}

/** Replay flows[0..upTo) into balances. */
export function applyFlows(flows: Flow[], upTo: number): Balances {
  const b = emptyBalances();
  for (let i = 0; i < Math.min(upTo, flows.length); i++) {
    for (const p of flows[i].postings) {
      const e = b[p.entity];
      if (p.account === 'Cash') e.cash = r2(e.cash + p.delta);
      else if (p.side === 'asset') e.assets[p.account] = r2((e.assets[p.account] ?? 0) + p.delta);
      else e.liabilities[p.account] = r2((e.liabilities[p.account] ?? 0) + p.delta);
    }
  }
  for (const e of ENTITIES) {
    const x = b[e.id];
    x.totalAssets = r2(x.cash + Object.values(x.assets).reduce((s, v) => s + v, 0));
    x.totalLiabilities = r2(Object.values(x.liabilities).reduce((s, v) => s + v, 0));
    x.equity = r2(x.totalAssets - x.totalLiabilities);
  }
  return b;
}

/** Sum of all cash across every entity, internal and external. Always zero: money moves, it is not created. */
export function totalCash(b: Balances): number {
  return r2(ENTITIES.reduce((s, e) => s + b[e.id].cash, 0));
}
