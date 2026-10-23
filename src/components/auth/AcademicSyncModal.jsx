import { Cloud, HardDrive, ShieldCheck, X } from "lucide-react";

export default function AcademicSyncModal({
  open,
  localAvailable,
  cloudAvailable,
  busy,
  onUseCloud,
  onKeepLocal,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="academic-sync-title"
        className="w-full max-w-lg rounded-3xl border p-6 shadow-2xl sm:p-8"
        style={{
          background: "var(--gp-surface)",
          borderColor: "var(--gp-border)",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div
            className="flex size-13 items-center justify-center rounded-2xl"
            style={{
              background: "var(--gp-primary-bg)",
              color: "var(--gp-primary)",
            }}
          >
            <Cloud size={25} />
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close sync dialog"
            className="flex size-9 items-center justify-center rounded-xl hover:bg-(--gp-surface-2)"
            style={{ color: "var(--gp-text-muted)" }}
          >
            <X size={19} />
          </button>
        </div>

        <h2
          id="academic-sync-title"
          className="mt-6 text-xl font-bold tracking-tight sm:text-2xl"
          style={{ color: "var(--gp-text)" }}
        >
          Choose Your Academic Data
        </h2>

        <p
          className="mt-3 text-sm leading-relaxed"
          style={{ color: "var(--gp-text-muted)" }}
        >
          Your device and cloud may contain different academic records. Choose
          which version you want to continue with.
        </p>

        <div className="mt-7 space-y-3">
          <button
            type="button"
            onClick={onUseCloud}
            disabled={busy || !cloudAvailable}
            className="flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors hover:bg-(--gp-surface-2) disabled:cursor-not-allowed disabled:opacity-50"
            style={{ borderColor: "var(--gp-border)" }}
          >
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: "var(--gp-primary-bg)",
                color: "var(--gp-primary)",
              }}
            >
              <Cloud size={22} />
            </span>

            <span className="min-w-0">
              <strong
                className="block text-sm"
                style={{ color: "var(--gp-text)" }}
              >
                Use Cloud Data
              </strong>

              <span
                className="mt-1 block text-xs leading-relaxed"
                style={{ color: "var(--gp-text-muted)" }}
              >
                Load your saved academic records from MongoDB.
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={onKeepLocal}
            disabled={busy || !localAvailable}
            className="flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors hover:bg-(--gp-surface-2) disabled:cursor-not-allowed disabled:opacity-50"
            style={{ borderColor: "var(--gp-border)" }}
          >
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: "var(--gp-primary-bg)",
                color: "var(--gp-primary)",
              }}
            >
              <HardDrive size={22} />
            </span>

            <span className="min-w-0">
              <strong
                className="block text-sm"
                style={{ color: "var(--gp-text)" }}
              >
                Keep Local Data
              </strong>

              <span
                className="mt-1 block text-xs leading-relaxed"
                style={{ color: "var(--gp-text-muted)" }}
              >
                Continue with this device's records and sync them to your
                account.
              </span>
            </span>
          </button>
        </div>

        {cloudAvailable && localAvailable && (
          <p
            className="mt-4 rounded-xl border p-3 text-xs leading-relaxed"
            style={{
              background: "var(--gp-warning-bg)",
              borderColor: "var(--gp-border)",
              color: "var(--gp-text-secondary)",
            }}
          >
            Choosing local data will replace the current cloud version after
            confirmation. Your existing device data will remain available
            separately.
          </p>
        )}

        <div
          className="mt-6 flex items-start gap-2 border-t pt-5"
          style={{ borderColor: "var(--gp-border)" }}
        >
          <ShieldCheck
            size={17}
            className="shrink-0"
            style={{ color: "var(--gp-success)" }}
          />

          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--gp-text-muted)" }}
          >
            Your records will not be replaced without your permission.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="gp-btn gp-btn-secondary mt-6 w-full"
        >
          Decide Later
        </button>
      </section>
    </div>
  );
}
