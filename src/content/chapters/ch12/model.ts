/**
 * Foreign Structure Reporting Map — Chapter 12 (Offshore Asset Protection).
 * Given who the settlor and beneficiaries are, where the trust sits and what it holds,
 * list the U.S. reporting categories implicated. Educational: thresholds, exceptions and
 * penalty amounts are described generally and change; confirm with a tax adviser.
 */

export type Situs = 'cook' | 'nevis' | 'belize' | 'cayman' | 'jersey';

export interface StructureFacts {
  settlorUS: boolean;
  beneficiariesUS: boolean;
  situs: Situs;
  foreignAccounts: boolean;
  foreignCompany: boolean;
  /** Distributions are actually paid to U.S. beneficiaries in the year */
  distributionsToUS: boolean;
}

export interface SitusProfile {
  id: Situs;
  name: string;
  statute: string;
  /** Creditor-facing features, described generally */
  features: string[];
  /** 1 (least creditor-restrictive) .. 5 (most) — a qualitative ordering, not a ranking of "best" */
  barrierStrength: 1 | 2 | 3 | 4 | 5;
  /** Typical annual trustee fee band in USD (illustrative) */
  trusteeFee: [number, number];
}

export const SITUS: Record<Situs, SitusProfile> = {
  cook: {
    id: 'cook', name: 'Cook Islands', statute: 'International Trusts Act 1984 (as amended)',
    features: ['Foreign judgments not recognized; creditor must sue afresh in Rarotonga', 'Creditor must prove intent to defraud beyond reasonable doubt', 'Short limitation period measured from the transfer, and from when the cause of action accrued', 'Settlor may retain certain powers without invalidating the trust', 'No contingency-fee litigation'],
    barrierStrength: 5, trusteeFee: [6000, 20000],
  },
  nevis: {
    id: 'nevis', name: 'Nevis', statute: 'International Exempt Trust Ordinance 1994 (as amended)',
    features: ['Foreign judgments not recognized', 'Creditor must post a bond with the court before bringing a claim', 'Beyond-reasonable-doubt standard for fraudulent transfer', 'Short limitation period', 'Nevis LLC Ordinance adds charging-order-only remedy that expires'],
    barrierStrength: 5, trusteeFee: [5000, 15000],
  },
  belize: {
    id: 'belize', name: 'Belize', statute: 'Trusts Act (as amended)',
    features: ['Statute purports to bar enforcement of foreign judgments and creditor claims against validly settled trusts', 'Very short or no lookback for certain transfers', 'Smaller trust-company sector; due diligence on trustees matters', 'Less tested in reported litigation'],
    barrierStrength: 4, trusteeFee: [4000, 12000],
  },
  cayman: {
    id: 'cayman', name: 'Cayman Islands', statute: 'Trusts Act and Fraudulent Dispositions Act',
    features: ['Six-year limitation period for fraudulent dispositions', 'Creditor must show intent to defraud and that it was a creditor at the time', 'Deep institutional trust and fund infrastructure', 'Judgments from certain jurisdictions may be enforced at common law'],
    barrierStrength: 3, trusteeFee: [10000, 35000],
  },
  jersey: {
    id: 'jersey', name: 'Jersey', statute: 'Trusts (Jersey) Law 1984 (as amended)',
    features: ['Firewall provisions make Jersey law govern questions of trust validity', 'Fraudulent transfer claims proceed under customary law (Pauline action) without a short statutory bar', 'Foreign judgments can be recognized through registration or common law', 'Regulated, institutional, higher cost'],
    barrierStrength: 2, trusteeFee: [12000, 40000],
  },
};

export type Burden = 'light' | 'moderate' | 'heavy';

export interface ReportingItem {
  id: string;
  form: string;
  title: string;
  authority: string;
  who: string;
  why: string;
  penalty: string;
  burden: Burden;
}

