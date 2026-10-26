/**
 * Preset structures for the Structure Lab, the Master Map hand-off and the Debt Studio financing map.
 * Edge directions follow the conventions documented in analysis.ts.
 * All values are illustrative USD. Every family is fictional.
 */
import type { Structure, StructureNode, StructureEdge, ComponentKind, RelationshipKind, LoanTerms } from '@/types/structure';

const T0 = 1700000000000;

function N(id: string, kind: ComponentKind, label: string, x: number, y: number, extra: Partial<StructureNode> = {}): StructureNode {
  return { id, kind, label, x, y, ...extra };
}
function E(id: string, from: string, to: string, kind: RelationshipKind, extra: Partial<StructureEdge> = {}): StructureEdge {
  return { id, from, to, kind, ...extra };
}
function loan(principal: number, rate: number, termMonths: number, extra: Partial<LoanTerms> = {}): LoanTerms {
  return { principal, rate, termMonths, structure: 'amortizing', paymentFrequency: 'monthly', relatedParty: true, securityDocs: ['Promissory note', 'Security agreement'], originatedYear: 2024, ...extra };
}
function S(id: string, name: string, description: string, nodes: StructureNode[], edges: StructureEdge[]): Structure {
  return { id, name, description, nodes, edges, createdAt: T0, updatedAt: T0 };
}

/** 1. Starter — one person, one business, everything held personally. The architecture most people actually have. */
export const STARTER = S('tpl-starter', 'Starter: one person, one business', 'An individual holding a business, a home and accounts in their own name, with a revocable trust that has not been funded. Deliberately imperfect — look at the warnings.', [
  N('ind', 'individual', 'Founder', 520, 90, { jurisdiction: 'US – Texas' }),
  N('sp', 'spouse', 'Spouse', 760, 90),
  N('ch', 'child', 'Child', 900, 230),
  N('opco', 'operating-company', 'Consulting LLC', 300, 300, { jurisdiction: 'Texas', value: 600000 }),
  N('home', 'real-estate', 'Family Home', 540, 320, { value: 850000 }),
  N('bank', 'bank-account', 'Checking & Savings', 760, 320, { value: 120000 }),
  N('truck', 'real-estate', 'Workshop Property', 160, 470, { value: 400000 }),
  N('rt', 'revocable-trust', 'Revocable Living Trust (unfunded)', 540, 500, { jurisdiction: 'Texas' }),
  N('life', 'life-insurance', 'Term Life Policy', 880, 470, { value: 1000000 }),
], [
  E('e1', 'ind', 'opco', 'owns', { percent: 100 }),
  E('e2', 'ind', 'home', 'owns', { percent: 50 }),
  E('e3', 'sp', 'home', 'owns', { percent: 50 }),
  E('e4', 'ind', 'bank', 'owns'),
  E('e5', 'ind', 'truck', 'owns', { percent: 100 }),
  E('e6', 'opco', 'truck', 'manages', { label: 'uses rent-free' }),
  E('e7', 'ind', 'rt', 'trustee'),
  E('e8', 'ind', 'rt', 'controls'),
  E('e9', 'rt', 'sp', 'beneficiary'),
  E('e10', 'rt', 'ch', 'beneficiary'),
  E('e11', 'ind', 'life', 'owns'),
  E('e12', 'life', 'ind', 'insures'),
  E('e13', 'life', 'sp', 'beneficiary'),
  E('e14', 'ind', 'opco', 'controls'),
  E('e15', 'opco', 'ind', 'employs'),
]);

