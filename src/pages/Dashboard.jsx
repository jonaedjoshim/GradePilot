import { Link } from "react-router";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  ChartNoAxesCombined,
  ChevronRight,
  GraduationCap,
  Lightbulb,
  Sparkles,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAcademic } from "../hooks/useAcademic";
import { GRADE_POINTS } from "../data/gradeData";
import {
  GradeDistributionChart,
  YearSemesterChart,
} from "../components/charts/AcademicCharts";

function formatNumber(value, digits = 2) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(digits) : (0).toFixed(digits);
}

function SectionHeader({ title, description, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2
          className="text-base font-semibold sm:text-lg"
          style={{ color: "var(--gp-text)" }}
        >
          {title}
        </h2>

        <p
          className="mt-1 text-xs leading-5 sm:text-sm"
          style={{ color: "var(--gp-text-muted)" }}
        >
          {description}
        </p>
      </div>

      {action && (
        <Link
          to={action.to}
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
          style={{ color: "var(--gp-primary)" }}
        >
          {action.label}
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

function OverviewCard({ icon: Icon, label, value, detail, accent }) {
  return (
    <div className="gp-card relative min-w-0 overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: "var(--gp-primary-bg)",
            color: accent || "var(--gp-primary)",
          }}
        >
          <Icon size={21} strokeWidth={1.8} />
        </div>

        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
          style={{
            background: "var(--gp-surface-2)",
            color: "var(--gp-text-muted)",
          }}
        >
          Overview
        </span>
      </div>

      <div className="mt-5 min-w-0">
        <p
          className="text-xs font-medium"
          style={{ color: "var(--gp-text-muted)" }}
        >
          {label}
        </p>

        <p
          className="gp-tabular-nums mt-1.5 text-[28px] font-bold tracking-tight wrap-break-word"
          style={{ color: "var(--gp-text)" }}
        >
          {value}
        </p>

        <p
          className="mt-1 text-xs leading-5"
          style={{ color: "var(--gp-text-muted)" }}
        >
          {detail}
        </p>
      </div>
    </div>
  );
}

function ChartCard({ title, description, children }) {
  return (
    <section className="gp-card min-w-0 p-5 sm:p-6">
      <div className="mb-5">
        <h3
          className="text-sm font-semibold sm:text-base"
          style={{ color: "var(--gp-text)" }}
        >
          {title}
        </h3>

        <p
          className="mt-1 text-xs leading-5"
          style={{ color: "var(--gp-text-muted)" }}
        >
          {description}
        </p>
      </div>

      <div className="min-w-0">{children}</div>
    </section>
  );
}

function QuickAction({ to, icon: Icon, title, description }) {
  return (
    <Link
      to={to}
      className="group flex min-w-0 items-center gap-3 rounded-xl border p-3.5 transition-colors hover:bg-(--gp-surface-2)"
      style={{ borderColor: "var(--gp-border)" }}
    >
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: "var(--gp-primary-bg)",
          color: "var(--gp-primary)",
        }}
      >
        <Icon size={19} />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="text-xs font-semibold sm:text-sm"
          style={{ color: "var(--gp-text)" }}
        >
          {title}
        </p>

        <p
          className="mt-0.5 text-[11px] leading-5"
          style={{ color: "var(--gp-text-muted)" }}
        >
          {description}
        </p>
      </div>

      <ChevronRight
        size={17}
        className="shrink-0 transition-transform group-hover:translate-x-1"
        style={{ color: "var(--gp-text-muted)" }}
      />
    </Link>
  );
}

