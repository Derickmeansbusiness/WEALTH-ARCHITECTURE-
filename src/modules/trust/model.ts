/**
 * Trust Explorer model — pure derivation of consequences from four architectural toggles.
 * US-centric framing with explicit "depends on jurisdiction and facts" caveats. Tested in model.test.ts.
 */
import type { Confidence } from '@/types/content';

export interface TrustConfig {
  revocable: boolean;
  grantor: boolean;
  foreign: boolean;
  discretionary: boolean;
}

/** A revocable trust is a grantor trust by operation of IRC §676: the grantor toggle is forced on. */
export function normalize(c: TrustConfig): TrustConfig {
  return c.revocable ? { ...c, grantor: true } : c;
}

export interface Flag { text: string; level: Confidence }

export interface Consequences {
  key: string;
  label: string;
  incomeTax: { who: string; detail: string; short: string };
  estateInclusion: Flag[];
  estateShort: string;
  creditorSettlor: Flag;
  creditorBeneficiaries: Flag;
  reporting: string[];
  flexibility: { level: 'high' | 'medium' | 'low'; detail: string };
  uses: string[];
  costs: string;
  professionals: string[];
  /** true when the combination is not available in practice */
  unavailable?: string;
}

export const configKey = (c: TrustConfig) => `${c.revocable ? 'rev' : 'irrev'}-${c.grantor ? 'grantor' : 'nongrantor'}-${c.foreign ? 'foreign' : 'domestic'}-${c.discretionary ? 'disc' : 'fixed'}`;
export const configLabel = (c: TrustConfig) => `${c.revocable ? 'Revocable' : 'Irrevocable'} · ${c.grantor ? 'Grantor' : 'Non-grantor'} · ${c.foreign ? 'Foreign' : 'Domestic'} · ${c.discretionary ? 'Discretionary' : 'Fixed'}`;