/** 2. Builder — a holding company separates operations from property, a bank loan is personally guaranteed. */
export const BUILDER = S('tpl-builder', 'Builder: holding company, OpCo and PropCo', 'The first real separation: a holding company sits between the family and the operating risk, property is held in its own company and rented to the business. The bank still wanted a personal guarantee.', [
  N('ind', 'individual', 'Founder', 420, 70, { jurisdiction: 'US – Wyoming resident' }),
  N('sp', 'spouse', 'Spouse', 660, 70),
  N('rt', 'revocable-trust', 'Revocable Living Trust', 540, 200, { jurisdiction: 'Wyoming' }),
  N('hold', 'holding-company', 'Family Holdings LLC', 540, 340, { jurisdiction: 'Wyoming', value: 3200000 }),
  N('opco', 'operating-company', 'Operating Co.', 300, 490, { jurisdiction: 'Wyoming', value: 1800000 }),
  N('propco', 'property-company', 'Property Co.', 780, 490, { jurisdiction: 'Wyoming', value: 1400000 }),
  N('bldg', 'real-estate', 'Commercial Building', 780, 640, { value: 2100000 }),
  N('bank', 'loan', 'Commercial Bank Facility', 1040, 490, { value: 1200000 }),
  N('life', 'life-insurance', 'Life Policy', 160, 200, { value: 2000000 }),
  N('brk', 'brokerage-account', 'Brokerage Account', 300, 640, { value: 350000 }),
  N('ch1', 'child', 'Child A', 900, 70),
  N('ch2', 'child', 'Child B', 1040, 200),
], [
  E('e1', 'ind', 'rt', 'owns', { label: 'settles & funds' }),
  E('e2', 'rt', 'hold', 'owns', { percent: 100 }),
  E('e3', 'hold', 'opco', 'owns', { percent: 100 }),
  E('e4', 'hold', 'propco', 'owns', { percent: 100 }),
  E('e5', 'propco', 'bldg', 'owns', { percent: 100 }),
  E('e6', 'propco', 'bank', 'borrows-from', { loan: loan(1200000, 0.0725, 300, { relatedParty: false, collateral: 'Commercial Building', securityDocs: ['Promissory note', 'Mortgage / deed of trust', 'Guaranty'], purpose: 'Acquire the building the business operates from', guarantorId: 'ind', jurisdiction: 'Wyoming' }) }),
  E('e7', 'ind', 'propco', 'guarantees'),
  E('e8', 'ind', 'hold', 'manages', { label: 'manager' }),
  E('e9', 'ind', 'rt', 'trustee'),
  E('e10', 'sp', 'rt', 'trustee', { label: 'co-trustee' }),
  E('e11', 'rt', 'sp', 'beneficiary'),
  E('e12', 'rt', 'ch1', 'beneficiary'),
  E('e13', 'rt', 'ch2', 'beneficiary'),
  E('e14', 'opco', 'propco', 'distributes-to', { label: 'market rent' }),
  E('e15', 'opco', 'hold', 'distributes-to', { label: 'distributions' }),
  E('e16', 'propco', 'hold', 'distributes-to', { label: 'net rent' }),
  E('e17', 'opco', 'ind', 'employs'),
  E('e18', 'rt', 'life', 'owns'),
  E('e19', 'life', 'ind', 'insures'),
  E('e20', 'life', 'rt', 'beneficiary'),
  E('e21', 'hold', 'brk', 'owns', { percent: 100 }),
]);

