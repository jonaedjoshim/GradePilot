import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  GraduationCap,
  Info,
  Target,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import { Link } from "react-router";
import { useAcademic } from "../hooks/useAcademic";
import {
  calculateRequiredGPA,
  getPredictionDifficulty,
  predictCGPA,
} from "../lib/predictions";

function formatGPA(value) {
  return Number.isFinite(value) ? value.toFixed(2) : "0.00";
}

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: "var(--gp-primary-bg)",
          color: "var(--gp-primary)",
        }}
      >
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <h2
          className="text-sm font-semibold sm:text-base"
          style={{ color: "var(--gp-text)" }}
        >
          {title}
        </h2>

        <p className="mt-1 text-xs" style={{ color: "var(--gp-text-muted)" }}>
          {description}
        </p>
      </div>
    </div>
  );
}

function MetricCard({ label, value, description, icon: Icon }) {
  return (
    <div className="gp-card min-w-0 p-5">
      <div className="flex items-start justify-between gap-3">
        <p
          className="text-xs font-medium"
          style={{ color: "var(--gp-text-muted)" }}
        >
          {label}
        </p>

        <Icon size={19} style={{ color: "var(--gp-primary)" }} />
      </div>

      <p
        className="gp-tabular-nums mt-3 text-2xl font-bold"
        style={{ color: "var(--gp-text)" }}
      >
        {value}
      </p>

      <p className="mt-1 text-xs" style={{ color: "var(--gp-text-muted)" }}>
        {description}
      </p>
    </div>
  );
}

