import type { DebtCase } from '../types';

const common = { price: 1_000_000, annualRate: 0.065, termMonths: 360, structure: 'amortizing' as const, appreciation: 0.03, operatingIncome: 84_000, operatingExpenses: 30_000, inflation: 0.02, transactionCosts: 20_000, holdYears: 10 };

const caseC: DebtCase = {
  id: 'C',
  slug: 'property-investor',
  title: 'The Property Investor',
  persona: 'Mei-Lin has $1,000,000 of liquid capital and a choice: one building for cash, or the same building with a 70% mortgage and $700,000 left over.',
  summary: 'The same $1,000,000 property, bought two ways, followed for ten years across a base case, a strong market and a flat one. Leverage changes the shape of the outcome in both directions.',
  objectives: ['tax-planning', 'asset-protection', 'governance'],
  relatedLessons: [1, 4, 5, 7],
  relatedTools: [{ to: '/debt-credit-studio/leverage', label: 'Leverage Calculator' }, { to: '/debt-credit-studio/stress-test', label: 'Stress Test' }],
  compare: [
    { label: 'All cash', input: { ...common, equity: 1_000_000, loan: 0, borrowingCosts: 0 } },
    { label: '70% LTV, 6.5% fixed', input: { ...common, equity: 300_000, loan: 700_000, borrowingCosts: 7_000 } },
  ],
  stages: [
    {
      id: 'c1', title: 'The purchase', timing: 'Year 0',
      narrative: [
        'A small mixed-use building at $1,000,000: gross rent $84,000, operating expenses $30,000, NOI $54,000 — a 5.4% cap rate. The all-cash purchase uses her whole $1,000,000 (plus $20,000 of transaction costs). The financed purchase uses $300,000 of equity, $20,000 of transaction costs and $7,000 of lender fees, and leaves about $673,000 liquid. The mortgage: $700,000, 6.5% fixed, 30-year amortization, roughly $4,424 a month or $53,094 a year.',
        'Notice the first number the financed case produces: DSCR of $54,000 ÷ $53,094 ≈ 1.02×. At 6.5% the debt costs more than the 5.4% cap rate — this is negative leverage on current yield. The property barely covers its own loan; the leveraged return depends on appreciation and amortization. Many lenders would not make this loan at 70% LTV on these numbers; those that would are pricing a bet on the market.',
      ],
      balanceSheet: { assets: [{ label: 'Building', value: 1_000_000 }, { label: 'Liquid capital remaining (financed case)', value: 673_000 }], liabilities: [{ label: 'Mortgage (financed case only)', value: 700_000 }] },
      cashFlow: [{ label: 'Gross rent', value: 84_000 }, { label: 'Operating expenses', value: -30_000 }, { label: 'Debt service (financed case)', value: -53_094 }, { label: 'Cash flow to equity (financed)', value: 906, note: 'all-cash: $54,000' }],
      debts: [{ name: 'Mortgage', lender: 'Bank', principal: 700_000, annualRate: 0.065, termMonths: 360, structure: 'amortizing', collateral: 'First lien on the building', guarantee: 'Personal guarantee of the member of the holding LLC', maturityYear: 30 }],
      tradeoffs: ['All cash: 5.4% yield, no lender, no covenant, no maturity — and no liquidity.', 'Financed: $673,000 kept liquid for other uses, but the building’s cash flow is almost entirely consumed by the lender.'],
      warnings: ['A 1.02× DSCR leaves no room for a vacancy; one lost tenant makes the financed case cash-negative.', 'Negative leverage on current yield is a wager on appreciation.'],
      metrics: [{ label: 'Cap rate', value: '5.4%' }, { label: 'Financed DSCR', value: '1.02×', tone: 'red' }, { label: 'Liquidity retained (financed)', value: '$673K', tone: 'gold' }],
    },
    {
      id: 'c2', title: 'Base case: 3% appreciation', timing: 'Years 1–10',
      narrative: [
        'With rents and expenses growing 2% a year and value growing 3%, the all-cash owner collects about $54,000 rising to $64,000 a year and ends year ten with a building worth about $1,344,000 — an unlevered IRR in the mid-single digits. The financed owner collects almost nothing in the early years (cash flow of under $1,000 in year one, rising as rents grow), but the loan balance falls to about $593,000 while the value rises, so equity grows from $300,000 to roughly $751,000. The leveraged IRR on the $327,000 invested is higher than the unlevered one — but the owner lived on thin cash flow for a decade to earn it.',
        'The comparison panel below runs both cases through the same `analyzeLeverage` function and shows year-by-year DSCR, cash flow, loan balance and equity. Move to the next stages to see how sensitive the gap is.',
      ],
      balanceSheet: { assets: [{ label: 'Building (year 10 value)', value: 1_343_916 }], liabilities: [{ label: 'Mortgage balance (financed case)', value: 593_000 }] },
      cashFlow: [{ label: 'Year-10 NOI', value: 64_500 }, { label: 'Debt service (financed)', value: -53_094 }, { label: 'Year-10 cash flow to equity (financed)', value: 11_400, note: 'all-cash: $64,500' }],
      debts: [{ name: 'Mortgage', lender: 'Bank', principal: 593_000, annualRate: 0.065, termMonths: 240, structure: 'amortizing', collateral: 'Building', maturityYear: 20 }],
      tradeoffs: ['Leverage multiplied a modest appreciation into a materially higher equity IRR — and it would have multiplied a decline the same way.', 'The all-cash owner had $54,000+ a year of spendable income throughout; the financed owner had almost none.'],
      warnings: ['Ten years of 2% rent growth with no vacancy is a smooth assumption real buildings rarely deliver.', 'Both IRRs ignore income tax, which would treat the two cases differently (interest deductibility, depreciation are the same asset).'],
      metrics: [{ label: 'Equity at exit — all cash', value: '≈$1.34M' }, { label: 'Equity at exit — financed', value: '≈$751K', tone: 'gold' }, { label: 'Financed cash flow, year 1', value: '≈$900', tone: 'amber' }],
    },
    {
      id: 'c3', title: 'Strong market: 6% appreciation', timing: 'Years 1–10 (upside)',
      narrative: [
        'Raise appreciation to 6% in the Leverage Calculator. The building is worth about $1,791,000 in year ten. The all-cash owner’s equity rose 79%; the financed owner’s equity rose from $300,000 to about $1,198,000 — roughly 4×. This is the story leverage advocates tell, and it is true in this scenario. It is worth noticing what it required: the market cooperated, the tenants paid, rates were fixed, and the owner never needed the cash.',
      ],
      balanceSheet: { assets: [{ label: 'Building (year 10 value)', value: 1_790_848 }], liabilities: [{ label: 'Mortgage balance (financed)', value: 593_000 }] },
      cashFlow: [{ label: 'Year-10 NOI', value: 64_500 }, { label: 'Debt service (financed)', value: -53_094 }, { label: 'Year-10 cash flow to equity (financed)', value: 11_400 }],
      debts: [{ name: 'Mortgage', lender: 'Bank', principal: 593_000, annualRate: 0.065, termMonths: 240, structure: 'amortizing', collateral: 'Building', maturityYear: 20 }],
      tradeoffs: ['The leverage factor of 3.33× turned a 79% asset gain into a ≈300% equity gain.', 'The same factor is waiting on the other side of the next stage.'],
      warnings: ['Outcomes like this one are what make investors raise leverage on the next deal — at the top of the cycle.'],
      metrics: [{ label: 'Asset gain', value: '+79%' }, { label: 'Equity gain — financed', value: '≈+300%', tone: 'green' }, { label: 'Leverage factor', value: '3.33×' }],
    },
    {
      id: 'c4', title: 'Flat market with a vacancy', timing: 'Years 1–10 (downside)',
      narrative: [
        'Now set appreciation to 0% and imagine a nine-month vacancy of the main commercial unit in year four, costing about $40,000 of rent. The all-cash owner has a bad year — cash flow drops to roughly $14,000 — and carries on; the building is still worth $1,000,000 and still theirs. The financed owner has a year of about −$39,000 cash flow, must fund the shortfall from the liquid reserve, and ends year ten with equity of about $407,000 (value flat at $1,000,000 less a $593,000 balance) — less than the $327,000 invested plus the amortization earned, with ten years of near-zero income. The leveraged IRR falls below the unlevered one.',
        'If, in addition, the loan had been a 7-year balloon rather than a 30-year fixed, year seven would have required a refinance of about $630,000 on a building with $54,000 of NOI in a market where lenders want 1.25× coverage — supporting a loan of only about $540,000 at the same rate. The owner would need to find $90,000 of cash-in or sell. That is the scenario the Stress Test tool is built to expose before signing.',
      ],
      balanceSheet: { assets: [{ label: 'Building (year 10 value, flat)', value: 1_000_000 }], liabilities: [{ label: 'Mortgage balance (financed)', value: 593_000 }] },
      cashFlow: [{ label: 'Year-4 NOI (vacancy)', value: 14_000 }, { label: 'Debt service (financed)', value: -53_094 }, { label: 'Year-4 cash flow to equity (financed)', value: -39_094, note: 'funded from reserves' }],
      debts: [{ name: 'Mortgage', lender: 'Bank', principal: 593_000, annualRate: 0.065, termMonths: 240, structure: 'amortizing', collateral: 'Building', maturityYear: 20 }],
      decision: { question: 'Knowing all three scenarios, which purchase would you choose?', options: [{ label: 'All cash', consequence: 'Lower return in good markets, steady income, no lender, no maturity risk. Liquidity is gone.', tone: 'green' }, { label: '70% LTV at 6.5%', consequence: 'Negative leverage on current yield; outcome depends on appreciation. Keeps $673K liquid, which — if invested productively — is the real argument for financing.', tone: 'amber' }, { label: 'A middle path: 50% LTV', consequence: 'DSCR around 1.4×, positive cash flow from year one, meaningful liquidity retained, equity multiplier of 2×. Not shown above; run it in the Leverage Calculator.', tone: 'green' }] },
      tradeoffs: ['The honest comparison is not building vs building; it is building vs building-plus-what-the-$673,000-earned-elsewhere.', 'A lower LTV gives up some upside to buy survivability.'],
      warnings: ['This studio never recommends the most leveraged option by default. The 70% case here is a thin-coverage loan that only works if the market does.', 'Reserves are what carried the financed owner through year four; without them this case ends in a forced sale.'],
      metrics: [{ label: 'Financed equity at exit', value: '≈$407K', tone: 'amber' }, { label: 'Year-4 shortfall', value: '−$39K', tone: 'red' }, { label: 'Balloon refinance gap (if 7-yr)', value: '≈$90K', tone: 'red' }],
    },
  ],
  takeaways: [
    'Leverage changes the distribution of outcomes, not the asset. The 3.33× factor applied equally to the upside and the downside.',
    'Negative leverage on current yield (debt cost above cap rate) means the leveraged return is a bet on appreciation.',
    'Liquidity retained is the real benefit of financing — and only if it is invested, or held as the reserve that makes the leverage survivable.',
    'A fixed-rate, long-amortization loan converted a bad decade into a survivable one; a balloon would have converted it into a crisis.',
  ],
};
export default caseC;
