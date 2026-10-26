import type { DebtLesson } from '../types';
import { CreditFactors } from './visuals/lesson-visuals';

const lesson: DebtLesson = {
  id: 'debt-02',
  number: 2,
  slug: 'personal-and-business-credit',
  title: 'Personal & Business Credit',
  subtitle: 'What lenders read before they read your business plan: credit files, scores, guarantees and the five Cs.',
  hook: 'Credit is a reputation that has been written down. Lenders rent money to the reputation first and the person second.',
  duration: '30 min',
  objectives: ['governance', 'asset-protection'],
  sections: [
    {
      id: 'history',
      heading: 'A credit history is a record of promises kept',
      body: [
        'Every time you borrow from an institution that reports to a credit bureau, three things are written down: that the account exists, how much you owe relative to what you were allowed to owe, and whether each payment arrived on time. In the US the three national consumer bureaus — Equifax, Experian and TransUnion — hold these files; in the UAE the **Al Etihad Credit Bureau (AECB)** performs the same function under the federal credit information law; in the CEMAC region BEAC operates a **Centrale des Risques** that records bank exposures, and COBAC-supervised banks consult it, though coverage of individuals is thinner than in mature markets.',
        'The history is the asset. A score is only a compression of it. Underwriters at any serious lender look past the number into the tradelines: how long accounts have been open, whether a late payment was a one-off or a pattern, whether balances trend up or down, whether there are collections, judgments or bankruptcies. Two people with the same score can receive very different decisions because the stories behind the numbers differ.',
        'A thin file — few accounts, short history — is a disadvantage even with perfect payment behavior, because the lender has little evidence either way. This matters for young professionals, new immigrants and, as we will see, new entities.',
      ],
    },
    {
      id: 'scores',
      heading: 'How scores are built (educationally, not as a bureau calculation)',
      body: [
        'FICO and VantageScore are the widely used consumer models in the US. FICO publishes the approximate weight of its categories: **payment history** (~35%), **amounts owed** including utilization (~30%), **length of history** (~15%), **new credit** (~10%) and **credit mix** (~10%). The exact algorithm is proprietary and lenders often use industry-specific or custom versions, so treat these as the shape of the model, not a calculation you can replicate.',
        '**Utilization** — revolving balances divided by limits — is the lever with the fastest response. Most scoring models look at the balance reported on the statement date, with little memory, so paying a card down before the statement cuts can move a score within one cycle. Payment history, by contrast, has a long memory: a 30-day late marker can stay on a US file for seven years, and its weight fades slowly.',
        'The AECB in the UAE produces its own score and report; it draws on banks, telecom and utility providers, which means unpaid phone bills can appear alongside loans. Score construction and factor weights there should not be assumed to mirror FICO.',
      ],
      Visual: CreditFactors,
    },
    {
      id: 'rights',
      heading: 'Credit reports, errors and your right to dispute',
      body: [
        'In the US the **Fair Credit Reporting Act (FCRA)** gives consumers the right to obtain their files (free weekly reports are available through AnnualCreditReport.com), to dispute inaccurate information, and to have the bureau investigate — generally within 30 days — and correct or delete unverifiable items. Furnishers (the lenders who report) have parallel duties to investigate. Under the **Equal Credit Opportunity Act** a lender who declines or counter-offers must give an adverse-action notice stating the principal reasons.',
        'Errors are common enough that checking your file before applying for a mortgage is simply part of the process. Mixed files (another person’s account merged into yours), accounts that stayed open after payoff, and duplicated collections are the usual suspects. Dispute in writing, keep the paper, and dispute with the furnisher as well as the bureau.',
        'In the UAE, individuals and companies can obtain their AECB report and raise a dispute through the bureau; in the CEMAC zone, access rights to the Centrale des Risques are more limited and generally run through the bank. These processes are flagged as not yet jurisdictionally verified in this studio.',
      ],
    },
    {
      id: 'business-credit',
      heading: 'Business credit profiles are a separate universe',
      body: [
        'A company has its own credit identity. In the US the main business bureaus are **Dun & Bradstreet** (whose **PAYDEX** score, 1–100, measures how promptly a firm pays suppliers — 80 means on terms), **Experian Business** (Intelliscore Plus) and Equifax Business. The **SBA** uses the **FICO Small Business Scoring Service (SBSS)**, which blends the owner’s personal credit with business data, as a pre-screen for smaller 7(a) loans.',
        'Business credit is built by trading on terms with suppliers who report, by establishing accounts in the company’s legal name with its EIN at its registered address, and by paying early. It is not built by forming an entity. A newly formed LLC has no file; it is the corporate equivalent of a teenager with no credit card. Most lenders will not extend meaningful unsecured credit to it for two to three years of filed financials and tax returns.',
        'The same logic applies abroad. AECB maintains commercial reports on UAE companies; in Cameroon, a company’s standing with its bank and its record in the Centrale des Risques (plus RCCM filings) carries the weight. Entity-level credit everywhere is a function of history, financial statements and the strength of the people behind it.',
      ],
    },
    {
      id: 'guarantees',
      heading: 'Why lenders still want a personal guarantee from a new entity',
      body: [
        'Owners form entities partly to separate personal and business liability. Lenders know this and respond rationally: if the entity has no track record and limited assets, they ask the owner to **personally guarantee** the debt. The SBA, for example, generally requires guarantees from owners of 20% or more. Banks routinely require them for term loans and lines to closely held companies regardless of program. The guarantee is the lender’s answer to the limited liability the owner has just purchased.',
        'A guarantee reconnects the family balance sheet to the business. If the operating company fails, the guaranteeing owner’s personal assets — and, through cross-default and spousal guarantee requirements in some states, the household — are exposed. This is not a reason to refuse all guarantees; it is a reason to know exactly what you have signed. Watch for **unlimited** versus **limited** (capped) guarantees, **joint and several** liability among co-owners, continuing guarantees that outlive the original loan, and waivers of defenses.',
        'The path from guaranteed to non-guaranteed credit is the path of institutional maturity: audited or reviewed financials, consistent profitability, retained equity, diversified revenue and a lender relationship long enough for the bank to underwrite the business on its own cash flows. Case B in this studio follows an SME founder along exactly that path.',
      ],
      callouts: [{ tone: 'amber', title: 'Entity ≠ separation if the paperwork is weak', body: 'A guarantee is explicit. The implicit version — commingled accounts, personal expenses through the business, no minutes — gives a creditor the argument that the entity is the owner’s alter ego. Lenders rarely need that argument because they already hold the guarantee; other creditors will use it.' }],
    },
    {
      id: 'five-cs',
      heading: 'How underwriters actually decide: the five Cs',
      body: [
        'Credit officers are taught a framework older than scoring models. **Character**: the history of keeping promises, read from the file and from references. **Capacity**: cash flow available to service the debt — DTI for individuals, DSCR and coverage ratios for businesses and properties (Lesson 05). **Capital**: the borrower’s own money at risk; skin in the game. **Collateral**: the second way out. **Conditions**: the purpose of the loan, the industry, the economy, the rate environment, and the terms of the deal itself.',
        'The weights move with the product. A conforming residential mortgage is dominated by capacity and collateral through automated underwriting; a working-capital line for a contractor is dominated by capacity and collateral quality (eligible receivables) with character checked through the owner’s file; private credit for a buy-out is dominated by capacity (EBITDA) and conditions (covenants, intercreditor terms).',
        'If you want to be bankable, build evidence under each heading before you need it: clean personal and business files, tax returns that show the income you will claim, retained earnings on the balance sheet, assets whose title is clear and whose value is documented, and a stated purpose for the money that a credit committee can repeat in one sentence.',
      ],
    },
    {
      id: 'strategies',
      heading: 'Credit-building strategies that work, and ones that don’t',
      body: [
        'What works is unglamorous: pay every reported obligation on time, keep revolving utilization low on statement dates, keep old accounts open, add new accounts slowly and only when needed, and check the file annually. A secured card or a credit-builder loan is the standard way to create a first tradeline. For a business, open vendor accounts that report, pay before terms, and separate the company’s banking from the owner’s.',
        'What does not work: “tradeline rental” (being added as an authorized user on a stranger’s account for a fee, which many scoring models now discount and lenders view as misrepresentation), “credit privacy numbers” sold as substitutes for a Social Security number (fraud), disputing accurate information to game deletions, or creating shelf companies to borrow against a fabricated history. Each of these is a short path to a declined loan, a closed account or a criminal referral, and in the family-wealth context it undermines the credibility of every legitimate structure you have built.',
      ],
    },
  ],
  keyTerms: [
    { term: 'Credit bureau', definition: 'An agency that collects and reports borrowing and repayment information: Equifax, Experian, TransUnion (US); Al Etihad Credit Bureau (UAE); BEAC Centrale des Risques (CEMAC).' },
    { term: 'Utilization', definition: 'Revolving balances divided by credit limits; a heavily weighted, fast-moving score factor.' },
    { term: 'FCRA', definition: 'US Fair Credit Reporting Act: governs accuracy, access and dispute rights for consumer credit files.' },
    { term: 'PAYDEX', definition: 'Dun & Bradstreet’s 1–100 business payment score; 80 indicates payment on terms.' },
    { term: 'SBSS', definition: 'FICO Small Business Scoring Service, used by the SBA as a pre-screen for smaller 7(a) loans.' },
    { term: 'Personal guarantee', definition: 'An owner’s promise to repay an entity’s debt if the entity does not; limited or unlimited, joint and several.' },
    { term: 'Five Cs', definition: 'Character, capacity, capital, collateral, conditions: the classical underwriting framework.' },
    { term: 'Adverse action notice', definition: 'Required notice (ECOA / FCRA) stating the principal reasons a credit application was declined or counter-offered.' },
  ],
  knowledgeCheck: [
    { id: 'd2q1', prompt: 'Which score factor typically responds fastest to borrower action?', options: ['Length of credit history', 'Revolving utilization', 'Payment history', 'Credit mix'], answer: 1, explanation: 'Utilization is usually evaluated on current reported balances with little memory, so paying balances down before the statement date can move a score within a cycle.' },
    { id: 'd2q2', prompt: 'A newly formed LLC with no history applies for a $250,000 term loan. The most likely lender requirement is:', options: ['No guarantee, because the LLC limits liability', 'A personal guarantee from the owner(s)', 'A guarantee from the state', 'A credit score for the LLC above 700'], answer: 1, explanation: 'Lenders offset the entity’s limited liability and thin file by requiring the owners to guarantee; the SBA generally requires it from 20%+ owners.' },
    { id: 'd2q3', prompt: 'Under the FCRA, after a consumer disputes an item the bureau must generally:', options: ['Delete it immediately', 'Investigate within about 30 days and correct or remove unverifiable information', 'Forward it to the IRS', 'Charge a dispute fee'], answer: 1, explanation: 'The FCRA requires a reasonable reinvestigation, generally within 30 days, with unverifiable items corrected or deleted.' },
    { id: 'd2q4', prompt: 'D&B’s PAYDEX score of 80 indicates a business that:', options: ['Has 80% utilization', 'Pays suppliers on agreed terms', 'Has 80 open tradelines', 'Is 80 days delinquent'], answer: 1, explanation: 'PAYDEX measures payment promptness to suppliers; 80 corresponds to paying on terms, higher means paying early.' },
    { id: 'd2q5', prompt: 'Which of the following is a legitimate credit-building strategy?', options: ['Buying authorized-user tradelines from strangers', 'Using a “credit privacy number” in place of an SSN', 'Opening vendor accounts in the company’s name that report payment history', 'Disputing accurate late payments to force deletion'], answer: 2, explanation: 'Reported vendor accounts paid on terms build legitimate business credit; the other options are misrepresentation or fraud.' },
  ],
  misconception: {
    claim: '“Form an LLC and borrow in its name so your personal credit is never on the line.”',
    reality: 'A new entity has no credit history and lenders know its liability shield exists; they will almost always require a personal guarantee until the business has years of financial statements. Entity-level, non-guaranteed credit is earned, not formed.',
    confidence: 'red',
  },
  references: [
    { title: 'Fair Credit Reporting Act', citation: '15 U.S.C. § 1681 et seq.', jurisdiction: 'US', type: 'statute', url: 'https://www.consumerfinance.gov/rules-policy/regulations/1022/' },
    { title: 'Equal Credit Opportunity Act and Regulation B — adverse action notices', citation: '15 U.S.C. § 1691; 12 C.F.R. Part 1002', jurisdiction: 'US', type: 'statute' },
    { title: 'CFPB — Credit reports and scores (consumer resources)', jurisdiction: 'US', type: 'guidance', url: 'https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/' },
    { title: 'FICO — How your FICO Scores are calculated (published category weights)', jurisdiction: 'US', type: 'publication', url: 'https://www.myfico.com/credit-education/whats-in-your-credit-score' },
    { title: 'SBA Standard Operating Procedure 50 10 — lender and development company loan programs (personal guarantee and SBSS pre-screen requirements)', jurisdiction: 'US', type: 'guidance', url: 'https://www.sba.gov/', note: 'Phrased generally; SOP versions change.' },
    { title: 'OCC Comptroller’s Handbook — Rating Credit Risk', jurisdiction: 'US', type: 'guidance' },
    { title: 'Al Etihad Credit Bureau — credit reports and scores for individuals and companies', jurisdiction: 'UAE', type: 'guidance', url: 'https://www.aecb.gov.ae/' },
    { title: 'UAE Federal Law No. 6 of 2010 concerning Credit Information (as amended)', jurisdiction: 'UAE', type: 'statute', note: 'Establishes the legal basis for credit reporting; verify amendments.' },
    { title: 'BEAC — Centrale des Risques; COBAC prudential regulations', jurisdiction: 'CEMAC', type: 'regulation', note: 'Phrased generally; verify current regulation numbers.' },
  ],
  jurisdictionNotes: {
    US: { verified: true, notes: ['Consumer files: Equifax, Experian, TransUnion; FCRA dispute rights; free reports via AnnualCreditReport.com.', 'Business files: D&B PAYDEX, Experian Intelliscore, Equifax Business; SBA uses SBSS for smaller 7(a) loans.', 'Personal guarantees generally required from 20%+ owners for SBA loans and routinely by banks for closely held borrowers.'] },
    UAE: { verified: false, notes: ['Al Etihad Credit Bureau provides consumer and commercial credit reports and scores; data includes banks, telecoms and utilities.', 'Central Bank regulations cap certain consumer lending ratios (e.g. debt-burden ratio limits) — verify current circular.', 'Personal guarantees and post-dated security cheques have historically been common in SME lending; legal treatment of cheques has changed — verify.'] },
    CEMAC: { verified: false, notes: ['BEAC’s Centrale des Risques records bank exposures; access and coverage of individuals should be verified locally.', 'COBAC regulations govern bank credit classification and provisioning.', 'Company registration and security filings at the RCCM form part of a lender’s due diligence.'] },
    UK: { verified: false, notes: ['Consumer credit reference agencies: Experian, Equifax, TransUnion UK; statutory report rights under the Data Protection Act / UK GDPR and the Consumer Credit Act.', 'Content for this jurisdiction is in preparation.'] },
  },
};
export default lesson;
