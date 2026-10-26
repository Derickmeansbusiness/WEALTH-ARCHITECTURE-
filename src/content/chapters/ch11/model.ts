/**
 * Exposure Audit model — Chapter 11 (Domestic Asset Protection).
 * Pure functions: given a set of facts about a family's structure, flag where a judgment creditor
 * can reach, and why. Educational heuristics only — real analysis depends on state law and facts.
 */

export interface ExposureFacts {
  /** Operating business held in a single-member LLC (vs multi-member with real economic co-owners) */
  singleMemberLLC: boolean;
  /** Owner has signed personal guarantees on business or property debt */
  personalGuarantee: boolean;
  /** Personal and entity funds move through the same accounts; formalities not observed */
  commingled: boolean;
  /** Assets were moved into protective structures after a claim arose or was reasonably foreseeable */
  transferAfterClaim: boolean;
  /** Settlor lives in a state without a DAPT statute but funded a DAPT elsewhere */
  daptNonResident: boolean;
  /** Primary and umbrella liability insurance adequate to the realistic claim size */
  adequateInsurance: boolean;
  /** State of residence makes the charging order the exclusive remedy against LLC interests */
  chargingOrderExclusive: boolean;
  /** Married; residence held as tenancy by the entirety in a state that recognizes it */
  tenancyByEntirety: boolean;
  /** Retirement savings are in ERISA-governed plans (401(k), pension) rather than only IRAs */
  erisaPlans: boolean;
}

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface AssetExposure {
  id: 'home' | 'opco' | 'rental' | 'brokerage' | 'retirement' | 'trust';
  label: string;
  /** Exposure to an OUTSIDE creditor (claim against the owner personally) */
  outside: Severity;
  /** Exposure to an INSIDE creditor (claim arising inside the operating business) */
  inside: Severity;
  notes: string[];
}

export interface Flag {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  /** Whether this flag ordinarily warrants professional review before acting */
  professionalReview: boolean;
}

export interface ExposureResult {
  assets: AssetExposure[];
  flags: Flag[];
  /** 0 (fully undermined) .. 100 (as disciplined as a domestic structure gets) */
  integrityScore: number;
  worst: Severity;
}

const SEV_RANK: Record<Severity, number> = { low: 0, medium: 1, high: 2, critical: 3 };
export const maxSeverity = (...s: Severity[]): Severity => s.reduce((a, b) => (SEV_RANK[b] > SEV_RANK[a] ? b : a), 'low');

export const DEFAULT_FACTS: ExposureFacts = {
  singleMemberLLC: true,
  personalGuarantee: true,
  commingled: false,
  transferAfterClaim: false,
  daptNonResident: false,
  adequateInsurance: true,
  chargingOrderExclusive: false,
  tenancyByEntirety: false,
  erisaPlans: true,
};

