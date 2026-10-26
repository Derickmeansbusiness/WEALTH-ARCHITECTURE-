# Build Brief — The 100-Year Family Wealth Architecture

Read this fully before writing code. It is the contract every module follows so the platform reads as one system.

## Stack
Vite 6 · React 19 · TypeScript (strict) · react-router-dom 7 · zustand 5 (persist) · vitest. No other dependencies may be added (no npm install). Hand-roll SVG/CSS/requestAnimationFrame animation. Import alias `@/` → `src/`.

## Design language (do not deviate)
- Obsidian backgrounds (`--bg-0..3`), warm ivory type (`--ivory`, `--ivory-2`, `--ivory-3`), champagne gold accents (`--gold`, `--gold-2`), deep green sparingly (`--green`, `--green-2`), `--amber`, `--red`, `--blue`, `--violet` for semantic/relationship colors. All tokens in `src/styles/tokens.css`.
- Display font `var(--font-display)` (Cormorant Garamond) for headings & big numbers' labels; body Inter; numbers `var(--font-mono)` via `.mono`/`.num`.
- Global utility classes in `src/styles/global.css`: `.panel` (glass panel, tones `.gold .green .danger .warn`, `.tight`), `.btn` (`.primary .ghost .sm .active .danger`), `.chip` (tones), `.stat`, `.table`/`.table-wrap`, `.callout`, `.eyebrow`, `.lede`, `.grid .grid-2/3/4`, `.row .between .stack`, `.fade-up .fade-in .delay-1..5`, `.flow-line` (animated dashed SVG stroke), `.draw-line`, `.diagram` (SVG defaults: `.node`, `.edge` with tone classes), `.empty`, `.skeleton`, `.page`, `.container`, `.section`, `.hairline`.
- **Never edit** `src/styles/*.css`, `src/types/*`, `src/lib/*`, `src/store/*`, `src/components/*`, `src/App.tsx`, `src/components/layout/AppShell.tsx`, or anything outside your assigned directories. Put module-specific CSS in `src/modules/<module>/<module>.css` and import it from your module. Prefix module-specific classes (e.g. `.lab-...`).
- No cliché luxury imagery. Wealth is represented through architecture, ownership networks, assets, cash-flow systems, institutions and generations. Diagrams are SVG: nodes, edges, animated flows, entity trees, timelines, balance sheets.
- Responsive: desktop, tablet, phone. Use the grid classes (they collapse) and `overflow-x: auto` wrappers for wide SVG/tables. 16px side gutters at phone width (container handles it).
- Every interactive tool has clear empty, loading and error states (`EmptyState`, `LoadingState`, `ErrorState` from `@/components/ui`).

## Shared UI kit — `@/components/ui`
`Panel, Eyebrow, SectionHeader, Chip, ConfidenceChip(level: 'green'|'amber'|'red'), ObjectiveTags(objectives), ObjectiveLegend, Stat, Money(value USD → displays in selected currency), useMoney(), CurrencyToggle, Disclaimer, Callout, Tabs, NumberField, SliderField, SelectField, TextField, EmptyState, LoadingState, ErrorState, Modal, Reveal(scroll fade-up), Rich(text with **bold**), ProgressBar`. Plus `KnowledgeCheck` from `@/components/ui/KnowledgeCheck`.

## Shared libraries
- `@/lib/finance`: `pmt, balanceAfter, buildLoan({principal, annualRate, termMonths, structure:'amortizing'|'interest-only'|'balloon', frequency, amortizationMonths}) → {periodicPayment, annualDebtService, totalInterest, totalPaid, balloonBalance, schedule[]}`, `annualize`, ratios (`ltv, dti, dscr, debtToEquity, interestCoverage, noi, cashOnCash, debtYield, capRate`), `grow, simpleInterest, compoundInterest, effectiveAnnualRate`, `analyzeLeverage(LeverageInput) → LeverageResult`, `irr`, `distributeWaterfall(tranches, available)`. Tested in `finance.test.ts` — use these, do not re-implement. If you need new math, add a pure function in **your module** with a `*.test.ts` next to it.
- `@/lib/format`: `money(v,{currency,compact,decimals,fromUSD}), pct, ratio, num, pad2, uid`, `FX_PER_USD`, `FX_NOTE` (explicit exchange-rate assumptions — show when converting).
- `@/store/useAppStore`: persisted state — `currency, jurisdictionMode ('US'|'UAE'|'CEMAC'|'UK'), presenterNotes, progress{[lessonId]:{visited,completed,score}}, markVisited, markCompleted, bookmarks, toggleBookmark, notes, setNote, structures (Structure[]), saveStructure, deleteStructure, scenarios (SavedScenario{kind,name,data,structureId?,edgeId?}), saveScenario, deleteScenario, sources, addSource/updateSource/deleteSource, transcripts, addTranscript, deleteTranscript, researchClaims, addResearchClaims, updateResearchClaim, deleteResearchClaim`. Do not add fields; keep ephemeral UI state local.

