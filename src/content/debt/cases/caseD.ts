import type { DebtCase, CaseEntitySheet } from '../types';

const holdingBefore: CaseEntitySheet = { name: 'Okonkwo Family Holding Ltd', kind: 'holding', assets: [{ label: 'Cash', value: 1_200_000 }, { label: 'Shares in subsidiaries (at cost)', value: 2_600_000 }, { label: 'Listed investments', value: 1_800_000 }], liabilities: [{ label: 'Bank facility', value: 0 }] };
const opBefore: CaseEntitySheet = { name: 'Okonkwo Foods (Operating Co)', kind: 'operating', assets: [{ label: 'Cash', value: 180_000 }, { label: 'Receivables and inventory', value: 1_450_000 }, { label: 'Plant and equipment', value: 2_100_000 }], liabilities: [{ label: 'Bank term loan (parent guarantee)', value: 1_400_000 }, { label: 'Overdraft (parent guarantee)', value: 620_000 }, { label: 'Trade payables', value: 540_000 }] };
const propBefore: CaseEntitySheet = { name: 'Okonkwo Properties (Property Co)', kind: 'property', assets: [{ label: 'Cash', value: 60_000 }, { label: 'Warehouse and offices', value: 3_900_000 }], liabilities: [{ label: 'Commercial mortgage (cross-collateralized with Operating Co)', value: 2_300_000 }] };
const invBefore: CaseEntitySheet = { name: 'Okonkwo Capital (Investment Co)', kind: 'investment', assets: [{ label: 'Cash', value: 240_000 }, { label: 'Private investments', value: 2_200_000 }], liabilities: [{ label: 'Securities-backed line (cross-default to group)', value: 900_000 }] };

const holdingAfter: CaseEntitySheet = { name: 'Okonkwo Family Holding Ltd', kind: 'holding', assets: [{ label: 'Cash', value: 400_000 }, { label: 'Shares in subsidiaries (at cost)', value: 3_200_000 }, { label: 'Listed investments', value: 1_800_000 }, { label: 'Loan to Operating Co (note receivable)', value: 800_000, intercompany: true }, { label: 'Loan to Investment Co (note receivable)', value: 600_000, intercompany: true }], liabilities: [{ label: 'Bank facility (Holding, secured on listed investments)', value: 1_000_000 }] };
const opAfter: CaseEntitySheet = { name: 'Okonkwo Foods (Operating Co)', kind: 'operating', assets: [{ label: 'Cash', value: 260_000 }, { label: 'Receivables and inventory', value: 1_500_000 }, { label: 'Plant and equipment', value: 2_050_000 }], liabilities: [{ label: 'Bank term loan (no parent guarantee, Operating Co assets only)', value: 1_200_000 }, { label: 'Borrowing-base line', value: 380_000 }, { label: 'Loan from Holding (note payable, subordinated to bank)', value: 800_000, intercompany: true }, { label: 'Trade payables', value: 520_000 }] };
const propAfter: CaseEntitySheet = { name: 'Okonkwo Properties (Property Co)', kind: 'property', assets: [{ label: 'Cash', value: 140_000 }, { label: 'Warehouse and offices', value: 3_900_000 }], liabilities: [{ label: 'Commercial mortgage (Property Co only; tenant lease assigned)', value: 2_300_000 }] };
const invAfter: CaseEntitySheet = { name: 'Okonkwo Capital (Investment Co)', kind: 'investment', assets: [{ label: 'Cash', value: 180_000 }, { label: 'Private investments', value: 2_200_000 }], liabilities: [{ label: 'Loan from Holding (note payable)', value: 600_000, intercompany: true }, { label: 'Securities-backed line (no cross-default)', value: 300_000 }] };

