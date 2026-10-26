/**
 * Structure Lab analysis — pure graph functions over a `Structure`.
 * Used by the Lab analysis panel, the five map views, the Master Map and the Debt Studio financing map.
 *
 * Edge direction conventions (templates, canvas and financing map all follow these):
 *   owns              owner → owned thing
 *   controls/manages  controller → controlled thing
 *   trustee/protector person or company → the trust it serves
 *   beneficiary       trust / policy / entity → the person or entity that receives
 *   distributes-to    paying entity → recipient
 *   lends-to          lender → borrower        borrows-from  borrower → lender
 *   guarantees        guarantor → borrower whose debt is guaranteed
 *   insures           policy → insured life
 *   employs           employer → employee
 *
 * Everything here is educational modelling. A real analysis depends on documents, governing law and facts.
 */
import type { Structure, StructureNode, StructureEdge, RelationshipKind, LoanTerms, MapView, ComponentCategory } from '@/types/structure';
import { COMPONENT_META, RELATIONSHIP_META } from '@/types/structure';
import { buildLoan, annualize, type LoanSummary } from '@/lib/finance';

export const CONTROL_KINDS: readonly RelationshipKind[] = ['controls', 'manages', 'trustee', 'protector'];
export const SUCCESSION_KINDS: readonly RelationshipKind[] = ['beneficiary', 'distributes-to'];
export const LOAN_KINDS: readonly RelationshipKind[] = ['lends-to', 'borrows-from'];

/** Canonical security documentation checklist for an intra-family or related-party loan. */
export const SECURITY_DOCS = [
  'Promissory note',
  'Security agreement',
  'UCC-1 filing',
  'Mortgage / deed of trust',
  'Guaranty',
  'Board resolution',
] as const;

// ── Lookups ───────────────────────────────────────────────────────────────
export const nodeById = (s: Structure, id: string): StructureNode | undefined => s.nodes.find((n) => n.id === id);
export const edgeById = (s: Structure, id: string): StructureEdge | undefined => s.edges.find((e) => e.id === id);
export const categoryOf = (n: StructureNode): ComponentCategory => COMPONENT_META[n.kind].category;
export const labelOf = (s: Structure, id: string): string => nodeById(s, id)?.label ?? id;

/** Edges that belong on a given map view (RELATIONSHIP_META.maps). */
export const edgesForView = (s: Structure, view: MapView): StructureEdge[] => s.edges.filter((e) => RELATIONSHIP_META[e.kind].maps.includes(view));

export const isLoanEdge = (e: StructureEdge): boolean => LOAN_KINDS.includes(e.kind);
export const loanEdges = (s: Structure): StructureEdge[] => s.edges.filter(isLoanEdge);

export function loanParties(e: StructureEdge): { lenderId: string; borrowerId: string } {
  return e.kind === 'borrows-from' ? { lenderId: e.to, borrowerId: e.from } : { lenderId: e.from, borrowerId: e.to };
}

/** Map LoanTerms onto the shared finance engine. For balloons, `termMonths` is the amortization horizon and `balloonMonths` is when the balance falls due. */
export function loanSummary(loan: LoanTerms): LoanSummary {
  const isBalloon = loan.structure === 'balloon';
  return buildLoan({
    principal: loan.principal,
    annualRate: loan.rate,
    termMonths: isBalloon && loan.balloonMonths ? loan.balloonMonths : loan.termMonths,
    structure: loan.structure,
    frequency: loan.paymentFrequency,
    amortizationMonths: isBalloon && loan.balloonMonths ? loan.termMonths : undefined,
  });
}

export interface LoanPosition {
  summary: LoanSummary;
  periodsElapsed: number;
  balance: number;
  interestPaid: number;
  principalPaid: number;
  remainingPeriods: number;
  matured: boolean;
}

