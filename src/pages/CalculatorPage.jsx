import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  ChevronDown,
  ChevronRight,
  Download,
  GraduationCap,
  Image,
  Info,
  Layers,
  LockKeyhole,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { useAcademic } from "../hooks/useAcademic";
import { useSession } from "../lib/auth-client";
import { createAuthLink } from "../lib/auth-redirect";
import LoginPromptModal from "../components/auth/LoginPromptModal";
import SubjectRow from "../components/ui/SubjectRow";
import UniversitySelector from "../components/ui/UniversitySelector";
import { GRADE_POINTS, DEFAULT_SUBJECT } from "../data/gradeData";
import {
  getAcademicPeriods,
  getUniversityConfig,
  UNIVERSITY_TYPES,
} from "../data/universityData";
import { exportToPDF, exportToImage } from "../utils/exportPDF";

function getGpaColor(gpa) {
  if (gpa >= 3.5) return "var(--gp-success)";
  if (gpa >= 3) return "var(--gp-primary)";
  if (gpa >= 2.5) return "var(--gp-warning)";
  return "var(--gp-danger)";
}

function getPeriodStats(subjects) {
  const valid = subjects.filter(
    (subject) =>
      subject.name?.trim() &&
      Object.hasOwn(GRADE_POINTS, subject.grade) &&
      Number(subject.credit) > 0,
  );

  const result = valid.reduce(
    (accumulator, subject) => {
      const credits = Number(subject.credit);

      return {
        weightedPoints:
          accumulator.weightedPoints + GRADE_POINTS[subject.grade] * credits,
        credits: accumulator.credits + credits,
      };
    },
    { weightedPoints: 0, credits: 0 },
  );

  return {
    gpa: result.credits ? result.weightedPoints / result.credits : 0,
    credits: result.credits,
    count: valid.length,
  };
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

function ResultCard({ cgpa, totalCredits }) {
  const value = Number.isFinite(Number(cgpa)) ? Number(cgpa) : 0;

  const progress = Math.max(0, Math.min(100, (value / 4) * 100));

  return (
    <section className="gp-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--gp-text-muted)" }}
          >
            Academic Result
          </p>

          <h2
            className="mt-1 text-base font-semibold"
            style={{ color: "var(--gp-text)" }}
          >
            Current CGPA
          </h2>
        </div>

        <div
          className="flex size-11 items-center justify-center rounded-xl"
          style={{
            background: "var(--gp-primary-bg)",
            color: "var(--gp-primary)",
          }}
        >
          <GraduationCap size={22} />
        </div>
      </div>

      <div className="mt-7 text-center">
        <span
          className="gp-tabular-nums text-5xl font-bold tracking-tight"
          style={{ color: getGpaColor(value) }}
        >
          {value.toFixed(2)}
        </span>

        <p className="mt-2 text-xs" style={{ color: "var(--gp-text-muted)" }}>
          Out of 4.00
        </p>
      </div>

      <div
        className="mt-6 h-2.5 overflow-hidden rounded-full"
        style={{ background: "var(--gp-surface-2)" }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{
            width: `${progress}%`,
            background: getGpaColor(value),
          }}
        />
      </div>

      <div
        className="mt-5 flex justify-between border-t pt-4 text-xs"
        style={{ borderColor: "var(--gp-border)" }}
      >
        <span style={{ color: "var(--gp-text-muted)" }}>Total Credits</span>

        <strong style={{ color: "var(--gp-text)" }}>{totalCredits}</strong>
      </div>
    </section>
  );
}

