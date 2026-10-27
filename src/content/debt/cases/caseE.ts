import type { DebtCase, CaseDebt } from '../types';

const portfolioToday: CaseDebt[] = [
  { name: 'Logistics park senior mortgage', lender: 'Life insurance company', principal: 18_500_000, annualRate: 0.0545, termMonths: 84, structure: 'balloon', amortizationMonths: 300, collateral: 'Logistics park (3 buildings)', guarantee: 'Nonrecourse with carve-outs', maturityYear: 2 },
  { name: 'Office tower CMBS loan', lender: 'CMBS trust', principal: 32_000_000, annualRate: 0.0495, termMonths: 120, structure: 'interest-only', collateral: 'Office tower', guarantee: 'Nonrecourse with carve-outs; defeasance on prepayment', maturityYear: 2 },
  { name: 'Hotel acquisition loan', lender: 'Regional bank', principal: 14_000_000, annualRate: 0.0825, termMonths: 60, structure: 'balloon', amortizationMonths: 300, collateral: 'Hotel; FF&E', guarantee: 'Full recourse to Family Holdings LP', maturityYear: 3 },
  { name: 'Industrial portfolio floating-rate bridge', lender: 'Debt fund', principal: 22_000_000, annualRate: 0.0875, termMonths: 36, structure: 'interest-only', collateral: '6 industrial assets', guarantee: 'Family Holdings LP; cross-default to logistics mortgage', maturityYear: 1, note: 'SOFR + 400; cap at 5.0% SOFR expired' },
  { name: 'Operating business revolver', lender: 'Commercial bank syndicate', principal: 9_000_000, annualRate: 0.0775, termMonths: 36, structure: 'interest-only', collateral: 'All assets of OpCo', guarantee: 'None (OpCo standalone)', maturityYear: 3 },
  { name: 'Securities-backed line (family office)', lender: 'Private bank', principal: 11_000_000, annualRate: 0.065, termMonths: 12, structure: 'interest-only', collateral: 'Marketable securities ($38M)', guarantee: 'Callable; margin maintenance', maturityYear: 0 },
  { name: 'Intra-family GRAT note', lender: 'Grantor (related party)', principal: 6_500_000, annualRate: 0.044, termMonths: 108, structure: 'amortizing', collateral: 'Unsecured; trust assets', guarantee: 'None', maturityYear: 9, note: 'Rate fixed at §7520 rate at funding' },
];

const portfolioLaddered: CaseDebt[] = [
  { name: 'Logistics park senior mortgage (refinanced)', lender: 'Life insurance company', principal: 17_800_000, annualRate: 0.059, termMonths: 144, structure: 'balloon', amortizationMonths: 300, collateral: 'Logistics park', guarantee: 'Nonrecourse with carve-outs; cross-default removed', maturityYear: 12 },
  { name: 'Office tower loan (paid down + extended)', lender: 'Bank club deal', principal: 24_000_000, annualRate: 0.071, termMonths: 60, structure: 'amortizing', collateral: 'Office tower', guarantee: 'Nonrecourse; 25% recourse completion of re-leasing capex', maturityYear: 5, note: '$8M paid down from securities-line and asset sale' },
  { name: 'Hotel loan (extended)', lender: 'Regional bank', principal: 13_200_000, annualRate: 0.0825, termMonths: 84, structure: 'balloon', amortizationMonths: 300, collateral: 'Hotel; FF&E', guarantee: 'Limited to 25% of principal', maturityYear: 7 },
  { name: 'Industrial portfolio permanent loan', lender: 'Agency / life co', principal: 19_000_000, annualRate: 0.0615, termMonths: 120, structure: 'balloon', amortizationMonths: 360, collateral: '5 industrial assets (1 sold)', guarantee: 'Nonrecourse with carve-outs', maturityYear: 10, note: 'Fixed rate replaces floating bridge' },
  { name: 'Operating business revolver (renewed)', lender: 'Commercial bank syndicate', principal: 7_500_000, annualRate: 0.0775, termMonths: 48, structure: 'interest-only', collateral: 'OpCo assets', guarantee: 'None', maturityYear: 4 },
  { name: 'Securities-backed line (reduced)', lender: 'Private bank', principal: 4_000_000, annualRate: 0.065, termMonths: 12, structure: 'interest-only', collateral: 'Marketable securities ($36M)', guarantee: 'Callable', maturityYear: 0, note: 'Held as liquidity facility, not funding' },
  { name: 'Intra-family GRAT note', lender: 'Grantor (related party)', principal: 5_900_000, annualRate: 0.044, termMonths: 96, structure: 'amortizing', maturityYear: 8 },
];

