import { useEffect, useRef } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  ShieldCheck,
  X,
} from "lucide-react";
import { createAuthLink } from "../../lib/auth-redirect";

export default function LoginPromptModal({
  open,
  onClose,
  title = "Unlock More Features",
  description = "Sign in to access advanced academic tools.",
  benefits = [],
  redirect = "/",
}) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close dialog"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-prompt-title"
        aria-describedby="login-prompt-description"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border p-6 shadow-2xl sm:p-8"
        style={{
          background: "var(--gp-surface)",
          borderColor: "var(--gp-border)",
        }}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-xl transition-colors hover:bg-(--gp-surface-2)"
          style={{ color: "var(--gp-text-muted)" }}
        >
          <X size={19} />
        </button>

        <div
          className="flex size-14 items-center justify-center rounded-2xl"
          style={{
            background: "var(--gp-primary-bg)",
            color: "var(--gp-primary)",
          }}
        >
          <LockKeyhole size={26} />
        </div>

        <span className="gp-badge gp-badge-primary mt-6">
          <ShieldCheck size={14} />
          Free Account Feature
        </span>

        <h2
          id="login-prompt-title"
          className="mt-4 text-2xl font-bold tracking-tight"
          style={{ color: "var(--gp-text)" }}
        >
          {title}
        </h2>

        <p
          id="login-prompt-description"
          className="mt-3 text-sm leading-relaxed"
          style={{ color: "var(--gp-text-muted)" }}
        >
          {description}
        </p>

        {benefits.length > 0 && (
          <div
            className="mt-6 space-y-3 rounded-2xl border p-4"
            style={{
              background: "var(--gp-surface-2)",
              borderColor: "var(--gp-border)",
            }}
          >
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3">
                <CheckCircle2
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
        )}

        <div className="mt-7 space-y-3">
          <Link
            to={createAuthLink("/login", redirect)}
            className="gp-btn gp-btn-primary w-full justify-center"
          >
            Sign In to Continue
            <ArrowRight size={17} />
          </Link>

          <Link
            to={createAuthLink("/register", redirect)}
            className="gp-btn gp-btn-secondary w-full justify-center"
          >
            Create Free Account
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-medium transition-opacity hover:opacity-75"
            style={{ color: "var(--gp-text-muted)" }}
          >
            Maybe Later
          </button>
        </div>

        <p
          className="mt-4 text-center text-[11px] leading-relaxed"
          style={{ color: "var(--gp-text-muted)" }}
        >
          Your existing calculator data stays on this device.
        </p>
      </section>
    </div>
  );
}
