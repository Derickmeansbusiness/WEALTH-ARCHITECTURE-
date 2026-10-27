import { Suspense, lazy, type ComponentType } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { LoadingState, EmptyState } from '@/components/ui';
import StudioShell, { STUDIO_BASE } from './shell/StudioShell';
import ErrorBoundary from './shell/ErrorBoundary';
import StudioHome from './intro/StudioHome';
import LessonsIndex from './lessons/LessonsIndex';
import LessonPage from './lessons/LessonPage';
import CasesIndex from './cases/CasesIndex';
import CasePage from './cases/CasePage';
import JurisdictionsPage from './jurisdictions/JurisdictionsPage';
import SourcesPage from './sources/SourcesPage';
import DebtPresent from './present/DebtPresent';
import './debt.css';

// Tools are built by other agents; mount them lazily so a failure in one never takes down the studio.
const LeverageCalculator = lazy(() => import('./tools/LeverageCalculator'));
const StressTest = lazy(() => import('./tools/StressTest'));
const CreditProfile = lazy(() => import('./tools/CreditProfile'));
const CapitalStack = lazy(() => import('./tools/CapitalStack'));
const FinancingMap = lazy(() => import('./tools/FinancingMap'));
const DecisionSimulator = lazy(() => import('./tools/DecisionSimulator'));
const DebtDashboard = lazy(() => import('./tools/DebtDashboard'));

function ToolFrame({ Tool, eyebrow, title, lede }: { Tool: ComponentType; eyebrow: string; title: string; lede: string }) {
  return (
    <div className="container ds-page">
      <div className="ds-page-head stack" style={{ gap: 8 }}>
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
        <p className="lede" style={{ maxWidth: 760 }}>{lede}</p>
      </div>
      <ErrorBoundary title={`${title} could not be loaded`}>
        <Suspense fallback={<LoadingState lines={5} />}>
          <Tool />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default function DebtStudio() {
  return (
    <Routes>
      <Route path="present/*" element={<DebtPresent />} />
      <Route element={<StudioShell />}>
        <Route index element={<StudioHome />} />
        <Route path="lessons" element={<LessonsIndex />} />
        <Route path="lessons/:n" element={<LessonPage />} />
        <Route path="leverage" element={<ToolFrame Tool={LeverageCalculator} eyebrow="Tool 01" title="Leverage Calculator" lede="All-cash against financed, year by year. Every assumption visible, the downside case always shown." />} />
        <Route path="stress-test" element={<ToolFrame Tool={StressTest} eyebrow="Tool 02" title="Stress Test" lede="Shock rates, values and income on any loan or portfolio and see when coverage breaks." />} />
        <Route path="credit-profile" element={<ToolFrame Tool={CreditProfile} eyebrow="Tool 03" title="Credit Profile" lede="Build the presentation a credit committee expects: ratios, documentation, guarantees." />} />
        <Route path="capital-stack" element={<ToolFrame Tool={CapitalStack} eyebrow="Tool 04" title="Capital Stack" lede="Senior, mezzanine, preferred, common: who is paid first, and what each layer costs." />} />
        <Route path="financing-map" element={<ToolFrame Tool={FinancingMap} eyebrow="Tool 05" title="Financing Map" lede="Bank debt and related-party loans drawn onto a family structure, with guarantees and collateral visible." />} />
        <Route path="decision" element={<ToolFrame Tool={DecisionSimulator} eyebrow="Tool 06" title="Decision Simulator" lede="Borrow now, grow slower, or wait: the same assumptions, three paths, with the bad scenario included." />} />
        <Route path="dashboard" element={<ToolFrame Tool={DebtDashboard} eyebrow="Tool 07" title="Debt Dashboard" lede="A family’s whole book: maturity ladder, covenant headroom, guarantee schedule, cost of debt." />} />
        <Route path="cases" element={<CasesIndex />} />
        <Route path="cases/:id" element={<CasePage />} />
        <Route path="jurisdictions" element={<JurisdictionsPage />} />
        <Route path="sources" element={<SourcesPage />} />
        <Route path="*" element={<div className="container ds-page"><EmptyState title="This room of the studio does not exist" action={<Link className="btn" to={STUDIO_BASE}>Back to the studio</Link>} /></div>} />
      </Route>
    </Routes>
  );
}
