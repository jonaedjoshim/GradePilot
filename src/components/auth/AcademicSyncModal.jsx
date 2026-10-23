import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  CloudUpload,
  HardDrive,
  Info,
  LockKeyhole,
  ShieldCheck,
  TriangleAlert,
  X,
} from "lucide-react";

function DataOption({
  icon: Icon,
  title,
  description,
  badge,
  disabled,
  busy,
  onClick,
  primary = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      className="group flex w-full min-w-0 items-start gap-4 rounded-2xl border p-4 text-left transition-colors hover:bg-(--gp-surface-2) disabled:cursor-not-allowed disabled:opacity-50 sm:p-5"
      style={{
        background: primary ? "var(--gp-primary-bg)" : "var(--gp-surface)",
        borderColor: primary ? "var(--gp-primary)" : "var(--gp-border)",
      }}
    >
      <div
        className="flex size-11 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: primary ? "var(--gp-surface)" : "var(--gp-primary-bg)",
          color: "var(--gp-primary)",
        }}
      >
        <Icon size={21} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--gp-text)" }}
          >
            {title}
          </h3>

          {badge && (
            <span className="gp-badge gp-badge-primary text-[10px]">
              {badge}
            </span>
          )}
        </div>

        <p
          className="mt-2 text-xs leading-relaxed"
          style={{ color: "var(--gp-text-muted)" }}
        >
          {description}
        </p>
      </div>

      <ArrowRight
        size={17}
        className="mt-3 shrink-0 transition-transform group-hover:translate-x-0.5"
        style={{ color: "var(--gp-primary)" }}
      />
    </button>
  );
}

function SafetyItem({ icon: Icon, children }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon
        size={16}
        className="mt-0.5 shrink-0"
        style={{ color: "var(--gp-success)" }}
      />

      <p
        className="text-xs leading-relaxed"
        style={{ color: "var(--gp-text-secondary)" }}
      >
        {children}
      </p>
    </div>
  );
}

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

  const hasConflict = localAvailable && cloudAvailable;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-xs">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="academic-sync-title"
        aria-describedby="academic-sync-description"
        className="relative my-auto w-full max-w-lg overflow-hidden rounded-3xl border shadow-2xl"
        style={{
          background: "var(--gp-surface)",
          borderColor: "var(--gp-border)",
        }}
      >
        <div
          className="border-b px-6 pb-6 pt-7 sm:px-8 sm:pt-8"
          style={{ borderColor: "var(--gp-border)" }}
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
              aria-label="Close academic sync dialog"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-(--gp-surface-2) disabled:opacity-50"
              style={{ color: "var(--gp-text-muted)" }}
            >
              <X size={19} />
            </button>
          </div>

          <div className="mt-6">
            <span className="gp-badge gp-badge-primary">
              <ShieldCheck size={13} />
              Secure Academic Sync
            </span>

            <h2
              id="academic-sync-title"
              className="mt-4 text-xl font-bold tracking-tight sm:text-2xl"
              style={{ color: "var(--gp-text)" }}
            >
              Choose Your Academic Data
            </h2>

            <p
              id="academic-sync-description"
              className="mt-3 text-sm leading-relaxed"
              style={{ color: "var(--gp-text-muted)" }}
            >
              {hasConflict
                ? "We found academic records on this device and in your cloud account. Choose which version you want to continue with."
                : cloudAvailable
                  ? "Your cloud account contains saved academic records. You can load them into this workspace."
                  : "Your cloud workspace is ready. Choose your local academic records to get started."}
            </p>
          </div>
        </div>

        <div className="max-h-[55vh] overflow-y-auto px-6 py-6 sm:px-8">
          <div className="space-y-3">
            {cloudAvailable && (
              <DataOption
                icon={Cloud}
                title="Use Cloud Data"
                description="Load the academic records already saved to your account. Your existing guest records remain stored separately on this device."
                badge="Cloud"
                disabled={!cloudAvailable}
                busy={busy}
                onClick={onUseCloud}
                primary
              />
            )}

            <DataOption
              icon={HardDrive}
              title="Keep Local Data"
              description={
                cloudAvailable
                  ? "Continue with records from this device. You'll be asked to confirm before replacing existing cloud records."
                  : "Save this device's academic records to your cloud account for access across devices."
              }
              badge={cloudAvailable ? "Device" : "Get Started"}
              disabled={!localAvailable}
              busy={busy}
              onClick={onKeepLocal}
              primary={!cloudAvailable}
            />
          </div>

          {hasConflict && (
            <div
              className="mt-5 flex items-start gap-3 rounded-xl border p-4"
              style={{
                background: "var(--gp-warning-bg)",
                borderColor: "var(--gp-border)",
              }}
            >
              <TriangleAlert
                size={19}
                className="mt-0.5 shrink-0"
                style={{ color: "var(--gp-warning)" }}
              />

              <div className="min-w-0">
                <h3
                  className="text-xs font-semibold"
                  style={{ color: "var(--gp-text)" }}
                >
                  Important: Existing Cloud Records
                </h3>

                <p
                  className="mt-1.5 text-xs leading-relaxed"
                  style={{ color: "var(--gp-text-secondary)" }}
                >
                  Choosing local data may replace the academic records currently
                  stored in your cloud account. GradePilot will ask for
                  confirmation before making that change.
                </p>
              </div>
            </div>
          )}

          {!cloudAvailable && (
            <div
              className="mt-5 flex items-start gap-3 rounded-xl border p-4"
              style={{
                background: "var(--gp-primary-bg)",
                borderColor: "var(--gp-border)",
              }}
            >
              <CloudUpload
                size={19}
                className="mt-0.5 shrink-0"
                style={{ color: "var(--gp-primary)" }}
              />

              <div>
                <h3
                  className="text-xs font-semibold"
                  style={{ color: "var(--gp-text)" }}
                >
                  First-time Cloud Setup
                </h3>

                <p
                  className="mt-1.5 text-xs leading-relaxed"
                  style={{ color: "var(--gp-text-secondary)" }}
                >
                  Your account doesn't have a cloud academic record yet.
                  Selecting local data will create one without changing your
                  guest storage.
                </p>
              </div>
            </div>
          )}

          <div
            className="mt-6 rounded-2xl border p-4"
            style={{
              borderColor: "var(--gp-border)",
              background: "var(--gp-surface-2)",
            }}
          >
            <div className="flex items-center gap-2">
              <LockKeyhole size={16} style={{ color: "var(--gp-primary)" }} />

              <h3
                className="text-xs font-semibold"
                style={{ color: "var(--gp-text)" }}
              >
                Your Data, Your Choice
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              <SafetyItem icon={CheckCircle2}>
                Guest records remain separate from your account records.
              </SafetyItem>

              <SafetyItem icon={ShieldCheck}>
                Cloud records are associated with your authenticated account.
              </SafetyItem>

              <SafetyItem icon={CheckCircle2}>
                Existing cloud data requires confirmation before replacement.
              </SafetyItem>
            </div>
          </div>
        </div>

        <div
          className="border-t px-6 py-5 sm:px-8"
          style={{ borderColor: "var(--gp-border)" }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="gp-btn gp-btn-secondary w-full justify-center"
          >
            {busy ? "Processing..." : "Decide Later"}
          </button>

          <div className="mt-4 flex items-start justify-center gap-2">
            <Info
              size={14}
              className="mt-0.5 shrink-0"
              style={{ color: "var(--gp-text-muted)" }}
            />

            <p
              className="text-center text-[11px] leading-relaxed"
              style={{ color: "var(--gp-text-muted)" }}
            >
              You can continue using your workspace without completing cloud
              sync right now.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
