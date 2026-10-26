/** Pure balance-sheet math for the Chapter 01 Balance Sheet Builder. Tested in balanceSheet.test.ts. */

export type AssetKind = 'cash' | 'securities' | 'retirement' | 'residence' | 'rental' | 'business' | 'vehicles' | 'other';
export type LiabilityKind = 'mortgage' | 'rental-debt' | 'business-debt' | 'consumer' | 'other';

export interface AssetLine { id: string; label: string; kind: AssetKind; value: number }
export interface LiabilityLine { id: string; label: string; kind: LiabilityKind; value: number; annualService?: number }

export const ASSET_META: Record<AssetKind, { label: string; liquid: boolean; working: boolean }> = {
  cash: { label: 'Cash', liquid: true, working: false },
  securities: { label: 'Marketable securities', liquid: true, working: true },
  retirement: { label: 'Retirement accounts', liquid: false, working: true },
  residence: { label: 'Primary residence', liquid: false, working: false },
  rental: { label: 'Rental / income property', liquid: false, working: true },
  business: { label: 'Operating business', liquid: false, working: true },
  vehicles: { label: 'Vehicles & personal property', liquid: false, working: false },
  other: { label: 'Other', liquid: false, working: false },
};

export interface BalanceSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  liquidAssets: number;
  workingAssets: number;
  consumptionAssets: number;
  /** liquid assets / total assets */
  liquidShare: number;
  /** working assets / total assets */
  workingShare: number;
  /** total liabilities / total assets */
  leverage: number;
  /** liquid assets / annual fixed obligations (years of runway without labor income) */
  liquidityRatio: number;
}

export function summarize(assets: AssetLine[], liabilities: LiabilityLine[], annualLivingCosts: number): BalanceSummary {
  const totalAssets = assets.reduce((s, a) => s + Math.max(0, a.value), 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + Math.max(0, l.value), 0);
  const liquidAssets = assets.filter((a) => ASSET_META[a.kind].liquid).reduce((s, a) => s + Math.max(0, a.value), 0);
  const workingAssets = assets.filter((a) => ASSET_META[a.kind].working).reduce((s, a) => s + Math.max(0, a.value), 0);
  const consumptionAssets = totalAssets - workingAssets;
  const debtService = liabilities.reduce((s, l) => s + Math.max(0, l.annualService ?? 0), 0);
  const obligations = Math.max(0, annualLivingCosts) + debtService;
  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
    liquidAssets,
    workingAssets,
    consumptionAssets,
    liquidShare: totalAssets > 0 ? liquidAssets / totalAssets : 0,
    workingShare: totalAssets > 0 ? workingAssets / totalAssets : 0,
    leverage: totalAssets > 0 ? totalLiabilities / totalAssets : 0,
    liquidityRatio: obligations > 0 ? liquidAssets / obligations : Infinity,
  };
}

/** The structured view: the same lines re-grouped under the vehicles a planner would typically use. */
export interface EntityGroup {
  id: string;
  name: string;
  kind: 'person' | 'trust' | 'llc' | 'holdco' | 'account';
  assets: AssetLine[];
  liabilities: LiabilityLine[];
  equity: number;
  note: string;
}

export function regroup(assets: AssetLine[], liabilities: LiabilityLine[]): EntityGroup[] {
  const groups: EntityGroup[] = [];
  const push = (g: Omit<EntityGroup, 'equity'>) => {
    const a = g.assets.reduce((s, x) => s + x.value, 0);
    const l = g.liabilities.reduce((s, x) => s + x.value, 0);
    if (g.assets.length || g.liabilities.length) groups.push({ ...g, equity: a - l });
  };
  const by = (k: AssetKind) => assets.filter((a) => a.kind === k && a.value > 0);
  const lby = (k: LiabilityKind) => liabilities.filter((l) => l.kind === k && l.value > 0);

  push({ id: 'personal', name: 'Personal names', kind: 'person', assets: [...by('residence'), ...by('vehicles'), ...by('cash')], liabilities: [...lby('mortgage'), ...lby('consumer'), ...lby('other')], note: 'Residence, cars and operating cash usually stay personal: homestead rules, lender terms and practicality.' });
  push({ id: 'rlt', name: 'Revocable living trust', kind: 'trust', assets: [...by('securities'), ...by('other')], liabilities: [], note: 'Probate avoidance and incapacity planning. Tax-neutral; offers no creditor protection to the grantor.' });
  push({ id: 'retire', name: 'Retirement accounts', kind: 'account', assets: by('retirement'), liabilities: [], note: 'Already a separate legal wrapper with its own creditor protection and tax rules; beneficiary designations control succession.' });
  const rentals = by('rental');
  rentals.forEach((r, i) => push({ id: `llc-${i}`, name: `Property LLC ${i + 1}`, kind: 'llc', assets: [r], liabilities: i === 0 ? lby('rental-debt') : [], note: 'One property per LLC so a claim arising at one address does not reach the others. Lender consent needed to move financed property.' }));
  const biz = by('business');
  if (biz.length) push({ id: 'holdco', name: 'Family holding company', kind: 'holdco', assets: biz, liabilities: lby('business-debt'), note: 'Holds operating interests; separates ownership from operations and gives the family one place to make ownership decisions.' });
  return groups;
}

export function sumEquity(groups: EntityGroup[]) {
  return groups.reduce((s, g) => s + g.equity, 0);
}