export function deriveConsequences(raw: TrustConfig): Consequences {
  const unavailable = raw.revocable && !raw.grantor ? 'A revocable trust is treated as a grantor trust under IRC §676 (power to revoke). "Revocable + non-grantor" does not exist in practice; the explorer forces the grantor toggle on.' : undefined;
  const c = normalize(raw);
  const { revocable, grantor, foreign, discretionary } = c;

  // Income tax
  let incomeTax: Consequences['incomeTax'];
  if (revocable) {
    incomeTax = { who: 'Settlor', short: 'Settlor (§676)', detail: 'The power to revoke makes the settlor the owner for income tax (IRC §676). Income is reported on the settlor\'s own return; the trust may use the settlor\'s taxpayer identification number under the optional reporting methods in Treas. Reg. §1.671-4.' };
  } else if (grantor && foreign) {
    incomeTax = { who: 'Settlor', short: 'Settlor (§§671–677; §679)', detail: 'A US settlor who transfers property to a foreign trust that has or may have US beneficiaries is treated as owner under IRC §679 regardless of the retained powers. All trust income is taxed to the settlor currently, and the trust files Form 3520-A with the settlor filing Form 3520.' };
  } else if (grantor) {
    incomeTax = { who: 'Settlor', short: 'Settlor (§§671–677)', detail: 'A retained power or interest listed in IRC §§673–677 (for example a non-fiduciary power to substitute assets of equivalent value, or a spouse as permissible beneficiary) makes the settlor the owner for income tax while the transfer can still be complete for gift and estate tax. The settlor paying the trust\'s income tax is not an additional gift (Rev. Rul. 2004-64), which is why planners use it to shift value.' };
  } else if (foreign) {
    incomeTax = { who: 'Trust, then US beneficiaries on distribution', short: 'Trust / beneficiaries (throwback)', detail: 'A foreign non-grantor trust is generally taxed only on US-source and effectively connected income. US beneficiaries are taxed on distributions of current income (DNI) and, for accumulated income distributed later, under the throwback rules of IRC §§665–668 with an interest charge. Each US beneficiary receiving a distribution reports it on Form 3520.' };
  } else {
    incomeTax = { who: 'Trust (Form 1041), beneficiaries on distributed income', short: 'Trust (1041), compressed brackets', detail: 'The trust is a separate taxpayer filing Form 1041. Trust income-tax brackets are compressed: the top federal rate applies at a few thousand dollars of retained income, plus the 3.8% net investment income tax. Income distributed to beneficiaries carries out to them on Schedule K-1 via the distribution deduction (DNI). State fiduciary income tax depends on the residence of the settlor, trustee and beneficiaries and on the trust\'s situs.' };
  }

  // Estate inclusion
  const estateInclusion: Flag[] = [];
  if (revocable) {
    estateInclusion.push({ text: 'Fully included in the settlor\'s gross estate (IRC §2038 power to revoke; §2036 retained enjoyment). The transfer is an incomplete gift, so no gift tax return is required and assets receive a basis adjustment at death under §1014.', level: 'green' });
  } else {
    estateInclusion.push({ text: 'Excluded from the settlor\'s estate only if the settlor retains no interest or power described in IRC §§2036–2038: no right to income, no power to alter, amend, revoke or terminate, no power to control beneficial enjoyment (including as trustee with non-ascertainable discretion).', level: 'amber' });
    if (grantor) estateInclusion.push({ text: 'Grantor-trust status by itself does not cause estate inclusion: a power to substitute assets held in a non-fiduciary capacity is respected (Rev. Rul. 2008-22). The powers must be chosen with both regimes in mind.', level: 'green' });
    if (discretionary) estateInclusion.push({ text: 'If the settlor is a permissible discretionary beneficiary (self-settled), §2036 inclusion is argued where creditors can reach the assets under governing law; DAPT statutes are designed to answer this but the question is unsettled outside the enacting state.', level: 'amber' });
    estateInclusion.push({ text: 'Life insurance held by the trust: the insured must hold no incidents of ownership (§2042), and policies transferred within three years of death are pulled back (§2035).', level: 'green' });
    if (foreign) estateInclusion.push({ text: 'Foreign situs does not change the US estate-tax analysis for a US-domiciled settlor: worldwide assets and the same retained-power tests apply.', level: 'green' });
  }
  const estateShort = revocable ? 'Included (§§2036/2038)' : discretionary ? 'Excluded if no retained powers; self-settled risk' : 'Excluded if no retained powers';

  // Creditors
  let creditorSettlor: Flag;
  if (revocable) creditorSettlor = { text: 'Reachable. During the settlor\'s life the assets of a revocable trust are subject to the settlor\'s creditors (UTC §505(a)(1) and equivalent state law). A revocable trust is a probate-avoidance and incapacity tool, not an asset-protection tool.', level: 'green' };
  else if (foreign) creditorSettlor = { text: 'If the settlor is not a beneficiary: generally beyond reach once the transfer is complete and not fraudulent. If self-settled: foreign asset-protection jurisdictions impose short limitation periods and high burdens on creditors, but US courts have ordered settlors to repatriate assets and held them in contempt when they claimed impossibility. Bankruptcy Code §548(e) permits a ten-year clawback of self-settled transfers made to hinder creditors.', level: 'amber' };
  else if (discretionary) creditorSettlor = { text: 'If the settlor is not a beneficiary: generally beyond reach after a completed, non-fraudulent transfer. If the settlor is a discretionary beneficiary: the traditional rule lets creditors reach the maximum the trustee could distribute to the settlor (UTC §505(a)(2)); roughly twenty states have domestic asset protection trust (DAPT) statutes that reverse this under conditions, with uncertain enforcement against out-of-state creditors and in bankruptcy.', level: 'amber' };
  else creditorSettlor = { text: 'If the settlor retains no interest: generally beyond reach after a completed, non-fraudulent transfer. A fixed interest retained by the settlor (for example a mandatory income stream) is reachable by the settlor\'s creditors.', level: 'amber' };

  let creditorBeneficiaries: Flag;
  if (discretionary) creditorBeneficiaries = { text: 'Strongest position. A beneficiary\'s creditor cannot compel a discretionary distribution (UTC §504) and a spendthrift clause bars assignment of the interest (UTC §502). Exceptions survive in most states for child support, alimony and certain governmental claims (UTC §503).', level: 'green' };
  else creditorBeneficiaries = { text: 'Weaker. A spendthrift clause still protects the interest, but once a mandatory distribution is due and unpaid the creditor can reach it (UTC §506), and a fixed percentage interest is easier to value and attach.', level: 'amber' };

  // Reporting
  const reporting: string[] = [];
  if (revocable) reporting.push('No separate return required while the settlor lives (optional Form 1041 or reporting under the settlor\'s TIN, Treas. Reg. §1.671-4).', 'No Form 709: the transfer is an incomplete gift.');
  else {
    reporting.push('Form 709 (gift tax return) for transfers to the trust, with GST exemption allocation where descendants are beneficiaries.');
    if (grantor) reporting.push('Form 1041 informational filing or reporting under the settlor\'s TIN (Treas. Reg. §1.671-4); income on the settlor\'s Form 1040.');
    else reporting.push('Form 1041 with Schedules K-1 to beneficiaries; state fiduciary returns where the trust is resident.');
    if (discretionary) reporting.push('Trustee minutes documenting the exercise of discretion; Crummey withdrawal notices where annual-exclusion gifts are intended.');
  }
  if (foreign) reporting.push('Form 3520 (US settlor: transfers; US beneficiaries: distributions) and Form 3520-A (foreign grantor trust annual return). Penalties start at 35% of unreported transfers/distributions and 5% of the trust\'s value for a missing 3520-A.', 'FBAR (FinCEN Form 114) where a US person has a financial interest in or signature authority over foreign accounts above the threshold; Form 8938 (FATCA) where applicable.', 'Local-law filings in the trust\'s jurisdiction (registration, beneficial-ownership registers, licensed-trustee reporting).');
  reporting.push('Beneficial-ownership reporting may apply to entities the trust owns (regime and scope vary by jurisdiction and change frequently).');

  // Flexibility
  const flexibility: Consequences['flexibility'] = revocable
    ? { level: 'high', detail: 'The settlor can amend or revoke at will. Nothing is locked in, which is also why nothing is protected.' }
    : discretionary
      ? { level: 'medium', detail: 'Terms are fixed, but trustee discretion, a trust protector, decanting statutes, powers of appointment and non-judicial settlement agreements give room to adapt without breaking the irrevocability that makes the trust work.' }
      : { level: 'low', detail: 'Fixed distribution terms give certainty to beneficiaries and lenders and are harder to adapt. Modification typically requires court approval or a decanting statute.' };

  // Uses
  const uses: string[] = [];
  if (revocable) uses.push('Probate avoidance and incapacity management', 'Privacy of the dispositive plan (the trust, unlike a will, is not filed publicly)', 'A container for the estate plan that becomes irrevocable at death');
  else {
    if (grantor && discretionary && !foreign) uses.push('Spousal lifetime access trust (SLAT)', 'Irrevocable life insurance trust (ILIT)', 'Grantor dynasty trust funded with exemption; settlor pays income tax to shift further value', 'Sale of appreciating assets to the trust for a note');
    if (!grantor && discretionary && !foreign) uses.push('Non-grantor dynasty trust once the settlor no longer wishes to pay the tax', 'Trusts for descendants after the settlor\'s death', 'Trusts resident in a no-income-tax state for state tax planning (subject to residence rules)');
    if (foreign && discretionary) uses.push('Asset protection for settlors with cross-border exposure', 'Non-US families with US beneficiaries (careful design for §679 and throwback)', 'Holding non-US assets under a non-US trustee');
    if (!discretionary) uses.push('Charitable remainder or lead trusts (fixed annuity or unitrust payments)', 'Trusts providing a mandatory income stream to a surviving spouse (QTIP-style)', 'Fixed-share trusts for minors or persons who need predictable support');
    if (foreign && !discretionary) uses.push('Fixed-interest trusts under foreign law are uncommon for US settlors; most foreign structures are discretionary.');
  }

  // Costs
  const costs = revocable
    ? 'Set-up typically in the low thousands of dollars; minimal annual cost beyond keeping asset titles aligned.'
    : foreign
      ? 'Set-up commonly in the tens of thousands of dollars; annual licensed-trustee, protector and compliance fees of several thousand to tens of thousands, plus US reporting that carries severe penalties for error.'
      : 'Set-up typically five to twenty-five thousand dollars depending on complexity; annual trustee fees (corporate trustee often a percentage of assets or a minimum), fiduciary returns and periodic reviews.';

  const professionals = ['Trust and estate counsel (drafting; situs selection)', 'Tax adviser (income, gift, estate and GST; reporting)', revocable ? 'Successor trustee (often a family member)' : 'Trustee — frequently a corporate or professional trustee for irrevocable trusts', ...(discretionary && !revocable ? ['Trust protector or distribution adviser'] : []), ...(foreign ? ['Licensed foreign trustee and local counsel', 'US international-tax compliance specialist (Forms 3520/3520-A, FBAR)'] : []), ...(!revocable ? ['Insurance adviser where the trust holds policies'] : [])];

  return { key: configKey(raw), label: configLabel(raw), incomeTax, estateInclusion, estateShort, creditorSettlor, creditorBeneficiaries, reporting, flexibility, uses, costs, professionals, unavailable };
}

