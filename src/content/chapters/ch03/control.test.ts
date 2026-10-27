import { describe, it, expect } from 'vitest';
import { readControl, type Assignment } from './control';

const all = (h: Assignment['title']): Assignment => ({ title: h, management: h, voting: h, distribution: h, amendment: h });

describe('readControl', () => {
  it('flags personal ownership as full control, high estate inclusion, founder exposure', () => {
    const r = readControl(all('founder'));
    expect(r.founderPowers).toBe(5);
    expect(r.controlRetained).toBe('full');
    expect(r.estateInclusionRisk).toBe('high');
    expect(r.creditorExposure).toBe('founder');
    expect(r.succession).toBe('none');
    expect(r.flags.some((f) => f.title === 'No separation at all')).toBe(true);
  });
  it('treats trustee title + trustee distribution + no founder amendment as the coherent protective position', () => {
    const r = readControl({ title: 'trustee', management: 'founder', voting: 'trustee', distribution: 'trustee', amendment: 'trustee' });
    expect(r.estateInclusionRisk).toBe('low');
    expect(r.grantorTrustLikely).toBe(false);
    expect(r.creditorExposure).toBe('structure');
    expect(r.flags.some((f) => f.tone === 'green' && /Independent trustee/.test(f.title))).toBe(true);
    expect(r.flags.some((f) => /manages under a written agreement/.test(f.title))).toBe(true);
  });
  it('flags a retained distribution power as a §2036 problem', () => {
    const r = readControl({ title: 'trustee', management: 'manager', voting: 'trustee', distribution: 'founder', amendment: 'trustee' });
    expect(r.estateInclusionRisk).toBe('high');
    expect(r.grantorTrustLikely).toBe(true);
    expect(r.flags.some((f) => /decides who benefits/.test(f.title))).toBe(true);
  });
  it('flags a retained amendment power as a §2038 problem', () => {
    const r = readControl({ title: 'trustee', management: 'manager', voting: 'trustee', distribution: 'trustee', amendment: 'founder' });
    expect(r.estateInclusionRisk).toBe('high');
    expect(r.creditorExposure).toBe('founder');
    expect(r.flags.some((f) => /amend or revoke/.test(f.title))).toBe(true);
  });
  it('marks retained voting alone as elevated, not high', () => {
    const r = readControl({ title: 'trustee', management: 'manager', voting: 'founder', distribution: 'trustee', amendment: 'trustee' });
    expect(r.estateInclusionRisk).toBe('elevated');
    expect(r.creditorExposure).toBe('mixed');
  });
  it('warns when the founder holds nothing', () => {
    const r = readControl(all('trustee'));
    expect(r.controlRetained).toBe('none');
    expect(r.flags.some((f) => /holds nothing/.test(f.title))).toBe(true);
  });
});