/** 3. HNW — irrevocable trusts, an insurance trust, an investment company lending to a property company, a family office managing. */
export const HNW = S('tpl-hnw', 'HNW: trusts, family lender and family office', 'Ownership has moved into trusts, control sits with an independent trustee plus a family-controlled manager, and the family lends to itself under documented terms. Note the related-party loan and who the trustee is.', [
  N('ind', 'individual', 'Patriarch', 300, 60, { jurisdiction: 'US – Nevada resident' }),
  N('sp', 'spouse', 'Spouse', 540, 60),
  N('ch1', 'child', 'Daughter', 820, 60),
  N('ch2', 'child', 'Son', 1040, 60),
  N('rt', 'revocable-trust', 'Revocable Trust', 300, 210, { jurisdiction: 'Nevada' }),
  N('it', 'irrevocable-trust', 'Dynasty Trust', 700, 210, { jurisdiction: 'Nevada', value: 12000000 }),
  N('ilit', 'irrevocable-trust', 'Insurance Trust (ILIT)', 1060, 210, { jurisdiction: 'Nevada' }),
  N('ttco', 'management-company', 'Independent Trust Co.', 920, 340, { jurisdiction: 'Nevada' }),
  N('hold', 'holding-company', 'Family Holdings LLC', 500, 370, { jurisdiction: 'Nevada', value: 18000000 }),
  N('fo', 'family-office', 'Family Office LLC', 160, 370, { jurisdiction: 'Nevada' }),
  N('opco', 'operating-company', 'Operating Co.', 260, 540, { jurisdiction: 'Delaware', value: 9000000 }),
  N('propco', 'property-company', 'Property Co.', 520, 540, { jurisdiction: 'Nevada', value: 4500000 }),
  N('invco', 'investment-company', 'Investment Co. (family lender)', 800, 540, { jurisdiction: 'Nevada', value: 6000000 }),
  N('re', 'real-estate', 'Multifamily Portfolio', 520, 700, { value: 7800000 }),
  N('brk', 'brokerage-account', 'Managed Portfolio', 800, 700, { value: 5200000 }),
  N('ip', 'intellectual-property', 'Brand & Patents', 260, 700, { value: 1500000 }),
  N('life', 'life-insurance', 'Permanent Life Policy', 1060, 540, { value: 10000000 }),
], [
  E('e1', 'ind', 'rt', 'owns', { label: 'settles' }),
  E('e2', 'rt', 'hold', 'owns', { percent: 20 }),
  E('e3', 'it', 'hold', 'owns', { percent: 80 }),
  E('e4', 'hold', 'opco', 'owns', { percent: 100 }),
  E('e5', 'hold', 'propco', 'owns', { percent: 100 }),
  E('e6', 'hold', 'invco', 'owns', { percent: 100 }),
  E('e7', 'propco', 're', 'owns', { percent: 100 }),
  E('e8', 'invco', 'brk', 'owns', { percent: 100 }),
  E('e9', 'hold', 'ip', 'owns', { percent: 100 }),
  E('e10', 'ilit', 'life', 'owns', { percent: 100 }),
  E('e11', 'life', 'ind', 'insures'),
  E('e12', 'life', 'ilit', 'beneficiary'),
  E('e13', 'ilit', 'ch1', 'beneficiary'),
  E('e14', 'ilit', 'ch2', 'beneficiary'),
  E('e15', 'it', 'ch1', 'beneficiary'),
  E('e16', 'it', 'ch2', 'beneficiary'),
  E('e17', 'rt', 'sp', 'beneficiary'),
  E('e18', 'ttco', 'it', 'trustee'),
  E('e19', 'ttco', 'ilit', 'trustee'),
  E('e20', 'ind', 'rt', 'trustee'),
  E('e21', 'sp', 'it', 'protector'),
  E('e22', 'fo', 'hold', 'manages'),
  E('e23', 'ind', 'fo', 'controls'),
  E('e24', 'ind', 'hold', 'manages', { label: 'manager' }),
  E('e25', 'invco', 'propco', 'lends-to', { loan: loan(2500000, 0.065, 240, { collateral: 'Multifamily Portfolio', purpose: 'Acquisition of two buildings', securityDocs: ['Promissory note', 'Security agreement', 'Mortgage / deed of trust', 'Board resolution'], jurisdiction: 'Nevada' }) }),
  E('e26', 'opco', 'hold', 'distributes-to', { label: 'dividends' }),
  E('e27', 'propco', 'hold', 'distributes-to', { label: 'net rents' }),
  E('e28', 'hold', 'it', 'distributes-to', { label: '80%' }),
  E('e29', 'hold', 'rt', 'distributes-to', { label: '20%' }),
  E('e30', 'opco', 'ip', 'manages', { label: 'licenses' }),
  E('e31', 'opco', 'ind', 'employs'),
  E('e32', 'fo', 'sp', 'employs'),
]);