const caseD: DebtCase = {
  id: 'D',
  slug: 'family-holding-company',
  title: 'The Family Holding Company',
  persona: 'The Okonkwo family: a food-processing business, a property company that owns its premises, an investment company and a holding company above them all. Three banks, four sets of loan documents, and a guarantee page in every one.',
  summary: 'Coordinating financing across operating, property and investment entities so that each borrows for its own purpose, the holding company acts as a documented family lender, and a problem in one company stays in one company. Both the entity-level balance sheets and the consolidated view are shown; intercompany debt eliminates on consolidation but remains legally real.',
  objectives: ['asset-protection', 'governance', 'tax-planning', 'succession'],
  relatedLessons: [2, 8, 9],
  relatedTools: [{ to: '/debt-credit-studio/financing-map', label: 'Financing Map' }, { to: '/family-bank', label: 'Family Bank Simulator' }],
  stages: [
    {
      id: 'd1', title: 'Four entities, one pocket', timing: 'Today',
      narrative: [
        'On paper the structure is textbook: a holding company owns an operating company, a property company and an investment company. In the loan files it is a single borrower. The operating company’s term loan and overdraft carry the holding company’s guarantee. The property company’s mortgage is cross-collateralized with the operating company’s plant. The investment company’s securities-backed line has a cross-default clause referencing “any member of the group”. The family’s accountant moves cash between the companies’ accounts as needed, with journal entries at year-end labelled “intercompany”.',
        'The consolidated view looks healthy — about $15.7M of assets against $5.8M of debt. Entity by entity it is fragile: the operating company carries $2.0M of bank debt on about $420,000 of EBITDA (4.8×), the overdraft is on demand, and every lender has a route to every asset. If the food business has a bad year, the mortgage lender can look to the plant, the securities lender can call the line, and the holding company pays on its guarantee from the cash that was meant to be the family’s reserve.',
      ],
      balanceSheet: { assets: [], liabilities: [] },
      entities: [holdingBefore, opBefore, propBefore, invBefore],
      cashFlow: [{ label: 'Operating Co EBITDA', value: 420_000 }, { label: 'Property Co rent (from Operating Co)', value: 312_000, note: 'intercompany; eliminates' }, { label: 'Investment Co income', value: 130_000 }, { label: 'Group interest', value: -445_000 }, { label: 'Group scheduled principal', value: -210_000 }],
      debts: [
        { name: 'Operating Co term loan', lender: 'Bank A', principal: 1_400_000, annualRate: 0.085, termMonths: 60, structure: 'amortizing', collateral: 'All Operating Co assets', guarantee: 'Holding Co guarantee (unlimited)', maturityYear: 5 },
        { name: 'Operating Co overdraft', lender: 'Bank A', principal: 620_000, annualRate: 0.11, termMonths: 12, structure: 'interest-only', collateral: 'Floating charge', guarantee: 'Holding Co guarantee', maturityYear: 0, note: 'On demand' },
        { name: 'Property Co mortgage', lender: 'Bank B', principal: 2_300_000, annualRate: 0.0725, termMonths: 84, structure: 'balloon', amortizationMonths: 240, collateral: 'Warehouse + cross-collateral over Operating Co plant', guarantee: 'Holding Co and Operating Co', maturityYear: 7 },
        { name: 'Investment Co securities-backed line', lender: 'Private Bank C', principal: 900_000, annualRate: 0.07, termMonths: 12, structure: 'interest-only', collateral: 'Pledged private investments and listed portfolio of Holding', guarantee: 'Holding Co; cross-default to any group facility', maturityYear: 0, note: 'Callable' },
      ],
      tradeoffs: ['Guarantees and cross-collateral bought cheaper, larger loans; the price is contagion.', 'Informal cash sweeps are convenient and destroy the separateness the structure was meant to provide.'],
      warnings: ['Operating Co leverage of 4.8× EBITDA with an on-demand overdraft is the weakest point — and it is connected to everything.', 'The holding company’s $1.2M cash is not a reserve; it is already pledged by guarantee.'],
      metrics: [{ label: 'Consolidated debt ÷ assets', value: '37%', tone: 'gold' }, { label: 'Operating Co debt ÷ EBITDA', value: '4.8×', tone: 'red' }, { label: 'Entities exposed to an Operating Co default', value: '4 of 4', tone: 'red' }],
    },
    {
      id: 'd2', title: 'The restructuring plan', timing: 'Months 1–9',
      narrative: [
        'The family engages a corporate-finance adviser and counsel, and sets three rules: each company borrows only for its own assets, on its own credit; the holding company guarantees nothing but may lend; every intra-group dealing is documented at arm’s length. Then they renegotiate. Bank A refinances the operating company’s debt as a $1.2M term loan plus a $600,000 borrowing-base line, secured on operating assets only and *without* the parent guarantee — in exchange for a lower leverage covenant (3.0×), the subordination of a new $800,000 holding-company loan, and a higher margin. Bank B agrees to release the cross-collateral over the plant once the holding company injects $400,000 of equity into Property Co and the operating company’s lease is assigned. Private Bank C reduces the investment company’s line to $300,000, secured only on Investment Co assets, with the cross-default clause removed.',
        'The holding company funds the plan with a $1,000,000 facility of its own, secured on its listed investments, and lends $800,000 to the operating company and $600,000 to the investment company under promissory notes at 7.0% (above the applicable AFR, below bank pricing), 7-year amortizing, with security agreements registered and board resolutions on both sides. Rent between Property Co and Operating Co is reset to an appraised market rent of $312,000 under a 10-year lease.',
      ],
      balanceSheet: { assets: [], liabilities: [] },
      entities: [holdingAfter, opAfter, propAfter, invAfter],
      cashFlow: [{ label: 'Operating Co EBITDA', value: 440_000 }, { label: 'Rent Operating Co → Property Co', value: 312_000, note: 'intercompany' }, { label: 'Interest Operating Co → Holding', value: 56_000, note: 'intercompany' }, { label: 'Interest Investment Co → Holding', value: 42_000, note: 'intercompany' }, { label: 'External interest (group)', value: -352_000 }, { label: 'External scheduled principal', value: -265_000 }],
      debts: [
        { name: 'Holding Co facility', lender: 'Bank B', principal: 1_000_000, annualRate: 0.0675, termMonths: 84, structure: 'amortizing', collateral: 'Listed investments of Holding', guarantee: 'None', maturityYear: 7 },
        { name: 'Operating Co term loan (refinanced)', lender: 'Bank A', principal: 1_200_000, annualRate: 0.09, termMonths: 72, structure: 'amortizing', collateral: 'Operating Co assets only', guarantee: 'None', maturityYear: 6, note: 'Holding loan subordinated' },
        { name: 'Operating Co borrowing-base line', lender: 'Bank A', principal: 380_000, annualRate: 0.095, termMonths: 12, structure: 'interest-only', collateral: 'Receivables and inventory', guarantee: 'None', maturityYear: 1 },
        { name: 'Holding → Operating Co note', lender: 'Okonkwo Family Holding (related party)', principal: 800_000, annualRate: 0.07, termMonths: 84, structure: 'amortizing', collateral: 'Second-ranking charge over equipment', guarantee: 'None', maturityYear: 7, note: 'Subordinated to Bank A; promissory note + board resolutions' },
        { name: 'Property Co mortgage', lender: 'Bank B', principal: 2_300_000, annualRate: 0.0725, termMonths: 84, structure: 'balloon', amortizationMonths: 240, collateral: 'Warehouse only; assignment of lease', guarantee: 'None', maturityYear: 7 },
        { name: 'Holding → Investment Co note', lender: 'Okonkwo Family Holding (related party)', principal: 600_000, annualRate: 0.07, termMonths: 84, structure: 'amortizing', collateral: 'Pledge of specified investments', maturityYear: 7 },
        { name: 'Investment Co securities-backed line', lender: 'Private Bank C', principal: 300_000, annualRate: 0.07, termMonths: 12, structure: 'interest-only', collateral: 'Investment Co assets only', guarantee: 'None', maturityYear: 0 },
      ],
      decision: { question: 'How should the holding company support the operating company’s refinancing?', options: [{ label: 'Keep guaranteeing; it is cheaper', consequence: 'Lowest margin, largest loan. Keeps every family asset in the chain behind the weakest company.', tone: 'red' }, { label: 'Inject equity into Operating Co', consequence: 'Cleanest separation; but the capital is permanently committed and ranks last. Chosen for Property Co, where a one-off injection unlocked the cross-collateral release.', tone: 'amber' }, { label: 'Lend under a documented, secured, subordinated note', consequence: 'Capital returns with interest; the holding company ranks ahead of equity and behind the bank; no guarantee. Chosen for Operating Co and Investment Co.', tone: 'green' }] },
      tradeoffs: ['Operating Co’s external debt is cheaper to the family as a whole but more expensive per facility — the margin rose 50bp to remove the guarantee.', 'Subordination means the family note is paid after Bank A; the family accepted equity-like risk in the operating company deliberately, and capped it at $800,000.'],
      warnings: ['Interest on the related-party notes must actually be paid and recorded; the first missed payment is the end of the argument that they are loans.', 'Transfer-pricing and interest-deductibility rules apply to intercompany interest — see Lesson 08 and the Jurisdictions page.'],
      metrics: [{ label: 'Operating Co debt ÷ EBITDA (external)', value: '3.6× → covenant 3.0× by year 2', tone: 'amber' }, { label: 'Parent guarantees outstanding', value: '0', tone: 'green' }, { label: 'Cross-default clauses', value: '0', tone: 'green' }],
    },
    {
      id: 'd3', title: 'Two views of one family', timing: 'Year 1',
      narrative: [
        'The family council now receives two reports. The **entity view** shows each company’s own balance sheet with the intercompany notes as real assets and liabilities, each lender’s collateral confined to its borrower, and each company’s coverage ratio. The **consolidated view** eliminates the $1,400,000 of intercompany notes (receivable at Holding, payable at Operating Co and Investment Co) and the intercompany rent, and shows the family what it owns and owes to the outside world: about $16.0M of assets and $5.2M of external debt.',
        'Both views are true and they answer different questions. The consolidated view answers “how rich are we and how leveraged, as a family?” The entity view answers “if this company fails, what do we lose?” — and the answer is now “that company’s equity and the family note, nothing else.” The consolidated numbers are never shown to a lender or a court as the legal position; each entity’s own statements are.',
      ],
      balanceSheet: { assets: [], liabilities: [] },
      entities: [holdingAfter, opAfter, propAfter, invAfter],
      cashFlow: [{ label: 'Consolidated EBITDA (external)', value: 570_000 }, { label: 'External interest', value: -352_000 }, { label: 'External scheduled principal', value: -265_000 }, { label: 'Distributions to family', value: -120_000 }],
      debts: [],
      tradeoffs: ['Two bookkeeping systems and a consolidation every quarter: real cost, real discipline.', 'Eliminations only balance if every intercompany entry has a mirror on the other side — the consolidation is also an audit of the documentation.'],
      warnings: ['Intercompany balances that do not reconcile are the first thing a lender’s field examiner — or a bankruptcy trustee — will find.'],
      metrics: [{ label: 'Intercompany debt eliminated', value: '$1.4M', tone: 'gold' }, { label: 'External debt ÷ consolidated assets', value: '≈32%', tone: 'green' }, { label: 'Entities reachable from an Operating Co default', value: '1 (plus family note)', tone: 'green' }],
    },
    {
      id: 'd4', title: 'A bad year at the food business', timing: 'Year 3',
      narrative: [
        'A contamination recall costs the operating company $600,000 and a quarter of its revenue. EBITDA falls to $190,000; the leverage covenant (3.0×) is breached and Bank A issues a reservation-of-rights letter. Under the old structure, this is the moment the holding company’s guarantee is called, the property mortgage lender looks to the plant, and the private bank calls the investment line. Under the new structure, Bank A’s remedies are confined to the operating company: it negotiates a waiver, a 100-basis-point margin increase and a cash sweep. The holding company — which has $400,000 of unpledged cash and no guarantee — chooses to defer two payments on its subordinated note and to inject $250,000 of new equity, documented by a forbearance agreement and a subscription resolution.',
        'Property Co collects its rent (two months late, with interest under the lease). Investment Co is untouched. The family lost a difficult year and some equity in one company. Under the earlier structure the same event would have put $15.7M of assets in play across three lenders at once.',
      ],
      balanceSheet: { assets: [], liabilities: [] },
      entities: [
        { ...holdingAfter, assets: [{ label: 'Cash', value: 150_000 }, { label: 'Shares in subsidiaries (at cost)', value: 3_450_000 }, { label: 'Listed investments', value: 1_800_000 }, { label: 'Loan to Operating Co (note receivable)', value: 640_000, intercompany: true }, { label: 'Loan to Investment Co (note receivable)', value: 440_000, intercompany: true }], liabilities: [{ label: 'Bank facility (Holding)', value: 740_000 }] },
        { ...opAfter, assets: [{ label: 'Cash', value: 90_000 }, { label: 'Receivables and inventory', value: 1_150_000 }, { label: 'Plant and equipment', value: 1_900_000 }], liabilities: [{ label: 'Bank term loan (waiver; cash sweep)', value: 900_000 }, { label: 'Borrowing-base line', value: 420_000 }, { label: 'Loan from Holding (note payable; 2 payments deferred)', value: 640_000, intercompany: true }, { label: 'Trade payables', value: 610_000 }] },
        propAfter,
        { ...invAfter, liabilities: [{ label: 'Loan from Holding (note payable)', value: 440_000, intercompany: true }, { label: 'Securities-backed line', value: 300_000 }] },
      ],
      cashFlow: [{ label: 'Operating Co EBITDA (recall year)', value: 190_000 }, { label: 'Operating Co debt service (bank)', value: -330_000 }, { label: 'Holding equity injection into Operating Co', value: -250_000 }, { label: 'Property Co rent received (late)', value: 312_000, note: 'intercompany' }],
      debts: [
        { name: 'Operating Co term loan (waived covenant)', lender: 'Bank A', principal: 900_000, annualRate: 0.10, termMonths: 48, structure: 'amortizing', collateral: 'Operating Co assets only', guarantee: 'None', maturityYear: 4, note: 'Cash sweep of 50% excess cash flow' },
        { name: 'Holding → Operating Co note (forbearance)', lender: 'Okonkwo Family Holding', principal: 640_000, annualRate: 0.07, termMonths: 60, structure: 'amortizing', guarantee: 'None', maturityYear: 5, note: 'Two payments deferred and documented' },
      ],
      tradeoffs: ['The family could have let the operating company fail and kept everything else; it chose to support it with a capped, documented injection.', 'The waiver cost 100bp and a cash sweep — the price of the covenant breach, confined to one company.'],
      warnings: ['Forbearance on a family note must be documented like a bank’s; undocumented “we’ll sort it out” converts the note into equity in a creditor’s eyes.', 'Equity injected into a distressed company ranks behind every creditor; the family capped it for that reason.'],
      metrics: [{ label: 'Assets exposed to the recall', value: 'Operating Co only', tone: 'green' }, { label: 'Family capital at risk', value: '≈$890K (note + injection)', tone: 'amber' }, { label: 'Property Co and Investment Co', value: 'Unaffected', tone: 'green' }],
    },
  ],
  takeaways: [
    'A holding structure provides separation only if the financing respects it: no parent guarantees, no cross-collateral, no cross-default, no informal sweeps.',
    'The holding company can act as a family bank — lending under documented, secured, priced notes — and keep its own balance sheet clean of guarantees.',
    'Entity-level and consolidated reports answer different questions; intercompany debt eliminates in one and is enforceable in the other.',
    'Separation costs margin and administration. The family paid it, and the recall year showed what it bought.',
  ],
};
export default caseD;
