/**
 * Master "Family Wealth Architecture Map" — twelve layers radiating from one individual to future generations.
 * Positions are polar (ring radius by layer, angle in degrees, SVG convention: 0° = right, 90° = down).
 * Every explanation is educational framing: what questions arise, never what the answer is.
 */
import type { ComponentKind, RelationshipKind } from '@/types/structure';

export type EdgeTone = 'ownership' | 'control' | 'cash' | 'insurance' | 'succession';
export const TONE_COLOR: Record<EdgeTone, string> = { ownership: 'var(--gold)', control: 'var(--blue)', cash: 'var(--green-2)', insurance: 'var(--green-2)', succession: 'var(--violet)' };
export const TONE_LABEL: Record<EdgeTone, string> = { ownership: 'Ownership', control: 'Control', cash: 'Cash flow', insurance: 'Insurance', succession: 'Succession' };

export interface MapNode { id: string; kind: ComponentKind; label: string; angle: number; r?: number; jurisdiction?: string; value?: number }
export interface MapEdge { from: string; to: string; tone: EdgeTone; rel: RelationshipKind; label?: string; percent?: number }

export interface LayerDetail {
  what: string; owns: string; controls: string; liability: string; cash: string; documents: string; tax: string; jurisdiction: string; professionals: string;
}
export interface Layer {
  id: string; index: number; title: string; eyebrow: string; color: string; chapterSlug: string; chapterTitle: string;
  nodes: MapNode[]; summary: string; detail: LayerDetail;
}

export const RING_BASE = 150;
export const RING_STEP = 92;
export const ringRadius = (index: number) => (index === 0 ? 0 : RING_BASE + RING_STEP * (index - 1));

export const polar = (angleDeg: number, r: number) => { const a = (angleDeg * Math.PI) / 180; return { x: Math.cos(a) * r, y: Math.sin(a) * r }; };