/** 4. Multigenerational — a dynasty trust at the top, a family bank lending to the next generation, a foundation, a protector and a family council. */
export const MULTIGEN = S('tpl-multigen', 'Multigenerational: dynasty trust, family bank, foundation', 'Three generations. The dynasty trust owns the holding company; the family bank lends to a grandchild\'s venture under documented terms; the foundation receives distributions. Watch the Succession view with the death event on.', [
  N('g1', 'individual', 'G1 Founder (age 78)', 540, 50, { jurisdiction: 'US – South Dakota' }),
  N('g1s', 'spouse', 'G1 Spouse', 780, 50),
  N('g2a', 'child', 'G2 — Daughter', 240, 200),
  N('g2b', 'child', 'G2 — Son', 1000, 200),
  N('g3', 'beneficiary', 'G3 Grandchildren', 1180, 360),
  N('fut', 'beneficiary', 'Future Generations', 1180, 520),
  N('dyn', 'irrevocable-trust', 'Dynasty Trust', 660, 210, { jurisdiction: 'South Dakota', value: 45000000 }),
  N('ttco', 'management-company', 'Corporate Trustee (SD)', 420, 320, { jurisdiction: 'South Dakota' }),
  N('prot', 'management-company', 'Protector Committee', 880, 330, { jurisdiction: 'South Dakota' }),
  N('hold', 'holding-company', 'Family Holdings LP', 660, 400, { jurisdiction: 'Delaware', value: 42000000 }),
  N('fo', 'family-office', 'Family Office', 140, 400, { jurisdiction: 'Delaware' }),
  N('fdn', 'foundation', 'Family Foundation', 140, 580, { jurisdiction: 'Delaware', value: 8000000 }),
  N('opco', 'operating-company', 'Legacy Operating Co.', 420, 560, { jurisdiction: 'Delaware', value: 22000000 }),
  N('propco', 'property-company', 'Real Estate Co.', 660, 560, { jurisdiction: 'Delaware', value: 11000000 }),
  N('bank', 'investment-company', 'Family Bank LLC', 900, 560, { jurisdiction: 'Delaware', value: 9000000 }),
  N('venture', 'business', 'G3 Venture', 1140, 700, { value: 1200000 }),
  N('re', 'real-estate', 'Property Portfolio', 660, 720, { value: 19000000 }),
  N('brk', 'brokerage-account', 'Endowment Portfolio', 900, 720, { value: 7000000 }),
  N('life', 'life-insurance', 'Second-to-die Policy', 300, 720, { value: 15000000 }),
], [
  E('e1', 'g1', 'dyn', 'owns', { label: 'settlor (completed gift)' }),
  E('e2', 'dyn', 'hold', 'owns', { percent: 99, label: 'LP interest' }),
  E('e3', 'g1', 'hold', 'owns', { percent: 1, label: 'GP interest' }),
  E('e4', 'hold', 'opco', 'owns', { percent: 100 }),
  E('e5', 'hold', 'propco', 'owns', { percent: 100 }),
  E('e6', 'hold', 'bank', 'owns', { percent: 100 }),
  E('e7', 'propco', 're', 'owns', { percent: 100 }),
  E('e8', 'bank', 'brk', 'owns', { percent: 100 }),
  E('e9', 'dyn', 'life', 'owns', { percent: 100 }),
  E('e10', 'life', 'g1', 'insures'),
  E('e11', 'life', 'dyn', 'beneficiary'),
  E('e12', 'ttco', 'dyn', 'trustee'),
  E('e13', 'prot', 'dyn', 'protector'),
  E('e14', 'g2a', 'prot', 'controls', { label: 'committee member' }),
  E('e15', 'g2b', 'prot', 'controls', { label: 'committee member' }),
  E('e16', 'g1', 'hold', 'controls', { label: 'general partner' }),
  E('e17', 'fo', 'hold', 'manages'),
  E('e18', 'fo', 'dyn', 'manages', { label: 'investment adviser' }),
  E('e19', 'g2a', 'fo', 'controls', { label: 'CEO' }),
  E('e20', 'dyn', 'g2a', 'beneficiary'),
  E('e21', 'dyn', 'g2b', 'beneficiary'),
  E('e22', 'dyn', 'g3', 'beneficiary'),
  E('e23', 'dyn', 'fut', 'beneficiary'),
  E('e24', 'hold', 'dyn', 'distributes-to'),
  E('e25', 'hold', 'fdn', 'distributes-to', { label: 'annual grant' }),
  E('e26', 'g1', 'fdn', 'controls', { label: 'board chair' }),
  E('e27', 'g3', 'venture', 'owns', { percent: 100 }),
  E('e28', 'bank', 'venture', 'lends-to', { loan: loan(600000, 0.055, 84, { collateral: 'G3 Venture', purpose: 'Seed capital for a grandchild\'s business — a family bank loan, not a gift', securityDocs: ['Promissory note', 'Security agreement', 'UCC-1 filing', 'Board resolution'], guarantorId: 'g2b', jurisdiction: 'Delaware' }) }),
  E('e29', 'g2b', 'venture', 'guarantees'),
  E('e30', 'bank', 'propco', 'lends-to', { loan: loan(3000000, 0.06, 180, { collateral: 'Property Portfolio', purpose: 'Refinance a maturing bank facility inside the family', securityDocs: ['Promissory note', 'Mortgage / deed of trust', 'Board resolution'], jurisdiction: 'Delaware' }) }),
  E('e31', 'opco', 'hold', 'distributes-to', { label: 'dividends' }),
  E('e32', 'propco', 'hold', 'distributes-to', { label: 'net rents' }),
  E('e33', 'opco', 'g2b', 'employs', { label: 'CEO' }),
]);

