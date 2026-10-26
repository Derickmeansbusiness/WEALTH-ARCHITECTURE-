# The 100-Year Family Wealth Architecture

**Create. Control. Protect. Compound. Transfer.**

An immersive interactive masterclass and visual wealth-architecture laboratory explaining how sophisticated families structure, protect, finance, preserve and transfer wealth across generations. Built as a single-page application: Vite · React 19 · TypeScript · react-router · zustand.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build to dist/
npm run preview    # serve dist/ at http://localhost:4173
npm test           # vitest: finance library, analysis, segmentation, tool math
node scripts/smoke.mjs http://localhost:4173   # visit every route headlessly (Playwright), flag errors/stubs
```

The app is a client-side SPA. `vercel.json` and `public/_redirects` rewrite every path to `index.html`. State (progress, bookmarks, notes, saved structures, scenarios, sources, research queue) persists in `localStorage` under `fwa-v1`.

## Map of the platform

| Route | Room |
| --- | --- |
| `/` | Cinematic home: pillars, educational principle, chapter grid, laboratory rooms |
| `/academy` | Learning Mode: 15 sequential chapters with progress, bookmarks, notes, glossary, knowledge checks, saved structures |
| `/academy/:slug` | A chapter: concept · animated diagram · real-world example · simulator · misconception · professional explanation · knowledge check · case study · terminology · legal/tax references |
| `/map` | Master visual: the Family Wealth Architecture Map, zoomable from Individual to Future Generations |
| `/lab` | Structure Lab: drag-and-drop designer with 25 components, 12 relationships, five auto-generated views (ownership, control, cash-flow, liability, succession) |
| `/money-flow` | Money Flow Simulator: $1,000,000 of operating revenue moving through the architecture, every movement explained |
| `/waterfall` | Family Capital Waterfall with recycling, and an honest treatment of the "Rockefeller Method" |
| `/family-bank` | Family Bank Simulator: promissory note, amortization, mirrored balance sheets, below-market-loan warnings |
| `/trust-explorer` | Trust Explorer: revocable/irrevocable, grantor/non-grantor, domestic/foreign, discretionary/fixed |
| `/liability` | Liability Attack Simulator: eight creditor scenarios moving through a structure |
| `/timeline` | 100-Year Timeline: four generations, four inheritance models |
| `/governance` | Family Governance Center and charter builder |
| `/cases` | Five fictional families from Starter to Global, evolving stage by stage |
| `/claims` | Claim Verification Engine (GREEN / AMBER / RED) |
| `/jurisdictions` | Jurisdiction Engine: Wyoming, Delaware, South Dakota, Nevada, Cook Islands, Nevis, UAE, and more |
| `/sources` | Source Vault with search, filters, import/export |
| `/research` | Research Workspace: transcript → claims → review queue |
| `/present` | Presentation Mode: full-screen keynote deck, keyboard navigation, presenter notes |
| `/debt-credit-studio` | Debt, Credit & Strategic Leverage Studio (Chapter 04): nine lessons, leverage calculator, stress-test engine, credit profile simulator, capital stack visualizer, financing map, decision simulator, family debt dashboard, five cases, jurisdiction modes (US / UAE / CEMAC-OHADA / UK), its own 30–45 minute deck |

## Educational principles

The platform never teaches that wealthy people don't pay tax, never teaches "hide ownership", and never presents sham transactions, false debt, fictitious mortgages or backdated documents as legitimate. It constantly distinguishes six overlapping objectives: asset protection, tax planning, estate planning, privacy, succession and governance. No jurisdiction is labelled "best". Every simulation displays its assumptions and formulas and says when professional legal or tax review would ordinarily be required. See `docs/BUILD_BRIEF.md` for the full contract that every module follows.

## Architecture

```
src/
  styles/        tokens.css (obsidian · ivory · champagne gold · deep green), global.css (utility classes, motion)
  types/         content.ts (chapters), structure.ts (graph model), knowledge.ts (claims/sources/research), present.ts (slides)
  lib/           finance.ts (+tests): loans, ratios, leverage analysis, IRR, capital-stack waterfall · format.ts: currency/FX
  store/         useAppStore.ts: persisted zustand store
  components/    ui kit, KnowledgeCheck, AppShell
  content/       chapters/ch01..ch15 (content + Diagram + Simulator), claims, jurisdictions, sources, cases, debt lessons
  modules/       one folder per room (academy, map, lab, moneyflow, waterfall, familybank, trust, liability, timeline, governance, cases, claims, jurisdictions, sources, research, present, debt)
```

This is an educational platform. Nothing in it is legal, tax or investment advice.
