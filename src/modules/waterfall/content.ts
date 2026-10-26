import type { Confidence, Objective } from '@/types/content';
import type { TierId } from './engine';

export interface TierInfo { id: TierId; name: string; tag: string; color: string; what: string; produces: string; financed: string; owner: string; risk: string; objectives: Objective[] }

export const TIER_INFO: Record<TierId, TierInfo> = {
  labor: {
    id: 'labor', name: 'Labor', tag: 'the source', color: 'var(--ivory-2)',
    what: 'Earned income above what the household needs to live. Salary, professional fees, the founder\'s draw. It is the only tier that does not compound on its own and the only one every family starts with.',
    produces: 'An annual surplus. In this model it grows with wage growth and nothing else.',
    financed: 'Time and skill. There is no leverage here, which is why it is the slowest tier and why families try to convert it into the tiers below as early as they responsibly can.',
    owner: 'The individual. It is taxed to the individual as ordinary income and, in most systems, carries payroll or social charges on top.',
    risk: 'Concentration. One person, one career, one health event. Disability and life insurance exist to protect this tier, not to grow it.',
    objectives: ['governance'],
  },
  business: {
    id: 'business', name: 'Business', tag: 'operating engine', color: 'var(--gold)',
    what: 'An operating company that sells something. Retained earnings reinvested here buy capacity: people, equipment, inventory, customers.',
    produces: 'Operating profit, which is both the largest flow in the cascade and the most volatile. Part is retained (growth), part is distributed downward (yield).',
    financed: 'Retained earnings plus, where cash flow supports it, working-capital lines and term debt. Debt here is serviced from operations, so the business must earn more than its cost of capital.',
    owner: 'Typically a holding company, which in turn is owned by the family or a trust. Operating liabilities stay inside the operating entity.',
    risk: 'Operating and liability risk are highest here: competition, key-person dependence, lawsuits, regulation. This is why value is swept out to safer tiers rather than left inside.',
    objectives: ['asset-protection', 'governance', 'succession'],
  },
  realEstate: {
    id: 'realEstate', name: 'Real Estate', tag: 'tangible, financeable', color: 'var(--amber)',
    what: 'Income-producing property held in its own entity: the building the business rents, residential rentals, land.',
    produces: 'Rent (cash yield) and appreciation (growth), plus depreciation deductions that shelter part of the rent from current tax while the asset is held.',
    financed: 'Mortgage debt against the asset, usually 60–75% of value, serviced from rent. The equity portion often arrives as a documented loan or contribution from the holding company.',
    owner: 'A property company (LLC or equivalent) per asset or per cluster of assets, owned by the holding company or a trust.',
    risk: 'Illiquidity, interest-rate resets, vacancy, leverage. A building that cannot cover its debt service forces a sale at the worst moment; that is the stress test that matters.',
    objectives: ['asset-protection', 'tax-planning', 'estate-planning'],
  },
  investments: {
    id: 'investments', name: 'Investments', tag: 'liquid, diversified', color: 'var(--blue)',
    what: 'Marketable securities, funds and private investments held in an investment company. The family\'s diversified, liquid reserve.',
    produces: 'Dividends and interest (yield) and capital growth. Lower than the business in good years, far steadier in bad ones.',
    financed: 'Unlevered, or lightly levered against the portfolio. Margin against a family balance sheet is a choice with its own stress test.',
    owner: 'An investment company or directly by a trust. A written investment policy decides what it may hold.',
    risk: 'Market risk, concentration if the family holds its own stock, behavioural risk in downturns. Liquidity is the point: this tier funds opportunities and emergencies in the others.',
    objectives: ['asset-protection', 'governance'],
  },
  permanent: {
    id: 'permanent', name: 'Permanent Capital', tag: 'multi-generational', color: 'var(--violet)',
    what: 'Capital moved irrevocably out of the founder\'s estate into long-term trusts (dynasty or generation-skipping trusts where the jurisdiction allows), often holding interests in the entities above.',
    produces: 'Distributions to beneficiaries under the trust instrument, and, crucially, the lending capacity of a "family bank": loans to family members against documented notes.',
    financed: 'Completed gifts within exemptions, sales to the trust for a note, or long-horizon reinvestment. Funding it has a transfer-tax cost that must be measured, not assumed away.',
    owner: 'A trustee, for beneficiaries. The settlor no longer owns these assets, which is the whole reason they are protected from the settlor\'s creditors and excluded from the estate when correctly structured.',
    risk: 'Loss of control (by design), trustee quality, drafting errors, and the risk of beneficiaries who have never been taught what the capital is for. Governance is the mitigant.',
    objectives: ['estate-planning', 'asset-protection', 'succession', 'governance'],
  },
  insurance: {
    id: 'insurance', name: 'Insurance / Liquidity', tag: 'liquidity at the worst moment', color: 'var(--green-2)',
    what: 'Permanent life insurance owned by a trust, plus deliberate cash reserves. Its job is to deliver liquidity exactly when the balance sheet is most illiquid: a death, a tax bill, a buy-out.',
    produces: 'A death benefit (generally income-tax free), and cash value that grows slowly and can be borrowed against at a cost. It is not an investment tier; it is a hedge.',
    financed: 'Premiums paid from the tiers above, usually through gifts to an insurance trust. Early-year cash values are well below premiums paid.',
    owner: 'An irrevocable life insurance trust, so the proceeds are outside the insured\'s estate when the insured holds no incidents of ownership.',
    risk: 'Carrier solvency, policy design that lapses under loans, over-funding into modified-endowment status, and the marketing that sells it as a bank. Guaranteed columns, not projected ones, are the honest measure.',
    objectives: ['estate-planning', 'succession'],
  },
  family: {
    id: 'family', name: 'Family Capital', tag: 'what the family actually holds', color: 'var(--gold-2)',
    what: 'The liquid capital that reaches the family after every tier has taken its allocation: distributions, yields, trust distributions. Part funds life; part is recycled upward into new businesses, property and investments.',
    produces: 'Optionality. New ventures, education, the next acquisition, philanthropy. The recycle loop is what turns a one-generation fortune into a hundred-year architecture.',
    financed: 'Everything above it. Its growth rate is close to zero because it is cash; the point is to redeploy it.',
    owner: 'Family members and the trusts that hold for them, governed by a family constitution or council where one exists.',
    risk: 'Consumption, division across heirs, and the absence of a shared purpose. Capital that is not recycled is spent within two generations in most documented cases.',
    objectives: ['succession', 'governance'],
  },
};

