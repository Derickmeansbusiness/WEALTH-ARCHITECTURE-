import type { DebtCase } from '../types';

const caseB: DebtCase = {
  id: 'B',
  slug: 'sme-founder',
  title: 'The SME Founder',
  persona: 'Tariq runs a precision-machining shop with $1.9M of revenue, 11 staff and a growing order book from two aerospace suppliers.',
  summary: 'From an overdraft that funds everything to a borrowing-base line, an equipment loan matched to a machine’s life, and — four years later — the first facility without a personal guarantee.',
  objectives: ['governance', 'asset-protection', 'succession'],
  relatedLessons: [2, 3, 5, 6],
  relatedTools: [{ to: '/debt-credit-studio/decision', label: 'Decision Simulator' }, { to: '/debt-credit-studio/stress-test', label: 'Stress Test' }],
  stages: [
    {
      id: 'b1', title: 'Everything on the overdraft', timing: 'Year 0',
      narrative: [
        'The shop is profitable — about $190,000 of EBITDA on $1.9M of revenue — but perpetually short of cash. Customers pay in 60 days, suppliers want 30, and the business holds six weeks of raw stock. The cash-conversion cycle is roughly 75 days, which at $4,100 a day of cost of sales means about $310,000 of working capital permanently tied up. Tariq funds it with a $150,000 overdraft (repayable on demand, 11%) and by stretching suppliers, which has cost him early-payment discounts and one key supplier’s goodwill.',
        'His banker suggests the problem is not profitability but structure: a permanent need financed with the most temporary money the bank sells. The overdraft also carries his unlimited personal guarantee and a charge over his house.',
      ],
      balanceSheet: { assets: [{ label: 'Cash', value: 12_000 }, { label: 'Receivables', value: 312_000 }, { label: 'Inventory', value: 170_000 }, { label: 'Machinery (net)', value: 410_000 }], liabilities: [{ label: 'Overdraft (on demand, 11%)', value: 148_000 }, { label: 'Trade payables (stretched)', value: 215_000 }, { label: 'Old equipment HP', value: 62_000 }] },
      cashFlow: [{ label: 'Revenue', value: 1_900_000 }, { label: 'Cost of sales', value: -1_250_000 }, { label: 'Overheads and salaries', value: -460_000 }, { label: 'Interest on overdraft and HP', value: -22_000 }, { label: 'Owner drawings', value: -95_000 }, { label: 'Net cash generated', value: 73_000, note: 'residual' }],
      debts: [{ name: 'Overdraft', lender: 'Main bank', principal: 148_000, annualRate: 0.11, termMonths: 12, structure: 'interest-only', collateral: 'Debenture over all assets; second charge on founder’s home', guarantee: 'Unlimited personal guarantee', maturityYear: 0, note: 'Repayable on demand' }, { name: 'Equipment hire-purchase', lender: 'Captive lessor', principal: 62_000, annualRate: 0.085, termMonths: 24, structure: 'amortizing', collateral: 'Two CNC mills' }],
      tradeoffs: ['The overdraft is flexible and simple; it is also the facility the bank can withdraw first in a downturn.', 'Stretching suppliers is free until it costs discounts and priority on scarce materials.'],
      warnings: ['Unlimited personal guarantee plus a charge on the home connects the family balance sheet to every business shock.', 'A permanent working-capital need on demand money is the classic SME failure mode.'],
      metrics: [{ label: 'Cash-conversion cycle', value: '≈75 days', tone: 'amber' }, { label: 'Debt ÷ EBITDA', value: '1.1×', tone: 'green' }, { label: 'Personal exposure', value: 'Unlimited', tone: 'red' }],
    },
    {
      id: 'b2', title: 'Borrowing-base line', timing: 'Year 1',
      narrative: [
        'The bank replaces the overdraft with a $400,000 receivables-and-inventory line: 80% advance on eligible receivables under 90 days (excluding the two slow-paying customers over concentration limits) and 40% on raw stock. Availability today is about $290,000. The rate drops to prime + 2.5% (about 9.5%), there is an unused fee of 0.25%, monthly borrowing-base certificates and quarterly management accounts.',
        'Tariq uses the extra availability to pay suppliers on terms and take the 2% discount where offered — worth about $14,000 a year, which more than covers the line’s fees. The personal guarantee stays but is capped at $200,000, and the charge on his home is released in exchange for a key-man insurance assignment. The business starts producing reviewed annual accounts for the first time.',
      ],
      balanceSheet: { assets: [{ label: 'Cash', value: 28_000 }, { label: 'Receivables', value: 335_000 }, { label: 'Inventory', value: 178_000 }, { label: 'Machinery (net)', value: 372_000 }], liabilities: [{ label: 'Revolving line (prime + 2.5%)', value: 236_000 }, { label: 'Trade payables (on terms)', value: 140_000 }, { label: 'Equipment HP', value: 31_000 }] },
      cashFlow: [{ label: 'Revenue', value: 2_050_000 }, { label: 'Cost of sales (after discounts)', value: -1_335_000 }, { label: 'Overheads and salaries', value: -490_000 }, { label: 'Interest and fees', value: -25_000 }, { label: 'Owner drawings', value: -100_000 }, { label: 'Net cash generated', value: 100_000, note: 'residual' }],
      debts: [{ name: 'Revolving credit line', lender: 'Main bank', principal: 236_000, annualRate: 0.095, termMonths: 12, structure: 'interest-only', collateral: 'First lien on receivables and inventory; debenture', guarantee: 'Personal guarantee capped at $200,000', maturityYear: 1, note: 'Annual renewal; borrowing base monthly' }, { name: 'Equipment hire-purchase', lender: 'Captive lessor', principal: 31_000, annualRate: 0.085, termMonths: 12, structure: 'amortizing' }],
      tradeoffs: ['A borrowing base shrinks when customers pay slowly — exactly when cash is tight.', 'Reporting is a burden that doubles as management information.'],
      warnings: ['Concentration limits exclude the two largest customers above 25% of receivables; growth with those customers does not grow availability.', 'Annual renewal is at the bank’s discretion.'],
      metrics: [{ label: 'Availability', value: '≈$290K', tone: 'green' }, { label: 'Interest saved vs overdraft', value: '≈$6K/yr' }, { label: 'Discounts captured', value: '≈$14K/yr', tone: 'green' }],
    },
    {
      id: 'b3', title: 'The second five-axis machine', timing: 'Year 2',
      narrative: [
        'An aerospace customer offers a three-year contract worth about $180,000 a year of incremental revenue if Tariq adds a second five-axis machine — $240,000 installed. Incremental operating cost (operator, tooling, power, maintenance) is estimated at $95,000. He finances 75% with a five-year equipment loan at 9%: $3,737 a month, about $44,800 a year. Operating cash flow of $85,000 against $44,800 of debt service is a 1.9× cover, and his $60,000 equity is recovered in the second year — the same arithmetic as Lesson 06’s model.',
        'He stress-tests it in the Decision Simulator: if the contract delivers only $130,000 of revenue, operating cash flow is $35,000 and the machine fails to cover its own debt by about $10,000 a year — survivable from the rest of the business, but a loss. If the customer cancels after year one, he has a machine with a four-year loan and no contract. He negotiates a cancellation fee into the customer contract and keeps six months of debt service on the machine in reserve.',
      ],
      balanceSheet: { assets: [{ label: 'Cash', value: 45_000 }, { label: 'Receivables', value: 360_000 }, { label: 'Inventory', value: 185_000 }, { label: 'Machinery (net)', value: 585_000 }], liabilities: [{ label: 'Revolving credit line', value: 210_000 }, { label: 'Equipment term loan (9%, 5 yr)', value: 180_000 }, { label: 'Trade payables', value: 150_000 }] },
      cashFlow: [{ label: 'Revenue (incl. new contract, part year)', value: 2_320_000 }, { label: 'Cost of sales', value: -1_520_000 }, { label: 'Overheads and salaries', value: -560_000 }, { label: 'Interest and fees', value: -37_000 }, { label: 'Equipment loan principal', value: -29_000 }, { label: 'Owner drawings', value: -105_000 }, { label: 'Net cash generated', value: 69_000, note: 'residual' }],
      debts: [{ name: 'Equipment term loan', lender: 'Equipment finance company', principal: 180_000, annualRate: 0.09, termMonths: 60, structure: 'amortizing', collateral: 'Purchase-money security interest in the machine', guarantee: 'Personal guarantee (limited)', maturityYear: 5 }, { name: 'Revolving credit line', lender: 'Main bank', principal: 210_000, annualRate: 0.095, termMonths: 12, structure: 'interest-only', collateral: 'Receivables and inventory', guarantee: 'Capped personal guarantee', maturityYear: 1 }],
      decision: { question: 'Finance the machine 75%, 100%, or buy it with cash from the line?', options: [{ label: '100% financed', consequence: 'No equity in; debt service rises to about $59,800 and cover falls to 1.4×. If the contract slips, the machine is underwater against its loan.', tone: 'amber' }, { label: 'Draw the revolving line to pay cash', consequence: 'Funds a 7-year asset with on-demand money, consumes working-capital availability and breaches the lender’s intent for the line.', tone: 'red' }, { label: '75% five-year equipment loan', consequence: 'Term matched to asset life, 1.9× base-case cover, equity recovered in year two. Chosen.', tone: 'green' }] },
      tradeoffs: ['A lease would lower the monthly cost but leave a residual and no ownership at the end.', 'A longer loan term would lower payments but outlast the contract that justifies the machine.'],
      warnings: ['Customer concentration: one contract justifies the machine. The cancellation clause is the real collateral.', 'Ramp-up is usually slower than planned; the model assumes six months.'],
      metrics: [{ label: 'Machine DSCR (base)', value: '1.9×', tone: 'green' }, { label: 'Machine DSCR (revenue −28%)', value: '0.78×', tone: 'red' }, { label: 'Equity payback', value: 'Year 2' }],
    },
    {
      id: 'b4', title: 'Term loan without a guarantee', timing: 'Year 4',
      narrative: [
        'Revenue is $2.9M and EBITDA $380,000 after three years of reviewed accounts, a retained-earnings line that has grown every year, and a spotless covenant record. Tariq wants to buy the building the shop rents ($1.1M) and consolidate the equipment debt. The bank offers a $770,000 commercial mortgage (70% LTV, 7.25%, 10-year term on 20-year amortization) in a new property company, plus a $250,000 five-year term loan to the operating company — and, for the first time, no personal guarantee on the operating-company term loan. The mortgage requires a guarantee from the operating company (the tenant) but not from Tariq personally.',
        'He puts the building in a separate property company that leases to the operating company at market rent, documented. The operating company’s lender takes a debenture over its assets only; the property company’s lender takes the building and an assignment of the lease. His personal balance sheet is, for the first time since he started, not pledged to the business. Lender covenants: debt-to-EBITDA below 2.5× (today 2.0×), fixed-charge cover above 1.25× (today 1.6×), distributions limited to 50% of net income.',
      ],
      balanceSheet: { assets: [{ label: 'Cash', value: 95_000 }, { label: 'Receivables', value: 410_000 }, { label: 'Inventory', value: 205_000 }, { label: 'Machinery (net)', value: 640_000 }, { label: 'Building (Property Co)', value: 1_100_000 }], liabilities: [{ label: 'Commercial mortgage (Property Co, 7.25%)', value: 770_000 }, { label: 'Operating Co term loan (no PG)', value: 250_000 }, { label: 'Revolving credit line', value: 190_000 }, { label: 'Trade payables', value: 165_000 }] },
      cashFlow: [{ label: 'Revenue', value: 2_900_000 }, { label: 'Cost of sales', value: -1_880_000 }, { label: 'Overheads (ex-rent) and salaries', value: -640_000 }, { label: 'Rent to Property Co (arm’s length)', value: -96_000 }, { label: 'Interest — all facilities', value: -86_000 }, { label: 'Scheduled principal', value: -78_000 }, { label: 'Owner distributions', value: -120_000 }, { label: 'Net cash generated (group)', value: 96_000, note: 'incl. Property Co rent receipts' }],
      debts: [{ name: 'Commercial mortgage', lender: 'Main bank (Property Co borrower)', principal: 770_000, annualRate: 0.0725, termMonths: 120, structure: 'balloon', amortizationMonths: 240, collateral: 'First lien on the building; assignment of lease', guarantee: 'Operating Co guarantee; no personal guarantee', maturityYear: 10, note: 'Balloon at year 10' }, { name: 'Operating Co term loan', lender: 'Main bank', principal: 250_000, annualRate: 0.0825, termMonths: 60, structure: 'amortizing', collateral: 'Debenture over Operating Co assets', guarantee: 'None', maturityYear: 5 }, { name: 'Revolving credit line', lender: 'Main bank', principal: 190_000, annualRate: 0.0925, termMonths: 12, structure: 'interest-only', collateral: 'Receivables and inventory', guarantee: 'None (released)', maturityYear: 1 }],
      decision: { question: 'Buy the building in the operating company, or in a separate property company?', options: [{ label: 'Operating company owns the building', consequence: 'Simpler; one balance sheet. But the building becomes available to every trade creditor and lender of the operating business, and a product-liability claim could reach it.', tone: 'amber' }, { label: 'Separate property company with an arm’s-length lease', consequence: 'The building is insulated from operating risk; the mortgage lender takes the tenant’s guarantee instead of the founder’s. Two sets of books, a real lease, market rent. Chosen.', tone: 'green' }] },
      tradeoffs: ['The 10-year balloon on the mortgage means a refinance in year 10; he begins planning for it in year 8.', 'Separation adds administration: two companies, two bank accounts, a lease, intercompany invoicing.'],
      warnings: ['The operating company’s guarantee of the mortgage still connects the two — a failure of the shop endangers the building. The founder’s personal assets are no longer in the chain.', 'The distribution covenant limits what the family can take out; it was negotiated with the family’s needs in view.'],
      metrics: [{ label: 'Debt ÷ EBITDA (Operating Co)', value: '2.0× vs 2.5× covenant', tone: 'green' }, { label: 'Fixed-charge cover', value: '1.6× vs 1.25×', tone: 'green' }, { label: 'Founder personal guarantee', value: 'None', tone: 'green' }],
    },
  ],
  takeaways: [
    'A permanent working-capital need belongs on a facility sized to receivables and inventory, not on an on-demand overdraft.',
    'Equipment debt should match the asset’s life and be sized on the incremental cash flow the asset generates — stress-tested.',
    'Entity-level credit without a personal guarantee is earned through years of clean, reviewed financials and covenant compliance.',
    'Separating the building from the operating business is an asset-protection decision made at the moment of financing, and it changes who guarantees what.',
  ],
};
export default caseB;
