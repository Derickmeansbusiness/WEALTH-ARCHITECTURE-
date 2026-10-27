import type { Objective } from '@/types/content';

export interface CharterField { id: string; label: string; placeholder: string; multiline?: boolean }
export interface GovComponent {
  id: string;
  title: string;
  short: string;
  what: string;
  why: string;
  contains: string[];
  failures: string[];
  clause: string;
  questions: string[];
  fields: CharterField[];
  objectives: Objective[];
}

export const GOV_COMPONENTS: GovComponent[] = [
  {
    id: 'constitution', title: 'Family constitution', short: 'Constitution', objectives: ['governance', 'succession'],
    what: 'A written, non-binding (usually) statement of who the family is, what it owns together, how it decides, and how the other nine components fit. It sits above the legal documents and explains them in the family\'s own words.',
    why: 'Legal documents say what must happen; a constitution says why, and what the family expects of itself when the documents are silent. Families adopt one after a near-miss: a death without a plan, a sibling dispute, an in-law who did not understand the rules.',
    contains: ['Preamble: who the family is and the purpose of shared capital', 'Scope: which assets and entities are "family" assets and which are private', 'Bodies: assembly, council, committees, and how each is composed', 'Amendment procedure and review cycle (typically every 3 to 5 years)', 'Relationship to binding documents: trusts, shareholder agreements, LLC agreements take precedence'],
    failures: ['Written by advisers, signed by the founder, read by nobody', 'Pretends to be binding when it is not; conflicts with the trust deed', 'Never amended, so the second generation treats it as the founder\'s voice from the grave', 'Too long. Forty pages that nobody can summarise in a sentence'],
    clause: 'ILLUSTRATIVE: "This Constitution expresses the shared intentions of the [Name] family. It does not create legal rights or obligations. Where it conflicts with any trust instrument, shareholders\' agreement or operating agreement, that document prevails, and the Family Council shall propose amendments to reconcile them at its next meeting."',
    questions: ['Who counts as "family" for governance: blood, marriage, adoption, partners?', 'Which assets are shared capital and which belong to individuals or branches?', 'What would make us proud of this document in fifty years?', 'How will we change it, and who can call for a change?'],
    fields: [
      { id: 'familyName', label: 'Family name', placeholder: 'The Okafor-Lindqvist family' },
      { id: 'preamble', label: 'Preamble (who we are, why we hold capital together)', placeholder: 'We are the descendants of ... We hold certain assets in common because ...', multiline: true },
      { id: 'membership', label: 'Who is a member for governance purposes', placeholder: 'Descendants of the founders aged 18+, spouses as non-voting participants ...', multiline: true },
      { id: 'review', label: 'Review cycle', placeholder: 'Every three years, or on request of one third of the Assembly' },
    ],
  },
  {
    id: 'mission', title: 'Family mission', short: 'Mission', objectives: ['governance'],
    what: 'One to three sentences on what the family\'s capital is for. Not an investment objective; a statement of purpose that a 16-year-old and an 80-year-old can both recite.',
    why: 'Without a shared purpose every decision becomes a negotiation among interests. With one, the council can say "that is not what we are for". Families who have done this say the arguments do not disappear; they get shorter.',
    contains: ['Purpose of the shared capital (security, opportunity, enterprise, giving, place)', 'The values the family wants to be known for', 'What the family will not do for money', 'A time horizon: for whom is this capital being stewarded?'],
    failures: ['Generic ("to grow and preserve wealth for future generations") and therefore useless', 'Written by one person and announced', 'Values list nobody actually lives by, which breeds cynicism in the next generation'],
    clause: 'ILLUSTRATIVE: "The family holds capital together so that every member has the education and health to pursue useful work, so that members who build enterprises can be backed on fair terms, and so that the places and communities that made the family can be served. We will not hold capital in ways we would be ashamed to explain."',
    questions: ['If the money vanished tomorrow, what would we want to have been true of how we used it?', 'What do we owe each other, and what do we not owe each other?', 'Which decision in the last five years best expressed our values? Which contradicted them?'],
    fields: [
      { id: 'mission', label: 'Mission statement', placeholder: 'The family holds capital together so that ...', multiline: true },
      { id: 'values', label: 'Three to five values (comma separated)', placeholder: 'Enterprise, candour, stewardship, service' },
      { id: 'wontDo', label: 'What we will not do for money', placeholder: 'We will not ...', multiline: true },
    ],
  },
  {
    id: 'council', title: 'Family council', short: 'Council', objectives: ['governance', 'succession'],
    what: 'The elected working body between the full family assembly and the professional structures (trustees, boards, family office). It meets a few times a year, carries the family\'s voice to the fiduciaries, and carries information back.',
    why: 'Trustees and boards need one legitimate counterpart, not thirty cousins with opinions. The council is how a family of 30 or 300 speaks with one voice without pretending to be a committee of the whole.',
    contains: ['Composition: size, branch or generation representation, independent member?', 'Election method and term limits (3-year staggered terms are common)', 'Powers: which decisions it makes, which it recommends, which it only receives reports on', 'Meeting rhythm, quorum, minutes and confidentiality', 'Relationship to trustees and boards: advise, nominate, or appoint?'],
    failures: ['Founder chairs it forever; it becomes a briefing, not a council', 'No real decision rights, so capable members stop attending', 'Branch representation hardens into branch rivalry', 'Confuses itself with the board of the operating company'],
    clause: 'ILLUSTRATIVE: "The Family Council shall consist of five members elected by the Family Assembly for staggered three-year terms, no more than two from any one branch, with at least one member under the age of 35. The Council advises the Trustees on beneficiary matters, nominates family directors to the boards of family companies, and approves the annual family budget."',
    questions: ['What decisions should the council actually make, rather than discuss?', 'Who may sit: adults only, spouses, members not working in the business?', 'How does someone get removed?', 'What does the council report back to the assembly, and how often?'],
    fields: [
      { id: 'size', label: 'Size and composition', placeholder: 'Five members; max two per branch; one under 35' },
      { id: 'terms', label: 'Election and terms', placeholder: 'Elected by the Assembly; three-year staggered terms; two-term limit' },
      { id: 'powers', label: 'Decision rights', placeholder: 'Approves family budget; nominates family directors; advises trustees ...', multiline: true },
      { id: 'cadence', label: 'Meeting rhythm', placeholder: 'Quarterly, with one meeting alongside the annual Assembly' },
    ],
  },
  {
    id: 'investment', title: 'Investment committee', short: 'Investment', objectives: ['governance', 'asset-protection'],
    what: 'The body that owns the investment policy statement for pooled family capital: asset allocation, risk limits, liquidity, manager selection and oversight, and conflicts of interest. Often includes independent professionals.',
    why: 'Pooled capital without a written policy drifts toward whoever is loudest or most recently right. An IPS is the document that lets the family say no to a cousin\'s start-up and yes to rebalancing in a crash.',
    contains: ['Investment policy statement: objectives, time horizon, return and risk targets', 'Asset allocation ranges and rebalancing rules', 'Liquidity policy: how much must be available for distributions and tax', 'Related-party and co-investment rules', 'Reporting: frequency, benchmarks, fees transparency'],
    failures: ['Policy is written but never used to judge a decision', 'Concentration in the founder\'s company treated as untouchable', 'Family members "advising" without independence or accountability', 'Fees and performance never compared to simple benchmarks'],
    clause: 'ILLUSTRATIVE: "No pooled capital shall be invested in any enterprise in which a family member holds a management role or more than 5% interest, except with the approval of a majority of the independent members of the Investment Committee, on terms documented as arm\'s length."',
    questions: ['What is the capital for, and therefore how much risk can it bear?', 'How concentrated are we in the original business, and is that a choice or an accident?', 'Who may say no to the family patriarch or matriarch on an investment?'],
    fields: [
      { id: 'composition', label: 'Composition', placeholder: 'Two family members, two independent investment professionals, the CIO (non-voting)' },
      { id: 'objective', label: 'Investment objective and horizon', placeholder: 'Preserve real purchasing power after distributions over rolling 20-year periods', multiline: true },
      { id: 'limits', label: 'Key limits', placeholder: 'Max 15% in any single position outside the operating company; min 2 years of distributions in liquid assets', multiline: true },
    ],
  },
  {
    id: 'education', title: 'Education policy', short: 'Education', objectives: ['governance', 'succession'],
    what: 'What the family will fund for members (schooling, university, vocational training, financial literacy, leadership) and what it expects in return: attendance at family meetings, understanding of the structures, readiness for roles.',
    why: 'The next generation inherits trust interests they never chose. If they do not understand what a trustee is, what a charging order does, or why the operating agreement matters, the architecture will be dismantled by the people it was built for.',
    contains: ['What is funded, for whom, up to what amount, and under what conditions', 'A financial-literacy and governance curriculum by age band', 'Mentoring and board-observer seats for members in their twenties', 'Expectations: participation, reporting, reciprocity'],
    failures: ['Funding without expectations: entitlement by design', 'Curriculum is a one-off weekend, not a program', 'Nobody teaches the structures; advisers hoard the knowledge', 'The policy treats all paths as university; trades and enterprise go unfunded'],
    clause: 'ILLUSTRATIVE: "The family funds tuition and reasonable living costs for any accredited degree, apprenticeship or professional qualification for members under 30, conditional on attendance at the annual Assembly and completion of the family financial-literacy module by age 21."',
    questions: ['What does a competent 25-year-old member of this family know and can do?', 'Who teaches it, and when?', 'What happens if someone declines to participate?'],
    fields: [
      { id: 'funded', label: 'What the family funds', placeholder: 'Tuition and living costs for degrees, apprenticeships and professional qualifications up to age 30', multiline: true },
      { id: 'curriculum', label: 'Governance and financial-literacy program', placeholder: 'Age 16: basics of the family balance sheet; 21: trusts and entities module; 25: board observer year', multiline: true },
      { id: 'expectations', label: 'Expectations of members', placeholder: 'Attend the Assembly; complete the curriculum; report on funded study annually' },
    ],
  },
  {
    id: 'employment', title: 'Employment policy', short: 'Employment', objectives: ['governance', 'succession'],
    what: 'The rules for family members who want to work in the family business or family office: entry requirements, who decides, how they are paid, how they are evaluated, and how they leave.',
    why: 'Nothing destroys a family business faster than jobs as birthright. Nothing destroys a family faster than a sibling fired by a sibling without rules. The policy depersonalises both.',
    contains: ['Entry: minimum outside experience (3 to 5 years is common), relevant qualification, an open vacancy', 'Decision: hiring by management or an independent committee, not by a parent', 'Pay: market-rate compensation for the role, with ownership returns handled separately', 'Evaluation: same process as non-family employees, with an independent reviewer', 'Exit: how underperformance is handled; non-compete and confidentiality'],
    failures: ['Every child gets a title; nobody gets a performance review', 'Pay confused with distributions; the non-working sibling resents both', 'A parent as line manager', 'Policy adopted but waived for the first case that matters'],
    clause: 'ILLUSTRATIVE: "A family member may be employed by a family company only for an existing, advertised position, after at least three years\' full-time employment elsewhere, and on the recommendation of the company\'s chief executive confirmed by the independent members of its board. Compensation shall be at market rate as benchmarked by the Remuneration Committee."',
    questions: ['Is working in the business a right, an opportunity, or a service?', 'Who manages a family employee, and who can dismiss one?', 'How do we separate pay for work from returns on ownership?'],
    fields: [
      { id: 'entry', label: 'Entry requirements', placeholder: 'Three years outside experience; relevant qualification; existing vacancy' },
      { id: 'decides', label: 'Who decides on hiring and dismissal', placeholder: 'The CEO, confirmed by the independent directors; never a parent or sibling as direct line manager' },
      { id: 'pay', label: 'Compensation principle', placeholder: 'Market rate for the role, benchmarked annually; ownership returns handled only through distributions' },
    ],
  },
  {
    id: 'distribution', title: 'Distribution philosophy', short: 'Distributions', objectives: ['governance', 'estate-planning', 'tax-planning'],
    what: 'The family\'s stated view on how much capital should flow to members, when, for what, and with what conditions. It guides trustees exercising discretion and the council setting budgets; it is not itself the trust instrument.',
    why: 'Trustees with pure discretion and no guidance either refuse everything or approve everything. Families who write down a philosophy (needs first, then opportunity, then lifestyle; matching, not funding; sustainability over generations) give trustees something to stand on.',
    contains: ['Priorities: health and education, then enterprise and housing, then lifestyle', 'Sustainability rule: distributions as a % of a rolling average of assets', 'Conditions: matching contributions, business plans, repayment expectations for enterprise capital', 'Equal vs equitable: per capita, per stirpes, or by need', 'Transparency: who knows what others received'],
    failures: ['Lifestyle support that grows with the asset base and never shrinks', 'Secrecy about who got what, breeding suspicion', 'Trustees pressured into distributions that defeat the tax or protection purpose of the trust', 'No distinction between a grant, a loan and an investment'],
    clause: 'ILLUSTRATIVE: "The family intends that aggregate distributions from shared capital in any year not exceed 3% of the trailing three-year average value of that capital, that health and education needs be met before any other distribution, and that capital for a member\'s enterprise be provided by documented loan or equity on arm\'s-length terms through the Family Bank rather than by gift."',
    questions: ['Do we fund lifestyle, or only needs and opportunities?', 'How much can we distribute each year and still be here in a hundred years?', 'Should distributions be equal, or fair? Who decides what fair means?'],
    fields: [
      { id: 'priorities', label: 'Priorities for distributions', placeholder: 'Health and education; then enterprise and first home; then lifestyle', multiline: true },
      { id: 'rate', label: 'Sustainability rule', placeholder: 'No more than 3% of trailing 3-year average assets per year' },
      { id: 'enterprise', label: 'Capital for member enterprises', placeholder: 'By documented loan or equity on arm\'s-length terms via the Family Bank, never by gift' },
    ],
  },
  {
    id: 'conflict', title: 'Conflict-resolution process', short: 'Conflict', objectives: ['governance'],
    what: 'An agreed ladder for disputes among members or between members and family bodies: conversation, facilitated conversation, mediation, arbitration or expert determination, and only then court. Written before it is needed.',
    why: 'Every family has conflict. The ones that survive have a process that keeps disputes out of court and out of the press, and that gives the losing side a reason to accept the outcome.',
    contains: ['Escalation ladder with timelines at each step', 'Named neutral resources: a family facilitator, a mediation panel, an arbitration seat', 'Confidentiality and no-disparagement commitments', 'Carve-outs: what can go straight to court (urgent injunctions, fiduciary misconduct)', 'Costs: who pays at each stage'],
    failures: ['Process exists but the first serious dispute bypasses it', 'Mediation with no deadline becomes a delay tactic', 'Arbitration clause in the constitution but not in the binding documents, so it is unenforceable', 'Founder as judge'],
    clause: 'ILLUSTRATIVE: "Any dispute between members concerning shared capital shall first be raised with the Council chair, then referred to a facilitated conversation within 30 days, then to mediation under [institution] rules within 90 days. If unresolved, the dispute shall be finally resolved by confidential arbitration seated in [city], and each binding family document shall contain a clause to that effect."',
    questions: ['Who is trusted enough by all branches to facilitate?', 'What must stay confidential, and what should the whole family know?', 'Are the arbitration clauses actually in the trust deed and shareholder agreement?'],
    fields: [
      { id: 'ladder', label: 'Escalation ladder', placeholder: 'Conversation → Council chair → facilitated session (30 days) → mediation (90 days) → arbitration', multiline: true },
      { id: 'neutrals', label: 'Neutral resources', placeholder: 'A retained family facilitator; a three-person mediation panel agreed in advance' },
      { id: 'seat', label: 'Arbitration seat and rules', placeholder: 'Seat: [city]; rules: [institution]' },
    ],
  },
  {
    id: 'succession', title: 'Succession policy', short: 'Succession', objectives: ['succession', 'estate-planning', 'governance'],
    what: 'How leadership of the family bodies, the operating businesses and the fiduciary roles passes: criteria, timelines, development paths, and the emergency plan if a leader dies or is incapacitated tomorrow.',
    why: 'Succession is the moment the architecture is tested. The founder\'s death, the CEO\'s stroke, the trustee\'s retirement each happen once and cannot be rehearsed. A written policy is the rehearsal.',
    contains: ['Roles covered: council chair, company CEO and board seats, trustee and protector, family office head', 'Criteria and development path for each', 'Emergency succession: who acts within 24 hours, with what authority', 'Timelines and mandatory retirement or review ages (if any)', 'Linkage to legal documents: operating agreements, trust deeds, buy-sell'],
    failures: ['Founder "will know when it is time"', 'Successor chosen but never given real authority before the handover', 'Legal documents name a different person than the family expects', 'Emergency plan exists on paper; the bank has never seen it'],
    clause: 'ILLUSTRATIVE: "The Council shall maintain, and review annually, a succession plan for each leadership and fiduciary role identifying an emergency successor and a developmental successor. The operating agreement of each family company shall name an interim manager empowered to act on the incapacity of the manager as determined by two licensed physicians."',
    questions: ['If the current leader of each body were unavailable tomorrow, who signs on Monday?', 'What does a successor need to have done before being appointed?', 'Do the trust deed and the operating agreements say what the family believes they say?'],
    fields: [
      { id: 'roles', label: 'Roles covered', placeholder: 'Council chair; CEO and board of OpCo; trustees and protector; family office head' },
      { id: 'emergency', label: 'Emergency successor and authority', placeholder: 'Named interim manager per operating agreement; successor trustee by deed; both known to the banks', multiline: true },
      { id: 'development', label: 'Development path', placeholder: 'Board observer by 28; committee chair by 35; external board experience before CEO consideration', multiline: true },
    ],
  },
  {
    id: 'philanthropy', title: 'Philanthropy strategy', short: 'Philanthropy', objectives: ['governance', 'tax-planning'],
    what: 'How the family gives: through what vehicle (foundation, donor-advised fund, direct), toward what, with what decision process, and what role giving plays in educating the next generation.',
    why: 'Giving is where many families first let the next generation make real decisions with real money. It is also where tax planning and values meet, and where the family\'s public reputation is formed.',
    contains: ['Purpose and focus areas', 'Vehicle and its governance (foundation board, DAF advisers)', 'Annual budget rule and relationship to distribution philosophy', 'Next-generation participation: junior board, matching gifts', 'Tax questions: deductibility limits, excise taxes on private foundations, cross-border giving rules'],
    failures: ['The foundation becomes the founder\'s hobby or the family\'s payroll', 'Giving disconnected from the mission', 'Tax advantage treated as the purpose rather than a consequence', 'Cross-border giving without checking local deductibility and reporting'],
    clause: 'ILLUSTRATIVE: "The family commits at least [X]% of annual distributable income to philanthropy through the Family Foundation, governed by a board of which at least two members are under 35. Grants shall be in the focus areas adopted by the Assembly and reviewed every five years."',
    questions: ['What do we want to be known for giving to, and why?', 'Which vehicle fits our size and jurisdictions?', 'How do we involve people under 30 with real authority?'],
    fields: [
      { id: 'focus', label: 'Focus areas', placeholder: 'Secondary education in [region]; primary health; the arts in [city]' },
      { id: 'vehicle', label: 'Vehicle and governance', placeholder: 'Private foundation with a 7-person board; two seats reserved for members under 35' },
      { id: 'budget', label: 'Budget rule', placeholder: 'At least 10% of annual distributable income' },
    ],
  },
];

export const componentById = (id: string) => GOV_COMPONENTS.find((c) => c.id === id);
