import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calculator,
  Check,
  CheckCircle2,
  GraduationCap,
  Info,
  Lightbulb,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { useAcademic } from "../hooks/useAcademic";
import { calculateCGPA } from "../lib/calculations";
import { GRADE_LIST, GRADE_POINTS } from "../data/gradeData";
import { getUniversityConfig } from "../data/universityData";

const DEFAULT_SIMULATED_GRADE = "B";

function formatGPA(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number.toFixed(2) : "0.00";
}

function getValidSubjects(subjects) {
  if (!Array.isArray(subjects)) return [];

  return subjects.filter(
    (subject) =>
      subject?.name?.trim() &&
      Object.hasOwn(GRADE_POINTS, subject.grade) &&
      Number(subject.credit) > 0,
  );
}

function getSubjectImpact(subject, targetGrade) {
  const currentPoints = GRADE_POINTS[subject.grade];
  const targetPoints = GRADE_POINTS[targetGrade];

  if (currentPoints === undefined || targetPoints === undefined) {
    return 0;
  }

  return (targetPoints - currentPoints) * Number(subject.credit);
}

function SectionHeading({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
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

          <p
            className="mt-1 text-xs leading-relaxed"
            style={{ color: "var(--gp-text-muted)" }}
          >
            {description}
          </p>
        </div>
      </div>

      {action}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, description, color }) {
  return (
    <div className="gp-card min-w-0 p-5">
      <div className="flex items-start justify-between gap-3">
        <p
          className="text-xs font-medium"
          style={{ color: "var(--gp-text-muted)" }}
        >
          {label}
        </p>

        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: "var(--gp-primary-bg)",
            color: color || "var(--gp-primary)",
          }}
        >
          <Icon size={18} />
        </div>
      </div>

      <p
        className="gp-tabular-nums mt-4 text-2xl font-bold tracking-tight"
        style={{ color: color || "var(--gp-text)" }}
      >
        {value}
      </p>

      <p className="mt-1 text-xs" style={{ color: "var(--gp-text-muted)" }}>
        {description}
      </p>
    </div>
  );
}

