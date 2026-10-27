import { describe, it, expect } from 'vitest';
import { buildTree, type TreeInput } from './entityTree';

const base: TreeInput = { operatingBusinesses: 2, properties: 2, holdingCompany: true, managementCompany: true, separatePropertyCompanies: true, investmentCompany: true };

describe('buildTree', () => {
  it('counts entities: holdco + 2 ops + 2 props + invest + mgmt = 7', () => {
    const r = buildTree(base);
    expect(r.entityCount).toBe(7);
    expect(r.nodes.filter((n) => n.kind === 'propco')).toHaveLength(2);
  });
  it('collapses properties into one entity when not separated and warns', () => {
    const r = buildTree({ ...base, separatePropertyCompanies: false });
    expect(r.nodes.filter((n) => n.kind === 'propco')).toHaveLength(1);
    expect(r.warnings.some((w) => /share one entity/.test(w))).toBe(true);
  });
  it('fences a business claim from the properties and portfolio', () => {
    const r = buildTree(base);
    const row = r.fences.find((f) => f.sourceId === 'op1')!;
    expect(row.reaches).toEqual(['Business 1 assets']);
    expect(row.fenced).toContain('Property 1');
    expect(row.fenced).toContain('Liquid portfolio');
    expect(row.fenced).not.toContain('Business 1 assets');
  });
  it('lets personal claims reach everything when there is no holding company', () => {
    const r = buildTree({ ...base, holdingCompany: false });
    const personal = r.fences.find((f) => f.sourceId === 'personal')!;
    expect(personal.reaches.length).toBeGreaterThan(0);
    expect(personal.fenced).toHaveLength(0);
    expect(r.warnings.some((w) => /No holding company/.test(w))).toBe(true);
  });
  it('limits personal claims to a charging order when a holding company exists', () => {
    const r = buildTree(base);
    expect(r.fences[0].sourceId).toBe('family');
    expect(r.fences[0].reaches[0]).toMatch(/charging order/);
  });
  it('compliance estimate scales with entity count and is a range', () => {
    const small = buildTree({ operatingBusinesses: 1, properties: 0, holdingCompany: false, managementCompany: false, separatePropertyCompanies: true, investmentCompany: false });
    const big = buildTree(base);
    expect(small.entityCount).toBe(1);
    expect(big.complianceLow).toBeGreaterThan(small.complianceLow);
    expect(big.complianceHigh).toBeGreaterThan(big.complianceLow);
  });
  it('warns about an idle management company and about nothing to protect', () => {
    const r = buildTree({ operatingBusinesses: 0, properties: 0, holdingCompany: true, managementCompany: true, separatePropertyCompanies: true, investmentCompany: false });
    expect(r.warnings.some((w) => /nothing to manage/.test(w))).toBe(true);
    expect(r.warnings.some((w) => /Nothing to protect/.test(w))).toBe(true);
  });
  it('clamps counts to 0..8', () => {
    const r = buildTree({ ...base, operatingBusinesses: 50, properties: -3 });
    expect(r.nodes.filter((n) => n.kind === 'opco')).toHaveLength(8);
    expect(r.nodes.filter((n) => n.kind === 'propco')).toHaveLength(0);
  });
});
