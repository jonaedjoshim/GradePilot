import { useState } from "react";
import { Link } from "react-router";
import {
  Plus,
  RotateCcw,
  Download,
  Calculator,
  Image,
  ChevronDown,
  ChevronRight,
  Layers,
  BookOpen,
  GraduationCap,
  ArrowRight,
  Info,
  TrendingUp,
} from "lucide-react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { useAcademic } from "../hooks/useAcademic";
import SubjectRow from "../components/ui/SubjectRow";
import { GRADE_POINTS, DEFAULT_SUBJECT } from "../data/gradeData";
import { exportToPDF, exportToImage } from "../utils/exportPDF";

const YEAR_GROUPS = [
  {
    label: "1st Year",
    semesters: ["1st Year - 1st Semester", "1st Year - 2nd Semester"],
  },
  {
    label: "2nd Year",
    semesters: ["2nd Year - 1st Semester", "2nd Year - 2nd Semester"],
  },
  {
    label: "3rd Year",
    semesters: ["3rd Year - 1st Semester", "3rd Year - 2nd Semester"],
  },
  {
    label: "4th Year",
    semesters: ["4th Year - 1st Semester", "4th Year - 2nd Semester"],
  },
];

function getGpaColor(gpa) {
  if (gpa >= 3.5) return "var(--gp-success)";
  if (gpa >= 3) return "var(--gp-primary)";
  if (gpa >= 2.5) return "var(--gp-warning)";
  return "var(--gp-danger)";
}

