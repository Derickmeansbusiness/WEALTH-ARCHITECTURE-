/** Structure Lab / Family Wealth Architecture graph model. Shared with Debt Studio financing map. */

export type ComponentKind =
  | 'individual' | 'spouse' | 'child' | 'beneficiary'
  | 'trust' | 'revocable-trust' | 'irrevocable-trust' | 'offshore-trust'
  | 'holding-company' | 'operating-company' | 'property-company' | 'investment-company' | 'management-company'
  | 'foundation' | 'family-office' | 'foreign-llc'
  | 'life-insurance' | 'bank-account' | 'brokerage-account' | 'real-estate' | 'business' | 'intellectual-property'
  | 'loan' | 'promissory-note' | 'mortgage';

export type ComponentCategory = 'person' | 'trust' | 'entity' | 'asset' | 'instrument' | 'institution';

export const COMPONENT_META: Record<ComponentKind, { label: string; category: ComponentCategory; short: string }> = {
  individual: { label: 'Individual', category: 'person', short: 'IND' },
  spouse: { label: 'Spouse', category: 'person', short: 'SP' },
  child: { label: 'Child', category: 'person', short: 'CH' },
  beneficiary: { label: 'Beneficiary', category: 'person', short: 'BEN' },
  trust: { label: 'Trust', category: 'trust', short: 'TR' },
  'revocable-trust': { label: 'Revocable Trust', category: 'trust', short: 'RT' },
  'irrevocable-trust': { label: 'Irrevocable Trust', category: 'trust', short: 'IT' },
  'offshore-trust': { label: 'Offshore Trust', category: 'trust', short: 'OT' },
  'holding-company': { label: 'Holding Company', category: 'entity', short: 'HOLD' },
  'operating-company': { label: 'Operating Company', category: 'entity', short: 'OPCO' },
  'property-company': { label: 'Property Company', category: 'entity', short: 'PROPCO' },
  'investment-company': { label: 'Investment Company', category: 'entity', short: 'INVCO' },
  'management-company': { label: 'Management Company', category: 'entity', short: 'MGMT' },
  foundation: { label: 'Foundation', category: 'entity', short: 'FDN' },
  'family-office': { label: 'Family Office', category: 'institution', short: 'FO' },
  'foreign-llc': { label: 'Foreign LLC', category: 'entity', short: 'F-LLC' },
  'life-insurance': { label: 'Life Insurance Policy', category: 'instrument', short: 'LIFE' },
  'bank-account': { label: 'Bank Account', category: 'asset', short: 'BANK' },
  'brokerage-account': { label: 'Brokerage Account', category: 'asset', short: 'BRKG' },
  'real-estate': { label: 'Real Estate', category: 'asset', short: 'RE' },
  business: { label: 'Business', category: 'asset', short: 'BIZ' },
  'intellectual-property': { label: 'Intellectual Property', category: 'asset', short: 'IP' },
  loan: { label: 'Loan', category: 'instrument', short: 'LOAN' },
  'promissory-note': { label: 'Promissory Note', category: 'instrument', short: 'NOTE' },
  mortgage: { label: 'Mortgage', category: 'instrument', short: 'MTG' },
};

export type RelationshipKind =
  | 'owns' | 'controls' | 'manages' | 'beneficiary' | 'trustee' | 'protector'
  | 'lends-to' | 'borrows-from' | 'insures' | 'employs' | 'guarantees' | 'distributes-to';

export const RELATIONSHIP_META: Record<RelationshipKind, { label: string; color: string; maps: MapView[] }> = {
  owns: { label: 'OWNS', color: 'var(--gold)', maps: ['ownership', 'liability', 'succession'] },
  controls: { label: 'CONTROLS', color: 'var(--blue)', maps: ['control'] },
  manages: { label: 'MANAGES', color: 'var(--blue)', maps: ['control', 'cashflow'] },
  beneficiary: { label: 'BENEFICIARY', color: 'var(--violet)', maps: ['succession', 'cashflow'] },
  trustee: { label: 'TRUSTEE', color: 'var(--blue)', maps: ['control', 'succession'] },
  protector: { label: 'PROTECTOR', color: 'var(--blue)', maps: ['control'] },
  'lends-to': { label: 'LENDS TO', color: 'var(--green-2)', maps: ['cashflow', 'liability'] },
  'borrows-from': { label: 'BORROWS FROM', color: 'var(--amber)', maps: ['cashflow', 'liability'] },
  insures: { label: 'INSURES', color: 'var(--green-2)', maps: ['cashflow', 'succession'] },
  employs: { label: 'EMPLOYS', color: 'var(--ivory-3)', maps: ['cashflow', 'control'] },
  guarantees: { label: 'GUARANTEES', color: 'var(--red)', maps: ['liability'] },
  'distributes-to': { label: 'DISTRIBUTES TO', color: 'var(--green-2)', maps: ['cashflow', 'succession'] },
};

export type MapView = 'ownership' | 'control' | 'cashflow' | 'liability' | 'succession';

export const MAP_VIEWS: { id: MapView; label: string; question: string }[] = [
  { id: 'ownership', label: 'Ownership Map', question: 'Who legally owns each asset?' },
  { id: 'control', label: 'Control Map', question: 'Who makes decisions over each asset?' },
  { id: 'cashflow', label: 'Cash-Flow Map', question: 'Where does money move, and why?' },
  { id: 'liability', label: 'Liability Map', question: 'Where does a claim sit, and where can it travel?' },
  { id: 'succession', label: 'Succession Map', question: 'What happens at death, incapacity or exit?' },
];

/** Loan detail attached to lends-to / borrows-from edges (shared with Debt Studio). */
export interface LoanTerms {
  principal: number;
  rate: number;            // annual, decimal (0.06)
  termMonths: number;
  structure: 'amortizing' | 'interest-only' | 'balloon';
  balloonMonths?: number;  // for balloon: when the balance is due
  paymentFrequency: 'monthly' | 'quarterly' | 'annual';
  collateral?: string;
  purpose?: string;
  guarantorId?: string;
  securityDocs?: string[];
  relatedParty: boolean;
  originatedYear?: number;
  jurisdiction?: string;
}

export interface StructureNode {
  id: string;
  kind: ComponentKind;
  label: string;
  x: number;
  y: number;
  jurisdiction?: string;
  value?: number;        // asset value or balance where relevant
  notes?: string;
}

export interface StructureEdge {
  id: string;
  from: string;
  to: string;
  kind: RelationshipKind;
  /** ownership percentage 0..100 for 'owns' */
  percent?: number;
  loan?: LoanTerms;
  label?: string;
}

export interface Structure {
  id: string;
  name: string;
  nodes: StructureNode[];
  edges: StructureEdge[];
  createdAt: number;
  updatedAt: number;
  description?: string;
}
