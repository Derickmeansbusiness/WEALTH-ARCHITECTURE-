/**
 * Capital Stack Visualizer — pure math built on distributeWaterfall from @/lib/finance.
 * A tranche's rank is its payment priority (1 = most senior). Common equity is always residual.
 */
import { distributeWaterfall, type Tranche } from '@/lib/finance';

export type TrancheKind = Tranche['kind'];
export interface StackTranche { id: string; name: string; kind: TrancheKind; amount: number; rate: number; rank: number }

export const KIND_META: Record<TrancheKind, { label: string; color: 'green' | 'blue' | 'amber' | 'violet' | 'gold'; security: string; typicalRate: string }> = {
  senior: { label: 'Senior Secured Debt', color: 'green', security: 'First lien on the asset; paid first from cash flow and from any sale.', typicalRate: '5–8%' },
  subordinated: { label: 'Subordinated Debt', color: 'blue', security: 'Second lien or contractually junior under an intercreditor agreement; paid after senior.', typicalRate: '8–12%' },
  mezzanine: { label: 'Mezzanine Financing', color: 'amber', security: 'Usually unsecured at the asset level; secured by a pledge of the equity in the owner entity (structural subordination).', typicalRate: '11–16%' },
  preferred: { label: 'Preferred Equity', color: 'violet', security: 'Equity, not debt: a priority return and liquidation preference ahead of common, behind every lender.', typicalRate: '12–18% preferred return' },
  common: { label: 'Common Equity', color: 'gold', security: 'Residual owner. Last paid, first to absorb losses, unlimited upside.', typicalRate: 'residual (target 18–25%+)' },
};

export const TARGET_TOTAL = 5_000_000;

export function defaultStack(mode: 'development' | 'acquisition'): StackTranche[] {
  if (mode === 'development') {
    return [
      { id: 'senior', name: 'Senior construction loan', kind: 'senior', amount: 2_750_000, rate: 0.075, rank: 1 },
      { id: 'sub', name: 'Subordinated loan', kind: 'subordinated', amount: 500_000, rate: 0.10, rank: 2 },
      { id: 'mezz', name: 'Mezzanine', kind: 'mezzanine', amount: 500_000, rate: 0.14, rank: 3 },
      { id: 'pref', name: 'Preferred equity', kind: 'preferred', amount: 500_000, rate: 0.12, rank: 4 },
      { id: 'common', name: 'Common equity (family)', kind: 'common', amount: 750_000, rate: 0.20, rank: 5 },
    ];
  }
  return [
    { id: 'senior', name: 'Senior term loan', kind: 'senior', amount: 2_500_000, rate: 0.07, rank: 1 },
    { id: 'sub', name: 'Seller note (subordinated)', kind: 'subordinated', amount: 750_000, rate: 0.08, rank: 2 },
    { id: 'mezz', name: 'Mezzanine', kind: 'mezzanine', amount: 500_000, rate: 0.13, rank: 3 },
    { id: 'pref', name: 'Preferred equity', kind: 'preferred', amount: 250_000, rate: 0.12, rank: 4 },
    { id: 'common', name: 'Common equity (family)', kind: 'common', amount: 1_000_000, rate: 0.22, rank: 5 },
  ];
}

export const stackTotal = (t: StackTranche[]) => t.reduce((s, x) => s + Math.max(0, x.amount), 0);
export const stackGap = (t: StackTranche[], target = TARGET_TOTAL) => target - stackTotal(t);

export const byRank = (t: StackTranche[]) => [...t].sort((a, b) => a.rank - b.rank);

/** Re-number ranks 1..n in current order, keeping common last. */
export function normalizeRanks(t: StackTranche[]): StackTranche[] {
  const sorted = byRank(t);
  const nonCommon = sorted.filter((x) => x.kind !== 'common');
  const common = sorted.filter((x) => x.kind === 'common');
  return [...nonCommon, ...common].map((x, i) => ({ ...x, rank: i + 1 }));
}

export function moveTranche(t: StackTranche[], id: string, dir: -1 | 1): StackTranche[] {
  const sorted = normalizeRanks(t);
  const i = sorted.findIndex((x) => x.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= sorted.length) return sorted;
  if (sorted[i].kind === 'common' || sorted[j].kind === 'common') return sorted;
  const copy = [...sorted];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy.map((x, k) => ({ ...x, rank: k + 1 }));
}

