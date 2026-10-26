import { describe, it, expect } from 'vitest';
import { mapReporting, DEFAULT_STRUCTURE, SITUS, type StructureFacts } from './model';

const ids = (f: StructureFacts) => mapReporting(f).items.map((i) => i.id);

describe('mapReporting — tax character', () => {
  it('US settlor + US beneficiaries is a §679 grantor trust with 3520 and 3520-A', () => {
    const r = mapReporting(DEFAULT_STRUCTURE);
    expect(r.taxCharacter).toMatch(/§679/);
    expect(ids(DEFAULT_STRUCTURE)).toEqual(expect.arrayContaining(['3520', '3520a']));
  });
  it('US settlor with no US beneficiaries triggers §684 gain and no 3520-A', () => {
    const f = { ...DEFAULT_STRUCTURE, beneficiariesUS: false };
    expect(ids(f)).toContain('684');
    expect(ids(f)).not.toContain('3520a');
  });
  it('non-US settlor with US beneficiaries implicates beneficiary 3520 and throwback', () => {
    const f = { ...DEFAULT_STRUCTURE, settlorUS: false };
    expect(ids(f)).toEqual(expect.arrayContaining(['3520c', 'throwback']));
    expect(ids(f)).not.toContain('3520');
  });
  it('no US persons means no US items and complexity 1', () => {
    const f: StructureFacts = { ...DEFAULT_STRUCTURE, settlorUS: false, beneficiariesUS: false };
    const r = mapReporting(f);
    expect(r.items.length).toBe(0);
    expect(r.complexity).toBe(1);
    expect(r.annualCost[0]).toBe(SITUS.cook.trusteeFee[0]);
  });
});

describe('mapReporting — asset-driven items', () => {
  it('foreign accounts add FBAR and 8938 only when a US person is involved', () => {
    expect(ids({ ...DEFAULT_STRUCTURE, foreignAccounts: true })).toEqual(expect.arrayContaining(['fbar', '8938']));
    expect(ids({ ...DEFAULT_STRUCTURE, foreignAccounts: false })).not.toContain('fbar');
    expect(ids({ ...DEFAULT_STRUCTURE, settlorUS: false, beneficiariesUS: false, foreignAccounts: true })).not.toContain('fbar');
  });
  it('a foreign company adds 5471 for US persons and Form 926 only for a US settlor', () => {
    expect(ids({ ...DEFAULT_STRUCTURE, foreignCompany: true })).toEqual(expect.arrayContaining(['5471', '926']));
    const nonUSsettlor = ids({ ...DEFAULT_STRUCTURE, settlorUS: false, foreignCompany: true });
    expect(nonUSsettlor).toContain('5471');
    expect(nonUSsettlor).not.toContain('926');
    expect(ids({ ...DEFAULT_STRUCTURE, foreignCompany: false })).not.toContain('5471');
  });
});

describe('mapReporting — complexity and cost', () => {
  it('complexity is bounded 1..5 and grows with items', () => {
    const light = mapReporting({ ...DEFAULT_STRUCTURE, foreignAccounts: false, foreignCompany: false });
    const heavy = mapReporting(DEFAULT_STRUCTURE);
    expect(light.complexity).toBeGreaterThanOrEqual(1);
    expect(heavy.complexity).toBeLessThanOrEqual(5);
    expect(heavy.complexity).toBeGreaterThanOrEqual(light.complexity);
    expect(heavy.annualCost[1]).toBeGreaterThan(light.annualCost[1]);
  });
  it('situs changes trustee cost band but not the US reporting items', () => {
    const cook = mapReporting({ ...DEFAULT_STRUCTURE, situs: 'cook' });
    const jersey = mapReporting({ ...DEFAULT_STRUCTURE, situs: 'jersey' });
    expect(cook.items.map((i) => i.id)).toEqual(jersey.items.map((i) => i.id));
    expect(jersey.annualCost[1]).toBeGreaterThan(cook.annualCost[1]);
  });
});
