/**
 * Multi-jurisdictional education dataset for /debt-credit-studio/jurisdictions.
 * Every row is marked verified or not; unverified rows show an amber chip in the UI.
 */
import type { DebtJurisdiction } from './types';

export interface JurisdictionTopicRow {
  topic: string;
  cells: Record<DebtJurisdiction, { text: string; verified: boolean; cite?: string }>;
}

export const JURISDICTION_OVERVIEW: Record<DebtJurisdiction, { name: string; status: 'reviewed' | 'partial' | 'coming'; currency: string; summary: string; regulators: string[] }> = {
  US: { name: 'United States', status: 'reviewed', currency: 'USD', summary: 'Deep, segmented credit markets; federal consumer-protection statutes layered on state law; UCC Article 9 for personal-property security; federal income tax with detailed interest rules.', regulators: ['Federal Reserve', 'OCC', 'FDIC', 'CFPB', 'SEC / FINRA', 'SBA', 'IRS'] },
  UAE: { name: 'United Arab Emirates', status: 'partial', currency: 'AED (pegged to USD)', summary: 'Bank-dominated system with conventional and Islamic finance; federal credit bureau; recent modern laws for movable security, bankruptcy and corporate tax; emirate-level land registries.', regulators: ['Central Bank of the UAE', 'Al Etihad Credit Bureau', 'Ministry of Finance / Federal Tax Authority', 'Dubai Land Department and other emirate registries', 'DIFC / ADGM (free-zone regimes)'] },
  CEMAC: { name: 'Cameroon · CEMAC · OHADA', status: 'partial', currency: 'XAF (pegged to EUR)', summary: 'Regional central bank and banking supervisor; harmonized OHADA business law (companies, secured transactions, insolvency, recovery) across 17 member states; national tax codes; thinner, shorter-dated credit markets.', regulators: ['BEAC (Banque des États de l’Afrique Centrale)', 'COBAC (Commission Bancaire de l’Afrique Centrale)', 'OHADA (Uniform Acts, CCJA court)', 'Cameroon Ministry of Finance / DGI', 'RCCM (commerce and movable-credit registry)'] },
  UK: { name: 'United Kingdom', status: 'coming', currency: 'GBP', summary: 'Content for this jurisdiction is in preparation. Notes below are high-level pointers only and are not yet jurisdictionally verified.', regulators: ['Financial Conduct Authority', 'Prudential Regulation Authority', 'Companies House', 'HM Revenue & Customs'] },
};

