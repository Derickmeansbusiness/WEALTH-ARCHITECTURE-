import { describe, it, expect } from 'vitest';
import type { Structure } from '@/types/structure';
import {
  legalOwners, ultimateOwners, ownershipTotal, controllers, isPureOwner, creditorReach, cashFlows, succession, warnings,
  affiliated, loanPosition, loanSummary, crossCollateralization, consolidate, edgesForView, liabilityFences, analyze, loanParties,
} from './analysis';
import { TEMPLATES, FAMILY_FINANCING, HNW } from './templates';

/** Minimal hand-built structure: person → holding → opco/propco, family loan, a guarantee and a directly held asset used by the business. */
const S: Structure = {
  id: 't', name: 't', createdAt: 0, updatedAt: 0,
  nodes: [
    { id: 'p', kind: 'individual', label: 'Person', x: 0, y: 0 },
    { id: 'sp', kind: 'spouse', label: 'Spouse', x: 0, y: 0 },
    { id: 'tr', kind: 'irrevocable-trust', label: 'Trust', x: 0, y: 0 },
    { id: 'h', kind: 'holding-company', label: 'Hold', x: 0, y: 0, value: 1000 },
    { id: 'op', kind: 'operating-company', label: 'OpCo', x: 0, y: 0, value: 500 },
    { id: 'pr', kind: 'property-company', label: 'PropCo', x: 0, y: 0, value: 400 },
    { id: 're', kind: 'real-estate', label: 'Building', x: 0, y: 0, value: 900 },
    { id: 'truck', kind: 'real-estate', label: 'Yard', x: 0, y: 0, value: 100 },
    { id: 'life', kind: 'life-insurance', label: 'Policy', x: 0, y: 0, value: 2000 },
    { id: 'orphan', kind: 'bank-account', label: 'Orphan account', x: 0, y: 0 },
  ],
  edges: [
    { id: 'o1', from: 'p', to: 'h', kind: 'owns', percent: 60 },
    { id: 'o2', from: 'sp', to: 'h', kind: 'owns', percent: 30 },           // sums to 90 → warning
    { id: 'o3', from: 'h', to: 'op', kind: 'owns', percent: 100 },
    { id: 'o4', from: 'h', to: 'pr', kind: 'owns', percent: 100 },
    { id: 'o5', from: 'pr', to: 're', kind: 'owns', percent: 100 },
    { id: 'o6', from: 'p', to: 'truck', kind: 'owns' },
    { id: 'm1', from: 'op', to: 'truck', kind: 'manages' },                 // commingling
    { id: 'c1', from: 'p', to: 'h', kind: 'manages' },
    { id: 't1', from: 'p', to: 'tr', kind: 'trustee' },
    { id: 'b1', from: 'tr', to: 'sp', kind: 'beneficiary' },
    { id: 'l1', from: 'pr', to: 'op', kind: 'lends-to', loan: { principal: 120000, rate: 0.06, termMonths: 12, structure: 'amortizing', paymentFrequency: 'monthly', relatedParty: false, securityDocs: [], collateral: 'Building' } },
    { id: 'g1', from: 'h', to: 'op', kind: 'guarantees' },
    { id: 'o7', from: 'tr', to: 'life', kind: 'owns' },
    { id: 'i1', from: 'life', to: 'p', kind: 'insures' },
    { id: 'b2', from: 'life', to: 'tr', kind: 'beneficiary' },
  ],
};

describe('ownership', () => {
  it('lists direct legal owners with percentages', () => {
    expect(legalOwners(S, 'h').map((o) => [o.ownerId, o.percent])).toEqual([['p', 60], ['sp', 30]]);
    expect(ownershipTotal(S, 'h')).toBe(90);
    expect(ownershipTotal(S, 'tr')).toBeNull();
  });
  it('walks ownership up to ultimate owners multiplying percentages', () => {
    const u = ultimateOwners(S, 're');
    expect(u.find((x) => x.ownerId === 'p')?.share).toBeCloseTo(0.6, 6);
    expect(u.find((x) => x.ownerId === 'sp')?.share).toBeCloseTo(0.3, 6);
    expect(ultimateOwners(S, 'p')).toEqual([]);
  });
  it('splits the remainder among owners without a stated percent', () => {
    const s2: Structure = { ...S, edges: [{ id: 'a', from: 'p', to: 'h', kind: 'owns', percent: 50 }, { id: 'b', from: 'sp', to: 'h', kind: 'owns' }, { id: 'c', from: 'tr', to: 'h', kind: 'owns' }] };
    const u = ultimateOwners(s2, 'h');
    expect(u.find((x) => x.ownerId === 'sp')?.share).toBeCloseTo(0.25, 6);
    expect(u.find((x) => x.ownerId === 'tr')?.share).toBeCloseTo(0.25, 6);
  });
});

