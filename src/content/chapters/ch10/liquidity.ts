/**
 * Liquidity-at-death math. Pure and illustrative: the user supplies the transfer tax rate and
 * the exemption they expect to have available, because both change with law, residence and prior gifts.
 */

export interface LiquidityInput {
  estateValue: number;
  /** Share of the estate that cannot be sold quickly at fair value (business, real estate, private funds), 0–1 */
  illiquidShare: number;
  /** Exemption or other reductions the user expects to apply before tax (USD). */
  exemptionApplied: number;
  /** Effective transfer tax rate on the taxable base, 0–1 */
  transferTaxRate: number;
  /** Administration, legal, appraisal and settlement costs as a share of the estate, 0–1 */
  settlementCostRate: number;
  /** Debts, buy-sell obligations and equalisation bequests payable in cash at death (USD) */
  cashObligations: number;
  /** Liquidity outside the estate value already available at death (e.g. existing insurance in an ILIT) */
  existingDeathBenefit: number;
}

export interface LiquidityResult {
  liquidAssets: number;
  illiquidAssets: number;
  taxableBase: number;
  transferTax: number;
  settlementCosts: number;
  totalCashNeed: number;
  availableLiquidity: number;
  gap: number;
  /** Share of the illiquid estate that would have to be sold to cover the gap without insurance */
  forcedSaleShare: number;
}

export const DEFAULT_LIQUIDITY: LiquidityInput = {
  estateValue: 40_000_000,
  illiquidShare: 0.85,
  exemptionApplied: 15_000_000,
  transferTaxRate: 0.40,
  settlementCostRate: 0.02,
  cashObligations: 1_500_000,
  existingDeathBenefit: 0,
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function liquidityGap(i: LiquidityInput): LiquidityResult {
  const estate = Math.max(0, i.estateValue);
  const illiquidAssets = estate * clamp01(i.illiquidShare);
  const liquidAssets = estate - illiquidAssets;
  const taxableBase = Math.max(0, estate - Math.max(0, i.exemptionApplied));
  const transferTax = taxableBase * clamp01(i.transferTaxRate);
  const settlementCosts = estate * clamp01(i.settlementCostRate);
  const totalCashNeed = transferTax + settlementCosts + Math.max(0, i.cashObligations);
  const availableLiquidity = liquidAssets + Math.max(0, i.existingDeathBenefit);
  const gap = Math.max(0, totalCashNeed - availableLiquidity);
  const forcedSaleShare = illiquidAssets > 0 ? Math.min(1, gap / illiquidAssets) : 0;
  return { liquidAssets, illiquidAssets, taxableBase, transferTax, settlementCosts, totalCashNeed, availableLiquidity, gap, forcedSaleShare };
}

export interface PremiumComparison {
  termTotal: number;
  permanentTotal: number;
  /** Simple opportunity cost of the extra permanent premium invested at the stated rate over the horizon */
  extraPremiumGrownElsewhere: number;
  /** Years of the horizon the term policy actually covers */
  termCoverageYears: number;
}

/**
 * Compares cumulative premiums for term vs permanent over a horizon. The term policy covers only
 * `termYears`; beyond that it is assumed to lapse (coverage gap), which is the honest comparison.
 */
export function comparePremiums(termAnnual: number, termYears: number, permanentAnnual: number, horizonYears: number, altReturn: number): PremiumComparison {
  const H = Math.max(0, Math.floor(horizonYears));
  const termCoverageYears = Math.min(H, Math.max(0, Math.floor(termYears)));
  const termTotal = Math.max(0, termAnnual) * termCoverageYears;
  const permanentTotal = Math.max(0, permanentAnnual) * H;
  let grown = 0;
  for (let y = 1; y <= H; y++) {
    const extra = Math.max(0, permanentAnnual) - (y <= termCoverageYears ? Math.max(0, termAnnual) : 0);
    grown = grown * (1 + altReturn) + Math.max(0, extra);
  }
  return { termTotal, permanentTotal, extraPremiumGrownElsewhere: grown, termCoverageYears };
}
