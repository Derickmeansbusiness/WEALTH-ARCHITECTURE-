/**
 * Family Office Model Selector — Chapter 15 (The Family Office).
 * Illustrative cost and coverage comparison of single-family office (SFO), multi-family office (MFO)
 * and virtual family office (VFO) models. All figures are stylized USD assumptions, stated in the UI.
 * The output says what is "typically considered" at a given scale; it does not recommend.
 */

export type OfficeModel = 'sfo' | 'mfo' | 'vfo';

export interface OfficeInput {
  investableAssets: number;
  households: number;
  entities: number;
  countries: number;
  operatingBusinesses: number;
}

export type Fit = 'typically' | 'sometimes' | 'rarely';

export interface ServiceCoverage {
  service: string;
  sfo: 'in-house' | 'outsourced' | 'partial' | 'none';
  mfo: 'in-house' | 'outsourced' | 'partial' | 'none';
  vfo: 'in-house' | 'outsourced' | 'partial' | 'none';
}

export const SERVICES: ServiceCoverage[] = [
  { service: 'Investment management & manager selection', sfo: 'in-house', mfo: 'in-house', vfo: 'outsourced' },
  { service: 'Consolidated reporting & accounting', sfo: 'in-house', mfo: 'in-house', vfo: 'outsourced' },
  { service: 'Tax coordination & compliance', sfo: 'partial', mfo: 'in-house', vfo: 'outsourced' },
  { service: 'Estate & trust administration', sfo: 'partial', mfo: 'in-house', vfo: 'outsourced' },
  { service: 'Governance support (council, education)', sfo: 'in-house', mfo: 'partial', vfo: 'partial' },
  { service: 'Concierge & household management', sfo: 'in-house', mfo: 'partial', vfo: 'none' },
  { service: 'Operating-business oversight', sfo: 'in-house', mfo: 'none', vfo: 'none' },
  { service: 'Cross-border coordination', sfo: 'partial', mfo: 'partial', vfo: 'outsourced' },
];

export interface ModelEstimate {
  model: OfficeModel;
  label: string;
  annualCost: number;
  costBps: number;
  fit: Fit;
  fitReason: string;
  breakdown: { item: string; amount: number }[];
  staffing: string;
  governanceNote: string;
}

export interface OfficeResult {
  estimates: Record<OfficeModel, ModelEstimate>;
  complexityScore: number;
  complexityLabel: string;
  notes: string[];
}

export const DEFAULT_OFFICE: OfficeInput = { investableAssets: 150_000_000, households: 3, entities: 12, countries: 1, operatingBusinesses: 1 };

/** Complexity 0..10 from the structural factors (not assets). */
export function complexityScore(i: OfficeInput): number {
  const h = Math.min(3, Math.max(0, i.households - 1) * 0.5);
  const e = Math.min(3, i.entities / 8);
  const c = Math.min(2.5, Math.max(0, i.countries - 1) * 1.25);
  const o = Math.min(1.5, i.operatingBusinesses * 0.75);
  return Math.round((h + e + c + o) * 10) / 10;
}

const tier = (assets: number, bands: [number, number][]) => {
  let remaining = assets, fee = 0, prev = 0;
  for (const [cap, bps] of bands) {
    const slice = Math.max(0, Math.min(remaining, cap - prev));
    fee += slice * (bps / 10000);
    remaining -= slice; prev = cap;
    if (remaining <= 0) break;
  }
  if (remaining > 0) fee += remaining * (bands[bands.length - 1][1] / 10000);
  return fee;
};