export const LAYERS: Layer[] = [
  {
    id: 'individual', index: 0, title: 'The Individual', eyebrow: 'Layer 0 · Origin', color: 'var(--gold)', chapterSlug: 'wealth-foundations', chapterTitle: 'Wealth Foundations',
    nodes: [{ id: 'ind', kind: 'individual', label: 'Individual', angle: 0, jurisdiction: 'Resident · citizen · domiciled' }],
    summary: 'Everything starts with one person who earns, saves, takes risk and signs documents. At this layer there is no architecture: the person is the owner, the manager, the guarantor and the taxpayer all at once.',
    detail: {
      what: 'A natural person with income, assets, liabilities, a tax residence, a citizenship and, eventually, an estate. Every later layer exists to separate the roles this person currently holds alone.',
      owns: 'Themselves: accounts, a home, a business interest, policies — all in their own name. Personal title is the default the law assigns when nobody designs anything else.',
      controls: 'Themselves. Ownership and control are fused, which is simple while they are alive and competent, and catastrophic the morning they are not.',
      liability: 'Everywhere. A judgment against the person reaches every asset they own; a judgment against their business reaches the person if they guaranteed it or ran it as a sole proprietor.',
      cash: 'Earned income in, living costs out. Surplus accumulates in personal accounts and is taxed at personal rates as it is earned.',
      documents: 'A will (often absent), beneficiary designations on accounts and policies, a power of attorney and a healthcare directive. These four documents are the entire architecture most people have.',
      tax: 'Income tax on earnings at personal rates; capital gains on sales; estate or inheritance tax exposure at death depending on domicile and the size of the estate. Residence and citizenship decide which systems apply.',
      jurisdiction: 'Where the person is resident and domiciled governs their income tax, their estate and the intestacy rules that apply if they never plan. Citizenship can add a second system (for US citizens, worldwide).',
      professionals: 'An estate-planning lawyer for the basic documents; an accountant; an insurance adviser for life and disability cover. The founding team, long before a family office.',
    },
  },
  {
    id: 'family', index: 1, title: 'The Family', eyebrow: 'Layer 1 · People', color: 'var(--gold)', chapterSlug: 'wealth-engines', chapterTitle: 'Wealth Engines',
    nodes: [{ id: 'sp', kind: 'spouse', label: 'Spouse', angle: -125 }, { id: 'ch1', kind: 'child', label: 'Child A', angle: -80 }, { id: 'ch2', kind: 'child', label: 'Child B', angle: -45 }],
    summary: 'A spouse and children are the first "structure" anyone has — marital property regimes, joint title and intestacy already allocate wealth whether or not a document says so.',
    detail: {
      what: 'The people the architecture is for. Spouses, children, future descendants, and sometimes siblings and parents. The family is the beneficiary class of everything that follows.',
      owns: 'Jointly titled assets with the individual; in community-property regimes, half of marital acquisitions by law. Children typically own nothing until gifts or inheritances arrive.',
      controls: 'Spouses often share control of joint accounts and the home; children control nothing. Later layers let children receive economic benefit without control, or control without ownership.',
      liability: 'Each person\'s own creditors reach that person\'s own assets. Joint ownership can expose one spouse\'s half to the other\'s creditors depending on the form of title.',
      cash: 'Household spending; gifts to children, which in many systems are tax-relevant transfers once they exceed annual thresholds; support for ageing parents.',
      documents: 'Marriage, prenuptial or postnuptial agreements; joint account agreements; guardianship nominations for minor children in the will; gift records.',
      tax: 'Marital deductions or exemptions for transfers between spouses in many systems; gift-tax rules on transfers to children; "kiddie tax" style rules on investment income shifted to minors in some jurisdictions.',
      jurisdiction: 'Matrimonial property law (community vs separate property), forced-heirship regimes in civil-law countries, and the residence of each family member — a child who moves to another country imports that country\'s tax system into the family.',
      professionals: 'Family lawyer for marital agreements; estate planner for guardianship; a tax adviser once family members live in different countries.',
    },
  },
  {
    id: 'trust', index: 2, title: 'The Trust Layer', eyebrow: 'Layer 2 · Separation of title', color: 'var(--violet)', chapterSlug: 'trust-architecture', chapterTitle: 'Trust Architecture',
    nodes: [{ id: 'rt', kind: 'revocable-trust', label: 'Revocable Trust', angle: -160, jurisdiction: 'Home state', value: 4000000 }, { id: 'it', kind: 'irrevocable-trust', label: 'Dynasty Trust', angle: -20, jurisdiction: 'Trust-friendly state', value: 30000000 }],
    summary: 'The first genuine separation: legal title moves to a trustee, economic benefit stays with beneficiaries. A revocable trust manages incapacity and probate; an irrevocable trust changes who owns the assets for creditor and transfer-tax purposes.',
    detail: {
      what: 'A relationship, not an entity: a trustee holds legal title to assets for beneficiaries under written terms set by the settlor. Revocable trusts can be undone (so they protect nothing from the settlor\'s creditors); irrevocable trusts cannot, which is why they can.',
      owns: 'The trustee holds legal title to whatever is transferred in: holding-company interests, policies, real estate, portfolios. Beneficiaries hold equitable interests, not title.',
      controls: 'The trustee, within the deed; sometimes a protector who can replace the trustee; sometimes an investment adviser or a trust committee. The settlor should hold as little control as the objectives allow — retained control is what courts and tax authorities look at.',
      liability: 'Trust assets are generally beyond the reach of the beneficiaries\' creditors (spendthrift provisions) and, for a properly funded irrevocable trust after look-back periods, beyond the settlor\'s. The trustee\'s own creditors never reach trust assets.',
      cash: 'Distributions to beneficiaries under the deed — mandatory, discretionary or standards-based (health, education, maintenance, support). Trustee fees out. Income retained in the trust is taxed to the trust in many systems.',
      documents: 'The trust deed or agreement; schedule of assets actually transferred (funding is where most trusts fail); trustee acceptances; letters of wishes; protector appointments; annual accounts.',
      tax: 'Grantor vs non-grantor status in the US decides who pays income tax on trust income; completed-gift treatment decides whether assets leave the estate; generation-skipping transfer tax rules matter for multigenerational trusts. Nothing here eliminates tax; it allocates who pays, when and at which rate.',
      jurisdiction: 'Trust law is state or country specific: duration (rule against perpetuities or its abolition), self-settled asset-protection statutes, trustee licensing, and recognition of trusts in civil-law countries. The governing-law clause is a real decision.',
      professionals: 'Trusts and estates lawyer to draft; corporate or professional trustee; tax adviser for the grantor/non-grantor and transfer-tax analysis; a valuation specialist when business interests go in.',
    },
  },
  {
    id: 'holding', index: 3, title: 'The Holding Company', eyebrow: 'Layer 3 · Consolidation', color: 'var(--ivory-2)', chapterSlug: 'entity-architecture', chapterTitle: 'Entity Architecture',
    nodes: [{ id: 'hold', kind: 'holding-company', label: 'Family Holding Co.', angle: 90, jurisdiction: 'LLC / LP', value: 36000000 }],
    summary: 'One company that owns the others. It consolidates the family\'s operating, property and investment interests under a single cap table and a single governance document, usually owned by the trust layer above it.',
    detail: {
      what: 'A passive entity — typically an LLC or limited partnership — whose assets are shares in other companies. It does not trade, employ many people or sign customer contracts; its job is to own, govern and allocate capital.',
      owns: 'The membership interests of operating, property and investment companies beneath it, often 100%. Its own interests are owned by trusts and family members above it.',
      controls: 'A manager or general partner — frequently the founder, a family board or a family-office company — appointed under the operating or partnership agreement. Non-voting interests can carry economics without control.',
      liability: 'Operating risk stays below in the subsidiaries; a judgment against an operating company does not reach the holding company\'s other subsidiaries unless the holding company guaranteed the debt or the veil is pierced.',
      cash: 'Dividends and distributions up from subsidiaries; capital allocated back down as equity or intercompany loans; distributions up to owners. The holding company is the family\'s internal capital market.',
      documents: 'Articles or certificate of formation; operating or partnership agreement (the constitution of the family\'s business); cap table; resolutions for every allocation; intercompany agreements.',
      tax: 'Entity classification (pass-through vs corporate) decides whether income is taxed once at owner level or twice; consolidated or group relief rules in some systems; valuation discounts for lack of control or marketability when interests are gifted or sold to trusts are heavily scrutinised.',
      jurisdiction: 'Formation state or country affects charging-order protection, privacy of ownership records, annual costs and franchise taxes. Beneficial-ownership reporting may still be required regardless of where it is formed.',
      professionals: 'Corporate lawyer for the governing documents; CPA for entity classification and consolidated reporting; valuation professional for transfers of interests.',
    },
  },
  {
    id: 'operating', index: 4, title: 'Operating Companies', eyebrow: 'Layer 4 · The engine', color: 'var(--ivory-2)', chapterSlug: 'wealth-engines', chapterTitle: 'Wealth Engines',
    nodes: [{ id: 'opco', kind: 'operating-company', label: 'Operating Co.', angle: 128, jurisdiction: 'Trading entity', value: 18000000 }, { id: 'opco2', kind: 'operating-company', label: 'New Venture Co.', angle: 155, value: 3000000 }],
    summary: 'Where the risk and the revenue live. Operating companies employ people, sign contracts and get sued. The architecture\'s first job is to keep this layer\'s liabilities from travelling upward or sideways.',
    detail: {
      what: 'Trading businesses: the companies that make or sell things. The wealth engine. Each is a separate legal person with its own creditors, contracts and employees.',
      owns: 'Working assets — inventory, receivables, equipment, goodwill — and ideally not the real estate or the intellectual property it uses, which sit in sibling companies and are leased or licensed in.',
      controls: 'Directors and officers appointed by the holding company; day-to-day management by executives who may or may not be family. Separating ownership (holding) from management (executives) is the first governance step.',
      liability: 'Highest in the structure. Customer claims, employment claims, product and contract disputes land here. Insurance absorbs the first layer; the entity boundary is meant to stop the rest — unless guarantees, undercapitalisation or commingling defeat it.',
      cash: 'Revenue in, costs and salaries out, rent to the property company, licence fees to the IP owner, interest to lenders, dividends up to the holding company. Every one of these transfers must be at defensible terms.',
      documents: 'Formation documents, shareholder or operating agreement, board minutes, employment agreements, customer and supplier contracts, intercompany lease and licence agreements, insurance policies.',
      tax: 'Corporate or pass-through income tax, payroll taxes, sales or VAT, and the deductibility of rent, royalties and interest paid to related parties — which is exactly where transfer-pricing and reasonable-compensation disputes arise.',
      jurisdiction: 'Where the business actually operates governs most of it: employment law, licensing, sales tax nexus. The formation jurisdiction matters less than people think once the company has real operations somewhere.',
      professionals: 'Corporate and employment counsel, CPA, insurance broker (general liability, D&O, cyber, key-person), and a banker.',
    },
  },
  {
    id: 'property', index: 5, title: 'Property Companies', eyebrow: 'Layer 5 · Hard assets', color: 'var(--green-2)', chapterSlug: 'real-estate-tax-architecture', chapterTitle: 'Real Estate Tax Architecture',
    nodes: [{ id: 'propco', kind: 'property-company', label: 'Property Co.', angle: 78, jurisdiction: 'One LLC per asset', value: 9000000 }, { id: 're', kind: 'real-estate', label: 'Real Estate', angle: 100, value: 16000000 }],
    summary: 'Real estate is held away from the operating risk, one entity per significant asset, and leased to the business at market rent. The lender takes a mortgage; the family bank may refinance it later.',
    detail: {
      what: 'Single-purpose entities that own real estate — the building the business uses, rental properties, land. Keeping each asset in its own company stops one property\'s problem (an environmental claim, a tenant injury) from reaching the others.',
      owns: 'Title to the property, the lease with the operating company (or third-party tenants), and the insurance. Owned in turn by the holding company or directly by a trust.',
      controls: 'The manager appointed by the owner; a property manager for operations. Lender covenants in the mortgage also constrain what the owner may do — control is partly contracted away when you borrow.',
      liability: 'Premises liability and environmental claims sit here. The mortgage is usually non-recourse to the owners above except for "bad-boy" carve-outs and any guarantees given. The tenant\'s business risk stays in the tenant.',
      cash: 'Rent in from the operating company or tenants; debt service out to the lender; operating costs; depreciation (a non-cash deduction) shelters part of the income; net rent distributed up.',
      documents: 'Deed; mortgage or deed of trust and promissory note; lease with the operating company at market rent (an appraisal or comparable study supports it); property insurance; environmental reports.',
      tax: 'Depreciation and cost-segregation studies; passive-activity and at-risk rules; like-kind exchange provisions in some systems (in the US, IRC §1031 for real property); property transfer taxes when title moves between entities; step-up in basis at death in the US. Each is a question, not an automatic benefit.',
      jurisdiction: 'Property is governed by the law of where it sits — recording, transfer taxes, landlord-tenant law, foreclosure procedure. A property company formed elsewhere still answers to the local jurisdiction for the asset.',
      professionals: 'Real estate lawyer, CPA with cost-segregation experience, appraiser, lender, property manager, insurance broker.',
    },
  },
  {
    id: 'investment', index: 6, title: 'Investment Companies', eyebrow: 'Layer 6 · Financial capital', color: 'var(--green-2)', chapterSlug: 'family-capital-waterfall', chapterTitle: 'Family Capital Waterfall',
    nodes: [{ id: 'invco', kind: 'investment-company', label: 'Investment Co.', angle: 42, jurisdiction: 'Pooled capital', value: 14000000 }, { id: 'brk', kind: 'brokerage-account', label: 'Portfolio', angle: 62, value: 12000000 }],
    summary: 'Surplus from the engine becomes financial capital: a company that pools the family\'s liquid investments, invests under a written policy and becomes the natural lender inside the family.',
    detail: {
      what: 'An entity holding marketable securities, private fund interests and cash reserves — the family\'s liquidity. Often the vehicle that later becomes the family bank.',
      owns: 'Brokerage and custody accounts, fund interests, notes receivable from other family entities. Owned by the holding company or by trusts directly.',
      controls: 'An investment committee under an investment policy statement; an external adviser with discretion within limits; the manager signs. Who can move money, and with whose second signature, is a governance decision.',
      liability: 'Low operational risk, but it is the deepest pocket in the structure — which is why it should not guarantee anyone else\'s debt and why its loans to siblings must be secured and documented.',
      cash: 'Capital contributions in from the holding company; dividends and interest earned; loan advances out to family borrowers and loan repayments back; distributions up.',
      documents: 'Investment policy statement, custody agreements, adviser agreements, subscription documents, and — for every intercompany loan — a promissory note, security agreement and board resolution.',
      tax: 'Dividend and interest income taxed as earned (pass-through or at entity level); capital gains on sales; in the US, net investment income tax and passive-foreign-investment-company rules for offshore funds; withholding on cross-border dividends.',
      jurisdiction: 'Securities regulation (is the entity an investment company that needs registration or an exemption?); custody location; treaty access for cross-border investments.',
      professionals: 'Investment adviser or outsourced CIO, custodian, CPA for the tax lots and K-1s, securities counsel for exemptions.',
    },
  },
  {
    id: 'insurance', index: 7, title: 'Insurance Infrastructure', eyebrow: 'Layer 7 · Liquidity at the worst moment', color: 'var(--green-2)', chapterSlug: 'insurance-as-infrastructure', chapterTitle: 'Insurance as Financial Infrastructure',
    nodes: [{ id: 'life', kind: 'life-insurance', label: 'Life Policy (in trust)', angle: -32, value: 20000000 }],
    summary: 'Life insurance owned by an irrevocable trust turns a future tax and liquidity problem into a funded one. Premiums flow in; at death, the benefit lands in the trust — outside the estate if the structure is respected.',
    detail: {
      what: 'Permanent or term life insurance on the individual (and sometimes a spouse), owned not by the insured but by an insurance trust, so that the death benefit is neither the insured\'s asset nor part of their estate.',
      owns: 'The trust owns the policy; the insured owns nothing in it (no incidents of ownership). The trust is also the beneficiary. Getting either wrong pulls the proceeds back into the estate.',
      controls: 'The trustee of the insurance trust decides on premiums, policy changes and how proceeds are used — commonly to buy illiquid assets from the estate or lend to it, creating liquidity to pay estate taxes without a fire sale.',
      liability: 'Policy cash values enjoy creditor protection in many jurisdictions by statute; proceeds in an irrevocable trust are beyond the insured\'s creditors. The carrier\'s solvency is the real risk here.',
      cash: 'Premiums funded by gifts to the trust (in the US, often using annual-exclusion "Crummey" gifts) or by a loan from the family bank (premium financing, which adds leverage risk). Death benefit in at the insured event.',
      documents: 'The policy; the irrevocable life insurance trust deed; Crummey notices or gift records; trustee resolutions; premium-finance loan documents if used.',
      tax: 'Death benefits are generally income-tax-free; whether they are estate-tax-free depends entirely on who owned the policy and when (in the US, the three-year rule for transferred policies). Premium gifts use gift-tax exclusions or exemption.',
      jurisdiction: 'Insurable-interest and creditor-exemption statutes vary by state; private placement life insurance adds securities and carrier-domicile questions; cross-border families must check how each country treats the proceeds.',
      professionals: 'Independent insurance adviser (fee-based review of illustrations), trusts and estates lawyer for the ILIT, CPA, and the trustee.',
    },
  },
  {
    id: 'familybank', index: 8, title: 'The Family Bank', eyebrow: 'Layer 8 · Internal capital market', color: 'var(--green-2)', chapterSlug: 'the-family-bank', chapterTitle: 'The Family Bank',
    nodes: [{ id: 'bank', kind: 'investment-company', label: 'Family Bank LLC', angle: 8, jurisdiction: 'Lending entity', value: 8000000 }],
    summary: 'Instead of paying interest to outside lenders, the family lends to itself — documented, secured and priced like a bank would, so that interest stays in the family and the next generation learns to borrow responsibly.',
    detail: {
      what: 'A lending entity (often the investment company wearing another hat) that advances capital to family members and family entities under written loan agreements: for a house, a business, an education, a property acquisition.',
      owns: 'Promissory notes receivable, security interests in the collateral, and its lending reserve. Owned by the holding company or a trust.',
      controls: 'A credit committee — ideally including non-family members — applies written lending criteria. The borrower controls the asset; the lender holds a lien. Discipline is the product.',
      liability: 'The lender\'s risk is the borrower\'s default; the loan documents and collateral are what make it recoverable. A loan without documents is a gift with a liability label.',
      cash: 'Principal out at origination; scheduled interest and principal back under the note (the amounts the shared finance engine computes); defaults handled under the agreement, not at the dinner table.',
      documents: 'Promissory note, security agreement, UCC-1 or mortgage filing, guaranty where appropriate, board resolution approving the loan, amortization schedule, payment records. All of them.',
      tax: 'Interest is income to the lender and may or may not be deductible to the borrower depending on use. In the US, below-market loans between related parties trigger imputed-interest rules under IRC §7872 unless the rate meets the applicable federal rate; forgiven amounts are gifts.',
      jurisdiction: 'Usury limits, licensing thresholds for lenders, and secured-transactions law (UCC Article 9 in the US) govern. Cross-border loans add withholding on interest and thin-capitalisation rules.',
      professionals: 'Lending counsel to paper it, CPA for imputed-interest analysis, an independent committee member, and a bookkeeper who actually records every payment.',
    },
  },
  {
    id: 'international', index: 9, title: 'International Structures', eyebrow: 'Layer 9 · Across borders', color: 'var(--blue)', chapterSlug: 'offshore-asset-protection', chapterTitle: 'Offshore Asset Protection',
    nodes: [{ id: 'ot', kind: 'offshore-trust', label: 'Offshore Trust', angle: 178, jurisdiction: 'Trust jurisdiction', value: 15000000 }, { id: 'fllc', kind: 'foreign-llc', label: 'Foreign Holding Ltd', angle: 202, jurisdiction: 'IBC jurisdiction', value: 15000000 }],
    summary: 'When the family, its assets or its businesses cross borders, structures follow — for governing-law choice, creditor protection and multi-country succession. Every one of them is fully reportable at home.',
    detail: {
      what: 'Trusts and companies formed outside the family\'s home country: an asset-protection trust with a foreign trustee, a foreign holding company for non-domestic businesses, sometimes a foundation in a civil-law jurisdiction.',
      owns: 'Non-domestic operating companies, international property, portfolios held at foreign custodians. Beneficially, the same family — and beneficial ownership is exactly what home-country reporting asks about.',
      controls: 'A licensed foreign trustee; a protector; local directors for substance. The settlor retaining control is the single most common reason these structures fail in litigation and in tax audits.',
      liability: 'Foreign asset-protection trusts can require a creditor to litigate in the foreign forum under its shorter limitation periods and higher burden of proof. They do not help against claims that existed when the transfer was made, and courts at home can order the settlor to repatriate.',
      cash: 'Distributions to beneficiaries at home (reportable); cross-border dividends subject to withholding; management fees for substance. Money moving across a border is the most-watched transaction in the structure.',
      documents: 'Trust deed, letter of wishes, company constitution, resolutions, and — critically — home-country information returns: in the US, foreign trust reports (Forms 3520/3520-A), foreign account reports (FBAR), FATCA forms; equivalents elsewhere. Privacy is lawful; non-reporting is not.',
      tax: 'Rarely reduces tax for home-country residents: grantor-trust rules, controlled-foreign-corporation and passive-foreign-investment-company rules, and exit taxes generally look through the structure. Penalties for missed reporting are severe. The question is always "how is this taxed and reported at home", never "does this avoid tax".',
      jurisdiction: 'Trust law, firewall statutes, trustee licensing regimes, recognition of foreign judgments and the home country\'s anti-avoidance rules all interact. Treaty networks matter for operating companies; none of the common trust jurisdictions have broad treaty access.',
      professionals: 'International tax counsel at home and in the foreign jurisdiction, licensed trustee, compliance adviser for the reporting calendar, and a litigator who has actually tested the structure.',
    },
  },
  {
    id: 'familyoffice', index: 10, title: 'The Family Office', eyebrow: 'Layer 10 · Institutional management', color: 'var(--gold)', chapterSlug: 'the-family-office', chapterTitle: 'The Family Office',
    nodes: [{ id: 'fo', kind: 'family-office', label: 'Family Office', angle: -58, jurisdiction: 'Management company' }],
    summary: 'When the architecture is bigger than any one person can run, the family hires itself a company to run it: investment oversight, reporting, compliance, education, and the paperwork that keeps every layer separate.',
    detail: {
      what: 'A management company employed by the family to administer the structure — single-family office if it serves one family, multi-family if several share the cost. It is the institutional memory of the architecture.',
      owns: 'Little: office assets and management contracts. It is deliberately asset-light so that its own liabilities (employment, professional errors) do not sit next to family capital.',
      controls: 'Day-to-day management of entities under management agreements; investment execution under committee mandates; it reports to a family council or board, which is where the family itself keeps control.',
      liability: 'Employment and professional-liability risk, covered by insurance. The office signs as agent; the entities it manages remain separately liable.',
      cash: 'Management fees from the entities it serves (which should be real services at defensible prices); salaries out; shared costs allocated across entities under a written allocation policy.',
      documents: 'Management agreements with every entity; investment committee charters; the family constitution it administers; reporting packages; a compliance calendar for every entity in every jurisdiction.',
      tax: 'Whether management fees are deductible to the paying entities and how the office is classified has been litigated (in the US, the Lender Management case is the usual reference for trade-or-business treatment). Fees must correspond to real services.',
      jurisdiction: 'Registration as an investment adviser may be required or exempt (in the US, the family-office exclusion under the Advisers Act has conditions); employment law where staff sit; data-protection law for family information.',
      professionals: 'Chief investment officer, controller/CPA, general counsel or outside counsel, compliance officer, and often a family-governance adviser.',
    },
  },
  {
    id: 'future', index: 11, title: 'Future Generations', eyebrow: 'Layer 11 · The hundred-year horizon', color: 'var(--violet)', chapterSlug: 'wealth-transfer', chapterTitle: 'Wealth Transfer',
    nodes: [{ id: 'fut', kind: 'beneficiary', label: 'Future Generations', angle: -92 }, { id: 'fdn', kind: 'foundation', label: 'Family Foundation', angle: -112, value: 6000000 }],
    summary: 'The point of the whole drawing. Trusts that last beyond any one life, a foundation that carries the family\'s purpose, and governance that teaches the next generation how to own without wrecking what they own.',
    detail: {
      what: 'Beneficiaries not yet born, the trusts designed to outlive the founder, and the charitable vehicle that gives the family a shared purpose beyond consumption.',
      owns: 'Nothing directly — and that is the design. Economic benefit arrives through trusts; control arrives through roles earned under the family constitution.',
      controls: 'Over time, family members take seats on committees, then boards, then as trustees or protectors. Governance documents decide how and when. Preparing heirs matters more than preparing assets.',
      liability: 'Divorce, creditors and poor judgment of individual descendants are the threats. Discretionary trust interests are generally not reachable by a beneficiary\'s creditors or former spouses; outright inheritances are.',
      cash: 'Distributions under standards; education funding; seed loans from the family bank; grants from the foundation. Each flow is also a lesson in how the family uses capital.',
      documents: 'Family constitution or charter, family council bylaws, trust deeds with multigenerational terms, foundation governing documents, succession plans for every role in the structure.',
      tax: 'Transfer taxes at each generational handoff where they exist — estate, inheritance, generation-skipping — and the exemptions and allocations that plan for them decades ahead. Charitable deductions for foundation funding, with payout and self-dealing rules once funded.',
      jurisdiction: 'Perpetuity periods (some jurisdictions now allow perpetual trusts), forced-heirship claims from civil-law countries where descendants live, and the charity regulation of wherever the foundation is formed.',
      professionals: 'Trusts and estates counsel, family-governance facilitator, foundation counsel, and — eventually — the next generation itself, educated to be competent owners.',
    },
  },
];

