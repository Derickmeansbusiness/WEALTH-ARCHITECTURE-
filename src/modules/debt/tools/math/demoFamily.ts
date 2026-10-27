/**
 * Demo family dataset for the Debt Dashboard. Illustrative figures for a mid-sized family structure:
 * six entities, five pledged assets, three people, three external lenders, eight loans (five external,
 * three related-party). Dates are chosen so two external loans mature within 24 months of late 2026.
 */
import type { FamilyData } from './dashboard';

export const DEMO_FAMILY: FamilyData = {
  entities: [
    { id: 'trust', name: 'Family Trust', kind: 'trust', cash: 650_000 },
    { id: 'hold', name: 'Holding Co', kind: 'holding-company', cash: 420_000, ownerId: 'trust', ownerPct: 100 },
    { id: 'opco', name: 'OpCo', kind: 'operating-company', cash: 380_000, ownerId: 'hold', ownerPct: 100 },
    { id: 'propco1', name: 'PropCo 1', kind: 'property-company', cash: 140_000, ownerId: 'hold', ownerPct: 100 },
    { id: 'propco2', name: 'PropCo 2', kind: 'property-company', cash: 95_000, ownerId: 'hold', ownerPct: 100 },
    { id: 'invco', name: 'InvestCo', kind: 'investment-company', cash: 210_000, ownerId: 'trust', ownerPct: 100 },
  ],
  assets: [
    { id: 'a-office', name: 'Office building (PropCo 1)', entityId: 'propco1', value: 4_200_000, kind: 'real-estate' },
    { id: 'a-resi', name: 'Residential portfolio (PropCo 2)', entityId: 'propco2', value: 2_800_000, kind: 'real-estate' },
    { id: 'a-warehouse', name: 'Warehouse (PropCo 2)', entityId: 'propco2', value: 1_600_000, kind: 'real-estate' },
    { id: 'a-business', name: 'Operating business (OpCo)', entityId: 'opco', value: 6_500_000, kind: 'business' },
    { id: 'a-securities', name: 'Securities portfolio (InvestCo)', entityId: 'invco', value: 3_100_000, kind: 'portfolio' },
  ],
  people: [
    { id: 'p-founder', name: 'Founder (G1)', role: 'Settlor · director of Holding Co' },
    { id: 'p-spouse', name: 'Spouse (G1)', role: 'Director of PropCo 2' },
    { id: 'p-daughter', name: 'Daughter (G2)', role: 'CEO of OpCo' },
  ],
  lenders: [
    { id: 'bank-meridian', name: 'Meridian Bank', type: 'bank' },
    { id: 'bank-harbor', name: 'Harbor Commercial Finance', type: 'bank' },
    { id: 'fund-private', name: 'Private credit fund', type: 'private' },
  ],
  loans: [
    { id: 'L1', name: 'Office mortgage', borrowerId: 'propco1', lenderId: 'bank-meridian', principal: 2_600_000, rate: 0.062, floating: false, structure: 'balloon', termMonths: 84, amortizationMonths: 300, originated: '2022-03-01', collateralIds: ['a-office'], guarantorIds: ['p-founder'], relatedParty: false, source: 'demo' },
    { id: 'L2', name: 'Residential portfolio loan', borrowerId: 'propco2', lenderId: 'bank-harbor', principal: 1_500_000, rate: 0.071, floating: true, structure: 'amortizing', termMonths: 240, originated: '2021-06-01', collateralIds: ['a-resi'], guarantorIds: ['p-founder', 'p-spouse'], relatedParty: false, source: 'demo' },
    { id: 'L3', name: 'Warehouse acquisition loan', borrowerId: 'propco2', lenderId: 'bank-harbor', principal: 900_000, rate: 0.074, floating: true, structure: 'balloon', termMonths: 60, amortizationMonths: 240, originated: '2023-09-01', collateralIds: ['a-warehouse', 'a-resi'], guarantorIds: ['p-founder'], relatedParty: false, source: 'demo' },
    { id: 'L4', name: 'OpCo working-capital facility', borrowerId: 'opco', lenderId: 'bank-meridian', principal: 1_200_000, rate: 0.08, floating: true, structure: 'interest-only', termMonths: 36, originated: '2024-01-01', collateralIds: ['a-business'], guarantorIds: ['p-founder', 'p-daughter'], relatedParty: false, source: 'demo' },
    { id: 'L5', name: 'Portfolio margin-style loan', borrowerId: 'invco', lenderId: 'fund-private', principal: 800_000, rate: 0.095, floating: false, structure: 'interest-only', termMonths: 24, originated: '2025-06-01', collateralIds: ['a-securities'], guarantorIds: [], relatedParty: false, source: 'demo' },
    { id: 'L6', name: 'Trust → Holding Co note', borrowerId: 'hold', lenderId: 'trust', principal: 1_000_000, rate: 0.045, floating: false, structure: 'interest-only', termMonths: 120, originated: '2020-01-01', collateralIds: [], guarantorIds: [], relatedParty: true, source: 'demo' },
    { id: 'L7', name: 'Holding Co → OpCo loan', borrowerId: 'opco', lenderId: 'hold', principal: 600_000, rate: 0.05, floating: false, structure: 'amortizing', termMonths: 84, originated: '2023-01-01', collateralIds: [], guarantorIds: [], relatedParty: true, source: 'demo' },
    { id: 'L8', name: 'InvestCo → PropCo 1 second-ranking loan', borrowerId: 'propco1', lenderId: 'invco', principal: 450_000, rate: 0.055, floating: false, structure: 'interest-only', termMonths: 60, originated: '2024-04-01', collateralIds: ['a-office'], guarantorIds: [], relatedParty: true, source: 'demo' },
  ],
};
