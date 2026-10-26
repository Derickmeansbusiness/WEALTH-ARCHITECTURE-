/**
 * Fixed teaching structure for the Liability Attack Simulator.
 * Deliberately self-contained (no dependency on the Structure Lab renderer).
 */
export type LNodeKind = 'person' | 'trust' | 'entity' | 'asset' | 'insurance' | 'institution';

export interface LNode { id: string; label: string; sub?: string; kind: LNodeKind; x: number; y: number }
export interface LEdge { from: string; to: string; label: string; tone: 'gold' | 'violet' | 'green' | 'amber' | 'ivory'; dashed?: boolean }

export const VIEW = { w: 1000, h: 640 };

export const L_NODES: LNode[] = [
  { id: 'spouse', label: 'Spouse', kind: 'person', x: 150, y: 70 },
  { id: 'ind', label: 'Individual', sub: 'founder', kind: 'person', x: 330, y: 70 },
  { id: 'umbrella', label: 'Umbrella insurance', sub: 'personal liability', kind: 'insurance', x: 620, y: 70 },
  { id: 'lender', label: 'Lender', sub: 'mortgage on Property #1', kind: 'institution', x: 860, y: 70 },
  { id: 'home', label: 'Personal residence', sub: 'joint title', kind: 'asset', x: 90, y: 215 },
  { id: 'bank', label: 'Personal bank account', kind: 'asset', x: 245, y: 215 },
  { id: 'rt', label: 'Revocable Trust', sub: 'settlor = Individual', kind: 'trust', x: 400, y: 215 },
  { id: 'ilit', label: 'Irrevocable Trust', sub: 'ILIT · spendthrift', kind: 'trust', x: 640, y: 215 },
  { id: 'life', label: 'Life insurance', sub: 'owned by ILIT', kind: 'asset', x: 860, y: 215 },
  { id: 'hold', label: 'Holding LLC', sub: 'owned by Revocable Trust', kind: 'entity', x: 400, y: 345 },
  { id: 'opco', label: 'Operating Co LLC', kind: 'entity', x: 160, y: 470 },
  { id: 'prop1', label: 'Property LLC #1', kind: 'entity', x: 400, y: 470 },
  { id: 'prop2', label: 'Property LLC #2', kind: 'entity', x: 580, y: 470 },
  { id: 'inv', label: 'Investment LLC', kind: 'entity', x: 800, y: 470 },
  { id: 'biz', label: 'Business operations', sub: 'receivables, equipment', kind: 'asset', x: 160, y: 580 },
  { id: 'rental1', label: 'Rental #1', sub: 'mortgaged', kind: 'asset', x: 400, y: 580 },
  { id: 'rental2', label: 'Rental #2', sub: 'unencumbered', kind: 'asset', x: 580, y: 580 },
  { id: 'brokerage', label: 'Brokerage account', kind: 'asset', x: 800, y: 580 },
];

export const L_EDGES: LEdge[] = [
  { from: 'spouse', to: 'ind', label: 'married', tone: 'ivory', dashed: true },
  { from: 'ind', to: 'rt', label: 'settlor / trustee', tone: 'gold' },
  { from: 'spouse', to: 'rt', label: 'co-settlor', tone: 'gold' },
  { from: 'ind', to: 'home', label: 'joint owner', tone: 'gold' },
  { from: 'ind', to: 'bank', label: 'owns', tone: 'gold' },
  { from: 'ind', to: 'ilit', label: 'annual gifts', tone: 'violet', dashed: true },
  { from: 'ilit', to: 'life', label: 'owns policy', tone: 'violet' },
  { from: 'umbrella', to: 'ind', label: 'insures', tone: 'green', dashed: true },
  { from: 'rt', to: 'hold', label: 'owns 100%', tone: 'gold' },
  { from: 'hold', to: 'opco', label: 'owns 100%', tone: 'gold' },
  { from: 'hold', to: 'prop1', label: 'owns 100%', tone: 'gold' },
  { from: 'hold', to: 'prop2', label: 'owns 100%', tone: 'gold' },
  { from: 'hold', to: 'inv', label: 'owns 100%', tone: 'gold' },
  { from: 'lender', to: 'prop1', label: 'mortgage', tone: 'amber', dashed: true },
  { from: 'opco', to: 'biz', label: '', tone: 'ivory' },
  { from: 'prop1', to: 'rental1', label: '', tone: 'ivory' },
  { from: 'prop2', to: 'rental2', label: '', tone: 'ivory' },
  { from: 'inv', to: 'brokerage', label: '', tone: 'ivory' },
];

export const nodeById = Object.fromEntries(L_NODES.map((n) => [n.id, n])) as Record<string, LNode>;

/** Assets tracked on the scorecard. */
export type AssetId = 'home' | 'bank' | 'biz' | 'rental1' | 'rental2' | 'brokerage' | 'life';
export const ASSETS: { id: AssetId; label: string; value: number }[] = [
  { id: 'home', label: 'Personal residence (equity)', value: 650_000 },
  { id: 'bank', label: 'Personal bank account', value: 180_000 },
  { id: 'biz', label: 'Operating Co (enterprise value)', value: 1_400_000 },
  { id: 'rental1', label: 'Rental #1 (equity after mortgage)', value: 300_000 },
  { id: 'rental2', label: 'Rental #2 (equity)', value: 520_000 },
  { id: 'brokerage', label: 'Brokerage account', value: 900_000 },
  { id: 'life', label: 'Life insurance (cash value / death benefit)', value: 2_000_000 },
];