/** Where a loan stands after `elapsedMonths` since origination. */
export function loanPosition(loan: LoanTerms, elapsedMonths: number): LoanPosition {
  const summary = loanSummary(loan);
  const ppy = summary.periodsPerYear;
  const periodsElapsed = Math.max(0, Math.min(summary.totalPeriods, Math.floor((Math.max(0, elapsedMonths) / 12) * ppy)));
  const paid = summary.schedule.slice(0, periodsElapsed);
  const balance = periodsElapsed === 0 ? loan.principal : summary.schedule[periodsElapsed - 1].balance;
  return {
    summary,
    periodsElapsed,
    balance,
    interestPaid: round2(paid.reduce((a, r) => a + r.interest, 0)),
    principalPaid: round2(paid.reduce((a, r) => a + r.principal, 0)),
    remainingPeriods: summary.totalPeriods - periodsElapsed,
    matured: periodsElapsed >= summary.totalPeriods,
  };
}

/** Annual summary rows for a loan (year, interest, principal, payment, balance). */
export function loanAnnual(loan: LoanTerms) {
  const s = loanSummary(loan);
  return annualize(s.schedule, s.periodsPerYear);
}

const round2 = (n: number) => Math.round(n * 100) / 100;

// ── Ownership ─────────────────────────────────────────────────────────────
export interface OwnerRef { ownerId: string; percent?: number; edgeId: string }

/** Direct legal owners of a node (incoming `owns` edges). */
export function legalOwners(s: Structure, nodeId: string): OwnerRef[] {
  return s.edges.filter((e) => e.kind === 'owns' && e.to === nodeId).map((e) => ({ ownerId: e.from, percent: e.percent, edgeId: e.id }));
}

/** What a node directly owns (outgoing `owns` edges). */
export function holdings(s: Structure, ownerId: string): { nodeId: string; percent?: number; edgeId: string }[] {
  return s.edges.filter((e) => e.kind === 'owns' && e.from === ownerId).map((e) => ({ nodeId: e.to, percent: e.percent, edgeId: e.id }));
}

/** Sum of recorded ownership percentages into a node. `null` when no percentages are recorded. */
export function ownershipTotal(s: Structure, nodeId: string): number | null {
  const owners = legalOwners(s, nodeId).filter((o) => o.percent !== undefined);
  if (!owners.length) return null;
  return owners.reduce((a, o) => a + (o.percent ?? 0), 0);
}

/**
 * Walk ownership upward to the nodes nobody owns (people, trusts, foundations), multiplying percentages.
 * Owners without a stated percent share whatever is left after the stated ones.
 */
export function ultimateOwners(s: Structure, nodeId: string): { ownerId: string; share: number }[] {
  const result = new Map<string, number>();
  const walk = (id: string, share: number, seen: Set<string>) => {
    const owners = legalOwners(s, id).filter((o) => !seen.has(o.ownerId));
    if (!owners.length) { if (id !== nodeId) result.set(id, (result.get(id) ?? 0) + share); return; }
    const definedSum = owners.reduce((a, o) => a + (o.percent ?? 0), 0);
    const undefinedCount = owners.filter((o) => o.percent === undefined).length;
    const remainder = Math.max(0, 100 - definedSum);
    for (const o of owners) {
      const slice = o.percent !== undefined ? o.percent / 100 : undefinedCount ? remainder / undefinedCount / 100 : 0;
      walk(o.ownerId, share * slice, new Set([...seen, o.ownerId]));
    }
  };
  if (!legalOwners(s, nodeId).length) return [];
  walk(nodeId, 1, new Set([nodeId]));
  return [...result.entries()].map(([ownerId, share]) => ({ ownerId, share })).sort((a, b) => b.share - a.share);
}

/** Two nodes are affiliated when one owns the other (any depth), they share an ultimate owner, or one controls the other. */
export function affiliated(s: Structure, a: string, b: string): boolean {
  if (a === b) return true;
  const rootsOf = (id: string) => { const u = ultimateOwners(s, id).map((o) => o.ownerId); return new Set(u.length ? [...u, id] : [id]); };
  const ra = rootsOf(a), rb = rootsOf(b);
  for (const r of ra) if (rb.has(r)) return true;
  if (ra.has(b) || rb.has(a)) return true;
  return s.edges.some((e) => (CONTROL_KINDS.includes(e.kind) || e.kind === 'owns') && ((e.from === a && e.to === b) || (e.from === b && e.to === a)));
}