export interface Claim { claim: string; verdict: string; level: Confidence }

export const HISTORY: Claim[] = [
  { claim: 'John D. Rockefeller built Standard Oil into the dominant U.S. refiner and the company was broken up by the Supreme Court in 1911.', verdict: 'Documented. Standard Oil was founded in 1870; the 1911 decision under the Sherman Act (Standard Oil Co. of New Jersey v. United States) split it into more than thirty companies. Rockefeller\'s shareholdings in the successors made him wealthier after the break-up than before.', level: 'green' },
  { claim: 'The family\'s wealth was deliberately moved into trusts for descendants during the founder\'s and his son\'s lifetimes.', verdict: 'Documented. John D. Rockefeller Jr. established trusts in 1934 for his wife and children, and further trusts in 1952 for grandchildren. They were administered by professional trustees and remain a frequently cited example of long-horizon trust planning.', level: 'green' },
  { claim: 'A family office managed the capital and the family\'s affairs across generations.', verdict: 'Documented in substance. A private office handled the family\'s investments and philanthropy from the late nineteenth century; it later became Rockefeller & Co., opened to outside clients, and today exists as Rockefeller Capital Management. Internal details of structure and governance over the decades are less documented and change over time.', level: 'green' },
  { claim: 'Philanthropy was structural, not incidental.', verdict: 'Documented. The Rockefeller Foundation (1913), the University of Chicago, the Rockefeller Institute for Medical Research and the General Education Board absorbed a large share of the fortune, and the Rockefeller Brothers Fund (1940) became a vehicle for the next generation.', level: 'green' },
  { claim: 'Generational governance—regular family meetings, shared values, family councils—held the family together.', verdict: 'Broadly supported. The family is often cited for regular gatherings of the "cousins" generation and for using the foundations as training grounds for younger members. The specifics of any constitution or voting arrangement are private; treat detailed descriptions online with caution.', level: 'amber' },
  { claim: 'The Rockefeller fortune was built on whole life insurance.', verdict: 'Not supported. There is no credible documentary evidence that life insurance was a central engine of the Rockefeller fortune. The wealth came from an operating business, retained earnings, successor-company shareholdings and long-horizon trusts. The insurance-centred "Rockefeller method" is a modern marketing label.', level: 'red' },
];

