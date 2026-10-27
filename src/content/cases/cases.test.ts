import { describe, it, expect } from 'vitest';
import { FAMILIES, entityCount } from './index';

describe('case study content', () => {
  it('has five families at levels 1..5 with 4–5 stages each', () => {
    expect(FAMILIES.map((f) => f.level)).toEqual([1, 2, 3, 4, 5]);
    for (const f of FAMILIES) { expect(f.stages.length).toBeGreaterThanOrEqual(4); expect(f.stages.length).toBeLessThanOrEqual(5); }
  });
  it('every edge references a node in the same stage and node ids are unique', () => {
    for (const f of FAMILIES) for (const s of f.stages) {
      const ids = s.structure.nodes.map((n) => n.id);
      expect(new Set(ids).size, `${f.id}/${s.year} duplicate ids`).toBe(ids.length);
      for (const e of s.structure.edges) {
        expect(ids, `${f.id}/${s.year} edge from ${e.from}`).toContain(e.from);
        expect(ids, `${f.id}/${s.year} edge to ${e.to}`).toContain(e.to);
      }
    }
  });
  it('stages are chronological and net worth is positive', () => {
    for (const f of FAMILIES) {
      for (let i = 1; i < f.stages.length; i++) expect(f.stages[i].year).toBeGreaterThan(f.stages[i - 1].year);
      for (const s of f.stages) expect(s.netWorthUSD).toBeGreaterThan(0);
    }
  });
  it('net worth is within a reasonable band of the balance sheet', () => {
    for (const f of FAMILIES) for (const s of f.stages) {
      const a = s.balanceSheet.assets.reduce((x, l) => x + l.value, 0);
      const l = s.balanceSheet.liabilities.reduce((x, y) => x + y.value, 0);
      const bs = a - l;
      expect(Math.abs(bs - s.netWorthUSD) / s.netWorthUSD, `${f.id}/${s.year}: bs ${bs} vs nw ${s.netWorthUSD}`).toBeLessThan(0.25);
    }
  });
  it('entity count grows from first to last stage in every family', () => {
    for (const f of FAMILIES) expect(entityCount(f.stages[f.stages.length - 1])).toBeGreaterThan(entityCount(f.stages[0]));
  });
});
