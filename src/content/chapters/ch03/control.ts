/** Control Dial logic for Chapter 03. Educational flags only, not legal conclusions. Tested in control.test.ts. */

export type Holder = 'founder' | 'trustee' | 'manager' | 'beneficiaries';
export type Power = 'title' | 'management' | 'voting' | 'distribution' | 'amendment';

export const POWERS: { id: Power; label: string; desc: string }[] = [
  { id: 'title', label: 'Legal title', desc: 'Whose name is on the deed / register.' },
  { id: 'management', label: 'Day-to-day management', desc: 'Runs operations, signs leases, hires.' },
  { id: 'voting', label: 'Voting / major decisions', desc: 'Sell, refinance, admit owners, dissolve.' },
  { id: 'distribution', label: 'Distribution power', desc: 'Decides who receives income and when.' },
  { id: 'amendment', label: 'Amend / revoke', desc: 'Can change or unwind the arrangement.' },
];
export const HOLDERS: { id: Holder; label: string }[] = [
  { id: 'founder', label: 'Founder' },
  { id: 'trustee', label: 'Independent trustee' },
  { id: 'manager', label: 'Manager (non-family)' },
  { id: 'beneficiaries', label: 'Beneficiaries' },
];

export type Assignment = Record<Power, Holder>;

export interface Flag { tone: 'red' | 'amber' | 'green'; title: string; body: string }

export interface ControlReadout {
  /** 0..5 how many of the five powers the founder holds */
  founderPowers: number;
  controlRetained: 'full' | 'substantial' | 'limited' | 'none';
  estateInclusionRisk: 'high' | 'elevated' | 'low';
  grantorTrustLikely: boolean;
  creditorExposure: 'founder' | 'mixed' | 'structure';
  succession: 'none' | 'partial' | 'in place';
  flags: Flag[];
}

export function readControl(a: Assignment): ControlReadout {
  const held = (POWERS.map((p) => a[p.id]).filter((h) => h === 'founder')).length;
  const flags: Flag[] = [];

  const founderDist = a.distribution === 'founder';
  const founderAmend = a.amendment === 'founder';
  const founderTitle = a.title === 'founder';

  let estate: ControlReadout['estateInclusionRisk'] = 'low';
  if (founderTitle || founderAmend || founderDist) estate = 'high';
  else if (a.voting === 'founder') estate = 'elevated';

  if (founderTitle) flags.push({ tone: 'red', title: 'Founder holds legal title', body: 'Nothing has been transferred. The asset is fully in the founder\'s estate and fully reachable by the founder\'s creditors. Every other dial is irrelevant until title moves.' });
  if (founderAmend && !founderTitle) flags.push({ tone: 'red', title: 'Retained power to amend or revoke', body: 'A retained power to alter, amend, revoke or terminate is the classic IRC §2038 problem: the transferred asset is generally pulled back into the estate. It also makes the arrangement a grantor trust (§676) and, for creditors, a revocable arrangement is usually reachable.' });
  if (founderDist && !founderTitle) flags.push({ tone: 'red', title: 'Founder decides who benefits', body: 'A retained right to designate who enjoys income or principal risks inclusion under IRC §2036(a)(2) and makes the trust a grantor trust (§674). Giving this power to an independent trustee is usually the single most important move.' });
  if (a.voting === 'founder' && !founderTitle && !founderDist && !founderAmend) flags.push({ tone: 'amber', title: 'Founder keeps voting control', body: 'Retained voting control over an entity whose interests were transferred is fact-sensitive (compare Estate of Powell and the §2036(b) rule for controlled corporation stock). Often acceptable when the vote is over business operations and not over distributions, and when exercised through a defined role. Expect a modest estate inclusion of whatever the founder still holds and documented, arm\'s-length behaviour.' });
  if (a.management === 'founder' && !founderTitle && !founderDist && !founderAmend) flags.push({ tone: 'green', title: 'Founder manages under a written agreement', body: 'Retained day-to-day management as manager of an LLC, under an operating agreement with limits and a market fee, is common and generally compatible with a completed transfer, provided the founder cannot direct distributions to themselves and the fiduciaries actually supervise.' });
  if (a.distribution === 'beneficiaries') flags.push({ tone: 'amber', title: 'Beneficiaries control their own distributions', body: 'A beneficiary who can compel distributions to themselves holds something close to a general power; the assets are generally reachable by that beneficiary\'s creditors and includible in their estate. Protective trusts usually leave distribution discretion with an independent trustee.' });
  if (a.amendment === 'beneficiaries') flags.push({ tone: 'amber', title: 'Beneficiaries can amend', body: 'Beneficiary-controlled amendment powers weaken creditor protection for the beneficiaries and invite disputes between them. Consider a protector or a limited decanting power instead.' });
  if (a.title === 'trustee' && a.distribution === 'trustee' && a.amendment !== 'founder' && !founderDist) flags.push({ tone: 'green', title: 'Independent trustee holds title and distribution discretion', body: 'This is the coherent asset-protection and estate-exclusion position: the founder has parted with title, benefit and dispositive control. The price is real: the founder cannot take the cash flow back.' });
  if (a.management === 'manager' && a.voting !== 'founder') flags.push({ tone: 'green', title: 'Professional management, separated control', body: 'A non-family manager with the family holding voting rights through fiduciaries is the typical mature family-office shape. Governance quality now depends on how the manager is selected, paid and removed.' });
  if (held === 0) flags.push({ tone: 'amber', title: 'Founder holds nothing', body: 'Maximum protection and estate exclusion, and maximum dependence on the fiduciaries. Make sure a protector or removal mechanism exists; otherwise the family has no remedy if the trustee underperforms.' });
  if (held === 5) flags.push({ tone: 'red', title: 'No separation at all', body: 'Title, management, voting, distribution and amendment all sit with the founder. This is personal ownership with extra paperwork: no asset protection from the founder\'s own creditors, full estate inclusion, no succession layer. It is also the honest starting point most families are at.' });

  const controlRetained: ControlReadout['controlRetained'] = held >= 4 ? 'full' : held >= 2 ? 'substantial' : held === 1 ? 'limited' : 'none';
  const creditorExposure: ControlReadout['creditorExposure'] = founderTitle || founderAmend ? 'founder' : founderDist || a.voting === 'founder' ? 'mixed' : 'structure';
  const succession: ControlReadout['succession'] = founderTitle ? 'none' : a.management === 'founder' && a.voting === 'founder' ? 'partial' : 'in place';
  const grantorTrustLikely = founderAmend || founderDist || founderTitle;

  return { founderPowers: held, controlRetained, estateInclusionRisk: estate, grantorTrustLikely, creditorExposure, succession, flags };
}
