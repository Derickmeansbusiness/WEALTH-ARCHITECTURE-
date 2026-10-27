/**
 * Family Wealth Debt Dashboard — consolidation math. Related-party loans are eliminated on consolidation
 * (lender's receivable offsets borrower's payable), cross-collateral and guarantee exposure are detected
 * from the loan graph. Balances use balanceAfter / buildLoan from @/lib/finance.
 */
import { balanceAfter, buildLoan, type LoanStructure } from '@/lib/finance';
import type { SavedScenario } from '@/store/useAppStore';
import { readLoanTerms } from './leverage';

export type EntityKind = 'trust' | 'holding-company' | 'operating-company' | 'property-company' | 'investment-company' | 'scenario';
export interface DashEntity { id: string; name: string; kind: EntityKind; cash: number; ownerId?: string; ownerPct?: number }
export interface DashAsset { id: string; name: string; entityId: string; value: number; kind: 'real-estate' | 'business' | 'portfolio' | 'other' }
export interface DashPerson { id: string; name: string; role: string }
export interface DashLender { id: string; name: string; type: 'bank' | 'private' | 'scenario' }
export interface DashLoan {
  id: string;
  name: string;
  borrowerId: string;
  /** External lender id (DashLender) or, for related-party loans, the lending entity id */
  lenderId: string;
  principal: number;
  rate: number;
  floating: boolean;
  structure: LoanStructure;
  termMonths: number;
  amortizationMonths?: number;
  originated: string; // ISO date
  collateralIds: string[];
  guarantorIds: string[];
  relatedParty: boolean;
  source: 'demo' | 'scenario';
  scenarioId?: string;
}
export interface FamilyData { entities: DashEntity[]; assets: DashAsset[]; people: DashPerson[]; lenders: DashLender[]; loans: DashLoan[] }

export function monthsBetween(fromISO: string, asOf: Date): number {
  const d = new Date(fromISO);
  if (isNaN(d.getTime())) return 0;
  return Math.max(0, (asOf.getFullYear() - d.getFullYear()) * 12 + (asOf.getMonth() - d.getMonth()));
}

export function maturityDate(loan: DashLoan): Date {
  const d = new Date(loan.originated);
  d.setMonth(d.getMonth() + loan.termMonths);
  return d;
}

export function monthsToMaturity(loan: DashLoan, asOf: Date): number {
  return loan.termMonths - monthsBetween(loan.originated, asOf);
}

/** Outstanding balance as of a date (balanceAfter on the loan's amortization schedule). */
export function loanBalance(loan: DashLoan, asOf: Date): number {
  const k = monthsBetween(loan.originated, asOf);
  if (k >= loan.termMonths) return 0; // matured (treated as repaid for the dashboard)
  const r = loan.rate / 12;
  if (loan.structure === 'interest-only') return loan.principal;
  if (loan.structure === 'balloon') return balanceAfter(loan.principal, r, loan.amortizationMonths ?? loan.termMonths * 2, k);
  return balanceAfter(loan.principal, r, loan.termMonths, k);
}

/** Balance due at maturity (balloon) — zero for amortizing. */
export function balanceAtMaturity(loan: DashLoan): number {
  const r = loan.rate / 12;
  if (loan.structure === 'amortizing') return 0;
  if (loan.structure === 'interest-only') return loan.principal;
  return balanceAfter(loan.principal, r, loan.amortizationMonths ?? loan.termMonths * 2, loan.termMonths);
}

export function annualDebtService(loan: DashLoan, rateOverride?: number): number {
  return buildLoan({ principal: loan.principal, annualRate: rateOverride ?? loan.rate, termMonths: loan.termMonths, structure: loan.structure, amortizationMonths: loan.amortizationMonths }).annualDebtService;
}

