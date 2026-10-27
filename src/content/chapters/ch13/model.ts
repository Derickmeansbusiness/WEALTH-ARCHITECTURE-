/**
 * Transfer Path Comparator — Chapter 13 (Wealth Transfer).
 * Compares three stylized paths over three generational transfers:
 *   direct   — outright inheritance through probate, divided equally among heirs each generation
 *   trust    — a single GST-exempt dynasty trust funded by lifetime gift, consolidated ownership
 *   business — succession to one operating successor per generation, siblings bought out via buy-sell
 * Transfer-tax rate and exemption are user-entered because they are indexed and legislated.
 */

export type Path = 'direct' | 'trust' | 'business';

export interface TransferInput {
  estateValue: number;
  /** heirs per decedent each generation */
  heirs: number;
  /** annual growth (0.05 = 5%) */
  growth: number;
  /** total horizon in years, split into three generational transfers */
  years: number;
  /** flat transfer-tax rate applied above the exemption (0.40 = 40%) */
  taxRate: number;
  /** exemption per decedent (or per settlor at trust funding) */
  exemption: number;
  /** adjusted basis as a fraction of value at the start (0.3 = 30%) */
  basisFraction: number;
  /** valuation discount applied to non-controlling business interests (0.25 = 25%) */
  discount: number;
  /** probate / administration cost as a fraction of value passing (direct path) */
  probateCost: number;
  /** trust administration cost as a fraction of value at each transfer point (trust path) */
  trustAdminCost: number;
}

export interface GenerationStep {
  gen: number;
  year: number;
  valueBefore: number;
  decedents: number;
  taxable: number;
  tax: number;
  adminCost: number;
  valueAfter: number;
  owners: number;
}

export interface PathResult {
  path: Path;
  steps: GenerationStep[];
  ownersAfter: number;
  /** legal owners (title holders) vs economic beneficiaries */
  legalOwners: number;
  totalTax: number;
  totalAdmin: number;
  finalValue: number;
  /** value the family would have had with no tax or cost at all */
  grossValue: number;
  basisFlag: string;
  basisDetail: string;
  /** embedded (unrealized) gain carried at the end, in dollars; 0 if stepped-up */
  embeddedGain: number;
}

export const DEFAULT_TRANSFER: TransferInput = {
  estateValue: 20_000_000, heirs: 3, growth: 0.05, years: 90, taxRate: 0.40, exemption: 15_000_000,
  basisFraction: 0.30, discount: 0.25, probateCost: 0.03, trustAdminCost: 0.005,
};

const g = (v: number, r: number, y: number) => v * Math.pow(1 + r, y);

export function simulatePath(path: Path, inp: TransferInput): PathResult {
  const genYears = inp.years / 3;
  const steps: GenerationStep[] = [];
  let value = inp.estateValue;
  let totalTax = 0, totalAdmin = 0;
  let owners = 1;
  let basis = inp.estateValue * inp.basisFraction;

  if (path === 'trust') {
    // Funding gift at year 0: gift tax above exemption; GST exemption allocated so later generations are untaxed.
    const taxable0 = Math.max(0, inp.estateValue - inp.exemption);
    const tax0 = taxable0 * inp.taxRate;
    totalTax += tax0;
    value = inp.estateValue - tax0; // tax paid from outside the trust in reality; shown as a reduction for comparability
    steps.push({ gen: 0, year: 0, valueBefore: inp.estateValue, decedents: 1, taxable: taxable0, tax: tax0, adminCost: 0, valueAfter: value, owners: 1 });
    basis = value * inp.basisFraction; // carryover
  }

  for (let k = 1; k <= 3; k++) {
    const year = Math.round(genYears * k);
    const valueBefore = g(value, inp.growth, genYears);
    let decedents = 1, taxable = 0, tax = 0, admin = 0, after = valueBefore;
    if (path === 'direct') {
      decedents = owners;
      taxable = Math.max(0, valueBefore - inp.exemption * decedents);
      tax = taxable * inp.taxRate;
      admin = valueBefore * inp.probateCost;
      after = valueBefore - tax - admin;
      owners = owners * inp.heirs;
      basis = after; // step-up at each death
    } else if (path === 'trust') {
      decedents = 0;
      admin = valueBefore * inp.trustAdminCost;
      after = valueBefore - admin;
      owners = 1; // trustee holds title; beneficiaries multiply but ownership does not fragment
    } else {
      // business succession: one successor per generation; non-controlling interests transferred at a discount.
      decedents = 1;
      const discounted = valueBefore * (1 - inp.discount);
      taxable = Math.max(0, discounted - inp.exemption);
      tax = taxable * inp.taxRate;
      admin = valueBefore * (inp.probateCost / 3); // mostly avoids probate via lifetime transfers / buy-sell
      after = valueBefore - tax - admin;
      owners = 1;
      // mixed basis: assume half of value passed by lifetime gift (carryover), half at death (step-up)
      basis = basis * Math.pow(1 + inp.growth, 0) + (after - basis) * 0.5;
    }
    steps.push({ gen: k, year, valueBefore, decedents, taxable, tax, adminCost: admin, valueAfter: after, owners });
    totalTax += tax; totalAdmin += admin; value = after;
  }

  const grossValue = g(inp.estateValue, inp.growth, inp.years);
  const beneficiaries = Math.pow(inp.heirs, 3);
  const embeddedGain = path === 'direct' ? 0 : Math.max(0, value - basis);

  const basisFlag = path === 'direct' ? 'Stepped-up at each death (§1014)' : path === 'trust' ? 'Carryover basis (§1015) — no step-up inside the trust' : 'Mixed: gifted interests carry over, retained interests step up';
  const basisDetail = path === 'direct'
    ? 'Each inheritance resets basis to date-of-death value, erasing unrealized gain. The price is that the whole value is in each estate for transfer tax.'
    : path === 'trust'
      ? 'Assets gifted to an irrevocable trust keep the donor\'s basis (and Rev. Rul. 2023-2 confirms grantor-trust assets excluded from the estate get no step-up at death). Heirs who eventually sell pay capital gains on all growth since funding; swap powers and distributions before death are the standard mitigations.'
      : 'Interests given during life carry over basis; interests held until death step up. Buy-sell purchases give the buyer a cost basis equal to the price paid.';

  return {
    path, steps, ownersAfter: path === 'direct' ? owners : beneficiaries, legalOwners: path === 'direct' ? owners : 1,
    totalTax, totalAdmin, finalValue: value, grossValue, basisFlag, basisDetail, embeddedGain,
  };
}

export function compareAll(inp: TransferInput): Record<Path, PathResult> {
  return { direct: simulatePath('direct', inp), trust: simulatePath('trust', inp), business: simulatePath('business', inp) };
}

/** Average fractional stake per legal owner after three generations. */
export const averageStake = (legalOwners: number) => (legalOwners > 0 ? 1 / legalOwners : 0);