/** 5. Global — a family across three jurisdictions. Designed to raise tax, reporting and governing-law questions, not to answer them. */
export const GLOBAL = S('tpl-global', 'Global: multi-jurisdiction family', 'A UAE-resident principal, an offshore trust with a licensed trustee, a foreign holding LLC, US and UK operating assets and a DIFC family office. Every border crossed is a reporting and tax question — see the analysis notes.', [
  N('ind', 'individual', 'Principal (UAE resident)', 560, 50, { jurisdiction: 'UAE' }),
  N('sp', 'spouse', 'Spouse', 800, 50),
  N('ch1', 'child', 'Child (UK resident)', 1040, 50, { jurisdiction: 'UK' }),
  N('ch2', 'child', 'Child (US citizen)', 320, 50, { jurisdiction: 'US' }),
  N('ot', 'offshore-trust', 'Family Trust', 560, 210, { jurisdiction: 'Jersey', value: 60000000 }),
  N('ttco', 'management-company', 'Licensed Trustee Co.', 300, 330, { jurisdiction: 'Jersey' }),
  N('prot', 'management-company', 'Protector (family adviser)', 820, 330, { jurisdiction: 'Switzerland' }),
  N('fllc', 'foreign-llc', 'Holding Ltd', 560, 360, { jurisdiction: 'BVI', value: 58000000 }),
  N('hold', 'holding-company', 'US Holdings LLC', 320, 510, { jurisdiction: 'Delaware', value: 24000000 }),
  N('propco', 'property-company', 'UK Property Ltd', 800, 510, { jurisdiction: 'England & Wales', value: 14000000 }),
  N('invco', 'investment-company', 'Investment Co.', 1060, 510, { jurisdiction: 'UAE – ADGM', value: 16000000 }),
  N('fo', 'family-office', 'Family Office (DIFC)', 1060, 360, { jurisdiction: 'UAE – DIFC' }),
  N('opco', 'operating-company', 'US Operating Co.', 160, 660, { jurisdiction: 'Delaware', value: 20000000 }),
  N('reus', 'real-estate', 'US Real Estate', 400, 660, { value: 9000000 }),
  N('reuk', 'real-estate', 'London Property', 800, 660, { value: 18000000 }),
  N('brk', 'brokerage-account', 'Global Portfolio', 1060, 660, { value: 15000000 }),
  N('ukbank', 'loan', 'UK Bank Facility', 620, 760, { value: 7000000 }),
  N('ppli', 'life-insurance', 'PPLI Policy', 820, 210, { value: 20000000 }),
], [
  E('e1', 'ind', 'ot', 'owns', { label: 'settlor' }),
  E('e2', 'ot', 'fllc', 'owns', { percent: 100 }),
  E('e3', 'fllc', 'hold', 'owns', { percent: 100 }),
  E('e4', 'fllc', 'propco', 'owns', { percent: 100 }),
  E('e5', 'fllc', 'invco', 'owns', { percent: 100 }),
  E('e6', 'hold', 'opco', 'owns', { percent: 100 }),
  E('e7', 'hold', 'reus', 'owns', { percent: 100 }),
  E('e8', 'propco', 'reuk', 'owns', { percent: 100 }),
  E('e9', 'invco', 'brk', 'owns', { percent: 100 }),
  E('e10', 'ot', 'ppli', 'owns', { percent: 100 }),
  E('e11', 'ppli', 'ind', 'insures'),
  E('e12', 'ppli', 'ot', 'beneficiary'),
  E('e13', 'ttco', 'ot', 'trustee'),
  E('e14', 'prot', 'ot', 'protector'),
  E('e15', 'fo', 'fllc', 'manages', { label: 'investment management' }),
  E('e16', 'fo', 'invco', 'manages'),
  E('e17', 'ind', 'fo', 'controls'),
  E('e18', 'ot', 'sp', 'beneficiary'),
  E('e19', 'ot', 'ch1', 'beneficiary'),
  E('e20', 'ot', 'ch2', 'beneficiary'),
  E('e21', 'propco', 'ukbank', 'borrows-from', { loan: loan(7000000, 0.058, 60, { structure: 'interest-only', relatedParty: false, collateral: 'London Property', purpose: 'Acquisition finance on the London property', securityDocs: ['Promissory note', 'Mortgage / deed of trust', 'Guaranty'], guarantorId: 'fllc', jurisdiction: 'England & Wales' }) }),
  E('e22', 'fllc', 'propco', 'guarantees'),
  E('e23', 'opco', 'hold', 'distributes-to', { label: 'dividends (withholding?)' }),
  E('e24', 'hold', 'fllc', 'distributes-to', { label: 'cross-border distributions' }),
  E('e25', 'invco', 'fllc', 'distributes-to'),
  E('e26', 'fllc', 'ot', 'distributes-to'),
  E('e27', 'opco', 'ch2', 'employs'),
  E('e28', 'invco', 'hold', 'lends-to', { loan: loan(4000000, 0.07, 120, { structure: 'balloon', balloonMonths: 60, collateral: 'US Real Estate', purpose: 'Working capital advanced from the investment company to the US holding', securityDocs: [], jurisdiction: 'UAE – ADGM' }) }),
]);