describe('control', () => {
  it('separates controllers from pure owners', () => {
    expect(controllers(S, 'h').map((c) => c.via)).toEqual(['manages']);
    expect(isPureOwner(S, 'sp')).toBe(true);
    expect(isPureOwner(S, 'p')).toBe(false);
  });
});

describe('creditor reach', () => {
  it('follows ownership downward and guarantees inward, never upward', () => {
    const r = creditorReach(S, 'op');
    expect(r.reached).toContain('h');        // via guarantee
    expect(r.reached).toContain('pr');       // h owns pr
    expect(r.reached).toContain('re');
    expect(r.reached).not.toContain('p');    // owner is shielded
    expect(r.guaranteeBreaches).toEqual(['h']);
  });
  it('is contained when no guarantee exists', () => {
    const s2 = { ...S, edges: S.edges.filter((e) => e.id !== 'g1') };
    const r = creditorReach(s2, 'op');
    expect(r.reached).toEqual(['op']);
  });
  it('a claim against the owner reaches everything they own', () => {
    const r = creditorReach(S, 'p');
    expect(r.reached).toEqual(expect.arrayContaining(['h', 'op', 'pr', 're', 'truck']));
  });
  it('builds fences around entities and the assets only they own', () => {
    const f = liabilityFences(S).find((x) => x.ownerId === 'pr');
    expect(f?.memberIds).toEqual(['pr', 're']);
  });
});

describe('cash flows', () => {
  it('derives debt service from the shared finance engine and the advance from principal', () => {
    const flows = cashFlows(S);
    const svc = flows.find((f) => f.kind === 'debt-service');
    expect(svc?.fromId).toBe('op');
    expect(svc?.toId).toBe('pr');
    // 120,000 at 6% over 12 months → 10,327.97 per month
    expect(svc?.annual).toBeCloseTo(10327.97 * 12, 0);
    expect(flows.find((f) => f.kind === 'loan-advance')?.oneOff).toBe(120000);
    expect(flows.some((f) => f.kind === 'premium' && f.fromId === 'tr')).toBe(true);
    expect(flows.some((f) => f.kind === 'death-benefit' && f.toId === 'tr')).toBe(true);
  });
  it('reads borrows-from edges with the parties reversed', () => {
    const e = { id: 'x', from: 'op', to: 'pr', kind: 'borrows-from' as const };
    expect(loanParties(e)).toEqual({ lenderId: 'pr', borrowerId: 'op' });
  });
});

describe('succession', () => {
  it('finds estate assets, receivers, policy payouts and role vacancies', () => {
    const r = succession(S, 'p');
    expect(r.estate.map((e) => e.nodeId).sort()).toEqual(['h', 'truck']);
    expect(r.estate.find((e) => e.nodeId === 'h')?.treatment).toBe('entity-agreement');
    expect(r.payouts).toEqual([{ policyId: 'life', toId: 'tr', edgeId: 'b2' }]);
    expect(r.receivers.map((x) => x.nodeId)).toContain('sp');
    expect(r.vacancies.map((v) => v.role).sort()).toEqual(['manages', 'trustee']);
  });
});

describe('warnings', () => {
  const w = warnings(S);
  const codes = w.map((x) => x.code);
  it('flags a node with no owner', () => { expect(w.find((x) => x.code === 'no-owner')?.nodeIds).toContain('orphan'); });
  it('flags a guarantee that bridges separated entities', () => { expect(w.find((x) => x.code === 'guarantee-bridge')?.severity).toBe('red'); });
  it('flags an undocumented loan', () => { expect(codes).toContain('undocumented-loan'); });
  it('flags an unflagged related-party loan between affiliates', () => { expect(codes).toContain('related-party-unflagged'); expect(affiliated(S, 'pr', 'op')).toBe(true); });
  it('hints at commingling when a person holds an asset the business uses', () => { expect(w.find((x) => x.code === 'commingling')?.nodeIds).toEqual(['p', 'truck']); });
  it('flags ownership that does not sum to 100', () => { expect(w.find((x) => x.code === 'ownership-sum')?.title).toMatch(/90%/); });
  it('does not flag a clean structure for those codes', () => {
    const clean: Structure = { id: 'c', name: 'c', createdAt: 0, updatedAt: 0, nodes: [{ id: 'p', kind: 'individual', label: 'P', x: 0, y: 0 }, { id: 'h', kind: 'holding-company', label: 'H', x: 0, y: 0 }], edges: [{ id: 'o', from: 'p', to: 'h', kind: 'owns', percent: 100 }] };
    expect(warnings(clean)).toEqual([]);
  });
});

