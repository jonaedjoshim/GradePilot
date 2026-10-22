import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router";
import {
  ArrowRight,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useSession } from "../../lib/auth-client";

const PROTECTED_FEATURES = {
  "/prediction": {
    title: "Unlock CGPA Predictions",
    description:
      "Want to know where your CGPA could go? Sign in to explore future outcomes, set academic targets, and calculate the GPA you need.",
    benefits: [
      "Predict your future CGPA",
      "Calculate your required GPA",
      "Plan realistic academic targets",
    ],
  },
  "/improvement": {
    title: "Improve Your Academic Strategy",
    description:
      "Want to improve your CGPA? Sign in to simulate better grades and discover which subjects could make the biggest difference.",
    benefits: [
      "Simulate grade improvements",
      "Compare potential CGPA outcomes",
      "Identify high-impact subjects",
    ],
  },
  "/insights": {
    title: "Unlock Academic Insights",
    description:
      "Understand your academic performance with personalized, rule-based insights and practical study suggestions.",
    benefits: [
      "Discover your academic strengths",
      "Identify subjects needing attention",
      "Get practical academic suggestions",
    ],
  },
};

function getFeature(pathname) {
  return (
    PROTECTED_FEATURES[pathname] || {
      title: "Unlock More Academic Tools",
      description:
        "Create your free account to access advanced academic planning tools.",
      benefits: [
        "Explore advanced academic tools",
        "Plan your academic progress",
        "Make informed academic decisions",
      ],
    }
  );
}

function AuthLoading() {
  return (
    <div
      role="status"
      className="flex min-h-[60vh] items-center justify-center"
    >
      <div
        className="size-9 animate-spin rounded-full border-4 border-t-transparent"
        style={{
          borderColor: "var(--gp-border)",
          borderTopColor: "var(--gp-primary)",
        }}
      />
      <span className="sr-only">Checking your account...</span>
    </div>
  );
}

export default function ProtectedRoute({ children }) {
  const { data: session, isPending } = useSession();
  const location = useLocation();

  const [dismissedPath, setDismissedPath] = useState(null);

  if (isPending) {
    return <AuthLoading />;
  }

  if (session?.user) {
    return children;
  }

  if (dismissedPath === location.pathname) {
    return <Navigate to="/" replace />;
  }

  const feature = getFeature(location.pathname);
  const returnTo = `${location.pathname}${location.search}`;

  const loginLink = `/login?redirect=${encodeURIComponent(returnTo)}`;
  const registerLink = `/register?redirect=${encodeURIComponent(returnTo)}`;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-xs">
      <button
        type="button"
        onClick={() => setDismissedPath(location.pathname)}
        aria-label="Close login dialog"
        className="absolute inset-0 h-full w-full cursor-default"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="protected-feature-title"
        aria-describedby="protected-feature-description"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl"
        style={{
          background: "var(--gp-surface)",
          borderColor: "var(--gp-border)",
        }}
      >
        <button
          type="button"
          onClick={() => setDismissedPath(location.pathname)}
          aria-label="Close dialog"
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-xl transition-colors hover:bg-(--gp-surface-2)"
          style={{ color: "var(--gp-text-muted)" }}
        >
          <X size={19} />
        </button>

        <div className="px-6 pb-7 pt-9 sm:px-8">
          <div
            className="flex size-14 items-center justify-center rounded-2xl"
            style={{
              background: "var(--gp-primary-bg)",
              color: "var(--gp-primary)",
            }}
          >
            <LockKeyhole size={26} />
          </div>

          <div className="mt-6">
            <span className="gp-badge gp-badge-primary">
              <Sparkles size={13} />
              Free Account Feature
            </span>

            <h2
              id="protected-feature-title"
              className="mt-4 text-2xl font-bold tracking-tight"
              style={{ color: "var(--gp-text)" }}
            >
              {feature.title}
            </h2>

            <p
              id="protected-feature-description"
              className="mt-3 text-sm leading-relaxed"
              style={{ color: "var(--gp-text-muted)" }}
            >
              {feature.description}
            </p>
          </div>

          <div
            className="mt-6 rounded-2xl border p-4"
            style={{
              background: "var(--gp-surface-2)",
              borderColor: "var(--gp-border)",
            }}
          >
            <p
              className="text-xs font-semibold"
              style={{ color: "var(--gp-text)" }}
            >
              What you'll unlock
            </p>

            <div className="mt-4 space-y-3">
              {feature.benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <ShieldCheck
                    size={17}
                    className="mt-0.5 shrink-0"
                    style={{ color: "var(--gp-success)" }}
                  />

                  <span
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--gp-text-secondary)" }}
                  >
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-7 space-y-3">
            <Link
              to={loginLink}
              state={{ from: returnTo }}
              className="gp-btn gp-btn-primary w-full justify-center"
            >
              Sign In to Continue
              <ArrowRight size={17} />
            </Link>

            <Link
              to={registerLink}
              state={{ from: returnTo }}
              className="gp-btn gp-btn-secondary w-full justify-center"
            >
              Create Free Account
            </Link>

            <button
              type="button"
              onClick={() => setDismissedPath(location.pathname)}
              className="flex w-full items-center justify-center py-2 text-xs font-medium transition-colors hover:opacity-75"
              style={{ color: "var(--gp-text-muted)" }}
            >
              Continue as Guest
            </button>
          </div>

          <p
            className="mt-4 text-center text-[11px] leading-relaxed"
            style={{ color: "var(--gp-text-muted)" }}
          >
            Your existing calculator data stays on this device.
          </p>
        </div>
      </section>
    </div>
  );
}
