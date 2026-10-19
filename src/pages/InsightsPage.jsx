import { Link } from "react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  Calculator,
  ChartNoAxesCombined,
  CheckCircle2,
  GraduationCap,
  Info,
  Lightbulb,
  Target,
  TrendingUp,
} from "lucide-react";
import { useAcademic } from "../hooks/useAcademic";
import { GRADE_POINTS } from "../data/gradeData";
import {
  GPATrendChart,
  GradeDistributionChart,
  CreditAnalysisChart,
  YearSemesterChart,
} from "../components/charts/AcademicCharts";

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
          className="flex size-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: "var(--gp-primary-bg)",
            color: color || "var(--gp-primary)",
          }}
        >
          <Icon size={19} />
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

function SectionHeading({ title, description, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2
          className="text-base font-semibold sm:text-lg"
          style={{ color: "var(--gp-text)" }}
        >
          {title}
        </h2>

        <p
          className="mt-1 text-xs sm:text-sm"
          style={{ color: "var(--gp-text-muted)" }}
        >
          {description}
        </p>
      </div>

      {action && (
        <Link
          to={action.to}
          className="inline-flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: "var(--gp-primary)" }}
        >
          {action.label}
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

function SubjectAnalysisCard({
  title,
  description,
  icon: Icon,
  subjects,
  tone,
  emptyMessage,
}) {
  const colors = {
    success: {
      text: "var(--gp-success)",
      background: "var(--gp-success-bg)",
    },
    warning: {
      text: "var(--gp-warning)",
      background: "var(--gp-warning-bg)",
    },
  };

  const color = colors[tone];

  return (
    <section className="gp-card min-w-0 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: color.background,
            color: color.text,
          }}
        >
          <Icon size={19} />
        </div>

        <div>
          <h3
            className="text-sm font-semibold sm:text-base"
            style={{ color: "var(--gp-text)" }}
          >
            {title}
          </h3>

          <p className="mt-1 text-xs" style={{ color: "var(--gp-text-muted)" }}>
            {description}
          </p>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div
          className="mt-5 flex min-h-32 items-center justify-center rounded-xl border border-dashed p-4 text-center text-xs"
          style={{
            borderColor: "var(--gp-border)",
            color: "var(--gp-text-muted)",
          }}
        >
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-5 space-y-2">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="flex min-w-0 items-center justify-between gap-3 rounded-xl border p-3"
              style={{ borderColor: "var(--gp-border)" }}
            >
              <div className="min-w-0">
                <p
                  className="truncate text-xs font-semibold sm:text-sm"
                  style={{ color: "var(--gp-text)" }}
                >
                  {subject.name}
                </p>

                <p
                  className="mt-1 text-[11px]"
                  style={{ color: "var(--gp-text-muted)" }}
                >
                  {subject.credit} credits ·{" "}
                  {formatGPA(GRADE_POINTS[subject.grade])} GPA
                </p>
              </div>

              <span
                className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold"
                style={{
                  background: color.background,
                  color: color.text,
                }}
              >
                {subject.grade}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ChartCard({ title, description, children }) {
  return (
    <section className="gp-card min-w-0 p-5 sm:p-6">
      <h3
        className="text-sm font-semibold sm:text-base"
        style={{ color: "var(--gp-text)" }}
      >
        {title}
      </h3>

      <p className="mt-1 text-xs" style={{ color: "var(--gp-text-muted)" }}>
        {description}
      </p>

      <div className="mt-5 min-w-0">{children}</div>
    </section>
  );
}

function SuggestionCard({ icon: Icon, title, description, tone = "primary" }) {
  const toneColors = {
    primary: {
      background: "var(--gp-primary-bg)",
      color: "var(--gp-primary)",
    },
    success: {
      background: "var(--gp-success-bg)",
      color: "var(--gp-success)",
    },
    warning: {
      background: "var(--gp-warning-bg)",
      color: "var(--gp-warning)",
    },
  };

  const selected = toneColors[tone];

  return (
    <div
      className="flex min-w-0 items-start gap-3 rounded-xl border p-4"
      style={{ borderColor: "var(--gp-border)" }}
    >
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: selected.background,
          color: selected.color,
        }}
      >
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <h3
          className="text-sm font-semibold"
          style={{ color: "var(--gp-text)" }}
        >
          {title}
        </h3>

        <p
          className="mt-1 text-xs leading-relaxed"
          style={{ color: "var(--gp-text-muted)" }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const { state, computed } = useAcademic();

  const { subjects, university } = state;
  const { cgpa, totalCredits } = computed;

  const validSubjects = getValidSubjects(subjects);

  const strongSubjects = validSubjects.filter(
    (subject) => GRADE_POINTS[subject.grade] >= 3.5,
  );

  const weakSubjects = validSubjects.filter(
    (subject) => GRADE_POINTS[subject.grade] < 2.75,
  );

  const failedSubjects = validSubjects.filter(
    (subject) => subject.grade === "F",
  );

  const averageGpa = validSubjects.length
    ? validSubjects.reduce(
        (sum, subject) => sum + GRADE_POINTS[subject.grade],
        0,
      ) / validSubjects.length
    : 0;

  const weightedGpa = validSubjects.length
    ? validSubjects.reduce(
        (sum, subject) =>
          sum + GRADE_POINTS[subject.grade] * Number(subject.credit),
        0,
      ) /
      validSubjects.reduce((sum, subject) => sum + Number(subject.credit), 0)
    : 0;

  const periodLabel = university === "national" ? "Year-wise" : "Semester-wise";

  const suggestions = [];

  if (validSubjects.length === 0) {
    suggestions.push({
      icon: BookOpen,
      title: "Start tracking your subjects",
      description:
        "Add your subjects, credits, and grades to unlock academic performance insights.",
      tone: "primary",
    });
  } else {
    if (failedSubjects.length > 0) {
      suggestions.push({
        icon: AlertTriangle,
        title: "Prioritize failed subjects",
        description: `You have ${failedSubjects.length} failed subject(s). Review your university's retake policies and prioritize these courses.`,
        tone: "warning",
      });
    }

    if (weakSubjects.length > 0) {
      suggestions.push({
        icon: Target,
        title: "Focus on lower-performing subjects",
        description: `${weakSubjects.length} subject(s) have grade points below 2.75. Improving performance in higher-credit subjects can have a greater impact on your CGPA.`,
        tone: "warning",
      });
    }

    if (strongSubjects.length > 0) {
      suggestions.push({
        icon: Award,
        title: "Maintain your strong performance",
        description: `You have ${strongSubjects.length} subject(s) with A- or higher. Maintain these strengths while improving weaker areas.`,
        tone: "success",
      });
    }

    if (weightedGpa < averageGpa) {
      suggestions.push({
        icon: TrendingUp,
        title: "Pay attention to course credits",
        description:
          "Your credit-weighted GPA is lower than your simple average grade point. Higher-credit courses may need additional attention.",
        tone: "primary",
      });
    }

    if (cgpa >= 3.5 && failedSubjects.length === 0) {
      suggestions.push({
        icon: CheckCircle2,
        title: "Strong overall academic standing",
        description:
          "Your current CGPA is at least 3.50. Continue tracking results and planning future academic goals.",
        tone: "success",
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        icon: Lightbulb,
        title: "Keep building consistent results",
        description:
          "Your academic records show a foundation to build on. Review your course performance regularly and set achievable GPA targets.",
        tone: "primary",
      });
    }
  }

  return (
    <div className="min-w-0 space-y-7 sm:space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <span className="gp-badge gp-badge-primary mb-3">
            <ChartNoAxesCombined size={14} />
            Academic Analytics
          </span>

          <h1
            className="text-2xl font-bold tracking-tight sm:text-[28px]"
            style={{ color: "var(--gp-text)" }}
          >
            Academic Insights
          </h1>

          <p
            className="mt-2 max-w-2xl text-sm leading-relaxed"
            style={{ color: "var(--gp-text-muted)" }}
          >
            Understand your academic strengths, identify areas for improvement,
            and make informed decisions.
          </p>
        </div>

        <Link to="/calculator" className="gp-btn gp-btn-secondary self-start">
          <Calculator size={17} />
          Manage Results
        </Link>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={GraduationCap}
          label="Current CGPA"
          value={formatGPA(cgpa)}
          description={`${totalCredits} completed credits`}
        />

        <MetricCard
          icon={Award}
          label="Strong Subjects"
          value={strongSubjects.length}
          description="A- or higher grades"
          color="var(--gp-success)"
        />

        <MetricCard
          icon={AlertTriangle}
          label="Needs Attention"
          value={weakSubjects.length}
          description="Below B- grade point"
          color="var(--gp-warning)"
        />

        <MetricCard
          icon={Activity}
          label="Failed Subjects"
          value={failedSubjects.length}
          description="Subjects with F grades"
          color="var(--gp-danger)"
        />
      </section>

      <section className="space-y-5">
        <SectionHeading
          title="Subject Performance"
          description="Identify your strongest subjects and areas that need attention."
        />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <SubjectAnalysisCard
            icon={Award}
            title="Strong Subjects"
            description="Subjects with A- or higher."
            subjects={strongSubjects}
            tone="success"
            emptyMessage="No subjects with A- or higher recorded yet."
          />

          <SubjectAnalysisCard
            icon={AlertTriangle}
            title="Needs Attention"
            description="Subjects with grade points below 2.75."
            subjects={weakSubjects}
            tone="warning"
            emptyMessage="No lower-performing subjects identified."
          />
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeading
          title="Academic Visualizations"
          description="Explore your grades, credits, and academic periods."
        />

        <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard
            title="Grade Distribution"
            description="Distribution of grades across recorded subjects."
          >
            <GradeDistributionChart subjects={validSubjects} />
          </ChartCard>

          <ChartCard
            title={`${periodLabel} Performance`}
            description="Credit-weighted GPA for each academic period."
          >
            <YearSemesterChart subjects={validSubjects} />
          </ChartCard>

          <ChartCard
            title="Subject GPA Comparison"
            description="Subject grade points and running weighted GPA in entry order."
          >
            <GPATrendChart subjects={validSubjects} />
          </ChartCard>

          <ChartCard
            title="Credit Distribution"
            description="Compare credits assigned to individual subjects."
          >
            <CreditAnalysisChart subjects={validSubjects} />
          </ChartCard>
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeading
          title="Academic Suggestions"
          description="Personalized recommendations based on your recorded results."
          action={{
            to: "/prediction",
            label: "Plan Your Target",
          }}
        />

        <div className="gp-card p-5 sm:p-6">
          <div
            className="mb-5 flex items-start gap-3 rounded-xl p-4"
            style={{
              background: "var(--gp-primary-bg)",
            }}
          >
            <Info
              size={18}
              className="mt-0.5 shrink-0"
              style={{ color: "var(--gp-primary)" }}
            />

            <p
              className="text-xs leading-relaxed"
              style={{ color: "var(--gp-text-secondary)" }}
            >
              These suggestions are generated locally using academic calculation
              rules. They do not require an AI API or Internet connection.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {suggestions.map((suggestion) => (
              <SuggestionCard key={suggestion.title} {...suggestion} />
            ))}
          </div>
        </div>
      </section>

      <section
        className="flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
        style={{
          background: "var(--gp-primary-bg)",
          borderColor: "var(--gp-border)",
        }}
      >
        <div>
          <h2
            className="text-base font-semibold"
            style={{ color: "var(--gp-text)" }}
          >
            Ready to improve your academic performance?
          </h2>

          <p
            className="mt-2 text-xs sm:text-sm"
            style={{ color: "var(--gp-text-secondary)" }}
          >
            Explore hypothetical grade improvements and understand their
            potential CGPA impact.
          </p>
        </div>

        <Link
          to="/improvement"
          className="gp-btn gp-btn-primary shrink-0 self-start sm:self-auto"
        >
          Explore Improvement
          <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
