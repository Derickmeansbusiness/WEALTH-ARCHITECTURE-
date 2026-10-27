/** Entity Tree Builder-lite math for Chapter 05. Illustrative compliance figures only. Tested in entityTree.test.ts. */

export interface TreeInput {
  operatingBusinesses: number;
  properties: number;
  holdingCompany: boolean;
  managementCompany: boolean;
  separatePropertyCompanies: boolean;
  investmentCompany: boolean;
}

export type EntityKind = 'holdco' | 'opco' | 'propco' | 'mgmtco' | 'investco' | 'personal';

export interface TreeNode {
  id: string;
  kind: EntityKind;
  label: string;
  parent: string | null;
  /** assets held in this box */
  holds: string[];
  /** liability sources that originate in this box */
  risks: string[];
}

export interface FenceRow {
  /** liability source */
  source: string;
  sourceId: string;
  /** asset labels that this liability can reach */
  reaches: string[];
  /** asset labels fenced from this liability */
  fenced: string[];
}

export interface TreeResult {
  nodes: TreeNode[];
  entityCount: number;
  /** illustrative USD per year */
  complianceLow: number;
  complianceHigh: number;
  fences: FenceRow[];
  warnings: string[];
}

const COST_PER_ENTITY = { low: 1500, high: 2600 }; // state fee + agent + books + return/schedule, illustrative
const HOLDCO_EXTRA = { low: 1200, high: 2500 };   // partnership return
const MGMT_EXTRA = { low: 2500, high: 6000 };     // payroll + services agreement upkeep

export function buildTree(i: TreeInput): TreeResult {
  const ops = Math.max(0, Math.min(8, Math.floor(i.operatingBusinesses)));
  const props = Math.max(0, Math.min(8, Math.floor(i.properties)));
  const nodes: TreeNode[] = [];
  const warnings: string[] = [];

  const root: TreeNode = i.holdingCompany
    ? { id: 'holdco', kind: 'holdco', label: 'Family Holding LLC', parent: null, holds: ['Ownership interests'], risks: [] }
    : { id: 'personal', kind: 'personal', label: 'Family (personal names)', parent: null, holds: [], risks: ['Personal claims (accident, guarantee, divorce)'] };
  nodes.push(root);

  for (let k = 0; k < ops; k++) {
    nodes.push({ id: `op${k + 1}`, kind: 'opco', label: `Operating Co ${k + 1}`, parent: root.id, holds: [`Business ${k + 1} assets`], risks: [`Business ${k + 1} claims (customers, employees, vendors)`] });
  }

  if (props > 0) {
    if (i.separatePropertyCompanies) {
      for (let k = 0; k < props; k++) nodes.push({ id: `prop${k + 1}`, kind: 'propco', label: `Property LLC ${k + 1}`, parent: root.id, holds: [`Property ${k + 1}`], risks: [`Property ${k + 1} premises claims`] });
    } else {
      nodes.push({ id: 'prop1', kind: 'propco', label: props === 1 ? 'Property LLC' : `Property LLC (${props} properties)`, parent: root.id, holds: Array.from({ length: props }, (_, k) => `Property ${k + 1}`), risks: Array.from({ length: props }, (_, k) => `Property ${k + 1} premises claims`) });
      if (props > 1) warnings.push(`${props} properties share one entity: a premises claim at one reaches the equity of all ${props}.`);
    }
  }
  if (i.investmentCompany) nodes.push({ id: 'invest', kind: 'investco', label: 'Investment Co', parent: root.id, holds: ['Liquid portfolio'], risks: [] });
  if (i.managementCompany) nodes.push({ id: 'mgmt', kind: 'mgmtco', label: 'Management Co', parent: root.id, holds: ['Shared staff & systems'], risks: ['Employment claims (shared staff)'] });

  if (!i.holdingCompany && nodes.length > 2) warnings.push('No holding company: the family owns each box directly, so every charging order and every ownership decision is at the personal level, and there is no single place to write a distribution or leverage policy.');
  if (i.managementCompany && ops + props === 0) warnings.push('A management company with nothing to manage is a filing fee. Add operating businesses or properties, or remove it.');
  if (!i.managementCompany && ops + props >= 4) warnings.push('Four or more operating boxes with no management company usually means shared staff are employed by one operating company, which imports its risk into the others\' payroll and muddies arm\'s-length allocation.');
  if (ops === 0 && props === 0) warnings.push('Nothing to protect yet. Entities are a response to assets and risk, not a precursor to them.');

  // Fences: which liability sources reach which assets.
  const allAssets = nodes.flatMap((n) => n.holds.filter((h) => h !== 'Ownership interests'));
  const fences: FenceRow[] = [];
  for (const n of nodes) {
    for (const risk of n.risks) {
      let reaches: string[];
      if (n.kind === 'personal') {
        // personal claims reach everything the family owns directly (no holdco) — via the interests themselves.
        reaches = allAssets;
      } else {
        reaches = n.holds.filter((h) => h !== 'Ownership interests');
      }
      fences.push({ source: risk, sourceId: n.id, reaches, fenced: allAssets.filter((a) => !reaches.includes(a)) });
    }
  }
  if (i.holdingCompany) {
    fences.unshift({ source: 'Personal claims against a family member', sourceId: 'family', reaches: ['Distributions from Family Holding LLC (charging order)'], fenced: allAssets });
  }

  const entityCount = nodes.filter((n) => n.kind !== 'personal').length;
  const complianceLow = entityCount * COST_PER_ENTITY.low + (i.holdingCompany ? HOLDCO_EXTRA.low : 0) + (i.managementCompany ? MGMT_EXTRA.low : 0);
  const complianceHigh = entityCount * COST_PER_ENTITY.high + (i.holdingCompany ? HOLDCO_EXTRA.high : 0) + (i.managementCompany ? MGMT_EXTRA.high : 0);

  return { nodes, entityCount, complianceLow, complianceHigh, fences, warnings };
}