// ── Control ───────────────────────────────────────────────────────────────
export interface ControllerRef { controllerId: string; via: RelationshipKind; edgeId: string }

export function controllers(s: Structure, nodeId: string): ControllerRef[] {
  return s.edges.filter((e) => CONTROL_KINDS.includes(e.kind) && e.to === nodeId).map((e) => ({ controllerId: e.from, via: e.kind, edgeId: e.id }));
}
export const isController = (s: Structure, nodeId: string): boolean => s.edges.some((e) => CONTROL_KINDS.includes(e.kind) && e.from === nodeId);
/** Owns something but controls nothing — the classic "ownership without control" position. */
export const isPureOwner = (s: Structure, nodeId: string): boolean => holdings(s, nodeId).length > 0 && !isController(s, nodeId);

// ── Liability / creditor reach ───────────────────────────────────────────
export interface ReachStep { nodeId: string; viaEdgeId: string | null; fromId: string | null; reason: string; depth: number; throughGuarantee: boolean }
export interface ReachResult { originId: string; reached: string[]; steps: ReachStep[]; guaranteeBreaches: string[] }

/**
 * From the node where a claim arises, a creditor can reach: what that node owns (downward along `owns`),
 * and anyone who guaranteed that node's obligations (inward along `guarantees`), then onward from there.
 * It cannot climb upward to the owner — that is the point of the entity shield — unless a guarantee bridges it.
 */
export function creditorReach(s: Structure, originId: string): ReachResult {
  const steps: ReachStep[] = [{ nodeId: originId, viaEdgeId: null, fromId: null, reason: 'Claim arises here', depth: 0, throughGuarantee: false }];
  const seen = new Set<string>([originId]);
  const queue: { id: string; depth: number; viaGuarantee: boolean }[] = [{ id: originId, depth: 0, viaGuarantee: false }];
  const guaranteeBreaches: string[] = [];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const e of s.edges) {
      if (e.kind === 'owns' && e.from === cur.id && !seen.has(e.to)) {
        seen.add(e.to);
        steps.push({ nodeId: e.to, viaEdgeId: e.id, fromId: cur.id, reason: `${labelOf(s, cur.id)} owns it${e.percent !== undefined ? ` (${e.percent}%)` : ''} — the interest can be charged or seized`, depth: cur.depth + 1, throughGuarantee: cur.viaGuarantee });
        queue.push({ id: e.to, depth: cur.depth + 1, viaGuarantee: cur.viaGuarantee });
      }
      if (e.kind === 'guarantees' && e.to === cur.id && !seen.has(e.from)) {
        seen.add(e.from);
        guaranteeBreaches.push(e.from);
        steps.push({ nodeId: e.from, viaEdgeId: e.id, fromId: cur.id, reason: `${labelOf(s, e.from)} guaranteed ${labelOf(s, cur.id)}'s obligations — the fence is bridged by contract`, depth: cur.depth + 1, throughGuarantee: true });
        queue.push({ id: e.from, depth: cur.depth + 1, viaGuarantee: true });
      }
    }
  }
  return { originId, reached: [...seen], steps, guaranteeBreaches };
}

/** Liability fences: each entity / trust together with the assets only it owns. */
export interface Fence { ownerId: string; memberIds: string[] }
export function liabilityFences(s: Structure): Fence[] {
  return s.nodes
    .filter((n) => ['entity', 'trust', 'institution'].includes(categoryOf(n)))
    .map((n) => ({
      ownerId: n.id,
      memberIds: [n.id, ...holdings(s, n.id).map((h) => h.nodeId).filter((id) => { const t = nodeById(s, id); return t && categoryOf(t) === 'asset' && legalOwners(s, id).length === 1; })],
    }));
}

