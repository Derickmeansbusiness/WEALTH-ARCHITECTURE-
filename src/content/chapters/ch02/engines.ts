/** Engine-mix math for Chapter 02. Illustrative assumptions only; tested in engines.test.ts. */

export type EngineId = 'labor' | 'business' | 'realestate' | 'financial' | 'ip';

export interface EngineProfile {
  id: EngineId;
  label: string;
  /** illustrative annual cash yield on capital deployed (decimal) */
  cashYield: number;
  /** illustrative annual appreciation (decimal) */
  appreciation: number;
  /** max loan-to-value a lender would typically advance (decimal) */
  maxLtv: number;
  /** 1..5 scores for the comparison table */
  control: number;
  transferability: number;
  liquidity: number;
  note: string;
}

export const ENGINES: EngineProfile[] = [
  { id: 'labor', label: 'Labor income', cashYield: 0, appreciation: 0, maxLtv: 0, control: 3, transferability: 1, liquidity: 5, note: 'Capital allocated here represents human-capital investment (training, credentials); it returns wages, not yield, and cannot be financed or transferred.' },
  { id: 'business', label: 'Business ownership', cashYield: 0.12, appreciation: 0.04, maxLtv: 0.4, control: 5, transferability: 3, liquidity: 1, note: 'Highest yield and control; highest variance; depends on people and one industry.' },
  { id: 'realestate', label: 'Real estate', cashYield: 0.05, appreciation: 0.03, maxLtv: 0.7, control: 4, transferability: 4, liquidity: 2, note: 'Most financeable engine; rent plus depreciation; slow and costly to exit.' },
  { id: 'financial', label: 'Financial investments', cashYield: 0.02, appreciation: 0.05, maxLtv: 0.5, control: 1, transferability: 5, liquidity: 5, note: 'Liquid, transparent, low control. Margin is available but dangerous.' },
  { id: 'ip', label: 'Intellectual property', cashYield: 0.09, appreciation: 0.0, maxLtv: 0.2, control: 5, transferability: 4, liquidity: 1, note: 'Royalty cash flow at low marginal cost; valuation and legal cost uncertainty; finite life for patents.' },
];

export interface MixInput {
  totalCapital: number;
  /** allocation shares by engine, do not need to sum to 1; normalised */
  shares: Record<EngineId, number>;
}

export interface MixResult {
  normalised: Record<EngineId, number>;
  allocated: Record<EngineId, number>;
  annualCashFlow: number;
  annualGrowth: number;
  blendedCashYield: number;
  blendedGrowth: number;
  /** max additional borrowing supported by the mix at the engines' typical LTVs */
  leverageCapacity: number;
  /** Herfindahl index of allocation 0..1 (1 = everything in one engine) */
  herfindahl: number;
  /** effective number of engines = 1 / HHI */
  effectiveEngines: number;
  largestShare: number;
  largestEngine: EngineId | null;
  concentration: 'low' | 'moderate' | 'high';
}

export function normaliseShares(shares: Record<EngineId, number>): Record<EngineId, number> {
  const total = ENGINES.reduce((s, e) => s + Math.max(0, shares[e.id] ?? 0), 0);
  const out = {} as Record<EngineId, number>;
  for (const e of ENGINES) out[e.id] = total > 0 ? Math.max(0, shares[e.id] ?? 0) / total : 0;
  return out;
}

export function analyzeMix(input: MixInput): MixResult {
  const normalised = normaliseShares(input.shares);
  const allocated = {} as Record<EngineId, number>;
  let cash = 0, growth = 0, lev = 0, hhi = 0, largest = 0;
  let largestEngine: EngineId | null = null;
  for (const e of ENGINES) {
    const amt = input.totalCapital * normalised[e.id];
    allocated[e.id] = amt;
    cash += amt * e.cashYield;
    growth += amt * e.appreciation;
    lev += amt * e.maxLtv;
    hhi += normalised[e.id] ** 2;
    if (normalised[e.id] > largest) { largest = normalised[e.id]; largestEngine = e.id; }
  }
  const concentration = largest >= 0.6 ? 'high' : largest >= 0.4 ? 'moderate' : 'low';
  return {
    normalised, allocated,
    annualCashFlow: cash, annualGrowth: growth,
    blendedCashYield: input.totalCapital > 0 ? cash / input.totalCapital : 0,
    blendedGrowth: input.totalCapital > 0 ? growth / input.totalCapital : 0,
    leverageCapacity: lev,
    herfindahl: hhi,
    effectiveEngines: hhi > 0 ? 1 / hhi : 0,
    largestShare: largest, largestEngine, concentration,
  };
}