export function auditExposure(f: ExposureFacts): ExposureResult {
  const flags: Flag[] = [];

  // ── Facts that undermine everything ──────────────────────────────
  if (f.transferAfterClaim) {
    flags.push({
      id: 'timing', severity: 'critical', professionalReview: true,
      title: 'Transfers made after the claim arose',
      detail: 'A transfer into a trust or entity made with intent to hinder, delay or defraud a creditor is voidable under the UVTA/UFTA and 11 U.S.C. §548, and self-settled trust transfers carry a ten-year bankruptcy lookback under §548(e). Timing is the single most common reason a structure fails. Planning done before any claim is foreseeable is protected; planning done afterwards is usually unwound, sometimes with sanctions.',
    });
  }
  if (f.commingled) {
    flags.push({
      id: 'commingling', severity: 'high', professionalReview: true,
      title: 'Commingled accounts and ignored formalities',
      detail: 'Courts pierce the veil or treat the entity as the owner\'s alter ego when personal and entity funds move through the same accounts, when there are no operating agreements, minutes, or arm\'s-length documentation, and when the entity is undercapitalized. The liability shield is a privilege conditioned on treating the entity as genuinely separate.',
    });
  }
  if (f.personalGuarantee) {
    flags.push({
      id: 'guarantee', severity: 'high', professionalReview: false,
      title: 'Personal guarantees bridge the entity wall',
      detail: 'A guarantee is a voluntary waiver of limited liability for that lender. The entity shield still works against tort claimants and trade creditors, but the guaranteed lender can pursue personal assets directly. Negotiate carve-outs, caps, burn-off provisions, or replace guarantees with higher equity as the business matures.',
    });
  }
  if (f.singleMemberLLC) {
    flags.push({
      id: 'smllc', severity: f.chargingOrderExclusive ? 'medium' : 'high', professionalReview: true,
      title: 'Single-member LLC is the weakest form of charging-order protection',
      detail: f.chargingOrderExclusive
        ? 'Your state treats the charging order as the exclusive remedy even for single-member LLCs, which materially helps. Expect the result to differ in bankruptcy (In re Albright) and before courts applying another state\'s law. A second genuine member with real economic interest strengthens the argument that the charging order should protect innocent co-owners.'
        : 'The charging order was designed to protect innocent co-members from a debtor-member\'s creditor. With no co-members to protect, courts in Olmstead v. FTC (Fla. 2010) and In re Albright (Bankr. D. Colo. 2003) let the creditor take or foreclose on the whole interest. Outside the handful of "exclusive remedy" states this is a soft shield.',
    });
  }
  if (f.daptNonResident) {
    flags.push({
      id: 'dapt', severity: 'high', professionalReview: true,
      title: 'Self-settled trust governed by another state\'s law',
      detail: 'A resident of a state that refuses to recognize self-settled spendthrift trusts cannot reliably import Nevada, South Dakota, Delaware or Alaska law by choosing it in the trust. In re Huber (Bankr. W.D. Wash. 2013) applied the settlor\'s home-state policy and voided the trust; Toni 1 Trust v. Wacker (Alaska 2018) confirmed Alaska cannot deny other states\' courts jurisdiction over fraudulent-transfer claims. A DAPT can still help, particularly against settlement leverage, but treat it as uncertain rather than a wall.',
    });
  }
  if (!f.adequateInsurance) {
    flags.push({
      id: 'insurance', severity: 'high', professionalReview: false,
      title: 'Insurance is thin relative to realistic claims',
      detail: 'Insurance is the first line because it pays defense costs and settles claims before anyone tests your structure. An underinsured family is asking its entities and trusts to do a job insurance does more cheaply and more predictably. Umbrella coverage of several million dollars is typically inexpensive relative to the exposure it absorbs.',
    });
  }
  if (!f.chargingOrderExclusive && !f.singleMemberLLC) {
    flags.push({
      id: 'foreclosure', severity: 'medium', professionalReview: true,
      title: 'Charging-order lien may be foreclosed in your state',
      detail: 'States following the uniform LLC acts allow a court to foreclose on the charged interest when distributions will not satisfy the judgment in a reasonable time. A multi-member LLC still protects the entity\'s assets and the co-owners, but the debtor-member\'s economic interest can be sold.',
    });
  }
  if (!f.tenancyByEntirety) {
    flags.push({
      id: 'tbe', severity: 'low', professionalReview: false,
      title: 'Residence not held as tenancy by the entirety',
      detail: 'Where available (roughly half the states), tenancy by the entirety prevents a creditor of one spouse alone from reaching the home. It does nothing against joint creditors, the IRS (United States v. Craft), or after divorce or the first death. Where unavailable, the homestead exemption sets the limit.',
    });
  }
  if (!f.erisaPlans) {
    flags.push({
      id: 'ira', severity: 'low', professionalReview: false,
      title: 'Retirement assets outside ERISA rely on state exemptions',
      detail: 'ERISA plans carry an anti-alienation rule honored in and out of bankruptcy (Patterson v. Shumate). IRAs are protected in bankruptcy up to an inflation-adjusted cap (rollovers from qualified plans are uncapped), but outside bankruptcy their protection depends entirely on state exemption statutes, which range from unlimited to modest. Inherited IRAs are not retirement funds for exemption purposes (Clark v. Rameker).',
    });
  }

  // ── Per-asset exposure ────────────────────────────────────────────
  const undermined = f.transferAfterClaim || f.commingled;

  const opcoOutside: Severity = f.singleMemberLLC ? (f.chargingOrderExclusive ? 'medium' : 'high') : (f.chargingOrderExclusive ? 'low' : 'medium');
  const opco: AssetExposure = {
    id: 'opco', label: 'Operating business (LLC)',
    outside: maxSeverity(opcoOutside, undermined ? 'high' : 'low'),
    inside: 'critical',
    notes: [
      'Inside claims (a customer, employee or product injury) reach everything the operating company owns. That is what the entity is for: to contain the blast radius.',
      f.singleMemberLLC ? 'Single-member status weakens charging-order protection against your personal creditors.' : 'Multi-member structure supports the charging-order rationale.',
    ],
  };

  const rental: AssetExposure = {
    id: 'rental', label: 'Rental property (separate LLC)',
    outside: maxSeverity(opcoOutside, undermined ? 'high' : 'low'),
    inside: f.personalGuarantee ? 'medium' : 'low',
    notes: [
      'Separated from the operating company, an inside claim at the business should not reach the rental.',
      f.personalGuarantee ? 'A guaranteed mortgage lets the lender pursue you personally if the property cannot service the debt.' : 'Non-recourse or entity-only debt keeps the lender inside the entity.',
      f.commingled ? 'Commingling between the LLCs invites a court to treat them as one enterprise.' : 'Separate books, leases and accounts preserve the separation.',
    ],
  };

  const home: AssetExposure = {
    id: 'home', label: 'Primary residence',
    outside: f.tenancyByEntirety ? 'low' : 'medium',
    inside: f.personalGuarantee ? 'medium' : (f.tenancyByEntirety ? 'low' : 'medium'),
    notes: [
      f.tenancyByEntirety ? 'Tenancy by the entirety shields against creditors of one spouse alone.' : 'Protection depends on your state\'s homestead exemption, which ranges from unlimited (Florida, Texas) to nominal.',
      f.personalGuarantee ? 'Guaranteed debt converts an inside business claim into a personal one that can reach non-exempt home equity.' : 'Without guarantees, business creditors must get through the entity first.',
    ],
  };

  const brokerage: AssetExposure = {
    id: 'brokerage', label: 'Personal brokerage account',
    outside: 'critical',
    inside: f.personalGuarantee ? 'high' : (f.commingled ? 'high' : 'low'),
    notes: [
      'Personally titled liquid assets are the first thing a judgment creditor levies. This is why families move investment capital into entities or trusts before any claim exists.',
      !f.adequateInsurance ? 'Thin insurance means this account funds your own defense and settlement.' : 'Adequate insurance usually settles the claim before it reaches here.',
    ],
  };

  const retirement: AssetExposure = {
    id: 'retirement', label: 'Retirement accounts',
    outside: f.erisaPlans ? 'low' : 'medium',
    inside: f.erisaPlans ? 'low' : 'medium',
    notes: [
      f.erisaPlans ? 'ERISA anti-alienation protects plan assets from most creditors (not the IRS or a QDRO).' : 'IRA protection outside bankruptcy depends on state exemption law.',
    ],
  };

  const trust: AssetExposure = {
    id: 'trust', label: 'Self-settled asset protection trust',
    outside: f.transferAfterClaim ? 'critical' : f.daptNonResident ? 'high' : 'medium',
    inside: f.transferAfterClaim ? 'critical' : f.daptNonResident ? 'high' : 'medium',
    notes: [
      f.daptNonResident ? 'Conflict-of-laws risk: your home state\'s public policy may override the trust\'s governing-law clause.' : 'Resident of a DAPT state with a local trustee: the statute is more likely to be applied as written, subject to the seasoning period.',
      f.transferAfterClaim ? 'Funding after the claim arose is the textbook voidable transfer.' : 'Funded before any claim with solvency documented: the strongest fact pattern available.',
      'Bankruptcy adds the ten-year lookback of §548(e) for transfers to self-settled trusts made with actual intent.',
    ],
  };

  const assets = [brokerage, home, opco, rental, retirement, trust];

  // ── Integrity score ───────────────────────────────────────────────
  let score = 100;
  for (const fl of flags) score -= { low: 4, medium: 10, high: 18, critical: 35 }[fl.severity];
  const integrityScore = Math.max(0, Math.min(100, score));
  const worst = maxSeverity(...flags.map((x) => x.severity), 'low');

  flags.sort((a, b) => SEV_RANK[b.severity] - SEV_RANK[a.severity]);
  return { assets, flags, integrityScore, worst };
}