export interface Consolidation {
  asOf: Date;
  totalAssets: number;          // asset values + cash
  totalCash: number;
  externalLiabilities: number;
  relatedPartyLiabilities: number;  // gross intercompany payables (eliminated on consolidation)
  eliminated: number;               // = relatedPartyLiabilities
  netEquity: number;                // totalAssets − externalLiabilities
  liquidity: number;                // cash across entities
  annualDebtService: number;        // external only
  annualDebtServiceAll: number;     // incl. related-party (cash actually moving between pockets)
  floatingBalance: number;
  floatingShare: number;
  sensitivity200: number;           // extra annual debt service if floating rates +200bps (external)
  balances: Record<string, number>;
  byEntity: { entityId: string; name: string; assets: number; external: number; related: number; equity: number }[];
  maturities: { year: number; external: number; related: number; loanIds: string[] }[];
  upcoming: { loan: DashLoan; balance: number; dueAtMaturity: number; monthsToMaturity: number; maturity: Date }[];
  crossCollateral: { assetId: string; assetName: string; loanIds: string[]; totalPledged: number; assetValue: number }[];
  guarantees: { personId: string; name: string; loanIds: string[]; exposure: number }[];
  relatedLoans: { loan: DashLoan; lenderName: string; borrowerName: string; balance: number }[];
}

export function consolidate(data: FamilyData, asOf: Date): Consolidation {
  const { entities, assets, people, lenders, loans } = data;
  const nameOf = (id: string) => entities.find((e) => e.id === id)?.name ?? lenders.find((l) => l.id === id)?.name ?? id;
  const balances: Record<string, number> = {};
  for (const l of loans) balances[l.id] = loanBalance(l, asOf);
  const external = loans.filter((l) => !l.relatedParty);
  const related = loans.filter((l) => l.relatedParty);
  const sum = (ls: DashLoan[]) => ls.reduce((s, l) => s + balances[l.id], 0);

  const totalCash = entities.reduce((s, e) => s + e.cash, 0);
  const totalAssets = assets.reduce((s, a) => s + a.value, 0) + totalCash;
  const externalLiabilities = sum(external);
  const relatedPartyLiabilities = sum(related);
  const annualDebtServiceExt = external.reduce((s, l) => s + (balances[l.id] > 0 ? annualDebtService(l) : 0), 0);
  const annualDebtServiceAll = loans.reduce((s, l) => s + (balances[l.id] > 0 ? annualDebtService(l) : 0), 0);
  const floatingBalance = external.filter((l) => l.floating).reduce((s, l) => s + balances[l.id], 0);
  const sensitivity200 = external.filter((l) => l.floating && balances[l.id] > 0).reduce((s, l) => s + (annualDebtService(l, l.rate + 0.02) - annualDebtService(l)), 0);

  const byEntity = entities.map((e) => {
    const a = assets.filter((x) => x.entityId === e.id).reduce((s, x) => s + x.value, 0) + e.cash;
    const ext = sum(external.filter((l) => l.borrowerId === e.id));
    const rel = sum(related.filter((l) => l.borrowerId === e.id));
    return { entityId: e.id, name: e.name, assets: a, external: ext, related: rel, equity: a - ext - rel };
  });

  const matMap = new Map<number, { external: number; related: number; loanIds: string[] }>();
  for (const l of loans) {
    if (balances[l.id] <= 0) continue;
    const y = maturityDate(l).getFullYear();
    const row = matMap.get(y) ?? { external: 0, related: 0, loanIds: [] };
    const due = balanceAtMaturity(l);
    if (l.relatedParty) row.related += due; else row.external += due;
    row.loanIds.push(l.id);
    matMap.set(y, row);
  }
  const maturities = [...matMap.entries()].sort((a, b) => a[0] - b[0]).map(([year, r]) => ({ year, ...r }));

  const upcoming = loans
    .filter((l) => balances[l.id] > 0)
    .map((l) => ({ loan: l, balance: balances[l.id], dueAtMaturity: balanceAtMaturity(l), monthsToMaturity: monthsToMaturity(l, asOf), maturity: maturityDate(l) }))
    .filter((u) => u.monthsToMaturity <= 24)
    .sort((a, b) => a.monthsToMaturity - b.monthsToMaturity);

  const collMap = new Map<string, string[]>();
  for (const l of loans) for (const a of l.collateralIds) collMap.set(a, [...(collMap.get(a) ?? []), l.id]);
  const crossCollateral = [...collMap.entries()].filter(([, ids]) => ids.length > 1).map(([assetId, loanIds]) => {
    const asset = assets.find((a) => a.id === assetId);
    return { assetId, assetName: asset?.name ?? assetId, loanIds, totalPledged: loanIds.reduce((s, id) => s + balances[id], 0), assetValue: asset?.value ?? 0 };
  });

  const guarantees = people.map((p) => {
    const ls = loans.filter((l) => l.guarantorIds.includes(p.id) && balances[l.id] > 0);
    return { personId: p.id, name: p.name, loanIds: ls.map((l) => l.id), exposure: ls.reduce((s, l) => s + balances[l.id], 0) };
  }).filter((g) => g.loanIds.length > 0).sort((a, b) => b.exposure - a.exposure);

  const relatedLoans = related.map((l) => ({ loan: l, lenderName: nameOf(l.lenderId), borrowerName: nameOf(l.borrowerId), balance: balances[l.id] }));

  return {
    asOf, totalAssets, totalCash, externalLiabilities, relatedPartyLiabilities, eliminated: relatedPartyLiabilities,
    netEquity: totalAssets - externalLiabilities, liquidity: totalCash,
    annualDebtService: annualDebtServiceExt, annualDebtServiceAll, floatingBalance,
    floatingShare: externalLiabilities > 0 ? floatingBalance / externalLiabilities : 0, sensitivity200,
    balances, byEntity, maturities, upcoming, crossCollateral, guarantees, relatedLoans,
  };
}

