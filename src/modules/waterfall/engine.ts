/**
 * Family Capital Waterfall engine — pure yearly simulation of capital cascading
 * LABOR → BUSINESS → REAL ESTATE → INVESTMENTS → PERMANENT CAPITAL → INSURANCE / LIQUIDITY → FAMILY CAPITAL,
 * with a recycle loop pushing a share of family capital back up into productive tiers.
 * Every assumption is an explicit input. Tested in engine.test.ts.
 */

export type TierId = 'labor' | 'business' | 'realEstate' | 'investments' | 'permanent' | 'insurance' | 'family';
export const BASIN_TIERS: Exclude<TierId, 'labor'>[] = ['business', 'realEstate', 'investments', 'permanent', 'insurance', 'family'];
export const ALL_TIERS: TierId[] = ['labor', ...BASIN_TIERS];

export interface WaterfallInputs {
  years: number;
  laborSurplus: number;        // annual, year 1
  laborGrowth: number;         // annual decimal growth in surplus
  alloc: { business: number; realEstate: number; investments: number; permanent: number; insurance: number }; // share retained of what reaches the tier
  growth: { business: number; realEstate: number; investments: number; permanent: number; insurance: number; family: number }; // total annual growth of the tier's balance
  yieldDown: { business: number; realEstate: number; investments: number; permanent: number; insurance: number }; // share of balance paid downward each year as cash
  recycleRate: number;         // share of family capital re-deployed upward each year
  recycleSplit: { business: number; realEstate: number; investments: number }; // sums to 1
}

export const DEFAULT_WATERFALL: WaterfallInputs = {
  years: 30,
  laborSurplus: 120_000,
  laborGrowth: 0.02,
  alloc: { business: 0.35, realEstate: 0.3, investments: 0.35, permanent: 0.2, insurance: 0.15 },
  growth: { business: 0.06, realEstate: 0.03, investments: 0.05, permanent: 0.04, insurance: 0.03, family: 0.01 },
  yieldDown: { business: 0.05, realEstate: 0.035, investments: 0.02, permanent: 0.02, insurance: 0 },
  recycleRate: 0.25,
  recycleSplit: { business: 0.4, realEstate: 0.3, investments: 0.3 },
};

export interface YearRow {
  year: number;
  /** labor surplus that entered this year */
  labor: number;
  balances: Record<Exclude<TierId, 'labor'>, number>;
  /** cash crossing from tier i to tier i+1 this year, indexed by the receiving basin */
  cascade: Record<Exclude<TierId, 'labor'>, number>;
  recycle: { business: number; realEstate: number; investments: number; total: number };
  total: number;
}

const r2 = (n: number) => Math.round(n * 100) / 100;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function simulateWaterfall(inp: WaterfallInputs): YearRow[] {
  const years = Math.max(1, Math.min(100, Math.round(inp.years)));
  const bal = { business: 0, realEstate: 0, investments: 0, permanent: 0, insurance: 0, family: 0 };
  const rows: YearRow[] = [];
  // year 0 — empty basins
  rows.push({ year: 0, labor: 0, balances: { ...bal }, cascade: { business: 0, realEstate: 0, investments: 0, permanent: 0, insurance: 0, family: 0 }, recycle: { business: 0, realEstate: 0, investments: 0, total: 0 }, total: 0 });

  for (let y = 1; y <= years; y++) {
    const labor = inp.laborSurplus * Math.pow(1 + inp.laborGrowth, y - 1);
    const cascade = { business: 0, realEstate: 0, investments: 0, permanent: 0, insurance: 0, family: 0 };

    // 1. Growth accrues on opening balances; the cash-yield part is paid downward.
    const paidDown: Record<keyof typeof inp.yieldDown, number> = { business: 0, realEstate: 0, investments: 0, permanent: 0, insurance: 0 };
    for (const t of ['business', 'realEstate', 'investments', 'permanent', 'insurance'] as const) {
      const opening = bal[t];
      const grown = opening * (1 + inp.growth[t]);
      const yieldCash = opening * clamp01(inp.yieldDown[t]);
      bal[t] = Math.max(0, grown - yieldCash);
      paidDown[t] = yieldCash;
    }
    bal.family = bal.family * (1 + inp.growth.family);

    // 2. Cascade: labor surplus enters at the top; each tier retains its allocation share and passes the rest down, plus its own yield.
    let flow = labor;
    cascade.business = flow;
    const retainB = flow * clamp01(inp.alloc.business); bal.business += retainB; flow = flow - retainB + paidDown.business;
    cascade.realEstate = flow;
    const retainR = flow * clamp01(inp.alloc.realEstate); bal.realEstate += retainR; flow = flow - retainR + paidDown.realEstate;
    cascade.investments = flow;
    const retainI = flow * clamp01(inp.alloc.investments); bal.investments += retainI; flow = flow - retainI + paidDown.investments;
    cascade.permanent = flow;
    const retainP = flow * clamp01(inp.alloc.permanent); bal.permanent += retainP; flow = flow - retainP + paidDown.permanent;
    cascade.insurance = flow;
    const retainS = flow * clamp01(inp.alloc.insurance); bal.insurance += retainS; flow = flow - retainS + paidDown.insurance;
    cascade.family = flow;
    bal.family += flow;

    // 3. Recycle: a share of family capital is redeployed upward.
    const rec = bal.family * clamp01(inp.recycleRate);
    const splitSum = inp.recycleSplit.business + inp.recycleSplit.realEstate + inp.recycleSplit.investments || 1;
    const recB = rec * (inp.recycleSplit.business / splitSum);
    const recR = rec * (inp.recycleSplit.realEstate / splitSum);
    const recI = rec * (inp.recycleSplit.investments / splitSum);
    bal.family -= rec; bal.business += recB; bal.realEstate += recR; bal.investments += recI;

    const balances = { business: r2(bal.business), realEstate: r2(bal.realEstate), investments: r2(bal.investments), permanent: r2(bal.permanent), insurance: r2(bal.insurance), family: r2(bal.family) };
    rows.push({
      year: y,
      labor: r2(labor),
      balances,
      cascade: { business: r2(cascade.business), realEstate: r2(cascade.realEstate), investments: r2(cascade.investments), permanent: r2(cascade.permanent), insurance: r2(cascade.insurance), family: r2(cascade.family) },
      recycle: { business: r2(recB), realEstate: r2(recR), investments: r2(recI), total: r2(rec) },
      total: r2(Object.values(balances).reduce((s, v) => s + v, 0)),
    });
  }
  return rows;
}

/** Sum of labor surplus contributed through year n. */
export function cumulativeLabor(rows: YearRow[], year: number): number {
  return r2(rows.filter((r) => r.year >= 1 && r.year <= year).reduce((s, r) => s + r.labor, 0));
}