// ── Cash flow ─────────────────────────────────────────────────────────────
export type CashFlowKind = 'loan-advance' | 'debt-service' | 'distribution' | 'premium' | 'death-benefit' | 'compensation' | 'management-fee' | 'other';
export interface CashFlow { id: string; edgeId: string; fromId: string; toId: string; kind: CashFlowKind; label: string; annual?: number; oneOff?: number }

export function cashFlows(s: Structure): CashFlow[] {
  const out: CashFlow[] = [];
  for (const e of s.edges) {
    if (isLoanEdge(e)) {
      const { lenderId, borrowerId } = loanParties(e);
      if (e.loan) {
        const sum = loanSummary(e.loan);
        out.push({ id: `${e.id}:adv`, edgeId: e.id, fromId: lenderId, toId: borrowerId, kind: 'loan-advance', label: 'Loan advance (principal)', oneOff: e.loan.principal });
        out.push({ id: `${e.id}:svc`, edgeId: e.id, fromId: borrowerId, toId: lenderId, kind: 'debt-service', label: `Debt service (${e.loan.paymentFrequency})`, annual: sum.annualDebtService });
      } else {
        out.push({ id: `${e.id}:na`, edgeId: e.id, fromId: borrowerId, toId: lenderId, kind: 'other', label: 'Loan — terms not yet set' });
      }
    } else if (e.kind === 'distributes-to' || e.kind === 'beneficiary') {
      const from = nodeById(s, e.from);
      const isPolicy = from?.kind === 'life-insurance';
      out.push({ id: e.id, edgeId: e.id, fromId: e.from, toId: e.to, kind: isPolicy ? 'death-benefit' : 'distribution', label: isPolicy ? 'Death benefit (at the insured event)' : e.kind === 'beneficiary' ? 'Distributions per trust terms' : e.label || 'Distribution', oneOff: isPolicy ? from?.value : undefined });
    } else if (e.kind === 'insures') {
      const owner = legalOwners(s, e.from)[0]?.ownerId ?? e.to;
      out.push({ id: `${e.id}:prem`, edgeId: e.id, fromId: owner, toId: e.from, kind: 'premium', label: 'Premiums (paid by the policy owner)' });
    } else if (e.kind === 'employs') {
      out.push({ id: e.id, edgeId: e.id, fromId: e.from, toId: e.to, kind: 'compensation', label: 'Compensation (deductible to payer, taxable to recipient)' });
    } else if (e.kind === 'manages') {
      out.push({ id: e.id, edgeId: e.id, fromId: e.to, toId: e.from, kind: 'management-fee', label: 'Management fee (arm\'s-length pricing matters)' });
    }
  }
  return out;
}

// ── Succession ────────────────────────────────────────────────────────────
export type EstateTreatment = 'probate' | 'trust-terms' | 'beneficiary-designation' | 'entity-agreement';
export interface SuccessionResult {
  deceasedId: string;
  estate: { nodeId: string; edgeId: string; percent?: number; treatment: EstateTreatment }[];
  receivers: { nodeId: string; fromId: string; edgeId: string; via: RelationshipKind; what: string }[];
  payouts: { policyId: string; toId: string; edgeId: string }[];
  vacancies: { nodeId: string; edgeId: string; role: RelationshipKind }[];
}