/** Collateral table: asset → loans pledged against it. */
export function collateralTable(data: FamilyData, balances: Record<string, number>) {
  return data.assets.map((a) => {
    const ls = data.loans.filter((l) => l.collateralIds.includes(a.id));
    return { asset: a, loans: ls, pledged: ls.reduce((s, l) => s + (balances[l.id] ?? 0), 0), cross: ls.length > 1 };
  });
}

export const SCENARIO_ENTITY: DashEntity = { id: 'scn', name: 'My saved scenarios', kind: 'scenario', cash: 0 };
export const SCENARIO_LENDER: DashLender = { id: 'lender-scn', name: 'Scenario lender', type: 'scenario' };

/** Map saved 'leverage' / 'family-bank' scenarios into dashboard loans (via their LoanTerms). */
export function scenarioLoans(scenarios: SavedScenario[]): DashLoan[] {
  const out: DashLoan[] = [];
  for (const s of scenarios) {
    if (s.kind !== 'leverage' && s.kind !== 'family-bank') continue;
    const t = readLoanTerms(s.data);
    if (!t) continue;
    const related = s.kind === 'family-bank' || t.relatedParty;
    const year = t.originatedYear ?? new Date(s.createdAt).getFullYear();
    out.push({
      id: `scn-${s.id}`, name: s.name, borrowerId: SCENARIO_ENTITY.id, lenderId: related ? 'trust' : SCENARIO_LENDER.id,
      principal: t.principal, rate: t.rate, floating: false, structure: t.structure, termMonths: t.termMonths,
      amortizationMonths: t.structure === 'balloon' ? Math.max(t.termMonths, t.termMonths * 2) : undefined,
      originated: `${year}-01-01`, collateralIds: [], guarantorIds: t.guarantorId ? [t.guarantorId] : [], relatedParty: related, source: 'scenario', scenarioId: s.id,
    });
  }
  return out;
}

export function mergeScenarioLoans(base: FamilyData, extra: DashLoan[]): FamilyData {
  if (extra.length === 0) return base;
  return {
    ...base,
    entities: base.entities.some((e) => e.id === SCENARIO_ENTITY.id) ? base.entities : [...base.entities, SCENARIO_ENTITY],
    lenders: base.lenders.some((l) => l.id === SCENARIO_LENDER.id) ? base.lenders : [...base.lenders, SCENARIO_LENDER],
    loans: [...base.loans, ...extra],
  };
}
