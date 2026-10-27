import type { ChapterModule } from '@/types/content';
import { CHAPTERS } from '../manifest';
import Diagram from './Diagram';
import Simulator from './Simulator';
import './styles.css';

const meta = CHAPTERS.find((c) => c.id === 'ch09')!;

const mod: ChapterModule = {
  content: {
    id: meta.id,
    number: meta.number,
    slug: meta.slug,
    title: meta.title,
    subtitle: 'Depreciation, exchanges, step-up and recapture: real estate does not eliminate tax, it moves tax through time — and the architecture decides where it lands.',
    objectives: ['tax-planning', 'asset-protection', 'estate-planning', 'succession'],
    duration: meta.duration,
    hook: 'The building is worth more every year. The tax return says it is worth less. Both are true, and the gap between them is the whole game.',
    concept: [
      'Real estate is the asset class where **cash flow and taxable income diverge most**, and the entire tax architecture of a property portfolio is built on that divergence. A rental building produces rent, pays expenses and debt service, and leaves cash. The tax return starts with the same rent and expenses, deducts the same interest, and then deducts something the cash flow never saw: **depreciation**. Under the Modified Accelerated Cost Recovery System the cost of a **residential rental building** (not the land) is deducted straight-line over **27.5 years** and a **nonresidential building** over **39 years** (IRC §168(c)), with a mid-month convention in the first and last year. Land is never depreciated, which is why the allocation between land and building at purchase — by appraisal, by the assessor\'s ratio or by a cost segregation study — is the first tax decision an owner makes, and one of the most frequently challenged.',
      '**Cost segregation** takes the analysis further. An engineering study breaks the building into components: structural elements stay on the 27.5- or 39-year schedule, but carpeting, cabinetry, certain electrical and plumbing serving equipment, and land improvements like parking and landscaping are reclassified as 5-, 7- or 15-year property. The Tax Court blessed this approach in *Hospital Corporation of America v. Commissioner* (1997), and the IRS has an audit technique guide that tells you exactly what it expects a study to contain. Layer **bonus depreciation** under §168(k) on top — a first-year deduction of a percentage of the short-lived property\'s cost — and a new owner can front-load a large deduction into year one. The percentage has moved repeatedly: 100% under the 2017 Act, phased down from 2023, and restored to 100% by 2025 legislation for property acquired after January 19, 2025. Confirm the figure for your acquisition date; this is not a number to remember, it is a number to look up.',
      'A deduction is only useful if you can use it, and this is where most real estate tax marketing collapses. Under **§469**, rental activities are **passive** by definition, and passive losses offset only passive income. A high-earning professional with a W-2 and a rental that shows a $40,000 tax loss generally cannot deduct that loss against salary; it is suspended and carried forward until there is passive income or the property is sold. Two exceptions matter. The **$25,000 allowance** for taxpayers who actively participate in a rental, phased out between $100,000 and $150,000 of modified adjusted gross income (§469(i)) — real but modest. And **real estate professional status** under §469(c)(7): more than 750 hours a year in real property trades or businesses in which you materially participate, and more than half of all your personal-services time, plus material participation in the rental activities themselves (usually with a grouping election under the regulations). The hours test is a fact question; the Tax Court has rejected hundreds of reconstructed logs, and a spouse\'s full-time job does not count toward the other spouse\'s hours.',
      '**§1031** is the second pillar. Since 2018 it applies to **real property only** — the 2017 Act removed personal property and intangibles — and it allows gain on the sale of investment or business real estate to be deferred if replacement property is identified within **45 days** and acquired within **180 days**, with a qualified intermediary holding the proceeds so the taxpayer never touches cash. Deferred, not forgiven: the old basis carries into the new property, so the depreciation already claimed and the appreciation already earned follow you. Cash or debt relief received is "boot" and taxable. Exchanges with related parties carry a two-year holding requirement under §1031(f). Done serially over a career, exchanges let an investor move from a duplex to an apartment complex to a net-leased building without a tax event along the way, carrying an ever-larger deferred gain and an ever-smaller basis.',
      'The exit from that spiral is the third pillar: **§1014**. At death, inherited property takes a basis equal to its fair market value. The deferred gain and the depreciation recapture that have accumulated across a lifetime of exchanges disappear for the heirs; the property can be sold the next day for no gain, or depreciated again from the stepped-up basis. The phrase practitioners use is "swap till you drop", and it is the single strongest argument for holding real estate in the senior generation\'s estate rather than gifting it — the opposite of the right answer for a fast-growing operating business. The cost is estate inclusion. For estates under the exemption that cost is zero; for estates above it, the comparison between estate tax on the full value and income tax on the recapture is the analysis, property by property. A gift during life carries over the donor\'s low basis and all the recapture with it.',
      '**Refinancing** sits alongside these: loan proceeds are not income (the principle runs back through *Crane v. Commissioner* and *Commissioner v. Tufts* — borrowing creates an obligation, not a gain), so an owner who refinances an appreciated building and takes out cash has liquidity without a taxable event. The debt is real, the interest is deductible only according to how the proceeds are used under the tracing rules of Treas. Reg. §1.163-8T, and the basis has not changed, so the gain is still waiting at sale. In a partnership, a **debt-financed distribution** can exceed a partner\'s basis and become taxable under §731, and the disguised-sale rules police distributions made shortly after a contribution. Refinancing is a cash management tool and a reasonable one; it is not a tax strategy, and anyone who presents it as "tax-free income" has mislabelled a liability.',
      'What the tax code gives in depreciation it takes back in **recapture**. On sale, gain attributable to depreciation claimed on the building is **unrecaptured §1250 gain**, taxed at a maximum federal rate of 25% rather than the lower long-term capital gains rate; gain attributable to cost-segregated personal property is **§1245 recapture** at ordinary rates; and the 3.8% net investment income tax under §1411 applies to both for most individual investors. Recapture is why the cost segregation decision has a price: accelerating a deduction into a 37% year and recapturing it later at 25% is good arithmetic; accelerating it into a year where it is suspended under §469 and recapturing it at ordinary rates in a short hold is not. The simulator tracks accumulated depreciation as a running liability for exactly this reason.',
      'Three structural choices complete the architecture. **Entity**: real estate belongs in **partnerships and LLCs taxed as partnerships**, almost never in C corporations. Pass-through losses reach the owners (subject to §469), refinancing proceeds can be distributed tax-free to the extent of basis under §731, a §754 election gives a buyer or an heir an inside basis step-up, and appreciated property can be distributed to partners without gain. A C corporation pays tax on the gain, pays it again when it distributes the proceeds, cannot pass the 25% rate through, and triggers §311(b) gain on distributing property in kind; an S corporation fixes the double tax but still has the §311(b) problem and cannot put entity debt into shareholder basis. **Property company separation**: holding each property (or each cluster) in its own LLC, with an operating business as tenant under a market lease, isolates liability and lets each asset be financed and sold separately — with the self-rental rule of Treas. Reg. §1.469-2(f)(6) turning that related-party rental income into non-passive income. **QBI**: rental income can qualify for the 20% deduction under §199A if the rental rises to a trade or business, and Rev. Proc. 2019-38 offers a safe harbor at 250 hours of rental services a year, excluding triple-net leases. Then the state and local layer: **transfer taxes** on deeds, **controlling-interest transfer taxes** in a growing number of states when the entity that owns the property changes hands, mortgage recording taxes, and reassessment of property tax on a change in ownership. These are frequently larger than the federal issue the structure was built to solve, and they are the first thing to check before moving a property into or out of an entity.',
    ],
    realWorldExample: {
      title: 'One twelve-unit building, ten years, two very different numbers',
      body: [
        'An investor buys a twelve-unit residential building for $1,200,000, allocates 20% ($240,000) to land, and finances 70% ($840,000) at 6.5% over 30 years. Gross rent is $120,000, vacancy 5%, operating expenses $38,000. Year one: effective rent $114,000, NOI **$76,000**, debt service about $63,700 (of which roughly $54,300 is interest), **cash flow about $12,300**.',
        'The tax return looks different. Depreciable basis is $960,000, so straight-line depreciation is $960,000 ÷ 27.5 = **$34,909** a year. Taxable income is $76,000 − $54,300 − $34,909 = **roughly −$13,200**. The investor banks $12,300 and reports a loss of $13,200. If she earns $300,000 as a surgeon and does not qualify as a real estate professional, that loss is suspended under §469 and carried forward; it is not a deduction against her salary this year, whatever the seminar said.',
        'Run it to year ten with 3% rent and expense growth: cumulative cash flow is around $240,000, taxable income turns positive as rents rise and interest falls, and accumulated depreciation is **about $349,000**. Adjusted basis is now about $851,000. If she sells for $1,600,000, gain is roughly $749,000: about $349,000 of it is unrecaptured §1250 gain taxed at up to 25% federal, the remaining $400,000 is long-term capital gain at 20%, and the 3.8% net investment income tax applies to both, before state tax. Alternatively she exchanges under §1031 into a $2,500,000 building, carries the $851,000 basis forward (plus the new cash and debt), and the whole liability travels with her.',
        'Add a cost segregation study at purchase reclassifying 20% of the building ($192,000) to 5-year property with 100% bonus: year-one depreciation jumps to roughly $220,000 and the year-one tax loss to about $200,000 — all of it suspended for the surgeon, all of it recaptured at ordinary rates on the §1245 component if she sells in year five. For a real estate professional in a high bracket with a long hold, the same study is excellent arithmetic. Same building, same study, opposite answer. The variable is the owner, not the property.',
      ],
    },
    misconception: {
      claim: '"Real estate investors pay no tax: depreciation wipes out the income, refinancing gives tax-free cash, and a 1031 exchange means you never pay on the gain."',
      reality: 'Depreciation defers tax by lowering basis; every dollar deducted comes back as unrecaptured §1250 gain (up to 25%) or §1245 recapture (ordinary rates) on sale. Passive losses are usually suspended under §469 for anyone who is not a real estate professional. Refinancing proceeds are debt, not income — the gain is still waiting at sale. A §1031 exchange defers gain into the replacement property; it does not forgive it. The only provision that actually erases accumulated recapture and deferred gain is the §1014 basis step-up at death, which requires holding the property in the estate and accepting whatever estate tax applies. Real estate tax architecture is about timing and character of income, not elimination.',
      confidence: 'red',
    },
    professionalExplanation: [
      'A real estate CPA\'s first questions at acquisition are about **basis and allocation**: the land/building split and its support, closing costs capitalised into basis, whether a cost segregation study is worth its fee given the owner\'s bracket, participation status and expected hold, and what bonus percentage applies to the acquisition date. The second is **participation**: will the owner meet real estate professional status, and if so, has a grouping election under Treas. Reg. §1.469-9(g) been made so that all rentals are one activity for the material participation test? Contemporaneous time logs are what win and lose these cases; a reconstructed calendar in the audit year does not.',
      'At the **entity level**, the adviser confirms the property sits in an LLC taxed as a partnership (or a disregarded single-member LLC for one owner), that the operating agreement allocates depreciation and debt consistently with the §704(b) regulations, and that nonrecourse debt is allocated so partners have basis to absorb losses and to receive refinancing distributions without §731 gain. If the property is leased to a related operating business, the lease is at market and the owners understand that the net rental income is non-passive under the self-rental rule. If multiple owners are involved, a §754 election is in place so that a purchaser or an heir receives an inside basis step-up.',
      'At **exit**, the choices are sale, exchange, refinance-and-hold, or hold until death. The adviser models each: the 25% unrecaptured §1250 rate and ordinary §1245 rate on recapture; 20% on the balance; 3.8% net investment income tax; state income tax; versus the carryover basis and strict deadlines of a §1031 exchange with a qualified intermediary engaged before closing; versus the estate inclusion cost of holding for §1014. For a personal residence, the §121 exclusion of $250,000 ($500,000 joint) applies to the gain but never to the depreciation claimed after May 6, 1997, and is reduced for periods of non-qualified use when a rental is converted back to a residence.',
      'Professionals are required at every stage: a real estate CPA for the depreciation schedule, §469 analysis and §199A safe-harbor documentation; an engineer for any cost segregation study; a qualified intermediary and real estate counsel for any §1031 exchange; and estate counsel to coordinate the step-up decision with the rest of the plan. Before any transfer of a property into or out of an entity, a check of state and local transfer taxes, controlling-interest transfer taxes, mortgage recording tax and property tax reassessment rules — these are routinely larger than the federal issue and routinely missed.',
    ],
    knowledgeCheck: [
      {
        id: 'ch09-q1',
        prompt: 'A residential rental is purchased for $1,000,000 with $250,000 of the price allocated to land. What is the approximate annual straight-line depreciation (ignoring conventions)?',
        options: ['$36,364', '$27,273', '$25,641', '$19,231'],
        answer: 1,
        explanation: 'Only the building ($750,000) is depreciable, over 27.5 years for residential rental property under IRC §168(c): $750,000 ÷ 27.5 ≈ $27,273. Nonresidential property would use 39 years ($19,231). Land is never depreciated.',
      },
      {
        id: 'ch09-q2',
        prompt: 'A physician earning $400,000 owns one rental that shows a $30,000 tax loss after depreciation. She spends about 100 hours a year on it. What happens to the loss?',
        options: [
          'It offsets her salary, saving tax at her marginal rate.',
          'It is a passive loss under §469; the $25,000 active-participation allowance is fully phased out at her income, so the loss is suspended and carried forward until she has passive income or disposes of the property.',
          'It is disallowed permanently.',
          'It converts to a capital loss.',
        ],
        answer: 1,
        explanation: 'Rental activities are passive per se. The §469(i) allowance phases out between $100,000 and $150,000 of modified AGI, and 100 hours does not approach real estate professional status (750+ hours and more than half of personal-services time). The loss is suspended, not lost — it is released on a fully taxable disposition.',
      },
      {
        id: 'ch09-q3',
        prompt: 'Which statement about §1031 like-kind exchanges after the 2017 Tax Cuts and Jobs Act is correct?',
        options: [
          'They apply to real property and to equipment, vehicles and artwork.',
          'They apply to real property only, defer (not forgive) gain, and require identification within 45 days and acquisition within 180 days, generally through a qualified intermediary.',
          'They permanently eliminate depreciation recapture.',
          'They allow the taxpayer to hold the sale proceeds in a personal account during the exchange period.',
        ],
        answer: 1,
        explanation: 'The TCJA limited §1031 to real property. Basis carries over to the replacement property, so deferred gain and recapture travel with the taxpayer. Touching the cash disqualifies the exchange; cash or net debt relief received is boot and taxable.',
      },
      {
        id: 'ch09-q4',
        prompt: 'An investor has exchanged through four properties over 35 years and now holds a building with a $600,000 basis worth $4,000,000, including $900,000 of depreciation claimed. What single event eliminates the accumulated deferred gain and recapture for her heirs?',
        options: [
          'Refinancing the building to 75% loan-to-value.',
          'Gifting the building to her children.',
          'Her death, when the property receives a basis equal to fair market value under §1014 (subject to any estate tax on the inclusion).',
          'Converting the LLC to a C corporation.',
        ],
        answer: 2,
        explanation: 'Refinancing is debt, not a basis event. A gift carries over her $600,000 basis and all the recapture. Only the step-up at death resets basis to fair market value — the "swap till you drop" result — at the price of estate inclusion, which may or may not produce estate tax depending on the exemption.',
      },
      {
        id: 'ch09-q5',
        prompt: 'Why is a C corporation generally the wrong vehicle for appreciating investment real estate?',
        options: [
          'C corporations cannot own real estate.',
          'Gain is taxed at the corporate level and again when distributed, the 25% unrecaptured §1250 rate and pass-through losses do not reach shareholders, and distributing appreciated property triggers corporate gain under §311(b).',
          'C corporations cannot deduct depreciation.',
          'C corporations are not eligible for mortgage financing.',
        ],
        answer: 1,
        explanation: 'Partnerships and LLCs pass losses through (subject to §469), distribute refinancing proceeds tax-free to the extent of basis under §731, permit §754 inside basis step-ups and can distribute property without entity-level gain. A C corporation locks appreciation inside a double-tax structure.',
      },
    ],
    caseStudy: {
      title: 'The Haddad-Nguyen Property Companies',
      family: 'Rania Haddad, an emergency physician, and Daniel Nguyen, who left a logistics career to manage the family\'s rentals full time; Atlanta; two children in college. Portfolio: four small multifamily buildings (38 units) acquired over twelve years, roughly $9 million gross value, $5 million debt.',
      situation: 'The first two buildings were held in Rania\'s name, then in one LLC with both. A seminar had convinced them that cost segregation on every acquisition would eliminate their tax; their CPA at the time applied bonus depreciation to all of it. Rania\'s income was $450,000. Daniel was managing the properties but had no time records. Five years in, they had $600,000 of suspended passive losses they could not use, a single LLC exposed to every tenant claim across four buildings, and a plan to sell building one that would trigger $410,000 of recapture — $180,000 of it §1245 at ordinary rates from the cost segregation they had never been able to deduct.',
      structure: 'A real estate CPA and counsel rebuilt the architecture. Daniel formally qualified as a real estate professional: a contemporaneous log showing over 1,400 hours, more than half his working time, with a §1.469-9(g) grouping election treating all rentals as one activity, which released the suspended losses against the couple\'s joint income over two years. Each building was moved into its own LLC under a holding LLC, after confirming Georgia\'s transfer tax treatment and lender consent, with a §754 election in the holding partnership. Building one was not sold: it was exchanged under §1031 into a 24-unit property through a qualified intermediary, carrying its $1.1 million adjusted basis forward and preserving the recapture rather than paying it. Future cost segregation studies are run only on acquisitions with an expected hold over ten years, and bonus is elected year by year. A revocable trust now holds the holding-LLC interests so the step-up at death is coordinated with their estate plan.',
      outcome: 'The released losses saved roughly $230,000 of federal and state tax over two years. The exchange deferred about $140,000 of federal tax that the sale would have triggered. Liability is now compartmentalised per building. The couple understands that their deferred gain across the portfolio is now roughly $2.4 million and growing, that it is a liability rather than a victory, and that the plan is to hold through Rania\'s lifetime for the step-up unless the estate tax exemption changes in a way that makes gifting the better answer.',
      lesson: 'The buildings were fine. The tax architecture around them was built by people selling deductions rather than analysing the owners. Qualifying Daniel as a real estate professional was worth more than every cost segregation study combined, because a deduction you cannot use is just a future recapture bill. And the exchange taught them the honest vocabulary: nothing was eliminated; it was deferred, documented and now part of a plan.',
    },
    terminology: [
      { term: 'MACRS', definition: 'Modified Accelerated Cost Recovery System under IRC §168: the depreciation regime assigning recovery periods (27.5 years residential rental, 39 years nonresidential real property) and conventions.' },
      { term: 'Cost segregation', definition: 'An engineering-based study reclassifying components of a building from 27.5/39-year real property into 5-, 7- or 15-year property to accelerate depreciation; supported by Hospital Corp. of America v. Commissioner.' },
      { term: 'Bonus depreciation', definition: 'An additional first-year deduction under IRC §168(k) for qualifying property with a recovery period of 20 years or less; the percentage has varied by acquisition date and must be confirmed under current law.' },
      { term: 'Passive activity', definition: 'Under IRC §469, a trade or business in which the taxpayer does not materially participate; rental activities are passive by definition, so their losses offset only passive income unless an exception applies.' },
      { term: 'Real estate professional', definition: 'A taxpayer meeting §469(c)(7): more than 750 hours and more than half of personal-services time in real property trades or businesses with material participation, allowing rental losses to be non-passive if the rentals are also materially participated in.' },
      { term: 'Like-kind exchange (§1031)', definition: 'Deferral of gain on the exchange of real property held for investment or business for other such real property, with 45-day identification and 180-day acquisition deadlines and a qualified intermediary; basis carries over.' },
      { term: 'Boot', definition: 'Cash or non-like-kind property (including net debt relief) received in an exchange, taxable to the extent of gain.' },
      { term: 'Unrecaptured §1250 gain', definition: 'Gain on sale of depreciable real property attributable to straight-line depreciation claimed, taxed to individuals at a maximum federal rate of 25%.' },
      { term: '§1245 recapture', definition: 'Gain attributable to depreciation claimed on personal property (including cost-segregated components), taxed as ordinary income.' },
      { term: 'Basis step-up (§1014)', definition: 'Adjustment of an inherited asset\'s basis to fair market value at the decedent\'s death, eliminating accumulated deferred gain and recapture for the heirs.' },
      { term: 'Debt-financed distribution', definition: 'A distribution of refinancing proceeds by a partnership; not income to the extent of the partner\'s basis (§731), but subject to disguised-sale and basis rules.' },
      { term: 'Controlling-interest transfer tax', definition: 'A state or local tax imposed when a controlling interest in an entity that owns real property changes hands, treating the entity transfer like a deed transfer.' },
    ],
    references: [
      { title: 'Accelerated cost recovery system', citation: '26 U.S.C. § 168(b), (c), (d), (k)', jurisdiction: 'United States (federal)', type: 'statute', note: 'Recovery periods (27.5 / 39 years), conventions and bonus depreciation.' },
      { title: 'Hospital Corporation of America v. Commissioner', citation: '109 T.C. 21 (1997)', jurisdiction: 'United States (Tax Court)', type: 'case', note: 'Foundation of cost segregation: building components may qualify as tangible personal property.' },
      { title: 'IRS Cost Segregation Audit Techniques Guide', citation: 'IRS ATG (LB&I)', jurisdiction: 'United States (federal)', type: 'guidance', note: 'What the IRS expects a cost segregation study to contain.' },
      { title: 'Passive activity losses and credits limited', citation: '26 U.S.C. § 469(c)(2), (c)(7), (i); Treas. Reg. §§ 1.469-9, 1.469-2(f)(6)', jurisdiction: 'United States (federal)', type: 'statute', note: 'Per se passive rentals, real estate professional exception, $25,000 allowance, grouping election, self-rental rule.' },
      { title: 'Exchange of real property held for productive use or investment', citation: '26 U.S.C. § 1031; Treas. Reg. § 1.1031(k)-1', jurisdiction: 'United States (federal)', type: 'statute', note: 'Real property only after the TCJA; identification and exchange periods; qualified intermediaries; related-party rule in §1031(f).' },
      { title: 'Exclusion of gain from sale of principal residence; basis of property acquired from a decedent', citation: '26 U.S.C. §§ 121, 1014', jurisdiction: 'United States (federal)', type: 'statute', note: '§121 does not shelter post-1997 depreciation; §1014 step-up erases deferred gain and recapture.' },
      { title: 'Gain from dispositions of certain depreciable property / realty; maximum capital gains rate', citation: '26 U.S.C. §§ 1245, 1250, 1(h)(1)(E), 1411', jurisdiction: 'United States (federal)', type: 'statute', note: 'Recapture characterisation, the 25% unrecaptured §1250 rate and the 3.8% net investment income tax.' },
      { title: 'Rental real estate safe harbor for the qualified business income deduction', citation: 'Rev. Proc. 2019-38; 26 U.S.C. § 199A', jurisdiction: 'United States (federal)', type: 'guidance', note: '250-hour safe harbor; triple-net leases excluded.' },
    ],
    takeaways: [
      'Depreciation makes taxable income diverge from cash flow; the gap is deferral, and every dollar of it becomes recapture on sale (up to 25% for §1250, ordinary rates for §1245).',
      'A deduction you cannot use is a future liability: under §469 rental losses are passive unless you meet the real estate professional test with contemporaneous hours or fall within the modest $25,000 allowance.',
      '§1031 defers gain into the next property and §1014 erases it at death; refinancing is debt, not income. None of these eliminates tax — they time it.',
      'Hold real estate in partnerships or LLCs, one asset per entity where liability warrants it, never in a C corporation; coordinate the step-up decision with the estate plan asset by asset.',
      'Check state and local transfer taxes, controlling-interest taxes and reassessment rules before moving a property into or out of any entity; they are often larger than the federal issue.',
    ],
  },
  Diagram,
  Simulator,
};

export default mod;