function EmptyChart({ title }) {
  return (
    <div
      className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed px-5 py-8 text-center"
      style={{
        borderColor: "var(--gp-border)",
        background: "var(--gp-surface-2)",
      }}
    >
      <div
        className="flex size-12 items-center justify-center rounded-2xl"
        style={{
          background: "var(--gp-primary-bg)",
          color: "var(--gp-primary)",
        }}
      >
        <ChartNoAxesCombined size={23} />
      </div>

      <h4
        className="mt-4 text-sm font-semibold"
        style={{ color: "var(--gp-text)" }}
      >
        {title}
      </h4>

      <p
        className="mt-2 max-w-xs text-xs leading-6"
        style={{ color: "var(--gp-text-muted)" }}
      >
        Add subjects with valid grades and credits to see your academic
        performance here.
      </p>

      <Link
        to="/calculator"
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold"
        style={{ color: "var(--gp-primary)" }}
      >
        Open Calculator
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}

function AcademicStatus({ failedSubjects, subjectCount }) {
  if (subjectCount === 0) return null;

  const hasFailures = failedSubjects > 0;

  return (
    <div
      className="flex items-start gap-3 rounded-xl border p-4"
      style={{
        background: "var(--gp-surface-2)",
        borderColor: "var(--gp-border)",
      }}
    >
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: hasFailures ? "#fef2f2" : "#ecfdf5",
          color: hasFailures ? "#dc2626" : "#059669",
        }}
      >
        {hasFailures ? <AlertCircle size={19} /> : <CheckCircle2 size={19} />}
      </div>

      <div className="min-w-0">
        <h3
          className="text-sm font-semibold"
          style={{ color: "var(--gp-text)" }}
        >
          {hasFailures
            ? "Subjects that need attention"
            : "Your recorded subjects are on track"}
        </h3>

        <p
          className="mt-1 text-xs leading-6"
          style={{ color: "var(--gp-text-muted)" }}
        >
          {hasFailures
            ? `${failedSubjects} ${
                failedSubjects === 1 ? "subject has" : "subjects have"
              } a failing grade. Review your results and explore possible improvement scenarios.`
            : "No failing grades were found in your recorded subjects. Keep tracking your results to monitor your progress."}
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { state, computed } = useAcademic();
  const { subjects, previousCGPA, previousCredits } = state;
  const { cgpa, totalCredits } = computed;

  const validSubjects = Array.isArray(subjects)
    ? subjects.filter(
        (subject) =>
          subject?.name?.trim() &&
          Object.hasOwn(GRADE_POINTS, subject.grade) &&
          Number.isFinite(Number(subject.credit)) &&
          Number(subject.credit) > 0,
      )
    : [];

  const subjectCount = validSubjects.length;

  const completedCredits = validSubjects.reduce(
    (sum, subject) => sum + Number(subject.credit),
    0,
  );

  const totalGradePoints = validSubjects.reduce(
    (sum, subject) =>
      sum + GRADE_POINTS[subject.grade] * Number(subject.credit),
    0,
  );

  const semesterGpa =
    completedCredits > 0 ? totalGradePoints / completedCredits : 0;

  const failedSubjects = validSubjects.filter(
    (subject) => subject.grade === "F",
  ).length;

  const previousCreditCount = Number(previousCredits);
  const previousGpaValue = Number(previousCGPA);

  const hasPreviousRecords =
    previousCGPA !== "" &&
    previousCredits !== "" &&
    Number.isFinite(previousCreditCount) &&
    Number.isFinite(previousGpaValue) &&
    previousCreditCount > 0 &&
    previousGpaValue >= 0 &&
    previousGpaValue <= 4;

  const hasAcademicData = subjectCount > 0 || hasPreviousRecords;

  const recentSubjects = validSubjects.slice(-5).reverse();

  const stats = [
    {
      icon: GraduationCap,
      label: "Current CGPA",
      value: hasAcademicData ? formatNumber(cgpa) : "—",
      detail: "Out of 4.00",
    },
    {
      icon: BookOpen,
      label: "Total Credits",
      value: hasAcademicData ? formatNumber(totalCredits, 0) : "0",
      detail: hasPreviousRecords
        ? `${formatNumber(previousCreditCount, 0)} previous + ${formatNumber(completedCredits, 0)} listed`
        : `${formatNumber(completedCredits, 0)} credits from listed subjects`,
    },
    {
      icon: Target,
      label: "Recorded Subjects",
      value: subjectCount,
      detail: `${failedSubjects} failed ${
        failedSubjects === 1 ? "subject" : "subjects"
      }`,
    },
    {
      icon: TrendingUp,
      label: "Listed Subjects GPA",
      value: subjectCount > 0 ? formatNumber(semesterGpa) : "—",
      detail: "Credit-weighted GPA of listed subjects",
    },
  ];

  return (
    <div className="space-y-7 sm:space-y-8">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div
            className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold"
            style={{
              background: "var(--gp-primary-bg)",
              borderColor: "var(--gp-border)",
              color: "var(--gp-primary)",
            }}
          >
            <Sparkles size={13} />
            Academic Overview
          </div>

          <h2
            className="text-2xl font-bold tracking-tight sm:text-[28px]"
            style={{ color: "var(--gp-text)" }}
          >
            Your academic journey,
            <span className="gp-gradient-text"> at a glance.</span>
          </h2>

          <p
            className="mt-2 max-w-2xl text-sm leading-relaxed"
            style={{ color: "var(--gp-text-muted)" }}
          >
            Track your results, understand your performance, and plan your next
            academic milestone.
          </p>
        </div>

        <Link
          to="/calculator"
          className="gp-btn gp-btn-primary shrink-0 self-start sm:self-auto"
        >
          <Calculator size={17} />
          Open Calculator
          <ArrowRight size={16} />
        </Link>
      </section>

      {!hasAcademicData && (
        <section
          className="relative overflow-hidden rounded-2xl border p-6 sm:p-8"
          style={{
            background:
              "linear-gradient(135deg, var(--gp-primary-bg), var(--gp-surface))",
            borderColor: "var(--gp-border)",
          }}
        >
          <div className="relative z-10 max-w-xl">
            <div
              className="mb-4 flex size-12 items-center justify-center rounded-2xl"
              style={{
                background: "var(--gp-surface)",
                color: "var(--gp-primary)",
              }}
            >
              <GraduationCap size={25} />
            </div>

            <h3
              className="text-xl font-bold sm:text-2xl"
              style={{ color: "var(--gp-text)" }}
            >
              Start building your academic profile
            </h3>

            <p
              className="mt-3 text-sm leading-7"
              style={{ color: "var(--gp-text-muted)" }}
            >
              Add your subjects, credits, and grades to calculate your GPA or
              CGPA. Your academic overview will update automatically.
            </p>

            <Link to="/calculator" className="gp-btn gp-btn-primary mt-5">
              Calculate My GPA
              <ArrowRight size={16} />
            </Link>
          </div>

          <GraduationCap
            size={180}
            strokeWidth={0.7}
            className="pointer-events-none absolute -right-8 -bottom-8 hidden opacity-10 sm:block"
            style={{ color: "var(--gp-primary)" }}
          />
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <OverviewCard key={stat.label} {...stat} />
        ))}
      </section>

      {subjectCount > 0 && (
        <AcademicStatus
          failedSubjects={failedSubjects}
          subjectCount={subjectCount}
        />
      )}

      <section className="space-y-5">
        <SectionHeader
          title="Performance Analytics"
          description="Visualize your grades and academic progress."
          action={{
            to: "/insights",
            label: "Explore Insights",
          }}
        />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard
            title="Grade Distribution"
            description="How your grades are distributed across subjects."
          >
            {subjectCount > 0 ? (
              <GradeDistributionChart subjects={validSubjects} />
            ) : (
              <EmptyChart title="No grade data available" />
            )}
          </ChartCard>

          <ChartCard
            title="Year / Semester Performance"
            description="Credit-weighted GPA across academic periods."
          >
            {subjectCount > 0 ? (
              <YearSemesterChart subjects={validSubjects} />
            ) : (
              <EmptyChart title="No period data available" />
            )}
          </ChartCard>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="gp-card min-w-0 p-5 sm:p-6">
          <SectionHeader
            title="Recent Subjects"
            description="Your latest recorded subjects and grades."
            action={{
              to: "/calculator",
              label: "Manage Subjects",
            }}
          />

          {recentSubjects.length > 0 ? (
            <div className="mt-5 space-y-2">
              {recentSubjects.map((subject) => (
                <div
                  key={subject.id}
                  className="flex min-w-0 items-center gap-3 rounded-xl border p-3"
                  style={{ borderColor: "var(--gp-border)" }}
                >
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: "var(--gp-surface-2)",
                      color: "var(--gp-primary)",
                    }}
                  >
                    <BookOpen size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-xs font-semibold sm:text-sm"
                      title={subject.name}
                      style={{ color: "var(--gp-text)" }}
                    >
                      {subject.name}
                    </p>

                    <p
                      className="mt-0.5 truncate text-[11px]"
                      style={{ color: "var(--gp-text-muted)" }}
                    >
                      {subject.yearSemester || "Academic subject"} ·{" "}
                      {subject.credit} credits
                    </p>
                  </div>

                  <span className="gp-badge gp-badge-primary shrink-0">
                    {subject.grade}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="mt-5 flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed p-5 text-center"
              style={{ borderColor: "var(--gp-border)" }}
            >
              <BookOpen size={27} style={{ color: "var(--gp-text-muted)" }} />

              <p
                className="mt-3 text-sm font-semibold"
                style={{ color: "var(--gp-text)" }}
              >
                No subjects recorded yet
              </p>

              <p
                className="mt-1 text-xs leading-6"
                style={{ color: "var(--gp-text-muted)" }}
              >
                Add your first subject using the calculator.
              </p>
            </div>
          )}
        </div>

        <div className="gp-card min-w-0 p-5 sm:p-6">
          <SectionHeader
            title="Quick Actions"
            description="Everything you need to move forward."
          />

          <div className="mt-5 space-y-3">
            <QuickAction
              to="/calculator"
              icon={Calculator}
              title="GPA & CGPA Calculator"
              description="Calculate and manage your results"
            />

            <QuickAction
              to="/prediction"
              icon={TrendingUp}
              title="CGPA Prediction"
              description="Explore future academic outcomes"
            />

            <QuickAction
              to="/improvement"
              icon={Lightbulb}
              title="Grade Improvement"
              description="Find opportunities to improve"
            />

            <QuickAction
              to="/insights"
              icon={ChartNoAxesCombined}
              title="Academic Insights"
              description="Understand your performance"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
