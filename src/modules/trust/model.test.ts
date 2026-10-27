import { describe, it, expect } from 'vitest';
import { deriveConsequences, normalize, ALL_COMBINATIONS, PRESETS, configKey } from './model';

describe('normalize', () => {
  it('forces grantor status on revocable trusts (IRC §676)', () => {
    expect(normalize({ revocable: true, grantor: false, foreign: false, discretionary: true }).grantor).toBe(true);
    expect(normalize({ revocable: false, grantor: false, foreign: false, discretionary: true }).grantor).toBe(false);
  });
});

describe('deriveConsequences', () => {
  it('covers all 16 combinations with unique keys', () => {
    expect(ALL_COMBINATIONS.length).toBe(16);
    expect(new Set(ALL_COMBINATIONS.map(configKey)).size).toBe(16);
    for (const c of ALL_COMBINATIONS) {
      const d = deriveConsequences(c);
      expect(d.incomeTax.who.length).toBeGreaterThan(0);
      expect(d.estateInclusion.length).toBeGreaterThan(0);
      expect(d.reporting.length).toBeGreaterThan(0);
      expect(d.professionals.length).toBeGreaterThan(1);
      expect(d.uses.length).toBeGreaterThan(0);
    }
  });
  it('marks revocable + non-grantor as unavailable', () => {
    const d = deriveConsequences({ revocable: true, grantor: false, foreign: false, discretionary: true });
    expect(d.unavailable).toBeDefined();
    expect(d.incomeTax.who).toBe('Settlor');
  });
  it('taxes revocable trusts to the settlor and includes them in the estate', () => {
    const d = deriveConsequences({ revocable: true, grantor: true, foreign: false, discretionary: false });
    expect(d.incomeTax.short).toContain('676');
    expect(d.estateInclusion[0].text).toContain('2038');
    expect(d.creditorSettlor.text).toMatch(/Reachable/);
  });
  it('routes foreign grantor trusts through §679 and adds Forms 3520/3520-A and FBAR', () => {
    const d = deriveConsequences({ revocable: false, grantor: true, foreign: true, discretionary: true });
    expect(d.incomeTax.short).toContain('679');
    expect(d.reporting.join(' ')).toContain('3520-A');
    expect(d.reporting.join(' ')).toContain('FBAR');
  });
  it('non-grantor domestic trusts pay their own tax with compressed brackets', () => {
    const d = deriveConsequences({ revocable: false, grantor: false, foreign: false, discretionary: true });
    expect(d.incomeTax.short).toContain('1041');
    expect(d.incomeTax.detail).toMatch(/compressed/i);
  });
  it('discretionary interests protect beneficiaries better than fixed ones', () => {
    const disc = deriveConsequences({ revocable: false, grantor: false, foreign: false, discretionary: true });
    const fixed = deriveConsequences({ revocable: false, grantor: false, foreign: false, discretionary: false });
    expect(disc.creditorBeneficiaries.level).toBe('green');
    expect(fixed.creditorBeneficiaries.level).toBe('amber');
  });
  it('never claims tax elimination', () => {
    for (const c of ALL_COMBINATIONS) {
      const text = JSON.stringify(deriveConsequences(c)).toLowerCase();
      expect(text).not.toContain('tax-free banking');
      expect(text).not.toMatch(/eliminates? (all )?tax/);
    }
  });
});

describe('presets', () => {
  it('each preset normalizes to itself and has assets and beneficiaries', () => {
    for (const p of PRESETS) {
      expect(normalize(p.config)).toEqual(p.config);
      expect(p.assets.length).toBeGreaterThan(0);
      expect(p.beneficiaries.length).toBeGreaterThan(0);
    }
    expect(PRESETS.find((p) => p.id === 'dynasty')?.variant).toBeDefined();
  });
});
