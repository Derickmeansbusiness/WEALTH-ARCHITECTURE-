import type { Slide } from '@/types/present';
import * as V from './visuals';

/**
 * Debt & Credit Studio deck — Chapter 04. ~35 minutes. Reused inside the main /present masterclass.
 * Animations are simplified explanatory choreography; the arithmetic comes from @/lib/finance and content/debt/math.
 */
const SECTION = 'Chapter 04 — Debt, Credit & Strategic Leverage';
const s = (id: string, title: string, Visual: Slide['Visual'], steps: number, minutes: number, notes: string[]): Slide => ({ id, section: SECTION, title, Visual, steps, minutes, notes });

export const debtSlides: Slide[] = [
  s('d-title', 'Debt, Credit & Strategic Leverage', V.TitleVisual, 2, 1, ['Open on the three bars: equity, borrowed capital, asset controlled. The whole chapter is the relationship between them.', 'Set expectations: about 35 minutes, one worked example throughout — a $1,000,000 building financed 70/30 at 6.5%.']),
  s('d-question', 'How can you control a $1 million asset without owning $1 million in cash?', V.QuestionVisual, 3, 1, ['Let the question sit before revealing the answer.', 'The answer is not clever: you borrow most of it. The chapter is about what that costs and risks.']),
  s('d-disclaimer', 'Simplified animations vs actual cash flows', V.DisclaimerVisual, 1, 0.5, ['Say explicitly: the coins and boxes are a teaching device; the numbers are exact; the real transaction has more parties and more paperwork.', 'This slide protects the rest of the deck from being mistaken for a description of the monetary system.']),
  s('d-deposit', 'Money enters a financial institution', V.DepositVisual, 3, 1, ['A deposit is money the bank owes back — a liability for the bank.', 'Step 3 shows the bank’s T-account: reserves up, deposits up.']),
  s('d-bank-sheet', 'The bank’s balance sheet, simplified', V.BankSheetVisual, 2, 1, ['Loans are assets; deposits are liabilities; equity is thin relative to assets — that is what capital rules regulate.', 'Keep it short; this is context for the next slide, not a monetary lecture.']),
  s('d-approval', 'Loan approval — from the borrower’s perspective', V.LoanApprovalVisual, 3, 1, ['When the loan is approved and funded, the borrower sees a deposit appear and a liability appear at the same instant.', 'Both T-accounts balance. Label it clearly as a simplified explanatory animation.']),
  s('d-disbursement', 'Loan disbursement', V.DisbursementVisual, 2, 1, ['At settlement, lender and buyer both wire funds; the seller receives the price.', 'In practice a settlement agent, title insurer and recorder are involved.']),
  s('d-acquisition', 'Asset acquisition: title and lien', V.AcquisitionVisual, 3, 1, ['Ownership (title) sits in the Property Co; the lender holds a lien.', 'Different rights: control vs security. The lender can act only on default, through process.']),
  s('d-split', 'The financing split', V.SplitVisual, 3, 1, ['$300,000 equity, $700,000 borrowed, $1,000,000 controlled.', 'Introduce the leverage factor: 3.33×. It will return on the both-ways slide.']),
  s('d-note', 'The repayment obligation', V.NoteVisual, 3, 1, ['Read the note as a schedule, not a lump sum: 360 payments of $4,424; $893K of interest over the life.', 'Point at covenants and recourse — these decide what happens when things go wrong.']),
  s('d-first-payment', 'The first payment', V.FirstPaymentVisual, 2, 1, ['Interest = balance × rate ÷ 12. The rest of the level payment is principal.', 'Month one is ~86% interest. Ask the room why.']),
  s('d-amortization', 'Amortization over thirty years', V.AmortizationVisual, 3, 1, ['Bars fill year by year; the dashed line is the balance.', 'Principal overtakes interest late — well past the midpoint. This is why balloons are dangerous.']),
  s('d-crossover', 'Principal reduction', V.CrossoverVisual, 1, 0.5, ['After ten years only about a sixth of principal is repaid.', 'Transition: amortization is one of two engines of equity.']),
  s('d-equity', 'Equity accumulation', V.EquityAccumulationVisual, 3, 1, ['Two engines: tenant repays principal; asset appreciates (assumed 3%).', 'Amortization is contractual; appreciation is an assumption. Say which one you are relying on.']),
  s('d-both-ways', 'Leverage multiplies both ways', V.LeverageBothWaysVisual, 2, 1.5, ['+10% on the asset is +33% on equity. −10% is −33%. The loan line does not move.', 'A 30% decline wipes out equity. This is the thesis of the chapter.']),
  s('d-spread', 'Positive and negative leverage', V.SpreadVisual, 2, 1, ['The spread between asset yield and cost of debt decides which way leverage works from operations.', 'At 6.5% debt against a 5.4% yield, the reference deal is negative leverage — a bet on appreciation.']),
  s('d-ratios', 'The ratios lenders compute', V.RatiosVisual, 3, 1.5, ['LTV, DSCR, debt yield for property; DTI for individuals; debt/EBITDA and interest coverage for businesses.', 'Never state universal thresholds. Say “lenders commonly reference ranges such as…”. Our reference loan has a 1.02× DSCR — not bankable on cash flow.']),
  s('d-credit-file', 'What the lender reads first', V.CreditFileVisual, 2, 1, ['Credit history is the asset; the score is a compression.', 'Published approximate FICO weights — educational, not a bureau calculation. Mention AECB (UAE) and BEAC Centrale des Risques (CEMAC).']),
  s('d-five-cs', 'The five Cs of credit', V.FiveCsVisual, 5, 1, ['Character, capacity, capital, collateral, conditions.', 'Weights move with the product: mortgages lean on capacity and collateral; private credit on capacity and conditions.']),
  s('d-marketplace', 'The financing marketplace', V.MarketplaceVisual, 4, 1, ['Fifteen instruments in four families.', 'One rule: match the term of the money to the life of the asset, and the repayment source to the cash-flow shape.']),
  s('d-machine', 'A financed machine', V.MachineVisual, 3, 1.5, ['$240K machine, 75% financed at 9% over 5 years; $180K revenue, $95K operating cost.', 'Base case covers 1.9×; revenue −28% and the machine cannot pay its own loan. Underwrite the incremental cash flow.']),
  s('d-re-lifecycle', 'Real estate debt lifecycle', V.RELifecycleVisual, 4, 1, ['Construction → bridge → permanent → refinance; each has its own lender and risk.', 'The construction loan matures when the building is done whether or not the take-out exists.']),
  s('d-refinance', 'Cash-out refinance', V.RefinanceVisual, 3, 1.5, ['Value up 4.5%/yr for five years; refinance to 70% LTV; about $200K released.', 'Payment rises and runs another thirty years. The cash is a loan.']),
  s('d-proceeds', 'Proceeds are debt, not income', V.ProceedsVisual, 1, 0.5, ['Borrowing is not a realization event — so no tax on receipt; the gain stays in the property.', 'Deferral is not elimination. Interest on the larger loan is a real cost.']),
  s('d-recycling', 'Capital recycling', V.RecyclingVisual, 4, 1.5, ['Equity released from A funds B; B’s rent and amortization build equity to recycle again.', 'Each turn adds debt service. The loop is only as strong as its weakest DSCR.']),
  s('d-family-bank', 'Family banking and related-party loans', V.FamilyBankVisual, 3, 1.5, ['Holding lends to Property Co under a note at or above the AFR, secured, with a schedule.', 'Both ledgers record it; interest is actually paid. Consolidation eliminates the note; law does not.']),
  s('d-below-market', 'Below-market loan rules', V.BelowMarketVisual, 2, 1, ['IRC §7872: interest imputed at the AFR; forgone interest is a gift and income.', 'Thresholds stated generally ($10K, $100K). Jurisdiction caveats for UAE and Cameroon — not yet verified.']),
  s('d-rate-shock', 'Rate shock on coverage', V.RateShockVisual, 2, 1, ['Same NOI, same loan, four rates: DSCR goes from comfortable to below 1.0×.', 'Floating debt moves coverage now; fixed debt moves it at maturity.']),
  s('d-contagion', 'Contagion through a family structure', V.ContagionVisual, 5, 1.5, ['Step through: covenant breach → parent guarantee → cross-collateral → cross-default → personal guarantees.', 'Separation existed on paper only. The loan documents, not the org chart, decide.']),
  s('d-maturity-wall', 'The maturity wall', V.MaturityWallVisual, 2, 1, ['Case E: $72.5M of $113M due within two years, re-laddered to no more than $24M in any year.', 'Resilience cost about 20bp of weighted cost of debt.']),
  s('d-stress', 'Stress-test discipline', V.StressVisual, 3, 1, ['Rates +200bp, values −15%, NOI −10%: find what fails first; cut the connections; hold a reserve.', 'A stress test is a map, not a forecast.']),
  s('d-jurisdictions', 'Four jurisdictions', V.JurisdictionsVisual, 4, 1, ['US reviewed; UAE and Cameroon/CEMAC/OHADA phrased generally pending local counsel; UK coming.', 'No jurisdiction is “best”. Point to the Jurisdictions page in the studio.']),
  s('d-objectives', 'Debt and the six objectives', V.ObjectivesVisual, 1, 0.5, ['Every financing decision touches asset protection, tax, estate, privacy, succession and governance.', 'They are never the same thing; keep them distinct.']),
  s('d-closing', 'Debt is a financing instrument', V.ClosingVisual, 1, 0.5, ['Close on the principle: productive assets, sustainable cash flow, disciplined risk management.', 'Never inherently beneficial; never a tax-elimination method; the most leveraged scenario is never the default.']),
];

/** Total planned minutes (≈35). */
export const DEBT_DECK_MINUTES = debtSlides.reduce((t, sl) => t + (sl.minutes ?? 1), 0);