export function succession(s: Structure, deceasedId: string): SuccessionResult {
  const estate = holdings(s, deceasedId).map((h) => {
    const t = nodeById(s, h.nodeId);
    const treatment: EstateTreatment = t?.kind === 'revocable-trust' ? 'trust-terms' : t?.kind === 'life-insurance' ? 'beneficiary-designation' : t && categoryOf(t) === 'entity' ? 'entity-agreement' : 'probate';
    return { nodeId: h.nodeId, edgeId: h.edgeId, percent: h.percent, treatment };
  });
  const policies = s.edges.filter((e) => e.kind === 'insures' && e.to === deceasedId).map((e) => e.from);
  const payouts = s.edges.filter((e) => e.kind === 'beneficiary' && policies.includes(e.from)).map((e) => ({ policyId: e.from, toId: e.to, edgeId: e.id }));
  const sources = new Set<string>([...estate.map((x) => x.nodeId), ...policies, ...s.nodes.filter((n) => categoryOf(n) === 'trust').map((n) => n.id)]);
  const receivers = s.edges
    .filter((e) => SUCCESSION_KINDS.includes(e.kind) && sources.has(e.from) && e.to !== deceasedId)
    .map((e) => ({ nodeId: e.to, fromId: e.from, edgeId: e.id, via: e.kind, what: nodeById(s, e.from)?.kind === 'life-insurance' ? 'death benefit' : e.kind === 'beneficiary' ? 'beneficial interest continues' : 'distributions continue' }));
  const vacancies = s.edges.filter((e) => CONTROL_KINDS.includes(e.kind) && e.from === deceasedId).map((e) => ({ nodeId: e.to, edgeId: e.id, role: e.kind }));
  return { deceasedId, estate, receivers, payouts, vacancies };
}

// ── Warnings ──────────────────────────────────────────────────────────────
export type WarningCode = 'no-owner' | 'guarantee-bridge' | 'undocumented-loan' | 'loan-no-terms' | 'related-party-unflagged' | 'commingling' | 'ownership-sum' | 'trust-no-trustee' | 'single-point-of-control';
export interface StructureWarning { id: string; code: WarningCode; severity: 'red' | 'amber' | 'info'; title: string; detail: string; nodeIds: string[]; edgeIds: string[] }

const needsOwner = (n: StructureNode) => ['entity', 'asset', 'institution'].includes(categoryOf(n)) || n.kind === 'life-insurance';

