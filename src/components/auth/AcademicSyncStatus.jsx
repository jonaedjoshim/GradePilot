import { Cloud, CloudOff, LoaderCircle, CheckCircle2 } from "lucide-react";

const STATUS_CONFIG = {
  checking: {
    label: "Checking cloud...",
    icon: LoaderCircle,
    color: "var(--gp-text-muted)",
  },
  saving: {
    label: "Saving...",
    icon: LoaderCircle,
    color: "var(--gp-primary)",
  },
  saved: {
    label: "Saved to cloud",
    icon: CheckCircle2,
    color: "var(--gp-success)",
  },
  offline: {
    label: "Cloud unavailable",
    icon: CloudOff,
    color: "var(--gp-warning)",
  },
  pending: {
    label: "Sync not configured",
    icon: Cloud,
    color: "var(--gp-text-muted)",
  },
};

export default function AcademicSyncStatus({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <div
      role="status"
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium"
      style={{
        background: "var(--gp-surface)",
        borderColor: "var(--gp-border)",
        color: config.color,
      }}
    >
      <Icon
        size={14}
        className={
          status === "checking" || status === "saving" ? "animate-spin" : ""
        }
      />

      {config.label}
    </div>
  );
}
