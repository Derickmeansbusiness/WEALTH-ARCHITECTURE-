import type { Reference } from '@/types/content';

export type JurisdictionType = 'us-state' | 'country' | 'territory';

export interface Jurisdiction {
  id: string;
  name: string;
  region: string;
  flagEmoji?: string;
  type: JurisdictionType;
  summary: string;
  entityTypes: string[];
  trustRegimes: string[];
  publicOwnershipDisclosure: string;
  registeredAgentRules: string;
  chargingOrderProtection: string;
  creditorProtections: string[];
  taxCharacteristics: string[];
  foreignOwnerConsiderations: string[];
  reportingObligations: string[];
  majorAdvantages: string[];
  majorLimitations: string[];
  suitabilityFactors: string[];
  /** false = scaffold card, content minimal and not yet jurisdictionally verified */
  verified: boolean;
  lastReviewed: string;
  references: Reference[];
}

/** The eleven labelled sections shown on a jurisdiction detail page, in order. */
export const JURISDICTION_SECTIONS: { key: keyof Jurisdiction; label: string; kind: 'text' | 'list' }[] = [
  { key: 'entityTypes', label: 'Entity types', kind: 'list' },
  { key: 'trustRegimes', label: 'Trust regimes', kind: 'list' },
  { key: 'publicOwnershipDisclosure', label: 'Public ownership disclosure', kind: 'text' },
  { key: 'registeredAgentRules', label: 'Registered agent rules', kind: 'text' },
  { key: 'chargingOrderProtection', label: 'Charging order protection', kind: 'text' },
  { key: 'creditorProtections', label: 'Creditor protections', kind: 'list' },
  { key: 'taxCharacteristics', label: 'Tax characteristics', kind: 'list' },
  { key: 'foreignOwnerConsiderations', label: 'Foreign owner considerations', kind: 'list' },
  { key: 'reportingObligations', label: 'Reporting obligations', kind: 'list' },
  { key: 'majorAdvantages', label: 'Major advantages', kind: 'list' },
  { key: 'majorLimitations', label: 'Major limitations', kind: 'list' },
];

/** Dimensions available in the side-by-side comparison table. */
export const COMPARE_DIMENSIONS: { key: keyof Jurisdiction; label: string }[] = [
  { key: 'type', label: 'Type' },
  { key: 'entityTypes', label: 'Entity types' },
  { key: 'trustRegimes', label: 'Trust regimes' },
  { key: 'publicOwnershipDisclosure', label: 'Public ownership disclosure' },
  { key: 'registeredAgentRules', label: 'Registered agent' },
  { key: 'chargingOrderProtection', label: 'Charging order' },
  { key: 'creditorProtections', label: 'Creditor protections' },
  { key: 'taxCharacteristics', label: 'Tax' },
  { key: 'foreignOwnerConsiderations', label: 'Foreign owners' },
  { key: 'reportingObligations', label: 'Reporting' },
  { key: 'majorAdvantages', label: 'Advantages' },
  { key: 'majorLimitations', label: 'Limitations' },
];

export const SUITABILITY_NOTE = 'Suitability depends on residence, citizenship, assets, income, business activity and objectives. No jurisdiction is "best"; each is a fit or a misfit for a specific family.';
