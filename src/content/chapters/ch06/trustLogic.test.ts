import { describe, it, expect } from 'vitest';
import { trustFlags, effectiveGrantorStatus, DEFAULT_TRUST_PARAMS, type TrustParams } from './trustLogic';

describe('trustLogic', () => {
  it('treats a revocable trust as a grantor trust regardless of the toggle', () => {
    const p: TrustParams = { ...DEFAULT_TRUST_PARAMS, revocability: 'revocable', grantorStatus: 'non-grantor' };
    expect(effectiveGrantorStatus(p)).toBe('grantor');
    const f = trustFlags(p);
    expect(f.find((x) => x.category === 'income-tax')?.title).toMatch(/settlor/i);
    expect(f.find((x) => x.category === 'estate-inclusion')?.tone).toBe('red');
    expect(f.find((x) => x.category === 'creditor-reach')?.tone).toBe('red');
  });

  it('always returns exactly one flag per category', () => {
    const combos: TrustParams[] = [];
    for (const revocability of ['revocable', 'irrevocable'] as const)
      for (const grantorStatus of ['grantor', 'non-grantor'] as const)
        for (const situs of ['domestic', 'foreign'] as const)
          for (const distribution of ['discretionary', 'fixed'] as const)
            combos.push({ revocability, grantorStatus, situs, distribution });
    for (const p of combos) {
      const cats = trustFlags(p).map((f) => f.category).sort();
      expect(cats).toEqual(['control', 'creditor-reach', 'estate-inclusion', 'income-tax', 'reporting']);
    }
  });

  it('flags foreign situs with Form 3520 reporting', () => {
    const f = trustFlags({ ...DEFAULT_TRUST_PARAMS, situs: 'foreign' });
    expect(f.find((x) => x.category === 'reporting')?.title).toMatch(/3520/);
  });

  it('non-grantor irrevocable trust is a separate taxpayer', () => {
    const f = trustFlags({ ...DEFAULT_TRUST_PARAMS, grantorStatus: 'non-grantor' });
    expect(f.find((x) => x.category === 'income-tax')?.title).toMatch(/separate taxpayer/i);
  });
});
