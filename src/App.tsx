import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import HomePage from '@/modules/home';
import { LoadingState } from '@/components/ui';

const Academy = lazy(() => import('@/modules/academy'));
const MasterMap = lazy(() => import('@/modules/map'));
const StructureLab = lazy(() => import('@/modules/lab'));
const MoneyFlow = lazy(() => import('@/modules/moneyflow'));
const Waterfall = lazy(() => import('@/modules/waterfall'));
const FamilyBank = lazy(() => import('@/modules/familybank'));
const TrustExplorer = lazy(() => import('@/modules/trust'));
const Liability = lazy(() => import('@/modules/liability'));
const Timeline = lazy(() => import('@/modules/timeline'));
const Governance = lazy(() => import('@/modules/governance'));
const Cases = lazy(() => import('@/modules/cases'));
const Claims = lazy(() => import('@/modules/claims'));
const Jurisdictions = lazy(() => import('@/modules/jurisdictions'));
const Sources = lazy(() => import('@/modules/sources'));
const Research = lazy(() => import('@/modules/research'));
const Present = lazy(() => import('@/modules/present'));
const DebtStudio = lazy(() => import('@/modules/debt'));

function Fallback() {
  return <div className="page container"><LoadingState lines={4} /></div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/academy/*" element={<Academy />} />
            <Route path="/map" element={<MasterMap />} />
            <Route path="/lab" element={<StructureLab />} />
            <Route path="/money-flow" element={<MoneyFlow />} />
            <Route path="/waterfall" element={<Waterfall />} />
            <Route path="/family-bank" element={<FamilyBank />} />
            <Route path="/trust-explorer" element={<TrustExplorer />} />
            <Route path="/liability" element={<Liability />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/governance" element={<Governance />} />
            <Route path="/cases/*" element={<Cases />} />
            <Route path="/claims/*" element={<Claims />} />
            <Route path="/jurisdictions/*" element={<Jurisdictions />} />
            <Route path="/sources" element={<Sources />} />
            <Route path="/research" element={<Research />} />
            <Route path="/present/*" element={<Present />} />
            <Route path="/debt-credit-studio/*" element={<DebtStudio />} />
            <Route path="*" element={<div className="page container"><h2>Not found</h2><p className="muted">This room of the architecture does not exist.</p></div>} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