export const MODERN: Claim[] = [
  { claim: 'Permanent capital in irrevocable trusts preserves wealth across generations.', verdict: 'Sound in principle. Properly funded, properly administered trusts remove assets from each generation\'s estate and creditors and keep them under a governance structure. Jurisdictional limits (perpetuities periods), transfer-tax cost of funding and trustee quality determine whether it works.', level: 'green' },
  { claim: 'Life insurance delivers liquidity at death that the rest of the balance sheet cannot.', verdict: 'Sound. A death benefit is generally income-tax free and arrives when illiquid assets would otherwise have to be sold. Owning it in an insurance trust keeps it out of the estate if structured correctly.', level: 'green' },
  { claim: 'A "family bank" can lend to heirs against documented notes instead of giving outright.', verdict: 'Sound if done properly. Written notes, a rate at or above the applicable federal rate, real payments and consequences for default. Below-market or unenforced loans are recharacterised as gifts under IRC §7872 and related doctrine.', level: 'amber' },
  { claim: 'Governance—written policies, a council, education of heirs—matters as much as structure.', verdict: 'Sound, and usually the part the marketing skips. Most documented family wealth failures are governance failures, not drafting failures.', level: 'green' },
  { claim: 'Whole life insurance is "tax-free banking" or "your own bank".', verdict: 'Overstated. Policy loans are not income because they are loans; they accrue interest, reduce the death benefit, and a lapse with loans outstanding can trigger taxable income. Over-funding creates a modified endowment contract with different tax treatment. It is a financing feature of an insurance contract, not a bank.', level: 'red' },
  { claim: 'Cash value grows at a guaranteed rate that beats the market without risk.', verdict: 'Misleading. Guaranteed crediting rates are modest; the illustrated rates are dividends or index credits that are not guaranteed. Early-year cash value is below premiums paid. Compare the guaranteed column, not the projected one.', level: 'red' },
  { claim: 'The method works for any family at any income level.', verdict: 'Misleading. The strategy presumes surplus capital, a long horizon, insurability and the cost of advisers and trustees. For many households the same premium dollars do more inside a business, debt reduction or ordinary diversified savings.', level: 'red' },
  { claim: 'Putting assets in a trust avoids estate tax.', verdict: 'Fact-dependent. Only completed gifts to an irrevocable trust, within exemptions or with gift tax paid, are excluded. Retained powers bring assets back under IRC §§2036–2038; generation-skipping transfer tax applies to skip persons unless exemption is allocated.', level: 'amber' },
];

export const PROFESSIONAL_QUESTIONS: string[] = [
  'What problem is the structure solving: liquidity at death, creditor exposure, a transfer-tax bill, succession of a business, or simply a sales pitch?',
  'What is the family\'s actual surplus after tax and living costs, and for how many years can it reliably fund premiums and trust contributions?',
  'Which assets would be sold at death to pay tax or buy out heirs, and what would that cost? Insurance is sized to that number, not to a round figure.',
  'Who is the trustee, what are their powers, and how are they removed? Who is the protector, if any?',
  'Is each intra-family loan documented at or above the applicable federal rate, with real payments and a plan if the borrower defaults?',
  'What does the guaranteed column of the policy illustration show, and what happens to the policy if premiums stop in year eight?',
  'Which reporting applies: gift tax returns, Crummey notices, trust income tax returns, foreign-trust forms if any element is offshore?',
  'How will the next generation learn what this capital is for, and who decides when they are ready to govern it?',
];

export const REFERENCES: { title: string; note: string }[] = [
  { title: 'Ron Chernow, Titan: The Life of John D. Rockefeller, Sr. (1998)', note: 'The standard biography; covers Standard Oil, the break-up and the philanthropy in detail.' },
  { title: 'Peter Collier & David Horowitz, The Rockefellers: An American Dynasty (1976)', note: 'Family history through the third and fourth generations, including the 1934 and 1952 trusts and the "cousins" generation.' },
  { title: 'Standard Oil Co. of New Jersey v. United States, 221 U.S. 1 (1911)', note: 'The Supreme Court decision ordering the dissolution of the Standard Oil trust under the Sherman Act.' },
  { title: 'Rockefeller Archive Center — family office and trust records (described generally)', note: 'Primary materials on the Rockefeller family office and foundations; consult the archive\'s finding aids for the 1934 Trusts.' },
  { title: 'Internal Revenue Code §7872 and related Treasury guidance', note: 'Below-market loans: imputed interest and gift/compensation/dividend characterisation of forgone interest.' },
  { title: 'Internal Revenue Code §§2036–2038, §2042; §§671–679; §7702 and §7702A', note: 'Estate inclusion for retained powers and life insurance incidents of ownership; grantor-trust rules; definition of life insurance and modified endowment contracts.' },
  { title: 'James E. Hughes Jr., Family Wealth: Keeping It in the Family (2004)', note: 'Governance-centred view of why family capital survives or fails across generations.' },
  { title: 'Insurance-industry "infinite banking" and "family banking" literature (described generally)', note: 'The source of the modern "Rockefeller method" framing. Read against the policy\'s guaranteed values and the IRC provisions above.' },
];