export const JURISDICTION_ROWS: JurisdictionTopicRow[] = [
  {
    topic: 'Principal borrowing instruments',
    cells: {
      US: { text: '30-year fixed agency mortgages; HELOCs; SBA-guaranteed term loans; asset-based and cash-flow revolvers; CMBS, life-company and agency commercial mortgages; private credit; securities-backed lines; policy loans.', verified: true },
      UAE: { text: 'Conventional and Islamic (Murabaha, Ijara, Tawarruq) mortgages and SME facilities; overdrafts; trade finance; corporate sukuk and syndicated loans for larger groups. Long fixed-rate residential debt is uncommon; most mortgages reprice to EIBOR after an initial fixed period.', verified: false },
      CEMAC: { text: 'Overdrafts and short-term bank credit; trade finance (letters of credit); supplier credit; microfinance; leasing (crédit-bail) developing; mortgages (hypothèques) with short tenors; BEAC-market bonds for states and large corporates.', verified: false },
      UK: { text: 'Residential mortgages (short fixed periods), buy-to-let, overdrafts, invoice finance, asset finance, British Business Bank-backed lending; corporate bonds and syndicated loans.', verified: false },
    },
  },
  {
    topic: 'Credit-reporting system',
    cells: {
      US: { text: 'Three national consumer bureaus (Equifax, Experian, TransUnion) governed by the FCRA; business bureaus (D&B, Experian Business, Equifax Business); FICO / VantageScore models; SBSS for SBA.', verified: true, cite: '15 U.S.C. § 1681 et seq.' },
      UAE: { text: 'Al Etihad Credit Bureau (federal) collects data from banks, finance companies, telecoms and utilities; issues consumer and commercial reports and scores. Legal basis in the federal credit-information law.', verified: false, cite: 'Federal Law No. 6 of 2010 (as amended)' },
      CEMAC: { text: 'BEAC’s Centrale des Risques records bank exposures by borrower; Centrale des Incidents de Paiement records payment incidents; private credit bureaus are nascent. Coverage of individuals is limited.', verified: false },
      UK: { text: 'Experian, Equifax and TransUnion UK; statutory report access under data-protection law; Commercial Credit Data Sharing scheme for SMEs.', verified: false },
    },
  },
  {
    topic: 'Security over movables / collateral registry',
    cells: {
      US: { text: 'UCC Article 9: attachment by security agreement, perfection by filing a UCC-1 with the state (or possession/control), priority generally first-to-file-or-perfect; purchase-money super-priority; real estate liens recorded at county level.', verified: true, cite: 'UCC §§ 9-203, 9-310, 9-322, 9-324' },
      UAE: { text: 'Federal Law No. 4 of 2020 on Guaranteeing Rights Related to Movables: security over movables (including receivables, inventory, equipment) perfected by registration in the Emirates Movable Collateral Registry (EMCR); priority by registration. Real estate mortgages registered with the emirate land department.', verified: false, cite: 'Federal Law No. 4 of 2020' },
      CEMAC: { text: 'OHADA Uniform Act on Secured Transactions (AUS, 2010 revision): pledges (gage, nantissement) over tangible and intangible movables, registered at the RCCM for effectiveness against third parties; security agent concept introduced; mortgages registered at the land registry; enforcement via OHADA simplified recovery procedures.', verified: false, cite: 'Acte uniforme portant organisation des sûretés (15 Dec 2010)' },
      UK: { text: 'Fixed and floating charges registered at Companies House within 21 days (Companies Act 2006, Part 25); Land Registry for real estate; Bills of Sale Acts for individuals’ chattels.', verified: false },
    },
  },
  {
    topic: 'Mortgage / real-estate lending rules',
    cells: {
      US: { text: 'TILA/Regulation Z disclosures (APR, Loan Estimate, Closing Disclosure); Ability-to-Repay / QM; supervisory LTV guidelines for banks; due-on-sale clauses with Garn-St Germain exceptions; state foreclosure and anti-deficiency laws vary.', verified: true, cite: '12 C.F.R. Part 1026; 12 U.S.C. § 1701j-3' },
      UAE: { text: 'Central Bank mortgage regulations set maximum LTVs that differ for UAE nationals and expatriates and for first versus subsequent properties, with lower caps for off-plan; debt-burden ratio limits on consumer lending; early-settlement fee caps. Dubai mortgages governed by Dubai Law No. 14 of 2008.', verified: false },
      CEMAC: { text: 'Mortgages (hypothèques) require notarial deed and registration at the conservation foncière; land title (titre foncier) is a prerequisite and much property is untitled, limiting mortgage finance; COBAC prudential limits on real-estate exposure.', verified: false },
      UK: { text: 'FCA MCOB conduct rules; PRA loan-to-income flow limit; affordability stress tests; buy-to-let underwriting standards.', verified: false },
    },
  },
  {
    topic: 'Tax treatment of interest — individuals',
    cells: {
      US: { text: 'Personal interest generally non-deductible (§163(h)); qualified residence interest deductible within acquisition-indebtedness limits; investment interest limited to net investment income (§163(d)); rental-property interest deductible against rental income (Schedule E), subject to passive-activity rules; tracing rules allocate by use of proceeds.', verified: true, cite: '26 U.S.C. § 163(d), (h); Treas. Reg. § 1.163-8T' },
      UAE: { text: 'No personal income tax, so no deduction and no taxation of personal interest income. Individuals conducting a licensed business above the revenue threshold may be subject to Corporate Tax on business income.', verified: false },
      CEMAC: { text: 'Cameroon personal income tax (IRPP) applies by category; interest on loans for rental property may be deductible against property income under the General Tax Code — verify current provisions. Interest income is generally subject to withholding.', verified: false },
      UK: { text: 'No relief for personal interest; individual landlords receive only a basic-rate tax credit for finance costs (ITTOIA 2005 s.272A–272B); qualifying loan interest relief for certain business loans.', verified: false },
    },
  },
  {
    topic: 'Tax treatment of interest — businesses',
    cells: {
      US: { text: 'Business interest deductible under §163(a), limited by §163(j) to business interest income + 30% of adjusted taxable income + floor-plan interest for taxpayers above the inflation-indexed gross-receipts threshold; disallowed interest carries forward; real property trades or businesses may elect out (with ADS depreciation). Related-party rules: §7872 imputed interest, §267 timing, §385 debt-equity, transfer pricing (§482).', verified: true, cite: '26 U.S.C. §§ 163(j), 267, 385, 482, 7872' },
      UAE: { text: 'Corporate Tax (Federal Decree-Law No. 47 of 2022): 9% above the AED 375,000 threshold. General Interest Deduction Limitation Rule caps net interest expenditure at 30% of adjusted EBITDA (with a de minimis threshold below which the cap does not apply, and carry-forward of disallowed interest); a Specific Interest Deduction Limitation disallows interest on related-party loans used for certain transactions where the main purpose is a tax advantage; arm’s-length pricing required for related-party interest.', verified: false, cite: 'Federal Decree-Law No. 47 of 2022, Arts. 30–31' },
      CEMAC: { text: 'Cameroon General Tax Code: interest paid to shareholders/associates deductible only within limits — the rate capped by reference to the BEAC rate plus a margin, and the amount of shareholder loans capped by reference to share capital (thin capitalization); interest to non-residents subject to withholding tax (reduced by treaty where applicable).', verified: false, cite: 'Code Général des Impôts (Cameroun), provisions on deductible charges — verify article numbers' },
      UK: { text: 'Corporate interest generally deductible; Corporate Interest Restriction limits net interest to 30% of tax-EBITDA (or group ratio) above a £2m de minimis; transfer pricing and anti-hybrid rules; loans to participators (CTA 2010 s.455).', verified: false },
    },
  },
  {
    topic: 'Related-party / intra-family loans',
    cells: {
      US: { text: 'IRC §7872 imputes interest at the AFR on below-market loans ($10,000 de minimis and $100,000 net-investment-income limitation for gift loans, generally); §483/§1274 for deferred payments and OID; ASC 850 related-party disclosure; debt-vs-equity factors from case law; preference/fraudulent-transfer exposure for insider security.', verified: true, cite: '26 U.S.C. § 7872; FASB ASC 850' },
      UAE: { text: 'No gift tax; Corporate Tax applies arm’s-length principle and transfer-pricing documentation to related-party and connected-person transactions, including intercompany interest; disclosure form for related-party transactions above thresholds.', verified: false },
      CEMAC: { text: 'OHADA companies act governs director/shareholder dealings and related-party agreements (conventions réglementées) requiring approval; tax code limits deductibility of shareholder-loan interest; registration duties may apply to loan agreements.', verified: false },
      UK: { text: 'Close-company loans to participators (s.455 charge); transfer pricing for large groups; inheritance-tax and income-tax considerations for interest-free family loans are generally benign but documentation matters for IHT.', verified: false },
    },
  },
  {
    topic: 'Insolvency and enforcement',
    cells: {
      US: { text: 'Bankruptcy Code Chapters 7, 11 (incl. Subchapter V), 13; automatic stay; preferences (90 days / 1 year insiders) and fraudulent transfers; secured creditors retain liens; state UVTA/UFTA; non-judicial foreclosure in many states.', verified: true, cite: '11 U.S.C. §§ 362, 547, 548' },
      UAE: { text: 'Federal Decree-Law No. 51 of 2023 on Financial Restructuring and Bankruptcy (replacing No. 9 of 2016): preventive settlement, restructuring, bankruptcy; separate insolvency law for natural persons (No. 19 of 2019); decriminalization of most bounced-cheque cases; DIFC and ADGM have separate insolvency regimes.', verified: false },
      CEMAC: { text: 'OHADA Uniform Act on Collective Proceedings (AUPC, revised 2015): conciliation, règlement préventif, redressement judiciaire, liquidation des biens; suspect-period avoidance; OHADA simplified recovery and enforcement act for secured creditors; CCJA as supreme court for OHADA matters.', verified: false, cite: 'AUPC (10 Sept 2015); AUPSRVE' },
      UK: { text: 'Insolvency Act 1986 (administration, CVA, liquidation, IVA, bankruptcy); Part 26A restructuring plans (CIGA 2020); fixed-charge holders enforce by receivership or sale.', verified: false },
    },
  },
  {
    topic: 'Regulatory references for further reading',
    cells: {
      US: { text: 'CFPB (Regulation Z, FCRA, ECOA); OCC Comptroller’s Handbook; Federal Reserve SLOOS and Financial Stability Report; SBA SOP 50 10; SEC/FINRA investor bulletins; IRS publications and AFR rulings.', verified: true },
      UAE: { text: 'Central Bank of the UAE regulations and standards; AECB; Ministry of Finance Corporate Tax guides and FTA public clarifications; Dubai Land Department; EMCR (Emirates Integrated Registries Company).', verified: false },
      CEMAC: { text: 'BEAC and COBAC regulations and annual reports; OHADA Uniform Acts (official texts at ohada.org); Cameroon General Tax Code (annual Finance Law updates); RCCM.', verified: false },
      UK: { text: 'FCA Handbook (CONC, MCOB); PRA rules; Companies House guidance; HMRC Corporate Finance Manual.', verified: false },
    },
  },
];