describe('loan helpers', () => {
  const loan = { principal: 1000000, rate: 0.06, termMonths: 120, structure: 'amortizing' as const, paymentFrequency: 'monthly' as const, relatedParty: true };
  it('positions a loan part-way through its schedule', () => {
    const p = loanPosition(loan, 24);
    expect(p.periodsElapsed).toBe(24);
    expect(p.balance).toBeLessThan(1000000);
    expect(p.balance).toBeGreaterThan(800000);
    expect(p.principalPaid + p.balance).toBeCloseTo(1000000, 0);
    expect(loanPosition(loan, 0).balance).toBe(1000000);
    expect(loanPosition(loan, 999).matured).toBe(true);
  });
  it('maps balloon terms onto the finance engine (amortize over term, due at balloonMonths)', () => {
    const s = loanSummary({ ...loan, structure: 'balloon', termMonths: 360, balloonMonths: 60 });
    expect(s.totalPeriods).toBe(60);
    expect(s.balloonBalance).toBeGreaterThan(900000);
  });
  it('detects cross-collateralization by collateral text or node', () => {
    const groups = crossCollateralization(FAMILY_FINANCING);
    expect(groups).toHaveLength(1);
    expect(groups[0].edgeIds.sort()).toEqual(['loan-op', 'loan-prop']);
    expect(groups[0].nodeId).toBe('prop');
  });
  it('consolidates and eliminates intercompany debt', () => {
    const c = consolidate(FAMILY_FINANCING);
    expect(c.eliminations.map((e) => e.edgeId).sort()).toEqual(['loan-op', 'loan-prop']);
    expect(c.eliminated).toBe(3600000 + 900000);
    expect(c.netAssets).toBeCloseTo(c.grossAssets - c.eliminated, 6);
    expect(c.netLiabilities).toBeCloseTo(c.grossLiabilities - c.eliminated, 6);
    // equity is unchanged by elimination
    expect(c.netEquity).toBeCloseTo(c.grossAssets - c.grossLiabilities, 6);
    const invco = c.sheets.find((b) => b.nodeId === 'invco')!;
    expect(invco.intercompanyReceivable).toBe(4500000);
    const propco = c.sheets.find((b) => b.nodeId === 'propco')!;
    expect(propco.intercompanyPayable).toBe(3600000);
  });
});

describe('views and templates', () => {
  it('filters edges per map view from RELATIONSHIP_META', () => {
    expect(edgesForView(S, 'ownership').every((e) => e.kind === 'owns')).toBe(true);
    expect(edgesForView(S, 'liability').map((e) => e.kind)).toEqual(expect.arrayContaining(['owns', 'lends-to', 'guarantees']));
    expect(edgesForView(S, 'control').map((e) => e.kind)).toEqual(expect.arrayContaining(['manages', 'trustee']));
  });
  it('every template references only existing nodes and has unique ids', () => {
    for (const t of TEMPLATES) {
      const ids = new Set(t.nodes.map((n) => n.id));
      expect(ids.size).toBe(t.nodes.length);
      expect(new Set(t.edges.map((e) => e.id)).size).toBe(t.edges.length);
      for (const e of t.edges) { expect(ids.has(e.from)).toBe(true); expect(ids.has(e.to)).toBe(true); if (e.loan?.guarantorId) expect(ids.has(e.loan.guarantorId)).toBe(true); }
    }
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(5);
  });
  it('analyze() aggregates without throwing on every template', () => {
    for (const t of TEMPLATES) {
      const a = analyze(t, { creditorOriginId: t.nodes[0].id, deceasedId: t.nodes[0].id });
      expect(Object.keys(a.nodes)).toHaveLength(t.nodes.length);
      expect(a.reach?.reached.length).toBeGreaterThan(0);
    }
    const hnw = analyze(HNW);
    expect(hnw.warnings.some((w) => w.code === 'undocumented-loan')).toBe(false);
  });
});