/** 6. Family Financing — the Debt Studio preset. Trust → Holding → Investment Co. lends to Property Co. → property → operating cash flow → contractual repayment. */
export const FAMILY_FINANCING = S('tpl-family-financing', 'Family Financing: trust-to-property lending chain', 'The family bank at work: capital flows from the family trust through the holding company to an investment company that lends to a property company. Rent services the loan contractually; distributions flow back up. One guarantee and one cross-collateralized asset are included on purpose so the flags fire.', [
  N('fam', 'beneficiary', 'Family Beneficiaries', 160, 80),
  N('ind', 'individual', 'Principal', 160, 260),
  N('trust', 'irrevocable-trust', 'Family Trust', 420, 80, { jurisdiction: 'Nevada', value: 20000000 }),
  N('ttco', 'management-company', 'Trustee Co.', 700, 80, { jurisdiction: 'Nevada' }),
  N('hold', 'holding-company', 'Family Holding Company', 420, 250, { jurisdiction: 'Nevada', value: 19000000 }),
  N('invco', 'investment-company', 'Investment Company (Family Bank)', 420, 420, { jurisdiction: 'Nevada', value: 6500000 }),
  N('propco', 'property-company', 'Property Company', 820, 420, { jurisdiction: 'Nevada', value: 3200000 }),
  N('opco', 'operating-company', 'Operating Company', 820, 250, { jurisdiction: 'Nevada', value: 5000000 }),
  N('prop', 'real-estate', 'Property Purchase — 12 Harbor St', 820, 600, { value: 5400000 }),
  N('cash', 'bank-account', 'Operating Cash Flow (rent account)', 1120, 600, { value: 180000 }),
  N('brk', 'brokerage-account', 'Lending Reserve', 420, 600, { value: 2800000 }),
], [
  E('e1', 'ind', 'trust', 'owns', { label: 'settlor' }),
  E('e2', 'trust', 'hold', 'owns', { percent: 100 }),
  E('e3', 'hold', 'invco', 'owns', { percent: 100 }),
  E('e4', 'hold', 'propco', 'owns', { percent: 100 }),
  E('e5', 'hold', 'opco', 'owns', { percent: 100 }),
  E('e6', 'propco', 'prop', 'owns', { percent: 100 }),
  E('e7', 'propco', 'cash', 'owns', { percent: 100 }),
  E('e8', 'invco', 'brk', 'owns', { percent: 100 }),
  E('e9', 'ttco', 'trust', 'trustee'),
  E('e10', 'ind', 'hold', 'manages', { label: 'manager' }),
  E('e11', 'trust', 'fam', 'beneficiary'),
  E('loan-prop', 'invco', 'propco', 'lends-to', { label: 'Loan to Property Company', loan: loan(3600000, 0.0625, 240, { collateral: 'Property Purchase — 12 Harbor St', purpose: 'Purchase of 12 Harbor St (third-party seller, arm\'s-length price)', securityDocs: ['Promissory note', 'Mortgage / deed of trust', 'Board resolution'], guarantorId: 'ind', originatedYear: 2023, jurisdiction: 'Nevada' }) }),
  E('loan-op', 'invco', 'opco', 'lends-to', { label: 'Working capital line', loan: loan(900000, 0.07, 60, { structure: 'interest-only', collateral: 'Property Purchase — 12 Harbor St', purpose: 'Working capital for the operating company, secured on the same property', securityDocs: ['Promissory note', 'Security agreement'], originatedYear: 2025, jurisdiction: 'Nevada' }) }),
  E('e12', 'ind', 'propco', 'guarantees'),
  E('e13', 'propco', 'hold', 'distributes-to', { label: 'surplus after debt service' }),
  E('e14', 'invco', 'hold', 'distributes-to', { label: 'interest income' }),
  E('e15', 'hold', 'trust', 'distributes-to', { label: 'distributions' }),
  E('e16', 'opco', 'propco', 'distributes-to', { label: 'market rent' }),
  E('e17', 'opco', 'hold', 'distributes-to', { label: 'dividends' }),
]);

/** Presets offered in the Structure Lab template menu. */
export const TEMPLATES: Structure[] = [STARTER, BUILDER, HNW, MULTIGEN, GLOBAL, FAMILY_FINANCING];

/** Deep clone a template so edits never mutate the preset. */
export function cloneStructure(s: Structure, overrides: Partial<Structure> = {}): Structure {
  const now = Date.now();
  return { ...JSON.parse(JSON.stringify(s)) as Structure, createdAt: now, updatedAt: now, ...overrides };
}

export function emptyStructure(id: string, name = 'Untitled architecture'): Structure {
  const now = Date.now();
  return { id, name, nodes: [], edges: [], createdAt: now, updatedAt: now };
}
