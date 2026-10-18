import { Building2, GraduationCap, Check } from "lucide-react";
import {
  UNIVERSITY_OPTIONS,
  UNIVERSITY_TYPES,
} from "../../data/universityData";
import { useAcademic } from "../../hooks/useAcademic";

export default function UniversitySelector() {
  const { state, dispatch } = useAcademic();

  const handleSelect = (university) => {
    dispatch({
      type: "SET_UNIVERSITY",
      payload: university,
    });
  };

  return (
    <section className="gp-card p-5 sm:p-6">
      <div>
        <h2
          className="text-base font-semibold"
          style={{ color: "var(--gp-text)" }}
        >
          Choose Your University
        </h2>

        <p
          className="mt-1 text-xs sm:text-sm"
          style={{ color: "var(--gp-text-muted)" }}
        >
          Select your academic system to organize your results correctly.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {UNIVERSITY_OPTIONS.map((option) => {
          const selected = state.university === option.value;

          const Icon =
            option.value === UNIVERSITY_TYPES.NATIONAL
              ? GraduationCap
              : Building2;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              aria-pressed={selected}
              className="relative flex min-w-0 items-center gap-3 rounded-xl border p-4 text-left transition-colors"
              style={{
                background: selected
                  ? "var(--gp-primary-bg)"
                  : "var(--gp-surface)",

                borderColor: selected
                  ? "var(--gp-primary)"
                  : "var(--gp-border)",
              }}
            >
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: selected
                    ? "var(--gp-surface)"
                    : "var(--gp-surface-2)",

                  color: selected
                    ? "var(--gp-primary)"
                    : "var(--gp-text-muted)",
                }}
              >
                <Icon size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--gp-text)",
                  }}
                >
                  {option.label}
                </p>

                <p
                  className="mt-1 text-xs"
                  style={{
                    color: "var(--gp-text-muted)",
                  }}
                >
                  {option.description}
                </p>
              </div>

              {selected && (
                <Check
                  size={18}
                  className="shrink-0"
                  style={{
                    color: "var(--gp-primary)",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs" style={{ color: "var(--gp-text-muted)" }}>
        Your results are saved separately for each university system.
      </p>
    </section>
  );
}
