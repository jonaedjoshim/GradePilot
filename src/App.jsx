import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import { AcademicProvider } from "./context/AcademicContext";
import Layout from "./components/layout/Layout";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const CalculatorPage = lazy(() => import("./pages/CalculatorPage"));
const PredictionPage = lazy(() => import("./pages/PredictionPage"));
const ImprovementPage = lazy(() => import("./pages/ImprovementPage"));
const InsightsPage = lazy(() => import("./pages/InsightsPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));

function PageLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4"
    >
      <div
        className="size-10 animate-spin rounded-full border-4 border-t-transparent"
        style={{
          borderColor: "var(--gp-border)",
          borderTopColor: "var(--gp-primary)",
        }}
      />

      <div className="text-center">
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--gp-text)" }}
        >
          Loading workspace
        </p>

        <p className="mt-1 text-xs" style={{ color: "var(--gp-text-muted)" }}>
          Preparing your academic tools...
        </p>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
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
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <AcademicProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--gp-surface)",
                color: "var(--gp-text)",
                border: "1px solid var(--gp-border)",
                borderRadius: "12px",
                fontSize: "13px",
                fontFamily: "var(--font-body)",
              },
            }}
          />

          <Suspense fallback={<PageLoader />}>
            <AppRoutes />
          </Suspense>
        </BrowserRouter>
      </AcademicProvider>
    </HelmetProvider>
  );
}