const caseE: DebtCase = {
  id: 'E',
  slug: 'institutional-family',
  title: 'The Institutional Family',
  persona: 'The Varga family office: $210M of assets across real estate, an operating company and a securities portfolio, with $113M of debt from seven lenders — and $72M of it maturing in the next two years.',
  summary: 'A multimillion-dollar financing portfolio viewed the way a credit committee would view it: maturity ladder, lender concentration, guarantee exposure and collateral. The family re-staggers maturities, replaces floating with fixed where it matters, retires a cross-default, and adopts a written debt policy.',
  objectives: ['governance', 'asset-protection', 'succession', 'estate-planning'],
  relatedLessons: [3, 5, 7, 9],
  relatedTools: [{ to: '/debt-credit-studio/dashboard', label: 'Debt Dashboard' }, { to: '/debt-credit-studio/capital-stack', label: 'Capital Stack' }, { to: '/debt-credit-studio/stress-test', label: 'Stress Test' }],
  stages: [
    {
      id: 'e1', title: 'The portfolio as the lenders see it', timing: 'Today',
      narrative: [
        'The family office tracks each asset’s performance carefully and its debt casually — each loan was negotiated by whoever ran that deal. When the new CFO builds the first consolidated debt schedule, three things are visible that were not before. First, a **maturity wall**: $72.5M of the $113M matures within two years, including the $32M office CMBS loan at a 4.95% coupon that cannot be replicated today. Second, **rate exposure**: the $22M industrial bridge floats at SOFR + 400 and its rate cap expired; debt service has risen about $900,000 a year. Third, **connections**: the bridge cross-defaults to the logistics mortgage, the hotel loan is full recourse to the family partnership, and the securities-backed line — used as permanent funding for a private-equity commitment — is callable on a market decline.',
        'Weighted-average cost of debt is about 6.4%; weighted-average remaining term about 3.1 years. Portfolio LTV is roughly 54%, which looks conservative — until the office tower, 30% vacant, is marked to a realistic value and its own LTV is seen to be above 80%.',
      ],
      balanceSheet: { assets: [{ label: 'Logistics park', value: 31_000_000 }, { label: 'Office tower (marked down)', value: 38_000_000 }, { label: 'Hotel', value: 22_000_000 }, { label: 'Industrial portfolio (6)', value: 36_000_000 }, { label: 'Operating company (equity value)', value: 28_000_000 }, { label: 'Marketable securities', value: 38_000_000 }, { label: 'Private funds and other', value: 17_000_000 }], liabilities: portfolioToday.map((d) => ({ label: d.name, value: d.principal })) },
      cashFlow: [{ label: 'Real estate NOI (all assets)', value: 9_400_000 }, { label: 'Operating company distributions', value: 2_600_000 }, { label: 'Portfolio income', value: 1_100_000 }, { label: 'Interest (all facilities)', value: -7_250_000 }, { label: 'Scheduled principal', value: -1_480_000 }, { label: 'Family distributions and office costs', value: -3_200_000 }],
      debts: portfolioToday,
      tradeoffs: ['Each loan was individually sensible; the portfolio was never underwritten as a whole.', 'The CMBS coupon is attractive to keep but the maturity is fixed and defeasance makes early action expensive.'],
      warnings: ['$72.5M maturing in two years is a refinancing wall in a higher-rate market.', 'The hotel loan’s full recourse and the bridge’s cross-default connect the family partnership to the two weakest assets.', 'A securities-backed line funding an illiquid commitment is a margin call waiting for a market decline.'],
      metrics: [{ label: 'Maturing within 24 months', value: '$72.5M (64%)', tone: 'red' }, { label: 'Floating-rate, unhedged', value: '$33M', tone: 'red' }, { label: 'Portfolio LTV', value: '≈54%', tone: 'gold' }, { label: 'Office LTV (marked)', value: '>80%', tone: 'red' }],
    },
    {
      id: 'e2', title: 'Triage: what breaks first under stress', timing: 'Month 2',
      narrative: [
        'The CFO runs the whole book through a stress case: SOFR +200bp, values −15%, NOI −10%. The bridge’s DSCR falls to about 0.9×, which breaches its covenant and — through the cross-default — puts the logistics mortgage into technical default. The office tower, at a stressed value, cannot refinance its $32M balance: a lender wanting 1.25× DSCR and 65% LTV on stressed NOI would advance perhaps $17M. The securities line’s collateral falls to $32M against an $11M balance — not a margin call yet, but the bank’s advance rate on the concentrated position would tighten. The hotel covers but its recourse means the partnership is on the hook for any shortfall.',
        'The family council sees the picture for the first time as a system rather than a list. Two questions follow: what liquidity do we need to carry the office tower through a refinancing gap of roughly $15M, and which connections must be cut first? The answer to the first is that the securities line is the wrong tool — it is callable at the same moment it would be needed — and the family needs unencumbered liquidity instead.',
      ],
      balanceSheet: { assets: [{ label: 'Real estate (stressed −15%)', value: 107_950_000 }, { label: 'Operating company', value: 28_000_000 }, { label: 'Marketable securities (−15%)', value: 32_300_000 }, { label: 'Private funds and other', value: 17_000_000 }], liabilities: portfolioToday.map((d) => ({ label: d.name, value: d.principal })) },
      cashFlow: [{ label: 'Real estate NOI (stressed −10%)', value: 8_460_000 }, { label: 'Operating company distributions', value: 2_600_000 }, { label: 'Portfolio income', value: 1_100_000 }, { label: 'Interest (SOFR +200bp on floating)', value: -7_910_000 }, { label: 'Scheduled principal', value: -1_480_000 }, { label: 'Family distributions and office costs', value: -3_200_000 }],
      debts: portfolioToday,
      decision: { question: 'Where does the first $20M of effort go?', options: [{ label: 'Pay down the office loan to make it refinanceable', consequence: 'Addresses the largest maturity, but defeasance costs on the CMBS loan are punitive before maturity; better to prepare the paydown for the maturity date.', tone: 'amber' }, { label: 'Refinance the floating bridge into fixed permanent debt and sell one industrial asset', consequence: 'Removes the rate exposure and the cross-default, and raises $9M of equity from a non-core sale. Chosen first.', tone: 'green' }, { label: 'Draw more on the securities line to hold cash', consequence: 'Increases dependence on a callable facility whose collateral falls in the same scenario that creates the need.', tone: 'red' }] },
      tradeoffs: ['Fixing the bridge costs about 60bp of margin today versus the current floating rate — the price of removing a 0.9× stressed DSCR and a cross-default.', 'Selling an industrial asset realizes a taxable gain; the family accepts it to buy the office tower time.'],
      warnings: ['A stress test is not a forecast. It is the identification of which facility fails first and what cures it.', 'Recourse and cross-default clauses, not rates, decide whether a stress is contained.'],
      metrics: [{ label: 'Bridge DSCR (stressed)', value: '≈0.9×', tone: 'red' }, { label: 'Office refinancing gap (stressed)', value: '≈$15M', tone: 'red' }, { label: 'Facilities in technical default (stressed)', value: '2 (via cross-default)', tone: 'red' }],
    },
    {
      id: 'e3', title: 'Re-laddering the book', timing: 'Months 3–20',
      narrative: [
        'Over eighteen months the office executes the plan. The industrial bridge is replaced with a $19M ten-year fixed-rate permanent loan at 6.15% after one asset is sold for $9M; the cross-default to the logistics park dies with the bridge. The logistics mortgage is refinanced two years early with its existing lender into a twelve-year loan at 5.9% — a higher coupon than 5.45%, accepted for the term. At the CMBS maturity the office tower is refinanced into a $24M five-year amortizing bank loan after an $8M paydown funded by the industrial sale proceeds and a partial drawdown on the securities line that is then repaid from the operating company’s special distribution; the recourse is limited to completion of a re-leasing capital plan. The hotel loan is extended seven years with the guarantee cut to 25% of principal. The securities-backed line is reduced to $4M and reclassified as a standby liquidity facility.',
        'The result: weighted-average remaining term rises from 3.1 to about 7.6 years, no more than $24M matures in any single year, floating unhedged debt falls to zero, and the only cross-default clause in the book is gone. Weighted-average cost of debt rises from 6.4% to about 6.6% — the family paid roughly $220,000 a year for a book that can survive the stress case.',
      ],
      balanceSheet: { assets: [{ label: 'Logistics park', value: 31_000_000 }, { label: 'Office tower', value: 38_000_000 }, { label: 'Hotel', value: 22_000_000 }, { label: 'Industrial portfolio (5)', value: 30_000_000 }, { label: 'Operating company', value: 28_000_000 }, { label: 'Marketable securities', value: 36_000_000 }, { label: 'Unencumbered liquidity reserve', value: 7_500_000 }, { label: 'Private funds and other', value: 17_000_000 }], liabilities: portfolioLaddered.map((d) => ({ label: d.name, value: d.principal })) },
      cashFlow: [{ label: 'Real estate NOI', value: 8_900_000 }, { label: 'Operating company distributions', value: 2_600_000 }, { label: 'Portfolio income', value: 1_050_000 }, { label: 'Interest (all facilities)', value: -6_050_000 }, { label: 'Scheduled principal', value: -1_950_000 }, { label: 'Family distributions and office costs', value: -3_200_000 }],
      debts: portfolioLaddered,
      tradeoffs: ['Longer term cost coupon; fixed cost spread; limiting recourse cost LTV. Each was a conscious purchase of resilience.', 'Selling an industrial asset and taking a special distribution from the operating company reduced the family’s growth assets to de-risk the real estate book.'],
      warnings: ['Re-leasing the office tower is now the binding operational risk; the limited recourse is tied to funding that plan.', 'A $7.5M unencumbered reserve is about 11 months of total debt service — the policy target is 18.'],
      metrics: [{ label: 'Weighted-average term', value: '3.1 → 7.6 yrs', tone: 'green' }, { label: 'Max maturing in one year', value: '$24M', tone: 'gold' }, { label: 'Floating unhedged', value: '$0', tone: 'green' }, { label: 'Cost of debt', value: '6.4% → 6.6%', tone: 'amber' }],
    },
    {
      id: 'e4', title: 'Writing it down: the family debt policy', timing: 'Year 2',
      narrative: [
        'The council adopts a debt policy as a schedule to the family constitution. Group LTV not to exceed 50% on marked values and 60% in a stressed case; no single asset above 65% LTV. Minimum DSCR of 1.35× at the asset level under the policy stress (rates +200bp, NOI −10%). No more than 25% of debt maturing in any rolling twelve months. Floating-rate exposure hedged to at least 75%. No guarantee by the family partnership or the holding company of any subsidiary’s debt above $5M without council approval; no cross-default or cross-collateral between entities. An unencumbered liquidity reserve of at least 18 months of consolidated debt service. A quarterly debt report — maturity ladder, covenant headroom, guarantee schedule, hedge positions — to the council, and a lender-concentration limit of 35% with any single institution.',
        'The policy’s most important sentence is procedural: no new facility is signed until the CFO has run it through the group stress case and the council has seen the ladder with the new loan on it. The next generation inherits not just the assets and the debts, but the method.',
      ],
      balanceSheet: { assets: [{ label: 'Real estate', value: 121_000_000 }, { label: 'Operating company', value: 28_000_000 }, { label: 'Marketable securities', value: 36_000_000 }, { label: 'Unencumbered liquidity reserve', value: 12_000_000 }, { label: 'Private funds and other', value: 17_000_000 }], liabilities: portfolioLaddered.map((d) => ({ label: d.name, value: d.principal })) },
      cashFlow: [{ label: 'Real estate NOI', value: 9_300_000 }, { label: 'Operating company distributions', value: 2_600_000 }, { label: 'Portfolio income', value: 1_100_000 }, { label: 'Interest', value: -6_000_000 }, { label: 'Scheduled principal', value: -1_950_000 }, { label: 'Family distributions and office costs', value: -3_200_000 }],
      debts: portfolioLaddered,
      tradeoffs: ['A policy constrains the next great deal. That is its purpose.', 'Hedging costs money every year it is not needed; the policy treats it as insurance, not a trade.'],
      warnings: ['Policies erode one exception at a time. The council minutes every exception with the reason.', 'Guarantee and covenant schedules must be maintained continuously; a stale schedule is more dangerous than none.'],
      metrics: [{ label: 'Group LTV (policy ≤50%)', value: '≈44%', tone: 'green' }, { label: 'Liquidity reserve (policy 18 mo)', value: '≈18 months', tone: 'green' }, { label: 'Lender concentration (policy ≤35%)', value: '≈28%', tone: 'green' }],
    },
  ],
  takeaways: [
    'A portfolio of individually sensible loans can be collectively fragile: maturity walls, unhedged floating exposure and cross-default clauses are portfolio properties, not loan properties.',
    'Stress-test the whole book, identify what fails first, and cut the connections before refinancing the balances.',
    'Resilience has a price — a higher coupon, a lower LTV, an asset sold — and the family should buy it deliberately and record why.',
    'The lasting asset is the written policy and the quarterly report: the next generation inherits the method, not just the ladder.',
  ],
};
export default caseE;