function SubjectCard({
  subject,
  selected,
  targetGrade,
  onToggle,
  onGradeChange,
}) {
  const currentPoints = GRADE_POINTS[subject.grade];
  const targetPoints = GRADE_POINTS[targetGrade];

  const impact = getSubjectImpact(subject, targetGrade);

  return (
    <div
      className="min-w-0 rounded-xl border p-4 transition-colors"
      style={{
        background: selected ? "var(--gp-primary-bg)" : "var(--gp-surface)",
        borderColor: selected ? "var(--gp-primary)" : "var(--gp-border)",
      }}
    >
      <div className="flex min-w-0 items-start gap-3">
        <button
          type="button"
          onClick={() => onToggle(subject.id)}
          aria-pressed={selected}
          aria-label={`${selected ? "Deselect" : "Select"} ${subject.name}`}
          className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg border transition-colors"
          style={{
            background: selected ? "var(--gp-primary)" : "var(--gp-surface)",
            borderColor: selected
              ? "var(--gp-primary)"
              : "var(--gp-border-strong)",
            color: selected ? "#ffffff" : "var(--gp-text-muted)",
          }}
        >
          {selected && <Check size={15} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3
                className="break-words text-sm font-semibold"
                style={{ color: "var(--gp-text)" }}
              >
                {subject.name}
              </h3>

              <p
                className="mt-1 text-xs"
                style={{ color: "var(--gp-text-muted)" }}
              >
                {subject.yearSemester || "Academic subject"}
              </p>
            </div>

            <span className="gp-badge gp-badge-primary shrink-0">
              {subject.credit} credits
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div
              className="min-w-0 rounded-lg border p-3"
              style={{
                background: "var(--gp-surface)",
                borderColor: "var(--gp-border)",
              }}
            >
              <p
                className="text-[11px]"
                style={{ color: "var(--gp-text-muted)" }}
              >
                Current Grade
              </p>

              <p
                className="gp-tabular-nums mt-1 text-sm font-semibold"
                style={{ color: "var(--gp-text)" }}
              >
                {subject.grade} · {formatGPA(currentPoints)}
              </p>
            </div>

            <div className="min-w-0">
              <label
                htmlFor={`improvement-${subject.id}`}
                className="mb-1.5 block text-[11px] font-medium"
                style={{ color: "var(--gp-text-muted)" }}
              >
                Simulated Grade
              </label>

              <select
                id={`improvement-${subject.id}`}
                value={targetGrade}
                onChange={(event) =>
                  onGradeChange(subject.id, event.target.value)
                }
                disabled={!selected}
                className="gp-input cursor-pointer"
              >
                {GRADE_LIST.filter(
                  (grade) => GRADE_POINTS[grade] > currentPoints,
                ).map((grade) => (
                  <option key={grade} value={grade}>
                    {grade} · {formatGPA(GRADE_POINTS[grade])}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selected && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span
                className="text-xs"
                style={{ color: "var(--gp-text-muted)" }}
              >
                Weighted grade-point gain
              </span>

              <span
                className="gp-tabular-nums inline-flex items-center gap-1 text-xs font-semibold"
                style={{ color: "var(--gp-success)" }}
              >
                <ArrowUpRight size={15} />+{formatGPA(impact)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultCard({ currentCGPA, improvedCGPA, selectedCount }) {
  const difference = improvedCGPA - currentCGPA;

  return (
    <section className="gp-card overflow-hidden p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--gp-text-muted)" }}
          >
            Simulation Result
          </p>

          <h2
            className="mt-1 text-base font-semibold"
            style={{ color: "var(--gp-text)" }}
          >
            Projected CGPA
          </h2>
        </div>

        <div
          className="flex size-11 items-center justify-center rounded-xl"
          style={{
            background: "var(--gp-success-bg)",
            color: "var(--gp-success)",
          }}
        >
          <GraduationCap size={22} />
        </div>
      </div>

      <div className="mt-7 text-center">
        <p
          className="gp-tabular-nums text-5xl font-bold tracking-tight"
          style={{ color: "var(--gp-success)" }}
        >
          {formatGPA(improvedCGPA)}
        </p>

        <p className="mt-2 text-xs" style={{ color: "var(--gp-text-muted)" }}>
          Out of 4.00
        </p>

        <div
          className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{
            background: "var(--gp-success-bg)",
            color: "var(--gp-success)",
          }}
        >
          <TrendingUp size={14} />
          {difference > 0 ? "+" : ""}
          {formatGPA(difference)} CGPA change
        </div>
      </div>

      <div
        className="mt-6 h-2.5 overflow-hidden rounded-full"
        style={{ background: "var(--gp-surface-2)" }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{
            width: `${Math.min(100, Math.max(0, (improvedCGPA / 4) * 100))}%`,
            background: "var(--gp-success)",
          }}
        />
      </div>

      <div
        className="mt-5 space-y-3 border-t pt-4"
        style={{ borderColor: "var(--gp-border)" }}
      >
        {[
          ["Current CGPA", formatGPA(currentCGPA)],
          ["Projected CGPA", formatGPA(improvedCGPA)],
          ["Selected Subjects", selectedCount],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <span style={{ color: "var(--gp-text-muted)" }}>{label}</span>

            <strong style={{ color: "var(--gp-text)" }}>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ImprovementPage() {
  const { state, computed } = useAcademic();

  const { subjects, previousCGPA, previousCredits, university } = state;

  const { cgpa, totalCredits } = computed;

  const [selected, setSelected] = useState({});
  const [simulatedGrades, setSimulatedGrades] = useState({});

  const universityConfig = getUniversityConfig(university);

  const validSubjects = useMemo(() => getValidSubjects(subjects), [subjects]);

  const improvableSubjects = useMemo(
    () => validSubjects.filter((subject) => GRADE_POINTS[subject.grade] < 4),
    [validSubjects],
  );

  const selectedSubjects = improvableSubjects.filter(
    (subject) => selected[subject.id],
  );

  const getTargetGrade = (subject) => {
    const saved = simulatedGrades[subject.id];
    const currentPoints = GRADE_POINTS[subject.grade];

    if (saved && GRADE_POINTS[saved] > currentPoints) {
      return saved;
    }

    if (currentPoints < GRADE_POINTS[DEFAULT_SIMULATED_GRADE]) {
      return DEFAULT_SIMULATED_GRADE;
    }

    return (
      GRADE_LIST.find((grade) => GRADE_POINTS[grade] > currentPoints) ||
      subject.grade
    );
  };

  const improvedCGPA = useMemo(() => {
    const improvedSubjects = subjects.map((subject) => {
      if (
        !selected[subject.id] ||
        !Object.hasOwn(GRADE_POINTS, subject.grade)
      ) {
        return subject;
      }

      const currentPoints = GRADE_POINTS[subject.grade];
      const saved = simulatedGrades[subject.id];

      const targetGrade =
        saved && GRADE_POINTS[saved] > currentPoints
          ? saved
          : currentPoints < GRADE_POINTS[DEFAULT_SIMULATED_GRADE]
            ? DEFAULT_SIMULATED_GRADE
            : GRADE_LIST.find((grade) => GRADE_POINTS[grade] > currentPoints) ||
              subject.grade;

      return {
        ...subject,
        grade: targetGrade,
      };
    });

    return calculateCGPA(improvedSubjects, previousCGPA, previousCredits).cgpa;
  }, [subjects, selected, simulatedGrades, previousCGPA, previousCredits]);

  const totalImpact = selectedSubjects.reduce(
    (sum, subject) => sum + getSubjectImpact(subject, getTargetGrade(subject)),
    0,
  );

  const handleToggle = (id) => {
    setSelected((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  };

  const handleGradeChange = (id, grade) => {
    setSimulatedGrades((previous) => ({
      ...previous,
      [id]: grade,
    }));
  };

  const handleSelectAll = () => {
    const nextSelection = Object.fromEntries(
      improvableSubjects.map((subject) => [subject.id, true]),
    );

    setSelected(nextSelection);
  };

  const handleClear = () => {
    setSelected({});
    setSimulatedGrades({});
  };

  const hasAcademicData = totalCredits > 0;

  return (
    <div className="min-w-0 space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <span className="gp-badge gp-badge-primary mb-3">
            <Sparkles size={14} />
            Academic Planning
          </span>

          <h1
            className="text-2xl font-bold tracking-tight sm:text-[28px]"
            style={{ color: "var(--gp-text)" }}
          >
            Grade Improvement Simulator
          </h1>

          <p
            className="mt-2 max-w-2xl text-sm leading-relaxed"
            style={{ color: "var(--gp-text-muted)" }}
          >
            Explore how better subject grades could influence your overall CGPA.
          </p>
        </div>

        <Link to="/calculator" className="gp-btn gp-btn-secondary self-start">
          <Calculator size={17} />
          Manage Subjects
        </Link>
      </header>

      <section
        className="flex items-start gap-3 rounded-2xl border p-4 sm:p-5"
        style={{
          background: "var(--gp-warning-bg)",
          borderColor: "var(--gp-border)",
        }}
      >
        <Info
          size={20}
          className="mt-0.5 shrink-0"
          style={{ color: "var(--gp-warning)" }}
        />

        <div className="min-w-0">
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--gp-warning)" }}
          >
            Important: Simulation Only
          </h2>

          <p
            className="mt-1 text-xs leading-relaxed"
            style={{ color: "var(--gp-text-secondary)" }}
          >
            This simulator demonstrates mathematical CGPA changes. It does not
            determine official exam eligibility or guarantee that a grade
            replacement will be accepted by {universityConfig.label}. Check your
            institution's current improvement regulations before making academic
            decisions.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={GraduationCap}
          label="Current CGPA"
          value={formatGPA(cgpa)}
          description="Your recorded academic average"
        />

        <MetricCard
          icon={BookOpen}
          label="Recorded Subjects"
          value={validSubjects.length}
          description="Subjects with valid grades"
        />

        <MetricCard
          icon={Target}
          label="Subjects Below A+"
          value={improvableSubjects.length}
          description="Available for hypothetical simulation"
        />

        <MetricCard
          icon={TrendingUp}
          label="Weighted Point Gain"
          value={`+${formatGPA(totalImpact)}`}
          description="Based on selected grade changes"
          color="var(--gp-success)"
        />
      </section>

      {!hasAcademicData && (
        <section
          className="flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between"
          style={{
            background: "var(--gp-primary-bg)",
            borderColor: "var(--gp-border)",
          }}
        >
          <div>
            <h2
              className="text-sm font-semibold"
              style={{ color: "var(--gp-text)" }}
            >
              Add your academic results first
            </h2>

            <p
              className="mt-1 text-xs"
              style={{ color: "var(--gp-text-muted)" }}
            >
              Enter your subjects and grades to simulate improvements.
            </p>
          </div>

          <Link to="/calculator" className="gp-btn gp-btn-primary shrink-0">
            Open Calculator
            <ArrowRight size={16} />
          </Link>
        </section>
      )}

      <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <section className="gp-card min-w-0 p-4 sm:p-6">
          <SectionHeading
            icon={SlidersHorizontal}
            title="Subject Improvement Scenarios"
            description="Select subjects and assign hypothetical improved grades."
            action={
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  disabled={improvableSubjects.length === 0}
                  className="gp-btn gp-btn-secondary min-h-9 px-3 text-xs"
                >
                  <CheckCircle2 size={15} />
                  Select All
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  disabled={
                    selectedSubjects.length === 0 &&
                    Object.keys(simulatedGrades).length === 0
                  }
                  className="gp-btn gp-btn-ghost min-h-9 px-3 text-xs"
                >
                  <RotateCcw size={15} />
                  Clear
                </button>
              </div>
            }
          />

          {improvableSubjects.length === 0 ? (
            <div
              className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center"
              style={{ borderColor: "var(--gp-border)" }}
            >
              <CheckCircle2 size={34} style={{ color: "var(--gp-success)" }} />

              <h3
                className="mt-4 text-sm font-semibold"
                style={{ color: "var(--gp-text)" }}
              >
                No improvement scenarios available
              </h3>

              <p
                className="mt-2 max-w-sm text-xs leading-relaxed"
                style={{ color: "var(--gp-text-muted)" }}
              >
                Add graded subjects below A+ to explore hypothetical grade
                improvements.
              </p>

              <Link to="/calculator" className="gp-btn gp-btn-secondary mt-5">
                <Calculator size={16} />
                Open Calculator
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {improvableSubjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  selected={Boolean(selected[subject.id])}
                  targetGrade={getTargetGrade(subject)}
                  onToggle={handleToggle}
                  onGradeChange={handleGradeChange}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="min-w-0 space-y-5 xl:sticky xl:top-22">
          <ResultCard
            currentCGPA={cgpa}
            improvedCGPA={improvedCGPA}
            selectedCount={selectedSubjects.length}
          />

          <section className="gp-card p-5">
            <SectionHeading
              icon={Lightbulb}
              title="Impact Analysis"
              description="Understand your simulated improvement."
            />

            <div className="mt-5 space-y-4">
              {[
                ["Current CGPA", formatGPA(cgpa)],
                ["Projected CGPA", formatGPA(improvedCGPA)],
                [
                  "CGPA Difference",
                  `${improvedCGPA - cgpa >= 0 ? "+" : ""}${formatGPA(
                    improvedCGPA - cgpa,
                  )}`,
                ],
                ["Selected Subjects", selectedSubjects.length],
                ["Weighted Point Gain", formatGPA(totalImpact)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 text-xs sm:text-sm"
                >
                  <span style={{ color: "var(--gp-text-muted)" }}>{label}</span>

                  <strong
                    className="gp-tabular-nums"
                    style={{ color: "var(--gp-text)" }}
                  >
                    {value}
                  </strong>
                </div>
              ))}
            </div>
          </section>

          <section
            className="rounded-2xl border p-5"
            style={{
              background: "var(--gp-primary-bg)",
              borderColor: "var(--gp-border)",
            }}
          >
            <div className="flex items-center gap-2">
              <Target size={19} style={{ color: "var(--gp-primary)" }} />

              <h3
                className="text-sm font-semibold"
                style={{ color: "var(--gp-text)" }}
              >
                Planning Your Target?
              </h3>
            </div>

            <p
              className="mt-3 text-xs leading-relaxed"
              style={{ color: "var(--gp-text-secondary)" }}
            >
              Calculate the GPA required to reach your target CGPA using your
              remaining credits.
            </p>

            <Link
              to="/prediction"
              className="mt-4 inline-flex items-center gap-2 text-xs font-semibold"
              style={{ color: "var(--gp-primary)" }}
            >
              Explore Predictions
              <ArrowRight size={15} />
            </Link>
          </section>
        </aside>
      </div>

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
          Simulated improvements replace the selected subject grades for
          calculation purposes only. Your original academic records remain
          unchanged. Actual improvement policies, eligible subjects, grade
          limits, and transcript treatment depend on your university's official
          regulations.
        </p>
      </div>
    </div>
  );
}