export interface ReportingResult {
  taxCharacter: string;
  taxCharacterDetail: string;
  items: ReportingItem[];
  /** 1..5 */
  complexity: number;
  complexityLabel: string;
  /** Illustrative annual cost band (USD) */
  annualCost: [number, number];
  /** Illustrative set-up cost band (USD) */
  setupCost: [number, number];
  notes: string[];
}

export const DEFAULT_STRUCTURE: StructureFacts = {
  settlorUS: true, beneficiariesUS: true, situs: 'cook', foreignAccounts: true, foreignCompany: true, distributionsToUS: false,
};

export function mapReporting(f: StructureFacts): ReportingResult {
  const items: ReportingItem[] = [];
  const notes: string[] = [];
  const s = SITUS[f.situs];

  let taxCharacter = '';
  let taxCharacterDetail = '';

  if (f.settlorUS && f.beneficiariesUS) {
    taxCharacter = 'Foreign grantor trust (IRC §679)';
    taxCharacterDetail = 'A U.S. person who transfers property to a foreign trust that has, or may have, a U.S. beneficiary is treated as the owner of the trust. All income is taxed to the settlor on a worldwide basis each year. The structure is tax-neutral at best; it is about jurisdictional barriers, not tax.';
    items.push({
      id: '3520', form: 'Form 3520', title: 'Annual return to report transactions with foreign trusts',
      authority: 'IRC §6048(a)–(b); penalties §6677', who: 'The U.S. settlor (as transferor and as owner)',
      why: 'Reports the creation of and transfers to the foreign trust, and the settlor\'s treatment as owner each year.',
      penalty: 'Generally the greater of $10,000 or 35% of the gross value of property transferred (5% of trust assets for the annual owner report); further continuation penalties.', burden: 'heavy',
    });
    items.push({
      id: '3520a', form: 'Form 3520-A', title: 'Annual information return of a foreign trust with a U.S. owner',
      authority: 'IRC §6048(b); Treas. Reg. §404.6048-1', who: 'The foreign trustee; the U.S. owner must file a substitute if the trustee does not',
      why: 'Provides the trust\'s balance sheet, income statement and beneficiary statements so the owner can report the income.',
      penalty: 'Generally 5% of the gross value of the trust assets treated as owned by the U.S. person.', burden: 'heavy',
    });
  } else if (f.settlorUS && !f.beneficiariesUS) {
    taxCharacter = 'Foreign non-grantor trust (no U.S. beneficiaries)';
    taxCharacterDetail = 'Without a U.S. beneficiary §679 does not apply. The transfer is treated as a sale under IRC §684, so built-in gain on appreciated assets is recognized when funded. The trust is a foreign taxpayer on U.S.-source income only.';
    items.push({
      id: '684', form: 'Form 3520 + gain recognition', title: 'Transfer treated as a sale or exchange (§684)',
      authority: 'IRC §684; §6048(a)', who: 'The U.S. settlor',
      why: 'Transfers of appreciated property to a foreign non-grantor trust trigger recognition of gain; the transfer itself must still be reported on Form 3520.',
      penalty: 'Form 3520 penalties as above; tax on recognized gain in the year of transfer.', burden: 'heavy',
    });
    notes.push('If any beneficiary later becomes a U.S. person, §679 can apply from that point and the trust may become a grantor trust with the full Form 3520 / 3520-A regime.');
  } else if (!f.settlorUS && f.beneficiariesUS) {
    taxCharacter = 'Foreign non-grantor trust with U.S. beneficiaries';
    taxCharacterDetail = 'IRC §672(f) generally switches off grantor-trust treatment for a non-U.S. settlor (except revocable trusts and trusts whose only distributees are the settlor and spouse). U.S. beneficiaries are taxed on distributions, and accumulated income distributed later is hit by the throwback rules with an interest charge.';
    items.push({
      id: '3520c', form: 'Form 3520 (Part III)', title: 'U.S. beneficiary reporting of distributions from a foreign trust',
      authority: 'IRC §6048(c); §6677', who: 'Each U.S. beneficiary receiving a distribution',
      why: 'Every distribution (cash, property, use of trust property, below-market loans) must be reported. Without a Foreign Non-Grantor Trust Beneficiary Statement the whole distribution may be treated as an accumulation distribution.',
      penalty: 'Generally the greater of $10,000 or 35% of the gross distribution.', burden: 'moderate',
    });
    items.push({
      id: 'throwback', form: 'Form 4970 / throwback computation', title: 'Accumulation distributions and the interest charge',
      authority: 'IRC §§665–668', who: 'U.S. beneficiaries receiving accumulated income',
      why: 'Income accumulated offshore in earlier years and distributed later is taxed at the beneficiary\'s rates for the throwback years plus a compounding interest charge; capital gains lose their character.',
      penalty: 'Not a penalty as such, but the tax plus interest charge can approach the full distribution for long-accumulated amounts.', burden: 'heavy',
    });
    notes.push('Non-U.S. settlors often keep the trust revocable during life so it is a foreign grantor trust (distributions to U.S. beneficiaries are then non-taxable gifts, reported on Form 3520), then plan for the switch to non-grantor status at death.');
  } else {
    taxCharacter = 'Outside the U.S. tax reporting perimeter';
    taxCharacterDetail = 'With no U.S. settlor and no U.S. beneficiaries, U.S. information reporting generally is not implicated unless the trust holds U.S.-situs assets or U.S. persons hold signature authority. The settlor\'s home-country rules (and the Common Reporting Standard exchange between the situs and that country) govern instead.';
    notes.push('U.S.-source income (dividends, certain rents) remains subject to withholding at source; U.S. real property raises FIRPTA and estate-tax questions regardless of who the settlor is.');
    notes.push('Most offshore trust jurisdictions participate in the OECD Common Reporting Standard; the trustee will report controlling persons to the settlor\'s and beneficiaries\' home tax authorities.');
  }

  const anyUS = f.settlorUS || f.beneficiariesUS;

  if (anyUS && f.foreignAccounts) {
    items.push({
      id: 'fbar', form: 'FinCEN Form 114 (FBAR)', title: 'Report of Foreign Bank and Financial Accounts',
      authority: '31 U.S.C. §5314; 31 C.F.R. §1010.350', who: f.settlorUS ? 'The U.S. owner of a grantor trust is treated as having a financial interest in the trust\'s accounts; any U.S. person with signature authority' : 'A U.S. beneficiary with more than 50% of the beneficial interest, and any U.S. person with signature authority',
      why: 'Foreign financial accounts with an aggregate value above $10,000 at any time in the year must be reported, including accounts held through the trust or an underlying company it owns.',
      penalty: 'Non-willful: an inflation-adjusted amount per report (Bittner v. United States, 2023). Willful: the greater of an adjusted $100,000 or 50% of the account balance per violation, and criminal exposure under 31 U.S.C. §5322.', burden: 'moderate',
    });
    items.push({
      id: '8938', form: 'Form 8938', title: 'Statement of Specified Foreign Financial Assets (FATCA)',
      authority: 'IRC §6038D; Treas. Reg. §1.6038D-1 et seq.', who: 'Specified individuals (and certain domestic entities) above the filing thresholds',
      why: 'An interest in a foreign trust and foreign accounts are specified foreign financial assets. Thresholds depend on filing status and residence; assets already reported on Forms 3520 or 5471 are cross-referenced rather than duplicated.',
      penalty: '$10,000 with continuation penalties up to $50,000; 40% accuracy penalty on understatements attributable to undisclosed assets; extended limitations period.', burden: 'light',
    });
  }

  if (anyUS && f.foreignCompany) {
    items.push({
      id: '5471', form: 'Form 5471 (or Form 8858 after a check-the-box election)', title: 'Information return with respect to a foreign corporation',
      authority: 'IRC §§6038, 6046; Treas. Reg. §301.7701-3(b)(2) default classification', who: f.settlorUS ? 'The U.S. settlor, treated as owning what the grantor trust owns' : 'U.S. beneficiaries or trustees treated as owning stock under the attribution rules',
      why: 'A foreign LLC (for example a Nevis LLC) whose members all have limited liability defaults to corporate classification, so it is a controlled foreign corporation if U.S. persons own more than 50%. That brings Form 5471, Subpart F and GILTI. Electing disregarded treatment on Form 8832 trades this for Form 8858.',
      penalty: '$10,000 per form per year with continuation penalties; reduction of foreign tax credits; the statute of limitations stays open until filed.', burden: 'heavy',
    });
    if (f.settlorUS) {
      items.push({
        id: '926', form: 'Form 926', title: 'Return by a U.S. transferor of property to a foreign corporation',
        authority: 'IRC §6038B', who: 'The U.S. settlor on contributions of cash or property to the foreign company',
        why: 'Contributions of property (and cash above a threshold) to a foreign corporation are reportable; §367 can turn otherwise tax-free contributions into taxable ones.',
        penalty: '10% of the fair market value of the property transferred, capped at $100,000 unless intentional.', burden: 'moderate',
      });
    }
  }

  if (anyUS) {
    items.push({
      id: 'fatca-ffi', form: 'Trustee-side FATCA / IGA reporting', title: 'The trustee reports you, whether or not you report yourself',
      authority: 'IRC §§1471–1474; intergovernmental agreements; OECD CRS', who: 'The foreign trustee and the trust\'s banks',
      why: 'Trustee-documented trusts and their banks identify U.S. controlling persons and report account information to the IRS directly or through the situs government. Automatic exchange makes non-disclosure a detectable crime, not a privacy strategy.',
      penalty: 'None on the family directly; the consequence is that the IRS already has the information your own filings should match.', burden: 'light',
    });
  }

  if (f.distributionsToUS && f.settlorUS && f.beneficiariesUS) {
    notes.push('Distributions from a grantor trust to U.S. beneficiaries are gifts from the settlor for transfer-tax purposes; the beneficiary reports nothing on income, but the settlor\'s gift-tax position (and Form 709) should be checked.');
  }
  if (f.distributionsToUS && !f.settlorUS && f.beneficiariesUS) {
    notes.push('Ask the trustee for a Foreign Non-Grantor Trust Beneficiary Statement every year a distribution is made; without it the default rule treats the distribution harshly.');
  }

  // Complexity & cost
  const heavy = items.filter((i) => i.burden === 'heavy').length;
  const moderate = items.filter((i) => i.burden === 'moderate').length;
  const raw = heavy * 1.4 + moderate * 0.8 + items.length * 0.2;
  const complexity = anyUS ? Math.max(1, Math.min(5, Math.round(1 + raw))) : 1;
  const complexityLabel = ['', 'Minimal (U.S. perimeter not engaged)', 'Modest', 'Substantial', 'Heavy', 'Very heavy'][complexity];

  const trustee = s.trusteeFee;
  const complianceLo = anyUS ? 2500 + heavy * 2500 + moderate * 1000 : 0;
  const complianceHi = anyUS ? 6000 + heavy * 6000 + moderate * 2500 : 0;
  const companyLo = f.foreignCompany ? 1500 : 0, companyHi = f.foreignCompany ? 4000 : 0;
  const annualCost: [number, number] = [trustee[0] + complianceLo + companyLo, trustee[1] + complianceHi + companyHi];
  const setupCost: [number, number] = [15000 + (f.foreignCompany ? 3000 : 0), 60000 + (f.foreignCompany ? 8000 : 0)];

  return { taxCharacter, taxCharacterDetail, items, complexity, complexityLabel, annualCost, setupCost, notes };
}