export function estimateOffice(i: OfficeInput): OfficeResult {
  const cx = complexityScore(i);
  const assets = Math.max(0, i.investableAssets);

  // ── SFO: a lean dedicated staff plus overhead; scales with complexity more than assets ───
  const sfoBreakdown = [
    { item: 'Core team (CEO/CIO, CFO/controller, analyst, administrator)', amount: 1_150_000 },
    { item: 'Additional staff for households beyond two', amount: Math.max(0, i.households - 2) * 140_000 },
    { item: 'Entity accounting & compliance load', amount: i.entities * 18_000 },
    { item: 'Cross-border coordination', amount: Math.max(0, i.countries - 1) * 90_000 },
    { item: 'Operating-business oversight', amount: i.operatingBusinesses * 110_000 },
    { item: 'Technology (GL, aggregation, document vault, cybersecurity)', amount: 180_000 + Math.min(220_000, assets * 0.0002) },
    { item: 'Office, insurance, outside counsel & audit', amount: 260_000 },
  ];
  const sfoCost = sfoBreakdown.reduce((s, b) => s + b.amount, 0);

  // ── MFO: tiered bps on assets with a minimum, plus per-entity surcharges ──────────────
  const mfoFee = Math.max(200_000, tier(assets, [[25_000_000, 95], [100_000_000, 60], [250_000_000, 40], [Infinity, 28]]));
  const mfoBreakdown = [
    { item: 'Tiered advisory fee on investable assets', amount: mfoFee },
    { item: 'Entity administration beyond five entities', amount: Math.max(0, i.entities - 5) * 9_000 },
    { item: 'Additional household onboarding & reporting', amount: Math.max(0, i.households - 1) * 15_000 },
    { item: 'Cross-border surcharge', amount: Math.max(0, i.countries - 1) * 35_000 },
    { item: 'Operating-business coordination (limited)', amount: i.operatingBusinesses * 25_000 },
  ];
  const mfoCost = mfoBreakdown.reduce((s, b) => s + b.amount, 0);

  // ── VFO: a lead adviser coordinating specialist firms ─────────────────────────────────
  const vfoBreakdown = [
    { item: 'Lead adviser / coordinator retainer', amount: Math.min(300_000, 80_000 + assets * 0.0008) },
    { item: 'Outsourced bookkeeping & consolidated reporting', amount: 45_000 + i.entities * 4_500 + Math.max(0, i.households - 1) * 8_000 },
    { item: 'Tax compliance (returns for individuals, trusts, entities)', amount: 30_000 + i.entities * 7_000 + Math.max(0, i.countries - 1) * 20_000 },
    { item: 'Legal & trustee retainers', amount: 35_000 + i.operatingBusinesses * 20_000 },
    { item: 'Aggregation software & secure document vault', amount: 24_000 },
  ];
  const vfoCost = vfoBreakdown.reduce((s, b) => s + b.amount, 0);

  const bps = (c: number) => (assets > 0 ? (c / assets) * 10000 : Infinity);

  // ── Fit: what is typically considered at this scale and complexity ────────────────────
  const sfoFit: Fit = assets >= 250_000_000 || (assets >= 100_000_000 && cx >= 4) ? 'typically' : assets >= 100_000_000 || (assets >= 50_000_000 && cx >= 6) ? 'sometimes' : 'rarely';
  const mfoFit: Fit = assets >= 20_000_000 && assets <= 300_000_000 ? 'typically' : assets > 300_000_000 || assets >= 10_000_000 ? 'sometimes' : 'rarely';
  const vfoFit: Fit = assets >= 5_000_000 && assets <= 75_000_000 ? 'typically' : assets <= 150_000_000 || assets < 5_000_000 ? 'sometimes' : 'rarely';

  const estimates: Record<OfficeModel, ModelEstimate> = {
    sfo: {
      model: 'sfo', label: 'Single-family office', annualCost: sfoCost, costBps: bps(sfoCost), fit: sfoFit,
      fitReason: sfoFit === 'typically' ? 'Dedicated staff is commonly discussed at this scale or complexity; the fixed cost is a tolerable share of assets.' : sfoFit === 'sometimes' ? 'Some families at this scale run a lean SFO, usually because of operating businesses or privacy preferences; the cost in basis points is high.' : 'A dedicated office at this scale typically consumes an uncomfortable share of returns; families usually start with a VFO or MFO.',
      breakdown: sfoBreakdown,
      staffing: `Roughly ${Math.max(4, 4 + Math.max(0, i.households - 2) + Math.floor(i.entities / 10) + Math.max(0, i.countries - 1))} full-time staff, with legal, audit and specialist tax outsourced.`,
      governanceNote: 'Reports to the family council or an SFO board; the SEC family-office exclusion (Rule 202(a)(11)(G)-1) is usually available if it serves only family clients, is family-controlled and does not hold itself out to the public.',
    },
    mfo: {
      model: 'mfo', label: 'Multi-family office', annualCost: mfoCost, costBps: bps(mfoCost), fit: mfoFit,
      fitReason: mfoFit === 'typically' ? 'Shared infrastructure spreads fixed cost across families; fees in basis points are usually competitive here.' : assets > 300_000_000 ? 'Above this scale many families find the bps fee exceeds what a dedicated team would cost, though some stay for the institutional depth.' : 'Most MFOs have minimum relationship sizes; below them, a VFO built around an adviser is the usual starting point.',
      breakdown: mfoBreakdown,
      staffing: 'No family payroll; a dedicated relationship team at the MFO, which is a registered investment adviser.',
      governanceNote: 'The MFO is a vendor, not the family\'s agent; governance support exists but the family council must own the agenda.',
    },
    vfo: {
      model: 'vfo', label: 'Virtual family office', annualCost: vfoCost, costBps: bps(vfoCost), fit: vfoFit,
      fitReason: vfoFit === 'typically' ? 'A coordinating adviser plus specialist firms covers most needs at this scale at a modest cost.' : assets > 75_000_000 ? 'Coordination overhead and reporting gaps tend to grow with entities and households; many families outgrow the model here.' : 'Below a few million the coordination layer itself is the main cost; a strong accountant and adviser pair usually suffices.',
      breakdown: vfoBreakdown,
      staffing: 'No employees; the family (or one member) is the integrator unless a lead adviser is retained for that role.',
      governanceNote: 'Works only with a disciplined reporting calendar; without a single consolidated balance sheet, intercompany balances and double counting creep in.',
    },
  };

  const complexityLabel = cx >= 7 ? 'Very high' : cx >= 4.5 ? 'High' : cx >= 2.5 ? 'Moderate' : 'Low';
  const notes: string[] = [];
  if (i.operatingBusinesses > 0) notes.push('Operating businesses tilt families toward in-house capability: someone must read the management accounts and sit on the board, and MFOs rarely do that.');
  if (i.countries > 1) notes.push('Multiple countries multiply tax filings, reporting regimes and custody relationships; whichever model is chosen, a cross-border tax lead is needed.');
  if (i.households >= 4) notes.push('Four or more households usually means the office is serving a family council, not a founder; reporting must be designed per household as well as consolidated.');
  if (assets >= 100_000_000) notes.push('At this scale the question of whether family office expenses are a trade or business (Lender Management, 2017) versus non-deductible §212 expenses becomes material; the structure of the management company matters for tax, and professional review is required.');

  return { estimates, complexityScore: cx, complexityLabel, notes };
}
