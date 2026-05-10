import { BrowserRouter, Routes, Route } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AcademicProvider } from './context/AcademicContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import CalculatorPage from './pages/CalculatorPage';
import PredictionPage from './pages/PredictionPage';
import ImprovementPage from './pages/ImprovementPage';
import InsightsPage from './pages/InsightsPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <HelmetProvider>
      <AcademicProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--gp-surface)',
                color: 'var(--gp-text)',
                border: '1px solid var(--gp-border)',
                borderRadius: '12px',
                fontSize: '13px',
                fontFamily: 'var(--font-body)',
              },
            }}
          />
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="/calculator" element={<CalculatorPage />} />
              <Route path="/prediction" element={<PredictionPage />} />
              <Route path="/improvement" element={<ImprovementPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AcademicProvider>
    </HelmetProvider>
  );
}
