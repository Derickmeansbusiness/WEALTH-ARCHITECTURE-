import type { ChapterModule } from '@/types/content';
import { CHAPTERS } from '../manifest';
import Diagram from './Diagram';
import Simulator from './Simulator';

const meta = CHAPTERS.find((c) => c.id === 'ch12')!;

const mod: ChapterModule = {
  content: {
    id: meta.id,
    number: meta.number,
    slug: meta.slug,
    title: meta.title,
    subtitle: 'Jurisdictional barriers to collection, the reporting that follows you home, and the line between lawful privacy and a felony.',
    objectives: ['asset-protection', 'privacy', 'tax-planning'],
    duration: meta.duration,
    hook: 'The judgment stops at the water. The tax return does not.',
    concept: [
      '"Offshore" is one of the most misused words in wealth planning, so let us define it precisely. An offshore structure is a **trust or entity organized under a different legal system**, administered by a trustee or manager who is outside the reach of your home courts, holding assets that are themselves outside that reach. That is all. It is not a tax regime, and for a U.S. person it is not even a tax deferral. Its value lies entirely in **jurisdictional friction**: a domestic judgment is a piece of paper that a foreign court may decline to recognize, and the creditor who wants to collect has to go there, hire local counsel, start again, and do so under rules written to make that expensive.',
      'The **Cook Islands International Trusts Act 1984** is the template every other asset protection jurisdiction copied. A creditor attacking a Cook Islands trust cannot simply register a U.S. judgment; it must bring a fresh action in Rarotonga. It must do so within a short limitation period measured from the transfer and from when its cause of action accrued, often two years and one year respectively. It must prove **beyond reasonable doubt**, the criminal standard, that the settlor transferred the property with the principal intent to defraud *that* creditor and that the transfer left the settlor insolvent. Contingency fees are prohibited, so the creditor funds the fight out of pocket. **Nevis** adds a bond requirement before a creditor can even file, and its LLC Ordinance limits a member\'s creditor to a charging order that expires after a few years. These statutes are not about hiding; the trust and its trustee are perfectly visible. They are about making collection uneconomic.',
      'The standard architecture pairs a foreign trust with a **foreign LLC**, commonly a Nevis LLC owned by the trust and managed day to day by the settlor. While nothing is wrong, the settlor runs the LLC and its accounts normally. When a threat materializes, the trustee removes the settlor as manager and takes control, and a **duress clause** instructs the trustee to disregard any instruction the settlor gives under compulsion, including a court order. A **flight clause** lets the trustee move the trust to another jurisdiction if the current one becomes hostile. These clauses are the heart of the design, and they are also the heart of the problem, because a U.S. court does not need jurisdiction over the trustee if it has jurisdiction over you.',
      'That problem has a name: **civil contempt**. In *FTC v. Affordable Media* (9th Cir. 1999), the Andersons had moved telemarketing proceeds into a Cook Islands trust and argued it was impossible to comply with a repatriation order because the trustee would not listen to them. The court noted they were the trust\'s protectors and had resigned only after the order, found the impossibility self-created, and jailed them until the assets came back. In *In re Lawrence* (11th Cir. 2002), Stephan Lawrence spent roughly six years in federal custody for contempt over a Mauritius trust funded shortly before a $20 million arbitration award. The **impossibility defense** is real: in *United States v. Grant* (S.D. Fla. 2008) the court declined to hold a widow in contempt where she genuinely had no power over the trustee and had made good-faith efforts. But it works only when the settlor truly has no retained control, and most settlors are unwilling to give up that much control until it is too late to matter.',
      'Now the part most promoters leave out. For a **U.S. settlor with any U.S. beneficiary**, IRC **§679** treats the foreign trust as a grantor trust: every dollar of income, wherever earned, is taxed to the settlor every year. There is no deferral and no rate benefit. There is, instead, a reporting apparatus that is unforgiving: **Form 3520** to report the creation of and transfers to the trust and the settlor\'s ownership; **Form 3520-A** filed by the trustee (or a substitute by the owner) with the trust\'s financial statements; **FBAR (FinCEN Form 114)** for the trust\'s foreign accounts, which the grantor-trust owner is treated as owning; **Form 8938** under FATCA; and, if the trust owns a foreign company, **Form 5471** or **Form 8858** depending on how the entity is classified. Penalties start at $10,000 per form per year and scale with the value transferred or held; the statute of limitations on the whole return stays open until the forms are filed. This is permanent annual overhead and it is the single biggest reason offshore structures are abandoned.',
      'Costs follow from that. Set-up through experienced counsel and an institutional trustee commonly runs into the tens of thousands of dollars; annual trustee fees, compliance filings and a foreign bank relationship add a five-figure recurring cost. Below perhaps $5 million of assets you actually need to protect, the mathematics rarely justify it, and a well-insured domestic structure does the job. Above that, for people with genuine exposure (surgeons, developers, directors, public figures) and an appetite for complexity, the barrier value can be real. The honest framing is that offshore planning **buys negotiating position** against a judgment creditor; it does not buy immunity, and it never buys tax.',
      'Which leaves the line that matters most. **Lawful privacy** means the public cannot look up your balance sheet; the government can. You disclose beneficial ownership to banks under KYC, to the IRS through the forms above, to the trustee\'s regulators under FATCA and the Common Reporting Standard. **Concealment** means not filing those forms, and that is not a privacy strategy; it is tax evasion under 26 U.S.C. §7201 and willful FBAR violation under 31 U.S.C. §5322, both felonies. Automatic exchange of information means the trustee\'s bank has probably already reported your account to the IRS before your own return is due. The only structures that survive are the ones built on the assumption that everything is visible to the authorities and still make sense.',
    ],
    realWorldExample: {
      title: 'A developer\'s Cook Islands trust, seven years on',
      body: [
        'A real-estate developer with roughly $40 million of net worth and chronic litigation exposure from construction defect claims settled $8 million of marketable securities into a Cook Islands trust in a quiet year, long before any specific dispute. The trust owned a Nevis LLC that held the securities at a Singapore bank; he was the LLC manager. Set-up cost about $45,000 in legal and trustee fees. Annual running costs settled at roughly $12,000 of trustee fees, $9,000 of U.S. compliance (Forms 3520, 3520-A, FBAR, 8938 and a Form 8858 after a check-the-box election for the LLC) and bank charges, call it $23,000 a year, or about 29 basis points on the protected assets.',
        'Because the trust had a U.S. settlor and U.S. beneficiaries, §679 made it a grantor trust. The portfolio\'s roughly $400,000 of annual income was taxed on his personal return exactly as it would have been in a domestic brokerage account. Tax saved: zero.',
        'In year seven a $14 million defect judgment exceeded his $10 million of insurance by $4 million. Plaintiff\'s counsel assessed the trust: a Cook Islands action to a beyond-reasonable-doubt standard, outside the limitation period, against a transfer made while he was clearly solvent and years before the project in question. They did not file. The excess settled at $1.6 million, paid from assets outside the trust. Seven years of costs, about $160,000, bought a $2.4 million reduction in what he would otherwise have paid and, more importantly, the certainty that a judgment could not have taken the core of his liquid wealth. He would tell you the structure paid for itself once, and that most of the value was in never having to test it.',
      ],
    },
    misconception: {
      claim: 'Moving money offshore shields it from U.S. tax and keeps it private from the government.',
      reality: 'For a U.S. settlor with U.S. beneficiaries a foreign trust is a grantor trust under §679: all income is taxed to the settlor annually, and the structure triggers Forms 3520, 3520-A, FBAR, 8938 and often 5471/8858, with penalties that scale with the assets. Banks and trustees report U.S. persons under FATCA and CRS. Offshore buys jurisdictional barriers against creditors, not tax savings and not secrecy from the tax authority.',
      confidence: 'red',
    },
    professionalExplanation: [
      'A competent offshore engagement begins with a question that eliminates most prospects: **what is the threat, and would a domestic structure plus insurance handle it?** Where the honest answer is yes, the adviser should say so. Where the exposure is large, uninsurable or reputational, the next question is solvency: a formal solvency analysis at funding, with the settlor retaining comfortably enough outside the trust to meet foreseeable obligations, is the fact that defeats the fraudulent-transfer argument in every jurisdiction, including the home one. Counsel then designs the retained powers with the contempt cases in front of them. The less the settlor controls, the better the impossibility defense and the worse the settlor sleeps; that tension is the design conversation, and anyone who tells you it can be avoided has not read *Anderson*.',
      'The **tax work** is as large as the legal work. Classification of the trust under §§671–679 and §672(f); the §684 gain-recognition trap if there are no U.S. beneficiaries; the default corporate classification of a foreign LLC under Treas. Reg. §301.7701-3 and whether to file Form 8832 to avoid controlled-foreign-corporation status; §367 and Form 926 on contributions of property to a foreign corporation; the throwback regime of §§665–668 if U.S. beneficiaries will ever receive accumulated income from a non-grantor trust; and the interaction with the settlor\'s estate (a self-settled trust with retained benefit is generally included under §2036). Every one of these has a form attached, and the forms have the penalty structure described above. The tax adviser must be engaged before funding, not at the first filing deadline.',
      'Choosing a **trustee and situs** is due diligence, not shopping. The trustee will control your assets under duress; its licensing, capitalization, insurance, litigation history and willingness to actually resist a foreign court order matter more than the statute. Banking access is a practical constraint: many banks will not open accounts for trusts from certain jurisdictions, and U.S. persons face FATCA-driven refusals everywhere. Political stability and the rule of law in the situs matter because the flight clause is only as good as the destination. None of this appears in the marketing.',
      'Professionals are required at every step: a U.S. attorney specializing in asset protection and foreign trusts, a tax adviser with foreign-trust compliance experience (not a general practitioner), licensed foreign counsel in the situs, and an institutional trustee. The cost of that team is the entry price. The families that get into trouble offshore are almost never the ones who paid for all four; they are the ones who bought a package from a promoter, skipped the tax filings, and discovered the penalties when a bank\'s FATCA report reached the IRS first.',
    ],
    knowledgeCheck: [
      {
        id: 'ch12-q1',
        prompt: 'What is the primary mechanism by which a Cook Islands or Nevis trust protects assets?',
        options: ['It exempts trust income from U.S. tax', 'It makes the settlor\'s identity secret from all governments', 'It forces a creditor to re-litigate locally, within a short limitation period, to a beyond-reasonable-doubt standard, without recognizing the home judgment', 'It converts assets into untraceable form'],
        answer: 2,
        explanation: 'Offshore protection is jurisdictional friction. The statute refuses recognition of foreign judgments and sets procedural and evidentiary hurdles that make collection uneconomic. It does nothing to tax, and the structure is fully visible to tax authorities.',
      },
      {
        id: 'ch12-q2',
        prompt: 'A U.S. settlor funds a foreign trust whose beneficiaries are her U.S. children. For income tax purposes the trust is:',
        options: ['A foreign non-grantor trust taxed only on U.S.-source income', 'A grantor trust under IRC §679, with all income taxed to the settlor each year', 'Exempt until distributions are made', 'A domestic trust because the beneficiaries are U.S. persons'],
        answer: 1,
        explanation: '§679 treats a U.S. transferor to a foreign trust with a U.S. beneficiary as owner of the trust. The result is worldwide income taxation to the settlor and the full Form 3520 / 3520-A reporting regime.',
      },
      {
        id: 'ch12-q3',
        prompt: 'In FTC v. Affordable Media (the Anderson case), why did the impossibility defense fail?',
        options: ['Because Cook Islands law does not exist in U.S. courts', 'Because the Andersons were the trust\'s protectors and the court found the impossibility self-created', 'Because the trust was domestic', 'Because the trustee voluntarily returned the assets'],
        answer: 1,
        explanation: 'The Andersons retained control as protectors and resigned only after the repatriation order. Courts reject an impossibility defense where the defendant created the impossibility; retained control is the fatal fact.',
      },
      {
        id: 'ch12-q4',
        prompt: 'Which set of forms is most likely required annually for a U.S. owner of a foreign grantor trust holding foreign bank accounts?',
        options: ['Form 1040 only', 'Forms 3520 and 3520-A, FinCEN Form 114 (FBAR) and Form 8938', 'Form 709 only', 'Form 5500'],
        answer: 1,
        explanation: 'The owner reports the trust on Form 3520, the trust (or owner as substitute) files Form 3520-A, the owner is treated as having a financial interest in the trust\'s foreign accounts for FBAR, and the trust interest and accounts are specified foreign financial assets for Form 8938.',
      },
      {
        id: 'ch12-q5',
        prompt: 'Which statement best distinguishes lawful privacy from unlawful concealment in offshore planning?',
        options: ['Privacy means no one, including the IRS, knows about the structure', 'Privacy means the public cannot see your balance sheet while banks, trustees and tax authorities receive full disclosure; concealment means withholding required reporting, which is a crime', 'Privacy is only available to non-U.S. persons', 'There is no legal difference'],
        answer: 1,
        explanation: 'Lawful privacy operates within disclosure regimes: KYC, FATCA/CRS, Forms 3520/FBAR/8938. Failing to file those is tax evasion (26 U.S.C. §7201) and willful FBAR violation (31 U.S.C. §5322), both felonies.',
      },
    ],
    caseStudy: {
      title: 'The Reyes-Lindqvist Family: the structure was fine, the filings were not',
      family: 'Dr. Marisol Reyes (52), a spine surgeon, and Erik Lindqvist (54), a Swedish national and U.S. green-card holder; two children in U.S. universities.',
      situation: 'After a colleague\'s $9 million uninsured malpractice judgment, Marisol settled $6 million into a Nevis trust through a promoter who advertised "bulletproof, tax-free, private" protection. The trust owned a Nevis LLC with accounts in Liechtenstein. The promoter\'s package included a Nevis trustee and an "offshore accountant" who assured the couple that no U.S. filings were needed because the trust was foreign. Marisol remained LLC manager with sole signature authority; Erik was protector.',
      structure: 'Nevis International Exempt Trust (U.S. settlor, U.S. beneficiaries) → Nevis LLC (settlor-managed) → Liechtenstein bank accounts, approx. $6M. No Forms 3520 or 3520-A, no FBARs, no Form 8938, no Form 5471 for the LLC (which defaulted to corporate classification). Trust income of roughly $280,000 a year was simply omitted from their returns.',
      outcome: 'Four years later the Liechtenstein bank, reporting under its FATCA agreement, identified Marisol as a U.S. controlling person. The IRS letter arrived before any creditor ever did. Under a voluntary disclosure the couple paid back taxes and interest on four years of omitted income, a 75% civil fraud penalty was negotiated down in the disclosure process, FBAR penalties were resolved at a substantial percentage of the high balance, and the Form 3520/3520-A penalties alone would have exceeded $2 million had reasonable cause not been partly accepted. Total cost including professional fees approached $3.1 million, more than half the assets the structure was built to protect. No malpractice claim was ever brought against Marisol.',
      lesson: 'The Nevis statute would have done its job against a creditor. It was never tested because the family\'s own non-compliance did the creditor\'s work for them. An offshore structure is a reporting commitment first and a protective device second; the promoter who tells you otherwise is selling you the felony, not the fence.',
    },
    terminology: [
      { term: 'Offshore (foreign) trust', definition: 'A trust governed by the law of, and administered by a trustee in, a jurisdiction other than the settlor\'s home country; for U.S. tax purposes a trust failing the court or control test of IRC §7701(a)(30)(E).' },
      { term: 'Non-recognition of foreign judgments', definition: 'A statutory refusal by the trust jurisdiction to enforce judgments from other countries, forcing the creditor to re-litigate locally.' },
      { term: 'Duress clause', definition: 'A trust provision instructing the trustee to ignore instructions from the settlor or protector given under compulsion, including court orders.' },
      { term: 'Flight clause', definition: 'A provision permitting the trustee to change the trust\'s governing law and situs if the current jurisdiction becomes hostile.' },
      { term: 'Protector', definition: 'A person with limited powers over the trust (e.g., to remove and replace the trustee); retained protector powers were fatal to the impossibility defense in Anderson.' },
      { term: 'Impossibility defense', definition: 'A defense to civil contempt that the defendant is genuinely unable to comply with a court order; unavailable where the inability is self-created.' },
      { term: 'IRC §679', definition: 'Provision treating a U.S. person who transfers property to a foreign trust with a U.S. beneficiary as owner of the trust for income tax purposes.' },
      { term: 'Form 3520 / 3520-A', definition: 'Annual information returns for transactions with, and ownership of, foreign trusts (IRC §6048), with penalties under §6677.' },
      { term: 'FBAR (FinCEN Form 114)', definition: 'Report of foreign bank and financial accounts required when a U.S. person\'s aggregate foreign accounts exceed $10,000 (31 U.S.C. §5314).' },
      { term: 'FATCA / Form 8938', definition: 'Foreign Account Tax Compliance Act regime requiring foreign financial institutions to report U.S. account holders and U.S. taxpayers to report specified foreign financial assets (IRC §6038D).' },
      { term: 'Common Reporting Standard (CRS)', definition: 'OECD framework for automatic exchange of financial account information between participating jurisdictions.' },
      { term: 'Throwback rules', definition: 'IRC §§665–668 provisions taxing accumulated income distributed from a foreign non-grantor trust to U.S. beneficiaries with an interest charge.' },
    ],
    references: [
      { title: 'FTC v. Affordable Media, LLC (the Anderson case)', citation: '179 F.3d 1228 (9th Cir. 1999)', jurisdiction: 'United States (9th Cir.)', type: 'case', note: 'Contempt upheld; impossibility defense rejected where settlors were protectors of a Cook Islands trust.' },
      { title: 'In re Lawrence', citation: '279 F.3d 1294 (11th Cir. 2002)', jurisdiction: 'United States (11th Cir.)', type: 'case', note: 'Debtor held in civil contempt for failing to repatriate offshore trust assets; incarcerated for several years.' },
      { title: 'United States v. Grant', citation: 'No. 00-08986-CIV (S.D. Fla. 2008)', jurisdiction: 'United States (S.D. Fla.)', type: 'case', note: 'Court declined to hold trust beneficiary in contempt where she lacked control and had made good-faith efforts; impossibility defense succeeded.' },
      { title: 'Internal Revenue Code — foreign trusts having one or more United States beneficiaries', citation: '26 U.S.C. § 679', jurisdiction: 'United States', type: 'statute' },
      { title: 'Internal Revenue Code — information with respect to certain foreign trusts; penalties', citation: '26 U.S.C. §§ 6048, 6677', jurisdiction: 'United States', type: 'statute', note: 'Basis for Forms 3520 and 3520-A.' },
      { title: 'Bank Secrecy Act — records and reports on foreign financial agency transactions (FBAR)', citation: '31 U.S.C. § 5314; 31 C.F.R. § 1010.350', jurisdiction: 'United States', type: 'regulation', note: 'See Bittner v. United States, 598 U.S. 85 (2023) on non-willful penalties being per report.' },
      { title: 'Cook Islands International Trusts Act 1984 (as amended)', jurisdiction: 'Cook Islands', type: 'statute', note: 'Non-recognition of foreign judgments, limitation periods and beyond-reasonable-doubt standard for fraudulent transfer claims.' },
      { title: 'Nevis International Exempt Trust Ordinance 1994 and Nevis Limited Liability Company Ordinance (as amended)', jurisdiction: 'St. Kitts and Nevis', type: 'statute', note: 'Creditor bond requirement; charging order as exclusive remedy against LLC interests.' },
    ],
    takeaways: [
      'Offshore means a different legal system between a creditor and the assets; its value is jurisdictional friction (non-recognition, short limitation periods, criminal standard of proof), not tax or secrecy.',
      'For a U.S. settlor with U.S. beneficiaries, §679 makes the trust a grantor trust: no tax benefit, and a permanent annual reporting regime (Forms 3520, 3520-A, FBAR, 8938, often 5471/8858) with severe penalties.',
      'Retained control is the enemy of the impossibility defense; the contempt cases (Anderson, Lawrence) were lost on control, and Grant was won on its absence.',
      'Fund while solvent, long before any claim, with a documented solvency analysis; the home jurisdiction\'s fraudulent-transfer law still applies to you even if not to the trustee.',
      'Lawful privacy operates inside disclosure regimes (KYC, FATCA, CRS, IRS forms); concealment is tax evasion, and automatic information exchange means it is also detectable.',
    ],
  },
  Diagram,
  Simulator,
};

export default mod;