export default function PredictionPage() {
  const { state, dispatch, computed } = useAcademic();

  const { cgpa, totalCredits } = computed;

  const [expectedGPA, setExpectedGPA] = useState(3.5);
  const [futureCredits, setFutureCredits] = useState(18);

  const targetCGPA = state.targetCGPA;
  const remainingCredits = state.remainingCredits;

  const prediction = predictCGPA({
    currentCGPA: cgpa,
    completedCredits: totalCredits,
    expectedGPA,
    futureCredits,
  });

  const targetAnalysis = calculateRequiredGPA({
    currentCGPA: cgpa,
    completedCredits: totalCredits,
    targetCGPA,
    remainingCredits,
  });

  const difficulty = targetAnalysis
    ? getPredictionDifficulty(targetAnalysis.requiredGPA)
    : null;

  const hasAcademicData = totalCredits > 0;

  const toneColors = {
    success: "var(--gp-success)",
    warning: "var(--gp-warning)",
    danger: "var(--gp-danger)",
    primary: "var(--gp-primary)",
  };

  return (
    <div className="min-w-0 space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <span className="gp-badge gp-badge-primary mb-3">
            <TrendingUp size={14} />
            Academic Forecast
          </span>

          <h1
            className="text-2xl font-bold tracking-tight sm:text-[28px]"
            style={{ color: "var(--gp-text)" }}
          >
            CGPA Prediction Engine
          </h1>

          <p
            className="mt-2 max-w-2xl text-sm leading-relaxed"
            style={{ color: "var(--gp-text-muted)" }}
          >
            Explore future academic outcomes and calculate the GPA required to
            reach your target.
          </p>
        </div>

        <Link to="/calculator" className="gp-btn gp-btn-secondary self-start">
          <Calculator size={17} />
          Edit Academic Data
        </Link>
      </header>

      {!hasAcademicData && (
        <div
          className="flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between"
          style={{
            background: "var(--gp-primary-bg)",
            borderColor: "var(--gp-border)",
          }}
        >
          <div className="flex items-start gap-3">
            <Info
              size={20}
              className="mt-0.5 shrink-0"
              style={{ color: "var(--gp-primary)" }}
            />

            <div>
              <h2
                className="text-sm font-semibold"
                style={{ color: "var(--gp-text)" }}
              >
                Start with your academic results
              </h2>

              <p
                className="mt-1 text-xs leading-relaxed"
                style={{ color: "var(--gp-text-muted)" }}
              >
                Add your completed credits and grades for a meaningful
                prediction.
              </p>
            </div>
          </div>

          <Link to="/calculator" className="gp-btn gp-btn-primary shrink-0">
            Open Calculator
            <ArrowRight size={16} />
          </Link>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Current CGPA"
          value={formatGPA(cgpa)}
          description="Your existing academic average"
          icon={GraduationCap}
        />

        <MetricCard
          label="Completed Credits"
          value={totalCredits}
          description="Credits included in your CGPA"
          icon={BookOpen}
        />

        <MetricCard
          label="Grading Scale"
          value="4.00"
          description="Maximum available grade point"
          icon={Target}
        />
      </section>

      <section className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-2">
        <div className="gp-card min-w-0 p-5 sm:p-6">
          <SectionHeading
            icon={TrendingUp}
            title="What-If Simulator"
            description="See how upcoming results may change your CGPA."
          />

          <div className="mt-7 space-y-7">
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <label
                  htmlFor="expected-gpa"
                  className="text-xs font-medium"
                  style={{ color: "var(--gp-text-secondary)" }}
                >
                  Expected GPA
                </label>

                <span className="gp-badge gp-badge-primary gp-tabular-nums">
                  {expectedGPA.toFixed(2)}
                </span>
              </div>

              <input
                id="expected-gpa"
                type="range"
                min="0"
                max="4"
                step="0.05"
                value={expectedGPA}
                onChange={(event) => setExpectedGPA(Number(event.target.value))}
                className="w-full cursor-pointer accent-indigo-600"
              />

              <div
                className="mt-2 flex justify-between text-[11px]"
                style={{ color: "var(--gp-text-muted)" }}
              >
                <span>0.00</span>
                <span>4.00</span>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <label
                  htmlFor="future-credits"
                  className="text-xs font-medium"
                  style={{ color: "var(--gp-text-secondary)" }}
                >
                  Upcoming Credits
                </label>

                <span className="gp-badge gp-badge-primary">
                  {futureCredits}
                </span>
              </div>

              <input
                id="future-credits"
                type="range"
                min="1"
                max="40"
                step="1"
                value={futureCredits}
                onChange={(event) =>
                  setFutureCredits(Number(event.target.value))
                }
                className="w-full cursor-pointer accent-indigo-600"
              />

              <div
                className="mt-2 flex justify-between text-[11px]"
                style={{ color: "var(--gp-text-muted)" }}
              >
                <span>1 credit</span>
                <span>40 credits</span>
              </div>
            </div>

            <div
              className="rounded-2xl border p-5 text-center"
              style={{
                background: "var(--gp-primary-bg)",
                borderColor: "var(--gp-border)",
              }}
            >
              <p
                className="text-xs font-semibold"
                style={{ color: "var(--gp-text-muted)" }}
              >
                Predicted CGPA
              </p>

              <p
                className="gp-tabular-nums mt-3 text-4xl font-bold sm:text-5xl"
                style={{ color: "var(--gp-primary)" }}
              >
                {prediction ? formatGPA(prediction.cgpa) : "—"}
              </p>

              {prediction && (
                <p
                  className="mt-3 text-xs font-medium"
                  style={{
                    color:
                      prediction.change >= 0
                        ? "var(--gp-success)"
                        : "var(--gp-danger)",
                  }}
                >
                  {prediction.change > 0 ? "+" : ""}
                  {prediction.change.toFixed(2)} CGPA change
                </p>
              )}

              <p
                className="mt-2 text-[11px]"
                style={{ color: "var(--gp-text-muted)" }}
              >
                Based on {prediction?.totalCredits ?? 0} total credits
              </p>
            </div>
          </div>
        </div>

        <div className="gp-card min-w-0 p-5 sm:p-6">
          <SectionHeading
            icon={Target}
            title="Target CGPA Analysis"
            description="Calculate the average GPA required for your goal."
          />

          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="target-cgpa" className="gp-label">
                Target CGPA
              </label>

              <input
                id="target-cgpa"
                type="number"
                min="0"
                max="4"
                step="0.01"
                placeholder="e.g. 3.50"
                value={targetCGPA}
                onChange={(event) =>
                  dispatch({
                    type: "SET_TARGET_CGPA",
                    payload: event.target.value,
                  })
                }
                className="gp-input"
              />
            </div>

            <div>
              <label htmlFor="remaining-credits" className="gp-label">
                Remaining Credits
              </label>

              <input
                id="remaining-credits"
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 60"
                value={remainingCredits}
                onChange={(event) =>
                  dispatch({
                    type: "SET_REMAINING_CREDITS",
                    payload: event.target.value,
                  })
                }
                className="gp-input"
              />
            </div>
          </div>

          {targetAnalysis ? (
            <div className="mt-6 space-y-4">
              <div
                className="rounded-2xl border p-5"
                style={{
                  background: "var(--gp-surface-2)",
                  borderColor: "var(--gp-border)",
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--gp-text-muted)" }}
                  >
                    Required Average GPA
                  </span>

                  <span
                    className="gp-tabular-nums text-3xl font-bold"
                    style={{
                      color: toneColors[difficulty.tone],
                    }}
                  >
                    {targetAnalysis.alreadySecured
                      ? "0.00"
                      : formatGPA(targetAnalysis.requiredGPA)}
                  </span>
                </div>

                <div
                  className="mt-4 flex items-center gap-2 border-t pt-4"
                  style={{ borderColor: "var(--gp-border)" }}
                >
                  {targetAnalysis.achievable ? (
                    <CheckCircle2
                      size={18}
                      style={{
                        color: "var(--gp-success)",
                      }}
                    />
                  ) : (
                    <TriangleAlert
                      size={18}
                      style={{
                        color: "var(--gp-danger)",
                      }}
                    />
                  )}

                  <span
                    className="text-xs font-semibold"
                    style={{
                      color: toneColors[difficulty.tone],
                    }}
                  >
                    {difficulty.label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div
                  className="rounded-xl border p-4"
                  style={{
                    borderColor: "var(--gp-border)",
                  }}
                >
                  <p
                    className="text-[11px]"
                    style={{ color: "var(--gp-text-muted)" }}
                  >
                    Maximum Possible CGPA
                  </p>

                  <p
                    className="gp-tabular-nums mt-2 text-xl font-bold"
                    style={{ color: "var(--gp-text)" }}
                  >
                    {formatGPA(targetAnalysis.maximumCGPA)}
                  </p>
                </div>

                <div
                  className="rounded-xl border p-4"
                  style={{
                    borderColor: "var(--gp-border)",
                  }}
                >
                  <p
                    className="text-[11px]"
                    style={{ color: "var(--gp-text-muted)" }}
                  >
                    Minimum Possible CGPA
                  </p>

                  <p
                    className="gp-tabular-nums mt-2 text-xl font-bold"
                    style={{ color: "var(--gp-text)" }}
                  >
                    {formatGPA(targetAnalysis.minimumCGPA)}
                  </p>
                </div>
              </div>

              {!targetAnalysis.achievable && (
                <div
                  className="flex items-start gap-2 rounded-xl p-4 text-xs"
                  style={{
                    background: "var(--gp-danger-bg)",
                    color: "var(--gp-danger)",
                  }}
                >
                  <TriangleAlert size={17} className="shrink-0" />

                  <p>
                    Your target cannot be reached with the remaining credits on
                    a 4.00 scale. Consider adjusting your target or reviewing
                    your academic improvement options.
                  </p>
                </div>
              )}

              {targetAnalysis.achievable && (
                <div
                  className="flex items-start gap-2 rounded-xl p-4 text-xs"
                  style={{
                    background: "var(--gp-success-bg)",
                    color: "var(--gp-success)",
                  }}
                >
                  <CheckCircle2 size={17} className="shrink-0" />

                  <p>
                    Your target is mathematically achievable based on the
                    remaining credits. Actual results will depend on your
                    grades.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div
              className="mt-6 flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed p-5 text-center"
              style={{
                borderColor: "var(--gp-border)",
              }}
            >
              <Target size={28} style={{ color: "var(--gp-text-muted)" }} />

              <p
                className="mt-3 text-sm font-semibold"
                style={{ color: "var(--gp-text)" }}
              >
                Set your academic goal
              </p>

              <p
                className="mt-2 max-w-xs text-xs"
                style={{ color: "var(--gp-text-muted)" }}
              >
                Enter a target CGPA and your remaining credits to calculate the
                required GPA.
              </p>
            </div>
          )}
        </div>
      </section>

      <div
        className="flex items-start gap-3 rounded-xl border p-4"
        style={{
          background: "var(--gp-surface)",
          borderColor: "var(--gp-border)",
        }}
      >
        <Info
          size={18}
          className="mt-0.5 shrink-0"
          style={{ color: "var(--gp-primary)" }}
        />

        <p
          className="text-xs leading-relaxed"
          style={{ color: "var(--gp-text-muted)" }}
        >
          Predictions are mathematical estimates based on completed credits,
          expected grades, and the 4.00 grading scale. They are not guaranteed
          academic outcomes.
        </p>
      </div>
    </div>
  );
}
