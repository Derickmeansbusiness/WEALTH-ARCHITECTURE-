import type { ChapterModule } from '@/types/content';
import { CHAPTERS } from '../manifest';
import Diagram from './Diagram';
import Simulator from './Simulator';
import './styles.css';

const meta = CHAPTERS.find((c) => c.id === 'ch08')!;

const mod: ChapterModule = {
  content: {
    id: meta.id,
    number: meta.number,
    slug: meta.slug,
    title: meta.title,
    subtitle: 'Labor fills the first pool. Everything after that is a decision about where the overflow goes — and what you refuse to sell.',
    objectives: ['succession', 'governance', 'estate-planning', 'tax-planning'],
    duration: meta.duration,
    hook: 'Every family that stays wealthy has a sequence. Every family that does not has a pile.',
    concept: [
      'Think of family wealth as a series of pools arranged downhill. **Labor** — salary, professional fees, the founder\'s draw — is the only pool that fills itself, and it is the only one that stops filling when a person stops working or dies. The surplus from labor overflows into an **operating business**: the highest-returning asset most families will ever own, and the most concentrated, the least liquid and the most dependent on one or two people. Business profits that are not reinvested overflow into **real estate**, which converts volatile business income into a slower, lender-financed, depreciable stream. Real estate and business distributions in turn fund **marketable investments** — the liquid, diversified pool that can be sold on a Tuesday. Below that sits **permanent capital**: assets moved into long-term trusts for the next generation, deliberately hard to spend. And at the bottom, filling last and growing slowest, is the **insurance and liquidity reserve** — cash, reserve lines and life insurance — whose only job is to make sure that when something goes wrong, nothing above it is sold at the wrong price. The sum of the pools, governed as one balance sheet across generations, is **family capital**.',
      'The sequence matters more than the amounts. Families who skip the business and real estate tiers and go straight from labor to a brokerage account build wealth at market rates minus tax; nothing wrong with that, but it is the slow lane and it does not survive the labor pool stopping unless it is very large. Families who build a business and never let the overflow leave it hold one asset, and I have sat in enough rooms after a founder\'s stroke to know how that ends. Families who build real estate without the liquidity tier own a portfolio that cannot pay an estate tax bill or a lawsuit without a fire sale. The waterfall is not a theory of returns; it is a theory of **sequencing risk** — which pool protects which.',
      'The second idea is **recycling**. A mature waterfall is not a one-way cascade. Investment yield funds a second business; the trust that holds permanent capital lends to the real estate company on a documented note (Chapter 7); refinancing proceeds from the property company are redeployed into the next acquisition (Chapter 9); insurance cash value is borrowed against to bridge a liquidity gap and repaid. Capital moves upward as well as down, but every upward move is a **transaction with tax and legal consequences** — a loan with interest, a capital contribution that changes ownership percentages, a distribution that may be taxable — and the families who do this well document each one as if a stranger were on the other side. The ones who do it badly treat the pools as a single checking account and discover, in litigation or audit, that the veil between their entities was never there.',
      'Here the popular literature needs correcting, because the waterfall is often sold under the name of a single family. The documented history is this: John D. Rockefeller Sr. built Standard Oil from 1870; the Supreme Court dissolved it under the Sherman Act in 1911; his fortune at its peak was, by most estimates, the largest in American history. John D. Rockefeller Jr. established substantial **trusts for his children in 1934** and for his grandchildren in 1952, administered by professional trustees, with distribution standards that kept principal intact for decades. The family established what was effectively one of the first **single-family offices** — "Room 5600" at Rockefeller Center — to manage investments, philanthropy, tax and the family\'s affairs across branches. Those three facts — trusts, professional management, a governance body — are real and are the reason the family\'s capital still exists six generations on.',
      'The "**Rockefeller Method**" as marketed today adds a fourth element: a program of permanent life insurance on each family member, owned by a trust, whose death benefits replenish the trust each generation, with the trust acting as a family bank that lends to members. Popular books and seminars present this as the Rockefeller secret. I have not seen primary evidence that it was central to the family\'s strategy; the archival record supports trusts, a family office, careful philanthropy and extraordinary early-stage returns on a single business far more than it supports an insurance program. The framing survives because it is useful to the people selling the policies, and because the underlying components are, in fact, sound.',
      'So let us separate what is sound from what is overstated. **Sound**: holding family capital in long-term trusts with professional trustees (permanent capital); maintaining liquidity so that illiquid assets are never sold under duress; **life insurance as a liquidity event at death** that lands outside the estate when owned by an irrevocable trust (Chapter 10); a family lending function with real documentation (Chapter 7); and a governance body that outlives any individual (Chapter 14). **Overstated**: that insurance "replaces" the fortune each generation (a death benefit is a known sum bought with premiums that had an opportunity cost; it is liquidity, not growth); that policy loans are a cost-free source of capital (they are debt against cash value, accruing interest); and that any of this makes a family wealthy without a first pool that produced extraordinary returns — Standard Oil did the work that the trusts preserved. The structures preserve capital; they do not create it.',
      'The tax architecture of the waterfall is where professionals spend their time. Moving capital **down** the waterfall into permanent capital is a **gift** when the recipient is a trust for descendants, reported on Form 709, consuming lifetime exemption, and requiring GST exemption allocation if the trust will skip generations. Moving capital **across** — selling a business interest to buy property — is a **realisation event** with capital gains unless a non-recognition provision applies. Moving capital **up** as a loan is interest income and expense under the rules of the last chapter. Holding appreciated assets in the senior generation\'s pools until death delivers the **§1014 basis step-up** at the cost of estate inclusion; moving them to trusts early avoids inclusion at the cost of the step-up. Neither answer is right in general; the right answer depends on the asset\'s expected growth, the family\'s exemption position and how long the senior generation is likely to live. That tension — step-up versus freeze — is the single most common estate planning conversation I have.',
      'The last point is about the labor pool itself. In most families the first generation\'s earned income is the engine and also the single point of failure. Disability insurance, key-person insurance on the business, a documented succession plan for the operating company and a liquidity reserve sized to the estate\'s obligations are what let the waterfall keep running when the top pool stops. Families often fund the liquidity tier last because its return is lowest. That is backwards. Its return is lowest because its job is not return.',
    ],
    realWorldExample: {
      title: 'A dentist\'s waterfall over twenty-five years',
      body: [
        'A periodontist earns $600,000 a year from her practice and spends $300,000 after tax on her family. Her surplus is roughly $150,000 a year. She allocates it: 30% back into the practice (a second location, equipment), 25% into the buildings her practices occupy, 20% into index funds, 15% into a trust for her children, 10% into a reserve and a term life policy.',
        'Using the simulator\'s default assumptions — practice growth 10%, real estate 6%, investments 6.5%, trust assets 6%, reserve 2%, 25% of annual pool returns recycled through the same allocation, surplus growing 3% a year — the pools hold roughly **$2.3 million** after 10 years and about **$12.8 million** after 25. Of that 25-year figure, about $5.5 million is surplus she contributed and the remainder is growth and recycling. The practice tier is the largest pool and the reserve is the smallest; that is the point, not a flaw.',
        'Now change one thing. At year 12 she is disabled for 18 months. Without a reserve she sells index funds in a down market and takes a hardship distribution from the practice that starves the second location. With a reserve of eighteen months of obligations plus disability coverage, she sells nothing; the reserve refills over the following three years from the practice tier, and the waterfall is a few hundred thousand dollars behind where it would have been, instead of a few million.',
        'What the example omits is as important as what it shows: tax on each pool\'s return, the gift tax return she files each year for the trust contribution, the cost of the term policy, and the fact that a practice does not grow at 10% forever. The simulator lists each omission. Run it with lower numbers; the ordering of the pools matters more than the rates.',
      ],
    },
    misconception: {
      claim: '"The Rockefellers stayed rich because of whole life insurance owned by a trust that acted as a family bank — copy the method and your family will too."',
      reality: 'The documented Rockefeller strategy was extraordinary returns on one business (Standard Oil), followed by professionally administered trusts (1934, 1952), a family office and disciplined philanthropy. Life insurance may have played a role in liquidity planning, as it does for most large estates, but the archival record does not support it as the engine of the fortune. The sound components — permanent capital in trusts, liquidity at death, a documented lending function, governance — are real and apply to any family. Insurance is one of them, as liquidity rather than growth, and it carries a cost drag that the marketing omits.',
      confidence: 'amber',
    },
    professionalExplanation: [
      'The waterfall is a planning frame, and the professional\'s job is to price each boundary between pools. **Labor to business**: capital contributions to an entity are generally non-taxable under §351 (corporations) or §721 (partnerships), but they change ownership percentages and may need updated operating agreements and valuations. **Business to real estate**: if the property is bought by a separate property company and leased back to the operating company, the rent is deductible to one and income to the other, the lease must be at market, and the self-rental rule under the §469 regulations recharacterises net rental income from a related operating business as non-passive — a trap for people who expected passive losses to offset it.',
      '**Any pool to permanent capital** is a gift unless it is a sale for a note. The adviser models whether to gift (using exemption, no step-up at death, growth outside the estate) or to hold (step-up under §1014, growth inside the estate) asset by asset. High-growth, low-basis assets are usually the gift candidates; low-growth, low-basis assets are usually held for the step-up. GST exemption allocation on Form 709 is deliberate, and a dynasty trust with an inclusion ratio above zero should be corrected while it is still cheap to do so. State estate and inheritance taxes, where they exist, change the calculus and are frequently forgotten by families who moved.',
      '**The liquidity pool** has its own tax logic. Cash earns taxable interest. Permanent life insurance accumulates cash value tax-deferred under §7702 and pays a death benefit excluded from income under §101(a), but premiums are not deductible and the policy\'s internal costs are real; policy loans are debt and, if the policy lapses with a loan outstanding, the gain is taxable. Owning the policy in an irrevocable trust keeps the proceeds outside the estate under §2042 if the insured holds no incidents of ownership; Chapter 10 covers the mechanics. The adviser\'s question is simply: how much liquidity will the estate need at death and at the other foreseeable shocks, and what is the cheapest reliable way to have it there?',
      'Professionals are required at each boundary: a CPA to model the realisation events and file Forms 709; estate counsel to draft the trusts receiving permanent capital and to allocate GST exemption; a fee-only insurance adviser to size the liquidity tier without a product bias; an investment adviser under a written investment policy statement for the marketable pool and, under the Uniform Prudent Investor Act as adopted in the relevant state, for trust assets. And the family needs a governance forum — an annual meeting at minimum — where the allocation of this year\'s overflow is a decision rather than an accident.',
    ],
    knowledgeCheck: [
      {
        id: 'ch08-q1',
        prompt: 'In the family capital waterfall, what is the primary job of the insurance and liquidity reserve tier?',
        options: [
          'To produce the highest risk-adjusted return in the family balance sheet.',
          'To ensure that illiquid pools above it (business, real estate, trusts) are never sold under duress when the labor pool stops or a shock hits.',
          'To replace the family\'s fortune each generation through death benefits.',
          'To avoid income tax on investment returns.',
        ],
        answer: 1,
        explanation: 'The liquidity tier has the lowest expected return by design. Its value is sequencing protection: estate taxes, lawsuits, disability and death are paid from it rather than by selling a business or property at the wrong moment.',
      },
      {
        id: 'ch08-q2',
        prompt: 'Which of the following is well documented about the Rockefeller family\'s wealth preservation?',
        options: [
          'A program of whole life insurance on every family member was the main engine of the fortune\'s survival.',
          'Trusts established in 1934 and 1952 with professional trustees, a family office and disciplined philanthropy preserved capital created by Standard Oil.',
          'The family avoided all estate taxes through offshore trusts.',
          'The family bank lent to members at zero interest.',
        ],
        answer: 1,
        explanation: 'The archival record supports extraordinary returns from one business, followed by long-term trusts, a family office and philanthropy. The insurance-centred "Rockefeller Method" is a modern marketing framing; its components (liquidity at death, permanent capital, a lending function) are sound in themselves but were not the source of the wealth.',
      },
      {
        id: 'ch08-q3',
        prompt: 'A founder is deciding whether to gift a high-growth, low-basis business interest to a dynasty trust now or hold it until death. What is the central trade-off?',
        options: [
          'Gifting avoids all tax; holding is always worse.',
          'Gifting removes future growth from the estate but forfeits the §1014 basis step-up; holding gets the step-up but includes all growth in the estate.',
          'Holding avoids gift tax returns; gifting requires selling the business.',
          'There is no difference because the trust is a grantor trust.',
        ],
        answer: 1,
        explanation: 'The freeze-versus-step-up decision depends on expected growth, the family\'s exemption position, state taxes and life expectancy. High-growth assets are usually the gift candidates; low-growth, low-basis assets are often held for the step-up. It is asset-by-asset analysis, not a rule.',
      },
      {
        id: 'ch08-q4',
        prompt: 'The operating company pays rent to a sister property company owned by the same family. Which tax point applies?',
        options: [
          'The rent is ignored because the companies have common ownership.',
          'The rent must be at market, is deductible to the operating company and income to the property company, and net rental income from a related operating business is recharacterised as non-passive under the §469 self-rental rule.',
          'The rent is a gift from the operating company to the property company.',
          'The property company may deduct the rent it receives.',
        ],
        answer: 1,
        explanation: 'Property-company separation is a legitimate structure for liability and financing reasons, but intercompany rent is real income and expense and the self-rental rule prevents using that income to absorb passive losses from other activities.',
      },
      {
        id: 'ch08-q5',
        prompt: 'What does "recycling capital upward" in the waterfall mean, and what does it require?',
        options: [
          'Spending investment gains on consumption; it requires nothing.',
          'Redeploying returns from lower pools (investments, trusts, insurance cash value) into higher-return pools (new ventures, property) through documented transactions — loans at the AFR, capital contributions, refinancing — each with its own tax and legal consequences.',
          'Transferring money between entities freely because they share an owner.',
          'Borrowing against a life policy with no obligation to repay.',
        ],
        answer: 1,
        explanation: 'A mature waterfall moves capital in both directions, but every upward move is a transaction between separate legal persons. Documentation is what preserves the separateness of the pools; informality is what collapses it.',
      },
    ],
    caseStudy: {
      title: 'The Adeyemi-Castellanos Waterfall',
      family: 'Tunde Adeyemi (orthopaedic surgeon) and Marisol Castellanos (owner of a specialty food distribution business) in Phoenix; combined earned income about $1.4 million; three children aged 9 to 16.',
      situation: 'At 44 they had a large income, a large mortgage, two businesses that depended entirely on them, a brokerage account, and no plan. Marisol\'s business had just been offered a warehouse to buy. Tunde\'s practice group was discussing a surgery center. They were about to fund both from the brokerage account and personal guarantees, which would have emptied the only liquid pool they had.',
      structure: 'They mapped their waterfall. Labor surplus of about $450,000 a year was allocated by a written one-page family capital policy: 35% to the two businesses (through capital contributions to the respective entities, with updated operating agreements), 25% to a property LLC that bought the warehouse with 65% bank debt and leased it to the distribution company at an appraised market rent, 15% to marketable investments, 15% to a GST-exempt trust in a directed-trust state funded with gifts of non-voting units in the distribution company, and 10% to a reserve equal to eighteen months of fixed obligations, alongside term life and disability coverage on both. The trust later lent to the property LLC on a documented note at the AFR to fund a second building. An ILIT was added in year four when the estate projection first showed a transfer-tax gap.',
      outcome: 'Eight years on, the distribution business has tripled, the warehouse has been refinanced once (proceeds redeployed into the second building, not consumed), and the trust owns 40% of the distribution company at a value that was reported on Form 709 as a fraction of today\'s number. When Tunde needed a nine-month leave after a car accident, the reserve carried the household and no pool was sold. The family capital policy has been amended twice at their annual meeting; the children attend the meeting and the sixteen-year-old presented the investment pool\'s performance last year.',
      lesson: 'The couple\'s instinct — fund both opportunities from the brokerage account and personal guarantees — would have given them two illiquid assets and no reserve at exactly the moment a shock arrived. The waterfall did not change the opportunities; it changed the order of funding and insisted on documentation at every boundary. The one-page policy did more work than any single entity in the structure.',
    },
    terminology: [
      { term: 'Family capital', definition: 'The aggregate of a family\'s financial pools — business, real estate, investments, permanent capital, liquidity — governed as a single multi-generational balance sheet.' },
      { term: 'Permanent capital', definition: 'Assets held in long-term trusts or similar vehicles with restricted spending, intended to compound across generations rather than be consumed by the current one.' },
      { term: 'Liquidity reserve', definition: 'Cash, committed credit and insurance cash values held so that illiquid assets need not be sold under duress; sized to foreseeable obligations rather than to return.' },
      { term: 'Sequencing risk', definition: 'The risk that the order in which shocks and cash needs arrive forces the sale of assets at unfavourable prices; mitigated by the liquidity tier rather than by returns.' },
      { term: 'Capital recycling', definition: 'Redeploying returns from one pool into another through documented transactions (loans, contributions, refinancing), as distinct from consumption.' },
      { term: 'Freeze vs step-up', definition: 'The estate planning trade-off between removing future growth from the estate by gifting now (no §1014 step-up) and holding until death for a basis step-up at the cost of estate inclusion.' },
      { term: 'Self-rental rule', definition: 'Treasury regulation under IRC §469 that recharacterises net rental income from property leased to a business in which the taxpayer materially participates as non-passive income.' },
      { term: 'Family office', definition: 'An organisation that manages a family\'s investments, tax, legal, philanthropic and administrative affairs; the Rockefeller family\'s office is an early documented example.' },
      { term: 'Investment policy statement', definition: 'A written statement of objectives, risk tolerance, allocation ranges and review process governing a pool of investments, required in substance of trustees under the Uniform Prudent Investor Act.' },
      { term: 'Single point of failure', definition: 'A person or asset whose loss stops the waterfall — typically the first generation\'s labor income or the founder\'s role in the business; addressed by insurance, succession planning and reserves.' },
    ],
    references: [
      { title: 'Standard Oil Co. of New Jersey v. United States', citation: '221 U.S. 1 (1911)', jurisdiction: 'United States (Supreme Court)', type: 'case', note: 'Dissolution of the Standard Oil trust under the Sherman Act; the documented origin of the Rockefeller fortune\'s structure.' },
      { title: 'Titan: The Life of John D. Rockefeller, Sr.', citation: 'Ron Chernow (Random House, 1998)', jurisdiction: 'United States', type: 'book', note: 'Authoritative biography covering Standard Oil, the 1934 trusts and the family office.' },
      { title: 'Rockefeller Archive Center — family and office records', citation: 'Rockefeller Archive Center, Sleepy Hollow, NY', jurisdiction: 'United States', type: 'research', url: 'https://rockarch.org', note: 'Primary sources on the family\'s trusts, philanthropy and the family office.' },
      { title: 'Basis of property acquired from a decedent', citation: '26 U.S.C. § 1014', jurisdiction: 'United States (federal)', type: 'statute', note: 'The basis step-up at death at the heart of the freeze-versus-hold decision.' },
      { title: 'Tax on generation-skipping transfers', citation: '26 U.S.C. §§ 2601–2664 (Chapter 13)', jurisdiction: 'United States (federal)', type: 'statute', note: 'GST exemption allocation for permanent capital trusts.' },
      { title: 'Passive activity losses and credits limited — self-rental recharacterisation', citation: '26 U.S.C. § 469; Treas. Reg. § 1.469-2(f)(6)', jurisdiction: 'United States (federal)', type: 'regulation', note: 'Treatment of rent from property leased to a related operating business.' },
      { title: 'Uniform Prudent Investor Act', citation: 'UPIA (1994), as enacted by adopting states', jurisdiction: 'United States (state law; model act)', type: 'statute', note: 'Standard of care for investing trust assets held as permanent capital.' },
      { title: 'Certain death benefits; life insurance contract defined', citation: '26 U.S.C. §§ 101(a), 7702', jurisdiction: 'United States (federal)', type: 'statute', note: 'Income tax treatment of death benefits and the definition that governs cash-value accumulation.' },
    ],
    takeaways: [
      'Family wealth is a sequence of pools — labor, business, real estate, investments, permanent capital, liquidity — and the order protects against sequencing risk more than any rate of return does.',
      'The liquidity tier earns the least and matters most: its job is to make sure nothing above it is ever sold under duress.',
      'Every move of capital between pools is a transaction — gift, sale, loan, contribution — with its own tax and legal consequences; documentation at each boundary is what keeps the pools legally separate.',
      'The Rockefeller record supports trusts, a family office and governance built on an extraordinary first business; the insurance-centred "method" is a modern framing whose components are sound as liquidity, not as the source of wealth.',
      'Decide the allocation of this year\'s overflow deliberately, in a written policy, at a meeting the next generation attends.',
    ],
  },
  Diagram,
  Simulator,
};

export default mod;
