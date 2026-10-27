import type { DebtLesson } from '../types';
import { ContagionMap } from './visuals/lesson-visuals';

const lesson: DebtLesson = {
  id: 'debt-09',
  number: 9,
  slug: 'debt-risk-and-wealth-preservation',
  title: 'Debt Risk & Wealth Preservation',
  subtitle: 'Liquidity crises, covenant breaches, guarantees, cross-default and bankruptcy — and how debt at one company reaches assets that were supposed to be safe.',
  hook: 'Families rarely lose fortunes to bad investments. They lose them to good investments financed with debt that could not survive one bad year.',
  duration: '35 min',
  objectives: ['asset-protection', 'governance', 'succession', 'estate-planning'],
  sections: [
    {
      id: 'how-it-breaks',
      heading: 'How leveraged structures actually fail',
      body: [
        'The failure sequence is almost always the same and almost never starts with a default on payment. It starts with a **liquidity** problem — a tenant leaves, a customer pays late, a rate resets, a construction project runs over — that is manageable in isolation. Then a **covenant** trips: DSCR falls below the test, LTV rises above it when the lender re-appraises, or a reporting deadline is missed. The lender now holds an event of default and uses it: default interest, a cash sweep, a demand for more equity or collateral, a refusal to renew the line.',
        'That is when **cross-default** clauses turn one lender’s problem into every lender’s problem: facilities at other companies that were performing perfectly are now in default too, because their documents say a default anywhere in the group is a default here. **Guarantees** are called, pulling the parent or the individuals into the obligation. **Cross-collateralization** lets the lender reach assets that were pledged for a different loan. The family is now negotiating with several lenders at once, from weakness, about assets that had nothing to do with the original problem.',
        'The final stage is a **forced sale** — selling the best asset at the worst time to pay the loan on the worst asset — or a **refinancing failure** at maturity that converts an illiquidity into an insolvency. None of this requires fraud or bad luck beyond the ordinary. It requires only leverage sized for the base case and a structure that connects everything to everything.',
      ],
    },
    {
      id: 'contagion',
      heading: 'Contagion across a family structure',
      body: [
        'Entities exist to contain liability. Debt is how liability escapes. The animation below shows a family structure where the operating company has borrowed aggressively. In the poorly separated version, the holding company has guaranteed the loan, the property company’s building is cross-collateralized, the investment company’s facility has a cross-default clause, and the family members have signed personal guarantees. Watch a single covenant breach at the operating company travel through each of those connections until it reaches the family’s personal assets.',
        'In the disciplined version, the operating company’s lender has recourse only to the operating company. The holding company contributed equity instead of a guarantee. The property company leases to the operating company at arm’s length and pledges nothing. The investment company borrows from a different lender with no cross-default. The family members did not guarantee. The operating company still fails — the lesson is not that separation prevents failure — but the failure is contained: the family loses the equity in one company and keeps everything else.',
        'Separation has a price. The operating company’s loan will be smaller and more expensive without the parent guarantee; some lenders will decline. That is the honest tradeoff, and it should be made deliberately by the family, with the contagion map in front of it, rather than by default because the bank’s standard form included a guarantee page.',
      ],
      Visual: ContagionMap,
    },
    {
      id: 'guarantees-covenants',
      heading: 'Guarantees, covenants and the clauses that connect everything',
      body: [
        'Read the loan documents for the four connecting clauses. **Guarantee**: who has promised to pay if the borrower does not, and is it limited, unlimited, joint and several, continuing? **Cross-default**: does a default under any other agreement (of the borrower, or of any affiliate or guarantor) constitute a default here? **Cross-collateralization**: does the collateral for this loan also secure other obligations, or vice versa? **Material adverse change (MAC)**: can the lender declare default on its judgment that the borrower’s condition has deteriorated? Each of these is negotiable at signing and non-negotiable afterwards.',
        'Covenant **headroom** is the family’s early-warning system. A business operating at 2.9× debt-to-EBITDA against a 3.0× covenant has no room for a bad quarter; one at 2.0× has a cushion. Track every covenant monthly, in a single schedule across all entities, with the headroom expressed in the units that matter (how much revenue can fall before a breach). Families with many facilities often discover, when they finally build that schedule, that a modest downturn would breach several covenants at once.',
        'Personal guarantees deserve a standing inventory. Every guarantee a family member has signed is a contingent liability on their personal balance sheet; lenders ask for a schedule of them on every personal financial statement, and estate planners need it because guarantees survive death as claims against the estate. A family office that cannot produce the list within a day has an unmanaged risk.',
      ],
    },
    {
      id: 'rates-maturity',
      heading: 'Rising rates, maturity walls and liquidity reserves',
      body: [
        'Rate risk and maturity risk compound. Floating-rate debt raises debt service immediately when rates rise; fixed-rate debt postpones the shock to maturity, when the loan must be refinanced at the new rate. A family whose loans all mature within the same two-year window has built a **maturity wall**: if that window coincides with a tight credit market, every refinancing is negotiated from weakness simultaneously. Case E shows a maturity ladder spread across years precisely to avoid this.',
        'The defense is liquidity held outside the leveraged assets. A **reserve** of unencumbered cash or liquid securities — commonly sized as 12–24 months of total group debt service plus the equity needed to cure a plausible covenant breach — is what lets a family cure a default, fund a cash-in refinance or simply wait rather than sell. Lenders call this “post-closing liquidity” and require it; families should require it of themselves at a higher level than lenders do.',
        'The Stress Test tool in this studio applies rate shocks, value declines and income drops to any loan or portfolio and reports when coverage breaks and how much reserve would be needed to carry the asset through. Run it before signing, and again every year.',
      ],
      callouts: [{ tone: 'amber', title: 'Fixed is not free', body: 'Fixed-rate debt costs more at inception and carries prepayment penalties; floating debt is cheaper until it is not. The decision is a risk allocation, not a prediction. Families that must refinance to survive a rate rise have made a bet; families that can carry the asset through have made an investment.' }],
    },
    {
      id: 'bankruptcy',
      heading: 'Insolvency regimes, generally',
      body: [
        'When a borrower cannot pay, the law provides an orderly process whose shape varies by jurisdiction. In the **United States**, Chapter 7 of the Bankruptcy Code liquidates a debtor’s non-exempt assets through a trustee; Chapter 11 reorganizes a business (with a streamlined Subchapter V for small businesses) under a plan that can modify debt; Chapter 13 reorganizes an individual’s debts. The automatic stay halts collection; the trustee or debtor can avoid preferences and fraudulent transfers made before filing; secured creditors retain their liens; guarantors are not protected by the borrower’s stay.',
        'In the **UAE**, the federal bankruptcy framework (originally Federal Decree-Law No. 9 of 2016, replaced by Federal Decree-Law No. 51 of 2023) provides preventive composition, restructuring and bankruptcy procedures for companies and traders, with a separate insolvency law for individuals; the historical criminalization of bounced security cheques has been substantially reformed. In the **OHADA zone**, including Cameroon, the Uniform Act organizing Collective Proceedings for the Discharge of Liabilities (revised 2015) provides conciliation, preventive settlement (règlement préventif), judicial reorganization (redressement judiciaire) and liquidation, with a suspect period during which certain transactions can be set aside. All three systems share the principle that a lender with properly perfected security stands ahead of unsecured creditors.',
        'For family planning, the point is not to plan for bankruptcy but to understand what it reaches. It reaches the debtor entity’s assets. It reaches guarantors through the guarantee. It reaches transfers made to family members or related entities before the filing if they can be characterized as preferential or fraudulent. It does not reach assets of separate entities that were genuinely separate, nor properly settled trusts (subject to look-back periods and the limits taught in the asset-protection chapters). These are generalizations; the specific procedure and timing in each jurisdiction should be reviewed with insolvency counsel.',
      ],
    },
    {
      id: 'preservation',
      heading: 'Wealth preservation: a debt policy for the family',
      body: [
        'Preservation comes from policy, not from reaction. A written family debt policy typically covers: a **maximum leverage** for the group and for each asset class, measured in LTV and DSCR under stressed assumptions rather than at purchase; a **guarantee policy** — who may guarantee what, with limits and family-council approval for any guarantee above a threshold; a **separation policy** — no cross-collateral or cross-default across entities without explicit approval, arm’s-length terms for intra-group dealings; a **liquidity reserve** sized to group debt service; a **maturity ladder** with no more than a set share of debt maturing in any year; and a **reporting rhythm** — a quarterly covenant and guarantee schedule to the family council.',
        'The policy is only as good as the documentation beneath it. Separate bank accounts, separate books, minutes for every intra-group loan, perfected security where security is granted, leases and service agreements between family companies at arm’s length. The Structure Lab and Financing Map on this platform let you see the connections; the discipline is in keeping them the way the map shows them.',
        'Finally, the human part. The founder who built the fortune with aggressive leverage is often the hardest person to persuade that the family should carry less. The argument that works is not caution; it is arithmetic. A 3.3× leverage factor that produced the fortune is the same 3.3× that erases it, and the next generation did not choose the bet. Debt is a financing instrument — one that can accelerate capital formation when supported by productive assets, sustainable cash flow and disciplined risk management, and one that destroys capital when any of those three is missing.',
      ],
    },
  ],
  keyTerms: [
    { term: 'Cross-default', definition: 'A clause making default under one agreement a default under another, often across affiliates.' },
    { term: 'Cross-collateralization', definition: 'One asset securing several obligations, or several assets securing one.' },
    { term: 'Material adverse change (MAC)', definition: 'A clause allowing the lender to declare default on a judgment that the borrower’s condition has materially worsened.' },
    { term: 'Covenant headroom', definition: 'The buffer between actual ratios and covenant limits.' },
    { term: 'Maturity wall', definition: 'A concentration of loan maturities in a short window, creating simultaneous refinancing risk.' },
    { term: 'Automatic stay', definition: 'US bankruptcy protection halting collection against the debtor on filing; does not protect guarantors.' },
    { term: 'Preference', definition: 'A pre-filing payment or transfer to a creditor that can be recovered because it favoured one creditor over others.' },
    { term: 'Suspect period (période suspecte)', definition: 'OHADA term for the window before insolvency during which certain transactions can be set aside.' },
  ],
  knowledgeCheck: [
    { id: 'd9q1', prompt: 'The typical first step in a leveraged structure’s failure is:', options: ['A missed payment', 'A liquidity shortfall that trips a covenant', 'Bankruptcy filing', 'A lender bankruptcy'], answer: 1, explanation: 'Covenant breaches usually precede payment defaults and give lenders remedies while payments are still current.' },
    { id: 'd9q2', prompt: 'Which clause allows a default at the operating company to become a default on the investment company’s unrelated loan?', options: ['Interest-only period', 'Cross-default', 'Prepayment penalty', 'Due-on-sale'], answer: 1, explanation: 'Cross-default clauses link facilities across affiliates so one default triggers others.' },
    { id: 'd9q3', prompt: 'A parent company that contributes equity to a subsidiary instead of guaranteeing its loan has:', options: ['Increased contagion risk', 'Limited its exposure to the equity contributed, at the cost of a smaller or costlier loan for the subsidiary', 'Eliminated the subsidiary’s risk', 'Violated lending law'], answer: 1, explanation: 'Equity caps the parent’s loss; a guarantee exposes the parent’s whole balance sheet. The tradeoff is pricing and availability of the subsidiary’s credit.' },
    { id: 'd9q4', prompt: 'In US bankruptcy, the automatic stay:', options: ['Protects guarantors of the debtor’s loans', 'Halts collection against the debtor but does not protect guarantors', 'Cancels all secured debt', 'Applies only to Chapter 7'], answer: 1, explanation: 'The stay protects the debtor and its estate; lenders may pursue guarantors separately.' },
    { id: 'd9q5', prompt: 'A family liquidity reserve is best sized relative to:', options: ['Annual income', 'Total group debt service for 12–24 months plus plausible covenant cures', 'The largest single asset’s value', 'The number of entities'], answer: 1, explanation: 'The reserve exists to carry debt service and cure defaults through a downturn without forced sales.' },
  ],
  misconception: {
    claim: '“Each company is a separate LLC, so a problem at one can’t touch the others.”',
    reality: 'Separation is defeated by guarantees, cross-default and cross-collateral clauses, commingled accounts and undocumented intra-group dealings. The entity structure is a map; the loan documents and the family’s conduct decide whether the walls on the map exist.',
    confidence: 'red',
  },
  references: [
    { title: 'US Bankruptcy Code — Chapters 7, 11 (incl. Subchapter V), 13; automatic stay §362; preferences §547; fraudulent transfers §548', citation: '11 U.S.C.', jurisdiction: 'US', type: 'statute', url: 'https://www.uscourts.gov/services-forms/bankruptcy/bankruptcy-basics' },
    { title: 'Uniform Voidable Transactions Act (formerly UFTA), as enacted by states', jurisdiction: 'US', type: 'statute' },
    { title: 'OCC Comptroller’s Handbook — Loan Portfolio Management; Concentrations of Credit', jurisdiction: 'US', type: 'guidance', url: 'https://www.occ.gov/publications-and-resources/publications/comptrollers-handbook/' },
    { title: 'Federal Reserve — Financial Stability Report; supervisory stress-testing frameworks', jurisdiction: 'US', type: 'research', url: 'https://www.federalreserve.gov/publications/financial-stability-report.htm' },
    { title: 'Interagency Statement on Prudent Risk Management for Commercial Real Estate Lending (2015)', jurisdiction: 'US', type: 'guidance' },
    { title: 'UAE Federal Decree-Law No. 51 of 2023 on Financial Restructuring and Bankruptcy (replacing Federal Decree-Law No. 9 of 2016)', jurisdiction: 'UAE', type: 'statute', note: 'Phrased generally; verify commencement and implementing regulations.' },
    { title: 'UAE Federal Decree-Law No. 19 of 2019 on Insolvency of Natural Persons', jurisdiction: 'UAE', type: 'statute', note: 'Phrased generally.' },
    { title: 'OHADA Uniform Act organizing Collective Proceedings for the Discharge of Liabilities (AUPC), revised 10 September 2015', jurisdiction: 'OHADA / CEMAC', type: 'statute' },
    { title: 'OHADA Uniform Act on Secured Transactions (2010) — enforcement of security and ranking of creditors', jurisdiction: 'OHADA / CEMAC', type: 'statute' },
  ],
  jurisdictionNotes: {
    US: { verified: true, notes: ['Chapter 7 liquidation, Chapter 11 reorganization (Subchapter V for small business), Chapter 13 for individuals; automatic stay does not protect guarantors.', 'Preference (90 days; one year for insiders) and fraudulent-transfer look-backs reach pre-filing transfers to related parties.', 'Perfected secured creditors retain liens through bankruptcy.'] },
    UAE: { verified: false, notes: ['Federal bankruptcy law provides preventive composition, restructuring and liquidation; a separate law covers insolvency of natural persons.', 'Reforms have reduced criminal exposure for bounced cheques, long used as loan security; verify current position.', 'Free-zone entities (e.g. DIFC, ADGM) have their own insolvency regimes.'] },
    CEMAC: { verified: false, notes: ['OHADA AUPC (2015) applies in Cameroon and other member states: conciliation, règlement préventif, redressement judiciaire, liquidation des biens.', 'Suspect-period avoidance can reach security granted and payments made before the opening judgment.', 'Enforcement of security governed by the OHADA secured-transactions and simplified recovery acts.'] },
    UK: { verified: false, notes: ['Insolvency Act 1986: administration, CVA, liquidation; restructuring plans under the Corporate Insolvency and Governance Act 2020.', 'Content for this jurisdiction is in preparation.'] },
  },
};
export default lesson;
