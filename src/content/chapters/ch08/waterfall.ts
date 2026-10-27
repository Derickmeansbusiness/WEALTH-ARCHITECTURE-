/**
 * Family capital waterfall projection. Pure, deterministic, and deliberately simple:
 * annual surplus from labor is allocated across five pools, each compounds at its own
 * assumed rate, and a share of each year's pool growth is "recycled" back through the
 * same allocation to model capital being redeployed into new businesses, property and investments.
 */

export type TierId = 'business' | 'realEstate' | 'investments' | 'permanent' | 'liquidity';

export const TIERS: { id: TierId; label: string; short: string; tone: string; note: string }[] = [
  { id: 'business', label: 'Operating business', short: 'Business', tone: 'var(--gold)', note: 'Highest return, highest risk, least liquid. Reinvested earnings and new ventures.' },
  { id: 'realEstate', label: 'Real estate', short: 'Real estate', tone: 'var(--ivory-2)', note: 'Income-producing property; appreciation plus amortising debt. Illiquid.' },
  { id: 'investments', label: 'Marketable investments', short: 'Investments', tone: 'var(--blue)', note: 'Diversified securities. Liquid, lower expected return than a good business.' },
  { id: 'permanent', label: 'Permanent capital (trusts)', short: 'Permanent', tone: 'var(--violet)', note: 'Assets inside long-term trusts; compounding for the next generation. Spending restricted by design.' },
  { id: 'liquidity', label: 'Insurance & liquidity reserve', short: 'Liquidity', tone: 'var(--green-2)', note: 'Cash, reserves and life insurance cash value. Low return; exists so nothing else is sold at the wrong time.' },
];

export interface WaterfallInput {
  annualSurplus: number;
  /** Allocation percentages (0–100) by tier; normalised internally if they do not sum to 100. */
  allocation: Record<TierId, number>;
  /** Annual growth rate per tier as decimals (0.07 = 7%). */
  growth: Record<TierId, number>;
  /** Share (0–1) of each year's pool growth that is recycled back through the allocation. */
  recycleRate: number;
  /** Annual growth of the labor surplus itself (raises, business income growth). */
  surplusGrowth: number;
  years: number;
}

export interface WaterfallYear {
  year: number;
  surplus: number;
  recycled: number;
  pools: Record<TierId, number>;
  total: number;
}

export const DEFAULT_WATERFALL: WaterfallInput = {
  annualSurplus: 150_000,
  allocation: { business: 30, realEstate: 25, investments: 20, permanent: 15, liquidity: 10 },
  growth: { business: 0.10, realEstate: 0.06, investments: 0.065, permanent: 0.06, liquidity: 0.02 },
  recycleRate: 0.25,
  surplusGrowth: 0.03,
  years: 25,
};

export function normaliseAllocation(a: Record<TierId, number>): Record<TierId, number> {
  const sum = TIERS.reduce((s, t) => s + Math.max(0, a[t.id] ?? 0), 0);
  const out = {} as Record<TierId, number>;
  for (const t of TIERS) out[t.id] = sum > 0 ? Math.max(0, a[t.id] ?? 0) / sum : 1 / TIERS.length;
  return out;
}

export function projectWaterfall(input: WaterfallInput): WaterfallYear[] {
  const alloc = normaliseAllocation(input.allocation);
  const pools = {} as Record<TierId, number>;
  for (const t of TIERS) pools[t.id] = 0;
  const rows: WaterfallYear[] = [];
  let surplus = input.annualSurplus;
  for (let y = 1; y <= Math.max(0, Math.floor(input.years)); y++) {
    // 1. pools grow
    let growthTotal = 0;
    for (const t of TIERS) {
      const g = pools[t.id] * input.growth[t.id];
      pools[t.id] += g;
      growthTotal += g;
    }
    // 2. recycle a share of growth: it leaves the pools pro rata to where it was earned, re-enters via allocation
    const recycled = Math.max(0, Math.min(1, input.recycleRate)) * Math.max(0, growthTotal);
    if (recycled > 0 && growthTotal > 0) {
      for (const t of TIERS) {
        const earned = pools[t.id] * input.growth[t.id] / (1 + input.growth[t.id]);
        pools[t.id] -= recycled * (earned / growthTotal);
      }
    }
    // 3. new surplus + recycled capital allocated
    const inflow = surplus + recycled;
    for (const t of TIERS) pools[t.id] += inflow * alloc[t.id];
    const snapshot = { ...pools };
    rows.push({ year: y, surplus, recycled, pools: snapshot, total: TIERS.reduce((s, t) => s + snapshot[t.id], 0) });
    surplus *= 1 + input.surplusGrowth;
  }
  return rows;
}

export const atYear = (rows: WaterfallYear[], year: number) => rows.find((r) => r.year === year) ?? rows[rows.length - 1];