export interface WaterfallRow { id: string; name: string; kind: TrancheKind; rank: number; due: number; paid: number; shortfall: number; coverage: number }
export interface PaymentWaterfall { rows: WaterfallRow[]; totalDue: number; totalPaid: number; residualToCommon: number; commonTargetReturn: number; commonAmount: number }

/** Annual payment waterfall: each non-common tranche is owed amount × rate (interest or preferred return); common gets the residual. */
export function paymentWaterfall(tranches: StackTranche[], cashAvailable: number): PaymentWaterfall {
  const adapted: Tranche[] = byRank(tranches).map((t) => ({ id: t.id, name: t.name, kind: t.kind, rank: t.rank, amount: t.kind === 'common' ? t.amount : t.amount * t.rate, rate: 0 }));
  const out = distributeWaterfall(adapted, Math.max(0, cashAvailable));
  const common = tranches.find((t) => t.kind === 'common');
  const rows: WaterfallRow[] = out.map((o) => {
    const src = tranches.find((t) => t.id === o.id)!;
    const due = src.kind === 'common' ? src.amount * src.rate : src.amount * src.rate;
    const paid = o.paid;
    return { id: o.id, name: o.name, kind: o.kind, rank: o.rank, due, paid, shortfall: src.kind === 'common' ? Math.max(0, due - paid) : o.shortfall, coverage: due > 0 ? paid / due : 1 };
  });
  const totalDue = rows.filter((r) => r.kind !== 'common').reduce((s, r) => s + r.due, 0);
  const totalPaid = rows.filter((r) => r.kind !== 'common').reduce((s, r) => s + r.paid, 0);
  const residualToCommon = rows.filter((r) => r.kind === 'common').reduce((s, r) => s + r.paid, 0);
  return { rows, totalDue, totalPaid, residualToCommon, commonTargetReturn: common ? common.amount * common.rate : 0, commonAmount: common?.amount ?? 0 };
}

export interface LiquidationRow { id: string; name: string; kind: TrancheKind; rank: number; claim: number; recovered: number; loss: number; recoveryPct: number }
export interface Liquidation { rows: LiquidationRow[]; saleValue: number; totalClaims: number; totalLoss: number; surplusToCommon: number }

/** Liquidation: repay principal top-down; losses are absorbed bottom-up (common first). */
export function liquidationWaterfall(tranches: StackTranche[], saleValue: number): Liquidation {
  const adapted: Tranche[] = byRank(tranches).map((t) => ({ id: t.id, name: t.name, kind: t.kind, rank: t.rank, amount: t.amount, rate: 0 }));
  const out = distributeWaterfall(adapted, Math.max(0, saleValue));
  const rows: LiquidationRow[] = out.map((o) => {
    const claim = o.amount;
    const recovered = o.paid;
    return { id: o.id, name: o.name, kind: o.kind, rank: o.rank, claim, recovered, loss: Math.max(0, claim - recovered), recoveryPct: claim > 0 ? recovered / claim : 0 };
  });
  const totalClaims = rows.reduce((s, r) => s + r.claim, 0);
  const totalLoss = rows.reduce((s, r) => s + r.loss, 0);
  const commonRow = rows.find((r) => r.kind === 'common');
  const surplusToCommon = commonRow ? Math.max(0, commonRow.recovered - commonRow.claim) : 0;
  return { rows, saleValue, totalClaims, totalLoss, surplusToCommon };
}

/** Illustrative blended cost of capital (WACC-style, pre-tax, no tax shield). */
export function blendedCost(tranches: StackTranche[]): { blended: number; parts: { id: string; name: string; kind: TrancheKind; weight: number; rate: number; contribution: number }[]; debtShare: number; equityShare: number } {
  const total = stackTotal(tranches);
  const parts = byRank(tranches).map((t) => {
    const weight = total > 0 ? Math.max(0, t.amount) / total : 0;
    return { id: t.id, name: t.name, kind: t.kind, weight, rate: t.rate, contribution: weight * t.rate };
  });
  const debtShare = parts.filter((p) => p.kind === 'senior' || p.kind === 'subordinated' || p.kind === 'mezzanine').reduce((s, p) => s + p.weight, 0);
  return { blended: parts.reduce((s, p) => s + p.contribution, 0), parts, debtShare, equityShare: 1 - debtShare };
}
