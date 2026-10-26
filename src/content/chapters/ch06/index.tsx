import type { ChapterModule } from '@/types/content';
import { CHAPTERS } from '../manifest';
import Diagram from './Diagram';
import Simulator from './Simulator';
import './styles.css';

const meta = CHAPTERS.find((c) => c.id === 'ch06')!;

const mod: ChapterModule = {
  content: {
    id: meta.id,
    number: meta.number,
    slug: meta.slug,
    title: meta.title,
    subtitle: 'Five parties, one relationship, and the three jobs a trust can do — but rarely all at once.',
    objectives: ['estate-planning', 'asset-protection', 'tax-planning', 'succession', 'governance'],
    duration: meta.duration,
    hook: 'A trust is not a box you put assets in. It is a relationship you build around them, and it is exactly as strong as the people in it.',
    concept: [
      'Strip away the mystique and a trust is a split of ownership. The **settlor** (grantor) transfers property to a **trustee**, who holds **legal title** and is bound by fiduciary duty to manage it for **beneficiaries**, who hold the **equitable interest**. The **trust assets** sit between those parties, owned by nobody in the ordinary sense. A fifth party, the **protector**, is optional and relatively new to domestic practice: someone who does not hold title and does not benefit, but who can remove and replace the trustee, veto certain decisions or move the trust to another jurisdiction. Every consequence a trust produces — for tax, for creditors, for succession — flows from how those five roles are allocated and how honestly they are respected in practice. The trusts I have seen fail did not fail on drafting. They failed because the settlor kept behaving as owner and the trustee let them.',
      'The first fork is **revocable versus irrevocable**. A revocable living trust is a will substitute: the settlor is usually the trustee and sole lifetime beneficiary, can amend or unwind it at any time, and the only real work it does is avoid probate and manage incapacity through a named successor trustee. Because the settlor retains the power to revoke, the assets remain in the gross estate under **IRC §2038** (and the retained enjoyment under §2036), the settlor\'s creditors can reach everything (Uniform Trust Code §505), and for income tax it is ignored entirely under **§676**. None of that makes a revocable trust useless — it is the right document for almost everyone with assets and a family — but it is not a tax or protection structure, and anyone selling it as one is confusing their client. An irrevocable trust gives something up. That surrender is the price of every benefit discussed below.',
      'The second fork is **grantor versus non-grantor** for income tax, governed by **IRC §§671–679**. A grantor trust is disregarded: the settlor reports all income on their own Form 1040 as if the trust did not exist. A non-grantor trust is a separate taxpayer filing Form 1041, hitting the top federal bracket at a few thousand dollars of retained income, passing income out to beneficiaries as **distributable net income** on Schedules K-1. The counter-intuitive part, and the engine of most sophisticated planning, is that grantor status and estate inclusion are tested under different rules. A trust can be a grantor trust because the settlor holds a §675(4)(C) power to substitute assets of equivalent value, while still being entirely outside the settlor\'s estate under §§2036–2038. The settlor then pays the trust\'s income tax from personal funds, which the IRS has confirmed is not an additional gift (Rev. Rul. 2004-64) so long as the trust is not obliged to reimburse. The trust compounds gross; the estate shrinks by the tax paid. Practitioners call this an intentionally defective grantor trust, and the "defect" is the whole point.',
      'The third fork is **discretionary versus fixed**. A fixed (mandatory) interest — "pay all income to my daughter annually" — is a property right. It is certain, predictable and easy to model, and because it is a property right her creditors, her ex-spouse and in some states her bankruptcy trustee can reach it once it is due. A **discretionary** interest gives the trustee the power to withhold entirely. Under UTC §504 a creditor cannot compel a distribution the beneficiary cannot compel. Add a **spendthrift clause** (UTC §502) and you have the classic protective design. Two warnings from experience: a trustee who distributes the same amount on the same date every year for a decade has, in the eyes of a litigator, converted a discretionary trust into a fixed one; and the standard carve-outs for child support, alimony and certain government claims survive almost every spendthrift clause in the country.',
      'The fourth fork is **domestic versus foreign**, and here the vocabulary is treacherous. For U.S. tax purposes a trust is domestic only if it passes both the **court test** (a U.S. court can exercise primary supervision over administration) and the **control test** (U.S. persons control all substantial decisions) of **IRC §7701(a)(30)(E)**, as elaborated in Treas. Reg. §301.7701-7. Fail either and it is foreign under §7701(a)(31)(B) — even if the assets are in Ohio. A foreign trust with a U.S. settlor and any U.S. beneficiary is a grantor trust under **§679** whether the settlor wants that or not. Transfers to, distributions from and ownership of foreign trusts are reported on **Form 3520**, the trust itself (or its U.S. owner by default) files **Form 3520-A**, and accumulated income distributed later to U.S. beneficiaries can trigger the throwback rules and interest charge of §§665–668. The penalties for missing those forms are a percentage of the amounts involved, not a flat fee. A foreign trust is more reporting, not less tax.',
      'Two structural refinements come from the states. **Directed trusts** (Delaware Code title 12 §3313, South Dakota Codified Laws chapter 55-1B, the Uniform Directed Trust Act adopted in a growing number of states) let the instrument split the trustee\'s job: an investment direction adviser — often the family — directs the trustee on the closely held business, a distribution adviser or committee handles beneficiaries, and the corporate trustee administers and keeps the books with its liability limited to following directions. **Dynasty trusts** rely on states that have repealed or extended the **rule against perpetuities** (Delaware, South Dakota, Nevada, Alaska, Wyoming among others), so a trust can run for centuries. The perpetuities statute is the easy part; what actually makes a dynasty trust work is allocating **generation-skipping transfer tax exemption** to it at funding so that every later distribution to grandchildren and beyond is GST-free. A perpetual trust with no GST exemption allocated is a perpetual tax problem.',
      'The **irrevocable life insurance trust** deserves its own mention because it is the most common irrevocable trust in American practice. The trust owns the policy; the insured holds no **incidents of ownership** under **§2042**; the death benefit lands outside the estate as cash, exactly when the estate needs cash. Premiums are typically funded by annual gifts that qualify for the gift tax annual exclusion through **Crummey withdrawal powers**, and a policy transferred into the trust rather than purchased by it is pulled back into the estate if death occurs within three years (§2035). Chapter 10 treats the insurance mechanics; the architectural point here is that an ILIT is a protection and liquidity tool first and a tax tool only in the sense that it keeps a large asset from ever entering the estate.',
      'Which brings us to the honest summary. A trust can be a **tax tool**, a **protection tool** or a **succession tool**, and the three pull in different directions. Grantor status is excellent for tax and irrelevant for protection. A self-settled trust that lets the settlor remain a beneficiary is attractive for comfort and weak for protection outside the handful of states with asset-protection trust statutes. A fixed interest is good for a beneficiary\'s certainty and bad for her protection. A dynasty trust is magnificent for succession and demands governance machinery the family may not have. The professional skill is not knowing the forms — anyone can learn the forms — it is forcing the family to say which objective comes first and to accept, in writing, what they are giving up to get it.',
    ],
    realWorldExample: {
      title: 'An intentionally defective grantor trust at work: ten years of tax burn',
      body: [
        'A founder owns 100% of an operating company appraised at $12 million. She creates an irrevocable trust in a directed-trust state for her two children, names an independent corporate trustee, and keeps only a §675(4)(C) power to swap assets of equivalent value. She gifts 30% of the company as non-voting units. The appraiser applies a 30% combined discount for lack of control and marketability, so the reported gift is $3.6M × 0.70 = **$2.52 million**, filed on Form 709 with adequate disclosure and GST exemption allocated.',
      'The trust then buys another 40% of the company from her for a nine-year promissory note at the applicable federal rate, say 4.0%. The note is $4.8M × 0.70 = **$3.36 million**. Because the trust is a grantor trust, the sale is ignored for income tax under Rev. Rul. 85-13 — no capital gain, no interest income to her. The company distributes roughly $1.2 million a year to its owners; 70% ($840,000) now lands in the trust, which pays her $134,400 of interest and amortises the note.',
        'The trust\'s share of taxable income is about $900,000 a year. At a blended 40% federal and state rate she pays roughly **$360,000 a year of income tax on the trust\'s income from her own pocket**. Over ten years that is $3.6 million moved to her children\'s trust with no gift tax, on top of the discounted gift and the frozen value of the note. If the company grows at 7% a year, the 70% held in trust is worth about $16.5 million at year ten; what remains in her estate is her 30% plus the note balance and the cash she did not spend on tax.',
        'The risks are real and worth naming. If she keeps treating the company\'s distributions as her own, or the trustee rubber-stamps her instructions, **§2036** can pull the whole trust back into her estate. If the appraisal is weak, the IRS can revalue the gift. If she dies while the note is outstanding, the note is in her estate and there is unresolved authority on whether the deferred gain springs to life. None of this is exotic; it is the standard checklist for the structure, and each line is a reason a lawyer, a CPA and a qualified appraiser are in the room.',
      ],
    },
    misconception: {
      claim: '"Put it in a trust and it is protected from creditors and out of your estate."',
      reality: 'A revocable trust does neither — the settlor\'s creditors reach everything and §2038 includes everything. An irrevocable trust removes assets from the estate only if the settlor gives up the retained interests and powers that §§2036–2038 target, and protects them from the settlor\'s own creditors only if the settlor is not a beneficiary (or the trust sits in a self-settled-trust state and survives that state\'s look-back and exception-creditor rules). Fraudulent transfer law applies to any transfer made while claims are foreseeable. The word "trust" on the document changes nothing by itself; the allocation of powers and the conduct of the parties change everything.',
      confidence: 'red',
    },
    professionalExplanation: [
      'The first professional question is always **who is the taxpayer**. For a grantor trust the answer is the settlor, reporting under the optional methods of Treas. Reg. §1.671-4 or via a Form 1041 with a grantor letter. For a non-grantor trust the answer is the trust for retained income and the beneficiaries for distributed income, with DNI, the 65-day election under §663(b), and the separate-share rule all affecting the split. State income tax is its own analysis: states tax trusts based on the residence of the settlor, trustee, beneficiaries or administration in different combinations, and the Supreme Court in *North Carolina Department of Revenue v. Kimberley Rice Kaestner 1992 Family Trust* (2019) held that beneficiary residence alone, with no distributions and no right to demand them, is not enough. Moving a trust\'s situs and trustee to a no-income-tax state is a legitimate and common planning step; whether it works depends on the origin state\'s rules.',
      'The second question is **what transfer taxes arise at funding**. A gift to an irrevocable trust is reported on Form 709; if the asset is hard to value, a qualified appraisal and the adequate-disclosure rules of Treas. Reg. §301.6501(c)-1(f) are what start the three-year statute of limitations running. GST exemption must be allocated deliberately (or the automatic allocation rules understood), because a dynasty trust with an inclusion ratio above zero is a mistake that compounds for a century. Sales to grantor trusts for notes require the note to be real debt at the applicable federal rate with genuine repayment — the same bona fide debt analysis Chapter 7 covers.',
      'The third question is **where the trust is for tax and where it is for law**, which are different. A trust governed by Nevada law with a Nevada trustee can still be a foreign trust if a non-U.S. protector holds a substantial decision, failing the control test. A Cook Islands trust with a U.S. settlor and U.S. children is a §679 grantor trust with Form 3520 and 3520-A obligations every year. Beneficial-ownership reporting regimes increasingly ask who ultimately controls an entity owned by a trust, and the answer is usually the trustee, the protector and sometimes the settlor; privacy is lawful, non-reporting is not.',
      'When are professionals required? Always for drafting — a trust instrument is a hundred small decisions about powers, and a template gets several of them wrong for any specific family. Always for funding hard-to-value assets (appraiser plus tax counsel). Always for foreign trusts (international tax CPA). For ILITs, an insurance professional who understands §2042 and Crummey mechanics. And, in my experience, a corporate or professional trustee for any trust meant to last beyond the settlor\'s life: family-member trustees are cheaper for about a decade and then become the most expensive decision in the structure.',
    ],
    knowledgeCheck: [
      {
        id: 'ch06-q1',
        prompt: 'A client\'s revocable living trust holds her brokerage account and home. Which statement is correct?',
        options: [
          'The assets are outside her gross estate because the trust is a separate legal arrangement.',
          'Her creditors cannot reach the assets because they are held by a trustee.',
          'The trust avoids probate and manages incapacity, but the assets remain in her estate and reachable by her creditors.',
          'The trust must file Form 1041 and pay tax at compressed trust brackets.',
        ],
        answer: 2,
        explanation: 'A revocable trust is included under IRC §2038 (retained power to revoke), is subject to the settlor\'s creditors under UTC §505, and is a grantor trust under §676 so it is ignored for income tax. Its value is probate avoidance and incapacity planning.',
      },
      {
        id: 'ch06-q2',
        prompt: 'Why can an irrevocable trust be a "grantor trust" for income tax while its assets are excluded from the settlor\'s estate?',
        options: [
          'Because grantor trusts are always excluded from the estate by statute.',
          'Because income tax grantor status (§§671–677) and estate inclusion (§§2036–2038) are tested under different rules, and powers like a §675(4)(C) swap power trigger the first without triggering the second.',
          'Because the trustee elects grantor status on Form 1041.',
          'It cannot; any grantor trust is included in the estate.',
        ],
        answer: 1,
        explanation: 'The two regimes are independent. Certain administrative powers make the settlor the income-tax owner without being retained interests or powers over enjoyment that cause estate inclusion. This mismatch is what makes an intentionally defective grantor trust work.',
      },
      {
        id: 'ch06-q3',
        prompt: 'A trust is governed by Delaware law, administered by a Delaware corporate trustee, but a non-U.S. protector holds the power to remove the trustee and direct distributions. For U.S. tax purposes the trust is most likely:',
        options: [
          'Domestic, because the trustee and governing law are in Delaware.',
          'Domestic, because the assets are in the United States.',
          'Foreign, because a non-U.S. person controls a substantial decision and the control test of §7701(a)(30)(E) is failed.',
          'Neither; protectors are ignored for classification.',
        ],
        answer: 2,
        explanation: 'Under Treas. Reg. §301.7701-7 the control test requires U.S. persons to control all substantial decisions, and the power to remove a trustee or direct distributions is a substantial decision. Failing either the court or control test makes the trust foreign under §7701(a)(31)(B), with Form 3520/3520-A consequences.',
      },
      {
        id: 'ch06-q4',
        prompt: 'A beneficiary of a discretionary spendthrift trust is sued after a car accident. Which is the most accurate description of the creditor\'s position?',
        options: [
          'The creditor can seize the trust assets because the beneficiary is entitled to them.',
          'The creditor generally cannot compel a distribution the beneficiary cannot compel, though distributions once made are reachable and support-type claims may be excepted.',
          'The creditor can reach the assets only if the trust is revocable.',
          'The spendthrift clause makes the assets permanently immune from every claim.',
        ],
        answer: 1,
        explanation: 'UTC §§502–504: a discretionary interest with a spendthrift clause is not reachable before distribution, but exception creditors (child support, certain government claims) exist, and a pattern of fixed distributions can undermine the discretion in practice.',
      },
      {
        id: 'ch06-q5',
        prompt: 'A family funds a perpetual "dynasty trust" in South Dakota but allocates no GST exemption. What is the practical result?',
        options: [
          'Nothing changes; the perpetuities repeal removes transfer tax.',
          'The trust is void because GST allocation is mandatory.',
          'Future distributions to grandchildren and later generations (and certain terminations) can attract generation-skipping transfer tax at the top rate, indefinitely.',
          'The trust automatically becomes a grantor trust.',
        ],
        answer: 2,
        explanation: 'Perpetuities law only governs how long a trust may last. The GST tax under IRC Chapter 13 applies to skip-person distributions and taxable terminations unless exemption has been allocated to produce a zero inclusion ratio. A perpetual trust with an inclusion ratio of one is a perpetual GST problem.',
      },
    ],
    caseStudy: {
      title: 'The Okafor-Lindqvist Directed Dynasty Trust',
      family: 'Adaeze Okafor-Lindqvist (56), founder of a Houston freight-forwarding group valued at roughly $40 million; husband Mats, a retired engineer; three adult children, one of whom works in the business and one of whom is in a difficult marriage.',
      situation: 'Adaeze wanted three things that she described in one sentence: keep the business in the family, keep it away from any in-law, and stop the estate tax from forcing a sale. She also wanted to keep running the company. Her first adviser proposed a revocable trust and a buy-sell agreement, which solved none of the three. Her second proposed a Cook Islands trust, which solved the second at the cost of annual Form 3520 filings, a foreign trustee she had never met and a protection premium she did not need against creditors she did not have.',
      structure: 'An irrevocable, GST-exempt directed trust under South Dakota law with a South Dakota corporate administrative trustee. Adaeze and Mats serve on an investment direction committee that directs the trustee on the operating company only; a distribution committee of two independent advisers decides distributions under a discretionary standard with a spendthrift clause; her longtime lawyer serves as protector with power to remove the trustee and change situs. The trust was funded with a gift of 25% non-voting units (appraised with discounts, reported on Form 709 with full GST allocation) and a sale of a further 45% for a 9-year note at the AFR. Adaeze retained a swap power, making the trust a grantor trust, and retained the voting units — and therefore the CEO seat — personally. A separate ILIT holds a $10 million policy on her life.',
      outcome: 'Six years in, the company has grown about 50%; roughly 70% of that growth sits in the trust. Adaeze pays the trust\'s income tax each year, which her CPA tracks as a running tally of estate reduction. The child in the difficult marriage divorced; the trust was not a marital asset because she never had a right to compel anything from it, and the committee declined her request for a lump sum, as it was designed to. The note was paid off in year seven from company distributions. The one friction: the investment committee wanted to use trust cash to buy a vacation property the family would use, and the trustee, correctly, refused — personal use of trust assets by the settlor is a §2036 problem.',
      lesson: 'The structure that worked was the boring domestic one, drawn carefully, with people in the five roles who actually did their jobs. The foreign trust was more structure than the problem required, and the revocable trust was less. The hardest conversation was not about tax; it was telling a founder that control of the business and ownership of the business would now live in different hands, on paper and in fact.',
    },
    terminology: [
      { term: 'Settlor (Grantor)', definition: 'The person who creates and funds the trust by transferring property to the trustee. "Grantor" is the tax-code term; "settlor" the trust-law term.' },
      { term: 'Trustee', definition: 'The fiduciary who holds legal title to trust assets and administers them under the instrument and applicable law, owing duties of loyalty, prudence and impartiality to beneficiaries.' },
      { term: 'Protector', definition: 'A non-fiduciary (or limited-fiduciary) role holding specific powers — typically to remove and replace trustees, change situs or governing law, or veto amendments — without holding title or benefiting.' },
      { term: 'Equitable interest', definition: 'The beneficiary\'s right to benefit from trust property, as distinct from the trustee\'s legal title. Can be fixed (mandatory) or discretionary.' },
      { term: 'Grantor trust', definition: 'A trust whose income, deductions and credits are taxed to the settlor under IRC §§671–679 because of retained powers or interests. Tested separately from estate inclusion.' },
      { term: 'Distributable net income (DNI)', definition: 'The measure under IRC §643 of how much of a non-grantor trust\'s income is carried out to beneficiaries by distributions and taxed to them rather than the trust.' },
      { term: 'Spendthrift clause', definition: 'A provision preventing a beneficiary from assigning their interest and preventing creditors from attaching it before distribution (UTC §502), subject to exception creditors.' },
      { term: 'Self-settled trust', definition: 'A trust in which the settlor is also a beneficiary. Generally reachable by the settlor\'s creditors except under the asset-protection trust statutes of certain states, each with its own conditions.' },
      { term: 'Court test / control test', definition: 'The two conditions of IRC §7701(a)(30)(E) a trust must meet to be domestic for U.S. tax purposes: a U.S. court supervises administration, and U.S. persons control all substantial decisions.' },
      { term: 'Directed trust', definition: 'A trust whose instrument gives a non-trustee adviser (investment or distribution) power to direct the trustee, with the trustee\'s liability limited by statute for following directions.' },
      { term: 'Dynasty trust', definition: 'A long-term or perpetual trust in a state with a repealed or extended rule against perpetuities, designed to hold assets across multiple generations, ideally with a zero GST inclusion ratio.' },
      { term: 'Incidents of ownership', definition: 'Rights over a life insurance policy (change beneficiary, borrow, surrender, assign) that, if held by the insured at death, cause estate inclusion of the proceeds under IRC §2042.' },
    ],
    references: [
      { title: 'Grantor trust rules', citation: '26 U.S.C. §§ 671–679', jurisdiction: 'United States (federal)', type: 'statute', note: 'Who is taxed on trust income; §676 (power to revoke), §675 (administrative powers), §679 (foreign trusts with U.S. beneficiaries).' },
      { title: 'Transfers with retained life estate; revocable transfers', citation: '26 U.S.C. §§ 2036, 2038', jurisdiction: 'United States (federal)', type: 'statute', note: 'Estate inclusion for retained enjoyment, control or power to alter, amend or revoke.' },
      { title: 'Definition of United States person and foreign trust', citation: '26 U.S.C. § 7701(a)(30)(E), (a)(31)(B); Treas. Reg. § 301.7701-7', jurisdiction: 'United States (federal)', type: 'regulation', note: 'Court test and control test for trust classification.' },
      { title: 'Annual Return to Report Transactions with Foreign Trusts (Form 3520) and Annual Information Return of Foreign Trust With a U.S. Owner (Form 3520-A)', citation: 'IRS Forms 3520 and 3520-A and Instructions; 26 U.S.C. §§ 6048, 6677', jurisdiction: 'United States (federal)', type: 'guidance', note: 'Reporting obligations and penalty framework for foreign trusts.' },
      { title: 'Grantor\'s payment of income tax on grantor trust income is not a gift', citation: 'Rev. Rul. 2004-64, 2004-2 C.B. 7', jurisdiction: 'United States (federal)', type: 'guidance', note: 'Also addresses estate inclusion where the trust must reimburse the grantor.' },
      { title: 'North Carolina Department of Revenue v. Kimberley Rice Kaestner 1992 Family Trust', citation: '588 U.S. ___ (2019)', jurisdiction: 'United States (Supreme Court)', type: 'case', note: 'Due process limits on state taxation of trust income based solely on beneficiary residence.' },
      { title: 'Uniform Trust Code — Creditor\'s Claims; Spendthrift and Discretionary Trusts', citation: 'UTC §§ 502–505 (as enacted by adopting states)', jurisdiction: 'United States (state law; model act)', type: 'statute', note: 'Spendthrift provisions, exception creditors, discretionary trusts and creditor claims against settlors.' },
      { title: 'Directed trusts — Delaware', citation: 'Del. Code Ann. tit. 12, § 3313', jurisdiction: 'Delaware', type: 'statute', note: 'Advisers and direction of fiduciaries; see also the Uniform Directed Trust Act and S.D. Codified Laws ch. 55-1B.' },
    ],
    takeaways: [
      'A trust is an allocation of five roles — settlor, trustee, protector, beneficiaries, assets — and every tax, protection and succession consequence follows from who holds which powers and whether they actually exercise them.',
      'Revocable trusts avoid probate and nothing more: §2038 includes them, UTC §505 exposes them, §676 ignores them.',
      'Grantor-trust status and estate inclusion are tested separately; the mismatch between §§671–677 and §§2036–2038 is what lets a settlor pay a trust\'s income tax as a tax-free transfer.',
      'A foreign trust for U.S. tax purposes is defined by the court and control tests, not by where the assets sit, and it means Forms 3520 and 3520-A every year — more reporting, not less tax.',
      'Decide which job the trust is doing — tax, protection or succession — before drafting, and write down what the family is giving up to get it.',
    ],
  },
  Diagram,
  Simulator,
};

export default mod;
