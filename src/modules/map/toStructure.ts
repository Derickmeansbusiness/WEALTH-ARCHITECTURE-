/** Convert the Master Map into a Structure Lab `Structure` so it can be edited and analysed in /lab. */
import type { Structure, StructureEdge, StructureNode } from '@/types/structure';
import { LAYERS, MAP_EDGES, nodePosition } from './layers';

export const MASTER_MAP_ID = 'master-map';

export function masterMapToStructure(): Structure {
  const nodes: StructureNode[] = [];
  for (const layer of LAYERS) {
    for (const n of layer.nodes) {
      const p = nodePosition(n, layer);
      nodes.push({ id: n.id, kind: n.kind, label: n.label, x: Math.round(p.x * 1.35), y: Math.round(p.y * 1.35), jurisdiction: n.jurisdiction, value: n.value, notes: `${layer.title} — ${layer.summary}` });
    }
  }
  const edges: StructureEdge[] = MAP_EDGES.map((e, i) => {
    const edge: StructureEdge = { id: `mm-${i}`, from: e.from, to: e.to, kind: e.rel, label: e.label, percent: e.percent };
    if (e.rel === 'lends-to') {
      edge.loan = e.to === 'propco'
        ? { principal: 4000000, rate: 0.06, termMonths: 240, structure: 'amortizing', paymentFrequency: 'monthly', relatedParty: true, collateral: 'Real Estate', purpose: 'Refinance the external mortgage inside the family', securityDocs: ['Promissory note', 'Mortgage / deed of trust', 'Board resolution'], originatedYear: 2024, jurisdiction: 'Home state' }
        : { principal: 750000, rate: 0.055, termMonths: 84, structure: 'amortizing', paymentFrequency: 'monthly', relatedParty: true, collateral: 'New Venture Co.', purpose: 'Seed capital for the next generation\'s venture', securityDocs: ['Promissory note', 'Security agreement', 'UCC-1 filing', 'Board resolution'], originatedYear: 2025, jurisdiction: 'Home state' };
    }
    return edge;
  });
  const now = Date.now();
  return { id: MASTER_MAP_ID, name: 'Master Map — Family Wealth Architecture', description: 'Generated from the Architecture Map. Twelve layers from the individual to future generations.', nodes, edges, createdAt: now, updatedAt: now };
}