export const MAP_EDGES: MapEdge[] = [
  { from: 'ind', to: 'sp', tone: 'succession', rel: 'beneficiary', label: 'spouse' },
  { from: 'ind', to: 'ch1', tone: 'succession', rel: 'beneficiary' },
  { from: 'ind', to: 'ch2', tone: 'succession', rel: 'beneficiary' },
  { from: 'ind', to: 'rt', tone: 'ownership', rel: 'owns', label: 'settles & funds' },
  { from: 'ind', to: 'it', tone: 'ownership', rel: 'owns', label: 'completed gift' },
  { from: 'ind', to: 'rt', tone: 'control', rel: 'trustee' },
  { from: 'rt', to: 'hold', tone: 'ownership', rel: 'owns', percent: 20 },
  { from: 'it', to: 'hold', tone: 'ownership', rel: 'owns', percent: 80 },
  { from: 'hold', to: 'opco', tone: 'ownership', rel: 'owns', percent: 100 },
  { from: 'hold', to: 'opco2', tone: 'ownership', rel: 'owns', percent: 100 },
  { from: 'hold', to: 'propco', tone: 'ownership', rel: 'owns', percent: 100 },
  { from: 'propco', to: 're', tone: 'ownership', rel: 'owns', percent: 100 },
  { from: 'hold', to: 'invco', tone: 'ownership', rel: 'owns', percent: 100 },
  { from: 'invco', to: 'brk', tone: 'ownership', rel: 'owns', percent: 100 },
  { from: 'hold', to: 'bank', tone: 'ownership', rel: 'owns', percent: 100 },
  { from: 'it', to: 'life', tone: 'ownership', rel: 'owns', percent: 100 },
  { from: 'life', to: 'ind', tone: 'insurance', rel: 'insures' },
  { from: 'life', to: 'it', tone: 'succession', rel: 'beneficiary', label: 'death benefit' },
  { from: 'opco', to: 'propco', tone: 'cash', rel: 'distributes-to', label: 'market rent' },
  { from: 'opco', to: 'hold', tone: 'cash', rel: 'distributes-to', label: 'dividends' },
  { from: 'propco', to: 'hold', tone: 'cash', rel: 'distributes-to', label: 'net rent' },
  { from: 'invco', to: 'hold', tone: 'cash', rel: 'distributes-to' },
  { from: 'bank', to: 'propco', tone: 'cash', rel: 'lends-to', label: 'family mortgage' },
  { from: 'bank', to: 'opco2', tone: 'cash', rel: 'lends-to', label: 'venture loan' },
  { from: 'ind', to: 'ot', tone: 'ownership', rel: 'owns', label: 'settlor' },
  { from: 'ot', to: 'fllc', tone: 'ownership', rel: 'owns', percent: 100 },
  { from: 'fo', to: 'hold', tone: 'control', rel: 'manages' },
  { from: 'fo', to: 'invco', tone: 'control', rel: 'manages' },
  { from: 'fo', to: 'it', tone: 'control', rel: 'manages', label: 'adviser' },
  { from: 'ind', to: 'fo', tone: 'control', rel: 'controls' },
  { from: 'ind', to: 'hold', tone: 'control', rel: 'manages', label: 'manager' },
  { from: 'it', to: 'fut', tone: 'succession', rel: 'beneficiary' },
  { from: 'it', to: 'ch1', tone: 'succession', rel: 'beneficiary' },
  { from: 'it', to: 'ch2', tone: 'succession', rel: 'beneficiary' },
  { from: 'ot', to: 'fut', tone: 'succession', rel: 'beneficiary' },
  { from: 'hold', to: 'fdn', tone: 'cash', rel: 'distributes-to', label: 'annual grant' },
  { from: 'fdn', to: 'fut', tone: 'succession', rel: 'distributes-to', label: 'purpose' },
];

export const layerOfNode = (nodeId: string): Layer | undefined => LAYERS.find((l) => l.nodes.some((n) => n.id === nodeId));

export function nodePosition(n: MapNode, layer: Layer) {
  return polar(n.angle, n.r ?? ringRadius(layer.index));
}