function SummaryCard({ subjects, totalCredits }) {
  const valid = subjects.filter(
    (subject) =>
      subject.name?.trim() &&
      Object.hasOwn(GRADE_POINTS, subject.grade) &&
      Number(subject.credit) > 0,
  );

  const average = valid.length
    ? valid.reduce((sum, subject) => sum + GRADE_POINTS[subject.grade], 0) /
      valid.length
    : 0;

  const failed = valid.filter((subject) => subject.grade === "F").length;

  const stats = [
    ["Total Credits", totalCredits],
    ["Subjects", valid.length],
    ["Failed Subjects", failed],
    ["Average Grade Point", average.toFixed(2)],
  ];

  return (
    <section className="gp-card p-5">
      <h2 className="text-sm font-semibold" style={{ color: "var(--gp-text)" }}>
        Result Summary
      </h2>

      <div className="mt-5 space-y-4">
        {stats.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span style={{ color: "var(--gp-text-muted)" }}>{label}</span>

            <strong
              style={{
                color:
                  label === "Failed Subjects" && value > 0
                    ? "var(--gp-danger)"
                    : "var(--gp-text)",
              }}
            >
              {value}
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function GuestSuggestionCard({ cgpa }) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl border p-5 sm:p-6"
      style={{
        background: "var(--gp-primary-bg)",
        borderColor: "var(--gp-border)",
      }}
    >
      <div className="relative z-10">
        <span className="gp-badge gp-badge-primary">
          <Sparkles size={14} />
          Your Next Step
        </span>

        <h2
          className="mt-4 text-lg font-bold tracking-tight"
          style={{ color: "var(--gp-text)" }}
        >
          Want to improve your CGPA?
        </h2>

        <p
          className="mt-3 text-xs leading-relaxed"
          style={{ color: "var(--gp-text-secondary)" }}
        >
          Your current calculated CGPA is{" "}
          <strong style={{ color: "var(--gp-primary)" }}>
            {cgpa.toFixed(2)}
          </strong>
          . Create your free account to unlock predictions, improvement
          simulations, and personalized academic insights.
        </p>

        <div className="mt-5 space-y-3">
          {[
            "Explore future CGPA predictions",
            "Simulate better subject grades",
            "Discover academic strengths and weaknesses",
          ].map((benefit) => (
            <div key={benefit} className="flex items-start gap-2">
              <ShieldCheck
                size={16}
                className="shrink-0"
                style={{ color: "var(--gp-primary)" }}
              />

              <span
                className="text-xs"
                style={{ color: "var(--gp-text-secondary)" }}
              >
                {benefit}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={createAuthLink("/register", "/prediction")}
            className="gp-btn gp-btn-primary"
          >
            Unlock Predictions
            <ArrowRight size={16} />
          </Link>

          <Link
            to={createAuthLink("/login", "/prediction")}
            className="gp-btn gp-btn-secondary"
          >
            Sign In
          </Link>
        </div>

        <p
          className="mt-4 text-[11px]"
          style={{ color: "var(--gp-text-muted)" }}
        >
          Free to get started. Your current data remains on this device.
        </p>
      </div>
    </section>
  );
}

export default function CalculatorPage() {
  const { state, dispatch, computed } = useAcademic();
  const { data: session, isPending } = useSession();

  const { university, subjects, previousCGPA, previousCredits } = state;

  const { cgpa, totalCredits } = computed;

  const [viewMode, setViewMode] = useState("list");
  const [collapsedPeriods, setCollapsedPeriods] = useState({});
  const [exportPrompt, setExportPrompt] = useState(null);

  const isAuthenticated = Boolean(session?.user);

  const periods = getAcademicPeriods(university);
  const universityConfig = getUniversityConfig(university);

  const periodLabel =
    university === UNIVERSITY_TYPES.NATIONAL ? "Year-wise" : "Semester-wise";

  const validSubjects = subjects.filter(
    (subject) =>
      subject.name?.trim() &&
      Object.hasOwn(GRADE_POINTS, subject.grade) &&
      Number(subject.credit) > 0,
  );

  const hasAcademicData =
    validSubjects.length > 0 || Number(previousCredits) > 0;

  const handleUpdate = (id, data) => {
    dispatch({
      type: "UPDATE_SUBJECT",
      payload: { id, data },
    });
  };

  const handleRemove = (id) => {
    dispatch({
      type: "REMOVE_SUBJECT",
      payload: id,
    });
  };

  const handleAdd = () => {
    dispatch({
      type: "ADD_SUBJECT",
    });

    toast.success("Subject added", {
      id: "gradepilot-subject",
    });
  };

  const handleAddToPeriod = (period) => {
    dispatch({
      type: "ADD_SUBJECT_WITH_DATA",
      payload: {
        ...DEFAULT_SUBJECT(),
        yearSemester: period,
      },
    });

    toast.success("Subject added", {
      id: "gradepilot-subject",
    });
  };

  const handleReset = async () => {
    const result = await Swal.fire({
      title: "Reset academic results?",
      text: `This will clear your ${universityConfig.label} results.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Reset results",
    });

    if (result.isConfirmed) {
      dispatch({ type: "RESET" });

      toast.success("Academic results reset", {
        id: "gradepilot-reset",
      });
    }
  };

  const handleExportPDF = () => {
    if (isPending) return;

    if (!isAuthenticated) {
      setExportPrompt("pdf");
      return;
    }

    return toast.promise(
      Promise.resolve().then(() =>
        exportToPDF({
          cgpa,
          totalCredits,
          subjects,
          aiInsights: state.aiInsights,
        }),
      ),
      {
        loading: "Generating PDF...",
        success: "PDF exported successfully",
        error: "Could not export PDF",
      },
      {
        id: "gradepilot-export",
      },
    );
  };

  const handleExportImage = () => {
    if (isPending) return;

    if (!isAuthenticated) {
      setExportPrompt("png");
      return;
    }

    return toast.promise(
      Promise.resolve().then(() => exportToImage()),
      {
        loading: "Generating image...",
        success: "Image exported successfully",
        error: "Could not export image",
      },
      {
        id: "gradepilot-export",
      },
    );
  };

  const togglePeriod = (period) => {
    setCollapsedPeriods((previous) => ({
      ...previous,
      [period]: !previous[period],
    }));
  };

  return (
    <>
      <div
        id="gradepilot-export-root"
        className="min-w-0 space-y-6 sm:space-y-7"
      >
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="gp-badge gp-badge-primary mb-3">
              <Calculator size={14} />
              Academic Calculator
            </span>

            <h1
              className="text-2xl font-bold sm:text-[28px]"
              style={{ color: "var(--gp-text)" }}
            >
              GPA & CGPA Calculator
            </h1>

            <p
              className="mt-2 text-sm"
              style={{ color: "var(--gp-text-muted)" }}
            >
              Calculate your results using a credit-weighted 4.00 grading scale.
            </p>
          </div>

          <div
            className="flex w-fit gap-1 rounded-xl p-1"
            style={{ background: "var(--gp-surface-2)" }}
          >
            {[
              { mode: "list", label: "List", icon: Calculator },
              { mode: "period", label: periodLabel, icon: Layers },
            ].map(({ mode, label, icon: Icon }) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                aria-pressed={viewMode === mode}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold"
                style={{
                  background:
                    viewMode === mode ? "var(--gp-surface)" : "transparent",
                  color:
                    viewMode === mode
                      ? "var(--gp-primary)"
                      : "var(--gp-text-muted)",
                }}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </header>

        <UniversitySelector />

        <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-5">
            <section className="gp-card p-5 sm:p-6">
              <SectionHeading
                icon={BookOpen}
                title="Previous Academic Results"
                description="Include your previously completed academic credits."
              />

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="previous-cgpa" className="gp-label">
                    Previous CGPA
                  </label>

                  <input
                    id="previous-cgpa"
                    type="number"
                    min="0"
                    max="4"
                    step="0.01"
                    placeholder="e.g. 3.25"
                    value={previousCGPA}
                    onChange={(event) =>
                      dispatch({
                        type: "SET_PREVIOUS_CGPA",
                        payload: event.target.value,
                      })
                    }
                    className="gp-input"
                  />
                </div>

                <div>
                  <label htmlFor="previous-credits" className="gp-label">
                    Previously Completed Credits
                  </label>

                  <input
                    id="previous-credits"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 60"
                    value={previousCredits}
                    onChange={(event) =>
                      dispatch({
                        type: "SET_PREVIOUS_CREDITS",
                        payload: event.target.value,
                      })
                    }
                    className="gp-input"
                  />
                </div>
              </div>

              <div
                className="mt-4 flex items-start gap-2 rounded-xl p-3 text-xs"
                style={{
                  background: "var(--gp-primary-bg)",
                  color: "var(--gp-primary)",
                }}
              >
                <Info size={16} className="shrink-0" />

                <p>
                  Previous results are optional. Use them when calculating your
                  overall CGPA.
                </p>
              </div>
            </section>

            <section className="gp-card min-w-0 p-4 sm:p-6">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <SectionHeading
                  icon={Layers}
                  title={
                    viewMode === "list"
                      ? "Your Subjects"
                      : `${periodLabel} Results`
                  }
                  description={`Manage your ${universityConfig.shortLabel} academic results.`}
                />

                <span className="gp-badge gp-badge-primary">
                  {subjects.length} Subjects
                </span>
              </div>

              {viewMode === "list" ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {subjects.map((subject, index) => (
                      <SubjectRow
                        key={subject.id}
                        subject={subject}
                        index={index}
                        university={university}
                        onUpdate={handleUpdate}
                        onRemove={handleRemove}
                        canRemove={subjects.length > 1}
                      />
                    ))}
                  </div>

                  <div
                    className="flex flex-wrap gap-3 border-t pt-5"
                    style={{ borderColor: "var(--gp-border)" }}
                  >
                    <button
                      type="button"
                      onClick={handleAdd}
                      className="gp-btn gp-btn-primary"
                    >
                      <Plus size={17} />
                      Add Subject
                    </button>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="gp-btn gp-btn-secondary"
                    >
                      <RotateCcw size={16} />
                      Reset All
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {periods.map((period) => {
                    const periodSubjects = subjects.filter(
                      (subject) => subject.yearSemester === period,
                    );

                    const stats = getPeriodStats(periodSubjects);
                    const collapsed = collapsedPeriods[period];

                    return (
                      <div
                        key={period}
                        className="min-w-0 overflow-hidden rounded-xl border"
                        style={{ borderColor: "var(--gp-border)" }}
                      >
                        <button
                          type="button"
                          onClick={() => togglePeriod(period)}
                          aria-expanded={!collapsed}
                          className="flex w-full items-center justify-between gap-3 p-4 text-left"
                          style={{ background: "var(--gp-surface-2)" }}
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            {collapsed ? (
                              <ChevronRight size={17} />
                            ) : (
                              <ChevronDown size={17} />
                            )}

                            <span
                              className="truncate text-sm font-semibold"
                              style={{ color: "var(--gp-text)" }}
                            >
                              {period}
                            </span>

                            <span className="gp-badge gp-badge-primary">
                              {stats.count}
                            </span>
                          </div>

                          <div className="shrink-0 text-right">
                            <p
                              className="text-sm font-semibold"
                              style={{ color: getGpaColor(stats.gpa) }}
                            >
                              {stats.gpa.toFixed(2)}
                            </p>

                            <p
                              className="text-[10px]"
                              style={{ color: "var(--gp-text-muted)" }}
                            >
                              {stats.credits} credits
                            </p>
                          </div>
                        </button>

                        {!collapsed && (
                          <div className="space-y-3 p-3 sm:p-4">
                            {periodSubjects.length > 0 ? (
                              <div className="space-y-2">
                                {periodSubjects.map((subject, index) => (
                                  <SubjectRow
                                    key={subject.id}
                                    subject={subject}
                                    index={index}
                                    university={university}
                                    onUpdate={handleUpdate}
                                    onRemove={handleRemove}
                                    canRemove={subjects.length > 1}
                                  />
                                ))}
                              </div>
                            ) : (
                              <p
                                className="py-4 text-center text-xs"
                                style={{ color: "var(--gp-text-muted)" }}
                              >
                                No subjects added to this period.
                              </p>
                            )}

                            <button
                              type="button"
                              onClick={() => handleAddToPeriod(period)}
                              className="gp-btn gp-btn-secondary w-full sm:w-auto"
                            >
                              <Plus size={16} />
                              Add Subject
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleReset}
                    className="gp-btn gp-btn-secondary"
                  >
                    <RotateCcw size={16} />
                    Reset All
                  </button>
                </div>
              )}
            </section>
          </div>

          <aside className="min-w-0 space-y-5 xl:sticky xl:top-22">
            <ResultCard cgpa={cgpa} totalCredits={totalCredits} />

            <SummaryCard subjects={subjects} totalCredits={totalCredits} />

            {!isPending && !isAuthenticated && hasAcademicData && (
              <GuestSuggestionCard cgpa={cgpa} />
            )}

            {viewMode === "period" && (
              <section className="gp-card p-5">
                <h2
                  className="text-sm font-semibold"
                  style={{ color: "var(--gp-text)" }}
                >
                  {periodLabel} GPA
                </h2>

                <div className="mt-5 space-y-4">
                  {periods.map((period) => {
                    const periodSubjects = subjects.filter(
                      (subject) => subject.yearSemester === period,
                    );

                    const stats = getPeriodStats(periodSubjects);

                    if (!stats.count) return null;

                    return (
                      <div key={period}>
                        <div className="mb-1.5 flex justify-between text-xs">
                          <span style={{ color: "var(--gp-text-muted)" }}>
                            {period}
                          </span>

                          <strong style={{ color: getGpaColor(stats.gpa) }}>
                            {stats.gpa.toFixed(2)}
                          </strong>
                        </div>

                        <div
                          className="h-1.5 overflow-hidden rounded-full"
                          style={{ background: "var(--gp-surface-2)" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, (stats.gpa / 4) * 100)}%`,
                              background: getGpaColor(stats.gpa),
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="gp-card p-5">
              <div className="flex items-center justify-between gap-3">
                <h2
                  className="text-sm font-semibold"
                  style={{ color: "var(--gp-text)" }}
                >
                  Export Your Result
                </h2>

                {!isPending && !isAuthenticated && (
                  <LockKeyhole
                    size={17}
                    style={{ color: "var(--gp-text-muted)" }}
                  />
                )}
              </div>

              <p
                className="mt-1 text-xs"
                style={{ color: "var(--gp-text-muted)" }}
              >
                {isAuthenticated
                  ? "Download your academic summary."
                  : "Sign in to download your academic summary."}
              </p>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={handleExportPDF}
                  disabled={!hasAcademicData || isPending}
                  className="gp-btn gp-btn-primary w-full"
                >
                  {!isAuthenticated && <LockKeyhole size={16} />}
                  {isAuthenticated && <Download size={17} />}
                  Export PDF Report
                </button>

                <button
                  type="button"
                  onClick={handleExportImage}
                  disabled={!hasAcademicData || isPending}
                  className="gp-btn gp-btn-secondary w-full"
                >
                  {!isAuthenticated && <LockKeyhole size={16} />}
                  {isAuthenticated && <Image size={17} />}
                  Export as PNG
                </button>
              </div>

              {!isPending && !isAuthenticated && hasAcademicData && (
                <p
                  className="mt-4 text-center text-[11px]"
                  style={{ color: "var(--gp-text-muted)" }}
                >
                  Free account required for downloads
                </p>
              )}
            </section>

            <div
              className="rounded-2xl border p-5"
              style={{
                background: "var(--gp-primary-bg)",
                borderColor: "var(--gp-border)",
              }}
            >
              <div className="flex items-center gap-2">
                <TrendingUp size={18} style={{ color: "var(--gp-primary)" }} />

                <h3
                  className="text-sm font-semibold"
                  style={{ color: "var(--gp-text)" }}
                >
                  Plan Your Next Result
                </h3>
              </div>

              <p
                className="mt-3 text-xs leading-relaxed"
                style={{ color: "var(--gp-text-secondary)" }}
              >
                Explore how future grades could influence your academic
                performance.
              </p>

              <Link
                to="/prediction"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: "var(--gp-primary)" }}
              >
                Explore Prediction
                <ArrowRight size={15} />
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <LoginPromptModal
        open={Boolean(exportPrompt) && !isAuthenticated}
        onClose={() => setExportPrompt(null)}
        title={
          exportPrompt === "pdf"
            ? "Want to download your PDF result?"
            : "Want to save your result as an image?"
        }
        description={
          exportPrompt === "pdf"
            ? "Sign in to unlock PDF reports and keep a downloadable copy of your academic performance."
            : "Create your free account to unlock PNG export and save your academic summary as an image."
        }
        benefits={[
          "Unlock academic report downloads",
          "Access CGPA predictions and simulations",
          "Explore personalized academic insights",
        ]}
        redirect="/calculator"
      />
    </>
  );
}
