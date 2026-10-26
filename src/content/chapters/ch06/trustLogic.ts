/**
 * Pure educational logic for the Trust Architecture chapter.
 * Maps four structural toggles to consequence flags. Every flag is framed as
 * "depends on jurisdiction and facts" — this is a teaching aid, not a determination.
 */

export type Revocability = 'revocable' | 'irrevocable';
export type GrantorStatus = 'grantor' | 'non-grantor';
export type Situs = 'domestic' | 'foreign';
export type DistributionStandard = 'discretionary' | 'fixed';

export interface TrustParams {
  revocability: Revocability;
  grantorStatus: GrantorStatus;
  situs: Situs;
  distribution: DistributionStandard;
}

export type FlagTone = 'green' | 'amber' | 'red' | 'blue' | 'violet';

export interface TrustFlag {
  category: 'income-tax' | 'estate-inclusion' | 'creditor-reach' | 'reporting' | 'control';
  title: string;
  detail: string;
  tone: FlagTone;
}

export const DEFAULT_TRUST_PARAMS: TrustParams = {
  revocability: 'irrevocable',
  grantorStatus: 'grantor',
  situs: 'domestic',
  distribution: 'discretionary',
};

/** A revocable trust is always a grantor trust for U.S. income tax purposes (IRC §676). */
export function effectiveGrantorStatus(p: TrustParams): GrantorStatus {
  return p.revocability === 'revocable' ? 'grantor' : p.grantorStatus;
}