## Shared types
- `@/types/content`: `ChapterContent, ChapterModule {content, Diagram, Simulator}, KnowledgeQuestion, Reference, Term, CaseStudy, Misconception, Confidence, Objective, OBJECTIVE_LABELS`.
- `@/types/structure`: `ComponentKind (25 kinds), COMPONENT_META, RelationshipKind (12 kinds), RELATIONSHIP_META (label, color, which MapViews it appears on), MapView, MAP_VIEWS, LoanTerms, StructureNode, StructureEdge, Structure`.
- `@/types/knowledge`: `Topic, TOPIC_LABELS, ClaimRecord, SourceCategory, SOURCE_CATEGORY_LABELS, EvidenceLevel, SourceRecord, ResearchStatus, ResearchClaim, Transcript`.
- `@/types/present`: `Slide {id, section, title, Visual({step, active}), steps?, notes?, minutes?}`.
- `@/content/chapters/manifest`: `CHAPTERS` (15 chapters — note Chapter 04 is Debt, Credit & Strategic Leverage), `chapterById, chapterBySlug`. `@/content/chapters/registry`: `CHAPTER_LOADERS[id]()` lazy loads `{default: ChapterModule}`.

## Educational principles (hard rules — these are the product)
1. Never teach "wealthy people don't pay tax." Teach: wealthy families deliberately structure ownership, financing, risk, taxation, succession and governance.
2. Never imply an entity, trust, loan or jurisdiction automatically eliminates taxes. Say what tax questions arise.
3. Never teach "hide ownership." Distinguish lawful privacy, beneficial ownership, control and disclosure requirements (e.g. beneficial ownership reporting regimes, bank KYC, tax reporting).
4. Never present sham transactions, false debt, fictitious mortgages, backdated documents or artificial documentation as legitimate. Flag them explicitly as what undermines a structure.
5. Constantly distinguish six objectives: ASSET PROTECTION · TAX PLANNING · ESTATE PLANNING · PRIVACY · SUCCESSION · GOVERNANCE. Use `ObjectiveTags`.
6. Never label a jurisdiction "best." Suitability depends on residence, citizenship, assets, income, business activity and objectives.
7. Debt is a financing instrument that can accelerate capital formation when supported by productive assets, sustainable cash flow and disciplined risk management. Never present borrowing as inherently beneficial or as a tax-elimination method. Never auto-recommend the most leveraged scenario.
8. Every simulation shows its assumptions and formulas; every warning says when professional legal/tax review would ordinarily be required. Use `Disclaimer`.
9. Cite real authorities accurately (IRC sections, Treasury regs, state statutes, cases, agency guidance). If unsure of a citation detail, phrase generally ("IRS guidance on below-market loans under IRC §7872") rather than inventing a number. Mark jurisdictionally unverified content with an amber chip "Not yet jurisdictionally verified".
10. Content voice: written by someone who has actually done the work. Specific observations, tradeoffs, doubts, and lessons rather than generic advice. Natural, conversational, confident. No filler, no AI-sounding patterns, no bullet-soup where prose is better.

## Verification before you finish
```
npx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "<your directories>"   # must print nothing
npx vitest run                                                           # all green (add tests for new math)
```
Other agents are editing other directories simultaneously; ignore their type errors. Do **not** run git commands (no add/commit/push) — the orchestrator commits. Do not run `npm install`. You may run `npm run dev` on a free port to sanity check, and Playwright is pre-installed (`require('playwright')`, `chromium.launch()`) if you want to screenshot your pages.