export function warnings(s: Structure): StructureWarning[] {
  const out: StructureWarning[] = [];
  // 1. Nodes with no owner
  for (const n of s.nodes) {
    if (needsOwner(n) && legalOwners(s, n.id).length === 0) {
      out.push({ id: `no-owner:${n.id}`, code: 'no-owner', severity: 'amber', title: `${n.label} has no recorded legal owner`, detail: 'Every entity, account, property and policy has a legal owner of record. An unrecorded owner is where probate surprises, title defects and beneficial-ownership reporting gaps come from. Add an OWNS edge.', nodeIds: [n.id], edgeIds: [] });
    }
  }
  // 2. Guarantees bridging separated entities
  for (const e of s.edges.filter((x) => x.kind === 'guarantees')) {
    const a = nodeById(s, e.from), b = nodeById(s, e.to);
    if (a && b && ['entity', 'trust', 'institution'].includes(categoryOf(a))) {
      out.push({ id: `guarantee:${e.id}`, code: 'guarantee-bridge', severity: 'red', title: `${a.label} guarantees ${b.label} — the liability fence is bridged`, detail: 'A guarantee is a contractual bridge between otherwise separated balance sheets. A creditor of the borrower can pursue the guarantor directly, so the separation you built with the entity is only as good as the guarantees you did not sign. Check the Liability view.', nodeIds: [a.id, b.id], edgeIds: [e.id] });
    } else if (a && b && categoryOf(a) === 'person') {
      out.push({ id: `guarantee:${e.id}`, code: 'guarantee-bridge', severity: 'amber', title: `${a.label} personally guarantees ${b.label}`, detail: 'A personal guarantee puts personal assets behind an entity\'s debt. Common and often unavoidable with bank lenders, but it should be a conscious decision, negotiated (carve-outs, caps, burn-off) and tracked.', nodeIds: [a.id, b.id], edgeIds: [e.id] });
    }
  }
  // 3 & 4. Loans
  for (const e of loanEdges(s)) {
    const { lenderId, borrowerId } = loanParties(e);
    if (!e.loan) {
      out.push({ id: `loan-terms:${e.id}`, code: 'loan-no-terms', severity: 'amber', title: `Loan between ${labelOf(s, lenderId)} and ${labelOf(s, borrowerId)} has no terms`, detail: 'Principal, rate, term and repayment structure are what make a loan a loan. Without them, a transfer looks like a gift or a capital contribution — to a court and to a tax authority.', nodeIds: [lenderId, borrowerId], edgeIds: [e.id] });
      continue;
    }
    if (!e.loan.securityDocs || e.loan.securityDocs.length === 0) {
      out.push({ id: `undoc:${e.id}`, code: 'undocumented-loan', severity: 'red', title: `Undocumented loan: ${labelOf(s, lenderId)} → ${labelOf(s, borrowerId)}`, detail: 'No promissory note, security agreement or filing is recorded. Intra-family loans are respected when they behave like real loans: written note, market-referenced rate (for US loans, IRS guidance on below-market loans under IRC §7872 and the applicable federal rate), scheduled payments actually made, security where appropriate. Undocumented debt is what gets recharacterized.', nodeIds: [lenderId, borrowerId], edgeIds: [e.id] });
    }
    if (!e.loan.relatedParty && affiliated(s, lenderId, borrowerId)) {
      out.push({ id: `related:${e.id}`, code: 'related-party-unflagged', severity: 'amber', title: `Related-party loan not flagged: ${labelOf(s, lenderId)} → ${labelOf(s, borrowerId)}`, detail: 'Lender and borrower share ownership or control, so this is a related-party transaction. It needs arm\'s-length terms, board or manager approval, and disclosure in the accounts. Flag it so the structure is honest with itself.', nodeIds: [lenderId, borrowerId], edgeIds: [e.id] });
    }
  }
  // 5. Commingling hint
  for (const e of s.edges.filter((x) => x.kind === 'owns')) {
    const owner = nodeById(s, e.from), asset = nodeById(s, e.to);
    if (!owner || !asset || categoryOf(owner) !== 'person' || categoryOf(asset) !== 'asset') continue;
    const entityTouch = s.edges.find((x) => x.id !== e.id && (x.from === asset.id || x.to === asset.id) && (() => { const other = nodeById(s, x.from === asset.id ? x.to : x.from); return other && categoryOf(other) === 'entity'; })());
    if (entityTouch) {
      out.push({ id: `commingle:${e.id}`, code: 'commingling', severity: 'amber', title: `${owner.label} owns ${asset.label} personally while an entity uses it`, detail: 'An asset held personally but used by, managed by or pledged for a company blurs the line between personal and business property. That blur is what a plaintiff\'s lawyer argues when seeking to pierce the veil. Either move the asset into the entity or paper a lease or licence at market terms.', nodeIds: [owner.id, asset.id], edgeIds: [e.id, entityTouch.id] });
    }
  }
  // 6. Ownership percentages
  for (const n of s.nodes) {
    const owners = legalOwners(s, n.id);
    if (!owners.length) continue;
    const withPct = owners.filter((o) => o.percent !== undefined);
    if (withPct.length === owners.length) {
      const sum = withPct.reduce((a, o) => a + (o.percent ?? 0), 0);
      if (Math.abs(sum - 100) > 0.5) {
        out.push({ id: `pct:${n.id}`, code: 'ownership-sum', severity: 'amber', title: `Ownership of ${n.label} sums to ${Math.round(sum * 10) / 10}%, not 100%`, detail: sum < 100 ? 'Part of the equity is unaccounted for. Either an owner is missing from the map or the percentages are wrong. Cap tables and operating agreements must reconcile.' : 'More than 100% of the equity is allocated. Percentages must reconcile to the cap table or operating agreement.', nodeIds: [n.id], edgeIds: owners.map((o) => o.edgeId) });
      }
    } else if (withPct.length > 0) {
      out.push({ id: `pct-partial:${n.id}`, code: 'ownership-sum', severity: 'info', title: `Some owners of ${n.label} have no percentage recorded`, detail: 'Mixed records make the cap table impossible to reconcile. Record a percentage on every OWNS edge into this node.', nodeIds: [n.id], edgeIds: owners.map((o) => o.edgeId) });
    }
  }
  // 7. Trust without trustee
  for (const n of s.nodes.filter((x) => categoryOf(x) === 'trust')) {
    if (!s.edges.some((e) => e.kind === 'trustee' && e.to === n.id)) {
      out.push({ id: `trustee:${n.id}`, code: 'trust-no-trustee', severity: 'amber', title: `${n.label} has no trustee`, detail: 'A trust is a relationship, not a thing: someone must hold legal title for the beneficiaries. Add a TRUSTEE edge, and think about successor trustees and a protector.', nodeIds: [n.id], edgeIds: [] });
    }
  }
  // 8. Single person controlling everything (governance / incapacity exposure)
  const people = s.nodes.filter((n) => categoryOf(n) === 'person');
  const controlled = s.nodes.filter((n) => controllers(s, n.id).length > 0);
  for (const p of people) {
    const mine = controlled.filter((n) => controllers(s, n.id).every((c) => c.controllerId === p.id));
    if (controlled.length >= 3 && mine.length === controlled.length) {
      out.push({ id: `spoc:${p.id}`, code: 'single-point-of-control', severity: 'info', title: `${p.label} is the only controller of every controlled node`, detail: 'Nothing wrong with a founder in charge, but incapacity or death leaves every role vacant at once. Successor trustees, successor managers and powers of attorney are governance infrastructure, not paperwork.', nodeIds: [p.id], edgeIds: [] });
    }
  }
  return out;
}

