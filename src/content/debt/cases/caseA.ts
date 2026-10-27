import type { DebtCase } from '../types';

const caseA: DebtCase = {
  id: 'A',
  slug: 'salaried-professional',
  title: 'The Salaried Professional',
  persona: 'Amara, 31, a hospital pharmacist earning $118,000 with a student loan, one credit card and no investment property — yet.',
  summary: 'From a thin credit file to a first financed rental in four years. The binding constraint turns out to be debt-to-income, not the down payment, and the first loan the lender offers is not the one she takes.',
  objectives: ['governance', 'asset-protection'],
  relatedLessons: [1, 2, 5, 7],
  relatedTools: [{ to: '/debt-credit-studio/credit-profile', label: 'Credit Profile' }, { to: '/debt-credit-studio/leverage', label: 'Leverage Calculator' }],
  stages: [
    {
      id: 'a1', title: 'Thin file', timing: 'Year 0',
      narrative: [
        'Amara’s credit report has two tradelines: a $42,000 federal student loan (always paid on time) and a $6,000-limit card she pays in full most months — but the statement cuts on the 3rd and she pays on the 10th, so her reported utilization is routinely 60–70%. Her score sits in the high 600s. No late payments, no collections; just a short, thin history and high reported utilization.',
        'Her plan is to buy a rental in three years. The first move costs nothing: pay the card before the statement date so reported utilization falls below 10%, keep the account open, and add one more revolving line she will barely use. She pulls her three bureau files and finds a paid medical collection that should not be there; she disputes it in writing under the FCRA and it is removed in 28 days.',
      ],
      balanceSheet: { assets: [{ label: 'Checking and savings', value: 14_000 }, { label: 'Retirement account', value: 38_000 }, { label: 'Car (owned)', value: 9_000 }], liabilities: [{ label: 'Federal student loan', value: 42_000 }, { label: 'Credit card balance (reported)', value: 4_100 }] },
      cashFlow: [{ label: 'Salary (gross)', value: 118_000 }, { label: 'Taxes and benefits', value: -31_000 }, { label: 'Living costs', value: -46_000 }, { label: 'Student loan payments', value: -5_400 }, { label: 'Savings', value: -35_600, note: 'residual' }],
      debts: [{ name: 'Federal student loan', lender: 'US Dept. of Education servicer', principal: 42_000, annualRate: 0.055, termMonths: 120, structure: 'amortizing', note: 'Standard 10-year repayment; $456/month' }],
      tradeoffs: ['Paying the card before the statement date costs nothing and fixes the heaviest fast-moving factor.', 'Paying off the student loan early would lower DTI but drain the down-payment fund; she keeps it.'],
      warnings: ['Do not close the old card to “clean up” — it shortens average account age.', 'Do not buy tradelines or use a “credit privacy number”; both are misrepresentation.'],
      metrics: [{ label: 'Score band', value: 'High 600s', tone: 'amber' }, { label: 'Reported utilization', value: '65%', tone: 'red' }, { label: 'DTI (back-end)', value: '5%', tone: 'green' }],
    },
    {
      id: 'a2', title: 'Pre-approval reality', timing: 'Year 2',
      narrative: [
        'Two years on: utilization under 10%, a second card, score in the mid-700s, $58,000 saved. She goes to a bank for a pre-approval on a $340,000 duplex she would live in half of. The lender’s automated underwriting counts her $9,833 gross monthly income, her $456 student loan payment and the proposed housing payment. At 20% down, the payment on a $272,000 loan at 6.75% is about $1,764 plus roughly $520 of taxes and insurance; the lender gives her 75% credit for the projected $1,600 rent on the other unit.',
        'Back-end DTI comes to roughly 15% — comfortable. The surprise is elsewhere: the lender wants six months of reserves after closing, and her $58,000 covers the $68,000 down payment only if she borrows from her retirement plan. She decides to wait a year and keep saving rather than start her investing life with a second loan against her pension.',
      ],
      balanceSheet: { assets: [{ label: 'Savings (down-payment fund)', value: 58_000 }, { label: 'Retirement account', value: 61_000 }, { label: 'Car', value: 6_500 }], liabilities: [{ label: 'Federal student loan', value: 35_200 }, { label: 'Credit cards (reported)', value: 600 }] },
      cashFlow: [{ label: 'Salary (gross)', value: 124_000 }, { label: 'Taxes and benefits', value: -33_000 }, { label: 'Living costs', value: -47_000 }, { label: 'Student loan payments', value: -5_400 }, { label: 'Savings', value: -38_600, note: 'residual' }],
      debts: [{ name: 'Federal student loan', lender: 'Servicer', principal: 35_200, annualRate: 0.055, termMonths: 96, structure: 'amortizing' }],
      decision: { question: 'Borrow $10,000 from the retirement plan to close now, or wait a year?', options: [{ label: 'Borrow from the plan and buy now', consequence: 'Closes a year earlier; adds a second repayment obligation and leaves no reserves. If the tenant unit sits empty for three months she is paying two loans from salary.', tone: 'amber' }, { label: 'Wait one year and keep saving', consequence: 'Loses a year of possible appreciation (or avoids a year of possible decline); arrives with full down payment and reserves. She chooses this.', tone: 'green' }] },
      tradeoffs: ['Owner-occupied financing is cheaper and allows lower down payments than investor financing — living in the duplex is the lever.', 'Lenders credit only part of projected rent; her plan must work on 75% of it.'],
      warnings: ['Post-closing reserves are a real lender requirement, not a formality.', 'A retirement-plan loan is still debt and often must be repaid immediately on job change.'],
      metrics: [{ label: 'Score band', value: 'Mid 700s', tone: 'green' }, { label: 'Back-end DTI', value: '≈15%', tone: 'green' }, { label: 'Reserves after closing', value: '0 months', tone: 'red' }],
    },
    {
      id: 'a3', title: 'First financed property', timing: 'Year 3',
      narrative: [
        'With $76,000 saved she closes on the duplex at $345,000 with 20% down ($69,000) and $7,000 in closing costs, keeping $9,000 of reserves plus a new $15,000 emergency line of credit she never draws. The 30-year fixed loan of $276,000 at 6.5% costs about $1,745 a month in principal and interest; taxes and insurance add $540. The other unit rents for $1,650.',
        'Her all-in housing cost is about $2,285 against $1,650 of rent: she pays roughly $635 a month to live in a property that is building equity — about $3,000 of principal in year one — and that she could rent out entirely later. The DSCR on the whole building, were she to move out and rent both sides at $1,650, would be about ($39,600 − $12,000 expenses) ÷ $20,940 ≈ 1.32×. That number is the one she tracks, because it is what makes the property stand on its own.',
      ],
      balanceSheet: { assets: [{ label: 'Duplex (purchase price)', value: 345_000 }, { label: 'Cash reserves', value: 9_000 }, { label: 'Retirement account', value: 74_000 }], liabilities: [{ label: 'Mortgage (30-yr fixed 6.5%)', value: 276_000 }, { label: 'Federal student loan', value: 31_300 }] },
      cashFlow: [{ label: 'Salary (gross)', value: 128_000 }, { label: 'Rent from unit B', value: 19_800 }, { label: 'Taxes and benefits', value: -34_000 }, { label: 'Mortgage P&I', value: -20_940 }, { label: 'Property tax, insurance, maintenance', value: -9_500 }, { label: 'Living costs (ex-housing)', value: -36_000 }, { label: 'Student loan payments', value: -5_400 }, { label: 'Savings', value: -41_960, note: 'residual' }],
      debts: [{ name: 'Mortgage — duplex', lender: 'Regional bank (conforming)', principal: 276_000, annualRate: 0.065, termMonths: 360, structure: 'amortizing', collateral: 'First lien on the duplex', guarantee: 'Personal (borrower is the individual)', maturityYear: 30 }, { name: 'Federal student loan', lender: 'Servicer', principal: 31_300, annualRate: 0.055, termMonths: 84, structure: 'amortizing' }],
      tradeoffs: ['A 15-year loan would build equity faster but raise the payment to about $2,400 and strain DTI for the next purchase.', 'She keeps the loan in her own name; a transfer to an LLC later would require lender consent (due-on-sale).'],
      warnings: ['Owner-occupancy certifications are binding — she must live there for the required period.', 'One vacancy month costs $1,650; reserves of $9,000 cover about four months of the full payment.'],
      metrics: [{ label: 'LTV', value: '80%', tone: 'gold' }, { label: 'Whole-building DSCR (if fully rented)', value: '≈1.32×', tone: 'green' }, { label: 'Year-1 principal paid', value: '≈$3,000' }],
    },
    {
      id: 'a4', title: 'Second property or pay down?', timing: 'Year 6',
      narrative: [
        'Three years later the duplex is worth about $390,000, the balance is $265,000 and she has $62,000 saved. Her lender offers two paths: a cash-out refinance to 75% LTV ($292,500 new loan, about $20,000 net after payoff and costs, at 7.1%), or a conventional investor loan on a second property with 25% down. A friend suggests a DSCR loan that ignores her income entirely.',
        'She runs the numbers in the Leverage Calculator. The cash-out raises her payment on the duplex by about $220 a month for $20,000 she does not need yet. The DSCR loan prices 1.25 points higher with a prepayment penalty. The conventional investor loan on a $300,000 single-family at 25% down, 7.0%, has a payment of $1,497 against rent of $2,100 and expenses of $600 — barely positive — and would push her DTI to about 34% because lenders count only 75% of the rent. She buys it, keeps the duplex loan untouched, and holds $24,000 in reserves across both properties. The decision she records: “No cash-out until the second property has a two-year rental history.”',
      ],
      balanceSheet: { assets: [{ label: 'Duplex (market value)', value: 390_000 }, { label: 'Single-family rental', value: 300_000 }, { label: 'Cash reserves', value: 24_000 }, { label: 'Retirement account', value: 112_000 }], liabilities: [{ label: 'Mortgage — duplex', value: 265_000 }, { label: 'Mortgage — single-family (7.0%)', value: 225_000 }, { label: 'Federal student loan', value: 18_000 }] },
      cashFlow: [{ label: 'Salary (gross)', value: 136_000 }, { label: 'Rent — duplex unit B', value: 21_000 }, { label: 'Rent — single-family', value: 25_200 }, { label: 'Taxes and benefits', value: -36_000 }, { label: 'Mortgage P&I (both)', value: -38_900 }, { label: 'Property costs (both)', value: -16_700 }, { label: 'Living costs', value: -38_000 }, { label: 'Student loan payments', value: -5_400 }, { label: 'Savings', value: -47_200, note: 'residual' }],
      debts: [{ name: 'Mortgage — duplex', lender: 'Regional bank', principal: 265_000, annualRate: 0.065, termMonths: 324, structure: 'amortizing', collateral: 'Duplex', maturityYear: 27 }, { name: 'Mortgage — single-family', lender: 'National lender (investor conforming)', principal: 225_000, annualRate: 0.07, termMonths: 360, structure: 'amortizing', collateral: 'Single-family rental', guarantee: 'Personal', maturityYear: 30 }, { name: 'Federal student loan', lender: 'Servicer', principal: 18_000, annualRate: 0.055, termMonths: 48, structure: 'amortizing' }],
      decision: { question: 'Which financing for the second property?', options: [{ label: 'Cash-out refinance of the duplex', consequence: 'Converts equity to cash and a higher payment on the asset that currently works; proceeds are debt, not income. Rejected for now.', tone: 'amber' }, { label: 'DSCR loan ignoring personal income', consequence: 'Higher rate and prepayment penalty; useful later when DTI binds, unnecessary now.', tone: 'amber' }, { label: 'Conventional investor loan, 25% down', consequence: 'Cheapest money available to her; uses savings; DTI rises to ≈34%. Chosen.', tone: 'green' }] },
      tradeoffs: ['Every additional conventional investor loan raises DTI because only 75% of rent counts; at some point DSCR loans become the only route and the price of leverage rises.', 'Reserves of $24,000 cover about six months of total debt service — her own policy minimum.'],
      warnings: ['Two properties, two roofs, two tenants: maintenance reserves must scale with the portfolio.', 'Both loans are in her personal name with full recourse; a judgment against her reaches both.'],
      metrics: [{ label: 'Portfolio LTV', value: '71%', tone: 'gold' }, { label: 'Back-end DTI', value: '≈34%', tone: 'amber' }, { label: 'Reserves (months of P&I)', value: '≈7', tone: 'green' }],
    },
  ],
  takeaways: [
    'Credit is built by behaviour that bureaus can see; the fastest fix was timing a card payment before the statement date.',
    'Down payment is only one constraint. Reserves and DTI decide what a lender will do, and lenders discount projected rent.',
    'Owner-occupying the first investment property is the cheapest leverage most individuals will ever access.',
    'Cash-out proceeds are debt. She declined a refinance she did not need and wrote down the condition under which she would reconsider.',
  ],
};
export default caseA;