export function trustFlags(p: TrustParams): TrustFlag[] {
  const flags: TrustFlag[] = [];
  const grantor = effectiveGrantorStatus(p);

  // Who is taxed on income
  if (grantor === 'grantor') {
    flags.push({
      category: 'income-tax',
      title: 'Income taxed to the settlor',
      detail: p.revocability === 'revocable'
        ? 'A revocable trust is a grantor trust by definition (IRC §676): the power to revoke means the settlor reports every item of income, deduction and credit as if the trust did not exist. Nothing is saved on income tax; the trust is a title-holding and incapacity device.'
        : 'Under IRC §§671–677 the settlor, not the trust, reports the income. In an irrevocable trust this is often deliberate: the settlor paying the trust\'s tax is an additional transfer to the beneficiaries that the IRS has said is not a gift (Rev. Rul. 2004-64), provided the trust is not required to reimburse the settlor.',
      tone: 'green',
    });
  } else {
    flags.push({
      category: 'income-tax',
      title: 'Trust is a separate taxpayer',
      detail: 'A non-grantor trust files Form 1041 and pays tax on income it retains, reaching the top federal bracket at a very low threshold (the compressed trust brackets). Income distributed to beneficiaries carries out as distributable net income (DNI) and is taxed to them via Schedule K-1. State income tax depends on where the trust, trustee and beneficiaries are resident.',
      tone: 'amber',
    });
  }

  // Estate inclusion
  if (p.revocability === 'revocable') {
    flags.push({
      category: 'estate-inclusion',
      title: 'Fully included in the settlor\'s gross estate',
      detail: 'The retained power to revoke, alter or amend brings the whole trust back under IRC §2038 (and the retained enjoyment under §2036). A revocable trust avoids probate; it does not remove anything from the taxable estate.',
      tone: 'red',
    });
  } else if (grantor === 'grantor') {
    flags.push({
      category: 'estate-inclusion',
      title: 'Excludable if the retained powers are the right ones',
      detail: 'Grantor-trust status for income tax (§§671–677) and estate inclusion (§§2036–2038) are tested separately. A swap power under §675(4)(C) or the power to lend without adequate security can make the trust a grantor trust without pulling assets back into the estate. A retained income interest, a reversion worth more than 5%, or a retained right to control enjoyment generally will.',
      tone: 'amber',
    });
  } else {
    flags.push({
      category: 'estate-inclusion',
      title: 'Generally outside the settlor\'s estate',
      detail: 'With no retained interest or control, a completed gift to an irrevocable non-grantor trust is ordinarily excluded. Watch for the settlor serving as trustee with non-ascertainable distribution powers, implied agreements about retained enjoyment (§2036), or the settlor as a discretionary beneficiary in a self-settled trust.',
      tone: 'green',
    });
  }

  // Creditor reach
  if (p.revocability === 'revocable') {
    flags.push({
      category: 'creditor-reach',
      title: 'Settlor\'s creditors can reach everything',
      detail: 'Under Uniform Trust Code §505(a)(1) and the law of essentially every state, property in a revocable trust is subject to the claims of the settlor\'s creditors during life and at death. There is no asset-protection benefit while the settlor can revoke.',
      tone: 'red',
    });
  } else if (p.distribution === 'fixed') {
    flags.push({
      category: 'creditor-reach',
      title: 'Beneficiary\'s fixed interest is reachable',
      detail: 'A mandatory income or principal right is a property interest. A spendthrift clause slows a creditor down, but once a distribution is due or made it can be attached, and UTC §503 lets certain creditors (child support, some government claims) reach even protected interests. Irrevocability protects against the settlor\'s creditors; a fixed interest weakens protection against the beneficiary\'s.',
      tone: 'amber',
    });
  } else {
    flags.push({
      category: 'creditor-reach',
      title: 'Discretionary interest with spendthrift clause',
      detail: 'A beneficiary who cannot compel a distribution holds nothing a creditor can seize before it is paid (UTC §504). Exceptions survive for support claimants, and trustees who distribute on a pattern can be treated as having a de facto fixed obligation. If the settlor is also a beneficiary, most states let the settlor\'s creditors reach the maximum amount distributable to the settlor; only self-settled-trust statutes change that, and only on their own terms.',
      tone: 'green',
    });
  }

  // Reporting
  if (p.situs === 'foreign') {
    flags.push({
      category: 'reporting',
      title: 'Foreign trust: Forms 3520 and 3520-A',
      detail: 'A trust that fails either the court test or the control test of IRC §7701(a)(30)(E) is foreign. A U.S. settlor or U.S. beneficiary reports transfers, distributions and ownership on Form 3520; the trust (or the U.S. owner by default) files 3520-A. Under §679 a U.S. settlor is treated as owner while there is any U.S. beneficiary. Accumulated income distributed later to U.S. beneficiaries can attract the throwback rules and an interest charge (§§665–668). Penalties for non-filing are a percentage of the amounts involved, not a flat fee.',
      tone: 'red',
    });
  } else {
    flags.push({
      category: 'reporting',
      title: 'Domestic trust: standard filings',
      detail: grantor === 'grantor'
        ? 'A domestic grantor trust usually reports on the settlor\'s own return under the optional methods of Treas. Reg. §1.671-4, or files an informational Form 1041 with a grantor letter. Funding may require a gift tax return (Form 709) with adequate disclosure and a qualified appraisal for hard-to-value assets.'
        : 'A domestic non-grantor trust files Form 1041 annually and issues Schedule K-1 to beneficiaries who received distributions. Funding may require Form 709 and GST exemption allocation. Beneficial-ownership reporting regimes may ask who controls the trust when it owns an entity.',
      tone: 'blue',
    });
  }

  // Control
  if (p.revocability === 'revocable') {
    flags.push({
      category: 'control',
      title: 'Settlor keeps full control',
      detail: 'The settlor is typically also trustee and sole beneficiary during life. The structure solves probate, incapacity and privacy of the estate plan, nothing more. Successor-trustee provisions are the part that does the work.',
      tone: 'blue',
    });
  } else {
    flags.push({
      category: 'control',
      title: 'Control must sit with someone else',
      detail: p.distribution === 'discretionary'
        ? 'Real discretion in an independent trustee is what gives the trust its tax and protection character. A protector who can remove and replace the trustee, change situs or veto amendments is how families keep oversight without retaining the powers that cause inclusion. Directed-trust statutes let an investment adviser direct the trustee on the family business while a distribution committee handles beneficiaries.'
        : 'With fixed entitlements the trustee\'s discretion is narrow by design. That gives beneficiaries certainty and makes the trust simpler to administer, at the cost of flexibility across generations and weaker creditor protection for the beneficiary.',
      tone: 'violet',
    });
  }

  return flags;
}

export const CATEGORY_LABELS: Record<TrustFlag['category'], string> = {
  'income-tax': 'Who is taxed on income',
  'estate-inclusion': 'Estate inclusion risk',
  'creditor-reach': 'Creditor reach',
  reporting: 'Reporting forms',
  control: 'Control & oversight',
};