// ── Cross-collateralization & consolidation (Debt Studio) ────────────────
export interface CollateralGroup { collateral: string; edgeIds: string[]; nodeId?: string }

/** Loans that pledge the same collateral — matched by node id or by normalized collateral text. */
export function crossCollateralization(s: Structure): CollateralGroup[] {
  const groups = new Map<string, CollateralGroup>();
  for (const e of loanEdges(s)) {
    const c = e.loan?.collateral?.trim();
    if (!c) continue;
    const node = nodeById(s, c) ?? s.nodes.find((n) => n.label.trim().toLowerCase() === c.toLowerCase());
    const key = node ? `node:${node.id}` : `text:${c.toLowerCase().replace(/\s+/g, ' ')}`;
    const g = groups.get(key) ?? { collateral: node ? node.label : c, edgeIds: [], nodeId: node?.id };
    g.edgeIds.push(e.id);
    groups.set(key, g);
  }
  return [...groups.values()].filter((g) => g.edgeIds.length > 1);
}

export interface EntityBalanceSheet { nodeId: string; assets: number; intercompanyReceivable: number; externalReceivable: number; liabilities: number; intercompanyPayable: number; externalPayable: number; equity: number }
export interface Consolidation {
  sheets: EntityBalanceSheet[];
  eliminations: { edgeId: string; lenderId: string; borrowerId: string; amount: number }[];
  grossAssets: number; grossLiabilities: number; eliminated: number; netAssets: number; netLiabilities: number; netEquity: number;
}

/** Outstanding balance used for balance sheets: position at `elapsedMonths` if given, else principal. */
export function loanBalance(loan: LoanTerms, elapsedMonths?: number): number {
  return elapsedMonths === undefined ? loan.principal : loanPosition(loan, elapsedMonths).balance;
}

/**
 * Builds one balance sheet per entity-like node (owned asset values × percent, loans receivable) and consolidates the family,
 * eliminating intercompany debt so the same dollar is not counted as both an asset and a liability.
 */
