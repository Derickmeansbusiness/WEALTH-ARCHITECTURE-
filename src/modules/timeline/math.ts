/** Pure math for the 100-Year Timeline. Illustrative, not predictive. */
export type Model = 'direct' | 'trust' | 'succession' | 'office';
export const MODELS: { id: Model; label: string; short: string }[] = [
  { id: 'direct', label: 'Direct inheritance', short: 'Direct' },
  { id: 'trust', label: 'Trust inheritance', short: 'Dynasty trust' },
  { id: 'succession', label: 'Business succession', short: 'Succession' },
  { id: 'office', label: 'Family-office governance', short: 'Family office' },
];

/** Generational transitions (deaths of G1, G2, G3) at ~30-year intervals. */
export const TRANSITIONS: readonly number[] = [30, 60, 90];
export const HORIZON = 100;
export const STOPS: readonly number[] = [0, 25, 50, 75, 100];

/** Number of transitions that have occurred by `year` (0..3). */
export const transitionsBy = (year: number) => TRANSITIONS.filter((t) => year >= t).length;
/** Generation currently holding wealth: 1..4 */
export const generationAt = (year: number) => transitionsBy(year) + 1;

/** Number of living descendants in the holding generation (k children per person). */
export const descendants = (year: number, k: number) => Math.pow(Math.max(1, k), transitionsBy(year));

export interface OwnershipSnapshot {
  /** legal owners of record on the main assets */
  legalOwners: number;
  /** people with a beneficial/economic stake */
  stakeholders: number;
  /** owners of the operating business specifically */
  businessOwners: number;
  /** fractional interest of one legal owner */
  fraction: number;
}

export function ownership(model: Model, year: number, k: number, activeHeirs = 1): OwnershipSnapshot {
  const d = descendants(year, k);
  const g = transitionsBy(year);
  switch (model) {
    case 'direct':
      return { legalOwners: d, stakeholders: d, businessOwners: d, fraction: 1 / d };
    case 'trust':
      return { legalOwners: 1, stakeholders: d, businessOwners: 1, fraction: 1 };
    case 'succession': {
      // Business consolidated among active heirs each generation; passive assets fragment like direct.
      const biz = g === 0 ? 1 : Math.max(1, activeHeirs);
      return { legalOwners: d, stakeholders: d, businessOwners: biz, fraction: 1 / d };
    }
    case 'office':
      return { legalOwners: 1, stakeholders: d, businessOwners: 1, fraction: 1 };
  }
}

export interface Assumptions {
  startWealth: number;
  growth: number;          // annual real growth, decimal
  spending: number;        // annual spending as % of wealth, decimal
  k: number;               // children per generation
  activeHeirs: number;     // heirs active in the business (succession model)
  taxRate: number;         // illustrative transfer-tax rate, decimal
  exemption: number;       // illustrative per-decedent exemption, USD
  leakage: Record<Model, number>; // % of wealth lost at each transition (fees, forced sales, disputes, delay)
  spendingMultiplier: Record<Model, number>; // governance effect on spending discipline
}

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  startWealth: 20_000_000,
  growth: 0.05,
  spending: 0.02,
  k: 3,
  activeHeirs: 1,
  taxRate: 0.40,
  exemption: 13_000_000,
  leakage: { direct: 0.18, trust: 0.04, succession: 0.09, office: 0.05 },
  spendingMultiplier: { direct: 1.25, trust: 0.9, succession: 1.0, office: 0.8 },
};

export interface TransitionEvent {
  year: number;
  generation: number;       // generation dying (1..3)
  wealthBefore: number;
  tax: number;
  leakage: number;
  wealthAfter: number;
  decedents: number;        // how many estates are being administered
  note: string;
}
export interface YearPoint { year: number; wealth: number }
export interface Simulation { path: YearPoint[]; events: TransitionEvent[]; finalWealth: number; totalTax: number; totalLeakage: number }

/**
 * Transfer tax on a transition. Per-decedent exemption is applied to each estate.
 * Direct/succession/office: every holder of the dying generation has an estate.
 * Trust: a single taxable transfer at G1's death; the exempt portion (up to one exemption, standing in for GST exemption
 * allocation) is not taxed again; the non-exempt remainder is taxed at each later generational termination.
 */
export function transitionTax(model: Model, wealth: number, decedents: number, a: Assumptions, nonExemptShare: number): { tax: number; nonExemptShare: number } {
  if (model === 'trust') {
    if (decedents === 1 && nonExemptShare === 1) {
      const exempt = Math.min(wealth, a.exemption);
      const nonExempt = Math.max(0, wealth - exempt);
      const tax = nonExempt * a.taxRate;
      const after = wealth - tax;
      return { tax, nonExemptShare: after > 0 ? (nonExempt - tax) / after : 0 };
    }
    const tax = wealth * nonExemptShare * a.taxRate;
    const after = wealth - tax;
    return { tax, nonExemptShare: after > 0 ? (wealth * nonExemptShare - tax) / after : 0 };
  }
  const perEstate = wealth / decedents;
  const taxable = Math.max(0, perEstate - a.exemption);
  return { tax: taxable * a.taxRate * decedents, nonExemptShare: 1 };
}

export function simulate(model: Model, a: Assumptions): Simulation {
  const path: YearPoint[] = [{ year: 0, wealth: a.startWealth }];
  const events: TransitionEvent[] = [];
  let w = a.startWealth;
  let nonExemptShare = 1;
  let totalTax = 0, totalLeakage = 0;
  const spend = a.spending * a.spendingMultiplier[model];
  for (let y = 1; y <= HORIZON; y++) {
    w = w * (1 + a.growth) - w * spend;
    const tIdx = TRANSITIONS.indexOf(y);
    if (tIdx >= 0) {
      const decedents = model === 'trust' ? 1 : descendants(y - 1, a.k);
      const before = w;
      const { tax, nonExemptShare: nes } = transitionTax(model, w, decedents, a, nonExemptShare);
      nonExemptShare = nes;
      const leak = (w - tax) * a.leakage[model];
      w = w - tax - leak;
      totalTax += tax; totalLeakage += leak;
      events.push({ year: y, generation: tIdx + 1, wealthBefore: before, tax, leakage: leak, wealthAfter: w, decedents, note: eventNote(model, tIdx + 1, decedents, a.k) });
    }
    path.push({ year: y, wealth: Math.max(0, w) });
  }
  return { path, events, finalWealth: Math.max(0, w), totalTax, totalLeakage };
}

function eventNote(model: Model, gen: number, decedents: number, k: number): string {
  const heirs = decedents * k;
  switch (model) {
    case 'direct': return `${decedents} estate${decedents > 1 ? 's' : ''} administered; assets re-titled to ${heirs} heirs as tenants in common.`;
    case 'trust': return gen === 1 ? 'Assets pass into the dynasty trust; trustee continuity, beneficiaries change.' : `Beneficial class rolls to G${gen + 1}; trust holds title throughout.`;
    case 'succession': return `Buy-sell executed; business to active heir(s), ${heirs - 1} non-active heirs equalized with insurance/other assets.`;
    case 'office': return `Pooled vehicle units pass to ${heirs} members; family office keeps title, reporting and management unchanged.`;
  }
}

export const wealthAt = (sim: Simulation, year: number) => {
  const y = Math.max(0, Math.min(HORIZON, Math.round(year)));
  return sim.path[y].wealth;
};

/** Which of the five stops a year belongs to (0..4) */
export const stopIndex = (year: number) => STOPS.reduce((best, s, i) => (Math.abs(s - year) < Math.abs(STOPS[best] - year) ? i : best), 0);
