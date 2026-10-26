import type { ChapterModule } from '@/types/content';
import { CHAPTERS } from '../manifest';
import Diagram from './Diagram';
import Simulator from './Simulator';

const meta = CHAPTERS.find((c) => c.id === 'ch11')!;

const mod: ChapterModule = {
  content: {
    id: meta.id,
    number: meta.number,
    slug: meta.slug,
    title: meta.title,
    subtitle: 'Where a claim can reach, where it stops, and the handful of habits that quietly dismantle the fences.',
    objectives: ['asset-protection', 'governance', 'estate-planning'],
    duration: meta.duration,
    hook: 'A structure is only as strong as the worst thing its owner did with it on an ordinary Tuesday.',
    concept: [
      'Start with the only distinction that matters in domestic asset protection: **inside liability versus outside liability**. An inside claim arises inside an entity: a tenant falls on a stairway owned by the property LLC, a delivery driver employed by the operating company hits a pedestrian. The entity is the defendant, and its assets are on the table. The limited liability shield keeps that claim from climbing up to the owner, assuming the entity has been run as a real entity. An outside claim arises against the owner personally: a car accident on holiday, a guarantee, a divorce, a malpractice judgment. Now the creditor wants to go down into the entity to take what the owner owns there. Every tool in this chapter is a fence on one of those two paths, and most planning failures come from building a beautiful fence on the wrong path.',
      'The fence on the downward path is the **charging order**. When a judgment creditor of an LLC member asks a court for relief, the statute in every state gives a charging order: a lien on distributions the LLC would otherwise make to the debtor-member. The creditor gets no vote, no management right, no ability to force a sale of the LLC\'s assets. In practice the manager simply does not distribute, and the creditor sits with a lien that may pay nothing for years, which is powerful settlement leverage. The variation is in what happens next. **Wyoming, Nevada and Delaware** make the charging order the *exclusive* remedy, and Wyoming and Nevada extend that explicitly to single-member LLCs. Most states that follow the uniform acts allow a court to **foreclose** on the charged interest if distributions will not satisfy the judgment in a reasonable time, which converts the creditor into an assignee of the economic interest. That is still not control, but it is a sale.',
      'The **single-member LLC** is where the theory meets its limit. The charging order exists to protect the other members, the people who did not sign up to be partners with a stranger. If there are no other members, what is being protected? In *Olmstead v. FTC* (Fla. 2010) the Florida Supreme Court let a creditor take the whole membership interest in a single-member LLC, and the legislature responded by writing a specific foreclosure path for single-member LLCs into the statute. In *In re Albright* (Bankr. D. Colo. 2003) a bankruptcy trustee stepped into the sole member\'s shoes and simply ran the LLC. I have watched a lot of owners discover these cases after they needed them. If an LLC is meant to protect against your own creditors, it wants a second member with a genuine economic interest, a real operating agreement, and ideally formation in a state whose statute protects single-member interests by its terms.',
      'The **domestic asset protection trust** is the fence everyone wants and few understand. Alaska opened the door in 1997, Delaware, Nevada and South Dakota followed, and today roughly twenty states let a settlor create a trust for his or her own benefit that creditors cannot reach after a seasoning period, typically two to four years. Inside those states, with a local trustee and local administration, the statutes largely work as written. The problem is **residents of other states**. The settlor who lives in California and funds a Nevada DAPT is asking a California court, or a federal bankruptcy court applying California policy, to honor a choice-of-law clause that defeats California\'s long-standing rule against self-settled spendthrift trusts. *In re Huber* (Bankr. W.D. Wash. 2013) refused, applying the Restatement\'s conflict-of-laws test and the settlor\'s home-state policy, then voided the transfers as fraudulent for good measure. *Toni 1 Trust v. Wacker* (Alaska 2018) added the other half: Alaska cannot by statute strip other states\' courts of jurisdiction over fraudulent-transfer claims against Alaska trusts. A DAPT for a non-resident is a probability, not a wall. It still changes the negotiation. It does not end it.',
      'All of this sits under **voidable transfer law**. The Uniform Voidable Transactions Act (previously the Uniform Fraudulent Transfer Act) lets a creditor unwind transfers made with actual intent to hinder, delay or defraud, proven through the familiar badges of fraud: transfer to an insider, retained control, concealment, transfer after suit was threatened, transfer of substantially all assets, insolvency. It also unwinds constructively fraudulent transfers made for less than reasonably equivalent value while insolvent, with no intent required. The limitation period is typically four years. In bankruptcy, 11 U.S.C. §548 gives the trustee two years, and **§548(e)** gives ten years for transfers to self-settled trusts made with actual intent. Every protective structure in this chapter assumes the transfer into it was *not* voidable, which means it was made while solvent, for legitimate planning reasons, before any claim was foreseeable, and documented as such. Solvency analyses signed at funding are not paranoia; they are the evidence you will want later.',
      'Then there are the fences you did not have to build. **Tenancy by the entirety**, available in about half the states, shields a married couple\'s jointly held property from the creditors of one spouse alone; it is lost at divorce or the first death and does not stop joint creditors or the IRS (*United States v. Craft*). **Homestead** protection runs from unlimited in Florida and Texas, subject to acreage limits, to a few thousand dollars elsewhere, and the Bankruptcy Code caps it for recently acquired interests. **ERISA-governed retirement plans** carry an anti-alienation rule that courts honor in and out of bankruptcy (*Patterson v. Shumate*); IRAs are protected in bankruptcy up to an inflation-adjusted cap, with rollovers uncapped, but outside bankruptcy they depend on state exemptions. These are cheap, well-tested, and they should be filled before anything exotic is purchased.',
      'And before any of it, **insurance**. A judgment creditor with a policy to collect from rarely needs to test your structure. Liability and umbrella coverage pay defense costs and settle claims at a fraction of what the same claim costs an uninsured defendant in legal fees alone. The families I have seen hurt worst were not the ones without trusts; they were the ones with a two-million-dollar umbrella facing an eight-million-dollar claim and an LLC whose bank account also paid the children\'s school fees.',
      'Which brings us to what actually undermines protection, because it is almost never the law. It is **commingling**, an owner who treats the entity\'s account as a wallet. It is **personal guarantees**, signed because the bank asked and never renegotiated as equity grew. It is **undercapitalization**, an operating company that could never pay a judgment and so invites an alter-ego argument. It is **bad documentation**: no operating agreement, no minutes, leases between related entities that exist only in someone\'s head. And it is **timing**: the call that comes after the letter from opposing counsel, asking what can be moved now. The honest answer is that very little can, and that trying usually makes things worse.',
    ],
    realWorldExample: {
      title: 'Two orthodontists, one lawsuit, two outcomes',
      body: [
        'Consider two practitioners with similar economics: a practice worth about $2.4 million, a building worth $1.8 million with $900,000 of mortgage debt, a home worth $1.1 million, $1.6 million in a brokerage account and $900,000 in a 401(k). Each faces a malpractice claim that settles at $3.5 million after a bad outcome and a sympathetic plaintiff.',
        'The first holds the practice in a professional LLC and the building in a separate LLC owned 50/50 with a spouse. Malpractice cover is $3 million with a $5 million umbrella layered above it. The building is leased to the practice at a documented market rent, the mortgage is non-recourse to the owners, and the home is held as tenants by the entirety in a state that recognizes it. Insurance pays the full $3.5 million. The structure is never tested.',
        'The second holds the practice as a sole proprietor, the building in a single-member LLC with a personally guaranteed mortgage, and carries $1 million of malpractice cover with no umbrella. The practice assets are directly exposed because there is no entity. The $2.5 million uncovered balance is a personal judgment. The brokerage account is levied first. The home is not tenancy by the entirety and the state homestead cap is $75,000, so the equity above that is reachable. The building LLC is single-member in a state that permits foreclosure of the charged interest, and the lender\'s guarantee independently puts the owner on the hook if the building is sold under pressure. The 401(k) survives because ERISA protects it. Net result: roughly $2.4 million of the $2.5 million shortfall is collected, and the $4,000 a year the umbrella would have cost looks like the best investment the second orthodontist never made.',
      ],
    },
    misconception: {
      claim: 'Putting assets in an LLC protects them from my personal creditors.',
      reality: 'An LLC protects you from the entity\'s creditors (inside liability). Against your own creditors it offers only the charging order, whose strength varies by state and collapses for single-member LLCs in many jurisdictions. Commingling, guarantees and transfers made after a claim arises undermine even the strongest statute.',
      confidence: 'red',
    },
    professionalExplanation: [
      'The analysis an asset protection attorney actually performs begins with a **liability inventory**, not a structure menu. What are the realistic sources of claims: professional practice, operating business, rental property, teenage drivers, boards you sit on, guarantees you have signed? What is the plausible size of each? Only then does the conversation turn to layers: insurance limits first, exempt assets second (retirement plans, homestead, tenancy by the entirety, in some states cash-value life insurance and annuities), entity separation third, trusts last. Every layer costs something in complexity and tax friction, and each one is justified only by the exposure the layers beneath it cannot absorb.',
      'The **tax questions** are real even though asset protection is not a tax strategy. A multi-member LLC is a partnership for income tax unless it elects otherwise, which means a Form 1065, K-1s and the question of whether the second member\'s interest is genuine or a sham for tax as well as creditor purposes. A domestic asset protection trust is almost always drafted as a grantor trust, so the settlor keeps paying income tax on trust income, and the completed-gift versus incomplete-gift question decides whether funding uses lifetime exemption and whether the assets are included in the settlor\'s estate under IRC §§2036 and 2038. Transfers between spouses to create tenancy by the entirety are generally gift-tax neutral under the marital deduction, but moving appreciated assets into entities can trigger §721 or §351 questions and later affect basis step-up. None of this is a reason not to plan; all of it is a reason the tax adviser sits at the same table as the asset protection lawyer.',
      'When are **professionals required**? Forming a single LLC for a rental property and buying an umbrella policy is well within what a careful owner can do with a competent accountant and insurance broker. Anything involving a self-settled trust, a choice of law different from the settlor\'s residence, transfers while any dispute is live, a business with employees or professional liability, or assets above the family\'s insurance capacity calls for an attorney who practices asset protection specifically, not a generalist. The solvency affidavit, the operating agreements with real economic terms, and the conflict-of-laws memo are the deliverables you are paying for. If an adviser will not discuss voidable-transfer risk and timing in the first meeting, find another one.',
      'A final observation from practice. The structures that hold up in litigation are the boring ones: entities with their own bank accounts, leases at market rent, minutes that exist, capital that matches the business, and insurance renewed every year. The structures that fail are usually the elaborate ones built in a hurry. Judges read motive from timing, and no statute changes that.',
    ],
    knowledgeCheck: [
      {
        id: 'ch11-q1',
        prompt: 'A customer slips in a store owned by your operating LLC and sues. This is best described as:',
        options: ['An outside liability claim that threatens your personal assets directly', 'An inside liability claim that reaches the LLC\'s assets; the entity shield keeps it from your personal assets if formalities were observed', 'A claim the charging order will defeat', 'A claim your DAPT would block'],
        answer: 1,
        explanation: 'The claim arises inside the entity, so the LLC is the defendant and its assets are exposed. The limited-liability shield, not the charging order, protects the owner, and only if the entity was run as a genuinely separate business.',
      },
      {
        id: 'ch11-q2',
        prompt: 'Why did the courts in Olmstead (Fla.) and Albright (Bankr. D. Colo.) refuse to limit creditors to a charging order against a single-member LLC?',
        options: ['Because LLCs do not exist in Florida or Colorado bankruptcy law', 'Because the charging order exists to protect co-members, and a single-member LLC has none to protect', 'Because the debtors had committed fraud', 'Because single-member LLCs are taxed as disregarded entities'],
        answer: 1,
        explanation: 'Both courts reasoned that the charging order remedy protects innocent co-owners from an unwanted partner. With no other members, that rationale disappears, so the creditor (or bankruptcy trustee) could take the entire interest.',
      },
      {
        id: 'ch11-q3',
        prompt: 'A Washington resident funds a Nevada domestic asset protection trust. The main legal risk is:',
        options: ['Nevada will tax the trust', 'The trust will be treated as a foreign trust for reporting', 'A court applying Washington\'s public policy against self-settled spendthrift trusts may disregard the Nevada choice of law, as in In re Huber', 'The Nevada seasoning period is too long'],
        answer: 2,
        explanation: 'In re Huber applied the settlor\'s home-state law under conflict-of-laws principles and voided the trust. A DAPT for a resident of a non-DAPT state is uncertain protection, not a reliable barrier.',
      },
      {
        id: 'ch11-q4',
        prompt: 'Under 11 U.S.C. §548(e), how far back can a bankruptcy trustee reach to avoid a transfer to a self-settled trust made with actual intent to hinder, delay or defraud?',
        options: ['Two years', 'Four years', 'Six years', 'Ten years'],
        answer: 3,
        explanation: 'The general §548 lookback is two years, but §548(e) extends it to ten years specifically for transfers to self-settled trusts or similar devices made with actual intent. This is why timing and solvency documentation at funding matter so much.',
      },
      {
        id: 'ch11-q5',
        prompt: 'Which of the following most reliably undermines an otherwise sound entity structure?',
        options: ['Choosing a state with a 4-year DAPT seasoning period instead of 2', 'Paying personal expenses from the entity account and skipping operating agreements and minutes', 'Owning the LLC with a spouse rather than alone', 'Buying more insurance than the structure needs'],
        answer: 1,
        explanation: 'Commingling and ignored formalities are the classic alter-ego / veil-piercing facts. Courts treat an entity as separate only when its owner did.',
      },
    ],
    caseStudy: {
      title: 'The Okafor Family: a good structure, built late',
      family: 'The Okafors — Daniel (58), a commercial contractor, his wife Grace (56), and three adult children.',
      situation: 'Daniel built a $14 million construction business over thirty years, operating through a single S corporation that also owned two warehouses and his equipment fleet. He personally guaranteed the company\'s $6 million credit line. In year 29 a crane collapse injured four workers from a subcontractor; the suit named the company and Daniel personally, alleging negligent supervision. Six weeks after receiving the complaint, Daniel formed three new LLCs, deeded the warehouses to them, and funded a Nevada asset protection trust with $4 million of marketable securities. He lived in Illinois.',
      structure: 'Post-complaint structure: operating S corp (now asset-light), two warehouse LLCs (single-member, Daniel), equipment LLC, Nevada DAPT with an Illinois settlor and an institutional Nevada trustee. Insurance: $5 million general liability, $5 million umbrella, both in force before the accident.',
      outcome: 'The plaintiffs\' counsel noticed the recording dates within a week. The warehouse transfers and the trust funding were challenged as voidable under the Illinois UFTA with every badge of fraud present: insider transferees, retained control, transfers after suit, substantially all non-operating assets moved. The court entered a preliminary injunction freezing the trust assets pending trial. The case settled at $11 million, with insurance paying $10 million and Daniel contributing $1 million from the frozen securities, plus roughly $600,000 in legal fees for the voidable-transfer fight. The lender separately tightened the credit line under the guarantee\'s material-adverse-change clause. The new LLCs survived and, run properly afterwards, serve the family well today.',
      lesson: 'Nothing Daniel built was wrong. All of it was late. The identical structure, created in year 10 with solvency documented and genuine business reasons recorded, would have changed the settlement conversation entirely. Asset protection is a planning discipline, not an emergency procedure, and courts read motive from the calendar.',
    },
    terminology: [
      { term: 'Inside liability', definition: 'A claim arising from an entity\'s own activities (its tenants, customers, employees), for which the entity is the defendant and its assets are exposed.' },
      { term: 'Outside liability', definition: 'A claim against the owner personally; the creditor seeks to reach the owner\'s interests in entities and trusts.' },
      { term: 'Charging order', definition: 'A court order giving a judgment creditor a lien on distributions owed to a debtor-member of an LLC or partnership, without management rights.' },
      { term: 'Exclusive remedy statute', definition: 'A state LLC statute providing that the charging order is the sole remedy of a member\'s creditor, barring foreclosure or other relief (e.g., Wyoming, Nevada, Delaware).' },
      { term: 'Foreclosure of a charged interest', definition: 'Judicial sale of a debtor-member\'s economic interest when distributions will not satisfy the judgment in a reasonable time; permitted in many uniform-act states.' },
      { term: 'Domestic asset protection trust (DAPT)', definition: 'A self-settled irrevocable trust, authorized by statute in roughly twenty states, that shields trust assets from the settlor\'s own creditors after a seasoning period.' },
      { term: 'Self-settled spendthrift trust', definition: 'A trust whose settlor is also a beneficiary with a spendthrift clause; traditionally unenforceable against the settlor\'s creditors outside DAPT states.' },
      { term: 'Voidable (fraudulent) transfer', definition: 'A transfer made with actual intent to hinder, delay or defraud creditors, or for less than reasonably equivalent value while insolvent, which a creditor can unwind under the UVTA/UFTA or Bankruptcy Code §548.' },
      { term: 'Badges of fraud', definition: 'Circumstantial factors courts use to infer intent: insider transferee, retained control, concealment, transfer after suit threatened, insolvency, transfer of substantially all assets.' },
      { term: 'Tenancy by the entirety', definition: 'A form of marital co-ownership in about half the states under which creditors of one spouse alone cannot reach the property.' },
      { term: 'Alter ego / veil piercing', definition: 'Doctrine under which a court disregards an entity and holds its owner liable, typically where the entity was undercapitalized, commingled or used as the owner\'s instrumentality.' },
      { term: 'Seasoning period', definition: 'The statutory waiting period (commonly 2–4 years) after funding a DAPT before the protection against pre-existing creditors becomes effective.' },
    ],
    references: [
      { title: 'Olmstead v. Federal Trade Commission', citation: '44 So. 3d 76 (Fla. 2010)', jurisdiction: 'Florida', type: 'case', note: 'Charging order not the exclusive remedy against a single-member LLC; led to amendment of Fla. Stat. §605.0503.' },
      { title: 'In re Albright', citation: '291 B.R. 538 (Bankr. D. Colo. 2003)', jurisdiction: 'United States (Bankr. D. Colo.)', type: 'case', note: 'Bankruptcy trustee succeeded to all rights of the sole member of a single-member LLC.' },
      { title: 'In re Huber', citation: '493 B.R. 798 (Bankr. W.D. Wash. 2013)', jurisdiction: 'United States (Bankr. W.D. Wash.)', type: 'case', note: 'Alaska DAPT of a Washington settlor disregarded under conflict-of-laws principles and avoided as a fraudulent transfer, including under §548(e).' },
      { title: 'Toni 1 Trust v. Wacker', citation: '413 P.3d 1199 (Alaska 2018)', jurisdiction: 'Alaska', type: 'case', note: 'Alaska statute could not confer exclusive jurisdiction on Alaska courts over fraudulent-transfer claims against Alaska trusts.' },
      { title: 'Bankruptcy Code — fraudulent transfers and obligations', citation: '11 U.S.C. § 548, incl. § 548(e) ten-year lookback for self-settled trusts', jurisdiction: 'United States', type: 'statute' },
      { title: 'Uniform Voidable Transactions Act (2014), formerly Uniform Fraudulent Transfer Act (1984)', jurisdiction: 'United States (uniform act adopted by most states)', type: 'statute', note: 'Actual-intent and constructive-fraud grounds; badges of fraud in §4(b); limitation period in §9.' },
      { title: 'Wyoming Limited Liability Company Act — charging order as exclusive remedy', citation: 'Wyo. Stat. § 17-29-503', jurisdiction: 'Wyoming', type: 'statute', note: 'Extends exclusive-remedy treatment to single-member LLCs.' },
      { title: 'Patterson v. Shumate', citation: '504 U.S. 753 (1992)', jurisdiction: 'United States (Supreme Court)', type: 'case', note: 'ERISA anti-alienation provision excludes plan benefits from the bankruptcy estate.' },
      { title: 'United States v. Craft', citation: '535 U.S. 274 (2002)', jurisdiction: 'United States (Supreme Court)', type: 'case', note: 'Federal tax lien attaches to a spouse\'s interest in tenancy-by-the-entirety property.' },
    ],
    takeaways: [
      'Separate inside liability (claims arising inside an entity) from outside liability (claims against you personally); each needs a different fence.',
      'The charging order is the only protection an LLC gives against your own creditors, and it is weakest for single-member LLCs outside exclusive-remedy states like Wyoming, Nevada and Delaware.',
      'Domestic asset protection trusts work best for residents of the enacting state; for everyone else they are a probability shaped by conflict-of-laws doctrine, not a wall.',
      'Voidable-transfer law and the ten-year §548(e) bankruptcy lookback make timing and documented solvency the foundation under every structure.',
      'Insurance, exempt assets (retirement plans, homestead, tenancy by the entirety) and boring discipline (separate accounts, real agreements, no casual guarantees) do more protective work than anything exotic.',
    ],
  },
  Diagram,
  Simulator,
};

export default mod;
