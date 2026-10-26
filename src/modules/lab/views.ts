/** Per-view framing shared by the Lab, the Master Map and the Debt Studio financing map. */
import type { MapView, ComponentCategory } from '@/types/structure';
import { MAP_VIEWS } from '@/types/structure';

export interface ViewLegend {
  id: MapView;
  label: string;
  question: string;
  /** One paragraph: what this view reveals and what it deliberately hides. */
  legend: string;
  /** Swatches shown under the legend. */
  items: { color: string; label: string; dashed?: boolean }[];
  accent: string;
}

const Q = Object.fromEntries(MAP_VIEWS.map((v) => [v.id, v])) as Record<MapView, { id: MapView; label: string; question: string }>;

export const VIEW_LEGENDS: Record<MapView, ViewLegend> = {
  ownership: {
    ...Q.ownership,
    accent: 'var(--gold)',
    legend: 'Only legal title is drawn here: who holds the shares, the membership interests, the deed, the policy. Nodes are sized by recorded value so you see where the balance sheet actually sits, and each OWNS edge carries its percentage so cap tables can be checked at a glance. Control, cash and claims are hidden on purpose — ownership is a narrower question than most people assume, and it is the one that beneficial-ownership registers, probate courts and creditors ask first.',
    items: [{ color: 'var(--gold)', label: 'OWNS (with %)' }, { color: 'var(--ivory-3)', label: 'Node size ∝ recorded value' }],
  },
  control: {
    ...Q.control,
    accent: 'var(--blue)',
    legend: 'Here the gold disappears and the blue appears: trustees, managers, protectors and directors. Nodes that make decisions wear a blue halo; nodes that merely own something — a beneficiary, a passive member, a trust that is run by someone else — are dimmed. Sophisticated families separate these two maps deliberately, so that the person who signs is not the person who is sued, and the person who benefits is not the person who decides. Compare it with the Ownership view node by node.',
    items: [{ color: 'var(--blue)', label: 'CONTROLS · MANAGES · TRUSTEE · PROTECTOR' }, { color: 'var(--ivory-3)', label: 'EMPLOYS' }, { color: '#9db7d6', label: 'Halo = decision-maker · dimmed = pure owner' }],
  },
  cashflow: {
    ...Q.cashflow,
    accent: 'var(--green-2)',
    legend: 'Money moves along contracts, not along org charts. Animated lines show rent, dividends, distributions, premiums, compensation, management fees and — in amber — scheduled debt service running back to a lender. Loan payments are computed from the recorded terms with the shared finance engine, so the amounts you see are the amounts the documents would require. Every one of these flows is a tax event for someone, which is why the question is "where does money move, and why", not just where.',
    items: [{ color: 'var(--green-2)', label: 'Distributions · rent · lending' }, { color: 'var(--amber)', label: 'Debt service back to lender' }, { color: 'var(--ivory-3)', label: 'Compensation · fees' }],
  },
  liability: {
    ...Q.liability,
    accent: 'var(--red)',
    legend: 'Pick the node where a claim arises and watch where it can travel. A creditor reaches what the defendant owns (downward along OWNS) and anyone who signed a guarantee (the red edges), but cannot climb to the owners — that is the entity shield, drawn as a fence around each company and the assets only it holds. A fence turns red when a guarantee bridges it. Charging-order protection, veil piercing, fraudulent-transfer law and the quality of the documentation decide whether these fences hold in a real courtroom.',
    items: [{ color: 'var(--red)', label: 'GUARANTEES (bridges the fence)' }, { color: 'var(--gold)', label: 'OWNS (claim travels downward)' }, { color: 'var(--green-2)', label: 'Lending / borrowing' }, { color: 'var(--green-2)', label: 'Fence holding', dashed: true }, { color: 'var(--red)', label: 'Fence reached', dashed: true }],
  },
  succession: {
    ...Q.succession,
    accent: 'var(--violet)',
    legend: 'Switch the death event on and the map answers the question families avoid: what happens tomorrow morning. Assets held in the individual\'s own name go through the estate (probate, or a beneficiary designation); interests in trusts pass by their terms outside probate; roles the individual held — trustee, manager, protector — fall vacant and need named successors. Beneficiaries and trustees light up in violet; everything that keeps running without the individual stays lit; everything that depended on them dims.',
    items: [{ color: 'var(--violet)', label: 'BENEFICIARY · DISTRIBUTES TO' }, { color: 'var(--gold)', label: 'OWNS (what the estate holds)' }, { color: 'var(--blue)', label: 'TRUSTEE (role continuity)' }, { color: 'var(--green-2)', label: 'INSURES (liquidity at death)' }],
  },
};

export const CATEGORY_COLOR: Record<ComponentCategory, string> = {
  person: 'var(--gold)',
  trust: 'var(--violet)',
  entity: 'var(--ivory-2)',
  asset: 'var(--green-2)',
  instrument: 'var(--amber)',
  institution: 'var(--gold)',
};

export const CATEGORY_LABEL: Record<ComponentCategory, string> = {
  person: 'People', trust: 'Trusts', entity: 'Entities', asset: 'Assets', instrument: 'Instruments', institution: 'Institutions',
};