export function consolidate(s: Structure, elapsedMonthsByEdge: Record<string, number> = {}): Consolidation {
  const sheetNodes = s.nodes.filter((n) => ['entity', 'trust', 'institution', 'person'].includes(categoryOf(n)));
  const sheets: EntityBalanceSheet[] = sheetNodes.map((n) => {
    const assets = holdings(s, n.id).reduce((a, h) => { const t = nodeById(s, h.nodeId); if (!t || t.value === undefined || !['asset', 'instrument'].includes(categoryOf(t))) return a; return a + t.value * ((h.percent ?? 100) / 100); }, 0);
    let icr = 0, er = 0, icp = 0, ep = 0;
    for (const e of loanEdges(s)) {
      if (!e.loan) continue;
      const { lenderId, borrowerId } = loanParties(e);
      const bal = loanBalance(e.loan, elapsedMonthsByEdge[e.id]);
      const inter = affiliated(s, lenderId, borrowerId);
      if (lenderId === n.id) { if (inter) icr += bal; else er += bal; }
      if (borrowerId === n.id) { if (inter) icp += bal; else ep += bal; }
    }
    const total = assets + icr + er, liab = icp + ep;
    return { nodeId: n.id, assets: total, intercompanyReceivable: icr, externalReceivable: er, liabilities: liab, intercompanyPayable: icp, externalPayable: ep, equity: total - liab };
  }).filter((b) => b.assets > 0 || b.liabilities > 0);
  const eliminations = loanEdges(s).filter((e) => e.loan && affiliated(s, loanParties(e).lenderId, loanParties(e).borrowerId)).map((e) => ({ edgeId: e.id, ...loanParties(e), amount: loanBalance(e.loan!, elapsedMonthsByEdge[e.id]) }));
  const grossAssets = sheets.reduce((a, b) => a + b.assets, 0);
  const grossLiabilities = sheets.reduce((a, b) => a + b.liabilities, 0);
  const eliminated = eliminations.reduce((a, e) => a + e.amount, 0);
  return { sheets, eliminations, grossAssets, grossLiabilities, eliminated, netAssets: grossAssets - eliminated, netLiabilities: grossLiabilities - eliminated, netEquity: grossAssets - grossLiabilities };
}

// ── Aggregate ─────────────────────────────────────────────────────────────
export interface NodeAnalysis { nodeId: string; owners: OwnerRef[]; ultimate: { ownerId: string; share: number }[]; controllers: ControllerRef[]; isController: boolean; isPureOwner: boolean; ownershipTotal: number | null }
export interface Analysis {
  nodes: Record<string, NodeAnalysis>;
  reach: ReachResult | null;
  cashFlows: CashFlow[];
  succession: SuccessionResult | null;
  warnings: StructureWarning[];
  crossCollateral: CollateralGroup[];
}

export function analyze(s: Structure, opts: { creditorOriginId?: string; deceasedId?: string } = {}): Analysis {
  const nodes: Record<string, NodeAnalysis> = {};
  for (const n of s.nodes) {
    nodes[n.id] = { nodeId: n.id, owners: legalOwners(s, n.id), ultimate: ultimateOwners(s, n.id), controllers: controllers(s, n.id), isController: isController(s, n.id), isPureOwner: isPureOwner(s, n.id), ownershipTotal: ownershipTotal(s, n.id) };
  }
  return {
    nodes,
    reach: opts.creditorOriginId && nodeById(s, opts.creditorOriginId) ? creditorReach(s, opts.creditorOriginId) : null,
    cashFlows: cashFlows(s),
    succession: opts.deceasedId && nodeById(s, opts.deceasedId) ? succession(s, opts.deceasedId) : null,
    warnings: warnings(s),
    crossCollateral: crossCollateralization(s),
  };
}

/** Sensible defaults for the view controls: the first individual, and the most exposed borrower / operating company. */
export function defaultDeceased(s: Structure): string | undefined {
  return (s.nodes.find((n) => n.kind === 'individual') ?? s.nodes.find((n) => categoryOf(n) === 'person'))?.id;
}
export function defaultCreditorOrigin(s: Structure): string | undefined {
  const borrowers = loanEdges(s).map((e) => loanParties(e).borrowerId);
  return borrowers[0] ?? s.nodes.find((n) => n.kind === 'operating-company')?.id ?? s.nodes.find((n) => categoryOf(n) === 'entity')?.id ?? s.nodes[0]?.id;
}