function getSemesterStats(subjects) {
  const validSubjects = subjects.filter(
    (subject) =>
      subject.name?.trim() &&
      Object.hasOwn(GRADE_POINTS, subject.grade) &&
      Number(subject.credit) > 0,
  );

  const result = validSubjects.reduce(
    (accumulator, subject) => {
      const credits = Number(subject.credit);

      return {
        weightedPoints:
          accumulator.weightedPoints + GRADE_POINTS[subject.grade] * credits,
        credits: accumulator.credits + credits,
      };
    },
    {
      weightedPoints: 0,
      credits: 0,
    },
  );

  return {
    gpa: result.credits > 0 ? result.weightedPoints / result.credits : 0,
    credits: result.credits,
    count: validSubjects.length,
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
  const safeCgpa = Number.isFinite(Number(cgpa)) ? Number(cgpa) : 0;

  const progress = Math.max(0, Math.min(100, (safeCgpa / 4) * 100));

  const hasResults = Number(totalCredits) > 0;

  return (
    <section className="gp-card overflow-hidden p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-[0.12em]"
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
        <div className="flex items-baseline justify-center gap-2">
          <span
            className="gp-tabular-nums text-5xl font-bold tracking-tight sm:text-6xl"
            style={{ color: getGpaColor(safeCgpa) }}
          >
            {safeCgpa.toFixed(2)}
          </span>

          <span
            className="text-sm font-medium"
            style={{ color: "var(--gp-text-muted)" }}
          >
            / 4.00
          </span>
        </div>

        <p className="mt-2 text-xs" style={{ color: "var(--gp-text-muted)" }}>
          {hasResults
            ? "Updated automatically as you edit your results"
            : "Add academic results to get started"}
        </p>
      </div>

      <div
        className="mt-7 h-2.5 overflow-hidden rounded-full"
        style={{ background: "var(--gp-surface-2)" }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{
            width: `${progress}%`,
            background: getGpaColor(safeCgpa),
          }}
        />
      </div>

      <div
        className="mt-5 flex items-center justify-between border-t pt-4 text-xs"
        style={{ borderColor: "var(--gp-border)" }}
      >
        <span style={{ color: "var(--gp-text-muted)" }}>Total Credits</span>

        <span className="font-semibold" style={{ color: "var(--gp-text)" }}>
          {totalCredits}
        </span>
      </div>
    </section>
  );
}

function SummaryCard({ subjects, totalCredits }) {
  const validSubjects = subjects.filter(
    (subject) =>
      subject.name?.trim() &&
      Object.hasOwn(GRADE_POINTS, subject.grade) &&
      Number(subject.credit) > 0,
  );

  const averageGpa =
    validSubjects.length > 0
      ? validSubjects.reduce(
          (sum, subject) => sum + GRADE_POINTS[subject.grade],
          0,
        ) / validSubjects.length
      : 0;

  const failedSubjects = validSubjects.filter(
    (subject) => subject.grade === "F",
  ).length;

  const stats = [
    ["Total Credits", totalCredits],
    ["Subjects", validSubjects.length],
    ["Failed Subjects", failedSubjects],
    ["Average Grade Point", averageGpa.toFixed(2)],
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
            className="flex items-center justify-between gap-3 text-xs sm:text-sm"
          >
            <span style={{ color: "var(--gp-text-muted)" }}>{label}</span>

            <span
              className="gp-tabular-nums font-semibold"
              style={{
                color:
                  label === "Failed Subjects" && value > 0
                    ? "var(--gp-danger)"
                    : "var(--gp-text)",
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SubjectHeaders() {
  return (
    <div
      className="hidden grid-cols-[32px_minmax(0,1fr)_88px_112px_36px] items-center gap-2 px-2 text-[11px] font-semibold sm:grid"
      style={{ color: "var(--gp-text-muted)" }}
    >
      <span className="text-center">#</span>
      <span>Subject Name</span>
      <span className="text-center">Credits</span>
      <span>Grade</span>
      <span />
    </div>
  );
}

export default function CalculatorPage() {
  const { state, dispatch, computed } = useAcademic();

  const { subjects, previousCGPA, previousCredits } = state;

  const { cgpa, totalCredits } = computed;

  const [viewMode, setViewMode] = useState("list");
  const [activeYear, setActiveYear] = useState("1st Year");
  const [collapsedGroups, setCollapsedGroups] = useState({});

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
    dispatch({ type: "ADD_SUBJECT" });
    toast.success("Subject added");
  };

  const handleAddToSemester = (yearSemester) => {
    dispatch({
      type: "ADD_SUBJECT_WITH_DATA",
      payload: {
        ...DEFAULT_SUBJECT(),
        yearSemester,
      },
    });

    toast.success("Subject added");
  };

  const handleReset = async () => {
    const result = await Swal.fire({
      title: "Reset all academic data?",
      text: "Your subjects and previous results will be cleared.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Reset data",
    });

    if (result.isConfirmed) {
      dispatch({ type: "RESET" });
      toast.success("Academic data reset");
    }
  };

  const handleExportPDF = () => {
    return toast.promise(
      exportToPDF({
        cgpa,
        totalCredits,
        subjects,
        aiInsights: state.aiInsights,
      }),
      {
        loading: "Generating PDF...",
        success: "PDF exported successfully",
        error: "Could not export PDF",
      },
    );
  };

  const handleExportImage = () => {
    return toast.promise(exportToImage(), {
      loading: "Generating image...",
      success: "Image exported successfully",
      error: "Could not export image",
    });
  };

  const toggleGroup = (key) => {
    setCollapsedGroups((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const hasAcademicData =
    subjects.some((subject) => subject.name?.trim()) ||
    Number(previousCredits) > 0;

  return (
    <div id="gradepilot-export-root" className="min-w-0 space-y-6 sm:space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div
            className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold"
            style={{
              background: "var(--gp-primary-bg)",
              borderColor: "var(--gp-border)",
              color: "var(--gp-primary)",
            }}
          >
            <Calculator size={13} />
            Academic Calculator
          </div>

          <h1
            className="text-2xl font-bold tracking-tight sm:text-[28px]"
            style={{ color: "var(--gp-text)" }}
          >
            GPA & CGPA Calculator
          </h1>

          <p
            className="mt-2 max-w-xl text-sm leading-relaxed"
            style={{ color: "var(--gp-text-muted)" }}
          >
            Calculate your academic results with accurate, credit-weighted
            grading.
          </p>
        </div>

        <div
          className="flex w-fit items-center gap-1 rounded-xl p-1"
          style={{ background: "var(--gp-surface-2)" }}
        >
          {[
            {
              mode: "list",
              icon: Calculator,
              label: "List View",
            },
            {
              mode: "year",
              icon: Layers,
              label: "Year-wise",
            },
          ].map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              aria-pressed={viewMode === mode}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors"
              style={{
                background:
                  viewMode === mode ? "var(--gp-surface)" : "transparent",
                color:
                  viewMode === mode
                    ? "var(--gp-primary)"
                    : "var(--gp-text-muted)",
                boxShadow: viewMode === mode ? "var(--gp-shadow-sm)" : "none",
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <section className="gp-card p-5 sm:p-6">
            <SectionHeading
              icon={BookOpen}
              title="Previous Academic Results"
              description="Include previously completed credits in your CGPA."
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
              <Info size={16} className="mt-0.5 shrink-0" />

              <p>
                Previous results are optional. Leave them empty if you are
                calculating your first academic term.
              </p>
            </div>
          </section>

          <section className="gp-card min-w-0 p-4 sm:p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <SectionHeading
                icon={Layers}
                title={
                  viewMode === "list" ? "Your Subjects" : "Year-wise Subjects"
                }
                description="Manage subjects, credits, and grades."
              />

              <span className="gp-badge gp-badge-primary">
                {subjects.length} Subjects
              </span>
            </div>

            {viewMode === "list" ? (
              <div className="min-w-0 space-y-3">
                <SubjectHeaders />

                <div className="space-y-2">
                  {subjects.map((subject, index) => (
                    <SubjectRow
                      key={subject.id}
                      subject={subject}
                      index={index}
                      onUpdate={handleUpdate}
                      onRemove={handleRemove}
                      canRemove={subjects.length > 1}
                    />
                  ))}
                </div>

                <div
                  className="flex flex-wrap items-center gap-3 border-t pt-5"
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
              <div className="min-w-0 space-y-5">
                <div
                  className="flex gap-1 overflow-x-auto rounded-xl p-1"
                  style={{ background: "var(--gp-surface-2)" }}
                >
                  {YEAR_GROUPS.map((year) => {
                    const count = subjects.filter(
                      (subject) =>
                        year.semesters.includes(
                          subject.yearSemester || "1st Year - 1st Semester",
                        ) && subject.name?.trim(),
                    ).length;

                    return (
                      <button
                        key={year.label}
                        type="button"
                        onClick={() => setActiveYear(year.label)}
                        aria-pressed={activeYear === year.label}
                        className="flex min-w-max flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold"
                        style={{
                          background:
                            activeYear === year.label
                              ? "var(--gp-surface)"
                              : "transparent",
                          color:
                            activeYear === year.label
                              ? "var(--gp-primary)"
                              : "var(--gp-text-muted)",
                        }}
                      >
                        {year.label}
                        {count > 0 && (
                          <span className="opacity-70">({count})</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {YEAR_GROUPS.filter((year) => year.label === activeYear).map(
                  (year) => (
                    <div key={year.label} className="space-y-4">
                      {year.semesters.map((semester) => {
                        const semesterSubjects = subjects.filter(
                          (subject) =>
                            (subject.yearSemester ||
                              "1st Year - 1st Semester") === semester,
                        );

                        const stats = getSemesterStats(semesterSubjects);

                        const collapsed = collapsedGroups[semester];

                        const semesterLabel =
                          semester.split(" - ")[1] || semester;

                        return (
                          <div
                            key={semester}
                            className="min-w-0 overflow-hidden rounded-xl border"
                            style={{
                              borderColor: "var(--gp-border)",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => toggleGroup(semester)}
                              aria-expanded={!collapsed}
                              className="flex w-full items-center justify-between gap-3 p-4 text-left"
                              style={{
                                background: "var(--gp-surface-2)",
                              }}
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                {collapsed ? (
                                  <ChevronRight
                                    size={17}
                                    className="shrink-0"
                                  />
                                ) : (
                                  <ChevronDown size={17} className="shrink-0" />
                                )}

                                <span
                                  className="truncate text-xs font-semibold sm:text-sm"
                                  style={{
                                    color: "var(--gp-text)",
                                  }}
                                >
                                  {semesterLabel}
                                </span>

                                <span className="gp-badge gp-badge-primary shrink-0">
                                  {stats.count}
                                </span>
                              </div>

                              <div className="shrink-0 text-right">
                                <p
                                  className="gp-tabular-nums text-xs font-bold sm:text-sm"
                                  style={{
                                    color: getGpaColor(stats.gpa),
                                  }}
                                >
                                  {stats.gpa.toFixed(2)}
                                </p>

                                <p
                                  className="text-[10px]"
                                  style={{
                                    color: "var(--gp-text-muted)",
                                  }}
                                >
                                  {stats.credits} credits
                                </p>
                              </div>
                            </button>

                            {!collapsed && (
                              <div className="min-w-0 space-y-3 p-3 sm:p-4">
                                {semesterSubjects.length > 0 ? (
                                  <>
                                    <SubjectHeaders />

                                    <div className="space-y-2">
                                      {semesterSubjects.map(
                                        (subject, index) => (
                                          <SubjectRow
                                            key={subject.id}
                                            subject={subject}
                                            index={index}
                                            onUpdate={handleUpdate}
                                            onRemove={handleRemove}
                                            canRemove={subjects.length > 1}
                                          />
                                        ),
                                      )}
                                    </div>
                                  </>
                                ) : (
                                  <p
                                    className="py-4 text-center text-xs"
                                    style={{
                                      color: "var(--gp-text-muted)",
                                    }}
                                  >
                                    No subjects added to this semester.
                                  </p>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleAddToSemester(semester)}
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
                    </div>
                  ),
                )}

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

        <aside className="min-w-0 space-y-5 xl:sticky xl:top-[88px]">
          <ResultCard cgpa={cgpa} totalCredits={totalCredits} />

          <SummaryCard subjects={subjects} totalCredits={totalCredits} />

          {viewMode === "year" && (
            <section className="gp-card p-5">
              <h2
                className="text-sm font-semibold"
                style={{ color: "var(--gp-text)" }}
              >
                Year-wise GPA
              </h2>

              <div className="mt-5 space-y-4">
                {YEAR_GROUPS.map((year) => {
                  const yearSubjects = subjects.filter((subject) =>
                    year.semesters.includes(
                      subject.yearSemester || "1st Year - 1st Semester",
                    ),
                  );

                  const stats = getSemesterStats(yearSubjects);

                  if (!stats.count) return null;

                  return (
                    <div key={year.label}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span
                          style={{
                            color: "var(--gp-text-muted)",
                          }}
                        >
                          {year.label}
                        </span>

                        <span
                          className="font-semibold"
                          style={{
                            color: getGpaColor(stats.gpa),
                          }}
                        >
                          {stats.gpa.toFixed(2)}
                        </span>
                      </div>

                      <div
                        className="h-1.5 overflow-hidden rounded-full"
                        style={{
                          background: "var(--gp-surface-2)",
                        }}
                      >
                        <div
                          className="h-full rounded-full transition-[width] duration-300"
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
            <h2
              className="text-sm font-semibold"
              style={{ color: "var(--gp-text)" }}
            >
              Export Your Result
            </h2>

            <p
              className="mt-1 text-xs"
              style={{
                color: "var(--gp-text-muted)",
              }}
            >
              Download your academic summary.
            </p>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={handleExportPDF}
                disabled={!hasAcademicData}
                className="gp-btn gp-btn-primary w-full"
              >
                <Download size={17} />
                Export PDF Report
              </button>

              <button
                type="button"
                onClick={handleExportImage}
                disabled={!hasAcademicData}
                className="gp-btn gp-btn-secondary w-full"
              >
                <Image size={17} />
                Export as PNG
              </button>
            </div>
          </section>

          <div
            className="rounded-2xl border p-5"
            style={{
              background: "var(--gp-primary-bg)",
              borderColor: "var(--gp-border)",
            }}
          >
            <div className="flex items-center gap-2">
              <TrendingUp
                size={18}
                style={{
                  color: "var(--gp-primary)",
                }}
              />

              <h3
                className="text-sm font-semibold"
                style={{ color: "var(--gp-text)" }}
              >
                Plan Your Next Result
              </h3>
            </div>

            <p
              className="mt-3 text-xs leading-relaxed"
              style={{
                color: "var(--gp-text-secondary)",
              }}
            >
              Explore how your future grades could influence your academic
              performance.
            </p>

            <Link
              to="/prediction"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold"
              style={{
                color: "var(--gp-primary)",
              }}
            >
              Explore Prediction
              <ArrowRight size={15} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
