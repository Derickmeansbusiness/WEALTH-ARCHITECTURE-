import { describe, it, expect } from 'vitest';
import { auditExposure, DEFAULT_FACTS, maxSeverity, type ExposureFacts } from './model';

const disciplined: ExposureFacts = {
  singleMemberLLC: false, personalGuarantee: false, commingled: false, transferAfterClaim: false,
  daptNonResident: false, adequateInsurance: true, chargingOrderExclusive: true, tenancyByEntirety: true, erisaPlans: true,
};

describe('maxSeverity', () => {
  it('picks the highest severity', () => {
    expect(maxSeverity('low', 'high', 'medium')).toBe('high');
    expect(maxSeverity('low')).toBe('low');
    expect(maxSeverity('critical', 'low')).toBe('critical');
  });
});

describe('auditExposure', () => {
  it('scores a disciplined structure at 100 with no high flags', () => {
    const r = auditExposure(disciplined);
    expect(r.integrityScore).toBe(100);
    expect(r.flags.length).toBe(0);
    expect(r.worst).toBe('low');
  });
  it('a transfer after the claim arose is critical and dominates', () => {
    const r = auditExposure({ ...disciplined, transferAfterClaim: true });
    expect(r.worst).toBe('critical');
    expect(r.flags[0].id).toBe('timing');
    expect(r.assets.find((a) => a.id === 'trust')!.outside).toBe('critical');
  });
  it('a personal guarantee exposes the home and rental to inside claims', () => {
    const base = auditExposure(disciplined);
    const r = auditExposure({ ...disciplined, personalGuarantee: true });
    const home = r.assets.find((a) => a.id === 'home')!;
    expect(home.inside).toBe('medium');
    expect(base.assets.find((a) => a.id === 'home')!.inside).toBe('low');
    expect(r.flags.some((f) => f.id === 'guarantee')).toBe(true);
  });
  it('single-member LLC in a non-exclusive-remedy state is high; exclusive remedy softens it', () => {
    const weak = auditExposure({ ...disciplined, singleMemberLLC: true, chargingOrderExclusive: false });
    const better = auditExposure({ ...disciplined, singleMemberLLC: true, chargingOrderExclusive: true });
    expect(weak.assets.find((a) => a.id === 'opco')!.outside).toBe('high');
    expect(better.assets.find((a) => a.id === 'opco')!.outside).toBe('medium');
  });
  it('inside claims always reach the operating company itself', () => {
    const r = auditExposure(disciplined);
    expect(r.assets.find((a) => a.id === 'opco')!.inside).toBe('critical');
  });
  it('flags are sorted by severity and the score never goes below zero', () => {
    const all: ExposureFacts = { ...DEFAULT_FACTS, commingled: true, transferAfterClaim: true, daptNonResident: true, adequateInsurance: false, erisaPlans: false };
    const r = auditExposure(all);
    for (let i = 1; i < r.flags.length; i++) {
      const rank = { low: 0, medium: 1, high: 2, critical: 3 };
      expect(rank[r.flags[i - 1].severity]).toBeGreaterThanOrEqual(rank[r.flags[i].severity]);
    }
    expect(r.integrityScore).toBeGreaterThanOrEqual(0);
    expect(r.integrityScore).toBeLessThan(20);
  });
});