export const ALL_COMBINATIONS: TrustConfig[] = (() => {
  const out: TrustConfig[] = [];
  for (const revocable of [true, false]) for (const grantor of [true, false]) for (const foreign of [false, true]) for (const discretionary of [true, false]) out.push({ revocable, grantor, foreign, discretionary });
  return out;
})();

export interface Preset {
  id: string; name: string; config: TrustConfig; description: string; assets: string[]; beneficiaries: string[]; protector: boolean; variant?: { label: string; config: TrustConfig };
}

export const PRESETS: Preset[] = [
  { id: 'rlt', name: 'Revocable Living Trust', config: { revocable: true, grantor: true, foreign: false, discretionary: false }, protector: false, assets: ['Residence', 'Brokerage account', 'Bank accounts', 'LLC interests'], beneficiaries: ['Settlor (lifetime)', 'Spouse', 'Children (at death)'], description: 'The settlor is usually also trustee and beneficiary during life. It avoids probate, handles incapacity and keeps the dispositive plan private. It protects nothing from the settlor\'s creditors and saves no estate tax.' },
  { id: 'ilit', name: 'Irrevocable Life Insurance Trust', config: { revocable: false, grantor: true, foreign: false, discretionary: true }, protector: false, assets: ['Life insurance policy', 'Cash for premiums'], beneficiaries: ['Spouse', 'Children', 'Grandchildren'], description: 'Owns the policy so the death benefit is outside the insured\'s estate. Funded by annual gifts with Crummey withdrawal notices. Usually a grantor trust during the insured\'s life.' },
  { id: 'dynasty', name: 'Dynasty Trust', config: { revocable: false, grantor: false, foreign: false, discretionary: true }, protector: true, assets: ['Holding company interests', 'Marketable securities', 'Family bank note receivables'], beneficiaries: ['Children', 'Grandchildren', 'Future descendants'], description: 'A long-horizon trust, often in a state that has abolished or extended the rule against perpetuities, funded with gift and GST exemption. Shown here as non-grantor; the grantor variant has the settlor pay the trust\'s income tax while alive.', variant: { label: 'Grantor variant', config: { revocable: false, grantor: true, foreign: false, discretionary: true } } },
  { id: 'slat', name: 'Spousal Lifetime Access Trust', config: { revocable: false, grantor: true, foreign: false, discretionary: true }, protector: false, assets: ['Cash', 'Business interests', 'Investment portfolio'], beneficiaries: ['Spouse', 'Descendants'], description: 'One spouse gifts to an irrevocable trust for the other spouse and descendants, using exemption while keeping indirect access through the beneficiary spouse. Grantor status follows from the spouse being a beneficiary (§677). Divorce and the reciprocal-trust doctrine are the known hazards.' },
  { id: 'fapt', name: 'Foreign Asset Protection Trust', config: { revocable: false, grantor: true, foreign: true, discretionary: true }, protector: true, assets: ['Investment account at foreign custodian', 'LLC interests', 'Cash'], beneficiaries: ['Settlor (discretionary)', 'Spouse', 'Children'], description: 'Self-settled discretionary trust under the law of a jurisdiction with short limitation periods for creditor claims and a licensed trustee. Tax-neutral for a US settlor (§679 grantor trust) but heavy on reporting. Courts have tested settlors who claimed they could not repatriate assets.' },
  { id: 'crt', name: 'Charitable Remainder Trust', config: { revocable: false, grantor: false, foreign: false, discretionary: false }, protector: false, assets: ['Appreciated stock', 'Real estate'], beneficiaries: ['Settlor (annuity or unitrust income)', 'Charity (remainder)'], description: 'Pays a fixed annuity or unitrust amount to the settlor or others for life or a term, with the remainder to charity. The trust itself is tax-exempt under IRC §664 and the settlor takes a partial charitable deduction; it is a special statutory trust, so the generic matrix above is only a first approximation.' },
];
